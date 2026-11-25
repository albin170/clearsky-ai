import React from 'react';
import { useLocation } from '../../context/hooks';
import { Calendar, CloudSun } from 'lucide-react';

export const DailyForecastList: React.FC = () => {
  const { airQuality, aqiStandard } = useLocation();

  if (!airQuality || !airQuality.daily) return null;

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-teal-400" aria-hidden="true" />
        <h2 className="font-extrabold text-base text-white">7-Day Atmospheric Outlook</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {airQuality.daily.map((d, idx) => {
          const aqi = aqiStandard === 'in' ? d.avg_aqi_in : d.avg_aqi_us;
          const isHigh = aqi > 150;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center transition ${
                idx === 0
                  ? 'bg-neutral-800/80 border-teal-500/40 shadow'
                  : 'bg-neutral-950/60 border-neutral-800/80'
              }`}
            >
              <div className="text-xs font-bold text-neutral-300">{d.date}</div>
              <CloudSun className="w-5 h-5 text-neutral-400 my-2" aria-hidden="true" />
              <div className={`text-xl font-black ${isHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
                {aqi}
              </div>
              <div className="text-[10px] font-bold text-neutral-400 mt-1 uppercase">
                {d.category_in}
              </div>
              <div className="text-[9px] text-neutral-500 mt-0.5 line-clamp-1">
                {d.weather_description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
