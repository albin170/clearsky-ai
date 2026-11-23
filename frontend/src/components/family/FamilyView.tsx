import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2, CalendarCheck, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useLocation } from '../../context/hooks';
import type { FamilyMember, FamilyDailyPlanResponse } from '../../types';

export const FamilyView: React.FC = () => {
  const { currentCity, currentLat, currentLon } = useLocation();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [dailyPlan, setDailyPlan] = useState<FamilyDailyPlanResponse | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('child');
  const [ageGroup, setAgeGroup] = useState('child');
  const [sensitivityProfile, setSensitivityProfile] = useState('respiratory_sensitive');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mems, plan] = await Promise.all([
        api.getFamilyMembers(),
        api.getFamilyDailyPlan(currentLat, currentLon, currentCity).catch(() => null),
      ]);
      setMembers(mems);
      setDailyPlan(plan);
    } finally {
      setIsLoading(false);
    }
  }, [currentCity, currentLat, currentLon]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getFamilyMembers(),
      api.getFamilyDailyPlan(currentLat, currentLon, currentCity).catch(() => null),
    ])
      .then(([mems, plan]) => {
        if (!active) return;
        setMembers(mems);
        setDailyPlan(plan);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentCity, currentLat, currentLon]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.addFamilyMember({
        name: name.trim(),
        relation,
        age_group: ageGroup,
        sensitivity_profile: sensitivityProfile,
      });
      setName('');
      setIsAddOpen(false);
      setStatusMessage('Family member profile added.');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Sign in to save household member profiles.');
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await api.deleteFamilyMember(id);
      setStatusMessage('Family member profile removed.');
      await loadData();
    } catch {
      setStatusMessage('Could not remove family member profile.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Family Lifestyle Intelligence</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personalized exposure mitigation routines tailored to your household&apos;s unique sensitivities
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-lg shadow-teal-900/30 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span>Add Family Member</span>
        </button>
      </div>

      {statusMessage && (
        <div role="status" className="p-3 rounded-xl bg-teal-950/50 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="family-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 text-white space-y-4">
            <h3 id="family-modal-title" className="text-lg font-bold">
              Add Household Profile
            </h3>
            <p className="text-xs text-neutral-400">
              Profiles help customize outdoor windows and mask recommendations without storing sensitive health data.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label htmlFor="family-member-name" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Name
                </label>
                <input
                  id="family-member-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diya, Grandmother, Aarav"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="family-member-relation" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Relation
                </label>
                <select
                  id="family-member-relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="child">Child</option>
                  <option value="elderly">Elderly / Parent</option>
                  <option value="spouse">Spouse</option>
                  <option value="self">Self</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="family-member-age" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Age Group
                </label>
                <select
                  id="family-member-age"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="infant">Infant (&lt;2 years)</option>
                  <option value="child">School Child (2-12 years)</option>
                  <option value="teen">Teenager (13-19 years)</option>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior Citizen (60+ years)</option>
                </select>
              </div>

              <div>
                <label htmlFor="family-member-sensitivity" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Sensitivity Profile
                </label>
                <select
                  id="family-member-sensitivity"
                  value={sensitivityProfile}
                  onChange={(e) => setSensitivityProfile(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="standard">Standard Sensitivity</option>
                  <option value="respiratory_sensitive">Respiratory Sensitivity (Asthma / Bronchitis)</option>
                  <option value="cardiovascular_sensitive">Cardiovascular Sensitivity</option>
                  <option value="outdoor_athlete">Outdoor Exerciser / Athlete</option>
                  <option value="outdoor_worker">Outdoor Daily Worker</option>
                  <option value="student">Daily Student Commuter</option>
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div role="status" className="p-4 text-xs text-neutral-400">
          Loading household exposure profiles...
        </div>
      )}

      {/* Household Members List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between shadow-sm"
          >
            <div>
              <div className="font-bold text-sm text-white">{m.name}</div>
              <div className="text-xs text-teal-400 capitalize">
                {m.relation} • {m.age_group}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{m.sensitivity_profile.replace('_', ' ')}</div>
            </div>
            <button
              type="button"
              onClick={() => void handleDeleteMember(m.id)}
              className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg transition"
              title="Delete member"
              aria-label={`Remove family member ${m.name}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ))}

        {!isLoading && members.length === 0 && (
          <div className="col-span-full p-4 rounded-xl bg-neutral-950/60 border border-dashed border-neutral-800 text-center text-xs text-neutral-400">
            No specific family members added yet. Sign in and add profiles above to generate member-specific guidance.
          </div>
        )}
      </div>

      {/* Generated Daily Family Plan */}
      {dailyPlan && (
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-teal-400" aria-hidden="true" />
                <h3 className="font-extrabold text-base text-white">Today&apos;s Family Action Roadmap</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{dailyPlan.overview}</p>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 self-start sm:self-auto">
              Current AQI Context: {dailyPlan.aqi_context} ({dailyPlan.aqi_category})
            </div>
          </div>

          <div className="space-y-4">
            {dailyPlan.activities.map((act, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 text-xs font-extrabold uppercase">
                      {act.period}
                    </span>
                    <span className="text-xs font-bold text-neutral-300">
                      Target: <span className="text-white">{act.target_member}</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">Source: {act.source}</span>
                </div>

                <div className="text-sm font-semibold text-white leading-snug">{act.recommendation}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-400 pt-2 border-t border-neutral-800/60">
                  <div>
                    <span className="font-bold text-neutral-300 block mb-0.5">Atmospheric Reason:</span>
                    {act.reason}
                  </div>
                  <div>
                    <span className="font-bold text-teal-300 block mb-0.5">Health &amp; Respiratory Benefit:</span>
                    {act.expected_benefit}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] text-neutral-500 gap-2">
                  <span className="flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>
                      Estimated Cost: <strong className="text-neutral-300">{act.estimated_cost}</strong>
                    </span>
                  </span>
                  <span>
                    Difficulty: <strong className="text-neutral-300">{act.difficulty}</strong>
                  </span>
                  <span className="text-emerald-400">Impact: {act.environmental_impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
