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
  setup: (config: PaystackConfig) => {
    openIframe: () => void;
  };
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  callback: (response: PaystackPopupResponse) => void;
  onClose: () => void;
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
    // Load Paystack script if not already loaded
    await loadPaystackScript();
    
    return new Promise((resolve) => {
      // Get Paystack public key from environment variables
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      
      if (!paystackKey) {
        console.error('Paystack public key not found in environment variables');
        resolve(false);
        return;
      }
      
      // Create payment reference
      const paymentReference = `premium_sub_${Date.now()}`;
      
      // Initialize Paystack popup
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email,
        amount: 100000, // ₦1,000.00 in kobo
        currency: 'NGN',
        ref: paymentReference,
        metadata: {
          custom_fields: [
            {
              display_name: "Subscription Type",
              variable_name: "subscription_type",
              value: "premium"
            }
          ]
        },
        callback: function(response) {
          // Handle successful payment
          if (response.status === 'success') {
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
 * Cancels current subscription
 */
export const cancelSubscription = async (): Promise<void> => {
  try {
    const token = store.getState().auth.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/subscriptions/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update Redux state with updated subscription info
    if (response.data) {
      store.dispatch(updateSubscription({
        planType: response.data.planType,
        startDate: response.data.startDate,
        expiryDate: response.data.expiryDate,
        autoRenew: response.data.autoRenew
      }));
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
}; 