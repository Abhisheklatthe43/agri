import { getWeatherData } from '../services/weather/weatherService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const getCurrentWeather = async (req, res, next) => {
  try {
    const { location, lat, lon } = req.query;
    const targetLocation = location || 'Pune, Maharashtra';

    const result = await getWeatherData({
      location: targetLocation,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined
    });

    if (!result.available) {
      return res.status(200).json({
        success: true,
        data: null,
        status: 'UNAVAILABLE',
        message: result.reason || 'Weather information is currently unavailable.'
      });
    }

    return sendSuccess(res, result.data, 'Current weather data retrieved');
  } catch (error) {
    logger.error('Error fetching current weather', error);
    return sendError(res, error.message || 'Unable to retrieve live weather data', 502, 'WEATHER_PROVIDER_ERROR');
  }
};

export const getWeatherForecast = async (req, res, next) => {
  try {
    const { location, lat, lon } = req.query;
    const targetLocation = location || 'Pune, Maharashtra';

    const result = await getWeatherData({
      location: targetLocation,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined
    });

    if (!result.available) {
      return res.status(200).json({
        success: true,
        data: null,
        status: 'UNAVAILABLE',
        message: result.reason || 'Weather forecast is currently unavailable.'
      });
    }

    return sendSuccess(res, {
      location: result.data.location,
      forecast: result.data.forecast,
      farming_alerts: result.data.farming_alerts
    }, 'Weather forecast retrieved');
  } catch (error) {
    logger.error('Error fetching weather forecast', error);
    return sendError(res, error.message || 'Unable to retrieve live weather forecast', 502, 'WEATHER_PROVIDER_ERROR');
  }
};
