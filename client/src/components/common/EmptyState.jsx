import React from 'react';
import { Sprout } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No records found',
  description = 'No farming records or advisory reports are currently saved.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-surface-border">
      <div className="w-14 h-14 rounded-2xl bg-agri-50 text-agri-700 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-text-main mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-agri-700 hover:bg-agri-800 rounded-lg shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
