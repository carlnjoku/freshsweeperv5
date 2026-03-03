import React, { useState, useEffect, useContext, useRef } from "react";
import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
import { StyleSheet, Text, KeyboardAvoidingView, RefreshControl, Keyboard, StatusBar, Alert, FlatList, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Button from "../../components/shared/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../constants/colors";
import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
import { geocodeAddress } from '../../utils/geocodeAddress';
import ROUTES from '../../constants/routes';
import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
import userService from "../../services/connection/userService";
import moment from 'moment';
import { AuthContext } from "../../context/AuthContext";
import { propertyList } from "../../data";
import { GOOGLE_MAPS_API_KEY } from '../../secret';
import { Modal, Portal, Provider } from "react-native-paper";
import Slider from "@react-native-community/slider"; // Fixed import

import AddressInput from "../../components/shared/AddressInput"; // Make sure to import
import useLocationPermission from "../../components/shared/UseLocationPermission";
import { Icon } from 'react-native-paper';

export default function EditProperty({ navigation, route }) {
    const { currentUserId } = useContext(AuthContext);
    const { propertyId } = route.params; // Property ID from navigation params

    const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);
    const [autocompleteError, setAutocompleteError] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const { hasPermission } = useLocationPermission(); // Add location permission hook

    const [isDataLoaded, setIsDataLoaded] = useState(false); // Add this state

    const [refreshing, setRefreshing] = useState(false); // State for swipe-to-refresh
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roomDetails, setRoomDetails] = useState([]);
    const [aptName, setAptName] = useState("");
    const [address, setAddress] = useState("");
    const [aptType, setAptType] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [instructions, setInstructions] = useState("");
    const [checked, setChecked] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [errors, setErrors] = useState({});
    
  
    // Fallback Colors if COLORS is missing
    const FALLBACK_COLORS = {
        primary: "#007AFF",
        accent: COLORS.deepBlue,
    };

    
    useEffect(() => {
        fetchPropertyDetails();
    }, []);

    // Fetch property details
    const fetchPropertyDetails = async () => {
        setRefreshing(true); // Start refreshing state
        try {
            const response = await userService.getApartmentById(propertyId);
           
            if (response.status === 200) {
                const data = response.data;
                
                setAptName(data.apt_name);
                setAddress(data.address);
                setAptType(data.apt_type);
                setPhoneNumber(data.contact_phone);
                setChecked(data.cleaning_supplies);
                setInstructions(data.instructions);
                setRoomDetails(data.roomDetails);

                // Initialize coordinates from existing data
                if (data.latitude && data.longitude) {
                    setCoordinates({
                        latitude: parseFloat(data.latitude),
                        longitude: parseFloat(data.longitude)
                    });
                }
                
                // Assume autocomplete worked for existing property
                // setShowGoogleAutocomplete(true);

                // Mark data as loaded
                setIsDataLoaded(true);
            }
        } catch (error) {
            console.log("Error fetching property:", error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Start refreshing state
        }
    };

    // Function to get room size category
    const getRoomSizeCategory = (size) => {
        if (size < 150) return "Small";
        if (size >= 150 && size <= 300) return "Medium";
        return "Large";
    };

    const handleInputChange = (text) => {
        setPhoneNumber(formatPhoneNumber(text));
      };

      const formatPhoneNumber = (input) => {
        const cleaned = ('' + input).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return input;
      };
    
    
    // Handle address selection
    const handleSelectedAddress = async (newAddress) => {
        try {
            const { latitude, longitude } = await geocodeAddress(newAddress);
            setLatitude(latitude);
            setLongitude(longitude);
            setAddress(newAddress);
        } catch (error) {
            Alert.alert('Error', 'Failed to geocode address');
        }
    };

    // Handle room count changes
    const handleRoomCountChange = (roomType, action) => {
        setRoomDetails((prevRooms) =>
            prevRooms.map((room) =>
                room.type === roomType
                    ? { ...room, number: action === "add" ? room.number + 1 : Math.max(0, room.number - 1) }
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

    // Handle room size changes
    const handleRoomSizeChange = (type, size) => {
        setRoomDetails((prev) =>
            prev.map((room) =>
                room.type === type ? { ...room, size } : room
            )
        );
    };

    const handleError = (error, input) => {
        setErrors(prevState => ({...prevState, [input]: error}));
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

    // Handle manual address input
    const handleManualAddressChange = (val) => {
        setAddress(val);
        setCoordinates(null);
        setErrors(prev => ({...prev, address: null}));
        setAutocompleteError(null);
    };

    // Handle manual address verification
    const handleManualVerification = (coords) => {
        setCoordinates(coords);
        setErrors(prev => ({...prev, address: null}));
        setAutocompleteError(null);
    };

    // Validate function
    const validate = () => {
        let isValid = true;
        const errorState = {
            apt_name: null,
            address: null,
            apt_type: null,
            contact_phone: null,
            instructions: null,
            room_count: {},
            room_size: {}
        };

        // Validate Apartment Name
        if (!aptName.trim()) {
            errorState.apt_name = 'Property Title is required';
            isValid = false;
        }

        // Validate Address
        if (!address.trim()) {
            errorState.address = 'Address is required';
            isValid = false;
        } else if (!coordinates) {
            errorState.address = 'Please verify your address';
            isValid = false;
        }

        // Validate Apartment Type
        if (!aptType.trim()) {
            errorState.apt_type = 'Property Type is required';
            isValid = false;
        }

        // Validate Room Details
        roomDetails.forEach((room) => {
            if (room.number <= 0) {
                errorState.room_count[room.type] = `${room.type} count must be greater than 0`;
                isValid = false;
            }
            if (room.size < 50 || room.size > 600) {
                errorState.room_size[room.type] = `${room.type} size must be between 50 and 600 sq ft`;
                isValid = false;
            }
        });

        // Validate Phone Number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
            errorState.contact_phone = 'Enter a valid 10-digit phone number';
            isValid = false;
        }

        // Validate Instructions (optional but must be at least 5 chars)
        if (instructions && instructions.length < 5) {
            errorState.instructions = 'Instructions must be at least 5 characters long';
            isValid = false;
        }

        // Update errors state
        setErrors(errorState);
        return isValid;
    };

    // Handle update submission
    // const handleUpdate = async () => {
    //     setLoading(true);
        
    //     const updatedData = {
    //         aptId: propertyId,
    //         apt_name: aptName,
    //         address: address,
    //         latitude: latitude,
    //         longitude: longitude,
    //         apt_type: aptType,
    //         instructions:instructions,
    //         contact_phone: phoneNumber,
    //         cleaning_supplies: checked,
    //         roomDetails: roomDetails,
    //         updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    //     };

    //     console.log(updatedData)
        

    //     try {
    //         const response = await userService.updateApartment(updatedData);
    //         if (response.status === 200) {
    //             Alert.alert("Success", "Apartment details updated successfully!");
    //             navigation.goBack(); // Navigate back after update
    //         }
    //     } catch (error) {
    //         Alert.alert("Error", "Failed to update property. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Handle update submission
    const handleUpdate = async () => {
        setLoading(true);
        
        if (!validate()) {
            setLoading(false);
            return;
        }

        const updatedData = {
            aptId: propertyId,
            apt_name: aptName,
            address: address,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            apt_type: aptType,
            instructions:instructions,
            contact_phone: phoneNumber,
            cleaning_supplies: checked,
            roomDetails: roomDetails,
            updated_on: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        };

        try {
            const response = await userService.updateApartment(updatedData);
            if (response.status === 200) {
                Alert.alert("Success", "Property details updated successfully!");
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update property. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Render address inputs
    // const renderAddressInputs = () => (
    //     <>
    //         {/* Google Autocomplete - shown only when working */}
    //         {showGoogleAutocomplete && (
    //             <GoogleAutocomplete 
    //                 label="Property Address"
    //                 apiKey={GOOGLE_MAPS_API_KEY}
    //                 initialValue={address}  // Pass existing address
    //                 selected_address={handleAutocompleteSelect}
    //                 handleError={handleAutocompleteError}
    //             />
    //         )}
            
    //         {/* Manual AddressInput - shown when autocomplete fails */}
    //         {!showGoogleAutocomplete && (
    //             <AddressInput
    //                 label="Property Address"
    //                 value={address}
    //                 onChange={handleManualAddressChange}
    //                 onCoordinatesSet={handleManualVerification}
    //                 error={errors.address}
    //                 initialCoordinates={coordinates}  // Pass existing coordinates
    //             />
    //         )}

    //         {/* Display coordinates if verified */}
    //         {/* {coordinates && (
    //             <Text style={styles.coordinatesText}>
    //                 Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
    //             </Text>
    //         )} */}

    //         {/* Location permission warning */}
    //         {!hasPermission && (
    //             <Text style={styles.permissionWarning}>
    //                 Location permission required for address verification
    //             </Text>
    //         )}

    //         {/* Error Messages */}
    //         {autocompleteError && !showGoogleAutocomplete && !coordinates && (
    //             <Text style={styles.errorText}>{autocompleteError}</Text>
    //         )}
    //         {errors.address && !coordinates && (
    //             <Text style={styles.errorText}>{errors.address}</Text>
    //         )}
    //     </>
    // );

    // Render address inputs
    const renderAddressInputs = () => {
        if (!isDataLoaded) {
            // Show loader while data is loading
            return <ActivityIndicator size="small" color={COLORS.primary} />;
        }

        return (
            <>
                {/* Google Autocomplete - shown only when working */}
                {showGoogleAutocomplete && (
                    <GoogleAutocomplete 
                        label="Property Address"
                        apiKey={GOOGLE_MAPS_API_KEY}
                        initialValue={address}  // Pass existing address
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
                        onCoordinatesSet={handleManualVerification}
                        error={errors.address}
                        initialCoordinates={coordinates}  // Pass existing coordinates
                    />
                )}

                {/* Display coordinates if verified */}
                {/* {coordinates && (
                    <Text style={styles.coordinatesText}>
                        Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                    </Text>
                )} */}

                {/* Location permission warning */}
               
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
    };

    return (
        <Provider>
        <View style={styles.container}>
        <StatusBar translucent={false} backgroundColor={COLORS.white}  barStyle="dark-content"/>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchPropertyDetails} />
                }
            >
                
                <TextInput
                    mode="outlined"
                    label="Property Title"
                    placeholder="Property Title"
                    placeholderTextColor={COLORS.darkGray}
                    outlineColor="#CCC"
                    value={aptName}
                    activeOutlineColor={COLORS.primary}
                    style={{marginBottom:0, fontSize:14, backgroundColor:"#fff"}}
                    // onChangeText={text => handleAddress(text, 'apt_name')}
                    onChangeText={setAptName}
                    onFocus={() => handleError(null, 'apt_name')}
                    iconName="email-outline"
                    // error={errors.apt_name}
                />

                
                {renderAddressInputs()}
                

                <FloatingLabelPickerSelect
                    label="Select Property Type"
                    items={propertyList}
                    value={aptType}
                    onValueChange={(value) => setAptType(value)}
                />
                
                
                <View style={styles.add_rooms}>
                    {/* Room Count Selection */}
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

                        {/* Display errors with optional chaining to prevent crashes */}
                        {errors?.room_count?.[room.type] && (
                            <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
                        )}
                        {errors?.room_size?.[room.type] && (
                            <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
                        )}
                    </View>
                ))}
                    {/* Confirm Button to Open Modal */}
                    <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
                    <Text style={{alignSelf:'center', fontWeight:'500'}}>Adjust Size</Text>
                    </TouchableOpacity>
                    {/* <Button mode="contained" onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
                    Continue
                    </Button> */}
                </View>
                <View style={styles.radioButtonMainContainer}>
                    <View>
                        <Text>Have Cleaning Supplies: </Text>
                    </View>
                    <View style={styles.radioButtonContainer}>
                        <RadioButton
                        value="yes"
                        status={checked === 'yes' ? 'checked' : 'unchecked'}
                        onPress={() => setChecked('yes')}
                        color={COLORS.primary} // Customize the color if needed
                        />
                        <Text>Yes</Text>
                    </View>
                    <View style={styles.radioButtonContainer}>
                        <RadioButton
                        value="no"
                        status={checked === 'no' ? 'checked' : 'unchecked'}
                        onPress={() => setChecked('no')}
                        color={COLORS.primary} // Customize the color if needed
                        />
                        <Text>No</Text>
                    </View>
                </View>
                
                <TextInput
                    mode="outlined"
                    label="Specific Intsruction"
                    placeholder="Specific Intsruction"
                    placeholderTextColor={COLORS.gray}
                    outlineColor="#D8D8D8"
                    value={instructions}
                    activeOutlineColor={COLORS.primary}
                    style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
                    onChangeText={setInstructions}
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
                    keyboardType="phone-pad" // Show numeric keypad on mobile
                    style={{marginBottom:10, marginTop:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
                    onFocus={() => handleError(null, 'contack_phone')}
                    error={errors.phoneNumber}
                />
                
                <Button title="Update Property" onPress={handleUpdate} loading={loading} />

            </ScrollView>
            <Portal>
          <Modal visible={modalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Adjust Room Sizes</Text>
              {roomDetails.map((room, index) =>
                room.number > 0 ? (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <Text>{room.type} Size ({room.size_range})</Text>
                    <Slider
                      style={{ width: "100%", height: 20, marginLeft:-20 }}
                      minimumValue={100}
                      maximumValue={500}
                      step={10}
                      value={room.size}
                      onValueChange={(value) => handleRoomSizeChange(room.type, value)}
                      minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
                      maximumTrackTintColor="#000000"
                      thumbTintColor={COLORS.accent || FALLBACK_COLORS.accent}
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
      </Provider>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: "#fff" 
    },
    label: { 
        fontSize: 16, 
        fontWeight: "bold", 
        marginTop: 10 
    },
    input: { 
        backgroundColor: "#f5f5f5", 
        borderRadius: 5, 
        padding: 10, 
        marginVertical: 5 
    },
    roomContainer: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        paddingVertical: 10 
    },
    roomActions: { 
        flexDirection: "row", 
        alignItems: "center" },
    plus: { 
        fontSize: 20, 
        color: COLORS.primary, 
        paddingHorizontal: 10 },
    minus: { 
        fontSize: 20, 
        color: "red", 
        paddingHorizontal: 10 
    },
    add_rooms:{
        borderWidth:1,
        borderColor:"#D8D8D8",
        borderRadius:10,
        padding:10,
        marginTop:10
      },
    roomContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 15,
        paddingTop:5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    
    roomType: {
        fontSize: 14,
        fontWeight: "500",
    },
    roomRange: {
        fontSize: 12,
        color: "#666",
    },
    roomSize: {
        fontSize: 12,
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
      modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
      },
      inputContainer: {
        marginBottom: 10,
      },
      square_foot:{
        marginTop:1,
        fontSize:12
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
});
