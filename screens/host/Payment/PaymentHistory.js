// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import ROUTES from '../../../constants/routes';

// const PaymentHistory = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { bookingId, notificationId } = route.params || {};

//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const filters = [
//     { id: 'all', label: 'All Payments' },
//     { id: 'completed', label: 'Completed' },
//     { id: 'pending', label: 'Pending' },
//     { id: 'failed', label: 'Failed' },
//   ];

//   // Mock data - replace with actual API call
//   useEffect(() => {
//     const fetchPaymentHistory = async () => {
//       try {
//         // Simulate API call
//         setTimeout(() => {
//           setPayments([
//             {
//               id: '1',
//               date: '2024-01-20T14:00:00Z',
//               amount: 85.00,
//               service: 'Deep Cleaning',
//               cleaner: 'John Cleaner',
//               status: 'completed',
//               paymentMethod: '•••• 4242',
//               bookingId: 'BK001234',
//               receiptUrl: '#',
//             },
//             {
//               id: '2',
//               date: '2024-01-15T10:00:00Z',
//               amount: 120.00,
//               service: 'Move Out Cleaning',
//               cleaner: 'Sarah Professional',
//               status: 'completed',
//               paymentMethod: '•••• 4242',
//               bookingId: 'BK001233',
//               receiptUrl: '#',
//             },
//             {
//               id: '3',
//               date: '2024-01-10T09:00:00Z',
//               amount: 65.00,
//               service: 'Standard Cleaning',
//               cleaner: 'Mike Cleaner',
//               status: 'completed',
//               paymentMethod: '•••• 4242',
//               bookingId: 'BK001232',
//               receiptUrl: '#',
//             },
//             {
//               id: '4',
//               date: '2024-01-25T16:00:00Z',
//               amount: 95.00,
//               service: 'Deep Cleaning',
//               cleaner: 'Emily Cleaner',
//               status: 'pending',
//               paymentMethod: '•••• 4242',
//               bookingId: 'BK001235',
//               receiptUrl: '#',
//             },
//           ]);
//           setLoading(false);
//         }, 1000);
//       } catch (error) {
//         setLoading(false);
//       }
//     };

//     fetchPaymentHistory();
//   }, []);

//   const filteredPayments = payments.filter(payment => {
//     if (selectedFilter === 'all') return true;
//     return payment.status === selectedFilter;
//   });

//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       pending: '#FF9500',
//       failed: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusIcon = (status) => {
//     const iconMap = {
//       completed: 'check-circle',
//       pending: 'clock-outline',
//       failed: 'close-circle',
//     };
//     return iconMap[status] || 'help-circle';
//   };

//   const formatCurrency = (amount) => {
//     return `$${amount.toFixed(2)}`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const handleViewReceipt = (payment) => {
//     // In a real app, this would open the receipt PDF or web view
//     navigation.navigate(ROUTES.host_receipt_details, { payment });
//   };

//   const handleViewBooking = (bookingId) => {
//     navigation.navigate(ROUTES.host_receipt_details, { bookingId });
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading payment history...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Payment History</Text>
//         <TouchableOpacity style={styles.helpButton}>
//           <MaterialCommunityIcons name="download" size={24} color="#007AFF" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>
//           {/* Summary Cards */}
//           <View style={styles.summaryCards}>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>Total Spent</Text>
//               <Text style={styles.summaryAmount}>
//                 {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
//               </Text>
//               <Text style={styles.summarySubtext}>All time</Text>
//             </View>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>Services Booked</Text>
//               <Text style={styles.summaryAmount}>{payments.length}</Text>
//               <Text style={styles.summarySubtext}>Completed</Text>
//             </View>
//           </View>

//           {/* Filter Tabs */}
//           <View style={styles.filterTabs}>
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
//           </View>

//           {/* Payment List */}
//           <View style={styles.paymentList}>
//             {filteredPayments.length > 0 ? (
//               filteredPayments.map((payment) => (
//                 <View key={payment.id} style={styles.paymentCard}>
//                   <View style={styles.paymentHeader}>
//                     <View style={styles.paymentInfo}>
//                       <Text style={styles.paymentService}>{payment.service}</Text>
//                       <Text style={styles.paymentCleaner}>{payment.cleaner}</Text>
//                       <Text style={styles.paymentDate}>
//                         {formatDate(payment.date)}
//                       </Text>
//                     </View>
//                     <View style={styles.paymentAmountContainer}>
//                       <Text style={styles.paymentAmount}>
//                         {formatCurrency(payment.amount)}
//                       </Text>
//                       <View style={styles.statusBadge}>
//                         <MaterialCommunityIcons
//                           name={getStatusIcon(payment.status)}
//                           size={12}
//                           color={getStatusColor(payment.status)}
//                         />
//                         <Text
//                           style={[
//                             styles.statusText,
//                             { color: getStatusColor(payment.status) },
//                           ]}
//                         >
//                           {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <View style={styles.paymentDetails}>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Booking ID:</Text>
//                       <TouchableOpacity onPress={() => handleViewBooking(payment.bookingId)}>
//                         <Text style={styles.bookingId}>{payment.bookingId}</Text>
//                       </TouchableOpacity>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Payment Method:</Text>
//                       <Text style={styles.detailValue}>{payment.paymentMethod}</Text>
//                     </View>
//                   </View>

//                   <View style={styles.paymentActions}>
//                     <TouchableOpacity 
//                       style={styles.receiptButton}
//                       onPress={() => handleViewReceipt(payment)}
//                     >
//                       <MaterialCommunityIcons name="file-document" size={16} color="#007AFF" />
//                       <Text style={styles.receiptButtonText}>View Receipt</Text>
//                     </TouchableOpacity>
                    
//                     {payment.status === 'failed' && (
//                       <TouchableOpacity style={styles.retryButton}>
//                         <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
//                         <Text style={styles.retryButtonText}>Retry Payment</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <MaterialCommunityIcons 
//                   name="credit-card-off" 
//                   size={64} 
//                   color="#CCCCCC" 
//                 />
//                 <Text style={styles.emptyStateText}>No payments found</Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   {selectedFilter === 'all' 
//                     ? 'You haven\'t made any payments yet' 
//                     : `No ${selectedFilter} payments`
//                   }
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Help Section */}
//           <View style={styles.helpSection}>
//             <Text style={styles.helpTitle}>Need help with a payment?</Text>
//             <Text style={styles.helpText}>
//               If you have questions about a charge or need to dispute a payment, 
//               our support team is here to help.
//             </Text>
//             <TouchableOpacity style={styles.contactSupportButton}>
//               <MaterialCommunityIcons name="headset" size={20} color="#007AFF" />
//               <Text style={styles.contactSupportText}>Contact Support</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   helpButton: {
//     padding: 8,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
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
//   summaryCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   summaryAmount: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   summarySubtext: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   filterTabs: {
//     flexDirection: 'row',
//     marginBottom: 24,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 4,
//   },
//   filterTab: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   filterTabActive: {
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   filterTabText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#666',
//   },
//   filterTabTextActive: {
//     color: '#007AFF',
//     fontWeight: '600',
//   },
//   paymentList: {
//     marginBottom: 24,
//   },
//   paymentCard: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   paymentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   paymentInfo: {
//     flex: 1,
//   },
//   paymentService: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   paymentCleaner: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   paymentDate: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   paymentAmountContainer: {
//     alignItems: 'flex-end',
//   },
//   paymentAmount: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   paymentDetails: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontSize: 12,
//     color: '#666',
//   },
//   detailValue: {
//     fontSize: 12,
//     color: '#1A1A1A',
//     fontWeight: '500',
//   },
//   bookingId: {
//     fontSize: 12,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   paymentActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   receiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#007AFF',
//   },
//   receiptButtonText: {
//     fontSize: 12,
//     color: '#007AFF',
//     fontWeight: '500',
//     marginLeft: 4,
//   },
//   retryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#FF3B30',
//     borderRadius: 6,
//   },
//   retryButtonText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     fontWeight: '500',
//     marginLeft: 4,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
//   emptyStateText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateSubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//   },
//   helpSection: {
//     backgroundColor: '#E7F3FF',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#B3D9FF',
//   },
//   helpTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#007AFF',
//     marginBottom: 8,
//   },
//   helpText: {
//     fontSize: 14,
//     color: '#007AFF',
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   contactSupportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#007AFF',
//   },
//   contactSupportText: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
// });

// export default PaymentHistory;



// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import ROUTES from '../../../constants/routes';
// import COLORS from '../../../constants/colors'; // Import COLORS
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';

// const PaymentHistory = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { bookingId, notificationId } = route.params || {};

//   const {currentUserId, fbaseUser, currentUser} = useContext(AuthContext)

//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const filters = [
//     { id: 'all', label: 'All Schedules' },
//     { id: 'completed', label: 'Completed' },
//     { id: 'in_progress', label: 'In Progress' },
//     { id: 'pending_payment', label: 'Pending Payment' },
//     { id: 'cancelled', label: 'Cancelled' },
//   ];

//   // Fetch schedules from your API
//   useEffect(() => {
//     const fetchSchedules = async () => {
//       try {
//         setLoading(true);
//         // TODO: Replace with actual API call
//         // const response = await yourApiService.getSchedules();
//         // setSchedules(response.data);
        
//         // Mock data based on your structure
//         await userService.getSchedulesByHostId(currentUserId).then((response) => {
//         const res = response.data;

       


        
//         const mockSchedules = [
//           {
//             _id: "692f41bd5d4bcbac71dc9666",
//             hostInfo: {
//               userId: "68844853b4c35a50a4de2830",
//               firstname: "Chinedu",
//               lastname: "Njoku",
//               email: "flavoursoft@gmail.com"
//             },
//             schedule: {
//               aptId: "690d7f014780669e4a7b9566",
//               apartment_name: "Bellview Apartment",
//               address: "500 South 17th Street, Newark, NJ, USA",
//               apartment_latitude: 40.7387,
//               apartment_longitude: -74.2079,
//               cleaning_date: "2025-12-04",
//               cleaning_time: "11:00:00",
//               cleaning_end_time: "13:14:57",
//               total_cleaning_fee: 135,
//               total_cleaning_time: 130,
//               selected_apt_room_type_and_size: [
//                 {
//                   type: "Bedroom",
//                   number: 3,
//                   size: 120,
//                   size_range: "Small"
//                 },
//                 {
//                   type: "Bathroom",
//                   number: 2,
//                   size: 120,
//                   size_range: "Small"
//                 },
//                 {
//                   type: "Livingroom",
//                   number: 1,
//                   size: 150,
//                   size_range: "Medium"
//                 },
//                 {
//                   type: "Kitchen",
//                   number: 1,
//                   size: 140,
//                   size_range: "Small"
//                 }
//               ]
//             },
//             platform: "manual",
//             ical_uid: "",
//             status: "pending_payment",
//             overall_checklist: {
//               totalFee: 134.96,
//               totalTime: 156.2,
//             },
//             created_at: {
//               "$date": "2025-12-02T19:45:01.302Z"
//             },
//             assignedTo: [
//               {
//                 group: "group_1",
//                 cleanerId: "68ea06afb7bd4cdee9e59cfa",
//                 status: "selected"
//               },
//               {
//                 group: "group_2",
//                 cleanerId: "68e9f0a9fa852e2c3186bc0b",
//                 status: "selected"
//               }
//             ]
//           },
//           {
//             _id: "692f41bd5d4bcbac71dc9667",
//             hostInfo: {
//               firstname: "John",
//               lastname: "Doe",
//               email: "john@example.com"
//             },
//             schedule: {
//               apartment_name: "Sunset Villa",
//               address: "123 Main St, New York, NY",
//               cleaning_date: "2025-12-05",
//               cleaning_time: "09:00:00",
//               total_cleaning_fee: 185,
//               total_cleaning_time: 180,
//             },
//             status: "completed",
//             overall_checklist: {
//               totalFee: 185,
//               totalTime: 180,
//             },
//             created_at: {
//               "$date": "2025-11-28T10:30:00.000Z"
//             },
//             assignedTo: [
//               {
//                 group: "group_1",
//                 status: "completed"
//               }
//             ]
//           },
//           {
//             _id: "692f41bd5d4bcbac71dc9668",
//             hostInfo: {
//               firstname: "Jane",
//               lastname: "Smith",
//               email: "jane@example.com"
//             },
//             schedule: {
//               apartment_name: "River View Apartments",
//               address: "456 Oak Ave, Chicago, IL",
//               cleaning_date: "2025-12-06",
//               cleaning_time: "14:00:00",
//               total_cleaning_fee: 95,
//               total_cleaning_time: 90,
//             },
//             status: "in_progress",
//             overall_checklist: {
//               totalFee: 95,
//               totalTime: 90,
//             },
//             created_at: {
//               "$date": "2025-11-30T15:45:00.000Z"
//             },
//             assignedTo: [
//               {
//                 group: "group_1",
//                 status: "in_progress"
//               }
//             ]
//           }
//         ];
        
//         setSchedules(mockSchedules);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching schedules:', error);
//         Alert.alert('Error', 'Failed to load schedule history');
//         setLoading(false);
//       }
//     };

//     fetchSchedules();
//   }, []);

//   const filteredSchedules = schedules.filter(schedule => {
//     if (selectedFilter === 'all') return true;
//     return schedule.status === selectedFilter;
//   });

//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       in_progress: COLORS.primary, // Use primary color
//       pending_payment: '#FF9500',
//       assigned: '#5856D6',
//       scheduled: '#5AC8FA',
//       cancelled: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusIcon = (status) => {
//     const iconMap = {
//       completed: 'check-circle',
//       in_progress: 'progress-clock',
//       pending_payment: 'clock-outline',
//       assigned: 'account-check',
//       scheduled: 'calendar-clock',
//       cancelled: 'close-circle',
//     };
//     return iconMap[status] || 'help-circle';
//   };

//   const getStatusLabel = (status) => {
//     const labelMap = {
//       completed: 'Completed',
//       in_progress: 'In Progress',
//       pending_payment: 'Pending Payment',
//       assigned: 'Assigned',
//       scheduled: 'Scheduled',
//       cancelled: 'Cancelled',
//     };
//     return labelMap[status] || status;
//   };

//   const formatCurrency = (amount) => {
//     return `$${amount?.toFixed(2) || '0.00'}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     const time = timeString.split(':');
//     const hours = parseInt(time[0]);
//     const minutes = time[1];
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${minutes} ${ampm}`;
//   };

//   const getCleaningDate = (schedule) => {
//     const date = schedule?.cleaning_date;
//     const time = schedule?.cleaning_time;
//     if (!date) return 'No date set';
    
//     const formattedDate = formatDate(date);
//     const formattedTime = formatTime(time);
    
//     return `${formattedDate} ${formattedTime ? `• ${formattedTime}` : ''}`;
//   };

//   const handleViewSchedule = (scheduleId) => {
//     navigation.navigate(ROUTES.host_schedule_details, { 
//       scheduleId,
//       fromHistory: true 
//     });
//   };

//   const handleViewReceipt = (schedule) => {
//     navigation.navigate(ROUTES.host_receipt_details, { 
//       scheduleId: schedule._id,
//       scheduleData: schedule 
//     });
//   };

//   const handleExportData = () => {
//     // TODO: Implement export functionality
//     Alert.alert('Export', 'Export functionality to be implemented');
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter(s => s.status === 'completed')
//       .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || 0), 0);
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading schedule history...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Schedule History</Text>
//         <TouchableOpacity 
//           style={styles.helpButton}
//           onPress={handleExportData}
//         >
//           <MaterialCommunityIcons name="download" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>
//           {/* Summary Cards */}
//           <View style={styles.summaryCards}>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>Total Spent</Text>
//               <Text style={styles.summaryAmount}>
//                 {formatCurrency(calculateTotalSpent())}
//               </Text>
//               <Text style={styles.summarySubtext}>Completed schedules</Text>
//             </View>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>Total Bookings</Text>
//               <Text style={styles.summaryAmount}>{schedules.length}</Text>
//               <Text style={styles.summarySubtext}>All schedules</Text>
//             </View>
//           </View>

//           {/* Filter Tabs */}
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             style={styles.filterTabsContainer}
//           >
//             <View style={styles.filterTabs}>
//               {filters.map((filter) => (
//                 <TouchableOpacity
//                   key={filter.id}
//                   style={[
//                     styles.filterTab,
//                     selectedFilter === filter.id && styles.filterTabActive,
//                   ]}
//                   onPress={() => setSelectedFilter(filter.id)}
//                 >
//                   <Text
//                     style={[
//                       styles.filterTabText,
//                       selectedFilter === filter.id && styles.filterTabTextActive,
//                     ]}
//                   >
//                     {filter.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>

//           {/* Schedule List */}
//           <View style={styles.scheduleList}>
//             {filteredSchedules.length > 0 ? (
//               filteredSchedules.map((schedule) => (
//                 <View key={schedule._id} style={styles.scheduleCard}>
//                   <View style={styles.scheduleHeader}>
//                     <View style={styles.scheduleInfo}>
//                       <View style={styles.scheduleTitleRow}>
//                         <MaterialCommunityIcons 
//                           name="office-building" 
//                           size={20} 
//                           color="#666" 
//                         />
//                         <Text style={styles.scheduleApartment}>
//                           {schedule.schedule?.apartment_name || 'Unnamed Apartment'}
//                         </Text>
//                       </View>
//                       <Text style={styles.scheduleAddress} numberOfLines={1}>
//                         {schedule.schedule?.address || 'No address provided'}
//                       </Text>
//                       <View style={styles.scheduleMeta}>
//                         <View style={styles.metaItem}>
//                           <MaterialCommunityIcons 
//                             name="calendar" 
//                             size={14} 
//                             color="#8E8E93" 
//                           />
//                           <Text style={styles.metaText}>
//                             {getCleaningDate(schedule.schedule)}
//                           </Text>
//                         </View>
//                         {schedule.assignedTo?.length > 0 && (
//                           <View style={styles.metaItem}>
//                             <MaterialCommunityIcons 
//                               name="account-group" 
//                               size={14} 
//                               color="#8E8E93" 
//                             />
//                             <Text style={styles.metaText}>
//                               {schedule.assignedTo.length} cleaner{schedule.assignedTo.length > 1 ? 's' : ''}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                     </View>
//                     <View style={styles.scheduleAmountContainer}>
//                       <Text style={styles.scheduleAmount}>
//                         {formatCurrency(schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0)}
//                       </Text>
//                       <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) + '20' }]}>
//                         <MaterialCommunityIcons
//                           name={getStatusIcon(schedule.status)}
//                           size={12}
//                           color={getStatusColor(schedule.status)}
//                         />
//                         <Text
//                           style={[
//                             styles.statusText,
//                             { color: getStatusColor(schedule.status) },
//                           ]}
//                         >
//                           {getStatusLabel(schedule.status)}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <View style={styles.scheduleDetails}>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Booking ID:</Text>
//                       <Text style={[styles.bookingId, { color: COLORS.primary }]}>
//                         {schedule._id?.substring(0, 8)}...
//                       </Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Created:</Text>
//                       <Text style={styles.detailValue}>
//                         {formatDate(schedule.created_at?.$date || schedule.created_at)}
//                       </Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Duration:</Text>
//                       <Text style={styles.detailValue}>
//                         {schedule.overall_checklist?.totalTime || schedule.schedule?.total_cleaning_time || 0} min
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.scheduleActions}>
//                     <TouchableOpacity 
//                       style={[styles.viewButton, { borderColor: COLORS.primary }]}
//                       onPress={() => handleViewSchedule(schedule._id)}
//                     >
//                       <MaterialCommunityIcons name="eye" size={16} color={COLORS.primary} />
//                       <Text style={[styles.viewButtonText, { color: COLORS.primary }]}>
//                         View Details
//                       </Text>
//                     </TouchableOpacity>
                    
//                     {schedule.status === 'completed' && (
//                       <TouchableOpacity 
//                         style={styles.receiptButton}
//                         onPress={() => handleViewReceipt(schedule)}
//                       >
//                         <MaterialCommunityIcons name="file-document" size={16} color="#34C759" />
//                         <Text style={styles.receiptButtonText}>Receipt</Text>
//                       </TouchableOpacity>
//                     )}
                    
//                     {schedule.status === 'pending_payment' && (
//                       <TouchableOpacity style={[styles.payButton, { backgroundColor: COLORS.primary }]}>
//                         <MaterialCommunityIcons name="credit-card" size={16} color="#FFFFFF" />
//                         <Text style={styles.payButtonText}>Pay Now</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <MaterialCommunityIcons 
//                   name="calendar-blank" 
//                   size={64} 
//                   color="#CCCCCC" 
//                 />
//                 <Text style={styles.emptyStateText}>No schedules found</Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   {selectedFilter === 'all' 
//                     ? 'You haven\'t booked any cleaning schedules yet' 
//                     : `No ${getStatusLabel(selectedFilter).toLowerCase()} schedules`
//                   }
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Help Section */}
//           <View style={[styles.helpSection, { backgroundColor: COLORS.primary }]}>
//             <View style={styles.helpHeader}>
//               <MaterialCommunityIcons name="help-circle" size={24} color="#FFFFFF" />
//               <Text style={styles.helpTitle}>Need help with a booking?</Text>
//             </View>
//             <Text style={styles.helpText}>
//               If you have questions about a schedule or need to make changes, 
//               our support team is available 24/7.
//             </Text>
//             <TouchableOpacity style={styles.contactSupportButton}>
//               <MaterialCommunityIcons name="headset" size={20} color={COLORS.primary} />
//               <Text style={[styles.contactSupportText, { color: COLORS.primary }]}>
//                 Contact Support
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
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
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   helpButton: {
//     padding: 8,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
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
//   summaryCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   summaryAmount: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   summarySubtext: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   filterTabsContainer: {
//     marginBottom: 24,
//   },
//   filterTabs: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   filterTab: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     minWidth: 100,
//   },
//   filterTabActive: {
//     backgroundColor: COLORS.primary, // Use primary color
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
//   scheduleList: {
//     marginBottom: 24,
//   },
//   scheduleCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   scheduleHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   scheduleInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   scheduleTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   scheduleApartment: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginLeft: 8,
//   },
//   scheduleAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   scheduleMeta: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   metaItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   metaText: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginLeft: 4,
//   },
//   scheduleAmountContainer: {
//     alignItems: 'flex-end',
//   },
//   scheduleAmount: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '700',
//     marginLeft: 4,
//     textTransform: 'uppercase',
//   },
//   scheduleDetails: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: '#8E8E93',
//   },
//   detailValue: {
//     fontSize: 13,
//     color: '#1C1C1E',
//     fontWeight: '500',
//   },
//   bookingId: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   scheduleActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//   },
//   viewButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   receiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#34C759',
//   },
//   receiptButtonText: {
//     fontSize: 14,
//     color: '#34C759',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   payButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//   },
//   payButtonText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     paddingHorizontal: 20,
//   },
//   emptyStateText: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#8E8E93',
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptyStateSubtext: {
//     fontSize: 15,
//     color: '#C7C7CC',
//     textAlign: 'center',
//     lineHeight: 22,
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
// });

// export default PaymentHistory;




// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import ROUTES from '../../../constants/routes';
// import COLORS from '../../../constants/colors'; // Import COLORS
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { minutesToDuration } from '../../../utils/minuteToDuration';
// // import { calculateDuration } from '../../../utils/calculateDuration';

// const PaymentHistory = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { scheduleId, notificationId } = route.params || {};

//   const {currentUserId, fbaseUser, currentUser} = useContext(AuthContext)

//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const filters = [
//     { id: 'all', label: 'All Schedules' },
//     { id: 'completed', label: 'Completed' },
//     { id: 'in_progress', label: 'In Progress' },
//     { id: 'pending_payment', label: 'Pending Payment' },
//     { id: 'cancelled', label: 'Cancelled' },
//   ];

//   // Fetch schedules from your API
//   useEffect(() => {
//     const fetchSchedules = async () => {
//       try {
//         setLoading(true);
        
//         // Check if currentUserId exists before making the API call
//         if (!currentUserId) {
//           Alert.alert('Error', 'User not authenticated');
//           setLoading(false);
//           return;
//         }
        
//         // Use the actual API call
//         const response = await userService.getSchedulesByHostId(currentUserId);
//         const res = response.data;
        
//         // Set the actual data from API response
//         setSchedules(res || []);
        
//       } catch (error) {
//         console.error('Error fetching schedules:', error);
//         Alert.alert('Error', 'Failed to load schedule history');
//         // Optionally keep empty array instead of mock data
//         setSchedules([]);
//       } finally {
//         setLoading(false);
//       }
//     };

    

//     fetchSchedules();
//   }, [currentUserId]); // Add currentUserId as dependency

//   const filteredSchedules = schedules.filter(schedule => {
//     if (selectedFilter === 'all') return true;
//     return schedule.status === selectedFilter;
//   });

//   const calculateDuration = (startTime, endTime) => {
//         try {
//             const start = moment(startTime, 'h:mm:ss A');
//             const end = moment(endTime, 'h:mm:ss A');
//             const duration = moment.duration(end.diff(start));
//             const hours = duration.hours();
//             const minutes = duration.minutes();
            
//             if (hours > 0) {
//                 return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
//             }
//             return `${minutes}m`;
//         } catch (error) {
//             return 'Duration not available';
//         }
//     };
//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       in_progress: COLORS.primary, // Use primary color
//       pending_payment: '#FF9500',
//       assigned: '#5856D6',
//       scheduled: '#5AC8FA',
//       cancelled: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusIcon = (status) => {
//     const iconMap = {
//       completed: 'check-circle',
//       in_progress: 'progress-clock',
//       pending_payment: 'clock-outline',
//       assigned: 'account-check',
//       scheduled: 'calendar-clock',
//       cancelled: 'close-circle',
//     };
//     return iconMap[status] || 'help-circle';
//   };

//   const getStatusLabel = (status) => {
//     const labelMap = {
//       completed: 'Completed',
//       in_progress: 'In Progress',
//       pending_payment: 'Pending Payment',
//       assigned: 'Assigned',
//       scheduled: 'Scheduled',
//       cancelled: 'Cancelled',
//     };
//     return labelMap[status] || status;
//   };

//   const formatCurrency = (amount) => {
//     return `$${amount?.toFixed(2) || '0.00'}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     const time = timeString.split(':');
//     const hours = parseInt(time[0]);
//     const minutes = time[1];
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${minutes} ${ampm}`;
//   };

//   const getCleaningDate = (schedule) => {
//     const date = schedule?.cleaning_date;
//     const time = schedule?.cleaning_time;
//     if (!date) return 'No date set';
    
//     const formattedDate = formatDate(date);
//     const formattedTime = formatTime(time);
    
//     return `${formattedDate} ${formattedTime ? `• ${formattedTime}` : ''}`;
//   };

//   const handleViewSchedule = (scheduleId) => {
//     navigation.navigate(ROUTES.host_schedule_details, { 
//       scheduleId,
//       fromHistory: true 
//     });
//   };

//   const handleViewReceipt = (schedule) => {
//     navigation.navigate(ROUTES.host_receipt_details, { 
//       scheduleId: schedule._id,
//       payment_intent_id: schedule.payment_intent_id
//     });
//   };

//   const handleExportData = () => {
//     // TODO: Implement export functionality
//     Alert.alert('Export', 'Export functionality to be implemented');
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter(s => s.status === 'completed')
//       .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0), 0);
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading schedule history...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Schedule History</Text>
//         <TouchableOpacity 
//           style={styles.helpButton}
//           onPress={handleExportData}
//         >
//           <MaterialCommunityIcons name="download" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>
//           {/* Summary Cards */}
//           <View style={styles.summaryCards}>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>Total Spent</Text>
//               <Text style={styles.summaryAmount}>
//                 {formatCurrency(calculateTotalSpent())}
//               </Text>
//               <Text style={styles.summarySubtext}>Completed schedules</Text>
//             </View>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>Total Bookings</Text>
//               <Text style={styles.summaryAmount}>{schedules.length}</Text>
//               <Text style={styles.summarySubtext}>All schedules</Text>
//             </View>
//           </View>

//           {/* Filter Tabs */}
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             style={styles.filterTabsContainer}
//           >
//             <View style={styles.filterTabs}>
//               {filters.map((filter) => (
//                 <TouchableOpacity
//                   key={filter.id}
//                   style={[
//                     styles.filterTab,
//                     selectedFilter === filter.id && styles.filterTabActive,
//                   ]}
//                   onPress={() => setSelectedFilter(filter.id)}
//                 >
//                   <Text
//                     style={[
//                       styles.filterTabText,
//                       selectedFilter === filter.id && styles.filterTabTextActive,
//                     ]}
//                   >
//                     {filter.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>

//           {/* Schedule List */}
//           <View style={styles.scheduleList}>
//             {filteredSchedules.length > 0 ? (
//               filteredSchedules.map((schedule) => (
//                 <View key={schedule._id} style={styles.scheduleCard}>
//                   <View style={styles.scheduleHeader}>
//                     <View style={styles.scheduleInfo}>
//                       <View style={styles.scheduleTitleRow}>
//                         <MaterialCommunityIcons 
//                           name="office-building" 
//                           size={20} 
//                           color="#666" 
//                         />
//                         <Text style={styles.scheduleApartment}>
//                           {schedule.schedule?.apartment_name || 'Unnamed Apartment'}
//                         </Text>
//                       </View>
//                       <Text style={styles.scheduleAddress} numberOfLines={1}>
//                         {schedule.schedule?.address || 'No address provided'}
//                       </Text>
//                       <View style={styles.scheduleMeta}>
//                         <View style={styles.metaItem}>
//                           <MaterialCommunityIcons 
//                             name="calendar" 
//                             size={14} 
//                             color="#8E8E93" 
//                           />
//                           <Text style={styles.metaText}>
//                             {getCleaningDate(schedule.schedule)}
//                           </Text>
//                         </View>
//                         {schedule.assignedTo?.length > 0 && (
//                           <View style={styles.metaItem}>
//                             <MaterialCommunityIcons 
//                               name="account-group" 
//                               size={14} 
//                               color="#8E8E93" 
//                             />
//                             <Text style={styles.metaText}>
//                               {schedule.assignedTo.length} cleaner{schedule.assignedTo.length > 1 ? 's' : ''}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                     </View>
//                     <View style={styles.scheduleAmountContainer}>
//                       <Text style={styles.scheduleAmount}>
//                         {formatCurrency(schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0)}
//                       </Text>
//                       <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) + '20' }]}>
//                         <MaterialCommunityIcons
//                           name={getStatusIcon(schedule.status)}
//                           size={12}
//                           color={getStatusColor(schedule.status)}
//                         />
//                         <Text
//                           style={[
//                             styles.statusText,
//                             { color: getStatusColor(schedule.status) },
//                           ]}
//                         >
//                           {getStatusLabel(schedule.status)}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <View style={styles.scheduleDetails}>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Booking ID:</Text>
//                       <Text style={[styles.bookingId, { color: COLORS.primary }]}>
//                         {schedule._id?.substring(0, 8)}...
//                       </Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Created:</Text>
//                       <Text style={styles.detailValue}>
//                         {formatDate(schedule.created_at?.$date || schedule.created_at)}
//                       </Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Duration:</Text>
//                       <Text style={styles.detailValue}>
//                         {minutesToDuration(schedule.schedule?.total_cleaning_time)}
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.scheduleActions}>
//                     <TouchableOpacity 
//                       style={[styles.viewButton, { borderColor: COLORS.primary }]}
//                       onPress={() => handleViewSchedule(schedule._id)}
//                     >
//                       <MaterialCommunityIcons name="eye" size={16} color={COLORS.primary} />
//                       <Text style={[styles.viewButtonText, { color: COLORS.primary }]}>
//                         View Details
//                       </Text>
//                     </TouchableOpacity>
                    
//                     {schedule.status === 'payment_confirmed' && (
//                       <TouchableOpacity 
//                         style={styles.receiptButton}
//                         onPress={() => handleViewReceipt(schedule)}
//                       >
//                         <MaterialCommunityIcons name="file-document" size={16} color="#34C759" />
//                         <Text style={styles.receiptButtonText}>Receipt</Text>
//                       </TouchableOpacity>
//                     )}
                    
//                     {schedule.status === 'pending_payment' && (
//                       <TouchableOpacity onPress={()=> navigation.navigate(ROUTES.host_schedule_request, {scheduleId:schedule?._id})} style={[styles.payButton, { backgroundColor: COLORS.primary }]}>
//                         <MaterialCommunityIcons name="credit-card" size={16} color="#FFFFFF" />
//                         <Text style={styles.payButtonText}>Pay Now</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <MaterialCommunityIcons 
//                   name="calendar-blank" 
//                   size={64} 
//                   color="#CCCCCC" 
//                 />
//                 <Text style={styles.emptyStateText}>No schedules found</Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   {selectedFilter === 'all' 
//                     ? 'You haven\'t booked any cleaning schedules yet' 
//                     : `No ${getStatusLabel(selectedFilter).toLowerCase()} schedules`
//                   }
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Help Section */}
//           <View style={[styles.helpSection, { backgroundColor: COLORS.primary }]}>
//             <View style={styles.helpHeader}>
//               <MaterialCommunityIcons name="help-circle" size={24} color="#FFFFFF" />
//               <Text style={styles.helpTitle}>Need help with a booking?</Text>
//             </View>
//             <Text style={styles.helpText}>
//               If you have questions about a schedule or need to make changes, 
//               our support team is available 24/7.
//             </Text>
//             <TouchableOpacity style={styles.contactSupportButton}>
//               <MaterialCommunityIcons name="headset" size={20} color={COLORS.primary} />
//               <Text style={[styles.contactSupportText, { color: COLORS.primary }]}>
//                 Contact Support
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
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
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   helpButton: {
//     padding: 8,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
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
//   summaryCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   summaryAmount: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   summarySubtext: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   filterTabsContainer: {
//     marginBottom: 24,
//   },
//   filterTabs: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   filterTab: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     minWidth: 100,
//   },
//   filterTabActive: {
//     backgroundColor: COLORS.primary, // Use primary color
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
//   scheduleList: {
//     marginBottom: 24,
//   },
//   scheduleCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   scheduleHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   scheduleInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   scheduleTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   scheduleApartment: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginLeft: 8,
//   },
//   scheduleAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   scheduleMeta: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   metaItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   metaText: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginLeft: 4,
//   },
//   scheduleAmountContainer: {
//     alignItems: 'flex-end',
//   },
//   scheduleAmount: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '700',
//     marginLeft: 4,
//     textTransform: 'uppercase',
//   },
//   scheduleDetails: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: '#8E8E93',
//   },
//   detailValue: {
//     fontSize: 13,
//     color: '#1C1C1E',
//     fontWeight: '500',
//   },
//   bookingId: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   scheduleActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//   },
//   viewButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   receiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#34C759',
//   },
//   receiptButtonText: {
//     fontSize: 14,
//     color: '#34C759',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   payButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//   },
//   payButtonText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     paddingHorizontal: 20,
//   },
//   emptyStateText: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#8E8E93',
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptyStateSubtext: {
//     fontSize: 15,
//     color: '#C7C7CC',
//     textAlign: 'center',
//     lineHeight: 22,
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
// });

// export default PaymentHistory;





// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import ROUTES from '../../../constants/routes';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { minutesToDuration } from '../../../utils/minuteToDuration';
// import { tSafe } from '../../../utils/tSafe';

// const PaymentHistory = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { scheduleId, notificationId } = route.params || {};

//   const { currentUserId, fbaseUser, currentUser } = useContext(AuthContext);

//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const filters = [
//     { id: 'all', label: tSafe('filter_all_schedules', 'All Schedules') },
//     { id: 'completed', label: tSafe('filter_completed', 'Completed') },
//     { id: 'in_progress', label: tSafe('filter_in_progress', 'In Progress') },
//     { id: 'pending_payment', label: tSafe('filter_pending_payment', 'Pending Payment') },
//     { id: 'cancelled', label: tSafe('filter_cancelled', 'Cancelled') },
//   ];

//   // Fetch schedules from your API
//   useEffect(() => {
//     const fetchSchedules = async () => {
//       try {
//         setLoading(true);
//         if (!currentUserId) {
//           Alert.alert(tSafe('error_title', 'Error'), tSafe('user_not_authenticated', 'User not authenticated'));
//           setLoading(false);
//           return;
//         }
//         const response = await userService.getSchedulesByHostId(currentUserId);
//         const res = response.data;
//         setSchedules(res || []);
//       } catch (error) {
//         console.error('Error fetching schedules:', error);
//         Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_load_schedule_history', 'Failed to load schedule history'));
//         setSchedules([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSchedules();
//   }, [currentUserId]);

//   const filteredSchedules = schedules.filter(schedule => {
//     if (selectedFilter === 'all') return true;
//     return schedule.status === selectedFilter;
//   });

//   const calculateDuration = (startTime, endTime) => {
//     try {
//       const start = moment(startTime, 'h:mm:ss A');
//       const end = moment(endTime, 'h:mm:ss A');
//       const duration = moment.duration(end.diff(start));
//       const hours = duration.hours();
//       const minutes = duration.minutes();
//       if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
//       return `${minutes}m`;
//     } catch (error) {
//       return tSafe('duration_not_available', 'Duration not available');
//     }
//   };

//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       in_progress: COLORS.primary,
//       pending_payment: '#FF9500',
//       assigned: '#5856D6',
//       scheduled: '#5AC8FA',
//       cancelled: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusIcon = (status) => {
//     const iconMap = {
//       completed: 'check-circle',
//       in_progress: 'progress-clock',
//       pending_payment: 'clock-outline',
//       assigned: 'account-check',
//       scheduled: 'calendar-clock',
//       cancelled: 'close-circle',
//     };
//     return iconMap[status] || 'help-circle';
//   };

//   const getStatusLabel = (status) => {
//     const labelMap = {
//       completed: tSafe('status_completed', 'Completed'),
//       in_progress: tSafe('status_in_progress', 'In Progress'),
//       pending_payment: tSafe('status_pending_payment', 'Pending Payment'),
//       assigned: tSafe('status_assigned', 'Assigned'),
//       scheduled: tSafe('status_scheduled', 'Scheduled'),
//       cancelled: tSafe('status_cancelled', 'Cancelled'),
//     };
//     return labelMap[status] || status;
//   };

//   const formatCurrency = (amount) => {
//     return `$${amount?.toFixed(2) || '0.00'}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return tSafe('na', 'N/A');
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     const time = timeString.split(':');
//     const hours = parseInt(time[0]);
//     const minutes = time[1];
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${minutes} ${ampm}`;
//   };

//   const getCleaningDate = (schedule) => {
//     const date = schedule?.cleaning_date;
//     const time = schedule?.cleaning_time;
//     if (!date) return tSafe('no_date_set', 'No date set');
//     const formattedDate = formatDate(date);
//     const formattedTime = formatTime(time);
//     return `${formattedDate} ${formattedTime ? `• ${formattedTime}` : ''}`;
//   };

//   const handleViewSchedule = (scheduleId) => {
//     navigation.navigate(ROUTES.host_schedule_details, { 
//       scheduleId,
//       fromHistory: true 
//     });
//   };

//   const handleViewReceipt = (schedule) => {
//     navigation.navigate(ROUTES.host_receipt_details, { 
//       scheduleId: schedule._id,
//       payment_intent_id: schedule.payment_intent_id
//     });
//   };

//   const handleExportData = () => {
//     Alert.alert(tSafe('export', 'Export'), tSafe('export_coming_soon', 'Export functionality to be implemented'));
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter(s => s.status === 'completed')
//       .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0), 0);
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_schedule_history', 'Loading schedule history...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{tSafe('schedule_history_title', 'Schedule History')}</Text>
//         <TouchableOpacity 
//           style={styles.helpButton}
//           onPress={handleExportData}
//         >
//           <MaterialCommunityIcons name="download" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>
//           {/* Summary Cards */}
//           <View style={styles.summaryCards}>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>{tSafe('total_spent', 'Total Spent')}</Text>
//               <Text style={styles.summaryAmount}>
//                 {formatCurrency(calculateTotalSpent())}
//               </Text>
//               <Text style={styles.summarySubtext}>{tSafe('completed_schedules', 'Completed schedules')}</Text>
//             </View>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryLabel}>{tSafe('total_bookings', 'Total Bookings')}</Text>
//               <Text style={styles.summaryAmount}>{schedules.length}</Text>
//               <Text style={styles.summarySubtext}>{tSafe('all_schedules', 'All schedules')}</Text>
//             </View>
//           </View>

//           {/* Filter Tabs */}
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             style={styles.filterTabsContainer}
//           >
//             <View style={styles.filterTabs}>
//               {filters.map((filter) => (
//                 <TouchableOpacity
//                   key={filter.id}
//                   style={[
//                     styles.filterTab,
//                     selectedFilter === filter.id && styles.filterTabActive,
//                   ]}
//                   onPress={() => setSelectedFilter(filter.id)}
//                 >
//                   <Text
//                     style={[
//                       styles.filterTabText,
//                       selectedFilter === filter.id && styles.filterTabTextActive,
//                     ]}
//                   >
//                     {filter.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>

//           {/* Schedule List */}
//           <View style={styles.scheduleList}>
//             {filteredSchedules.length > 0 ? (
//               filteredSchedules.map((schedule) => (
//                 <View key={schedule._id} style={styles.scheduleCard}>
//                   <View style={styles.scheduleHeader}>
//                     <View style={styles.scheduleInfo}>
//                       <View style={styles.scheduleTitleRow}>
//                         <MaterialCommunityIcons 
//                           name="office-building" 
//                           size={20} 
//                           color="#666" 
//                         />
//                         <Text style={styles.scheduleApartment}>
//                           {schedule.schedule?.apartment_name || tSafe('unnamed_apartment', 'Unnamed Apartment')}
//                         </Text>
//                       </View>
//                       <Text style={styles.scheduleAddress} numberOfLines={1}>
//                         {schedule.schedule?.address || tSafe('no_address_provided', 'No address provided')}
//                       </Text>
//                       <View style={styles.scheduleMeta}>
//                         <View style={styles.metaItem}>
//                           <MaterialCommunityIcons 
//                             name="calendar" 
//                             size={14} 
//                             color="#8E8E93" 
//                           />
//                           <Text style={styles.metaText}>
//                             {getCleaningDate(schedule.schedule)}
//                           </Text>
//                         </View>
//                         {schedule.assignedTo?.length > 0 && (
//                           <View style={styles.metaItem}>
//                             <MaterialCommunityIcons 
//                               name="account-group" 
//                               size={14} 
//                               color="#8E8E93" 
//                             />
//                             <Text style={styles.metaText}>
//                               {schedule.assignedTo.length} {tSafe('cleaner_plural', 'cleaners')}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                     </View>
//                     <View style={styles.scheduleAmountContainer}>
//                       <Text style={styles.scheduleAmount}>
//                         {formatCurrency(schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0)}
//                       </Text>
//                       <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) + '20' }]}>
//                         <MaterialCommunityIcons
//                           name={getStatusIcon(schedule.status)}
//                           size={12}
//                           color={getStatusColor(schedule.status)}
//                         />
//                         <Text
//                           style={[
//                             styles.statusText,
//                             { color: getStatusColor(schedule.status) },
//                           ]}
//                         >
//                           {getStatusLabel(schedule.status)}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <View style={styles.scheduleDetails}>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>{tSafe('booking_id', 'Booking ID:')}</Text>
//                       <Text style={[styles.bookingId, { color: COLORS.primary }]}>
//                         {schedule._id?.substring(0, 8)}...
//                       </Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>{tSafe('created', 'Created:')}</Text>
//                       <Text style={styles.detailValue}>
//                         {formatDate(schedule.created_at?.$date || schedule.created_at)}
//                       </Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>{tSafe('duration', 'Duration:')}</Text>
//                       <Text style={styles.detailValue}>
//                         {minutesToDuration(schedule.schedule?.total_cleaning_time)}
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.scheduleActions}>
//                     <TouchableOpacity 
//                       style={[styles.viewButton, { borderColor: COLORS.primary }]}
//                       onPress={() => handleViewSchedule(schedule._id)}
//                     >
//                       <MaterialCommunityIcons name="eye" size={16} color={COLORS.primary} />
//                       <Text style={[styles.viewButtonText, { color: COLORS.primary }]}>
//                         {tSafe('view_details', 'View Details')}
//                       </Text>
//                     </TouchableOpacity>
                    
//                     {schedule.status === 'payment_confirmed' && (
//                       <TouchableOpacity 
//                         style={styles.receiptButton}
//                         onPress={() => handleViewReceipt(schedule)}
//                       >
//                         <MaterialCommunityIcons name="file-document" size={16} color="#34C759" />
//                         <Text style={styles.receiptButtonText}>{tSafe('receipt', 'Receipt')}</Text>
//                       </TouchableOpacity>
//                     )}
                    
//                     {schedule.status === 'pending_payment' && (
//                       <TouchableOpacity onPress={()=> navigation.navigate(ROUTES.host_schedule_request, {scheduleId:schedule?._id})} style={[styles.payButton, { backgroundColor: COLORS.primary }]}>
//                         <MaterialCommunityIcons name="credit-card" size={16} color="#FFFFFF" />
//                         <Text style={styles.payButtonText}>{tSafe('pay_now', 'Pay Now')}</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <MaterialCommunityIcons 
//                   name="calendar-blank" 
//                   size={64} 
//                   color="#CCCCCC" 
//                 />
//                 <Text style={styles.emptyStateText}>{tSafe('no_schedules_found', 'No schedules found')}</Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   {selectedFilter === 'all' 
//                     ? tSafe('empty_all_schedules', 'You haven\'t booked any cleaning schedules yet')
//                     : tSafe('empty_filtered_schedules', 'No {status} schedules', { status: getStatusLabel(selectedFilter).toLowerCase() })
//                   }
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Help Section */}
//           <View style={[styles.helpSection, { backgroundColor: COLORS.primary }]}>
//             <View style={styles.helpHeader}>
//               <MaterialCommunityIcons name="help-circle" size={24} color="#FFFFFF" />
//               <Text style={styles.helpTitle}>{tSafe('need_help', 'Need help with a booking?')}</Text>
//             </View>
//             <Text style={styles.helpText}>
//               {tSafe('help_support_text', 'If you have questions about a schedule or need to make changes, our support team is available 24/7.')}
//             </Text>
//             <TouchableOpacity style={styles.contactSupportButton}>
//               <MaterialCommunityIcons name="headset" size={20} color={COLORS.primary} />
//               <Text style={[styles.contactSupportText, { color: COLORS.primary }]}>
//                 {tSafe('contact_support', 'Contact Support')}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
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
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   helpButton: {
//     padding: 8,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
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
//   summaryCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   summaryAmount: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   summarySubtext: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   filterTabsContainer: {
//     marginBottom: 24,
//   },
//   filterTabs: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   filterTab: {
//     paddingVertical: 10,
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
//   scheduleList: {
//     marginBottom: 24,
//   },
//   scheduleCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   scheduleHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   scheduleInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   scheduleTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   scheduleApartment: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginLeft: 8,
//   },
//   scheduleAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   scheduleMeta: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   metaItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   metaText: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginLeft: 4,
//   },
//   scheduleAmountContainer: {
//     alignItems: 'flex-end',
//   },
//   scheduleAmount: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '700',
//     marginLeft: 4,
//     textTransform: 'uppercase',
//   },
//   scheduleDetails: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: '#8E8E93',
//   },
//   detailValue: {
//     fontSize: 13,
//     color: '#1C1C1E',
//     fontWeight: '500',
//   },
//   bookingId: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   scheduleActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//   },
//   viewButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   receiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#34C759',
//   },
//   receiptButtonText: {
//     fontSize: 14,
//     color: '#34C759',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   payButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//   },
//   payButtonText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     paddingHorizontal: 20,
//   },
//   emptyStateText: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#8E8E93',
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptyStateSubtext: {
//     fontSize: 15,
//     color: '#C7C7CC',
//     textAlign: 'center',
//     lineHeight: 22,
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
// });

// export default PaymentHistory;




import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useRoute,
  useNavigation,
} from '@react-navigation/native';

import ROUTES from '../../../constants/routes';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { minutesToDuration } from '../../../utils/minuteToDuration';
import { tSafe } from '../../../utils/tSafe';

import { useTheme } from '../../../theme';
import AppText from '../../../ui/AppText';
import AppCard from '../../../ui/AppCard';

const PaymentHistory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const {
    scheduleId,
    notificationId,
  } = route.params || {};

  const {
    currentUserId,
    fbaseUser,
    currentUser,
  } = useContext(AuthContext);

  // ---------------------------------------------------------
  // Existing schedule/payment history state
  // ---------------------------------------------------------

  const [selectedFilter, setSelectedFilter] =
    useState('all');

  const [schedules, setSchedules] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ---------------------------------------------------------
  // Transaction / balance state
  // ---------------------------------------------------------

  const [balance, setBalance] =
    useState(0);

  const [currency, setCurrency] =
    useState('USD');

  const [transactions, setTransactions] =
    useState([]);

  const [transactionsLoading, setTransactionsLoading] =
    useState(true);

  const [transactionsError, setTransactionsError] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const filters = [
    {
      id: 'all',
      label: tSafe(
        'filter_all_schedules',
        'All Schedules'
      ),
    },
    {
      id: 'completed',
      label: tSafe(
        'filter_completed',
        'Completed'
      ),
    },
    {
      id: 'in_progress',
      label: tSafe(
        'filter_in_progress',
        'In Progress'
      ),
    },
    {
      id: 'pending_payment',
      label: tSafe(
        'filter_pending_payment',
        'Pending Payment'
      ),
    },
    {
      id: 'cancelled',
      label: tSafe(
        'filter_cancelled',
        'Cancelled'
      ),
    },
  ];

  // ---------------------------------------------------------
  // Format currency
  // ---------------------------------------------------------

  const formatCurrency = amount => {
    const numericAmount =
      Number(amount || 0);

    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency:
          currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(numericAmount);
  };

  // ---------------------------------------------------------
  // Fetch schedules
  // ---------------------------------------------------------

  const fetchSchedules =
    useCallback(async () => {
      try {
        if (!currentUserId) {
          setSchedules([]);
          return;
        }

        const response =
          await userService.getSchedulesByHostId(
            currentUserId
          );

        const res =
          response?.data;

        setSchedules(
          Array.isArray(res)
            ? res
            : []
        );
      } catch (error) {
        console.error(
          'Error fetching schedule history:',
          error
        );

        setSchedules([]);

        throw error;
      }
    }, [currentUserId]);

  // ---------------------------------------------------------
  // Fetch transaction balance
  // ---------------------------------------------------------

  const fetchTransactionBalance =
    useCallback(async () => {
      try {
        if (!currentUserId) {
          setBalance(0);
          return;
        }

        const response =
          await userService.getTransactionBalance(
            'USD'
          );

        const data =
          response?.data || {};

        if (
          data.success === false
        ) {
          throw new Error(
            data.message ||
              'Failed to load balance'
          );
        }

        setBalance(
          Number(
            data.balance || 0
          )
        );

        setCurrency(
          data.currency ||
            'USD'
        );
      } catch (error) {
        console.error(
          'Error fetching transaction balance:',
          error
        );

        setBalance(0);

        throw error;
      }
    }, [currentUserId]);

  // ---------------------------------------------------------
  // Fetch transaction history
  // ---------------------------------------------------------

  const fetchTransactions =
    useCallback(async () => {
      try {
        setTransactionsLoading(
          true
        );

        setTransactionsError(
          false
        );

        if (!currentUserId) {
          setTransactions([]);
          return;
        }

        const response =
          await userService.getTransactions(
            'USD',
            20
          );

        const data =
          response?.data || {};

        if (
          data.success === false
        ) {
          throw new Error(
            data.message ||
              'Failed to load transactions'
          );
        }

        setTransactions(
          Array.isArray(
            data.transactions
          )
            ? data.transactions
            : []
        );

        if (data.currency) {
          setCurrency(
            data.currency
          );
        }

        if (
          data.balance !==
          undefined
        ) {
          setBalance(
            Number(
              data.balance || 0
            )
          );
        }
      } catch (error) {
        console.error(
          'Error fetching transactions:',
          error
        );

        setTransactions([]);
        setTransactionsError(
          true
        );

        throw error;
      } finally {
        setTransactionsLoading(
          false
        );
      }
    }, [currentUserId]);

  // ---------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!currentUserId) {
          Alert.alert(
            tSafe(
              'error_title',
              'Error'
            ),
            tSafe(
              'user_not_authenticated',
              'User not authenticated'
            )
          );

          return;
        }

        await Promise.allSettled([
          fetchSchedules(),
          fetchTransactionBalance(),
          fetchTransactions(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    currentUserId,
    fetchSchedules,
    fetchTransactionBalance,
    fetchTransactions,
  ]);

  // ---------------------------------------------------------
  // Pull to refresh
  // ---------------------------------------------------------

  const handleRefresh =
    async () => {
      try {
        setRefreshing(true);

        await Promise.allSettled([
          fetchSchedules(),
          fetchTransactionBalance(),
          fetchTransactions(),
        ]);
      } finally {
        setRefreshing(false);
      }
    };

  // ---------------------------------------------------------
  // Schedule filtering
  // ---------------------------------------------------------

  const filteredSchedules =
    schedules.filter(
      schedule => {
        if (
          selectedFilter ===
          'all'
        ) {
          return true;
        }

        return (
          schedule.status ===
          selectedFilter
        );
      }
    );

  // ---------------------------------------------------------
  // Schedule helpers
  // ---------------------------------------------------------

  const getStatusColor =
    status => {
      const colorMap = {
        completed:
          theme.status.success,

        in_progress:
          theme.brand.primary,

        pending_payment:
          theme.status.warning,

        assigned:
          theme.status.info,

        scheduled:
          theme.status.info,

        cancelled:
          theme.status.error,
      };

      return (
        colorMap[status] ||
        theme.text.muted
      );
    };

  const getStatusIcon =
    status => {
      const iconMap = {
        completed:
          'check-circle',

        in_progress:
          'progress-clock',

        pending_payment:
          'clock-outline',

        assigned:
          'account-check',

        scheduled:
          'calendar-clock',

        cancelled:
          'close-circle',
      };

      return (
        iconMap[status] ||
        'help-circle'
      );
    };

  const getStatusLabel =
    status => {
      const labelMap = {
        completed: tSafe(
          'status_completed',
          'Completed'
        ),

        in_progress: tSafe(
          'status_in_progress',
          'In Progress'
        ),

        pending_payment: tSafe(
          'status_pending_payment',
          'Pending Payment'
        ),

        assigned: tSafe(
          'status_assigned',
          'Assigned'
        ),

        scheduled: tSafe(
          'status_scheduled',
          'Scheduled'
        ),

        cancelled: tSafe(
          'status_cancelled',
          'Cancelled'
        ),
      };

      return (
        labelMap[status] ||
        status
      );
    };

  const formatDate =
    dateString => {
      if (!dateString) {
        return tSafe(
          'na',
          'N/A'
        );
      }

      const date =
        new Date(dateString);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return tSafe(
          'na',
          'N/A'
        );
      }

      return date.toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      );
    };

  const formatTime =
    timeString => {
      if (!timeString) {
        return '';
      }

      const time =
        timeString.split(':');

      const hours =
        parseInt(
          time[0],
          10
        );

      const minutes =
        time[1];

      if (
        Number.isNaN(hours)
      ) {
        return timeString;
      }

      const ampm =
        hours >= 12
          ? 'PM'
          : 'AM';

      const formattedHours =
        hours % 12 || 12;

      return `${formattedHours}:${minutes} ${ampm}`;
    };

  const getCleaningDate =
    schedule => {
      const date =
        schedule?.cleaning_date;

      const time =
        schedule?.cleaning_time;

      if (!date) {
        return tSafe(
          'no_date_set',
          'No date set'
        );
      }

      const formattedDate =
        formatDate(date);

      const formattedTime =
        formatTime(time);

      return `${formattedDate}${
        formattedTime
          ? ` • ${formattedTime}`
          : ''
      }`;
    };

  // ---------------------------------------------------------
  // Transaction helpers
  // ---------------------------------------------------------

  const getTransactionIcon =
    transaction => {
      const transactionType =
        transaction?.transaction_type;

      const direction =
        transaction?.direction;

      if (
        transactionType ===
        'cancellation_refund'
      ) {
        return 'cash-refund';
      }

      if (
        direction ===
        'credit'
      ) {
        return 'arrow-down-circle';
      }

      if (
        direction ===
        'debit'
      ) {
        return 'arrow-up-circle';
      }

      return 'cash';
    };

  const getTransactionColor =
    transaction => {
      if (
        transaction?.direction ===
        'credit'
      ) {
        return (
          theme.status.success
        );
      }

      if (
        transaction?.direction ===
        'debit'
      ) {
        return (
          theme.status.error
        );
      }

      return theme.text.muted;
    };

  const getTransactionTitle =
    transaction => {
      if (
        transaction?.transaction_type ===
        'cancellation_refund'
      ) {
        return tSafe(
          'cancellation_refund',
          'Cancellation Refund'
        );
      }

      if (
        transaction?.transaction_type
      ) {
        return transaction.transaction_type
          .replace(
            /_/g,
            ' '
          )
          .replace(
            /\b\w/g,
            char =>
              char.toUpperCase()
          );
      }

      return tSafe(
        'transaction',
        'Transaction'
      );
    };

  const getTransactionAmount =
    transaction => {
      const amount =
        Number(
          transaction?.amount ||
            0
        );

      if (
        transaction?.direction ===
        'debit'
      ) {
        return `-${formatCurrency(
          amount
        )}`;
      }

      return `+${formatCurrency(
        amount
      )}`;
    };

  const getTransactionStatusLabel =
    transaction => {
      const status =
        transaction?.status;

      if (!status) {
        return '';
      }

      return status
        .replace(
          /_/g,
          ' '
        )
        .replace(
          /\b\w/g,
          char =>
            char.toUpperCase()
        );
    };

  const getTransactionDate =
    transaction =>
      formatDate(
        transaction?.created_at
      );

  // ---------------------------------------------------------
  // Existing navigation
  // ---------------------------------------------------------

  const handleViewSchedule =
    scheduleId => {
      navigation.navigate(
        ROUTES.host_schedule_details,
        {
          scheduleId,
          fromHistory: true,
        }
      );
    };

  const handleViewReceipt =
    schedule => {
      navigation.navigate(
        ROUTES.host_receipt_details,
        {
          scheduleId:
            schedule._id,

          payment_intent_id:
            schedule.payment_intent_id,
        }
      );
    };

  const handleExportData =
    () => {
      Alert.alert(
        tSafe(
          'export',
          'Export'
        ),
        tSafe(
          'export_coming_soon',
          'Export functionality to be implemented'
        )
      );
    };

  const calculateTotalSpent =
    () => {
      return schedules
        .filter(
          s =>
            s.status ===
            'completed'
        )
        .reduce(
          (
            sum,
            schedule
          ) =>
            sum +
            Number(
              schedule
                .overall_checklist
                ?.totalFee ||
                schedule
                  .schedule
                  ?.total_cleaning_fee ||
                0
            ),
          0
        );
    };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            theme.brand.primary
          }
        />

        <AppText
          variant="body1"
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_schedule_history',
            'Loading schedule history...'
          )}
        </AppText>
      </View>
    );
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <View
      style={
        styles.container
      }
    >
      {/* Header */}
      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          style={
            styles.headerIconButton
          }
          onPress={() =>
            navigation.goBack()
          }
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'go_back',
            'Go back'
          )}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={
              theme.icon.default
            }
          />
        </TouchableOpacity>

        <AppText
          variant="h6"
          style={
            styles.headerTitle
          }
        >
          {tSafe(
            'schedule_history_title',
            'Schedule History'
          )}
        </AppText>

        <TouchableOpacity
          style={
            styles.headerIconButton
          }
          onPress={
            handleExportData
          }
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'export',
            'Export'
          )}
        >
          <MaterialCommunityIcons
            name="download"
            size={24}
            color={
              theme.icon.default
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={
          styles.scrollView
        }
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            colors={[
              theme.brand.primary,
            ]}
            tintColor={
              theme.brand.primary
            }
          />
        }
      >
        <View
          style={
            styles.content
          }
        >
          {/* =================================================
              AVAILABLE BALANCE
          ================================================= */}

          <View
            style={
              styles.balanceCard
            }
          >
            <View
              style={
                styles.balanceHeader
              }
            >
              <View>
                <AppText
                  variant="caption"
                  style={
                    styles.balanceLabel
                  }
                >
                  {tSafe(
                    'available_balance',
                    'Available Balance'
                  )}
                </AppText>

                <AppText
                  variant="h4"
                  style={
                    styles.balanceAmount
                  }
                >
                  {formatCurrency(
                    balance
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.balanceSubtext
                  }
                >
                  {tSafe(
                    'available_credits',
                    'Available credits'
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.balanceIconContainer
                }
              >
                <MaterialCommunityIcons
                  name="wallet"
                  size={30}
                  color={
                    theme.text.inverse
                  }
                />
              </View>
            </View>

            <View
              style={
                styles.balanceDivider
              }
            />

            <View
              style={
                styles.balanceFooter
              }
            >
              <View
                style={
                  styles.balanceFooterItem
                }
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={
                    theme.text.inverse
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.balanceFooterText
                  }
                >
                  {tSafe(
                    'secure_balance',
                    'Secure balance'
                  )}
                </AppText>
              </View>

              <AppText
                variant="caption"
                style={
                  styles.balanceCurrency
                }
              >
                {currency}
              </AppText>
            </View>
          </View>

          {/* =================================================
              RECENT TRANSACTIONS
          ================================================= */}

          <View
            style={
              styles.transactionsSection
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <AppText
                  variant="h6"
                  style={
                    styles.sectionTitle
                  }
                >
                  {tSafe(
                    'recent_transactions',
                    'Recent Transactions'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.sectionSubtitle
                  }
                >
                  {tSafe(
                    'recent_transaction_activity',
                    'Recent balance activity'
                  )}
                </AppText>
              </View>

              {transactions.length >
                0 && (
                <View
                  style={
                    styles.transactionCount
                  }
                >
                  <AppText
                    variant="caption"
                    style={
                      styles.transactionCountText
                    }
                  >
                    {
                      transactions.length
                    }
                  </AppText>
                </View>
              )}
            </View>

            {transactionsLoading ? (
              <View
                style={
                  styles.transactionLoading
                }
              >
                <ActivityIndicator
                  size="small"
                  color={
                    theme.brand.primary
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.transactionLoadingText
                  }
                >
                  {tSafe(
                    'loading_transactions',
                    'Loading transactions...'
                  )}
                </AppText>
              </View>
            ) : transactionsError ? (
              <View
                style={
                  styles.transactionEmpty
                }
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={40}
                  color={
                    theme.status.warning
                  }
                />

                <AppText
                  variant="body1"
                  style={
                    styles.transactionEmptyTitle
                  }
                >
                  {tSafe(
                    'transactions_unavailable',
                    'Transactions unavailable'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.transactionEmptyText
                  }
                >
                  {tSafe(
                    'transactions_try_again',
                    'Pull down to try again.'
                  )}
                </AppText>
              </View>
            ) : transactions.length >
              0 ? (
              <AppCard
                style={
                  styles.transactionCard
                }
              >
                {transactions.map(
                  (
                    transaction,
                    index
                  ) => {
                    const transactionColor =
                      getTransactionColor(
                        transaction
                      );

                    const isLast =
                      index ===
                      transactions.length -
                        1;

                    return (
                      <View
                        key={
                          transaction._id ||
                          transaction.reference ||
                          index
                        }
                        style={[
                          styles.transactionRow,
                          !isLast &&
                            styles.transactionRowBorder,
                        ]}
                      >
                        <View
                          style={[
                            styles.transactionIcon,
                            {
                              backgroundColor:
                                withAlpha(
                                  transactionColor,
                                  '15'
                                ),
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={getTransactionIcon(
                              transaction
                            )}
                            size={22}
                            color={
                              transactionColor
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.transactionInfo
                          }
                        >
                          <AppText
                            variant="body2"
                            numberOfLines={
                              1
                            }
                            style={
                              styles.transactionTitle
                            }
                          >
                            {getTransactionTitle(
                              transaction
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.transactionDate
                            }
                          >
                            {getTransactionDate(
                              transaction
                            )}

                            {transaction?.schedule_id
                              ? ` • ${tSafe(
                                  'schedule',
                                  'Schedule'
                                )} ${String(
                                  transaction.schedule_id
                                ).substring(
                                  0,
                                  8
                                )}...`
                              : ''}
                          </AppText>

                          {transaction?.description ? (
                            <AppText
                              variant="caption"
                              numberOfLines={
                                1
                              }
                              style={
                                styles.transactionDescription
                              }
                            >
                              {
                                transaction.description
                              }
                            </AppText>
                          ) : null}
                        </View>

                        <View
                          style={
                            styles.transactionAmountContainer
                          }
                        >
                          <AppText
                            variant="body2"
                            style={[
                              styles.transactionAmount,
                              {
                                color:
                                  transactionColor,
                              },
                            ]}
                          >
                            {getTransactionAmount(
                              transaction
                            )}
                          </AppText>

                          {getTransactionStatusLabel(
                            transaction
                          ) ? (
                            <AppText
                              variant="caption"
                              style={
                                styles.transactionStatus
                              }
                            >
                              {getTransactionStatusLabel(
                                transaction
                              )}
                            </AppText>
                          ) : null}
                        </View>
                      </View>
                    );
                  }
                )}
              </AppCard>
            ) : (
              <View
                style={
                  styles.transactionEmpty
                }
              >
                <MaterialCommunityIcons
                  name="cash-remove"
                  size={40}
                  color={
                    theme.icon.muted
                  }
                />

                <AppText
                  variant="body1"
                  style={
                    styles.transactionEmptyTitle
                  }
                >
                  {tSafe(
                    'no_transactions',
                    'No transactions yet'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.transactionEmptyText
                  }
                >
                  {tSafe(
                    'no_transactions_description',
                    'Your balance activity will appear here.'
                  )}
                </AppText>
              </View>
            )}
          </View>

          {/* =================================================
              PAYMENT / SCHEDULE SUMMARY
          ================================================= */}

          <View
            style={
              styles.summaryCards
            }
          >
            <AppCard
              style={
                styles.summaryCard
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.summaryLabel
                }
              >
                {tSafe(
                  'total_spent',
                  'Total Spent'
                )}
              </AppText>

              <AppText
                variant="h4"
                style={
                  styles.summaryAmount
                }
              >
                {formatCurrency(
                  calculateTotalSpent()
                )}
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.summarySubtext
                }
              >
                {tSafe(
                  'completed_schedules',
                  'Completed schedules'
                )}
              </AppText>
            </AppCard>

            <AppCard
              style={
                styles.summaryCard
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.summaryLabel
                }
              >
                {tSafe(
                  'total_bookings',
                  'Total Bookings'
                )}
              </AppText>

              <AppText
                variant="h4"
                style={
                  styles.summaryAmount
                }
              >
                {schedules.length}
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.summarySubtext
                }
              >
                {tSafe(
                  'all_schedules',
                  'All schedules'
                )}
              </AppText>
            </AppCard>
          </View>

          {/* =================================================
              FILTER TABS
          ================================================= */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={
              styles.filterTabsContainer
            }
            contentContainerStyle={
              styles.filterTabs
            }
          >
            {filters.map(
              filter => {
                const active =
                  selectedFilter ===
                  filter.id;

                return (
                  <TouchableOpacity
                    key={
                      filter.id
                    }
                    style={[
                      styles.filterTab,
                      active &&
                        styles.filterTabActive,
                    ]}
                    onPress={() =>
                      setSelectedFilter(
                        filter.id
                      )
                    }
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.filterTabText,
                        active &&
                          styles.filterTabTextActive,
                      ]}
                    >
                      {
                        filter.label
                      }
                    </AppText>
                  </TouchableOpacity>
                );
              }
            )}
          </ScrollView>

          {/* =================================================
              SCHEDULE LIST
          ================================================= */}

          <View
            style={
              styles.scheduleList
            }
          >
            {filteredSchedules.length >
            0 ? (
              filteredSchedules.map(
                schedule => {
                  const statusColor =
                    getStatusColor(
                      schedule.status
                    );

                  return (
                    <AppCard
                      key={
                        schedule._id
                      }
                      style={
                        styles.scheduleCard
                      }
                    >
                      <View
                        style={
                          styles.scheduleHeader
                        }
                      >
                        <View
                          style={
                            styles.scheduleInfo
                          }
                        >
                          <View
                            style={
                              styles.scheduleTitleRow
                            }
                          >
                            <MaterialCommunityIcons
                              name="office-building"
                              size={20}
                              color={
                                theme.icon.default
                              }
                            />

                            <AppText
                              variant="body1"
                              style={
                                styles.scheduleApartment
                              }
                            >
                              {schedule
                                .schedule
                                ?.apartment_name ||
                                tSafe(
                                  'unnamed_apartment',
                                  'Unnamed Apartment'
                                )}
                            </AppText>
                          </View>

                          <AppText
                            variant="body2"
                            numberOfLines={
                              1
                            }
                            style={
                              styles.scheduleAddress
                            }
                          >
                            {schedule
                              .schedule
                              ?.address ||
                              tSafe(
                                'no_address_provided',
                                'No address provided'
                              )}
                          </AppText>

                          <View
                            style={
                              styles.scheduleMeta
                            }
                          >
                            <View
                              style={
                                styles.metaItem
                              }
                            >
                              <MaterialCommunityIcons
                                name="calendar"
                                size={14}
                                color={
                                  theme.icon.muted
                                }
                              />

                              <AppText
                                variant="caption"
                                style={
                                  styles.metaText
                                }
                              >
                                {getCleaningDate(
                                  schedule.schedule
                                )}
                              </AppText>
                            </View>

                            {schedule
                              .assignedTo
                              ?.length >
                              0 && (
                              <View
                                style={
                                  styles.metaItem
                                }
                              >
                                <MaterialCommunityIcons
                                  name="account-group"
                                  size={14}
                                  color={
                                    theme.icon.muted
                                  }
                                />

                                <AppText
                                  variant="caption"
                                  style={
                                    styles.metaText
                                  }
                                >
                                  {
                                    schedule
                                      .assignedTo
                                      .length
                                  }{' '}
                                  {tSafe(
                                    'cleaner_plural',
                                    'cleaners'
                                  )}
                                </AppText>
                              </View>
                            )}
                          </View>
                        </View>

                        <View
                          style={
                            styles.scheduleAmountContainer
                          }
                        >
                          <AppText
                            variant="body1"
                            style={
                              styles.scheduleAmount
                            }
                          >
                            {formatCurrency(
                              schedule
                                .overall_checklist
                                ?.totalFee ||
                                schedule
                                  .schedule
                                  ?.total_cleaning_fee ||
                                0
                            )}
                          </AppText>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  withAlpha(
                                    statusColor,
                                    '20'
                                  ),
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={getStatusIcon(
                                schedule.status
                              )}
                              size={12}
                              color={
                                statusColor
                              }
                            />

                            <AppText
                              variant="caption"
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    statusColor,
                                },
                              ]}
                            >
                              {getStatusLabel(
                                schedule.status
                              )}
                            </AppText>
                          </View>
                        </View>
                      </View>

                      <View
                        style={
                          styles.scheduleDetails
                        }
                      >
                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <AppText
                            variant="caption"
                            style={
                              styles.detailLabel
                            }
                          >
                            {tSafe(
                              'booking_id',
                              'Booking ID:'
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.bookingId
                            }
                          >
                            {schedule._id?.substring(
                              0,
                              8
                            )}
                            ...
                          </AppText>
                        </View>

                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <AppText
                            variant="caption"
                            style={
                              styles.detailLabel
                            }
                          >
                            {tSafe(
                              'created',
                              'Created:'
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.detailValue
                            }
                          >
                            {formatDate(
                              schedule
                                .created_at
                                ?.$date ||
                                schedule.created_at
                            )}
                          </AppText>
                        </View>

                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <AppText
                            variant="caption"
                            style={
                              styles.detailLabel
                            }
                          >
                            {tSafe(
                              'duration',
                              'Duration:'
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.detailValue
                            }
                          >
                            {minutesToDuration(
                              schedule
                                .schedule
                                ?.total_cleaning_time
                            )}
                          </AppText>
                        </View>
                      </View>

                      <View
                        style={
                          styles.scheduleActions
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.viewButton,
                            {
                              borderColor:
                                theme.button
                                  .secondaryText,
                            },
                          ]}
                          onPress={() =>
                            handleViewSchedule(
                              schedule._id
                            )
                          }
                        >
                          <MaterialCommunityIcons
                            name="eye"
                            size={16}
                            color={
                              theme.brand.primary
                            }
                          />

                          <AppText
                            variant="caption"
                            style={[
                              styles.viewButtonText,
                              {
                                color:
                                  theme.brand.primary,
                              },
                            ]}
                          >
                            {tSafe(
                              'view_details',
                              'View Details'
                            )}
                          </AppText>
                        </TouchableOpacity>

                        {schedule.status ===
                          'payment_confirmed' && (
                          <TouchableOpacity
                            style={
                              styles.receiptButton
                            }
                            onPress={() =>
                              handleViewReceipt(
                                schedule
                              )
                            }
                          >
                            <MaterialCommunityIcons
                              name="file-document"
                              size={16}
                              color={
                                theme.status.success
                              }
                            />

                            <AppText
                              variant="caption"
                              style={
                                styles.receiptButtonText
                              }
                            >
                              {tSafe(
                                'receipt',
                                'Receipt'
                              )}
                            </AppText>
                          </TouchableOpacity>
                        )}

                        {schedule.status ===
                          'pending_payment' && (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate(
                                ROUTES.host_schedule_request,
                                {
                                  scheduleId:
                                    schedule?._id,
                                }
                              )
                            }
                            style={
                              styles.payButton
                            }
                          >
                            <MaterialCommunityIcons
                              name="credit-card"
                              size={16}
                              color={
                                theme.button
                                  .primaryText
                              }
                            />

                            <AppText
                              variant="caption"
                              style={
                                styles.payButtonText
                              }
                            >
                              {tSafe(
                                'pay_now',
                                'Pay Now'
                              )}
                            </AppText>
                          </TouchableOpacity>
                        )}
                      </View>
                    </AppCard>
                  );
                }
              )
            ) : (
              <View
                style={
                  styles.emptyState
                }
              >
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={64}
                  color={
                    theme.icon.muted
                  }
                />

                <AppText
                  variant="h6"
                  style={
                    styles.emptyStateText
                  }
                >
                  {tSafe(
                    'no_schedules_found',
                    'No schedules found'
                  )}
                </AppText>

                <AppText
                  variant="body2"
                  style={
                    styles.emptyStateSubtext
                  }
                >
                  {selectedFilter ===
                  'all'
                    ? tSafe(
                        'empty_all_schedules',
                        "You haven't booked any cleaning schedules yet"
                      )
                    : tSafe(
                        'empty_filtered_schedules',
                        'No {status} schedules',
                        {
                          status:
                            getStatusLabel(
                              selectedFilter
                            ).toLowerCase(),
                        }
                      )}
                </AppText>
              </View>
            )}
          </View>

          {/* =================================================
              HELP SECTION
          ================================================= */}

          <View
            style={
              styles.helpSection
            }
          >
            <View
              style={
                styles.helpHeader
              }
            >
              <MaterialCommunityIcons
                name="help-circle"
                size={24}
                color={
                  theme.text.inverse
                }
              />

              <AppText
                variant="body1"
                style={
                  styles.helpTitle
                }
              >
                {tSafe(
                  'need_help',
                  'Need help with a booking?'
                )}
              </AppText>
            </View>

            <AppText
              variant="body2"
              style={
                styles.helpText
              }
            >
              {tSafe(
                'help_support_text',
                'If you have questions about a schedule or need to make changes, our support team is available 24/7.'
              )}
            </AppText>

            <TouchableOpacity
              style={
                styles.contactSupportButton
              }
            >
              <MaterialCommunityIcons
                name="headset"
                size={20}
                color={
                  theme.brand.primary
                }
              />

              <AppText
                variant="body2"
                style={
                  styles.contactSupportText
                }
              >
                {tSafe(
                  'contact_support',
                  'Contact Support'
                )}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// =============================================================
// Theme helpers
// =============================================================

const withAlpha = (
  color,
  alpha = '20',
  fallback = 'rgba(0,0,0,0.08)'
) => {
  if (
    typeof color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(
      color
    )
  ) {
    return `${color}${alpha}`;
  }

  return fallback;
};

// =============================================================
// STYLES
// =============================================================

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 16,
      paddingTop: 52,
      paddingBottom: 14,
      backgroundColor:
        theme.surface.default,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border.default,
    },

    headerIconButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
    },

    headerTitle: {
      color:
        theme.text.primary,
      fontWeight: '700',
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 32,
    },

    content: {
      padding: 16,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 16,
      color:
        theme.text.secondary,
    },

    // =========================================================
    // BALANCE
    // =========================================================

    balanceCard: {
      backgroundColor:
        theme.brand.primary,
      borderRadius: 18,
      padding: 20,
      marginBottom: 20,
      shadowColor:
        theme.shadow?.color ||
        '#000000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity:
        theme.shadow?.opacity ||
        0.12,
      shadowRadius: 8,
      elevation: 4,
    },

    balanceHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    balanceLabel: {
      color:
        theme.text.inverse,
      opacity: 0.9,
      marginBottom: 6,
      fontWeight: '600',
    },

    balanceAmount: {
      color:
        theme.text.inverse,
      marginBottom: 4,
      fontWeight: '800',
    },

    balanceSubtext: {
      color:
        theme.text.inverse,
      opacity: 0.8,
    },

    balanceIconContainer: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    balanceDivider: {
      height: 1,
      backgroundColor:
        'rgba(255,255,255,0.2)',
      marginVertical: 18,
    },

    balanceFooter: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    balanceFooterItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    balanceFooterText: {
      color:
        theme.text.inverse,
      marginLeft: 6,
      opacity: 0.9,
    },

    balanceCurrency: {
      color:
        theme.text.inverse,
      fontWeight: '700',
      opacity: 0.9,
    },

    // =========================================================
    // TRANSACTIONS
    // =========================================================

    transactionsSection: {
      marginBottom: 24,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    sectionTitle: {
      color:
        theme.text.primary,
      fontWeight: '700',
    },

    sectionSubtitle: {
      color:
        theme.text.muted,
      marginTop: 3,
    },

    transactionCount: {
      minWidth: 28,
      height: 28,
      paddingHorizontal: 8,
      borderRadius: 14,
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      alignItems: 'center',
      justifyContent: 'center',
    },

    transactionCountText: {
      color:
        theme.text.secondary,
      fontWeight: '700',
    },

    transactionCard: {
      paddingHorizontal: 16,
      paddingVertical: 0,
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
    },

    transactionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },

    transactionRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    transactionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    transactionInfo: {
      flex: 1,
      marginRight: 8,
    },

    transactionTitle: {
      color:
        theme.text.primary,
      fontWeight: '700',
      marginBottom: 4,
    },

    transactionDate: {
      color:
        theme.text.muted,
    },

    transactionDescription: {
      color:
        theme.text.muted,
      marginTop: 3,
    },

    transactionAmountContainer: {
      alignItems: 'flex-end',
    },

    transactionAmount: {
      fontWeight: '800',
    },

    transactionStatus: {
      color:
        theme.text.muted,
      marginTop: 4,
      textTransform:
        'capitalize',
    },

    transactionLoading: {
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
      borderRadius: 16,
      paddingVertical: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.card.border ||
        theme.border.default,
    },

    transactionLoadingText: {
      marginTop: 10,
      color:
        theme.text.muted,
    },

    transactionEmpty: {
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
      borderRadius: 16,
      paddingVertical: 30,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.card.border ||
        theme.border.default,
    },

    transactionEmptyTitle: {
      color:
        theme.text.secondary,
      marginTop: 10,
      marginBottom: 4,
      fontWeight: '700',
    },

    transactionEmptyText: {
      color:
        theme.text.muted,
      textAlign: 'center',
    },

    // =========================================================
    // SUMMARY
    // =========================================================

    summaryCards: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },

    summaryCard: {
      flex: 1,
      padding: 20,
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
    },

    summaryLabel: {
      color:
        theme.text.muted,
      marginBottom: 8,
      fontWeight: '500',
    },

    summaryAmount: {
      color:
        theme.text.primary,
      marginBottom: 4,
      fontWeight: '800',
    },

    summarySubtext: {
      color:
        theme.text.muted,
    },

    // =========================================================
    // FILTERS
    // =========================================================

    filterTabsContainer: {
      marginBottom: 24,
    },

    filterTabs: {
      flexDirection: 'row',
      backgroundColor:
        theme.surface.default,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    filterTab: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      minWidth: 100,
    },

    filterTabActive: {
      backgroundColor:
        theme.brand.primary,
    },

    filterTabText: {
      color:
        theme.text.secondary,
      fontWeight: '500',
    },

    filterTabTextActive: {
      color:
        theme.button.primaryText,
      fontWeight: '600',
    },

    // =========================================================
    // SCHEDULE LIST
    // =========================================================

    scheduleList: {
      marginBottom: 24,
    },

    scheduleCard: {
      padding: 16,
      marginBottom: 12,
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
    },

    scheduleHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    scheduleInfo: {
      flex: 1,
      marginRight: 12,
    },

    scheduleTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },

    scheduleApartment: {
      color:
        theme.text.primary,
      marginLeft: 8,
      fontWeight: '700',
    },

    scheduleAddress: {
      color:
        theme.text.secondary,
      marginBottom: 12,
    },

    scheduleMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    metaText: {
      color:
        theme.text.muted,
      marginLeft: 4,
    },

    scheduleAmountContainer: {
      alignItems: 'flex-end',
    },

    scheduleAmount: {
      color:
        theme.text.primary,
      marginBottom: 8,
      fontWeight: '800',
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },

    statusText: {
      fontWeight: '700',
      marginLeft: 4,
      textTransform:
        'uppercase',
    },

    scheduleDetails: {
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    detailRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },

    detailLabel: {
      color:
        theme.text.muted,
    },

    detailValue: {
      color:
        theme.text.primary,
      fontWeight: '500',
    },

    bookingId: {
      color:
        theme.brand.primary,
      fontWeight: '600',
    },

    scheduleActions: {
      flexDirection: 'row',
      gap: 10,
    },

    viewButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 12,
      backgroundColor:
        theme.surface.default,
      borderRadius: 12,
      borderWidth: 1.5,
    },

    viewButtonText: {
      fontWeight: '600',
      marginLeft: 6,
    },

    receiptButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor:
        theme.surface.default,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor:
        theme.status.success,
    },

    receiptButtonText: {
      color:
        theme.status.success,
      fontWeight: '600',
      marginLeft: 6,
    },

    payButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor:
        theme.button
          .primaryBackground,
    },

    payButtonText: {
      color:
        theme.button.primaryText,
      fontWeight: '600',
      marginLeft: 6,
    },

    // =========================================================
    // EMPTY STATE
    // =========================================================

    emptyState: {
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 60,
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
      borderRadius: 16,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor:
        theme.card.border ||
        theme.border.default,
    },

    emptyStateText: {
      color:
        theme.text.secondary,
      marginTop: 20,
      marginBottom: 8,
      fontWeight: '700',
    },

    emptyStateSubtext: {
      color:
        theme.text.muted,
      textAlign: 'center',
      lineHeight: 22,
    },

    // =========================================================
    // HELP
    // =========================================================

    helpSection: {
      borderRadius: 16,
      padding: 20,
      backgroundColor:
        theme.brand.primary,
    },

    helpHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    helpTitle: {
      color:
        theme.text.inverse,
      marginLeft: 10,
      fontWeight: '700',
    },

    helpText: {
      color:
        theme.text.inverse,
      lineHeight: 20,
      marginBottom: 20,
      opacity: 0.9,
    },

    contactSupportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 14,
      backgroundColor:
        theme.surface.default,
      borderRadius: 12,
    },

    contactSupportText: {
      color:
        theme.brand.primary,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

export default PaymentHistory;