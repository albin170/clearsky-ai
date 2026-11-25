import React from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Download,
  Heart,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { Reel } from '../../types';
import { ReelVisualBadge } from './ReelVisualBadge';
import { buildReelCaptionsDataUri } from './reelUtils';

interface ReelPlayerCardProps {
  currentReel: Reel;
  reelsCount: number;
  currentIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  showPlayOverlay: boolean;
  showHeartBurst: boolean;
  videoProgress: number;
  isFollowing: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onCardTap: () => void;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTimeUpdate: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onOpenComments: () => void;
  onOpenDownload: () => void;
  onToggleFollow: (handle: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ReelPlayerCard: React.FC<ReelPlayerCardProps> = ({
  currentReel,
  reelsCount,
  currentIndex,
  isPlaying,
  isMuted,
  showPlayOverlay,
  showHeartBurst,
  videoProgress,
  isFollowing,
  videoRef,
  audioRef,
  onCardTap,
  onTogglePlayPause,
  onToggleMute,
  onTouchStart,
  onTouchEnd,
  onTimeUpdate,
  onLike,
  onSave,
  onShare,
  onOpenComments,
  onOpenDownload,
  onToggleFollow,
  onNavigateTab,
}) => {
  const captionsSrc = buildReelCaptionsDataUri(currentReel);

  return (
    <div
      onClick={onCardTap}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label={`EcoReel player: ${currentReel.title}`}
      className="reel-player-stage relative w-full aspect-[9/16] max-h-[78vh] rounded-3xl overflow-hidden bg-black border border-neutral-700/60 shadow-2xl select-none flex flex-col justify-between cursor-pointer"
    >
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
          onTimeUpdate={onTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <track kind="captions" src={captionsSrc} srcLang="en" label="English captions" default />
        </video>
      )}

      <audio
        ref={audioRef}
        key={currentReel.audio_url || currentReel.id}
        src={currentReel.audio_url || '/audio/reel-track-1.mp3'}
        loop
        muted={isMuted}
        preload="metadata"
      />

      <div
        className={`absolute inset-0 bg-gradient-to-b ${currentReel.theme_gradient} opacity-40 mix-blend-multiply z-0 pointer-events-none`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-10 pointer-events-none" />

      {showPlayOverlay && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-75 fade-out duration-300">
          <div className="p-5 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
            {isPlaying ? (
              <Play className="w-12 h-12 fill-white text-white" aria-hidden="true" />
            ) : (
              <Pause className="w-12 h-12 fill-white text-white" aria-hidden="true" />
            )}
          </div>
        </div>
      )}

      {/* Top story progress & accessible playback button */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-2">
        <div className="w-full flex space-x-1 mb-2" aria-hidden="true">
          {Array.from({ length: reelsCount }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/50' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlayPause();
              }}
              aria-label={isPlaying ? 'Pause video playback' : 'Play video playback'}
              aria-pressed={!isPlaying}
              className="font-black tracking-wider text-[11px] uppercase bg-black/60 hover:bg-black/80 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md flex items-center space-x-1.5 text-white transition"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              ) : (
                <Play className="w-3 h-3 text-amber-400" aria-hidden="true" />
              )}
              <span>{isPlaying ? 'Streaming MP4' : 'Paused'}</span>
            </button>
            {!isMuted && (
              <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/40 flex items-center space-x-1">
                <Music2 className="w-2.5 h-2.5 animate-bounce" aria-hidden="true" />
                <span>MP3 Active</span>
              </span>
            )}
          </div>
          {currentReel.aqi_badge && (
            <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-rose-600/90 text-white border border-rose-400/40 shadow-sm">
              {currentReel.aqi_badge}
            </span>
          )}
        </div>
      </div>

      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in zoom-in-50 duration-200">
          <Heart
            className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-ping"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="relative z-20 px-5 pt-16 pointer-events-none space-y-2">
        <ReelVisualBadge visualType={currentReel.visual_type} />
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {currentReel.title}
        </h2>
      </div>

      {/* Action Sidebar */}
      <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center space-y-3.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          aria-label={currentReel.is_liked ? 'Unlike reel' : 'Like reel'}
          aria-pressed={currentReel.is_liked}
          className="flex flex-col items-center group transition active:scale-75"
        >
          <span
            className={`p-3 rounded-full backdrop-blur-md transition ${
              currentReel.is_liked
                ? 'bg-rose-500/30 text-rose-500 border border-rose-500/50'
                : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition ${currentReel.is_liked ? 'fill-rose-500 text-rose-500' : ''}`}
              aria-hidden="true"
            />
          </span>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
            {currentReel.likes_count.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments();
          }}
          aria-label={`Open comments (${currentReel.comments_count})`}
          className="flex flex-col items-center group transition active:scale-75"
        >
          <span className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
            {currentReel.comments_count.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          aria-label={currentReel.is_saved ? 'Remove reel bookmark' : 'Bookmark reel'}
          aria-pressed={currentReel.is_saved}
          className="flex flex-col items-center group transition active:scale-75"
        >
          <span
            className={`p-3 rounded-full backdrop-blur-md transition ${
              currentReel.is_saved
                ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
            }`}
          >
            <Bookmark
              className={`w-5 h-5 transition ${currentReel.is_saved ? 'fill-amber-400 text-amber-400' : ''}`}
              aria-hidden="true"
            />
          </span>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">Save</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDownload();
          }}
          aria-label="Download MP4 video or MP3 audio"
          title="Download MP4 Video or MP3 Audio"
          className="flex flex-col items-center group transition active:scale-75"
        >
          <span className="p-3 rounded-full bg-teal-600/60 text-white hover:bg-teal-600 border border-teal-400/50 backdrop-blur-md shadow-lg">
            <Download className="w-5 h-5 text-teal-200" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-bold text-teal-300 mt-0.5 drop-shadow">Media</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          aria-label="Share reel"
          className="flex flex-col items-center group transition active:scale-75"
        >
          <span className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
            <Share2 className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">Share</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          aria-label={isMuted ? 'Unmute reel audio' : 'Mute reel audio'}
          aria-pressed={!isMuted}
          className="flex flex-col items-center group transition active:scale-75"
        >
          <span
            className={`p-3 rounded-full border backdrop-blur-md transition ${
              !isMuted ? 'bg-teal-500/30 text-teal-300 border-teal-500/60' : 'bg-black/50 text-white border-white/20'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-neutral-300" aria-hidden="true" />
            ) : (
              <Volume2 className="w-5 h-5 text-teal-400 animate-pulse" aria-hidden="true" />
            )}
          </span>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>

        <div className="relative pt-0.5" aria-hidden="true">
          <div
            className={`w-9 h-9 rounded-full border-2 border-white/40 bg-neutral-900 overflow-hidden flex items-center justify-center ${
              isPlaying && !isMuted ? 'animate-spin [animation-duration:4s]' : ''
            }`}
          >
            <img src={currentReel.creator_avatar} alt="" className="w-full h-full object-cover opacity-80" />
          </div>
          <Music2 className="w-3.5 h-3.5 text-teal-300 absolute -top-1 -right-1 animate-bounce" />
        </div>
      </div>

      {/* Bottom Creator, Caption & CTA Overlay */}
      <div className="relative z-20 p-5 pt-6 space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/70 border border-white/20 backdrop-blur-md text-[11px] text-teal-300 font-bold max-w-[85%]">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{currentReel.key_takeaway}</span>
        </div>

        <div className="flex items-center justify-between pr-14">
          <div className="flex items-center space-x-2.5">
            <img
              src={currentReel.creator_avatar}
              alt={`${currentReel.creator_name} profile avatar`}
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
              onToggleFollow(currentReel.creator_handle);
            }}
            aria-pressed={isFollowing}
            aria-label={isFollowing ? `Unfollow ${currentReel.creator_name}` : `Follow ${currentReel.creator_name}`}
            className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-md ${
              isFollowing
                ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                : 'bg-white text-neutral-950 hover:bg-neutral-200'
            }`}
          >
            {isFollowing ? 'Following' : '+ Follow'}
          </button>
        </div>

        <p className="text-xs text-neutral-100 leading-relaxed line-clamp-3 pr-14 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {currentReel.caption}
        </p>

        <div className="flex flex-wrap gap-1.5 pr-14">
          {currentReel.tags.map((tag, i) => (
            <span key={i} className="text-[11px] font-bold text-teal-300 drop-shadow">
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

        <div
          role="progressbar"
          aria-label="Reel video playback progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(videoProgress)}
          className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1"
        >
          <div className="bg-teal-400 h-full transition-all duration-100" style={{ width: `${videoProgress}%` }} />
        </div>
      </div>
    </div>
  );
};
