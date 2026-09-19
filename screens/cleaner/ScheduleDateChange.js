import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import userService from '../../services/connection/userService';

import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const ScheduleDateChange = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    scheduleId,
    requestId,
    cleanerId,
    oldCleaningDate,
    newCleaningDate,
    propertyName,
    cleaningTime,
    group,
  } = route.params || {};

  const [loading, setLoading] = useState(false);

  // null | available | unavailable
  const [selectedResponse, setSelectedResponse] = useState(null);

  // pending | available | unavailable
  const [responseStatus, setResponseStatus] = useState('pending');
  const [requestStatus, setRequestStatus] = useState('loading');


  

  // ---------------------------------------------------------
  // Format group
  // ---------------------------------------------------------
  const formatGroup = (groupValue) => {
    if (!groupValue) return '';

    return String(groupValue)
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ---------------------------------------------------------
  // Format date
  //
  // IMPORTANT:
  // YYYY-MM-DD is treated as a calendar date.
  // We intentionally do NOT use:
  //
  // new Date("2026-09-15")
  //
  // because JavaScript interprets that as UTC midnight and
  // it can display as September 14 in US timezones.
  // ---------------------------------------------------------
  
  
  const formatDate = (date) => {
    if (!date) {
      return tSafe('na', 'N/A');
    }

    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      const [year, month, day] = date
        .split('-')
        .map(Number);

      const localDate = new Date(
        year,
        month - 1,
        day
      );

      return localDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDateChangeRequest();
    }, [requestId])
  );

  const fetchDateChangeRequest = async () => {
    if (!requestId) {
      console.warn('⚠️ No requestId provided');
      return;
    }
  
    try {
      setLoading(true);
  
      console.log(
        '📅 Fetching date change request:',
        requestId
      );
  
      const response =
        await userService.getDateChangeRequest(requestId);
  
      console.log(
        '✅ Date change request:',
        response?.data
      );
  
      const request = response?.data;
  
      if (!request) {
        console.warn(
          '⚠️ No date change request returned'
        );
        return;
      }
  
      // -------------------------------------------------------
      // Database is the source of truth
      // -------------------------------------------------------
     
      switch (request.status) {
        case 'accepted':
          setSelectedResponse('available');
          setResponseStatus('available');
  
          console.log(
            '✅ Cleaner is AVAILABLE'
          );
          break;
  
        case 'declined':
        case 'rejected':
          setSelectedResponse('unavailable');
          setResponseStatus('unavailable');
  
          console.log(
            '❌ Cleaner is UNAVAILABLE'
          );
          break;
  
        case 'pending':
        case 'open':
          setSelectedResponse(null);
          setResponseStatus('pending');
  
          console.log(
            '⏳ Cleaner has not responded'
          );
          break;
  
        default:
          console.warn(
            '⚠️ Unknown request status:',
            request.status
          );
  
          setSelectedResponse(null);
          setResponseStatus('pending');
      }
  
    } catch (error) {
      console.error(
        '❌ Failed to fetch date change request:',
        error?.response?.data || error
      );
  
      Alert.alert(
        tSafe(
          'unable_to_load',
          'Unable to Load'
        ),
        error?.response?.data?.detail ||
          tSafe(
            'failed_to_fetch_date_change',
            'Unable to load the date change request.'
          )
      );
  
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Submit date change response
  // ---------------------------------------------------------
  const respondToDateChange = async (acceptance) => {
    if (!scheduleId || !requestId || !cleanerId) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'missing_date_change_information',
          'The schedule information is missing. Please reopen the notification and try again.'
        )
      );

      return;
    }

    if (loading) {
      return;
    }

    const selectedStatus =
      acceptance === 1
        ? 'available'
        : 'unavailable';

    console.log(
      '========================================'
    );

    console.log(
      '📅 CLEANING DATE CHANGE RESPONSE'
    );

    console.log(
      '========================================'
    );

    console.log('Schedule ID:', scheduleId);
    console.log('Request ID:', requestId);
    console.log('Cleaner ID:', cleanerId);
    console.log('Old Date:', oldCleaningDate);
    console.log('New Date:', newCleaningDate);
    console.log('Acceptance:', acceptance);
    console.log('Selected Status:', selectedStatus);

    

    // -------------------------------------------------------
    // IMPORTANT:
    //
    // Set the selected response BEFORE calling the API.
    //
    // This guarantees the UI knows what the cleaner selected.
    // -------------------------------------------------------
    setSelectedResponse(selectedStatus);

    setLoading(true);

    try {
      const apiResponse =
        await userService.replyToDateChang({
          scheduleId,
          requestId,
          cleanerId,
          acceptance,
        });

      console.log(
        '✅ DATE CHANGE API RESPONSE:',
        apiResponse
      );

      // -----------------------------------------------------
      // IMPORTANT:
      //
      // We do NOT depend on apiResponse to determine the UI
      // status.
      //
      // The cleaner selected the response locally, so we know
      // exactly what should be displayed.
      // -----------------------------------------------------
      setResponseStatus(selectedStatus);

      console.log(
        '✅ UI RESPONSE STATUS:',
        selectedStatus
      );

    } catch (error) {
      console.error(
        '❌ Error responding to cleaning date change:',
        error?.response?.data || error
      );

      // Reset the UI because the server did not accept
      // the response.
      setSelectedResponse(null);
      setResponseStatus('pending');

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        tSafe(
          'failed_to_respond_to_date_change',
          'Something went wrong while submitting your response. Please try again.'
        );

      Alert.alert(
        tSafe(
          'unable_to_submit',
          'Unable to Submit'
        ),
        message
      );

    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Available button
  // ---------------------------------------------------------
  const handleAvailable = () => {
    Alert.alert(
      tSafe(
        'confirm_availability',
        'Confirm Availability'
      ),
      `${tSafe(
        'available_for_new_date_question',
        'Are you available for this cleaning on'
      )} ${formatDate(newCleaningDate)}${
        cleaningTime
          ? ` ${tSafe('at_time', 'at')} ${cleaningTime}`
          : ''
      }?`,
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
            'yes_im_available',
            "Yes, I'm Available"
          ),
          onPress: () => {
            respondToDateChange(1);
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------
  // Unavailable button
  // ---------------------------------------------------------
  const handleUnavailable = () => {
    Alert.alert(
      tSafe(
        'cant_make_this_date',
        "Can't Make This Date?"
      ),
      tSafe(
        'date_change_unavailable_warning',
        "If you can't make the new date, the host will be notified and may need to find another cleaner."
      ),
      [
        {
          text: tSafe(
            'go_back',
            'Go Back'
          ),
          style: 'cancel',
        },
        {
          text: tSafe(
            'yes_continue',
            'Yes, Continue'
          ),
          style: 'destructive',
          onPress: () => {
            respondToDateChange(0);
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------
  // Render status card
  // ---------------------------------------------------------
  const renderStatusCard = () => {
    const isAvailable =
      responseStatus === 'available';

    return (
      <View
        style={[
          styles.statusCard,
          isAvailable
            ? styles.statusCardAvailable
            : styles.statusCardUnavailable,
        ]}
      >
        {/* Status Icon */}
        <View
          style={[
            styles.statusIconContainer,
            isAvailable
              ? styles.statusIconAvailable
              : styles.statusIconUnavailable,
          ]}
        >
          <Text
            style={[
              styles.statusIcon,
              isAvailable
                ? styles.statusIconAvailableText
                : styles.statusIconUnavailableText,
            ]}
          >
            {isAvailable ? '✓' : '×'}
          </Text>
        </View>

        {/* Status Title */}
        <Text style={styles.statusTitle}>
          {isAvailable
            ? tSafe(
                'date_change_accepted',
                'Date Change Accepted'
              )
            : tSafe(
                'date_change_unavailable',
                'New Date Unavailable'
              )}
        </Text>

        {/* Status Message */}
        <Text style={styles.statusMessage}>
          {isAvailable
            ? tSafe(
                'date_change_accepted_message',
                'You have confirmed that you are available for the new cleaning date. You will remain assigned to this cleaning.'
              )
            : tSafe(
                'date_change_unavailable_message',
                "You've let the host know that you can't make the new cleaning date. The host can now arrange a replacement."
              )}
        </Text>

        {/* Updated Date */}
        <View style={styles.statusDateBox}>
          <Text style={styles.statusDateLabel}>
            {tSafe(
              'updated_cleaning_date',
              'UPDATED CLEANING DATE'
            )}
          </Text>

          <Text style={styles.statusDate}>
            {formatDate(newCleaningDate)}
          </Text>

          {cleaningTime ? (
            <Text style={styles.statusTime}>
              {tSafe('at_time', 'at')}{' '}
              {cleaningTime}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>

          <View
            style={[
              styles.iconContainer,
              responseStatus === 'available'
                ? styles.iconContainerAvailable
                : responseStatus === 'unavailable'
                  ? styles.iconContainerUnavailable
                  : null,
            ]}
          >
            <Text style={styles.calendarIcon}>
              {responseStatus === 'available'
                ? '✓'
                : responseStatus === 'unavailable'
                  ? '×'
                  : '📅'}
            </Text>
          </View>

          <Text style={styles.title}>
            {responseStatus === 'available'
              ? tSafe(
                  'date_change_accepted',
                  'Date Change Accepted'
                )
              : responseStatus === 'unavailable'
                ? tSafe(
                    'date_change_unavailable',
                    'New Date Unavailable'
                  )
                : tSafe(
                    'cleaning_date_changed',
                    'Cleaning Date Changed'
                  )}
          </Text>

          <Text style={styles.subtitle}>
            {responseStatus === 'available'
              ? tSafe(
                  'date_change_accepted_header',
                  'You confirmed that you are available for the updated cleaning date.'
                )
              : responseStatus === 'unavailable'
                ? tSafe(
                    'date_change_unavailable_header',
                    "You've let the host know that you can't make the updated cleaning date."
                  )
                : tSafe(
                    'cleaning_date_changed_description',
                    "The guest's reservation has changed, so the cleaning date has been updated."
                  )}
          </Text>

        </View>

        {/* =====================================================
            CLEANING DETAILS
        ====================================================== */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionLabel}>
              {tSafe(
                'cleaning_details',
                'CLEANING DETAILS'
              )}
            </Text>

            <Text style={styles.propertyName}>
              {propertyName ||
                tSafe(
                  'cleaning',
                  'Cleaning'
                )}
            </Text>

            {group ? (
              <View style={styles.detailRow}>

                <Text style={styles.detailLabel}>
                  {tSafe(
                    'cleaning',
                    'Cleaning'
                  )}
                </Text>

                <Text style={styles.detailValue}>
                  {formatGroup(group)}
                </Text>

              </View>
            ) : null}

            {cleaningTime ? (
              <View style={styles.detailRow}>

                <Text style={styles.detailLabel}>
                  {tSafe(
                    'time',
                    'Time'
                  )}
                </Text>

                <Text style={styles.detailValue}>
                  {cleaningTime}
                </Text>

              </View>
            ) : null}

          </Card.Content>
        </Card>

        {/* =====================================================
            DATE CHANGE
        ====================================================== */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionLabel}>
              {tSafe(
                'date_change',
                'DATE CHANGE'
              )}
            </Text>

            <View style={styles.dateContainer}>

              {/* Previous Date */}
              <View style={styles.dateColumn}>

                <Text style={styles.dateLabel}>
                  {tSafe(
                    'previous_date',
                    'PREVIOUS DATE'
                  )}
                </Text>

                <Text style={styles.oldDate}>
                  {formatDate(
                    oldCleaningDate
                  )}
                </Text>

              </View>

              {/* Arrow */}
              <View style={styles.arrowContainer}>

                <Text style={styles.arrow}>
                  →
                </Text>

              </View>

              {/* New Date */}
              <View style={styles.dateColumn}>

                <Text style={styles.dateLabel}>
                  {tSafe(
                    'new_date',
                    'NEW DATE'
                  )}
                </Text>

                <Text style={styles.newDate}>
                  {formatDate(
                    newCleaningDate
                  )}
                </Text>

              </View>

            </View>

            <Divider style={styles.divider} />

            <Text style={styles.explanation}>
              {responseStatus === 'pending'
                ? tSafe(
                    'confirm_new_cleaning_date',
                    'Please confirm whether you can still complete this cleaning on the new date.'
                  )
                : responseStatus === 'available'
                  ? tSafe(
                      'date_change_confirmed_explanation',
                      'You have confirmed that you can complete this cleaning on the new date.'
                    )
                  : tSafe(
                      'date_change_declined_explanation',
                      "You have indicated that you cannot complete this cleaning on the new date."
                    )}
            </Text>

          </Card.Content>
        </Card>

        {/* =====================================================
            RESPONSE SECTION
        ====================================================== */}

        <View style={styles.responseSection}>

          {responseStatus === 'pending' ? (
            <>
              <Text style={styles.responseTitle}>
                {tSafe(
                  'can_you_make_new_date',
                  'Can you make the new date?'
                )}
              </Text>

              <Text style={styles.responseSubtitle}>
                {tSafe(
                  'response_sent_to_host',
                  'Your response will be sent to the host.'
                )}
              </Text>

              {/* ---------------------------------------------
                  AVAILABLE
              ---------------------------------------------- */}

              <Button
                mode="contained"
                onPress={handleAvailable}
                disabled={loading}
                loading={
                  loading &&
                  selectedResponse === 'available'
                }
                style={
                  styles.availableButton
                }
                contentStyle={
                  styles.buttonContent
                }
                labelStyle={
                  styles.availableButtonLabel
                }
                icon="check"
              >
                {tSafe(
                  'im_available',
                  "I'm Available"
                )}
              </Button>

              {/* ---------------------------------------------
                  UNAVAILABLE
              ---------------------------------------------- */}

              <Button
                mode="outlined"
                onPress={handleUnavailable}
                disabled={loading}
                loading={
                  loading &&
                  selectedResponse === 'unavailable'
                }
                style={
                  styles.unavailableButton
                }
                contentStyle={
                  styles.buttonContent
                }
                labelStyle={
                  styles.unavailableButtonLabel
                }
                icon="close"
              >
                {tSafe(
                  'i_cant_make_this_date',
                  "I Can't Make This Date"
                )}
              </Button>
            </>
          ) : (
            <>
              {/* ---------------------------------------------
                  FINAL RESPONSE STATUS
              ---------------------------------------------- */}

              {renderStatusCard()}
            </>
          )}

        </View>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <View style={styles.infoBox}>

          <Text style={styles.infoTitle}>

            {responseStatus === 'pending'
              ? tSafe(
                  'what_happens_next',
                  'What happens next?'
                )
              : responseStatus === 'available'
                ? tSafe(
                    'confirmed_what_happens_next',
                    'What happens next?'
                  )
                : tSafe(
                    'unavailable_what_happens_next',
                    'What happens next?'
                  )}

          </Text>

          {/* Pending */}
          {responseStatus === 'pending' ? (
            <>
              <Text style={styles.infoText}>
                •{' '}
                {tSafe(
                  'date_change_available_result',
                  "If you're available, you'll remain assigned to this cleaning."
                )}
              </Text>

              <Text style={styles.infoText}>
                •{' '}
                {tSafe(
                  'date_change_unavailable_result',
                  "If you're unavailable, the host will be notified."
                )}
              </Text>

              <Text style={styles.infoText}>
                •{' '}
                {tSafe(
                  'date_change_replacement_result',
                  'The host can then choose another cleaner for the cleaning.'
                )}
              </Text>
            </>
          ) : responseStatus === 'available' ? (

            /* Available */
            <>
              <Text style={styles.infoText}>
                ✓{' '}
                {tSafe(
                  'date_change_accepted_next_step',
                  'The host has been notified that you are available for the new cleaning date.'
                )}
              </Text>

              <Text style={styles.infoText}>
                •{' '}
                {tSafe(
                  'date_change_accepted_assignment',
                  'You will remain assigned to this cleaning.'
                )}
              </Text>
            </>

          ) : (

            /* Unavailable */
            <>
              <Text style={styles.infoText}>
                •{' '}
                {tSafe(
                  'date_change_unavailable_next_step',
                  'The host has been notified that you are unavailable.'
                )}
              </Text>

              <Text style={styles.infoText}>
                •{' '}
                {tSafe(
                  'date_change_replacement_result',
                  'The host can now arrange another cleaner for the new date.'
                )}
              </Text>
            </>

          )}

        </View>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              {tSafe(
                'submitting_response',
                'Submitting your response...'
              )}
            </Text>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleDateChange;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  // =========================================================
  // Header
  // =========================================================

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  iconContainerAvailable: {
    backgroundColor: '#d9f3e2',
  },

  iconContainerUnavailable: {
    backgroundColor: '#f8dddd',
  },

  calendarIcon: {
    fontSize: 34,
    fontWeight: '700',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
    maxWidth: 350,
  },

  // =========================================================
  // Cards
  // =========================================================

  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',

    borderWidth: 0,
    borderColor: '#F0F2F4',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.01,
    shadowRadius: 1,

    elevation: 1,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#888',
    marginBottom: 10,
  },

  propertyName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  detailLabel: {
    fontSize: 14,
    color: '#777',
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    maxWidth: '65%',
    textAlign: 'right',
  },

  // =========================================================
  // Date Change
  // =========================================================

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  dateColumn: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#888',
    marginBottom: 6,
  },

  oldDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    lineHeight: 21,
  },

  newDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 21,
  },

  arrowContainer: {
    paddingHorizontal: 12,
  },

  arrow: {
    fontSize: 25,
    color: '#999',
  },

  divider: {
    marginVertical: 15,
  },

  explanation: {
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },

  // =========================================================
  // Response
  // =========================================================

  responseSection: {
    marginTop: 8,
    marginBottom: 20,
  },

  responseTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
    marginBottom: 5,
  },

  responseSubtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
  },

  availableButton: {
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: COLORS.primary,
  },

  unavailableButton: {
    borderRadius: 10,
    borderColor: COLORS.error,
  },

  buttonContent: {
    height: 52,
  },

  availableButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  unavailableButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },

  // =========================================================
  // Status Card
  // =========================================================

  statusCard: {
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
  },

  statusCardAvailable: {
    backgroundColor: '#f1fbf5',
    borderColor: '#a9dfbc',
  },

  statusCardUnavailable: {
    backgroundColor: '#fff5f5',
    borderColor: '#edb5b5',
  },

  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  statusIconAvailable: {
    backgroundColor: '#d9f3e2',
  },

  statusIconUnavailable: {
    backgroundColor: '#f8dddd',
  },

  statusIcon: {
    fontSize: 34,
    fontWeight: '700',
  },

  statusIconAvailableText: {
    color: '#218739',
  },

  statusIconUnavailableText: {
    color: '#c62828',
  },

  statusTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },

  statusMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: '#555',
    textAlign: 'center',
    marginBottom: 18,
  },

  statusDateBox: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 14,
    alignItems: 'center',
  },

  statusDateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#888',
    marginBottom: 5,
  },

  statusDate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  statusTime: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },

  // =========================================================
  // Information
  // =========================================================

  infoBox: {
    backgroundColor: '#eef9fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#555',
    marginBottom: 5,
  },

  // =========================================================
  // Loading
  // =========================================================

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#777',
  },
});




// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { Button, Card, Divider } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import userService from "../../services/connection/userService";

// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const ScheduleDateChange = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const {
//     scheduleId,
//     requestId,
//     cleanerId,
//     oldCleaningDate,
//     newCleaningDate,
//     propertyName,
//     cleaningTime,
//     group,
//   } = route.params || {};

//   const [loading, setLoading] = useState(false);
//   const [selectedResponse, setSelectedResponse] = useState(null);


//     const formatGroup = (group) => {
//         if (!group) return '';
//         return group
//             .replace(/[_-]+/g, ' ')
//             .trim()
//             .replace(/\b\w/g, char => char.toUpperCase());
//         };

    

//   const formatDate = (date) => {
//     if (!date) {
//       return tSafe('na', 'N/A');
//     }

//     const parsed = new Date(date);

//     if (Number.isNaN(parsed.getTime())) {
//       return date;
//     }

//     return parsed.toLocaleDateString('en-US', {
//       weekday: 'short',
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const respondToDateChange = async (acceptance) => {
//     if (!scheduleId || !requestId || !cleanerId) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe(
//           'missing_date_change_information',
//           'The schedule information is missing. Please reopen the notification and try again.'
//         )
//       );
//       return;
//     }

//     if (loading) return;

//     setSelectedResponse(
//       acceptance === 1 ? 'available' : 'unavailable'
//     );

//     setLoading(true);

//     // const data = {
//     //     scheduleId:scheduleId,
//     //     requestId:requestId,
//     //     cleanerId:cleanerId,
//     //     acceptance: acceptance,
//     // }
//     // console.log(data)
//     try {
//       await userService.replyToDateChang({
//         scheduleId,
//         requestId,
//         cleanerId,
//         acceptance,
//     })

//       if (acceptance === 1) {
//         Alert.alert(
//           tSafe('availability_confirmed', 'Availability Confirmed'),
//           tSafe(
//             'date_change_available_confirmation',
//             'You have confirmed that you are available for the new cleaning date.'
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           tSafe('response_submitted', 'Response Submitted'),
//           tSafe(
//             'date_change_unavailable_confirmation',
//             "We've let the host know that you can't make the new cleaning date. The host can now arrange a replacement."
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       }
//     } catch (error) {
//       console.error(
//         'Error responding to cleaning date change:',
//         error?.response?.data || error
//       );

//       setSelectedResponse(null);

//       const message =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         tSafe(
//           'failed_to_respond_to_date_change',
//           'Something went wrong while submitting your response. Please try again.'
//         );

//       Alert.alert(
//         tSafe('unable_to_submit', 'Unable to Submit'),
//         message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAvailable = () => {
//     Alert.alert(
//       tSafe('confirm_availability', 'Confirm Availability'),
//       `${tSafe(
//         'available_for_new_date_question',
//         "Are you available for this cleaning on"
//       )} ${formatDate(newCleaningDate)}${
//         cleaningTime
//           ? ` ${tSafe('at_time', 'at')} ${cleaningTime}`
//           : ''
//       }?`,
//       [
//         {
//           text: tSafe('cancel', 'Cancel'),
//           style: 'cancel',
//         },
//         {
//           text: tSafe(
//             'yes_im_available',
//             "Yes, I'm Available"
//           ),
//           onPress: () => respondToDateChange(1),
//         },
//       ]
//     );
//   };

//   const handleUnavailable = () => {
//     Alert.alert(
//       tSafe(
//         'cant_make_this_date',
//         "Can't Make This Date?"
//       ),
//       tSafe(
//         'date_change_unavailable_warning',
//         "If you can't make the new date, the host will be notified and may need to find another cleaner."
//       ),
//       [
//         {
//           text: tSafe('go_back', 'Go Back'),
//           style: 'cancel',
//         },
//         {
//           text: tSafe(
//             'yes_continue',
//             'Yes, Continue'
//           ),
//           style: 'destructive',
//           onPress: () => respondToDateChange(0),
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.iconContainer}>
//             <Text style={styles.calendarIcon}>📅</Text>
//           </View>

//           <Text style={styles.title}>
//             {tSafe(
//               'cleaning_date_changed',
//               'Cleaning Date Changed'
//             )}
//           </Text>

//           <Text style={styles.subtitle}>
//             {tSafe(
//               'cleaning_date_changed_description',
//               "The guest's reservation has changed, so the cleaning date has been updated."
//             )}
//           </Text>
//         </View>

//         {/* Cleaning Details */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               {tSafe(
//                 'cleaning_details',
//                 'CLEANING DETAILS'
//               )}
//             </Text>

//             <Text style={styles.propertyName}>
//               {propertyName ||
//                 tSafe('cleaning', 'Cleaning')}
//             </Text>

//             {group ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   {tSafe('cleaning', 'Cleaning')}
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {formatGroup(group)}
//                 </Text>
//               </View>
//             ) : null}

//             {cleaningTime ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   {tSafe('time', 'Time')}
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {cleaningTime}
//                 </Text>
//               </View>
//             ) : null}
//           </Card.Content>
//         </Card>

//         {/* Date Change */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               {tSafe(
//                 'date_change',
//                 'DATE CHANGE'
//               )}
//             </Text>

//             <View style={styles.dateContainer}>
//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   {tSafe(
//                     'previous_date',
//                     'PREVIOUS DATE'
//                   )}
//                 </Text>

//                 <Text style={styles.oldDate}>
//                   {formatDate(oldCleaningDate)}
//                 </Text>
//               </View>

//               <View style={styles.arrowContainer}>
//                 <Text style={styles.arrow}>→</Text>
//               </View>

//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   {tSafe(
//                     'new_date',
//                     'NEW DATE'
//                   )}
//                 </Text>

//                 <Text style={styles.newDate}>
//                   {formatDate(newCleaningDate)}
//                 </Text>
//               </View>
//             </View>

//             <Divider style={styles.divider} />

//             <Text style={styles.explanation}>
//               {tSafe(
//                 'confirm_new_cleaning_date',
//                 'Please confirm whether you can still complete this cleaning on the new date.'
//               )}
//             </Text>
//           </Card.Content>
//         </Card>

//         {/* Response */}
//         <View style={styles.responseSection}>
//           <Text style={styles.responseTitle}>
//             {tSafe(
//               'can_you_make_new_date',
//               'Can you make the new date?'
//             )}
//           </Text>

//           <Text style={styles.responseSubtitle}>
//             {tSafe(
//               'response_sent_to_host',
//               'Your response will be sent to the host.'
//             )}
//           </Text>

//           {/* Available */}
//           <Button
//             mode="contained"
//             onPress={handleAvailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === 'available'
//             }
//             style={styles.availableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.availableButtonLabel}
//           >
//             {tSafe(
//               'im_available',
//               "I'm Available"
//             )}
//           </Button>

//           {/* Unavailable */}
//           <Button
//             mode="outlined"
//             onPress={handleUnavailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === 'unavailable'
//             }
//             style={styles.unavailableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.unavailableButtonLabel}
//           >
//             {tSafe(
//               'i_cant_make_this_date',
//               "I Can't Make This Date"
//             )}
//           </Button>
//         </View>

//         {/* Information */}
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>
//             {tSafe(
//               'what_happens_next',
//               'What happens next?'
//             )}
//           </Text>

//           <Text style={styles.infoText}>
//             •{' '}
//             {tSafe(
//               'date_change_available_result',
//               "If you're available, you'll remain assigned to this cleaning."
//             )}
//           </Text>

//           <Text style={styles.infoText}>
//             •{' '}
//             {tSafe(
//               'date_change_unavailable_result',
//               "If you're unavailable, the host will be notified."
//             )}
//           </Text>

//           <Text style={styles.infoText}>
//             •{' '}
//             {tSafe(
//               'date_change_replacement_result',
//               'The host can then choose another cleaner for the cleaning.'
//             )}
//           </Text>
//         </View>

//         {/* Loading */}
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator
//               size="small"
//               color={COLORS.primary}
//             />

//             <Text style={styles.loadingText}>
//               {tSafe(
//                 'submitting_response',
//                 'Submitting your response...'
//               )}
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ScheduleDateChange;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },

//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   header: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },

//   iconContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: '#e8f8ff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 14,
//   },

//   calendarIcon: {
//     fontSize: 34,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#222',
//     textAlign: 'center',
//     marginBottom: 8,
//   },

//   subtitle: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: '#666',
//     textAlign: 'center',
//     maxWidth: 350,
//   },

//   card: {
//     marginBottom: 16,
//     borderRadius: 16,
//     backgroundColor: '#fff',
  
//     // Softer border
//     borderWidth: 0,
//     borderColor: '#F0F2F4',
  
//     // Very subtle shadow
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.01,
//     shadowRadius: 1,
  
//     // Android
//     elevation: 1,
//   },

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     letterSpacing: 1,
//     color: '#888',
//     marginBottom: 10,
//   },

//   propertyName: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 14,
//   },

//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 7,
//   },

//   detailLabel: {
//     fontSize: 14,
//     color: '#777',
//   },

//   detailValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     maxWidth: '65%',
//     textAlign: 'right',
//   },

//   dateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//   },

//   dateColumn: {
//     flex: 1,
//   },

//   dateLabel: {
//     fontSize: 10,
//     fontWeight: '700',
//     letterSpacing: 0.7,
//     color: '#888',
//     marginBottom: 6,
//   },

//   oldDate: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#666',
//     lineHeight: 21,
//   },

//   newDate: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.primary,
//     lineHeight: 21,
//   },

//   arrowContainer: {
//     paddingHorizontal: 12,
//   },

//   arrow: {
//     fontSize: 25,
//     color: '#999',
//   },

//   divider: {
//     marginVertical: 15,
//   },

//   explanation: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#666',
//   },

//   responseSection: {
//     marginTop: 8,
//     marginBottom: 20,
//   },

//   responseTitle: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 5,
//   },

//   responseSubtitle: {
//     fontSize: 14,
//     color: '#777',
//     marginBottom: 16,
//   },

//   availableButton: {
//     borderRadius: 10,
//     marginBottom: 12,
//     backgroundColor: COLORS.primary,
//   },

//   unavailableButton: {
//     borderRadius: 10,
//     borderColor: COLORS.error,
//   },

//   buttonContent: {
//     height: 52,
//   },

//   availableButtonLabel: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#fff',
//   },

//   unavailableButtonLabel: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.error,
//   },

//   infoBox: {
//     backgroundColor: '#eef9fd',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//   },

//   infoTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#333',
//     marginBottom: 10,
//   },

//   infoText: {
//     fontSize: 13,
//     lineHeight: 20,
//     color: '#555',
//     marginBottom: 5,
//   },

//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 8,
//   },

//   loadingText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: '#777',
//   },
// });





















// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Button, Card, Divider } from "react-native-paper";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import userService from "../../services/connection/userService";


// const ScheduleDateChange = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const {
//     scheduleId,
//     requestId,
//     cleanerId,
//     oldCleaningDate,
//     newCleaningDate,
//     propertyName,
//     cleaningTime,
//     group,
//   } = route.params || {};

//   const [loading, setLoading] = useState(false);
//   const [selectedResponse, setSelectedResponse] = useState(null);

//   const formatDate = (date) => {
//     if (!date) return "—";

//     const parsed = new Date(date);

//     if (Number.isNaN(parsed.getTime())) {
//       return date;
//     }

//     return parsed.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const respondToDateChange = async (acceptance) => {
//     if (!scheduleId || !requestId || !cleanerId) {
//       Alert.alert(
//         "Unable to Respond",
//         "The schedule information is missing. Please reopen the notification and try again."
//       );
//       return;
//     }

//     if (loading) return;

//     setSelectedResponse(
//       acceptance === 1 ? "available" : "unavailable"
//     );

//     setLoading(true);

//     try {
//     //   await axios.post(
//     //     `${API_BASE_URL}/api/schedules/respond_to_date_change`,
//     //     {
//     //       scheduleId,
//     //       requestId,
//     //       cleanerId,
//     //       acceptance,
//     //     }
//     //   );

//       await userService.replyToDateChang({
//         scheduleId,
//         requestId,
//         cleanerId,
//         acceptance,
//       })

//       if (acceptance === 1) {
//         Alert.alert(
//           "Availability Confirmed",
//           "You have confirmed that you are available for the new cleaning date.",
//           [
//             {
//               text: "OK",
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           "Response Submitted",
//           "We've let the host know that you can't make the new cleaning date. The host can now arrange a replacement.",
//           [
//             {
//               text: "OK",
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Error responding to cleaning date change:",
//         error?.response?.data || error
//       );

//       setSelectedResponse(null);

//       const message =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         "Something went wrong while submitting your response. Please try again.";

//       Alert.alert("Unable to Submit", message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAvailable = () => {
//     Alert.alert(
//       "Confirm Availability",
//       `Are you available for this cleaning on ${formatDate(
//         newCleaningDate
//       )}${cleaningTime ? ` at ${cleaningTime}` : ""}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Yes, I'm Available",
//           onPress: () => respondToDateChange(1),
//         },
//       ]
//     );
//   };

//   const handleUnavailable = () => {
//     Alert.alert(
//       "Can't Make This Date?",
//       "If you can't make the new date, the host will be notified and may need to find another cleaner.",
//       [
//         {
//           text: "Go Back",
//           style: "cancel",
//         },
//         {
//           text: "Yes, Continue",
//           style: "destructive",
//           onPress: () => respondToDateChange(0),
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.iconContainer}>
//             <Text style={styles.calendarIcon}>📅</Text>
//           </View>

//           <Text style={styles.title}>
//             Cleaning Date Changed
//           </Text>

//           <Text style={styles.subtitle}>
//             The guest's reservation has changed, so the cleaning
//             date has been updated.
//           </Text>
//         </View>

//         {/* Property Details */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               CLEANING DETAILS
//             </Text>

//             <Text style={styles.propertyName}>
//               {propertyName || "Cleaning"}
//             </Text>

//             {group ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   Cleaning
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {group}
//                 </Text>
//               </View>
//             ) : null}

//             {cleaningTime ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   Time
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {cleaningTime}
//                 </Text>
//               </View>
//             ) : null}
//           </Card.Content>
//         </Card>

//         {/* Date Change */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               DATE CHANGE
//             </Text>

//             <View style={styles.dateContainer}>
//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   PREVIOUS DATE
//                 </Text>

//                 <Text style={styles.oldDate}>
//                   {formatDate(oldCleaningDate)}
//                 </Text>
//               </View>

//               <View style={styles.arrowContainer}>
//                 <Text style={styles.arrow}>
//                   →
//                 </Text>
//               </View>

//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   NEW DATE
//                 </Text>

//                 <Text style={styles.newDate}>
//                   {formatDate(newCleaningDate)}
//                 </Text>
//               </View>
//             </View>

//             <Divider style={styles.divider} />

//             <Text style={styles.explanation}>
//               Please confirm whether you can still complete
//               this cleaning on the new date.
//             </Text>
//           </Card.Content>
//         </Card>

//         {/* Response */}
//         <View style={styles.responseSection}>
//           <Text style={styles.responseTitle}>
//             Can you make the new date?
//           </Text>

//           <Text style={styles.responseSubtitle}>
//             Your response will be sent to the host.
//           </Text>

//           {/* Available */}
//           <Button
//             mode="contained"
//             onPress={handleAvailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === "available"
//             }
//             style={styles.availableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.availableButtonLabel}
//           >
//             I'm Available
//           </Button>

//           {/* Unavailable */}
//           <Button
//             mode="outlined"
//             onPress={handleUnavailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === "unavailable"
//             }
//             style={styles.unavailableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.unavailableButtonLabel}
//           >
//             I Can't Make This Date
//           </Button>
//         </View>

//         {/* Information */}
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>
//             What happens next?
//           </Text>

//           <Text style={styles.infoText}>
//             • If you're available, you'll remain assigned
//             to this cleaning.
//           </Text>

//           <Text style={styles.infoText}>
//             • If you're unavailable, the host will be
//             notified.
//           </Text>

//           <Text style={styles.infoText}>
//             • The host can then choose another cleaner
//             for the cleaning.
//           </Text>
//         </View>

//         {/* Loading */}
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="small" />

//             <Text style={styles.loadingText}>
//               Submitting your response...
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ScheduleDateChange;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#f9f9f9",
//   },

//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   header: {
//     alignItems: "center",
//     marginBottom: 24,
//   },

//   iconContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "#e8f8ff",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 14,
//   },

//   calendarIcon: {
//     fontSize: 34,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#222",
//     textAlign: "center",
//     marginBottom: 8,
//   },

//   subtitle: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: "#666",
//     textAlign: "center",
//     maxWidth: 350,
//   },

//   card: {
//     marginBottom: 16,
//     borderRadius: 14,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     letterSpacing: 1,
//     color: "#888",
//     marginBottom: 10,
//   },

//   propertyName: {
//     fontSize: 19,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 14,
//   },

//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 7,
//   },

//   detailLabel: {
//     fontSize: 14,
//     color: "#777",
//   },

//   detailValue: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     maxWidth: "65%",
//     textAlign: "right",
//   },

//   dateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//   },

//   dateColumn: {
//     flex: 1,
//   },

//   dateLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.7,
//     color: "#888",
//     marginBottom: 6,
//   },

//   oldDate: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#666",
//     lineHeight: 21,
//   },

//   newDate: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#00BFFF",
//     lineHeight: 21,
//   },

//   arrowContainer: {
//     paddingHorizontal: 12,
//   },

//   arrow: {
//     fontSize: 25,
//     color: "#999",
//   },

//   divider: {
//     marginVertical: 15,
//   },

//   explanation: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: "#666",
//   },

//   responseSection: {
//     marginTop: 8,
//     marginBottom: 20,
//   },

//   responseTitle: {
//     fontSize: 19,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 5,
//   },

//   responseSubtitle: {
//     fontSize: 14,
//     color: "#777",
//     marginBottom: 16,
//   },

//   availableButton: {
//     borderRadius: 10,
//     marginBottom: 12,
//     backgroundColor: "#00BFFF",
//   },

//   unavailableButton: {
//     borderRadius: 10,
//     borderColor: "#d9534f",
//   },

//   buttonContent: {
//     height: 52,
//   },

//   availableButtonLabel: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#fff",
//   },

//   unavailableButtonLabel: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#d9534f",
//   },

//   infoBox: {
//     backgroundColor: "#eef9fd",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//   },

//   infoTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 10,
//   },

//   infoText: {
//     fontSize: 13,
//     lineHeight: 20,
//     color: "#555",
//     marginBottom: 5,
//   },

//   loadingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 8,
//   },

//   loadingText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: "#777",
//   },
// });