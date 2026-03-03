// // geocoding.js
// import { GOOGLE_MAPS_API_KEY } from "../secret";
// const apiKey = GOOGLE_MAPS_API_KEY; // Replace with your actual API key

// export const geocodeAddress = async (address) => {
//   try {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status === 'OK' && data.results.length > 0) {
//       const location = data.results[0].geometry.location;
//       const latitude = location.lat;
//       const longitude = location.lng;

//       // Initialize variables to store city, state, country, and postal code
//       let cityLong = '';
//       let cityShort = '';
//       let stateLong = '';
//       let stateShort = '';
//       let countryLong = '';
//       let countryShort = '';
//       let postalCode = '';

//       // Ensure that address_components exists and is an array
//       if (data.results[0].address_components && Array.isArray(data.results[0].address_components)) {
//         const addressComponents = data.results[0].address_components;

//         // Traverse through address components to find city, state, country, and postal code
//         for (let component of addressComponents) {
//           const types = component.types;

//           if (types.includes('locality')) {
//             cityLong = component.long_name;
//             cityShort = component.short_name;
//           }
//           if (types.includes('administrative_area_level_1')) {
//             stateLong = component.long_name;
//             stateShort = component.short_name;
//           }
//           if (types.includes('country')) {
//             countryLong = component.long_name;
//             countryShort = component.short_name;
//           }
//           if (types.includes('postal_code')) {
//             postalCode = component.long_name;
//           }
//         }
//       }

//       return {
//         latitude,
//         longitude,
//         cityLong,
//         cityShort,
//         stateLong,
//         stateShort,
//         countryLong,
//         countryShort,
//         postalCode,
//       };
//     } else {
//       throw new Error(`Geocoding failed: ${data.status}`);
//     }
//   } catch (error) {
//     console.error('Geocoding error:', error);
//     throw error;
//   }
// };





// // geocoding.js
// import { GOOGLE_MAPS_API_KEY } from "../secret";
// import * as Location from 'expo-location';

// const apiKey = GOOGLE_MAPS_API_KEY;

// const parseGoogleComponents = (addressComponents) => {
//   let cityLong = '', cityShort = '', stateLong = '', stateShort = '';
//   let countryLong = '', countryShort = '', postalCode = '';

//   addressComponents.forEach(component => {
//     if (component.types.includes('locality')) {
//       cityLong = component.long_name;
//       cityShort = component.short_name;
//     }
//     if (component.types.includes('administrative_area_level_1')) {
//       stateLong = component.long_name;
//       stateShort = component.short_name;
//     }
//     if (component.types.includes('country')) {
//       countryLong = component.long_name;
//       countryShort = component.short_name;
//     }
//     if (component.types.includes('postal_code')) {
//       postalCode = component.long_name;
//     }
//   });

//   return { cityLong, cityShort, stateLong, stateShort, countryLong, countryShort, postalCode };
// };

// const parseExpoComponents = (expoResult) => ({
//   cityLong: expoResult.city || '',
//   cityShort: expoResult.city || '',
//   stateLong: expoResult.region || '',
//   stateShort: expoResult.region || '',
//   countryLong: expoResult.country || '',
//   countryShort: expoResult.country || '',
//   postalCode: expoResult.postalCode || ''
// });

// export const geocodeAddress = async (address) => {
//   try {
//     // First try Google Geocoding API
//     const googleResponse = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
//     );
//     const googleData = await googleResponse.json();

//     if (googleData.status === 'OK' && googleData.results.length > 0) {
//       const location = googleData.results[0].geometry.location;
//       const components = parseGoogleComponents(googleData.results[0].address_components);
      
//       return {
//         ...location,
//         ...components,
//         source: 'google'
//       };
//     }
//     throw new Error(`Google Geocoding failed: ${googleData.status}`);
    
//   } catch (googleError) {
//     console.log('Falling back to Expo Location...');
    
//     try {
//       // Fallback to Expo Location
//       const expoResults = await Location.geocodeAsync(address);

//       // console.log(expoResults)
      
//       if (expoResults.length === 0) {
//         throw new Error('No results from Expo Location');
//       }

//       const { latitude, longitude } = expoResults[0];
//       const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      
//       if (reverseGeocode.length === 0) {
//         throw new Error('Reverse geocoding failed');
//       }

//       return {
//         latitude,
//         longitude,
//         ...parseExpoComponents(reverseGeocode[0]),
//         source: 'expo'
//       };
      
//     } catch (expoError) {
//       console.error('Both geocoding methods failed:', expoError);
//       throw new Error('Address lookup failed using both Google and Expo methods');
//     }
//   }
// };






// geocoding.js
import { GOOGLE_MAPS_API_KEY } from "../secret";
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native'; // optional for user feedback

const apiKey = GOOGLE_MAPS_API_KEY;

// Helper to request location permission (only called when needed)
const requestLocationPermission = async () => {
  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is required to use the fallback geocoding service.');
  }
  return true;
};

const parseGoogleComponents = (addressComponents) => {
  let cityLong = '', cityShort = '', stateLong = '', stateShort = '';
  let countryLong = '', countryShort = '', postalCode = '';

  addressComponents.forEach(component => {
    if (component.types.includes('locality')) {
      cityLong = component.long_name;
      cityShort = component.short_name;
    }
    if (component.types.includes('administrative_area_level_1')) {
      stateLong = component.long_name;
      stateShort = component.short_name;
    }
    if (component.types.includes('country')) {
      countryLong = component.long_name;
      countryShort = component.short_name;
    }
    if (component.types.includes('postal_code')) {
      postalCode = component.long_name;
    }
  });

  return { cityLong, cityShort, stateLong, stateShort, countryLong, countryShort, postalCode };
};

const parseExpoComponents = (expoResult) => ({
  cityLong: expoResult.city || '',
  cityShort: expoResult.city || '',
  stateLong: expoResult.region || '',
  stateShort: expoResult.region || '',
  countryLong: expoResult.country || '',
  countryShort: expoResult.country || '',
  postalCode: expoResult.postalCode || ''
});

export const geocodeAddress = async (address) => {
  // First try Google Geocoding API (no permissions needed)
  try {
    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const googleData = await googleResponse.json();

    if (googleData.status === 'OK' && googleData.results.length > 0) {
      const location = googleData.results[0].geometry.location;
      const components = parseGoogleComponents(googleData.results[0].address_components);
      return {
        ...location,
        ...components,
        source: 'google'
      };
    }
    throw new Error(`Google Geocoding failed: ${googleData.status}`);
  } catch (googleError) {
    console.log('Google geocoding error, falling back to Expo Location:', googleError.message);
  }

  // Fallback to Expo Location – may require permission
  try {
    // Request permission before using Expo Location (only on Android, but safe on iOS)
    await requestLocationPermission();

    const expoResults = await Location.geocodeAsync(address);
    if (expoResults.length === 0) {
      throw new Error('No results from Expo Location');
    }

    const { latitude, longitude } = expoResults[0];
    const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverseGeocode.length === 0) {
      throw new Error('Reverse geocoding failed');
    }

    return {
      latitude,
      longitude,
      ...parseExpoComponents(reverseGeocode[0]),
      source: 'expo'
    };
  } catch (expoError) {
    // Permission denied or other error
    console.error('Expo fallback failed:', expoError.message);
    // Optionally show an alert for debugging (remove in production)
    if (__DEV__) {
      Alert.alert('Geocoding Error', expoError.message);
    }
    throw new Error('Address lookup failed using both Google and Expo methods');
  }
};

// Optional: export a standalone permission request function for components that need it
export const ensureLocationPermission = requestLocationPermission;