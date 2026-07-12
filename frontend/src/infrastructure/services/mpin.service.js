import { apiClient } from '../api/apiClient';

export const mpinService = {
  createMpin: async (mpin) => {
    const response = await apiClient.post('/api/mpin/createMpin', { mpin });
    return response.data;
  },
  updateMpin: async (mpin) => {
    const response = await apiClient.put('/api/mpin/updateMpin', { mpin });
    return response.data;
  }
};
