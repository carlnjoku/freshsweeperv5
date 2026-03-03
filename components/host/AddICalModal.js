import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { Button, TextInput, IconButton, Checkbox, RadioButton } from 'react-native-paper';
import COLORS from '../../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';

// Helper function to calculate total tasks
const calculateTotalTasks = (checklist) => {
  let totalTasks = 0;
  if (checklist && checklist.checklist) {
    Object.values(checklist.checklist).forEach(group => {
      Object.values(group.details).forEach(room => {
        if (room.tasks) totalTasks += room.tasks.length;
      });
    });
  }
  return totalTasks;
};

// Platform details with enhanced information
const PLATFORM_DETAILS = {
  airbnb: {
    name: "Airbnb",
    icon: require('../../assets/images/airbnb_logo.png'),
    color: '#FF5A5F',
    title: "Sync your Airbnb Calendar",
    description: "Connect your Airbnb listing to automatically create cleaning schedules for each checkout",
    steps: [
      "Go to your Airbnb hosting dashboard",
      "Select the listing you want to sync",
      "Click 'Calendar' in the top menu",
      "Click 'Availability settings'",
      "Under 'Calendar sync', click 'Export calendar'",
      "Copy the iCal link provided"
    ],
    image: require('../../assets/images/airbnb_logo.png'),
    helpLink: "https://www.airbnb.com/help/article/1353"
  },
  booking: {
    name: "Booking.com",
    icon: require('../../assets/images/booking_logo.png'),
    color: '#003580',
    title: "Sync your Booking.com Calendar",
    description: "Connect your Booking.com property to automatically schedule cleanings",
    steps: [
      "Log in to your Booking.com extranet",
      "Go to 'Properties' and select your property",
      "Click 'Rate & Availability' in the left menu",
      "Select 'Calendar sync'",
      "Click 'Export calendar'",
      "Copy the iCal link provided"
    ],
    image: require('../../assets/images/booking_logo.png'),
    helpLink: "https://partner.booking.com/en-us/help/calendars-synchronization/how-synchronize-calendar"
  },
  vrbo: {
    name: "Vrbo",
    icon: require('../../assets/images/airbnb_logo.png'),
    color: '#00A699',
    title: "Sync your Vrbo Calendar",
    description: "Connect your Vrbo property to automatically schedule cleanings",
    steps: [
      "Log in to your Vrbo account",
      "Go to 'My Listings'",
      "Select the listing you want to sync",
      "Click 'Calendar'",
      "Click 'Sync calendar'",
      "Copy the iCal link under 'Export calendar'"
    ],
    image: require('../../assets/images/airbnb_logo.png'),
    helpLink: "https://help.vrbo.com/articles/How-do-I-export-a-calendar"
  },
  other: {
    name: "Other Calendar",
    icon: require('../../assets/images/airbnb_logo.png'),
    color: '#6200EE',
    title: "Sync a Generic Calendar",
    description: "Use any calendar service that supports iCal format",
    steps: [
      "Look for 'Export calendar' or 'Share calendar' options",
      "Ensure the link ends with .ics",
      "Make sure the calendar is publicly accessible",
      "Copy the full URL including https://"
    ],
    image: require('../../assets/images/airbnb_logo.png'),
    helpLink: null
  }
};

export default function AddICalModal({ 
  visible, 
  onClose, 
  onSave, 
  cleaners, 
  aptId,
  preselectedPlatform,
  existingCalendar,
  checklists
}) {

  const navigation = useNavigation()
  const [guideVisible, setGuideVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Initialize state with existing calendar data if available
  const [calendarUrl, setCalendarUrl] = useState(
    existingCalendar?.ical_url || existingCalendar?.calendar_url || ''
  );
  
  const [selectedCleaners, setSelectedCleaners] = useState(
    existingCalendar?.assigned_cleaners || []
  );
  
  const [selectedType, setSelectedType] = useState(
    preselectedPlatform || existingCalendar?.platform || 'airbnb'
  );
  
  const [enabled, setEnabled] = useState(
    existingCalendar ? existingCalendar.enabled : true
  );

  // Find the appropriate checklist to preselect
  const findPreselectedChecklist = () => {
    // If editing and checklist_id exists, use that
    if (existingCalendar && existingCalendar.checklist_id) {
      return existingCalendar.checklist_id;
    }
    
    // If default_checklist exists in any checklist, use that
    const defaultChecklist = checklists.find(c => c.default_checklist === true);
    if (defaultChecklist) {
      return defaultChecklist._id;
    }
    
    // Otherwise, use the first checklist if available
    return checklists.length > 0 ? checklists[0]._id : null;
  };

  const [selectedChecklistId, setSelectedChecklistId] = useState(
    findPreselectedChecklist()
  );

  const getPlatform = (type) => {
    return PLATFORM_DETAILS[type] || PLATFORM_DETAILS.airbnb;
  };

  const platform = getPlatform(selectedType);



  // const platform = PLATFORM_DETAILS[selectedType];
  const selectedChecklist = checklists.find(c => c._id === selectedChecklistId) || null;

  console.log("My seleted checklist", selectedChecklist)
  // Reset form when modal opens/closes
//   useEffect(() => {
//     if (visible) {
//       // Populate fields when modal opens with existing calendar
//       if (existingCalendar) {
//         setCalendarUrl(existingCalendar.ical_url || existingCalendar.calendar_url || '');
//         setSelectedCleaners(existingCalendar.assigned_cleaners || []);
//         setSelectedType(existingCalendar.platform || 'airbnb');
//         setEnabled(existingCalendar.enabled);
//         setSelectedChecklistId(findPreselectedChecklist());
//       }
//     } else {
//       // Reset form when modal closes
//       setCalendarUrl('');
//       setSelectedCleaners([]);
//       setSelectedType(preselectedPlatform || 'airbnb');
//       setValidationError('');
//       setGuideVisible(false);
//       setEnabled(true);
//     }
//   }, [visible, existingCalendar, checklists]);


useEffect(() => {
    if (visible) {
      // Populate fields when modal opens with existing calendar
      if (existingCalendar) {
        setCalendarUrl(existingCalendar.ical_url || existingCalendar.calendar_url || '');
        setSelectedCleaners(existingCalendar.assigned_cleaners || []);
        setSelectedType(existingCalendar.platform || 'airbnb');
        setEnabled(existingCalendar.enabled !== false); // Ensure boolean value
        
        // Set checklist ID with proper fallbacks
        if (existingCalendar.checklist_id) {
          setSelectedChecklistId(existingCalendar.checklist_id);
        } else {
          const defaultChecklist = checklists.find(c => c.default_checklist === true);
          setSelectedChecklistId(defaultChecklist ? defaultChecklist._id : 
                                (checklists.length > 0 ? checklists[0]._id : null));
        }
      } else {
        // Reset to defaults for new calendar
        setCalendarUrl('');
        setSelectedCleaners([]);
        setSelectedType(preselectedPlatform || 'airbnb');
        setEnabled(true);
        
        const defaultChecklist = checklists.find(c => c.default_checklist === true);
        setSelectedChecklistId(defaultChecklist ? defaultChecklist._id : 
                              (checklists.length > 0 ? checklists[0]._id : null));
      }
    }
  }, [visible, existingCalendar, checklists, preselectedPlatform]);

  const toggleCleaner = (cleanerId) => {
    setSelectedCleaners(prev => {
      if (prev.includes(cleanerId)) {
        return prev.filter(id => id !== cleanerId);
      } else {
        return [...prev, cleanerId];
      }
    });
  };

//   const handleSave = async () => {
//     if (!calendarUrl) {
//       setValidationError('Please enter a valid calendar URL');
//       return;
//     }
    
//     if (!calendarUrl.startsWith('http') || !calendarUrl.includes('.ics')) {
//       setValidationError('Please enter a valid calendar URL (should start with https:// and end with .ics)');
//       return;
//     }
    
//     setValidationError('');
//     setIsSaving(true);
    
//     try {
//       const calendarData = {
//         platform: selectedType,
//         ical_url: calendarUrl,
//         last_synced: new Date().toISOString(),
//         status: enabled ? "linked" : "disabled",
//         assigned_cleaners: selectedCleaners,
//         enabled: enabled,
//         checklist_id: selectedChecklistId,
        
//         // Add checklist details for easier access
//         checklist_details: selectedChecklist ? {
//           name: selectedChecklist.checklistName,
//           groups: Object.keys(selectedChecklist.checklist).length
//         } : null
//       };
      
//       await onSave({
//         aptId: aptId,
//         calendar: calendarData,
//         selectedChecklist: selectedChecklist
//       });
      
//       onClose();
//     } catch (error) {
//       console.error('Error saving calendar:', error);
//       Alert.alert('Error', 'Failed to save calendar sync');
//     } finally {
//       setIsSaving(false);
//     }
//   };


const handleSave = async () => {
    if (!calendarUrl) {
      setValidationError('Please enter a valid calendar URL');
      return;
    }
    
    if (!calendarUrl.startsWith('http') || !calendarUrl.includes('.ics')) {
      setValidationError('Please enter a valid calendar URL (should start with https:// and end with .ics)');
      return;
    }
    
    setValidationError('');
    setIsSaving(true);
    
    try {
      const calendarData = {
        platform: selectedType,
        ical_url: calendarUrl,
        last_synced: new Date().toISOString(),
        status: "linked", // Always set to "linked" when saving
        enabled: enabled, // Separate boolean field
        assigned_cleaners: selectedCleaners,
        custom_checklistId: selectedChecklistId,
        
        // Add checklist details for easier access
        checklist_details: selectedChecklist ? {
          name: selectedChecklist.checklistName,
          groups: Object.keys(selectedChecklist.checklist).length
        } : null
      };
      
      console.log(calendarData)
      await onSave({
        aptId: aptId,
        calendar: calendarData,
        selectedChecklist: selectedChecklist
      });

      

      console.log("My submited checklist", selectedChecklist)
      
      onClose();
    } catch (error) {
      console.error('Error saving calendar:', error);
      Alert.alert('Error', 'Failed to save calendar sync');
    } finally {
      setIsSaving(false);
    }
  };

  const openGuide = () => setGuideVisible(true);
  const closeGuide = () => setGuideVisible(false);

  const handleHelpLink = () => {
    if (platform.helpLink) {
      Linking.openURL(platform.helpLink);
    }
  };

  const changePlatform = (newPlatform) => {
    setSelectedType(newPlatform);
    closeGuide();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <IconButton 
            icon="arrow-left" 
            onPress={onClose} 
            color={COLORS.dark}
          />
          <Text style={styles.title}>{existingCalendar ? 'Edit Calendar' : 'Sync Calendar'}</Text>
          <View style={{ width: 48 }} />
        </View>

        {!guideVisible ? (
          <>
            <TouchableOpacity 
              style={[styles.platformCard, { 
                borderLeftColor: platform.color, // Now safe
                opacity: enabled ? 1 : 0.7
              }]}
              onPress={() => setGuideVisible(true)}
            >
              <View style={styles.platformHeader}>
                <Image source={platform.icon} style={styles.platformIcon} />
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Text style={styles.platformDescription}>{platform.description}</Text>
                </View>
                <MaterialIcons 
                  name="info-outline" 
                  size={24} 
                  color={COLORS.gray} 
                />
              </View>
            </TouchableOpacity>

            {/* Enable/Disable Switch */}
            <View style={[styles.switchContainer, !enabled && styles.disabledContainer]}>
              <View>
                <Text style={styles.switchLabel}>
                  {enabled ? 'Calendar Syncing Active' : 'Calendar Syncing Disabled'}
                </Text>
                <Text style={styles.switchSubtitle}>
                  {enabled ? 'Cleaning schedules will be automatically created' : 'No schedules will be created for this calendar'}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {enabled ? (
              <>
                <View style={styles.section}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.sectionTitle}>Calendar URL</Text>
                    <TouchableOpacity onPress={() => setGuideVisible(true)}>
                      <Text style={styles.helpLink}>
                        Where can I find this?
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    mode="outlined"
                    label="Paste your calendar URL here"
                    outlineColor="#D8D8D8"
                    activeOutlineColor={COLORS.primary}
                    value={calendarUrl}
                    onChangeText={setCalendarUrl}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    editable={enabled}
                  />
                  
                  {validationError && (
                    <Text style={styles.errorText}>{validationError}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Assigned Cleaners (Optional)</Text>
                  <Text style={styles.subtitle}>Select cleaners to assign to this calendar's cleanings</Text>
                  <View style={styles.cleanerOptions}>
                    {cleaners.map((cleaner) => (
                      <TouchableOpacity
                        key={cleaner._id}
                        style={[
                          styles.cleanerOption,
                          selectedCleaners.includes(cleaner._id) && styles.selectedCleaner
                        ]}
                        onPress={() => toggleCleaner(cleaner._id)}
                      >
                        <Checkbox.Android
                          status={selectedCleaners.includes(cleaner._id) ? 'checked' : 'unchecked'}
                          color={COLORS.primary}
                          disabled={!enabled}
                        />
                        <Avatar.Image 
                          size={40} 
                          source={{ uri: cleaner.avatarUrl || 'https://via.placeholder.com/40' }} 
                          style={styles.cleanerAvatar}
                        />
                        <Text style={styles.cleanerName}>
                          {cleaner.firstname} {cleaner.lastname}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {cleaners.length === 0 && (
                      <Text style={styles.noCleanersText}>No cleaners available</Text>
                    )}
                  </View>
                </View>

                {/* Checklist Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Cleaning Checklist</Text>
                  <Text style={styles.subtitle}>
                    Select the checklist to use for cleanings from this calendar
                  </Text>
                  
                  {checklists.length === 0 ? (
                    <View style={styles.noChecklistContainer}>
                      <Text style={styles.noChecklistText}>No checklists available</Text>
                      <Button 
                        mode="outlined" 
                        // onPress={() => navigation.navigate(ROUTES.host_create_checklist, { propertyId: aptId })}
                        onPress={() => {
                          onClose(); // close the modal
                          setTimeout(() => {
                            navigation.navigate(ROUTES.host_create_checklist, {
                              propertyId: aptId,
                              source: 'property'
                            });
                          }, 300);
                        }}
                        style={styles.createChecklistButton}
                      >
                        Create Checklist
                      </Button>
                    </View>
                  ) : (
                    <View style={styles.checklistOptions}>
                      {checklists.map((checklist) => (
                        <TouchableOpacity
                          key={checklist._id}
                          style={[
                            styles.checklistOption,
                            selectedChecklistId === checklist._id && styles.selectedChecklist
                          ]}
                          onPress={() => setSelectedChecklistId(checklist._id)}
                        >
                          <RadioButton.Android
                            value={checklist._id}
                            status={selectedChecklistId === checklist._id ? 'checked' : 'unchecked'}
                            onPress={() => setSelectedChecklistId(checklist._id)}
                            color={COLORS.primary}
                          />
                          <View style={styles.checklistInfo}>
                            <Text style={styles.checklistName}>
                              {checklist.checklistName}
                              {checklist.default_checklist && (
                                <Text style={styles.defaultBadge}> (Default)</Text>
                              )}
                            </Text>
                            <Text style={styles.checklistDetails}>
                              {Object.keys(checklist.checklist).length} group(s) · 
                              ${checklist.totalFee} · 
                              {calculateTotalTasks(checklist)} tasks
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.disabledMessage}>
                <MaterialIcons name="info-outline" size={24} color={COLORS.gray} />
                <Text style={styles.disabledText}>
                  Calendar syncing is disabled. No automatic cleanings will be created.
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.saveButton, !enabled && styles.disabledButton]}
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : enabled ? 'Save & Sync Calendar' : 'Save Settings'}
            </Button>
          </>
        ) : (
          <View style={styles.guideContainer}>
            <IconButton 
              icon="arrow-left" 
              onPress={() => setGuideVisible(false)} 
              color={COLORS.dark}
              style={styles.backButton}
            />
            
            <View style={styles.guideHeader}>
              <Image source={platform.icon} style={styles.guidePlatformIcon} />
              <Text style={styles.guideTitle}>{platform.title}</Text>
            </View>
            
            <Image 
              source={platform.image} 
              style={styles.guideImage} 
              resizeMode="contain"
            />
            
            <View style={styles.stepsContainer}>
              <Text style={styles.sectionTitle}>How to get your calendar URL:</Text>
              {platform.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            
            <Button
              mode="outlined"
              onPress={() => Linking.openURL(platform.helpLink)}
              style={styles.helpButton}
              icon="open-in-new"
              textColor={COLORS.primary}
              disabled={!platform.helpLink}
            >
              {platform.helpLink ? "View Official Guide" : "No Guide Available"}
            </Button>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 34,
    marginTop: 30
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpLink: {
    color: COLORS.primary,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: COLORS.error,
    marginTop: 8,
  },
  platformCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 16,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  disabledContainer: {
    borderLeftColor: COLORS.gray,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 30
  },
  switchSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  cleanerOptions: {
    gap: 12,
    marginTop: 8,
  },
  cleanerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCleaner: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  cleanerName: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  disabledMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  disabledText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  checklistOptions: {
    gap: 12,
    marginTop: 8,
  },
  checklistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChecklist: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  checklistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  defaultBadge: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checklistDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  noChecklistContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  noChecklistText: {
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
  },
  createChecklistButton: {
    borderColor: COLORS.primary,
    width: '80%',
  },
  // ... (other styles remain the same)







  

    container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 34,
    marginTop:30
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpLink: {
    color: COLORS.primary,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: COLORS.error,
    marginTop: 8,
  },
  platformCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 16,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  cleanerOptions: {
    gap: 12,
    marginTop: 8,
  },
  cleanerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCleaner: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  cleanerName: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  guideContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  guidePlatformIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginRight: 16,
  },
  guideTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1,
  },
  guideImage: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  stepsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  helpButton: {
    borderColor: COLORS.primary,
    marginTop: 16,
  },
  platformOptions: {
    marginTop: 16,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  platformOption: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformOptionIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  platformOptionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cleanersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cleanersLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginRight: 8,
  },
  cleanersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cleanerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cleanerAvatar: {
    marginRight: 4,
  },
  cleanerName: {
    fontSize: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  cleanerOptions: {
    gap: 8,
    marginTop: 8,
  },
  noCleanersText: {
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  
  // Enhanced switch styles
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  disabledContainer: {
    borderLeftColor: COLORS.gray,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight:30
  },
  switchSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  
  // Disabled message
  disabledMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  disabledText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  
  // Button styles
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  
  // Disabled state
  disabledField: {
    opacity: 0.6,
  },

  checklistOptions: {
    gap: 12,
    marginTop: 8,
  },
  checklistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChecklist: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  checklistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  checklistDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  noChecklistContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  noChecklistText: {
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
  },
  createChecklistButton: {
    borderColor: COLORS.primary,
    width: '80%',
  },
  
});




