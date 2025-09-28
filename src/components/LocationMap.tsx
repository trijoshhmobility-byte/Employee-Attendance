
import React from 'react';
import { Coordinates } from '../types';

interface LocationMapProps {
  coords: Coordinates | null;
}

const LocationMap: React.FC<LocationMapProps> = ({ coords }) => {
  if (!coords) {
    return (
        <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500">Location not available.</p>
        </div>
    );
  }
  
  const { latitude, longitude } = coords;
  const mapUrl = `https://static-map.openstreetmap.de/map.php?center=${latitude},${longitude}&zoom=15&size=400x200&marker=${latitude},${longitude},ol-marker`;

  return (
    <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <img
        src={mapUrl}
        alt={`Map location at ${latitude}, ${longitude}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default LocationMap;
