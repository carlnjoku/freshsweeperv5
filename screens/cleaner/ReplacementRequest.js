import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  Linking,
  Alert,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';

import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';

import CustomCard from '../../components/shared/CustomCard';
import CleaningSummary from './CleaningSummary';

import moment from 'moment';
import calculateDistance from '../../utils/calculateDistance';
import { getCityState } from '../../utils/getAddressFromCoordinates';
import { MAP_BOX_SECRET_KEY } from '../../env';
import { tSafe } from '../../utils/tSafe';

export default function ReplacementRequest({ route }) {
  const navigation = useNavigation();

  const scrollViewRef = useRef(null);
  const taskDetailsY = useRef(0);

  // ---------------------------------------------------------
  // Route params
  // ---------------------------------------------------------

  const {
    requestId,
    scheduleId,
    cleanerId,

    oldCleaningDate,
    newCleaningDate,

    propertyName,
    cleaningTime,
    group,

    // Replacement information
    replacedCleanerId,
    replacedCleanerName,
    replacementFee: routeReplacementFee,
  } = route?.params || {};

  // ---------------------------------------------------------
  // Auth
  // ---------------------------------------------------------

  const {
    geolocationData,
    currentUserId,
    currentUser,
  } = useContext(AuthContext);

  const effectiveCleanerId =
    cleanerId || currentUserId;

  // ---------------------------------------------------------
  // Schedule state
  // ---------------------------------------------------------

  const [schedule, setSchedule] = useState({});
  const [checklist, setChecklist] = useState({});
  const [assignedTo, setAssignedTo] = useState([]);

  const [cleaningDate, setCleaningDate] =
    useState(newCleaningDate || '');

  const [cleaningStartTime, setCleaningStartTime] =
    useState(cleaningTime || '');

  const [cleaningEndTime, setCleaningEndTime] =
    useState('');

  // ---------------------------------------------------------
  // Location state
  // ---------------------------------------------------------

  const [apartmentLat, setApartmentLatitude] =
    useState('');

  const [apartmentLng, setApartmentLongitude] =
    useState('');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [apartmentName, setApartmentName] =
    useState(propertyName || '');

  const [distance, setDistance] = useState(0);

  // ---------------------------------------------------------
  // Replacement state
  // ---------------------------------------------------------

  const [replacementFee, setReplacementFee] =
    useState(
      routeReplacementFee !== undefined &&
        routeReplacementFee !== null
        ? Number(routeReplacementFee)
        : null
    );

  const [originalCleaner, setOriginalCleaner] =
    useState({
      cleanerId: replacedCleanerId || null,
      name:
        replacedCleanerName ||
        '',
    });

  // ---------------------------------------------------------
  // Loading / response state
  // ---------------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [responding, setResponding] =
    useState(false);

  const [requestStatus, setRequestStatus] =
    useState('pending');

  // ---------------------------------------------------------
  // Map state
  // ---------------------------------------------------------

  const [mapImageUrl, setMapImageUrl] =
    useState(null);

  const [mapError, setMapError] =
    useState(false);

  // ---------------------------------------------------------
  // Fetch schedule
  // ---------------------------------------------------------

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      if (!scheduleId) {
        throw new Error(
          tSafe(
            'missing_schedule_id',
            'Missing schedule information.'
          )
        );
      }

      const response =
        await userService.getScheduleById(
          scheduleId
        );

      const res =
        response?.data || {};

      setSchedule(res);

      // -----------------------------------------------------
      // Checklist
      // -----------------------------------------------------

      setChecklist(
        res?.overall_checklist?.checklist ||
          {}
      );

      // -----------------------------------------------------
      // Assigned cleaners
      // -----------------------------------------------------

      const assignments =
        Array.isArray(res?.assignedTo)
          ? res.assignedTo
          : [];

      setAssignedTo(assignments);

      // -----------------------------------------------------
      // Schedule data
      // -----------------------------------------------------

      const scheduleData =
        res?.schedule || {};

      const date =
        scheduleData?.cleaning_date ||
        newCleaningDate ||
        '';

      const startTime =
        scheduleData?.cleaning_time ||
        cleaningTime ||
        '';

      const endTime =
        scheduleData?.cleaning_end_time ||
        '';

      setCleaningDate(date);
      setCleaningStartTime(startTime);
      setCleaningEndTime(endTime);

      // -----------------------------------------------------
      // Property location
      // -----------------------------------------------------

      const lat =
        scheduleData?.apartment_latitude;

      const lng =
        scheduleData?.apartment_longitude;

      if (lat !== undefined && lat !== null &&
          lng !== undefined && lng !== null) {

        setApartmentLatitude(lat);
        setApartmentLongitude(lng);

        const coordinate = {
          latitude: Number(lat),
          longitude: Number(lng),
        };

        // ---------------------------------------------------
        // City / state
        // ---------------------------------------------------

        try {
          const locationResult =
            await getCityState(
              coordinate
            );

          if (locationResult) {
            setCity(
              locationResult.city || ''
            );

            setState(
              locationResult.state || ''
            );
          }
        } catch (locationError) {
          console.log(
            'Location lookup error:',
            locationError
          );
        }

        // ---------------------------------------------------
        // Distance
        // ---------------------------------------------------

        if (
          geolocationData?.latitude !==
            undefined &&
          geolocationData?.longitude !==
            undefined
        ) {
          const dist =
            calculateDistance(
              geolocationData.latitude,
              geolocationData.longitude,
              Number(lat),
              Number(lng)
            );

          setDistance(dist);
        }
      }

      // -----------------------------------------------------
      // Property name
      // -----------------------------------------------------

      setApartmentName(
        scheduleData?.apartment_name ||
          propertyName ||
          ''
      );

      // -----------------------------------------------------
      // Find cleaner being replaced
      // -----------------------------------------------------

      let replacementAssignment = null;

      // First try explicit cleaner ID
      if (replacedCleanerId) {
        replacementAssignment =
          assignments.find(
            assignment =>
              String(
                assignment?.cleanerId
              ) ===
              String(
                replacedCleanerId
              )
          );
      }

      // Then try group + replacement status
      if (
        !replacementAssignment &&
        group
      ) {
        replacementAssignment =
          assignments.find(
            assignment =>
              assignment?.group ===
                group &&
              assignment?.status ===
                'replacement_required'
          );
      }

      // Final fallback: group
      if (
        !replacementAssignment &&
        group
      ) {
        replacementAssignment =
          assignments.find(
            assignment =>
              assignment?.group ===
              group
          );
      }

      if (replacementAssignment) {
        // ---------------------------------------------------
        // Original cleaner
        // ---------------------------------------------------

        const originalCleanerId =
          replacementAssignment?.cleanerId;

        const firstName =
          replacementAssignment?.firstname ||
          '';

        const lastName =
          replacementAssignment?.lastname ||
          '';

        const fullName =
          `${firstName} ${lastName}`.trim();

        setOriginalCleaner({
          cleanerId:
            originalCleanerId ||
            replacedCleanerId ||
            null,

          name:
            fullName ||
            replacedCleanerName ||
            tSafe(
              'previously_assigned_cleaner',
              'Previously assigned cleaner'
            ),
        });

        // ---------------------------------------------------
        // Replacement cleaner earnings
        //
        // Your actual MongoDB structure:
        //
        // assignedTo[].checklist.calculatedPrice
        //
        // fallback:
        // assignedTo[].checklist.price
        // ---------------------------------------------------

        const assignmentChecklist =
          replacementAssignment?.checklist ||
          {};

        const assignmentFee =
          assignmentChecklist?.calculatedPrice ??
          assignmentChecklist?.price;

        if (
          assignmentFee !== undefined &&
          assignmentFee !== null
        ) {
          const numericFee =
            Number(assignmentFee);

          if (
            !Number.isNaN(
              numericFee
            )
          ) {
            setReplacementFee(
              numericFee
            );
          }
        }
      }

    } catch (error) {
      console.error(
        'Failed to fetch replacement schedule:',
        error
      );

      Alert.alert(
        tSafe(
          'error',
          'Error'
        ),
        tSafe(
          'unable_to_load_replacement_request',
          'Unable to load the replacement request.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Map
  // ---------------------------------------------------------

  useEffect(() => {
    if (
      apartmentLat !== '' &&
      apartmentLng !== ''
    ) {
      const url =
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
        `pin-s+ff0000(${apartmentLng},${apartmentLat})/` +
        `${apartmentLng},${apartmentLat},15,0/400x200` +
        `?access_token=${MAP_BOX_SECRET_KEY}`;

      setMapImageUrl(url);
      setMapError(false);
    }
  }, [
    apartmentLat,
    apartmentLng,
  ]);

  // ---------------------------------------------------------
  // Directions
  // ---------------------------------------------------------

  const handleOpenDirections = () => {
    if (
      !apartmentLat ||
      !apartmentLng
    ) {
      Alert.alert(
        tSafe(
          'location_unavailable',
          'Location unavailable'
        ),
        tSafe(
          'directions_unavailable',
          'Directions are not available for this property.'
        )
      );

      return;
    }

    const originLat =
      currentUser?.location?.latitude ||
      geolocationData?.latitude;

    const originLng =
      currentUser?.location?.longitude ||
      geolocationData?.longitude;

    if (
      originLat === undefined ||
      originLat === null ||
      originLng === undefined ||
      originLng === null
    ) {
      const url =
        `https://www.google.com/maps/search/?api=1` +
        `&query=${apartmentLat},${apartmentLng}`;

      Linking.openURL(url).catch(() => {
        Alert.alert(
          tSafe(
            'error',
            'Error'
          ),
          tSafe(
            'unable_to_open_maps',
            'Unable to open directions.'
          )
        );
      });

      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${originLat},${originLng}` +
      `&destination=${apartmentLat},${apartmentLng}` +
      `&travelmode=driving`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        tSafe(
          'error',
          'Error'
        ),
        tSafe(
          'unable_to_open_maps',
          'Unable to open directions.'
        )
      );
    });
  };

  // ---------------------------------------------------------
  // Scroll to task details
  // ---------------------------------------------------------

  const handleViewTaskDetails = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(
        taskDetailsY.current - 15,
        0
      ),
      animated: true,
    });
  };

  // ---------------------------------------------------------
  // Format helpers
  // ---------------------------------------------------------

  const formatGroup = groupValue => {
    if (!groupValue) {
      return '';
    }

    return groupValue
      .split('_')
      .map(
        word =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  };

  const formatDate = date => {
    if (!date) {
      return '';
    }

    // Prevent timezone shifting for YYYY-MM-DD
    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        date
      )
    ) {
      const [
        year,
        month,
        day,
      ] = date
        .split('-')
        .map(Number);

      return moment(
        [
          year,
          month - 1,
          day,
        ]
      ).format(
        'ddd, MMM D, YYYY'
      );
    }

    return moment(date).format(
      'ddd, MMM D, YYYY'
    );
  };

  const formatTime = time => {
    if (!time) {
      return '';
    }

    const parsed =
      moment(
        time,
        [
          'HH:mm:ss',
          'HH:mm',
          'h:mm:ss A',
          'h:mm A',
        ],
        true
      );

    return parsed.isValid()
      ? parsed.format(
          'h:mm A'
        )
      : time;
  };

  // ---------------------------------------------------------
  // Format money
  // ---------------------------------------------------------

  const formatMoney = amount => {
    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(
        Number(amount)
      )
    ) {
      return null;
    }

    return `$${Number(amount).toFixed(2)}`;
  };

  // ---------------------------------------------------------
  // Replacement response
  // ---------------------------------------------------------

  const submitResponse = async (
    acceptance
  ) => {
    if (responding) {
      return;
    }

    try {
      setResponding(true);

      const data = {
        scheduleId:
          String(scheduleId),

        // IMPORTANT:
        // This must be the child replacement
        // request ID.
        requestId:
          String(requestId),

        cleanerId:
          String(
            effectiveCleanerId
          ),

        acceptance,
      };

      console.log(
        '🔄 Replacement response:',
        data
      );

      const response =
        await userService.respondToReplacementRequest(
          data
        );

      console.log(
        '✅ Replacement response result:',
        response?.data
      );

      setRequestStatus(
        response?.data?.status ||
          (
            acceptance
              ? 'accepted'
              : 'declined'
          )
      );

      if (acceptance) {
        Alert.alert(
          tSafe(
            'replacement_request_accepted_title',
            'Request Accepted'
          ),
          tSafe(
            'replacement_request_accepted_message',
            'You have indicated that you are available for this replacement cleaning. The host will review the available cleaners and make the final selection.'
          ),
          [
            {
              text: tSafe(
                'continue',
                'Continue'
              ),

              onPress: () => {
                navigation.navigate(
                  ROUTES.cleaner_dashboard
                );
              },
            },
          ]
        );
      } else {
        Alert.alert(
          tSafe(
            'replacement_request_declined_title',
            'Request Declined'
          ),
          tSafe(
            'replacement_request_declined_message',
            'You have declined this replacement cleaning request.'
          ),
          [
            {
              text: tSafe(
                'ok',
                'OK'
              ),

              onPress: () => {
                navigation.navigate(
                  ROUTES.cleaner_dashboard
                );
              },
            },
          ]
        );
      }

    } catch (error) {
      console.error(
        '❌ Replacement response failed:',
        error
      );

      Alert.alert(
        tSafe(
          'error',
          'Error'
        ),
        error?.response?.data?.detail ||
          tSafe(
            'replacement_response_failed',
            'We could not submit your response. Please try again.'
          )
      );
    } finally {
      setResponding(false);
    }
  };

  // ---------------------------------------------------------
  // Accept confirmation
  // ---------------------------------------------------------

  const handleAccept = () => {
    if (
      requestStatus !==
      'pending'
    ) {
      return;
    }

    Alert.alert(
      tSafe(
        'accept_replacement_title',
        'Accept Replacement Cleaning'
      ),
      tSafe(
        'accept_replacement_message',
        'Are you sure you want to indicate that you are available for this replacement cleaning?'
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
            'accept',
            'Accept'
          ),

          onPress: () =>
            submitResponse(
              true
            ),
        },
      ]
    );
  };

  // ---------------------------------------------------------
  // Decline confirmation
  // ---------------------------------------------------------

  const handleDecline = () => {
    if (
      requestStatus !==
      'pending'
    ) {
      return;
    }

    Alert.alert(
      tSafe(
        'decline_replacement_title',
        'Decline Replacement Cleaning'
      ),
      tSafe(
        'decline_replacement_message',
        'Are you sure you want to decline this replacement cleaning request?'
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
            'decline',
            'Decline'
          ),

          style: 'destructive',

          onPress: () =>
            submitResponse(
              false
            ),
        },
      ]
    );
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <View
          style={
            styles.centered
          }
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            {tSafe(
              'loading_replacement_request',
              'Loading replacement request...'
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------
  // Already responded
  // ---------------------------------------------------------

  const alreadyResponded =
    requestStatus !==
    'pending';

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View
        style={
          styles.container
        }
      >

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* ================================================= */}
          {/* MAP */}
          {/* ================================================= */}

          <View
            style={
              styles.mapContainer
            }
          >

            {mapImageUrl &&
            !mapError ? (
              <Image
                source={{
                  uri: mapImageUrl,
                }}
                style={
                  styles.mapImage
                }
                resizeMode="cover"
                onError={() =>
                  setMapError(
                    true
                  )
                }
              />
            ) : (
              <View
                style={[
                  styles.mapImage,
                  styles.mapPlaceholder,
                ]}
              >
                <MaterialCommunityIcons
                  name="map-outline"
                  size={42}
                  color={
                    COLORS.gray
                  }
                />

                <Text
                  style={
                    styles.placeholderText
                  }
                >
                  {tSafe(
                    'map_unavailable',
                    'Map unavailable'
                  )}
                </Text>
              </View>
            )}

            <View
              style={
                styles.mapOverlay
              }
            >
              <View
                style={
                  styles.distanceContainer
                }
              >
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.distanceText
                  }
                >
                  {distance.toFixed(
                    1
                  )}{' '}
                  {tSafe(
                    'miles_away',
                    'miles away'
                  )}
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  handleOpenDirections
                }
                style={
                  styles.directionButton
                }
              >
                <MaterialCommunityIcons
                  name="directions"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.directionText
                  }
                >
                  {tSafe(
                    'directions',
                    'Directions'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================================================= */}
          {/* PROPERTY */}
          {/* ================================================= */}

          <CustomCard
            style={
              styles.propertyCard
            }
          >
            <View
              style={
                styles.propertyHeader
              }
            >
              <View
                style={
                  styles.propertyIcon
                }
              >
                <MaterialCommunityIcons
                  name="home-outline"
                  size={25}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <View
                style={
                  styles.propertyInfo
                }
              >
                <Text
                  style={
                    styles.propertyName
                  }
                >
                  {apartmentName ||
                    tSafe(
                      'property',
                      'Property'
                    )}
                </Text>

                <View
                  style={
                    styles.locationRow
                  }
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={
                      COLORS.gray
                    }
                  />

                  <Text
                    style={
                      styles.locationText
                    }
                  >
                    {city &&
                    state
                      ? `${city}, ${state}`
                      : tSafe(
                          'location',
                          'Location'
                        )}
                  </Text>
                </View>
              </View>
            </View>
          </CustomCard>

          {/* ================================================= */}
          {/* REPLACEMENT BANNER */}
          {/* ================================================= */}

          <View
            style={
              styles.replacementBanner
            }
          >
            <View
              style={
                styles.warningIcon
              }
            >
              <MaterialCommunityIcons
                name="account-switch-outline"
                size={25}
                color="#B45309"
              />
            </View>

            <View
              style={
                styles.bannerContent
              }
            >
              <Text
                style={
                  styles.bannerTitle
                }
              >
                {tSafe(
                  'replacement_assignment',
                  'Replacement Assignment'
                )}
              </Text>

              <Text
                style={
                  styles.bannerText
                }
              >
                {tSafe(
                  'replacement_assignment_description',
                  'The cleaner originally assigned to this cleaning is unavailable for the updated date. The host is asking if you are available to take this assignment.'
                )}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* REPLACEMENT DETAILS */}
          {/* ================================================= */}

          <View
            style={
              styles.replacementDetailsCard
            }
          >

            <View
              style={
                styles.replacementDetailsHeader
              }
            >
              <View
                style={
                  styles.replacementDetailsIcon
                }
              >
                <MaterialCommunityIcons
                  name="account-switch-outline"
                  size={24}
                  color="#B45309"
                />
              </View>

              <View
                style={
                  styles.replacementDetailsHeaderText
                }
              >
                <Text
                  style={
                    styles.replacementDetailsTitle
                  }
                >
                  {tSafe(
                    'replacement_details',
                    'Replacement Details'
                  )}
                </Text>

                <Text
                  style={
                    styles.replacementDetailsSubtitle
                  }
                >
                  {tSafe(
                    'replacement_details_subtitle',
                    'This assignment is replacing another cleaner.'
                  )}
                </Text>
              </View>
            </View>

            {/* Cleaner being replaced */}

            <View
              style={
                styles.replacedCleanerRow
              }
            >
              <View
                style={
                  styles.replacedCleanerAvatar
                }
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={23}
                  color="#6B7280"
                />
              </View>

              <View
                style={
                  styles.replacedCleanerInfo
                }
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {tSafe(
                    'cleaner_being_replaced',
                    'Cleaner Being Replaced'
                  )}
                </Text>

                <Text
                  style={
                    styles.replacedCleanerName
                  }
                >
                  {originalCleaner.name ||
                    tSafe(
                      'previously_assigned_cleaner',
                      'Previously assigned cleaner'
                    )}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.detailsDivider
              }
            />

            {/* Earnings */}

            <View
              style={
                styles.earningsRow
              }
            >
              <View
                style={
                  styles.earningsIcon
                }
              >
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={24}
                  color="#15803D"
                />
              </View>

              <View
                style={
                  styles.earningsInfo
                }
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {tSafe(
                    'your_earnings',
                    'Your Earnings'
                  )}
                </Text>

                <Text
                  style={
                    styles.earningsAmount
                  }
                >
                  {formatMoney(
                    replacementFee
                  ) ||
                    tSafe(
                      'fee_not_available',
                      'Fee not available'
                    )}
                </Text>

                <Text
                  style={
                    styles.earningsDescription
                  }
                >
                  {tSafe(
                    'replacement_earnings_description',
                    'This is the cleaning fee you will earn if you are selected for this replacement assignment.'
                  )}
                </Text>
              </View>
            </View>

          </View>

          {/* ================================================= */}
          {/* SCHEDULE */}
          {/* ================================================= */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            {tSafe(
              'cleaning_schedule',
              'Cleaning Schedule'
            )}
          </Text>

          <CustomCard
            style={
              styles.scheduleCard
            }
          >

            {/* Date */}

            <View
              style={
                styles.scheduleItem
              }
            >
              <View
                style={
                  styles.scheduleIcon
                }
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={23}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <View
                style={
                  styles.scheduleContent
                }
              >
                <Text
                  style={
                    styles.scheduleLabel
                  }
                >
                  {tSafe(
                    'cleaning_date',
                    'Cleaning Date'
                  )}
                </Text>

                <Text
                  style={
                    styles.scheduleValue
                  }
                >
                  {formatDate(
                    cleaningDate
                  )}
                </Text>

                {oldCleaningDate && (
                  <Text
                    style={
                      styles.previousDate
                    }
                  >
                    {tSafe(
                      'previous_date',
                      'Previous date'
                    )}{' '}
                    {formatDate(
                      oldCleaningDate
                    )}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={
                styles.divider
              }
            />

            {/* Time */}

            <View
              style={
                styles.scheduleItem
              }
            >
              <View
                style={
                  styles.scheduleIcon
                }
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={23}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <View
                style={
                  styles.scheduleContent
                }
              >
                <Text
                  style={
                    styles.scheduleLabel
                  }
                >
                  {tSafe(
                    'cleaning_time',
                    'Cleaning Time'
                  )}
                </Text>

                <Text
                  style={
                    styles.scheduleValue
                  }
                >
                  {formatTime(
                    cleaningStartTime
                  )}

                  {cleaningEndTime
                    ? ` – ${formatTime(
                        cleaningEndTime
                      )}`
                    : ''}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.divider
              }
            />

            {/* Group */}

            <View
              style={
                styles.scheduleItem
              }
            >
              <View
                style={
                  styles.scheduleIcon
                }
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={23}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <View
                style={
                  styles.scheduleContent
                }
              >
                <Text
                  style={
                    styles.scheduleLabel
                  }
                >
                  {tSafe(
                    'cleaning_group',
                    'Cleaning Group'
                  )}
                </Text>

                <Text
                  style={
                    styles.scheduleValue
                  }
                >
                  {formatGroup(
                    group
                  )}
                </Text>
              </View>
            </View>

          </CustomCard>

          {/* ================================================= */}
          {/* VIEW FULL TASK DETAILS */}
          {/* ================================================= */}

          <TouchableOpacity
            style={
              styles.taskDetailsButton
            }
            onPress={
              handleViewTaskDetails
            }
          >
            <View
              style={
                styles.taskDetailsIcon
              }
            >
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={23}
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={
                styles.taskDetailsContent
              }
            >
              <Text
                style={
                  styles.taskDetailsTitle
                }
              >
                {tSafe(
                  'view_full_task_details',
                  'View Full Task Details'
                )}
              </Text>

              <Text
                style={
                  styles.taskDetailsSubtitle
                }
              >
                {tSafe(
                  'view_full_task_details_description',
                  'Review rooms, checklist, duration, and cleaning requirements before accepting.'
                )}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={
                COLORS.primary
              }
            />
          </TouchableOpacity>

          {/* ================================================= */}
          {/* CLEANING SUMMARY */}
          {/* ================================================= */}

          <View
            onLayout={event => {
              taskDetailsY.current =
                event.nativeEvent.layout.y;
            }}
            style={
              styles.summaryContainer
            }
          >
            <CleaningSummary
              checklist={checklist}
              assignedTo={assignedTo}
              schedule_status="open"
              isEditable={false}
              handleAccept={() => {}}
            />
          </View>

          {/* ================================================= */}
          {/* RESPONSE EXPLANATION */}
          {/* ================================================= */}

          {!alreadyResponded && (
            <View
              style={
                styles.responseCard
              }
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.responseText
                }
              >
                {tSafe(
                  'replacement_response_explanation',
                  'By accepting, you are telling the host that you are available and willing to take this replacement cleaning. The host will make the final cleaner selection.'
                )}
              </Text>
            </View>
          )}

          {/* ================================================= */}
          {/* ALREADY RESPONDED */}
          {/* ================================================= */}

          {alreadyResponded && (
            <View
              style={[
                styles.responseStatusCard,
                requestStatus ===
                  'accepted'
                  ? styles.acceptedCard
                  : styles.declinedCard,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  requestStatus ===
                  'accepted'
                    ? 'check-circle-outline'
                    : 'close-circle-outline'
                }
                size={25}
                color={
                  requestStatus ===
                  'accepted'
                    ? '#15803D'
                    : '#B91C1C'
                }
              />

              <Text
                style={
                  styles.responseStatusText
                }
              >
                {requestStatus ===
                'accepted'
                  ? tSafe(
                      'replacement_accepted',
                      'You accepted this replacement request.'
                    )
                  : tSafe(
                      'replacement_declined',
                      'You declined this replacement request.'
                    )}
              </Text>
            </View>
          )}

        </ScrollView>

        {/* ================================================= */}
        {/* BOTTOM ACTIONS */}
        {/* ================================================= */}

        {!alreadyResponded && (
          <View
            style={
              styles.bottomActions
            }
          >

            {/* Decline */}

            <TouchableOpacity
              style={
                styles.declineButton
              }
              onPress={
                handleDecline
              }
              disabled={
                responding
              }
            >
              {responding ? (
                <ActivityIndicator
                  size="small"
                  color={
                    COLORS.gray
                  }
                />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={
                      COLORS.gray
                    }
                  />

                  <Text
                    style={
                      styles.declineText
                    }
                  >
                    {tSafe(
                      'decline',
                      'Decline'
                    )}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Accept */}

            <TouchableOpacity
              style={
                styles.acceptButton
              }
              onPress={
                handleAccept
              }
              disabled={
                responding
              }
            >
              {responding ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.acceptText
                    }
                  >
                    {tSafe(
                      'accept',
                      'Accept'
                    )}
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  container: {
    flex: 1,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },

  scrollContent: {
    paddingBottom: 135,
  },

  // ==========================================================
  // MAP
  // ==========================================================

  mapContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
  },

  mapImage: {
    width: '100%',
    height: '100%',
  },

  mapPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#9CA3AF',
  },

  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor:
      'rgba(0,0,0,0.62)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  distanceText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  directionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },

  // ==========================================================
  // PROPERTY
  // ==========================================================

  propertyCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  propertyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  propertyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  propertyName: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1F2937',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },

  // ==========================================================
  // REPLACEMENT BANNER
  // ==========================================================

  replacementBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
  },

  warningIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerContent: {
    flex: 1,
    marginLeft: 12,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },

  bannerText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#78350F',
  },

  // ==========================================================
  // REPLACEMENT DETAILS
  // ==========================================================

  replacementDetailsCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  replacementDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  replacementDetailsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  replacementDetailsHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  replacementDetailsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },

  replacementDetailsSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },

  replacedCleanerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  replacedCleanerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  replacedCleanerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 3,
  },

  replacedCleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  detailsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },

  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningsIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  earningsInfo: {
    flex: 1,
    marginLeft: 12,
  },

  earningsAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15803D',
  },

  earningsDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },

  // ==========================================================
  // SCHEDULE
  // ==========================================================

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  scheduleCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },

  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scheduleContent: {
    flex: 1,
    marginLeft: 12,
  },

  scheduleLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 3,
  },

  scheduleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  previousDate: {
    marginTop: 3,
    fontSize: 12,
    color: '#9CA3AF',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 15,
  },

  // ==========================================================
  // TASK DETAILS BUTTON
  // ==========================================================

  taskDetailsButton: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskDetailsIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskDetailsContent: {
    flex: 1,
    marginLeft: 12,
  },

  taskDetailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  taskDetailsSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },

  // ==========================================================
  // RESPONSE INFO
  // ==========================================================

  responseCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
  },

  responseText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 19,
    color: '#1E3A8A',
  },

  // ==========================================================
  // RESPONSE STATUS
  // ==========================================================

  responseStatusCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  acceptedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  declinedCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  responseStatusText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },

  // ==========================================================
  // BOTTOM ACTIONS
  // ==========================================================

  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 10,
  },

  declineButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  declineText: {
    marginLeft: 7,
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },

  acceptButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptText: {
    marginLeft: 7,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});











// import React, { useContext, useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   StatusBar,
//   Linking,
//   Alert,
//   ScrollView,
//   Image,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';

// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';

// import CustomCard from '../../components/shared/CustomCard';
// import CleaningSummary from './CleaningSummary';

// import moment from 'moment';
// import calculateDistance from '../../utils/calculateDistance';
// import { getCityState } from '../../utils/getAddressFromCoordinates';
// import { MAP_BOX_SECRET_KEY } from '../../env';
// import { tSafe } from '../../utils/tSafe';

// export default function ReplacementRequest({ route }) {
//   const navigation = useNavigation();

//   const {
//     requestId,
//     scheduleId,
//     cleanerId,
//     oldCleaningDate,
//     newCleaningDate,
//     propertyName,
//     cleaningTime,
//     group,
//   } = route?.params || {};

//   const {
//     geolocationData,
//     currentUserId,
//     currentUser,
//   } = useContext(AuthContext);

//   const effectiveCleanerId = cleanerId || currentUserId;

//   const [schedule, setSchedule] = useState({});
//   const [checklist, setChecklist] = useState({});
//   const [assignedTo, setAssignedTo] = useState([]);

//   const [cleaningDate, setCleaningDate] = useState(
//     newCleaningDate || ''
//   );

//   const [cleaningStartTime, setCleaningStartTime] = useState(
//     cleaningTime || ''
//   );

//   const [cleaningEndTime, setCleaningEndTime] = useState('');

//   const [apartmentLat, setApartmentLatitude] = useState('');
//   const [apartmentLng, setApartmentLongitude] = useState('');

//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');

//   const [apartmentName, setApartmentName] = useState(
//     propertyName || ''
//   );

//   const [distance, setDistance] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [responding, setResponding] = useState(false);

//   const [mapImageUrl, setMapImageUrl] = useState(null);
//   const [mapError, setMapError] = useState(false);

//   const [requestStatus, setRequestStatus] = useState('pending');

//   // ---------------------------------------------------------
//   // Fetch schedule
//   // ---------------------------------------------------------

//   useEffect(() => {
//     fetchSchedule();
//   }, []);

//   const fetchSchedule = async () => {
//     try {
//       if (!scheduleId) {
//         throw new Error(
//           tSafe(
//             'missing_schedule_id',
//             'Missing schedule information.'
//           )
//         );
//       }

//       const response =
//         await userService.getScheduleById(scheduleId);

//       const res = response?.data || {};

//       setSchedule(res);

//       setChecklist(
//         res?.overall_checklist?.checklist || {}
//       );

//       setAssignedTo(
//         Array.isArray(res?.assignedTo)
//           ? res.assignedTo
//           : []
//       );

//       const scheduleData = res?.schedule || {};

//       const date =
//         scheduleData?.cleaning_date ||
//         newCleaningDate ||
//         '';

//       const startTime =
//         scheduleData?.cleaning_time ||
//         cleaningTime ||
//         '';

//       const endTime =
//         scheduleData?.cleaning_end_time ||
//         '';

//       setCleaningDate(date);
//       setCleaningStartTime(startTime);
//       setCleaningEndTime(endTime);

//       const lat =
//         scheduleData?.apartment_latitude;

//       const lng =
//         scheduleData?.apartment_longitude;

//       if (lat && lng) {
//         setApartmentLatitude(lat);
//         setApartmentLongitude(lng);

//         const coordinate = {
//           latitude: Number(lat),
//           longitude: Number(lng),
//         };

//         try {
//           const locationResult =
//             await getCityState(coordinate);

//           if (locationResult) {
//             setCity(locationResult.city || '');
//             setState(locationResult.state || '');
//           }
//         } catch (locationError) {
//           console.log(
//             'Location lookup error:',
//             locationError
//           );
//         }

//         if (
//           geolocationData?.latitude &&
//           geolocationData?.longitude
//         ) {
//           const dist = calculateDistance(
//             geolocationData.latitude,
//             geolocationData.longitude,
//             Number(lat),
//             Number(lng)
//           );

//           setDistance(dist);
//         }
//       }

//       setApartmentName(
//         scheduleData?.apartment_name ||
//         propertyName ||
//         ''
//       );

//     } catch (error) {
//       console.error(
//         'Failed to fetch replacement schedule:',
//         error
//       );

//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe(
//           'unable_to_load_replacement_request',
//           'Unable to load the replacement request.'
//         )
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------------------------------------------
//   // Map
//   // ---------------------------------------------------------

//   useEffect(() => {
//     if (apartmentLat && apartmentLng) {
//       const url =
//         `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
//         `pin-s+ff0000(${apartmentLng},${apartmentLat})/` +
//         `${apartmentLng},${apartmentLat},15,0/400x200` +
//         `?access_token=${MAP_BOX_SECRET_KEY}`;

//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [apartmentLat, apartmentLng]);

//   // ---------------------------------------------------------
//   // Directions
//   // ---------------------------------------------------------

//   const handleOpenDirections = () => {
//     if (!apartmentLat || !apartmentLng) {
//       Alert.alert(
//         tSafe('location_unavailable', 'Location unavailable'),
//         tSafe(
//           'directions_unavailable',
//           'Directions are not available for this property.'
//         )
//       );

//       return;
//     }

//     const originLat =
//       currentUser?.location?.latitude ||
//       geolocationData?.latitude;

//     const originLng =
//       currentUser?.location?.longitude ||
//       geolocationData?.longitude;

//     const url =
//       `https://www.google.com/maps/dir/?api=1` +
//       `&origin=${originLat},${originLng}` +
//       `&destination=${apartmentLat},${apartmentLng}` +
//       `&travelmode=driving`;

//     Linking.openURL(url).catch(() => {
//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe(
//           'unable_to_open_maps',
//           'Unable to open directions.'
//         )
//       );
//     });
//   };

//   // ---------------------------------------------------------
//   // Format helpers
//   // ---------------------------------------------------------

//   const formatGroup = (groupValue) => {
//     if (!groupValue) return '';

//     return groupValue
//       .split('_')
//       .map(
//         word =>
//           word.charAt(0).toUpperCase() +
//           word.slice(1)
//       )
//       .join(' ');
//   };

//   const formatDate = (date) => {
//     if (!date) return '';

//     if (
//       typeof date === 'string' &&
//       /^\d{4}-\d{2}-\d{2}$/.test(date)
//     ) {
//       const [year, month, day] =
//         date.split('-').map(Number);

//       return moment(
//         [year, month - 1, day]
//       ).format('ddd, MMM D, YYYY');
//     }

//     return moment(date).format(
//       'ddd, MMM D, YYYY'
//     );
//   };

//   const formatTime = (time) => {
//     if (!time) return '';

//     const parsed = moment(
//       time,
//       [
//         'HH:mm:ss',
//         'HH:mm',
//         'h:mm:ss A',
//         'h:mm A',
//       ],
//       true
//     );

//     return parsed.isValid()
//       ? parsed.format('h:mm A')
//       : time;
//   };

//   // ---------------------------------------------------------
//   // Replacement response
//   // ---------------------------------------------------------

//   const submitResponse = async (acceptance) => {
//     if (responding) return;

//     try {
//       setResponding(true);

//       const data = {
//         scheduleId: String(scheduleId),
//         requestId: String(requestId),
//         cleanerId: String(effectiveCleanerId),
//         acceptance,
//       };

//       console.log(
//         'Replacement response:',
//         data
//       );

//       const response =
//         await userService.respondToReplacementRequest(
//           data
//         );

//       console.log(
//         'Replacement response result:',
//         response?.data
//       );

//       setRequestStatus(
//         response?.data?.status ||
//         (acceptance ? 'accepted' : 'declined')
//       );

//       if (acceptance) {
//         Alert.alert(
//           tSafe(
//             'replacement_request_accepted_title',
//             'Request Accepted'
//           ),
//           tSafe(
//             'replacement_request_accepted_message',
//             'You have indicated that you are available for this replacement cleaning. The host will review the available cleaners and make the final selection.'
//           ),
//           [
//             {
//               text: tSafe(
//                 'continue',
//                 'Continue'
//               ),
//               onPress: () => {
//                 navigation.navigate(
//                   ROUTES.cleaner_dashboard
//                 );
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           tSafe(
//             'replacement_request_declined_title',
//             'Request Declined'
//           ),
//           tSafe(
//             'replacement_request_declined_message',
//             'You have declined this replacement cleaning request.'
//           ),
//           [
//             {
//               text: tSafe(
//                 'ok',
//                 'OK'
//               ),
//               onPress: () => {
//                 navigation.navigate(
//                   ROUTES.cleaner_dashboard
//                 );
//               },
//             },
//           ]
//         );
//       }

//     } catch (error) {
//       console.error(
//         'Replacement response failed:',
//         error
//       );

//       Alert.alert(
//         tSafe('error', 'Error'),
//         error?.response?.data?.detail ||
//           tSafe(
//             'replacement_response_failed',
//             'We could not submit your response. Please try again.'
//           )
//       );
//     } finally {
//       setResponding(false);
//     }
//   };

//   // ---------------------------------------------------------
//   // Accept confirmation
//   // ---------------------------------------------------------

//   const handleAccept = () => {
//     Alert.alert(
//       tSafe(
//         'accept_replacement_title',
//         'Accept Replacement Cleaning'
//       ),
//       tSafe(
//         'accept_replacement_message',
//         'Are you sure you want to indicate that you are available for this replacement cleaning?'
//       ),
//       [
//         {
//           text: tSafe(
//             'cancel',
//             'Cancel'
//           ),
//           style: 'cancel',
//         },
//         {
//           text: tSafe(
//             'accept',
//             'Accept'
//           ),
//           onPress: () =>
//             submitResponse(true),
//         },
//       ]
//     );
//   };

//   // ---------------------------------------------------------
//   // Decline confirmation
//   // ---------------------------------------------------------

//   const handleDecline = () => {
//     Alert.alert(
//       tSafe(
//         'decline_replacement_title',
//         'Decline Replacement Cleaning'
//       ),
//       tSafe(
//         'decline_replacement_message',
//         'Are you sure you want to decline this replacement cleaning request?'
//       ),
//       [
//         {
//           text: tSafe(
//             'cancel',
//             'Cancel'
//           ),
//           style: 'cancel',
//         },
//         {
//           text: tSafe(
//             'decline',
//             'Decline'
//           ),
//           style: 'destructive',
//           onPress: () =>
//             submitResponse(false),
//         },
//       ]
//     );
//   };

//   // ---------------------------------------------------------
//   // Loading
//   // ---------------------------------------------------------

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.centered}>
//           <ActivityIndicator
//             size="large"
//             color={COLORS.primary}
//           />

//           <Text style={styles.loadingText}>
//             {tSafe(
//               'loading_replacement_request',
//               'Loading replacement request...'
//             )}
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ---------------------------------------------------------
//   // Already responded
//   // ---------------------------------------------------------

//   const alreadyResponded =
//     requestStatus !== 'pending';

//   // ---------------------------------------------------------
//   // Render
//   // ---------------------------------------------------------

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />

//       <View style={styles.container}>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={
//             styles.scrollContent
//           }
//         >

//           {/* ------------------------------------------------ */}
//           {/* Map */}
//           {/* ------------------------------------------------ */}

//           <View style={styles.mapContainer}>

//             {mapImageUrl && !mapError ? (
//               <Image
//                 source={{
//                   uri: mapImageUrl,
//                 }}
//                 style={styles.mapImage}
//                 resizeMode="cover"
//                 onError={() =>
//                   setMapError(true)
//                 }
//               />
//             ) : (
//               <View
//                 style={[
//                   styles.mapImage,
//                   styles.mapPlaceholder,
//                 ]}
//               >
//                 <MaterialCommunityIcons
//                   name="map-outline"
//                   size={42}
//                   color={COLORS.gray}
//                 />

//                 <Text
//                   style={
//                     styles.placeholderText
//                   }
//                 >
//                   {tSafe(
//                     'map_unavailable',
//                     'Map unavailable'
//                   )}
//                 </Text>
//               </View>
//             )}

//             <View
//               style={styles.mapOverlay}
//             >
//               <View
//                 style={styles.distanceContainer}
//               >
//                 <MaterialCommunityIcons
//                   name="map-marker-distance"
//                   size={18}
//                   color="#FFFFFF"
//                 />

//                 <Text
//                   style={styles.distanceText}
//                 >
//                   {distance.toFixed(1)}{' '}
//                   {tSafe(
//                     'miles_away',
//                     'miles away'
//                   )}
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 onPress={
//                   handleOpenDirections
//                 }
//                 style={
//                   styles.directionButton
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="directions"
//                   size={18}
//                   color="#FFFFFF"
//                 />

//                 <Text
//                   style={styles.directionText}
//                 >
//                   {tSafe(
//                     'directions',
//                     'Directions'
//                   )}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* ------------------------------------------------ */}
//           {/* Property */}
//           {/* ------------------------------------------------ */}

//           <CustomCard
//             style={
//               styles.propertyCard
//             }
//           >
//             <View
//               style={
//                 styles.propertyHeader
//               }
//             >
//               <View
//                 style={
//                   styles.propertyIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="home-outline"
//                   size={25}
//                   color={COLORS.primary}
//                 />
//               </View>

//               <View
//                 style={
//                   styles.propertyInfo
//                 }
//               >
//                 <Text
//                   style={
//                     styles.propertyName
//                   }
//                 >
//                   {apartmentName ||
//                     tSafe(
//                       'property',
//                       'Property'
//                     )}
//                 </Text>

//                 <View
//                   style={
//                     styles.locationRow
//                   }
//                 >
//                   <MaterialCommunityIcons
//                     name="map-marker-outline"
//                     size={16}
//                     color={COLORS.gray}
//                   />

//                   <Text
//                     style={
//                       styles.locationText
//                     }
//                   >
//                     {city && state
//                       ? `${city}, ${state}`
//                       : tSafe(
//                           'location',
//                           'Location'
//                         )}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </CustomCard>

//           {/* ------------------------------------------------ */}
//           {/* Replacement banner */}
//           {/* ------------------------------------------------ */}

//           <View
//             style={
//               styles.replacementBanner
//             }
//           >
//             <View
//               style={
//                 styles.warningIcon
//               }
//             >
//               <MaterialCommunityIcons
//                 name="account-switch-outline"
//                 size={25}
//                 color="#B45309"
//               />
//             </View>

//             <View
//               style={
//                 styles.bannerContent
//               }
//             >
//               <Text
//                 style={
//                   styles.bannerTitle
//                 }
//               >
//                 {tSafe(
//                   'replacement_assignment',
//                   'Replacement Assignment'
//                 )}
//               </Text>

//               <Text
//                 style={
//                   styles.bannerText
//                 }
//               >
//                 {tSafe(
//                   'replacement_assignment_description',
//                   'The cleaner originally assigned to this cleaning is unavailable for the updated date. The host is asking if you are available to take this assignment.'
//                 )}
//               </Text>
//             </View>
//           </View>

//           {/* ------------------------------------------------ */}
//           {/* Schedule */}
//           {/* ------------------------------------------------ */}

//           <Text
//             style={styles.sectionTitle}
//           >
//             {tSafe(
//               'cleaning_schedule',
//               'Cleaning Schedule'
//             )}
//           </Text>

//           <CustomCard
//             style={styles.scheduleCard}
//           >

//             <View
//               style={styles.scheduleItem}
//             >
//               <View
//                 style={styles.scheduleIcon}
//               >
//                 <MaterialCommunityIcons
//                   name="calendar-outline"
//                   size={23}
//                   color={COLORS.primary}
//                 />
//               </View>

//               <View
//                 style={styles.scheduleContent}
//               >
//                 <Text
//                   style={
//                     styles.scheduleLabel
//                   }
//                 >
//                   {tSafe(
//                     'cleaning_date',
//                     'Cleaning Date'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.scheduleValue
//                   }
//                 >
//                   {formatDate(
//                     cleaningDate
//                   )}
//                 </Text>

//                 {oldCleaningDate && (
//                   <Text
//                     style={
//                       styles.previousDate
//                     }
//                   >
//                     {tSafe(
//                       'previous_date',
//                       'Previous date'
//                     )}{' '}
//                     {formatDate(
//                       oldCleaningDate
//                     )}
//                   </Text>
//                 )}
//               </View>
//             </View>

//             <View
//               style={styles.divider}
//             />

//             <View
//               style={styles.scheduleItem}
//             >
//               <View
//                 style={styles.scheduleIcon}
//               >
//                 <MaterialCommunityIcons
//                   name="clock-outline"
//                   size={23}
//                   color={COLORS.primary}
//                 />
//               </View>

//               <View
//                 style={styles.scheduleContent}
//               >
//                 <Text
//                   style={
//                     styles.scheduleLabel
//                   }
//                 >
//                   {tSafe(
//                     'cleaning_time',
//                     'Cleaning Time'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.scheduleValue
//                   }
//                 >
//                   {formatTime(
//                     cleaningStartTime
//                   )}

//                   {cleaningEndTime
//                     ? ` – ${formatTime(
//                         cleaningEndTime
//                       )}`
//                     : ''}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={styles.divider}
//             />

//             <View
//               style={styles.scheduleItem}
//             >
//               <View
//                 style={styles.scheduleIcon}
//               >
//                 <MaterialCommunityIcons
//                   name="account-group-outline"
//                   size={23}
//                   color={COLORS.primary}
//                 />
//               </View>

//               <View
//                 style={styles.scheduleContent}
//               >
//                 <Text
//                   style={
//                     styles.scheduleLabel
//                   }
//                 >
//                   {tSafe(
//                     'cleaning_group',
//                     'Cleaning Group'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.scheduleValue
//                   }
//                 >
//                   {formatGroup(group)}
//                 </Text>
//               </View>
//             </View>

//           </CustomCard>

//           {/* ------------------------------------------------ */}
//           {/* Cleaning summary */}
//           {/* ------------------------------------------------ */}

//           <View
//             style={
//               styles.summaryContainer
//             }
//           >
//             <CleaningSummary
//               checklist={checklist}
//               assignedTo={assignedTo}
//               schedule_status="open"
//               isEditable={false}
//               handleAccept={() => {}}
//             />
//           </View>

//           {/* ------------------------------------------------ */}
//           {/* Response explanation */}
//           {/* ------------------------------------------------ */}

//           {!alreadyResponded && (
//             <View
//               style={
//                 styles.responseCard
//               }
//             >
//               <MaterialCommunityIcons
//                 name="information-outline"
//                 size={22}
//                 color={COLORS.primary}
//               />

//               <Text
//                 style={
//                   styles.responseText
//                 }
//               >
//                 {tSafe(
//                   'replacement_response_explanation',
//                   'By accepting, you are telling the host that you are available and willing to take this replacement cleaning. The host will make the final cleaner selection.'
//                 )}
//               </Text>
//             </View>
//           )}

//           {/* ------------------------------------------------ */}
//           {/* Already responded */}
//           {/* ------------------------------------------------ */}

//           {alreadyResponded && (
//             <View
//               style={[
//                 styles.responseStatusCard,
//                 requestStatus ===
//                   'accepted'
//                   ? styles.acceptedCard
//                   : styles.declinedCard,
//               ]}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   requestStatus ===
//                   'accepted'
//                     ? 'check-circle-outline'
//                     : 'close-circle-outline'
//                 }
//                 size={25}
//                 color={
//                   requestStatus ===
//                   'accepted'
//                     ? '#15803D'
//                     : '#B91C1C'
//                 }
//               />

//               <Text
//                 style={
//                   styles.responseStatusText
//                 }
//               >
//                 {requestStatus ===
//                 'accepted'
//                   ? tSafe(
//                       'replacement_accepted',
//                       'You accepted this replacement request.'
//                     )
//                   : tSafe(
//                       'replacement_declined',
//                       'You declined this replacement request.'
//                     )}
//               </Text>
//             </View>
//           )}

//         </ScrollView>

//         {/* -------------------------------------------------- */}
//         {/* Bottom actions */}
//         {/* -------------------------------------------------- */}

//         {!alreadyResponded && (
//           <View
//             style={styles.bottomActions}
//           >

//             <TouchableOpacity
//               style={
//                 styles.declineButton
//               }
//               onPress={
//                 handleDecline
//               }
//               disabled={responding}
//             >
//               {responding ? (
//                 <ActivityIndicator
//                   size="small"
//                   color={COLORS.gray}
//                 />
//               ) : (
//                 <>
//                   <MaterialCommunityIcons
//                     name="close"
//                     size={20}
//                     color={COLORS.gray}
//                   />

//                   <Text
//                     style={
//                       styles.declineText
//                     }
//                   >
//                     {tSafe(
//                       'decline',
//                       'Decline'
//                     )}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={
//                 styles.acceptButton
//               }
//               onPress={
//                 handleAccept
//               }
//               disabled={responding}
//             >
//               {responding ? (
//                 <ActivityIndicator
//                   size="small"
//                   color="#FFFFFF"
//                 />
//               ) : (
//                 <>
//                   <MaterialCommunityIcons
//                     name="check"
//                     size={20}
//                     color="#FFFFFF"
//                   />

//                   <Text
//                     style={
//                       styles.acceptText
//                     }
//                   >
//                     {tSafe(
//                       'accept',
//                       'Accept'
//                     )}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>

//           </View>
//         )}

//       </View>
//     </SafeAreaView>
//   );
// }

// // ============================================================
// // Styles
// // ============================================================

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },

//   container: {
//     flex: 1,
//   },

//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//   },

//   loadingText: {
//     marginTop: 12,
//     fontSize: 15,
//     color: '#6B7280',
//   },

//   scrollContent: {
//     paddingBottom: 125,
//   },

//   // ----------------------------------------------------------
//   // Map
//   // ----------------------------------------------------------

//   mapContainer: {
//     height: 190,
//     width: '100%',
//     position: 'relative',
//   },

//   mapImage: {
//     width: '100%',
//     height: '100%',
//   },

//   mapPlaceholder: {
//     backgroundColor: '#E5E7EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   placeholderText: {
//     marginTop: 8,
//     fontSize: 13,
//     color: '#9CA3AF',
//   },

//   mapOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 16,
//     paddingVertical: 11,
//     backgroundColor:
//       'rgba(0,0,0,0.62)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent:
//       'space-between',
//   },

//   distanceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   distanceText: {
//     marginLeft: 6,
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   directionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 5,
//     paddingHorizontal: 8,
//   },

//   directionText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 5,
//   },

//   // ----------------------------------------------------------
//   // Property
//   // ----------------------------------------------------------

//   propertyCard: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },

//   propertyHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   propertyIcon: {
//     width: 52,
//     height: 52,
//     borderRadius: 16,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   propertyInfo: {
//     flex: 1,
//     marginLeft: 13,
//   },

//   propertyName: {
//     fontSize: 21,
//     fontWeight: '700',
//     color: '#1F2937',
//   },

//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },

//   locationText: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#6B7280',
//   },

//   // ----------------------------------------------------------
//   // Replacement banner
//   // ----------------------------------------------------------

//   replacementBanner: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 15,
//     borderRadius: 16,
//     backgroundColor: '#FFF7ED',
//     borderWidth: 1,
//     borderColor: '#FED7AA',
//     flexDirection: 'row',
//   },

//   warningIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     backgroundColor: '#FFEDD5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   bannerContent: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   bannerTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#92400E',
//     marginBottom: 4,
//   },

//   bannerText: {
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#78350F',
//   },

//   // ----------------------------------------------------------
//   // Schedule
//   // ----------------------------------------------------------

//   sectionTitle: {
//     marginHorizontal: 16,
//     marginTop: 24,
//     marginBottom: 10,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//   },

//   scheduleCard: {
//     marginHorizontal: 16,
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: '#FFFFFF',
//     elevation: 1,
//   },

//   scheduleItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   scheduleIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#F1F5F9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   scheduleContent: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   scheduleLabel: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginBottom: 3,
//   },

//   scheduleValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//   },

//   previousDate: {
//     marginTop: 3,
//     fontSize: 12,
//     color: '#9CA3AF',
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#F1F5F9',
//     marginVertical: 15,
//   },

//   // ----------------------------------------------------------
//   // Summary
//   // ----------------------------------------------------------

//   summaryContainer: {
//     marginHorizontal: 16,
//     marginTop: 20,
//   },

//   // ----------------------------------------------------------
//   // Response info
//   // ----------------------------------------------------------

//   responseCard: {
//     marginHorizontal: 16,
//     marginTop: 20,
//     padding: 15,
//     borderRadius: 15,
//     backgroundColor: '#EFF6FF',
//     borderWidth: 1,
//     borderColor: '#DBEAFE',
//     flexDirection: 'row',
//   },

//   responseText: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#1E3A8A',
//   },

//   responseStatusCard: {
//     marginHorizontal: 16,
//     marginTop: 20,
//     padding: 15,
//     borderRadius: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   acceptedCard: {
//     backgroundColor: '#F0FDF4',
//     borderWidth: 1,
//     borderColor: '#BBF7D0',
//   },

//   declinedCard: {
//     backgroundColor: '#FEF2F2',
//     borderWidth: 1,
//     borderColor: '#FECACA',
//   },

//   responseStatusText: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#374151',
//     fontWeight: '500',
//   },

//   // ----------------------------------------------------------
//   // Bottom actions
//   // ----------------------------------------------------------

//   bottomActions: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 18,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     flexDirection: 'row',
//     gap: 10,
//   },

//   declineButton: {
//     flex: 1,
//     minHeight: 52,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   declineText: {
//     marginLeft: 7,
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#6B7280',
//   },

//   acceptButton: {
//     flex: 1,
//     minHeight: 52,
//     borderRadius: 15,
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   acceptText: {
//     marginLeft: 7,
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
// });