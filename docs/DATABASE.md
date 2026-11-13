# AgriSmart AI — Database Architecture & SQL Schema

Migration File: `/supabase/migrations/001_initial_schema.sql`  
Migration Runner: `npm run db:migrate` or `node server/src/scripts/migrate.js`

AgriSmart AI utilizes **Supabase PostgreSQL** as its primary persistent store, coupled with PostgreSQL Row Level Security (RLS) for absolute per-tenant data isolation.

---

## 1. Relational Tables

| Table | Description | Primary Key | Foreign Keys |
| :--- | :--- | :--- | :--- |
| `profiles` | Farmer profile metadata | `id UUID` | `auth.users(id) ON DELETE CASCADE` |
| `crop_recommendations` | AI crop suitability reports | `id UUID` | `auth.users(id) ON DELETE CASCADE` |
| `disease_analyses` | Plant pathology image reports | `id UUID` | `auth.users(id) ON DELETE CASCADE` |
| `fertilizer_advisories` | Nutrient management plans | `id UUID` | `auth.users(id) ON DELETE CASCADE` |
| `irrigation_advisories` | Crop watering schedules | `id UUID` | `auth.users(id) ON DELETE CASCADE` |
| `chat_conversations` | Assistant conversational sessions | `id UUID` | `auth.users(id) ON DELETE CASCADE` |
| `chat_messages` | Multi-turn user & AI dialogs | `id UUID` | `chat_conversations(id)`, `auth.users(id)` |
| `weather_cache` | Cached OpenWeather responses | `id UUID` | None (Shared application cache) |
| `notifications` | In-app alerts & reminders | `id UUID` | `auth.users(id) ON DELETE CASCADE` |

---

## 2. Row Level Security (RLS) Architecture

Row Level Security is enabled on **every** user-owned table.

Example policy enforcement:
```sql
-- Users can only read their own crop recommendations
CREATE POLICY "Users can read own crop recommendations"
ON public.crop_recommendations FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert crop recommendations under their own ID
CREATE POLICY "Users can insert own crop recommendations"
ON public.crop_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own records
CREATE POLICY "Users can delete own crop recommendations"
ON public.crop_recommendations FOR DELETE
USING (auth.uid() = user_id);
```

Equivalent policies safeguard `disease_analyses`, `fertilizer_advisories`, `irrigation_advisories`, `chat_conversations`, `chat_messages`, and `notifications`.

---

## 3. Storage Bucket Configuration

Private bucket `crop-disease-images`:
- Maximum file size: `8,388,608 bytes` (8 MB)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Object paths scoped by user ID: `crop-disease-images/{user_id}/{timestamp}-{hash}.jpg`
- Storage policies enforce read/write access strictly to authenticated owners.

---

## 4. Automatic Triggers

### Auto-Profile Creation Trigger
On user signup in `auth.users`, the trigger `on_auth_user_created` invokes `public.handle_new_user()` to:
1. Extract the farmer's full name from metadata.
2. Initialize a default profile record in `public.profiles`.
3. Dispatch a welcome notification in `public.notifications`.

### Updated-At Trigger
`handle_updated_at()` automatically keeps `updated_at` timestamps fresh on record modification.
