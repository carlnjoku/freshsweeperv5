import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Button,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useCleanerSelection } from '../../context/CleanerSelectionContext';
import moment from 'moment';



// Components
import NewlyPublishedSchedule from '../../components/host/NewlyPublishedSchedule';
import EmptyApartmentPlaceholder from '../../components/shared/EmptyApartmentPlaceholder';
import PendingApprovalListItem from '../../components/host/PendingApprovalListItem';
import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
import PropertyCardList from '../../components/host/PropertyCardList';
import { useBookingContext } from '../../context/BookingContext';
import NewBooking from './NewBooking';
import EditSchedule from './EditSchedule';

const Dashboard = () => {
// const { selectedCleaners } = useCleanerSelection();

 
  const scrollRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { currentUser, currentUserId, geolocationData, notificationUnreadCount } = useContext(AuthContext);
  const {handleEdit, modalVisible, modalEVisible, openModal, setOpenModal,  handleCreateSchedule }  = useBookingContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [pendingPayment, setFilteredPendingPayment] = useState([]);
  const [pendingCompletionApproval, setFilteredPendingCompletionApprovalSchedules] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Selected filter for upcoming schedules
  const [selectedFilter, setSelectedFilter] = useState('upcoming');

  const filters = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];



  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties(), fetchClientSecret()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Poll for new requests
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchClientSecret = async () => {
    try {
      const response = await userService.getClientSecret();
      const res = response.data;
      setClientSecret(res.client_secret);
    } catch (error) {
      console.error('Error fetching client secret:', error);
    }
  };

  const fetchRequests = async () => {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
      const response = await userService.getHostCleaningRequest(currentUserId, currentTime);
      const res = response.data;
      
      setPendingCount(res.length);
      
      const pendingRequests = res.filter(
        (req) => req.status === "pending_acceptance"
      );
      
      const pendingPaymentRequests = res.filter(
        (req) => req.status === "pending_payment"
      );

      setCleaningRequests(res);
      setFilteredPendingPayment(pendingPaymentRequests);

    } catch (e) {
      console.log(e);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await userService.getApartment(currentUserId);
      const data = response.data;
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  // const fetchSchedules = async () => {
  //   try {
  //     const response = await userService.getSchedulesByHostId(currentUserId);
  //     const res = response.data;
      
  //     setSchedules(res);

  //     const pendingCompletionApprovalSchedules = res
  //       .filter(
  //         (schedule) =>
  //           (schedule.status === "completed" || schedule.status === "in_progress") &&
  //           Array.isArray(schedule.assignedTo) &&
  //           schedule.assignedTo.some(
  //             (cleaner) => cleaner.status === "pending_completion_approval"
  //           )
  //       )
  //       .map((schedule) => ({
  //         ...schedule,
  //         assignedTo: schedule.assignedTo.filter(
  //           (cleaner) => cleaner.status === "pending_completion_approval"
  //         ),
  //       }));

  //     // const upcomingSchedulesFiltered = res.filter(
  //     //   (schedule) => schedule.status === "pending_payment"
  //     // );
  //     setFilteredPendingCompletionApprovalSchedules(pendingCompletionApprovalSchedules);
  //     // setUpcomingSchedules(upcomingSchedulesFiltered);


  //   // Sort upcoming schedules by date
  //   const upcomingSchedulesFiltered = res
  //   .filter((schedule) => schedule.status === "payment_confirmed")
  //   .sort((a, b) => {
  //     // Simple string comparison since dates are in 'YYYY-MM-DD' format
  //     if (a.cleaning_date === b.cleaning_date) {
  //       // If same date, compare time
  //       return (a.cleaning_time || '').localeCompare(b.cleaning_time || '');
  //     }
  //     return a.cleaning_date.localeCompare(b.cleaning_date);
  //   });

  //   setUpcomingSchedules(upcomingSchedulesFiltered);

  //   setUpcomingSchedules(
  //     res.filter(schedule => {
  //       const scheduleDateTime = new Date(`${schedule.schedule.cleaning_date}T${schedule.schedule.cleaning_time}`); // Combine date and time
  //       const currentDateTime = new Date(); // Get the current date and time
    
  //       return (
          
  //         schedule.status.toLowerCase() ===  "pending_payment" || "payment_confirmed" && 
  //         scheduleDateTime >= currentDateTime // Include only schedules with date-time now or later
  //       );
  //     })
  //   );


  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const fetchSchedules = async () => {
    try {
      const response = await userService.getSchedulesByHostId(currentUserId);
      const res = response.data;
  
      setSchedules(res);
  
      // Pending completion approval
      const pendingCompletionApprovalSchedules = res
        .filter(
          (schedule) =>
            (schedule.status === "completed" ||
              schedule.status === "in_progress") &&
            Array.isArray(schedule.assignedTo) &&
            schedule.assignedTo.some(
              (cleaner) => cleaner.status === "pending_completion_approval"
            )
        )
        .map((schedule) => ({
          ...schedule,
          assignedTo: schedule.assignedTo.filter(
            (cleaner) => cleaner.status === "pending_completion_approval"
          ),
        }));
  
      setFilteredPendingCompletionApprovalSchedules(
        pendingCompletionApprovalSchedules
      );
  
      // Helper for datetime
      const getScheduleDateTime = (schedule) => {
        const date =
          schedule.cleaning_date || schedule.schedule?.cleaning_date;
        const time =
          schedule.cleaning_time ||
          schedule.schedule?.cleaning_time ||
          "00:00:00";
  
        return new Date(`${date}T${time}`);
      };
  
      // Upcoming (future only)
      const upcomingSchedulesFiltered = res
        .filter((schedule) => {
          const scheduleDateTime = getScheduleDateTime(schedule);
          const now = new Date();
  
          const isValidStatus =
            schedule.status === "pending_payment" ||
            schedule.status === "payment_confirmed";
  
          return isValidStatus && scheduleDateTime >= now;
        })
        .sort((a, b) => {
          return getScheduleDateTime(a) - getScheduleDateTime(b);
        });
  
      setUpcomingSchedules(upcomingSchedulesFiltered);
    } catch (err) {
      console.log(err);
    }
  };

  const handleHostPress = () => {
    // navigation.navigate(ROUTES.add_apartment);
    navigation.navigate(ROUTES.host_add_apt)
  };

  const calculateTotalSpent = () => {
    return schedules
      .filter(s => s.status === 'completed')
      .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0), 0);
  };

  const formatAmount = (value) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const totalSpent = calculateTotalSpent();
  const totalSpentLabel = totalSpent;

  const formatCurrency = (amount) => {
    return `${geolocationData?.currency?.symbol || '$'}${amount?.toFixed(2) || '0.00'}`;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      completed: '#34C759',
      in_progress: COLORS.primary,
      pending_payment: '#FF9500',
      upcoming: '#5AC8FA',
      pending_acceptance: '#FF9500',
      pending_completion_approval: '#FF9500',
      cancelled: '#FF3B30',
    };
    return colorMap[status] || '#8E8E93';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      completed: 'Completed',
      in_progress: 'In Progress',
      pending_payment: 'Pending Payment',
      upcoming: 'Upcoming',
      pending_acceptance: 'Pending',
      pending_completion_approval: 'Pending Approval',
      cancelled: 'Cancelled',
    };
    return labelMap[status] || status;
  };

  const handleCloseCreateBooking = () => {
    handleCreateSchedule(false)
    resetFormData()
  }

  const renderPendingApprovalItem = ({ item }) => (
    <PendingApprovalListItem item={item} hostId={currentUserId} />
  );

  const renderUpcomingScheduleItem = ({ item }) => (
    <View style={{ marginBottom: 12 }}>
      <UpcomingScheduleListItem item={item} currency={geolocationData?.currency?.symbol} />
    </View>
  );

  const renderPropertySection = () => (
    <View>
      <PropertyCardList
        properties={properties.slice(0, 3)}
        handleHostPress={handleHostPress}
        currentUserId={currentUserId}
        navigation={navigation}
        showAddButton={properties.length === 0}
      />
    </View>
  );

  const renderNewCleaningRequests = () => {
    if (cleaningRequests.length === 0) return null;
    
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Cleaning Requests</Text>
          <Text style={styles.sectionCount}>{cleaningRequests.length}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Track all cleaning requests you've sent to cleaners.
        </Text>
        <NewlyPublishedSchedule schedule={cleaningRequests} pendingCount={pendingCount} />
      </View>
    );
  };

  const renderPendingApprovals = () => {
    if (pendingCompletionApproval.length === 0) return null;
    
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Review Completed Cleaning</Text>
          <Text style={styles.sectionCount}>{pendingCompletionApproval.length}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          The cleaner has finished the job. Approve to release payment or reject if you're not satisfied.
        </Text>
        <FlatList
          data={pendingCompletionApproval}
          renderItem={renderPendingApprovalItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderUpcomingSchedules = () => {
    if (upcomingSchedules.length === 0) return null;
    
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Schedules</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_bookings)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabsContainer}
        >
          {/* <View style={styles.filterTabs}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.id && styles.filterTabTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}
        </ScrollView>


      <FlatList
        data={upcomingSchedules.slice(0, 2)}
        renderItem={renderUpcomingScheduleItem}
        keyExtractor={(item) => item._id}
        horizontal={false}  // ← Add this prop
        showsHorizontalScrollIndicator={false}  // Optional: hides the scroll bar
        contentContainerStyle={styles.horizontalListContent}  // Optional: add padding
        ListEmptyComponent={
          <View style={styles.emptySection}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCCCCC" />
            <Text style={styles.emptySectionText}>No upcoming schedules</Text>
          </View>
        }
      />
      </View>
    );
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryCards}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.summaryLabel}>Bookings</Text>
        <Text style={styles.summaryAmount}>{schedules.length}</Text>
        <Text style={styles.summarySubtext}>All schedules</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <MaterialCommunityIcons name="cash" size={24} color="#34C759" />
        </View>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryAmount}>{geolocationData?.currency?.symbol} {totalSpentLabel}</Text>
        <Text style={styles.summarySubtext}>Completed schedules</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <MaterialCommunityIcons name="home" size={24} color="#5AC8FA" />
        </View>
        <Text style={styles.summaryLabel}>Properties</Text>
        <Text style={styles.summaryAmount}>{properties.length}</Text>
        <Text style={styles.summarySubtext}>Active listings</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {currentUser?.firstname?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate(ROUTES.notification)}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
          {notificationUnreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationUnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      
        <View style={styles.content}>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* New Cleaning Requests */}
          {renderNewCleaningRequests()}

          {/* Pending Approvals */}
          {renderPendingApprovals()}

          {/* Upcoming Schedules */}
          {renderUpcomingSchedules()}

          {/* Properties Section */}
          {renderPropertySection()}

          
        </View>
      </ScrollView>

      {/* Quick Action Button */}
      {properties.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => handleCreateSchedule(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.floatingButtonText}>New Schedule</Text>
        </TouchableOpacity>
      )}

          <Modal 
            visible={modalEVisible}
            animationType="slide" 
            // onRequestClose={onClose} // Handle hardware back button on Android
          >
            <EditSchedule 
              close_modal={handleCloseCreateBooking}
              mode="create"
            />

          </Modal>

          <Modal 
            visible={modalVisible}
            animationType="slide" 
            // onRequestClose={onClose} // Handle hardware back button on Android
          >
          
            <NewBooking 
              close_modal={handleCloseCreateBooking}
              mode="create"
            />
          </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 11,
    color: '#8E8E93',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filterTabsContainer: {
    marginBottom: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptySectionText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  helpSection: {
    borderRadius: 16,
    padding: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.9,
  },
  contactSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  contactSupportText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Dashboard;







// screens/host/Dashboard.js
// screens/host/Dashboard.js
// import React, { useContext, useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   RefreshControl,
//   Modal,
//   Image,
//   FlatList,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import { useBookingContext } from '../../context/BookingContext';
// import moment from 'moment';

// // Components
// import NewlyPublishedSchedule from '../../components/host/NewlyPublishedSchedule';
// import PendingApprovalListItem from '../../components/host/PendingApprovalListItem';
// import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
// import PropertyCardList from '../../components/host/PropertyCardList';
// import NewBooking from './NewBooking';
// import EditSchedule from './EditSchedule';

// // Custom hook
// import useDataFetch from '../../hooks/useDataFetch';
// import Fallback from '../../components/fallbacks';

// const Dashboard = () => {
//   const { selectedCleaners } = useCleanerSelection();
//   const scrollRef = useRef(null);
//   const navigation = useNavigation();
//   const { currentUser, currentUserId, geolocationData } = useContext(AuthContext);
//   const { handleEdit, modalVisible, modalEVisible, handleCreateSchedule } = useBookingContext();

//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedFilter, setSelectedFilter] = useState('upcoming');
//   const [showRetryError, setShowRetryError] = useState(false);
//   const [debugInfo, setDebugInfo] = useState('');

//   // Use the useDataFetch hook directly
//   const fetchDashboardData = useCallback(async () => {
//     try {
//       console.log('Starting fetchDashboardData, currentUserId:', currentUserId);
      
//       const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
//       console.log('Current time:', currentTime);
      
//       setDebugInfo('Fetching data...');
      
//       // Test each service call individually first
//       let schedulesRes, requestsRes, propertiesRes, clientSecretRes;
      
//       try {
//         console.log('Calling getSchedulesByHostId...');
//         schedulesRes = await userService.getSchedulesByHostId(currentUserId);
//         console.log('Schedules response:', schedulesRes?.status, 'data length:', schedulesRes?.data?.length);
//       } catch (err) {
//         console.error('Error fetching schedules:', err);
//         throw new Error(`Schedules fetch failed: ${err.message}`);
//       }
      
//       try {
//         console.log('Calling getHostCleaningRequest...');
//         requestsRes = await userService.getHostCleaningRequest(currentUserId, currentTime);
//         console.log('Requests response:', requestsRes?.status, 'data length:', requestsRes?.data?.length);
//       } catch (err) {
//         console.error('Error fetching requests:', err);
//         throw new Error(`Requests fetch failed: ${err.message}`);
//       }
      
//       try {
//         console.log('Calling getApartment...');
//         propertiesRes = await userService.getApartment(currentUserId);
//         console.log('Properties response:', propertiesRes?.status, 'data length:', propertiesRes?.data?.length);
//       } catch (err) {
//         console.error('Error fetching properties:', err);
//         throw new Error(`Properties fetch failed: ${err.message}`);
//       }
      
//       try {
//         console.log('Calling getClientSecret...');
//         clientSecretRes = await userService.getClientSecret();
//         console.log('Client secret response:', clientSecretRes?.status);
//       } catch (err) {
//         console.error('Error fetching client secret:', err);
//         // Don't throw for client secret as it's not critical for dashboard
//         clientSecretRes = { data: { client_secret: '' } };
//       }

//       const schedules = schedulesRes?.data || [];
//       const requests = requestsRes?.data || [];
//       const properties = propertiesRes?.data || [];
//       const clientSecret = clientSecretRes?.data?.client_secret || '';

//       // Process the data
//       const pendingCount = requests.length;
//       const cleaningRequests = requests.filter(req => req.status === "pending_acceptance");
//       const pendingPaymentRequests = requests.filter(req => req.status === "pending_payment");

//       const pendingCompletionApprovalSchedules = schedules
//         .filter(
//           (schedule) =>
//             (schedule.status === "completed" || schedule.status === "in_progress") &&
//             Array.isArray(schedule.assignedTo) &&
//             schedule.assignedTo.some(
//               (cleaner) => cleaner.status === "pending_completion_approval"
//             )
//         )
//         .map((schedule) => ({
//           ...schedule,
//           assignedTo: schedule.assignedTo.filter(
//             (cleaner) => cleaner.status === "pending_completion_approval"
//           ),
//         }));

//       const upcomingSchedulesFiltered = schedules
//         .filter((schedule) => schedule.status === "pending_payment")
//         .sort((a, b) => {
//           if (a.cleaning_date === b.cleaning_date) {
//             return (a.cleaning_time || '').localeCompare(b.cleaning_time || '');
//           }
//           return a.cleaning_date.localeCompare(b.cleaning_date);
//         });

//       console.log('Processed data:', {
//         schedules: schedules.length,
//         cleaningRequests: cleaningRequests.length,
//         pendingPayment: pendingPaymentRequests.length,
//         pendingCompletionApproval: pendingCompletionApprovalSchedules.length,
//         upcomingSchedules: upcomingSchedulesFiltered.length,
//         properties: properties.length,
//         pendingCount
//       });

//       setDebugInfo('Data fetched successfully');
      
//       return {
//         schedules,
//         cleaningRequests,
//         pendingPayment: pendingPaymentRequests,
//         pendingCompletionApproval: pendingCompletionApprovalSchedules,
//         upcomingSchedules: upcomingSchedulesFiltered,
//         properties,
//         clientSecret,
//         pendingCount
//       };
//     } catch (error) {
//       console.error('Error in fetchDashboardData:', error);
//       setDebugInfo(`Error: ${error.message}`);
//       throw error;
//     }
//   }, [currentUserId]);

//   const {
//     data: dashboardData,
//     loading,
//     error,
//     refetch,
//     retryAttempts
//   } = useDataFetch(fetchDashboardData, [], {
//     autoFetch: true,
//     retryCount: 2, // Reduced retry count for debugging
//     retryDelay: 3000, // Increased delay for debugging
//     onSuccess: (data) => {
//       console.log('Dashboard data loaded successfully:', {
//         schedules: data?.schedules?.length || 0,
//         properties: data?.properties?.length || 0,
//         cleaningRequests: data?.cleaningRequests?.length || 0
//       });
//       setShowRetryError(false);
//     },
//     onError: (error) => {
//       console.log('Dashboard fetch error in onError:', error);
//       if (error.includes('network') || error.includes('Network')) {
//         setShowRetryError(true);
//       }
//     },
//   });

//   // Poll for new requests - only when we have data
//   useEffect(() => {
//     let interval;
//     if (refetch && dashboardData && !error) {
//       console.log('Setting up polling interval');
//       interval = setInterval(() => {
//         console.log('Polling: refreshing data...');
//         if (refetch && typeof refetch === 'function') {
//           refetch();
//         }
//       }, 30000); // 30 seconds
//     }

//     return () => {
//       if (interval) {
//         console.log('Clearing polling interval');
//         clearInterval(interval);
//       }
//     };
//   }, [refetch, dashboardData, error]);

//   const handleRefresh = async () => {
//     console.log('Manual refresh triggered');
//     setRefreshing(true);
//     try {
//       if (refetch && typeof refetch === 'function') {
//         await refetch();
//       }
//     } catch (error) {
//       console.error('Refresh error:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Handle initial loading state
//   if (loading && !dashboardData && retryAttempts === 0) {
//     console.log('Showing initial loading state');
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <View style={styles.avatarContainer}>
//               {currentUser?.avatar ? (
//                 <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
//               ) : (
//                 <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                   <Text style={styles.avatarText}>
//                     {currentUser?.firstname?.charAt(0) || 'U'}
//                   </Text>
//                 </View>
//               )}
//             </View>
//             <View>
//               <Text style={styles.welcomeText}>Welcome back</Text>
//               <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             style={styles.notificationButton}
//             onPress={() => navigation.navigate(ROUTES.notification)}
//           >
//             <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationBadgeText}>3</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.centerContent}>
//           <Fallback 
//             type="loading" 
//             title="Loading Dashboard"
//             message="Connecting to server..."
//           />
//           <Text style={styles.debugText}>{debugInfo}</Text>
//         </View>
//       </View>
//     );
//   }

//   // Handle retry attempts
//   if (loading && !dashboardData && retryAttempts > 0) {
//     console.log('Showing retry loading state, attempt:', retryAttempts);
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <View style={styles.avatarContainer}>
//               {currentUser?.avatar ? (
//                 <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
//               ) : (
//                 <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                   <Text style={styles.avatarText}>
//                     {currentUser?.firstname?.charAt(0) || 'U'}
//                   </Text>
//                 </View>
//               )}
//             </View>
//             <View>
//               <Text style={styles.welcomeText}>Welcome back</Text>
//               <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             style={styles.notificationButton}
//             onPress={() => navigation.navigate(ROUTES.notification)}
//           >
//             <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationBadgeText}>3</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.centerContent}>
//           <Fallback 
//             type="loading" 
//             title="Reconnecting..."
//             message={`Attempt ${retryAttempts} of 3`}
//           />
//           <Text style={styles.debugText}>{debugInfo}</Text>
//           <Text style={styles.retryText}>Checking connection to server...</Text>
//         </View>
//       </View>
//     );
//   }

//   // Handle persistent error after all retries
//   if (error && showRetryError && !dashboardData) {
//     console.log('Showing error state:', error);
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <View style={styles.avatarContainer}>
//               {currentUser?.avatar ? (
//                 <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
//               ) : (
//                 <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                   <Text style={styles.avatarText}>
//                     {currentUser?.firstname?.charAt(0) || 'U'}
//                   </Text>
//                 </View>
//               )}
//             </View>
//             <View>
//               <Text style={styles.welcomeText}>Welcome back</Text>
//               <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             style={styles.notificationButton}
//             onPress={() => navigation.navigate(ROUTES.notification)}
//           >
//             <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationBadgeText}>3</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//         <ScrollView 
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={handleRefresh}
//               colors={['#007AFF']}
//               tintColor="#007AFF"
//             />
//           }
//           contentContainerStyle={styles.errorContent}
//         >
//           <Fallback 
//             type="network-error"
//             title="Connection Error"
//             message="Unable to connect to the server. Please check:"
//             onRetry={refetch}
//             onBack={() => navigation.goBack()}
//             showBack={true}
//           />
//           <View style={styles.troubleshootList}>
//             <Text style={styles.troubleshootItem}>• Your internet connection</Text>
//             <Text style={styles.troubleshootItem}>• Server status</Text>
//             <Text style={styles.troubleshootItem}>• VPN or firewall settings</Text>
//           </View>
//           <Text style={styles.debugText}>Debug: {debugInfo}</Text>
//           <Text style={styles.debugText}>Error details: {error}</Text>
//         </ScrollView>
//       </View>
//     );
//   }

//   // Extract data
//   const {
//     schedules = [],
//     cleaningRequests = [],
//     pendingPayment = [],
//     pendingCompletionApproval = [],
//     upcomingSchedules = [],
//     properties = [],
//     clientSecret = '',
//     pendingCount = 0
//   } = dashboardData || {};

//   console.log('Rendering dashboard with data:', {
//     schedules: schedules.length,
//     properties: properties.length,
//     cleaningRequests: cleaningRequests.length,
//     upcomingSchedules: upcomingSchedules.length
//   });

//   // Helper functions
//   const handleHostPress = () => {
//     navigation.navigate(ROUTES.host_add_apt);
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter(s => s.status === 'completed')
//       .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0), 0);
//   };

//   const formatCurrency = (amount) => {
//     return `${geolocationData?.currency?.symbol || '$'}${amount?.toFixed(2) || '0.00'}`;
//   };

//   const handleCloseCreateBooking = () => {
//     handleCreateSchedule(false);
//   };

//   const renderPendingApprovalItem = ({ item }) => (
//     <PendingApprovalListItem item={item} hostId={currentUserId} />
//   );

//   const renderUpcomingScheduleItem = ({ item }) => (
//     <View style={{ marginBottom: 12 }}>
//       <UpcomingScheduleListItem item={item} currency={geolocationData?.currency?.symbol} />
//     </View>
//   );

//   const renderPropertySection = () => (
//     <View>
//       <PropertyCardList
//         properties={properties.slice(0, 3)}
//         handleHostPress={handleHostPress}
//         currentUserId={currentUserId}
//         navigation={navigation}
//         showAddButton={properties.length === 0}
//       />
//     </View>
//   );

//   const renderNewCleaningRequests = () => {
//     if (cleaningRequests.length === 0) return null;
    
//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>New Cleaning Requests</Text>
//           <Text style={styles.sectionCount}>{cleaningRequests.length}</Text>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//           Track all cleaning requests you've sent to cleaners.
//         </Text>
//         <NewlyPublishedSchedule schedule={cleaningRequests} pendingCount={pendingCount} />
//       </View>
//     );
//   };

//   const renderPendingApprovals = () => {
//     if (pendingCompletionApproval.length === 0) return null;
    
//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>Review Completed Cleaning</Text>
//           <Text style={styles.sectionCount}>{pendingCompletionApproval.length}</Text>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//           The cleaner has finished the job. Approve to release payment or reject if you're not satisfied.
//         </Text>
//         <FlatList
//           data={pendingCompletionApproval}
//           renderItem={renderPendingApprovalItem}
//           keyExtractor={(item) => item._id}
//           scrollEnabled={false}
//         />
//       </View>
//     );
//   };

//   const renderUpcomingSchedules = () => {
//     if (upcomingSchedules.length === 0) {
//       return (
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Upcoming Schedules</Text>
//             <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_bookings)}>
//               <Text style={styles.viewAllText}>View All</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.emptySection}>
//             <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCCCCC" />
//             <Text style={styles.emptySectionText}>No upcoming schedules</Text>
//             <TouchableOpacity 
//               style={styles.addScheduleButton}
//               onPress={() => handleCreateSchedule(true)}
//             >
//               <Text style={styles.addScheduleButtonText}>Create Schedule</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
    
//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>Upcoming Schedules</Text>
//           <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_bookings)}>
//             <Text style={styles.viewAllText}>View All</Text>
//           </TouchableOpacity>
//         </View>
        
//         <FlatList
//           data={upcomingSchedules.slice(0, 2)}
//           renderItem={renderUpcomingScheduleItem}
//           keyExtractor={(item) => item._id}
//           horizontal={false}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.horizontalListContent}
//         />
//       </View>
//     );
//   };

//   const renderSummaryCards = () => (
//     <View style={styles.summaryCards}>
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
//         </View>
//         <Text style={styles.summaryLabel}>Total Bookings</Text>
//         <Text style={styles.summaryAmount}>{schedules.length}</Text>
//         <Text style={styles.summarySubtext}>All schedules</Text>
//       </View>
      
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="cash" size={24} color="#34C759" />
//         </View>
//         <Text style={styles.summaryLabel}>Total Spent</Text>
//         <Text style={styles.summaryAmount}>{formatCurrency(calculateTotalSpent())}</Text>
//         <Text style={styles.summarySubtext}>Completed schedules</Text>
//       </View>
      
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="home" size={24} color="#5AC8FA" />
//         </View>
//         <Text style={styles.summaryLabel}>Properties</Text>
//         <Text style={styles.summaryAmount}>{properties.length}</Text>
//         <Text style={styles.summarySubtext}>Active listings</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.avatarContainer}>
//             {currentUser?.avatar ? (
//               <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
//             ) : (
//               <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                 <Text style={styles.avatarText}>
//                   {currentUser?.firstname?.charAt(0) || 'U'}
//                 </Text>
//               </View>
//             )}
//           </View>
//           <View>
//             <Text style={styles.welcomeText}>Welcome back</Text>
//             <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//           </View>
//         </View>
//         <TouchableOpacity 
//           style={styles.notificationButton}
//           onPress={() => navigation.navigate(ROUTES.notification)}
//         >
//           <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
//           <View style={styles.notificationBadge}>
//             <Text style={styles.notificationBadgeText}>3</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Show retry status banner if we're retrying */}
//       {loading && retryAttempts > 0 && (
//         <View style={styles.retryBanner}>
//           <MaterialCommunityIcons name="wifi-alert" size={16} color="#FF9500" />
//           <Text style={styles.retryBannerText}>
//             Reconnecting... Attempt {retryAttempts} of 3
//           </Text>
//         </View>
//       )}

//       <ScrollView 
//         ref={scrollRef}
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             colors={['#007AFF']}
//             tintColor="#007AFF"
//           />
//         }
//       >
//         <View style={styles.content}>
//           {/* Summary Cards */}
//           {renderSummaryCards()}

//           {/* New Cleaning Requests */}
//           {renderNewCleaningRequests()}

//           {/* Pending Approvals */}
//           {renderPendingApprovals()}

//           {/* Upcoming Schedules */}
//           {renderUpcomingSchedules()}

//           {/* Properties Section */}
//           {renderPropertySection()}

//           {/* Debug info */}
//           {__DEV__ && (
//             <View style={styles.debugSection}>
//               <Text style={styles.debugTitle}>Debug Info</Text>
//               <Text style={styles.debugText}>Data loaded: {dashboardData ? 'Yes' : 'No'}</Text>
//               <Text style={styles.debugText}>Properties: {properties.length}</Text>
//               <Text style={styles.debugText}>Schedules: {schedules.length}</Text>
//               <Text style={styles.debugText}>Status: {debugInfo}</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* Quick Action Button */}
//       {properties.length > 0 && (
//         <TouchableOpacity 
//           style={styles.floatingButton}
//           onPress={() => handleCreateSchedule(true)}
//         >
//           <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
//           <Text style={styles.floatingButtonText}>New Schedule</Text>
//         </TouchableOpacity>
//       )}

//       <Modal 
//         visible={modalEVisible}
//         animationType="slide"
//       >
//         <EditSchedule 
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>

//       <Modal 
//         visible={modalVisible}
//         animationType="slide"
//       >
//         <NewBooking 
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F7',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5EA',
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   avatarPlaceholder: {
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   welcomeText: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   notificationButton: {
//     padding: 8,
//     position: 'relative',
//   },
//   notificationBadge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: '#FF3B30',
//     borderRadius: 10,
//     width: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   notificationBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   centerContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorContent: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   retryText: {
//     marginTop: 10,
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   retryBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#FFE0B2',
//   },
//   retryBannerText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: '#F57C00',
//     fontWeight: '500',
//   },
//   troubleshootList: {
//     marginTop: 16,
//     paddingHorizontal: 20,
//   },
//   troubleshootItem: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   debugSection: {
//     backgroundColor: '#F8F9FA',
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 16,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   debugTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#495057',
//     marginBottom: 8,
//   },
//   debugText: {
//     fontSize: 12,
//     color: '#6C757D',
//     marginBottom: 4,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//     paddingBottom: 100,
//   },
//   summaryCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   summaryIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#F2F2F7',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginBottom: 4,
//     fontWeight: '500',
//   },
//   summaryAmount: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   summarySubtext: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   sectionCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   sectionCount: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     backgroundColor: `${COLORS.primary}20`,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   viewAllText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   emptySection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptySectionText: {
//     fontSize: 16,
//     color: '#8E8E93',
//     marginTop: 12,
//     marginBottom: 16,
//   },
//   addScheduleButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   addScheduleButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   horizontalListContent: {
//     paddingBottom: 4,
//   },
//   floatingButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderRadius: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   floatingButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
// });

// export default Dashboard;