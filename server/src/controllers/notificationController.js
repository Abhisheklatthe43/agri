import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return sendSuccess(res, data, 'Notifications retrieved');
      }
    }

    const notifs = inMemoryStore.getItemsByUser('notifications', userId);
    return sendSuccess(res, notifs, 'Notifications retrieved');
  } catch (error) {
    logger.error('Error fetching notifications', error);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        return sendSuccess(res, data, 'Notification marked as read');
      }
    }

    const notif = inMemoryStore.getItemById('notifications', id, userId);
    if (notif) {
      notif.is_read = true;
      return sendSuccess(res, notif, 'Notification marked as read');
    }

    return sendError(res, 'Notification not found', 404, 'NOT_FOUND');
  } catch (error) {
    logger.error('Error updating notification', error);
    next(error);
  }
};
