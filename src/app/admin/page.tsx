'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import {
  getMonthlyAverageUsage,
  getUserStats,
  getUsersByCategory,
  getUserUsageStats,
  MonthlyUsage,
  UserStats,
  UserSummary,
  UserUsageStats,
} from '@/services/adminService';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal/drawer states
  const [showUserList, setShowUserList] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userListCategory, setUserListCategory] = useState<string>('');
  const [userListTitle, setUserListTitle] = useState<string>('');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState<UserUsageStats | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (!token || !user?.admin_user) {
      router.push('/chatbot');
      return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [statsData, usageData] = await Promise.all([
          getUserStats(),
          getMonthlyAverageUsage(),
        ]);
        
        setUserStats(statsData);
        setMonthlyUsage(usageData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [token, user, router]);

  const handleTileClick = async (category: string, title: string) => {
    setUserListCategory(category);
    setUserListTitle(title);
    setShowUserList(true);
    setLoadingUsers(true);
    
    try {
      const fetchedUsers = await getUsersByCategory(category === 'all' ? undefined : category);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    setLoadingUserDetail(true);
    setShowUserDetail(true);
    
    try {
      const userStats = await getUserUsageStats(userId);
      setSelectedUserStats(userStats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setSelectedUserStats(null);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const closeUserList = () => {
    setShowUserList(false);
    setUsers([]);
  };

  const closeUserDetail = () => {
    setShowUserDetail(false);
    setSelectedUserStats(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const subscriptionRate = userStats
    ? ((userStats.active_premium_subscribers / userStats.total_users) * 100).toFixed(1)
    : '0';

  const renewalRate = userStats && userStats.active_premium_subscribers > 0
    ? ((userStats.auto_renew_enabled / userStats.active_premium_subscribers) * 100).toFixed(1)
    : '0';

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Administration</h1>
          <p className={styles.subtitle}>Platform overview and analytics</p>
        </div>
      </div>

      {/* User Statistics Grid */}
      <section className={styles.statsGrid}>
        <div 
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => handleTileClick('all', 'All Users')}
        >
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statValue}>{userStats?.total_users.toLocaleString() || 0}</div>
          <div className={styles.statMeta}>Platform registrations</div>
          <div className={styles.clickHint}>Click to view list →</div>
        </div>

        <div 
          className={`${styles.statCard} ${styles.statCardAccent} ${styles.clickable}`}
          onClick={() => handleTileClick('active_subscribers', 'Active Subscribers')}
        >
          <div className={styles.statLabel}>Active Subscribers</div>
          <div className={styles.statValue}>
            {userStats?.active_premium_subscribers.toLocaleString() || 0}
          </div>
          <div className={styles.statMeta}>
            {subscriptionRate}% conversion rate
          </div>
          <div className={styles.clickHint}>Click to view list →</div>
        </div>

        <div 
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => handleTileClick('auto_renew', 'Auto-Renew Enabled')}
        >
          <div className={styles.statLabel}>Auto-Renew Enabled</div>
          <div className={styles.statValue}>
            {userStats?.auto_renew_enabled.toLocaleString() || 0}
          </div>
          <div className={styles.statMeta}>
            {renewalRate}% of active subscribers
          </div>
          <div className={styles.clickHint}>Click to view list →</div>
        </div>

        <div 
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => handleTileClick('free', 'Free Tier Users')}
        >
          <div className={styles.statLabel}>Free Tier Users</div>
          <div className={styles.statValue}>
            {userStats?.free_users.toLocaleString() || 0}
          </div>
          <div className={styles.statMeta}>Non-subscribers</div>
          <div className={styles.clickHint}>Click to view list →</div>
        </div>
      </section>

      {/* Subscription Details */}
      <section className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>Subscription Insights</h2>
        
        <div className={styles.detailsGrid}>
          <div 
            className={`${styles.detailCard} ${styles.clickable}`}
            onClick={() => handleTileClick('recently_expired', 'Recently Expired')}
          >
            <div className={styles.detailIcon}>⚠️</div>
            <div className={styles.detailContent}>
              <div className={styles.detailValue}>
                {userStats?.recently_expired.toLocaleString() || 0}
              </div>
              <div className={styles.detailLabel}>Recently Expired</div>
              <div className={styles.detailSubtext}>Last 7 days</div>
            </div>
            <div className={styles.clickHint}>View →</div>
          </div>

          <div 
            className={`${styles.detailCard} ${styles.clickable}`}
            onClick={() => handleTileClick('cancelled_active', 'Pending Cancellation')}
          >
            <div className={styles.detailIcon}>🔄</div>
            <div className={styles.detailContent}>
              <div className={styles.detailValue}>
                {userStats?.cancelled_but_active.toLocaleString() || 0}
              </div>
              <div className={styles.detailLabel}>Pending Cancellation</div>
              <div className={styles.detailSubtext}>Active until expiry</div>
            </div>
            <div className={styles.clickHint}>View →</div>
          </div>

          <div 
            className={`${styles.detailCard} ${styles.clickable}`}
            onClick={() => handleTileClick('all_premium', 'All-Time Premium')}
          >
            <div className={styles.detailIcon}>📊</div>
            <div className={styles.detailContent}>
              <div className={styles.detailValue}>
                {userStats?.total_premium_users.toLocaleString() || 0}
              </div>
              <div className={styles.detailLabel}>All-Time Premium</div>
              <div className={styles.detailSubtext}>Including expired</div>
            </div>
            <div className={styles.clickHint}>View →</div>
          </div>
        </div>
      </section>

      {/* Monthly Usage Statistics */}
      <section className={styles.usageSection}>
        <h2 className={styles.sectionTitle}>Platform Token Usage</h2>
        
        <div className={styles.usageTable}>
          <div className={styles.tableHeader}>
            <div>Month</div>
            <div>Average Tokens</div>
            <div>Std Deviation</div>
          </div>
          
          {monthlyUsage.length > 0 ? (
            monthlyUsage.map((record, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  {new Date(record.month).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
                <div className={styles.tableCell}>
                  {Math.round(record.avg_tokens).toLocaleString()}
                </div>
                <div className={styles.tableCell}>
                  {Math.round(record.std_dev_tokens).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No usage data available</p>
            </div>
          )}
        </div>
      </section>

      {/* User List Modal */}
      {showUserList && (
        <div className={styles.modalOverlay} onClick={closeUserList}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{userListTitle}</h2>
              <button className={styles.closeButton} onClick={closeUserList}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {loadingUsers ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading users...</p>
                </div>
              ) : users.length > 0 ? (
                <div className={styles.userList}>
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className={styles.userListItem}
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className={styles.userInfo}>
                        <div className={styles.userEmail}>{user.email}</div>
                        <div className={styles.userPlan}>
                          {user.subscription_plan.toUpperCase()}
                          {user.subscription_auto_renew && ' • Auto-Renew'}
                        </div>
                      </div>
                      <div className={styles.userMeta}>
                        {user.subscription_expiry_date && (
                          <span>Expires: {new Date(user.subscription_expiry_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No users found in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && (
        <div className={styles.modalOverlay} onClick={closeUserDetail}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>User Statistics</h2>
              <button className={styles.closeButton} onClick={closeUserDetail}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {loadingUserDetail ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading user statistics...</p>
                </div>
              ) : selectedUserStats ? (
                <div className={styles.userDetailView}>
                  <div className={styles.userDetailHeader}>
                    <h3>{selectedUserStats.email}</h3>
                    <p>User ID: {selectedUserStats.user_id}</p>
                  </div>

                  <div className={styles.usageSection}>
                    <h4>Monthly Usage</h4>
                    {selectedUserStats.monthly_usage.length > 0 ? (
                      <div className={styles.usageTable}>
                        <div className={styles.tableHeader}>
                          <div>Month</div>
                          <div>Total Tokens</div>
                        </div>
                        {selectedUserStats.monthly_usage.map((record, index) => (
                          <div key={index} className={styles.tableRow}>
                            <div className={styles.tableCell}>
                              {new Date(record.month).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                              })}
                            </div>
                            <div className={styles.tableCell}>
                              {record.total_tokens.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No monthly usage data available</p>
                    )}
                  </div>

                  <div className={styles.usageSection}>
                    <h4>Recent Token Usage</h4>
                    {selectedUserStats.recent_usage.length > 0 ? (
                      <div className={styles.usageTable}>
                        <div className={styles.tableHeader}>
                          <div>Timestamp</div>
                          <div>Tokens Used</div>
                        </div>
                        {selectedUserStats.recent_usage.map((record) => (
                          <div key={record.id} className={styles.tableRow}>
                            <div className={styles.tableCell}>
                              {new Date(record.timestamp).toLocaleString()}
                            </div>
                            <div className={styles.tableCell}>
                              {record.tokens_used.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No recent usage data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.errorState}>
                  <p>Failed to load user statistics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
