import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Modal,  ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import CleanerItem from '../../components/cleaner/CleanerItem';
// import { HomeSkeleton } from '../../components/skeleton/HomeSkeleton';
import { HomeSkeleton } from '../../components/shared/skeleton/HomeSkeleton';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import * as Animatable from 'react-native-animatable';
import { AntDesign } from '@expo/vector-icons';
import { Avatar, TextInput, Menu, List, Button, Chip} from 'react-native-paper';
// import ScheduleCard from '../../components/ScheduleCard';
import ScheduleCard from '../../components/shared/ScheduleCard';
import ROUTES from '../../constants/routes';
// import GoogleMapAndUsers from '../../components/shared/GoogleMapAndUsers';
import CustomHeader from '../../components/shared/CustomHeader';
import { useBookingContext } from '../../context/BookingContext';
import NewBooking from './NewBooking';
import CleanerCard from '../../components/cleaner/CleanerCard';
import ScheduleCar from '../../components/shared/ScheduleCar';

const FindCleaners = ({ navigation }) => {
  const { currentUserId, currentUser } = useContext(AuthContext);
  const { modalVisible, handleCreateSchedule }  = useBookingContext();

  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(false);

  const genericArray = new Array(5).fill(null);

  // // Fetch initial data
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [apartmentsRes] = await Promise.all([
  //         userService.getApartment(currentUserId),
  //       ]);
  //       setApartments(apartmentsRes.data);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   fetchData();
  // }, [currentUserId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apartmentsRes] = await Promise.all([
          userService.getApartment(currentUserId),
        ]);
        
        if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
          navigation.replace(ROUTES.host_dashboard); // Redirect to dashboard
          return;
        }
  
        setApartments(apartmentsRes.data);
      } catch (error) {
        console.error('Error fetching datas:', error);
      }
    };
    
    fetchData();
  }, [currentUserId, navigation]);


  // Fetch schedules when property is selected
  useEffect(() => {
    const fetchPropertySchedules = async () => {
      if (!selectedProperty) return;
      
      try {
        const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
        const filtered = schedulesRes.data.filter(
          item => item.schedule.apartment_name === selectedProperty.apt_name
        );

        console.log(JSON.stringify(filtered, null, 2))
        const upcomingSchedules = filtered.filter(schedule => {
          const cleaningDate = schedule.schedule.cleaning_date; // e.g. "2025-07-10"
          const cleaningTime = schedule.schedule.cleaning_time; // e.g. "14:00:00"
        
          if (!cleaningDate || !cleaningTime) return false;
        
          const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
          // console.log(cleaningDateTime.isSameOrAfter(moment()))
          return cleaningDateTime.isSameOrAfter(moment());
        });
        
        setSchedules(upcomingSchedules);
        // Clear selected schedule when property changes

        
        setSelectedSchedule(null);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };
    
    fetchPropertySchedules();
  }, [selectedProperty, currentUserId]);

  // Fetch cleaners when schedule is selected
  useEffect(() => {
    const fetchScheduleCleaners = async () => {
      if (!selectedSchedule) return;
      
      setLoading(true);
      try {
        
        const cleanersRes = await userService.findCleaners(selectedSchedule._id);
        setCleaners(cleanersRes.data);
        console.log("My cleeeeeeeeeeeeeeeaners",cleanersRes.data)
      } catch (error) {
        console.error('Error fetching cleaners:', error);
      } finally {
        setLoading(false);
      }
    };
    
   
    const timeout = setTimeout(() => {
      fetchScheduleCleaners();
    }, 2000);
  
    return () => clearTimeout(timeout); // Cleanup function tos clear timeout if `selectedSchedule` changes before timeout completes
  }, [selectedSchedule]);

  // Add this cleanup effect
useEffect(() => {
  return () => {
      // Reset state when component unmounts
      setCurrentStep(1);
      setSelectedProperty(null);
      setSelectedSchedule(null);
  };
}, []);

  const handleStepNavigation = () => {
    if (currentStep === 1 && selectedProperty) {
      setCurrentStep(2);
    }
    if (currentStep === 2 && selectedSchedule) {
      setCurrentStep(3);
    }
  };

  const handleCloseCreateBooking = () => {
    handleCreateSchedule(false)
  }

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

        <Chip
          mode="flat"
          style={styles.activeChip}
          textStyle={styles.textChip}
        >
          {item.roomDetails[0]['number']} {item.roomDetails[0]['type']}
        </Chip>
        <Chip
          mode="flat"
          style={styles.activeChip}
          textStyle={styles.textChip}
        >
          {item.roomDetails[1]['number']} {item.roomDetails[1]['type']}
        </Chip>
        <Chip
          mode="flat"
          style={styles.activeChip}
          textStyle={styles.textChip}
        >
          {item.roomDetails[2]['number']} {item.roomDetails[2]['type']}
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
        {/* <View style={styles.scheduleIcon}>
          <Feather name="calendar" size={24} color={COLORS.primary} />
        </View> */}

        <View style={[styles.dateBadge, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.day}>{dateBadge.day}</Text>
          <Text style={styles.month}>{dateBadge.month}</Text>
        </View>
        <View>
          <Text style={styles.cardTitle}>
          {dateBadge.dayName}
          </Text>
          {/* <Text style={styles.cardSubtitle}>
            {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
          </Text> */}

          <View style={styles.row}>
           <MaterialIcons name="schedule" size={18} color={COLORS.light_gray} />
           <Text style={styles.infoText}>
           {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')} - {moment(item.schedule.cleaning_end_time, 'h:mm:ss A').format('h:mm A') || 'TBD' }
           </Text>
         </View>
         <View style={styles.row}>
           <MaterialIcons name="location-on" size={18} color={COLORS.light_gray} />
           <Text style={styles.address}>{item.schedule.address}</Text>
         </View>
         {/* <Text style={styles.address}>{item.schedule.address}</Text> */}
        </View>
      </View>
      {selectedSchedule?._id === item._id && (
        <View style={styles.checkBadge}>
          <Feather name="check" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
    </View>
    )
  };

  const renderCleanerItem = ({ item }) => {
    console.log("My itemssss",selectedSchedule)
    return (<View style={{margin:10}}>
      {/* <CleanerItem 
        item={item}
        selected_schedule={selectedSchedule}
        selected_scheduleId={selectedSchedule._id}
        hostId={currentUserId}
        hostFname = {currentUser.firstname}
        hostLname = {currentUser.lastname}
      /> */}
      <CleanerCard
        item={item}
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
    </View>)
};

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.stepIndicatorContainer}>
          {[1, 2, 3].map(step => (
            <View
              key={step}
              style={[
                styles.stepIndicator,
                currentStep >= step && styles.activeStepIndicator
              ]}
            />
          ))}
        </View>
      </View> */}

      <CustomHeader 
        navigation={navigation}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

    
      {/* <ScheduleCar
        schedule={{
          cleaning_date: '2025-07-18',
          cleaning_time: '10:00 AM',
          cleaning_end_time: '12:00 PM',
          apartment: {
            name: 'Downtown Loft',
            address: '45 Beacon Street, Boston, MA',
          },
          cleaner: {
            firstname: 'Sarah',
            lastname: 'Connor',
          },
        }}
      /> */}

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
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
                <Text style={styles.emptyText}>No available schedules for this property</Text>
                <TouchableOpacity
                  style= {styles.createScheduleButton}
                  onPress={() => handleCreateSchedule(true)}
                  // onPress = {console.log("open modal")}
                >
                  <Text style={{color:'white'}}>Create Schedule</Text>
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
            {/* <GoogleMapAndUsers
              users={cleaners}
              apartment_name={selectedProperty?.apt_name}
              apartment_address={selectedProperty?.address}
              apartment_latitude={selectedProperty?.latitude}
              apartment_longitude={selectedProperty?.longitude}
            /> */}
            {/* Location & Calendar Blockss */}
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
            {loading ? (
              <View>
                <View>
                    <HomeSkeleton width="100%" height={300} />
                </View>
                {genericArray.map((item, index) => (
                  <Animatable.View animation="slideInLeft" duration={550}>
                  
                  <View style={{flexDirection: 'row', paddingVertical:5}}>
                    {<View style={{flex: 0.18}}>
                      <HomeSkeleton width={50} height={50} variant="circle" />
                    </View>
                    }
                    {<View style={{flex: 0.8}}>
                      <HomeSkeleton width="80%" height={12} />
                      <HomeSkeleton width={160} height={10} />
                      <HomeSkeleton width={120} height={8}  /> 
                    </View>
                    }
                  </View>
                  </Animatable.View>
                ))}
  
              </View>
            ) : (
              <FlatList
                data={cleaners}
                renderItem={renderCleanerItem}
                keyExtractor={item => item._id}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No available cleaners found</Text>
                }
                scrollEnabled={false}
              />
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      {currentStep < 3 && (
        <TouchableOpacity
        style={[
          styles.nextButton,
          (currentStep === 1 && !selectedProperty) || 
          (currentStep === 2 && (schedules.length === 0 || !selectedSchedule)) && 
          styles.disabledButton
        ]}
        disabled={
          (currentStep === 1 && !selectedProperty) || 
          (currentStep === 2 && (schedules.length === 0 || !selectedSchedule))
        }
        onPress={handleStepNavigation}
      >
        <Text style={styles.buttonText}>
          {currentStep === 1 ? 'Next: Choose Schedule' : 'Find Cleaners'}
        </Text>
        <Feather name="arrow-right" size={20} color="white" />
      </TouchableOpacity>
      )}

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
    // marginBottom: 24,
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
  disabledButton: {
    backgroundColor: COLORS.lightGray,
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
    // borderColor:COLORS.black,
  },
  textChip: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.gray, // Custom text color
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
});

export default FindCleaners;
