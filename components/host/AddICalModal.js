// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Linking,
//   Image,
//   Switch,
//   Alert,
// } from 'react-native';
// import { Button, TextInput, IconButton, Checkbox, RadioButton, Avatar } from 'react-native-paper';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import { tSafe } from '../../utils/tSafe';

// // Helper function to calculate total tasks
// const calculateTotalTasks = (checklist) => {
//   let totalTasks = 0;
//   if (checklist && checklist.checklist) {
//     Object.values(checklist.checklist).forEach(group => {
//       Object.values(group.details).forEach(room => {
//         if (room.tasks) totalTasks += room.tasks.length;
//       });
//     });
//   }
//   return totalTasks;
// };

// // Platform details with enhanced information
// const PLATFORM_DETAILS = {
//   airbnb: {
//     name: 'Airbnb',
//     icon: require('../../assets/images/airbnb_logo.png'),
//     color: '#FF5A5F',
//     title: 'Sync your Airbnb Calendar',
//     description: 'Connect your Airbnb listing to automatically create cleaning schedules for each checkout',
//     steps: [
//       'Go to your Airbnb hosting dashboard',
//       'Select the listing you want to sync',
//       "Click 'Calendar' in the top menu",
//       "Click 'Availability settings'",
//       "Under 'Calendar sync', click 'Export calendar'",
//       'Copy the iCal link provided',
//     ],
//     image: require('../../assets/images/airbnb_logo.png'),
//     helpLink: 'https://www.airbnb.com/help/article/1353',
//   },
//   booking: {
//     name: 'Booking.com',
//     icon: require('../../assets/images/booking_logo.png'),
//     color: '#003580',
//     title: 'Sync your Booking.com Calendar',
//     description: 'Connect your Booking.com property to automatically schedule cleanings',
//     steps: [
//       'Log in to your Booking.com extranet',
//       "Go to 'Properties' and select your property",
//       "Click 'Rate & Availability' in the left menu",
//       "Select 'Calendar sync'",
//       "Click 'Export calendar'",
//       'Copy the iCal link provided',
//     ],
//     image: require('../../assets/images/booking_logo.png'),
//     helpLink: 'https://partner.booking.com/en-us/help/calendars-synchronization/how-synchronize-calendar',
//   },
//   vrbo: {
//     name: 'Vrbo',
//     icon: require('../../assets/images/vrbo_logo.png'),
//     color: '#00A699',
//     title: 'Sync your Vrbo Calendar',
//     description: 'Connect your Vrbo property to automatically schedule cleanings',
//     steps: [
//       'Log in to your Vrbo account',
//       "Go to 'My Listings'",
//       'Select the listing you want to sync',
//       "Click 'Calendar'",
//       "Click 'Sync calendar'",
//       "Copy the iCal link under 'Export calendar'",
//     ],
//     image: require('../../assets/images/vrbo_logo.png'),
//     helpLink: 'https://help.vrbo.com/articles/How-do-I-export-a-calendar',
//   },
//   other: {
//     name: 'Other Calendar',
//     icon: require('../../assets/images/vrbo_logo.png'),
//     color: '#6200EE',
//     title: 'Sync a Generic Calendar',
//     description: 'Use any calendar service that supports iCal format',
//     steps: [
//       "Look for 'Export calendar' or 'Share calendar' options",
//       'Ensure the link ends with .ics',
//       'Make sure the calendar is publicly accessible',
//       'Copy the full URL including https://',
//     ],
//     image: require('../../assets/images/vrbo_logo.png'),
//     helpLink: null,
//   },
// };

// export default function AddICalModal({
//   visible,
//   onClose,
//   onSave,
//   cleaners,
//   aptId,
//   preselectedPlatform,
//   existingCalendar,
//   checklists,
// }) {
//   const navigation = useNavigation();
//   const [guideVisible, setGuideVisible] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [validationError, setValidationError] = useState('');

//   // State
//   const [calendarUrl, setCalendarUrl] = useState('');
//   const [selectedCleaners, setSelectedCleaners] = useState([]);
//   const [selectedType, setSelectedType] = useState('airbnb');
//   const [enabled, setEnabled] = useState(true);
//   const [selectedChecklistId, setSelectedChecklistId] = useState(null);

//   // Populate state when modal opens
//   useEffect(() => {
//     if (visible) {
//       if (existingCalendar) {
//         setCalendarUrl(existingCalendar.ical_url || existingCalendar.calendar_url || '');
//         setSelectedCleaners(existingCalendar.assigned_cleaners || []);
//         setSelectedType(existingCalendar.platform || preselectedPlatform || 'airbnb');
//         setEnabled(existingCalendar.enabled !== false);

//         // Set checklist ID with proper fallbacks
//         if (existingCalendar.checklist_id) {
//           setSelectedChecklistId(existingCalendar.checklist_id);
//         } else {
//           const defaultChecklist = checklists.find(c => c.default_checklist === true);
//           setSelectedChecklistId(defaultChecklist ? defaultChecklist._id : (checklists.length > 0 ? checklists[0]._id : null));
//         }
//       } else {
//         // Reset to defaults
//         setCalendarUrl('');
//         setSelectedCleaners([]);
//         setSelectedType(preselectedPlatform || 'airbnb');
//         setEnabled(true);
//         const defaultChecklist = checklists.find(c => c.default_checklist === true);
//         setSelectedChecklistId(defaultChecklist ? defaultChecklist._id : (checklists.length > 0 ? checklists[0]._id : null));
//       }
//     }
//   }, [visible, existingCalendar, checklists, preselectedPlatform]);

//   const platform = PLATFORM_DETAILS[selectedType] || PLATFORM_DETAILS.airbnb;
//   const selectedChecklist = checklists.find(c => c._id === selectedChecklistId) || null;

//   const toggleCleaner = (cleanerId) => {
//     setSelectedCleaners(prev =>
//       prev.includes(cleanerId) ? prev.filter(id => id !== cleanerId) : [...prev, cleanerId]
//     );
//   };

//   const handleSave = async () => {
//     if (!calendarUrl) {
//       setValidationError(tSafe('calendar_url_required', 'Please enter a valid calendar URL'));
//       return;
//     }
//     if (!calendarUrl.startsWith('http') || !calendarUrl.includes('.ics')) {
//       setValidationError(tSafe('calendar_url_invalid', 'Please enter a valid calendar URL (should start with https:// and end with .ics)'));
//       return;
//     }
//     setValidationError('');
//     setIsSaving(true);

//     try {
//       const calendarData = {
//         platform: selectedType,
//         ical_url: calendarUrl,
//         last_synced: new Date().toISOString(),
//         status: 'linked',
//         enabled: enabled,
//         assigned_cleaners: selectedCleaners,
//         custom_checklistId: selectedChecklistId,
//         checklist_details: selectedChecklist
//           ? {
//               name: selectedChecklist.checklistName,
//               groups: Object.keys(selectedChecklist.checklist).length,
//             }
//           : null,
//       };

//       await onSave({
//         aptId: aptId,
//         calendar: calendarData,
//         selectedChecklist: selectedChecklist,
//       });

//       onClose();
//     } catch (error) {
//       console.error('Error saving calendar:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('error_save_calendar', 'Failed to save calendar sync'));
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const openGuide = () => setGuideVisible(true);
//   const closeGuide = () => setGuideVisible(false);

//   const changePlatform = (newPlatform) => {
//     setSelectedType(newPlatform);
//     closeGuide();
//   };

//   return (
//     <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
//       <View style={styles.modalContainer}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <IconButton icon="arrow-left" onPress={onClose} color={COLORS.dark} size={24} />
//             <Text style={styles.title}>
//               {existingCalendar
//                 ? tSafe('edit_calendar', 'Edit Calendar')
//                 : tSafe('sync_calendar', 'Sync Calendar')}
//             </Text>
//             <View style={{ width: 48 }} />
//           </View>

//           {!guideVisible ? (
//             <>
//               {/* Platform Selection Card */}
//               <Animatable.View animation="fadeInUp" duration={400} style={styles.platformCard}>
//                 <TouchableOpacity onPress={openGuide} activeOpacity={0.7}>
//                   <View style={styles.platformHeader}>
//                     <Image source={platform.icon} style={styles.platformIcon} />
//                     <View style={styles.platformInfo}>
//                       <Text style={styles.platformName}>{platform.name}</Text>
//                       <Text style={styles.platformDescription}>{platform.description}</Text>
//                     </View>
//                     <MaterialIcons name="info-outline" size={24} color={COLORS.gray} />
//                   </View>
//                 </TouchableOpacity>
//               </Animatable.View>

//               {/* Enable/Disable Switch */}
//               <Animatable.View animation="fadeInUp" delay={100} style={[styles.switchContainer, !enabled && styles.disabledContainer]}>
//                 <View style={styles.switchTextContainer}>
//                   <Text style={styles.switchLabel}>
//                     {enabled ? tSafe('active', 'Active') : tSafe('paused', 'Paused')}
//                   </Text>
//                   <Text style={styles.switchSubtitle}>
//                     {enabled
//                       ? tSafe('auto_schedule_on', 'Cleaning schedules will be automatically created')
//                       : tSafe('auto_schedule_off', 'No schedules will be created for this calendar')}
//                   </Text>
//                 </View>
//                 <Switch
//                   value={enabled}
//                   onValueChange={setEnabled}
//                   trackColor={{ false: COLORS.gray, true: COLORS.primary }}
//                   thumbColor={COLORS.white}
//                 />
//               </Animatable.View>

//               {enabled && (
//                 <>
//                   {/* Calendar URL Input */}
//                   <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
//                     <View style={styles.inputHeader}>
//                       <Text style={styles.sectionTitle}>{tSafe('calendar_url', 'Calendar URL')}</Text>
//                       <TouchableOpacity onPress={openGuide}>
//                         <Text style={styles.helpLink}>{tSafe('where_to_find', 'Where to find it?')}</Text>
//                       </TouchableOpacity>
//                     </View>
//                     <TextInput
//                       mode="outlined"
//                       placeholder={tSafe('paste_calendar_url', 'Paste your calendar URL here')}
//                       outlineColor="#E0E0E0"
//                       activeOutlineColor={COLORS.primary}
//                       value={calendarUrl}
//                       onChangeText={setCalendarUrl}
//                       style={styles.input}
//                       autoCapitalize="none"
//                       autoCorrect={false}
//                       keyboardType="url"
//                       editable={enabled}
//                     />
//                     {validationError && <Text style={styles.errorText}>{validationError}</Text>}
//                   </Animatable.View>

//                   {/* Assign Cleaners */}
//                   <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
//                     <Text style={styles.sectionTitle}>{tSafe('assigned_cleaners_optional', 'Assigned Cleaners (Optional)')}</Text>
//                     <Text style={styles.subtitle}>
//                       {tSafe('assign_cleaners_subtitle', 'Select cleaners to assign to this calendar\'s cleanings')}
//                     </Text>
//                     <View style={styles.cleanerOptions}>
//                       {cleaners.map(cleaner => (
//                         <TouchableOpacity
//                           key={cleaner._id}
//                           style={[
//                             styles.cleanerOption,
//                             selectedCleaners.includes(cleaner._id) && styles.selectedCleaner,
//                           ]}
//                           onPress={() => toggleCleaner(cleaner._id)}
//                         >
//                           <Checkbox.Android
//                             status={selectedCleaners.includes(cleaner._id) ? 'checked' : 'unchecked'}
//                             color={COLORS.primary}
//                             disabled={!enabled}
//                           />
//                           <Avatar.Image
//                             size={30}
//                             source={{ uri: cleaner.avatar || 'https://via.placeholder.com/40' }}
//                             style={styles.cleanerAvatar}
//                           />
//                           <View style={styles.linkedCleaners}> 
//                             <Text style={styles.cleanerName}>
//                               {cleaner.firstname} {cleaner.lastname}
//                             </Text>
//                             <Text style={styles.email}>{cleaner.email}</Text>
//                           </View>
//                         </TouchableOpacity>
//                       ))}
//                       {cleaners.length === 0 && (
//                         <Text style={styles.noCleanersText}>
//                           {tSafe('no_cleaners_available', 'No cleaners available')}
//                         </Text>
//                       )}
//                     </View>
//                   </Animatable.View>

//                   {/* Checklist Selection */}
//                   <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
//                     <Text style={styles.sectionTitle}>{tSafe('cleaning_checklist', 'Cleaning Checklist')}</Text>
//                     <Text style={styles.subtitle}>
//                       {tSafe('select_checklist_subtitle', 'Select the checklist to use for cleanings from this calendar')}
//                     </Text>
//                     {checklists.length === 0 ? (
//                       <View style={styles.noChecklistContainer}>
//                         <Text style={styles.noChecklistText}>
//                           {tSafe('no_checklists_available', 'No checklists available')}
//                         </Text>
//                         <Button
//                           mode="outlined"
//                           onPress={() => {
//                             onClose();
//                             setTimeout(() => {
//                               navigation.navigate(ROUTES.host_create_checklist, {
//                                 propertyId: aptId,
//                                 source: 'property',
//                               });
//                             }, 300);
//                           }}
//                           style={styles.createChecklistButton}
//                         >
//                           {tSafe('create_checklist', 'Create Checklist')}
//                         </Button>
//                       </View>
//                     ) : (
//                       <View style={styles.checklistOptions}>
//                         {checklists.map(checklist => (
//                           <TouchableOpacity
//                             key={checklist._id}
//                             style={[
//                               styles.checklistOption,
//                               selectedChecklistId === checklist._id && styles.selectedChecklist,
//                             ]}
//                             onPress={() => setSelectedChecklistId(checklist._id)}
//                           >
//                             <RadioButton.Android
//                               value={checklist._id}
//                               status={selectedChecklistId === checklist._id ? 'checked' : 'unchecked'}
//                               onPress={() => setSelectedChecklistId(checklist._id)}
//                               color={COLORS.primary}
//                             />
//                             <View style={styles.checklistInfo}>
//                               <Text style={styles.checklistName}>
//                                 {checklist.checklistName}
//                                 {checklist.default_checklist && (
//                                   <Text style={styles.defaultBadge}> {tSafe('default', '(Default)')}</Text>
//                                 )}
//                               </Text>
//                               <Text style={styles.checklistDetails}>
//                                 {Object.keys(checklist.checklist).length} {tSafe('groups', 'group(s)')} · ${checklist.totalFee} · {calculateTotalTasks(checklist)} {tSafe('tasks', 'tasks')}
//                               </Text>
//                             </View>
//                           </TouchableOpacity>
//                         ))}
//                       </View>
//                     )}
//                   </Animatable.View>
//                 </>
//               )}

//               {/* Save Button */}
//               <Animatable.View animation="fadeInUp" delay={500}>
//                 <Button
//                   mode="contained"
//                   onPress={handleSave}
//                   style={[styles.saveButton, !enabled && styles.disabledButton]}
//                   loading={isSaving}
//                   disabled={isSaving}
//                 >
//                   {isSaving ? tSafe('saving', 'Saving...') : enabled ? tSafe('save_and_sync', 'Save & Sync Calendar') : tSafe('save_settings', 'Save Settings')}
//                 </Button>
//               </Animatable.View>
//             </>
//           ) : (
//             <View style={styles.guideContainer}>
//               <IconButton icon="arrow-left" onPress={closeGuide} color={COLORS.dark} size={24} style={styles.backButton} />
//               <View style={styles.guideHeader}>
//                 <Image source={platform.icon} style={styles.guidePlatformIcon} />
//                 <Text style={styles.guideTitle}>{platform.title}</Text>
//               </View>
//               <Image source={platform.image} style={styles.guideImage} resizeMode="contain" />
//               <View style={styles.stepsContainer}>
//                 <Text style={styles.sectionTitle}>{tSafe('how_to_get_calendar_url', 'How to get your calendar URL:')}</Text>
//                 {platform.steps.map((step, index) => (
//                   <View key={index} style={styles.step}>
//                     <View style={styles.stepNumberContainer}>
//                       <Text style={styles.stepNumber}>{index + 1}</Text>
//                     </View>
//                     <Text style={styles.stepText}>{step}</Text>
//                   </View>
//                 ))}
//               </View>
//               <Button
//                 mode="outlined"
//                 onPress={() => Linking.openURL(platform.helpLink)}
//                 style={styles.helpButton}
//                 icon="open-in-new"
//                 textColor={COLORS.primary}
//                 disabled={!platform.helpLink}
//               >
//                 {platform.helpLink ? tSafe('view_official_guide', 'View Official Guide') : tSafe('no_guide_available', 'No Guide Available')}
//               </Button>
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 56,
//     marginBottom: 24,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   platformCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     marginHorizontal: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   platformHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   platformIcon: {
//     width: 44,
//     height: 44,
//     resizeMode: 'contain',
//     marginRight: 16,
//   },
//   platformInfo: {
//     flex: 1,
//   },
//   platformName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   platformDescription: {
//     fontSize: 12,
//     color: COLORS.gray,
//     lineHeight: 16,
//   },
//   switchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#F8F9FC',
//     borderRadius: 16,
//     padding: 16,
//     marginHorizontal: 16,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.primary,
//   },
//   disabledContainer: {
//     borderLeftColor: COLORS.gray,
//     backgroundColor: '#F5F5F5',
//   },
//   switchTextContainer: {
//     flex: 1,
//     marginRight: 16,
//   },
//   switchLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   switchSubtitle: {
//     fontSize: 12,
//     color: COLORS.gray,
//   },
//   section: {
//     marginHorizontal: 16,
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 12,
//   },
//   inputHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   helpLink: {
//     color: COLORS.primary,
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   input: {
//     backgroundColor: '#fff',
//     height: 60,
//     color: COLORS.light_gray
//   },
//   errorText: {
//     color: COLORS.error,
//     marginTop: 8,
//     fontSize: 12,
//   },
//   cleanerOptions: {
//     gap: 12,
//     marginTop: 4,
//   },
//   cleanerOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: '#F8F9FC',
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   selectedCleaner: {
//     borderColor: COLORS.primary,
//     backgroundColor: `${COLORS.primary}10`,
//   },
//   cleanerAvatar: {
//     marginLeft: 8,
//     marginRight: 12,
//   },
//   cleanerName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   noCleanersText: {
//     textAlign: 'center',
//     color: COLORS.gray,
//     fontStyle: 'italic',
//     padding: 16,
//   },
//   checklistOptions: {
//     gap: 12,
//     marginTop: 4,
//   },
//   checklistOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderRadius: 12,
//     backgroundColor: '#F8F9FC',
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   selectedChecklist: {
//     borderColor: COLORS.primary,
//     backgroundColor: `${COLORS.primary}10`,
//   },
//   checklistInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   defaultBadge: {
//     color: COLORS.primary,
//     fontSize: 12,
//     fontWeight: 'normal',
//   },
//   checklistDetails: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   noChecklistContainer: {
//     alignItems: 'center',
//     padding: 24,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//   },
//   noChecklistText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   createChecklistButton: {
//     borderColor: COLORS.primary,
//   },
//   saveButton: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     marginBottom: 30,
//     paddingVertical: 8,
//     backgroundColor: COLORS.primary,
//     borderRadius: 28,
//   },
//   disabledButton: {
//     backgroundColor: COLORS.gray,
//   },
//   guideContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   backButton: {
//     alignSelf: 'flex-start',
//     marginBottom: 8,
//   },
//   guideHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   guidePlatformIcon: {
//     width: 48,
//     height: 48,
//     resizeMode: 'contain',
//     marginRight: 16,
//   },
//   guideTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   guideImage: {
//     width: '100%',
//     height: 180,
//     borderRadius: 12,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   stepsContainer: {
//     gap: 16,
//     marginBottom: 24,
//   },
//   step: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 12,
//   },
//   stepNumberContainer: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stepNumber: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   stepText: {
//     flex: 1,
//     fontSize: 14,
//     lineHeight: 22,
//     color: COLORS.dark,
//   },
//   helpButton: {
//     borderColor: COLORS.primary,
//     marginTop: 8,
//   },
//   linkedCleaners:{
//     flexDirection:'column'
//   },
//   email:{
//     fontSize:13,
//     color:COLORS.gray
//   }
// });





import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Image,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import {
  Button,
  TextInput,
  IconButton,
  Checkbox,
  Avatar,
} from 'react-native-paper';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui';

// --------------------------------------------------
// Checklist helpers
// --------------------------------------------------

const calculateTotalTasks = checklist => {
  let totalTasks = 0;

  if (!checklist?.checklist) {
    return totalTasks;
  }

  Object.values(checklist.checklist).forEach(group => {
    if (!group?.details) return;

    Object.values(group.details).forEach(room => {
      if (Array.isArray(room?.tasks)) {
        totalTasks += room.tasks.length;
      }
    });
  });

  return totalTasks;
};

const calculateChecklistGroups = checklist => {
  if (!checklist?.checklist) return 0;

  return Object.keys(checklist.checklist).length;
};

// --------------------------------------------------
// Platform configuration
// --------------------------------------------------

const PLATFORM_DETAILS = {
  airbnb: {
    name: 'Airbnb',
    icon: require('../../assets/images/airbnb_logo.png'),
    color: '#FF5A5F',
    title: 'Connect your Airbnb calendar',
    description:
      'Automatically prepare cleaning schedules for Airbnb reservations.',
    steps: [
      'Open your Airbnb hosting dashboard.',
      'Select the listing you want to synchronize.',
      'Open the listing calendar.',
      'Find the calendar synchronization settings.',
      'Choose the option to export your calendar.',
      'Copy the exported calendar URL.',
    ],
    helpLink: 'https://www.airbnb.com/help/article/1353',
  },

  booking: {
    name: 'Booking.com',
    icon: require('../../assets/images/booking_logo.png'),
    color: '#003580',
    title: 'Connect your Booking.com calendar',
    description:
      'Keep cleaning schedules aligned with your Booking.com reservations.',
    steps: [
      'Log in to your Booking.com extranet.',
      'Select your property.',
      'Open the calendar or availability settings.',
      'Find the calendar synchronization section.',
      'Choose the option to export your calendar.',
      'Copy the exported calendar URL.',
    ],
    helpLink:
      'https://partner.booking.com/en-us/help/calendars-synchronization/how-synchronize-calendar',
  },

  vrbo: {
    name: 'Vrbo',
    icon: require('../../assets/images/vrbo_logo.png'),
    color: '#15356B',
    title: 'Connect your Vrbo calendar',
    description:
      'Synchronize Vrbo reservations with your cleaning schedule.',
    steps: [
      'Log in to your Vrbo account.',
      'Open your listings.',
      'Select the property you want to synchronize.',
      'Open its calendar.',
      'Find the calendar synchronization settings.',
      'Copy the exported iCal calendar URL.',
    ],
    helpLink:
      'https://help.vrbo.com/articles/How-do-I-export-a-calendar',
  },

  other: {
    name: 'Other Calendar',
    icon: null,
    color: '#4776E6',
    title: 'Connect another calendar',
    description:
      'Connect another booking platform that supports iCal calendar links.',
    steps: [
      'Open your calendar or booking platform.',
      'Look for Export Calendar, Share Calendar, or iCal.',
      'Copy the calendar export URL.',
      'Return to Freshsweeper and paste the URL.',
      'Save the connection to finish.',
    ],
    helpLink: null,
  },
};

const DEFAULT_PLATFORM = 'airbnb';

// --------------------------------------------------
// URL validation
// --------------------------------------------------

const validateCalendarUrl = rawUrl => {
  const value = String(rawUrl || '').trim();

  if (!value) {
    return {
      valid: false,
      message: tSafe(
        'calendar_url_required',
        'Enter your calendar URL to continue.'
      ),
    };
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return {
      valid: false,
      message: tSafe(
        'calendar_url_invalid',
        'Enter a valid calendar URL beginning with https://.'
      ),
    };
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    return {
      valid: false,
      message: tSafe(
        'calendar_url_protocol_invalid',
        'Calendar URLs must use HTTP or HTTPS.'
      ),
    };
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return {
      valid: false,
      message: tSafe(
        'calendar_url_invalid',
        'Enter a valid calendar URL.'
      ),
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      message: tSafe(
        'calendar_url_credentials_invalid',
        'Calendar URLs containing embedded login credentials are not supported.'
      ),
    };
  }

  const path = parsed.pathname.toLowerCase();

  const hasCalendarExtension =
    path.endsWith('.ics') ||
    path.endsWith('.ical');

  const hasCalendarIndicator =
    /(?:^|[?&])(?:ical|ics|calendar|token|key)=/i.test(
      parsed.search
    );

  if (!hasCalendarExtension && !hasCalendarIndicator) {
    return {
      valid: false,
      message: tSafe(
        'calendar_url_extension_invalid',
        'This URL does not appear to be an iCal calendar link. Check the exported URL from your booking platform.'
      ),
    };
  }

  return {
    valid: true,
    value,
    message: '',
  };
};

// ==================================================
// Component
// ==================================================

export default function AddICalModal({
  visible,
  onClose,
  onSave,
  cleaners = [],
  aptId,
  preselectedPlatform,
  existingCalendar,
  checklists = [],
}) {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  // ------------------------------------------------
  // State
  // ------------------------------------------------

  const [guideVisible, setGuideVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [calendarUrl, setCalendarUrl] = useState('');
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [selectedType, setSelectedType] = useState(DEFAULT_PLATFORM);
  const [enabled, setEnabled] = useState(true);
  const [selectedChecklistId, setSelectedChecklistId] = useState(null);

  const [validationError, setValidationError] = useState('');
  const [urlTouched, setUrlTouched] = useState(false);

  // ------------------------------------------------
  // Checklist helpers
  // ------------------------------------------------

  const defaultChecklistId = useMemo(() => {
    const defaultChecklist = checklists.find(
      checklist => checklist.default_checklist === true
    );

    return (
      defaultChecklist?._id ||
      checklists[0]?._id ||
      null
    );
  }, [checklists]);

  const selectedChecklist = useMemo(
    () =>
      checklists.find(
        checklist =>
          String(checklist._id) === String(selectedChecklistId)
      ) || null,
    [checklists, selectedChecklistId]
  );

  // ------------------------------------------------
  // Reset / populate when opened
  // ------------------------------------------------

  useEffect(() => {
    if (!visible) {
      setGuideVisible(false);
      return;
    }

    const existingUrl =
      existingCalendar?.ical_url ||
      existingCalendar?.calendar_url ||
      '';

    setCalendarUrl(existingUrl);

    const assignedCleaners = Array.isArray(
      existingCalendar?.assigned_cleaners
    )
      ? existingCalendar.assigned_cleaners
      : [];

    setSelectedCleaners(assignedCleaners);

    setSelectedType(
      existingCalendar?.platform ||
        preselectedPlatform ||
        DEFAULT_PLATFORM
    );

    setEnabled(existingCalendar?.enabled !== false);

    setSelectedChecklistId(
      existingCalendar?.checklist_id ||
        existingCalendar?.custom_checklistId ||
        defaultChecklistId
    );

    setValidationError('');
    setUrlTouched(false);
    setGuideVisible(false);
    setIsSaving(false);
  }, [
    visible,
    existingCalendar,
    preselectedPlatform,
    defaultChecklistId,
  ]);

  // ------------------------------------------------
  // Derived values
  // ------------------------------------------------

  const platform =
    PLATFORM_DETAILS[selectedType] ||
    PLATFORM_DETAILS[DEFAULT_PLATFORM];

  const isEditing = Boolean(existingCalendar);

  const urlValidation = useMemo(
    () => validateCalendarUrl(calendarUrl),
    [calendarUrl]
  );

  const canSave =
    !isSaving &&
    (!enabled || urlValidation.valid) &&
    Boolean(aptId);

  // ------------------------------------------------
  // Cleaner selection
  // ------------------------------------------------

  const toggleCleaner = useCallback(cleanerId => {
    setSelectedCleaners(previous => {
      const exists = previous.some(
        id => String(id) === String(cleanerId)
      );

      return exists
        ? previous.filter(
            id => String(id) !== String(cleanerId)
          )
        : [...previous, cleanerId];
    });
  }, []);

  const isCleanerSelected = useCallback(
    cleanerId =>
      selectedCleaners.some(
        id => String(id) === String(cleanerId)
      ),
    [selectedCleaners]
  );

  // ------------------------------------------------
  // Platform selection
  // ------------------------------------------------

  const changePlatform = useCallback(platformId => {
    setSelectedType(platformId);
    setGuideVisible(false);
    setValidationError('');
  }, []);

  // ------------------------------------------------
  // Guide
  // ------------------------------------------------

  const openGuide = useCallback(() => {
    setGuideVisible(true);
  }, []);

  const closeGuide = useCallback(() => {
    setGuideVisible(false);
  }, []);

  const openOfficialGuide = useCallback(async () => {
    if (!platform.helpLink) return;

    try {
      const supported = await Linking.canOpenURL(
        platform.helpLink
      );

      if (!supported) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'cannot_open_link',
            'Unable to open the help page.'
          )
        );
        return;
      }

      await Linking.openURL(platform.helpLink);
    } catch (error) {
      console.error('Error opening calendar guide:', error);

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'cannot_open_link',
          'Unable to open the help page.'
        )
      );
    }
  }, [platform.helpLink]);

  // ------------------------------------------------
  // Create checklist navigation
  // ------------------------------------------------

  const handleCreateChecklist = useCallback(() => {
    onClose?.();

    setTimeout(() => {
      navigation.navigate(
        ROUTES.host_create_checklist,
        {
          propertyId: aptId,
          source: 'property',
        }
      );
    }, 250);
  }, [navigation, onClose, aptId]);

  // ------------------------------------------------
  // Save
  // ------------------------------------------------

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    if (!aptId) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'property_id_missing',
          'The property could not be identified. Close this screen and try again.'
        )
      );
      return;
    }

    let normalizedUrl = '';

    if (enabled) {
      const validation = validateCalendarUrl(calendarUrl);

      if (!validation.valid) {
        setValidationError(validation.message);
        setUrlTouched(true);
        return;
      }

      normalizedUrl = validation.value;
    }

    setValidationError('');
    setIsSaving(true);

    try {
      const checklist = selectedChecklist;

      const checklistDetails = checklist
        ? {
            name: checklist.checklistName || '',
            groups: calculateChecklistGroups(checklist),
          }
        : null;

      const calendarData = {
        ...(existingCalendar?._id
          ? { _id: existingCalendar._id }
          : {}),

        platform: selectedType,

        ical_url: enabled
          ? normalizedUrl
          : String(calendarUrl || '').trim(),

        enabled,

        status: enabled ? 'linked' : 'paused',

        assigned_cleaners: selectedCleaners,

        custom_checklistId: selectedChecklistId,

        checklist_details: checklistDetails,
      };

      await onSave?.({
        aptId,
        calendar: calendarData,
        selectedChecklist: checklist,
      });
    } catch (error) {
      console.error('Error saving calendar:', error);

      Alert.alert(
        tSafe('error_title', 'Error'),
        error?.response?.data?.detail ||
          tSafe(
            'error_save_calendar',
            'Unable to save your calendar settings. Please try again.'
          )
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    aptId,
    enabled,
    calendarUrl,
    selectedType,
    selectedCleaners,
    selectedChecklistId,
    selectedChecklist,
    existingCalendar,
    onSave,
  ]);

  // ------------------------------------------------
  // Render platform logo
  // ------------------------------------------------

  const renderPlatformIcon = (
    platformId,
    size = 45
  ) => {
    const item =
      PLATFORM_DETAILS[platformId] ||
      PLATFORM_DETAILS.other;

    if (item.icon) {
      return (
        <Image
          source={item.icon}
          style={{
            width: size,
            height: size,
          }}
          resizeMode="contain"
        />
      );
    }

    return (
      <View
        style={[
          styles.genericPlatformIcon,
          {
            width: size,
            height: size,
            backgroundColor: item.color,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="calendar-sync"
          size={size * 0.53}
          color="#FFFFFF"
        />
      </View>
    );
  };

  // ------------------------------------------------
  // Render platform selector
  // ------------------------------------------------

  const renderPlatformSelector = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeadingRow}>
        <View style={styles.sectionHeadingIcon}>
          <MaterialCommunityIcons
            name="calendar-multiple"
            size={21}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.sectionHeadingContent}>
          <Text style={styles.sectionTitle}>
            {tSafe(
              'choose_booking_platform',
              'Choose a booking platform'
            )}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {tSafe(
              'choose_booking_platform_desc',
              'Select the calendar you want to connect.'
            )}
          </Text>
        </View>
      </View>

      <View style={styles.platformGrid}>
        {Object.entries(PLATFORM_DETAILS).map(
          ([platformId, item]) => {
            const selected = selectedType === platformId;

            return (
              <TouchableOpacity
                key={platformId}
                style={[
                  styles.platformOption,
                  selected && styles.platformOptionSelected,
                ]}
                onPress={() => changePlatform(platformId)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={styles.platformOptionTop}>
                  {renderPlatformIcon(platformId, 39)}

                  <View
                    style={[
                      styles.selectionIndicator,
                      selected &&
                        styles.selectionIndicatorSelected,
                    ]}
                  >
                    {selected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={13}
                        color={theme.button.primaryText}
                      />
                    )}
                  </View>
                </View>

                <Text
                  style={[
                    styles.platformOptionName,
                    selected &&
                      styles.platformOptionNameSelected,
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </View>
  );

  // ------------------------------------------------
  // Render status card
  // ------------------------------------------------

  const renderStatusCard = () => (
    <View
      style={[
        styles.statusCard,
        !enabled && styles.statusCardPaused,
      ]}
    >
      <View
        style={[
          styles.statusIcon,
          !enabled && styles.statusIconPaused,
        ]}
      >
        <MaterialCommunityIcons
          name={enabled ? 'calendar-check' : 'calendar-pause'}
          size={23}
          color={
            enabled
              ? theme.status.success
              : theme.text.secondary
          }
        />
      </View>

      <View style={styles.statusTextContainer}>
        <Text style={styles.statusTitle}>
          {enabled
            ? tSafe(
                'automatic_scheduling_active',
                'Automatic scheduling is on'
              )
            : tSafe(
                'automatic_scheduling_paused',
                'Calendar synchronization is paused'
              )}
        </Text>

        <Text style={styles.statusDescription}>
          {enabled
            ? tSafe(
                'automatic_scheduling_active_desc',
                'Freshsweeper can process reservations from this calendar.'
              )
            : tSafe(
                'automatic_scheduling_paused_desc',
                'This calendar will not be used for automatic scheduling while paused.'
              )}
        </Text>
      </View>

      <Switch
        value={enabled}
        onValueChange={value => {
          setEnabled(value);
          setValidationError('');
        }}
        trackColor={{
          false: theme.border.default,
          true: theme.status.success,
        }}
        thumbColor={theme.button.primaryText}
        accessibilityLabel={tSafe(
          'toggle_calendar_sync',
          'Toggle calendar synchronization'
        )}
      />
    </View>
  );

  // ------------------------------------------------
  // Render URL section
  // ------------------------------------------------

  const renderCalendarUrl = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeadingRow}>
        <View style={styles.sectionHeadingIcon}>
          <MaterialCommunityIcons
            name="link-variant"
            size={21}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.sectionHeadingContent}>
          <Text style={styles.sectionTitle}>
            {tSafe('calendar_url', 'Calendar URL')}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {tSafe(
              'calendar_url_desc',
              'Paste the exported iCal link from your booking platform.'
            )}
          </Text>
        </View>
      </View>

      <View style={styles.urlInputContainer}>
        <TextInput
          mode="outlined"
          label={tSafe(
            'paste_calendar_url',
            'Paste calendar URL'
          )}
          placeholder="https://example.com/calendar.ics"
          value={calendarUrl}
          onChangeText={value => {
            setCalendarUrl(value);

            if (validationError) {
              setValidationError('');
            }
          }}
          onBlur={() => setUrlTouched(true)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          multiline={false}
          editable={enabled && !isSaving}
          error={
            Boolean(validationError) ||
            (urlTouched &&
              Boolean(calendarUrl) &&
              !urlValidation.valid)
          }
          outlineColor={theme.input.border}
          activeOutlineColor={theme.input.focus}
          textColor={theme.input.text}
          placeholderTextColor={theme.input.placeholder}
          style={styles.urlInput}
          left={
            <TextInput.Icon
              icon="link-variant"
              color={theme.icon.muted}
            />
          }
        />

        {(validationError ||
          (urlTouched &&
            calendarUrl &&
            !urlValidation.valid)) && (
          <Text style={styles.errorText}>
            {validationError || urlValidation.message}
          </Text>
        )}

        {urlTouched &&
          calendarUrl &&
          urlValidation.valid && (
            <View style={styles.validUrlRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={theme.status.success}
              />

              <Text style={styles.validUrlText}>
                {tSafe(
                  'calendar_url_looks_valid',
                  'The URL format looks valid.'
                )}
              </Text>
            </View>
          )}

        <TouchableOpacity
          style={styles.helpLinkRow}
          onPress={openGuide}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={17}
            color={theme.brand.primary}
          />

          <Text style={styles.helpLink}>
            {tSafe(
              'where_to_find_calendar_url',
              'Where can I find my calendar URL?'
            )}
          </Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={19}
            color={theme.brand.primary}
          />
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={17}
            color={theme.text.secondary}
          />

          <Text style={styles.securityNoteText}>
            {tSafe(
              'calendar_url_security_note',
              'Calendar links may provide access to reservation details. Only connect URLs from trusted sources.'
            )}
          </Text>
        </View>
      </View>
    </View>
  );

  // ------------------------------------------------
  // Render cleaner assignment
  // ------------------------------------------------

  const renderCleanerSelection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeadingRow}>
        <View style={styles.sectionHeadingIcon}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={21}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.sectionHeadingContent}>
          <Text style={styles.sectionTitle}>
            {tSafe(
              'assign_cleaners',
              'Assign cleaners'
            )}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {tSafe(
              'assign_cleaners_subtitle',
              'Optional: select cleaners associated with this calendar.'
            )}
          </Text>
        </View>

        <View style={styles.optionalBadge}>
          <Text style={styles.optionalBadgeText}>
            {tSafe('optional', 'Optional')}
          </Text>
        </View>
      </View>

      {!enabled && (
        <Text style={styles.disabledSectionNotice}>
          {tSafe(
            'paused_settings_notice',
            'You can still configure these settings while synchronization is paused.'
          )}
        </Text>
      )}

      {cleaners.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-search-outline"
            size={29}
            color={theme.text.secondary}
          />

          <Text style={styles.emptyStateTitle}>
            {tSafe(
              'no_cleaners_available',
              'No cleaners available'
            )}
          </Text>

          <Text style={styles.emptyStateDescription}>
            {tSafe(
              'no_cleaners_available_desc',
              'You can connect a calendar now and assign cleaners later.'
            )}
          </Text>
        </View>
      ) : (
        <View style={styles.optionList}>
          {cleaners.map(cleaner => {
            const cleanerId = cleaner?._id;

            if (!cleanerId) return null;

            const selected = isCleanerSelected(cleanerId);

            const avatarUrl =
              cleaner.avatar ||
              cleaner.avatarUrl ||
              null;

            const cleanerName = [
              cleaner.firstname,
              cleaner.lastname,
            ]
              .filter(Boolean)
              .join(' ') ||
              tSafe('cleaner', 'Cleaner');

            return (
              <TouchableOpacity
                key={cleanerId}
                style={[
                  styles.cleanerOption,
                  selected && styles.cleanerOptionSelected,
                ]}
                onPress={() => toggleCleaner(cleanerId)}
                activeOpacity={0.75}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
              >
                {avatarUrl ? (
                  <Avatar.Image
                    size={43}
                    source={{ uri: avatarUrl }}
                    style={styles.cleanerAvatar}
                  />
                ) : (
                  <Avatar.Text
                    size={43}
                    label={cleanerName
                      .split(' ')
                      .filter(Boolean)
                      .map(part => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                    style={styles.cleanerAvatarFallback}
                    labelStyle={styles.cleanerAvatarLabel}
                  />
                )}

                <View style={styles.cleanerInfo}>
                  <Text
                    style={styles.cleanerName}
                    numberOfLines={1}
                  >
                    {cleanerName}
                  </Text>

                  {!!cleaner.email && (
                    <Text
                      style={styles.cleanerEmail}
                      numberOfLines={1}
                    >
                      {cleaner.email}
                    </Text>
                  )}
                </View>

                <Checkbox.Android
                  status={selected ? 'checked' : 'unchecked'}
                  color={theme.brand.primary}
                  uncheckedColor={theme.border.strong}
                  onPress={() => toggleCleaner(cleanerId)}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedCleaners.length > 0 && (
        <View style={styles.selectionSummary}>
          <MaterialCommunityIcons
            name="check-circle"
            size={17}
            color={theme.status.success}
          />

          <Text style={styles.selectionSummaryText}>
            {selectedCleaners.length}{' '}
            {selectedCleaners.length === 1
              ? tSafe(
                  'cleaner_selected',
                  'cleaner selected'
                )
              : tSafe(
                  'cleaners_selected',
                  'cleaners selected'
                )}
          </Text>

          <TouchableOpacity
            onPress={() => setSelectedCleaners([])}
            activeOpacity={0.7}
          >
            <Text style={styles.clearSelectionText}>
              {tSafe('clear', 'Clear')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ------------------------------------------------
  // Render checklist selection
  // ------------------------------------------------

  const renderChecklistSelection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeadingRow}>
        <View style={styles.sectionHeadingIcon}>
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={21}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.sectionHeadingContent}>
          <Text style={styles.sectionTitle}>
            {tSafe(
              'cleaning_checklist',
              'Cleaning checklist'
            )}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {tSafe(
              'select_checklist_subtitle',
              'Choose the checklist to use for cleaning jobs from this calendar.'
            )}
          </Text>
        </View>
      </View>

      {checklists.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <MaterialCommunityIcons
              name="clipboard-plus-outline"
              size={29}
              color={theme.brand.primary}
            />
          </View>

          <Text style={styles.emptyStateTitle}>
            {tSafe(
              'no_checklists_available',
              'No checklists available'
            )}
          </Text>

          <Text style={styles.emptyStateDescription}>
            {tSafe(
              'create_checklist_first',
              'Create a checklist to define the cleaning tasks for this property.'
            )}
          </Text>

          <Button
            mode="outlined"
            onPress={handleCreateChecklist}
            style={styles.createChecklistButton}
            textColor={theme.brand.primary}
            icon="plus"
          >
            {tSafe(
              'create_checklist',
              'Create checklist'
            )}
          </Button>
        </View>
      ) : (
        <View style={styles.optionList}>
          {checklists.map(checklist => {
            const selected =
              String(selectedChecklistId) ===
              String(checklist._id);

            const groups =
              calculateChecklistGroups(checklist);

            const tasks =
              calculateTotalTasks(checklist);

            return (
              <TouchableOpacity
                key={checklist._id}
                style={[
                  styles.checklistOption,
                  selected &&
                    styles.checklistOptionSelected,
                ]}
                onPress={() =>
                  setSelectedChecklistId(checklist._id)
                }
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.checklistIcon,
                    selected &&
                      styles.checklistIconSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={22}
                    color={
                      selected
                        ? theme.brand.primary
                        : theme.icon.default
                    }
                  />
                </View>

                <View style={styles.checklistInfo}>
                  <View style={styles.checklistNameRow}>
                    <Text
                      style={styles.checklistName}
                      numberOfLines={2}
                    >
                      {checklist.checklistName ||
                        tSafe(
                          'unnamed_checklist',
                          'Unnamed checklist'
                        )}
                    </Text>

                    {checklist.default_checklist && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>
                          {tSafe('default', 'Default')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.checklistMetadata}>
                    <View style={styles.checklistMetaItem}>
                      <MaterialCommunityIcons
                        name="format-list-bulleted"
                        size={14}
                        color={theme.text.secondary}
                      />

                      <Text style={styles.checklistDetails}>
                        {groups}{' '}
                        {tSafe('groups', 'groups')}
                      </Text>
                    </View>

                    <View style={styles.checklistMetaItem}>
                      <MaterialCommunityIcons
                        name="checkbox-marked-outline"
                        size={14}
                        color={theme.text.secondary}
                      />

                      <Text style={styles.checklistDetails}>
                        {tasks}{' '}
                        {tSafe('tasks', 'tasks')}
                      </Text>
                    </View>
                  </View>

                  {checklist.totalFee != null && (
                    <Text style={styles.checklistFee}>
                      ${Number(checklist.totalFee).toFixed(2)}
                    </Text>
                  )}
                </View>

                <MaterialCommunityIcons
                  name={
                    selected
                      ? 'radiobox-marked'
                      : 'radiobox-blank'
                  }
                  size={23}
                  color={
                    selected
                      ? theme.brand.primary
                      : theme.border.strong
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  // ------------------------------------------------
  // Render help guide
  // ------------------------------------------------

  const renderGuide = () => (
    <View style={styles.guideScreen}>
      <View style={styles.guideTopRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={closeGuide}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color={theme.text.primary}
          />
        </TouchableOpacity>

        <Text style={styles.guideTopTitle}>
          {tSafe(
            'connection_guide',
            'Connection guide'
          )}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.guideContent}
      >
        <View style={styles.guideHero}>
          <View
            style={[
              styles.guidePlatformIconContainer,
              { backgroundColor: `${platform.color}15` },
            ]}
          >
            {renderPlatformIcon(selectedType, 54)}
          </View>

          <Text style={styles.guideTitle}>
            {platform.title}
          </Text>

          <Text style={styles.guideDescription}>
            {platform.description}
          </Text>
        </View>

        <View style={styles.guideStepsCard}>
          <Text style={styles.guideSectionTitle}>
            {tSafe(
              'follow_these_steps',
              'Follow these steps'
            )}
          </Text>

          {platform.steps.map((step, index) => (
            <View
              key={`${selectedType}-${index}`}
              style={styles.guideStep}
            >
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.guideStepText}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.guideTip}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={22}
            color={theme.brand.primary}
          />

          <View style={styles.guideTipContent}>
            <Text style={styles.guideTipTitle}>
              {tSafe('helpful_tip', 'Helpful tip')}
            </Text>

            <Text style={styles.guideTipText}>
              {tSafe(
                'calendar_url_tip',
                'Copy the exported calendar URL, not the regular web address of your listing.'
              )}
            </Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={openOfficialGuide}
          disabled={!platform.helpLink}
          icon="open-in-new"
          textColor={theme.brand.primary}
          style={styles.officialGuideButton}
        >
          {platform.helpLink
            ? tSafe(
                'view_official_guide',
                'View official guide'
              )
            : tSafe(
                'no_guide_available',
                'No official guide available'
              )}
        </Button>

        <Button
          mode="contained"
          onPress={closeGuide}
          buttonColor={theme.button.primaryBackground}
          textColor={theme.button.primaryText}
          style={styles.guideDoneButton}
        >
          {tSafe(
            'back_to_connection',
            'Back to connection'
          )}
        </Button>
      </ScrollView>
    </View>
  );

  // ------------------------------------------------
  // Main
  // ------------------------------------------------

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={isSaving ? undefined : onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === 'ios' ? 'padding' : undefined
          }
          keyboardVerticalOffset={0}
        >
          {!guideVisible ? (
            <>
              {/* ----------------------------------
                  Header
              ---------------------------------- */}

              {/* <View style={styles.header}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onClose}
                  disabled={isSaving}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={tSafe(
                    'close',
                    'Close'
                  )}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={23}
                    color={theme.text.primary}
                  />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerEyebrow}>
                    {isEditing
                      ? tSafe(
                          'manage_connection',
                          'MANAGE CONNECTION'
                        )
                      : tSafe(
                          'NEW_CONNECTION',
                          'NEW CONNECTION'
                        )}
                  </Text>

                  <Text style={styles.headerTitle}>
                    {isEditing
                      ? tSafe(
                          'edit_calendar',
                          'Edit calendar'
                        )
                      : tSafe(
                          'connect_calendar',
                          'Connect calendar'
                        )}
                  </Text>
                </View>

                <View style={styles.headerSpacer} />
              </View> */}
              <View style={styles.modalHeader}>
                <View style={styles.headerTextContainer}>
                  <AppText variant="title" style={styles.modalTitle}>
                    {existingCalendar
                      ? tSafe('edit_calendar', 'Edit Calendar')
                      : tSafe('connect_calendar', 'Connect Calendar')}
                  </AppText>

                  <AppText variant="caption" style={styles.modalSubtitle}>
                    {tSafe(
                      'calendar_sync_description',
                      'Sync your property reservations automatically.'
                    )}
                  </AppText>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (!isSaving) {
                      onClose?.();
                    }
                  }}
                  disabled={isSaving}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={tSafe('close', 'Close')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={[
                    styles.closeButton,
                    isSaving && styles.closeButtonDisabled,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={25}
                    color={theme.text.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* ----------------------------------
                  Scrollable content
              ---------------------------------- */}

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Animatable.View
                  animation="fadeInUp"
                  duration={350}
                  style={styles.intro}
                >
                  <Text style={styles.introTitle}>
                    {tSafe(
                      'automate_your_cleaning_schedule',
                      'Automate your cleaning schedule'
                    )}
                  </Text>

                  <Text style={styles.introDescription}>
                    {tSafe(
                      'calendar_connection_intro',
                      'Connect a booking calendar and choose how Freshsweeper should prepare your cleaning jobs.'
                    )}
                  </Text>
                </Animatable.View>

                {renderPlatformSelector()}

                {/* Selected platform summary */}
                <View style={styles.selectedPlatformBanner}>
                  <View
                    style={[
                      styles.selectedPlatformLogo,
                      {
                        backgroundColor: `${platform.color}12`,
                      },
                    ]}
                  >
                    {renderPlatformIcon(selectedType, 39)}
                  </View>

                  <View style={styles.selectedPlatformContent}>
                    <Text style={styles.selectedPlatformLabel}>
                      {tSafe(
                        'selected_platform',
                        'Selected platform'
                      )}
                    </Text>

                    <Text style={styles.selectedPlatformName}>
                      {platform.name}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={openGuide}
                    style={styles.howToButton}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="help-circle-outline"
                      size={18}
                      color={theme.brand.primary}
                    />

                    <Text style={styles.howToButtonText}>
                      {tSafe('help', 'Help')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {renderStatusCard()}

                {enabled && renderCalendarUrl()}

                {renderCleanerSelection()}

                {renderChecklistSelection()}

                {/* Bottom spacing for the fixed footer */}
                <View style={styles.footerSpacer} />
              </ScrollView>

              {/* ----------------------------------
                  Fixed bottom action area
              ---------------------------------- */}

              <View style={styles.footer}>
                <View style={styles.footerStatusRow}>
                  <MaterialCommunityIcons
                    name={
                      enabled
                        ? 'shield-check-outline'
                        : 'pause-circle-outline'
                    }
                    size={17}
                    color={theme.text.secondary}
                  />

                  <Text style={styles.footerStatusText}>
                    {enabled
                      ? tSafe(
                          'ready_to_connect',
                          'Review your settings before saving.'
                        )
                      : tSafe(
                          'save_paused_settings',
                          'Your calendar settings will be saved while paused.'
                        )}
                  </Text>
                </View>

                <View style={styles.footerButtons}>
                  <Button
                    mode="outlined"
                    onPress={onClose}
                    disabled={isSaving}
                    textColor={theme.text.primary}
                    style={styles.cancelButton}
                    contentStyle={styles.footerButtonContent}
                  >
                    {tSafe('cancel', 'Cancel')}
                  </Button>

                  <Button
                    mode="contained"
                    onPress={handleSave}
                    disabled={!canSave}
                    loading={isSaving}
                    buttonColor={theme.button.primaryBackground}
                    textColor={theme.button.primaryText}
                    style={[
                      styles.saveButton,
                      !canSave && styles.saveButtonDisabled,
                    ]}
                    contentStyle={styles.footerButtonContent}
                    icon={
                      isSaving
                        ? undefined
                        : enabled
                          ? 'calendar-check'
                          : 'content-save-outline'
                    }
                  >
                    {isSaving
                      ? tSafe('saving', 'Saving...')
                      : enabled
                        ? tSafe(
                            'save_and_sync',
                            'Save & sync'
                          )
                        : tSafe(
                            'save_settings',
                            'Save settings'
                          )}
                  </Button>
                </View>
              </View>
            </>
          ) : (
            renderGuide()
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ==================================================
// Theme-aware styles
// ==================================================

const createStyles = theme =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    keyboardContainer: {
      flex: 1,
    },

    // Header

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 18,
      minHeight: 100,
      backgroundColor: theme.surface.elevated,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
      marginTop:50
    },
    
    headerTextContainer: {
      flex: 1,
      paddingRight: 16,
      justifyContent: 'center',
    },
    
    modalTitle: {
      fontSize: 21,
      fontWeight: '700',
      color: theme.text.primary,
      lineHeight: 28,
    },
    
    modalSubtitle: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
    },
    
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.default,
      borderWidth: 1,
      borderColor: theme.border.default,
      flexShrink: 0,
      elevation: 2,
    },
    
    closeButtonDisabled: {
      opacity: 0.45,
    },

    // Main content

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 20,
    },

    intro: {
      marginBottom: 23,
    },

    introTitle: {
      fontSize: 24,
      lineHeight: 31,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 8,
    },

    introDescription: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
    },

    // Sections

    section: {
      marginBottom: 24,
    },

    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },

    sectionHeadingIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    sectionHeadingContent: {
      flex: 1,
      minWidth: 0,
    },

    sectionTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 3,
    },

    sectionSubtitle: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
    },

    // Platform selection

    platformGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    platformOption: {
      width: '48.5%',
      minHeight: 111,
      borderWidth: 1.5,
      borderColor: theme.card.border,
      borderRadius: 17,
      backgroundColor: theme.card.background,
      padding: 12,
      marginBottom: 10,
    },

    platformOptionSelected: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.brand.primaryLight,
    },

    platformOptionTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },

    genericPlatformIcon: {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectionIndicator: {
      width: 21,
      height: 21,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: theme.border.strong,
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectionIndicatorSelected: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    platformOptionName: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: theme.text.primary,
    },

    platformOptionNameSelected: {
      color: theme.brand.primary,
    },

    // Selected platform banner

    selectedPlatformBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 13,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
      marginBottom: 15,
    },

    selectedPlatformLogo: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    selectedPlatformContent: {
      flex: 1,
    },

    selectedPlatformLabel: {
      fontSize: 10,
      color: theme.text.secondary,
      marginBottom: 3,
    },

    selectedPlatformName: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text.primary,
    },

    howToButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 11,
      backgroundColor: theme.brand.primaryLight,
    },

    howToButtonText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.brand.primary,
      marginLeft: 4,
    },

    // Status card

    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 17,
      backgroundColor: theme.status.successBackground,
      marginBottom: 25,
    },

    statusCardPaused: {
      backgroundColor: theme.surface.elevated,
    },

    statusIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: theme.card.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    statusIconPaused: {
      backgroundColor: theme.background.elevated,
    },

    statusTextContainer: {
      flex: 1,
      marginRight: 8,
    },

    statusTitle: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 4,
    },

    statusDescription: {
      fontSize: 10,
      lineHeight: 15,
      color: theme.text.secondary,
    },

    // URL input

    urlInputContainer: {
      padding: 13,
      borderRadius: 17,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    urlInput: {
      backgroundColor: theme.input.background,
      minHeight: 56,
      fontSize: 12,
    },

    errorText: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.status.error,
      marginTop: 7,
    },

    validUrlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },

    validUrlText: {
      fontSize: 11,
      color: theme.status.success,
      marginLeft: 6,
    },

    helpLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
    },

    helpLink: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: theme.brand.primary,
      marginLeft: 8,
    },

    securityNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 11,
      borderRadius: 12,
      backgroundColor: theme.surface.elevated,
    },

    securityNoteText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 15,
      color: theme.text.secondary,
      marginLeft: 8,
    },

    // Optional badge

    optionalBadge: {
      backgroundColor: theme.surface.elevated,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 9,
      marginLeft: 5,
    },

    optionalBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.text.secondary,
    },

    disabledSectionNotice: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
      marginBottom: 10,
    },

    // Option lists

    optionList: {
      gap: 10,
    },

    cleanerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
    },

    cleanerOptionSelected: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.brand.primaryLight,
    },

    cleanerAvatar: {
      marginRight: 11,
      backgroundColor: theme.surface.elevated,
    },

    cleanerAvatarFallback: {
      marginRight: 11,
      backgroundColor: theme.brand.primary,
    },

    cleanerAvatarLabel: {
      color: theme.button.primaryText,
      fontSize: 12,
      fontWeight: '800',
    },

    cleanerInfo: {
      flex: 1,
      minWidth: 0,
    },

    cleanerName: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 4,
    },

    cleanerEmail: {
      fontSize: 10,
      color: theme.text.secondary,
    },

    selectionSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 13,
      padding: 11,
      borderRadius: 12,
      backgroundColor: theme.surface.elevated,
    },

    selectionSummaryText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.primary,
      marginLeft: 7,
    },

    clearSelectionText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.brand.primary,
      padding: 4,
    },

    // Checklist

    checklistOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 13,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
    },

    checklistOptionSelected: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.brand.primaryLight,
    },

    checklistIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.surface.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    checklistIconSelected: {
      backgroundColor: theme.card.background,
    },

    checklistInfo: {
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },

    checklistNameRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: 7,
    },

    checklistName: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '800',
      color: theme.text.primary,
      flexShrink: 1,
    },

    defaultBadge: {
      backgroundColor: theme.brand.primaryLight,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginLeft: 5,
      marginTop: 3,
    },

    defaultBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    checklistMetadata: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
    },

    checklistMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    checklistDetails: {
      fontSize: 10,
      color: theme.text.secondary,
      marginLeft: 4,
    },

    checklistFee: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.text.primary,
      marginTop: 7,
    },

    // Empty states

    emptyState: {
      alignItems: 'center',
      padding: 23,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
    },

    emptyStateIcon: {
      width: 51,
      height: 51,
      borderRadius: 16,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    emptyStateTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text.primary,
      textAlign: 'center',
      marginTop: 9,
      marginBottom: 6,
    },

    emptyStateDescription: {
      fontSize: 11,
      lineHeight: 17,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: 13,
    },

    createChecklistButton: {
      borderColor: theme.brand.primary,
      borderRadius: 12,
      marginTop: 4,
    },

    // Footer

    footerSpacer: {
      height: 15,
    },

    footer: {
      paddingHorizontal: 16,
      paddingTop: 11,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
      backgroundColor: theme.surface.default,
    },

    footerStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 11,
    },

    footerStatusText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 15,
      color: theme.text.secondary,
      marginLeft: 7,
    },

    footerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    cancelButton: {
      flex: 0.85,
      borderColor: theme.border.default,
      borderRadius: 14,
    },

    saveButton: {
      flex: 1.4,
      borderRadius: 14,
    },

    saveButtonDisabled: {
      opacity: 0.55,
    },

    footerButtonContent: {
      minHeight: 48,
      paddingHorizontal: 4,
    },

    // Guide

    guideScreen: {
      flex: 1,
      backgroundColor: theme.background.default,
      marginTop:40
    },

    guideTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
    },

    backButton: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 12,
    },

    guideTopTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: theme.text.primary,
    },

    guideContent: {
      padding: 16,
      paddingBottom: 30,
    },

    guideHero: {
      alignItems: 'center',
      paddingVertical: 20,
      marginBottom: 16,
    },

    guidePlatformIconContainer: {
      width: 86,
      height: 86,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },

    guideTitle: {
      fontSize: 22,
      lineHeight: 29,
      fontWeight: '800',
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: 9,
    },

    guideDescription: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    guideStepsCard: {
      backgroundColor: theme.card.background,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: theme.card.border,
      padding: 16,
      marginBottom: 15,
    },

    guideSectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 18,
    },

    guideStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 17,
    },

    guideStepNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    guideStepNumberText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    guideStepText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.primary,
      paddingTop: 4,
    },

    guideTip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 15,
      borderRadius: 16,
      backgroundColor: theme.brand.primaryLight,
      marginBottom: 16,
    },

    guideTipContent: {
      flex: 1,
      marginLeft: 10,
    },

    guideTipTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 5,
    },

    guideTipText: {
      fontSize: 11,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    officialGuideButton: {
      borderColor: theme.brand.primary,
      borderRadius: 13,
      marginBottom: 11,
    },

    guideDoneButton: {
      borderRadius: 13,
    },
  });