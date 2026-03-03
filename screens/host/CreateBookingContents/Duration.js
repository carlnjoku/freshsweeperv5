// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Pressable } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import moment from 'moment';



// export default function Duration({ formData, setFormData, getCleanDate, getCleanTime, validateForm }) {
//   const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
//   const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(formData.cleaning_date);
//   const [selectedTime, setSelectedTime] = useState(formData.cleaning_time);

//   const [date, setDate] = useState(new Date()); // Date object
//   const [time, setTime] = useState(new Date()); // Time object
//   const [clean_date, setCleanDate] = useState("");
//   const [clean_time, setCleanTime] = useState("");
//   const [dateError, setDateError] = useState(''); // For displaying date validation errors


//   const [isValid, setIsValid] = useState(false);

//   const calculateEndTime = (startTime, durationInMinutes) => {
//     return moment(startTime, "HH:mm:ss")
//       .add(durationInMinutes, "minutes")
//       .format("HH:mm:ss");
//   };

//     useEffect(() => {
//     // Prepopulate date and time if available in formData
//     if (formData.cleaning_date) {
//       const savedDate = new Date(formData.cleaning_date);
//       setDate(savedDate);
//       setCleanDate(moment(savedDate).format("YYYY-MM-DD"));

//       console.log("Existing schedule", formData)
//     }

//     if (formData.cleaning_time) {
//       const savedTime = moment(formData.cleaning_time, "HH:mm:ss").toDate();
//       setTime(savedTime);
//       setCleanTime(moment(savedTime).format("HH:mm:ss"));
//     }
//   }, [formData]);

//     useEffect(() => {
//       validate();
//     }, [clean_date, clean_time]);

//     const validate = () => {
//       const isFormValid = clean_date !== '' && clean_time !== '';
//       setIsValid(isFormValid);
//       validateForm(isFormValid);
//     };


        

//   const showDatePicker = () => setDatePickerVisibility(true);
//   const hideDatePicker = () => setDatePickerVisibility(false);

//   const showTimePicker = () => setTimePickerVisibility(true);
//   const hideTimePicker = () => setTimePickerVisibility(false);
  
  
  
//   const handleConfirmDate = (date) => {
//     // console.log(date)
//     const formattedDate = moment(date).format('YYYY-MM-DD');
    
//       setSelectedDate(formattedDate);
//       getCleanDate(date);
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         cleaning_date: formattedDate,
//       }));
//       hideDatePicker();
//       validateForm();
//       validate();
  
//   };


//   const handleConfirmTime = (time) => {
//     const formattedTime = time.toTimeString().split(' ')[0]; // Format as HH:mm:ss
//     setSelectedTime(formattedTime);
//     getCleanTime(time)
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       cleaning_time: formattedTime,
//     }));

//     // Calculate end_cleaning_time
//     const cleaning_end_time = calculateEndTime(formattedTime, formData.total_cleaning_time)
//     setFormData((prevFormData) => ({
//         ...prevFormData,
//         cleaning_end_time: cleaning_end_time,
//     }));
//     // validate();
//     hideTimePicker();
//     validateForm();
//   };

//   console.log("My formData", formData)

//   return (
//     <View>
//       <Text bold style={styles.title}>
//         Schedule Cleaning Time
//       </Text>
//       <Text style={styles.subtitle}>
//         Pick the date and time for cleaning
//       </Text>

//       {/* Date Picker */}
//       <Pressable onPress={showDatePicker}>
//         <TextInput
//           mode="outlined"
//           label="Cleaning Date"
//           value={selectedDate}
//           placeholder="Select Date"
//           editable={false} // Prevent typing
//           style={styles.textInput}
//           outlineColor={COLORS.gray}
//           activeOutlineColor={COLORS.primary}
//           right={<TextInput.Icon name="calendar" />}
//           pointerEvents="none"
//         />
//       </Pressable>
      
//       <DateTimePickerModal
//         isVisible={isDatePickerVisible}
//         mode="date"
//         display="spinner"
//         onConfirm={handleConfirmDate}
//         onCancel={hideDatePicker}
//         minimumDate={new Date()}
//       />

//       {/* Time Picker */}
//       <Pressable onPress={showTimePicker}>
//         <TextInput
//           mode="outlined"
//           label="Cleaning Time"
//           value={selectedTime}
//           placeholder="Select Time"
//           editable={false} // Prevent typing
//           style={styles.textInput}
//           outlineColor={COLORS.gray}
//           activeOutlineColor={COLORS.primary}
//           right={<TextInput.Icon name="clock-outline" />}
//           pointerEvents="none"
//         />
//       </Pressable>
//       <DateTimePickerModal
//         isVisible={isTimePickerVisible}
//         mode="time"
//         display="spinner"
//         onConfirm={handleConfirmTime}
//         onCancel={hideTimePicker}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 24,
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     marginBottom: 20,
//     color: COLORS.gray,
//   },
//   textInput: {
//     marginBottom: 20,
//     backgroundColor: COLORS.white,
//     height: 56, // Consistent height
//     justifyContent: 'center', // Align text vertically
//     fontSize: 16,
//   },
//   overlay: {
//     position: 'relative',
//   },
// });



// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import DatePicker from 'react-native-date-picker';
// import moment from 'moment';

// export default function Duration({ formData, setFormData, getCleanDate, getCleanTime, validateForm }) {
//   // State for date and time
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState(new Date());
//   const [datePickerOpen, setDatePickerOpen] = useState(false);
//   const [timePickerOpen, setTimePickerOpen] = useState(false);

//   // Display values
//   const [selectedDate, setSelectedDate] = useState(formData.cleaning_date || '');
//   const [selectedTime, setSelectedTime] = useState(formData.cleaning_time || '');

//   const modalProps = Platform.select({
//     android: {
//       style: {
//         margin: 0,
//         justifyContent: 'flex-end',
//       },
//       backdropColor: 'rgba(0, 0, 0, 0.5)',
//       animationIn: 'slideInUp',
//       animationOut: 'slideOutDown',
//       hideModalContentWhileAnimating: true,
//       useNativeDriver: true,
//     },
//     ios: {}
//   });

//   // Initialize with existing data
//   useEffect(() => {
//     if (formData.cleaning_date) {
//       const savedDate = new Date(formData.cleaning_date);
//       setDate(savedDate);
//       setSelectedDate(moment(savedDate).format("YYYY-MM-DD"));
//     }
//     if (formData.cleaning_time) {
//       const savedTime = moment(formData.cleaning_time, "HH:mm:ss").toDate();
//       setTime(savedTime);
//       setSelectedTime(moment(savedTime).format("HH:mm:ss"));
//     }
//   }, [formData]);

//   const calculateEndTime = (startTime, durationInMinutes) => {
//     return moment(startTime, "HH:mm:ss")
//       .add(durationInMinutes, "minutes")
//       .format("HH:mm:ss");
//   };

//   const handleConfirmDate = (selectedDate) => {
//     const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
//     setSelectedDate(formattedDate);
//     setDate(selectedDate);
//     setDatePickerOpen(false);
    
//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       cleaning_date: formattedDate,
//     }));
    
//     // Call parent functions
//     if (getCleanDate) getCleanDate(selectedDate);
//     if (validateForm) validateForm();
//   };

//   const handleConfirmTime = (selectedTime) => {
//     const formattedTime = selectedTime.toTimeString().split(' ')[0];
//     setSelectedTime(formattedTime);
//     setTime(selectedTime);
//     setTimePickerOpen(false);
    
//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       cleaning_time: formattedTime,
//       cleaning_end_time: calculateEndTime(formattedTime, prev.total_cleaning_time || 60),
//     }));
    
//     // Call parent functions
//     if (getCleanTime) getCleanTime(selectedTime);
//     if (validateForm) validateForm();
//   };

//   console.log("My formData", formData);

//   return (
//     <View>
//       <Text bold style={styles.title}>
//         Schedule Cleaning Time
//       </Text>
//       <Text style={styles.subtitle}>
//         Pick the date and time for cleaning
//       </Text>

//       {/* Date Picker */}
//       <Pressable onPress={() => setDatePickerOpen(true)}>
//         <TextInput
//           mode="outlined"
//           label="Cleaning Date"
//           value={selectedDate}
//           placeholder="Select Date"
//           editable={false}
//           style={styles.textInput}
//           outlineColor={COLORS.gray}
//           activeOutlineColor={COLORS.primary}
//           right={<TextInput.Icon name="calendar" />}
//           pointerEvents="none"
//         />
//       </Pressable>
      
//       <DatePicker
//         modal
//         open={datePickerOpen}  
//         date={date}
//         mode="date"
//         minimumDate={new Date()}
//         onConfirm={handleConfirmDate}
//         onCancel={() => setDatePickerOpen(false)}
//         theme="light"
//         textColor={COLORS.black}
//         modalProps={modalProps}
//         modalStyle={Platform.OS === 'android' ? {
//           backgroundColor: 'white',
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//           padding: 20,
//         } : {}}
//       />

//       {/* Time Picker */}
//       <Pressable onPress={() => setTimePickerOpen(true)}>
//         <TextInput
//           mode="outlined"
//           label="Cleaning Time"
//           value={selectedTime}
//           placeholder="Select Time"
//           editable={false}
//           style={styles.textInput}
//           outlineColor={COLORS.gray}
//           activeOutlineColor={COLORS.primary}
//           right={<TextInput.Icon name="clock-outline" />}
//           pointerEvents="none"
//         />
//       </Pressable>
      
//       <DatePicker
//         modal
//         open={timePickerOpen} 
//         date={time}
//         mode="time"
//         onConfirm={handleConfirmTime}
//         onCancel={() => setTimePickerOpen(false)}
//         theme="light"
//         textColor={COLORS.black}
//         modalProps={modalProps}
//         modalStyle={Platform.OS === 'android' ? {
//           backgroundColor: 'white',
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//           padding: 20,
//         } : {}}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 24,
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     marginBottom: 20,
//     color: COLORS.gray,
//   },
//   textInput: {
//     marginBottom: 20,
//     backgroundColor: COLORS.white,
//     height: 56,
//     justifyContent: 'center',
//     fontSize: 16,
//   },
// })



// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import DatePicker from 'react-native-date-picker';
// import moment from 'moment';

// export default function Duration({ formData, setFormData, getCleanDate, getCleanTime, validateForm }) {
//   // State for date and time
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState(new Date());
//   const [datePickerOpen, setDatePickerOpen] = useState(false);
//   const [timePickerOpen, setTimePickerOpen] = useState(false);

//   // Display values
//   const [selectedDate, setSelectedDate] = useState(formData.cleaning_date || '');
//   const [selectedTime, setSelectedTime] = useState(formData.cleaning_time || '');

//   const modalProps = Platform.select({
//     android: {
//       style: {
//         margin: 0,
//         justifyContent: 'flex-end',
//       },
//       backdropColor: 'rgba(0, 0, 0, 0.5)',
//       animationIn: 'slideInUp',
//       animationOut: 'slideOutDown',
//       hideModalContentWhileAnimating: true,
//       useNativeDriver: true,
//     },
//     ios: {}
//   });


//   // 🔥 FIXED: Memoize validation function
//   const validateFormData = useCallback(() => {
//     const { cleaning_date, cleaning_time } = formData;
    
//     if (!cleaning_date || !cleaning_time) {
//       return false;
//     }
    
//     // Check date format
//     let dateToCheck = cleaning_date;
//     if (typeof dateToCheck === 'string' && dateToCheck.includes('T')) {
//       dateToCheck = dateToCheck.split('T')[0];
//     }
    
//     // Validate date format (YYYY-MM-DD)
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (!dateRegex.test(dateToCheck)) {
//       return false;
//     }
    
//     // Validate time format (HH:mm:ss)
//     const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
//     if (!timeRegex.test(cleaning_time)) {
//       return false;
//     }
    
//     return true;
//   }, [formData]);

//   // 🔥 FIXED: Run validation only when needed
//   useEffect(() => {
//     const isValid = validateFormData();
//     if (validateForm) {
//       validateForm(isValid);
//     }
//   }, [validateFormData, validateForm]);



//   // Initialize with existing data - FIXED VERSION
//   useEffect(() => {
//     if (formData.cleaning_date) {
//       try {
//         // Check if it's an ISO string
//         if (typeof formData.cleaning_date === 'string' && formData.cleaning_date.includes('T')) {
//           // Extract just the date part from ISO string
//           const datePart = formData.cleaning_date.split('T')[0];
//           const savedDate = new Date(datePart);
//           if (!isNaN(savedDate)) {
//             setDate(savedDate);
//             setSelectedDate(datePart); // Use just the date part
//           }
//         } else {
//           // It might already be in YYYY-MM-DD format
//           const savedDate = new Date(formData.cleaning_date);
//           if (!isNaN(savedDate)) {
//             setDate(savedDate);
//             setSelectedDate(formData.cleaning_date);
//           }
//         }
//       } catch (error) {
//         console.error('Error parsing date:', error);
//       }
//     }
    
//     if (formData.cleaning_time) {
//       const savedTime = moment(formData.cleaning_time, "HH:mm:ss").toDate();
//       setTime(savedTime);
//       setSelectedTime(moment(savedTime).format("HH:mm:ss"));
//     }
//   }, [formData]);

//   const calculateEndTime = (startTime, durationInMinutes) => {
//     return moment(startTime, "HH:mm:ss")
//       .add(durationInMinutes, "minutes")
//       .format("HH:mm:ss");
//   };

//   const handleConfirmDate = (selectedDate) => {
//     // Format to YYYY-MM-DD
//     const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
//     alert(formattedDate)
//     setSelectedDate(formattedDate);
//     setDate(selectedDate);
//     setDatePickerOpen(false);
    
//     // Update form data - Make sure we're storing as string
//     setFormData(prev => ({
//       ...prev,
//       cleaning_date: formattedDate, // Store as YYYY-MM-DD string
//     }));
    
//     // Call parent functions
//     if (getCleanDate) getCleanDate(selectedDate);
//     if (validateForm) validateForm();
//   };

//   const handleConfirmTime = (selectedTime) => {
//     const formattedTime = selectedTime.toTimeString().split(' ')[0];
//     setSelectedTime(formattedTime);
//     setTime(selectedTime);
//     setTimePickerOpen(false);
    
//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       cleaning_time: formattedTime,
//       cleaning_end_time: calculateEndTime(formattedTime, prev.total_cleaning_time || 60),
//     }));
    
//     // Call parent functions
//     if (getCleanTime) getCleanTime(selectedTime);
//     if (validateForm) validateForm();
//   };

//   // Add a function to ensure date is properly formatted before sending to API
//   const getFormattedFormData = () => {
//     const formatted = { ...formData };
    
//     // Ensure cleaning_date is in YYYY-MM-DD format
//     if (formatted.cleaning_date) {
//       if (typeof formatted.cleaning_date === 'string' && formatted.cleaning_date.includes('T')) {
//         // Extract date part from ISO string
//         formatted.cleaning_date = formatted.cleaning_date.split('T')[0];
//       }
//     }
    
//     return formatted;
//   };

//   console.log("My formData", formData);
//   console.log("Formatted formData", getFormattedFormData());

//   return (
//     <View>
//       <Text bold style={styles.title}>
//         Schedule Cleaning Time
//       </Text>
//       <Text style={styles.subtitle}>
//         Pick the date and time for cleaning
//       </Text>

//       {/* Date Picker */}
//       <Pressable onPress={() => setDatePickerOpen(true)}>
//         <TextInput
//           mode="outlined"
//           label="Cleaning Date"
//           value={selectedDate}
//           placeholder="Select Date"
//           editable={false}
//           style={styles.textInput}
//           outlineColor={COLORS.gray}
//           activeOutlineColor={COLORS.primary}
//           right={<TextInput.Icon name="calendar" />}
//           pointerEvents="none"
//         />
//       </Pressable>
      
//       <DatePicker
//         modal
//         open={datePickerOpen}  
//         date={date}
//         mode="date"
//         minimumDate={new Date()}
//         onConfirm={handleConfirmDate}
//         onCancel={() => setDatePickerOpen(false)}
//         theme="light"
//         textColor={COLORS.black}
//         modalProps={modalProps}
//         modalStyle={Platform.OS === 'android' ? {
//           backgroundColor: 'white',
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//           padding: 20,
//         } : {}}
//       />

//       {/* Time Picker */}
//       <Pressable onPress={() => setTimePickerOpen(true)}>
//         <TextInput
//           mode="outlined"
//           label="Cleaning Time"
//           value={selectedTime}
//           placeholder="Select Time"
//           editable={false}
//           style={styles.textInput}
//           outlineColor={COLORS.gray}
//           activeOutlineColor={COLORS.primary}
//           right={<TextInput.Icon name="clock-outline" />}
//           pointerEvents="none"
//         />
//       </Pressable>
      
//       <DatePicker
//         modal
//         open={timePickerOpen} 
//         date={time}
//         mode="time"
//         onConfirm={handleConfirmTime}
//         onCancel={() => setTimePickerOpen(false)}
//         theme="light"
//         textColor={COLORS.black}
//         modalProps={modalProps}
//         modalStyle={Platform.OS === 'android' ? {
//           backgroundColor: 'white',
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//           padding: 20,
//         } : {}}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 24,
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     marginBottom: 20,
//     color: COLORS.gray,
//   },
//   textInput: {
//     marginBottom: 20,
//     backgroundColor: COLORS.white,
//     height: 56,
//     justifyContent: 'center',
//     fontSize: 16,
//   },
// });




import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import COLORS from '../../../constants/colors';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

export default function Duration({ formData, setFormData, getCleanDate, getCleanTime, validateForm }) {
  // State for date and time
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const modalProps = Platform.select({
    android: {
      style: {
        margin: 0,
        justifyContent: 'flex-end',
      },
      backdropColor: 'rgba(0, 0, 0, 0.5)',
      animationIn: 'slideInUp',
      animationOut: 'slideOutDown',
      hideModalContentWhileAnimating: true,
      useNativeDriver: true,
    },
    ios: {}
  });

  // 🔥 FIXED: Initialize date and time from formData with proper error handling
  useEffect(() => {
    console.log("Initializing Duration component with formData:", formData);
    
    if (formData.cleaning_date) {
      try {
        let dateToParse = formData.cleaning_date;
        console.log("Parsing cleaning_date:", dateToParse, "Type:", typeof dateToParse);
        
        // If it's in ISO format, extract date part
        if (typeof dateToParse === 'string' && dateToParse.includes('T')) {
          dateToParse = dateToParse.split('T')[0];
        }
        
        const parsedDate = new Date(dateToParse);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          console.log("Date parsed successfully:", parsedDate);
        } else {
          console.warn("Invalid date parsed:", dateToParse);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    
    if (formData.cleaning_time) {
      try {
        console.log("Parsing cleaning_time:", formData.cleaning_time, "Type:", typeof formData.cleaning_time);
        
        // Ensure it's a string before trying to split
        if (typeof formData.cleaning_time === 'string') {
          const timeParts = formData.cleaning_time.split(':');
          
          if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
            
            const timeDate = new Date();
            timeDate.setHours(hours, minutes, seconds);
            
            if (!isNaN(timeDate.getTime())) {
              setTime(timeDate);
              console.log("Time parsed successfully:", timeDate);
            } else {
              console.warn("Invalid time parsed:", formData.cleaning_time);
            }
          } else {
            console.warn("Time string doesn't have enough parts:", formData.cleaning_time);
          }
        } else {
          console.warn("cleaning_time is not a string, it's:", typeof formData.cleaning_time);
          // If it's a Date object, use it directly
          if (formData.cleaning_time instanceof Date) {
            setTime(formData.cleaning_time);
          }
        }
      } catch (error) {
        console.error('Error parsing time:', error);
      }
    }
  }, []); // Run only once on mount


  // useEffect(() => {
  //   console.log("Duration: Checking if property changed...", {
  //     hasAptId: !!formData.aptId,
  //     cleaning_date: formData.cleaning_date,
  //     cleaning_time: formData.cleaning_time
  //   });
    
  //   // If property has changed (aptId exists) but cleaning_date is empty,
  //   // we should reset the date display
  //   if (formData.aptId && (!formData.cleaning_date || !formData.cleaning_time)) {
  //     console.log("Duration: Property changed, resetting date/time display");
  //     setSelectedDate('');
  //     setSelectedTime('');
  //     setDate(new Date());
  //     setTime(new Date());
  //   }
  // }, [formData.aptId, formData.cleaning_date, formData.cleaning_time]);

  // 🔥 FIXED: Memoize validation function with proper type checking
  const validateCurrentStep = useCallback(() => {
    const { cleaning_date, cleaning_time } = formData;
    
    console.log("Validating step 2:", { 
      cleaning_date, 
      cleaning_time,
      dateType: typeof cleaning_date,
      timeType: typeof cleaning_time 
    });
    
    // Check if both fields exist
    if (!cleaning_date || !cleaning_time) {
      console.log("Missing date or time");
      return false;
    }
    
    // Validate date
    let dateToCheck = cleaning_date;
    if (typeof dateToCheck !== 'string') {
      // If it's a Date object, convert to string
      if (dateToCheck instanceof Date) {
        dateToCheck = moment(dateToCheck).format('YYYY-MM-DD');
      } else {
        // Try to convert to string
        dateToCheck = String(dateToCheck);
      }
    }
    
    // If it's in ISO format, extract date part
    if (dateToCheck.includes && dateToCheck.includes('T')) {
      dateToCheck = dateToCheck.split('T')[0];
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateToCheck)) {
      console.log("Invalid date format:", dateToCheck);
      return false;
    }
    
    // Validate time
    let timeToCheck = cleaning_time;
    if (typeof timeToCheck !== 'string') {
      // If it's a Date object, extract time
      if (timeToCheck instanceof Date) {
        timeToCheck = moment(timeToCheck).format('HH:mm:ss');
      } else {
        // Try to convert to string
        timeToCheck = String(timeToCheck);
      }
    }
    
    // Validate time format (HH:mm:ss)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(timeToCheck)) {
      console.log("Invalid time format:", timeToCheck);
      return false;
    }
    
    console.log("Step 2 validation passed!");
    return true;
  }, [formData.cleaning_date, formData.cleaning_time]);

  // 🔥 FIXED: Run validation when dependencies change
  useEffect(() => {
    const isFormValid = validateCurrentStep();
    console.log("Step 2 validation result:", isFormValid);
    if (validateForm) {
      validateForm(isFormValid);
    }
  }, [validateCurrentStep, validateForm]);

  const calculateEndTime = useCallback((startTime, durationInMinutes) => {
    return moment(startTime, "HH:mm:ss")
      .add(durationInMinutes, "minutes")
      .format("HH:mm:ss");
  }, []);

  // 🔥 FIXED: Handle date selection properly
  const handleConfirmDate = useCallback((selectedDate) => {
    // Format to YYYY-MM-DD
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    console.log("Selected date formatted:", formattedDate);
    
    setDate(selectedDate);
    setDatePickerOpen(false);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      cleaning_date: formattedDate, // Store as YYYY-MM-DD string
    }));
    
    // Call parent functions
    if (getCleanDate) getCleanDate(selectedDate);
  }, [setFormData, getCleanDate]);

  // 🔥 FIXED: Handle time selection properly
  const handleConfirmTime = useCallback((selectedTime) => {
    const formattedTime = moment(selectedTime).format('HH:mm:ss');
    console.log("Selected time formatted:", formattedTime);
    
    setTime(selectedTime);
    setTimePickerOpen(false);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      cleaning_time: formattedTime,
      cleaning_end_time: calculateEndTime(formattedTime, prev.total_cleaning_time || 60),
    }));
    
    // Call parent functions
    if (getCleanTime) getCleanTime(selectedTime);
  }, [setFormData, getCleanTime, calculateEndTime]);

  // 🔥 FIXED: Format display date for TextInput
  const formatDisplayDate = () => {
    if (!formData.cleaning_date) return '';
    
    try {
      let dateStr = formData.cleaning_date;
      
      // Handle different types
      if (typeof dateStr !== 'string') {
        if (dateStr instanceof Date) {
          dateStr = moment(dateStr).format('YYYY-MM-DD');
        } else {
          dateStr = String(dateStr);
        }
      }
      
      // If it's in ISO format, extract date part
      if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      
      return moment(dateStr).format('YYYY-MM-DD');
    } catch (error) {
      console.error('Error formatting display date:', error);
      return String(formData.cleaning_date);
    }
  };

  // 🔥 FIXED: Format display time for TextInput
  const formatDisplayTime = () => {
    if (!formData.cleaning_time) return '';
    
    try {
      let timeStr = formData.cleaning_time;
      
      // Handle different types
      if (typeof timeStr !== 'string') {
        if (timeStr instanceof Date) {
          timeStr = moment(timeStr).format('HH:mm:ss');
        } else {
          timeStr = String(timeStr);
        }
      }
      
      return timeStr;
    } catch (error) {
      console.error('Error formatting display time:', error);
      return String(formData.cleaning_time);
    }
  };

  console.log("Duration component state:", {
    date: date.toString(),
    time: time.toString(),
    formData: {
      cleaning_date: formData.cleaning_date,
      cleaning_time: formData.cleaning_time,
    },
    displayDate: formatDisplayDate(),
    displayTime: formatDisplayTime()
  });

  return (
    <View>
      <Text style={styles.title}>
        Schedule Cleaning Time
      </Text>
      <Text style={styles.subtitle}>
        Pick the date and time for cleaning
      </Text>

      {/* Date Picker */}
      <Pressable 
        onPress={() => setDatePickerOpen(true)}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
      >
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label="Cleaning Date *"
            value={formatDisplayDate()}
            placeholder="Select Date"
            editable={false}
            style={styles.textInput}
            outlineColor={formData.cleaning_date ? COLORS.primary : COLORS.gray}
            activeOutlineColor={COLORS.primary}
            right={<TextInput.Icon name="calendar" />}
          />
          {!formData.cleaning_date && (
            <Text style={styles.requiredText}>Required</Text>
          )}
        </View>
      </Pressable>
      
      <DatePicker
        modal
        open={datePickerOpen}  
        date={date}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerOpen(false)}
        theme="light"
        textColor={COLORS.black}
        modalProps={modalProps}
      />

      {/* Time Picker */}
      <Pressable 
        onPress={() => setTimePickerOpen(true)}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
      >
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label="Cleaning Time *"
            value={formatDisplayTime()}
            placeholder="Select Time"
            editable={false}
            style={styles.textInput}
            outlineColor={formData.cleaning_time ? COLORS.primary : COLORS.gray}
            activeOutlineColor={COLORS.primary}
            right={<TextInput.Icon name="clock-outline" />}
          />
          {!formData.cleaning_time && (
            <Text style={styles.requiredText}>Required</Text>
          )}
        </View>
      </Pressable>
      
      <DatePicker
        modal
        open={timePickerOpen} 
        date={time}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerOpen(false)}
        theme="light"
        textColor={COLORS.black}
        modalProps={modalProps}
      />

      {/* 🔥 NEW: Validation feedback */}
      <View style={styles.validationContainer}>
        {(!formData.cleaning_date || !formData.cleaning_time) ? (
          <Text style={styles.helperText}>
            Please select both date and time to continue
          </Text>
        ) : (
          <Text style={styles.successText}>
            ✓ Date and time selected
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: COLORS.gray,
  },
  textInput: {
    marginBottom: 5,
    backgroundColor: COLORS.white,
    height: 56,
    justifyContent: 'center',
    fontSize: 16,
  },
  pressable: {
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  requiredText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 12,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 10,
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
  },
  validationContainer: {
    minHeight: 30,
    justifyContent: 'center',
    marginTop: 10,
  },
});