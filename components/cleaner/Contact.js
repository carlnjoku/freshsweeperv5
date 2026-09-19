// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Switch, StatusBar, TouchableOpacity, Dimensions, Alert } from 'react-native';
// import COLORS from '../../constants/colors';
// import { TextInput } from 'react-native-paper';
// import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import GoogleAutocomplete from '../shared/GooglePlacesAutocomplete';
// import userService from '../../services/connection/userService';

// const Contact = ({ contact, userId, close_modal }) => {
//     // State variables for input values and errors
//     const [inputs, setInputs] = useState({
//         address: '',
//         phone: '',
//         ssn: '',
//         longitude:'',
//         latitude:'',
//         cityLong:'',
//         cityShort:'',
//         stateLong:'',
//         stateShort:'',
//         countryLong:'',
//         countryShort:'',
//         postalCode:'',
//         userId:userId
//     });

//     const[initialInputs, setInitialInputs] = useState(contact); // Initial values for comparison
//     // const[errors, setErrors] = useState({});
//     const[errors, setErrors] = useState({
//         address:'',
//         phone: '',
//         ssn: '',
//     });
//     const[isBeforeSave, setIsBeforeSave] = useState(true)
//     const[responseMessage, setResposeMessage] = useState("")

//     // Set initial inputs when the modal is opened
//     useEffect(() => {
//         setInitialInputs(contact);
//         // console.log(inputs)
//     }, [inputs]);


//     // Format functions for phone number and SSN
//     const formatPhoneNumber = (input) => {
//         const cleaned = ('' + input).replace(/\D/g, '');
//         const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//         if (match) {
//             return `(${match[1]}) ${match[2]}-${match[3]}`;
//         }
//         return input;
//     };

//     const formatAndMaskSSN = (input) => {
//         // Remove any non-digit characters
//         const cleaned = ('' + input).replace(/\D/g, '');
//         // Match the SSN pattern (XXX-XX-XXXX)
//         const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
//         if (match) {
//             // Mask the SSN, showing only the last four digits
//             return `***-**-${match[3]}`;
//         }
//         // If the input doesn't match the SSN pattern, return it unformatted
//         return input;
//     };

//     // Handle input changes
//     const handleInputChange = (text, input) => {
//         setInputs(prevState => ({ ...prevState, [input]: formatPhoneNumber(text) }));
//     };

//     // const handleSSNChange = (text, input) => {
//     //     setInputs(prevState => ({ ...prevState, [input]: formatAndMaskSSN(text) }));
//     // };

//     // Handle SSN change and masking
//     const handleSSNChange = (text) => {
//         // Remove any non-digit characters
//         const cleaned = text.replace(/\D/g, '');

//         // Match the SSN pattern (XXX-XX-XXXX)
//         const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);

//         if (match) {
//             // Mask the SSN, showing only the last four digits
//             setInputs(prevState => ({ ...prevState, ssn: `***-**-${match[3]}` }));
//         } else {
//             // Allow user to input text
//             setInputs(prevState => ({ ...prevState, ssn: text }));
//         }
//     };

//     const handleChange = (text, input) => {
//         setInputs(prevState => ({ ...prevState, [input]: text }));
//     };

//     const handleSelectedAddress = async (e) => {
//         try {
//             // console.log(e)
//             const { 
//                 latitude, 
//                 longitude, 
//                 cityLong,
//                 cityShort,
//                 stateLong,
//                 stateShort,
//                 countryLong,
//                 countryShort,
//                 postalCode,
//             } = await geocodeAddress(e);
//             // setLatitude(latitude);
//             // setLongitude(longitude);
//             setInputs(prevState => ({ ...prevState, latitude: latitude }));
//             setInputs(prevState => ({ ...prevState, longitude: longitude }));
//             setInputs(prevState => ({ ...prevState, cityShort: cityShort }));
//             setInputs(prevState => ({ ...prevState, cityLong: cityLong }));
//             setInputs(prevState => ({ ...prevState, stateLong: stateLong }));
//             setInputs(prevState => ({ ...prevState, stateShort: stateShort }));
//             setInputs(prevState => ({ ...prevState, countryLong: countryLong }));
//             setInputs(prevState => ({ ...prevState, countryShort: countryShort }));
//             setInputs(prevState => ({ ...prevState, postalCode: postalCode }));
//             setInputs(prevState => ({ ...prevState, address: e }));
//         } catch (error) {
//             alert('Error', 'Failed to geocode address');
//         }
//     };

//     // Handle closing the modal
//     const handleCloseModal = () => {
//         // Use JSON.stringify for deep comparison
//         const hasUnsavedChanges = JSON.stringify(inputs) !== JSON.stringify(initialInputs);
        
//         if (hasUnsavedChanges) {
//             // Prompt the user with a confirmation alert
//             Alert.alert(
//                 'Unsaved Changes',
//                 'You have unsaved changes. Are you sure you want to discard them?',
//                 [
//                     {
//                         text: 'Cancel',
//                         style: 'cancel',
//                         onPress: () => {
//                             // Do nothing and keep the modal open
//                         }
//                     },
//                     {
//                         text: 'Discard',
//                         onPress: () => {
//                             // Discard changes and close the modal
//                             // setInputs(initialInputs);
//                             close_modal(false);
//                         }
//                     },
                    
//                 ]
//             );
//         } else {
//             // No unsaved changes, close the modal directly
//             close_modal(false);
//         }
//     };
    

    

//     const handleError = (error, input) => {
//         setErrors(prevState => ({...prevState, [input]: error}));
//       };


//     const validate = async () => {
//         let isValid = true;

//         // Validate address
//         // if (inputs.address === "") {
//         //     handleError(
//         //         <Text style={{ color: "red", fontSize: 12, marginTop: -5 }}>
//         //             Please enter the apartment name
//         //         </Text>, 
//         //         'address'
//         //     );
//         //     isValid = false;
//         // }
    
//         // Validate phone number
//         const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/; // Matches (123) 456-7890
//         if (inputs.phone === "") {
//             handleError(<Text style={{ color: "red", opacity: 0.6, marginTop: -35 }}>Enter a phone number</Text>, 'phone');
//             isValid = false;
//         } else if (!phonePattern.test(inputs.phone)) {
//             handleError(<Text style={{ color: "red", opacity: 0.6 }}>Invalid phone number format (e.g., (123) 456-7890)</Text>, 'phone');
//             isValid = false;
//         }
    
//         // // Validate SSN
        
//         // const ssnPattern = /^\*\*\*-**-\d{4}$/; // Matches 123-45-6789
//         // if (inputs.ssn === "") {
//         //     handleError(<Text style={{ color: "red", opacity: 0.6 }}>Please enter your Social Security Number</Text>, 'ssn');
//         //     isValid = false;
//         // } else if (!ssnPattern.test(inputs.ssn)) {
//         //     handleError(<Text style={{ color: "red", opacity: 0.6 }}>Invalid Social Security Number formated (e.g., 123-45-6789)</Text>, 'ssn');
//         //     isValid = false;
//         // }

        
//         if (isValid) {
//             // Call the onSubmit function if the validation is successful
//             onSubmit();
//         }
//     };
    

//     const onSubmit = async()=> {
//         try {
//         // alert(userId)
//         const data = {
//             userId:userId,
//             address:inputs.address,
//             phone:inputs.phone,
//             ssn:inputs.ssn,
//             latitude:inputs.latitude,
//             longitude:inputs.longitude,
//             cityLong:inputs.cityLong,
//             cityShort:inputs.cityShort,
//             stateLong:inputs.stateLong,
//             stateShort:inputs.stateShort,
//             countryLong:inputs.countryLong,
//             countryShort:inputs.countryShort,
//             postalCode:inputs.postalCode,
//         }
//         await userService.updateCleanerContact(data)
//         .then(response => {
//             const status = response.status
//             const res = response.data
//             // console.log(status)
//             if(status===200){
//                 // console.log(res.message)
//                 setIsBeforeSave(false)
//                 setResposeMessage(res.message)
//             }else{
//                 Alert.alert("Oop! something went wrong, try again")
//             }
//         })
//      }catch(e){
//         Alert.alert("Oop! something went wrong, try again")
//      }
//     }

//     const onClose = () => {
//         close_modal(false)
//     }

//     return (
//         <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//                 {/* <StatusBar translucent backgroundColor="transparent" /> */}

//                 <View style={styles.close_button}>
//                     {isBeforeSave && <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={handleCloseModal} />}
//                     {!isBeforeSave && <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />}
//                 </View>

//                 {isBeforeSave && 
//                     <View>
//                         <Text style={styles.heading}>Edit Your Contact Info</Text>

//                         {/* Address input with Google Autocomplete */}
//                         <GoogleAutocomplete
//                             label="Address"
//                             apiKey={GOOGLE_MAPS_API_KEY}
//                             selected_address={handleSelectedAddress}
//                             handleError={handleError}
//                         />

//                         {/* Mobile phone input */}
//                         <TextInput
//                             label="Mobile Phone"
//                             placeholder="Mobile Phone"
//                             mode="outlined"
//                             outlineColor="#D8D8D8"
//                             activeOutlineColor={COLORS.primary}
//                             value={inputs.phone}
//                             onChangeText={text => handleInputChange(text, 'phone')}
//                             keyboardType="phone-pad"
//                             style={{ marginBottom: 10, fontSize: 14, width: '100%', backgroundColor: '#fff' }}
//                             onFocus={() => handleError(null, 'phone')}
//                             error={errors.phone}
//                         />
//                         {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

//                         {/* Social Security Number (SSN) input */}
//                         {/* <TextInput
//                             mode="outlined"
//                             label="Social Security #"
//                             placeholder="Social Security #"
//                             placeholderTextColor={COLORS.gray}
//                             outlineColor="#D8D8D8"
//                             value={inputs.ssn}
//                             activeOutlineColor={COLORS.primary}
//                             style={{ marginBottom: 10, color: COLORS.gray, fontSize: 14, backgroundColor: "#fff" }}
//                             onChangeText={text => handleSSNChange(text, 'ssn')}
//                             onFocus={() => handleError(null, 'ssn')}
//                             keyboardType="phone-pad"
//                             error={errors.ssn}
//                         />
//                         {errors.ssn && <Text style={styles.errorText}>{errors.ssn}</Text>} */}

//                         {/* Save button */}
//                         <TouchableOpacity style={styles.button} onPress={() => validate()}>
//                             <Text bold style={styles.button_text}> Save</Text>
//                         </TouchableOpacity>
//                     </View>
//                 }

//                 {!isBeforeSave &&
//                     <View style={styles.success_response}>
//                         <MaterialCommunityIcons name="check-circle" size={56} color="green" />
//                         <Text style={{fontSize:19, fontWeight:'500', textAlign:'center'}}>{responseMessage}</Text>
//                         <TouchableOpacity style={styles.button}>
//                             <Text bold style={styles.button_text} onPress={onClose}> Continue</Text>
//                         </TouchableOpacity>
//                     </View>
//                 }

                
//             </View>
//         </View>
//     );
// };

// const windowHeight = Dimensions.get('window').height;
// const modalHeight = windowHeight * 1.0;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.backgroundColor,
//         padding: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     heading: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 20,
//     },
//     detailsContainer: {
//         marginBottom: 20,
//     },
//     label: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     details: {
//         fontSize: 16,
//     },
//     button: {
//         flexDirection: 'row',
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         marginVertical: 20,
//         justifyContent: 'center',
//         backgroundColor: COLORS.primary,
//         borderRadius: 50
//     },
//     button_text: {
//         color: COLORS.white,
//         fontSize: 16,
//         fontWeight: '500'
//     },
//     modalContainer: {
//         flex: 1,
//         marginTop:30
//     },
//     modalContent: {
//         backgroundColor: 'white',
//         padding: 20,
//         borderTopRightRadius: 10,
//         borderTopLeftRadius: 10,
//         elevation: 5,
//         height: modalHeight,
//         width: '100%',
//     },
//     close_button: {
//         alignItems: 'flex-end'
//     },
//     success_response:{
//         flex: 1,
//         backgroundColor: COLORS.white,
//         padding: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     errorText: {
//         color: 'red',
//         fontSize: 12,
//         marginBottom: 10,
//     },
// });

// export default Contact;








// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
// import COLORS from '../../constants/colors';
// import { TextInput, Icon } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// // import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import GoogleAutocomplete from '../shared/GooglePlacesAutocomplete';
// import AddressInput from '../shared/AddressInput';          // adjust path as needed
// import useLocationPermission from '../../components/shared/UseLocationPermission';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe'; // added import
// import { GOOGLE_MAPS_API_KEY } from '../../env';

// const Contact = ({ contact, userId, close_modal }) => {
//   // Address manual entry states
//   const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
//   const [autocompleteError, setAutocompleteError] = useState(null);
//   const [coordinates, setCoordinates] = useState(null);
//   const { hasPermission } = useLocationPermission();
//   // const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;


//   // Inputs state (includes address and location)
//   const [inputs, setInputs] = useState({
//     address: '',
//     phone: '',
//     ssn: '',
//     longitude: '',
//     latitude: '',
//     cityLong: '',
//     cityShort: '',
//     stateLong: '',
//     stateShort: '',
//     countryLong: '',
//     countryShort: '',
//     postalCode: '',
//     userId: userId,
//   });

//   const [initialInputs, setInitialInputs] = useState(contact);
//   const [errors, setErrors] = useState({ address: '', phone: '', ssn: '' });
//   const [isBeforeSave, setIsBeforeSave] = useState(true);
//   const [responseMessage, setResponseMessage] = useState('');

//   useEffect(() => {
//     setInitialInputs(contact);
//     if (contact?.latitude && contact?.longitude) {
//       setCoordinates({ latitude: contact.latitude, longitude: contact.longitude });
//     }
//   }, [contact]);

//   // Address autocomplete handler
//   const handleSelectedAddress = async (selectedAddress) => {
//     try {
//       const {
//         latitude,
//         longitude,
//         cityLong,
//         cityShort,
//         stateLong,
//         stateShort,
//         countryLong,
//         countryShort,
//         postalCode,
//       } = await geocodeAddress(selectedAddress);
//       setCoordinates({ latitude, longitude });
//       setInputs(prev => ({
//         ...prev,
//         address: selectedAddress,
//         latitude,
//         longitude,
//         cityLong,
//         cityShort,
//         stateLong,
//         stateShort,
//         countryLong,
//         countryShort,
//         postalCode,
//       }));
//       setAutocompleteError(null);
//       setErrors(prev => ({ ...prev, address: null }));
//     } catch (error) {
//       console.error('Geocoding failed:', error);
//       setCoordinates(null);
//       setAutocompleteError(tSafe('failed_verify_address', 'Failed to verify address. Please enter manually.'));
//       setShowGoogleAutocomplete(false);
//     }
//   };

//   // Manual address input handler
//   const handleManualAddressChange = (val) => {
//     setInputs(prev => ({ ...prev, address: val }));
//     setCoordinates(null);
//     setErrors(prev => ({ ...prev, address: null }));
//     setAutocompleteError(null);
//   };

//   // Manual address verification handler (called from AddressInput after user clicks Verify)
//   const handleManualVerification = (coords) => {
//     console.log('Manual verification called with coords:', coords);
//     if (!coords || !coords.latitude) {
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_verify_address', 'Could not verify address. Please check the address and try again.'));
//       return;
//     }
//     setCoordinates(coords);
//     setInputs(prev => ({
//       ...prev,
//       latitude: coords.latitude,
//       longitude: coords.longitude,
//     }));
//     setErrors(prev => ({ ...prev, address: null }));
//     setAutocompleteError(null);
//   };

//   // Phone formatting
//   const formatPhoneNumber = (input) => {
//     const cleaned = ('' + input).replace(/\D/g, '');
//     const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
//     if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
//     return input;
//   };

//   const handleInputChange = (text, input) => {
//     setInputs(prev => ({ ...prev, [input]: formatPhoneNumber(text) }));
//   };

//   const handleChange = (text, input) => {
//     setInputs(prev => ({ ...prev, [input]: text }));
//   };

//   // Error handling
//   const handleError = (error, input) => {
//     setErrors(prev => ({ ...prev, [input]: error }));
//   };

//   // Validation
//   const validate = () => {
//     let isValid = true;
//     const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;

//     console.log('Validating...');
//     console.log('Address:', inputs.address);
//     console.log('Coordinates:', coordinates);

//     if (!inputs.phone) {
//       handleError(tSafe('phone_required', 'Phone number is required'), 'phone');
//       isValid = false;
//     } else if (!phonePattern.test(inputs.phone)) {
//       handleError(tSafe('invalid_phone_format', 'Invalid phone number format (e.g., (123) 456-7890)'), 'phone');
//       isValid = false;
//     }
//     if (!inputs.address) {
//       handleError(tSafe('address_required', 'Address is required'), 'address');
//       isValid = false;
//     } else if (!coordinates) {
//       handleError(tSafe('address_verify_required', 'Please verify your address'), 'address');
//       isValid = false;
//     }

//     if (isValid) {
//       onSubmit();
//     }
//   };

//   const onSubmit = async () => {
//     try {
//       const data = {
//         userId,
//         address: inputs.address,
//         phone: inputs.phone,
//         ssn: inputs.ssn,
//         latitude: inputs.latitude,
//         longitude: inputs.longitude,
//         cityLong: inputs.cityLong,
//         cityShort: inputs.cityShort,
//         stateLong: inputs.stateLong,
//         stateShort: inputs.stateShort,
//         countryLong: inputs.countryLong,
//         countryShort: inputs.countryShort,
//         postalCode: inputs.postalCode,
//       };
//       const response = await userService.updateCleanerContact(data);
//       if (response.status === 200) {
//         setIsBeforeSave(false);
//         setResponseMessage(response.data.message);
//       } else {
//         Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
//       }
//     } catch (e) {
//       Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
//     }
//   };

//   const handleCloseModal = () => {
//     const hasUnsavedChanges = JSON.stringify(inputs) !== JSON.stringify(initialInputs);
//     if (hasUnsavedChanges) {
//       Alert.alert(
//         tSafe('unsaved_changes_title', 'Unsaved Changes'),
//         tSafe('unsaved_changes_message', 'You have unsaved changes. Are you sure you want to discard them?'),
//         [
//           { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//           { text: tSafe('discard', 'Discard'), onPress: () => close_modal(false) },
//         ]
//       );
//     } else {
//       close_modal(false);
//     }
//   };

//   const onClose = () => close_modal(false);

//   // Address inputs renderer
//   const renderAddressInputs = () => (
//     <>
//       {showGoogleAutocomplete && (
//         <GoogleAutocomplete
//           label={tSafe('property_address_label', 'Property Address')}
//           apiKey={GOOGLE_MAPS_API_KEY}
//           selected_address={handleSelectedAddress}
//           handleError={handleAutocompleteError}
//         />
//       )}

//       {!showGoogleAutocomplete && (
//         <AddressInput
//           label={tSafe('property_address_label', 'Property Address')}
//           value={inputs.address}
//           onChange={handleManualAddressChange}
//           onCoordinatesSet={handleManualVerification}
//           error={errors.address}
//         />
//       )}

//       {!hasPermission && (
//         <View style={styles.permissionWarningContainer}>
//           <Icon source="alert-circle-outline" size={16} color={COLORS.orange} />
//           <Text style={styles.permissionWarningText}>
//             {tSafe('location_permission_required', 'Location permission required for address verification')}
//           </Text>
//         </View>
//       )}

//       {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//         <Text style={styles.errorText}>{autocompleteError}</Text>
//       )}
//       {errors.address && !coordinates && (
//         <Text style={styles.errorText}>{errors.address}</Text>
//       )}
//     </>
//   );

//   const handleAutocompleteError = (error) => {
//     if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' ||
//         error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//       setAutocompleteError(tSafe('address_service_unavailable', 'Address service unavailable. Please enter manually.'));
//       setShowGoogleAutocomplete(false);
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       <View style={styles.modalContent}>
//         <View style={styles.close_button}>
//           {isBeforeSave && (
//             <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={handleCloseModal} />
//           )}
//           {!isBeforeSave && (
//             <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />
//           )}
//         </View>

//         {isBeforeSave && (
//           <View>
//             <Text style={styles.heading}>{tSafe('edit_contact_info', 'Edit Your Contact Info')}</Text>

//             {/* Address Inputs with Autocomplete + Manual Fallback */}
//             {renderAddressInputs()}

//             {/* Phone Input */}
//             <TextInput
//               label={tSafe('mobile_phone_label', 'Mobile Phone')}
//               placeholder={tSafe('mobile_phone_placeholder', 'Mobile Phone')}
//               mode="outlined"
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//               value={inputs.phone}
//               onChangeText={text => handleInputChange(text, 'phone')}
//               keyboardType="phone-pad"
//               style={{ marginBottom: 10, fontSize: 14, width: '100%', backgroundColor: '#fff' }}
//               onFocus={() => handleError(null, 'phone')}
//               error={!!errors.phone}
//             />
//             {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

//             {/* Save Button */}
//             <TouchableOpacity style={styles.button} onPress={validate}>
//               <Text style={styles.button_text}>{tSafe('save', 'Save')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {!isBeforeSave && (
//           <View style={styles.success_response}>
//             <MaterialCommunityIcons name="check-circle" size={56} color="green" />
//             <Text style={{ fontSize: 19, fontWeight: '500', textAlign: 'center' }}>{responseMessage}</Text>
//             <TouchableOpacity style={styles.button} onPress={onClose}>
//               <Text style={styles.button_text}>{tSafe('continue', 'Continue')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const windowHeight = Dimensions.get('window').height;
// const modalHeight = windowHeight * 1.0;

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
//     fontSize: 16,
//     fontWeight: '500',
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
//     height: modalHeight,
//     width: '100%',
//   },
//   close_button: {
//     alignItems: 'flex-end',
//   },
//   success_response: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 10,
//   },
//   permissionWarningContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8E6',
//     padding: 10,
//     borderRadius: 4,
//     borderLeftWidth: 3,
//     borderLeftColor: COLORS.orange,
//     marginVertical: 10,
//   },
//   permissionWarningText: {
//     fontSize: 12,
//     color: COLORS.darkGray,
//     marginLeft: 8,
//   },
// });

// export default Contact;




// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
// import COLORS from '../../constants/colors';
// import { TextInput, Icon } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import GoogleAutocomplete from '../shared/GooglePlacesAutocomplete';
// import AddressInput from '../shared/AddressInput';
// // import useLocationPermission from '../../components/shared/UseLocationPermission';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe';
// import { GOOGLE_MAPS_API_KEY } from '../../env';
// import * as Location from 'expo-location';

// const Contact = ({ contact, userId, close_modal }) => {
//   // Address manual entry states
//   const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
//   const [autocompleteError, setAutocompleteError] = useState(null);
//   const [coordinates, setCoordinates] = useState(null);

//   const [hasPermission, setHasPermission] = useState(false);

//   // Location permission hook (assumes it returns { hasPermission, requestPermission })
//   // const { hasPermission, requestPermission } = useLocationPermission();

//   // Inputs state
//   const [inputs, setInputs] = useState({
//     address: '',
//     phone: '',
//     ssn: '',
//     longitude: '',
//     latitude: '',
//     cityLong: '',
//     cityShort: '',
//     stateLong: '',
//     stateShort: '',
//     countryLong: '',
//     countryShort: '',
//     postalCode: '',
//     userId: userId,
//   });

//   const [initialInputs, setInitialInputs] = useState(contact);
//   const [errors, setErrors] = useState({ address: '', phone: '', ssn: '' });
//   const [isBeforeSave, setIsBeforeSave] = useState(true);
//   const [responseMessage, setResponseMessage] = useState('');

//   // // Request location permission when component mounts
//   // useEffect(() => {
//   //   const requestLocationPermission = async () => {
//   //     try {
//   //       if (requestPermission) {
//   //         await requestPermission();
//   //       } else {
//   //         console.warn('No requestPermission function provided by hook.');
//   //       }
//   //     } catch (error) {
//   //       console.error('Failed to request location permission:', error);
//   //     }
//   //   };

//   //   requestLocationPermission();
//   // }, [requestPermission]);

//   // ---- Request permission using expo-location ----
//   const requestLocationPermission = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === 'granted') {
//         setHasPermission(true);
//         return true;
//       } else {
//         setHasPermission(false);
//         Alert.alert(
//           tSafe('permission_required', 'Permission required'),
//           tSafe('location_permission_needed', 'Location access is needed to verify addresses.')
//         );
//         return false;
//       }
//     } catch (error) {
//       console.error('Permission request failed:', error);
//       setHasPermission(false);
//       return false;
//     }
//   };

//   // ---- Request permission on mount ----
//   useEffect(() => {
//     requestLocationPermission();
//   }, []);

//   useEffect(() => {
//     setInitialInputs(contact);
//     if (contact?.latitude && contact?.longitude) {
//       setCoordinates({ latitude: contact.latitude, longitude: contact.longitude });
//     }
//   }, [contact]);

//   // Address autocomplete handler
//   const handleSelectedAddress = async (selectedAddress) => {
//     try {
//       const {
//         latitude,
//         longitude,
//         cityLong,
//         cityShort,
//         stateLong,
//         stateShort,
//         countryLong,
//         countryShort,
//         postalCode,
//       } = await geocodeAddress(selectedAddress);
//       setCoordinates({ latitude, longitude });
//       setInputs(prev => ({
//         ...prev,
//         address: selectedAddress,
//         latitude,
//         longitude,
//         cityLong,
//         cityShort,
//         stateLong,
//         stateShort,
//         countryLong,
//         countryShort,
//         postalCode,
//       }));
//       setAutocompleteError(null);
//       setErrors(prev => ({ ...prev, address: null }));
//     } catch (error) {
//       console.error('Geocoding failed:', error);
//       setCoordinates(null);
//       setAutocompleteError(tSafe('failed_verify_address', 'Failed to verify address. Please enter manually.'));
//       setShowGoogleAutocomplete(false);
//     }
//   };

//   // Manual address input handler
//   const handleManualAddressChange = (val) => {
//     setInputs(prev => ({ ...prev, address: val }));
//     setCoordinates(null);
//     setErrors(prev => ({ ...prev, address: null }));
//     setAutocompleteError(null);
//   };

//   // Manual address verification handler (called from AddressInput after user clicks Verify)
//   const handleManualVerification = (coords) => {
//     console.log('Manual verification called with coords:', coords);
//     if (!coords || !coords.latitude) {
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_verify_address', 'Could not verify address. Please check the address and try again.'));
//       return;
//     }
//     setCoordinates(coords);
//     setInputs(prev => ({
//       ...prev,
//       latitude: coords.latitude,
//       longitude: coords.longitude,
//     }));
//     setErrors(prev => ({ ...prev, address: null }));
//     setAutocompleteError(null);
//   };

//   // Phone formatting
//   const formatPhoneNumber = (input) => {
//     const cleaned = ('' + input).replace(/\D/g, '');
//     const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
//     if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
//     return input;
//   };

//   const handleInputChange = (text, input) => {
//     setInputs(prev => ({ ...prev, [input]: formatPhoneNumber(text) }));
//   };

//   const handleChange = (text, input) => {
//     setInputs(prev => ({ ...prev, [input]: text }));
//   };

//   // Error handling
//   const handleError = (error, input) => {
//     setErrors(prev => ({ ...prev, [input]: error }));
//   };

//   // Validation
//   const validate = () => {
//     let isValid = true;
//     const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;

//     console.log('Validating...');
//     console.log('Address:', inputs.address);
//     console.log('Coordinates:', coordinates);

//     if (!inputs.phone) {
//       handleError(tSafe('phone_required', 'Phone number is required'), 'phone');
//       isValid = false;
//     } else if (!phonePattern.test(inputs.phone)) {
//       handleError(tSafe('invalid_phone_format', 'Invalid phone number format (e.g., (123) 456-7890)'), 'phone');
//       isValid = false;
//     }
//     if (!inputs.address) {
//       handleError(tSafe('address_required', 'Address is required'), 'address');
//       isValid = false;
//     } else if (!coordinates) {
//       handleError(tSafe('address_verify_required', 'Please verify your address'), 'address');
//       isValid = false;
//     }

//     if (isValid) {
//       onSubmit();
//     }
//   };

//   const onSubmit = async () => {
//     try {
//       const data = {
//         userId,
//         address: inputs.address,
//         phone: inputs.phone,
//         ssn: inputs.ssn,
//         latitude: inputs.latitude,
//         longitude: inputs.longitude,
//         cityLong: inputs.cityLong,
//         cityShort: inputs.cityShort,
//         stateLong: inputs.stateLong,
//         stateShort: inputs.stateShort,
//         countryLong: inputs.countryLong,
//         countryShort: inputs.countryShort,
//         postalCode: inputs.postalCode,
//       };
//       const response = await userService.updateCleanerContact(data);
//       if (response.status === 200) {
//         setIsBeforeSave(false);
//         setResponseMessage(response.data.message);
//       } else {
//         Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
//       }
//     } catch (e) {
//       Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
//     }
//   };

//   const handleCloseModal = () => {
//     const hasUnsavedChanges = JSON.stringify(inputs) !== JSON.stringify(initialInputs);
//     if (hasUnsavedChanges) {
//       Alert.alert(
//         tSafe('unsaved_changes_title', 'Unsaved Changes'),
//         tSafe('unsaved_changes_message', 'You have unsaved changes. Are you sure you want to discard them?'),
//         [
//           { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//           { text: tSafe('discard', 'Discard'), onPress: () => close_modal(false) },
//         ]
//       );
//     } else {
//       close_modal(false);
//     }
//   };

//   const onClose = () => close_modal(false);

//   // Address inputs renderer (now with a retry button)
//   const renderAddressInputs = () => (
//     <>
//       {showGoogleAutocomplete && (
//         <GoogleAutocomplete
//           label={tSafe('property_address_label', 'Property Address')}
//           apiKey={GOOGLE_MAPS_API_KEY}
//           selected_address={handleSelectedAddress}
//           handleError={handleAutocompleteError}
//         />
//       )}

//       {!showGoogleAutocomplete && (
//         <AddressInput
//           label={tSafe('property_address_label', 'Property Address')}
//           value={inputs.address}
//           onChange={handleManualAddressChange}
//           onCoordinatesSet={handleManualVerification}
//           error={errors.address}
//         />
//       )}

//       {!hasPermission && (
//         <View style={styles.permissionWarningContainer}>
//           <Icon source="alert-circle-outline" size={16} color={COLORS.orange} />
//           <Text style={styles.permissionWarningText}>
//             {tSafe('location_permission_required', 'Location permission required for address verification')}
//           </Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={async () => {
//               if (requestPermission) {
//                 await requestPermission();
//               } else {
//                 Alert.alert('Error', 'Unable to request permission. Please enable location in settings.');
//               }
//             }}
//           >
//             <Text style={styles.retryButtonText}>{tSafe('retry', 'Retry')}</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//         <Text style={styles.errorText}>{autocompleteError}</Text>
//       )}
//       {errors.address && !coordinates && (
//         <Text style={styles.errorText}>{errors.address}</Text>
//       )}
//     </>
//   );

//   const handleAutocompleteError = (error) => {
//     if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' ||
//         error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//       setAutocompleteError(tSafe('address_service_unavailable', 'Address service unavailable. Please enter manually.'));
//       setShowGoogleAutocomplete(false);
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       <View style={styles.modalContent}>
//         <View style={styles.close_button}>
//           {isBeforeSave && (
//             <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={handleCloseModal} />
//           )}
//           {!isBeforeSave && (
//             <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />
//           )}
//         </View>

//         {isBeforeSave && (
//           <View>
//             <Text style={styles.heading}>{tSafe('edit_contact_info', 'Edit Your Contact Info')}</Text>

//             {/* Address Inputs with Autocomplete + Manual Fallback */}
//             {renderAddressInputs()}

//             {/* Phone Input */}
//             <TextInput
//               label={tSafe('mobile_phone_label', 'Mobile Phone')}
//               placeholder={tSafe('mobile_phone_placeholder', 'Mobile Phone')}
//               mode="outlined"
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//               value={inputs.phone}
//               onChangeText={text => handleInputChange(text, 'phone')}
//               keyboardType="phone-pad"
//               style={{ marginBottom: 10, fontSize: 14, width: '100%', backgroundColor: '#fff' }}
//               onFocus={() => handleError(null, 'phone')}
//               error={!!errors.phone}
//             />
//             {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

//             {/* Save Button */}
//             <TouchableOpacity style={styles.button} onPress={validate}>
//               <Text style={styles.button_text}>{tSafe('save', 'Save')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {!isBeforeSave && (
//           <View style={styles.success_response}>
//             <MaterialCommunityIcons name="check-circle" size={56} color="green" />
//             <Text style={{ fontSize: 19, fontWeight: '500', textAlign: 'center' }}>{responseMessage}</Text>
//             <TouchableOpacity style={styles.button} onPress={onClose}>
//               <Text style={styles.button_text}>{tSafe('continue', 'Continue')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const windowHeight = Dimensions.get('window').height;
// const modalHeight = windowHeight * 1.0;

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
//     fontSize: 16,
//     fontWeight: '500',
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
//     height: modalHeight,
//     width: '100%',
//   },
//   close_button: {
//     alignItems: 'flex-end',
//   },
//   success_response: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 10,
//   },
//   permissionWarningContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8E6',
//     padding: 10,
//     borderRadius: 4,
//     borderLeftWidth: 3,
//     borderLeftColor: COLORS.orange,
//     marginVertical: 10,
//     flexWrap: 'wrap',
//   },
//   permissionWarningText: {
//     fontSize: 12,
//     color: COLORS.darkGray,
//     marginLeft: 8,
//     flex: 1,
//   },
//   retryButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   retryButtonText: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: '500',
//   },
// });

// export default Contact;





import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import COLORS from '../../constants/colors';
import { TextInput, Icon } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { geocodeAddress } from '../../utils/geocodeAddress';
import GoogleAutocomplete from '../shared/GooglePlacesAutocomplete';
import AddressInput from '../shared/AddressInput';
import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import { GOOGLE_MAPS_API_KEY } from '../../env';

const Contact = ({ contact, userId, close_modal }) => {
  // Address entry states
  const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
  const [autocompleteError, setAutocompleteError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  // Permission state
  const [hasPermission, setHasPermission] = useState(false);

  // Inputs state
  const [inputs, setInputs] = useState({
    address: '',
    phone: '',
    ssn: '',
    longitude: '',
    latitude: '',
    cityLong: '',
    cityShort: '',
    stateLong: '',
    stateShort: '',
    countryLong: '',
    countryShort: '',
    postalCode: '',
    userId: userId,
  });

  const [initialInputs, setInitialInputs] = useState(contact);
  const [errors, setErrors] = useState({ address: '', phone: '', ssn: '' });
  const [isBeforeSave, setIsBeforeSave] = useState(true);
  const [responseMessage, setResponseMessage] = useState('');

  // ---- Request permission using expo-location (with full error handling) ----
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        Alert.alert(
          tSafe('permission_required', 'Permission required'),
          tSafe('location_permission_needed', 'Location access is needed to verify addresses.')
        );
        return false;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setHasPermission(false);
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe('permission_request_failed', 'Could not request location permission. Please enable it in settings.')
      );
      return false;
    }
  };

  // ---- Request permission on mount ----
  useEffect(() => {
    requestLocationPermission().catch((err) => {
      console.error('Permission request on mount failed:', err);
      setHasPermission(false);
    });
  }, []);

  // ---- Sync contact data ----
  useEffect(() => {
    setInitialInputs(contact);
    if (contact?.latitude && contact?.longitude) {
      setCoordinates({ latitude: contact.latitude, longitude: contact.longitude });
    }
  }, [contact]);

  // ---- Address handlers (unchanged) ----
  const handleSelectedAddress = async (selectedAddress) => {
    try {
      const {
        latitude,
        longitude,
        cityLong,
        cityShort,
        stateLong,
        stateShort,
        countryLong,
        countryShort,
        postalCode,
      } = await geocodeAddress(selectedAddress);
      setCoordinates({ latitude, longitude });
      setInputs(prev => ({
        ...prev,
        address: selectedAddress,
        latitude,
        longitude,
        cityLong,
        cityShort,
        stateLong,
        stateShort,
        countryLong,
        countryShort,
        postalCode,
      }));
      setAutocompleteError(null);
      setErrors(prev => ({ ...prev, address: null }));
    } catch (error) {
      console.error('Geocoding failed:', error);
      setCoordinates(null);
      setAutocompleteError(tSafe('failed_verify_address', 'Failed to verify address. Please enter manually.'));
      setShowGoogleAutocomplete(false);
    }
  };

  const handleManualAddressChange = (val) => {
    setInputs(prev => ({ ...prev, address: val }));
    setCoordinates(null);
    setErrors(prev => ({ ...prev, address: null }));
    setAutocompleteError(null);
  };

  const handleManualVerification = (coords) => {
    if (!coords || !coords.latitude) {
      Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_verify_address', 'Could not verify address. Please check the address and try again.'));
      return;
    }
    setCoordinates(coords);
    setInputs(prev => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
    setErrors(prev => ({ ...prev, address: null }));
    setAutocompleteError(null);
  };

  // ---- Phone formatting (unchanged) ----
  // const formatPhoneNumber = (input) => {
  //   const cleaned = ('' + input).replace(/\D/g, '');
  //   const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
  //   if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  //   return input;
  // };

  const formatPhoneNumber = (input) => {
    const cleaned = ('' + input).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    return input;
  };
  

  const handleInputChange = (text, input) => {
    setInputs(prev => ({ ...prev, [input]: formatPhoneNumber(text) }));
  };
  

  const handleError = (error, input) => {
    setErrors(prev => ({ ...prev, [input]: error }));
  };

  // ---- Validation (unchanged) ----
  const validate = () => {
    let isValid = true;
    const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;

    if (!inputs.phone) {
      handleError(tSafe('phone_required', 'Phone number is required'), 'phone');
      isValid = false;
    } else if (!phonePattern.test(inputs.phone)) {
      handleError(tSafe('invalid_phone_format', 'Invalid phone number format (e.g., (123) 456-7890)'), 'phone');
      isValid = false;
    }
    if (!inputs.address) {
      handleError(tSafe('address_required', 'Address is required'), 'address');
      isValid = false;
    } else if (!coordinates) {
      handleError(tSafe('address_verify_required', 'Please verify your address'), 'address');
      isValid = false;
    }

    if (isValid) onSubmit();
  };

  const onSubmit = async () => {
    try {
      const data = {
        userId,
        address: inputs.address,
        phone: inputs.phone,
        ssn: inputs.ssn,
        latitude: inputs.latitude,
        longitude: inputs.longitude,
        cityLong: inputs.cityLong,
        cityShort: inputs.cityShort,
        stateLong: inputs.stateLong,
        stateShort: inputs.stateShort,
        countryLong: inputs.countryLong,
        countryShort: inputs.countryShort,
        postalCode: inputs.postalCode,
      };
      const response = await userService.updateCleanerContact(data);
      if (response.status === 200) {
        setIsBeforeSave(false);
        setResponseMessage(response.data.message);
      } else {
        Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
      }
    } catch (e) {
      Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, try again'));
    }
  };

  // ---- Close handlers ----
  const handleCloseModal = () => {
    const hasUnsavedChanges = JSON.stringify(inputs) !== JSON.stringify(initialInputs);
    if (hasUnsavedChanges) {
      Alert.alert(
        tSafe('unsaved_changes_title', 'Unsaved Changes'),
        tSafe('unsaved_changes_message', 'You have unsaved changes. Are you sure you want to discard them?'),
        [
          { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
          { text: tSafe('discard', 'Discard'), onPress: () => close_modal(false) },
        ]
      );
    } else {
      close_modal(false);
    }
  };

  const onClose = () => close_modal(false);

  const handleAutocompleteError = (error) => {
    if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' ||
        error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
      setAutocompleteError(tSafe('address_service_unavailable', 'Address service unavailable. Please enter manually.'));
      setShowGoogleAutocomplete(false);
    }
  };

  // ---- Render address inputs (with permission warning & retry) ----
  const renderAddressInputs = () => (
    <>
      {showGoogleAutocomplete && (
        <GoogleAutocomplete
          label={tSafe('property_address_label', 'Property Address')}
          apiKey={GOOGLE_MAPS_API_KEY}
          selected_address={handleSelectedAddress}
          handleError={handleAutocompleteError}
        />
      )}

      {!showGoogleAutocomplete && (
        <AddressInput
          label={tSafe('property_address_label', 'Property Address')}
          value={inputs.address}
          onChange={handleManualAddressChange}
          onCoordinatesSet={handleManualVerification}
          error={errors.address}
        />
      )}

      {!hasPermission && (
        <View style={styles.permissionWarningContainer}>
          <Icon source="alert-circle-outline" size={16} color={COLORS.orange} />
          <Text style={styles.permissionWarningText}>
            {tSafe('location_permission_required', 'Location permission required for address verification')}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              const granted = await requestLocationPermission();
              if (!granted) {
                Alert.alert(
                  tSafe('permission_denied', 'Permission Denied'),
                  tSafe('permission_denied_message', 'You can enable location in your device settings.')
                );
              }
            }}
          >
            <Text style={styles.retryButtonText}>{tSafe('retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {autocompleteError && !showGoogleAutocomplete && !coordinates && (
        <Text style={styles.errorText}>{autocompleteError}</Text>
      )}
      {errors.address && !coordinates && (
        <Text style={styles.errorText}>{errors.address}</Text>
      )}
    </>
  );

  // ---- Main render ----
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.close_button}>
          {isBeforeSave && (
            <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={handleCloseModal} />
          )}
          {!isBeforeSave && (
            <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />
          )}
        </View>

        {isBeforeSave && (
          <View>
            <Text style={styles.heading}>{tSafe('edit_contact_info', 'Edit Your Contact Info')}</Text>
            {renderAddressInputs()}
            <TextInput
              label={tSafe('mobile_phone_label', 'Mobile Phone')}
              placeholder={tSafe('mobile_phone_placeholder', 'Mobile Phone')}
              mode="outlined"
              outlineColor="#D8D8D8"
              activeOutlineColor={COLORS.primary}
              value={inputs.phone}
              onChangeText={text => handleInputChange(text, 'phone')}
              keyboardType="phone-pad"
              style={{ marginBottom: 10, fontSize: 14, width: '100%', backgroundColor: '#fff' }}
              onFocus={() => handleError(null, 'phone')}
              error={!!errors.phone}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            <TouchableOpacity style={styles.button} onPress={validate}>
              <Text style={styles.button_text}>{tSafe('save', 'Save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isBeforeSave && (
          <View style={styles.success_response}>
            <MaterialCommunityIcons name="check-circle" size={56} color="green" />
            <Text style={{ fontSize: 19, fontWeight: '500', textAlign: 'center' }}>{responseMessage}</Text>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.button_text}>{tSafe('continue', 'Continue')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
    </SafeAreaView>
  );
};

// ---- Styles (unchanged) ----
const windowHeight = Dimensions.get('window').height;
const modalHeight = windowHeight * 1.0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,

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
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    marginTop: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    elevation: 5,
    height: modalHeight,
    width: '100%',
  },
  close_button: {
    alignItems: 'flex-end',
  },
  success_response: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  permissionWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  permissionWarningText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Contact;