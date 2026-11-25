import React, { useCallback, useEffect, useState } from 'react';
import { Award, History, Info, Plus, Sliders } from 'lucide-react';
import { api } from '../../services/api';
import type { ImpactSummary, WhatIfResponse } from '../../types';
import { ModalDialog } from '../common/ModalDialog';

export const ImpactView: React.FC = () => {
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResponse | null>(null);
  const [families, setFamilies] = useState(150);
  const [commuteKm, setCommuteKm] = useState(15.0);
  const [shiftMode, setShiftMode] = useState('car_to_metro');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [activityType, setActivityType] = useState('public_transit_used');
  const [unitsCount, setUnitsCount] = useState(15.0);

  const loadSummary = useCallback(async () => {
    try {
      const s = await api.getImpactSummary();
      setSummary(s);
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api
      .getImpactSummary()
      .then((s) => {
        if (active) setSummary(s);
      })
      .catch(() => {
        if (active) setSummary(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api
      .runWhatIfSimulation(families, commuteKm, shiftMode)
      .then((res) => {
        if (active) setWhatIfResult(res);
      })
      .catch(() => {
        if (active) setWhatIfResult(null);
      });
    return () => {
      active = false;
    };
  }, [families, commuteKm, shiftMode]);

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logImpactActivity({
        activity_type: activityType,
        units_count: Number(unitsCount),
      });
      setIsLogOpen(false);
      await loadSummary();
      setStatusMessage('Activity successfully logged! Eco Score updated.');
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Sign in to log personal clean-air activities.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
            <Award className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl font-extrabold text-white">Environmental Impact Dashboard</h1>
              {summary && (
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${summary.is_demo_data
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                >
                  {summary.is_demo_data ? 'Sample Baseline Preview' : 'Verified Personal Logs'}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Measurable emissions avoided through recorded sustainable mobility and household decisions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLogOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-lg shadow-teal-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Log Clean-Air Action</span>
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

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
            <span className="text-xs text-neutral-400 block mb-1">CO2 Avoided</span>
            <div className="text-2xl sm:text-3xl font-black text-teal-300">
              {summary.total_co2_avoided_kg} <span className="text-xs font-normal text-neutral-400">kg</span>
            </div>
            <span className="text-[10px] text-teal-400 mt-1 block">
              {summary.is_demo_data ? 'Illustrative starter baseline' : 'Recorded tailpipe reduction'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
            <span className="text-xs text-neutral-400 block mb-1">PM2.5 Prevented</span>
            <div className="text-2xl sm:text-3xl font-black text-sky-300">
              {summary.total_pm25_avoided_g} <span className="text-xs font-normal text-neutral-400">g</span>
            </div>
            <span className="text-[10px] text-sky-400 mt-1 block">Fine combustion soot</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
            <span className="text-xs text-neutral-400 block mb-1">Fuel Conserved</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {summary.total_fuel_saved_liters} <span className="text-xs font-normal text-neutral-400">liters</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">Petrol &amp; diesel saved</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
            <span className="text-xs text-neutral-400 block mb-1">Cost Savings</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              ₹{summary.total_money_saved_estimate.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400 mt-1 block">Household transport savings</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-neutral-900 border border-teal-500/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-teal-300 font-bold block mb-1">Family Eco Score</span>
            <div className="text-3xl font-black text-white">
              {summary.eco_score}
              <span className="text-xs font-normal text-neutral-400">/100</span>
            </div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">
              {summary.eco_score >= 80 ? 'Grade A: Clean-Air Champion' : 'Grade B: Active Contributor'}
            </span>
          </div>
        </div>
      )}

      {summary && summary.daily_history.length > 0 && (
        <section aria-labelledby="impact-history-heading" className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-teal-400" aria-hidden="true" />
              <h2 id="impact-history-heading" className="font-extrabold text-base text-white">
                {summary.is_demo_data ? 'Sample Clean-Air Activity Breakdown' : 'Recent Recorded Clean-Air Actions'}
              </h2>
            </div>
            <span className="text-xs text-neutral-400">{summary.activities_completed_count} actions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="pb-2">Activity</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">CO2 Saved</th>
                  <th className="pb-2">PM2.5 Avoided</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {summary.daily_history.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-semibold text-white">{item.activity}</td>
                    <td className="py-2.5">{item.units}</td>
                    <td className="py-2.5 text-teal-300">{item.co2_saved_kg} kg</td>
                    <td className="py-2.5 text-sky-300">{item.pm25_avoided_g} g</td>
                    <td className="py-2.5 text-right font-mono text-neutral-400">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* What-If Environmental Simulator */}
      <section aria-labelledby="what-if-heading" className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h2 id="what-if-heading" className="font-extrabold text-base text-white">
              What-If Environmental Simulator
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Model hypothetical collective lifestyle shifts at neighborhood scale
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-2">
              <label htmlFor="whatif-families">Participating Families</label>
              <span className="text-teal-400 font-bold">{families} households</span>
            </div>
            <input
              id="whatif-families"
              type="range"
              min={10}
              max={2000}
              step={10}
              value={families}
              onChange={(e) => setFamilies(Number(e.target.value))}
              className="w-full h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-2">
              <label htmlFor="whatif-commute">Average Daily Commute</label>
              <span className="text-teal-400 font-bold">{commuteKm} km</span>
            </div>
            <input
              id="whatif-commute"
              type="range"
              min={5}
              max={50}
              step={1}
              value={commuteKm}
              onChange={(e) => setCommuteKm(Number(e.target.value))}
              className="w-full h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <label htmlFor="whatif-shift-mode" className="block text-xs font-semibold text-neutral-300 mb-2">
              Simulated Lifestyle Shift
            </label>
            <select
              id="whatif-shift-mode"
              value={shiftMode}
              onChange={(e) => setShiftMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="car_to_metro">Petrol Cars → Electric Metro Transit</option>
              <option value="car_to_bus">Petrol Cars → Public City Bus</option>
              <option value="car_to_cycling">Short Trips → Bicycle Active Transit</option>
              <option value="zero_waste_burning">Zero Garden &amp; Waste Burning (Composting)</option>
              <option value="energy_conservation">Household Energy Efficiency (-3 kWh/day)</option>
            </select>
          </div>
        </div>

        {whatIfResult && (
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <h3 className="font-bold text-sm text-white">Projected Annual Community Environmental Savings:</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Annual CO2 Diverted</span>
                <span className="text-xl font-black text-teal-300">{whatIfResult.annual_co2_avoided_tons} tons</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Annual PM2.5 Prevented</span>
                <span className="text-xl font-black text-sky-300">{whatIfResult.annual_pm25_avoided_kg} kg</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Annual Fuel Saved</span>
                <span className="text-xl font-black text-emerald-400">
                  {whatIfResult.annual_fuel_saved_liters.toLocaleString()} L
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Community Savings</span>
                <span className="text-xl font-black text-amber-300">
                  ₹{whatIfResult.annual_community_cost_savings.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-neutral-800">
              <strong>Assumptions Explained:</strong> {whatIfResult.assumptions_explained}
            </p>
          </div>
        )}
      </section>

      <ModalDialog isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} titleId="impact-log-modal-title">
        <div className="space-y-4">
          <h2 id="impact-log-modal-title" className="text-lg font-bold text-white">
            Log Sustainable Action
          </h2>

          <form onSubmit={(e) => void handleLogActivity(e)} className="space-y-3">
            <div>
              <label htmlFor="impact-activity-type" className="block text-xs font-semibold text-neutral-300 mb-1">
                Activity Type
              </label>
              <select
                id="impact-activity-type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
              >
                <option value="public_transit_used">Public Transit / Metro Used (km)</option>
                <option value="cycling_trip">Active Cycling Trip (km)</option>
                <option value="walking_trip">Walking Trip (km)</option>
                <option value="carpooling">Carpooling with Neighbors (km)</option>
                <option value="energy_saved">Household Energy Saved (kWh)</option>
                <option value="no_waste_burning">Composted Garden Waste (kg)</option>
              </select>
            </div>

            <div>
              <label htmlFor="impact-units-count" className="block text-xs font-semibold text-neutral-300 mb-1">
                Quantity (km / kWh / kg)
              </label>
              <input
                id="impact-units-count"
                type="number"
                required
                min={0.5}
                max={10000}
                step={0.5}
                value={unitsCount}
                onChange={(e) => setUnitsCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogOpen(false)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Confirm &amp; Calculate
              </button>
            </div>
          </form>
        </div>
      </ModalDialog>

      {summary && (
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 space-y-1">
          <span className="font-bold text-neutral-300 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
            <span>Calculation Methodology &amp; Transparency Note</span>
          </span>
          <p className="leading-relaxed">{summary.methodology_note}</p>
        </div>
      )}
    </div>
  );
};
