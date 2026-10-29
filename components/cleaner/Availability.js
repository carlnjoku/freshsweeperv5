import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';

import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const timeStringToDate = (timeStr) => {
  if (!timeStr) {
    const date = new Date();
    date.setHours(9, 0, 0, 0);
    return date;
  }

  const [hours, minutes] = timeStr.split(':');

  const date = new Date();

  date.setHours(
    Number.parseInt(hours, 10) || 0,
    Number.parseInt(minutes, 10) || 0,
    0,
    0
  );

  return date;
};

const dateToTimeString = (date) => {
  if (!date) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const timeToMinutes = (time) => {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

const formatTime = (time) => {
  if (!time) {
    return '';
  }

  const [hoursString, minutes] = time.split(':');

  let hours = Number(hoursString);
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function Availability({
  cleanerId,
  close_avail_modal,
  get_availability,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [timePickerVisible, setTimePickerVisible] =
    useState({
      visible: false,
      type: 'start',
    });

  // --------------------------------------------------
  // Fetch availability
  // --------------------------------------------------

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);

      const response =
        await userService.getCleanerAvailability(
          cleanerId
        );

      const data = response?.data?.data;

      const rawAvailability =
        data?.availability || [];

      const formatted = rawAvailability.map(
        (item) => ({
          day: item.day,
          slots: (item.slots || []).map(
            (slot) => ({
              start: slot.start,
              end: slot.end,
            })
          ),
        })
      );

      setAvailability(formatted);
    } catch (err) {
      console.error(
        'Error fetching availability:',
        err
      );

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'failed_load_availability',
          'Failed to load availability'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Translations
  // --------------------------------------------------

  const getDayTranslation = (day) => {
    const dayKey = day.toLowerCase();

    switch (dayKey) {
      case 'monday':
        return tSafe('monday', 'Monday');

      case 'tuesday':
        return tSafe('tuesday', 'Tuesday');

      case 'wednesday':
        return tSafe(
          'wednesday',
          'Wednesday'
        );

      case 'thursday':
        return tSafe(
          'thursday',
          'Thursday'
        );

      case 'friday':
        return tSafe('friday', 'Friday');

      case 'saturday':
        return tSafe(
          'saturday',
          'Saturday'
        );

      case 'sunday':
        return tSafe('sunday', 'Sunday');

      default:
        return day;
    }
  };

  // --------------------------------------------------
  // Derived data
  // --------------------------------------------------

  const selectedDayAvailability = useMemo(() => {
    if (!selectedDay) {
      return null;
    }

    return availability.find(
      (item) => item.day === selectedDay
    );
  }, [availability, selectedDay]);

  const selectedDaySlots =
    selectedDayAvailability?.slots || [];

  const configuredDays = useMemo(
    () =>
      availability.filter(
        (item) =>
          Array.isArray(item.slots) &&
          item.slots.length > 0
      ).length,
    [availability]
  );

  const totalSlots = useMemo(
    () =>
      availability.reduce(
        (total, item) =>
          total +
          (Array.isArray(item.slots)
            ? item.slots.length
            : 0),
        0
      ),
    [availability]
  );

  // --------------------------------------------------
  // Availability mutation helpers
  // --------------------------------------------------

  const updateDaySlots = (day, slots) => {
    setAvailability((prev) => {
      const dayIndex = prev.findIndex(
        (item) => item.day === day
      );

      if (slots.length === 0) {
        if (dayIndex === -1) {
          return prev;
        }

        return prev.filter(
          (_, index) => index !== dayIndex
        );
      }

      if (dayIndex >= 0) {
        const updated = [...prev];

        updated[dayIndex] = {
          ...updated[dayIndex],
          slots,
        };

        return updated;
      }

      return [
        ...prev,
        {
          day,
          slots,
        },
      ];
    });
  };

  // --------------------------------------------------
  // Full day
  // --------------------------------------------------

  const setFullDay = () => {
    if (!selectedDay) {
      return;
    }

    updateDaySlots(selectedDay, [
      {
        start: '00:00',
        end: '23:59',
      },
    ]);
  };

  // --------------------------------------------------
  // Add slot
  // --------------------------------------------------

  const handleAddSlot = () => {
    if (!selectedDay) {
      Alert.alert(
        tSafe(
          'select_day_title',
          'Select Day'
        ),
        tSafe(
          'please_select_day',
          'Please select a day first'
        )
      );

      return;
    }

    const startMinutes =
      timeToMinutes(startTime);

    const endMinutes =
      timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      Alert.alert(
        tSafe(
          'invalid_time_title',
          'Invalid Time'
        ),
        tSafe(
          'end_time_after_start',
          'End time must be after the start time'
        )
      );

      return;
    }

    const newSlot = {
      start: startTime,
      end: endTime,
    };

    const existingSlots =
      selectedDaySlots;

    // Prevent overlapping slots.
    const overlaps = existingSlots.some(
      (slot) => {
        const existingStart =
          timeToMinutes(slot.start);

        const existingEnd =
          timeToMinutes(slot.end);

        return (
          startMinutes < existingEnd &&
          endMinutes > existingStart
        );
      }
    );

    if (overlaps) {
      Alert.alert(
        tSafe(
          'overlapping_time_title',
          'Overlapping Time'
        ),
        tSafe(
          'overlapping_time_message',
          'This time slot overlaps with an existing availability slot.'
        )
      );

      return;
    }

    const updatedSlots = [
      ...existingSlots,
      newSlot,
    ].sort(
      (a, b) =>
        timeToMinutes(a.start) -
        timeToMinutes(b.start)
    );

    updateDaySlots(
      selectedDay,
      updatedSlots
    );

    setStartTime('09:00');
    setEndTime('17:00');
  };

  // --------------------------------------------------
  // Remove slot
  // --------------------------------------------------

  const handleRemoveSlot = (
    day,
    index
  ) => {
    const dayAvailability =
      availability.find(
        (item) => item.day === day
      );

    if (!dayAvailability) {
      return;
    }

    const updatedSlots =
      dayAvailability.slots.filter(
        (_, slotIndex) =>
          slotIndex !== index
      );

    updateDaySlots(
      day,
      updatedSlots
    );
  };

  // --------------------------------------------------
  // Clear selected day
  // --------------------------------------------------

  const handleClearDay = () => {
    if (!selectedDay) {
      return;
    }

    Alert.alert(
      tSafe(
        'remove_day_availability_title',
        'Remove Availability?'
      ),
      tSafe(
        'remove_day_availability_message',
        'This will remove all availability slots for this day.'
      ),
      [
        {
          text: tSafe(
            'cancel',
            'Cancel'
          ),
          style: 'cancel',
        },
        {
          text: tSafe(
            'remove',
            'Remove'
          ),
          style: 'destructive',
          onPress: () =>
            updateDaySlots(
              selectedDay,
              []
            ),
        },
      ]
    );
  };

  // --------------------------------------------------
  // Save
  // --------------------------------------------------

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      if (!Array.isArray(availability)) {
        throw new Error(
          `Availability is not an array: ${typeof availability}`
        );
      }

      const payload = {
        availability: availability.map(
          (item) => ({
            day: item.day,
            slots: item.slots.map(
              (slot) => ({
                start: slot.start,
                end: slot.end,
              })
            ),
          })
        ),
      };

      await userService.updateCleanerAvailability(
        cleanerId,
        payload
      );

      if (get_availability) {
        get_availability(payload);
      }

      Alert.alert(
        tSafe(
          'success_title',
          'Success'
        ),
        tSafe(
          'availability_updated',
          'Availability updated'
        )
      );

      close_avail_modal();
    } catch (err) {
      console.error(
        'Error saving availability:',
        err
      );

      Alert.alert(
        tSafe(
          'error_title',
          'Error'
        ),
        `${tSafe(
          'failed_save_availability',
          'Failed to save availability: '
        )}${err.message || ''}`
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Day chips
  // --------------------------------------------------

  const renderDayChips = () => (
    <View style={styles.daysGrid}>
      {days.map((day) => {
        const dayData =
          availability.find(
            (item) => item.day === day
          );

        const slotCount =
          dayData?.slots?.length || 0;

        const isSelected =
          selectedDay === day;

        return (
          <TouchableOpacity
            key={day}
            activeOpacity={0.8}
            style={[
              styles.dayCard,
              isSelected &&
                styles.dayCardSelected,
            ]}
            onPress={() =>
              setSelectedDay(day)
            }
          >
            <View
              style={[
                styles.dayCircle,
                isSelected &&
                  styles.dayCircleSelected,
              ]}
            >
              <AppText
                variant="body"
                style={[
                  styles.dayInitial,
                  isSelected &&
                    styles.dayInitialSelected,
                ]}
              >
                {getDayTranslation(
                  day
                ).charAt(0)}
              </AppText>
            </View>

            <View style={styles.dayInfo}>
              <AppText
                variant="body"
                style={[
                  styles.dayName,
                  isSelected &&
                    styles.dayNameSelected,
                ]}
              >
                {getDayTranslation(
                  day
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.daySlots,
                  isSelected &&
                    styles.daySlotsSelected,
                ]}
              >
                {slotCount > 0
                  ? `${slotCount} ${
                      slotCount === 1
                        ? tSafe(
                            'time_slot',
                            'time slot'
                          )
                        : tSafe(
                            'time_slots',
                            'time slots'
                          )
                    }`
                  : tSafe(
                      'not_available',
                      'Not available'
                    )}
              </AppText>
            </View>

            {slotCount > 0 && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={
                  isSelected
                    ? theme.button.primaryText
                    : theme.status.success
                }
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // --------------------------------------------------
  // Selected day
  // --------------------------------------------------

  const renderSelectedDayContent =
    () => (
      <View style={styles.selectedDayContainer}>
        {/* Navigation */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() =>
            setSelectedDay(null)
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={theme.brand.primary}
          />

          <AppText
            variant="body"
            style={styles.backButtonText}
          >
            {tSafe(
              'change_day',
              'Change Day'
            )}
          </AppText>
        </TouchableOpacity>

        {/* Day header */}
        <View style={styles.selectedDayHeader}>
          <View style={styles.selectedDayIcon}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={25}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.selectedDayInfo}>
            <AppText
              variant="h2"
              style={styles.selectedDayTitle}
            >
              {getDayTranslation(
                selectedDay
              )}
            </AppText>

            <AppText
              variant="caption"
              style={styles.selectedDaySubtitle}
            >
              {selectedDaySlots.length > 0
                ? `${selectedDaySlots.length} ${
                    selectedDaySlots.length ===
                    1
                      ? tSafe(
                          'time_slot',
                          'time slot'
                        )
                      : tSafe(
                          'time_slots',
                          'time slots'
                        )
                  } configured`
                : tSafe(
                    'no_availability_configured',
                    'No availability configured'
                  )}
            </AppText>
          </View>
        </View>

        {/* Full day */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.fullDayButton}
          onPress={setFullDay}
        >
          <View style={styles.fullDayIcon}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={21}
              color={
                theme.status.success
              }
            />
          </View>

          <View style={styles.fullDayContent}>
            <AppText
              variant="body"
              style={styles.fullDayTitle}
            >
              {tSafe(
                'available_all_day',
                'Available All Day'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={styles.fullDaySubtitle}
            >
              {tSafe(
                'available_all_day_description',
                'Set availability from midnight until the end of the day.'
              )}
            </AppText>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.icon.muted}
          />
        </TouchableOpacity>

        {/* Add slot */}
        <View style={styles.addSlotCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderIcon}>
              <MaterialCommunityIcons
                name="clock-plus-outline"
                size={19}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <View>
              <AppText
                variant="body"
                style={styles.sectionTitle}
              >
                {tSafe(
                  'add_time_slot',
                  'Add Time Slot'
                )}
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.sectionSubtitle
                }
              >
                {tSafe(
                  'add_time_slot_description',
                  'Choose when you are available.'
                )}
              </AppText>
            </View>
          </View>

          <View style={styles.timeRow}>
            {/* Start */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.timeButton}
              onPress={() =>
                setTimePickerVisible({
                  visible: true,
                  type: 'start',
                })
              }
            >
              <AppText
                variant="caption"
                style={styles.timeLabel}
              >
                {tSafe(
                  'start',
                  'Start'
                )}
              </AppText>

              <View
                style={styles.timeValueRow}
              >
                <MaterialCommunityIcons
                  name="clock-start"
                  size={18}
                  color={
                    theme.brand.primary
                  }
                />

                <AppText
                  variant="body"
                  style={styles.timeValue}
                >
                  {formatTime(
                    startTime
                  )}
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Arrow */}
            <View
              style={styles.timeArrow}
            >
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={theme.icon.muted}
              />
            </View>

            {/* End */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.timeButton}
              onPress={() =>
                setTimePickerVisible({
                  visible: true,
                  type: 'end',
                })
              }
            >
              <AppText
                variant="caption"
                style={styles.timeLabel}
              >
                {tSafe(
                  'end',
                  'End'
                )}
              </AppText>

              <View
                style={styles.timeValueRow}
              >
                <MaterialCommunityIcons
                  name="clock-end"
                  size={18}
                  color={
                    theme.brand.primary
                  }
                />

                <AppText
                  variant="body"
                  style={styles.timeValue}
                >
                  {formatTime(
                    endTime
                  )}
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Add */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addButton}
              onPress={handleAddSlot}
            >
              <MaterialCommunityIcons
                name="plus"
                size={25}
                color={
                  theme.button.primaryText
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Existing slots */}
        <View style={styles.slotsSection}>
          <View
            style={
              styles.slotsSectionHeader
            }
          >
            <View>
              <AppText
                variant="body"
                style={styles.sectionTitle}
              >
                {tSafe(
                  'availability_slots',
                  'Availability'
                )}
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.sectionSubtitle
                }
              >
                {tSafe(
                  'availability_slots_description',
                  'Your available times for this day.'
                )}
              </AppText>
            </View>

            {selectedDaySlots.length >
              0 && (
              <TouchableOpacity
                onPress={
                  handleClearDay
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.clearDayText
                  }
                >
                  {tSafe(
                    'clear_day',
                    'Clear Day'
                  )}
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {selectedDaySlots.length >
          0 ? (
            <View
              style={styles.slotsList}
            >
              {selectedDaySlots.map(
                (slot, index) => (
                  <View
                    key={`${slot.start}-${slot.end}-${index}`}
                    style={
                      styles.slotCard
                    }
                  >
                    <View
                      style={
                        styles.slotIcon
                      }
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={20}
                        color={
                          theme.status.success
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.slotContent
                      }
                    >
                      <AppText
                        variant="body"
                        style={
                          styles.slotTime
                        }
                      >
                        {formatTime(
                          slot.start
                        )}{' '}
                        –{' '}
                        {formatTime(
                          slot.end
                        )}
                      </AppText>

                      <AppText
                        variant="caption"
                        style={
                          styles.slotDuration
                        }
                      >
                        {tSafe(
                          'available_for_cleaning',
                          'Available for cleaning'
                        )}
                      </AppText>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        handleRemoveSlot(
                          selectedDay,
                          index
                        )
                      }
                      hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                      style={
                        styles.removeButton
                      }
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={20}
                        color={
                          theme.status.error
                        }
                      />
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          ) : (
            <View
              style={
                styles.emptySlotsCard
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <MaterialCommunityIcons
                  name="clock-off-outline"
                  size={25}
                  color={
                    theme.icon.muted
                  }
                />
              </View>

              <AppText
                variant="body"
                style={
                  styles.emptyTitle
                }
              >
                {tSafe(
                  'no_slots_added',
                  'No time slots added yet'
                )}
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.emptyText
                }
              >
                {tSafe(
                  'add_first_time_slot',
                  'Add a time slot above to show when you are available.'
                )}
              </AppText>
            </View>
          )}
        </View>
      </View>
    );

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.loadingScreen}>
          <View
            style={
              styles.loadingIcon
            }
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={30}
              color={
                theme.brand.primary
              }
            />
          </View>

          <ActivityIndicator
            size="small"
            color={
              theme.brand.primary
            }
          />

          <AppText
            variant="body"
            style={styles.loadingText}
          >
            {tSafe(
              'loading_availability',
              'Loading your availability...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // Main
  // --------------------------------------------------

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={
            close_avail_modal
          }
          style={styles.closeButton}
        >
          <MaterialCommunityIcons
            name="close"
            size={22}
            color={
              theme.icon.default
            }
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View
            style={
              styles.headerIcon
            }
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color={
                theme.brand.primary
              }
            />
          </View>

          <View>
            <AppText
              variant="h2"
              style={styles.title}
            >
              {tSafe(
                'set_availability',
                'Set Availability'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.headerSubtitle
              }
            >
              {configuredDays}/7{' '}
              {tSafe(
                'days_configured',
                'days configured'
              )}
            </AppText>
          </View>
        </View>

        <View style={styles.headerStats}>
          <AppText
            variant="body"
            style={styles.headerStatValue}
          >
            {totalSlots}
          </AppText>

          <AppText
            variant="caption"
            style={styles.headerStatLabel}
          >
            {tSafe(
              'slots',
              'Slots'
            )}
          </AppText>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        {!selectedDay ? (
          <>
            {/* Intro */}
            <View
              style={styles.introCard}
            >
              <View
                style={
                  styles.introIcon
                }
              >
                <MaterialCommunityIcons
                  name="calendar-check-outline"
                  size={26}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={styles.introContent}
              >
                <AppText
                  variant="body"
                  style={
                    styles.introTitle
                  }
                >
                  {tSafe(
                    'your_weekly_availability',
                    'Your Weekly Availability'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.introText
                  }
                >
                  {tSafe(
                    'weekly_availability_description',
                    'Set the times you are available to accept cleaning jobs. You can add multiple time slots for each day.'
                  )}
                </AppText>
              </View>
            </View>

            {/* Days */}
            <AppText
              variant="body"
              style={styles.sectionTitle}
            >
              {tSafe(
                'select_day',
                'Select a Day'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={styles.sectionSubtitle}
            >
              {tSafe(
                'tap_day_to_manage',
                'Select a day to manage its time slots.'
              )}
            </AppText>

            <View
              style={styles.daysGrid}
            >
              {renderDayChips()}
            </View>
          </>
        ) : (
          renderSelectedDayContent()
        )}
      </ScrollView>

      {/* Footer */}
      {!selectedDay && (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              close_avail_modal
            }
            style={styles.cancelButton}
            disabled={saving}
          >
            <AppText
              variant="body"
              style={
                styles.cancelButtonText
              }
            >
              {tSafe(
                'cancel',
                'Cancel'
              )}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={
                  theme.button.primaryText
                }
              />
            ) : (
              <MaterialCommunityIcons
                name="content-save-outline"
                size={19}
                color={
                  theme.button.primaryText
                }
              />
            )}

            <AppText
              variant="body"
              style={
                styles.saveButtonText
              }
            >
              {saving
                ? tSafe(
                    'saving',
                    'Saving...'
                  )
                : tSafe(
                    'save_availability',
                    'Save Availability'
                  )}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Time Picker */}
      <DatePicker
        modal
        open={
          timePickerVisible.visible
        }
        date={
          timePickerVisible.type ===
          'start'
            ? timeStringToDate(
                startTime
              )
            : timeStringToDate(
                endTime
              )
        }
        mode="time"
        onConfirm={(date) => {
          const timeStr =
            dateToTimeString(
              date
            );

          if (
            timePickerVisible.type ===
            'start'
          ) {
            setStartTime(timeStr);
          } else {
            setEndTime(timeStr);
          }

          setTimePickerVisible({
            visible: false,
            type: timePickerVisible.type,
          });
        }}
        onCancel={() =>
          setTimePickerVisible({
            visible: false,
            type: timePickerVisible.type,
          })
        }
        title={
          timePickerVisible.type ===
          'start'
            ? tSafe(
                'select_start_time',
                'Select Start Time'
              )
            : tSafe(
                'select_end_time',
                'Select End Time'
              )
        }
        confirmText={tSafe(
          'done',
          'Done'
        )}
        cancelText={tSafe(
          'cancel',
          'Cancel'
        )}
        locale="en"
        minuteInterval={15}
        is24hourSource="locale"
      />
    </SafeAreaView>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
      backgroundColor:
        theme.surface.elevated,
      marginTop:
        Platform.OS === 'ios' ? 0 : 20,
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
    },

    headerCenter: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
    },

    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 10,
    },

    title: {
      color: theme.text.primary,
      fontSize: 17,
      fontWeight: '700',
    },

    headerSubtitle: {
      color: theme.text.muted,
      marginTop: 2,
      fontSize: 11,
    },

    headerStats: {
      minWidth: 48,
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor:
        theme.surface.selected,
    },

    headerStatValue: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: '700',
    },

    headerStatLabel: {
      color: theme.text.muted,
      fontSize: 9,
    },

    content: {
      flex: 1,
    },

    contentContainer: {
      padding: 16,
      paddingBottom: 30,
    },

    introCard: {
      flexDirection: 'row',
      padding: 15,
      borderRadius: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      marginBottom: 22,
    },

    introIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 12,
    },

    introContent: {
      flex: 1,
    },

    introTitle: {
      color: theme.text.primary,
      fontWeight: '700',
      fontSize: 15,
      marginBottom: 4,
    },

    introText: {
      color: theme.text.secondary,
      fontSize: 12,
      lineHeight: 18,
    },

    sectionTitle: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 3,
    },

    sectionSubtitle: {
      color: theme.text.muted,
      fontSize: 12,
      lineHeight: 17,
      marginBottom: 13,
    },

    daysGrid: {
      gap: 9,
    },

    dayCard: {
      minHeight: 66,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    dayCardSelected: {
      backgroundColor:
        theme.brand.primary,
      borderColor:
        theme.brand.primary,
    },

    dayCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      marginRight: 11,
    },

    dayCircleSelected: {
      backgroundColor:
        'rgba(255,255,255,0.18)',
    },

    dayInitial: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '700',
    },

    dayInitialSelected: {
      color:
        theme.button.primaryText,
    },

    dayInfo: {
      flex: 1,
    },

    dayName: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },

    dayNameSelected: {
      color:
        theme.button.primaryText,
    },

    daySlots: {
      color: theme.text.muted,
      fontSize: 11,
    },

    daySlotsSelected: {
      color:
        'rgba(255,255,255,0.78)',
    },

    selectedDayContainer: {
      paddingBottom: 20,
    },

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 14,
    },

    backButtonText: {
      color: theme.brand.primary,
      fontSize: 13,
      fontWeight: '600',
      marginLeft: 5,
    },

    selectedDayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },

    selectedDayIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 12,
    },

    selectedDayInfo: {
      flex: 1,
    },

    selectedDayTitle: {
      color: theme.text.primary,
      fontSize: 21,
      fontWeight: '700',
      marginBottom: 2,
    },

    selectedDaySubtitle: {
      color: theme.text.muted,
      fontSize: 11,
    },

    fullDayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 13,
      borderRadius: 16,
      backgroundColor:
        `${theme.status.success}10`,
      borderWidth: 1,
      borderColor:
        `${theme.status.success}30`,
      marginBottom: 16,
    },

    fullDayIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        `${theme.status.success}18`,
      marginRight: 10,
    },

    fullDayContent: {
      flex: 1,
    },

    fullDayTitle: {
      color: theme.text.primary,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },

    fullDaySubtitle: {
      color: theme.text.muted,
      fontSize: 10,
      lineHeight: 15,
    },

    addSlotCard: {
      padding: 15,
      borderRadius: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      marginBottom: 20,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    sectionHeaderIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 9,
    },

    sectionTitle: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: '700',
    },

    sectionSubtitle: {
      color: theme.text.muted,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 1,
    },

    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    timeButton: {
      flex: 1,
      minHeight: 62,
      paddingHorizontal: 10,
      paddingVertical: 8,
      justifyContent: 'center',
      borderRadius: 13,
      backgroundColor:
        theme.input.background,
      borderWidth: 1,
      borderColor:
        theme.input.border,
    },

    timeLabel: {
      color: theme.text.muted,
      fontSize: 10,
      marginBottom: 5,
    },

    timeValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    timeValue: {
      color: theme.text.primary,
      fontSize: 13,
      fontWeight: '700',
      marginLeft: 5,
    },

    timeArrow: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    addButton: {
      width: 50,
      height: 50,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryBackground,
      marginLeft: 8,
    },

    slotsSection: {
      marginBottom: 20,
    },

    slotsSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },

    clearDayText: {
      color: theme.status.error,
      fontSize: 11,
      fontWeight: '600',
    },

    slotsList: {
      gap: 8,
    },

    slotCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 15,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    slotIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        `${theme.status.success}12`,
      marginRight: 10,
    },

    slotContent: {
      flex: 1,
    },

    slotTime: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },

    slotDuration: {
      color: theme.text.muted,
      fontSize: 10,
    },

    removeButton: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        `${theme.status.error}10`,
    },

    emptySlotsCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      borderStyle: 'dashed',
    },

    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      marginBottom: 9,
    },

    emptyTitle: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 3,
    },

    emptyText: {
      color: theme.text.muted,
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom:
        Platform.OS === 'ios' ? 18 : 12,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      backgroundColor:
        theme.surface.elevated,
    },

    cancelButton: {
      flex: 0.8,
      minHeight: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.secondaryBackground,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    cancelButtonText: {
      color:
        theme.button.secondaryText,
      fontSize: 14,
      fontWeight: '600',
    },

    saveButton: {
      flex: 1.4,
      minHeight: 50,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor:
        theme.button.primaryBackground,
    },

    saveButtonDisabled: {
      backgroundColor:
        theme.button.disabledBackground,
    },

    saveButtonText: {
      color:
        theme.button.primaryText,
      fontSize: 14,
      fontWeight: '700',
    },

    loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },

    loadingIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
    },

    loadingText: {
      color: theme.text.secondary,
      fontSize: 13,
    },
  });





// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import DatePicker from 'react-native-date-picker';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe';

// // Helper: convert "HH:MM" to a Date object for the picker
// const timeStringToDate = (timeStr) => {
//   if (!timeStr) return new Date();
//   const [hours, minutes] = timeStr.split(':');
//   const date = new Date();
//   date.setHours(parseInt(hours, 10) || 0);
//   date.setMinutes(parseInt(minutes, 10) || 0);
//   date.setSeconds(0);
//   return date;
// };

// // Helper: format Date to "HH:MM"
// const dateToTimeString = (date) => {
//   if (!date) return '';
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   return `${hours}:${minutes}`;
// };

// export default function Availability({ cleanerId, close_avail_modal, get_availability }) {
//   const [availability, setAvailability] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [startTime, setStartTime] = useState('09:00');
//   const [endTime, setEndTime] = useState('17:00');
//   const [timePickerVisible, setTimePickerVisible] = useState({ visible: false, type: 'start' });

//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   useEffect(() => {
//     fetchAvailability();
//   }, []);

//   const fetchAvailability = async () => {
//     try {
//       const response = await userService.getCleanerAvailability(cleanerId);
//       const data = response.data.data;
//       const rawAvailability = data?.availability || [];
//       const formatted = rawAvailability.map((item) => ({
//         day: item.day,
//         slots: (item.slots || []).map((slot) => ({
//           start: slot.start,
//           end: slot.end,
//         })),
//       }));
//       setAvailability(formatted);
//     } catch (err) {
//       console.error('Error fetching availability:', err);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_load_availability', 'Failed to load availability'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setFullDay = () => {
//     if (!selectedDay) return;
  
//     // Remove all existing slots for this day and add a single 00:00-23:59 slot
//     const fullDaySlot = { start: '00:00', end: '23:59' };
  
//     setAvailability((prev) => {
//       const dayIndex = prev.findIndex((item) => item.day === selectedDay);
//       if (dayIndex >= 0) {
//         const updated = [...prev];
//         updated[dayIndex] = {
//           ...updated[dayIndex],
//           slots: [fullDaySlot],
//         };
//         return updated;
//       } else {
//         return [...prev, { day: selectedDay, slots: [fullDaySlot] }];
//       }
//     });
//   };

//   const handleAddSlot = () => {
//     if (!selectedDay) {
//       Alert.alert(tSafe('select_day_title', 'Select Day'), tSafe('please_select_day', 'Please select a day first'));
//       return;
//     }
//     const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
//     const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
//     if (startMinutes >= endMinutes) {
//       Alert.alert(tSafe('invalid_time_title', 'Invalid Time'), tSafe('end_time_after_start', 'End time must be after start time'));
//       return;
//     }

//     setAvailability((prev) => {
//       const dayIndex = prev.findIndex((item) => item.day === selectedDay);
//       const newSlot = { start: startTime, end: endTime };
//       if (dayIndex >= 0) {
//         const updated = [...prev];
//         updated[dayIndex] = {
//           ...updated[dayIndex],
//           slots: [...updated[dayIndex].slots, newSlot],
//         };
//         return updated;
//       } else {
//         return [...prev, { day: selectedDay, slots: [newSlot] }];
//       }
//     });

//     setStartTime('09:00');
//     setEndTime('17:00');
//   };

//   const handleRemoveSlot = (day, index) => {
//     setAvailability((prev) => {
//       const dayIndex = prev.findIndex((item) => item.day === day);
//       if (dayIndex === -1) return prev;
//       const updated = [...prev];
//       updated[dayIndex].slots = updated[dayIndex].slots.filter((_, i) => i !== index);
//       if (updated[dayIndex].slots.length === 0) {
//         return prev.filter((_, i) => i !== dayIndex);
//       }
//       return updated;
//     });
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       if (!Array.isArray(availability)) {
//         throw new Error(`Availability is not an array: ${typeof availability}`);
//       }

//       const payload = {
//         availability: availability.map((item) => ({
//           day: item.day,
//           slots: item.slots.map((slot) => ({
//             start: slot.start,
//             end: slot.end,
//           })),
//         })),
//       };

//       await userService.updateCleanerAvailability(cleanerId, payload);
//       get_availability(payload);
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('availability_updated', 'Availability updated'));
//       close_avail_modal();
//     } catch (err) {
//       console.error('Error saving availability:', err);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_availability', 'Failed to save availability: ') + err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getDayTranslation = (day) => {
//     const dayKey = day.toLowerCase();
//     switch (dayKey) {
//       case 'monday': return tSafe('monday', 'Monday');
//       case 'tuesday': return tSafe('tuesday', 'Tuesday');
//       case 'wednesday': return tSafe('wednesday', 'Wednesday');
//       case 'thursday': return tSafe('thursday', 'Thursday');
//       case 'friday': return tSafe('friday', 'Friday');
//       case 'saturday': return tSafe('saturday', 'Saturday');
//       case 'sunday': return tSafe('sunday', 'Sunday');
//       default: return day;
//     }
//   };

//   const renderDayChips = () => (
//     <View style={styles.daysContainer}>
//       {days.map((day) => (
//         <TouchableOpacity
//           key={day}
//           style={[
//             styles.dayButton,
//             selectedDay === day && styles.dayButtonSelected,
//           ]}
//           onPress={() => setSelectedDay(day)}
//         >
//           <Text
//             style={[
//               styles.dayText,
//               selectedDay === day && styles.dayTextSelected,
//             ]}
//           >
//             {getDayTranslation(day).slice(0, 3)}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );

//   const renderSelectedDayContent = () => {
//     const dayAvailability = availability.find((a) => a.day === selectedDay);
//     const slots = dayAvailability?.slots || [];
  
//     return (
//       <View style={styles.selectedDayContainer}>
//         <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDay(null)}>
//           <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.primary} />
//           <Text style={styles.backButtonText}>{tSafe('change_day', 'Change Day')}</Text>
//         </TouchableOpacity>
  
//         <Text style={styles.selectedDayTitle}>{getDayTranslation(selectedDay)}</Text>
  
//         {/* Full Day Button */}
//         <TouchableOpacity style={styles.fullDayButton} onPress={setFullDay}>
//           <MaterialCommunityIcons name="clock-plus" size={20} color="#fff" />
//           <Text style={styles.fullDayButtonText}>{tSafe('available_all_day', 'Available All Day')}</Text>
//         </TouchableOpacity>
  
//         <Text style={styles.sectionTitle}>{tSafe('add_time_slot', 'Add Time Slot')}</Text>
//         <View style={styles.timeRow}>
//           <TouchableOpacity
//             style={styles.timeButton}
//             onPress={() => setTimePickerVisible({ visible: true, type: 'start' })}
//           >
//             <Text style={styles.timeLabel}>{tSafe('start', 'Start')}</Text>
//             <Text style={styles.timeValue}>{startTime}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.timeButton}
//             onPress={() => setTimePickerVisible({ visible: true, type: 'end' })}
//           >
//             <Text style={styles.timeLabel}>{tSafe('end', 'End')}</Text>
//             <Text style={styles.timeValue}>{endTime}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.addButton} onPress={handleAddSlot}>
//             <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
//           </TouchableOpacity>
//         </View>
  
//         {/* Slots for this day */}
//         {slots.length > 0 ? (
//           <View style={styles.slotsList}>
//             {slots.map((slot, index) => (
//               <View key={index} style={styles.slotRow}>
//                 <Text style={styles.slotTime}>
//                   {slot.start} - {slot.end}
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => handleRemoveSlot(selectedDay, index)}
//                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                 >
//                   <MaterialCommunityIcons
//                     name="close-circle-outline"
//                     size={20}
//                     color={COLORS.error}
//                   />
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.noSlotsContainer}>
//             <Text style={styles.noSlotsText}>{tSafe('no_slots_added', 'No time slots added yet.')}</Text>
//           </View>
//         )}
  
//         {/* Save Button */}
//         <TouchableOpacity
//           style={styles.saveButton}
//           onPress={handleSave}
//           disabled={saving}
//         >
//           {saving ? (
//             <ActivityIndicator color="#fff" size="small" />
//           ) : (
//             <Text style={styles.saveButtonText}>{tSafe('save_availability', 'Save Availability')}</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={close_avail_modal}>
//           <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
//         </TouchableOpacity>
//         <Text style={styles.title}>{tSafe('set_availability', 'Set Availability')}</Text>
//         {/* Placeholder for alignment */}
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {!selectedDay ? (
//           <>
//             <Text style={styles.sectionTitle}>{tSafe('select_day', 'Select a Day')}</Text>
//             {renderDayChips()}
//             <Text style={styles.hintText}>{tSafe('tap_day_to_manage', 'Tap a day to manage its time slots.')}</Text>
//           </>
//         ) : (
//           renderSelectedDayContent()
//         )}
//       </ScrollView>

//       {/* Time Picker Modal */}
//       <DatePicker
//         modal
//         open={timePickerVisible.visible}
//         date={timePickerVisible.type === 'start' ? timeStringToDate(startTime) : timeStringToDate(endTime)}
//         mode="time"
//         onConfirm={(date) => {
//           const timeStr = dateToTimeString(date);
//           if (timePickerVisible.type === 'start') {
//             setStartTime(timeStr);
//           } else {
//             setEndTime(timeStr);
//           }
//           setTimePickerVisible({ ...timePickerVisible, visible: false });
//         }}
//         onCancel={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
//         title={timePickerVisible.type === 'start' ? tSafe('select_start_time', 'Select Start Time') : tSafe('select_end_time', 'Select End Time')}
//         confirmText={tSafe('done', 'Done')}
//         cancelText={tSafe('cancel', 'Cancel')}
//         locale="en"
//         minuteInterval={15}
//         is24hourSource="locale"
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     marginTop: Platform.OS === 'ios' ? 0 : 30,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   daysContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//   },
//   dayButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   dayButtonSelected: {
//     backgroundColor: COLORS.primary,
//   },
//   dayText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   dayTextSelected: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   hintText: {
//     fontSize: 14,
//     color: '#999',
//     fontStyle: 'italic',
//     marginTop: 8,
//   },
//   // Selected day styles
//   selectedDayContainer: {
//     marginTop: 8,
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   backButtonText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   selectedDayTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 16,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   timeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//   },
//   timeLabel: {
//     fontSize: 12,
//     color: '#999',
//     marginBottom: 2,
//   },
//   timeValue: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#333',
//   },
//   addButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   slotsList: {
//     marginBottom: 24,
//   },
//   slotRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#fafafa',
//     borderRadius: 8,
//     marginBottom: 6,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//   },
//   slotTime: {
//     fontSize: 15,
//     color: '#333',
//   },
//   noSlotsContainer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   noSlotsText: {
//     fontSize: 14,
//     color: '#999',
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fullDayButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#4CAF50',
//     borderRadius: 8,
//     paddingVertical: 10,
//     marginBottom: 16,
//     gap: 8,
//   },
//   fullDayButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });