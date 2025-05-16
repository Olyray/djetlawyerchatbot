import React, { ReactNode, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';

interface PremiumFeatureProps {
  children: ReactNode;
  fallback?: ReactNode;
  showPrompt?: boolean;
  featureType?: 'document' | 'image' | 'camera' | 'audio';
  onPromptClick?: () => void;
}

/**
 * Component that conditionally renders content based on user's premium status
 * Uses cached subscription status information when available
 * If the user is premium, renders the children.
 * If not, renders the fallback or a subscription prompt.
 */
export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  fallback,
  showPrompt = true,
  featureType,
  onPromptClick,
}) => {
  const { isPremium, isLoading, refreshSubscription } = useSubscription();
  
  // Refresh subscription status when component mounts
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Show loading state while verifying
  if (isLoading) {
    return <div className="premium-loading">Verifying access...</div>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showPrompt) {
    return (
      <div className="premium-prompt">
        <p>This is a premium feature. Upgrade to access {featureType || 'premium'} features.</p>
        <button 
          className="premium-prompt-button"
          onClick={onPromptClick}
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  // Return null if no fallback and no prompt
  return null;
};

/**
 * Hook that can be used to check if a premium feature is available
 * and get functions to handle premium feature interactions
 * Uses cached subscription status to avoid excessive API calls
 */
export const usePremiumFeature = (featureType?: 'document' | 'image' | 'camera' | 'audio') => {
  const { isPremium, refreshSubscription, isLoading } = useSubscription();
  
  // No longer refreshing subscription status on every hook usage
  // This avoids duplicate API calls

  // This function can be passed to UI elements to handle premium feature attempts
  const handlePremiumFeatureAttempt = async () => {
    // Only refresh if we're not already loading the status
    // This prevents excessive API calls
    if (!isLoading) {
      await refreshSubscription();
    }
    
    if (!isPremium) {
      // Here you would typically open the subscription modal
      console.log(`Premium feature (${featureType}) attempted by non-premium user`);
      return false;
    }
    return true;
  };

  return {
    isPremium,
    canUseFeature: isPremium,
    isLoading,
    handlePremiumFeatureAttempt,
    refreshSubscription,
  };
}; 