import axios from 'axios';
import { refreshToken } from './tokenManager';
import { store } from '../redux/store';
import { clearCredentials } from '../redux/slices/authSlice';

export function setupAxiosInterceptors() {
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            console.log('401 Error interceptor triggered');
            if (error.response?.status === 401) {
                const state = store.getState();
                const { refreshToken: storedRefreshToken } = state.auth;
                
                if (storedRefreshToken) {
                    try {
                        await refreshToken(storedRefreshToken, store.dispatch);
                        return axios(error.config);
                    } catch (refreshError) {
                        store.dispatch(clearCredentials());
                    }
                }
            }
            return Promise.reject(error);
        }
    );
}
