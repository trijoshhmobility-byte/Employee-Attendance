import { useState, useCallback, useRef } from 'react';
import { Coordinates } from '../types';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  data: GeolocationCoordinates | null;
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  retryAttempts?: number;
  fallbackToIP?: boolean;
}

interface LocationHistory {
  coordinates: Coordinates;
  timestamp: number;
  accuracy: number;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    data: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const locationHistoryRef = useRef<LocationHistory[]>([]);
  const lastKnownLocationRef = useRef<Coordinates | null>(null);

  // Enhanced location retrieval with fallback mechanisms
  const getLocation = useCallback(async (options: LocationOptions = {}) => {
    const {
      enableHighAccuracy = true,
      timeout = 15000,
      maximumAge = 300000, // 5 minutes
      retryAttempts = 3,
      fallbackToIP = true
    } = options;

    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser.');
      setState({ loading: false, error, data: null });
      return;
    }

    setState({ loading: true, error: null, data: null });

    let currentAttempt = 0;
    const maxAttempts = retryAttempts;

    const attemptGeolocation = async (): Promise<void> => {
      return new Promise((resolve) => {
        const positionOptions: PositionOptions = {
          enableHighAccuracy: currentAttempt === 0 ? enableHighAccuracy : false,
          timeout: timeout - (currentAttempt * 2000), // Reduce timeout on retries
          maximumAge: currentAttempt === 0 ? maximumAge : 0
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = position.coords;
            
            // Validate accuracy
            if (coords.accuracy > 1000 && currentAttempt < maxAttempts - 1) {
              console.warn(`Location accuracy too low (${coords.accuracy}m), retrying...`);
              currentAttempt++;
              setTimeout(() => attemptGeolocation(), 1000);
              return;
            }

            // Store in location history
            const locationEntry: LocationHistory = {
              coordinates: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                timestamp: Date.now()
              },
              timestamp: Date.now(),
              accuracy: coords.accuracy
            };

            locationHistoryRef.current.unshift(locationEntry);
            // Keep only last 10 locations
            if (locationHistoryRef.current.length > 10) {
              locationHistoryRef.current = locationHistoryRef.current.slice(0, 10);
            }

            lastKnownLocationRef.current = locationEntry.coordinates;
            saveLocationToStorage(locationEntry.coordinates);

            setState({
              loading: false,
              error: null,
              data: coords,
            });
            resolve();
          },
          async (error) => {
            console.error(`Geolocation attempt ${currentAttempt + 1} failed:`, error);
            
            if (currentAttempt < maxAttempts - 1) {
              currentAttempt++;
              setTimeout(() => attemptGeolocation(), 2000);
              return;
            }

            // All attempts failed, try fallbacks
            const fallbackLocation = await tryFallbackMethods(fallbackToIP);
            if (fallbackLocation) {
              setState({
                loading: false,
                error: null,
                data: fallbackLocation,
              });
            } else {
              setState({
                loading: false,
                error: error,
                data: null,
              });
            }
            resolve();
          }
        );
      });
    };

    await attemptGeolocation();
  }, []);

  // Continuous location watching
  const watchLocation = useCallback((options: LocationOptions = {}) => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser.');
      setState({ loading: false, error, data: null });
      return;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const positionOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 60000 // 1 minute for watching
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = position.coords;
        
        // Store in location history
        const locationEntry: LocationHistory = {
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          accuracy: coords.accuracy
        };

        locationHistoryRef.current.unshift(locationEntry);
        if (locationHistoryRef.current.length > 10) {
          locationHistoryRef.current = locationHistoryRef.current.slice(0, 10);
        }

        lastKnownLocationRef.current = locationEntry.coordinates;
        saveLocationToStorage(locationEntry.coordinates);

        setState({
          loading: false,
          error: null,
          data: coords,
        });
      },
      (error) => {
        console.error('Watch position error:', error);
        setState({
          loading: false,
          error: error,
          data: null,
        });
      },
      positionOptions
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Get location history
  const getLocationHistory = useCallback((): LocationHistory[] => {
    return [...locationHistoryRef.current];
  }, []);

  // Get last known location
  const getLastKnownLocation = useCallback((): Coordinates | null => {
    // Try memory first
    if (lastKnownLocationRef.current) {
      return lastKnownLocationRef.current;
    }

    // Try storage
    const stored = getLocationFromStorage();
    if (stored) {
      lastKnownLocationRef.current = stored;
      return stored;
    }

    return null;
  }, []);

  // Validate location accuracy
  const isLocationAccurate = useCallback((coords: GeolocationCoordinates, threshold: number = 100): boolean => {
    return coords.accuracy <= threshold;
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }, []);

  return { 
    ...state, 
    getLocation,
    watchLocation,
    stopWatching,
    getLocationHistory,
    getLastKnownLocation,
    isLocationAccurate,
    calculateDistance
  };
};

// Fallback location methods
const tryFallbackMethods = async (enableIPFallback: boolean): Promise<Partial<GeolocationCoordinates> | null> => {
  // Try last known location from storage
  const lastKnown = getLocationFromStorage();
  if (lastKnown) {
    console.log('Using last known location from storage');
    return {
      latitude: lastKnown.latitude,
      longitude: lastKnown.longitude,
      accuracy: lastKnown.accuracy || 1000,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    } as GeolocationCoordinates;
  }

  // Try IP-based geolocation as last resort
  if (enableIPFallback) {
    try {
      const ipLocation = await getLocationFromIP();
      if (ipLocation) {
        console.log('Using IP-based location');
        return {
          latitude: ipLocation.latitude,
          longitude: ipLocation.longitude,
          accuracy: 10000, // IP-based locations are very inaccurate
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        } as GeolocationCoordinates;
      }
    } catch (error) {
      console.error('IP geolocation failed:', error);
    }
  }

  return null;
};

// IP-based geolocation fallback (using free service)
const getLocationFromIP = async (): Promise<Coordinates | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('IP geolocation service unavailable');
    }
    
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        accuracy: 10000,
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.error('IP geolocation error:', error);
  }
  
  return null;
};

// Storage utilities
const saveLocationToStorage = (location: Coordinates): void => {
  try {
    localStorage.setItem('trijoshh_last_location', JSON.stringify({
      ...location,
      savedAt: Date.now()
    }));
  } catch (error) {
    console.error('Error saving location to storage:', error);
  }
};

const getLocationFromStorage = (): Coordinates | null => {
  try {
    const stored = localStorage.getItem('trijoshh_last_location');
    if (stored) {
      const parsed = JSON.parse(stored);
      const age = Date.now() - parsed.savedAt;
      
      // Use stored location if it's less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          accuracy: parsed.accuracy,
          timestamp: parsed.timestamp
        };
      }
    }
  } catch (error) {
    console.error('Error retrieving location from storage:', error);
  }
  
  return null;
};
