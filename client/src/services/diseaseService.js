import { apiRequest } from './api';

export const diseaseService = {
  analyzeDisease: async (formData) => {
    const res = await apiRequest('/disease/analyze', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
    return res.data;
  },

  getHistory: async () => {
    const res = await apiRequest('/disease/history');
    return res.data || [];
  },

  getReportById: async (id) => {
    const res = await apiRequest(`/disease/${id}`);
    return res.data;
  },

  deleteReport: async (id) => {
    const res = await apiRequest(`/disease/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
