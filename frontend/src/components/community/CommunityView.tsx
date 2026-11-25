import React, { useCallback, useEffect, useState } from 'react';
import { Flag, MapPin, Plus, Trophy, UsersRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useLocation } from '../../context/hooks';
import type {
  Community,
  CommunityChallenge,
  CommunityCreateInput,
  CommunityReport,
  CommunityReportCreateInput,
} from '../../types';
import { CompleteChallengeModal, CreateCoalitionModal, ReportConcernModal } from './CommunityModals';

export const CommunityView: React.FC = () => {
  const { currentCity, currentLat, currentLon } = useLocation();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);

  const fetchCommunityBundle = useCallback(
    () => Promise.all([api.getCommunities(), api.getChallenges(), api.getCommunityReports()]),
    [],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [comms, chs, reps] = await fetchCommunityBundle();
      setCommunities(comms);
      setChallenges(chs);
      setReports(reps);
    } catch {
      setStatusMessage('Unable to refresh community feed at this moment.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCommunityBundle]);

  useEffect(() => {
    let active = true;
    fetchCommunityBundle()
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
  }, [fetchCommunityBundle]);

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

  const handleCompleteChallenge = async (challengeId: number, notes: string) => {
    try {
      const res = await api.completeChallenge(challengeId, notes);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setStatusMessage(res.detail || 'Challenge completed!');
      setActiveChallengeId(null);
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Error completing challenge');
    }
  };

  const handleSubmitReport = async (data: CommunityReportCreateInput) => {
    try {
      await api.submitCommunityReport(data);
      setIsReportModalOpen(false);
      setStatusMessage('Community concern submitted for review. Thank you for acting for cleaner neighborhood air!');
      await loadData();
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Error submitting report');
    }
  };

  const handleCreateCommunity = async (data: CommunityCreateInput) => {
    try {
      await api.createCommunity(data);
      setIsCreateCommOpen(false);
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
            <h1 className="text-xl font-extrabold text-white">Community Action Network</h1>
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

      {isLoading && (
        <div role="status" aria-live="polite" className="text-xs text-neutral-400 px-2">
          Loading neighborhood coalitions and challenges...
        </div>
      )}

      {/* Community Coalitions Grid */}
      <section aria-labelledby="coalitions-heading" className="space-y-3">
        <h2 id="coalitions-heading" className="font-extrabold text-base text-white">
          Active Neighborhood Coalitions
        </h2>
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
                <h3 className="font-bold text-base text-white mt-2">{c.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">{c.city}</span>
                <button
                  type="button"
                  onClick={() => void handleJoinCommunity(c.id)}
                  className="px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-bold transition"
                >
                  Join Hub
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Sustainability Challenges */}
      <section aria-labelledby="challenges-heading" className="space-y-3">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <h2 id="challenges-heading" className="font-extrabold text-base text-white">
            Community Sustainability Challenges
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((ch) => (
            <div key={ch.id} className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{ch.title}</h3>
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
      </section>

      {/* Community Reported Pollution Concerns */}
      <section aria-labelledby="reports-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-rose-400" aria-hidden="true" />
            <h2 id="reports-heading" className="font-extrabold text-base text-white">
              Community Pollution Reports (Nearby)
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400">Citizen Observations (Unverified)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">{r.title}</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{r.description}</p>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-900">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                  <span>{r.address}</span>
                </span>
                <span>Reported by: {r.reported_by}</span>
              </div>
            </div>
          ))}

          {!isLoading && reports.length === 0 && (
            <div className="col-span-full p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-center text-xs text-neutral-400">
              No active neighborhood reports submitted yet.
            </div>
          )}
        </div>
      </section>

      <ReportConcernModal
        isOpen={isReportModalOpen}
        currentCity={currentCity}
        currentLat={currentLat}
        currentLon={currentLon}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
      />

      <CompleteChallengeModal
        challengeId={activeChallengeId}
        onClose={() => setActiveChallengeId(null)}
        onComplete={handleCompleteChallenge}
      />

      <CreateCoalitionModal
        isOpen={isCreateCommOpen}
        currentCity={currentCity}
        onClose={() => setIsCreateCommOpen(false)}
        onCreate={handleCreateCommunity}
      />
    </div>
  );
};
