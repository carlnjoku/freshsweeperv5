// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Switch,StatusBar, Alert, TouchableOpacity,Dimensions } from 'react-native';
// import COLORS from '../../constants/colors';
// import { TextInput } from 'react-native-paper';
// import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// import DatePicker from 'react-native-date-picker';

// import userService from '../../services/connection/userService';


// const Certification = ({userId,close_modal}) => {
    
//     const[inputs, setInputs] = useState({
//       userId:userId,
//       name:'',
//       institution_name:'',
//       credentialUrl:'',
//       startDate:new Date(),
//       endDate:new Date(),
//       expiryDate:new Date()

//     })
  
//     // const[startDate, setStartDate] = useState(new Date())
//     // const[endDate, setEndDate] = useState(new Date());
//     // const[expiryDate, setExpiryDate] = useState(new Date())
//     const[errors, setErrors] = useState({
//       name:'',
//       institution_name:'',
//     })
//     const[showStartDatePicker, setShowStartDatePicker] = useState(false);
//     const[showEndDatePicker, setShowEndDatePicker] = useState(false);
//     const[showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

//     // const formattedEndDate = endDate instanceof Date ? endDate.toDateString() : '';

//     // const handleEndDateChange = (event, selectedDate) => {
//     //   const currentDate = selectedDate || endDate;
//     //   setShowEndDatePicker(Platform.OS === 'ios'); // Close the picker for Android
//     //   setEndDate(currentDate);
//     // };

//     console.log(inputs)
//     const handleStartDateChange = (event, selectedDate) => {
//       const currentDate = selectedDate || startDate;
//       setShowStartDatePicker(false); // Close the picker
//       setInputs(prevState => ({...prevState, startDate: currentDate}));
//     };

//     const handleEndDateChange = (event, selectedDate) => {
//       const currentDate = selectedDate || endDate;
//       setShowEndDatePicker(false); // Close the picker
//       setInputs(prevState => ({...prevState, endDate: currentDate}));
//     };

//     const handleExpiryDateChange = (event, selectedDate) => {
//       const currentDate = selectedDate || expiryDate;
//       setShowExpiryDatePicker(false); // Close the picker
//       setInputs(prevState => ({...prevState, expiryDate: currentDate}));
//   };

//     const handleAChange = (text, input) => {
//         console.log(text)
//         setInputs(prevState => ({...prevState, [input]: text}));
//     }
//     const handleError = (error, input) => {
//       setErrors(prevState => ({...prevState, [input]: error}));
//     };

//     const onClose = () => {
//         close_modal(false)
//     }

//     const validate = async () => {
//       let isValid = true;
  
//       if (inputs.name === "") {
//           handleError(
//               <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
//                   Enter certification name
//               </Text>, 
//               'name'
//           );
//           isValid = false;
//       }
//       if (inputs.institution_name === "") {
//           handleError(
//               <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
//                   Enter certification institution name
//               </Text>, 
//               'institution_name'
//           );
//           isValid = false;
//       }
  
//       if (isValid) {
//           // Call the onSubmit function if the validation is successful
//           onSubmit();
//       }
//   };


//   const onSubmit = async()=> {
//     try {
   
//       await userService.updateCleanerCertification(inputs)
//       .then(response => {
//           const status = response.status
//           const res = response.data
//           console.log(status)
//           if(status===200){
//               console.log(res.message)
//               // setIsBeforeSave(false)
//               setResposeMessage(res.message)
//           }else{
//               Alert.alert("Oop! something went wrong, try again")
//           }
//       })
//     }catch(e){
//         Alert.alert("Oop! something went wrong, try again")
//     }
//   }





   
//     return (
      
//         <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//          {/* <StatusBar translucent backgroundColor="transparent" /> */}

//         <View style={styles.close_button}><MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} /></View>
        
//         <Text style={styles.heading}>Add Certification or License</Text>
       
        
      
        
//             <TextInput
//                 mode="outlined"
//                 label="Certification/ License Name"
//                 placeholder="Certification/ License Name"
//                 placeholderTextColor={COLORS.gray}
//                 outlineColor="#D8D8D8"
//                 // keyboardType="numeric"
//                 value={inputs.name}
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
//                 onChangeText={text => handleAChange(text, 'name')}
//                 onFocus={() => handleError(null, 'name')}
//                 error={errors.name}
                
//             />
//             {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

//             <TextInput
//                 mode="outlined"
//                 label="Institution Name"
//                 placeholder="Institution Name"
//                 placeholderTextColor={COLORS.gray}
//                 outlineColor="#D8D8D8"
//                 value={inputs.institution_name}
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
//                 onChangeText={text => handleAChange(text, 'institution_name')}
//                 onFocus={() => handleError(null, 'institution_name')}
//                 error={errors.institution_name}
                
//             />
//             {errors.institution_name && <Text style={styles.errorText}>{errors.institution_name}</Text>}
            
//             <View>
//               <TextInput
//                 mode="outlined"
//                 label="Select Start Date"
//                 value={inputs.startDate.toDateString()} // Display the formatted date
//                 onFocus={() => setShowStartDatePicker(true)} // Show the date picker when the TextInput is focused
//                 editable={false} // Make TextInput read-only
//                 outlineColor="#D8D8D8"
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
//                 // onFocus={() => handleError(null, 'name')}
//                 error={errors.startDate}
//                 right={
//                   <TextInput.Icon
//                     icon="calendar"
//                     onPress={() => setShowStartDatePicker(true)} // Show the date picker when the icon is pressed
//                     color={COLORS.light_gray}
//                   />
//                 }
//               />

//               {/* DateTimePicker for selecting a date */}
//               {showStartDatePicker && (
//                 <DatePicker
//                   value={inputs.startDate}
//                   mode="date"
//                   display="spinner"
//                   onChange={handleStartDateChange}
//                   style={{borderRadius:10}}
//                 />
//               )}
//             </View>
//             <View >
//               <TextInput
//                 mode="outlined"
//                 label="Select End Date"
//                 value={inputs.endDate.toDateString()} // Display the formatted date
//                 onFocus={() => setShowEndDatePicker(true)} // Show the date picker when the TextInput is focused
//                 editable={false} // Make TextInput read-only
//                 outlineColor="#D8D8D8"
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
//                 // onFocus={() => handleError(null, 'name')}
//                 error={errors.endDate}
//                 right={
//                   <TextInput.Icon
//                     icon="calendar"
//                     onPress={() => setShowEndDatePicker(true)} // Show the date picker when the icon is pressed
//                     color={COLORS.light_gray}
//                   />
//                 }
//               />

//               {/* DateTimePicker for selecting a date */}
//               {showEndDatePicker && (
//                 <View style={styles.dateTimePickerContainer}>
//                   <DateTimePicker
//                     value={inputs.endDate}
//                     mode="date"
//                     display="spinner"
//                     onChange={handleEndDateChange}
//                     style={{borderRadius:10}}
//                   />
//                 </View>
//               )}
//             </View>
//             <View>
//               <TextInput
//                 mode="outlined"
//                 label="Select Expiry Date"
//                 value={inputs.expiryDate.toDateString()} // Display the formatted date
//                 onFocus={() => setShowExpiryDatePicker(true)} // Show the date picker when the TextInput is focused
//                 editable={false} // Make TextInput read-only
//                 outlineColor="#D8D8D8"
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
               
//                 // onFocus={() => handleError(null, 'name')}
//                 error={errors.expiryDate}
//                 right={
//                   <TextInput.Icon
//                     icon="calendar"
//                     onPress={() => setShowExpiryDatePicker(true)} // Show the date picker when the icon is pressed
//                     color={COLORS.light_gray}
//                   />
//                 }
//               />

//               {/* DateTimePicker for selecting a date */}
//               {showExpiryDatePicker && (
//                 <DateTimePicker
//                   value={inputs.expiryDate}
//                   mode="date"
//                   display="spinner"
//                   onChange={handleExpiryDateChange}
//                   style={{borderRadius:10}}
//                 />
//               )}
//             </View>
            
//             <TextInput
//                 mode="outlined"
//                 label="Credential Url"
//                 placeholder="Credential Url"
//                 placeholderTextColor={COLORS.gray}
//                 outlineColor="#D8D8D8"
//                 autoCapitalize="none"
//                 value={inputs.credentialUrl}
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
//                 onChangeText={text => handleAChange(text, 'credentialUrl')}
//                 // onFocus={() => handleError(null, 'credentialUrl')}
//                 error={errors.credentialUrl}
                
//             />
            


//             <TouchableOpacity 
//               onPress={validate}
//               style={styles.button} 
//             >
              
//               <Text onPress={onClose} bold style={styles.button_text}> Confirm</Text>
//             </TouchableOpacity>
              
//         </View>
//     </View>
//     );
// };
// const windowHeight = Dimensions.get('window').height;
// const modalHeight = windowHeight * 1;

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor:COLORS.backgroundColor,
//       padding:20,
//       justifyContent: 'center',
//     alignItems: 'center',
//     },
//     heading: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 20,
//       },
//       detailsContainer: {
//         marginBottom: 20,
//       },
//       label: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 5,
//       },
//       details: {
//         fontSize: 16,
//       },
//       button: {
//         flexDirection:'row',
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         marginVertical:20,
//         justifyContent:'center',
//         backgroundColor: COLORS.primary,
//         borderRadius:50
//       },
//       button_text:{
//         color:COLORS.white
//       },
//       modalContainer: {
//         flex: 1,
//         marginTop:30
//         // justifyContent: 'flex-end',
//         // alignItems: 'center',
//         // backgroundColor: 'rgba(0, 0, 0, 0.1)', // semi-transparent background
//       },
//       modalContent: {
//         backgroundColor: 'white',
//         padding: 20,
//         // borderRadius: 10,
//         borderTopRightRadius:10,
//         borderTopLeftRadius:10,
//         elevation: 5,
//         height: '100%', // Set the height of the modal
//         width: '100%',
//       },
//       close_button:{
//         alignItems:'flex-end'
//       },
//       dateTimePickerContainer: {
//         borderRadius: 10, // Customize border radius here
//         overflow: 'hidden', // Clip the DateTimePicker within the View
//         // Add other styles such as border width, color, etc.
//     },
//     errorText: {
//       color: 'red',
//       fontSize: 12,
//       marginBottom: 10,
//   },
// })

// export default Certification;



// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Switch, StatusBar, Alert, TouchableOpacity, Dimensions } from 'react-native';
// import COLORS from '../../constants/colors';
// import { TextInput } from 'react-native-paper';
// import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import DatePicker from 'react-native-date-picker'; // only one import
// import userService from '../../services/connection/userService';

// const Certification = ({ userId, certification, close_modal }) => {
//   // const [inputs, setInputs] = useState({
//   //   userId: userId,
//   //   name: '',
//   //   institution_name: '',
//   //   credentialUrl: '',
//   //   startDate: new Date(),
//   //   endDate: new Date(),
//   //   expiryDate: new Date(),
//   // });

//   const [inputs, setInputs] = useState({
//     userId: userId,
//     name: certification?.name || '',
//     institution_name: certification?.institution_name || '',
//     credentialUrl: certification?.credentialUrl || '',
//     startDate: certification?.startDate ? new Date(certification.startDate) : new Date(),
//     endDate: certification?.endDate ? new Date(certification.endDate) : new Date(),
//     expiryDate: certification?.expiryDate ? new Date(certification.expiryDate) : new Date(),
//   });

//   const [errors, setErrors] = useState({
//     name: '',
//     institution_name: '',
//   });

//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker] = useState(false);
//   const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

//   const handleAChange = (text, input) => {
//     setInputs(prevState => ({ ...prevState, [input]: text }));
//   };

//   const handleError = (error, input) => {
//     setErrors(prevState => ({ ...prevState, [input]: error }));
//   };

//   const onClose = () => {
//     close_modal(false);
//   };

//   const validate = async () => {
//     let isValid = true;

//     if (inputs.name === "") {
//       handleError(
//         <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
//           Enter certification name
//         </Text>,
//         'name'
//       );
//       isValid = false;
//     }
//     if (inputs.institution_name === "") {
//       handleError(
//         <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
//           Enter certification institution name
//         </Text>,
//         'institution_name'
//       );
//       isValid = false;
//     }

//     if (isValid) {
//       onSubmit();
//     }
//   };

//   const onSubmit = async () => {
//     try {
//       const response = await userService.updateCleanerCertification(inputs);
//       if (response.status === 200) {
//         Alert.alert('Success', response.data.message);
//         onClose();
//       } else {
//         Alert.alert('Oops! Something went wrong, try again');
//       }
//     } catch (e) {
//       Alert.alert('Oops! Something went wrong, try again');
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       <View style={styles.modalContent}>
//         <View style={styles.close_button}>
//           <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />
//         </View>

//         <Text style={styles.heading}>Add Certification or License</Text>

//         <TextInput
//           mode="outlined"
//           label="Certification/ License Name"
//           placeholder="Certification/ License Name"
//           placeholderTextColor={COLORS.gray}
//           outlineColor="#D8D8D8"
//           value={inputs.name}
//           activeOutlineColor={COLORS.primary}
//           style={{ marginBottom: 10, color: COLORS.gray, fontSize: 16, backgroundColor: "#fff" }}
//           onChangeText={text => handleAChange(text, 'name')}
//           onFocus={() => handleError(null, 'name')}
//           error={errors.name}
//         />
//         {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

//         <TextInput
//           mode="outlined"
//           label="Institution Name"
//           placeholder="Institution Name"
//           placeholderTextColor={COLORS.gray}
//           outlineColor="#D8D8D8"
//           value={inputs.institution_name}
//           activeOutlineColor={COLORS.primary}
//           style={{ marginBottom: 10, color: COLORS.gray, fontSize: 16, backgroundColor: "#fff" }}
//           onChangeText={text => handleAChange(text, 'institution_name')}
//           onFocus={() => handleError(null, 'institution_name')}
//           error={errors.institution_name}
//         />
//         {errors.institution_name && <Text style={styles.errorText}>{errors.institution_name}</Text>}

//         {/* Start Date Picker */}
//         <View>
//           <TextInput
//             mode="outlined"
//             label="Select Start Date"
//             value={inputs.startDate.toDateString()}
//             onFocus={() => setShowStartDatePicker(true)}
//             editable={false}
//             outlineColor="#D8D8D8"
//             activeOutlineColor={COLORS.primary}
//             style={{ marginBottom: 10, color: COLORS.gray, fontSize: 16, backgroundColor: "#fff" }}
//             right={
//               <TextInput.Icon
//                 icon="calendar"
//                 onPress={() => setShowStartDatePicker(true)}
//                 color={COLORS.light_gray}
//               />
//             }
//           />
//           <DatePicker
//             modal
//             open={showStartDatePicker}
//             date={inputs.startDate}
//             mode="date"
//             onConfirm={(date) => {
//               setShowStartDatePicker(false);
//               setInputs(prev => ({ ...prev, startDate: date }));
//             }}
//             onCancel={() => setShowStartDatePicker(false)}
//           />
//         </View>

//         {/* End Date Picker */}
//         <View>
//           <TextInput
//             mode="outlined"
//             label="Select End Date"
//             value={inputs.endDate.toDateString()}
//             onFocus={() => setShowEndDatePicker(true)}
//             editable={false}
//             outlineColor="#D8D8D8"
//             activeOutlineColor={COLORS.primary}
//             style={{ marginBottom: 10, color: COLORS.gray, fontSize: 16, backgroundColor: "#fff" }}
//             right={
//               <TextInput.Icon
//                 icon="calendar"
//                 onPress={() => setShowEndDatePicker(true)}
//                 color={COLORS.light_gray}
//               />
//             }
//           />
//           <DatePicker
//             modal
//             open={showEndDatePicker}
//             date={inputs.endDate}
//             mode="date"
//             onConfirm={(date) => {
//               setShowEndDatePicker(false);
//               setInputs(prev => ({ ...prev, endDate: date }));
//             }}
//             onCancel={() => setShowEndDatePicker(false)}
//           />
//         </View>

//         {/* Expiry Date Picker */}
//         <View>
//           <TextInput
//             mode="outlined"
//             label="Select Expiry Date"
//             value={inputs.expiryDate.toDateString()}
//             onFocus={() => setShowExpiryDatePicker(true)}
//             editable={false}
//             outlineColor="#D8D8D8"
//             activeOutlineColor={COLORS.primary}
//             style={{ marginBottom: 10, color: COLORS.gray, fontSize: 16, backgroundColor: "#fff" }}
//             right={
//               <TextInput.Icon
//                 icon="calendar"
//                 onPress={() => setShowExpiryDatePicker(true)}
//                 color={COLORS.light_gray}
//               />
//             }
//           />
//           <DatePicker
//             modal
//             open={showExpiryDatePicker}
//             date={inputs.expiryDate}
//             mode="date"
//             onConfirm={(date) => {
//               setShowExpiryDatePicker(false);
//               setInputs(prev => ({ ...prev, expiryDate: date }));
//             }}
//             onCancel={() => setShowExpiryDatePicker(false)}
//           />
//         </View>

//         <TextInput
//           mode="outlined"
//           label="Credential Url"
//           placeholder="Credential Url"
//           placeholderTextColor={COLORS.gray}
//           outlineColor="#D8D8D8"
//           autoCapitalize="none"
//           value={inputs.credentialUrl}
//           activeOutlineColor={COLORS.primary}
//           style={{ marginBottom: 10, color: COLORS.gray, fontSize: 16, backgroundColor: "#fff" }}
//           onChangeText={text => handleAChange(text, 'credentialUrl')}
//         />

//         <TouchableOpacity onPress={validate} style={styles.button}>
//           <Text style={styles.button_text}>Confirm</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const windowHeight = Dimensions.get('window').height;
// const modalHeight = windowHeight * 1;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.backgroundColor,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   detailsContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   details: {
//     fontSize: 16,
//   },
//   button: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     marginVertical: 20,
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     borderRadius: 50,
//   },
//   button_text: {
//     color: COLORS.white,
//   },
//   modalContainer: {
//     flex: 1,
//     marginTop: 30,
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderTopRightRadius: 10,
//     borderTopLeftRadius: 10,
//     elevation: 5,
//     height: '100%',
//     width: '100%',
//   },
//   close_button: {
//     alignItems: 'flex-end',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 10,
//   },
// });

// export default Certification;



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import COLORS from '../../constants/colors';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe'; // added import

const Certification = ({ userId, certification, close_modal, onUpdate }) => {
  const [inputs, setInputs] = useState({
    userId: userId,
    name: certification?.name || '',
    institution_name: certification?.institution_name || '',
    credentialUrl: certification?.credentialUrl || '',
    startDate: certification?.startDate ? new Date(certification.startDate) : new Date(),
    endDate: certification?.endDate ? new Date(certification.endDate) : new Date(),
    expiryDate: certification?.expiryDate ? new Date(certification.expiryDate) : new Date(),
    _id: certification?._id,
  });

  const [errors, setErrors] = useState({ name: '', institution_name: '' });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  const handleAChange = (text, input) => {
    setInputs(prev => ({ ...prev, [input]: text }));
  };

  const handleError = (error, input) => {
    setErrors(prev => ({ ...prev, [input]: error }));
  };

  const onClose = () => close_modal(false);

  const validate = () => {
    let isValid = true;
    if (!inputs.name) {
      handleError(tSafe('enter_certification_name', 'Enter certification name'), 'name');
      isValid = false;
    }
    if (!inputs.institution_name) {
      handleError(tSafe('enter_institution_name', 'Enter institution name'), 'institution_name');
      isValid = false;
    }
    if (isValid) onSubmit();
  };

  const onSubmit = async () => {
    try {
      const payload = {
        ...inputs,
        startDate: inputs.startDate.toISOString(),
        endDate: inputs.endDate.toISOString(),
        expiryDate: inputs.expiryDate.toISOString(),
      };
      const response = await userService.updateCleanerCertification(payload);
      if (response.status === 200) {
        Alert.alert(tSafe('success_title', 'Success'), response.data.message);
        if (onUpdate) onUpdate(response.data.certification || payload);
        onClose();
      } else {
        Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
      }
    } catch (e) {
      Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <View style={styles.close_button}>
                <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />
              </View>

              <Text style={styles.heading}>
                {certification
                  ? tSafe('edit_certification', 'Edit Certification')
                  : tSafe('add_certification', 'Add Certification')}
              </Text>

              <TextInput
                mode="outlined"
                label={tSafe('certification_name_label', 'Certification/ License Name')}
                placeholder={tSafe('certification_name_placeholder', 'Certification/ License Name')}
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                value={inputs.name}
                activeOutlineColor={COLORS.primary}
                style={{ marginBottom: 10, fontSize: 16, backgroundColor: "#fff" }}
                onChangeText={text => handleAChange(text, 'name')}
                onFocus={() => handleError(null, 'name')}
                error={!!errors.name}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <TextInput
                mode="outlined"
                label={tSafe('institution_name_label', 'Institution Name')}
                placeholder={tSafe('institution_name_placeholder', 'Institution Name')}
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                value={inputs.institution_name}
                activeOutlineColor={COLORS.primary}
                style={{ marginBottom: 10, fontSize: 16, backgroundColor: "#fff" }}
                onChangeText={text => handleAChange(text, 'institution_name')}
                onFocus={() => handleError(null, 'institution_name')}
                error={!!errors.institution_name}
              />
              {errors.institution_name && <Text style={styles.errorText}>{errors.institution_name}</Text>}

              {/* Start Date */}
              <View>
                <TextInput
                  mode="outlined"
                  label={tSafe('start_date_label', 'Start Date')}
                  value={inputs.startDate.toDateString()}
                  onFocus={() => setShowStartDatePicker(true)}
                  editable={false}
                  outlineColor="#D8D8D8"
                  activeOutlineColor={COLORS.primary}
                  style={{ marginBottom: 10, fontSize: 16, backgroundColor: "#fff" }}
                  right={<TextInput.Icon icon="calendar" onPress={() => setShowStartDatePicker(true)} />}
                />
                <DatePicker
                  modal
                  open={showStartDatePicker}
                  date={inputs.startDate}
                  mode="date"
                  onConfirm={(date) => {
                    setShowStartDatePicker(false);
                    setInputs(prev => ({ ...prev, startDate: date }));
                  }}
                  onCancel={() => setShowStartDatePicker(false)}
                  title={tSafe('select_start_date', 'Select Start Date')}
                  confirmText={tSafe('done', 'Done')}
                  cancelText={tSafe('cancel', 'Cancel')}
                />
              </View>

              {/* End Date */}
              <View>
                <TextInput
                  mode="outlined"
                  label={tSafe('end_date_label', 'End Date')}
                  value={inputs.endDate.toDateString()}
                  onFocus={() => setShowEndDatePicker(true)}
                  editable={false}
                  outlineColor="#D8D8D8"
                  activeOutlineColor={COLORS.primary}
                  style={{ marginBottom: 10, fontSize: 16, backgroundColor: "#fff" }}
                  right={<TextInput.Icon icon="calendar" onPress={() => setShowEndDatePicker(true)} />}
                />
                <DatePicker
                  modal
                  open={showEndDatePicker}
                  date={inputs.endDate}
                  mode="date"
                  onConfirm={(date) => {
                    setShowEndDatePicker(false);
                    setInputs(prev => ({ ...prev, endDate: date }));
                  }}
                  onCancel={() => setShowEndDatePicker(false)}
                  title={tSafe('select_end_date', 'Select End Date')}
                  confirmText={tSafe('done', 'Done')}
                  cancelText={tSafe('cancel', 'Cancel')}
                />
              </View>

              {/* Expiry Date */}
              <View>
                <TextInput
                  mode="outlined"
                  label={tSafe('expiry_date_label', 'Expiry Date')}
                  value={inputs.expiryDate.toDateString()}
                  onFocus={() => setShowExpiryDatePicker(true)}
                  editable={false}
                  outlineColor="#D8D8D8"
                  activeOutlineColor={COLORS.primary}
                  style={{ marginBottom: 10, fontSize: 16, backgroundColor: "#fff" }}
                  right={<TextInput.Icon icon="calendar" onPress={() => setShowExpiryDatePicker(true)} />}
                />
                <DatePicker
                  modal
                  open={showExpiryDatePicker}
                  date={inputs.expiryDate}
                  mode="date"
                  onConfirm={(date) => {
                    setShowExpiryDatePicker(false);
                    setInputs(prev => ({ ...prev, expiryDate: date }));
                  }}
                  onCancel={() => setShowExpiryDatePicker(false)}
                  title={tSafe('select_expiry_date', 'Select Expiry Date')}
                  confirmText={tSafe('done', 'Done')}
                  cancelText={tSafe('cancel', 'Cancel')}
                />
              </View>

              <TextInput
                mode="outlined"
                label={tSafe('credential_url_label', 'Credential URL')}
                placeholder={tSafe('credential_url_placeholder', 'https://...')}
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                autoCapitalize="none"
                value={inputs.credentialUrl}
                activeOutlineColor={COLORS.primary}
                style={{ marginBottom: 10, fontSize: 16, backgroundColor: "#fff" }}
                onChangeText={text => handleAChange(text, 'credentialUrl')}
              />

              <TouchableOpacity onPress={validate} style={styles.button}>
                <Text style={styles.button_text}>{tSafe('confirm', 'Confirm')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    elevation: 5,
    maxHeight: windowHeight * 0.9,
  },
  close_button: {
    alignItems: 'flex-end',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 20,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 50,
  },
  button_text: {
    color: COLORS.white,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default Certification;