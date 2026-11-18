# ClearSky AI - REST API Documentation

Base URL: `http://localhost:8000/api/v1`

All protected endpoints require an `Authorization: Bearer <token>` header. Interactive Swagger documentation is automatically hosted at `http://localhost:8000/docs`.

---

## 1. Authentication & User Management

### `POST /auth/register`
Creates a new citizen account. The first registered account automatically receives the `super_admin` role.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "full_name": "Arjun Nair",
    "preferred_language": "en",
    "default_city": "Delhi NCR",
    "default_lat": 28.6139,
    "default_lon": 77.2090
  }
  ```
- **Response:** `201 Created` with JWT access token and user profile.

### `POST /auth/login`
Authenticates user credentials and returns a signed JWT.
- **Request Body:**
  ```json
  {
    "email": "admin@clearsky.ai",
    "password": "AdminPass123!"
  }
  ```

### `GET /auth/me`
Retrieves the authenticated user's profile and active permissions.

### `DELETE /auth/delete-account`
Purges user profile, saved locations, family members, and impact history in compliance with the **Right to be Forgotten** data privacy mandate.

---

## 2. Air Quality & Weather Telemetry

### `GET /air-quality/current`
Fetches live telemetry for coordinates with CPCB National AQI and US EPA calculations.
- **Query Parameters:**
  - `lat` (float, required): Latitude (e.g., 28.6139)
  - `lon` (float, required): Longitude (e.g., 77.2090)
  - `city` (string, optional): Display city name
- **Response Structure:**
  ```json
  {
    "current": {
      "aqi_in": 165,
      "aqi_us": 158,
      "category_in": "Moderate",
      "category_us": "Unhealthy for Sensitive Groups",
      "color_in": "#eab308",
      "dominant_pollutant": "PM2.5",
      "pm2_5": 72.4,
      "pm10": 135.0,
      "o3": 42.1,
      "no2": 38.6,
      "so2": 11.2,
      "co": 0.85,
      "timestamp": "2026-11-18T01:30:00Z",
      "city": "Delhi NCR",
      "source": "Open-Meteo Air Quality & CPCB Standard",
      "pollutants": { ... }
    },
    "weather": {
      "temperature_c": 22.4,
      "relative_humidity": 68.0,
      "wind_speed_kmh": 6.8,
      "wind_direction_cardinal": "SE"
    },
    "hourly": [ ... ],
    "daily": [ ... ],
    "ai_summary": "Air quality is Moderate..."
  }
  ```

### `GET /air-quality/compare`
Compares two locations side-by-side with delta calculations.

---

## 3. ClearSky AI Conversational Assistant

### `POST /assistant/chat`
Context-aware conversational endpoint grounded in local sensor telemetry.
- **Request Body:**
  ```json
  {
    "message": "Is it safe to go jogging with my 8-year-old son right now?",
    "language": "en",
    "location_name": "Delhi NCR",
    "lat": 28.6139,
    "lon": 77.2090
  }
  ```
- **Response:**
  - `content`: Grounded advice with atmospheric explanations
  - `sources_cited`: WHO, CPCB, and EPA guidance
  - `disclaimer`: Medical disclaimer notice

---

## 4. Family Lifestyle Intelligence

### `GET /family/members`
Lists household members and sensitivity profiles.

### `POST /family/members`
Creates a new household member profile (`child`, `elderly`, `respiratory_sensitive`, `outdoor_worker`, etc.).

### `GET /family/daily-plan`
Generates customized morning, afternoon, and evening routines adapted to current ambient AQI.

---

## 5. Indoor Air Optimizer

### `GET /indoor/assessments`
Retrieves evaluated rooms.

### `POST /indoor/assessments`
Evaluates room area, ventilation architecture, purifier status, and cooking smoke exposure to generate a 0–100 Room Health Score.

### `GET /indoor/ventilation-advice`
Computes optimal midday window ventilation hours and required air purifier CADR in CFM.

---

## 6. Low-Emission Daily Routine Generator

### `POST /routine/generate`
Computes baseline emissions and generates sustainable mass-transit alternatives with monthly cost and emissions savings.

---

## 7. Smart Pollution Prediction

### `GET /prediction/forecast`
Simulates diurnal atmospheric boundary layer risk windows (Morning Rush Peak, Midday Solar Dispersion, Evening Inversion Stagnation).

---

## 8. Community Action Network

### `GET /community/list` & `POST /community/create`
Manages neighborhood clean air coalitions.

### `GET /community/challenges` & `POST /community/challenges/complete`
Lists active challenges, records completions, and awards Eco Points.

### `POST /community/reports`
Submits neighborhood pollution concerns (waste burning, construction dust) with moderation filtering.

---

## 9. Environmental Impact & Simulator

### `GET /impact/summary`
Calculates cumulative CO2 avoided, PM2.5 prevented, fuel saved, and personal Eco Score.

### `POST /impact/what-if`
Runs multi-variable simulation:
- **Input:** `participating_families`, `avg_commute_km`, `shift_mode`
- **Output:** Annual metric tons CO2 avoided, kg PM2.5 diverted, and community financial savings.

---

## 10. Clean-Air Route Planner

### `POST /routes/clean-route`
Compares Direct Arterial routes against Low-Exposure Green corridors with distance and particulate exposure trade-offs.

---

## 11. Administrative Portal

### `GET /admin/health`
System telemetry, active users count, and API status.

### `GET /admin/users` & `PUT /admin/users/{id}/role`
User management with RBAC (`super_admin`, `moderator`, `community_manager`, `standard_user`).

### `PUT /admin/moderation/reports/{id}`
Moderates citizen pollution reports (`reviewed`, `resolved`, `flagged_spam`).
