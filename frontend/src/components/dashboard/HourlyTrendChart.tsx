import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useLocation } from '../../context/hooks';
import { Clock, TrendingUp } from 'lucide-react';

interface TrendDatum {
  time: string;
  aqi: number;
  pm25: number;
  temp: number;
  wind: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TrendDatum }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-700 shadow-xl text-xs space-y-1">
        <div className="font-bold text-white flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
          <span>Time: {label}</span>
        </div>
        <div className="text-teal-300 font-extrabold">AQI: {p.aqi}</div>
        <div className="text-neutral-300">PM2.5: {p.pm25} µg/m³</div>
        <div className="text-neutral-400">Temp: {p.temp}°C • Wind: {p.wind} km/h</div>
      </div>
    );
  }
  return null;
};

export const HourlyTrendChart: React.FC = () => {
  const { airQuality, aqiStandard } = useLocation();

  if (!airQuality || !airQuality.hourly) return null;

  const data: TrendDatum[] = airQuality.hourly.map((h) => ({
    time: h.time.length > 5 ? h.time.slice(-5) : h.time,
    aqi: aqiStandard === 'in' ? h.aqi_in : h.aqi_us,
    pm25: h.pm2_5,
    temp: h.temperature_c,
    wind: h.wind_speed_kmh,
  }));

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h3 className="font-extrabold text-base text-white">24-Hour Diurnal Pollution Trend</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Hourly particulate concentration &amp; atmospheric dispersion behavior
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500" />
            <span>AQI Forecast</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-500" />
            <span>100 Safe Limit</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full" role="img" aria-label="24-Hour Diurnal Pollution Trend area chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="time" stroke="#737373" fontSize={11} tickLine={false} />
            <YAxis stroke="#737373" fontSize={11} tickLine={false} domain={[0, 'dataMax + 40']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#14b8a6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#aqiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
        <span className="flex items-center space-x-1.5">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">INVERSION</span>
          <span>Morning peaks (07:00-09:30) and evening stagnation (19:00-22:00)</span>
        </span>
        <span className="text-teal-400 font-semibold">
          Lowest pollution window: 12:30 PM - 03:30 PM
        </span>
      </div>
    </div>
  );
};
