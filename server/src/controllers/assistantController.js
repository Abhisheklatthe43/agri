import { generateChatMessage } from '../services/ai/chatAiService.js';
import { getSupabase } from '../services/supabase/supabaseAdmin.js';
import { inMemoryStore } from '../repositories/inMemoryStore.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const handleChatMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      message,
      conversation_id,
      preferred_language = 'en',
      crop_context,
      location_context
    } = req.body;

    const supabase = getSupabase();
    let currentConversationId = conversation_id;
    let messageHistory = [];
    let userProfile = {};

    // 1. Fetch user profile for context
    if (supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile) userProfile = profile;
    } else {
      userProfile = inMemoryStore.getProfile(userId);
    }

    // 2. Ensure Conversation Exists
    if (supabase) {
      if (currentConversationId) {
        // Fetch existing messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('conversation_id', currentConversationId)
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(10);

        if (msgs) messageHistory = msgs;
      } else {
        // Create new conversation
        const conversationTitle = message.length > 40
          ? `${message.substring(0, 37)}...`
          : message;

        const { data: conv, error: convErr } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: userId,
            title: conversationTitle
          })
          .select()
          .single();

        if (!convErr && conv) {
          currentConversationId = conv.id;
        }
      }
    } else {
      // In-memory conversation handling
      if (!currentConversationId) {
        const conv = inMemoryStore.addItem('chatConversations', {
          user_id: userId,
          title: message.substring(0, 40)
        });
        currentConversationId = conv.id;
      }
      messageHistory = inMemoryStore.getMessagesByConversation(currentConversationId, userId);
    }

    // 3. Save User Message
    if (supabase && currentConversationId) {
      await supabase.from('chat_messages').insert({
        conversation_id: currentConversationId,
        user_id: userId,
        role: 'user',
        content: message
      });
    } else {
      inMemoryStore.addItem('chatMessages', {
        conversation_id: currentConversationId,
        user_id: userId,
        role: 'user',
        content: message
      });
    }

    // 4. Generate AI response with Gemini
    const { response, modelName } = await generateChatMessage({
      message,
      history: messageHistory,
      userProfile,
      cropContext: crop_context,
      locationContext: location_context,
      preferredLanguage: preferred_language
    });

    // 5. Save Assistant Message
    const assistantContent = JSON.stringify(response);
    let savedAssistantMsg = null;

    if (supabase && currentConversationId) {
      const { data: msgRow } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: currentConversationId,
          user_id: userId,
          role: 'assistant',
          content: assistantContent
        })
        .select()
        .single();
      savedAssistantMsg = msgRow;
    } else {
      savedAssistantMsg = inMemoryStore.addItem('chatMessages', {
        conversation_id: currentConversationId,
        user_id: userId,
        role: 'assistant',
        content: assistantContent
      });
    }

    return sendSuccess(res, {
      conversation_id: currentConversationId,
      message: {
        id: savedAssistantMsg?.id,
        role: 'assistant',
        content: response.answer,
        metadata: response,
        created_at: new Date().toISOString()
      }
    }, 'Response generated successfully');
  } catch (error) {
    logger.error('Error handling chat message', error);
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return sendSuccess(res, data, 'Conversations retrieved');
      }
    }

    const convs = inMemoryStore.getItemsByUser('chatConversations', userId);
    return sendSuccess(res, convs, 'Conversations retrieved');
  } catch (error) {
    logger.error('Error fetching conversations', error);
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', id)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const parsedMessages = data.map(msg => {
          if (msg.role === 'assistant') {
            try {
              const meta = JSON.parse(msg.content);
              return { ...msg, content: meta.answer || msg.content, metadata: meta };
            } catch {
              return msg;
            }
          }
          return msg;
        });

        return sendSuccess(res, parsedMessages, 'Conversation messages retrieved');
      }
    }

    const rawMsgs = inMemoryStore.getMessagesByConversation(id, userId);
    const parsed = rawMsgs.map(msg => {
      if (msg.role === 'assistant') {
        try {
          const meta = JSON.parse(msg.content);
          return { ...msg, content: meta.answer || msg.content, metadata: meta };
        } catch {
          return msg;
        }
      }
      return msg;
    });

    return sendSuccess(res, parsed, 'Conversation messages retrieved');
  } catch (error) {
    logger.error('Error fetching conversation messages', error);
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return sendSuccess(res, { id }, 'Conversation deleted successfully');
    }

    const deleted = inMemoryStore.deleteItem('chatConversations', id, userId);
    if (!deleted) {
      return sendError(res, 'Conversation not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Conversation deleted successfully');
  } catch (error) {
    logger.error('Error deleting conversation', error);
    next(error);
  }
};
