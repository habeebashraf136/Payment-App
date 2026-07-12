import { apiClient } from '../api/apiClient';

export const walletService = {
  checkBalance: async () => {
    const response = await apiClient.get('/wallet/check-balance');
    return response.data;
  }
};
