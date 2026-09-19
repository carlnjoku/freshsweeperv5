// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Modal, Alert, RefreshControl } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
// import { Feather, MaterialIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import { HomeSkeleton } from '../../components/shared/skeleton/HomeSkeleton';
// import * as Animatable from 'react-native-animatable';
// import { AntDesign } from '@expo/vector-icons';
// import { Chip } from 'react-native-paper';
// import ROUTES from '../../constants/routes';
// import CustomHeader from '../../components/shared/CustomHeader';
// import { useBookingContext } from '../../context/BookingContext';
// import NewBooking from './NewBooking';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import { tSafe } from '../../utils/tSafe';
// import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';

// const FindCleaners = ({ navigation }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const { modalVisible, handleCreateSchedule } = useBookingContext();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);
//   const [apartments, setApartments] = useState([]);
//   const [schedules, setSchedules] = useState([]);
//   const [cleaners, setCleaners] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const genericArray = new Array(5).fill(null);

//   // ---------- Initial Data Fetch ----------
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [apartmentsRes] = await Promise.all([
//           userService.getApartment(currentUserId),
//         ]);
  
//         if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
//           Alert.alert(
//             'Property Required',
//             'You need to add at least one property before you can find cleaners. Please add a property first.',
//             [
//               {
//                 text: 'OK',
//                 onPress: () => navigation.replace(ROUTES.host_dashboard),
//               },
//             ],
//             { cancelable: false }
//           );
//           return;
//         }
  
//         setApartments(apartmentsRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         Alert.alert('Error', 'Failed to load your properties. Please try again.');
//       }
//     };
  
//     fetchData();
//   }, [currentUserId, navigation]);

//   // ---------- Fetch schedules when property is selected ----------
//   useEffect(() => {
//     const fetchPropertySchedules = async () => {
//       if (!selectedProperty) return;
      
//       try {
//         const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
//         const filtered = schedulesRes.data.filter(
//           item => item.schedule.apartment_name === selectedProperty.apt_name
//         );

//         const upcomingSchedules = filtered.filter(schedule => {
//           const cleaningDate = schedule.schedule.cleaning_date;
//           const cleaningTime = schedule.schedule.cleaning_time;
//           if (!cleaningDate || !cleaningTime) return false;
//           const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
//           return cleaningDateTime.isSameOrAfter(moment());
//         });
        
//         setSchedules(upcomingSchedules);
//         setSelectedSchedule(null);
//       } catch (error) {
//         console.error('Error fetching schedules:', error);
//       }
//     };
    
//     fetchPropertySchedules();
//   }, [selectedProperty, currentUserId]);

//   // ---------- Fetch cleaners when schedule is selected ----------
//   useEffect(() => {
//     if (!selectedSchedule) return;
  
//     setLoading(true);
  
//     const timeout = setTimeout(async () => {
//       try {
//         const cleanersRes = await userService.findCleaners(selectedSchedule._id);
//         setCleaners(cleanersRes.data);
//       } catch (error) {
//         console.error('Error fetching cleaners:', error);
//       } finally {
//         setLoading(false);
//       }
//     }, 4000);
  
//     return () => {
//       clearTimeout(timeout);
//       setLoading(false);
//     };
//   }, [selectedSchedule]);

//   // ---------- SILENT REFRESH on focus (no loading indicators) ----------
//   useFocusEffect(
//     useCallback(() => {
//       const refreshData = async () => {
//         try {
//           // 1. Refresh apartments silently
//           const apartmentsRes = await userService.getApartment(currentUserId);
//           if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
//             setApartments([]);
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setCurrentStep(1);
//             return;
//           }
          
//           const newApartments = apartmentsRes.data;
//           setApartments(newApartments);

//           // 2. If a property is selected, check if it still exists
//           if (selectedProperty) {
//             const stillExists = newApartments.some(apt => apt._id === selectedProperty._id);
//             if (!stillExists) {
//               setSelectedProperty(null);
//               setSelectedSchedule(null);
//               setCurrentStep(1);
//               return;
//             }
            
//             // Property still exists – refresh its schedules
//             const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
//             const filtered = schedulesRes.data.filter(
//               item => item.schedule.apartment_name === selectedProperty.apt_name
//             );
//             const upcomingSchedules = filtered.filter(schedule => {
//               const cleaningDate = schedule.schedule.cleaning_date;
//               const cleaningTime = schedule.schedule.cleaning_time;
//               if (!cleaningDate || !cleaningTime) return false;
//               const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
//               return cleaningDateTime.isSameOrAfter(moment());
//             });
//             setSchedules(upcomingSchedules);

//             // If selectedSchedule no longer exists, deselect it
//             if (selectedSchedule) {
//               const scheduleStillExists = upcomingSchedules.some(s => s._id === selectedSchedule._id);
//               if (!scheduleStillExists) {
//                 setSelectedSchedule(null);
//                 // Stay on step 2 but with no schedule selected
//               }
//             }
//           } else {
//             // No property selected – ensure step 1
//             setCurrentStep(1);
//             setSelectedSchedule(null);
//           }
//         } catch (error) {
//           console.error('Error refreshing data:', error);
//         }
//       };

//       refreshData();
//     }, [currentUserId, selectedProperty, selectedSchedule])
//   );

//   // ---------- Cleanup on unmount ----------
//   useEffect(() => {
//     return () => {
//       setCurrentStep(1);
//       setSelectedProperty(null);
//       setSelectedSchedule(null);
//     };
//   }, []);

//   // ---------- Navigation handlers ----------
//   const handleStepNavigation = () => {
//     if (currentStep === 1 && selectedProperty) {
//       setCurrentStep(2);
//     }
//     if (currentStep === 2 && selectedSchedule) {
//       setCurrentStep(3);
//     }
//   };

//   const handleCloseCreateBooking = () => {
//     handleCreateSchedule(false);
//   };

//   // ---------- Render functions ----------
//   const renderPropertyItem = ({ item }) => (
//     <View style={{marginHorizontal:15}}>
//       <TouchableOpacity
//         style={[
//           styles.card,
//           selectedProperty?._id === item._id && styles.selectedCard
//         ]}
//         onPress={() => setSelectedProperty(item)}
//       >
//         {selectedProperty?._id === item._id && (
//           <View style={styles.checkBadge}>
//             <Feather name="check" size={16} color="white" />
//           </View>
//         )}

//         <View style={styles.itemContent}>
//           <View style={{marginRight:10}}>
//             <AntDesign name="home" size={40} color={COLORS.gray}/>
//           </View>
//           <View style={{width:'85%'}}>
//             <Text style={styles.cardTitle}>{item.apt_name}</Text>
//             <Text style={styles.address}>{item.address}</Text>
//           </View>
//         </View>

//         <View style={styles.room_type_container}>
//           <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
//             {item.roomDetails[0]?.['number'] || 0} {item.roomDetails[0]?.['type'] || ''}
//           </Chip>
//           <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
//             {item.roomDetails[1]?.['number'] || 0} {item.roomDetails[1]?.['type'] || ''}
//           </Chip>
//           <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
//             {item.roomDetails[2]?.['number'] || 0} {item.roomDetails[2]?.['type'] || ''}
//           </Chip>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderScheduleItem = ({ item }) => {
//     const dateBadge = {
//       day: moment(item.schedule.cleaning_date).format('D'),
//       month: moment(item.schedule.cleaning_date).format('MMM'),
//       dayName: moment(item.schedule.cleaning_date).format('dddd')
//     };
//     return (
//       <View style={{marginHorizontal:15}}>
//         <TouchableOpacity
//           style={[
//             styles.card,
//             styles.scheduleCard,
//             selectedSchedule?._id === item._id && styles.selectedCard
//           ]}
//           onPress={() => setSelectedSchedule(item)}
//         >
//           <View style={styles.scheduleDetails}>
//             <View style={[styles.dateBadge, { backgroundColor: COLORS.primary }]}>
//               <Text style={styles.day}>{dateBadge.day}</Text>
//               <Text style={styles.month}>{dateBadge.month}</Text>
//             </View>
//             <View>
//               <Text style={styles.cardTitle}>{dateBadge.dayName}</Text>
//               <View style={styles.row}>
//                 <MaterialIcons name="schedule" size={18} color={COLORS.light_gray} />
//                 <Text style={styles.infoText}>
//                   {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')} - {moment(item.schedule.cleaning_end_time, 'h:mm:ss A').format('h:mm A') || 'TBD'}
//                 </Text>
//               </View>
//               <View style={styles.row}>
//                 <MaterialIcons name="location-on" size={18} color={COLORS.light_gray} />
//                 <Text style={styles.address}>{item.schedule.address}</Text>
//               </View>
//             </View>
//           </View>
//           {selectedSchedule?._id === item._id && (
//             <View style={styles.checkBadge}>
//               <Feather name="check" size={16} color="white" />
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderCleanerItem = ({ item }) => {
//     return (
//       <View style={{margin:10}}>
//         <CleanerCard
//           item={item}
//           onPress={() =>
//             navigation.navigate(ROUTES.cleaner_profile_info, {
//               item: item,
//               selected_schedule: selectedSchedule,
//               selected_scheduleId: selectedSchedule._id,
//               hostId: item,
//               requestId: item._id,
//               hostFname: item.firstname,
//               hostLname: item.lastname,
//               distanceFromApartment: item.distanceFromApartment
//             })
//           }
//         />
//       </View>
//     );
//   };

//   // ---------- Render ----------
//   return (
//     <View style={styles.container}>
//       <CustomHeader 
//         navigation={navigation}
//         currentStep={currentStep}
//         setCurrentStep={setCurrentStep}
//       />

//       <ScrollView 
//         contentContainerStyle={styles.content}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={async () => {
//               setRefreshing(true);
//               try {
//                 // Force refresh: reload apartments and schedules
//                 const apartmentsRes = await userService.getApartment(currentUserId);
//                 if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
//                   Alert.alert(
//                     'Property Required',
//                     'You need to add at least one property before you can find cleaners.',
//                     [{ text: 'OK', onPress: () => navigation.replace(ROUTES.host_dashboard) }],
//                     { cancelable: false }
//                   );
//                   setRefreshing(false);
//                   return;
//                 }
//                 setApartments(apartmentsRes.data);
//                 if (selectedProperty) {
//                   const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
//                   const filtered = schedulesRes.data.filter(
//                     item => item.schedule.apartment_name === selectedProperty.apt_name
//                   );
//                   const upcomingSchedules = filtered.filter(schedule => {
//                     const cleaningDate = schedule.schedule.cleaning_date;
//                     const cleaningTime = schedule.schedule.cleaning_time;
//                     if (!cleaningDate || !cleaningTime) return false;
//                     const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
//                     return cleaningDateTime.isSameOrAfter(moment());
//                   });
//                   setSchedules(upcomingSchedules);
//                   if (selectedSchedule) {
//                     const stillExists = upcomingSchedules.some(s => s._id === selectedSchedule._id);
//                     if (!stillExists) setSelectedSchedule(null);
//                   }
//                 } else {
//                   setSchedules([]);
//                   setSelectedSchedule(null);
//                   setCurrentStep(1);
//                 }
//               } catch (error) {
//                 console.error('Pull-to-refresh error:', error);
//               } finally {
//                 setRefreshing(false);
//               }
//             }}
//           />
//         }
//       >
//         {currentStep === 1 && (
//           <Animated.View entering={FadeIn} exiting={FadeOut}>
//             <FlatList
//               data={apartments}
//               renderItem={renderPropertyItem}
//               keyExtractor={item => item._id}
//               scrollEnabled={false}
//             />
//           </Animated.View>
//         )}

//         {currentStep === 2 && (
//           <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
//             {schedules.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Feather name="calendar" size={40} color={COLORS.gray} />
//                 <Text style={styles.emptyText}>{tSafe('no_available_schedules', 'No available schedules for this property')}</Text>
//                 <TouchableOpacity
//                   style={styles.createScheduleButton}
//                   onPress={() => handleCreateSchedule(true)}
//                 >
//                   <Text style={{color:'white'}}>{tSafe('create_schedule', 'Create Schedule')}</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <FlatList
//                 data={schedules}
//                 renderItem={renderScheduleItem}
//                 keyExtractor={item => item._id}
//                 scrollEnabled={false}
//               />
//             )}
//           </Animated.View>
//         )}

//         {currentStep === 3 && (
//           <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
//             <View style={styles.location_calendar_block}>
//               <View style={styles.calender}>
//                 <Text style={{ fontSize: 12 }}>
//                   {moment(selectedSchedule.schedule.cleaning_date).format('ddd MMM DD')}
//                 </Text>
//                 <Text style={{ fontSize: 11 }}>{selectedSchedule.schedule.cleaning_time}</Text>
//               </View>
//               <View style={styles.addre1}>
//                 <Text style={styles.headline1}>{selectedProperty.apt_name}</Text>
//                 <Text style={styles.tagline1}>{selectedProperty.address}</Text>
//               </View>
//             </View>
//             {loading ? (
//               <View>
//                 <View style={{ marginTop: 16 }}>
//                   {[...Array(5)].map((_, index) => (
//                     <CleanerCardSkeleton key={index} />
//                   ))}
//                 </View>
//               </View>
//             ) : (
//               <FlatList
//                 data={cleaners}
//                 renderItem={renderCleanerItem}
//                 keyExtractor={item => item._id}
//                 ListEmptyComponent={
//                   <Text style={styles.emptyText}>{tSafe('no_available_cleaners', 'No available cleaners found')}</Text>
//                 }
//                 scrollEnabled={false}
//               />
//             )}
//           </Animated.View>
//         )}
//       </ScrollView>

//       {/* 🔥 Footer Navigation – only shows when selection is made */}
//       {(currentStep === 1 && selectedProperty) || (currentStep === 2 && selectedSchedule) ? (
//         <TouchableOpacity
//           style={styles.nextButton}
//           onPress={handleStepNavigation}
//         >
//           <Text style={styles.buttonText}>
//             {currentStep === 1 ? tSafe('next_choose_schedule', 'Next: Choose Schedule') : tSafe('find_cleaners', 'Find Cleaners')}
//           </Text>
//           <Feather name="arrow-right" size={20} color="white" />
//         </TouchableOpacity>
//       ) : null}

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

// // Styles remain unchanged (same as before)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.light,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: COLORS.white,
//     shadowColor: COLORS.dark,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   stepIndicatorContainer: {
//     flexDirection: 'row',
//     flex: 1,
//     justifyContent: 'center',
//     gap: 8,
//   },
//   stepIndicator: {
//     width: 28,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: COLORS.lightGray,
//   },
//   activeStepIndicator: {
//     backgroundColor: COLORS.primary,
//   },
//   content: {
//     padding: 0,
//     marginTop:20
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginHorizontal:15,
//     marginVertical:20
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primaryLight,
//   },
//   checkBadge: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: COLORS.primary,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.dark,
//     marginTop: 4,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   scheduleDetails: {
//     marginTop: 8,
//     flexDirection:'row'
//   },
//   nextButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 16,
//     margin: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 12,
//   },
//   disabledButton: {
//     backgroundColor: COLORS.lightGray,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     padding: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     color: COLORS.gray,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: COLORS.gray,
//     marginTop: 24,
//   },
//   location_calendar_block:{
//     flexDirection:'row',
//     justifyContent:'center',
//     height:60,
//     borderRadius:0,
//     borderWidth:0.5,
//     borderColor:COLORS.light_gray,
//     marginBottom:20
//   },
//   addre1:{
//     flex:0.8,
//     paddingHorizontal:10
//   },
//   calender:{
//     flex:0.2,
//     padding:10,
//     backgroundColor:COLORS.light_gray_1,
//     borderBottomLeftRadius:0,
//     borderTopLeftRadius:5,
//     alignItems:'center'
//   },
//   headline1: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 0,
//     marginTop:7,
//   },
//   tagline1: {
//       fontSize: 14,
//       color: '#555',
//       marginBottom: 16,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 32,
//   },
//   emptyText: {
//     marginTop: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//   },
//   room_type_container:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     alignItems:'center',
//     marginTop:10,
//     width:'100%'
//   },
//   activeChip: {
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius:50
//   },
//   textChip: {
//     fontSize: 12,
//     fontWeight: '400',
//     color: COLORS.gray,
//   },
//   itemContent:{
//     flexDirection:'row',
//     alignItems:'center',
//   },
//   address:{
//     fontSize: 13,
//     color: '#555',
//   },
//   scheduleIcon: {
//     backgroundColor: COLORS.primary_light_1,
//     borderRadius: 8,
//     padding: 12,
//     marginRight: 16,
//   },
//   createScheduleButton:{
//     padding:10,
//     backgroundColor:COLORS.primary,
//     borderRadius:50,
//     marginTop:20
//   },
//   dateBadge: {
//     width: 70,
//     height: 70,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   day: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   month: {
//     fontSize: 14,
//     color: 'white',
//     textTransform: 'uppercase',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
    
//   },
//   infoText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: COLORS.gray,
//   },
// });

// export default FindCleaners;

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Modal, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import { HomeSkeleton } from '../../components/shared/skeleton/HomeSkeleton';
import * as Animatable from 'react-native-animatable';
import { AntDesign } from '@expo/vector-icons';
import { Chip } from 'react-native-paper';
import ROUTES from '../../constants/routes';
import CustomHeader from '../../components/shared/CustomHeader';
import { useBookingContext } from '../../context/BookingContext';
import NewBooking from './NewBooking';
import CleanerCard from '../../components/cleaner/CleanerCard';
import { tSafe } from '../../utils/tSafe';
import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';

const FindCleaners = ({ navigation }) => {
  const { currentUserId, currentUser } = useContext(AuthContext);
  const { modalVisible, handleCreateSchedule } = useBookingContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- Status state ---
  const [cleanerStatuses, setCleanerStatuses] = useState({});
  const [statusCounts, setStatusCounts] = useState({
    notified: 0,
    pending: 0,
    accepted: 0,
    declined: 0
  });

  const genericArray = new Array(5).fill(null);

  // ---------- Initial Data Fetch ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apartmentsRes] = await Promise.all([
          userService.getApartment(currentUserId),
        ]);
  
        if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
          Alert.alert(
            'Property Required',
            'You need to add at least one property before you can find cleaners. Please add a property first.',
            [
              {
                text: 'OK',
                onPress: () => navigation.replace(ROUTES.host_dashboard),
              },
            ],
            { cancelable: false }
          );
          return;
        }
  
        setApartments(apartmentsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load your properties. Please try again.');
      }
    };
  
    fetchData();
  }, [currentUserId, navigation]);

  // ---------- Fetch schedules when property is selected ----------
  useEffect(() => {
    const fetchPropertySchedules = async () => {
      if (!selectedProperty) return;
      
      try {
        const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
        const filtered = schedulesRes.data.filter(
          item => item.schedule.apartment_name === selectedProperty.apt_name
        );

        const upcomingSchedules = filtered.filter(schedule => {
          const cleaningDate = schedule.schedule.cleaning_date;
          const cleaningTime = schedule.schedule.cleaning_time;
          if (!cleaningDate || !cleaningTime) return false;
          const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
          return cleaningDateTime.isSameOrAfter(moment());
        });
        
        setSchedules(upcomingSchedules);
        setSelectedSchedule(null);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };
    
    fetchPropertySchedules();
  }, [selectedProperty, currentUserId]);

  // ---------- Fetch cleaners + statuses when schedule is selected ----------
  useEffect(() => {
    if (!selectedSchedule) return;
  
    setLoading(true);
  
    const timeout = setTimeout(async () => {
      try {
        // 1. Fetch cleaners
        const cleanersRes = await userService.findCleaners(selectedSchedule._id);
        setCleaners(cleanersRes.data);

        // 2. Fetch schedule details for statuses
        const scheduleRes = await userService.getScheduleById(selectedSchedule._id);
        const notified = scheduleRes.data.notified_cleaners || [];

        // Build status map
        const statusMap = {};
        notified.forEach(item => {
          statusMap[item.cleanerId] = item.status || 'pending';
        });
        setCleanerStatuses(statusMap);

        // Compute counts
        const counts = { notified: 0, pending: 0, accepted: 0, declined: 0 };
        notified.forEach(item => {
          const s = item.status || 'pending';
          if (counts[s] !== undefined) counts[s]++;
        });
        setStatusCounts(counts);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }, 2000);
  
    return () => {
      clearTimeout(timeout);
      setLoading(false);
    };
  }, [selectedSchedule]);

  // ---------- Auto-refresh statuses every 10 seconds ----------
  useEffect(() => {
    if (!selectedSchedule || loading) return;

    const interval = setInterval(async () => {
      try {
        const scheduleRes = await userService.getScheduleById(selectedSchedule._id);
        const notified = scheduleRes.data.notified_cleaners || [];

        const statusMap = {};
        notified.forEach(item => {
          statusMap[item.cleanerId] = item.status || 'pending';
        });
        setCleanerStatuses(statusMap);

        const counts = { notified: 0, pending: 0, accepted: 0, declined: 0 };
        notified.forEach(item => {
          const s = item.status || 'pending';
          if (counts[s] !== undefined) counts[s]++;
        });
        setStatusCounts(counts);
      } catch (e) {
        // silent fail – will retry next interval
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [selectedSchedule, loading]);

  // ---------- SILENT REFRESH on focus ----------
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          const apartmentsRes = await userService.getApartment(currentUserId);
          if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
            setApartments([]);
            setSelectedProperty(null);
            setSelectedSchedule(null);
            setCurrentStep(1);
            return;
          }
          
          const newApartments = apartmentsRes.data;
          setApartments(newApartments);

          if (selectedProperty) {
            const stillExists = newApartments.some(apt => apt._id === selectedProperty._id);
            if (!stillExists) {
              setSelectedProperty(null);
              setSelectedSchedule(null);
              setCurrentStep(1);
              return;
            }
            
            const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
            const filtered = schedulesRes.data.filter(
              item => item.schedule.apartment_name === selectedProperty.apt_name
            );
            const upcomingSchedules = filtered.filter(schedule => {
              const cleaningDate = schedule.schedule.cleaning_date;
              const cleaningTime = schedule.schedule.cleaning_time;
              if (!cleaningDate || !cleaningTime) return false;
              const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
              return cleaningDateTime.isSameOrAfter(moment());
            });
            setSchedules(upcomingSchedules);

            if (selectedSchedule) {
              const scheduleStillExists = upcomingSchedules.some(s => s._id === selectedSchedule._id);
              if (!scheduleStillExists) {
                setSelectedSchedule(null);
              }
            }
          } else {
            setCurrentStep(1);
            setSelectedSchedule(null);
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      };

      refreshData();
    }, [currentUserId, selectedProperty, selectedSchedule])
  );

  // ---------- Cleanup on unmount ----------
  useEffect(() => {
    return () => {
      setCurrentStep(1);
      setSelectedProperty(null);
      setSelectedSchedule(null);
    };
  }, []);

  // ---------- Navigation handlers ----------
  const handleStepNavigation = () => {
    if (currentStep === 1 && selectedProperty) {
      setCurrentStep(2);
    }
    if (currentStep === 2 && selectedSchedule) {
      setCurrentStep(3);
    }
  };

  const handleCloseCreateBooking = () => {
    handleCreateSchedule(false);
  };

  // ---------- Render functions ----------
  const renderPropertyItem = ({ item }) => (
    <View style={{marginHorizontal:15}}>
      <TouchableOpacity
        style={[
          styles.card,
          selectedProperty?._id === item._id && styles.selectedCard
        ]}
        onPress={() => setSelectedProperty(item)}
      >
        {selectedProperty?._id === item._id && (
          <View style={styles.checkBadge}>
            <Feather name="check" size={16} color="white" />
          </View>
        )}

        <View style={styles.itemContent}>
          <View style={{marginRight:10}}>
            <AntDesign name="home" size={40} color={COLORS.gray}/>
          </View>
          <View style={{width:'85%'}}>
            <Text style={styles.cardTitle}>{item.apt_name}</Text>
            <Text style={styles.address}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.room_type_container}>
          <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
            {item.roomDetails[0]?.['number'] || 0} {item.roomDetails[0]?.['type'] || ''}
          </Chip>
          <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
            {item.roomDetails[1]?.['number'] || 0} {item.roomDetails[1]?.['type'] || ''}
          </Chip>
          <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
            {item.roomDetails[2]?.['number'] || 0} {item.roomDetails[2]?.['type'] || ''}
          </Chip>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderScheduleItem = ({ item }) => {
    const dateBadge = {
      day: moment(item.schedule.cleaning_date).format('D'),
      month: moment(item.schedule.cleaning_date).format('MMM'),
      dayName: moment(item.schedule.cleaning_date).format('dddd')
    };
    return (
      <View style={{marginHorizontal:15}}>
        <TouchableOpacity
          style={[
            styles.card,
            styles.scheduleCard,
            selectedSchedule?._id === item._id && styles.selectedCard
          ]}
          onPress={() => setSelectedSchedule(item)}
        >
          <View style={styles.scheduleDetails}>
            <View style={[styles.dateBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.day}>{dateBadge.day}</Text>
              <Text style={styles.month}>{dateBadge.month}</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>{dateBadge.dayName}</Text>
              <View style={styles.row}>
                <MaterialIcons name="schedule" size={18} color={COLORS.light_gray} />
                <Text style={styles.infoText}>
                  {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')} - {moment(item.schedule.cleaning_end_time, 'h:mm:ss A').format('h:mm A') || 'TBD'}
                </Text>
              </View>
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={18} color={COLORS.light_gray} />
                <Text style={styles.address}>{item.schedule.address}</Text>
              </View>
            </View>
          </View>
          {selectedSchedule?._id === item._id && (
            <View style={styles.checkBadge}>
              <Feather name="check" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderCleanerItem = ({ item }) => {
    const cleanerId = item._id;
    const status = cleanerStatuses[cleanerId] || 'pending'; // default to pending
   

    return (
      <View style={{margin:10}}>
        <CleanerCard
          item={item}
          status={status}
          onPress={() =>
            navigation.navigate(ROUTES.cleaner_profile_info, {
              item: item,
              selected_schedule: selectedSchedule,
              selected_scheduleId: selectedSchedule._id,
              hostId: item,
              requestId: item._id,
              hostFname: item.firstname,
              hostLname: item.lastname,
              distanceFromApartment: item.distanceFromApartment
            })
          }
        />
      </View>
    );
  };

  // ---------- Render ----------
  return (
    <View style={styles.container}>
      <CustomHeader 
        navigation={navigation}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                // Force refresh: reload apartments and schedules
                const apartmentsRes = await userService.getApartment(currentUserId);
                if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
                  Alert.alert(
                    'Property Required',
                    'You need to add at least one property before you can find cleaners.',
                    [{ text: 'OK', onPress: () => navigation.replace(ROUTES.host_dashboard) }],
                    { cancelable: false }
                  );
                  setRefreshing(false);
                  return;
                }
                setApartments(apartmentsRes.data);
                if (selectedProperty) {
                  const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
                  const filtered = schedulesRes.data.filter(
                    item => item.schedule.apartment_name === selectedProperty.apt_name
                  );
                  const upcomingSchedules = filtered.filter(schedule => {
                    const cleaningDate = schedule.schedule.cleaning_date;
                    const cleaningTime = schedule.schedule.cleaning_time;
                    if (!cleaningDate || !cleaningTime) return false;
                    const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
                    return cleaningDateTime.isSameOrAfter(moment());
                  });
                  setSchedules(upcomingSchedules);
                  if (selectedSchedule) {
                    const stillExists = upcomingSchedules.some(s => s._id === selectedSchedule._id);
                    if (!stillExists) setSelectedSchedule(null);
                  }
                  // Also refresh statuses for the selected schedule
                  if (selectedSchedule) {
                    const scheduleRes = await userService.getScheduleById(selectedSchedule._id);
                    const notified = scheduleRes.data.notified_cleaners || [];
                    const statusMap = {};
                    notified.forEach(item => {
                      statusMap[item.cleanerId] = item.status || 'pending';
                    });
                    setCleanerStatuses(statusMap);
                    const counts = { notified: 0, pending: 0, accepted: 0, declined: 0 };
                    notified.forEach(item => {
                      const s = item.status || 'pending';
                      if (counts[s] !== undefined) counts[s]++;
                    });
                    setStatusCounts(counts);
                  }
                } else {
                  setSchedules([]);
                  setSelectedSchedule(null);
                  setCurrentStep(1);
                }
              } catch (error) {
                console.error('Pull-to-refresh error:', error);
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
      >
        {currentStep === 1 && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <FlatList
              data={apartments}
              renderItem={renderPropertyItem}
              keyExtractor={item => item._id}
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {currentStep === 2 && (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
            {schedules.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={40} color={COLORS.gray} />
                <Text style={styles.emptyText}>{tSafe('no_available_schedules', 'No available schedules for this property')}</Text>
                <TouchableOpacity
                  style={styles.createScheduleButton}
                  onPress={() => handleCreateSchedule(true)}
                >
                  <Text style={{color:'white'}}>{tSafe('create_schedule', 'Create Schedule')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={schedules}
                renderItem={renderScheduleItem}
                keyExtractor={item => item._id}
                scrollEnabled={false}
              />
            )}
          </Animated.View>
        )}

        {currentStep === 3 && (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
            <View style={styles.location_calendar_block}>
              <View style={styles.calender}>
                <Text style={{ fontSize: 12 }}>
                  {moment(selectedSchedule.schedule.cleaning_date).format('ddd MMM DD')}
                </Text>
                <Text style={{ fontSize: 11 }}>{selectedSchedule.schedule.cleaning_time}</Text>
              </View>
              <View style={styles.addre1}>
                <Text style={styles.headline1}>{selectedProperty.apt_name}</Text>
                <Text style={styles.tagline1}>{selectedProperty.address}</Text>
              </View>
            </View>

            {/* ----- Status Summary ----- */}
            <View style={styles.statusSummary}>
              <Text style={styles.summaryText}>
                Notified: <Text style={styles.summaryCount}>{statusCounts.notified}</Text>
              </Text>
              <Text style={styles.summaryText}>
                Pending: <Text style={styles.summaryCount}>{statusCounts.pending}</Text>
              </Text>
              <Text style={styles.summaryText}>
                Accepted: <Text style={styles.summaryCount}>{statusCounts.accepted}</Text>
              </Text>
              <Text style={styles.summaryText}>
                Declined: <Text style={styles.summaryCount}>{statusCounts.declined}</Text>
              </Text>
            </View>

            {loading ? (
              <View style={{ marginTop: 16 }}>
                {[...Array(5)].map((_, index) => (
                  <CleanerCardSkeleton key={index} />
                ))}
              </View>
            ) : (
              <FlatList
                data={cleaners}
                renderItem={renderCleanerItem}
                keyExtractor={item => item._id}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>{tSafe('no_available_cleaners', 'No available cleaners found')}</Text>
                }
                scrollEnabled={false}
              />
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer Navigation – only shows when selection is made */}
      {(currentStep === 1 && selectedProperty) || (currentStep === 2 && selectedSchedule) ? (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleStepNavigation}
        >
          <Text style={styles.buttonText}>
            {currentStep === 1 ? tSafe('next_choose_schedule', 'Next: Choose Schedule') : tSafe('find_cleaners', 'Find Cleaners')}
          </Text>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      ) : null}

      <Modal 
        visible={modalVisible}
        animationType="slide" 
      >
        <NewBooking 
          close_modal={handleCloseCreateBooking}
          mode="create"
        />
      </Modal>
    </View>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  stepIndicator: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightGray,
  },
  activeStepIndicator: {
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 0,
    marginTop:20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginHorizontal:15,
    marginVertical:20
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  scheduleDetails: {
    marginTop: 8,
    flexDirection:'row'
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 24,
  },
  location_calendar_block:{
    flexDirection:'row',
    justifyContent:'center',
    height:60,
    borderRadius:0,
    borderWidth:0.5,
    borderColor:COLORS.light_gray,
    marginBottom:20
  },
  addre1:{
    flex:0.8,
    paddingHorizontal:10
  },
  calender:{
    flex:0.2,
    padding:10,
    backgroundColor:COLORS.light_gray_1,
    borderBottomLeftRadius:0,
    borderTopLeftRadius:5,
    alignItems:'center'
  },
  headline1: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 0,
    marginTop:7,
  },
  tagline1: {
      fontSize: 14,
      color: '#555',
      marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  room_type_container:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:10,
    width:'100%'
  },
  activeChip: {
    backgroundColor: COLORS.light_gray_1,
    borderRadius:50
  },
  textChip: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.gray,
  },
  itemContent:{
    flexDirection:'row',
    alignItems:'center',
  },
  address:{
    fontSize: 13,
    color: '#555',
  },
  scheduleIcon: {
    backgroundColor: COLORS.primary_light_1,
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
  },
  createScheduleButton:{
    padding:10,
    backgroundColor:COLORS.primary,
    borderRadius:50,
    marginTop:20
  },
  dateBadge: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  day: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  month: {
    fontSize: 14,
    color: 'white',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.gray,
  },

  // ----- Status Summary styles -----
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
  },
  summaryCount: {
    fontWeight: '700',
    color: '#1E1E2F',
  },
});

export default FindCleaners;