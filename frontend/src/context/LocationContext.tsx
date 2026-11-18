import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AirQualityResponse } from '../types';
import { api } from '../services/api';

interface LocationContextType {
  currentCity: string;
  currentLat: number;
  currentLon: number;
  airQuality: AirQualityResponse | null;
  isLoading: boolean;
  error: string | null;
  aqiStandard: 'in' | 'us';
  setAqiStandard: (std: 'in' | 'us') => void;
  setLocation: (city: string, lat: number, lon: number) => void;
  detectGeolocation: () => void;
  refreshData: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCity, setCurrentCity] = useState<string>('Delhi NCR');
  const [currentLat, setCurrentLat] = useState<number>(28.6139);
  const [currentLon, setCurrentLon] = useState<number>(77.2090);
  const [airQuality, setAirQuality] = useState<AirQualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aqiStandard, setAqiStandard] = useState<'in' | 'us'>('in');

  const fetchAQI = useCallback(async (lat: number, lon: number, city: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAirQuality(lat, lon, city);
      setAirQuality(data);
    } catch (err: any) {
      setError(err.message || 'Could not load air quality data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAQI(currentLat, currentLon, currentCity);
  }, [currentLat, currentLon, currentCity, fetchAQI]);

  const setLocation = (city: string, lat: number, lon: number) => {
    setCurrentCity(city);
    setCurrentLat(lat);
    setCurrentLon(lon);
  };

  const detectGeolocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation('Detected GPS Location', lat, lon);
        },
        () => {
          setError('Location access denied. Displaying Delhi baseline.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported by browser.');
    }
  };

  const refreshData = async () => {
    await fetchAQI(currentLat, currentLon, currentCity);
  };

  return (
    <LocationContext.Provider
      value={{
        currentCity,
        currentLat,
        currentLon,
        airQuality,
        isLoading,
        error,
        aqiStandard,
        setAqiStandard,
        setLocation,
        detectGeolocation,
        refreshData,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
