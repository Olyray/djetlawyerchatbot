'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateAuth } from '../redux/slices/authSlice';
import { useAuthPersistence } from '../hooks/useAuthPersistence'; 

const AuthPersistenceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  useAuthPersistence(); 

  useEffect(() => {
    dispatch(hydrateAuth());
    setIsHydrated(true);
  }, [dispatch]);

  if (!isHydrated) {
    return null; 
  }

  return <>{children}</>;
};

export default AuthPersistenceWrapper;