

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



import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';

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
  Dimensions,
} from 'react-native';

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import {
  Button,
  TextInput,
  Icon,
  Avatar,
  Card,
} from 'react-native-paper';

import { v4 as uuidv4 } from 'uuid';
import * as Animatable from 'react-native-animatable';

import { tSafe } from '../../utils/tSafe';
import CircleIcon from '../../components/shared/CircleIcon';

import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';

// Existing shared Freshsweeper theme
import { useTheme } from '../../theme';

const { height } = Dimensions.get('window');

export default function InviteCleaner({ route }) {
  const { property } = route.params;

  const navigation = useNavigation();
  const { currentUserId } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  // Create styles from the currently active shared theme.
  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  // ---------------------------------------------------------
  // Property room details
  // ---------------------------------------------------------

  const getRoomDetail = useCallback(
    (type) =>
      property?.roomDetails?.find(
        (room) => room.type?.toLowerCase() === type.toLowerCase()
      ),
    [property]
  );

  const bedroom = getRoomDetail('Bedroom');
  const bathroom = getRoomDetail('Bathroom');
  const kitchenRoom = getRoomDetail('Kitchen');
  const livingroom = getRoomDetail('Livingroom');

  const bedroomCount = bedroom?.number || 0;
  const bathroomCount = bathroom?.number || 0;
  const kitchen = kitchenRoom?.number || 0;
  const livingroomCount = livingroom?.number || 0;

  const bedroomSize = bedroom?.size || 0;
  const bathroomSize = bathroom?.size || 0;
  const kitchenSize = kitchenRoom?.size || 0;
  const livingroomSize = livingroom?.size || 0;

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------

  const [preferredCleaners, setPreferredCleaners] = useState([]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);

  const [platformCleaners, setPlatformCleaners] = useState([]);
  const [showPlatformCleaners, setShowPlatformCleaners] = useState(false);
  const [selectedPlatformCleaner, setSelectedPlatformCleaner] =
    useState(null);

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('email');

  // ---------------------------------------------------------
  // Fetch platform cleaners
  // ---------------------------------------------------------

  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      fetchPlatformCleaners(property.latitude, property.longitude);
    }
  }, [property?.latitude, property?.longitude]);

  const fetchPlatformCleaners = async (lat, lng) => {
    try {
      setLoading(true);

      const response = await userService.getPlatformCleaners({
        latitude: lat,
        longitude: lng,
        radius: 100,
      });

      const normalizedCleaners = (response.data || []).map((cleaner) => {
        const firstName =
          cleaner.firstname ||
          cleaner.first_name ||
          cleaner.name?.split(' ')[0] ||
          'Cleaner';

        const lastName =
          cleaner.lastname ||
          cleaner.last_name ||
          cleaner.name?.split(' ').slice(1).join(' ') ||
          '';

        return {
          ...cleaner,
          id: cleaner._id || cleaner.id,
          _id: cleaner._id || cleaner.id,
          firstname: firstName,
          lastname: lastName,
          fullName:
            cleaner.fullName ||
            `${firstName} ${lastName}`.trim(),
          email: cleaner.email || 'No email',
          avatar: cleaner.avatar || null,
          rating: cleaner.rating || cleaner.average_rating || 4.5,
          completedJobs:
            cleaner.completedJobs || cleaner.jobs_completed || 0,
          specialty:
            cleaner.specialty ||
            cleaner.specialization ||
            'General Cleaning',
        };
      });

      setPlatformCleaners(normalizedCleaners);
    } catch (error) {
      console.error('Failed to fetch platform cleaners:', error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Add platform cleaner
  // ---------------------------------------------------------

  const addPlatformCleaner = (cleaner) => {
    const cleanerId = cleaner?._id || cleaner?.id;

    if (!cleanerId) {
      Alert.alert('Error', 'Invalid cleaner data');
      return;
    }

    const alreadyAdded = preferredCleaners.some(
      (item) => item.id === cleanerId
    );

    if (alreadyAdded) {
      Alert.alert(
        tSafe('info', 'Info'),
        tSafe(
          'cleaner_already_added',
          'This cleaner is already in your invitation list'
        )
      );

      setSelectedPlatformCleaner(null);
      setShowPlatformCleaners(false);
      return;
    }

    setPreferredCleaners((previous) => [
      ...previous,
      {
        id: cleanerId,
        type: 'platform',
        firstname: cleaner.firstname,
        lastname: cleaner.lastname,
        email: cleaner.email,
        avatar: cleaner.avatar,
        status: 'pending',
        addedAt: new Date().toISOString(),
      },
    ]);

    Alert.alert(
      tSafe('success', 'Success'),
      `${cleaner.firstname} ${cleaner.lastname} ${tSafe(
        'added_to_list',
        'added to invitation list'
      )}`
    );

    setSelectedPlatformCleaner(null);
    setShowPlatformCleaners(false);
  };

  // ---------------------------------------------------------
  // Remove cleaner
  // ---------------------------------------------------------

  const removeCleaner = (id) => {
    Alert.alert(
      tSafe('remove_cleaner', 'Remove Cleaner'),
      tSafe(
        'remove_cleaner_confirmation',
        'Are you sure you want to remove this cleaner from the invitation list?'
      ),
      [
        {
          text: tSafe('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: tSafe('remove', 'Remove'),
          style: 'destructive',
          onPress: () => {
            setPreferredCleaners((previous) =>
              previous.filter((cleaner) => cleaner.id !== id)
            );
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------
  // Email and phone validation
  // ---------------------------------------------------------

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6)}`;
    }

    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(
        4,
        7
      )}-${cleaned.substring(7)}`;
    }

    return input;
  };

  const handlePhoneChange = (text) => {
    setInvitePhone(formatPhoneNumber(text));
  };

  const formatPhoneNumberForStorage = (phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.substring(1);
    }

    return cleaned;
  };

  // ---------------------------------------------------------
  // Add invited cleaner
  // ---------------------------------------------------------

  const addInvitedCleaner = () => {
    const email =
      inviteMethod === 'email' ? inviteEmail.trim() : '';
    const phone =
      inviteMethod === 'phone' ? invitePhone.trim() : '';

    if (!email && !phone) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'email_or_phone_required',
          'Email or phone number is required'
        )
      );
      return;
    }

    if (email && !isValidEmail(email)) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('invalid_email', 'Please enter a valid email address')
      );
      return;
    }

    if (phone && !isValidPhone(phone)) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'invalid_phone',
          'Please enter a valid phone number'
        )
      );
      return;
    }

    const duplicate = preferredCleaners.some(
      (cleaner) =>
        (email &&
          cleaner.email?.toLowerCase() === email.toLowerCase()) ||
        (phone &&
          cleaner.phone === formatPhoneNumberForStorage(phone))
    );

    if (duplicate) {
      Alert.alert(
        tSafe('info', 'Info'),
        'This invitation is already in your list.'
      );
      return;
    }

    const newInvitedCleaner = {
      id: uuidv4(),
      type: 'invited',
      email: email || null,
      phone: phone ? formatPhoneNumberForStorage(phone) : null,
      status: 'pending',
      addedAt: new Date().toISOString(),
    };

    setPreferredCleaners((previous) => [
      ...previous,
      newInvitedCleaner,
    ]);

    setInviteEmail('');
    setInvitePhone('');
    setInviteModalVisible(false);

    Alert.alert(
      tSafe('success', 'Success'),
      tSafe(
        'cleaner_added_to_list',
        'Cleaner has been added to invitation list'
      )
    );
  };

  // ---------------------------------------------------------
  // Send invitations
  // ---------------------------------------------------------

  const sendInvitations = async () => {
    if (preferredCleaners.length === 0) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        'Please add at least one cleaner to invite.'
      );
      return;
    }

    setSendingInvites(true);

    try {
      const preferred_cleaners = preferredCleaners
        .filter((cleaner) => cleaner.id)
        .map((cleaner) => ({
          id: cleaner.id,
          type: cleaner.type,
        }));

      const invited_cleaners = preferredCleaners
        .filter(
          (cleaner) =>
            cleaner.type === 'invited' &&
            (cleaner.email || cleaner.phone) &&
            cleaner.id
        )
        .map((cleaner) => ({
          tempId: cleaner.id,
          email: cleaner.email,
          phone: cleaner.phone,
        }));

      if (preferred_cleaners.length === 0) {
        Alert.alert('Error', 'No valid cleaners to invite.');
        return;
      }

      const requestData = {
        property_id: property._id,
        host_id: currentUserId,
        property_name: property.apt_name,
        host_name: `${property.owner_info?.firstname || ''} ${
          property.owner_info?.lastname || ''
        }`.trim(),
        host_avatar: property.owner_info?.avatar || null,
        preferred_cleaners,
        invited_cleaners,
      };

      const response =
        await userService.sendCleanerInvitations(requestData);

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          tSafe('invitations_sent', 'Invitations Sent'),
          tSafe(
            'cleaners_notified',
            `${preferredCleaners.length} cleaner(s) have been invited to your property`
          ),
          [
            {
              text: tSafe('view_property', 'View Property'),
              onPress: () => {
                navigation.replace(ROUTES.host_apt_dashboard, {
                  property,
                  refresh: true,
                  timestamp: Date.now(),
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          tSafe('error_title', 'Error'),
          'The invitation request could not be completed.'
        );
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      console.error('Error response:', error.response?.data);

      Alert.alert(
        tSafe('error_title', 'Error'),
        error.response?.data?.detail ||
          error.response?.data?.message ||
          tSafe(
            'failed_send_invitations',
            'Failed to send invitations. Please try again.'
          )
      );
    } finally {
      setSendingInvites(false);
    }
  };

  // ---------------------------------------------------------
  // Pending invitation card
  // ---------------------------------------------------------

  const renderCleanerItem = (cleaner, index) => {
    const isPlatform = cleaner.type === 'platform';

    const displayName = isPlatform
      ? `${cleaner.firstname || ''} ${
          cleaner.lastname || ''
        }`.trim() || 'Platform Cleaner'
      : cleaner.email || cleaner.phone || 'Invited Cleaner';

    const displayInfo = isPlatform
      ? cleaner.email || 'No email provided'
      : cleaner.email || cleaner.phone || '';

    return (
      <Animatable.View
        key={cleaner.id || index}
        animation="fadeInUp"
        delay={index * 60}
        duration={350}
      >
        <Card style={styles.pendingCleanerCard} mode="outlined">
          <Card.Content style={styles.pendingCleanerContent}>
            <View style={styles.pendingAvatar}>
              {isPlatform && cleaner.avatar ? (
                <Avatar.Image
                  size={48}
                  source={{ uri: cleaner.avatar }}
                />
              ) : (
                <Avatar.Icon
                  size={48}
                  icon={isPlatform ? 'account' : 'email-outline'}
                  style={styles.avatarIcon}
                  color={theme.icon.active}
                />
              )}
            </View>

            <View style={styles.cleanerInfo}>
              <Text style={styles.cleanerName}>{displayName}</Text>

              <Text style={styles.cleanerDetail}>
                {displayInfo}
              </Text>

              <View style={styles.pendingBadge}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={13}
                  color={theme.status.pending}
                />

                <Text style={styles.pendingBadgeText}>
                  {tSafe('pending_invite', 'Pending invitation')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => removeCleaner(cleaner.id)}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${displayName}`}
            >
              <MaterialIcons
                name="close"
                size={21}
                color={theme.status.error}
              />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  };

  // ---------------------------------------------------------
  // Platform cleaner list item
  // ---------------------------------------------------------

  const renderPlatformCleanerItem = ({ item }) => {
    const cleanerId = item._id || item.id;

    const isSelected =
      selectedPlatformCleaner?._id === cleanerId ||
      selectedPlatformCleaner?.id === cleanerId;

    return (
      <TouchableOpacity
        key={cleanerId}
        style={[
          styles.platformCleanerCard,
          isSelected && styles.selectedPlatformCleanerCard,
        ]}
        onPress={() => setSelectedPlatformCleaner(item)}
        activeOpacity={0.8}
      >
        <View style={styles.platformCardContent}>
          <View style={styles.platformAvatarContainer}>
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={styles.platformAvatar}
              />
            ) : (
              <View style={styles.platformAvatarPlaceholder}>
                <Icon
                  source="account"
                  size={24}
                  color={theme.icon.inverse}
                />
              </View>
            )}
          </View>

          <View style={styles.platformCleanerInfo}>
            <Text style={styles.cleanerName}>
              {item.firstname} {item.lastname}
            </Text>

            <View style={styles.ratingRow}>
              <MaterialCommunityIcons
                name="star"
                size={15}
                color={theme.status.warning}
              />

              <Text style={styles.cleanerDistance}>
                {item.rating || 4.5} · {item.completedJobs || 0}{' '}
                {tSafe('jobs', 'jobs')}
              </Text>
            </View>

            {item.distance != null && (
              <Text style={styles.cleanerDistance}>
                {item.distance} {tSafe('miles_away', 'miles away')}
              </Text>
            )}

            {!!item.specialty && (
              <Text style={styles.specialtyText}>
                {item.specialty}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.selectCleanerButton,
              isSelected && styles.selectedCleanerButton,
            ]}
          >
            <Icon
              source={isSelected ? 'check' : 'plus'}
              size={20}
              color={
                isSelected
                  ? theme.button.primaryText
                  : theme.brand.primary
              }
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ---------------------------------------------------------
  // Main screen
  // ---------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Property details */}

        <Animatable.View
          animation="fadeInUp"
          duration={450}
          style={styles.propertyCard}
        >
          <View style={styles.propertyHeader}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons
                name="home-city-outline"
                size={25}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.propertyTitleContainer}>
              <Text style={styles.propertyName}>
                {property?.apt_name || 'Your Property'}
              </Text>

              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={theme.text.secondary}
                />

                <Text style={styles.propertyAddress}>
                  {property?.address || 'Address not available'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.propertyDivider} />

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
        </Animatable.View>

        {/* Invitation options */}

        <Animatable.View
          animation="fadeInUp"
          delay={100}
          duration={400}
          style={styles.sectionCard}
        >
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons
                name="account-multiple-plus-outline"
                size={22}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>
                {tSafe('invite_cleaners', 'Invite Cleaners')}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {tSafe(
                  'invite_cleaners_description',
                  'Add cleaners to invite them to this property'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.invitationActions}>
            <TouchableOpacity
              style={styles.invitationAction}
              onPress={() => {
                setInviteMethod('email');
                setInviteModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={23}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.actionTitle}>
                {tSafe('invite_by_email', 'Invite by Email')}
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.text.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.invitationAction}
              onPress={() => {
                setInviteMethod('phone');
                setInviteModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={23}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.actionTitle}>
                {tSafe('invite_by_phone', 'Invite by Phone')}
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.text.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.invitationAction}
              onPress={() => {
                setSelectedPlatformCleaner(null);
                setShowPlatformCleaners(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={23}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.actionTitle}>
                {tSafe(
                  'add_platform_cleaners',
                  'Add Platform Cleaners'
                )}
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.text.muted}
              />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Pending invitations */}

        {preferredCleaners.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            delay={150}
            duration={400}
            style={styles.sectionCard}
          >
            <View style={styles.pendingHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons
                  name="account-clock-outline"
                  size={22}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.pendingHeadingText}>
                <Text style={styles.sectionTitle}>
                  {tSafe('pending_invites', 'Pending Invites')}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {preferredCleaners.length}{' '}
                  {preferredCleaners.length === 1
                    ? 'cleaner added'
                    : 'cleaners added'}
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {preferredCleaners.length}
                </Text>
              </View>
            </View>

            <View style={styles.pendingList}>
              {preferredCleaners.map(renderCleanerItem)}
            </View>

            <Button
              mode="contained"
              onPress={sendInvitations}
              loading={sendingInvites}
              disabled={sendingInvites}
              icon="send-outline"
              style={styles.sendButton}
              contentStyle={styles.sendButtonContent}
              labelStyle={styles.sendButtonLabel}
              buttonColor={theme.button.primaryBackground}
              textColor={theme.button.primaryText}
            >
              {tSafe('send_invitations', 'Send Invitations')} (
              {preferredCleaners.length})
            </Button>
          </Animatable.View>
        )}

        {/* Benefits */}

        <Animatable.View
          animation="fadeInUp"
          delay={200}
          duration={400}
          style={styles.sectionCard}
        >
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={22}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>
                {tSafe('why_invite_cleaners', 'Why Invite Cleaners?')}
              </Text>

              <Text style={styles.sectionSubtitle}>
                Reliable cleaning, managed in one place.
              </Text>
            </View>
          </View>

          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialCommunityIcons
                  name="check-decagram-outline"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.benefitTitle}>
                {tSafe(
                  'trusted_professionals',
                  'Trusted Professionals'
                )}
              </Text>

              <Text style={styles.benefitText}>
                {tSafe(
                  'trusted_professionals_desc',
                  'Vetted and experienced cleaners'
                )}
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialCommunityIcons
                  name="calendar-clock-outline"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.benefitTitle}>
                {tSafe(
                  'flexible_scheduling',
                  'Flexible Scheduling'
                )}
              </Text>

              <Text style={styles.benefitText}>
                {tSafe(
                  'flexible_scheduling_desc',
                  'Choose times that work for you'
                )}
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.benefitTitle}>
                {tSafe('secure_payments', 'Secure Payments')}
              </Text>

              <Text style={styles.benefitText}>
                {tSafe(
                  'secure_payments_desc',
                  'Safe and transparent transactions'
                )}
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialCommunityIcons
                  name="headset"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <Text style={styles.benefitTitle}>
                {tSafe('dedicated_support', 'Dedicated Support')}
              </Text>

              <Text style={styles.benefitText}>
                {tSafe(
                  'dedicated_support_desc',
                  '24/7 customer support'
                )}
              </Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>

      {/* --------------------------------------------------- */}
      {/* Invite by email or phone modal                     */}
      {/* --------------------------------------------------- */}

      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name={
                      inviteMethod === 'email'
                        ? 'email-outline'
                        : 'phone-outline'
                    }
                    size={24}
                    color={theme.brand.primary}
                  />
                </View>

                <View style={styles.modalTitleTextContainer}>
                  <Text style={styles.modalTitle}>
                    {inviteMethod === 'email'
                      ? tSafe('invite_by_email', 'Invite by Email')
                      : tSafe('invite_by_phone', 'Invite by Phone')}
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Add a cleaner to your invitation list.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setInviteModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons
                  name="close"
                  size={22}
                  color={theme.icon.default}
                />
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
                autoCorrect={false}
                left={
                  <TextInput.Icon
                    icon="email-outline"
                    color={theme.icon.muted}
                  />
                }
                style={styles.modalInput}
                outlineColor={theme.input.border}
                activeOutlineColor={theme.input.focus}
                textColor={theme.input.text}
                placeholderTextColor={theme.input.placeholder}
                theme={{
                  colors: {
                    onSurfaceVariant: theme.input.placeholder,
                    surface: theme.input.background,
                  },
                }}
              />
            ) : (
              <TextInput
                mode="outlined"
                label={tSafe('phone_number', 'Phone Number')}
                placeholder={tSafe('enter_phone', 'Enter phone number')}
                value={invitePhone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                left={
                  <TextInput.Icon
                    icon="phone-outline"
                    color={theme.icon.muted}
                  />
                }
                style={styles.modalInput}
                outlineColor={theme.input.border}
                activeOutlineColor={theme.input.focus}
                textColor={theme.input.text}
                placeholderTextColor={theme.input.placeholder}
                theme={{
                  colors: {
                    onSurfaceVariant: theme.input.placeholder,
                    surface: theme.input.background,
                  },
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setInviteModalVisible(false)}
                style={styles.modalCancelButton}
                contentStyle={styles.modalButtonContent}
                labelStyle={styles.modalCancelLabel}
                textColor={theme.text.primary}
              >
                {tSafe('cancel', 'Cancel')}
              </Button>

              <Button
                mode="contained"
                onPress={addInvitedCleaner}
                style={styles.modalInviteButton}
                contentStyle={styles.modalButtonContent}
                labelStyle={styles.modalActionLabel}
                buttonColor={theme.button.primaryBackground}
                textColor={theme.button.primaryText}
              >
                {tSafe('add', 'Add Cleaner')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* --------------------------------------------------- */}
      {/* Platform cleaners modal                            */}
      {/* --------------------------------------------------- */}

      <Modal
        visible={showPlatformCleaners}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowPlatformCleaners(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              styles.platformModalContent,
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={25}
                    color={theme.brand.primary}
                  />
                </View>

                <View style={styles.modalTitleTextContainer}>
                  <Text style={styles.modalTitle}>
                    {tSafe('platform_cleaners', 'Platform Cleaners')}
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Select a cleaner to add to your invitation list.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowPlatformCleaners(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons
                  name="close"
                  size={22}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.brand.primary}
                />

                <Text style={styles.loadingText}>
                  Finding cleaners nearby...
                </Text>
              </View>
            ) : platformCleaners.length > 0 ? (
              <>
                <FlatList
                  data={platformCleaners}
                  renderItem={renderPlatformCleanerItem}
                  keyExtractor={(item, index) =>
                    String(item._id || item.id || index)
                  }
                  contentContainerStyle={styles.platformList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />

                <Button
                  mode="contained"
                  onPress={() =>
                    selectedPlatformCleaner &&
                    addPlatformCleaner(selectedPlatformCleaner)
                  }
                  disabled={!selectedPlatformCleaner}
                  style={styles.addPlatformButton}
                  contentStyle={styles.modalButtonContent}
                  buttonColor={theme.button.primaryBackground}
                  textColor={theme.button.primaryText}
                  icon="account-plus-outline"
                >
                  {tSafe(
                    'add_selected_cleaner',
                    'Add Selected Cleaner'
                  )}
                </Button>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons
                    name="account-search-outline"
                    size={42}
                    color={theme.icon.muted}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  {tSafe('no_cleaners_found', 'No Cleaners Found')}
                </Text>

                <Text style={styles.emptyText}>
                  No platform cleaners were found nearby. You can invite
                  someone using their email address or phone number.
                </Text>

                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowPlatformCleaners(false);
                    setInviteMethod('email');
                    setInviteModalVisible(true);
                  }}
                  style={styles.emptyActionButton}
                  textColor={theme.brand.primary}
                >
                  Invite a Cleaner
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// =============================================================
// THEME-AWARE STYLES
// Uses the existing shared LIGHT_THEME / DARK_THEME structure.
// =============================================================

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },

    // Property card

    propertyCard: {
      backgroundColor: theme.card.background,
      borderRadius: 22,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.card.border,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 10,
      elevation: isDark ? 1 : 3,
    },

    propertyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    propertyIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    propertyTitleContainer: {
      flex: 1,
    },

    propertyName: {
      fontSize: 21,
      lineHeight: 27,
      fontWeight: '800',
      color: theme.text.primary,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 5,
    },

    propertyAddress: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      marginLeft: 5,
    },

    propertyDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 17,
    },

    roomStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // General section cards

    sectionCard: {
      backgroundColor: theme.card.background,
      borderRadius: 22,
      padding: 18,
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
      alignItems: 'flex-start',
      marginBottom: 18,
    },

    sectionIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    sectionHeadingText: {
      flex: 1,
      paddingTop: 1,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      lineHeight: 23,
      color: theme.text.primary,
    },

    sectionSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      marginTop: 4,
    },

    // Invitation options

    invitationActions: {
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    invitationAction: {
      minHeight: 65,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    actionIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    actionTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
    },

    // Pending cleaners

    pendingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    pendingHeadingText: {
      flex: 1,
    },

    countBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },

    countBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    pendingList: {
      marginBottom: 8,
    },

    pendingCleanerCard: {
      marginBottom: 10,
      borderRadius: 16,
      backgroundColor: theme.surface.default,
      borderColor: theme.card.border,
      elevation: 0,
    },

    pendingCleanerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 2,
    },

    pendingAvatar: {
      marginRight: 12,
    },

    avatarIcon: {
      backgroundColor: theme.brand.primaryLight,
    },

    cleanerInfo: {
      flex: 1,
      minWidth: 0,
    },

    cleanerName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
      lineHeight: 21,
    },

    cleanerDetail: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
      marginTop: 3,
    },

    pendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.surface.elevated,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginTop: 7,
    },

    pendingBadgeText: {
      color: theme.status.pending,
      fontSize: 11,
      fontWeight: '600',
      marginLeft: 4,
    },

    removeButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4,
      backgroundColor: theme.background.elevated,
    },

    // Send invitations

    sendButton: {
      borderRadius: 13,
      marginTop: 8,
      elevation: 0,
    },

    sendButtonContent: {
      minHeight: 48,
      paddingVertical: 5,
    },

    sendButtonLabel: {
      fontSize: 14,
      fontWeight: '700',
    },

    // Benefits

    benefitsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    benefitCard: {
      width: '48.2%',
      minHeight: 165,
      backgroundColor: theme.surface.elevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
      padding: 13,
      marginBottom: 12,
      alignItems: 'center',
    },

    benefitIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },

    benefitTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 5,
      textAlign: 'center',
    },

    benefitText: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    // Modals

    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
    },

    modalContent: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: theme.surface.default,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border.default,
      maxHeight: '90%',
    },

    platformModalContent: {
      flex: 1,
      maxHeight: height * 0.82,
      marginVertical: 'auto',
    },

    modalHandle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border.strong,
      alignSelf: 'center',
      marginBottom: 18,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22,
    },

    modalTitleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },

    modalIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    modalTitleTextContainer: {
      flex: 1,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text.primary,
    },

    modalSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
      marginTop: 4,
    },

    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalInput: {
      marginBottom: 18,
      backgroundColor: theme.input.background,
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },

    modalCancelButton: {
      flex: 1,
      borderRadius: 12,
      borderColor: theme.border.default,
    },

    modalInviteButton: {
      flex: 1,
      borderRadius: 12,
    },

    modalButtonContent: {
      minHeight: 46,
    },

    modalCancelLabel: {
      fontSize: 13,
      fontWeight: '600',
    },

    modalActionLabel: {
      fontSize: 13,
      fontWeight: '700',
    },

    // Platform cleaner list

    platformList: {
      paddingBottom: 12,
    },

    platformCleanerCard: {
      backgroundColor: theme.card.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
      marginBottom: 10,
      padding: 12,
    },

    selectedPlatformCleanerCard: {
      backgroundColor: theme.surface.selected,
      borderColor: theme.border.focus,
      borderWidth: 1.5,
    },

    platformCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    platformAvatarContainer: {
      marginRight: 12,
    },

    platformAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface.elevated,
    },

    platformAvatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.brand.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    platformCleanerInfo: {
      flex: 1,
      minWidth: 0,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },

    cleanerDistance: {
      fontSize: 12,
      color: theme.text.secondary,
      lineHeight: 18,
    },

    specialtyText: {
      fontSize: 12,
      color: theme.brand.primary,
      marginTop: 3,
    },

    selectCleanerButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.border.default,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },

    selectedCleanerButton: {
      backgroundColor: theme.button.primaryBackground,
      borderColor: theme.button.primaryBackground,
    },

    addPlatformButton: {
      borderRadius: 12,
      marginTop: 10,
    },

    // Loading and empty states

    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 50,
    },

    loadingText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 14,
    },

    emptyContainer: {
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 30,
    },

    emptyIconContainer: {
      width: 82,
      height: 82,
      borderRadius: 26,
      backgroundColor: theme.surface.elevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: 'center',
    },

    emptyText: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 8,
    },

    emptyActionButton: {
      borderRadius: 12,
      marginTop: 20,
      borderColor: theme.brand.primary,
    },
  });