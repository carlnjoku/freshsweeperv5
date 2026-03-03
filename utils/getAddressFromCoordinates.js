import * as Location from 'expo-location';
import { countryCurrencyMap } from '../data';

// Function to reverse geocode coordinates into an address object
export const getAddressFromCoords = async ({ latitude, longitude }) => {
  try {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      console.warn('Invalid coordinates:', { latitude, longitude });
      return null;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

    return addresses?.[0] || null;

  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
};

// Function to get city and state from a scheduleItem using the above function
export const getCityState = async (scheduleItem) => {
    console.log(scheduleItem)
  if (
    !scheduleItem?.latitude ||
    !scheduleItem?.longitude
  ) {
    console.log('Missing coordinates in schedule item');
    return null;
  }

  const lat = Number(scheduleItem.latitude);
  const lng = Number(scheduleItem.longitude);

  const address = await getAddressFromCoords({ latitude: lat, longitude: lng });

  if (address) {
    const countryCode = address.isoCountryCode || 'N/A';
    const currencyInfo = countryCurrencyMap[countryCode] || { currency: 'N/A', symbol: 'N/A' };

    return {
      city: address.city || address.subregion || 'N/A',
      state: address.region || 'N/A',
      stateCode: address.regionCode || 'N/A',
      postalCode: address.postalCode || 'N/A',
      country: address.country || 'N/A',
      countryCode,
      currency: currencyInfo.currency,
      currencySymbol: currencyInfo.symbol
    }
  } else {
    console.log('Failed to retrieve address');
    return null;
  }
};

