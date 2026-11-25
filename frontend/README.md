# ClearSky AI — Frontend Client

React 19 + TypeScript + Tailwind CSS v4 + Vite 8 interface for the **ClearSky AI Winter Smog & Urban Air Pollution Intelligence Platform**.

## Architecture

- `src/components/common/` — Shared accessible primitives (`ModalDialog`, `ErrorBoundary`).
- `src/components/dashboard/` — CPCB NAQI / US EPA gauge, pollutant breakdown, diurnal Recharts area visualization, inversion weather telemetry, 7-day forecast, and airshed comparator.
- `src/components/reels/` — Modular EcoReels vertical short-video player with synchronized MP3 audio, WebVTT captions, comments drawer, download sheet, and community creator modal.
- `src/components/{assistant,family,indoor,routine,prediction,map,community,impact,education,admin,settings}/` — Feature modules lazy-loaded via `React.lazy` + `<Suspense>`.
- `src/context/` — Auth, bilingual localization (`en` / `ml`), theme (`dark` / `light` / `contrast`), and live location telemetry providers.
- `src/services/api.ts` — Typed REST client communicating with `/api/v1`.
- `src/tests/` — Automated localization, schema, component rendering, accessibility, and API contract tests.

## Commands

```bash
npm install
npm run lint     # oxlint static analysis
npm test         # TypeScript compilation + Node test runner
npm run build    # Strict TypeScript check + code-split Vite production bundle
```
