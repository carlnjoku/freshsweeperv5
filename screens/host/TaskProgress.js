// import React, { useContext, useEffect,useState } from 'react';
// import { SafeAreaView, Text, StyleSheet, StatusBar, Linking, Button, FlatList, ScrollView, Image, View, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { Avatar } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import moment from 'moment';
// import Modal from 'react-native-modal';

// import BeforePhoto from './TaskTaps/BeforePhoto';
// import AfterPhoto from './TaskTaps/AfterPhoto';
// import TaskChecklist from './TaskTaps/TaskCheckList';
// import { AnimatedCircularProgress } from 'react-native-circular-progress';
// import CleanerProfile from './CleanerProfile';
// import ViewCleanerProfile from './ViewCleanerProfile';
// import { useNavigation } from '@react-navigation/native'
// import Incident from './TaskTaps/Incident';
// import CircleIconButton1 from '../../components/shared/CircleButton1';

// const { width, height } = Dimensions.get('window');

// const TaskProgress = ({route}) => {
//   const {currentUserId, fbaseUser, currentUser} = useContext(AuthContext)
//   const[openModal, setOpenModal] = useState(false)
//   const[selectedCleanerId, setSelectedCleanerId] = useState("")
//   const[visible, setVisible] = React.useState(false);
//   const[schedule, setSchedule] = React.useState({});

//   const navigation = useNavigation()
//   const{scheduleId} = route.params

//   const [currentStep, setCurrentStep] = useState(1);
//   const [progress, setProgress] = useState(0);
    
//   const startTime = moment(schedule?.schedule?.cleaning_time, "hh:mm A");
//   const totalEstimatedTime = 120 * schedule?.schedule?.total_cleaning_time * 1000;

//   const calculateEndTime = (startTime, durationInMinutes) => {
//     const endTime = moment(startTime, 'hh:mm A').add(durationInMinutes, 'minutes');
//     return endTime.format('hh:mm A');
//   };
  
//   const durationInMinutes = schedule?.schedule?.total_cleaning_time;
//   const endTime = calculateEndTime(startTime, durationInMinutes);

//   const calculateProgress = () => {
//     const now = moment();
//     const elapsedTime = now.diff(startTime);
//     const percentage = Math.max(0, Math.min((elapsedTime / totalEstimatedTime) * 100, 100)); 
//     setProgress(percentage);
//   };

//   const fetchSchedule = async() => {
//     try {
//       const response = await userService.getScheduleById(scheduleId);
//       setSchedule(response.data);
//     } catch (error) {
//       console.log(error);
//       alert('Error fetching schedule');
//     }
//   }

//   useEffect(() => {
//     const interval = setInterval(() => {
//       calculateProgress();
//     }, 5000);

//     fetchSchedule()
//     return () => clearInterval(interval);
//   }, []);

//   const handleClosePreview = () => {
//     setOpenModal(false)
//   }

//   const handleOpenPreview = (cleaner_id) => {
//     setSelectedCleanerId(cleaner_id)
//     setOpenModal(true)
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor:COLORS.white }}>
//       {/* Header Content */}
//       <View style={styles.container0}>
//         <View style={styles.centerContent}>
//           <AntDesign name="home" size={60} color={COLORS.gray}/> 
//           <Text bold style={styles.headerText}>{schedule.schedule?.apartment_name}</Text>
//           <Text style={{color:COLORS.gray, marginBottom:5, marginLeft:-5}}> 
//             <MaterialCommunityIcons name="map-marker" size={16} />
//             {schedule.schedule?.address}
//           </Text>
//         </View>

//         <View style={styles.timingContent}>
//           <Text style={styles.timing}>
//             {moment(schedule?.schedule?.cleaning_date).format('ddd MMM D')} • {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//           </Text>
//         </View>

//         <View style={styles.cleanerProgress}>
//           {/* <View style={styles.cleanersContainer}>
//             <TouchableOpacity onPress={()=>handleOpenPreview(schedule.assignedTo?.cleanerId)} style={{flexDirection:'column', alignItems:'center'}}> 
//               <Avatar.Image 
//                 size={50} 
//                 source={{ uri: schedule.assignedTo?.avatar }} 
//                 style={{marginLeft: 10 }}
//               />
//               <Text style={styles.viewProfileText}>View Profile</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View>
//             <CircleIconButton1
//               iconName="calendar"
//               iconColor={COLORS.purple}
//               buttonSize={50}
//               radiusSise={25}
//               iconSize={26}
//               title={moment(schedule?.schedule?.cleaning_date).format('ddd MMM D')}
//               title_color={COLORS.gray}
//               border_color={COLORS.light_purple_2}
//               background_color={COLORS.light_purple_2}
//             />
//           </View>

//           <View style={styles.progressContainer}>
//             <CircleIconButton1
//               iconName="clock-outline"
//               iconColor={COLORS.purple}
//               buttonSize={50}
//               radiusSise={25}
//               iconSize={26}
//               title={moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//               title_color={COLORS.gray}
//               border_color={COLORS.light_pink_1}
//               background_color={COLORS.light_pink_1}
//             />
//           </View> */}
          
            

//         </View>
        
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
//           <MaterialCommunityIcons name="camera" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
//           <Text style={styles.tab_text}>Before Photos </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
//           <MaterialCommunityIcons name="camera-flip" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//           <Text style={styles.tab_text}>After Photos</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
//           <MaterialCommunityIcons name="format-list-checks" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
//           <Text style={styles.tab_text}>Incidents</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tab Content - FIXED: Remove flex:1 from container */}
//       <View style={styles.tabContentContainer}>
//         {currentStep === 1 && <BeforePhoto scheduleId={scheduleId} schedule={schedule} />}
//         {currentStep === 2 && <AfterPhoto scheduleId={scheduleId} schedule={schedule} />}
//         {currentStep === 3 && <Incident scheduleId={scheduleId} schedule={schedule} />}
//       </View>

//       <Modal 
//         isVisible={openModal} 
//         onSwipeComplete={() => setVisible(false)} 
//         swipeDirection="down"
//         onBackdropPress={() => setVisible(false)}
//         style={styles.modal}
//         propagateSwipe={false}
//         backdropColor="black"
//         backdropOpacity={0.1}
//         useNativeDriverForBackdrop={true}
//       >
//         <View style={styles.modalContent}>
//           <ViewCleanerProfile 
//             schedule = {schedule} 
//             cleanerId={selectedCleanerId}
//             close_modal={handleClosePreview}
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // Replace the container style that was causing the issue
//   tabContentContainer: {
//     flex: 1, // This allows the tab content to take remaining space
//     backgroundColor: COLORS.white
//   },
  
//   // Remove or modify the old container style
//   // container: {
//   //   flex:1, 
//   //   margin:10,
//   //   backgroundColor:COLORS.white
//   // },
  
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 0,
//     borderBottomColor: "#e9e9e9",
//     elevation: 2
//   },
//   tab: {
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.primary,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 26
//   },
//   tab_text: {
//     marginBottom: 5,
//   },
//   container0: {
//     marginTop: 0,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 15,
//   },
//   centerContent: {
//     alignItems: 'center',
//     marginBottom: 10
//   },
//   timingContent: {
//     alignItems: 'center',
//     marginBottom: 10
//   },
//   cleanerProgress: {
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   },
//   cleanersContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   progressContainer: {
//     flexDirection: 'column',
//     alignItems: 'center'
//   },
//   viewProfileText: {
//     fontSize: 12,
//     color: COLORS.primary,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     width: width,
//     height: height * 0.65,
//     backgroundColor: 'white',
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     padding: 0,
//     alignItems: 'center',
//   },
//   modal_header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     paddingBottom: 10
//   },
//   timing: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
// });

// export default TaskProgress;









// import React, { useContext, useEffect,useState } from 'react';
// import { SafeAreaView, Text, StyleSheet, StatusBar, Linking, Button, FlatList, ScrollView, Image, View, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { Avatar } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import moment from 'moment';
// import Modal from 'react-native-modal';

// import BeforePhoto from './TaskTaps/BeforePhoto';
// import AfterPhoto from './TaskTaps/AfterPhoto';
// import TaskChecklist from './TaskTaps/TaskCheckList';
// import { AnimatedCircularProgress } from 'react-native-circular-progress';
// import CleanerProfile from './CleanerProfile';
// import ViewCleanerProfile from './ViewCleanerProfile';
// import { useNavigation } from '@react-navigation/native'
// import Incident from './TaskTaps/Incident';
// import CircleIconButton1 from '../../components/shared/CircleButton1';

// const { width, height } = Dimensions.get('window');

// const TaskProgress = ({route}) => {
//   const {currentUserId, fbaseUser, currentUser} = useContext(AuthContext)
//   const[openModal, setOpenModal] = useState(false)
//   const[selectedCleanerId, setSelectedCleanerId] = useState("")
//   const[visible, setVisible] = React.useState(false);
//   const[schedule, setSchedule] = React.useState({});

//   const navigation = useNavigation()
//   const{scheduleId, mode} = route.params

//   const [currentStep, setCurrentStep] = useState(1);
//   const [progress, setProgress] = useState(0);
    
//   const startTime = moment(schedule?.schedule?.cleaning_time, "hh:mm A");
//   const totalEstimatedTime = 120 * schedule?.schedule?.total_cleaning_time * 1000;

//   const calculateEndTime = (startTime, durationInMinutes) => {
//     const endTime = moment(startTime, 'hh:mm A').add(durationInMinutes, 'minutes');
//     return endTime.format('hh:mm A');
//   };
  
//   const durationInMinutes = schedule?.schedule?.total_cleaning_time;
//   const endTime = calculateEndTime(startTime, durationInMinutes);

//   const calculateProgress = () => {
//     const now = moment();
//     const elapsedTime = now.diff(startTime);
  
//     const percentage = Math.max(0, Math.min((elapsedTime / totalEstimatedTime) * 100, 100)); 
//     setProgress(percentage);
//   };

//   const fetchSchedule = async() => {
//     try {
//       const response = await userService.getScheduleById(scheduleId);
//       setSchedule(response.data);
//     } catch (error) {
//       console.log(error);
//       alert('Error fetching schedule');
//     }
//   }

//   // Set header title based on mode
//   useEffect(() => {
//     const headerTitle = mode === "in_progress" ? "In-Progress" : "Completed Project";
//     navigation.setOptions({
//       title: headerTitle,
//       headerStyle: {
//         backgroundColor: mode === "in_progress" ? COLORS.white : COLORS.white,
//       },
//       headerTintColor: COLORS.gray,
//     });
//   }, [navigation, mode]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       calculateProgress();
//     }, 5000);

//     fetchSchedule()
//     return () => clearInterval(interval);
//   }, []);

//   const handleClosePreview = () => {
//     setOpenModal(false)
//   }

//   const handleOpenPreview = (cleaner_id) => {
//     setSelectedCleanerId(cleaner_id)
//     setOpenModal(true)
//   }

//   // Get status badge style based on mode
//   const getStatusBadgeStyle = () => {
//     if (mode === "in_progress") {
//       return {
//         backgroundColor: COLORS.warning,
//         color: COLORS.dark
//       };
//     } else {
//       return {
//         backgroundColor: COLORS.success,
//         color: '#fff'
//       };
//     }
//   };

//   // Get status text based on mode
//   const getStatusText = () => {
//     return mode === "in_progress" ? "In Progress" : "Completed";
//   };

//   // Get status icon based on mode
//   const getStatusIcon = () => {
//     return mode === "in_progress" ? "clock-outline" : "check-circle-outline";
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor:COLORS.white }}>
//       {/* Header Content */}
//       <View style={styles.container0}>
//         <View style={styles.headerTop}>
//           <View style={styles.statusBadge}>
//             <MaterialCommunityIcons 
//               name={getStatusIcon()} 
//               size={16} 
//               color={getStatusBadgeStyle().color} 
//             />
//             <Text style={[styles.statusText, { color: getStatusBadgeStyle().color }]}>
//               {getStatusText()}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.centerContent}>
//           <AntDesign name="home" size={60} color={COLORS.gray}/> 
//           <Text bold style={styles.headerText}>{schedule.schedule?.apartment_name}</Text>
//           <Text style={{color:COLORS.gray, marginBottom:5, marginLeft:-5}}> 
//             <MaterialCommunityIcons name="map-marker" size={16} />
//             {schedule.schedule?.address}
//           </Text>
//         </View>

//         <View style={styles.timingContent}>
//           <Text style={styles.timing}>
//             {moment(schedule?.schedule?.cleaning_date).format('ddd MMM D')} • {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//           </Text>
//         </View>

//         {mode === "in_progress" && (
//           <View style={styles.progressIndicator}>
//             <AnimatedCircularProgress
//               size={80}
//               width={5}
//               fill={progress}
//               tintColor={COLORS.primary}
//               backgroundColor={COLORS.light_gray}
//               rotation={0}
//             >
//               {(fill) => (
//                 <Text style={styles.progressText}>
//                   {Math.round(fill)}%
//                 </Text>
//               )}
//             </AnimatedCircularProgress>
//             <View style={styles.progressLabels}>
//               <Text style={styles.progressLabel}>Start: {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
//               <Text style={styles.progressLabel}>End: {endTime}</Text>
//             </View>
//           </View>
//         )}

//         {mode === "completed" && (
//           <View style={styles.completedInfo}>
//             <View style={styles.completedStat}>
//               <MaterialCommunityIcons name="check-all" size={20} color={COLORS.success} />
//               <Text style={styles.completedStatText}>
//                 All tasks completed
//               </Text>
//             </View>
//             <Text style={styles.completedDate}>
//               Completed on: {schedule?.completed_on ? moment(schedule.completed_on).format('MMM DD, YYYY [at] h:mm A') : 'N/A'}
//             </Text>
//           </View>
//         )}
        
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
//           <MaterialCommunityIcons name="camera" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
//           <Text style={styles.tab_text}>Before Photos </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
//           <MaterialCommunityIcons name="camera-flip" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//           <Text style={styles.tab_text}>After Photos</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
//           <MaterialCommunityIcons name="format-list-checks" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
//           <Text style={styles.tab_text}>Incidents</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tab Content */}
//       <View style={styles.tabContentContainer}>
//         {currentStep === 1 && <BeforePhoto scheduleId={scheduleId} schedule={schedule} mode={mode} />}
//         {currentStep === 2 && <AfterPhoto scheduleId={scheduleId} schedule={schedule} mode={mode} />}
//         {currentStep === 3 && <Incident scheduleId={scheduleId} schedule={schedule} mode={mode} />}
//       </View>

//       <Modal 
//         isVisible={openModal} 
//         onSwipeComplete={() => setVisible(false)} 
//         swipeDirection="down"
//         onBackdropPress={() => setVisible(false)}
//         style={styles.modal}
//         propagateSwipe={false}
//         backdropColor="black"
//         backdropOpacity={0.1}
//         useNativeDriverForBackdrop={true}
//       >
//         <View style={styles.modalContent}>
//           <ViewCleanerProfile 
//             schedule = {schedule} 
//             cleanerId={selectedCleanerId}
//             close_modal={handleClosePreview}
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   tabContentContainer: {
//     flex: 1,
//     backgroundColor: COLORS.white
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 0,
//     borderBottomColor: "#e9e9e9",
//     elevation: 2
//   },
//   tab: {
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.primary,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 26
//   },
//   tab_text: {
//     marginBottom: 5,
//   },
//   container0: {
//     marginTop: 0,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 15,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginBottom: 10,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: COLORS.lightGray, // Default, will be overridden
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   centerContent: {
//     alignItems: 'center',
//     marginBottom: 10
//   },
//   timingContent: {
//     alignItems: 'center',
//     marginBottom: 10
//   },
//   progressIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     marginTop: 10,
//   },
//   progressText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//   },
//   progressLabels: {
//     flex: 1,
//     marginLeft: 20,
//   },
//   progressLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   completedInfo: {
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: COLORS.lightSuccess,
//     borderRadius: 8,
//   },
//   completedStat: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   completedStatText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.success,
//     marginLeft: 8,
//   },
//   completedDate: {
//     fontSize: 12,
//     color: COLORS.gray,
//   },
//   cleanerProgress: {
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   },
//   cleanersContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   progressContainer: {
//     flexDirection: 'column',
//     alignItems: 'center'
//   },
//   viewProfileText: {
//     fontSize: 12,
//     color: COLORS.primary,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     width: width,
//     height: height * 0.65,
//     backgroundColor: 'white',
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     padding: 0,
//     alignItems: 'center',
//   },
//   modal_header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     paddingBottom: 10
//   },
//   timing: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
// });

// export default TaskProgress;



import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Linking, 
  Button, 
  FlatList, 
  ScrollView, 
  Image, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { Avatar } from 'react-native-paper';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import Modal from 'react-native-modal';

import BeforePhoto from './TaskTaps/BeforePhoto';
import AfterPhoto from './TaskTaps/AfterPhoto';
import TaskChecklist from './TaskTaps/TaskCheckList';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import CleanerProfile from './CleanerProfile';
import ViewCleanerProfile from './ViewCleanerProfile';
import { useNavigation } from '@react-navigation/native'
import Incident from './TaskTaps/Incident';
import CircleIconButton1 from '../../components/shared/CircleButton1';

const { width, height } = Dimensions.get('window');

const TaskProgress = ({route}) => {
  const {currentUserId, fbaseUser, currentUser} = useContext(AuthContext)
  const[openModal, setOpenModal] = useState(false)
  const[selectedCleanerId, setSelectedCleanerId] = useState("")
  const[visible, setVisible] = React.useState(false);
  const[schedule, setSchedule] = React.useState({});

  const navigation = useNavigation()
  const{scheduleId, mode} = route.params

  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
    
  const startTime = moment(schedule?.schedule?.cleaning_time, "hh:mm A");
  const totalEstimatedTime = 120 * schedule?.schedule?.total_cleaning_time * 1000;

  const calculateEndTime = (startTime, durationInMinutes) => {
    const endTime = moment(startTime, 'hh:mm A').add(durationInMinutes, 'minutes');
    return endTime.format('hh:mm A');
  };
  
  const durationInMinutes = schedule?.schedule?.total_cleaning_time;
  const endTime = calculateEndTime(startTime, durationInMinutes);

  const calculateProgress = () => {
    const now = moment();
    const elapsedTime = now.diff(startTime);
  
    const percentage = Math.max(0, Math.min((elapsedTime / totalEstimatedTime) * 100, 100)); 
    setProgress(percentage);
  };

  const fetchSchedule = async() => {
    try {
      const response = await userService.getScheduleById(scheduleId);
      setSchedule(response.data);
    } catch (error) {
      console.log(error);
      alert('Error fetching schedule');
    }
  }

  // Set header title based on mode
  useEffect(() => {
    const headerTitle = mode === "in_progress" ? "In-Progress" : "Completed Project";
    navigation.setOptions({
      title: headerTitle,
      headerStyle: {
        backgroundColor: mode === "in_progress" ? COLORS.white : COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
      },
      
      headerTintColor: COLORS.gray,
    });
  }, [navigation, mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      calculateProgress();
    }, 5000);

    fetchSchedule()
    return () => clearInterval(interval);
  }, []);

  const handleClosePreview = () => {
    setOpenModal(false)
  }

  const handleOpenPreview = (cleaner_id) => {
    setSelectedCleanerId(cleaner_id)
    setOpenModal(true)
  }

  // Get status badge style based on mode
  const getStatusBadgeStyle = () => {
    if (mode === "in_progress") {
      return {
        backgroundColor: COLORS.warning,
        color: COLORS.dark
      };
    } else {
      return {
        backgroundColor: COLORS.success,
        color: '#fff'
      };
    }
  };

  // Get status text based on mode
  const getStatusText = () => {
    return mode === "in_progress" ? "In Progress" : "Completed";
  };

  // Get status icon based on mode
  const getStatusIcon = () => {
    return mode === "in_progress" ? "clock-outline" : "check-circle-outline";
  };

  return (
    <View style={{ flex: 1, backgroundColor:COLORS.white }}>
      {/* Compact Header Content */}
      <View style={styles.compactHeader}>
        {/* Top Row: Status + Progress/Completed Info */}
        {/* <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeStyle().backgroundColor }]}>
            <MaterialCommunityIcons 
              name={getStatusIcon()} 
              size={14} 
              color={getStatusBadgeStyle().color} 
            />
            <Text style={[styles.statusText, { color: getStatusBadgeStyle().color }]}>
              {getStatusText()}
            </Text>
          </View>

          {mode === "in_progress" && (
            <View style={styles.progressCompact}>
              <AnimatedCircularProgress
                size={40}
                width={4}
                fill={progress}
                tintColor={COLORS.primary}
                backgroundColor={COLORS.light_gray}
                rotation={0}
              >
                {(fill) => (
                  <Text style={styles.progressTextCompact}>
                    {Math.round(fill)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          )}

          {mode === "completed" && (
            <View style={styles.completedCompact}>
              <MaterialCommunityIcons name="check-all" size={16} color={COLORS.success} />
              <Text style={styles.completedTextCompact}>Completed</Text>
            </View>
          )}
        </View> */}

        {/* Middle Row: Property Info */}
        <View style={styles.propertyRow}>
          {/* <View style={styles.propertyIcon}>
            <AntDesign name="home" size={20} color={COLORS.primary}/>
          </View> */}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {schedule.schedule?.apartment_name}
            </Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
              <Text style={styles.addressText} numberOfLines={1}>
                {schedule.schedule?.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Row: Timing Info */}
        <View style={styles.timingRow}>
          <View style={styles.timingItem}>
            <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} />
            <Text style={styles.timingText}>
              {moment(schedule?.schedule?.cleaning_date).format('MMM D')}
            </Text>
          </View>
          
          <View style={styles.timingSeparator} />
          
          <View style={styles.timingItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.gray} />
            <Text style={styles.timingText}>
              {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
            </Text>
          </View>

          {mode === "in_progress" && (
            <>
              <View style={styles.timingSeparator} />
              <View style={styles.timingItem}>
                <MaterialCommunityIcons name="timer-sand" size={14} color={COLORS.gray} />
                <Text style={styles.timingText}>
                  Ends: {endTime}
                </Text>
              </View>
            </>
          )}

          {mode === "completed" && schedule?.completed_on && (
            <>
              <View style={styles.timingSeparator} />
              <View style={styles.timingItem}>
                <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
                <Text style={styles.timingText}>
                  {moment(schedule.completed_on).format('MMM D')}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            { 
              borderBottomColor: currentStep === 1 ? COLORS.primary : "#f0f0f0",
              backgroundColor: currentStep === 1 ? COLORS.lightPrimary : 'transparent'
            }
          ]} 
          onPress={() => setCurrentStep(1)}
        >
          <MaterialCommunityIcons 
            name="camera" 
            size={20} 
            color={currentStep === 1 ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[
            styles.tab_text,
            { color: currentStep === 1 ? COLORS.primary : COLORS.gray }
          ]}>
            Before
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            { 
              borderBottomColor: currentStep === 2 ? COLORS.primary : "#f0f0f0",
              backgroundColor: currentStep === 2 ? COLORS.lightPrimary : 'transparent'
            }
          ]} 
          onPress={() => setCurrentStep(2)}
        >
          <MaterialCommunityIcons 
            name="camera-flip" 
            size={20} 
            color={currentStep === 2 ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[
            styles.tab_text,
            { color: currentStep === 2 ? COLORS.primary : COLORS.gray }
          ]}>
            After
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            { 
              borderBottomColor: currentStep === 3 ? COLORS.primary : "#f0f0f0",
              backgroundColor: currentStep === 3 ? COLORS.lightPrimary : 'transparent'
            }
          ]} 
          onPress={() => setCurrentStep(3)}
        >
          <MaterialCommunityIcons 
            name="format-list-checks" 
            size={20} 
            color={currentStep === 3 ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[
            styles.tab_text,
            { color: currentStep === 3 ? COLORS.primary : COLORS.gray }
          ]}>
            Incidents
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {currentStep === 1 && <BeforePhoto scheduleId={scheduleId} schedule={schedule} mode={mode} />}
        {currentStep === 2 && <AfterPhoto scheduleId={scheduleId} schedule={schedule} mode={mode} />}
        {currentStep === 3 && <Incident scheduleId={scheduleId} schedule={schedule} mode={mode} />}
      </View>

      <Modal 
        isVisible={openModal} 
        onSwipeComplete={() => setVisible(false)} 
        swipeDirection="down"
        onBackdropPress={() => setVisible(false)}
        style={styles.modal}
        propagateSwipe={false}
        backdropColor="black"
        backdropOpacity={0.1}
        useNativeDriverForBackdrop={true}
      >
        <View style={styles.modalContent}>
          <ViewCleanerProfile 
            schedule = {schedule} 
            cleanerId={selectedCleanerId}
            close_modal={handleClosePreview}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // tabContentContainer: {
  //   flex: 1,
  //   backgroundColor: COLORS.white
  // },
  // tabsContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   backgroundColor: '#ffffff',
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#e9e9e9",
  //   elevation: 1,
  //   paddingVertical: 8,
  // },
  // tab: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 16,
  //   paddingVertical: 8,
  //   borderRadius: 20,
  //   borderBottomWidth: 2,
  // },
  // tab_text: {
  //   fontWeight: '600',
  //   marginLeft: 6,
  // },

    tabContentContainer: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
    borderBottomColor: "#e9e9e9",
    elevation: 2
  },
  tab: {
        borderBottomWidth: 3,
        borderBottomColor: COLORS.primary,
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 26
      },
      tab_text: {
        marginBottom: 5,
      },
  // Compact Header Styles
  compactHeader: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressCompact: {
    alignItems: 'center',
  },
  progressTextCompact: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  completedCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightSuccess,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyIcon: {
    marginRight: 10,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
    flex: 1,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'left',
  },
  timingSeparator: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.lightGray,
  },
  timingText: {
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: width,
    height: height * 0.65,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 0,
    alignItems: 'center',
  },
});

export default TaskProgress;

