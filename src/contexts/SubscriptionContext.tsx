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

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import SubscriptionPrompt from '../components/SubscriptionPrompt';
import { initiateSubscription } from '../services/subscriptionService';

interface SubscriptionContextProps {
  showSubscriptionPrompt: (featureType?: 'document' | 'image' | 'camera' | 'audio') => void;
  hideSubscriptionPrompt: () => void;
}

export const SubscriptionContext = createContext<SubscriptionContextProps>({
  showSubscriptionPrompt: () => {},
  hideSubscriptionPrompt: () => {},
});

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [attemptedFeature, setAttemptedFeature] = useState<'document' | 'image' | 'camera' | 'audio' | undefined>(undefined);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const showSubscriptionPrompt = (featureType?: 'document' | 'image' | 'camera' | 'audio') => {
    setAttemptedFeature(featureType);
    setIsPromptOpen(true);
  };

  const hideSubscriptionPrompt = () => {
    setIsPromptOpen(false);
  };

  const handleSubscribe = async () => {
    // Close modal first
    hideSubscriptionPrompt();
    
    // Navigate to pricing/payment page or initiate payment flow
    if (user?.email) {
      try {
        const success = await initiateSubscription(user.email);
        if (success) {
          // Payment successful - could show a success notification here
        }
      } catch (error) {
        console.error('Subscription failed:', error);
      }
    } else {
      // User not logged in - redirect to pricing page
      router.push('/pricing');
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        showSubscriptionPrompt,
        hideSubscriptionPrompt,
      }}
    >
      {children}
      <SubscriptionPrompt
        isOpen={isPromptOpen}
        onClose={hideSubscriptionPrompt}
        attemptedFeature={attemptedFeature}
        onSubscribe={handleSubscribe}
      />
    </SubscriptionContext.Provider>
  );
};

// Custom hook for using subscription context
export const useSubscriptionPrompt = () => useContext(SubscriptionContext); 