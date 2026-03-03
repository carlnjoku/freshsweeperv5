// import React, { useState, useEffect, useContext, useRef } from "react";
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import { StyleSheet,Text, Keyboard, Alert, Platform, StatusBar, Linking,  FlatList, ScrollView, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import Button from "../../components/shared/Button";
// import { Modal, Portal, Provider } from "react-native-paper";
// import Slider from "@react-native-community/slider"; // Fixed import
// import { AuthContext } from "../../context/AuthContext";
// import { SafeAreaView } from "react-native-safe-area-context";
// import COLORS from "../../constants/colors";
// import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
// import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import userService from "../../services/connection/userService";
// import { geocodeAddress } from "../../utils/geocodeAddress";
// import ROUTES from "../../constants/routes";
// // import FloatingLabelPicker from "../../components/shared/FloatingLabelPicker";
// import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
// import { propertyList } from "../../data";
// import moment from 'moment'
// import AddressInput from "../../components/shared/AddressInput";
// import { Icon } from 'react-native-paper';
// import useLocationPermission from "../../components/shared/UseLocationPermission";
// import { useNavigation } from "@react-navigation/native";
// import { createDefaultChecklist, generateTasksForRoomType } from "../../utils/createDefaultChecklist";
// import PlatformCleanerPicker from "../../components/host/PlatformCleanerPicker";
// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';
// import CleanerManagementModal from "./CleanerManagementModal";

// // Fallback Colors if COLORS is missing
// const FALLBACK_COLORS = {
//     primary: "#007AFF",
//     accent: COLORS.deepBlue,
//   };

// export default function AddProperty() {
//     const { currentUserId } = useContext(AuthContext);

//     const { hasPermission } = useLocationPermission();
//     const navigation = useNavigation()
//     // Room State
//     const [roomDetails, setRoomDetails] = useState([
//       { type: "Bedroom", number: 0, size: 120, size_range: "Small" },
//       { type: "Bathroom", number: 0, size: 120, size_range: "Small" },
//       { type: "Livingroom", number: 0, size: 150, size_range: "Medium" },
//       { type: "Kitchen", number: 0, size: 140, size_range: "Small" }, // Added Kitchen
//     ]);
  
//     const[modalVisible, setModalVisible] = useState(false);
//     const[aptName, setAptName] = useState("");
//     const[address, setAddress] = useState("");
//     const[apt_type, setAptType] = useState("");
  
//     const[firstname, setFirstname] = useState("")
//     const[lastname, setLastname] = useState("")
//     const[email, setEmail] = useState("")
//     const[avatar, setAvatar] = useState("")
//     const [errors, setErrors] = useState({
//       room_count: {},
//       room_size: {} 
//     });
  
//      const[loading, setLoading] = React.useState(false);
  
  
//      const[selectedValue, setSelectedValue] = useState(null);
  
//     const {geolocationData} = useContext(AuthContext)
//       const phoneInput = useRef(); 
//       const[inputs, setInputs] = useState({
//           apt_name:"",
//           instructions:"",
//           cleaning_supplies:"",
//           contact_phone:"",
//           created_on: "",
//           roomInfo:[]
//       })
//       const[phoneNumber, setPhoneNumber] = useState('');
//       const[checked, setChecked] = useState('');
//       const[latitude, setLatitude] = useState(null);
//       const[longitude, setLongitude] = useState(null);
//       const[city, setCity] = useState(null);
//       const[textInputBottomMargin, setTextInputBottomMargin] = useState(0);
  
   

//       const [manualAddressRequired, setManualAddressRequired] = useState(false);
//       const [autocompleteError, setAutocompleteError] = useState(null);
//       const [coordinates, setCoordinates] = useState(null);
//       const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
  
//       const [preferredCleaners, setPreferredCleaners] = useState([]); // array of { id, name, type: 'platform'|'invited' }
//       const [invitedCleanerEmail, setInvitedCleanerEmail] = useState('');
//       const [invitedCleanerPhone, setInvitedCleanerPhone] = useState('');
//       const [invitedCleaners, setInvitedCleaners] = useState([]);

//       const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//       const [platformCleaners, setPlatformCleaners] = useState([]); // list from backend


//       useEffect(() => {
//         if (!coordinates?.latitude || !coordinates?.longitude) return;
      
//         fetchPlatformCleaners(coordinates.latitude, coordinates.longitude);
//       }, [coordinates]);

      
//       const fetchPlatformCleaners = async (lat, lng) => {
//         try {
//           const res = await userService.getPlatformCleaners({
//             latitude: lat,
//             longitude: lng,
//             radius: 100 // miles
//           });
//           console.log("Recommended cleaners-----", res.data)
//           setPlatformCleaners(res.data);
//         } catch (err) {
//           console.log('Failed to fetch platform cleaners', err);
//         }
//       };


      

//     // Handle autocomplete selection
//     const handleAutocompleteSelect = async (selectedAddress) => {
//       try {
//         const { latitude, longitude } = await geocodeAddress(selectedAddress);
//         setCoordinates({ latitude, longitude });
//         setAddress(selectedAddress);
//         setAutocompleteError(null);
//         setErrors(prev => ({...prev, address: null}));
//       } catch (error) {
//         console.error('Geocoding failed:', error);
//         setCoordinates(null);
//         setAutocompleteError('Failed to verify address. Please enter manually.');
//         setShowGoogleAutocomplete(false); // Hide autocomplete on error
//       }
//     };

//     // Handle autocomplete errors
//     const handleAutocompleteError = (error) => {
//       if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' || 
//           error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//         setAutocompleteError('Address service unavailable. Please enter manually.');
//         setShowGoogleAutocomplete(false); // Hide autocomplete on error
//       }
//     };


//     // // Handle manual address input
//     // const handleManualAddressChange = (val) => {
//     //   setAddress(val);
//     //   // Reset coordinates when user edits manually
//     //   setCoordinates(null);
//     //   // Clear address error
//     //   setErrors(prev => ({...prev, address: null}));
//     // };

//     // Handle manual address input
//   const handleManualAddressChange = (val) => {
//     setAddress(val);
//     setCoordinates(null);
//     // Clear both address errors when typing
//     setErrors(prev => ({...prev, address: null}));
//     setAutocompleteError(null);
//   };

//   // Handle manual address verification
//   const handleManualVerification = (coords) => {
//     setCoordinates(coords);
//     // Clear all address-related errors when verified
//     setErrors(prev => ({...prev, address: null}));
//     setAutocompleteError(null);
//   };


    
  
//     useEffect(() => {
//       fetchUser()
//       const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
//         setTextInputBottomMargin(60); // Adjust this value as needed
//       });
  
//       const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
//         setTextInputBottomMargin(0);
//       });
  
//       return () => {
//         keyboardDidShowListener.remove();
//         keyboardDidHideListener.remove();
//       };
//     }, []);
  
  
  
//     const fetchUser = async () => { 
//       try {
        
//         await userService.getUser(currentUserId)
//         .then(response=> {
//           const res = response.data
//           setFirstname(res.firstname)
//           setLastname(res.lastname)
//           setEmail(res.email)
//           setAvatar(res.avatar)
//           setCity(res.location.city)
//         })
  
//       } catch(e) {
//         // error reading value
//       }
//     }
  
  
//     // Function to get room size category
//     const getRoomSizeCategory = (size) => {
//       if (size < 150) return "Small";
//       if (size >= 150 && size <= 300) return "Medium";
//       return "Large";
//     };
  
    
  
//     const handleRoomCountChange = (roomType, action) => {
//       setRoomDetails(prevRooms =>
//           prevRooms.map(room => {
//               if (room.type === roomType) {
//                   const newCount = action === "add" ? room.number + 1 : Math.max(0, room.number - 1);
  
//                   // Remove error when a valid input is added
//                   setErrors(prevErrors => ({
//                       ...prevErrors,
//                       room_count: {
//                           ...prevErrors.room_count,
//                           [roomType]: newCount > 0 ? null : prevErrors.room_count[roomType], // Remove error if valid
//                       },
//                   }));
  
//                   return { ...room, number: newCount };
//               }
//               return room;
//           })
//       );
//   };
  
//     // Function to update room size using slider
//     const handleRoomSizeChange = (type, size) => {
//       setRoomDetails((prev) =>
//         prev.map((room) =>
//           room.type === type
//             ? { ...room, size, size_range: getRoomSizeCategory(size) }
//             : room
//         )
//       );
//     };
  
//     // Open modal only when user confirms selection
//     const handleConfirmRoomSelection = () => {
//       const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
//       if (totalRooms > 0) {
//         setModalVisible(true);
//       }
//     };
  
    

//     // Update handleSelectedAddress (if keeping GoogleAutocomplete)
//     const handleSelectedAddress = async (selectedAddress) => {
//       try {
//         const { latitude, longitude } = await geocodeAddress(selectedAddress);
//         setCoordinates({ latitude, longitude });
//         setAddress(selectedAddress);
//         // Clear any address error
//         setErrors(prev => ({...prev, address: null}));
//       } catch (error) {
//         Alert.alert('Error', 'Failed to geocode address');
//         setCoordinates(null);
//       }
//     };

//     const formatPhoneNumber = (input) => {
//       const cleaned = ('' + input).replace(/\D/g, '');
//       const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//       if (match) {
//         return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//       }
//       return input;
//     };
  
//     const handleInputChange = (text) => {
//       setPhoneNumber(formatPhoneNumber(text));
//     };
  
//     const handleChange = (text, input)=> {
//       setInputs(prevState => ({...prevState, [input]: text}));
//     }
  
  
    

//     const onSubmit = async () => {
//       setLoading(true);
    
//       // Run frontend validations
//       if (!validate()) {
//         setLoading(false);
//         return;
//       }
    
//       try {
//         const owner_info = {
//           firstname,
//           lastname,
//           email,
//           userId: currentUserId,
//           avatar
//         };
    
//         const propertyData = {
//           userId: currentUserId,
//           owner_info,
//           apt_name: inputs.apt_name,
//           instructions: inputs.instructions,
//           cleaning_supplies: checked,
//           contact_phone: phoneNumber.replace(/\D/g, ''),
//           address,
//           latitude: coordinates.latitude.toFixed(4),
//           longitude: coordinates.longitude.toFixed(4),
//           created_on: moment().format('YYYY-MM-DD HH:mm:ss'),
//           apt_type,
//           preferredCleaners: preferredCleaners.map(c => ({
//             id: c.id,
//             type: c.type
//           })),
//           invitedCleaners:invitedCleaners,
//           roomDetails, // dynamic room info
//           // No need for checklistId — backend will generate it
//         };

//         console.log("Property data-------------|-------|", propertyData)
    
//         // Create the property and let backend generate checklist if missing
//         const propertyResponse = await userService.addApartment(propertyData);
    
//         if (propertyResponse.status === 200) {
//           const { propertyId, checklistId } = propertyResponse.data;
    
//           // navigation.navigate(ROUTES.host_dashboard, {
//           //   successMessage: "Property created with default checklist!",
//           //   propertyId,
//           //   checklistId,
//           // });

//         } else {
//           Alert.alert("Error", "Property creation failed");
//         }
//       } catch (err) {
//         console.log("Error creating property:", err);
//         Alert.alert("Error", "Something went wrong, please try again");
//       } finally {
//         setLoading(false);
//       }
//     };
  

    







    




    
  
//     const handleError = (error, input) => {
//       setErrors(prevState => ({...prevState, [input]: error}));
//     };
  
    
  
//     const validateRoomDetails = (roomDetails) => {
//       let isValid = true;
//       let newErrors = { room_count: {}, room_size: {} };
  
//       for (const room of roomDetails) {
//           if (room.number <= 0) {
//               newErrors.room_count[room.type] = `${room.type} count must be greater than 0`;
//               isValid = false;
//           }
//           if (room.size < 50 || room.size > 600) {
//               newErrors.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
//               isValid = false;
//           }
//       }
  
//       setErrors((prevErrors) => ({
//           ...prevErrors,
//           room_count: newErrors.room_count,
//           room_size: newErrors.room_size
//       }));
  
//       return isValid;
//     };
  

//   const validate = () => {
//     let isValid = true;
//     const newErrors = {
//       apt_name: null,
//       address: null,
//       apt_type: null,
//       contact_phone: null,
//       instructions: null,
//       room_count: {},
//       room_size: {}
      
//     };
  
//     // Validate Apartment Name
//     if (!inputs.apt_name.trim()) {
//       newErrors.apt_name = 'Property name is required';
//       isValid = false;
//     }
  
  
//     // Address validation
//     if (!address.trim()) {
//       newErrors.address = 'Address is required';
//       isValid = false;
//     } else if (!coordinates) {
//       // Only show verification error if not already in manual mode
//       if (showGoogleAutocomplete) {
//         newErrors.address = 'Please verify address by selecting from suggestions';
//       } else {
//         newErrors.address = 'Please verify your address';
//       }
//       isValid = false;
//     }
  
//     // Validate Apartment Type
//     if (!apt_type.trim()) {
//       newErrors.apt_type = 'Property Type is required';
//       isValid = false;
//     }
  
//     // Validate Room Details
//     roomDetails.forEach((room) => {
//       if (room.number <= 0) {
//         newErrors.room_count[room.type] = `${room.type} count must be greater than 0`;
//         isValid = false;
//       }
//       if (room.size < 50 || room.size > 600) {
//         newErrors.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
//         isValid = false;
//       }
//     });
  
//     // Validate Phone Number (10 digits)
//     const phoneRegex = /^[0-9]{10}$/;
//     const cleanedPhone = phoneNumber.replace(/\D/g, '');
//     if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
//       newErrors.contact_phone = 'Enter a valid 10-digit phone number';
//       isValid = false;
//     }
  
//     // Validate Instructions (optional but must be at least 5 chars)
//     if (inputs.instructions && inputs.instructions.length < 5) {
//       newErrors.instructions = 'Instructions must be at least 5 characters long';
//       isValid = false;
//     }
  
//     // Update errors state
//     setErrors(newErrors);
//     return isValid;
//   };
  

  

//   // Render address inputs
//   const renderAddressInputs = () => (
//     <>
//       {/* Google Autocomplete - shown only when working */}
//       {showGoogleAutocomplete && (
//         <GoogleAutocomplete 
//           label="Property Address"
//           apiKey={GOOGLE_MAPS_API_KEY}
//           selected_address={handleAutocompleteSelect}
//           handleError={handleAutocompleteError}
//         />
//       )}
      
//       {/* Manual AddressInput - shown when autocomplete fails */}
//       {!showGoogleAutocomplete && (
//         <AddressInput
//           label="Property Address"
//           value={address}
//           onChange={handleManualAddressChange}
//           onCoordinatesSet={handleManualVerification} // Use the new handler
//           error={errors.address}
//         />
//       )}

      

//       {/* Display coordinates if verified */}
//       {/* {coordinates && (
//         <Text style={styles.coordinatesText}>
//           Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
//         </Text>
//       )} */}

//       {!hasPermission && (
//         <View style={styles.permissionWarningContainer}>
//           <Icon 
//             source="alert-circle-outline" 
//             size={16} 
//             color={COLORS.orange} 
//           />
//           <Text style={styles.permissionWarningText}>
//             Location permission required for address verification
//           </Text>
//         </View>
//       )}

//       {/* Error Messages */}
//       {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//         <Text style={styles.errorText}>{autocompleteError}</Text>
//       )}
//       {errors.address && !coordinates && (
//         <Text style={styles.errorText}>{errors.address}</Text>
//       )}
//     </>
//   );
  
//   const generateUniqueToken = () => {
//     return (
//       Date.now().toString(36) +
//       Math.random().toString(36).substring(2, 10)
//     );
//   };

//   // const handleInviteCleaner = () => {
//   //   if (!invitedCleanerEmail && !invitedCleanerPhone) {
//   //     Alert.alert('Error', 'Enter email or phone to invite a cleaner');
//   //     return;
//   //   }
  
//   //   const token = generateUniqueToken(); // e.g., UUID
//   //   const newInvited = {
//   //     id: token, // temporary id until backend saves
//   //     name: '',  // optional
//   //     email: invitedCleanerEmail,
//   //     phone: invitedCleanerPhone,
//   //     type: 'invited',
//   //     status: 'pending',
//   //     inviteToken: token
//   //   };
  
//   //   setPreferredCleaners(prev => [...prev, newInvited]);
//   //   console.log("invites-----", newInvited)
  
//   //   setInvitedCleanerEmail('');
//   //   setInvitedCleanerPhone('');
//   //   Alert.alert('Success', 'Cleaner invite added. They will receive a link once property is saved.');
//   // };

  

// const handleInviteCleaner = () => {
//   if (!invitedCleanerEmail && !invitedCleanerPhone) {
//     Alert.alert("Error", "Email or phone is required");
//     return;
//   }

//   const tempId = uuidv4();

//   // 1️⃣ relationship
//   setPreferredCleaners(prev => [
//     ...prev,
//     { id: tempId, type: "invited" }
//   ]);

//   // 2️⃣ contact info
//   setInvitedCleaners(prev => [
//     ...prev,
//     {
//       tempId,
//       email: invitedCleanerEmail || null,
//       phone: invitedCleanerPhone || null
//     }
//   ]);

//   setInvitedCleanerEmail("");
//   setInvitedCleanerPhone("");
// };
    
  
//     // Handle modal close and update state
//     const handleCloseModal = () => {
//       setRoomDetails((prev) =>
//         prev.map((room) => ({
//           ...room,
//           size_range: getRoomSizeCategory(room.size),
//         }))
//       );
//       setModalVisible(false);
//     };
  
//     return (
//       <Provider>
//         <View style={{ flex: 1, paddingHorizontal:20, backgroundColor:"white" }}>
//         <StatusBar  backgroundColor={COLORS.white}  barStyle="dark-content"/>
//           <ScrollView showsVerticalScrollIndicator={false}> 
  
//             <TextInput
//               mode="outlined"
//               label="Property Title"
//               placeholder="Property Title"
//               placeholderTextColor={COLORS.darkGray}
//               outlineColor="#CCC"
//               value={inputs.apt_name}
//               activeOutlineColor={COLORS.primary}
//               style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
//               onChangeText={text => handleChange(text, 'apt_name')}
//               onFocus={() => handleError(null, 'apt_name')}
//               iconName="email-outline"
//               error={errors.apt_name}
//             />
//             {errors.apt_name && <Text style={styles.errorText}>{errors.apt_name}</Text>}
//         {/* Address Section */}
//         {renderAddressInputs()}
//         <FloatingLabelPickerSelect
//             label="Select Property Type"
//             items={propertyList}
//             value={apt_type}
//             onValueChange={(value) => setAptType(value)}
//         />

        


            
//           <View style={styles.add_rooms}>
//               {/* Room Count Selection */}
//               <Text style={styles.label}>Select Number of Rooms</Text>
              
//               {roomDetails?.map((room, index) => (
//                 <View key={index} style={styles.roomContainer}>
//                     <View style={{ flex: 1 }}>
//                         <Text style={styles.roomType}>{room.type}</Text>
//                         <Text style={styles.roomSize}>
//                             Size: {room.size} sq ft ({room.size_range})
//                         </Text>
//                     </View>
                    
                    
//                     <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
//                         <Text>-</Text>
//                     </TouchableOpacity>
                    
//                     <Text style={styles.roomCount}>{room.number}</Text>
                    
//                     <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
//                         <Text>+</Text>
//                     </TouchableOpacity>
  
//                     {/* Display errors with optional chaining to prevent crashes */}
//                     {errors?.room_count?.[room.type] && (
//                         <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
//                     )}
//                     {errors?.room_size?.[room.type] && (
//                         <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
//                     )}
//                 </View>
//             ))}
//               {/* Confirm Button to Open Modal */}
//               <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                 <Text style={{alignSelf:'center', fontWeight:'500'}}>Adjust Size</Text>
//               </TouchableOpacity>
//               {/* <Button mode="contained" onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                 Continue
//               </Button> */}
//           </View>
          
//           <View style={styles.radioButtonMainContainer}>
//           <View>
//               <Text>Have Cleaning Supplies: </Text>
//           </View>
//           <View style={styles.radioButtonContainer}>
//               <RadioButton.Android
//                 value="yes"
//                 status={checked === 'yes' ? 'checked' : 'unchecked'}
//                 onPress={() => setChecked('yes')}
//                 color={COLORS.primary} // Customize the color if needed
//               />
//               <Text>Yes</Text>
//             </View>
//             <View style={styles.radioButtonContainer}>
//               <RadioButton.Android
//                 value="no"
//                 status={checked === 'no' ? 'checked' : 'unchecked'}
//                 onPress={() => setChecked('no')}
//                 color={COLORS.primary} // Customize the color if needed
//               />
//               <Text>No</Text>
//             </View>
//           </View>
  
//           <TextInput
//             mode="outlined"
//             label="Specific Intsruction"
//             placeholder="Specific Intsruction"
//             placeholderTextColor={COLORS.gray}
//             outlineColor="#D8D8D8"
//             value={inputs.instructions}
//             activeOutlineColor={COLORS.primary}
//             style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
//             onChangeText={text => handleChange(text, 'instructions')}
//             onFocus={() => handleError(null, 'instruction')}
//             error={errors.instructions}
//             iconName="email-outline"
//             multiline
//           />
          
          
//           <TextInput
//             label="Contact Phone Number"
//             placeholder="Contact Phone Number"
//             mode="outlined"
//             outlineColor="#CCC"
//             activeOutlineColor={COLORS.primary}
//             value={phoneNumber}
//             onChangeText={handleInputChange}
//             keyboardType="phone-pad" // Show numeric keypad on mobile
//             style={{marginBottom:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
//             onFocus={() => handleError(null, 'contack_phone')}
//             error={errors.phoneNumber}
//           />
//           {errors.contact_phone && <Text style={styles.errorText}>{errors.contact_phone}</Text>}
  
//           <TouchableOpacity onPress={() => setCleanerModalVisible(true)} style={styles.confirmButton}>
//             <Text style={{alignSelf:'center', fontWeight:'500'}}>Manage Cleaners ({preferredCleaners.length} selected)</Text>
//           </TouchableOpacity>
  
//             {/* Submit */}
//             <Button title="Add Apartment" loading={loading} onPress={onSubmit} />
//           </ScrollView>
  
//           {/* Room Size Modal using React Native Paper */}
//           <Portal>
//             <Modal visible={modalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContent}>
//               <ScrollView>
//                 <Text style={styles.modalTitle}>Adjust Room Sizes</Text>
//                 {roomDetails.map((room, index) =>
//                   room.number > 0 ? (
//                     <View key={index} style={{ marginBottom: 10 }}>
//                       <Text>{room.type} Size ({room.size_range})</Text>
//                       <Slider
//                         style={{ width: "100%", height: 20, marginLeft:0 }}
//                         minimumValue={100}
//                         maximumValue={500}
//                         step={10}
//                         value={room.size}
//                         onValueChange={(value) => handleRoomSizeChange(room.type, value)}
//                         minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                         maximumTrackTintColor={COLORS.light_gray}
//                         thumbTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                       />
//                       <Text style={styles.square_foot}>{room.size} sq ft</Text>
//                     </View>
//                   ) : null
//                 )}
//               </ScrollView>
//               <TouchableOpacity mode="contained" onPress={handleCloseModal} style={styles.submitButton}>
//                 <Text style={styles.submitButtonText}>Done</Text>
//               </TouchableOpacity>
              
//             </Modal>
//           </Portal>
//         </View>
//         {/* <CleanerManagementModal
//           visible={cleanerModalVisible}
//           onClose={() => setCleanerModalVisible(false)}
//           platformCleaners={platformCleaners}
//           preferredCleaners={preferredCleaners}
//           setPreferredCleaners={setPreferredCleaners}
//         /> */}
//         <CleanerManagementModal
//           visible={cleanerModalVisible}
//           onClose={() => setCleanerModalVisible(false)}
//           platformCleaners={platformCleaners}
//           preferredCleaners={preferredCleaners}
//           setPreferredCleaners={setPreferredCleaners}
//           invitedCleaners={invitedCleaners}         // ✅ pass current value
//           setInvitedCleaners={setInvitedCleaners}   // ✅ pass setter
//         />
//       </Provider>
//     );
// }


// const styles = {
//     label: {
//       fontSize: 14,
//       fontWeight: "400",
//       marginTop: 5,
//       color:COLORS.gray
//     },
//     input: {
//       borderBottomWidth: 1,
//       marginBottom: 15,
//       paddingVertical: 5,
//     },
//     // roomContainer: {
//     //   flexDirection: "row",
//     //   alignItems: "center",
//     //   marginVertical: 10,
//     // },
//     // roomType: {
//     //   fontSize: 14,
//     //   fontWeight: "500",
//     // },
//     // roomSize: {
//     //   fontSize: 12,
//     //   color: "gray",
//     // },
//     // counterButton: {
//     //   borderWidth: 1,
//     //   borderColor: COLORS.primary,
//     //   padding: 12,
//     //   borderRadius: 5,
//     //   height:40,
//     //   width:40
//     // },
//     confirmButton: {
//       marginTop: 20,
//       backgroundColor: COLORS.white || FALLBACK_COLORS.accent,
//       padding:10,
//       borderRadius:50,
//       borderColor:COLORS.light_gray,
//       borderWidth:1
//     },
//     submitButton: {
//       marginTop: 10,
//       backgroundColor: COLORS.primary || FALLBACK_COLORS.primary,
//       padding:10,
//       borderRadius:50
//     },
//     submitButtonText:{
//       color:'white',
//       alignSelf:'center',
//       fontWeight:'600',
//       fontSize:16
//      },
//     modalContent: {
//       backgroundColor: "white",
//       padding: 20,
//       marginHorizontal: 20,
//       borderRadius: 10,
//     },
//     modalTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//       marginBottom: 10,
//     },
//     radioButtonContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginVertical: 1,
//     },
//     radioButtonMainContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       // justifyContent:'space-around'
//     },
   
//     add_rooms:{
//       borderWidth:1,
//       borderColor:"#D8D8D8",
//       borderRadius:10,
//       padding:10,
//       marginTop:10
//     },
  
//     errorText: {
//       color: "#D32F2F",
//       fontSize: 12,
//       marginTop:2
//   },
  
  
//   square_foot:{
//     marginTop:-10,
//     fontSize:12
//   },
  
//     roomContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingBottom: 18,
//       paddingTop:5,
//       borderBottomWidth: 1,
//       borderBottomColor: "#ddd",
//   },
//     roomType: {
//         fontSize: 14,
//         fontWeight: "500",
//     },
//     roomSize: {
//         fontSize: 14,
//         color: "#666",
//     },
//     counterButton: {
//         padding: 12,
//         marginHorizontal: 5,
//         borderRadius: 5,
//         borderWidth: 1,
//         borderColor: COLORS.primary,
//         height:40
    
//     },
//     roomCount: {
//         fontSize: 14,
//         fontWeight: "500",
//         marginHorizontal: 5,
//     },
//     errorTextRoom: {
//         color: "#D32F2F",
//         fontSize: 12,
//         marginTop: 5,
//         position:"absolute",
//         left:0,
//         top:40
//     },
//     manualInputContainer: {
//       marginTop: 10,
//       borderTopWidth: 1,
//       borderTopColor: COLORS.lightGray,
//       paddingTop: 15
//     },
//     manualPrompt: {
//       color: COLORS.gray,
//       marginBottom: 10,
//       fontStyle: 'italic'
//     },
//     permissionWarningContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#FFF8E6',
//       padding: 10,
//       borderRadius: 4,
//       borderLeftWidth: 3,
//       borderLeftColor: COLORS.orange,
//       marginVertical: 10,
//     },
//     permissionWarningText: {
//       fontSize: 12,
//       color: COLORS.darkGray,
//       marginLeft: 8,
//     },
//   };




import React, { useState, useEffect, useContext, useRef } from "react";
import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
import { StyleSheet,Text, Keyboard, Alert, Platform, StatusBar, Linking,  FlatList, ScrollView, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Button from "../../components/shared/Button";
import { Modal, Portal, Provider } from "react-native-paper";
import Slider from "@react-native-community/slider"; // Fixed import
import { AuthContext } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../constants/colors";
import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from '../../secret';
import userService from "../../services/connection/userService";
import { geocodeAddress } from "../../utils/geocodeAddress";
import ROUTES from "../../constants/routes";
// import FloatingLabelPicker from "../../components/shared/FloatingLabelPicker";
import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
import { propertyList } from "../../data";
import moment from 'moment'
import AddressInput from "../../components/shared/AddressInput";
import { Icon } from 'react-native-paper';
import useLocationPermission from "../../components/shared/UseLocationPermission";
import { useNavigation } from "@react-navigation/native";
import { createDefaultChecklist, generateTasksForRoomType } from "../../utils/createDefaultChecklist";
import PlatformCleanerPicker from "../../components/host/PlatformCleanerPicker";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import CleanerManagementModal from "./CleanerManagementModal";

// Fallback Colors if COLORS is missing
const FALLBACK_COLORS = {
    primary: "#007AFF",
    accent: COLORS.deepBlue,
};

export default function AddProperty() {
    const { currentUserId } = useContext(AuthContext);

    const { hasPermission } = useLocationPermission();
    const navigation = useNavigation()
    // Room State
    const [roomDetails, setRoomDetails] = useState([
      { type: "Bedroom", number: 0, size: 120, size_range: "Small" },
      { type: "Bathroom", number: 0, size: 120, size_range: "Small" },
      { type: "Livingroom", number: 0, size: 150, size_range: "Medium" },
      { type: "Kitchen", number: 0, size: 140, size_range: "Small" }, // Added Kitchen
    ]);
  
    const[modalVisible, setModalVisible] = useState(false);
    const[aptName, setAptName] = useState("");
    const[address, setAddress] = useState("");
    const[apt_type, setAptType] = useState("");
  
    const[firstname, setFirstname] = useState("")
    const[lastname, setLastname] = useState("")
    const[email, setEmail] = useState("")
    const[avatar, setAvatar] = useState("")
    const [errors, setErrors] = useState({
      room_count: {},
      room_size: {} 
    });
  
     const[loading, setLoading] = React.useState(false);
  
  
     const[selectedValue, setSelectedValue] = useState(null);
  
    const {geolocationData} = useContext(AuthContext)
      const phoneInput = useRef(); 
      const[inputs, setInputs] = useState({
          apt_name:"",
          instructions:"",
          cleaning_supplies:"",
          contact_phone:"",
          created_on: "",
          roomInfo:[]
      })
      const[phoneNumber, setPhoneNumber] = useState('');
      const[checked, setChecked] = useState('');
      const[latitude, setLatitude] = useState(null);
      const[longitude, setLongitude] = useState(null);
      const[city, setCity] = useState(null);
      const[textInputBottomMargin, setTextInputBottomMargin] = useState(0);
  
   

      const [manualAddressRequired, setManualAddressRequired] = useState(false);
      const [autocompleteError, setAutocompleteError] = useState(null);
      const [coordinates, setCoordinates] = useState(null);
      const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
  
      const [preferredCleaners, setPreferredCleaners] = useState([]); // array of { id, name, type: 'platform'|'invited' }
      const [invitedCleanerEmail, setInvitedCleanerEmail] = useState('');
      const [invitedCleanerPhone, setInvitedCleanerPhone] = useState('');
      const [invitedCleaners, setInvitedCleaners] = useState([]);

      const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
      const [platformCleaners, setPlatformCleaners] = useState([]); // list from backend


      useEffect(() => {
        if (!coordinates?.latitude || !coordinates?.longitude) return;
      
        fetchPlatformCleaners(coordinates.latitude, coordinates.longitude);
      }, [coordinates]);

      
      const fetchPlatformCleaners = async (lat, lng) => {
        try {
          const res = await userService.getPlatformCleaners({
            latitude: lat,
            longitude: lng,
            radius: 100 // miles
          });
          console.log("Recommended cleaners-----", res.data)
          setPlatformCleaners(res.data);
        } catch (err) {
          console.log('Failed to fetch platform cleaners', err);
        }
      };


      

    // Handle autocomplete selection
    const handleAutocompleteSelect = async (selectedAddress) => {
      try {
        const { latitude, longitude } = await geocodeAddress(selectedAddress);
        setCoordinates({ latitude, longitude });
        setAddress(selectedAddress);
        setAutocompleteError(null);
        setErrors(prev => ({...prev, address: null}));
      } catch (error) {
        console.error('Geocoding failed:', error);
        setCoordinates(null);
        setAutocompleteError('Failed to verify address. Please enter manually.');
        setShowGoogleAutocomplete(false); // Hide autocomplete on error
      }
    };

    // Handle autocomplete errors
    const handleAutocompleteError = (error) => {
      if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' || 
          error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
        setAutocompleteError('Address service unavailable. Please enter manually.');
        setShowGoogleAutocomplete(false); // Hide autocomplete on error
      }
    };


    // // Handle manual address input
    // const handleManualAddressChange = (val) => {
    //   setAddress(val);
    //   // Reset coordinates when user edits manually
    //   setCoordinates(null);
    //   // Clear address error
    //   setErrors(prev => ({...prev, address: null}));
    // };

    // Handle manual address input
  const handleManualAddressChange = (val) => {
    setAddress(val);
    setCoordinates(null);
    // Clear both address errors when typing
    setErrors(prev => ({...prev, address: null}));
    setAutocompleteError(null);
  };

  // Handle manual address verification
  const handleManualVerification = (coords) => {
    setCoordinates(coords);
    // Clear all address-related errors when verified
    setErrors(prev => ({...prev, address: null}));
    setAutocompleteError(null);
  };


    
  
    useEffect(() => {
      fetchUser()
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setTextInputBottomMargin(60); // Adjust this value as needed
      });
  
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setTextInputBottomMargin(0);
      });
  
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);
  
  
  
    const fetchUser = async () => { 
      try {
        
        await userService.getUser(currentUserId)
        .then(response=> {
          const res = response.data
          setFirstname(res.firstname)
          setLastname(res.lastname)
          setEmail(res.email)
          setAvatar(res.avatar)
          setCity(res.location.city)
        })
  
      } catch(e) {
        // error reading value
      }
    }
  
  
    // Function to get room size category
    const getRoomSizeCategory = (size) => {
      if (size < 150) return "Small";
      if (size >= 150 && size <= 300) return "Medium";
      return "Large";
    };
  
    
  
    const handleRoomCountChange = (roomType, action) => {
      setRoomDetails(prevRooms =>
          prevRooms.map(room => {
              if (room.type === roomType) {
                  const newCount = action === "add" ? room.number + 1 : Math.max(0, room.number - 1);
  
                  // Remove error when a valid input is added
                  setErrors(prevErrors => ({
                      ...prevErrors,
                      room_count: {
                          ...prevErrors.room_count,
                          [roomType]: newCount > 0 ? null : prevErrors.room_count[roomType], // Remove error if valid
                      },
                  }));
  
                  return { ...room, number: newCount };
              }
              return room;
          })
      );
  };
  
    // Function to update room size using slider
    const handleRoomSizeChange = (type, size) => {
      setRoomDetails((prev) =>
        prev.map((room) =>
          room.type === type
            ? { ...room, size, size_range: getRoomSizeCategory(size) }
            : room
        )
      );
    };
  
    // Open modal only when user confirms selection
    const handleConfirmRoomSelection = () => {
      const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
      if (totalRooms > 0) {
        setModalVisible(true);
      }
    };
  
    

    // Update handleSelectedAddress (if keeping GoogleAutocomplete)
    const handleSelectedAddress = async (selectedAddress) => {
      try {
        const { latitude, longitude } = await geocodeAddress(selectedAddress);
        setCoordinates({ latitude, longitude });
        setAddress(selectedAddress);
        // Clear any address error
        setErrors(prev => ({...prev, address: null}));
      } catch (error) {
        Alert.alert('Error', 'Failed to geocode address');
        setCoordinates(null);
      }
    };

    const formatPhoneNumber = (input) => {
      const cleaned = ('' + input).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
      }
      return input;
    };
  
    const handleInputChange = (text) => {
      setPhoneNumber(formatPhoneNumber(text));
    };
  
    const handleChange = (text, input)=> {
      setInputs(prevState => ({...prevState, [input]: text}));
    }
  
  
    

    const onSubmit = async () => {
      setLoading(true);
    
      // Run frontend validations
      if (!validate()) {
        setLoading(false);
        return;
      }
    
      try {
        const owner_info = {
          firstname,
          lastname,
          email,
          userId: currentUserId,
          avatar
        };
    
        const propertyData = {
          userId: currentUserId,
          owner_info,
          apt_name: inputs.apt_name,
          instructions: inputs.instructions,
          cleaning_supplies: checked,
          contact_phone: phoneNumber.replace(/\D/g, ''),
          address,
          latitude: coordinates.latitude.toFixed(4),
          longitude: coordinates.longitude.toFixed(4),
          created_on: moment().format('YYYY-MM-DD HH:mm:ss'),
          apt_type,
          preferredCleaners: preferredCleaners.map(c => ({
            id: c.id,
            type: c.type
          })),
          invitedCleaners:invitedCleaners,
          roomDetails, // dynamic room info
          // No need for checklistId — backend will generate it
        };

        console.log("Property data-------------|-------|", propertyData)
    
        // Create the property and let backend generate checklist if missing
        const propertyResponse = await userService.addApartment(propertyData);
    
        if (propertyResponse.status === 200) {
          const { propertyId, checklistId } = propertyResponse.data;
    
          // navigation.navigate(ROUTES.host_dashboard, {
          //   successMessage: "Property created with default checklist!",
          //   propertyId,
          //   checklistId,
          // });

        } else {
          Alert.alert("Error", "Property creation failed");
        }
      } catch (err) {
        console.log("Error creating property:", err);
        Alert.alert("Error", "Something went wrong, please try again");
      } finally {
        setLoading(false);
      }
    };
  

    







    




    
  
    const handleError = (error, input) => {
      setErrors(prevState => ({...prevState, [input]: error}));
    };
  
    
  
    const validateRoomDetails = (roomDetails) => {
      let isValid = true;
      let newErrors = { room_count: {}, room_size: {} };
  
      for (const room of roomDetails) {
          if (room.number <= 0) {
              newErrors.room_count[room.type] = `${room.type} count must be greater than 0`;
              isValid = false;
          }
          if (room.size < 50 || room.size > 600) {
              newErrors.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
              isValid = false;
          }
      }
  
      setErrors((prevErrors) => ({
          ...prevErrors,
          room_count: newErrors.room_count,
          room_size: newErrors.room_size
      }));
  
      return isValid;
    };
  

  const validate = () => {
    let isValid = true;
    const newErrors = {
      apt_name: null,
      address: null,
      apt_type: null,
      contact_phone: null,
      instructions: null,
      room_count: {},
      room_size: {}
      
    };
  
    // Validate Apartment Name
    if (!inputs.apt_name.trim()) {
      newErrors.apt_name = 'Property name is required';
      isValid = false;
    }
  
  
    // Address validation
    if (!address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    } else if (!coordinates) {
      // Only show verification error if not already in manual mode
      if (showGoogleAutocomplete) {
        newErrors.address = 'Please verify address by selecting from suggestions';
      } else {
        newErrors.address = 'Please verify your address';
      }
      isValid = false;
    }
  
    // Validate Apartment Type
    if (!apt_type.trim()) {
      newErrors.apt_type = 'Property Type is required';
      isValid = false;
    }
  
    // Validate Room Details
    roomDetails.forEach((room) => {
      if (room.number <= 0) {
        newErrors.room_count[room.type] = `${room.type} count must be greater than 0`;
        isValid = false;
      }
      if (room.size < 50 || room.size > 600) {
        newErrors.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
        isValid = false;
      }
    });
  
    // Validate Phone Number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      newErrors.contact_phone = 'Enter a valid 10-digit phone number';
      isValid = false;
    }
  
    // Validate Instructions (optional but must be at least 5 chars)
    if (inputs.instructions && inputs.instructions.length < 5) {
      newErrors.instructions = 'Instructions must be at least 5 characters long';
      isValid = false;
    }
  
    // Update errors state
    setErrors(newErrors);
    return isValid;
  };
  

  

  // Render address inputs
  const renderAddressInputs = () => (
    <>
      {/* Google Autocomplete - shown only when working */}
      {showGoogleAutocomplete && (
        <GoogleAutocomplete 
          label="Property Address"
          apiKey={GOOGLE_MAPS_API_KEY}
          selected_address={handleAutocompleteSelect}
          handleError={handleAutocompleteError}
        />
      )}
      
      {/* Manual AddressInput - shown when autocomplete fails */}
      {!showGoogleAutocomplete && (
        <AddressInput
          label="Property Address"
          value={address}
          onChange={handleManualAddressChange}
          onCoordinatesSet={handleManualVerification} // Use the new handler
          error={errors.address}
        />
      )}

      

      {/* Display coordinates if verified */}
      {/* {coordinates && (
        <Text style={styles.coordinatesText}>
          Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
        </Text>
      )} */}

      {!hasPermission && (
        <View style={styles.permissionWarningContainer}>
          <Icon 
            source="alert-circle-outline" 
            size={16} 
            color={COLORS.orange} 
          />
          <Text style={styles.permissionWarningText}>
            Location permission required for address verification
          </Text>
        </View>
      )}

      {/* Error Messages */}
      {autocompleteError && !showGoogleAutocomplete && !coordinates && (
        <Text style={styles.errorText}>{autocompleteError}</Text>
      )}
      {errors.address && !coordinates && (
        <Text style={styles.errorText}>{errors.address}</Text>
      )}
    </>
  );
  
  const generateUniqueToken = () => {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10)
    );
  };

  // const handleInviteCleaner = () => {
  //   if (!invitedCleanerEmail && !invitedCleanerPhone) {
  //     Alert.alert('Error', 'Enter email or phone to invite a cleaner');
  //     return;
  //   }
  
  //   const token = generateUniqueToken(); // e.g., UUID
  //   const newInvited = {
  //     id: token, // temporary id until backend saves
  //     name: '',  // optional
  //     email: invitedCleanerEmail,
  //     phone: invitedCleanerPhone,
  //     type: 'invited',
  //     status: 'pending',
  //     inviteToken: token
  //   };
  
  //   setPreferredCleaners(prev => [...prev, newInvited]);
  //   console.log("invites-----", newInvited)
  
  //   setInvitedCleanerEmail('');
  //   setInvitedCleanerPhone('');
  //   Alert.alert('Success', 'Cleaner invite added. They will receive a link once property is saved.');
  // };

  

const handleInviteCleaner = () => {
  if (!invitedCleanerEmail && !invitedCleanerPhone) {
    Alert.alert("Error", "Email or phone is required");
    return;
  }

  const tempId = uuidv4();

  // 1️⃣ relationship
  setPreferredCleaners(prev => [
    ...prev,
    { id: tempId, type: "invited" }
  ]);

  // 2️⃣ contact info
  setInvitedCleaners(prev => [
    ...prev,
    {
      tempId,
      email: invitedCleanerEmail || null,
      phone: invitedCleanerPhone || null
    }
  ]);

  setInvitedCleanerEmail("");
  setInvitedCleanerPhone("");
};
    
  
    // Handle modal close and update state
    const handleCloseModal = () => {
      setRoomDetails((prev) =>
        prev.map((room) => ({
          ...room,
          size_range: getRoomSizeCategory(room.size),
        }))
      );
      setModalVisible(false);
    };
  
    return (
      <Provider>
        <View style={{ flex: 1, paddingHorizontal:20, backgroundColor:"white" }}>
        <StatusBar  backgroundColor={COLORS.white}  barStyle="dark-content"/>
          <ScrollView showsVerticalScrollIndicator={false}> 
  
            <TextInput
              mode="outlined"
              label="Property Title"
              placeholder="Property Title"
              placeholderTextColor={COLORS.darkGray}
              outlineColor="#CCC"
              value={inputs.apt_name}
              activeOutlineColor={COLORS.primary}
              style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
              onChangeText={text => handleChange(text, 'apt_name')}
              onFocus={() => handleError(null, 'apt_name')}
              iconName="email-outline"
              error={errors.apt_name}
            />
            {errors.apt_name && <Text style={styles.errorText}>{errors.apt_name}</Text>}
        {/* Address Section */}
        {renderAddressInputs()}

        {/* Everything below is shown only after address is verified */}
        {coordinates && (
          <>
            <FloatingLabelPickerSelect
              label="Select Property Type"
              items={propertyList}
              value={apt_type}
              onValueChange={(value) => setAptType(value)}
            />

            <View style={styles.add_rooms}>
              <Text style={styles.label}>Select Number of Rooms</Text>

              {roomDetails?.map((room, index) => (
                <View key={index} style={styles.roomContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomType}>{room.type}</Text>
                    <Text style={styles.roomSize}>
                      Size: {room.size} sq ft ({room.size_range})
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
                    <Text>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.roomCount}>{room.number}</Text>

                  <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
                    <Text>+</Text>
                  </TouchableOpacity>

                  {errors?.room_count?.[room.type] && (
                    <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
                  )}
                  {errors?.room_size?.[room.type] && (
                    <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
                <Text style={{ alignSelf: 'center', fontWeight: '500' }}>Adjust Size</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.radioButtonMainContainer}>
              <View>
                <Text>Have Cleaning Supplies: </Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton.Android
                  value="yes"
                  status={checked === 'yes' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('yes')}
                  color={COLORS.primary}
                />
                <Text>Yes</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton.Android
                  value="no"
                  status={checked === 'no' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('no')}
                  color={COLORS.primary}
                />
                <Text>No</Text>
              </View>
            </View>

            <TextInput
              mode="outlined"
              label="Specific Instruction"
              placeholder="Specific Instruction"
              placeholderTextColor={COLORS.gray}
              outlineColor="#D8D8D8"
              value={inputs.instructions}
              activeOutlineColor={COLORS.primary}
              style={{ marginBottom: 5, color: COLORS.gray, fontSize: 14, backgroundColor: "#fff" }}
              onChangeText={text => handleChange(text, 'instructions')}
              onFocus={() => handleError(null, 'instruction')}
              error={errors.instructions}
              iconName="email-outline"
              multiline
            />

            <TextInput
              label="Contact Phone Number"
              placeholder="Contact Phone Number"
              mode="outlined"
              outlineColor="#CCC"
              activeOutlineColor={COLORS.primary}
              value={phoneNumber}
              onChangeText={handleInputChange}
              keyboardType="phone-pad"
              style={{ marginBottom: 10, fontSize: 14, width: '100%', backgroundColor: "#fff" }}
              onFocus={() => handleError(null, 'contact_phone')}
              error={errors.phoneNumber}
            />
            {errors.contact_phone && <Text style={styles.errorText}>{errors.contact_phone}</Text>}

            <TouchableOpacity onPress={() => setCleanerModalVisible(true)} style={styles.confirmButton}>
              <Text style={{ alignSelf: 'center', fontWeight: '500' }}>Manage Cleaners ({preferredCleaners.length} selected)</Text>
            </TouchableOpacity>

            <Button title="Add Apartment" loading={loading} onPress={onSubmit} />
          </>
        )}
          </ScrollView>
  
          {/* Room Size Modal using React Native Paper */}
          <Portal>
            <Modal visible={modalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Adjust Room Sizes</Text>
                {roomDetails.map((room, index) =>
                  room.number > 0 ? (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text>{room.type} Size ({room.size_range})</Text>
                      <Slider
                        style={{ width: "100%", height: 20, marginLeft:0 }}
                        minimumValue={100}
                        maximumValue={500}
                        step={10}
                        value={room.size}
                        onValueChange={(value) => handleRoomSizeChange(room.type, value)}
                        minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
                        maximumTrackTintColor={COLORS.light_gray}
                        thumbTintColor={COLORS.primary || FALLBACK_COLORS.primary}
                      />
                      <Text style={styles.square_foot}>{room.size} sq ft</Text>
                    </View>
                  ) : null
                )}
              </ScrollView>
              <TouchableOpacity mode="contained" onPress={handleCloseModal} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Done</Text>
              </TouchableOpacity>
              
            </Modal>
          </Portal>
        </View>
        {/* <CleanerManagementModal
          visible={cleanerModalVisible}
          onClose={() => setCleanerModalVisible(false)}
          platformCleaners={platformCleaners}
          preferredCleaners={preferredCleaners}
          setPreferredCleaners={setPreferredCleaners}
        /> */}
        <CleanerManagementModal
          visible={cleanerModalVisible}
          onClose={() => setCleanerModalVisible(false)}
          platformCleaners={platformCleaners}
          preferredCleaners={preferredCleaners}
          setPreferredCleaners={setPreferredCleaners}
          invitedCleaners={invitedCleaners}         // ✅ pass current value
          setInvitedCleaners={setInvitedCleaners}   // ✅ pass setter
        />
      </Provider>
    );
}


const styles = {
    label: {
      fontSize: 14,
      fontWeight: "400",
      marginTop: 5,
      color:COLORS.gray
    },
    input: {
      borderBottomWidth: 1,
      marginBottom: 15,
      paddingVertical: 5,
    },
    confirmButton: {
      marginTop: 20,
      backgroundColor: COLORS.white || FALLBACK_COLORS.accent,
      padding:10,
      borderRadius:50,
      borderColor:COLORS.light_gray,
      borderWidth:1
    },
    submitButton: {
      marginTop: 10,
      backgroundColor: COLORS.primary || FALLBACK_COLORS.primary,
      padding:10,
      borderRadius:50
    },
    submitButtonText:{
      color:'white',
      alignSelf:'center',
      fontWeight:'600',
      fontSize:16
     },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      marginHorizontal: 20,
      borderRadius: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    radioButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 1,
    },
    radioButtonMainContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // justifyContent:'space-around'
    },
   
    add_rooms:{
      borderWidth:1,
      borderColor:"#D8D8D8",
      borderRadius:10,
      padding:10,
      marginTop:10
    },
  
    errorText: {
      color: "#D32F2F",
      fontSize: 12,
      marginTop:2
  },
  
  
  square_foot:{
    marginTop:-10,
    fontSize:12
  },
  
    roomContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 18,
      paddingTop:5,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
  },
    roomType: {
        fontSize: 14,
        fontWeight: "500",
    },
    roomSize: {
        fontSize: 14,
        color: "#666",
    },
    counterButton: {
        padding: 12,
        marginHorizontal: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: COLORS.primary,
        height:40
    
    },
    roomCount: {
        fontSize: 14,
        fontWeight: "500",
        marginHorizontal: 5,
    },
    errorTextRoom: {
        color: "#D32F2F",
        fontSize: 12,
        marginTop: 5,
        position:"absolute",
        left:0,
        top:40
    },
    manualInputContainer: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
      paddingTop: 15
    },
    manualPrompt: {
      color: COLORS.gray,
      marginBottom: 10,
      fontStyle: 'italic'
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
    },
    permissionWarningText: {
      fontSize: 12,
      color: COLORS.darkGray,
      marginLeft: 8,
    },
  };

