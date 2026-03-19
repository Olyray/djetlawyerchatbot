import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { store } from '../redux/store';

export interface MonthlyUsage {
  month: string;
  avg_tokens: number;
  std_dev_tokens: number;
}

export interface UserMonthlyUsage {
  month: string;
  total_tokens: number;
}

export interface TokenUsageRecord {
  id: string;
  user_id: string;
  tokens_used: number;
  timestamp: string;
}

export interface UserStats {
  total_users: number;
  active_premium_subscribers: number;
  total_premium_users: number;
  auto_renew_enabled: number;
  recently_expired: number;
  cancelled_but_active: number;
  free_users: number;
}

export interface UserSummary {
  id: string;
  email: string;
  subscription_plan: string;
  subscription_expiry_date: string | null;
  subscription_auto_renew: boolean;
  subscription_start_date: string | null;
}

export interface UserDetail extends UserSummary {
  admin_user: boolean;
  is_active: boolean;
}

export interface UserUsageStats {
  user_id: string;
  email: string;
  monthly_usage: UserMonthlyUsage[];
  recent_usage: TokenUsageRecord[];
}

/**
 * Fetch platform-wide monthly average usage statistics
 */
export const getMonthlyAverageUsage = async (): Promise<MonthlyUsage[]> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/dashboard/monthly-average`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching monthly average usage:', error);
    throw error;
  }
};

/**
 * Fetch user monthly usage statistics
 */
export const getUserMonthlyUsage = async (userId?: string): Promise<UserMonthlyUsage[]> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = userId
      ? `${API_BASE_URL}/api/v1/dashboard/user-monthly-usage?user_id=${userId}`
      : `${API_BASE_URL}/api/v1/dashboard/user-monthly-usage`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user monthly usage:', error);
    throw error;
  }
};

/**
 * Fetch recent token usage records
 */
export const getRecentTokenUsage = async (userId?: string): Promise<TokenUsageRecord[]> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = userId
      ? `${API_BASE_URL}/api/v1/dashboard/recent-token-usage?user_id=${userId}`
      : `${API_BASE_URL}/api/v1/dashboard/recent-token-usage`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching recent token usage:', error);
    throw error;
  }
};

/**
 * Fetch comprehensive user statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/dashboard/user-stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Fetch list of users by category
 */
export const getUsersByCategory = async (
  category?: string,
  limit: number = 100,
  offset: number = 0
): Promise<UserSummary[]> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (category) {
      params.append('category', category);
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/dashboard/users?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch detailed information for a specific user
 */
export const getUserDetail = async (userId: string): Promise<UserDetail> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/dashboard/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching user detail:', error);
    throw error;
  }
};

/**
 * Fetch usage statistics for a specific user
 */
export const getUserUsageStats = async (userId: string): Promise<UserUsageStats> => {
  try {
    const token = store.getState().auth.token;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/dashboard/users/${userId}/usage`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching user usage stats:', error);
    throw error;
  }
};
