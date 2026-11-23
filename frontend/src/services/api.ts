import type {
  AirQualityResponse,
  User,
  UserRegisterInput,
  UserLoginInput,
  AuthTokenResponse,
  DetailResponse,
  FamilyMember,
  FamilyMemberCreateInput,
  FamilyDailyPlanResponse,
  RoomAssessment,
  RoomAssessmentCreateInput,
  VentilationWindowAdvice,
  RoutineOut,
  RoutineCreateInput,
  PredictionResponse,
  Community,
  CommunityCreateInput,
  CommunityChallenge,
  CommunityReport,
  CommunityReportCreateInput,
  ImpactSummary,
  ImpactLogCreateInput,
  ImpactLogResponse,
  WhatIfResponse,
  CleanRouteResponse,
  NotificationAlert,
  NotificationPreferences,
  LocationComparisonResponse,
  AssistantChatResponse,
  DailyBriefingResponse,
  EducationalTopic,
  QuizQuestion,
  SystemHealthResponse,
  AuditLogItem,
  Reel,
  ReelLikeResponse,
  ReelSaveResponse,
  ReelCommentResponse,
} from '../types';

const envMeta = import.meta as unknown as { env?: Record<string, string | undefined> };
const API_BASE = envMeta.env?.VITE_API_BASE_URL || '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('clearsky_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    let message = fallbackMessage;
    try {
      const errBody = (await res.json()) as { detail?: string };
      if (errBody && typeof errBody.detail === 'string') {
        message = errBody.detail;
      }
    } catch {
      // Keep fallback message when response body is not JSON
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async register(data: UserRegisterInput): Promise<AuthTokenResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthTokenResponse>(res, 'Registration failed');
  },

  async login(data: UserLoginInput): Promise<AuthTokenResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthTokenResponse>(res, 'Login failed');
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res, 'Not authenticated');
  },

  async deleteAccount(): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/auth/delete-account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<DetailResponse>(res, 'Failed to delete account');
  },

  // Air Quality
  async getAirQuality(lat: number, lon: number, city: string): Promise<AirQualityResponse> {
    const res = await fetch(
      `${API_BASE}/air-quality/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`,
    );
    return handleResponse<AirQualityResponse>(res, 'Failed to fetch air quality');
  },

  async getPresetCities(): Promise<Record<string, { name: string; lat: number; lon: number }>> {
    const res = await fetch(`${API_BASE}/air-quality/presets`);
    return handleResponse<Record<string, { name: string; lat: number; lon: number }>>(
      res,
      'Failed to load preset cities',
    );
  },

  async compareLocations(
    lat1: number,
    lon1: number,
    city1: string,
    lat2: number,
    lon2: number,
    city2: string,
  ): Promise<LocationComparisonResponse> {
    const res = await fetch(
      `${API_BASE}/air-quality/compare?lat1=${lat1}&lon1=${lon1}&city1=${encodeURIComponent(city1)}&lat2=${lat2}&lon2=${lon2}&city2=${encodeURIComponent(city2)}`,
    );
    return handleResponse<LocationComparisonResponse>(res, 'Failed to compare locations');
  },

  // Assistant
  async sendChatMessage(
    message: string,
    conversationId?: number,
    language: string = 'en',
    lat?: number,
    lon?: number,
    city?: string,
  ): Promise<AssistantChatResponse> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        language,
        lat,
        lon,
        location_name: city,
      }),
    });
    return handleResponse<AssistantChatResponse>(res, 'Assistant communication failed');
  },

  async getSuggestedQuestions(lang: string = 'en'): Promise<{ language: string; questions: string[] }> {
    const res = await fetch(`${API_BASE}/assistant/suggested-questions?lang=${encodeURIComponent(lang)}`);
    return handleResponse<{ language: string; questions: string[] }>(
      res,
      'Failed to load suggested questions',
    );
  },

  async getDailyBriefing(
    lat: number,
    lon: number,
    city: string,
    lang: string = 'en',
  ): Promise<DailyBriefingResponse> {
    const res = await fetch(
      `${API_BASE}/assistant/daily-briefing?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&lang=${encodeURIComponent(lang)}`,
    );
    return handleResponse<DailyBriefingResponse>(res, 'Failed to load daily briefing');
  },

  // Family
  async getFamilyMembers(): Promise<FamilyMember[]> {
    const res = await fetch(`${API_BASE}/family/members`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json() as Promise<FamilyMember[]>;
  },

  async addFamilyMember(data: FamilyMemberCreateInput): Promise<FamilyMember> {
    const res = await fetch(`${API_BASE}/family/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<FamilyMember>(res, 'Failed to add family member');
  },

  async deleteFamilyMember(id: number): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/family/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<DetailResponse>(res, 'Failed to delete family member');
  },

  async getFamilyDailyPlan(lat: number, lon: number, city: string): Promise<FamilyDailyPlanResponse> {
    const res = await fetch(
      `${API_BASE}/family/daily-plan?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`,
      { headers: getAuthHeaders() },
    );
    return handleResponse<FamilyDailyPlanResponse>(res, 'Failed to generate daily family plan');
  },

  // Indoor
  async getRoomAssessments(): Promise<RoomAssessment[]> {
    const res = await fetch(`${API_BASE}/indoor/assessments`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json() as Promise<RoomAssessment[]>;
  },

  async createRoomAssessment(data: RoomAssessmentCreateInput): Promise<RoomAssessment> {
    const res = await fetch(`${API_BASE}/indoor/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<RoomAssessment>(res, 'Failed to analyze room');
  },

  async deleteRoomAssessment(id: number): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/indoor/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<DetailResponse>(res, 'Failed to delete room assessment');
  },

  async getVentilationAdvice(roomSize: number, outdoorAqi: number): Promise<VentilationWindowAdvice> {
    const res = await fetch(
      `${API_BASE}/indoor/ventilation-advice?room_size_sqft=${roomSize}&outdoor_aqi=${outdoorAqi}`,
    );
    return handleResponse<VentilationWindowAdvice>(res, 'Failed to fetch ventilation advice');
  },

  // Routine
  async getMyRoutine(): Promise<RoutineOut | null> {
    const res = await fetch(`${API_BASE}/routine/my-routine`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return res.json() as Promise<RoutineOut | null>;
  },

  async generateRoutine(data: RoutineCreateInput): Promise<RoutineOut> {
    const res = await fetch(`${API_BASE}/routine/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<RoutineOut>(res, 'Failed to generate routine');
  },

  // Prediction
  async getPrediction(lat: number, lon: number, city: string): Promise<PredictionResponse> {
    const res = await fetch(
      `${API_BASE}/prediction/forecast?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`,
    );
    return handleResponse<PredictionResponse>(res, 'Failed to load pollution prediction');
  },

  // Community
  async getCommunities(): Promise<Community[]> {
    const res = await fetch(`${API_BASE}/community/list`);
    return handleResponse<Community[]>(res, 'Failed to fetch communities');
  },

  async createCommunity(data: CommunityCreateInput): Promise<Community> {
    const res = await fetch(`${API_BASE}/community/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Community>(res, 'Failed to create community');
  },

  async joinCommunity(id: number): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/community/join/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<DetailResponse>(res, 'Failed to join community');
  },

  async getChallenges(): Promise<CommunityChallenge[]> {
    const res = await fetch(`${API_BASE}/community/challenges`);
    return handleResponse<CommunityChallenge[]>(res, 'Failed to fetch challenges');
  },

  async joinChallenge(id: number): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/community/challenges/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ challenge_id: id }),
    });
    return handleResponse<DetailResponse>(res, 'Failed to join challenge');
  },

  async completeChallenge(id: number, notes: string): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/community/challenges/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ challenge_id: id, self_reported_notes: notes }),
    });
    return handleResponse<DetailResponse>(res, 'Failed to complete challenge');
  },

  async getCommunityReports(): Promise<CommunityReport[]> {
    const res = await fetch(`${API_BASE}/community/reports`);
    return handleResponse<CommunityReport[]>(res, 'Failed to load community reports');
  },

  async submitCommunityReport(data: CommunityReportCreateInput): Promise<CommunityReport> {
    const res = await fetch(`${API_BASE}/community/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CommunityReport>(res, 'Failed to submit community report');
  },

  // Impact
  async getImpactSummary(): Promise<ImpactSummary> {
    const res = await fetch(`${API_BASE}/impact/summary`, { headers: getAuthHeaders() });
    return handleResponse<ImpactSummary>(res, 'Failed to load impact summary');
  },

  async logImpactActivity(data: ImpactLogCreateInput): Promise<ImpactLogResponse> {
    const res = await fetch(`${API_BASE}/impact/log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ImpactLogResponse>(res, 'Failed to log impact activity');
  },

  async runWhatIfSimulation(families: number, commuteKm: number, shiftMode: string): Promise<WhatIfResponse> {
    const res = await fetch(`${API_BASE}/impact/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participating_families: families,
        avg_commute_km: commuteKm,
        shift_mode: shiftMode,
      }),
    });
    return handleResponse<WhatIfResponse>(res, 'Failed to run simulation');
  },

  // Clean Route
  async planCleanRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    mode: string = 'walking',
  ): Promise<CleanRouteResponse> {
    const res = await fetch(`${API_BASE}/routes/clean-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat: startLat,
        start_lon: startLon,
        end_lat: endLat,
        end_lon: endLon,
        mode,
      }),
    });
    return handleResponse<CleanRouteResponse>(res, 'Failed to plan clean route');
  },

  // Education
  async getEducationalTopics(lang: string = 'en'): Promise<EducationalTopic[]> {
    const res = await fetch(`${API_BASE}/education/topics?lang=${encodeURIComponent(lang)}`);
    return handleResponse<EducationalTopic[]>(res, 'Failed to load educational topics');
  },

  async getQuiz(): Promise<QuizQuestion[]> {
    const res = await fetch(`${API_BASE}/education/quiz`);
    return handleResponse<QuizQuestion[]>(res, 'Failed to load quiz');
  },

  async getDailyFacts(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/education/daily-facts`);
    return handleResponse<string[]>(res, 'Failed to load daily facts');
  },

  // Notifications
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, { headers: getAuthHeaders() });
    return handleResponse<NotificationPreferences>(res, 'Failed to load notification preferences');
  },

  async updateNotificationPreferences(data: Partial<NotificationPreferences>): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<DetailResponse>(res, 'Failed to update notification preferences');
  },

  async getActiveAlerts(lat: number, lon: number, city: string): Promise<NotificationAlert[]> {
    const res = await fetch(
      `${API_BASE}/notifications/active-alerts?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`,
      { headers: getAuthHeaders() },
    );
    return handleResponse<NotificationAlert[]>(res, 'Failed to fetch active alerts');
  },

  // Admin
  async getAdminHealth(): Promise<SystemHealthResponse> {
    const res = await fetch(`${API_BASE}/admin/health`, { headers: getAuthHeaders() });
    return handleResponse<SystemHealthResponse>(res, 'Failed to load admin health telemetry');
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
    return handleResponse<User[]>(res, 'Failed to load admin users');
  },

  async updateAdminUserRole(userId: number, role: string): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role?new_role=${encodeURIComponent(role)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse<DetailResponse>(res, 'Failed to update user role');
  },

  async toggleAdminUserActive(userId: number): Promise<DetailResponse> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse<DetailResponse>(res, 'Failed to toggle user status');
  },

  async getAdminReports(): Promise<CommunityReport[]> {
    const res = await fetch(`${API_BASE}/admin/moderation/reports`, { headers: getAuthHeaders() });
    return handleResponse<CommunityReport[]>(res, 'Failed to load admin reports');
  },

  async moderateReport(reportId: number, status: string): Promise<DetailResponse> {
    const res = await fetch(
      `${API_BASE}/admin/moderation/reports/${reportId}?status_update=${encodeURIComponent(status)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
      },
    );
    return handleResponse<DetailResponse>(res, 'Failed to moderate report');
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getAuthHeaders() });
    return handleResponse<AuditLogItem[]>(res, 'Failed to load audit logs');
  },

  // EcoReels - Environmental Shorts
  async getReels(category?: string, search?: string): Promise<Reel[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/reels${qs}`);
    return handleResponse<Reel[]>(res, 'Failed to load reels');
  },

  async toggleReelLike(reelId: string): Promise<ReelLikeResponse> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/like`, { method: 'POST' });
    return handleResponse<ReelLikeResponse>(res, 'Failed to toggle like');
  },

  async toggleReelSave(reelId: string): Promise<ReelSaveResponse> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/save`, { method: 'POST' });
    return handleResponse<ReelSaveResponse>(res, 'Failed to toggle bookmark');
  },

  async addReelComment(
    reelId: string,
    text: string,
    author?: string,
    handle?: string,
  ): Promise<ReelCommentResponse> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        author: author || 'EcoCitizen',
        handle: handle || '@citizen_eco',
      }),
    });
    return handleResponse<ReelCommentResponse>(res, 'Failed to post comment');
  },

  async createReel(data: Partial<Reel>): Promise<Reel> {
    const res = await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Reel>(res, 'Failed to create reel');
  },
};
