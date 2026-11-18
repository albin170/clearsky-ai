from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# ----------------- Auth & User -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    preferred_language: str = "en"
    default_city: Optional[str] = "Delhi"
    default_lat: Optional[float] = 28.6139
    default_lon: Optional[float] = 77.2090

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    default_city: Optional[str] = None
    default_lat: Optional[float] = None
    default_lon: Optional[float] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
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
    name: str
    city: str
    latitude: float
    longitude: float
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
    status: str # Good, Satisfactory, Moderate, Poor, Very Poor, Severe
    health_implication: str

class CurrentAQI(BaseModel):
    aqi_in: int # Indian National AQI (CPCB)
    aqi_us: int # US EPA AQI
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
    source: str # Open-Meteo Air Quality / CPCB Compatible
    data_freshness: str # Live, Recent, Demo/Fallback
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
    ai_summary: str # "Your Air Quality Today" generated from real data
    cached: bool = False

# ----------------- Family Profiles -----------------
class FamilyMemberCreate(BaseModel):
    name: str
    relation: str # self, child, elderly, spouse, parent, other
    age_group: str # infant, child, teen, adult, senior
    sensitivity_profile: str = "standard" # standard, respiratory_sensitive, cardiovascular_sensitive, outdoor_athlete, outdoor_worker, student
    activity_preferences: str = "indoor_exercise,walking"

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
    period: str # Morning, Afternoon, Evening
    target_member: str
    recommendation: str
    reason: str
    expected_benefit: str
    estimated_cost: str
    difficulty: str # Low, Medium, High
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
    room_name: str
    room_size_sqft: float
    occupants: int = 1
    ventilation_type: str = "cross_windows" # cross_windows, single_window, sealed_ac, exhaust_only
    has_purifier: bool = False
    purifier_filter_type: str = "hepa_h13" # hepa_h13, basic, carbon, none
    cooking_smoke_exposure: str = "low" # high, moderate, low, none
    sensor_pm25: Optional[float] = None

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
    commute_mode: str # car_petrol, car_diesel, two_wheeler, bus, metro, bicycle, walk
    daily_distance_km: float
    schedule_type: str = "work_standard"
    waste_habits: Optional[str] = "segregated"

class SustainableAlternative(BaseModel):
    current_habit: str
    recommended_alternative: str
    cost_difference_monthly: str
    emissions_avoided_kg_co2_monthly: float
    pm25_avoided_g_monthly: float
    practical_difficulty: str # Easy, Moderate, Advanced
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
    risk_level: str # Low, Moderate, High, Severe
    confidence: str # High, Moderate, Exploratory
    primary_driver: str # Temperature inversion, rush hour traffic, wind stagnation, calm night

class PredictionResponse(BaseModel):
    current_aqi: int
    predicted_peaks: List[str]
    windows: List[PredictionWindow]
    weather_correlation_summary: str
    explanation: str
    disclaimer: str

# ----------------- Community -----------------
class CommunityCreate(BaseModel):
    name: str
    city: str
    description: str
    category: str = "neighborhood"

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
    challenge_id: int

class ChallengeCompleteRequest(BaseModel):
    challenge_id: int
    self_reported_notes: str

class CommunityReportCreate(BaseModel):
    community_id: Optional[int] = None
    title: str
    report_type: str # waste_burning, construction_dust, traffic_idling, industrial_emission, crop_burning, other
    description: str
    latitude: float
    longitude: float
    address: str
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
    activity_type: str # public_transit_used, cycling_trip, walking_trip, carpooling, energy_saved, waste_segregated, no_waste_burning
    units_count: float = 1.0 # km or kWh or events

class ImpactSummaryResponse(BaseModel):
    total_co2_avoided_kg: float
    total_pm25_avoided_g: float
    total_fuel_saved_liters: float
    total_money_saved_estimate: float
    activities_completed_count: int
    daily_history: List[Dict[str, Any]]
    methodology_note: str
    eco_score: int # 0-100 Family Eco Score

# ----------------- Assistant -----------------
class AssistantChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    language: str = "en" # "en" or "ml"
    location_name: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

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
    participating_families: int = 100
    avg_commute_km: float = 15.0
    shift_mode: str = "car_to_metro" # car_to_metro, car_to_bus, car_to_cycling, zero_waste_burning, energy_conservation

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
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    mode: str = "walking" # walking, cycling

class RouteOption(BaseModel):
    name: str # e.g. "Direct Arterial Route" vs "ClearSky Green & Residential Route"
    distance_km: float
    estimated_time_mins: int
    estimated_pm25_exposure_index: float # 0 - 100 (lower is better)
    pollution_exposure_label: str # "Elevated Traffic Exposure" vs "Lower Exposure Corridor"
    suitability: str
    route_path: List[List[float]] # coordinates [[lat, lon], ...]
    advantages: List[str]

class CleanRouteResponse(BaseModel):
    routes: List[RouteOption]
    guidance: str
    disclaimer: str

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
