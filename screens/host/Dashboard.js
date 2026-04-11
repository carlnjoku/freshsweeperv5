// import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Image,
//   Button,
//   RefreshControl,
//   FlatList,
//   StatusBar
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useFocusEffect, useRoute } from '@react-navigation/native';
// import { useNavigation } from '@react-navigation/native';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import moment from 'moment';
// import { useTranslation } from 'react-i18next';
// import { tSafe } from '../../utils/tSafe';



// // Components
// import NewlyPublishedSchedule from '../../components/host/NewlyPublishedSchedule';
// import EmptyApartmentPlaceholder from '../../components/shared/EmptyApartmentPlaceholder';
// import PendingApprovalListItem from '../../components/host/PendingApprovalListItem';
// import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
// import PropertyCardList from '../../components/host/PropertyCardList';
// import { useBookingContext } from '../../context/BookingContext';
// import NewBooking from './NewBooking';
// import EditSchedule from './EditSchedule';

// const Dashboard = () => {
// // const { selectedCleaners } = useCleanerSelection();

//   const { t } = useTranslation();
//   const scrollRef = useRef(null);
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { currentUser, currentUserId, geolocationData, notificationUnreadCount } = useContext(AuthContext);
//   const {handleEdit, modalVisible, modalEVisible, openModal, setOpenModal,  handleCreateSchedule }  = useBookingContext();

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [schedules, setSchedules] = useState([]);
//   const [pendingPayment, setFilteredPendingPayment] = useState([]);
//   const [pendingCompletionApproval, setFilteredPendingCompletionApprovalSchedules] = useState([]);
//   const [upcomingSchedules, setUpcomingSchedules] = useState([]);
//   const [cleaningRequests, setCleaningRequests] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [clientSecret, setClientSecret] = useState('');
//   const [pendingCount, setPendingCount] = useState(0);

//   // Selected filter for upcoming schedules
//   const [selectedFilter, setSelectedFilter] = useState('upcoming');

//   const filters = [
//     { id: 'upcoming', label: 'Upcoming' },
//     { id: 'in_progress', label: 'In Progress' },
//     { id: 'completed', label: 'Completed' },
//   ];



//   // Handle refresh
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties()]);
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties(), fetchClientSecret()]);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Poll for new requests
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchRequests();
//     }, 30000); // Poll every 30 seconds

//     return () => clearInterval(interval);
//   }, []);

//   const fetchClientSecret = async () => {
//     try {
//       const response = await userService.getClientSecret();
//       const res = response.data;
//       setClientSecret(res.client_secret);
//     } catch (error) {
//       console.error('Error fetching client secret:', error);
//     }
//   };

//   const fetchRequests = async () => {
//     const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
//     try {
//       const response = await userService.getHostCleaningRequest(currentUserId, currentTime);
//       const res = response.data;
      
//       setPendingCount(res.length);
      
//       const pendingRequests = res.filter(
//         (req) => req.status === "pending_acceptance"
//       );
      
//       const pendingPaymentRequests = res.filter(
//         (req) => req.status === "pending_payment"
//       );

//       setCleaningRequests(res);
//       setFilteredPendingPayment(pendingPaymentRequests);

//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       const data = response.data;
//       setProperties(data);
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//     }
//   };

  

//   const fetchSchedules = async () => {
//     try {
//       const response = await userService.getSchedulesByHostId(currentUserId);
//       const res = response.data;
  
//       setSchedules(res);
  
//       // Pending completion approval
//       const pendingCompletionApprovalSchedules = res
//         .filter(
//           (schedule) =>
//             (schedule.status === "completed" ||
//               schedule.status === "in_progress") &&
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
  
//       setFilteredPendingCompletionApprovalSchedules(
//         pendingCompletionApprovalSchedules
//       );
  
//       // Helper for datetime
//       const getScheduleDateTime = (schedule) => {
//         const date =
//           schedule.cleaning_date || schedule.schedule?.cleaning_date;
//         const time =
//           schedule.cleaning_time ||
//           schedule.schedule?.cleaning_time ||
//           "00:00:00";
  
//         return new Date(`${date}T${time}`);
//       };
  
//       // Upcoming (future only)
//       const upcomingSchedulesFiltered = res
//         .filter((schedule) => {
//           const scheduleDateTime = getScheduleDateTime(schedule);
//           const now = new Date();
  
//           const isValidStatus =
//             schedule.status === "pending_payment" ||
//             schedule.status === "payment_confirmed";
  
//           return isValidStatus && scheduleDateTime >= now;
//         })
//         .sort((a, b) => {
//           return getScheduleDateTime(a) - getScheduleDateTime(b);
//         });
  
//       setUpcomingSchedules(upcomingSchedulesFiltered);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleHostPress = () => {
//     // navigation.navigate(ROUTES.add_apartment);
//     navigation.navigate(ROUTES.host_add_apt)
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter(s => s.status === 'completed')
//       .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0), 0);
//   };

//   const formatAmount = (value) => {
//     if (value >= 1_000_000) {
//       return `${(value / 1_000_000).toFixed(1)}M`;
//     }
//     if (value >= 1_000) {
//       return `${(value / 1_000).toFixed(1)}k`;
//     }
//     return value.toString();
//   };

//   const totalSpent = calculateTotalSpent();
//   const totalSpentLabel = totalSpent;

//   const formatCurrency = (amount) => {
//     return `${geolocationData?.currency?.symbol || '$'}${amount?.toFixed(2) || '0.00'}`;
//   };

//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       in_progress: COLORS.primary,
//       pending_payment: '#FF9500',
//       upcoming: '#5AC8FA',
//       pending_acceptance: '#FF9500',
//       pending_completion_approval: '#FF9500',
//       cancelled: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusLabel = (status) => {
//     const labelMap = {
//       completed: 'Completed',
//       in_progress: 'In Progress',
//       pending_payment: 'Pending Payment',
//       upcoming: 'Upcoming',
//       pending_acceptance: 'Pending',
//       pending_completion_approval: 'Pending Approval',
//       cancelled: 'Cancelled',
//     };
//     return labelMap[status] || status;
//   };

//   const handleCloseCreateBooking = () => {
//     handleCreateSchedule(false)
//     resetFormData()
//   }

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
//           <Text style={styles.sectionTitle}>{tSafe("new_cleaning_requests", "New Cleaning Requests")} </Text>
//           <Text style={styles.sectionCount}>{cleaningRequests.length}</Text>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//         {tSafe("track_cleaning_dashboard", "Track all cleaning requests you've sent to cleaners.")} 
          
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
//           <Text style={styles.sectionTitle}>{tSafe("review_completed_cleaning_dashboard","Review Completed Cleaning")} </Text>
//           <Text style={styles.sectionCount}>{pendingCompletionApproval.length}</Text>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//         {tSafe('cleaning_approval_notification', "The cleaner has finished the job. Approve to release payment or reject if you're not satisfied.")} 
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
//     if (upcomingSchedules.length === 0) return null;
    
//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>{tSafe('upcoming_schedules', 'Upcoming Schedules')} </Text>
//           <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_bookings)}>
//             <Text style={styles.viewAllText}> {tSafe('view_all', 'View All')}</Text>
//           </TouchableOpacity>
//         </View>
        
//         {/* Filter Tabs */}
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.filterTabsContainer}
//         >
//           {/* <View style={styles.filterTabs}>
//             {filters.map((filter) => (
//               <TouchableOpacity
//                 key={filter.id}
//                 style={[
//                   styles.filterTab,
//                   selectedFilter === filter.id && styles.filterTabActive,
//                 ]}
//                 onPress={() => setSelectedFilter(filter.id)}
//               >
//                 <Text
//                   style={[
//                     styles.filterTabText,
//                     selectedFilter === filter.id && styles.filterTabTextActive,
//                   ]}
//                 >
//                   {filter.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View> */}
//         </ScrollView>


//       <FlatList
//         data={upcomingSchedules.slice(0, 2)}
//         renderItem={renderUpcomingScheduleItem}
//         keyExtractor={(item) => item._id}
//         horizontal={false}  // ← Add this prop
//         showsHorizontalScrollIndicator={false}  // Optional: hides the scroll bar
//         contentContainerStyle={styles.horizontalListContent}  // Optional: add padding
//         ListEmptyComponent={
//           <View style={styles.emptySection}>
//             <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCCCCC" />
//             <Text style={styles.emptySectionText}>{tSafe("no_upcoming_schedule", "No upcoming schedules")} </Text>
//           </View>
//         }
//       />
//       </View>
//     );
//   };

//   const renderSummaryCards = () => (
//     <View style={styles.summaryCards}>
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
//         </View>
//         <Text style={styles.summaryLabel}>{tSafe("bookings", "Bookings")} </Text>
//         <Text style={styles.summaryAmount}>{schedules.length}</Text>
//         <Text style={styles.summarySubtext}>{tSafe("all_schedules", " All schedules")}</Text>
//       </View>
      
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="cash" size={24} color="#34C759" />
//         </View>
//         <Text style={styles.summaryLabel}> {tSafe("total_spent", "Total Spent")}</Text>
//         <Text style={styles.summaryAmount}>{geolocationData?.currency?.symbol} {totalSpentLabel}</Text>
//         <Text style={styles.summarySubtext}> {tSafe("completed_schedules", "Completed schedules")}</Text>
//       </View>
      
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="home" size={24} color="#5AC8FA" />
//         </View>
//         <Text style={styles.summaryLabel} >{tSafe("properties", "Properties")}</Text>
//         <Text style={styles.summaryAmount}>{properties.length}</Text>
//         <Text style={styles.summarySubtext}>{tSafe("active_listings", "Active listings")}</Text>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading dashboard...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
//             <Text style={styles.welcomeText}>{tSafe("welcome_back", "Welcome back")}</Text>
//             <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//           </View>
//         </View>
//         <TouchableOpacity 
//           style={styles.notificationButton}
//           onPress={() => navigation.navigate(ROUTES.notification)}
//         >
//           <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
//           {notificationUnreadCount > 0 && (
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationBadgeText}>{notificationUnreadCount}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         ref={scrollRef}
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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

//           <Modal 
//             visible={modalEVisible}
//             animationType="slide" 
//             // onRequestClose={onClose} // Handle hardware back button on Android
//           >
//             <EditSchedule 
//               close_modal={handleCloseCreateBooking}
//               mode="create"
//             />

//           </Modal>

//           <Modal 
//             visible={modalVisible}
//             animationType="slide" 
//             // onRequestClose={onClose} // Handle hardware back button on Android
//           >
          
//             <NewBooking 
//               close_modal={handleCloseCreateBooking}
//               mode="create"
//             />
//           </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F7',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
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
//   filterTabsContainer: {
//     marginBottom: 1,
//   },
//   filterTabs: {
//     flexDirection: 'row',
//     backgroundColor: '#F2F2F7',
//     borderRadius: 12,
//     padding: 4,
//   },
//   filterTab: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     minWidth: 100,
//   },
//   filterTabActive: {
//     backgroundColor: COLORS.primary,
//   },
//   filterTabText: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: '#8E8E93',
//   },
//   filterTabTextActive: {
//     color: '#FFFFFF',
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
//   },
//   helpSection: {
//     borderRadius: 16,
//     padding: 20,
//   },
//   helpHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   helpTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginLeft: 10,
//   },
//   helpText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     lineHeight: 20,
//     marginBottom: 20,
//     opacity: 0.9,
//   },
//   contactSupportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//   },
//   contactSupportText: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginLeft: 8,
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
  StatusBar
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
import { useTranslation } from 'react-i18next';
import { tSafe } from '../../utils/tSafe';

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

  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { currentUser, currentUserId, geolocationData, notificationUnreadCount } = useContext(AuthContext);
  const { handleEdit, modalVisible, modalEVisible, openModal, setOpenModal, handleCreateSchedule } = useBookingContext();

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
    { id: 'upcoming', label: tSafe('upcoming', 'Upcoming') },
    { id: 'in_progress', label: tSafe('in_progress', 'In Progress') },
    { id: 'completed', label: tSafe('completed', 'Completed') },
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
      completed: tSafe('completed_status', 'Completed'),
      in_progress: tSafe('in_progress_status', 'In Progress'),
      pending_payment: tSafe('pending_payment_status', 'Pending Payment'),
      upcoming: tSafe('upcoming_status', 'Upcoming'),
      pending_acceptance: tSafe('pending_acceptance_status', 'Pending'),
      pending_completion_approval: tSafe('pending_completion_approval_status', 'Pending Approval'),
      cancelled: tSafe('cancelled_status', 'Cancelled'),
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
          <Text style={styles.sectionTitle}>{tSafe("new_cleaning_requests", "New Cleaning Requests")} </Text>
          <Text style={styles.sectionCount}>{cleaningRequests.length}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {tSafe("track_cleaning_dashboard", "Track all cleaning requests you've sent to cleaners.")}
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
          <Text style={styles.sectionTitle}>{tSafe("review_completed_cleaning_dashboard", "Review Completed Cleaning")} </Text>
          <Text style={styles.sectionCount}>{pendingCompletionApproval.length}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {tSafe('cleaning_approval_notification', "The cleaner has finished the job. Approve to release payment or reject if you're not satisfied.")}
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
          <Text style={styles.sectionTitle}>{tSafe('upcoming_schedules', 'Upcoming Schedules')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_bookings)}>
            <Text style={styles.viewAllText}>{tSafe('view_all', 'View All')}</Text>
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
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          ListEmptyComponent={
            <View style={styles.emptySection}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCCCCC" />
              <Text style={styles.emptySectionText}>{tSafe("no_upcoming_schedule", "No upcoming schedules")} </Text>
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
        <Text style={styles.summaryLabel}>{tSafe("bookings", "Bookings")} </Text>
        <Text style={styles.summaryAmount}>{schedules.length}</Text>
        <Text style={styles.summarySubtext}>{tSafe("all_schedules", "All schedules")}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <MaterialCommunityIcons name="cash" size={24} color="#34C759" />
        </View>
        <Text style={styles.summaryLabel}>{tSafe("total_spent", "Total Spent")}</Text>
        <Text style={styles.summaryAmount}>{geolocationData?.currency?.symbol} {totalSpentLabel}</Text>
        <Text style={styles.summarySubtext}>{tSafe("completed_schedules", "Completed schedules")}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <MaterialCommunityIcons name="home" size={24} color="#5AC8FA" />
        </View>
        <Text style={styles.summaryLabel}>{tSafe("properties", "Properties")}</Text>
        <Text style={styles.summaryAmount}>{properties.length}</Text>
        <Text style={styles.summarySubtext}>{tSafe("active_listings", "Active listings")}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe("loading_dashboard", "Loading dashboard...")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
            <Text style={styles.welcomeText}>{tSafe("welcome_back", "Welcome back")}</Text>
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
          <Text style={styles.floatingButtonText}>{tSafe("new_schedule", "New Schedule")}</Text>
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



