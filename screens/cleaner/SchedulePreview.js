// import React, { useContext, useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   StatusBar,
//   Linking,
//   Alert,
//   ScrollView,
//   Image,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import moment from 'moment';
// import CustomCard from '../../components/shared/CustomCard';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import calculateDistance from '../../utils/calculateDistance';
// import { useNavigation } from '@react-navigation/native';
// import { getCityState } from '../../utils/getAddressFromCoordinates';
// import { verification_items } from '../../data';
// import CleaningSummary from './CleaningSummary';
// import { MAP_BOX_SECRET_KEY } from '../../secret';

// export default function SchedulePreview({ route }) {
//   const navigation = useNavigation();
//   const { request_created_at, requestId, scheduleId, hostId } = route.params;
//   const { geolocationData, currentUserId, currentUser } = useContext(AuthContext);

//   const [schedule, setSchedule] = useState({});
//   const [checklist, setChecklist] = useState({});
//   const [assignedTo, setAssignedTo] = useState({});
//   const [cleaningDate, setCleaningDate] = useState('');
//   const [cleaningTime, setCleaningTime] = useState('');
//   const [cleaningEndTime, setCleaningEndTime] = useState('');
//   const [roomTypeAndSize, setRoomTypeSize] = useState([]);
//   const [apartmentLat, setApartmentLatitude] = useState('');
//   const [apartmentLng, setApartmentLongitude] = useState('');
//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');
//   const [apartmentName, setApartmentName] = useState('');
//   const [totalCleaningFee, setTotalCleaningFee] = useState('');
//   const [distance, setDistance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [mapImageUrl, setMapImageUrl] = useState(null);
//   const [mapError, setMapError] = useState(false);

//   // Room counts & sizes
//   const bedroomCount = roomTypeAndSize.find(r => r.type === 'Bedroom')?.number || 0;
//   const bathroomCount = roomTypeAndSize.find(r => r.type === 'Bathroom')?.number || 0;
//   const kitchenCount = roomTypeAndSize.find(r => r.type === 'Kitchen')?.number || 0;
//   const livingroomCount = roomTypeAndSize.find(r => r.type === 'Livingroom')?.number || 0;
//   const bedroomSize = roomTypeAndSize.find(r => r.type === 'Bedroom')?.size || 0;
//   const bathroomSize = roomTypeAndSize.find(r => r.type === 'Bathroom')?.size || 0;
//   const kitchenSize = roomTypeAndSize.find(r => r.type === 'Kitchen')?.size || 0;
//   const livingroomSize = roomTypeAndSize.find(r => r.type === 'Livingroom')?.size || 0;

//   // Map static image
//   useEffect(() => {
//     if (apartmentLat && apartmentLng) {
//       const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${apartmentLng},${apartmentLat})/${apartmentLng},${apartmentLat},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [apartmentLat, apartmentLng]);

//   // Fetch data
//   useEffect(() => {
//     fetchUser();
//     fetchHostPushTokens();
//     fetchSchedule();
//   }, []);

//   const fetchUser = async () => {
//     try {
//       const response = await userService.getUser(currentUserId);
//       const res = response.data;
//       // ... any user related logic (omitted for brevity)
//     } catch (e) {
//       console.log('Fetch user error:', e);
//     }
//   };

//   const fetchHostPushTokens = async () => {
//     try {
//       const response = await userService.getUserPushTokens(hostId);
//       // const res = response.data.tokens; // unused here
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchSchedule = async () => {
//     try {
//       const response = await userService.getScheduleById(scheduleId);
//       const res = response.data;

//       setSchedule(res);
//       setChecklist(res.overall_checklist.checklist);
//       setAssignedTo(res.assignedTo);
//       setRoomTypeSize(res.schedule.selected_apt_room_type_and_size);
//       setCleaningDate(res.schedule.cleaning_date);
//       setCleaningTime(res.schedule.cleaning_time);
//       setCleaningEndTime(res.schedule.cleaning_end_time);

//       const lat1 = geolocationData.latitude;
//       const lon1 = geolocationData.longitude;
//       const lat2 = res.schedule.apartment_latitude;
//       const lon2 = res.schedule.apartment_longitude;

//       const dist = calculateDistance(lat1, lon1, lat2, lon2);
//       setDistance(dist);
//       setApartmentLatitude(lat2);
//       setApartmentLongitude(lon2);

//       const coordinate = { latitude: lat2, longitude: lon2 };
//       const result = await getCityState(coordinate);
//       setCity(result.city);
//       setState(result.state);

//       setApartmentName(res.schedule.apartment_name);
//       setTotalCleaningFee(res.schedule.total_cleaning_fee);
//     } catch (e) {
//       console.log(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenDirections = () => {
//     const url = `https://www.google.com/maps/dir/?api=1&origin=${currentUser.location.latitude},${currentUser.location.longitude}&destination=${apartmentLat},${apartmentLng}&travelmode=driving`;
//     Linking.openURL(url).catch(err => console.error('Failed to open Google Maps', err));
//   };

//   const handleAccept = (group, acceptance) => {
//     const data = {
//       cleanerId: currentUserId,
//       scheduleId,
//       requestId,
//       acceptance,
//       group: group.name,
//     };
//     userService.acceptCleaningRequest(data).then(() => {
//       navigation.navigate(ROUTES.cleaner_dashboard);
//     });
//   };

//   const handleDecline = () => {
//     Alert.alert('Confirm Decline', 'Are you sure you want to decline this cleaning request?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Decline',
//         onPress: () => {
//           userService.declineCleaningRequest(requestId).then(() => {
//             navigation.navigate(ROUTES.cleaner_dashboard);
//           });
//         },
//       },
//     ]);
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading schedule...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       <View style={styles.container}>
//         {/* Map Section */}
//         <View style={styles.mapContainer}>
//           {mapImageUrl && !mapError ? (
//             <Image source={{ uri: mapImageUrl }} style={styles.mapImage} resizeMode="cover" onError={() => setMapError(true)} />
//           ) : (
//             <View style={[styles.mapImage, styles.mapPlaceholder]}>
//               <MaterialCommunityIcons name="map-outline" size={40} color={COLORS.gray} />
//               <Text style={styles.placeholderText}>Map unavailable</Text>
//             </View>
//           )}
//           <View style={styles.mapOverlay}>
//             <Text style={styles.distanceText}>{distance.toFixed(1)} miles away</Text>
//             <TouchableOpacity onPress={handleOpenDirections}>
//               <Text style={styles.directionText}>Directions →</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//           {/* Property Card */}
//           <CustomCard style={styles.propertyCard}>
//             <View style={styles.propertyHeader}>
//               <Text style={styles.propertyName}>{apartmentName}</Text>
//               <View style={styles.locationRow}>
//                 <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
//                 <Text style={styles.locationText}>{city}, {state}</Text>
//               </View>
//             </View>

//             {/* Room Icons */}
//             <View style={styles.roomIconsRow}>
//               <RoomIcon icon="bed-outline" count={bedroomCount} size={bedroomSize} type="Bedroom" />
//               <RoomIcon icon="shower-head" count={bathroomCount} size={bathroomSize} type="Bathroom" />
//               <RoomIcon icon="fridge-outline" count={kitchenCount} size={kitchenSize} type="Kitchen" />
//               <RoomIcon icon="sofa-outline" count={livingroomCount} size={livingroomSize} type="Livingroom" />
//             </View>
//           </CustomCard>

//           {/* Schedule Info */}
//           <View style={styles.scheduleSection}>
//             <Text style={styles.sectionTitle}>Schedule Info</Text>
//             <Text style={styles.sectionSubtitle}>Date and timing details</Text>

//             <CustomCard style={styles.scheduleCard}>
//               <View style={styles.scheduleRow}>
//                 <View style={styles.scheduleItem}>
//                   <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
//                   <Text style={styles.scheduleLabel}>Date</Text>
//                   <Text style={styles.scheduleValue}>{moment(cleaningDate).format('ddd, MMM D')}</Text>
//                 </View>
//                 <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.gray} style={styles.arrowIcon} />
//                 <View style={styles.scheduleItem}>
//                   <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
//                   <Text style={styles.scheduleLabel}>Start</Text>
//                   <Text style={styles.scheduleValue}>{moment(cleaningTime, 'h:mm:ss A').format('h:mm A')}</Text>
//                 </View>
//                 <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.gray} style={styles.arrowIcon} />
//                 <View style={styles.scheduleItem}>
//                   <MaterialCommunityIcons name="timer-outline" size={24} color={COLORS.primary} />
//                   <Text style={styles.scheduleLabel}>End</Text>
//                   <Text style={styles.scheduleValue}>{moment(cleaningEndTime, 'h:mm:ss A').format('h:mm A')}</Text>
//                 </View>
//               </View>
//             </CustomCard>
//           </View>

//           {/* Cleaning Summary (external component) */}
//           <CleaningSummary 
//             checklist={checklist} 
//             assignedTo={assignedTo} 
//             handleAccept={handleAccept} 
//           />

          
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// }

// // Helper component for room icons
// const RoomIcon = ({ icon, count, size, type }) => (
//   <View style={styles.roomIconContainer}>
//     <View style={styles.iconCircle}>
//       <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
//     </View>
//     <Text style={styles.roomCount}>{count}</Text>
//     <Text style={styles.roomType}>{type}</Text>
//     <Text style={styles.roomSize}>{size} sq ft</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   container: {
//     flex: 1,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#6B7280',
//   },
//   mapContainer: {
//     height: 180,
//     width: '100%',
//     position: 'relative',
//   },
//   mapImage: {
//     width: '100%',
//     height: '100%',
//   },
//   mapPlaceholder: {
//     backgroundColor: '#E5E7EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     marginTop: 8,
//     fontSize: 12,
//     color: '#9CA3AF',
//   },
//   mapOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   distanceText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   directionText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//     textDecorationLine: 'underline',
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   propertyCard: {
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   propertyHeader: {
//     marginBottom: 16,
//   },
//   propertyName: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   locationText: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginLeft: 4,
//   },
//   roomIconsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   roomIconContainer: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   iconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   roomCount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   roomSize: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginTop: 2,
//   },
//   roomType: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   scheduleSection: {
//     marginTop: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 12,
//   },
//   scheduleCard: {
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//   },
//   scheduleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   scheduleItem: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   scheduleLabel: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginTop: 4,
//   },
//   scheduleValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginTop: 2,
//   },
//   arrowIcon: {
//     marginHorizontal: 4,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 24,
//     marginBottom: 16,
//   },
//   declineButton: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   declineText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   acceptButton: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   acceptText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
// });

    



import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  Linking,
  Alert,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import moment from 'moment';
import CustomCard from '../../components/shared/CustomCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import calculateDistance from '../../utils/calculateDistance';
import { useNavigation } from '@react-navigation/native';
import { getCityState } from '../../utils/getAddressFromCoordinates';
import { verification_items } from '../../data';
import CleaningSummary from './CleaningSummary';
// import { MAP_BOX_SECRET_KEY } from '../../secret';
import { tSafe } from '../../utils/tSafe'; // added import

export default function SchedulePreview({ route }) {
  const MAP_BOX_SECRET_KEY = process.env.MAP_BOX_SECRET_KEY;
  const navigation = useNavigation();
  const { request_created_at, requestId, scheduleId, hostId } = route.params;
  const { geolocationData, currentUserId, currentUser } = useContext(AuthContext);

  const [schedule, setSchedule] = useState({});
  const [checklist, setChecklist] = useState({});
  const [assignedTo, setAssignedTo] = useState({});
  const [cleaningDate, setCleaningDate] = useState('');
  const [cleaningTime, setCleaningTime] = useState('');
  const [cleaningEndTime, setCleaningEndTime] = useState('');
  const [roomTypeAndSize, setRoomTypeSize] = useState([]);
  const [apartmentLat, setApartmentLatitude] = useState('');
  const [apartmentLng, setApartmentLongitude] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  const [totalCleaningFee, setTotalCleaningFee] = useState('');
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [mapError, setMapError] = useState(false);

  // Room counts & sizes
  const bedroomCount = roomTypeAndSize.find(r => r.type === 'Bedroom')?.number || 0;
  const bathroomCount = roomTypeAndSize.find(r => r.type === 'Bathroom')?.number || 0;
  const kitchenCount = roomTypeAndSize.find(r => r.type === 'Kitchen')?.number || 0;
  const livingroomCount = roomTypeAndSize.find(r => r.type === 'Livingroom')?.number || 0;
  const bedroomSize = roomTypeAndSize.find(r => r.type === 'Bedroom')?.size || 0;
  const bathroomSize = roomTypeAndSize.find(r => r.type === 'Bathroom')?.size || 0;
  const kitchenSize = roomTypeAndSize.find(r => r.type === 'Kitchen')?.size || 0;
  const livingroomSize = roomTypeAndSize.find(r => r.type === 'Livingroom')?.size || 0;

  // Map static image
  useEffect(() => {
    if (apartmentLat && apartmentLng) {
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${apartmentLng},${apartmentLat})/${apartmentLng},${apartmentLat},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
      setMapImageUrl(url);
      setMapError(false);
    }
  }, [apartmentLat, apartmentLng]);

  // Fetch data
  useEffect(() => {
    fetchUser();
    fetchHostPushTokens();
    fetchSchedule();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await userService.getUser(currentUserId);
      const res = response.data;
      // ... any user related logic (omitted for brevity)
    } catch (e) {
      console.log('Fetch user error:', e);
    }
  };

  const fetchHostPushTokens = async () => {
    try {
      const response = await userService.getUserPushTokens(hostId);
      // const res = response.data.tokens; // unused here
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await userService.getScheduleById(scheduleId);
      const res = response.data;

      setSchedule(res);
      setChecklist(res.overall_checklist.checklist);
      setAssignedTo(res.assignedTo);
      setRoomTypeSize(res.schedule.selected_apt_room_type_and_size);
      setCleaningDate(res.schedule.cleaning_date);
      setCleaningTime(res.schedule.cleaning_time);
      setCleaningEndTime(res.schedule.cleaning_end_time);

      const lat1 = geolocationData.latitude;
      const lon1 = geolocationData.longitude;
      const lat2 = res.schedule.apartment_latitude;
      const lon2 = res.schedule.apartment_longitude;

      const dist = calculateDistance(lat1, lon1, lat2, lon2);
      setDistance(dist);
      setApartmentLatitude(lat2);
      setApartmentLongitude(lon2);

      const coordinate = { latitude: lat2, longitude: lon2 };
      const result = await getCityState(coordinate);
      setCity(result.city);
      setState(result.state);

      setApartmentName(res.schedule.apartment_name);
      setTotalCleaningFee(res.schedule.total_cleaning_fee);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentUser.location.latitude},${currentUser.location.longitude}&destination=${apartmentLat},${apartmentLng}&travelmode=driving`;
    Linking.openURL(url).catch(err => console.error('Failed to open Google Maps', err));
  };

  const handleAccept = (group, acceptance) => {
    const data = {
      cleanerId: currentUserId,
      scheduleId,
      requestId,
      acceptance,
      group: group.name,
    };
    userService.acceptCleaningRequest(data).then(() => {
      navigation.navigate(ROUTES.cleaner_dashboard);
    });
  };

  const handleDecline = () => {
    Alert.alert(
      tSafe('confirm_decline_title', 'Confirm Decline'),
      tSafe('confirm_decline_message', 'Are you sure you want to decline this cleaning request?'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('decline', 'Decline'),
          onPress: () => {
            userService.declineCleaningRequest(requestId).then(() => {
              navigation.navigate(ROUTES.cleaner_dashboard);
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_schedule', 'Loading schedule...')}</Text>
      </View>
    );
  }

  // Helper to translate room type
  const getTranslatedRoomType = (type) => {
    const map = {
      Bedroom: tSafe('bedroom', 'Bedroom'),
      Bathroom: tSafe('bathroom', 'Bathroom'),
      Kitchen: tSafe('kitchen', 'Kitchen'),
      Livingroom: tSafe('livingroom', 'Livingroom'),
    };
    return map[type] || type;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.container}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          {mapImageUrl && !mapError ? (
            <Image source={{ uri: mapImageUrl }} style={styles.mapImage} resizeMode="cover" onError={() => setMapError(true)} />
          ) : (
            <View style={[styles.mapImage, styles.mapPlaceholder]}>
              <MaterialCommunityIcons name="map-outline" size={40} color={COLORS.gray} />
              <Text style={styles.placeholderText}>{tSafe('map_unavailable', 'Map unavailable')}</Text>
            </View>
          )}
          <View style={styles.mapOverlay}>
            <Text style={styles.distanceText}>
              {distance.toFixed(1)} {tSafe('miles_away', 'miles away')}
            </Text>
            <TouchableOpacity onPress={handleOpenDirections}>
              <Text style={styles.directionText}>{tSafe('directions', 'Directions →')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Property Card */}
          <CustomCard style={styles.propertyCard}>
            <View style={styles.propertyHeader}>
              <Text style={styles.propertyName}>{apartmentName}</Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
                <Text style={styles.locationText}>{city}, {state}</Text>
              </View>
            </View>

            {/* Room Icons */}
            <View style={styles.roomIconsRow}>
              <RoomIcon 
                icon="bed-outline" 
                count={bedroomCount} 
                size={bedroomSize} 
                type={getTranslatedRoomType('Bedroom')}
              />
              <RoomIcon 
                icon="shower-head" 
                count={bathroomCount} 
                size={bathroomSize} 
                type={getTranslatedRoomType('Bathroom')}
              />
              <RoomIcon 
                icon="fridge-outline" 
                count={kitchenCount} 
                size={kitchenSize} 
                type={getTranslatedRoomType('Kitchen')}
              />
              <RoomIcon 
                icon="sofa-outline" 
                count={livingroomCount} 
                size={livingroomSize} 
                type={getTranslatedRoomType('Livingroom')}
              />
            </View>
          </CustomCard>

          {/* Schedule Info */}
          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>{tSafe('schedule_info', 'Schedule Info')}</Text>
            <Text style={styles.sectionSubtitle}>{tSafe('date_timing_details', 'Date and timing details')}</Text>

            <CustomCard style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                  <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
                  <Text style={styles.scheduleLabel}>{tSafe('date', 'Date')}</Text>
                  <Text style={styles.scheduleValue}>{moment(cleaningDate).format('ddd, MMM D')}</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.gray} style={styles.arrowIcon} />
                <View style={styles.scheduleItem}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.scheduleLabel}>{tSafe('start', 'Start')}</Text>
                  <Text style={styles.scheduleValue}>{moment(cleaningTime, 'h:mm:ss A').format('h:mm A')}</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.gray} style={styles.arrowIcon} />
                <View style={styles.scheduleItem}>
                  <MaterialCommunityIcons name="timer-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.scheduleLabel}>{tSafe('end', 'End')}</Text>
                  <Text style={styles.scheduleValue}>{moment(cleaningEndTime, 'h:mm:ss A').format('h:mm A')}</Text>
                </View>
              </View>
            </CustomCard>
          </View>

          {/* Cleaning Summary (external component) */}
          <CleaningSummary 
            checklist={checklist} 
            assignedTo={assignedTo} 
            handleAccept={handleAccept} 
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Helper component for room icons
const RoomIcon = ({ icon, count, size, type }) => (
  <View style={styles.roomIconContainer}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.roomCount}>{count}</Text>
    <Text style={styles.roomType}>{type}</Text>
    <Text style={styles.roomSize}>{size} {tSafe('sq_ft', 'sq ft')}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  mapContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  directionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  propertyCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  propertyHeader: {
    marginBottom: 16,
  },
  propertyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  roomIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  roomIconContainer: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  roomSize: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  roomType: {
    fontSize: 12,
    color: '#6B7280',
  },
  scheduleSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  scheduleCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleItem: {
    alignItems: 'center',
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  declineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});