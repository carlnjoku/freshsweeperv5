// import React, { useContext, useRef, useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   StatusBar,
//   Text,
//   RefreshControl,
//   Dimensions,
//   FlatList,
//   ScrollView,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert
// } from 'react-native';
// import Button from '../../components/shared/Button';
// import { db } from '../../services/firebase/config';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import { Avatar } from 'react-native-paper';
// import * as Animatable from 'react-native-animatable';
// import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
// import CertificationDisplay from '../cleaner/CertificationDisplay';
// import { cleanerPortfolio } from '../../utils/cleanerPortfolio';
// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import userService from '../../services/connection/userService';
// import { SchedulePrice } from '../../components/host/SchedulePrice';
// import ROUTES from '../../constants/routes';
// import { haversineDistance } from '../../utils/distanceBtwLocation';
// import Reviews from '../../components/shared/Reviews';
// import Modal from 'react-native-modal';
// import moment from 'moment';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { calculateOverallRating } from '../../utils/calculate_overall_rating';
// import StarRating from 'react-native-star-rating-widget';
// import { useRoute } from '@react-navigation/native';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import CompareCleanerModal from '../../components/host/CompareCleanerModal';

// const { width, height } = Dimensions.get('window');

// const CleanerProfilePay = ({ navigation }) => {
//   const route = useRoute();
//   const { item, selected_schedule, assignedTo, expected_cleaners, selected_scheduleId, requestId, cleanerId } = route.params;

//   const cleaner = item;
//   console.log(cleaner)
//   const { currentUserId, friendsWithLastMessagesUnread, fbaseUser, currency } = useContext(AuthContext);
//   const { selectedCleaners, addCleaner, replaceCleaner } = useCleanerSelection();
//   const [showCompareModal, setShowCompareModal] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [visible, setVisible] = React.useState(false);
//   const [rating, setRating] = useState("");

//   // SAFE groups definition
//   const groups = (expected_cleaners && expected_cleaners.checklist) 
//     ? Object.keys(expected_cleaners.checklist) 
//     : [];

//   const groupCount = groups.length;

//   // Enhanced function to find group by cleaner ID
//   const findGroupByCleanerId = (cleanerId) => {
//     if (!assignedTo || !Array.isArray(assignedTo)) return null;
    
//     const match = assignedTo.find(item => {
//       if (!item) return false;
//       if (item.cleanerId === cleanerId) return true;
//       if (item.acceptedCleaners && Array.isArray(item.acceptedCleaners)) {
//         return item.acceptedCleaners.includes(cleanerId);
//       }
//       return false;
//     });
    
//     return match ? match.group : null;
//   };

//   const groupName = findGroupByCleanerId(cleaner._id);
//   const [expected_number_of_leaners, setExpectedCleaners] = useState(groupCount);

//   // Safe location access
//   const cleanerLocation = { 
//     latitude: cleaner?.location?.latitude || 0, 
//     longitude: cleaner?.location?.longitude || 0 
//   };
//   const scheduleLocation = {
//     latitude: selected_schedule?.schedule?.apartment_latitude || selected_schedule?.apartment_latitude || 0,
//     longitude: selected_schedule?.schedule?.apartment_longitude || selected_schedule?.apartment_longitude || 0
//   };

//   const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);

//   const openReviews = () => {
//     setVisible(true);
//   };

//   useEffect(() => {
//     fetchCleanerFeedbacks();
//   }, []);

//   const fetchCleanerFeedbacks = async () => {
//     try {
//       const response = await userService.getCleanerFeedbacks(cleaner._id);
//       console.log('Fetched reviews:', response.data); // Debug log
//       setReviews(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching feedbacks:', error);
//       setReviews([]); // Ensure it's always an array
//     }
//   };

//   // Check if this cleaner is already selected
//   const isSelected = selectedCleaners.some(c => c._id === cleaner._id);

//   const handleSelectForPayment = async () => {
//     if (isSelected) {
//       Alert.alert('Already Selected', 'This cleaner is already selected for payment.');
//       return;
//     }
    
//     try {
//       const groupName = findGroupByCleanerId(cleaner._id);
      
//       if (!groupName) {
//         Alert.alert('Error', 'Could not determine group for this cleaner.');
//         return;
//       }

//       // Update backend first
//       const data = {
//         cleanerId: cleaner._id,
//         scheduleId: selected_scheduleId,
//         selected_group: groupName
//       };
      
//       console.log('Updating assignedTo with:', data);
//       await userService.updateAssignedToID(data);
      
//       // Create a cleaner object with group information
//       const cleanerWithGroup = { 
//         ...cleaner, 
//         group: groupName 
//       };
      
//       // Then update the context
//       addCleaner(cleanerWithGroup, assignedTo);
      
//       Alert.alert('Success', 'Cleaner selected for payment!', [
//         { text: 'OK', onPress: () => navigation.goBack() }
//       ]);
      
//     } catch (error) {
//       console.error('Error selecting cleaner:', error);
//       Alert.alert('Error', 'Failed to select cleaner. Please try again.');
//     }
//   };

//   const handleProceedToCheckout = () => {
//     // if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
//     //   Alert.alert('Error', 'No cleaners/groups assigned.');
//     //   return;
//     // }

//     // // Build a map of selected group -> cleaner
//     // const groupMap = {};
//     // (selectedCleaners || []).forEach(c => {
//     //   const group = findGroupByCleanerId(c._id);
//     //   if (group) {
//     //     groupMap[group] = groupMap[group] ? [...groupMap[group], c._id] : [c._id];
//     //   }
//     // });

//     // // Check for missing groups
//     // const missingGroups = groups.filter(g => !groupMap[g] || groupMap[g].length === 0);
//     // if (missingGroups.length > 0) {
//     //   Alert.alert('Incomplete Selection', `Please select one cleaner for each group: ${missingGroups.join(', ')}`);
//     //   return;
//     // }

//     // // Check for duplicates within the same group
//     // const duplicates = Object.entries(groupMap)
//     //   .filter(([group, ids]) => ids.length > 1)
//     //   .map(([group]) => group);

//     // if (duplicates.length > 0) {
//     //   Alert.alert('Duplicate Selection', `Only one cleaner can be assigned per group: ${duplicates.join(', ')}`);
//     //   return;
//     // }

//     // Everything is valid, proceed to checkout
//     navigation.navigate(ROUTES.host_single_checkout, { 
//       cleaning_fee: selected_schedule?.total_cleaning_fee, 
//       scheduleId: selected_scheduleId,
//       cleanerId: item._id,
//       cleaner_stripe_account_id: item.stripe_account_id,
//       cleaner_avatar: item.avatar,
//       cleaner_firstname: item.firstname,
//       cleaner_lastname: item.lastname,
//       cleaner_phone: item.phone,
//       cleaner_latitude: item.location?.latitude,
//       cleaner_longitude: item.location?.longitude,
//       schedule: selected_schedule,
//       requestId: requestId,
//       selected_group: groupName
//     });
//   };

//   // Handle cleaner replacement from compare modal
//   const handleReplaceCleaner = async (cleanerToRemove) => {
//     try {
//       const groupName = findGroupByCleanerId(cleaner._id);
      
//       if (!groupName) {
//         Alert.alert('Error', 'Could not determine group for this cleaner.');
//         return;
//       }

//       // Update backend first
//       const data = {
//         cleanerId: cleaner._id,
//         scheduleId: selected_scheduleId,
//         selected_group: groupName,
//       };
      
//       await userService.updateAssignedToID(data);

//       // Create a cleaner object with group information
//       const cleanerWithGroup = { 
//         ...cleaner, 
//         group: groupName 
//       };

//       // Then update the context for replacement
//       replaceCleaner(cleanerToRemove._id, cleanerWithGroup, assignedTo);

//       setShowCompareModal(false);
      
//       Alert.alert('Success', 'Cleaner replaced successfully!', [
//         { text: 'OK', onPress: () => navigation.goBack() }
//       ]);
      
//     } catch (error) {
//       console.error('Error replacing cleaner:', error);
//       Alert.alert('Error', 'Failed to replace cleaner. Please try again.');
//     }
//   };

//   // Main selection handler - decides whether to show compare modal or select directly
//   const handleSelection = () => {
//     if (isSelected) {
//       Alert.alert('Already Selected', 'This cleaner is already selected.');
//       return;
//     }

//     // Check if we're exceeding the expected number of cleaners
//     if ((selectedCleaners?.length || 0) >= expected_number_of_leaners) {
//       setShowCompareModal(true);
//     } else {
//       handleSelectForPayment();
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <StatusBar translucent backgroundColor={COLORS.primary} />

//       <View style={styles.avatar_background}>
//         {item.avatar !== "" ? 
//           <Avatar.Image
//             size={120}
//             source={{uri: item.avatar}}
//             style={{ backgroundColor: COLORS.gray, marginBottom: 0 }}
//           />
//           :
//           <Avatar.Icon
//             size={120}
//             icon="account"
//             style={styles.avatar}
//           />
//         }
//         <Text style={styles.name}>{cleaner.firstname} {cleaner.lastname}</Text>
//         <Text style={styles.location}>{cleaner.location?.city || 'Unknown'}, {cleaner.location?.region_code || 'Unknown'}</Text>
//         <Text style={{ fontSize: 13, color: COLORS.white, paddingHorizontal: 10 }}>
//           {distanceKm?.toFixed(1)} miles away
//         </Text>
//         <Text style={{ fontSize: 12, color: COLORS.white, marginTop: 5 }}>
//           Group: {groupName || 'Not assigned'} | Selected: {isSelected ? 'Yes' : 'No'}
//         </Text>
//       </View>

//       <ScrollView style={styles.content} refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={() => fetchCleanerFeedbacks()} />
//       }>
//         <View style={styles.rating_review}>
//           <View>
//             <Text bold style={styles.title}>Reviews & Ratings</Text>
//             <View style={styles.rating}>
//               <StarRating
//                 rating={calculateOverallRating(reviews, item._id)}
//                 onChange={() => {}}
//                 maxStars={5}
//                 starSize={18}
//                 starStyle={{ marginHorizontal: 0 }}
//               />
//               <Text style={{marginLeft:5}}>{calculateOverallRating(reviews, item._id)}</Text>
//             </View>
//           </View>
//           <View>
//             {reviews.length > 0 && 
//               <Text onPress={openReviews} style={{color:COLORS.primary}}>
//                 See all {reviews.length} reviews
//               </Text>
//             }
//           </View>
//         </View>

//         <View style={styles.tabsContainer}>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
//             <Text style={styles.tab_text}>About</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
//             <Text style={styles.tab_text}>Availability</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
//             <Text style={styles.tab_text}>License</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 4 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(4)}>
//             <Text style={styles.tab_text}>Portfolio</Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={{padding:0}}>
//           {currentStep === 1 && 
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
//                 <AboutMeDisplay 
//                   mode="display"
//                   aboutme={item.aboutme}
//                 />
//               </ScrollView>
//             </Animatable.View>
//           }
//           {currentStep === 2 && 
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <AvailabilityDisplay
//                 mode="display"
//                 availability={item.availability}
//               />
//             </Animatable.View>
//           }
//           {currentStep === 3 && 
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <CertificationDisplay
//                 mode="display"
//                 certification={item.certification}
//               />
//             </Animatable.View>
//           }
//           {currentStep === 4 &&
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <ScrollView
//                 contentContainerStyle={{ flexGrow: 1 }}
//                 showsVerticalScrollIndicator={false}
//                 bounces={false}
//               >
//                 {/* Portfolio content would go here */}
//               </ScrollView>
//             </Animatable.View>
//           }
//         </View>
//       </ScrollView>

//       {/* <View style={styles.navigation}>
//         <SchedulePrice currency={currency} price={selected_schedule?.total_cleaning_fee} />
//         {expected_number_of_leaners > 1 ? 
//           <TouchableOpacity 
//             style={[styles.paymentBtn, isSelected && styles.selectedBtn]} 
//             onPress={handleSelection}
//           >
//             <Text style={styles.paymentText}>
//               {isSelected ? 'Selected ✓' : 'Select for Payment'}
//             </Text>
//           </TouchableOpacity>
//           :
//           <TouchableOpacity 
//             style={styles.paymentBtn}
//             onPress={handleProceedToCheckout}
//           >
//             <Text style={styles.paymentText}>Pay Now</Text>
//           </TouchableOpacity>
//         }
//       </View> */}

//       <View style={styles.navigation}>
//         <SchedulePrice currency={currency} price={selected_schedule?.total_cleaning_fee} />
//         {expected_number_of_leaners > 1 ? (
//           <TouchableOpacity 
//             style={[styles.paymentBtn, isSelected && styles.selectedBtn]} 
//             onPress={handleSelection}
//           >
//             <Text style={styles.paymentText}>
//               {isSelected ? 'Selected ✓' : 'Select for Payment'}
//             </Text>
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.singleButtons}>
//             <TouchableOpacity 
//               style={styles.cancelBtn} 
//               onPress={() => navigation.goBack()}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.paymentBtn} 
//               onPress={handleProceedToCheckout}
//             >
//               <Text style={styles.paymentText}>Pay Now</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* Compare Modal */}
//       {showCompareModal && (
//         <CompareCleanerModal
//           visible={showCompareModal}
//           onClose={() => setShowCompareModal(false)}
//           existingCleaners={selectedCleaners || []}
//           newCleaner={cleaner}
//           onReplace={handleReplaceCleaner}
//         />
//       )}

//       {/* Reviews Modal - FIXED VERSION */}
//       <Modal 
//         isVisible={visible} 
//         onSwipeComplete={() => setVisible(false)} 
//         swipeDirection="down"
//         onBackdropPress={() => setVisible(false)}
//         style={styles.modal}
//         propagateSwipe={true}
//         backdropColor="black"
//         backdropOpacity={0.5}
//         useNativeDriver={true}
//         avoidKeyboard={true}
//       >
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <View style={styles.modalTitleContainer}>
//               <Text style={styles.modalTitle}>Customer Reviews</Text>
//               <View style={styles.rating}>
//                 <StarRating
//                   rating={calculateOverallRating(reviews, item._id)}
//                   onChange={() => {}}
//                   maxStars={5}
//                   starSize={18}
//                   starStyle={{ marginHorizontal: 0 }}
//                 />
//                 <Text style={styles.ratingText}>
//                   {calculateOverallRating(reviews, item._id)} ({reviews.length} reviews)
//                 </Text>
//               </View>
//             </View>
//             <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
//               <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
//             </TouchableOpacity>
//           </View>
          
//           {/* Reviews Component - FIXED */}
//           <View style={styles.reviewsContainer}>
//             <Reviews ratings={reviews} cleanerId={item._id} />
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeContainer: { 
//     flex: 1, 
//     backgroundColor: '#f8f8f8' 
//   },
//   content: { 
//     paddingHorizontal: 15, 
//     paddingTop: 15,
//     flex: 1 
//   },
//   avatar_background: { 
//     height: 220, 
//     backgroundColor: COLORS.primary, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   name: { 
//     marginTop: 10, 
//     fontSize: 18, 
//     color: COLORS.white, 
//     fontWeight: 'bold' 
//   },
//   location: { 
//     fontSize: 16, 
//     color: COLORS.white 
//   },
//   rating_review: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     marginBottom: 10, 
//     paddingHorizontal: 10 
//   },
//   rating: { 
//     flexDirection: 'row', 
//     alignItems: 'center' 
//   },
//   navigation: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     paddingHorizontal: 10, 
//     paddingVertical: 15, 
//     backgroundColor: '#fff' 
//   },
//   paymentBtn: { 
//     backgroundColor: COLORS.primary, 
//     width: 180, 
//     borderRadius: 50, 
//     height: 44, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   selectedBtn: {
//     backgroundColor: '#4CAF50',
//   },
//   paymentText: { 
//     color: 'white', 
//     fontWeight: 'bold' 
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomColor: "#e9e9e9",
//     marginTop: 10
//   },
//   tab: {
//     borderBottomWidth: 1,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 26
//   },
//   tab_text: {
//     marginBottom: 5,
//   },
//   // MODAL STYLES - FIXED
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: '80%',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 15,
//   },
//   modalTitleContainer: {
//     flex: 1,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   ratingText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   closeIcon: {
//     padding: 5,
//     marginTop: 5,
//   },
//   reviewsContainer: {
//     flex: 1,
//   },
//   singleButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   cancelBtn: {
//     backgroundColor: COLORS.gray,
//     width: 100,
//     borderRadius: 50,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cancelText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default CleanerProfilePay;


// import React, { useContext, useRef, useEffect, useState, useMemo } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   StatusBar,
//   Text,
//   RefreshControl,
//   Dimensions,
//   FlatList,
//   ScrollView,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert
// } from 'react-native';
// import Button from '../../components/shared/Button';
// import { db } from '../../services/firebase/config';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import { Avatar } from 'react-native-paper';
// import * as Animatable from 'react-native-animatable';
// import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
// import CertificationDisplay from '../cleaner/CertificationDisplay';
// import { cleanerPortfolio } from '../../utils/cleanerPortfolio';
// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import userService from '../../services/connection/userService';
// import { SchedulePrice } from '../../components/host/SchedulePrice';
// import ROUTES from '../../constants/routes';
// import { haversineDistance } from '../../utils/distanceBtwLocation';
// import Reviews from '../../components/shared/Reviews';
// import Modal from 'react-native-modal';
// import moment from 'moment';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { calculateOverallRating } from '../../utils/calculate_overall_rating';
// import StarRating from 'react-native-star-rating-widget';
// import { useRoute } from '@react-navigation/native';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import CompareCleanerModal from '../../components/host/CompareCleanerModal';

// const { width, height } = Dimensions.get('window');

// const CleanerProfilePay = ({ navigation }) => {
//   const route = useRoute();
//   const { item, selected_schedule, assignedTo, expected_cleaners, selected_scheduleId, requestId, cleanerId } = route.params;

//   const cleaner = item;
//   console.log(cleaner);
//   const { currentUserId, friendsWithLastMessagesUnread, fbaseUser, currency } = useContext(AuthContext);
//   const { selectedCleaners, addCleaner, replaceCleaner } = useCleanerSelection();
//   const [showCompareModal, setShowCompareModal] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [visible, setVisible] = React.useState(false);
//   const [rating, setRating] = useState("");

//   // SAFE groups definition
//   const groups = (expected_cleaners && expected_cleaners.checklist) 
//     ? Object.keys(expected_cleaners.checklist) 
//     : [];

//   const groupCount = groups.length;

//   // Enhanced function to find group by cleaner ID
//   const findGroupByCleanerId = (cleanerId) => {
//     if (!assignedTo || !Array.isArray(assignedTo)) return null;
    
//     const match = assignedTo.find(item => {
//       if (!item) return false;
//       if (item.cleanerId === cleanerId) return true;
//       if (item.acceptedCleaners && Array.isArray(item.acceptedCleaners)) {
//         return item.acceptedCleaners.includes(cleanerId);
//       }
//       return false;
//     });
    
//     return match ? match.group : null;
//   };

//   const groupName = findGroupByCleanerId(cleaner._id);
//   const [expected_number_of_leaners, setExpectedCleaners] = useState(groupCount);

//   // Compute the cleaner's fee from assignedTo
//   const cleanerFee = useMemo(() => {
//     if (!assignedTo || !Array.isArray(assignedTo)) return 0;
//     const assignedEntry = assignedTo.find(a => a.cleanerId === cleaner._id);
//     return assignedEntry?.checklist?.price || 0;
//   }, [assignedTo, cleaner._id]);


//   // Safe location access
//   const cleanerLocation = { 
//     latitude: cleaner?.location?.latitude || 0, 
//     longitude: cleaner?.location?.longitude || 0 
//   };
//   const scheduleLocation = {
//     latitude: selected_schedule?.schedule?.apartment_latitude || selected_schedule?.apartment_latitude || 0,
//     longitude: selected_schedule?.schedule?.apartment_longitude || selected_schedule?.apartment_longitude || 0
//   };

//   const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);

//   const openReviews = () => {
//     setVisible(true);
//   };

//   useEffect(() => {
//     fetchCleanerFeedbacks();
//   }, []);

//   const fetchCleanerFeedbacks = async () => {
//     try {
//       const response = await userService.getCleanerFeedbacks(cleaner._id);
//       console.log('Fetched reviews:', response.data);
//       setReviews(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching feedbacks:', error);
//       setReviews([]);
//     }
//   };

//   // Check if this cleaner is already selected
//   const isSelected = selectedCleaners.some(c => c._id === cleaner._id);

//   const handleSelectForPayment = async () => {
//     if (isSelected) {
//       Alert.alert('Already Selected', 'This cleaner is already selected for payment.');
//       return;
//     }
    
//     try {
//       const groupName = findGroupByCleanerId(cleaner._id);
      
//       if (!groupName) {
//         Alert.alert('Error', 'Could not determine group for this cleaner.');
//         return;
//       }

//       // Update backend first
//       const data = {
//         cleanerId: cleaner._id,
//         scheduleId: selected_scheduleId,
//         selected_group: groupName
//       };
      
//       console.log('Updating assignedTo with:', data);
//       await userService.updateAssignedToID(data);
      
//       // Create a cleaner object with group information
//       const cleanerWithGroup = { 
//         ...cleaner, 
//         group: groupName 
//       };
      
//       // Then update the context
//       addCleaner(cleanerWithGroup, assignedTo);
      
//       Alert.alert('Success', 'Cleaner selected for payment!', [
//         { text: 'OK', onPress: () => navigation.goBack() }
//       ]);
      
//     } catch (error) {
//       console.error('Error selecting cleaner:', error);
//       Alert.alert('Error', 'Failed to select cleaner. Please try again.');
//     }
//   };

//   const handleProceedToCheckout = () => {
//     // Everything is valid, proceed to checkout
//     navigation.navigate(ROUTES.host_single_checkout, { 
//       cleaning_fee: cleanerFee, // Use cleaner-specific fee
//       scheduleId: selected_scheduleId,
//       cleanerId: item._id,
//       cleaner_stripe_account_id: item.stripe_account_id,
//       cleaner_avatar: item.avatar,
//       cleaner_firstname: item.firstname,
//       cleaner_lastname: item.lastname,
//       cleaner_phone: item.phone,
//       cleaner_latitude: item.location?.latitude,
//       cleaner_longitude: item.location?.longitude,
//       schedule: selected_schedule,
//       requestId: requestId,
//       selected_group: groupName
//     });
//   };

//   // Handle cleaner replacement from compare modal
//   const handleReplaceCleaner = async (cleanerToRemove) => {
//     try {
//       const groupName = findGroupByCleanerId(cleaner._id);
      
//       if (!groupName) {
//         Alert.alert('Error', 'Could not determine group for this cleaner.');
//         return;
//       }

//       // Update backend first
//       const data = {
//         cleanerId: cleaner._id,
//         scheduleId: selected_scheduleId,
//         selected_group: groupName,
//       };
      
//       await userService.updateAssignedToID(data);

//       // Create a cleaner object with group information
//       const cleanerWithGroup = { 
//         ...cleaner, 
//         group: groupName 
//       };

//       // Then update the context for replacement
//       replaceCleaner(cleanerToRemove._id, cleanerWithGroup, assignedTo);

//       setShowCompareModal(false);
      
//       Alert.alert('Success', 'Cleaner replaced successfully!', [
//         { text: 'OK', onPress: () => navigation.goBack() }
//       ]);
      
//     } catch (error) {
//       console.error('Error replacing cleaner:', error);
//       Alert.alert('Error', 'Failed to replace cleaner. Please try again.');
//     }
//   };

//   // Main selection handler - decides whether to show compare modal or select directly
//   const handleSelection = () => {
//     if (isSelected) {
//       Alert.alert('Already Selected', 'This cleaner is already selected.');
//       return;
//     }

//     // Check if we're exceeding the expected number of cleaners
//     if ((selectedCleaners?.length || 0) >= expected_number_of_leaners) {
//       setShowCompareModal(true);
//     } else {
//       handleSelectForPayment();
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <StatusBar translucent backgroundColor={COLORS.primary} />

//       <View style={styles.avatar_background}>
//         {item.avatar !== "" ? 
//           <Avatar.Image
//             size={120}
//             source={{uri: item.avatar}}
//             style={{ backgroundColor: COLORS.gray, marginBottom: 0 }}
//           />
//           :
//           <Avatar.Icon
//             size={120}
//             icon="account"
//             style={styles.avatar}
//           />
//         }
//         <Text style={styles.name}>{cleaner.firstname} {cleaner.lastname}</Text>
//         <Text style={styles.location}>{cleaner.location?.city || 'Unknown'}, {cleaner.location?.region_code || 'Unknown'}</Text>
//         <Text style={{ fontSize: 13, color: COLORS.white, paddingHorizontal: 10 }}>
//           {distanceKm?.toFixed(1)} miles away
//         </Text>
//         {/* <Text style={{ fontSize: 12, color: COLORS.white, marginTop: 5 }}>
//           Group: {groupName || 'Not assigned'} | Fee: ${(cleanerFee || 0).toFixed(2)} | Selected: {isSelected ? 'Yes' : 'No'}
//         </Text> */}
//       </View>

//       <ScrollView style={styles.content} refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={() => fetchCleanerFeedbacks()} />
//       }>
//         <View style={styles.rating_review}>
//           <View>
//             <Text bold style={styles.title}>Reviews & Ratings</Text>
//             <View style={styles.rating}>
//               <StarRating
//                 rating={calculateOverallRating(reviews, item._id)}
//                 onChange={() => {}}
//                 maxStars={5}
//                 starSize={18}
//                 starStyle={{ marginHorizontal: 0 }}
//               />
//               <Text style={{marginLeft:5}}>{calculateOverallRating(reviews, item._id)}</Text>
//             </View>
//           </View>
//           <View>
//             {reviews.length > 0 && 
//               <Text onPress={openReviews} style={{color:COLORS.primary}}>
//                 See all {reviews.length} reviews
//               </Text>
//             }
//           </View>
//         </View>

//         <View style={styles.tabsContainer}>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
//             <Text style={styles.tab_text}>About</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
//             <Text style={styles.tab_text}>Availability</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
//             <Text style={styles.tab_text}>License</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 4 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(4)}>
//             <Text style={styles.tab_text}>Portfolio</Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={{padding:0}}>
//           {currentStep === 1 && 
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
//                 <AboutMeDisplay 
//                   mode="display"
//                   aboutme={item.aboutme}
//                 />
//               </ScrollView>
//             </Animatable.View>
//           }
//           {currentStep === 2 && 
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <AvailabilityDisplay
//                 mode="display"
//                 availability={item.availability}
//               />
//             </Animatable.View>
//           }
//           {currentStep === 3 && 
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <CertificationDisplay
//                 mode="display"
//                 certification={item.certification}
//               />
//             </Animatable.View>
//           }
//           {currentStep === 4 &&
//             <Animatable.View animation="slideInLeft" duration={600}>
//               <ScrollView
//                 contentContainerStyle={{ flexGrow: 1 }}
//                 showsVerticalScrollIndicator={false}
//                 bounces={false}
//               >
//                 {/* Portfolio content would go here */}
//               </ScrollView>
//             </Animatable.View>
//           }
//         </View>
//       </ScrollView>

//       {/* Navigation with cleaner-specific fee */}
//       <View style={styles.navigation}>
//       {expected_number_of_leaners > 1 ? <SchedulePrice currency={currency} price={(cleanerFee || 0).toFixed(2)} /> 
//       :
//       <SchedulePrice currency={currency} price={(selected_schedule?.total_cleaning_fee || 0).toFixed(2)} />
//       }
        
//         {expected_number_of_leaners > 1 ? (
//           <TouchableOpacity 
//             // style={[styles.paymentBtn, isSelected && styles.selectedBtn]} 
//             onPress={handleSelection}

//             style={[
//               styles.paymentBtn,
//               { width: expected_number_of_leaners > 1 ? 180 : 100 }
//             ]}
//           >
//             <Text style={styles.paymentText}>
//               {isSelected ? 'Selected ✓' : 'Select for Payment'}
//             </Text>
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.singleButtons}>
//             <TouchableOpacity 
//               style={styles.cancelBtn} 
//               onPress={() => navigation.goBack()}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.paymentBtn} 
//               onPress={handleProceedToCheckout}
//             >
//               <Text style={styles.paymentText}>Pay Now</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* Compare Modal */}
//       {showCompareModal && (
//         <CompareCleanerModal
//           visible={showCompareModal}
//           onClose={() => setShowCompareModal(false)}
//           existingCleaners={selectedCleaners || []}
//           newCleaner={cleaner}
//           onReplace={handleReplaceCleaner}
//         />
//       )}

//       {/* Reviews Modal */}
//       <Modal 
//         isVisible={visible} 
//         onSwipeComplete={() => setVisible(false)} 
//         swipeDirection="down"
//         onBackdropPress={() => setVisible(false)}
//         style={styles.modal}
//         propagateSwipe={true}
//         backdropColor="black"
//         backdropOpacity={0.5}
//         useNativeDriver={true}
//         avoidKeyboard={true}
//       >
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <View style={styles.modalTitleContainer}>
//               <Text style={styles.modalTitle}>Customer Reviews</Text>
//               <View style={styles.rating}>
//                 <StarRating
//                   rating={calculateOverallRating(reviews, item._id)}
//                   onChange={() => {}}
//                   maxStars={5}
//                   starSize={18}
//                   starStyle={{ marginHorizontal: 0 }}
//                 />
//                 <Text style={styles.ratingText}>
//                   {calculateOverallRating(reviews, item._id)} ({reviews.length} reviews)
//                 </Text>
//               </View>
//             </View>
//             <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
//               <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.reviewsContainer}>
//             <Reviews ratings={reviews} cleanerId={item._id} />
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeContainer: { 
//     flex: 1, 
//     backgroundColor: '#f8f8f8' 
//   },
//   content: { 
//     paddingHorizontal: 15, 
//     paddingTop: 15,
//     flex: 1 
//   },
//   avatar_background: { 
//     height: 220, 
//     backgroundColor: COLORS.primary, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   name: { 
//     marginTop: 10, 
//     fontSize: 18, 
//     color: COLORS.white, 
//     fontWeight: 'bold' 
//   },
//   location: { 
//     fontSize: 16, 
//     color: COLORS.white 
//   },
//   rating_review: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     marginBottom: 10, 
//     paddingHorizontal: 10 
//   },
//   rating: { 
//     flexDirection: 'row', 
//     alignItems: 'center' 
//   },
//   navigation: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     paddingHorizontal: 10, 
//     paddingVertical: 15, 
//     backgroundColor: '#fff' 
//   },
//   paymentBtn: { 
//     backgroundColor: COLORS.primary, 
//     width: 100, 
//     borderRadius: 50, 
//     height: 44, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   selectedBtn: {
//     backgroundColor: '#4CAF50',
//   },
//   paymentText: { 
//     color: 'white', 
//     fontWeight: 'bold' 
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomColor: "#e9e9e9",
//     marginTop: 10
//   },
//   tab: {
//     borderBottomWidth: 1,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 26
//   },
//   tab_text: {
//     marginBottom: 5,
//   },
//   // MODAL STYLES
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: '80%',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 15,
//   },
//   modalTitleContainer: {
//     flex: 1,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   ratingText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   closeIcon: {
//     padding: 5,
//     marginTop: 5,
//   },
//   reviewsContainer: {
//     flex: 1,
//   },
//   singleButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   cancelBtn: {
//     backgroundColor: COLORS.gray,
//     width: 100,
//     borderRadius: 50,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cancelText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default CleanerProfilePay;





import React, { useContext, useRef, useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  RefreshControl,
  Dimensions,
  FlatList,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import Button from '../../components/shared/Button';
import { db } from '../../services/firebase/config';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import { Avatar } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
import CertificationDisplay from '../cleaner/CertificationDisplay';
import { cleanerPortfolio } from '../../utils/cleanerPortfolio';
import AboutMeDisplay from '../cleaner/AboutMeDisplay';
import userService from '../../services/connection/userService';
import { SchedulePrice } from '../../components/host/SchedulePrice';
import ROUTES from '../../constants/routes';
import { haversineDistance } from '../../utils/distanceBtwLocation';
import Reviews from '../../components/shared/Reviews';
import Modal from 'react-native-modal';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import StarRating from 'react-native-star-rating-widget';
import { useRoute } from '@react-navigation/native';
import { useCleanerSelection } from '../../context/CleanerSelectionContext';
import CompareCleanerModal from '../../components/host/CompareCleanerModal';
import { tSafe } from '../../utils/tSafe'; // added import

const { width, height } = Dimensions.get('window');

const CleanerProfilePay = ({ navigation }) => {
  const route = useRoute();
  const { item, selected_schedule, assignedTo, expected_cleaners, selected_scheduleId, requestId, cleanerId } = route.params;

  const cleaner = item;
  console.log(cleaner);
  const { currentUserId, friendsWithLastMessagesUnread, fbaseUser, currency } = useContext(AuthContext);
  const { selectedCleaners, addCleaner, replaceCleaner } = useCleanerSelection();
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [visible, setVisible] = React.useState(false);
  const [rating, setRating] = useState("");

  // SAFE groups definition
  const groups = (expected_cleaners && expected_cleaners.checklist) 
    ? Object.keys(expected_cleaners.checklist) 
    : [];

  const groupCount = groups.length;

  // Enhanced function to find group by cleaner ID
  const findGroupByCleanerId = (cleanerId) => {
    if (!assignedTo || !Array.isArray(assignedTo)) return null;
    
    const match = assignedTo.find(item => {
      if (!item) return false;
      if (item.cleanerId === cleanerId) return true;
      if (item.acceptedCleaners && Array.isArray(item.acceptedCleaners)) {
        return item.acceptedCleaners.includes(cleanerId);
      }
      return false;
    });
    
    return match ? match.group : null;
  };

  const groupName = findGroupByCleanerId(cleaner._id);
  const [expected_number_of_leaners, setExpectedCleaners] = useState(groupCount);

  // Compute the cleaner's fee from assignedTo
  const cleanerFee = useMemo(() => {
    if (!assignedTo || !Array.isArray(assignedTo)) return 0;
    const assignedEntry = assignedTo.find(a => a.cleanerId === cleaner._id);
    return assignedEntry?.checklist?.price || 0;
  }, [assignedTo, cleaner._id]);


  // Safe location access
  const cleanerLocation = { 
    latitude: cleaner?.location?.latitude || 0, 
    longitude: cleaner?.location?.longitude || 0 
  };
  const scheduleLocation = {
    latitude: selected_schedule?.schedule?.apartment_latitude || selected_schedule?.apartment_latitude || 0,
    longitude: selected_schedule?.schedule?.apartment_longitude || selected_schedule?.apartment_longitude || 0
  };

  const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);

  const openReviews = () => {
    setVisible(true);
  };

  useEffect(() => {
    fetchCleanerFeedbacks();
  }, []);

  const fetchCleanerFeedbacks = async () => {
    try {
      const response = await userService.getCleanerFeedbacks(cleaner._id);
      console.log('Fetched reviews:', response.data);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setReviews([]);
    }
  };

  // Check if this cleaner is already selected
  const isSelected = selectedCleaners.some(c => c._id === cleaner._id);

  const handleSelectForPayment = async () => {
    if (isSelected) {
      Alert.alert(tSafe('already_selected_title', 'Already Selected'), tSafe('already_selected_message', 'This cleaner is already selected for payment.'));
      return;
    }
    
    try {
      const groupName = findGroupByCleanerId(cleaner._id);
      
      if (!groupName) {
        Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_determine_group', 'Could not determine group for this cleaner.'));
        return;
      }

      // Update backend first
      const data = {
        cleanerId: cleaner._id,
        scheduleId: selected_scheduleId,
        selected_group: groupName
      };
      
      console.log('Updating assignedTo with:', data);
      await userService.updateAssignedToID(data);
      
      // Create a cleaner object with group information
      const cleanerWithGroup = { 
        ...cleaner, 
        group: groupName 
      };
      
      // Then update the context
      addCleaner(cleanerWithGroup, assignedTo);
      
      Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaner_selected', 'Cleaner selected for payment!'), [
        { text: tSafe('ok', 'OK'), onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error selecting cleaner:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_select_cleaner', 'Failed to select cleaner. Please try again.'));
    }
  };

  const handleProceedToCheckout = () => {
    // Everything is valid, proceed to checkout
    navigation.navigate(ROUTES.host_single_checkout, { 
      cleaning_fee: cleanerFee, // Use cleaner-specific fee
      scheduleId: selected_scheduleId,
      cleanerId: item._id,
      cleaner_stripe_account_id: item.stripe_account_id,
      cleaner_avatar: item.avatar,
      cleaner_firstname: item.firstname,
      cleaner_lastname: item.lastname,
      cleaner_phone: item.phone,
      cleaner_latitude: item.location?.latitude,
      cleaner_longitude: item.location?.longitude,
      schedule: selected_schedule,
      requestId: requestId,
      selected_group: groupName
    });
  };

  // Handle cleaner replacement from compare modal
  const handleReplaceCleaner = async (cleanerToRemove) => {
    try {
      const groupName = findGroupByCleanerId(cleaner._id);
      
      if (!groupName) {
        Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_determine_group', 'Could not determine group for this cleaner.'));
        return;
      }

      // Update backend first
      const data = {
        cleanerId: cleaner._id,
        scheduleId: selected_scheduleId,
        selected_group: groupName,
      };
      
      await userService.updateAssignedToID(data);

      // Create a cleaner object with group information
      const cleanerWithGroup = { 
        ...cleaner, 
        group: groupName 
      };

      // Then update the context for replacement
      replaceCleaner(cleanerToRemove._id, cleanerWithGroup, assignedTo);

      setShowCompareModal(false);
      
      Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaner_replaced', 'Cleaner replaced successfully!'), [
        { text: tSafe('ok', 'OK'), onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error replacing cleaner:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_replace_cleaner', 'Failed to replace cleaner. Please try again.'));
    }
  };

  // Main selection handler - decides whether to show compare modal or select directly
  const handleSelection = () => {
    if (isSelected) {
      Alert.alert(tSafe('already_selected_title', 'Already Selected'), tSafe('already_selected_message', 'This cleaner is already selected.'));
      return;
    }

    // Check if we're exceeding the expected number of cleaners
    if ((selectedCleaners?.length || 0) >= expected_number_of_leaners) {
      setShowCompareModal(true);
    } else {
      handleSelectForPayment();
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor={COLORS.primary} />

      <View style={styles.avatar_background}>
        {item.avatar !== "" ? 
          <Avatar.Image
            size={120}
            source={{uri: item.avatar}}
            style={{ backgroundColor: COLORS.gray, marginBottom: 0 }}
          />
          :
          <Avatar.Icon
            size={120}
            icon="account"
            style={styles.avatar}
          />
        }
        <Text style={styles.name}>{cleaner.firstname} {cleaner.lastname}</Text>
        <Text style={styles.location}>{cleaner.location?.city || tSafe('unknown', 'Unknown')}, {cleaner.location?.region_code || tSafe('unknown', 'Unknown')}</Text>
        <Text style={{ fontSize: 13, color: COLORS.white, paddingHorizontal: 10 }}>
          {distanceKm?.toFixed(1)} {tSafe('miles_away', 'miles away')}
        </Text>
        {/* <Text style={{ fontSize: 12, color: COLORS.white, marginTop: 5 }}>
          Group: {groupName || 'Not assigned'} | Fee: ${(cleanerFee || 0).toFixed(2)} | Selected: {isSelected ? 'Yes' : 'No'}
        </Text> */}
      </View>

      <ScrollView style={styles.content} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchCleanerFeedbacks()} />
      }>
        <View style={styles.rating_review}>
          <View>
            <Text bold style={styles.title}>{tSafe('reviews_ratings', 'Reviews & Ratings')}</Text>
            <View style={styles.rating}>
              <StarRating
                rating={calculateOverallRating(reviews, item._id)}
                onChange={() => {}}
                maxStars={5}
                starSize={18}
                starStyle={{ marginHorizontal: 0 }}
              />
              <Text style={{marginLeft:5}}>{calculateOverallRating(reviews, item._id)}</Text>
            </View>
          </View>
          <View>
            {reviews.length > 0 && 
              <Text onPress={openReviews} style={{color:COLORS.primary}}>
                {tSafe('see_all_reviews', 'See all {count} reviews', { count: reviews.length })}
              </Text>
            }
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
            <Text style={styles.tab_text}>{tSafe('tab_about', 'About')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
            <Text style={styles.tab_text}>{tSafe('tab_availability', 'Availability')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
            <Text style={styles.tab_text}>{tSafe('tab_license', 'License')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 4 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(4)}>
            <Text style={styles.tab_text}>{tSafe('tab_portfolio', 'Portfolio')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{padding:0}}>
          {currentStep === 1 && 
            <Animatable.View animation="slideInLeft" duration={600}>
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <AboutMeDisplay 
                  mode="display"
                  aboutme={item.aboutme}
                />
              </ScrollView>
            </Animatable.View>
          }
          {currentStep === 2 && 
            <Animatable.View animation="slideInLeft" duration={600}>
              <AvailabilityDisplay
                mode="display"
                availability={item.availability}
              />
            </Animatable.View>
          }
          {currentStep === 3 && 
            <Animatable.View animation="slideInLeft" duration={600}>
              <CertificationDisplay
                mode="display"
                certification={item.certification}
              />
            </Animatable.View>
          }
          {currentStep === 4 &&
            <Animatable.View animation="slideInLeft" duration={600}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Portfolio content would go here */}
              </ScrollView>
            </Animatable.View>
          }
        </View>
      </ScrollView>

      {/* Navigation with cleaner-specific fee */}
      <View style={styles.navigation}>
      {expected_number_of_leaners > 1 ? <SchedulePrice currency={currency} price={(cleanerFee || 0).toFixed(2)} /> 
      :
      <SchedulePrice currency={currency} price={(selected_schedule?.total_cleaning_fee || 0).toFixed(2)} />
      }
        
        {expected_number_of_leaners > 1 ? (
          <TouchableOpacity 
            // style={[styles.paymentBtn, isSelected && styles.selectedBtn]} 
            onPress={handleSelection}

            style={[
              styles.paymentBtn,
              { width: expected_number_of_leaners > 1 ? 180 : 100 }
            ]}
          >
            <Text style={styles.paymentText}>
              {isSelected ? tSafe('selected', 'Selected ✓') : tSafe('select_for_payment', 'Select for Payment')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.singleButtons}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>{tSafe('cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.paymentBtn} 
              onPress={handleProceedToCheckout}
            >
              <Text style={styles.paymentText}>{tSafe('pay_now', 'Pay Now')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareCleanerModal
          visible={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          existingCleaners={selectedCleaners || []}
          newCleaner={cleaner}
          onReplace={handleReplaceCleaner}
        />
      )}

      {/* Reviews Modal */}
      <Modal 
        isVisible={visible} 
        onSwipeComplete={() => setVisible(false)} 
        swipeDirection="down"
        onBackdropPress={() => setVisible(false)}
        style={styles.modal}
        propagateSwipe={true}
        backdropColor="black"
        backdropOpacity={0.5}
        useNativeDriver={true}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{tSafe('customer_reviews', 'Customer Reviews')}</Text>
              <View style={styles.rating}>
                <StarRating
                  rating={calculateOverallRating(reviews, item._id)}
                  onChange={() => {}}
                  maxStars={5}
                  starSize={18}
                  starStyle={{ marginHorizontal: 0 }}
                />
                <Text style={styles.ratingText}>
                  {calculateOverallRating(reviews, item._id)} ({reviews.length} {tSafe('reviews', 'reviews')})
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewsContainer}>
            <Reviews ratings={reviews} cleanerId={item._id} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: '#f8f8f8' 
  },
  content: { 
    paddingHorizontal: 15, 
    paddingTop: 15,
    flex: 1 
  },
  avatar_background: { 
    height: 220, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  name: { 
    marginTop: 10, 
    fontSize: 18, 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  location: { 
    fontSize: 16, 
    color: COLORS.white 
  },
  rating_review: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10, 
    paddingHorizontal: 10 
  },
  rating: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  navigation: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 10, 
    paddingVertical: 15, 
    backgroundColor: '#fff' 
  },
  paymentBtn: { 
    backgroundColor: COLORS.primary, 
    width: 100, 
    borderRadius: 50, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  selectedBtn: {
    backgroundColor: '#4CAF50',
  },
  paymentText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: "#e9e9e9",
    marginTop: 10
  },
  tab: {
    borderBottomWidth: 1,
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 26
  },
  tab_text: {
    marginBottom: 5,
  },
  // MODAL STYLES
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  closeIcon: {
    padding: 5,
    marginTop: 5,
  },
  reviewsContainer: {
    flex: 1,
  },
  singleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: COLORS.gray,
    width: 100,
    borderRadius: 50,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CleanerProfilePay;









// import React, { useContext, useRef, useEffect, useState, useMemo } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   StatusBar,
//   Text,
//   RefreshControl,
//   Dimensions,
//   ScrollView,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import { Avatar } from 'react-native-paper';
// import * as Animatable from 'react-native-animatable';
// import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
// import CertificationDisplay from '../cleaner/CertificationDisplay';
// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import userService from '../../services/connection/userService';
// import { SchedulePrice } from '../../components/host/SchedulePrice';
// import ROUTES from '../../constants/routes';
// import { haversineDistance } from '../../utils/distanceBtwLocation';
// import Reviews from '../../components/shared/Reviews';
// import Modal from 'react-native-modal';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { calculateOverallRating } from '../../utils/calculate_overall_rating';
// import StarRating from 'react-native-star-rating-widget';
// import { useRoute } from '@react-navigation/native';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import CompareCleanerModal from '../../components/host/CompareCleanerModal';

// const { width } = Dimensions.get('window');

// const CleanerProfilePay = ({ navigation }) => {
//   const route = useRoute();
//   const { item, selected_schedule, assignedTo, expected_cleaners, selected_scheduleId, requestId, cleanerId } = route.params;
//   const cleaner = item;

//   const { currency } = useContext(AuthContext);
//   const { selectedCleaners, addCleaner, replaceCleaner } = useCleanerSelection();
//   const [showCompareModal, setShowCompareModal] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [visible, setVisible] = useState(false);

//   // Group and fee logic
//   const groups = expected_cleaners?.checklist ? Object.keys(expected_cleaners.checklist) : [];
//   const groupCount = groups.length;

//   const findGroupByCleanerId = (cleanerId) => {
//     if (!assignedTo || !Array.isArray(assignedTo)) return null;
//     const match = assignedTo.find(item => {
//       if (!item) return false;
//       if (item.cleanerId === cleanerId) return true;
//       if (item.acceptedCleaners && Array.isArray(item.acceptedCleaners)) {
//         return item.acceptedCleaners.includes(cleanerId);
//       }
//       return false;
//     });
//     return match ? match.group : null;
//   };

//   const groupName = findGroupByCleanerId(cleaner._id);
//   const [expected_number_of_leaners] = useState(groupCount);

//   const cleanerFee = useMemo(() => {
//     if (!assignedTo || !Array.isArray(assignedTo)) return 0;
//     const assignedEntry = assignedTo.find(a => a.cleanerId === cleaner._id);
//     return assignedEntry?.checklist?.price || 0;
//   }, [assignedTo, cleaner._id]);

//   // Location distance
//   const cleanerLocation = {
//     latitude: cleaner?.location?.latitude || 0,
//     longitude: cleaner?.location?.longitude || 0,
//   };
//   const scheduleLocation = {
//     latitude: selected_schedule?.schedule?.apartment_latitude || selected_schedule?.apartment_latitude || 0,
//     longitude: selected_schedule?.schedule?.apartment_longitude || selected_schedule?.apartment_longitude || 0,
//   };
//   const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);

//   // Reviews
//   const openReviews = () => setVisible(true);

//   useEffect(() => {
//     fetchCleanerFeedbacks();
//   }, []);

//   const fetchCleanerFeedbacks = async () => {
//     try {
//       const response = await userService.getCleanerFeedbacks(cleaner._id);
//       setReviews(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching feedbacks:', error);
//       setReviews([]);
//     }
//   };

//   const isSelected = selectedCleaners.some(c => c._id === cleaner._id);

//   // Selection handlers (unchanged)
//   const handleSelectForPayment = async () => { /* ... same as before ... */ };
//   const handleProceedToCheckout = () => { /* ... same as before ... */ };
//   const handleReplaceCleaner = async (cleanerToRemove) => { /* ... same as before ... */ };
//   const handleSelection = () => { /* ... same as before ... */ };

//   // Keep original function bodies – omitted here for brevity, but they remain unchanged.
//   // For the final answer, include the full functions as in the original code.

//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <StatusBar translucent backgroundColor={COLORS.primary} />

//       {/* Header – Avatar, Name, Location, Distance, Group, Fee */}
//       <View style={styles.avatar_background}>
//         {cleaner.avatar ? (
//           <Avatar.Image size={120} source={{ uri: cleaner.avatar }} style={{ backgroundColor: COLORS.gray }} />
//         ) : (
//           <Avatar.Icon size={120} icon="account" style={styles.avatar} />
//         )}
//         <Text style={styles.name}>{cleaner.firstname} {cleaner.lastname}</Text>
//         <Text style={styles.location}>{cleaner.location?.city || 'Unknown'}, {cleaner.location?.region_code || 'Unknown'}</Text>
//         <Text style={styles.distance}>{distanceKm?.toFixed(1)} miles away</Text>
//         <Text style={styles.meta}>
//           Group: {groupName || 'Not assigned'} | Fee: ${(cleanerFee || 0).toFixed(2)} | Selected: {isSelected ? 'Yes' : 'No'}
//         </Text>
//       </View>

//       <ScrollView
//         style={styles.content}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCleanerFeedbacks} />}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Reviews & Ratings Section */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
//             {reviews.length > 0 && (
//               <TouchableOpacity onPress={openReviews}>
//                 <Text style={styles.seeAllText}>See all {reviews.length}</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//           <View style={styles.ratingContainer}>
//             <StarRating
//               rating={calculateOverallRating(reviews, cleaner._id)}
//               onChange={() => {}}
//               maxStars={5}
//               starSize={20}
//               starStyle={{ marginHorizontal: 0 }}
//             />
//             <Text style={styles.ratingValue}>{calculateOverallRating(reviews, cleaner._id)}</Text>
//           </View>
//         </View>

        
//         {/* Availability Section */}
//         <View>
//           <AvailabilityDisplay mode="display" availability={cleaner.availability} />
//         </View>

//         {/* About Section */}
//         <View>
//           <AboutMeDisplay mode="display" aboutme={cleaner.aboutme} />
//         </View>


//         {/* License / Certification Section */}
//         <View>
//           <CertificationDisplay mode="display" certification={cleaner.certification} />
//         </View>

//         {/* Portfolio Section */}
//         {/* <View style={styles.section}> */}
//           {/* You can add portfolio content here; currently empty */}
//           <Text style={styles.emptyPortfolio}>No portfolio items yet.</Text>
//         {/* </View> */}
//       </ScrollView>

//       {/* Bottom Action Bar */}
//       <View style={styles.navigation}>
//         {expected_number_of_leaners > 1 ? (
//           <SchedulePrice currency={currency} price={(cleanerFee || 0).toFixed(2)} />
//         ) : (
//           <SchedulePrice currency={currency} price={(selected_schedule?.total_cleaning_fee || 0).toFixed(2)} />
//         )}

//         {expected_number_of_leaners > 1 ? (
//           <TouchableOpacity
//             style={[styles.paymentBtn, { width: 180 }]}
//             onPress={handleSelection}
//           >
//             <Text style={styles.paymentText}>
//               {isSelected ? 'Selected ✓' : 'Select for Payment'}
//             </Text>
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.singleButtons}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.paymentBtn} onPress={handleProceedToCheckout}>
//               <Text style={styles.paymentText}>Pay Now</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* Modals (unchanged) */}
//       {showCompareModal && (
//         <CompareCleanerModal
//           visible={showCompareModal}
//           onClose={() => setShowCompareModal(false)}
//           existingCleaners={selectedCleaners || []}
//           newCleaner={cleaner}
//           onReplace={handleReplaceCleaner}
//         />
//       )}

//       <Modal
//         isVisible={visible}
//         onSwipeComplete={() => setVisible(false)}
//         swipeDirection="down"
//         onBackdropPress={() => setVisible(false)}
//         style={styles.modal}
//         propagateSwipe
//         backdropColor="black"
//         backdropOpacity={0.5}
//         useNativeDriver
//         avoidKeyboard
//       >
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <View style={styles.modalTitleContainer}>
//               <Text style={styles.modalTitle}>Customer Reviews</Text>
//               <View style={styles.rating}>
//                 <StarRating
//                   rating={calculateOverallRating(reviews, cleaner._id)}
//                   onChange={() => {}}
//                   maxStars={5}
//                   starSize={18}
//                   starStyle={{ marginHorizontal: 0 }}
//                 />
//                 <Text style={styles.ratingText}>
//                   {calculateOverallRating(reviews, cleaner._id)} ({reviews.length} reviews)
//                 </Text>
//               </View>
//             </View>
//             <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
//               <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.reviewsContainer}>
//             <Reviews ratings={reviews} cleanerId={cleaner._id} />
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeContainer: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//   },
//   avatar_background: {
//     height: 220,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   name: {
//     marginTop: 8,
//     fontSize: 18,
//     color: COLORS.white,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   location: {
//     fontSize: 14,
//     color: COLORS.white,
//     marginTop: 2,
//   },
//   distance: {
//     fontSize: 13,
//     color: COLORS.white,
//     marginTop: 4,
//   },
//   meta: {
//     fontSize: 12,
//     color: COLORS.white,
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   section: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   seeAllText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ratingValue: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#666',
//   },
//   emptyPortfolio: {
//     fontSize: 14,
//     color: '#888',
//     fontStyle: 'italic',
//     textAlign: 'center',
//     paddingVertical: 20,
//   },
//   navigation: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   paymentBtn: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 50,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   paymentText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 15,
//   },
//   singleButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   cancelBtn: {
//     backgroundColor: COLORS.gray,
//     width: 100,
//     borderRadius: 50,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cancelText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   // Modal styles (unchanged)
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: '80%',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 15,
//   },
//   modalTitleContainer: {
//     flex: 1,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   rating: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ratingText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   closeIcon: {
//     padding: 5,
//     marginTop: 5,
//   },
//   reviewsContainer: {
//     flex: 1,
//   },
// });

// export default CleanerProfilePay;