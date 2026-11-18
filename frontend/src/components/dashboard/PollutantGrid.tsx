import React from 'react';
import { useLocation } from '../../context/LocationContext';

export const PollutantGrid: React.FC = () => {
  const { airQuality } = useLocation();

  if (!airQuality) return null;

  const pollutants = airQuality.current.pollutants;
  const items = [
    { key: 'pm2_5', name: 'PM2.5', label: 'Fine Inhalable Particles (<2.5 µm)' },
    { key: 'pm10', name: 'PM10', label: 'Coarse Inhalable Dust (<10 µm)' },
    { key: 'no2', name: 'NO₂', label: 'Nitrogen Dioxide (Traffic Byproduct)' },
    { key: 'so2', name: 'SO₂', label: 'Sulfur Dioxide (Industrial Exhaust)' },
    { key: 'co', name: 'CO', label: 'Carbon Monoxide (Incomplete Burn)' },
    { key: 'o3', name: 'O₃', label: 'Ground Ozone (Photochemical Smog)' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'satisfactory': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'poor': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'very poor': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-red-500 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => {
        const detail = pollutants[item.key];
        if (!detail) return null;
        const colorClass = getStatusColor(detail.status);

        return (
          <div
            key={item.key}
            className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-sm text-white">{item.name}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorClass}`}>
                  {detail.status}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1">{item.label}</p>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-black text-white">
                {detail.value} <span className="text-xs font-normal text-neutral-400">{detail.unit}</span>
              </div>
              {detail.sub_index !== undefined && (
                <div className="text-[11px] text-neutral-400">
                  Sub-Index: <span className="font-bold text-neutral-200">{detail.sub_index}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
