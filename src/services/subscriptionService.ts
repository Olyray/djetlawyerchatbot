import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { store } from '../redux/store';
import { updateSubscription } from '../redux/slices/authSlice';

// Define Paystack types for TypeScript
interface PaystackPopupResponse {
  reference: string;
  status: string;
  trans: string;
  message: string;
}

interface PaystackPopup {
  setup(config: PaystackConfig): { openIframe(): void };
}

interface PaystackConfig {
  key: string;
  email: string;
  callback: (response: PaystackPopupResponse) => void;
  onClose: () => void;
  // Optional fields
  amount?: number;
  currency?: string;
  ref?: string;
  channels?: string[]; // Payment channels to enable
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

// Declare Paystack global to avoid TypeScript errors
declare global {
  interface Window {
    PaystackPop: PaystackPopup;
  }
}

/**
 * Loads the Paystack script dynamically if not already loaded
 * @returns Promise that resolves when script is loaded
 */
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

/**
 * Opens the subscription payment portal using Paystack
 * @param email User's email address
 * @returns Promise that resolves when payment is complete
 */
export const initiateSubscription = async (email: string): Promise<boolean> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      console.error('Not authenticated');
      return false;
    }
    
    // First initialize the subscription on our backend
    const initResponse = await axios.post(
      `${API_BASE_URL}/api/v1/subscriptions/initialize`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!initResponse.data || !initResponse.data.authorization_url) {
      console.error('Failed to initialize subscription');
      return false;
    }
    
    // Load Paystack script
    await loadPaystackScript();
    
    // Open the Paystack payment page directly
    window.location.href = initResponse.data.authorization_url;
    
    // The page will redirect to our callback URL after payment
    // We don't resolve here because the page will be redirected
    return true;
    
  } catch (error) {
    console.error('Payment initialization failed:', error);
    return false;
  }
};

/**
 * Alternative method that uses Paystack inline popup instead of redirection
 * @param email User's email address
 * @returns Promise that resolves when payment is complete
 */
export const initiateSubscriptionWithPopup = async (email: string): Promise<boolean> => {
  // Load Paystack script if not already loaded
  try {
    await loadPaystackScript();
    
    const token = store.getState().auth.token;
    
    if (!token) {
      console.error('Not authenticated');
      return false;
    }
    
    // Create a function to get a fresh reference for each payment attempt
    const getFreshPaymentReference = async () => {
      try {
        // Initialize the subscription on our backend to get a fresh reference
        const initResponse = await axios.post(
          `${API_BASE_URL}/api/v1/subscriptions/initialize`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!initResponse.data || !initResponse.data.reference) {
          throw new Error('Failed to initialize subscription');
        }
        
        return {
          reference: initResponse.data.reference,
          access_code: initResponse.data.access_code
        };
      } catch (error) {
        console.error('Failed to get payment reference:', error);
        throw error;
      }
    };
    
    return new Promise((resolve) => {
      const handlePayment = async () => {
        try {
          // Get Paystack public key from environment variables
          const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
          
          if (!paystackKey) {
            console.error('Paystack public key not found in environment variables');
            resolve(false);
            return;
          }
          
          // Get a fresh payment reference for this attempt
          const { reference: paymentReference } = await getFreshPaymentReference();
          
          // Log the reference being sent to Paystack
          console.log('Reference being sent to Paystack:', paymentReference);
          
          // Initialize Paystack popup
          const handler = window.PaystackPop.setup({
            key: paystackKey,
            email,
            amount: 100000, // ₦1,000 in kobo
            currency: 'NGN',
            ref: paymentReference,
            channels: ['card'], // Only allow card payments for subscriptions
            callback: function(response) {
              // Handle successful payment
              if (response.status === 'success') {
                // Log the reference received back from Paystack
                console.log('Reference received back from Paystack:', response.reference);
                
                // Use promise chaining instead of async/await
                activateSubscription(response.reference)
                  .then(() => {
                    resolve(true);
                  })
                  .catch((error) => {
                    console.error('Failed to activate subscription:', error);
                    resolve(false);
                  });
              } else {
                console.error('Payment failed:', response);
                resolve(false);
              }
            },
            onClose: function() {
              // Handle payment modal close without completion
              resolve(false);
            }
          });
          
          // Open Paystack payment modal
          handler.openIframe();
        } catch (error) {
          console.error('Failed to setup payment:', error);
          resolve(false);
        }
      };
      
      // Start the payment process
      handlePayment();
    });
    
  } catch (error) {
    console.error('Payment initialization failed:', error);
    return false;
  }
};

/**
 * Activates a subscription after payment
 * @param paymentReference Reference from payment provider
 */
export const activateSubscription = async (paymentReference: string): Promise<void> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/subscriptions/activate`, 
      {
        payment_reference: paymentReference,
        duration_months: 1,
        auto_renew: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update Redux state with new subscription info
    if (response.data) {
      store.dispatch(updateSubscription({
        planType: response.data.planType,
        startDate: response.data.startDate,
        expiryDate: response.data.expiryDate,
        autoRenew: response.data.autoRenew
      }));
    }
  } catch (error) {
    console.error('Failed to activate subscription:', error);
    throw error;
  }
};

/**
 * Cancels an active subscription with reason
 * @param reason Optional reason for cancellation
 * @returns Promise resolving when subscription is cancelled
 */
export const cancelSubscription = async (reason?: string): Promise<void> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const payload = reason ? { reason } : {};
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/subscriptions/cancel`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update Redux state with new subscription info
    if (response.data) {
      store.dispatch(updateSubscription({
        planType: response.data.planType,
        startDate: response.data.startDate,
        expiryDate: response.data.expiryDate,
        autoRenew: response.data.autoRenew,
        cancellationDate: response.data.cancellationDate,
        cancellationReason: response.data.cancellationReason,
        remainingDays: response.data.remainingDays
      }));
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
};

/**
 * Verifies a payment with Paystack (can be called after webhook notification)
 * @param reference Payment reference to verify
 * @returns Promise resolving to verification result
 */
export const verifyPayment = async (reference: string): Promise<boolean> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/subscriptions/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data?.verified === true;
  } catch (error) {
    console.error('Failed to verify payment:', error);
    return false;
  }
};

/**
 * Checks if user has premium subscription
 * @returns Promise resolving to premium status
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      return false;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/subscriptions/is-premium`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data === true;
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }
};

/**
 * Gets detailed subscription information
 * @returns Promise resolving to subscription details
 */
export const getSubscriptionDetails = async (): Promise<any> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/subscriptions/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to get subscription details:', error);
    throw error;
  }
};

/**
 * Get subscription payment history
 * @param page Page number (1-based)
 * @param pageSize Number of items per page
 * @returns Promise resolving to paginated subscription history
 */
export const getSubscriptionHistory = async (page: number = 1, pageSize: number = 10): Promise<any> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // Calculate skip based on page number (1-based) and page size
    const skip = (page - 1) * pageSize;
    
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/subscriptions/history?skip=${skip}&limit=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to get subscription history:', error);
    throw error;
  }
}; 