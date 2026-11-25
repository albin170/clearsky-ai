import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { MONITORING_CITIES } from '../../constants/cities';
import { api } from '../../services/api';
import type { LocationComparisonResponse } from '../../types';

export const LocationComparer: React.FC = () => {
  const [city1, setCity1] = useState(MONITORING_CITIES[0]);
  const [city2, setCity2] = useState(MONITORING_CITIES[3]);
  const [result, setResult] = useState<LocationComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async () => {
    setIsLoading(true);
    try {
      const data = await api.compareLocations(
        city1.lat,
        city1.lon,
        city1.name,
        city2.lat,
        city2.lon,
        city2.name,
      );
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
      <div className="flex items-center space-x-2">
        <ArrowLeftRight className="w-5 h-5 text-teal-400" aria-hidden="true" />
        <h2 className="font-extrabold text-base text-white">Compare Regional Airsheds</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="compare-city-1" className="block text-xs font-semibold text-neutral-400 mb-1">
            First Location
          </label>
          <select
            id="compare-city-1"
            value={city1.name}
            onChange={(e) => {
              const c = MONITORING_CITIES.find((x) => x.name === e.target.value);
              if (c) setCity1(c);
            }}
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
          >
            {MONITORING_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="compare-city-2" className="block text-xs font-semibold text-neutral-400 mb-1">
            Second Location
          </label>
          <select
            id="compare-city-2"
            value={city2.name}
            onChange={(e) => {
              const c = MONITORING_CITIES.find((x) => x.name === e.target.value);
              if (c) setCity2(c);
            }}
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
          >
            {MONITORING_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleCompare()}
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 font-bold text-sm text-teal-300 transition"
      >
        {isLoading ? 'Retrieving Comparative Data...' : 'Compare Environmental Metrics'}
      </button>

      {result && (
        <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-xs text-neutral-400 font-semibold">{result.location_1.city}</div>
              <div className="text-3xl font-black text-white mt-1">{result.location_1.aqi_in}</div>
              <div className="text-[11px] font-bold uppercase mt-1" style={{ color: result.location_1.color_in }}>
                {result.location_1.category_in}
              </div>
              <div className="text-xs text-neutral-400 mt-1">PM2.5: {result.location_1.pm2_5} µg/m³</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-xs text-neutral-400 font-semibold">{result.location_2.city}</div>
              <div className="text-3xl font-black text-white mt-1">{result.location_2.aqi_in}</div>
              <div className="text-[11px] font-bold uppercase mt-1" style={{ color: result.location_2.color_in }}>
                {result.location_2.category_in}
              </div>
              <div className="text-xs text-neutral-400 mt-1">PM2.5: {result.location_2.pm2_5} µg/m³</div>
            </div>
          </div>

          <div role="status" className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200">
            <span className="font-bold">Comparative Finding:</span> {result.comparison.summary}
          </div>
        </div>
      )}
    </div>
  );
};
