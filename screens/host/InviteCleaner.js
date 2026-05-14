

// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   Modal,
//   Alert,
//   FlatList,
//   ActivityIndicator
// } from 'react-native';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { Button, TextInput, IconButton, Icon, Checkbox, RadioButton, Avatar, Card, Chip } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import { v4 as uuidv4 } from 'uuid';
// import { tSafe } from '../../utils/tSafe';
// import * as Animatable from 'react-native-animatable';
// import CircleIcon from '../../components/shared/CircleIcon';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';

// export default function InviteCleaner({ route }) {
//   const { property } = route.params;
//   const navigation = useNavigation();
//   const { currentUserId } = useContext(AuthContext);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

//   // State for cleaners
//   const [preferredCleaners, setPreferredCleaners] = useState(property?.preferredCleaners || []);
//   const [inviteEmail, setInviteEmail] = useState('');
//   const [invitePhone, setInvitePhone] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [platformCleaners, setPlatformCleaners] = useState([]);
//   const [showPlatformCleaners, setShowPlatformCleaners] = useState(false);
//   const [selectedPlatformCleaner, setSelectedPlatformCleaner] = useState(null);
//   const [inviteModalVisible, setInviteModalVisible] = useState(false);
//   const [inviteMethod, setInviteMethod] = useState('email'); // 'email' or 'phone'

//   // Fetch platform cleaners when component mounts
//   useEffect(() => {
//     if (property?.latitude && property?.longitude) {
//       fetchPlatformCleaners(property.latitude, property.longitude);
//     }
//   }, [property]);

//   const fetchPlatformCleaners = async (lat, lng) => {
//     try {
//       setLoading(true);
//       const res = await userService.getPlatformCleaners({
//         latitude: lat,
//         longitude: lng,
//         radius: 100 // miles
//       });
//       console.log("Recommended cleaners:", res.data);
//       setPlatformCleaners(res.data);
//     } catch (err) {
//       console.log('Failed to fetch platform cleaners', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addPlatformCleaner = (cleaner) => {
//     if (!preferredCleaners.some(c => c.id === cleaner.id)) {
//       setPreferredCleaners([...preferredCleaners, { 
//         ...cleaner, 
//         type: 'platform',
//         status: 'pending',
//         addedAt: new Date().toISOString()
//       }]);
//       Alert.alert(
//         tSafe('success', 'Success'),
//         `${cleaner.firstname} ${cleaner.lastname} ${tSafe('added_to_preferred', 'added to preferred cleaners')}`
//       );
//     } else {
//       Alert.alert(
//         tSafe('info', 'Info'),
//         tSafe('cleaner_already_added', 'This cleaner is already in your preferred list')
//       );
//     }
//     setSelectedPlatformCleaner(null);
//     setShowPlatformCleaners(false);
//   };

//   const removeCleaner = (id) => {
//     Alert.alert(
//       tSafe('remove_cleaner', 'Remove Cleaner'),
//       tSafe('remove_cleaner_confirmation', 'Are you sure you want to remove this cleaner?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         { 
//           text: tSafe('remove', 'Remove'), 
//           style: 'destructive',
//           onPress: () => setPreferredCleaners(preferredCleaners.filter(c => c.id !== id))
//         }
//       ]
//     );
//   };

//   const addInvitedCleaner = () => {
//     if (!inviteEmail && !invitePhone) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('email_or_phone_required', 'Email or phone number is required')
//       );
//       return;
//     }

//     // Validate email format if provided
//     if (inviteEmail && !isValidEmail(inviteEmail)) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('invalid_email', 'Please enter a valid email address')
//       );
//       return;
//     }

//     // Validate phone format if provided
//     if (invitePhone && !isValidPhone(invitePhone)) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('invalid_phone', 'Please enter a valid phone number (10 digits)')
//       );
//       return;
//     }

//     const tempId = uuidv4();
//     const newInvitedCleaner = {
//       id: tempId,
//       type: 'invited',
//       email: inviteEmail || null,
//       phone: invitePhone || null,
//       status: 'pending',
//       addedAt: new Date().toISOString()
//     };

//     setPreferredCleaners([...preferredCleaners, newInvitedCleaner]);
//     setInviteEmail('');
//     setInvitePhone('');
//     setInviteModalVisible(false);
    
//     Alert.alert(
//       tSafe('invitation_sent', 'Invitation Sent'),
//       tSafe('cleaner_invited_successfully', 'Cleaner has been invited successfully')
//     );
//   };

//   const isValidEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const isValidPhone = (phone) => {
//     const phoneRegex = /^[\d\s\-\(\)]{10,15}$/;
//     return phoneRegex.test(phone);
//   };

//   const formatPhoneNumber = (input) => {
//     const cleaned = ('' + input).replace(/\D/g, '');
//     const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//     if (match) {
//       return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//     }
//     return input;
//   };

//   const handlePhoneChange = (text) => {
//     setInvitePhone(formatPhoneNumber(text));
//   };

//   const sendInvitations = async () => {
//     if (preferredCleaners.length === 0) {
//         Alert.alert('No Cleaners', 'Please add at least one cleaner');
//         return;
//       }
    
//       setLoading(true);
//       try {
//         // Build preferred_cleaners array
//         const preferred_cleaners = [];
        
//         // Add platform cleaners
//         preferredCleaners.forEach(cleaner => {
//           if (cleaner.type === 'platform') {
//             preferred_cleaners.push({
//               id: cleaner.id,
//               type: 'platform'
//             });
//           } else if (cleaner.type === 'invited') {
//             preferred_cleaners.push({
//               id: cleaner.id,
//               type: 'invited'
//             });
//           }
//         });
        
//         // Build invited_cleaners array
//         const invited_cleaners = preferredCleaners
//           .filter(c => c.type === 'invited')
//           .map(c => ({
//             tempId: c.id,
//             email: c.email,
//             phone: c.phone
//           }));
        
//         const requestData = {
//           property_id: property._id,  // Note: snake_case
//           host_id: currentUserId,
//           property_name: property.apt_name,
//           host_name: `${property.owner_info?.firstname || ''} ${property.owner_info?.lastname || ''}`.trim(),
//           host_avatar: property.owner_info?.avatar || null,
//           preferred_cleaners: preferred_cleaners,
//           invited_cleaners: invited_cleaners
//         };
        
//         console.log('Sending request:', JSON.stringify(requestData, null, 2));

//       // Send invitations to backend
//       const response = await userService.sendCleanerInvitations(requestData);
      
//       if (response.status === 200) {
//         Alert.alert(
//           tSafe('invitations_sent', 'Invitations Sent'),
//           tSafe('cleaners_notified', 'Cleaners have been notified about your property')
//         );
//         navigation.goBack();
//       }
//     } catch (error) {
//       console.error('Error sending invitations:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_send_invitations', 'Failed to send invitations. Please try again.')
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'pending': return COLORS.warning || '#FF9800';
//       case 'accepted': return COLORS.success || '#4CAF50';
//       case 'declined': return COLORS.error || '#F44336';
//       default: return COLORS.gray;
//     }
//   };

//   const getStatusText = (status) => {
//     switch(status) {
//       case 'pending': return tSafe('pending', 'Pending');
//       case 'accepted': return tSafe('accepted', 'Accepted');
//       case 'declined': return tSafe('declined', 'Declined');
//       default: return status;
//     }
//   };

//   const renderCleanerItem = (cleaner, index) => {
//     const isPlatform = cleaner.type === 'platform';
//     const displayName = isPlatform 
//       ? `${cleaner.firstname || ''} ${cleaner.lastname || ''}`.trim()
//       : cleaner.email || cleaner.phone;
    
//     const displayInfo = isPlatform
//       ? `${cleaner.specialty || tSafe('professional_cleaner', 'Professional Cleaner')} • ${cleaner.experience || 0}+ ${tSafe('years_exp', 'years exp')}`
//       : cleaner.email ? `📧 ${cleaner.email}` : `📱 ${cleaner.phone}`;

//     return (
//       <Animatable.View 
//         key={cleaner.id || index} 
//         animation="fadeInUp" 
//         delay={index * 100} 
//         duration={400}
//       >
//         <Card style={styles.cleanerCard}>
//           <Card.Content style={styles.cleanerCardContent}>
//             <View style={styles.cleanerAvatar}>
//               {isPlatform && cleaner.avatar ? (
//                 <Avatar.Image size={50} source={{ uri: cleaner.avatar }} />
//               ) : (
//                 <Avatar.Icon 
//                   size={50} 
//                   icon={isPlatform ? "account-circle" : "email-outline"} 
//                   style={{ backgroundColor: COLORS.primary + '20' }}
//                   color={COLORS.primary}
//                 />
//               )}
//             </View>
//             <View style={styles.cleanerInfo}>
//               <Text style={styles.cleanerName}>{displayName}</Text>
//               <Text style={styles.cleanerDetail}>{displayInfo}</Text>
//               {cleaner.status && (
//                 <View style={styles.statusContainer}>
//                   <View style={[styles.statusDot, { backgroundColor: getStatusColor(cleaner.status) }]} />
//                   <Text style={styles.statusText}>{getStatusText(cleaner.status)}</Text>
//                 </View>
//               )}
//             </View>
//             <TouchableOpacity 
//               onPress={() => removeCleaner(cleaner.id)}
//               style={styles.removeButton}
//             >
//               <MaterialIcons name="close" size={20} color={COLORS.error} />
//             </TouchableOpacity>
//           </Card.Content>
//         </Card>
//       </Animatable.View>
//     );
//   };

//   const renderPlatformCleanerItem = ({ item }) => (
//     <TouchableOpacity 
//       style={[
//         styles.platformCleanerItem,
//         selectedPlatformCleaner?.id === item.id && styles.selectedPlatformCleaner
//       ]}
//       onPress={() => setSelectedPlatformCleaner(item)}
//     >
//       <View style={styles.platformCleanerAvatar}>
//         {item.avatar ? (
//           <Avatar.Image size={40} source={{ uri: item.avatar }} />
//         ) : (
//           <Avatar.Icon size={40} icon="account" style={{ backgroundColor: COLORS.primary + '20' }} />
//         )}
//       </View>
//       <View style={styles.platformCleanerInfo}>
//         <Text style={styles.platformCleanerName}>
//           {item.firstname} {item.lastname}
//         </Text>
//         <Text style={styles.platformCleanerDetail}>
//           ⭐ {item.rating || 4.5} • {item.completedJobs || 0} {tSafe('jobs', 'jobs')}
//         </Text>
//         <Text style={styles.platformCleanerSpecialty}>
//           {item.specialty || tSafe('general_cleaning', 'General Cleaning')}
//         </Text>
//       </View>
//       {selectedPlatformCleaner?.id === item.id && (
//         <View style={styles.selectedIndicator}>
//           <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.contentContainer}
//       >
//         {/* Property Header Card */}
//         <Animatable.View animation="fadeInUp" duration={500} style={styles.propertyCard}>
//           <View style={styles.propertyHeader}>
//             <Text style={styles.propertyName}>{property?.apt_name}</Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
//               <Text style={styles.propertyAddress}>{property?.address}</Text>
//             </View>
//             <View style={styles.roomStats}>
//               <CircleIcon
//                 iconName="bed-empty"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={bedroomCount}
//                 roomSize={bedroomSize}
//                 type={tSafe('bedrooms', 'Bedrooms')}
//               />
//               <CircleIcon
//                 iconName="shower-head"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={bathroomCount}
//                 roomSize={bathroomSize}
//                 type={tSafe('bathrooms', 'Bathrooms')}
//               />
//               <CircleIcon
//                 iconName="silverware-fork-knife"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={kitchen}
//                 roomSize={kitchenSize}
//                 type={tSafe('kitchen', 'Kitchen')}
//               />
//               <CircleIcon
//                 iconName="seat-legroom-extra"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={livingroomCount}
//                 roomSize={livingroomSize}
//                 type={tSafe('livingroom', 'Livingroom')}
//               />
//             </View>
//           </View>
//         </Animatable.View>

//         {/* Invite Cleaner Section */}
//         <Animatable.View animation="fadeInUp" delay={200} style={styles.inviteSection}>
//           <Text style={styles.sectionTitle}>{tSafe('invite_cleaners', 'Invite Cleaners')}</Text>
//           <Text style={styles.sectionSubtitle}>
//             {tSafe('invite_cleaners_description', 'Add your preferred cleaners to this property')}
//           </Text>

//           {/* Add Cleaner Buttons */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity 
//               style={[styles.addButton, styles.inviteButton]}
//               onPress={() => {
//                 setInviteMethod('email');
//                 setInviteModalVisible(true);
//               }}
//             >
//               <MaterialIcons name="email" size={20} color="white" />
//               <Text style={styles.addButtonText}>{tSafe('invite_by_email', 'Invite by Email')}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.addButton, styles.inviteButton]}
//               onPress={() => {
//                 setInviteMethod('phone');
//                 setInviteModalVisible(true);
//               }}
//             >
//               <MaterialIcons name="phone" size={20} color="white" />
//               <Text style={styles.addButtonText}>{tSafe('invite_by_phone', 'Invite by Phone')}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.addButton, styles.platformButton]}
//               onPress={() => setShowPlatformCleaners(true)}
//             >
//               <MaterialIcons name="people" size={20} color="white" />
//               <Text style={styles.addButtonText}>{tSafe('add_platform_cleaners', 'Add Platform Cleaners')}</Text>
//             </TouchableOpacity>
//           </View>
//         </Animatable.View>

//         {/* Preferred Cleaners List */}
//         {preferredCleaners.length > 0 && (
//           <Animatable.View animation="fadeInUp" delay={300} style={styles.cleanersSection}>
//             <Text style={styles.sectionTitle}>
//               {tSafe('preferred_cleaners', 'Preferred Cleaners')} ({preferredCleaners.length})
//             </Text>
//             {preferredCleaners.map((cleaner, index) => renderCleanerItem(cleaner, index))}
//           </Animatable.View>
//         )}

//         {/* Benefits Section */}
//         <Animatable.View animation="fadeInUp" delay={400} style={styles.benefitsSection}>
//           <Text style={styles.sectionTitle}>{tSafe('why_invite_cleaners', 'Why Invite Cleaners?')}</Text>
//           <View style={styles.benefitsGrid}>
//             <View style={styles.benefitCard}>
//               <MaterialIcons name="verified" size={32} color={COLORS.primary} />
//               <Text style={styles.benefitTitle}>{tSafe('trusted_professionals', 'Trusted Professionals')}</Text>
//               <Text style={styles.benefitText}>
//                 {tSafe('trusted_professionals_desc', 'Vetted and experienced cleaners')}
//               </Text>
//             </View>
//             <View style={styles.benefitCard}>
//               <MaterialIcons name="schedule" size={32} color={COLORS.primary} />
//               <Text style={styles.benefitTitle}>{tSafe('flexible_scheduling', 'Flexible Scheduling')}</Text>
//               <Text style={styles.benefitText}>
//                 {tSafe('flexible_scheduling_desc', 'Choose times that work for you')}
//               </Text>
//             </View>
//             <View style={styles.benefitCard}>
//               <MaterialIcons name="security" size={32} color={COLORS.primary} />
//               <Text style={styles.benefitTitle}>{tSafe('secure_payments', 'Secure Payments')}</Text>
//               <Text style={styles.benefitText}>
//                 {tSafe('secure_payments_desc', 'Safe and transparent transactions')}
//               </Text>
//             </View>
//             <View style={styles.benefitCard}>
//               <MaterialIcons name="support-agent" size={32} color={COLORS.primary} />
//               <Text style={styles.benefitTitle}>{tSafe('dedicated_support', 'Dedicated Support')}</Text>
//               <Text style={styles.benefitText}>
//                 {tSafe('dedicated_support_desc', '24/7 customer support')}
//               </Text>
//             </View>
//           </View>
//         </Animatable.View>

//         {/* Send Invitations Button */}
//         {preferredCleaners.length > 0 && (
//           <Animatable.View animation="fadeInUp" delay={500}>
//             <Button
//               mode="contained"
//               onPress={sendInvitations}
//               loading={loading}
//               disabled={loading}
//               style={styles.sendButton}
//               labelStyle={styles.sendButtonLabel}
//               buttonColor={COLORS.primary}
//             >
//               {tSafe('send_invitations', 'Send Invitations')}
//             </Button>
//           </Animatable.View>
//         )}
//       </ScrollView>

//       {/* Invite Modal */}
//       <Modal
//         visible={inviteModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setInviteModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {inviteMethod === 'email' 
//                   ? tSafe('invite_by_email', 'Invite by Email')
//                   : tSafe('invite_by_phone', 'Invite by Phone')
//                 }
//               </Text>
//               <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
//                 <MaterialIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>

//             {inviteMethod === 'email' ? (
//               <TextInput
//                 mode="outlined"
//                 label={tSafe('email_address', 'Email Address')}
//                 placeholder={tSafe('enter_email', 'Enter email address')}
//                 value={inviteEmail}
//                 onChangeText={setInviteEmail}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 style={styles.modalInput}
//               />
//             ) : (
//               <TextInput
//                 mode="outlined"
//                 label={tSafe('phone_number', 'Phone Number')}
//                 placeholder={tSafe('enter_phone', 'Enter phone number')}
//                 value={invitePhone}
//                 onChangeText={handlePhoneChange}
//                 keyboardType="phone-pad"
//                 style={styles.modalInput}
//               />
//             )}

//             <View style={styles.modalButtons}>
//               <Button
//                 mode="outlined"
//                 onPress={() => setInviteModalVisible(false)}
//                 style={styles.modalCancelButton}
//                 labelStyle={styles.modalCancelLabel}
//               >
//                 {tSafe('cancel', 'Cancel')}
//               </Button>
//               <Button
//                 mode="contained"
//                 onPress={addInvitedCleaner}
//                 style={styles.modalInviteButton}
//                 buttonColor={COLORS.primary}
//               >
//                 {tSafe('invite', 'Invite')}
//               </Button>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Platform Cleaners Modal */}
//       <Modal
//         visible={showPlatformCleaners}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowPlatformCleaners(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, styles.platformModalContent]}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{tSafe('platform_cleaners', 'Platform Cleaners')}</Text>
//               <TouchableOpacity onPress={() => setShowPlatformCleaners(false)}>
//                 <MaterialIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>

//             {loading ? (
//               <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//             ) : platformCleaners.length > 0 ? (
//               <>
//                 <FlatList
//                   data={platformCleaners}
//                   renderItem={renderPlatformCleanerItem}
//                   keyExtractor={(item) => item.id}
//                   contentContainerStyle={styles.platformList}
//                   showsVerticalScrollIndicator={false}
//                 />
//                 <Button
//                   mode="contained"
//                   onPress={() => selectedPlatformCleaner && addPlatformCleaner(selectedPlatformCleaner)}
//                   disabled={!selectedPlatformCleaner}
//                   style={styles.addPlatformButton}
//                   buttonColor={COLORS.primary}
//                 >
//                   {tSafe('add_selected_cleaner', 'Add Selected Cleaner')}
//                 </Button>
//               </>
//             ) : (
//               <View style={styles.emptyContainer}>
//                 <MaterialIcons name="people-outline" size={64} color="#ccc" />
//                 <Text style={styles.emptyText}>{tSafe('no_cleaners_found', 'No platform cleaners found nearby')}</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F8F9FC',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   propertyCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.05,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   propertyHeader: {
//     marginBottom: 8,
//   },
//   propertyName: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   propertyAddress: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   inviteSection: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cleanersSection: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginBottom: 16,
//     lineHeight: 20,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   addButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//   },
//   inviteButton: {
//     backgroundColor: COLORS.primary,
//   },
//   platformButton: {
//     backgroundColor: '#6C63FF',
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   cleanerCard: {
//     marginBottom: 12,
//     borderRadius: 16,
//     elevation: 2,
//     backgroundColor:"#f9f9f9",
//   },
//   cleanerCardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//   },
//   cleanerAvatar: {
//     marginRight: 12,
//   },
//   cleanerInfo: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginBottom: 4,
//   },
//   cleanerDetail: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 4,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   statusDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 11,
//     color: '#6C6C80',
//   },
//   removeButton: {
//     padding: 8,
//   },
//   benefitsSection: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   benefitsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   benefitCard: {
//     width: '48%',
//     backgroundColor: '#F9F9FC',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   benefitTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginTop: 8,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   benefitText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     textAlign: 'center',
//     lineHeight: 16,
//   },
//   sendButton: {
//     borderRadius: 12,
//     paddingVertical: 8,
//   },
//   sendButtonLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     paddingVertical: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     padding: 20,
//     width: '90%',
//     maxWidth: 400,
//   },
//   platformModalContent: {
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   modalInput: {
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   modalCancelButton: {
//     flex: 1,
//     borderRadius: 12,
//   },
//   modalCancelLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   modalInviteButton: {
//     flex: 1,
//     borderRadius: 12,
//   },
//   platformList: {
//     paddingBottom: 16,
//   },
//   platformCleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: '#F9F9FC',
//     marginBottom: 8,
//   },
//   selectedPlatformCleaner: {
//     backgroundColor: COLORS.primary + '10',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//   },
//   platformCleanerAvatar: {
//     marginRight: 12,
//   },
//   platformCleanerInfo: {
//     flex: 1,
//   },
//   platformCleanerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginBottom: 2,
//   },
//   platformCleanerDetail: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 2,
//   },
//   platformCleanerSpecialty: {
//     fontSize: 12,
//     color: COLORS.primary,
//   },
//   selectedIndicator: {
//     marginLeft: 8,
//   },
//   addPlatformButton: {
//     borderRadius: 12,
//     marginTop: 16,
//   },
//   loader: {
//     marginVertical: 40,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#6C6C80',
//     marginTop: 16,
//     textAlign: 'center',
//   },
// });



import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Button, TextInput, IconButton, Icon, Checkbox, RadioButton, Avatar, Card, Chip } from 'react-native-paper';
import COLORS from '../../constants/colors';
import { v4 as uuidv4 } from 'uuid';
import { tSafe } from '../../utils/tSafe';
import * as Animatable from 'react-native-animatable';
import CircleIcon from '../../components/shared/CircleIcon';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';

const { width, height } = Dimensions.get('window');

export default function InviteCleaner({ route }) {
  const { property } = route.params;
  const navigation = useNavigation();
  const { currentUserId } = useContext(AuthContext);

  

  // Room details
  const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
  const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
  const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
  const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
  const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
  const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
  const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
  const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

  // State for cleaners
  const [preferredCleaners, setPreferredCleaners] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [platformCleaners, setPlatformCleaners] = useState([]);
  const [showPlatformCleaners, setShowPlatformCleaners] = useState(false);
  const [selectedPlatformCleaner, setSelectedPlatformCleaner] = useState(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('email');
  const [sendingInvites, setSendingInvites] = useState(false);



  // Fetch platform cleaners when component mounts
  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      fetchPlatformCleaners(property.latitude, property.longitude);
    }
  }, [property]);



  const fetchPlatformCleaners = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await userService.getPlatformCleaners({
        latitude: lat,
        longitude: lng,
        radius: 100
      });
      console.log("Recommended cleaners raw data:", res.data);
      
      // Normalize the data to ensure consistent field names
      const normalizedCleaners = (res.data || []).map(cleaner => ({
        ...cleaner,
        id: cleaner._id || cleaner.id,
        _id: cleaner._id || cleaner.id,
        firstname: cleaner.firstname || cleaner.first_name || cleaner.name?.split(' ')[0] || 'Cleaner',
        lastname: cleaner.lastname || cleaner.last_name || cleaner.name?.split(' ')[1] || '',
        fullName: cleaner.fullName || `${cleaner.firstname || ''} ${cleaner.lastname || ''}`.trim(),
        email: cleaner.email || 'No email',
        avatar: cleaner.avatar || null,
        rating: cleaner.rating || cleaner.average_rating || 4.5,
        completedJobs: cleaner.completedJobs || cleaner.jobs_completed || 0,
        specialty: cleaner.specialty || cleaner.specialization || 'General Cleaning'
      }));
      
      console.log("Normalized cleaners:", normalizedCleaners);
      setPlatformCleaners(normalizedCleaners);
    } catch (err) {
      console.log('Failed to fetch platform cleaners', err);
    } finally {
      setLoading(false);
    }
  };

  const addPlatformCleaner = (cleaner) => {
    // Make sure we're using the correct ID field
    const cleanerId = cleaner._id || cleaner.id;
    
    if (!cleanerId) {
      console.error('Platform cleaner has no ID:', cleaner);
      Alert.alert('Error', 'Invalid cleaner data');
      return;
    }
    
    if (!preferredCleaners.some(c => c.id === cleanerId)) {
      setPreferredCleaners([...preferredCleaners, { 
        id: cleanerId,
        type: 'platform',
        firstname: cleaner.firstname,
        lastname: cleaner.lastname,
        email: cleaner.email,
        avatar: cleaner.avatar,
        status: 'pending',
        addedAt: new Date().toISOString()
      }]);
      Alert.alert(
        tSafe('success', 'Success'),
        `${cleaner.firstname} ${cleaner.lastname} ${tSafe('added_to_list', 'added to invitation list')}`
      );
    } else {
      Alert.alert(
        tSafe('info', 'Info'),
        tSafe('cleaner_already_added', 'This cleaner is already in your invitation list')
      );
    }
    setSelectedPlatformCleaner(null);
    setShowPlatformCleaners(false);
  };

  

  const removeCleaner = (id) => {
    Alert.alert(
      tSafe('remove_cleaner', 'Remove Cleaner'),
      tSafe('remove_cleaner_confirmation', 'Are you sure you want to remove this cleaner from the invitation list?'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        { 
          text: tSafe('remove', 'Remove'), 
          style: 'destructive',
          onPress: () => setPreferredCleaners(preferredCleaners.filter(c => c.id !== id))
        }
      ]
    );
  };

  const addInvitedCleaner = () => {
    if (!inviteEmail && !invitePhone) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('email_or_phone_required', 'Email or phone number is required')
      );
      return;
    }

    if (inviteEmail && !isValidEmail(inviteEmail)) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('invalid_email', 'Please enter a valid email address')
      );
      return;
    }

    if (invitePhone && !isValidPhone(invitePhone)) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('invalid_phone', 'Please enter a valid phone number (10 digits)')
      );
      return;
    }

    const tempId = uuidv4();
    const newInvitedCleaner = {
        id: tempId,
        type: 'invited',
        email: inviteEmail || null,
        phone: invitePhone ? formatPhoneNumberForStorage(invitePhone) : null, // Store clean phone number
        status: 'pending',
        addedAt: new Date().toISOString()
    };

    setPreferredCleaners([...preferredCleaners, newInvitedCleaner]);
    setInviteEmail('');
    setInvitePhone('');
    setInviteModalVisible(false);
    
    Alert.alert(
      tSafe('success', 'Success'),
      tSafe('cleaner_added_to_list', 'Cleaner has been added to invitation list')
    );
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (input) => {
    const cleaned = ('' + input).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return input;
  };

  const handlePhoneChange = (text) => {
    setInvitePhone(formatPhoneNumber(text));
  };


const formatPhoneNumberForStorage = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Store as 10-digit number for US numbers
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.substring(1); // Remove leading 1
    }
    return cleaned;
  };
  

const sendInvitations = async () => {
    if (preferredCleaners.length === 0) {
      Alert.alert('No Cleaners', 'Please add at least one cleaner to invite');
      return;
    }
  
    setSendingInvites(true);
    try {
      // Build preferred_cleaners array - ONLY include valid cleaners with IDs
      const preferred_cleaners = [];
      
      preferredCleaners.forEach(cleaner => {
        // Skip if no ID
        if (!cleaner.id) {
          console.warn('Skipping cleaner with no ID:', cleaner);
          return;
        }
        
        if (cleaner.type === 'platform') {
          // Platform cleaner - must have an ID
          preferred_cleaners.push({
            id: cleaner.id,
            type: 'platform'
          });
        } else if (cleaner.type === 'invited') {
          // Invited cleaner - add to preferred_cleaners with type 'invited'
          preferred_cleaners.push({
            id: cleaner.id,
            type: 'invited'
          });
        }
      });
      
      // Build invited_cleaners array for additional details (email/phone)
      const invited_cleaners = preferredCleaners
        .filter(c => c.type === 'invited' && (c.email || c.phone) && c.id)
        .map(c => ({
          tempId: c.id,
          email: c.email,
          phone: c.phone
        }));
      
      // If no valid preferred_cleaners, show error
      if (preferred_cleaners.length === 0) {
        Alert.alert('Error', 'No valid cleaners to invite');
        setSendingInvites(false);
        return;
      }
      
      const requestData = {
        property_id: property._id,
        host_id: currentUserId,
        property_name: property.apt_name,
        host_name: `${property.owner_info?.firstname || ''} ${property.owner_info?.lastname || ''}`.trim(),
        host_avatar: property.owner_info?.avatar || null,
        preferred_cleaners: preferred_cleaners,
        invited_cleaners: invited_cleaners
      };
      
      console.log('Sending request:', JSON.stringify(requestData, null, 2));
  
      const response = await userService.sendCleanerInvitations(requestData);
      
      if (response.status === 200) {
        Alert.alert(
          tSafe('invitations_sent', 'Invitations Sent'),
          tSafe('cleaners_notified', `${preferredCleaners.length} cleaner(s) have been invited to your property`),
          [
            {
              text: tSafe('view_property', 'View Property'),
              onPress: () => {
                navigation.replace(ROUTES.host_apt_dashboard, {
                  property: property,
                  refresh: true,
                  timestamp: Date.now()
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        tSafe('error_title', 'Error'),
        error.response?.data?.detail || error.response?.data?.message || tSafe('failed_send_invitations', 'Failed to send invitations. Please try again.')
      );
    } finally {
      setSendingInvites(false);
    }
  };  
  


  const renderCleanerItem = (cleaner, index) => {
    console.log(cleaner);
    const isPlatform = cleaner.type === 'platform';
    
    // Handle display name differently for platform vs invited
    let displayName = '';
    let displayInfo = '';
    
    if (isPlatform) {
      // Platform cleaner has firstname and lastname
      displayName = `${cleaner.firstname || ''} ${cleaner.lastname || ''}`.trim() || 'Platform Cleaner';
      displayInfo = cleaner.email || 'No email provided';
    } else {
      // Invited cleaner has email or phone
      displayName = cleaner.email || cleaner.phone || 'Invited Cleaner';
      displayInfo = cleaner.email ? `📧 ${cleaner.email}` : `📱 ${cleaner.phone}`;
    }
  
    return (
      <Animatable.View 
        key={cleaner.id || index} 
        animation="fadeInUp" 
        delay={index * 100} 
        duration={400}
      >
        <Card style={styles.cleanerCard}>
          <Card.Content style={styles.cleanerCardContent}>
            <View style={styles.cleanerAvatar}>
              {isPlatform && cleaner.avatar ? (
                <Avatar.Image size={50} source={{ uri: cleaner.avatar }} />
              ) : (
                <Avatar.Icon 
                  size={50} 
                  icon={isPlatform ? "account-circle" : "email-outline"} 
                  style={{ backgroundColor: COLORS.primary + '20' }}
                  color={COLORS.primary}
                />
              )}
            </View>
            <View style={styles.cleanerInfo}>
              <Text style={styles.cleanerName}>{displayName}</Text>
              <Text style={styles.cleanerDetail}>{displayInfo}</Text>
              {/* <Chip 
                icon="clock-outline" 
                style={styles.pendingChip}
                textStyle={styles.pendingChipText}
              >
                {tSafe('pending_invite', 'Pending Invite')}
              </Chip> */}
            
            </View>
            <TouchableOpacity 
              onPress={() => removeCleaner(cleaner.id)}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  };

// const renderPlatformCleanerItem = ({ item }) => {
//     // Get the correct ID field (handle both _id and id)
//     const cleanerId = item._id || item.id;
    
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.platformCleanerItem,
//           (selectedPlatformCleaner?._id === cleanerId || selectedPlatformCleaner?.id === cleanerId) && styles.selectedPlatformCleaner
//         ]}
//         onPress={() => setSelectedPlatformCleaner(item)}
//       >
//         <View style={styles.platformCleanerAvatar}>
//           {item.avatar ? (
//             <Avatar.Image size={40} source={{ uri: item.avatar }} />
//           ) : (
//             <Avatar.Icon size={40} icon="account" style={{ backgroundColor: COLORS.primary + '20' }} />
//           )}
//         </View>
//         <View style={styles.platformCleanerInfo}>
//           <Text style={styles.platformCleanerName}>
//             {item.firstname} {item.lastname}
//           </Text>
//           <Text style={styles.platformCleanerDetail}>
//             ⭐ {item.rating || 4.5} • {item.completedJobs || 0} {tSafe('jobs', 'jobs')}
//           </Text>
//           <Text style={styles.platformCleanerSpecialty}>
//             {item.specialty || tSafe('general_cleaning', 'General Cleaning')}
//           </Text>
//         </View>
//         {(selectedPlatformCleaner?._id === cleanerId || selectedPlatformCleaner?.id === cleanerId) && (
//           <View style={styles.selectedIndicator}>
//             <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

const renderPlatformCleanerItem = ({ item }) => {
    // Get the correct ID field (handle both _id and id)
    const cleanerId = item._id || item.id;
    const isSelected = (selectedPlatformCleaner?._id === cleanerId || selectedPlatformCleaner?.id === cleanerId);
    
    return (
      <TouchableOpacity 
        key={cleanerId}
        style={[
          styles.cleanerCard,
          isSelected && styles.selectedCard
        ]}
        onPress={() => setSelectedPlatformCleaner(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon
                  source="account"
                  size={20}
                  color={COLORS.white}
                />
              </View>
            )}
          </View>
  
          <View style={styles.infoContainer}>
            <Text style={styles.cleanerName}>
              {item.firstname} {item.lastname}
            </Text>
            <Text style={styles.cleanerDistance}>
              ⭐ {item.rating || 4.5} • {item.completedJobs || 0} {tSafe('jobs', 'jobs')}
            </Text>
            {item.distance && (
                <Text style={styles.cleanerDistance}>
                {item.distance} {tSafe('miles_away', 'miles away')}
                </Text>
            )}
          </View>
  
          <View style={isSelected ? styles.selectedButton : styles.addButton}>
            <Icon
              source={isSelected ? 'check' : 'plus'}
              size={18}
              color={isSelected ? COLORS.white : COLORS.primary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Property Header Card */}
        <Animatable.View animation="fadeInUp" duration={500} style={styles.propertyCard}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName}>{property?.apt_name}</Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
              <Text style={styles.propertyAddress}>{property?.address}</Text>
            </View>
            <View style={styles.roomStats}>
              <CircleIcon
                iconName="bed-empty"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={bedroomCount}
                roomSize={bedroomSize}
                type={tSafe('bedrooms', 'Bedrooms')}
              />
              <CircleIcon
                iconName="shower-head"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={bathroomCount}
                roomSize={bathroomSize}
                type={tSafe('bathrooms', 'Bathrooms')}
              />
              <CircleIcon
                iconName="silverware-fork-knife"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={kitchen}
                roomSize={kitchenSize}
                type={tSafe('kitchen', 'Kitchen')}
              />
              <CircleIcon
                iconName="seat-legroom-extra"
                buttonSize={26}
                radiusSise={13}
                iconSize={16}
                title={livingroomCount}
                roomSize={livingroomSize}
                type={tSafe('livingroom', 'Livingroom')}
              />
            </View>
          </View>
        </Animatable.View>

        {/* Invite Cleaner Section */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>{tSafe('invite_cleaners', 'Invite Cleaners')}</Text>
          <Text style={styles.sectionSubtitle}>
            {tSafe('invite_cleaners_description', 'Add cleaners to invite them to this property')}
          </Text>

          {/* Add Cleaner Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.addButtonInviteType, styles.inviteButton]}
              onPress={() => {
                setInviteMethod('email');
                setInviteModalVisible(true);
              }}
            >
              <MaterialIcons name="email" size={20} color="white" />
              <Text style={styles.addButtonText}>{tSafe('invite_by_email', 'Invite by Email')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.addButtonInviteType, styles.inviteButton]}
              onPress={() => {
                setInviteMethod('phone');
                setInviteModalVisible(true);
              }}
            >
              <MaterialIcons name="phone" size={20} color="white" />
              <Text style={styles.addButtonText}>{tSafe('invite_by_phone', 'Invite by Phone')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.addButtonInviteType, styles.platformButton]}
              onPress={() => setShowPlatformCleaners(true)}
            >
              <MaterialIcons name="people" size={20} color="white" />
              <Text style={styles.addButtonText}>{tSafe('add_platform_cleaners', 'Add Platform Cleaners')}</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        
        {/* Pending Invites List */}
        {preferredCleaners.length > 0 && (
        <Animatable.View animation="fadeInUp" delay={300} style={styles.cleanersSection}>
            <View style={styles.pendingHeader}>
            <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>
                {tSafe('pending_invites', 'Pending Invites')} ({preferredCleaners.length})
            </Text>
            </View>
            {preferredCleaners.map((cleaner, index) => renderCleanerItem(cleaner, index))}
        </Animatable.View>
        )}

        {/* Benefits Section */}
        {/* Send Invitations Button - Only show when there are preferred cleaners */}
        {preferredCleaners.length > 0 && (
        <Animatable.View animation="fadeInUp" delay={350} style={styles.sendButtonWrapper}>
            <Button
            mode="contained"
            onPress={sendInvitations}
            loading={sendingInvites}
            disabled={sendingInvites}
            style={styles.sendButton}
            labelStyle={styles.sendButtonLabel}
            buttonColor={COLORS.primary}
            >
            {tSafe('send_invitations', 'Send Invitations')} ({preferredCleaners.length})
            </Button>
        </Animatable.View>
        )}

        {/* Benefits Section */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>{tSafe('why_invite_cleaners', 'Why Invite Cleaners?')}</Text>
        <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
            <MaterialIcons name="verified" size={32} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('trusted_professionals', 'Trusted Professionals')}</Text>
            <Text style={styles.benefitText}>
                {tSafe('trusted_professionals_desc', 'Vetted and experienced cleaners')}
            </Text>
            </View>
            <View style={styles.benefitCard}>
            <MaterialIcons name="schedule" size={32} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('flexible_scheduling', 'Flexible Scheduling')}</Text>
            <Text style={styles.benefitText}>
                {tSafe('flexible_scheduling_desc', 'Choose times that work for you')}
            </Text>
            </View>
            <View style={styles.benefitCard}>
            <MaterialIcons name="security" size={32} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('secure_payments', 'Secure Payments')}</Text>
            <Text style={styles.benefitText}>
                {tSafe('secure_payments_desc', 'Safe and transparent transactions')}
            </Text>
            </View>
            <View style={styles.benefitCard}>
            <MaterialIcons name="support-agent" size={32} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('dedicated_support', 'Dedicated Support')}</Text>
            <Text style={styles.benefitText}>
                {tSafe('dedicated_support_desc', '24/7 customer support')}
            </Text>
            </View>
        </View>
        </Animatable.View>

        
      </ScrollView>

      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {inviteMethod === 'email' 
                  ? tSafe('invite_by_email', 'Invite by Email')
                  : tSafe('invite_by_phone', 'Invite by Phone')
                }
              </Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {inviteMethod === 'email' ? (
              <TextInput
                mode="outlined"
                label={tSafe('email_address', 'Email Address')}
                placeholder={tSafe('enter_email', 'Enter email address')}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.modalInput}
              />
            ) : (
              <TextInput
                mode="outlined"
                label={tSafe('phone_number', 'Phone Number')}
                placeholder={tSafe('enter_phone', 'Enter phone number')}
                value={invitePhone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                style={styles.modalInput}
              />
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setInviteModalVisible(false)}
                style={styles.modalCancelButton}
                labelStyle={styles.modalCancelLabel}
              >
                {tSafe('cancel', 'Cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={addInvitedCleaner}
                style={styles.modalInviteButton}
                buttonColor={COLORS.primary}
              >
                {tSafe('add', 'Add')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Platform Cleaners Modal */}
      <Modal
        visible={showPlatformCleaners}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlatformCleaners(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.platformModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{tSafe('platform_cleaners', 'Platform Cleaners')}</Text>
              <TouchableOpacity onPress={() => setShowPlatformCleaners(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : platformCleaners.length > 0 ? (
              <>
                <FlatList
                  data={platformCleaners}
                  renderItem={renderPlatformCleanerItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.platformList}
                  showsVerticalScrollIndicator={false}
                />
                <Button
                  mode="contained"
                  onPress={() => selectedPlatformCleaner && addPlatformCleaner(selectedPlatformCleaner)}
                  disabled={!selectedPlatformCleaner}
                  style={styles.addPlatformButton}
                  buttonColor={COLORS.primary}
                >
                  {tSafe('add_selected_cleaner', 'Add Selected Cleaner')}
                </Button>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>{tSafe('no_cleaners_found', 'No platform cleaners found nearby')}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  propertyHeader: {
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1E2F',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#6C6C80',
    marginLeft: 6,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inviteSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cleanersSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E2F',
    marginLeft: 8,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C6C80',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  addButtonInviteType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
  },
  platformButton: {
    backgroundColor: '#6C63FF',
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cleanerCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#f9f9f9",
  },
  cleanerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cleanerAvatar: {
    marginRight: 12,
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 4,
  },
  cleanerDetail: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 6,
  },
  pendingChip: {
    backgroundColor: '#FFF3E0',
    height: 24,
    alignSelf: 'flex-start',
  },
  pendingChipText: {
    fontSize: 10,
    color: '#FF9800',
  },
  removeButton: {
    padding: 8,
  },
  benefitsSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#F9F9FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E2F',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#6C6C80',
    textAlign: 'center',
    lineHeight: 16,
  },
  sendButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  sendButtonWrapper: {
    marginBottom: 20,
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  platformModalContent: {
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
  },
  modalInput: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  modalCancelLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalInviteButton: {
    flex: 1,
    borderRadius: 12,
  },
  platformList: {
    paddingBottom: 16,
  },
  platformCleanerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9F9FC',
    marginBottom: 8,
  },
  selectedPlatformCleaner: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  platformCleanerAvatar: {
    marginRight: 12,
  },
  platformCleanerInfo: {
    flex: 1,
  },
  platformCleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 2,
  },
  platformCleanerDetail: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 2,
  },
  platformCleanerSpecialty: {
    fontSize: 12,
    color: COLORS.primary,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  addPlatformButton: {
    borderRadius: 12,
    marginTop: 16,
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C6C80',
    marginTop: 16,
    textAlign: 'center',
  },




  cleanerListContainer: {
    height: height * 0.28,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  
  // Card styles
  cleanerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  
  // Card content layout
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  
  // Avatar styles
  avatarContainer: {
    marginRight: 12,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Info container
  infoContainer: {
    flex: 1,
  },
  
  cleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  
  cleanerDistance: {
    fontSize: 13,
    color: COLORS.gray,
  },
  
  cleanerSpecialty: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  
  // Button styles
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty state
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    padding: 16,
    fontStyle: 'italic',
  },
});


