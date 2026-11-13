import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { irrigationService } from '../../services/irrigationService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  SOIL_TYPES,
  IRRIGATION_TYPES,
  AREA_UNITS
} from '../../constants/agriculturalData.js';
import {
  Droplets,
  Send,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Waves,
  SunMedium,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const irrigationFormSchema = z.object({
  crop_name: z.string().trim().min(1, 'Crop name is required'),
  growth_stage: z.string().trim().min(1, 'Growth stage is required'),
  soil_type: z.string().trim().min(1, 'Soil type is required'),
  farm_area: z.coerce.number().positive('Farm area must be greater than zero'),
  farm_area_unit: z.string().default('acre'),
  irrigation_method: z.string().trim().min(1, 'Irrigation method is required'),
  water_availability: z.string().trim().min(1, 'Water availability is required'),
  recent_rainfall: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  temperature: z.union([z.coerce.number(), z.literal('')]).optional().nullable(),
  humidity: z.union([z.coerce.number().min(0).max(100), z.literal('')]).optional().nullable()
});

export const IrrigationAdvisory = () => {
  const { profile } = useAuth();

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(irrigationFormSchema),
    defaultValues: {
      crop_name: profile?.primary_crops?.[0] || 'Wheat',
      growth_stage: 'Crown Root Initiation / Tillering',
      soil_type: profile?.soil_type || 'Loamy soil',
      farm_area: profile?.farm_area || 5,
      farm_area_unit: profile?.farm_area_unit || 'acre',
      irrigation_method: profile?.irrigation_availability || 'Drip irrigation',
      water_availability: 'Adequate borewell water',
      recent_rainfall: '',
      temperature: '',
      humidity: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      setErrorMsg(null);
      setAnalyzing(true);

      const payload = {
        ...values,
        recent_rainfall: values.recent_rainfall === '' ? null : values.recent_rainfall,
        temperature: values.temperature === '' ? null : values.temperature,
        humidity: values.humidity === '' ? null : values.humidity
      };

      const result = await irrigationService.recommend(payload);
      setReport(result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate irrigation advisory.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="AI Irrigation Scheduling & Water Intelligence"
        subtitle="Optimize watering schedules to avoid water stress, minimize evaporation losses, and prevent waterlogging"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            Hydro-Crop Model
          </span>
        }
      />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 leading-relaxed">
            <p className="font-bold">Advisory Request Error</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs mb-8">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-border">
          <Droplets className="w-5 h-5 text-agri-700" />
          <h2 className="text-sm font-bold text-text-main">Enter Crop Hydrology Parameters</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Crop Name *</label>
              <input
                type="text"
                {...register('crop_name')}
                placeholder="e.g. Wheat, Sugarcane, Cotton"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              {errors.crop_name && <p className="mt-1 text-[11px] text-red-600">{errors.crop_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Growth Stage *</label>
              <input
                type="text"
                {...register('growth_stage')}
                placeholder="e.g. Flowering, Tillering, Pod fill"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              {errors.growth_stage && <p className="mt-1 text-[11px] text-red-600">{errors.growth_stage.message}</p>}
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

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-main mb-1.5">Farm Area *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('farm_area')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                />
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
              <label className="block text-xs font-semibold text-text-main mb-1.5">Irrigation Method *</label>
              <select
                {...register('irrigation_method')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {IRRIGATION_TYPES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Water Availability *</label>
              <input
                type="text"
                {...register('water_availability')}
                placeholder="e.g. 4 hours electricity daily, Canal on rotation"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Recent Rainfall (mm, Optional)</label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 15 (if rained recently)"
                {...register('recent_rainfall')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Ambient Temperature (°C, Optional)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 32"
                {...register('temperature')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Relative Humidity (%, Optional)</label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 50"
                {...register('humidity')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {analyzing ? 'Calculating Evapotranspiration...' : 'Formulate Irrigation Schedule'}
            </button>
          </div>
        </form>
      </div>

      {/* Advisory Output */}
      {analyzing ? (
        <div className="bg-white p-12 rounded-3xl border border-surface-border text-center">
          <LoadingState message="AgriSmart AI is modeling crop root depth, soil water holding capacity, and climatic evaporation demand..." />
        </div>
      ) : report?.advisory ? (
        <div className="space-y-8 animate-in fade-in">
          {/* Executive Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-surface-border">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Water Management Strategy: {report.crop_name}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Method: {report.input_data?.irrigation_method} • Soil: {report.input_data?.soil_type}
                </p>
              </div>

              <div>
                <StatusBadge
                  status={report.advisory.water_stress_risk}
                  text={`Water Stress: ${report.advisory.water_stress_risk}`}
                />
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed mb-4">
              {report.advisory.summary}
            </p>

            {report.advisory.irrigation_considerations && (
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 text-xs text-cyan-950">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-700" />
                  Critical Moisture-Sensitive Growth Phases:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {report.advisory.irrigation_considerations.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actionable Watering Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2 text-agri-800">
                <CheckCircle2 className="w-5 h-5 text-agri-600" />
                Recommended Watering Operations
              </h3>
              <ul className="space-y-2.5">
                {report.advisory.recommended_actions?.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-agri-100 text-agri-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rainfall Adjustments & Conservation */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2 text-cyan-800">
                <Droplets className="w-5 h-5 text-cyan-600" />
                Rainfall Adjustments & Conservation
              </h3>
              <ul className="space-y-2.5">
                {report.advisory.rainfall_adjustments?.map((adj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      💧
                    </span>
                    <span>{adj}</span>
                  </li>
                ))}
                {report.advisory.water_conservation_methods?.map((m, idx) => (
                  <li key={`c-${idx}`} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      🌱
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Over-irrigation & Waterlogging Warnings */}
          {report.advisory.warnings && report.advisory.warnings.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 shadow-xs">
              <div className="flex items-center gap-2 font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Over-Irrigation & Waterlogging Hazard Warnings
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900 leading-relaxed">
                {report.advisory.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
};
