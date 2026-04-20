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
  Alert,
} from 'react-native';
import { Button, TextInput, IconButton, Checkbox, RadioButton, Avatar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { tSafe } from '../../utils/tSafe';

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
    name: 'Airbnb',
    icon: require('../../assets/images/airbnb_logo.png'),
    color: '#FF5A5F',
    title: 'Sync your Airbnb Calendar',
    description: 'Connect your Airbnb listing to automatically create cleaning schedules for each checkout',
    steps: [
      'Go to your Airbnb hosting dashboard',
      'Select the listing you want to sync',
      "Click 'Calendar' in the top menu",
      "Click 'Availability settings'",
      "Under 'Calendar sync', click 'Export calendar'",
      'Copy the iCal link provided',
    ],
    image: require('../../assets/images/airbnb_logo.png'),
    helpLink: 'https://www.airbnb.com/help/article/1353',
  },
  booking: {
    name: 'Booking.com',
    icon: require('../../assets/images/booking_logo.png'),
    color: '#003580',
    title: 'Sync your Booking.com Calendar',
    description: 'Connect your Booking.com property to automatically schedule cleanings',
    steps: [
      'Log in to your Booking.com extranet',
      "Go to 'Properties' and select your property",
      "Click 'Rate & Availability' in the left menu",
      "Select 'Calendar sync'",
      "Click 'Export calendar'",
      'Copy the iCal link provided',
    ],
    image: require('../../assets/images/booking_logo.png'),
    helpLink: 'https://partner.booking.com/en-us/help/calendars-synchronization/how-synchronize-calendar',
  },
  vrbo: {
    name: 'Vrbo',
    icon: require('../../assets/images/vrbo_logo.png'),
    color: '#00A699',
    title: 'Sync your Vrbo Calendar',
    description: 'Connect your Vrbo property to automatically schedule cleanings',
    steps: [
      'Log in to your Vrbo account',
      "Go to 'My Listings'",
      'Select the listing you want to sync',
      "Click 'Calendar'",
      "Click 'Sync calendar'",
      "Copy the iCal link under 'Export calendar'",
    ],
    image: require('../../assets/images/vrbo_logo.png'),
    helpLink: 'https://help.vrbo.com/articles/How-do-I-export-a-calendar',
  },
  other: {
    name: 'Other Calendar',
    icon: require('../../assets/images/vrbo_logo.png'),
    color: '#6200EE',
    title: 'Sync a Generic Calendar',
    description: 'Use any calendar service that supports iCal format',
    steps: [
      "Look for 'Export calendar' or 'Share calendar' options",
      'Ensure the link ends with .ics',
      'Make sure the calendar is publicly accessible',
      'Copy the full URL including https://',
    ],
    image: require('../../assets/images/vrbo_logo.png'),
    helpLink: null,
  },
};

export default function AddICalModal({
  visible,
  onClose,
  onSave,
  cleaners,
  aptId,
  preselectedPlatform,
  existingCalendar,
  checklists,
}) {
  const navigation = useNavigation();
  const [guideVisible, setGuideVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // State
  const [calendarUrl, setCalendarUrl] = useState('');
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [selectedType, setSelectedType] = useState('airbnb');
  const [enabled, setEnabled] = useState(true);
  const [selectedChecklistId, setSelectedChecklistId] = useState(null);

  // Populate state when modal opens
  useEffect(() => {
    if (visible) {
      if (existingCalendar) {
        setCalendarUrl(existingCalendar.ical_url || existingCalendar.calendar_url || '');
        setSelectedCleaners(existingCalendar.assigned_cleaners || []);
        setSelectedType(existingCalendar.platform || preselectedPlatform || 'airbnb');
        setEnabled(existingCalendar.enabled !== false);

        // Set checklist ID with proper fallbacks
        if (existingCalendar.checklist_id) {
          setSelectedChecklistId(existingCalendar.checklist_id);
        } else {
          const defaultChecklist = checklists.find(c => c.default_checklist === true);
          setSelectedChecklistId(defaultChecklist ? defaultChecklist._id : (checklists.length > 0 ? checklists[0]._id : null));
        }
      } else {
        // Reset to defaults
        setCalendarUrl('');
        setSelectedCleaners([]);
        setSelectedType(preselectedPlatform || 'airbnb');
        setEnabled(true);
        const defaultChecklist = checklists.find(c => c.default_checklist === true);
        setSelectedChecklistId(defaultChecklist ? defaultChecklist._id : (checklists.length > 0 ? checklists[0]._id : null));
      }
    }
  }, [visible, existingCalendar, checklists, preselectedPlatform]);

  const platform = PLATFORM_DETAILS[selectedType] || PLATFORM_DETAILS.airbnb;
  const selectedChecklist = checklists.find(c => c._id === selectedChecklistId) || null;

  const toggleCleaner = (cleanerId) => {
    setSelectedCleaners(prev =>
      prev.includes(cleanerId) ? prev.filter(id => id !== cleanerId) : [...prev, cleanerId]
    );
  };

  const handleSave = async () => {
    if (!calendarUrl) {
      setValidationError(tSafe('calendar_url_required', 'Please enter a valid calendar URL'));
      return;
    }
    if (!calendarUrl.startsWith('http') || !calendarUrl.includes('.ics')) {
      setValidationError(tSafe('calendar_url_invalid', 'Please enter a valid calendar URL (should start with https:// and end with .ics)'));
      return;
    }
    setValidationError('');
    setIsSaving(true);

    try {
      const calendarData = {
        platform: selectedType,
        ical_url: calendarUrl,
        last_synced: new Date().toISOString(),
        status: 'linked',
        enabled: enabled,
        assigned_cleaners: selectedCleaners,
        custom_checklistId: selectedChecklistId,
        checklist_details: selectedChecklist
          ? {
              name: selectedChecklist.checklistName,
              groups: Object.keys(selectedChecklist.checklist).length,
            }
          : null,
      };

      await onSave({
        aptId: aptId,
        calendar: calendarData,
        selectedChecklist: selectedChecklist,
      });

      onClose();
    } catch (error) {
      console.error('Error saving calendar:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('error_save_calendar', 'Failed to save calendar sync'));
    } finally {
      setIsSaving(false);
    }
  };

  const openGuide = () => setGuideVisible(true);
  const closeGuide = () => setGuideVisible(false);

  const changePlatform = (newPlatform) => {
    setSelectedType(newPlatform);
    closeGuide();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={onClose} color={COLORS.dark} size={24} />
            <Text style={styles.title}>
              {existingCalendar
                ? tSafe('edit_calendar', 'Edit Calendar')
                : tSafe('sync_calendar', 'Sync Calendar')}
            </Text>
            <View style={{ width: 48 }} />
          </View>

          {!guideVisible ? (
            <>
              {/* Platform Selection Card */}
              <Animatable.View animation="fadeInUp" duration={400} style={styles.platformCard}>
                <TouchableOpacity onPress={openGuide} activeOpacity={0.7}>
                  <View style={styles.platformHeader}>
                    <Image source={platform.icon} style={styles.platformIcon} />
                    <View style={styles.platformInfo}>
                      <Text style={styles.platformName}>{platform.name}</Text>
                      <Text style={styles.platformDescription}>{platform.description}</Text>
                    </View>
                    <MaterialIcons name="info-outline" size={24} color={COLORS.gray} />
                  </View>
                </TouchableOpacity>
              </Animatable.View>

              {/* Enable/Disable Switch */}
              <Animatable.View animation="fadeInUp" delay={100} style={[styles.switchContainer, !enabled && styles.disabledContainer]}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>
                    {enabled ? tSafe('active', 'Active') : tSafe('paused', 'Paused')}
                  </Text>
                  <Text style={styles.switchSubtitle}>
                    {enabled
                      ? tSafe('auto_schedule_on', 'Cleaning schedules will be automatically created')
                      : tSafe('auto_schedule_off', 'No schedules will be created for this calendar')}
                  </Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </Animatable.View>

              {enabled && (
                <>
                  {/* Calendar URL Input */}
                  <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
                    <View style={styles.inputHeader}>
                      <Text style={styles.sectionTitle}>{tSafe('calendar_url', 'Calendar URL')}</Text>
                      <TouchableOpacity onPress={openGuide}>
                        <Text style={styles.helpLink}>{tSafe('where_to_find', 'Where to find it?')}</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      mode="outlined"
                      placeholder={tSafe('paste_calendar_url', 'Paste your calendar URL here')}
                      outlineColor="#E0E0E0"
                      activeOutlineColor={COLORS.primary}
                      value={calendarUrl}
                      onChangeText={setCalendarUrl}
                      style={styles.input}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      editable={enabled}
                    />
                    {validationError && <Text style={styles.errorText}>{validationError}</Text>}
                  </Animatable.View>

                  {/* Assign Cleaners */}
                  <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
                    <Text style={styles.sectionTitle}>{tSafe('assigned_cleaners_optional', 'Assigned Cleaners (Optional)')}</Text>
                    <Text style={styles.subtitle}>
                      {tSafe('assign_cleaners_subtitle', 'Select cleaners to assign to this calendar\'s cleanings')}
                    </Text>
                    <View style={styles.cleanerOptions}>
                      {cleaners.map(cleaner => (
                        <TouchableOpacity
                          key={cleaner._id}
                          style={[
                            styles.cleanerOption,
                            selectedCleaners.includes(cleaner._id) && styles.selectedCleaner,
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
                        <Text style={styles.noCleanersText}>
                          {tSafe('no_cleaners_available', 'No cleaners available')}
                        </Text>
                      )}
                    </View>
                  </Animatable.View>

                  {/* Checklist Selection */}
                  <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
                    <Text style={styles.sectionTitle}>{tSafe('cleaning_checklist', 'Cleaning Checklist')}</Text>
                    <Text style={styles.subtitle}>
                      {tSafe('select_checklist_subtitle', 'Select the checklist to use for cleanings from this calendar')}
                    </Text>
                    {checklists.length === 0 ? (
                      <View style={styles.noChecklistContainer}>
                        <Text style={styles.noChecklistText}>
                          {tSafe('no_checklists_available', 'No checklists available')}
                        </Text>
                        <Button
                          mode="outlined"
                          onPress={() => {
                            onClose();
                            setTimeout(() => {
                              navigation.navigate(ROUTES.host_create_checklist, {
                                propertyId: aptId,
                                source: 'property',
                              });
                            }, 300);
                          }}
                          style={styles.createChecklistButton}
                        >
                          {tSafe('create_checklist', 'Create Checklist')}
                        </Button>
                      </View>
                    ) : (
                      <View style={styles.checklistOptions}>
                        {checklists.map(checklist => (
                          <TouchableOpacity
                            key={checklist._id}
                            style={[
                              styles.checklistOption,
                              selectedChecklistId === checklist._id && styles.selectedChecklist,
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
                                  <Text style={styles.defaultBadge}> {tSafe('default', '(Default)')}</Text>
                                )}
                              </Text>
                              <Text style={styles.checklistDetails}>
                                {Object.keys(checklist.checklist).length} {tSafe('groups', 'group(s)')} · ${checklist.totalFee} · {calculateTotalTasks(checklist)} {tSafe('tasks', 'tasks')}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Animatable.View>
                </>
              )}

              {/* Save Button */}
              <Animatable.View animation="fadeInUp" delay={500}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[styles.saveButton, !enabled && styles.disabledButton]}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {isSaving ? tSafe('saving', 'Saving...') : enabled ? tSafe('save_and_sync', 'Save & Sync Calendar') : tSafe('save_settings', 'Save Settings')}
                </Button>
              </Animatable.View>
            </>
          ) : (
            <View style={styles.guideContainer}>
              <IconButton icon="arrow-left" onPress={closeGuide} color={COLORS.dark} size={24} style={styles.backButton} />
              <View style={styles.guideHeader}>
                <Image source={platform.icon} style={styles.guidePlatformIcon} />
                <Text style={styles.guideTitle}>{platform.title}</Text>
              </View>
              <Image source={platform.image} style={styles.guideImage} resizeMode="contain" />
              <View style={styles.stepsContainer}>
                <Text style={styles.sectionTitle}>{tSafe('how_to_get_calendar_url', 'How to get your calendar URL:')}</Text>
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
                {platform.helpLink ? tSafe('view_official_guide', 'View Official Guide') : tSafe('no_guide_available', 'No Guide Available')}
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  platformCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  platformIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginRight: 16,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  disabledContainer: {
    borderLeftColor: COLORS.gray,
    backgroundColor: '#F5F5F5',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  helpLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    height: 60,
    color: COLORS.light_gray
  },
  errorText: {
    color: COLORS.error,
    marginTop: 8,
    fontSize: 12,
  },
  cleanerOptions: {
    gap: 12,
    marginTop: 4,
  },
  cleanerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCleaner: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  cleanerAvatar: {
    marginLeft: 8,
    marginRight: 12,
  },
  cleanerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    flex: 1,
  },
  noCleanersText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontStyle: 'italic',
    padding: 16,
  },
  checklistOptions: {
    gap: 12,
    marginTop: 4,
  },
  checklistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChecklist: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  checklistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  defaultBadge: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'normal',
  },
  checklistDetails: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  noChecklistContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
  },
  noChecklistText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    textAlign: 'center',
  },
  createChecklistButton: {
    borderColor: COLORS.primary,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  guideContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
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
    height: 180,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.dark,
  },
  helpButton: {
    borderColor: COLORS.primary,
    marginTop: 8,
  },
});