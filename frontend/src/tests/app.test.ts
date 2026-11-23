import test from 'node:test';
import assert from 'node:assert/strict';
import { en } from '../locales/en.ts';
import { ml } from '../locales/ml.ts';
import { FALLBACK_REELS } from '../data/fallbackReels.ts';
import { api } from '../services/api.ts';

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

test('bilingual localization en.ts and ml.ts have complete key parity', () => {
  const enKeys = collectKeys(en as unknown as Record<string, unknown>);
  const mlKeys = collectKeys(ml as unknown as Record<string, unknown>);
  assert.deepEqual(mlKeys, enKeys, 'English and Malayalam translation trees must contain identical keys');
  assert.ok(enKeys.length > 80, 'Expected rich translation coverage across all modules');
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

test('api service sends expected requests, headers, JSON bodies, and throws descriptive errors', async () => {
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
          user: { id: 1, email: 'user@clearsky.ai', full_name: 'Test User', role: 'standard_user', preferred_language: 'en', created_at: '2026-01-01T00:00:00Z' },
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

    if (url.includes('/reels/reel-1/like')) {
      return new Response(JSON.stringify({ id: 'reel-1', is_liked: true, likes_count: 14281 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.includes('/fail-endpoint') || url.includes('/admin/health')) {
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
    // 1. Auth login
    const loginRes = await api.login({ email: 'user@clearsky.ai', password: 'Password123!' });
    assert.equal(loginRes.access_token, 'tok_123');
    assert.equal(calls[0].init?.method, 'POST');

    // 2. Notification preferences PUT includes Authorization header and JSON body
    const prefRes = await api.updateNotificationPreferences({ aqi_threshold: 175, quiet_hours_start: '22:30' });
    assert.equal(prefRes.detail, 'Notification settings updated');
    const prefCall = calls[1];
    const prefHeaders = (prefCall.init?.headers ?? {}) as Record<string, string>;
    assert.equal(prefHeaders['Authorization'], 'Bearer test-jwt-token');
    assert.deepEqual(JSON.parse(String(prefCall.init?.body)), { aqi_threshold: 175, quiet_hours_start: '22:30' });

    // 3. EcoReel like toggle
    const likeRes = await api.toggleReelLike('reel-1');
    assert.equal(likeRes.is_liked, true);
    assert.equal(likeRes.likes_count, 14281);

    // 4. Error handling propagates backend detail message cleanly
    await assert.rejects(() => api.getAdminHealth(), /Forbidden access/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
