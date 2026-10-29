// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   RefreshControl,
//   Text,
//   KeyboardAvoidingView,
//   Keyboard,
//   Platform,
//   StatusBar,
//   Linking,
//   FlatList,
//   ScrollView,
//   Modal,
//   Image,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import FloatingButton from '../../components/shared/FloatingButton';
// import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function Properties({ navigation }) {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const [refreshing, setRefreshing] = useState(false);
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchProperties();
//     setRefreshing(false);
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setProperties(response.data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchProperties();
//     });
//     fetchProperties();
//     return unsubscribe;
//   }, []);

//   const handleOpenCreateBooking = () => {
//     navigation.navigate(ROUTES.host_add_apt);
//   };

//   const renderPropertyItem = ({ item }) => (
//     <TouchableOpacity
//       activeOpacity={0.8}
//       style={styles.propertyCard}
//       onPress={() =>
//         navigation.navigate(ROUTES.host_apt_dashboard, {
//           property: item,
//           hostId: currentUserId,
//         })
//       }
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.iconContainer}>
//           <AntDesign name="home" size={32} color={COLORS.primary} />
//         </View>
//         <View style={styles.infoContainer}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.apt_name}
//           </Text>
//           <Text style={styles.propertyAddress} numberOfLines={2}>
//             {item.address}
//           </Text>
//         </View>
//         <MaterialCommunityIcons
//           name="chevron-right"
//           size={24}
//           color={COLORS.gray}
//         />
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <AntDesign name="home" size={64} color={COLORS.lightGray} />
//       <Text style={styles.emptyTitle}>{tSafe('no_properties_yet', 'No Properties Yet')}</Text>
//       <Text style={styles.emptySubtitle}>
//         {tSafe('get_started_add_property', 'Get started by adding your first property')}
//       </Text>
//       <TouchableOpacity
//         style={styles.createButton}
//         onPress={handleOpenCreateBooking}
//       >
//         <Text style={styles.createButtonText}>{tSafe('create_new_property', '+ Create New Property')}</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_properties', 'Loading properties...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <LinearGradient
//         colors={[COLORS.white, '#F8F9FA']}
//         style={styles.headerGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//       >
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>{tSafe('my_properties', 'My Properties')}</Text>
//           <Text style={styles.headerSubtitle}>
//             {properties.length} {properties.length === 1 ? tSafe('property', 'property') : tSafe('properties_plural', 'properties')} {tSafe('listed', 'listed')}
//           </Text>
//         </View>
//       </LinearGradient>

//       <FlatList
//         data={properties}
//         keyExtractor={(item) => item._id}
//         renderItem={renderPropertyItem}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={renderEmptyState}
//         showsVerticalScrollIndicator={false}
//       />

//       <FloatingButton
//         onPress={handleOpenCreateBooking}
//         color={COLORS.primary}
//         icon={<AntDesign name="plus" size={24} color="white" />}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.backgroundColor,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.backgroundColor,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   headerGradient: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   header: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 80,
//   },
//   propertyCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     overflow: 'hidden',
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary + '15',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   propertyAddress: {
//     fontSize: 13,
//     color: COLORS.gray,
//     lineHeight: 18,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//     paddingTop: 100,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 30,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   createButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


// import React, { useState, useEffect, useContext } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   RefreshControl,
//   Text,
//   FlatList,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import FloatingButton from '../../components/shared/FloatingButton';
// import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
// import { tSafe } from '../../utils/tSafe';

// export default function Properties({ navigation }) {
//   const { currentUserId } = useContext(AuthContext);
//   const [refreshing, setRefreshing] = useState(false);
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchProperties();
//     setRefreshing(false);
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setProperties(response.data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchProperties();
//     });
//     fetchProperties();
//     return unsubscribe;
//   }, []);

//   const handleOpenCreateBooking = () => {
//     navigation.navigate(ROUTES.host_add_apt);
//   };

//   // Helper to get room counts from roomDetails array
//   const getRoomCounts = (roomDetails) => {
//     let bedrooms = 0;
//     let bathrooms = 0;
//     let totalSize = 0;

//     if (roomDetails && Array.isArray(roomDetails)) {
//       roomDetails.forEach(room => {
//         const type = room.type?.toLowerCase();
//         const number = room.number || 0;
//         const size = room.size || 0;

//         if (type === 'bedroom') bedrooms += number;
//         if (type === 'bathroom') bathrooms += number;
//         totalSize += size;
//       });
//     }
//     return { bedrooms, bathrooms, totalSize };
//   };

//   // Property type icon mapping
//   const getPropertyTypeIcon = (aptType) => {
//     switch (aptType?.toLowerCase()) {
//       case 'house':
//         return 'home';
//       case 'apartment':
//         return 'home';
//       case 'condo':
//         return 'home';
//       default:
//         return 'home';
//     }
//   };

//   const renderPropertyItem = ({ item }) => {
//     const { bedrooms, bathrooms, totalSize } = getRoomCounts(item.roomDetails);
//     const propertyType = item.apt_type || 'Property';
//     const mainImage = null; // No image field in your current schema; can be added later

//     return (
//       <TouchableOpacity
//         activeOpacity={0.8}
//         style={styles.propertyCard}
//         onPress={() =>
//           navigation.navigate(ROUTES.host_apt_dashboard, {
//             property: item,
//             hostId: currentUserId,
//           })
//         }
//       >
//         {/* Left: Icon / Placeholder */}
//         <View style={styles.imageContainer}>
//           {mainImage ? (
//             <Image source={{ uri: mainImage }} style={styles.propertyImage} />
//           ) : (
//             <View style={styles.iconPlaceholder}>
//               <AntDesign
//                 name={getPropertyTypeIcon(propertyType)}
//                 size={40}
//                 color={COLORS.primary}
//               />
//             </View>
//           )}
//         </View>

//         {/* Middle: Details */}
//         <View style={styles.detailsContainer}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.apt_name}
//           </Text>
//           <Text style={styles.propertyAddress} numberOfLines={1}>
//             {item.address}
//           </Text>

//           {/* Room features row */}
//           <View style={styles.roomFeatures}>
//             <View style={styles.featureChip}>
//               <MaterialCommunityIcons name="bed-king" size={14} color={COLORS.primary} />
//               <Text style={styles.featureText}>
//                 {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
//               </Text>
//             </View>
//             <View style={styles.featureChip}>
//               <MaterialCommunityIcons name="shower" size={14} color={COLORS.primary} />
//               <Text style={styles.featureText}>
//                 {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
//               </Text>
//             </View>
//             {totalSize > 0 && (
//               <View style={styles.featureChip}>
//                 <MaterialCommunityIcons name="ruler-square" size={14} color={COLORS.primary} />
//                 <Text style={styles.featureText}>{totalSize} sq ft</Text>
//               </View>
//             )}
//           </View>

//           {/* Property type badge */}
//           <View style={styles.typeBadge}>
//             <Text style={styles.typeText}>{propertyType}</Text>
//           </View>
//         </View>

//         {/* Right: Chevron */}
//         <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} style={styles.chevron} />
//       </TouchableOpacity>
//     );
//   };

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <AntDesign name="home" size={64} color={COLORS.light_gray} />
//       <Text style={styles.emptyTitle}>{tSafe('no_properties_yet', 'No Properties Yet')}</Text>
//       <Text style={styles.emptySubtitle}>
//         {tSafe('get_started_add_property', 'Get started by adding your first property')}
//       </Text>
//       <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateBooking}>
//         <Text style={styles.createButtonText}>{tSafe('create_new_property', '+ Create New Property')}</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_properties', 'Loading properties...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <LinearGradient
//         colors={[COLORS.white, '#F8F9FA']}
//         style={styles.headerGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//       >
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>{tSafe('my_properties', 'My Properties')}</Text>
//           <Text style={styles.headerSubtitle}>
//             {properties.length}{' '}
//             {properties.length === 1
//               ? tSafe('property', 'property')
//               : tSafe('properties_plural', 'properties')}{' '}
//             {tSafe('listed', 'listed')}
//           </Text>
//         </View>
//       </LinearGradient>

//       <FlatList
//         data={properties}
//         keyExtractor={(item) => item._id}
//         renderItem={renderPropertyItem}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         ListEmptyComponent={renderEmptyState}
//         showsVerticalScrollIndicator={false}
//       />

//       <FloatingButton
//         onPress={handleOpenCreateBooking}
//         color={COLORS.primary}
//         icon={<AntDesign name="plus" size={24} color="white" />}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.backgroundColor,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.backgroundColor,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   headerGradient: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   header: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 80,
//   },
//   propertyCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     alignItems: 'center',
//     padding: 12,
//   },
//   imageContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 12,
//     overflow: 'hidden',
//     marginRight: 12,
//   },
//   propertyImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   iconPlaceholder: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: COLORS.primary + '15',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   detailsContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   propertyAddress: {
//     fontSize: 13,
//     color: COLORS.gray,
//     marginBottom: 6,
//   },
//   roomFeatures: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 6,
//   },
//   featureChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.lightGray + '30',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 16,
//     gap: 4,
//   },
//   featureText: {
//     fontSize: 12,
//     color: COLORS.dark,
//     fontWeight: '500',
//   },
//   typeBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.primary + '10',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   typeText: {
//     fontSize: 10,
//     color: COLORS.primary,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//   },
//   chevron: {
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//     paddingTop: 100,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 30,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   createButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });





import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import FloatingButton from '../../components/shared/FloatingButton';

import { useTheme } from '../../theme';
import {
  AppText,
  AppCard,
  AppButton,
} from '../../ui';

import { tSafe } from '../../utils/tSafe';

const ROOM_TYPES = [
  {
    key: 'Bedroom',
    label: 'Bedrooms',
    singular: 'Bedroom',
    icon: 'bed-king-outline',
  },
  {
    key: 'Bathroom',
    label: 'Bathrooms',
    singular: 'Bathroom',
    icon: 'shower-head',
  },
  {
    key: 'Kitchen',
    label: 'Kitchens',
    singular: 'Kitchen',
    icon: 'fridge-outline',
  },
  {
    key: 'Livingroom',
    label: 'Living rooms',
    singular: 'Living room',
    icon: 'sofa-outline',
  },
];

const PROPERTY_TYPES = {
  house: {
    icon: 'home-variant-outline',
    label: 'House',
  },
  apartment: {
    icon: 'office-building-outline',
    label: 'Apartment',
  },
  condo: {
    icon: 'domain',
    label: 'Condo',
  },
  townhouse: {
    icon: 'home-city-outline',
    label: 'Townhouse',
  },
};

const getPropertyType = (type) => {
  const normalized = String(type || '').trim().toLowerCase();

  if (!normalized) {
    return {
      icon: 'home-outline',
      label: tSafe('property', 'Property'),
    };
  }

  return (
    PROPERTY_TYPES[normalized] || {
      icon: 'home-outline',
      label: normalized
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((word) => (
          word.charAt(0).toUpperCase() + word.slice(1)
        ))
        .join(' '),
    }
  );
};

/**
 * Handles roomDetails in the format:
 *
 * [
 *   { type: 'Bedroom', number: 2, size: 120 },
 *   { type: 'Bathroom', number: 1, size: 120 }
 * ]
 *
 * The room count uses `number`.
 * Total area uses `number * size`, assuming `size`
 * represents the area of one room of that type.
 */
const getRoomSummary = (roomDetails) => {
  const summary = {
    bedrooms: 0,
    bathrooms: 0,
    kitchens: 0,
    livingrooms: 0,
    totalRooms: 0,
    totalSize: 0,
    roomCounts: {},
  };

  if (!Array.isArray(roomDetails)) {
    return summary;
  }

  roomDetails.forEach((room) => {
    if (!room || typeof room !== 'object') {
      return;
    }

    const type = String(room.type || '').trim().toLowerCase();

    const count = Math.max(
      0,
      Number(room.number) || 0
    );

    const size = Math.max(
      0,
      Number(room.size) || 0
    );

    summary.totalRooms += count;

    // Each entry represents the area of one room of this type.
    summary.totalSize += count * size;

    if (type === 'bedroom') {
      summary.bedrooms += count;
    } else if (type === 'bathroom') {
      summary.bathrooms += count;
    } else if (type === 'kitchen') {
      summary.kitchens += count;
    } else if (
      type === 'livingroom' ||
      type === 'living room'
    ) {
      summary.livingrooms += count;
    }

    summary.roomCounts[type] =
      (summary.roomCounts[type] || 0) + count;
  });

  return summary;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

export default function Properties({ navigation }) {
  const { currentUserId } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  /**
   * Fetch properties safely.
   *
   * The optional silent flag allows focus refreshes to avoid
   * replacing the screen with a full-page loader.
   */
  const fetchProperties = useCallback(
    async ({ showLoader = false } = {}) => {
      if (!currentUserId) {
        setProperties([]);
        setErrorMessage(
          tSafe(
            'user_session_unavailable',
            'Your session is unavailable. Please sign in again.'
          )
        );
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      setErrorMessage('');

      try {
        const response = await userService.getApartment(
          currentUserId
        );

        const responseData = response?.data;

        // Support an array response and common wrapped responses.
        const fetchedProperties = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.properties)
            ? responseData.properties
            : Array.isArray(responseData?.data)
              ? responseData.data
              : [];

        setProperties(fetchedProperties);
      } catch (error) {
        console.error(
          'Failed to fetch properties:',
          error?.response?.data || error?.message || error
        );

        setErrorMessage(
          tSafe(
            'properties_load_error',
            'We could not load your properties. Please try again.'
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId]
  );

  /**
   * Refresh whenever this screen becomes active.
   *
   * useFocusEffect also handles cleanup when the screen loses focus.
   */
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!active) {
          return;
        }

        await fetchProperties({
          showLoader: properties.length === 0,
        });
      };

      load();

      return () => {
        active = false;
      };
    }, [fetchProperties, properties.length])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchProperties();
  }, [fetchProperties]);

  const handleOpenCreateProperty = useCallback(() => {
    navigation.navigate(ROUTES.host_add_apt);
  }, [navigation]);

  const handleOpenProperty = useCallback(
    (property) => {
      if (!property?._id) {
        return;
      }

      navigation.navigate(
        ROUTES.host_apt_dashboard,
        {
          property,
          hostId: currentUserId,
        }
      );
    },
    [navigation, currentUserId]
  );

  const propertyCountLabel = useMemo(() => {
    const count = properties.length;

    return `${count} ${
      count === 1
        ? tSafe('property', 'property')
        : tSafe('properties_plural', 'properties')
    } ${tSafe('listed', 'listed')}`;
  }, [properties.length]);

  const renderPropertyItem = useCallback(
    ({ item, index }) => {
      const roomSummary = getRoomSummary(
        item?.roomDetails
      );

      const propertyType = getPropertyType(
        item?.apt_type
      );

      const propertyName =
        item?.apt_name ||
        tSafe('unnamed_property', 'Unnamed property');

      const address =
        item?.address ||
        tSafe(
          'address_not_available',
          'Address not provided'
        );

      return (
        <AppCard
          key={item?._id || `property-${index}`}
          bordered
          padding="medium"
          radius="large"
          style={styles.propertyCard}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons
                name={propertyType.icon}
                size={30}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.propertyDetails}>
              <AppText
                variant="title"
                color={theme.text.primary}
                numberOfLines={1}
                style={styles.propertyName}
              >
                {propertyName}
              </AppText>

              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={15}
                  color={theme.icon.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  numberOfLines={2}
                  style={styles.addressText}
                >
                  {address}
                </AppText>
              </View>

              <View style={styles.propertyTypeBadge}>
                <MaterialCommunityIcons
                  name="home-outline"
                  size={13}
                  color={theme.brand.primary}
                />

                <AppText
                  variant="caption"
                  color={theme.brand.primary}
                  weight="600"
                >
                  {propertyType.label}
                </AppText>
              </View>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.icon.muted}
            />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.roomStatsGrid}>
            <View style={styles.roomStat}>
              <MaterialCommunityIcons
                name="bed-king-outline"
                size={19}
                color={theme.brand.primary}
              />

              <AppText
                variant="bodyMedium"
                color={theme.text.primary}
                weight="600"
              >
                {roomSummary.bedrooms}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {tSafe('bedrooms', 'Bedrooms')}
              </AppText>
            </View>

            <View style={styles.roomStat}>
              <MaterialCommunityIcons
                name="shower-head"
                size={19}
                color={theme.brand.primary}
              />

              <AppText
                variant="bodyMedium"
                color={theme.text.primary}
                weight="600"
              >
                {roomSummary.bathrooms}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {tSafe('bathrooms', 'Bathrooms')}
              </AppText>
            </View>

            <View style={styles.roomStat}>
              <MaterialCommunityIcons
                name="door-open"
                size={19}
                color={theme.brand.primary}
              />

              <AppText
                variant="bodyMedium"
                color={theme.text.primary}
                weight="600"
              >
                {roomSummary.totalRooms}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {tSafe('total_rooms', 'Total rooms')}
              </AppText>
            </View>

            <View style={styles.roomStat}>
              <MaterialCommunityIcons
                name="ruler-square"
                size={19}
                color={theme.brand.primary}
              />

              <AppText
                variant="bodyMedium"
                color={theme.text.primary}
                weight="600"
                numberOfLines={1}
              >
                {formatNumber(roomSummary.totalSize)}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.secondary}
              >
                {tSafe('sq_ft', 'sq ft')}
              </AppText>
            </View>
          </View>

          <AppButton
            title={tSafe(
              'view_property',
              'View property'
            )}
            variant="outline"
            size="medium"
            fullWidth
            icon="arrow-right"
            iconPosition="right"
            onPress={() => handleOpenProperty(item)}
            style={styles.viewPropertyButton}
          />
        </AppCard>
      );
    },
    [
      styles,
      theme,
      handleOpenProperty,
    ]
  );

  const renderEmptyState = useCallback(() => {
    if (errorMessage) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={44}
              color={theme.status.error}
            />
          </View>

          <AppText
            variant="heading"
            color={theme.text.primary}
            align="center"
            style={styles.emptyTitle}
          >
            {tSafe(
              'properties_unavailable',
              'Properties unavailable'
            )}
          </AppText>

          <AppText
            variant="body"
            color={theme.text.secondary}
            align="center"
            style={styles.emptyDescription}
          >
            {errorMessage}
          </AppText>

          <AppButton
            title={tSafe('try_again', 'Try again')}
            onPress={() =>
              fetchProperties({ showLoader: true })
            }
            icon="refresh"
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="home-plus-outline"
            size={48}
            color={theme.brand.primary}
          />
        </View>

        <AppText
          variant="heading"
          color={theme.text.primary}
          align="center"
          style={styles.emptyTitle}
        >
          {tSafe(
            'no_properties_yet',
            'No properties yet'
          )}
        </AppText>

        <AppText
          variant="body"
          color={theme.text.secondary}
          align="center"
          style={styles.emptyDescription}
        >
          {tSafe(
            'get_started_add_property',
            'Add your first property to start organizing your cleaning schedules and supplies.'
          )}
        </AppText>

        <AppButton
          title={tSafe(
            'create_new_property',
            'Create new property'
          )}
          onPress={handleOpenCreateProperty}
          icon="plus"
        />
      </View>
    );
  }, [
    errorMessage,
    styles,
    theme,
    fetchProperties,
    handleOpenCreateProperty,
  ]);

  if (loading && properties.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <MaterialCommunityIcons
              name="home-city-outline"
              size={34}
              color={theme.brand.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
            style={styles.loadingIndicator}
          />

          <AppText
            variant="bodyMedium"
            color={theme.text.secondary}
          >
            {tSafe(
              'loading_properties',
              'Loading your properties...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <AppText
              variant="display"
              color={theme.text.primary}
              style={styles.headerTitle}
            >
              {tSafe('my_properties', 'My properties')}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
            >
              {tSafe(
                'manage_your_spaces',
                'Manage your cleaning spaces'
              )}
            </AppText>
          </View>

          <View style={styles.countBadge}>
            <MaterialCommunityIcons
              name="home-group"
              size={18}
              color={theme.brand.primary}
            />

            <AppText
              variant="bodyMedium"
              color={theme.brand.primary}
              weight="600"
            >
              {properties.length}
            </AppText>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={22}
              color={theme.status.success}
            />
          </View>

          <View style={styles.summaryTextContainer}>
            <AppText
              variant="bodyMedium"
              color={theme.text.primary}
              weight="600"
            >
              {propertyCountLabel}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
            >
              {tSafe(
                'properties_summary',
                'Your properties in one place'
              )}
            </AppText>
          </View>
        </View>

        {errorMessage && properties.length > 0 ? (
          <View style={styles.inlineError}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color={theme.status.error}
            />

            <View style={styles.inlineErrorText}>
              <AppText
                variant="caption"
                color={theme.status.error}
              >
                {errorMessage}
              </AppText>
            </View>

            <AppButton
              title={tSafe('retry', 'Retry')}
              variant="ghost"
              size="small"
              onPress={() =>
                fetchProperties({ showLoader: false })
              }
            />
          </View>
        ) : null}

        <FlatList
          data={properties}
          keyExtractor={(item, index) =>
            String(item?._id || `property-${index}`)
          }
          renderItem={renderPropertyItem}
          contentContainerStyle={[
            styles.listContainer,
            properties.length === 0 &&
              styles.emptyListContainer,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.brand.primary}
              colors={[theme.brand.primary]}
              progressBackgroundColor={theme.surface.elevated}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={false}
        />
      </View>

      {properties.length > 0 && (
        <FloatingButton
          onPress={handleOpenCreateProperty}
          color={theme.brand.primary}
          icon={
            <MaterialCommunityIcons
              name="plus"
              size={27}
              color={theme.button.primaryText}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    screen: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    headerTextContainer: {
      flex: 1,
      paddingRight: 12,
    },

    headerTitle: {
      marginBottom: 5,
    },

    countBadge: {
      minWidth: 62,
      minHeight: 44,
      borderRadius: 16,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    summaryContainer: {
      marginHorizontal: 20,
      marginBottom: 8,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    summaryIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.background.sunken,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    summaryTextContainer: {
      flex: 1,
    },

    inlineError: {
      marginHorizontal: 20,
      marginTop: 8,
      marginBottom: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.status.error,
      backgroundColor: theme.surface.elevated,
      gap: 8,
    },

    inlineErrorText: {
      flex: 1,
    },

    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 110,
      flexGrow: 1,
    },

    emptyListContainer: {
      flexGrow: 1,
    },

    propertyCard: {
      marginBottom: 14,
      backgroundColor: theme.card.background,
      borderColor: theme.card.border,
    },

    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    propertyIconContainer: {
      width: 58,
      height: 58,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 12,
    },

    propertyDetails: {
      flex: 1,
      minWidth: 0,
    },

    propertyName: {
      marginBottom: 5,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 9,
    },

    addressText: {
      flex: 1,
      marginLeft: 4,
      lineHeight: 18,
    },

    propertyTypeBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
      backgroundColor: theme.surface.selected,
      gap: 5,
    },

    cardDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
      marginTop: 16,
      marginBottom: 14,
    },

    roomStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 16,
      marginBottom: 16,
    },

    roomStat: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingRight: 6,
    },

    viewPropertyButton: {
      marginTop: 2,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.default,
      padding: 24,
    },

    loadingIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginBottom: 20,
    },

    loadingIndicator: {
      marginBottom: 14,
    },

    emptyContainer: {
      flexGrow: 1,
      minHeight: 320,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 48,
    },

    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginBottom: 22,
    },

    emptyTitle: {
      marginBottom: 10,
    },

    emptyDescription: {
      lineHeight: 22,
      marginBottom: 24,
      maxWidth: 340,
    },
  });