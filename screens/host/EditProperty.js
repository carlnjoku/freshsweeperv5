// import React, { useState, useEffect, useContext, useRef } from "react";
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import { StyleSheet, Text, KeyboardAvoidingView, RefreshControl, Keyboard, StatusBar, Alert, FlatList, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import Button from "../../components/shared/Button";
// import { SafeAreaView } from "react-native-safe-area-context";
// import COLORS from "../../constants/colors";
// import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import ROUTES from '../../constants/routes';
// import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
// import userService from "../../services/connection/userService";
// import moment from 'moment';
// import { AuthContext } from "../../context/AuthContext";
// import { propertyList } from "../../data";
// import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import { Modal, Portal, Provider } from "react-native-paper";
// import Slider from "@react-native-community/slider"; // Fixed import

// import AddressInput from "../../components/shared/AddressInput"; // Make sure to import
// import useLocationPermission from "../../components/shared/UseLocationPermission";
// import { Icon } from 'react-native-paper';

// export default function EditProperty({ navigation, route }) {
//     const { currentUserId } = useContext(AuthContext);
//     const { propertyId } = route.params; // Property ID from navigation params

//     const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
//     const [autocompleteError, setAutocompleteError] = useState(null);
//     const [coordinates, setCoordinates] = useState(null);
//     const { hasPermission } = useLocationPermission(); // Add location permission hook

//     const [isDataLoaded, setIsDataLoaded] = useState(false); // Add this state

//     const [refreshing, setRefreshing] = useState(false); // State for swipe-to-refresh
//     const [modalVisible, setModalVisible] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [roomDetails, setRoomDetails] = useState([]);
//     const [aptName, setAptName] = useState("");
//     const [address, setAddress] = useState("");
//     const [aptType, setAptType] = useState("");
//     const [phoneNumber, setPhoneNumber] = useState("");
//     const [instructions, setInstructions] = useState("");
//     const [checked, setChecked] = useState("");
//     const [latitude, setLatitude] = useState(null);
//     const [longitude, setLongitude] = useState(null);
//     const [errors, setErrors] = useState({});
    
  
//     // Fallback Colors if COLORS is missing
//     const FALLBACK_COLORS = {
//         primary: "#007AFF",
//         accent: COLORS.deepBlue,
//     };

    
//     useEffect(() => {
//         fetchPropertyDetails();
//     }, []);

//     // Fetch property details
//     const fetchPropertyDetails = async () => {
//         setRefreshing(true); // Start refreshing state
//         try {
//             const response = await userService.getApartmentById(propertyId);
           
//             if (response.status === 200) {
//                 const data = response.data;
                
//                 setAptName(data.apt_name);
//                 setAddress(data.address);
//                 setAptType(data.apt_type);
//                 setPhoneNumber(data.contact_phone);
//                 setChecked(data.cleaning_supplies);
//                 setInstructions(data.instructions);
//                 setRoomDetails(data.roomDetails);

//                 // Initialize coordinates from existing data
//                 if (data.latitude && data.longitude) {
//                     setCoordinates({
//                         latitude: parseFloat(data.latitude),
//                         longitude: parseFloat(data.longitude)
//                     });
//                 }
                
//                 // Assume autocomplete worked for existing property
//                 // setShowGoogleAutocomplete(true);

//                 // Mark data as loaded
//                 setIsDataLoaded(true);
//             }
//         } catch (error) {
//             console.log("Error fetching property:", error);
//         } finally {
//             setLoading(false);
//             setRefreshing(false); // Start refreshing state
//         }
//     };

//     // Function to get room size category
//     const getRoomSizeCategory = (size) => {
//         if (size < 150) return "Small";
//         if (size >= 150 && size <= 300) return "Medium";
//         return "Large";
//     };

//     const handleInputChange = (text) => {
//         setPhoneNumber(formatPhoneNumber(text));
//       };

//       const formatPhoneNumber = (input) => {
//         const cleaned = ('' + input).replace(/\D/g, '');
//         const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//         if (match) {
//           return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//         }
//         return input;
//       };
    
    
//     // Handle address selection
//     const handleSelectedAddress = async (newAddress) => {
//         try {
//             const { latitude, longitude } = await geocodeAddress(newAddress);
//             setLatitude(latitude);
//             setLongitude(longitude);
//             setAddress(newAddress);
//         } catch (error) {
//             Alert.alert('Error', 'Failed to geocode address');
//         }
//     };

//     // Handle room count changes
//     const handleRoomCountChange = (roomType, action) => {
//         setRoomDetails((prevRooms) =>
//             prevRooms.map((room) =>
//                 room.type === roomType
//                     ? { ...room, number: action === "add" ? room.number + 1 : Math.max(0, room.number - 1) }
//                     : room
//             )
//         );
//     };

//     // Open modal only when user confirms selection
//   const handleConfirmRoomSelection = () => {
//     const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
//     if (totalRooms > 0) {
//       setModalVisible(true);
//     }
//   };

//     // Handle room size changes
//     const handleRoomSizeChange = (type, size) => {
//         setRoomDetails((prev) =>
//             prev.map((room) =>
//                 room.type === type ? { ...room, size } : room
//             )
//         );
//     };

//     const handleError = (error, input) => {
//         setErrors(prevState => ({...prevState, [input]: error}));
//       };

//     // Handle modal close and update state
//     const handleCloseModal = () => {
//         setRoomDetails((prev) =>
//         prev.map((room) => ({
//             ...room,
//             size_range: getRoomSizeCategory(room.size),
//         }))
//         );
//         setModalVisible(false);
//     };

//     // Handle autocomplete selection
//     const handleAutocompleteSelect = async (selectedAddress) => {
//         try {
//             const { latitude, longitude } = await geocodeAddress(selectedAddress);
//             setCoordinates({ latitude, longitude });
//             setAddress(selectedAddress);
//             setAutocompleteError(null);
//             setErrors(prev => ({...prev, address: null}));
//         } catch (error) {
//             console.error('Geocoding failed:', error);
//             setCoordinates(null);
//             setAutocompleteError('Failed to verify address. Please enter manually.');
//             setShowGoogleAutocomplete(false); // Hide autocomplete on error
//         }
//     };

//     // Handle autocomplete errors
//     const handleAutocompleteError = (error) => {
//         if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' || 
//             error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//             setAutocompleteError('Address service unavailable. Please enter manually.');
//             setShowGoogleAutocomplete(false); // Hide autocomplete on error
//         }
//     };

//     // Handle manual address input
//     const handleManualAddressChange = (val) => {
//         setAddress(val);
//         setCoordinates(null);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     // Handle manual address verification
//     const handleManualVerification = (coords) => {
//         setCoordinates(coords);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     // Validate function
//     const validate = () => {
//         let isValid = true;
//         const errorState = {
//             apt_name: null,
//             address: null,
//             apt_type: null,
//             contact_phone: null,
//             instructions: null,
//             room_count: {},
//             room_size: {}
//         };

//         // Validate Apartment Name
//         if (!aptName.trim()) {
//             errorState.apt_name = 'Property Title is required';
//             isValid = false;
//         }

//         // Validate Address
//         if (!address.trim()) {
//             errorState.address = 'Address is required';
//             isValid = false;
//         } else if (!coordinates) {
//             errorState.address = 'Please verify your address';
//             isValid = false;
//         }

//         // Validate Apartment Type
//         if (!aptType.trim()) {
//             errorState.apt_type = 'Property Type is required';
//             isValid = false;
//         }

//         // Validate Room Details
//         roomDetails.forEach((room) => {
//             if (room.number <= 0) {
//                 errorState.room_count[room.type] = `${room.type} count must be greater than 0`;
//                 isValid = false;
//             }
//             if (room.size < 50 || room.size > 600) {
//                 errorState.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
//                 isValid = false;
//             }
//         });

//         // Validate Phone Number (10 digits)
//         const phoneRegex = /^[0-9]{10}$/;
//         const cleanedPhone = phoneNumber.replace(/\D/g, '');
//         if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
//             errorState.contact_phone = 'Enter a valid 10-digit phone number';
//             isValid = false;
//         }

//         // Validate Instructions (optional but must be at least 5 chars)
//         if (instructions && instructions.length < 5) {
//             errorState.instructions = 'Instructions must be at least 5 characters long';
//             isValid = false;
//         }

//         // Update errors state
//         setErrors(errorState);
//         return isValid;
//     };

//     // Handle update submission
//     // const handleUpdate = async () => {
//     //     setLoading(true);
        
//     //     const updatedData = {
//     //         aptId: propertyId,
//     //         apt_name: aptName,
//     //         address: address,
//     //         latitude: latitude,
//     //         longitude: longitude,
//     //         apt_type: aptType,
//     //         instructions:instructions,
//     //         contact_phone: phoneNumber,
//     //         cleaning_supplies: checked,
//     //         roomDetails: roomDetails,
//     //         updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
//     //     };

//     //     console.log(updatedData)
        

//     //     try {
//     //         const response = await userService.updateApartment(updatedData);
//     //         if (response.status === 200) {
//     //             Alert.alert("Success", "Apartment details updated successfully!");
//     //             navigation.goBack(); // Navigate back after update
//     //         }
//     //     } catch (error) {
//     //         Alert.alert("Error", "Failed to update property. Please try again.");
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     // Handle update submission
//     const handleUpdate = async () => {
//         setLoading(true);
        
//         if (!validate()) {
//             setLoading(false);
//             return;
//         }

//         const updatedData = {
//             aptId: propertyId,
//             apt_name: aptName,
//             address: address,
//             latitude: coordinates.latitude,
//             longitude: coordinates.longitude,
//             apt_type: aptType,
//             instructions:instructions,
//             contact_phone: phoneNumber,
//             cleaning_supplies: checked,
//             roomDetails: roomDetails,
//             updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
//         };

//         try {
//             const response = await userService.updateApartment(updatedData);
//             if (response.status === 200) {
//                 Alert.alert("Success", "Property details updated successfully!");
//                 navigation.goBack();
//             }
//         } catch (error) {
//             Alert.alert("Error", "Failed to update property. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Render address inputs
//     // const renderAddressInputs = () => (
//     //     <>
//     //         {/* Google Autocomplete - shown only when working */}
//     //         {showGoogleAutocomplete && (
//     //             <GoogleAutocomplete 
//     //                 label="Property Address"
//     //                 apiKey={GOOGLE_MAPS_API_KEY}
//     //                 initialValue={address}  // Pass existing address
//     //                 selected_address={handleAutocompleteSelect}
//     //                 handleError={handleAutocompleteError}
//     //             />
//     //         )}
            
//     //         {/* Manual AddressInput - shown when autocomplete fails */}
//     //         {!showGoogleAutocomplete && (
//     //             <AddressInput
//     //                 label="Property Address"
//     //                 value={address}
//     //                 onChange={handleManualAddressChange}
//     //                 onCoordinatesSet={handleManualVerification}
//     //                 error={errors.address}
//     //                 initialCoordinates={coordinates}  // Pass existing coordinates
//     //             />
//     //         )}

//     //         {/* Display coordinates if verified */}
//     //         {/* {coordinates && (
//     //             <Text style={styles.coordinatesText}>
//     //                 Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
//     //             </Text>
//     //         )} */}

//     //         {/* Location permission warning */}
//     //         {!hasPermission && (
//     //             <Text style={styles.permissionWarning}>
//     //                 Location permission required for address verification
//     //             </Text>
//     //         )}

//     //         {/* Error Messages */}
//     //         {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//     //             <Text style={styles.errorText}>{autocompleteError}</Text>
//     //         )}
//     //         {errors.address && !coordinates && (
//     //             <Text style={styles.errorText}>{errors.address}</Text>
//     //         )}
//     //     </>
//     // );

//     // Render address inputs
//     const renderAddressInputs = () => {
//         if (!isDataLoaded) {
//             // Show loader while data is loading
//             return <ActivityIndicator size="small" color={COLORS.primary} />;
//         }

//         return (
//             <>
//                 {/* Google Autocomplete - shown only when working */}
//                 {showGoogleAutocomplete && (
//                     <GoogleAutocomplete 
//                         label="Property Address"
//                         apiKey={GOOGLE_MAPS_API_KEY}
//                         initialValue={address}  // Pass existing address
//                         selected_address={handleAutocompleteSelect}
//                         handleError={handleAutocompleteError}
//                     />
//                 )}
                
//                 {/* Manual AddressInput - shown when autocomplete fails */}
//                 {!showGoogleAutocomplete && (
//                     <AddressInput
//                         label="Property Address"
//                         value={address}
//                         onChange={handleManualAddressChange}
//                         onCoordinatesSet={handleManualVerification}
//                         error={errors.address}
//                         initialCoordinates={coordinates}  // Pass existing coordinates
//                     />
//                 )}

//                 {/* Display coordinates if verified */}
//                 {/* {coordinates && (
//                     <Text style={styles.coordinatesText}>
//                         Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
//                     </Text>
//                 )} */}

//                 {/* Location permission warning */}
               
//                 {!hasPermission && (
//                 <View style={styles.permissionWarningContainer}>
//                     <Icon 
//                         source="alert-circle-outline" 
//                         size={16} 
//                         color={COLORS.orange} 
//                     />
//                     <Text style={styles.permissionWarningText}>
//                         Location permission required for address verification
//                     </Text>
//                 </View>
//                 )}

//                 {/* Error Messages */}
//                 {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//                     <Text style={styles.errorText}>{autocompleteError}</Text>
//                 )}
//                 {errors.address && !coordinates && (
//                     <Text style={styles.errorText}>{errors.address}</Text>
//                 )}
//             </>
//         );
//     };

//     return (
//         <Provider>
//         <View style={styles.container}>
//         <StatusBar translucent={false} backgroundColor={COLORS.white}  barStyle="dark-content"/>
//             <ScrollView 
//                 showsVerticalScrollIndicator={false}
//                 refreshControl={
//                     <RefreshControl refreshing={refreshing} onRefresh={fetchPropertyDetails} />
//                 }
//             >
                
//                 <TextInput
//                     mode="outlined"
//                     label="Property Title"
//                     placeholder="Property Title"
//                     placeholderTextColor={COLORS.darkGray}
//                     outlineColor="#CCC"
//                     value={aptName}
//                     activeOutlineColor={COLORS.primary}
//                     style={{marginBottom:0, fontSize:14, backgroundColor:"#fff"}}
//                     // onChangeText={text => handleAddress(text, 'apt_name')}
//                     onChangeText={setAptName}
//                     onFocus={() => handleError(null, 'apt_name')}
//                     iconName="email-outline"
//                     // error={errors.apt_name}
//                 />

                
//                 {renderAddressInputs()}
                

//                 <FloatingLabelPickerSelect
//                     label="Select Property Type"
//                     items={propertyList}
//                     value={aptType}
//                     onValueChange={(value) => setAptType(value)}
//                 />
                
                
//                 <View style={styles.add_rooms}>
//                     {/* Room Count Selection */}
//                     <Text style={styles.label}>Select Number of Rooms</Text>
                    
//                     {roomDetails?.map((room, index) => (
//                     <View key={index} style={styles.roomContainer}>
//                         <View style={{ flex: 1 }}>
//                             <Text style={styles.roomType}>{room.type}</Text>
//                             <Text style={styles.roomSize}>
//                                 Size: {room.size} sq ft ({room.size_range})
//                             </Text>
//                         </View>
                        
                        
//                         <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
//                             <Text>-</Text>
//                         </TouchableOpacity>
                        
//                         <Text style={styles.roomCount}>{room.number}</Text>
                        
//                         <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
//                             <Text>+</Text>
//                         </TouchableOpacity>

//                         {/* Display errors with optional chaining to prevent crashes */}
//                         {errors?.room_count?.[room.type] && (
//                             <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
//                         )}
//                         {errors?.room_size?.[room.type] && (
//                             <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
//                         )}
//                     </View>
//                 ))}
//                     {/* Confirm Button to Open Modal */}
//                     <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                     <Text style={{alignSelf:'center', fontWeight:'500'}}>Adjust Size</Text>
//                     </TouchableOpacity>
//                     {/* <Button mode="contained" onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                     Continue
//                     </Button> */}
//                 </View>
//                 <View style={styles.radioButtonMainContainer}>
//                     <View>
//                         <Text>Have Cleaning Supplies: </Text>
//                     </View>
//                     <View style={styles.radioButtonContainer}>
//                         <RadioButton
//                         value="yes"
//                         status={checked === 'yes' ? 'checked' : 'unchecked'}
//                         onPress={() => setChecked('yes')}
//                         color={COLORS.primary} // Customize the color if needed
//                         />
//                         <Text>Yes</Text>
//                     </View>
//                     <View style={styles.radioButtonContainer}>
//                         <RadioButton
//                         value="no"
//                         status={checked === 'no' ? 'checked' : 'unchecked'}
//                         onPress={() => setChecked('no')}
//                         color={COLORS.primary} // Customize the color if needed
//                         />
//                         <Text>No</Text>
//                     </View>
//                 </View>
                
//                 <TextInput
//                     mode="outlined"
//                     label="Specific Intsruction"
//                     placeholder="Specific Intsruction"
//                     placeholderTextColor={COLORS.gray}
//                     outlineColor="#D8D8D8"
//                     value={instructions}
//                     activeOutlineColor={COLORS.primary}
//                     style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
//                     onChangeText={setInstructions}
//                     onFocus={() => handleError(null, 'instruction')}
//                     error={errors.instructions}
//                     iconName="email-outline"
//                     multiline
//                 />
                
//                 <TextInput
//                     label="Contact Phone Number"
//                     placeholder="Contact Phone Number"
//                     mode="outlined"
//                     outlineColor="#CCC"
//                     activeOutlineColor={COLORS.primary}
//                     value={phoneNumber}
//                     onChangeText={handleInputChange}
//                     keyboardType="phone-pad" // Show numeric keypad on mobile
//                     style={{marginBottom:10, marginTop:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
//                     onFocus={() => handleError(null, 'contack_phone')}
//                     error={errors.phoneNumber}
//                 />
                
//                 <Button title="Update Property" onPress={handleUpdate} loading={loading} />

//             </ScrollView>
//             <Portal>
//           <Modal visible={modalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContent}>
//             <ScrollView>
//               <Text style={styles.modalTitle}>Adjust Room Sizes</Text>
//               {roomDetails.map((room, index) =>
//                 room.number > 0 ? (
//                   <View key={index} style={{ marginBottom: 10 }}>
//                     <Text>{room.type} Size ({room.size_range})</Text>
//                     <Slider
//                       style={{ width: "100%", height: 20, marginLeft:-20 }}
//                       minimumValue={100}
//                       maximumValue={500}
//                       step={10}
//                       value={room.size}
//                       onValueChange={(value) => handleRoomSizeChange(room.type, value)}
//                       minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                       maximumTrackTintColor="#000000"
//                       thumbTintColor={COLORS.accent || FALLBACK_COLORS.accent}
//                     />
//                     <Text style={styles.square_foot}>{room.size} sq ft</Text>
//                   </View>
//                 ) : null
//               )}
//             </ScrollView>
//             <TouchableOpacity mode="contained" onPress={handleCloseModal} style={styles.submitButton}>
//               <Text style={styles.submitButtonText}>Done</Text>
//             </TouchableOpacity>
            
//           </Modal>
//         </Portal>
//         </View>
//       </Provider>
//     );
// }

// const styles = StyleSheet.create({
//     container: { 
//         flex: 1, 
//         padding: 20, 
//         backgroundColor: "#fff" 
//     },
//     label: { 
//         fontSize: 16, 
//         fontWeight: "bold", 
//         marginTop: 10 
//     },
//     input: { 
//         backgroundColor: "#f5f5f5", 
//         borderRadius: 5, 
//         padding: 10, 
//         marginVertical: 5 
//     },
//     roomContainer: { 
//         flexDirection: "row", 
//         justifyContent: "space-between", 
//         alignItems: "center", 
//         paddingVertical: 10 
//     },
//     roomActions: { 
//         flexDirection: "row", 
//         alignItems: "center" },
//     plus: { 
//         fontSize: 20, 
//         color: COLORS.primary, 
//         paddingHorizontal: 10 },
//     minus: { 
//         fontSize: 20, 
//         color: "red", 
//         paddingHorizontal: 10 
//     },
//     add_rooms:{
//         borderWidth:1,
//         borderColor:"#D8D8D8",
//         borderRadius:10,
//         padding:10,
//         marginTop:10
//       },
//     roomContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingBottom: 15,
//         paddingTop:5,
//         borderBottomWidth: 1,
//         borderBottomColor: "#ddd",
//     },
    
//     roomType: {
//         fontSize: 14,
//         fontWeight: "500",
//     },
//     roomRange: {
//         fontSize: 12,
//         color: "#666",
//     },
//     roomSize: {
//         fontSize: 12,
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
//     confirmButton: {
//         marginTop: 20,
//         backgroundColor: COLORS.white || FALLBACK_COLORS.accent,
//         padding:10,
//         borderRadius:50,
//         borderColor:COLORS.light_gray,
//         borderWidth:1
//       },
//       submitButton: {
//         marginTop: 10,
//         backgroundColor: COLORS.primary || FALLBACK_COLORS.primary,
//         padding:10,
//         borderRadius:50
//       },
//        submitButtonText:{
//         color:'white',
//         alignSelf:'center',
//         fontWeight:'600',
//         fontSize:16
//        },
//       modalTitle: {
//         fontSize: 18,
//         fontWeight: "bold",
//         marginBottom: 10,
//       },
//       inputContainer: {
//         marginBottom: 10,
//       },
//       square_foot:{
//         marginTop:1,
//         fontSize:12
//       },
//       modalContent: {
//         backgroundColor: "white",
//         padding: 20,
//         marginHorizontal: 20,
//         borderRadius: 10,
//       },
//       modalTitle: {
//         fontSize: 18,
//         fontWeight: "bold",
//         marginBottom: 10,
//       },
//       radioButtonContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginVertical: 1,
//       },
//       radioButtonMainContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         // justifyContent:'space-around'
//       },
//       permissionWarningContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFF8E6',
//         padding: 10,
//         borderRadius: 4,
//         borderLeftWidth: 3,
//         borderLeftColor: COLORS.orange,
//         marginVertical: 10,
//       },
//       permissionWarningText: {
//         fontSize: 12,
//         color: COLORS.darkGray,
//         marginLeft: 8,
//       },
// });



// import React, { useState, useEffect, useContext, useRef } from "react";
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import { StyleSheet, Text, KeyboardAvoidingView, RefreshControl, Keyboard, StatusBar, Alert, FlatList, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import Button from "../../components/shared/Button";
// import { SafeAreaView } from "react-native-safe-area-context";
// import COLORS from "../../constants/colors";
// import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import ROUTES from '../../constants/routes';
// import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
// import userService from "../../services/connection/userService";
// import moment from 'moment';
// import { AuthContext } from "../../context/AuthContext";
// import { propertyList } from "../../data";
// import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import { Modal, Portal, Provider } from "react-native-paper";
// import Slider from "@react-native-community/slider"; // Fixed import
// import AddressInput from "../../components/shared/AddressInput";
// import useLocationPermission from "../../components/shared/UseLocationPermission";
// import { Icon } from 'react-native-paper';
// // import CleanerManagementModal from "../../components/host/CleanerManagementModal"; // adjust path
// import CleanerManagementModal from "./CleanerManagementModal";
// export default function EditProperty({ navigation, route }) {
//     const { currentUserId } = useContext(AuthContext);
//     const { propertyId } = route.params;

//     const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
//     const [autocompleteError, setAutocompleteError] = useState(null);
//     const [coordinates, setCoordinates] = useState(null);
//     const { hasPermission } = useLocationPermission();

//     const [isDataLoaded, setIsDataLoaded] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);
//     const [roomSizeModalVisible, setRoomSizeModalVisible] = useState(false); // renamed
//     const [loading, setLoading] = useState(true);
//     const [roomDetails, setRoomDetails] = useState([]);
//     const [aptName, setAptName] = useState("");
//     const [address, setAddress] = useState("");
//     const [aptType, setAptType] = useState("");
//     const [phoneNumber, setPhoneNumber] = useState("");
//     const [instructions, setInstructions] = useState("");
//     const [checked, setChecked] = useState("");
//     const [latitude, setLatitude] = useState(null);
//     const [longitude, setLongitude] = useState(null);
//     const [errors, setErrors] = useState({});

//     // State for cleaner management modal
//     const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//     const [platformCleaners, setPlatformCleaners] = useState([]);
//     const [preferredCleaners, setPreferredCleaners] = useState([]);
//     const [invitedCleaners, setInvitedCleaners] = useState([]);

//     const FALLBACK_COLORS = {
//         primary: "#007AFF",
//         accent: COLORS.deepBlue,
//     };

//     useEffect(() => {
//         fetchPropertyDetails();
//         fetchPlatformCleaners(); // load all platform cleaners
//     }, []);

//     // Fetch all platform cleaners (for the modal)
//     // const fetchPlatformCleaners = async () => {
//     //     try {
//     //         const response = await userService.getPlatformCleaners();
//     //         setPlatformCleaners(response.data || []);
//     //     } catch (error) {
//     //         console.log("Error fetching platform cleaners:", error);
//     //     }
//     // };

//     useEffect(() => {
//         if (!coordinates?.latitude || !coordinates?.longitude) return;
      
//         fetchPlatformCleaners(coordinates.latitude, coordinates.longitude);
//       }, [coordinates]);


//     const fetchPlatformCleaners = async (lat, lng) => {
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

//     // Fetch property details
//     const fetchPropertyDetails = async () => {
//         setRefreshing(true);
//         try {
//             const response = await userService.getApartmentById(propertyId);
//             if (response.status === 200) {
//                 const data = response.data;

//                 setAptName(data.apt_name);
//                 setAddress(data.address);
//                 setAptType(data.apt_type);
//                 setPhoneNumber(data.contact_phone);
//                 setChecked(data.cleaning_supplies);
//                 setInstructions(data.instructions);
//                 setRoomDetails(data.roomDetails);

//                 // Set preferred and invited cleaners if available
//                 if (data.preferredCleaners) {
//                     setPreferredCleaners(data.preferredCleaners);
//                 }
//                 // If you have invitedCleaners in your property document
//                 if (data.invitedCleaners) {
//                     setInvitedCleaners(data.invitedCleaners);
//                 }

//                 if (data.latitude && data.longitude) {
//                     setCoordinates({
//                         latitude: parseFloat(data.latitude),
//                         longitude: parseFloat(data.longitude)
//                     });
//                 }
//                 setIsDataLoaded(true);
//             }
//         } catch (error) {
//             console.log("Error fetching property:", error);
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     };

//     // ... (all other existing functions remain unchanged)
//     const getRoomSizeCategory = (size) => {
//         if (size < 150) return "Small";
//         if (size >= 150 && size <= 300) return "Medium";
//         return "Large";
//     };

//     const handleInputChange = (text) => {
//         setPhoneNumber(formatPhoneNumber(text));
//     };

//     const formatPhoneNumber = (input) => {
//         const cleaned = ('' + input).replace(/\D/g, '');
//         const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//         if (match) {
//           return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//         }
//         return input;
//     };

//     const handleSelectedAddress = async (newAddress) => {
//         try {
//             const { latitude, longitude } = await geocodeAddress(newAddress);
//             setLatitude(latitude);
//             setLongitude(longitude);
//             setAddress(newAddress);
//         } catch (error) {
//             Alert.alert('Error', 'Failed to geocode address');
//         }
//     };

//     const handleRoomCountChange = (roomType, action) => {
//         setRoomDetails((prevRooms) =>
//             prevRooms.map((room) =>
//                 room.type === roomType
//                     ? { ...room, number: action === "add" ? room.number + 1 : Math.max(0, room.number - 1) }
//                     : room
//             )
//         );
//     };

//     const handleConfirmRoomSelection = () => {
//         const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
//         if (totalRooms > 0) {
//             setRoomSizeModalVisible(true);
//         }
//     };

//     const handleRoomSizeChange = (type, size) => {
//         setRoomDetails((prev) =>
//             prev.map((room) =>
//                 room.type === type ? { ...room, size } : room
//             )
//         );
//     };

//     const handleError = (error, input) => {
//         setErrors(prevState => ({...prevState, [input]: error}));
//     };

//     const handleCloseRoomModal = () => {
//         setRoomDetails((prev) =>
//         prev.map((room) => ({
//             ...room,
//             size_range: getRoomSizeCategory(room.size),
//         }))
//         );
//         setRoomSizeModalVisible(false);
//     };

//     const handleAutocompleteSelect = async (selectedAddress) => {
//         try {
//             const { latitude, longitude } = await geocodeAddress(selectedAddress);
//             setCoordinates({ latitude, longitude });
//             setAddress(selectedAddress);
//             setAutocompleteError(null);
//             setErrors(prev => ({...prev, address: null}));
//         } catch (error) {
//             console.error('Geocoding failed:', error);
//             setCoordinates(null);
//             setAutocompleteError('Failed to verify address. Please enter manually.');
//             setShowGoogleAutocomplete(false);
//         }
//     };

//     const handleAutocompleteError = (error) => {
//         if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' || 
//             error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//             setAutocompleteError('Address service unavailable. Please enter manually.');
//             setShowGoogleAutocomplete(false);
//         }
//     };

//     const handleManualAddressChange = (val) => {
//         setAddress(val);
//         setCoordinates(null);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     const handleManualVerification = (coords) => {
//         setCoordinates(coords);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     const validate = () => {
//         let isValid = true;
//         const errorState = {
//             apt_name: null,
//             address: null,
//             apt_type: null,
//             contact_phone: null,
//             instructions: null,
//             room_count: {},
//             room_size: {}
//         };

//         if (!aptName.trim()) {
//             errorState.apt_name = 'Property Title is required';
//             isValid = false;
//         }

//         if (!address.trim()) {
//             errorState.address = 'Address is required';
//             isValid = false;
//         } else if (!coordinates) {
//             errorState.address = 'Please verify your address';
//             isValid = false;
//         }

//         if (!aptType.trim()) {
//             errorState.apt_type = 'Property Type is required';
//             isValid = false;
//         }

//         roomDetails.forEach((room) => {
//             if (room.number <= 0) {
//                 errorState.room_count[room.type] = `${room.type} count must be greater than 0`;
//                 isValid = false;
//             }
//             if (room.size < 50 || room.size > 600) {
//                 errorState.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
//                 isValid = false;
//             }
//         });

//         const phoneRegex = /^[0-9]{10}$/;
//         const cleanedPhone = phoneNumber.replace(/\D/g, '');
//         if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
//             errorState.contact_phone = 'Enter a valid 10-digit phone number';
//             isValid = false;
//         }

//         if (instructions && instructions.length < 5) {
//             errorState.instructions = 'Instructions must be at least 5 characters long';
//             isValid = false;
//         }

//         setErrors(errorState);
//         return isValid;
//     };

//     const handleUpdate = async () => {
//         setLoading(true);
        
//         if (!validate()) {
//             setLoading(false);
//             return;
//         }

//         const updatedData = {
//             aptId: propertyId,
//             apt_name: aptName,
//             address: address,
//             latitude: coordinates.latitude,
//             longitude: coordinates.longitude,
//             apt_type: aptType,
//             instructions: instructions,
//             contact_phone: phoneNumber,
//             cleaning_supplies: checked,
//             roomDetails: roomDetails,
//             updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
//             // Include updated cleaners if you want to save them here
//             preferredCleaners: preferredCleaners,
//             invitedCleaners: invitedCleaners,
//         };

//         try {
//             const response = await userService.updateApartment(updatedData);
//             if (response.status === 200) {
//                 Alert.alert("Success", "Property details updated successfully!");
//                 navigation.goBack();
//             }
//         } catch (error) {
//             Alert.alert("Error", "Failed to update property. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const renderAddressInputs = () => {
//         if (!isDataLoaded) {
//             return <ActivityIndicator size="small" color={COLORS.primary} />;
//         }
//         return (
//             <>
//                 {showGoogleAutocomplete && (
//                     <GoogleAutocomplete 
//                         label="Property Address"
//                         apiKey={GOOGLE_MAPS_API_KEY}
//                         initialValue={address}
//                         selected_address={handleAutocompleteSelect}
//                         handleError={handleAutocompleteError}
//                     />
//                 )}
//                 {!showGoogleAutocomplete && (
//                     <AddressInput
//                         label="Property Address"
//                         value={address}
//                         onChange={handleManualAddressChange}
//                         onCoordinatesSet={handleManualVerification}
//                         error={errors.address}
//                         initialCoordinates={coordinates}
//                     />
//                 )}
//                 {!hasPermission && (
//                 <View style={styles.permissionWarningContainer}>
//                     <Icon source="alert-circle-outline" size={16} color={COLORS.orange} />
//                     <Text style={styles.permissionWarningText}>
//                         Location permission required for address verification
//                     </Text>
//                 </View>
//                 )}
//                 {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//                     <Text style={styles.errorText}>{autocompleteError}</Text>
//                 )}
//                 {errors.address && !coordinates && (
//                     <Text style={styles.errorText}>{errors.address}</Text>
//                 )}
//             </>
//         );
//     };

//     return (
//         <Provider>
//             <View style={styles.container}>
//                 <StatusBar translucent={false} backgroundColor={COLORS.white} barStyle="dark-content"/>
//                 <ScrollView 
//                     showsVerticalScrollIndicator={false}
//                     refreshControl={
//                         <RefreshControl refreshing={refreshing} onRefresh={fetchPropertyDetails} />
//                     }
//                 >
//                     <TextInput
//                         mode="outlined"
//                         label="Property Title"
//                         placeholder="Property Title"
//                         placeholderTextColor={COLORS.darkGray}
//                         outlineColor="#CCC"
//                         value={aptName}
//                         activeOutlineColor={COLORS.primary}
//                         style={{marginBottom:0, fontSize:14, backgroundColor:"#fff"}}
//                         onChangeText={setAptName}
//                         onFocus={() => handleError(null, 'apt_name')}
//                     />

//                     {renderAddressInputs()}

//                     <FloatingLabelPickerSelect
//                         label="Select Property Type"
//                         items={propertyList}
//                         value={aptType}
//                         onValueChange={(value) => setAptType(value)}
//                     />

//                     <View style={styles.add_rooms}>
//                         <Text style={styles.label}>Select Number of Rooms</Text>
//                         {roomDetails?.map((room, index) => (
//                             <View key={index} style={styles.roomContainer}>
//                                 <View style={{ flex: 1 }}>
//                                     <Text style={styles.roomType}>{room.type}</Text>
//                                     <Text style={styles.roomSize}>
//                                         Size: {room.size} sq ft ({room.size_range})
//                                     </Text>
//                                 </View>
//                                 <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
//                                     <Text style={styles.buttonSign}>-</Text>
//                                 </TouchableOpacity>
//                                 <Text style={styles.roomCount}>{room.number}</Text>
//                                 <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
//                                     <Text style={styles.buttonSign}>+</Text>
//                                 </TouchableOpacity>
//                                 {errors?.room_count?.[room.type] && (
//                                     <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
//                                 )}
//                                 {errors?.room_size?.[room.type] && (
//                                     <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
//                                 )}
//                             </View>
//                         ))}
//                         <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                             <Text style={{alignSelf:'center', fontWeight:'500'}}>Adjust Size</Text>
//                         </TouchableOpacity>
//                     </View>

//                     <View style={styles.radioButtonMainContainer}>
//                         <View><Text>Have Cleaning Supplies: </Text></View>
//                         <View style={styles.radioButtonContainer}>
//                             <RadioButton
//                                 value="yes"
//                                 status={checked === 'yes' ? 'checked' : 'unchecked'}
//                                 onPress={() => setChecked('yes')}
//                                 color={COLORS.primary}
//                             />
//                             <Text>Yes</Text>
//                         </View>
//                         <View style={styles.radioButtonContainer}>
//                             <RadioButton
//                                 value="no"
//                                 status={checked === 'no' ? 'checked' : 'unchecked'}
//                                 onPress={() => setChecked('no')}
//                                 color={COLORS.primary}
//                             />
//                             <Text>No</Text>
//                         </View>
//                     </View>

//                     <TextInput
//                         mode="outlined"
//                         label="Specific Instructions"
//                         placeholder="Specific Instructions"
//                         placeholderTextColor={COLORS.gray}
//                         outlineColor="#D8D8D8"
//                         value={instructions}
//                         activeOutlineColor={COLORS.primary}
//                         style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
//                         onChangeText={setInstructions}
//                         onFocus={() => handleError(null, 'instruction')}
//                         error={errors.instructions}
//                         multiline
//                     />

//                     <TextInput
//                         label="Contact Phone Number"
//                         placeholder="Contact Phone Number"
//                         mode="outlined"
//                         outlineColor="#CCC"
//                         activeOutlineColor={COLORS.primary}
//                         value={phoneNumber}
//                         onChangeText={handleInputChange}
//                         keyboardType="phone-pad"
//                         style={{marginBottom:10, marginTop:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
//                         onFocus={() => handleError(null, 'contack_phone')}
//                         error={errors.phoneNumber}
//                     />

//                     {/* Button to open cleaner management modal */}
//                     <TouchableOpacity style={styles.cleanerButton} onPress={() => setCleanerModalVisible(true)}>
//                         <Text style={styles.cleanerButtonText}>Manage Cleaners</Text>
//                     </TouchableOpacity>

//                     <Button title="Update Property" onPress={handleUpdate} loading={loading} />
//                 </ScrollView>

//                 {/* Room size modal */}
//                 <Portal>
//                     <Modal visible={roomSizeModalVisible} onDismiss={handleCloseRoomModal} contentContainerStyle={styles.modalContent}>
//                         <ScrollView>
//                             <Text style={styles.modalTitle}>Adjust Room Sizes</Text>
//                             {roomDetails.map((room, index) =>
//                                 room.number > 0 ? (
//                                     <View key={index} style={{ marginBottom: 10 }}>
//                                         <Text>{room.type} Size ({room.size_range})</Text>
//                                         <Slider
//                                             style={{ width: "100%", height: 20, marginLeft:-20 }}
//                                             minimumValue={100}
//                                             maximumValue={500}
//                                             step={10}
//                                             value={room.size}
//                                             onValueChange={(value) => handleRoomSizeChange(room.type, value)}
//                                             minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                                             maximumTrackTintColor="#000000"
//                                             thumbTintColor={COLORS.accent || FALLBACK_COLORS.accent}
//                                         />
//                                         <Text style={styles.square_foot}>{room.size} sq ft</Text>
//                                     </View>
//                                 ) : null
//                             )}
//                         </ScrollView>
//                         <TouchableOpacity mode="contained" onPress={handleCloseRoomModal} style={styles.submitButton}>
//                             <Text style={styles.submitButtonText}>Done</Text>
//                         </TouchableOpacity>
//                     </Modal>
//                 </Portal>

//                 {/* Cleaner management modal */}
//                 <CleanerManagementModal
//                     visible={cleanerModalVisible}
//                     onClose={() => setCleanerModalVisible(false)}
//                     platformCleaners={platformCleaners}
//                     preferredCleaners={preferredCleaners}
//                     setPreferredCleaners={setPreferredCleaners}
//                     invitedCleaners={invitedCleaners}
//                     setInvitedCleaners={setInvitedCleaners}
//                 />
//             </View>
//         </Provider>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//     label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
//     input: { backgroundColor: "#f5f5f5", borderRadius: 5, padding: 10, marginVertical: 5 },
//     roomContainer: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: "#ddd",
//         flexWrap: 'wrap',
//     },
//     roomActions: { flexDirection: "row", alignItems: "center" },
//     plus: { fontSize: 20, color: COLORS.primary, paddingHorizontal: 10 },
//     minus: { fontSize: 20, color: "red", paddingHorizontal: 10 },
//     add_rooms: {
//         borderWidth: 1,
//         borderColor: "#D8D8D8",
//         borderRadius: 10,
//         padding: 10,
//         marginTop: 10,
//     },
//     roomType: { fontSize: 14, fontWeight: "500" },
//     roomRange: { fontSize: 12, color: "#666" },
//     roomSize: { fontSize: 12, color: "#666" },
    





//     counterContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 12
//       },
      
//       counterButton: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         borderWidth: 1,
//         borderColor: COLORS.light_gray_1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: COLORS.light_gray_1,
      
//         shadowColor: "#000",
//         shadowOpacity: 0.08,
//         shadowOffset: { width: 0, height: 1 },
//         shadowRadius: 1,
//         elevation: 1
//       },
      
//       counterText: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "#222"
//       },
      
//       buttonSign:{
//         fontSize:18
//       },
//       roomCount: {
//         fontSize: 14,
//         fontWeight: "500",
//         minWidth: 24,
//         color:COLORS.gray,
//         textAlign: "center"
//       },






    
//     errorTextRoom: {
//         color: "#D32F2F",
//         fontSize: 12,
//         marginTop: 5,
//         position: "absolute",
//         left: 0,
//         top: 40,
//     },
//     confirmButton: {
//         marginTop: 20,
//         backgroundColor: COLORS.white,
//         padding: 10,
//         borderRadius: 50,
//         borderColor: COLORS.light_gray,
//         borderWidth: 1,
//     },
//     submitButton: {
//         marginTop: 10,
//         backgroundColor: COLORS.primary,
//         padding: 10,
//         borderRadius: 50,
//     },
//     submitButtonText: {
//         color: 'white',
//         alignSelf: 'center',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
//     inputContainer: { marginBottom: 10 },
//     square_foot: { marginTop: 1, fontSize: 12 },
//     modalContent: { backgroundColor: "white", padding: 20, marginHorizontal: 20, borderRadius: 10 },
//     radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
//     radioButtonMainContainer: { flexDirection: 'row', alignItems: 'center' },
//     permissionWarningContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFF8E6',
//         padding: 10,
//         borderRadius: 4,
//         borderLeftWidth: 3,
//         borderLeftColor: COLORS.orange,
//         marginVertical: 10,
//     },
//     permissionWarningText: { fontSize: 12, color: COLORS.darkGray, marginLeft: 8 },
//     cleanerButton: {
//         marginVertical: 10,
//         padding: 15,
//         borderRadius: 10,
//         backgroundColor: COLORS.primary + '20',
//         borderWidth: 1,
//         borderColor: COLORS.primary,
//         alignItems: 'center',
//     },
//     cleanerButtonText: {
//         color: COLORS.primary,
//         fontWeight: '600',
//         fontSize: 16,
//     },
// });



// import React, { useState, useEffect, useContext, useRef } from "react";
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import { StyleSheet, Text, KeyboardAvoidingView, RefreshControl, Keyboard, StatusBar, Alert, FlatList, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import Button from "../../components/shared/Button";
// import { SafeAreaView } from "react-native-safe-area-context";
// import COLORS from "../../constants/colors";
// import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import ROUTES from '../../constants/routes';
// import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
// import userService from "../../services/connection/userService";
// import moment from 'moment';
// import { AuthContext } from "../../context/AuthContext";
// import { propertyList } from "../../data";
// import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import { Modal, Portal, Provider } from "react-native-paper";
// import Slider from "@react-native-community/slider";
// import AddressInput from "../../components/shared/AddressInput";
// import useLocationPermission from "../../components/shared/UseLocationPermission";
// import { Icon } from 'react-native-paper';
// import CleanerManagementModal from "./CleanerManagementModal";

// export default function EditProperty({ navigation, route }) {
//     const { currentUserId, userToken } = useContext(AuthContext);
//     const { propertyId } = route.params; // Property ID from navigation params

//     const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
//     const [autocompleteError, setAutocompleteError] = useState(null);
//     const [coordinates, setCoordinates] = useState(null);
//     const { hasPermission } = useLocationPermission();

//     const [isDataLoaded, setIsDataLoaded] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);
//     const [roomSizeModalVisible, setRoomSizeModalVisible] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [roomDetails, setRoomDetails] = useState([]);
//     const [aptName, setAptName] = useState("");
//     const [address, setAddress] = useState("");
//     const [aptType, setAptType] = useState("");
//     const [phoneNumber, setPhoneNumber] = useState("");
//     const [instructions, setInstructions] = useState("");
//     const [checked, setChecked] = useState("");
//     const [latitude, setLatitude] = useState(null);
//     const [longitude, setLongitude] = useState(null);
//     const [errors, setErrors] = useState({});

//     // State for cleaner management modal
//     const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//     const [platformCleaners, setPlatformCleaners] = useState([]);
//     const [preferredCleaners, setPreferredCleaners] = useState([]);
//     const [invitedCleaners, setInvitedCleaners] = useState([]);

//     const FALLBACK_COLORS = {
//         primary: "#007AFF",
//         accent: COLORS.deepBlue,
//     };

//     useEffect(() => {
//         fetchPropertyDetails();
//     }, []);

//     // Fetch platform cleaners when coordinates change
//     useEffect(() => {
//         if (coordinates?.latitude && coordinates?.longitude) {
//             fetchPlatformCleaners(coordinates.latitude, coordinates.longitude);
//         }
//     }, [coordinates]);

//     const fetchPlatformCleaners = async (lat, lng) => {
//         try {
//             const res = await userService.getPlatformCleaners({
//                 latitude: lat,
//                 longitude: lng,
//                 radius: 100 // miles
//             });
//             setPlatformCleaners(res.data || []);
//         } catch (err) {
//             console.log('Failed to fetch platform cleaners', err);
//         }
//     };

//     // Fetch property details
//     const fetchPropertyDetails = async () => {
//         setRefreshing(true);
//         try {
//             const response = await userService.getApartmentById(propertyId);
//             if (response.status === 200) {
//                 const data = response.data;

//                 setAptName(data.apt_name);
//                 setAddress(data.address);
//                 setAptType(data.apt_type);
//                 setPhoneNumber(data.contact_phone);
//                 setChecked(data.cleaning_supplies);
//                 setInstructions(data.instructions);
//                 setRoomDetails(data.roomDetails);

//                 // Set preferred and invited cleaners if available
//                 if (data.preferredCleaners) {
//                     setPreferredCleaners(data.preferredCleaners);
//                 }
//                 if (data.invitedCleaners) {
//                     setInvitedCleaners(data.invitedCleaners);
//                 }

//                 if (data.latitude && data.longitude) {
//                     setCoordinates({
//                         latitude: parseFloat(data.latitude),
//                         longitude: parseFloat(data.longitude)
//                     });
//                 }

//                 setIsDataLoaded(true);
//             }
//         } catch (error) {
//             console.log("Error fetching property:", error);
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     };

//     // ... (all other existing functions remain unchanged)
//     const getRoomSizeCategory = (size) => {
//         if (size < 150) return "Small";
//         if (size >= 150 && size <= 300) return "Medium";
//         return "Large";
//     };

//     const handleInputChange = (text) => {
//         setPhoneNumber(formatPhoneNumber(text));
//     };

//     const formatPhoneNumber = (input) => {
//         const cleaned = ('' + input).replace(/\D/g, '');
//         const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//         if (match) {
//           return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//         }
//         return input;
//     };

//     const handleRoomCountChange = (roomType, action) => {
//         setRoomDetails((prevRooms) =>
//             prevRooms.map((room) =>
//                 room.type === roomType
//                     ? { ...room, number: action === "add" ? room.number + 1 : Math.max(0, room.number - 1) }
//                     : room
//             )
//         );
//     };

//     const handleConfirmRoomSelection = () => {
//         const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
//         if (totalRooms > 0) {
//             setRoomSizeModalVisible(true);
//         }
//     };

//     const handleRoomSizeChange = (type, size) => {
//         setRoomDetails((prev) =>
//             prev.map((room) =>
//                 room.type === type ? { ...room, size } : room
//             )
//         );
//     };

//     const handleError = (error, input) => {
//         setErrors(prevState => ({...prevState, [input]: error}));
//     };

//     const handleCloseRoomModal = () => {
//         setRoomDetails((prev) =>
//         prev.map((room) => ({
//             ...room,
//             size_range: getRoomSizeCategory(room.size),
//         }))
//         );
//         setRoomSizeModalVisible(false);
//     };

//     const handleAutocompleteSelect = async (selectedAddress) => {
//         try {
//             const { latitude, longitude } = await geocodeAddress(selectedAddress);
//             setCoordinates({ latitude, longitude });
//             setAddress(selectedAddress);
//             setAutocompleteError(null);
//             setErrors(prev => ({...prev, address: null}));
//         } catch (error) {
//             console.error('Geocoding failed:', error);
//             setCoordinates(null);
//             setAutocompleteError('Failed to verify address. Please enter manually.');
//             setShowGoogleAutocomplete(false);
//         }
//     };

//     const handleAutocompleteError = (error) => {
//         if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' || 
//             error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//             setAutocompleteError('Address service unavailable. Please enter manually.');
//             setShowGoogleAutocomplete(false);
//         }
//     };

//     const handleManualAddressChange = (val) => {
//         setAddress(val);
//         setCoordinates(null);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     const handleManualVerification = (coords) => {
//         setCoordinates(coords);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     const validate = () => {
//         let isValid = true;
//         const errorState = {
//             apt_name: null,
//             address: null,
//             apt_type: null,
//             contact_phone: null,
//             instructions: null,
//             room_count: {},
//             room_size: {}
//         };

//         if (!aptName.trim()) {
//             errorState.apt_name = 'Property Title is required';
//             isValid = false;
//         }

//         if (!address.trim()) {
//             errorState.address = 'Address is required';
//             isValid = false;
//         } else if (!coordinates) {
//             errorState.address = 'Please verify your address';
//             isValid = false;
//         }

//         if (!aptType.trim()) {
//             errorState.apt_type = 'Property Type is required';
//             isValid = false;
//         }

//         roomDetails.forEach((room) => {
//             if (room.number <= 0) {
//                 errorState.room_count[room.type] = `${room.type} count must be greater than 0`;
//                 isValid = false;
//             }
//             if (room.size < 50 || room.size > 600) {
//                 errorState.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
//                 isValid = false;
//             }
//         });

//         const phoneRegex = /^[0-9]{10}$/;
//         const cleanedPhone = phoneNumber.replace(/\D/g, '');
//         if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
//             errorState.contact_phone = 'Enter a valid 10-digit phone number';
//             isValid = false;
//         }

//         if (instructions && instructions.length < 5) {
//             errorState.instructions = 'Instructions must be at least 5 characters long';
//             isValid = false;
//         }

//         setErrors(errorState);
//         return isValid;
//     };

//     const handleUpdate = async () => {
//         setLoading(true);
        
//         if (!validate()) {
//             setLoading(false);
//             return;
//         }

//         const updatedData = {
//             aptId: propertyId,
//             apt_name: aptName,
//             address: address,
//             latitude: coordinates.latitude,
//             longitude: coordinates.longitude,
//             apt_type: aptType,
//             instructions: instructions,
//             contact_phone: phoneNumber,
//             cleaning_supplies: checked,
//             roomDetails: roomDetails,
//             updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
//             preferredCleaners: preferredCleaners,
//             invitedCleaners: invitedCleaners,
//         };

//         try {
//             const response = await userService.updateApartment(updatedData, userToken);
//             if (response.status === 200) {
//                 Alert.alert("Success", "Property details updated successfully!");
//                 navigation.goBack();
//             }
//         } catch (error) {
//             Alert.alert("Error", "Failed to update property. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const renderAddressInputs = () => {
//         if (!isDataLoaded) {
//             return <ActivityIndicator size="small" color={COLORS.primary} />;
//         }
//         return (
//             <>
//                 {showGoogleAutocomplete && (
//                     <GoogleAutocomplete 
//                         label="Property Address"
//                         apiKey={GOOGLE_MAPS_API_KEY}
//                         initialValue={address}
//                         selected_address={handleAutocompleteSelect}
//                         handleError={handleAutocompleteError}
//                     />
//                 )}
//                 {!showGoogleAutocomplete && (
//                     <AddressInput
//                         label="Property Address"
//                         value={address}
//                         onChange={handleManualAddressChange}
//                         onCoordinatesSet={handleManualVerification}
//                         error={errors.address}
//                         initialCoordinates={coordinates}
//                     />
//                 )}
//                 {!hasPermission && (
//                 <View style={styles.permissionWarningContainer}>
//                     <Icon source="alert-circle-outline" size={16} color={COLORS.orange} />
//                     <Text style={styles.permissionWarningText}>
//                         Location permission required for address verification
//                     </Text>
//                 </View>
//                 )}
//                 {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//                     <Text style={styles.errorText}>{autocompleteError}</Text>
//                 )}
//                 {errors.address && !coordinates && (
//                     <Text style={styles.errorText}>{errors.address}</Text>
//                 )}
//             </>
//         );
//     };

//     return (
//         <Provider>
//             <View style={styles.container}>
//                 <StatusBar translucent={false} backgroundColor={COLORS.white} barStyle="dark-content"/>
//                 <ScrollView 
//                     showsVerticalScrollIndicator={false}
//                     refreshControl={
//                         <RefreshControl refreshing={refreshing} onRefresh={fetchPropertyDetails} />
//                     }
//                 >
//                     <TextInput
//                         mode="outlined"
//                         label="Property Title"
//                         placeholder="Property Title"
//                         placeholderTextColor={COLORS.darkGray}
//                         outlineColor="#CCC"
//                         value={aptName}
//                         activeOutlineColor={COLORS.primary}
//                         style={{marginBottom:0, fontSize:14, backgroundColor:"#fff"}}
//                         onChangeText={setAptName}
//                         onFocus={() => handleError(null, 'apt_name')}
//                         error={errors.apt_name}
//                     />
//                     {errors.apt_name && <Text style={styles.errorText}>{errors.apt_name}</Text>}

//                     {renderAddressInputs()}

//                     <FloatingLabelPickerSelect
//                         label="Select Property Type"
//                         items={propertyList}
//                         value={aptType}
//                         onValueChange={(value) => setAptType(value)}
//                     />

//                     <View style={styles.add_rooms}>
//                         <Text style={styles.label}>Select Number of Rooms</Text>
//                         {roomDetails?.map((room, index) => (
//                             <View key={index} style={styles.roomContainer}>
//                                 <View style={{ flex: 1 }}>
//                                     <Text style={styles.roomType}>{room.type}</Text>
//                                     <Text style={styles.roomSize}>
//                                         Size: {room.size} sq ft ({room.size_range})
//                                     </Text>
//                                 </View>
//                                 <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
//                                     <Text style={styles.buttonSign}>-</Text>
//                                 </TouchableOpacity>
//                                 <Text style={styles.roomCount}>{room.number}</Text>
//                                 <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
//                                     <Text style={styles.buttonSign}>+</Text>
//                                 </TouchableOpacity>
//                                 {errors?.room_count?.[room.type] && (
//                                     <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
//                                 )}
//                                 {errors?.room_size?.[room.type] && (
//                                     <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
//                                 )}
//                             </View>
//                         ))}
//                         <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                             <Text style={{alignSelf:'center', fontWeight:'500'}}>Adjust Size</Text>
//                         </TouchableOpacity>
//                     </View>

//                     <View style={styles.radioButtonMainContainer}>
//                         <View><Text>Have Cleaning Supplies: </Text></View>
//                         <View style={styles.radioButtonContainer}>
//                             <RadioButton
//                                 value="yes"
//                                 status={checked === 'yes' ? 'checked' : 'unchecked'}
//                                 onPress={() => setChecked('yes')}
//                                 color={COLORS.primary}
//                             />
//                             <Text>Yes</Text>
//                         </View>
//                         <View style={styles.radioButtonContainer}>
//                             <RadioButton
//                                 value="no"
//                                 status={checked === 'no' ? 'checked' : 'unchecked'}
//                                 onPress={() => setChecked('no')}
//                                 color={COLORS.primary}
//                             />
//                             <Text>No</Text>
//                         </View>
//                     </View>

//                     <TextInput
//                         mode="outlined"
//                         label="Specific Instructions"
//                         placeholder="Specific Instructions"
//                         placeholderTextColor={COLORS.gray}
//                         outlineColor="#D8D8D8"
//                         value={instructions}
//                         activeOutlineColor={COLORS.primary}
//                         style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
//                         onChangeText={setInstructions}
//                         onFocus={() => handleError(null, 'instruction')}
//                         error={errors.instructions}
//                         multiline
//                     />
//                     {errors.instructions && <Text style={styles.errorText}>{errors.instructions}</Text>}

//                     <TextInput
//                         label="Contact Phone Number"
//                         placeholder="Contact Phone Number"
//                         mode="outlined"
//                         outlineColor="#CCC"
//                         activeOutlineColor={COLORS.primary}
//                         value={phoneNumber}
//                         onChangeText={handleInputChange}
//                         keyboardType="phone-pad"
//                         style={{marginBottom:10, marginTop:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
//                         onFocus={() => handleError(null, 'contact_phone')}
//                         error={errors.contact_phone}
//                     />
//                     {errors.contact_phone && <Text style={styles.errorText}>{errors.contact_phone}</Text>}

//                     <TouchableOpacity style={styles.cleanerButton} onPress={() => setCleanerModalVisible(true)}>
//                         <Text style={styles.cleanerButtonText}>
//                             Manage Cleaners ({preferredCleaners.length} selected)
//                         </Text>
//                     </TouchableOpacity>

//                     <Button title="Update Property" onPress={handleUpdate} loading={loading} />
//                 </ScrollView>

//                 {/* Room size modal */}
//                 <Portal>
//                     <Modal visible={roomSizeModalVisible} onDismiss={handleCloseRoomModal} contentContainerStyle={styles.modalContent}>
//                         <ScrollView>
//                             <Text style={styles.modalTitle}>Adjust Room Sizes</Text>
//                             {roomDetails.map((room, index) =>
//                                 room.number > 0 ? (
//                                     <View key={index} style={{ marginBottom: 10 }}>
//                                         <Text>{room.type} Size ({room.size_range})</Text>
//                                         <Slider
//                                             style={{ width: "100%", height: 20 }}
//                                             minimumValue={100}
//                                             maximumValue={500}
//                                             step={10}
//                                             value={room.size}
//                                             onValueChange={(value) => handleRoomSizeChange(room.type, value)}
//                                             minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                                             maximumTrackTintColor="#000000"
//                                             thumbTintColor={COLORS.accent || FALLBACK_COLORS.accent}
//                                         />
//                                         <Text style={styles.square_foot}>{room.size} sq ft</Text>
//                                     </View>
//                                 ) : null
//                             )}
//                         </ScrollView>
//                         <TouchableOpacity mode="contained" onPress={handleCloseRoomModal} style={styles.submitButton}>
//                             <Text style={styles.submitButtonText}>Done</Text>
//                         </TouchableOpacity>
//                     </Modal>
//                 </Portal>

//                 {/* Cleaner management modal */}
//                 <CleanerManagementModal
//                     visible={cleanerModalVisible}
//                     onClose={() => setCleanerModalVisible(false)}
//                     platformCleaners={platformCleaners}
//                     preferredCleaners={preferredCleaners}
//                     setPreferredCleaners={setPreferredCleaners}
//                     invitedCleaners={invitedCleaners}
//                     setInvitedCleaners={setInvitedCleaners}
//                 />
//             </View>
//         </Provider>
//     );
// }

// // Styles remain the same as before, plus additional styles for cleaner button
// const styles = StyleSheet.create({
//     container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//     label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
//     input: { backgroundColor: "#f5f5f5", borderRadius: 5, padding: 10, marginVertical: 5 },
//     roomContainer: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: "#ddd",
//         flexWrap: 'wrap',
//     },
//     add_rooms: {
//         borderWidth: 1,
//         borderColor: "#D8D8D8",
//         borderRadius: 10,
//         padding: 10,
//         marginTop: 10,
//     },
//     roomType: { fontSize: 14, fontWeight: "500" },
//     roomSize: { fontSize: 12, color: "#666" },
    
    
//     counterButton: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         borderWidth: 1,
//         borderColor: COLORS.light_gray_1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: COLORS.light_gray_1,
      
//         shadowColor: "#000",
//         shadowOpacity: 0.08,
//         shadowOffset: { width: 0, height: 1 },
//         shadowRadius: 1,
//         elevation: 1
//       },
      
//       counterText: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "#222"
//       },
      
//       buttonSign:{
//         fontSize:18
//       },
//       roomCount: {
//         fontSize: 14,
//         fontWeight: "500",
//         minWidth: 24,
//         color:COLORS.gray,
//         textAlign: "center"
//       },


//     errorTextRoom: {
//         color: "#D32F2F",
//         fontSize: 12,
//         marginTop: 5,
//         position: "absolute",
//         left: 0,
//         top: 40,
//     },
//     confirmButton: {
//         marginTop: 20,
//         backgroundColor: COLORS.white,
//         padding: 10,
//         borderRadius: 50,
//         borderColor: COLORS.light_gray,
//         borderWidth: 1,
//     },
//     submitButton: {
//         marginTop: 10,
//         backgroundColor: COLORS.primary,
//         padding: 10,
//         borderRadius: 50,
//     },
//     submitButtonText: {
//         color: 'white',
//         alignSelf: 'center',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
//     modalContent: { backgroundColor: "white", padding: 20, marginHorizontal: 20, borderRadius: 10 },
//     radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
//     radioButtonMainContainer: { flexDirection: 'row', alignItems: 'center' },
//     errorText: { color: "#D32F2F", fontSize: 12, marginTop: 2 },
//     square_foot: { marginTop: 1, fontSize: 12 },
//     permissionWarningContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFF8E6',
//         padding: 10,
//         borderRadius: 4,
//         borderLeftWidth: 3,
//         borderLeftColor: COLORS.orange,
//         marginVertical: 10,
//     },
//     permissionWarningText: { fontSize: 12, color: COLORS.darkGray, marginLeft: 8 },
//     cleanerButton: {
//         marginVertical: 10,
//         padding: 15,
//         borderRadius: 10,
//         backgroundColor: COLORS.primary + '20',
//         borderWidth: 1,
//         borderColor: COLORS.primary,
//         alignItems: 'center',
//     },
//     cleanerButtonText: {
//         color: COLORS.primary,
//         fontWeight: '600',
//         fontSize: 16,
//     },
// });




// import React, { useState, useEffect, useContext, useRef } from "react";
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import { StyleSheet, Text, KeyboardAvoidingView, RefreshControl, Keyboard, StatusBar, Alert, FlatList, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import Button from "../../components/shared/Button";
// import { SafeAreaView } from "react-native-safe-area-context";
// import COLORS from "../../constants/colors";
// import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
// import { geocodeAddress } from '../../utils/geocodeAddress';
// import ROUTES from '../../constants/routes';
// import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
// import userService from "../../services/connection/userService";
// import moment from 'moment';
// import { AuthContext } from "../../context/AuthContext";
// import { propertyList } from "../../data";
// // import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import { Modal, Portal, Provider } from "react-native-paper";
// import Slider from "@react-native-community/slider";
// import AddressInput from "../../components/shared/AddressInput";
// import useLocationPermission from "../../components/shared/UseLocationPermission";
// import { Icon } from 'react-native-paper';
// import CleanerManagementModal from "./CleanerManagementModal";
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function EditProperty({ navigation, route }) {
//     const { currentUserId, userToken } = useContext(AuthContext);
//     const { propertyId } = route.params; // Property ID from navigation params

//     const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

//     const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
//     const [autocompleteError, setAutocompleteError] = useState(null);
//     const [coordinates, setCoordinates] = useState(null);
//     const { hasPermission } = useLocationPermission();

//     const [isDataLoaded, setIsDataLoaded] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);
//     const [roomSizeModalVisible, setRoomSizeModalVisible] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [roomDetails, setRoomDetails] = useState([]);
//     const [aptName, setAptName] = useState("");
//     const [address, setAddress] = useState("");
//     const [aptType, setAptType] = useState("");
//     const [phoneNumber, setPhoneNumber] = useState("");
//     const [instructions, setInstructions] = useState("");
//     const [checked, setChecked] = useState("");
//     const [latitude, setLatitude] = useState(null);
//     const [longitude, setLongitude] = useState(null);
//     const [errors, setErrors] = useState({});

//     // State for cleaner management modal
//     const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//     const [platformCleaners, setPlatformCleaners] = useState([]);
//     const [preferredCleaners, setPreferredCleaners] = useState([]);
//     const [invitedCleaners, setInvitedCleaners] = useState([]);

//     const FALLBACK_COLORS = {
//         primary: "#007AFF",
//         accent: COLORS.deepBlue,
//     };

//     // Helper to translate size range
//     const getTranslatedSizeRange = (range) => {
//         if (range === 'Small') return tSafe('size_small', 'Small');
//         if (range === 'Medium') return tSafe('size_medium', 'Medium');
//         if (range === 'Large') return tSafe('size_large', 'Large');
//         return range;
//     };

//     useEffect(() => {
//         fetchPropertyDetails();
//     }, []);

//     // Fetch platform cleaners when coordinates change
//     useEffect(() => {
//         if (coordinates?.latitude && coordinates?.longitude) {
//             fetchPlatformCleaners(coordinates.latitude, coordinates.longitude);
//         }
//     }, [coordinates]);

//     const fetchPlatformCleaners = async (lat, lng) => {
//         try {
//             const res = await userService.getPlatformCleaners({
//                 latitude: lat,
//                 longitude: lng,
//                 radius: 100 // miles
//             });
//             setPlatformCleaners(res.data || []);
//         } catch (err) {
//             console.log('Failed to fetch platform cleaners', err);
//         }
//     };

//     // Fetch property details
//     const fetchPropertyDetails = async () => {
//         setRefreshing(true);
//         try {
//             const response = await userService.getApartmentById(propertyId);
//             if (response.status === 200) {
//                 const data = response.data;

//                 setAptName(data.apt_name);
//                 setAddress(data.address);
//                 setAptType(data.apt_type);
//                 setPhoneNumber(data.contact_phone);
//                 setChecked(data.cleaning_supplies);
//                 setInstructions(data.instructions);
//                 setRoomDetails(data.roomDetails);

//                 // Set preferred and invited cleaners if available
//                 if (data.preferredCleaners) {
//                     setPreferredCleaners(data.preferredCleaners);
//                 }
//                 if (data.invitedCleaners) {
//                     setInvitedCleaners(data.invitedCleaners);
//                 }

//                 if (data.latitude && data.longitude) {
//                     setCoordinates({
//                         latitude: parseFloat(data.latitude),
//                         longitude: parseFloat(data.longitude)
//                     });
//                 }

//                 setIsDataLoaded(true);
//             }
//         } catch (error) {
//             console.log("Error fetching property:", error);
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     };

//     // ... (all other existing functions remain unchanged)
//     const getRoomSizeCategory = (size) => {
//         if (size < 150) return "Small";
//         if (size >= 150 && size <= 300) return "Medium";
//         return "Large";
//     };

//     const handleInputChange = (text) => {
//         setPhoneNumber(formatPhoneNumber(text));
//     };

//     const formatPhoneNumber = (input) => {
//         const cleaned = ('' + input).replace(/\D/g, '');
//         const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//         if (match) {
//           return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//         }
//         return input;
//     };

//     const handleRoomCountChange = (roomType, action) => {
//         setRoomDetails((prevRooms) =>
//             prevRooms.map((room) =>
//                 room.type === roomType
//                     ? { ...room, number: action === "add" ? room.number + 1 : Math.max(0, room.number - 1) }
//                     : room
//             )
//         );
//     };

//     const handleConfirmRoomSelection = () => {
//         const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
//         if (totalRooms > 0) {
//             setRoomSizeModalVisible(true);
//         }
//     };

//     const handleRoomSizeChange = (type, size) => {
//         setRoomDetails((prev) =>
//             prev.map((room) =>
//                 room.type === type ? { ...room, size } : room
//             )
//         );
//     };

//     const handleError = (error, input) => {
//         setErrors(prevState => ({...prevState, [input]: error}));
//     };

//     const handleCloseRoomModal = () => {
//         setRoomDetails((prev) =>
//         prev.map((room) => ({
//             ...room,
//             size_range: getRoomSizeCategory(room.size),
//         }))
//         );
//         setRoomSizeModalVisible(false);
//     };

//     const handleAutocompleteSelect = async (selectedAddress) => {
//         try {
//             const { latitude, longitude } = await geocodeAddress(selectedAddress);
//             setCoordinates({ latitude, longitude });
//             setAddress(selectedAddress);
//             setAutocompleteError(null);
//             setErrors(prev => ({...prev, address: null}));
//         } catch (error) {
//             console.error('Geocoding failed:', error);
//             setCoordinates(null);
//             setAutocompleteError(tSafe('failed_verify_address', 'Failed to verify address. Please enter manually.'));
//             setShowGoogleAutocomplete(false);
//         }
//     };

//     const handleAutocompleteError = (error) => {
//         if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' || 
//             error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//             setAutocompleteError(tSafe('address_service_unavailable', 'Address service unavailable. Please enter manually.'));
//             setShowGoogleAutocomplete(false);
//         }
//     };

//     const handleManualAddressChange = (val) => {
//         setAddress(val);
//         setCoordinates(null);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     const handleManualVerification = (coords) => {
//         setCoordinates(coords);
//         setErrors(prev => ({...prev, address: null}));
//         setAutocompleteError(null);
//     };

//     const validate = () => {
//         let isValid = true;
//         const errorState = {
//             apt_name: null,
//             address: null,
//             apt_type: null,
//             contact_phone: null,
//             instructions: null,
//             room_count: {},
//             room_size: {}
//         };

//         if (!aptName.trim()) {
//             errorState.apt_name = tSafe('property_title_required', 'Property Title is required');
//             isValid = false;
//         }

//         if (!address.trim()) {
//             errorState.address = tSafe('address_required', 'Address is required');
//             isValid = false;
//         } else if (!coordinates) {
//             errorState.address = tSafe('verify_address', 'Please verify your address');
//             isValid = false;
//         }

//         if (!aptType.trim()) {
//             errorState.apt_type = tSafe('property_type_required', 'Property Type is required');
//             isValid = false;
//         }

//         roomDetails.forEach((room) => {
//             if (room.number <= 0) {
//                 errorState.room_count[room.type] = tSafe('room_count_error', '{type} count must be greater than 0', { type: room.type });
//                 isValid = false;
//             }
//             if (room.size < 50 || room.size > 600) {
//                 errorState.room_size[room.type] = tSafe('room_size_error', '{type} size must be between 50 and 600 sq ft', { type: room.type });
//                 isValid = false;
//             }
//         });

//         const phoneRegex = /^[0-9]{10}$/;
//         const cleanedPhone = phoneNumber.replace(/\D/g, '');
//         if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
//             errorState.contact_phone = tSafe('valid_phone_required', 'Enter a valid 10-digit phone number');
//             isValid = false;
//         }

//         if (instructions && instructions.length < 5) {
//             errorState.instructions = tSafe('instructions_min_length', 'Instructions must be at least 5 characters long');
//             isValid = false;
//         }

//         setErrors(errorState);
//         return isValid;
//     };

//     const handleUpdate = async () => {
//         setLoading(true);
        
//         if (!validate()) {
//             setLoading(false);
//             return;
//         }

//         const updatedData = {
//             userId:currentUserId,
//             aptId: propertyId,
//             apt_name: aptName,
//             address: address,
//             latitude: coordinates.latitude,
//             longitude: coordinates.longitude,
//             apt_type: aptType,
//             instructions: instructions,
//             contact_phone: phoneNumber,
//             cleaning_supplies: checked,
//             roomDetails: roomDetails,
//             updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
//             preferredCleaners: preferredCleaners,
//             invitedCleaners: invitedCleaners,
//         };

//         try {
//             const response = await userService.updateApartment(updatedData, userToken);
//             if (response.status === 200) {
//                 Alert.alert(
//                     tSafe('success_title', 'Success'),
//                     tSafe('property_updated', 'Property details updated successfully!')
//                 );
//                 navigation.goBack();
//             }
//         } catch (error) {
//             Alert.alert(
//                 tSafe('error_title', 'Error'),
//                 tSafe('update_failed', 'Failed to update property. Please try again.')
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const renderAddressInputs = () => {
//         if (!isDataLoaded) {
//             return <ActivityIndicator size="small" color={COLORS.primary} />;
//         }
//         return (
//             <>
//                 {showGoogleAutocomplete && (
//                     <GoogleAutocomplete 
//                         label={tSafe('property_address_label', 'Property Address')}
//                         apiKey={GOOGLE_MAPS_API_KEY}
//                         initialValue={address}
//                         selected_address={handleAutocompleteSelect}
//                         handleError={handleAutocompleteError}
//                     />
//                 )}
//                 {!showGoogleAutocomplete && (
//                     <AddressInput
//                         label={tSafe('property_address_label', 'Property Address')}
//                         value={address}
//                         onChange={handleManualAddressChange}
//                         onCoordinatesSet={handleManualVerification}
//                         error={errors.address}
//                         initialCoordinates={coordinates}
//                     />
//                 )}
//                 {!hasPermission && (
//                 <View style={styles.permissionWarningContainer}>
//                     <Icon source="alert-circle-outline" size={16} color={COLORS.orange} />
//                     <Text style={styles.permissionWarningText}>
//                         {tSafe('location_permission_required', 'Location permission required for address verification')}
//                     </Text>
//                 </View>
//                 )}
//                 {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//                     <Text style={styles.errorText}>{autocompleteError}</Text>
//                 )}
//                 {errors.address && !coordinates && (
//                     <Text style={styles.errorText}>{errors.address}</Text>
//                 )}
//             </>
//         );
//     };

//     return (
//         <Provider>
//             <View style={styles.container}>
//                 <StatusBar translucent={false} backgroundColor={COLORS.white} barStyle="dark-content"/>
//                 <ScrollView 
//                     showsVerticalScrollIndicator={false}
//                     refreshControl={
//                         <RefreshControl refreshing={refreshing} onRefresh={fetchPropertyDetails} />
//                     }
//                 >
//                     <TextInput
//                         mode="outlined"
//                         label={tSafe('property_title_label', 'Property Title')}
//                         placeholder={tSafe('property_title_placeholder', 'Property Title')}
//                         placeholderTextColor={COLORS.darkGray}
//                         outlineColor="#CCC"
//                         value={aptName}
//                         activeOutlineColor={COLORS.primary}
//                         style={{marginBottom:0, fontSize:14, backgroundColor:"#fff"}}
//                         onChangeText={setAptName}
//                         onFocus={() => handleError(null, 'apt_name')}
//                         error={errors.apt_name}
//                     />
//                     {errors.apt_name && <Text style={styles.errorText}>{errors.apt_name}</Text>}

//                     {renderAddressInputs()}

//                     <FloatingLabelPickerSelect
//                         label={tSafe('select_property_type', 'Select Property Type')}
//                         items={propertyList}
//                         value={aptType}
//                         onValueChange={(value) => setAptType(value)}
//                     />

//                     <View style={styles.add_rooms}>
//                         <Text style={styles.label}>{tSafe('select_number_of_rooms', 'Select Number of Rooms')}</Text>
//                         {roomDetails?.map((room, index) => (
//                             <View key={index} style={styles.roomContainer}>
//                                 <View style={{ flex: 1 }}>
//                                     <Text style={styles.roomType}>{room.type}</Text>
//                                     <Text style={styles.roomSize}>
//                                         {tSafe('size_label', 'Size:')} {room.size} {tSafe('sq_ft', 'sq ft')} ({getTranslatedSizeRange(room.size_range)})
//                                     </Text>
//                                 </View>
//                                 <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
//                                     <Text style={styles.buttonSign}>-</Text>
//                                 </TouchableOpacity>
//                                 <Text style={styles.roomCount}>{room.number}</Text>
//                                 <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
//                                     <Text style={styles.buttonSign}>+</Text>
//                                 </TouchableOpacity>
//                                 {errors?.room_count?.[room.type] && (
//                                     <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
//                                 )}
//                                 {errors?.room_size?.[room.type] && (
//                                     <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
//                                 )}
//                             </View>
//                         ))}
//                         <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                             <Text style={{alignSelf:'center', fontWeight:'500'}}>{tSafe('adjust_size', 'Adjust Size')}</Text>
//                         </TouchableOpacity>
//                     </View>

//                     <View style={styles.radioButtonMainContainer}>
//                         <View><Text>{tSafe('have_cleaning_supplies', 'Have Cleaning Supplies:')}</Text></View>
//                         <View style={styles.radioButtonContainer}>
//                             <RadioButton
//                                 value="yes"
//                                 status={checked === 'yes' ? 'checked' : 'unchecked'}
//                                 onPress={() => setChecked('yes')}
//                                 color={COLORS.primary}
//                             />
//                             <Text>{tSafe('yes', 'Yes')}</Text>
//                         </View>
//                         <View style={styles.radioButtonContainer}>
//                             <RadioButton
//                                 value="no"
//                                 status={checked === 'no' ? 'checked' : 'unchecked'}
//                                 onPress={() => setChecked('no')}
//                                 color={COLORS.primary}
//                             />
//                             <Text>{tSafe('no', 'No')}</Text>
//                         </View>
//                     </View>

//                     <TextInput
//                         mode="outlined"
//                         label={tSafe('specific_instructions_label', 'Specific Instructions')}
//                         placeholder={tSafe('specific_instructions_placeholder', 'Specific Instructions')}
//                         placeholderTextColor={COLORS.gray}
//                         outlineColor="#D8D8D8"
//                         value={instructions}
//                         activeOutlineColor={COLORS.primary}
//                         style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
//                         onChangeText={setInstructions}
//                         onFocus={() => handleError(null, 'instruction')}
//                         error={errors.instructions}
//                         multiline
//                     />
//                     {errors.instructions && <Text style={styles.errorText}>{errors.instructions}</Text>}

//                     <TextInput
//                         label={tSafe('contact_phone_label', 'Contact Phone Number')}
//                         placeholder={tSafe('contact_phone_placeholder', 'Contact Phone Number')}
//                         mode="outlined"
//                         outlineColor="#CCC"
//                         activeOutlineColor={COLORS.primary}
//                         value={phoneNumber}
//                         onChangeText={handleInputChange}
//                         keyboardType="phone-pad"
//                         style={{marginBottom:10, marginTop:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
//                         onFocus={() => handleError(null, 'contact_phone')}
//                         error={errors.contact_phone}
//                     />
//                     {errors.contact_phone && <Text style={styles.errorText}>{errors.contact_phone}</Text>}

//                     {/* <TouchableOpacity style={styles.cleanerButton} onPress={() => setCleanerModalVisible(true)}>
//                         <Text style={styles.cleanerButtonText}>
//                             {tSafe('manage_cleaners', 'Manage Cleaners')} ({preferredCleaners.length} {tSafe('selected', 'selected')})
//                         </Text>
//                     </TouchableOpacity> */}

//                     <Button title={tSafe('update_property', 'Update Property')} onPress={handleUpdate} loading={loading} />
//                 </ScrollView>

//                 {/* Room size modal */}
//                 <Portal>
//                     <Modal visible={roomSizeModalVisible} onDismiss={handleCloseRoomModal} contentContainerStyle={styles.modalContent}>
//                         <ScrollView>
//                             <Text style={styles.modalTitle}>{tSafe('adjust_room_sizes', 'Adjust Room Sizes')}</Text>
//                             {roomDetails.map((room, index) =>
//                                 room.number > 0 ? (
//                                     <View key={index} style={{ marginBottom: 10 }}>
//                                         <Text>{room.type} {tSafe('size_label', 'Size')} ({getTranslatedSizeRange(room.size_range)})</Text>
//                                         <Slider
//                                             style={{ width: "100%", height: 20 }}
//                                             minimumValue={100}
//                                             maximumValue={500}
//                                             step={10}
//                                             value={room.size}
//                                             onValueChange={(value) => handleRoomSizeChange(room.type, value)}
//                                             minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                                             maximumTrackTintColor="#000000"
//                                             thumbTintColor={COLORS.accent || FALLBACK_COLORS.accent}
//                                         />
//                                         <Text style={styles.square_foot}>{room.size} {tSafe('sq_ft', 'sq ft')}</Text>
//                                     </View>
//                                 ) : null
//                             )}
//                         </ScrollView>
//                         <TouchableOpacity mode="contained" onPress={handleCloseRoomModal} style={styles.submitButton}>
//                             <Text style={styles.submitButtonText}>{tSafe('done', 'Done')}</Text>
//                         </TouchableOpacity>
//                     </Modal>
//                 </Portal>

//                 {/* Cleaner management modal */}
//                 <CleanerManagementModal
//                     visible={cleanerModalVisible}
//                     onClose={() => setCleanerModalVisible(false)}
//                     platformCleaners={platformCleaners}
//                     preferredCleaners={preferredCleaners}
//                     setPreferredCleaners={setPreferredCleaners}
//                     invitedCleaners={invitedCleaners}
//                     setInvitedCleaners={setInvitedCleaners}
//                 />
//             </View>
//         </Provider>
//     );
// }

// // Styles remain the same as before, plus additional styles for cleaner button
// const styles = StyleSheet.create({
//     container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//     label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
//     input: { backgroundColor: "#f5f5f5", borderRadius: 5, padding: 10, marginVertical: 5 },
//     roomContainer: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: "#ddd",
//         flexWrap: 'wrap',
//     },
//     add_rooms: {
//         borderWidth: 1,
//         borderColor: "#D8D8D8",
//         borderRadius: 10,
//         padding: 10,
//         marginTop: 10,
//     },
//     roomType: { fontSize: 14, fontWeight: "500" },
//     roomSize: { fontSize: 12, color: "#666" },
    
    
//     counterButton: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         borderWidth: 1,
//         borderColor: COLORS.light_gray_1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: COLORS.light_gray_1,
      
//         shadowColor: "#000",
//         shadowOpacity: 0.08,
//         shadowOffset: { width: 0, height: 1 },
//         shadowRadius: 1,
//         elevation: 1
//       },
      
//       counterText: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "#222"
//       },
      
//       buttonSign:{
//         fontSize:18
//       },
//       roomCount: {
//         fontSize: 14,
//         fontWeight: "500",
//         minWidth: 24,
//         color:COLORS.gray,
//         textAlign: "center"
//       },


//     errorTextRoom: {
//         color: "#D32F2F",
//         fontSize: 12,
//         marginTop: 5,
//         position: "absolute",
//         left: 0,
//         top: 40,
//     },
//     confirmButton: {
//         marginTop: 20,
//         backgroundColor: COLORS.white,
//         padding: 10,
//         borderRadius: 50,
//         borderColor: COLORS.light_gray,
//         borderWidth: 1,
//     },
//     submitButton: {
//         marginTop: 10,
//         backgroundColor: COLORS.primary,
//         padding: 10,
//         borderRadius: 50,
//     },
//     submitButtonText: {
//         color: 'white',
//         alignSelf: 'center',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
//     modalContent: { backgroundColor: "white", padding: 20, marginHorizontal: 20, borderRadius: 10 },
//     radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
//     radioButtonMainContainer: { flexDirection: 'row', alignItems: 'center' },
//     errorText: { color: "#D32F2F", fontSize: 12, marginTop: 2 },
//     square_foot: { marginTop: 1, fontSize: 12 },
//     permissionWarningContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFF8E6',
//         padding: 10,
//         borderRadius: 4,
//         borderLeftWidth: 3,
//         borderLeftColor: COLORS.orange,
//         marginVertical: 10,
//     },
//     permissionWarningText: { fontSize: 12, color: COLORS.darkGray, marginLeft: 8 },
//     cleanerButton: {
//         marginVertical: 10,
//         padding: 15,
//         borderRadius: 10,
//         backgroundColor: COLORS.primary + '20',
//         borderWidth: 1,
//         borderColor: COLORS.primary,
//         alignItems: 'center',
//     },
//     cleanerButtonText: {
//         color: COLORS.primary,
//         fontWeight: '600',
//         fontSize: 16,
//     },
// });





import React, {
    useState,
    useEffect,
    useContext,
    useMemo,
    useCallback,
  } from 'react';
  
  import {
    StyleSheet,
    Text,
    RefreshControl,
    StatusBar,
    Alert,
    ScrollView,
    View,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
  } from 'react-native';
  
  import {
    TextInput,
    RadioButton,
    Icon,
    Modal,
    Portal,
    Provider,
  } from 'react-native-paper';
  
  import Slider from '@react-native-community/slider';
  import { MaterialCommunityIcons } from '@expo/vector-icons';
  import moment from 'moment';
  import { SafeAreaView } from 'react-native-safe-area-context';
  
  import Button from '../../components/shared/Button';
  import GoogleAutocomplete from '../../components/shared/GooglePlacesAutocomplete';
  import AddressInput from '../../components/shared/AddressInput';
  import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
  import useLocationPermission from '../../components/shared/UseLocationPermission';
  
  import { geocodeAddress } from '../../utils/geocodeAddress';
  import { tSafe } from '../../utils/tSafe';
  
  import ROUTES from '../../constants/routes';
  import userService from '../../services/connection/userService';
  import { AuthContext } from '../../context/AuthContext';
  import { propertyList } from '../../data';
  
  import CleanerManagementModal from './CleanerManagementModal';
  
  // Existing shared Freshsweeper theme
  import { useTheme } from '../../theme/ThemeProvider';
  
  export default function EditProperty({ navigation, route }) {
    const { currentUserId, userToken } = useContext(AuthContext);
  
    const { propertyId } = route.params;
  
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
    const { theme, isDark } = useTheme();
  
    const styles = useMemo(
      () => createStyles(theme, isDark),
      [theme, isDark]
    );
  
    const { hasPermission } = useLocationPermission();
  
    // ---------------------------------------------------------
    // State
    // ---------------------------------------------------------
  
    const [showGoogleAutocomplete, setShowGoogleAutocomplete] =
      useState(true);
  
    const [autocompleteError, setAutocompleteError] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
  
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [roomSizeModalVisible, setRoomSizeModalVisible] =
      useState(false);
  
    const [loading, setLoading] = useState(true);
  
    const [roomDetails, setRoomDetails] = useState([]);
    const [aptName, setAptName] = useState('');
    const [address, setAddress] = useState('');
    const [aptType, setAptType] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [instructions, setInstructions] = useState('');
    const [checked, setChecked] = useState('');
  
    const [errors, setErrors] = useState({});
  
    // Cleaner management
  
    const [cleanerModalVisible, setCleanerModalVisible] =
      useState(false);
  
    const [platformCleaners, setPlatformCleaners] = useState([]);
    const [preferredCleaners, setPreferredCleaners] = useState([]);
    const [invitedCleaners, setInvitedCleaners] = useState([]);
  
    // ---------------------------------------------------------
    // Translated room sizes
    // ---------------------------------------------------------
  
    const getTranslatedSizeRange = (range) => {
      if (range === 'Small') {
        return tSafe('size_small', 'Small');
      }
  
      if (range === 'Medium') {
        return tSafe('size_medium', 'Medium');
      }
  
      if (range === 'Large') {
        return tSafe('size_large', 'Large');
      }
  
      return range;
    };
  
    const getRoomSizeCategory = (size) => {
      if (size < 150) return 'Small';
      if (size <= 300) return 'Medium';
  
      return 'Large';
    };
  
    // ---------------------------------------------------------
    // Fetch property details
    // ---------------------------------------------------------
  
    const fetchPropertyDetails = useCallback(async () => {
      setRefreshing(true);
  
      try {
        const response = await userService.getApartmentById(propertyId);
  
        if (response.status === 200) {
          const data = response.data;
  
          setAptName(data.apt_name || '');
          setAddress(data.address || '');
          setAptType(data.apt_type || '');
          setPhoneNumber(data.contact_phone || '');
          setChecked(data.cleaning_supplies || '');
          setInstructions(data.instructions || '');
  
          setRoomDetails(
            (data.roomDetails || []).map((room) => ({
              ...room,
              number: Number(room.number) || 0,
              size: Number(room.size) || 0,
            }))
          );
  
          setPreferredCleaners(data.preferredCleaners || []);
          setInvitedCleaners(data.invitedCleaners || []);
  
          if (
            data.latitude != null &&
            data.longitude != null
          ) {
            const initialCoordinates = {
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
            };
  
            setCoordinates(initialCoordinates);
          } else {
            setCoordinates(null);
          }
  
          setIsDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
  
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'failed_load_property',
            'Failed to load property details.'
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [propertyId]);
  
    useEffect(() => {
      fetchPropertyDetails();
    }, [fetchPropertyDetails]);
  
    // ---------------------------------------------------------
    // Fetch platform cleaners when coordinates change
    // ---------------------------------------------------------
  
    useEffect(() => {
      if (
        coordinates?.latitude != null &&
        coordinates?.longitude != null
      ) {
        fetchPlatformCleaners(
          coordinates.latitude,
          coordinates.longitude
        );
      }
    }, [coordinates?.latitude, coordinates?.longitude]);
  
    const fetchPlatformCleaners = async (lat, lng) => {
      try {
        const response = await userService.getPlatformCleaners({
          latitude: lat,
          longitude: lng,
          radius: 100,
        });
  
        setPlatformCleaners(response.data || []);
      } catch (error) {
        console.error(
          'Failed to fetch platform cleaners:',
          error
        );
      }
    };
  
    // ---------------------------------------------------------
    // Phone number
    // ---------------------------------------------------------
  
    const formatPhoneNumber = (input) => {
      const cleaned = String(input || '').replace(/\D/g, '');
  
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(
          3,
          6
        )}-${cleaned.slice(6)}`;
      }
  
      if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
          4,
          7
        )}-${cleaned.slice(7)}`;
      }
  
      return input;
    };
  
    const handleInputChange = (text) => {
      setPhoneNumber(formatPhoneNumber(text));
  
      if (errors.contact_phone) {
        setErrors((previous) => ({
          ...previous,
          contact_phone: null,
        }));
      }
    };
  
    // ---------------------------------------------------------
    // Room count and size
    // ---------------------------------------------------------
  
    const handleRoomCountChange = (roomType, action) => {
      setRoomDetails((previousRooms) =>
        previousRooms.map((room) =>
          room.type === roomType
            ? {
                ...room,
                number:
                  action === 'add'
                    ? room.number + 1
                    : Math.max(0, room.number - 1),
              }
            : room
        )
      );
  
      setErrors((previous) => ({
        ...previous,
        room_count: {
          ...previous.room_count,
          [roomType]: null,
        },
      }));
    };
  
    const handleConfirmRoomSelection = () => {
      const totalRooms = roomDetails.reduce(
        (total, room) => total + room.number,
        0
      );
  
      if (totalRooms > 0) {
        setRoomSizeModalVisible(true);
      } else {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'room_count_error',
            'At least one room must be selected.'
          )
        );
      }
    };
  
    const handleRoomSizeChange = (type, size) => {
      setRoomDetails((previous) =>
        previous.map((room) =>
          room.type === type
            ? {
                ...room,
                size,
                size_range: getRoomSizeCategory(size),
              }
            : room
        )
      );
  
      setErrors((previous) => ({
        ...previous,
        room_size: {
          ...previous.room_size,
          [type]: null,
        },
      }));
    };
  
    const handleCloseRoomModal = () => {
      setRoomDetails((previous) =>
        previous.map((room) => ({
          ...room,
          size_range: getRoomSizeCategory(room.size),
        }))
      );
  
      setRoomSizeModalVisible(false);
    };
  
    // ---------------------------------------------------------
    // Field errors
    // ---------------------------------------------------------
  
    const handleError = (error, input) => {
      setErrors((previous) => ({
        ...previous,
        [input]: error,
      }));
    };
  
    // ---------------------------------------------------------
    // Address autocomplete and verification
    // ---------------------------------------------------------
  
    const handleAutocompleteSelect = async (selectedAddress) => {
      try {
        const result = await geocodeAddress(selectedAddress);
  
        setCoordinates({
          latitude: result.latitude,
          longitude: result.longitude,
        });
  
        setAddress(selectedAddress);
        setAutocompleteError(null);
  
        setErrors((previous) => ({
          ...previous,
          address: null,
        }));
      } catch (error) {
        console.error('Geocoding failed:', error);
  
        setCoordinates(null);
  
        setAutocompleteError(
          tSafe(
            'failed_verify_address',
            'Failed to verify address. Please enter manually.'
          )
        );
  
        setShowGoogleAutocomplete(false);
      }
    };
  
    const handleAutocompleteError = (error) => {
      if (
        [
          'ZERO_RESULTS',
          'REQUEST_DENIED',
          'INVALID_REQUEST',
          'UNKNOWN_ERROR',
        ].includes(error)
      ) {
        setAutocompleteError(
          tSafe(
            'address_service_unavailable',
            'Address service unavailable. Please enter manually.'
          )
        );
  
        setShowGoogleAutocomplete(false);
      }
    };
  
    const handleManualAddressChange = (value) => {
      setAddress(value);
      setCoordinates(null);
      setAutocompleteError(null);
  
      setErrors((previous) => ({
        ...previous,
        address: null,
      }));
    };
  
    const handleManualVerification = (coords) => {
      setCoordinates(coords);
      setAutocompleteError(null);
  
      setErrors((previous) => ({
        ...previous,
        address: null,
      }));
    };
  
    // ---------------------------------------------------------
    // Validate form
    // ---------------------------------------------------------
  
    const validate = () => {
      let isValid = true;
  
      const errorState = {
        apt_name: null,
        address: null,
        apt_type: null,
        contact_phone: null,
        instructions: null,
        room_count: {},
        room_size: {},
      };
  
      if (!aptName.trim()) {
        errorState.apt_name = tSafe(
          'property_title_required',
          'Property Title is required'
        );
  
        isValid = false;
      }
  
      if (!address.trim()) {
        errorState.address = tSafe(
          'address_required',
          'Address is required'
        );
  
        isValid = false;
      } else if (!coordinates) {
        errorState.address = tSafe(
          'verify_address',
          'Please verify your address'
        );
  
        isValid = false;
      }
  
      if (!aptType.trim()) {
        errorState.apt_type = tSafe(
          'property_type_required',
          'Property Type is required'
        );
  
        isValid = false;
      }
  
      roomDetails.forEach((room) => {
        if (room.number <= 0) {
          errorState.room_count[room.type] = tSafe(
            'room_count_error',
            '{type} count must be greater than 0',
            { type: room.type }
          );
  
          isValid = false;
        }
  
        if (room.size < 50 || room.size > 600) {
          errorState.room_size[room.type] = tSafe(
            'room_size_error',
            '{type} size must be between 50 and 600 sq ft',
            { type: room.type }
          );
  
          isValid = false;
        }
      });
  
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      const phoneRegex = /^[0-9]{10}$/;
  
      if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
        errorState.contact_phone = tSafe(
          'valid_phone_required',
          'Enter a valid 10-digit phone number'
        );
  
        isValid = false;
      }
  
      if (instructions && instructions.trim().length < 5) {
        errorState.instructions = tSafe(
          'instructions_min_length',
          'Instructions must be at least 5 characters long'
        );
  
        isValid = false;
      }
  
      setErrors(errorState);
  
      return isValid;
    };
  
    // ---------------------------------------------------------
    // Update property
    // ---------------------------------------------------------
  
    const handleUpdate = async () => {
      if (!validate()) {
        return;
      }
  
      if (!coordinates) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'verify_address',
            'Please verify your address'
          )
        );
  
        return;
      }
  
      setLoading(true);
  
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
  
      const updatedData = {
        userId: currentUserId,
        aptId: propertyId,
        apt_name: aptName.trim(),
        address: address.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        apt_type: aptType,
        instructions: instructions.trim(),
        contact_phone: cleanedPhone,
        cleaning_supplies: checked,
        roomDetails: roomDetails,
        updated_on: moment().format('YYYY-MM-DD HH:mm:ss'),
        preferredCleaners,
        invitedCleaners,
      };
  
      try {
        const response = await userService.updateApartment(
          updatedData,
          userToken
        );
  
        if (response.status === 200) {
          Alert.alert(
            tSafe('success_title', 'Success'),
            tSafe(
              'property_updated',
              'Property details updated successfully!'
            ),
            [
              {
                text: tSafe('ok', 'OK'),
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Property update failed:', error);
  
        Alert.alert(
          tSafe('error_title', 'Error'),
          error.response?.data?.detail ||
            error.response?.data?.message ||
            tSafe(
              'update_failed',
              'Failed to update property. Please try again.'
            )
        );
      } finally {
        setLoading(false);
      }
    };
  
    // ---------------------------------------------------------
    // Address input section
    // ---------------------------------------------------------
  
    const renderAddressInputs = () => {
      if (!isDataLoaded) {
        return (
          <View style={styles.addressLoading}>
            <ActivityIndicator
              size="small"
              color={theme.brand.primary}
            />
  
            <Text style={styles.addressLoadingText}>
              Loading address...
            </Text>
          </View>
        );
      }
  
      return (
        <View style={styles.fieldContainer}>
          {showGoogleAutocomplete ? (
            <GoogleAutocomplete
              label={tSafe(
                'property_address_label',
                'Property Address'
              )}
              apiKey={GOOGLE_MAPS_API_KEY}
              initialValue={address}
              selected_address={handleAutocompleteSelect}
              handleError={handleAutocompleteError}
            />
          ) : (
            <AddressInput
              label={tSafe(
                'property_address_label',
                'Property Address'
              )}
              value={address}
              onChange={handleManualAddressChange}
              onCoordinatesSet={handleManualVerification}
              error={errors.address}
              initialCoordinates={coordinates}
            />
          )}
  
          {!hasPermission && (
            <View style={styles.permissionWarningContainer}>
              <Icon
                source="alert-circle-outline"
                size={19}
                color={theme.status.warning}
              />
  
              <Text style={styles.permissionWarningText}>
                {tSafe(
                  'location_permission_required',
                  'Location permission required for address verification'
                )}
              </Text>
            </View>
          )}
  
          {autocompleteError &&
            !showGoogleAutocomplete &&
            !coordinates && (
              <Text style={styles.errorText}>
                {autocompleteError}
              </Text>
            )}
  
          {!!errors.address && (
            <Text style={styles.errorText}>
              {errors.address}
            </Text>
          )}
        </View>
      );
    };
  
    // ---------------------------------------------------------
    // Screen
    // ---------------------------------------------------------
  
    return (
      <Provider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            backgroundColor={theme.background.default}
            barStyle={isDark ? 'light-content' : 'dark-content'}
          />
  
          {/* Screen header */}
  
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackButton}
              accessibilityRole="button"
              accessibilityLabel={tSafe('back', 'Back')}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={23}
                color={theme.icon.default}
              />
            </TouchableOpacity>
  
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {tSafe('edit_property', 'Edit Property')}
              </Text>
  
              <Text style={styles.headerSubtitle}>
                Update your property details
              </Text>
            </View>
  
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="home-edit-outline"
                size={23}
                color={theme.brand.primary}
              />
            </View>
          </View>
  
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchPropertyDetails}
                  tintColor={theme.brand.primary}
                  colors={[theme.brand.primary]}
                  progressBackgroundColor={theme.surface.default}
                />
              }
            >
              {/* Property information */}
  
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionIcon}>
                    <MaterialCommunityIcons
                      name="home-outline"
                      size={22}
                      color={theme.brand.primary}
                    />
                  </View>
  
                  <View style={styles.sectionHeadingText}>
                    <Text style={styles.sectionTitle}>
                      Property Information
                    </Text>
  
                    <Text style={styles.sectionSubtitle}>
                      Update the name, address, and property type.
                    </Text>
                  </View>
                </View>
  
                <View style={styles.fieldContainer}>
                  <TextInput
                    mode="outlined"
                    label={tSafe(
                      'property_title_label',
                      'Property Title'
                    )}
                    placeholder={tSafe(
                      'property_title_placeholder',
                      'Property Title'
                    )}
                    value={aptName}
                    onChangeText={setAptName}
                    onFocus={() => handleError(null, 'apt_name')}
                    error={!!errors.apt_name}
                    outlineColor={theme.input.border}
                    activeOutlineColor={theme.input.focus}
                    textColor={theme.input.text}
                    placeholderTextColor={theme.input.placeholder}
                    style={styles.input}
                    theme={{
                      colors: {
                        onSurfaceVariant: theme.input.placeholder,
                        surface: theme.input.background,
                      },
                    }}
                  />
  
                  {!!errors.apt_name && (
                    <Text style={styles.errorText}>
                      {errors.apt_name}
                    </Text>
                  )}
                </View>
  
                {renderAddressInputs()}
  
                <View style={styles.fieldContainer}>
                  <FloatingLabelPickerSelect
                    label={tSafe(
                      'select_property_type',
                      'Select Property Type'
                    )}
                    items={propertyList}
                    value={aptType}
                    onValueChange={(value) => {
                      setAptType(value);
                      handleError(null, 'apt_type');
                    }}
                  />
  
                  {!!errors.apt_type && (
                    <Text style={styles.errorText}>
                      {errors.apt_type}
                    </Text>
                  )}
                </View>
              </View>
  
              {/* Room configuration */}
  
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionIcon}>
                    <MaterialCommunityIcons
                      name="floor-plan"
                      size={22}
                      color={theme.brand.primary}
                    />
                  </View>
  
                  <View style={styles.sectionHeadingText}>
                    <Text style={styles.sectionTitle}>
                      {tSafe(
                        'select_number_of_rooms',
                        'Select Number of Rooms'
                      )}
                    </Text>
  
                    <Text style={styles.sectionSubtitle}>
                      Set the number and size of each room.
                    </Text>
                  </View>
                </View>
  
                <View style={styles.roomContainer}>
                  {roomDetails.map((room, index) => (
                    <View
                      key={`${room.type}-${index}`}
                      style={styles.roomRow}
                    >
                      <View style={styles.roomInfo}>
                        <Text style={styles.roomType}>
                          {room.type}
                        </Text>
  
                        <Text style={styles.roomSize}>
                          {tSafe('size_label', 'Size:')}{' '}
                          {room.size} {tSafe('sq_ft', 'sq ft')}
                        </Text>
  
                        <Text style={styles.roomCategory}>
                          {getTranslatedSizeRange(
                            room.size_range ||
                              getRoomSizeCategory(room.size)
                          )}
                        </Text>
                      </View>
  
                      <View style={styles.counterContainer}>
                        <TouchableOpacity
                          onPress={() =>
                            handleRoomCountChange(
                              room.type,
                              'minus'
                            )
                          }
                          style={styles.counterButton}
                          accessibilityRole="button"
                          accessibilityLabel={`Decrease ${room.type} count`}
                        >
                          <MaterialCommunityIcons
                            name="minus"
                            size={19}
                            color={theme.icon.default}
                          />
                        </TouchableOpacity>
  
                        <Text style={styles.roomCount}>
                          {room.number}
                        </Text>
  
                        <TouchableOpacity
                          onPress={() =>
                            handleRoomCountChange(
                              room.type,
                              'add'
                            )
                          }
                          style={styles.counterButton}
                          accessibilityRole="button"
                          accessibilityLabel={`Increase ${room.type} count`}
                        >
                          <MaterialCommunityIcons
                            name="plus"
                            size={19}
                            color={theme.icon.default}
                          />
                        </TouchableOpacity>
                      </View>
  
                      {!!errors?.room_count?.[room.type] && (
                        <Text style={styles.errorTextRoom}>
                          {errors.room_count[room.type]}
                        </Text>
                      )}
  
                      {!!errors?.room_size?.[room.type] && (
                        <Text style={styles.errorTextRoom}>
                          {errors.room_size[room.type]}
                        </Text>
                      )}
                    </View>
                  ))}
  
                  <TouchableOpacity
                    onPress={handleConfirmRoomSelection}
                    style={styles.adjustSizeButton}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="ruler-square"
                      size={19}
                      color={theme.brand.primary}
                    />
  
                    <Text style={styles.adjustSizeText}>
                      {tSafe('adjust_size', 'Adjust Room Sizes')}
                    </Text>
  
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={theme.brand.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
  
              {/* Cleaning supplies */}
  
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionIcon}>
                    <MaterialCommunityIcons
                      name="spray-bottle"
                      size={22}
                      color={theme.brand.primary}
                    />
                  </View>
  
                  <View style={styles.sectionHeadingText}>
                    <Text style={styles.sectionTitle}>
                      {tSafe(
                        'have_cleaning_supplies',
                        'Have Cleaning Supplies?'
                      )}
                    </Text>
  
                    <Text style={styles.sectionSubtitle}>
                      Let cleaners know whether supplies are available.
                    </Text>
                  </View>
                </View>
  
                <RadioButton.Group
                  onValueChange={setChecked}
                  value={checked}
                >
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setChecked('yes')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioOptionTextContainer}>
                      <MaterialCommunityIcons
                        name="check-circle-outline"
                        size={21}
                        color={
                          checked === 'yes'
                            ? theme.status.success
                            : theme.icon.muted
                        }
                      />
  
                      <Text style={styles.radioLabel}>
                        {tSafe('yes', 'Yes')}
                      </Text>
                    </View>
  
                    <RadioButton
                      value="yes"
                      color={theme.brand.primary}
                      uncheckedColor={theme.icon.muted}
                    />
                  </TouchableOpacity>
  
                  <View style={styles.radioDivider} />
  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setChecked('no')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioOptionTextContainer}>
                      <MaterialCommunityIcons
                        name="close-circle-outline"
                        size={21}
                        color={
                          checked === 'no'
                            ? theme.status.error
                            : theme.icon.muted
                        }
                      />
  
                      <Text style={styles.radioLabel}>
                        {tSafe('no', 'No')}
                      </Text>
                    </View>
  
                    <RadioButton
                      value="no"
                      color={theme.brand.primary}
                      uncheckedColor={theme.icon.muted}
                    />
                  </TouchableOpacity>
                </RadioButton.Group>
              </View>
  
              {/* Instructions and contact */}
  
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionIcon}>
                    <MaterialCommunityIcons
                      name="text-box-outline"
                      size={22}
                      color={theme.brand.primary}
                    />
                  </View>
  
                  <View style={styles.sectionHeadingText}>
                    <Text style={styles.sectionTitle}>
                      Additional Details
                    </Text>
  
                    <Text style={styles.sectionSubtitle}>
                      Provide instructions and contact information.
                    </Text>
                  </View>
                </View>
  
                <View style={styles.fieldContainer}>
                  <TextInput
                    mode="outlined"
                    label={tSafe(
                      'specific_instructions_label',
                      'Specific Instructions'
                    )}
                    placeholder={tSafe(
                      'specific_instructions_placeholder',
                      'Specific Instructions'
                    )}
                    value={instructions}
                    onChangeText={setInstructions}
                    onFocus={() =>
                      handleError(null, 'instructions')
                    }
                    error={!!errors.instructions}
                    multiline
                    numberOfLines={4}
                    outlineColor={theme.input.border}
                    activeOutlineColor={theme.input.focus}
                    textColor={theme.input.text}
                    placeholderTextColor={theme.input.placeholder}
                    style={styles.multilineInput}
                    theme={{
                      colors: {
                        onSurfaceVariant: theme.input.placeholder,
                        surface: theme.input.background,
                      },
                    }}
                  />
  
                  {!!errors.instructions && (
                    <Text style={styles.errorText}>
                      {errors.instructions}
                    </Text>
                  )}
                </View>
  
                <View style={styles.fieldContainer}>
                  <TextInput
                    mode="outlined"
                    label={tSafe(
                      'contact_phone_label',
                      'Contact Phone Number'
                    )}
                    placeholder={tSafe(
                      'contact_phone_placeholder',
                      'Contact Phone Number'
                    )}
                    value={phoneNumber}
                    onChangeText={handleInputChange}
                    keyboardType="phone-pad"
                    onFocus={() =>
                      handleError(null, 'contact_phone')
                    }
                    error={!!errors.contact_phone}
                    outlineColor={theme.input.border}
                    activeOutlineColor={theme.input.focus}
                    textColor={theme.input.text}
                    placeholderTextColor={theme.input.placeholder}
                    left={
                      <TextInput.Icon
                        icon="phone-outline"
                        color={theme.icon.muted}
                      />
                    }
                    style={styles.input}
                    theme={{
                      colors: {
                        onSurfaceVariant: theme.input.placeholder,
                        surface: theme.input.background,
                      },
                    }}
                  />
  
                  {!!errors.contact_phone && (
                    <Text style={styles.errorText}>
                      {errors.contact_phone}
                    </Text>
                  )}
                </View>
              </View>
  
              {/* Cleaner management */}
  
              {/*
                The existing cleaner-management flow remains available.
                Uncomment this section if you want the cleaner button
                visible on the Edit Property screen.
              */}
  
              {/*
              <TouchableOpacity
                style={styles.cleanerButton}
                onPress={() => setCleanerModalVisible(true)}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={21}
                  color={theme.brand.primary}
                />
  
                <Text style={styles.cleanerButtonText}>
                  {tSafe('manage_cleaners', 'Manage Cleaners')} (
                  {preferredCleaners.length}{' '}
                  {tSafe('selected', 'selected')})
                </Text>
  
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={21}
                  color={theme.brand.primary}
                />
              </TouchableOpacity>
              */}
  
              {/* Update button */}
  
              <View style={styles.updateButtonContainer}>
                <Button
                  title={tSafe(
                    'update_property',
                    'Update Property'
                  )}
                  onPress={handleUpdate}
                  loading={loading}
                />
              </View>
  
              <View style={styles.bottomNote}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={17}
                  color={theme.status.success}
                />
  
                <Text style={styles.bottomNoteText}>
                  Your property information will be updated securely.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
  
          {/* ------------------------------------------------- */}
          {/* Room size modal                                  */}
          {/* ------------------------------------------------- */}
  
          <Portal>
            <Modal
              visible={roomSizeModalVisible}
              onDismiss={handleCloseRoomModal}
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.modalHandle} />
  
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="ruler-square"
                    size={24}
                    color={theme.brand.primary}
                  />
                </View>
  
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalTitle}>
                    {tSafe(
                      'adjust_room_sizes',
                      'Adjust Room Sizes'
                    )}
                  </Text>
  
                  <Text style={styles.modalSubtitle}>
                    Set the approximate square footage for each room.
                  </Text>
                </View>
              </View>
  
              <ScrollView
                style={styles.roomSizeScroll}
                showsVerticalScrollIndicator={false}
              >
                {roomDetails.map((room, index) =>
                  room.number > 0 ? (
                    <View
                      key={`${room.type}-${index}`}
                      style={styles.roomSizeItem}
                    >
                      <View style={styles.roomSizeHeader}>
                        <Text style={styles.roomSizeTitle}>
                          {room.type}
                        </Text>
  
                        <Text style={styles.roomSizeValue}>
                          {room.size} {tSafe('sq_ft', 'sq ft')}
                        </Text>
                      </View>
  
                      <Slider
                        style={styles.slider}
                        minimumValue={50}
                        maximumValue={600}
                        step={10}
                        value={room.size}
                        onValueChange={(value) =>
                          handleRoomSizeChange(room.type, value)
                        }
                        minimumTrackTintColor={theme.brand.primary}
                        maximumTrackTintColor={theme.border.default}
                        thumbTintColor={theme.brand.primary}
                      />
  
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>50 sq ft</Text>
  
                        <Text style={styles.sliderLabel}>600 sq ft</Text>
                      </View>
  
                      <View style={styles.sizeCategoryBadge}>
                        <Text style={styles.sizeCategoryText}>
                          {getTranslatedSizeRange(
                            getRoomSizeCategory(room.size)
                          )}
                        </Text>
                      </View>
  
                      {!!errors?.room_size?.[room.type] && (
                        <Text style={styles.errorText}>
                          {errors.room_size[room.type]}
                        </Text>
                      )}
                    </View>
                  ) : null
                )}
              </ScrollView>
  
              <TouchableOpacity
                onPress={handleCloseRoomModal}
                style={styles.submitButton}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {tSafe('done', 'Done')}
                </Text>
              </TouchableOpacity>
            </Modal>
          </Portal>
  
          {/* Cleaner management modal */}
  
          <CleanerManagementModal
            visible={cleanerModalVisible}
            onClose={() => setCleanerModalVisible(false)}
            platformCleaners={platformCleaners}
            preferredCleaners={preferredCleaners}
            setPreferredCleaners={setPreferredCleaners}
            invitedCleaners={invitedCleaners}
            setInvitedCleaners={setInvitedCleaners}
          />
        </SafeAreaView>
      </Provider>
    );
  }
  
  // =============================================================
  // THEME-AWARE STYLES
  // Uses existing Freshsweeper LIGHT_THEME / DARK_THEME.
  // =============================================================
  
  const createStyles = (theme, isDark) =>
    StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: theme.background.default,
      },
  
      keyboardContainer: {
        flex: 1,
      },
  
      scrollView: {
        flex: 1,
        backgroundColor: theme.background.default,
      },
  
      contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
      },
  
      // Header
  
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.surface.default,
        borderBottomWidth: 1,
        borderBottomColor: theme.border.default,
      },
  
      headerBackButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: theme.background.elevated,
        alignItems: 'center',
        justifyContent: 'center',
      },
  
      headerTextContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
      },
  
      headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.text.primary,
      },
  
      headerSubtitle: {
        fontSize: 11,
        color: theme.text.secondary,
        marginTop: 3,
        textAlign: 'center',
      },
  
      headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: theme.brand.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
      },
  
      // Section cards
  
      sectionCard: {
        backgroundColor: theme.card.background,
        borderRadius: 20,
        padding: 17,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: theme.card.border,
        shadowColor: theme.shadow.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.shadow.opacity,
        shadowRadius: 8,
        elevation: isDark ? 1 : 2,
      },
  
      sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
      },
  
      sectionIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor: theme.brand.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      },
  
      sectionHeadingText: {
        flex: 1,
      },
  
      sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.text.primary,
        lineHeight: 22,
      },
  
      sectionSubtitle: {
        fontSize: 12,
        color: theme.text.secondary,
        lineHeight: 18,
        marginTop: 4,
      },
  
      // Form fields
  
      fieldContainer: {
        marginBottom: 16,
      },
  
      input: {
        backgroundColor: theme.input.background,
        fontSize: 14,
      },
  
      multilineInput: {
        backgroundColor: theme.input.background,
        fontSize: 14,
        minHeight: 110,
      },
  
      addressLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
      },
  
      addressLoadingText: {
        fontSize: 12,
        color: theme.text.secondary,
        marginLeft: 10,
      },
  
      errorText: {
        color: theme.status.error,
        fontSize: 12,
        marginTop: 5,
        lineHeight: 17,
      },
  
      // Room configuration
  
      roomContainer: {
        backgroundColor: theme.surface.elevated,
        borderRadius: 15,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderColor: theme.border.default,
      },
  
      roomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.divider,
        flexWrap: 'wrap',
      },
  
      roomInfo: {
        flex: 1,
        minWidth: 100,
        paddingRight: 8,
      },
  
      roomType: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.text.primary,
      },
  
      roomSize: {
        fontSize: 12,
        color: theme.text.secondary,
        marginTop: 4,
      },
  
      roomCategory: {
        fontSize: 11,
        color: theme.brand.primary,
        fontWeight: '600',
        marginTop: 4,
      },
  
      counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
  
      counterButton: {
        width: 35,
        height: 35,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border.default,
        backgroundColor: theme.surface.default,
        justifyContent: 'center',
        alignItems: 'center',
      },
  
      roomCount: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.text.primary,
        textAlign: 'center',
        minWidth: 34,
      },
  
      errorTextRoom: {
        width: '100%',
        color: theme.status.error,
        fontSize: 11,
        marginTop: 8,
      },
  
      adjustSizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        marginVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 13,
        backgroundColor: theme.surface.selected,
        borderWidth: 1,
        borderColor: theme.brand.primaryLight,
      },
  
      adjustSizeText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: theme.brand.primary,
        marginLeft: 9,
      },
  
      // Cleaning supplies
  
      radioOption: {
        minHeight: 53,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
      },
  
      radioOptionTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
  
      radioLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.text.primary,
        marginLeft: 10,
      },
  
      radioDivider: {
        height: 1,
        backgroundColor: theme.divider,
        marginHorizontal: 8,
      },
  
      // Permission warning
  
      permissionWarningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.surface.elevated,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.status.warning,
        marginTop: 10,
        marginBottom: 5,
      },
  
      permissionWarningText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: theme.text.secondary,
        marginLeft: 9,
      },
  
      // Cleaner management
  
      cleanerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        padding: 15,
        borderRadius: 14,
        backgroundColor: theme.surface.selected,
        borderWidth: 1,
        borderColor: theme.brand.primary,
      },
  
      cleanerButtonText: {
        flex: 1,
        color: theme.brand.primary,
        fontWeight: '700',
        fontSize: 14,
        marginHorizontal: 10,
      },
  
      // Update button
  
      updateButtonContainer: {
        marginTop: 8,
        marginBottom: 16,
      },
  
      bottomNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        marginBottom: 15,
      },
  
      bottomNoteText: {
        fontSize: 11,
        lineHeight: 17,
        color: theme.text.secondary,
        marginLeft: 7,
        flexShrink: 1,
        textAlign: 'center',
      },
  
      // Room size modal
  
      modalContent: {
        backgroundColor: theme.surface.default,
        borderRadius: 24,
        padding: 21,
        marginHorizontal: 18,
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: theme.border.default,
      },
  
      modalHandle: {
        width: 42,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.border.strong,
        alignSelf: 'center',
        marginBottom: 19,
      },
  
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      },
  
      modalIconContainer: {
        width: 47,
        height: 47,
        borderRadius: 14,
        backgroundColor: theme.brand.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      },
  
      modalHeaderText: {
        flex: 1,
      },
  
      modalTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.text.primary,
      },
  
      modalSubtitle: {
        fontSize: 12,
        lineHeight: 18,
        color: theme.text.secondary,
        marginTop: 4,
      },
  
      roomSizeScroll: {
        flexGrow: 0,
      },
  
      roomSizeItem: {
        backgroundColor: theme.surface.elevated,
        borderWidth: 1,
        borderColor: theme.border.default,
        borderRadius: 15,
        padding: 14,
        marginBottom: 12,
      },
  
      roomSizeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
  
      roomSizeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.text.primary,
      },
  
      roomSizeValue: {
        fontSize: 13,
        fontWeight: '800',
        color: theme.brand.primary,
      },
  
      slider: {
        width: '100%',
        height: 42,
        marginTop: 8,
      },
  
      sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
  
      sliderLabel: {
        fontSize: 11,
        color: theme.text.muted,
      },
  
      sizeCategoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.surface.selected,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginTop: 10,
      },
  
      sizeCategoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.brand.primary,
      },
  
      submitButton: {
        marginTop: 12,
        minHeight: 48,
        backgroundColor: theme.button.primaryBackground,
        paddingHorizontal: 18,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
      },
  
      submitButtonText: {
        color: theme.button.primaryText,
        fontWeight: '800',
        fontSize: 14,
      },
    });