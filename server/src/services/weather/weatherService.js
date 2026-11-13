import { env, isConfigured } from '../../config/env.js';
import { getSupabase } from '../supabase/supabaseAdmin.js';
import { logger } from '../../utils/logger.js';

const CACHE_TTL_MINUTES = 30;

/**
 * Generate agricultural alerts based on actual weather metrics
 */
export const deriveFarmingAlerts = (weather) => {
  const alerts = [];
  const temp = weather.current.temp;
  const humidity = weather.current.humidity;
  const windSpeed = weather.current.wind_speed;
  const rain = weather.current.rain || 0;

  if (temp >= 38) {
    alerts.push({
      type: 'heat_stress',
      severity: 'high',
      title: 'High Heat Stress Warning',
      description: `Current temperature (${temp}°C) may cause moisture stress and flower drop. Ensure soil mulching and irrigate during cooler morning or evening hours.`
    });
  } else if (temp <= 10) {
    alerts.push({
      type: 'frost_risk',
      severity: 'moderate',
      title: 'Low Temperature / Frost Risk',
      description: `Temperature at ${temp}°C. Monitor frost-sensitive vegetables and nursery beds; light evening irrigation can mitigate frost shock.`
    });
  }

  if (windSpeed >= 25) {
    alerts.push({
      type: 'high_wind',
      severity: 'moderate',
      title: 'Strong Winds Alert',
      description: `Winds of ${windSpeed} km/h recorded. Suspend foliar spray of fertilizers and pesticides to prevent chemical drift and wastage.`
    });
  }

  if (humidity >= 85) {
    alerts.push({
      type: 'fungal_risk',
      severity: 'moderate',
      title: 'Elevated Fungal Infection Risk',
      description: `Sustained high humidity (${humidity}%) creates favorable conditions for fungal foliar blights and downy mildew. Inspect crop canopies.`
    });
  }

  if (rain >= 15) {
    alerts.push({
      type: 'heavy_rainfall',
      severity: 'high',
      title: 'Heavy Rainfall Advisory',
      description: `Substantial precipitation (${rain} mm) recorded or forecast. Immediately inspect drainage channels to prevent waterlogging and root asphyxiation.`
    });
  }

  return alerts;
};

/**
 * Retrieve cached weather from Supabase if valid
 */
const getCachedWeather = async (locationKey) => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('weather_cache')
      .select('weather_data, expires_at')
      .eq('location_key', locationKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data.weather_data;
  } catch (err) {
    logger.warn('Weather cache lookup error', { error: err.message });
    return null;
  }
};

/**
 * Save weather data to Supabase cache
 */
const setCachedWeather = async (locationKey, weatherData) => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const expiresAt = new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000).toISOString();
    await supabase
      .from('weather_cache')
      .upsert({
        location_key: locationKey,
        weather_data: weatherData,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt
      }, { onConflict: 'location_key' });
  } catch (err) {
    logger.warn('Weather cache write failed', { error: err.message });
  }
};

/**
 * Fetch Current Weather & Forecast for a city or coordinates
 */
export const getWeatherData = async ({ location, lat, lon }) => {
  if (!isConfigured.weather) {
    return {
      available: false,
      reason: 'OPENWEATHER_API_KEY is not configured on the server. Please add your key to server/.env',
      data: null
    };
  }

  const queryKey = location ? location.toLowerCase().trim() : `${lat},${lon}`;
  
  // Check cache first
  const cached = await getCachedWeather(queryKey);
  if (cached) {
    logger.info('Returning cached weather data', { queryKey });
    return { available: true, data: cached, fromCache: true };
  }

  try {
    let url = '';
    const apiKey = env.OPENWEATHER_API_KEY;

    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else if (location) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;
    } else {
      throw new Error('Location query or coordinates required.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.text();
      logger.warn('OpenWeatherMap API request failed', { status: response.status, body: errBody });
      if (response.status === 404) {
        throw new Error(`Location '${location}' was not found by the weather service.`);
      }
      throw new Error(`Weather provider responded with status ${response.status}`);
    }

    const json = await response.json();
    const city = json.city?.name || location || 'Unknown';
    const country = json.city?.country || '';

    // First list entry as current reading
    const currentEntry = json.list[0];
    const current = {
      temp: Math.round(currentEntry.main.temp),
      feels_like: Math.round(currentEntry.main.feels_like),
      temp_min: Math.round(currentEntry.main.temp_min),
      temp_max: Math.round(currentEntry.main.temp_max),
      humidity: currentEntry.main.humidity,
      pressure: currentEntry.main.pressure,
      wind_speed: Math.round((currentEntry.wind?.speed || 0) * 3.6), // convert m/s to km/h
      wind_direction: currentEntry.wind?.deg || 0,
      condition: currentEntry.weather[0]?.main || 'Clear',
      description: currentEntry.weather[0]?.description || '',
      icon: currentEntry.weather[0]?.icon || '01d',
      rain: currentEntry.rain ? currentEntry.rain['3h'] || 0 : 0,
      timestamp: currentEntry.dt_txt
    };

    // Group 3-hour forecasts by day for 5-day forecast
    const dailyForecasts = [];
    const seenDates = new Set();

    for (const item of json.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seenDates.has(date) && dailyForecasts.length < 5) {
        seenDates.add(date);
        dailyForecasts.push({
          date,
          temp_max: Math.round(item.main.temp_max),
          temp_min: Math.round(item.main.temp_min),
          condition: item.weather[0]?.main || 'Clear',
          description: item.weather[0]?.description || '',
          icon: item.weather[0]?.icon || '01d',
          humidity: item.main.humidity,
          rain_prob: Math.round((item.pop || 0) * 100),
          wind_speed: Math.round((item.wind?.speed || 0) * 3.6)
        });
      }
    }

    const compiledData = {
      location: {
        city,
        country,
        coord: json.city?.coord
      },
      current,
      forecast: dailyForecasts,
      farming_alerts: deriveFarmingAlerts({ current })
    };

    // Save to cache asynchronously
    setCachedWeather(queryKey, compiledData);

    return {
      available: true,
      data: compiledData,
      fromCache: false
    };
  } catch (error) {
    logger.error('Weather fetching error', error);
    throw error;
  }
};
