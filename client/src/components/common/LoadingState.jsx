import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading agricultural data...', minHeight = 'min-h-[300px]' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} p-8 text-center`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-agri-100 border-t-agri-700 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm">🌱</span>
        </div>
      </div>
      <p className="text-sm font-medium text-text-muted animate-pulse">{message}</p>
    </div>
  );
};
