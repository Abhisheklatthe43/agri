import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while fetching information.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/60 rounded-2xl border border-red-200">
      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-950 mb-1">{title}</h3>
      <p className="text-sm text-red-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-800 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};
