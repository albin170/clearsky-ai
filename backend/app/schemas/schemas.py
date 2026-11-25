from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


LanguageCode = Literal["en", "ml"]
UserRole = Literal["super_admin", "moderator", "community_manager", "standard_user"]
CommuteMode = Literal["car_petrol", "car_diesel", "two_wheeler", "bus", "metro", "bicycle", "walk"]
ScheduleType = Literal["work_standard", "college", "flexible", "night_shift"]
VentilationType = Literal["cross_windows", "single_window", "sealed_ac", "exhaust_only"]
PurifierFilterType = Literal["hepa_h13", "basic", "carbon", "none"]
CookingExposure = Literal["high", "moderate", "low", "none"]
FamilyRelation = Literal["self", "child", "elderly", "spouse", "parent", "other"]
AgeGroup = Literal["infant", "child", "teen", "adult", "senior"]
SensitivityProfile = Literal[
    "standard",
    "respiratory_sensitive",
    "cardiovascular_sensitive",
    "outdoor_athlete",
    "outdoor_worker",
    "student",
]
CommunityCategory = Literal["neighborhood", "school_college", "workplace", "environmental_club"]
ReportCategory = Literal[
    "waste_burning",
    "construction_dust",
    "traffic_idling",
    "industrial_emission",
    "crop_burning",
    "other",
]
ReportModerationStatus = Literal["pending", "reviewed", "resolved", "flagged_spam"]
ImpactActivityType = Literal[
    "public_transit_used",
    "cycling_trip",
    "walking_trip",
    "carpooling",
    "energy_saved",
    "waste_segregated",
    "no_waste_burning",
]
WhatIfShiftMode = Literal[
    "car_to_metro",
    "car_to_bus",
    "car_to_cycling",
    "zero_waste_burning",
    "energy_conservation",
]
ActiveTransitMode = Literal["walking", "cycling"]
ReelCategory = Literal["smog_alert", "health", "home_hacks", "stubble_fire", "tech"]


class DetailMessageResponse(BaseModel):
    detail: str
    status: Optional[str] = None
    points_awarded: Optional[int] = None


# ----------------- Auth & User -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    preferred_language: LanguageCode = "en"
    default_city: Optional[str] = Field(default="Delhi", max_length=100)
    default_lat: Optional[float] = Field(default=28.6139, ge=-90.0, le=90.0)
    default_lon: Optional[float] = Field(default=77.2090, ge=-180.0, le=180.0)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=256)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    preferred_language: Optional[LanguageCode] = None
    default_city: Optional[str] = Field(default=None, max_length=100)
    default_lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    default_lon: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool = True
    preferred_language: str
    default_city: Optional[str] = None
    default_lat: Optional[float] = None
    default_lon: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ----------------- Saved Locations -----------------
class SavedLocationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    city: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    is_primary: bool = False


class SavedLocationOut(BaseModel):
    id: int
    name: str
    city: str
    latitude: float
    longitude: float
    is_primary: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ----------------- Air Quality & Weather -----------------
class PollutantDetail(BaseModel):
    value: float
    unit: str
    sub_index: Optional[int] = None
    status: str
    health_implication: str


class CurrentAQI(BaseModel):
    aqi_in: int
    aqi_us: int
    category_in: str
    category_us: str
    color_in: str
    color_us: str
    dominant_pollutant: str
    pm2_5: float
    pm10: float
    o3: float
    no2: float
    so2: float
    co: float
    timestamp: str
    city: str
    latitude: float
    longitude: float
    source: str
    data_freshness: str
    pollutants: Dict[str, PollutantDetail]


class WeatherData(BaseModel):
    temperature_c: float
    relative_humidity: float
    wind_speed_kmh: float
    wind_direction_deg: float
    wind_direction_cardinal: str
    weather_code: int
    weather_description: str
    visibility_km: Optional[float] = None


class HourlyForecastItem(BaseModel):
    time: str
    aqi_in: int
    aqi_us: int
    pm2_5: float
    pm10: float
    temperature_c: float
    wind_speed_kmh: float


class DailyForecastItem(BaseModel):
    date: str
    avg_aqi_in: int
    avg_aqi_us: int
    max_aqi_in: int
    dominant_pollutant: str
    category_in: str
    weather_description: str


class AirQualityResponse(BaseModel):
    current: CurrentAQI
    weather: WeatherData
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]
    ai_summary: str
    cached: bool = False


class LocationComparisonSummary(BaseModel):
    aqi_difference: int
    cleaner_location: str
    pm25_difference: float
    summary: str


class LocationComparisonResponse(BaseModel):
    location_1: CurrentAQI
    location_2: CurrentAQI
    comparison: LocationComparisonSummary


# ----------------- Family Profiles -----------------
class FamilyMemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    relation: FamilyRelation
    age_group: AgeGroup
    sensitivity_profile: SensitivityProfile = "standard"
    activity_preferences: str = Field(default="indoor_exercise,walking", max_length=255)


class FamilyMemberOut(BaseModel):
    id: int
    name: str
    relation: str
    age_group: str
    sensitivity_profile: str
    activity_preferences: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FamilyPlanActivity(BaseModel):
    period: str
    target_member: str
    recommendation: str
    reason: str
    expected_benefit: str
    estimated_cost: str
    difficulty: str
    environmental_impact: str
    source: str


class FamilyDailyPlanResponse(BaseModel):
    date: str
    aqi_context: int
    aqi_category: str
    activities: List[FamilyPlanActivity]
    overview: str


# ----------------- Indoor Air Optimizer -----------------
class RoomAssessmentCreate(BaseModel):
    room_name: str = Field(..., min_length=1, max_length=100)
    room_size_sqft: float = Field(..., gt=0.0, le=50000.0)
    occupants: int = Field(default=1, ge=1, le=500)
    ventilation_type: VentilationType = "cross_windows"
    has_purifier: bool = False
    purifier_filter_type: PurifierFilterType = "hepa_h13"
    cooking_smoke_exposure: CookingExposure = "low"
    sensor_pm25: Optional[float] = Field(default=None, ge=0.0, le=2000.0)


class RoomAssessmentOut(BaseModel):
    id: int
    room_name: str
    room_size_sqft: float
    occupants: int
    ventilation_type: str
    has_purifier: bool
    purifier_filter_type: str
    cooking_smoke_exposure: str
    calculated_score: int
    recommendations: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VentilationWindowAdvice(BaseModel):
    optimal_window_opening_hours: List[str]
    worst_window_opening_hours: List[str]
    recommendation_text: str
    air_purifier_cadre_recommendation_cfm: float
    disclaimer: str


# ----------------- Routine & Emissions -----------------
class RoutineCreate(BaseModel):
    commute_mode: CommuteMode
    daily_distance_km: float = Field(..., gt=0.0, le=1000.0)
    schedule_type: ScheduleType = "work_standard"
    waste_habits: Optional[str] = Field(default="segregated", max_length=100)


class SustainableAlternative(BaseModel):
    current_habit: str
    recommended_alternative: str
    cost_difference_monthly: str
    emissions_avoided_kg_co2_monthly: float
    pm25_avoided_g_monthly: float
    practical_difficulty: str
    long_term_benefit: str
    calculation_assumptions: str


class RoutineOut(BaseModel):
    id: int
    commute_mode: str
    daily_distance_km: float
    schedule_type: str
    estimated_daily_co2_kg: float
    estimated_daily_pm25_g: float
    alternatives: List[SustainableAlternative]
    created_at: datetime


# ----------------- Prediction -----------------
class PredictionWindow(BaseModel):
    time_window: str
    estimated_aqi: int
    risk_level: str
    confidence: str
    primary_driver: str


class PredictionResponse(BaseModel):
    current_aqi: int
    predicted_peaks: List[str]
    windows: List[PredictionWindow]
    weather_correlation_summary: str
    explanation: str
    disclaimer: str


# ----------------- Community -----------------
class CommunityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    city: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=5, max_length=2000)
    category: CommunityCategory = "neighborhood"


class CommunityOut(BaseModel):
    id: int
    name: str
    city: str
    description: str
    category: str
    members_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommunityChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    challenge_type: str
    points_reward: int
    duration_days: int
    participants_count: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ChallengeJoinRequest(BaseModel):
    challenge_id: int = Field(..., ge=1)


class ChallengeCompleteRequest(BaseModel):
    challenge_id: int = Field(..., ge=1)
    self_reported_notes: str = Field(default="", max_length=2000)


class CommunityReportCreate(BaseModel):
    community_id: Optional[int] = Field(default=None, ge=1)
    title: str = Field(..., min_length=1, max_length=200)
    report_type: ReportCategory
    description: str = Field(..., min_length=1, max_length=2000)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: str = Field(..., min_length=1, max_length=255)
    is_anonymous: bool = False


class CommunityReportOut(BaseModel):
    id: int
    title: str
    report_type: str
    description: str
    latitude: float
    longitude: float
    address: str
    status: str
    is_anonymous: bool
    created_at: datetime
    reported_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------- Impact -----------------
class ImpactLogCreate(BaseModel):
    activity_type: ImpactActivityType
    units_count: float = Field(default=1.0, gt=0.0, le=10000.0)


class ImpactLogOut(BaseModel):
    detail: str
    co2_saved_kg: float
    pm25_avoided_g: float
    fuel_saved_liters: float
    money_saved_estimate: float


class ImpactSummaryResponse(BaseModel):
    total_co2_avoided_kg: float
    total_pm25_avoided_g: float
    total_fuel_saved_liters: float
    total_money_saved_estimate: float
    activities_completed_count: int
    daily_history: List[Dict[str, Any]]
    methodology_note: str
    eco_score: int
    is_demo_data: bool = False


# ----------------- Assistant -----------------
class SuggestedQuestionsResponse(BaseModel):
    language: str
    questions: List[str]


class DailyBriefingResponse(BaseModel):
    date: str
    city: str
    aqi: int
    category: str
    briefing: str
    key_action: str
    language: str


class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[int] = None
    language: LanguageCode = "en"
    location_name: Optional[str] = Field(default=None, max_length=100)
    lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    lon: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


class AssistantChatResponse(BaseModel):
    conversation_id: int
    role: str = "assistant"
    content: str
    language: str
    structured_advice: Optional[Dict[str, Any]] = None
    sources_cited: List[str]
    disclaimer: str


# ----------------- What-If Simulator -----------------
class WhatIfRequest(BaseModel):
    participating_families: int = Field(default=100, ge=1, le=1000000)
    avg_commute_km: float = Field(default=15.0, gt=0.0, le=500.0)
    shift_mode: WhatIfShiftMode = "car_to_metro"


class WhatIfResponse(BaseModel):
    participating_families: int
    daily_co2_avoided_kg: float
    annual_co2_avoided_tons: float
    annual_pm25_avoided_kg: float
    annual_fuel_saved_liters: float
    annual_community_cost_savings: float
    assumptions_explained: str
    disclaimer: str


# ----------------- Clean Route Planner -----------------
class CleanRouteRequest(BaseModel):
    start_lat: float = Field(..., ge=-90.0, le=90.0)
    start_lon: float = Field(..., ge=-180.0, le=180.0)
    end_lat: float = Field(..., ge=-90.0, le=90.0)
    end_lon: float = Field(..., ge=-180.0, le=180.0)
    mode: ActiveTransitMode = "walking"


class RouteOption(BaseModel):
    name: str
    distance_km: float
    estimated_time_mins: int
    estimated_pm25_exposure_index: float
    pollution_exposure_label: str
    suitability: str
    route_path: List[List[float]]
    advantages: List[str]


class CleanRouteResponse(BaseModel):
    routes: List[RouteOption]
    guidance: str
    disclaimer: str


# ----------------- Education -----------------
class EducationalTopicOut(BaseModel):
    id: str
    title: str
    category: str
    summary: str
    content: str
    source: str


class QuizQuestionOut(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_index: int
    explanation: str


# ----------------- Notifications -----------------
class NotificationPreferenceUpdate(BaseModel):
    high_aqi_alert: Optional[bool] = None
    aqi_threshold: Optional[int] = Field(default=None, ge=25, le=500)
    daily_morning_briefing: Optional[bool] = None
    purifier_filter_reminders: Optional[bool] = None
    community_challenge_reminders: Optional[bool] = None
    quiet_hours_start: Optional[str] = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    quiet_hours_end: Optional[str] = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    preferred_channel: Optional[Literal["in_app", "email"]] = None


class NotificationPreferenceOut(BaseModel):
    high_aqi_alert: bool
    aqi_threshold: int
    daily_morning_briefing: bool
    purifier_filter_reminders: bool
    community_challenge_reminders: bool
    quiet_hours_start: str
    quiet_hours_end: str
    preferred_channel: str


class NotificationAlertOut(BaseModel):
    id: str
    severity: Literal["high", "warning", "info"]
    title: str
    message: str
    recommended_action: str


# ----------------- EcoReels -----------------
def _validate_safe_media_url(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    if not stripped:
        return None
    lower = stripped.lower()
    if lower.startswith("javascript:") or lower.startswith("data:") or lower.startswith("vbscript:"):
        raise ValueError("Unsafe URL scheme is not allowed")
    if ".." in stripped or "\\" in stripped:
        raise ValueError("Path traversal sequences are not allowed in media URLs")
    if not (stripped.startswith("/") or lower.startswith("https://") or lower.startswith("http://")):
        raise ValueError("Media URL must be a relative path or http(s) URL")
    return stripped


class ReelCommentCreate(BaseModel):
    author: str = Field(default="EcoCitizen", min_length=1, max_length=100)
    handle: str = Field(default="@citizen_eco", min_length=1, max_length=60)
    text: str = Field(..., min_length=1, max_length=1000)


class ReelCommentOut(BaseModel):
    id: str
    author: str
    handle: str
    avatar: str
    text: str
    likes: int
    timestamp: str


class ReelLikeOut(BaseModel):
    id: str
    is_liked: bool
    likes_count: int


class ReelSaveOut(BaseModel):
    id: str
    is_saved: bool


class ReelCommentAddedOut(BaseModel):
    detail: str
    comment: ReelCommentOut
    comments_count: int


class ReelCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    caption: str = Field(..., min_length=1, max_length=2000)
    tags: List[str] = Field(default_factory=lambda: ["#CleanAir", "#BreatheSafe"], max_length=15)
    category: ReelCategory = "health"
    creator_name: str = Field(default="ClearSky Community", min_length=1, max_length=100)
    creator_handle: str = Field(default="@community_voice", min_length=1, max_length=60)
    aqi_badge: Optional[str] = Field(default="AQI 320 • Very Poor", max_length=60)
    theme_gradient: str = Field(default="from-amber-600 via-rose-700 to-neutral-950", max_length=120)
    visual_type: str = Field(default="inversion_layer", max_length=60)
    video_url: Optional[str] = "/videos/outdoor-jogging.mp4"
    audio_url: Optional[str] = "/audio/reel-track-1.mp3"
    key_takeaway: str = Field(..., min_length=1, max_length=300)

    @field_validator("video_url", "audio_url")
    @classmethod
    def check_safe_media_urls(cls, v: Optional[str]) -> Optional[str]:
        return _validate_safe_media_url(v)


class ReelOut(BaseModel):
    id: str
    title: str
    caption: str
    tags: List[str]
    category: str
    creator_name: str
    creator_handle: str
    creator_avatar: str
    creator_verified: bool
    audio_title: str
    audio_artist: str
    aqi_badge: Optional[str] = None
    likes_count: int
    comments_count: int
    shares_count: int
    views_count: int
    is_liked: bool
    is_saved: bool
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    theme_gradient: str
    visual_type: str
    key_takeaway: str
    action_cta: Optional[Dict[str, str]] = None
    comments: List[ReelCommentOut] = []


# ----------------- Admin & Health -----------------
class SystemHealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: str
    open_meteo_api: str
    gemini_api_configured: bool
    active_users_count: int
    total_communities: int
    total_impact_logs: int
    cached_locations: int


class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    timestamp: str
