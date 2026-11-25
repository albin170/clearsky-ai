import test from 'node:test';
import assert from 'node:assert/strict';
import { en } from '../locales/en';
import { ml } from '../locales/ml';
import { FALLBACK_REELS } from '../data/fallbackReels';
import { MONITORING_CITIES } from '../constants/cities';
import { api } from '../services/api';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

test('bilingual localization en.ts and ml.ts have complete key parity including prediction nav', () => {
  const enKeys = collectKeys(en as unknown as Record<string, unknown>);
  const mlKeys = collectKeys(ml as unknown as Record<string, unknown>);
  assert.deepEqual(mlKeys, enKeys, 'English and Malayalam translation trees must contain identical keys');
  assert.ok(enKeys.includes('nav.prediction'));
  assert.ok(enKeys.length > 80, 'Expected rich translation coverage across all modules');
});

test('monitoring cities constants have valid geographic bounds and unique names', () => {
  assert.ok(MONITORING_CITIES.length >= 8);
  const names = new Set<string>();
  for (const c of MONITORING_CITIES) {
    assert.ok(!names.has(c.name));
    names.add(c.name);
    assert.ok(c.lat >= -90 && c.lat <= 90);
    assert.ok(c.lon >= -180 && c.lon <= 180);
  }
});

test('fallback EcoReels dataset has valid schema, safe media paths, and unique IDs', () => {
  assert.ok(FALLBACK_REELS.length >= 6);
  const seenIds = new Set<string>();
  for (const reel of FALLBACK_REELS) {
    assert.ok(!seenIds.has(reel.id), `Duplicate reel id: ${reel.id}`);
    seenIds.add(reel.id);
    assert.ok(reel.title.length > 5);
    assert.ok(reel.caption.length > 10);
    assert.ok(reel.key_takeaway.length > 5);
    assert.ok(reel.video_url?.startsWith('/videos/') && reel.video_url.endsWith('.mp4'));
    assert.ok(reel.audio_url?.startsWith('/audio/') && reel.audio_url.endsWith('.mp3'));
    assert.ok(['smog_alert', 'health', 'home_hacks', 'stubble_fire', 'tech'].includes(reel.category));
  }
});

test('api service sends expected requests, headers, JSON bodies, handles 401 gracefully, and propagates errors', async () => {
  const store = new Map<string, string>();
  store.set('clearsky_token', 'test-jwt-token');
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
  };

  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });

    if (url.includes('/auth/login')) {
      return new Response(
        JSON.stringify({
          access_token: 'tok_123',
          user: {
            id: 1,
            email: 'user@clearsky.ai',
            full_name: 'Test User',
            role: 'standard_user',
            preferred_language: 'en',
            created_at: '2026-01-01T00:00:00Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (url.includes('/notifications/preferences') && init?.method === 'PUT') {
      return new Response(JSON.stringify({ detail: 'Notification settings updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.includes('/family/members') && !init?.method) {
      return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.includes('/reels/reel-1/like')) {
      return new Response(JSON.stringify({ id: 'reel-1', is_liked: true, likes_count: 14281 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.includes('/admin/health')) {
      return new Response(JSON.stringify({ detail: 'Forbidden access' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const loginRes = await api.login({ email: 'user@clearsky.ai', password: 'Password123!' });
    assert.equal(loginRes.access_token, 'tok_123');
    assert.equal(calls[0].init?.method, 'POST');

    const prefRes = await api.updateNotificationPreferences({ aqi_threshold: 175, quiet_hours_start: '22:30' });
    assert.equal(prefRes.detail, 'Notification settings updated');
    const prefCall = calls[1];
    const prefHeaders = (prefCall.init?.headers ?? {}) as Record<string, string>;
    assert.equal(prefHeaders['Authorization'], 'Bearer test-jwt-token');
    assert.deepEqual(JSON.parse(String(prefCall.init?.body)), { aqi_threshold: 175, quiet_hours_start: '22:30' });

    // Unauthenticated 401 returns empty list cleanly for optional household member fetch
    const members = await api.getFamilyMembers();
    assert.deepEqual(members, []);

    const likeRes = await api.toggleReelLike('reel-1');
    assert.equal(likeRes.is_liked, true);
    assert.equal(likeRes.likes_count, 14281);

    await assert.rejects(() => api.getAdminHealth(), /Forbidden access/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
