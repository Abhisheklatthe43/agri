import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ScanSearch,
  CloudSun,
  Beaker,
  Droplets,
  BotMessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Users
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-agri-700 text-white flex items-center justify-center shadow-md shadow-agri-700/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-agri-950 tracking-tight">AgriSmart AI</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-agri-100 text-agri-800">
                Next-Gen AgTech
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-agri-800 hover:text-agri-950 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all hover:translate-y-[-1px]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-agri-50/40 to-surface-bg border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-agri-100/80 border border-agri-300 text-xs font-semibold text-agri-900 mb-6">
            <Cpu className="w-3.5 h-3.5 text-agri-700" />
            Powered by Google Gemini 2.5 & Multimodal Vision
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-agri-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Smart Farming Starts With{' '}
            <span className="text-agri-700 underline decoration-agri-300 decoration-wavy decoration-2">
              Smart Decisions
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            The complete AI-powered crop intelligence platform. Empowering farmers with personalized crop recommendations, real-time plant disease detection, weather forecasts, and customized nutrient planning.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-lg shadow-agri-700/25 transition-all hover:scale-102"
            >
              Create Free Farmer Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-text-main bg-white hover:bg-surface-hover border border-surface-border shadow-xs transition-colors"
            >
              Sign In to Farm Dashboard
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
              <p className="text-2xl font-bold text-agri-800">50+ Crops</p>
              <p className="text-xs text-text-muted mt-1">Cereals, pulses, oilseeds & horticulture</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
              <p className="text-2xl font-bold text-agri-800">Vision AI</p>
              <p className="text-xs text-text-muted mt-1">Instant plant pathogen & symptom analysis</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
              <p className="text-2xl font-bold text-agri-800">Live Weather</p>
              <p className="text-xs text-text-muted mt-1">5-day forecasts & agricultural risk alerts</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
              <p className="text-2xl font-bold text-agri-800">Multilingual</p>
              <p className="text-xs text-text-muted mt-1">Conversational advice in 9+ languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-agri-700 uppercase tracking-widest mb-2">Core Capabilities</h2>
            <p className="text-3xl font-extrabold text-agri-950">Everything a Modern Farmer Needs to Succeed</p>
            <p className="mt-3 text-sm text-text-muted">
              Built on verified agricultural research, climatic suitability, and intelligent machine reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-surface-bg border border-surface-border hover:border-agri-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Intelligent Crop Suitability</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Ranked crop recommendations based on your soil type, seasonal rainfall, water availability, and agro-climatic zone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-surface-bg border border-surface-border hover:border-agri-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                <ScanSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Plant Disease Detection</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Upload leaf or plant photos. Gemini Vision diagnoses fungal, bacterial, viral blights, and nutrient deficiencies with confidence metrics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-surface-bg border border-surface-border hover:border-agri-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-6">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Farming Weather Intelligence</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Real weather telemetry with actionable alerts for frost, heat stress, heavy rainfall drainage, and spray drift conditions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-surface-bg border border-surface-border hover:border-agri-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6">
                <Beaker className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Nutrient & Fertilizer Planning</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Tailored fertilizer guidance combining organic inputs, biofertilizers, and balanced NPK nutrition across crop growth stages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-surface-bg border border-surface-border hover:border-agri-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-6">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Smart Irrigation Advisory</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Water conservation schedules tuned to soil moisture holding capacities, drip/sprinkler methods, and rainfall adjustments.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-surface-bg border border-surface-border hover:border-agri-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-6">
                <BotMessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">24/7 AI Farming Chatbot</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Ask any farming question in your native language. Context-aware conversational assistant trained with agricultural safety directives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-agri-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-agri-400 uppercase tracking-widest mb-2">Simplified Workflow</h2>
            <p className="text-3xl font-extrabold text-white">How AgriSmart AI Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-agri-900/60 border border-agri-800">
              <span className="text-3xl font-black text-agri-400">01</span>
              <h3 className="text-base font-bold mt-3 mb-2">Set Up Farm Profile</h3>
              <p className="text-xs text-agri-200 leading-relaxed">Enter your district, soil type, farm size, and irrigation access.</p>
            </div>
            <div className="p-6 rounded-2xl bg-agri-900/60 border border-agri-800">
              <span className="text-3xl font-black text-agri-400">02</span>
              <h3 className="text-base font-bold mt-3 mb-2">Select Advisory Service</h3>
              <p className="text-xs text-agri-200 leading-relaxed">Choose crop selection, plant scan, fertilizer, or irrigation guidance.</p>
            </div>
            <div className="p-6 rounded-2xl bg-agri-900/60 border border-agri-800">
              <span className="text-3xl font-black text-agri-400">03</span>
              <h3 className="text-base font-bold mt-3 mb-2">AI Reasoning Engine</h3>
              <p className="text-xs text-agri-200 leading-relaxed">Gemini processes real farm context and external weather data.</p>
            </div>
            <div className="p-6 rounded-2xl bg-agri-900/60 border border-agri-800">
              <span className="text-3xl font-black text-agri-400">04</span>
              <h3 className="text-base font-bold mt-3 mb-2">Save & Act Confidently</h3>
              <p className="text-xs text-agri-200 leading-relaxed">Access saved reports anytime, view next steps, and monitor health.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-agri-100 border-t border-agri-200 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-950">
            Ready to Transform Your Agricultural Productivity?
          </h2>
          <p className="mt-3 text-sm text-agri-800 max-w-xl mx-auto">
            Join thousands of progressive farmers using AgriSmart AI for precision crop advisory and sustainable harvests.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all hover:scale-102"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-border py-8 text-center text-xs text-text-muted mt-auto">
        <p>© 2026 AgriSmart AI. All rights reserved. Designed for sustainable agricultural development.</p>
      </footer>
    </div>
  );
};
