import { apiRequest } from './api';

export const fertilizerService = {
  recommend: async (data) => {
    const res = await apiRequest('/fertilizer/recommend', {
      method: 'POST',
      body: data
    });
    return res.data;
  },

  getHistory: async () => {
    const res = await apiRequest('/fertilizer/history');
    return res.data || [];
  },

  getReportById: async (id) => {
    const res = await apiRequest(`/fertilizer/${id}`);
    return res.data;
  },

  deleteReport: async (id) => {
    const res = await apiRequest(`/fertilizer/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
