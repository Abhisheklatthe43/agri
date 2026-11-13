import { apiRequest } from './api';

export const cropService = {
  recommendCrops: async (data) => {
    const res = await apiRequest('/crops/recommend', {
      method: 'POST',
      body: data
    });
    return res.data;
  },

  getRecommendations: async () => {
    const res = await apiRequest('/crops/recommendations');
    return res.data || [];
  },

  getRecommendationById: async (id) => {
    const res = await apiRequest(`/crops/recommendations/${id}`);
    return res.data;
  },

  deleteRecommendation: async (id) => {
    const res = await apiRequest(`/crops/recommendations/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
