import axios from 'axios';
import { auth } from './firebase';

export const api = axios.create({
  baseURL: '/api'
});

// Attach Bearer token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try token refresh once and retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken(true); // force refresh
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
