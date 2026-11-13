import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-surface-border mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-agri-600" />
            <span className="font-semibold text-text-main">AgriSmart AI</span>
            <span>— Smart Farming Starts With Smart Decisions.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1 text-[11px] text-text-light">
              <ShieldCheck className="w-3.5 h-3.5 text-agri-700" />
              Verified Decision-Support Platform
            </span>
            <Link to="/settings" className="hover:text-agri-700 transition-colors">Preferences</Link>
            <Link to="/ai-assistant" className="hover:text-agri-700 transition-colors">AI Helpdesk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
