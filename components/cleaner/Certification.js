import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch,StatusBar, Alert, TouchableOpacity,Dimensions } from 'react-native';
import COLORS from '../../constants/colors';
import { TextInput } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';

import userService from '../../services/connection/userService';


const Certification = ({userId,close_modal}) => {
    
    const[inputs, setInputs] = useState({
      userId:userId,
      name:'',
      institution_name:'',
      credentialUrl:'',
      startDate:new Date(),
      endDate:new Date(),
      expiryDate:new Date()

    })
  
    // const[startDate, setStartDate] = useState(new Date())
    // const[endDate, setEndDate] = useState(new Date());
    // const[expiryDate, setExpiryDate] = useState(new Date())
    const[errors, setErrors] = useState({
      name:'',
      institution_name:'',
    })
    const[showStartDatePicker, setShowStartDatePicker] = useState(false);
    const[showEndDatePicker, setShowEndDatePicker] = useState(false);
    const[showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

    // const formattedEndDate = endDate instanceof Date ? endDate.toDateString() : '';

    // const handleEndDateChange = (event, selectedDate) => {
    //   const currentDate = selectedDate || endDate;
    //   setShowEndDatePicker(Platform.OS === 'ios'); // Close the picker for Android
    //   setEndDate(currentDate);
    // };

    console.log(inputs)
    const handleStartDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || startDate;
      setShowStartDatePicker(false); // Close the picker
      setInputs(prevState => ({...prevState, startDate: currentDate}));
    };

    const handleEndDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || endDate;
      setShowEndDatePicker(false); // Close the picker
      setInputs(prevState => ({...prevState, endDate: currentDate}));
    };

    const handleExpiryDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || expiryDate;
      setShowExpiryDatePicker(false); // Close the picker
      setInputs(prevState => ({...prevState, expiryDate: currentDate}));
  };

    const handleAChange = (text, input) => {
        console.log(text)
        setInputs(prevState => ({...prevState, [input]: text}));
    }
    const handleError = (error, input) => {
      setErrors(prevState => ({...prevState, [input]: error}));
    };

    const onClose = () => {
        close_modal(false)
    }

    const validate = async () => {
      let isValid = true;
  
      if (inputs.name === "") {
          handleError(
              <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
                  Enter certification name
              </Text>, 
              'name'
          );
          isValid = false;
      }
      if (inputs.institution_name === "") {
          handleError(
              <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
                  Enter certification institution name
              </Text>, 
              'institution_name'
          );
          isValid = false;
      }
  
      if (isValid) {
          // Call the onSubmit function if the validation is successful
          onSubmit();
      }
  };


  const onSubmit = async()=> {
    try {
   
      await userService.updateCleanerCertification(inputs)
      .then(response => {
          const status = response.status
          const res = response.data
          console.log(status)
          if(status===200){
              console.log(res.message)
              // setIsBeforeSave(false)
              setResposeMessage(res.message)
          }else{
              Alert.alert("Oop! something went wrong, try again")
          }
      })
    }catch(e){
        Alert.alert("Oop! something went wrong, try again")
    }
  }





   
    return (
      
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
         {/* <StatusBar translucent backgroundColor="transparent" /> */}

        <View style={styles.close_button}><MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} /></View>
        
        <Text style={styles.heading}>Add Certification or License</Text>
       
        
      
        
            <TextInput
                mode="outlined"
                label="Certification/ License Name"
                placeholder="Certification/ License Name"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                // keyboardType="numeric"
                value={inputs.name}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={text => handleAChange(text, 'name')}
                onFocus={() => handleError(null, 'name')}
                error={errors.name}
                
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
                mode="outlined"
                label="Institution Name"
                placeholder="Institution Name"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                value={inputs.institution_name}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={text => handleAChange(text, 'institution_name')}
                onFocus={() => handleError(null, 'institution_name')}
                error={errors.institution_name}
                
            />
            {errors.institution_name && <Text style={styles.errorText}>{errors.institution_name}</Text>}
            
            <View>
              <TextInput
                mode="outlined"
                label="Select Start Date"
                value={inputs.startDate.toDateString()} // Display the formatted date
                onFocus={() => setShowStartDatePicker(true)} // Show the date picker when the TextInput is focused
                editable={false} // Make TextInput read-only
                outlineColor="#D8D8D8"
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                // onFocus={() => handleError(null, 'name')}
                error={errors.startDate}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setShowStartDatePicker(true)} // Show the date picker when the icon is pressed
                    color={COLORS.light_gray}
                  />
                }
              />

              {/* DateTimePicker for selecting a date */}
              {showStartDatePicker && (
                <DatePicker
                  value={inputs.startDate}
                  mode="date"
                  display="spinner"
                  onChange={handleStartDateChange}
                  style={{borderRadius:10}}
                />
              )}
            </View>
            <View >
              <TextInput
                mode="outlined"
                label="Select End Date"
                value={inputs.endDate.toDateString()} // Display the formatted date
                onFocus={() => setShowEndDatePicker(true)} // Show the date picker when the TextInput is focused
                editable={false} // Make TextInput read-only
                outlineColor="#D8D8D8"
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                // onFocus={() => handleError(null, 'name')}
                error={errors.endDate}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setShowEndDatePicker(true)} // Show the date picker when the icon is pressed
                    color={COLORS.light_gray}
                  />
                }
              />

              {/* DateTimePicker for selecting a date */}
              {showEndDatePicker && (
                <View style={styles.dateTimePickerContainer}>
                  <DateTimePicker
                    value={inputs.endDate}
                    mode="date"
                    display="spinner"
                    onChange={handleEndDateChange}
                    style={{borderRadius:10}}
                  />
                </View>
              )}
            </View>
            <View>
              <TextInput
                mode="outlined"
                label="Select Expiry Date"
                value={inputs.expiryDate.toDateString()} // Display the formatted date
                onFocus={() => setShowExpiryDatePicker(true)} // Show the date picker when the TextInput is focused
                editable={false} // Make TextInput read-only
                outlineColor="#D8D8D8"
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
               
                // onFocus={() => handleError(null, 'name')}
                error={errors.expiryDate}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setShowExpiryDatePicker(true)} // Show the date picker when the icon is pressed
                    color={COLORS.light_gray}
                  />
                }
              />

              {/* DateTimePicker for selecting a date */}
              {showExpiryDatePicker && (
                <DateTimePicker
                  value={inputs.expiryDate}
                  mode="date"
                  display="spinner"
                  onChange={handleExpiryDateChange}
                  style={{borderRadius:10}}
                />
              )}
            </View>
            
            <TextInput
                mode="outlined"
                label="Credential Url"
                placeholder="Credential Url"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                autoCapitalize="none"
                value={inputs.credentialUrl}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={text => handleAChange(text, 'credentialUrl')}
                // onFocus={() => handleError(null, 'credentialUrl')}
                error={errors.credentialUrl}
                
            />
            


            <TouchableOpacity 
              onPress={validate}
              style={styles.button} 
            >
              
              <Text onPress={onClose} bold style={styles.button_text}> Confirm</Text>
            </TouchableOpacity>
              
        </View>
    </View>
    );
};
const windowHeight = Dimensions.get('window').height;
const modalHeight = windowHeight * 1;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:COLORS.backgroundColor,
      padding:20,
      justifyContent: 'center',
    alignItems: 'center',
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      detailsContainer: {
        marginBottom: 20,
      },
      label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      details: {
        fontSize: 16,
      },
      button: {
        flexDirection:'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical:20,
        justifyContent:'center',
        backgroundColor: COLORS.primary,
        borderRadius:50
      },
      button_text:{
        color:COLORS.white
      },
      modalContainer: {
        flex: 1,
        marginTop:30
        // justifyContent: 'flex-end',
        // alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.1)', // semi-transparent background
      },
      modalContent: {
        backgroundColor: 'white',
        padding: 20,
        // borderRadius: 10,
        borderTopRightRadius:10,
        borderTopLeftRadius:10,
        elevation: 5,
        height: '100%', // Set the height of the modal
        width: '100%',
      },
      close_button:{
        alignItems:'flex-end'
      },
      dateTimePickerContainer: {
        borderRadius: 10, // Customize border radius here
        overflow: 'hidden', // Clip the DateTimePicker within the View
        // Add other styles such as border width, color, etc.
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginBottom: 10,
  },
})

export default Certification;
