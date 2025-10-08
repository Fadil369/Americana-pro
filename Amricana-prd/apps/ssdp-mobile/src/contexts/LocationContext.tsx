// BRAINSAIT: Location tracking context for geofencing and route optimization
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  hasPermission: boolean;
  isTracking: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  };

  const startTracking = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      setIsTracking(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(currentLocation);
    } catch (err) {
      setError('Failed to get current location');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        hasPermission,
        isTracking,
        error,
        requestPermission,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
