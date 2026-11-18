import React, { useState } from 'react';
import { 
  Wind, MapPin, Navigation, Globe, Sun, Moon, 
  Contrast, ShieldAlert, User as UserIcon, LogOut, Check
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { EmergencyModal } from '../emergency/EmergencyModal';

const PRESET_CITIES = [
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
];

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { currentCity, airQuality, aqiStandard, setAqiStandard, setLocation, detectGeolocation } = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const aqi = aqiStandard === 'in' ? airQuality?.current.aqi_in : airQuality?.current.aqi_us;
  const aqiCategory = aqiStandard === 'in' ? airQuality?.current.category_in : airQuality?.current.category_us;
  const aqiColor = aqiStandard === 'in' ? airQuality?.current.color_in : airQuality?.current.color_us;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-subtle bg-primary/95 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-teal-900/30">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">ClearSky</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">AI</span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Urban Smog & Environmental Intelligence</p>
            </div>
          </div>

          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-sm font-medium text-neutral-200 transition"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">{currentCity}</span>
              {aqi !== undefined && (
                <span
                  className="px-2 py-0.5 text-xs font-black rounded-md text-white ml-1"
                  style={{ backgroundColor: aqiColor || '#10b981' }}
                >
                  {aqi}
                </span>
              )}
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl p-2 z-50">
                <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 px-3 py-1">
                  Select Monitoring Hub
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {PRESET_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setLocation(c.name, c.lat, c.lon);
                        setIsCityDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-neutral-800 text-neutral-200 flex items-center justify-between transition"
                    >
                      <span>{c.name}</span>
                      {currentCity === c.name && <Check className="w-4 h-4 text-teal-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-neutral-800 mt-2 pt-2">
                  <button
                    onClick={() => {
                      detectGeolocation();
                      setIsCityDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-semibold transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Detect My GPS Location</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Standard Switcher: Indian NAQI vs US EPA */}
            <div className="hidden md:flex items-center rounded-xl bg-neutral-900 p-0.5 border border-neutral-700/60 text-xs">
              <button
                onClick={() => setAqiStandard('in')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  aqiStandard === 'in' ? 'bg-teal-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
                title="Indian National Air Quality Index (CPCB standard)"
              >
                CPCB NAQI
              </button>
              <button
                onClick={() => setAqiStandard('us')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  aqiStandard === 'us' ? 'bg-teal-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
                title="United States EPA Air Quality Index"
              >
                US EPA
              </button>
            </div>

            {/* Emergency Smog Mode Button */}
            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-black tracking-wider transition animate-pulse"
              title="Activate Emergency Winter Smog Defense Interface"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">SMOG DEFENSE</span>
            </button>

            {/* Language Switcher (EN / ML) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-bold text-neutral-200 transition"
              title="Toggle English / Malayalam (മലയാളം)"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'en' ? 'മലയാളം' : 'EN'}</span>
            </button>

            {/* Theme Toggle (Dark / Light / High Contrast) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 transition"
              title={`Switch Theme (Current: ${theme})`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' && <Sun className="w-4 h-4 text-amber-400" />}
              {theme === 'light' && <Contrast className="w-4 h-4 text-blue-400" />}
              {theme === 'contrast' && <Moon className="w-4 h-4 text-teal-300" />}
            </button>

            {/* Auth / Profile button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.full_name}</span>
                  <span className="text-[10px] text-teal-400 uppercase font-mono">{user.role.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 border border-neutral-700/60 text-neutral-300 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white text-xs shadow-md shadow-teal-900/30 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Emergency Mode Modal */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </>
  );
};
