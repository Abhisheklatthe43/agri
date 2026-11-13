import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Sprout, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password required')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      setAuthError(null);
      setSubmitting(true);
      await registerAuth(values.email, values.password, values.fullName);
      setSuccessMsg('Registration successful! Setting up your farm dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
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
          Create Farmer Account
        </h2>
        <p className="mt-2 text-center text-xs text-text-muted">
          Access AI crop intelligence, plant pathology, and precision weather
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

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none transition-all"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.fullName.message}</p>
              )}
            </div>

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
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="Minimum 6 characters"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none transition-all"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Re-enter password"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none transition-all"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all disabled:opacity-60 cursor-pointer mt-2"
            >
              {submitting ? 'Creating Profile...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-agri-700 hover:text-agri-900">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
