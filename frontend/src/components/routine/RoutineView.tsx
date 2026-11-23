import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck } from 'lucide-react';
import { api } from '../../services/api';
import type { RoutineOut } from '../../types';

function round(num: number, decimals: number) {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}

export const RoutineView: React.FC = () => {
  const [commuteMode, setCommuteMode] = useState('car_petrol');
  const [dailyDistance, setDailyDistance] = useState(16.0);
  const [scheduleType, setScheduleType] = useState('work_standard');
  const [routine, setRoutine] = useState<RoutineOut | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(
    async (overrideMode?: string, overrideDist?: number, overrideSched?: string) => {
      setIsLoading(true);
      try {
        const res = await api.generateRoutine({
          commute_mode: overrideMode ?? commuteMode,
          daily_distance_km: Number(overrideDist ?? dailyDistance),
          schedule_type: overrideSched ?? scheduleType,
        });
        setRoutine(res);
      } catch {
        // Keep current routine view state if API unavailable
      } finally {
        setIsLoading(false);
      }
    },
    [commuteMode, dailyDistance, scheduleType],
  );

  useEffect(() => {
    let active = true;
    async function loadMyRoutine() {
      try {
        const r = await api.getMyRoutine();
        if (!active) return;
        if (r) {
          setRoutine(r);
          setCommuteMode(r.commute_mode);
          setDailyDistance(r.daily_distance_km);
          setScheduleType(r.schedule_type);
        } else {
          await handleGenerate('car_petrol', 16.0, 'work_standard');
        }
      } catch {
        if (active) {
          await handleGenerate('car_petrol', 16.0, 'work_standard');
        }
      }
    }
    void loadMyRoutine();
    return () => {
      active = false;
    };
  }, [handleGenerate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
          <CalendarCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Low-Emission Daily Routine Generator</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Identify actionable commute &amp; lifestyle shifts supported by documented emission factors
          </p>
        </div>
      </div>

      {/* Routine Configuration Form */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="routine-commute-mode" className="block text-xs font-semibold text-neutral-300 mb-1">
              Current Commute Method
            </label>
            <select
              id="routine-commute-mode"
              value={commuteMode}
              onChange={(e) => setCommuteMode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="car_petrol">Individual Petrol Car</option>
              <option value="car_diesel">Individual Diesel Car</option>
              <option value="two_wheeler">Petrol Motorbike / Scooter</option>
              <option value="bus">Public City Bus</option>
              <option value="metro">Electric Metro Rail</option>
              <option value="bicycle">Bicycle</option>
              <option value="walk">Walking</option>
            </select>
          </div>

          <div>
            <label htmlFor="routine-distance" className="block text-xs font-semibold text-neutral-300 mb-1">
              Daily Roundtrip Distance (km)
            </label>
            <input
              id="routine-distance"
              type="number"
              min={1}
              max={150}
              step={0.5}
              value={dailyDistance}
              onChange={(e) => setDailyDistance(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />
          </div>

          <div>
            <label htmlFor="routine-schedule" className="block text-xs font-semibold text-neutral-300 mb-1">
              Schedule Architecture
            </label>
            <select
              id="routine-schedule"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="work_standard">Standard Office (9am - 6pm)</option>
              <option value="college">University / College Student</option>
              <option value="flexible">Flexible / Remote Hybrid</option>
              <option value="night_shift">Late Evening / Night Shift</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition shadow-lg shadow-teal-900/40"
        >
          {isLoading ? 'Computing Emission Avoidance Matrices...' : 'Generate Low-Emission Alternatives'}
        </button>
      </div>

      {/* Routine Output */}
      {routine && (
        <div className="space-y-6">
          {/* Current Footprint Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Current Daily CO2 Footprint</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {routine.estimated_daily_co2_kg} <span className="text-xs font-normal text-neutral-500">kg CO2/day</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Current Daily PM2.5 Direct Tailpipe</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {routine.estimated_daily_pm25_g} <span className="text-xs font-normal text-neutral-500">g PM2.5/day</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Annual Projected Emissions</span>
              <div className="text-2xl font-black text-white mt-1">
                {round((routine.estimated_daily_co2_kg * 260) / 1000, 2)}{' '}
                <span className="text-xs font-normal text-neutral-500">metric tons</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Action Potential</span>
              <div className="text-2xl font-black text-teal-400 mt-1">3 High-Impact Shifts</div>
            </div>
          </div>

          {/* Sustainable Alternatives Cards */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-white">Recommended Sustainable Alternatives</h3>

            {routine.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400 font-bold text-xs">
                      Shift #{idx + 1}
                    </span>
                    <h4 className="font-bold text-base text-white">{alt.recommended_alternative}</h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 self-start sm:self-auto font-medium">
                    Difficulty: {alt.practical_difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <span className="text-xs text-neutral-400 block mb-1">Financial Impact</span>
                    <span className="text-base font-black text-emerald-400">{alt.cost_difference_monthly}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <span className="text-xs text-neutral-400 block mb-1">CO2 Emissions Avoided</span>
                    <span className="text-base font-black text-teal-300">
                      {alt.emissions_avoided_kg_co2_monthly} kg CO2/month
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <span className="text-xs text-neutral-400 block mb-1">PM2.5 Avoided</span>
                    <span className="text-base font-black text-sky-300">
                      {alt.pm25_avoided_g_monthly} g PM2.5/month
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-300 space-y-1">
                  <p>
                    <strong>Long-Term Benefit:</strong> {alt.long_term_benefit}
                  </p>
                  <p className="text-neutral-500 font-mono text-[11px]">
                    <strong>Calculation Assumptions:</strong> {alt.calculation_assumptions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
