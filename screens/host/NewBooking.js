// import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
// import { 
//   View, 
//   TextInput, 
//   Text, 
//   Button, 
//   StyleSheet, 
//   StatusBar, 
//   KeyboardAvoidingView, 
//   Platform, 
//   Alert,
//   ActivityIndicator, 
//   Modal, 
//   TouchableOpacity 
// } from 'react-native';
// import PropertyDetails from './CreateBookingContents/PropertyDetails';
// import { AuthContext } from '../../context/AuthContext';
// import Duration from './CreateBookingContents/Duration';
// import CleaningTask from './CreateBookingContents/CleaningTask';
// import Review from './CreateBookingContents/Review';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import { useBookingContext } from '../../context/BookingContext';
// import { useNavigation } from '@react-navigation/native'
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos, checklist } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { formatDateToYYYYMMDD } from '../../utils/formatDate';

// const NewBooking = ({schedule, close_modal, mode, route}) => {
//   const {currency, currentUser, currentUserId} = useContext(AuthContext);
//   const {
//     formData, 
//     setFormData, 
//     setModalVisible, 
//     scheduleStep, 
//     selectedChecklistId, 
//     setScheduleStep, 
//     resumeAfterChecklist,
//     setResumeAfterChecklist, 
//     modalVisible, 
//     resetFormData, 
//     handleCreateSchedule} = useBookingContext();

   
   
  
//   // Example usage
//   useEffect(() => {
//     if (selectedChecklistId) {
//       setFormData(prev => ({
//         ...prev,
//         checklist_id: selectedChecklistId,
//       }));
//     }
//   }, [selectedChecklistId]);


//   const navigation = useNavigation();


 


//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [checkList, setChecklist] = useState([]);
//   const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);
  
//   // 🔥 UPDATED: Remove old isValid state and use ref-based validation
//   const [stepValidations, setStepValidations] = useState({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true   // Review step is always valid
//   });

//   // 🔥 NEW: Use a ref to track validation without causing re-renders
//   const validationRef = useRef({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   // 🔥 NEW: Job tracking states
//   const [currentJobId, setCurrentJobId] = useState(null);
//   const [jobStatus, setJobStatus] = useState(null);
//   const [jobProgress, setJobProgress] = useState('');
//   const [isPolling, setIsPolling] = useState(false);
//   const [pollingComplete, setPollingComplete] = useState(false);
//   const [pollingError, setPollingError] = useState(null);
//   const [progressPercentage, setProgressPercentage] = useState(0);
//   const [additionalInfo, setAdditionalInfo] = useState('');

//   const taskTimes = {
//     "Window Washing": 20,
//     "Inside Cabinets": 15,
//     "Carpet Cleaning": 30,
//     "Upholstery Cleaning": 20,
//     "Tile & Grout Cleaning": 50,
//     "Hardwood Floor Refinishing": 50,
//     "Inside Fridge": 5,
//     "Inside Oven": 30,
//     "Pet Cleanup": 20,
//     "Dishwasher": 30,
//     "Laundry": 30,
//     "Exterior": 120,
//   };

  

//   useEffect(() => {
//     if (schedule && !formData.cleaning_date) {
//       setFormData(schedule.schedule);
//     }
  
//     if (!modalVisible) {
//       resetFormData();
//       // Reset validation when modal closes
//       validationRef.current = {
//         step1: false,
//         step2: false,
//         step3: false,
//         step4: true
//       };
//       setStepValidations({
//         step1: false,
//         step2: false,
//         step3: false,
//         step4: true
//       });
//     }
//   }, [schedule, modalVisible, mode, resetFormData, setFormData]);


//   useEffect(() => {
//     console.log(`Step changed to: ${step}`);
    
//     // When moving to a new step, update the validation display
//     // This ensures the validation banner shows correctly for the current step
//     const currentValidation = validationRef.current[`step${step}`];
//     console.log(`Current validation for step ${step}:`, currentValidation);
//   }, [step]);



//   // 🔥 UPDATED: validateForm function that updates both ref and state - USING useCallback
//   // const validateForm = useCallback((isFormValid) => {
//   //   if (isFormValid !== undefined) {
//   //     // Update both ref and state
//   //     validationRef.current[`step${step}`] = isFormValid;
//   //     setStepValidations(prev => ({
//   //       ...prev,
//   //       [`step${step}`]: isFormValid
//   //     }));
//   //   }
//   // }, [step]); // 🔥 IMPORTANT: Add step as dependency

//   const validateForm = useCallback((isFormValid) => {
//     if (isFormValid !== undefined) {
//       // Update both ref and state
//       validationRef.current[`step${step}`] = isFormValid;
//       setStepValidations(prev => ({
//         ...prev,
//         [`step${step}`]: isFormValid
//       }));
//     }
//   }, [step]);

//   // Add this useEffect to debug
// useEffect(() => {
//   console.log("FormData details:", formData.details);
//   console.log("FormData checklistId:", formData.checklistId);
//   console.log("FormData total_cleaning_fee:", formData.total_cleaning_fee);
//   console.log("FormData total_cleaning_time:", formData.total_cleaning_time);
// }, [formData.details, formData.checklistId, formData.total_cleaning_fee, formData.total_cleaning_time]);

// // useEffect(() => {
// //   if (modalVisible) {
// //     // Ensure we land on the correct step when reopening
// //     setScheduleStep(prev => prev || 'cleaningTask');
// //   }
// // }, [modalVisible]);

//   // 4. Add a function to reset validation for steps after a given step:
// const resetSubsequentStepsValidation = useCallback((fromStep) => {
//   console.log(`Resetting validation from step ${fromStep + 1} onwards`);
  
//   // Reset validation for all steps after the current step
//   for (let i = fromStep + 1; i <= 3; i++) {
//     validationRef.current[`step${i}`] = false;
//     setStepValidations(prev => ({
//       ...prev,
//       [`step${i}`]: false
//     }));
//   }
// }, []);



//   // 🔥 NEW: Get current step validation status
//   const getCurrentStepValidation = useCallback(() => {
//     return validationRef.current[`step${step}`];
//   }, [step]);

//   const handleOnCleaningTime = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_time: value }));
//   }, [setFormData]);

//   const handleOnCleaningDate = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_date: value }));
//   }, [setFormData]);

//   const handleSelectedProperty = useCallback((text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}));
//   }, [setFormData]);

//   const handleCleanignExtraSelection = useCallback((selectedExtras) => {
//     setExtras(selectedExtras);
//   }, []);

//   const handleExtraTaskTime = useCallback((extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData(prevState => ({...prevState, [input]: extraCleaningTime}));
//   }, [setFormData]);

//   const handleTotalTaskTime = useCallback((totalTime, input) => {
//     setFormData(prevState => ({...prevState, [input]: totalTime}));
//   }, [setFormData]);

//   const handleBedroomBathroom = useCallback((text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}));
//   }, [setFormData]);

//   const handleNextStep = useCallback(() => {
//     // 🔥 UPDATED: Use ref validation instead of state
//     if (getCurrentStepValidation()) {
//       setStep(prevStep => prevStep + 1);
//     }
//   }, [getCurrentStepValidation]);

//   // const handlePrevStep = useCallback(() => {
//   //   setStep(prevStep => prevStep - 1);
//   // }, []);

//   const handlePrevStep = useCallback(() => {
//     // When going back, we might need to reset validation for the current step
//     // depending on what changes the user might make
//     if (step > 1) {
//       setStep(prevStep => prevStep - 1);
//     }
//   }, [step]);

//   const handleEditStep = useCallback((stp) => {
//     setStep(stp);
//   }, []);

//   const handleInputChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, [setFormData]);

//   const handleClose = useCallback(() => {
//     setModalVisible(false);
//     setFormData("");
//   }, [setModalVisible, setFormData]);

  

//   const handleCreateChecklist = () => {
//     setScheduleStep('cleaningTask');
//     setResumeAfterChecklist(true);
//     setModalVisible(false);
  
//     navigation.navigate(ROUTES.host_create_checklist,{
//       source: 'schedule',
//     });
//   };
  

  

  

//   // 6. Create a function to check if formData has changed and reset validation:
// const checkAndResetValidation = useCallback(() => {
//   // This function should be called when formData changes significantly
//   // For now, we'll log when formData changes
//   console.log("FormData changed significantly:", {
//     aptId: formData.aptId,
//     checklistId: formData.checklistId,
//     cleaning_date: formData.cleaning_date,
//     cleaning_time: formData.cleaning_time
//   });
// }, [formData]);

// // 7. Call checkAndResetValidation when formData changes:
// useEffect(() => {
//   checkAndResetValidation();
// }, [formData.aptId, formData.checklistId, checkAndResetValidation]);

// // useEffect(() => {
// //   if (!modalVisible) return;
// //   if (!resumeAfterChecklist) return;
// //   if (!scheduleStep) return;

// //   const stepMap = {
// //     property: 1,
// //     duration: 2,
// //     cleaningTask: 3,
// //     review: 4,
// //   };

// //   const mappedStep = stepMap[scheduleStep];

// //   if (mappedStep && mappedStep !== step) {
// //     console.log('🔁 Resuming schedule at step:', mappedStep);
// //     setStep(mappedStep);

// //     // 🔥 one-time resume
// //     setResumeAfterChecklist(false);
// //     setScheduleStep(null);
// //   }
// // }, [modalVisible, resumeAfterChecklist, scheduleStep]);


// useEffect(() => {
//   if (!modalVisible) return;
//   if (!resumeAfterChecklist) return;
//   if (!scheduleStep) return;

//   const stepMap = {
//     property: 1,
//     duration: 2,
//     cleaningTask: 3,
//     review: 4,
//   };

//   const mappedStep = stepMap[scheduleStep];

//   if (mappedStep && mappedStep !== step) {
//     setStep(mappedStep);
//   }

//   // 🔑 IMPORTANT: consume the resume flag
//   setResumeAfterChecklist(false);
//   setScheduleStep(null);
// }, [modalVisible, resumeAfterChecklist, scheduleStep]);



// useEffect(() => {
//   console.log('MODAL OPEN:', modalVisible);
//   console.log('SCHEDULE STEP:', scheduleStep);
// }, [modalVisible, scheduleStep]);



// // const handlePropertyChange = useCallback((newPropertyData) => {
// //   console.log("Property changed, resetting subsequent steps validation");
  
// //   // Reset validation for steps 2 and 3
// //   resetSubsequentStepsValidation(1);
  
// //   // Also reset the form data for steps 2 and 3 in the formData
// //   setFormData(prev => ({
// //     ...prev,
// //     cleaning_end_time: '',
// //     checklistId: null,
// //     checklistName: null,
// //     checklistTasks: [],
// //     total_cleaning_fee: newPropertyData.regular_cleaning_fee || 0,
// //     total_cleaning_time: newPropertyData.regular_cleaning_time || 0
// //   }));
// // }, [resetSubsequentStepsValidation, setFormData]);


// const goToChecklist = () => {
//   setModalVisible(false);
//   setTimeout(() => {
//     navigation.navigate(ROUTES.host_create_checklist, { propertyId: propertyData.aptId });
//   }, 300);
// }

// const handlePropertyChange = useCallback((newPropertyData) => {
//   console.log("Property changed, resetting subsequent steps validation");

//   console.log("My property selected______", newPropertyData)

//   // 1️⃣ Always reset steps 2 & 3 state
//   resetSubsequentStepsValidation(1);

//   setFormData(prev => ({
//     ...prev,
//     cleaning_end_time: '',
//     checklistId: null,
//     checklistName: null,
//     checklistTasks: [],
//     total_cleaning_fee: newPropertyData.regular_cleaning_fee || 0,
//     total_cleaning_time: newPropertyData.regular_cleaning_time || 0
//   }));

//   // 2️⃣ Checklist gate (AFTER property is selected)
//   const hasChecklist =
//     newPropertyData?.checklists?.length > 0 ||
//     !!newPropertyData?.default_checklist;

//   if (!hasChecklist) {
//     Alert.alert(
//       'Checklist Required',
//       'You need to create a checklist before scheduling a cleaning.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Create Checklist',
//           onPress: goToChecklist,
//         },
//       ]
//     );
//     return; // ⛔ stop here
//   }

//   // 3️⃣ Checklist exists → allow normal progression
//   setStep(2);

// }, [
//   resetSubsequentStepsValidation,
//   setFormData,
//   navigation,
//   setModalVisible,
//   setStep
// ]);

//   const createTaskChecklist = useCallback(() => {
//     if (formData.extra && formData.extra.length > 0) {
//       const formattedExtras = formData.extra.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const cleanedArray = formattedExtras.map(service => {
//         const { icon, price, ...valueWithoutIconAndPrice } = service.value;
//         return {
//           ...service,
//           value: valueWithoutIconAndPrice
//         };
//       });

//       const formattedRegular = formData.regular_cleaning.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const updatedChecklist = [...cleanedArray, ...formattedRegular];
//       setUpdatedTaskChecklist(updatedChecklist);
//     } else {
//       const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       })) || [];
//       setUpdatedTaskChecklist(formattedRegular);
//     }
//   }, [formData.extra, formData.regular_cleaning]);

//   // In your NewBooking component - enhanced polling function
//   const startJobPolling = useCallback(async (jobId) => {
//     setCurrentJobId(jobId);
//     setIsPolling(true);
//     setPollingComplete(false);
//     setPollingError(null);
    
//     let pollCount = 0;
//     const maxPolls = 60;
    
//     const pollInterval = setInterval(async () => {
//       pollCount++;
      
//       try {
//         const response = await userService.getJobStatus(jobId);
//         const statusData = response.data;
        
//         setJobStatus(statusData.status);
        
//         // 🔥 ENHANCED: Use detailed progress information
//         if (statusData.progress) {
//           const progress = statusData.progress;
          
//           // Set progress percentage for progress bar
//           if (progress.percentage !== undefined) {
//             setProgressPercentage(progress.percentage);
//           }
          
//           // Set detailed progress message
//           if (progress.current_action) {
//             setJobProgress(progress.current_action);
//           } else if (progress.current_stage) {
//             // Fallback to stage-based messages
//             const stageMessages = {
//               'starting': '🔄 Starting schedule processing...',
//               'finding_cleaners': '🔍 Finding available cleaners in your area...',
//               'sending_host_notification': '📧 Sending confirmation...',
//               'sending_cleaner_requests': '📨 Notifying available cleaners...',
//               'completed': '✅ All tasks completed! Redirecting...',
//               'error': '❌ An error occurred'
//             };
//             setJobProgress(stageMessages[progress.current_stage] || progress.current_stage);
//           }
          
//           // Show additional details if available
//           if (progress.cleaners_found !== undefined) {
//             setAdditionalInfo(`Found ${progress.cleaners_found} cleaners`);
//           }
//           if (progress.notifications_sent !== undefined) {
//             setAdditionalInfo(`Notified ${progress.notifications_sent} cleaners`);
//           }
//         } else {
//           // Fallback to status-based messages
//           switch (statusData.status) {
//             case 'queued':
//               setJobProgress('🔄 Your schedule is in queue...');
//               setProgressPercentage(0);
//               break;
//             case 'started':
//               setJobProgress('🔄 Processing your schedule...');
//               setProgressPercentage(25);
//               break;
//             case 'finished':
//               setJobProgress('✅ All tasks completed! Redirecting...');
//               setProgressPercentage(100);
//               break;
//             case 'failed':
//               setJobProgress('❌ We encountered an issue.');
//               setProgressPercentage(0);
//               break;
//           }
//         }
        
//         // Handle completion
//         if (statusData.status === 'finished') {
//           setPollingComplete(true);
//           clearInterval(pollInterval);
          
//           setTimeout(() => {
//             // Reset validation when done
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });
            
//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
        
//         // Handle errors
//         if (statusData.status === 'failed') {
//           setPollingError(statusData.error?.message || 'Job failed');
//           clearInterval(pollInterval);
//           setIsPolling(false);
//         }

//         // Safety timeout
//         if (pollCount >= maxPolls) {
//           clearInterval(pollInterval);
//           setJobProgress('✅ Schedule created! Some tasks may still be processing.');
//           setPollingComplete(true);
//           setPollingError('Processing took longer than expected');
//           setTimeout(() => {
//             // Reset validation when done
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });
            
//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//       } catch (error) {
//         console.log('Error polling job status:', error);
        
//         if (error.response?.status === 404 && pollCount > 2) {
//           setJobProgress('✅ Schedule processing completed!');
//           setPollingComplete(true);
//           clearInterval(pollInterval);
//           setTimeout(() => {
//             // Reset validation when done
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });
            
//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
//       }
//     }, 3000);

//     return () => clearInterval(pollInterval);
//   }, [handleCreateSchedule, navigation]);

  


//   const handleSubmit = useCallback(async () => {
//     // 🔥 NEW: Format date before submission
//     const formatFormDataForSubmission = () => {
//       const formatted = { ...formData };
      
//       // Format cleaning_date
//       formatted.cleaning_date = formatDateToYYYYMMDD(formatted.cleaning_date);
//       console.log("Formated schedule.....", formatted.cleaning_date);
      
//       return formatted;
//     };
    
//     // Use formatted data for submission
//     const formattedData = formatFormDataForSubmission();

//     console.log("sdoisdiosoids......", formattedData.checklistTasks )
    
//     // 🔥 FIXED: Use the structured details from formData instead of hardcoded checklist
//     const details = formattedData.details;
    
//     // If we have details, use them. Otherwise, fall back to the old system.
//     let checklistToUse = details;
    
//     // If we don't have details but have checklistId, try to construct it
//     if (!details && formattedData.checklistId) {
//       console.warn("No details found in formData, constructing from checklist data");
//       checklistToUse = {
//         checklistId: formattedData.checklistId,
//         checklistName: formattedData.checklistName,
//         checklistTasks: formattedData.checklistTasks || [],
//         totalFee: formattedData.total_cleaning_fee || 0,
//         totalTime: formattedData.total_cleaning_time || 0
//       };
//     }
    
//     // If we have details and extras, add extras to the details
//     if (details && formattedData.extra && formattedData.extra.length > 0) {
//       checklistToUse = addExtraCleaningTasks(details, formattedData.extra);
//     }
    
//     console.log("Using checklist data:", checklistToUse);
//     console.log("FormData details available:", !!formattedData.details);
    
//     const data = {
//       hostInfo: currentUser,
//       schedule: formattedData,
//       checklist: checklistToUse,  // 🔥 Use the structured checklist
//       before_photos: before_photos
//     };
  
//     console.log("The schedule payload", data);
    
//     try {
//       const response = await userService.createSchedule(data);
//       if (response.status === 200) {
//         const job_id = response.data.job_id;
        
//         Toast.show({
//           type: 'success',
//           text1: 'Schedule created! Processing notifications...',
//         });
  
//         // Start polling instead of immediate redirect
//         startJobPolling(job_id);
        
//       } else {
//         throw new Error("Failed to create schedule");
//       }
//     } catch (err) {
//       console.log(err);
//       Toast.show({
//         type: 'error',
//         text1: 'Something went wrong',
//         text2: 'Please try again',
//       });
//       setIsPolling(false);
//     }
//   }, [formData, currentUser, startJobPolling]);

//   // 🔥 NEW: Handle manual redirect if user doesn't want to wait
//   const handleManualRedirect = useCallback(() => {
//     // Reset validation when done
//     validationRef.current = {
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     };
//     setStepValidations({
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     });
    
//     setIsPolling(false);
//     handleCreateSchedule(false);
//     navigation.navigate(ROUTES.host_home_tab);
//   }, [handleCreateSchedule, navigation]);


//   console.log("NewBooking formData for Duration:", {
//     cleaning_date: formData.cleaning_date,
//     cleaning_time: formData.cleaning_time,
//     dateType: typeof formData.cleaning_date,
//     timeType: typeof formData.cleaning_time,
//     isDate: formData.cleaning_date instanceof Date,
//     isTimeDate: formData.cleaning_time instanceof Date
//   });

//   console.log("Thiiiiiiiiiiiiiiiiiiiis", formData)

  

//   return (
//     <KeyboardAvoidingView 
//       style={{ flex: 1 }} 
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="white" />
        
//         {/* Header with dynamic title */}
//         <HeaderWithStatusBarAndClose 
//           title={isPolling ? "Creating Schedule..." : "Create Schedule"} 
//           onClose={handleClose} 
//         />
        
//         <StepsIndicator step={step} />

//         {/* 🔥 UPDATED: Show validation errors at the top */}
//         {!getCurrentStepValidation() && step < 4 && (
//           <View style={styles.validationBanner}>
//             <AntDesign name="exclamationcircle" size={16} color="#fff" />
//             <Text style={styles.validationText}>
//               Please fill in all required fields to continue
//             </Text>
//           </View>
//         )}

//         {/* 🔥 UPDATED: Show progress during polling instead of form */}
//         {isPolling ? (
//           <View style={styles.progressContainer}>
//             <View style={styles.progressContent}>
//               <ActivityIndicator size="large" color={COLORS.primary} style={styles.progressSpinner} />
              
//               <Text style={styles.progressTitle}>Setting up your schedule</Text>
              
//               <Text style={styles.progressText}>{jobProgress}</Text>
              
//               {/* Show additional info based on status */}
//               {jobStatus === 'started' && (
//                 <Text style={styles.progressHint}>
//                   This usually takes 10-30 seconds as we find the best cleaners near you
//                 </Text>
//               )}
              
//               {pollingError && (
//                 <Text style={styles.errorText}>
//                   {pollingError}
//                 </Text>
//               )}
              
//               {pollingComplete && (
//                 <View style={styles.completeSection}>
//                   <AntDesign name="checkcircle" size={24} color="#4CAF50" />
//                   <Text style={styles.completeText}>
//                     All done! Redirecting...
//                   </Text>
//                 </View>
//               )}

//               {/* Manual redirect option for slow processing */}
//               {(jobStatus === 'queued' || jobStatus === 'started') && (
//                 <TouchableOpacity 
//                   style={styles.manualRedirectButton}
//                   // onPress={handleManualRedirect}
//                   onPress={() => navigation.navigate(ROUTES.host_checklist)}
//                 >
//                   <Text style={styles.manualRedirectText}>
//                     Continue to dashboard
//                   </Text>
//                   <Text style={styles.manualRedirectSubtext}>
//                     (Notifications will continue in background)
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         ) : (
//           /* Show normal form when not polling */
//           <View style={styles.form}>
//             {step === 1 && (
//               <Animatable.View animation="slideInRight" duration={550}>
//                 <PropertyDetails
//                   selectedProperty={handleSelectedProperty}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                   onPropertyChange={handlePropertyChange} // 🔥 NEW: Add this prop
//                 />
//               </Animatable.View>
//             )}
            
//             {step === 2 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Duration
//                   getCleanTime={handleOnCleaningTime}
//                   getCleanDate={handleOnCleaningDate}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                 />
//               </Animatable.View>
//             )}
            
//             {step === 3 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <CleaningTask
//                   onExtraSelect={handleCleanignExtraSelection}
//                   extraTasks={handleExtraTaskTime}
//                   totalTaskTime={handleTotalTaskTime}
//                   roomBathChange={handleBedroomBathroom}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   onAddChecklist={handleCreateChecklist}
                 
//                 />
//               </Animatable.View>
//             )}
            
//             {step === 4 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Review
//                   onExtraSelect={handleCleanignExtraSelection}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   step={handleEditStep}
//                 />
//               </Animatable.View>
//             )}
//           </View>
//         )}

//         {/* 🔥 UPDATED: Hide footer buttons during polling and use ref validation */}
//         {!isPolling && (
//           <View style={styles.footerSticky}>
//             <View style={styles.buttonRow}>
//               {step > 1 && (
//                 <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//                   <View style={styles.previous_icon}>
//                     <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                     <Text style={styles.previous_buttonText}> Previous</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}
              
//               <View style={{ flex: 1 }} />
              
//               {step < 4 ? (
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
//                   ]}
//                   onPress={handleNextStep}
//                   disabled={!getCurrentStepValidation()}
//                 >
//                   <Text style={styles.buttonText}>
//                     Next
//                   </Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity 
//                   style={styles.button} 
//                   onPress={handleSubmit}
//                   disabled={isPolling}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isPolling ? 'Publishing...' : 'Save & Publish'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Enhanced Loading Modal */}
//         <Modal visible={isPolling} transparent animationType="fade">
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Creating your schedule...</Text>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
//   },
  
//   // 🔥 NEW: Validation banner styles
//   validationBanner: {
//     backgroundColor: '#FF6B6B',
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 8,
//   },
//   validationText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
  
//   // Progress container styles
//   progressContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//     padding: 30,
//   },
//   progressContent: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   progressSpinner: {
//     marginBottom: 25,
//   },
//   progressTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   progressText: {
//     fontSize: 16,
//     color: COLORS.dark,
//     textAlign: 'center',
//     marginBottom: 15,
//     lineHeight: 22,
//   },
//   progressHint: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     fontStyle: 'italic',
//     marginTop: 10,
//     lineHeight: 18,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#f44336',
//     textAlign: 'center',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   completeSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   completeText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     textAlign: 'center',
//     marginLeft: 8,
//   },
//   manualRedirectButton: {
//     marginTop: 25,
//     padding: 15,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: '80%',
//   },
//   manualRedirectText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   manualRedirectSubtext: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   // Existing styles
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderColor: COLORS.light_gray_1,
//     marginTop: 2,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   previous_button: {
//     backgroundColor: 'transparent',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   previous_buttonText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   previous_icon: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   nextButton: {
//     backgroundColor: 'gray',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   validButton: {
//     backgroundColor: COLORS.primary,
//   },
//   invalidButton: {
//     backgroundColor: 'gray',
//   },
//   priceText: {
//     fontSize: 16,
//     marginLeft: 20,
//     color: COLORS.deepBlue,
//     fontWeight: '600',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     minWidth: 200,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   footerSticky: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },


//   progressBarBackground: {
//     width: '100%',
//     height: 8,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 4,
//     marginBottom: 15,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 4,
//   },
//   percentageText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginBottom: 20,
//   },
//   additionalInfo: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
// });

// export default NewBooking;





// import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   TouchableOpacity
// } from 'react-native';
// import PropertyDetails from './CreateBookingContents/PropertyDetails';
// import { AuthContext } from '../../context/AuthContext';
// import Duration from './CreateBookingContents/Duration';
// import CleaningTask from './CreateBookingContents/CleaningTask';
// import Review from './CreateBookingContents/Review';
// import { AntDesign } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import { useBookingContext } from '../../context/BookingContext';
// import { useNavigation } from '@react-navigation/native'
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { formatDateToYYYYMMDD } from '../../utils/formatDate';

// const NewBooking = ({ schedule, close_modal, mode, route }) => {
//   const { currency, currentUser, currentUserId } = useContext(AuthContext);

//   // const {
//   //   formData,
//   //   setFormData,
//   //   setModalVisible,
//   //   scheduleStep,
//   //   selectedChecklistId,
//   //   setScheduleStep,
//   //   resumeAfterChecklist,
//   //   setResumeAfterChecklist,
//   //   modalVisible,
//   //   resetFormData,
//   //   handleCreateSchedule
//   // } = useBookingContext();

//   const {
//     formData,
//     setFormData,
//     modalVisible,
//     resetFormData,
//     handleCreateSchedule,
//     scheduleStep,
//     selectedChecklistId,
//     setScheduleStep,
//     resumeAfterChecklist,
//     setResumeAfterChecklist,
//   } = useBookingContext();

//   const navigation = useNavigation();

//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);

//   const [stepValidations, setStepValidations] = useState({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   const validationRef = useRef({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   const hasInitialized = useRef(false);

//   const [currentJobId, setCurrentJobId] = useState(null);
//   const [jobStatus, setJobStatus] = useState(null);
//   const [jobProgress, setJobProgress] = useState('');
//   const [isPolling, setIsPolling] = useState(false);
//   const [pollingComplete, setPollingComplete] = useState(false);
//   const [pollingError, setPollingError] = useState(null);
//   const [progressPercentage, setProgressPercentage] = useState(0);
//   const [additionalInfo, setAdditionalInfo] = useState('');

//   const taskTimes = {
//     "Window Washing": 20,
//     "Inside Cabinets": 15,
//     "Carpet Cleaning": 30,
//     "Upholstery Cleaning": 20,
//     "Tile & Grout Cleaning": 50,
//     "Hardwood Floor Refinishing": 50,
//     "Inside Fridge": 5,
//     "Inside Oven": 30,
//     "Pet Cleanup": 20,
//     "Dishwasher": 30,
//     "Laundry": 30,
//     "Exterior": 120,
//   };

//   // ✅ Initialize ONLY once when modal opens
//   useEffect(() => {
//     if (!modalVisible) return;

//     if (hasInitialized.current) return;

//     setStep(1);

//     setFormData({
//       aptId: undefined,
//       checklistId: undefined,
//       cleaning_date: "",
//       cleaning_time: "",
//     });

//     validationRef.current = {
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     };

//     setStepValidations({
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     });

//     hasInitialized.current = true;
//   }, [modalVisible, setFormData]);

//   // Reset on close
//   useEffect(() => {
//     if (!modalVisible) {
//       resetFormData();
//       hasInitialized.current = false;
//     }
//   }, [modalVisible, resetFormData]);

//   // Apply selected checklist
//   useEffect(() => {
//     if (selectedChecklistId) {
//       setFormData(prev => ({
//         ...prev,
//         checklistId: selectedChecklistId,
//       }));
//     }
//   }, [selectedChecklistId]);

//   // Fix: only set schedule once (no infinite loop)
//   useEffect(() => {
//     if (!schedule) return;
//     if (!modalVisible) return;

//     if (!formData.cleaning_date) {
//       setFormData(schedule.schedule);
//     }
//   }, [schedule, modalVisible]);

//   const validateForm = useCallback((isFormValid) => {
//     validationRef.current[`step${step}`] = !!isFormValid;
//     setStepValidations(prev => ({
//       ...prev,
//       [`step${step}`]: !!isFormValid
//     }));
//   }, [step]);

//   const getCurrentStepValidation = useCallback(() => {
//     return validationRef.current[`step${step}`];
//   }, [step]);

//   const handleOnCleaningTime = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_time: value }));
//   }, [setFormData]);

//   const handleOnCleaningDate = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_date: value }));
//   }, [setFormData]);

//   const handleSelectedProperty = useCallback((text, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: text }));
//   }, [setFormData]);

//   const handleCleanignExtraSelection = useCallback((selectedExtras) => {
//     setExtras(selectedExtras);
//   }, []);

//   const handleExtraTaskTime = useCallback((extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData(prevState => ({ ...prevState, [input]: extraCleaningTime }));
//   }, [setFormData]);

//   const handleTotalTaskTime = useCallback((totalTime, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: totalTime }));
//   }, [setFormData]);

//   const handleBedroomBathroom = useCallback((text, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: text }));
//   }, [setFormData]);

//   const handleNextStep = useCallback(() => {
//     if (getCurrentStepValidation()) {
//       setStep(prevStep => prevStep + 1);
//     }
//   }, [getCurrentStepValidation]);

//   const handlePrevStep = useCallback(() => {
//     if (step > 1) {
//       setStep(prevStep => prevStep - 1);
//     }
//   }, [step]);

//   const handleEditStep = useCallback((stp) => {
//     setStep(stp);
//   }, []);

//   const handleInputChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, [setFormData]);

//   const handleClose = useCallback(() => {
//     handleCreateSchedule(false);
//     resetFormData();
//   }, [handleCreateSchedule, resetFormData]);



//   const handleCreateChecklist = () => {
//     setScheduleStep('cleaningTask');
//     setResumeAfterChecklist(true);
  
//     handleCreateSchedule(false); // ✅ close modal safely
  
//     requestAnimationFrame(() => {
//       navigation.navigate(ROUTES.host_create_checklist, {
//         source: 'schedule',
//       });
//     });
//   };

//   const handlePropertyChange = useCallback(
//     (propertyData) => {
//       const hasChecklist =
//         propertyData?.checklists?.length > 0 ||
//         !!propertyData?.default_checklist;

//       if (!hasChecklist) {
//         Alert.alert(
//           "Checklist Required",
//           "You need to create a checklist before scheduling a cleaning.",
//           [
//             { text: "Cancel", style: "cancel" },
//             {
//               text: "Create Checklist",
//               // onPress: () => {
//               //   setModalVisible(false);
//               //   navigation.navigate(ROUTES.host_create_checklist, {
//               //     propertyId: propertyData.aptId,
//               //   });
//               // },
//               onPress: () => {
//                 handleCreateSchedule(false);
              
//                 requestAnimationFrame(() => {
//                   navigation.navigate(ROUTES.host_create_checklist, {
//                     propertyId: propertyData.aptId,
//                   });
//                 });
//               }
//             },
//           ]
//         );
//         return;
//       }

//       setFormData((prev) => ({
//         ...prev,
//         aptId: propertyData.aptId,
//         checklistId: propertyData.checklistId,
//       }));

//       setStep(2);
//     },
//     [navigation, setStep, setFormData]
//   );

//   const createTaskChecklist = useCallback(() => {
//     if (formData.extra && formData.extra.length > 0) {
//       const formattedExtras = formData.extra.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const cleanedArray = formattedExtras.map(service => {
//         const { icon, price, ...valueWithoutIconAndPrice } = service.value;
//         return {
//           ...service,
//           value: valueWithoutIconAndPrice
//         };
//       });

//       const formattedRegular = formData.regular_cleaning.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const updatedChecklist = [...cleanedArray, ...formattedRegular];
//       setUpdatedTaskChecklist(updatedChecklist);
//     } else {
//       const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       })) || [];
//       setUpdatedTaskChecklist(formattedRegular);
//     }
//   }, [formData.extra, formData.regular_cleaning]);

//   const startJobPolling = useCallback(async (jobId) => {
//     setCurrentJobId(jobId);
//     setIsPolling(true);
//     setPollingComplete(false);
//     setPollingError(null);

//     let pollCount = 0;
//     const maxPolls = 60;

//     const pollInterval = setInterval(async () => {
//       pollCount++;

//       try {
//         const response = await userService.getJobStatus(jobId);
//         const statusData = response.data;

//         setJobStatus(statusData.status);

//         if (statusData.status === 'finished') {
//           setPollingComplete(true);
//           clearInterval(pollInterval);

//           setTimeout(() => {
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });

//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//         if (statusData.status === 'failed') {
//           setPollingError(statusData.error?.message || 'Job failed');
//           clearInterval(pollInterval);
//           setIsPolling(false);
//         }

//         if (pollCount >= maxPolls) {
//           clearInterval(pollInterval);
//           setJobProgress('✅ Schedule created! Some tasks may still be processing.');
//           setPollingComplete(true);
//           setPollingError('Processing took longer than expected');

//           setTimeout(() => {
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });

//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//       } catch (error) {
//         console.log('Error polling job status:', error);

//         if (error.response?.status === 404 && pollCount > 2) {
//           setJobProgress('✅ Schedule processing completed!');
//           setPollingComplete(true);
//           clearInterval(pollInterval);
//           setTimeout(() => {
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });

//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
//       }
//     }, 3000);

//     return () => clearInterval(pollInterval);
//   }, [handleCreateSchedule, navigation]);

//   const handleSubmit = useCallback(async () => {
//     const formattedData = {
//       ...formData,
//       cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date)
//     };

//     const details = formattedData.details;
//     let checklistToUse = details;

//     if (!details && formattedData.checklistId) {
//       checklistToUse = {
//         checklistId: formattedData.checklistId,
//         checklistName: formattedData.checklistName,
//         checklistTasks: formattedData.checklistTasks || [],
//         totalFee: formattedData.total_cleaning_fee || 0,
//         totalTime: formattedData.total_cleaning_time || 0
//       };
//     }

//     if (details && formattedData.extra && formattedData.extra.length > 0) {
//       checklistToUse = addExtraCleaningTasks(details, formattedData.extra);
//     }

//     const data = {
//       hostInfo: currentUser,
//       schedule: formattedData,
//       checklist: checklistToUse,
//       before_photos: before_photos
//     };

//     try {
//       const response = await userService.createSchedule(data);
//       if (response.status === 200) {
//         const job_id = response.data.job_id;

//         Toast.show({
//           type: 'success',
//           text1: 'Schedule created! Processing notifications...',
//         });

//         startJobPolling(job_id);
//       } else {
//         throw new Error("Failed to create schedule");
//       }
//     } catch (err) {
//       console.log(err);
//       Toast.show({
//         type: 'error',
//         text1: 'Something went wrong',
//         text2: 'Please try again',
//       });
//       setIsPolling(false);
//     }
//   }, [formData, currentUser, startJobPolling]);

//   const handleManualRedirect = useCallback(() => {
//     validationRef.current = {
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     };
//     setStepValidations({
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     });

//     setIsPolling(false);
//     handleCreateSchedule(false);
//     navigation.navigate(ROUTES.host_home_tab);
//   }, [handleCreateSchedule, navigation]);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="white" />

//         <HeaderWithStatusBarAndClose
//           title={isPolling ? "Creating Schedule..." : "Create Schedule"}
//           onClose={handleClose}
//         />

//         <StepsIndicator step={step} />

//         {!getCurrentStepValidation() && step < 4 && (
//           <View style={styles.validationBanner}>
//             <AntDesign name="exclamationcircle" size={16} color="#fff" />
//             <Text style={styles.validationText}>
//               Please fill in all required fields to continue
//             </Text>
//           </View>
//         )}

//         {isPolling ? (
//           <View style={styles.progressContainer}>
//             <View style={styles.progressContent}>
//               <ActivityIndicator size="large" color={COLORS.primary} style={styles.progressSpinner} />

//               <Text style={styles.progressTitle}>Setting up your schedule</Text>
//               <Text style={styles.progressText}>{jobProgress}</Text>

//               {pollingError && (
//                 <Text style={styles.errorText}>
//                   {pollingError}
//                 </Text>
//               )}

//               {pollingComplete && (
//                 <View style={styles.completeSection}>
//                   <AntDesign name="checkcircle" size={24} color="#4CAF50" />
//                   <Text style={styles.completeText}>
//                     All done! Redirecting...
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         ) : (
//           <View style={styles.form}>
//             {step === 1 && (
//               <Animatable.View animation="slideInRight" duration={550}>
//                 <PropertyDetails
//                   selectedProperty={handleSelectedProperty}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                   onPropertyChange={handlePropertyChange}
//                 />
//               </Animatable.View>
//             )}

//             {step === 2 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Duration
//                   getCleanTime={handleOnCleaningTime}
//                   getCleanDate={handleOnCleaningDate}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                 />
//               </Animatable.View>
//             )}

//             {step === 3 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <CleaningTask
//                   onExtraSelect={handleCleanignExtraSelection}
//                   extraTasks={handleExtraTaskTime}
//                   totalTaskTime={handleTotalTaskTime}
//                   roomBathChange={handleBedroomBathroom}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   onAddChecklist={handleCreateChecklist}
//                 />
//               </Animatable.View>
//             )}

//             {step === 4 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Review
//                   onExtraSelect={handleCleanignExtraSelection}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   step={handleEditStep}
//                 />
//               </Animatable.View>
//             )}
//           </View>
//         )}

//         {!isPolling && (
//           <View style={styles.footerSticky}>
//             <View style={styles.buttonRow}>
//               {step > 1 && (
//                 <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//                   <View style={styles.previous_icon}>
//                     <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                     <Text style={styles.previous_buttonText}> Previous</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}

//               <View style={{ flex: 1 }} />

//               {step < 4 ? (
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
//                   ]}
//                   onPress={handleNextStep}
//                   disabled={!getCurrentStepValidation()}
//                 >
//                   <Text style={styles.buttonText}>
//                     Next
//                   </Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={handleSubmit}
//                   disabled={isPolling}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isPolling ? 'Publishing...' : 'Save & Publish'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}

//         <Modal visible={isPolling} transparent animationType="fade">
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Creating your schedule...</Text>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
//   },
  
//   // 🔥 NEW: Validation banner styles
//   validationBanner: {
//     backgroundColor: '#FF6B6B',
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 8,
//   },
//   validationText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
  
//   // Progress container styles
//   progressContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//     padding: 30,
//   },
//   progressContent: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   progressSpinner: {
//     marginBottom: 25,
//   },
//   progressTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   progressText: {
//     fontSize: 16,
//     color: COLORS.dark,
//     textAlign: 'center',
//     marginBottom: 15,
//     lineHeight: 22,
//   },
//   progressHint: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     fontStyle: 'italic',
//     marginTop: 10,
//     lineHeight: 18,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#f44336',
//     textAlign: 'center',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   completeSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   completeText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     textAlign: 'center',
//     marginLeft: 8,
//   },
//   manualRedirectButton: {
//     marginTop: 25,
//     padding: 15,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: '80%',
//   },
//   manualRedirectText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   manualRedirectSubtext: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   // Existing styles
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderColor: COLORS.light_gray_1,
//     marginTop: 2,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   previous_button: {
//     backgroundColor: 'transparent',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   previous_buttonText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   previous_icon: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   nextButton: {
//     backgroundColor: 'gray',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   validButton: {
//     backgroundColor: COLORS.primary,
//   },
//   invalidButton: {
//     backgroundColor: 'gray',
//   },
//   priceText: {
//     fontSize: 16,
//     marginLeft: 20,
//     color: COLORS.deepBlue,
//     fontWeight: '600',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     minWidth: 200,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   footerSticky: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },


//   progressBarBackground: {
//     width: '100%',
//     height: 8,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 4,
//     marginBottom: 15,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 4,
//   },
//   percentageText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginBottom: 20,
//   },
//   additionalInfo: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
// });

// export default NewBooking;



// import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   TouchableOpacity
// } from 'react-native';
// import PropertyDetails from './CreateBookingContents/PropertyDetails';
// import { AuthContext } from '../../context/AuthContext';
// import Duration from './CreateBookingContents/Duration';
// import CleaningTask from './CreateBookingContents/CleaningTask';
// import Review from './CreateBookingContents/Review';
// import { AntDesign } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import { useBookingContext } from '../../context/BookingContext';
// import { useNavigation, useFocusEffect } from '@react-navigation/native'
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { formatDateToYYYYMMDD } from '../../utils/formatDate';

// const NewBooking = ({ schedule, close_modal, mode, route }) => {
//   const { currency, currentUser, currentUserId } = useContext(AuthContext);

//   const {
//     formData,
//     setFormData,
//     modalVisible,
//     resetFormData,
//     closeCreateSchedule,
//     scheduleStep,
//     selectedChecklistId,
//     setScheduleStep,
//     resumeAfterChecklist,
//     setResumeAfterChecklist,
//     prepareNavigation,
//     completeNavigation,
//     cancelNavigation,
//     isNavigating,
//   } = useBookingContext();

//   const navigation = useNavigation();
//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);

//   const [stepValidations, setStepValidations] = useState({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   const validationRef = useRef({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   const hasInitialized = useRef(false);
//   const alertVisibleRef = useRef(false);

//   const [currentJobId, setCurrentJobId] = useState(null);
//   const [jobStatus, setJobStatus] = useState(null);
//   const [jobProgress, setJobProgress] = useState('');
//   const [isPolling, setIsPolling] = useState(false);
//   const [pollingComplete, setPollingComplete] = useState(false);
//   const [pollingError, setPollingError] = useState(null);

//   const taskTimes = {
//     "Window Washing": 20,
//     "Inside Cabinets": 15,
//     "Carpet Cleaning": 30,
//     "Upholstery Cleaning": 20,
//     "Tile & Grout Cleaning": 50,
//     "Hardwood Floor Refinishing": 50,
//     "Inside Fridge": 5,
//     "Inside Oven": 30,
//     "Pet Cleanup": 20,
//     "Dishwasher": 30,
//     "Laundry": 30,
//     "Exterior": 120,
//   };

//   // Use focus effect to handle navigation completion
//   useFocusEffect(
//     useCallback(() => {
//       // If we're navigating and modal is visible, complete the navigation
//       if (isNavigating && modalVisible) {
//         completeNavigation();
//       }
//       return () => {
//         // Cleanup if component unmounts
//         if (isNavigating) {
//           cancelNavigation();
//         }
//       };
//     }, [isNavigating, modalVisible, completeNavigation, cancelNavigation])
//   );

//   // ✅ Initialize ONLY once when modal opens
//   useEffect(() => {
//     if (!modalVisible) return;

//     if (hasInitialized.current) return;

//     setStep(1);
//     setFormData({
//       aptId: undefined,
//       checklistId: undefined,
//       cleaning_date: "",
//       cleaning_time: "",
//     });

//     validationRef.current = {
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     };

//     setStepValidations({
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     });

//     hasInitialized.current = true;
//     alertVisibleRef.current = false;
//   }, [modalVisible, setFormData]);

//   // Reset on close
//   useEffect(() => {
//     if (!modalVisible) {
//       resetFormData();
//       hasInitialized.current = false;
//       alertVisibleRef.current = false;
//     }
//   }, [modalVisible, resetFormData]);

//   // Apply selected checklist
//   useEffect(() => {
//     if (selectedChecklistId) {
//       setFormData(prev => ({
//         ...prev,
//         checklistId: selectedChecklistId,
//       }));
//     }
//   }, [selectedChecklistId]);

//   // Fix: only set schedule once (no infinite loop)
//   useEffect(() => {
//     if (!schedule) return;
//     if (!modalVisible) return;

//     if (!formData.cleaning_date) {
//       setFormData(schedule.schedule);
//     }
//   }, [schedule, modalVisible]);

//   const validateForm = useCallback((isFormValid) => {
//     validationRef.current[`step${step}`] = !!isFormValid;
//     setStepValidations(prev => ({
//       ...prev,
//       [`step${step}`]: !!isFormValid
//     }));
//   }, [step]);

//   const getCurrentStepValidation = useCallback(() => {
//     return validationRef.current[`step${step}`];
//   }, [step]);

//   const handleOnCleaningTime = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_time: value }));
//   }, [setFormData]);

//   const handleOnCleaningDate = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_date: value }));
//   }, [setFormData]);

//   const handleSelectedProperty = useCallback((text, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: text }));
//   }, [setFormData]);

//   const handleCleanignExtraSelection = useCallback((selectedExtras) => {
//     setExtras(selectedExtras);
//   }, []);

//   const handleExtraTaskTime = useCallback((extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData(prevState => ({ ...prevState, [input]: extraCleaningTime }));
//   }, [setFormData]);

//   const handleTotalTaskTime = useCallback((totalTime, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: totalTime }));
//   }, [setFormData]);

//   const handleBedroomBathroom = useCallback((text, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: text }));
//   }, [setFormData]);

//   const handleNextStep = useCallback(() => {
//     if (getCurrentStepValidation()) {
//       setStep(prevStep => prevStep + 1);
//     }
//   }, [getCurrentStepValidation]);

//   const handlePrevStep = useCallback(() => {
//     if (step > 1) {
//       setStep(prevStep => prevStep - 1);
//     }
//   }, [step]);

//   const handleEditStep = useCallback((stp) => {
//     setStep(stp);
//   }, []);

//   const handleInputChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, [setFormData]);

//   const handleClose = useCallback(() => {
//     closeCreateSchedule();
//   }, [closeCreateSchedule]);

//   // SIMPLIFIED: Direct navigation without complex state management
//   const handleCreateChecklist = () => {
//     setScheduleStep('cleaningTask');
//     setResumeAfterChecklist(true);
    
//     // Use a simple approach: navigate immediately
//     navigation.navigate(ROUTES.host_create_checklist, {
//       source: 'schedule',
//     });
    
//     // Close modal after a short delay
//     setTimeout(() => {
//       closeCreateSchedule();
//     }, 100);
//   };

//   // SIMPLIFIED: Direct Alert handling
//   const handlePropertyChange = useCallback(
//     (propertyData) => {
//       const hasChecklist =
//         propertyData?.checklists?.length > 0 ||
//         !!propertyData?.default_checklist;

//       if (!hasChecklist) {
//         // Prevent multiple alerts
//         if (alertVisibleRef.current) return;
//         alertVisibleRef.current = true;
        
//         Alert.alert(
//           "Checklist Required",
//           "You need to create a checklist before scheduling a cleaning.",
//           [
//             { 
//               text: "Cancel", 
//               style: "cancel",
//               onPress: () => {
//                 alertVisibleRef.current = false;
//               }
//             },
//             {
//               text: "Create Checklist",
//               onPress: () => {
//                 alertVisibleRef.current = false;
//                 // Navigate immediately
//                 navigation.navigate(ROUTES.host_create_checklist, {
//                   propertyId: propertyData.aptId,
//                 });
//                 // Close modal after navigation
//                 setTimeout(() => {
//                   closeCreateSchedule();
//                 }, 100);
//               }
//             },
//           ]
//         );
//         return;
//       }

//       setFormData((prev) => ({
//         ...prev,
//         aptId: propertyData.aptId,
//         checklistId: propertyData.checklistId,
//       }));

//       setStep(2);
//     },
//     [navigation, setStep, setFormData, closeCreateSchedule]
//   );

//   // ... rest of your functions remain the same (createTaskChecklist, startJobPolling, etc.)

//   const createTaskChecklist = useCallback(() => {
//     if (formData.extra && formData.extra.length > 0) {
//       const formattedExtras = formData.extra.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const cleanedArray = formattedExtras.map(service => {
//         const { icon, price, ...valueWithoutIconAndPrice } = service.value;
//         return {
//           ...service,
//           value: valueWithoutIconAndPrice
//         };
//       });

//       const formattedRegular = formData.regular_cleaning.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const updatedChecklist = [...cleanedArray, ...formattedRegular];
//       setUpdatedTaskChecklist(updatedChecklist);
//     } else {
//       const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       })) || [];
//       setUpdatedTaskChecklist(formattedRegular);
//     }
//   }, [formData.extra, formData.regular_cleaning]);

//   const startJobPolling = useCallback(async (jobId) => {
//     setCurrentJobId(jobId);
//     setIsPolling(true);
//     setPollingComplete(false);
//     setPollingError(null);

//     let pollCount = 0;
//     const maxPolls = 60;

//     const pollInterval = setInterval(async () => {
//       pollCount++;

//       try {
//         const response = await userService.getJobStatus(jobId);
//         const statusData = response.data;

//         setJobStatus(statusData.status);

//         if (statusData.status === 'finished') {
//           setPollingComplete(true);
//           clearInterval(pollInterval);

//           setTimeout(() => {
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });

//             setIsPolling(false);
//             closeCreateSchedule();
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//         if (statusData.status === 'failed') {
//           setPollingError(statusData.error?.message || 'Job failed');
//           clearInterval(pollInterval);
//           setIsPolling(false);
//         }

//         if (pollCount >= maxPolls) {
//           clearInterval(pollInterval);
//           setJobProgress('✅ Schedule created! Some tasks may still be processing.');
//           setPollingComplete(true);
//           setPollingError('Processing took longer than expected');

//           setTimeout(() => {
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });

//             setIsPolling(false);
//             closeCreateSchedule();
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//       } catch (error) {
//         console.log('Error polling job status:', error);

//         if (error.response?.status === 404 && pollCount > 2) {
//           setJobProgress('✅ Schedule processing completed!');
//           setPollingComplete(true);
//           clearInterval(pollInterval);
//           setTimeout(() => {
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });

//             setIsPolling(false);
//             closeCreateSchedule();
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
//       }
//     }, 3000);

//     return () => clearInterval(pollInterval);
//   }, [closeCreateSchedule, navigation]);

//   const handleSubmit = useCallback(async () => {
//     const formattedData = {
//       ...formData,
//       cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date)
//     };

//     const details = formattedData.details;
//     let checklistToUse = details;

//     if (!details && formattedData.checklistId) {
//       checklistToUse = {
//         checklistId: formattedData.checklistId,
//         checklistName: formattedData.checklistName,
//         checklistTasks: formattedData.checklistTasks || [],
//         totalFee: formattedData.total_cleaning_fee || 0,
//         totalTime: formattedData.total_cleaning_time || 0
//       };
//     }

//     if (details && formattedData.extra && formattedData.extra.length > 0) {
//       checklistToUse = addExtraCleaningTasks(details, formattedData.extra);
//     }

//     const data = {
//       hostInfo: currentUser,
//       schedule: formattedData,
//       checklist: checklistToUse,
//       before_photos: before_photos
//     };

//     try {
//       const response = await userService.createSchedule(data);
//       if (response.status === 200) {
//         const job_id = response.data.job_id;

//         Toast.show({
//           type: 'success',
//           text1: 'Schedule created! Processing notifications...',
//         });

//         startJobPolling(job_id);
//       } else {
//         throw new Error("Failed to create schedule");
//       }
//     } catch (err) {
//       console.log(err);
//       Toast.show({
//         type: 'error',
//         text1: 'Something went wrong',
//         text2: 'Please try again',
//       });
//       setIsPolling(false);
//     }
//   }, [formData, currentUser, startJobPolling]);

//   const handleManualRedirect = useCallback(() => {
//     validationRef.current = {
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     };
//     setStepValidations({
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     });

//     setIsPolling(false);
//     closeCreateSchedule();
//     navigation.navigate(ROUTES.host_home_tab);
//   }, [closeCreateSchedule, navigation]);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="white" />

//         <HeaderWithStatusBarAndClose
//           title={isPolling ? "Creating Schedule..." : "Create Schedule"}
//           onClose={handleClose}
//         />

//         <StepsIndicator step={step} />

//         {!getCurrentStepValidation() && step < 4 && (
//           <View style={styles.validationBanner}>
//             <AntDesign name="exclamationcircle" size={16} color="#fff" />
//             <Text style={styles.validationText}>
//               Please fill in all required fields to continue
//             </Text>
//           </View>
//         )}

//         {isPolling ? (
//           <View style={styles.progressContainer}>
//             <View style={styles.progressContent}>
//               <ActivityIndicator size="large" color={COLORS.primary} style={styles.progressSpinner} />

//               <Text style={styles.progressTitle}>Setting up your schedule</Text>
//               <Text style={styles.progressText}>{jobProgress}</Text>

//               {pollingError && (
//                 <Text style={styles.errorText}>
//                   {pollingError}
//                 </Text>
//               )}

//               {pollingComplete && (
//                 <View style={styles.completeSection}>
//                   <AntDesign name="checkcircle" size={24} color="#4CAF50" />
//                   <Text style={styles.completeText}>
//                     All done! Redirecting...
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         ) : (
//           <View style={styles.form}>
//             {step === 1 && (
//               <Animatable.View animation="slideInRight" duration={550}>
//                 <PropertyDetails
//                   selectedProperty={handleSelectedProperty}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                   onPropertyChange={handlePropertyChange}
//                 />
//               </Animatable.View>
//             )}

//             {step === 2 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Duration
//                   getCleanTime={handleOnCleaningTime}
//                   getCleanDate={handleOnCleaningDate}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                 />
//               </Animatable.View>
//             )}

//             {step === 3 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <CleaningTask
//                   onExtraSelect={handleCleanignExtraSelection}
//                   extraTasks={handleExtraTaskTime}
//                   totalTaskTime={handleTotalTaskTime}
//                   roomBathChange={handleBedroomBathroom}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   onAddChecklist={handleCreateChecklist}
//                 />
//               </Animatable.View>
//             )}

//             {step === 4 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Review
//                   onExtraSelect={handleCleanignExtraSelection}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   step={handleEditStep}
//                 />
//               </Animatable.View>
//             )}
//           </View>
//         )}

//         {!isPolling && (
//           <View style={styles.footerSticky}>
//             <View style={styles.buttonRow}>
//               {step > 1 && (
//                 <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//                   <View style={styles.previous_icon}>
//                     <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                     <Text style={styles.previous_buttonText}> Previous</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}

//               <View style={{ flex: 1 }} />

//               {step < 4 ? (
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
//                   ]}
//                   onPress={handleNextStep}
//                   disabled={!getCurrentStepValidation()}
//                 >
//                   <Text style={styles.buttonText}>
//                     Next
//                   </Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={handleSubmit}
//                   disabled={isPolling}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isPolling ? 'Publishing...' : 'Save & Publish'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}

//         <Modal visible={isPolling} transparent animationType="fade">
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Creating your schedule...</Text>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
//   },
  
//   validationBanner: {
//     backgroundColor: '#FF6B6B',
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 8,
//   },
//   validationText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
  
//   progressContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//     padding: 30,
//   },
//   progressContent: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   progressSpinner: {
//     marginBottom: 25,
//   },
//   progressTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   progressText: {
//     fontSize: 16,
//     color: COLORS.dark,
//     textAlign: 'center',
//     marginBottom: 15,
//     lineHeight: 22,
//   },
//   progressHint: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     fontStyle: 'italic',
//     marginTop: 10,
//     lineHeight: 18,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#f44336',
//     textAlign: 'center',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   completeSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   completeText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     textAlign: 'center',
//     marginLeft: 8,
//   },
//   manualRedirectButton: {
//     marginTop: 25,
//     padding: 15,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: '80%',
//   },
//   manualRedirectText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   manualRedirectSubtext: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderColor: COLORS.light_gray_1,
//     marginTop: 2,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   previous_button: {
//     backgroundColor: 'transparent',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   previous_buttonText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   previous_icon: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   nextButton: {
//     backgroundColor: 'gray',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   validButton: {
//     backgroundColor: COLORS.primary,
//   },
//   invalidButton: {
//     backgroundColor: 'gray',
//   },
//   priceText: {
//     fontSize: 16,
//     marginLeft: 20,
//     color: COLORS.deepBlue,
//     fontWeight: '600',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     minWidth: 200,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   footerSticky: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   progressBarBackground: {
//     width: '100%',
//     height: 8,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 4,
//     marginBottom: 15,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 4,
//   },
//   percentageText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginBottom: 20,
//   },
//   additionalInfo: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
// });

// export default NewBooking;





// import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   TouchableOpacity
// } from 'react-native';
// import PropertyDetails from './CreateBookingContents/PropertyDetails';
// import { AuthContext } from '../../context/AuthContext';
// import Duration from './CreateBookingContents/Duration';
// import CleaningTask from './CreateBookingContents/CleaningTask';
// import Review from './CreateBookingContents/Review';
// import { AntDesign } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import { useBookingContext } from '../../context/BookingContext';
// import { useNavigation } from '@react-navigation/native'
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { formatDateToYYYYMMDD } from '../../utils/formatDate';

// const NewBooking = ({ close_modal, mode }) => {
//   const { currentUser } = useContext(AuthContext);
//   const {
//     formData,
//     setFormData,
//     modalVisible,
//     resetFormData,
//     closeCreateSchedule,
//     scheduleStep,
//     selectedChecklistId,
//     setScheduleStep,
//     resumeAfterChecklist,
//     setResumeAfterChecklist,
//   } = useBookingContext();

//   const navigation = useNavigation();
//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);

//   const [stepValidations, setStepValidations] = useState({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   const validationRef = useRef({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   const hasInitialized = useRef(false);

//   const [currentJobId, setCurrentJobId] = useState(null);
//   const [jobStatus, setJobStatus] = useState(null);
//   const [jobProgress, setJobProgress] = useState('');
//   const [isPolling, setIsPolling] = useState(false);
//   const [pollingComplete, setPollingComplete] = useState(false);
//   const [pollingError, setPollingError] = useState(null);

//   const taskTimes = {
//     "Window Washing": 20,
//     "Inside Cabinets": 15,
//     "Carpet Cleaning": 30,
//     "Upholstery Cleaning": 20,
//     "Tile & Grout Cleaning": 50,
//     "Hardwood Floor Refinishing": 50,
//     "Inside Fridge": 5,
//     "Inside Oven": 30,
//     "Pet Cleanup": 20,
//     "Dishwasher": 30,
//     "Laundry": 30,
//     "Exterior": 120,
//   };

//   // ✅ Initialize when modal opens
//   useEffect(() => {
//     if (modalVisible && !hasInitialized.current) {
//       setStep(1);
//       setFormData({
//         aptId: undefined,
//         checklistId: undefined,
//         cleaning_date: "",
//         cleaning_time: "",
//       });
//       validationRef.current = {
//         step1: false,
//         step2: false,
//         step3: false,
//         step4: true
//       };
//       setStepValidations({
//         step1: false,
//         step2: false,
//         step3: false,
//         step4: true
//       });
//       hasInitialized.current = true;
//     }
    
//     if (!modalVisible) {
//       hasInitialized.current = false;
//     }
//   }, [modalVisible, setFormData]);

//   // Apply selected checklist
//   useEffect(() => {
//     if (selectedChecklistId) {
//       setFormData(prev => ({
//         ...prev,
//         checklistId: selectedChecklistId,
//       }));
//     }
//   }, [selectedChecklistId]);

//   const validateForm = useCallback((isFormValid) => {
//     validationRef.current[`step${step}`] = !!isFormValid;
//     setStepValidations(prev => ({
//       ...prev,
//       [`step${step}`]: !!isFormValid
//     }));
//   }, [step]);

//   const getCurrentStepValidation = useCallback(() => {
//     return validationRef.current[`step${step}`];
//   }, [step]);

//   const handleOnCleaningTime = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_time: value }));
//   }, [setFormData]);

//   const handleOnCleaningDate = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_date: value }));
//   }, [setFormData]);

//   const handleSelectedProperty = useCallback((text, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: text }));
//   }, [setFormData]);

//   const handleCleanignExtraSelection = useCallback((selectedExtras) => {
//     setExtras(selectedExtras);
//   }, []);

//   const handleExtraTaskTime = useCallback((extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData(prevState => ({ ...prevState, [input]: extraCleaningTime }));
//   }, [setFormData]);

//   const handleTotalTaskTime = useCallback((totalTime, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: totalTime }));
//   }, [setFormData]);

//   const handleBedroomBathroom = useCallback((text, input) => {
//     setFormData(prevState => ({ ...prevState, [input]: text }));
//   }, [setFormData]);

//   const handleNextStep = useCallback(() => {
//     if (getCurrentStepValidation()) {
//       setStep(prevStep => prevStep + 1);
//     }
//   }, [getCurrentStepValidation]);

//   const handlePrevStep = useCallback(() => {
//     if (step > 1) {
//       setStep(prevStep => prevStep - 1);
//     }
//   }, [step]);

//   const handleEditStep = useCallback((stp) => {
//     setStep(stp);
//   }, []);

//   const handleInputChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, [setFormData]);

//   const handleClose = useCallback(() => {
//     closeCreateSchedule();
//   }, [closeCreateSchedule]);

//   // SIMPLE navigation handler
//   const handleCreateChecklist = () => {
//     setScheduleStep('cleaningTask');
//     setResumeAfterChecklist(true);
//     closeCreateSchedule();
    
//     // Small delay to ensure modal is closed
//     setTimeout(() => {
//       navigation.navigate(ROUTES.host_create_checklist, {
//         source: 'schedule',
//       });
//     }, 100);
//   };

//   // SIMPLE property change handler
//   const handlePropertyChange = useCallback(
//     (propertyData) => {
//       const hasChecklist =
//         propertyData?.checklists?.length > 0 ||
//         !!propertyData?.default_checklist;

//       if (!hasChecklist) {
//         Alert.alert(
//           "Checklist Required",
//           "You need to create a checklist before scheduling a cleaning.",
//           [
//             { 
//               text: "Cancel", 
//               style: "cancel",
//               onPress: () => {}
//             },
//             {
//               text: "Create Checklist",
//               onPress: () => {
//                 closeCreateSchedule();
//                 setTimeout(() => {
//                   navigation.navigate(ROUTES.host_create_checklist, {
//                     propertyId: propertyData.aptId,
//                   });
//                 }, 100);
//               }
//             },
//           ]
//         );
//         return;
//       }

//       setFormData((prev) => ({
//         ...prev,
//         aptId: propertyData.aptId,
//         checklistId: propertyData.checklistId,
//       }));

//       setStep(2);
//     },
//     [navigation, setStep, setFormData, closeCreateSchedule]
//   );

//   const createTaskChecklist = useCallback(() => {
//     if (formData.extra && formData.extra.length > 0) {
//       const formattedExtras = formData.extra.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const cleanedArray = formattedExtras.map(service => {
//         const { icon, price, ...valueWithoutIconAndPrice } = service.value;
//         return {
//           ...service,
//           value: valueWithoutIconAndPrice
//         };
//       });

//       const formattedRegular = formData.regular_cleaning.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const updatedChecklist = [...cleanedArray, ...formattedRegular];
//       setUpdatedTaskChecklist(updatedChecklist);
//     } else {
//       const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       })) || [];
//       setUpdatedTaskChecklist(formattedRegular);
//     }
//   }, [formData.extra, formData.regular_cleaning]);

//   const startJobPolling = useCallback(async (jobId) => {
//     setCurrentJobId(jobId);
//     setIsPolling(true);
//     setPollingComplete(false);
//     setPollingError(null);

//     let pollCount = 0;
//     const maxPolls = 60;

//     const pollInterval = setInterval(async () => {
//       pollCount++;

//       try {
//         const response = await userService.getJobStatus(jobId);
//         const statusData = response.data;

//         setJobStatus(statusData.status);

//         if (statusData.status === 'finished') {
//           setPollingComplete(true);
//           clearInterval(pollInterval);

//           setTimeout(() => {
//             setIsPolling(false);
//             closeCreateSchedule();
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//         if (statusData.status === 'failed') {
//           setPollingError(statusData.error?.message || 'Job failed');
//           clearInterval(pollInterval);
//           setIsPolling(false);
//         }

//         if (pollCount >= maxPolls) {
//           clearInterval(pollInterval);
//           setJobProgress('✅ Schedule created!');
//           setPollingComplete(true);

//           setTimeout(() => {
//             setIsPolling(false);
//             closeCreateSchedule();
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//       } catch (error) {
//         console.log('Error polling job status:', error);

//         if (error.response?.status === 404 && pollCount > 2) {
//           setJobProgress('✅ Schedule processing completed!');
//           setPollingComplete(true);
//           clearInterval(pollInterval);
//           setTimeout(() => {
//             setIsPolling(false);
//             closeCreateSchedule();
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
//       }
//     }, 3000);

//     return () => clearInterval(pollInterval);
//   }, [closeCreateSchedule, navigation]);

//   const handleSubmit = useCallback(async () => {
//     const formattedData = {
//       ...formData,
//       cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date)
//     };

//     const details = formattedData.details;
//     let checklistToUse = details;

//     if (!details && formattedData.checklistId) {
//       checklistToUse = {
//         checklistId: formattedData.checklistId,
//         checklistName: formattedData.checklistName,
//         checklistTasks: formattedData.checklistTasks || [],
//         totalFee: formattedData.total_cleaning_fee || 0,
//         totalTime: formattedData.total_cleaning_time || 0
//       };
//     }

//     if (details && formattedData.extra && formattedData.extra.length > 0) {
//       checklistToUse = addExtraCleaningTasks(details, formattedData.extra);
//     }

//     const data = {
//       hostInfo: currentUser,
//       schedule: formattedData,
//       checklist: checklistToUse,
//       before_photos: before_photos
//     };

//     try {
//       const response = await userService.createSchedule(data);
//       if (response.status === 200) {
//         const job_id = response.data.job_id;

//         Toast.show({
//           type: 'success',
//           text1: 'Schedule created! Processing notifications...',
//         });

//         startJobPolling(job_id);
//       } else {
//         throw new Error("Failed to create schedule");
//       }
//     } catch (err) {
//       console.log(err);
//       Toast.show({
//         type: 'error',
//         text1: 'Something went wrong',
//         text2: 'Please try again',
//       });
//       setIsPolling(false);
//     }
//   }, [formData, currentUser, startJobPolling]);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="white" />

//         <HeaderWithStatusBarAndClose
//           title={isPolling ? "Creating Schedule..." : "Create Schedule"}
//           onClose={handleClose}
//         />

//         <StepsIndicator step={step} />

//         {!getCurrentStepValidation() && step < 4 && (
//           <View style={styles.validationBanner}>
//             <AntDesign name="exclamationcircle" size={16} color="#fff" />
//             <Text style={styles.validationText}>
//               Please fill in all required fields to continue
//             </Text>
//           </View>
//         )}

//         {isPolling ? (
//           <View style={styles.progressContainer}>
//             <View style={styles.progressContent}>
//               <ActivityIndicator size="large" color={COLORS.primary} style={styles.progressSpinner} />
//               <Text style={styles.progressTitle}>Setting up your schedule</Text>
//               <Text style={styles.progressText}>{jobProgress}</Text>
//               {pollingError && (
//                 <Text style={styles.errorText}>{pollingError}</Text>
//               )}
//               {pollingComplete && (
//                 <View style={styles.completeSection}>
//                   <AntDesign name="checkcircle" size={24} color="#4CAF50" />
//                   <Text style={styles.completeText}>All done! Redirecting...</Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         ) : (
//           <View style={styles.form}>
//             {step === 1 && (
//               <Animatable.View animation="slideInRight" duration={550}>
//                 <PropertyDetails
//                   selectedProperty={handleSelectedProperty}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                   onPropertyChange={handlePropertyChange}
//                 />
//               </Animatable.View>
//             )}

//             {step === 2 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Duration
//                   getCleanTime={handleOnCleaningTime}
//                   getCleanDate={handleOnCleaningDate}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                 />
//               </Animatable.View>
//             )}

//             {step === 3 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <CleaningTask
//                   onExtraSelect={handleCleanignExtraSelection}
//                   extraTasks={handleExtraTaskTime}
//                   totalTaskTime={handleTotalTaskTime}
//                   roomBathChange={handleBedroomBathroom}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   onAddChecklist={handleCreateChecklist}
//                 />
//               </Animatable.View>
//             )}

//             {step === 4 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Review
//                   onExtraSelect={handleCleanignExtraSelection}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   step={handleEditStep}
//                 />
//               </Animatable.View>
//             )}
//           </View>
//         )}

//         {!isPolling && (
//           <View style={styles.footerSticky}>
//             <View style={styles.buttonRow}>
//               {step > 1 && (
//                 <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//                   <View style={styles.previous_icon}>
//                     <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                     <Text style={styles.previous_buttonText}> Previous</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}

//               <View style={{ flex: 1 }} />

//               {step < 4 ? (
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
//                   ]}
//                   onPress={handleNextStep}
//                   disabled={!getCurrentStepValidation()}
//                 >
//                   <Text style={styles.buttonText}>Next</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={handleSubmit}
//                   disabled={isPolling}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isPolling ? 'Publishing...' : 'Save & Publish'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}

//         <Modal visible={isPolling} transparent animationType="fade">
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Creating your schedule...</Text>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
//   },
//   validationBanner: {
//     backgroundColor: '#FF6B6B',
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 8,
//   },
//   validationText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   progressContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//     padding: 30,
//   },
//   progressContent: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   progressSpinner: {
//     marginBottom: 25,
//   },
//   progressTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   progressText: {
//     fontSize: 16,
//     color: COLORS.dark,
//     textAlign: 'center',
//     marginBottom: 15,
//     lineHeight: 22,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#f44336',
//     textAlign: 'center',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   completeSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   completeText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     textAlign: 'center',
//     marginLeft: 8,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   previous_button: {
//     backgroundColor: 'transparent',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   previous_buttonText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   previous_icon: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   nextButton: {
//     backgroundColor: 'gray',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   validButton: {
//     backgroundColor: COLORS.primary,
//   },
//   invalidButton: {
//     backgroundColor: 'gray',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     minWidth: 200,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   footerSticky: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
// });

// export default NewBooking;



// import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
// import { 
//   View, 
//   TextInput, 
//   Text, 
//   Button, 
//   StyleSheet, 
//   StatusBar, 
//   KeyboardAvoidingView, 
//   Platform, 
//   ActivityIndicator, 
//   Modal, 
//   TouchableOpacity 
// } from 'react-native';
// import PropertyDetails from './CreateBookingContents/PropertyDetails';
// import { AuthContext } from '../../context/AuthContext';
// import Duration from './CreateBookingContents/Duration';
// import CleaningTask from './CreateBookingContents/CleaningTask';
// import Review from './CreateBookingContents/Review';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import { useBookingContext } from '../../context/BookingContext';
// import { useNavigation } from '@react-navigation/native'
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos, checklist } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { formatDateToYYYYMMDD } from '../../utils/formatDate';

// const NewBooking = ({schedule, close_modal, mode}) => {
//   const {currency, currentUser, currentUserId} = useContext(AuthContext);
//   const {formData, setFormData, setModalVisible, modalVisible, resetFormData, handleCreateSchedule} = useBookingContext();
//   const navigation = useNavigation();

//   const [currentStep, setCurrentStep] = React.useState(2);
//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [checkList, setChecklist] = useState([]);
//   const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);
  
//   // Validation states
//   const [stepValidations, setStepValidations] = useState({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   // Use a ref to track validation without causing re-renders
//   const validationRef = useRef({
//     step1: false,
//     step2: false,
//     step3: false,
//     step4: true
//   });

//   // 🔥 NEW: Ref to track if checklist was just created
//   const checklistCreatedRef = useRef(false);

//   // 🔥 NEW: Add ref to track previous formData for comparison
//   const prevFormDataRef = useRef({});

//   // Job tracking states
//   const [currentJobId, setCurrentJobId] = useState(null);
//   const [jobStatus, setJobStatus] = useState(null);
//   const [jobProgress, setJobProgress] = useState('');
//   const [isPolling, setIsPolling] = useState(false);
//   const [pollingComplete, setPollingComplete] = useState(false);
//   const [pollingError, setPollingError] = useState(null);
//   const [progressPercentage, setProgressPercentage] = useState(0);
//   const [additionalInfo, setAdditionalInfo] = useState('');

//   const taskTimes = {
//     "Window Washing": 20,
//     "Inside Cabinets": 15,
//     "Carpet Cleaning": 30,
//     "Upholstery Cleaning": 20,
//     "Tile & Grout Cleaning": 50,
//     "Hardwood Floor Refinishing": 50,
//     "Inside Fridge": 5,
//     "Inside Oven": 30,
//     "Pet Cleanup": 20,
//     "Dishwasher": 30,
//     "Laundry": 30,
//     "Exterior": 120,
//   };

//   // 🔥 UPDATED: Improved effect for formData changes
//   useEffect(() => {
//     // Debug log for formData changes
//     console.log("[DEBUG] formData changed:", {
//       aptId: formData.aptId,
//       checklistId: formData.checklistId,
//       checklists: formData.checklists?.length
//     });

//     // Compare with previous formData to detect changes
//     const changed = 
//       prevFormDataRef.current.aptId !== formData.aptId ||
//       prevFormDataRef.current.checklistId !== formData.checklistId;
    
//     if (changed) {
//       console.log("[DEBUG] Detected formData change, updating validation");
      
//       // Update step 1 validation when aptId or checklistId changes
//       if (step === 1) {
//         const hasChecklist = formData.checklistId || 
//                            (formData.checklists && formData.checklists.length > 0);
//         const isValid = formData.aptId && hasChecklist;
        
//         console.log("[DEBUG] Step 1 validation update:", {
//           aptId: formData.aptId,
//           hasChecklist: hasChecklist,
//           isValid: isValid
//         });
        
//         if (isValid !== validationRef.current.step1) {
//           validateForm(isValid);
//         }
//       }
      
//       // Update prevFormDataRef
//       prevFormDataRef.current = {
//         aptId: formData.aptId,
//         checklistId: formData.checklistId,
//         checklists: formData.checklists
//       };
//     }
//   }, [formData.aptId, formData.checklistId, formData.checklists, step]);

//   // Effect to handle modal visibility changes
//   useEffect(() => {
//     if (schedule && !formData.cleaning_date) {
//       setFormData(schedule.schedule);
//     }

//     if (modalVisible) {
//       console.log("[DEBUG] Modal opened");
      
//       // Reset checklist created flag when modal opens
//       checklistCreatedRef.current = false;
      
//       // When modal opens, if we're on step 1 and have an apartment selected
//       if (step === 1 && formData.aptId) {
//         // Check if we have a checklist
//         const hasChecklist = formData.checklistId || 
//                             (formData.checklists && formData.checklists.length > 0);
        
//         console.log("[DEBUG] Modal opened - Step 1 validation check:", {
//           aptId: formData.aptId,
//           hasChecklist: hasChecklist,
//           checklistId: formData.checklistId
//         });
        
//         // Validate if we have both
//         if (formData.aptId && hasChecklist) {
//           validateForm(true);
//         } else if (formData.aptId && !hasChecklist) {
//           // If we have apartment but no checklist, form is invalid
//           validateForm(false);
//         }
//       }
//     }

//     if (!modalVisible) {
//       // resetFormData();
//       // Reset validation when modal closes
//       validationRef.current = {
//         step1: false,
//         step2: false,
//         step3: false,
//         step4: true
//       };
//       setStepValidations({
//         step1: false,
//         step2: false,
//         step3: false,
//         step4: true
//       });
      
//       // Reset prevFormDataRef
//       prevFormDataRef.current = {};
//     }
//   }, [schedule, modalVisible, mode, resetFormData, setFormData]);

//   // 🔥 NEW: Effect to force validation update when step changes
//   useEffect(() => {
//     console.log(`[DEBUG] Step changed to: ${step}`);
    
//     // When moving to a new step, update the validation display
//     const currentValidation = validationRef.current[`step${step}`];
//     console.log(`[DEBUG] Current validation for step ${step}:`, currentValidation);
//   }, [step]);

//   // 🔥 UPDATED: validateForm function
//   const validateForm = useCallback((isFormValid) => {
//     console.log(`[DEBUG] validateForm called for step ${step} with:`, isFormValid);
    
//     if (isFormValid !== undefined) {
//       // Update both ref and state
//       validationRef.current[`step${step}`] = isFormValid;
//       setStepValidations(prev => {
//         console.log(`[DEBUG] Updated stepValidations for step ${step}:`, isFormValid);
//         return {
//           ...prev,
//           [`step${step}`]: isFormValid
//         };
//       });
//     }
//   }, [step]);

//   // 🔥 NEW: Function to force step 1 validation
//   const forceStep1Validation = useCallback(() => {
//     if (step === 1) {
//       const hasChecklist = formData.checklistId || 
//                           (formData.checklists && formData.checklists.length > 0);
//       const isValid = formData.aptId && hasChecklist;
      
//       console.log("[DEBUG] forceStep1Validation:", {
//         aptId: formData.aptId,
//         checklistId: formData.checklistId,
//         hasChecklist: hasChecklist,
//         isValid: isValid
//       });
      
//       validateForm(isValid);
//     }
//   }, [step, formData.aptId, formData.checklistId, formData.checklists, validateForm]);

//   // Reset subsequent steps validation
//   const resetSubsequentStepsValidation = useCallback((fromStep) => {
//     console.log(`Resetting validation from step ${fromStep + 1} onwards`);
    
//     // Reset validation for all steps after the current step
//     for (let i = fromStep + 1; i <= 3; i++) {
//       validationRef.current[`step${i}`] = false;
//       setStepValidations(prev => ({
//         ...prev,
//         [`step${i}`]: false
//       }));
//     }
//   }, []);

//   // Get current step validation status
//   const getCurrentStepValidation = useCallback(() => {
//     const isValid = validationRef.current[`step${step}`];
//     console.log(`[DEBUG] getCurrentStepValidation for step ${step}:`, isValid);
//     return isValid;
//   }, [step]);

//   // 🔥 NEW: Function to handle checklist creation callback
//   const handleChecklistCreatedCallback = useCallback((checklistData) => {
//     console.log("[DEBUG] handleChecklistCreatedCallback received:", checklistData);
    
//     // Set the flag to indicate checklist was just created
//     checklistCreatedRef.current = true;
    
//     // Force validation update
//     setTimeout(() => {
//       forceStep1Validation();
//     }, 100);
//   }, [forceStep1Validation]);

//   const handleOnCleaningTime = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_time: value }));
//   }, [setFormData]);

//   const handleOnCleaningDate = useCallback((value) => {
//     setFormData(prevState => ({ ...prevState, cleaning_date: value }));
//   }, [setFormData]);

//   const handleSelectedProperty = useCallback((text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}));
//   }, [setFormData]);

//   const handleCleanignExtraSelection = useCallback((selectedExtras) => {
//     setExtras(selectedExtras);
//   }, []);

//   const handleExtraTaskTime = useCallback((extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData(prevState => ({...prevState, [input]: extraCleaningTime}));
//   }, [setFormData]);

//   const handleTotalTaskTime = useCallback((totalTime, input) => {
//     setFormData(prevState => ({...prevState, [input]: totalTime}));
//   }, [setFormData]);

//   const handleBedroomBathroom = useCallback((text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}));
//   }, [setFormData]);

//   const handleNextStep = useCallback(() => {
//     // Use ref validation
//     if (getCurrentStepValidation()) {
//       setStep(prevStep => prevStep + 1);
//     } else {
//       console.log("[DEBUG] Cannot proceed to next step, validation failed");
//     }
//   }, [getCurrentStepValidation]);

//   const handlePrevStep = useCallback(() => {
//     if (step > 1) {
//       setStep(prevStep => prevStep - 1);
//     }
//   }, [step]);

//   const handleEditStep = useCallback((stp) => {
//     setStep(stp);
//   }, []);

//   const handleInputChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, [setFormData]);

//   const handleClose = useCallback(() => {
//     setModalVisible(false);
//     resetFormData();
//   }, [setModalVisible, resetFormData]);

//   const handlePropertyChange = useCallback((newPropertyData) => {
//     console.log("Property changed, resetting subsequent steps validation");
    
//     // Reset validation for steps 2 and 3
//     resetSubsequentStepsValidation(1);
    
//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       ...newPropertyData,
//       cleaning_date: '',
//       cleaning_time: '',
//       cleaning_end_time: '',
//       total_cleaning_fee: newPropertyData.regular_cleaning_fee || 0,
//       total_cleaning_time: newPropertyData.regular_cleaning_time || 0
//     }));
    
//     // Force validation for step 1
//     setTimeout(() => {
//       forceStep1Validation();
//     }, 100);
//   }, [resetSubsequentStepsValidation, setFormData, forceStep1Validation]);

//   const createTaskChecklist = useCallback(() => {
//     if (formData.extra && formData.extra.length > 0) {
//       const formattedExtras = formData.extra.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const cleanedArray = formattedExtras.map(service => {
//         const { icon, price, ...valueWithoutIconAndPrice } = service.value;
//         return {
//           ...service,
//           value: valueWithoutIconAndPrice
//         };
//       });

//       const formattedRegular = formData.regular_cleaning.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const updatedChecklist = [...cleanedArray, ...formattedRegular];
//       setUpdatedTaskChecklist(updatedChecklist);
//     } else {
//       const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       })) || [];
//       setUpdatedTaskChecklist(formattedRegular);
//     }
//   }, [formData.extra, formData.regular_cleaning]);

//   // In your NewBooking component - enhanced polling function
//   const startJobPolling = useCallback(async (jobId) => {
//     setCurrentJobId(jobId);
//     setIsPolling(true);
//     setPollingComplete(false);
//     setPollingError(null);
    
//     let pollCount = 0;
//     const maxPolls = 60;
    
//     const pollInterval = setInterval(async () => {
//       pollCount++;
      
//       try {
//         const response = await userService.getJobStatus(jobId);
//         const statusData = response.data;
        
//         setJobStatus(statusData.status);
        
//         // 🔥 ENHANCED: Use detailed progress information
//         if (statusData.progress) {
//           const progress = statusData.progress;
          
//           // Set progress percentage for progress bar
//           if (progress.percentage !== undefined) {
//             setProgressPercentage(progress.percentage);
//           }
          
//           // Set detailed progress message
//           if (progress.current_action) {
//             setJobProgress(progress.current_action);
//           } else if (progress.current_stage) {
//             // Fallback to stage-based messages
//             const stageMessages = {
//               'starting': '🔄 Starting schedule processing...',
//               'finding_cleaners': '🔍 Finding available cleaners in your area...',
//               'sending_host_notification': '📧 Sending confirmation...',
//               'sending_cleaner_requests': '📨 Notifying available cleaners...',
//               'completed': '✅ All tasks completed! Redirecting...',
//               'error': '❌ An error occurred'
//             };
//             setJobProgress(stageMessages[progress.current_stage] || progress.current_stage);
//           }
          
//           // Show additional details if available
//           if (progress.cleaners_found !== undefined) {
//             setAdditionalInfo(`Found ${progress.cleaners_found} cleaners`);
//           }
//           if (progress.notifications_sent !== undefined) {
//             setAdditionalInfo(`Notified ${progress.notifications_sent} cleaners`);
//           }
//         } else {
//           // Fallback to status-based messages
//           switch (statusData.status) {
//             case 'queued':
//               setJobProgress('🔄 Your schedule is in queue...');
//               setProgressPercentage(0);
//               break;
//             case 'started':
//               setJobProgress('🔄 Processing your schedule...');
//               setProgressPercentage(25);
//               break;
//             case 'finished':
//               setJobProgress('✅ All tasks completed! Redirecting...');
//               setProgressPercentage(100);
//               break;
//             case 'failed':
//               setJobProgress('❌ We encountered an issue.');
//               setProgressPercentage(0);
//               break;
//           }
//         }
        
//         // Handle completion
//         if (statusData.status === 'finished') {
//           setPollingComplete(true);
//           clearInterval(pollInterval);
          
//           setTimeout(() => {
//             // Reset validation when done
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });
            
//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
        
//         // Handle errors
//         if (statusData.status === 'failed') {
//           setPollingError(statusData.error?.message || 'Job failed');
//           clearInterval(pollInterval);
//           setIsPolling(false);
//         }

//         // Safety timeout
//         if (pollCount >= maxPolls) {
//           clearInterval(pollInterval);
//           setJobProgress('✅ Schedule created! Some tasks may still be processing.');
//           setPollingComplete(true);
//           setPollingError('Processing took longer than expected');
//           setTimeout(() => {
//             // Reset validation when done
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });
            
//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }

//       } catch (error) {
//         console.log('Error polling job status:', error);
        
//         if (error.response?.status === 404 && pollCount > 2) {
//           setJobProgress('✅ Schedule processing completed!');
//           setPollingComplete(true);
//           clearInterval(pollInterval);
//           setTimeout(() => {
//             // Reset validation when done
//             validationRef.current = {
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             };
//             setStepValidations({
//               step1: false,
//               step2: false,
//               step3: false,
//               step4: true
//             });
            
//             setIsPolling(false);
//             handleCreateSchedule(false);
//             navigation.navigate(ROUTES.host_home_tab);
//           }, 2000);
//         }
//       }
//     }, 3000);

//     return () => clearInterval(pollInterval);
//   }, [handleCreateSchedule, navigation]);

//   const handleSubmit = useCallback(async () => {
//     // 🔥 NEW: Format date before submission
//     const formatFormDataForSubmission = () => {
//       const formatted = { ...formData };
      
//       // Format cleaning_date
//       formatted.cleaning_date = formatDateToYYYYMMDD(formatted.cleaning_date);
      
//       return formatted;
//     };
    
//     // Use formatted data for submission
//     const formattedData = formatFormDataForSubmission();
    
//     const updatedChecklist = addExtraCleaningTasks(checklist, formattedData.extra);
//     console.log("Updated Checklist---=====", updatedChecklist)
//     const data = {
//       hostInfo: currentUser,
//       schedule: formattedData,
//       checklist: updatedChecklist,
//       before_photos: before_photos
//     };

//     console.log("The schedule payload", data);
    
//     try {
//       const response = await userService.createSchedule(data);
//       if (response.status === 200) {
//         const job_id = response.data.job_id;
        
//         Toast.show({
//           type: 'success',
//           text1: 'Schedule created! Processing notifications...',
//         });

//         // Start polling instead of immediate redirect
//         startJobPolling(job_id);
        
//       } else {
//         throw new Error("Failed to create schedule");
//       }
//     } catch (err) {
//       console.log(err);
//       Toast.show({
//         type: 'error',
//         text1: 'Something went wrong',
//         text2: 'Please try again',
//       });
//       setIsPolling(false);
//     }
//   }, [formData, checklist, currentUser, startJobPolling]);

//   // 🔥 NEW: Handle manual redirect if user doesn't want to wait
//   const handleManualRedirect = useCallback(() => {
//     // Reset validation when done
//     validationRef.current = {
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     };
//     setStepValidations({
//       step1: false,
//       step2: false,
//       step3: false,
//       step4: true
//     });
    
//     setIsPolling(false);
//     handleCreateSchedule(false);
//     navigation.navigate(ROUTES.host_home_tab);
//   }, [handleCreateSchedule, navigation]);

//   // Debug log for next button state
//   console.log("[NEXT BUTTON DEBUG]", {
//     step: step,
//     currentValidation: getCurrentStepValidation(),
//     formData: {
//       aptId: formData.aptId,
//       checklistId: formData.checklistId,
//       checklistsLength: formData.checklists?.length
//     },
//     stepValidations: stepValidations,
//     validationRef: validationRef.current
//   });

//   return (
//     <KeyboardAvoidingView 
//       style={{ flex: 1 }} 
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="white" />
        
//         {/* Header with dynamic title */}
//         <HeaderWithStatusBarAndClose 
//           title={isPolling ? "Creating Schedule..." : "Create Schedule"} 
//           onClose={handleClose} 
//         />
        
//         <StepsIndicator step={step} />

//         {/* Show validation errors at the top */}
//         {!getCurrentStepValidation() && step < 4 && (
//           <View style={styles.validationBanner}>
//             <AntDesign name="exclamationcircle" size={16} color="#fff" />
//             <Text style={styles.validationText}>
//               {step === 1 
//                 ? "Please select a property and ensure it has a checklist" 
//                 : "Please fill in all required fields to continue"}
//             </Text>
//           </View>
//         )}

//         {/* Show progress during polling instead of form */}
//         {isPolling ? (
//           <View style={styles.progressContainer}>
//             <View style={styles.progressContent}>
//               <ActivityIndicator size="large" color={COLORS.primary} style={styles.progressSpinner} />
              
//               <Text style={styles.progressTitle}>Setting up your schedule</Text>
              
//               <Text style={styles.progressText}>{jobProgress}</Text>
              
//               {/* Show additional info based on status */}
//               {jobStatus === 'started' && (
//                 <Text style={styles.progressHint}>
//                   This usually takes 10-30 seconds as we find the best cleaners near you
//                 </Text>
//               )}
              
//               {pollingError && (
//                 <Text style={styles.errorText}>
//                   {pollingError}
//                 </Text>
//               )}
              
//               {pollingComplete && (
//                 <View style={styles.completeSection}>
//                   <AntDesign name="checkcircle" size={24} color="#4CAF50" />
//                   <Text style={styles.completeText}>
//                     All done! Redirecting...
//                   </Text>
//                 </View>
//               )}

//               {/* Manual redirect option for slow processing */}
//               {(jobStatus === 'queued' || jobStatus === 'started') && (
//                 <TouchableOpacity 
//                   style={styles.manualRedirectButton}
//                   onPress={handleManualRedirect}
//                 >
//                   <Text style={styles.manualRedirectText}>
//                     Continue to dashboard
//                   </Text>
//                   <Text style={styles.manualRedirectSubtext}>
//                     (Notifications will continue in background)
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         ) : (
//           /* Show normal form when not polling */
//           <View style={styles.form}>
//             {step === 1 && (
//               <Animatable.View animation="slideInRight" duration={550}>
//                 <PropertyDetails
//                   selectedProperty={handleSelectedProperty}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                   onPropertyChange={handlePropertyChange}
//                   navigation={navigation}
//                   onChecklistCreated={handleChecklistCreatedCallback} // 🔥 Pass callback
//                 />
//               </Animatable.View>
//             )}
            
//             {step === 2 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Duration
//                   getCleanTime={handleOnCleaningTime}
//                   getCleanDate={handleOnCleaningDate}
//                   formData={formData}
//                   setFormData={setFormData}
//                   validateForm={validateForm}
//                 />
//               </Animatable.View>
//             )}
            
//             {step === 3 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <CleaningTask
//                   onExtraSelect={handleCleanignExtraSelection}
//                   extraTasks={handleExtraTaskTime}
//                   totalTaskTime={handleTotalTaskTime}
//                   roomBathChange={handleBedroomBathroom}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                 />
//               </Animatable.View>
//             )}
            
//             {step === 4 && (
//               <Animatable.View animation="slideInRight" duration={600}>
//                 <Review
//                   onExtraSelect={handleCleanignExtraSelection}
//                   formData={formData}
//                   setFormData={setFormData}
//                   extras={extras}
//                   validateForm={validateForm}
//                   step={handleEditStep}
//                 />
//               </Animatable.View>
//             )}
//           </View>
//         )}

//         {/* Hide footer buttons during polling and use ref validation */}
//         {!isPolling && (
//           <View style={styles.footerSticky}>
//             <View style={styles.buttonRow}>
//               {step > 1 && (
//                 <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//                   <View style={styles.previous_icon}>
//                     <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                     <Text style={styles.previous_buttonText}> Previous</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}
              
//               <View style={{ flex: 1 }} />
              
//               {step < 4 ? (
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
//                   ]}
//                   onPress={handleNextStep}
//                   disabled={!getCurrentStepValidation()}
//                 >
//                   <Text style={styles.buttonText}>
//                     Next
//                   </Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity 
//                   style={styles.button} 
//                   onPress={handleSubmit}
//                   disabled={isPolling}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isPolling ? 'Publishing...' : 'Save & Publish'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Enhanced Loading Modal */}
//         {/* <Modal visible={isPolling} transparent animationType="fade">
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Creating your schedule...</Text>
//             </View>
//           </View>
//         </Modal> */}
//         {isPolling && (
//           <View style={styles.progressContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.progressText}>{jobProgress}</Text>
//           </View>
//         )}
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
//   },
  
//   // Validation banner styles
//   validationBanner: {
//     backgroundColor: '#FF6B6B',
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 8,
//   },
//   validationText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
  
//   // Progress container styles
//   progressContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//     padding: 30,
//   },
//   progressContent: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   progressSpinner: {
//     marginBottom: 25,
//   },
//   progressTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   progressText: {
//     fontSize: 16,
//     color: COLORS.dark,
//     textAlign: 'center',
//     marginBottom: 15,
//     lineHeight: 22,
//   },
//   progressHint: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     fontStyle: 'italic',
//     marginTop: 10,
//     lineHeight: 18,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#f44336',
//     textAlign: 'center',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   completeSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   completeText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     textAlign: 'center',
//     marginLeft: 8,
//   },
//   manualRedirectButton: {
//     marginTop: 25,
//     padding: 15,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: '80%',
//   },
//   manualRedirectText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   manualRedirectSubtext: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   // Existing styles
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderColor: COLORS.light_gray_1,
//     marginTop: 2,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   previous_button: {
//     backgroundColor: 'transparent',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   previous_buttonText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   previous_icon: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   nextButton: {
//     backgroundColor: 'gray',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 50,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   validButton: {
//     backgroundColor: COLORS.primary,
//   },
//   invalidButton: {
//     backgroundColor: 'gray',
//   },
//   priceText: {
//     fontSize: 16,
//     marginLeft: 20,
//     color: COLORS.deepBlue,
//     fontWeight: '600',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingBox: {
//     backgroundColor: 'white',
//     padding: 25,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     minWidth: 200,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   footerSticky: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
// });

// export default NewBooking;



import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import PropertyDetails from './CreateBookingContents/PropertyDetails';
import { AuthContext } from '../../context/AuthContext';
import Duration from './CreateBookingContents/Duration';
import CleaningTask from './CreateBookingContents/CleaningTask';
import Review from './CreateBookingContents/Review';
import { AntDesign } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import { useBookingContext } from '../../context/BookingContext';
import { useNavigation } from '@react-navigation/native';
import userService from '../../services/connection/userService';
import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
import ROUTES from '../../constants/routes';
import StepsIndicator from '../../components/shared/StepsIndicator';
import { before_photos, checklist } from '../../utils/tasks_photo';
import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
import Toast from 'react-native-toast-message';
import { formatDateToYYYYMMDD } from '../../utils/formatDate';

const NewBooking = ({ schedule, close_modal, mode }) => {
  const { currency, currentUser, currentUserId } = useContext(AuthContext);
  const { formData, setFormData, setModalVisible, modalVisible, resetFormData, handleCreateSchedule } = useBookingContext();
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [extras, setExtras] = useState([]);
  const [checkList, setChecklist] = useState([]);
  const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);

  // Validation states
  const [stepValidations, setStepValidations] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: true
  });
  const validationRef = useRef({
    step1: false,
    step2: false,
    step3: false,
    step4: true
  });

  // Refs for tracking
  const checklistCreatedRef = useRef(false);
  const prevFormDataRef = useRef({});

  // Job tracking states
  const [isPolling, setIsPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [jobProgress, setJobProgress] = useState('');
  const [pollingComplete, setPollingComplete] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [currentJobId, setCurrentJobId] = useState(null);

  // Interval ref for cleanup
  const pollingIntervalRef = useRef(null);

  const taskTimes = {
    "Window Washing": 20,
    "Inside Cabinets": 15,
    "Carpet Cleaning": 30,
    "Upholstery Cleaning": 20,
    "Tile & Grout Cleaning": 50,
    "Hardwood Floor Refinishing": 50,
    "Inside Fridge": 5,
    "Inside Oven": 30,
    "Pet Cleanup": 20,
    "Dishwasher": 30,
    "Laundry": 30,
    "Exterior": 120,
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Form change effect
  useEffect(() => {
    if (prevFormDataRef.current.aptId !== formData.aptId ||
        prevFormDataRef.current.checklistId !== formData.checklistId ||
        prevFormDataRef.current.checklists?.length !== formData.checklists?.length) {
      if (step === 1) {
        const hasChecklist = formData.checklistId || (formData.checklists && formData.checklists.length > 0);
        const isValid = formData.aptId && hasChecklist;
        validateForm(isValid);
      }
      prevFormDataRef.current = {
        aptId: formData.aptId,
        checklistId: formData.checklistId,
        checklists: formData.checklists
      };
    }
  }, [formData.aptId, formData.checklistId, formData.checklists, step]);

  // Modal open/close effect
  useEffect(() => {
    if (schedule && !formData.cleaning_date) {
      setFormData(schedule.schedule);
    }
    if (modalVisible) {
      checklistCreatedRef.current = false;
      if (step === 1 && formData.aptId) {
        const hasChecklist = formData.checklistId || (formData.checklists && formData.checklists.length > 0);
        validateForm(formData.aptId && hasChecklist);
      }
    }
    if (!modalVisible) {
      validationRef.current = { step1: false, step2: false, step3: false, step4: true };
      setStepValidations({ step1: false, step2: false, step3: false, step4: true });
      prevFormDataRef.current = {};
    }
  }, [schedule, modalVisible, mode, resetFormData, setFormData]);

  // Log step changes
  useEffect(() => {
    console.log(`Step changed to ${step}, validation:`, validationRef.current[`step${step}`]);
  }, [step]);

  // Validation helper
  const validateForm = useCallback((isFormValid) => {
    validationRef.current[`step${step}`] = isFormValid;
    setStepValidations(prev => ({ ...prev, [`step${step}`]: isFormValid }));
  }, [step]);

  const forceStep1Validation = useCallback(() => {
    if (step === 1) {
      const hasChecklist = formData.checklistId || (formData.checklists && formData.checklists.length > 0);
      validateForm(formData.aptId && hasChecklist);
    }
  }, [step, formData.aptId, formData.checklistId, formData.checklists, validateForm]);

  const resetSubsequentStepsValidation = useCallback((fromStep) => {
    for (let i = fromStep + 1; i <= 3; i++) {
      validationRef.current[`step${i}`] = false;
      setStepValidations(prev => ({ ...prev, [`step${i}`]: false }));
    }
  }, []);

  const getCurrentStepValidation = useCallback(() => {
    return validationRef.current[`step${step}`];
  }, [step]);

  // Checklist callback
  const handleChecklistCreatedCallback = useCallback((checklistData) => {
    checklistCreatedRef.current = true;
    setTimeout(() => forceStep1Validation(), 100);
  }, [forceStep1Validation]);

  // Form handlers
  const handleOnCleaningTime = useCallback((value) => {
    setFormData(prev => ({ ...prev, cleaning_time: value }));
  }, [setFormData]);

  const handleOnCleaningDate = useCallback((value) => {
    setFormData(prev => ({ ...prev, cleaning_date: value }));
  }, [setFormData]);

  const handleSelectedProperty = useCallback((text, input) => {
    setFormData(prev => ({ ...prev, [input]: text }));
  }, [setFormData]);

  const handleCleanignExtraSelection = useCallback((selectedExtras) => {
    setExtras(selectedExtras);
  }, []);

  const handleExtraTaskTime = useCallback((extra_task, input) => {
    const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
    setFormData(prev => ({ ...prev, [input]: extraCleaningTime }));
  }, [setFormData]);

  const handleTotalTaskTime = useCallback((totalTime, input) => {
    setFormData(prev => ({ ...prev, [input]: totalTime }));
  }, [setFormData]);

  const handleBedroomBathroom = useCallback((text, input) => {
    setFormData(prev => ({ ...prev, [input]: text }));
  }, [setFormData]);

  const handleNextStep = useCallback(() => {
    if (getCurrentStepValidation()) {
      setStep(prev => prev + 1);
    }
  }, [getCurrentStepValidation]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) setStep(prev => prev - 1);
  }, [step]);

  const handleEditStep = useCallback((stp) => {
    setStep(stp);
  }, []);

  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    resetFormData();
  }, [setModalVisible, resetFormData]);

  const handlePropertyChange = useCallback((newPropertyData) => {
    resetSubsequentStepsValidation(1);
    setFormData(prev => ({
      ...prev,
      ...newPropertyData,
      cleaning_date: '',
      cleaning_time: '',
      cleaning_end_time: '',
      total_cleaning_fee: newPropertyData.regular_cleaning_fee || 0,
      total_cleaning_time: newPropertyData.regular_cleaning_time || 0
    }));
    setTimeout(() => forceStep1Validation(), 100);
  }, [resetSubsequentStepsValidation, setFormData, forceStep1Validation]);

  const createTaskChecklist = useCallback(() => {
    if (formData.extra && formData.extra.length > 0) {
      const formattedExtras = formData.extra.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      }));
      const cleanedArray = formattedExtras.map(service => {
        const { icon, price, ...valueWithoutIconAndPrice } = service.value;
        return { ...service, value: valueWithoutIconAndPrice };
      });
      const formattedRegular = formData.regular_cleaning.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      }));
      setUpdatedTaskChecklist([...cleanedArray, ...formattedRegular]);
    } else {
      const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      })) || [];
      setUpdatedTaskChecklist(formattedRegular);
    }
  }, [formData.extra, formData.regular_cleaning]);

  // Polling function
  const startJobPolling = useCallback(async (jobId) => {
    setCurrentJobId(jobId);
    
    setIsPolling(true);
    setPollingComplete(false);
    setPollingError(null);
    

    let pollCount = 0;
    const maxPolls = 60;

    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      try {
        const response = await userService.getJobStatus(jobId);
        const statusData = response.data;
        setJobStatus(statusData.status);
        

        if (statusData.progress) {
          const progress = statusData.progress;
          if (progress.percentage !== undefined) setProgressPercentage(progress.percentage);
          if (progress.current_action) {
            setJobProgress(progress.current_action);
          } else if (progress.current_stage) {
            const stageMessages = {
              'starting': '🔄 Starting schedule processing...',
              'finding_cleaners': '🔍 Finding available cleaners in your area...',
              'sending_host_notification': '📧 Sending confirmation...',
              'sending_cleaner_requests': '📨 Notifying available cleaners...',
              'completed': '✅ All tasks completed! Redirecting...',
              'error': '❌ An error occurred'
            };
            setJobProgress(stageMessages[progress.current_stage] || progress.current_stage);
          }
          if (progress.cleaners_found !== undefined) setAdditionalInfo(`Found ${progress.cleaners_found} cleaners`);
          if (progress.notifications_sent !== undefined) setAdditionalInfo(`Notified ${progress.notifications_sent} cleaners`);
          
        } else {
          switch (statusData.status) {
            case 'queued': setJobProgress('🔄 Your schedule is in queue...'); setProgressPercentage(0); break;
            case 'started': setJobProgress('🔄 Processing your schedule...'); setProgressPercentage(25); break;
            case 'finished': setJobProgress('✅ All tasks completed! Redirecting...'); setProgressPercentage(100); break;
            case 'failed': setJobProgress('❌ We encountered an issue.'); setProgressPercentage(0); break;
          }
        }

        if (statusData.status === 'finished') {
          setPollingComplete(true);
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setTimeout(() => {
            validationRef.current = { step1: false, step2: false, step3: false, step4: true };
            setStepValidations({ step1: false, step2: false, step3: false, step4: true });
            setIsPolling(false);
            handleCreateSchedule(false);
            navigation.navigate(ROUTES.host_home_tab);
          }, 2000);
        }

        if (statusData.status === 'failed') {
          setPollingError(statusData.error?.message || 'Job failed');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsPolling(false);
        }

        if (pollCount >= maxPolls) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setJobProgress('✅ Schedule created! Some tasks may still be processing.');
          setPollingComplete(true);
          setPollingError('Processing took longer than expected');
          setTimeout(() => {
            validationRef.current = { step1: false, step2: false, step3: false, step4: true };
            setStepValidations({ step1: false, step2: false, step3: false, step4: true });
            setIsPolling(false);
            handleCreateSchedule(false);
            
            console.log('Navigating to:', ROUTES.host_home_tab);
            navigation.navigate(ROUTES.host_home_tab);
          }, 2000);
        }
      } catch (error) {
        console.log('Polling error:', error);
        if (error.response?.status === 404 && pollCount > 2) {
          setJobProgress('✅ Schedule processing completed!');
          setPollingComplete(true);
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setTimeout(() => {
            validationRef.current = { step1: false, step2: false, step3: false, step4: true };
            setStepValidations({ step1: false, step2: false, step3: false, step4: true });
            setIsPolling(false);
            handleCreateSchedule(false);
            navigation.navigate(ROUTES.host_home_tab);
          }, 2000);
        }
      }
    }, 3000);
  }, [handleCreateSchedule, navigation]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const formattedData = {
      ...formData,
      cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date)
    };
    const updatedChecklist = addExtraCleaningTasks(checklist, formattedData.extra);
    const data = {
      hostInfo: currentUser,
      schedule: formattedData,
      checklist: updatedChecklist,
      before_photos: before_photos
    };

    try {
      const response = await userService.createSchedule(data);
      if (response.status === 200) {
        const job_id = response.data.job_id;
        Toast.show({ type: 'success', text1: 'Schedule created! Processing notifications...' });
        startJobPolling(job_id);
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (err) {
      console.log(err);
      Toast.show({ type: 'error', text1: 'Something went wrong', text2: 'Please try again' });
      setIsPolling(false);
    }
  }, [formData, checklist, currentUser, startJobPolling]);

  const handleManualRedirect = useCallback(() => {
    validationRef.current = { step1: false, step2: false, step3: false, step4: true };
    setStepValidations({ step1: false, step2: false, step3: false, step4: true });
    setIsPolling(false);
    handleCreateSchedule(false);
    navigation.navigate(ROUTES.host_home_tab);
  }, [handleCreateSchedule, navigation]);

  // Render
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <HeaderWithStatusBarAndClose
          title={isPolling ? 'Creating Schedule...' : 'Create Schedule'}
          onClose={handleClose}
        />
        <StepsIndicator step={step} />

        {!isPolling && !getCurrentStepValidation() && step < 4 && (
          <View style={styles.validationBanner}>
            <AntDesign name="exclamationcircle" size={16} color="#fff" />
            <Text style={styles.validationText}>
              {step === 1
                ? 'Please select a property and ensure it has a checklist'
                : 'Please fill in all required fields to continue'}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          {isPolling ? (
            <View style={styles.pollingContainer}>
              <View style={styles.pollingContent}>
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.pollingSpinner} />
                <Text style={styles.pollingTitle}>Setting up your schedule</Text>
                <Text style={styles.pollingText}>{jobProgress}</Text>
                {jobStatus === 'started' && (
                  <Text style={styles.pollingHint}>
                    This usually takes 10-30 seconds as we find the best cleaners near you
                  </Text>
                )}
                {pollingError && <Text style={styles.pollingErrorText}>{pollingError}</Text>}
                {pollingComplete && (
                  <View style={styles.pollingCompleteSection}>
                    <AntDesign name="checkcircle" size={24} color="#4CAF50" />
                    <Text style={styles.pollingCompleteText}>All done! Redirecting...</Text>
                  </View>
                )}
                {(jobStatus === 'queued' || jobStatus === 'started') && (
                  <TouchableOpacity style={styles.pollingManualButton} onPress={handleManualRedirect}>
                    <Text style={styles.pollingManualText}>Continue to dashboard</Text>
                    <Text style={styles.pollingManualSubtext}>
                      (Notifications will continue in background)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              {step === 1 && (
                <Animatable.View animation="slideInRight" duration={550}>
                  <PropertyDetails
                    selectedProperty={handleSelectedProperty}
                    formData={formData}
                    setFormData={setFormData}
                    validateForm={validateForm}
                    onPropertyChange={handlePropertyChange}
                    navigation={navigation}
                    onChecklistCreated={handleChecklistCreatedCallback}
                  />
                </Animatable.View>
              )}
              {step === 2 && (
                <Animatable.View animation="slideInRight" duration={600}>
                  <Duration
                    getCleanTime={handleOnCleaningTime}
                    getCleanDate={handleOnCleaningDate}
                    formData={formData}
                    setFormData={setFormData}
                    validateForm={validateForm}
                  />
                </Animatable.View>
              )}
              {step === 3 && (
                <Animatable.View animation="slideInRight" duration={600}>
                  <CleaningTask
                    onExtraSelect={handleCleanignExtraSelection}
                    extraTasks={handleExtraTaskTime}
                    totalTaskTime={handleTotalTaskTime}
                    roomBathChange={handleBedroomBathroom}
                    formData={formData}
                    setFormData={setFormData}
                    extras={extras}
                    validateForm={validateForm}
                  />
                </Animatable.View>
              )}
              {step === 4 && (
                <Animatable.View animation="slideInRight" duration={600}>
                  <Review
                    onExtraSelect={handleCleanignExtraSelection}
                    formData={formData}
                    setFormData={setFormData}
                    extras={extras}
                    validateForm={validateForm}
                    step={handleEditStep}
                  />
                </Animatable.View>
              )}
            </View>
          )}
        </View>

        {!isPolling && (
          <View style={styles.footerSticky}>
            <View style={styles.buttonRow}>
              {step > 1 && (
                <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
                  <View style={styles.previous_icon}>
                    <AntDesign name="caretleft" size={20} color={COLORS.gray} />
                    <Text style={styles.previous_buttonText}> Previous</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {step < 4 ? (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
                  ]}
                  onPress={handleNextStep}
                  disabled={!getCurrentStepValidation()}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isPolling}>
                  <Text style={styles.buttonText}>Save & Publish</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  validationBanner: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  validationText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  pollingContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  pollingContent: {
    alignItems: 'center',
    width: '100%',
  },
  pollingSpinner: {
    marginBottom: 25,
  },
  pollingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  pollingText: {
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  pollingHint: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 18,
  },
  pollingErrorText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  pollingCompleteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  pollingCompleteText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  pollingManualButton: {
    marginTop: 25,
    padding: 15,
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  pollingManualText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pollingManualSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  footerSticky: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray_1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    minWidth: 120,
    alignItems: 'center',
  },
  previous_button: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previous_buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previous_icon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    minWidth: 120,
    alignItems: 'center',
  },
  validButton: {
    backgroundColor: COLORS.primary,
  },
  invalidButton: {
    backgroundColor: 'gray',
  },
});

export default NewBooking;