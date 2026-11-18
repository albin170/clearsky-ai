import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Info, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AQIGauge: React.FC = () => {
  const { airQuality, aqiStandard, setAqiStandard } = useLocation();
  const { t } = useLanguage();

  if (!airQuality) return null;

  const current = airQuality.current;
  const isIndian = aqiStandard === 'in';
  const aqi = isIndian ? current.aqi_in : current.aqi_us;
  const category = isIndian ? current.category_in : current.category_us;
  const color = isIndian ? current.color_in : current.color_us;

  // Percentage for needle/circle (0-500 scale)
  const pct = Math.min(100, (aqi / 500) * 100);
  const strokeDashoffset = 440 - (440 * (pct * 0.75)) / 100;

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">
            {isIndian ? 'Indian NAQI (CPCB)' : 'US EPA Index'}
          </span>
          <h3 className="text-lg font-bold text-white">{current.city}</h3>
        </div>
        <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800 text-xs">
          <button
            onClick={() => setAqiStandard('in')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              isIndian ? 'bg-teal-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            CPCB
          </button>
          <button
            onClick={() => setAqiStandard('us')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              !isIndian ? 'bg-teal-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            US EPA
          </button>
        </div>
      </div>

      {/* Circular Gauge */}
      <div className="relative w-56 h-56 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 160 160">
          {/* Track background */}
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke="currentColor"
            strokeWidth="14"
            className="text-neutral-800"
            fill="none"
            strokeDasharray="440"
            strokeDashoffset="110"
            strokeLinecap="round"
          />
          {/* Filled progress */}
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke={color}
            strokeWidth="14"
            fill="none"
            strokeDasharray="440"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center reading */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black tracking-tight" style={{ color }}>
            {aqi}
          </span>
          <span 
            className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full mt-1.5 shadow"
            style={{ backgroundColor: `${color}25`, color }}
          >
            {category}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 font-mono">
            {current.dominant_pollutant} Dominant
          </span>
        </div>
      </div>

      {/* Health message */}
      <div className="w-full mt-4 p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isIndian
            ? current.pollutants[current.dominant_pollutant.toLowerCase().replace('.', '_')]?.health_implication ||
              'Prolonged outdoor exposure may lead to respiratory discomfort in sensitive groups.'
            : 'Particulate density presents potential exposure risks during stagnant meteorological conditions.'}
        </p>
      </div>

      {/* Timestamp & source verification */}
      <div className="w-full flex items-center justify-between text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-800">
        <span>Source: {current.source}</span>
        <span className="flex items-center text-teal-400 font-medium">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {current.data_freshness}
        </span>
      </div>
    </div>
  );
};
