import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Music2, 
  Sparkles, CheckCircle2, ChevronUp, ChevronDown, 
  Volume2, VolumeX, Plus, X, Send, Play, Pause, 
  Video, Flame, Wind, ShieldAlert, Award, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Reel, ReelComment } from '../../types';

interface ReelsViewProps {
  onNavigateTab?: (tab: string) => void;
}

const FALLBACK_REELS: Reel[] = [
  {
    id: "reel-1",
    title: "The 6 AM Inversion Trap: Why Morning Jogging Kills",
    caption: "Think morning walks are healthy in December? When thermal inversion strikes, cold ground air traps 100% of toxic diesel particulates under a 90m atmospheric ceiling. Running forces 40L of poisoned air into your alveoli every minute! 🫁⚠️",
    tags: ["#SmogAlert", "#WinterSmog", "#DelhiAQI", "#Pulmonology", "#BreatheSafe"],
    category: "smog_alert",
    creator_name: "Dr. Vikram Seth",
    creator_handle: "@DrPulmonology",
    creator_avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80",
    creator_verified: true,
    audio_title: "Original Audio - Inversion Physics & Health Alert",
    audio_artist: "Dr. Vikram Seth • Trending Sound",
    aqi_badge: "AQI 445 • Severe",
    likes_count: 14280,
    comments_count: 892,
    shares_count: 3150,
    views_count: 182400,
    is_liked: false,
    is_saved: false,
    video_url: "/videos/outdoor-jogging.mp4",
    theme_gradient: "from-rose-950 via-amber-950 to-neutral-950",
    visual_type: "inversion_layer",
    key_takeaway: "Switch outdoor cardio to 12 PM - 3 PM when solar radiation breaks the boundary layer lid.",
    action_cta: {
      label: "Check Diurnal Trend",
      tab: "dashboard"
    },
    comments: [
      {
        id: "c1",
        author: "Aarav Sharma",
        handle: "@aarav_delhi",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80",
        text: "Literally had throat irritation every December morning until I shifted my runs to the evening treadmill!",
        likes: 245,
        timestamp: "2h ago"
      },
      {
        id: "c2",
        author: "Dr. Neha Kapoor",
        handle: "@neha_pediatrics",
        avatar: "https://images.unsplash.com/photo-1594824813583-8d070f074d20?w=80&auto=format&fit=crop&q=80",
        text: "Crucial message for school sports directors! Morning 7 AM physical training must be suspended during GRAP-4.",
        likes: 512,
        timestamp: "4h ago"
      }
    ]
  },
  {
    id: "reel-2",
    title: "N95 vs Cloth Mask: Under 500x Microscope",
    caption: "We placed standard cotton cloth vs melt-blown N95 layers under an electron microscope. Cotton weave gaps are 100-200 microns wide — PM2.5 (2.5 microns) slips through like a mosquito through an open goalpost! 🔬😷",
    tags: ["#MaskTest", "#N95", "#MicroscopeScience", "#AerosolLab", "#CleanAir"],
    category: "tech",
    creator_name: "Aerosol Physics Lab",
    creator_handle: "@AerosolLabs",
    creator_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    creator_verified: true,
    audio_title: "Lab Frequency - Electrostatic Capture Test",
    audio_artist: "Aerosol Labs • Original Audio",
    aqi_badge: "Filtration: 98.4%",
    likes_count: 28940,
    comments_count: 1430,
    shares_count: 8720,
    views_count: 341000,
    is_liked: false,
    is_saved: true,
    video_url: "/videos/fluid-diffusion.mp4",
    theme_gradient: "from-teal-950 via-cyan-950 to-neutral-950",
    visual_type: "mask_microscope",
    key_takeaway: "Only certified N95/FFP2 masks with electrostatic melt-blown core filter sub-micron particles.",
    action_cta: {
      label: "Mask Vulnerability Guide",
      tab: "education"
    },
    comments: [
      {
        id: "c3",
        author: "Rohan Mehra",
        handle: "@rohan_fit",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80",
        text: "The electrostatic charge explanation blew my mind. Throwing away the loose cloth bandanas today.",
        likes: 320,
        timestamp: "1h ago"
      }
    ]
  },
  {
    id: "reel-3",
    title: "3 NASA Plants That Eat Indoor Benzene & Formaldehyde",
    caption: "Plants aren't just decor! In sealed rooms, Snake Plants (Sansevieria) absorb CO2 and release O2 specifically AT NIGHT through CAM photosynthesis. Add Peace Lily & Areca Palm for instant air scrubbing! 🌿🪴",
    tags: ["#IndoorAir", "#Houseplants", "#NASACleanAir", "#GreenLiving", "#BioFilter"],
    category: "home_hacks",
    creator_name: "Priya Sen",
    creator_handle: "@GreenHomeCoach",
    creator_avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    creator_verified: true,
    audio_title: "Aesthetic Lofi - Green Oxygen Waves",
    audio_artist: "Green Home Sounds",
    aqi_badge: "Indoor VOC -42%",
    likes_count: 42100,
    comments_count: 2180,
    shares_count: 12500,
    views_count: 520000,
    is_liked: true,
    is_saved: true,
    video_url: "/videos/nature-clean-air.mp4",
    theme_gradient: "from-emerald-950 via-green-950 to-neutral-950",
    visual_type: "nasa_plants",
    key_takeaway: "Keep 2-3 Snake Plants per 100 sq ft bedroom for cleaner nocturnal breathing and deeper REM sleep.",
    action_cta: {
      label: "Audit Bedroom Air",
      tab: "indoor"
    },
    comments: [
      {
        id: "c4",
        author: "Ananya Joshi",
        handle: "@ananya_j",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
        text: "Bought 4 snake plants last week, my morning sinus congestion literally vanished!",
        likes: 641,
        timestamp: "5h ago"
      }
    ]
  },
  {
    id: "reel-4",
    title: "The Air Purifier Mistake 90% of People Make",
    caption: "Running your purifier on 'Auto' or 'Sleep Mode' in winter keeps your indoor AQI hovering at a dangerous 180! When you enter a room or cook, your Clean Air Delivery Rate (CADR) needs maximum fan velocity for 25 mins first! 💨⚡",
    tags: ["#AirPurifier", "#CADR", "#IndoorAirQuality", "#HVACTips", "#LifeHacks"],
    category: "home_hacks",
    creator_name: "Rahul Nair",
    creator_handle: "@CleanAirHacks",
    creator_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    creator_verified: false,
    audio_title: "Turbo Airflow - CADR Max Beat",
    audio_artist: "Clean Air Audio Lab",
    aqi_badge: "CADR 450 m³/h",
    likes_count: 19430,
    comments_count: 940,
    shares_count: 4600,
    views_count: 215000,
    is_liked: false,
    is_saved: false,
    video_url: "/videos/fluid-diffusion.mp4",
    theme_gradient: "from-blue-950 via-indigo-950 to-neutral-950",
    visual_type: "purifier_cadr",
    key_takeaway: "Always blast High Mode for 20 minutes with doors closed before dropping down to medium maintenance mode.",
    action_cta: {
      label: "Calculate Room CADR",
      tab: "indoor"
    },
    comments: [
      {
        id: "c5",
        author: "Karan Singhania",
        handle: "@karan_s",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
        text: "Tested this with an independent laser PM2.5 monitor — AQI dropped from 240 to 18 in 18 minutes on Turbo!",
        likes: 395,
        timestamp: "3h ago"
      }
    ]
  },
  {
    id: "reel-5",
    title: "Satellite Heatmap: Parali Stubble Fires Over Gangetic Plain",
    caption: "MODIS & VIIRS thermal satellite anomalies show over 3,400 active farm fire clusters. Combined with 7 km/h North-Westerly winds, the massive smoke plume travels 380 km straight into the Delhi-NCR basin within 14 hours. 🛰️🔥🌾",
    tags: ["#StubbleBurning", "#Parali", "#SatelliteData", "#NASA_FIRMS", "#GangeticPlains"],
    category: "stubble_fire",
    creator_name: "Earth Observation Hub",
    creator_handle: "@ISRO_EnviroData",
    creator_avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    creator_verified: true,
    audio_title: "Deep Atmospheric Drone - Orbital Trajectory",
    audio_artist: "Space & Atmosphere Soundscape",
    aqi_badge: "Fire Count: 3,410",
    likes_count: 31200,
    comments_count: 1840,
    shares_count: 9400,
    views_count: 480000,
    is_liked: false,
    is_saved: false,
    video_url: "/videos/traffic-smog.mp4",
    theme_gradient: "from-orange-950 via-red-950 to-neutral-950",
    visual_type: "stubble_satellite",
    key_takeaway: "North-Westerly wind speed drops to zero over the bowl topography of the capital, trapping biomass soot.",
    action_cta: {
      label: "Open Interactive Map",
      tab: "map"
    },
    comments: [
      {
        id: "c6",
        author: "Sunita Rao",
        handle: "@sunita_enviro",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80",
        text: "The wind vector graphic proves that local traffic emissions alone aren't the sole culprit in November.",
        likes: 480,
        timestamp: "6h ago"
      }
    ]
  },
  {
    id: "reel-6",
    title: "What PM2.5 Does to Your Arteries in 48 Hours",
    caption: "Unlike dust that you cough out, nanoparticles smaller than 2.5 microns pass straight through the alveoli wall into blood capillaries. This immediately induces systemic oxidative stress, stiffens arteries, and elevates blood pressure within 2 days. 🫀🩸",
    tags: ["#CardioHealth", "#VascularHealth", "#PM25", "#MedicalResearch", "#LancetStudy"],
    category: "health",
    creator_name: "Cardiovascular Health Digest",
    creator_handle: "@CardioResearch",
    creator_avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80",
    creator_verified: true,
    audio_title: "Pulse & Rhythm - Cellular Cardiology",
    audio_artist: "Medical Beats Studio",
    aqi_badge: "Blood Diffusion",
    likes_count: 54200,
    comments_count: 3410,
    shares_count: 18200,
    views_count: 680000,
    is_liked: true,
    is_saved: true,
    video_url: "/videos/fluid-diffusion.mp4",
    theme_gradient: "from-rose-950 via-red-900 to-neutral-950",
    visual_type: "bloodstream_nanoparticles",
    key_takeaway: "Antioxidant-rich nutrition (Vitamin C, E, Omega-3) and air purifiers attenuate inflammatory arterial stress.",
    action_cta: {
      label: "Protect Family Members",
      tab: "family"
    },
    comments: [
      {
        id: "c7",
        author: "Dr. T. Verma",
        handle: "@dr_verma_heart",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&auto=format&fit=crop&q=80",
        text: "We see a 22% surge in cardiovascular admissions 48-72 hours following peak smog events every single year.",
        likes: 890,
        timestamp: "7h ago"
      }
    ]
  }
];

export const ReelsView: React.FC<ReelsViewProps> = ({ onNavigateTab }) => {
  const [reels, setReels] = useState<Reel[]>(FALLBACK_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New reel creation state
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState<'smog_alert' | 'health' | 'home_hacks' | 'stubble_fire' | 'tech'>('health');
  const [newTakeaway, setNewTakeaway] = useState('');
  const [newTags, setNewTags] = useState('#CleanAir, #BreatheSafe');
  const [newVideoUrl, setNewVideoUrl] = useState('/videos/outdoor-jogging.mp4');

  // Video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Audio synthesis reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Touch swipe handling
  const touchStartY = useRef<number | null>(null);

  // Load reels from API with fallback
  useEffect(() => {
    async function fetchReels() {
      try {
        const data = await api.getReels(activeCategory);
        if (data && data.length > 0) {
          setReels(data);
          setCurrentIndex(0);
        }
      } catch (err) {
        if (activeCategory === 'all') {
          setReels(FALLBACK_REELS);
        } else {
          setReels(FALLBACK_REELS.filter(r => r.category === activeCategory));
        }
        setCurrentIndex(0);
      }
    }
    fetchReels();
  }, [activeCategory]);

  const currentReel = reels[currentIndex] || FALLBACK_REELS[0];

  // Video play/pause on reel change
  useEffect(() => {
    setIsPlaying(true);
    setVideoProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback, keep ready
        });
      }
    }
  }, [currentIndex, currentReel.video_url]);

  // Ambient sound synthesizer
  const startAmbientSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110 + (currentIndex * 15), ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(isMuted ? 0.0001 : 0.04, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      // Audio autoplay policy
    }
  }, [currentIndex, isMuted]);

  useEffect(() => {
    if (!isMuted) {
      startAmbientSound();
    } else if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(0.0001, audioCtxRef.current.currentTime);
    }
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (_) {}
      }
    };
  }, [currentIndex, isMuted, startAmbientSound]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isCreateModalOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'j') handleNext();
      if (e.key === 'ArrowUp' || e.key === 'k') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length, isCommentsOpen, isCreateModalOpen]);

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

  // Toggle video play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayOverlay(true);
    setTimeout(() => setShowPlayOverlay(false), 800);
  };

  // Handle video time progress
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(pct);
    }
  };

  // Like interaction
  const handleLike = async () => {
    const newLiked = !currentReel.is_liked;
    const newCount = newLiked ? currentReel.likes_count + 1 : Math.max(0, currentReel.likes_count - 1);
    
    setReels(prev => prev.map((r, i) => i === currentIndex ? { ...r, is_liked: newLiked, likes_count: newCount } : r));

    if (newLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 }
      });
    }

    try {
      await api.toggleReelLike(currentReel.id);
    } catch (_) {}
  };

  // Double tap to like or single tap to toggle play/pause
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<any>(null);

  const handleCardTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap -> Like
      clearTimeout(singleTapTimeoutRef.current);
      if (!currentReel.is_liked) {
        handleLike();
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
    } else {
      // Single tap -> Toggle Play/Pause
      singleTapTimeoutRef.current = setTimeout(() => {
        togglePlayPause();
      }, 300);
    }
    lastTapRef.current = now;
  };

  // Save/Bookmark
  const handleSave = async () => {
    const newSaved = !currentReel.is_saved;
    setReels(prev => prev.map((r, i) => i === currentIndex ? { ...r, is_saved: newSaved } : r));
    showToast(newSaved ? "Saved to your Eco Reel collection!" : "Removed from saved collection");
    try {
      await api.toggleReelSave(currentReel.id);
    } catch (_) {}
  };

  // Share
  const handleShare = async () => {
    const shareData = {
      title: currentReel.title,
      text: `${currentReel.title} — ${currentReel.key_takeaway} (ClearSky AI)`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(`${currentReel.title}: ${window.location.href}`);
      showToast("Reel video link copied to clipboard! 📋");
    }
  };

  // Post comment
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
      timestamp: 'Just now'
    };

    setReels(prev => prev.map((r, i) => i === currentIndex ? {
      ...r,
      comments: [newComment, ...r.comments],
      comments_count: r.comments_count + 1
    } : r));

    const textToSubmit = commentText;
    setCommentText('');
    showToast("Comment posted!");

    try {
      await api.addReelComment(currentReel.id, textToSubmit);
    } catch (_) {}
  };

  // Follow toggle
  const toggleFollow = (handle: string) => {
    setFollowingMap(prev => {
      const isFollowing = !prev[handle];
      showToast(isFollowing ? `Following ${handle}` : `Unfollowed ${handle}`);
      return { ...prev, [handle]: isFollowing };
    });
  };

  // Submit new Reel
  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCaption.trim()) return;

    const created: Reel = {
      id: `reel-${Date.now()}`,
      title: newTitle.trim(),
      caption: newCaption.trim(),
      tags: newTags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`),
      category: newCategory,
      creator_name: 'You (Eco Warrior)',
      creator_handle: '@you_air_hero',
      creator_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      creator_verified: false,
      audio_title: 'Original Community Audio',
      audio_artist: 'Community Voice • Trending',
      aqi_badge: 'Community Intel',
      likes_count: 1,
      comments_count: 0,
      shares_count: 0,
      views_count: 1,
      is_liked: true,
      is_saved: false,
      video_url: newVideoUrl,
      theme_gradient: 'from-teal-950 via-slate-900 to-neutral-950',
      visual_type: 'inversion_layer',
      key_takeaway: newTakeaway.trim() || 'Protect respiratory health with continuous real-time monitoring.',
      action_cta: {
        label: 'Explore Platform',
        tab: 'dashboard'
      },
      comments: []
    };

    setReels(prev => [created, ...prev]);
    setCurrentIndex(0);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewCaption('');
    setNewTakeaway('');
    showToast("Your Eco Reel Video is now live!");

    try {
      await api.createReel(created);
    } catch (_) {}
  };

  // Overlay scene indicator
  const renderVisualBadge = (type: string) => {
    switch (type) {
      case 'inversion_layer':
        return (
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-amber-300 bg-black/70 border border-amber-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
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
            <Wind className="w-3 h-3 text-blue-400 animate-spin" />
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
        <div className="fixed top-16 z-50 px-4 py-2 rounded-xl bg-teal-500 text-neutral-950 font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Header and Category Filters */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-2">
              <span>EcoReels Videos</span>
              <span className="text-[10px] uppercase font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Streaming Video</span>
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400">
              High-impact 30s looping videos on atmospheric science, pollution hacks & pulmonology intel
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-xs font-bold"
            title={isMuted ? "Unmute Video Audio" : "Mute Video Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-teal-400 animate-pulse" />}
            <span>{isMuted ? "Sound Off" : "Sound On"}</span>
          </button>

          {/* Create Reel Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post Reel</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="w-full flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Reels' },
          { id: 'smog_alert', label: '🌫️ Smog Alerts' },
          { id: 'health', label: '🫁 Health & Lungs' },
          { id: 'home_hacks', label: '🪴 Home Hacks' },
          { id: 'stubble_fire', label: '🌾 Parali Stubble' },
          { id: 'tech', label: '🔬 Masks & CADR' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
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

      {/* Main Reels Viewer (Instagram 9:16 aspect ratio layout) */}
      <div className="relative w-full max-w-[420px] flex items-center justify-center">
        {/* Navigation Arrows for Desktop */}
        <div className="hidden lg:flex flex-col space-y-3 absolute -right-16 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white hover:bg-neutral-800 hover:scale-110 transition shadow-xl"
            title="Previous Reel (Up Arrow)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <div className="text-center font-mono text-xs text-neutral-400 font-bold">
            {currentIndex + 1} / {reels.length}
          </div>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white hover:bg-neutral-800 hover:scale-110 transition shadow-xl"
            title="Next Reel (Down Arrow)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Vertical Reel Card with Real Background Streaming Video */}
        <div 
          onClick={handleCardTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full aspect-[9/16] max-h-[78vh] rounded-3xl overflow-hidden bg-black border border-neutral-700/60 shadow-2xl select-none flex flex-col justify-between cursor-pointer`}
        >
          {/* Real HTML5 Streaming Video Player */}
          {currentReel.video_url && (
            <video
              ref={videoRef}
              key={currentReel.video_url}
              src={currentReel.video_url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Fallback Animated Gradient if video is loading */}
          <div className={`absolute inset-0 bg-gradient-to-b ${currentReel.theme_gradient} opacity-40 mix-blend-multiply z-0 pointer-events-none`} />

          {/* Instagram Cinematic Shadow Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-10 pointer-events-none" />

          {/* Play/Pause Central Flash Indicator */}
          {showPlayOverlay && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-75 fade-out duration-300">
              <div className="p-5 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
                {isPlaying ? <Play className="w-12 h-12 fill-white text-white" /> : <Pause className="w-12 h-12 fill-white text-white" />}
              </div>
            </div>
          )}

          {/* Top Progress Bar & Counter */}
          <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-2">
            {/* Story/Reel segment bar */}
            <div className="w-full flex space-x-1 mb-2">
              {reels.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'bg-white' 
                      : idx < currentIndex 
                        ? 'bg-white/50' 
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center space-x-1.5">
                <span className="font-black tracking-wider text-[11px] uppercase bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isPlaying ? 'Playing HD' : 'Paused'}</span>
                </span>
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
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-ping" />
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
          <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center space-y-4">
            {/* Like Button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className={`p-3 rounded-full backdrop-blur-md transition ${
                currentReel.is_liked 
                  ? 'bg-rose-500/30 text-rose-500 border border-rose-500/50' 
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
              }`}>
                <Heart className={`w-6 h-6 transition ${currentReel.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
                {currentReel.likes_count.toLocaleString()}
              </span>
            </button>

            {/* Comments Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); }}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
                {currentReel.comments_count.toLocaleString()}
              </span>
            </button>

            {/* Bookmark/Save Button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className={`p-3 rounded-full backdrop-blur-md transition ${
                currentReel.is_saved 
                  ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50' 
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
              }`}>
                <Bookmark className={`w-6 h-6 transition ${currentReel.is_saved ? 'fill-amber-400 text-amber-400' : ''}`} />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">Save</span>
            </button>

            {/* Share Button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">Share</span>
            </button>

            {/* Video Sound / Mute Toggle Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev); }}
              className="flex flex-col items-center group transition active:scale-75"
            >
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 backdrop-blur-md">
                {isMuted ? <VolumeX className="w-6 h-6 text-neutral-400" /> : <Volume2 className="w-6 h-6 text-teal-400" />}
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
                {isMuted ? 'Muted' : 'Audio'}
              </span>
            </button>

            {/* Spinning Music Disc Icon */}
            <div className="relative pt-1">
              <div className={`w-10 h-10 rounded-full border-2 border-white/40 bg-neutral-900 overflow-hidden flex items-center justify-center ${isPlaying ? 'animate-spin [animation-duration:4s]' : ''}`}>
                <img 
                  src={currentReel.creator_avatar} 
                  alt="vinyl" 
                  className="w-full h-full object-cover opacity-80" 
                />
              </div>
              <Music2 className="w-3.5 h-3.5 text-teal-300 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>

          {/* Bottom Overlay: Creator info, caption, tags, CTA */}
          <div className="relative z-20 p-5 pt-6 space-y-2.5">
            {/* Key takeaway pill */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/70 border border-white/20 backdrop-blur-md text-[11px] text-teal-300 font-bold max-w-[85%]">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{currentReel.key_takeaway}</span>
            </div>

            {/* Creator Row */}
            <div className="flex items-center justify-between pr-14">
              <div className="flex items-center space-x-2.5">
                <img 
                  src={currentReel.creator_avatar} 
                  alt={currentReel.creator_name} 
                  className="w-9 h-9 rounded-full object-cover border-2 border-teal-400 shadow-md"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm text-white drop-shadow">
                      {currentReel.creator_name}
                    </span>
                    {currentReel.creator_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-300 drop-shadow">
                    {currentReel.creator_handle}
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFollow(currentReel.creator_handle); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-md ${
                  followingMap[currentReel.creator_handle]
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-white text-neutral-950 hover:bg-neutral-200'
                }`}
              >
                {followingMap[currentReel.creator_handle] ? 'Following' : '+ Follow'}
              </button>
            </div>

            {/* Caption */}
            <p className="text-xs text-neutral-100 leading-relaxed line-clamp-3 pr-14 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {currentReel.caption}
            </p>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-1.5 pr-14">
              {currentReel.tags.map((tag, i) => (
                <span key={i} className="text-[11px] font-bold text-teal-300 hover:underline cursor-pointer drop-shadow">
                  {tag}
                </span>
              ))}
            </div>

            {/* Call to Action Bar */}
            {currentReel.action_cta && (
              <div className="pt-0.5 pr-14">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateTab && currentReel.action_cta) {
                      onNavigateTab(currentReel.action_cta.tab);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 border border-teal-500/50 text-xs font-bold backdrop-blur-md transition group shadow-lg"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>{currentReel.action_cta.label}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-teal-300 group-hover:translate-x-1 transition" />
                </button>
              </div>
            )}

            {/* Audio Scrolling Marquee */}
            <div className="flex items-center space-x-2 text-[11px] text-neutral-300 overflow-hidden pr-14 pt-0.5">
              <Music2 className="w-3 h-3 text-teal-400 shrink-0" />
              <div className="whitespace-nowrap animate-marquee">
                <span>{currentReel.audio_title} • {currentReel.audio_artist}</span>
              </div>
            </div>

            {/* Real Video Progress Bar */}
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-teal-400 h-full transition-all duration-100" 
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-Style Comments Bottom Sheet Drawer */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] flex flex-col justify-between shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Comments ({currentReel.comments_count})
                </h3>
              </div>
              <button 
                onClick={() => setIsCommentsOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {currentReel.comments.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  No comments yet. Be the first to share your insights! 💬
                </div>
              ) : (
                currentReel.comments.map(c => (
                  <div key={c.id} className="flex space-x-3 items-start">
                    <img 
                      src={c.avatar} 
                      alt={c.author} 
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{c.author}</span>
                        <span className="text-[10px] text-neutral-400">{c.timestamp}</span>
                      </div>
                      <p className="text-neutral-200 mt-1 leading-relaxed">
                        {c.text}
                      </p>
                      <div className="flex items-center space-x-4 mt-1.5 text-[10px] text-neutral-400">
                        <button className="hover:text-rose-400 flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{c.likes}</span>
                        </button>
                        <button className="hover:text-white font-medium">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment} className="pt-3 border-t border-neutral-800 mt-3 flex items-center space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment or ask Dr. Vikram..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                <Video className="w-5 h-5 text-teal-400" />
                <span>Post Community Eco Reel</span>
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Reel Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 3 Quick Checks Before Letting Kids Play Outside"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Select Video Clip</label>
                <select
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="/videos/outdoor-jogging.mp4">🏃‍♂️ Outdoor Jogging & Smog Morning</option>
                  <option value="/videos/traffic-smog.mp4">🚗 City Traffic & Vehicle Exhaust</option>
                  <option value="/videos/nature-clean-air.mp4">🌿 NASA Clean Air Blooming Nature</option>
                  <option value="/videos/fluid-diffusion.mp4">🔬 Micro-Particulate Aerosol Flow</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="smog_alert">Smog Alert</option>
                  <option value="health">Health & Lungs</option>
                  <option value="home_hacks">Home & Purifier Hacks</option>
                  <option value="stubble_fire">Stubble & Satellite</option>
                  <option value="tech">Tech & Masks</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Caption</label>
                <textarea
                  required
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Explain the science, danger, or solution in plain language..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Key Takeaway Hook</label>
                <input
                  type="text"
                  value={newTakeaway}
                  onChange={(e) => setNewTakeaway(e.target.value)}
                  placeholder="e.g. Wear N95 when AQI crosses 200"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Hashtags (comma separated)</label>
                <input
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
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
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
