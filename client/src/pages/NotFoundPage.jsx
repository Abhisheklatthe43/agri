import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-agri-100 text-agri-800 flex items-center justify-center mb-6 shadow-sm">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-agri-950 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-text-main mb-3">Agricultural Field Not Found</h2>
      <p className="text-xs text-text-muted max-w-md mb-8 leading-relaxed">
        The advisory page, report, or resource you were looking for does not exist or may have been relocated.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          Go to Dashboard
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-text-main bg-white hover:bg-surface-hover border border-surface-border transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  );
};
