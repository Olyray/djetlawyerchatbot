import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, hydrateAuth } from '../redux/slices/authSlice';
import { refreshToken } from '../utils/tokenManager'; 
import { RootState } from '../redux/store';

export const useAuthPersistence = () => {
  const dispatch = useDispatch();
  const { token, refreshToken: storedRefreshToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (token && storedRefreshToken) {
      const refreshInterval = setInterval(async () => {
        try {
          await refreshToken(storedRefreshToken, dispatch);
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