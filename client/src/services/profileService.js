import { apiRequest } from './api';

export const profileService = {
  getProfile: async () => {
    const res = await apiRequest('/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await apiRequest('/profile', {
      method: 'PUT',
      body: data
    });
    return res.data;
  }
};
