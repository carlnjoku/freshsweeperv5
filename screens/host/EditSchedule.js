import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, TextInput, Text, Button, StyleSheet, StatusBar, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import PropertyDetails from './CreateBookingContents/PropertyDetails';
import { AuthContext } from '../../context/AuthContext';
import Duration from './CreateBookingContents/Duration';
import CleaningTask from './CreateBookingContents/CleaningTask';
import Review from './CreateBookingContents/Review';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import { useBookingContext } from '../../context/BookingContext';
import { useNavigation } from '@react-navigation/native'
import userService from '../../services/connection/userService';
import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
import ROUTES from '../../constants/routes';
import StepsIndicator from '../../components/shared/StepsIndicator';
import { before_photos, checklist } from '../../utils/tasks_photo';
import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
import Toast from 'react-native-toast-message';





const EditSchedule = ({close_modal,  schedule, onSave, onClose}) => {

  const {currency, currentUser, currentUserId} = useContext(AuthContext)
  const navigation = useNavigation()

  const [currentStep, setCurrentStep] = React.useState(2); // Example: Step 2 is active
  
  const {formData, setFormData, setModalEVisible, setModalVisible, modalEVisible, resetFormData, selectedSchedule, handleCreateSchedule } = useBookingContext();
  
  const [step, setStep] = useState(1);
  const [extras, setExtras] = useState([]);
  const [scheduleId, setScheduleId] = useState([]);
  const [checkList, setChecklist] = useState([]);
  const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  
  console.log("My schedule", scheduleId)
  

  const taskTimes =  
  {
    "Window Washing":20,
    "Inside Cabinets":15,
    "Carpet Cleaning":30,
    "Upholstery Cleaning":20,
    "Tile & Grout Cleaning":50,
    "Hardwood Floor Refinishing":50,
    "Inside Fridge":5,
    "Inside Oven":30,
    "Pet Cleanup":20,
    "Dishwasher":30,
    "Laundry":30,
    "Exterior":120,    
  }


  useEffect(() => {
    console.log("Selected schedule:", selectedSchedule); // Check if schedule contains data
    if (selectedSchedule) {
      setFormData(selectedSchedule.schedule);
      setScheduleId(selectedSchedule._id)
    }

    if (!modalEVisible) {
        resetFormData(); // Ensure data resets when modal closes
      }
  }, [selectedSchedule]);
  
  


  // Your validation logic here
  const validateForm = (isFormValid) => {
    // alert(isFormValid+" parent")
    // Example validation logic: Check if the form is valid
    // const isFormValid = true; // Replace with your validation logic
    setIsValid(isFormValid);
    // onValidationChange()
  };

  
  
  const handleOnCleaningTime = (text, input) => {
    setFormData(prevState => ({...prevState, [input]: text}))
  }

  const handleOnCleaningDate = (text, input) => {
    setFormData(prevState => ({...prevState, [input]: text}))
  }
  const handleSelectedProperty = (text, input) => {
    setFormData(prevState => ({...prevState, [input]: text}))
    // console.log(formData)
  }

  // const handleCleanignExtraSelection = (text) => {
  //   setFormData((prevState) => ({ ...prevState, extra: text }));
  //   console.log(formData);
  // };

  const handleCleanignExtraSelection = (selectedExtras) => {
    setExtras(selectedExtras);
    // console.log(selectedExtras);
  };

  const handleExtraTaskTime = (extra_task, input) => {
    const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes)
    
    // console.log(extraCleaningTime)
    setFormData(prevState => ({...prevState, [input]: extraCleaningTime}))
  }

  const handleTotalTaskTime = (totalTime, input) => {
    setFormData(prevState => ({...prevState, [input]: totalTime}))
  }

  const handleBedroomBathroom = (text, input) => {
    setFormData(prevState => ({...prevState, [input]: text}))
    // console.log(formData)
  }
  
  const handleNextStep = () => {
    // validateForm();
    if (isValid) {
      setStep(step + 1);
    }
    setStep(step + 1);
  };
  

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleEditStep = (stp) => {
    setStep(stp)
  }
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  
  const handleClose = () => {
    setModalEVisible(false)
    resetFormData()
    setExtras([]);
  }

  const createTaskChecklist = () => {
  
    if(formData.extra.length > 0 ){
      // Create default / regular task_checklist from extra
      // Convert the array of extras to the task_checklist format

      const formattedExtras = formData.extra.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      }));

      // Remove icon and price from formattedExtra
      const cleanedArray = formattedExtras.map(service => {
        // Destructure value object and remove icon and price
        const { icon, price, ...valueWithoutIconAndPrice } = service.value;
        
        // Return new object with modified value
        return {
          ...service,
          value: valueWithoutIconAndPrice
        };
      });
      
      // console.log(cleanedArray);

      const formattedRegular = formData.regular_cleaning.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      }));

      const updatedChecklist = [...cleanedArray, ...formattedRegular];

      console.log("checklist..................")
      // console.log(JSON.stringify(updatedChecklist, null, 2))
      console.log("checklist..................")
      setUpdatedTaskChecklist(updatedChecklist)
    }else{
      // console.log(formattedRegular)
      setUpdatedTaskChecklist(formattedRegular)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true); // Show loading modal
        const updatedChecklist = addExtraCleaningTasks(checklist, formData.extra);
        const data = {
          scheduleId:scheduleId,
          hostInfo:currentUser,
          schedule: formData,
          checklist: updatedChecklist,
          before_photos: before_photos
        }      
        
        
        await userService.updateSchedule(data)
        .then(response => {
          console.log(response.status)
          if(response.status === 200){
            const res = response.data.data

            Toast.show({
              type: 'success',
              text1: 'Schedule updated successfully',
            });

            
            
            setTimeout(() => {

              handleClose()
              setIsSubmitting(false);      // Hide overlay
              navigation.navigate(ROUTES.host_bookings); // Redirect
            }, 1500); // Delay so the toast is visible
          } else {
            throw new Error("Failed to update schedule");
          }
        
          
        }).catch((err)=> {
          Toast.show({
            type: 'error',
            text1: 'Something went wrong',
            text2: 'Please try again',
          });
          setIsSubmitting(false); // Hide overlay
          
        })
  };

  

  return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="white" />
            <HeaderWithStatusBarAndClose title="Edit Schedule" onClose={handleClose} />
            <StepsIndicator step={step} />
            <View style={styles.form}>
            
            {formData && step === 1 && 
                <Animatable.View animation="fadeIn" duration={550}>
                    <PropertyDetails
                    selectedProperty = {handleSelectedProperty}
                    formData={formData} 
                    setFormData={setFormData} 
                    validateForm={validateForm}
                    />
                </Animatable.View>
                }
                {formData && step === 2 &&  
                <Animatable.View animation="fadeIn" duration={600}>
                <Duration 
                    getCleanTime={handleOnCleaningTime}
                    getCleanDate={handleOnCleaningDate}
                    formData={formData}
                    setFormData={setFormData}
                    validateForm={validateForm}
                />
                </Animatable.View>
            }
                {formData && step === 3 &&  
                <Animatable.View animation="fadeIn" duration={600}>
                <CleaningTask  
                    onExtraSelect={handleCleanignExtraSelection} 
                    extraTasks={handleExtraTaskTime}
                    totalTaskTime={handleTotalTaskTime}
                    roomBathChange ={handleBedroomBathroom}
                    formData={formData} 
                    setFormData={setFormData}   
                    extras= {extras}
                    validateForm={validateForm}
                />
                </Animatable.View>
                }
                {formData && step === 4 && 
                <Animatable.View animation="slideInRight" duration={600}>
                <Review  
                    onExtraSelect={handleCleanignExtraSelection} 
                    
                    formData={formData} 
                    setFormData={setFormData}   
                    extras= {extras}
                    validateForm={validateForm}
                    step={handleEditStep}
                />
                </Animatable.View>
                }

            
            </View>


                
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                    <View>
                    <Text style={styles.priceText}>Estimated Fee {currency}{parseFloat(formData.total_cleaning_fee).toFixed(2) || 0}</Text>
                    </View>
                </View>
            <View style={styles.buttonContainer}>
                
                
                {step > 1 && (
                <TouchableOpacity style={styles.previous_button}  onPress={handlePrevStep}>
                    <View style={styles.previous_icon}>
                    <AntDesign name="caretleft" size={20} color={COLORS.gray} />
                    <Text style={styles.previous_buttonText}> Previous</Text>
                    
                    </View>
                </TouchableOpacity>
                )}
                {/* <View><Text style={{fontSize:20}}>$40</Text></View> */}
                <View style={{ flex: 1, alignItems: 'center' }}>

                
                </View>
                <View style={{ flex: 1 }} /> 
                
                
                {step < 4 ? (
                
                
                <TouchableOpacity 
                    // style={styles.button} onPress={handleNextStep}
                    style={ [styles.nextButton, isValid ? styles.validButton : styles.invalidButton]}
                    onPress={handleNextStep}
                    disabled={!isValid} // Disable the button if the form is not valid
                    >
                    
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
                ) : (
                <TouchableOpacity style={styles.button}>
                    <Text onPress={handleSubmit} style={styles.buttonText}>Publish</Text>
                </TouchableOpacity>
                )}

          <Modal visible={isSubmitting} transparent={true} animationType="fade">
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Updating your schedule...</Text>
              </View>
            </View>
          </Modal>
        
            </View>
            </View>


  );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
      },
      form: {
        flex: 1,
        padding: 20,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal:20,
        paddingVertical:5,
        borderTopWidth:1,
        borderColor:COLORS.light_gray_1,
        marginTop:2
      },
      button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 50,
      },
      previous_button: {
        backgroundColor: 'transparent',
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 5,
      },
      buttonText: {
        color: '#ffffff',
        fontSize: 18,
      },
      previous_buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight:'bold'
      },
      previous_icon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      progressBar: {
        backgroundColor: '#ddd',
        height: 10,
        borderRadius: 5,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 0,
      },
      progressIndicator: {
        backgroundColor: COLORS.primary,
        height: '100%',
        borderRadius: 5,
      },
      close_button:{
        marginTop:10,
        marginLeft:10
      },
      priceText: {
        fontSize: 16,
        marginLeft:20,
        color:COLORS.deepBlue,
        fontWeight:'600'
      },
    
      nextButton: {
        backgroundColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 50,
      },
      validButton: {
        backgroundColor: 'green', // Example: change color if form is valid
      },
      invalidButton: {
        backgroundColor: 'gray', // Keep it gray if form is invalid
      },
      headerContainer: {
        flexDirection:'row',
        height: 60, // Height of the header below the status bar
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // Ensures layout elements are positioned relative to the parent
        // Remove shadow from the top
        shadowColor: '#000', 
        // shadowOffset: { width: 0, height: 2 }, // Shadow is directed towards the bottom
        // shadowOpacity: 0.2, // Light opacity for subtle shadow
        // shadowRadius: 3, // Softens the shadow's edges
        // elevation: 5, // Shadow for Android (bottom)
        // borderBottomWidth: 1,
        // borderBottomColor: '#e0e0e0', // Light line separating the header from content
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

