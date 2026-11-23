import React, { useState, useEffect, useCallback } from 'react';
import { UsersRound, Trophy, Flag, Plus, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useLocation } from '../../context/hooks';
import type { Community, CommunityChallenge, CommunityReport } from '../../types';
import confetti from 'canvas-confetti';

export const CommunityView: React.FC = () => {
  const { currentCity, currentLat, currentLon } = useLocation();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Challenge completion modal
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Report concern modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('waste_burning');
  const [reportDesc, setReportDesc] = useState('');
  const [reportAddress, setReportAddress] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Create community modal
  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [commCategory, setCommCategory] = useState('neighborhood');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [comms, chs, reps] = await Promise.all([
        api.getCommunities(),
        api.getChallenges(),
        api.getCommunityReports(),
      ]);
      setCommunities(comms);
      setChallenges(chs);
      setReports(reps);
    } catch {
      setStatusMessage('Unable to refresh community feed at this moment.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.getCommunities(), api.getChallenges(), api.getCommunityReports()])
      .then(([comms, chs, reps]) => {
        if (!active) return;
        setCommunities(comms);
        setChallenges(chs);
        setReports(reps);
      })
      .catch(() => {
        if (active) setStatusMessage('Unable to refresh community feed at this moment.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleJoinCommunity = async (id: number) => {
    try {
      const res = await api.joinCommunity(id);
      setStatusMessage(res.detail || 'Joined community hub!');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Sign in to join a community coalition.');
    }
  };

  const handleJoinChallenge = async (id: number) => {
    try {
      const res = await api.joinChallenge(id);
      setStatusMessage(res.detail || 'Joined challenge!');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Sign in to join sustainability challenges.');
    }
  };

  const handleCompleteChallenge = async () => {
    if (!activeChallengeId) return;
    try {
      const res = await api.completeChallenge(activeChallengeId, completionNotes);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setStatusMessage(res.detail || 'Challenge completed!');
      setActiveChallengeId(null);
      setCompletionNotes('');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Error completing challenge');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitCommunityReport({
        title: reportTitle,
        report_type: reportType,
        description: reportDesc,
        address: reportAddress || currentCity,
        latitude: currentLat,
        longitude: currentLon,
        is_anonymous: isAnonymous,
      });
      setIsReportModalOpen(false);
      setReportTitle('');
      setReportDesc('');
      setReportAddress('');
      setStatusMessage('Community concern submitted for review. Thank you for acting for cleaner neighborhood air!');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Error submitting report');
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCommunity({
        name: commName,
        city: currentCity,
        description: commDesc,
        category: commCategory,
      });
      setIsCreateCommOpen(false);
      setCommName('');
      setCommDesc('');
      setStatusMessage('Neighborhood coalition established!');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Error creating community');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
            <UsersRound className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Community Action Network</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Neighborhood collective action: join sustainability challenges, report local smoke concerns, and earn Eco Points
            </p>
          </div>
        </div>

        <div className="flex space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs transition"
          >
            <Flag className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Report Pollution Concern</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateCommOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-900/30 transition"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Start Coalition</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div role="status" className="p-3 rounded-xl bg-teal-950/50 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {isLoading && (
        <div role="status" className="text-xs text-neutral-400 px-2">
          Loading neighborhood coalitions and challenges...
        </div>
      )}

      {/* Community Coalitions Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-base text-white">Active Neighborhood Coalitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    {c.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">{c.members_count} members</span>
                </div>
                <h4 className="font-bold text-base text-white mt-2">{c.name}</h4>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-500">{c.city}</span>
                <button
                  type="button"
                  onClick={() => void handleJoinCommunity(c.id)}
                  className="px-3 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-bold transition"
                >
                  Join Hub
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sustainability Challenges */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <h3 className="font-extrabold text-base text-white">Community Sustainability Challenges</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((ch) => (
            <div key={ch.id} className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">{ch.title}</h4>
                  <span className="text-xs text-teal-400">
                    {ch.duration_days} Day Challenge • {ch.participants_count} Citizens Active
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                  +{ch.points_reward} Points
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">{ch.description}</p>

              <div className="flex items-center space-x-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => void handleJoinChallenge(ch.id)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition"
                >
                  Join Challenge
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChallengeId(ch.id)}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md shadow-teal-900/30"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Reported Pollution Concerns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-rose-400" aria-hidden="true" />
            <h3 className="font-extrabold text-base text-white">Community Pollution Reports (Nearby)</h3>
          </div>
          <span className="text-[11px] text-neutral-500">Citizen Observations (Unverified)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{r.title}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{r.description}</p>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                  <span>{r.address}</span>
                </span>
                <span>Reported by: {r.reported_by}</span>
              </div>
            </div>
          ))}

          {!isLoading && reports.length === 0 && (
            <div className="col-span-full p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-center text-xs text-neutral-500">
              No active neighborhood reports submitted yet.
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 text-white space-y-4">
            <h3 id="report-modal-title" className="text-lg font-bold">
              Report Neighborhood Pollution Concern
            </h3>
            <p className="text-xs text-neutral-400">
              Help identify waste burning, heavy construction dust plumes, or industrial idling.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div>
                <label htmlFor="report-title" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Issue Title
                </label>
                <input
                  id="report-title"
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Open plastic/leaf burning in vacant lot"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="report-type" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Pollution Category
                </label>
                <select
                  id="report-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="waste_burning">Open Waste / Leaf Burning</option>
                  <option value="construction_dust">Uncovered Construction Dust</option>
                  <option value="traffic_idling">Heavy Diesel Vehicle Idling</option>
                  <option value="industrial_emission">Industrial Chimney Smoke</option>
                  <option value="other">Other Environmental Concern</option>
                </select>
              </div>

              <div>
                <label htmlFor="report-desc" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  id="report-desc"
                  required
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describe location details, time of day, and odor intensity..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="report-address" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Street Address / Landmark
                </label>
                <input
                  id="report-address"
                  type="text"
                  required
                  value={reportAddress}
                  onChange={(e) => setReportAddress(e.target.value)}
                  placeholder="e.g. Ring Road Junction, Sector 4"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 bg-neutral-950 border-neutral-700"
                />
                <label htmlFor="anonCheck" className="text-xs text-neutral-300 cursor-pointer">
                  Submit report anonymously
                </label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Challenge Modal */}
      {activeChallengeId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 text-white space-y-4">
            <h3 id="challenge-modal-title" className="text-lg font-bold">
              Complete Sustainability Challenge
            </h3>
            <p className="text-xs text-neutral-400">
              Briefly describe how you completed this challenge to earn verified Eco Points.
            </p>

            <label htmlFor="challenge-notes" className="sr-only">
              Completion notes
            </label>
            <textarea
              id="challenge-notes"
              rows={3}
              required
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Took the metro for 5 days instead of driving my car, avoided approximately 12 kg CO2!"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveChallengeId(null)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCompleteChallenge()}
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Claim Eco Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Community Modal */}
      {isCreateCommOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coalition-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 text-white space-y-4">
            <h3 id="coalition-modal-title" className="text-lg font-bold">
              Start New Neighborhood Coalition
            </h3>

            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <div>
                <label htmlFor="coalition-name" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Coalition Name
                </label>
                <input
                  id="coalition-name"
                  type="text"
                  required
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  placeholder="e.g. South Green Corridor Network"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="coalition-category" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  id="coalition-category"
                  value={commCategory}
                  onChange={(e) => setCommCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                >
                  <option value="neighborhood">Neighborhood Resident Association</option>
                  <option value="school_college">School / College Campus</option>
                  <option value="workplace">Office / Workplace Alliance</option>
                  <option value="environmental_club">Eco Cycling / Environmental Club</option>
                </select>
              </div>

              <div>
                <label htmlFor="coalition-desc" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Mission Description
                </label>
                <textarea
                  id="coalition-desc"
                  required
                  rows={3}
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  placeholder="Describe your coalition's clean air activities..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCommOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Establish Coalition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
