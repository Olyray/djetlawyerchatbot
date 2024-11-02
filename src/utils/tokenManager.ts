import axios from 'axios';
import { AppDispatch } from '../redux/store';
import { clearCredentials, setCredentials } from '../redux/slices/authSlice';
import { API_BASE_URL } from '../utils/config';

const REFRESH_ENDPOINT = `${API_BASE_URL}/api/v1/auth/refresh`;

export const refreshToken = async (refreshToken: string, dispatch: AppDispatch) => {
  try {
    const response = await axios.post(REFRESH_ENDPOINT, { refresh_token: refreshToken });
    const { access_token, refresh_token } = response.data;
    
    dispatch(setCredentials({ 
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      token: access_token,
      refreshToken: refresh_token
    }));

    return access_token;
  } catch (error) {
    console.log('tokenManager Refreshtoken error');
    dispatch(clearCredentials());
    throw error;
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};