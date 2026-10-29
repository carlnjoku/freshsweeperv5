// import React, {
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
// } from 'react';

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
// import {
//   useNavigation,
//   useFocusEffect,
// } from '@react-navigation/native';

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

//   const scrollViewRef = useRef(null);
//   const taskDetailsY = useRef(0);

//   // ---------------------------------------------------------
//   // Route params
//   // ---------------------------------------------------------

//   const {
//     requestId,
//     scheduleId,
//     cleanerId,

//     oldCleaningDate,
//     newCleaningDate,

//     propertyName,
//     cleaningTime,
//     group,

//     // Replacement information
//     replacedCleanerId,
//     replacedCleanerName,
//     replacementFee: routeReplacementFee,
//   } = route?.params || {};

//   // ---------------------------------------------------------
//   // Auth
//   // ---------------------------------------------------------

//   const {
//     geolocationData,
//     currentUserId,
//     currentUser,
//   } = useContext(AuthContext);

//   const effectiveCleanerId =
//     cleanerId || currentUserId;

//   // ---------------------------------------------------------
//   // Schedule state
//   // ---------------------------------------------------------

//   const [schedule, setSchedule] = useState({});
//   const [checklist, setChecklist] = useState({});
//   const [assignedTo, setAssignedTo] = useState([]);

//   const [cleaningDate, setCleaningDate] =
//     useState(newCleaningDate || '');

//   const [cleaningStartTime, setCleaningStartTime] =
//     useState(cleaningTime || '');

//   const [cleaningEndTime, setCleaningEndTime] =
//     useState('');

//   // ---------------------------------------------------------
//   // Location state
//   // ---------------------------------------------------------

//   const [apartmentLat, setApartmentLatitude] =
//     useState('');

//   const [apartmentLng, setApartmentLongitude] =
//     useState('');

//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');

//   const [apartmentName, setApartmentName] =
//     useState(propertyName || '');

//   const [distance, setDistance] = useState(0);

//   // ---------------------------------------------------------
//   // Replacement state
//   // ---------------------------------------------------------

//   const [replacementFee, setReplacementFee] =
//     useState(
//       routeReplacementFee !== undefined &&
//         routeReplacementFee !== null
//         ? Number(routeReplacementFee)
//         : null
//     );

//   const [originalCleaner, setOriginalCleaner] =
//     useState({
//       cleanerId: replacedCleanerId || null,
//       name:
//         replacedCleanerName ||
//         '',
//     });

//   // ---------------------------------------------------------
//   // Loading / response state
//   // ---------------------------------------------------------

//   const [loading, setLoading] =
//     useState(true);

//   const [requestLoading, setRequestLoading] =
//     useState(true);

//   const [requestError, setRequestError] =
//     useState(null);

//   const [responding, setResponding] =
//     useState(false);

//   const [requestStatus, setRequestStatus] =
//     useState('pending');

//   // ---------------------------------------------------------
//   // Map state
//   // ---------------------------------------------------------

//   const [mapImageUrl, setMapImageUrl] =
//     useState(null);

//   const [mapError, setMapError] =
//     useState(false);

//   // =========================================================
//   // FETCH AUTHORITATIVE REPLACEMENT REQUEST
//   // =========================================================

//   const fetchReplacementRequest =
//     useCallback(async () => {
//       try {
//         if (!requestId) {
//           throw new Error(
//             tSafe(
//               'missing_request_id',
//               'Missing replacement request information.'
//             )
//           );
//         }

//         setRequestLoading(true);
//         setRequestError(null);

//         console.log(
//           '🔎 Fetching replacement request:',
//           requestId
//         );

//         const response =
//           await userService.getReplacementRequest(
//             String(requestId)
//           );

//         const replacementRequest =
//           response?.data?.request ||
//           response?.request;

//         if (!replacementRequest) {
//           throw new Error(
//             tSafe(
//               'replacement_request_not_found',
//               'Replacement request was not found.'
//             )
//           );
//         }

//         console.log(
//           '✅ Authoritative replacement request:',
//           replacementRequest
//         );

//         // -----------------------------------------------------
//         // Verify request belongs to this cleaner
//         // -----------------------------------------------------

//         if (
//           effectiveCleanerId &&
//           replacementRequest.cleanerId &&
//           String(
//             replacementRequest.cleanerId
//           ) !== String(
//             effectiveCleanerId
//           )
//         ) {
//           throw new Error(
//             tSafe(
//               'replacement_request_not_assigned',
//               'This replacement request is not assigned to your account.'
//             )
//           );
//         }

//         // -----------------------------------------------------
//         // Verify schedule
//         // -----------------------------------------------------

//         if (
//           scheduleId &&
//           replacementRequest.scheduleId &&
//           String(
//             replacementRequest.scheduleId
//           ) !== String(scheduleId)
//         ) {
//           throw new Error(
//             tSafe(
//               'replacement_request_invalid',
//               'This replacement request is no longer valid.'
//             )
//           );
//         }

//         // -----------------------------------------------------
//         // Backend status is authoritative
//         // -----------------------------------------------------

//         setRequestStatus(
//           replacementRequest.status ||
//             'pending'
//         );

//         // -----------------------------------------------------
//         // Update replacement cleaner fee if backend
//         // has it.
//         //
//         // This is the cleaner's earnings only.
//         // We do NOT expose host policy compensation here.
//         // -----------------------------------------------------

//         if (
//           replacementRequest.replacement_cleaner_fee !==
//             undefined &&
//           replacementRequest.replacement_cleaner_fee !==
//             null
//         ) {
//           const backendFee =
//             Number(
//               replacementRequest.replacement_cleaner_fee
//             );

//           if (
//             !Number.isNaN(
//               backendFee
//             )
//           ) {
//             setReplacementFee(
//               backendFee
//             );
//           }
//         }

//         // -----------------------------------------------------
//         // Update original cleaner information
//         // -----------------------------------------------------

//         if (
//           replacementRequest.replacesCleanerId
//         ) {
//           setOriginalCleaner(
//             prev => ({
//               ...prev,

//               cleanerId:
//                 replacementRequest.replacesCleanerId,

//               name:
//                 prev?.name ||
//                 replacedCleanerName ||
//                 '',
//             })
//           );
//         }

//         return replacementRequest;

//       } catch (error) {
//         console.error(
//           '❌ Failed to fetch replacement request:',
//           error
//         );

//         setRequestError(
//           error?.response?.data?.detail ||
//             error?.response?.data?.message ||
//             error?.message ||
//             tSafe(
//               'unable_to_load_replacement_request',
//               'Unable to load the replacement request.'
//             )
//         );

//         return null;

//       } finally {
//         setRequestLoading(false);
//       }
//     }, [
//       requestId,
//       scheduleId,
//       effectiveCleanerId,
//       replacedCleanerName,
//     ]);

//   // =========================================================
//   // FETCH SCHEDULE
//   // =========================================================

//   const fetchSchedule = useCallback(
//     async () => {
//       try {
//         if (!scheduleId) {
//           throw new Error(
//             tSafe(
//               'missing_schedule_id',
//               'Missing schedule information.'
//             )
//           );
//         }

//         const response =
//           await userService.getScheduleById(
//             scheduleId
//           );

//         const res =
//           response?.data || {};

//         setSchedule(res);

//         // -----------------------------------------------------
//         // Checklist
//         // -----------------------------------------------------

//         setChecklist(
//           res?.overall_checklist?.checklist ||
//             {}
//         );

//         // -----------------------------------------------------
//         // Assigned cleaners
//         // -----------------------------------------------------

//         const assignments =
//           Array.isArray(
//             res?.assignedTo
//           )
//             ? res.assignedTo
//             : [];

//         setAssignedTo(
//           assignments
//         );

//         // -----------------------------------------------------
//         // Schedule data
//         // -----------------------------------------------------

//         const scheduleData =
//           res?.schedule || {};

//         const date =
//           scheduleData?.cleaning_date ||
//           newCleaningDate ||
//           '';

//         const startTime =
//           scheduleData?.cleaning_time ||
//           cleaningTime ||
//           '';

//         const endTime =
//           scheduleData?.cleaning_end_time ||
//           '';

//         setCleaningDate(
//           date
//         );

//         setCleaningStartTime(
//           startTime
//         );

//         setCleaningEndTime(
//           endTime
//         );

//         // -----------------------------------------------------
//         // Property location
//         // -----------------------------------------------------

//         const lat =
//           scheduleData?.apartment_latitude;

//         const lng =
//           scheduleData?.apartment_longitude;

//         if (
//           lat !== undefined &&
//           lat !== null &&
//           lng !== undefined &&
//           lng !== null
//         ) {
//           setApartmentLatitude(
//             lat
//           );

//           setApartmentLongitude(
//             lng
//           );

//           const coordinate = {
//             latitude: Number(lat),
//             longitude: Number(lng),
//           };

//           // ---------------------------------------------------
//           // City / state
//           // ---------------------------------------------------

//           try {
//             const locationResult =
//               await getCityState(
//                 coordinate
//               );

//             if (locationResult) {
//               setCity(
//                 locationResult.city ||
//                   ''
//               );

//               setState(
//                 locationResult.state ||
//                   ''
//               );
//             }
//           } catch (
//             locationError
//           ) {
//             console.log(
//               'Location lookup error:',
//               locationError
//             );
//           }

//           // ---------------------------------------------------
//           // Distance
//           // ---------------------------------------------------

//           if (
//             geolocationData?.latitude !==
//               undefined &&
//             geolocationData?.longitude !==
//               undefined
//           ) {
//             const dist =
//               calculateDistance(
//                 geolocationData.latitude,
//                 geolocationData.longitude,
//                 Number(lat),
//                 Number(lng)
//               );

//             setDistance(
//               dist
//             );
//           }
//         }

//         // -----------------------------------------------------
//         // Property name
//         // -----------------------------------------------------

//         setApartmentName(
//           scheduleData?.apartment_name ||
//             propertyName ||
//             ''
//         );

//         // -----------------------------------------------------
//         // Find cleaner being replaced
//         // -----------------------------------------------------

//         let replacementAssignment =
//           null;

//         // First try explicit cleaner ID
//         if (replacedCleanerId) {
//           replacementAssignment =
//             assignments.find(
//               assignment =>
//                 String(
//                   assignment?.cleanerId
//                 ) ===
//                 String(
//                   replacedCleanerId
//                 )
//             );
//         }

//         // Then try group + replacement status
//         if (
//           !replacementAssignment &&
//           group
//         ) {
//           replacementAssignment =
//             assignments.find(
//               assignment =>
//                 assignment?.group ===
//                   group &&
//                 assignment?.status ===
//                   'replacement_required'
//             );
//         }

//         // Final fallback: group
//         if (
//           !replacementAssignment &&
//           group
//         ) {
//           replacementAssignment =
//             assignments.find(
//               assignment =>
//                 assignment?.group ===
//                 group
//             );
//         }

//         if (
//           replacementAssignment
//         ) {
//           // ---------------------------------------------------
//           // Original cleaner
//           // ---------------------------------------------------

//           const originalCleanerId =
//             replacementAssignment?.cleanerId;

//           const firstName =
//             replacementAssignment?.firstname ||
//             '';

//           const lastName =
//             replacementAssignment?.lastname ||
//             '';

//           const fullName =
//             `${firstName} ${lastName}`.trim();

//           setOriginalCleaner({
//             cleanerId:
//               originalCleanerId ||
//               replacedCleanerId ||
//               null,

//             name:
//               fullName ||
//               replacedCleanerName ||
//               tSafe(
//                 'previously_assigned_cleaner',
//                 'Previously assigned cleaner'
//               ),
//           });

//           // ---------------------------------------------------
//           // Replacement cleaner earnings
//           //
//           // assignedTo[].checklist.calculatedPrice
//           //
//           // fallback:
//           // assignedTo[].checklist.price
//           // ---------------------------------------------------

//           const assignmentChecklist =
//             replacementAssignment?.checklist ||
//             {};

//           const assignmentFee =
//             assignmentChecklist?.calculatedPrice ??
//             assignmentChecklist?.price;

//           if (
//             assignmentFee !==
//               undefined &&
//             assignmentFee !==
//               null
//           ) {
//             const numericFee =
//               Number(
//                 assignmentFee
//               );

//             if (
//               !Number.isNaN(
//                 numericFee
//               )
//             ) {
//               setReplacementFee(
//                 currentFee => {
//                   // Prefer authoritative replacement request
//                   // fee if it has already been loaded.
//                   //
//                   // If currentFee came from the route,
//                   // schedule data can still populate it.
//                   return numericFee;
//                 }
//               );
//             }
//           }
//         }

//       } catch (error) {
//         console.error(
//           'Failed to fetch replacement schedule:',
//           error
//         );

//         Alert.alert(
//           tSafe(
//             'error',
//             'Error'
//           ),
//           tSafe(
//             'unable_to_load_replacement_request',
//             'Unable to load the replacement request.'
//           )
//         );

//       } finally {
//         setLoading(false);
//       }
//     },
//     [
//       scheduleId,
//       newCleaningDate,
//       cleaningTime,
//       geolocationData,
//       propertyName,
//       replacedCleanerId,
//       replacedCleanerName,
//       group,
//     ]
//   );

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     fetchReplacementRequest();
//     fetchSchedule();
//   }, [
//     fetchReplacementRequest,
//     fetchSchedule,
//   ]);

//   // =========================================================
//   // REFRESH WHEN SCREEN GETS FOCUS
//   // =========================================================

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const refreshRequest =
//         async () => {
//           if (!active) {
//             return;
//           }

//           await fetchReplacementRequest();

//           if (!active) {
//             return;
//           }

//           await fetchSchedule();
//         };

//       refreshRequest();

//       return () => {
//         active = false;
//       };
//     }, [
//       fetchReplacementRequest,
//       fetchSchedule,
//     ])
//   );

//   // =========================================================
//   // MAP
//   // =========================================================

//   useEffect(() => {
//     if (
//       apartmentLat !== '' &&
//       apartmentLng !== ''
//     ) {
//       const url =
//         `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
//         `pin-s+ff0000(${apartmentLng},${apartmentLat})/` +
//         `${apartmentLng},${apartmentLat},15,0/400x200` +
//         `?access_token=${MAP_BOX_SECRET_KEY}`;

//       setMapImageUrl(
//         url
//       );

//       setMapError(
//         false
//       );
//     }
//   }, [
//     apartmentLat,
//     apartmentLng,
//   ]);

//   // =========================================================
//   // DIRECTIONS
//   // =========================================================

//   const handleOpenDirections =
//     () => {
//       if (
//         !apartmentLat ||
//         !apartmentLng
//       ) {
//         Alert.alert(
//           tSafe(
//             'location_unavailable',
//             'Location unavailable'
//           ),
//           tSafe(
//             'directions_unavailable',
//             'Directions are not available for this property.'
//           )
//         );

//         return;
//       }

//       const originLat =
//         currentUser?.location?.latitude ||
//         geolocationData?.latitude;

//       const originLng =
//         currentUser?.location?.longitude ||
//         geolocationData?.longitude;

//       if (
//         originLat === undefined ||
//         originLat === null ||
//         originLng === undefined ||
//         originLng === null
//       ) {
//         const url =
//           `https://www.google.com/maps/search/?api=1` +
//           `&query=${apartmentLat},${apartmentLng}`;

//         Linking.openURL(
//           url
//         ).catch(() => {
//           Alert.alert(
//             tSafe(
//               'error',
//               'Error'
//             ),
//             tSafe(
//               'unable_to_open_maps',
//               'Unable to open directions.'
//             )
//           );
//         });

//         return;
//       }

//       const url =
//         `https://www.google.com/maps/dir/?api=1` +
//         `&origin=${originLat},${originLng}` +
//         `&destination=${apartmentLat},${apartmentLng}` +
//         `&travelmode=driving`;

//       Linking.openURL(
//         url
//       ).catch(() => {
//         Alert.alert(
//           tSafe(
//             'error',
//             'Error'
//           ),
//           tSafe(
//             'unable_to_open_maps',
//             'Unable to open directions.'
//           )
//         );
//       });
//     };

//   // =========================================================
//   // SCROLL TO TASK DETAILS
//   // =========================================================

//   const handleViewTaskDetails =
//     () => {
//       scrollViewRef.current?.scrollTo({
//         y: Math.max(
//           taskDetailsY.current - 15,
//           0
//         ),
//         animated: true,
//       });
//     };

//   // =========================================================
//   // FORMAT HELPERS
//   // =========================================================

//   const formatGroup =
//     groupValue => {
//       if (!groupValue) {
//         return '';
//       }

//       return String(
//         groupValue
//       )
//         .split('_')
//         .map(
//           word =>
//             word.charAt(0).toUpperCase() +
//             word.slice(1)
//         )
//         .join(' ');
//     };

//   const formatDate =
//     date => {
//       if (!date) {
//         return '';
//       }

//       // Prevent timezone shifting for YYYY-MM-DD
//       if (
//         typeof date === 'string' &&
//         /^\d{4}-\d{2}-\d{2}$/.test(
//           date
//         )
//       ) {
//         const [
//           year,
//           month,
//           day,
//         ] = date
//           .split('-')
//           .map(Number);

//         return moment(
//           new Date(
//             year,
//             month - 1,
//             day
//           )
//         ).format(
//           'ddd, MMM D, YYYY'
//         );
//       }

//       return moment(
//         date
//       ).format(
//         'ddd, MMM D, YYYY'
//       );
//     };

//   const formatTime =
//     time => {
//       if (!time) {
//         return '';
//       }

//       const parsed =
//         moment(
//           time,
//           [
//             'HH:mm:ss',
//             'HH:mm',
//             'h:mm:ss A',
//             'h:mm A',
//           ],
//           true
//         );

//       return parsed.isValid()
//         ? parsed.format(
//             'h:mm A'
//           )
//         : time;
//     };

//   // =========================================================
//   // FORMAT MONEY
//   // =========================================================

//   const formatMoney =
//     amount => {
//       if (
//         amount === undefined ||
//         amount === null ||
//         Number.isNaN(
//           Number(amount)
//         )
//       ) {
//         return null;
//       }

//       return `$${Number(
//         amount
//       ).toFixed(2)}`;
//     };

//   // =========================================================
//   // RESPONSE
//   // =========================================================

//   const submitResponse =
//     async acceptance => {
//       if (responding) {
//         return;
//       }

//       // ------------------------------------------------------
//       // Backend status is authoritative
//       // ------------------------------------------------------

//       if (
//         requestStatus !==
//         'pending'
//       ) {
//         let message =
//           tSafe(
//             'replacement_request_no_longer_pending',
//             'This replacement request is no longer pending.'
//           );

//         if (
//           requestStatus ===
//           'accepted'
//         ) {
//           message =
//             tSafe(
//               'replacement_request_already_accepted',
//               'You have already accepted this replacement request. The host will make the final selection.'
//             );
//         } else if (
//           requestStatus ===
//           'declined'
//         ) {
//           message =
//             tSafe(
//               'replacement_request_already_declined',
//               'You have already declined this replacement request.'
//             );
//         } else if (
//           requestStatus ===
//           'cancelled'
//         ) {
//           message =
//             tSafe(
//               'replacement_request_cancelled',
//               'This replacement request has been cancelled.'
//             );
//         } else if (
//           requestStatus ===
//           'payment_completed'
//         ) {
//           message =
//             tSafe(
//               'replacement_request_completed',
//               'This replacement request has already been completed.'
//             );
//         }

//         Alert.alert(
//           tSafe(
//             'request_already_responded',
//             'Request Already Responded'
//           ),
//           message
//         );

//         return;
//       }

//       try {
//         setResponding(
//           true
//         );

//         const data = {
//           scheduleId:
//             String(
//               scheduleId
//             ),

//           // IMPORTANT:
//           // This is the child replacement request ID.
//           requestId:
//             String(
//               requestId
//             ),

//           cleanerId:
//             String(
//               effectiveCleanerId
//             ),

//           acceptance,
//         };

//         console.log(
//           '🔄 Replacement response:',
//           data
//         );

//         const response =
//           await userService.respondToReplacementRequest(
//             data
//           );

//         console.log(
//           '✅ Replacement response result:',
//           response?.data
//         );

//         const newStatus =
//           response?.data?.status ||
//           response?.data?.request?.status ||
//           (
//             acceptance
//               ? 'accepted'
//               : 'declined'
//           );

//         setRequestStatus(
//           newStatus
//         );

//         if (
//           acceptance
//         ) {
//           Alert.alert(
//             tSafe(
//               'replacement_request_accepted_title',
//               'Request Accepted'
//             ),
//             tSafe(
//               'replacement_request_accepted_message',
//               'You have indicated that you are available for this replacement cleaning. The host will review the available cleaners and make the final selection.'
//             ),
//             [
//               {
//                 text:
//                   tSafe(
//                     'continue',
//                     'Continue'
//                   ),

//                 onPress:
//                   () => {
//                     navigation.navigate(
//                       ROUTES.cleaner_dashboard
//                     );
//                   },
//               },
//             ]
//           );
//         } else {
//           Alert.alert(
//             tSafe(
//               'replacement_request_declined_title',
//               'Request Declined'
//             ),
//             tSafe(
//               'replacement_request_declined_message',
//               'You have declined this replacement cleaning request.'
//             ),
//             [
//               {
//                 text:
//                   tSafe(
//                     'ok',
//                     'OK'
//                   ),

//                 onPress:
//                   () => {
//                     navigation.navigate(
//                       ROUTES.cleaner_dashboard
//                     );
//                   },
//               },
//             ]
//           );
//         }

//       } catch (
//         error
//       ) {
//         console.error(
//           '❌ Replacement response failed:',
//           error
//         );

//         Alert.alert(
//           tSafe(
//             'error',
//             'Error'
//           ),
//           error?.response?.data?.detail ||
//             error?.response?.data?.message ||
//             tSafe(
//               'replacement_response_failed',
//               'We could not submit your response. Please try again.'
//             )
//         );

//       } finally {
//         setResponding(
//           false
//         );
//       }
//     };

//   // =========================================================
//   // ACCEPT
//   // =========================================================

//   const handleAccept =
//     () => {
//       if (
//         requestStatus !==
//         'pending'
//       ) {
//         return;
//       }

//       Alert.alert(
//         tSafe(
//           'accept_replacement_title',
//           'Accept Replacement Cleaning'
//         ),
//         tSafe(
//           'accept_replacement_message',
//           'Are you sure you want to indicate that you are available for this replacement cleaning?'
//         ),
//         [
//           {
//             text:
//               tSafe(
//                 'cancel',
//                 'Cancel'
//               ),
//             style:
//               'cancel',
//           },

//           {
//             text:
//               tSafe(
//                 'accept',
//                 'Accept'
//               ),

//             onPress:
//               () =>
//                 submitResponse(
//                   true
//                 ),
//           },
//         ]
//       );
//     };

//   // =========================================================
//   // DECLINE
//   // =========================================================

//   const handleDecline =
//     () => {
//       if (
//         requestStatus !==
//         'pending'
//       ) {
//         return;
//       }

//       Alert.alert(
//         tSafe(
//           'decline_replacement_title',
//           'Decline Replacement Cleaning'
//         ),
//         tSafe(
//           'decline_replacement_message',
//           'Are you sure you want to decline this replacement cleaning request?'
//         ),
//         [
//           {
//             text:
//               tSafe(
//                 'cancel',
//                 'Cancel'
//               ),
//             style:
//               'cancel',
//           },

//           {
//             text:
//               tSafe(
//                 'decline',
//                 'Decline'
//               ),

//             style:
//               'destructive',

//             onPress:
//               () =>
//                 submitResponse(
//                   false
//                 ),
//           },
//         ]
//       );
//     };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (
//     loading ||
//     requestLoading
//   ) {
//     return (
//       <SafeAreaView
//         style={
//           styles.safeArea
//         }
//       >
//         <View
//           style={
//             styles.centered
//           }
//         >
//           <ActivityIndicator
//             size="large"
//             color={
//               COLORS.primary
//             }
//           />

//           <Text
//             style={
//               styles.loadingText
//             }
//           >
//             {tSafe(
//               'loading_replacement_request',
//               'Loading replacement request...'
//             )}
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // =========================================================
//   // REQUEST ERROR
//   // =========================================================

//   if (
//     requestError
//   ) {
//     return (
//       <SafeAreaView
//         style={
//           styles.safeArea
//         }
//       >
//         <StatusBar
//           translucent
//           backgroundColor="transparent"
//           barStyle="dark-content"
//         />

//         <View
//           style={
//             styles.centered
//           }
//         >
//           <View
//             style={
//               styles.errorIconContainer
//             }
//           >
//             <MaterialCommunityIcons
//               name="alert-circle-outline"
//               size={48}
//               color="#B91C1C"
//             />
//           </View>

//           <Text
//             style={
//               styles.errorTitle
//             }
//           >
//             {tSafe(
//               'replacement_request_unavailable',
//               'Replacement Request Unavailable'
//             )}
//           </Text>

//           <Text
//             style={
//               styles.errorText
//             }
//           >
//             {requestError}
//           </Text>

//           <TouchableOpacity
//             style={
//               styles.retryButton
//             }
//             onPress={() => {
//               fetchReplacementRequest();
//               fetchSchedule();
//             }}
//           >
//             <Text
//               style={
//                 styles.retryButtonText
//               }
//             >
//               {tSafe(
//                 'try_again',
//                 'Try Again'
//               )}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={
//               styles.backDashboardButton
//             }
//             onPress={() =>
//               navigation.navigate(
//                 ROUTES.cleaner_dashboard
//               )
//             }
//           >
//             <Text
//               style={
//                 styles.backDashboardText
//               }
//             >
//               {tSafe(
//                 'back_to_dashboard',
//                 'Back to Dashboard'
//               )}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // =========================================================
//   // ALREADY RESPONDED
//   // =========================================================

//   const alreadyResponded =
//     requestStatus !==
//     'pending';

//   // =========================================================
//   // RENDER
//   // =========================================================

//   return (
//     <SafeAreaView
//       style={
//         styles.safeArea
//       }
//     >
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />

//       <View
//         style={
//           styles.container
//         }
//       >
//         <ScrollView
//           ref={
//             scrollViewRef
//           }
//           showsVerticalScrollIndicator={
//             false
//           }
//           contentContainerStyle={
//             styles.scrollContent
//           }
//         >

//           {/* ================================================= */}
//           {/* MAP */}
//           {/* ================================================= */}

//           <View
//             style={
//               styles.mapContainer
//             }
//           >
//             {mapImageUrl &&
//             !mapError ? (
//               <Image
//                 source={{
//                   uri: mapImageUrl,
//                 }}
//                 style={
//                   styles.mapImage
//                 }
//                 resizeMode="cover"
//                 onError={() =>
//                   setMapError(
//                     true
//                   )
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
//                   color={
//                     COLORS.gray
//                   }
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
//               style={
//                 styles.mapOverlay
//               }
//             >
//               <View
//                 style={
//                   styles.distanceContainer
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="map-marker-distance"
//                   size={18}
//                   color="#FFFFFF"
//                 />

//                 <Text
//                   style={
//                     styles.distanceText
//                   }
//                 >
//                   {distance.toFixed(
//                     1
//                   )}{' '}
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
//                   style={
//                     styles.directionText
//                   }
//                 >
//                   {tSafe(
//                     'directions',
//                     'Directions'
//                   )}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* ================================================= */}
//           {/* PROPERTY */}
//           {/* ================================================= */}

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
//                   color={
//                     COLORS.primary
//                   }
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
//                     color={
//                       COLORS.gray
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.locationText
//                     }
//                   >
//                     {city &&
//                     state
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

//           {/* ================================================= */}
//           {/* REPLACEMENT BANNER */}
//           {/* ================================================= */}

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

//           {/* ================================================= */}
//           {/* REPLACEMENT DETAILS */}
//           {/* ================================================= */}

//           <View
//             style={
//               styles.replacementDetailsCard
//             }
//           >
//             <View
//               style={
//                 styles.replacementDetailsHeader
//               }
//             >
//               <View
//                 style={
//                   styles.replacementDetailsIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account-switch-outline"
//                   size={24}
//                   color="#B45309"
//                 />
//               </View>

//               <View
//                 style={
//                   styles.replacementDetailsHeaderText
//               }
//               >
//                 <Text
//                   style={
//                     styles.replacementDetailsTitle
//                   }
//                 >
//                   {tSafe(
//                     'replacement_details',
//                     'Replacement Details'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.replacementDetailsSubtitle
//                   }
//                 >
//                   {tSafe(
//                     'replacement_details_subtitle',
//                     'This assignment is replacing another cleaner.'
//                   )}
//                 </Text>
//               </View>
//             </View>

//             {/* Cleaner being replaced */}

//             <View
//               style={
//                 styles.replacedCleanerRow
//               }
//             >
//               <View
//                 style={
//                   styles.replacedCleanerAvatar
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account-outline"
//                   size={23}
//                   color="#6B7280"
//                 />
//               </View>

//               <View
//                 style={
//                   styles.replacedCleanerInfo
//                 }
//               >
//                 <Text
//                   style={
//                     styles.detailLabel
//                   }
//                 >
//                   {tSafe(
//                     'cleaner_being_replaced',
//                     'Cleaner Being Replaced'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.replacedCleanerName
//                   }
//                 >
//                   {originalCleaner.name ||
//                     tSafe(
//                       'previously_assigned_cleaner',
//                       'Previously assigned cleaner'
//                     )}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={
//                 styles.detailsDivider
//               }
//             />

//             {/* Earnings */}

//             <View
//               style={
//                 styles.earningsRow
//               }
//             >
//               <View
//                 style={
//                   styles.earningsIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="cash-multiple"
//                   size={24}
//                   color="#15803D"
//                 />
//               </View>

//               <View
//                 style={
//                   styles.earningsInfo
//                 }
//               >
//                 <Text
//                   style={
//                     styles.detailLabel
//                   }
//                 >
//                   {tSafe(
//                     'your_earnings',
//                     'Your Earnings'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.earningsAmount
//                   }
//                 >
//                   {formatMoney(
//                     replacementFee
//                   ) ||
//                     tSafe(
//                       'fee_not_available',
//                       'Fee not available'
//                     )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.earningsDescription
//                   }
//                 >
//                   {tSafe(
//                     'replacement_earnings_description',
//                     'This is the cleaning fee you will earn if you are selected for this replacement assignment.'
//                   )}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* ================================================= */}
//           {/* SCHEDULE */}
//           {/* ================================================= */}

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             {tSafe(
//               'cleaning_schedule',
//               'Cleaning Schedule'
//             )}
//           </Text>

//           <CustomCard
//             style={
//               styles.scheduleCard
//             }
//           >
//             {/* Date */}

//             <View
//               style={
//                 styles.scheduleItem
//               }
//             >
//               <View
//                 style={
//                   styles.scheduleIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="calendar-outline"
//                   size={23}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <View
//                 style={
//                   styles.scheduleContent
//                 }
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
//               style={
//                 styles.divider
//               }
//             />

//             {/* Time */}

//             <View
//               style={
//                 styles.scheduleItem
//               }
//             >
//               <View
//                 style={
//                   styles.scheduleIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="clock-outline"
//                   size={23}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <View
//                 style={
//                   styles.scheduleContent
//                 }
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
//               style={
//                 styles.divider
//               }
//             />

//             {/* Group */}

//             <View
//               style={
//                 styles.scheduleItem
//               }
//             >
//               <View
//                 style={
//                   styles.scheduleIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account-group-outline"
//                   size={23}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <View
//                 style={
//                   styles.scheduleContent
//                 }
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
//                   {formatGroup(
//                     group
//                   )}
//                 </Text>
//               </View>
//             </View>
//           </CustomCard>

//           {/* ================================================= */}
//           {/* VIEW FULL TASK DETAILS */}
//           {/* ================================================= */}

//           <TouchableOpacity
//             style={
//               styles.taskDetailsButton
//             }
//             onPress={
//               handleViewTaskDetails
//             }
//           >
//             <View
//               style={
//                 styles.taskDetailsIcon
//               }
//             >
//               <MaterialCommunityIcons
//                 name="clipboard-text-outline"
//                 size={23}
//                 color={
//                   COLORS.primary
//                 }
//               />
//             </View>

//             <View
//               style={
//                 styles.taskDetailsContent
//             }
//             >
//               <Text
//                 style={
//                   styles.taskDetailsTitle
//                 }
//               >
//                 {tSafe(
//                   'view_full_task_details',
//                   'View Full Task Details'
//                 )}
//               </Text>

//               <Text
//                 style={
//                   styles.taskDetailsSubtitle
//                 }
//               >
//                 {tSafe(
//                   'view_full_task_details_description',
//                   'Review rooms, checklist, duration, and cleaning requirements before accepting.'
//                 )}
//               </Text>
//             </View>

//             <MaterialCommunityIcons
//               name="chevron-right"
//               size={24}
//               color={
//                 COLORS.primary
//               }
//             />
//           </TouchableOpacity>

//           {/* ================================================= */}
//           {/* CLEANING SUMMARY */}
//           {/* ================================================= */}

//           <View
//             onLayout={event => {
//               taskDetailsY.current =
//                 event.nativeEvent.layout.y;
//             }}
//             style={
//               styles.summaryContainer
//             }
//           >
//             <CleaningSummary
//               checklist={
//                 checklist
//               }
//               assignedTo={
//                 assignedTo
//               }
//               schedule_status="open"
//               isEditable={false}
//               handleAccept={() => {}}
//             />
//           </View>

//           {/* ================================================= */}
//           {/* RESPONSE EXPLANATION */}
//           {/* ================================================= */}

//           {!alreadyResponded && (
//             <View
//               style={
//                 styles.responseCard
//               }
//             >
//               <MaterialCommunityIcons
//                 name="information-outline"
//                 size={22}
//                 color={
//                   COLORS.primary
//                 }
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

//           {/* ================================================= */}
//           {/* ALREADY RESPONDED */}
//           {/* ================================================= */}

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
//                   : requestStatus ===
//                       'declined'
//                     ? tSafe(
//                         'replacement_declined',
//                         'You declined this replacement request.'
//                       )
//                     : requestStatus ===
//                         'cancelled'
//                       ? tSafe(
//                           'replacement_cancelled',
//                           'This replacement request has been cancelled.'
//                         )
//                       : tSafe(
//                           'replacement_completed',
//                           'This replacement request has already been completed.'
//                         )}
//               </Text>
//             </View>
//           )}
//         </ScrollView>

//         {/* ================================================= */}
//         {/* BOTTOM ACTIONS */}
//         {/* ================================================= */}

//         {!alreadyResponded && (
//           <View
//             style={
//               styles.bottomActions
//             }
//           >
//             {/* Decline */}

//             <TouchableOpacity
//               style={
//                 styles.declineButton
//               }
//               onPress={
//                 handleDecline
//               }
//               disabled={
//                 responding
//               }
//             >
//               {responding ? (
//                 <ActivityIndicator
//                   size="small"
//                   color={
//                     COLORS.gray
//                   }
//                 />
//               ) : (
//                 <>
//                   <MaterialCommunityIcons
//                     name="close"
//                     size={20}
//                     color={
//                       COLORS.gray
//                     }
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

//             {/* Accept */}

//             <TouchableOpacity
//               style={
//                 styles.acceptButton
//               }
//               onPress={
//                 handleAccept
//               }
//               disabled={
//                 responding
//               }
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
// // STYLES
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
//     paddingHorizontal: 25,
//   },

//   loadingText: {
//     marginTop: 12,
//     fontSize: 15,
//     color: '#6B7280',
//   },

//   errorIconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#FEF2F2',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   errorTitle: {
//     marginTop: 18,
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#1F2937',
//     textAlign: 'center',
//   },

//   errorText: {
//     marginTop: 8,
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#6B7280',
//     textAlign: 'center',
//   },

//   retryButton: {
//     marginTop: 22,
//     paddingHorizontal: 28,
//     paddingVertical: 13,
//     borderRadius: 13,
//     backgroundColor: COLORS.primary,
//   },

//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//   },

//   backDashboardButton: {
//     marginTop: 12,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },

//   backDashboardText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   scrollContent: {
//     paddingBottom: 135,
//   },

//   // ==========================================================
//   // MAP
//   // ==========================================================

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
//     justifyContent: 'space-between',
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

//   // ==========================================================
//   // PROPERTY
//   // ==========================================================

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

//   // ==========================================================
//   // REPLACEMENT BANNER
//   // ==========================================================

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

//   // ==========================================================
//   // REPLACEMENT DETAILS
//   // ==========================================================

//   replacementDetailsCard: {
//     marginHorizontal: 16,
//     marginTop: 18,
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },

//   replacementDetailsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   replacementDetailsIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 14,
//     backgroundColor: '#FFF7ED',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   replacementDetailsHeaderText: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   replacementDetailsTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#1F2937',
//   },

//   replacementDetailsSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#6B7280',
//   },

//   replacedCleanerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 18,
//   },

//   replacedCleanerAvatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   replacedCleanerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   detailLabel: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginBottom: 3,
//   },

//   replacedCleanerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//   },

//   detailsDivider: {
//     height: 1,
//     backgroundColor: '#F1F5F9',
//     marginVertical: 16,
//   },

//   earningsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   earningsIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#F0FDF4',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   earningsInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   earningsAmount: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#15803D',
//   },

//   earningsDescription: {
//     marginTop: 3,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#6B7280',
//   },

//   // ==========================================================
//   // SCHEDULE
//   // ==========================================================

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

//   // ==========================================================
//   // TASK DETAILS BUTTON
//   // ==========================================================

//   taskDetailsButton: {
//     marginHorizontal: 16,
//     marginTop: 18,
//     padding: 15,
//     borderRadius: 16,
//     backgroundColor: '#EFF6FF',
//     borderWidth: 1,
//     borderColor: '#DBEAFE',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   taskDetailsIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#FFFFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   taskDetailsContent: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   taskDetailsTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#1D4ED8',
//   },

//   taskDetailsSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#475569',
//   },

//   // ==========================================================
//   // SUMMARY
//   // ==========================================================

//   summaryContainer: {
//     marginHorizontal: 16,
//     marginTop: 20,
//   },

//   // ==========================================================
//   // RESPONSE INFO
//   // ==========================================================

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

//   // ==========================================================
//   // RESPONSE STATUS
//   // ==========================================================

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

//   // ==========================================================
//   // BOTTOM ACTIONS
//   // ==========================================================

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











import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
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

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import {
  AppText,
  AppCard,
  AppButton,
  AppIconButton,
  AppSection,
} from '../../ui';

import { useTheme } from '../../theme';

import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';

import CleaningSummary from './CleaningSummary';

import moment from 'moment';
import calculateDistance from '../../utils/calculateDistance';
import { getCityState } from '../../utils/getAddressFromCoordinates';
import { MAP_BOX_SECRET_KEY } from '../../env';
import { tSafe } from '../../utils/tSafe';

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const R = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

/* -------------------------------------------------------------------------- */
/* Reusable UI components                                                     */
/* -------------------------------------------------------------------------- */

const InfoRow = ({
  icon,
  label,
  value,
  theme,
  styles,
  iconColor,
  children,
}) => (
  <View style={styles.infoRow}>
    <View
      style={[
        styles.infoIcon,
        {
          backgroundColor: theme.surface.selected,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={iconColor || theme.brand.primary}
      />
    </View>

    <View style={styles.infoContent}>
      <AppText
        variant="caption"
        color={theme.text.secondary}
        style={styles.infoLabel}
      >
        {label}
      </AppText>

      {children || (
        <AppText
          variant="bodyMedium"
          style={styles.infoValue}
        >
          {value || '—'}
        </AppText>
      )}
    </View>
  </View>
);

const StatusBadge = ({
  label,
  color,
  theme,
  styles,
}) => (
  <View
    style={[
      styles.statusBadge,
      {
        backgroundColor: `${color}18`,
        borderColor: `${color}45`,
      },
    ]}
  >
    <View
      style={[
        styles.statusDot,
        { backgroundColor: color },
      ]}
    />

    <AppText
      variant="caption"
      style={[
        styles.statusBadgeText,
        { color },
      ]}
    >
      {label}
    </AppText>
  </View>
);

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

export default function ReplacementRequest({ route }) {
  const navigation = useNavigation();

  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  const scrollViewRef = useRef(null);
  const taskDetailsY = useRef(0);

  /* -------------------------------- Route params --------------------------- */

  const {
    requestId,
    scheduleId,
    cleanerId,
    oldCleaningDate,
    newCleaningDate,
    propertyName,
    cleaningTime,
    group,
    replacedCleanerId,
    replacedCleanerName,
    replacementFee: routeReplacementFee,
  } = route?.params || {};

  /* -------------------------------- Authentication ------------------------ */

  const {
    geolocationData,
    currentUserId,
    currentUser,
  } = useContext(AuthContext);

  const effectiveCleanerId = cleanerId || currentUserId;

  /* -------------------------------- Schedule state ------------------------ */

  const [schedule, setSchedule] = useState({});
  const [checklist, setChecklist] = useState({});
  const [assignedTo, setAssignedTo] = useState([]);

  const [cleaningDate, setCleaningDate] = useState(
    newCleaningDate || ''
  );

  const [cleaningStartTime, setCleaningStartTime] = useState(
    cleaningTime || ''
  );

  const [cleaningEndTime, setCleaningEndTime] = useState('');

  /* -------------------------------- Location state ------------------------ */

  const [apartmentLat, setApartmentLatitude] = useState('');
  const [apartmentLng, setApartmentLongitude] = useState('');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [apartmentName, setApartmentName] = useState(
    propertyName || ''
  );

  const [distance, setDistance] = useState(0);

  /* -------------------------------- Replacement state --------------------- */

  const [replacementFee, setReplacementFee] = useState(
    routeReplacementFee !== undefined &&
      routeReplacementFee !== null
      ? Number(routeReplacementFee)
      : null
  );

  const [originalCleaner, setOriginalCleaner] = useState({
    cleanerId: replacedCleanerId || null,
    name: replacedCleanerName || '',
  });

  /* -------------------------------- Loading / response state -------------- */

  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [responding, setResponding] = useState(false);
  const [requestStatus, setRequestStatus] = useState('pending');

  /* -------------------------------- Map state ----------------------------- */

  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [mapError, setMapError] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Fetch authoritative replacement request                                  */
  /* ------------------------------------------------------------------------ */

  const fetchReplacementRequest = useCallback(async () => {
    try {
      if (!requestId) {
        throw new Error(
          tSafe(
            'missing_request_id',
            'Missing replacement request information.'
          )
        );
      }

      setRequestLoading(true);
      setRequestError(null);

      const response = await userService.getReplacementRequest(
        String(requestId)
      );

      const replacementRequest =
        response?.data?.request ||
        response?.request;

      if (!replacementRequest) {
        throw new Error(
          tSafe(
            'replacement_request_not_found',
            'Replacement request was not found.'
          )
        );
      }

      /* Verify that the request belongs to this cleaner. */

      if (
        effectiveCleanerId &&
        replacementRequest.cleanerId &&
        String(replacementRequest.cleanerId) !==
          String(effectiveCleanerId)
      ) {
        throw new Error(
          tSafe(
            'replacement_request_not_assigned',
            'This replacement request is not assigned to your account.'
          )
        );
      }

      /* Verify the schedule association. */

      if (
        scheduleId &&
        replacementRequest.scheduleId &&
        String(replacementRequest.scheduleId) !==
          String(scheduleId)
      ) {
        throw new Error(
          tSafe(
            'replacement_request_invalid',
            'This replacement request is no longer valid.'
          )
        );
      }

      /* Backend status is authoritative. */

      setRequestStatus(
        replacementRequest.status || 'pending'
      );

      /* Use the replacement cleaner's earnings, not host compensation. */

      if (
        replacementRequest.replacement_cleaner_fee !== undefined &&
        replacementRequest.replacement_cleaner_fee !== null
      ) {
        const backendFee = Number(
          replacementRequest.replacement_cleaner_fee
        );

        if (!Number.isNaN(backendFee)) {
          setReplacementFee(backendFee);
        }
      }

      /* Update the original cleaner information. */

      if (replacementRequest.replacesCleanerId) {
        setOriginalCleaner((previous) => ({
          ...previous,
          cleanerId: replacementRequest.replacesCleanerId,
          name:
            previous?.name ||
            replacedCleanerName ||
            '',
        }));
      }

      return replacementRequest;
    } catch (error) {
      console.error(
        'Failed to fetch replacement request:',
        error
      );

      setRequestError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          tSafe(
            'unable_to_load_replacement_request',
            'Unable to load the replacement request.'
          )
      );

      return null;
    } finally {
      setRequestLoading(false);
    }
  }, [
    requestId,
    scheduleId,
    effectiveCleanerId,
    replacedCleanerName,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Fetch schedule                                                           */
  /* ------------------------------------------------------------------------ */

  const fetchSchedule = useCallback(async () => {
    try {
      if (!scheduleId) {
        throw new Error(
          tSafe(
            'missing_schedule_id',
            'Missing schedule information.'
          )
        );
      }

      const response = await userService.getScheduleById(
        scheduleId
      );

      const res = response?.data || {};

      setSchedule(res);

      /* Checklist. */

      setChecklist(
        res?.overall_checklist?.checklist || {}
      );

      /* Assigned cleaners. */

      const assignments = Array.isArray(res?.assignedTo)
        ? res.assignedTo
        : [];

      setAssignedTo(assignments);

      /* Schedule date and time. */

      const scheduleData = res?.schedule || {};

      setCleaningDate(
        scheduleData?.cleaning_date ||
          newCleaningDate ||
          ''
      );

      setCleaningStartTime(
        scheduleData?.cleaning_time ||
          cleaningTime ||
          ''
      );

      setCleaningEndTime(
        scheduleData?.cleaning_end_time || ''
      );

      /* Property coordinates. */

      const lat = scheduleData?.apartment_latitude;
      const lng = scheduleData?.apartment_longitude;

      if (
        lat !== undefined &&
        lat !== null &&
        lng !== undefined &&
        lng !== null
      ) {
        setApartmentLatitude(lat);
        setApartmentLongitude(lng);

        const coordinate = {
          latitude: Number(lat),
          longitude: Number(lng),
        };

        /* Resolve city and state. */

        try {
          const locationResult = await getCityState(
            coordinate
          );

          if (locationResult) {
            setCity(locationResult.city || '');
            setState(locationResult.state || '');
          }
        } catch (locationError) {
          console.log(
            'Location lookup error:',
            locationError
          );
        }

        /* Calculate distance from the cleaner. */

        if (
          geolocationData?.latitude !== undefined &&
          geolocationData?.longitude !== undefined
        ) {
          const calculatedDistance = calculateDistance(
            geolocationData.latitude,
            geolocationData.longitude,
            Number(lat),
            Number(lng)
          );

          setDistance(calculatedDistance);
        }
      }

      /* Property name. */

      setApartmentName(
        scheduleData?.apartment_name ||
          propertyName ||
          ''
      );

      /* Find the cleaner being replaced. */

      let replacementAssignment = null;

      if (replacedCleanerId) {
        replacementAssignment = assignments.find(
          (assignment) =>
            String(assignment?.cleanerId) ===
            String(replacedCleanerId)
        );
      }

      if (!replacementAssignment && group) {
        replacementAssignment = assignments.find(
          (assignment) =>
            assignment?.group === group &&
            assignment?.status === 'replacement_required'
        );
      }

      if (!replacementAssignment && group) {
        replacementAssignment = assignments.find(
          (assignment) => assignment?.group === group
        );
      }

      if (replacementAssignment) {
        const originalCleanerId =
          replacementAssignment?.cleanerId;

        const firstName =
          replacementAssignment?.firstname || '';

        const lastName =
          replacementAssignment?.lastname || '';

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

        /*
         * Read the assignment's cleaning fee.
         * The authoritative replacement-request fee, when available,
         * is applied by fetchReplacementRequest().
         */

        const assignmentChecklist =
          replacementAssignment?.checklist || {};

        const assignmentFee =
          assignmentChecklist?.calculatedPrice ??
          assignmentChecklist?.price;

        if (
          assignmentFee !== undefined &&
          assignmentFee !== null
        ) {
          const numericFee = Number(assignmentFee);

          if (!Number.isNaN(numericFee)) {
            setReplacementFee(numericFee);
          }
        }
      }
    } catch (error) {
      console.error(
        'Failed to fetch replacement schedule:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        error?.response?.data?.detail ||
          error?.message ||
          tSafe(
            'unable_to_load_replacement_request',
            'Unable to load the replacement request.'
          )
      );
    } finally {
      setLoading(false);
    }
  }, [
    scheduleId,
    newCleaningDate,
    cleaningTime,
    geolocationData,
    propertyName,
    replacedCleanerId,
    replacedCleanerName,
    group,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Initial load                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchReplacementRequest();
    fetchSchedule();
  }, [
    fetchReplacementRequest,
    fetchSchedule,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Refresh when screen receives focus                                      */
  /* ------------------------------------------------------------------------ */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refreshRequest = async () => {
        if (!active) {
          return;
        }

        await fetchReplacementRequest();

        if (!active) {
          return;
        }

        await fetchSchedule();
      };

      refreshRequest();

      return () => {
        active = false;
      };
    }, [
      fetchReplacementRequest,
      fetchSchedule,
    ])
  );

  /* ------------------------------------------------------------------------ */
  /* Map                                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      apartmentLat !== '' &&
      apartmentLng !== ''
    ) {
      const mapPinColor = theme.brand.primary.replace(
        '#',
        ''
      );

      const url =
        'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/' +
        `pin-s+${mapPinColor}(${apartmentLng},${apartmentLat})/` +
        `${apartmentLng},${apartmentLat},15,0/600x300` +
        `?access_token=${MAP_BOX_SECRET_KEY}`;

      setMapImageUrl(url);
      setMapError(false);
    } else {
      setMapImageUrl(null);
    }
  }, [
    apartmentLat,
    apartmentLng,
    theme.brand.primary,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Directions                                                               */
  /* ------------------------------------------------------------------------ */

  const handleOpenDirections = () => {
    if (
      apartmentLat === '' ||
      apartmentLng === ''
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
      currentUser?.location?.latitude ??
      geolocationData?.latitude;

    const originLng =
      currentUser?.location?.longitude ??
      geolocationData?.longitude;

    let url;

    if (
      originLat === undefined ||
      originLat === null ||
      originLng === undefined ||
      originLng === null
    ) {
      url =
        'https://www.google.com/maps/search/?api=1' +
        `&query=${apartmentLat},${apartmentLng}`;
    } else {
      url =
        'https://www.google.com/maps/dir/?api=1' +
        `&origin=${originLat},${originLng}` +
        `&destination=${apartmentLat},${apartmentLng}` +
        '&travelmode=driving';
    }

    Linking.openURL(url).catch(() => {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'unable_to_open_maps',
          'Unable to open directions.'
        )
      );
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Scroll to task details                                                   */
  /* ------------------------------------------------------------------------ */

  const handleViewTaskDetails = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(taskDetailsY.current - 15, 0),
      animated: true,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Formatting helpers                                                       */
  /* ------------------------------------------------------------------------ */

  const formatGroup = (groupValue) => {
    if (!groupValue) {
      return '';
    }

    return String(groupValue)
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  };

  const formatDate = (date) => {
    if (!date) {
      return '';
    }

    /*
     * Parse YYYY-MM-DD in local time to prevent
     * the date from shifting to the previous day.
     */

    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      const [year, month, day] = date
        .split('-')
        .map(Number);

      return moment(
        new Date(year, month - 1, day)
      ).format('ddd, MMM D, YYYY');
    }

    return moment(date).format(
      'ddd, MMM D, YYYY'
    );
  };

  const formatTime = (time) => {
    if (!time) {
      return '';
    }

    const parsed = moment(
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
      ? parsed.format('h:mm A')
      : time;
  };

  const formatMoney = (amount) => {
    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(Number(amount))
    ) {
      return null;
    }

    return `$${Number(amount).toFixed(2)}`;
  };

  /* ------------------------------------------------------------------------ */
  /* Submit replacement response                                              */
  /* ------------------------------------------------------------------------ */

  const submitResponse = async (acceptance) => {
    if (responding) {
      return;
    }

    /* Do not submit a response to a request that is no longer pending. */

    if (requestStatus !== 'pending') {
      let message = tSafe(
        'replacement_request_no_longer_pending',
        'This replacement request is no longer pending.'
      );

      if (requestStatus === 'accepted') {
        message = tSafe(
          'replacement_request_already_accepted',
          'You have already accepted this replacement request. The host will make the final selection.'
        );
      } else if (requestStatus === 'declined') {
        message = tSafe(
          'replacement_request_already_declined',
          'You have already declined this replacement request.'
        );
      } else if (requestStatus === 'cancelled') {
        message = tSafe(
          'replacement_request_cancelled',
          'This replacement request has been cancelled.'
        );
      } else if (requestStatus === 'payment_completed') {
        message = tSafe(
          'replacement_request_completed',
          'This replacement request has already been completed.'
        );
      }

      Alert.alert(
        tSafe(
          'request_already_responded',
          'Request Already Responded'
        ),
        message
      );

      return;
    }

    try {
      setResponding(true);

      const data = {
        scheduleId: String(scheduleId),

        // This must be the child replacement-request ID.
        requestId: String(requestId),

        cleanerId: String(effectiveCleanerId),

        acceptance,
      };

      const response =
        await userService.respondToReplacementRequest(
          data
        );

      const newStatus =
        response?.data?.status ||
        response?.data?.request?.status ||
        (acceptance ? 'accepted' : 'declined');

      setRequestStatus(newStatus);

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
              text: tSafe('continue', 'Continue'),
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
              text: tSafe('ok', 'OK'),
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
        'Replacement response failed:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          tSafe(
            'replacement_response_failed',
            'We could not submit your response. Please try again.'
          )
      );
    } finally {
      setResponding(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Accept                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleAccept = () => {
    if (requestStatus !== 'pending' || responding) {
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
          text: tSafe('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: tSafe('accept', 'Accept'),
          onPress: () => submitResponse(true),
        },
      ]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Decline                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleDecline = () => {
    if (requestStatus !== 'pending' || responding) {
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
          text: tSafe('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: tSafe('decline', 'Decline'),
          style: 'destructive',
          onPress: () => submitResponse(false),
        },
      ]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                            */
  /* ------------------------------------------------------------------------ */

  if (loading || requestLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={
            isDark ? 'light-content' : 'dark-content'
          }
          backgroundColor={theme.background.default}
        />

        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            variant="bodyMedium"
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_replacement_request',
              'Loading replacement request...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Request error                                                            */
  /* ------------------------------------------------------------------------ */

  if (requestError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={
            isDark ? 'light-content' : 'dark-content'
          }
          backgroundColor={theme.background.default}
        />

        <View style={styles.centered}>
          <View
            style={[
              styles.errorIconContainer,
              {
                backgroundColor: `${theme.status.error}18`,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={46}
              color={theme.status.error}
            />
          </View>

          <AppText
            variant="heading"
            style={styles.errorTitle}
          >
            {tSafe(
              'replacement_request_unavailable',
              'Replacement Request Unavailable'
            )}
          </AppText>

          <AppText
            variant="body"
            color={theme.text.secondary}
            style={styles.errorText}
          >
            {requestError}
          </AppText>

          <AppButton
            title={tSafe('try_again', 'Try Again')}
            icon="refresh"
            onPress={() => {
              fetchReplacementRequest();
              fetchSchedule();
            }}
            style={styles.errorAction}
          />

          <AppButton
            title={tSafe(
              'back_to_dashboard',
              'Back to Dashboard'
            )}
            variant="outline"
            onPress={() =>
              navigation.navigate(
                ROUTES.cleaner_dashboard
              )
            }
            style={styles.errorAction}
          />
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Response state                                                           */
  /* ------------------------------------------------------------------------ */

  const alreadyResponded = requestStatus !== 'pending';

  const accepted = requestStatus === 'accepted';
  const declined = requestStatus === 'declined';
  const cancelled = requestStatus === 'cancelled';

  const responseColor = accepted
    ? theme.status.success
    : declined || cancelled
      ? theme.status.error
      : theme.status.info;

  const responseMessage = accepted
    ? tSafe(
        'replacement_accepted',
        'You accepted this replacement request.'
      )
    : declined
      ? tSafe(
          'replacement_declined',
          'You declined this replacement request.'
        )
      : cancelled
        ? tSafe(
            'replacement_cancelled',
            'This replacement request has been cancelled.'
          )
        : tSafe(
            'replacement_completed',
            'This replacement request has already been completed.'
          );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
        backgroundColor={theme.background.default}
      />

      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ================================================================ */}
          {/* PROPERTY MAP                                                     */}
          {/* ================================================================ */}

          <View style={styles.mapContainer}>
            {mapImageUrl && !mapError ? (
              <Image
                source={{ uri: mapImageUrl }}
                style={styles.mapImage}
                resizeMode="cover"
                onError={() => setMapError(true)}
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <MaterialCommunityIcons
                  name="map-outline"
                  size={42}
                  color={theme.icon.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.placeholderText}
                >
                  {tSafe(
                    'map_unavailable',
                    'Map unavailable'
                  )}
                </AppText>
              </View>
            )}

            <View style={styles.mapOverlay}>
              <View style={styles.distanceContainer}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={18}
                  color="#FFFFFF"
                />

                <AppText
                  variant="bodyMedium"
                  color="#FFFFFF"
                  style={styles.distanceText}
                >
                  {Number(distance || 0).toFixed(1)}{' '}
                  {tSafe('miles_away', 'miles away')}
                </AppText>
              </View>

              <TouchableOpacity
                onPress={handleOpenDirections}
                activeOpacity={0.8}
                style={styles.directionButton}
              >
                <MaterialCommunityIcons
                  name="directions"
                  size={19}
                  color="#FFFFFF"
                />

                <AppText
                  variant="label"
                  color="#FFFFFF"
                  style={styles.directionText}
                >
                  {tSafe('directions', 'Directions')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================================================================ */}
          {/* PROPERTY DETAILS                                                 */}
          {/* ================================================================ */}

          <AppCard
            padding="medium"
            radius="large"
            bordered
            elevated
            style={styles.propertyCard}
          >
            <View style={styles.propertyHeader}>
              <View style={styles.propertyIcon}>
                <MaterialCommunityIcons
                  name="home-outline"
                  size={26}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.propertyInfo}>
                <AppText
                  variant="heading"
                  style={styles.propertyName}
                >
                  {apartmentName ||
                    tSafe('property', 'Property')}
                </AppText>

                <View style={styles.locationRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={theme.icon.muted}
                  />

                  <AppText
                    variant="body"
                    color={theme.text.secondary}
                    style={styles.locationText}
                  >
                    {city && state
                      ? `${city}, ${state}`
                      : tSafe('location', 'Location')}
                  </AppText>
                </View>
              </View>
            </View>
          </AppCard>

          {/* ================================================================ */}
          {/* REPLACEMENT BANNER                                               */}
          {/* ================================================================ */}

          <View style={styles.section}>
            <AppCard
              padding="medium"
              radius="large"
              bordered
              style={styles.replacementBanner}
            >
              <View
                style={[
                  styles.bannerIcon,
                  {
                    backgroundColor: `${theme.status.warning}20`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-switch-outline"
                  size={25}
                  color={theme.status.warning}
                />
              </View>

              <View style={styles.bannerContent}>
                <AppText
                  variant="title"
                  style={styles.bannerTitle}
                >
                  {tSafe(
                    'replacement_assignment',
                    'Replacement Assignment'
                  )}
                </AppText>

                <AppText
                  variant="body"
                  color={theme.text.secondary}
                  style={styles.bannerText}
                >
                  {tSafe(
                    'replacement_assignment_description',
                    'The cleaner originally assigned to this cleaning is unavailable for the updated date. The host is asking if you are available to take this assignment.'
                  )}
                </AppText>
              </View>
            </AppCard>
          </View>

          {/* ================================================================ */}
          {/* REPLACEMENT DETAILS                                              */}
          {/* ================================================================ */}

          <View style={styles.section}>
            <AppSection
              title={tSafe(
                'replacement_details',
                'Replacement Details'
              )}
            >
              <AppCard
                padding="medium"
                radius="large"
                bordered
                elevated
              >
                <View style={styles.replacementDetailsHeader}>
                  <View style={styles.replacementDetailsIcon}>
                    <MaterialCommunityIcons
                      name="account-switch-outline"
                      size={24}
                      color={theme.brand.primary}
                    />
                  </View>

                  <View style={styles.replacementDetailsHeaderText}>
                    <AppText variant="title">
                      {tSafe(
                        'replacement_details',
                        'Replacement Details'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      style={styles.replacementDetailsSubtitle}
                    >
                      {tSafe(
                        'replacement_details_subtitle',
                        'This assignment is replacing another cleaner.'
                      )}
                    </AppText>
                  </View>
                </View>

                <View style={styles.innerDivider} />

                {/* Cleaner being replaced */}

                <View style={styles.cleanerRow}>
                  <View style={styles.cleanerAvatar}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={24}
                      color={theme.icon.muted}
                    />
                  </View>

                  <View style={styles.cleanerInfo}>
                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                    >
                      {tSafe(
                        'cleaner_being_replaced',
                        'Cleaner Being Replaced'
                      )}
                    </AppText>

                    <AppText
                      variant="bodyMedium"
                      style={styles.cleanerName}
                    >
                      {originalCleaner.name ||
                        tSafe(
                          'previously_assigned_cleaner',
                          'Previously assigned cleaner'
                        )}
                    </AppText>
                  </View>
                </View>

                <View style={styles.innerDivider} />

                {/* Earnings */}

                <View style={styles.earningsRow}>
                  <View
                    style={[
                      styles.earningsIcon,
                      {
                        backgroundColor: `${theme.status.success}18`,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cash-multiple"
                      size={24}
                      color={theme.status.success}
                    />
                  </View>

                  <View style={styles.earningsInfo}>
                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                    >
                      {tSafe('your_earnings', 'Your Earnings')}
                    </AppText>

                    <AppText
                      variant="display"
                      color={theme.status.success}
                      style={styles.earningsAmount}
                    >
                      {formatMoney(replacementFee) ||
                        tSafe(
                          'fee_not_available',
                          'Fee not available'
                        )}
                    </AppText>

                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      style={styles.earningsDescription}
                    >
                      {tSafe(
                        'replacement_earnings_description',
                        'This is the cleaning fee you will earn if you are selected for this replacement assignment.'
                      )}
                    </AppText>
                  </View>
                </View>
              </AppCard>
            </AppSection>
          </View>

          {/* ================================================================ */}
          {/* CLEANING SCHEDULE                                                */}
          {/* ================================================================ */}

          <View style={styles.section}>
            <AppSection
              title={tSafe(
                'cleaning_schedule',
                'Cleaning Schedule'
              )}
            >
              <AppCard
                padding="medium"
                radius="large"
                bordered
                elevated
              >
                <InfoRow
                  icon="calendar-outline"
                  label={tSafe(
                    'cleaning_date',
                    'Cleaning Date'
                  )}
                  value={formatDate(cleaningDate)}
                  theme={theme}
                  styles={styles}
                />

                {oldCleaningDate && (
                  <View style={styles.previousDateContainer}>
                    <MaterialCommunityIcons
                      name="history"
                      size={15}
                      color={theme.text.secondary}
                    />

                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      style={styles.previousDate}
                    >
                      {tSafe(
                        'previous_date',
                        'Previous date'
                      )}{' '}
                      {formatDate(oldCleaningDate)}
                    </AppText>
                  </View>
                )}

                <View style={styles.divider} />

                <InfoRow
                  icon="clock-outline"
                  label={tSafe(
                    'cleaning_time',
                    'Cleaning Time'
                  )}
                  value={`${formatTime(cleaningStartTime)}${
                    cleaningEndTime
                      ? ` – ${formatTime(cleaningEndTime)}`
                      : ''
                  }`}
                  theme={theme}
                  styles={styles}
                />

                <View style={styles.divider} />

                <InfoRow
                  icon="account-group-outline"
                  label={tSafe(
                    'cleaning_group',
                    'Cleaning Group'
                  )}
                  value={formatGroup(group)}
                  theme={theme}
                  styles={styles}
                />
              </AppCard>
            </AppSection>
          </View>

          {/* ================================================================ */}
          {/* FULL TASK DETAILS                                                */}
          {/* ================================================================ */}

          <TouchableOpacity
            style={styles.taskDetailsButton}
            onPress={handleViewTaskDetails}
            activeOpacity={0.85}
          >
            <View style={styles.taskDetailsIcon}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={23}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.taskDetailsContent}>
              <AppText
                variant="title"
                style={styles.taskDetailsTitle}
              >
                {tSafe(
                  'view_full_task_details',
                  'View Full Task Details'
                )}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.secondary}
                style={styles.taskDetailsSubtitle}
              >
                {tSafe(
                  'view_full_task_details_description',
                  'Review rooms, checklist, duration, and cleaning requirements before accepting.'
                )}
              </AppText>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.brand.primary}
            />
          </TouchableOpacity>

          {/* ================================================================ */}
          {/* CLEANING SUMMARY                                                 */}
          {/* ================================================================ */}

          <View
            onLayout={(event) => {
              taskDetailsY.current =
                event.nativeEvent.layout.y;
            }}
            style={styles.summaryContainer}
          >
            <CleaningSummary
              checklist={checklist}
              assignedTo={assignedTo}
              schedule_status="open"
              isEditable={false}
              handleAccept={() => {}}
            />
          </View>

          {/* ================================================================ */}
          {/* RESPONSE EXPLANATION                                             */}
          {/* ================================================================ */}

          {!alreadyResponded && (
            <View style={styles.section}>
              <AppCard
                padding="medium"
                radius="large"
                bordered
                style={styles.responseCard}
              >
                <View style={styles.responseInfoIcon}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={22}
                    color={theme.brand.primary}
                  />
                </View>

                <View style={styles.responseInfoContent}>
                  <AppText
                    variant="title"
                    style={styles.responseInfoTitle}
                  >
                    {tSafe(
                      'before_you_respond',
                      'Before You Respond'
                    )}
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.text.secondary}
                    style={styles.responseText}
                  >
                    {tSafe(
                      'replacement_response_explanation',
                      'By accepting, you are telling the host that you are available and willing to take this replacement cleaning. The host will make the final cleaner selection.'
                    )}
                  </AppText>
                </View>
              </AppCard>
            </View>
          )}

          {/* ================================================================ */}
          {/* ALREADY RESPONDED                                                */}
          {/* ================================================================ */}

          {alreadyResponded && (
            <View style={styles.section}>
              <AppCard
                padding="medium"
                radius="large"
                bordered
                style={[
                  styles.responseStatusCard,
                  {
                    borderColor: `${responseColor}65`,
                    backgroundColor: `${responseColor}10`,
                  },
                ]}
              >
                <View style={styles.responseStatusIcon}>
                  <MaterialCommunityIcons
                    name={
                      accepted
                        ? 'check-circle-outline'
                        : declined || cancelled
                          ? 'close-circle-outline'
                          : 'information-outline'
                    }
                    size={27}
                    color={responseColor}
                  />
                </View>

                <View style={styles.responseStatusContent}>
                  <AppText
                    variant="title"
                    style={[
                      styles.responseStatusTitle,
                      { color: responseColor },
                    ]}
                  >
                    {accepted
                      ? tSafe(
                          'request_accepted_title',
                          'Request Accepted'
                        )
                      : declined
                        ? tSafe(
                            'request_declined_title',
                            'Request Declined'
                          )
                        : cancelled
                          ? tSafe(
                              'request_cancelled_title',
                              'Request Cancelled'
                            )
                          : tSafe(
                              'request_completed_title',
                              'Request Completed'
                            )}
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.text.secondary}
                    style={styles.responseStatusText}
                  >
                    {responseMessage}
                  </AppText>

                  <StatusBadge
                    label={formatGroup(requestStatus)}
                    color={responseColor}
                    theme={theme}
                    styles={styles}
                  />
                </View>
              </AppCard>
            </View>
          )}
        </ScrollView>

        {/* ================================================================ */}
        {/* BOTTOM ACTIONS                                                   */}
        {/* ================================================================ */}

        {!alreadyResponded && (
          <View style={styles.bottomActions}>
            <AppButton
              title={tSafe('decline', 'Decline')}
              icon="close"
              variant="outline"
              onPress={handleDecline}
              disabled={responding}
              loading={responding}
              style={styles.bottomButton}
            />

            <AppButton
              title={tSafe('accept', 'Accept')}
              icon="check"
              onPress={handleAccept}
              disabled={responding}
              loading={responding}
              style={styles.bottomButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* Theme-aware styles                                                         */
/* -------------------------------------------------------------------------- */

const createStyles = (theme) => {
  const cardShadow = {
    shadowColor: theme.shadow?.color || '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: theme.shadow?.opacity ?? 0.08,
    shadowRadius: 12,
    elevation: 3,
  };

  return StyleSheet.create({
    /* -------------------------------- Base --------------------------------- */

    safeArea: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    scrollContent: {
      paddingBottom: 150,
    },

    section: {
      marginHorizontal: S.lg,
      marginTop: S.xl,
    },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: S.xl,
      backgroundColor: theme.background.default,
    },

    loadingText: {
      marginTop: S.md,
      textAlign: 'center',
    },

    /* ------------------------------- Error --------------------------------- */

    errorIconContainer: {
      width: 82,
      height: 82,
      borderRadius: R.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },

    errorTitle: {
      marginTop: S.lg,
      textAlign: 'center',
    },

    errorText: {
      marginTop: S.sm,
      lineHeight: 22,
      textAlign: 'center',
    },

    errorAction: {
      alignSelf: 'stretch',
      marginTop: S.md,
    },

    /* -------------------------------- Map ---------------------------------- */

    mapContainer: {
      height: 220,
      width: '100%',
      position: 'relative',
      backgroundColor: theme.surface.elevated,
    },

    mapImage: {
      width: '100%',
      height: '100%',
    },

    mapPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.surface.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },

    placeholderText: {
      marginTop: S.sm,
    },

    mapOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: S.lg,
      paddingVertical: S.md,
      backgroundColor: 'rgba(0,0,0,0.65)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    distanceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    distanceText: {
      marginLeft: S.sm,
    },

    directionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: S.sm,
      paddingHorizontal: S.md,
      borderRadius: R.pill,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },

    directionText: {
      marginLeft: S.xs,
    },

    /* ------------------------------ Property ------------------------------- */

    propertyCard: {
      marginHorizontal: S.lg,
      marginTop: S.lg,
      ...cardShadow,
    },

    propertyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    propertyIcon: {
      width: 54,
      height: 54,
      borderRadius: R.md,
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },

    propertyInfo: {
      flex: 1,
      marginLeft: S.md,
    },

    propertyName: {
      letterSpacing: -0.3,
    },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: S.xs,
    },

    locationText: {
      marginLeft: S.xs,
    },

    /* ------------------------- Replacement banner ------------------------- */

    replacementBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderColor: `${theme.status.warning}55`,
      backgroundColor: `${theme.status.warning}0D`,
    },

    bannerIcon: {
      width: 44,
      height: 44,
      borderRadius: R.md,
      alignItems: 'center',
      justifyContent: 'center',
    },

    bannerContent: {
      flex: 1,
      marginLeft: S.md,
    },

    bannerTitle: {
      marginBottom: S.xs,
    },

    bannerText: {
      lineHeight: 20,
    },

    /* ------------------------- Replacement details ------------------------ */

    replacementDetailsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    replacementDetailsIcon: {
      width: 48,
      height: 48,
      borderRadius: R.md,
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },

    replacementDetailsHeaderText: {
      flex: 1,
      marginLeft: S.md,
    },

    replacementDetailsSubtitle: {
      marginTop: S.xs,
      lineHeight: 18,
    },

    innerDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: S.lg,
    },

    cleanerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    cleanerAvatar: {
      width: 46,
      height: 46,
      borderRadius: R.md,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cleanerInfo: {
      flex: 1,
      marginLeft: S.md,
    },

    cleanerName: {
      marginTop: S.xs,
    },

    /* -------------------------------- Earnings ----------------------------- */

    earningsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    earningsIcon: {
      width: 46,
      height: 46,
      borderRadius: R.md,
      alignItems: 'center',
      justifyContent: 'center',
    },

    earningsInfo: {
      flex: 1,
      marginLeft: S.md,
    },

    earningsAmount: {
      marginTop: S.xs,
      letterSpacing: -0.6,
    },

    earningsDescription: {
      marginTop: S.xs,
      lineHeight: 19,
    },

    /* ---------------------------- Schedule rows ---------------------------- */

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 54,
    },

    infoIcon: {
      width: 44,
      height: 44,
      borderRadius: R.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    infoContent: {
      flex: 1,
      marginLeft: S.md,
    },

    infoLabel: {
      marginBottom: S.xs,
    },

    infoValue: {
      lineHeight: 22,
    },

    previousDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: S.sm,
      marginLeft: 56,
    },

    previousDate: {
      marginLeft: S.xs,
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: S.md,
    },

    /* ------------------------- Full task details -------------------------- */

    taskDetailsButton: {
      marginHorizontal: S.lg,
      marginTop: S.xl,
      padding: S.md,
      borderRadius: R.lg,
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      flexDirection: 'row',
      alignItems: 'center',
    },

    taskDetailsIcon: {
      width: 46,
      height: 46,
      borderRadius: R.md,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },

    taskDetailsContent: {
      flex: 1,
      marginLeft: S.md,
      marginRight: S.sm,
    },

    taskDetailsTitle: {
      color: theme.brand.primary,
    },

    taskDetailsSubtitle: {
      marginTop: S.xs,
      lineHeight: 18,
    },

    /* --------------------------- Cleaning summary ------------------------- */

    summaryContainer: {
      marginHorizontal: S.lg,
      marginTop: S.xl,
    },

    /* ---------------------------- Response info --------------------------- */

    responseCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface.default,
    },

    responseInfoIcon: {
      width: 30,
      alignItems: 'center',
      paddingTop: S.xs,
    },

    responseInfoContent: {
      flex: 1,
      marginLeft: S.sm,
    },

    responseInfoTitle: {
      marginBottom: S.xs,
    },

    responseText: {
      lineHeight: 21,
    },

    /* --------------------------- Response status -------------------------- */

    responseStatusCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    responseStatusIcon: {
      width: 34,
      alignItems: 'center',
      paddingTop: S.xs,
    },

    responseStatusContent: {
      flex: 1,
      marginLeft: S.sm,
    },

    responseStatusTitle: {
      marginBottom: S.xs,
    },

    responseStatusText: {
      lineHeight: 21,
    },

    statusBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: R.pill,
      paddingHorizontal: S.md,
      paddingVertical: S.xs,
      marginTop: S.md,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: R.pill,
      marginRight: S.sm,
    },

    statusBadgeText: {
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    /* ---------------------------- Bottom actions -------------------------- */

    bottomActions: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: S.lg,
      paddingTop: S.md,
      paddingBottom: S.lg,
      backgroundColor: theme.background.elevated ||
        theme.background.default,
      borderTopWidth: 1,
      borderTopColor: theme.border.default,
      flexDirection: 'row',
      gap: S.md,
    },

    bottomButton: {
      flex: 1,
      minHeight: 50,
    },
  });
};














// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';

// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import {
//   useNavigation,
//   useRoute,
//   useFocusEffect,
// } from '@react-navigation/native';
// import { Button } from 'react-native-paper';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import CustomCard from '../../components/shared/CustomCard';
// import CleaningSummary from './CleaningSummary';
// import moment from 'moment';
// import calculateDistance from '../../utils/calculateDistance';

// // import getCityState from '../../utils/getCityState';
// import { getCityState } from '../../utils/getAddressFromCoordinates';

// import { MAP_BOX_SECRET_KEY } from '../../env';
// import { tSafe } from '../../utils/tSafe';



// const ReplacementRequest = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const {
//     requestId,
//     scheduleId,
//     cleanerId,
//     oldCleaningDate,
//     newCleaningDate,
//     propertyName,
//     cleaningTime,
//     group,
//     replacedCleanerId,
//     replacedCleanerName,
//     replacementFee: routeReplacementFee,
//   } = route?.params || {};

//   const {
//     geolocationData,
//     currentUserId,
//     currentUser,
//   } = useContext(AuthContext);

//   const effectiveCleanerId =
//     cleanerId || currentUserId;


//   // ============================================================
//   // REQUEST STATE
//   // ============================================================

//   const [requestStatus, setRequestStatus] =
//     useState('pending');

//   const [requestLoading, setRequestLoading] =
//     useState(true);

//   const [requestError, setRequestError] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(false);


//   // ============================================================
//   // SCHEDULE STATE
//   // ============================================================

//   const [schedule, setSchedule] =
//     useState(null);

//   const [scheduleLoading, setScheduleLoading] =
//     useState(true);

//   const [scheduleError, setScheduleError] =
//     useState(null);


//   // ============================================================
//   // PROPERTY / LOCATION STATE
//   // ============================================================

//   const [property, setProperty] =
//     useState(null);

//   const [propertyDistance, setPropertyDistance] =
//     useState(null);

//   const [cityState, setCityState] =
//     useState(null);


//   // ============================================================
//   // CLEANING / REPLACEMENT STATE
//   // ============================================================

//   const [overallChecklist, setOverallChecklist] =
//     useState(null);

//   const [assignedCleaner, setAssignedCleaner] =
//     useState(null);

//   const [originalCleaner, setOriginalCleaner] =
//     useState(null);

//   const [replacementFee, setReplacementFee] =
//     useState(
//       routeReplacementFee != null
//         ? Number(routeReplacementFee)
//         : 0
//     );


//   // ============================================================
//   // HELPER: FORMAT DATE
//   // ============================================================

//   const formatDate = useCallback((dateValue) => {
//     if (!dateValue) {
//       return 'N/A';
//     }

//     // Prevent timezone shifting for YYYY-MM-DD.
//     if (
//       typeof dateValue === 'string' &&
//       /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
//     ) {
//       const [year, month, day] =
//         dateValue.split('-').map(Number);

//       return moment(
//         new Date(year, month - 1, day)
//       ).format('MMM D, YYYY');
//     }

//     const parsed = moment(dateValue);

//     if (!parsed.isValid()) {
//       return 'N/A';
//     }

//     return parsed.format('MMM D, YYYY');
//   }, []);


//   // ============================================================
//   // HELPER: FORMAT TIME
//   // ============================================================

//   const formatTime = useCallback((timeValue) => {
//     if (!timeValue) {
//       return 'N/A';
//     }

//     const parsed = moment(
//       `2000-01-01 ${timeValue}`
//     );

//     if (parsed.isValid()) {
//       return parsed.format('h:mm A');
//     }

//     return timeValue;
//   }, []);


//   // ============================================================
//   // HELPER: FORMAT GROUP
//   // ============================================================

//   const formatGroup = useCallback((groupValue) => {
//     if (!groupValue) {
//       return 'N/A';
//     }

//     const value = String(groupValue);

//     return value
//       .split('_')
//       .map(
//         word =>
//           word.charAt(0).toUpperCase() +
//           word.slice(1).toLowerCase()
//       )
//       .join(' ');
//   }, []);


//   // ============================================================
//   // FETCH AUTHORITATIVE REPLACEMENT REQUEST
//   // ============================================================

//   const fetchReplacementRequest = useCallback(
//     async () => {
//       if (!requestId) {
//         setRequestLoading(false);
//         setRequestError(
//           'Replacement request ID is missing.'
//         );
//         return null;
//       }

//       try {
//         setRequestLoading(true);
//         setRequestError(null);

//         console.log(
//           '🔎 Fetching replacement request:',
//           requestId
//         );

//         const response =
//           await userService.getReplacementRequest(
//             String(requestId)
//           );

//         const replacementRequest =
//           response?.data?.request ||
//           response?.request;

//         if (!replacementRequest) {
//           throw new Error(
//             'Replacement request was not found.'
//           );
//         }

//         console.log(
//           '✅ Replacement request:',
//           replacementRequest
//         );

//         const actualStatus =
//           replacementRequest.status || 'pending';

//         setRequestStatus(actualStatus);

//         // --------------------------------------------------------
//         // Verify cleaner ownership
//         // --------------------------------------------------------

//         if (
//           effectiveCleanerId &&
//           replacementRequest.cleanerId &&
//           String(
//             replacementRequest.cleanerId
//           ) !== String(effectiveCleanerId)
//         ) {
//           setRequestError(
//             'This replacement request is not assigned to your account.'
//           );

//           return replacementRequest;
//         }

//         // --------------------------------------------------------
//         // Verify schedule
//         // --------------------------------------------------------

//         if (
//           scheduleId &&
//           replacementRequest.scheduleId &&
//           String(
//             replacementRequest.scheduleId
//           ) !== String(scheduleId)
//         ) {
//           setRequestError(
//             'This replacement request is no longer valid.'
//           );

//           return replacementRequest;
//         }

//         return replacementRequest;

//       } catch (error) {
//         console.error(
//           '❌ Failed to fetch replacement request:',
//           error
//         );

//         const errorMessage =
//           error?.response?.data?.detail ||
//           error?.response?.data?.message ||
//           error?.message ||
//           'Unable to load replacement request.';

//         setRequestError(errorMessage);

//         return null;

//       } finally {
//         setRequestLoading(false);
//       }
//     },
//     [
//       requestId,
//       scheduleId,
//       effectiveCleanerId,
//     ]
//   );


//   // ============================================================
//   // FETCH SCHEDULE
//   // ============================================================

//   const fetchSchedule = useCallback(
//     async () => {
//       if (!scheduleId) {
//         setScheduleLoading(false);
//         setScheduleError(
//           'Schedule ID is missing.'
//         );
//         return;
//       }

//       try {
//         setScheduleLoading(true);
//         setScheduleError(null);

//         console.log(
//           '📅 Fetching schedule:',
//           scheduleId
//         );

//         const response =
//           await userService.getScheduleById(
//             String(scheduleId)
//           );

//         const scheduleData =
//           response?.data || response;

//         if (!scheduleData) {
//           throw new Error(
//             'Schedule not found.'
//           );
//         }

//         setSchedule(scheduleData);

//         // --------------------------------------------------------
//         // Overall checklist
//         // --------------------------------------------------------

//         setOverallChecklist(
//           scheduleData?.overall_checklist?.checklist ||
//           scheduleData?.overall_checklist ||
//           null
//         );

//         // --------------------------------------------------------
//         // Assigned cleaners
//         // --------------------------------------------------------

//         const assignedTo =
//           Array.isArray(scheduleData?.assignedTo)
//             ? scheduleData.assignedTo
//             : [];

//         // Find this cleaner's assignment.
//         const cleanerAssignment =
//           assignedTo.find(
//             assignment =>
//               String(
//                 assignment?.cleanerId
//               ) === String(effectiveCleanerId)
//           );

//         setAssignedCleaner(
//           cleanerAssignment || null
//         );

//         // --------------------------------------------------------
//         // Find the original cleaner
//         // --------------------------------------------------------

//         let originalAssignment = null;

//         if (replacedCleanerId) {
//           originalAssignment =
//             assignedTo.find(
//               assignment =>
//                 String(
//                   assignment?.cleanerId
//                 ) === String(replacedCleanerId) &&
//                 (
//                   !group ||
//                   assignment?.group === group
//                 )
//             );
//         }

//         // If the replacement request doesn't contain
//         // replacedCleanerId, try the route information.
//         if (
//           !originalAssignment &&
//           replacedCleanerId
//         ) {
//           originalAssignment =
//             assignedTo.find(
//               assignment =>
//                 String(
//                   assignment?.cleanerId
//                 ) === String(replacedCleanerId)
//             );
//         }

//         setOriginalCleaner(
//           originalAssignment || null
//         );

//         // --------------------------------------------------------
//         // Calculate replacement cleaner earnings
//         // --------------------------------------------------------

//         if (originalAssignment) {
//           const checklist =
//             originalAssignment?.checklist || {};

//           const calculatedPrice =
//             checklist?.calculatedPrice;

//           const price =
//             checklist?.price;

//           const calculatedFee =
//             calculatedPrice != null
//               ? Number(calculatedPrice)
//               : price != null
//                 ? Number(price)
//                 : 0;

//           if (!Number.isNaN(calculatedFee)) {
//             setReplacementFee(
//               calculatedFee
//             );
//           }
//         }

//         // --------------------------------------------------------
//         // Property information
//         // --------------------------------------------------------

//         const propertyData =
//           scheduleData?.apartment ||
//           scheduleData?.property ||
//           scheduleData?.apartmentData ||
//           null;

//         setProperty(propertyData);

//         // --------------------------------------------------------
//         // Property name
//         // --------------------------------------------------------

//         // If the route didn't provide a property name,
//         // we can derive it from the schedule.
//         //
//         // We intentionally don't overwrite the route value
//         // because the notification may contain the correct
//         // display name.

//         // --------------------------------------------------------
//         // Property location
//         // --------------------------------------------------------

//         const location =
//           propertyData?.location ||
//           scheduleData?.location ||
//           {};

//         const latitude =
//           location?.latitude ??
//           location?.lat;

//         const longitude =
//           location?.longitude ??
//           location?.lng;

//         if (
//           latitude != null &&
//           longitude != null &&
//           geolocationData?.latitude != null &&
//           geolocationData?.longitude != null
//         ) {
//           try {
//             const distance =
//               calculateDistance(
//                 Number(
//                   geolocationData.latitude
//                 ),
//                 Number(
//                   geolocationData.longitude
//                 ),
//                 Number(latitude),
//                 Number(longitude)
//               );

//             setPropertyDistance(
//               distance
//             );
//           } catch (distanceError) {
//             console.error(
//               '❌ Distance calculation failed:',
//               distanceError
//             );
//           }
//         }

//         // --------------------------------------------------------
//         // City / State
//         // --------------------------------------------------------

//         try {
//           const address =
//             location?.address ||
//             propertyData?.address ||
//             scheduleData?.address ||
//             '';

//           if (address) {
//             const result =
//               await getCityState(
//                 address
//               );

//             if (result) {
//               setCityState(result);
//             }
//           }
//         } catch (locationError) {
//           console.error(
//             '❌ Failed to get city/state:',
//             locationError
//           );
//         }

//       } catch (error) {
//         console.error(
//           '❌ Failed to fetch schedule:',
//           error
//         );

//         setScheduleError(
//           error?.response?.data?.detail ||
//           error?.response?.data?.message ||
//           error?.message ||
//           'Unable to load cleaning information.'
//         );

//       } finally {
//         setScheduleLoading(false);
//       }
//     },
//     [
//       scheduleId,
//       effectiveCleanerId,
//       replacedCleanerId,
//       group,
//       geolocationData,
//     ]
//   );


//   // ============================================================
//   // INITIAL LOAD
//   // ============================================================

//   useEffect(() => {
//     fetchReplacementRequest();
//   }, [
//     fetchReplacementRequest,
//   ]);


//   useEffect(() => {
//     fetchSchedule();
//   }, [
//     fetchSchedule,
//   ]);


//   // ============================================================
//   // REFRESH WHEN SCREEN GETS FOCUS
//   // ============================================================

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const refresh = async () => {
//         if (!active) {
//           return;
//         }

//         await fetchReplacementRequest();

//         if (!active) {
//           return;
//         }

//         await fetchSchedule();
//       };

//       refresh();

//       return () => {
//         active = false;
//       };
//     }, [
//       fetchReplacementRequest,
//       fetchSchedule,
//     ])
//   );


//   // ============================================================
//   // RESPONSE TO REPLACEMENT REQUEST
//   // ============================================================

//   const handleReplacementResponse = async (
//     acceptance
//   ) => {
//     // ----------------------------------------------------------
//     // Basic validation
//     // ----------------------------------------------------------

//     if (
//       !requestId ||
//       !effectiveCleanerId ||
//       !scheduleId
//     ) {
//       Alert.alert(
//         'Unable to Respond',
//         'This replacement request is missing required information.'
//       );

//       return;
//     }

//     // ----------------------------------------------------------
//     // Don't allow response while authoritative request
//     // is still loading.
//     // ----------------------------------------------------------

//     if (requestLoading) {
//       Alert.alert(
//         'Please Wait',
//         'We are checking the replacement request. Please try again in a moment.'
//       );

//       return;
//     }

//     // ----------------------------------------------------------
//     // Don't allow response if request failed validation.
//     // ----------------------------------------------------------

//     if (requestError) {
//       Alert.alert(
//         'Request Unavailable',
//         requestError
//       );

//       return;
//     }

//     // ----------------------------------------------------------
//     // ONLY pending requests can be answered.
//     // ----------------------------------------------------------

//     if (requestStatus !== 'pending') {
//       let message =
//         'This replacement request is no longer pending.';

//       if (requestStatus === 'accepted') {
//         message =
//           'You have already responded to this replacement request. The host will review the available cleaners and make the final selection.';
//       } else if (
//         requestStatus === 'declined'
//       ) {
//         message =
//           'You previously declined this replacement request.';
//       } else if (
//         requestStatus === 'cancelled'
//       ) {
//         message =
//           'This replacement request has been cancelled.';
//       } else if (
//         requestStatus === 'payment_completed'
//       ) {
//         message =
//           'This replacement request has already been completed.';
//       }

//       Alert.alert(
//         'Request Already Responded',
//         message
//       );

//       return;
//     }

//     // ----------------------------------------------------------
//     // Confirm acceptance
//     // ----------------------------------------------------------

//     if (acceptance) {
//       Alert.alert(
//         'Confirm Availability',
//         'By accepting, you are confirming that you are available for this replacement cleaning. The host will review the available cleaners and make the final selection.',
//         [
//           {
//             text: 'Cancel',
//             style: 'cancel',
//           },
//           {
//             text: 'I’m Available',
//             onPress: () =>
//               submitReplacementResponse(
//                 true
//               ),
//           },
//         ]
//       );

//       return;
//     }

//     // ----------------------------------------------------------
//     // Confirm decline
//     // ----------------------------------------------------------

//     Alert.alert(
//       'Decline Replacement Request',
//       'Are you sure you want to decline this replacement cleaning request?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Decline',
//           style: 'destructive',
//           onPress: () =>
//             submitReplacementResponse(
//               false
//             ),
//         },
//       ]
//     );
//   };


//   // ============================================================
//   // SUBMIT RESPONSE
//   // ============================================================

//   const submitReplacementResponse =
//     async (acceptance) => {
//       try {
//         setLoading(true);

//         console.log(
//           '📤 Responding to replacement request:',
//           {
//             scheduleId,
//             requestId,
//             cleanerId:
//               effectiveCleanerId,
//             acceptance,
//           }
//         );

//         const response =
//           await userService.respondToReplacementRequest(
//             {
//               scheduleId:
//                 String(scheduleId),

//               requestId:
//                 String(requestId),

//               cleanerId:
//                 String(effectiveCleanerId),

//               acceptance,
//             }
//           );

//         console.log(
//           '✅ Replacement response:',
//           response?.data
//         );

//         const updatedStatus =
//           response?.data?.status ||
//           response?.data?.request?.status ||
//           (acceptance
//             ? 'accepted'
//             : 'declined');

//         setRequestStatus(
//           updatedStatus
//         );

//         if (acceptance) {
//           Alert.alert(
//             'Response Submitted',
//             'You have confirmed that you are available for this replacement cleaning. The host will review the available cleaners and make the final selection.',
//             [
//               {
//                 text: 'OK',
//                 onPress: () => {
//                   navigation.navigate(
//                     ROUTES.cleaner_dashboard
//                   );
//                 },
//               },
//             ]
//           );
//         } else {
//           Alert.alert(
//             'Request Declined',
//             'You have declined this replacement cleaning request.',
//             [
//               {
//                 text: 'OK',
//                 onPress: () => {
//                   navigation.navigate(
//                     ROUTES.cleaner_dashboard
//                   );
//                 },
//               },
//             ]
//           );
//         }

//       } catch (error) {
//         console.error(
//           '❌ Error responding to replacement request:',
//           error
//         );

//         Alert.alert(
//           'Unable to Respond',
//           error?.response?.data?.detail ||
//             error?.response?.data?.message ||
//             error?.message ||
//             'Something went wrong while responding to this request.'
//         );

//       } finally {
//         setLoading(false);
//       }
//     };


//   // ============================================================
//   // DERIVED VALUES
//   // ============================================================

//   const displayPropertyName =
//     propertyName ||
//     schedule?.apartment?.name ||
//     schedule?.property?.name ||
//     schedule?.apartmentName ||
//     schedule?.propertyName ||
//     'Cleaning Property';

//   const displayOldDate =
//     oldCleaningDate ||
//     schedule?.previous_cleaning_date ||
//     schedule?.old_cleaning_date ||
//     null;

//   const displayNewDate =
//     newCleaningDate ||
//     schedule?.cleaning_date ||
//     schedule?.new_cleaning_date ||
//     null;

//   const displayCleaningTime =
//     cleaningTime ||
//     schedule?.cleaning_time ||
//     null;

//   const displayGroup =
//     formatGroup(
//       group ||
//       assignedCleaner?.group
//     );

//   const displayReplacedCleanerName =
//     replacedCleanerName ||
//     (
//       originalCleaner
//         ? `${originalCleaner.firstname || ''} ${originalCleaner.lastname || ''}`.trim()
//         : 'Previous Cleaner'
//     );

//   const displayReplacementFee =
//     Number.isFinite(
//       Number(replacementFee)
//     )
//       ? Number(replacementFee)
//       : 0;


//   // ============================================================
//   // STATUS HELPERS
//   // ============================================================

//   const isPending =
//     requestStatus === 'pending';

//   const isAccepted =
//     requestStatus === 'accepted';

//   const isDeclined =
//     requestStatus === 'declined';

//   const isCancelled =
//     requestStatus === 'cancelled';


//   // ============================================================
//   // LOADING SCREEN
//   // ============================================================

//   if (
//     requestLoading ||
//     scheduleLoading
//   ) {
//     return (
//       <SafeAreaView
//         style={styles.safeArea}
//       >
//         <View
//           style={styles.loadingContainer}
//         >
//           <ActivityIndicator
//             size="large"
//           />

//           <Text
//             style={styles.loadingTitle}
//           >
//             Loading Replacement Request
//           </Text>

//           <Text
//             style={styles.loadingText}
//           >
//             Checking your replacement cleaning request...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   // ============================================================
//   // REQUEST ERROR
//   // ============================================================

//   if (requestError) {
//     return (
//       <SafeAreaView
//         style={styles.safeArea}
//       >
//         <View
//           style={styles.errorContainer}
//         >
//           <MaterialCommunityIcons
//             name="alert-circle-outline"
//             size={56}
//             color={COLORS?.danger || '#D32F2F'}
//           />

//           <Text
//             style={styles.errorTitle}
//           >
//             Replacement Request Unavailable
//           </Text>

//           <Text
//             style={styles.errorText}
//           >
//             {requestError}
//           </Text>

//           <Button
//             mode="contained"
//             onPress={() => {
//               fetchReplacementRequest();
//               fetchSchedule();
//             }}
//             style={styles.retryButton}
//           >
//             Try Again
//           </Button>

//           <Button
//             mode="text"
//             onPress={() =>
//               navigation.navigate(
//                 ROUTES.cleaner_dashboard
//               )
//             }
//           >
//             Back to Dashboard
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   // ============================================================
//   // SCHEDULE ERROR
//   // ============================================================

//   if (scheduleError) {
//     return (
//       <SafeAreaView
//         style={styles.safeArea}
//       >
//         <View
//           style={styles.errorContainer}
//         >
//           <MaterialCommunityIcons
//             name="calendar-alert"
//             size={56}
//             color={COLORS?.danger || '#D32F2F'}
//           />

//           <Text
//             style={styles.errorTitle}
//           >
//             Cleaning Information Unavailable
//           </Text>

//           <Text
//             style={styles.errorText}
//           >
//             {scheduleError}
//           </Text>

//           <Button
//             mode="contained"
//             onPress={() =>
//               fetchSchedule()
//             }
//             style={styles.retryButton}
//           >
//             Try Again
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   // ============================================================
//   // MAIN UI
//   // ============================================================

//   return (
//     <SafeAreaView
//       style={styles.safeArea}
//     >
//       <ScrollView
//         contentContainerStyle={
//           styles.scrollContent
//         }
//         showsVerticalScrollIndicator={
//           false
//         }
//       >

//         {/* =====================================================
//             HEADER
//         ====================================================== */}

//         <View
//           style={styles.header}
//         >
//           <TouchableOpacity
//             onPress={() =>
//               navigation.goBack()
//             }
//             style={styles.backButton}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={26}
//               color={
//                 COLORS?.text ||
//                 '#222'
//               }
//             />
//           </TouchableOpacity>

//           <View
//             style={styles.headerTextContainer}
//           >
//             <Text
//               style={styles.headerTitle}
//             >
//               Replacement Cleaning
//             </Text>

//             <Text
//               style={styles.headerSubtitle}
//             >
//               {displayPropertyName}
//             </Text>
//           </View>
//         </View>


//         {/* =====================================================
//             REQUEST STATUS
//         ====================================================== */}

//         <View
//           style={[
//             styles.statusBanner,
//             isPending &&
//               styles.pendingBanner,
//             isAccepted &&
//               styles.acceptedBanner,
//             isDeclined &&
//               styles.declinedBanner,
//             isCancelled &&
//               styles.cancelledBanner,
//           ]}
//         >
//           <MaterialCommunityIcons
//             name={
//               isPending
//                 ? 'clock-outline'
//                 : isAccepted
//                   ? 'check-circle'
//                   : isDeclined
//                     ? 'close-circle'
//                     : 'alert-circle'
//             }
//             size={28}
//             color={
//               isPending
//                 ? '#B7791F'
//                 : isAccepted
//                   ? '#2E7D32'
//                   : '#C62828'
//             }
//           />

//           <View
//             style={
//               styles.statusTextContainer
//             }
//           >
//             <Text
//               style={styles.statusTitle}
//             >
//               {isPending
//                 ? 'Replacement Request'
//                 : isAccepted
//                   ? 'Response Submitted'
//                   : isDeclined
//                     ? 'Request Declined'
//                     : 'Request Unavailable'}
//             </Text>

//             <Text
//               style={styles.statusMessage}
//             >
//               {isPending
//                 ? 'The host needs to know if you are available for this cleaning.'
//                 : isAccepted
//                   ? 'You confirmed that you are available. The host will make the final replacement selection.'
//                   : isDeclined
//                     ? 'You declined this replacement cleaning request.'
//                     : 'This replacement request is no longer available.'}
//             </Text>
//           </View>
//         </View>


//         {/* =====================================================
//             REPLACEMENT NOTICE
//         ====================================================== */}

//         <CustomCard
//           style={styles.card}
//         >
//           <View
//             style={styles.cardHeader}
//           >
//             <MaterialCommunityIcons
//               name="account-switch"
//               size={26}
//               color={
//                 COLORS?.primary ||
//                 '#1976D2'
//               }
//             />

//             <Text
//               style={styles.cardTitle}
//             >
//               You are being considered as a replacement
//             </Text>
//           </View>

//           <Text
//             style={styles.cardDescription}
//           >
//             The original cleaner is no longer available
//             for this cleaning. The host is asking whether
//             you are available to take the cleaning.
//           </Text>

//           <View
//             style={styles.infoRow}
//           >
//             <Text
//               style={styles.infoLabel}
//             >
//               Group
//             </Text>

//             <Text
//               style={styles.infoValue}
//             >
//               {displayGroup}
//             </Text>
//           </View>

//           <View
//             style={styles.infoRow}
//           >
//             <Text
//               style={styles.infoLabel}
//             >
//               Previous Cleaner
//             </Text>

//             <Text
//               style={styles.infoValue}
//             >
//               {displayReplacedCleanerName}
//             </Text>
//           </View>
//         </CustomCard>


//         {/* =====================================================
//             PROPERTY
//         ====================================================== */}

//         <CustomCard
//           style={styles.card}
//         >
//           <View
//             style={styles.cardHeader}
//           >
//             <MaterialCommunityIcons
//               name="home-outline"
//               size={25}
//               color={
//                 COLORS?.primary ||
//                 '#1976D2'
//               }
//             />

//             <Text
//               style={styles.cardTitle}
//             >
//               Property
//             </Text>
//           </View>

//           <Text
//             style={styles.propertyName}
//           >
//             {displayPropertyName}
//           </Text>

//           {cityState ? (
//             <Text
//               style={styles.propertyLocation}
//             >
//               {typeof cityState === 'string'
//                 ? cityState
//                 : [
//                     cityState?.city,
//                     cityState?.state,
//                   ]
//                     .filter(Boolean)
//                     .join(', ')}
//             </Text>
//           ) : null}

//           {propertyDistance != null ? (
//             <View
//               style={styles.distanceRow}
//             >
//               <MaterialCommunityIcons
//                 name="map-marker-distance"
//                 size={20}
//                 color={
//                   COLORS?.primary ||
//                   '#1976D2'
//                 }
//               />

//               <Text
//                 style={styles.distanceText}
//               >
//                 {Number(
//                   propertyDistance
//                 ).toFixed(1)} miles away
//               </Text>
//             </View>
//           ) : null}
//         </CustomCard>


//         {/* =====================================================
//             CLEANING SCHEDULE
//         ====================================================== */}

//         <CustomCard
//           style={styles.card}
//         >
//           <View
//             style={styles.cardHeader}
//           >
//             <MaterialCommunityIcons
//               name="calendar-clock"
//               size={25}
//               color={
//                 COLORS?.primary ||
//                 '#1976D2'
//               }
//             />

//             <Text
//               style={styles.cardTitle}
//             >
//               Cleaning Schedule
//             </Text>
//           </View>

//           <View
//             style={styles.scheduleRow}
//           >
//             <View
//               style={styles.scheduleItem}
//             >
//               <Text
//                 style={styles.scheduleLabel}
//               >
//                 Original Date
//               </Text>

//               <Text
//                 style={styles.scheduleValue}
//               >
//                 {formatDate(
//                   displayOldDate
//                 )}
//               </Text>
//             </View>

//             <MaterialCommunityIcons
//               name="arrow-right"
//               size={24}
//               color="#777"
//             />

//             <View
//               style={styles.scheduleItem}
//             >
//               <Text
//                 style={styles.scheduleLabel}
//               >
//                 New Date
//               </Text>

//               <Text
//                 style={styles.scheduleValue}
//               >
//                 {formatDate(
//                   displayNewDate
//                 )}
//               </Text>
//             </View>
//           </View>

//           <View
//             style={styles.infoRow}
//           >
//             <Text
//               style={styles.infoLabel}
//             >
//               Cleaning Time
//             </Text>

//             <Text
//               style={styles.infoValue}
//             >
//               {formatTime(
//                 displayCleaningTime
//               )}
//             </Text>
//           </View>

//           <View
//             style={styles.infoRow}
//           >
//             <Text
//               style={styles.infoLabel}
//             >
//               Group
//             </Text>

//             <Text
//               style={styles.infoValue}
//             >
//               {displayGroup}
//             </Text>
//           </View>
//         </CustomCard>


//         {/* =====================================================
//             CLEANING SUMMARY
//         ====================================================== */}

//         {overallChecklist ? (
//           <View
//             style={styles.summaryContainer}
//           >
//             <CleaningSummary
//               checklist={
//                 overallChecklist
//               }
//               schedule={
//                 schedule
//               }
//             />
//           </View>
//         ) : null}


//         {/* =====================================================
//             YOUR EARNINGS
//         ====================================================== */}

//         <CustomCard
//           style={styles.earningsCard}
//         >
//           <View
//             style={styles.earningsHeader}
//           >
//             <View>
//               <Text
//                 style={styles.earningsLabel}
//               >
//                 Your Earnings
//               </Text>

//               <Text
//                 style={styles.earningsDescription}
//               >
//                 Earnings for completing this replacement cleaning
//               </Text>
//             </View>

//             <Text
//               style={styles.earningsAmount}
//             >
//               $
//               {displayReplacementFee.toFixed(
//                 2
//               )}
//             </Text>
//           </View>
//         </CustomCard>


//         {/* =====================================================
//             IMPORTANT INFORMATION
//         ====================================================== */}

//         {isPending ? (
//           <CustomCard
//             style={styles.infoCard}
//           >
//             <View
//               style={styles.cardHeader}
//             >
//               <MaterialCommunityIcons
//                 name="information-outline"
//                 size={25}
//                 color={
//                   COLORS?.primary ||
//                   '#1976D2'
//                 }
//               />

//               <Text
//                 style={styles.cardTitle}
//               >
//                 Before You Respond
//               </Text>
//             </View>

//             <Text
//               style={styles.cardDescription}
//             >
//               Accepting this request means you are
//               confirming that you are available for this
//               cleaning.
//             </Text>

//             <Text
//               style={[
//                 styles.cardDescription,
//                 {
//                   marginTop: 8,
//                 },
//               ]}
//             >
//               It does not mean you have been selected yet.
//               The host will review the cleaners who accept
//               and make the final selection.
//             </Text>
//           </CustomCard>
//         ) : null}


//         {/* =====================================================
//             ACCEPTED STATUS
//         ====================================================== */}

//         {isAccepted ? (
//           <CustomCard
//             style={styles.successCard}
//           >
//             <MaterialCommunityIcons
//               name="check-circle"
//               size={42}
//               color="#2E7D32"
//             />

//             <Text
//               style={styles.successTitle}
//             >
//               You are Available
//             </Text>

//             <Text
//               style={styles.successText}
//             >
//               You have confirmed that you are available
//               for this replacement cleaning. The host will
//               review the available cleaners and make the
//               final selection.
//             </Text>
//           </CustomCard>
//         ) : null}


//         {/* =====================================================
//             ACTION BUTTONS
//         ====================================================== */}

//         {isPending ? (
//           <View
//             style={styles.actionContainer}
//           >
//             <Button
//               mode="contained"
//               onPress={() =>
//                 handleReplacementResponse(
//                   true
//                 )
//               }
//               loading={loading}
//               disabled={loading}
//               style={
//                 styles.acceptButton
//               }
//               contentStyle={
//                 styles.buttonContent
//               }
//             >
//               I’m Available
//             </Button>

//             <Button
//               mode="outlined"
//               onPress={() =>
//                 handleReplacementResponse(
//                   false
//                 )
//               }
//               disabled={loading}
//               style={
//                 styles.declineButton
//               }
//               contentStyle={
//                 styles.buttonContent
//               }
//             >
//               Decline
//             </Button>
//           </View>
//         ) : null}


//         {/* =====================================================
//             BACK TO DASHBOARD
//         ====================================================== */}

//         {!isPending ? (
//           <Button
//             mode="outlined"
//             onPress={() =>
//               navigation.navigate(
//                 ROUTES.cleaner_dashboard
//               )
//             }
//             style={
//               styles.dashboardButton
//             }
//           >
//             Back to Dashboard
//           </Button>
//         ) : null}

//       </ScrollView>
//     </SafeAreaView>
//   );
// };


// // ============================================================
// // STYLES
// // ============================================================

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor:
//       COLORS?.background ||
//       '#F7F8FA',
//   },

//   scrollContent: {
//     padding: 16,
//     paddingBottom: 40,
//   },

//   // ----------------------------------------------------------
//   // Header
//   // ----------------------------------------------------------

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 18,
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },

//   headerTextContainer: {
//     flex: 1,
//   },

//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color:
//       COLORS?.text ||
//       '#222',
//   },

//   headerSubtitle: {
//     fontSize: 14,
//     marginTop: 3,
//     color: '#777',
//   },

//   // ----------------------------------------------------------
//   // Status
//   // ----------------------------------------------------------

//   statusBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 16,
//   },

//   pendingBanner: {
//     backgroundColor: '#FFF8E1',
//   },

//   acceptedBanner: {
//     backgroundColor: '#E8F5E9',
//   },

//   declinedBanner: {
//     backgroundColor: '#FFEBEE',
//   },

//   cancelledBanner: {
//     backgroundColor: '#F5F5F5',
//   },

//   statusTextContainer: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   statusTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#222',
//   },

//   statusMessage: {
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#555',
//     marginTop: 3,
//   },

//   // ----------------------------------------------------------
//   // Cards
//   // ----------------------------------------------------------

//   card: {
//     marginBottom: 16,
//   },

//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },

//   cardTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#222',
//     marginLeft: 9,
//   },

//   cardDescription: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#555',
//   },

//   infoCard: {
//     marginBottom: 16,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//   },

//   infoLabel: {
//     fontSize: 14,
//     color: '#777',
//   },

//   infoValue: {
//     flex: 1,
//     textAlign: 'right',
//     marginLeft: 15,
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#222',
//   },

//   propertyName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 5,
//   },

//   propertyLocation: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 10,
//   },

//   distanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },

//   distanceText: {
//     fontSize: 14,
//     color: '#555',
//     marginLeft: 7,
//   },

//   // ----------------------------------------------------------
//   // Schedule
//   // ----------------------------------------------------------

//   scheduleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },

//   scheduleItem: {
//     flex: 1,
//   },

//   scheduleLabel: {
//     fontSize: 12,
//     color: '#888',
//     marginBottom: 4,
//   },

//   scheduleValue: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#222',
//   },

//   // ----------------------------------------------------------
//   // Summary
//   // ----------------------------------------------------------

//   summaryContainer: {
//     marginBottom: 16,
//   },

//   // ----------------------------------------------------------
//   // Earnings
//   // ----------------------------------------------------------

//   earningsCard: {
//     marginBottom: 16,
//     padding: 16,
//     borderRadius: 12,
//   },

//   earningsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   earningsLabel: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#222',
//   },

//   earningsDescription: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 4,
//     maxWidth: 220,
//   },

//   earningsAmount: {
//     fontSize: 25,
//     fontWeight: '800',
//     color: '#2E7D32',
//   },

//   // ----------------------------------------------------------
//   // Success
//   // ----------------------------------------------------------

//   successCard: {
//     alignItems: 'center',
//     padding: 22,
//     marginBottom: 16,
//   },

//   successTitle: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#2E7D32',
//     marginTop: 10,
//   },

//   successText: {
//     textAlign: 'center',
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#555',
//     marginTop: 8,
//   },

//   // ----------------------------------------------------------
//   // Actions
//   // ----------------------------------------------------------

//   actionContainer: {
//     marginTop: 4,
//     marginBottom: 15,
//   },

//   acceptButton: {
//     borderRadius: 8,
//     marginBottom: 10,
//   },

//   declineButton: {
//     borderRadius: 8,
//   },

//   buttonContent: {
//     height: 50,
//   },

//   dashboardButton: {
//     marginTop: 5,
//     marginBottom: 15,
//   },

//   // ----------------------------------------------------------
//   // Loading
//   // ----------------------------------------------------------

//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 30,
//   },

//   loadingTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#222',
//     marginTop: 18,
//   },

//   loadingText: {
//     fontSize: 14,
//     color: '#777',
//     textAlign: 'center',
//     marginTop: 8,
//   },

//   // ----------------------------------------------------------
//   // Errors
//   // ----------------------------------------------------------

//   errorContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 30,
//   },

//   errorTitle: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#222',
//     textAlign: 'center',
//     marginTop: 15,
//   },

//   errorText: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 8,
//   },

//   retryButton: {
//     marginTop: 20,
//     marginBottom: 5,
//   },
// });


// export default ReplacementRequest;






// import React, {
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

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

//   const scrollViewRef = useRef(null);
//   const taskDetailsY = useRef(0);

//   // ---------------------------------------------------------
//   // Route params
//   // ---------------------------------------------------------

//   const {
//     requestId,
//     scheduleId,
//     cleanerId,

//     oldCleaningDate,
//     newCleaningDate,

//     propertyName,
//     cleaningTime,
//     group,

//     // Replacement information
//     replacedCleanerId,
//     replacedCleanerName,
//     replacementFee: routeReplacementFee,
//   } = route?.params || {};

//   // ---------------------------------------------------------
//   // Auth
//   // ---------------------------------------------------------

//   const {
//     geolocationData,
//     currentUserId,
//     currentUser,
//   } = useContext(AuthContext);

//   const effectiveCleanerId =
//     cleanerId || currentUserId;

//   // ---------------------------------------------------------
//   // Schedule state
//   // ---------------------------------------------------------

//   const [schedule, setSchedule] = useState({});
//   const [checklist, setChecklist] = useState({});
//   const [assignedTo, setAssignedTo] = useState([]);

//   const [cleaningDate, setCleaningDate] =
//     useState(newCleaningDate || '');

//   const [cleaningStartTime, setCleaningStartTime] =
//     useState(cleaningTime || '');

//   const [cleaningEndTime, setCleaningEndTime] =
//     useState('');

//   // ---------------------------------------------------------
//   // Location state
//   // ---------------------------------------------------------

//   const [apartmentLat, setApartmentLatitude] =
//     useState('');

//   const [apartmentLng, setApartmentLongitude] =
//     useState('');

//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');

//   const [apartmentName, setApartmentName] =
//     useState(propertyName || '');

//   const [distance, setDistance] = useState(0);

//   // ---------------------------------------------------------
//   // Replacement state
//   // ---------------------------------------------------------

//   const [replacementFee, setReplacementFee] =
//     useState(
//       routeReplacementFee !== undefined &&
//         routeReplacementFee !== null
//         ? Number(routeReplacementFee)
//         : null
//     );

//   const [originalCleaner, setOriginalCleaner] =
//     useState({
//       cleanerId: replacedCleanerId || null,
//       name:
//         replacedCleanerName ||
//         '',
//     });

//   // ---------------------------------------------------------
//   // Loading / response state
//   // ---------------------------------------------------------

//   const [loading, setLoading] =
//     useState(true);

//   const [responding, setResponding] =
//     useState(false);

//   const [requestStatus, setRequestStatus] =
//     useState('pending');

//   // ---------------------------------------------------------
//   // Map state
//   // ---------------------------------------------------------

//   const [mapImageUrl, setMapImageUrl] =
//     useState(null);

//   const [mapError, setMapError] =
//     useState(false);

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
//         await userService.getScheduleById(
//           scheduleId
//         );

//       const res =
//         response?.data || {};

//       setSchedule(res);

//       // -----------------------------------------------------
//       // Checklist
//       // -----------------------------------------------------

//       setChecklist(
//         res?.overall_checklist?.checklist ||
//           {}
//       );

//       // -----------------------------------------------------
//       // Assigned cleaners
//       // -----------------------------------------------------

//       const assignments =
//         Array.isArray(res?.assignedTo)
//           ? res.assignedTo
//           : [];

//       setAssignedTo(assignments);

//       // -----------------------------------------------------
//       // Schedule data
//       // -----------------------------------------------------

//       const scheduleData =
//         res?.schedule || {};

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

//       // -----------------------------------------------------
//       // Property location
//       // -----------------------------------------------------

//       const lat =
//         scheduleData?.apartment_latitude;

//       const lng =
//         scheduleData?.apartment_longitude;

//       if (lat !== undefined && lat !== null &&
//           lng !== undefined && lng !== null) {

//         setApartmentLatitude(lat);
//         setApartmentLongitude(lng);

//         const coordinate = {
//           latitude: Number(lat),
//           longitude: Number(lng),
//         };

//         // ---------------------------------------------------
//         // City / state
//         // ---------------------------------------------------

//         try {
//           const locationResult =
//             await getCityState(
//               coordinate
//             );

//           if (locationResult) {
//             setCity(
//               locationResult.city || ''
//             );

//             setState(
//               locationResult.state || ''
//             );
//           }
//         } catch (locationError) {
//           console.log(
//             'Location lookup error:',
//             locationError
//           );
//         }

//         // ---------------------------------------------------
//         // Distance
//         // ---------------------------------------------------

//         if (
//           geolocationData?.latitude !==
//             undefined &&
//           geolocationData?.longitude !==
//             undefined
//         ) {
//           const dist =
//             calculateDistance(
//               geolocationData.latitude,
//               geolocationData.longitude,
//               Number(lat),
//               Number(lng)
//             );

//           setDistance(dist);
//         }
//       }

//       // -----------------------------------------------------
//       // Property name
//       // -----------------------------------------------------

//       setApartmentName(
//         scheduleData?.apartment_name ||
//           propertyName ||
//           ''
//       );

//       // -----------------------------------------------------
//       // Find cleaner being replaced
//       // -----------------------------------------------------

//       let replacementAssignment = null;

//       // First try explicit cleaner ID
//       if (replacedCleanerId) {
//         replacementAssignment =
//           assignments.find(
//             assignment =>
//               String(
//                 assignment?.cleanerId
//               ) ===
//               String(
//                 replacedCleanerId
//               )
//           );
//       }

//       // Then try group + replacement status
//       if (
//         !replacementAssignment &&
//         group
//       ) {
//         replacementAssignment =
//           assignments.find(
//             assignment =>
//               assignment?.group ===
//                 group &&
//               assignment?.status ===
//                 'replacement_required'
//           );
//       }

//       // Final fallback: group
//       if (
//         !replacementAssignment &&
//         group
//       ) {
//         replacementAssignment =
//           assignments.find(
//             assignment =>
//               assignment?.group ===
//               group
//           );
//       }

//       if (replacementAssignment) {
//         // ---------------------------------------------------
//         // Original cleaner
//         // ---------------------------------------------------

//         const originalCleanerId =
//           replacementAssignment?.cleanerId;

//         const firstName =
//           replacementAssignment?.firstname ||
//           '';

//         const lastName =
//           replacementAssignment?.lastname ||
//           '';

//         const fullName =
//           `${firstName} ${lastName}`.trim();

//         setOriginalCleaner({
//           cleanerId:
//             originalCleanerId ||
//             replacedCleanerId ||
//             null,

//           name:
//             fullName ||
//             replacedCleanerName ||
//             tSafe(
//               'previously_assigned_cleaner',
//               'Previously assigned cleaner'
//             ),
//         });

//         // ---------------------------------------------------
//         // Replacement cleaner earnings
//         //
//         // Your actual MongoDB structure:
//         //
//         // assignedTo[].checklist.calculatedPrice
//         //
//         // fallback:
//         // assignedTo[].checklist.price
//         // ---------------------------------------------------

//         const assignmentChecklist =
//           replacementAssignment?.checklist ||
//           {};

//         const assignmentFee =
//           assignmentChecklist?.calculatedPrice ??
//           assignmentChecklist?.price;

//         if (
//           assignmentFee !== undefined &&
//           assignmentFee !== null
//         ) {
//           const numericFee =
//             Number(assignmentFee);

//           if (
//             !Number.isNaN(
//               numericFee
//             )
//           ) {
//             setReplacementFee(
//               numericFee
//             );
//           }
//         }
//       }

//     } catch (error) {
//       console.error(
//         'Failed to fetch replacement schedule:',
//         error
//       );

//       Alert.alert(
//         tSafe(
//           'error',
//           'Error'
//         ),
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
//     if (
//       apartmentLat !== '' &&
//       apartmentLng !== ''
//     ) {
//       const url =
//         `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
//         `pin-s+ff0000(${apartmentLng},${apartmentLat})/` +
//         `${apartmentLng},${apartmentLat},15,0/400x200` +
//         `?access_token=${MAP_BOX_SECRET_KEY}`;

//       setMapImageUrl(url);
//       setMapError(false);
//     }
//   }, [
//     apartmentLat,
//     apartmentLng,
//   ]);

//   // ---------------------------------------------------------
//   // Directions
//   // ---------------------------------------------------------

//   const handleOpenDirections = () => {
//     if (
//       !apartmentLat ||
//       !apartmentLng
//     ) {
//       Alert.alert(
//         tSafe(
//           'location_unavailable',
//           'Location unavailable'
//         ),
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

//     if (
//       originLat === undefined ||
//       originLat === null ||
//       originLng === undefined ||
//       originLng === null
//     ) {
//       const url =
//         `https://www.google.com/maps/search/?api=1` +
//         `&query=${apartmentLat},${apartmentLng}`;

//       Linking.openURL(url).catch(() => {
//         Alert.alert(
//           tSafe(
//             'error',
//             'Error'
//           ),
//           tSafe(
//             'unable_to_open_maps',
//             'Unable to open directions.'
//           )
//         );
//       });

//       return;
//     }

//     const url =
//       `https://www.google.com/maps/dir/?api=1` +
//       `&origin=${originLat},${originLng}` +
//       `&destination=${apartmentLat},${apartmentLng}` +
//       `&travelmode=driving`;

//     Linking.openURL(url).catch(() => {
//       Alert.alert(
//         tSafe(
//           'error',
//           'Error'
//         ),
//         tSafe(
//           'unable_to_open_maps',
//           'Unable to open directions.'
//         )
//       );
//     });
//   };

//   // ---------------------------------------------------------
//   // Scroll to task details
//   // ---------------------------------------------------------

//   const handleViewTaskDetails = () => {
//     scrollViewRef.current?.scrollTo({
//       y: Math.max(
//         taskDetailsY.current - 15,
//         0
//       ),
//       animated: true,
//     });
//   };

//   // ---------------------------------------------------------
//   // Format helpers
//   // ---------------------------------------------------------

//   const formatGroup = groupValue => {
//     if (!groupValue) {
//       return '';
//     }

//     return groupValue
//       .split('_')
//       .map(
//         word =>
//           word.charAt(0).toUpperCase() +
//           word.slice(1)
//       )
//       .join(' ');
//   };

//   const formatDate = date => {
//     if (!date) {
//       return '';
//     }

//     // Prevent timezone shifting for YYYY-MM-DD
//     if (
//       typeof date === 'string' &&
//       /^\d{4}-\d{2}-\d{2}$/.test(
//         date
//       )
//     ) {
//       const [
//         year,
//         month,
//         day,
//       ] = date
//         .split('-')
//         .map(Number);

//       return moment(
//         [
//           year,
//           month - 1,
//           day,
//         ]
//       ).format(
//         'ddd, MMM D, YYYY'
//       );
//     }

//     return moment(date).format(
//       'ddd, MMM D, YYYY'
//     );
//   };

//   const formatTime = time => {
//     if (!time) {
//       return '';
//     }

//     const parsed =
//       moment(
//         time,
//         [
//           'HH:mm:ss',
//           'HH:mm',
//           'h:mm:ss A',
//           'h:mm A',
//         ],
//         true
//       );

//     return parsed.isValid()
//       ? parsed.format(
//           'h:mm A'
//         )
//       : time;
//   };

//   // ---------------------------------------------------------
//   // Format money
//   // ---------------------------------------------------------

//   const formatMoney = amount => {
//     if (
//       amount === undefined ||
//       amount === null ||
//       Number.isNaN(
//         Number(amount)
//       )
//     ) {
//       return null;
//     }

//     return `$${Number(amount).toFixed(2)}`;
//   };

//   // ---------------------------------------------------------
//   // Replacement response
//   // ---------------------------------------------------------

//   const submitResponse = async (
//     acceptance
//   ) => {
//     if (responding) {
//       return;
//     }

//     try {
//       setResponding(true);

//       const data = {
//         scheduleId:
//           String(scheduleId),

//         // IMPORTANT:
//         // This must be the child replacement
//         // request ID.
//         requestId:
//           String(requestId),

//         cleanerId:
//           String(
//             effectiveCleanerId
//           ),

//         acceptance,
//       };

//       console.log(
//         '🔄 Replacement response:',
//         data
//       );

//       const response =
//         await userService.respondToReplacementRequest(
//           data
//         );

//       console.log(
//         '✅ Replacement response result:',
//         response?.data
//       );

//       setRequestStatus(
//         response?.data?.status ||
//           (
//             acceptance
//               ? 'accepted'
//               : 'declined'
//           )
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
//         '❌ Replacement response failed:',
//         error
//       );

//       Alert.alert(
//         tSafe(
//           'error',
//           'Error'
//         ),
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
//     if (
//       requestStatus !==
//       'pending'
//     ) {
//       return;
//     }

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
//             submitResponse(
//               true
//             ),
//         },
//       ]
//     );
//   };

//   // ---------------------------------------------------------
//   // Decline confirmation
//   // ---------------------------------------------------------

//   const handleDecline = () => {
//     if (
//       requestStatus !==
//       'pending'
//     ) {
//       return;
//     }

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
//             submitResponse(
//               false
//             ),
//         },
//       ]
//     );
//   };

//   // ---------------------------------------------------------
//   // Loading
//   // ---------------------------------------------------------

//   if (loading) {
//     return (
//       <SafeAreaView
//         style={
//           styles.safeArea
//         }
//       >
//         <View
//           style={
//             styles.centered
//           }
//         >
//           <ActivityIndicator
//             size="large"
//             color={
//               COLORS.primary
//             }
//           />

//           <Text
//             style={
//               styles.loadingText
//             }
//           >
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
//     requestStatus !==
//     'pending';

//   // ---------------------------------------------------------
//   // Render
//   // ---------------------------------------------------------

//   return (
//     <SafeAreaView
//       style={
//         styles.safeArea
//       }
//     >
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />

//       <View
//         style={
//           styles.container
//         }
//       >

//         <ScrollView
//           ref={scrollViewRef}
//           showsVerticalScrollIndicator={
//             false
//           }
//           contentContainerStyle={
//             styles.scrollContent
//           }
//         >

//           {/* ================================================= */}
//           {/* MAP */}
//           {/* ================================================= */}

//           <View
//             style={
//               styles.mapContainer
//             }
//           >

//             {mapImageUrl &&
//             !mapError ? (
//               <Image
//                 source={{
//                   uri: mapImageUrl,
//                 }}
//                 style={
//                   styles.mapImage
//                 }
//                 resizeMode="cover"
//                 onError={() =>
//                   setMapError(
//                     true
//                   )
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
//                   color={
//                     COLORS.gray
//                   }
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
//               style={
//                 styles.mapOverlay
//               }
//             >
//               <View
//                 style={
//                   styles.distanceContainer
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="map-marker-distance"
//                   size={18}
//                   color="#FFFFFF"
//                 />

//                 <Text
//                   style={
//                     styles.distanceText
//                   }
//                 >
//                   {distance.toFixed(
//                     1
//                   )}{' '}
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
//                   style={
//                     styles.directionText
//                   }
//                 >
//                   {tSafe(
//                     'directions',
//                     'Directions'
//                   )}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* ================================================= */}
//           {/* PROPERTY */}
//           {/* ================================================= */}

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
//                   color={
//                     COLORS.primary
//                   }
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
//                     color={
//                       COLORS.gray
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.locationText
//                     }
//                   >
//                     {city &&
//                     state
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

//           {/* ================================================= */}
//           {/* REPLACEMENT BANNER */}
//           {/* ================================================= */}

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

//           {/* ================================================= */}
//           {/* REPLACEMENT DETAILS */}
//           {/* ================================================= */}

//           <View
//             style={
//               styles.replacementDetailsCard
//             }
//           >

//             <View
//               style={
//                 styles.replacementDetailsHeader
//               }
//             >
//               <View
//                 style={
//                   styles.replacementDetailsIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account-switch-outline"
//                   size={24}
//                   color="#B45309"
//                 />
//               </View>

//               <View
//                 style={
//                   styles.replacementDetailsHeaderText
//                 }
//               >
//                 <Text
//                   style={
//                     styles.replacementDetailsTitle
//                   }
//                 >
//                   {tSafe(
//                     'replacement_details',
//                     'Replacement Details'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.replacementDetailsSubtitle
//                   }
//                 >
//                   {tSafe(
//                     'replacement_details_subtitle',
//                     'This assignment is replacing another cleaner.'
//                   )}
//                 </Text>
//               </View>
//             </View>

//             {/* Cleaner being replaced */}

//             <View
//               style={
//                 styles.replacedCleanerRow
//               }
//             >
//               <View
//                 style={
//                   styles.replacedCleanerAvatar
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account-outline"
//                   size={23}
//                   color="#6B7280"
//                 />
//               </View>

//               <View
//                 style={
//                   styles.replacedCleanerInfo
//                 }
//               >
//                 <Text
//                   style={
//                     styles.detailLabel
//                   }
//                 >
//                   {tSafe(
//                     'cleaner_being_replaced',
//                     'Cleaner Being Replaced'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.replacedCleanerName
//                   }
//                 >
//                   {originalCleaner.name ||
//                     tSafe(
//                       'previously_assigned_cleaner',
//                       'Previously assigned cleaner'
//                     )}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={
//                 styles.detailsDivider
//               }
//             />

//             {/* Earnings */}

//             <View
//               style={
//                 styles.earningsRow
//               }
//             >
//               <View
//                 style={
//                   styles.earningsIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="cash-multiple"
//                   size={24}
//                   color="#15803D"
//                 />
//               </View>

//               <View
//                 style={
//                   styles.earningsInfo
//                 }
//               >
//                 <Text
//                   style={
//                     styles.detailLabel
//                   }
//                 >
//                   {tSafe(
//                     'your_earnings',
//                     'Your Earnings'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.earningsAmount
//                   }
//                 >
//                   {formatMoney(
//                     replacementFee
//                   ) ||
//                     tSafe(
//                       'fee_not_available',
//                       'Fee not available'
//                     )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.earningsDescription
//                   }
//                 >
//                   {tSafe(
//                     'replacement_earnings_description',
//                     'This is the cleaning fee you will earn if you are selected for this replacement assignment.'
//                   )}
//                 </Text>
//               </View>
//             </View>

//           </View>

//           {/* ================================================= */}
//           {/* SCHEDULE */}
//           {/* ================================================= */}

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             {tSafe(
//               'cleaning_schedule',
//               'Cleaning Schedule'
//             )}
//           </Text>

//           <CustomCard
//             style={
//               styles.scheduleCard
//             }
//           >

//             {/* Date */}

//             <View
//               style={
//                 styles.scheduleItem
//               }
//             >
//               <View
//                 style={
//                   styles.scheduleIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="calendar-outline"
//                   size={23}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <View
//                 style={
//                   styles.scheduleContent
//                 }
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
//               style={
//                 styles.divider
//               }
//             />

//             {/* Time */}

//             <View
//               style={
//                 styles.scheduleItem
//               }
//             >
//               <View
//                 style={
//                   styles.scheduleIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="clock-outline"
//                   size={23}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <View
//                 style={
//                   styles.scheduleContent
//                 }
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
//               style={
//                 styles.divider
//               }
//             />

//             {/* Group */}

//             <View
//               style={
//                 styles.scheduleItem
//               }
//             >
//               <View
//                 style={
//                   styles.scheduleIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account-group-outline"
//                   size={23}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <View
//                 style={
//                   styles.scheduleContent
//                 }
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
//                   {formatGroup(
//                     group
//                   )}
//                 </Text>
//               </View>
//             </View>

//           </CustomCard>

//           {/* ================================================= */}
//           {/* VIEW FULL TASK DETAILS */}
//           {/* ================================================= */}

//           <TouchableOpacity
//             style={
//               styles.taskDetailsButton
//             }
//             onPress={
//               handleViewTaskDetails
//             }
//           >
//             <View
//               style={
//                 styles.taskDetailsIcon
//               }
//             >
//               <MaterialCommunityIcons
//                 name="clipboard-text-outline"
//                 size={23}
//                 color={
//                   COLORS.primary
//                 }
//               />
//             </View>

//             <View
//               style={
//                 styles.taskDetailsContent
//               }
//             >
//               <Text
//                 style={
//                   styles.taskDetailsTitle
//                 }
//               >
//                 {tSafe(
//                   'view_full_task_details',
//                   'View Full Task Details'
//                 )}
//               </Text>

//               <Text
//                 style={
//                   styles.taskDetailsSubtitle
//                 }
//               >
//                 {tSafe(
//                   'view_full_task_details_description',
//                   'Review rooms, checklist, duration, and cleaning requirements before accepting.'
//                 )}
//               </Text>
//             </View>

//             <MaterialCommunityIcons
//               name="chevron-right"
//               size={24}
//               color={
//                 COLORS.primary
//               }
//             />
//           </TouchableOpacity>

//           {/* ================================================= */}
//           {/* CLEANING SUMMARY */}
//           {/* ================================================= */}

//           <View
//             onLayout={event => {
//               taskDetailsY.current =
//                 event.nativeEvent.layout.y;
//             }}
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

//           {/* ================================================= */}
//           {/* RESPONSE EXPLANATION */}
//           {/* ================================================= */}

//           {!alreadyResponded && (
//             <View
//               style={
//                 styles.responseCard
//               }
//             >
//               <MaterialCommunityIcons
//                 name="information-outline"
//                 size={22}
//                 color={
//                   COLORS.primary
//                 }
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

//           {/* ================================================= */}
//           {/* ALREADY RESPONDED */}
//           {/* ================================================= */}

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

//         {/* ================================================= */}
//         {/* BOTTOM ACTIONS */}
//         {/* ================================================= */}

//         {!alreadyResponded && (
//           <View
//             style={
//               styles.bottomActions
//             }
//           >

//             {/* Decline */}

//             <TouchableOpacity
//               style={
//                 styles.declineButton
//               }
//               onPress={
//                 handleDecline
//               }
//               disabled={
//                 responding
//               }
//             >
//               {responding ? (
//                 <ActivityIndicator
//                   size="small"
//                   color={
//                     COLORS.gray
//                   }
//                 />
//               ) : (
//                 <>
//                   <MaterialCommunityIcons
//                     name="close"
//                     size={20}
//                     color={
//                       COLORS.gray
//                     }
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

//             {/* Accept */}

//             <TouchableOpacity
//               style={
//                 styles.acceptButton
//               }
//               onPress={
//                 handleAccept
//               }
//               disabled={
//                 responding
//               }
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
// // STYLES
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
//     paddingBottom: 135,
//   },

//   // ==========================================================
//   // MAP
//   // ==========================================================

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
//     justifyContent: 'space-between',
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

//   // ==========================================================
//   // PROPERTY
//   // ==========================================================

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

//   // ==========================================================
//   // REPLACEMENT BANNER
//   // ==========================================================

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

//   // ==========================================================
//   // REPLACEMENT DETAILS
//   // ==========================================================

//   replacementDetailsCard: {
//     marginHorizontal: 16,
//     marginTop: 18,
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },

//   replacementDetailsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   replacementDetailsIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 14,
//     backgroundColor: '#FFF7ED',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   replacementDetailsHeaderText: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   replacementDetailsTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#1F2937',
//   },

//   replacementDetailsSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#6B7280',
//   },

//   replacedCleanerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 18,
//   },

//   replacedCleanerAvatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   replacedCleanerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   detailLabel: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginBottom: 3,
//   },

//   replacedCleanerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//   },

//   detailsDivider: {
//     height: 1,
//     backgroundColor: '#F1F5F9',
//     marginVertical: 16,
//   },

//   earningsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   earningsIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#F0FDF4',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   earningsInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   earningsAmount: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#15803D',
//   },

//   earningsDescription: {
//     marginTop: 3,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#6B7280',
//   },

//   // ==========================================================
//   // SCHEDULE
//   // ==========================================================

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

//   // ==========================================================
//   // TASK DETAILS BUTTON
//   // ==========================================================

//   taskDetailsButton: {
//     marginHorizontal: 16,
//     marginTop: 18,
//     padding: 15,
//     borderRadius: 16,
//     backgroundColor: '#EFF6FF',
//     borderWidth: 1,
//     borderColor: '#DBEAFE',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   taskDetailsIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#FFFFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   taskDetailsContent: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   taskDetailsTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#1D4ED8',
//   },

//   taskDetailsSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#475569',
//   },

//   // ==========================================================
//   // SUMMARY
//   // ==========================================================

//   summaryContainer: {
//     marginHorizontal: 16,
//     marginTop: 20,
//   },

//   // ==========================================================
//   // RESPONSE INFO
//   // ==========================================================

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

//   // ==========================================================
//   // RESPONSE STATUS
//   // ==========================================================

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

//   // ==========================================================
//   // BOTTOM ACTIONS
//   // ==========================================================

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