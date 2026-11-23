import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Sparkles,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Plus,
  X,
  Send,
  Play,
  Pause,
  Video,
  Flame,
  Wind,
  Download,
  ArrowRight,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import type { Reel, ReelComment } from '../../types';
import { FALLBACK_REELS } from '../../data/fallbackReels';

interface ReelsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({ onNavigateTab }) => {
  const [reels, setReels] = useState<Reel[]>(FALLBACK_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // New reel creation state
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState<'smog_alert' | 'health' | 'home_hacks' | 'stubble_fire' | 'tech'>('health');
  const [newTakeaway, setNewTakeaway] = useState('');
  const [newTags, setNewTags] = useState('#CleanAir, #BreatheSafe');
  const [newVideoUrl, setNewVideoUrl] = useState('/videos/outdoor-jogging.mp4');
  const [newAudioUrl, setNewAudioUrl] = useState('/audio/reel-track-1.mp3');

  // Video and Audio element refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Touch swipe and tap refs
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
        videoRef.current.play().catch(() => { });
        if (audioRef.current && !isMuted) {
          audioRef.current.play().catch(() => { });
        }
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
      setShowPlayOverlay(true);
      setTimeout(() => setShowPlayOverlay(false), 800);
    }
  }, [isMuted]);

  // Load reels from API with fallback
  useEffect(() => {
    let active = true;
    async function fetchReels() {
      try {
        const data = await api.getReels(activeCategory);
        if (active && data && data.length > 0) {
          setReels(data);
          setCurrentIndex(0);
          setVideoProgress(0);
        }
      } catch {
        if (!active) return;
        if (activeCategory === 'all') {
          setReels(FALLBACK_REELS);
        } else {
          setReels(FALLBACK_REELS.filter((r) => r.category === activeCategory));
        }
        setCurrentIndex(0);
        setVideoProgress(0);
      }
    }
    void fetchReels();
    return () => {
      active = false;
    };
  }, [activeCategory]);

  // Video & Audio play/pause sync on reel change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => { });
      }
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.muted = isMuted;
      if (!isMuted && isPlaying) {
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(() => { });
      }
    }
  }, [currentIndex, currentReel.video_url, currentReel.audio_url, isMuted, isPlaying]);

  // Audio volume and mute sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted && isPlaying) {
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(() => { });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted, isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCommentsOpen(false);
        setIsCreateModalOpen(false);
        setIsDownloadModalOpen(false);
        return;
      }
      if (isCommentsOpen || isCreateModalOpen || isDownloadModalOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'j') handleNext();
      if (e.key === 'ArrowUp' || e.key === 'k') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommentsOpen,
    isCreateModalOpen,
    isDownloadModalOpen,
    handleNext,
    handlePrev,
    togglePlayPause,
  ]);

  // Touch handlers for vertical reel swipe
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
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(pct);
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
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
      });
    }

    try {
      await api.toggleReelLike(currentReel.id);
    } catch {
      // Optimistic state already updated
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
      // Optimistic state already updated
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
        // User canceled native share sheet
      }
    } else {
      await navigator.clipboard.writeText(`${currentReel.title}: ${window.location.href}`);
      showToast('Reel video link copied to clipboard! 📋');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: ReelComment = {
      id: `c_${Date.now()}`,
      author: 'You',
      handle: '@eco_citizen',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      text: commentText.trim(),
      likes: 0,
      timestamp: 'Just now',
    };

    setReels((prev) =>
      prev.map((r, i) =>
        i === currentIndex
          ? {
            ...r,
            comments: [newComment, ...r.comments],
            comments_count: r.comments_count + 1,
          }
          : r,
      ),
    );

    const textToSubmit = commentText.trim();
    setCommentText('');
    showToast('Comment posted!');

    try {
      await api.addReelComment(currentReel.id, textToSubmit);
    } catch {
      // Optimistic comment remains displayed locally
    }
  };

  const toggleFollow = (handle: string) => {
    setFollowingMap((prev) => {
      const isFollowing = !prev[handle];
      showToast(isFollowing ? `Following ${handle}` : `Unfollowed ${handle}`);
      return { ...prev, [handle]: isFollowing };
    });
  };

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCaption.trim()) return;

    const created: Reel = {
      id: `reel-${Date.now()}`,
      title: newTitle.trim(),
      caption: newCaption.trim(),
      tags: newTags.split(',').map((t) => (t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`)),
      category: newCategory,
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
      video_url: newVideoUrl,
      audio_url: newAudioUrl,
      theme_gradient: 'from-teal-950 via-slate-900 to-neutral-950',
      visual_type: 'inversion_layer',
      key_takeaway: newTakeaway.trim() || 'Protect respiratory health with continuous real-time monitoring.',
      action_cta: {
        label: 'Explore Platform',
        tab: 'dashboard',
      },
      comments: [],
    };

    setReels((prev) => [created, ...prev]);
    setCurrentIndex(0);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewCaption('');
    setNewTakeaway('');
    showToast('Your Eco Reel Video is now live!');

    try {
      await api.createReel(created);
    } catch {
      // Optimistic reel preserved in session
    }
  };

  const renderVisualBadge = (type: string) => {
    switch (type) {
      case 'inversion_layer':
        return (
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-amber-300 bg-black/70 border border-amber-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" aria-hidden="true" />
            <span>Thermal Inversion Active (0-90m Ceiling)</span>
          </div>
        );
      case 'mask_microscope':
        return (
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-cyan-300 bg-black/70 border border-cyan-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            <span>🔬 500x Microscope: N95 vs Cloth Pores</span>
          </div>
        );
      case 'nasa_plants':
        return (
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-emerald-300 bg-black/70 border border-emerald-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            <span>🌿 NASA Clean Air Bio-Scrubbing</span>
          </div>
        );
      case 'purifier_cadr':
        return (
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-blue-300 bg-black/70 border border-blue-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            <Wind className="w-3 h-3 text-blue-400 animate-spin" aria-hidden="true" />
            <span>Turbo CADR: 450 m³/h Turnover</span>
          </div>
        );
      case 'stubble_satellite':
        return (
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-orange-300 bg-black/70 border border-orange-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            <span>🛰️ Satellite Plume: NW Wind Vector</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start max-w-4xl mx-auto px-2 sm:px-4 py-2 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 z-50 px-4 py-2 rounded-xl bg-teal-500 text-neutral-950 font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {toastMessage}
        </div>
      )}

      {/* Header and Category Filters */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
            <Video className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-2">
              <span>EcoReels Videos &amp; MP3 Tracks</span>
              <span className="text-[10px] uppercase font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>MP4 + MP3 Sync</span>
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400">
              High-impact looping videos with synced MP3 audio soundtracks &amp; direct downloads
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute/Unmute MP3 audio toggle */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            aria-pressed={!isMuted}
            aria-label={isMuted ? 'Unmute MP3 Audio Track' : 'Mute Audio Track'}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border transition text-xs font-bold ${isMuted
                ? 'bg-neutral-800 border-neutral-700 text-neutral-400'
                : 'bg-teal-600/20 border-teal-500/50 text-teal-300'
              }`}
            title={isMuted ? 'Unmute MP3 Audio Track' : 'Mute Audio Track'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-400" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-400 animate-pulse" aria-hidden="true" />
            )}
            <span>{isMuted ? 'Sound: Muted' : 'MP3 Sound: ON'}</span>
          </button>

          {/* Download Media Button */}
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <span>Download MP4 / MP3</span>
          </button>

          {/* Create Reel Button */}
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

      {/* Category Pills */}
      <div className="w-full flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs" role="group" aria-label="Filter EcoReels by Category">
        {[
          { id: 'all', label: 'All Reels' },
          { id: 'smog_alert', label: '🌫️ Smog Alerts' },
          { id: 'health', label: '🫁 Health & Lungs' },
          { id: 'home_hacks', label: '🪴 Home Hacks' },
          { id: 'stubble_fire', label: '🌾 Parali Stubble' },
          { id: 'tech', label: '🔬 Masks & CADR' },
        ].map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            aria-pressed={activeCategory === cat.id}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition text-[11px] ${activeCategory === cat.id
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Reels Viewer (Instagram 9:16 aspect ratio layout) */}
      <div className="relative w-full max-w-[420px] flex items-center justify-center">
        {/* Navigation Arrows for Desktop */}
        <div className="hidden lg:flex flex-col space-y-3 absolute -right-16 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Reel"
            className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white hover:bg-neutral-800 hover:scale-110 transition shadow-xl"
            title="Previous Reel (Up Arrow)"
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
            className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white hover:bg-neutral-800 hover:scale-110 transition shadow-xl"
            title="Next Reel (Down Arrow)"
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Vertical Reel Card */}
        <div
          onClick={handleCardTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label={`EcoReel player: ${currentReel.title}`}
          className="relative w-full aspect-[9/16] max-h-[78vh] rounded-3xl overflow-hidden bg-black border border-neutral-700/60 shadow-2xl select-none flex flex-col justify-between cursor-pointer"
        >
          {/* HTML5 Streaming MP4 Video Player */}
          {currentReel.video_url && (
            <video
              ref={videoRef}
              key={currentReel.video_url}
              src={currentReel.video_url}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label={currentReel.title}
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Synchronized MP3 Audio Track */}
          <audio
            ref={audioRef}
            key={currentReel.audio_url || currentReel.id}
            src={currentReel.audio_url || '/audio/reel-track-1.mp3'}
            loop
            muted={isMuted}
            preload="metadata"
          />

          {/* Subtle Theme Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-b ${currentReel.theme_gradient} opacity-40 mix-blend-multiply z-0 pointer-events-none`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-10 pointer-events-none" />

          {/* Play/Pause Central Flash Indicator */}
          {showPlayOverlay && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-75 fade-out duration-300">
              <div className="p-5 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
                {isPlaying ? <Play className="w-12 h-12 fill-white text-white" aria-hidden="true" /> : <Pause className="w-12 h-12 fill-white text-white" aria-hidden="true" />}
              </div>
            </div>
          )}

          {/* Top Progress Bar & Counter */}
          <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-2">
            <div className="w-full flex space-x-1 mb-2">
              {reels.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/50' : 'bg-white/20'
                    }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center space-x-1.5">
                <span className="font-black tracking-wider text-[11px] uppercase bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isPlaying ? 'Streaming MP4' : 'Paused'}</span>
                </span>
                {!isMuted && (
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/40 flex items-center space-x-1">
                    <Music2 className="w-2.5 h-2.5 animate-bounce" aria-hidden="true" />
                    <span>MP3 Active</span>
                  </span>
                )}
              </div>
              {currentReel.aqi_badge && (
                <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-rose-600/90 text-white border border-rose-400/40 shadow-sm animate-pulse">
                  {currentReel.aqi_badge}
                </span>
              )}
            </div>
          </div>

          {/* Double tap heart burst animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in zoom-in-50 duration-200">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-ping" aria-hidden="true" />
            </div>
          )}

          {/* Top Middle: Dynamic Visual Badge & Title */}
          <div className="relative z-20 px-5 pt-16 pointer-events-none space-y-2">
            {renderVisualBadge(currentReel.visual_type)}
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {currentReel.title}
            </h2>
          </div>

          {/* Instagram Action Sidebar (Right side) */}
          <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center space-y-3.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleLike();
              }}
              aria-label={currentReel.is_liked ? 'Unlike reel' : 'Like reel'}
              aria-pressed={currentReel.is_liked}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div
                className={`p-3 rounded-full backdrop-blur-md transition ${currentReel.is_liked
                    ? 'bg-rose-500/30 text-rose-500 border border-rose-500/50'
                    : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
                  }`}
              >
                <Heart className={`w-5 h-5 transition ${currentReel.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
                {currentReel.likes_count.toLocaleString()}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCommentsOpen(true);
              }}
              aria-label={`Open comments (${currentReel.comments_count})`}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
                {currentReel.comments_count.toLocaleString()}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleSave();
              }}
              aria-label={currentReel.is_saved ? 'Remove reel bookmark' : 'Bookmark reel'}
              aria-pressed={currentReel.is_saved}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div
                className={`p-3 rounded-full backdrop-blur-md transition ${currentReel.is_saved
                    ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                    : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
                  }`}
              >
                <Bookmark className={`w-5 h-5 transition ${currentReel.is_saved ? 'fill-amber-400 text-amber-400' : ''}`} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">Save</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloadModalOpen(true);
              }}
              aria-label="Download MP4 video or MP3 audio"
              className="flex flex-col items-center group transition active:scale-75"
              title="Download MP4 Video or MP3 Audio"
            >
              <div className="p-3 rounded-full bg-teal-600/60 text-white hover:bg-teal-600 border border-teal-400/50 backdrop-blur-md shadow-lg">
                <Download className="w-5 h-5 text-teal-200" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold text-teal-300 mt-0.5 drop-shadow">Media</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleShare();
              }}
              aria-label="Share reel"
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">Share</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted((prev) => !prev);
              }}
              aria-label={isMuted ? 'Unmute reel audio' : 'Mute reel audio'}
              aria-pressed={!isMuted}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div
                className={`p-3 rounded-full border backdrop-blur-md transition ${!isMuted ? 'bg-teal-500/30 text-teal-300 border-teal-500/60' : 'bg-black/50 text-white border-white/20'
                  }`}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-neutral-400" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-5 h-5 text-teal-400 animate-pulse" aria-hidden="true" />
                )}
              </div>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
                {isMuted ? 'Muted' : 'Sound'}
              </span>
            </button>

            <div className="relative pt-0.5" aria-hidden="true">
              <div
                className={`w-9 h-9 rounded-full border-2 border-white/40 bg-neutral-900 overflow-hidden flex items-center justify-center ${isPlaying && !isMuted ? 'animate-spin [animation-duration:4s]' : ''
                  }`}
              >
                <img src={currentReel.creator_avatar} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              <Music2 className="w-3.5 h-3.5 text-teal-300 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>

          {/* Bottom Overlay */}
          <div className="relative z-20 p-5 pt-6 space-y-2.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/70 border border-white/20 backdrop-blur-md text-[11px] text-teal-300 font-bold max-w-[85%]">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{currentReel.key_takeaway}</span>
            </div>

            <div className="flex items-center justify-between pr-14">
              <div className="flex items-center space-x-2.5">
                <img
                  src={currentReel.creator_avatar}
                  alt={currentReel.creator_name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-teal-400 shadow-md"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm text-white drop-shadow">{currentReel.creator_name}</span>
                    {currentReel.creator_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 fill-teal-400" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-300 drop-shadow">{currentReel.creator_handle}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(currentReel.creator_handle);
                }}
                aria-pressed={Boolean(followingMap[currentReel.creator_handle])}
                className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-md ${followingMap[currentReel.creator_handle]
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-white text-neutral-950 hover:bg-neutral-200'
                  }`}
              >
                {followingMap[currentReel.creator_handle] ? 'Following' : '+ Follow'}
              </button>
            </div>

            <p className="text-xs text-neutral-100 leading-relaxed line-clamp-3 pr-14 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {currentReel.caption}
            </p>

            <div className="flex flex-wrap gap-1.5 pr-14">
              {currentReel.tags.map((tag, i) => (
                <span key={i} className="text-[11px] font-bold text-teal-300 hover:underline cursor-pointer drop-shadow">
                  {tag}
                </span>
              ))}
            </div>

            {currentReel.action_cta && (
              <div className="pt-0.5 pr-14">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateTab && currentReel.action_cta) {
                      onNavigateTab(currentReel.action_cta.tab);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 border border-teal-500/50 text-xs font-bold backdrop-blur-md transition group shadow-lg"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                    <span>{currentReel.action_cta.label}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-teal-300 group-hover:translate-x-1 transition" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2 text-[11px] text-neutral-300 overflow-hidden pr-14 pt-0.5">
              <Music2 className="w-3 h-3 text-teal-400 shrink-0" aria-hidden="true" />
              <div className="whitespace-nowrap animate-marquee">
                <span>
                  {currentReel.audio_title} • {currentReel.audio_artist}
                </span>
              </div>
            </div>

            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1" aria-hidden="true">
              <div className="bg-teal-400 h-full transition-all duration-100" style={{ width: `${videoProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Download Media Modal (MP4 Video & MP3 Audio) */}
      {isDownloadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Download className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="download-modal-title" className="font-extrabold text-base text-white">
                    Download Media Files
                  </h3>
                  <p className="text-xs text-neutral-400">Direct MP4 Video &amp; MP3 Audio Downloads</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close download modal"
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-400">Selected Reel</span>
              <h4 className="text-sm font-bold text-white">{currentReel.title}</h4>
              <p className="text-xs text-neutral-400">
                {currentReel.creator_name} ({currentReel.creator_handle})
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/60 to-neutral-900 border border-teal-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300">
                    <Video className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">High-Definition MP4 Video</h5>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {currentReel.video_url || '/videos/outdoor-jogging.mp4'}
                    </p>
                  </div>
                </div>
                <a
                  href={currentReel.video_url || '/videos/outdoor-jogging.mp4'}
                  download={`${currentReel.id}-video.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Save MP4</span>
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-neutral-900 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300">
                    <Music2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Original MP3 Audio Track</h5>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {currentReel.audio_url || '/audio/reel-track-1.mp3'}
                    </p>
                  </div>
                </div>
                <a
                  href={currentReel.audio_url || '/audio/reel-track-1.mp3'}
                  download={`${currentReel.id}-audio.mp3`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Save MP3</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}${currentReel.video_url || '/videos/outdoor-jogging.mp4'}`,
                  );
                  showToast('Direct MP4 URL copied! 📋');
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition font-medium"
              >
                <Copy className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                <span>Copy MP4 URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}${currentReel.audio_url || '/audio/reel-track-1.mp3'}`,
                  );
                  showToast('Direct MP3 URL copied! 📋');
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition font-medium"
              >
                <Copy className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                <span>Copy MP3 URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-Style Comments Bottom Sheet Drawer */}
      {isCommentsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="comments-modal-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-teal-400" aria-hidden="true" />
                <h3 id="comments-modal-title" className="font-extrabold text-sm text-white">
                  Comments ({currentReel.comments_count})
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close comments drawer"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {currentReel.comments.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  No comments yet. Be the first to share your insights! 💬
                </div>
              ) : (
                currentReel.comments.map((c) => (
                  <div key={c.id} className="flex space-x-3 items-start">
                    <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{c.author}</span>
                        <span className="text-[10px] text-neutral-400">{c.timestamp}</span>
                      </div>
                      <p className="text-neutral-200 mt-1 leading-relaxed">{c.text}</p>
                      <div className="flex items-center space-x-4 mt-1.5 text-[10px] text-neutral-400">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" aria-hidden="true" />
                          <span>{c.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="pt-3 border-t border-neutral-800 mt-3 flex items-center space-x-2">
              <label htmlFor="reel-comment-input" className="sr-only">
                Add a comment
              </label>
              <input
                id="reel-comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment or ask Dr. Vikram..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                aria-label="Post comment"
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-reel-modal-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 id="create-reel-modal-title" className="font-extrabold text-base text-white flex items-center space-x-2">
                <Video className="w-5 h-5 text-teal-400" aria-hidden="true" />
                <span>Post Community Eco Reel</span>
              </h3>
              <button
                type="button"
                aria-label="Close create reel modal"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="space-y-3 text-xs">
              <div>
                <label htmlFor="create-reel-title" className="block text-neutral-300 font-bold mb-1">
                  Reel Title
                </label>
                <input
                  id="create-reel-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 3 Quick Checks Before Letting Kids Play Outside"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="create-reel-video" className="block text-neutral-300 font-bold mb-1">
                  Select MP4 Video Clip
                </label>
                <select
                  id="create-reel-video"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="/videos/outdoor-jogging.mp4">🏃‍♂️ Outdoor Jogging &amp; Smog Morning (/videos/outdoor-jogging.mp4)</option>
                  <option value="/videos/traffic-smog.mp4">🚗 City Traffic &amp; Vehicle Exhaust (/videos/traffic-smog.mp4)</option>
                  <option value="/videos/nature-clean-air.mp4">🌿 NASA Clean Air Blooming Nature (/videos/nature-clean-air.mp4)</option>
                  <option value="/videos/fluid-diffusion.mp4">🔬 Micro-Particulate Aerosol Flow (/videos/fluid-diffusion.mp4)</option>
                </select>
              </div>

              <div>
                <label htmlFor="create-reel-audio" className="block text-neutral-300 font-bold mb-1">
                  Select MP3 Audio Track
                </label>
                <select
                  id="create-reel-audio"
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="/audio/reel-track-1.mp3">🎵 Lo-Fi Chill Environmental Sound (Track 1)</option>
                  <option value="/audio/reel-track-2.mp3">🎵 Deep Electro Lab Synth (Track 2)</option>
                  <option value="/audio/reel-track-3.mp3">🎵 Acoustic Nature Groove (Track 3)</option>
                </select>
              </div>

              <div>
                <label htmlFor="create-reel-category" className="block text-neutral-300 font-bold mb-1">
                  Category
                </label>
                <select
                  id="create-reel-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Reel['category'])}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="smog_alert">Smog Alert</option>
                  <option value="health">Health &amp; Lungs</option>
                  <option value="home_hacks">Home &amp; Purifier Hacks</option>
                  <option value="stubble_fire">Stubble &amp; Satellite</option>
                  <option value="tech">Tech &amp; Masks</option>
                </select>
              </div>

              <div>
                <label htmlFor="create-reel-caption" className="block text-neutral-300 font-bold mb-1">
                  Caption
                </label>
                <textarea
                  id="create-reel-caption"
                  required
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Explain the science, danger, or solution in plain language..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label htmlFor="create-reel-takeaway" className="block text-neutral-300 font-bold mb-1">
                  Key Takeaway Hook
                </label>
                <input
                  id="create-reel-takeaway"
                  type="text"
                  value={newTakeaway}
                  onChange={(e) => setNewTakeaway(e.target.value)}
                  placeholder="e.g. Wear N95 when AQI crosses 200"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="create-reel-tags" className="block text-neutral-300 font-bold mb-1">
                  Hashtags (comma separated)
                </label>
                <input
                  id="create-reel-tags"
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold">
                  Post Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
