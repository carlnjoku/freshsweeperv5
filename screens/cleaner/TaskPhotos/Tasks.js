// import React, { useContext, useEffect,useState } from 'react';
// import { SafeAreaView, Text, StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import COLORS from '../../../constants/colors';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import BeforePhoto from './BeforePhoto';
// import AfterPhoto from './AfterPhoto';
// import ReportIncident from './ReportIncident';
// // import { useCleaningTimer } from '../../context/CleaningTimerContext';


// const Tasks = ({route}) => {

//   const cleaningTasks = [
//     { id: 1, name: 'Clean Bedroom', task_title: 'Bedroom', completed: false },
//     { id: 2, name: 'Clean Bathroom', task_title: 'Bathroom', completed: false },
//     { id: 3, name: 'Clean Livingroom', task_title: 'Livingroom', completed: false },
//   ];

//   const{scheduleId, schedule, hostId} = route.params

//   console.log(schedule)
//   console.log("Routtinnnnnn", hostId)


//   // const { startTimer } = useCleaningTimer();
//   // startTimer(1800, schedule); // Start a 30-minute timer

  
  

 
//   const [currentStep, setCurrentStep] = useState(1);

//   const handleNextStep = () => {
//     if (currentStep < 3) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor:COLORS.white }}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
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
//           <Text style={styles.tab_text}>Incident Report</Text>
//         </TouchableOpacity>
        
//       </View>

      
//       {/* Content for each step */}
//       <View style={styles.container}>
//         {currentStep === 1 && <BeforePhoto scheduleId={scheduleId}/>}
//         {currentStep === 2 && <AfterPhoto scheduleId={scheduleId} hostId={schedule?.hostInfo?.userId || hostId} />}
//         {/* {currentStep === 2 && <AfterPhoto scheduleId={scheduleId} hostId={hostId}  tasksList={cleaningTasks}/>} */}
//         {currentStep === 3 && <ReportIncident scheduleId={scheduleId}/>}
        
//       </View>
      

//       {/* Tab bar with icons */}
      


//       {/* <View style={styles.navigation}>
//         <TouchableOpacity onPress={handlePrevStep} style={styles.arrowButton}>
//           <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleNextStep} style={styles.arrowButton}>
//           <MaterialCommunityIcons name="arrow-right" size={24} color="black" />
//         </TouchableOpacity>
//       </View> */}
//     </View>
    
//   );
// };


// const styles = StyleSheet.create({
//   container:{
//     flex:1, 
//     margin:10,
//     backgroundColor:COLORS.white
//   },
//   tabsContainer:{
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 0,
//     borderBottomColor: "#e9e9e9",
//     elevation:2
//   },
//   tab:{
//     borderBottomWidth:3,
//     borderBottomColor: COLORS.primary,
//     alignItems:'center',
//     marginTop:10,
//     paddingHorizontal:26
//   },
//   tab_text:{
//     marginBottom:5,
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
// })
// export default Tasks;






// Tasks.js - Updated version with the fix


// Tasks.js - Updated version with fixed height progress indicator

// Tasks.js - Updated with vertically aligned tab icons and labels

import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import COLORS from '../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BeforePhoto from './BeforePhoto';
import AfterPhoto from './AfterPhoto';
import ReportIncident from './ReportIncident';
import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';

const Tasks = ({route}) => {
  const {scheduleId, schedule, hostId} = route.params;
  const { currentUserId } = useContext(AuthContext);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isBeforePhotosComplete, setIsBeforePhotosComplete] = useState(false);
  const [isLoadingBeforePhotosStatus, setIsLoadingBeforePhotosStatus] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const checkRef = useRef(false); // To prevent infinite calls

  // Check if all before photos are completed
  const checkBeforePhotosCompletion = useCallback(async () => {
    if (checkRef.current) return; // Prevent multiple simultaneous calls
    
    checkRef.current = true;
    try {
      setIsLoadingBeforePhotosStatus(true);
      const response = await userService.getUpdatedImageUrls(scheduleId);
      const res = response.data.data;
      
      // Find cleaner by ID
      const getCleanerById = (id) => {
        return res.assignedTo.find(cleaner => cleaner.cleanerId === id);
      };
      
      const cleanerData = getCleanerById(currentUserId);
      const beforePhotos = cleanerData?.before_photos || {};
      
      // Check if all rooms have at least 3 photos
      const rooms = Object.keys(beforePhotos);
      let allRoomsComplete = false;
      
      if (rooms.length === 0) {
        allRoomsComplete = false;
      } else {
        allRoomsComplete = rooms.every(room => {
          const roomPhotos = beforePhotos[room]?.photos || [];
          return roomPhotos.length >= 3;
        });
      }
      
      setIsBeforePhotosComplete(allRoomsComplete);
      setHasInitialized(true);
      return allRoomsComplete;
    } catch (error) {
      console.error('Error checking before photos:', error);
      setIsBeforePhotosComplete(false);
      setHasInitialized(true);
      return false;
    } finally {
      setIsLoadingBeforePhotosStatus(false);
      checkRef.current = false;
    }
  }, [scheduleId, currentUserId]);

  // Memoize the update function
  const handleBeforePhotosUpdated = useCallback(() => {
    console.log("Before photos updated, checking completion...");
    checkBeforePhotosCompletion();
  }, [checkBeforePhotosCompletion]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialStatus = async () => {
      if (isMounted && !hasInitialized) {
        await checkBeforePhotosCompletion();
      }
    };
    
    loadInitialStatus();
    
    return () => {
      isMounted = false;
    };
  }, [checkBeforePhotosCompletion, hasInitialized]);

  const handleTabPress = (step) => {
    if (step === 2) {
      // Check if before photos are complete
      if (!isBeforePhotosComplete) {
        Alert.alert(
          "Before Photos Required",
          "You must complete before photos for all rooms before proceeding to after photos. Please upload at least 3 photos for each room in the Before Photos tab.",
          [
            { text: "OK", onPress: () => setCurrentStep(1) }
          ]
        );
        return;
      }
    }
    setCurrentStep(step);
  };

  // Calculate progress text based on current step
  const getProgressContent = () => {
    if (currentStep === 1) {
      if (isLoadingBeforePhotosStatus) {
        return (
          <View style={styles.progressContent}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.progressText}>Checking before photos status...</Text>
          </View>
        );
      }
      return (
        <View style={styles.progressContent}>
          <Text style={styles.progressText}>
            Before Photos Status: {isBeforePhotosComplete ? '✓ Complete' : 'Incomplete'}
          </Text>
          <Text style={styles.progressSubtext}>
            {isBeforePhotosComplete 
              ? 'All rooms have sufficient before photos. You can proceed to After Photos.'
              : 'Complete before photos for all rooms to unlock After Photos tab.'}
          </Text>
        </View>
      );
    } else if (currentStep === 2) {
      return (
        <View style={styles.progressContent}>
          <Text style={styles.progressText}>
            After Photos: {isBeforePhotosComplete ? '✓ Unlocked' : 'Locked'}
          </Text>
          <Text style={styles.progressSubtext}>
            {isBeforePhotosComplete 
              ? 'Document cleaning results for each room.'
              : 'Complete before photos first.'}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.progressContent}>
          <Text style={styles.progressText}>Incident Report</Text>
          <Text style={styles.progressSubtext}>
            Report any issues or incidents during cleaning
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor:COLORS.white }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Always render the progress indicator with fixed height */}
      {/* <View style={styles.progressIndicator}>
        {getProgressContent()}
      </View> */}

      <View style={styles.tabsContainer}>
        {/* Before Photos Tab */}
        <TouchableOpacity 
          style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} 
          onPress={() => setCurrentStep(1)}
        >
          <View style={styles.tabContent}>
            <MaterialCommunityIcons 
              name="camera" 
              size={24} 
              color={currentStep === 1 ? COLORS.primary : COLORS.gray} 
            />
            <Text style={[styles.tab_text, currentStep === 1 && styles.activeTabText]}>
              Before Photos
            </Text>
          </View>
          {isBeforePhotosComplete && currentStep !== 1 && (
            <View style={styles.completeBadge}>
              <MaterialCommunityIcons name="check" size={10} color="white" />
            </View>
          )}
        </TouchableOpacity>
        
        {/* After Photos Tab - Conditionally disabled */}
        <TouchableOpacity 
          style={[
            styles.tab, 
            { 
              borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0",
              opacity: isBeforePhotosComplete ? 1 : 0.5
            }
          ]} 
          onPress={() => handleTabPress(2)}
          disabled={!isBeforePhotosComplete && !isLoadingBeforePhotosStatus}
        >
          <View style={styles.tabContent}>
            <MaterialCommunityIcons 
              name="camera-flip" 
              size={24} 
              color={
                currentStep === 2 ? COLORS.primary : 
                isBeforePhotosComplete ? COLORS.gray : COLORS.lightGray
              } 
            />
            <Text style={[
              styles.tab_text,
              !isBeforePhotosComplete && styles.disabledTabText,
              currentStep === 2 && styles.activeTabText
            ]}>
              After Photos
            </Text>
          </View>
          {!isBeforePhotosComplete && !isLoadingBeforePhotosStatus && (
            <View style={styles.lockedBadge}>
              <MaterialCommunityIcons name="lock" size={10} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Incident Report Tab */}
        <TouchableOpacity 
          style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary :"#f0f0f0"}]} 
          onPress={() => setCurrentStep(3)}
        >
          <View style={styles.tabContent}>
            <MaterialCommunityIcons 
              name="format-list-checks" 
              size={24} 
              color={currentStep === 3 ? COLORS.primary : COLORS.gray} 
            />
            <Text style={[styles.tab_text, currentStep === 3 && styles.activeTabText]}>
              Incident Report
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content for each step */}
      <View style={styles.container}>
        {currentStep === 1 && (
          <BeforePhoto 
            scheduleId={scheduleId}
            onPhotosUpdated={handleBeforePhotosUpdated}
          />
        )}
        {currentStep === 2 && isBeforePhotosComplete && (
          <AfterPhoto scheduleId={scheduleId} hostId={schedule?.hostInfo?.userId || hostId} />
        )}
        {currentStep === 3 && (
          <ReportIncident scheduleId={scheduleId}/>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1, 
    margin:10,
    backgroundColor:COLORS.white
  },
  tabsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
    borderBottomColor: "#e9e9e9",
    elevation:2,
    height: 60, // Ensure consistent tab bar height
  },
  tab:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
    position: 'relative',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab_text:{
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledTabText: {
    color: COLORS.lightGray,
  },
  progressIndicator: {
    minHeight: 70, // Fixed minimum height
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  completeBadge: {
    position: 'absolute',
    top: 6,
    right: '50%',
    marginRight: -35,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    position: 'absolute',
    top: 6,
    right: '50%',
    marginRight: -35,
    backgroundColor: '#ff9800',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Tasks;