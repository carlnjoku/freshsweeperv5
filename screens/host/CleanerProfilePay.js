import React, { useContext, useRef, useEffect, useState } from 'react';
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

const { width, height } = Dimensions.get('window');

const CleanerProfilePay = ({ navigation }) => {
  const route = useRoute();
  const { item, selected_schedule, assignedTo, expected_cleaners, selected_scheduleId, requestId, cleanerId } = route.params;

  const cleaner = item;
  console.log(cleaner)
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
      console.log('Fetched reviews:', response.data); // Debug log
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setReviews([]); // Ensure it's always an array
    }
  };

  // Check if this cleaner is already selected
  const isSelected = selectedCleaners.some(c => c._id === cleaner._id);

  const handleSelectForPayment = async () => {
    if (isSelected) {
      Alert.alert('Already Selected', 'This cleaner is already selected for payment.');
      return;
    }
    
    try {
      const groupName = findGroupByCleanerId(cleaner._id);
      
      if (!groupName) {
        Alert.alert('Error', 'Could not determine group for this cleaner.');
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
      
      Alert.alert('Success', 'Cleaner selected for payment!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error selecting cleaner:', error);
      Alert.alert('Error', 'Failed to select cleaner. Please try again.');
    }
  };

  const handleProceedToCheckout = () => {
    // if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
    //   Alert.alert('Error', 'No cleaners/groups assigned.');
    //   return;
    // }

    // // Build a map of selected group -> cleaner
    // const groupMap = {};
    // (selectedCleaners || []).forEach(c => {
    //   const group = findGroupByCleanerId(c._id);
    //   if (group) {
    //     groupMap[group] = groupMap[group] ? [...groupMap[group], c._id] : [c._id];
    //   }
    // });

    // // Check for missing groups
    // const missingGroups = groups.filter(g => !groupMap[g] || groupMap[g].length === 0);
    // if (missingGroups.length > 0) {
    //   Alert.alert('Incomplete Selection', `Please select one cleaner for each group: ${missingGroups.join(', ')}`);
    //   return;
    // }

    // // Check for duplicates within the same group
    // const duplicates = Object.entries(groupMap)
    //   .filter(([group, ids]) => ids.length > 1)
    //   .map(([group]) => group);

    // if (duplicates.length > 0) {
    //   Alert.alert('Duplicate Selection', `Only one cleaner can be assigned per group: ${duplicates.join(', ')}`);
    //   return;
    // }

    // Everything is valid, proceed to checkout
    navigation.navigate(ROUTES.host_single_checkout, { 
      cleaning_fee: selected_schedule?.total_cleaning_fee, 
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
        Alert.alert('Error', 'Could not determine group for this cleaner.');
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
      
      Alert.alert('Success', 'Cleaner replaced successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error replacing cleaner:', error);
      Alert.alert('Error', 'Failed to replace cleaner. Please try again.');
    }
  };

  // Main selection handler - decides whether to show compare modal or select directly
  const handleSelection = () => {
    if (isSelected) {
      Alert.alert('Already Selected', 'This cleaner is already selected.');
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
        <Text style={styles.location}>{cleaner.location?.city || 'Unknown'}, {cleaner.location?.region_code || 'Unknown'}</Text>
        <Text style={{ fontSize: 13, color: COLORS.white, paddingHorizontal: 10 }}>
          {distanceKm?.toFixed(1)} miles away
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.white, marginTop: 5 }}>
          Group: {groupName || 'Not assigned'} | Selected: {isSelected ? 'Yes' : 'No'}
        </Text>
      </View>

      <ScrollView style={styles.content} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchCleanerFeedbacks()} />
      }>
        <View style={styles.rating_review}>
          <View>
            <Text bold style={styles.title}>Reviews & Ratings</Text>
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
                See all {reviews.length} reviews
              </Text>
            }
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
            <Text style={styles.tab_text}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
            <Text style={styles.tab_text}>Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
            <Text style={styles.tab_text}>License</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 4 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(4)}>
            <Text style={styles.tab_text}>Portfolio</Text>
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

      <View style={styles.navigation}>
        <SchedulePrice currency={currency} price={selected_schedule?.total_cleaning_fee} />
        {expected_number_of_leaners > 1 ? 
          <TouchableOpacity 
            style={[styles.paymentBtn, isSelected && styles.selectedBtn]} 
            onPress={handleSelection}
          >
            <Text style={styles.paymentText}>
              {isSelected ? 'Selected ✓' : 'Select for Payment'}
            </Text>
          </TouchableOpacity>
          :
          <TouchableOpacity 
            style={styles.paymentBtn}
            onPress={handleProceedToCheckout}
          >
            <Text style={styles.paymentText}>Pay Now</Text>
          </TouchableOpacity>
        }
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

      {/* Reviews Modal - FIXED VERSION */}
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
              <Text style={styles.modalTitle}>Customer Reviews</Text>
              <View style={styles.rating}>
                <StarRating
                  rating={calculateOverallRating(reviews, item._id)}
                  onChange={() => {}}
                  maxStars={5}
                  starSize={18}
                  starStyle={{ marginHorizontal: 0 }}
                />
                <Text style={styles.ratingText}>
                  {calculateOverallRating(reviews, item._id)} ({reviews.length} reviews)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          {/* Reviews Component - FIXED */}
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
    width: 180, 
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
  // MODAL STYLES - FIXED
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
});

export default CleanerProfilePay;





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
//   ActivityIndicator
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
// // import CompareCleanerModal from '../../components/modals/CompareCleanerModal';
// import CompareCleanerModal from '../../components/host/CompareCleanerModal';

// const { width, height } = Dimensions.get('window');

// const CleanerProfilePay = ({ navigation }) => {
//   const route = useRoute();
//   const { item, selected_schedule, assignedTo, expected_cleaners, selected_scheduleId, requestId,cleanerId } = route.params;

//   const cleaner = item;
//   const {currentUserId, friendsWithLastMessagesUnread, fbaseUser, currency } = useContext(AuthContext);
//   const {selectedCleaners, setSelectedCleaners } = useCleanerSelection();
//   const [showCompareModal, setShowCompareModal] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [visible, setVisible] = React.useState(false);
//   const [rating, setRating]=useState("")

//   const groups = expected_cleaners?.checklist
//   ? Object.keys(expected_cleaners.checklist)
//   : [];

// const groupCount = groups.length;


// // const getGroupByCleanerId = (cId) => {
// //   const groupObj = assignedTo.find(item => item.cleanerId === cId);
// //   return groupObj ? groupObj.group : null;
// // };

// const findGroupByCleanerId = (cleanerId) => {
//   const match = assignedTo.find(item =>
//     item.cleanerId === cleanerId || item.acceptedCleaners.includes(cleanerId)
//   );
//   return match ? match.group : null;
// };


// // Example usage:
// const groupName = findGroupByCleanerId(cleaner._id);

// console.log("My accepted cleaners", assignedTo)

// const[expected_number_of_leaners, setExpectedCleaners]=useState(groupCount)

// console.log("Groups:", groups);       // ["group_2", "group_1"]
// console.log("Group count:", groupCount); // 2

//   const cleanerLocation = { latitude: cleaner?.location.latitude, longitude: cleaner?.location.longitude };
//   const scheduleLocation = {
//     latitude: selected_schedule.schedule?.apartment_latitude || selected_schedule?.apartment_latitude,
//     longitude: selected_schedule.schedule?.apartment_longitude || selected_schedule.apartment_longitude
//   };

//   const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);

//   console.log("Soooooooo scheduleeeee",selected_schedule)
  

//   const openReviews = () => {
//     setVisible(true)
//   }

//   useEffect(() => {
//     fetchCleanerFeedbacks();
//   }, []);

//   const fetchCleanerFeedbacks = async () => {
//     const response = await userService.getCleanerFeedbacks(cleaner._id);
//     setReviews(response.data.data);
//   };


  
// // alert(selectedGroup)
//   const handleSelectForPayment = () => {
//     const isSelected = selectedCleaners.some(c => c._id === cleaner._id);
    
//     // Update the assignedTo
//     data = {
//       cleanerId:cleaner._id,
//       scheduleId: selected_scheduleId,
//       selected_group:findGroupByCleanerId(cleaner._id)
//     }
//     console.log(data)
//     userService.updateAssignedToID(data) 
//     if (isSelected) return;
    
//     if (selectedCleaners.length < expected_number_of_leaners) {
//       setSelectedCleaners([...selectedCleaners, cleaner]);
//       navigation.goBack();
//     } else {
//       setShowCompareModal(true);
//       // setShowCompareModal({
//       //   visible: true,
//       //   groupName: findGroupByCleanerId(cleaner._id),
//       // });
//     }
//   };

//   //   const handleProceedToCheckout = () => {
  
//   //   // console.log(selectedPayments)
//   //   navigation.navigate(ROUTES.host_single_checkout, { 
//   //     cleaning_fee:selected_schedule?.total_cleaning_fee, 
//   //     scheduleId: selected_scheduleId,
//   //     cleanerId: item._id,
//   //     cleaner_stripe_account_id: item.stripe_account_id,
//   //     cleaner_avatar: item.avatar,
//   //     cleaner_firstname: item.firstname,
//   //     cleaner_lastname: item.lastname,
//   //     cleaner_phone: item.phone,
//   //     cleaner_latitude: item.location.latitude,
//   //     cleaner_longitude: item.location.longitude,
//   //     schedule:selected_schedule,
//   //     requestId:requestId,
//   //     selected_group:findGroupByCleanerId(cleaner._id)
      
  
//   //   });
//   // };

//   const handleProceedToCheckout = () => {
//     if (!assignedTo || assignedTo.length === 0) {
//       alert('No cleaners/groups assigned.');
//       return;
//     }

    
  
//     // Build a map of selected group -> cleaner
//     const groupMap = {};
//     selectedCleaners.forEach(c => {
//       const group = findGroupByCleanerId(c._id);
//       if (group) {
//         if (groupMap[group]) {
//           groupMap[group].push(c._id); // duplicate detected
//         } else {
//           groupMap[group] = [c._id];
//         }
//       }
//     });
  
//     // Check for missing groups
//     const missingGroups = groups.filter(g => !groupMap[g] || groupMap[g].length === 0);
//     if (missingGroups.length > 0) {
//       alert(`Please select one cleaner for each group: ${missingGroups.join(', ')}`);
//       return;
//     }
  
//     // Check for duplicates within the same group
//     const duplicates = Object.entries(groupMap)
//       .filter(([group, ids]) => ids.length > 1)
//       .map(([group]) => group);
  
//     if (duplicates.length > 0) {
//       alert(`Only one cleaner can be assigned per group: ${duplicates.join(', ')}`);
//       return;
//     }
  
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
//       cleaner_latitude: item.location.latitude,
//       cleaner_longitude: item.location.longitude,
//       schedule: selected_schedule,
//       requestId: requestId,
//       selected_group: findGroupByCleanerId(cleaner._id)
//     });
//   };
  
  
//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <StatusBar translucent backgroundColor={COLORS.primary} />

//       <View style={styles.avatar_background}>
//       {item.avatar !=="" ? 
//             <Avatar.Image
//                 size={120}
//                 source={{uri:item.avatar}}
//                 style={{ backgroundColor: COLORS.gray,  marginBottom:0 }}
//             />
//             :
//             <Avatar.Icon
//                 size={120}
//                 icon="account" // Provide a default icon here
//                 style={styles.avatar}
//             />
//           }
//         <Text style={styles.name}>{cleaner.firstname} {cleaner.lastname}</Text>
//         <Text style={styles.location}>{cleaner.location.city}, {cleaner.location.region_code}</Text>
//         <Text style={{ fontSize: 13, color: COLORS.white, paddingHorizontal: 10 }}>{distanceKm?.toFixed(1)} miles away</Text>
//       </View>

      

//       <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCleanerFeedbacks()} />}>
//         <View style={styles.rating_review}>
//              <View>
//                <Text bold style={styles.title}>Reviews & Ratings</Text>
//                <View style={styles.rating}>
                
//                  <StarRating
//                   rating={calculateOverallRating(reviews, item._id)}
//                   onChange={() => {}}  No-op function to disable interaction
//                   maxStars={5} // Maximum stars
//                   starSize={18} // Size of the stars
//                   starStyle={{ marginHorizontal: 0 }} // Customize star spacing
//                 />
//                 <Text style={{marginLeft:5}}>{calculateOverallRating(reviews, item._id)}</Text>
//               </View>
//             </View>
//             <View>
//               {reviews.length > 0 ? <Text onPress={openReviews} style={{color:COLORS.primary}}>See all {reviews.length} reviews</Text>
//               :
//               ""}
              
//             </View>
//         </View>

//         <View style={styles.tabsContainer}>
//                <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
//                  {/* <MaterialCommunityIcons name="camera" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} /> */}
//                  <Text style={styles.tab_text}>About</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
//                  {/* <MaterialCommunityIcons name="camera" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} /> */}
//                  <Text style={styles.tab_text}>Availability</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
//                  {/* <MaterialCommunityIcons name="camera-flip" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} /> */}
//                  <Text style={styles.tab_text}>License</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 4 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(4)}>
//                  {/* <MaterialCommunityIcons name="format-list-checks" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} /> */}
//                  <Text style={styles.tab_text}>Portfolio</Text>
//                </TouchableOpacity>
//              </View>
            
//              <View style={{padding:0}}>
//                {currentStep === 1 && 
//                <Animatable.View animation="slideInLeft" duration={600}>
//                  <ScrollView
//                    showsVerticalScrollIndicator={false}
//                    bounces={false}
//                  >
//                  <AboutMeDisplay 
//                    mode="display"
//                    aboutme={item.aboutme}
//                  />
//                  </ScrollView>
//                  </Animatable.View>
//                }
//                {currentStep === 2 && 
//                  <Animatable.View animation="slideInLeft" duration={600}>
//                    <AvailabilityDisplay
//                      mode="display"
//                      availability={item.availability}
//                    />
//                  </Animatable.View>
//                }

//                {currentStep === 3 && 
//                <Animatable.View animation="slideInLeft" duration={600}>
//                  <CertificationDisplay
//                    mode="display"
//                    certification={item.certification}
//                  />
//                </Animatable.View>
//                }


//                {currentStep === 4 &&
//                <Animatable.View animation="slideInLeft" duration={600}>
//                  <ScrollView
//                    contentContainerStyle={{ flexGrow: 1 }}
//                    showsVerticalScrollIndicator={false}
//                    bounces={false}
//                  >
//                  {/* <Portfolio 
//                    portfolio={cleanerPortfolio} 
//                    portfolio2={completed_schedules}
//                  /> */}
//                  </ScrollView>
//                </Animatable.View>
//                }

//             </View>
//       </ScrollView>
      
   

//       <View style={styles.navigation}>
//         <SchedulePrice currency={currency} price={selected_schedule?.total_cleaning_fee} />
//         {expected_number_of_leaners > 1 ? 
//         <TouchableOpacity style={styles.paymentBtn} onPress={handleSelectForPayment}>
//           <Text style={styles.paymentText}>Select for Payment</Text>
//         </TouchableOpacity>
//         :
//         <TouchableOpacity 
//           style={styles.paymentBtn}
//           onPress={handleProceedToCheckout}
//         >
//           <Text style={styles.paymentText}>Pay Now</Text>
//         </TouchableOpacity>
//       }
//       </View>
//       {/* {showCompareModal.visible && (
//         <CompareCleanerModal
//           visible={showCompareModal.visible}
//           groupName={showCompareModal.groupName}   // 👈 Pass group name
//           onClose={() => setShowCompareModal({ visible: false, groupName: null })}
//           currentCleaners={selectedCleaners || []}
//           newCleaner={item}
//           onReplace={(cleanerToRemove) => {
//             const updated = (selectedCleaners || []).filter(
//               (c) => findGroupByCleanerId(c._id) !== showCompareModal.groupName
//             );
//             setSelectedCleaners([...updated, item]);

//             // ✅ Update DB
//             userService.updateAssignedToID({
//               cleanerId: item._id,
//               scheduleId: selected_scheduleId,
//               selected_group: showCompareModal.groupName,
//             });

//             setShowCompareModal({ visible: false, groupName: null });
//             navigation.goBack();
//           }}
//         />
//       )} */}
//       {showCompareModal && (
//         <CompareCleanerModal
//           visible={showCompareModal}
//           onClose={() => setShowCompareModal(false)}
//           currentCleaners={selectedCleaners || []}
//           newCleaner={item}
          
//           onReplace={(cleanerToRemove) => {
//             const updated = (selectedCleaners || []).filter(c => c._id !== cleanerToRemove._id);
//             setSelectedCleaners([...updated, item]);

//             // ✅ Now update DB with the new cleaner after replacement
//             const data = {
//               cleanerId: item._id,
//               scheduleId: selected_scheduleId,
//               selected_group: findGroupByCleanerId(item._id),
//             };
//             console.log("Replacing cleaner:", data);
//             userService.updateAssignedToID(data);

            
//             setShowCompareModal(false);
//             navigation.goBack();
//           }}
//         />
//       )}

//       <Modal 
//           isVisible={visible} 
//           onSwipeComplete={() => setVisible(false)} 
//           swipeDirection="down"
//           onBackdropPress={() => setVisible(false)}
//           style={styles.modal}
//           propagateSwipe={false}
//           backdropColor="black"       // Set to black or any color
//           backdropOpacity={0.1}       // Adjust opacity for transparency
//           useNativeDriverForBackdrop={true}
//         >
//         <View style={styles.modalContent}>

//         <View style={styles.modal_header}>
//             <View>
//               <Text style={styles.header}>Customer Reviews</Text>
//               <View style={styles.rating}>
                
//                 <StarRating
//                   rating={calculateOverallRating(reviews, item._id)}
//                   onChange={setRating} // Handle rating changes
//                   maxStars={5} // Maximum stars
//                   starSize={18} // Size of the stars
//                   starStyle={{ marginHorizontal: -1 }} // Customize star spacing
//                 />
//                 <Text style={{marginLeft:5, color:COLORS.gray}}>{calculateOverallRating(reviews, item._id)}  ({reviews.length} reviews)</Text>
//               </View>
//             </View>
//             <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
//                 <MaterialCommunityIcons name="close" size={30} color="gray" />
//             </TouchableOpacity>
//         </View>
//           {openReviews  && (
//              <Reviews ratings={reviews} cleanerId={item._id} />
//           )}
          
          
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeContainer: { flex: 1, backgroundColor: '#f8f8f8' },
//   content: { paddingHorizontal: 15, paddingTop: 15 },
//   avatar_background: { height: 200, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
//   name: { marginTop: 10, fontSize: 18, color: COLORS.white, fontWeight: 'bold' },
//   location: { fontSize: 16, color: COLORS.white },
//   address_bar: { backgroundColor: COLORS.deepBlue },
//   addre:{
//     flex:0.7,
//     padding:10
//   },
//   rating_review: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10 },
//   rating: { flexDirection: 'row', alignItems: 'center' },
//   navigation: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 15, backgroundColor: '#fff' },
//   paymentBtn: { backgroundColor: COLORS.primary, width: 180, borderRadius: 50, height: 44, justifyContent: 'center', alignItems: 'center' },
//   paymentText: { color: 'white', fontWeight: 'bold' },
//   tabsContainer:{
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         alignItems: 'center',
//         backgroundColor: '#ffffff',
//         borderBottomColor: "#e9e9e9",
//         borderLeftColor:"#fff",
//         borderRightColor:"#fff",
//         marginTop:10
//       },
//       tab:{
//         borderBottomWidth:1,
//         borderLeftWidth:0,
//         // borderLeftColor:"#fff",
//         borderBottomColor: COLORS.primary,
//         alignItems:'center',
//         marginTop:10,
//         paddingHorizontal:26
//       },
//       tab_text:{
//         marginBottom:5,
//       },
//       rating_review:{
//             flexDirection:'row',
//             justifyContent:'space-between',
//             marginBottom:10,
//             marginHorizontal:10
//           },
//           rating:{
//             flexDirection:'row',
//             // justifyContent:'center',
//             alignItems:'center'
//           },
//           location_block:{
//             flexDirection:'row',
//             justifyContent:'center',
//             alignItems:'center',
//             height:60,
//           },
// });

// export default CleanerProfilePay;

