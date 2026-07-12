import { apiClient } from '../api/apiClient';

export const walletService = {
  checkBalance: async () => {
    const response = await apiClient.get('/api/wallet/check-balance');
    return response.data;
  }
};
