import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { apiRequest } from '../../services/api';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SUPPORTED_LANGUAGES, AREA_UNITS } from '../../constants/agriculturalData.js';
import {
  Settings,
  Languages,
  CheckCircle2,
  Cpu,
  Database,
  CloudSun,
  ShieldCheck,
  Save,
  LogOut,
  HelpCircle
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, profile, updateProfileState, logout } = useAuth();

  const [language, setLanguage] = useState(profile?.preferred_language || 'en');
  const [areaUnit, setAreaUnit] = useState(profile?.farm_area_unit || 'acre');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiRequest('/health');
        setSystemHealth(res.data);
      } catch (err) {
        console.warn('Health check note:', err.message);
      } finally {
        setHealthLoading(false);
      }
    };
    checkHealth();
  }, []);

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      const updated = await profileService.updateProfile({
        preferred_language: language,
        farm_area_unit: areaUnit
      });
      updateProfileState(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Application Settings & Integration Health"
        subtitle="Configure advisory language, measurement units, and audit connected cloud services"
      />

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-semibold text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          Application preferences updated successfully!
        </div>
      )}

      <div className="space-y-8 max-w-4xl">
        {/* Localization & Measurement Preferences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <h2 className="text-sm font-bold text-text-main pb-3 mb-6 border-b border-surface-border flex items-center gap-2">
            <Languages className="w-4 h-4 text-agri-700" />
            Advisory Preferences & Units
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Default Advisory Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-text-muted">
                AgriSmart AI will generate crop guidance and chat responses in this language.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Farm Area Measurement Unit
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {AREA_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-text-muted">
                Standard unit for land area across crop and irrigation calculators.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Cloud & AI Diagnostic Status Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <h2 className="text-sm font-bold text-text-main pb-3 mb-6 border-b border-surface-border flex items-center gap-2">
            <Cpu className="w-4 h-4 text-agri-700" />
            Backend Infrastructure & Integration Health
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" /> Google Gemini
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  systemHealth?.integrations?.geminiAi === 'configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {systemHealth?.integrations?.geminiAi || 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Model: @google/genai SDK (gemini-2.5-flash)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" /> Supabase DB
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  systemHealth?.integrations?.supabaseDatabase === 'configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {systemHealth?.integrations?.supabaseDatabase || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                PostgreSQL RLS & Cloud Storage
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-blue-600" /> OpenWeather
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  systemHealth?.integrations?.openWeather === 'configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {systemHealth?.integrations?.openWeather || 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                5-Day Telemetry & Agro-Alerts
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-text-muted flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              To update API keys (GEMINI_API_KEY, SUPABASE_URL, OPENWEATHER_API_KEY), edit your <code className="bg-slate-200 px-1 py-0.5 rounded text-text-main font-mono text-[11px]">server/.env</code> file and restart the development server.
            </p>
          </div>
        </div>

        {/* Account Details & Logout */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-text-main">Signed in as {user?.email}</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Session managed securely by Supabase Auth</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Account
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
