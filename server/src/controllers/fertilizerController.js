import { generateFertilizerAdvisory } from '../services/ai/fertilizerAiService.js';
import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const recommendFertilizer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inputData = req.body;

    const { advisory, modelName } = await generateFertilizerAdvisory(inputData);

    const recordToSave = {
      user_id: userId,
      crop_name: inputData.crop_name,
      input_data: inputData,
      advisory,
      created_at: new Date().toISOString()
    };

    let savedRecord = null;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('fertilizer_advisories')
        .insert(recordToSave)
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;

        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Fertilizer Advisory Ready',
          message: `Nutrient recommendations formulated for ${inputData.crop_name} (${inputData.growth_stage}).`,
          type: 'advisory'
        });
      }
    }

    if (!savedRecord) {
      savedRecord = inMemoryStore.addItem('fertilizerAdvisories', recordToSave);
      inMemoryStore.addItem('notifications', {
        user_id: userId,
        title: 'Fertilizer Advisory Ready',
        message: `Nutrient recommendations formulated for ${inputData.crop_name} (${inputData.growth_stage}).`,
        type: 'advisory',
        is_read: false
      });
    }

    return sendSuccess(res, savedRecord, 'Fertilizer advisory generated successfully', 201);
  } catch (error) {
    logger.error('Error generating fertilizer advisory', error);
    next(error);
  }
};

export const getFertilizerHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('fertilizer_advisories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return sendSuccess(res, data, 'Fertilizer advisories history retrieved');
      }
    }

    const items = inMemoryStore.getItemsByUser('fertilizerAdvisories', userId);
    return sendSuccess(res, items, 'Fertilizer advisories history retrieved');
  } catch (error) {
    logger.error('Error fetching fertilizer history', error);
    next(error);
  }
};

export const getFertilizerReportById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('fertilizer_advisories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return sendSuccess(res, data, 'Fertilizer advisory retrieved');
      }
    }

    const item = inMemoryStore.getItemById('fertilizerAdvisories', id, userId);
    if (!item) {
      return sendError(res, 'Fertilizer advisory not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, item, 'Fertilizer advisory retrieved');
  } catch (error) {
    logger.error('Error fetching fertilizer advisory by id', error);
    next(error);
  }
};

export const deleteFertilizerReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { error } = await supabase
        .from('fertilizer_advisories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return sendSuccess(res, { id }, 'Fertilizer advisory deleted successfully');
    }

    const deleted = inMemoryStore.deleteItem('fertilizerAdvisories', id, userId);
    if (!deleted) {
      return sendError(res, 'Fertilizer advisory not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Fertilizer advisory deleted successfully');
  } catch (error) {
    logger.error('Error deleting fertilizer advisory', error);
    next(error);
  }
};
