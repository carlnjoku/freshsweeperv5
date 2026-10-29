// import React, {
//   useEffect,
//   useState,
//   useContext,
//   useCallback,
// } from 'react';

// import {
//   SafeAreaView,
//   StyleSheet,
//   StatusBar,
//   ScrollView,
//   Modal,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';

// import { LinearGradient } from 'expo-linear-gradient';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';

// import AvatarUploader from '../../components/shared/AvatarUploader';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';

// import Availability from '../../components/cleaner/Availability';
// import Contact from '../../components/cleaner/Contact';
// import Certification from '../../components/cleaner/Certification';
// import ContactDisplay from './ContactDisplay';
// import CertificationDisplay from './CertificationDisplay';
// import AvailabilityDisplay from './AvailabilityDisplay';
// import AboutMe from '../../components/cleaner/AboutMe';
// import AboutMeDisplay from './AboutMeDisplay';

// import { tSafe } from '../../utils/tSafe';
// import { useTheme } from '../../theme';
// import AppText from '../../ui/AppText';

// export default function Profile() {
//   const { theme, isDark } = useTheme();

//   const {
//     currentUserId,
//     currentUser,
//     logout,
//   } = useContext(AuthContext);

//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [avatar, setUserAvatar] = useState('');
//   const [location, setLocation] = useState('');

//   const [contact, setContact] = useState({
//     address: '',
//     phone: '',
//     email: '',
//   });

//   const [aboutme, setAboutMe] = useState('');
//   const [certification, setCertification] = useState([]);

//   const [openContactModal, setOpenContactModal] = useState(false);
//   const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
//   const [openCertificationModal, setOpenCertificationModal] = useState(false);
//   const [editingCertification, setEditingCertification] = useState(null);
//   const [openAboutMeModal, setOpenAboutModal] = useState(false);

//   const [availability, setAvailability] = useState([]);
//   const [bookedSchedules, setBookedSchedules] = useState([]);

//   const [deleting, setDeleting] = useState(false);

//   // Penalty & Performance state
//   const [penaltyImpacts, setPenaltyImpacts] = useState({
//     reliability: 0,
//     score_penalty: 0,
//   });

//   const [calculatedPerformance, setCalculatedPerformance] = useState(null);

//   const styles = createStyles(theme);

//   useEffect(() => {
//     fetchUser();
//     fetchAvailability();
//   }, []);

//   // Refresh profile whenever the screen comes into focus.
//   useFocusEffect(
//     useCallback(() => {
//       fetchUser();
//       fetchAvailability();
//     }, [])
//   );

//   const fetchUser = async () => {
//     try {
//       const response = await userService.getUser(currentUserId);
//       const res = response.data;

//       setFirstname(res.firstname || '');
//       setLastname(res.lastname || '');
//       setUserAvatar(res.avatar || '');
//       setLocation(res.location || {});

//       setContact({
//         address: res.contact?.address || '',
//         phone: res.phone || '',
//         email: res.email || '',
//       });

//       setAboutMe(res.aboutme || '');
//       setCertification(res.certification || []);

//       // Extract penalty and performance data
//       if (res.effective_penalty_impacts) {
//         setPenaltyImpacts({
//           reliability:
//             res.effective_penalty_impacts.reliability || 0,
//           score_penalty:
//             res.effective_penalty_impacts.score_penalty || 0,
//         });
//       }

//       if (res.calculated_performance) {
//         setCalculatedPerformance(res.calculated_performance);
//       }
//     } catch (error) {
//       console.error('Error fetching user:', error);
//     }
//   };

//   const fetchAvailability = async () => {
//     try {
//       const response =
//         await userService.getCleanerAvailability(currentUserId);

//       const data = response.data.data;

//       const formatted = (data?.availability || []).map((item) => ({
//         day: item.day,
//         slots: (item.slots || []).map((slot) => ({
//           start: slot.start,
//           end: slot.end,
//         })),
//       }));

//       setAvailability(formatted);
//       setBookedSchedules(data?.booked_schedules || []);
//     } catch (err) {
//       console.error('Error fetching availability:', err);

//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe(
//           'failed_load_availability',
//           'Failed to load availability'
//         )
//       );
//     }
//   };

//   const handleAvailabilty = (originalData) => {
//     const availabilityData =
//       originalData?.availability || originalData;

//     if (!Array.isArray(availabilityData)) {
//       console.warn(
//         'Unexpected availability data format',
//         originalData
//       );
//       return;
//     }

//     const formatted = availabilityData.map((item) => ({
//       day: item.day,
//       slots: (item.slots || []).map((slot) => ({
//         start: slot.start,
//         end: slot.end,
//       })),
//     }));

//     setAvailability(formatted);
//   };

//   const getUploadedPhoto = async (photoUri) => {
//     const data = {
//       userId: currentUserId,
//       avatar: photoUri,
//     };

//     try {
//       await userService.updateProfileAvatar(data);
//       setUserAvatar(photoUri);
//     } catch (error) {
//       console.error('Error updating profile avatar:', error);
//     }
//   };

//   // ---------------------------
//   // Contact
//   // ---------------------------

//   const handleOpenContact = () => {
//     setOpenContactModal(true);
//   };

//   const handleCloseContact = () => {
//     setOpenContactModal(false);
//   };

//   const handleUpdateContact = (updatedContact) => {
//     setContact(updatedContact);
//   };

//   // ---------------------------
//   // Availability
//   // ---------------------------

//   const handleOpenAvailability = () => {
//     setOpenAvailabilityModal(true);
//   };

//   const handleCloseAvailability = () => {
//     setOpenAvailabilityModal(false);
//   };

//   // ---------------------------
//   // Certification
//   // ---------------------------

//   const handleOpenCertification = () => {
//     setEditingCertification(null);
//     setOpenCertificationModal(true);
//   };

//   const handleEditCertification = (cert) => {
//     setEditingCertification(cert);
//     setOpenCertificationModal(true);
//   };

//   const handleUpdateCertification = (savedCert) => {
//     setCertification((prev) => {
//       const index = prev.findIndex(
//         (c) => c._id === savedCert._id
//       );

//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index] = savedCert;
//         return updated;
//       }

//       return [...prev, savedCert];
//     });
//   };

//   const handleCloseCertification = () => {
//     setOpenCertificationModal(false);
//     setEditingCertification(null);
//   };

//   // ---------------------------
//   // About Me
//   // ---------------------------

//   const handleOpenAboutMe = () => {
//     setOpenAboutModal(true);
//   };

//   const handleCloseAboutMe = () => {
//     setOpenAboutModal(false);
//   };

//   const handleUpdateAbout = (text) => {
//     setAboutMe(text);
//   };

//   // ---------------------------
//   // Delete Account
//   // ---------------------------

//   const handleDeleteAccount = () => {
//     Alert.alert(
//       tSafe('delete_account_title', 'Delete Account'),
//       tSafe(
//         'delete_account_message',
//         'Are you sure you want to permanently delete your account? This action cannot be undone.'
//       ),
//       [
//         {
//           text: tSafe('cancel', 'Cancel'),
//           style: 'cancel',
//         },
//         {
//           text: tSafe('delete', 'Delete'),
//           style: 'destructive',
//           onPress: confirmDeleteAccount,
//         },
//       ]
//     );
//   };

//   const confirmDeleteAccount = async () => {
//     setDeleting(true);

//     try {
//       await userService.deleteAccount(currentUserId);

//       await logout();

//       Alert.alert(
//         tSafe('account_deleted_title', 'Account Deleted'),
//         tSafe(
//           'account_deleted_message',
//           'Your account has been permanently deleted.'
//         )
//       );
//     } catch (error) {
//       console.error('Delete account error:', error);

//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe(
//           'delete_account_failed',
//           'Failed to delete account. Please try again.'
//         )
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ---------------------------
//   // Penalty Tier
//   // ---------------------------

//   const getPenaltyTier = (reliabilityImpact) => {
//     const absImpact = Math.abs(
//       Number(reliabilityImpact) || 0
//     );

//     if (absImpact >= 20) {
//       return {
//         tier: 'MAXIMUM',
//         color: theme.status.error,
//       };
//     }

//     if (absImpact >= 12) {
//       return {
//         tier: 'SEVERE',
//         color: theme.status.error,
//       };
//     }

//     if (absImpact >= 6) {
//       return {
//         tier: 'MODERATE',
//         color: theme.status.warning,
//       };
//     }

//     if (absImpact >= 3) {
//       return {
//         tier: 'MINOR',
//         color: theme.status.warning,
//       };
//     }

//     return {
//       tier: 'NONE',
//       color: theme.status.success,
//     };
//   };

//   const reliabilityImpact =
//     Number(penaltyImpacts.reliability) || 0;

//   const scorePenalty =
//     Number(penaltyImpacts.score_penalty) || 0;

//   const tierInfo = getPenaltyTier(reliabilityImpact);

//   const hasPenalty =
//     reliabilityImpact < 0 || scorePenalty < 0;

//   // ---------------------------
//   // Penalty Status Card
//   // ---------------------------

//   const renderPenaltyStatus = () => (
//     <View style={styles.penaltyCard}>
//       <View style={styles.penaltyHeader}>
//         <Ionicons
//           name="shield-outline"
//           size={22}
//           color={theme.icon.muted}
//         />

//         <AppText style={styles.penaltyTitle}>
//           {tSafe(
//             'penalty_status',
//             'Penalty Status'
//           )}
//         </AppText>

//         {hasPenalty && (
//           <View
//             style={[
//               styles.penaltyBadge,
//               {
//                 backgroundColor: tierInfo.color,
//               },
//             ]}
//           >
//             <AppText style={styles.penaltyBadgeText}>
//               {tierInfo.tier}
//             </AppText>
//           </View>
//         )}
//       </View>

//       <View style={styles.penaltyRow}>
//         <View style={styles.penaltyItem}>
//           <Feather
//             name="activity"
//             size={18}
//             color={theme.icon.muted}
//           />

//           <AppText style={styles.penaltyLabel}>
//             {tSafe(
//               'reliability_impact',
//               'Reliability'
//             )}
//           </AppText>

//           <AppText
//             style={[
//               styles.penaltyValue,
//               {
//                 color:
//                   reliabilityImpact < 0
//                     ? theme.status.error
//                     : theme.status.success,
//               },
//             ]}
//           >
//             {reliabilityImpact > 0 ? '+' : ''}
//             {reliabilityImpact.toFixed(1)}
//           </AppText>
//         </View>

//         <View style={styles.penaltyDivider} />

//         <View style={styles.penaltyItem}>
//           <Feather
//             name="star"
//             size={18}
//             color={theme.icon.muted}
//           />

//           <AppText style={styles.penaltyLabel}>
//             {tSafe(
//               'score_penalty',
//               'Score Penalty'
//             )}
//           </AppText>

//           <AppText
//             style={[
//               styles.penaltyValue,
//               {
//                 color:
//                   scorePenalty < 0
//                     ? theme.status.error
//                     : theme.status.success,
//               },
//             ]}
//           >
//             {scorePenalty > 0 ? '+' : ''}
//             {scorePenalty.toFixed(1)}
//           </AppText>
//         </View>
//       </View>

//       {hasPenalty && (
//         <View style={styles.penaltyNote}>
//           <Feather
//             name="info"
//             size={14}
//             color={theme.icon.muted}
//           />

//           <AppText style={styles.penaltyNoteText}>
//             {tSafe(
//               'penalty_decay_note',
//               'Penalties gradually reduce over 30 days.'
//             )}
//           </AppText>
//         </View>
//       )}

//       {!hasPenalty && (
//         <View style={styles.penaltyNote}>
//           <Feather
//             name="check-circle"
//             size={14}
//             color={theme.status.success}
//           />

//           <AppText
//             style={[
//               styles.penaltyNoteText,
//               {
//                 color: theme.status.success,
//               },
//             ]}
//           >
//             {tSafe(
//               'no_active_penalties',
//               'No active penalties'
//             )}
//           </AppText>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar
//         barStyle={
//           isDark ? 'light-content' : 'dark-content'
//         }
//         backgroundColor={theme.background.default}
//       />

//       <ScrollView
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <LinearGradient
//           colors={[
//             theme.brand.primary,
//             theme.brand.secondary || theme.brand.primary,
//           ]}
//           style={styles.headerGradient}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.headerContent}>
//             <AppText style={styles.headerTitle}>
//               {tSafe('my_profile', 'My Profile')}
//             </AppText>
//           </View>

//           <View style={styles.avatarSection}>
//             <AvatarUploader
//               userId={currentUserId}
//               default_photo={avatar}
//               image_type="avatar"
//               get_uploaded_photo={getUploadedPhoto}
//             />

//             <AppText style={styles.name}>
//               {currentUser?.firstname || firstname || ''}{' '}
//               {currentUser?.lastname || lastname || ''}
//             </AppText>

//             <AppText style={styles.location}>
//               {currentUser?.location?.city ||
//                 location?.city ||
//                 ''}
//               {currentUser?.location?.city ||
//               location?.city
//                 ? ', '
//                 : ''}
//               {currentUser?.location?.region ||
//                 location?.region ||
//                 ''}
//             </AppText>
//           </View>
//         </LinearGradient>

//         {/* Content Cards */}
//         <View style={styles.cardsContainer}>
//           <ContactDisplay
//             contact={contact}
//             handleOpenContact={handleOpenContact}
//           />

//           <AboutMeDisplay
//             mode="edit"
//             aboutme={aboutme}
//             isOwnProfile={true}
//             onEdit={handleOpenAboutMe}
//           />

//           <AvailabilityDisplay
//             cleanerId={currentUserId}
//             mode="edit"
//             availability={availability}
//             handleOpenAvailability={
//               handleOpenAvailability
//             }
//             bookedSchedules={bookedSchedules}
//           />

//           <CertificationDisplay
//             mode="edit"
//             certification={certification}
//             handleOpenCertification={
//               handleOpenCertification
//             }
//             onEditCertification={
//               handleEditCertification
//             }
//           />

//           {/* Penalty Status */}
//           {renderPenaltyStatus()}

//           {/* Delete Account */}
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={handleDeleteAccount}
//             disabled={deleting}
//             activeOpacity={0.7}
//           >
//             {deleting ? (
//               <ActivityIndicator
//                 color={theme.button.primaryText}
//               />
//             ) : (
//               <AppText
//                 style={styles.deleteButtonText}
//               >
//                 {tSafe(
//                   'delete_account',
//                   'Delete Account'
//                 )}
//               </AppText>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Contact Modal */}
//       <Modal
//         visible={openContactModal}
//         animationType="slide"
//         transparent
//         onRequestClose={handleCloseContact}
//       >
//         <Contact
//           userId={currentUserId}
//           contact={contact}
//           close_modal={handleCloseContact}
//           onUpdate={handleUpdateContact}
//         />
//       </Modal>

//       {/* Availability Modal */}
//       <Modal
//         visible={openAvailabilityModal}
//         animationType="slide"
//         transparent
//         onRequestClose={handleCloseAvailability}
//       >
//         <Availability
//           cleanerId={currentUserId}
//           close_avail_modal={
//             handleCloseAvailability
//           }
//           get_availability={handleAvailabilty}
//         />
//       </Modal>

//       {/* Certification Modal */}
//       <Modal
//         visible={openCertificationModal}
//         animationType="slide"
//         transparent
//         onRequestClose={handleCloseCertification}
//       >
//         <Certification
//           userId={currentUserId}
//           certification={editingCertification}
//           close_modal={
//             handleCloseCertification
//           }
//           onUpdate={handleUpdateCertification}
//         />
//       </Modal>

//       {/* About Me Modal */}
//       <Modal
//         visible={openAboutMeModal}
//         animationType="slide"
//         transparent
//         onRequestClose={handleCloseAboutMe}
//       >
//         <AboutMe
//           userId={currentUserId}
//           aboutme={aboutme}
//           update_aboutme={handleUpdateAbout}
//           close_modal={handleCloseAboutMe}
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const createStyles = (theme) =>
//   StyleSheet.create({
//     safeArea: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     container: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     headerGradient: {
//       paddingTop: 10,
//       paddingBottom: 30,
//       borderBottomLeftRadius: 30,
//       borderBottomRightRadius: 30,
//     },

//     headerContent: {
//       flexDirection: 'row',
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginBottom: 16,
//     },

//     headerTitle: {
//       fontSize: 28,
//       fontWeight: '700',
//       color: theme.text.inverse,
//       letterSpacing: 0.5,
//     },

//     avatarSection: {
//       alignItems: 'center',
//       justifyContent: 'center',
//     },

//     name: {
//       fontSize: 22,
//       fontWeight: '700',
//       color: theme.text.inverse,
//       marginTop: 12,
//       marginBottom: 4,
//     },

//     location: {
//       fontSize: 16,
//       color: theme.hero.mutedForeground,
//     },

//     cardsContainer: {
//       paddingHorizontal: 16,
//       paddingTop: 8,
//       paddingBottom: 30,
//     },

//     // ---------------------------
//     // Penalty Card
//     // ---------------------------

//     penaltyCard: {
//       backgroundColor: theme.card.background,
//       borderRadius: 16,
//       padding: 20,
//       marginTop: 16,
//       marginBottom: 8,
//       borderWidth: 1,
//       borderColor: theme.card.border,
//       shadowColor: theme.shadow?.color || '#000000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: theme.shadow?.opacity || 0.05,
//       shadowRadius: 8,
//       elevation: 2,
//     },

//     penaltyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 16,
//       gap: 10,
//     },

//     penaltyTitle: {
//       flex: 1,
//       fontSize: 16,
//       fontWeight: '600',
//       color: theme.text.primary,
//     },

//     penaltyBadge: {
//       paddingHorizontal: 10,
//       paddingVertical: 4,
//       borderRadius: 20,
//     },

//     penaltyBadgeText: {
//       fontSize: 10,
//       fontWeight: '700',
//       color: theme.text.inverse,
//       letterSpacing: 0.5,
//     },

//     penaltyRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-around',
//       marginBottom: 12,
//     },

//     penaltyItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//     },

//     penaltyLabel: {
//       fontSize: 14,
//       color: theme.text.secondary,
//     },

//     penaltyValue: {
//       fontSize: 16,
//       fontWeight: '600',
//       minWidth: 40,
//       textAlign: 'right',
//     },

//     penaltyDivider: {
//       width: 1,
//       backgroundColor: theme.divider,
//     },

//     penaltyNote: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 6,
//       paddingTop: 8,
//       borderTopWidth: 1,
//       borderTopColor: theme.divider,
//       marginTop: 4,
//     },

//     penaltyNoteText: {
//       fontSize: 12,
//       color: theme.text.muted,
//       fontStyle: 'italic',
//     },

//     // ---------------------------
//     // Delete Account
//     // ---------------------------

//     deleteButton: {
//       backgroundColor: theme.status.error,
//       borderRadius: 12,
//       paddingVertical: 16,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginTop: 16,
//       marginHorizontal: 4,
//       shadowColor: theme.status.error,
//       shadowOffset: {
//         width: 0,
//         height: 4,
//       },
//       shadowOpacity: 0.3,
//       shadowRadius: 6,
//       elevation: 6,
//     },

//     deleteButtonText: {
//       color: theme.text.inverse,
//       fontSize: 16,
//       fontWeight: '600',
//       letterSpacing: 0.5,
//     },
//   });




import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import AvatarUploader from '../../components/shared/AvatarUploader';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';

import Availability from '../../components/cleaner/Availability';
import Contact from '../../components/cleaner/Contact';
import Certification from '../../components/cleaner/Certification';
import ContactDisplay from './ContactDisplay';
import CertificationDisplay from './CertificationDisplay';
import AvailabilityDisplay from './AvailabilityDisplay';
import AboutMe from '../../components/cleaner/AboutMe';
import AboutMeDisplay from './AboutMeDisplay';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

export default function Profile() {
  const { theme, isDark } = useTheme();

  const {
    currentUserId,
    currentUser,
    logout,
  } = useContext(AuthContext);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [avatar, setUserAvatar] = useState('');
  const [location, setLocation] = useState('');

  const [contact, setContact] = useState({
    address: '',
    phone: '',
    email: '',
  });

  const [aboutme, setAboutMe] = useState('');
  const [certification, setCertification] = useState([]);

  const [openContactModal, setOpenContactModal] = useState(false);
  const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
  const [openCertificationModal, setOpenCertificationModal] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [openAboutMeModal, setOpenAboutModal] = useState(false);

  const [availability, setAvailability] = useState([]);
  const [bookedSchedules, setBookedSchedules] = useState([]);

  const [deleting, setDeleting] = useState(false);

  // Penalty and performance state
  const [penaltyImpacts, setPenaltyImpacts] = useState({
    reliability: 0,
    score_penalty: 0,
  });

  const [calculatedPerformance, setCalculatedPerformance] = useState(null);

  const styles = createStyles(theme);

  // ---------------------------
  // Fetch Profile Data
  // ---------------------------

  useEffect(() => {
    fetchUser();
    fetchAvailability();
  }, []);

  // Refresh profile whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchAvailability();
    }, [])
  );

  const fetchUser = async () => {
    try {
      const response = await userService.getUser(currentUserId);
      const res = response.data;

      setFirstname(res.firstname || '');
      setLastname(res.lastname || '');
      setUserAvatar(res.avatar || '');
      setLocation(res.location || {});

      setContact({
        address: res.contact?.address || '',
        phone: res.phone || '',
        email: res.email || '',
      });

      setAboutMe(res.aboutme || '');
      setCertification(res.certification || []);

      if (res.effective_penalty_impacts) {
        setPenaltyImpacts({
          reliability:
            res.effective_penalty_impacts.reliability || 0,
          score_penalty:
            res.effective_penalty_impacts.score_penalty || 0,
        });
      }

      if (res.calculated_performance) {
        setCalculatedPerformance(res.calculated_performance);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response =
        await userService.getCleanerAvailability(currentUserId);

      const data = response.data.data;

      const formatted = (data?.availability || []).map((item) => ({
        day: item.day,
        slots: (item.slots || []).map((slot) => ({
          start: slot.start,
          end: slot.end,
        })),
      }));

      setAvailability(formatted);
      setBookedSchedules(data?.booked_schedules || []);
    } catch (err) {
      console.error('Error fetching availability:', err);

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'failed_load_availability',
          'Failed to load availability'
        )
      );
    }
  };

  // ---------------------------
  // Update Availability
  // ---------------------------

  const handleAvailabilty = (originalData) => {
    const availabilityData =
      originalData?.availability || originalData;

    if (!Array.isArray(availabilityData)) {
      console.warn(
        'Unexpected availability data format',
        originalData
      );
      return;
    }

    const formatted = availabilityData.map((item) => ({
      day: item.day,
      slots: (item.slots || []).map((slot) => ({
        start: slot.start,
        end: slot.end,
      })),
    }));

    setAvailability(formatted);
  };

  // ---------------------------
  // Update Avatar
  // ---------------------------

  const getUploadedPhoto = async (photoUri) => {
    const data = {
      userId: currentUserId,
      avatar: photoUri,
    };

    try {
      await userService.updateProfileAvatar(data);
      setUserAvatar(photoUri);
    } catch (error) {
      console.error('Error updating profile avatar:', error);
    }
  };

  // ---------------------------
  // Contact
  // ---------------------------

  const handleOpenContact = () => {
    setOpenContactModal(true);
  };

  const handleCloseContact = () => {
    setOpenContactModal(false);
  };

  const handleUpdateContact = (updatedContact) => {
    setContact(updatedContact);
  };

  // ---------------------------
  // Availability
  // ---------------------------

  const handleOpenAvailability = () => {
    setOpenAvailabilityModal(true);
  };

  const handleCloseAvailability = () => {
    setOpenAvailabilityModal(false);
  };

  // ---------------------------
  // Certification
  // ---------------------------

  const handleOpenCertification = () => {
    setEditingCertification(null);
    setOpenCertificationModal(true);
  };

  const handleEditCertification = (cert) => {
    setEditingCertification(cert);
    setOpenCertificationModal(true);
  };

  const handleUpdateCertification = (savedCert) => {
    setCertification((prev) => {
      const index = prev.findIndex(
        (c) => c._id === savedCert._id
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = savedCert;
        return updated;
      }

      return [...prev, savedCert];
    });
  };

  const handleCloseCertification = () => {
    setOpenCertificationModal(false);
    setEditingCertification(null);
  };

  // ---------------------------
  // About Me
  // ---------------------------

  const handleOpenAboutMe = () => {
    setOpenAboutModal(true);
  };

  const handleCloseAboutMe = () => {
    setOpenAboutModal(false);
  };

  const handleUpdateAbout = (text) => {
    setAboutMe(text);
  };

  // ---------------------------
  // Delete Account
  // ---------------------------

  const handleDeleteAccount = () => {
    Alert.alert(
      tSafe('delete_account_title', 'Delete Account'),
      tSafe(
        'delete_account_message',
        'Are you sure you want to permanently delete your account? This action cannot be undone.'
      ),
      [
        {
          text: tSafe('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: tSafe('delete', 'Delete'),
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);

    try {
      await userService.deleteAccount(currentUserId);

      await logout();

      Alert.alert(
        tSafe('account_deleted_title', 'Account Deleted'),
        tSafe(
          'account_deleted_message',
          'Your account has been permanently deleted.'
        )
      );
    } catch (error) {
      console.error('Delete account error:', error);

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'delete_account_failed',
          'Failed to delete account. Please try again.'
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------
  // Penalty Tier
  // ---------------------------

  const getPenaltyTier = (reliabilityImpact) => {
    const absImpact = Math.abs(
      Number(reliabilityImpact) || 0
    );

    if (absImpact >= 20) {
      return {
        tier: 'MAXIMUM',
        color: theme.status.error,
      };
    }

    if (absImpact >= 12) {
      return {
        tier: 'SEVERE',
        color: theme.status.error,
      };
    }

    if (absImpact >= 6) {
      return {
        tier: 'MODERATE',
        color: theme.status.warning || '#D97706',
      };
    }

    if (absImpact >= 3) {
      return {
        tier: 'MINOR',
        color: theme.status.warning || '#D97706',
      };
    }

    return {
      tier: 'NONE',
      color: theme.status.success,
    };
  };

  const reliabilityImpact =
    Number(penaltyImpacts.reliability) || 0;

  const scorePenalty =
    Number(penaltyImpacts.score_penalty) || 0;

  const tierInfo = getPenaltyTier(reliabilityImpact);

  const hasPenalty =
    reliabilityImpact < 0 || scorePenalty < 0;

  // ---------------------------
  // Penalty Status Card
  // ---------------------------

  const renderPenaltyStatus = () => (
    <View style={styles.penaltyCard}>
      <View style={styles.penaltyHeader}>
        <Ionicons
          name="shield-outline"
          size={22}
          color={theme.icon.muted}
        />

        <AppText style={styles.penaltyTitle}>
          {tSafe('penalty_status', 'Penalty Status')}
        </AppText>

        {hasPenalty && (
          <View
            style={[
              styles.penaltyBadge,
              {
                backgroundColor: tierInfo.color,
              },
            ]}
          >
            <AppText style={styles.penaltyBadgeText}>
              {tierInfo.tier}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.penaltyRow}>
        <View style={styles.penaltyItem}>
          <Feather
            name="activity"
            size={18}
            color={theme.icon.muted}
          />

          <AppText style={styles.penaltyLabel}>
            {tSafe('reliability_impact', 'Reliability')}
          </AppText>

          <AppText
            style={[
              styles.penaltyValue,
              {
                color:
                  reliabilityImpact < 0
                    ? theme.status.error
                    : theme.status.success,
              },
            ]}
          >
            {reliabilityImpact > 0 ? '+' : ''}
            {reliabilityImpact.toFixed(1)}
          </AppText>
        </View>

        <View style={styles.penaltyDivider} />

        <View style={styles.penaltyItem}>
          <Feather
            name="star"
            size={18}
            color={theme.icon.muted}
          />

          <AppText style={styles.penaltyLabel}>
            {tSafe('score_penalty', 'Score Penalty')}
          </AppText>

          <AppText
            style={[
              styles.penaltyValue,
              {
                color:
                  scorePenalty < 0
                    ? theme.status.error
                    : theme.status.success,
              },
            ]}
          >
            {scorePenalty > 0 ? '+' : ''}
            {scorePenalty.toFixed(1)}
          </AppText>
        </View>
      </View>

      {hasPenalty && (
        <View style={styles.penaltyNote}>
          <Feather
            name="info"
            size={14}
            color={theme.icon.muted}
          />

          <AppText style={styles.penaltyNoteText}>
            {tSafe(
              'penalty_decay_note',
              'Penalties gradually reduce over 30 days.'
            )}
          </AppText>
        </View>
      )}

      {!hasPenalty && (
        <View style={styles.penaltyNote}>
          <Feather
            name="check-circle"
            size={14}
            color={theme.status.success}
          />

          <AppText
            style={[
              styles.penaltyNoteText,
              {
                color: theme.status.success,
              },
            ]}
          >
            {tSafe(
              'no_active_penalties',
              'No active penalties'
            )}
          </AppText>
        </View>
      )}
    </View>
  );

  // ---------------------------
  // Profile Header
  // ---------------------------

  const displayCity =
    currentUser?.location?.city || location?.city || '';

  const displayRegion =
    currentUser?.location?.region || location?.region || '';

  const displayLocation = [displayCity, displayRegion]
    .filter(Boolean)
    .join(', ');

  const displayName = [
    currentUser?.firstname || firstname,
    currentUser?.lastname || lastname,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Header */}
        <LinearGradient
          colors={[
            theme.brand.primary,
            theme.brand.secondary || theme.brand.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative background elements */}
          <View
            pointerEvents="none"
            style={styles.headerDecorationLarge}
          />

          <View
            pointerEvents="none"
            style={styles.headerDecorationSmall}
          />

          {/* Header title */}
          <View style={styles.headerContent}>
            <View style={styles.headerHeading}>
              <AppText style={styles.headerEyebrow}>
                FRESHSWEEPER
              </AppText>

              <AppText style={styles.headerTitle}>
                {tSafe('my_profile', 'My Profile')}
              </AppText>
            </View>

            <View style={styles.headerIconContainer}>
              <Feather
                name="user"
                size={22}
                color={theme.text.inverse}
              />
            </View>
          </View>

          {/* Profile identity */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarFrame}>
              <AvatarUploader
                userId={currentUserId}
                default_photo={avatar}
                image_type="avatar"
                get_uploaded_photo={getUploadedPhoto}
              />
            </View>

            <AppText style={styles.name}>
              {displayName}
            </AppText>

            {displayLocation ? (
              <View style={styles.locationRow}>
                <Feather
                  name="map-pin"
                  size={14}
                  color={theme.hero.mutedForeground}
                />

                <AppText style={styles.location}>
                  {displayLocation}
                </AppText>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* Profile Content Cards */}
        <View style={styles.cardsContainer}>
          <ContactDisplay
            contact={contact}
            handleOpenContact={handleOpenContact}
          />

          <AboutMeDisplay
            mode="edit"
            aboutme={aboutme}
            isOwnProfile={true}
            onEdit={handleOpenAboutMe}
          />

          <AvailabilityDisplay
            cleanerId={currentUserId}
            mode="edit"
            availability={availability}
            handleOpenAvailability={handleOpenAvailability}
            bookedSchedules={bookedSchedules}
          />

          <CertificationDisplay
            mode="edit"
            certification={certification}
            handleOpenCertification={handleOpenCertification}
            onEditCertification={handleEditCertification}
          />

          {/* Penalty Status */}
          {renderPenaltyStatus()}

          {/* Delete Account */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator
                color={theme.button.primaryText}
              />
            ) : (
              <AppText style={styles.deleteButtonText}>
                {tSafe('delete_account', 'Delete Account')}
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <Modal
        visible={openContactModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseContact}
      >
        <Contact
          userId={currentUserId}
          contact={contact}
          close_modal={handleCloseContact}
          onUpdate={handleUpdateContact}
        />
      </Modal>

      {/* Availability Modal */}
      <Modal
        visible={openAvailabilityModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseAvailability}
      >
        <Availability
          cleanerId={currentUserId}
          close_avail_modal={handleCloseAvailability}
          get_availability={handleAvailabilty}
        />
      </Modal>

      {/* Certification Modal */}
      <Modal
        visible={openCertificationModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseCertification}
      >
        <Certification
          userId={currentUserId}
          certification={editingCertification}
          close_modal={handleCloseCertification}
          onUpdate={handleUpdateCertification}
        />
      </Modal>

      {/* About Me Modal */}
      <Modal
        visible={openAboutMeModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseAboutMe}
      >
        <AboutMe
          userId={currentUserId}
          aboutme={aboutme}
          update_aboutme={handleUpdateAbout}
          close_modal={handleCloseAboutMe}
        />
      </Modal>
    </SafeAreaView>
  );
}

// =====================================================
// Styles
// =====================================================

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 10,
    },

    // ---------------------------
    // Profile Hero Header
    // ---------------------------

    headerGradient: {
      position: 'relative',
      overflow: 'hidden',

      paddingTop: 24,
      paddingBottom: 32,
      paddingHorizontal: 24,

      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },

    headerDecorationLarge: {
      position: 'absolute',
      top: -75,
      right: -55,

      width: 230,
      height: 230,
      borderRadius: 115,

      backgroundColor: 'rgba(255,255,255,0.09)',
    },

    headerDecorationSmall: {
      position: 'absolute',
      bottom: 45,
      left: -35,

      width: 110,
      height: 110,
      borderRadius: 55,

      backgroundColor: 'rgba(255,255,255,0.07)',
    },

    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginBottom: 28,
    },

    headerHeading: {
      flex: 1,
    },

    headerEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      color: theme.hero.mutedForeground,
      marginBottom: 5,
    },

    headerTitle: {
      fontSize: 29,
      fontWeight: '800',
      color: theme.text.inverse,
      letterSpacing: -0.5,
      lineHeight: 38,
    },

    headerIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 15,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.20)',

      marginLeft: 12,
    },

    avatarSection: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarFrame: {
      alignItems: 'center',
      justifyContent: 'center',

      padding: 5,
      borderRadius: 100,

      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.65)',
    },

    name: {
      fontSize: 23,
      fontWeight: '800',
      color: theme.text.inverse,

      textAlign: 'center',

      marginTop: 16,
      marginBottom: 8,
      letterSpacing: 0.2,
    },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,

      paddingHorizontal: 14,
      paddingVertical: 7,

      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },

    location: {
      fontSize: 13,
      color: theme.hero.mutedForeground,
      textAlign: 'center',
    },

    // ---------------------------
    // Profile Content
    // ---------------------------

    cardsContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 30,
    },

    // ---------------------------
    // Penalty Card
    // ---------------------------

    penaltyCard: {
      backgroundColor: theme.card.background,
      borderRadius: 16,
      padding: 20,
      marginTop: 16,
      marginBottom: 8,

      borderWidth: 1,
      borderColor: theme.card.border,

      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.shadow?.opacity || 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    penaltyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 10,
    },

    penaltyTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
    },

    penaltyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },

    penaltyBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.text.inverse,
      letterSpacing: 0.5,
    },

    penaltyRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginBottom: 12,
    },

    penaltyItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },

    penaltyLabel: {
      fontSize: 14,
      color: theme.text.secondary,
    },

    penaltyValue: {
      fontSize: 16,
      fontWeight: '600',
      minWidth: 40,
      textAlign: 'right',
    },

    penaltyDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: theme.divider,
      marginHorizontal: 8,
    },

    penaltyNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,

      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      marginTop: 4,
    },

    penaltyNoteText: {
      flex: 1,
      fontSize: 12,
      color: theme.text.muted,
      fontStyle: 'italic',
    },

    // ---------------------------
    // Delete Account
    // ---------------------------

    deleteButton: {
      backgroundColor: theme.status.error,
      borderRadius: 12,
      paddingVertical: 16,

      alignItems: 'center',
      justifyContent: 'center',

      marginTop: 16,
      marginHorizontal: 4,

      shadowColor: theme.status.error,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },

    deleteButtonText: {
      color: theme.text.inverse,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  });