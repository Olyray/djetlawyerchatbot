import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, hydrateAuth } from '../redux/slices/authSlice';

export const useAuthPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  const logout = () => {
    dispatch(clearCredentials());
  };

  return { logout };
};