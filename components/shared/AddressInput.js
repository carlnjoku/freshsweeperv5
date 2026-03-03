// import React, { useState, useEffect } from 'react';
// import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import GoogleAutocomplete from './GooglePlacesAutocomplete';
// import COLORS from '../../constants/colors';
// import { GOOGLE_MAPS_API_KEY } from '../../secret';
// import useLocationPermission from './UseLocationPermission';

// const AddressInput = ({ 
//   label,
//   value,
//   onChange,
//   onCoordinatesSet,
//   error,
//   initialCoordinates  // Add this prop
// }) => {
//   const { hasPermission, requestPermission } = useLocationPermission();
//   const [showManualInput, setShowManualInput] = useState(false);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [lastVerifiedAddress, setLastVerifiedAddress] = useState(null);

//   const [coordinates, setCoordinates] = useState(initialCoordinates || null);

//     // Initialize with existing coordinates
//     useEffect(() => {
//         if (initialCoordinates) {
//             setCoordinates(initialCoordinates);
//         }
//     }, [initialCoordinates]);

//   // Reset verification if address changes
//   useEffect(() => {
//     if (value !== lastVerifiedAddress) {
//       setLastVerifiedAddress(null);
//     }
//   }, [value]);

//   const isVerified = value === lastVerifiedAddress;

//   const handleAutocompleteSelected = async (selectedAddress) => {
//     try {
//       setIsVerifying(true);
//       let coordinates = null;

//       // Try Google Geocoding first
//       const googleResponse = await fetch(
//         `https://maps.googleapis.com/maps/json?address=${encodeURIComponent(selectedAddress)}&key=${GOOGLE_MAPS_API_KEY}`
//       );
//       const googleData = await googleResponse.json();

//       if (googleData.status === 'OK') {
//         const location = googleData.results[0].geometry.location;
//         coordinates = { latitude: location.lat, longitude: location.lng };
//       }

//       // Fallback to Expo if Google fails
//       if (!coordinates) {
//         const expoResults = await Location.geocodeAsync(selectedAddress);
//         if (expoResults.length > 0) {
//           coordinates = {
//             latitude: expoResults[0].latitude,
//             longitude: expoResults[0].longitude
//           };
//         }
//       }

//       if (coordinates) {
//         onChange(selectedAddress);
//         onCoordinatesSet(coordinates);
//         setLastVerifiedAddress(selectedAddress);
//       } else {
//         throw new Error('Location verification failed');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to verify address location');
//       setShowManualInput(true);
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const handleManualVerification = async () => {
//     if (!value.trim() || isVerified) return;

//     try {
//       setIsVerifying(true);
//       const hasPerms = await requestPermission();
//       if (!hasPerms) return;

//       const expoResults = await Location.geocodeAsync(value);
//       if (expoResults.length > 0) {
//         const coordinates = {
//           latitude: expoResults[0].latitude,
//           longitude: expoResults[0].longitude
//         };
//         onCoordinatesSet(coordinates);
//         setLastVerifiedAddress(value);
//       } else {
//         Alert.alert('Error', 'Could not verify address location');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to process address verification');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {!showManualInput ? (
//         <GoogleAutocomplete
//           label={label}
//           selected_address={handleAutocompleteSelected}
//           handleError={() => setShowManualInput(true)}
//           initialValue={value}
//         />
//       ) : (
//         <View style={styles.manualContainer}>
//           <TextInput
//             placeholder="Enter address manually"
//             value={value}
//             onChangeText={onChange}
//             style={styles.input}
//             multiline
//             numberOfLines={3}
//           />
          
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={[
//                 styles.verifyButton,
//                 isVerified && styles.verifiedButton
//               ]}
//               onPress={handleManualVerification}
//               disabled={isVerified || isVerifying}
//             >
//               {isVerifying ? (
//                 <ActivityIndicator color="white" />
//               ) : isVerified ? (
//                 <View style={styles.verifiedWrapper}>
//                   <MaterialCommunityIcons 
//                     name="check" 
//                     size={20} 
//                     color="white" 
//                   />
//                   <Text style={styles.buttonText}>Address Verified</Text>
//                 </View>
//               ) : (
//                 <Text style={styles.buttonText}>Verify Address</Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.retryButton}
//               onPress={() => setShowManualInput(false)}
//             >
//               <Text style={[styles.buttonText, { color: COLORS.primary }]}>
//                 Use Autocomplete
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 10,
//   },
//   manualContainer: {
//     marginTop: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//     minHeight: 70,
//     textAlignVertical: 'top',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 10,
//   },
//   verifyButton: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   verifiedButton: {
//     backgroundColor: COLORS.green,
//   },
//   verifiedWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   retryButton: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 5,
  
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     marginTop: 5,
//   },
// });

// export default AddressInput;






import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { geocodeAddress } from '../../utils/geocodeAddress';
import COLORS from '../../constants/colors';

const AddressInput = ({ 
    label, 
    value, 
    onChange, 
    onCoordinatesSet, 
    error,
    initialCoordinates 
}) => {
    const [coordinates, setCoordinates] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState(null);
    const [lastVerifiedAddress, setLastVerifiedAddress] = useState(null);
    const initialLoad = useRef(true);

    // Initialize with existing coordinates
    useEffect(() => {
        if (initialCoordinates) {
            setCoordinates(initialCoordinates);
            setLastVerifiedAddress(value);
        }
    }, [initialCoordinates]);

    // Reset verification if address changes
    useEffect(() => {
        if (value !== lastVerifiedAddress) {
            setLastVerifiedAddress(null);
            setCoordinates(null);
        }
    }, [value]);

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerificationError(null);
        try {
            const coords = await geocodeAddress(value);
            setCoordinates(coords);
            setLastVerifiedAddress(value);
            onCoordinatesSet(coords);
        } catch (err) {
            setVerificationError('Failed to verify address. Please check and try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <View style={styles.container}>
            
            <TextInput
                placeholder="Enter address manually"
                // style={[styles.input, error ? styles.errorInput : null]}
                outlineColor="#D8D8D8"
                mode="outlined"
                label={label}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:5, marginTop:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
                value={value}
                onChangeText={onChange}
                editable={!isVerifying}
                multiline
                numberOfLines={2}
            />

            
            {/* Verification Button */}
            <TouchableOpacity 
                style={styles.verifyButton} 
                onPress={handleVerify}
                disabled={isVerifying}
            >
                {isVerifying ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.verifyButtonText}>
                        {coordinates ? 'Verified' : 'Verify Address'}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Verification Status */}
            {coordinates && (
                <Text style={styles.verifiedText}>
                    Verified Location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </Text>
            )}
            {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
      marginBottom: 15,
  },
  label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 5,
      color: COLORS.dark,
  },
  input: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 5,
      padding: 10,
      fontSize: 14,
      backgroundColor: 'white',
  },
  errorInput: {
      borderColor: COLORS.red,
  },
  verifyButton: {
      backgroundColor: COLORS.primary,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
  },
  verifyButtonText: {
      color: 'white',
      fontWeight: 'bold',
  },
  verifiedText: {
      marginTop: 5,
      color: COLORS.green,
      fontSize: 12,
      fontStyle: 'italic',
  },
  errorText: {
      marginTop: 5,
      color: COLORS.red,
      fontSize: 12,
  },
});

export default AddressInput;