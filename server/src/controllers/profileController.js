import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return sendSuccess(res, data, 'Profile retrieved successfully');
      }

      // If user profile doesn't exist yet, create one
      const defaultProfile = {
        id: userId,
        full_name: req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Farmer',
        preferred_language: 'en',
        farm_area_unit: 'acre'
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (!insertErr && inserted) {
        return sendSuccess(res, inserted, 'Profile initialized successfully');
      }
    }

    // Fallback to in-memory store
    const fallbackProfile = inMemoryStore.getProfile(userId);
    return sendSuccess(res, fallbackProfile, 'Profile retrieved successfully');
  } catch (error) {
    logger.error('Error fetching profile', error);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update Supabase profile', error);
        return sendError(res, error.message, 400, 'PROFILE_UPDATE_FAILED');
      }

      return sendSuccess(res, data, 'Profile updated successfully');
    }

    const updated = inMemoryStore.updateProfile(userId, updateData);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    logger.error('Error updating profile', error);
    next(error);
  }
};
