# ClearSky AI
## GenAI-Powered Winter Smog & Urban Air Pollution Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-teal.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passing-brightgreen.svg)]()

> **ClearSky AI** transforms complex atmospheric telemetry into actionable, personalized, and community-driven decisions. It is designed from the ground up to solve the seasonal winter smog crisis and chronic urban particulate exposure faced by millions of citizens.

---

## 1. Core Problem & Mission

Severe winter smog and urban air pollution represent an acute public health crisis. Citizens routinely struggle with:
- **Incomprehensible AQI Values:** Generic numerical indices fail to communicate biological risks.
- **Activity Timing Uncertainty:** Not knowing which diurnal hours are safe for children or outdoor exercise.
- **Indoor Infiltration:** Failing to recognize that unventilated homes can harbor toxic concentrations of PM2.5 and cooking VOCs.
- **Lack of Personal Low-Emission Alternatives:** Citizens want to contribute to cleaner skies but lack quantified savings calculations.
- **Atmospheric Physics Misunderstanding:** Misunderstanding winter **thermal inversions**, where nighttime ground cooling physically traps vehicle and biomass smoke beneath a 100-meter atmospheric ceiling.

### ClearSky AI Answers 5 Core Questions:
1. **What is happening to the air around me?** Real-time sensor observations with sub-indices for PM2.5, PM10, NO2, SO2, CO, and O3 under CPCB National AQI and US EPA standards.
2. **How does the current situation affect my daily activities?** Context-aware guidance for exercise, window opening, and transit.
3. **What should my family do differently today?** Age- and sensitivity-stratified morning, afternoon, and evening action roadmaps.
4. **How can I reduce my contribution to pollution?** Quantified lifestyle alternatives (Metro, bus, active cycling, zero-waste burning) with transparent monthly savings.
5. **How much impact are my actions creating?** Cumulative carbon and particulate emission avoidance tracking and personal Family Eco Scores.

---

## 2. Complete Module Matrix

### Module A: Intelligent Environmental Dashboard
- **Dual Standard AQI Gauge:** Toggle seamlessly between **Indian National AQI (CPCB)** and **US EPA** standards.
- **Comprehensive Pollutant Grid:** Live $PM_{2.5}$, $PM_{10}$, $NO_2$, $SO_2$, $CO$, and $O_3$ concentrations with individual sub-indices.
- **24-Hour Diurnal Trend Chart:** Recharts visualization plotting boundary layer diurnal cycles against safety limits.
- **7-Day Atmospheric Outlook:** Multi-day forecast with dominant pollutant identification.
- **Meteorological & Inversion Dynamics:** Temperature, relative humidity, wind speed, and thermal inversion risk assessment.
- **"Your Air Quality Today" AI Synthesis:** Prominent daily briefing with Web Speech text-to-speech audio playback.
- **Side-by-Side Airshed Comparison:** Compare two cities simultaneously (e.g., Delhi vs. Kochi, Bengaluru vs. Mumbai).

### Module B: ClearSky AI Personal Assistant
- **Context-Aware Grounded GenAI:** Combines the user's location, live AQI, and family profile into structured prompts.
- **Zero-Hallucination Fallback:** When `GEMINI_API_KEY` is not provided, executes the ClearSky Environmental RAG Engine.
- **Bilingual English & Malayalam:** Full conversational support in authentic Malayalam (മലയാളം) and English.
- **Voice Input (Speech Recognition):** Hands-free voice querying using the Web Speech Recognition API.
- **Downloadable Daily Action Plans:** One-click PDF export containing tailored daily recommendations, citations, and medical disclaimers.

### Module C: Family Lifestyle Intelligence
- **Demographic Profiles:** Profiles for infants, school children, teenagers, adults, seniors, asthma sufferers, and outdoor athletes.
- **Non-Invasive Privacy:** Collects functional sensitivities without demanding private medical records.
- **Daily Family Roadmap:** Time-sliced actions (Morning, Afternoon, Evening) with rationale, costs, difficulty, and expected benefits.

### Module D: Indoor Air Quality Optimizer
- **Room Health Planner:** Calculates a 0–100 architectural health score based on room size, occupants, ventilation type, purifier presence, and cooking smoke.
- **AHAM CADR Calculator:** Computes required Clean Air Delivery Rate (CFM) for effective room filtration:
  $$\text{CADR}_{\text{CFM}} \ge \frac{2}{3} \times \text{Room Area (sq ft)}$$
- **Diurnal Window Ventilation Scheduler:** Recommends optimal midday convective opening hours and flags morning/evening inversion windows.
- **Filter Maintenance Tracker:** Visual gauge and cleaning reminders.

### Module E: Low-Emission Daily Routine Generator
- **Transit Mode Profiling:** Analyzes commutes (petrol car, diesel car, two-wheeler, bus, metro, bicycle, walk).
- **Verified Emission Factors:** Uses ARAI, IPCC, and DEFRA factors to calculate avoided kilograms of CO2 and grams of PM2.5.
- **Transparent Assumptions:** Explicitly documents assumptions for every alternative.

### Module F: Smart Pollution Prediction
- **Diurnal Risk Windows:** Models Morning Rush Peaks (07:00–09:30), Solar Convective Windows (11:00–15:00), Evening Inversion Stagnation (18:30–22:30), and Late-Night Accumulation.
- **Peak Alerts & Correlation Insights:** Identifies hygroscopic aerosol swelling and temperature inversion risks.

### Module G: Community Action Network
- **Neighborhood Coalitions:** Establish or join local clean-air alliances.
- **Sustainability Challenges:** Join challenges like *7 Days Without Unnecessary Car Trips*, *Zero Waste Combustion Pledge*, and *Clean Air School Commute*.
- **Citizen Concern Reporting:** Public pollution concern feed with geolocation, category tags, and spam moderation.
- **Eco Points Gamification:** Earn points and celebrate completions with interactive confetti animations.

### Module H: Pollution Map & Clean-Air Route Planner
- **Spatial Station Network:** Visualizes monitoring stations and geographic differences.
- **Smart Clean-Air Route Planner:** Compares **Direct Arterial Routes** against **ClearSky Green Corridors** (residential lanes and tree-buffered paths) with distance vs. particulate exposure trade-offs.

### Module I: Smart Notifications & Alerts
- User-configurable AQI thresholds (default 150), quiet hours (22:00–07:00), rapid PM2.5 spike warnings, and pre-filter maintenance reminders.

### Module J: Environmental Impact Dashboard
- Cumulative tracking of CO2 avoided, PM2.5 diverted, fuel saved, and monetary savings.
- **Family Eco Score (0–100):** Transparent multi-category sustainability rating.
- **Scientific Transparency Disclaimer:** Prominently clarifies that personal emission avoidance does not equal measured ambient AQI reductions.

### Module K: Educational Environmental Intelligence
- **Science Deep-Dives:** Explanations of CPCB formulas, PM2.5 alveolar penetration, and the physics of winter thermal inversions.
- **Interactive Knowledge Quiz:** Multiple-choice quiz with immediate answers, scoring, and scientific explanations.
- **Daily Atmospheric Facts:** Engaging educational carousel.

### Advanced Differentiating Features
1. **What-If Environmental Simulator:** Interactive sliders simulating neighborhood-scale lifestyle shifts (10 to 2,000 households).
2. **Emergency Smog Mode:** Rapid-access high-contrast red modal with verified level-4 hazard protocols, WHO indoor safe zone rules, and emergency health helplines.
3. **Role-Based Admin Portal:** Complete administration for Super Admins and Moderators (telemetry, user role updates, report moderation, security audit logs).

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, jsPDF, Canvas Confetti.
- **Backend:** Python 3.14, FastAPI (Async ASGI), SQLAlchemy 2.0 (aiosqlite / asyncpg), Pydantic v2 Settings & Schemas, PyJWT, Bcrypt.
- **External Data Providers:**
  - **Open-Meteo Air Quality API:** Free, keyless global hourly reanalysis & forecasting.
  - **Open-Meteo Weather API:** Boundary layer meteorology, temperature, humidity, wind vector.
  - **CPCB NAQI Implementation:** Standardized piecewise sub-index equations for Indian airsheds.
- **Testing:** Pytest, pytest-asyncio, HTTPX AsyncClient.

---

## 4. Quickstart Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm 9+ (tested on Node v24, npm 11)

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root:
```cmd
start.bat
```

### Option 2: Manual Launch

#### Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
*Backend runs on `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).*

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Secure First-Time Administrator Provisioning

ClearSky AI does **not** ship with fixed public administrator credentials. Provision an administrator securely using either method:

1. **Environment Variables (Recommended for Production):**
   Set `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` in your environment (or `.env`) before starting the backend.
2. **First-User Bootstrap:**
   When starting on a fresh database without `ADMIN_EMAIL` configured, the very first user registered via `/api/v1/auth/register` is automatically assigned the `super_admin` role.

---

## 6. Verification & Automated Test Results

Both backend (`pytest`) and frontend (`npm run lint`, `npm test`, `npm run build`) test suites verify CPCB AQI calculations, security controls, RBAC authorization, rate limiting, EcoReels, bilingual translations, and API contracts:
```bash
cd backend
python -m pytest -v

cd ../frontend
npm run lint && npm test && npm run build
```

---

## 7. License

MIT License. Designed and developed as a complete, trustworthy, intelligent environmental platform.
