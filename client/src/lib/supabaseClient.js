import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  !supabaseUrl.includes('your-project') && 
  supabaseAnonKey && 
  !supabaseAnonKey.includes('your_')
);

// Fallback dummy client if credentials not yet set, to prevent runtime crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy', {
      auth: { persistSession: true }
    });
