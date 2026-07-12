import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

apiClient.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Do not try to refresh if the request was for login or token refresh
      if (originalRequest.url.includes('/api/auth/get-AccessToken') || originalRequest.url.includes('/api/auth/login')) {
        return Promise.reject(error);
      }
      
      try {
        // Attempt to refresh the token using the httpOnly cookie
        const res = await axios.post(`${API_BASE_URL}/api/auth/get-AccessToken`, {}, {
          withCredentials: true 
        });
        
        if (res.data.success && res.data.accessToken) {
          setAccessToken(res.data.accessToken);
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is expired or invalid. Force logout.
        setAccessToken(null);
        // Dispatch custom event or let AuthContext handle it instead of hard reload
        // window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
