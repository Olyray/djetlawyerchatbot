import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchSubscriptionDetails } from '../redux/slices/authSlice';
import { useEffect, useCallback, useRef } from 'react';
import { AnyAction } from '@reduxjs/toolkit';
import { ThunkDispatch } from 'redux-thunk';

// Singleton object to manage and cache subscription state globally
// This prevents multiple components from making redundant API calls
class SubscriptionCache {
  private static instance: SubscriptionCache;
  private lastFetchTime: number = 0;
  private cachedPromise: Promise<any> | null = null;
  private cacheExpiryMs: number = 30000; // 30 seconds cache expiry
  private isRefreshing: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): SubscriptionCache {
    if (!SubscriptionCache.instance) {
      SubscriptionCache.instance = new SubscriptionCache();
    }
    return SubscriptionCache.instance;
  }
  
  public async fetchSubscription(dispatch: ThunkDispatch<RootState, unknown, AnyAction>): Promise<any> {
    const now = Date.now();
    
    // If cache is valid and not expired, return the cached promise
    if (this.cachedPromise && (now - this.lastFetchTime < this.cacheExpiryMs)) {
      return this.cachedPromise;
    }
    
    // If already refreshing, return existing promise to avoid duplicate requests
    if (this.isRefreshing && this.cachedPromise) {
      return this.cachedPromise;
    }
    
    // Start refreshing and create a new promise
    this.isRefreshing = true;
    this.lastFetchTime = now;
    
    // Create and store the promise
    this.cachedPromise = dispatch(fetchSubscriptionDetails())
      .finally(() => {
        this.isRefreshing = false;
      });
    
    return this.cachedPromise;
  }
  
  // Force refresh ignoring the cache
  public forceRefresh(dispatch: ThunkDispatch<RootState, unknown, AnyAction>): Promise<any> {
    // If already refreshing, return existing promise
    if (this.isRefreshing && this.cachedPromise) {
      return this.cachedPromise;
    }
    
    this.isRefreshing = true;
    this.lastFetchTime = Date.now();
    
    this.cachedPromise = dispatch(fetchSubscriptionDetails())
      .finally(() => {
        this.isRefreshing = false;
      });
    
    return this.cachedPromise;
  }
}

interface UseSubscriptionReturn {
  isPremium: boolean;
  planType: 'free' | 'premium' | null;
  expiryDate: string | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  startDate: string | null;
  autoRenew: boolean;
}

/**
 * Hook to access and manage user subscription information
 * Uses a shared cache to prevent duplicate API calls
 * @returns Subscription information and functions to manage it
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const { isPremium, subscriptionDetails, isLoading, token } = useSelector((state: RootState) => state.auth);
  const subscriptionCache = SubscriptionCache.getInstance();
  const hasInitialized = useRef(false);

  // Function to refresh subscription data from the server
  const refreshSubscription = useCallback(async () => {
    if (!token) return;
    
    try {
      await subscriptionCache.fetchSubscription(dispatch);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  }, [dispatch, token, subscriptionCache]);

  // Force refresh ignoring cache - use only when absolutely necessary
  const forceRefreshSubscription = useCallback(async () => {
    if (!token) return;
    
    try {
      await subscriptionCache.forceRefresh(dispatch);
    } catch (error) {
      console.error('Failed to force refresh subscription:', error);
    }
  }, [dispatch, token, subscriptionCache]);

  // Fetch subscription details on mount if user is authenticated
  // But only once per component instance to prevent excessive calls
  useEffect(() => {
    if (token && !hasInitialized.current) {
      refreshSubscription();
      hasInitialized.current = true;
    }
  }, [token, refreshSubscription]);

  return {
    isPremium,
    planType: subscriptionDetails?.planType || null,
    expiryDate: subscriptionDetails?.expiryDate || null,
    startDate: subscriptionDetails?.startDate || null,
    autoRenew: subscriptionDetails?.autoRenew || false,
    isLoading,
    refreshSubscription: forceRefreshSubscription, // Use forceRefresh only when explicitly called
  };
}; 