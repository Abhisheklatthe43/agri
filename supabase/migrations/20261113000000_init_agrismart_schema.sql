-- ====================================================================
-- AgriSmart AI: Complete Production PostgreSQL Schema & Migrations
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- 2.1 Farmer Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    state TEXT,
    district TEXT,
    village TEXT,
    farm_area NUMERIC(12,2),
    farm_area_unit TEXT DEFAULT 'acre',
    soil_type TEXT,
    irrigation_availability TEXT,
    farming_experience TEXT,
    preferred_language TEXT DEFAULT 'en',
    primary_crops TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Crop Recommendations
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_data JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    model_name TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Disease Analyses
CREATE TABLE IF NOT EXISTS public.disease_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_name TEXT,
    image_path TEXT NOT NULL,
    symptoms TEXT,
    analysis JSONB NOT NULL,
    model_name TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Fertilizer Advisories
CREATE TABLE IF NOT EXISTS public.fertilizer_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    input_data JSONB NOT NULL,
    advisory JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Irrigation Advisories
CREATE TABLE IF NOT EXISTS public.irrigation_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    input_data JSONB NOT NULL,
    advisory JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Chat Conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Weather Cache
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_key TEXT NOT NULL UNIQUE,
    weather_data JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 2.9 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user
    ON public.crop_recommendations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_disease_analyses_user
    ON public.disease_analyses(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fertilizer_advisories_user
    ON public.fertilizer_advisories(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_irrigation_advisories_user
    ON public.irrigation_advisories(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user
    ON public.chat_conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
    ON public.chat_messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_cache_expires
    ON public.weather_cache(expires_at);

-- ====================================================================
-- 4. TRIGGERS & FUNCTIONS
-- ====================================================================

-- 4.1 Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_timestamp ON public.profiles;
CREATE TRIGGER trigger_update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_update_chat_conversations_timestamp ON public.chat_conversations;
CREATE TRIGGER trigger_update_chat_conversations_timestamp
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Automatic Profile Creation on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1),
        'Farmer'
    );

    INSERT INTO public.profiles (
        id,
        full_name,
        preferred_language,
        farm_area_unit
    )
    VALUES (
        NEW.id,
        v_full_name,
        'en',
        'acre'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Add default welcome notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
    )
    VALUES (
        NEW.id,
        'Welcome to AgriSmart AI',
        'Your farming advisory account is ready. Complete your farm profile to get personalized crop and weather recommendations.',
        'welcome'
    )
    ON CONFLICT DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Prevent failing the user creation if profile insert encounters edge case
        RAISE WARNING 'Automatic profile creation failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 5.2 Crop Recommendations Policies
DROP POLICY IF EXISTS "Users can read own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Users can read own crop recommendations"
    ON public.crop_recommendations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Users can insert own crop recommendations"
    ON public.crop_recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Users can delete own crop recommendations"
    ON public.crop_recommendations FOR DELETE
    USING (auth.uid() = user_id);

-- 5.3 Disease Analyses Policies
DROP POLICY IF EXISTS "Users can read own disease analyses" ON public.disease_analyses;
CREATE POLICY "Users can read own disease analyses"
    ON public.disease_analyses FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own disease analyses" ON public.disease_analyses;
CREATE POLICY "Users can insert own disease analyses"
    ON public.disease_analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own disease analyses" ON public.disease_analyses;
CREATE POLICY "Users can delete own disease analyses"
    ON public.disease_analyses FOR DELETE
    USING (auth.uid() = user_id);

-- 5.4 Fertilizer Advisories Policies
DROP POLICY IF EXISTS "Users can read own fertilizer advisories" ON public.fertilizer_advisories;
CREATE POLICY "Users can read own fertilizer advisories"
    ON public.fertilizer_advisories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fertilizer advisories" ON public.fertilizer_advisories;
CREATE POLICY "Users can insert own fertilizer advisories"
    ON public.fertilizer_advisories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own fertilizer advisories" ON public.fertilizer_advisories;
CREATE POLICY "Users can delete own fertilizer advisories"
    ON public.fertilizer_advisories FOR DELETE
    USING (auth.uid() = user_id);

-- 5.5 Irrigation Advisories Policies
DROP POLICY IF EXISTS "Users can read own irrigation advisories" ON public.irrigation_advisories;
CREATE POLICY "Users can read own irrigation advisories"
    ON public.irrigation_advisories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own irrigation advisories" ON public.irrigation_advisories;
CREATE POLICY "Users can insert own irrigation advisories"
    ON public.irrigation_advisories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own irrigation advisories" ON public.irrigation_advisories;
CREATE POLICY "Users can delete own irrigation advisories"
    ON public.irrigation_advisories FOR DELETE
    USING (auth.uid() = user_id);

-- 5.6 Chat Conversations Policies
DROP POLICY IF EXISTS "Users can read own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can read own chat conversations"
    ON public.chat_conversations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can insert own chat conversations"
    ON public.chat_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can update own chat conversations"
    ON public.chat_conversations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can delete own chat conversations"
    ON public.chat_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- 5.7 Chat Messages Policies
DROP POLICY IF EXISTS "Users can read own chat messages" ON public.chat_messages;
CREATE POLICY "Users can read own chat messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- 5.8 Notifications Policies
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ====================================================================
-- 6. STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ====================================================================

-- Create private bucket for plant disease images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'crop-disease-images',
    'crop-disease-images',
    true,
    8388608, -- 8 MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies
DROP POLICY IF EXISTS "Authenticated users can upload crop disease images" ON storage.objects;
CREATE POLICY "Authenticated users can upload crop disease images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'crop-disease-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Authenticated users can view crop disease images" ON storage.objects;
CREATE POLICY "Authenticated users can view crop disease images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'crop-disease-images');

DROP POLICY IF EXISTS "Users can delete own crop disease images" ON storage.objects;
CREATE POLICY "Users can delete own crop disease images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'crop-disease-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
