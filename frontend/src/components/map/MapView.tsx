import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Compass, Map as MapIcon, MapPin } from 'lucide-react';
import { useLocation } from '../../context/hooks';
import { api } from '../../services/api';
import type { CleanRouteResponse } from '../../types';

export const MapView: React.FC = () => {
  const { currentCity, currentLat, currentLon, airQuality } = useLocation();

  const [mode, setMode] = useState<'walking' | 'cycling'>('walking');
  const [routeResult, setRouteResult] = useState<CleanRouteResponse | null>(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoute = useCallback(
    (targetMode: 'walking' | 'cycling') =>
      api.planCleanRoute(currentLat, currentLon, currentLat + 0.025, currentLon + 0.02, targetMode),
    [currentLat, currentLon],
  );

  useEffect(() => {
    let active = true;
    fetchRoute(mode)
      .then((res) => {
        if (active) setRouteResult(res);
      })
      .catch(() => {
        if (active) setRouteResult(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentCity, mode, fetchRoute]);

  const handleSelectMode = (targetMode: 'walking' | 'cycling') => {
    setIsLoading(true);
    setMode(targetMode);
  };

  const baseAqi = airQuality?.current.aqi_in || 160;
  const basePm25 = airQuality?.current.pm2_5 || 65.0;

  const stations = [
    {
      name: `${currentCity} Central Hub`,
      aqi: baseAqi,
      pm25: basePm25,
      status: airQuality?.current.data_freshness || 'Live Reanalysis',
      isModeled: false,
    },
    {
      name: `${currentCity} Vegetative Buffer Zone`,
      aqi: Math.max(35, baseAqi - 35),
      pm25: basePm25 * 0.78,
      status: 'Modeled Green Corridor (-22% PM2.5)',
      isModeled: true,
    },
    {
      name: `${currentCity} Arterial Traffic Corridor`,
      aqi: baseAqi + 45,
      pm25: basePm25 * 1.35,
      status: 'Modeled Roadside Hotspot (+35% PM2.5)',
      isModeled: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
          <MapIcon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Pollution Hotspot &amp; Clean-Air Route Map</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Live baseline reanalysis telemetry, modeled spatial particulate variance, and low-exposure walking &amp; cycling corridors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stations.map((s, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
                <span className="font-bold text-sm text-white">{s.name}</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {s.status} • PM2.5: {s.pm25.toFixed(1)} µg/m³
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xl font-black ${
                  s.aqi > 200 ? 'text-rose-400' : s.aqi > 100 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {s.aqi}
              </span>
              <div className="text-[10px] uppercase font-bold text-neutral-400">
                {s.isModeled ? 'Est. AQI' : 'Live AQI'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section aria-labelledby="route-planner-heading" className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h2 id="route-planner-heading" className="font-extrabold text-base text-white">
              Smart Clean-Air Route Planner
            </h2>
          </div>
          <div className="flex space-x-2" role="group" aria-label="Commute Mode">
            <button
              type="button"
              disabled={isLoading}
              aria-pressed={mode === 'walking'}
              onClick={() => handleSelectMode('walking')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mode === 'walking' ? 'bg-teal-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Walking
            </button>
            <button
              type="button"
              disabled={isLoading}
              aria-pressed={mode === 'cycling'}
              onClick={() => handleSelectMode('cycling')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mode === 'cycling' ? 'bg-teal-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Cycling
            </button>
          </div>
        </div>

        {routeResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeResult.routes.map((r, idx) => {
                const isSelected = selectedRouteIdx === idx;
                const isGreen = idx === 1;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedRouteIdx(idx)}
                    aria-pressed={isSelected}
                    className={`p-5 rounded-2xl text-left transition border ${
                      isSelected
                        ? isGreen
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                          : 'bg-neutral-800/80 border-neutral-600 shadow'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="font-bold text-sm text-white">{r.name}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isGreen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {r.pollution_exposure_label}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-4 my-2">
                      <span className="text-2xl font-black text-white">{r.distance_km} km</span>
                      <span className="text-sm font-semibold text-neutral-400">~{r.estimated_time_mins} mins</span>
                      <span className="text-xs text-teal-400 font-mono">
                        Exposure Index: {r.estimated_pm25_exposure_index}/100
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">{r.suitability}</p>

                    <div className="space-y-1 text-xs">
                      {r.advantages.map((adv, i) => (
                        <div key={i} className="flex items-center space-x-1.5 text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Spatial Waypoint Map Visualization</span>
                <span className="text-teal-400 font-bold">
                  Active Choice: {routeResult.routes[selectedRouteIdx].name}
                </span>
              </div>
              <div className="h-32 w-full rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center relative overflow-hidden p-4">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 80"
                  role="img"
                  aria-label="Route comparison diagram showing direct high-traffic arterial path versus curved low-exposure green corridor"
                >
                  <line x1="40" y1="40" x2="360" y2="40" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4 2" />
                  <path d="M 40 40 Q 200 10 360 40" fill="none" stroke="#10b981" strokeWidth="4" />
                  <circle cx="40" cy="40" r="6" fill="#38bdf8" />
                  <text x="35" y="65" fill="#94a3b8" fontSize="10">
                    Origin
                  </text>
                  <circle cx="360" cy="40" r="6" fill="#f59e0b" />
                  <text x="345" y="65" fill="#94a3b8" fontSize="10">
                    Target
                  </text>
                </svg>
              </div>
              <div className="text-[11px] text-neutral-400 flex justify-between px-2">
                <span className="text-emerald-400 font-semibold">— Green Curve: Low-Exposure Buffer Route</span>
                <span className="text-rose-400 font-semibold">- - Red Line: High-Traffic Arterial Corridor</span>
              </div>
            </div>

            <p className="text-xs text-teal-300 bg-teal-950/30 p-3 rounded-xl border border-teal-800/40">
              {routeResult.guidance}
            </p>

            <p className="text-[11px] text-neutral-400 italic">{routeResult.disclaimer}</p>
          </div>
        )}
      </section>
    </div>
  );
};
