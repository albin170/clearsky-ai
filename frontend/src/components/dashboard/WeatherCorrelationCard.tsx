import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { Thermometer, Droplets, Wind, Compass, Eye, AlertOctagon } from 'lucide-react';

export const WeatherCorrelationCard: React.FC = () => {
  const { airQuality } = useLocation();

  if (!airQuality || !airQuality.weather) return null;

  const w = airQuality.weather;
  const isInversionProne = w.temperature_c < 18 && w.wind_speed_kmh < 8 && w.relative_humidity > 65;

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-white">Meteorological & Inversion Dynamics</h3>
          <p className="text-xs text-neutral-400">Atmospheric dispersion conditions in your immediate airshed</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg border ${
          isInversionProne
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }`}>
          {isInversionProne ? 'HIGH INVERSION RISK' : 'NORMAL DISPERSION'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>Temperature</span>
          </div>
          <div className="text-xl font-black text-white">{w.temperature_c}°C</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
            <Droplets className="w-4 h-4 text-sky-400" />
            <span>Humidity</span>
          </div>
          <div className="text-xl font-black text-white">{w.relative_humidity}%</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
            <Wind className="w-4 h-4 text-teal-400" />
            <span>Wind Speed</span>
          </div>
          <div className="text-xl font-black text-white">{w.wind_speed_kmh} <span className="text-xs font-normal text-neutral-400">km/h</span></div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Wind Direction</span>
          </div>
          <div className="text-xl font-black text-white">{w.wind_direction_cardinal} <span className="text-xs font-normal text-neutral-400">({w.wind_direction_deg}°)</span></div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
        <div className="flex items-center space-x-2 font-bold text-teal-400">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>Atmospheric Physics Insight:</span>
        </div>
        <p>
          {w.wind_speed_kmh < 7
            ? `Calm horizontal winds (${w.wind_speed_kmh} km/h) restrict lateral ventilation, concentrating vehicular exhaust close to ground level.`
            : `Moderate winds (${w.wind_speed_kmh} km/h) assist in flushing particulates out of street canyons.`}{' '}
          {w.relative_humidity > 70
            ? 'Elevated moisture levels promote secondary particle growth through aerosol hygroscopic swelling, intensifying visible winter haze.'
            : 'Moderate air moisture permits adequate atmospheric light transmittance.'}
        </p>
      </div>
    </div>
  );
};
