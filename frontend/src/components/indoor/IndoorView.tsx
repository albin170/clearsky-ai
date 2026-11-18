import React, { useState, useEffect } from 'react';
import { 
  Home, Plus, Wind, ShieldCheck, AlertTriangle, 
  Trash2, Clock, CheckCircle2, Sliders, Info 
} from 'lucide-react';
import { api } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { RoomAssessment, VentilationWindowAdvice } from '../../types';

export const IndoorView: React.FC = () => {
  const { airQuality } = useLocation();
  const [rooms, setRooms] = useState<RoomAssessment[]>([]);
  const [ventilationAdvice, setVentilationAdvice] = useState<VentilationWindowAdvice | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [roomName, setRoomName] = useState('Master Bedroom');
  const [roomSize, setRoomSize] = useState(160);
  const [occupants, setOccupants] = useState(2);
  const [ventilationType, setVentilationType] = useState('cross_windows');
  const [hasPurifier, setHasPurifier] = useState(true);
  const [filterType, setFilterType] = useState('hepa_h13');
  const [cookingExposure, setCookingExposure] = useState('low');
  const [sensorPm25, setSensorPm25] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const outdoorAqi = airQuality?.current.aqi_in || 160;
      const [roomsData, adviceData] = await Promise.all([
        api.getRoomAssessments(),
        api.getVentilationAdvice(roomSize, outdoorAqi),
      ]);
      setRooms(roomsData);
      setVentilationAdvice(adviceData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [airQuality]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRoomAssessment({
        room_name: roomName,
        room_size_sqft: Number(roomSize),
        occupants: Number(occupants),
        ventilation_type: ventilationType,
        has_purifier: hasPurifier,
        purifier_filter_type: filterType,
        cooking_smoke_exposure: cookingExposure,
        sensor_pm25: sensorPm25 ? Number(sensorPm25) : undefined,
      });
      setIsAddOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirm('Delete this room assessment?')) {
      await api.deleteRoomAssessment(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Indoor Air Quality Optimizer</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Room health modeling, CADR airflow calculations, and diurnal window ventilation scheduling
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-lg shadow-teal-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Analyze Room</span>
        </button>
      </div>

      {/* Ventilation Window Advisory */}
      {ventilationAdvice && (
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-base text-white">Diurnal Window Ventilation Advisory</h3>
            </div>
            <span className="text-xs font-mono text-teal-400">
              Recommended Purifier CADR: {ventilationAdvice.air_purifier_cadre_recommendation_cfm} CFM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Optimal Window Opening Window (Cleanest Air)</span>
              </div>
              <ul className="text-sm text-neutral-200 space-y-1">
                {ventilationAdvice.optimal_window_opening_hours.map((h, i) => (
                  <li key={i} className="font-semibold text-emerald-300">• {h}</li>
                ))}
              </ul>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Solar convective thermal lifting flushes stagnant pollutants away from the ground, allowing natural oxygen replenishment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Worst Window Opening Hours (Highest Inversion Risk)</span>
              </div>
              <ul className="text-sm text-neutral-200 space-y-1">
                {ventilationAdvice.worst_window_opening_hours.map((h, i) => (
                  <li key={i} className="font-semibold text-rose-300">• {h}</li>
                ))}
              </ul>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cold thermal ground inversion traps concentrated vehicle soot, dust, and smoke at street level. Keep windows sealed.
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-300 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800 leading-relaxed">
            {ventilationAdvice.recommendation_text}
          </p>
        </div>
      )}

      {/* Room Health Planner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((r) => {
          const scoreColor = r.calculated_score >= 80 ? '#10b981' : r.calculated_score >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{r.room_name}</h3>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {r.room_size_sqft} sq ft • {r.occupants} occupants • {r.ventilation_type.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: scoreColor }}>
                      {r.calculated_score}<span className="text-xs font-normal text-neutral-500">/100</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase text-neutral-400">Health Index</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    r.has_purifier ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {r.has_purifier ? `Purifier: ${r.purifier_filter_type.toUpperCase()}` : 'No Purifier'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Cooking Exposure: {r.cooking_smoke_exposure}
                  </span>
                </div>

                {/* Recommendations */}
                <div className="mt-4 space-y-2 border-t border-neutral-800/80 pt-3">
                  <span className="text-xs font-bold text-neutral-300">Actionable Architectural Guidance:</span>
                  <ul className="space-y-1.5 text-xs text-neutral-400">
                    {r.recommendations.map((tip, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>Filter Life: ~78% Remaining</span>
                <button
                  onClick={() => handleDeleteRoom(r.id)}
                  className="text-neutral-500 hover:text-red-400 transition"
                  title="Delete Room Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-neutral-950/60 border border-dashed border-neutral-800 text-center space-y-2">
            <Home className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-sm font-semibold text-neutral-300">No rooms assessed yet</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Analyze your bedrooms, living room, and study to receive custom airflow and filtration recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 text-white space-y-4">
            <h3 className="text-lg font-bold">Room Health Planner</h3>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Master Bedroom, Living Room, etc."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Area (sq ft)</label>
                  <input
                    type="number"
                    required
                    value={roomSize}
                    onChange={(e) => setRoomSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Occupants</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={occupants}
                    onChange={(e) => setOccupants(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Ventilation Architecture</label>
                <select
                  value={ventilationType}
                  onChange={(e) => setVentilationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="cross_windows">Cross-ventilation (Opposing Windows)</option>
                  <option value="single_window">Single Window Only</option>
                  <option value="sealed_ac">Sealed Room with Air Conditioner</option>
                  <option value="exhaust_only">Exhaust Fan Only</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="hasPurifier"
                  checked={hasPurifier}
                  onChange={(e) => setHasPurifier(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-neutral-950 border-neutral-700"
                />
                <label htmlFor="hasPurifier" className="text-xs font-semibold text-neutral-200 cursor-pointer">
                  Air Purifier is Installed
                </label>
              </div>

              {hasPurifier && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Filter Grade</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                  >
                    <option value="hepa_h13">Certified HEPA H13 (99.97% 0.3µm)</option>
                    <option value="basic">Standard Coarse Mesh Filter</option>
                    <option value="carbon">Activated Carbon Deodorizing Filter</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Cooking Smoke Infiltration</label>
                <select
                  value={cookingExposure}
                  onChange={(e) => setCookingExposure(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="low">Low (Far from kitchen or chimney installed)</option>
                  <option value="moderate">Moderate (Nearby open kitchen)</option>
                  <option value="high">High (No chimney, regular frying/tadka smoke)</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-900/30"
                >
                  Compute Health Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensor disclaimer */}
      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>
          <strong>Scientific Measurement Note:</strong> ClearSky AI calculates architectural risk indices and CADR CFM ratings.
          Exact indoor AQI depends on micro-meteorology, building air exchange rates (ACH), and requires a physical indoor air quality sensor.
        </p>
      </div>
    </div>
  );
};
