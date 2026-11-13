import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Gemini AI configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  
  // Supabase credentials
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Weather API configuration
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  
  // Security & Limits
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'authenticated',
  AI_RATE_LIMIT: parseInt(process.env.AI_RATE_LIMIT || '20', 10),
  MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '8', 10)
};

export const isDev = env.NODE_ENV === 'development';
export const isConfigured = {
  gemini: Boolean(env.GEMINI_API_KEY && !env.GEMINI_API_KEY.includes('your_')),
  supabase: Boolean(env.SUPABASE_URL && !env.SUPABASE_URL.includes('your-project') && env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY.includes('your_')),
  weather: Boolean(env.OPENWEATHER_API_KEY && !env.OPENWEATHER_API_KEY.includes('your_'))
};
