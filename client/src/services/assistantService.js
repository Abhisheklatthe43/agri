import { apiRequest } from './api';

export const assistantService = {
  sendMessage: async (payload) => {
    const res = await apiRequest('/assistant/chat', {
      method: 'POST',
      body: payload
    });
    return res.data;
  },

  getConversations: async () => {
    const res = await apiRequest('/assistant/conversations');
    return res.data || [];
  },

  getMessages: async (conversationId) => {
    const res = await apiRequest(`/assistant/conversations/${conversationId}`);
    return res.data || [];
  },

  deleteConversation: async (conversationId) => {
    const res = await apiRequest(`/assistant/conversations/${conversationId}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
