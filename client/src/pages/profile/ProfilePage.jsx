import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import {
  SOIL_TYPES,
  IRRIGATION_TYPES,
  AREA_UNITS,
  INDIAN_STATES,
  SUPPORTED_LANGUAGES
} from '../../constants/agriculturalData.js';
import {
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sprout,
  Languages,
  Plus,
  X
} from 'lucide-react';

const profileFormSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  district: z.string().trim().optional().nullable(),
  village: z.string().trim().optional().nullable(),
  farm_area: z.coerce.number().positive('Farm area must be greater than zero').optional().nullable(),
  farm_area_unit: z.string().default('acre'),
  soil_type: z.string().trim().optional().nullable(),
  irrigation_availability: z.string().trim().optional().nullable(),
  farming_experience: z.string().trim().optional().nullable(),
  preferred_language: z.string().default('en')
});

export const ProfilePage = () => {
  const { profile, refreshProfile, updateProfileState } = useAuth();

  const [cropsList, setCropsList] = useState([]);
  const [newCropInput, setNewCropInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileFormSchema)
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        state: profile.state || 'Maharashtra',
        district: profile.district || 'Pune',
        village: profile.village || '',
        farm_area: profile.farm_area || 5,
        farm_area_unit: profile.farm_area_unit || 'acre',
        soil_type: profile.soil_type || 'Black soil',
        irrigation_availability: profile.irrigation_availability || 'Drip irrigation',
        farming_experience: profile.farming_experience || '5-10 years',
        preferred_language: profile.preferred_language || 'en'
      });
      setCropsList(profile.primary_crops || ['Soybean', 'Wheat']);
    }
  }, [profile, reset]);

  const handleAddCrop = () => {
    if (newCropInput.trim() && !cropsList.includes(newCropInput.trim())) {
      setCropsList([...cropsList, newCropInput.trim()]);
      setNewCropInput('');
    }
  };

  const handleRemoveCrop = (cropToRemove) => {
    setCropsList(cropsList.filter(c => c !== cropToRemove));
  };

  const onSubmit = async (data) => {
    try {
      setSaveError(null);
      setSaveSuccess(false);
      const payload = {
        ...data,
        primary_crops: cropsList
      };
      const updated = await profileService.updateProfile(payload);
      updateProfileState(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update farmer profile.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Farmer Profile & Land Details"
        subtitle="Manage your agricultural credentials, soil parameters, and regional farming preferences"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-agri-100 text-agri-900 border border-agri-300">
            <UserCheck className="w-3.5 h-3.5 text-agri-700" />
            Verified Profile
          </span>
        }
      />

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-semibold text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          Farmer profile saved successfully! AI recommendations are now synced to your farm parameters.
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs font-semibold text-red-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Personal Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-border">
            <MapPin className="w-5 h-5 text-agri-700" />
            <h2 className="text-sm font-bold text-text-main">1. Farmer Identity & Regional Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Full Name *</label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              {errors.full_name && (
                <p className="mt-1 text-[11px] text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Phone Number (Optional)</label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">State *</label>
              <select
                {...register('state')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">District *</label>
              <input
                type="text"
                {...register('district')}
                placeholder="e.g. Pune / Nagpur / Nashik"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Village / Town</label>
              <input
                type="text"
                {...register('village')}
                placeholder="e.g. Khed"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Preferred Advisory Language</label>
              <select
                {...register('preferred_language')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Farm Characteristics */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-border">
            <Sprout className="w-5 h-5 text-agri-700" />
            <h2 className="text-sm font-bold text-text-main">2. Farm Soil & Irrigation Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-main mb-1.5">Total Farm Area *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('farm_area')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                />
                {errors.farm_area && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.farm_area.message}</p>
                )}
              </div>
              <div className="w-32">
                <label className="block text-xs font-semibold text-text-main mb-1.5">Unit</label>
                <select
                  {...register('farm_area_unit')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
                >
                  {AREA_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Dominant Soil Type</label>
              <select
                {...register('soil_type')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {SOIL_TYPES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Irrigation Availability</label>
              <select
                {...register('irrigation_availability')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
              >
                {IRRIGATION_TYPES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Farming Experience</label>
              <input
                type="text"
                {...register('farming_experience')}
                placeholder="e.g. 10 years, Multi-generational"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
            </div>
          </div>

          {/* Primary Crops Tag Editor */}
          <div className="mt-6 pt-6 border-t border-surface-border">
            <label className="block text-xs font-semibold text-text-main mb-2">
              Primary Crops Grown on Farm
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cropsList.map((crop, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-agri-50 text-agri-800 border border-agri-200"
                >
                  {crop}
                  <button
                    type="button"
                    onClick={() => handleRemoveCrop(crop)}
                    className="hover:text-red-600 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newCropInput}
                onChange={(e) => setNewCropInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCrop();
                  }
                }}
                placeholder="Add crop (e.g. Cotton, Tomato, Onion)"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCrop}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-agri-100 text-agri-800 hover:bg-agri-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};
