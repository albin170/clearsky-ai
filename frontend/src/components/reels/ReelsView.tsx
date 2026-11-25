import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Plus, Video, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import type { Reel, ReelComment } from '../../types';
import { FALLBACK_REELS } from '../../data/fallbackReels';
import { ReelPlayerCard } from './ReelPlayerCard';
import { ReelDownloadModal } from './ReelDownloadModal';
import { ReelCommentsModal } from './ReelCommentsModal';
import { ReelCreateModal, type NewReelFormInput } from './ReelCreateModal';

interface ReelsViewProps {
  onNavigateTab?: (tab: string) => void;
}

const REEL_CATEGORY_FILTERS = [
  { id: 'all', label: 'All Reels' },
  { id: 'smog_alert', label: 'Smog Alerts' },
  { id: 'health', label: 'Health & Lungs' },
  { id: 'home_hacks', label: 'Home Hacks' },
  { id: 'stubble_fire', label: 'Parali Stubble' },
  { id: 'tech', label: 'Masks & CADR' },
] as const;

export const ReelsView: React.FC<ReelsViewProps> = ({ onNavigateTab }) => {
  const [reels, setReels] = useState<Reel[]>(FALLBACK_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const currentReel = reels[currentIndex] || FALLBACK_REELS[0];

  const handleNext = useCallback(() => {
    setIsPlaying(true);
    setVideoProgress(0);
    setCurrentIndex((prev) => (prev < reels.length - 1 ? prev + 1 : 0));
  }, [reels.length]);

  const handlePrev = useCallback(() => {
    setIsPlaying(true);
    setVideoProgress(0);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reels.length - 1));
  }, [reels.length]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        if (audioRef.current && !isMuted) {
          audioRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      setShowPlayOverlay(true);
      setTimeout(() => setShowPlayOverlay(false), 800);
    }
  }, [isMuted]);

  useEffect(() => {
    let active = true;
    api
      .getReels(activeCategory)
      .then((data) => {
        if (active && data && data.length > 0) {
          setReels(data);
          setCurrentIndex(0);
          setVideoProgress(0);
        }
      })
      .catch(() => {
        if (!active) return;
        setReels(
          activeCategory === 'all' ? FALLBACK_REELS : FALLBACK_REELS.filter((r) => r.category === activeCategory),
        );
        setCurrentIndex(0);
        setVideoProgress(0);
      });
    return () => {
      active = false;
    };
  }, [activeCategory]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.muted = isMuted;
      if (!isMuted && isPlaying) {
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, currentReel.video_url, currentReel.audio_url, isMuted, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
    if (!isMuted && isPlaying) {
      audioRef.current.volume = 0.7;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isMuted, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isCreateModalOpen || isDownloadModalOpen) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) && e.key === ' ') {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') handleNext();
      if (e.key === 'ArrowUp' || e.key === 'k') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommentsOpen, isCreateModalOpen, isDownloadModalOpen, handleNext, handlePrev, togglePlayPause]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    touchStartY.current = null;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLike = async () => {
    const newLiked = !currentReel.is_liked;
    const newCount = newLiked ? currentReel.likes_count + 1 : Math.max(0, currentReel.likes_count - 1);
    setReels((prev) =>
      prev.map((r, i) => (i === currentIndex ? { ...r, is_liked: newLiked, likes_count: newCount } : r)),
    );
    if (newLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    }
    try {
      await api.toggleReelLike(currentReel.id);
    } catch {
      // Optimistic state retained
    }
  };

  const handleCardTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      if (!currentReel.is_liked) {
        void handleLike();
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
    } else {
      singleTapTimeoutRef.current = setTimeout(() => {
        togglePlayPause();
      }, 300);
    }
    lastTapRef.current = now;
  };

  const handleSave = async () => {
    const newSaved = !currentReel.is_saved;
    setReels((prev) => prev.map((r, i) => (i === currentIndex ? { ...r, is_saved: newSaved } : r)));
    showToast(newSaved ? 'Saved to your Eco Reel collection!' : 'Removed from saved collection');
    try {
      await api.toggleReelSave(currentReel.id);
    } catch {
      // Optimistic state retained
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentReel.title,
      text: `${currentReel.title} — ${currentReel.key_takeaway} (ClearSky AI)`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Native share canceled
      }
    } else {
      await navigator.clipboard.writeText(`${currentReel.title}: ${window.location.href}`);
      showToast('Reel video link copied to clipboard!');
    }
  };

  const handlePostComment = async (textToSubmit: string) => {
    const newComment: ReelComment = {
      id: `c_${Date.now()}`,
      author: 'You',
      handle: '@eco_citizen',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      text: textToSubmit,
      likes: 0,
      timestamp: 'Just now',
    };
    setReels((prev) =>
      prev.map((r, i) =>
        i === currentIndex
          ? { ...r, comments: [newComment, ...r.comments], comments_count: r.comments_count + 1 }
          : r,
      ),
    );
    showToast('Comment posted!');
    try {
      await api.addReelComment(currentReel.id, textToSubmit);
    } catch {
      // Optimistic comment retained
    }
  };

  const handleCreateReel = async (input: NewReelFormInput) => {
    const created: Reel = {
      id: `reel-${Date.now()}`,
      title: input.title.trim(),
      caption: input.caption.trim(),
      tags: input.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`)),
      category: input.category,
      creator_name: 'You (Eco Warrior)',
      creator_handle: '@you_air_hero',
      creator_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      creator_verified: false,
      audio_title: 'Original Community Audio Track',
      audio_artist: 'Community Voice • Trending',
      aqi_badge: 'Community Intel',
      likes_count: 1,
      comments_count: 0,
      shares_count: 0,
      views_count: 1,
      is_liked: true,
      is_saved: false,
      video_url: input.videoUrl,
      audio_url: input.audioUrl,
      theme_gradient: 'from-teal-950 via-slate-900 to-neutral-950',
      visual_type: 'inversion_layer',
      key_takeaway: input.takeaway.trim() || 'Protect respiratory health with continuous real-time monitoring.',
      action_cta: { label: 'Explore Platform', tab: 'dashboard' },
      comments: [],
    };

    setReels((prev) => [created, ...prev]);
    setCurrentIndex(0);
    setIsCreateModalOpen(false);
    showToast('Your Eco Reel Video is now live!');
    try {
      await api.createReel(created);
    } catch {
      // Optimistic reel preserved
    }
  };

  const toggleFollow = (handle: string) => {
    setFollowingMap((prev) => {
      const next = !prev[handle];
      showToast(next ? `Following ${handle}` : `Unfollowed ${handle}`);
      return { ...prev, [handle]: next };
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start max-w-4xl mx-auto px-2 sm:px-4 py-2 space-y-4">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 z-50 px-4 py-2 rounded-xl bg-teal-500 text-neutral-950 font-bold text-xs shadow-2xl"
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
            <Video className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-2">
              <span>EcoReels Videos &amp; MP3 Tracks</span>
              <span className="text-[10px] uppercase font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                MP4 + MP3 Sync
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400">
              Looping environmental awareness shorts with synchronized MP3 audio, captions &amp; direct downloads
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            aria-pressed={!isMuted}
            aria-label={isMuted ? 'Unmute MP3 Audio Track' : 'Mute Audio Track'}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border transition text-xs font-bold ${
              isMuted
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                : 'bg-teal-600/20 border-teal-500/50 text-teal-300'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-400" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
            )}
            <span>{isMuted ? 'Sound: Muted' : 'MP3 Sound: ON'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <span>Download MP4 / MP3</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Post Reel</span>
          </button>
        </div>
      </div>

      {/* Category Filter Group */}
      <div
        className="w-full flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs"
        role="group"
        aria-label="Filter EcoReels by Category"
      >
        {REEL_CATEGORY_FILTERS.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            aria-pressed={activeCategory === cat.id}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition text-[11px] ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Viewer */}
      <div className="relative w-full max-w-[420px] flex items-center justify-center">
        <div className="hidden lg:flex flex-col space-y-3 absolute -right-16 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Reel"
            className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white hover:bg-neutral-800 transition shadow-xl"
          >
            <ChevronUp className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="text-center font-mono text-xs text-neutral-400 font-bold" aria-live="polite">
            {currentIndex + 1} / {reels.length}
          </div>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Reel"
            className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white hover:bg-neutral-800 transition shadow-xl"
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <ReelPlayerCard
          currentReel={currentReel}
          reelsCount={reels.length}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          isMuted={isMuted}
          showPlayOverlay={showPlayOverlay}
          showHeartBurst={showHeartBurst}
          videoProgress={videoProgress}
          isFollowing={Boolean(followingMap[currentReel.creator_handle])}
          videoRef={videoRef}
          audioRef={audioRef}
          onCardTap={handleCardTap}
          onTogglePlayPause={togglePlayPause}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTimeUpdate={handleTimeUpdate}
          onLike={() => void handleLike()}
          onSave={() => void handleSave()}
          onShare={() => void handleShare()}
          onOpenComments={() => setIsCommentsOpen(true)}
          onOpenDownload={() => setIsDownloadModalOpen(true)}
          onToggleFollow={toggleFollow}
          onNavigateTab={onNavigateTab}
        />
      </div>

      <ReelDownloadModal
        isOpen={isDownloadModalOpen}
        currentReel={currentReel}
        onClose={() => setIsDownloadModalOpen(false)}
        onShowToast={showToast}
      />

      <ReelCommentsModal
        isOpen={isCommentsOpen}
        currentReel={currentReel}
        onClose={() => setIsCommentsOpen(false)}
        onSubmitComment={handlePostComment}
      />

      <ReelCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateReel={handleCreateReel}
      />
    </div>
  );
};
