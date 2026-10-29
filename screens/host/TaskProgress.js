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



// import React, { useContext, useEffect, useState, useRef } from 'react';
// import { 
//   SafeAreaView, 
//   Text, 
//   StyleSheet, 
//   StatusBar, 
//   Linking, 
//   Button, 
//   FlatList, 
//   ScrollView, 
//   Image, 
//   View, 
//   Dimensions, 
//   TouchableOpacity, 
//   ActivityIndicator
// } from 'react-native';
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
//         borderBottomWidth: 1,
//         borderBottomColor: '#E5E5EA',
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
//       {/* Compact Header Content */}
//       <View style={styles.compactHeader}>
//         {/* Top Row: Status + Progress/Completed Info */}
//         {/* <View style={styles.topRow}>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeStyle().backgroundColor }]}>
//             <MaterialCommunityIcons 
//               name={getStatusIcon()} 
//               size={14} 
//               color={getStatusBadgeStyle().color} 
//             />
//             <Text style={[styles.statusText, { color: getStatusBadgeStyle().color }]}>
//               {getStatusText()}
//             </Text>
//           </View>

//           {mode === "in_progress" && (
//             <View style={styles.progressCompact}>
//               <AnimatedCircularProgress
//                 size={40}
//                 width={4}
//                 fill={progress}
//                 tintColor={COLORS.primary}
//                 backgroundColor={COLORS.light_gray}
//                 rotation={0}
//               >
//                 {(fill) => (
//                   <Text style={styles.progressTextCompact}>
//                     {Math.round(fill)}%
//                   </Text>
//                 )}
//               </AnimatedCircularProgress>
//             </View>
//           )}

//           {mode === "completed" && (
//             <View style={styles.completedCompact}>
//               <MaterialCommunityIcons name="check-all" size={16} color={COLORS.success} />
//               <Text style={styles.completedTextCompact}>Completed</Text>
//             </View>
//           )}
//         </View> */}

//         {/* Middle Row: Property Info */}
//         <View style={styles.propertyRow}>
//           {/* <View style={styles.propertyIcon}>
//             <AntDesign name="home" size={20} color={COLORS.primary}/>
//           </View> */}
//           <View style={styles.propertyInfo}>
//             <Text style={styles.propertyName} numberOfLines={1}>
//               {schedule.schedule?.apartment_name}
//             </Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
//               <Text style={styles.addressText} numberOfLines={1}>
//                 {schedule.schedule?.address}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Bottom Row: Timing Info */}
//         <View style={styles.timingRow}>
//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_date).format('MMM D')}
//             </Text>
//           </View>
          
//           <View style={styles.timingSeparator} />
          
//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>

//           {mode === "in_progress" && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="timer-sand" size={14} color={COLORS.gray} />
//                 <Text style={styles.timingText}>
//                   Ends: {endTime}
//                 </Text>
//               </View>
//             </>
//           )}

//           {mode === "completed" && schedule?.completed_on && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
//                 <Text style={styles.timingText}>
//                   {moment(schedule.completed_on).format('MMM D')}
//                 </Text>
//               </View>
//             </>
//           )}
//         </View>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             { 
//               borderBottomColor: currentStep === 1 ? COLORS.primary : "#f0f0f0",
//               backgroundColor: currentStep === 1 ? COLORS.lightPrimary : 'transparent'
//             }
//           ]} 
//           onPress={() => setCurrentStep(1)}
//         >
//           <MaterialCommunityIcons 
//             name="camera" 
//             size={20} 
//             color={currentStep === 1 ? COLORS.primary : COLORS.gray} 
//           />
//           <Text style={[
//             styles.tab_text,
//             { color: currentStep === 1 ? COLORS.primary : COLORS.gray }
//           ]}>
//             Before
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             { 
//               borderBottomColor: currentStep === 2 ? COLORS.primary : "#f0f0f0",
//               backgroundColor: currentStep === 2 ? COLORS.lightPrimary : 'transparent'
//             }
//           ]} 
//           onPress={() => setCurrentStep(2)}
//         >
//           <MaterialCommunityIcons 
//             name="camera-flip" 
//             size={20} 
//             color={currentStep === 2 ? COLORS.primary : COLORS.gray} 
//           />
//           <Text style={[
//             styles.tab_text,
//             { color: currentStep === 2 ? COLORS.primary : COLORS.gray }
//           ]}>
//             After
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             { 
//               borderBottomColor: currentStep === 3 ? COLORS.primary : "#f0f0f0",
//               backgroundColor: currentStep === 3 ? COLORS.lightPrimary : 'transparent'
//             }
//           ]} 
//           onPress={() => setCurrentStep(3)}
//         >
//           <MaterialCommunityIcons 
//             name="format-list-checks" 
//             size={20} 
//             color={currentStep === 3 ? COLORS.primary : COLORS.gray} 
//           />
//           <Text style={[
//             styles.tab_text,
//             { color: currentStep === 3 ? COLORS.primary : COLORS.gray }
//           ]}>
//             Incidents
//           </Text>
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
//   // tabContentContainer: {
//   //   flex: 1,
//   //   backgroundColor: COLORS.white
//   // },
//   // tabsContainer: {
//   //   flexDirection: 'row',
//   //   justifyContent: 'space-around',
//   //   alignItems: 'center',
//   //   backgroundColor: '#ffffff',
//   //   borderBottomWidth: 1,
//   //   borderBottomColor: "#e9e9e9",
//   //   elevation: 1,
//   //   paddingVertical: 8,
//   // },
//   // tab: {
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   paddingHorizontal: 16,
//   //   paddingVertical: 8,
//   //   borderRadius: 20,
//   //   borderBottomWidth: 2,
//   // },
//   // tab_text: {
//   //   fontWeight: '600',
//   //   marginLeft: 6,
//   // },

//     tabContentContainer: {
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
//         borderBottomWidth: 3,
//         borderBottomColor: COLORS.primary,
//         alignItems: 'center',
//         marginTop: 10,
//         paddingHorizontal: 26
//       },
//       tab_text: {
//         marginBottom: 5,
//       },
//   // Compact Header Styles
//   compactHeader: {
//     backgroundColor: COLORS.white,
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     elevation: 1,
//   },
//   topRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   progressCompact: {
//     alignItems: 'center',
//   },
//   progressTextCompact: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//   },
//   completedCompact: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.lightSuccess,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   completedTextCompact: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.success,
//     marginLeft: 4,
//   },
//   propertyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   propertyIcon: {
//     marginRight: 10,
//   },
//   propertyInfo: {
//     flex: 1,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addressText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     flex: 1,
//   },
//   timingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 4,
//   },
//   timingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'left',
//   },
//   timingSeparator: {
//     width: 1,
//     height: 12,
//     backgroundColor: COLORS.lightGray,
//   },
//   timingText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
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
// });

// export default TaskProgress;




// import React, { useContext, useEffect, useState, useRef } from 'react';
// import { 
//   SafeAreaView, 
//   Text, 
//   StyleSheet, 
//   StatusBar, 
//   Linking, 
//   Button, 
//   FlatList, 
//   ScrollView, 
//   Image, 
//   View, 
//   Dimensions, 
//   TouchableOpacity, 
//   ActivityIndicator
// } from 'react-native';
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
// import { tSafe } from '../../utils/tSafe'; // added import

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
//     const headerTitle = mode === "in_progress" 
//       ? tSafe('in_progress_header', 'In-Progress') 
//       : tSafe('completed_project_header', 'Completed Project');
//     navigation.setOptions({
//       title: headerTitle,
//       headerStyle: {
//         backgroundColor: mode === "in_progress" ? COLORS.white : COLORS.white,
//         borderBottomWidth: 1,
//         borderBottomColor: '#E5E5EA',
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
//     return mode === "in_progress" 
//       ? tSafe('status_in_progress', 'In Progress')
//       : tSafe('status_completed', 'Completed');
//   };

//   // Get status icon based on mode
//   const getStatusIcon = () => {
//     return mode === "in_progress" ? "clock-outline" : "check-circle-outline";
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor:COLORS.white }}>
//       {/* Compact Header Content */}
//       <View style={styles.compactHeader}>
//         {/* Top Row: Status + Progress/Completed Info */}
//         {/* <View style={styles.topRow}>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeStyle().backgroundColor }]}>
//             <MaterialCommunityIcons 
//               name={getStatusIcon()} 
//               size={14} 
//               color={getStatusBadgeStyle().color} 
//             />
//             <Text style={[styles.statusText, { color: getStatusBadgeStyle().color }]}>
//               {getStatusText()}
//             </Text>
//           </View>

//           {mode === "in_progress" && (
//             <View style={styles.progressCompact}>
//               <AnimatedCircularProgress
//                 size={40}
//                 width={4}
//                 fill={progress}
//                 tintColor={COLORS.primary}
//                 backgroundColor={COLORS.light_gray}
//                 rotation={0}
//               >
//                 {(fill) => (
//                   <Text style={styles.progressTextCompact}>
//                     {Math.round(fill)}%
//                   </Text>
//                 )}
//               </AnimatedCircularProgress>
//             </View>
//           )}

//           {mode === "completed" && (
//             <View style={styles.completedCompact}>
//               <MaterialCommunityIcons name="check-all" size={16} color={COLORS.success} />
//               <Text style={styles.completedTextCompact}>Completed</Text>
//             </View>
//           )}
//         </View> */}

//         {/* Middle Row: Property Info */}
//         <View style={styles.propertyRow}>
//           {/* <View style={styles.propertyIcon}>
//             <AntDesign name="home" size={20} color={COLORS.primary}/>
//           </View> */}
//           <View style={styles.propertyInfo}>
//             <Text style={styles.propertyName} numberOfLines={1}>
//               {schedule.schedule?.apartment_name}
//             </Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
//               <Text style={styles.addressText} numberOfLines={1}>
//                 {schedule.schedule?.address}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Bottom Row: Timing Info */}
//         <View style={styles.timingRow}>
//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_date).format('MMM D')}
//             </Text>
//           </View>
          
//           <View style={styles.timingSeparator} />
          
//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>

//           {mode === "in_progress" && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="timer-sand" size={14} color={COLORS.gray} />
//                 <Text style={styles.timingText}>
//                   {tSafe('ends_at', 'Ends:')} {endTime}
//                 </Text>
//               </View>
//             </>
//           )}

//           {mode === "completed" && schedule?.completed_on && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
//                 <Text style={styles.timingText}>
//                   {tSafe('completed_on', 'Completed')} {moment(schedule.completed_on).format('MMM D')}
//                 </Text>
//               </View>
//             </>
//           )}
//         </View>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             { 
//               borderBottomColor: currentStep === 1 ? COLORS.primary : "#f0f0f0",
//               backgroundColor: currentStep === 1 ? COLORS.lightPrimary : 'transparent'
//             }
//           ]} 
//           onPress={() => setCurrentStep(1)}
//         >
//           <MaterialCommunityIcons 
//             name="camera" 
//             size={20} 
//             color={currentStep === 1 ? COLORS.primary : COLORS.gray} 
//           />
//           <Text style={[
//             styles.tab_text,
//             { color: currentStep === 1 ? COLORS.primary : COLORS.gray }
//           ]}>
//             {tSafe('tab_before', 'Before')}
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             { 
//               borderBottomColor: currentStep === 2 ? COLORS.primary : "#f0f0f0",
//               backgroundColor: currentStep === 2 ? COLORS.lightPrimary : 'transparent'
//             }
//           ]} 
//           onPress={() => setCurrentStep(2)}
//         >
//           <MaterialCommunityIcons 
//             name="camera-flip" 
//             size={20} 
//             color={currentStep === 2 ? COLORS.primary : COLORS.gray} 
//           />
//           <Text style={[
//             styles.tab_text,
//             { color: currentStep === 2 ? COLORS.primary : COLORS.gray }
//           ]}>
//             {tSafe('tab_after', 'After')}
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             { 
//               borderBottomColor: currentStep === 3 ? COLORS.primary : "#f0f0f0",
//               backgroundColor: currentStep === 3 ? COLORS.lightPrimary : 'transparent'
//             }
//           ]} 
//           onPress={() => setCurrentStep(3)}
//         >
//           <MaterialCommunityIcons 
//             name="format-list-checks" 
//             size={20} 
//             color={currentStep === 3 ? COLORS.primary : COLORS.gray} 
//           />
//           <Text style={[
//             styles.tab_text,
//             { color: currentStep === 3 ? COLORS.primary : COLORS.gray }
//           ]}>
//             {tSafe('tab_incidents', 'Incidents')}
//           </Text>
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
//   // Compact Header Styles
//   compactHeader: {
//     backgroundColor: COLORS.white,
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     elevation: 1,
//   },
//   topRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   progressCompact: {
//     alignItems: 'center',
//   },
//   progressTextCompact: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//   },
//   completedCompact: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.lightSuccess,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   completedTextCompact: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.success,
//     marginLeft: 4,
//   },
//   propertyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   propertyIcon: {
//     marginRight: 10,
//   },
//   propertyInfo: {
//     flex: 1,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addressText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     flex: 1,
//   },
//   timingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 4,
//   },
//   timingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'left',
//   },
//   timingSeparator: {
//     width: 1,
//     height: 12,
//     backgroundColor: COLORS.lightGray,
//   },
//   timingText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
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
// });

// export default TaskProgress;


// import React, { useContext, useEffect, useState, useRef } from 'react';
// import {
//   SafeAreaView,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Linking,
//   Button,
//   FlatList,
//   ScrollView,
//   Image,
//   View,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal as RNModal,
//   Animated,
// } from 'react-native';
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
// import { useNavigation } from '@react-navigation/native';
// import Incident from './TaskTaps/Incident';
// import CircleIconButton1 from '../../components/shared/CircleButton1';
// import { tSafe } from '../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// const TaskProgress = ({ route }) => {
//   const { currentUserId, fbaseUser, currentUser } = useContext(AuthContext);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedCleanerId, setSelectedCleanerId] = useState('');
//   const [visible, setVisible] = React.useState(false);
//   const [schedule, setSchedule] = React.useState({});
//   const [showMarkModal, setShowMarkModal] = useState(false);
//   const [cleanersToMark, setCleanersToMark] = useState([]);
//   const [markLoading, setMarkLoading] = useState(false);

//   const navigation = useNavigation();
//   const { scheduleId, mode } = route.params;

//   const [currentStep, setCurrentStep] = useState(1);
//   const [progress, setProgress] = useState(0);

//   // Animated scroll value
//   const scrollY = useRef(new Animated.Value(0)).current;

//   // ─── handleScroll ──────────────────────────────────────────────
//   const handleScroll = Animated.event(
//     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//     { useNativeDriver: false }
//   );

//   // ─── FAB animations ──────────────────────────────────────────────
//   const labelOpacity = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [0, 1],
//     extrapolate: 'clamp',
//   });

//   const fabWidth = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [56, 180],
//     extrapolate: 'clamp',
//   });

//   const labelWidth = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [0, 120],
//     extrapolate: 'clamp',
//   });

//   const labelMargin = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [0, 8],
//     extrapolate: 'clamp',
//   });

//   const startTime = moment(schedule?.schedule?.cleaning_time, 'hh:mm A');
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

//   const fetchSchedule = async () => {
//     try {
//       const response = await userService.getScheduleById(scheduleId);
//       setSchedule(response.data);
//     } catch (error) {
//       console.log(error);
//       Alert.alert('Error', 'Failed to fetch schedule');
//     }
//   };

//   // Set header title based on mode
//   useEffect(() => {
//     const headerTitle =
//       mode === 'in_progress'
//         ? tSafe('in_progress_header', 'In-Progress')
//         : tSafe('completed_project_header', 'Completed Project');
//     navigation.setOptions({
//       title: headerTitle,
//       headerStyle: {
//         backgroundColor: mode === 'in_progress' ? COLORS.white : COLORS.white,
//         borderBottomWidth: 1,
//         borderBottomColor: '#E5E5EA',
//       },
//       headerTintColor: COLORS.gray,
//     });
//   }, [navigation, mode]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       calculateProgress();
//     }, 5000);

//     fetchSchedule();
//     return () => clearInterval(interval);
//   }, []);

//   // ─── Cleaners to mark ──────────────────────────────────────────
//   useEffect(() => {
//     if (schedule && schedule.assignedTo) {
//       // Only exclude 'uncompleted' and 'completed' – allow 'pending_review'
//       const terminalStatuses = ['uncompleted', 'completed'];
//       const active = schedule.assignedTo.filter(
//         (cleaner) => !terminalStatuses.includes(cleaner.status?.toLowerCase())
//       );
//       setCleanersToMark(active);
//     }
//   }, [schedule]);

//   const handleClosePreview = () => {
//     setOpenModal(false);
//   };

//   const handleOpenPreview = (cleaner_id) => {
//     setSelectedCleanerId(cleaner_id);
//     setOpenModal(true);
//   };

//   // ─── Mark uncompleted ──────────────────────────────────────────
//   const handleMarkUncompleted = async (cleanerId, cleanerName) => {
//     setMarkLoading(true);
//     try {
//       await userService.markCleanerUncompleted({
//         scheduleId: scheduleId,
//         cleanerId: cleanerId,
//         reason: tSafe('did_not_complete', 'Did not complete cleaning'),
//       });
//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('cleaner_marked_uncompleted', 'Cleaner marked as uncompleted.')
//       );
//       await fetchSchedule();
//       setShowMarkModal(false);
//     } catch (error) {
//       Alert.alert(
//         tSafe('error', 'Error'),
//         error.response?.data?.detail || tSafe('something_went_wrong', 'Something went wrong.')
//       );
//     } finally {
//       setMarkLoading(false);
//     }
//   };

//   // ─── Status helpers ──────────────────────────────────────────
//   const getStatusBadgeStyle = () => {
//     if (mode === 'in_progress') {
//       return { backgroundColor: COLORS.warning, color: COLORS.dark };
//     } else {
//       return { backgroundColor: COLORS.success, color: '#fff' };
//     }
//   };

//   const getStatusText = () => {
//     return mode === 'in_progress'
//       ? tSafe('status_in_progress', 'In Progress')
//       : tSafe('status_completed', 'Completed');
//   };

//   const getStatusIcon = () => {
//     return mode === 'in_progress' ? 'clock-outline' : 'check-circle-outline';
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.white }}>
//       {/* Compact Header */}
//       <View style={styles.compactHeader}>
//         <View style={styles.propertyRow}>
//           <View style={styles.propertyInfo}>
//             <Text style={styles.propertyName} numberOfLines={1}>
//               {schedule.schedule?.apartment_name}
//             </Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
//               <Text style={styles.addressText} numberOfLines={1}>
//                 {schedule.schedule?.address}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.timingRow}>
//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_date).format('MMM D')}
//             </Text>
//           </View>

//           <View style={styles.timingSeparator} />

//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>

//           {mode === 'in_progress' && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="timer-sand" size={14} color={COLORS.gray} />
//                 <Text style={styles.timingText}>
//                   {tSafe('ends_at', 'Ends:')} {endTime}
//                 </Text>
//               </View>
//             </>
//           )}

//           {mode === 'completed' && schedule?.completed_on && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
//                 <Text style={styles.timingText}>
//                   {tSafe('completed_on', 'Completed')}{' '}
//                   {moment(schedule.completed_on).format('MMM D')}
//                 </Text>
//               </View>
//             </>
//           )}
//         </View>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity
//           style={[styles.tab, { borderBottomColor: currentStep === 1 ? COLORS.primary : '#f0f0f0' }]}
//           onPress={() => setCurrentStep(1)}
//         >
//           <MaterialCommunityIcons name="camera" size={20} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
//           <Text style={[styles.tab_text, { color: currentStep === 1 ? COLORS.primary : COLORS.gray }]}>
//             {tSafe('tab_before', 'Before')}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, { borderBottomColor: currentStep === 2 ? COLORS.primary : '#f0f0f0' }]}
//           onPress={() => setCurrentStep(2)}
//         >
//           <MaterialCommunityIcons name="camera-flip" size={20} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//           <Text style={[styles.tab_text, { color: currentStep === 2 ? COLORS.primary : COLORS.gray }]}>
//             {tSafe('tab_after', 'After')}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, { borderBottomColor: currentStep === 3 ? COLORS.primary : '#f0f0f0' }]}
//           onPress={() => setCurrentStep(3)}
//         >
//           <MaterialCommunityIcons name="format-list-checks" size={20} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
//           <Text style={[styles.tab_text, { color: currentStep === 3 ? COLORS.primary : COLORS.gray }]}>
//             {tSafe('tab_incidents', 'Incidents')}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tab Content – pass onScroll to each tab */}
//       <View style={styles.tabContentContainer}>
//         {currentStep === 1 && (
//           <BeforePhoto scheduleId={scheduleId} schedule={schedule} mode={mode} onScroll={handleScroll} />
//         )}
//         {currentStep === 2 && (
//           <AfterPhoto scheduleId={scheduleId} schedule={schedule} mode={mode} onScroll={handleScroll} />
//         )}
//         {currentStep === 3 && (
//           <Incident scheduleId={scheduleId} schedule={schedule} mode={mode} onScroll={handleScroll} />
//         )}
//       </View>

//       {/* 👇 Expandable FAB with centered icon */}
//       {mode === 'in_progress' && cleanersToMark.length > 0 && (
//         <Animated.View style={[styles.fabContainer, { width: fabWidth }]}>
//           <TouchableOpacity
//             style={styles.fabButton}
//             onPress={() => setShowMarkModal(true)}
//             activeOpacity={0.9}
//           >
//             <MaterialCommunityIcons name="alert-circle" size={24} color="#fff" />
//             <Animated.View
//               style={[
//                 styles.fabLabelWrapper,
//                 { width: labelWidth, marginLeft: labelMargin },
//               ]}
//             >
//               <Animated.Text style={[styles.fabLabel, { opacity: labelOpacity }]}>
//                 {tSafe('mark_uncompleted', 'Mark Uncompleted')}
//               </Animated.Text>
//             </Animated.View>
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       {/* Modal to select cleaner */}
//       <RNModal
//         visible={showMarkModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowMarkModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>
//               {tSafe('select_cleaner_to_mark', 'Select Cleaner to Mark Uncompleted')}
//             </Text>
//             <FlatList
//               data={cleanersToMark}
//               keyExtractor={(item) => item.cleanerId}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.cleanerItem}
//                   onPress={() => handleMarkUncompleted(item.cleanerId, `${item.firstname} ${item.lastname}`)}
//                   disabled={markLoading}
//                 >
//                   <Text style={styles.cleanerName}>
//                     {item.firstname} {item.lastname}
//                   </Text>
//                   <Text style={styles.cleanerStatus}>{item.status || 'unknown'}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//             <TouchableOpacity style={styles.cancelButton} onPress={() => setShowMarkModal(false)}>
//               <Text style={styles.cancelButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </RNModal>

//       {/* Cleaner Profile Modal */}
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
//             schedule={schedule}
//             cleanerId={selectedCleanerId}
//             close_modal={handleClosePreview}
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // ─── FAB (Fixed) ──────────────────────────────────────────────
//   fabContainer: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     height: 56,
//     borderRadius: 28,
//     overflow: 'hidden',
//     backgroundColor: COLORS.error || '#d32f2f',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   fabButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 16,
//   },
//   fabLabelWrapper: {
//     overflow: 'hidden',
//   },
//   fabLabel: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   // ─── Modals ────────────────────────────────────────────────────
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     width: '90%',
//     maxHeight: '80%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: COLORS.dark,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   cleanerName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
//   cleanerStatus: {
//     fontSize: 14,
//     color: '#666',
//     textTransform: 'capitalize',
//   },
//   cancelButton: {
//     marginTop: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   // ─── Tabs ──────────────────────────────────────────────────────
//   tabContentContainer: { flex: 1, backgroundColor: COLORS.white },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 0,
//     borderBottomColor: '#e9e9e9',
//     elevation: 2,
//   },
//   tab: {
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.primary,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 26,
//   },
//   tab_text: { marginBottom: 5 },

//   // ─── Header ────────────────────────────────────────────────────
//   compactHeader: {
//     backgroundColor: COLORS.white,
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     elevation: 1,
//   },
//   propertyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   propertyInfo: { flex: 1 },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addressText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     flex: 1,
//   },
//   timingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 4,
//   },
//   timingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'left',
//   },
//   timingSeparator: {
//     width: 1,
//     height: 12,
//     backgroundColor: COLORS.lightGray,
//   },
//   timingText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
//   },

//   // ─── Modal (Cleaner Profile) ─────────────────────────────────
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
// });

// export default TaskProgress;




// TaskProgress.js
// import React, { useContext, useEffect, useState, useRef } from 'react';
// import {
//   SafeAreaView,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Linking,
//   Button,
//   FlatList,
//   ScrollView,
//   Image,
//   View,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal as RNModal,
//   Animated,
// } from 'react-native';
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
// import { useNavigation } from '@react-navigation/native';
// import Incident from './TaskTaps/Incident';
// import CircleIconButton1 from '../../components/shared/CircleButton1';
// import { tSafe } from '../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// const TaskProgress = ({ route }) => {
//   const { currentUserId, fbaseUser, currentUser } = useContext(AuthContext);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedCleanerId, setSelectedCleanerId] = useState('');
//   const [visible, setVisible] = React.useState(false);
//   const [schedule, setSchedule] = React.useState({});
//   const [showMarkModal, setShowMarkModal] = useState(false);
//   const [cleanersToMark, setCleanersToMark] = useState([]);
//   const [markLoading, setMarkLoading] = useState(false);

//   const navigation = useNavigation();
//   const { scheduleId, mode, cleanerId } = route.params; // cleanerId for review mode

//   const [currentStep, setCurrentStep] = useState(1);
//   const [progress, setProgress] = useState(0);

//   // Animated scroll value
//   const scrollY = useRef(new Animated.Value(0)).current;

//   // ─── handleScroll ──────────────────────────────────────────────
//   const handleScroll = Animated.event(
//     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//     { useNativeDriver: false }
//   );

//   // ─── FAB animations ──────────────────────────────────────────────
//   const labelOpacity = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [0, 1],
//     extrapolate: 'clamp',
//   });

//   const fabWidth = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [56, 180],
//     extrapolate: 'clamp',
//   });

//   const labelWidth = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [0, 120],
//     extrapolate: 'clamp',
//   });

//   const labelMargin = scrollY.interpolate({
//     inputRange: [0, 20],
//     outputRange: [0, 8],
//     extrapolate: 'clamp',
//   });

//   const startTime = moment(schedule?.schedule?.cleaning_time, 'hh:mm A');
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

//   const fetchSchedule = async () => {
//     try {
//       const response = await userService.getScheduleById(scheduleId);
//       setSchedule(response.data);
//     } catch (error) {
//       console.log(error);
//       Alert.alert('Error', 'Failed to fetch schedule');
//     }
//   };

//   // ─── Set initial tab based on mode ──────────────────────────────
//   useEffect(() => {
//     if (mode === 'review') {
//       setCurrentStep(2); // AfterPhoto tab
//     } else {
//       setCurrentStep(1); // BeforePhoto tab by default
//     }
//   }, [mode]);

//   // Set header title based on mode
//   useEffect(() => {
//     const headerTitle =
//       mode === 'in_progress'
//         ? tSafe('in_progress_header', 'In-Progress')
//         : mode === 'review'
//         ? tSafe('review_work_header', 'Review Work')
//         : tSafe('completed_project_header', 'Completed Project');
//     navigation.setOptions({
//       title: headerTitle,
//       headerStyle: {
//         backgroundColor: mode === 'in_progress' ? COLORS.white : COLORS.white,
//         borderBottomWidth: 1,
//         borderBottomColor: '#E5E5EA',
//       },
//       headerTintColor: COLORS.gray,
//     });
//   }, [navigation, mode]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       calculateProgress();
//     }, 5000);

//     fetchSchedule();
//     return () => clearInterval(interval);
//   }, []);

//   // ─── Cleaners to mark ──────────────────────────────────────────
//   useEffect(() => {
//     if (schedule && schedule.assignedTo) {
//       const terminalStatuses = ['uncompleted', 'completed'];
//       const active = schedule.assignedTo.filter(
//         (cleaner) => !terminalStatuses.includes(cleaner.status?.toLowerCase())
//       );
//       setCleanersToMark(active);
//     }
//   }, [schedule]);

//   const handleClosePreview = () => {
//     setOpenModal(false);
//   };

//   const handleOpenPreview = (cleaner_id) => {
//     setSelectedCleanerId(cleaner_id);
//     setOpenModal(true);
//   };

//   // ─── Mark uncompleted ──────────────────────────────────────────
//   const handleMarkUncompleted = async (cleanerId, cleanerName) => {
//     setMarkLoading(true);
//     try {
//       await userService.markCleanerUncompleted({
//         scheduleId: scheduleId,
//         cleanerId: cleanerId,
//         reason: tSafe('did_not_complete', 'Did not complete cleaning'),
//       });
//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('cleaner_marked_uncompleted', 'Cleaner marked as uncompleted.')
//       );
//       await fetchSchedule();
//       setShowMarkModal(false);
//     } catch (error) {
//       Alert.alert(
//         tSafe('error', 'Error'),
//         error.response?.data?.detail || tSafe('something_went_wrong', 'Something went wrong.')
//       );
//     } finally {
//       setMarkLoading(false);
//     }
//   };

//   // ─── Status helpers ──────────────────────────────────────────
//   const getStatusBadgeStyle = () => {
//     if (mode === 'in_progress') {
//       return { backgroundColor: COLORS.warning, color: COLORS.dark };
//     } else {
//       return { backgroundColor: COLORS.success, color: '#fff' };
//     }
//   };

//   const getStatusText = () => {
//     return mode === 'in_progress'
//       ? tSafe('status_in_progress', 'In Progress')
//       : mode === 'review'
//       ? tSafe('status_pending_review', 'Pending Review')
//       : tSafe('status_completed', 'Completed');
//   };

//   const getStatusIcon = () => {
//     return mode === 'in_progress' ? 'clock-outline' : 'check-circle-outline';
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.white }}>
//       {/* Compact Header */}
//       <View style={styles.compactHeader}>
//         <View style={styles.propertyRow}>
//           <View style={styles.propertyInfo}>
//             <Text style={styles.propertyName} numberOfLines={1}>
//               {schedule.schedule?.apartment_name}
//             </Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
//               <Text style={styles.addressText} numberOfLines={1}>
//                 {schedule.schedule?.address}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.timingRow}>
//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_date).format('MMM D')}
//             </Text>
//           </View>

//           <View style={styles.timingSeparator} />

//           <View style={styles.timingItem}>
//             <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.gray} />
//             <Text style={styles.timingText}>
//               {moment(schedule?.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>

//           {mode === 'in_progress' && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="timer-sand" size={14} color={COLORS.gray} />
//                 <Text style={styles.timingText}>
//                   {tSafe('ends_at', 'Ends:')} {endTime}
//                 </Text>
//               </View>
//             </>
//           )}

//           {mode === 'completed' && schedule?.completed_on && (
//             <>
//               <View style={styles.timingSeparator} />
//               <View style={styles.timingItem}>
//                 <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
//                 <Text style={styles.timingText}>
//                   {tSafe('completed_on', 'Completed')}{' '}
//                   {moment(schedule.completed_on).format('MMM D')}
//                 </Text>
//               </View>
//             </>
//           )}

//           {mode === 'review' && (
//             <View style={styles.timingItem}>
//               <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.warning} />
//               <Text style={styles.timingText}>
//                 {tSafe('pending_review_status', 'Awaiting Review')}
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity
//           style={[styles.tab, { borderBottomColor: currentStep === 1 ? COLORS.primary : '#f0f0f0' }]}
//           onPress={() => setCurrentStep(1)}
//         >
//           <MaterialCommunityIcons name="camera" size={20} color={currentStep === 1 ? COLORS.primary : COLORS.gray} />
//           <Text style={[styles.tab_text, { color: currentStep === 1 ? COLORS.primary : COLORS.gray }]}>
//             {tSafe('tab_before', 'Before')}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, { borderBottomColor: currentStep === 2 ? COLORS.primary : '#f0f0f0' }]}
//           onPress={() => setCurrentStep(2)}
//         >
//           <MaterialCommunityIcons name="camera-flip" size={20} color={currentStep === 2 ? COLORS.primary : COLORS.gray} />
//           <Text style={[styles.tab_text, { color: currentStep === 2 ? COLORS.primary : COLORS.gray }]}>
//             {tSafe('tab_after', 'After')}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, { borderBottomColor: currentStep === 3 ? COLORS.primary : '#f0f0f0' }]}
//           onPress={() => setCurrentStep(3)}
//         >
//           <MaterialCommunityIcons name="format-list-checks" size={20} color={currentStep === 3 ? COLORS.primary : COLORS.gray} />
//           <Text style={[styles.tab_text, { color: currentStep === 3 ? COLORS.primary : COLORS.gray }]}>
//             {tSafe('tab_incidents', 'Incidents')}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tab Content – pass onScroll to each tab */}
//       <View style={styles.tabContentContainer}>
//         {currentStep === 1 && (
//           <BeforePhoto scheduleId={scheduleId} schedule={schedule} mode={mode} onScroll={handleScroll} />
//         )}
//         {currentStep === 2 && (
//           <AfterPhoto
//             scheduleId={scheduleId}
//             schedule={schedule}
//             mode={mode}
//             onScroll={handleScroll}
//             isReviewMode={mode === 'review'}
//             cleanerId={cleanerId}   // pass the cleaner to review
//           />
//         )}
//         {currentStep === 3 && (
//           <Incident scheduleId={scheduleId} schedule={schedule} mode={mode} onScroll={handleScroll} />
//         )}
//       </View>

//       {/* 👇 Expandable FAB – only for in_progress mode */}
//       {mode === 'in_progress' && cleanersToMark.length > 0 && (
//         <Animated.View style={[styles.fabContainer, { width: fabWidth }]}>
//           <TouchableOpacity
//             style={styles.fabButton}
//             onPress={() => setShowMarkModal(true)}
//             activeOpacity={0.9}
//           >
//             <MaterialCommunityIcons name="alert-circle" size={24} color="#fff" />
//             <Animated.View
//               style={[
//                 styles.fabLabelWrapper,
//                 { width: labelWidth, marginLeft: labelMargin },
//               ]}
//             >
//               <Animated.Text style={[styles.fabLabel, { opacity: labelOpacity }]}>
//                 {tSafe('mark_uncompleted', 'Mark Uncompleted')}
//               </Animated.Text>
//             </Animated.View>
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       {/* Modal to select cleaner (for marking uncompleted) */}
//       <RNModal
//         visible={showMarkModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowMarkModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>
//               {tSafe('select_cleaner_to_mark', 'Select Cleaner to Mark Uncompleted')}
//             </Text>
//             <FlatList
//               data={cleanersToMark}
//               keyExtractor={(item) => item.cleanerId}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.cleanerItem}
//                   onPress={() => handleMarkUncompleted(item.cleanerId, `${item.firstname} ${item.lastname}`)}
//                   disabled={markLoading}
//                 >
//                   <Text style={styles.cleanerName}>
//                     {item.firstname} {item.lastname}
//                   </Text>
//                   <Text style={styles.cleanerStatus}>{item.status || 'unknown'}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//             <TouchableOpacity style={styles.cancelButton} onPress={() => setShowMarkModal(false)}>
//               <Text style={styles.cancelButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </RNModal>

//       {/* Cleaner Profile Modal */}
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
//             schedule={schedule}
//             cleanerId={selectedCleanerId}
//             close_modal={handleClosePreview}
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // ─── FAB (Fixed) ──────────────────────────────────────────────
//   fabContainer: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     height: 56,
//     borderRadius: 28,
//     overflow: 'hidden',
//     backgroundColor: COLORS.error || '#d32f2f',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   fabButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 16,
//   },
//   fabLabelWrapper: {
//     overflow: 'hidden',
//   },
//   fabLabel: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   // ─── Modals ────────────────────────────────────────────────────
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     width: '90%',
//     maxHeight: '80%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: COLORS.dark,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   cleanerName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
//   cleanerStatus: {
//     fontSize: 14,
//     color: '#666',
//     textTransform: 'capitalize',
//   },
//   cancelButton: {
//     marginTop: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   // ─── Tabs ──────────────────────────────────────────────────────
//   tabContentContainer: { flex: 1, backgroundColor: COLORS.white },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 0,
//     borderBottomColor: '#e9e9e9',
//     elevation: 2,
//   },
//   tab: {
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.primary,
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 26,
//   },
//   tab_text: { marginBottom: 5 },

//   // ─── Header ────────────────────────────────────────────────────
//   compactHeader: {
//     backgroundColor: COLORS.white,
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     elevation: 1,
//   },
//   propertyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   propertyInfo: { flex: 1 },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addressText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     flex: 1,
//   },
//   timingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 4,
//   },
//   timingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'left',
//   },
//   timingSeparator: {
//     width: 1,
//     height: 12,
//     backgroundColor: COLORS.lightGray,
//   },
//   timingText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
//   },

//   // ─── Modal (Cleaner Profile) ─────────────────────────────────
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
// });

// export default TaskProgress;



import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import Modal from 'react-native-modal';

import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';

import BeforePhoto from './TaskTaps/BeforePhoto';
import AfterPhoto from './TaskTaps/AfterPhoto';
import Incident from './TaskTaps/Incident';
import ViewCleanerProfile from './ViewCleanerProfile';

import { useTheme } from '../../theme';

import {
  AppText,
  AppCard,
  AppButton,
} from '../../ui';

import { tSafe } from '../../utils/tSafe';

const TAB_CONFIG = [
  {
    key: 1,
    label: 'tab_before',
    fallback: 'Before',
    icon: 'camera-outline',
  },
  {
    key: 2,
    label: 'tab_after',
    fallback: 'After',
    icon: 'camera-outline',
  },
  {
    key: 3,
    label: 'tab_incidents',
    fallback: 'Incidents',
    icon: 'alert-circle-outline',
  },
];

const TERMINAL_CLEANER_STATUSES = [
  'uncompleted',
  'completed',
];

const getCleanerId = (cleaner, index = 0) =>
  String(
    cleaner?.cleanerId ||
    cleaner?.cleaner_id ||
    cleaner?._id ||
    `cleaner-${index}`
  );

const getCleanerName = (cleaner) => {
  const name = [
    cleaner?.firstname,
    cleaner?.lastname,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    name ||
    cleaner?.name ||
    tSafe('cleaner', 'Cleaner')
  );
};

const getScheduleDetails = (scheduleResponse) => {
  if (!scheduleResponse || typeof scheduleResponse !== 'object') {
    return {};
  }

  return (
    scheduleResponse.schedule ||
    scheduleResponse.data?.schedule ||
    {}
  );
};

const getScheduleStartMoment = (schedule) => {
  const details = getScheduleDetails(schedule);

  const date = details?.cleaning_date;
  const time = details?.cleaning_time;

  if (!date || !time) {
    return null;
  }

  const dateTime = moment(
    `${date} ${time}`,
    [
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD HH:mm',
      'YYYY-MM-DD h:mm A',
      'YYYY-MM-DD hh:mm A',
      'ddd MMM DD YYYY HH:mm:ss',
      'ddd MMM DD YYYY h:mm A',
    ],
    true
  );

  if (!dateTime.isValid()) {
    // Fallback for dates stored in formats outside the known list.
    const fallback = moment(`${date} ${time}`);

    return fallback.isValid() ? fallback : null;
  }

  return dateTime;
};

const getScheduleDuration = (schedule) => {
  const details = getScheduleDetails(schedule);

  const duration = Number(
    details?.total_cleaning_time
  );

  return Number.isFinite(duration) && duration > 0
    ? duration
    : 0;
};

const getStatusPresentation = (mode, theme) => {
  if (mode === 'in_progress') {
    return {
      label: tSafe('status_in_progress', 'In Progress'),
      icon: 'progress-clock',
      color: theme.status.warning,
    };
  }

  if (mode === 'review') {
    return {
      label: tSafe(
        'status_pending_review',
        'Pending Review'
      ),
      icon: 'clipboard-clock-outline',
      color: theme.status.info,
    };
  }

  return {
    label: tSafe('status_completed', 'Completed'),
    icon: 'check-circle-outline',
    color: theme.status.success,
  };
};

const getModeHeaderTitle = (mode) => {
  if (mode === 'in_progress') {
    return tSafe(
      'in_progress_header',
      'In Progress'
    );
  }

  if (mode === 'review') {
    return tSafe(
      'review_work_header',
      'Review Work'
    );
  }

  return tSafe(
    'completed_project_header',
    'Completed Project'
  );
};

export default function TaskProgress({ route }) {
  const {
    currentUserId,
    fbaseUser,
    currentUser,
  } = useContext(AuthContext);

  const navigation = useNavigation();

  const { theme, isDark } = useTheme();

  const {
    scheduleId,
    mode = 'completed',
    cleanerId,
  } = route.params || {};

  const [schedule, setSchedule] = useState({});
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState('');

  const [currentStep, setCurrentStep] = useState(
    mode === 'review' ? 2 : 1
  );

  const [progress, setProgress] = useState(0);

  const [openProfileModal, setOpenProfileModal] =
    useState(false);

  const [selectedCleanerId, setSelectedCleanerId] =
    useState('');

  const [showMarkModal, setShowMarkModal] =
    useState(false);

  const [cleanersToMark, setCleanersToMark] =
    useState([]);

  const [markLoading, setMarkLoading] =
    useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  const statusPresentation = useMemo(
    () => getStatusPresentation(mode, theme),
    [mode, theme]
  );

  const scheduleDetails = useMemo(
    () => getScheduleDetails(schedule),
    [schedule]
  );

  const startMoment = useMemo(
    () => getScheduleStartMoment(schedule),
    [schedule]
  );

  const durationMinutes = useMemo(
    () => getScheduleDuration(schedule),
    [schedule]
  );

  const endMoment = useMemo(() => {
    if (!startMoment || durationMinutes <= 0) {
      return null;
    }

    return startMoment.clone().add(
      durationMinutes,
      'minutes'
    );
  }, [startMoment, durationMinutes]);

  const totalPhotosDurationAvailable =
    Boolean(startMoment && durationMinutes > 0);

  const labelOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fabWidth = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [56, 190],
    extrapolate: 'clamp',
  });

  const labelWidth = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 132],
    extrapolate: 'clamp',
  });

  const labelMargin = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 8],
    extrapolate: 'clamp',
  });

  const handleScroll = useMemo(
    () =>
      Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: {
                y: scrollY,
              },
            },
          },
        ],
        {
          useNativeDriver: false,
        }
      ),
    [scrollY]
  );

  /**
   * Fetch the latest schedule whenever this screen becomes active.
   */
  const fetchSchedule = useCallback(
    async ({ silent = false } = {}) => {
      if (!scheduleId) {
        setScheduleError(
          tSafe(
            'schedule_unavailable',
            'The cleaning schedule could not be identified.'
          )
        );

        setScheduleLoading(false);
        return;
      }

      if (!silent) {
        setScheduleLoading(true);
      }

      setScheduleError('');

      try {
        const response =
          await userService.getScheduleById(scheduleId);

        const data = response?.data;

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid schedule response');
        }

        setSchedule(data);
      } catch (error) {
        console.error(
          'Failed to fetch task schedule:',
          error?.response?.data ||
            error?.message ||
            error
        );

        setScheduleError(
          error?.response?.data?.detail ||
          tSafe(
            'schedule_load_error',
            'Unable to load the cleaning schedule. Please try again.'
          )
        );
      } finally {
        setScheduleLoading(false);
      }
    },
    [scheduleId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();

      return undefined;
    }, [fetchSchedule])
  );

  /**
   * Keep the navigation header synchronized with the active theme.
   */
  useEffect(() => {
    navigation.setOptions({
      title: getModeHeaderTitle(mode),
      headerStyle: {
        backgroundColor: theme.background.default,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border.default,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: theme.text.primary,
      headerTitleStyle: {
        color: theme.text.primary,
        fontWeight: '600',
      },
    });
  }, [navigation, mode, theme]);

  /**
   * Start on the After tab when reviewing completed work.
   */
  useEffect(() => {
    setCurrentStep(mode === 'review' ? 2 : 1);
  }, [mode, scheduleId]);

  /**
   * Calculate elapsed progress from the scheduled start time.
   */
  useEffect(() => {
    if (
      mode !== 'in_progress' ||
      !startMoment ||
      durationMinutes <= 0
    ) {
      setProgress(0);
      return undefined;
    }

    const updateProgress = () => {
      const now = moment();

      const elapsedMinutes = Math.max(
        0,
        now.diff(startMoment, 'seconds') / 60
      );

      const percentage = Math.max(
        0,
        Math.min(
          (elapsedMinutes / durationMinutes) * 100,
          100
        )
      );

      setProgress(percentage);
    };

    updateProgress();

    const interval = setInterval(
      updateProgress,
      5000
    );

    return () => clearInterval(interval);
  }, [
    mode,
    startMoment?.valueOf(),
    durationMinutes,
  ]);

  /**
   * Build the list of cleaners who can still be marked uncompleted.
   */
  useEffect(() => {
    const assignedTo = Array.isArray(schedule?.assignedTo)
      ? schedule.assignedTo
      : [];

    const activeCleaners = assignedTo.filter(
      (cleaner) => {
        const status = String(
          cleaner?.status || ''
        ).toLowerCase();

        return !TERMINAL_CLEANER_STATUSES.includes(status);
      }
    );

    setCleanersToMark(activeCleaners);
  }, [schedule]);

  const handleOpenProfile = useCallback(
    (cleanerIdToView) => {
      if (!cleanerIdToView) {
        return;
      }

      setSelectedCleanerId(cleanerIdToView);
      setOpenProfileModal(true);
    },
    []
  );

  const handleCloseProfile = useCallback(() => {
    setOpenProfileModal(false);
  }, []);

  const handleCloseMarkModal = useCallback(() => {
    if (!markLoading) {
      setShowMarkModal(false);
    }
  }, [markLoading]);

  /**
   * Mark a cleaner as uncompleted.
   */
  const handleMarkUncompleted = useCallback(
    async (cleaner) => {
      if (markLoading) {
        return;
      }

      const cleanerIdToMark =
        cleaner?.cleanerId ||
        cleaner?.cleaner_id ||
        cleaner?._id;

      if (!cleanerIdToMark) {
        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'cleaner_id_missing',
            'This cleaner could not be identified.'
          )
        );

        return;
      }

      setMarkLoading(true);

      try {
        await userService.markCleanerUncompleted({
          scheduleId,
          cleanerId: cleanerIdToMark,
          reason: tSafe(
            'did_not_complete',
            'Did not complete cleaning'
          ),
        });

        Alert.alert(
          tSafe('success', 'Success'),
          tSafe(
            'cleaner_marked_uncompleted',
            'Cleaner marked as uncompleted.'
          )
        );

        setShowMarkModal(false);

        await fetchSchedule({ silent: true });
      } catch (error) {
        Alert.alert(
          tSafe('error', 'Error'),
          error?.response?.data?.detail ||
            tSafe(
              'something_went_wrong',
              'Something went wrong.'
            )
        );
      } finally {
        setMarkLoading(false);
      }
    },
    [
      markLoading,
      scheduleId,
      fetchSchedule,
    ]
  );

  const handleRetrySchedule = useCallback(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const cleaningDateLabel = useMemo(() => {
    const date = scheduleDetails?.cleaning_date;

    if (!date) {
      return tSafe(
        'date_not_available',
        'Date unavailable'
      );
    }

    const parsed = moment(date);

    return parsed.isValid()
      ? parsed.format('MMM D, YYYY')
      : tSafe(
          'date_not_available',
          'Date unavailable'
        );
  }, [scheduleDetails]);

  const cleaningTimeLabel = useMemo(() => {
    const time = scheduleDetails?.cleaning_time;

    if (!time) {
      return tSafe(
        'time_not_available',
        'Time unavailable'
      );
    }

    const parsed = moment(
      time,
      [
        'HH:mm:ss',
        'HH:mm',
        'h:mm A',
        'hh:mm A',
      ],
      true
    );

    if (parsed.isValid()) {
      return parsed.format('h:mm A');
    }

    const fallback = moment(time);

    return fallback.isValid()
      ? fallback.format('h:mm A')
      : String(time);
  }, [scheduleDetails]);

  const completedOnLabel = useMemo(() => {
    if (!schedule?.completed_on) {
      return '';
    }

    const parsed = moment(schedule.completed_on);

    return parsed.isValid()
      ? parsed.format('MMM D, YYYY')
      : '';
  }, [schedule]);

  const apartmentName =
    scheduleDetails?.apartment_name ||
    scheduleDetails?.apt_name ||
    tSafe(
      'property_name_unavailable',
      'Property'
    );

  const address =
    scheduleDetails?.address ||
    tSafe(
      'address_not_available',
      'Address not provided'
    );

  const renderTimingItem = (
    icon,
    label,
    value,
    options = {}
  ) => (
    <View
      key={`${icon}-${label}`}
      style={styles.timingItem}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={options.color || theme.icon.muted}
      />

      <View style={styles.timingTextContainer}>
        <AppText
          variant="caption"
          color={theme.text.secondary}
          numberOfLines={1}
        >
          {label}
        </AppText>

        <AppText
          variant="label"
          color={theme.text.primary}
          numberOfLines={1}
        >
          {value}
        </AppText>
      </View>
    </View>
  );

  // const renderHeader = () => (
  //   <View style={styles.scheduleHeader}>
  //     <View style={styles.propertyRow}>
  //       <View style={styles.propertyIcon}>
  //         <MaterialCommunityIcons
  //           name="home-city-outline"
  //           size={25}
  //           color={theme.brand.primary}
  //         />
  //       </View>

  //       <View style={styles.propertyInfo}>
  //         <AppText
  //           variant="title"
  //           color={theme.text.primary}
  //           numberOfLines={1}
  //         >
  //           {apartmentName}
  //         </AppText>

  //         <View style={styles.addressRow}>
  //           <MaterialCommunityIcons
  //             name="map-marker-outline"
  //             size={15}
  //             color={theme.icon.muted}
  //           />

  //           <AppText
  //             variant="caption"
  //             color={theme.text.secondary}
  //             numberOfLines={2}
  //             style={styles.addressText}
  //           >
  //             {address}
  //           </AppText>
  //         </View>
  //       </View>
  //     </View>

  //     <View style={styles.scheduleMeta}>
  //       <View style={styles.timingGrid}>
  //         {renderTimingItem(
  //           'calendar-month-outline',
  //           tSafe('date', 'Date'),
  //           cleaningDateLabel
  //         )}

  //         {renderTimingItem(
  //           'clock-outline',
  //           tSafe('start_time', 'Start time'),
  //           cleaningTimeLabel
  //         )}

  //         {mode === 'in_progress' && (
  //           renderTimingItem(
  //             'timer-sand',
  //             tSafe('ends_at', 'Ends at'),
  //             endMoment
  //               ? endMoment.format('h:mm A')
  //               : tSafe(
  //                   'time_not_available',
  //                   'Unavailable'
  //                 )
  //           )
  //         )}

  //         {mode === 'completed' && completedOnLabel && (
  //           renderTimingItem(
  //             'check-circle-outline',
  //             tSafe('completed_on', 'Completed on'),
  //             completedOnLabel,
  //             {
  //               color: theme.status.success,
  //             }
  //           )
  //         )}

  //         {mode === 'review' && (
  //           renderTimingItem(
  //             'clipboard-clock-outline',
  //             tSafe('review_status', 'Review status'),
  //             tSafe(
  //               'awaiting_review',
  //               'Awaiting review'
  //             ),
  //             {
  //               color: theme.status.info,
  //             }
  //           )
  //         )}
  //       </View>

  //       <View
  //         style={[
  //           styles.statusBadge,
  //           {
  //             backgroundColor: theme.surface.selected,
  //             borderColor: statusPresentation.color,
  //           },
  //         ]}
  //       >
  //         <View
  //           style={[
  //             styles.statusDot,
  //             {
  //               backgroundColor: statusPresentation.color,
  //             },
  //           ]}
  //         />

  //         <MaterialCommunityIcons
  //           name={statusPresentation.icon}
  //           size={16}
  //           color={statusPresentation.color}
  //         />

  //         <AppText
  //           variant="caption"
  //           color={statusPresentation.color}
  //           weight="600"
  //         >
  //           {statusPresentation.label}
  //         </AppText>
  //       </View>
  //     </View>

  //     {mode === 'in_progress' && (
  //       <View style={styles.progressContainer}>
  //         <View style={styles.progressHeading}>
  //           <AppText
  //             variant="label"
  //             color={theme.text.secondary}
  //           >
  //             {tSafe(
  //               'estimated_progress',
  //               'Estimated time elapsed'
  //             )}
  //           </AppText>

  //           <AppText
  //             variant="label"
  //             color={theme.brand.primary}
  //             weight="600"
  //           >
  //             {Math.round(progress)}%
  //           </AppText>
  //         </View>

  //         <View style={styles.progressTrack}>
  //           <View
  //             style={[
  //               styles.progressFill,
  //               {
  //                 width: `${progress}%`,
  //                 backgroundColor: theme.brand.primary,
  //               },
  //             ]}
  //           />
  //         </View>

  //         {!totalPhotosDurationAvailable && (
  //           <AppText
  //             variant="caption"
  //             color={theme.text.muted}
  //             style={styles.progressNote}
  //           >
  //             {tSafe(
  //               'progress_estimate_unavailable',
  //               'Progress is unavailable because the scheduled duration has not been set.'
  //             )}
  //           </AppText>
  //         )}
  //       </View>
  //     )}
  //   </View>
  // );

  const renderHeader = () => (
    <View style={styles.scheduleHeader}>
      {/* Row 1: Property and status */}
      <View style={styles.compactPropertyRow}>
        <View style={styles.compactPropertyIcon}>
          <MaterialCommunityIcons
            name="home-city-outline"
            size={19}
            color={theme.brand.primary}
          />
        </View>
  
        <View style={styles.propertyInfo}>
          <AppText
            variant="subtitle"
            color={theme.text.primary}
            numberOfLines={1}
          >
            {apartmentName}
          </AppText>
  
          <View style={styles.addressRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={12}
              color={theme.icon.muted}
            />
  
            <AppText
              variant="caption"
              color={theme.text.secondary}
              numberOfLines={1}
              style={styles.addressText}
            >
              {address}
            </AppText>
          </View>
        </View>
  
        <View
          style={[
            styles.compactStatusBadge,
            {
              backgroundColor: theme.surface.selected,
              borderColor: statusPresentation.color,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: statusPresentation.color,
              },
            ]}
          />
  
          <AppText
            variant="caption"
            color={statusPresentation.color}
            weight="600"
            numberOfLines={1}
          >
            {statusPresentation.label}
          </AppText>
        </View>
      </View>
  
      {/* Row 2: Date, time, and optional end time */}
      <View style={styles.compactTimingRow}>
        <View style={styles.compactTimingItem}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={15}
            color={theme.icon.muted}
          />
  
          <AppText
            variant="caption"
            color={theme.text.secondary}
          >
            {cleaningDateLabel}
          </AppText>
        </View>
  
        <View style={styles.compactTimingDivider} />
  
        <View style={styles.compactTimingItem}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={15}
            color={theme.icon.muted}
          />
  
          <AppText
            variant="caption"
            color={theme.text.secondary}
          >
            {cleaningTimeLabel}
          </AppText>
        </View>
  
        {mode === 'in_progress' && endMoment && (
          <>
            <View style={styles.compactTimingDivider} />
  
            <View style={styles.compactTimingItem}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={15}
                color={theme.icon.muted}
              />
  
              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {endMoment.format('h:mm A')}
              </AppText>
            </View>
          </>
        )}
  
        {mode === 'completed' && completedOnLabel && (
          <>
            <View style={styles.compactTimingDivider} />
  
            <View style={styles.compactTimingItem}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={15}
                color={theme.status.success}
              />
  
              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {completedOnLabel}
              </AppText>
            </View>
          </>
        )}
  
        {mode === 'review' && (
          <>
            <View style={styles.compactTimingDivider} />
  
            <View style={styles.compactTimingItem}>
              <MaterialCommunityIcons
                name="clipboard-clock-outline"
                size={15}
                color={theme.status.info}
              />
  
              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {tSafe('awaiting_review', 'Awaiting review')}
              </AppText>
            </View>
          </>
        )}
      </View>
  
      {/* Row 3: Minimal progress indicator */}
      {mode === 'in_progress' && (
        <View style={styles.compactProgressContainer}>
          <View style={styles.compactProgressTrack}>
            <View
              style={[
                styles.compactProgressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: theme.brand.primary,
                },
              ]}
            />
          </View>
  
          <AppText
            variant="caption"
            color={theme.text.muted}
          >
            {Math.round(progress)}%
          </AppText>
        </View>
      )}
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {TAB_CONFIG.map((tab) => {
        const isActive = currentStep === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{
              selected: isActive,
            }}
            onPress={() => setCurrentStep(tab.key)}
            style={[
              styles.tab,
              isActive && styles.tabActive,
            ]}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={21}
              color={
                isActive
                  ? theme.brand.primary
                  : theme.icon.muted
              }
            />

            <AppText
              variant="label"
              color={
                isActive
                  ? theme.brand.primary
                  : theme.text.secondary
              }
              weight={isActive ? '600' : '500'}
            >
              {tSafe(tab.label, tab.fallback)}
            </AppText>

            {isActive && (
              <View
                style={[
                  styles.tabIndicator,
                  {
                    backgroundColor: theme.brand.primary,
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderCleanerItem = ({ item, index }) => {
    const cleanerName = getCleanerName(item);
    const cleanerIdToMark = getCleanerId(item, index);

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cleanerItem}
        onPress={() => handleMarkUncompleted(item)}
        disabled={markLoading}
        accessibilityRole="button"
        accessibilityLabel={`${tSafe(
          'mark_uncompleted',
          'Mark uncompleted'
        )}: ${cleanerName}`}
      >
        <View style={styles.cleanerItemIcon}>
          <MaterialCommunityIcons
            name="account-alert-outline"
            size={22}
            color={theme.status.error}
          />
        </View>

        <View style={styles.cleanerItemDetails}>
          <AppText
            variant="bodyMedium"
            color={theme.text.primary}
            weight="600"
            numberOfLines={1}
          >
            {cleanerName}
          </AppText>

          <AppText
            variant="caption"
            color={theme.text.secondary}
          >
            {String(item?.status || 'unknown')
              .replace(/_/g, ' ')}
          </AppText>
        </View>

        {markLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.brand.primary}
          />
        ) : (
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.icon.muted}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderMarkUncompletedModal = () => (
    <Modal
      isVisible={showMarkModal}
      onBackdropPress={handleCloseMarkModal}
      onBackButtonPress={handleCloseMarkModal}
      onSwipeComplete={handleCloseMarkModal}
      swipeDirection={markLoading ? [] : ['down']}
      style={styles.bottomModal}
      backdropOpacity={0.45}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.markModalContainer}>
        <View style={styles.modalHandle} />

        <View style={styles.markModalHeader}>
          <View style={styles.markModalIcon}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={25}
              color={theme.status.error}
            />
          </View>

          <View style={styles.markModalHeading}>
            <AppText
              variant="heading"
              color={theme.text.primary}
            >
              {tSafe(
                'select_cleaner_to_mark',
                'Mark a cleaner uncompleted'
              )}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
              style={styles.markModalSubtitle}
            >
              {tSafe(
                'mark_uncompleted_description',
                'Select the cleaner who did not complete the cleaning.'
              )}
            </AppText>
          </View>
        </View>

        {cleanersToMark.length > 0 ? (
          <FlatList
            data={cleanersToMark}
            keyExtractor={(item, index) =>
              getCleanerId(item, index)
            }
            renderItem={renderCleanerItem}
            style={styles.cleanerList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.noCleanersContainer}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={38}
              color={theme.status.success}
            />

            <AppText
              variant="bodyMedium"
              color={theme.text.primary}
              align="center"
              style={styles.noCleanersText}
            >
              {tSafe(
                'no_cleaners_to_mark',
                'There are no eligible cleaners to mark.'
              )}
            </AppText>
          </View>
        )}

        {markLoading && (
          <View style={styles.markLoadingRow}>
            <ActivityIndicator
              size="small"
              color={theme.brand.primary}
            />

            <AppText
              variant="caption"
              color={theme.text.secondary}
            >
              {tSafe(
                'updating_cleaner_status',
                'Updating cleaner status...'
              )}
            </AppText>
          </View>
        )}

        <AppButton
          title={tSafe('cancel', 'Cancel')}
          variant="outline"
          fullWidth
          disabled={markLoading}
          onPress={handleCloseMarkModal}
          style={styles.cancelButton}
        />
      </View>
    </Modal>
  );

  const renderProfileModal = () => (
    <Modal
      isVisible={openProfileModal}
      onBackdropPress={handleCloseProfile}
      onBackButtonPress={handleCloseProfile}
      onSwipeComplete={handleCloseProfile}
      swipeDirection={['down']}
      style={styles.bottomModal}
      propagateSwipe
      backdropColor="#000000"
      backdropOpacity={0.45}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.profileModalContent}>
        <View style={styles.profileModalHandle} />

        <ViewCleanerProfile
          schedule={schedule}
          cleanerId={selectedCleanerId}
          close_modal={handleCloseProfile}
        />
      </View>
    </Modal>
  );

  if (scheduleLoading && !schedule?._id) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons
              name="clipboard-clock-outline"
              size={34}
              color={theme.brand.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            variant="bodyMedium"
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_schedule',
              'Loading cleaning schedule...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (scheduleError && !schedule?._id) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <MaterialCommunityIcons
              name="cloud-alert-outline"
              size={40}
              color={theme.status.error}
            />
          </View>

          <AppText
            variant="heading"
            color={theme.text.primary}
            align="center"
          >
            {tSafe(
              'schedule_unavailable_title',
              'Schedule unavailable'
            )}
          </AppText>

          <AppText
            variant="body"
            color={theme.text.secondary}
            align="center"
            style={styles.errorMessage}
          >
            {scheduleError}
          </AppText>

          <AppButton
            title={tSafe('try_again', 'Try again')}
            onPress={handleRetrySchedule}
            icon="refresh"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      {renderHeader()}

      {renderTabs()}

      <View style={styles.tabContentContainer}>
        {currentStep === 1 && (
          <BeforePhoto
            scheduleId={scheduleId}
            schedule={schedule}
            mode={mode}
            onScroll={handleScroll}
          />
        )}

        {currentStep === 2 && (
          <AfterPhoto
            scheduleId={scheduleId}
            schedule={schedule}
            mode={mode}
            onScroll={handleScroll}
            isReviewMode={mode === 'review'}
            cleanerId={cleanerId}
          />
        )}

        {currentStep === 3 && (
          <Incident
            scheduleId={scheduleId}
            schedule={schedule}
            mode={mode}
            onScroll={handleScroll}
          />
        )}
      </View>

      {mode === 'in_progress' &&
        cleanersToMark.length > 0 && (
          <Animated.View
            style={[
              styles.fabContainer,
              {
                width: fabWidth,
                backgroundColor: theme.status.error,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.fabButton}
              activeOpacity={0.85}
              onPress={() => setShowMarkModal(true)}
              accessibilityRole="button"
              accessibilityLabel={tSafe(
                'mark_uncompleted',
                'Mark uncompleted'
              )}
            >
              <MaterialCommunityIcons
                name="account-alert-outline"
                size={23}
                color="#FFFFFF"
              />

              <Animated.View
                style={[
                  styles.fabLabelWrapper,
                  {
                    width: labelWidth,
                    marginLeft: labelMargin,
                  },
                ]}
              >
                <Animated.Text
                  numberOfLines={1}
                  style={[
                    styles.fabLabel,
                    { opacity: labelOpacity },
                  ]}
                >
                  {tSafe(
                    'mark_uncompleted',
                    'Mark Uncompleted'
                  )}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}

      {renderMarkUncompletedModal()}

      {renderProfileModal()}
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    scheduleHeader: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 15,
      backgroundColor: theme.background.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    propertyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    propertyIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 12,
    },

    propertyInfo: {
      flex: 1,
      minWidth: 0,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 5,
    },

    addressText: {
      flex: 1,
      marginLeft: 4,
      lineHeight: 18,
    },

    scheduleMeta: {
      gap: 13,
    },

    timingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },

    timingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flexBasis: '45%',
      flexGrow: 1,
      minWidth: 125,
      gap: 8,
    },

    timingTextContainer: {
      flex: 1,
      minWidth: 0,
    },

    statusBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 11,
      borderWidth: 1,
      gap: 7,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    progressContainer: {
      marginTop: 17,
    },

    progressHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },

    progressTrack: {
      height: 7,
      borderRadius: 5,
      backgroundColor: theme.hero.progressTrack,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      borderRadius: 5,
    },

    progressNote: {
      marginTop: 7,
      lineHeight: 17,
    },

    tabsContainer: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: theme.background.elevated,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    tab: {
      flex: 1,
      minHeight: 61,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      paddingTop: 9,
      paddingBottom: 8,
      gap: 5,
      position: 'relative',
    },

    tabActive: {
      backgroundColor: theme.surface.selected,
    },

    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 15,
      right: 15,
      height: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },

    tabContentContainer: {
      flex: 1,
      minHeight: 0,
      backgroundColor: theme.background.default,
    },

    fabContainer: {
      position: 'absolute',
      right: 20,
      bottom: 24,
      height: 56,
      borderRadius: 28,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
    },

    fabButton: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },

    fabLabelWrapper: {
      overflow: 'hidden',
    },

    fabLabel: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    loadingIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginBottom: 22,
    },

    loadingText: {
      marginTop: 15,
    },

    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
    },

    errorIcon: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: theme.surface.selected,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },

    errorMessage: {
      lineHeight: 22,
      marginTop: 10,
      marginBottom: 24,
    },

    bottomModal: {
      margin: 0,
      justifyContent: 'flex-end',
    },

    markModalContainer: {
      maxHeight: '82%',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 28,
      backgroundColor: theme.surface.elevated,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    modalHandle: {
      width: 42,
      height: 5,
      borderRadius: 3,
      alignSelf: 'center',
      backgroundColor: theme.border.strong,
      marginBottom: 22,
    },

    markModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 17,
    },

    markModalIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: theme.surface.selected,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    markModalHeading: {
      flex: 1,
    },

    markModalSubtitle: {
      marginTop: 5,
      lineHeight: 18,
    },

    cleanerList: {
      flexGrow: 0,
      maxHeight: 360,
    },

    cleanerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
      gap: 11,
    },

    cleanerItemIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.surface.selected,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cleanerItemDetails: {
      flex: 1,
      minWidth: 0,
    },

    noCleanersContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 30,
    },

    noCleanersText: {
      marginTop: 12,
      maxWidth: 270,
    },

    markLoadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingTop: 15,
    },

    cancelButton: {
      marginTop: 17,
    },

    profileModalContent: {
      height: '72%',
      width: '100%',
      backgroundColor: theme.surface.elevated,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      overflow: 'hidden',
      paddingTop: 10,
    },

    profileModalHandle: {
      width: 42,
      height: 5,
      borderRadius: 3,
      alignSelf: 'center',
      backgroundColor: theme.border.strong,
      marginBottom: 8,
    },


    scheduleHeader: {
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 9,
      backgroundColor: theme.background.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },
    
    compactPropertyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 38,
    },
    
    compactPropertyIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 9,
    },
    
    propertyInfo: {
      flex: 1,
      minWidth: 0,
    },
    
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    
    addressText: {
      flex: 1,
      marginLeft: 3,
    },
    
    compactStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      maxWidth: 125,
      paddingHorizontal: 8,
      paddingVertical: 5,
      marginLeft: 8,
      borderRadius: 10,
      borderWidth: 1,
      gap: 5,
    },
    
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    
    compactTimingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 9,
      paddingLeft: 2,
      gap: 8,
    },
    
    compactTimingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    
    compactTimingDivider: {
      width: 1,
      height: 13,
      backgroundColor: theme.border.default,
    },
    
    compactProgressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 9,
      gap: 8,
    },
    
    compactProgressTrack: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.hero.progressTrack,
      overflow: 'hidden',
    },
    
    compactProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
  });