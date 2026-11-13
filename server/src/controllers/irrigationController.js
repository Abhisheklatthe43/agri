import { generateIrrigationAdvisory } from '../services/ai/irrigationAiService.js';
import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const recommendIrrigation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inputData = req.body;

    const { advisory, modelName } = await generateIrrigationAdvisory(inputData);

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
        .from('irrigation_advisories')
        .insert(recordToSave)
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;

        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Irrigation Advisory Formulated',
          message: `Water scheduling and stress assessment for ${inputData.crop_name} (${advisory.water_stress_risk} risk).`,
          type: 'advisory'
        });
      }
    }

    if (!savedRecord) {
      savedRecord = inMemoryStore.addItem('irrigationAdvisories', recordToSave);
      inMemoryStore.addItem('notifications', {
        user_id: userId,
        title: 'Irrigation Advisory Formulated',
        message: `Water scheduling and stress assessment for ${inputData.crop_name} (${advisory.water_stress_risk} risk).`,
        type: 'advisory',
        is_read: false
      });
    }

    return sendSuccess(res, savedRecord, 'Irrigation advisory generated successfully', 201);
  } catch (error) {
    logger.error('Error in recommendIrrigation controller', error);
    next(error);
  }
};

export const getIrrigationHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('irrigation_advisories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return sendSuccess(res, data, 'Irrigation advisories history retrieved');
      }
    }

    const items = inMemoryStore.getItemsByUser('irrigationAdvisories', userId);
    return sendSuccess(res, items, 'Irrigation advisories history retrieved');
  } catch (error) {
    logger.error('Error fetching irrigation history', error);
    next(error);
  }
};

export const getIrrigationReportById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('irrigation_advisories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return sendSuccess(res, data, 'Irrigation advisory retrieved');
      }
    }

    const item = inMemoryStore.getItemById('irrigationAdvisories', id, userId);
    if (!item) {
      return sendError(res, 'Irrigation advisory not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, item, 'Irrigation advisory retrieved');
  } catch (error) {
    logger.error('Error fetching irrigation advisory by id', error);
    next(error);
  }
};

export const deleteIrrigationReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { error } = await supabase
        .from('irrigation_advisories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return sendSuccess(res, { id }, 'Irrigation advisory deleted successfully');
    }

    const deleted = inMemoryStore.deleteItem('irrigationAdvisories', id, userId);
    if (!deleted) {
      return sendError(res, 'Irrigation advisory not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Irrigation advisory deleted successfully');
  } catch (error) {
    logger.error('Error deleting irrigation advisory', error);
    next(error);
  }
};
