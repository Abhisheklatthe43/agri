import { apiRequest } from './api';

export const weatherService = {
  getCurrent: async (location) => {
    const query = location ? `?location=${encodeURIComponent(location)}` : '';
    const res = await apiRequest(`/weather/current${query}`);
    return res.data;
  },

  getForecast: async (location) => {
    const query = location ? `?location=${encodeURIComponent(location)}` : '';
    const res = await apiRequest(`/weather/forecast${query}`);
    return res.data;
  }
};
