-- Seed data for testing and development
-- Note: Replace with real user UUID when testing manually in Supabase SQL editor.
COMMENT ON TABLE public.profiles IS 'Stores farmer profiles and farm metadata';
COMMENT ON TABLE public.crop_recommendations IS 'Stores AI-generated crop recommendations';
COMMENT ON TABLE public.disease_analyses IS 'Stores image-based crop disease diagnosis and actions';
COMMENT ON TABLE public.fertilizer_advisories IS 'Stores AI-generated fertilizer and soil nutrient guidance';
COMMENT ON TABLE public.irrigation_advisories IS 'Stores AI-generated irrigation advice and schedule considerations';
