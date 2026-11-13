# 🌱 AgriSmart AI — AI-Powered Agriculture Crop Advisory Assistant

> **"Smart Farming Starts With Smart Decisions."**

AgriSmart AI is a production-grade, full-stack agricultural decision-support platform designed to make modern farming intelligence accessible, practical, and multilingual for small, medium, and large-scale farmers, agricultural students, and research consultants.

---

## 🚀 Key Implemented Features

1. **Farmer Profile Management**:
   - Geolocation tracking: State, District, Village.
   - Land metrics: Farm area with unit conversion (acre, hectare, bigha, etc.).
   - Agricultural parameters: Soil type, irrigation availability, farming experience, and primary crops.
2. **AI Crop Suitability Recommendation**:
   - Ranked crop selection powered by Google Gemini 2.5.
   - Evaluates soil type, seasonal rainfall, temperature, irrigation, and optional NPK/pH laboratory measurements.
   - Comprehensive outputs: Suitability score (0-100), climate and soil compatibility, duration, fertilizer considerations, and agronomic risks.
3. **Computer Vision Plant Disease Detection**:
   - Upload leaf/plant photos (JPEG, PNG, WebP up to 8MB).
   - Multimodal Gemini Vision symptom analysis.
   - Classifies healthy, fungal, bacterial, viral, nutrient deficiency, or pest symptoms.
   - Differential diagnosis confidence percentages, immediate cultural actions, prevention guidelines, and laboratory consultation indicators.
4. **Agro-Meteorological Intelligence**:
   - Real weather telemetry through OpenWeather backend proxy.
   - Current weather metrics and 5-day forecasts.
   - Automated farming hazard alerts: Heat stress, frost shock, foliar spray drift wind warnings, heavy rainfall drainage, and high humidity fungal risks.
   - PostgreSQL 30-minute weather cache to optimize API consumption.
5. **AI Fertilizer & Nutrient Advisory**:
   - Tailored NPK macronutrient assessments across crop growth stages.
   - Prioritizes organic alternatives, biofertilizers, and balanced split application timings.
   - Precautions against soil salinity and groundwater runoff.
6. **AI Irrigation Scheduling**:
   - Water stress risk evaluation (Low, Moderate, High, Critical).
   - Critical moisture-sensitive crop phases.
   - Watering schedules adjusted for recent rainfall and conservation practices (mulching, drip maintenance).
7. **24/7 AI Farming Assistant Chatbot**:
   - Multi-turn conversational interface with persisted conversation histories.
   - Multilingual reasoning across 9+ Indian languages (English, Hindi, Marathi, Kannada, Telugu, Tamil, Gujarati, Punjabi, Bengali).
   - Enforces agricultural safety directives and distinguishing measured from estimated parameters.
8. **Advisory History & Reporting**:
   - Unified tabbed history of crop recommendations, disease scans, and nutrient plans.
   - Printable reports with interactive Recharts visualizations.
   - Granular deletion of user-owned advisory records.
9. **In-App Notifications & Alerts**:
   - Timely alerts for weather hazards, disease scan completions, and advisory formulated updates.
10. **Enterprise Security & Architecture**:
    - Supabase Auth + PostgreSQL Row Level Security (RLS) on all tables.
    - Express REST API with Helmet security headers, CORS origin allowlists, and rate limiters.
    - Zod validation on both client inputs and server AI JSON responses.

---

## 📂 Project Directory Structure

```text
agrismart-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # PageContainer, PageHeader, LoadingState, EmptyState, etc.
│   │   │   └── layout/         # Navbar, Sidebar, AppLayout, ProtectedRoute, Footer
│   │   ├── contexts/           # AuthContext, NotificationContext
│   │   ├── lib/                # Supabase client initializer
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword
│   │   │   ├── dashboard/      # Main Farmer Dashboard
│   │   │   ├── crops/          # Crop Recommendation Form & Results
│   │   │   ├── disease/        # Disease Detection & Pathology Report
│   │   │   ├── weather/        # Meteorological Dashboard & Forecasts
│   │   │   ├── fertilizer/     # Fertilizer & Soil Nutrition
│   │   │   ├── irrigation/     # Irrigation Scheduling
│   │   │   ├── assistant/      # AI Farming Assistant Chatbot
│   │   │   ├── history/        # Saved Advisory History
│   │   │   ├── notifications/  # User Notifications
│   │   │   ├── profile/        # Farmer Profile Setup
│   │   │   ├── settings/       # Settings & Integration Status
│   │   │   ├── LandingPage.jsx # Public Product Landing Page
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/           # Frontend API & Supabase services
│   │   ├── styles/             # Tailwind CSS & design tokens
│   │   ├── App.jsx             # React Router routing configuration
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/             # Environment & integration configs
│   │   ├── constants/          # Agricultural reference data
│   │   ├── controllers/        # REST route controllers
│   │   ├── middleware/         # Auth, Rate Limiter, Validation, Error
│   │   ├── prompts/            # Centralized system prompts & schemas
│   │   ├── repositories/       # In-memory store fallback
│   │   ├── routes/             # Express API v1 routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/
│   │   │   ├── ai/             # Official @google/genai SDK services
│   │   │   ├── weather/        # OpenWeather & alert derivation
│   │   │   └── supabase/       # Supabase Admin & Storage client
│   │   ├── utils/              # Structured logger & standard API response
│   │   ├── app.js              # Express application setup
│   │   └── server.js           # Server entrypoint
│   ├── .env.example
│   └── package.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql                   # 9 tables, indexes, triggers, RLS, seed data
│   │   └── 20261113000000_init_agrismart_schema.sql
│   ├── migrate.js
│   ├── seed.sql
│   └── config.toml
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
Run the installation script from the root directory:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

---

## ⚙️ Environment Configuration

### Client Environment (`client/.env`)
Create `client/.env` (or copy from `client/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server Environment (`server/.env`)
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Gemini API
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase PostgreSQL & Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Rate Limits & Limits
JWT_AUDIENCE=authenticated
AI_RATE_LIMIT=20
MAX_IMAGE_SIZE_MB=8
```

---

## 🗄️ Database Migration (Supabase Cloud PostgreSQL)

### Option 1: Automated Node.js Migration Runner
Add your Supabase PostgreSQL credentials to `server/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres.yourprojectref:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres
```
Then run from the root directory:
```bash
npm run db:migrate
```

### Option 2: Supabase Studio SQL Editor
1. Open your Supabase Dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Open and copy `supabase/migrations/001_initial_schema.sql`.
4. Run the SQL script. This executes:
   - Creation of 9 tables (`profiles`, `crop_recommendations`, `disease_analyses`, `fertilizer_advisories`, `irrigation_advisories`, `chat_conversations`, `chat_messages`, `weather_cache`, `notifications`).
   - Row Level Security (RLS) policies for user data isolation.
   - User creation trigger `on_auth_user_created` for automatic farmer profile initialization.
   - Private Supabase Storage bucket `crop-disease-images` with RLS upload policies.
   - Initial Seed Data: pre-populates demo farmer profile, sample crop suitability, disease diagnosis, fertilizer plan, irrigation schedule, chat dialogue, and notifications.

---

## 🏃 Running the Application

### Option A: Run Both Client & Server Concurrently
From the root directory:
```bash
npm run dev
```

### Option B: Run Independently
Terminal 1 (Backend Server):
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/api/v1/health
```

Terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

---

## 🧪 Testing & Verification

1. **Verify Health Endpoint**:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```
2. **Frontend Build Verification**:
   ```bash
   cd client
   npm run build
   ```
3. **Demo Farmer Access**:
   - Open `http://localhost:5173/login`.
   - Click the **"Demo Farmer 1-Click Sign In"** button for instant demonstration, or register a new account.
   - Explore the Dashboard, Crop Recommendations, Plant Disease Scanner, Weather Telemetry, Fertilizer Planner, and AI Assistant.

---

## 📄 License
Designed for sustainable agricultural development and farmers worldwide.
