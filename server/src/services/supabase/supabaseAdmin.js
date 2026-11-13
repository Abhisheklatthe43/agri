import { createClient } from '@supabase/supabase-js';
import { env, isConfigured } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let supabaseClient = null;

if (isConfigured.supabase) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    logger.info('Supabase Admin Client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Supabase client', error);
  }
} else {
  logger.warn('Supabase credentials not configured or using placeholders. Database persistence will run in memory/mock fallback mode.');
}

export const getSupabase = () => supabaseClient;

/**
 * Verify JWT token from Authorization header and return authenticated user
 */
export const verifyAuthToken = async (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  if (!supabaseClient) {
    // If Supabase is not configured yet in local development, parse token or handle mock
    if (token.startsWith('mock-token-') || token === 'demo-token') {
      return {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo.farmer@agrismart.ai',
        user_metadata: { full_name: 'Demo Farmer' }
      };
    }
    throw new Error('Supabase client is not configured. Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }

  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    logger.warn('Token verification failed', { error: error?.message });
    throw new Error(error?.message || 'Invalid or expired authentication token');
  }

  return user;
};
