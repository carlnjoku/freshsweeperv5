import React, {useState, useEffect, useLayoutEffect,useCallback, useRef, useContext} from  'react';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/shared/Button';
import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
import COLORS from '../../constants/colors';
import { SafeAreaView, RefreshControl, StyleSheet, Text, Alert, KeyboardAvoidingView, Keyboard, Platform, StatusBar, Linking,  FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Switch, Card,Avatar,Badge, Divider, Title, Paragraph, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import CustomCard from '../../components/shared/CustomCard';
import CircleIcon from '../../components/shared/CircleIcon';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import AddICalModal from '../../components/host/AddICalModal';
import userService from '../../services/connection/userService';


export default function PropertyDashboard({route}) {
    const {property} = route.params;
    const navigation = useNavigation();
  
    const [refreshing, setRefreshing] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isAutomated, setIsAutomated] = useState(property?.isAutomated);
    const [automatedSchedules, setAutomatedSchedules] = useState([]);
    const [manualSchedules, setManualSchedules] = useState([]);
    const [upcoming_schedules, setUpComingSchedules] = useState([]);
    const [ongoing_schedules, setOnGoingSchedules] = useState([]);
    const [completed_schedules, setCompletedSchedules] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [icalData, setIcalData] = useState(null);
    const [cleaners, setCleaners] = useState([]);
    const [syncedCalendars, setSyncedCalendars] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [selectedCalendar, setSelectedCalendar] = useState(null);
  
    // Room details calculations
    const bedroomCount = property?.roomDetails.find(room => room.type === "Bedroom")?.number || 0;
    const bathroomCount = property?.roomDetails.find(room => room.type === "Bathroom")?.number || 0;
    const kitchen = property?.roomDetails.find(room => room.type === "Kitchen")?.number || 0;
    const livingroomCount = property?.roomDetails.find(room => room.type === "Livingroom")?.number || 0;
    const bedroomSize = property?.roomDetails.find(room => room.type === "Bedroom")?.size || 0;
    const bathroomSize = property?.roomDetails.find(room => room.type === "Bathroom")?.size || 0;
    const kitchenSize = property?.roomDetails.find(room => room.type === "Kitchen")?.size || 0;
    const livingroomSize = property?.roomDetails.find(room => room.type === "Livingroom")?.size || 0;
    const [checklists, setChecklists] = useState([]);


    // Booking platforms with dynamic connection status
    const bookingPlatforms = [
      {
        id: 'airbnb',
        name: 'Airbnb',
        color: '#FF5A5F',
        description: 'Sync your Airbnb calendar to automatically update availability',
        icon: require('../../assets/images/airbnb_logo.png'), // Make sure you have these assets
        connected: syncedCalendars.some(cal => cal.platform === 'airbnb' && cal.enabled),
      },
      {
        id: 'booking',
        name: 'Booking.com',
        color: '#003580',
        description: 'Connect your Booking.com account to manage reservations',
        icon: require('../../assets/images/booking_logo.png'),
        connected: syncedCalendars.some(cal => cal.platform === 'booking' && cal.enabled),
      },
      {
        id: 'vrbo',
        name: 'Vrbo',
        color: '#00A699',
        description: 'Link your Vrbo property to sync bookings and availability',
        icon: require('../../assets/images/vrbo_logo.png'),
        connected: syncedCalendars.some(cal => cal.platform === 'vrbo' && cal.enabled),
      },
      {
        id: 'ical',
        name: 'Other Calendar',
        color: '#6200EE',
        description: 'Sync using a generic iCal URL',
        // icon: require('../../assets/calendar-icon.png'),
        connected: syncedCalendars.some(cal => cal.platform === 'other' && cal.enabled),
      },
    ];

    console.log(JSON.stringify(bookingPlatforms, null, 2))
    
    // Create a function to check if a platform is connected
    const isPlatformConnected = (platformId) => {
      return syncedCalendars.some(calendar => 
        calendar.platform === platformId && 
        calendar.status === 'linked'
      );
    };

    // Find the specific calendar for a platform
    const getCalendarForPlatform = (platformId) => {
      console.log("My sync calendar plus", syncedCalendars)
      return syncedCalendars.find(cal => cal.platform === platformId);
    };

    // Fetch checklists for the property
    const fetchChecklists = async () => {
      try {
        console.log(property)
        const chcklist_array = property.checklists // array of checklist eg ["68a496db3f7c7bf2fbfed7c0"]
        console.log(chcklist_array)
        const response = await userService.getCustomChecklistsByProperty(chcklist_array);
        const res = response.data.data
        console.log("My restttttt", res)
        setChecklists(res);
      } catch (error) {
        console.error("Error fetching checklists:", error);
      }
    };


    useEffect(() => {
      fetchSyncedCals();
      fetchSchedules();
      fetchChecklists(); // Add this
    }, []);
  
    
  
    

//   const fetchSyncedCals = async () => {
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
//       "Calendars with propertyId & documentId:",
//       JSON.stringify(calendars, null, 2)
//     );

//     setSyncedCalendars(calendars);
//   } catch (error) {
//     console.error("Error fetching synced calendars:", error);
//     setSyncedCalendars([]);
//   }
// };

const fetchSyncedCals = async () => {
  try {
    const response = await userService.getSyncedCalsByApartmentIds(property._id);

    // Handle no data scenario
    if (!response.data || response.data.length === 0) {
      setSyncedCalendars([]);
      return;
    }

    const calId = response.data[0]._id; // The _id of the document

    // Extract calendars and add propertyId + documentId to each
    const calendars = response.data[0].calendars
      ? response.data[0].calendars.map(calendar => ({
          ...calendar,
          propertyId: property._id,
          calId // attach the document _id
        }))
      : [];

    console.log(
      "Calendars with new structure:",
      JSON.stringify(calendars, null, 2)
    );

    setSyncedCalendars(calendars);
  } catch (error) {
    console.error("Error fetching synced calendars:", error);
    setSyncedCalendars([]);
  }
};
  
    const fetchCleaners = async () => {
      try {
        const response = await userService.getAllCleaners();
        setCleaners(response.data);
      } catch (error) {
        console.error("Error fetching cleaners:", error);
        Alert.alert("Error", "Failed to load cleaners");
      }
    };
  
    const toggleSync = async (id) => {
      try {
        const updatedCalendars = syncedCalendars.map(calendar => 
          calendar._id === id ? { ...calendar, enabled: !calendar.enabled } : calendar
        );
        
        setSyncedCalendars(updatedCalendars);
        
        // Find the calendar to update
        const calendarToUpdate = syncedCalendars.find(cal => cal._id === id);
        if (calendarToUpdate) {
          await userService.updateSyncCalendar(id, {
            enabled: !calendarToUpdate.enabled
          });
        }
      } catch (error) {
        console.error("Error toggling sync:", error);
        Alert.alert("Error", "Failed to update sync status");
        // Revert on error
        fetchSyncedCals();
      }
    };
  
    const handleSaveSync = async (newSync) => {
      try {
        setSyncedCalendars(prev => {
          const existingIndex = prev.findIndex(item => item._id === newSync._id);
          if (existingIndex !== -1) {
            return prev.map((item, index) => 
              index === existingIndex ? { ...item, ...newSync } : item
            );
          } else {
            return [...prev, { ...newSync, enabled: true }];
          }
        });
        await fetchSyncedCals();
      } catch (error) {
        console.error("Error saving sync:", error);
      }
    };
  
    

    const handleSyncCalendar = async (data) => {
      try {
        if (selectedCalendar) {
          // Update existing calendar
          console.log("My selected calendar", selectedCalendar)
          await userService.updateCalendar(data);
        } else {
          // Create new calendar
          await userService.createSyncCalendar({
            aptId: data.aptId,
            calendar: data.calendar, 
            selectedChecklist: data.selectedChecklist
          });
        }
        fetchSyncedCals();
        Alert.alert("Success", "Calendar sync saved successfully");
      } catch (error) {
        console.error("Error saving calendar sync:", error);
        Alert.alert("Error", "Failed to save calendar sync");
      }
    };
  
    const fetchSchedules = async () => {
      // Implementation remains the same
    };
  
    const handleRefresh = async () => {
      setRefreshing(true);
      await Promise.all([fetchSyncedCals(), fetchSchedules()]);
      setRefreshing(false);
    };
  
    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            icon="pencil"
            size={20}
            color={COLORS.primary}
            onPress={() => navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id })}
          />
        ),
      });
    }, [navigation, property]);
  
    useFocusEffect(
      useCallback(() => {
        handleRefresh();
      }, [property._id])
    );
  
    const handlePlatformPress = (platformId) => {
      setSelectedPlatform(platformId);
      setModalVisible(true);
    };
  
    
  
    return (
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Property Header Card */}
        <CustomCard>
          <View> 
            <View style={styles.centerContent}>
              <AntDesign name="home" size={60} color={COLORS.gray}/> 
              <Text style={styles.headerText}>{property?.apt_name}</Text>
              <Text style={{color:COLORS.gray, marginBottom:5, marginLeft:-5}}> 
                <MaterialCommunityIcons name="map-marker" size={16} />{property.address}
              </Text>
            </View> 
  
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:0, marginBottom:10}}>
              <CircleIcon 
                iconName="bed-empty"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title= {bedroomCount}
                roomSize= {bedroomSize}
                type="Bedrooms"
              /> 
              <CircleIcon 
                iconName="shower-head"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title= {bathroomCount}
                roomSize= {bathroomSize}
                type="Bathrooms"
            /> 
        
            <CircleIcon 
                iconName="silverware-fork-knife"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title= {kitchen}
                roomSize= {kitchenSize}
                type="Kitchen"
            /> 
            <CircleIcon 
                iconName="seat-legroom-extra"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title= {livingroomCount}
                roomSize= {livingroomSize}
                type="Livingroom"
            /> 
            </View> 
          </View>
        </CustomCard>
  
        

      
  
        {/* Calendar Platforms Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Calendars</Text>
          <Text style={styles.subtitle}>
            Sync with booking platforms to automatically update your availability
          </Text>
        </View>


        <View style={styles.platformsContainer}>
        {bookingPlatforms.map((platform) => {
          const isConnected = isPlatformConnected(platform.id);
          const calendar = getCalendarForPlatform(platform.id);
             
          
          return (
            <TouchableOpacity
              key={platform.id}
              style={[styles.platformCard, { borderLeftColor: platform.color }]}
              onPress={() => {
                if (isConnected && calendar) {
                  setSelectedCalendar(calendar);
                  setModalVisible(true);
                } else {
                  setSelectedPlatform(platform.id);
                  setModalVisible(true);
                }
              }}
            >
              <View style={styles.platformHeader}>
                <Image source={platform.icon} style={styles.platformIcon} />
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Text style={styles.platformDescription}>{platform.description}</Text>
                </View>
                
                




    <View style={styles.statusContainer}>
      {isConnected ? (
        <>
          <View style={styles.connectedBadge}>
            <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.connectedText}>Linked</Text>
          </View>
          
      {/* Status Badge - Fixed to use enabled field */}
      {/* {calendar && (
          <View style={[
            styles.statusBadgeBase,
            calendar.enabled ? styles.enabledStatus : styles.disabledStatus
          ]}>
            {calendar.enabled ? (
              <MaterialIcons name="sync" size={14} color={COLORS.gray} />
            ) : (
              <MaterialIcons name="sync-disabled" size={14} color={COLORS.gray} />
            )}
            <Text style={[
              styles.statusText,
              calendar.enabled ? styles.enabledText : styles.disabledText
            ]}>
              {calendar.enabled ? 'Active' : 'Paused'}
            </Text>
          </View>
        )} */}
        {calendar && (
          <View style={[
            styles.statusBadgeBase, 
            calendar.enabled ? styles.enabledStatus : styles.disabledStatus
          ]}>
            <MaterialIcons 
              name={calendar.enabled ? "sync" : "sync-disabled"} 
              size={14} 
              color={calendar.enabled ? COLORS.white : COLORS.dark} 
            />
            <Text style={[
              styles.statusText,
              calendar.enabled ? styles.enabledText : styles.disabledText
            ]}>
              {calendar.enabled ? 'Active' : 'Paused'}
            </Text>
          </View>
        )}
            </>
          ) : (
            <View style={styles.notConnectedBadge}>
              <Text style={styles.notConnectedText}>Not Linked</Text>
            </View>
          )}
          <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
        </View>


              </View>
              
              {/* Show additional info if connected */}
              {isConnected && calendar && (
                <View style={styles.connectionDetails}>
                  <Text style={styles.detailText} numberOfLines={1}>
                    URL: {calendar.ical_url || calendar.calendar_url || 'No URL provided'}
                  </Text>
                  {calendar.last_synced && (
                    <Text style={styles.detailText}>
                      Last synced: {new Date(
                        calendar.last_synced.$date || calendar.last_synced
                      ).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              
            </TouchableOpacity>
          );
        })}
      </View>

        
  
        {/* <View style={styles.platformsContainer}>
          {bookingPlatforms.map(renderPlatformCard)}
        </View> */}
  
        {/* Why Connect Section */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Why Connect Calendars?</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
              <Text style={styles.benefitTitle}>Auto-Sync</Text>
              <Text style={styles.benefitText}>Availability updates in real-time</Text>
            </View>
            <View style={styles.benefitCard}>
             <MaterialIcons name="block" size={24} color={COLORS.primary} />
             <Text style={styles.benefitTitle}>No Overbooking</Text>
             <Text style={styles.benefitText}>Prevent double bookings</Text>
           </View>
           <View style={styles.benefitCard}>
             <MaterialIcons name="schedule" size={24} color={COLORS.primary} />
             <Text style={styles.benefitTitle}>Save Time</Text>
             <Text style={styles.benefitText}>No manual calendar updates</Text>
           </View>
           <View style={styles.benefitCard}>
             <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
             <Text style={styles.benefitTitle}>Maximize Revenue</Text>
             <Text style={styles.benefitText}>Optimize your booking rates</Text>
           </View>
          </View>
        </View>
  
        {/* Synced Calendars List */}
        {syncedCalendars.length > 0 ? (
          syncedCalendars.map((calendar) => {
            // Safely get platform name with fallback
            const platformName = calendar.platform || 'unknown';
            console.log(calendar.platform)
            // alert(platformName)
            
            return (
              <View key={calendar._id || calendar.id || calendar.calendar_url} style={styles.syncItem}>
                <View style={styles.syncInfo}>
                  <MaterialIcons 
                    name={calendar.enabled ? "sync" : "sync-disabled"} 
                    size={20} 
                    color={calendar.enabled ? COLORS.success : COLORS.gray} 
                  />
                  
                  <View style={styles.syncDetails}>
                    {/* Platform name with capitalization */}
                    <Text style={styles.syncLabel}>
                      {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
                    </Text>
                    
                    {/* Calendar URL with fallback */}
                    <Text style={styles.syncUrl} numberOfLines={1}>
                      {calendar.calendar_url || calendar.icalUrl || 'No URL provided'}
                    </Text>
                    
                    {/* Last synced date */}
                    {calendar.last_synced && (
                      <Text style={styles.syncDate}>
                        Last synced: {new Date(calendar.last_synced).toLocaleDateString()}
                      </Text>
                    )}
                    
                    {/* Assigned cleaners section */}
                    <View style={styles.cleanersContainer}>
                      <Text style={styles.cleanersLabel}>Assigned cleaners:</Text>
                      <View style={styles.cleanersList}>
                        {calendar.assigned_cleaners && calendar.assigned_cleaners.length > 0 ? (
                          cleaners
                            .filter(cleaner => 
                              calendar.assigned_cleaners.includes(cleaner._id) || 
                              calendar.assigned_cleaners.includes(cleaner.id)
                            )
                            .map(cleaner => (
                              <View key={cleaner._id || cleaner.id} style={styles.cleanerBadge}>
                                <Avatar.Image 
                                  size={24} 
                                  source={{ uri: cleaner.avatarUrl || 'https://via.placeholder.com/40' }} 
                                  style={styles.cleanerAvatar}
                                />
                                <Text style={styles.cleanerName}>
                                  {cleaner.firstname || 'Unknown'}
                                </Text>
                              </View>
                            ))
                        ) : (
                          <Text style={styles.noCleanersText}>None assigned</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
                
                <Switch 
                  value={calendar.enabled !== false} // Default to true if undefined
                  onValueChange={() => toggleSync(calendar._id || calendar.id)} 
                  color={COLORS.primary}
                />
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}></Text>
        )}

        
  
        {/* Sync Calendar Button */}
        {/* <View style={styles.manualContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedPlatform(null);
              setModalVisible(true);
            }}
            style={styles.createButton}
          >
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <MaterialCommunityIcons name="calendar-sync" size={20} color="white" /> 
              <Text style={styles.buttonText}> Sync Calendar</Text>
            </View>
          </TouchableOpacity>
        </View> */}

        <AddICalModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedPlatform(null);
            setSelectedCalendar(null); // Reset selected calendar
          }}
          onSave={handleSyncCalendar}
          cleaners={cleaners}
          aptId={property._id}
          preselectedPlatform={selectedPlatform}
          existingCalendar={selectedCalendar} // Pass to modal
          checklists={checklists} // Pass checklists to modal
        />
      </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  automationCard: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: COLORS.primary_light_1
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: '#FFF',
    height: 110
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskDate: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  manualContainer: {
    alignItems: 'flex-end',
    marginVertical: 0,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  viewButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  avatar: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 14,
    color: '#333',
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
    paddingHorizontal: 5
  },
  pendingBadge: {
    backgroundColor: '#FFC107',
    marginLeft: 10,
    paddingHorizontal: 5
  },
  centerContent: {
    alignItems: 'center',
    marginVertical: 10
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '600'
  },
  syncLabel: {
    marginTop: 5
  },
  syncItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  switch: {
    marginTop: 0,
  },
  statusBadgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  enabledStatus: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.light_gray,
  },
  disabledStatus: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 24,
  },
  platformsContainer: {
    marginBottom: 16,
  },
  platformCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformInfo: {
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 16,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7e9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  notConnectedBadge: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  notConnectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  connectionDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: .5,
    borderTopColor: COLORS.light_gray,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  footer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  connectButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncDetails: {
    marginLeft: 10,
    flex: 1,
  },
  syncUrl: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
  },
  noCleanersText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});