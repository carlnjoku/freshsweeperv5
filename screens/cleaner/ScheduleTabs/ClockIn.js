import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Card } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import COLORS from '../../../constants/colors';
import moment from 'moment';
import ROUTES from '../../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import userService from '../../../services/connection/userService';
import { sendPushNotifications } from '../../../utils/sendPushNotification';

const ClockIn = ({ route }) => {
  const { schedule, cleaner } = route.params;

  // alert(schedule.hostInfo.userId)
  console.log("Clooooooooooockin schedule", schedule)
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [distance_0, setDistance] = useState(null);
  const [status, setStatus] = useState('Not Clocked In');
  const [loading, setLoading] = useState(false);
  const [hostPushToken, setHostPushToken] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required to clock in.');
        return;
      }
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
    })();
    fetchCleanerPushTokens();
  }, []);

  const fetchCleanerPushTokens = async () => {
    await userService.getUserPushTokens(schedule.hostInfo.userId).then((response) => {
      const res = response.data.tokens;
      setHostPushToken(res);
    });
  };

  


  // const handleClockIn = async () => {
  //   setLoading(true);
  //   try {
  //     // Get the current location of the user
  //     const userLocation = await Location.getCurrentPositionAsync({});
  //     const distance = calculateDistance(
  //       userLocation.coords.latitude,
  //       userLocation.coords.longitude,
  //       schedule.schedule.apartment_latitude,
  //       schedule.schedule.apartment_longitude
  //     );
  
  //     // Get the current time and the scheduled time
  //     const currentTime = new Date();
      

  //     const cleaningDate = schedule.schedule.cleaning_date; // e.g., '2025-01-18'
  //     const cleaningTime = schedule.schedule.cleaning_end_time; // e.g., '14:30:00'

  //     // Combine date and time into a single string
  //     const combinedDateTime = `${cleaningDate}T${cleaningTime}`;

  //     // Create a new Date object
  //     const scheduleTime = new Date(combinedDateTime);
    
  //     const timeDifference = Math.abs(currentTime - scheduleTime) / (1000 * 60 * 60); // Difference in hours
  //     console.log(timeDifference)

  //     // const scheduleTime = new Date(schedule.cleaning_time); // Ensure startTime is in ISO format
  //     // const timeDifference = Math.abs(currentTime - scheduleTime) / (1000 * 60 * 60); // Difference in hours
      
  //     // if (timeDifference > 1) {
  //     //   Alert.alert(
  //     //           'Clock-In Failed',
  //     //           'Clock-in is only allowed within 1 hour of the scheduled time.',
  //     //           [{ text: 'OK', onPress: () => (goBackHome) }]
  //     //         );
  //     //   return;
  //     // }
  
  //     setDistance(distance);
  //     if (distance > 0.05) {
  //       // Clock in successfully
  //       setStatus('Clocked In');
  //       sendPushNotifications(
  //         hostPushToken,
  //         'Cleaner Clocked In!',
  //         'The cleaner has successfully clocked in and started cleaning.',
  //         {
  //           screen: ROUTES.host_task_progress,
  //           params: { scheduleId: schedule._id, schedule:schedule },
  //         }
  //       );
  
  //       const data = { cleanerId: cleaner?.cleanerId, scheduleId: schedule._id };
  //       await userService.clockIn(data);
  
  //       // Navigate to the next screen
  //       navigation.navigate(ROUTES.cleaner_attach_task_photos, {
  //         scheduleId: schedule._id,
  //         hostId: schedule.hostInfo._id,
  //       });
  //     } else {
       
  //       // Navigate to the next screen
  //       navigation.navigate(ROUTES.cleaner_attach_task_photos, {
  //         scheduleId: schedule._id,
  //         hostId: schedule.hostInfo._id,
  //       });
        
  //       Alert.alert(
  //         'Clock-In Failed',
  //         'You must be within 50 meters of the scheduled location to clock in. Please ensure you are at the correct address and try again.',
  //         [{ text: 'OK', onPress: () => (goBackHome) }]
  //       );
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleClockIn = async () => {
    setLoading(true);
    try {
      // Get the current location of the user
      const userLocation = await Location.getCurrentPositionAsync({});
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        schedule.schedule.apartment_latitude,
        schedule.schedule.apartment_longitude
      );
  
      // Get the current time and the scheduled time
      const currentTime = new Date();
      
      const cleaningDate = schedule.schedule.cleaning_date;
      const cleaningTime = schedule.schedule.cleaning_end_time;
      const combinedDateTime = `${cleaningDate}T${cleaningTime}`;
      const scheduleTime = new Date(combinedDateTime);
    
      const timeDifference = Math.abs(currentTime - scheduleTime) / (1000 * 60 * 60);
      console.log(timeDifference)
  
      setDistance(distance);
      if (distance > 0.05) {
        // Clock in successfully
        setStatus('Clocked In');
  
        const data = { cleanerId: cleaner?.cleanerId, scheduleId: schedule._id };
        await userService.clockIn(data);
  
        // Navigate to the next screen
        navigation.navigate(ROUTES.cleaner_attach_task_photos, {
          scheduleId: schedule._id,
          hostId: schedule.hostInfo.userId,
        });
      } else {
        // Navigate to the next screen even if distance check fails (for testing)
        navigation.navigate(ROUTES.cleaner_attach_task_photos, {
          scheduleId: schedule._id,
          hostId: schedule.hostInfo.userId,
        });
        
        Alert.alert(
          'Clock-In Failed',
          'You must be within 50 meters of the scheduled location to clock in. Please ensure you are at the correct address and try again.',
          [{ text: 'OK', onPress: () => (goBackHome) }]
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Distance in km
  };

  const startTime = schedule.schedule.cleaning_time;
  const durationInMinutes = schedule?.schedule?.total_cleaning_time;
  const calculateEndTime = (startTime, durationInMinutes) => {
    const endTime = moment(startTime, 'hh:mm A').add(durationInMinutes, 'minutes');
    return endTime.format('hh:mm A');
  };
  const endTime = calculateEndTime(startTime, durationInMinutes);

  const goBackHome = () => {
    navigation.navigate(ROUTES.cleaner_dashboard)
  }
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={loading}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.darkBlue} />
            <Text style={styles.modalText}>Clocking In...</Text>
            <Text style={styles.modalText}>Please be patient</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerText}>Clock In</Text>
      </View>
      <Card style={styles.card}>
        <View style={styles.userInfo}>
          <Image source={{ uri: cleaner?.avatar }} style={styles.avatar} />
          <View style={styles.details}>
            <Text style={styles.name}>{cleaner?.firstname} {cleaner?.lastname}</Text>
            <Text style={styles.jobTitle}>Cleaner</Text>
          </View>
        </View>
      </Card>

      <View style={styles.locationContainer}>
         <Text style={styles.date}>Location</Text>
       </View>
       <Card style={styles.card}>
         <View style={styles.address}>
           <Text>{schedule.schedule.address}</Text>
         </View>
       </Card>


       {/* Current Time */}
       <View style={styles.timeContainer}>
         <Text style={styles.date}>{moment(schedule.schedule.cleaning_date).format('dddd, MMM D')}</Text>
       </View>
       <Card style={styles.card}>
         <View style={styles.duration}>
           <View style={{flexDirection:'row', justifyContent:'space-between'}}>
             <Text >Start</Text>
             <Text>End</Text>
            
           </View>

           <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:20}}>
             <Text style={styles.time}>{moment(schedule.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
             <Text style={styles.time}>{endTime}</Text>
           </View>
         </View>
       </Card>

      <TouchableOpacity style={styles.clockInButton} onPress={handleClockIn}>
        <MaterialIcons name="login" size={24} color="#fff" />
        <Text style={styles.clockInText}>Clock In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  header: { marginBottom: 20, alignItems: 'center' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  card: { padding: 16, borderRadius: 12, marginBottom: 20, backgroundColor: '#fff' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: '#333' },
  jobTitle: { fontSize: 14, color: '#666' },
  clockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.darkBlue,
    borderRadius: 8,
  },
  clockInText: { fontSize: 18, color: '#fff', fontWeight: '600', marginLeft: 8 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: { marginTop: 10, fontSize: 16, color: '#333' },
  clock:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  duration:{
    height:100
  },
  jobTitle: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  time: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 18,
    color: '#888',
  },
});

export default ClockIn;





// import React, { useState, useEffect, useContext } from 'react';
// import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
// import { Avatar, Button, TextInput, Checkbox } from 'react-native-paper';
// import moment from 'moment';
// import * as Location from 'expo-location';
// import { AuthContext } from '../../../context/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';



// const ClockInScreen = ({ route }) => {

//   const { schedule } = route.params;
//   const navigation = useNavigation();

//   const { currentUser } = useContext(AuthContext);
//   const [clockInTime, setClockInTime] = useState(null);
//   const [elapsedTime, setElapsedTime] = useState(null);
//   const [locationGranted, setLocationGranted] = useState(false);
//   const [notes, setNotes] = useState('');
//   const [checklist, setChecklist] = useState({
//     photosTaken: false,
//     reviewedTasks: false
//   });

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       setLocationGranted(status === 'granted');
//     })();
//   }, []);

//   useEffect(() => {
//     let timer;
//     if (clockInTime) {
//       timer = setInterval(() => {
//         const duration = moment.duration(moment().diff(clockInTime));
//         const minutes = Math.floor(duration.asMinutes());
//         setElapsedTime(`${minutes} min${minutes !== 1 ? 's' : ''}`);
//       }, 60000);
//     }
//     return () => clearInterval(timer);
//   }, [clockInTime]);

//   const handleClockIn = () => {
//     if (!locationGranted) {
//       Alert.alert('Location Required', 'Please enable location services to clock in.');
//       return;
//     }
//     setClockInTime(moment());
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.header}>
//         <Avatar.Image size={60} source={{ uri: currentUser?.avatar || 'https://via.placeholder.com/150' }} />
//         <Text style={styles.name}>{currentUser?.firstname} {currentUser?.lastname}</Text>
//         <Text style={styles.role}>Cleaner</Text>
//       </View>

//       <View style={styles.scheduleBox}>
//         <Text style={styles.scheduleTitle}>Today's Task</Text>
//         <Text style={styles.taskText}> <AntDesign name="home" size={20} color={COLORS.gray}/> {schedule?.schedule?.apartment_name}</Text>
//         <Text style={styles.taskText}> <AntDesign name="calendar" size={20} color={COLORS.gray}/> {moment(schedule?.schedule?.cleaning_date).format("dddd, MMM D")}</Text>
//         <Text style={styles.taskText}> <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.gray}/> {moment(schedule?.schedule?.cleaning_time, "HH:mm:ss").format("hh:mm A")}</Text>

//       </View>

//       <Text style={styles.locationNotice}>
//         {locationGranted ? '📍 Location access granted.' : '⚠️ Location not enabled. Required to clock in.'}
//       </Text>

//       {!clockInTime ? (
//         <Button mode="contained" onPress={handleClockIn} style={styles.clockInButton}>
//           Clock In
//         </Button>
//       ) : (
//         <View style={styles.clockStatus}>
//           <Text style={styles.clockedInText}>✅ Clocked in at: {clockInTime.format('h:mm A')}</Text>
//           <Text style={styles.elapsed}>⏱ Time Elapsed: {elapsedTime}</Text>
//         </View>
//       )}

//       <View style={styles.checklist}>
//         <Text style={styles.checklistTitle}>Pre-Clean Checklist</Text>
//         <View style={styles.checkboxItem}>
//           <Checkbox.Android
//             status={checklist.photosTaken ? 'checked' : 'unchecked'}
//             onPress={() => setChecklist(prev => ({ ...prev, photosTaken: !prev.photosTaken }))}
//             color={COLORS.primary_light}
//           />
//           <Text>Before cleaning photos taken</Text>
//         </View>
//         <View style={styles.checkboxItem}>
//           <Checkbox.Android
//             status={checklist.reviewedTasks ? 'checked' : 'unchecked'}
//             onPress={() => setChecklist(prev => ({ ...prev, reviewedTasks: !prev.reviewedTasks }))}
//             color={COLORS.primary_light}
//           />
//           {/* <Checkbox
//             status={checklist.reviewedTasks ? 'checked' : 'unchecked'}
//             onPress={() => setChecklist(prev => ({ ...prev, reviewedTasks: !prev.reviewedTasks }))}
//           /> */}
//           <Text>Reviewed assigned tasks</Text>
//         </View>
//       </View>

//       <TextInput
//         label="Notes or observations"
//         value={notes}
//         onChangeText={setNotes}
//         multiline
//         numberOfLines={4}
//         mode="outlined"
//         style={styles.notesInput}
//       />

   
//     </ScrollView>
//   );
// };

// export default ClockInScreen;

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 20
//   },
//   name: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 10
//   },
//   role: {
//     fontSize: 14,
//     color: 'gray'
//   },
//   scheduleBox: {
//     backgroundColor: '#f2f2f2',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15
//   },
//   scheduleTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5
//   },
//   taskText: {
//     fontSize: 14,
//     marginBottom: 2
//   },
//   locationNotice: {
//     fontSize: 13,
//     marginBottom: 15,
//     color: 'gray'
//   },
//   clockInButton: {
//     marginBottom: 20,
//     backgroundColor:COLORS.darkBlue
//   },
//   clockStatus: {
//     alignItems: 'center',
//     marginBottom: 20
//   },
//   clockedInText: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 5
//   },
//   elapsed: {
//     fontSize: 13,
//     color: 'gray'
//   },
//   checklist: {
//     marginBottom: 20
//   },
//   checklistTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10
//   },
//   checkboxItem: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   notesInput: {
//     marginBottom: 30
//   }
// });