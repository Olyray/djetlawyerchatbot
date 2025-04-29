export interface User {
  email: string;
  password: string;
}

export type SubscriptionPlanType = 'free' | 'premium';

export interface SubscriptionDetails {
  planType: SubscriptionPlanType;
  startDate: string | null;
  expiryDate: string | null;
  autoRenew: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // New subscription fields
  isPremium: boolean;
  subscriptionDetails: SubscriptionDetails | null;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  subscription?: SubscriptionDetails;
}