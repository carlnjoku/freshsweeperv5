// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Swipeable } from 'react-native-gesture-handler';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import { AuthContext } from '../../context/AuthContext';

// // API base URL - adjust based on your environment
// const API_BASE_URL = 'https://www.freshsweeper.com/api'; // Change to your actual API URL

// const Notification = () => {

//   const { currentUser } = useContext(AuthContext)

//   const navigation = useNavigation();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showUnreadOnly, setShowUnreadOnly] = useState(false);
//   const [userId, setUserId] = useState('68844853b4c35a50a4de2830'); // Replace with actual user ID from auth
//   const [userType, setUserType] = useState('host'); // Replace with actual user type from auth

//   // Fetch notifications from API
//   const fetchNotifications = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/notifications/user/${currentUser._id}?userType=${currentUser.userType}&limit=50`
//       );
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setNotifications(data);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       Alert.alert('Error', 'Failed to load notifications');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/notifications/${notificationId}/read`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to mark as read');
//       }

//       // Update local state
//       setNotifications(prev =>
//         prev.map(notif =>
//           notif._id === notificationId
//             ? { ...notif, status: 'read', readAt: new Date().toISOString() }
//             : notif
//         )
//       );
//     } catch (error) {
//       console.error('Error marking as read:', error);
//       // Don't show alert for read errors to avoid interrupting user flow
//     }
//   };

//   // Delete notification
//   const handleDelete = async (notificationId) => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/notifications/${notificationId}`,
//         {
//           method: 'DELETE',
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to delete notification');
//       }

//       // Remove from local state
//       setNotifications(prev => prev.filter(n => n._id !== notificationId));
//     } catch (error) {
//       console.error('Error deleting notification:', error);
//       Alert.alert('Error', 'Failed to delete notification');
//     }
//   };

//   // Handle notification press - navigate to appropriate screen
//   const handleNotificationPress = (notification) => {
//     const { type, metadata, _id } = notification;
//     const bookingId = metadata?.bookingId;
//     const paymentId = metadata?.paymentId;
//     const supportTicketId = metadata?.supportTicketId;
//     const chatId = metadata?.chatId;
  
//     // Mark as read first
//     markAsRead(_id);
  
//     // Navigate based on notification type
//     switch (type) {
//       // === BOOKING/SCHEDULING NOTIFICATIONS ===
//       case 'schedule_request':
//         if (userType === 'cleaner') {
//           navigation.navigate('BookingRequestDetail', { 
//             bookingId,
//             notificationId: _id 
//           });
//         } else {
//           navigation.navigate('BookingStatus', { 
//             bookingId,
//             notificationId: _id 
//           });
//         }
//         break;
  
//       case 'schedule_confirmed':
//         navigation.navigate('BookingDetail', { 
//           bookingId,
//           notificationId: _id 
//         });
//         break;
  
//       case 'schedule_cancelled':
//         navigation.navigate(ROUTES.host_cancellation_details, { 
//           bookingId,
//           notificationId: _id 
//         });
//         break;
  
//       case 'schedule_reminder':
//         navigation.navigate('BookingDetail', { 
//           bookingId,
//           notificationId: _id,
//           isReminder: true 
//         });
//         break;
  
//       case 'schedule_modified':
//         navigation.navigate('BookingModification', { 
//           bookingId,
//           notificationId: _id,
//           changes: metadata?.changes 
//         });
//         break;
  
//       case 'schedule_rescheduled':
//         navigation.navigate('RescheduleDetail', { 
//           bookingId,
//           notificationId: _id,
//           oldDate: metadata?.oldDate,
//           newDate: metadata?.newDate 
//         });
//         break;
  
//       // === PAYMENT NOTIFICATIONS ===
//       case 'payment_received':
//         if (userType === 'cleaner') {
//           navigation.navigate('Earnings', { 
//             paymentId,
//             notificationId: _id 
//           });
//         } else {
//           navigation.navigate('PaymentHistory', { 
//             paymentId,
//             notificationId: _id 
//           });
//         }
//         break;
  
//       case 'payment_pending':
//         navigation.navigate('PaymentStatus', { 
//           paymentId,
//           notificationId: _id,
//           status: 'pending'
//         });
//         break;
  
//       case 'payment_failed':
//         navigation.navigate('PaymentStatus', { 
//           paymentId,
//           notificationId: _id,
//           status: 'failed'
//         });
//         break;
  
//       case 'payment_refunded':
//         navigation.navigate('RefundDetail', { 
//           paymentId,
//           notificationId: _id,
//           refundAmount: metadata?.refundAmount 
//         });
//         break;
  
//       case 'payment_disputed':
//         navigation.navigate('DisputeDetail', { 
//           paymentId,
//           notificationId: _id 
//         });
//         break;
  
//       // === RATING & REVIEW NOTIFICATIONS ===
//       case 'rating_received':
//         navigation.navigate('RatingDetail', { 
//           bookingId,
//           notificationId: _id,
//           rating: metadata?.rating 
//         });
//         break;
  
//       case 'review_received':
//         navigation.navigate('ReviewDetail', { 
//           bookingId,
//           notificationId: _id 
//         });
//         break;
  
//       case 'review_responded':
//         navigation.navigate('ReviewResponse', { 
//           bookingId,
//           notificationId: _id 
//         });
//         break;
  
//       // === CLEANING STATUS NOTIFICATIONS ===
//       case 'cleaning_started':
//         navigation.navigate('CleaningStatus', { 
//           bookingId,
//           notificationId: _id,
//           status: 'started'
//         });
//         break;
  
//       case 'cleaning_completed':
//         navigation.navigate('CleaningStatus', { 
//           bookingId,
//           notificationId: _id,
//           status: 'completed'
//         });
//         break;
  
//       case 'cleaning_delayed':
//         navigation.navigate('CleaningStatus', { 
//           bookingId,
//           notificationId: _id,
//           status: 'delayed',
//           delayReason: metadata?.delayReason 
//         });
//         break;
  
//       case 'cleaner_on_the_way':
//         if (userType === 'host') {
//           navigation.navigate('CleanerTracking', { 
//             bookingId,
//             notificationId: _id,
//             cleanerLocation: metadata?.cleanerLocation 
//           });
//         }
//         break;
  
//       // === SYSTEM & ACCOUNT NOTIFICATIONS ===
//       case 'system_alert':
//         navigation.navigate(ROUTES.cleaner_all_requests, { 
//           notificationId: _id,
//           notificationData: notification 
//         });
//         break;
  
//       case 'account_verified':
//         navigation.navigate('Profile', { 
//           notificationId: _id,
//           showVerification: true 
//         });
//         break;
  
//       case 'profile_approved':
//         if (userType === 'cleaner') {
//           navigation.navigate('Profile', { 
//             notificationId: _id,
//             showApproval: true 
//           });
//         }
//         break;
  
//       case 'document_expiring':
//         navigation.navigate('Documents', { 
//           notificationId: _id,
//           expiringDocument: metadata?.documentType 
//         });
//         break;
  
//       case 'subscription_renewal':
//         navigation.navigate('Subscription', { 
//           notificationId: _id 
//         });
//         break;
  
//       // === PROMOTIONAL NOTIFICATIONS ===
//       case 'promotional':
//         navigation.navigate(ROUTES.host_promotion, { 
//           notificationId: _id,
//           notificationData: notification 
//         });
//         break;
  
//       case 'referral_bonus':
//         navigation.navigate('ReferralProgram', { 
//           notificationId: _id,
//           bonusAmount: metadata?.bonusAmount 
//         });
//         break;
  
//       case 'loyalty_reward':
//         navigation.navigate('LoyaltyRewards', { 
//           notificationId: _id,
//           rewardDetails: metadata?.rewardDetails 
//         });
//         break;
  
//       case 'seasonal_offer':
//         navigation.navigate('SeasonalOffers', { 
//           notificationId: _id 
//         });
//         break;
  
//       // === SUPPORT & COMMUNICATION ===
//       case 'support_response':
//         navigation.navigate('SupportChat', { 
//           supportTicketId,
//           notificationId: _id 
//         });
//         break;
  
//       case 'message_received':
//         navigation.navigate('Chat', { 
//           chatId,
//           notificationId: _id,
//           senderName: metadata?.senderName 
//         });
//         break;
  
//       case 'invoice_ready':
//         navigation.navigate('Invoices', { 
//           notificationId: _id,
//           invoiceId: metadata?.invoiceId 
//         });
//         break;
  
//       default:
//         // For unknown types, just mark as read and stay on notifications
//         console.log('Unknown notification type:', type);
//         break;
//     }
//   };

//   // Pull to refresh
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchNotifications();
//   }, []);

//   // Load notifications when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchNotifications();
//     }, [userId, userType])
//   );

//   // Get notification icon based on type
// const getNotificationIcon = (type) => {
//   const iconMap = {
//     // Booking/Scheduling
//     cleaning_request: 'calendar-plus',
//     schedule_request: 'calendar-plus',
//     schedule_confirmed: 'calendar-check',
//     schedule_cancelled: 'calendar-remove',
//     schedule_reminder: 'calendar-clock',
//     schedule_modified: 'calendar-edit',
//     schedule_rescheduled: 'calendar-sync',
    
//     // Payment
//     payment_received: 'credit-card-check',
//     payment_pending: 'clock-outline',
//     payment_failed: 'credit-card-off',
//     payment_refunded: 'cash-refund',
//     payment_disputed: 'alert-circle',
    
//     // Rating & Review
//     rating_received: 'star',
//     review_received: 'comment-text',
//     review_responded: 'comment-check',
    
//     // Cleaning Status
//     cleaning_request: 'play-circle',
//     cleaning_started: 'play-circle',
//     cleaning_completed: 'check-circle',
//     cleaning_delayed: 'clock-alert',
//     cleaner_on_the_way: 'map-marker-path',
    
//     // System & Account
//     system_alert: 'alert-circle',
//     account_verified: 'shield-check',
//     profile_approved: 'account-check',
//     document_expiring: 'file-alert',
//     subscription_renewal: 'autorenew',
    
//     // Promotional
//     promotional: 'tag',
//     referral_bonus: 'account-plus',
//     loyalty_reward: 'gift',
//     seasonal_offer: 'weather-sunny',
    
//     // Support & Communication
//     support_response: 'headset',
//     message_received: 'message-text',
//     invoice_ready: 'file-document',
//   };
//   return iconMap[type] || 'bell';
// };

// // Get notification icon color based on type
// const getNotificationColor = (type) => {
//   const colorMap = {
//     // Booking/Scheduling
//     cleaning_request: '#FFA500', // Orange
//     schedule_confirmed: '#4CAF50', // Green
//     schedule_cancelled: '#F44336', // Red
//     schedule_reminder: '#2196F3', // Blue
//     schedule_modified: '#FF9800', // Amber
//     schedule_rescheduled: '#9C27B0', // Purple
    
//     // Payment
//     payment_received: '#4CAF50', // Green
//     payment_pending: '#FF9800', // Amber
//     payment_failed: '#F44336', // Red
//     payment_refunded: '#795548', // Brown
//     payment_disputed: '#FF5722', // Deep Orange
    
//     // Rating & Review
//     rating_received: '#FFC107', // Amber
//     review_received: '#FF9800', // Orange
//     review_responded: '#4CAF50', // Green
    
//     // Cleaning Status
//     cleaning_started: '#2196F3', // Blue
//     cleaning_completed: '#4CAF50', // Green
//     cleaning_delayed: '#FF9800', // Amber
//     cleaner_on_the_way: '#9C27B0', // Purple
    
//     // System & Account
//     system_alert: '#F44336', // Red
//     account_verified: '#4CAF50', // Green
//     profile_approved: '#4CAF50', // Green
//     document_expiring: '#FF9800', // Amber
//     subscription_renewal: '#2196F3', // Blue
    
//     // Promotional
//     promotional: '#9C27B0', // Purple
//     referral_bonus: '#E91E63', // Pink
//     loyalty_reward: '#FF5722', // Deep Orange
//     seasonal_offer: '#FF9800', // Orange
    
//     // Support & Communication
//     support_response: '#2196F3', // Blue
//     message_received: '#607D8B', // Blue Grey
//     invoice_ready: '#795548', // Brown
//   };
//   return colorMap[type] || '#666';
// };

// // Get notification action text based on type
// const getActionText = (type) => {
//   const actionMap = {
//     cleaning_request: userType === 'cleaner' ? 'View Request' : 'View Status',
//     schedule_confirmed: 'View Booking',
//     schedule_cancelled: 'View Details',
//     schedule_reminder: 'View Booking',
//     schedule_modified: 'View Changes',
//     schedule_rescheduled: 'View New Time',
    
//     payment_received: 'View Details',
//     payment_pending: 'View Status',
//     payment_failed: 'Retry Payment',
//     payment_refunded: 'View Refund',
//     payment_disputed: 'View Dispute',
    
//     rating_received: 'View Rating',
//     review_received: 'Read Review',
//     review_responded: 'View Response',
    
//     cleaning_started: 'View Progress',
//     cleaning_completed: 'View Completion',
//     cleaning_delayed: 'View Details',
//     cleaner_on_the_way: 'Track Cleaner',
    
//     system_alert: 'View Alert',
//     account_verified: 'View Profile',
//     profile_approved: 'View Profile',
//     document_expiring: 'Update Documents',
//     subscription_renewal: 'Manage Subscription',
    
//     promotional: 'View Offer',
//     referral_bonus: 'View Bonus',
//     loyalty_reward: 'Claim Reward',
//     seasonal_offer: 'View Offer',
    
//     support_response: 'View Response',
//     message_received: 'Open Chat',
//     invoice_ready: 'View Invoice',
//   };
//   return actionMap[type] || 'View Details';
// };

//   // Format time ago
//   const formatTimeAgo = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
//     return date.toLocaleDateString();
//   };

//   // Check if notification is unread
//   const isUnread = (notification) => {
//     return notification.status === 'sent' || notification.status === 'delivered';
//   };

  

//   // Swipeable delete action
//   const renderRightActions = (notificationId) => (
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => {
//         Alert.alert(
//           'Delete Notification',
//           'Are you sure you want to delete this notification?',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Delete', style: 'destructive', onPress: () => handleDelete(notificationId) },
//           ]
//         );
//       }}
//     >
//       <MaterialCommunityIcons name="trash-can" size={24} color="white" />
//     </TouchableOpacity>
//   );

//   // Render each notification item
//   const renderItem = ({ item }) => (
//     <Swipeable renderRightActions={() => renderRightActions(item._id)}>
//       <TouchableOpacity 
//         style={[
//           styles.notificationCard, 
//           isUnread(item) && styles.unreadCard
//         ]}
//         onPress={() => handleNotificationPress(item)}
//       >
//         <MaterialCommunityIcons
//           name={getNotificationIcon(item.type)}
//           size={30}
//           color={getNotificationColor(item.type)}
//           style={styles.notificationIcon}
//         />
        
//         <View style={styles.notificationContent}>
//           <View style={styles.notificationHeader}>
//             <Text style={styles.title}>{item.title}</Text>
//             {isUnread(item) && <View style={styles.unreadDot} />}
//           </View>
          
//           <Text style={styles.message} numberOfLines={2}>
//             {item.message}
//           </Text>
          
//           <View style={styles.notificationFooter}>
//             <View style={styles.footerLeft}>
//               <Text style={styles.time}>
//                 {formatTimeAgo(item.sentAt || item.createdAt)}
//               </Text>
              
//               {item.metadata?.bookingId && (
//                 <Text style={styles.bookingId}>
//                   Booking: {item.metadata.bookingId.substring(0, 8)}...
//                 </Text>
//               )}
//             </View>
            
//             <View style={styles.actionIndicator}>
//               <Text style={styles.actionText}>
//                 {getActionText(item.type)}
//               </Text>
//               <MaterialCommunityIcons 
//                 name="chevron-right" 
//                 size={16} 
//                 color="#007AFF" 
//               />
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Swipeable>
//   );

//   // Filter notifications based on unread toggle
//   const filteredNotifications = showUnreadOnly
//     ? notifications.filter(n => isUnread(n))
//     : notifications;

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading notifications...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerRow}>
//           <Text style={styles.headerTitle}>Notifications</Text>
          
//           <TouchableOpacity 
//             onPress={() => setShowUnreadOnly(prev => !prev)}
//             style={styles.filterButton}
//           >
//             <MaterialCommunityIcons
//               name={showUnreadOnly ? 'filter-off' : 'filter'}
//               size={26}
//               color="#007AFF"
//             />
//             <Text style={styles.filterText}>
//               {showUnreadOnly ? 'Show All' : 'Unread Only'}
//             </Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.statsRow}>
//           <Text style={styles.statsText}>
//             {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
//             {showUnreadOnly && ` (${notifications.filter(n => isUnread(n)).length} unread)`}
//           </Text>
          
//           {notifications.filter(n => isUnread(n)).length > 0 && (
//             <TouchableOpacity 
//               onPress={async () => {
//                 // Mark all as read
//                 const unreadNotifications = notifications.filter(n => isUnread(n));
//                 for (const notification of unreadNotifications) {
//                   await markAsRead(notification._id);
//                 }
//               }}
//             >
//               <Text style={styles.markAllReadText}>Mark all read</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <FlatList
//         data={filteredNotifications}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <MaterialCommunityIcons 
//               name="bell-off" 
//               size={64} 
//               color="#CCCCCC" 
//             />
//             <Text style={styles.emptyText}>
//               {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
//             </Text>
//             <Text style={styles.emptySubtext}>
//               {showUnreadOnly ? 'You\'re all caught up!' : 'Notifications will appear here'}
//             </Text>
//           </View>
//         }
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     paddingTop: 60,
//   },
//   centerContainer: {
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
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//   },
//   filterText: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   statsText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   markAllReadText: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 16,
//     paddingTop: 8,
//   },
//   notificationCard: {
//     flexDirection: 'row',
//     padding: 16,
//     marginBottom: 12,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   unreadCard: {
//     backgroundColor: '#E7F3FF',
//     borderColor: '#B3D9FF',
//   },
//   notificationIcon: {
//     marginRight: 12,
//     width: 40,
//     height: 40,
//     textAlign: 'center',
//     textAlignVertical: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//   },
//   notificationContent: {
//     flex: 1,
//   },
//   notificationHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     flex: 1,
//   },
//   unreadDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#007AFF',
//     marginLeft: 8,
//     marginTop: 6,
//   },
//   message: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   notificationFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   footerLeft: {
//     flex: 1,
//   },
//   time: {
//     fontSize: 12,
//     color: '#999',
//   },
//   bookingId: {
//     fontSize: 11,
//     color: '#999',
//     fontFamily: 'monospace',
//     marginTop: 2,
//   },
//   actionIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 12,
//     color: '#007AFF',
//     fontWeight: '500',
//     marginRight: 4,
//   },
//   deleteButton: {
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 80,
//     marginVertical: 6,
//     borderRadius: 12,
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 80,
//     paddingHorizontal: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });

// export default Notification;









// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Swipeable } from 'react-native-gesture-handler';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import { AuthContext } from '../../context/AuthContext';

// // API base URL - adjust based on your environment
// const API_BASE_URL = 'https://www.freshsweeper.com/api'; // Change to your actual API URL

// const Notification = () => {

//   const { currentUser } = useContext(AuthContext)

//   const navigation = useNavigation();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showUnreadOnly, setShowUnreadOnly] = useState(false);

//   // Fetch notifications from API
//   const fetchNotifications = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/notifications/user/${currentUser._id}?userType=${currentUser.userType}&limit=50`
//       );
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setNotifications(data);
//       console.error('notifications Type:', data);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       Alert.alert('Error', 'Failed to load notifications');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/notifications/${notificationId}/read`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to mark as read');
//       }

//       // Update local state
//       setNotifications(prev =>
//         prev.map(notif =>
//           notif._id === notificationId
//             ? { ...notif, status: 'read', readAt: new Date().toISOString() }
//             : notif
//         )
//       );
//     } catch (error) {
//       console.error('Error marking as read:', error);
//       // Don't show alert for read errors to avoid interrupting user flow
//     }
//   };

//   // Delete notification
//   const handleDelete = async (notificationId) => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/notifications/${notificationId}`,
//         {
//           method: 'DELETE',
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to delete notification');
//       }

//       // Remove from local state
//       setNotifications(prev => prev.filter(n => n._id !== notificationId));
//     } catch (error) {
//       console.error('Error deleting notification:', error);
//       Alert.alert('Error', 'Failed to delete notification');
//     }
//   };

//   // Get the effective notification type (use metadata.status if available, otherwise fall back to type)
//   const getNotificationType = (notification) => {
//     return notification.metadata?.status || notification.type;
//   };

//   // Handle notification press - navigate to appropriate screen
//   const handleNotificationPress = (notification) => {
//     const effectiveType = getNotificationType(notification);
//     const { metadata, _id } = notification;
//     const scheduleId = metadata?.schedule_id;
//     const bookingId = metadata?.bookingId;
//     const paymentId = metadata?.paymentId;
//     const propertyId = metadata?.screen_params?.propertyId;
//     const supportTicketId = metadata?.supportTicketId;
//     const chatId = metadata?.chatId;
  
//     // Mark as read first
//     markAsRead(_id);
  
//     // Navigate based on notification type
//     switch (effectiveType) {
//       // === CLEANING REQUEST NOTIFICATIONS ===
//       case 'cleaning_request':
//         if (currentUser.userType === 'cleaner') {
//           navigation.navigate(ROUTES.cleaner_booking_request_detail, { 
//             scheduleId: scheduleId || bookingId,
//             notificationId: _id 
//           });
//         } else {
//           navigation.navigate(ROUTES.host_booking_status, { 
//             scheduleId: scheduleId || bookingId,
//             notificationId: _id 
//           });
//         }
//         break;
  
//       case 'schedule_confirmed':
//         navigation.navigate(ROUTES.host_booking_detail, { 
//           scheduleId: scheduleId || bookingId,
//           notificationId: _id 
//         });
//         break;
  
//       case 'schedule_cancelled':
//         navigation.navigate(ROUTES.host_cancellation_details, { 
//           scheduleId: scheduleId || bookingId,
//           notificationId: _id 
//         });
//         break;
  
//       case 'schedule_reminder':
//         navigation.navigate(ROUTES.host_booking_detail, { 
//           scheduleId: scheduleId || bookingId,
//           notificationId: _id,
//           isReminder: true 
//         });
//         break;
  
//       // === CLEANING STATUS NOTIFICATIONS ===
//       case 'cleaning_started':
//         navigation.navigate(ROUTES.cleaning_status, { 
//           scheduleId: scheduleId || bookingId,
//           notificationId: _id,
//           status: 'started'
//         });
//         break;
  
//       case 'cleaning_completed':
//         navigation.navigate(ROUTES.cleaning_status, { 
//           scheduleId: scheduleId || bookingId,
//           notificationId: _id,
//           status: 'completed'
//         });
//         break;
  
//       case 'cleaning_delayed':
//         navigation.navigate(ROUTES.cleaning_status, { 
//           scheduleId: scheduleId || bookingId,
//           notificationId: _id,
//           status: 'delayed',
//           delayReason: metadata?.delayReason 
//         });
//         break;
  
//       case 'cleaner_on_the_way':
//         if (currentUser.userType === 'host') {
//           navigation.navigate(ROUTES.cleaner_tracking, { 
//             scheduleId: scheduleId || bookingId,
//             notificationId: _id,
//             cleanerLocation: metadata?.cleanerLocation 
//           });
//         }
//         break;

//       // === CLEANER INVITE NOTIFICATIONS ===
//       case 'platform_cleaner_invited':
//         if (currentUser.userType === 'cleaner') {
//           navigation.navigate(ROUTES.cleaner_property_preview, { 
//             notificationId: _id,
//             propertyId:propertyId
//           });
//         }
        
//         break;

//       // === SYSTEM & ALERT NOTIFICATIONS ===
//       case 'system_alert':
//         if (currentUser.userType === 'cleaner') {
//           navigation.navigate(ROUTES.cleaner_all_requests, { 
//             notificationId: _id
//           });
//         } else {
//           navigation.navigate(ROUTES.host_dashboard, { 
//             notificationId: _id
//           });
//         }
//         break;

//       // === PAYMENT NOTIFICATIONS ===
//       case 'payment_received':
//         if (currentUser.userType === 'cleaner') {
//           navigation.navigate(ROUTES.cleaner_earnings, { 
//             paymentId,
//             notificationId: _id 
//           });
//         } else {
//           navigation.navigate(ROUTES.host_payment_history, { 
//             paymentId,
//             notificationId: _id 
//           });
//         }
//         break;
  
//       case 'payment_pending':
//         navigation.navigate(ROUTES.payment_status, { 
//           paymentId,
//           notificationId: _id,
//           status: 'pending'
//         });
//         break;
  
//       case 'payment_failed':
//         navigation.navigate(ROUTES.payment_status, { 
//           paymentId,
//           notificationId: _id,
//           status: 'failed'
//         });
//         break;

//       // Default case for unknown types
//       default:
//         console.log('Unknown notification type:', effectiveType);
//         // Navigate to a generic notification detail or stay on list
//         break;
//     }
//   };

//   // Get notification icon based on type
//   const getNotificationIcon = (notification) => {
//     const effectiveType = getNotificationType(notification);
    
//     const iconMap = {
//       // Cleaning Request & Scheduling
//       cleaning_request: 'calendar-plus',
//       schedule_request: 'calendar-plus',
//       schedule_confirmed: 'calendar-check',
//       schedule_cancelled: 'calendar-remove',
//       schedule_reminder: 'calendar-clock',
//       schedule_modified: 'calendar-edit',
//       schedule_rescheduled: 'calendar-sync',
      
//       // Cleaning Status
//       cleaning_started: 'play-circle',
//       cleaning_completed: 'check-circle',
//       cleaning_delayed: 'clock-alert',
//       cleaner_on_the_way: 'map-marker-path',
      
//       // System & Alert
//       system_alert: 'alert-circle',
      
//       // Payment
//       payment_received: 'credit-card-check',
//       payment_pending: 'clock-outline',
//       payment_failed: 'credit-card-off',
//       payment_refunded: 'cash-refund',
      
//       // Rating & Review
//       rating_received: 'star',
//       review_received: 'comment-text',
      
//       // Account
//       account_verified: 'shield-check',
//       profile_approved: 'account-check',
//       document_expiring: 'file-alert',

//       cleaner_clocked_in: 'clock-check',
//       upcoming_schedule_reminder: 'clock-alert',
//       cleaner_accepted_schedule: 'account-check',
//       payment_confirmed_cleaner: 'cash-check',
//       payment_released: 'cash-fast',
//       payment_reminder: 'clock-alert',
//       automatic_payment_approved: 'robot',
//       cleaner_finished_cleaning: 'check-circle',
//     };
    
//     return iconMap[effectiveType] || 'bell';
//   };

//   // Get notification icon color based on type
//   const getNotificationColor = (notification) => {
//     const effectiveType = getNotificationType(notification);
    
//     const colorMap = {
//       // Cleaning Request & Scheduling
//       cleaning_request: '#FFA500', // Orange
//       schedule_confirmed: '#4CAF50', // Green
//       schedule_cancelled: '#F44336', // Red
//       schedule_reminder: '#2196F3', // Blue
//       schedule_modified: '#FF9800', // Amber
//       schedule_rescheduled: '#9C27B0', // Purple
      
//       // Cleaning Status
//       cleaning_started: '#2196F3', // Blue
//       cleaning_completed: '#4CAF50', // Green
//       cleaning_delayed: '#FF9800', // Amber
//       cleaner_on_the_way: '#9C27B0', // Purple
      
//       // System & Alert
//       system_alert: '#FF5722', // Deep Orange
      
//       // Payment
//       payment_received: '#4CAF50', // Green
//       payment_pending: '#FF9800', // Amber
//       payment_failed: '#F44336', // Red
//       payment_refunded: '#795548', // Brown
      
//       // Rating & Review
//       rating_received: '#FFC107', // Amber
//       review_received: '#FF9800', // Orange
      
//       // Account
//       account_verified: '#4CAF50', // Green
//       profile_approved: '#4CAF50', // Green
//       document_expiring: '#FF9800', // Amber

//       cleaner_clocked_in: '#4CAF50', // Green - positive action
//       upcoming_schedule_reminder: '#FF9800', // Amber/Oange - warning/reminder
//       cleaner_accepted_schedule: '#4CAF50', // Green - positive confirmation
//       payment_confirmed_cleaner: '#4CAF50', // Green - payment success
//       payment_released: '#4CAF50', // Green - money received
//       payment_reminder: '#FF9800', // Amber/Oange - payment due soon
//       automatic_payment_approved: '#2196F3', // Blue - automated process
//       cleaner_finished_cleaning: '#4CAF50', // Green - task completed
//     };
    
//     return colorMap[effectiveType] || '#666';
//   };

//   // Get notification action text based on type
//   const getActionText = (notification) => {
//     const effectiveType = getNotificationType(notification);
    
//     const actionMap = {
//       cleaning_request: currentUser.userType === 'cleaner' ? 'View Request' : 'View Status',
//       schedule_confirmed: 'View Booking',
//       schedule_cancelled: 'View Details',
//       schedule_reminder: 'View Booking',
//       schedule_modified: 'View Changes',
//       schedule_rescheduled: 'View New Time',
      
//       cleaning_started: 'View Progress',
//       cleaning_completed: 'View Completion',
//       cleaning_delayed: 'View Details',
//       cleaner_on_the_way: 'Track Cleaner',
      
//       system_alert: 'View Details',
      
//       payment_received: 'View Details',
//       payment_pending: 'View Status',
//       payment_failed: 'Retry Payment',
//       payment_refunded: 'View Refund',
      
//       rating_received: 'View Rating',
//       review_received: 'Read Review',
      
//       account_verified: 'View Profile',
//       profile_approved: 'View Profile',
//       document_expiring: 'Update Documents',

//       cleaner_clocked_in: 'View Schedule',
//       upcoming_schedule_reminder: 'View Details',
//       cleaner_accepted_schedule: 'View Schedule',
//       payment_confirmed_cleaner: 'View Payment',
//       payment_released: 'View Earnings',
//       payment_reminder: 'Make Payment',
//       automatic_payment_approved: 'View Details',
//       cleaner_finished_cleaning: 'View Completion',
//       platform_cleaner_invited: 'View Property',
//     };
    
//     return actionMap[effectiveType] || 'View Details';
//   };

//   // Format time ago
//   const formatTimeAgo = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
//     return date.toLocaleDateString();
//   };

//   // Check if notification is unread
//   const isUnread = (notification) => {
//     return notification.status === 'sent' || notification.status === 'delivered';
//   };

//   // Swipeable delete action
//   const renderRightActions = (notificationId) => (
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => {
//         Alert.alert(
//           'Delete Notification',
//           'Are you sure you want to delete this notification?',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Delete', style: 'destructive', onPress: () => handleDelete(notificationId) },
//           ]
//         );
//       }}
//     >
//       <MaterialCommunityIcons name="trash-can" size={24} color="white" />
//     </TouchableOpacity>
//   );

//   // Render each notification item
//   const renderItem = ({ item }) => (
//     <Swipeable renderRightActions={() => renderRightActions(item._id)}>
//       <TouchableOpacity 
//         style={[
//           styles.notificationCard, 
//           isUnread(item) && styles.unreadCard
//         ]}
//         onPress={() => handleNotificationPress(item)}
//       >
//         <MaterialCommunityIcons
//           name={getNotificationIcon(item)}
//           size={30}
//           color={getNotificationColor(item)}
//           style={styles.notificationIcon}
//         />
        
//         <View style={styles.notificationContent}>
//           <View style={styles.notificationHeader}>
//             <Text style={styles.title}>{item.title}</Text>
//             {isUnread(item) && <View style={styles.unreadDot} />}
//           </View>
          
//           <Text style={styles.message} numberOfLines={2}>
//             {item.message}
//           </Text>
          
//           <View style={styles.notificationFooter}>
//             <View style={styles.footerLeft}>
//               <Text style={styles.time}>
//                 {formatTimeAgo(item.sentAt?.$date || item.createdAt?.$date || item.sentAt || item.createdAt)}
//               </Text>
              
//               {item.metadata?.schedule_id && (
//                 <Text style={styles.scheduleId}>
//                   Schedule: {item.metadata.schedule_id.substring(0, 8)}...
//                 </Text>
//               )}
//             </View>
            
//             <View style={styles.actionIndicator}>
//               <Text style={styles.actionText}>
//                 {getActionText(item)}
//               </Text>
//               <MaterialCommunityIcons 
//                 name="chevron-right" 
//                 size={16} 
//                 color="#007AFF" 
//               />
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Swipeable>
//   );

//   // Filter notifications based on unread toggle
//   const filteredNotifications = showUnreadOnly
//     ? notifications.filter(n => isUnread(n))
//     : notifications;

//   // Pull to refresh
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchNotifications();
//   }, []);

//   // Load notifications when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchNotifications();
//     }, [currentUser._id, currentUser.userType])
//   );

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading notifications...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerRow}>
//           <Text style={styles.headerTitle}>Notifications</Text>
          
//           <TouchableOpacity 
//             onPress={() => setShowUnreadOnly(prev => !prev)}
//             style={styles.filterButton}
//           >
//             <MaterialCommunityIcons
//               name={showUnreadOnly ? 'filter-off' : 'filter'}
//               size={26}
//               color="#007AFF"
//             />
//             <Text style={styles.filterText}>
//               {showUnreadOnly ? 'Show All' : 'Unread Only'}
//             </Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.statsRow}>
//           <Text style={styles.statsText}>
//             {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
//             {showUnreadOnly && ` (${notifications.filter(n => isUnread(n)).length} unread)`}
//           </Text>
          
//           {notifications.filter(n => isUnread(n)).length > 0 && (
//             <TouchableOpacity 
//               onPress={async () => {
//                 // Mark all as read
//                 const unreadNotifications = notifications.filter(n => isUnread(n));
//                 for (const notification of unreadNotifications) {
//                   await markAsRead(notification._id);
//                 }
//               }}
//             >
//               <Text style={styles.markAllReadText}>Mark all read</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <FlatList
//         data={filteredNotifications}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <MaterialCommunityIcons 
//               name="bell-off" 
//               size={64} 
//               color="#CCCCCC" 
//             />
//             <Text style={styles.emptyText}>
//               {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
//             </Text>
//             <Text style={styles.emptySubtext}>
//               {showUnreadOnly ? 'You\'re all caught up!' : 'Notifications will appear here'}
//             </Text>
//           </View>
//         }
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     paddingTop: 60,
//   },
//   centerContainer: {
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
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//   },
//   filterText: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   statsText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   markAllReadText: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 16,
//     paddingTop: 8,
//   },
//   notificationCard: {
//     flexDirection: 'row',
//     padding: 16,
//     marginBottom: 12,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   unreadCard: {
//     backgroundColor: '#E7F3FF',
//     borderColor: '#B3D9FF',
//   },
//   notificationIcon: {
//     marginRight: 12,
//     width: 40,
//     height: 40,
//     textAlign: 'center',
//     textAlignVertical: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//   },
//   notificationContent: {
//     flex: 1,
//   },
//   notificationHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     flex: 1,
//   },
//   unreadDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#007AFF',
//     marginLeft: 8,
//     marginTop: 6,
//   },
//   message: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   notificationFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   footerLeft: {
//     flex: 1,
//   },
//   time: {
//     fontSize: 12,
//     color: '#999',
//   },
//   scheduleId: {
//     fontSize: 11,
//     color: '#999',
//     fontFamily: 'monospace',
//     marginTop: 2,
//   },
//   actionIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 12,
//     color: '#007AFF',
//     fontWeight: '500',
//     marginRight: 4,
//   },
//   deleteButton: {
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 80,
//     marginVertical: 6,
//     borderRadius: 12,
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 80,
//     paddingHorizontal: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });

// export default Notification;




import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';

// API base URL - adjust based on your environment
const API_BASE_URL = 'https://www.freshsweeper.com/api'; // Change to your actual API URL

const Notification = () => {
  const { currentUser, updateNotificationUnreadCount } = useContext(AuthContext); // ✅ get updater

  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Compute unread count from list
  const computeUnreadCount = (list) => {
    return list.filter(n => n.status === 'sent' || n.status === 'delivered').length;
  };

  // Update unread count in context whenever notifications change
  useEffect(() => {
    updateNotificationUnreadCount(computeUnreadCount(notifications));
  }, [notifications, updateNotificationUnreadCount]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${currentUser._id}?userType=${currentUser.userType}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, status: 'read', readAt: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      // Don't show alert for read errors to avoid interrupting user flow
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  // Get the effective notification type (use metadata.status if available, otherwise fall back to type)
  const getNotificationType = (notification) => {
    return notification.metadata?.status || notification.type;
  };

  // Handle notification press - navigate to appropriate screen
  const handleNotificationPress = (notification) => {
    const effectiveType = getNotificationType(notification);
    const { metadata, _id } = notification;
    const scheduleId = metadata?.schedule_id;
    const bookingId = metadata?.bookingId;
    const paymentId = metadata?.paymentId;
    const propertyId = metadata?.screen_params?.propertyId;
    const supportTicketId = metadata?.supportTicketId;
    const chatId = metadata?.chatId;
  
    // Mark as read first
    markAsRead(_id);
  
    // Navigate based on notification type
    switch (effectiveType) {
      // === CLEANING REQUEST NOTIFICATIONS ===
      case 'cleaning_request':
        if (currentUser.userType === 'cleaner') {
          navigation.navigate(ROUTES.cleaner_booking_request_detail, { 
            scheduleId: scheduleId || bookingId,
            notificationId: _id 
          });
        } else {
          navigation.navigate(ROUTES.host_booking_status, { 
            scheduleId: scheduleId || bookingId,
            notificationId: _id 
          });
        }
        break;
  
      case 'schedule_confirmed':
        navigation.navigate(ROUTES.host_booking_detail, { 
          scheduleId: scheduleId || bookingId,
          notificationId: _id 
        });
        break;
  
      case 'schedule_cancelled':
        navigation.navigate(ROUTES.host_cancellation_details, { 
          scheduleId: scheduleId || bookingId,
          notificationId: _id 
        });
        break;
  
      case 'schedule_reminder':
        navigation.navigate(ROUTES.host_booking_detail, { 
          scheduleId: scheduleId || bookingId,
          notificationId: _id,
          isReminder: true 
        });
        break;
  
      // === CLEANING STATUS NOTIFICATIONS ===
      case 'cleaning_started':
        navigation.navigate(ROUTES.cleaning_status, { 
          scheduleId: scheduleId || bookingId,
          notificationId: _id,
          status: 'started'
        });
        break;
  
      case 'cleaning_completed':
        navigation.navigate(ROUTES.cleaning_status, { 
          scheduleId: scheduleId || bookingId,
          notificationId: _id,
          status: 'completed'
        });
        break;
  
      case 'cleaning_delayed':
        navigation.navigate(ROUTES.cleaning_status, { 
          scheduleId: scheduleId || bookingId,
          notificationId: _id,
          status: 'delayed',
          delayReason: metadata?.delayReason 
        });
        break;
  
      case 'cleaner_on_the_way':
        if (currentUser.userType === 'host') {
          navigation.navigate(ROUTES.cleaner_tracking, { 
            scheduleId: scheduleId || bookingId,
            notificationId: _id,
            cleanerLocation: metadata?.cleanerLocation 
          });
        }
        break;

      // === CLEANER INVITE NOTIFICATIONS ===
      case 'platform_cleaner_invited':
        if (currentUser.userType === 'cleaner') {
          navigation.navigate(ROUTES.cleaner_property_preview, { 
            notificationId: _id,
            propertyId:propertyId
          });
        }
        
        break;

      // === SYSTEM & ALERT NOTIFICATIONS ===
      case 'system_alert':
        if (currentUser.userType === 'cleaner') {
          navigation.navigate(ROUTES.cleaner_all_requests, { 
            notificationId: _id
          });
        } else {
          navigation.navigate(ROUTES.host_dashboard, { 
            notificationId: _id
          });
        }
        break;

      // === PAYMENT NOTIFICATIONS ===
      case 'payment_received':
        if (currentUser.userType === 'cleaner') {
          navigation.navigate(ROUTES.cleaner_earnings, { 
            paymentId,
            notificationId: _id 
          });
        } else {
          navigation.navigate(ROUTES.host_payment_history, { 
            paymentId,
            notificationId: _id 
          });
        }
        break;
  
      case 'payment_pending':
        navigation.navigate(ROUTES.payment_status, { 
          paymentId,
          notificationId: _id,
          status: 'pending'
        });
        break;
  
      case 'payment_failed':
        navigation.navigate(ROUTES.payment_status, { 
          paymentId,
          notificationId: _id,
          status: 'failed'
        });
        break;

      // Default case for unknown types
      default:
        console.log('Unknown notification type:', effectiveType);
        // Navigate to a generic notification detail or stay on list
        break;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    const effectiveType = getNotificationType(notification);
    
    const iconMap = {
      // Cleaning Request & Scheduling
      cleaning_request: 'calendar-plus',
      schedule_request: 'calendar-plus',
      schedule_confirmed: 'calendar-check',
      schedule_cancelled: 'calendar-remove',
      schedule_reminder: 'calendar-clock',
      schedule_modified: 'calendar-edit',
      schedule_rescheduled: 'calendar-sync',
      
      // Cleaning Status
      cleaning_started: 'play-circle',
      cleaning_completed: 'check-circle',
      cleaning_delayed: 'clock-alert',
      cleaner_on_the_way: 'map-marker-path',
      
      // System & Alert
      system_alert: 'alert-circle',
      
      // Payment
      payment_received: 'credit-card-check',
      payment_pending: 'clock-outline',
      payment_failed: 'credit-card-off',
      payment_refunded: 'cash-refund',
      
      // Rating & Review
      rating_received: 'star',
      review_received: 'comment-text',
      
      // Account
      account_verified: 'shield-check',
      profile_approved: 'account-check',
      document_expiring: 'file-alert',

      cleaner_clocked_in: 'clock-check',
      upcoming_schedule_reminder: 'clock-alert',
      cleaner_accepted_schedule: 'account-check',
      payment_confirmed_cleaner: 'cash-check',
      payment_released: 'cash-fast',
      payment_reminder: 'clock-alert',
      automatic_payment_approved: 'robot',
      cleaner_finished_cleaning: 'check-circle',
    };
    
    return iconMap[effectiveType] || 'bell';
  };

  // Get notification icon color based on type
  const getNotificationColor = (notification) => {
    const effectiveType = getNotificationType(notification);
    
    const colorMap = {
      // Cleaning Request & Scheduling
      cleaning_request: '#FFA500', // Orange
      schedule_confirmed: '#4CAF50', // Green
      schedule_cancelled: '#F44336', // Red
      schedule_reminder: '#2196F3', // Blue
      schedule_modified: '#FF9800', // Amber
      schedule_rescheduled: '#9C27B0', // Purple
      
      // Cleaning Status
      cleaning_started: '#2196F3', // Blue
      cleaning_completed: '#4CAF50', // Green
      cleaning_delayed: '#FF9800', // Amber
      cleaner_on_the_way: '#9C27B0', // Purple
      
      // System & Alert
      system_alert: '#FF5722', // Deep Orange
      
      // Payment
      payment_received: '#4CAF50', // Green
      payment_pending: '#FF9800', // Amber
      payment_failed: '#F44336', // Red
      payment_refunded: '#795548', // Brown
      
      // Rating & Review
      rating_received: '#FFC107', // Amber
      review_received: '#FF9800', // Orange
      
      // Account
      account_verified: '#4CAF50', // Green
      profile_approved: '#4CAF50', // Green
      document_expiring: '#FF9800', // Amber

      cleaner_clocked_in: '#4CAF50', // Green - positive action
      upcoming_schedule_reminder: '#FF9800', // Amber/Oange - warning/reminder
      cleaner_accepted_schedule: '#4CAF50', // Green - positive confirmation
      payment_confirmed_cleaner: '#4CAF50', // Green - payment success
      payment_released: '#4CAF50', // Green - money received
      payment_reminder: '#FF9800', // Amber/Oange - payment due soon
      automatic_payment_approved: '#2196F3', // Blue - automated process
      cleaner_finished_cleaning: '#4CAF50', // Green - task completed
    };
    
    return colorMap[effectiveType] || '#666';
  };

  // Get notification action text based on type
  const getActionText = (notification) => {
    const effectiveType = getNotificationType(notification);
    
    const actionMap = {
      cleaning_request: currentUser.userType === 'cleaner' ? 'View Request' : 'View Status',
      schedule_confirmed: 'View Booking',
      schedule_cancelled: 'View Details',
      schedule_reminder: 'View Booking',
      schedule_modified: 'View Changes',
      schedule_rescheduled: 'View New Time',
      
      cleaning_started: 'View Progress',
      cleaning_completed: 'View Completion',
      cleaning_delayed: 'View Details',
      cleaner_on_the_way: 'Track Cleaner',
      
      system_alert: 'View Details',
      
      payment_received: 'View Details',
      payment_pending: 'View Status',
      payment_failed: 'Retry Payment',
      payment_refunded: 'View Refund',
      
      rating_received: 'View Rating',
      review_received: 'Read Review',
      
      account_verified: 'View Profile',
      profile_approved: 'View Profile',
      document_expiring: 'Update Documents',

      cleaner_clocked_in: 'View Schedule',
      upcoming_schedule_reminder: 'View Details',
      cleaner_accepted_schedule: 'View Schedule',
      payment_confirmed_cleaner: 'View Payment',
      payment_released: 'View Earnings',
      payment_reminder: 'Make Payment',
      automatic_payment_approved: 'View Details',
      cleaner_finished_cleaning: 'View Completion',
      platform_cleaner_invited: 'View Property',
    };
    
    return actionMap[effectiveType] || 'View Details';
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Check if notification is unread
  const isUnread = (notification) => {
    return notification.status === 'sent' || notification.status === 'delivered';
  };

  // Swipeable delete action
  const renderRightActions = (notificationId) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        Alert.alert(
          'Delete Notification',
          'Are you sure you want to delete this notification?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(notificationId) },
          ]
        );
      }}
    >
      <MaterialCommunityIcons name="trash-can" size={24} color="white" />
    </TouchableOpacity>
  );

  // Render each notification item
  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item._id)}>
      <TouchableOpacity 
        style={[
          styles.notificationCard, 
          isUnread(item) && styles.unreadCard
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <MaterialCommunityIcons
          name={getNotificationIcon(item)}
          size={30}
          color={getNotificationColor(item)}
          style={styles.notificationIcon}
        />
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.title}>{item.title}</Text>
            {isUnread(item) && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          
          <View style={styles.notificationFooter}>
            <View style={styles.footerLeft}>
              <Text style={styles.time}>
                {formatTimeAgo(item.sentAt?.$date || item.createdAt?.$date || item.sentAt || item.createdAt)}
              </Text>
              
              {/* {item.metadata?.schedule_id && (
                <Text style={styles.scheduleId}>
                  Schedule: {item.metadata.schedule_id.substring(0, 8)}...
                </Text>
              )} */}
            </View>
            
            <View style={styles.actionIndicator}>
              <Text style={styles.actionText}>
                {getActionText(item)}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={16} 
                color="#007AFF" 
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  // Filter notifications based on unread toggle
  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => isUnread(n))
    : notifications;

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  // Load notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [currentUser._id, currentUser.userType])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          
          <TouchableOpacity 
            onPress={() => setShowUnreadOnly(prev => !prev)}
            style={styles.filterButton}
          >
            <MaterialCommunityIcons
              name={showUnreadOnly ? 'filter-off' : 'filter'}
              size={26}
              color="#007AFF"
            />
            <Text style={styles.filterText}>
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            {showUnreadOnly && ` (${notifications.filter(n => isUnread(n)).length} unread)`}
          </Text>
          
          {notifications.filter(n => isUnread(n)).length > 0 && (
            <TouchableOpacity 
              onPress={async () => {
                // Mark all as read
                const unreadNotifications = notifications.filter(n => isUnread(n));
                for (const notification of unreadNotifications) {
                  await markAsRead(notification._id);
                }
              }}
            >
              <Text style={styles.markAllReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="bell-off" 
              size={64} 
              color="#CCCCCC" 
            />
            <Text style={styles.emptyText}>
              {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showUnreadOnly ? 'You\'re all caught up!' : 'Notifications will appear here'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginLeft: 4,
    color: '#007AFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  markAllReadText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  scheduleId: {
    fontSize: 12,
    color: '#999',
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    color: '#007AFF',
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginVertical: 4,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default Notification;