import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer } from '../../components/common/PageContainer';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { weatherService } from '../../services/weatherService';
import { cropService } from '../../services/cropService';
import { diseaseService } from '../../services/diseaseService';
import {
  Sprout,
  ScanSearch,
  CloudSun,
  Beaker,
  Droplets,
  BotMessageSquare,
  ArrowRight,
  AlertTriangle,
  FileText,
  Clock,
  Wind,
  Droplet,
  Compass,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { user, profile } = useAuth();

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentDiseases, setRecentDiseases] = useState([]);
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalScans: 0,
    farmArea: 0
  });

  const farmerName = profile?.full_name || user?.user_metadata?.full_name || 'Farmer';
  const locationQuery = profile?.district ? `${profile.district}, ${profile.state}` : 'Pune, Maharashtra';

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        // 1. Load Weather
        try {
          const w = await weatherService.getCurrent(locationQuery);
          if (mounted && w) setWeatherData(w);
        } catch (wErr) {
          console.warn('Weather load note:', wErr.message);
        } finally {
          if (mounted) setWeatherLoading(false);
        }

        // 2. Load Recent Crops
        try {
          const crops = await cropService.getRecommendations();
          if (mounted && crops) {
            setRecentCrops(crops.slice(0, 3));
            setStats(prev => ({ ...prev, totalCrops: crops.length }));
          }
        } catch (cErr) {
          console.warn('Crops load note:', cErr.message);
        }

        // 3. Load Recent Diseases
        try {
          const diseases = await diseaseService.getHistory();
          if (mounted && diseases) {
            setRecentDiseases(diseases.slice(0, 3));
            setStats(prev => ({ ...prev, totalScans: diseases.length }));
          }
        } catch (dErr) {
          console.warn('Disease load note:', dErr.message);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [locationQuery]);

  const quickActions = [
    {
      title: 'Crop Advisory',
      desc: 'Find high-yield crops matching soil & climate',
      icon: Sprout,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      to: '/crop-recommendation'
    },
    {
      title: 'Scan Plant Disease',
      desc: 'Instant leaf symptom analysis with Gemini Vision',
      icon: ScanSearch,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      to: '/disease-detection'
    },
    {
      title: 'Live Weather',
      desc: 'Precipitation, wind drift & heat stress alerts',
      icon: CloudSun,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      to: '/weather'
    },
    {
      title: 'Fertilizer Planning',
      desc: 'Balanced NPK & organic nutrient recommendations',
      icon: Beaker,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      to: '/fertilizer-advisory'
    },
    {
      title: 'Irrigation Advisory',
      desc: 'Water scheduling & soil moisture management',
      icon: Droplets,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      to: '/irrigation-advisory'
    },
    {
      title: 'AI Farming Assistant',
      desc: 'Ask questions 24/7 in your preferred language',
      icon: BotMessageSquare,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      to: '/ai-assistant'
    }
  ];

  return (
    <PageContainer>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-agri-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-agri-950/10 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Sprout className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-800/80 border border-agri-600/40 text-[11px] font-semibold text-agri-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-agri-300" />
            AI Precision Farming Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Welcome back, {farmerName}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-agri-100/90 leading-relaxed">
            Farm profile: <span className="font-semibold">{profile?.district || 'Setup District'}, {profile?.state || 'State'}</span> • Soil: <span className="font-semibold">{profile?.soil_type || 'Loamy soil'}</span> • Area: <span className="font-semibold">{profile?.farm_area || '5'} {profile?.farm_area_unit || 'acre'}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/crop-recommendation"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-agri-950 bg-white hover:bg-agri-50 shadow-sm transition-all"
            >
              Get Crop Advisory
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/disease-detection"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-agri-700/60 hover:bg-agri-700/80 border border-agri-500/50 transition-colors"
            >
              Scan Plant Leaf
            </Link>
          </div>
        </div>
      </div>

      {/* Weather Alert Banner if present */}
      {weatherData?.farming_alerts && weatherData.farming_alerts.length > 0 && (
        <div className="mb-8 space-y-3">
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
              <div className="flex-1">
                <h4 className="text-xs font-bold">{alert.title}</h4>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: Weather Card & Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Intelligence Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-surface-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-agri-700" />
              <h2 className="text-sm font-bold text-text-main">Local Agro-Weather</h2>
            </div>
            <Link to="/weather" className="text-xs font-semibold text-agri-700 hover:text-agri-900 flex items-center gap-1">
              5-Day <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {weatherLoading ? (
            <LoadingState message="Fetching live telemetry..." minHeight="min-h-[160px]" />
          ) : weatherData?.current ? (
            <div>
              <div className="flex items-center justify-between my-2">
                <div>
                  <p className="text-3xl font-extrabold text-agri-950">
                    {weatherData.current.temp}°C
                  </p>
                  <p className="text-xs text-text-muted capitalize">
                    {weatherData.current.description || weatherData.current.condition}
                  </p>
                </div>
                <div className="text-right text-xs text-text-muted space-y-1">
                  <p>H: {weatherData.current.temp_max}°C</p>
                  <p>L: {weatherData.current.temp_min}°C</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-surface-border text-center">
                <div className="bg-surface-bg p-2 rounded-xl">
                  <Droplet className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <p className="text-[10px] text-text-muted">Humidity</p>
                  <p className="text-xs font-bold text-text-main">{weatherData.current.humidity}%</p>
                </div>
                <div className="bg-surface-bg p-2 rounded-xl">
                  <Wind className="w-4 h-4 mx-auto text-teal-600 mb-1" />
                  <p className="text-[10px] text-text-muted">Wind</p>
                  <p className="text-xs font-bold text-text-main">{weatherData.current.wind_speed} km/h</p>
                </div>
                <div className="bg-surface-bg p-2 rounded-xl">
                  <Compass className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                  <p className="text-[10px] text-text-muted">Rain</p>
                  <p className="text-xs font-bold text-text-main">{weatherData.current.rain || 0} mm</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-text-muted">
              <CloudSun className="w-8 h-8 text-text-light mx-auto mb-2 opacity-50" />
              <p>Configure OpenWeather key in server/.env for live local forecasts.</p>
            </div>
          )}
        </div>

        {/* Quick Activity Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Sprout className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-text-muted">Crop Advisories</p>
              <p className="text-2xl font-black text-text-main mt-1">{stats.totalCrops}</p>
            </div>
            <Link to="/history" className="text-xs text-agri-700 font-semibold hover:underline mt-4 flex items-center gap-1">
              View records <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <ScanSearch className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-text-muted">Plant Health Scans</p>
              <p className="text-2xl font-black text-text-main mt-1">{stats.totalScans}</p>
            </div>
            <Link to="/disease-detection" className="text-xs text-amber-700 font-semibold hover:underline mt-4 flex items-center gap-1">
              New leaf scan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-text-muted">Monitored Acreage</p>
              <p className="text-2xl font-black text-text-main mt-1">
                {profile?.farm_area || '5'} <span className="text-xs font-medium text-text-muted">{profile?.farm_area_unit || 'acre'}</span>
              </p>
            </div>
            <Link to="/profile" className="text-xs text-teal-700 font-semibold hover:underline mt-4 flex items-center gap-1">
              Update farm size <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
          <span>Agricultural Services</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.to}
                className="group p-5 bg-white rounded-2xl border border-surface-border hover:border-agri-300 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-text-main group-hover:text-agri-700 transition-colors flex items-center justify-between">
                    {action.title}
                    <ArrowRight className="w-3.5 h-3.5 text-text-light group-hover:translate-x-1 group-hover:text-agri-700 transition-all" />
                  </h3>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Crop Recommendations */}
        <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
              <Sprout className="w-4 h-4 text-agri-700" />
              Recent Crop Recommendations
            </h3>
            <Link to="/history" className="text-[11px] font-semibold text-agri-700 hover:underline">
              All History
            </Link>
          </div>

          {recentCrops.length > 0 ? (
            <div className="divide-y divide-surface-border">
              {recentCrops.map((item) => (
                <Link
                  key={item.id}
                  to={`/crop-recommendation/results/${item.id}`}
                  className="py-3 flex items-center justify-between hover:bg-surface-hover px-2 rounded-xl transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-text-main">
                      {item.input_data?.district}, {item.input_data?.state} ({item.input_data?.season})
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {item.recommendations?.recommendations?.length || 0} crops ranked • Soil: {item.input_data?.soil_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-light">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-text-muted">
              <p>No crop recommendations generated yet.</p>
              <Link to="/crop-recommendation" className="mt-2 inline-block font-semibold text-agri-700 hover:underline">
                Generate your first recommendation →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Disease Scans */}
        <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
              <ScanSearch className="w-4 h-4 text-amber-600" />
              Recent Plant Health Scans
            </h3>
            <Link to="/history" className="text-[11px] font-semibold text-agri-700 hover:underline">
              All Scans
            </Link>
          </div>

          {recentDiseases.length > 0 ? (
            <div className="divide-y divide-surface-border">
              {recentDiseases.map((item) => (
                <Link
                  key={item.id}
                  to={`/disease-detection/results/${item.id}`}
                  className="py-3 flex items-center justify-between hover:bg-surface-hover px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.image_path ? (
                      <img
                        src={item.image_path}
                        alt="Crop sample"
                        className="w-10 h-10 rounded-xl object-cover border border-surface-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        🍃
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-text-main">{item.crop_name}</p>
                      <p className="text-[11px] text-text-muted truncate max-w-[200px]">
                        {item.analysis?.primary_finding || item.symptoms}
                      </p>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={item.analysis?.health_status || 'analyzed'} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-text-muted">
              <p>No plant disease scans recorded yet.</p>
              <Link to="/disease-detection" className="mt-2 inline-block font-semibold text-agri-700 hover:underline">
                Upload a plant leaf photo →
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
