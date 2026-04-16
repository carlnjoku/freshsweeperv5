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




// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
//   Animated,
//   Easing,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import COLORS from '../../constants/colors';
// import CustomCard from '../../components/shared/CustomCard';

// /* ---------------- MOCK FETCH ---------------- */
// const fetchPropertyById = async () => {
//   return {
//     _id: "id",
//     apt_name: "Lucy Parlour",
//     apt_type: "house",
//     address: "566 South 17th street, Newark, nj",
//     latitude: 40.7377,
//     longitude: -74.2083,
//     instructions: "Please focus on deep cleaning the kitchen and bathrooms.",
//     cleaning_supplies: "yes",
//     owner_info: {
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "555-1234"
//     },
//     contact_phone: "9733655242",
//     roomDetails: [
//       { type: "Bedroom", number: 2, size: 180, size_range: "large" },
//       { type: "Bathroom", number: 1, size: 50, size_range: "medium" },
//       { type: "Livingroom", number: 1, size: 200, size_range: "large" },
//       { type: "Kitchen", number: 1, size: 120, size_range: "medium" }
//     ],
//   };
// };
// /* ------------------------------------------------ */

// export default function PropertyPreview() {
//   const route = useRoute();
//   const { propertyId, inviteToken } = route.params || {};

//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [inviteStatus, setInviteStatus] = useState(
//     inviteToken ? 'pending' : null
//   );

//   const scrollRef = useRef(null);

//   /* ---------------- LOAD PROPERTY ---------------- */
//   useEffect(() => {
//     const loadProperty = async () => {
//       try {
//         const data = await fetchPropertyById(propertyId);
//         setProperty(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProperty();
//   }, [propertyId]);
//   /* ------------------------------------------------ */

//   /* ---------------- AUTO SCROLL ---------------- */
//   useEffect(() => {
//     if (inviteToken && scrollRef.current) {
//       setTimeout(() => {
//         scrollRef.current.scrollTo({ y: 0, animated: true });
//       }, 300);
//     }
//   }, [inviteToken]);
//   /* ------------------------------------------------ */

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ marginTop: 12 }}>Loading property...</Text>
//       </View>
//     );
//   }

//   if (!property) {
//     return (
//       <View style={styles.centered}>
//         <Text>Property not found</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       ref={scrollRef}
//       style={styles.container}
//       showsVerticalScrollIndicator={false}
//     >

//       {/* -------- Invite Banner (Reusable Component) -------- */}
//       {inviteToken && (
//         <InviteBanner
//           status={inviteStatus}
//           onAccept={() => {
//             Haptics.notificationAsync(
//               Haptics.NotificationFeedbackType.Success
//             );
//             setInviteStatus('accepted');
//           }}
//           onDecline={() => {
//             Haptics.notificationAsync(
//               Haptics.NotificationFeedbackType.Warning
//             );
//             setInviteStatus('declined');
//           }}
//         />
//       )}

//       {/* Property Header */}
//       <View style={styles.header}>
//         <Text style={styles.propertyName}>{property.apt_name}</Text>
//         <Text style={styles.propertyType}>
//           {property.apt_type.toUpperCase()}
//         </Text>
//       </View>

//       {/* Address */}
//       <TouchableOpacity
//         style={styles.addressCard}
//         onPress={() =>
//           Linking.openURL(
//             `https://maps.apple.com/?q=${property.latitude},${property.longitude}`
//           )
//         }
//       >
//         <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
//         <Text style={styles.addressText}>{property.address}</Text>
//       </TouchableOpacity>
  
//         {/* Owner & Contact */}
//        <CustomCard style={styles.sectionCard}>
//          <Text style={styles.sectionTitle}>Owner & Contact</Text>
//          <View style={styles.infoRow}>
//            <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
//            <Text style={styles.infoLabel}>Owner:</Text>
//            <Text style={styles.infoValue}>{property.owner_info?.name || 'N/A'}</Text>
//          </View>
//          <View style={styles.infoRow}>
//            <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
//            <Text style={styles.infoLabel}>Email:</Text>
//            <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
//          </View>
//          <View style={styles.infoRow}>
//            <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
//            <Text style={styles.infoLabel}>Contact:</Text>
//            <Text style={styles.infoValue}>{property.contact_phone || property.owner_info?.phone || 'N/A'}</Text>
//          </View>
//        </CustomCard>

//       {/* Instructions */}
//       {property.instructions && (
//         <CustomCard style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Instructions</Text>
//           <Text>{property.instructions}</Text>
//         </CustomCard>
//       )}

//       {/* Room Details Section */}
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
//               <Text style={styles.roomCount}>
//                 {room.number} {room.number > 1 ? 'rooms' : 'room'}
//               </Text>
//               <Text style={styles.roomSize}> • {room.size} sq ft</Text>
//               <Text style={[styles.roomSizeRange]}>
//                 ({room.size_range})
//               </Text>
//             </View>
//           </View>
//         ))}
//       </CustomCard>

//     </ScrollView>
//   );
// }

// /* ---------------- Reusable InviteBanner ---------------- */

// const InviteBanner = ({ status, onAccept, onDecline }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(-15)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 400,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 400,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   if (status === 'declined') return null;

//   return (
//     <Animated.View
//       style={[
//         styles.inviteCard,
//         {
//           opacity: fadeAnim,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}
//     >
//       {status === 'pending' && (
//         <>
//           <Text style={styles.inviteTitle}>You're Invited </Text>
//           <Text style={styles.inviteText}>
//             You've been invited to clean this property.
//           </Text>

//           <View style={styles.inviteButtons}>
//             <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
//               <Text style={styles.acceptText}>Accept</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
//               <Text style={styles.declineText}>Decline</Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}

//       {status === 'accepted' && (
//         <View style={styles.acceptedRow}>
//           <MaterialCommunityIcons
//             name="check-circle"
//             size={20}
//             color={COLORS.success}
//           />
//           <Text style={styles.acceptedText}>
//             Invitation accepted.
//           </Text>
//         </View>
//       )}
//     </Animated.View>
//   );
// };

// /* ---------------- Room Icon Helper ---------------- */

// const getRoomIcon = (type) => {
//   switch (type) {
//     case 'Bedroom': return 'bed-outline';
//     case 'Bathroom': return 'shower';
//     case 'Livingroom': return 'sofa-outline';
//     case 'Kitchen': return 'fridge-outline';
//     default: return 'door-open';
//   }
// };

// /* ---------------- STYLES ---------------- */

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
//   },

//   inviteCard: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 18,
//     marginTop: 20,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   inviteTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   inviteText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 16,
//   },
//   inviteButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   acceptBtn: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   acceptText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   declineBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: COLORS.error,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   declineText: {
//     color: COLORS.error,
//     fontWeight: '600',
//   },
//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   acceptedText: {
//     color: COLORS.success,
//     fontWeight: '600',
//   },

//   header: { marginBottom: 16 },
//   propertyName: { fontSize: 24, fontWeight: '700' },
//   propertyType: { fontSize: 14, color: '#666' },

//   addressCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 16,
//   },
//   addressText: { marginLeft: 8 },

//   sectionCard: {
//     marginBottom: 16,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//   },
//   sectionTitle: {
//     fontWeight: '600',
//     marginBottom: 8,
//   },

//   roomItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//   },
//   roomIconAndType: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   roomType: { fontWeight: '500' },
//   roomStats: { flexDirection: 'row', alignItems: 'center' },
//   roomCount: { color: '#666' },
//   roomSize: { color: '#666' },
//   roomSizeRange: { marginLeft: 4, color: '#888' },

//     sectionTitle: {
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
// });


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
//   Animated,
//   Easing,
//   Image,
//   Alert,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import COLORS from '../../constants/colors';
// import CustomCard from '../../components/shared/CustomCard';
// import userService from '../../services/connection/userService';
// import { MAP_BOX_SECRET_KEY } from '../../secret';

// // Helper to get room icon
// const getRoomIcon = (type) => {
//   switch (type) {
//     case 'Bedroom': return 'bed-queen-outline';
//     case 'Bathroom': return 'shower-head';
//     case 'Livingroom': return 'sofa-outline';
//     case 'Kitchen': return 'fridge-outline';
//     default: return 'door-open';
//   }
// };

// // Format phone number
// const formatPhone = (phone) => {
//   if (!phone) return 'N/A';
//   const cleaned = phone.replace(/\D/g, '');
//   if (cleaned.length === 10) {
//     return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
//   }
//   return phone;
// };

// export default function PropertyPreview() {
//   const route = useRoute();
//   const { propertyId, inviteToken } = route.params || {};
  

//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [inviteStatus, setInviteStatus] = useState(inviteToken ? 'pending' : null);
//   const [mapImageUrl, setMapImageUrl] = useState(null);
//   const [mapError, setMapError] = useState(false);

//   const scrollRef = useRef(null);

//   // Load property data
//   useEffect(() => {
//     const loadProperty = async () => {
//       if (!propertyId) {
//         setError('No property ID provided');
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await userService.getApartmentById(propertyId);
//         setProperty(response.data);
//       } catch (err) {
//         console.error('Failed to load property:', err);
//         setError('Unable to load property details. Please try again.');
//         Alert.alert('Error', 'Failed to load property details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProperty();
//   }, [propertyId]);

//   // Generate static map URL (OpenStreetMap – free, no key needed)
//   useEffect(() => {
//     if (property?.latitude && property?.longitude) {
        
//       const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${property.latitude},${property.longitude})/${property.longitude},${property.latitude},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [property]);

//   // Auto-scroll for invite banner
//   useEffect(() => {
//     if (inviteToken && scrollRef.current) {
//       setTimeout(() => {
//         scrollRef.current.scrollTo({ y: 0, animated: true });
//       }, 300);
//     }
//   }, [inviteToken]);

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
//         <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
//         <Text style={styles.errorText}>{error || 'Property not found'}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       ref={scrollRef}
//       style={styles.container}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.contentContainer}
//     >
//       {/* Invite Banner */}
//       {inviteToken && (
//         <InviteBanner
//           status={inviteStatus}
//           onAccept={() => {
//             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//             setInviteStatus('accepted');
//             // API call to accept invite would go here
//           }}
//           onDecline={() => {
//             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//             setInviteStatus('declined');
//           }}
//         />
//       )}

//       {/* Header Card */}
//       <View style={styles.headerCard}>
//         <View style={styles.headerOverlay}>
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//           <View style={styles.propertyTypeBadge}>
//             <Text style={styles.propertyTypeText}>{property.apt_type?.toUpperCase()}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Map & Address Card */}
//       <View style={styles.mapCard}>
//         {mapImageUrl && !mapError ? (
//           <Image
//             source={{ uri: mapImageUrl }}
//             style={styles.mapImage}
//             resizeMode="cover"
//             onError={() => setMapError(true)}
//           />
//         ) : (
//           <View style={[styles.mapImage, styles.mapPlaceholder]}>
//             <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.gray} />
//             <Text style={styles.placeholderText}>Map unavailable</Text>
//           </View>
//         )}
//         <View style={styles.addressRow}>
//           <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
//           <Text style={styles.addressText}>{property.address}</Text>
//           <TouchableOpacity
//             style={styles.directionsButton}
//             onPress={() =>
//               Linking.openURL(
//                 `https://maps.apple.com/?daddr=${property.latitude},${property.longitude}`
//               )
//             }
//           >
//             <Text style={styles.directionsText}>Directions</Text>
//             <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Owner Contact Card */}
//       <CustomCard style={styles.card}>
//         <Text style={styles.cardTitle}>Owner & Contact</Text>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Name:</Text>
//           <Text style={styles.infoValue}>{property.owner_info?.firstname || 'N/A'}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Email:</Text>
//           <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Phone:</Text>
//           <Text style={styles.infoValue}>{formatPhone(property.contact_phone || property.owner_info?.phone)}</Text>
//         </View>
//       </CustomCard>

//       {/* Instructions Card (if any) */}
//       {property.instructions && (
//         <CustomCard style={styles.card}>
//           <Text style={styles.cardTitle}>Special Instructions</Text>
//           <Text style={styles.instructionsText}>{property.instructions}</Text>
//         </CustomCard>
//       )}

//       {/* Room Details Card */}
//       <CustomCard style={styles.card}>
//         <Text style={styles.cardTitle}>Room Details</Text>
//         <View style={styles.roomGrid}>
//           {property.roomDetails?.map((room, index) => (
//             <View key={index} style={styles.roomGridItem}>
//               <MaterialCommunityIcons
//                 name={getRoomIcon(room.type)}
//                 size={28}
//                 color={COLORS.primary}
//               />
//               <Text style={styles.roomType}>{room.type}</Text>
//               <View style={styles.roomStats}>
//                 <Text style={styles.roomCount}>
//                   {room.number} {room.number > 1 ? 'rooms' : 'room'}
//                 </Text>
//                 <Text style={styles.roomSize}> • {room.size} sq ft</Text>
//               </View>
//               <Text style={styles.roomSizeRange}>({room.size_range})</Text>
//             </View>
//           ))}
//         </View>
//       </CustomCard>
//     </ScrollView>
//   );
// }

// /* ---------------- InviteBanner Component (modernized) ---------------- */
// const InviteBanner = ({ status, onAccept, onDecline }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(-15)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   if (status === 'declined') return null;

//   return (
//     <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//       {status === 'pending' && (
//         <>
//           <Text style={styles.inviteTitle}>✨ You're Invited!</Text>
//           <Text style={styles.inviteText}>You've been invited to clean this property. Would you like to accept?</Text>
//           <View style={styles.inviteButtons}>
//             <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
//               <Text style={styles.acceptText}>Accept</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
//               <Text style={styles.declineText}>Decline</Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//       {status === 'accepted' && (
//         <View style={styles.acceptedRow}>
//           <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
//           <Text style={styles.acceptedText}>Invitation accepted. You can now schedule a cleaning.</Text>
//         </View>
//       )}
//     </Animated.View>
//   );
// };

// /* ---------------- STYLES (modern) ---------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   contentContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FA',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },

//   /* Header Card */
//   headerCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     padding: 24,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   headerOverlay: {
//     // No overlay needed, just nice spacing
//   },
//   propertyName: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 6,
//   },
//   propertyTypeBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   propertyTypeText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },

//   /* Map Card */
//   mapCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   mapImage: {
//     width: '100%',
//     height: 150,
//   },
//   mapPlaceholder: {
//     backgroundColor: '#e0e0e0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//   },
//   addressText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 8,
//   },
//   directionsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     backgroundColor: '#F0F5FF',
//     borderRadius: 20,
//   },
//   directionsText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 4,
//   },

//   /* General Card */
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//     marginBottom: 14,
//   },

//   /* Info Row */
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   infoLabel: {
//     width: 70,
//     fontSize: 14,
//     color: '#888',
//     marginLeft: 8,
//   },
//   infoValue: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },

//   /* Instructions */
//   instructionsText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#555',
//   },

//   /* Room Grid */
//   roomGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   roomGridItem: {
//     width: '48%',
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EFEFEF',
//   },
//   roomType: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   roomCount: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSize: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSizeRange: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 2,
//   },

//   /* Invite Banner (modern) */
//   inviteCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 18,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#E0E7FF',
//   },
//   inviteTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 6,
//   },
//   inviteText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 16,
//   },
//   inviteButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   acceptBtn: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   acceptText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   declineBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: COLORS.error,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   declineText: {
//     color: COLORS.error,
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   acceptedText: {
//     fontSize: 14,
//     color: COLORS.success,
//     fontWeight: '500',
//     flex: 1,
//   },
// });


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
//   Animated,
//   Easing,
//   Image,
//   Alert,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import COLORS from '../../constants/colors';
// import CustomCard from '../../components/shared/CustomCard';
// import userService from '../../services/connection/userService';
// import { MAP_BOX_SECRET_KEY } from '../../secret';

// // Helper to get room icon
// const getRoomIcon = (type) => {
//   switch (type) {
//     case 'Bedroom': return 'bed-queen-outline';
//     case 'Bathroom': return 'shower-head';
//     case 'Livingroom': return 'sofa-outline';
//     case 'Kitchen': return 'fridge-outline';
//     default: return 'door-open';
//   }
// };

// // Format phone number
// const formatPhone = (phone) => {
//   if (!phone) return 'N/A';
//   const cleaned = phone.replace(/\D/g, '');
//   if (cleaned.length === 10) {
//     return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
//   }
//   return phone;
// };

// export default function PropertyPreview() {
//   const route = useRoute();
//   const { propertyId, inviteToken } = route.params || {};

//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [inviteStatus, setInviteStatus] = useState(inviteToken ? 'pending' : null);
//   const [mapImageUrl, setMapImageUrl] = useState(null);
//   const [mapError, setMapError] = useState(false);

//   // Checklists state
//   const [checklists, setChecklists] = useState([]);
//   const [checklistsLoading, setChecklistsLoading] = useState(false);
//   const [checklistsError, setChecklistsError] = useState(null);

//   const scrollRef = useRef(null);

//   // Load property data
//   useEffect(() => {
//     const loadProperty = async () => {
//       if (!propertyId) {
//         setError('No property ID provided');
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await userService.getApartmentById(propertyId);
//         const propData = response.data;
//         setProperty(propData);
//         console.log("Listiiiiiiing", propData.checklists)

//         // After property is loaded, fetch associated checklists if any
//         if (propData.checklists && propData.checklists.length > 0) {
//           await fetchChecklists(propData.checklists);
//         }
//       } catch (err) {
//         console.error('Failed to load property:', err);
//         setError('Unable to load property details. Please try again.');
//         Alert.alert('Error', 'Failed to load property details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProperty();
//   }, [propertyId]);

//   // Fetch checklists by IDs
//   const fetchChecklists = async (checklistIds) => {
//     setChecklistsLoading(true);
//     setChecklistsError(null);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(checklistIds);
//       // Assuming response.data is an array of checklist objects
//       setChecklists(response.data.data || []);
//     //   console.log("Attached Checklist", response.data.data)
//     } catch (err) {
//       console.error('Failed to load checklists:', err);
//       setChecklistsError('Could not load checklists.');
//     } finally {
//       setChecklistsLoading(false);
//     }
//   };

//   // Generate static map URL
//   useEffect(() => {
//     if (property?.latitude && property?.longitude) {
//       const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${property.latitude},${property.longitude})/${property.longitude},${property.latitude},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [property]);

//   // Auto-scroll for invite banner
//   useEffect(() => {
//     if (inviteToken && scrollRef.current) {
//       setTimeout(() => {
//         scrollRef.current.scrollTo({ y: 0, animated: true });
//       }, 300);
//     }
//   }, [inviteToken]);

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
//         <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
//         <Text style={styles.errorText}>{error || 'Property not found'}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       ref={scrollRef}
//       style={styles.container}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.contentContainer}
//     >
//       {/* Invite Banner */}
//       {inviteToken && (
//         <InviteBanner
//           status={inviteStatus}
//           onAccept={() => {
//             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//             setInviteStatus('accepted');
//             // API call to accept invite would go here
//           }}
//           onDecline={() => {
//             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//             setInviteStatus('declined');
//           }}
//         />
//       )}

//       {/* Header Card */}
//       <View style={styles.headerCard}>
//         <View style={styles.headerOverlay}>
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//           <View style={styles.propertyTypeBadge}>
//             <Text style={styles.propertyTypeText}>{property.apt_type?.toUpperCase()}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Map & Address Card */}
//       <View style={styles.mapCard}>
//         {mapImageUrl && !mapError ? (
//           <Image
//             source={{ uri: mapImageUrl }}
//             style={styles.mapImage}
//             resizeMode="cover"
//             onError={() => setMapError(true)}
//           />
//         ) : (
//           <View style={[styles.mapImage, styles.mapPlaceholder]}>
//             <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.gray} />
//             <Text style={styles.placeholderText}>Map unavailable</Text>
//           </View>
//         )}
//         <View style={styles.addressRow}>
//           <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
//           <Text style={styles.addressText}>{property.address}</Text>
//           <TouchableOpacity
//             style={styles.directionsButton}
//             onPress={() =>
//               Linking.openURL(
//                 `https://maps.apple.com/?daddr=${property.latitude},${property.longitude}`
//               )
//             }
//           >
//             <Text style={styles.directionsText}>Directions</Text>
//             <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Owner Contact Card */}
//       <CustomCard style={styles.card}>
//         <Text style={styles.cardTitle}>Owner & Contact</Text>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Name:</Text>
//           <Text style={styles.infoValue}>{property.owner_info?.name || 'N/A'}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Email:</Text>
//           <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
//           <Text style={styles.infoLabel}>Phone:</Text>
//           <Text style={styles.infoValue}>{formatPhone(property.contact_phone || property.owner_info?.phone)}</Text>
//         </View>
//       </CustomCard>

//       {/* Instructions Card (if any) */}
//       {property.instructions && (
//         <CustomCard style={styles.card}>
//           <Text style={styles.cardTitle}>Special Instructions</Text>
//           <Text style={styles.instructionsText}>{property.instructions}</Text>
//         </CustomCard>
//       )}

//       {/* Checklists Card */}
//       {property.checklists && property.checklists.length > 0 && (
//         <CustomCard style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>Cleaning Checklists</Text>
//             {checklistsLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
//           </View>
//           {checklistsError ? (
//             <Text style={styles.errorText}>{checklistsError}</Text>
//           ) : checklists.length === 0 && !checklistsLoading ? (
//             <Text style={styles.emptyText}>No checklists found.</Text>
//           ) : (
//             checklists.map((checklist, index) => (
//               <View key={checklist._id || index} style={styles.checklistItem}>
//                 <MaterialCommunityIcons name="clipboard-list-outline" size={20} color={COLORS.primary} />
//                 <View style={styles.checklistInfo}>
//                   <Text style={styles.checklistName}>{checklist.checklistName || 'Unnamed Checklist'}</Text>
//                   {checklist.taskCount !== undefined && (
//                     <Text style={styles.checklistMeta}>{checklist.taskCount} tasks</Text>
//                   )}
//                 </View>
//               </View>
//             ))
//           )}
//         </CustomCard>
//       )}

//       {/* Room Details Card */}
//       <CustomCard style={styles.card}>
//         <Text style={styles.cardTitle}>Room Details</Text>
//         <View style={styles.roomGrid}>
//           {property.roomDetails?.map((room, index) => (
//             <View key={index} style={styles.roomGridItem}>
//               <MaterialCommunityIcons
//                 name={getRoomIcon(room.type)}
//                 size={28}
//                 color={COLORS.primary}
//               />
//               <Text style={styles.roomType}>{room.type}</Text>
//               <View style={styles.roomStats}>
//                 <Text style={styles.roomCount}>
//                   {room.number} {room.number > 1 ? 'rooms' : 'room'}
//                 </Text>
//                 <Text style={styles.roomSize}> • {room.size} sq ft</Text>
//               </View>
//               <Text style={styles.roomSizeRange}>({room.size_range})</Text>
//             </View>
//           ))}
//         </View>
//       </CustomCard>
//     </ScrollView>
//   );
// }

// /* ---------------- InviteBanner Component (modernized) ---------------- */
// const InviteBanner = ({ status, onAccept, onDecline }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(-15)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   if (status === 'declined') return null;

//   return (
//     <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//       {status === 'pending' && (
//         <>
//           <Text style={styles.inviteTitle}>✨ You're Invited!</Text>
//           <Text style={styles.inviteText}>You've been invited to clean this property. Would you like to accept?</Text>
//           <View style={styles.inviteButtons}>
//             <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
//               <Text style={styles.acceptText}>Accept</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
//               <Text style={styles.declineText}>Decline</Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//       {status === 'accepted' && (
//         <View style={styles.acceptedRow}>
//           <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
//           <Text style={styles.acceptedText}>Invitation accepted. You can now schedule a cleaning.</Text>
//         </View>
//       )}
//     </Animated.View>
//   );
// };

// /* ---------------- STYLES (modern) ---------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   contentContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FA',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     paddingVertical: 10,
//   },

//   /* Header Card */
//   headerCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     padding: 24,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   propertyName: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 6,
//   },
//   propertyTypeBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   propertyTypeText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },

//   /* Map Card */
//   mapCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   mapImage: {
//     width: '100%',
//     height: 150,
//   },
//   mapPlaceholder: {
//     backgroundColor: '#e0e0e0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//   },
//   addressText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 8,
//   },
//   directionsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     backgroundColor: '#F0F5FF',
//     borderRadius: 20,
//   },
//   directionsText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 4,
//   },

//   /* General Card */
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//   },

//   /* Info Row */
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   infoLabel: {
//     width: 70,
//     fontSize: 14,
//     color: '#888',
//     marginLeft: 8,
//   },
//   infoValue: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },

//   /* Instructions */
//   instructionsText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#555',
//   },

//   /* Checklists */
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   checklistInfo: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#333',
//   },
//   checklistMeta: {
//     fontSize: 12,
//     color: '#888',
//     marginTop: 2,
//   },

//   /* Room Grid */
//   roomGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   roomGridItem: {
//     width: '48%',
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EFEFEF',
//   },
//   roomType: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   roomCount: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSize: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSizeRange: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 2,
//   },

//   /* Invite Banner (modern) */
//   inviteCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 18,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#E0E7FF',
//   },
//   inviteTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 6,
//   },
//   inviteText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 16,
//   },
//   inviteButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   acceptBtn: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   acceptText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   declineBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: COLORS.error,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   declineText: {
//     color: COLORS.error,
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   acceptedText: {
//     fontSize: 14,
//     color: COLORS.success,
//     fontWeight: '500',
//     flex: 1,
//   },
// });




// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
//   Animated,
//   Easing,
//   Image,
//   Alert,
//   Modal,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import COLORS from '../../constants/colors';
// import CustomCard from '../../components/shared/CustomCard';
// import userService from '../../services/connection/userService';
// import { MAP_BOX_SECRET_KEY } from '../../secret';


// // Helper to get room icon
// const getRoomIcon = (type) => {
//   if (type.includes('Bedroom')) return 'bed-queen-outline';
//   if (type.includes('Bathroom')) return 'shower-head';
//   if (type.includes('Livingroom')) return 'sofa-outline';
//   if (type.includes('Kitchen')) return 'fridge-outline';
//   return 'door-open';
// };

// // Format phone number
// const formatPhone = (phone) => {
//   if (!phone) return 'N/A';
//   const cleaned = phone.replace(/\D/g, '');
//   if (cleaned.length === 10) {
//     return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
//   }
//   return phone;
// };

// // Helper to count tasks in a room
// const countTasksInRoom = (room) => {
//   if (!room || !room.tasks) return 0;
//   return room.tasks.length;
// };

// export default function PropertyPreview() {
//   const route = useRoute();
//   const { propertyId, inviteToken } = route.params || {};

//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [inviteStatus, setInviteStatus] = useState(inviteToken ? 'pending' : null);
//   const [mapImageUrl, setMapImageUrl] = useState(null);
//   const [mapError, setMapError] = useState(false);

//   // Checklists state
//   const [checklists, setChecklists] = useState([]);
//   const [checklistsLoading, setChecklistsLoading] = useState(false);
//   const [checklistsError, setChecklistsError] = useState(null);
//   const [selectedChecklist, setSelectedChecklist] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);


//   const [processingInvite, setProcessingInvite] = useState(false);

//   const scrollRef = useRef(null);

//   // Load property data
//   useEffect(() => {
//     const loadProperty = async () => {
//       if (!propertyId) {
//         setError('No property ID provided');
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await userService.getApartmentById(propertyId);
//         const propData = response.data;
//         setProperty(propData);

//         // After property is loaded, fetch associated checklists if any
//         if (propData.checklists && propData.checklists.length > 0) {
//           await fetchChecklists(propData.checklists);
//         }
//       } catch (err) {
//         console.error('Failed to load property:', err);
//         setError('Unable to load property details. Please try again.');
//         Alert.alert('Error', 'Failed to load property details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProperty();
//   }, [propertyId]);

//   // Fetch checklists by IDs
//   const fetchChecklists = async (checklistIds) => {
//     setChecklistsLoading(true);
//     setChecklistsError(null);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(checklistIds);
//       // Assuming response.data is an array of checklist objects
//       setChecklists(response.data.data || []);
//     } catch (err) {
//       console.error('Failed to load checklists:', err);
//       setChecklistsError('Could not load checklists.');
//     } finally {
//       setChecklistsLoading(false);
//     }
//   };

//   // Generate static map URL
//   useEffect(() => {
//     if (property?.latitude && property?.longitude) {
//       const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${property.latitude},${property.longitude})/${property.longitude},${property.latitude},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [property]);

//   // Auto-scroll for invite banner
//   useEffect(() => {
//     if (inviteToken && scrollRef.current) {
//       setTimeout(() => {
//         scrollRef.current.scrollTo({ y: 0, animated: true });
//       }, 300);
//     }
//   }, [inviteToken]);

//   // Open checklist modal
//   const openChecklistModal = (checklist) => {
//     setSelectedChecklist(checklist);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedChecklist(null);
//   };

//   const handleAcceptInvite = async () => {
//     if (!inviteToken || !currentUserId) return;
//     setProcessingInvite(true);
//     try {
//       await userService.acceptInvite({ token: inviteToken, cleanerId: currentUserId });
//       setInviteStatus('accepted');
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       // Optionally refresh property or navigate
//     } catch (err) {
//       console.error('Accept failed:', err);
//       Alert.alert('Error', err.response?.data?.error || 'Failed to accept invitation');
//       setInviteStatus('pending'); // revert if error
//     } finally {
//       setProcessingInvite(false);
//     }
//   };


//   const handleDeclineInvite = async () => {
//     if (!inviteToken || !currentUserId) return;
//     setProcessingInvite(true);
//     try {
//       await userService.declineInvite({ token: inviteToken, cleanerId: currentUserId });
//       setInviteStatus('declined');
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//     } catch (err) {
//       console.error('Decline failed:', err);
//       Alert.alert('Error', err.response?.data?.error || 'Failed to decline invitation');
//       setInviteStatus('pending');
//     } finally {
//       setProcessingInvite(false);
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
//         <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
//         <Text style={styles.errorText}>{error || 'Property not found'}</Text>
//       </View>
//     );
//   }

//   return (
//     <>
//       <ScrollView
//         ref={scrollRef}
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.contentContainer}
//       >
//         {/* Invite Banner */}
        
//         {inviteToken && inviteStatus === 'pending' && (
//           <InviteBanner
//             status="pending"
//             onAccept={handleAcceptInvite}
//             onDecline={handleDeclineInvite}
//             processing={processingInvite}
//           />
//         )}
//         {inviteStatus === 'accepted' && (
//           <View style={styles.inviteCard}>
//             <View style={styles.acceptedRow}>
//               <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
//               <Text style={styles.acceptedText}>Invitation accepted. You can now schedule a cleaning.</Text>
//             </View>
//           </View>
//         )}

//         {/* Header Card */}
//         <View style={styles.headerCard}>
//           <View style={styles.headerOverlay}>
//             <Text style={styles.propertyName}>{property.apt_name}</Text>
//             <View style={styles.propertyTypeBadge}>
//               <Text style={styles.propertyTypeText}>{property.apt_type?.toUpperCase()}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Map & Address Card */}
//         <View style={styles.mapCard}>
//           {mapImageUrl && !mapError ? (
//             <Image
//               source={{ uri: mapImageUrl }}
//               style={styles.mapImage}
//               resizeMode="cover"
//               onError={() => setMapError(true)}
//             />
//           ) : (
//             <View style={[styles.mapImage, styles.mapPlaceholder]}>
//               <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.gray} />
//               <Text style={styles.placeholderText}>Map unavailable</Text>
//             </View>
//           )}
//           <View style={styles.addressRow}>
//             <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
//             <Text style={styles.addressText}>{property.address}</Text>
//             <TouchableOpacity
//               style={styles.directionsButton}
//               onPress={() =>
//                 Linking.openURL(
//                   `https://maps.apple.com/?daddr=${property.latitude},${property.longitude}`
//                 )
//               }
//             >
//               <Text style={styles.directionsText}>Directions</Text>
//               <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Owner Contact Card */}
//         <CustomCard style={styles.card}>
//           <Text style={styles.cardTitle}>Owner & Contact</Text>
//           <View style={styles.infoRow}>
//             <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
//             <Text style={styles.infoLabel}>Name:</Text>
//             <Text style={styles.infoValue}>{property.owner_info?.firstname || 'N/A'}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
//             <Text style={styles.infoLabel}>Email:</Text>
//             <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
//             <Text style={styles.infoLabel}>Phone:</Text>
//             <Text style={styles.infoValue}>{formatPhone(property.contact_phone || property.owner_info?.phone)}</Text>
//           </View>
//         </CustomCard>

//         {/* Instructions Card (if any) */}
//         {property.instructions && (
//           <CustomCard style={styles.card}>
//             <Text style={styles.cardTitle}>Special Instructions</Text>
//             <Text style={styles.instructionsText}>{property.instructions}</Text>
//           </CustomCard>
//         )}

//         {/* Checklists Card */}
//         {property.checklists && property.checklists.length > 0 && (
//           <CustomCard style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Cleaning Checklists</Text>
//               {checklistsLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
//             </View>
//             {checklistsError ? (
//               <Text style={styles.errorText}>{checklistsError}</Text>
//             ) : checklists.length === 0 && !checklistsLoading ? (
//               <Text style={styles.emptyText}>No checklists found.</Text>
//             ) : (
//               checklists.map((checklist, index) => (
//                 <TouchableOpacity
//                   key={checklist._id || index}
//                   style={styles.checklistItem}
//                   onPress={() => openChecklistModal(checklist)}
//                 >
//                   <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//                   <View style={styles.checklistInfo}>
//                     <Text style={styles.checklistName}>{checklist.checklistName || 'Unnamed Checklist'}</Text>
//                     <View style={styles.checklistMetaRow}>
//                       <Text style={styles.checklistMeta}>⏱️ {checklist.totalTime} min</Text>
//                       <Text style={styles.checklistMeta}>💰 ${checklist.totalFee?.toFixed(2)}</Text>
//                     </View>
//                   </View>
//                   <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
//                 </TouchableOpacity>
//               ))
//             )}
//           </CustomCard>
//         )}

//         {/* Room Details Card */}
//         <CustomCard style={styles.card}>
//           <Text style={styles.cardTitle}>Room Details</Text>
//           <View style={styles.roomGrid}>
//             {property.roomDetails?.map((room, index) => (
//               <View key={index} style={styles.roomGridItem}>
//                 <MaterialCommunityIcons
//                   name={getRoomIcon(room.type)}
//                   size={28}
//                   color={COLORS.primary}
//                 />
//                 <Text style={styles.roomType}>{room.type}</Text>
//                 <View style={styles.roomStats}>
//                   <Text style={styles.roomCount}>
//                     {room.number} {room.number > 1 ? 'rooms' : 'room'}
//                   </Text>
//                   <Text style={styles.roomSize}> • {room.size} sq ft</Text>
//                 </View>
//                 <Text style={styles.roomSizeRange}>({room.size_range})</Text>
//               </View>
//             ))}
//           </View>
//         </CustomCard>
//       </ScrollView>

//       {/* Checklist Details Modal */}
//       {/* Checklist Details Modal */}
//         <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={closeModal}
//         >
//         <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>{selectedChecklist?.checklistName || 'Checklist Details'}</Text>
//                 <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
//                 <MaterialIcons name="close" size={24} color={COLORS.gray} />
//                 </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScroll}>
//                 {selectedChecklist && (
//                 <>
//                     {/* Summary */}
//                     <View style={styles.modalSummary}>
//                     <Text style={styles.modalSummaryText}>Total Time: {selectedChecklist.totalTime} min</Text>
//                     <Text style={styles.modalSummaryText}>Total Fee: ${selectedChecklist.totalFee?.toFixed(2)}</Text>
//                     </View>

//                     {/* Rooms and Tasks */}
//                     {selectedChecklist.checklist?.group_a?.details && (
//                     Object.entries(selectedChecklist.checklist.group_a.details).map(([roomKey, room]) => (
//                         <View key={roomKey} style={styles.modalRoomSection}>
//                         <View style={styles.modalRoomHeader}>
//                             <MaterialCommunityIcons name={getRoomIcon(roomKey)} size={20} color={COLORS.primary} />
//                             <Text style={styles.modalRoomTitle}>{roomKey.replace(/_/g, ' ')}</Text>
//                             <Text style={styles.modalTaskCount}>({countTasksInRoom(room)} tasks)</Text>
//                         </View>
                        
//                         {/* Tasks Grid - 2 columns */}
//                         <View style={styles.tasksGrid}>
//                             {room.tasks && room.tasks.map((task, idx) => (
//                             <View key={idx} style={styles.modalTaskItem}>
//                                 <MaterialCommunityIcons
//                                 name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
//                                 size={16}
//                                 color={task.value ? COLORS.success : COLORS.gray}
//                                 style={styles.taskIcon}
//                                 />
//                                 <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
//                                 {task.label}
//                                 </Text>
//                             </View>
//                             ))}
//                         </View>

//                         {/* Notes if any */}
//                         {room.notes?.text ? (
//                             <Text style={styles.modalNotes}>📝 {room.notes.text}</Text>
//                         ) : null}
//                         </View>
//                     ))
//                     )}

//                     {/* Extras if any */}
//                     {selectedChecklist.checklist?.group_a?.details?.Extra && (
//                     <View style={styles.modalRoomSection}>
//                         <View style={styles.modalRoomHeader}>
//                         <MaterialCommunityIcons name="star-outline" size={20} color={COLORS.primary} />
//                         <Text style={styles.modalRoomTitle}>Extra Tasks</Text>
//                         </View>
//                         <View style={styles.tasksGrid}>
//                         {selectedChecklist.checklist.group_a.details.Extra.tasks?.map((task, idx) => (
//                             <View key={idx} style={styles.modalTaskItem}>
//                             <MaterialCommunityIcons
//                                 name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
//                                 size={16}
//                                 color={task.value ? COLORS.success : COLORS.gray}
//                                 style={styles.taskIcon}
//                             />
//                             <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
//                                 {task.label} {task.time && `(${task.time} min)`} {task.price && `+$${task.price}`}
//                             </Text>
//                             </View>
//                         ))}
//                         </View>
//                     </View>
//                     )}
//                 </>
//                 )}
//             </ScrollView>
//             </View>
//         </View>
//         </Modal>
//     </>
//   );
// }

// /* ---------------- InviteBanner Component (modernized) ---------------- */
// // const InviteBanner = ({ status, onAccept, onDecline }) => {
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const slideAnim = useRef(new Animated.Value(-15)).current;

// //   useEffect(() => {
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
// //     ]).start();
// //   }, []);

// //   if (status === 'declined') return null;

// //   return (
// //     <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
// //       {status === 'pending' && (
// //         <>
// //           <Text style={styles.inviteTitle}>✨ You're Invited!</Text>
// //           <Text style={styles.inviteText}>You've been invited to clean this property. Would you like to accept?</Text>
// //           <View style={styles.inviteButtons}>
// //             <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
// //               <Text style={styles.acceptText}>Accept</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
// //               <Text style={styles.declineText}>Decline</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </>
// //       )}
// //       {status === 'accepted' && (
// //         <View style={styles.acceptedRow}>
// //           <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
// //           <Text style={styles.acceptedText}>Invitation accepted. You can now schedule a cleaning.</Text>
// //         </View>
// //       )}
// //     </Animated.View>
// //   );
// // };


// const InviteBanner = ({ status, onAccept, onDecline, processing }) => {
//     const fadeAnim = useRef(new Animated.Value(0)).current;
//     const slideAnim = useRef(new Animated.Value(-15)).current;
  
//     useEffect(() => {
//       Animated.parallel([
//         Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
//         Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
//       ]).start();
//     }, []);
  
//     if (status !== 'pending') return null;
  
//     return (
//       <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//         <Text style={styles.inviteTitle}>✨ You're Invited!</Text>
//         <Text style={styles.inviteText}>You've been invited to clean this property. Would you like to accept?</Text>
//         <View style={styles.inviteButtons}>
//           <TouchableOpacity
//             style={[styles.acceptBtn, processing && styles.disabledBtn]}
//             onPress={onAccept}
//             disabled={processing}
//           >
//             {processing ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept</Text>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.declineBtn, processing && styles.disabledBtn]}
//             onPress={onDecline}
//             disabled={processing}
//           >
//             {processing ? (
//               <ActivityIndicator size="small" color={COLORS.error} />
//             ) : (
//               <Text style={styles.declineText}>Decline</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     );
//   };
// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   contentContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FA',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     paddingVertical: 10,
//   },

//   /* Header Card */
//   headerCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     padding: 24,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   propertyName: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 6,
//   },
//   propertyTypeBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   propertyTypeText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },

//   /* Map Card */
//   mapCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   mapImage: {
//     width: '100%',
//     height: 150,
//   },
//   mapPlaceholder: {
//     backgroundColor: '#e0e0e0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//   },
//   addressText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 8,
//   },
//   directionsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     backgroundColor: '#F0F5FF',
//     borderRadius: 20,
//   },
//   directionsText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 4,
//   },

//   /* General Card */
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     marginBottom:10,
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//   },

//   /* Info Row */
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   infoLabel: {
//     width: 70,
//     fontSize: 14,
//     color: '#888',
//     marginLeft: 8,
//   },
//   infoValue: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },

//   /* Instructions */
//   instructionsText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#555',
//   },

//   /* Checklists */
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   checklistInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   checklistMetaRow: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   checklistMeta: {
//     fontSize: 13,
//     color: '#666',
//     marginRight: 12,
//   },

//   /* Room Grid */
//   roomGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   roomGridItem: {
//     width: '48%',
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EFEFEF',
//   },
//   roomType: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   roomCount: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSize: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSizeRange: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 2,
//   },

//   /* Invite Banner */
//   inviteCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 18,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#E0E7FF',
//   },
//   inviteTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 6,
//   },
//   inviteText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 16,
//   },
//   inviteButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   acceptBtn: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   acceptText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   declineBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: COLORS.error,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   declineText: {
//     color: COLORS.error,
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   acceptedText: {
//     fontSize: 14,
//     color: COLORS.success,
//     fontWeight: '500',
//     flex: 1,
//   },

//   /* Modal Styles */
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 30,
//     maxHeight: '90%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#333',
//     flex: 1,
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalScroll: {
//     marginBottom: 10,
//   },
//   modalSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#F0F5FF',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },
//   modalSummaryText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   modalRoomSection: {
//     marginBottom: 20,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     padding: 12,
//   },
//   modalRoomHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   modalRoomTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//     textTransform: 'capitalize',
//   },
//   modalTaskCount: {
//     fontSize: 12,
//     color: '#888',
//     marginLeft: 8,
//   },
//   modalTaskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 28,
//     marginVertical: 4,
//   },
//   modalTaskText: {
//     fontSize: 14,
//     color: '#555',
//     marginLeft: 8,
//     flex: 1,
//   },
//   modalTaskCompleted: {
//     textDecorationLine: 'line-through',
//     color: '#aaa',
//   },
//   modalNotes: {
//     fontSize: 13,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 6,
//     marginLeft: 28,
//   },


//   tasksGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   modalTaskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '50%',
//     paddingRight: 8,
//     marginBottom: 8,
//   },
//   taskIcon: {
//     marginRight: 6,
//   },
//   modalTaskText: {
//     fontSize: 14,
//     color: '#555',
//     flex: 1,
//   },
//   modalTaskCompleted: {
//     textDecorationLine: 'line-through',
//     color: '#aaa',
//   },
//   modalNotes: {
//     fontSize: 13,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 8,
//     width: '100%',
//   },
//   disabledBtn: {
//     opacity: 0.6,
//   },
// });


// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
//   Animated,
//   Easing,
//   Image,
//   Alert,
//   Modal,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import COLORS from '../../constants/colors';
// import CustomCard from '../../components/shared/CustomCard';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { MAP_BOX_SECRET_KEY } from '../../secret';

// // Helper to get room icon
// const getRoomIcon = (type) => {
//   if (type.includes('Bedroom')) return 'bed-queen-outline';
//   if (type.includes('Bathroom')) return 'shower-head';
//   if (type.includes('Livingroom')) return 'sofa-outline';
//   if (type.includes('Kitchen')) return 'fridge-outline';
//   return 'door-open';
// };

// // Format phone number
// const formatPhone = (phone) => {
//   if (!phone) return 'N/A';
//   const cleaned = phone.replace(/\D/g, '');
//   if (cleaned.length === 10) {
//     return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
//   }
//   return phone;
// };

// // Helper to count tasks in a room
// const countTasksInRoom = (room) => {
//   if (!room || !room.tasks) return 0;
//   return room.tasks.length;
// };

// export default function PropertyPreview() {
//   const route = useRoute();
//   const { propertyId, inviteToken } = route.params || {};
//   const { currentUserId } = useContext(AuthContext);

//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [inviteStatus, setInviteStatus] = useState(inviteToken ? 'pending' : null);
//   const [inviteDetails, setInviteDetails] = useState(null);
//   const [processingInvite, setProcessingInvite] = useState(false);
//   const [mapImageUrl, setMapImageUrl] = useState(null);
//   const [mapError, setMapError] = useState(false);

//   // Checklists state
//   const [checklists, setChecklists] = useState([]);
//   const [checklistsLoading, setChecklistsLoading] = useState(false);
//   const [checklistsError, setChecklistsError] = useState(null);
//   const [selectedChecklist, setSelectedChecklist] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const scrollRef = useRef(null);

//   // Load property data
//   useEffect(() => {
//     const loadProperty = async () => {
//       if (!propertyId) {
//         setError('No property ID provided');
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await userService.getApartmentById(propertyId);
//         const propData = response.data;
//         setProperty(propData);

//         if (propData.checklists && propData.checklists.length > 0) {
//           await fetchChecklists(propData.checklists);
//         }
//       } catch (err) {
//         console.error('Failed to load property:', err);
//         setError('Unable to load property details. Please try again.');
//         Alert.alert('Error', 'Failed to load property details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProperty();
//   }, [propertyId]);

//   // Fetch checklists by IDs
//   const fetchChecklists = async (checklistIds) => {
//     setChecklistsLoading(true);
//     setChecklistsError(null);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(checklistIds);
//       setChecklists(response.data.data || []);
//     } catch (err) {
//       console.error('Failed to load checklists:', err);
//       setChecklistsError('Could not load checklists.');
//     } finally {
//       setChecklistsLoading(false);
//     }
//   };

//   // Generate static map URL
//   useEffect(() => {
//     if (property?.latitude && property?.longitude) {
//       const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${property.latitude},${property.longitude})/${property.longitude},${property.latitude},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [property]);

//   // Auto-scroll for invite banner
//   useEffect(() => {
//     if (inviteToken && scrollRef.current) {
//       setTimeout(() => {
//         scrollRef.current.scrollTo({ y: 0, animated: true });
//       }, 300);
//     }
//   }, [inviteToken]);

//   // Check for pending invite from the server (if user is logged in)
//   useEffect(() => {
//     const checkInviteStatus = async () => {
//       if (!propertyId || !currentUserId) return;
//       try {
//         const response = await userService.getInviteStatus(propertyId, currentUserId);
//         if (response.data && response.data.invite) {
//           const invite = response.data.invite;
//           setInviteDetails(invite);
//           setInviteStatus('pending');
//         } else if (!inviteToken) {
//           // No pending invite and no token from deep link → no banner
//           setInviteStatus(null);
//         }
//       } catch (err) {
//         console.log('No pending invite or error', err);
//         // If error, we still respect inviteToken from deep link
//       }
//     };
//     checkInviteStatus();
//   }, [propertyId, currentUserId, inviteToken]);

//   // Accept handler – works for both token and platform invites
//   const handleAcceptInvite = async () => {
//     if (!currentUserId) return;
//     setProcessingInvite(true);
//     try {
//       if (inviteDetails && inviteDetails.type === 'platform') {
//         // Platform invite – use invite ID
//         await userService.acceptPlatformInvite({
//           propertyId: propertyId,
//           cleanerId: currentUserId,
//         });
//       } else if (inviteToken || (inviteDetails && inviteDetails.token)) {
//         // Email invite – use token
//         const token = inviteToken || inviteDetails.token;
//         await userService.acceptInvite({ 
//           propertyId: propertyId, 
//           cleanerId: currentUserId 
//         });
//       } else {
//         throw new Error('No valid invite found');
//       }
//       setInviteStatus('accepted');
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     } catch (err) {
//       console.error('Accept failed:', err);
//       Alert.alert('Error', err.response?.data?.error || 'Failed to accept invitation');
//       setInviteStatus('pending');
//     } finally {
//       setProcessingInvite(false);
//     }
//   };

//   const handleDeclineInvite = async () => {
//     if (!currentUserId) return;
//     setProcessingInvite(true);
//     try {
//       if (inviteDetails && inviteDetails.type === 'platform') {
//         await userService.declinePlatformInvite({
//           inviteId: inviteDetails._id,
//           cleanerId: currentUserId,
//         });
//       } else if (inviteToken || (inviteDetails && inviteDetails.token)) {
//         const token = inviteToken || inviteDetails.token;
//         await userService.declineInvite({ token, cleanerId: currentUserId });
//       } else {
//         throw new Error('No valid invite found');
//       }
//       setInviteStatus('declined');
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//     } catch (err) {
//       console.error('Decline failed:', err);
//       Alert.alert('Error', err.response?.data?.error || 'Failed to decline invitation');
//       setInviteStatus('pending');
//     } finally {
//       setProcessingInvite(false);
//     }
//   };

//   const openChecklistModal = (checklist) => {
//     setSelectedChecklist(checklist);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedChecklist(null);
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
//         <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
//         <Text style={styles.errorText}>{error || 'Property not found'}</Text>
//       </View>
//     );
//   }

//   const showInviteBanner = inviteStatus === 'pending' && (inviteDetails || inviteToken);

//   return (
//     <>
//       <ScrollView
//         ref={scrollRef}
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.contentContainer}
//       >
//         {/* Invite Banner */}
//         {showInviteBanner && (
//           <InviteBanner
//             status="pending"
//             onAccept={handleAcceptInvite}
//             onDecline={handleDeclineInvite}
//             processing={processingInvite}
//           />
//         )}
//         {inviteStatus === 'accepted' && (
//           <View style={styles.inviteCard}>
//             <View style={styles.acceptedRow}>
//               <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
//               <Text style={styles.acceptedText}>Invitation accepted. You can now schedule a cleaning.</Text>
//             </View>
//           </View>
//         )}

//         {/* Header Card */}
//         <View style={styles.headerCard}>
//           <View style={styles.headerOverlay}>
//             <Text style={styles.propertyName}>{property.apt_name}</Text>
//             <View style={styles.propertyTypeBadge}>
//               <Text style={styles.propertyTypeText}>{property.apt_type?.toUpperCase()}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Map & Address Card */}
//         <View style={styles.mapCard}>
//           {mapImageUrl && !mapError ? (
//             <Image
//               source={{ uri: mapImageUrl }}
//               style={styles.mapImage}
//               resizeMode="cover"
//               onError={() => setMapError(true)}
//             />
//           ) : (
//             <View style={[styles.mapImage, styles.mapPlaceholder]}>
//               <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.gray} />
//               <Text style={styles.placeholderText}>Map unavailable</Text>
//             </View>
//           )}
//           <View style={styles.addressRow}>
//             <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
//             <Text style={styles.addressText}>{property.address}</Text>
//             <TouchableOpacity
//               style={styles.directionsButton}
//               onPress={() =>
//                 Linking.openURL(
//                   `https://maps.apple.com/?daddr=${property.latitude},${property.longitude}`
//                 )
//               }
//             >
//               <Text style={styles.directionsText}>Directions</Text>
//               <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Owner Contact Card */}
//         <CustomCard style={styles.card}>
//           <Text style={styles.cardTitle}>Owner & Contact</Text>
//           <View style={styles.infoRow}>
//             <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
//             <Text style={styles.infoLabel}>Name:</Text>
//             <Text style={styles.infoValue}>{property.owner_info?.firstname || 'N/A'}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
//             <Text style={styles.infoLabel}>Email:</Text>
//             <Text style={styles.infoValue}>{property.owner_info?.email || 'N/A'}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
//             <Text style={styles.infoLabel}>Phone:</Text>
//             <Text style={styles.infoValue}>{formatPhone(property.contact_phone || property.owner_info?.phone)}</Text>
//           </View>
//         </CustomCard>

//         {/* Instructions Card (if any) */}
//         {property.instructions && (
//           <CustomCard style={styles.card}>
//             <Text style={styles.cardTitle}>Special Instructions</Text>
//             <Text style={styles.instructionsText}>{property.instructions}</Text>
//           </CustomCard>
//         )}

//         {/* Checklists Card */}
//         {property.checklists && property.checklists.length > 0 && (
//           <CustomCard style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Cleaning Checklists</Text>
//               {checklistsLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
//             </View>
//             {checklistsError ? (
//               <Text style={styles.errorText}>{checklistsError}</Text>
//             ) : checklists.length === 0 && !checklistsLoading ? (
//               <Text style={styles.emptyText}>No checklists found.</Text>
//             ) : (
//               checklists.map((checklist, index) => (
//                 <TouchableOpacity
//                   key={checklist._id || index}
//                   style={styles.checklistItem}
//                   onPress={() => openChecklistModal(checklist)}
//                 >
//                   <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//                   <View style={styles.checklistInfo}>
//                     <Text style={styles.checklistName}>{checklist.checklistName || 'Unnamed Checklist'}</Text>
//                     <View style={styles.checklistMetaRow}>
//                       <Text style={styles.checklistMeta}>⏱️ {checklist.totalTime} min</Text>
//                       <Text style={styles.checklistMeta}>💰 ${checklist.totalFee?.toFixed(2)}</Text>
//                     </View>
//                   </View>
//                   <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
//                 </TouchableOpacity>
//               ))
//             )}
//           </CustomCard>
//         )}

//         {/* Room Details Card */}
//         <CustomCard style={styles.card}>
//           <Text style={styles.cardTitle}>Room Details</Text>
//           <View style={styles.roomGrid}>
//             {property.roomDetails?.map((room, index) => (
//               <View key={index} style={styles.roomGridItem}>
//                 <MaterialCommunityIcons
//                   name={getRoomIcon(room.type)}
//                   size={28}
//                   color={COLORS.primary}
//                 />
//                 <Text style={styles.roomType}>{room.type}</Text>
//                 <View style={styles.roomStats}>
//                   <Text style={styles.roomCount}>
//                     {room.number} {room.number > 1 ? 'rooms' : 'room'}
//                   </Text>
//                   <Text style={styles.roomSize}> • {room.size} sq ft</Text>
//                 </View>
//                 <Text style={styles.roomSizeRange}>({room.size_range})</Text>
//               </View>
//             ))}
//           </View>
//         </CustomCard>
//       </ScrollView>

//       {/* Checklist Details Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{selectedChecklist?.checklistName || 'Checklist Details'}</Text>
//               <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
//                 <MaterialIcons name="close" size={24} color={COLORS.gray} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScroll}>
//               {selectedChecklist && (
//                 <>
//                   {/* Summary */}
//                   <View style={styles.modalSummary}>
//                     <Text style={styles.modalSummaryText}>Total Time: {selectedChecklist.totalTime} min</Text>
//                     <Text style={styles.modalSummaryText}>Total Fee: ${selectedChecklist.totalFee?.toFixed(2)}</Text>
//                   </View>

//                   {/* Rooms and Tasks */}
//                   {selectedChecklist.checklist?.group_a?.details && (
//                     Object.entries(selectedChecklist.checklist.group_a.details).map(([roomKey, room]) => (
//                       <View key={roomKey} style={styles.modalRoomSection}>
//                         <View style={styles.modalRoomHeader}>
//                           <MaterialCommunityIcons name={getRoomIcon(roomKey)} size={20} color={COLORS.primary} />
//                           <Text style={styles.modalRoomTitle}>{roomKey.replace(/_/g, ' ')}</Text>
//                           <Text style={styles.modalTaskCount}>({countTasksInRoom(room)} tasks)</Text>
//                         </View>
                        
//                         {/* Tasks Grid - 2 columns */}
//                         <View style={styles.tasksGrid}>
//                           {room.tasks && room.tasks.map((task, idx) => (
//                             <View key={idx} style={styles.modalTaskItem}>
//                               <MaterialCommunityIcons
//                                 name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
//                                 size={10}
//                                 color={task.value ? COLORS.success : COLORS.gray}
//                                 style={styles.taskIcon}
//                               />
//                               <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
//                                 {task.label}
//                               </Text>
//                             </View>
//                           ))}
//                         </View>

//                         {/* Notes if any */}
//                         {room.notes?.text ? (
//                           <Text style={styles.modalNotes}>📝 {room.notes.text}</Text>
//                         ) : null}
//                       </View>
//                     ))
//                   )}

//                   {/* Extras if any */}
//                   {selectedChecklist.checklist?.group_a?.details?.Extra && (
//                     <View style={styles.modalRoomSection}>
//                       <View style={styles.modalRoomHeader}>
//                         <MaterialCommunityIcons name="star-outline" size={20} color={COLORS.primary} />
//                         <Text style={styles.modalRoomTitle}>Extra Tasks</Text>
//                       </View>
//                       <View style={styles.tasksGrid}>
//                         {selectedChecklist.checklist.group_a.details.Extra.tasks?.map((task, idx) => (
//                           <View key={idx} style={styles.modalTaskItem}>
//                             <MaterialCommunityIcons
//                               name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
//                               size={16}
//                               color={task.value ? COLORS.success : COLORS.gray}
//                               style={styles.taskIcon}
//                             />
//                             <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
//                               {task.label} {task.time && `(${task.time} min)`} {task.price && `+$${task.price}`}
//                             </Text>
//                           </View>
//                         ))}
//                       </View>
//                     </View>
//                   )}
//                 </>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// /* ---------------- InviteBanner Component ---------------- */
// const InviteBanner = ({ status, onAccept, onDecline, processing }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(-15)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   if (status !== 'pending') return null;

//   return (
//     <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//       <Text style={styles.inviteTitle}>✨ You're Invited!</Text>
//       <Text style={styles.inviteText}>You've been invited to clean this property. Would you like to accept?</Text>
//       <View style={styles.inviteButtons}>
//         <TouchableOpacity
//           style={[styles.acceptBtn, processing && styles.disabledBtn]}
//           onPress={onAccept}
//           disabled={processing}
//         >
//           {processing ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.acceptText}>Accept</Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.declineBtn, processing && styles.disabledBtn]}
//           onPress={onDecline}
//           disabled={processing}
//         >
//           {processing ? (
//             <ActivityIndicator size="small" color={COLORS.error} />
//           ) : (
//             <Text style={styles.declineText}>Decline</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );
// };

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   contentContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FA',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     paddingVertical: 10,
//   },

//   /* Header Card */
//   headerCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     padding: 24,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   propertyName: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 6,
//   },
//   propertyTypeBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   propertyTypeText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },

//   /* Map Card */
//   mapCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   mapImage: {
//     width: '100%',
//     height: 150,
//   },
//   mapPlaceholder: {
//     backgroundColor: '#e0e0e0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//   },
//   addressText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 8,
//   },
//   directionsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     backgroundColor: '#F0F5FF',
//     borderRadius: 20,
//   },
//   directionsText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 4,
//   },

//   /* General Card */
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     marginBottom:10,
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//   },

//   /* Info Row */
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   infoLabel: {
//     width: 70,
//     fontSize: 14,
//     color: '#888',
//     marginLeft: 8,
//   },
//   infoValue: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },

//   /* Instructions */
//   instructionsText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#555',
//   },

//   /* Checklists */
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   checklistInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   checklistMetaRow: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   checklistMeta: {
//     fontSize: 13,
//     color: '#666',
//     marginRight: 12,
//   },

//   /* Room Grid */
//   roomGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   roomGridItem: {
//     width: '48%',
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EFEFEF',
//   },
//   roomType: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   roomCount: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSize: {
//     fontSize: 13,
//     color: '#666',
//   },
//   roomSizeRange: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 2,
//   },

//   /* Invite Banner */
//   inviteCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 18,
//     marginTop: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#E0E7FF',
//   },
//   inviteTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 6,
//   },
//   inviteText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 16,
//   },
//   inviteButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   acceptBtn: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   acceptText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   declineBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: COLORS.error,
//     paddingVertical: 12,
//     borderRadius: 30,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   declineText: {
//     color: COLORS.error,
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   acceptedText: {
//     fontSize: 14,
//     color: COLORS.success,
//     fontWeight: '500',
//     flex: 1,
//   },

//   /* Modal Styles */
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 30,
//     maxHeight: '90%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#333',
//     flex: 1,
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalScroll: {
//     marginBottom: 10,
//   },
//   modalSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#F0F5FF',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },
//   modalSummaryText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   modalRoomSection: {
//     marginBottom: 20,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     padding: 12,
//   },
//   modalRoomHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   modalRoomTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//     textTransform: 'capitalize',
//   },
//   modalTaskCount: {
//     fontSize: 12,
//     color: '#888',
//     marginLeft: 8,
//   },
// //   modalTaskItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginLeft: 28,
// //     marginVertical: 4,
// //   },
// //   modalTaskText: {
// //     fontSize: 14,
// //     color: '#555',
// //     marginLeft: 8,
// //     flex: 1,
// //   },
//   modalTaskCompleted: {
//     textDecorationLine: 'line-through',
//     color: '#aaa',
//   },
//   modalNotes: {
//     fontSize: 13,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 6,
//     marginLeft: 28,
//   },

// //   tasksGrid: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     marginTop: 8,
// //   },
//   // duplicate modalTaskItem from above is fine (merge if needed)
//   taskIcon: {
//     marginRight: 6,
//   },
//   disabledBtn: {
//     opacity: 0.6,
//   },




//   tasksGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between'
//   },
  
//   modalTaskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '50%',
//     paddingRight: 10,
//     marginBottom: 8,
//   },
  
//   modalTaskText: {
//     fontSize: 13,
//     color: '#555',
//     marginLeft: 6,
//     flexShrink: 1,
//   },
// });



import React, { useState, useEffect, useRef, useContext } from 'react';
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
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import COLORS from '../../constants/colors';
import CustomCard from '../../components/shared/CustomCard';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
// import { MAP_BOX_SECRET_KEY } from '../../secret';
import { tSafe } from '../../utils/tSafe'; // added import

// Helper to get room icon
const getRoomIcon = (type) => {
  if (type.includes('Bedroom')) return 'bed-queen-outline';
  if (type.includes('Bathroom')) return 'shower-head';
  if (type.includes('Livingroom')) return 'sofa-outline';
  if (type.includes('Kitchen')) return 'fridge-outline';
  return 'door-open';
};

// Format phone number
const formatPhone = (phone) => {
  if (!phone) return tSafe('na', 'N/A');
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Helper to count tasks in a room
const countTasksInRoom = (room) => {
  if (!room || !room.tasks) return 0;
  return room.tasks.length;
};

export default function PropertyPreview() {
  const route = useRoute();
  const { propertyId, inviteToken } = route.params || {};
  const { currentUserId } = useContext(AuthContext);

  const MAP_BOX_SECRET_KEY = rocess.env.MAP_BOX_SECRET_KEY

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(inviteToken ? 'pending' : null);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [processingInvite, setProcessingInvite] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [mapError, setMapError] = useState(false);

  // Checklists state
  const [checklists, setChecklists] = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [checklistsError, setChecklistsError] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scrollRef = useRef(null);

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setError(tSafe('no_property_id', 'No property ID provided'));
        setLoading(false);
        return;
      }
      try {
        const response = await userService.getApartmentById(propertyId);
        const propData = response.data;
        setProperty(propData);

        if (propData.checklists && propData.checklists.length > 0) {
          await fetchChecklists(propData.checklists);
        }
      } catch (err) {
        console.error('Failed to load property:', err);
        setError(tSafe('unable_to_load_property', 'Unable to load property details. Please try again.'));
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe('failed_to_load_property', 'Failed to load property details.')
        );
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [propertyId]);

  // Fetch checklists by IDs
  const fetchChecklists = async (checklistIds) => {
    setChecklistsLoading(true);
    setChecklistsError(null);
    try {
      const response = await userService.getCustomChecklistsByProperty(checklistIds);
      setChecklists(response.data.data || []);
    } catch (err) {
      console.error('Failed to load checklists:', err);
      setChecklistsError(tSafe('could_not_load_checklists', 'Could not load checklists.'));
    } finally {
      setChecklistsLoading(false);
    }
  };

  // Generate static map URL
  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${property.latitude},${property.longitude})/${property.longitude},${property.latitude},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
      setMapImageUrl(url);
      setMapError(false);
    }
  }, [property]);

  // Auto-scroll for invite banner
  useEffect(() => {
    if (inviteToken && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }, 300);
    }
  }, [inviteToken]);

  // Check for pending invite from the server (if user is logged in)
  useEffect(() => {
    const checkInviteStatus = async () => {
      if (!propertyId || !currentUserId) return;
      try {
        const response = await userService.getInviteStatus(propertyId, currentUserId);
        if (response.data && response.data.invite) {
          const invite = response.data.invite;
          setInviteDetails(invite);
          setInviteStatus('pending');
        } else if (!inviteToken) {
          // No pending invite and no token from deep link → no banner
          setInviteStatus(null);
        }
      } catch (err) {
        console.log('No pending invite or error', err);
        // If error, we still respect inviteToken from deep link
      }
    };
    checkInviteStatus();
  }, [propertyId, currentUserId, inviteToken]);

  // Accept handler – works for both token and platform invites
  const handleAcceptInvite = async () => {
    if (!currentUserId) return;
    setProcessingInvite(true);
    try {
      if (inviteDetails && inviteDetails.type === 'platform') {
        // Platform invite – use invite ID
        await userService.acceptPlatformInvite({
          propertyId: propertyId,
          cleanerId: currentUserId,
        });
      } else if (inviteToken || (inviteDetails && inviteDetails.token)) {
        // Email invite – use token
        const token = inviteToken || inviteDetails.token;
        await userService.acceptInvite({ 
          propertyId: propertyId, 
          cleanerId: currentUserId 
        });
      } else {
        throw new Error('No valid invite found');
      }
      setInviteStatus('accepted');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Accept failed:', err);
      Alert.alert(
        tSafe('error_title', 'Error'),
        err.response?.data?.error || tSafe('failed_to_accept_invitation', 'Failed to accept invitation')
      );
      setInviteStatus('pending');
    } finally {
      setProcessingInvite(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!currentUserId) return;
    setProcessingInvite(true);
    try {
      if (inviteDetails && inviteDetails.type === 'platform') {
        await userService.declinePlatformInvite({
          inviteId: inviteDetails._id,
          cleanerId: currentUserId,
        });
      } else if (inviteToken || (inviteDetails && inviteDetails.token)) {
        const token = inviteToken || inviteDetails.token;
        await userService.declineInvite({ token, cleanerId: currentUserId });
      } else {
        throw new Error('No valid invite found');
      }
      setInviteStatus('declined');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error('Decline failed:', err);
      Alert.alert(
        tSafe('error_title', 'Error'),
        err.response?.data?.error || tSafe('failed_to_decline_invitation', 'Failed to decline invitation')
      );
      setInviteStatus('pending');
    } finally {
      setProcessingInvite(false);
    }
  };

  const openChecklistModal = (checklist) => {
    setSelectedChecklist(checklist);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChecklist(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_property', 'Loading property...')}</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error || tSafe('property_not_found', 'Property not found')}</Text>
      </View>
    );
  }

  const showInviteBanner = inviteStatus === 'pending' && (inviteDetails || inviteToken);

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Invite Banner */}
        {showInviteBanner && (
          <InviteBanner
            status="pending"
            onAccept={handleAcceptInvite}
            onDecline={handleDeclineInvite}
            processing={processingInvite}
          />
        )}
        {inviteStatus === 'accepted' && (
          <View style={styles.inviteCard}>
            <View style={styles.acceptedRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.acceptedText}>
                {tSafe('invitation_accepted', 'Invitation accepted. You can now schedule a cleaning.')}
              </Text>
            </View>
          </View>
        )}

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerOverlay}>
            <Text style={styles.propertyName}>{property.apt_name}</Text>
            <View style={styles.propertyTypeBadge}>
              <Text style={styles.propertyTypeText}>{property.apt_type?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Map & Address Card */}
        <View style={styles.mapCard}>
          {mapImageUrl && !mapError ? (
            <Image
              source={{ uri: mapImageUrl }}
              style={styles.mapImage}
              resizeMode="cover"
              onError={() => setMapError(true)}
            />
          ) : (
            <View style={[styles.mapImage, styles.mapPlaceholder]}>
              <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.gray} />
              <Text style={styles.placeholderText}>{tSafe('map_unavailable', 'Map unavailable')}</Text>
            </View>
          )}
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.addressText}>{property.address}</Text>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() =>
                Linking.openURL(
                  `https://maps.apple.com/?daddr=${property.latitude},${property.longitude}`
                )
              }
            >
              <Text style={styles.directionsText}>{tSafe('directions', 'Directions')}</Text>
              <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Owner Contact Card */}
        <CustomCard style={styles.card}>
          <Text style={styles.cardTitle}>{tSafe('owner_and_contact', 'Owner & Contact')}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
            <Text style={styles.infoLabel}>{tSafe('name_label', 'Name:')}</Text>
            <Text style={styles.infoValue}>{property.owner_info?.firstname || tSafe('na', 'N/A')}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
            <Text style={styles.infoLabel}>{tSafe('email_label', 'Email:')}</Text>
            <Text style={styles.infoValue}>{property.owner_info?.email || tSafe('na', 'N/A')}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
            <Text style={styles.infoLabel}>{tSafe('phone_label', 'Phone:')}</Text>
            <Text style={styles.infoValue}>{formatPhone(property.contact_phone || property.owner_info?.phone)}</Text>
          </View>
        </CustomCard>

        {/* Instructions Card (if any) */}
        {property.instructions && (
          <CustomCard style={styles.card}>
            <Text style={styles.cardTitle}>{tSafe('special_instructions', 'Special Instructions')}</Text>
            <Text style={styles.instructionsText}>{property.instructions}</Text>
          </CustomCard>
        )}

        {/* Checklists Card */}
        {property.checklists && property.checklists.length > 0 && (
          <CustomCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
              {checklistsLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>
            {checklistsError ? (
              <Text style={styles.errorText}>{checklistsError}</Text>
            ) : checklists.length === 0 && !checklistsLoading ? (
              <Text style={styles.emptyText}>{tSafe('no_checklists_found', 'No checklists found.')}</Text>
            ) : (
              checklists.map((checklist, index) => (
                <TouchableOpacity
                  key={checklist._id || index}
                  style={styles.checklistItem}
                  onPress={() => openChecklistModal(checklist)}
                >
                  <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
                  <View style={styles.checklistInfo}>
                    <Text style={styles.checklistName}>
                      {checklist.checklistName || tSafe('unnamed_checklist', 'Unnamed Checklist')}
                    </Text>
                    <View style={styles.checklistMetaRow}>
                      <Text style={styles.checklistMeta}>⏱️ {checklist.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
                      <Text style={styles.checklistMeta}>💰 ${checklist.totalFee?.toFixed(2)}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              ))
            )}
          </CustomCard>
        )}

        {/* Room Details Card */}
        <CustomCard style={styles.card}>
          <Text style={styles.cardTitle}>{tSafe('room_details', 'Room Details')}</Text>
          <View style={styles.roomGrid}>
            {property.roomDetails?.map((room, index) => (
              <View key={index} style={styles.roomGridItem}>
                <MaterialCommunityIcons
                  name={getRoomIcon(room.type)}
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.roomType}>{room.type}</Text>
                <View style={styles.roomStats}>
                  <Text style={styles.roomCount}>
                    {room.number} {room.number > 1 ? tSafe('rooms', 'rooms') : tSafe('room', 'room')}
                  </Text>
                  <Text style={styles.roomSize}> • {room.size} {tSafe('sq_ft', 'sq ft')}</Text>
                </View>
                <Text style={styles.roomSizeRange}>({room.size_range})</Text>
              </View>
            ))}
          </View>
        </CustomCard>
      </ScrollView>

      {/* Checklist Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedChecklist?.checklistName || tSafe('checklist_details', 'Checklist Details')}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedChecklist && (
                <>
                  {/* Summary */}
                  <View style={styles.modalSummary}>
                    <Text style={styles.modalSummaryText}>
                      {tSafe('total_time_label', 'Total Time:')} {selectedChecklist.totalTime} {tSafe('minutes_abbr', 'min')}
                    </Text>
                    <Text style={styles.modalSummaryText}>
                      {tSafe('total_fee_label', 'Total Fee:')} ${selectedChecklist.totalFee?.toFixed(2)}
                    </Text>
                  </View>

                  {/* Rooms and Tasks */}
                  {selectedChecklist.checklist?.group_a?.details && (
                    Object.entries(selectedChecklist.checklist.group_a.details).map(([roomKey, room]) => (
                      <View key={roomKey} style={styles.modalRoomSection}>
                        <View style={styles.modalRoomHeader}>
                          <MaterialCommunityIcons name={getRoomIcon(roomKey)} size={20} color={COLORS.primary} />
                          <Text style={styles.modalRoomTitle}>{roomKey.replace(/_/g, ' ')}</Text>
                          <Text style={styles.modalTaskCount}>
                            ({countTasksInRoom(room)} {tSafe('tasks', 'tasks')})
                          </Text>
                        </View>
                        
                        {/* Tasks Grid - 2 columns */}
                        <View style={styles.tasksGrid}>
                          {room.tasks && room.tasks.map((task, idx) => (
                            <View key={idx} style={styles.modalTaskItem}>
                              <MaterialCommunityIcons
                                name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                size={10}
                                color={task.value ? COLORS.success : COLORS.gray}
                                style={styles.taskIcon}
                              />
                              <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
                                {task.label}
                              </Text>
                            </View>
                          ))}
                        </View>

                        {/* Notes if any */}
                        {room.notes?.text ? (
                          <Text style={styles.modalNotes}>📝 {room.notes.text}</Text>
                        ) : null}
                      </View>
                    ))
                  )}

                  {/* Extras if any */}
                  {selectedChecklist.checklist?.group_a?.details?.Extra && (
                    <View style={styles.modalRoomSection}>
                      <View style={styles.modalRoomHeader}>
                        <MaterialCommunityIcons name="star-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.modalRoomTitle}>{tSafe('extra_tasks', 'Extra Tasks')}</Text>
                      </View>
                      <View style={styles.tasksGrid}>
                        {selectedChecklist.checklist.group_a.details.Extra.tasks?.map((task, idx) => (
                          <View key={idx} style={styles.modalTaskItem}>
                            <MaterialCommunityIcons
                              name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
                              size={16}
                              color={task.value ? COLORS.success : COLORS.gray}
                              style={styles.taskIcon}
                            />
                            <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
                              {task.label} {task.time && `(${task.time} ${tSafe('minutes_abbr', 'min')})`} {task.price && `+$${task.price}`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------------- InviteBanner Component ---------------- */
const InviteBanner = ({ status, onAccept, onDecline, processing }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (status !== 'pending') return null;

  return (
    <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.inviteTitle}>{tSafe('youre_invited', "✨ You're Invited!")}</Text>
      <Text style={styles.inviteText}>
        {tSafe('invite_text', "You've been invited to clean this property. Would you like to accept?")}
      </Text>
      <View style={styles.inviteButtons}>
        <TouchableOpacity
          style={[styles.acceptBtn, processing && styles.disabledBtn]}
          onPress={onAccept}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptText}>{tSafe('accept', 'Accept')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.declineBtn, processing && styles.disabledBtn]}
          onPress={onDecline}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <Text style={styles.declineText}>{tSafe('decline', 'Decline')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },

  /* Header Card */
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  propertyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  propertyTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  propertyTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },

  /* Map Card */
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  mapImage: {
    width: '100%',
    height: 150,
  },
  mapPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F5FF',
    borderRadius: 20,
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },

  /* General Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom:10,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },

  /* Info Row */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    width: 70,
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  /* Instructions */
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },

  /* Checklists */
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checklistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  checklistMetaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  checklistMeta: {
    fontSize: 13,
    color: '#666',
    marginRight: 12,
  },

  /* Room Grid */
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomGridItem: {
    width: '48%',
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  roomType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roomCount: {
    fontSize: 13,
    color: '#666',
  },
  roomSize: {
    fontSize: 13,
    color: '#666',
  },
  roomSizeRange: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  /* Invite Banner */
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  inviteText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  inviteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  declineText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 15,
  },
  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptedText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
    flex: 1,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0F5FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalSummaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalRoomSection: {
    marginBottom: 20,
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
    padding: 12,
  },
  modalRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalRoomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  modalTaskCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingRight: 10,
    marginBottom: 8,
  },
  modalTaskText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
    flexShrink: 1,
  },
  modalTaskCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  modalNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 28,
  },
  taskIcon: {
    marginRight: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

