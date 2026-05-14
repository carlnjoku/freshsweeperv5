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


import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import FloatingButton from '../../components/shared/FloatingButton';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { tSafe } from '../../utils/tSafe';

export default function Properties({ navigation }) {
  const { currentUserId } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  const fetchProperties = async () => {
    try {
      const response = await userService.getApartment(currentUserId);
      setProperties(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProperties();
    });
    fetchProperties();
    return unsubscribe;
  }, []);

  const handleOpenCreateBooking = () => {
    navigation.navigate(ROUTES.host_add_apt);
  };

  // Helper to get room counts from roomDetails array
  const getRoomCounts = (roomDetails) => {
    let bedrooms = 0;
    let bathrooms = 0;
    let totalSize = 0;

    if (roomDetails && Array.isArray(roomDetails)) {
      roomDetails.forEach(room => {
        const type = room.type?.toLowerCase();
        const number = room.number || 0;
        const size = room.size || 0;

        if (type === 'bedroom') bedrooms += number;
        if (type === 'bathroom') bathrooms += number;
        totalSize += size;
      });
    }
    return { bedrooms, bathrooms, totalSize };
  };

  // Property type icon mapping
  const getPropertyTypeIcon = (aptType) => {
    switch (aptType?.toLowerCase()) {
      case 'house':
        return 'home';
      case 'apartment':
        return 'home';
      case 'condo':
        return 'home';
      default:
        return 'home';
    }
  };

  const renderPropertyItem = ({ item }) => {
    const { bedrooms, bathrooms, totalSize } = getRoomCounts(item.roomDetails);
    const propertyType = item.apt_type || 'Property';
    const mainImage = null; // No image field in your current schema; can be added later

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.propertyCard}
        onPress={() =>
          navigation.navigate(ROUTES.host_apt_dashboard, {
            property: item,
            hostId: currentUserId,
          })
        }
      >
        {/* Left: Icon / Placeholder */}
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.propertyImage} />
          ) : (
            <View style={styles.iconPlaceholder}>
              <AntDesign
                name={getPropertyTypeIcon(propertyType)}
                size={40}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>

        {/* Middle: Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {item.apt_name}
          </Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>
            {item.address}
          </Text>

          {/* Room features row */}
          <View style={styles.roomFeatures}>
            <View style={styles.featureChip}>
              <MaterialCommunityIcons name="bed-king" size={14} color={COLORS.primary} />
              <Text style={styles.featureText}>
                {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
              </Text>
            </View>
            <View style={styles.featureChip}>
              <MaterialCommunityIcons name="shower" size={14} color={COLORS.primary} />
              <Text style={styles.featureText}>
                {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
              </Text>
            </View>
            {totalSize > 0 && (
              <View style={styles.featureChip}>
                <MaterialCommunityIcons name="ruler-square" size={14} color={COLORS.primary} />
                <Text style={styles.featureText}>{totalSize} sq ft</Text>
              </View>
            )}
          </View>

          {/* Property type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{propertyType}</Text>
          </View>
        </View>

        {/* Right: Chevron */}
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AntDesign name="home" size={64} color={COLORS.light_gray} />
      <Text style={styles.emptyTitle}>{tSafe('no_properties_yet', 'No Properties Yet')}</Text>
      <Text style={styles.emptySubtitle}>
        {tSafe('get_started_add_property', 'Get started by adding your first property')}
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateBooking}>
        <Text style={styles.createButtonText}>{tSafe('create_new_property', '+ Create New Property')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_properties', 'Loading properties...')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.white, '#F8F9FA']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tSafe('my_properties', 'My Properties')}</Text>
          <Text style={styles.headerSubtitle}>
            {properties.length}{' '}
            {properties.length === 1
              ? tSafe('property', 'property')
              : tSafe('properties_plural', 'properties')}{' '}
            {tSafe('listed', 'listed')}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={renderPropertyItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton
        onPress={handleOpenCreateBooking}
        color={COLORS.primary}
        icon={<AntDesign name="plus" size={24} color="white" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundColor,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  propertyAddress: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 6,
  },
  roomFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '500',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});