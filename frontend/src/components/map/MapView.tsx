import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, Navigation, ShieldCheck, Compass, 
  MapPin, AlertTriangle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import { CleanRouteResponse, RouteOption } from '../../types';

export const MapView: React.FC = () => {
  const { currentCity, currentLat, currentLon, airQuality } = useLocation();

  // Route planner state
  const [startLat, setStartLat] = useState(currentLat);
  const [startLon, setStartLon] = useState(currentLon);
  const [endLat, setEndLat] = useState(currentLat + 0.025);
  const [endLon, setEndLon] = useState(currentLon + 0.020);
  const [mode, setMode] = useState('walking');
  const [routeResult, setRouteResult] = useState<CleanRouteResponse | null>(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(1); // default to Green Route
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setStartLat(currentLat);
    setStartLon(currentLon);
    setEndLat(currentLat + 0.025);
    setEndLon(currentLon + 0.020);
    handlePlanRoute();
  }, [currentCity, currentLat, currentLon]);

  const handlePlanRoute = async () => {
    setIsLoading(true);
    try {
      const res = await api.planCleanRoute(startLat, startLon, endLat, endLon, mode);
      setRouteResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Nearby mock monitoring stations for spatial display
  const stations = [
    { name: `${currentCity} Central Hub`, lat: currentLat, lon: currentLon, aqi: airQuality?.current.aqi_in || 160, pm25: airQuality?.current.pm2_5 || 65.0, status: 'Official CPCB' },
    { name: `${currentCity} Eco Park Station`, lat: currentLat + 0.018, lon: currentLon - 0.015, aqi: Math.max(35, (airQuality?.current.aqi_in || 160) - 35), pm25: (airQuality?.current.pm2_5 || 65.0) * 0.7, status: 'Green Buffer' },
    { name: `${currentCity} Industrial Bypass`, lat: currentLat - 0.022, lon: currentLon + 0.025, aqi: (airQuality?.current.aqi_in || 160) + 45, pm25: (airQuality?.current.pm2_5 || 65.0) * 1.35, status: 'Arterial Traffic' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
          <MapIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Pollution Hotspot & Clean-Air Route Map</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-world station sensors, spatial particulate variance, and low-exposure walking & cycling corridors
          </p>
        </div>
      </div>

      {/* Monitoring Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stations.map((s, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm text-white">{s.name}</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {s.status} • PM2.5: {s.pm25.toFixed(1)} µg/m³
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xl font-black ${s.aqi > 200 ? 'text-rose-400' : s.aqi > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {s.aqi}
              </span>
              <div className="text-[10px] uppercase font-bold text-neutral-500">AQI</div>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Route Planner Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-base text-white">Smart Clean-Air Route Planner</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => { setMode('walking'); handlePlanRoute(); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mode === 'walking' ? 'bg-teal-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Walking
            </button>
            <button
              onClick={() => { setMode('cycling'); handlePlanRoute(); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mode === 'cycling' ? 'bg-teal-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Cycling
            </button>
          </div>
        </div>

        {/* Route options comparison */}
        {routeResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeResult.routes.map((r, idx) => {
                const isSelected = selectedRouteIdx === idx;
                const isGreen = idx === 1;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedRouteIdx(idx)}
                    className={`p-5 rounded-2xl cursor-pointer transition border ${
                      isSelected
                        ? isGreen
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                          : 'bg-neutral-800/80 border-neutral-600 shadow'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{r.name}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isGreen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
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

                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                      {r.suitability}
                    </p>

                    <div className="space-y-1 text-xs">
                      {r.advantages.map((adv, i) => (
                        <div key={i} className="flex items-center space-x-1.5 text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spatial Schematic Preview */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Spatial Waypoint Map Visualization</span>
                <span className="text-teal-400 font-bold">
                  Active Choice: {routeResult.routes[selectedRouteIdx].name}
                </span>
              </div>
              <div className="h-32 w-full rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center relative overflow-hidden p-4">
                {/* SVG Visual line representation */}
                <svg className="w-full h-full" viewBox="0 0 400 80">
                  {/* Arterial straight red line */}
                  <line x1="40" y1="40" x2="360" y2="40" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4 2" />
                  {/* Green curved detour */}
                  <path d="M 40 40 Q 200 10 360 40" fill="none" stroke="#10b981" strokeWidth="4" />
                  {/* Start Point */}
                  <circle cx="40" cy="40" r="6" fill="#38bdf8" />
                  <text x="35" y="65" fill="#94a3b8" fontSize="10">Origin</text>
                  {/* End Point */}
                  <circle cx="360" cy="40" r="6" fill="#f59e0b" />
                  <text x="345" y="65" fill="#94a3b8" fontSize="10">Target</text>
                </svg>
              </div>
              <div className="text-[11px] text-neutral-500 flex justify-between px-2">
                <span className="text-emerald-400 font-semibold">— Green Curve: Low-Exposure Buffer Route</span>
                <span className="text-rose-400 font-semibold">- - Red Line: High-Traffic Arterial Corridor</span>
              </div>
            </div>

            <p className="text-xs text-teal-300 bg-teal-950/30 p-3 rounded-xl border border-teal-800/40">
              {routeResult.guidance}
            </p>

            <p className="text-[11px] text-neutral-500 italic">
              {routeResult.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
