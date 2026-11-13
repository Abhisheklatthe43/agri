import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { Sprout, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address')
});

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async ({ email }) => {
    try {
      setErrorMsg(null);
      setSubmitting(true);
      await authService.resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send recovery email.');
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
          Reset Password
        </h2>
        <p className="mt-2 text-center text-xs text-text-muted">
          We will send secure recovery instructions to your registered email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 rounded-3xl border border-surface-border">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{errorMsg}</p>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main mb-2">Check Your Email</h3>
              <p className="text-xs text-text-muted mb-6 leading-relaxed">
                If an account matches that email address, password reset instructions have been dispatched.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-agri-700 hover:text-agri-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Sending Instructions...' : 'Send Recovery Link'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
