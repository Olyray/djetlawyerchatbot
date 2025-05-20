/**
 * SubscriptionContext
 * 
 * This context provides a centralized mechanism for managing premium subscription interactions
 * throughout the application. It handles:
 * 
 * - Displaying subscription prompts when users attempt to access premium features
 * - Tracking which premium feature a user attempted to access
 * - Initiating the subscription payment process
 * - Managing subscription modal state
 * 
 * Usage:
 * 1. Wrap your application with the SubscriptionProvider in AppProviders.tsx
 * 2. Use the useSubscriptionPrompt() hook in components that need to check premium access
 * 3. Call showSubscriptionPrompt('featureType') when a user attempts to use a premium feature
 *    without a subscription
 * 
 * Works in conjunction with PremiumFeatureCheck.tsx to create a complete premium feature system.
 */

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import SubscriptionPrompt from '../components/SubscriptionPrompt';
import { initiateSubscriptionWithPopup } from '../services/subscriptionService';
import { useToast } from '@chakra-ui/react';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionContextProps {
  showSubscriptionPrompt: (featureType?: 'document' | 'image' | 'camera' | 'audio') => void;
  hideSubscriptionPrompt: () => void;
  isSubscribing: boolean;
  subscriptionError: string | null;
  lastSubscriptionStatus: 'idle' | 'subscribing' | 'success' | 'error';
}

// Create the context with a default value
const SubscriptionContext = createContext<SubscriptionContextProps>({
  showSubscriptionPrompt: () => {},
  hideSubscriptionPrompt: () => {},
  isSubscribing: false,
  subscriptionError: null,
  lastSubscriptionStatus: 'idle',
});

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [attemptedFeature, setAttemptedFeature] = useState<'document' | 'image' | 'camera' | 'audio' | undefined>(undefined);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [lastSubscriptionStatus, setLastSubscriptionStatus] = useState<'idle' | 'subscribing' | 'success' | 'error'>('idle');
  
  const router = useRouter();
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { refreshSubscription } = useSubscription();

  const showSubscriptionPrompt = useCallback((featureType?: 'document' | 'image' | 'camera' | 'audio') => {
    setAttemptedFeature(featureType);
    setIsPromptOpen(true);
    // Reset any previous errors when showing the prompt
    setSubscriptionError(null);
    setLastSubscriptionStatus('idle');
  }, []);

  const hideSubscriptionPrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  const handleSubscribe = async () => {
    // Reset any previous errors
    setSubscriptionError(null);
    setLastSubscriptionStatus('subscribing');
    
    if (!user?.email) {
      // User not logged in - redirect to login page with return URL
      hideSubscriptionPrompt();
      router.push('/login?returnUrl=/pricing');
      return;
    }
    
    try {
      setIsSubscribing(true);
      
      const success = await initiateSubscriptionWithPopup(user.email);
      
      if (success) {
        // Close the modal
        hideSubscriptionPrompt();
        
        // Update subscription status
        setLastSubscriptionStatus('success');
        
        // Show success message
        toast({
          title: 'Subscription Successful',
          description: 'You now have access to all premium features!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        
        // Refresh subscription status to update UI
        await refreshSubscription();
      } else {
        // Payment was not successful or was cancelled
        setLastSubscriptionStatus('error');
        setSubscriptionError('Subscription process was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      setLastSubscriptionStatus('error');
      setSubscriptionError('An error occurred during the subscription process. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        showSubscriptionPrompt,
        hideSubscriptionPrompt,
        isSubscribing,
        subscriptionError,
        lastSubscriptionStatus,
      }}
    >
      {children}
      <SubscriptionPrompt
        isOpen={isPromptOpen}
        onClose={hideSubscriptionPrompt}
        attemptedFeature={attemptedFeature}
        onSubscribe={handleSubscribe}
        isLoading={isSubscribing}
        error={subscriptionError}
        isSuccess={lastSubscriptionStatus === 'success'}
      />
    </SubscriptionContext.Provider>
  );
};

/**
 * Custom hook to access subscription functionality
 * @returns Subscription context object
 */
export const useSubscriptionPrompt = (): SubscriptionContextProps => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionPrompt must be used within a SubscriptionProvider');
  }
  return context;
}; 