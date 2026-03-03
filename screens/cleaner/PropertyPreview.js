// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// // import CustomCard from '../../../components/shared/CustomCard'; // adjust if you have this
// import CustomCard from '../../components/shared/CustomCard';

// // Mock API function – replace with your actual fetch logic
// const fetchPropertyById = async () => {
//   // Simulate API call
    
//   return {
//     _id: "id",
//     userId: "697480fac76902f010adf82b",
//     checklistId: [],
//     owner_info: {
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "555-1234"
//     },
//     apt_name: "Lucy Parlour",
//     instructions: "AsopfioaiSF. Son osjOIjs",
//     cleaning_supplies: "yes",
//     contact_phone: "9733655242",
//     address: "566 South 17th street, Newark, nj",
//     longitude: -74.2083,
//     latitude: 40.7377,
//     created_on: { $date: "2023-01-15T10:30:00Z" },
//     preferredCleaners: ["Alice", "Bob"],
//     apt_type: "house",
//     roomDetails: [
//       { type: "Bedroom", number: 2, size: 180, size_range: "large" },
//       { type: "Bathroom", number: 1, size: 50, size_range: "medium" },
//       { type: "Livingroom", number: 1, size: 200, size_range: "large" },
//       { type: "Kitchen", number: 1, size: 120, size_range: "medium" }
//     ],
//     checklists: [
//       { name: "Deep Clean", date: "2023-06-01" },
//       { name: "Move-out", date: "2023-05-15" }
//     ]
//   };
// };

// const PropertyPreview = () => {
//   const route = useRoute();
//   const { propertyId, inviteToken } = route.params;
//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);


//   useEffect(() => {
//     alert(propertyId)
//     if (inviteToken) {
//     //   acceptInvite(inviteToken);
//     }
//   }, [inviteToken]);

//   useEffect(() => {
//     const loadProperty = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchPropertyById(propertyId);
//         setProperty(data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load property details');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProperty();
//   }, [propertyId]);

//   const openMap = () => {
//     const url = `https://maps.apple.com/?q=${property.latitude},${property.longitude}`;
//     Linking.openURL(url);
//   };

//   const getAptTypeIcon = (type) => {
//     switch (type) {
//       case 'apartment': return 'office-building';
//       case 'house': return 'home';
//       case 'townhouse': return 'townhouse';
//       default: return 'home-outline';
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading property...</Text>
//       </View>
//     );
//   }

//   if (error || !property) {
//     return (
//       <View style={styles.centered}>
//         <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
//         <Text style={styles.errorText}>{error || 'Property not found'}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         {inviteToken && (
//             <CustomCard style={styles.sectionCard}>
//                 <Text style={styles.sectionTitle}>
//                 Property Invitation
//                 </Text>
//                 <Text style={{ marginBottom: 12 }}>
//                 You’ve been invited to clean this property.
//                 </Text>

//                 <TouchableOpacity style={styles.acceptButton}>
//                 <Text style={styles.acceptButtonText}>Accept Invitation</Text>
//                 </TouchableOpacity>
//             </CustomCard>
//         )}

// {inviteToken && (
//   <View style={styles.inviteBanner}>
//     <MaterialCommunityIcons
//       name="account-check"
//       size={20}
//       color={COLORS.primary}
//     />
//     <Text style={styles.inviteBannerText}>
//       You've been invited to clean this property. Please review the details below.
//     </Text>
//   </View>
// )}

//       {/* Header: Property name and type */}
//       <View style={styles.header}>
//         <View style={styles.titleRow}>
//           <MaterialCommunityIcons
//             name={getAptTypeIcon(property.apt_type)}
//             size={32}
//             color={COLORS.primary}
//           />
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//         </View>
//         <Text style={styles.propertyType}>{property.apt_type.toUpperCase()}</Text>
//       </View>

//       {/* Address with map link */}
//       <TouchableOpacity style={styles.addressCard} onPress={openMap}>
//         <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
//         <Text style={styles.addressText}>{property.address}</Text>
//         <MaterialIcons name="launch" size={16} color={COLORS.gray} style={styles.launchIcon} />
//       </TouchableOpacity>

//       {/* Owner & Contact */}
//       <CustomCard style={styles.sectionCard}>
//         <Text style={styles.sectionTitle}>Owner & Contact</Text>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Owner:</Text>
//           <Text style={styles.infoValue}>{property.owner_info?.name || 'N/A'}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Email:</Text>
//           <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Contact:</Text>
//           <Text style={styles.infoValue}>{property.contact_phone || property.owner_info?.phone || 'N/A'}</Text>
//         </View>
//       </CustomCard>

//       {/* Instructions */}
//       {property.instructions && (
//         <CustomCard style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Instructions</Text>
//           <Text style={styles.instructionsText}>{property.instructions}</Text>
//         </CustomCard>
//       )}

//       {/* Cleaning Supplies */}
//       <CustomCard style={styles.sectionCard}>
//         <View style={styles.rowBetween}>
//           <Text style={styles.sectionTitle}>Cleaning Supplies</Text>
//           <View style={[
//             styles.suppliesBadge,
//             { backgroundColor: property.cleaning_supplies === 'yes' ? COLORS.success + '20' : COLORS.warning + '20' }
//           ]}>
//             <Text style={[
//               styles.suppliesBadgeText,
//               { color: property.cleaning_supplies === 'yes' ? COLORS.success : COLORS.warning }
//             ]}>
//               {property.cleaning_supplies === 'yes' ? 'Provided' : 'Not provided'}
//             </Text>
//           </View>
//         </View>
//       </CustomCard>

//       {/* Preferred Cleaners */}
//       {property.preferredCleaners?.length > 0 && (
//         <CustomCard style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Preferred Cleaners</Text>
//           <View style={styles.cleanersContainer}>
//             {property.preferredCleaners.map((cleaner, idx) => (
//               <View key={idx} style={styles.cleanerChip}>
//                 <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
//                 <Text style={styles.cleanerChipText}>{cleaner}</Text>
//               </View>
//             ))}
//           </View>
//         </CustomCard>
//       )}

//       {/* Room Details */}
//       <CustomCard style={styles.sectionCard}>
//         <Text style={styles.sectionTitle}>Room Details</Text>
//         {property.roomDetails?.map((room, index) => (
//           <View key={index} style={styles.roomItem}>
//             <View style={styles.roomIconAndType}>
//               <MaterialCommunityIcons
//                 name={getRoomIcon(room.type)}
//                 size={22}
//                 color={COLORS.primary}
//               />
//               <Text style={styles.roomType}>{room.type}</Text>
//             </View>
//             <View style={styles.roomStats}>
//               <Text style={styles.roomCount}>{room.number} {room.number > 1 ? 'rooms' : 'room'}</Text>
//               <Text style={styles.roomSize}> • {room.size} sq ft</Text>
//               <Text style={[styles.roomSizeRange, { color: COLORS.darkGray }]}>
//                 ({room.size_range})
//               </Text>
//             </View>
//           </View>
//         ))}
//       </CustomCard>

//       {/* Past Checklists */}
//       {property.checklists?.length > 0 && (
//         <CustomCard style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Recent Checklists</Text>
//           {property.checklists.map((checklist, idx) => (
//             <View key={idx} style={styles.checklistItem}>
//               <MaterialCommunityIcons name="clipboard-text" size={18} color={COLORS.gray} />
//               <Text style={styles.checklistName}>{checklist.name}</Text>
//               <Text style={styles.checklistDate}>{new Date(checklist.date).toLocaleDateString()}</Text>
//             </View>
//           ))}
//         </CustomCard>
//       )}
//     </ScrollView>
//   );
// };

// // Helper for room icons
// const getRoomIcon = (type) => {
//   switch (type) {
//     case 'Bedroom': return 'bed-outline';
//     case 'Bathroom': return 'shower';
//     case 'Livingroom': return 'sofa-outline';
//     case 'Kitchen': return 'fridge-outline';
//     default: return 'door-open';
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 16,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.error,
//   },
//   header: {
//     marginTop: 20,
//     marginBottom: 16,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   propertyName: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#333',
//   },
//   propertyType: {
//     marginTop: 4,
//     fontSize: 14,
//     color: COLORS.gray,
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },
//   addressCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#eaeaea',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   addressText: {
//     flex: 1,
//     fontSize: 15,
//     color: '#555',
//     marginLeft: 8,
//   },
//   launchIcon: {
//     marginLeft: 8,
//   },
//   sectionCard: {
//     marginBottom: 16,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#eaeaea',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 12,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   infoLabel: {
//     width: 60,
//     fontSize: 14,
//     color: COLORS.darkGray,
//     marginLeft: 8,
//   },
//   infoValue: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   instructionsText: {
//     fontSize: 15,
//     color: '#555',
//     lineHeight: 22,
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   suppliesBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   suppliesBadgeText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   cleanersContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   cleanerChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 4,
//   },
//   cleanerChipText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   roomItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   roomIconAndType: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   roomType: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#333',
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   roomCount: {
//     fontSize: 14,
//     color: '#666',
//   },
//   roomSize: {
//     fontSize: 14,
//     color: '#666',
//   },
//   roomSizeRange: {
//     fontSize: 13,
//     marginLeft: 4,
//     textTransform: 'capitalize',
//   },
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     gap: 8,
//   },
//   checklistName: {
//     flex: 1,
//     fontSize: 15,
//     color: '#333',
//   },
//   checklistDate: {
//     fontSize: 13,
//     color: COLORS.gray,
//   },
//   inviteBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary + '15',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 16,
//     marginBottom: 12,
//     gap: 8,
//   },
  
//   inviteBannerText: {
//     flex: 1,
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
// });

// export default PropertyPreview;




import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import COLORS from '../../constants/colors';
import CustomCard from '../../components/shared/CustomCard';

/* ---------------- MOCK FETCH ---------------- */
const fetchPropertyById = async () => {
  return {
    _id: "id",
    apt_name: "Lucy Parlour",
    apt_type: "house",
    address: "566 South 17th street, Newark, nj",
    latitude: 40.7377,
    longitude: -74.2083,
    instructions: "Please focus on deep cleaning the kitchen and bathrooms.",
    cleaning_supplies: "yes",
    owner_info: {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234"
    },
    contact_phone: "9733655242",
    roomDetails: [
      { type: "Bedroom", number: 2, size: 180, size_range: "large" },
      { type: "Bathroom", number: 1, size: 50, size_range: "medium" },
      { type: "Livingroom", number: 1, size: 200, size_range: "large" },
      { type: "Kitchen", number: 1, size: 120, size_range: "medium" }
    ],
  };
};
/* ------------------------------------------------ */

export default function PropertyPreview() {
  const route = useRoute();
  const { propertyId, inviteToken } = route.params || {};

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState(
    inviteToken ? 'pending' : null
  );

  const scrollRef = useRef(null);

  /* ---------------- LOAD PROPERTY ---------------- */
  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await fetchPropertyById(propertyId);
        setProperty(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [propertyId]);
  /* ------------------------------------------------ */

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (inviteToken && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }, 300);
    }
  }, [inviteToken]);
  /* ------------------------------------------------ */

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12 }}>Loading property...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Text>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* -------- Invite Banner (Reusable Component) -------- */}
      {inviteToken && (
        <InviteBanner
          status={inviteStatus}
          onAccept={() => {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            setInviteStatus('accepted');
          }}
          onDecline={() => {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            setInviteStatus('declined');
          }}
        />
      )}

      {/* Property Header */}
      <View style={styles.header}>
        <Text style={styles.propertyName}>{property.apt_name}</Text>
        <Text style={styles.propertyType}>
          {property.apt_type.toUpperCase()}
        </Text>
      </View>

      {/* Address */}
      <TouchableOpacity
        style={styles.addressCard}
        onPress={() =>
          Linking.openURL(
            `https://maps.apple.com/?q=${property.latitude},${property.longitude}`
          )
        }
      >
        <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
        <Text style={styles.addressText}>{property.address}</Text>
      </TouchableOpacity>
  
        {/* Owner & Contact */}
       <CustomCard style={styles.sectionCard}>
         <Text style={styles.sectionTitle}>Owner & Contact</Text>
         <View style={styles.infoRow}>
           <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
           <Text style={styles.infoLabel}>Owner:</Text>
           <Text style={styles.infoValue}>{property.owner_info?.name || 'N/A'}</Text>
         </View>
         <View style={styles.infoRow}>
           <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
           <Text style={styles.infoLabel}>Email:</Text>
           <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
         </View>
         <View style={styles.infoRow}>
           <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
           <Text style={styles.infoLabel}>Contact:</Text>
           <Text style={styles.infoValue}>{property.contact_phone || property.owner_info?.phone || 'N/A'}</Text>
         </View>
       </CustomCard>

      {/* Instructions */}
      {property.instructions && (
        <CustomCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text>{property.instructions}</Text>
        </CustomCard>
      )}

      {/* Room Details Section */}
      <CustomCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Room Details</Text>
        {property.roomDetails?.map((room, index) => (
          <View key={index} style={styles.roomItem}>
            <View style={styles.roomIconAndType}>
              <MaterialCommunityIcons
                name={getRoomIcon(room.type)}
                size={22}
                color={COLORS.primary}
              />
              <Text style={styles.roomType}>{room.type}</Text>
            </View>
            <View style={styles.roomStats}>
              <Text style={styles.roomCount}>
                {room.number} {room.number > 1 ? 'rooms' : 'room'}
              </Text>
              <Text style={styles.roomSize}> • {room.size} sq ft</Text>
              <Text style={[styles.roomSizeRange]}>
                ({room.size_range})
              </Text>
            </View>
          </View>
        ))}
      </CustomCard>

    </ScrollView>
  );
}

/* ---------------- Reusable InviteBanner ---------------- */

const InviteBanner = ({ status, onAccept, onDecline }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (status === 'declined') return null;

  return (
    <Animated.View
      style={[
        styles.inviteCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {status === 'pending' && (
        <>
          <Text style={styles.inviteTitle}>You're Invited </Text>
          <Text style={styles.inviteText}>
            You've been invited to clean this property.
          </Text>

          <View style={styles.inviteButtons}>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {status === 'accepted' && (
        <View style={styles.acceptedRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={COLORS.success}
          />
          <Text style={styles.acceptedText}>
            Invitation accepted.
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

/* ---------------- Room Icon Helper ---------------- */

const getRoomIcon = (type) => {
  switch (type) {
    case 'Bedroom': return 'bed-outline';
    case 'Bathroom': return 'shower';
    case 'Livingroom': return 'sofa-outline';
    case 'Kitchen': return 'fridge-outline';
    default: return 'door-open';
  }
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    marginBottom: 16,
    elevation: 3,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  inviteText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  inviteButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptedText: {
    color: COLORS.success,
    fontWeight: '600',
  },

  header: { marginBottom: 16 },
  propertyName: { fontSize: 24, fontWeight: '700' },
  propertyType: { fontSize: 14, color: '#666' },

  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  addressText: { marginLeft: 8 },

  sectionCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },

  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  roomIconAndType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomType: { fontWeight: '500' },
  roomStats: { flexDirection: 'row', alignItems: 'center' },
  roomCount: { color: '#666' },
  roomSize: { color: '#666' },
  roomSizeRange: { marginLeft: 4, color: '#888' },

    sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});