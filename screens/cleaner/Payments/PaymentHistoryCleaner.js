


import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';
import COLORS from '../../../constants/colors';
import { formatAmountWithSymbol } from '../../../utils/formatAmountWithSymbol';
import { minutesToDuration } from '../../../utils/minuteToDuration';
import { tSafe } from '../../../utils/tSafe'; // added import

const { width, height } = Dimensions.get('window');

const PaymentsHistoryCleaner = () => {
  const navigation = useNavigation();
  const { currentUserId, currentUser, geolocationData } = useContext(AuthContext);

  const currencySymbol = geolocationData?.currency?.symbol ?? "";

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    averagePayment: 0,
  });

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [slideAnim] = useState(new Animated.Value(height));

  const filters = useMemo(() => [
    { id: 'all', label: tSafe('all_payments', 'All Payments'), icon: 'cash-multiple' },
    { id: 'this_month', label: tSafe('this_month', 'This Month'), icon: 'calendar-month' },
    { id: 'last_month', label: tSafe('last_month', 'Last Month'), icon: 'calendar-arrow-left' },
    { id: 'approved', label: tSafe('approved', 'Approved'), icon: 'check-circle' },
    { id: 'pending', label: tSafe('pending', 'Pending'), icon: 'clock-outline' },
    { id: 'manual', label: tSafe('manual_approval', 'Manual Approval'), icon: 'hand-coin' },
    { id: 'auto', label: tSafe('auto_approval', 'Auto Approval'), icon: 'credit-card-check' },
  ], []);

  const sortOptions = useMemo(() => [
    { id: 'date', label: tSafe('date', 'Date'), icon: 'calendar' },
    { id: 'amount', label: tSafe('amount', 'Amount'), icon: 'currency-usd' },
    { id: 'client', label: tSafe('client', 'Client'), icon: 'account' },
  ], []);

  // Fetch all payments
  const fetchAllPayments = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      
      console.log("Fetching payments for user:", currentUserId);
      
      const response = await userService.getAllCleanerPayments(currentUserId);
      
      console.log("API Response:", response);
      
      let paymentData = [];
      
      if (response) {
        if (response.data && response.data.payments) {
          paymentData = response.data.payments;
          console.log("Found payments in response.data.payments:", paymentData.length);
        } else if (response.payments) {
          paymentData = response.payments;
          console.log("Found payments in response.payments:", paymentData.length);
        } else if (Array.isArray(response)) {
          paymentData = response;
          console.log("Response is directly an array:", paymentData.length);
        } else if (response.data && Array.isArray(response.data)) {
          paymentData = response.data;
          console.log("Found array in response.data:", paymentData.length);
        }
      }
      
      console.log("Final paymentData:", paymentData);
      
      if (!Array.isArray(paymentData)) {
        console.error("paymentData is not an array. Full response structure:");
        console.log(JSON.stringify(response, null, 2));
        paymentData = [];
      }
      
      calculateStats(paymentData);
      
      setPayments(paymentData);
      setFilteredPayments(paymentData);
      
    } catch (error) {
      console.error('Error fetching all payments:', error);
      setPayments([]);
      setFilteredPayments([]);
      setStats({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        averagePayment: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (paymentData) => {
    console.log("Calculating stats for:", paymentData);
    
    if (!paymentData || !Array.isArray(paymentData) || paymentData.length === 0) {
      console.log("No payment data to calculate stats");
      setStats({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        averagePayment: 0,
      });
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let total = 0;
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    paymentData.forEach((payment) => {
      const amount = payment.amount || 0;
      total += amount;

      if (payment.date) {
        try {
          const paymentDate = new Date(payment.date);
          const paymentMonth = paymentDate.getMonth();
          const paymentYear = paymentDate.getFullYear();

          if (paymentMonth === currentMonth && paymentYear === currentYear) {
            thisMonthTotal += amount;
          } else if (paymentMonth === lastMonth && paymentYear === lastMonthYear) {
            lastMonthTotal += amount;
          }
        } catch (dateError) {
          console.error("Error parsing date:", payment.date, dateError);
        }
      }
    });

    const statsData = {
      total: total,
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      averagePayment: paymentData.length > 0 ? total / paymentData.length : 0,
    };

    console.log("Calculated stats:", statsData);
    setStats(statsData);
  };

  // Apply filters and search
  useEffect(() => {
    if (!payments.length) {
      setFilteredPayments([]);
      return;
    }

    let result = [...payments];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(payment =>
        (payment.client?.toLowerCase() || '').includes(query) ||
        (payment.service?.toLowerCase() || '').includes(query) ||
        (payment.id?.toLowerCase() || '').includes(query)
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'this_month':
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        result = result.filter(payment => {
          const paymentDate = new Date(payment.date);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });
        break;
      case 'last_month':
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();
        result = result.filter(payment => {
          const paymentDate = new Date(payment.date);
          return (
            paymentDate.getMonth() === lastMonth &&
            paymentDate.getFullYear() === lastMonthYear
          );
        });
        break;
      case 'approved':
        result = result.filter(payment => payment.status === 'completed');
        break;
      case 'pending':
        result = result.filter(payment => payment.status === 'pending');
        break;
      case 'manual':
        result = result.filter(payment => payment.approval_type === 'manual');
        break;
      case 'auto':
        result = result.filter(payment => payment.approval_type === 'auto');
        break;
      default:
        break;
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'amount':
          valueA = a.amount || 0;
          valueB = b.amount || 0;
          break;
        case 'client':
          valueA = (a.client || '').toLowerCase();
          valueB = (b.client || '').toLowerCase();
          break;
        default:
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredPayments(result);
  }, [payments, searchQuery, selectedFilter, sortBy, sortOrder]);

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAllPayments();
    }, [currentUserId])
  );

  // Pull to refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAllPayments();
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

  const formatCurrency = (amount) => {
    return `${currencySymbol}${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return tSafe('na', 'N/A');
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status, approvalType) => {
    if (status === 'completed') {
      return approvalType === 'manual' ? 'hand-coin' : 'credit-card-check';
    } else if (status === 'pending') {
      return 'clock-outline';
    } else {
      return 'alert-circle';
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderPaymentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.paymentCard}
      onPress={() => openPaymentModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentCardHeader}>
        <View style={styles.paymentIconContainer}>
          <MaterialCommunityIcons 
            name={getStatusIcon(item.status, item.approval_type)} 
            size={24} 
            color={getStatusColor(item.status)} 
          />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentService}>{item.service || tSafe('cleaning_service', 'Cleaning Service')}</Text>
          <Text style={styles.paymentClient}>{item.client || tSafe('client', 'Client')}</Text>
          <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.paymentAmountContainer}>
          <Text style={styles.paymentAmount}>{formatAmountWithSymbol(item.amount, currencySymbol)}</Text>

          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {item.status === 'completed' ? tSafe('completed', 'Completed') :
               item.status === 'pending' ? tSafe('pending', 'Pending') :
               item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : tSafe('unknown', 'Unknown')}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentCardFooter}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#8E8E93" />
          <Text style={styles.footerText}>{item.duration || tSafe('na', 'N/A')}</Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons 
            name={item.approval_type === 'manual' ? 'hand-pointing-right' : 'robot'} 
            size={14} 
            color="#8E8E93" 
          />
          <Text style={styles.footerText}>
            {item.approval_type === 'manual' ? tSafe('manual', 'Manual') : tSafe('auto', 'Auto')}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="identifier" size={14} color="#8E8E93" />
          <Text style={styles.footerText}>
            {tSafe('id_prefix', 'ID:')} {item.id?.substring(0, 8) || tSafe('na', 'N/A')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{formatAmountWithSymbol(stats.total, currencySymbol)}</Text>
          <Text style={styles.statLabel}>{tSafe('total_earnings', 'Total Earnings')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="calendar-month" size={24} color="#34C759" />
          <Text style={styles.statValue}>{formatAmountWithSymbol(stats.thisMonth, currencySymbol)}</Text>
          <Text style={styles.statLabel}>{tSafe('this_month', 'This Month')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="trending-up" size={24} color="#FF9500" />
          <Text style={styles.statValue}>{formatAmountWithSymbol(stats.averagePayment, currencySymbol)}</Text>
          <Text style={styles.statLabel}>{tSafe('avg_payment', 'Avg Payment')}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder={tSafe('search_payments_placeholder', 'Search payments by client or service...')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>{tSafe('filter_payments', 'Filter Payments')}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <MaterialCommunityIcons 
                name={filter.icon} 
                size={16} 
                color={selectedFilter === filter.id ? '#FFFFFF' : '#007AFF'} 
              />
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.id && styles.filterButtonTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sorting */}
      <View style={styles.sortingSection}>
        <View style={styles.sortingHeader}>
          <Text style={styles.sectionTitle}>
            {tSafe('payments_found', '{count} Payments Found', { count: filteredPayments.length })}
          </Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={toggleSortOrder}
          >
            <MaterialCommunityIcons 
              name={sortOrder === 'asc' ? 'sort-ascending' : 'sort-descending'} 
              size={20} 
              color="#007AFF" 
            />
            <Text style={styles.sortButtonText}>
              {tSafe('sort_by', 'Sort by {order}', { order: sortOrder === 'asc' ? tSafe('ascending', 'Ascending') : tSafe('descending', 'Descending') })}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sortOptionsScroll}
          contentContainerStyle={styles.sortOptionsContent}
        >
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOptionButton,
                sortBy === option.id && styles.sortOptionButtonActive,
              ]}
              onPress={() => setSortBy(option.id)}
            >
              <MaterialCommunityIcons 
                name={option.icon} 
                size={16} 
                color={sortBy === option.id ? '#FFFFFF' : '#007AFF'} 
              />
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="cash-multiple" size={64} color="#C7C7CC" />
      <Text style={styles.emptyStateTitle}>{tSafe('no_payments_found', 'No Payments Found')}</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedFilter !== 'all' 
          ? tSafe('try_changing_filters', 'Try changing your search or filter criteria')
          : tSafe('complete_jobs_to_see_history', 'Complete jobs to see your payment history here')}
      </Text>
      {(searchQuery || selectedFilter !== 'all') && (
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedFilter('all');
          }}
        >
          <Text style={styles.resetButtonText}>{tSafe('reset_filters', 'Reset Filters')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{tSafe('loading_payment_history', 'Loading payment history...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tSafe('payment_history', 'Payment History')}</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => {
            // Implement export functionality
            alert(tSafe('export_feature_coming_soon', 'Export feature coming soon!'));
          }}
        >
          <MaterialCommunityIcons name="export" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={<View style={styles.footerSpacing} />}
      />

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
                        name={getStatusIcon(selectedPayment.status, selectedPayment.approval_type)} 
                        size={32} 
                        color={getStatusColor(selectedPayment.status)} 
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
                      <MaterialCommunityIcons name="check-circle" size={20} color={getStatusColor(selectedPayment.status)} />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('status', 'Status')}</Text>
                        <Text style={[styles.detailValue, { color: getStatusColor(selectedPayment.status) }]}>
                          {selectedPayment.status === 'completed' ? tSafe('completed', 'Completed') :
                           selectedPayment.status === 'pending' ? tSafe('pending', 'Pending') :
                           selectedPayment.status?.charAt(0).toUpperCase() + selectedPayment.status?.slice(1) || tSafe('unknown', 'Unknown')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="home" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('property', 'Property')}</Text>
                        <Text style={styles.detailValue}>{selectedPayment.property_name || tSafe('unknown_property', 'Unknown Property')}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="map-marker" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('address', 'Address')}</Text>
                        <Text style={styles.detailValueSmall}>{selectedPayment.address || tSafe('address_not_available', 'Address not available')}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Information */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionLabel}>{tSafe('payment_information', 'Payment Information')}</Text>
                    
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="identifier" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('payment_id', 'Payment ID')}</Text>
                        <Text style={styles.detailValueSmall}>
                          {selectedPayment.id || tSafe('na', 'N/A')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="credit-card" size={20} color="#8E8E93" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{tSafe('approval_type', 'Approval Type')}</Text>
                        <Text style={styles.detailValue}>
                          {selectedPayment.approval_type === 'manual' ? tSafe('manual_approval', 'Manual Approval') : tSafe('automatic', 'Automatic')}
                        </Text>
                      </View>
                    </View>

                    {selectedPayment.approved_by && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="account-check" size={20} color="#8E8E93" />
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>{tSafe('approved_by', 'Approved By')}</Text>
                          <Text style={styles.detailValue}>
                            {selectedPayment.approved_by || tSafe('system', 'System')}
                          </Text>
                        </View>
                      </View>
                    )}

                    {selectedPayment.scheduleId && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar-check" size={20} color="#8E8E93" />
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>{tSafe('schedule_id', 'Schedule ID')}</Text>
                          <Text style={styles.detailValueSmall}>
                            {selectedPayment.scheduleId || tSafe('na', 'N/A')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.primaryAction]}
                      onPress={() => {
                        // Handle receipt download or view
                        closePaymentModal();
                        // Add your receipt logic here
                        alert(tSafe('downloading_receipt', 'Downloading receipt...'));
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  exportButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
    padding: 0,
  },
  filtersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  filtersScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  sortingSection: {
    marginBottom: 20,
  },
  sortingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  sortOptionsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  sortOptionsContent: {
    paddingRight: 16,
  },
  sortOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sortOptionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
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
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 20,
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
    backgroundColor: '#F8F9FA',
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
  modalActions: {
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  primaryAction: {
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

export default PaymentsHistoryCleaner;