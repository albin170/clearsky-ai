import React, { useState, useEffect, useCallback } from 'react';
import type { AirQualityResponse } from '../types';
import { api } from '../services/api';
import { LocationContext } from './hooks';

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load air quality data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getAirQuality(currentLat, currentLon, currentCity)
      .then((data) => {
        if (!cancelled) {
          setAirQuality(data);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load air quality data');
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentLat, currentLon, currentCity]);

  const setLocation = (city: string, lat: number, lon: number) => {
    setIsLoading(true);
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
        },
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
