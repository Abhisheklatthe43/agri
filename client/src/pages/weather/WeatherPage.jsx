import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { weatherService } from '../../services/weatherService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  CloudSun,
  Search,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  RefreshCw,
  Sun,
  CloudRain,
  MapPin,
  Sparkles
} from 'lucide-react';

export const WeatherPage = () => {
  const { profile } = useAuth();

  const defaultLocation = profile?.district
    ? `${profile.district}, ${profile.state || 'Maharashtra'}`
    : 'Pune, Maharashtra';

  const [locationInput, setLocationInput] = useState(defaultLocation);
  const [activeLocation, setActiveLocation] = useState(defaultLocation);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (loc) => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherService.getCurrent(loc);
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Unable to retrieve meteorological data for this location.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(activeLocation);
  }, [activeLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      setActiveLocation(locationInput.trim());
    }
  };

  // Forecast chart data
  const forecastChartData = weatherData?.forecast?.map(f => ({
    date: new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    maxTemp: f.temp_max,
    minTemp: f.temp_min,
    rainProb: f.rain_prob
  })) || [];

  return (
    <PageContainer>
      <PageHeader
        title="Agro-Meteorological Intelligence"
        subtitle="Real-time telemetry, 5-day forecasts, and actionable agricultural weather alerts"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CloudSun className="w-3.5 h-3.5 text-blue-600" />
            Live Weather Station
          </span>
        }
      />

      {/* Location Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-surface-border shadow-xs mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <MapPin className="w-4 h-4 text-agri-700" />
            </div>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Search Indian District / City (e.g. Nashik, Ludhiana, Coimbatore)"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-sm transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Check Weather
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingState message="Fetching live meteorological data..." />
      ) : error ? (
        <ErrorState
          title="Weather Information Unavailable"
          message={error}
          onRetry={() => fetchWeather(activeLocation)}
        />
      ) : !weatherData ? (
        <div className="bg-white p-12 rounded-3xl border border-surface-border text-center">
          <CloudSun className="w-12 h-12 text-agri-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-text-main mb-1">Weather Provider Configuration Pending</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Please configure your OPENWEATHER_API_KEY in server/.env to access live forecasts.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Agricultural Alerts */}
          {weatherData.farming_alerts && weatherData.farming_alerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Active Agricultural Weather Advisories
              </h2>
              {weatherData.farming_alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-xs ${
                    alert.severity === 'high'
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold">{alert.title}</h4>
                    <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Weather Card */}
          <div className="bg-gradient-to-br from-agri-900 to-agri-950 text-white p-8 rounded-3xl shadow-xl shadow-agri-950/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-agri-800">
              <div>
                <span className="text-xs font-semibold text-agri-300 uppercase tracking-widest">
                  Live Conditions • {weatherData.location?.city}, {weatherData.location?.country}
                </span>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-5xl font-black">{weatherData.current.temp}°C</span>
                  <span className="text-sm text-agri-200 capitalize">
                    {weatherData.current.description || weatherData.current.condition}
                  </span>
                </div>
                <p className="text-xs text-agri-300 mt-1">
                  Feels like {weatherData.current.feels_like}°C • Max: {weatherData.current.temp_max}°C • Min: {weatherData.current.temp_min}°C
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-agri-800 sm:pl-8">
                <p className="text-[11px] text-agri-300">Observation Time</p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  {weatherData.current.timestamp || new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Weather Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-3.5 bg-agri-800/60 rounded-2xl border border-agri-700/50">
                <div className="flex items-center gap-2 text-agri-300 text-xs mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" /> Relative Humidity
                </div>
                <p className="text-xl font-bold">{weatherData.current.humidity}%</p>
              </div>

              <div className="p-3.5 bg-agri-800/60 rounded-2xl border border-agri-700/50">
                <div className="flex items-center gap-2 text-agri-300 text-xs mb-1">
                  <Wind className="w-4 h-4 text-teal-400" /> Wind Velocity
                </div>
                <p className="text-xl font-bold">{weatherData.current.wind_speed} km/h</p>
              </div>

              <div className="p-3.5 bg-agri-800/60 rounded-2xl border border-agri-700/50">
                <div className="flex items-center gap-2 text-agri-300 text-xs mb-1">
                  <CloudRain className="w-4 h-4 text-cyan-400" /> Precipitation
                </div>
                <p className="text-xl font-bold">{weatherData.current.rain || 0} mm</p>
              </div>

              <div className="p-3.5 bg-agri-800/60 rounded-2xl border border-agri-700/50">
                <div className="flex items-center gap-2 text-agri-300 text-xs mb-1">
                  <Compass className="w-4 h-4 text-indigo-400" /> Atmospheric Pressure
                </div>
                <p className="text-xl font-bold">{weatherData.current.pressure} hPa</p>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Cards */}
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-6">
                5-Day Agricultural Forecast
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface-bg border border-surface-border text-center flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-text-main">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5 capitalize">{day.description || day.condition}</p>
                    </div>

                    <div className="my-3">
                      <span className="text-2xl font-black text-agri-950">{day.temp_max}°</span>
                      <span className="text-xs text-text-muted ml-1">/ {day.temp_min}°</span>
                    </div>

                    <div className="text-[11px] text-text-muted pt-2 border-t border-surface-border/60 space-y-1">
                      <p>Rain: <span className="font-semibold text-text-main">{day.rain_prob}%</span></p>
                      <p>Humidity: <span className="font-semibold text-text-main">{day.humidity}%</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Temperature Forecast Area Chart */}
          {forecastChartData.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">
                Temperature Trend (°C)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15803D" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#15803D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val, name) => [`${val}°C`, name === 'maxTemp' ? 'Max Temp' : 'Min Temp']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="maxTemp" stroke="#15803D" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};
