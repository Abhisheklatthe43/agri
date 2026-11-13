import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getCurrentWeather, getWeatherForecast } from '../controllers/weatherController.js';

const router = Router();

// Weather can be viewed by authenticated users
router.use(requireAuth);

router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);

export default router;
