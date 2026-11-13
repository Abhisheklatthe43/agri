import React from 'react';

export const PageHeader = ({ title, subtitle, action, badge }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text-main">{title}</h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};
