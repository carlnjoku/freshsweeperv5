import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import CalendarView from '../../components/shared/CalendarView';
import FloatingButton from '../../components/shared/FloatingButton';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import NewBooking from './NewBooking';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import Upcoming from './BookingTabs/Upcoming';
import Ongoing from './BookingTabs/Ongoing';
import History from './BookingTabs/History';
import { useFocusEffect } from '@react-navigation/native';
import { useBookingContext } from '../../context/BookingContext';
import EditSchedule from './EditSchedule';

const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // local midnight
};

const parseLocalDateTime = (date, time) => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};
export default function Bookings({navigation}) {

  const{currentUserId, geolocationData} = useContext(AuthContext)
  
  const {handleEdit, modalVisible, modalEVisible, openModal, setOpenModal, handleCreateSchedule }  = useBookingContext();
  
  console.log("Open Modal State:", modalEVisible);


  
    // const[openModal, setOpenModal] = useState(false)
    const[schedules, setSchedules] = useState([])
    const[upcoming_schedules, setUpComingSchedules] = useState([])
    const[ongoing_schedules, setOnGoingSchedules] = useState([])
    const[completed_schedules, setCompletedSchedules] = useState([])
    const[apartments, setApartments] = useState([])
    const[currentStep, setCurrentStep] = useState(1);
    const[future_schedules, setFutureSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    
    // const fetchSchedules = async () => {

    //   setLoading(true);
    //   try {
    //     const response = await userService.getSchedulesByHostId(currentUserId);
    //     const res = response.data;
        
    //     setSchedules(res);
    //     // setUpComingSchedules(res.filter((schedule) => schedule.status.toLowerCase() === 'upcoming'));

    //     const excludedKeys = [
    //       "overall_checklist",
    //       "assignedTo",
    //       "notified_cleaners"
    //     ];
      
    //     const json = JSON.stringify(
    //       res,
    //       (key, value) => excludedKeys.includes(key) ? undefined : value,
    //       2
    //     );
        
      
        
    //     setUpComingSchedules(
    //       res.filter(schedule => {
    //         const scheduleDateTime = new Date(`${schedule.schedule.cleaning_date}T${schedule.schedule.cleaning_time}`); // Combine date and time
    //         const currentDateTime = new Date(); // Get the current date and time
        
    //         return (
              
    //           schedule.status.toLowerCase() ===  "pending_payment" && 
    //           scheduleDateTime >= currentDateTime // Include only schedules with date-time now or later
    //         );
    //       })
    //     );

    //     setUpComingSchedules(
    //       res.filter(schedule => {
    //         const scheduleDateTime = parseLocalDateTime(
    //           schedule.schedule.cleaning_date,
    //           schedule.schedule.cleaning_time
    //         );
        
    //         return (
    //           schedule.status.toLowerCase() === "pending_payment" &&
    //           scheduleDateTime >= new Date()
    //         );
    //       })
    //     );
        
    //     setOnGoingSchedules(res.filter((schedule) => schedule.status.toLowerCase() === 'in_progress' || 'approved_payment_cleaners'));
    //     setCompletedSchedules(res.filter((schedule) => schedule.status.toLowerCase() === 'completed' || 'uncompleted'));

    //     // Get calendar future dates 
    //     // Filter for today's and future dates
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Normalize today's date

        
    //     // console.log(parseLocalDate(timiee).toDateString());
    //     const futureDates = res
    //     .filter(schedule => {
    //       const scheduleDate = parseLocalDate(schedule.schedule.cleaning_date);
    //       return (
    //         scheduleDate > today &&
    //         schedule.status === "pending_payment"
    //       );
    //     })
    //     .map(schedule =>
    //       parseLocalDate(schedule.schedule.cleaning_date).toDateString()
    //     );

    //       setFutureSchedules(futureDates)
    //       console.log(futureDates);
    //   } catch (err) {
    //     console.error(err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchSchedules = async () => {
      setLoading(true);
    
      try {
        const response = await userService.getSchedulesByHostId(currentUserId);
        const res = response.data;
    
        setSchedules(res);
    
        /* ------------------------------
           UPCOMING SCHEDULES (FUTURE)
        --------------------------------*/
        const upcomingSchedules = res
          .filter(schedule => {
            const scheduleDateTime = parseLocalDateTime(
              schedule.schedule.cleaning_date,
              schedule.schedule.cleaning_time
            );
    
            const isValidStatus =
              schedule.status === "pending_payment" ||
              schedule.status === "payment_confirmed";
    
            return isValidStatus && scheduleDateTime >= new Date();
          })
          .sort((a, b) => {
            return (
              parseLocalDateTime(
                a.schedule.cleaning_date,
                a.schedule.cleaning_time
              ) -
              parseLocalDateTime(
                b.schedule.cleaning_date,
                b.schedule.cleaning_time
              )
            );
          });
    
        setUpComingSchedules(upcomingSchedules);
    
        /* ------------------------------
           ONGOING SCHEDULES
        --------------------------------*/
        const onGoing = res.filter(
          schedule =>
            schedule.status === "in_progress" ||
            schedule.status === "approved_payment_cleaners"
        );
    
        setOnGoingSchedules(onGoing);
    
        /* ------------------------------
           COMPLETED SCHEDULES
        --------------------------------*/
        const completed = res.filter(
          schedule =>
            schedule.status === "completed" ||
            schedule.status === "uncompleted"
        );
    
        setCompletedSchedules(completed);
    
        /* ------------------------------
           CALENDAR FUTURE DATES
        --------------------------------*/
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const futureDates = res
          .filter(schedule => {
            const scheduleDate = parseLocalDate(
              schedule.schedule.cleaning_date
            );
    
            return (
              scheduleDate > today &&
              schedule.status === "pending_payment"
            );
          })
          .map(schedule =>
            parseLocalDate(
              schedule.schedule.cleaning_date
            ).toDateString()
          );
    
        setFutureSchedules(futureDates);
    
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchApartments = async () => {
      setLoading(true);
      try {
        const response = await userService.getApartment(currentUserId);
        const res = response.data;
  
        if (res.length < 1) {
          navigation.navigate(ROUTES.host_home_tab);
        }
        setApartments(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };


    useEffect(() => {
      const unsubscribe = navigation.addListener('tabPress', () => {
        fetchApartments();
        fetchSchedules();
      });
      return unsubscribe; // Cleanup on unmount
    }, [navigation, currentStep]);

  
    // Refresh data every time the screen is focused
    useFocusEffect(
      useCallback(() => {
      fetchSchedules()
      fetchApartments()
      
    }, [navigation])
  );

    
  const handleOpenCreateBooking = () => {
    setOpenModal(true)
  }
  const handleCloseCreateBooking = () => {
    handleCreateSchedule(false)
    setTimeout(() => {
      resetFormData()
    }, 300)
  }


   
  const onUpcomingSchedule = () => {
    setCurrentStep(1)
  }

  const onOngoingSchedule = () => {
    setCurrentStep(2)
  }
  

  return (
    
    <View style={{backgroundColor:COLORS.backgroundColor, flex:1, margin:0, marginTop:0}}>
      
      <StatusBar translucent backgroundColor={COLORS.primary} barStyle="dark-content"/>
      {/* <StatusBar translucent={false} backgroundColor={COLORS.primary}  barStyle="light-content"/> */}
      <View style={{backgroundColor:COLORS.primary}}>
          <View style={{margin:20}}>
            <CalendarView
              title="My schedule"
              future_schedule_dates = {future_schedules}
              openUpcomingTab={onUpcomingSchedule}
              openOngoingTab={onOngoingSchedule}
            />
          </View>

      </View>

      <View style={styles.container2}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
              <MaterialCommunityIcons name="calendar-blank" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
              <Text style={styles.tab_text}>Up Coming </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
              <MaterialCommunityIcons name="progress-clock" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
              <Text style={styles.tab_text}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
              <MaterialCommunityIcons name="history" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
              <Text style={styles.tab_text}>History</Text>
            </TouchableOpacity>
          </View>



          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.container}>
              {currentStep === 1 && <Upcoming schedules={upcoming_schedules} currency ={geolocationData.currency.symbol} handleEditSchedule = {handleEdit} />}
              {currentStep === 2 && <Ongoing schedules={ongoing_schedules} />}
              {currentStep === 3 && <History schedules={completed_schedules} />}
            </View>
          )}
        
          {/* <View style={styles.container}>
            {currentStep === 1 && <Upcoming schedules={upcoming_schedules} />}
            {currentStep === 2 && <Ongoing schedules={ongoing_schedules} />}
            {currentStep === 3 && <Completed schedules={completed_schedules} />}
          </View> */}
    
        
         

        {apartments.length > 0 && 
          // <FloatingButton 
          //   // onPress={handleCreateSchedule}
          //   onPress={() => handleCreateSchedule(true)}
          //   // onPress={() => setOpenModal(true)}
          //   color="green"
          // />

          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => handleCreateSchedule(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.floatingButtonText}>New Schedule</Text>
          </TouchableOpacity>
        }


    
      </View>

      

            <Modal 
              visible={modalEVisible}
              animationType="slide" 
              transparent={false}   // 👈 important
              presentationStyle="fullScreen"
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

    
  )
}


const styles = StyleSheet.create({
  // container:{
  //   flex:1, 
  //   backgroundColor:COLORS.backgroundColor,
  //   padding:10
  // },
  container2:{
    flex: 1,
    margin:0
  },
  colorcode:{
    marginBottom:20
},
item_separator : {
  marginTop:5,
  marginBottom:5,
  height:1,
  width:"100%",
  backgroundColor:"#E4E4E4",
},
empty_listing: {
  display:'flex',
  justifyContent:'center',
  alignItems:'center',
  marginTop:'50%'
},
button:{
  padding:10,
  borderRadius:50,
  backgroundColor:COLORS.primary,
  marginTop:20
},
add_apartment_text:{
  color:COLORS.white
},
tabsContainer:{
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  borderBottomWidth: 0,
  borderBottomColor: "#e9e9e9",
  elevation:2
},
tab:{
  borderBottomWidth:3,
  borderBottomColor: COLORS.primary,
  alignItems:'center',
  marginTop:10,
  paddingHorizontal:26
},
tab_text:{
  marginBottom:5,
},
navigation: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  padding: 20,
  borderTopWidth: 1,
  borderTopColor: '#ccc',
},
arrowButton: {
  padding: 10,
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
})