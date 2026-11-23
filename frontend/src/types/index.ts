export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'super_admin' | 'moderator' | 'community_manager' | 'standard_user';
  preferred_language: string;
  default_city?: string;
  default_lat?: number;
  default_lon?: number;
  created_at: string;
}

export interface PollutantDetail {
  value: number;
  unit: string;
  sub_index?: number;
  status: string;
  health_implication: string;
}

export interface CurrentAQI {
  aqi_in: number;
  aqi_us: number;
  category_in: string;
  category_us: string;
  color_in: string;
  color_us: string;
  dominant_pollutant: string;
  pm2_5: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  timestamp: string;
  city: string;
  latitude: number;
  longitude: number;
  source: string;
  data_freshness: string;
  pollutants: Record<string, PollutantDetail>;
}

export interface WeatherData {
  temperature_c: number;
  relative_humidity: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  weather_code: number;
  weather_description: string;
  visibility_km?: number;
}

export interface HourlyForecastItem {
  time: string;
  aqi_in: number;
  aqi_us: number;
  pm2_5: number;
  pm10: number;
  temperature_c: number;
  wind_speed_kmh: number;
}

export interface DailyForecastItem {
  date: string;
  avg_aqi_in: number;
  avg_aqi_us: number;
  max_aqi_in: number;
  dominant_pollutant: string;
  category_in: string;
  weather_description: string;
}

export interface AirQualityResponse {
  current: CurrentAQI;
  weather: WeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  ai_summary: string;
  cached: boolean;
}

export interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  age_group: string;
  sensitivity_profile: string;
  activity_preferences: string;
  created_at: string;
}

export interface FamilyPlanActivity {
  period: string;
  target_member: string;
  recommendation: string;
  reason: string;
  expected_benefit: string;
  estimated_cost: string;
  difficulty: string;
  environmental_impact: string;
  source: string;
}

export interface FamilyDailyPlanResponse {
  date: string;
  aqi_context: number;
  aqi_category: string;
  activities: FamilyPlanActivity[];
  overview: string;
}

export interface RoomAssessment {
  id: number;
  room_name: string;
  room_size_sqft: number;
  occupants: number;
  ventilation_type: string;
  has_purifier: boolean;
  purifier_filter_type: string;
  cooking_smoke_exposure: string;
  calculated_score: number;
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

export interface VentilationWindowAdvice {
  optimal_window_opening_hours: string[];
  worst_window_opening_hours: string[];
  recommendation_text: string;
  air_purifier_cadre_recommendation_cfm: number;
  disclaimer: string;
}

export interface SustainableAlternative {
  current_habit: string;
  recommended_alternative: string;
  cost_difference_monthly: string;
  emissions_avoided_kg_co2_monthly: number;
  pm25_avoided_g_monthly: number;
  practical_difficulty: string;
  long_term_benefit: string;
  calculation_assumptions: string;
}

export interface RoutineOut {
  id: number;
  commute_mode: string;
  daily_distance_km: number;
  schedule_type: string;
  estimated_daily_co2_kg: number;
  estimated_daily_pm25_g: number;
  alternatives: SustainableAlternative[];
  created_at: string;
}

export interface PredictionWindow {
  time_window: string;
  estimated_aqi: number;
  risk_level: string;
  confidence: string;
  primary_driver: string;
}

export interface PredictionResponse {
  current_aqi: number;
  predicted_peaks: string[];
  windows: PredictionWindow[];
  weather_correlation_summary: string;
  explanation: string;
  disclaimer: string;
}

export interface Community {
  id: number;
  name: string;
  city: string;
  description: string;
  category: string;
  members_count: number;
  created_at: string;
}

export interface CommunityChallenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  points_reward: number;
  duration_days: number;
  participants_count: number;
  is_active: boolean;
}

export interface CommunityReport {
  id: number;
  title: string;
  report_type: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  reported_by?: string;
}

export interface ImpactSummary {
  total_co2_avoided_kg: number;
  total_pm25_avoided_g: number;
  total_fuel_saved_liters: number;
  total_money_saved_estimate: number;
  activities_completed_count: number;
  daily_history: Array<{
    activity: string;
    units: number;
    co2_saved_kg: number;
    pm25_avoided_g: number;
    fuel_saved_liters: number;
    date: string;
  }>;
  methodology_note: string;
  eco_score: number;
}

export interface WhatIfResponse {
  participating_families: number;
  daily_co2_avoided_kg: number;
  annual_co2_avoided_tons: number;
  annual_pm25_avoided_kg: number;
  annual_fuel_saved_liters: number;
  annual_community_cost_savings: number;
  assumptions_explained: string;
  disclaimer: string;
}

export interface RouteOption {
  name: string;
  distance_km: number;
  estimated_time_mins: number;
  estimated_pm25_exposure_index: number;
  pollution_exposure_label: string;
  suitability: string;
  route_path: number[][];
  advantages: string[];
}

export interface CleanRouteResponse {
  routes: RouteOption[];
  guidance: string;
  disclaimer: string;
}

export interface NotificationAlert {
  id: string;
  severity: 'high' | 'warning' | 'info';
  title: string;
  message: string;
  recommended_action: string;
}

export interface ReelComment {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: string;
}

export interface Reel {
  id: string;
  title: string;
  caption: string;
  tags: string[];
  category: 'smog_alert' | 'health' | 'home_hacks' | 'stubble_fire' | 'tech';
  creator_name: string;
  creator_handle: string;
  creator_avatar: string;
  creator_verified: boolean;
  audio_title: string;
  audio_artist: string;
  aqi_badge?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_liked: boolean;
  is_saved: boolean;
  video_url?: string;
  theme_gradient: string;
  visual_type: string;
  key_takeaway: string;
  action_cta?: {
    label: string;
    tab: string;
  };
  comments: ReelComment[];
}
