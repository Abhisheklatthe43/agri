# AgriSmart AI — System Architecture

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------+
|                         CLIENT LAYER                            |
|  React 18 (Vite) + Tailwind CSS + TanStack Query + Recharts     |
+-------------------------------+---------------------------------+
                                |
                    HTTP REST & JWT Bearer
                                |
                                v
+-----------------------------------------------------------------+
|                         BACKEND API                             |
|  Node.js + Express.js (ES Modules)                              |
|  - Helmet & CORS Origin Protection                              |
|  - Express Rate Limiting (General & AI Dedicated)               |
|  - Zod Request & AI Response Schema Validation                  |
|  - Centralized Error & Audit Logging                            |
+---------+---------------------+---------------------+-----------+
          |                     |                     |
          v                     v                     v
+------------------+  +------------------+  +-------------------+
|   GOOGLE GEMINI  |  |  SUPABASE CLOUD  |  |   OPENWEATHER     |
|   @google/genai  |  |  - PostgreSQL    |  |   - 5-Day Foreast |
|  - Gemini 2.5    |  |  - Row Security  |  |   - Weather Cache |
|  - Vision Model  |  |  - Auth & JWT    |  |   - Agro-Alerts   |
|  - Struct Output |  |  - File Storage  |  |     Calculation   |
+------------------+  +------------------+  +-------------------+
```

---

## 2. Key Architecture Principles

1. **Separation of Concerns**:
   - The React client never calls Google Gemini directly or exposes privileged server secrets.
   - All external API calls (Gemini, OpenWeather, Supabase Storage Admin) originate strictly from server-side controllers.

2. **Strict Response Validation**:
   - Every AI prompt mandates structured JSON outputs.
   - AI outputs are parsed and validated via Zod schemas (`cropRecommendationResponseSchema`, `diseaseDetectionResponseSchema`, etc.) before database insertion or client response.
   - Malformed model responses are rejected with an operational error rather than rendering raw text.

3. **Data Isolation & Tenant Security**:
   - Frontend passes Supabase Auth JWT access tokens via `Authorization: Bearer <token>`.
   - Backend middleware verifies user identity against Supabase Auth.
   - PostgreSQL Row Level Security (RLS) ensures cross-tenant data leakage is structurally impossible.

4. **Graceful Fallbacks & Resiliency**:
   - In offline or local demo scenarios without credentials, the backend provides an in-memory repository store so that every API endpoint functions reliably.
   - Weather responses are cached for 30 minutes in PostgreSQL to minimize rate-limit depletion.
