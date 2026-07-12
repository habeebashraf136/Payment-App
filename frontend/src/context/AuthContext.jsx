import React, { createContext, useState, useEffect } from 'react';
import { apiClient, setAccessToken } from '../infrastructure/api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On every page load / refresh, try to restore the session via the HttpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Ask the backend to issue a new access token using the stored refresh cookie
        const res = await apiClient.post('/auth/get-AccessToken');
        if (res.data.success && res.data.accessToken) {
          // Store the token in memory so subsequent requests are authenticated
          setAccessToken(res.data.accessToken);

          // Now fetch the actual user profile
          const userRes = await apiClient.get('/auth/get-User');
          if (userRes.data.success) {
            setUser(userRes.data.user);
          }
        }
      } catch (error) {
        // No valid refresh cookie — user is not logged in. That's fine.
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const loginUser = (userData, token) => {
    if (token) setAccessToken(token);
    // Normalize: login returns { id }, get-User returns { _id } — keep both
    const normalized = { ...userData, _id: userData._id || userData.id };
    setUser(normalized);
  };

  const logoutUser = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (_) {
      // Even if server-side fails, clear client state
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
