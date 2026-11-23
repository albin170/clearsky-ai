import { 
  AirQualityResponse, User, FamilyMember, FamilyDailyPlanResponse,
  RoomAssessment, VentilationWindowAdvice, RoutineOut, PredictionResponse,
  Community, CommunityChallenge, CommunityReport, ImpactSummary,
  WhatIfResponse, CleanRouteResponse, NotificationAlert, Reel, ReelComment
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('clearsky_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: any): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(data: any): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async deleteAccount(): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/delete-account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Air Quality
  async getAirQuality(lat: number, lon: number, city: string): Promise<AirQualityResponse> {
    const res = await fetch(`${API_BASE}/air-quality/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error('Failed to fetch air quality');
    return res.json();
  },

  async getPresetCities(): Promise<Record<string, { name: string; lat: number; lon: number }>> {
    const res = await fetch(`${API_BASE}/air-quality/presets`);
    return res.json();
  },

  async compareLocations(lat1: number, lon1: number, city1: string, lat2: number, lon2: number, city2: string): Promise<any> {
    const res = await fetch(`${API_BASE}/air-quality/compare?lat1=${lat1}&lon1=${lon1}&city1=${encodeURIComponent(city1)}&lat2=${lat2}&lon2=${lon2}&city2=${encodeURIComponent(city2)}`);
    return res.json();
  },

  // Assistant
  async sendChatMessage(message: string, conversationId?: number, language: string = 'en', lat?: number, lon?: number, city?: string): Promise<any> {
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
    if (!res.ok) throw new Error('Assistant communication failed');
    return res.json();
  },

  async getSuggestedQuestions(lang: string = 'en'): Promise<{ language: string; questions: string[] }> {
    const res = await fetch(`${API_BASE}/assistant/suggested-questions?lang=${lang}`);
    return res.json();
  },

  async getDailyBriefing(lat: number, lon: number, city: string, lang: string = 'en'): Promise<any> {
    const res = await fetch(`${API_BASE}/assistant/daily-briefing?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&lang=${lang}`);
    return res.json();
  },

  // Family
  async getFamilyMembers(): Promise<FamilyMember[]> {
    const res = await fetch(`${API_BASE}/family/members`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async addFamilyMember(data: any): Promise<FamilyMember> {
    const res = await fetch(`${API_BASE}/family/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add family member');
    return res.json();
  },

  async deleteFamilyMember(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/family/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getFamilyDailyPlan(lat: number, lon: number, city: string): Promise<FamilyDailyPlanResponse> {
    const res = await fetch(`${API_BASE}/family/daily-plan?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate daily family plan');
    return res.json();
  },

  // Indoor
  async getRoomAssessments(): Promise<RoomAssessment[]> {
    const res = await fetch(`${API_BASE}/indoor/assessments`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createRoomAssessment(data: any): Promise<RoomAssessment> {
    const res = await fetch(`${API_BASE}/indoor/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to analyze room');
    return res.json();
  },

  async deleteRoomAssessment(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/indoor/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getVentilationAdvice(roomSize: number, outdoorAqi: number): Promise<VentilationWindowAdvice> {
    const res = await fetch(`${API_BASE}/indoor/ventilation-advice?room_size_sqft=${roomSize}&outdoor_aqi=${outdoorAqi}`);
    return res.json();
  },

  // Routine
  async getMyRoutine(): Promise<RoutineOut | null> {
    const res = await fetch(`${API_BASE}/routine/my-routine`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return res.json();
  },

  async generateRoutine(data: any): Promise<RoutineOut> {
    const res = await fetch(`${API_BASE}/routine/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate routine');
    return res.json();
  },

  // Prediction
  async getPrediction(lat: number, lon: number, city: string): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/prediction/forecast?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
    return res.json();
  },

  // Community
  async getCommunities(): Promise<Community[]> {
    const res = await fetch(`${API_BASE}/community/list`);
    return res.json();
  },

  async createCommunity(data: any): Promise<Community> {
    const res = await fetch(`${API_BASE}/community/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async joinCommunity(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/community/join/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getChallenges(): Promise<CommunityChallenge[]> {
    const res = await fetch(`${API_BASE}/community/challenges`);
    return res.json();
  },

  async joinChallenge(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/community/challenges/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ challenge_id: id }),
    });
    return res.json();
  },

  async completeChallenge(id: number, notes: string): Promise<any> {
    const res = await fetch(`${API_BASE}/community/challenges/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ challenge_id: id, self_reported_notes: notes }),
    });
    return res.json();
  },

  async getCommunityReports(): Promise<CommunityReport[]> {
    const res = await fetch(`${API_BASE}/community/reports`);
    return res.json();
  },

  async submitCommunityReport(data: any): Promise<CommunityReport> {
    const res = await fetch(`${API_BASE}/community/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Impact
  async getImpactSummary(): Promise<ImpactSummary> {
    const res = await fetch(`${API_BASE}/impact/summary`, { headers: getAuthHeaders() });
    return res.json();
  },

  async logImpactActivity(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/impact/log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
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
    return res.json();
  },

  // Clean Route
  async planCleanRoute(startLat: number, startLon: number, endLat: number, endLon: number, mode: string = 'walking'): Promise<CleanRouteResponse> {
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
    return res.json();
  },

  // Education
  async getEducationalTopics(lang: string = 'en'): Promise<any[]> {
    const res = await fetch(`${API_BASE}/education/topics?lang=${lang}`);
    return res.json();
  },

  async getQuiz(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/education/quiz`);
    return res.json();
  },

  async getDailyFacts(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/education/daily-facts`);
    return res.json();
  },

  // Notifications
  async getNotificationPreferences(): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateNotificationPreferences(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getActiveAlerts(lat: number, lon: number, city: string): Promise<NotificationAlert[]> {
    const res = await fetch(`${API_BASE}/notifications/active-alerts?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Admin
  async getAdminHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/health`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateAdminUserRole(userId: number, role: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role?new_role=${role}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async toggleAdminUserActive(userId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminReports(): Promise<CommunityReport[]> {
    const res = await fetch(`${API_BASE}/admin/moderation/reports`, { headers: getAuthHeaders() });
    return res.json();
  },

  async moderateReport(reportId: number, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/moderation/reports/${reportId}?status_update=${status}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getAuthHeaders() });
    return res.json();
  },

  // EcoReels - Environmental Shorts
  async getReels(category?: string, search?: string): Promise<Reel[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/reels${qs}`);
    if (!res.ok) throw new Error('Failed to load reels');
    return res.json();
  },

  async toggleReelLike(reelId: string): Promise<{ id: string; is_liked: boolean; likes_count: number }> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/like`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  async toggleReelSave(reelId: string): Promise<{ id: string; is_saved: boolean }> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/save`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return res.json();
  },

  async addReelComment(reelId: string, text: string, author?: string, handle?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        author: author || 'EcoCitizen',
        handle: handle || '@citizen_eco'
      }),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  async createReel(data: Partial<Reel>): Promise<Reel> {
    const res = await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create reel');
    return res.json();
  },
};
