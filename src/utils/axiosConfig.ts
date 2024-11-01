import { store } from '../redux/store';
import { clearCredentials } from '../redux/slices/authSlice';
import { refreshToken } from './tokenManager';

export async function fetchWithInterceptor(url: string, options: RequestInit = {}) {
    let response = await fetch(url, options);
    if (response.status === 401) {
        const state = store.getState();
        const { refreshToken: storedRefreshToken } = state.auth;
        if (storedRefreshToken) {
            try {
                // Try to refresh the token
                await refreshToken(storedRefreshToken, store.dispatch);
                
                // If refresh successful, retry the original request
                // We need to get the new token from the store
                const newState = store.getState();
                const newOptions = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newState.auth.token}`
                    }
                };
                
                // Retry the original request with the new token
                response = await fetch(url, newOptions);
            } catch (refreshError) {
                store.dispatch(clearCredentials());
                throw new Error('Authentication failed');
            }
        }
    }

    // If response is not ok after all attempts, throw an error
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}