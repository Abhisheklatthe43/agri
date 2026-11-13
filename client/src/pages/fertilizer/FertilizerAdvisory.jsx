import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { fertilizerService } from '../../services/fertilizerService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SOIL_TYPES } from '../../constants/agriculturalData.js';
import {
  Beaker,
  Send,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  FlaskConical,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const fertilizerFormSchema = z.object({
  crop_name: z.string().trim().min(1, 'Crop name is required'),
  growth_stage: z.string().trim().min(1, 'Growth stage is required'),
  soil_type: z.string().trim().min(1, 'Soil type is required'),
  soil_ph: z.union([z.coerce.number().min(0).max(14), z.literal('')]).optional().nullable(),
  nitrogen: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  phosphorus: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  potassium: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional().nullable(),
  soil_test_details: z.string().trim().optional().nullable(),
  farming_method: z.string().default('integrated')
});

export const FertilizerAdvisory = () => {
  const { profile } = useAuth();

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(fertilizerFormSchema),
    defaultValues: {
      crop_name: profile?.primary_crops?.[0] || 'Tomato',
      growth_stage: 'Vegetative Growth',
      soil_type: profile?.soil_type || 'Black soil',
      soil_ph: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      soil_test_details: '',
      farming_method: 'integrated'
    }
  });

  const onSubmit = async (values) => {
    try {
      setErrorMsg(null);
      setAnalyzing(true);

      const payload = {
        ...values,
        soil_ph: values.soil_ph === '' ? null : values.soil_ph,
        nitrogen: values.nitrogen === '' ? null : values.nitrogen,
        phosphorus: values.phosphorus === '' ? null : values.phosphorus,
        potassium: values.potassium === '' ? null : values.potassium
      };

      const result = await fertilizerService.recommend(payload);
      setReport(result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate fertilizer advisory.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="AI Fertilizer & Soil Nutrient Advisory"
        subtitle="Formulate balanced soil nutrition combining organic amendments, biofertilizers, and targeted crop-stage NPK"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Nutrient Balancing
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

      {/* Advisory Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs mb-8">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-border">
          <Beaker className="w-5 h-5 text-agri-700" />
          <h2 className="text-sm font-bold text-text-main">Enter Crop & Soil Nutrient Context</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Crop Name *</label>
              <input
                type="text"
                {...register('crop_name')}
                placeholder="e.g. Tomato, Soybean, Wheat"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              {errors.crop_name && <p className="mt-1 text-[11px] text-red-600">{errors.crop_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Growth Stage *</label>
              <select
                {...register('growth_stage')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                <option value="Basal Application (Pre-sowing)">Basal Application (Pre-sowing)</option>
                <option value="Seedling / Emergence">Seedling / Emergence</option>
                <option value="Vegetative Growth">Vegetative Growth</option>
                <option value="Flowering / Tillering">Flowering / Tillering</option>
                <option value="Fruit / Grain Filling">Fruit / Grain Filling</option>
                <option value="Maturation">Maturation</option>
              </select>
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
              <label className="block text-xs font-semibold text-text-main mb-1.5">Farming Practice</label>
              <select
                {...register('farming_method')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                <option value="integrated">Integrated Nutrient Management (Recommended)</option>
                <option value="organic">Strictly Organic / Natural Farming</option>
                <option value="conventional">Conventional Chemical Farming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Soil pH (Optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 6.5"
                {...register('soil_ph')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Available Nitrogen (N kg/ha)</label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 120 (Optional)"
                {...register('nitrogen')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Available Phosphorus (P kg/ha)</label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 35 (Optional)"
                {...register('phosphorus')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Available Potassium (K kg/ha)</label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 210 (Optional)"
                {...register('potassium')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Soil Test Laboratory Remarks</label>
              <input
                type="text"
                placeholder="e.g. Low organic carbon, zinc deficiency noted"
                {...register('soil_test_details')}
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
              {analyzing ? 'Formulating Advisory...' : 'Formulate Nutrient Plan'}
            </button>
          </div>
        </form>
      </div>

      {/* Advisory Output Card */}
      {analyzing ? (
        <div className="bg-white p-12 rounded-3xl border border-surface-border text-center">
          <LoadingState message="AgriSmart AI is calculating nutrient uptake ratios, organic alternatives, and split application timing..." />
        </div>
      ) : report?.advisory ? (
        <div className="space-y-8 animate-in fade-in">
          {/* Executive Summary */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
            <h3 className="text-sm font-bold text-text-main mb-2">Fertilizer Recommendation Summary</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              {report.advisory.summary}
            </p>

            {report.advisory.soil_observations && report.advisory.soil_observations.length > 0 && (
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-teal-700" />
                  Soil Dynamics & Characteristics:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {report.advisory.soil_observations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Nutrient Assessment */}
          {report.advisory.nutrient_assessment && report.advisory.nutrient_assessment.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">
                Macronutrient Status Assessment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.advisory.nutrient_assessment.map((nut, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-surface-bg border border-surface-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-text-main">{nut.nutrient}</span>
                      <StatusBadge status={nut.status} text={nut.status} />
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{nut.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-main">
              Application Guidance & Nutrient Split ({report.advisory.recommendations?.length || 0})
            </h3>
            {report.advisory.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs hover:border-teal-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                    {rec.type}
                  </span>
                  <h4 className="text-sm font-bold text-text-main">{rec.recommendation}</h4>
                </div>

                <div className="space-y-2 text-xs text-text-muted leading-relaxed">
                  <p>
                    <span className="font-semibold text-text-main">Method & Timing: </span>
                    {rec.application_guidance}
                  </p>

                  {rec.precautions && rec.precautions.length > 0 && (
                    <div className="pt-2">
                      <span className="font-semibold text-amber-900">Precautions: </span>
                      <span className="text-amber-800">{rec.precautions.join(' • ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Warnings & Soil Test Notice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.advisory.soil_testing_recommended && (
              <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <FlaskConical className="w-4 h-4 text-blue-700" />
                  Soil Laboratory Testing Recommended
                </div>
                <p className="leading-relaxed text-blue-900">
                  For optimal economic returns and to prevent soil salinity, submit a 500g composite soil sample to your district soil testing laboratory (STL) before major fertilizer investment.
                </p>
              </div>
            )}

            {report.advisory.warnings && report.advisory.warnings.length > 0 && (
              <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Agronomic Warnings
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                  {report.advisory.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
};
