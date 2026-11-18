# ClearSky AI Architecture & Technical Design

## 1. Executive Overview

**ClearSky AI** is a production-quality, competition-winning environmental intelligence platform designed to empower citizens, families, and municipal communities to navigate severe winter smog and urban air pollution.

Unlike traditional static AQI dashboards that display uncontextualized numbers, ClearSky AI combines:
1. **Real Atmospheric Observations & Diurnal Physics:** Live hourly telemetry via Open-Meteo Air Quality & Weather APIs, parsed according to both the **Indian National AQI (CPCB)** framework and **US EPA** standards.
2. **Context-Aware Grounded Generative AI:** Strict retrieval-augmented grounding that pairs live sensor observations with verified health directives from the WHO, EPA, and CPCB, preventing AI hallucination of environmental metrics.
3. **Transparent Lifestyle & Impact Modeling:** Mathematically rigorous emission-avoidance calculations (utilizing verified ARAI, IPCC, and DEFRA factors) with explicit scientific transparency disclaimers.
4. **Inclusive Cross-Platform Accessibility:** Bilingual interface (English & Malayalam), dark/light/high-contrast accessibility themes, Web Speech recognition, and text-to-speech audio synthesis.

---

## 2. System Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|  React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts          |
|  - Intelligent Dashboard & Gauges         - GenAI Conversational Assistant      |
|  - Family Lifestyle Intelligence          - Room Health & CADR Optimizer        |
|  - Low-Emission Routine Generator         - 24h Prediction & Inversion Models   |
|  - Community Action Network               - Hotspot Map & Clean-Air Routing     |
|  - What-If Environmental Simulator        - Multilingual (English / Malayalam)  |
+---------------------------------------------------------------------------------+
                                       |
                           REST APIs / JSON / JWT
                                       |
+---------------------------------------------------------------------------------+
|                                BACKEND CORE                                     |
|  FastAPI (Async ASGI) + Pydantic v2 + SQLAlchemy (aiosqlite / PostgreSQL)       |
|  - Auth & RBAC (Super Admin, Moderator, Community Manager, Standard User)       |
|  - In-Memory High-Speed Cache & Rate Limiting                                   |
|  - Security Audit Logging & Data Privacy ("Right to be Forgotten" Purging)     |
+---------------------------------------------------------------------------------+
          |                                      |                     |
+----------------------+              +----------------------+  +-----------------+
| ENVIRONMENTAL APIS   |              | GENAI INTELLIGENCE   |  | STORAGE LAYER   |
| - Open-Meteo Air     |              | - Gemini 1.5/2.0 API |  | - SQLite Async  |
| - Open-Meteo Weather |              | - ClearSky Grounded  |  | - JSON Schemas  |
| - CPCB Calculations  |              |   Environmental RAG  |  | - Audit Trail   |
+----------------------+              +----------------------+  +-----------------+
```

---

## 3. Core Modules & Service Boundaries

### Module A: Intelligent Environmental Dashboard
- Ingests real-time concentrations for $PM_{2.5}$, $PM_{10}$, $NO_2$, $SO_2$, $CO$, and $O_3$.
- Computes individual sub-indices according to Central Pollution Control Board (CPCB) piecewise linear interpolation:
  $$I = \frac{I_{high} - I_{low}}{C_{high} - C_{low}} (C - C_{low}) + I_{low}$$
- Displays 24-hour diurnal forecasts, 7-day outlooks, and meteorological inversion correlations.

### Module B: ClearSky AI Assistant
- Dual-mode architecture:
  - When `GEMINI_API_KEY` is present: Generates conversational responses strictly grounded in structured prompt feeds.
  - Offline/Default: Executes the ClearSky Rule-Grounded Environmental RAG engine to provide zero-hallucination guidance in English and Malayalam.
- Supports voice input (Web Speech API) and text-to-speech (TTS).

### Module C: Family Lifestyle Intelligence
- Profiles vulnerable demographics (children, seniors, asthma sufferers, outdoor workers).
- Formulates customized morning, afternoon, and evening routines with difficulty ratings, costs, benefits, and source citations.

### Module D: Indoor Air Quality Optimizer
- Evaluates architectural ventilation, room volume, occupants, and filter grades to calculate a 0–100 Room Health Score.
- Computes required air purifier Clean Air Delivery Rate (CADR in CFM) using AHAM standards:
  $$\text{CADR}_{\text{CFM}} \ge \frac{2}{3} \times \text{Room Area (sq ft)}$$
- Identifies daily window ventilation windows based on outdoor convective lifting.

### Module E: Low-Emission Daily Routine Generator
- Analyzes daily commutes and computes baseline emissions against sustainable mass-transit alternatives (Metro, Bus, Active Cycling, Carpooling).
- Displays transparent monthly cost differences and emission avoidance metrics.

### Module F: Smart Pollution Prediction
- Simulates diurnal atmospheric behavior (morning inversion peaks, solar convective dispersion, evening traffic stagnation).
- Clearly demarcates modeled predictions from verified sensor readings.

### Module G: Community Action Network
- Neighborhood coalitions, collective challenges (e.g., 7 Days Without Car Trips, Clean Air School Commute), citizen pollution concerns, and Eco Points gamification.

### Module H: Pollution Map & Clean-Air Route Planner
- Visualizes monitoring station networks and compares Direct Arterial routes with Low-Exposure Green corridors, highlighting exposure vs. distance trade-offs.

### Module J: Impact Tracker & What-If Simulator
- Tracks cumulative emissions diverted, fuel saved, and personal Eco Scores.
- Interactive multi-variable simulator modeling community-scale lifestyle shifts.
