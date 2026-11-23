from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/reels", tags=["EcoReels Environmental Shorts"])

class ReelCommentCreate(BaseModel):
    author: str = "EcoCitizen"
    handle: str = "@citizen_eco"
    text: str

class ReelCreate(BaseModel):
    title: str
    caption: str
    tags: List[str] = ["#CleanAir", "#BreatheSafe"]
    category: str = "health"
    creator_name: str = "ClearSky Community"
    creator_handle: str = "@community_voice"
    aqi_badge: Optional[str] = "AQI 320 • Very Poor"
    theme_gradient: str = "from-amber-600 via-rose-700 to-neutral-950"
    visual_type: str = "inversion_layer"
    key_takeaway: str

INITIAL_REELS: List[Dict[str, Any]] = [
    {
        "id": "reel-1",
        "title": "The 6 AM Inversion Trap: Why Morning Jogging Kills",
        "caption": "Think morning walks are healthy in December? When thermal inversion strikes, cold ground air traps 100% of toxic diesel particulates under a 90m atmospheric ceiling. Running forces 40L of poisoned air into your alveoli every minute! 🫁⚠️",
        "tags": ["#SmogAlert", "#WinterSmog", "#DelhiAQI", "#Pulmonology", "#BreatheSafe"],
        "category": "smog_alert",
        "creator_name": "Dr. Vikram Seth",
        "creator_handle": "@DrPulmonology",
        "creator_avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80",
        "creator_verified": True,
        "audio_title": "Original Audio - Inversion Physics & Health Alert",
        "audio_artist": "Dr. Vikram Seth • Trending Sound",
        "aqi_badge": "AQI 445 • Severe",
        "likes_count": 14280,
        "comments_count": 892,
        "shares_count": 3150,
        "views_count": 182400,
        "is_liked": False,
        "is_saved": False,
        "theme_gradient": "from-rose-900 via-amber-950 to-neutral-950",
        "visual_type": "inversion_layer",
        "key_takeaway": "Switch outdoor cardio to 12 PM - 3 PM when solar radiation breaks the boundary layer lid.",
        "action_cta": {
            "label": "Check Diurnal Trend",
            "tab": "dashboard"
        },
        "comments": [
            {
                "id": "c1",
                "author": "Aarav Sharma",
                "handle": "@aarav_delhi",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80",
                "text": "Literally had throat irritation every December morning until I shifted my runs to the evening treadmill!",
                "likes": 245,
                "timestamp": "2h ago"
            },
            {
                "id": "c2",
                "author": "Dr. Neha Kapoor",
                "handle": "@neha_pediatrics",
                "avatar": "https://images.unsplash.com/photo-1594824813583-8d070f074d20?w=80&auto=format&fit=crop&q=80",
                "text": "Crucial message for school sports directors! Morning 7 AM physical training must be suspended during GRAP-4.",
                "likes": 512,
                "timestamp": "4h ago"
            }
        ]
    },
    {
        "id": "reel-2",
        "title": "N95 vs Cloth Mask: Under 500x Microscope",
        "caption": "We placed standard cotton cloth vs melt-blown N95 layers under an electron microscope. Cotton weave gaps are 100-200 microns wide — PM2.5 (2.5 microns) slips through like a mosquito through an open goalpost! 🔬😷",
        "tags": ["#MaskTest", "#N95", "#MicroscopeScience", "#AerosolLab", "#CleanAir"],
        "category": "tech",
        "creator_name": "Aerosol Physics Lab",
        "creator_handle": "@AerosolLabs",
        "creator_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        "creator_verified": True,
        "audio_title": "Lab Frequency - Electrostatic Capture Test",
        "audio_artist": "Aerosol Labs • Original Audio",
        "aqi_badge": "Filtration: 98.4%",
        "likes_count": 28940,
        "comments_count": 1430,
        "shares_count": 8720,
        "views_count": 341000,
        "is_liked": False,
        "is_saved": True,
        "theme_gradient": "from-teal-900 via-cyan-950 to-neutral-950",
        "visual_type": "mask_microscope",
        "key_takeaway": "Only certified N95/FFP2 masks with electrostatic melt-blown core filter sub-micron particles.",
        "action_cta": {
            "label": "Mask Vulnerability Guide",
            "tab": "education"
        },
        "comments": [
            {
                "id": "c3",
                "author": "Rohan Mehra",
                "handle": "@rohan_fit",
                "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80",
                "text": "The electrostatic charge explanation blew my mind. Throwing away the loose cloth bandanas today.",
                "likes": 320,
                "timestamp": "1h ago"
            }
        ]
    },
    {
        "id": "reel-3",
        "title": "3 NASA Plants That Eat Indoor Benzene & Formaldehyde",
        "caption": "Plants aren't just decor! In sealed rooms, Snake Plants (Sansevieria) absorb CO2 and release O2 specifically AT NIGHT through CAM photosynthesis. Add Peace Lily & Areca Palm for instant air scrubbing! 🌿🪴",
        "tags": ["#IndoorAir", "#Houseplants", "#NASACleanAir", "#GreenLiving", "#BioFilter"],
        "category": "home_hacks",
        "creator_name": "Priya Sen",
        "creator_handle": "@GreenHomeCoach",
        "creator_avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
        "creator_verified": True,
        "audio_title": "Aesthetic Lofi - Green Oxygen Waves",
        "audio_artist": "Green Home Sounds",
        "aqi_badge": "Indoor VOC -42%",
        "likes_count": 42100,
        "comments_count": 2180,
        "shares_count": 12500,
        "views_count": 520000,
        "is_liked": True,
        "is_saved": True,
        "theme_gradient": "from-emerald-900 via-green-950 to-neutral-950",
        "visual_type": "nasa_plants",
        "key_takeaway": "Keep 2-3 Snake Plants per 100 sq ft bedroom for cleaner nocturnal breathing and deeper REM sleep.",
        "action_cta": {
            "label": "Audit Bedroom Air",
            "tab": "indoor"
        },
        "comments": [
            {
                "id": "c4",
                "author": "Ananya Joshi",
                "handle": "@ananya_j",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
                "text": "Bought 4 snake plants last week, my morning sinus congestion literally vanished!",
                "likes": 641,
                "timestamp": "5h ago"
            }
        ]
    },
    {
        "id": "reel-4",
        "title": "The Air Purifier Mistake 90% of People Make",
        "caption": "Running your purifier on 'Auto' or 'Sleep Mode' in winter keeps your indoor AQI hovering at a dangerous 180! When you enter a room or cook, your Clean Air Delivery Rate (CADR) needs maximum fan velocity for 25 mins first! 💨⚡",
        "tags": ["#AirPurifier", "#CADR", "#IndoorAirQuality", "#HVACTips", "#LifeHacks"],
        "category": "home_hacks",
        "creator_name": "Rahul Nair",
        "creator_handle": "@CleanAirHacks",
        "creator_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        "creator_verified": False,
        "audio_title": "Turbo Airflow - CADR Max Beat",
        "audio_artist": "Clean Air Audio Lab",
        "aqi_badge": "CADR 450 m³/h",
        "likes_count": 19430,
        "comments_count": 940,
        "shares_count": 4600,
        "views_count": 215000,
        "is_liked": False,
        "is_saved": False,
        "theme_gradient": "from-blue-900 via-indigo-950 to-neutral-950",
        "visual_type": "purifier_cadr",
        "key_takeaway": "Always blast High Mode for 20 minutes with doors closed before dropping down to medium maintenance mode.",
        "action_cta": {
            "label": "Calculate Room CADR",
            "tab": "indoor"
        },
        "comments": [
            {
                "id": "c5",
                "author": "Karan Singhania",
                "handle": "@karan_s",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
                "text": "Tested this with an independent laser PM2.5 monitor — AQI dropped from 240 to 18 in 18 minutes on Turbo!",
                "likes": 395,
                "timestamp": "3h ago"
            }
        ]
    },
    {
        "id": "reel-5",
        "title": "Satellite Heatmap: Parali Stubble Fires Over Gangetic Plain",
        "caption": "MODIS & VIIRS thermal satellite anomalies show over 3,400 active farm fire clusters. Combined with 7 km/h North-Westerly winds, the massive smoke plume travels 380 km straight into the Delhi-NCR basin within 14 hours. 🛰️🔥🌾",
        "tags": ["#StubbleBurning", "#Parali", "#SatelliteData", "#NASA_FIRMS", "#GangeticPlains"],
        "category": "stubble_fire",
        "creator_name": "Earth Observation Hub",
        "creator_handle": "@ISRO_EnviroData",
        "creator_avatar": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
        "creator_verified": True,
        "audio_title": "Deep Atmospheric Drone - Orbital Trajectory",
        "audio_artist": "Space & Atmosphere Soundscape",
        "aqi_badge": "Fire Count: 3,410",
        "likes_count": 31200,
        "comments_count": 1840,
        "shares_count": 9400,
        "views_count": 480000,
        "is_liked": False,
        "is_saved": False,
        "theme_gradient": "from-orange-950 via-red-950 to-neutral-950",
        "visual_type": "stubble_satellite",
        "key_takeaway": "North-Westerly wind speed drops to zero over the bowl topography of the capital, trapping biomass soot.",
        "action_cta": {
            "label": "Open Interactive Map",
            "tab": "map"
        },
        "comments": [
            {
                "id": "c6",
                "author": "Sunita Rao",
                "handle": "@sunita_enviro",
                "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80",
                "text": "The wind vector graphic proves that local traffic emissions alone aren't the sole culprit in November.",
                "likes": 480,
                "timestamp": "6h ago"
            }
        ]
    },
    {
        "id": "reel-6",
        "title": "What PM2.5 Does to Your Arteries in 48 Hours",
        "caption": "Unlike dust that you cough out, nanoparticles smaller than 2.5 microns pass straight through the alveoli wall into blood capillaries. This immediately induces systemic oxidative stress, stiffens arteries, and elevates blood pressure within 2 days. 🫀🩸",
        "tags": ["#CardioHealth", "#VascularHealth", "#PM25", "#MedicalResearch", "#LancetStudy"],
        "category": "health",
        "creator_name": "Cardiovascular Health Digest",
        "creator_handle": "@CardioResearch",
        "creator_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80",
        "creator_verified": True,
        "audio_title": "Pulse & Rhythm - Cellular Cardiology",
        "audio_artist": "Medical Beats Studio",
        "aqi_badge": "Blood PM2.5 Diffusion",
        "likes_count": 54200,
        "comments_count": 3410,
        "shares_count": 18200,
        "views_count": 680000,
        "is_liked": True,
        "is_saved": True,
        "theme_gradient": "from-rose-950 via-red-900 to-neutral-950",
        "visual_type": "bloodstream_nanoparticles",
        "key_takeaway": "Antioxidant-rich nutrition (Vitamin C, E, Omega-3) and air purifiers attenuate inflammatory arterial stress.",
        "action_cta": {
            "label": "Protect Family Members",
            "tab": "family"
        },
        "comments": [
            {
                "id": "c7",
                "author": "Dr. T. Verma",
                "handle": "@dr_verma_heart",
                "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&auto=format&fit=crop&q=80",
                "text": "We see a 22% surge in cardiovascular admissions 48-72 hours following peak smog events every single year.",
                "likes": 890,
                "timestamp": "7h ago"
            }
        ]
    }
]

# In-memory storage for reels dynamic operations
reels_store: List[Dict[str, Any]] = [dict(r) for r in INITIAL_REELS]

@router.get("", response_model=List[Dict[str, Any]])
def get_reels(
    category: Optional[str] = Query(None, description="Filter reels by category (smog_alert, health, home_hacks, stubble_fire, tech)"),
    search: Optional[str] = Query(None, description="Search reels by title, tag, or creator")
):
    """Retrieve environmental reels for the Instagram-style video feed."""
    results = reels_store
    if category and category.lower() != "all":
        results = [r for r in results if r.get("category", "").lower() == category.lower()]
    if search:
        s = search.lower()
        results = [
            r for r in results 
            if s in r.get("title", "").lower() 
            or s in r.get("caption", "").lower() 
            or any(s in t.lower() for t in r.get("tags", []))
            or s in r.get("creator_name", "").lower()
        ]
    return results

@router.get("/{reel_id}", response_model=Dict[str, Any])
def get_reel_by_id(reel_id: str):
    """Retrieve a single environmental reel."""
    for r in reels_store:
        if r["id"] == reel_id:
            return r
    raise HTTPException(status_code=404, detail="Reel not found")

@router.post("/{reel_id}/like")
def toggle_reel_like(reel_id: str):
    """Toggle like on an environmental reel."""
    for r in reels_store:
        if r["id"] == reel_id:
            r["is_liked"] = not r.get("is_liked", False)
            if r["is_liked"]:
                r["likes_count"] = r.get("likes_count", 0) + 1
            else:
                r["likes_count"] = max(0, r.get("likes_count", 1) - 1)
            return {
                "id": reel_id,
                "is_liked": r["is_liked"],
                "likes_count": r["likes_count"]
            }
    raise HTTPException(status_code=404, detail="Reel not found")

@router.post("/{reel_id}/save")
def toggle_reel_save(reel_id: str):
    """Toggle bookmark/save on an environmental reel."""
    for r in reels_store:
        if r["id"] == reel_id:
            r["is_saved"] = not r.get("is_saved", False)
            return {
                "id": reel_id,
                "is_saved": r["is_saved"]
            }
    raise HTTPException(status_code=404, detail="Reel not found")

@router.post("/{reel_id}/comments")
def add_reel_comment(reel_id: str, comment: ReelCommentCreate):
    """Add a new viewer comment to an environmental reel."""
    for r in reels_store:
        if r["id"] == reel_id:
            new_comment = {
                "id": f"c_{len(r.get('comments', [])) + 1}_{datetime.datetime.now().strftime('%M%S')}",
                "author": comment.author,
                "handle": comment.handle,
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80",
                "text": comment.text,
                "likes": 1,
                "timestamp": "Just now"
            }
            if "comments" not in r:
                r["comments"] = []
            r["comments"].insert(0, new_comment)
            r["comments_count"] = len(r["comments"])
            return {
                "detail": "Comment added successfully",
                "comment": new_comment,
                "comments_count": r["comments_count"]
            }
    raise HTTPException(status_code=404, detail="Reel not found")

@router.post("", status_code=201)
def create_reel(payload: ReelCreate):
    """Create a new community or educator environmental reel."""
    new_reel = {
        "id": f"reel-{len(reels_store) + 1}",
        "title": payload.title,
        "caption": payload.caption,
        "tags": payload.tags,
        "category": payload.category,
        "creator_name": payload.creator_name,
        "creator_handle": payload.creator_handle,
        "creator_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        "creator_verified": False,
        "audio_title": "Original Audio - Environmental Awareness",
        "audio_artist": f"{payload.creator_name} • ClearSky Voice",
        "aqi_badge": payload.aqi_badge or "AQI Alert",
        "likes_count": 1,
        "comments_count": 0,
        "shares_count": 0,
        "views_count": 1,
        "is_liked": True,
        "is_saved": False,
        "theme_gradient": payload.theme_gradient,
        "visual_type": payload.visual_type,
        "key_takeaway": payload.key_takeaway,
        "action_cta": {
            "label": "Explore Platform",
            "tab": "dashboard"
        },
        "comments": []
    }
    reels_store.insert(0, new_reel)
    return new_reel
