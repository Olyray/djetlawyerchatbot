import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, hydrateAuth, fetchSubscriptionDetails } from '../redux/slices/authSlice';
import { refreshToken } from '../utils/tokenManager'; 
import { RootState, AppDispatch } from '../redux/store';

export const useAuthPersistence = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, refreshToken: storedRefreshToken } = useSelector((state: RootState) => state.auth);

  // Hydrate auth from localStorage
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // Fetch subscription details as soon as token is available
  useEffect(() => {
    if (token) {
      // Fetch subscription details immediately after login or page load
      dispatch(fetchSubscriptionDetails());
    }
  }, [token, dispatch]);

  // Set up token refresh interval
  useEffect(() => {
    if (token && storedRefreshToken) {
      const refreshInterval = setInterval(async () => {
        try {
          await refreshToken(storedRefreshToken, dispatch);
          // Refresh subscription details after token refresh
          dispatch(fetchSubscriptionDetails());
        } catch (error) {
          console.error('Failed to refresh token:', error);
          dispatch(clearCredentials());
        }
      }, 25 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [token, storedRefreshToken, dispatch]);

  const logout = () => {
    dispatch(clearCredentials());
  };

  return { logout };
};