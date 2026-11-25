import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AuthContext,
  LanguageContext,
  LocationContext,
  ThemeContext,
  type AuthContextType,
  type LanguageContextType,
  type LocationContextType,
  type ThemeContextType,
} from '../context/hooks';
import { en } from '../locales/en';
import { ml } from '../locales/ml';
import { FALLBACK_REELS } from '../data/fallbackReels';
import type { AirQualityResponse, User } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { AuthModal } from '../components/layout/AuthModal';
import { EmergencyModal } from '../components/emergency/EmergencyModal';
import { DashboardView } from '../components/dashboard/DashboardView';
import { ReelPlayerCard } from '../components/reels/ReelPlayerCard';
import { buildReelCaptionsDataUri } from '../components/reels/reelUtils';
import { ReelsView } from '../components/reels/ReelsView';
import { AssistantView } from '../components/assistant/AssistantView';
import { FamilyView } from '../components/family/FamilyView';
import { IndoorView } from '../components/indoor/IndoorView';
import { RoutineView } from '../components/routine/RoutineView';
import { MapView } from '../components/map/MapView';
import { CommunityView } from '../components/community/CommunityView';
import { ImpactView } from '../components/impact/ImpactView';
import { EducationView } from '../components/education/EducationView';
import { AdminView } from '../components/admin/AdminView';
import { SettingsView } from '../components/settings/SettingsView';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const SAMPLE_AQ: AirQualityResponse = {
  current: {
    aqi_in: 245,
    aqi_us: 210,
    category_in: 'Poor',
    category_us: 'Very Unhealthy',
    color_in: '#f97316',
    color_us: '#a855f7',
    dominant_pollutant: 'PM2.5',
    pm2_5: 104.2,
    pm10: 178.5,
    o3: 42.0,
    no2: 51.3,
    so2: 12.4,
    co: 0.85,
    timestamp: '2026-11-25T08:00:00Z',
    city: 'Delhi NCR',
    latitude: 28.6139,
    longitude: 77.209,
    source: 'Open-Meteo Air Quality & CPCB Standard',
    data_freshness: 'Live Satellite & Station Reanalysis',
    pollutants: {
      pm2_5: {
        value: 104.2,
        unit: 'µg/m³',
        sub_index: 245,
        status: 'Poor',
        health_implication: 'Fine particulate penetrates deep into lung tissue.',
      },
      pm10: {
        value: 178.5,
        unit: 'µg/m³',
        sub_index: 152,
        status: 'Moderate',
        health_implication: 'Coarse particles irritate upper airways.',
      },
      no2: {
        value: 51.3,
        unit: 'µg/m³',
        sub_index: 64,
        status: 'Satisfactory',
        health_implication: 'Traffic exhaust.',
      },
      so2: {
        value: 12.4,
        unit: 'µg/m³',
        sub_index: 16,
        status: 'Good',
        health_implication: 'Low SO2.',
      },
      co: {
        value: 0.85,
        unit: 'mg/m³',
        sub_index: 42,
        status: 'Good',
        health_implication: 'Low CO.',
      },
      o3: {
        value: 42.0,
        unit: 'µg/m³',
        sub_index: 42,
        status: 'Good',
        health_implication: 'Low ozone.',
      },
    },
  },
  weather: {
    temperature_c: 14.5,
    relative_humidity: 76,
    wind_speed_kmh: 5.4,
    wind_direction_deg: 315,
    wind_direction_cardinal: 'NW',
    weather_code: 45,
    weather_description: 'Fog and depositing rime fog',
    visibility_km: 2.1,
  },
  hourly: [
    { time: '08:00', aqi_in: 245, aqi_us: 210, pm2_5: 104.2, pm10: 178.5, temperature_c: 14.5, wind_speed_kmh: 5.4 },
    { time: '12:00', aqi_in: 165, aqi_us: 152, pm2_5: 72.0, pm10: 130.0, temperature_c: 21.0, wind_speed_kmh: 9.2 },
  ],
  daily: [
    {
      date: 'Today',
      avg_aqi_in: 220,
      avg_aqi_us: 195,
      max_aqi_in: 260,
      dominant_pollutant: 'PM2.5',
      category_in: 'Poor',
      weather_description: 'Clear to Hazy',
    },
  ],
  ai_summary: 'Air quality in Delhi NCR is Poor (AQI 245). Close windows during morning inversion peaks.',
  cached: false,
};

function makeTranslator(lang: 'en' | 'ml') {
  const tree = (lang === 'ml' ? ml : en) as Record<string, unknown>;
  return (path: string): string => {
    let cur: unknown = tree;
    for (const part of path.split('.')) {
      if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return typeof cur === 'string' ? cur : path;
  };
}

function renderWithProviders(
  node: React.ReactElement,
  opts: {
    lang?: 'en' | 'ml';
    user?: User | null;
    aqiStandard?: 'in' | 'us';
    isLoading?: boolean;
    error?: string | null;
  } = {},
): string {
  const lang = opts.lang ?? 'en';
  const authVal: AuthContextType = {
    user: opts.user ?? null,
    token: opts.user ? 'tok' : null,
    isLoading: false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    deleteAccount: async () => {},
  };
  const langVal: LanguageContextType = {
    language: lang,
    setLanguage: () => {},
    t: makeTranslator(lang),
  };
  const locVal: LocationContextType = {
    currentCity: 'Delhi NCR',
    currentLat: 28.6139,
    currentLon: 77.209,
    airQuality: SAMPLE_AQ,
    isLoading: opts.isLoading ?? false,
    error: opts.error ?? null,
    aqiStandard: opts.aqiStandard ?? 'in',
    setAqiStandard: () => {},
    setLocation: () => {},
    detectGeolocation: () => {},
    refreshData: async () => {},
  };
  const themeVal: ThemeContextType = {
    theme: 'dark',
    setTheme: () => {},
    toggleTheme: () => {},
  };

  return renderToStaticMarkup(
    <AuthContext.Provider value={authVal}>
      <LanguageContext.Provider value={langVal}>
        <ThemeContext.Provider value={themeVal}>
          <LocationContext.Provider value={locVal}>{node}</LocationContext.Provider>
        </ThemeContext.Provider>
      </LanguageContext.Provider>
    </AuthContext.Provider>,
  );
}

function assertWcagStaticInvariants(html: string, viewName: string) {
  // 1. Must contain at least one primary <h1> heading
  assert.match(html, /<h1[\s>]/, `${viewName} must render an <h1> heading`);

  // 2. Heading hierarchy must not skip levels (e.g. h1 -> h3 without h2)
  const headingLevels = Array.from(html.matchAll(/<h([1-6])[\s>]/g)).map((m) => Number(m[1]));
  let maxSeen = 0;
  for (const level of headingLevels) {
    if (maxSeen > 0 && level > maxSeen + 1) {
      assert.fail(`${viewName} skipped heading level from h${maxSeen} to h${level}`);
    }
    if (level > maxSeen) maxSeen = level;
  }

  // 3. Every <button> must declare an explicit type ("button" or "submit")
  const buttons = Array.from(html.matchAll(/<button\b([^>]*)>/g));
  assert.ok(buttons.length > 0 || viewName.includes('Loading'), `${viewName} rendered buttons check`);
  for (const [, attrs] of buttons) {
    assert.match(attrs, /\btype="(button|submit)"/, `${viewName} has <button> without explicit type: ${attrs}`);
  }

  // 4. Every <img ...> must include an alt attribute
  for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/g)) {
    assert.match(attrs, /\balt="/, `${viewName} has <img> missing alt attribute: ${attrs}`);
  }

  // 5. Every form control (<input>, <select>, <textarea>) must have an id referenced by <label for="..."> or aria-label
  const labelForIds = new Set(Array.from(html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)).map((m) => m[1]));
  for (const [fullTag, attrs] of html.matchAll(/<(?:input|select|textarea)\b([^>]*)>/g)) {
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    const hasAriaLabel = /\baria-label="[^"]+"/.test(attrs);
    assert.ok(
      hasAriaLabel || (idMatch && labelForIds.has(idMatch[1])),
      `${viewName} has unlabeled form control: ${fullTag}`,
    );
  }
}

test('layout navigation renders accessible landmarks, bilingual Malayalam labels, and role-gated Admin portal', () => {
  const navEn = renderWithProviders(<Navbar onOpenAuth={() => {}} />);
  assert.match(navEn, /<header\b/);
  assert.match(navEn, /CPCB NAQI/);
  assert.match(navEn, /Activate Emergency Smog Defense Mode/);

  const sidebarStd = renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={() => {}} />);
  assert.match(sidebarStd, /aria-current="page"/);
  assert.doesNotMatch(sidebarStd, /Admin Portal/);

  const adminUser: User = {
    id: 1,
    email: 'admin@example.com',
    full_name: 'Admin Ops',
    role: 'super_admin',
    preferred_language: 'ml',
    created_at: '2026-01-01T00:00:00Z',
  };
  const sidebarAdminMl = renderWithProviders(<Sidebar activeTab="prediction" setActiveTab={() => {}} />, {
    lang: 'ml',
    user: adminUser,
  });
  assert.match(sidebarAdminMl, /പ്രവചനങ്ങൾ/);
  assert.match(sidebarAdminMl, /അഡ്മിൻ പോർട്ടൽ/);

  const mobileMl = renderWithProviders(<MobileNav activeTab="reels" setActiveTab={() => {}} />, { lang: 'ml' });
  assert.match(mobileMl, /ഇക്കോ റീൽസ്/);
});

test('DashboardView renders loading, error, CPCB NAQI, US EPA, High Inversion Risk, and passes WCAG checks', () => {
  const loadingHtml = renderWithProviders(<DashboardView />, { isLoading: true });
  assert.match(loadingHtml, /role="status"/);
  assert.match(loadingHtml, /<h1[\s>]/);

  const errorHtml = renderWithProviders(<DashboardView />, { error: 'Gateway timeout' });
  assert.match(errorHtml, /role="alert"/);
  assert.match(errorHtml, /Gateway timeout/);
  assertWcagStaticInvariants(errorHtml, 'DashboardView(error)');

  const dashIn = renderWithProviders(<DashboardView />, { aqiStandard: 'in' });
  assert.match(dashIn, /Indian NAQI \(CPCB\)/);
  assert.match(dashIn, /HIGH INVERSION RISK/);
  assert.match(dashIn, /2\.1/); // visibility_km rendered
  assertWcagStaticInvariants(dashIn, 'DashboardView(CPCB)');

  const dashUs = renderWithProviders(<DashboardView />, { aqiStandard: 'us' });
  assert.match(dashUs, /US EPA Index/);
  assert.match(dashUs, /Very Unhealthy/);
});

test('EcoReels player renders streaming MP4 video, WebVTT captions track, MP3 audio, and accessible controls', () => {
  const reel = FALLBACK_REELS[0];
  const vttUri = buildReelCaptionsDataUri(reel);
  assert.ok(vttUri.startsWith('data:text/vtt;charset=utf-8,'));
  const decodedVtt = decodeURIComponent(vttUri.split(',')[1]);
  assert.match(decodedVtt, /^WEBVTT/);
  assert.ok(decodedVtt.includes(reel.title));
  assert.ok(decodedVtt.includes(reel.key_takeaway));

  const cardHtml = renderToStaticMarkup(
    <ReelPlayerCard
      currentReel={reel}
      reelsCount={6}
      currentIndex={0}
      isPlaying={true}
      isMuted={false}
      showPlayOverlay={false}
      showHeartBurst={false}
      videoProgress={42}
      isFollowing={false}
      videoRef={{ current: null }}
      audioRef={{ current: null }}
      onCardTap={() => {}}
      onTogglePlayPause={() => {}}
      onToggleMute={() => {}}
      onTouchStart={() => {}}
      onTouchEnd={() => {}}
      onTimeUpdate={() => {}}
      onLike={() => {}}
      onSave={() => {}}
      onShare={() => {}}
      onOpenComments={() => {}}
      onOpenDownload={() => {}}
      onToggleFollow={() => {}}
    />,
  );
  assert.match(cardHtml, /<video\b[^>]*preload="metadata"/);
  assert.match(cardHtml, /<track\b[^>]*kind="captions"/);
  assert.match(cardHtml, /<audio\b[^>]*preload="metadata"/);
  assert.match(cardHtml, /aria-label="Pause video playback"/);
  assert.match(cardHtml, /role="progressbar"/);
  assert.match(cardHtml, /aria-valuenow="42"/);

  const reelsViewHtml = renderWithProviders(<ReelsView />);
  assertWcagStaticInvariants(reelsViewHtml, 'ReelsView');
});

test('Modals, ErrorBoundary, and all secondary feature views pass WCAG heading, form label, and button checks', () => {
  const authDialog = renderWithProviders(<AuthModal isOpen={true} onClose={() => {}} />);
  assert.match(authDialog, /role="dialog"/);
  assert.match(authDialog, /aria-modal="true"/);

  const emergencyMl = renderWithProviders(<EmergencyModal isOpen={true} onClose={() => {}} />, { lang: 'ml' });
  assert.match(emergencyMl, /role="dialog"/);
  assert.match(emergencyMl, /അടിയന്തര പുകമഞ്ഞ് പ്രതിരോധം/);

  const Views: Array<[string, React.ReactElement]> = [
    ['AssistantView', <AssistantView key="assistant" />],
    ['FamilyView', <FamilyView key="family" />],
    ['IndoorView', <IndoorView key="indoor" />],
    ['RoutineView', <RoutineView key="routine" />],
    ['MapView', <MapView key="map" />],
    ['CommunityView', <CommunityView key="community" />],
    ['ImpactView', <ImpactView key="impact" />],
    ['EducationView', <EducationView key="education" />],
    ['AdminView', <AdminView key="admin" />],
    ['SettingsView', <SettingsView key="settings" />],
  ];

  const adminUser: User = {
    id: 1,
    email: 'admin@example.com',
    full_name: 'Admin Ops',
    role: 'super_admin',
    preferred_language: 'en',
    created_at: '2026-01-01T00:00:00Z',
  };

  for (const [name, element] of Views) {
    const html = renderWithProviders(element, { user: adminUser });
    assertWcagStaticInvariants(html, name);
  }

  // ErrorBoundary normal render
  const okBoundary = renderToStaticMarkup(
    <ErrorBoundary>
      <section>Healthy View</section>
    </ErrorBoundary>,
  );
  assert.match(okBoundary, /Healthy View/);
});
