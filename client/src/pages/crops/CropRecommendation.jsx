import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { cropService } from '../../services/cropService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import {
  SOIL_TYPES,
  SEASONS,
  IRRIGATION_TYPES,
  AREA_UNITS,
  INDIAN_STATES
} from '../../constants/agriculturalData.js';
import {
  Sprout,
  Send,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

const cropFormSchema = z.object({
  state: z.string().trim().min(1, 'State is required'),
  district: z.string().trim().min(1, 'District is required'),
  soil_type: z.string().trim().min(1, 'Soil type is required'),
  season: z.string().trim().min(1, 'Season is required'),
  farm_area: z.coerce.number().positive('Farm area must be greater than zero'),
  farm_area_unit: z.string().default('acre'),
  water_availability: z.string().trim().min(1, 'Water availability is required'),
  
  // Optional measurements
  soil_ph: z.union([z.coerce.number().min(0).max(14), z.literal('')]).optional().nullable(),
  nitrogen: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  phosphorus: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  potassium: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  temperature: z.union([z.coerce.number(), z.literal('')]).optional().nullable(),
  humidity: z.union([z.coerce.number().min(0).max(100), z.literal('')]).optional().nullable(),
  rainfall: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  previous_crop: z.string().trim().optional().nullable(),
  farming_objective: z.string().trim().optional().nullable()
});

export const CropRecommendation = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      state: profile?.state || 'Maharashtra',
      district: profile?.district || 'Pune',
      soil_type: profile?.soil_type || 'Black soil',
      season: 'Kharif',
      farm_area: profile?.farm_area || 5,
      farm_area_unit: profile?.farm_area_unit || 'acre',
      water_availability: profile?.irrigation_availability || 'Drip irrigation',
      soil_ph: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      temperature: '',
      humidity: '',
      rainfall: '',
      previous_crop: profile?.primary_crops?.[0] || '',
      farming_objective: 'Maximize sustainable crop yield and soil health'
    }
  });

  const onSubmit = async (values) => {
    try {
      setSubmitError(null);
      setAnalyzing(true);

      // Clean empty string optional fields to null
      const payload = {
        ...values,
        soil_ph: values.soil_ph === '' ? null : values.soil_ph,
        nitrogen: values.nitrogen === '' ? null : values.nitrogen,
        phosphorus: values.phosphorus === '' ? null : values.phosphorus,
        potassium: values.potassium === '' ? null : values.potassium,
        temperature: values.temperature === '' ? null : values.temperature,
        humidity: values.humidity === '' ? null : values.humidity,
        rainfall: values.rainfall === '' ? null : values.rainfall
      };

      const result = await cropService.recommendCrops(payload);
      navigate(`/crop-recommendation/results/${result.id}`, { state: { result } });
    } catch (err) {
      setSubmitError(err.message || 'Failed to generate crop recommendations.');
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <PageContainer>
        <div className="bg-white p-12 rounded-3xl border border-surface-border text-center max-w-xl mx-auto shadow-sm my-12">
          <LoadingState message="AgriSmart AI is synthesizing regional soil properties, seasonal climate indices, and Gemini agricultural reasoning..." />
          <p className="mt-4 text-xs text-text-muted">
            Ranking crop compatibility and water stress factors...
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Crop Recommendation Engine"
        subtitle="Analyze soil, regional climate, and seasonal variables to discover the most suitable, high-yield crops"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Gemini Agro-Suitability
          </span>
        }
      />

      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 leading-relaxed">
            <p className="font-bold">Recommendation Request Error</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Farm Parameters Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-border">
            <Sprout className="w-5 h-5 text-agri-700" />
            <h2 className="text-sm font-bold text-text-main">1. Essential Farm & Season Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">State *</label>
              <select
                {...register('state')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-[11px] text-red-600">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">District *</label>
              <input
                type="text"
                {...register('district')}
                placeholder="e.g. Pune / Belgaum / Indore"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              {errors.district && <p className="mt-1 text-[11px] text-red-600">{errors.district.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Soil Type *</label>
              <select
                {...register('soil_type')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {SOIL_TYPES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Target Sowing Season *</label>
              <select
                {...register('season')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {SEASONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-main mb-1.5">Farm Area *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('farm_area')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                />
                {errors.farm_area && <p className="mt-1 text-[11px] text-red-600">{errors.farm_area.message}</p>}
              </div>
              <div className="w-28">
                <label className="block text-xs font-semibold text-text-main mb-1.5">Unit</label>
                <select
                  {...register('farm_area_unit')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
                >
                  {AREA_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Water / Irrigation *</label>
              <select
                {...register('water_availability')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {IRRIGATION_TYPES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Soil & Climate Measurements (Collapsible) */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-agri-50 text-agri-700 flex items-center justify-center font-bold text-xs">
                NPK
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-main">
                  2. Optional Laboratory Soil & Climate Measurements
                </h3>
                <p className="text-[11px] text-text-muted">
                  Provide soil pH, NPK levels, or rainfall for maximum recommendation precision
                </p>
              </div>
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>

          {showAdvanced && (
            <div className="p-6 sm:p-8 pt-0 border-t border-surface-border space-y-6">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p>
                  If you haven't conducted a soil test, leave these fields blank. AgriSmart AI will use standard agro-climatic zone heuristics and clearly indicate estimated parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Soil pH (0 - 14)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 6.8"
                    {...register('soil_ph')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                  {errors.soil_ph && <p className="mt-1 text-[11px] text-red-600">{errors.soil_ph.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Nitrogen N (kg/ha)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 140"
                    {...register('nitrogen')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Phosphorus P (kg/ha)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 45"
                    {...register('phosphorus')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Potassium K (kg/ha)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 180"
                    {...register('potassium')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 28.5"
                    {...register('temperature')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Relative Humidity (%)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 65"
                    {...register('humidity')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Expected Rainfall (mm)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 850"
                    {...register('rainfall')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">Previous Crop Grown</label>
                  <input
                    type="text"
                    placeholder="e.g. Chickpea / Wheat"
                    {...register('previous_crop')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">Farmer Goal / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Low water requirement with organic market demand"
                  {...register('farming_objective')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-lg shadow-agri-700/20 transition-all cursor-pointer hover:scale-101"
          >
            <Send className="w-4 h-4" />
            Generate AI Crop Advisory
          </button>
        </div>
      </form>
    </PageContainer>
  );
};
