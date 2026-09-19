// import React, { useContext, useEffect, useState, useRef } from 'react';
// import { View, TextInput, Text, Button, StyleSheet, StatusBar, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
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





// const EditSchedule = ({close_modal,  schedule, onSave, onClose}) => {

//   const {currency, currentUser, currentUserId} = useContext(AuthContext)
//   const navigation = useNavigation()

//   const [currentStep, setCurrentStep] = React.useState(2); // Example: Step 2 is active
  
//   const {formData, setFormData, setModalEVisible, setModalVisible, modalEVisible, resetFormData, selectedSchedule, handleCreateSchedule } = useBookingContext();
  
//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [scheduleId, setScheduleId] = useState([]);
//   const [checkList, setChecklist] = useState([]);
//   const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);
//   const [isValid, setIsValid] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

  
  
//   console.log("My schedule", scheduleId)
  

//   const taskTimes =  
//   {
//     "Window Washing":20,
//     "Inside Cabinets":15,
//     "Carpet Cleaning":30,
//     "Upholstery Cleaning":20,
//     "Tile & Grout Cleaning":50,
//     "Hardwood Floor Refinishing":50,
//     "Inside Fridge":5,
//     "Inside Oven":30,
//     "Pet Cleanup":20,
//     "Dishwasher":30,
//     "Laundry":30,
//     "Exterior":120,    
//   }


//   useEffect(() => {
//     console.log("Selected schedule:", selectedSchedule); // Check if schedule contains data
//     if (selectedSchedule) {
//       setFormData(selectedSchedule.schedule);
//       setScheduleId(selectedSchedule._id)
//     }

//     if (!modalEVisible) {
//         resetFormData(); // Ensure data resets when modal closes
//       }
//   }, [selectedSchedule]);
  
  


//   // Your validation logic here
//   const validateForm = (isFormValid) => {
//     // alert(isFormValid+" parent")
//     // Example validation logic: Check if the form is valid
//     // const isFormValid = true; // Replace with your validation logic
//     setIsValid(isFormValid);
//     // onValidationChange()
//   };

  
  
//   const handleOnCleaningTime = (text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}))
//   }

//   const handleOnCleaningDate = (text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}))
//   }
//   const handleSelectedProperty = (text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}))
//     // console.log(formData)
//   }

//   // const handleCleanignExtraSelection = (text) => {
//   //   setFormData((prevState) => ({ ...prevState, extra: text }));
//   //   console.log(formData);
//   // };

//   const handleCleanignExtraSelection = (selectedExtras) => {
//     setExtras(selectedExtras);
//     // console.log(selectedExtras);
//   };

//   const handleExtraTaskTime = (extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes)
    
//     // console.log(extraCleaningTime)
//     setFormData(prevState => ({...prevState, [input]: extraCleaningTime}))
//   }

//   const handleTotalTaskTime = (totalTime, input) => {
//     setFormData(prevState => ({...prevState, [input]: totalTime}))
//   }

//   const handleBedroomBathroom = (text, input) => {
//     setFormData(prevState => ({...prevState, [input]: text}))
//     // console.log(formData)
//   }
  
//   const handleNextStep = () => {
//     // validateForm();
//     if (isValid) {
//       setStep(step + 1);
//     }
//     setStep(step + 1);
//   };
  

//   const handlePrevStep = () => {
//     setStep(step - 1);
//   };

//   const handleEditStep = (stp) => {
//     setStep(stp)
//   }
//   const handleInputChange = (name, value) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

  
//   const handleClose = () => {
//     setModalEVisible(false)
//     resetFormData()
//     setExtras([]);
//   }

//   const createTaskChecklist = () => {
  
//     if(formData.extra.length > 0 ){
//       // Create default / regular task_checklist from extra
//       // Convert the array of extras to the task_checklist format

//       const formattedExtras = formData.extra.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       // Remove icon and price from formattedExtra
//       const cleanedArray = formattedExtras.map(service => {
//         // Destructure value object and remove icon and price
//         const { icon, price, ...valueWithoutIconAndPrice } = service.value;
        
//         // Return new object with modified value
//         return {
//           ...service,
//           value: valueWithoutIconAndPrice
//         };
//       });
      
//       // console.log(cleanedArray);

//       const formattedRegular = formData.regular_cleaning.map((item, index) => ({
//         id: index + 1,
//         label: item.label,
//         value: item
//       }));

//       const updatedChecklist = [...cleanedArray, ...formattedRegular];

//       console.log("checklist..................")
//       // console.log(JSON.stringify(updatedChecklist, null, 2))
//       console.log("checklist..................")
//       setUpdatedTaskChecklist(updatedChecklist)
//     }else{
//       // console.log(formattedRegular)
//       setUpdatedTaskChecklist(formattedRegular)
//     }
//   }

//   const handleSubmit = async () => {
//     setIsSubmitting(true); // Show loading modal
//         const updatedChecklist = addExtraCleaningTasks(checklist, formData.extra);
//         const data = {
//           scheduleId:scheduleId,
//           hostInfo:currentUser,
//           schedule: formData,
//           checklist: updatedChecklist,
//           before_photos: before_photos
//         }      
        
        
//         await userService.updateSchedule(data)
//         .then(response => {
//           console.log(response.status)
//           if(response.status === 200){
//             const res = response.data.data

//             Toast.show({
//               type: 'success',
//               text1: 'Schedule updated successfully',
//             });

            
            
//             setTimeout(() => {

//               handleClose()
//               setIsSubmitting(false);      // Hide overlay
//               navigation.navigate(ROUTES.host_bookings); // Redirect
//             }, 1500); // Delay so the toast is visible
//           } else {
//             throw new Error("Failed to update schedule");
//           }
        
          
//         }).catch((err)=> {
//           Toast.show({
//             type: 'error',
//             text1: 'Something went wrong',
//             text2: 'Please try again',
//           });
//           setIsSubmitting(false); // Hide overlay
          
//         })
//   };

  

//   return (
//         <View style={styles.container}>
//             <StatusBar translucent backgroundColor="white" />
//             <HeaderWithStatusBarAndClose title="Edit Schedule" onClose={handleClose} />
//             <StepsIndicator step={step} />
//             <View style={styles.form}>
            
//             {formData && step === 1 && 
//                 <Animatable.View animation="fadeIn" duration={550}>
//                     <PropertyDetails
//                     selectedProperty = {handleSelectedProperty}
//                     formData={formData} 
//                     setFormData={setFormData} 
//                     validateForm={validateForm}
//                     />
//                 </Animatable.View>
//                 }
//                 {formData && step === 2 &&  
//                 <Animatable.View animation="fadeIn" duration={600}>
//                 <Duration 
//                     getCleanTime={handleOnCleaningTime}
//                     getCleanDate={handleOnCleaningDate}
//                     formData={formData}
//                     setFormData={setFormData}
//                     validateForm={validateForm}
//                 />
//                 </Animatable.View>
//             }
//                 {formData && step === 3 &&  
//                 <Animatable.View animation="fadeIn" duration={600}>
//                 <CleaningTask  
//                     onExtraSelect={handleCleanignExtraSelection} 
//                     extraTasks={handleExtraTaskTime}
//                     totalTaskTime={handleTotalTaskTime}
//                     roomBathChange ={handleBedroomBathroom}
//                     formData={formData} 
//                     setFormData={setFormData}   
//                     extras= {extras}
//                     validateForm={validateForm}
//                 />
//                 </Animatable.View>
//                 }
//                 {formData && step === 4 && 
//                 <Animatable.View animation="slideInRight" duration={600}>
//                 <Review  
//                     onExtraSelect={handleCleanignExtraSelection} 
                    
//                     formData={formData} 
//                     setFormData={setFormData}   
//                     extras= {extras}
//                     validateForm={validateForm}
//                     step={handleEditStep}
//                 />
//                 </Animatable.View>
//                 }

            
//             </View>


                
//                 <View style={{flexDirection:'row', justifyContent:'center'}}>
//                     <View>
//                     <Text style={styles.priceText}>Estimated Fee {currency}{parseFloat(formData.total_cleaning_fee).toFixed(2) || 0}</Text>
//                     </View>
//                 </View>
//             <View style={styles.buttonContainer}>
                
                
//                 {step > 1 && (
//                 <TouchableOpacity style={styles.previous_button}  onPress={handlePrevStep}>
//                     <View style={styles.previous_icon}>
//                     <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                     <Text style={styles.previous_buttonText}> Previous</Text>
                    
//                     </View>
//                 </TouchableOpacity>
//                 )}
//                 {/* <View><Text style={{fontSize:20}}>$40</Text></View> */}
//                 <View style={{ flex: 1, alignItems: 'center' }}>

                
//                 </View>
//                 <View style={{ flex: 1 }} /> 
                
                
//                 {step < 4 ? (
                
                
//                 <TouchableOpacity 
//                     // style={styles.button} onPress={handleNextStep}
//                     style={ [styles.nextButton, isValid ? styles.validButton : styles.invalidButton]}
//                     onPress={handleNextStep}
//                     disabled={!isValid} // Disable the button if the form is not valid
//                     >
                    
//                     <Text style={styles.buttonText}>Next</Text>
//                 </TouchableOpacity>
//                 ) : (
//                 <TouchableOpacity onPress={handleSubmit} style={styles.button}>
//                     <Text style={styles.buttonText}>{tSafe('save_publish', 'Save & Publish')}</Text>
//                 </TouchableOpacity>
//                 )}

//           <Modal visible={isSubmitting} transparent={true} animationType="fade">
//             <View style={styles.loadingOverlay}>
//               <View style={styles.loadingBox}>
//                 <ActivityIndicator size="large" color={COLORS.primary} />
//                 <Text style={styles.loadingText}>Updating your schedule...</Text>
//               </View>
//             </View>
//           </Modal>
        
//             </View>
//             </View>


//   );
// };

// const styles = StyleSheet.create({

//     container: {
//         flex: 1,
//         justifyContent: 'space-between',
//         backgroundColor: '#fff',
//       },
//       form: {
//         flex: 1,
//         padding: 20,
//       },
//       buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal:20,
//         paddingVertical:5,
//         borderTopWidth:1,
//         borderColor:COLORS.light_gray_1,
//         marginTop:2
//       },
//       button: {
//         backgroundColor: COLORS.primary,
//         paddingVertical: 5,
//         paddingHorizontal: 20,
//         borderRadius: 50,
//       },
//       previous_button: {
//         backgroundColor: 'transparent',
//         paddingVertical: 5,
//         paddingHorizontal: 20,
//         borderRadius: 5,
//       },
//       buttonText: {
//         color: '#ffffff',
//         fontSize: 18,
//       },
//       previous_buttonText: {
//         color: '#000',
//         fontSize: 16,
//         fontWeight:'bold'
//       },
//       previous_icon: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//       },
//       progressBar: {
//         backgroundColor: '#ddd',
//         height: 10,
//         borderRadius: 5,
//         marginHorizontal: 20,
//         marginTop: 10,
//         marginBottom: 0,
//       },
//       progressIndicator: {
//         backgroundColor: COLORS.primary,
//         height: '100%',
//         borderRadius: 5,
//       },
//       close_button:{
//         marginTop:10,
//         marginLeft:10
//       },
//       priceText: {
//         fontSize: 16,
//         marginLeft:20,
//         color:COLORS.deepBlue,
//         fontWeight:'600'
//       },
    
//       nextButton: {
//         backgroundColor: 'gray',
//         paddingVertical: 5,
//         paddingHorizontal: 20,
//         borderRadius: 50,
//       },
//       validButton: {
//         backgroundColor: 'green', // Example: change color if form is valid
//       },
//       invalidButton: {
//         backgroundColor: 'gray', // Keep it gray if form is invalid
//       },
//       headerContainer: {
//         flexDirection:'row',
//         height: 60, // Height of the header below the status bar
//         backgroundColor: '#ffffff',
//         justifyContent: 'center',
//         alignItems: 'center',
//         position: 'relative', // Ensures layout elements are positioned relative to the parent
//         // Remove shadow from the top
//         shadowColor: '#000', 
//         // shadowOffset: { width: 0, height: 2 }, // Shadow is directed towards the bottom
//         // shadowOpacity: 0.2, // Light opacity for subtle shadow
//         // shadowRadius: 3, // Softens the shadow's edges
//         // elevation: 5, // Shadow for Android (bottom)
//         // borderBottomWidth: 1,
//         // borderBottomColor: '#e0e0e0', // Light line separating the header from content
//       },

//       loadingOverlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0,0,0,0.3)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 10,
//       },
      
//       loadingBox: {
//         backgroundColor: 'white',
//         padding: 20,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//       },
      
//       loadingText: {
//         marginTop: 10,
//         fontSize: 16,
//         color: COLORS.primary,
//       },
    
      
//     });


// export default EditSchedule;




// import React, { useContext, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Modal,
//   ActivityIndicator,
//   TouchableOpacity,
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
// import { useNavigation } from '@react-navigation/native';
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos, checklist } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { tSafe } from '../../utils/tSafe'; // ✅ Import tSafe

// const EditSchedule = ({ close_modal, selectedSchedule: propSchedule }) => {
//   const { currency, currentUser } = useContext(AuthContext);
//   const navigation = useNavigation();

//   const { formData, setFormData, setModalVisible, resetFormData, selectedSchedule } = useBookingContext();
  

//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [scheduleId, setScheduleId] = useState(null);
//   const [isValid, setIsValid] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Task time mapping (same as NewBooking)
//   const taskTimes = {
//     'Window Washing': 20,
//     'Inside Cabinets': 15,
//     'Carpet Cleaning': 30,
//     'Upholstery Cleaning': 20,
//     'Tile & Grout Cleaning': 50,
//     'Hardwood Floor Refinishing': 50,
//     'Inside Fridge': 5,
//     'Inside Oven': 30,
//     'Pet Cleanup': 20,
//     'Dishwasher': 30,
//     'Laundry': 30,
//     'Exterior': 120,
//   };

//   // Populate form when a schedule is passed in
//   useEffect(() => {
//     if (propSchedule) {
//       setFormData(propSchedule.schedule);
//       setScheduleId(propSchedule._id);
      
//     }
//   }, [propSchedule, setFormData]);

//   // Reset form when the modal is closed externally
//   useEffect(() => {
//     if (!close_modal) {
//       resetFormData();
//       setExtras([]);
//       setStep(1);
//       setIsValid(false);
//     }
//   }, [close_modal, resetFormData]);

//   // Validate the current step
//   const validateForm = (isFormValid) => {
//     setIsValid(isFormValid);
//   };

//   // Handlers for child components
//   const handleSelectedProperty = (text, input) => {
//     setFormData((prev) => ({ ...prev, [input]: text }));
//   };

//   const handleOnCleaningTime = (value) => {
//     setFormData((prev) => ({ ...prev, cleaning_time: value }));
//   };

//   const handleOnCleaningDate = (value) => {
//     setFormData((prev) => ({ ...prev, cleaning_date: value }));
//   };

//   const handleCleanignExtraSelection = (selectedExtras) => {
//     setExtras(selectedExtras);
//   };

//   const handleExtraTaskTime = (extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData((prev) => ({ ...prev, [input]: extraCleaningTime }));
//   };

//   const handleTotalTaskTime = (totalTime, input) => {
//     setFormData((prev) => ({ ...prev, [input]: totalTime }));
//   };

//   const handleBedroomBathroom = (text, input) => {
//     setFormData((prev) => ({ ...prev, [input]: text }));
//   };

//   const handleNextStep = () => {
//     if (isValid) {
//       setStep((prev) => prev + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     setStep((prev) => prev - 1);
//   };

//   const handleEditStep = (stp) => {
//     setStep(stp);
//   };

//   // const handleClose = () => {
//   //   close_modal?.(); // Call parent close
//   //   resetFormData();
//   //   setExtras([]);
//   //   setStep(1);
//   //   setIsValid(false);
//   // };

//   // const handleClose = useCallback(() => {
//   //   handleEditSchedule(false);
//   //   resetFormData();
//   // }, [setModalVisible, resetFormData]);

//   const handleClose = useCallback(() => {
//     if (close_modal) {
//       close_modal(); // ← this should close the modal
//     }
//     resetFormData();
//     setExtras([]);
//     setStep(1);
//     setIsValid(false);
//   }, [close_modal, resetFormData]);

//   const updatedChecklist = addExtraCleaningTasks(checklist, formData.extra);
//   console.log("Checkliiiiiii-------st", JSON.stringify(updatedChecklist, null, 2))
//   // Submit the updated schedule
  
  
//   const handleSubmit = async () => {
//     setIsSubmitting(true);

//     const updatedChecklist = addExtraCleaningTasks(checklist, formData.extra);
//     const data = {
//       scheduleId: selectedSchedule._id,
//       hostInfo: currentUser,
//       schedule: formData,
//       checklist: updatedChecklist,
//       before_photos: before_photos,
//       status:selectedSchedule.status
//     };
    

//     try {
//       const response = await userService.updateSchedule(data);
//       console.log(data)
    
      
//       if (response.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: tSafe('schedule_updated', 'Schedule updated successfully'),
//         });
//         setTimeout(() => {
//           handleClose();
//           setIsSubmitting(false);
//           navigation.navigate(ROUTES.host_bookings);
//         }, 1500);
//       } else {
        
//         throw new Error('Failed to update schedule');
//       }
//     } catch (err) {
//       console.log(err);
//       Toast.show({
//         type: 'error',
//         text1: tSafe('error_title', 'Something went wrong'),
//         text2: tSafe('try_again', 'Please try again'),
//       });
//       setIsSubmitting(false);
//     }
//   };

//   // Render the component
//   return (
//     <View style={styles.container}>
//       <StatusBar translucent backgroundColor="white" />
//       <HeaderWithStatusBarAndClose title={tSafe('edit_schedule', 'Edit Schedule')} onClose={handleClose} />
//       <StepsIndicator step={step} />

//       <View style={styles.form}>
//         {step === 1 && (
//           <Animatable.View animation="fadeIn" duration={550}>
//             <PropertyDetails
//               selectedProperty={handleSelectedProperty}
//               formData={formData}
//               setFormData={setFormData}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 2 && (
//           <Animatable.View animation="fadeIn" duration={600}>
//             <Duration
//               getCleanTime={handleOnCleaningTime}
//               getCleanDate={handleOnCleaningDate}
//               formData={formData}
//               setFormData={setFormData}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 3 && (
//           <Animatable.View animation="fadeIn" duration={600}>
//             <CleaningTask
//               onExtraSelect={handleCleanignExtraSelection}
//               extraTasks={handleExtraTaskTime}
//               totalTaskTime={handleTotalTaskTime}
//               roomBathChange={handleBedroomBathroom}
//               formData={formData}
//               setFormData={setFormData}
//               extras={extras}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 4 && (
//           <Animatable.View animation="slideInRight" duration={600}>
//             <Review
//               onExtraSelect={handleCleanignExtraSelection}
//               formData={formData}
//               setFormData={setFormData}
//               extras={extras}
//               validateForm={validateForm}
//               step={handleEditStep}
//             />
//           </Animatable.View>
//         )}
//       </View>

//       <View style={styles.footerSticky}>
//         <View style={styles.buttonRow}>
//           {step > 1 && (
//             <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//               <View style={styles.previous_icon}>
//                 <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                 <Text style={styles.previous_buttonText}>
//                   {tSafe('previous', ' Previous')}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//           <View style={{ flex: 1 }} />
//           {step < 4 ? (
//             <TouchableOpacity
//               style={[
//                 styles.nextButton,
//                 isValid ? styles.validButton : styles.invalidButton,
//               ]}
//               onPress={handleNextStep}
//               disabled={!isValid}
//             >
//               <Text style={styles.buttonText}>{tSafe('next', 'Next')}</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
//               <Text style={styles.buttonText}>{tSafe('save_publish', 'Save & Publish')}</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <Modal visible={isSubmitting} transparent animationType="fade">
//         <View style={styles.loadingOverlay}>
//           <View style={styles.loadingBox}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.loadingText}>{tSafe('updating_schedule', 'Updating your schedule...')}</Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
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
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.primary,
//   },
// });

// export default EditSchedule;








// import React, { useContext, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Modal,
//   ActivityIndicator,
//   TouchableOpacity,
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
// import { useNavigation } from '@react-navigation/native';
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { tSafe } from '../../utils/tSafe';

// const EditSchedule = ({ close_modal, selectedSchedule: propSchedule }) => {
//   const { currency, currentUser } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const { formData, setFormData, resetFormData, selectedSchedule: contextSchedule } = useBookingContext();

//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [scheduleId, setScheduleId] = useState(null);
//   const [isValid, setIsValid] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [actualChecklist, setActualChecklist] = useState(null);

//   const taskTimes = {
//     'Window Washing': 20,
//     'Inside Cabinets': 15,
//     'Carpet Cleaning': 30,
//     'Upholstery Cleaning': 20,
//     'Tile & Grout Cleaning': 50,
//     'Hardwood Floor Refinishing': 50,
//     'Inside Fridge': 5,
//     'Inside Oven': 30,
//     'Pet Cleanup': 20,
//     'Dishwasher': 30,
//     'Laundry': 30,
//     'Exterior': 120,
//   };

//   // Populate form and checklist – fallback to context if prop is missing
//   useEffect(() => {
//     const schedule = propSchedule || contextSchedule;
//     console.log('📋 Schedule to edit:', schedule);

//     if (schedule) {
//       setFormData(schedule.schedule);
//       setScheduleId(schedule._id);
//       if (schedule.overall_checklist) {
//         setActualChecklist(schedule.overall_checklist);
//       }
//     } else {
//       console.warn('⚠️ No schedule found – propSchedule and contextSchedule are both undefined');
//     }
//   }, [propSchedule, contextSchedule, setFormData]);

//   // Reset on close
//   useEffect(() => {
//     if (!close_modal) {
//       resetFormData();
//       setExtras([]);
//       setStep(1);
//       setIsValid(false);
//       setActualChecklist(null);
//     }
//   }, [close_modal, resetFormData]);

//   const validateForm = (isFormValid) => setIsValid(isFormValid);

//   const handleSelectedProperty = (text, input) => {
//     setFormData((prev) => ({ ...prev, [input]: text }));
//   };

//   const handleOnCleaningTime = (value) => {
//     setFormData((prev) => ({ ...prev, cleaning_time: value }));
//   };

//   const handleOnCleaningDate = (value) => {
//     setFormData((prev) => ({ ...prev, cleaning_date: value }));
//   };

//   const handleCleanignExtraSelection = (selectedExtras) => {
//     setExtras(selectedExtras);
//   };

//   const handleExtraTaskTime = (extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData((prev) => ({ ...prev, [input]: extraCleaningTime }));
//   };

//   const handleTotalTaskTime = (totalTime, input) => {
//     setFormData((prev) => ({ ...prev, [input]: totalTime }));
//   };

//   const handleBedroomBathroom = (text, input) => {
//     setFormData((prev) => ({ ...prev, [input]: text }));
//   };

//   const handleNextStep = () => {
//     if (isValid) setStep((prev) => prev + 1);
//   };

//   const handlePrevStep = () => setStep((prev) => prev - 1);
//   const handleEditStep = (stp) => setStep(stp);

//   const handleClose = useCallback(() => {
//     if (close_modal) close_modal();
//     resetFormData();
//     setExtras([]);
//     setStep(1);
//     setIsValid(false);
//     setActualChecklist(null);
//   }, [close_modal, resetFormData]);

//   console.log("POOOOOOO----------------------OOOOPPP", propSchedule)

//   const handleSubmit = async () => {
//     setIsSubmitting(true);

//     try {
//       const schedule = propSchedule || contextSchedule;
//       if (!schedule) throw new Error('No schedule selected for editing');

//       // Use the checklist from state, or fetch if missing
//       let checklistToSend = actualChecklist;
//       if (!checklistToSend && formData.checklistId) {
//         const response = await userService.getChecklist(formData.checklistId);
//         if (response.status === 200) {
//           checklistToSend = response.data.data;
//           setActualChecklist(checklistToSend);
//         } else {
//           throw new Error('Failed to fetch checklist');
//         }
//       }

//       if (!checklistToSend) throw new Error('No checklist available for this property');

//       // Apply extra tasks
//       const updatedChecklist = addExtraCleaningTasks(checklistToSend, formData.extra);

//       const data = {
//         scheduleId: schedule._id,
//         hostInfo: currentUser,
//         schedule: formData,
//         checklist: updatedChecklist,
//         before_photos: before_photos,
//         status: schedule.status,
//       };

//       console.log('📤 Submitting update:', JSON.stringify(data, null, 2));

//       const response = await userService.updateSchedule(data);
//       if (response.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: tSafe('schedule_updated', 'Schedule updated successfully'),
//         });
//         setTimeout(() => {
//           handleClose();
//           setIsSubmitting(false);
//           navigation.navigate(ROUTES.host_bookings);
//         }, 1500);
//       } else {
//         throw new Error('Failed to update schedule');
//       }
//     } catch (err) {
//       console.error('❌ Update error:', err);
//       Toast.show({
//         type: 'error',
//         text1: tSafe('error_title', 'Something went wrong'),
//         text2: tSafe('try_again', 'Please try again'),
//       });
//       setIsSubmitting(false);
//     }
//   };

//   // Render (unchanged)
//   return (
//     <View style={styles.container}>
//       <StatusBar translucent backgroundColor="white" />
//       <HeaderWithStatusBarAndClose title={tSafe('edit_schedule', 'Edit Schedule')} onClose={handleClose} />
//       <StepsIndicator step={step} />

//       <View style={styles.form}>
//         {step === 1 && (
//           <Animatable.View animation="fadeIn" duration={550}>
//             <PropertyDetails
//               selectedProperty={handleSelectedProperty}
//               formData={formData}
//               setFormData={setFormData}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 2 && (
//           <Animatable.View animation="fadeIn" duration={600}>
//             <Duration
//               getCleanTime={handleOnCleaningTime}
//               getCleanDate={handleOnCleaningDate}
//               formData={formData}
//               setFormData={setFormData}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 3 && (
//           <Animatable.View animation="fadeIn" duration={600}>
//             <CleaningTask
//               onExtraSelect={handleCleanignExtraSelection}
//               extraTasks={handleExtraTaskTime}
//               totalTaskTime={handleTotalTaskTime}
//               roomBathChange={handleBedroomBathroom}
//               formData={formData}
//               setFormData={setFormData}
//               extras={extras}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 4 && (
//           <Animatable.View animation="slideInRight" duration={600}>
//             <Review
//               onExtraSelect={handleCleanignExtraSelection}
//               formData={formData}
//               setFormData={setFormData}
//               extras={extras}
//               validateForm={validateForm}
//               step={handleEditStep}
//             />
//           </Animatable.View>
//         )}
//       </View>

//       <View style={styles.footerSticky}>
//         <View style={styles.buttonRow}>
//           {step > 1 && (
//             <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//               <View style={styles.previous_icon}>
//                 <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                 <Text style={styles.previous_buttonText}>{tSafe('previous', ' Previous')}</Text>
//               </View>
//             </TouchableOpacity>
//           )}
//           <View style={{ flex: 1 }} />
//           {step < 4 ? (
//             <TouchableOpacity
//               style={[
//                 styles.nextButton,
//                 isValid ? styles.validButton : styles.invalidButton,
//               ]}
//               onPress={handleNextStep}
//               disabled={!isValid}
//             >
//               <Text style={styles.buttonText}>{tSafe('next', 'Next')}</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
//               <Text style={styles.buttonText}>{tSafe('save_publish', 'Save & Publish')}</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <Modal visible={isSubmitting} transparent animationType="fade">
//         <View style={styles.loadingOverlay}>
//           <View style={styles.loadingBox}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.loadingText}>{tSafe('updating_schedule', 'Updating your schedule...')}</Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
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
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.primary,
//   },
// });

// export default EditSchedule;






// import React, { useContext, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Modal,
//   ActivityIndicator,
//   TouchableOpacity,
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
// import { useNavigation } from '@react-navigation/native';
// import userService from '../../services/connection/userService';
// import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
// import ROUTES from '../../constants/routes';
// import StepsIndicator from '../../components/shared/StepsIndicator';
// import { before_photos } from '../../utils/tasks_photo';
// import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
// import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
// import Toast from 'react-native-toast-message';
// import { formatDateToYYYYMMDD } from '../../utils/formatDate';
// import { tSafe } from '../../utils/tSafe';

// const EditSchedule = ({ close_modal, selectedSchedule: propSchedule }) => {
//   const { currency, currentUser } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const { formData, setFormData, selectedSchedule: contextSchedule } = useBookingContext();

//   const [step, setStep] = useState(1);
//   const [extras, setExtras] = useState([]);
//   const [scheduleId, setScheduleId] = useState(null);
//   const [isValid, setIsValid] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [actualChecklist, setActualChecklist] = useState(null);

//   console.log("Tots----------Yt", formData)
//   const taskTimes = {
//     'Window Washing': 20,
//     'Inside Cabinets': 15,
//     'Carpet Cleaning': 30,
//     'Upholstery Cleaning': 20,
//     'Tile & Grout Cleaning': 50,
//     'Hardwood Floor Refinishing': 50,
//     'Inside Fridge': 5,
//     'Inside Oven': 30,
//     'Pet Cleanup': 20,
//     'Dishwasher': 30,
//     'Laundry': 30,
//     'Exterior': 120,
//   };

//   // Local reset function – clears form data
//   const resetForm = useCallback(() => {
//     setFormData({
//       aptId: '',
//       apartment_name: '',
//       address: '',
//       cleaning_date: '',
//       cleaning_time: '',
//       total_cleaning_fee: 0,
//       total_cleaning_time: 0,
//       extra: [],
//       regular_cleaning: [],
//       checklistId: null,
//       // include any other fields you need to reset
//     });
//   }, [setFormData]);

//   // Populate form and checklist when a schedule is passed in
//   useEffect(() => {
//     const schedule = propSchedule || contextSchedule;
//     if (schedule) {
//       setFormData(schedule.schedule);
//       setScheduleId(schedule._id);
//       if (schedule.overall_checklist) {
//         setActualChecklist(schedule.overall_checklist);
//       }
//     }
//   }, [propSchedule, contextSchedule, setFormData]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!close_modal) {
//       resetForm();
//       setExtras([]);
//       setStep(1);
//       setIsValid(false);
//       setActualChecklist(null);
//     }
//   }, [close_modal, resetForm]);

//   const validateForm = (isFormValid) => setIsValid(isFormValid);

//   const handleSelectedProperty = (text, input) => {
//     setFormData((prev) => ({ ...prev, [input]: text }));
//   };

//   const handleOnCleaningTime = (value) => {
//     setFormData((prev) => ({ ...prev, cleaning_time: value }));
//   };

//   const handleOnCleaningDate = (value) => {
//     setFormData((prev) => ({ ...prev, cleaning_date: value }));
//   };

//   const handleCleanignExtraSelection = (selectedExtras) => {
//     setExtras(selectedExtras);
//   };

//   const handleExtraTaskTime = (extra_task, input) => {
//     const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
//     setFormData((prev) => ({ ...prev, [input]: extraCleaningTime }));
//   };

//   const handleTotalTaskTime = (totalTime, input) => {
//     setFormData((prev) => ({ ...prev, [input]: totalTime }));
//   };

//   const handleBedroomBathroom = (text, input) => {
//     setFormData((prev) => ({ ...prev, [input]: text }));
//   };

//   const handleNextStep = () => {
//     if (isValid) setStep((prev) => prev + 1);
//   };

//   const handlePrevStep = () => setStep((prev) => prev - 1);
//   const handleEditStep = (stp) => setStep(stp);

//   const handleClose = useCallback(() => {
//     if (close_modal) close_modal();
//     resetForm();
//     setExtras([]);
//     setStep(1);
//     setIsValid(false);
//     setActualChecklist(null);
//   }, [close_modal, resetForm]);

//   // const handleSubmit = async () => {
//   //   setIsSubmitting(true);

//   //   try {
//   //     const schedule = propSchedule || contextSchedule;
//   //     if (!schedule) throw new Error('No schedule selected for editing');

//   //     let checklistToSend = actualChecklist;
//   //     if (!checklistToSend && formData.checklistId) {
//   //       const response = await userService.getChecklist(formData.checklistId);
//   //       if (response.status === 200) {
//   //         checklistToSend = response.data.data;
//   //         setActualChecklist(checklistToSend);
//   //       } else {
//   //         throw new Error('Failed to fetch checklist');
//   //       }
//   //     }

//   //     if (!checklistToSend) throw new Error('No checklist available for this property');

//   //     const updatedChecklist = addExtraCleaningTasks(checklistToSend, formData.extra);

//   //     // const data = {
//   //     //   scheduleId: schedule._id,
//   //     //   hostInfo: currentUser,
//   //     //   schedule: formData,
//   //     //   checklist: updatedChecklist,
//   //     //   before_photos: before_photos,
//   //     //   status: schedule.status,
//   //     // };

//   //     const data = {
//   //       scheduleId: schedule._id,
//   //       hostInfo: currentUser,
//   //       schedule: {
//   //         ...formData,
//   //         cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date),
//   //       },
//   //       checklist: updatedChecklist,
//   //       before_photos: before_photos,
//   //       status: schedule.status,
//   //     };

      

//   //     const response = await userService.updateSchedule(data);
//   //     if (response.status === 200) {
//   //       Toast.show({
//   //         type: 'success',
//   //         text1: tSafe('schedule_updated', 'Schedule updated successfully'),
//   //       });
//   //       setTimeout(() => {
//   //         handleClose();
//   //         setIsSubmitting(false);
//   //         navigation.navigate(ROUTES.host_bookings);
//   //       }, 1500);
//   //     } else {
//   //       throw new Error('Failed to update schedule');
//   //     }
//   //   } catch (err) {
//   //     console.error('Update error:', err);
//   //     Toast.show({
//   //       type: 'error',
//   //       text1: tSafe('error_title', 'Something went wrong'),
//   //       text2: tSafe('try_again', 'Please try again'),
//   //     });
//   //     setIsSubmitting(false);
//   //   }
//   // };

//   // const handleSubmit = async () => {
//   //   setIsSubmitting(true);
  
//   //   try {
//   //     const schedule = propSchedule || contextSchedule;
//   //     if (!schedule) throw new Error('No schedule selected for editing');
  
//   //     let checklistToSend = actualChecklist;
//   //     if (!checklistToSend && formData.checklistId) {
//   //       const response = await userService.getChecklist(formData.checklistId);
//   //       if (response.status === 200) {
//   //         checklistToSend = response.data.data;
//   //         setActualChecklist(checklistToSend);
//   //       } else {
//   //         throw new Error('Failed to fetch checklist');
//   //       }
//   //     }
  
//   //     if (!checklistToSend) throw new Error('No checklist available for this property');
  
//   //     const updatedChecklist = addExtraCleaningTasks(checklistToSend, formData.extra);
  
//   //     // ✅ Preserve assignedTo from the original schedule
//   //     // const updatedScheduleData = {
//   //     //   ...formData,
//   //     //   assignedTo: schedule.assignedTo || [], // keep existing assigned cleaners
//   //     //   cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date),
//   //     // };

      
  
//   //     // const data = {
//   //     //   scheduleId: schedule._id,
//   //     //   hostInfo: currentUser,
//   //     //   schedule: updatedScheduleData,  // use the merged object
//   //     //   checklist: updatedChecklist,
//   //     //   before_photos: before_photos,
//   //     //   status: schedule.status,
//   //     // };
  
//   //     const updatedScheduleData = {
//   //       ...formData,
//   //       assignedTo: schedule.assignedTo || [], // keep existing assigned cleaners
//   //       cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date),
//   //     };
      
//   //     const data = {
//   //       scheduleId: schedule._id,
//   //       hostInfo: currentUser,
//   //       schedule: updatedScheduleData,
//   //       checklist: updatedChecklist,
//   //       before_photos: before_photos,
//   //       status: schedule.status,
//   //     };
//   //     const response = await userService.updateSchedule(data);
//   //     if (response.status === 200) {
//   //       Toast.show({
//   //         type: 'success',
//   //         text1: tSafe('schedule_updated', 'Schedule updated successfully'),
//   //       });
//   //       setTimeout(() => {
//   //         handleClose();
//   //         setIsSubmitting(false);
//   //         navigation.navigate(ROUTES.host_bookings);
//   //       }, 1500);
//   //     } else {
//   //       throw new Error('Failed to update schedule');
//   //     }
//   //   } catch (err) {
//   //     console.error('Update error:', err);
//   //     Toast.show({
//   //       type: 'error',
//   //       text1: tSafe('error_title', 'Something went wrong'),
//   //       text2: tSafe('try_again', 'Please try again'),
//   //     });
//   //     setIsSubmitting(false);
//   //   }
//   // };


//   const handleSubmit = async () => {
//     setIsSubmitting(true);
  
//     try {
//       const schedule = propSchedule || contextSchedule;
//       if (!schedule) throw new Error('No schedule selected for editing');
  
//       // 1️⃣ Check if status allows editing
//       const allowedStatuses = ['open', 'upcoming'];
//       if (!allowedStatuses.includes(schedule.status)) {
//         Toast.show({
//           type: 'error',
//           text1: tSafe('edit_not_allowed', 'Edit Not Allowed'),
//           text2: tSafe('schedule_status_blocked', 'This schedule cannot be edited because it is already in progress, completed, or paid.'),
//         });
//         setIsSubmitting(false);
//         return;
//       }
  
//       // 2️⃣ Fetch checklist if needed (unchanged)
//       let checklistToSend = actualChecklist;
//       if (!checklistToSend && formData.checklistId) {
//         const response = await userService.getChecklist(formData.checklistId);
//         if (response.status === 200) {
//           checklistToSend = response.data.data;
//           setActualChecklist(checklistToSend);
//         } else {
//           throw new Error('Failed to fetch checklist');
//         }
//       }
//       if (!checklistToSend) throw new Error('No checklist available for this property');
  
//       const updatedChecklist = addExtraCleaningTasks(checklistToSend, formData.extra);
  
//       // 3️⃣ Preserve assignedTo from original schedule
//       const updatedScheduleData = {
//         ...formData,
//         assignedTo: schedule.assignedTo || [],
//       };
  
//       // 4️⃣ Determine what changed (for notifications)
//       const dateChanged = formData.cleaning_date !== schedule.schedule?.cleaning_date;
//       const checklistChanged = JSON.stringify(updatedChecklist) !== JSON.stringify(schedule.overall_checklist);
  
//       // 5️⃣ Send notification only if status is 'upcoming' AND (date or checklist changed)
//       const shouldNotify = schedule.status === 'upcoming' && (dateChanged || checklistChanged);
  
//       const data = {
//         scheduleId: schedule._id,
//         hostInfo: currentUser,
//         schedule: updatedScheduleData,
//         checklist: updatedChecklist,
//         before_photos: before_photos,
//         status: schedule.status,
//         notifyCleaners: shouldNotify,
//         changes: {
//           dateChanged,
//           checklistChanged,
//         },
//       };
  
//       // 6️⃣ Send update
//       const response = await userService.updateSchedule(data);
//       if (response.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: tSafe('schedule_updated', 'Schedule updated successfully'),
//         });
//         // Optional: show extra info about notifications
//         if (shouldNotify) {
//           Toast.show({
//             type: 'info',
//             text1: tSafe('notification_sent', 'Cleaners have been notified of the changes.'),
//           });
//         }
//         setTimeout(() => {
//           handleClose();
//           setIsSubmitting(false);
//           navigation.navigate(ROUTES.host_bookings);
//         }, 1500);
//       } else {
//         throw new Error('Failed to update schedule');
//       }
//     } catch (err) {
//       console.error('Update error:', err);
//       Toast.show({
//         type: 'error',
//         text1: tSafe('error_title', 'Something went wrong'),
//         text2: tSafe('try_again', 'Please try again'),
//       });
//       setIsSubmitting(false);
//     }
//   };

//   // Render (unchanged)
//   return (
//     <View style={styles.container}>
//       <StatusBar translucent backgroundColor="white" />
//       <HeaderWithStatusBarAndClose title={tSafe('edit_schedule', 'Edit Schedule')} onClose={handleClose} />
//       <StepsIndicator step={step} />

//       <View style={styles.form}>
//         {step === 1 && (
//           <Animatable.View animation="fadeIn" duration={550}>
//             <PropertyDetails
//               selectedProperty={handleSelectedProperty}
//               formData={formData}
//               setFormData={setFormData}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 2 && (
//           <Animatable.View animation="fadeIn" duration={600}>
//             <Duration
//               getCleanTime={handleOnCleaningTime}
//               getCleanDate={handleOnCleaningDate}
//               formData={formData}
//               setFormData={setFormData}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 3 && (
//           <Animatable.View animation="fadeIn" duration={600}>
//             <CleaningTask
//               onExtraSelect={handleCleanignExtraSelection}
//               extraTasks={handleExtraTaskTime}
//               totalTaskTime={handleTotalTaskTime}
//               roomBathChange={handleBedroomBathroom}
//               formData={formData}
//               setFormData={setFormData}
//               extras={extras}
//               validateForm={validateForm}
//             />
//           </Animatable.View>
//         )}
//         {step === 4 && (
//           <Animatable.View animation="slideInRight" duration={600}>
//             <Review
//               onExtraSelect={handleCleanignExtraSelection}
//               formData={formData}
//               setFormData={setFormData}
//               extras={extras}
//               validateForm={validateForm}
//               step={handleEditStep}
//             />
//           </Animatable.View>
//         )}
//       </View>

//       <View style={styles.footerSticky}>
//         <View style={styles.buttonRow}>
//           {step > 1 && (
//             <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
//               <View style={styles.previous_icon}>
//                 <AntDesign name="caretleft" size={20} color={COLORS.gray} />
//                 <Text style={styles.previous_buttonText}>
//                   {tSafe('previous', ' Previous')}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//           <View style={{ flex: 1 }} />
//           {step < 4 ? (
//             <TouchableOpacity
//               style={[
//                 styles.nextButton,
//                 isValid ? styles.validButton : styles.invalidButton,
//               ]}
//               onPress={handleNextStep}
//               disabled={!isValid}
//             >
//               <Text style={styles.buttonText}>{tSafe('next', 'Next')}</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
//               <Text style={styles.buttonText}>{tSafe('save_publish', 'Save & Publish')}</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <Modal visible={isSubmitting} transparent animationType="fade">
//         <View style={styles.loadingOverlay}>
//           <View style={styles.loadingBox}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.loadingText}>{tSafe('updating_schedule', 'Updating your schedule...')}</Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },
//   form: {
//     flex: 1,
//     padding: 20,
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
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.primary,
//   },
// });

// export default EditSchedule;



import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
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
import { before_photos } from '../../utils/tasks_photo';
import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
import Toast from 'react-native-toast-message';
import { formatDateToYYYYMMDD, formatTimeToHHMMSS } from '../../utils/formatDate';
import { tSafe } from '../../utils/tSafe';

const EditSchedule = ({ close_modal, selectedSchedule: propSchedule }) => {
  const { currency, currentUser } = useContext(AuthContext);
  const navigation = useNavigation();
  const { formData, setFormData, selectedSchedule: contextSchedule } = useBookingContext();

  const [step, setStep] = useState(1);
  const [extras, setExtras] = useState([]);
  const [scheduleId, setScheduleId] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actualChecklist, setActualChecklist] = useState(null);
  const [originalSchedule, setOriginalSchedule] = useState(null);


  // const SCHEDULE_KEYS = [
  //   'aptId',
  //   'apartment_name',
  //   'address',
  //   'apartment_latitude',
  //   'apartment_longitude',
  //   'cleaning_date',
  //   'cleaning_time',
  //   'cleaning_end_time',
  //   'total_cleaning_fee',
  //   'total_cleaning_time',
  //   'selected_apt_room_type_and_size',
  //   'regular_cleaning',
  //   'extra',
  // ];

  const taskTimes = {
    'Window Washing': 20,
    'Inside Cabinets': 15,
    'Carpet Cleaning': 30,
    'Upholstery Cleaning': 20,
    'Tile & Grout Cleaning': 50,
    'Hardwood Floor Refinishing': 50,
    'Inside Fridge': 5,
    'Inside Oven': 30,
    'Pet Cleanup': 20,
    'Dishwasher': 30,
    'Laundry': 30,
    'Exterior': 120,
  };

  const resetForm = useCallback(() => {
    setFormData({
      aptId: '',
      apartment_name: '',
      address: '',
      cleaning_date: '',
      cleaning_time: '',
      total_cleaning_fee: 0,
      total_cleaning_time: 0,
      extra: [],
      regular_cleaning: [],
      checklistId: null,
    });
  }, [setFormData]);

  useEffect(() => {
    console.log("📦 EditSchedule: formData updated =>", formData);
  }, [formData]);
  

  // Populate form and checklist when a schedule is passed in
  useEffect(() => {
    const schedule = propSchedule || contextSchedule;
    if (schedule) {
      setFormData(schedule.schedule);
      setScheduleId(schedule._id);
      setOriginalSchedule(schedule);
      if (schedule.overall_checklist) {
        setActualChecklist(schedule.overall_checklist);
      }
    }
  }, [propSchedule, contextSchedule, setFormData]);

  useEffect(() => {
    if (!close_modal) {
      resetForm();
      setExtras([]);
      setStep(1);
      setIsValid(false);
      setActualChecklist(null);
      setOriginalSchedule(null);
    }
  }, [close_modal, resetForm]);

  const validateForm = (isFormValid) => setIsValid(isFormValid);

  // --- Detect changes including checklist change ---
  const detectChanges = (original, updated) => {
    const changes = {
      dateChanged: false,
      timeChanged: false,
      feeChanged: false,
      extraTasksChanged: false,
      checklistChanged: false,
    };

    if (original) {
      changes.dateChanged = original.cleaning_date !== updated.cleaning_date;
      changes.timeChanged = original.cleaning_time !== updated.cleaning_time;
      changes.feeChanged = original.total_cleaning_fee !== updated.total_cleaning_fee;
      changes.extraTasksChanged = JSON.stringify(original.extra || []) !== JSON.stringify(updated.extra || []);
      changes.checklistChanged = String(original?.checklistId || '') !== String(updated?.checklistId || '');
    }

    return changes;
  };

  console.log("My editable form data --------------- MT", formData)

  const handleSelectedProperty = (text, input) => {
    setFormData((prev) => ({ ...prev, [input]: text }));
  };

  const handleOnCleaningTime = (value) => {
    setFormData((prev) => ({ ...prev, cleaning_time: value }));
  };

  const handleOnCleaningDate = (value) => {
    setFormData((prev) => ({ ...prev, cleaning_date: value }));
  };

  const handleCleanignExtraSelection = (selectedExtras) => {
    setExtras(selectedExtras);
  };

  const handleExtraTaskTime = (extra_task, input) => {
    const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
    setFormData((prev) => ({ ...prev, [input]: extraCleaningTime }));
  };

  const handleTotalTaskTime = (totalTime, input) => {
    setFormData((prev) => ({ ...prev, [input]: totalTime }));
  };

  const handleBedroomBathroom = (text, input) => {
    setFormData((prev) => ({ ...prev, [input]: text }));
  };

  const handleNextStep = () => {
    if (isValid) setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => setStep((prev) => prev - 1);
  const handleEditStep = (stp) => setStep(stp);

  const handleClose = useCallback(() => {
    if (close_modal) close_modal();
    resetForm();
    setExtras([]);
    setStep(1);
    setIsValid(false);
    setActualChecklist(null);
    setOriginalSchedule(null);
  }, [close_modal, resetForm]);

  

  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
    
  //   try {
  //     const schedule = propSchedule || contextSchedule;
  //     if (!schedule) throw new Error('No schedule selected for editing');
  
  //     const scheduleId = typeof schedule._id === 'string' 
  //       ? schedule._id 
  //       : schedule._id.toString();
  
  //     // 1️⃣ Block editing for completed/paid jobs
  //     const disallowedStatuses = ['completed', 'reviewed', 'cancelled'];
  //     // alert(formData.checklistId)
  //     if (disallowedStatuses.includes(schedule.status)) {
  //       alert(formData.checklistId)
  //       Alert.alert("This schedule cannot be edited because it is already completed or paid.")
  //       Toast.show({
  //         type: 'error',
  //         text1: tSafe('edit_not_allowed', 'Edit Not Allowed'),
  //         text2: tSafe('schedule_completed', 'This schedule cannot be edited because it is already completed or paid.'),
  //       });
  //       setIsSubmitting(false);
  //       return;
  //     }
     
  //     // 2️⃣ Fetch checklist if needed
  //     let checklistToSend = actualChecklist;
  //     if (!checklistToSend && formData.checklistId) {
  //       // const response = await userService.getChecklist(formData.checklistId);
  //       const response = await userService.getChecklistById(formData.checklistId);
  //       if (response.status === 200) {
  //         checklistToSend = response.data.data;
  //         setActualChecklist(checklistToSend);
  //       } else {
  //         throw new Error('Failed to fetch checklist');
  //       }
  //     }
  //     if (!checklistToSend) throw new Error('No checklist available for this property');
  
  //     const updatedChecklist = addExtraCleaningTasks(checklistToSend, formData.extra);
  
  //     // 3️⃣ Define allowed keys for the schedule sub-document
  //     const SCHEDULE_KEYS = [
  //       'aptId',
  //       'apartment_name',
  //       'address',
  //       'apartment_latitude',
  //       'apartment_longitude',
  //       'cleaning_date',
  //       'cleaning_time',
  //       'cleaning_end_time',
  //       'total_cleaning_fee',
  //       'total_cleaning_time',
  //       'selected_apt_room_type_and_size',
  //       'regular_cleaning',
  //       'extra',
  //       'checklistId', // IMPORTANT
  //     ];
  
  //     // 4️⃣ Build schedule payload with only allowed keys and formatted values
  //     SCHEDULE_KEYS.forEach(key => {
  //       if (formData[key] !== undefined && formData[key] !== null) {
  //         let value = formData[key];     
  //         if (key === 'cleaning_time') {     
  //           value = formatTimeToHHMMSS(value);    
  //         } else if (key === 'cleaning_date') {
  //           value = formatDateToYYYYMMDD(value);    
  //         } else if (key === 'checklistId') {
  //           value = String(value);
  //         }
  //         schedulePayload[key] = value;
  //       }
  //     });

  //     // 5️⃣ Detect changes (compare original schedule with the new schedulePayload)
  //     const changes = detectChanges(schedule.schedule || schedule, schedulePayload);
  
  //     // 6️⃣ Determine notification behavior
  //     const status = schedule.status;
  //     let notifyMode = 'none';
  
  //     if (['accepted', 'in_progress', 'pending_review'].includes(status)) {
  //       if (changes.dateChanged || changes.timeChanged || changes.feeChanged || changes.extraTasksChanged || changes.checklistChanged) {
  //         notifyMode = 'update';
  //       }
  //     } else if (status === 'upcoming') {
  //       if (changes.dateChanged || changes.timeChanged || changes.checklistChanged) {
  //         notifyMode = 'update';
  //       }
  //     } else if (status === 'open') {
  //       if (changes.dateChanged || changes.timeChanged || changes.checklistChanged) {
  //         notifyMode = 'broadcast';
  //       }
  //     }
  
  //     // 7️⃣ Build final payload
  //     const data = {
  //       hostInfo: currentUser,
  //       schedule: schedulePayload,
  //       checklist: updatedChecklist,
  //       before_photos: before_photos,
  //       status: schedule.status,
  //       changes: changes,
  //       notifyMode: notifyMode,
  //     };
  
  //     console.log("Edit data----------ST", data);
  
  //     // 8️⃣ Send update with the string ID
  //     const response = await userService.updateSchedule(scheduleId, data);
  //     if (response.status === 200) {
  //       Toast.show({
  //         type: 'success',
  //         text1: tSafe('schedule_updated', 'Schedule updated successfully'),
  //       });
  //       setTimeout(() => {
  //         handleClose();
  //         setIsSubmitting(false);
  //         navigation.navigate(ROUTES.host_bookings);
  //       }, 1500);
  //     } else {
  //       throw new Error('Failed to update schedule');
  //     }
  //   } catch (err) {
  //     console.error('Update error:', err);
  //     Toast.show({
  //       type: 'error',
  //       text1: tSafe('error_title', 'Something went wrong'),
  //       text2: tSafe('try_again', 'Please try again'),
  //     });
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async () => {
    setIsSubmitting(true);
  
    try {
      const schedule = propSchedule || contextSchedule;
  
      if (!schedule) {
        throw new Error('No schedule selected for editing');
      }
  
      const scheduleId =
        typeof schedule._id === 'string'
          ? schedule._id
          : schedule._id.toString();
  
      const disallowedStatuses = ['completed', 'reviewed', 'cancelled'];
  
      if (disallowedStatuses.includes(schedule.status)) {
        Toast.show({
          type: 'error',
          text1: tSafe('edit_not_allowed', 'Edit Not Allowed'),
          text2: tSafe(
            'schedule_completed',
            'This schedule cannot be edited because it is already completed or paid.'
          ),
        });
  
        setIsSubmitting(false);
        return;
      }
  
      // 1. Get the checklist
      let checklistToSend = actualChecklist;
  
      if (!checklistToSend && formData.checklistId) {
        const response = await userService.getChecklist(formData.checklistId);
  
        if (response.status === 200) {
          checklistToSend = response.data.data;
          setActualChecklist(checklistToSend);
        } else {
          throw new Error('Failed to fetch checklist');
        }
      }
  
      if (!checklistToSend) {
        throw new Error('No checklist available for this property');
      }
  
      // 2. Add extra tasks to checklist
      const updatedChecklist = addExtraCleaningTasks(
        checklistToSend,
        formData.extra
      );
  
      // 3. IMPORTANT: checklistId must be included here
      const SCHEDULE_KEYS = [
        'aptId',
        'apartment_name',
        'address',
        'apartment_latitude',
        'apartment_longitude',
        'cleaning_date',
        'cleaning_time',
        'cleaning_end_time',
        'total_cleaning_fee',
        'total_cleaning_time',
        'selected_apt_room_type_and_size',
        'regular_cleaning',
        'extra',
        'checklistId', // <-- ADD THIS
      ];
  
      // 4. Build schedulePayload
      const schedulePayload = {};
  
      SCHEDULE_KEYS.forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          let value = formData[key];
  
          if (key === 'cleaning_time') {
            value = formatTimeToHHMMSS(value);
          } else if (key === 'cleaning_date') {
            value = formatDateToYYYYMMDD(value);
          }
  
          schedulePayload[key] = value;
        }
      });
  
      // 5. Detect changes AFTER schedulePayload exists
      const changes = detectChanges(
        schedule.schedule || schedule,
        schedulePayload
      );
  
      console.log('CHECKLIST DEBUG:', {
        originalChecklistId: (schedule.schedule || schedule).checklistId,
        newChecklistId: schedulePayload.checklistId,
        checklistChanged: changes.checklistChanged,
      });
  
      // 6. Determine notification behavior
      const status = schedule.status;
      let notifyMode = 'none';
  
      if (['accepted', 'in_progress', 'pending_review'].includes(status)) {
        if (
          changes.dateChanged ||
          changes.timeChanged ||
          changes.feeChanged ||
          changes.extraTasksChanged ||
          changes.checklistChanged
        ) {
          notifyMode = 'update';
        }
      } else if (status === 'upcoming') {
        if (
          changes.dateChanged ||
          changes.timeChanged ||
          changes.checklistChanged
        ) {
          notifyMode = 'update';
        }
      } else if (status === 'open') {
        if (
          changes.dateChanged ||
          changes.timeChanged ||
          changes.checklistChanged
        ) {
          notifyMode = 'broadcast';
        }
      }
  
      // 7. Build final request
      const data = {
        // hostInfo: currentUser,
        schedule: schedulePayload,
        checklist: updatedChecklist,
        before_photos: before_photos,
        // status: schedule.status,
        // changes: changes,
        // notifyMode: notifyMode,
      };
  
      // console.log('EDIT DATA:', JSON.stringify(data, null, 2));
  
      // 8. Send update
      const response = await userService.updateSchedule(
        scheduleId,
        data
      );
  
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: tSafe(
            'schedule_updated',
            'Schedule updated successfully'
          ),
        });
  
        setTimeout(() => {
          handleClose();
          setIsSubmitting(false);
          navigation.navigate(ROUTES.host_bookings);
        }, 1500);
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (err) {
      console.error('Update error:', err);
  
      Toast.show({
        type: 'error',
        text1: tSafe('error_title', 'Something went wrong'),
        text2: tSafe('try_again', 'Please try again'),
      });
  
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="white" />
      <HeaderWithStatusBarAndClose title={tSafe('edit_schedule', 'Edit Schedule')} onClose={handleClose} />
      <StepsIndicator step={step} />

      <View style={styles.form}>
        {step === 1 && (
          <Animatable.View animation="fadeIn" duration={550}>
            <PropertyDetails
              selectedProperty={handleSelectedProperty}
              formData={formData}
              setFormData={setFormData}
              validateForm={validateForm}
            />
          </Animatable.View>
        )}
        {step === 2 && (
          <Animatable.View animation="fadeIn" duration={600}>
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
          <Animatable.View animation="fadeIn" duration={600}>
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

      <View style={styles.footerSticky}>
        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
              <View style={styles.previous_icon}>
                <AntDesign name="caretleft" size={20} color={COLORS.gray} />
                <Text style={styles.previous_buttonText}>
                  {tSafe('previous', ' Previous')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < 4 ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                isValid ? styles.validButton : styles.invalidButton,
              ]}
              onPress={handleNextStep}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>{tSafe('next', 'Next')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.buttonText}>{tSafe('save_publish', 'Save & Publish')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={isSubmitting} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{tSafe('updating_schedule', 'Updating your schedule...')}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  form: {
    flex: 1,
    padding: 20,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default EditSchedule;