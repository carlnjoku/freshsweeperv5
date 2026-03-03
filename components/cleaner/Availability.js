import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';
import COLORS from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import availabilityRange from '../../utils/availabilityRange';
import userService from '../../services/connection/userService';



const AvailabilityComponent = ({userId, close_avail_modal, get_availability}) => {
    // State to manage availability data
    const [availability, setAvailability] = useState([
        { day: 'Monday', isAvailable: true, startTime: new Date(), endTime: new Date() },
        { day: 'Tuesday', isAvailable: true, startTime: new Date(), endTime: new Date() },
        { day: 'Wednesday', isAvailable: true, startTime: new Date(), endTime: new Date() },
        { day: 'Thursday', isAvailable: true, startTime: new Date(), endTime: new Date() },
        { day: 'Friday', isAvailable: true, startTime: new Date(), endTime: new Date() },
        { day: 'Saturday', isAvailable: true, startTime: new Date(), endTime: new Date() },
        { day: 'Sunday', isAvailable: true, startTime: new Date(), endTime: new Date() },
    ]);

    // State variables to control the visibility of DateTimePickers
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const [timeType, setTimeType] = useState('');

    // Function to handle availability changes
    const handleAvailabilityChange = (index, value) => {
        const updatedAvailability = [...availability];
        updatedAvailability[index].isAvailable = value;
        setAvailability(updatedAvailability);
    };

    // Function to handle time changes
    const handleTimeChange = (event, selectedDate) => {
        if (selectedDate) {
            const updatedAvailability = [...availability];
            if (timeType === 'startTime') {
                updatedAvailability[selectedDayIndex].startTime = selectedDate;
            } else if (timeType === 'endTime') {
                updatedAvailability[selectedDayIndex].endTime = selectedDate;
            }
            setAvailability(updatedAvailability);
            console.log("___________")
            // console.log(updatedAvailability)
            console.log("__________")
            get_availability(updatedAvailability)
        }
        // Close the DateTimePicker
        setShowStartTimePicker(false);
        setShowEndTimePicker(false);
    };

    // Function to open the DateTimePicker for the selected day and time type
    const openTimePicker = (index, type) => {
        setSelectedDayIndex(index);
        setTimeType(type);
        if (type === 'startTime') {
            setShowStartTimePicker(true);
        } else if (type === 'endTime') {
            setShowEndTimePicker(true);
        }
    };
   
    const onSubmit = async() => {
       const data = {
        userId:userId,
        availability:availabilityRange(availability)
       }
       console.log(data)
       await userService.updateAvailability(data)
        .then(response => {
            const res = response.data.message
            console.log(res)
            get_availability(availability)
            close_avail_modal(false)
        })
    }
    
    const onClose = () => {
        close_avail_modal(false)
        get_availability(availability)
    }

    return (
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
         <StatusBar translucent backgroundColor="transparent" />

        <View style={styles.close_button}><MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} /></View>
        <Text style={styles.heading}>Update Availability</Text>
       
        <View style={styles.container}>
            {availability.map((item, index) => (
                <View key={index} style={styles.availabilityItem}>
                    <Text style={styles.day}>{item.day}:</Text>
                    <Switch
                        value={item.isAvailable}
                        onValueChange={(value) => handleAvailabilityChange(index, value)}
                    />
                    {item.isAvailable && (
                        <View style={styles.timeRangeContainer}>
                            {/* Start Time Picker */}
                            <TouchableOpacity onPress={() => openTimePicker(index, 'startTime')}>
                                <Text style={styles.timeText}>
                                    {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>

                            {/* End Time Picker */}
                            <TouchableOpacity onPress={() => openTimePicker(index, 'endTime')}>
                                <Text style={styles.timeText}>
                                    {item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>

                            {/* DateTimePicker for Start Time */}
                            {showStartTimePicker && selectedDayIndex === index && timeType === 'startTime' && (
                                <DatePicker
                                    value={item.startTime}
                                    mode="time"
                                    display="spinner"
                                    onChange={handleTimeChange}
                                />
                            )}

                            {/* DateTimePicker for End Time */}
                            {showEndTimePicker && selectedDayIndex === index && timeType === 'endTime' && (
                                <DatePicker
                                    value={item.endTime}
                                    mode="time"
                                    display="spinner"
                                    onChange={handleTimeChange}
                                />
                            )}
                        </View>
                    )}
                </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={onSubmit}>
                <Text style={styles.button_text}>Continue</Text>
            </TouchableOpacity>
        </View>
      
          
        </View>
    </View>

        
    );
};

const windowHeight = Dimensions.get('window').height;
const modalHeight = windowHeight * 0.65;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:COLORS.backgroundColor,
        padding:20,
        // justifyContent: 'center',
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
          marginTop:30,
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.1)', // semi-transparent background
        },
        modalContent: {
          backgroundColor: 'white',
          padding: 20,
          // borderRadius: 10,
          borderTopRightRadius:10,
          borderTopLeftRadius:10,
          elevation: 5,
          height: modalHeight, // Set the height of the modal
          width: '100%',
        },
        close_button:{
         
          alignItems:'flex-end'
        },
        availabilityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 0,
        },
        day: {
            flex: 1,
            fontWeight: 'bold',
        },
        timeText: {
            marginHorizontal: 8,
            fontSize: 16,
        },
        timeRangeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
});

export default AvailabilityComponent;



