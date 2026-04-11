import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import COLORS from '../../../constants/colors';
import ROUTES from '../../../constants/routes';
import { formatAmountWithSymbol } from '../../../utils/formatAmountWithSymbol';
import { minutesToDuration } from '../../../utils/minuteToDuration';
import { tSafe } from '../../../utils/tSafe';

const { width, height } = Dimensions.get('window');

const Earnings = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId, notificationId } = route.params || {};
  const { currentUserId, currentUser, geolocationData } = useContext(AuthContext);
  const currencySymbol = geolocationData?.currency?.symbol ?? "";

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [slideAnim] = useState(new Animated.Value(height));

  // Define periods with translation keys
  const periods = useMemo(() => [
    { id: 'week', label: tSafe('this_week', 'This Week') },
    { id: 'month', label: tSafe('this_month', 'This Month') },
    { id: 'quarter', label: tSafe('this_quarter', 'This Quarter') },
    { id: 'year', label: tSafe('this_year', 'This Year') },
  ], []);

  // Fetch earnings data
  const fetchEarningsData = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      
      // Call the userService to get cleaner earnings
      const response = await userService.getCleanerEarnings(currentUserId);
      
      console.log("Earnings API Response:", response);
      
      if (response && response.data) {
        // If your service returns the data in response.data
        setEarningsData(response.data);
      } else if (response) {
        // If the service returns the data directly
        setEarningsData(response);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      // Fallback to empty data structure
      setEarningsData(getFallbackData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when component mounts or currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      fetchEarningsData();
    }
  }, [currentUserId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        fetchEarningsData();
      }
    }, [currentUserId])
  );

  // Pull to refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEarningsData();
  }, []);

  // Open payment modal with animation
  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close payment modal with animation
  const closePaymentModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedPayment(null);
    });
  };

  // Fallback data
  const getFallbackData = () => {
    const cleanerName = currentUser 
      ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim()
      : tSafe('cleaner', 'Cleaner');
    
    return {
      totalEarnings: 0,
      completedJobs: 0,
      averageRating: 0,
      averageEarningsPerJob: 0,
      monthlyGrowth: 0,
      upcomingPayout: 0,
      payoutDate: new Date().toISOString().split('T')[0],
      earningsBreakdown: {
        week: 0,
        month: 0,
        quarter: 0,
        year: 0,
      },
      recentPayments: [],
      performance: {
        jobsCompleted: 0,
        repeatClients: 0,
        cancellationRate: 0,
        responseTime: '0 min',
        acceptanceRate: 0,
      },
      cleanerInfo: {
        name: cleanerName,
        avatar: currentUser?.avatar || '',
        badges: currentUser?.badges || [],
        rankingScore: currentUser?.ranking_score || 0,
      },
    };
  };

  const getPeriodEarnings = () => {
    return earningsData?.earningsBreakdown[selectedPeriod] || 0;
  };

  const formatCurrency = (amount) => {
    return `${currencySymbol}${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return tSafe('date_unknown', 'Date unknown');
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return tSafe('invalid_date', 'Invalid date');
    }
  };

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return tSafe('date_unknown', 'Date unknown');
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return tSafe('invalid_date', 'Invalid date');
    }
  };

  const renderBadges = () => {
    const badges = earningsData?.cleanerInfo?.badges || [];
    if (!badges.length) return null;

    return (
      <View style={styles.badgesContainer}>
        {badges.slice(0, 3).map((badge, index) => (
          <View key={index} style={styles.badge}>
            <MaterialCommunityIcons name="trophy" size={12} color="#FFD700" />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
        {badges.length > 3 && (
          <Text style={styles.moreBadgesText}>
            {tSafe('more_badges', '+{count} more', { count: badges.length - 3 })}
          </Text>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{tSafe('loading_earnings', 'Loading earnings data...')}</Text>
      </View>
    );
  }

  // Get cleaner info for display
  const cleanerInfo = earningsData?.cleanerInfo || {
    name: currentUser 
      ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim()
      : tSafe('cleaner', 'Cleaner'),
    avatar: currentUser?.avatar || '',
    rankingScore: currentUser?.ranking_score || 0,
  };

  // Helper to get current period label
  const currentPeriodLabel = periods.find(p => p.id === selectedPeriod)?.label || '';

  return (
    <View style={styles.container}>
      {/* Header with cleaner info */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          {cleanerInfo?.avatar ? (
            <Image source={{ uri: cleanerInfo.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
            </View>
          )}
          <View>
            <Text style={styles.userName}>{cleanerInfo?.name || tSafe('cleaner', 'Cleaner')}</Text>
            <Text style={styles.userSubtitle}>
              {tSafe('ranking_label', 'Ranking: {score}', { score: (cleanerInfo?.rankingScore || 0).toFixed(1) })}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.id && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Earnings Summary Card */}
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>
              {tSafe('total_earnings_label', 'Total Earnings ({period})', { period: currentPeriodLabel })}
            </Text>
            <Text style={styles.earningsAmount}>
              {formatCurrency(getPeriodEarnings())}
            </Text>
            
            <View style={styles.earningsStats}>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#34C759" />
                <Text style={styles.statText}>
                  {tSafe('jobs_count', '{count} jobs', { count: earningsData?.completedJobs || 0 })}
                </Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="star" size={16} color="#FFCC00" />
                <Text style={styles.statText}>
                  {tSafe('rating_label', '{rating} rating', { rating: (earningsData?.averageRating || 0).toFixed(1) })}
                </Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="trending-up" size={16} color="#34C759" />
                <Text style={styles.statText}>
                  {earningsData?.averageEarningsPerJob ? 
                    tSafe('per_job', '{amount}/job', { amount: formatCurrency(earningsData.averageEarningsPerJob) }) : 
                    tSafe('zero_per_job', '$0.00/job')}
                </Text>
              </View>
            </View>

            {/* Badges display */}
            {renderBadges()}
          </View>

          {/* Upcoming Payout Card */}
          <View style={styles.payoutCard}>
            <View style={styles.payoutHeader}>
              <MaterialCommunityIcons name="cash-fast" size={24} color="#007AFF" />
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutLabel}>{tSafe('next_payout', 'Next Payout')}</Text>
                <Text style={styles.payoutAmount}>
                  {formatCurrency(earningsData?.upcomingPayout || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.payoutDetails}>
              <Text style={styles.payoutDate}>
                {tSafe('processing_on', 'Processing on {date}', { date: formatDate(earningsData?.payoutDate) })}
              </Text>
              {earningsData?.monthlyGrowth > 0 ? (
                <Text style={styles.growthText}>
                  <MaterialCommunityIcons name="trending-up" size={14} color="#34C759" />
                  {tSafe('growth_positive', '+{percent}% this month', { percent: (earningsData.monthlyGrowth || 0).toFixed(1) })}
                </Text>
              ) : earningsData?.monthlyGrowth < 0 ? (
                <Text style={styles.growthTextNegative}>
                  <MaterialCommunityIcons name="trending-down" size={14} color="#FF3B30" />
                  {tSafe('growth_negative', '{percent}% this month', { percent: (earningsData.monthlyGrowth || 0).toFixed(1) })}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Performance Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tSafe('performance_metrics', 'Performance Metrics')}</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {earningsData?.performance?.jobsCompleted || 0}
                </Text>
                <Text style={styles.metricLabel}>{tSafe('jobs_completed', 'Jobs Completed')}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {earningsData?.performance?.repeatClients || 0}
                </Text>
                <Text style={styles.metricLabel}>{tSafe('repeat_clients', 'Repeat Clients')}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {((earningsData?.performance?.cancellationRate || 0) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.metricLabel}>{tSafe('cancellation_rate', 'Cancellation Rate')}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {earningsData?.performance?.responseTime || '0 min'}
                </Text>
                <Text style={styles.metricLabel}>{tSafe('avg_response', 'Avg. Response')}</Text>
              </View>
              <View style={[styles.metricCard, styles.fullWidthMetric]}>
                <Text style={styles.metricValue}>
                  {((earningsData?.performance?.acceptanceRate || 0) * 100).toFixed(0)}%
                </Text>
                <Text style={styles.metricLabel}>{tSafe('job_acceptance_rate', 'Job Acceptance Rate')}</Text>
              </View>
            </View>
          </View>

          {/* Recent Payments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{tSafe('recent_payments', 'Recent Payments')}</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate(ROUTES.cleaner_payment_history, {item:"item"})}
              >
                <Text style={styles.seeAllText}>{tSafe('see_all', 'See All')}</Text>
              </TouchableOpacity>
            </View>

            {earningsData?.recentPayments && earningsData.recentPayments.length > 0 ? (
              earningsData.recentPayments?.slice(0, 2)?.map((payment) => (
                <TouchableOpacity 
                  key={payment.id} 
                  style={styles.paymentItem}
                  onPress={() => openPaymentModal(payment)}
                  activeOpacity={0.7}
                >
                  <View style={styles.paymentIcon}>
                    <MaterialCommunityIcons 
                      name={payment.approval_type === 'manual' ? "hand-coin" : "credit-card-check"} 
                      size={20} 
                      color="#34C759" 
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentService}>{payment.service || tSafe('cleaning_service', 'Cleaning Service')}</Text>
                    <Text style={styles.paymentClient}>{payment.client || tSafe('client', 'Client')}</Text>
                    <Text style={styles.paymentDate}>
                      {payment.date ? formatDate(payment.date) : tSafe('date_unknown', 'Date unknown')} • {payment.duration || tSafe('duration_na', 'N/A')}
                    </Text>
                  </View>
                  <View style={styles.paymentAmountContainer}>
                    <Text style={styles.paymentAmount}>
                      {formatAmountWithSymbol(payment.amount, currencySymbol)}
                    </Text>
                    <MaterialCommunityIcons 
                      name="chevron-right" 
                      size={20} 
                      color="#8E8E93" 
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="cash-remove" size={48} color="#C7C7CC" />
                <Text style={styles.emptyStateText}>{tSafe('no_recent_payments', 'No recent payments')}</Text>
                <Text style={styles.emptyStateSubtext}>
                  {tSafe('complete_jobs_to_see_earnings', 'Complete jobs to see your earnings here')}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EarningsReport')}
            >
              <MaterialCommunityIcons name="chart-box" size={24} color="#007AFF" />
              <Text style={styles.actionText}>{tSafe('detailed_reports', 'Detailed Reports')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PayoutSettings')}
            >
              <MaterialCommunityIcons name="bank-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>{tSafe('payout_settings', 'Payout Settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('TaxDocuments')}
            >
              <MaterialCommunityIcons name="file-document" size={24} color="#007AFF" />
              <Text style={styles.actionText}>{tSafe('tax_documents', 'Tax Documents')}</Text>
            </TouchableOpacity>
          </View>

          {/* Total Lifetime Earnings */}
          <View style={styles.lifetimeEarnings}>
            <View style={styles.lifetimeHeader}>
              <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
              <Text style={styles.lifetimeTitle}>{tSafe('lifetime_earnings', 'Lifetime Earnings')}</Text>
            </View>
            <Text style={styles.lifetimeAmount}>
              {formatCurrency(earningsData?.totalEarnings || 0)}
            </Text>
            <Text style={styles.lifetimeSubtitle}>
              {tSafe('total_from_completed_jobs', 'Total from all completed jobs')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePaymentModal}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closePaymentModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Modal Content */}
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {selectedPayment && (
                <>
                  {/* Payment Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalPaymentIcon}>
                      <MaterialCommunityIcons 
                        name={selectedPayment.approval_type === 'manual' ? "hand-coin" : "credit-card-check"} 
                        size={32} 
                        color="#34C759" 
                      />
                    </View>
                    <Text style={styles.modalPaymentAmount}>
                      {formatCurrency(selectedPayment.amount)}
                    </Text>
                    <Text style={styles.modalPaymentStatus}>
                      {selectedPayment.approval_type === 'manual' 
                        ? tSafe('manually_approved', 'Manually Approved')
                        : tSafe('auto_approved', 'Auto Approved')}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Payment Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionLabel}>{tSafe('payment_details', 'Payment Details')}</Text>
                    
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="briefcase" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('service_type', 'Service Type')}</Text>
                        <Text style={styles.detailValue}>{selectedPayment.service || tSafe('standard_cleaning', 'Standard Cleaning')}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="account" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('client', 'Client')}</Text>
                        <Text style={styles.detailValue}>{selectedPayment.client || tSafe('anonymous', 'Anonymous')}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('duration', 'Duration')}</Text>
                        <Text style={styles.detailValue}>{selectedPayment.duration || tSafe('two_hours', '2 hours')}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('date_time', 'Date & Time')}</Text>
                        <Text style={styles.detailValue}>
                          {formatDateTime(selectedPayment.date) || tSafe('date_not_available', 'Date not available')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#34C759" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('status', 'Status')}</Text>
                        <Text style={[styles.detailValue, styles.statusCompleted]}>
                          {tSafe('completed', 'Completed')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment ID Section */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionLabel}>{tSafe('payment_information', 'Payment Information')}</Text>
                    
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="identifier" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('payment_id', 'Payment ID')}</Text>
                        <Text style={styles.detailValueSmall}>
                          {selectedPayment.id || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="credit-card" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('approval_type', 'Approval Type')}</Text>
                        <Text style={styles.detailValue}>
                          {selectedPayment.approval_type === 'manual' 
                            ? tSafe('manual_approval', 'Manual Approval')
                            : tSafe('automatic', 'Automatic')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Notes Section (if available) */}
                  {selectedPayment.notes && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.sectionLabel}>{tSafe('notes', 'Notes')}</Text>
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>{selectedPayment.notes}</Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.primaryAction]}
                      onPress={() => {
                        // Handle receipt download or view
                        closePaymentModal();
                        // Add your receipt logic here
                      }}
                    >
                      <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryActionText}>{tSafe('download_receipt', 'Download Receipt')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, styles.secondaryAction]}
                      onPress={closePaymentModal}
                    >
                      <Text style={styles.secondaryActionText}>{tSafe('close', 'Close')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  backButton: {
    padding: 8,
  },
  helpButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.deepBlue,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  earningsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  moreBadgesText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  payoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  payoutInfo: {
    marginLeft: 12,
    flex: 1,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  payoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  growthText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  growthTextNegative: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fullWidthMetric: {
    minWidth: '100%',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  paymentClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  paymentAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  lifetimeEarnings: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lifetimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lifetimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  lifetimeAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  lifetimeSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  modalPaymentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPaymentAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalPaymentStatus: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    backgroundColor: '#E7F9E7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  detailsSection: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  detailValueSmall: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  statusCompleted: {
    color: '#34C759',
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    marginTop: 32,
    gap: 12,
  },
  primaryAction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderWidth: 0,
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    paddingVertical: 16,
  },
  secondaryActionText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Earnings;