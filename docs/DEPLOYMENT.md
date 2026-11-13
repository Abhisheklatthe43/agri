# AgriSmart AI — Production Deployment Guide

## 1. Prerequisites
- GitHub repository containing project code.
- Supabase account & project.
- Google AI Studio account (Gemini API key).
- OpenWeather account (API key).
- Vercel account (Frontend) or Netlify.
- Render or Railway account (Backend Express server).

---

## 2. Supabase Cloud Configuration

1. Create a new Supabase project at [database.new](https://database.new).
2. Navigate to **SQL Editor** in Supabase Studio.
3. Paste the contents of `supabase/migrations/20261113000000_init_agrismart_schema.sql` and click **Run**.
4. Verify all 9 tables exist (`profiles`, `crop_recommendations`, `disease_analyses`, `fertilizer_advisories`, `irrigation_advisories`, `chat_conversations`, `chat_messages`, `weather_cache`, `notifications`).
5. Verify Storage bucket `crop-disease-images` is created.
6. Copy your **Project URL**, **Anon / Public Key**, and **Service Role Key** from **Project Settings > API**.

---

## 3. Backend Deployment (Render / Railway / Fly.io)

1. Connect your repository to Render or Railway.
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Configure Environment Variables:
   ```env
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-agrismart-app.vercel.app
   GEMINI_API_KEY=your_actual_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret
   OPENWEATHER_API_KEY=your_openweather_api_key
   AI_RATE_LIMIT=20
   MAX_IMAGE_SIZE_MB=8
   ```
6. Deploy and note the public URL (e.g. `https://agrismart-api.onrender.com`).

---

## 4. Frontend Deployment (Vercel)

1. Connect your repository to Vercel.
2. Root directory: `client`
3. Framework Preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Configure Environment Variables:
   ```env
   VITE_API_BASE_URL=https://agrismart-api.onrender.com/api/v1
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
7. Deploy.
8. Add your Vercel domain to `FRONTEND_URL` in backend environment variables and Supabase Auth Redirect URLs.
