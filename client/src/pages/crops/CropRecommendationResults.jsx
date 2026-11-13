import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { cropService } from '../../services/cropService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Sprout,
  Calendar,
  Droplet,
  Clock,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Printer,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const CropRecommendationResults = () => {
  const { id } = useParams();
  const location = useLocation();

  const [record, setRecord] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!record);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!record && id) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const data = await cropService.getRecommendationById(id);
          setRecord(data);
        } catch (err) {
          setError(err.message || 'Failed to load recommendation report.');
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id, record]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading crop recommendation report..." />
      </PageContainer>
    );
  }

  if (error || !record) {
    return (
      <PageContainer>
        <ErrorState
          title="Recommendation Report Not Found"
          message={error || 'Could not locate the requested agricultural report.'}
        />
      </PageContainer>
    );
  }

  const { input_data, recommendations, model_name, created_at } = record;
  const cropsList = recommendations?.recommendations || [];

  // Data for chart
  const chartData = cropsList.map(c => ({
    name: c.crop_name,
    score: c.suitability_score
  }));

  const getBarColor = (score) => {
    if (score >= 80) return '#15803D'; // primary green
    if (score >= 60) return '#22C55E';
    return '#EAB308'; // amber
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link
          to="/crop-recommendation"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-agri-700 hover:text-agri-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Crop Advisory Form
        </Link>
      </div>

      <PageHeader
        title="Crop Suitability Advisory Report"
        subtitle={`Evaluated for ${input_data?.district}, ${input_data?.state} • Season: ${input_data?.season} • Soil: ${input_data?.soil_type}`}
        action={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-text-main bg-white border border-surface-border rounded-xl hover:bg-surface-hover shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-text-muted" />
            Print Report
          </button>
        }
        badge={
          <span className="text-xs font-medium text-text-muted">
            Report ID: {id?.substring(0, 8)}
          </span>
        }
      />

      {/* Advisory Disclaimer Alert */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Agricultural Advisory Notice</p>
          <p>
            AI recommendations are decision-support projections based on supplied parameters and regional models. Actual yields are subject to microclimate fluctuations, seed quality, and field management. Consult local Krishi Vigyan Kendra (KVK) or agriculture extension officers.
          </p>
        </div>
      </div>

      {/* Overview & Limitations Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs mb-8">
        <h2 className="text-sm font-bold text-text-main mb-2">Executive Agricultural Summary</h2>
        <p className="text-xs text-text-muted leading-relaxed mb-4">
          {recommendations?.summary}
        </p>

        {recommendations?.location_context && (
          <div className="p-3.5 rounded-xl bg-agri-50 border border-agri-200 text-xs text-agri-900 mb-4">
            <span className="font-bold">Agro-Climatic Zone: </span>
            {recommendations.location_context}
          </div>
        )}

        {recommendations?.data_limitations && recommendations.data_limitations.length > 0 && (
          <div className="pt-3 border-t border-surface-border">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Input Data Notes & Estimation Boundaries:
            </p>
            <ul className="list-disc list-inside text-xs text-text-muted space-y-1">
              {recommendations.data_limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recharts Suitability Comparison */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs mb-8">
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">
            Comparative Suitability Score Index (0 - 100)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`${value} / 100`, 'Suitability Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ranked Crop Cards */}
      <div className="space-y-6 mb-8">
        <h2 className="text-sm font-bold text-text-main">
          Ranked Suitable Crops ({cropsList.length})
        </h2>

        {cropsList.map((crop, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-xs hover:border-agri-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 pb-4 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-agri-100 text-agri-800 font-black text-sm flex items-center justify-center shrink-0">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-agri-950 flex items-center gap-2">
                    {crop.crop_name}
                    {crop.scientific_name && (
                      <span className="text-xs font-normal italic text-text-muted">
                        ({crop.scientific_name})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Target Season: {crop.planting_season}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={crop.suitability_level} text={`${crop.suitability_score}% Match`} />
              </div>
            </div>

            {/* Quick Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-surface-bg rounded-xl">
                <p className="text-[10px] text-text-muted">Growing Duration</p>
                <p className="text-xs font-bold text-text-main mt-0.5">{crop.growing_duration_days}</p>
              </div>
              <div className="p-3 bg-surface-bg rounded-xl">
                <p className="text-[10px] text-text-muted">Water Requirement</p>
                <p className="text-xs font-bold text-text-main mt-0.5">{crop.water_requirement}</p>
              </div>
              <div className="p-3 bg-surface-bg rounded-xl">
                <p className="text-[10px] text-text-muted">Soil Fit</p>
                <p className="text-xs font-bold text-text-main mt-0.5 truncate">{crop.soil_compatibility}</p>
              </div>
              <div className="p-3 bg-surface-bg rounded-xl">
                <p className="text-[10px] text-text-muted">Climate Fit</p>
                <p className="text-xs font-bold text-text-main mt-0.5 truncate">{crop.climate_compatibility}</p>
              </div>
            </div>

            {/* Explanation & Nutrition */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <p className="font-semibold text-text-main mb-1">AgriSmart AI Analysis:</p>
                <p className="text-text-muted">{crop.explanation}</p>
              </div>

              {crop.fertilizer_considerations && crop.fertilizer_considerations.length > 0 && (
                <div>
                  <p className="font-semibold text-text-main mb-1">Fertilizer & Soil Needs:</p>
                  <ul className="list-disc list-inside text-text-muted space-y-0.5">
                    {crop.fertilizer_considerations.map((f, fi) => (
                      <li key={fi}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {crop.risks && crop.risks.length > 0 && (
                <div>
                  <p className="font-semibold text-amber-900 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Potential Agronomic Risks:
                  </p>
                  <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                    {crop.risks.map((r, ri) => (
                      <li key={ri}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Next Steps */}
      {recommendations?.next_steps && recommendations.next_steps.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs mb-8">
          <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Recommended Pre-Sowing Next Steps
          </h3>
          <ul className="space-y-2">
            {recommendations.next_steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="mt-0.5">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-border">
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-text-muted hover:text-text-main"
        >
          Return to Dashboard
        </Link>
        <Link
          to="/fertilizer-advisory"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-sm transition-all"
        >
          Formulate Fertilizer Plan
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </PageContainer>
  );
};
