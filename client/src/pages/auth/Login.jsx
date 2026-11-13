import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      setAuthError(null);
      setSubmitting(true);
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setValue('email', 'demo.farmer@agrismart.ai');
    setValue('password', 'AgriSmart#2026');
    try {
      setAuthError(null);
      setSubmitting(true);
      await login('demo.farmer@agrismart.ai', 'AgriSmart#2026');
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-agri-700 text-white flex items-center justify-center shadow-md shadow-agri-700/20">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-agri-950 tracking-tight">AgriSmart AI</span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-text-main">
          Farmer Account Sign In
        </h2>
        <p className="mt-2 text-center text-xs text-text-muted">
          Smart farming decision support at your fingertips
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 rounded-3xl border border-surface-border">
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="farmer@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-agri-700 hover:text-agri-900">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none transition-all"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-6 border-t border-surface-border">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-agri-900 bg-agri-50 hover:bg-agri-100 border border-agri-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-agri-700" />
              Demo Farmer 1-Click Sign In
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            New to AgriSmart AI?{' '}
            <Link to="/register" className="font-semibold text-agri-700 hover:text-agri-900">
              Register farm profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
