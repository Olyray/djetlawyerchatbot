// Create a new file: src/utils/axiosConfig.ts
import axios from 'axios';
import { refreshToken } from './tokenManager';
import { store } from '../redux/store';
import { clearCredentials } from '../redux/slices/authSlice';

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Axios Interceptor Working');
    console.log('Error Response:', error.response);
    if (error.response?.status === 401) {
      const state = store.getState();
      const { refreshToken: storedRefreshToken } = state.auth;
      
      if (storedRefreshToken) {
        try {
          await refreshToken(storedRefreshToken, store.dispatch);
          // Retry the original request
          return axios(error.config);
        } catch (refreshError) {
          // Only clear credentials if refresh fails
          store.dispatch(clearCredentials());
        }
      }
    }
    return Promise.reject(error);
  }
);
