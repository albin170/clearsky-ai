import { createContext, useContext } from 'react';
import type { AirQualityResponse, User, UserRegisterInput } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserRegisterInput) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

export type Language = 'en' | 'ml';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

export interface LocationContextType {
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

export type Theme = 'dark' | 'light' | 'contrast';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const LocationContext = createContext<LocationContextType | undefined>(undefined);
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
