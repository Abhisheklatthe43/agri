-- ====================================================================
-- AgriSmart AI: Complete Cloud PostgreSQL Initial Schema & Seed Migration
-- Target: Supabase Cloud PostgreSQL
-- File: /supabase/migrations/001_initial_schema.sql
-- ====================================================================

-- 1. Enable Required PostgreSQL Extensions
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

-- 2.8 Weather Cache (Application-level caching)
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
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
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
-- 4. DATABASE FUNCTIONS & TRIGGERS
-- ====================================================================

-- 4.1 Auto-update updated_at timestamp
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

-- 4.2 Automatic Profile Creation on User Registration in auth.users
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

    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
    )
    VALUES (
        NEW.id,
        'Welcome to AgriSmart AI',
        'Your farming advisory account is ready. Complete your farm profile to get personalized crop, disease, and weather recommendations.',
        'welcome'
    )
    ON CONFLICT DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
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

-- 5.1 Profiles
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

-- 5.2 Crop Recommendations
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

-- 5.3 Disease Analyses
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

-- 5.4 Fertilizer Advisories
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

-- 5.5 Irrigation Advisories
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

-- 5.6 Chat Conversations
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

-- 5.7 Chat Messages
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

-- 5.8 Notifications
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
-- 6. SUPABASE STORAGE BUCKET & POLICIES
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'crop-disease-images',
    'crop-disease-images',
    true,
    8388608, -- 8 MB maximum
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

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

-- ====================================================================
-- 7. SEED DATA (Demo Farmer Account & Comprehensive Agricultural Records)
-- ====================================================================

-- 7.1 Ensure Demo User in auth.users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            role,
            aud,
            created_at,
            updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000000',
            'demo.farmer@agrismart.ai',
            crypt('AgriSmart#2026', gen_salt('bf')),
            NOW(),
            '{"full_name": "Balwinder Singh"}',
            'authenticated',
            'authenticated',
            NOW(),
            NOW()
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'auth.users seed skipped or already present: %', SQLERRM;
END $$;

-- 7.2 Farmer Profile
INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    state,
    district,
    village,
    farm_area,
    farm_area_unit,
    soil_type,
    irrigation_availability,
    farming_experience,
    preferred_language,
    primary_crops
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Balwinder Singh',
    '+91 98140 12345',
    'Punjab',
    'Ludhiana',
    'Jagraon',
    10.00,
    'acre',
    'Alluvial soil',
    'Drip irrigation',
    '15 years multi-generational',
    'en',
    ARRAY['Wheat', 'Mustard', 'Potato', 'Maize']
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    state = EXCLUDED.state,
    district = EXCLUDED.district,
    farm_area = EXCLUDED.farm_area,
    soil_type = EXCLUDED.soil_type,
    primary_crops = EXCLUDED.primary_crops;

-- 7.3 Seed Crop Recommendation
INSERT INTO public.crop_recommendations (
    id,
    user_id,
    input_data,
    recommendations,
    model_name,
    status,
    created_at
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    '{
        "state": "Punjab",
        "district": "Ludhiana",
        "soil_type": "Alluvial soil",
        "season": "Rabi",
        "farm_area": 10.0,
        "farm_area_unit": "acre",
        "water_availability": "Drip irrigation",
        "soil_ph": 7.2,
        "nitrogen": 140,
        "phosphorus": 55,
        "potassium": 190,
        "farming_objective": "High commercial return with balanced soil nitrogen fixation"
    }'::jsonb,
    '{
        "summary": "Agro-climatic conditions in Ludhiana during the Rabi season feature fertile alluvial soils with favorable winter temperature progression, highly conducive for cereal and pulse cultivation.",
        "location_context": "Trans-Gangetic Plains agro-climatic zone characterized by high fertility, deep loamy alluvium, and robust canal/tubewell network.",
        "data_limitations": ["Laboratory organic carbon test not provided; micronutrient zinc levels should be evaluated."],
        "recommendations": [
            {
                "crop_name": "Wheat (HD-2967 / PBW-725)",
                "scientific_name": "Triticum aestivum",
                "suitability_score": 94,
                "suitability_level": "high",
                "soil_compatibility": "Deep alluvial loams provide ideal moisture retention and root aeration for tillering.",
                "climate_compatibility": "Optimal cool vegetative temperature (15-22°C) transitioning to bright warm maturity.",
                "water_requirement": "4-5 critical irrigations (CRI, tillering, late jointing, flowering, milk stage).",
                "growing_duration_days": "140-150 days",
                "planting_season": "First fortnight of November",
                "fertilizer_considerations": ["Split nitrogen into 3 doses: basal, first irrigation, second irrigation."],
                "risks": ["Terminal heat stress during grain filling in late March; yellow rust monitoring."],
                "explanation": "Premier staple crop with guaranteed market MSP, well-matched to Ludhiana alluvium and available drip support."
            },
            {
                "crop_name": "Mustard (Pusa Mustard 25)",
                "scientific_name": "Brassica juncea",
                "suitability_score": 88,
                "suitability_level": "high",
                "soil_compatibility": "Tolerant to mild salinity; excels in well-drained alluvial soil.",
                "climate_compatibility": "Thrives in dry, cool conditions with low frost incidence.",
                "water_requirement": "Low water requirement (2-3 irrigations).",
                "growing_duration_days": "120-130 days",
                "planting_season": "Mid-October to early November",
                "fertilizer_considerations": ["Sulphur application (20 kg/ha) essential for oil content synthesis."],
                "risks": ["Aphid infestation during cloudy winter spells."],
                "explanation": "High profit oilseed with minimal water demand compared to intensive cereal rotations."
            },
            {
                "crop_name": "Chickpea (Desi Gram)",
                "scientific_name": "Cicer arietinum",
                "suitability_score": 82,
                "suitability_level": "high",
                "soil_compatibility": "Fixes atmospheric nitrogen, restoring soil microbial vitality in alluvial tracts.",
                "climate_compatibility": "Requires dry cold winter with no excessive fog at flowering.",
                "water_requirement": "Low (1-2 protective irrigations). Avoid waterlogging.",
                "growing_duration_days": "135-145 days",
                "planting_season": "Late October",
                "fertilizer_considerations": ["Phosphorus fertilization with biofertilizer Rhizobium seed treatment."],
                "risks": ["Susceptible to Ascochyta blight and pod borer under high humidity."],
                "explanation": "Excellent legume rotation crop to break cereal monoculture and improve soil fertility."
            }
        ],
        "next_steps": [
            "Conduct seed germination test (>85% target) and treat with Carbendazim/Trichoderma.",
            "Complete laser land leveling to optimize water application efficiency.",
            "Schedule Crown Root Initiation (CRI) irrigation at 21 days after sowing."
        ],
        "expert_consultation_required": false
    }'::jsonb,
    'gemini-2.5-flash',
    'completed',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7.4 Seed Plant Disease Analysis
INSERT INTO public.disease_analyses (
    id,
    user_id,
    crop_name,
    image_path,
    symptoms,
    analysis,
    model_name,
    status,
    created_at
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'Wheat',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    'Yellowish-orange pustules arranged in linear stripes along leaf veins',
    '{
        "crop_name": "Wheat (Triticum aestivum)",
        "health_status": "possibly_affected",
        "primary_finding": "Early onset Stripe Rust / Yellow Rust (Puccinia striiformis)",
        "possible_causes": [
            {
                "name": "Stripe Rust / Yellow Rust (Puccinia striiformis)",
                "category": "fungal",
                "confidence": 88,
                "explanation": "Visible symptoms display characteristic linear chlorotic stripes and bright yellow uredinial pustules matching airborne rust fungus favored by cool, damp weather (10-15°C)."
            },
            {
                "name": "Powdery Mildew (Blumeria graminis)",
                "category": "fungal",
                "confidence": 25,
                "explanation": "Secondary risk under dense canopy, though powdery white patches are less prominent than linear stripes."
            }
        ],
        "visible_symptoms": [
            "Linear chlorotic stripes parallel to leaf veins",
            "Yellow to bright orange spore masses",
            "Slight premature drying of flag leaf tips"
        ],
        "severity": "moderate",
        "immediate_actions": [
            "Isolate the affected field zone; avoid walking through wet fields in the morning to prevent mechanical spore dispersal.",
            "Apply prophylactic foliar bio-fungicide (Trichoderma viride @ 5g/L) or neem formulation if outbreak is localized.",
            "Avoid excessive late-season nitrogen top-dressing which exacerbates rust susceptibility."
        ],
        "prevention_methods": [
            "Sow certified rust-resistant cultivars (e.g. PBW-725, Unnat PBW-343).",
            "Adopt wider row spacing (20-22.5 cm) to facilitate wind aeration and rapid leaf drying.",
            "Destroy volunteer wheat plants and alternate barberry hosts near field borders."
        ],
        "additional_information_needed": [
            "Microscopic spore examination under 400x magnification to confirm Puccinia striiformis urediniospores.",
            "Ambient overnight humidity logs from field sensors."
        ],
        "expert_consultation_required": true,
        "limitations": [
            "Visual image diagnosis cannot substitute for official phytosanitary laboratory culture verification."
        ]
    }'::jsonb,
    'gemini-2.5-flash',
    'completed',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- 7.5 Seed Fertilizer Advisory
INSERT INTO public.fertilizer_advisories (
    id,
    user_id,
    crop_name,
    input_data,
    advisory,
    created_at
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'Wheat',
    '{
        "crop_name": "Wheat",
        "growth_stage": "Tillering Stage (30-35 DAS)",
        "soil_type": "Alluvial soil",
        "soil_ph": 7.2,
        "nitrogen": 140,
        "phosphorus": 55,
        "potassium": 190,
        "farming_method": "integrated"
    }'::jsonb,
    '{
        "summary": "Wheat at the active tillering phase requires immediate nitrogen replenishment to support vigorous tiller emergence and root elongation in alluvial loams.",
        "soil_observations": [
            "Alluvial soil exhibits high cation exchange capacity (CEC) but requires split applications to prevent leaching losses."
        ],
        "nutrient_assessment": [
            {
                "nutrient": "Nitrogen (N)",
                "status": "moderate",
                "explanation": "Critical for chlorophyll synthesis and tiller density. Apply first top-dress before first irrigation."
            },
            {
                "nutrient": "Phosphorus (P)",
                "status": "sufficient",
                "explanation": "Basal application adequately supports root branching."
            },
            {
                "nutrient": "Potassium (K)",
                "status": "sufficient",
                "explanation": "Maintains cellular turgor and enhances stem strength against lodging."
            }
        ],
        "recommendations": [
            {
                "type": "split_application",
                "recommendation": "Apply Urea @ 30 kg/acre immediately prior to first scheduled irrigation.",
                "application_guidance": "Broadcast uniformly when soil has adequate moisture; avoid application during windy afternoons.",
                "precautions": ["Do not apply on waterlogged or ponded fields to avoid denitrification loss."]
            },
            {
                "type": "organic_supplement",
                "recommendation": "Foliar spray of Seaweed Extract / Humic acid (2 mL/L).",
                "application_guidance": "Spray during calm morning hours to stimulate root nutrient uptake efficiency.",
                "precautions": ["Ensure spray nozzle creates fine mist; test compatibility if tank-mixing."]
            }
        ],
        "soil_testing_recommended": true,
        "warnings": [
            "Excess nitrogen application without potassium balance increases lodging risk in late winter winds."
        ],
        "next_steps": [
            "Inspect field for uniform tillering 7 days post-fertilizer application.",
            "Reserve remaining 30 kg/acre Urea for the boot leaf / late jointing stage."
        ]
    }'::jsonb,
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7.6 Seed Irrigation Advisory
INSERT INTO public.irrigation_advisories (
    id,
    user_id,
    crop_name,
    input_data,
    advisory,
    created_at
)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000001',
    'Wheat',
    '{
        "crop_name": "Wheat",
        "growth_stage": "Crown Root Initiation (CRI) / Tillering",
        "soil_type": "Alluvial soil",
        "farm_area": 10.0,
        "farm_area_unit": "acre",
        "irrigation_method": "Drip irrigation",
        "water_availability": "Borewell 4 hours daily",
        "recent_rainfall": 0,
        "temperature": 22.0,
        "humidity": 55
    }'::jsonb,
    '{
        "summary": "Crown Root Initiation (CRI) at 21-25 days is the single most moisture-critical phase in the wheat life cycle. Moisture stress at CRI causes permanent tiller reduction.",
        "water_stress_risk": "moderate",
        "irrigation_considerations": [
            "Crown root depth is currently 10-15 cm; maintain topsoil field capacity without flooding the crown."
        ],
        "recommended_actions": [
            "Operate drip system for 2.5 hours per sub-plot in early morning (07:00 - 09:30 AM).",
            "Maintain soil moisture at 70-80% field capacity.",
            "Next irrigation scheduled in 10-12 days based on evapotranspiration rates."
        ],
        "rainfall_adjustments": [
            "No rain in the 7-day forecast. If rainfall > 10mm occurs, suspend scheduled run for 5 days."
        ],
        "water_conservation_methods": [
            "Check drip lateral emitter discharge uniformity; flush end caps every 15 days.",
            "Retain surface crop residues (mulch) to retard capillary evaporation."
        ],
        "warnings": [
            "Excessive flooding causes root hypoxia and temporary leaf yellowing mimicking nitrogen deficiency."
        ],
        "data_limitations": [
            "Real-time soil tensiometer matric potential data not connected."
        ]
    }'::jsonb,
    NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7.7 Seed Chat Conversation & Messages
INSERT INTO public.chat_conversations (
    id,
    user_id,
    title,
    created_at,
    updated_at
)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000001',
    'Wheat CRI Stage & Rust Prevention',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.chat_messages (
    id,
    conversation_id,
    user_id,
    role,
    content,
    created_at
)
VALUES
(
    '66666666-6666-6666-6666-666666666661',
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000001',
    'user',
    'When is the exact right time to give the first irrigation to wheat in Ludhiana alluvium?',
    NOW() - INTERVAL '2 days'
),
(
    '66666666-6666-6666-6666-666666666662',
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000001',
    'assistant',
    '{
        "answer": "For wheat in the deep alluvial soils of Ludhiana, the first and most critical irrigation must be applied at the Crown Root Initiation (CRI) stage, typically between 20 to 25 days after sowing (DAS).\n\nCrown roots emerge just below the soil surface at this time. If moisture is insufficient, crown root elongation stalls, drastically reducing effective tiller numbers and ultimate grain yield.\n\nKey Guidelines for Ludhiana Farmers:\n1. Light Irrigation: Apply light watering (40-50 mm) so that water does not stand in the field for more than 4-6 hours.\n2. Urea Timing: Top-dress half of the remaining recommended Urea dose just prior to this first irrigation for optimal dissolution and root uptake.\n3. Weed Management: 2-3 days after this irrigation, observe weed emergence (such as Phalaris minor / Gullidanda) to plan timely post-emergence weed control.",
        "language": "en",
        "key_points": [
            "CRI stage occurs at 20-25 days after sowing",
            "Delaying CRI irrigation causes irreversible yield loss",
            "Combine with first split application of nitrogen"
        ],
        "recommended_actions": [
            "Inspect root depth at 21 DAS to verify crown root emergence",
            "Schedule drip/canal run for early morning"
        ],
        "warnings": [
            "Avoid heavy ponding which causes root asphyxiation in alluvium"
        ],
        "follow_up_question": "Did you apply basal Diammonium Phosphate (DAP) at sowing time?",
        "expert_consultation_required": false
    }',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7.8 Seed Notifications
INSERT INTO public.notifications (
    id,
    user_id,
    title,
    message,
    type,
    is_read,
    created_at
)
VALUES
(
    '77777777-7777-7777-7777-777777777771',
    '00000000-0000-0000-0000-000000000001',
    'Welcome to AgriSmart AI',
    'Your farming advisory profile is established. Explore crop recommendations, disease scans, and live weather alerts.',
    'welcome',
    true,
    NOW() - INTERVAL '4 days'
),
(
    '77777777-7777-7777-7777-777777777772',
    '00000000-0000-0000-0000-000000000001',
    'High Humidity Fungal Alert',
    'Relative humidity in Ludhiana is currently 85%. Inspect wheat flag leaves for Stripe Rust pustules.',
    'weather_alert',
    false,
    NOW() - INTERVAL '1 day'
),
(
    '77777777-7777-7777-7777-777777777773',
    '00000000-0000-0000-0000-000000000001',
    'Plant Health Scan Ready',
    'Gemini Vision diagnosis completed for Wheat specimen: Stripe Rust symptoms identified.',
    'disease_alert',
    false,
    NOW() - INTERVAL '18 hours'
)
ON CONFLICT (id) DO NOTHING;

-- 7.9 Seed Weather Cache
INSERT INTO public.weather_cache (
    id,
    location_key,
    weather_data,
    fetched_at,
    expires_at
)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    'ludhiana, punjab',
    '{
        "location": {
            "city": "Ludhiana",
            "country": "IN",
            "coord": { "lat": 30.901, "lon": 75.8573 }
        },
        "current": {
            "temp": 24,
            "feels_like": 24,
            "temp_min": 16,
            "temp_max": 26,
            "humidity": 62,
            "pressure": 1014,
            "wind_speed": 11,
            "condition": "Clear",
            "description": "clear sky",
            "rain": 0
        },
        "forecast": [
            { "date": "2026-11-14", "temp_max": 26, "temp_min": 15, "condition": "Clear", "humidity": 58, "rain_prob": 0, "wind_speed": 10 },
            { "date": "2026-11-15", "temp_max": 25, "temp_min": 14, "condition": "Clouds", "humidity": 64, "rain_prob": 10, "wind_speed": 12 },
            { "date": "2026-11-16", "temp_max": 24, "temp_min": 14, "condition": "Clear", "humidity": 60, "rain_prob": 0, "wind_speed": 9 },
            { "date": "2026-11-17", "temp_max": 25, "temp_min": 15, "condition": "Clear", "humidity": 55, "rain_prob": 0, "wind_speed": 8 },
            { "date": "2026-11-18", "temp_max": 24, "temp_min": 13, "condition": "Clear", "humidity": 52, "rain_prob": 0, "wind_speed": 10 }
        ],
        "farming_alerts": []
    }'::jsonb,
    NOW(),
    NOW() + INTERVAL '30 minutes'
)
ON CONFLICT (location_key) DO UPDATE SET
    weather_data = EXCLUDED.weather_data,
    expires_at = EXCLUDED.expires_at;
