import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { analyzeCropDiseaseImage } from '../services/ai/diseaseAiService.js';
import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

// Configure Multer for in-memory storage up to 8MB
const storage = multer.memoryStorage();
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
}).single('image');

export const analyzeDisease = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return sendError(res, 'Please upload a plant image for disease diagnosis', 400, 'FILE_REQUIRED');
    }

    const { crop_name, growth_stage, symptoms, duration_of_symptoms, location } = req.body;

    logger.info('Processing plant disease image upload', {
      userId,
      size: file.size,
      mimeType: file.mimetype
    });

    // 1. Upload to Supabase Storage if configured
    let imagePath = '';
    const supabase = getSupabase();
    const fileExt = path.extname(file.originalname) || '.jpg';
    const fileName = `${userId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${fileExt}`;

    if (supabase) {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('crop-disease-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage
          .from('crop-disease-images')
          .getPublicUrl(fileName);
        imagePath = urlData?.publicUrl || fileName;
      } else {
        logger.warn('Supabase storage upload failed, using base64 preview path', { error: uploadErr?.message });
        imagePath = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    } else {
      // In-memory or local data URL
      imagePath = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    // 2. Perform AI Multimodal Analysis
    const { analysis, modelName } = await analyzeCropDiseaseImage({
      imageBuffer: file.buffer,
      mimeType: file.mimetype,
      metadata: {
        crop_name,
        growth_stage,
        symptoms,
        duration_of_symptoms,
        location
      }
    });

    // 3. Persist analysis report
    const recordToSave = {
      user_id: userId,
      crop_name: analysis.crop_name || crop_name || 'Plant Sample',
      image_path: imagePath,
      symptoms: symptoms || analysis.primary_finding,
      analysis,
      model_name: modelName,
      status: 'completed'
    };

    let savedRecord = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('disease_analyses')
        .insert(recordToSave)
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;

        // Create notification
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Plant Health Diagnosis Complete',
          message: `Analysis for ${recordToSave.crop_name}: ${analysis.primary_finding} (${analysis.health_status})`,
          type: 'disease_alert'
        });
      }
    }

    if (!savedRecord) {
      savedRecord = inMemoryStore.addItem('diseaseAnalyses', recordToSave);
      inMemoryStore.addItem('notifications', {
        user_id: userId,
        title: 'Plant Health Diagnosis Complete',
        message: `Analysis for ${recordToSave.crop_name}: ${analysis.primary_finding} (${analysis.health_status})`,
        type: 'disease_alert',
        is_read: false
      });
    }

    return sendSuccess(res, savedRecord, 'Plant disease diagnosis completed successfully', 201);
  } catch (error) {
    logger.error('Error analyzing plant disease', error);
    next(error);
  }
};

export const getDiseaseHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('disease_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return sendSuccess(res, data, 'Disease analysis history retrieved');
      }
    }

    const items = inMemoryStore.getItemsByUser('diseaseAnalyses', userId);
    return sendSuccess(res, items, 'Disease analysis history retrieved');
  } catch (error) {
    logger.error('Error fetching disease history', error);
    next(error);
  }
};

export const getDiseaseReportById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('disease_analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return sendSuccess(res, data, 'Disease analysis report retrieved');
      }
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
    }

    const item = inMemoryStore.getItemById('diseaseAnalyses', id, userId);
    if (!item) {
      return sendError(res, 'Disease analysis report not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, item, 'Disease analysis report retrieved');
  } catch (error) {
    logger.error('Error fetching disease report by id', error);
    next(error);
  }
};

export const deleteDiseaseReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { error } = await supabase
        .from('disease_analyses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return sendSuccess(res, { id }, 'Disease analysis report deleted successfully');
    }

    const deleted = inMemoryStore.deleteItem('diseaseAnalyses', id, userId);
    if (!deleted) {
      return sendError(res, 'Disease analysis report not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Disease analysis report deleted successfully');
  } catch (error) {
    logger.error('Error deleting disease report', error);
    next(error);
  }
};
