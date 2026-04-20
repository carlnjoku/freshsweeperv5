// import React, {useState, useEffect, useLayoutEffect,useCallback, useRef, useContext} from  'react';
// import { useFocusEffect } from '@react-navigation/native';
// import Button from '../../components/shared/Button';
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import { SafeAreaView, RefreshControl, StyleSheet, Text, Alert, KeyboardAvoidingView, Keyboard, Platform, StatusBar, Linking,  FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Switch, Card,Avatar,Badge, Divider, Title, Paragraph, IconButton } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import CustomCard from '../../components/shared/CustomCard';
// import CircleIcon from '../../components/shared/CircleIcon';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import AddICalModal from '../../components/host/AddICalModal';
// import userService from '../../services/connection/userService';


// export default function PropertyDashboard({route}) {
//     const {property} = route.params;
//     const navigation = useNavigation();
  
//     const [refreshing, setRefreshing] = useState(false);
//     const [openModal, setOpenModal] = useState(false);
//     const [isAutomated, setIsAutomated] = useState(property?.isAutomated);
//     const [automatedSchedules, setAutomatedSchedules] = useState([]);
//     const [manualSchedules, setManualSchedules] = useState([]);
//     const [upcoming_schedules, setUpComingSchedules] = useState([]);
//     const [ongoing_schedules, setOnGoingSchedules] = useState([]);
//     const [completed_schedules, setCompletedSchedules] = useState([]);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [icalData, setIcalData] = useState(null);
//     const [cleaners, setCleaners] = useState([]);
//     const [syncedCalendars, setSyncedCalendars] = useState([]);
//     const [selectedPlatform, setSelectedPlatform] = useState(null);
//     const [selectedCalendar, setSelectedCalendar] = useState(null);
  
//     // Room details calculations
//     const bedroomCount = property?.roomDetails.find(room => room.type === "Bedroom")?.number || 0;
//     const bathroomCount = property?.roomDetails.find(room => room.type === "Bathroom")?.number || 0;
//     const kitchen = property?.roomDetails.find(room => room.type === "Kitchen")?.number || 0;
//     const livingroomCount = property?.roomDetails.find(room => room.type === "Livingroom")?.number || 0;
//     const bedroomSize = property?.roomDetails.find(room => room.type === "Bedroom")?.size || 0;
//     const bathroomSize = property?.roomDetails.find(room => room.type === "Bathroom")?.size || 0;
//     const kitchenSize = property?.roomDetails.find(room => room.type === "Kitchen")?.size || 0;
//     const livingroomSize = property?.roomDetails.find(room => room.type === "Livingroom")?.size || 0;
//     const [checklists, setChecklists] = useState([]);


//     // Booking platforms with dynamic connection status
//     const bookingPlatforms = [
//       {
//         id: 'airbnb',
//         name: 'Airbnb',
//         color: '#FF5A5F',
//         description: 'Sync your Airbnb calendar to automatically update availability',
//         icon: require('../../assets/images/airbnb_logo.png'), // Make sure you have these assets
//         connected: syncedCalendars.some(cal => cal.platform === 'airbnb' && cal.enabled),
//       },
//       {
//         id: 'booking',
//         name: 'Booking.com',
//         color: '#003580',
//         description: 'Connect your Booking.com account to manage reservations',
//         icon: require('../../assets/images/booking_logo.png'),
//         connected: syncedCalendars.some(cal => cal.platform === 'booking' && cal.enabled),
//       },
//       {
//         id: 'vrbo',
//         name: 'Vrbo',
//         color: '#00A699',
//         description: 'Link your Vrbo property to sync bookings and availability',
//         icon: require('../../assets/images/vrbo_logo.png'),
//         connected: syncedCalendars.some(cal => cal.platform === 'vrbo' && cal.enabled),
//       },
//       {
//         id: 'ical',
//         name: 'Other Calendar',
//         color: '#6200EE',
//         description: 'Sync using a generic iCal URL',
//         // icon: require('../../assets/calendar-icon.png'),
//         connected: syncedCalendars.some(cal => cal.platform === 'other' && cal.enabled),
//       },
//     ];

//     console.log(JSON.stringify(bookingPlatforms, null, 2))
    
//     // Create a function to check if a platform is connected
//     const isPlatformConnected = (platformId) => {
//       return syncedCalendars.some(calendar => 
//         calendar.platform === platformId && 
//         calendar.status === 'linked'
//       );
//     };

//     // Find the specific calendar for a platform
//     const getCalendarForPlatform = (platformId) => {
//       console.log("My sync calendar plus", syncedCalendars)
//       return syncedCalendars.find(cal => cal.platform === platformId);
//     };

//     // Fetch checklists for the property
//     const fetchChecklists = async () => {
//       try {
//         console.log(property)
//         const chcklist_array = property.checklists // array of checklist eg ["68a496db3f7c7bf2fbfed7c0"]
//         console.log(chcklist_array)
//         const response = await userService.getCustomChecklistsByProperty(chcklist_array);
//         const res = response.data.data
//         console.log("My restttttt", res)
//         setChecklists(res);
//       } catch (error) {
//         console.error("Error fetching checklists:", error);
//       }
//     };


//     useEffect(() => {
//       fetchSyncedCals();
//       fetchSchedules();
//       fetchChecklists(); // Add this
//     }, []);
  
    
  
    

// //   const fetchSyncedCals = async () => {
// //   try {
// //     const response = await userService.getSyncedCalsByApartmentIds(property._id);

// //     // Handle no data scenario
// //     if (!response.data || response.data.length === 0) {
// //       setSyncedCalendars([]);
// //       return;
// //     }

// //     const calId = response.data[0]._id; // The _id of the document

// //     // Extract calendars and add propertyId + documentId to each
// //     const calendars = response.data[0].calendars
// //       ? response.data[0].calendars.map(calendar => ({
// //           ...calendar,
// //           propertyId: property._id,
// //           calId // attach the document _id
// //         }))
// //       : [];

// //     console.log(
// //       "Calendars with propertyId & documentId:",
// //       JSON.stringify(calendars, null, 2)
// //     );

// //     setSyncedCalendars(calendars);
// //   } catch (error) {
// //     console.error("Error fetching synced calendars:", error);
// //     setSyncedCalendars([]);
// //   }
// // };

// const fetchSyncedCals = async () => {
//   try {
//     const response = await userService.getSyncedCalsByApartmentIds(property._id);

//     // Handle no data scenario
//     if (!response.data || response.data.length === 0) {
//       setSyncedCalendars([]);
//       return;
//     }

//     const calId = response.data[0]._id; // The _id of the document

//     // Extract calendars and add propertyId + documentId to each
//     const calendars = response.data[0].calendars
//       ? response.data[0].calendars.map(calendar => ({
//           ...calendar,
//           propertyId: property._id,
//           calId // attach the document _id
//         }))
//       : [];

//     console.log(
//       "Calendars with new structure:",
//       JSON.stringify(calendars, null, 2)
//     );

//     setSyncedCalendars(calendars);
//   } catch (error) {
//     console.error("Error fetching synced calendars:", error);
//     setSyncedCalendars([]);
//   }
// };
  
//     const fetchCleaners = async () => {
//       try {
//         const response = await userService.getAllCleaners();
//         setCleaners(response.data);
//       } catch (error) {
//         console.error("Error fetching cleaners:", error);
//         Alert.alert("Error", "Failed to load cleaners");
//       }
//     };
  
//     const toggleSync = async (id) => {
//       try {
//         const updatedCalendars = syncedCalendars.map(calendar => 
//           calendar._id === id ? { ...calendar, enabled: !calendar.enabled } : calendar
//         );
        
//         setSyncedCalendars(updatedCalendars);
        
//         // Find the calendar to update
//         const calendarToUpdate = syncedCalendars.find(cal => cal._id === id);
//         if (calendarToUpdate) {
//           await userService.updateSyncCalendar(id, {
//             enabled: !calendarToUpdate.enabled
//           });
//         }
//       } catch (error) {
//         console.error("Error toggling sync:", error);
//         Alert.alert("Error", "Failed to update sync status");
//         // Revert on error
//         fetchSyncedCals();
//       }
//     };
  
//     const handleSaveSync = async (newSync) => {
//       try {
//         setSyncedCalendars(prev => {
//           const existingIndex = prev.findIndex(item => item._id === newSync._id);
//           if (existingIndex !== -1) {
//             return prev.map((item, index) => 
//               index === existingIndex ? { ...item, ...newSync } : item
//             );
//           } else {
//             return [...prev, { ...newSync, enabled: true }];
//           }
//         });
//         await fetchSyncedCals();
//       } catch (error) {
//         console.error("Error saving sync:", error);
//       }
//     };
  
    

//     const handleSyncCalendar = async (data) => {
//       try {
//         if (selectedCalendar) {
//           // Update existing calendar
//           console.log("My selected calendar", selectedCalendar)
//           await userService.updateCalendar(data);
//         } else {
//           // Create new calendar
//           await userService.createSyncCalendar({
//             aptId: data.aptId,
//             calendar: data.calendar, 
//             selectedChecklist: data.selectedChecklist
//           });
//         }
//         fetchSyncedCals();
//         Alert.alert("Success", "Calendar sync saved successfully");
//       } catch (error) {
//         console.error("Error saving calendar sync:", error);
//         Alert.alert("Error", "Failed to save calendar sync");
//       }
//     };
  
//     const fetchSchedules = async () => {
//       // Implementation remains the same
//     };
  
//     const handleRefresh = async () => {
//       setRefreshing(true);
//       await Promise.all([fetchSyncedCals(), fetchSchedules()]);
//       setRefreshing(false);
//     };
  
//     useLayoutEffect(() => {
//       navigation.setOptions({
//         headerRight: () => (
//           <IconButton
//             icon="pencil"
//             size={20}
//             color={COLORS.primary}
//             onPress={() => navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id })}
//           />
//         ),
//       });
//     }, [navigation, property]);
  
//     useFocusEffect(
//       useCallback(() => {
//         handleRefresh();
//       }, [property._id])
//     );
  
//     const handlePlatformPress = (platformId) => {
//       setSelectedPlatform(platformId);
//       setModalVisible(true);
//     };
  
    
  
//     return (
//       <ScrollView 
//         contentContainerStyle={styles.container}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//       >
//         {/* Property Header Card */}
//         <CustomCard>
//           <View> 
//             <View style={styles.centerContent}>
//               <AntDesign name="home" size={60} color={COLORS.gray}/> 
//               <Text style={styles.headerText}>{property?.apt_name}</Text>
//               <Text style={{color:COLORS.gray, marginBottom:5, marginLeft:-5}}> 
//                 <MaterialCommunityIcons name="map-marker" size={16} />{property.address}
//               </Text>
//             </View> 
  
//             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:0, marginBottom:10}}>
//               <CircleIcon 
//                 iconName="bed-empty"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title= {bedroomCount}
//                 roomSize= {bedroomSize}
//                 type="Bedrooms"
//               /> 
//               <CircleIcon 
//                 iconName="shower-head"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title= {bathroomCount}
//                 roomSize= {bathroomSize}
//                 type="Bathrooms"
//             /> 
        
//             <CircleIcon 
//                 iconName="silverware-fork-knife"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title= {kitchen}
//                 roomSize= {kitchenSize}
//                 type="Kitchen"
//             /> 
//             <CircleIcon 
//                 iconName="seat-legroom-extra"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title= {livingroomCount}
//                 roomSize= {livingroomSize}
//                 type="Livingroom"
//             /> 
//             </View> 
//           </View>
//         </CustomCard>
  
        

      
  
//         {/* Calendar Platforms Section */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Connect Your Calendars</Text>
//           <Text style={styles.subtitle}>
//             Sync with booking platforms to automatically update your availability
//           </Text>
//         </View>


//         <View style={styles.platformsContainer}>
//         {bookingPlatforms.map((platform) => {
//           const isConnected = isPlatformConnected(platform.id);
//           const calendar = getCalendarForPlatform(platform.id);
             
          
//           return (
//             <TouchableOpacity
//               key={platform.id}
//               style={[styles.platformCard, { borderLeftColor: platform.color }]}
//               onPress={() => {
//                 if (isConnected && calendar) {
//                   setSelectedCalendar(calendar);
//                   setModalVisible(true);
//                 } else {
//                   setSelectedPlatform(platform.id);
//                   setModalVisible(true);
//                 }
//               }}
//             >
//               <View style={styles.platformHeader}>
//                 <Image source={platform.icon} style={styles.platformIcon} />
//                 <View style={styles.platformInfo}>
//                   <Text style={styles.platformName}>{platform.name}</Text>
//                   <Text style={styles.platformDescription}>{platform.description}</Text>
//                 </View>
                
                




//     <View style={styles.statusContainer}>
//       {isConnected ? (
//         <>
//           <View style={styles.connectedBadge}>
//             <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
//             <Text style={styles.connectedText}>Linked</Text>
//           </View>
          
//       {/* Status Badge - Fixed to use enabled field */}
//       {/* {calendar && (
//           <View style={[
//             styles.statusBadgeBase,
//             calendar.enabled ? styles.enabledStatus : styles.disabledStatus
//           ]}>
//             {calendar.enabled ? (
//               <MaterialIcons name="sync" size={14} color={COLORS.gray} />
//             ) : (
//               <MaterialIcons name="sync-disabled" size={14} color={COLORS.gray} />
//             )}
//             <Text style={[
//               styles.statusText,
//               calendar.enabled ? styles.enabledText : styles.disabledText
//             ]}>
//               {calendar.enabled ? 'Active' : 'Paused'}
//             </Text>
//           </View>
//         )} */}
//         {calendar && (
//           <View style={[
//             styles.statusBadgeBase, 
//             calendar.enabled ? styles.enabledStatus : styles.disabledStatus
//           ]}>
//             <MaterialIcons 
//               name={calendar.enabled ? "sync" : "sync-disabled"} 
//               size={14} 
//               color={calendar.enabled ? COLORS.white : COLORS.dark} 
//             />
//             <Text style={[
//               styles.statusText,
//               calendar.enabled ? styles.enabledText : styles.disabledText
//             ]}>
//               {calendar.enabled ? 'Active' : 'Paused'}
//             </Text>
//           </View>
//         )}
//             </>
//           ) : (
//             <View style={styles.notConnectedBadge}>
//               <Text style={styles.notConnectedText}>Not Linked</Text>
//             </View>
//           )}
//           <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
//         </View>


//               </View>
              
//               {/* Show additional info if connected */}
//               {isConnected && calendar && (
//                 <View style={styles.connectionDetails}>
//                   <Text style={styles.detailText} numberOfLines={1}>
//                     URL: {calendar.ical_url || calendar.calendar_url || 'No URL provided'}
//                   </Text>
//                   {calendar.last_synced && (
//                     <Text style={styles.detailText}>
//                       Last synced: {new Date(
//                         calendar.last_synced.$date || calendar.last_synced
//                       ).toLocaleDateString()}
//                     </Text>
//                   )}
//                 </View>
//               )}

              
//             </TouchableOpacity>
//           );
//         })}
//       </View>

        
  
//         {/* <View style={styles.platformsContainer}>
//           {bookingPlatforms.map(renderPlatformCard)}
//         </View> */}
  
//         {/* Why Connect Section */}
//         <View style={styles.footer}>
//           <Text style={styles.footerTitle}>Why Connect Calendars?</Text>
//           <View style={styles.benefitsGrid}>
//             <View style={styles.benefitCard}>
//               <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
//               <Text style={styles.benefitTitle}>Auto-Sync</Text>
//               <Text style={styles.benefitText}>Availability updates in real-time</Text>
//             </View>
//             <View style={styles.benefitCard}>
//              <MaterialIcons name="block" size={24} color={COLORS.primary} />
//              <Text style={styles.benefitTitle}>No Overbooking</Text>
//              <Text style={styles.benefitText}>Prevent double bookings</Text>
//            </View>
//            <View style={styles.benefitCard}>
//              <MaterialIcons name="schedule" size={24} color={COLORS.primary} />
//              <Text style={styles.benefitTitle}>Save Time</Text>
//              <Text style={styles.benefitText}>No manual calendar updates</Text>
//            </View>
//            <View style={styles.benefitCard}>
//              <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
//              <Text style={styles.benefitTitle}>Maximize Revenue</Text>
//              <Text style={styles.benefitText}>Optimize your booking rates</Text>
//            </View>
//           </View>
//         </View>
  
//         {/* Synced Calendars List */}
//         {syncedCalendars.length > 0 ? (
//           syncedCalendars.map((calendar) => {
//             // Safely get platform name with fallback
//             const platformName = calendar.platform || 'unknown';
//             console.log(calendar.platform)
//             // alert(platformName)
            
//             return (
//               <View key={calendar._id || calendar.id || calendar.calendar_url} style={styles.syncItem}>
//                 <View style={styles.syncInfo}>
//                   <MaterialIcons 
//                     name={calendar.enabled ? "sync" : "sync-disabled"} 
//                     size={20} 
//                     color={calendar.enabled ? COLORS.success : COLORS.gray} 
//                   />
                  
//                   <View style={styles.syncDetails}>
//                     {/* Platform name with capitalization */}
//                     <Text style={styles.syncLabel}>
//                       {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
//                     </Text>
                    
//                     {/* Calendar URL with fallback */}
//                     <Text style={styles.syncUrl} numberOfLines={1}>
//                       {calendar.calendar_url || calendar.icalUrl || 'No URL provided'}
//                     </Text>
                    
//                     {/* Last synced date */}
//                     {calendar.last_synced && (
//                       <Text style={styles.syncDate}>
//                         Last synced: {new Date(calendar.last_synced).toLocaleDateString()}
//                       </Text>
//                     )}
                    
//                     {/* Assigned cleaners section */}
//                     <View style={styles.cleanersContainer}>
//                       <Text style={styles.cleanersLabel}>Assigned cleaners:</Text>
//                       <View style={styles.cleanersList}>
//                         {calendar.assigned_cleaners && calendar.assigned_cleaners.length > 0 ? (
//                           cleaners
//                             .filter(cleaner => 
//                               calendar.assigned_cleaners.includes(cleaner._id) || 
//                               calendar.assigned_cleaners.includes(cleaner.id)
//                             )
//                             .map(cleaner => (
//                               <View key={cleaner._id || cleaner.id} style={styles.cleanerBadge}>
//                                 <Avatar.Image 
//                                   size={24} 
//                                   source={{ uri: cleaner.avatarUrl || 'https://via.placeholder.com/40' }} 
//                                   style={styles.cleanerAvatar}
//                                 />
//                                 <Text style={styles.cleanerName}>
//                                   {cleaner.firstname || 'Unknown'}
//                                 </Text>
//                               </View>
//                             ))
//                         ) : (
//                           <Text style={styles.noCleanersText}>None assigned</Text>
//                         )}
//                       </View>
//                     </View>
//                   </View>
//                 </View>
                
//                 <Switch 
//                   value={calendar.enabled !== false} // Default to true if undefined
//                   onValueChange={() => toggleSync(calendar._id || calendar.id)} 
//                   color={COLORS.primary}
//                 />
//               </View>
//             );
//           })
//         ) : (
//           <Text style={styles.emptyText}></Text>
//         )}

        
  
//         {/* Sync Calendar Button */}
//         {/* <View style={styles.manualContainer}>
//           <TouchableOpacity
//             onPress={() => {
//               setSelectedPlatform(null);
//               setModalVisible(true);
//             }}
//             style={styles.createButton}
//           >
//             <View style={{flexDirection:'row', alignItems:'center'}}>
//               <MaterialCommunityIcons name="calendar-sync" size={20} color="white" /> 
//               <Text style={styles.buttonText}> Sync Calendar</Text>
//             </View>
//           </TouchableOpacity>
//         </View> */}

//         <AddICalModal
//           visible={modalVisible}
//           onClose={() => {
//             setModalVisible(false);
//             setSelectedPlatform(null);
//             setSelectedCalendar(null); // Reset selected calendar
//           }}
//           onSave={handleSyncCalendar}
//           cleaners={cleaners}
//           aptId={property._id}
//           preselectedPlatform={selectedPlatform}
//           existingCalendar={selectedCalendar} // Pass to modal
//           checklists={checklists} // Pass checklists to modal
//         />
//       </ScrollView>
//     )
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#F5F5F5',
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   automationCard: {
//     marginBottom: 20,
//     borderRadius: 10,
//     elevation: 3,
//     backgroundColor: COLORS.primary_light_1
//   },
//   sectionHeader: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginVertical: 10,
//   },
//   card: {
//     marginBottom: 15,
//     borderRadius: 10,
//     elevation: 2,
//     backgroundColor: '#FFF',
//     height: 110
//   },
//   taskTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   taskDate: {
//     fontSize: 14,
//     color: '#555',
//   },
//   emptyText: {
//     color: '#999',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   manualContainer: {
//     alignItems: 'flex-end',
//     marginVertical: 0,
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 50,
//     paddingVertical: 10,
//     paddingHorizontal: 20
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600'
//   },
//   viewButton: {
//     marginTop: 20,
//     backgroundColor: '#6200EE',
//     borderRadius: 10,
//     paddingVertical: 8,
//   },
//   buttonLabel: {
//     fontSize: 16,
//     color: '#FFF',
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'flex-start'
//   },
//   avatar: {
//     marginRight: 10,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 14,
//     color: '#333',
//   },
//   acceptedBadge: {
//     backgroundColor: '#4CAF50',
//     marginLeft: 10,
//     paddingHorizontal: 5
//   },
//   pendingBadge: {
//     backgroundColor: '#FFC107',
//     marginLeft: 10,
//     paddingHorizontal: 5
//   },
//   centerContent: {
//     alignItems: 'center',
//     marginVertical: 10
//   },
//   infoText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     marginVertical: 10,
//     fontWeight: '600'
//   },
//   syncLabel: {
//     marginTop: 5
//   },
//   syncItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   switch: {
//     marginTop: 0,
//   },
//   statusBadgeBase: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 16,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderWidth: 1,
//   },
//   enabledStatus: {
//     backgroundColor: COLORS.success,
//     borderColor: COLORS.light_gray,
//   },
//   disabledStatus: {
//     backgroundColor: COLORS.lightGray,
//     borderColor: COLORS.gray,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 4,
//   },
//   header: {
//     paddingVertical: 24,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: COLORS.gray,
//     lineHeight: 24,
//   },
//   platformsContainer: {
//     marginBottom: 16,
//   },
//   platformCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderLeftWidth: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   platformHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   platformInfo: {
//     flex: 1,
//   },
//   platformIcon: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//     marginRight: 16,
//   },
//   platformName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   platformDescription: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   connectedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#e6f7e9',
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     marginRight: 8,
//   },
//   notConnectedBadge: {
//     backgroundColor: '#f5f5f5',
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     marginRight: 8,
//   },
//   notConnectedText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.gray,
//   },
//   connectionDetails: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: .5,
//     borderTopColor: COLORS.light_gray,
//   },
//   detailText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   footer: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   footerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   benefitsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   benefitCard: {
//     width: '48%',
//     backgroundColor: '#f8fbff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     alignItems: 'center',
//   },
//   benefitTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 8,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   benefitText: {
//     fontSize: 13,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   connectButton: {
//     backgroundColor: COLORS.primaryLight,
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     marginRight: 8,
//   },
//   connectText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   syncInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   syncDetails: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   syncUrl: {
//     color: COLORS.gray,
//     fontSize: 12,
//     marginTop: 4,
//   },
//   noCleanersText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     fontStyle: 'italic',
//   },
// });






// import React, { useState, useEffect, useLayoutEffect, useCallback, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Alert,
//   Linking,
//   FlatList,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { IconButton, Avatar, Switch, Badge, Divider, Card } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CustomCard from '../../components/shared/CustomCard';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import userService from '../../services/connection/userService';

// const { width } = Dimensions.get('window');

// export default function PropertyDashboard({ route }) {
//   const { property } = route.params;
//   const navigation = useNavigation();

//   const [refreshing, setRefreshing] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);
//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [checklists, setChecklists] = useState([]);
//   const [cleaners, setCleaners] = useState([]);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

//   // Booking platforms
//   const bookingPlatforms = [
//     { id: 'airbnb', name: 'Airbnb', color: '#FF5A5F', icon: require('../../assets/images/airbnb_logo.png'), description: 'Sync your Airbnb calendar to automatically update availability' },
//     { id: 'booking', name: 'Booking.com', color: '#003580', icon: require('../../assets/images/booking_logo.png'), description: 'Connect your Booking.com account to manage reservations' },
//     { id: 'vrbo', name: 'Vrbo', color: '#00A699', icon: require('../../assets/images/vrbo_logo.png'), description: 'Link your Vrbo property to sync bookings and availability' },
//     { id: 'ical', name: 'Other Calendar', color: '#6200EE', icon: null, description: 'Sync using a generic iCal URL' },
//   ];

//   // Helper to get connected calendar for a platform
//   const getCalendarForPlatform = (platformId) => {
//     return syncedCalendars.find(cal => cal.platform === platformId);
//   };

//   const isPlatformConnected = (platformId) => {
//     return !!getCalendarForPlatform(platformId);
//   };

//   // Fetch data
//   const fetchSyncedCals = async () => {
//     try {
//       const response = await userService.getSyncedCalsByApartmentIds(property._id);
//       if (!response.data || response.data.length === 0) {
//         setSyncedCalendars([]);
//         return;
//       }
//       const calId = response.data[0]._id;
//       const calendars = response.data[0].calendars
//         ? response.data[0].calendars.map(calendar => ({
//             ...calendar,
//             propertyId: property._id,
//             calId,
//           }))
//         : [];
//       setSyncedCalendars(calendars);
//     } catch (error) {
//       console.error('Error fetching synced calendars:', error);
//       setSyncedCalendars([]);
//     }
//   };

//   const fetchChecklists = async () => {
//     if (!property.checklists?.length) return;
//     try {
//       const response = await userService.getCustomChecklistsByProperty(property.checklists);
//       setChecklists(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//     }
//   };

//   const fetchCleaners = async () => {
//     try {
//       const response = await userService.getAllCleaners();
//       setCleaners(response.data);
//     } catch (error) {
//       console.error('Error fetching cleaners:', error);
//     }
//   };

//   const fetchAllData = async () => {
//     await Promise.all([fetchSyncedCals(), fetchChecklists(), fetchCleaners()]);
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAllData();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       handleRefresh();
//     }, [property._id])
//   );

//   // Header edit button
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <IconButton
//           icon="pencil"
//           size={20}
//           color={COLORS.primary}
//           onPress={() => navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id })}
//         />
//       ),
//     });
//   }, [navigation, property]);

//   const handlePlatformPress = (platform) => {
//     const calendar = getCalendarForPlatform(platform.id);
//     setSelectedPlatform(platform.id);
//     setSelectedCalendar(calendar || null);
//     setModalVisible(true);
//   };

//   const handleSaveSync = async (data) => {
//     try {
//       if (selectedCalendar) {
//         await userService.updateCalendar(data);
//       } else {
//         await userService.createSyncCalendar({
//           aptId: data.aptId,
//           calendar: data.calendar,
//           selectedChecklist: data.selectedChecklist,
//         });
//       }
//       await fetchSyncedCals();
//       Alert.alert('Success', 'Calendar sync saved successfully');
//     } catch (error) {
//       console.error('Error saving calendar sync:', error);
//       Alert.alert('Error', 'Failed to save calendar sync');
//     }
//   };

//   const toggleSync = async (calendar) => {
//     try {
//       await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
//       await fetchSyncedCals();
//     } catch (error) {
//       console.error('Error toggling sync:', error);
//       Alert.alert('Error', 'Failed to update sync status');
//     }
//   };

//   // Render checklist item
//   const renderChecklistItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.checklistCard}
//       onPress={() => navigation.navigate(ROUTES.host_checklist_details, { checklist: item })}
//     >
//       <View style={styles.checklistHeader}>
//         <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//         <Text style={styles.checklistName} numberOfLines={1}>{item.checklistName || 'Cleaning Checklist'}</Text>
//       </View>
//       <View style={styles.checklistMeta}>
//         <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} min</Text>
//         <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
//       </View>
//       <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
//     </TouchableOpacity>
//   );

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
//     >
//       {/* Property Header */}
//       <Animatable.View animation="fadeInUp" duration={500} style={styles.headerCard}>
//         <View style={styles.headerOverlay} />
//         <View style={styles.headerContent}>
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//           <View style={styles.addressRow}>
//             <MaterialCommunityIcons name="map-marker-outline" size={16} color="#fff" />
//             <Text style={styles.propertyAddress}>{property.address}</Text>
//           </View>
//           <View style={styles.roomStats}>
//             <CircleIcon
//               iconName="bed-empty"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bedroomCount}
//               roomSize={bedroomSize}
//               type="Bedrooms"
//             />
//             <CircleIcon
//               iconName="shower-head"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bathroomCount}
//               roomSize={bathroomSize}
//               type="Bathrooms"
//             />
//             <CircleIcon
//               iconName="silverware-fork-knife"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={kitchen}
//               roomSize={kitchenSize}
//               type="Kitchen"
//             />
//             <CircleIcon
//               iconName="seat-legroom-extra"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={livingroomCount}
//               roomSize={livingroomSize}
//               type="Livingroom"
//             />
//           </View>
//         </View>
//       </Animatable.View>

//       {/* Checklists Section */}
//       {checklists.length > 0 && (
//         <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Cleaning Checklists</Text>
//             <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_checklists, { propertyId: property._id })}>
//               <Text style={styles.viewAll}>View All</Text>
//             </TouchableOpacity>
//           </View>
//           <FlatList
//             data={checklists}
//             keyExtractor={(item) => item._id}
//             renderItem={renderChecklistItem}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.checklistList}
//           />
//         </Animatable.View>
//       )}

//       {/* Platform Connections */}
//       <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
//         <Text style={styles.sectionTitle}>Sync Your Calendars</Text>
//         <Text style={styles.sectionSubtitle}>Connect booking platforms to automatically update your availability</Text>
//         <View style={styles.platformsContainer}>
//           {bookingPlatforms.map((platform) => {
//             const calendar = getCalendarForPlatform(platform.id);
//             const connected = !!calendar;
//             return (
//               <TouchableOpacity
//                 key={platform.id}
//                 style={[styles.platformCard, { borderLeftColor: platform.color }]}
//                 onPress={() => handlePlatformPress(platform)}
//                 activeOpacity={0.8}
//               >
//                 <View style={styles.platformCardContent}>
//                   <View style={styles.platformIconContainer}>
//                     {platform.icon ? (
//                       <Image source={platform.icon} style={styles.platformIcon} />
//                     ) : (
//                       <MaterialCommunityIcons name="calendar-sync" size={32} color={platform.color} />
//                     )}
//                   </View>
//                   <View style={styles.platformInfo}>
//                     <Text style={styles.platformName}>{platform.name}</Text>
//                     <Text style={styles.platformDescription} numberOfLines={2}>
//                       {platform.description}
//                     </Text>
//                     {connected && calendar && (
//                       <View style={styles.connectionDetails}>
//                         <Text style={styles.detailText} numberOfLines={1}>
//                           {calendar.ical_url || calendar.calendar_url || 'URL not available'}
//                         </Text>
//                         {calendar.last_synced && (
//                           <Text style={styles.detailText}>
//                             Last synced: {new Date(calendar.last_synced).toLocaleDateString()}
//                           </Text>
//                         )}
//                         {calendar.assigned_cleaners?.length > 0 && (
//                           <View style={styles.cleanerBadges}>
//                             <Text style={styles.cleanerLabel}>Assigned:</Text>
//                             {calendar.assigned_cleaners.map((cid) => {
//                               const cleaner = cleaners.find(c => c._id === cid);
//                               return cleaner ? (
//                                 <View key={cid} style={styles.cleanerChip}>
//                                   <Avatar.Image size={20} source={{ uri: cleaner.avatarUrl }} />
//                                   <Text style={styles.cleanerChipText}>{cleaner.firstname}</Text>
//                                 </View>
//                               ) : null;
//                             })}
//                           </View>
//                         )}
//                       </View>
//                     )}
//                   </View>
//                   <View style={styles.platformStatus}>
//                     {connected ? (
//                       <View style={styles.connectedBadge}>
//                         <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
//                         <Text style={styles.connectedText}>Linked</Text>
//                         {calendar && (
//                           <Switch
//                             value={calendar.enabled !== false}
//                             onValueChange={() => toggleSync(calendar)}
//                             color={COLORS.primary}
//                             style={styles.syncSwitch}
//                           />
//                         )}
//                       </View>
//                     ) : (
//                       <View style={styles.connectButton}>
//                         <Text style={styles.connectButtonText}>Connect</Text>
//                         <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </Animatable.View>

//       {/* Benefits Section */}
//       <Animatable.View animation="fadeInUp" delay={300} style={styles.benefitsSection}>
//         <Text style={styles.sectionTitle}>Why Connect Calendars?</Text>
//         <View style={styles.benefitsGrid}>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>Auto-Sync</Text>
//             <Text style={styles.benefitText}>Availability updates in real-time</Text>
//           </View>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="block" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>No Overbooking</Text>
//             <Text style={styles.benefitText}>Prevent double bookings</Text>
//           </View>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="schedule" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>Save Time</Text>
//             <Text style={styles.benefitText}>No manual calendar updates</Text>
//           </View>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>Maximize Revenue</Text>
//             <Text style={styles.benefitText}>Optimize your booking rates</Text>
//           </View>
//         </View>
//       </Animatable.View>

//       <AddICalModal
//         visible={modalVisible}
//         onClose={() => {
//           setModalVisible(false);
//           setSelectedPlatform(null);
//           setSelectedCalendar(null);
//         }}
//         onSave={handleSaveSync}
//         cleaners={cleaners}
//         aptId={property._id}
//         preselectedPlatform={selectedPlatform}
//         existingCalendar={selectedCalendar}
//         checklists={checklists}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     paddingBottom: 40,
//   },
//   headerCard: {
//     margin: 16,
//     borderRadius: 24,
//     overflow: 'hidden',
//     backgroundColor: COLORS.primary,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//   },
//   headerOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//   },
//   headerContent: {
//     padding: 24,
//   },
//   propertyName: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   propertyAddress: {
//     fontSize: 14,
//     color: '#fff',
//     marginLeft: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   section: {
//     marginHorizontal: 16,
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginBottom: 16,
//   },
//   viewAll: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   checklistList: {
//     paddingRight: 16,
//   },
//   checklistCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginRight: 12,
//     width: 180,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   checklistHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 6,
//     flex: 1,
//   },
//   checklistMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   checklistMetaText: {
//     fontSize: 12,
//     color: '#6C6C80',
//   },
//   checklistArrow: {
//     position: 'absolute',
//     right: 8,
//     top: 12,
//   },
//   platformsContainer: {
//     gap: 12,
//   },
//   platformCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     borderLeftWidth: 4,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   platformCardContent: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   platformIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F5F5F5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   platformIcon: {
//     width: 32,
//     height: 32,
//     resizeMode: 'contain',
//   },
//   platformInfo: {
//     flex: 1,
//   },
//   platformName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 4,
//   },
//   platformDescription: {
//     fontSize: 12,
//     color: '#6C6C80',
//     lineHeight: 16,
//   },
//   connectionDetails: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F5',
//   },
//   detailText: {
//     fontSize: 11,
//     color: '#8E8E93',
//     marginTop: 4,
//   },
//   cleanerBadges: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   cleanerLabel: {
//     fontSize: 11,
//     color: '#6C6C80',
//     marginRight: 6,
//   },
//   cleanerChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     borderRadius: 20,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginRight: 6,
//     marginBottom: 4,
//   },
//   cleanerChipText: {
//     fontSize: 10,
//     color: '#333',
//     marginLeft: 4,
//   },
//   platformStatus: {
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//     marginLeft: 8,
//   },
//   connectedBadge: {
//     alignItems: 'center',
//   },
//   connectedText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.success,
//     marginTop: 2,
//   },
//   syncSwitch: {
//     marginTop: 8,
//   },
//   connectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F5FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   connectButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 4,
//   },
//   benefitsSection: {
//     marginHorizontal: 16,
//     marginTop: 8,
//   },
//   benefitsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   benefitCard: {
//     width: '48%',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   benefitTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginTop: 8,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   benefitText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     textAlign: 'center',
//     lineHeight: 16,
//   },
// });




// import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Alert,
//   FlatList,
//   ActivityIndicator,
//   Switch, // use native Switch
// } from 'react-native';
// import { IconButton, Avatar, Divider } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';

// export default function PropertyDashboard({ route }) {
//   const { property } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();

//   const [refreshing, setRefreshing] = useState(false);
//   const [linkedCleaners, setLinkedCleaners] = useState([]);
//   const [checklists, setChecklists] = useState([]);
//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [loadingCleaners, setLoadingCleaners] = useState(false);
//   const [loadingChecklists, setLoadingChecklists] = useState(false);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

  
//   // Fetch linked cleaners (from preferredCleaners)
//   const fetchLinkedCleaners = async () => {

//     if (!property.preferredCleaners?.length) {
//       setLinkedCleaners([]);
//       return;
//     }
    
//     setLoadingCleaners(true);
//     try {
      
//       const cleanerIds = property.preferredCleaners.map(pc => pc.id);
      
//       const users = await Promise.all(
//         cleanerIds.map(id => userService.getUser(id).catch(() => null))
//       );
//       const validCleaners = users
//         .map(res => res?.data)
//         .filter(c => c && c._id);
//       setLinkedCleaners(validCleaners);
//     } catch (error) {
//       console.error('Error fetching linked cleaners:', error);
//     } finally {
//       setLoadingCleaners(false);
//     }
//   };

//   // Fetch checklists
//   const fetchChecklists = async () => {
//     if (!property.checklists?.length) {
//       setChecklists([]);
//       return;
//     }
//     setLoadingChecklists(true);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(property.checklists);
//       setChecklists(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//     } finally {
//       setLoadingChecklists(false);
//     }
//   };

//   // Fetch synced calendars
//   const fetchSyncedCalendars = async () => {
//     try {
//       const response = await userService.getSyncedCalsByApartmentIds(property._id);
//       if (!response.data || response.data.length === 0) {
//         setSyncedCalendars([]);
//         return;
//       }
//       const calId = response.data[0]._id;
//       const calendars = response.data[0].calendars
//         ? response.data[0].calendars.map(calendar => ({
//             ...calendar,
//             propertyId: property._id,
//             calId,
//           }))
//         : [];
//       setSyncedCalendars(calendars);
//     } catch (error) {
//       console.error('Error fetching synced calendars:', error);
//       setSyncedCalendars([]);
//     }
//   };

//   const fetchAll = async () => {
//     await Promise.all([
//       fetchLinkedCleaners(),
//       fetchChecklists(),
//       fetchSyncedCalendars(),
//     ]);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchAll();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchAll();
//     }, [property._id])
//   );

//   // Remove global edit button from header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => null,
//     });
//   }, [navigation]);

//   // Handlers
//   const handleEditProperty = () => {
//     navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id });
//   };

//   const handleAddCleaner = () => {
//     navigation.navigate(ROUTES.host_invite_cleaners, { propertyId: property._id });
//   };

//   const handleAddChecklist = () => {
//     navigation.navigate(ROUTES.host_create_checklist, { propertyId: property._id });
//   };

//   const handleLinkCalendar = () => {
//     navigation.navigate(ROUTES.host_link_icalendar, { 
//       property:property,
//       hostId:currentUserId,
//     });
//   };
//   const handleAddCalendar = () => {
//     setSelectedCalendar(null);
//     setSelectedPlatform(null);
//     setModalVisible(true);
//   };

//   const handleEditCalendar = (calendar) => {
//     setSelectedCalendar(calendar);
//     setSelectedPlatform(calendar.platform);
//     setModalVisible(true);
//   };

//   const handleSaveSync = async (data) => {
//     try {
//       if (selectedCalendar) {
//         await userService.updateCalendar(data);
//       } else {
//         await userService.createSyncCalendar({
//           aptId: data.aptId,
//           calendar: data.calendar,
//           selectedChecklist: data.selectedChecklist,
//         });
//       }
//       await fetchSyncedCalendars();
//       Alert.alert('Success', 'Calendar sync saved successfully');
//     } catch (error) {
//       console.error('Error saving calendar sync:', error);
//       Alert.alert('Error', 'Failed to save calendar sync');
//     }
//   };

//   const toggleSync = async (calendar) => {
//     try {
//       await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
//       await fetchSyncedCalendars();
//     } catch (error) {
//       console.error('Error toggling sync:', error);
//       Alert.alert('Error', 'Failed to update sync status');
//     }
//   };

//   const getPlatformName = (platformId) => {
//     const map = {
//       airbnb: 'Airbnb',
//       booking: 'Booking.com',
//       vrbo: 'Vrbo',
//       ical: 'Other Calendar',
//     };
//     return map[platformId] || platformId;
//   };

//   const renderCleaner = ({ item }) => (
//     <View style={styles.cleanerItem}>
//       <Avatar.Image
//         size={40}
//         source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
//       />
//       <View style={styles.cleanerInfo}>
//         <Text style={styles.cleanerName}>{item.firstname} {item.lastname}</Text>
//         <Text style={styles.cleanerContact}>{item.email}</Text>
//       </View>
//       <TouchableOpacity
//         style={styles.unlinkButton}
//         onPress={() => {
//           Alert.alert(
//             'Unlink Cleaner',
//             `Remove ${item.firstname} from this property?`,
//             [
//               { text: 'Cancel', style: 'cancel' },
//               {
//                 text: 'Unlink',
//                 style: 'destructive',
//                 onPress: async () => {
//                   try {
//                     await userService.unlinkCleaner({ propertyId: property._id, cleanerId: item._id });
//                     await fetchLinkedCleaners();
//                   } catch (err) {
//                     Alert.alert('Error', 'Failed to unlink cleaner');
//                   }
//                 },
//               },
//             ]
//           );
//         }}
//       >
//         <MaterialIcons name="link-off" size={20} color={COLORS.error} />
//       </TouchableOpacity>
//     </View>
//   );

//   const renderChecklist = ({ item }) => (
//     <TouchableOpacity
//       style={styles.checklistItem}
//       onPress={() => navigation.navigate(ROUTES.host_create_checklist, { checklist: item })}
//     >
//       <View style={styles.checklistHeader}>
//         <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//         <Text style={styles.checklistName} numberOfLines={1}>{item.checklistName || 'Cleaning Checklist'}</Text>
//       </View>
//       <View style={styles.checklistMeta}>
//         <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} min</Text>
//         <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
//       </View>
//       <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
//     </TouchableOpacity>
//   );

//   const renderCalendar = ({ item }) => {
//     const platformName = getPlatformName(item.platform);
//     return (
//       <View style={styles.calendarItem}>
//         <View style={styles.calendarInfo}>
//           <Text style={styles.calendarName}>{platformName}</Text>
//           <Text style={styles.calendarUrl} numberOfLines={1}>
//             {item.ical_url || item.calendar_url || 'No URL provided'}
//           </Text>
//           {item.last_synced && (
//             <Text style={styles.calendarDate}>
//               Last synced: {new Date(item.last_synced).toLocaleDateString()}
//             </Text>
//           )}
//         </View>
//         <Switch
//           value={item.enabled !== false}
//           onValueChange={() => toggleSync(item)}
//           trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
//           thumbColor={COLORS.white}
//         />
//         <TouchableOpacity onPress={() => handleEditCalendar(item)} style={styles.editCalendarButton}>
//           <MaterialIcons name="edit" size={20} color={COLORS.gray} />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//     >
//       {/* Property Card */}
//       <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Property Details</Text>
//           <TouchableOpacity onPress={handleEditProperty} style={styles.cardButton}>
//             <MaterialIcons name="edit" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         <View style={styles.propertyContent}>
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//           <View style={styles.addressRow}>
//             <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
//             <Text style={styles.propertyAddress}>{property.address}</Text>
//           </View>
//           <View style={styles.roomStats}>
//             <CircleIcon
//               iconName="bed-empty"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bedroomCount}
//               roomSize={bedroomSize}
//               type="Bedrooms"
//             />
//             <CircleIcon
//               iconName="shower-head"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bathroomCount}
//               roomSize={bathroomSize}
//               type="Bathrooms"
//             />
//             <CircleIcon
//               iconName="silverware-fork-knife"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={kitchen}
//               roomSize={kitchenSize}
//               type="Kitchen"
//             />
//             <CircleIcon
//               iconName="seat-legroom-extra"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={livingroomCount}
//               roomSize={livingroomSize}
//               type="Livingroom"
//             />
//           </View>
//         </View>
//       </Animatable.View>

//       {/* Linked Cleaners Card */}
//       <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Linked Cleaners</Text>
//           <TouchableOpacity onPress={handleAddCleaner} style={styles.cardButton}>
//             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         {loadingCleaners ? (
//           <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//         ) : linkedCleaners.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="account-plus-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.emptyText}>No cleaners linked yet</Text>
//             <TouchableOpacity onPress={handleAddCleaner}>
//               <Text style={styles.emptyAction}>Invite cleaners</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={linkedCleaners}
//             keyExtractor={(item) => item._id}
//             renderItem={renderCleaner}
//             scrollEnabled={false}
//           />
//         )}
//       </Animatable.View>

//       {/* Checklists Card */}
//       <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Cleaning Checklists</Text>
//           <TouchableOpacity onPress={handleAddChecklist} style={styles.cardButton}>
//             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         {loadingChecklists ? (
//           <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//         ) : checklists.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="clipboard-list-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.emptyText}>No checklists yet</Text>
//             <TouchableOpacity onPress={handleAddChecklist}>
//               <Text style={styles.emptyAction}>Create checklist</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={checklists}
//             keyExtractor={(item) => item._id}
//             renderItem={renderChecklist}
//             scrollEnabled={false}
//           />
//         )}
//       </Animatable.View>

//       {/* Calendar Connections Card */}
//       <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Calendar Connections</Text>
//           <TouchableOpacity onPress={handleLinkCalendar} style={styles.cardButton}>
//             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         {syncedCalendars.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="calendar-sync-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.emptyText}>No calendars connected</Text>
//             <TouchableOpacity onPress={handleLinkCalendar}>
//               <Text style={styles.emptyAction}>Connect a calendar</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={syncedCalendars}
//             keyExtractor={(item) => item._id}
//             renderItem={renderCalendar}
//             scrollEnabled={false}
//           />
//         )}
//       </Animatable.View>

//       <AddICalModal
//         visible={modalVisible}
//         onClose={() => {
//           setModalVisible(false);
//           setSelectedCalendar(null);
//           setSelectedPlatform(null);
//         }}
//         onSave={handleSaveSync}
//         cleaners={[]} // Optionally pass cleaners if needed
//         aptId={property._id}
//         preselectedPlatform={selectedPlatform}
//         existingCalendar={selectedCalendar}
//         checklists={checklists}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   cardButton: {
//     padding: 4,
//   },
//   divider: {
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   propertyContent: {
//     marginTop: 4,
//   },
//   propertyName: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   propertyAddress: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cleanerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   cleanerName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   cleanerContact: {
//     fontSize: 12,
//     color: '#6C6C80',
//   },
//   unlinkButton: {
//     padding: 8,
//   },
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     padding: 8,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//   },
//   checklistHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//     flex: 1,
//   },
//   checklistMeta: {
//     flexDirection: 'row',
//     marginRight: 8,
//   },
//   checklistMetaText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginLeft: 12,
//   },
//   checklistArrow: {
//     marginLeft: 8,
//   },
//   calendarItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   calendarInfo: {
//     flex: 1,
//   },
//   calendarName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   calendarUrl: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 2,
//   },
//   calendarDate: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   editCalendarButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   loader: {
//     marginVertical: 20,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 32,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#6C6C80',
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   emptyAction: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
// });



// import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Alert,
//   FlatList,
//   ActivityIndicator,
//   Switch,
// } from 'react-native';
// import { IconButton, Avatar, Divider } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function PropertyDashboard({ route }) {
//   const { property } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();

//   const [refreshing, setRefreshing] = useState(false);
//   const [linkedCleaners, setLinkedCleaners] = useState([]);
//   const [checklists, setChecklists] = useState([]);
//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [loadingCleaners, setLoadingCleaners] = useState(false);
//   const [loadingChecklists, setLoadingChecklists] = useState(false);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

//   // Fetch linked cleaners (from preferredCleaners)
//   const fetchLinkedCleaners = async () => {
//     if (!property.preferredCleaners?.length) {
//       setLinkedCleaners([]);
//       return;
//     }
//     setLoadingCleaners(true);
//     try {
//       const cleanerIds = property.preferredCleaners.map(pc => pc.id);
//       const users = await Promise.all(
//         cleanerIds.map(id => userService.getUser(id).catch(() => null))
//       );
//       const validCleaners = users
//         .map(res => res?.data)
//         .filter(c => c && c._id);
//       setLinkedCleaners(validCleaners);
//     } catch (error) {
//       console.error('Error fetching linked cleaners:', error);
//     } finally {
//       setLoadingCleaners(false);
//     }
//   };

//   // Fetch checklists
//   const fetchChecklists = async () => {
//     if (!property.checklists?.length) {
//       setChecklists([]);
//       return;
//     }
//     setLoadingChecklists(true);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(property.checklists);
//       setChecklists(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//     } finally {
//       setLoadingChecklists(false);
//     }
//   };

//   // Fetch synced calendars
//   const fetchSyncedCalendars = async () => {
//     try {
//       const response = await userService.getSyncedCalsByApartmentIds(property._id);
//       if (!response.data || response.data.length === 0) {
//         setSyncedCalendars([]);
//         return;
//       }
//       const calId = response.data[0]._id;
//       const calendars = response.data[0].calendars
//         ? response.data[0].calendars.map(calendar => ({
//             ...calendar,
//             propertyId: property._id,
//             calId,
//           }))
//         : [];
//       setSyncedCalendars(calendars);
//     } catch (error) {
//       console.error('Error fetching synced calendars:', error);
//       setSyncedCalendars([]);
//     }
//   };

//   const fetchAll = async () => {
//     await Promise.all([
//       fetchLinkedCleaners(),
//       fetchChecklists(),
//       fetchSyncedCalendars(),
//     ]);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchAll();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchAll();
//     }, [property._id])
//   );

//   // Remove global edit button from header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => null,
//     });
//   }, [navigation]);

//   // Handlers
//   const handleEditProperty = () => {
//     navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id });
//   };

//   const handleAddCleaner = () => {
//     navigation.navigate(ROUTES.host_invite_cleaners, { propertyId: property._id });
//   };

//   const handleAddChecklist = () => {
//     navigation.navigate(ROUTES.host_create_checklist, { propertyId: property._id });
//   };

//   const handleLinkCalendar = () => {
//     navigation.navigate(ROUTES.host_link_icalendar, { 
//       property:property,
//       hostId:currentUserId,
//     });
//   };
//   const handleAddCalendar = () => {
//     setSelectedCalendar(null);
//     setSelectedPlatform(null);
//     setModalVisible(true);
//   };

//   const handleEditCalendar = (calendar) => {
//     setSelectedCalendar(calendar);
//     setSelectedPlatform(calendar.platform);
//     setModalVisible(true);
//   };

//   const handleSaveSync = async (data) => {
//     try {
//       if (selectedCalendar) {
//         await userService.updateCalendar(data);
//       } else {
//         await userService.createSyncCalendar({
//           aptId: data.aptId,
//           calendar: data.calendar,
//           selectedChecklist: data.selectedChecklist,
//         });
//       }
//       await fetchSyncedCalendars();
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
//     } catch (error) {
//       console.error('Error saving calendar sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
//     }
//   };

//   const toggleSync = async (calendar) => {
//     try {
//       await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
//       await fetchSyncedCalendars();
//     } catch (error) {
//       console.error('Error toggling sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_sync', 'Failed to update sync status'));
//     }
//   };

//   const getPlatformName = (platformId) => {
//     const map = {
//       airbnb: tSafe('airbnb', 'Airbnb'),
//       booking: tSafe('booking_com', 'Booking.com'),
//       vrbo: tSafe('vrbo', 'Vrbo'),
//       ical: tSafe('other_calendar', 'Other Calendar'),
//     };
//     return map[platformId] || platformId;
//   };

//   const renderCleaner = ({ item }) => (
//     <View style={styles.cleanerItem}>
//       <Avatar.Image
//         size={40}
//         source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
//       />
//       <View style={styles.cleanerInfo}>
//         <Text style={styles.cleanerName}>{item.firstname} {item.lastname}</Text>
//         <Text style={styles.cleanerContact}>{item.email}</Text>
//       </View>
//       <TouchableOpacity
//         style={styles.unlinkButton}
//         onPress={() => {
//           Alert.alert(
//             tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
//             tSafe('unlink_cleaner_confirm', 'Remove {name} from this property?', { name: item.firstname }),
//             [
//               { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//               {
//                 text: tSafe('unlink', 'Unlink'),
//                 style: 'destructive',
//                 onPress: async () => {
//                   try {
//                     await userService.unlinkCleaner({ propertyId: property._id, cleanerId: item._id });
//                     await fetchLinkedCleaners();
//                   } catch (err) {
//                     Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
//                   }
//                 },
//               },
//             ]
//           );
//         }}
//       >
//         <MaterialIcons name="link-off" size={20} color={COLORS.error} />
//       </TouchableOpacity>
//     </View>
//   );

//   const renderChecklist = ({ item }) => (
//     <TouchableOpacity
//       style={styles.checklistItem}
//       onPress={() => navigation.navigate(ROUTES.host_create_checklist, { checklist: item })}
//     >
//       <View style={styles.checklistHeader}>
//         <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//         <Text style={styles.checklistName} numberOfLines={1}>
//           {item.checklistName || tSafe('cleaning_checklist', 'Cleaning Checklist')}
//         </Text>
//       </View>
//       <View style={styles.checklistMeta}>
//         <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
//         <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
//       </View>
//       <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
//     </TouchableOpacity>
//   );

//   const renderCalendar = ({ item }) => {
//     const platformName = getPlatformName(item.platform);
//     return (
//       <View style={styles.calendarItem}>
//         <View style={styles.calendarInfo}>
//           <Text style={styles.calendarName}>{platformName}</Text>
//           <Text style={styles.calendarUrl} numberOfLines={1}>
//             {item.ical_url || item.calendar_url || tSafe('no_url_provided', 'No URL provided')}
//           </Text>
//           {item.last_synced && (
//             <Text style={styles.calendarDate}>
//               {tSafe('last_synced', 'Last synced:')} {new Date(item.last_synced).toLocaleDateString()}
//             </Text>
//           )}
//         </View>
//         <Switch
//           value={item.enabled !== false}
//           onValueChange={() => toggleSync(item)}
//           trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
//           thumbColor={COLORS.white}
//         />
//         <TouchableOpacity onPress={() => handleEditCalendar(item)} style={styles.editCalendarButton}>
//           <MaterialIcons name="edit" size={20} color={COLORS.gray} />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//     >
//       {/* Property Card */}
//       <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>{tSafe('property_details', 'Property Details')}</Text>
//           <TouchableOpacity onPress={handleEditProperty} style={styles.cardButton}>
//             <MaterialIcons name="edit" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         <View style={styles.propertyContent}>
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//           <View style={styles.addressRow}>
//             <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
//             <Text style={styles.propertyAddress}>{property.address}</Text>
//           </View>
//           <View style={styles.roomStats}>
//             <CircleIcon
//               iconName="bed-empty"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bedroomCount}
//               roomSize={bedroomSize}
//               type={tSafe('bedrooms', 'Bedrooms')}
//             />
//             <CircleIcon
//               iconName="shower-head"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bathroomCount}
//               roomSize={bathroomSize}
//               type={tSafe('bathrooms', 'Bathrooms')}
//             />
//             <CircleIcon
//               iconName="silverware-fork-knife"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={kitchen}
//               roomSize={kitchenSize}
//               type={tSafe('kitchen', 'Kitchen')}
//             />
//             <CircleIcon
//               iconName="seat-legroom-extra"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={livingroomCount}
//               roomSize={livingroomSize}
//               type={tSafe('livingroom', 'Livingroom')}
//             />
//           </View>
//         </View>
//       </Animatable.View>

//       {/* Linked Cleaners Card */}
//       <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>{tSafe('linked_cleaners', 'Linked Cleaners')}</Text>
//           <TouchableOpacity onPress={handleAddCleaner} style={styles.cardButton}>
//             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         {loadingCleaners ? (
//           <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//         ) : linkedCleaners.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="account-plus-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.emptyText}>{tSafe('no_cleaners_linked', 'No cleaners linked yet')}</Text>
//             <TouchableOpacity onPress={handleAddCleaner}>
//               <Text style={styles.emptyAction}>{tSafe('invite_cleaners', 'Invite cleaners')}</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={linkedCleaners}
//             keyExtractor={(item) => item._id}
//             renderItem={renderCleaner}
//             scrollEnabled={false}
//           />
//         )}
//       </Animatable.View>

//       {/* Checklists Card */}
//       <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
//           <TouchableOpacity onPress={handleAddChecklist} style={styles.cardButton}>
//             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         {loadingChecklists ? (
//           <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//         ) : checklists.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="clipboard-list-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.emptyText}>{tSafe('no_checklists', 'No checklists yet')}</Text>
//             <TouchableOpacity onPress={handleAddChecklist}>
//               <Text style={styles.emptyAction}>{tSafe('create_checklist', 'Create checklist')}</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={checklists}
//             keyExtractor={(item) => item._id}
//             renderItem={renderChecklist}
//             scrollEnabled={false}
//           />
//         )}
//       </Animatable.View>

//       {/* Calendar Connections Card */}
//       <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>{tSafe('calendar_connections', 'Calendar Connections')}</Text>
//           <TouchableOpacity onPress={handleLinkCalendar} style={styles.cardButton}>
//             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//         <Divider style={styles.divider} />
//         {syncedCalendars.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="calendar-sync-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.emptyText}>{tSafe('no_calendars_connected', 'No calendars connected')}</Text>
//             <TouchableOpacity onPress={handleLinkCalendar}>
//               <Text style={styles.emptyAction}>{tSafe('connect_calendar', 'Connect a calendar')}</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={syncedCalendars}
//             keyExtractor={(item) => item._id}
//             renderItem={renderCalendar}
//             scrollEnabled={false}
//           />
//         )}
//       </Animatable.View>

//       <AddICalModal
//         visible={modalVisible}
//         onClose={() => {
//           setModalVisible(false);
//           setSelectedCalendar(null);
//           setSelectedPlatform(null);
//         }}
//         onSave={handleSaveSync}
//         cleaners={[]}
//         aptId={property._id}
//         preselectedPlatform={selectedPlatform}
//         existingCalendar={selectedCalendar}
//         checklists={checklists}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   cardButton: {
//     padding: 4,
//   },
//   divider: {
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   propertyContent: {
//     marginTop: 4,
//   },
//   propertyName: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   propertyAddress: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cleanerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   cleanerName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   cleanerContact: {
//     fontSize: 12,
//     color: '#6C6C80',
//   },
//   unlinkButton: {
//     padding: 8,
//   },
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     padding: 8,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//   },
//   checklistHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//     flex: 1,
//   },
//   checklistMeta: {
//     flexDirection: 'row',
//     marginRight: 8,
//   },
//   checklistMetaText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginLeft: 12,
//   },
//   checklistArrow: {
//     marginLeft: 8,
//   },
//   calendarItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   calendarInfo: {
//     flex: 1,
//   },
//   calendarName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   calendarUrl: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 2,
//     marginRight:10
//   },
//   calendarDate: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   editCalendarButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   loader: {
//     marginVertical: 20,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 32,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#6C6C80',
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   emptyAction: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
// });








// import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Alert,
//   FlatList,
//   ActivityIndicator,
//   Switch,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { IconButton, Avatar, Divider } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import CleanerManagementModal from '../../components/cleaner/CleanerManagementModal';

// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { tSafe } from '../../utils/tSafe';

// export default function PropertyDashboard({ route }) {
//   const { property } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();

//   const [refreshing, setRefreshing] = useState(false);
//   const [linkedCleaners, setLinkedCleaners] = useState([]);
//   const [checklists, setChecklists] = useState([]);
//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [loadingCleaners, setLoadingCleaners] = useState(false);
//   const [loadingChecklists, setLoadingChecklists] = useState(false);

//   // State for cleaner management modal
//   const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//   const [platformCleaners, setPlatformCleaners] = useState([]);
//   const [preferredCleaners, setPreferredCleaners] = useState([]);
//   const [invitedCleaners, setInvitedCleaners] = useState([]);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

//   // State for pending invites (from cleaner_invites_collection)
// const [pendingInvites, setPendingInvites] = useState([]);

// // Fetch pending invites for this property
// const fetchPendingInvites = async () => {
//   try {
//     const response = await userService.getPropertyInvites(property._id);
//     if (response.status === 'success') {
//       // Filter only pending invites
//       const pending = response.data.invites.filter(invite => invite.status === 'pending');
//       setPendingInvites(pending);
//     }
//   } catch (error) {
//     console.error('Error fetching pending invites:', error);
//   }
// };

// // Fetch accepted cleaners (linked cleaners)
// const fetchAcceptedCleaners = async () => {
//   try {
//     const response = await userService.getPropertyInvites(property._id);
//     if (response.status === 'success') {
//       // Filter accepted invites
//       const accepted = response.data.invites.filter(invite => invite.status === 'accepted');
      
//       // Fetch user details for accepted cleaners
//       const acceptedCleaners = [];
//       for (const invite of accepted) {
//         if (invite.type === 'platform' && invite.cleaner_id) {
//           try {
//             const user = await userService.getUser(invite.cleaner_id);
//             if (user.data) {
//               acceptedCleaners.push({
//                 ...user.data,
//                 inviteStatus: 'accepted',
//                 acceptedAt: invite.responded_at
//               });
//             }
//           } catch (err) {
//             console.error('Error fetching cleaner details:', err);
//           }
//         } else if (invite.type === 'email' && invite.email) {
//           // For email invites, we might not have user details until they sign up
//           acceptedCleaners.push({
//             id: invite._id,
//             email: invite.email,
//             firstname: invite.email.split('@')[0],
//             lastname: '',
//             avatar: null,
//             inviteStatus: 'accepted',
//             type: 'invited'
//           });
//         }
//       }
//       setLinkedCleaners(acceptedCleaners);
//     }
//   } catch (error) {
//     console.error('Error fetching accepted cleaners:', error);
//   }
// };

// // Combine both functions
// const fetchAllCleanerData = async () => {
//   await Promise.all([
//     fetchPendingInvites(),
//     fetchAcceptedCleaners()
//   ]);
// };

//   // Fetch linked cleaners
//   const fetchLinkedCleaners = async () => {
//     if (!property.preferredCleaners?.length) {
//       setLinkedCleaners([]);
//       return;
//     }
//     setLoadingCleaners(true);
//     try {
//       const cleanerIds = property.preferredCleaners.map(pc => pc.id);
//       const users = await Promise.all(
//         cleanerIds.map(id => userService.getUser(id).catch(() => null))
//       );
//       const validCleaners = users
//         .map(res => res?.data)
//         .filter(c => c && c._id);
//       setLinkedCleaners(validCleaners);
//     } catch (error) {
//       console.error('Error fetching linked cleaners:', error);
//     } finally {
//       setLoadingCleaners(false);
//     }
//   };

  

//   // Fetch checklists
//   const fetchChecklists = async () => {
//     if (!property.checklists?.length) {
//       setChecklists([]);
//       return;
//     }
//     setLoadingChecklists(true);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(property.checklists);
//       setChecklists(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//     } finally {
//       setLoadingChecklists(false);
//     }
//   };

//   // Fetch synced calendars
//   const fetchSyncedCalendars = async () => {
//     try {
//       const response = await userService.getSyncedCalsByApartmentIds(property._id);
//       if (!response.data || response.data.length === 0) {
//         setSyncedCalendars([]);
//         return;
//       }
//       const calId = response.data[0]._id;
//       const calendars = response.data[0].calendars
//         ? response.data[0].calendars.map(calendar => ({
//             ...calendar,
//             propertyId: property._id,
//             calId,
//           }))
//         : [];
//       setSyncedCalendars(calendars);
//     } catch (error) {
//       console.error('Error fetching synced calendars:', error);
//       setSyncedCalendars([]);
//     }
//   };

//   // Fetch platform cleaners near the property
//   const fetchPlatformCleanersNearby = async () => {
//     if (!property.latitude || !property.longitude) return;
//     try {
//       const response = await userService.getPlatformCleaners({
//         latitude: property.latitude,
//         longitude: property.longitude,
//         radius: 100,
//       });
//       setPlatformCleaners(response.data || []);
//     } catch (error) {
//       console.error('Error fetching platform cleaners:', error);
//     }
//   };

//   // Initialize local cleaner state from property
//   const initCleanerState = () => {
//     setPreferredCleaners(property.preferredCleaners || []);
//     setInvitedCleaners(property.invitedCleaners || []);
//   };

//   // Save changes to property cleaners
//   const saveCleanersToProperty = async () => {
//     try {
//       await userService.updatePropertyCleaners(property._id, {
//         preferredCleaners,
//         invitedCleaners,
//       });
//       const updatedProperty = await userService.getApartment(property._id);
//       await fetchLinkedCleaners();
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaners_updated', 'Cleaners updated successfully'));
//     } catch (error) {
//       console.error('Error updating property cleaners:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_cleaners', 'Failed to update cleaners'));
//     }
//   };

//   const fetchAll = async () => {
//     await Promise.all([
//       fetchLinkedCleaners(),
//       fetchChecklists(),
//       fetchSyncedCalendars(),
//       fetchPlatformCleanersNearby(),
//     ]);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchAll();
//     initCleanerState();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchAll();
//     initCleanerState();
//   }, []);

//   // useFocusEffect(
//   //   useCallback(() => {
//   //     fetchAll();
//   //     initCleanerState();
//   //   }, [property._id])
//   // );

//   useFocusEffect(
//     useCallback(() => {
//       // Check if we should refresh (coming back from invite screen)
//       if (route.params?.refresh || route.params?.propertyId) {
//         fetchAll();
//         initCleanerState();
//         // Clear the params to avoid refreshing again
//         navigation.setParams({ refresh: undefined, propertyId: undefined, timestamp: undefined });
//       } else {
//         fetchAll();
//         initCleanerState();
//       }
//     }, [property._id, route.params?.refresh, route.params?.timestamp])
//   );

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => null,
//     });
//   }, [navigation]);

//   // Handlers
//   const handleEditProperty = () => {
//     navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id });
//   };

//   const handleAddCleaner = () => {
//     navigation.navigate(ROUTES.host_invite_cleaners, { 
//       property,
//       hostId: currentUserId,
//     });
//   };

//   const handleAddChecklist = () => {
//     navigation.navigate(ROUTES.host_create_checklist, { propertyId: property._id });
//   };

//   const handleLinkCalendar = () => {
//     navigation.navigate(ROUTES.host_link_icalendar, { 
//       property,
//       hostId: currentUserId,
//     });
//   };

//   const handleAddCalendar = () => {
//     setSelectedCalendar(null);
//     setSelectedPlatform(null);
//     setModalVisible(true);
//   };

//   const handleEditCalendar = (calendar) => {
//     setSelectedCalendar(calendar);
//     setSelectedPlatform(calendar.platform);
//     setModalVisible(true);
//   };

//   const handleSaveSync = async (data) => {
//     try {
//       if (selectedCalendar) {
//         await userService.updateCalendar(data);
//       } else {
//         await userService.createSyncCalendar({
//           aptId: data.aptId,
//           calendar: data.calendar,
//           selectedChecklist: data.selectedChecklist,
//         });
//       }
//       await fetchSyncedCalendars();
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
//     } catch (error) {
//       console.error('Error saving calendar sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
//     }
//   };

//   const toggleSync = async (calendar) => {
//     try {
//       await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
//       await fetchSyncedCalendars();
//     } catch (error) {
//       console.error('Error toggling sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_sync', 'Failed to update sync status'));
//     }
//   };

//   const getPlatformName = (platformId) => {
//     const map = {
//       airbnb: tSafe('airbnb', 'Airbnb'),
//       booking: tSafe('booking_com', 'Booking.com'),
//       vrbo: tSafe('vrbo', 'Vrbo'),
//       ical: tSafe('other_calendar', 'Other Calendar'),
//     };
//     return map[platformId] || platformId;
//   };

//   // Renderers
//   const renderCleaner = ({ item }) => (
//     <View style={styles.cleanerItem}>
//       <Avatar.Image
//         size={40}
//         source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
//       />
//       <View style={styles.cleanerInfo}>
//         <Text style={styles.cleanerName}>{item.firstname} {item.lastname}</Text>
//         <Text style={styles.cleanerContact}>{item.email}</Text>
//       </View>
//       <TouchableOpacity
//         style={styles.unlinkButton}
//         onPress={() => {
//           Alert.alert(
//             tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
//             tSafe('unlink_cleaner_confirm', 'Remove {name} from this property?', { name: item.firstname }),
//             [
//               { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//               {
//                 text: tSafe('unlink', 'Unlink'),
//                 style: 'destructive',
//                 onPress: async () => {
//                   try {
//                     await userService.unlinkCleaner({ propertyId: property._id, cleanerId: item._id });
//                     await fetchLinkedCleaners();
//                     setPreferredCleaners(prev => prev.filter(pc => pc.id !== item._id));
//                   } catch (err) {
//                     Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
//                   }
//                 },
//               },
//             ]
//           );
//         }}
//       >
//         <MaterialIcons name="link-off" size={20} color={COLORS.error} />
//       </TouchableOpacity>
//     </View>
//   );

//   const renderChecklist = ({ item }) => (
//     <TouchableOpacity
//       style={styles.checklistItem}
//       onPress={() => navigation.navigate(ROUTES.host_create_checklist, { checklist: item })}
//     >
//       <View style={styles.checklistHeader}>
//         <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//         <Text style={styles.checklistName} numberOfLines={1}>
//           {item.checklistName || tSafe('cleaning_checklist', 'Cleaning Checklist')}
//         </Text>
//       </View>
//       <View style={styles.checklistMeta}>
//         <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
//         <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
//       </View>
//       <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
//     </TouchableOpacity>
//   );

//   const renderCalendar = ({ item }) => {
//     const platformName = getPlatformName(item.platform);
//     return (
//       <View style={styles.calendarItem}>
//         <View style={styles.calendarInfo}>
//           <Text style={styles.calendarName}>{platformName}</Text>
//           <Text style={styles.calendarUrl} numberOfLines={1}>
//             {item.ical_url || item.calendar_url || tSafe('no_url_provided', 'No URL provided')}
//           </Text>
//           {item.last_synced && (
//             <Text style={styles.calendarDate}>
//               {tSafe('last_synced', 'Last synced:')} {new Date(item.last_synced).toLocaleDateString()}
//             </Text>
//           )}
//         </View>
//         <Switch
//           value={item.enabled !== false}
//           onValueChange={() => toggleSync(item)}
//           trackColor={{ false: COLORS.light_gray_1, true: COLORS.primary }}
//           thumbColor={COLORS.white}
//         />
//         <TouchableOpacity onPress={() => handleEditCalendar(item)} style={styles.editCalendarButton}>
//           <MaterialIcons name="edit" size={20} color={COLORS.gray} />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.contentContainer}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         {/* Property Card */}
//         <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('property_details', 'Property Details')}</Text>
//             <TouchableOpacity onPress={handleEditProperty} style={styles.cardButton}>
//               <MaterialIcons name="edit" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           <View style={styles.propertyContent}>
//             <Text style={styles.propertyName}>{property.apt_name}</Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
//               <Text style={styles.propertyAddress}>{property.address}</Text>
//             </View>
//             <View style={styles.roomStats}>
//               <CircleIcon
//                 iconName="bed-empty"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={bedroomCount}
//                 roomSize={bedroomSize}
//                 type={tSafe('bedrooms', 'Bedrooms')}
//               />
//               <CircleIcon
//                 iconName="shower-head"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={bathroomCount}
//                 roomSize={bathroomSize}
//                 type={tSafe('bathrooms', 'Bathrooms')}
//               />
//               <CircleIcon
//                 iconName="silverware-fork-knife"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={kitchen}
//                 roomSize={kitchenSize}
//                 type={tSafe('kitchen', 'Kitchen')}
//               />
//               <CircleIcon
//                 iconName="seat-legroom-extra"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={livingroomCount}
//                 roomSize={livingroomSize}
//                 type={tSafe('livingroom', 'Livingroom')}
//               />
//             </View>
//           </View>
//         </Animatable.View>

//         {/* Pending Invites Section */}
//         {pendingInvites.length > 0 && (
//           <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.warning} />
//               <Text style={styles.cardTitle}>{tSafe('pending_invites', 'Pending Invites')}</Text>
//               <Text style={styles.pendingCount}>{pendingInvites.length}</Text>
//             </View>
//             <Divider style={styles.divider} />
//             {pendingInvites.map((invite, index) => (
//               <View key={invite._id} style={styles.pendingInviteItem}>
//                 <View style={styles.pendingInviteAvatar}>
//                   <Avatar.Icon 
//                     size={40} 
//                     icon="email-outline" 
//                     style={{ backgroundColor: COLORS.warning + '20' }}
//                     color={COLORS.warning}
//                   />
//                 </View>
//                 <View style={styles.pendingInviteInfo}>
//                   <Text style={styles.pendingInviteName}>
//                     {invite.email || invite.phone || 'Invited Cleaner'}
//                   </Text>
//                   <Text style={styles.pendingInviteDetail}>
//                     {tSafe('invited_via', 'Invited via')} {invite.type === 'email' ? 'Email' : 'Phone'}
//                   </Text>
//                   <Chip 
//                     icon="clock-outline" 
//                     style={styles.pendingStatusChip}
//                     textStyle={styles.pendingStatusText}
//                   >
//                     {tSafe('pending', 'Pending')}
//                   </Chip>
//                 </View>
//                 <Text style={styles.pendingInviteDate}>
//                   {moment(invite.created_at).fromNow()}
//                 </Text>
//               </View>
//             ))}
//           </Animatable.View>
//         )}

//         {/* Linked Cleaners Card - Segmented Banner */}
//         <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('linked_cleaners', 'Linked Cleaners')}</Text>
//             <TouchableOpacity onPress={handleAddCleaner} style={styles.cardButton}>
//               <MaterialIcons name="add" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           {loadingCleaners ? (
//             <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//           ) : linkedCleaners.length === 0 ? (
//             <TouchableOpacity onPress={handleAddCleaner} activeOpacity={0.95}>
//               <View style={styles.segmentedBanner}>
//                 <View style={styles.segmentedColors}>
//                   <View style={[styles.colorSegment, { backgroundColor: '#FF6B6B' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#4ECDC4' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#45B7D1' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#96CEB4' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#FFEAA7' }]} />
//                 </View>
//                 <View style={styles.segmentedContent}>
//                   <MaterialCommunityIcons name="account-plus" size={50} color="#FF6B6B" />
//                   <Text style={styles.segmentedTitle}>
//                     {tSafe('invite_your_trusted_cleaners', 'Invite Your Trusted Cleaners')}
//                   </Text>
//                   <Text style={styles.segmentedText}>
//                     {tSafe('keep_working_with_cleaners', 'Keep working with cleaners you already know and trust')}
//                   </Text>
//                   <View style={styles.segmentedButton}>
//                     <Text style={styles.segmentedButtonText}>{tSafe('send_invites', 'Send Invites')}</Text>
//                   </View>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <FlatList
//               data={linkedCleaners}
//               keyExtractor={(item) => item._id}
//               renderItem={renderCleaner}
//               scrollEnabled={false}
//             />
//           )}
//         </Animatable.View>

//         {/* Checklists Card - Gradient Banner */}
//         <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
//             <TouchableOpacity onPress={handleAddChecklist} style={styles.cardButton}>
//               <MaterialIcons name="add" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           {loadingChecklists ? (
//             <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//           ) : checklists.length === 0 ? (
//             <TouchableOpacity onPress={handleAddChecklist} activeOpacity={0.95}>
//               <LinearGradient
//                 colors={['#8E2DE2', '#4A00E0']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.gradientBanner}
//               >
//                 <View style={styles.gradientBannerContent}>
//                   <View style={styles.gradientIconContainer}>
//                     <MaterialCommunityIcons name="clipboard-check-multiple" size={32} color="white" />
//                   </View>
//                   <Text style={styles.gradientTitle}>
//                     {tSafe('no_checklists_yet', 'No Checklists Yet')}
//                   </Text>
//                   <Text style={styles.gradientText}>
//                     {tSafe('checklist_encouragement', 'Create your first cleaning checklist to ensure nothing gets missed. Customize tasks for each room type.')}
//                   </Text>
//                   <View style={styles.gradientButton}>
//                     <Text style={styles.gradientButtonText}>{tSafe('create_checklist', 'Create Checklist')}</Text>
//                     <MaterialIcons name="arrow-forward" size={18} color="white" />
//                   </View>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           ) : (
//             <FlatList
//               data={checklists}
//               keyExtractor={(item) => item._id}
//               renderItem={renderChecklist}
//               scrollEnabled={false}
//             />
//           )}
//         </Animatable.View>

//         {/* Calendar Connections Card - Soft Blue Banner */}
//         <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('calendar_connections', 'Calendar Connections')}</Text>
//             <TouchableOpacity onPress={handleLinkCalendar} style={styles.cardButton}>
//               <MaterialIcons name="add" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           {syncedCalendars.length === 0 ? (
//             <TouchableOpacity onPress={handleLinkCalendar} activeOpacity={0.95}>
//               <View style={styles.softBlueBanner}>
//                 <MaterialIcons name="calendar-today" size={44} color="#3182CE" />
//                 <Text style={styles.softBlueTitle}>
//                   {tSafe('sync_booking_calendars', 'Sync Your Booking Calendars')}
//                 </Text>
//                 <Text style={styles.softBlueText}>
//                   {tSafe('calendar_sync_description', 'Connect Airbnb, Booking.com, Vrbo, iCal, or Google Calendar to automatically sync bookings and notify cleaners of new reservations')}
//                 </Text>
                
//                 {/* Platform Icons Row */}
//                 <View style={styles.platformIcons}>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="home" size={20} color="#FF5A5F" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="web" size={20} color="#003580" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="home-variant" size={20} color="#1E6F5C" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="calendar" size={20} color="#4285F4" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="google" size={20} color="#34A853" />
//                   </View>
//                 </View>

//                 <View style={styles.softBlueButton}>
//                   <Text style={styles.softBlueButtonText}>{tSafe('connect_calendar', 'Connect Calendar')}</Text>
//                   <MaterialIcons name="arrow-forward" size={18} color="#3182CE" />
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <FlatList
//               data={syncedCalendars}
//               keyExtractor={(item) => item._id}
//               renderItem={renderCalendar}
//               scrollEnabled={false}
//             />
//           )}
//         </Animatable.View>

//         <AddICalModal
//           visible={modalVisible}
//           onClose={() => {
//             setModalVisible(false);
//             setSelectedCalendar(null);
//             setSelectedPlatform(null);
//           }}
//           onSave={handleSaveSync}
//           cleaners={[]}
//           aptId={property._id}
//           preselectedPlatform={selectedPlatform}
//           existingCalendar={selectedCalendar}
//           checklists={checklists}
//         />
//       </ScrollView>

//       <CleanerManagementModal
//         visible={cleanerModalVisible}
//         onClose={() => {
//           setCleanerModalVisible(false);
//           saveCleanersToProperty();
//         }}
//         platformCleaners={platformCleaners}
//         preferredCleaners={preferredCleaners}
//         setPreferredCleaners={setPreferredCleaners}
//         invitedCleaners={invitedCleaners}
//         setInvitedCleaners={setInvitedCleaners}
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   cardButton: {
//     padding: 4,
//   },
//   divider: {
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   propertyContent: {
//     marginTop: 4,
//   },
//   propertyName: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   propertyAddress: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cleanerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   cleanerName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   cleanerContact: {
//     fontSize: 12,
//     color: '#6C6C80',
//   },
//   unlinkButton: {
//     padding: 8,
//   },
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     padding: 8,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//   },
//   checklistHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//     flex: 1,
//   },
//   checklistMeta: {
//     flexDirection: 'row',
//     marginRight: 8,
//   },
//   checklistMetaText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginLeft: 12,
//   },
//   checklistArrow: {
//     marginLeft: 8,
//   },
//   calendarItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   calendarInfo: {
//     flex: 1,
//   },
//   calendarName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   calendarUrl: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 2,
//     marginRight: 10,
//   },
//   calendarDate: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   editCalendarButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   loader: {
//     marginVertical: 20,
//   },

//   // Segmented Banner Styles
//   segmentedBanner: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     marginVertical: 8,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   segmentedColors: {
//     flexDirection: 'row',
//     height: 8,
//   },
//   colorSegment: {
//     flex: 1,
//   },
//   segmentedContent: {
//     padding: 24,
//     alignItems: 'center',
//   },
//   segmentedTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginTop: 12,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   segmentedText: {
//     fontSize: 14,
//     color: '#6C6C80',
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   segmentedButton: {
//     backgroundColor: '#4ECDC4',
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 25,
//   },
//   segmentedButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//   },

//   // Gradient Banner Styles
//   gradientBanner: {
//     borderRadius: 20,
//     marginVertical: 8,
//     overflow: 'hidden',
//   },
//   gradientBannerContent: {
//     padding: 24,
//     alignItems: 'center',
//   },
//   gradientIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   gradientTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: 'white',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   gradientText: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.9)',
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   gradientButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     gap: 8,
//   },
//   gradientButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//   },

//   // Soft Blue Banner Styles
//   softBlueBanner: {
//     backgroundColor: '#EBF8FF',
//     borderRadius: 20,
//     marginVertical: 8,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#BEE3F8',
//   },
//   softBlueTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#2B6CB0',
//     marginTop: 12,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   softBlueText: {
//     fontSize: 14,
//     color: '#4A5568',
//     textAlign: 'center',
//     marginBottom: 16,
//     lineHeight: 20,
//     paddingHorizontal: 8,
//   },
//   softBlueButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   softBlueButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#3182CE',
//     marginRight: 4,
//   },
  
//   // Platform Icons Row
//   platformIcons: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 20,
//     flexWrap: 'wrap',
//   },
//   platformIconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
// });


import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton, Avatar, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import CircleIcon from '../../components/shared/CircleIcon';
import AddICalModal from '../../components/host/AddICalModal';
import CleanerManagementModal from '../../components/cleaner/CleanerManagementModal';

import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { tSafe } from '../../utils/tSafe';
const FreshSweeperLogo = require('../../assets/notification_icon.png');

export default function PropertyDashboard({ route }) {
  const { property } = route.params;
  const { currentUserId } = useContext(AuthContext);
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [linkedCleaners, setLinkedCleaners] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [syncedCalendars, setSyncedCalendars] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [loadingCleaners, setLoadingCleaners] = useState(false);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // State for cleaner management modal
  const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
  const [platformCleaners, setPlatformCleaners] = useState([]);
  const [preferredCleaners, setPreferredCleaners] = useState([]);
  const [invitedCleaners, setInvitedCleaners] = useState([]);

  // State for pending invites (from cleaner_invites_collection)
  const [pendingInvites, setPendingInvites] = useState([]);

  // Room details
  const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
  const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
  const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
  const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
  const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
  const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
  const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
  const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

  // Fetch pending invites for this property (from invites collection)
  const fetchPendingInvites = async () => {
    setLoadingInvites(true);
    try {
      const response = await userService.getPropertyInvites(property._id);
      console.log('Pending invites response:', response);
      
      if (response.data?.data?.invites) {
        const invites = response.data.data.invites;
        const pending = invites.filter(invite => invite.status === 'pending');
        setPendingInvites(pending);
        console.log('Pending invites count:', pending.length);
      } else {
        setPendingInvites([]);
      }
    } catch (error) {
      console.error('Error fetching pending invites:', error);
      setPendingInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  // Fetch linked cleaners from property.preferredCleaners (existing method)
  const fetchLinkedCleaners = async () => {
    if (!property.preferredCleaners?.length) {
      setLinkedCleaners([]);
      return;
    }
    setLoadingCleaners(true);
    try {
      const cleanerIds = property.preferredCleaners.map(pc => pc.id);
      const users = await Promise.all(
        cleanerIds.map(id => userService.getUser(id).catch(() => null))
      );
      const validCleaners = users
        .map(res => res?.data)
        .filter(c => c && c._id);
      setLinkedCleaners(validCleaners);
    } catch (error) {
      console.error('Error fetching linked cleaners:', error);
    } finally {
      setLoadingCleaners(false);
    }
  };

  // Fetch checklists
  const fetchChecklists = async () => {
    if (!property.checklists?.length) {
      setChecklists([]);
      return;
    }
    setLoadingChecklists(true);
    try {
      const response = await userService.getCustomChecklistsByProperty(property.checklists);
      setChecklists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoadingChecklists(false);
    }
  };

  // Fetch synced calendars
  const fetchSyncedCalendars = async () => {
    try {
      const response = await userService.getSyncedCalsByApartmentIds(property._id);
      if (!response.data || response.data.length === 0) {
        setSyncedCalendars([]);
        return;
      }
      const calId = response.data[0]._id;
      const calendars = response.data[0].calendars
        ? response.data[0].calendars.map(calendar => ({
            ...calendar,
            propertyId: property._id,
            calId,
          }))
        : [];
      setSyncedCalendars(calendars);
    } catch (error) {
      console.error('Error fetching synced calendars:', error);
      setSyncedCalendars([]);
    }
  };

  // Fetch platform cleaners near the property
  const fetchPlatformCleanersNearby = async () => {
    if (!property.latitude || !property.longitude) return;
    try {
      const response = await userService.getPlatformCleaners({
        latitude: property.latitude,
        longitude: property.longitude,
        radius: 100,
      });
      setPlatformCleaners(response.data || []);
    } catch (error) {
      console.error('Error fetching platform cleaners:', error);
    }
  };

  // Initialize local cleaner state from property
  const initCleanerState = () => {
    setPreferredCleaners(property.preferredCleaners || []);
    setInvitedCleaners(property.invitedCleaners || []);
  };

  // Save changes to property cleaners
  const saveCleanersToProperty = async () => {
    try {
      await userService.updatePropertyCleaners(property._id, {
        preferredCleaners,
        invitedCleaners,
      });
      const updatedProperty = await userService.getApartment(property._id);
      await fetchLinkedCleaners();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaners_updated', 'Cleaners updated successfully'));
    } catch (error) {
      console.error('Error updating property cleaners:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_cleaners', 'Failed to update cleaners'));
    }
  };

  const fetchAll = async () => {
    await Promise.all([
      fetchLinkedCleaners(),
      fetchPendingInvites(),
      fetchChecklists(),
      fetchSyncedCalendars(),
      fetchPlatformCleanersNearby(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    initCleanerState();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
    initCleanerState();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Always refresh when the screen comes into focus
      fetchAll();
      initCleanerState();
     
      // Clear any refresh params
      if (route.params?.refresh) {
        navigation.setParams({ refresh: undefined, propertyId: undefined, timestamp: undefined });
      }
    }, [property._id])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  // Handlers
  const handleEditProperty = () => {
    navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id });
  };

  const handleAddCleaner = () => {
    navigation.navigate(ROUTES.host_invite_cleaners, { 
      property,
      hostId: currentUserId,
    });
  };

  const handleAddChecklist = () => {
    navigation.navigate(ROUTES.host_create_checklist, { propertyId: property._id });
  };

  const handleLinkCalendar = () => {
    navigation.navigate(ROUTES.host_link_icalendar, { 
      property,
      hostId: currentUserId,
    });
  };

  const handleAddCalendar = () => {
    setSelectedCalendar(null);
    setSelectedPlatform(null);
    setModalVisible(true);
  };

  const handleEditCalendar = (calendar) => {
    setSelectedCalendar(calendar);
    setSelectedPlatform(calendar.platform);
    setModalVisible(true);
  };

  const handleSaveSync = async (data) => {
    try {
      if (selectedCalendar) {
        await userService.updateCalendar(data);
      } else {
        await userService.createSyncCalendar({
          aptId: data.aptId,
          calendar: data.calendar,
          selectedChecklist: data.selectedChecklist,
        });
      }
      await fetchSyncedCalendars();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
    } catch (error) {
      console.error('Error saving calendar sync:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
    }
  };

  const toggleSync = async (calendar) => {
    try {
      await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
      await fetchSyncedCalendars();
    } catch (error) {
      console.error('Error toggling sync:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_sync', 'Failed to update sync status'));
    }
  };

  const getPlatformName = (platformId) => {
    const map = {
      airbnb: tSafe('airbnb', 'Airbnb'),
      booking: tSafe('booking_com', 'Booking.com'),
      vrbo: tSafe('vrbo', 'Vrbo'),
      ical: tSafe('other_calendar', 'Other Calendar'),
    };
    return map[platformId] || platformId;
  };

  // Renderers
  const renderCleaner = ({ item }) => (
    <View style={styles.cleanerItem}>
      <Avatar.Image
        size={40}
        source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
      />
      <View style={styles.cleanerInfo}>
        <Text style={styles.cleanerName}>{item.firstname} {item.lastname}</Text>
        <Text style={styles.cleanerContact}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.unlinkButton}
        onPress={() => {
          Alert.alert(
            tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
            tSafe('unlink_cleaner_confirm', 'Remove {name} from this property?', { name: item.firstname }),
            [
              { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
              {
                text: tSafe('unlink', 'Unlink'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await userService.unlinkCleaner({ propertyId: property._id, cleanerId: item._id });
                    await fetchLinkedCleaners();
                    setPreferredCleaners(prev => prev.filter(pc => pc.id !== item._id));
                  } catch (err) {
                    Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
                  }
                },
              },
            ]
          );
        }}
      >
        <MaterialIcons name="link-off" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderChecklist = ({ item }) => (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={() => navigation.navigate(ROUTES.host_create_checklist, { checklist: item })}
    >
      <View style={styles.checklistHeader}>
        <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
        <Text style={styles.checklistName} numberOfLines={1}>
          {item.checklistName || tSafe('cleaning_checklist', 'Cleaning Checklist')}
        </Text>
      </View>
      <View style={styles.checklistMeta}>
        <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
        <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
    </TouchableOpacity>
  );

  const renderCalendar = ({ item }) => {
    const platformName = getPlatformName(item.platform);
    return (
      <View style={styles.calendarItem}>
        <View style={styles.calendarInfo}>
          <Text style={styles.calendarName}>{platformName}</Text>
          <Text style={styles.calendarUrl} numberOfLines={1}>
            {item.ical_url || item.calendar_url || tSafe('no_url_provided', 'No URL provided')}
          </Text>
          {item.last_synced && (
            <Text style={styles.calendarDate}>
              {tSafe('last_synced', 'Last synced:')} {new Date(item.last_synced).toLocaleDateString()}
            </Text>
          )}
        </View>
        <Switch
          value={item.enabled !== false}
          onValueChange={() => toggleSync(item)}
          trackColor={{ false: COLORS.light_gray_1, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
        <TouchableOpacity onPress={() => handleEditCalendar(item)} style={styles.editCalendarButton}>
          <MaterialIcons name="edit" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Property Card */}
        <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('property_details', 'Property Details')}</Text>
            <TouchableOpacity onPress={handleEditProperty} style={styles.cardButton}>
              <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.propertyContent}>
            <Text style={styles.propertyName}>{property.apt_name}</Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
              <Text style={styles.propertyAddress}>{property.address}</Text>
            </View>
            <View style={styles.roomStats}>
              <CircleIcon
                iconName="bed-empty"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={bedroomCount}
                roomSize={bedroomSize}
                type={tSafe('bedrooms', 'Bedrooms')}
              />
              <CircleIcon
                iconName="shower-head"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={bathroomCount}
                roomSize={bathroomSize}
                type={tSafe('bathrooms', 'Bathrooms')}
              />
              <CircleIcon
                iconName="silverware-fork-knife"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={kitchen}
                roomSize={kitchenSize}
                type={tSafe('kitchen', 'Kitchen')}
              />
              <CircleIcon
                iconName="seat-legroom-extra"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={livingroomCount}
                roomSize={livingroomSize}
                type={tSafe('livingroom', 'Livingroom')}
              />
            </View>
          </View>
        </Animatable.View>

        {/* Pending Invites Section */}
        {loadingInvites ? (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </Animatable.View>
        ) : pendingInvites.length > 0 ? (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.warning} />
              <Text style={styles.cardTitle}>{tSafe('pending_cleaner_invites', 'Pending Cleaner Invites')}</Text>
              <Text style={styles.pendingCount}>{pendingInvites.length}</Text>
            </View>
            <View style={styles.pendingSubtitleContainer}>
              <Text style={styles.pendingSubtitle}>
                {tSafe('pending_invites_subtitle_short', 'Awaiting response from invited cleaners. They will appear in "Linked Cleaners" once they accept.')}
              </Text>
            </View>
            <Divider style={styles.divider} />
            {pendingInvites.map((invite, index) => {
              // Calculate expiration
              const expiresAt = moment(invite.expires_at);
              const now = moment();
              const isExpired = now.isAfter(expiresAt);
              const daysLeft = expiresAt.diff(now, 'days');
              const hoursLeft = expiresAt.diff(now, 'hours');
              
              let expiryText = '';
              let expiryColor = COLORS.warning;
              
              if (isExpired) {
                expiryText = tSafe('expired', 'Expired');
                expiryColor = COLORS.error;
              } else if (daysLeft > 0) {
                const daysWord = daysLeft === 1 ? tSafe('day', 'day') : tSafe('days', 'days');
                expiryText = `${tSafe('expires_in', 'Expires in')} ${daysLeft} ${daysWord}`;
                expiryColor = daysLeft <= 3 ? COLORS.warning : COLORS.gray;
              } else if (hoursLeft > 0) {
                const hoursWord = hoursLeft === 1 ? tSafe('hour', 'hour') : tSafe('hours', 'hours');
                expiryText = `${tSafe('expires_in', 'Expires in')} ${hoursLeft} ${hoursWord}`;
                expiryColor = COLORS.warning;
              } else {
                expiryText = tSafe('expires_soon', 'Expires soon');
                expiryColor = COLORS.error;
              }
              
              // Determine icon based on invite type
              const isPlatformInvite = invite.type === 'platform';
              const iconName = isPlatformInvite ? "account-circle" : "email-outline";
              const iconColor = isPlatformInvite ? COLORS.primary : COLORS.warning;
              
              return (
                <View key={invite._id} style={styles.pendingInviteItem}>
                  
                  <View style={styles.pendingInviteAvatar}>
                    {isPlatformInvite ? (
                      <Avatar.Image 
                        size={24} 
                        source={FreshSweeperLogo}
                        style={{backgroundColor:COLORS.warning, marginLeft:7}}
                      />
                    ) : (
                      <Avatar.Icon 
                        size={40} 
                        icon="email-outline" 
                        style={{ backgroundColor: COLORS.warning + '20' }}
                        color={COLORS.warning}
                      />
                    )}
                  </View>
                  <View style={styles.pendingInviteInfo}>
                    <Text style={styles.pendingInviteName}>
                      {isPlatformInvite 
                        ? `${invite.firstname || ''} ${invite.lastname.charAt(0)}.` || tSafe('platform_cleaner', 'Platform Cleaner')
                        : invite.email || tSafe('invited_cleaner', 'Invited Cleaner')
                      }
                    </Text>
                    <Text style={styles.pendingInviteDetail}>
                      {tSafe('invited_via', 'Invited via')} {isPlatformInvite ? tSafe('platform', 'Platform') : tSafe('email', 'Email')}
                    </Text>
                    
                    <View style={styles.pendingStatusRow}>
                      <View style={styles.pendingStatusBadge}>
                        <MaterialCommunityIcons name="clock-outline" size={13} color="orange" />
                        <Text style={styles.pendingStatusBadgeText}>
                          {tSafe('pending', 'Pending')}
                        </Text>
                      </View>
                      <View style={[styles.expiryContainer, isExpired && styles.expiredContainer]}>
                        <MaterialCommunityIcons 
                          name={isExpired ? "alert-circle-outline" : "timer-outline"} 
                          size={12} 
                          color={expiryColor} 
                        />
                        <Text style={[styles.expiryText, { color: expiryColor }]}>
                          {expiryText}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.pendingInviteRight}>
                    <Text style={styles.pendingInviteDate}>
                      {moment(invite.created_at).fromNow()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animatable.View>
        ) : null}

        {/* Linked Cleaners Card - Segmented Banner */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('linked_cleaners', 'Linked Cleaners')}</Text>
            <TouchableOpacity onPress={handleAddCleaner} style={styles.cardButton}>
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          {loadingCleaners ? (
            <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
          ) : linkedCleaners.length === 0 ? (
            <TouchableOpacity onPress={handleAddCleaner} activeOpacity={0.95}>
              <View style={styles.segmentedBanner}>
                <View style={styles.segmentedColors}>
                  <View style={[styles.colorSegment, { backgroundColor: '#FF6B6B' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#4ECDC4' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#45B7D1' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#96CEB4' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#FFEAA7' }]} />
                </View>
                <View style={styles.segmentedContent}>
                  <MaterialCommunityIcons name="account-plus" size={50} color="#FF6B6B" />
                  <Text style={styles.segmentedTitle}>
                    {tSafe('invite_your_trusted_cleaners', 'Invite Your Trusted Cleaners')}
                  </Text>
                  <Text style={styles.segmentedText}>
                    {tSafe('keep_working_with_cleaners', 'Keep working with cleaners you already know and trust')}
                  </Text>
                  <View style={styles.segmentedButton}>
                    <Text style={styles.segmentedButtonText}>{tSafe('invite_cleaners', 'Invite Cleaners')}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <FlatList
              data={linkedCleaners}
              keyExtractor={(item) => item._id}
              renderItem={renderCleaner}
              scrollEnabled={false}
            />
          )}
        </Animatable.View>

        {/* Checklists Card - Gradient Banner */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
            <TouchableOpacity onPress={handleAddChecklist} style={styles.cardButton}>
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          {loadingChecklists ? (
            <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
          ) : checklists.length === 0 ? (
            <TouchableOpacity onPress={handleAddChecklist} activeOpacity={0.95}>
              <LinearGradient
                colors={['#8E2DE2', '#4A00E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBanner}
              >
                <View style={styles.gradientBannerContent}>
                  <View style={styles.gradientIconContainer}>
                    <MaterialCommunityIcons name="clipboard-check-multiple" size={32} color="white" />
                  </View>
                  <Text style={styles.gradientTitle}>
                    {tSafe('no_checklists_yet', 'No Checklists Yet')}
                  </Text>
                  <Text style={styles.gradientText}>
                    {tSafe('checklist_encouragement', 'Create your first cleaning checklist to ensure nothing gets missed. Customize tasks for each room type.')}
                  </Text>
                  <View style={styles.gradientButton}>
                    <Text style={styles.gradientButtonText}>{tSafe('create_checklist', 'Create Checklist')}</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <FlatList
              data={checklists}
              keyExtractor={(item) => item._id}
              renderItem={renderChecklist}
              scrollEnabled={false}
            />
          )}
        </Animatable.View>

        {/* Calendar Connections Card - Soft Blue Banner */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('calendar_connections', 'Calendar Connections')}</Text>
            <TouchableOpacity onPress={handleLinkCalendar} style={styles.cardButton}>
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          {syncedCalendars.length === 0 ? (
            <TouchableOpacity onPress={handleLinkCalendar} activeOpacity={0.95}>
              <View style={styles.softBlueBanner}>
                <MaterialIcons name="calendar-today" size={44} color="#3182CE" />
                <Text style={styles.softBlueTitle}>
                  {tSafe('sync_booking_calendars', 'Sync Your Booking Calendars')}
                </Text>
                <Text style={styles.softBlueText}>
                  {tSafe('calendar_sync_description', 'Connect Airbnb, Booking.com, Vrbo, iCal, or Google Calendar to automatically sync bookings and notify cleaners of new reservations')}
                </Text>
                
                <View style={styles.platformIcons}>
                  <View style={styles.platformIconCircle}>
                    <MaterialCommunityIcons name="home" size={20} color="#FF5A5F" />
                  </View>
                  <View style={styles.platformIconCircle}>
                    <MaterialCommunityIcons name="web" size={20} color="#003580" />
                  </View>
                  <View style={styles.platformIconCircle}>
                    <MaterialCommunityIcons name="home-variant" size={20} color="#1E6F5C" />
                  </View>
                  <View style={styles.platformIconCircle}>
                    <MaterialCommunityIcons name="calendar" size={20} color="#4285F4" />
                  </View>
                  <View style={styles.platformIconCircle}>
                    <MaterialCommunityIcons name="google" size={20} color="#34A853" />
                  </View>
                </View>

                <View style={styles.softBlueButton}>
                  <Text style={styles.softBlueButtonText}>{tSafe('connect_calendar', 'Connect Calendar')}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#3182CE" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <FlatList
              data={syncedCalendars}
              keyExtractor={(item) => item._id}
              renderItem={renderCalendar}
              scrollEnabled={false}
            />
          )}
        </Animatable.View>

        <AddICalModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedCalendar(null);
            setSelectedPlatform(null);
          }}
          onSave={handleSaveSync}
          cleaners={[]}
          aptId={property._id}
          preselectedPlatform={selectedPlatform}
          existingCalendar={selectedCalendar}
          checklists={checklists}
        />
      </ScrollView>

      <CleanerManagementModal
        visible={cleanerModalVisible}
        onClose={() => {
          setCleanerModalVisible(false);
          saveCleanersToProperty();
        }}
        platformCleaners={platformCleaners}
        preferredCleaners={preferredCleaners}
        setPreferredCleaners={setPreferredCleaners}
        invitedCleaners={invitedCleaners}
        setInvitedCleaners={setInvitedCleaners}
      />
    </>
  );
}

// Keep all existing styles from your older version
const styles = StyleSheet.create({
  // ... (keep all your existing styles from the older version)
  container: {
    backgroundColor: '#F8F9FC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E2F',
  },
  cardButton: {
    padding: 4,
  },
  divider: {
    backgroundColor: '#E6E9F0',
    marginBottom: 16,
  },
  propertyContent: {
    marginTop: 4,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#6C6C80',
    marginLeft: 6,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cleanerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cleanerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cleanerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cleanerContact: {
    fontSize: 12,
    color: '#6C6C80',
  },
  unlinkButton: {
    padding: 8,
  },
  pendingCount: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  pendingInviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  pendingInviteAvatar: {
    marginRight: 12,
  },
  pendingInviteInfo: {
    flex: 1,
  },
  pendingInviteName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 2,
  },
  pendingInviteDetail: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 4,
  },
  pendingStatusChip: {
    backgroundColor: COLORS.warning + '20',
    height: 22,
    alignSelf: 'flex-start',
  },
  pendingStatusText: {
    fontSize: 10,
    color: COLORS.warning,
  },
  pendingInviteDate: {
    fontSize: 11,
    color: '#6C6C80',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  checklistMeta: {
    flexDirection: 'row',
    marginRight: 8,
  },
  checklistMetaText: {
    fontSize: 12,
    color: '#6C6C80',
    marginLeft: 12,
  },
  checklistArrow: {
    marginLeft: 8,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  calendarUrl: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 2,
    marginRight: 10,
  },
  calendarDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  editCalendarButton: {
    padding: 8,
    marginLeft: 8,
  },
  loader: {
    marginVertical: 20,
  },
  segmentedBanner: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentedColors: {
    flexDirection: 'row',
    height: 8,
  },
  colorSegment: {
    flex: 1,
  },
  segmentedContent: {
    padding: 24,
    alignItems: 'center',
  },
  segmentedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E2F',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  segmentedText: {
    fontSize: 14,
    color: '#6C6C80',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  segmentedButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  segmentedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  gradientBanner: {
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  gradientBannerContent: {
    padding: 24,
    alignItems: 'center',
  },
  gradientIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradientTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  gradientText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  gradientButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  softBlueBanner: {
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
    marginVertical: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  softBlueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B6CB0',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  softBlueText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  softBlueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  softBlueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3182CE',
    marginRight: 4,
  },
  platformIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  platformIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pendingSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary_light_2,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary_light,
  },
  pendingSubtitleIcon: {
    marginRight: 8,
  },
  pendingSubtitle: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  pendingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expiredContainer: {
    backgroundColor: '#FFEBEE',
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  pendingInviteRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  pendingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 13,
    gap: 4,
    height: 26,
    alignSelf: 'center',
  },
  pendingStatusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: "orange",
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 13,
    gap: 4,
    height: 26,
    alignSelf: 'center',
  },
  expiredContainer: {
    backgroundColor: '#FFEBEE',
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '500',
  },
});