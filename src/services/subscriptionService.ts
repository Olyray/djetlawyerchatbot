import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { store } from '../redux/store';
import { updateSubscription } from '../redux/slices/authSlice';

/**
 * Opens the subscription payment portal
 * @param email User's email address
 * @returns Promise that resolves when payment is complete
 */
export const initiateSubscription = async (email: string): Promise<boolean> => {
  try {
    // This would be replaced with actual Paystack integration
    // The code below is a placeholder for the Paystack Pop interface
    
    // For a real implementation, you'd use something like:
    // const handler = PaystackPop.setup({
    //   key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    //   email,
    //   amount: 100000, // ₦1,000.00 in kobo
    //   currency: 'NGN',
    //   ref: `premium_sub_${Date.now()}`,
    //   ...
    // });
    
    // For demonstration purposes, just return true to simulate successful payment
    const paymentReference = `demo_payment_${Date.now()}`;
    
    // After successful payment, register the subscription on the backend
    await activateSubscription(paymentReference);
    
    return true;
  } catch (error) {
    console.error('Payment failed:', error);
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