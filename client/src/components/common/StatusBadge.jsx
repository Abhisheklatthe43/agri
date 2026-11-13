import React from 'react';

export const StatusBadge = ({ status, text }) => {
  const normalized = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['high', 'healthy', 'low_risk', 'completed', 'active'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (['moderate', 'possibly_affected', 'medium', 'pending', 'mild'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (['severe', 'inconclusive', 'critical', 'failed', 'high_risk'].includes(normalized)) {
    styles = 'bg-red-50 text-red-800 border-red-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} capitalize`}>
      {text || status}
    </span>
  );
};
