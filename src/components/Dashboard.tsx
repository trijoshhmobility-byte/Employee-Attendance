
import React, { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import LocationMap from './LocationMap';
import Spinner from './Spinner';
import { AttendanceRecord, Employee } from '../types';
import EmployeeService from '../services/employeeService';

interface DashboardProps {
  isClockedIn: boolean;
  lastRecord: AttendanceRecord | null;
  currentUser?: Employee;
  onClockIn: (location: GeolocationCoordinates) => void;
  onClockOut: (location: GeolocationCoordinates) => void;
}

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-center">
            <p className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-200">
                {time.toLocaleTimeString()}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
                {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ isClockedIn, lastRecord, currentUser, onClockIn, onClockOut }) => {
  const { loading, error, data, getLocation, isLocationAccurate } = useGeolocation();
  const [action, setAction] = useState<'clockIn' | 'clockOut' | null>(null);
  const [locationValidation, setLocationValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const employeeService = EmployeeService.getInstance();

  useEffect(() => {
    if (!loading && data && action) {
      // Validate location accuracy
      if (!isLocationAccurate(data, 50)) {
        setLocationValidation({
          isValid: false,
          message: `Location accuracy is ${Math.round(data.accuracy)}m. Please move to a better location for accurate tracking.`
        });
        setAction(null);
        return;
      }

      // Validate location against allowed locations for employee
      if (currentUser) {
        const isValidLocation = employeeService.validateLocation(currentUser, {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy
        });
        
        if (!isValidLocation) {
          setLocationValidation({
            isValid: false,
            message: 'You are not at an authorized work location. Please check with your supervisor.'
          });
          setAction(null);
          return;
        }
      }

      setLocationValidation({ isValid: true, message: 'Location verified successfully!' });
      
      if (action === 'clockIn') {
        onClockIn(data);
      } else if (action === 'clockOut') {
        onClockOut(data);
      }
      setAction(null);
      
      // Clear validation message after 3 seconds
      setTimeout(() => setLocationValidation(null), 3000);
    }
  }, [loading, data, action, onClockIn, onClockOut, currentUser, isLocationAccurate, employeeService]);
  
  const handleClockInClick = () => {
    setLocationValidation(null);
    setAction('clockIn');
    getLocation({ enableHighAccuracy: true, timeout: 15000 });
  };
  
  const handleClockOutClick = () => {
    setLocationValidation(null);
    setAction('clockOut');
    getLocation({ enableHighAccuracy: true, timeout: 15000 });
  };

  const getStatusMessage = () => {
    if (isClockedIn) {
      const clockInTime = new Date(`${lastRecord?.date}T${lastRecord?.clockInTime}`);
      const now = new Date();
      const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      return `You clocked in at ${lastRecord?.clockInTime}. Working for ${hoursWorked.toFixed(1)} hours.`;
    }
    if (lastRecord?.clockOutTime) {
      return `Your last shift ended at ${lastRecord.clockOutTime} on ${lastRecord.date}.`;
    }
    return "Welcome to TRIJOSHH! Ready to start your day?";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Good';
    if (hour < 12) greeting += ' Morning';
    else if (hour < 17) greeting += ' Afternoon';
    else greeting += ' Evening';
    
    return `${greeting}, ${currentUser?.name?.split(' ')[0] || 'Team Member'}!`;
  };

  return (
    <div className="space-y-6">
      {/* TRIJOSHH Welcome Header */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{getGreeting()}</h1>
              <p className="text-blue-100">
                {currentUser.position} • {currentUser.department}
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Employee ID: {currentUser.employeeId}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clock Display */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
        <Clock />
      </div>

      {/* Status and Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isClockedIn 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              {isClockedIn ? 'Currently Working' : 'Not Working'}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center">
              {getStatusMessage()}
            </h2>
            
            {/* Location Validation Message */}
            {locationValidation && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                locationValidation.isValid
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {locationValidation.message}
              </div>
            )}
            
            <div className="w-full pt-4">
              {!isClockedIn ? (
                <button
                  onClick={handleClockInClick}
                  disabled={loading}
                  className="w-full flex justify-center items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 disabled:opacity-50 shadow-lg transform hover:scale-105"
                >
                  {loading && action === 'clockIn' ? (
                    <>
                      <Spinner />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Clock In to TRIJOSHH
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleClockOutClick}
                  disabled={loading}
                  className="w-full flex justify-center items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 disabled:opacity-50 shadow-lg transform hover:scale-105"
                >
                  {loading && action === 'clockOut' ? (
                    <>
                      <Spinner />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Clock Out from TRIJOSHH
                    </>
                  )}
                </button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                <p className="text-red-800 text-sm font-medium">Location Error:</p>
                <p className="text-red-600 text-sm">{error.message}</p>
              </div>
            )}
          </div>

          <div className="text-center p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Current Location</h3>
            {lastRecord?.clockInLocation ? (
                 <LocationMap 
                    coords={isClockedIn ? lastRecord.clockInLocation : lastRecord.clockOutLocation} 
                 />
            ) : (
                <div className="h-48 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No location data available</p>
                    <p className="text-gray-400 text-xs mt-1">Clock in to track your location</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
