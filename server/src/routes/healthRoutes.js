import { Router } from 'express';
import { isConfigured, env } from '../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      service: 'AgriSmart AI API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      integrations: {
        geminiAi: isConfigured.gemini ? 'configured' : 'pending_api_key',
        supabaseDatabase: isConfigured.supabase ? 'configured' : 'in_memory_fallback',
        openWeather: isConfigured.weather ? 'configured' : 'pending_api_key'
      }
    },
    message: 'AgriSmart AI service operational'
  });
});

export default router;
