// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useEffect, useState, useContext } from 'react';
// import { SafeAreaView,Text,StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import CalendarView from '../../components/shared/CalendarView';
// import COLORS from '../../constants/colors';
// import Upcoming from './ScheduleTabs/Upcoming';
// import Ongoing from './ScheduleTabs/Ongoing';
// import * as Animatable from 'react-native-animatable';
// // import CreateBooking from './CreateBooking';

// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import CompletedJobsList from './ScheduleTabs/CompletedJobList';
// import History from './ScheduleTabs/History';


// // const parseLocalDate = (dateStr) => {
// //   const [year, month, day] = dateStr.split('-').map(Number);
// //   return new Date(year, month - 1, day); // local midnight
// // };

// const parseLocalDate = (dateStr) => {
//   if (!dateStr || typeof dateStr !== 'string') {
//     return null;
//   }
//   const [year, month, day] = dateStr.split('-').map(Number);
//   return new Date(year, month - 1, day); // local midnight
// };

// export default function Schedules({navigation}) {

//     const{currentUserId} = useContext(AuthContext)

  
//     const[openModal, setOpenModal] = useState(false)
//     const[schedules, setSchedules] = useState([])
//     const[currentStep, setCurrentStep] = useState(1);
//     const[upcoming_schedules, setUpComingSchedules] = useState([])
//     const[ongoing_schedules, setOnGoingSchedules] = useState([])
//     const[completed_schedules, setCompletedSchedules] = useState([])
//     const[future_schedules, setFutureSchedules] = useState([]);
    

//     useEffect(()=> {
//       fetchSchedules()
//       // const unsubscribe = navigation.addListener('tabPress', () => {
//       // alert("Hey")
//         // fetchSchedules()
//     // });

//     // return unsubscribe; // Cleanup subscription
      
//     },[navigation, currentStep])

//     const fetchSchedules = async () => {
//       await userService.getSchedulesAssignedToCleaner(currentUserId)
//       .then(response => {
//         const res = response.data
//         console.log("1111111111113")
//         console.log("1111111111112")
        
//         // METHOD 1: Filter by current user's assignment status
//         const upcomingSchedules = res.filter(schedule => {
//           const currentUserAssignment = schedule.assignedTo?.find(cleaner => 
//             cleaner.cleanerId === currentUserId
//           );
//           return currentUserAssignment && (
//             currentUserAssignment.status.toLowerCase() === "payment_confirmed" ||
//             currentUserAssignment.status.toLowerCase() === "cancelled"
//           );
//           // return currentUserAssignment?.status.toLowerCase() === "payment_confirmed";
//         });
        
//         const ongoingSchedules = res.filter(schedule => {
//           const currentUserAssignment = schedule.assignedTo?.find(cleaner => 
//             cleaner.cleanerId === currentUserId
//           );
//           return currentUserAssignment?.status.toLowerCase() === "in_progress" || currentUserAssignment?.status.toLowerCase() === "pending_completion_approval";
//         });
        
//         // HISTORY TAB: Include both completed AND uncompleted schedules for current user
//         const historySchedules = res.filter(schedule => {
//           const currentUserAssignment = schedule.assignedTo?.find(cleaner => 
//             cleaner.cleanerId === currentUserId
//           );
//           const status = currentUserAssignment?.status.toLowerCase();
         
//           return status === "approved" || status === "uncompleted";
//         });
    
    
//         setUpComingSchedules(upcomingSchedules);
//         setOnGoingSchedules(ongoingSchedules);
//         setCompletedSchedules(historySchedules);
      
//         // Filter for today's and future dates
//         // const today = new Date();
//         // today.setHours(0, 0, 0, 0); // Normalize today's date
//         // console.log(today)
//         // const futureDates = res
//         //   .filter(schedule => {
//         //     const scheduleDate = new Date(schedule.schedule.cleaning_date);
//         //     scheduleDate.setHours(0, 0, 0, 0); // Normalize schedule date
//         //     return scheduleDate > today && schedule.status === "upcoming"; // Future dates with "upcoming" status
//         //   })
//         //   .map(schedule => {
//         //     const scheduleDate = new Date(schedule.schedule.cleaning_date);
//         //     return scheduleDate.toDateString(); // Convert to "Wed Feb 07 2025" format
//         //   });
        
//           // const timmeee = res[0].schedule.cleaning_date
//           // alert(parseLocalDate(timmeee))

//           // console.log(parseLocalDate(timmeee))
//           // console.log(parseLocalDate(today))


//           const today = new Date();
//           today.setHours(0, 0, 0, 0);

//           const futureDates = res
//             .filter(schedule => {
//               const dateStr = schedule?.schedule?.cleaning_date;
//               const scheduleDate = parseLocalDate(dateStr);

//               if (!scheduleDate) return false;

//               return (
//                 scheduleDate > today &&
//                 schedule.status === "payment_confirmed"
//               );
//             })
//             .map(schedule =>
//               parseLocalDate(schedule.schedule.cleaning_date).toDateString()
//             );

//             console.log(futureDates)
//             setFutureSchedules(futureDates);
        
//         //   const futureDates = res
//         //   .filter(schedule => {
//         //     const scheduleDate = parseLocalDate(schedule.schedule.cleaning_date);
//         //     return (
//         //       scheduleDate > today &&
//         //       schedule.status === "pending_payment"
//         //     );
//         //   })
//         //   .map(schedule =>
//         //     parseLocalDate(schedule.schedule.cleaning_date).toDateString()
//         //   );
    
//         // setFutureSchedules(futureDates)
//         // console.log("gcgfg_____ooiohoh", futureDates);
       
//       }).catch((err)=> {
//         console.log(err)
//       })
//     }

//     const onUpcomingSchedule = () => {
//       setCurrentStep(1)
//     }

//     const onOngoingSchedule = () => {
//       setCurrentStep(2)
//     }


    
//   return (
    
//     <View style={{flex:1, margin:0, marginTop:0}}>
      
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//       <View style={{backgroundColor:COLORS.primary}}>
//           <View style={{margin:20}}>
//             <CalendarView
//               title="My schedules"
//               openUpcomingTab={onUpcomingSchedule}
//               openOngoingTab={onOngoingSchedule}
//               future_schedule_dates = {future_schedules}
//             />
//           </View>

//       </View>

//       <View style={styles.container2}>
//         <View style={styles.tabsContainer}>
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
//             <MaterialCommunityIcons name="progress-clock" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>In Progress</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
//             <MaterialCommunityIcons name="calendar-blank" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>Up Coming </Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
//             <MaterialCommunityIcons name="history" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>History</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.container}>
//           {currentStep === 1 && <Upcoming schedules= {upcoming_schedules} />}
//           {currentStep === 2 && <Ongoing schedules= {ongoing_schedules} />}
//           {currentStep === 3 && <History schedules ={completed_schedules} />}
//           {/* {currentStep === 3 && <CompletedJobsList schedules ={completed_schedules} />} */}
//         </View>
        
    
//       </View>

//         <Modal 
//             visible={openModal}
//             animationType="slide" 
//             // onRequestClose={onClose} // Handle hardware back button on Android
//           >
            
            
//           </Modal>
//     </View>

    
//   )
// }


// const styles = StyleSheet.create({
//   container:{
//     flex:1, 
//     backgroundColor:COLORS.white,
//     padding:0
//   },
//   container2:{
//     flex: 1,
//     margin:0
//   },
//   colorcode:{
//     marginBottom:20
// },
// item_separator : {
//   marginTop:5,
//   marginBottom:5,
//   height:1,
//   width:"100%",
//   backgroundColor:"#E4E4E4",
//   },
// empty_listing: {
//   display:'flex',
//   justifyContent:'center',
//   alignItems:'center',
//   marginTop:'50%'
// },
// button:{
//   padding:10,
//   borderRadius:50,
//   backgroundColor:COLORS.primary,
//   marginTop:20
// },
// add_apartment_text:{
//   color:COLORS.white
// },
// tabsContainer:{
//   flexDirection: 'row',
//   justifyContent: 'space-around',
//   alignItems: 'center',
//   backgroundColor: '#ffffff',
//   borderBottomWidth: 0,
//   borderBottomColor: "#e9e9e9",
//   elevation:2
// },
// tab:{
//   borderBottomWidth:3,
//   borderBottomColor: COLORS.primary,
//   alignItems:'center',
//   marginTop:10,
//   paddingHorizontal:26
// },
// tab_text:{
//   marginBottom:5,
// },
// navigation: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'flex-end',
//   padding: 20,
//   borderTopWidth: 1,
//   borderTopColor: '#ccc',
// },
// arrowButton: {
//   padding: 10,
// },
// })




// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useEffect, useState, useContext } from 'react';
// import { SafeAreaView, Text, StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import CalendarView from '../../components/shared/CalendarView';
// import COLORS from '../../constants/colors';
// import Upcoming from './ScheduleTabs/Upcoming';
// import Ongoing from './ScheduleTabs/Ongoing';
// import * as Animatable from 'react-native-animatable';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import CompletedJobsList from './ScheduleTabs/CompletedJobList';
// import History from './ScheduleTabs/History';
// import Requests from './ScheduleTabs/Requests';
// import { tSafe } from '../../utils/tSafe'; // added import
// import { get_clean_future_requests } from '../../utils/get_cleaner_future_request';
// import { useRoute } from '@react-navigation/native';


// // Helper function for local date parsing (unchanged)
// const parseLocalDate = (dateStr) => {
//   if (!dateStr || typeof dateStr !== 'string') {
//     return null;
//   }
//   const [year, month, day] = dateStr.split('-').map(Number);
//   return new Date(year, month - 1, day); // local midnight
// };

// export default function Schedules({ navigation }) {
//   const { currentUserId } = useContext(AuthContext);

//   const [openModal, setOpenModal] = useState(false);
//   const [schedules, setSchedules] = useState([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   // const [upcoming_schedules, setUpComingSchedules] = useState([]);
//   // const [ongoing_schedules, setOnGoingSchedules] = useState([]);
//   const [completed_schedules, setCompletedSchedules] = useState([]);
//   const [future_schedules, setFutureSchedules] = useState([]);

//   const [request_schedules, setRequestSchedules] = useState([]);
//   const [upcoming_schedules, setUpComingSchedules] = useState([]);
//   const [ongoing_schedules, setOnGoingSchedules] = useState([]);
//   const [history_schedules, setHistorySchedules] = useState([]);
//   const [cleaning_requests, setCleaningRequests] = useState([]);



// // Inside component
// const route = useRoute();

// useEffect(() => {
//   const initialTab = route.params?.initialTab || 'upcoming';
//   const tabMap = {
//     'requests': 0,
//     'upcoming': 1,
//     'ongoing': 2,
//     'history': 3
//   };
//   setCurrentStep(tabMap[initialTab] || 1);
// }, [route.params?.initialTab]);


  

//   useEffect(() => {
//     fetchSchedules();
//     fetchRequests()
//     // const unsubscribe = navigation.addListener('tabPress', () => {
//     //   fetchSchedules()
//     // });
//     // return unsubscribe; // Cleanup subscription
//   }, [navigation, currentStep]);



//   const fetchRequests = async () => {
//     try {
//       await userService.getMyCleaningRequest(currentUserId).then((response) => {
//         const res = response.data;
//         console.log('Reqeeeeeeeeeeeeeeeust', res[0]);
//         setCleaningRequests(res);
        
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };
// console.log(cleaning_requests)
//   const fetchSchedules = async () => {
//     await userService.getSchedulesAssignedToCleaner(currentUserId)
//       .then(response => {
//         const res = response.data;
      
        
        

//         const requestsSchedules = res.filter(schedule => {
//           const assignment = schedule.assignedTo?.find(
//             cleaner => cleaner.cleanerId === currentUserId
//           );
        
//           const status = assignment?.status?.toLowerCase();
//           return [
//             "pending",
//             "requested",
//             "invited",
//             "pending_acceptance"
//           ].includes(status);
//         });
        
//         const upcomingSchedules = res.filter(schedule => {
//           const assignment = schedule.assignedTo?.find(
//             cleaner => cleaner.cleanerId === currentUserId
//           );
        
//           const status = assignment?.status?.toLowerCase();
//           return [
//             // "accepted",
//             "payment_confirmed",
//             // "scheduled"
//           ].includes(status);
//         });
        
//         const ongoingSchedules = res.filter(schedule => {
//           const assignment = schedule.assignedTo?.find(
//             cleaner => cleaner.cleanerId === currentUserId
//           );
        
//           const status = assignment?.status?.toLowerCase();
//           return [
//             "in_progress",
//             "pending_completion_approval",
//           ].includes(status);
//         });
        
//         const historySchedules = res.filter(schedule => {
//           const assignment = schedule.assignedTo?.find(
//             cleaner => cleaner.cleanerId === currentUserId
//           );
         
//           const status = assignment?.status?.toLowerCase();
//           return [
//             "approved",
//             "completed",
//             "paid",
//             "cancelled",
//             "rejected",
//             "uncompleted",
//             "pending_review"
//           ].includes(status);
        
//         });
        
//         // setRequestSchedules(requestsSchedules);
//         setUpComingSchedules(upcomingSchedules);
//         setOnGoingSchedules(ongoingSchedules);
//         setHistorySchedules(historySchedules);
      
//         // Future dates for calendar view
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

        
//         const futureDates = res
//           .filter(schedule => {
//             const dateStr = schedule?.schedule?.cleaning_date;
//             const scheduleDate = parseLocalDate(dateStr);
//             if (!scheduleDate) return false;
//             const assignment = schedule.assignedTo?.find(
//               cleaner => cleaner.cleanerId === currentUserId
//             );

//             const status = assignment?.status?.toLowerCase();
//             return (
//               scheduleDate > today &&
//               [
//                 "accepted",
//                 "payment_confirmed",
//                 "scheduled"
//               ].includes(status)
//             );
//           })
//           .map(schedule =>
//             parseLocalDate(schedule.schedule.cleaning_date).toDateString()
//           );
//         console.log(futureDates);
//         setFutureSchedules(futureDates);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

  


//   const onRequestSchedule = () => {
//     setCurrentStep(0);
//   };
  
//   const onUpcomingSchedule = () => {
//     setCurrentStep(1);
//   };
  
//   const onOngoingSchedule = () => {
//     setCurrentStep(2);
//   };
  
//   const onHistorySchedule = () => {
//     setCurrentStep(3);
//   };

//   return (
//     <View style={{ flex: 1, margin: 0, marginTop: 0 }}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//       <View style={{ backgroundColor: COLORS.primary }}>
//         <View style={{ margin: 20 }}>
//           <CalendarView
//             title={tSafe('my_schedules', 'My schedules')}
//             openUpcomingTab={onUpcomingSchedule}
//             openOngoingTab={onOngoingSchedule}
//             future_schedule_dates={future_schedules}
//           />
//         </View>
//       </View>

//       <View style={styles.container2}>
//         {/* <View style={styles.tabsContainer}>
//           <TouchableOpacity 
//             style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0" }]} 
//             onPress={() => setCurrentStep(2)}
//           >
//             <MaterialCommunityIcons name="progress-clock" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>{tSafe('requests_1', 'Requests')}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0" }]} 
//             onPress={() => setCurrentStep(2)}
//           >
//             <MaterialCommunityIcons name="progress-clock" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>{tSafe('in_progress', 'In Progress')}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0" }]} 
//             onPress={() => setCurrentStep(1)}
//           >
//             <MaterialCommunityIcons name="calendar-blank" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>{tSafe('up_coming', 'Up Coming')}</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0" }]} 
//             onPress={() => setCurrentStep(3)}
//           >
//             <MaterialCommunityIcons name="history" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
//             <Text style={styles.tab_text}>{tSafe('history', 'History')}</Text>
//           </TouchableOpacity>
//         </View> */}

//         <View style={styles.tabsContainer}>

//           <TouchableOpacity
//             style={[
//               styles.tab,
//               {
//                 borderBottomColor:
//                   currentStep === 0 ? COLORS.primary : "#f0f0f0",
//               },
//             ]}
//             onPress={() => setCurrentStep(0)}
//           >
//             <MaterialCommunityIcons
//               name="email-outline"
//               size={24}
//               color={
//                 currentStep === 0
//                   ? COLORS.primary
//                   : COLORS.gray
//               }
//             />
//             <Text style={styles.tab_text}>
//               {tSafe("requests", "Requests")}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.tab,
//               {
//                 borderBottomColor:
//                   currentStep === 1 ? COLORS.primary : "#f0f0f0",
//               },
//             ]}
//             onPress={() => setCurrentStep(1)}
//           >
//             <MaterialCommunityIcons
//               name="calendar-blank"
//               size={24}
//               color={
//                 currentStep === 1
//                   ? COLORS.primary
//                   : COLORS.gray
//               }
//             />
//             <Text style={styles.tab_text}>
//               {tSafe("up_coming", "Upcoming")}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.tab,
//               {
//                 borderBottomColor:
//                   currentStep === 2 ? COLORS.primary : "#f0f0f0",
//               },
//             ]}
//             onPress={() => setCurrentStep(2)}
//           >
//             <MaterialCommunityIcons
//               name="progress-clock"
//               size={24}
//               color={
//                 currentStep === 2
//                   ? COLORS.primary
//                   : COLORS.gray
//               }
//             />
//             <Text style={styles.tab_text}>
//               {tSafe("in_progress", "In Progress")}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.tab,
//               {
//                 borderBottomColor:
//                   currentStep === 3 ? COLORS.primary : "#f0f0f0",
//               },
//             ]}
//             onPress={() => setCurrentStep(3)}
//           >
//             <MaterialCommunityIcons
//               name="history"
//               size={24}
//               color={
//                 currentStep === 3
//                   ? COLORS.primary
//                   : COLORS.gray
//               }
//             />
//             <Text style={styles.tab_text}>
//               {tSafe("history", "History")}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.container}>
//           {currentStep === 0 && (
//             <Requests requests={cleaning_requests} />
//           )}
//           {currentStep === 1 && (
//             <Upcoming schedules={upcoming_schedules} />
//           )}
//           {currentStep === 2 && (
//             <Ongoing schedules={ongoing_schedules} />
//           )}
//           {currentStep === 3 && (
//             <History schedules={history_schedules} />
//           )}
//         </View>

//         {/* <View style={styles.container}>
//           {currentStep === 1 && <Upcoming schedules={upcoming_schedules} />}
//           {currentStep === 2 && <Ongoing schedules={ongoing_schedules} />}
//           {currentStep === 3 && <History schedules={completed_schedules} />}
          
//         </View> */}
//       </View>

//       <Modal 
//         visible={openModal}
//         animationType="slide"
//         // onRequestClose={onClose} // Handle hardware back button on Android
//       >
//         {/* Modal content can be added later */}
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 0,
//   },
//   container2: {
//     flex: 1,
//     margin: 0,
//   },
//   colorcode: {
//     marginBottom: 20,
//   },
//   item_separator: {
//     marginTop: 5,
//     marginBottom: 5,
//     height: 1,
//     width: "100%",
//     backgroundColor: "#E4E4E4",
//   },
//   empty_listing: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: '50%',
//   },
//   button: {
//     padding: 10,
//     borderRadius: 50,
//     backgroundColor: COLORS.primary,
//     marginTop: 20,
//   },
//   add_apartment_text: {
//     color: COLORS.white,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 0,
//     borderBottomColor: "#e9e9e9",
//     elevation: 2,
//   },
//   tab: {
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.primary,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 16,
//   },
//   tab_text: {
//     marginBottom: 5,
//   },
//   navigation: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//   },
//   arrowButton: {
//     padding: 10,
//   },
// });



// Schedules.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Modal } from 'react-native';
import CalendarView from '../../components/shared/CalendarView';
import COLORS from '../../constants/colors';
import Upcoming from './ScheduleTabs/Upcoming';
import Ongoing from './ScheduleTabs/Ongoing';
import History from './ScheduleTabs/History';
import Requests from './ScheduleTabs/Requests';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { tSafe } from '../../utils/tSafe';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function Schedules({ navigation }) {
  const { currentUserId } = useContext(AuthContext);
  const route = useRoute();

  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [future_schedules, setFutureSchedules] = useState([]);
  const [upcoming_schedules, setUpComingSchedules] = useState([]);
  const [ongoing_schedules, setOnGoingSchedules] = useState([]);
  const [history_schedules, setHistorySchedules] = useState([]);
  const [cleaning_requests, setCleaningRequests] = useState([]);

  // Set initial tab from navigation params
  useEffect(() => {
    const initialTab = route.params?.initialTab || 'upcoming';
    const tabMap = { 'requests': 0, 'upcoming': 1, 'ongoing': 2, 'history': 3 };
    setCurrentStep(tabMap[initialTab] || 1);
  }, [route.params?.initialTab]);

  useEffect(() => {
    fetchSchedules();
    fetchRequests();
  }, [navigation]);

   // Run when screen focuses
   useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const fetchRequests = async () => {
    try {
      const res = await userService.getMyCleaningRequest(currentUserId);
      console.log("Requets---Y", res.data)
      setCleaningRequests(res.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await userService.getSchedulesAssignedToCleaner(currentUserId);
      const data = res.data;

      // ─── Requests ────────────────────────────────────────────────
      const requestsSchedules = data.filter(schedule => {
        const assignment = schedule.assignedTo?.find(c => c.cleanerId === currentUserId);
        const status = assignment?.status?.toLowerCase();
        return ["pending", "requested", "invited", "pending_acceptance"].includes(status);
      });

      // ─── Upcoming ────────────────────────────────────────────────
      const upcomingSchedules = data.filter(schedule => {
        const assignment = schedule.assignedTo?.find(c => c.cleanerId === currentUserId);
        const status = assignment?.status?.toLowerCase();
        return ["payment_confirmed"].includes(status);
      });

      // ─── Ongoing ─────────────────────────────────────────────────
      const ongoingSchedules = data.filter(schedule => {
        const assignment = schedule.assignedTo?.find(c => c.cleanerId === currentUserId);
        const status = assignment?.status?.toLowerCase();
        return ["in_progress", "pending_completion_approval"].includes(status);
      });

      // ✅ ─── History ─────────────────────────────────────────────────
      // ONLY: completed, uncompleted, pending_review
      const historySchedules = data.filter(schedule => {
        const assignment = schedule.assignedTo?.find(c => c.cleanerId === currentUserId);
        const status = assignment?.status?.toLowerCase();
        return ["approved", "completed", "uncompleted", "pending_review", "payment_released"].includes(status);
      });

      setUpComingSchedules(upcomingSchedules);
      setOnGoingSchedules(ongoingSchedules);
      setHistorySchedules(historySchedules);

      // ─── Calendar future dates ──────────────────────────────────
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDates = data
        .filter(schedule => {
          const dateStr = schedule?.schedule?.cleaning_date;
          const scheduleDate = parseLocalDate(dateStr);
          if (!scheduleDate) return false;
          const assignment = schedule.assignedTo?.find(c => c.cleanerId === currentUserId);
          const status = assignment?.status?.toLowerCase();
          return scheduleDate > today && ["accepted", "payment_confirmed", "scheduled"].includes(status);
        })
        .map(schedule => parseLocalDate(schedule.schedule.cleaning_date).toDateString());
      setFutureSchedules(futureDates);

    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const onRequestSchedule = () => setCurrentStep(0);
  const onUpcomingSchedule = () => setCurrentStep(1);
  const onOngoingSchedule = () => setCurrentStep(2);
  const onHistorySchedule = () => setCurrentStep(3);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={{ backgroundColor: COLORS.primary }}>
        <View style={{ margin: 20 }}>
          <CalendarView
            title={tSafe('my_schedules', 'My schedules')}
            openUpcomingTab={onUpcomingSchedule}
            openOngoingTab={onOngoingSchedule}
            future_schedule_dates={future_schedules}
          />
        </View>
      </View>

      <View style={styles.container2}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, { borderBottomColor: currentStep === 0 ? COLORS.primary : "#f0f0f0" }]}
            onPress={onRequestSchedule}
          >
            <MaterialCommunityIcons name="email-outline" size={24} color={currentStep === 0 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>{tSafe("requests", "Requests")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, { borderBottomColor: currentStep === 1 ? COLORS.primary : "#f0f0f0" }]}
            onPress={onUpcomingSchedule}
          >
            <MaterialCommunityIcons name="calendar-blank" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>{tSafe("up_coming", "Upcoming")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, { borderBottomColor: currentStep === 2 ? COLORS.primary : "#f0f0f0" }]}
            onPress={onOngoingSchedule}
          >
            <MaterialCommunityIcons name="progress-clock" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>{tSafe("in_progress", "In Progress")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, { borderBottomColor: currentStep === 3 ? COLORS.primary : "#f0f0f0" }]}
            onPress={onHistorySchedule}
          >
            <MaterialCommunityIcons name="history" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
            <Text style={styles.tab_text}>{tSafe("history", "History")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          {currentStep === 0 && <Requests requests={cleaning_requests} />}
          {currentStep === 1 && <Upcoming schedules={upcoming_schedules} />}
          {currentStep === 2 && <Ongoing schedules={ongoing_schedules} />}
          {currentStep === 3 && <History schedules={history_schedules} />}
        </View>
      </View>

      <Modal visible={openModal} animationType="slide" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 0 },
  container2: { flex: 1, margin: 0 },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
    elevation: 2,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  tab_text: { marginBottom: 5, fontSize:14 },
});