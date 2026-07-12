import { apiClient } from '../api/apiClient';

export const transactionService = {
  getTransactions: async () => {
    const response = await apiClient.get('/api/transactions/getTransactions');
    return response.data;
  },
  sendMoney: async (payload) => {
    // payload: { receiverUpiId, amount, mpin }
    const response = await apiClient.post('/api/transactions/sendMoney', payload);
    return response.data;
  }
};
