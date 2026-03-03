import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView,Text,StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import CalendarView from '../../components/shared/CalendarView';
import COLORS from '../../constants/colors';
import Upcoming from './ScheduleTabs/Upcoming';
import Ongoing from './ScheduleTabs/Ongoing';
import * as Animatable from 'react-native-animatable';
// import CreateBooking from './CreateBooking';

import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import CompletedJobsList from './ScheduleTabs/CompletedJobList';
import History from './ScheduleTabs/History';


// const parseLocalDate = (dateStr) => {
//   const [year, month, day] = dateStr.split('-').map(Number);
//   return new Date(year, month - 1, day); // local midnight
// };

const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // local midnight
};

export default function Schedules({navigation}) {

    const{currentUserId} = useContext(AuthContext)

  
    const[openModal, setOpenModal] = useState(false)
    const[schedules, setSchedules] = useState([])
    const[currentStep, setCurrentStep] = useState(1);
    const[upcoming_schedules, setUpComingSchedules] = useState([])
    const[ongoing_schedules, setOnGoingSchedules] = useState([])
    const[completed_schedules, setCompletedSchedules] = useState([])
    const[future_schedules, setFutureSchedules] = useState([]);
    

    useEffect(()=> {
      fetchSchedules()
      // const unsubscribe = navigation.addListener('tabPress', () => {
      // alert("Hey")
        // fetchSchedules()
    // });

    // return unsubscribe; // Cleanup subscription
      
    },[navigation, currentStep])

    const fetchSchedules = async () => {
      await userService.getSchedulesAssignedToCleaner(currentUserId)
      .then(response => {
        const res = response.data
        console.log("1111111111113")
        console.log("1111111111112")
        
        // METHOD 1: Filter by current user's assignment status
        const upcomingSchedules = res.filter(schedule => {
          const currentUserAssignment = schedule.assignedTo?.find(cleaner => 
            cleaner.cleanerId === currentUserId
          );
          return currentUserAssignment && (
            currentUserAssignment.status.toLowerCase() === "payment_confirmed" ||
            currentUserAssignment.status.toLowerCase() === "cancelled"
          );
          // return currentUserAssignment?.status.toLowerCase() === "payment_confirmed";
        });
        
        const ongoingSchedules = res.filter(schedule => {
          const currentUserAssignment = schedule.assignedTo?.find(cleaner => 
            cleaner.cleanerId === currentUserId
          );
          return currentUserAssignment?.status.toLowerCase() === "in_progress" || currentUserAssignment?.status.toLowerCase() === "pending_completion_approval";
        });
        
        // HISTORY TAB: Include both completed AND uncompleted schedules for current user
        const historySchedules = res.filter(schedule => {
          const currentUserAssignment = schedule.assignedTo?.find(cleaner => 
            cleaner.cleanerId === currentUserId
          );
          const status = currentUserAssignment?.status.toLowerCase();
         
          return status === "approved" || status === "uncompleted";
        });
    
    
        setUpComingSchedules(upcomingSchedules);
        setOnGoingSchedules(ongoingSchedules);
        setCompletedSchedules(historySchedules);
      
        // Filter for today's and future dates
        // const today = new Date();
        // today.setHours(0, 0, 0, 0); // Normalize today's date
        // console.log(today)
        // const futureDates = res
        //   .filter(schedule => {
        //     const scheduleDate = new Date(schedule.schedule.cleaning_date);
        //     scheduleDate.setHours(0, 0, 0, 0); // Normalize schedule date
        //     return scheduleDate > today && schedule.status === "upcoming"; // Future dates with "upcoming" status
        //   })
        //   .map(schedule => {
        //     const scheduleDate = new Date(schedule.schedule.cleaning_date);
        //     return scheduleDate.toDateString(); // Convert to "Wed Feb 07 2025" format
        //   });
        
          // const timmeee = res[0].schedule.cleaning_date
          // alert(parseLocalDate(timmeee))

          // console.log(parseLocalDate(timmeee))
          // console.log(parseLocalDate(today))


          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const futureDates = res
            .filter(schedule => {
              const dateStr = schedule?.schedule?.cleaning_date;
              const scheduleDate = parseLocalDate(dateStr);

              if (!scheduleDate) return false;

              return (
                scheduleDate > today &&
                schedule.status === "payment_confirmed"
              );
            })
            .map(schedule =>
              parseLocalDate(schedule.schedule.cleaning_date).toDateString()
            );

            console.log(futureDates)
            setFutureSchedules(futureDates);
        
        //   const futureDates = res
        //   .filter(schedule => {
        //     const scheduleDate = parseLocalDate(schedule.schedule.cleaning_date);
        //     return (
        //       scheduleDate > today &&
        //       schedule.status === "pending_payment"
        //     );
        //   })
        //   .map(schedule =>
        //     parseLocalDate(schedule.schedule.cleaning_date).toDateString()
        //   );
    
        // setFutureSchedules(futureDates)
        // console.log("gcgfg_____ooiohoh", futureDates);
       
      }).catch((err)=> {
        console.log(err)
      })
    }

    const onUpcomingSchedule = () => {
      setCurrentStep(1)
    }

    const onOngoingSchedule = () => {
      setCurrentStep(2)
    }


    
  return (
    
    <View style={{flex:1, margin:0, marginTop:0}}>
      
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={{backgroundColor:COLORS.primary}}>
          <View style={{margin:20}}>
            <CalendarView
              title="My schedules"
              openUpcomingTab={onUpcomingSchedule}
              openOngoingTab={onOngoingSchedule}
              future_schedule_dates = {future_schedules}
            />
          </View>

      </View>

      <View style={styles.container2}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
            <MaterialCommunityIcons name="progress-clock" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
            <MaterialCommunityIcons name="calendar-blank" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>Up Coming </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
            <MaterialCommunityIcons name="history" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          {currentStep === 1 && <Upcoming schedules= {upcoming_schedules} />}
          {currentStep === 2 && <Ongoing schedules= {ongoing_schedules} />}
          {currentStep === 3 && <History schedules ={completed_schedules} />}
          {/* {currentStep === 3 && <CompletedJobsList schedules ={completed_schedules} />} */}
        </View>
        
    
      </View>

        <Modal 
            visible={openModal}
            animationType="slide" 
            // onRequestClose={onClose} // Handle hardware back button on Android
          >
            
            
          </Modal>
    </View>

    
  )
}


const styles = StyleSheet.create({
  container:{
    flex:1, 
    backgroundColor:COLORS.white,
    padding:0
  },
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
})