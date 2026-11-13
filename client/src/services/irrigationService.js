import { apiRequest } from './api';

export const irrigationService = {
  recommend: async (data) => {
    const res = await apiRequest('/irrigation/recommend', {
      method: 'POST',
      body: data
    });
    return res.data;
  },

  getHistory: async () => {
    const res = await apiRequest('/irrigation/history');
    return res.data || [];
  },

  getReportById: async (id) => {
    const res = await apiRequest(`/irrigation/${id}`);
    return res.data;
  },

  deleteReport: async (id) => {
    const res = await apiRequest(`/irrigation/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
