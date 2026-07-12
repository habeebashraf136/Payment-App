import { apiClient, setAccessToken } from '../api/apiClient';

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.success && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.success && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    setAccessToken(null);
    return response.data;
  }
};
