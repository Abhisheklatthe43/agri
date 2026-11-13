import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { diseaseService } from '../../services/diseaseService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ScanSearch,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Printer,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileCheck2
} from 'lucide-react';

export const DiseaseAnalysisReport = () => {
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
          const data = await diseaseService.getReportById(id);
          setRecord(data);
        } catch (err) {
          setError(err.message || 'Failed to load disease analysis report.');
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
        <LoadingState message="Loading plant pathology report..." />
      </PageContainer>
    );
  }

  if (error || !record) {
    return (
      <PageContainer>
        <ErrorState
          title="Disease Analysis Report Not Found"
          message={error || 'Could not locate the requested pathology report.'}
        />
      </PageContainer>
    );
  }

  const { crop_name, image_path, symptoms, analysis, created_at } = record;
  const causes = analysis?.possible_causes || [];

  return (
    <PageContainer>
      <div className="mb-4">
        <Link
          to="/disease-detection"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-agri-700 hover:text-agri-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Disease Scanner
        </Link>
      </div>

      <PageHeader
        title="Plant Health Diagnosis Report"
        subtitle={`Specimen: ${crop_name || 'Plant'} • Examined on ${new Date(created_at).toLocaleDateString()}`}
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
            Scan Ref: {id?.substring(0, 8)}
          </span>
        }
      />

      {/* Safety Notice Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Plant Pathology Advisory Notice</p>
          <p>
            Image-based identification indicates probable causes based on visible patterns. It is not an irrefutable laboratory diagnosis. For persistent or high-impact blights, confirm with a local agricultural extension specialist or plant pathology laboratory before taking drastic chemical interventions.
          </p>
        </div>
      </div>

      {/* Top Section: Image & Diagnostic Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Specimen Photo (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-surface-border shadow-xs">
          <h3 className="text-xs font-bold text-text-main mb-3 uppercase tracking-wider">
            Examined Plant Specimen
          </h3>
          <div className="rounded-2xl overflow-hidden border border-surface-border bg-slate-900 max-h-[360px] flex items-center justify-center">
            {image_path ? (
              <img
                src={image_path}
                alt="Plant specimen"
                className="w-full h-full object-contain max-h-[360px]"
              />
            ) : (
              <div className="p-12 text-center text-white text-xs">
                Specimen Image Preview Unavailable
              </div>
            )}
          </div>
          {symptoms && (
            <div className="mt-4 p-3 bg-surface-bg rounded-xl text-xs text-text-muted">
              <span className="font-semibold text-text-main">Reported Symptoms: </span>
              {symptoms}
            </div>
          )}
        </div>

        {/* Diagnosis Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge status={analysis?.health_status} text={analysis?.health_status?.replace('_', ' ')} />
              <StatusBadge status={analysis?.severity} text={`Severity: ${analysis?.severity}`} />
              {analysis?.expert_consultation_required && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  Expert Review Recommended
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-agri-950 mb-2">
              {analysis?.primary_finding}
            </h2>

            {/* Visible Symptoms */}
            {analysis?.visible_symptoms && analysis.visible_symptoms.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-text-main mb-2">Visible Pathological Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.visible_symptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-surface-bg border border-surface-border text-xs text-text-main font-medium"
                    >
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Probable Causes with Confidence Progress */}
          <div className="mt-6 pt-6 border-t border-surface-border">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">
              Differential Diagnosis & Confidence
            </h3>

            <div className="space-y-4">
              {causes.map((cause, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-surface-bg border border-surface-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-main">{cause.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-surface-border text-text-muted capitalize font-medium">
                        {cause.category?.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-agri-700">{cause.confidence}% Match</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-agri-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cause.confidence}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {cause.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Management & Prevention Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Immediate Actions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2 text-agri-800">
            <CheckCircle2 className="w-5 h-5 text-agri-600" />
            Immediate Cultural & Remedial Actions
          </h3>
          <ul className="space-y-2.5">
            {analysis?.immediate_actions?.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-agri-100 text-agri-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prevention Practices */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2 text-emerald-800">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            Long-Term Prevention & Field Sanitation
          </h3>
          <ul className="space-y-2.5">
            {analysis?.prevention_methods?.map((prev, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  ✓
                </span>
                <span>{prev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Limitations & Lab Diagnostics */}
      {analysis?.limitations && analysis.limitations.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs mb-8">
          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2">
            Pathology Confidence & Disclaimers
          </h4>
          <ul className="list-disc list-inside text-xs text-text-muted space-y-1">
            {analysis.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
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
          to="/ai-assistant"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-sm transition-all"
        >
          Consult AI Assistant on Treatment
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </PageContainer>
  );
};
