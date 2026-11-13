import { generateCropRecommendations } from '../services/ai/cropAiService.js';
import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const recommendCrops = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inputData = req.body;

    const { recommendations, modelName } = await generateCropRecommendations(inputData);

    const recordToSave = {
      user_id: userId,
      input_data: inputData,
      recommendations,
      model_name: modelName,
      status: 'completed'
    };

    let savedRecord = null;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('crop_recommendations')
        .insert(recordToSave)
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;

        // Create in-app notification
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Crop Recommendation Ready',
          message: `Recommended ${recommendations.recommendations.length} suitable crops for ${inputData.district}, ${inputData.state}.`,
          type: 'advisory'
        });
      }
    }

    if (!savedRecord) {
      savedRecord = inMemoryStore.addItem('cropRecommendations', recordToSave);
      inMemoryStore.addItem('notifications', {
        user_id: userId,
        title: 'Crop Recommendation Ready',
        message: `Recommended ${recommendations.recommendations.length} suitable crops for ${inputData.district}, ${inputData.state}.`,
        type: 'advisory',
        is_read: false
      });
    }

    return sendSuccess(res, savedRecord, 'Crop recommendations generated successfully', 201);
  } catch (error) {
    logger.error('Error in recommendCrops controller', error);
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('crop_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return sendSuccess(res, data, 'Crop recommendations history retrieved');
      }
    }

    const items = inMemoryStore.getItemsByUser('cropRecommendations', userId);
    return sendSuccess(res, items, 'Crop recommendations history retrieved');
  } catch (error) {
    logger.error('Error fetching crop recommendations history', error);
    next(error);
  }
};

export const getRecommendationById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('crop_recommendations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return sendSuccess(res, data, 'Recommendation details retrieved');
      }
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
    }

    const item = inMemoryStore.getItemById('cropRecommendations', id, userId);
    if (!item) {
      return sendError(res, 'Crop recommendation report not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, item, 'Recommendation details retrieved');
  } catch (error) {
    logger.error('Error fetching crop recommendation by id', error);
    next(error);
  }
};

export const deleteRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { error } = await supabase
        .from('crop_recommendations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      return sendSuccess(res, { id }, 'Crop recommendation deleted successfully');
    }

    const deleted = inMemoryStore.deleteItem('cropRecommendations', id, userId);
    if (!deleted) {
      return sendError(res, 'Crop recommendation not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Crop recommendation deleted successfully');
  } catch (error) {
    logger.error('Error deleting crop recommendation', error);
    next(error);
  }
};
