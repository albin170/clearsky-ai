import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Home, Info, Plus, Trash2, Wind } from 'lucide-react';
import { api } from '../../services/api';
import { useLocation } from '../../context/hooks';
import type { RoomAssessment, RoomAssessmentCreateInput, VentilationWindowAdvice } from '../../types';
import { RoomAssessmentModal } from './RoomAssessmentModal';

export const IndoorView: React.FC = () => {
  const { airQuality } = useLocation();
  const [rooms, setRooms] = useState<RoomAssessment[]>([]);
  const [ventilationAdvice, setVentilationAdvice] = useState<VentilationWindowAdvice | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [referenceRoomSize, setReferenceRoomSize] = useState(160);

  const fetchIndoorBundle = useCallback(
    (targetSize: number) => {
      const outdoorAqi = airQuality?.current.aqi_in || 160;
      return Promise.all([api.getRoomAssessments(), api.getVentilationAdvice(targetSize, outdoorAqi)]);
    },
    [airQuality],
  );

  const loadData = useCallback(
    async (targetSize = referenceRoomSize) => {
      setIsLoading(true);
      try {
        const [roomsData, adviceData] = await fetchIndoorBundle(targetSize);
        setRooms(roomsData);
        setVentilationAdvice(adviceData);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchIndoorBundle, referenceRoomSize],
  );

  useEffect(() => {
    let active = true;
    fetchIndoorBundle(referenceRoomSize)
      .then(([roomsData, adviceData]) => {
        if (!active) return;
        setRooms(roomsData);
        setVentilationAdvice(adviceData);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchIndoorBundle, referenceRoomSize]);

  const handleCreateRoom = async (input: RoomAssessmentCreateInput) => {
    try {
      await api.createRoomAssessment(input);
      setReferenceRoomSize(input.room_size_sqft);
      setIsAddOpen(false);
      setStatusMessage('Room assessment calculated and saved.');
      await loadData(input.room_size_sqft);
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Sign in to save room assessments.');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    try {
      await api.deleteRoomAssessment(id);
      setStatusMessage('Room assessment removed.');
      await loadData();
    } catch {
      setStatusMessage('Could not remove room assessment.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
            <Home className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Indoor Air Quality Optimizer</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Room health modeling, CADR airflow calculations, and diurnal window ventilation scheduling
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-lg shadow-teal-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Analyze Room</span>
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-teal-950/50 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between"
        >
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {ventilationAdvice && (
        <section aria-labelledby="ventilation-heading" className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-teal-400" aria-hidden="true" />
              <h2 id="ventilation-heading" className="font-extrabold text-base text-white">
                Diurnal Window Ventilation Advisory
              </h2>
            </div>
            <span className="text-xs font-mono text-teal-400">
              Recommended Purifier CADR: {ventilationAdvice.air_purifier_cadre_recommendation_cfm} CFM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Optimal Window Opening Window (Cleanest Air)</span>
              </div>
              <ul className="text-sm text-neutral-200 space-y-1">
                {ventilationAdvice.optimal_window_opening_hours.map((h, i) => (
                  <li key={i} className="font-semibold text-emerald-300">
                    • {h}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Solar convective thermal lifting flushes stagnant pollutants away from the ground, allowing natural oxygen replenishment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span>Worst Window Opening Hours (Highest Inversion Risk)</span>
              </div>
              <ul className="text-sm text-neutral-200 space-y-1">
                {ventilationAdvice.worst_window_opening_hours.map((h, i) => (
                  <li key={i} className="font-semibold text-rose-300">
                    • {h}
                  </li>
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
        </section>
      )}

      {isLoading && (
        <div role="status" aria-live="polite" className="p-4 text-xs text-neutral-400">
          Calculating indoor filtration and ventilation metrics...
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
                    <h2 className="font-extrabold text-lg text-white">{r.room_name}</h2>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {r.room_size_sqft} sq ft • {r.occupants} occupants • {r.ventilation_type.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: scoreColor }}>
                      {r.calculated_score}
                      <span className="text-xs font-normal text-neutral-400">/100</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase text-neutral-400">Health Index</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      r.has_purifier
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {r.has_purifier ? `Purifier: ${r.purifier_filter_type.toUpperCase()}` : 'No Purifier'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Cooking Exposure: {r.cooking_smoke_exposure}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-neutral-800/80 pt-3">
                  <span className="text-xs font-bold text-neutral-300">Actionable Architectural Guidance:</span>
                  <ul className="space-y-1.5 text-xs text-neutral-400">
                    {r.recommendations.map((tip, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-teal-400 font-bold" aria-hidden="true">
                          •
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>AHAM CADR Target: {Math.round((2 / 3) * r.room_size_sqft)} CFM</span>
                <button
                  type="button"
                  onClick={() => void handleDeleteRoom(r.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg transition"
                  title="Delete Room Assessment"
                  aria-label={`Delete room assessment for ${r.room_name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}

        {!isLoading && rooms.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-neutral-950/60 border border-dashed border-neutral-800 text-center space-y-2">
            <Home className="w-8 h-8 text-neutral-500 mx-auto" aria-hidden="true" />
            <div className="text-sm font-semibold text-neutral-300">No rooms assessed yet</div>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Analyze your bedrooms, living room, and study to receive custom airflow and filtration recommendations.
            </p>
          </div>
        )}
      </div>

      <RoomAssessmentModal
        isOpen={isAddOpen}
        defaultRoomSize={referenceRoomSize}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreateRoom}
      />

      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Scientific Measurement Note:</strong> ClearSky AI calculates architectural risk indices and CADR CFM ratings.
          Exact indoor AQI depends on micro-meteorology, building air exchange rates (ACH), and requires a physical indoor air quality sensor.
        </p>
      </div>
    </div>
  );
};
