// import React, {
//   useCallback,
//   useMemo,
//   useState,
// } from 'react';

// import {
//   useFocusEffect,
//   useRoute,
// } from '@react-navigation/native';

// import {
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Platform,
// } from 'react-native';

// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';

// import { Avatar } from 'react-native-paper';
// import Modal from 'react-native-modal';
// import StarRating from 'react-native-star-rating-widget';

// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import HostAvailabilityDisplay from '../../components/host/HostAvailabilityDisplay';
// import HostCertificationDisplay from '../../components/host/HostCertificationDisplay';
// import Reviews from '../../components/shared/Reviews';

// export default function HostCleanerRecommendations({
//   navigation,
// }) {
//   /*
//    * ============================================================
//    * TRUST / BADGE HELPERS
//    * ============================================================
//    */

//   const getCleanerTrustTier = useCallback(
//     (cleaner) => {
//       if (!cleaner) return null;
//       if (cleaner?.trustTier) return String(cleaner.trustTier).toLowerCase();
//       if (cleaner?.verification?.trustTier) return String(cleaner.verification.trustTier).toLowerCase();
//       if (cleaner?.profile?.trustTier) return String(cleaner.profile.trustTier).toLowerCase();
//       return null;
//     },
//     []
//   );

//   const isPremiumCleaner = useCallback(
//     (cleaner) => {
//       const tier = getCleanerTrustTier(cleaner);
//       return tier === 'premium' || tier === 'premium_cleaner';
//     },
//     [getCleanerTrustTier]
//   );

//   const isVerifiedCleaner = useCallback(
//     (cleaner) => {
//       if (typeof cleaner?.trust?.isVerified === 'boolean') {
//         return cleaner.trust.isVerified;
//       }
//       const tier = getCleanerTrustTier(cleaner);
//       if (tier === 'verified' || tier === 'trusted' || tier === 'premium' || tier === 'premium_cleaner') {
//         return true;
//       }
//       const verification = cleaner?.verification;
//       return Boolean(
//         verification?.identityVerified &&
//         verification?.phoneVerified &&
//         verification?.emailVerified
//       );
//     },
//     [getCleanerTrustTier]
//   );

//   const route = useRoute();

//   const {
//     scheduleId,
//     schedule: routeSchedule,
//   } = route?.params || {};

//   const [candidates, setCandidates] = useState([]);
//   const [requiredCleaners, setRequiredCleaners] = useState(0);
//   const [assignedTo, setAssignedTo] = useState([]);
//   const [scheduleDetails, setScheduleDetails] = useState({});
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [acceptedCleanerIds, setAcceptedCleanerIds] = useState(new Set());
//   const [profileCleaner, setProfileCleaner] = useState(null);
//   const [profileVisible, setProfileVisible] = useState(false);
//   const [profileTab, setProfileTab] = useState('about');
//   const [profileAvailability, setProfileAvailability] = useState(null);
//   const [profileReviews, setProfileReviews] = useState([]);
//   const [profileLoading, setProfileLoading] = useState(false);

//   /*
//    * ============================================================
//    * GROUP HELPERS
//    * ============================================================
//    */

//   const getCleanerGroup = useCallback(
//     (cleaner) => {
//       if (!cleaner) return null;
//       return (
//         cleaner.group ||
//         cleaner.requestGroup ||
//         cleaner.assignedGroup ||
//         cleaner.request?.group ||
//         null
//       );
//     },
//     []
//   );

//   const groupLabel = useCallback(
//     (group) => {
//       if (!group) return tSafe('unknown_group', 'Unknown group');
//       const normalizedGroup = group
//         .replace(/^group[_-]?/i, '')
//         .replace(/[_-]+/g, ' ')
//         .replace(/\b\w/g, (letter) => letter.toUpperCase());
//       return `${tSafe('group', 'Group')} ${normalizedGroup}`;
//     },
//     []
//   );

//   /*
//    * ============================================================
//    * REQUIRED GROUP COUNTS
//    * ============================================================
//    */

//   const requiredGroupCounts = useMemo(() => {
//     return assignedTo.reduce((counts, position) => {
//       const group = position?.group;
//       if (!group) return counts;
//       counts[group] = (counts[group] || 0) + 1;
//       return counts;
//     }, {});
//   }, [assignedTo]);

//   const requiredGroups = useMemo(
//     () => Object.keys(requiredGroupCounts),
//     [requiredGroupCounts]
//   );

//   /*
//    * ============================================================
//    * SELECTED GROUP COUNTS
//    * ============================================================
//    */

//   const selectedGroupCounts = useMemo(() => {
//     return selectedIds.reduce((counts, cleanerId) => {
//       const cleaner = candidates.find((candidate) => candidate.cleanerId === cleanerId);
//       const group = getCleanerGroup(cleaner);
//       if (!group) return counts;
//       counts[group] = (counts[group] || 0) + 1;
//       return counts;
//     }, {});
//   }, [selectedIds, candidates, getCleanerGroup]);

//   /*
//    * ============================================================
//    * MISSING GROUPS
//    * ============================================================
//    */

//   const missingGroups = useMemo(() => {
//     return requiredGroups
//       .map((group) => {
//         const required = requiredGroupCounts[group] || 0;
//         const selected = selectedGroupCounts[group] || 0;
//         return {
//           group,
//           required,
//           selected,
//           remaining: Math.max(0, required - selected),
//         };
//       })
//       .filter((item) => item.remaining > 0);
//   }, [requiredGroups, requiredGroupCounts, selectedGroupCounts]);

//   /*
//    * ============================================================
//    * GROUP COMPOSITION
//    * ============================================================
//    */

//   const groupCompositionComplete = useMemo(() => {
//     if (!requiredGroups.length) return false;
//     return requiredGroups.every(
//       (group) => (selectedGroupCounts[group] || 0) === (requiredGroupCounts[group] || 0)
//     );
//   }, [requiredGroups, requiredGroupCounts, selectedGroupCounts]);

//   /*
//    * ============================================================
//    * LOAD DATA
//    * ============================================================
//    */

//   const fetchData = useCallback(
//     async () => {
//       if (!scheduleId) {
//         setError(tSafe('missing_schedule_id', 'Missing schedule ID.'));
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         const [candidateResponse, requestResponse] = await Promise.all([
//           userService.getHostCleanerCandidates(scheduleId),
//           userService.getHostCleaningRequestByScheduleId(
//             scheduleId,
//             moment().format('YYYY-MM-DD HH:mm:ss')
//           ),
//         ]);

//         const candidateData = candidateResponse?.data || {};
//         const requestData = requestResponse?.data || [];

//         const requestAssignedTo = requestData?.[0]?.schedule?.assignedTo || [];
//         const routeAssignedTo = routeSchedule?.assignedTo || [];
//         const initialAssignedTo = requestAssignedTo.length > 0 ? requestAssignedTo : routeAssignedTo;

//         try {
//           await userService.sendHostGroupCleanerRequests(scheduleId);
//         } catch (requestErr) {
//           console.warn(
//             '⚠️ Host group cleaner request skipped:',
//             requestErr?.response?.data?.detail || requestErr?.message
//           );
//         }

//         const refreshedRequestResponse = await userService.getHostCleaningRequestByScheduleId(
//           scheduleId,
//           moment().format('YYYY-MM-DD HH:mm:ss')
//         );
//         const refreshedRequestData = refreshedRequestResponse?.data || [];

//         const refreshedRequestAssignedTo = refreshedRequestData?.[0]?.schedule?.assignedTo || [];
//         const refreshedAssignedTo = refreshedRequestAssignedTo.length > 0
//           ? refreshedRequestAssignedTo
//           : initialAssignedTo;

//         const acceptedIds = new Set(
//           refreshedRequestData
//             .filter((request) => request?.status === 'accepted' && request?.cleaner?.['_id'])
//             .map((request) => request.cleaner['_id'])
//         );
//         setAcceptedCleanerIds(acceptedIds);

//         const refreshedSchedule = refreshedRequestData?.[0]?.schedule || routeSchedule || {};
//         setScheduleDetails(refreshedSchedule);

//         const recommendedCandidates = candidateData.candidates || [];
//         setCandidates(recommendedCandidates);
//         setAssignedTo(refreshedAssignedTo);
//         setRequiredCleaners(refreshedAssignedTo.length);

//         setSelectedIds((current) =>
//           current.filter(
//             (id) =>
//               acceptedIds.has(id) &&
//               recommendedCandidates.some((candidate) => candidate.cleanerId === id)
//           )
//         );
//       } catch (err) {
//         console.error('❌ Error loading host cleaner recommendations:', err);
//         setError(
//           err?.response?.data?.detail ||
//           err?.message ||
//           tSafe('unable_to_load_cleaner_recommendations', 'Unable to load cleaner recommendations.')
//         );
//       } finally {
//         setLoading(false);
//       }
//     },
//     [scheduleId, routeSchedule]
//   );

//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//     }, [fetchData])
//   );

//   /*
//    * ============================================================
//    * CANDIDATE GROUPS
//    * ============================================================
//    */

//   const acceptedCandidates = useMemo(
//     () =>
//       candidates.filter(
//         (candidate) =>
//           acceptedCleanerIds.has(candidate.cleanerId) ||
//           candidate.requestStatus === 'accepted'
//       ),
//     [candidates, acceptedCleanerIds]
//   );

//   const pendingCandidates = useMemo(
//     () => candidates.filter((candidate) => candidate.requestStatus === 'pending_acceptance'),
//     [candidates]
//   );

//   /*
//    * ============================================================
//    * TOGGLE CLEANER
//    * ============================================================
//    */

//   const toggleCleaner = (cleanerId) => {
//     const candidate = candidates.find((item) => item.cleanerId === cleanerId);
//     const accepted = acceptedCleanerIds.has(cleanerId) || candidate?.requestStatus === 'accepted';
//     if (!accepted) return;

//     const cleanerGroup = getCleanerGroup(candidate);
//     if (!cleanerGroup) {
//       console.warn(
//         `Cleaner ${cleanerId} has no request group. Selection blocked until the group is known.`
//       );
//       return;
//     }

//     setSelectedIds((current) => {
//       if (current.includes(cleanerId)) {
//         return current.filter((id) => id !== cleanerId);
//       }
//       if (current.length >= requiredCleaners) {
//         return current;
//       }

//       const requiredForGroup = requiredGroupCounts[cleanerGroup] || 0;
//       const alreadySelectedForGroup = current.reduce((count, selectedId) => {
//         const selectedCleaner = candidates.find((item) => item.cleanerId === selectedId);
//         return count + (getCleanerGroup(selectedCleaner) === cleanerGroup ? 1 : 0);
//       }, 0);

//       if (alreadySelectedForGroup >= requiredForGroup) {
//         return current;
//       }

//       return [...current, cleanerId];
//     });
//   };

//   /*
//    * ============================================================
//    * CLEANER PROFILE
//    * ============================================================
//    */

//   const openCleanerProfile = async (cleaner) => {
//     setProfileCleaner(cleaner);
//     setProfileTab('about');
//     setProfileVisible(true);
//     setProfileAvailability(null);
//     setProfileReviews([]);
//     setProfileLoading(true);

//     try {
//       const [availabilityResponse, reviewsResponse] = await Promise.all([
//         userService.getCleanerAvailability(cleaner.cleanerId),
//         userService.getCleanerFeedbacks(cleaner.cleanerId),
//       ]);
//       setProfileAvailability(availabilityResponse?.data?.data || availabilityResponse?.data || null);
//       setProfileReviews(reviewsResponse?.data?.data || reviewsResponse?.data || []);
//     } catch (err) {
//       console.warn(
//         '⚠️ Unable to load cleaner profile details:',
//         err?.response?.data?.detail || err?.message
//       );
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   const closeCleanerProfile = () => {
//     setProfileVisible(false);
//     setProfileCleaner(null);
//   };

//   /*
//    * ============================================================
//    * CHECKOUT
//    * ============================================================
//    */

//   const proceedToCheckout = () => {
//     if (selectedIds.length !== requiredCleaners || !assignedTo.length || !groupCompositionComplete) {
//       return;
//     }

//     const openPositions = assignedTo.filter((position) => !position?.cleanerId);
//     if (openPositions.length !== selectedIds.length) {
//       return;
//     }

//     const selectedCleaners = selectedIds
//       .map((id) => candidates.find((candidate) => candidate.cleanerId === id))
//       .filter(Boolean);

//     const availablePositionsByGroup = openPositions.reduce((groups, position) => {
//       const group = position?.group;
//       if (!group) return groups;
//       if (!groups[group]) groups[group] = [];
//       groups[group].push(position);
//       return groups;
//     }, {});

//     const cleanersWithFee = [];

//     for (const cleaner of selectedCleaners) {
//       const cleanerGroup = getCleanerGroup(cleaner);
//       if (!cleanerGroup) {
//         console.error('❌ Cannot continue: selected cleaner has no group.', cleaner);
//         return;
//       }

//       const matchingPositions = availablePositionsByGroup[cleanerGroup] || [];
//       const position = matchingPositions.shift();

//       if (!position) {
//         console.error(
//           `❌ Cannot continue: no available ${cleanerGroup} position for cleaner ${cleaner.cleanerId}.`
//         );
//         return;
//       }

//       const calculatedPrice = Number(
//         position?.checklist?.calculatedPrice ?? position?.checklist?.price ?? 0
//       );

//       cleanersWithFee.push({
//         cleanerId: cleaner.cleanerId,
//         firstname: cleaner.firstname || '',
//         lastname: cleaner.lastname || '',
//         avatar: cleaner.avatar || '',
//         group: cleanerGroup,
//         fee: calculatedPrice,
//         price: Number(position?.checklist?.price ?? 0),
//         calculatedPrice,
//       });
//     }

//     const checkoutGroupCounts = cleanersWithFee.reduce((counts, cleaner) => {
//       counts[cleaner.group] = (counts[cleaner.group] || 0) + 1;
//       return counts;
//     }, {});

//     const checkoutCompositionValid = requiredGroups.every(
//       (group) => checkoutGroupCounts[group] === requiredGroupCounts[group]
//     );

//     if (!checkoutCompositionValid) {
//       console.error('❌ Group composition validation failed before checkout.', {
//         requiredGroupCounts,
//         checkoutGroupCounts,
//       });
//       return;
//     }

//     const totalFee = cleanersWithFee.reduce((sum, cleaner) => sum + Number(cleaner.fee || 0), 0);

//     console.log('💰 HOST CHECKOUT CLEANERS:', cleanersWithFee);
//     console.log('💰 HOST CHECKOUT TOTAL:', totalFee);

//     navigation?.navigate(ROUTES.host_group_checkout, {
//       requestId: null,
//       cleaning_fee: totalFee,
//       scheduleId,
//       schedule: {
//         ...scheduleDetails,
//         assignedTo,
//       },
//       selected_cleaners: selectedCleaners.map((cleaner) => ({
//         _id: cleaner.cleanerId,
//         cleanerId: cleaner.cleanerId,
//         firstname: cleaner.firstname || '',
//         lastname: cleaner.lastname || '',
//         avatar: cleaner.avatar || '',
//         group: getCleanerGroup(cleaner),
//       })),
//       cleanerIds: selectedIds,
//       cleanersWithFee,
//       hostSelectionFlow: true,
//     });
//   };

//   /*
//    * ============================================================
//    * CLEANER CARD
//    * ============================================================
//    */

//   const renderCandidate = ({ item }) => {
//     const selected = selectedIds.includes(item.cleanerId);
//     const performance = item.performance || {};
//     const hasRating = typeof item.averageRating === 'number';
//     const rating = hasRating ? item.averageRating.toFixed(1) : null;

//     const cleanerGroup = getCleanerGroup(item);
//     const requiredForGroup = cleanerGroup ? requiredGroupCounts[cleanerGroup] || 0 : 0;
//     const selectedForGroup = cleanerGroup ? selectedGroupCounts[cleanerGroup] || 0 : 0;
//     const groupFull = cleanerGroup && selectedForGroup >= requiredForGroup;
//     const cannotSelect = !selected &&
//       (selectedIds.length >= requiredCleaners || !cleanerGroup || groupFull);

//     const premium = isPremiumCleaner(item);
//     const verified = isVerifiedCleaner(item);

//     return (
//       <View
//         style={[
//           styles.cleanerCard,
//           selected && styles.cleanerCardSelected,
//         ]}
//       >
//         <TouchableOpacity
//           style={styles.cleanerCardMain}
//           onPress={() => openCleanerProfile(item)}
//           activeOpacity={0.88}
//         >
//           {/* Avatar */}
//           <View style={styles.avatarWrapper}>
//             {item.avatar ? (
//               <Avatar.Image size={64} source={{ uri: item.avatar }} />
//             ) : (
//               <View style={styles.avatarFallback}>
//                 <MaterialCommunityIcons name="account" size={28} color={COLORS.white} />
//               </View>
//             )}
//             {selected && (
//               <View style={styles.avatarCheck}>
//                 <MaterialCommunityIcons name="check" size={14} color={COLORS.white} />
//               </View>
//             )}
//           </View>

//           <View style={styles.cleanerMainInfo}>
//             <View style={styles.cleanerNameRow}>
//               <Text style={styles.cleanerName} numberOfLines={1}>
//                 {`${item.firstname || ''} ${item.lastname || ''}`.trim()}
//               </Text>
//               <View style={styles.ratingPill}>
//                 <MaterialCommunityIcons name="star" size={13} color="#C28A00" />
//                 <Text style={styles.ratingPillText}>{rating || tSafe('new', 'New')}</Text>
//               </View>
//             </View>

//             {/* Trust badges inline */}
//             {premium && (
//               <View style={styles.trustBadgeRow}>
//                 <MaterialCommunityIcons name="shield-star" size={14} color="#B45309" />
//                 <Text style={styles.premiumLabel}>{tSafe('premium_cleaner', 'Premium Cleaner')}</Text>
//               </View>
//             )}
//             {verified && !premium && (
//               <View style={styles.trustBadgeRow}>
//                 <MaterialCommunityIcons name="shield-check" size={14} color="#4B7BEC" />
//                 <Text style={styles.verifiedLabel}>{tSafe('verified_cleaner', 'Verified Cleaner')}</Text>
//               </View>
//             )}

//             <View style={styles.distanceRow}>
//               <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.textSecondary} />
//               <Text style={styles.distanceText}>
//                 {item.distance ?? '—'} {tSafe('miles_away', 'miles away')}
//               </Text>
//             </View>

//             <View style={styles.cardMetaRow}>
//               {cleanerGroup ? (
//                 <View style={styles.groupPill}>
//                   <MaterialCommunityIcons name="account-group-outline" size={13} color={COLORS.primary} />
//                   <Text style={styles.groupPillText}>{groupLabel(cleanerGroup)}</Text>
//                 </View>
//               ) : (
//                 <View style={[styles.groupPill, styles.groupPillWarning]}>
//                   <MaterialCommunityIcons name="clock-outline" size={13} color="#9A6700" />
//                   <Text style={[styles.groupPillText, styles.groupPillWarningText]}>
//                     {tSafe('group_pending', 'Group pending')}
//                   </Text>
//                 </View>
//               )}
//               <View style={styles.performancePill}>
//                 <Text style={styles.performancePillText}>
//                   {tSafe('performance', 'Performance')} {performance.performance_score ?? 0}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.recommendationRow}>
//               <View style={styles.recommendationIcon}>
//                 <MaterialCommunityIcons name="sparkles" size={13} color={COLORS.primary} />
//               </View>
//               <Text style={styles.recommendationText}>
//                 {tSafe('recommendation_score', 'Recommendation score')} {item.host_recommendation_score ?? 0}
//               </Text>
//             </View>

//             <View style={styles.acceptedRow}>
//               <MaterialCommunityIcons name="check-circle" size={15} color="#16803C" />
//               <Text style={styles.acceptedText}>
//                 {tSafe('cleaner_accepted_available', 'Accepted — available for selection')}
//               </Text>
//             </View>

//             {cleanerGroup && groupFull && !selected && (
//               <Text style={styles.groupNotice}>
//                 {`${groupLabel(cleanerGroup)} ${tSafe('group_already_filled', 'is already filled')}`}
//               </Text>
//             )}
//             {!cleanerGroup && (
//               <Text style={styles.groupNotice}>
//                 {tSafe('waiting_for_request_group', 'Waiting for request group information')}
//               </Text>
//             )}
//           </View>

//           <View style={styles.cardChevron}>
//             <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.selectButton,
//             selected && styles.selectButtonSelected,
//             cannotSelect && styles.selectButtonDisabled,
//           ]}
//           onPress={() => toggleCleaner(item.cleanerId)}
//           disabled={cannotSelect}
//           activeOpacity={0.8}
//         >
//           <MaterialCommunityIcons
//             name={selected ? 'check' : 'plus'}
//             size={20}
//             color={selected ? COLORS.white : cannotSelect ? '#A5A5A5' : COLORS.primary}
//           />
//           <Text
//             style={[
//               styles.selectButtonText,
//               selected && styles.selectButtonTextSelected,
//               cannotSelect && styles.selectButtonTextDisabled,
//             ]}
//           >
//             {selected ? tSafe('selected', 'Selected') : tSafe('select', 'Select')}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   /*
//    * ============================================================
//    * LOADING
//    * ============================================================
//    */

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <View style={styles.loadingIconContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//         </View>
//         <Text style={styles.loadingTitle}>
//           {tSafe('loading_recommendations', 'Finding recommended cleaners...')}
//         </Text>
//         <Text style={styles.loadingSubtitle}>
//           {tSafe(
//             'loading_recommendations_subtitle',
//             'Reviewing availability, performance, ratings, and distance.'
//           )}
//         </Text>
//       </View>
//     );
//   }

//   /*
//    * ============================================================
//    * ERROR
//    * ============================================================
//    */

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <View style={styles.errorIconContainer}>
//           <MaterialCommunityIcons name="alert-outline" size={30} color="#B00020" />
//         </View>
//         <Text style={styles.errorTitle}>{tSafe('unable_to_load', 'Unable to load recommendations')}</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchData} activeOpacity={0.85}>
//           <Text style={styles.retryText}>{tSafe('retry', 'Retry')}</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   /*
//    * ============================================================
//    * PROFILE MODAL
//    * ============================================================
//    */

//   const renderProfileModal = () => {
//     if (!profileCleaner) return null;

//     const accepted = acceptedCleanerIds.has(profileCleaner.cleanerId) ||
//       profileCleaner.requestStatus === 'accepted';
//     const selected = selectedIds.includes(profileCleaner.cleanerId);
//     const premium = isPremiumCleaner(profileCleaner);
//     const verified = isVerifiedCleaner(profileCleaner);
//     const rating = typeof profileCleaner.averageRating === 'number' ? profileCleaner.averageRating : 0;
//     const certification = profileCleaner.certification || {};
//     const cleanerGroup = getCleanerGroup(profileCleaner);
//     const requiredForGroup = cleanerGroup ? requiredGroupCounts[cleanerGroup] || 0 : 0;
//     const selectedForGroup = cleanerGroup ? selectedGroupCounts[cleanerGroup] || 0 : 0;
//     const groupFull = cleanerGroup && selectedForGroup >= requiredForGroup;

//     return (
//       <Modal
//         isVisible={profileVisible}
//         onBackdropPress={closeCleanerProfile}
//         propagateSwipe
//         style={styles.profileModal}
//         backdropOpacity={0.48}
//       >
//         <View style={styles.profileContainer}>
//           <View style={styles.modalHandle} />

//           <View style={styles.profileHeader}>
//             <View style={styles.profileIdentity}>
//               <View style={styles.profileAvatarWrapper}>
//                 {profileCleaner.avatar ? (
//                   <Avatar.Image size={72} source={{ uri: profileCleaner.avatar }} />
//                 ) : (
//                   <Avatar.Icon size={72} icon="account" color={COLORS.white} />
//                 )}
//               </View>

//               <View style={styles.profileNameContainer}>
//                 <Text style={styles.profileName} numberOfLines={1}>
//                   {`${profileCleaner.firstname || ''} ${profileCleaner.lastname || ''}`.trim()}
//                 </Text>

//                 {premium && (
//                   <View style={styles.profileTrustRow}>
//                     <MaterialCommunityIcons name="shield-star" size={14} color="#B45309" />
//                     <Text style={styles.profilePremiumText}>
//                       {tSafe('premium_cleaner', 'Premium Cleaner')}
//                     </Text>
//                   </View>
//                 )}
//                 {verified && !premium && (
//                   <View style={styles.profileTrustRow}>
//                     <MaterialCommunityIcons name="shield-check" size={14} color="#4B7BEC" />
//                     <Text style={styles.profileVerifiedText}>
//                       {tSafe('verified_cleaner', 'Verified Cleaner')}
//                     </Text>
//                   </View>
//                 )}

//                 {profileCleaner.location?.city && (
//                   <Text style={styles.profileLocation}>
//                     {profileCleaner.location.city}
//                     {profileCleaner.location.region_code ? `, ${profileCleaner.location.region_code}` : ''}
//                   </Text>
//                 )}

//                 <View style={styles.profileDistanceRow}>
//                   <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.textSecondary} />
//                   <Text style={styles.profileDistance}>
//                     {profileCleaner.distance ?? '—'} {tSafe('miles_away', 'miles away')}
//                   </Text>
//                 </View>

//                 {cleanerGroup && (
//                   <View style={styles.profileGroupBadge}>
//                     <Text style={styles.profileGroupBadgeText}>{groupLabel(cleanerGroup)}</Text>
//                   </View>
//                 )}

//                 <View style={styles.profileRatingRow}>
//                   <StarRating rating={rating} onChange={() => {}} starSize={17} enableHalfStar disabled />
//                   <Text style={styles.ratingText}>
//                     {rating > 0 ? rating.toFixed(1) : tSafe('new', 'New')}
//                     {profileCleaner.totalRatings ? ` (${profileCleaner.totalRatings})` : ''}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity onPress={closeCleanerProfile} style={styles.closeButton} activeOpacity={0.75}>
//               <MaterialCommunityIcons name="close" size={23} color={COLORS.gray} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.profileStatus}>
//             <MaterialCommunityIcons
//               name={accepted ? 'check-circle' : 'clock-outline'}
//               size={17}
//               color={accepted ? '#16803C' : '#9A6700'}
//             />
//             <Text style={[styles.profileStatusText, accepted ? styles.acceptedStatus : styles.pendingStatus]}>
//               {accepted
//                 ? tSafe('cleaner_accepted_request', 'Cleaner has accepted the request')
//                 : tSafe('waiting_cleaner_accept', 'Waiting for cleaner to accept')}
//             </Text>
//           </View>

//           <View style={styles.profileTabs}>
//             {[
//               ['about', tSafe('about', 'About')],
//               ['availability', tSafe('availability', 'Availability')],
//               ['reviews', tSafe('reviews', 'Reviews')],
//             ].map(([key, label]) => (
//               <TouchableOpacity
//                 key={key}
//                 style={[styles.profileTab, profileTab === key && styles.profileTabActive]}
//                 onPress={() => setProfileTab(key)}
//                 activeOpacity={0.75}
//               >
//                 <Text style={[styles.profileTabText, profileTab === key && styles.profileTabTextActive]}>
//                   {label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <ScrollView
//             style={styles.profileScroll}
//             contentContainerStyle={styles.profileScrollContent}
//             showsVerticalScrollIndicator={false}
//             nestedScrollEnabled
//             keyboardShouldPersistTaps="handled"
//           >
//             {profileLoading ? (
//               <View style={styles.profileLoading}>
//                 <ActivityIndicator size="large" color={COLORS.primary} />
//                 <Text style={styles.profileLoadingText}>
//                   {tSafe('loading_profile_details', 'Loading profile details...')}
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 {profileTab === 'about' && (
//                   <View>
//                     <Text style={styles.sectionTitle}>{tSafe('about', 'About')}</Text>
//                     <AboutMeDisplay mode="display" aboutme={profileCleaner.aboutme} isHost />

//                     <Text style={styles.sectionTitle}>{tSafe('certification', 'Certification')}</Text>
//                     <HostCertificationDisplay certification={certification} />

//                     <Text style={styles.sectionTitle}>{tSafe('performance', 'Performance')}</Text>
//                     <View style={styles.performanceGrid}>
//                       <View style={styles.performanceItem}>
//                         <Text style={styles.performanceValue}>
//                           {profileCleaner.performance?.performance_score ?? 0}
//                         </Text>
//                         <Text style={styles.performanceLabel}>{tSafe('performance', 'Performance')}</Text>
//                       </View>
//                       <View style={styles.performanceItem}>
//                         <Text style={styles.performanceValue}>{profileCleaner.ranking_score ?? 0}</Text>
//                         <Text style={styles.performanceLabel}>{tSafe('ranking', 'Ranking')}</Text>
//                       </View>
//                       <View style={styles.performanceItem}>
//                         <Text style={styles.performanceValue}>{profileCleaner.distance ?? '—'}</Text>
//                         <Text style={styles.performanceLabel}>{tSafe('miles_away', 'Miles away')}</Text>
//                       </View>
//                     </View>
//                   </View>
//                 )}

//                 {profileTab === 'availability' && (
//                   <View>
//                     <Text style={styles.sectionTitle}>{tSafe('availability', 'Availability')}</Text>
//                     <HostAvailabilityDisplay
//                       availability={profileAvailability?.availability || []}
//                       bookedSchedules={profileAvailability?.booked_schedules || []}
//                     />
//                   </View>
//                 )}

//                 {profileTab === 'reviews' && (
//                   <View>
//                     <Text style={styles.sectionTitle}>{tSafe('reviews', 'Reviews')}</Text>
//                     <Reviews ratings={profileReviews} cleanerId={profileCleaner.cleanerId} />
//                   </View>
//                 )}
//               </>
//             )}
//           </ScrollView>

//           <View style={styles.profileFooter}>
//             <TouchableOpacity
//               style={[
//                 styles.profileSelectButton,
//                 (!accepted || !cleanerGroup || (!selected && groupFull)) &&
//                   styles.profileSelectButtonDisabled,
//               ]}
//               disabled={!accepted || !cleanerGroup || (!selected && groupFull)}
//               onPress={() => {
//                 if (!accepted || !cleanerGroup) return;
//                 toggleCleaner(profileCleaner.cleanerId);
//                 closeCleanerProfile();
//               }}
//               activeOpacity={0.85}
//             >
//               <Text style={styles.profileSelectButtonText}>
//                 {selected
//                   ? tSafe('remove_from_team', 'Remove from Team')
//                   : !cleanerGroup
//                   ? tSafe('waiting_for_group', 'Waiting for Group')
//                   : groupFull
//                   ? `${groupLabel(cleanerGroup)} ${tSafe('already_filled', 'Already Filled')}`
//                   : tSafe('select_cleaner', 'Select Cleaner')}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   /*
//    * ============================================================
//    * MAIN SCREEN
//    * ============================================================
//    */

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.pageContent}
//       >
//         <View style={styles.header}>
//           <View style={styles.headerText}>
//             <Text style={styles.eyebrow}>{tSafe('cleaning_team', 'Cleaning team')}</Text>
//             <Text style={styles.title}>{tSafe('build_your_cleaning_team', 'Build your cleaning team')}</Text>
//             <Text style={styles.subtitle}>
//               {tSafe('choose_cleaners_for_your_team', 'Choose the cleaners you want for this booking.')}
//             </Text>
//           </View>

//           <View style={styles.selectionCounter}>
//             <View style={styles.selectionCounterProgress}>
//               <MaterialCommunityIcons
//                 name={selectedIds.length === requiredCleaners ? 'check-circle' : 'progress-clock'}
//                 size={64}
//                 color={selectedIds.length === requiredCleaners ? COLORS.success : COLORS.primary}
//               />
//             </View>
//             <Text style={styles.selectionCounterValue}>{selectedIds.length}</Text>
//             <Text style={styles.selectionCounterLabel}>{tSafe('selected', 'selected')}</Text>
//           </View>
//         </View>

//         <View style={styles.propertyContext}>
//           <View style={styles.propertyIconContainer}>
//             <MaterialCommunityIcons name="home-map-marker" size={21} color={COLORS.primary} />
//           </View>
//           <View style={styles.propertyInfo}>
//             <Text style={styles.propertyEyebrow}>{tSafe('property', 'Property')}</Text>
//             <Text style={styles.propertyName} numberOfLines={1}>
//               {scheduleDetails?.apartment_name?.trim() ||
//                 scheduleDetails?.overall_checklist?.apartment_name?.trim() ||
//                 tSafe('property', 'Property')}
//             </Text>
//             {scheduleDetails?.address?.trim() && (
//               <View style={styles.propertyLocationRow}>
//                 <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.textSecondary} />
//                 <Text style={styles.propertyLocation} numberOfLines={1}>
//                   {scheduleDetails.address.trim()}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>

//         {requiredGroups.length > 0 && (
//           <View style={styles.groupRequirements}>
//             <View style={styles.groupRequirementsHeader}>
//               <View style={styles.groupRequirementsTitleBlock}>
//                 <Text style={styles.groupRequirementsTitle}>{tSafe('team_requirements', 'Team requirements')}</Text>
//                 <Text style={styles.groupRequirementsSubtitle}>
//                   {tSafe(
//                     'group_requirement_description',
//                     'Each required group needs a cleaner before payment.'
//                   )}
//                 </Text>
//               </View>
//               <View
//                 style={[
//                   styles.completionBadge,
//                   groupCompositionComplete
//                     ? styles.completionBadgeComplete
//                     : styles.completionBadgeIncomplete,
//                 ]}
//               >
//                 <MaterialCommunityIcons
//                   name={groupCompositionComplete ? 'check-circle' : 'alert-circle-outline'}
//                   size={15}
//                   color={groupCompositionComplete ? COLORS.success : COLORS.warning}
//                 />
//                 <Text
//                   style={[
//                     styles.completionBadgeText,
//                     groupCompositionComplete
//                       ? styles.completionBadgeTextComplete
//                       : styles.completionBadgeTextIncomplete,
//                   ]}
//                 >
//                   {groupCompositionComplete ? tSafe('complete', 'Complete') : tSafe('incomplete', 'Incomplete')}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.groupRequirementsList}>
//               {requiredGroups.map((group) => {
//                 const required = requiredGroupCounts[group] || 0;
//                 const selected = selectedGroupCounts[group] || 0;
//                 const complete = selected === required;
//                 const progress = required > 0 ? (selected / required) * 100 : 0;

//                 return (
//                   <View key={group} style={styles.groupRequirementRow}>
//                     <View style={styles.groupRequirementHeader}>
//                       <View style={styles.groupRequirementLeft}>
//                         <MaterialCommunityIcons
//                           name={complete ? 'check-circle' : 'circle-outline'}
//                           size={18}
//                           color={complete ? COLORS.success : COLORS.warning}
//                         />
//                         <Text style={styles.groupRequirementName}>{groupLabel(group)}</Text>
//                       </View>
//                       <Text
//                         style={[
//                           styles.groupRequirementCount,
//                           complete && styles.groupRequirementCountComplete,
//                         ]}
//                       >
//                         {selected} / {required}
//                       </Text>
//                     </View>
//                     <View style={styles.groupProgressBar}>
//                       <View
//                         style={[
//                           styles.groupProgressFill,
//                           complete && styles.groupProgressFillComplete,
//                           { width: `${Math.min(progress, 100)}%` },
//                         ]}
//                       />
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           </View>
//         )}

//         {acceptedCandidates.length === 0 && pendingCandidates.length === 0 ? (
//           <View style={styles.selectionEmptyContainer}>
//             <View style={styles.selectionEmptyIcon}>
//               <MaterialCommunityIcons
//                 name={pendingCandidates.length > 0 ? 'clock-outline' : 'account-search-outline'}
//                 size={30}
//                 color={COLORS.primary}
//               />
//             </View>
//             <Text style={styles.selectionEmptyTitle}>
//               {pendingCandidates.length > 0
//                 ? tSafe('waiting_for_cleaners', 'Waiting for cleaners to respond')
//                 : tSafe('no_cleaners_available', 'No cleaners are currently available')}
//             </Text>
//             <Text style={styles.selectionEmptyText}>
//               {pendingCandidates.length > 0
//                 ? tSafe(
//                     'cleaners_accepting_will_appear',
//                     'Cleaners who accept the request will appear here and become available for your team selection.'
//                   )
//                 : tSafe(
//                     'no_cleaners_available_description',
//                     'There are currently no cleaners available to select for this cleaning.'
//                   )}
//             </Text>
//             {pendingCandidates.length > 0 && (
//               <View style={styles.pendingSummary}>
//                 <MaterialCommunityIcons name="clock-outline" size={16} color="#9A6700" />
//                 <Text style={styles.pendingSummaryText}>
//                   {pendingCandidates.length}{' '}
//                   {pendingCandidates.length === 1
//                     ? tSafe('cleaner_is', 'cleaner is')
//                     : tSafe('cleaners_are', 'cleaners are')}{' '}
//                   {tSafe('waiting_for_response', 'waiting for a response')}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : (
//           <FlatList
//             data={acceptedCandidates}
//             keyExtractor={(item) => item.cleanerId}
//             renderItem={renderCandidate}
//             scrollEnabled={false}
//             contentContainerStyle={styles.list}
//             showsVerticalScrollIndicator={false}
//             ListHeaderComponent={
//               <View style={styles.availableHeader}>
//                 <View>
//                   <Text style={styles.availableTitle}>{tSafe('available_cleaners', 'Available cleaners')}</Text>
//                   <Text style={styles.availableSubtitle}>
//                     {acceptedCandidates.length}{' '}
//                     {acceptedCandidates.length === 1
//                       ? tSafe('cleaner_has_accepted', 'cleaner has accepted the request')
//                       : tSafe('cleaners_have_accepted', 'cleaners have accepted the request')}
//                   </Text>
//                 </View>
//                 {pendingCandidates.length > 0 && (
//                   <View style={styles.waitingBadge}>
//                     <MaterialCommunityIcons name="clock-outline" size={14} color="#9A6700" />
//                     <Text style={styles.waitingBadgeText}>
//                       {pendingCandidates.length} {tSafe('waiting', 'waiting')}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             }
//           />
//         )}
//       </ScrollView>

//       <View style={styles.checkoutArea}>
//         {!groupCompositionComplete && selectedIds.length === requiredCleaners && missingGroups.length > 0 && (
//           <Text style={styles.checkoutWarning}>
//             {`${tSafe('still_needed', 'Still needed')}: ${missingGroups
//               .map((item) => `${groupLabel(item.group)} (${item.remaining})`)
//               .join(', ')}`}
//           </Text>
//         )}

//         <TouchableOpacity
//           style={[
//             styles.checkoutButton,
//             (!groupCompositionComplete || selectedIds.length !== requiredCleaners) &&
//               styles.checkoutButtonDisabled,
//           ]}
//           onPress={proceedToCheckout}
//           disabled={!groupCompositionComplete || selectedIds.length !== requiredCleaners}
//           activeOpacity={0.85}
//         >
//           <Text style={styles.checkoutButtonText}>
//             {groupCompositionComplete && selectedIds.length === requiredCleaners
//               ? tSafe('continue_to_payment', 'Continue to Payment')
//               : tSafe('complete_team_selection', 'Complete team selection to continue')}
//           </Text>
//           {groupCompositionComplete && selectedIds.length === requiredCleaners && (
//             <MaterialCommunityIcons
//               name="arrow-right"
//               size={19}
//               color={COLORS.white}
//               style={styles.checkoutArrow}
//             />
//           )}
//         </TouchableOpacity>
//       </View>

//       {renderProfileModal()}
//     </View>
//   );
// }

// /*
//  * ============================================================
//  * MODERN STYLES
//  * ============================================================
//  */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F6F7F9',
//   },
//   pageContent: {
//     paddingBottom: 140,
//   },

//   /* ----- HEADER ----- */
//   header: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 24,
//     paddingBottom: 16,
//     backgroundColor: COLORS.white,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.04,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   headerText: {
//     flex: 1,
//     paddingRight: 12,
//   },
//   eyebrow: {
//     fontSize: 12,
//     letterSpacing: 0.8,
//     textTransform: 'uppercase',
//     color: COLORS.primary,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 24,
//     lineHeight: 30,
//     fontWeight: '700',
//     color: COLORS.textPrimary,
//   },
//   subtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     lineHeight: 20,
//     color: COLORS.textSecondary,
//     maxWidth: 280,
//   },

//   /* ----- SELECTION COUNTER (circular) ----- */
//   selectionCounter: {
//     width: 64,
//     height: 64,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   selectionCounterProgress: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   selectionCounterValue: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginTop: 4,
//   },
//   selectionCounterLabel: {
//     fontSize: 8,
//     color: '#9CA3AF',
//     textTransform: 'uppercase',
//     letterSpacing: 0.4,
//     marginTop: 1,
//   },

//   /* ----- PROPERTY CONTEXT ----- */
//   propertyContext: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 16,
//     marginBottom: 12,
//     padding: 14,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 1,
//       },
//     }),
//   },
//   propertyIconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E8EDFB', // primaryLight
//     marginRight: 12,
//   },
//   propertyInfo: {
//     flex: 1,
//   },
//   propertyEyebrow: {
//     fontSize: 10,
//     color: '#9CA3AF',
//     textTransform: 'uppercase',
//     letterSpacing: 0.6,
//     marginBottom: 2,
//   },
//   propertyName: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     fontWeight: '600',
//   },
//   propertyLocationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   propertyLocation: {
//     flex: 1,
//     marginLeft: 4,
//     fontSize: 12,
//     lineHeight: 16,
//     color: COLORS.textSecondary,
//   },

//   /* ----- GROUP REQUIREMENTS (progress bars) ----- */
//   groupRequirements: {
//     marginHorizontal: 16,
//     marginBottom: 14,
//     padding: 16,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 1,
//       },
//     }),
//   },
//   groupRequirementsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   groupRequirementsTitleBlock: {
//     flex: 1,
//   },
//   groupRequirementsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },
//   groupRequirementsSubtitle: {
//     marginTop: 2,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },
//   completionBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#E8EDFB',
//   },
//   completionBadgeComplete: {
//     backgroundColor: '#D1FAE5',
//   },
//   completionBadgeIncomplete: {
//     backgroundColor: '#FEF3C7',
//   },
//   completionBadgeText: {
//     marginLeft: 5,
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   completionBadgeTextComplete: {
//     color: '#10B981',
//   },
//   completionBadgeTextIncomplete: {
//     color: '#F59E0B',
//   },

//   groupRequirementsList: {
//     marginTop: 4,
//   },
//   groupRequirementRow: {
//     marginBottom: 10,
//   },
//   groupRequirementHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 4,
//   },
//   groupRequirementLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   groupRequirementName: {
//     marginLeft: 6,
//     fontSize: 13,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },
//   groupRequirementCount: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.textSecondary,
//   },
//   groupRequirementCountComplete: {
//     color: '#10B981',
//   },
//   groupProgressBar: {
//     height: 6,
//     borderRadius: 4,
//     backgroundColor: '#E5E7EB',
//     overflow: 'hidden',
//   },
//   groupProgressFill: {
//     height: '100%',
//     borderRadius: 4,
//     backgroundColor: COLORS.primary,
//   },
//   groupProgressFillComplete: {
//     backgroundColor: '#10B981',
//   },

//   /* ----- CLEANER LIST ----- */
//   list: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//   },
//   availableHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     paddingHorizontal: 4,
//   },
//   availableTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.textPrimary,
//   },
//   availableSubtitle: {
//     marginTop: 2,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },
//   waitingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#FEF3C7',
//   },
//   waitingBadgeText: {
//     marginLeft: 4,
//     fontSize: 12,
//     color: '#F59E0B',
//     fontWeight: '600',
//   },

//   /* ----- CLEANER CARD ----- */
//   cleanerCard: {
//     marginBottom: 14,
//     padding: 14,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.06,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   cleanerCardSelected: {
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//     backgroundColor: '#E8EDFB',
//   },
//   cleanerCardMain: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },

//   avatarWrapper: {
//     position: 'relative',
//     width: 64,
//     height: 64,
//     marginRight: 0,
//   },
//   avatarFallback: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarCheck: {
//     position: 'absolute',
//     right: -4,
//     bottom: -4,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#10B981',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   cleanerMainInfo: {
//     flex: 1,
//     marginLeft: 14,
//     paddingRight: 4,
//   },
//   cleanerNameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   cleanerName: {
//     flex: 1,
//     marginRight: 8,
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },
//   ratingPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     backgroundColor: '#FFF8E7',
//   },
//   ratingPillText: {
//     marginLeft: 4,
//     fontSize: 12,
//     color: '#92400E',
//     fontWeight: '600',
//   },

//   trustBadgeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   premiumLabel: {
//     marginLeft: 4,
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#B45309',
//   },
//   verifiedLabel: {
//     marginLeft: 4,
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#4B7BEC',
//   },

//   distanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   distanceText: {
//     marginLeft: 4,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   cardMetaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     marginTop: 8,
//     gap: 6,
//   },
//   groupPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     backgroundColor: '#E8EDFB',
//   },
//   groupPillWarning: {
//     backgroundColor: '#FEF3C7',
//   },
//   groupPillText: {
//     marginLeft: 4,
//     fontSize: 11,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   groupPillWarningText: {
//     color: '#F59E0B',
//   },
//   performancePill: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//   },
//   performancePillText: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     fontWeight: '500',
//   },

//   recommendationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   recommendationIcon: {
//     width: 24,
//     height: 24,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E8EDFB',
//   },
//   recommendationText: {
//     marginLeft: 6,
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//   },
//   acceptedText: {
//     marginLeft: 5,
//     fontSize: 12,
//     color: '#10B981',
//     fontWeight: '500',
//   },

//   groupNotice: {
//     marginTop: 6,
//     fontSize: 11,
//     color: '#F59E0B',
//   },

//   selectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 30,
//     borderWidth: 1.5,
//     borderColor: COLORS.primary,
//     backgroundColor: 'transparent',
//   },
//   selectButtonSelected: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   selectButtonDisabled: {
//     borderColor: '#D1D5DB',
//     backgroundColor: '#F3F4F6',
//     opacity: 0.7,
//   },
//   selectButtonText: {
//     marginLeft: 6,
//     fontSize: 13,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   selectButtonTextSelected: {
//     color: COLORS.white,
//   },
//   selectButtonTextDisabled: {
//     color: '#9CA3AF',
//   },

//   cardChevron: {
//     width: 28,
//     alignItems: 'flex-end',
//     paddingTop: 4,
//   },

//   /* ----- EMPTY STATE ----- */
//   selectionEmptyContainer: {
//     minHeight: 360,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//     paddingVertical: 40,
//   },
//   selectionEmptyIcon: {
//     width: 72,
//     height: 72,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E8EDFB',
//     marginBottom: 16,
//   },
//   selectionEmptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: 6,
//   },
//   selectionEmptyText: {
//     maxWidth: 300,
//     fontSize: 14,
//     lineHeight: 20,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },
//   pendingSummary: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 18,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 16,
//     backgroundColor: '#FEF3C7',
//   },
//   pendingSummaryText: {
//     marginLeft: 6,
//     fontSize: 13,
//     color: '#F59E0B',
//     fontWeight: '500',
//   },

//   /* ----- CHECKOUT AREA (sticky) ----- */
//   checkoutArea: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 24 : 16,
//     backgroundColor: 'rgba(246,247,249,0.95)',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: -3 },
//         shadowOpacity: 0.06,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   checkoutWarning: {
//     marginBottom: 8,
//     fontSize: 13,
//     color: '#F59E0B',
//     textAlign: 'center',
//   },
//   checkoutButton: {
//     minHeight: 54,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     borderRadius: 16,
//     backgroundColor: COLORS.primary,
//     ...Platform.select({
//       ios: {
//         shadowColor: COLORS.primary,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   checkoutButtonDisabled: {
//     opacity: 0.5,
//     ...Platform.select({
//       ios: {
//         shadowOpacity: 0,
//       },
//       android: {
//         elevation: 0,
//       },
//     }),
//   },
//   checkoutButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   checkoutArrow: {
//     marginLeft: 8,
//   },

//   /* ----- LOADING / ERROR ----- */
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 30,
//     backgroundColor: '#F6F7F9',
//   },
//   loadingIconContainer: {
//     width: 72,
//     height: 72,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E8EDFB',
//   },
//   loadingTitle: {
//     marginTop: 18,
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//   },
//   loadingSubtitle: {
//     marginTop: 6,
//     maxWidth: 300,
//     fontSize: 14,
//     lineHeight: 20,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },
//   errorIconContainer: {
//     width: 72,
//     height: 72,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FEE2E2',
//     marginBottom: 16,
//   },
//   errorTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: 6,
//   },
//   errorText: {
//     maxWidth: 300,
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     lineHeight: 20,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     minWidth: 120,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 30,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//   },
//   retryText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   /* ----- PROFILE MODAL ----- */
//   profileModal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   profileContainer: {
//     height: '94%',
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     overflow: 'hidden',
//   },
//   modalHandle: {
//     alignSelf: 'center',
//     width: 44,
//     height: 5,
//     borderRadius: 3,
//     backgroundColor: '#D1D5DB',
//     marginTop: 10,
//     marginBottom: 8,
//   },

//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   profileIdentity: {
//     flexDirection: 'row',
//     flex: 1,
//   },
//   profileAvatarWrapper: {
//     position: 'relative',
//     width: 72,
//     height: 72,
//   },
//   profileNameContainer: {
//     flex: 1,
//     marginLeft: 14,
//     paddingRight: 6,
//   },
//   profileName: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.textPrimary,
//   },
//   profileTrustRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   profilePremiumText: {
//     marginLeft: 4,
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#B45309',
//   },
//   profileVerifiedText: {
//     marginLeft: 4,
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#4B7BEC',
//   },
//   profileLocation: {
//     marginTop: 2,
//     fontSize: 14,
//     color: COLORS.textSecondary,
//   },
//   profileDistanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   profileDistance: {
//     marginLeft: 4,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },
//   profileGroupBadge: {
//     alignSelf: 'flex-start',
//     marginTop: 6,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     backgroundColor: '#E8EDFB',
//   },
//   profileGroupBadgeText: {
//     fontSize: 11,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   profileRatingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   ratingText: {
//     marginLeft: 6,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F3F4F6',
//   },

//   profileStatus: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//   },
//   profileStatusText: {
//     marginLeft: 6,
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   acceptedStatus: {
//     color: '#10B981',
//   },
//   pendingStatus: {
//     color: '#F59E0B',
//   },

//   profileTabs: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     marginBottom: 4,
//   },
//   profileTab: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     marginRight: 8,
//     borderRadius: 30,
//     backgroundColor: '#F3F4F6',
//   },
//   profileTabActive: {
//     backgroundColor: COLORS.primary,
//   },
//   profileTabText: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontWeight: '500',
//   },
//   profileTabTextActive: {
//     color: COLORS.white,
//     fontWeight: '600',
//   },

//   profileScroll: {
//     flex: 1,
//   },
//   profileScrollContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     paddingBottom: 40,
//   },

//   profileLoading: {
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   profileLoadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: COLORS.textSecondary,
//   },

//   sectionTitle: {
//     marginTop: 14,
//     marginBottom: 12,
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   performanceGrid: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   performanceItem: {
//     flex: 1,
//     paddingVertical: 14,
//     paddingHorizontal: 6,
//     borderRadius: 16,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//   },
//   performanceValue: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   performanceLabel: {
//     marginTop: 4,
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   profileFooter: {
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 20 : 12,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     backgroundColor: COLORS.white,
//   },
//   profileSelectButton: {
//     minHeight: 52,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 16,
//     backgroundColor: COLORS.primary,
//   },
//   profileSelectButtonDisabled: {
//     opacity: 0.5,
//   },
//   profileSelectButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });





// import React, {
//   useCallback,
//   useMemo,
//   useState,
// } from 'react';

// import {
//   useFocusEffect,
//   useRoute,
// } from '@react-navigation/native';

// import {
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';

// import { Avatar } from 'react-native-paper';
// import Modal from 'react-native-modal';
// import StarRating from 'react-native-star-rating-widget';

// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import HostAvailabilityDisplay from '../../components/host/HostAvailabilityDisplay';
// import HostCertificationDisplay from '../../components/host/HostCertificationDisplay';
// import Reviews from '../../components/shared/Reviews';

// export default function HostCleanerRecommendations({
//   navigation,
// }) {
//   /*
//    * ============================================================
//    * TRUST / BADGE HELPERS
//    * ============================================================
//    */

//   const getCleanerTrustTier = useCallback(
//     (cleaner) => {
//       if (!cleaner) {
//         return null;
//       }

//       if (cleaner?.trustTier) {
//         return String(
//           cleaner.trustTier
//         ).toLowerCase();
//       }

//       if (
//         cleaner?.verification?.trustTier
//       ) {
//         return String(
//           cleaner.verification.trustTier
//         ).toLowerCase();
//       }

//       if (
//         cleaner?.profile?.trustTier
//       ) {
//         return String(
//           cleaner.profile.trustTier
//         ).toLowerCase();
//       }

//       return null;
//     },
//     []
//   );

//   const isPremiumCleaner = useCallback(
//     (cleaner) => {
//       const tier =
//         getCleanerTrustTier(cleaner);

//       return (
//         tier === 'premium' ||
//         tier === 'premium_cleaner'
//       );
//     },
//     [getCleanerTrustTier]
//   );

//   const isVerifiedCleaner = useCallback(
//     (cleaner) => {
//       if (
//         typeof cleaner?.trust?.isVerified ===
//         'boolean'
//       ) {
//         return cleaner.trust.isVerified;
//       }

//       const tier =
//         getCleanerTrustTier(cleaner);

//       if (
//         tier === 'verified' ||
//         tier === 'trusted' ||
//         tier === 'premium' ||
//         tier === 'premium_cleaner'
//       ) {
//         return true;
//       }

//       const verification =
//         cleaner?.verification;

//       return Boolean(
//         verification?.identityVerified &&
//           verification?.phoneVerified &&
//           verification?.emailVerified
//       );
//     },
//     [getCleanerTrustTier]
//   );

//   const route = useRoute();

//   const {
//     scheduleId,
//     schedule: routeSchedule,
//   } = route?.params || {};

//   const [candidates, setCandidates] =
//     useState([]);

//   const [requiredCleaners, setRequiredCleaners] =
//     useState(0);

//   const [assignedTo, setAssignedTo] =
//     useState([]);

//   const [scheduleDetails, setScheduleDetails] =
//     useState({});

//   const [selectedIds, setSelectedIds] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState(null);

//   const [acceptedCleanerIds, setAcceptedCleanerIds] =
//     useState(new Set());

//   const [profileCleaner, setProfileCleaner] =
//     useState(null);

//   const [profileVisible, setProfileVisible] =
//     useState(false);

//   const [profileTab, setProfileTab] =
//     useState('about');

//   const [profileAvailability, setProfileAvailability] =
//     useState(null);

//   const [profileReviews, setProfileReviews] =
//     useState([]);

//   const [profileLoading, setProfileLoading] =
//     useState(false);

//   /*
//    * ============================================================
//    * GROUP HELPERS
//    * ============================================================
//    */

//   const getCleanerGroup = useCallback(
//     (cleaner) => {
//       if (!cleaner) {
//         return null;
//       }

//       return (
//         cleaner.group ||
//         cleaner.requestGroup ||
//         cleaner.assignedGroup ||
//         cleaner.request?.group ||
//         null
//       );
//     },
//     []
//   );

//   const groupLabel = useCallback(
//     (group) => {
//       if (!group) {
//         return tSafe(
//           'unknown_group',
//           'Unknown group'
//         );
//       }

//       const normalizedGroup = group
//         .replace(/^group[_-]?/i, '')
//         .replace(/[_-]+/g, ' ')
//         .replace(/\b\w/g, (letter) =>
//           letter.toUpperCase()
//         );

//       return `${tSafe(
//         'group',
//         'Group'
//       )} ${normalizedGroup}`;
//     },
//     []
//   );

//   /*
//    * ============================================================
//    * REQUIRED GROUP COUNTS
//    * ============================================================
//    */

//   const requiredGroupCounts = useMemo(() => {
//     return assignedTo.reduce(
//       (counts, position) => {
//         const group =
//           position?.group;

//         if (!group) {
//           return counts;
//         }

//         counts[group] =
//           (counts[group] || 0) + 1;

//         return counts;
//       },
//       {}
//     );
//   }, [assignedTo]);

//   const requiredGroups = useMemo(
//     () =>
//       Object.keys(
//         requiredGroupCounts
//       ),
//     [requiredGroupCounts]
//   );

//   /*
//    * ============================================================
//    * SELECTED GROUP COUNTS
//    * ============================================================
//    */

//   const selectedGroupCounts = useMemo(() => {
//     return selectedIds.reduce(
//       (counts, cleanerId) => {
//         const cleaner =
//           candidates.find(
//             (candidate) =>
//               candidate.cleanerId ===
//               cleanerId
//           );

//         const group =
//           getCleanerGroup(cleaner);

//         if (!group) {
//           return counts;
//         }

//         counts[group] =
//           (counts[group] || 0) + 1;

//         return counts;
//       },
//       {}
//     );
//   }, [
//     selectedIds,
//     candidates,
//     getCleanerGroup,
//   ]);

//   /*
//    * ============================================================
//    * MISSING GROUPS
//    * ============================================================
//    */

//   const missingGroups = useMemo(() => {
//     return requiredGroups
//       .map((group) => {
//         const required =
//           requiredGroupCounts[group] ||
//           0;

//         const selected =
//           selectedGroupCounts[group] ||
//           0;

//         return {
//           group,
//           required,
//           selected,
//           remaining: Math.max(
//             0,
//             required - selected
//           ),
//         };
//       })
//       .filter(
//         (item) =>
//           item.remaining > 0
//       );
//   }, [
//     requiredGroups,
//     requiredGroupCounts,
//     selectedGroupCounts,
//   ]);

//   /*
//    * ============================================================
//    * GROUP COMPOSITION
//    * ============================================================
//    */

//   const groupCompositionComplete =
//     useMemo(() => {
//       if (!requiredGroups.length) {
//         return false;
//       }

//       return requiredGroups.every(
//         (group) =>
//           (selectedGroupCounts[group] ||
//             0) ===
//           (requiredGroupCounts[group] ||
//             0)
//       );
//     }, [
//       requiredGroups,
//       requiredGroupCounts,
//       selectedGroupCounts,
//     ]);

//   /*
//    * ============================================================
//    * LOAD DATA
//    * ============================================================
//    *
//    * IMPORTANT:
//    *
//    * The cleaner candidate endpoint is refreshed AFTER
//    * sendHostGroupCleanerRequests().
//    *
//    * This is necessary because the candidate endpoint
//    * provides requestStatus. Loading candidates before
//    * sending requests leaves requestStatus as "not_contacted"
//    * and causes the UI to incorrectly show:
//    *
//    * "No cleaners are currently available"
//    *
//    * instead of:
//    *
//    * "Waiting for cleaners to respond"
//    */

//   const fetchData = useCallback(
//     async () => {
//       if (!scheduleId) {
//         setError(
//           tSafe(
//             'missing_schedule_id',
//             'Missing schedule ID.'
//           )
//         );

//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         /*
//          * ------------------------------------------------------
//          * STEP 1
//          * Get the existing request state first.
//          * ------------------------------------------------------
//          */

//         const requestResponse =
//           await userService.getHostCleaningRequestByScheduleId(
//             scheduleId,
//             moment().format(
//               'YYYY-MM-DD HH:mm:ss'
//             )
//           );

//         const requestData =
//           requestResponse?.data || [];

//         /*
//          * Resolve required team.
//          */

//         const requestAssignedTo =
//           requestData?.[0]?.schedule
//             ?.assignedTo || [];

//         const routeAssignedTo =
//           routeSchedule?.assignedTo || [];

//         const initialAssignedTo =
//           requestAssignedTo.length > 0
//             ? requestAssignedTo
//             : routeAssignedTo;

//         /*
//          * ------------------------------------------------------
//          * STEP 2
//          * Create/send host-selection requests.
//          *
//          * This MUST happen before the candidate list is
//          * considered authoritative for requestStatus.
//          * ------------------------------------------------------
//          */

//         try {
//           await userService.sendHostGroupCleanerRequests(
//             scheduleId
//           );
//         } catch (requestErr) {
//           console.warn(
//             '⚠️ Host group cleaner request skipped:',
//             requestErr?.response?.data
//               ?.detail ||
//               requestErr?.message
//           );
//         }

//         /*
//          * ------------------------------------------------------
//          * STEP 3
//          * Refresh BOTH request state and candidates.
//          *
//          * This is the critical fix.
//          * ------------------------------------------------------
//          */

//         const [
//           refreshedCandidateResponse,
//           refreshedRequestResponse,
//         ] = await Promise.all([
//           userService.getHostCleanerCandidates(
//             scheduleId
//           ),
//           userService.getHostCleaningRequestByScheduleId(
//             scheduleId,
//             moment().format(
//               'YYYY-MM-DD HH:mm:ss'
//             )
//           ),
//         ]);

//         const candidateData =
//           refreshedCandidateResponse?.data ||
//           {};

//         const refreshedRequestData =
//           refreshedRequestResponse?.data ||
//           [];

//         /*
//          * ------------------------------------------------------
//          * Resolve latest assignedTo.
//          * ------------------------------------------------------
//          */

//         const refreshedRequestAssignedTo =
//           refreshedRequestData?.[0]
//             ?.schedule?.assignedTo || [];

//         const refreshedAssignedTo =
//           refreshedRequestAssignedTo.length >
//           0
//             ? refreshedRequestAssignedTo
//             : initialAssignedTo;

//         /*
//          * ------------------------------------------------------
//          * Determine accepted cleaners.
//          * ------------------------------------------------------
//          */

//         const acceptedIds = new Set(
//           refreshedRequestData
//             .filter(
//               (request) =>
//                 request?.status ===
//                   'accepted' &&
//                 request?.cleaner?.['_id']
//             )
//             .map(
//               (request) =>
//                 request.cleaner['_id']
//             )
//         );

//         /*
//          * Also accept the candidate endpoint's
//          * requestStatus === "accepted".
//          */

//         const recommendedCandidates =
//           Array.isArray(
//             candidateData?.candidates
//           )
//             ? candidateData.candidates
//             : [];

//         recommendedCandidates.forEach(
//           (candidate) => {
//             if (
//               candidate?.requestStatus ===
//               'accepted'
//             ) {
//               acceptedIds.add(
//                 candidate.cleanerId
//               );
//             }
//           }
//         );

//         setAcceptedCleanerIds(
//           acceptedIds
//         );

//         /*
//          * ------------------------------------------------------
//          * Resolve schedule.
//          * ------------------------------------------------------
//          */

//         const refreshedSchedule =
//           refreshedRequestData?.[0]
//             ?.schedule ||
//           routeSchedule ||
//           {};

//         setScheduleDetails(
//           refreshedSchedule
//         );

//         /*
//          * ------------------------------------------------------
//          * Candidate list.
//          *
//          * IMPORTANT:
//          * This is now the POST-request refreshed list.
//          * Therefore pending requestStatus values are visible.
//          * ------------------------------------------------------
//          */

//         setCandidates(
//           recommendedCandidates
//         );

//         /*
//          * ------------------------------------------------------
//          * Required team.
//          * ------------------------------------------------------
//          */

//         setAssignedTo(
//           refreshedAssignedTo
//         );

//         setRequiredCleaners(
//           refreshedAssignedTo.length
//         );

//         /*
//          * ------------------------------------------------------
//          * Preserve only accepted candidates.
//          * ------------------------------------------------------
//          */

//         setSelectedIds((current) =>
//           current.filter(
//             (id) =>
//               acceptedIds.has(id) &&
//               recommendedCandidates.some(
//                 (candidate) =>
//                   candidate.cleanerId ===
//                   id
//               )
//           )
//         );
//       } catch (err) {
//         console.error(
//           '❌ Error loading host cleaner recommendations:',
//           err
//         );

//         setError(
//           err?.response?.data?.detail ||
//             err?.message ||
//             tSafe(
//               'unable_to_load_cleaner_recommendations',
//               'Unable to load cleaner recommendations.'
//             )
//         );
//       } finally {
//         setLoading(false);
//       }
//     },
//     [
//       scheduleId,
//       routeSchedule,
//     ]
//   );

//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//     }, [fetchData])
//   );

//   /*
//    * ============================================================
//    * CANDIDATE GROUPS
//    * ============================================================
//    */

//   const acceptedCandidates = useMemo(
//     () =>
//       candidates.filter(
//         (candidate) =>
//           acceptedCleanerIds.has(
//             candidate.cleanerId
//           ) ||
//           candidate.requestStatus ===
//             'accepted'
//       ),
//     [
//       candidates,
//       acceptedCleanerIds,
//     ]
//   );

//   const pendingCandidates = useMemo(
//     () =>
//       candidates.filter(
//         (candidate) =>
//           candidate.requestStatus ===
//           'pending_acceptance'
//       ),
//     [candidates]
//   );

//   /*
//    * ============================================================
//    * TOGGLE CLEANER
//    * ============================================================
//    */

//   const toggleCleaner = (
//     cleanerId
//   ) => {
//     const candidate =
//       candidates.find(
//         (item) =>
//           item.cleanerId === cleanerId
//       );

//     const accepted =
//       acceptedCleanerIds.has(
//         cleanerId
//       ) ||
//       candidate?.requestStatus ===
//         'accepted';

//     if (!accepted) {
//       return;
//     }

//     const cleanerGroup =
//       getCleanerGroup(candidate);

//     if (!cleanerGroup) {
//       console.warn(
//         `Cleaner ${cleanerId} has no request group. Selection blocked until the group is known.`
//       );

//       return;
//     }

//     setSelectedIds((current) => {
//       /*
//        * Remove.
//        */

//       if (
//         current.includes(cleanerId)
//       ) {
//         return current.filter(
//           (id) => id !== cleanerId
//         );
//       }

//       /*
//        * Team already full.
//        */

//       if (
//         current.length >=
//         requiredCleaners
//       ) {
//         return current;
//       }

//       /*
//        * Group capacity.
//        */

//       const requiredForGroup =
//         requiredGroupCounts[
//           cleanerGroup
//         ] || 0;

//       const alreadySelectedForGroup =
//         current.reduce(
//           (count, selectedId) => {
//             const selectedCleaner =
//               candidates.find(
//                 (item) =>
//                   item.cleanerId ===
//                   selectedId
//               );

//             return (
//               count +
//               (getCleanerGroup(
//                 selectedCleaner
//               ) === cleanerGroup
//                 ? 1
//                 : 0)
//             );
//           },
//           0
//         );

//       if (
//         alreadySelectedForGroup >=
//         requiredForGroup
//       ) {
//         return current;
//       }

//       return [
//         ...current,
//         cleanerId,
//       ];
//     });
//   };

//   /*
//    * ============================================================
//    * CLEANER PROFILE
//    * ============================================================
//    */

//   const openCleanerProfile =
//     async (cleaner) => {
//       setProfileCleaner(cleaner);
//       setProfileTab('about');
//       setProfileVisible(true);
//       setProfileAvailability(null);
//       setProfileReviews([]);
//       setProfileLoading(true);

//       try {
//         const [
//           availabilityResponse,
//           reviewsResponse,
//         ] = await Promise.all([
//           userService.getCleanerAvailability(
//             cleaner.cleanerId
//           ),
//           userService.getCleanerFeedbacks(
//             cleaner.cleanerId
//           ),
//         ]);

//         setProfileAvailability(
//           availabilityResponse?.data
//             ?.data ||
//             availabilityResponse?.data ||
//             null
//         );

//         setProfileReviews(
//           reviewsResponse?.data?.data ||
//             reviewsResponse?.data ||
//             []
//         );
//       } catch (err) {
//         console.warn(
//           '⚠️ Unable to load cleaner profile details:',
//           err?.response?.data?.detail ||
//             err?.message
//         );
//       } finally {
//         setProfileLoading(false);
//       }
//     };

//   const closeCleanerProfile = () => {
//     setProfileVisible(false);
//     setProfileCleaner(null);
//   };

//   /*
//    * ============================================================
//    * CHECKOUT
//    * ============================================================
//    */

//   const proceedToCheckout = () => {
//     if (
//       selectedIds.length !==
//         requiredCleaners ||
//       !assignedTo.length ||
//       !groupCompositionComplete
//     ) {
//       return;
//     }

//     const openPositions =
//       assignedTo.filter(
//         (position) =>
//           !position?.cleanerId
//       );

//     if (
//       openPositions.length !==
//       selectedIds.length
//     ) {
//       return;
//     }

//     const selectedCleaners =
//       selectedIds
//         .map((id) =>
//           candidates.find(
//             (candidate) =>
//               candidate.cleanerId ===
//               id
//           )
//         )
//         .filter(Boolean);

//     /*
//      * Match selected cleaners to open
//      * positions by group.
//      */

//     const availablePositionsByGroup =
//       openPositions.reduce(
//         (groups, position) => {
//           const group =
//             position?.group;

//           if (!group) {
//             return groups;
//           }

//           if (!groups[group]) {
//             groups[group] = [];
//           }

//           groups[group].push(
//             position
//           );

//           return groups;
//         },
//         {}
//       );

//     const cleanersWithFee = [];

//     for (const cleaner of selectedCleaners) {
//       const cleanerGroup =
//         getCleanerGroup(cleaner);

//       if (!cleanerGroup) {
//         console.error(
//           '❌ Cannot continue: selected cleaner has no group.',
//           cleaner
//         );

//         return;
//       }

//       const matchingPositions =
//         availablePositionsByGroup[
//           cleanerGroup
//         ] || [];

//       const position =
//         matchingPositions.shift();

//       if (!position) {
//         console.error(
//           `❌ Cannot continue: no available ${cleanerGroup} position for cleaner ${cleaner.cleanerId}.`
//         );

//         return;
//       }

//       const calculatedPrice =
//         Number(
//           position?.checklist
//             ?.calculatedPrice ??
//             position?.checklist
//               ?.price ??
//             0
//         );

//       cleanersWithFee.push({
//         cleanerId:
//           cleaner.cleanerId,

//         firstname:
//           cleaner.firstname || '',

//         lastname:
//           cleaner.lastname || '',

//         avatar:
//           cleaner.avatar || '',

//         group: cleanerGroup,

//         fee: calculatedPrice,

//         price: Number(
//           position?.checklist
//             ?.price ?? 0
//         ),

//         calculatedPrice,
//       });
//     }

//     /*
//      * Validate final group composition.
//      */

//     const checkoutGroupCounts =
//       cleanersWithFee.reduce(
//         (counts, cleaner) => {
//           counts[cleaner.group] =
//             (counts[cleaner.group] ||
//               0) + 1;

//           return counts;
//         },
//         {}
//       );

//     const checkoutCompositionValid =
//       requiredGroups.every(
//         (group) =>
//           checkoutGroupCounts[
//             group
//           ] ===
//           requiredGroupCounts[group]
//       );

//     if (
//       !checkoutCompositionValid
//     ) {
//       console.error(
//         '❌ Group composition validation failed before checkout.',
//         {
//           requiredGroupCounts,
//           checkoutGroupCounts,
//         }
//       );

//       return;
//     }

//     /*
//      * Calculate actual cleaning subtotal.
//      */

//     const totalFee =
//       cleanersWithFee.reduce(
//         (sum, cleaner) =>
//           sum +
//           Number(
//             cleaner.fee || 0
//           ),
//         0
//       );

//     console.log(
//       '💰 HOST CHECKOUT CLEANERS:',
//       cleanersWithFee
//     );

//     console.log(
//       '💰 HOST CHECKOUT TOTAL:',
//       totalFee
//     );

//     navigation?.navigate(
//       ROUTES.host_group_checkout,
//       {
//         requestId: null,

//         cleaning_fee: totalFee,

//         scheduleId,

//         schedule: {
//           ...scheduleDetails,
//           assignedTo,
//         },

//         selected_cleaners:
//           selectedCleaners.map(
//             (cleaner) => ({
//               _id:
//                 cleaner.cleanerId,

//               cleanerId:
//                 cleaner.cleanerId,

//               firstname:
//                 cleaner.firstname ||
//                 '',

//               lastname:
//                 cleaner.lastname ||
//                 '',

//               avatar:
//                 cleaner.avatar || '',

//               group:
//                 getCleanerGroup(
//                   cleaner
//                 ),
//             })
//           ),

//         cleanerIds: selectedIds,

//         cleanersWithFee,

//         hostSelectionFlow: true,
//       }
//     );
//   };

//   /*
//    * ============================================================
//    * CLEANER CARD
//    * ============================================================
//    */

//   const renderCandidate = ({
//     item,
//   }) => {
//     const selected =
//       selectedIds.includes(
//         item.cleanerId
//       );

//     const performance =
//       item.performance || {};

//     const hasRating =
//       typeof item.averageRating ===
//       'number';

//     const rating = hasRating
//       ? item.averageRating.toFixed(
//           1
//         )
//       : null;

//     const cleanerGroup =
//       getCleanerGroup(item);

//     const requiredForGroup =
//       cleanerGroup
//         ? requiredGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const selectedForGroup =
//       cleanerGroup
//         ? selectedGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const groupFull =
//       cleanerGroup &&
//       selectedForGroup >=
//         requiredForGroup;

//     const cannotSelect =
//       !selected &&
//       (selectedIds.length >=
//         requiredCleaners ||
//         !cleanerGroup ||
//         groupFull);

//     const premium =
//       isPremiumCleaner(item);

//     const verified =
//       isVerifiedCleaner(item);

//     return (
//       <View
//         style={[
//           styles.cleanerCard,
//           selected &&
//             styles.cleanerCardSelected,
//         ]}
//       >
//         <TouchableOpacity
//           style={styles.cleanerCardMain}
//           onPress={() =>
//             openCleanerProfile(item)
//           }
//           activeOpacity={0.88}
//         >
//           <View
//             style={styles.avatarWrapper}
//           >
//             {item.avatar ? (
//               <Avatar.Image
//                 size={58}
//                 source={{
//                   uri: item.avatar,
//                 }}
//               />
//             ) : (
//               <View
//                 style={
//                   styles.avatarFallback
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account"
//                   size={27}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             )}

//             {premium ? (
//               <View
//                 style={
//                   styles.premiumBadge
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="shield-star"
//                   size={14}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             ) : verified ? (
//               <View
//                 style={
//                   styles.verifiedBadge
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="shield-check"
//                   size={14}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             ) : null}

//             {selected ? (
//               <View
//                 style={
//                   styles.avatarCheck
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="check"
//                   size={13}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             ) : null}
//           </View>

//           <View
//             style={styles.cleanerMainInfo}
//           >
//             <View
//               style={
//                 styles.cleanerNameRow
//               }
//             >
//               <Text
//                 style={styles.cleanerName}
//                 numberOfLines={1}
//               >
//                 {`${item.firstname || ''} ${
//                   item.lastname || ''
//                 }`.trim()}
//               </Text>

//               <View
//                 style={
//                   styles.ratingPill
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="star"
//                   size={13}
//                   color="#C28A00"
//                 />

//                 <Text
//                   style={
//                     styles.ratingPillText
//                   }
//                 >
//                   {rating ||
//                     tSafe(
//                       'new',
//                       'New'
//                     )}
//                 </Text>
//               </View>
//             </View>

//             {premium ? (
//               <View
//                 style={styles.trustBadgeRow}
//               >
//                 <MaterialCommunityIcons
//                   name="shield-star"
//                   size={14}
//                   color="#A87900"
//                 />

//                 <Text
//                   style={styles.premiumLabel}
//                 >
//                   {tSafe(
//                     'premium_cleaner',
//                     'Premium Cleaner'
//                   )}
//                 </Text>
//               </View>
//             ) : verified ? (
//               <View
//                 style={styles.trustBadgeRow}
//               >
//                 <MaterialCommunityIcons
//                   name="shield-check"
//                   size={14}
//                   color="#4778C7"
//                 />

//                 <Text
//                   style={styles.verifiedLabel}
//                 >
//                   {tSafe(
//                     'verified_cleaner',
//                     'Verified Cleaner'
//                   )}
//                 </Text>
//               </View>
//             ) : null}

//             <View
//               style={
//                 styles.distanceRow
//               }
//             >
//               <MaterialCommunityIcons
//                 name="map-marker-outline"
//                 size={14}
//                 color={
//                   COLORS.textSecondary
//                 }
//               />

//               <Text
//                 style={
//                   styles.distanceText
//                 }
//               >
//                 {item.distance ??
//                   '—'}{' '}
//                 {tSafe(
//                   'miles_away',
//                   'miles away'
//                 )}
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.cardMetaRow
//               }
//             >
//               {cleanerGroup ? (
//                 <View
//                   style={
//                     styles.groupPill
//                   }
//                 >
//                   <MaterialCommunityIcons
//                     name="account-group-outline"
//                     size={13}
//                     color={
//                       COLORS.primary
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.groupPillText
//                     }
//                   >
//                     {groupLabel(
//                       cleanerGroup
//                     )}
//                   </Text>
//                 </View>
//               ) : (
//                 <View
//                   style={[
//                     styles.groupPill,
//                     styles.groupPillWarning,
//                   ]}
//                 >
//                   <MaterialCommunityIcons
//                     name="clock-outline"
//                     size={13}
//                     color="#9A6700"
//                   />

//                   <Text
//                     style={[
//                       styles.groupPillText,
//                       styles.groupPillWarningText,
//                     ]}
//                   >
//                     {tSafe(
//                       'group_pending',
//                       'Group pending'
//                     )}
//                   </Text>
//                 </View>
//               )}

//               <View
//                 style={styles.performancePill}
//               >
//                 <Text
//                   style={
//                     styles.performancePillText
//                   }
//                 >
//                   {tSafe(
//                     'performance',
//                     'Performance'
//                   )}{' '}
//                   {performance.performance_score ??
//                     0}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={
//                 styles.recommendationRow
//               }
//             >
//               <View
//                 style={
//                   styles.recommendationIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="sparkles"
//                   size={13}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <Text
//                 style={
//                   styles.recommendationText
//                 }
//               >
//                 {tSafe(
//                   'recommendation_score',
//                   'Recommendation score'
//                 )}{' '}
//                 {item.host_recommendation_score ??
//                   0}
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.acceptedRow
//               }
//             >
//               <MaterialCommunityIcons
//                 name="check-circle"
//                 size={15}
//                 color="#16803C"
//               />

//               <Text
//                 style={
//                   styles.acceptedText
//                 }
//               >
//                 {tSafe(
//                   'cleaner_accepted_available',
//                   'Accepted — available for selection'
//                 )}
//               </Text>
//             </View>

//             {cleanerGroup &&
//             groupFull &&
//             !selected ? (
//               <Text
//                 style={
//                   styles.groupNotice
//                 }
//               >
//                 {`${groupLabel(
//                   cleanerGroup
//                 )} ${tSafe(
//                   'group_already_filled',
//                   'is already filled'
//                 )}`}
//               </Text>
//             ) : null}

//             {!cleanerGroup ? (
//               <Text
//                 style={
//                   styles.groupNotice
//                 }
//               >
//                 {tSafe(
//                   'waiting_for_request_group',
//                   'Waiting for request group information'
//                 )}
//               </Text>
//             ) : null}
//           </View>

//           <View
//             style={styles.cardChevron}
//           >
//             <MaterialCommunityIcons
//               name="chevron-right"
//               size={20}
//               color={
//                 COLORS.textSecondary
//               }
//             />
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.selectButton,
//             selected &&
//               styles.selectButtonSelected,
//             cannotSelect &&
//               styles.selectButtonDisabled,
//           ]}
//           onPress={() =>
//             toggleCleaner(
//               item.cleanerId
//             )
//           }
//           disabled={cannotSelect}
//           activeOpacity={0.8}
//         >
//           <MaterialCommunityIcons
//             name={
//               selected
//                 ? 'check'
//                 : 'plus'
//             }
//             size={20}
//             color={
//               selected
//                 ? COLORS.white
//                 : cannotSelect
//                 ? '#A5A5A5'
//                 : COLORS.primary
//             }
//           />

//           <Text
//             style={[
//               styles.selectButtonText,
//               selected &&
//                 styles.selectButtonTextSelected,
//               cannotSelect &&
//                 styles.selectButtonTextDisabled,
//             ]}
//           >
//             {selected
//               ? tSafe(
//                   'selected',
//                   'Selected'
//                 )
//               : tSafe(
//                   'select',
//                   'Select'
//                 )}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   /*
//    * ============================================================
//    * LOADING
//    * ============================================================
//    */

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <View
//           style={
//             styles.loadingIconContainer
//           }
//         >
//           <ActivityIndicator
//             size="large"
//             color={COLORS.primary}
//           />
//         </View>

//         <Text
//           style={styles.loadingTitle}
//         >
//           {tSafe(
//             'loading_recommendations',
//             'Finding recommended cleaners...'
//           )}
//         </Text>

//         <Text
//           style={styles.loadingSubtitle}
//         >
//           {tSafe(
//             'loading_recommendations_subtitle',
//             'Reviewing availability, performance, ratings, and distance.'
//           )}
//         </Text>
//       </View>
//     );
//   }

//   /*
//    * ============================================================
//    * ERROR
//    * ============================================================
//    */

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <View
//           style={
//             styles.errorIconContainer
//           }
//         >
//           <MaterialCommunityIcons
//             name="alert-outline"
//             size={30}
//             color="#B00020"
//           />
//         </View>

//         <Text
//           style={styles.errorTitle}
//         >
//           {tSafe(
//             'unable_to_load',
//             'Unable to load recommendations'
//           )}
//         </Text>

//         <Text
//           style={styles.errorText}
//         >
//           {error}
//         </Text>

//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={fetchData}
//           activeOpacity={0.85}
//         >
//           <Text
//             style={styles.retryText}
//           >
//             {tSafe(
//               'retry',
//               'Retry'
//             )}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   /*
//    * ============================================================
//    * PROFILE MODAL
//    * ============================================================
//    */

//   const renderProfileModal = () => {
//     if (!profileCleaner) {
//       return null;
//     }

//     const accepted =
//       acceptedCleanerIds.has(
//         profileCleaner.cleanerId
//       ) ||
//       profileCleaner.requestStatus ===
//         'accepted';

//     const selected =
//       selectedIds.includes(
//         profileCleaner.cleanerId
//       );

//     const premium =
//       isPremiumCleaner(
//         profileCleaner
//       );

//     const verified =
//       isVerifiedCleaner(
//         profileCleaner
//       );

//     const rating =
//       typeof profileCleaner.averageRating ===
//       'number'
//         ? profileCleaner.averageRating
//         : 0;

//     const certification =
//       profileCleaner.certification ||
//       {};

//     const cleanerGroup =
//       getCleanerGroup(
//         profileCleaner
//       );

//     const requiredForGroup =
//       cleanerGroup
//         ? requiredGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const selectedForGroup =
//       cleanerGroup
//         ? selectedGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const groupFull =
//       cleanerGroup &&
//       selectedForGroup >=
//         requiredForGroup;

//     return (
//       <Modal
//         isVisible={profileVisible}
//         onBackdropPress={
//           closeCleanerProfile
//         }
//         propagateSwipe
//         style={styles.profileModal}
//         backdropOpacity={0.48}
//       >
//         <View
//           style={
//             styles.profileContainer
//           }
//         >
//           <View
//             style={styles.modalHandle}
//           />

//           <View
//             style={styles.profileHeader}
//           >
//             <View
//               style={styles.profileIdentity}
//             >
//               <View
//                 style={
//                   styles.profileAvatarWrapper
//                 }
//               >
//                 {profileCleaner.avatar ? (
//                   <Avatar.Image
//                     size={70}
//                     source={{
//                       uri: profileCleaner.avatar,
//                     }}
//                   />
//                 ) : (
//                   <Avatar.Icon
//                     size={70}
//                     icon="account"
//                     color={
//                       COLORS.white
//                     }
//                   />
//                 )}

//                 {premium ? (
//                   <View
//                     style={
//                       styles.profilePremiumBadge
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-star"
//                       size={15}
//                       color={
//                         COLORS.white
//                       }
//                     />
//                   </View>
//                 ) : verified ? (
//                   <View
//                     style={
//                       styles.profileVerifiedBadge
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-check"
//                       size={15}
//                       color={
//                         COLORS.white
//                       }
//                     />
//                   </View>
//                 ) : null}
//               </View>

//               <View
//                 style={
//                   styles.profileNameContainer
//                 }
//               >
//                 <Text
//                   style={
//                     styles.profileName
//                   }
//                   numberOfLines={1}
//                 >
//                   {`${profileCleaner.firstname || ''} ${
//                     profileCleaner.lastname || ''
//                   }`.trim()}
//                 </Text>

//                 {premium ? (
//                   <View
//                     style={
//                       styles.profileTrustRow
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-star"
//                       size={14}
//                       color="#A87900"
//                     />

//                     <Text
//                       style={
//                         styles.profilePremiumText
//                       }
//                     >
//                       {tSafe(
//                         'premium_cleaner',
//                         'Premium Cleaner'
//                       )}
//                     </Text>
//                   </View>
//                 ) : verified ? (
//                   <View
//                     style={
//                       styles.profileTrustRow
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-check"
//                       size={14}
//                       color="#4778C7"
//                     />

//                     <Text
//                       style={
//                         styles.profileVerifiedText
//                       }
//                     >
//                       {tSafe(
//                         'verified_cleaner',
//                         'Verified Cleaner'
//                       )}
//                     </Text>
//                   </View>
//                 ) : null}

//                 {profileCleaner
//                   .location?.city ? (
//                   <Text
//                     style={
//                       styles.profileLocation
//                     }
//                   >
//                     {
//                       profileCleaner
//                         .location
//                         .city
//                     }
//                     {profileCleaner
//                       .location
//                       .region_code
//                       ? `, ${profileCleaner.location.region_code}`
//                       : ''}
//                   </Text>
//                 ) : null}

//                 <View
//                   style={
//                     styles.profileDistanceRow
//                   }
//                 >
//                   <MaterialCommunityIcons
//                     name="map-marker-outline"
//                     size={14}
//                     color={
//                       COLORS.textSecondary
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.profileDistance
//                     }
//                   >
//                     {profileCleaner.distance ??
//                       '—'}{' '}
//                     {tSafe(
//                       'miles_away',
//                       'miles away'
//                     )}
//                   </Text>
//                 </View>

//                 {cleanerGroup ? (
//                   <View
//                     style={
//                       styles.profileGroupBadge
//                     }
//                   >
//                     <Text
//                       style={
//                         styles.profileGroupBadgeText
//                       }
//                     >
//                       {groupLabel(
//                         cleanerGroup
//                       )}
//                     </Text>
//                   </View>
//                 ) : null}

//                 <View
//                   style={
//                     styles.profileRatingRow
//                   }
//                 >
//                   <StarRating
//                     rating={rating}
//                     onChange={() => {}}
//                     starSize={17}
//                     enableHalfStar
//                     disabled
//                   />

//                   <Text
//                     style={
//                       styles.ratingText
//                     }
//                   >
//                     {rating > 0
//                       ? rating.toFixed(
//                           1
//                         )
//                       : tSafe(
//                           'new',
//                           'New'
//                         )}

//                     {profileCleaner.totalRatings
//                       ? ` (${profileCleaner.totalRatings})`
//                       : ''}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={
//                 closeCleanerProfile
//               }
//               style={
//                 styles.closeButton
//               }
//               activeOpacity={0.75}
//             >
//               <MaterialCommunityIcons
//                 name="close"
//                 size={23}
//                 color={
//                   COLORS.gray
//                 }
//               />
//             </TouchableOpacity>
//           </View>

//           <View
//             style={styles.profileStatus}
//           >
//             <MaterialCommunityIcons
//               name={
//                 accepted
//                   ? 'check-circle'
//                   : 'clock-outline'
//               }
//               size={17}
//               color={
//                 accepted
//                   ? '#16803C'
//                   : '#9A6700'
//               }
//             />

//             <Text
//               style={[
//                 styles.profileStatusText,
//                 accepted
//                   ? styles.acceptedStatus
//                   : styles.pendingStatus,
//               ]}
//             >
//               {accepted
//                 ? tSafe(
//                     'cleaner_accepted_request',
//                     'Cleaner has accepted the request'
//                   )
//                 : tSafe(
//                     'waiting_cleaner_accept',
//                     'Waiting for cleaner to accept'
//                   )}
//             </Text>
//           </View>

//           <View
//             style={styles.profileTabs}
//           >
//             {[
//               [
//                 'about',
//                 tSafe(
//                   'about',
//                   'About'
//                 ),
//               ],
//               [
//                 'availability',
//                 tSafe(
//                   'availability',
//                   'Availability'
//                 ),
//               ],
//               [
//                 'reviews',
//                 tSafe(
//                   'reviews',
//                   'Reviews'
//                 ),
//               ],
//             ].map(
//               ([key, label]) => (
//                 <TouchableOpacity
//                   key={key}
//                   style={[
//                     styles.profileTab,
//                     profileTab ===
//                       key &&
//                       styles.profileTabActive,
//                   ]}
//                   onPress={() =>
//                     setProfileTab(
//                       key
//                     )
//                   }
//                   activeOpacity={0.75}
//                 >
//                   <Text
//                     style={[
//                       styles.profileTabText,
//                       profileTab ===
//                         key &&
//                         styles.profileTabTextActive,
//                     ]}
//                   >
//                     {label}
//                   </Text>
//                 </TouchableOpacity>
//               )
//             )}
//           </View>
            
//           <ScrollView
//             style={styles.profileScroll}
//             contentContainerStyle={
//               styles.profileScrollContent
//             }
//             showsVerticalScrollIndicator={
//               false
//             }
//             nestedScrollEnabled
//             keyboardShouldPersistTaps="handled"
//           >
//             {profileLoading ? (
//               <View
//                 style={
//                   styles.profileLoading
//                 }
//               >
//                 <ActivityIndicator
//                   size="large"
//                   color={
//                     COLORS.primary
//                   }
//                 />

//                 <Text
//                   style={
//                     styles.profileLoadingText
//                   }
//                 >
//                   {tSafe(
//                     'loading_profile_details',
//                     'Loading profile details...'
//                   )}
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 {profileTab ===
//                   'about' && (
//                   <View>
//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'about',
//                         'About'
//                       )}
//                     </Text>

//                     <AboutMeDisplay
//                       mode="display"
//                       aboutme={
//                         profileCleaner.aboutme
//                       }
//                       isHost
//                     />

//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'certification',
//                         'Certification'
//                       )}
//                     </Text>

//                     <HostCertificationDisplay
//                       certification={
//                         certification
//                       }
//                     />

//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'performance',
//                         'Performance'
//                       )}
//                     </Text>

//                     <View
//                       style={
//                         styles.performanceGrid
//                       }
//                     >
//                       <View
//                         style={
//                           styles.performanceItem
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.performanceValue
//                           }
//                         >
//                           {profileCleaner
//                             .performance
//                             ?.performance_score ??
//                             0}
//                         </Text>

//                         <Text
//                           style={
//                             styles.performanceLabel
//                           }
//                         >
//                           {tSafe(
//                             'performance',
//                             'Performance'
//                           )}
//                         </Text>
//                       </View>

//                       <View
//                         style={
//                           styles.performanceItem
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.performanceValue
//                           }
//                         >
//                           {profileCleaner
//                             .ranking_score ??
//                             0}
//                         </Text>

//                         <Text
//                           style={
//                             styles.performanceLabel
//                           }
//                         >
//                           {tSafe(
//                             'ranking',
//                             'Ranking'
//                           )}
//                         </Text>
//                       </View>

//                       <View
//                         style={
//                           styles.performanceItem
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.performanceValue
//                           }
//                         >
//                           {profileCleaner.distance ??
//                             '—'}
//                         </Text>

//                         <Text
//                           style={
//                             styles.performanceLabel
//                           }
//                         >
//                           {tSafe(
//                             'miles_away',
//                             'Miles away'
//                           )}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 )}

//                 {profileTab ===
//                   'availability' && (
//                   <View>
//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'availability',
//                         'Availability'
//                       )}
//                     </Text>

//                     <HostAvailabilityDisplay
//                       availability={
//                         profileAvailability?.availability ||
//                         []
//                       }
//                       bookedSchedules={
//                         profileAvailability?.booked_schedules ||
//                         []
//                       }
//                     />
//                   </View>
//                 )}

//                 {profileTab ===
//                   'reviews' && (
//                   <View>
//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'reviews',
//                         'Reviews'
//                       )}
//                     </Text>

//                     <Reviews
//                       ratings={
//                         profileReviews
//                       }
//                       cleanerId={
//                         profileCleaner.cleanerId
//                       }
//                     />
//                   </View>
//                 )}
//               </>
//             )}
//           </ScrollView>

//           <View
//             style={styles.profileFooter}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.profileSelectButton,
//                 (!accepted ||
//                   !cleanerGroup ||
//                   (!selected &&
//                     groupFull)) &&
//                   styles.profileSelectButtonDisabled,
//               ]}
//               disabled={
//                 !accepted ||
//                 !cleanerGroup ||
//                 (!selected &&
//                   groupFull)
//               }
//               onPress={() => {
//                 if (
//                   !accepted ||
//                   !cleanerGroup
//                 ) {
//                   return;
//                 }

//                 toggleCleaner(
//                   profileCleaner.cleanerId
//                 );

//                 closeCleanerProfile();
//               }}
//               activeOpacity={0.85}
//             >
//               <Text
//                 style={
//                   styles.profileSelectButtonText
//                 }
//               >
//                 {selected
//                   ? tSafe(
//                       'remove_from_team',
//                       'Remove from Team'
//                     )
//                   : !cleanerGroup
//                   ? tSafe(
//                       'waiting_for_group',
//                       'Waiting for Group'
//                     )
//                   : groupFull
//                   ? `${groupLabel(
//                       cleanerGroup
//                     )} ${tSafe(
//                       'already_filled',
//                       'Already Filled'
//                     )}`
//                   : tSafe(
//                       'select_cleaner',
//                       'Select Cleaner'
//                     )}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   /*
//    * ============================================================
//    * MAIN SCREEN
//    * ============================================================
//    */

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={
//           false
//         }
//         contentContainerStyle={
//           styles.pageContent
//         }
//       >
//         <View
//           style={styles.header}
//         >
//           <View
//             style={styles.headerText}
//           >
//             <Text
//               style={styles.eyebrow}
//             >
//               {tSafe(
//                 'cleaning_team',
//                 'Cleaning team'
//               )}
//             </Text>

//             <Text
//               style={styles.title}
//             >
//               {tSafe(
//                 'build_your_cleaning_team',
//                 'Build your cleaning team'
//               )}
//             </Text>

//             <Text
//               style={styles.subtitle}
//             >
//               {tSafe(
//                 'choose_cleaners_for_your_team',
//                 'Choose the cleaners you want for this booking.'
//               )}
//             </Text>
//           </View>

//           <View
//             style={styles.selectionCounter}
//           >
//             <Text
//               style={
//                 styles.selectionCounterValue
//               }
//             >
//               {selectedIds.length}
//             </Text>

//             <Text
//               style={
//                 styles.selectionCounterDivider
//               }
//             >
//               /
//             </Text>

//             <Text
//               style={
//                 styles.selectionCounterTotal
//               }
//             >
//               {requiredCleaners}
//             </Text>

//             <Text
//               style={
//                 styles.selectionCounterLabel
//               }
//             >
//               {tSafe(
//                 'selected',
//                 'selected'
//               )}
//             </Text>
//           </View>
//         </View>

//         <View
//           style={styles.propertyContext}
//         >
//           <View
//             style={
//               styles.propertyIconContainer
//             }
//           >
//             <MaterialCommunityIcons
//               name="home-map-marker"
//               size={21}
//               color={
//                 COLORS.primary
//               }
//             />
//           </View>

//           <View
//             style={styles.propertyInfo}
//           >
//             <Text
//               style={styles.propertyEyebrow}
//             >
//               {tSafe(
//                 'property',
//                 'Property'
//               )}
//             </Text>

//             <Text
//               style={styles.propertyName}
//               numberOfLines={1}
//             >
//               {scheduleDetails
//                 ?.apartment_name
//                 ?.trim() ||
//                 scheduleDetails
//                   ?.overall_checklist
//                   ?.apartment_name
//                   ?.trim() ||
//                 tSafe(
//                   'property',
//                   'Property'
//                 )}
//             </Text>

//             {scheduleDetails?.address?.trim() ? (
//               <View
//                 style={
//                   styles.propertyLocationRow
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="map-marker-outline"
//                   size={14}
//                   color={
//                     COLORS.textSecondary
//                   }
//                 />

//                 <Text
//                   style={
//                     styles.propertyLocation
//                   }
//                   numberOfLines={1}
//                 >
//                   {scheduleDetails.address.trim()}
//                 </Text>
//               </View>
//             ) : null}
//           </View>
//         </View>

//         {requiredGroups.length > 0 ? (
//           <View
//             style={
//               styles.groupRequirements
//             }
//           >
//             <View
//               style={
//                 styles.groupRequirementsHeader
//               }
//             >
//               <View
//                 style={
//                   styles.groupRequirementsTitleBlock
//                 }
//               >
//                 <Text
//                   style={
//                     styles.groupRequirementsTitle
//                   }
//                 >
//                   {tSafe(
//                     'team_requirements',
//                     'Team requirements'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.groupRequirementsSubtitle
//                   }
//                 >
//                   {tSafe(
//                     'group_requirement_description',
//                     'Each required group needs a cleaner before payment.'
//                   )}
//                 </Text>
//               </View>

//               <View
//                 style={[
//                   styles.completionBadge,
//                   groupCompositionComplete
//                     ? styles.completionBadgeComplete
//                     : styles.completionBadgeIncomplete,
//                 ]}
//               >
//                 <MaterialCommunityIcons
//                   name={
//                     groupCompositionComplete
//                       ? 'check-circle'
//                       : 'alert-circle-outline'
//                   }
//                   size={15}
//                   color={
//                     groupCompositionComplete
//                       ? '#16803C'
//                       : '#9A6700'
//                   }
//                 />

//                 <Text
//                   style={[
//                     styles.completionBadgeText,
//                     groupCompositionComplete
//                       ? styles.completionBadgeTextComplete
//                       : styles.completionBadgeTextIncomplete,
//                   ]}
//                 >
//                   {groupCompositionComplete
//                     ? tSafe(
//                         'complete',
//                         'Complete'
//                       )
//                     : tSafe(
//                         'incomplete',
//                         'Incomplete'
//                       )}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={
//                 styles.groupRequirementsList
//               }
//             >
//               {requiredGroups.map(
//                 (group) => {
//                   const required =
//                     requiredGroupCounts[
//                       group
//                     ] || 0;

//                   const selected =
//                     selectedGroupCounts[
//                       group
//                     ] || 0;

//                   const complete =
//                     selected ===
//                     required;

//                   return (
//                     <View
//                       key={group}
//                       style={
//                         styles.groupRequirementRow
//                       }
//                     >
//                       <View
//                         style={
//                           styles.groupRequirementLeft
//                         }
//                       >
//                         <MaterialCommunityIcons
//                           name={
//                             complete
//                               ? 'check-circle'
//                               : 'circle-outline'
//                           }
//                           size={17}
//                           color={
//                             complete
//                               ? '#16803C'
//                               : '#9A6700'
//                           }
//                         />

//                         <Text
//                           style={
//                             styles.groupRequirementName
//                           }
//                         >
//                           {groupLabel(
//                             group
//                           )}
//                         </Text>
//                       </View>

//                       <Text
//                         style={[
//                           styles.groupRequirementCount,
//                           complete &&
//                             styles.groupRequirementCountComplete,
//                         ]}
//                       >
//                         {selected} /{' '}
//                         {required}
//                       </Text>
//                     </View>
//                   );
//                 }
//               )}
//             </View>
//           </View>
//         ) : null}

//         {/*
//          * IMPORTANT:
//          *
//          * We only show "No cleaners available" when:
//          *
//          * - nobody has accepted
//          * - AND nobody is pending
//          *
//          * If pendingCandidates.length > 0, the user sees
//          * the waiting state and notification count.
//          */}

//         {acceptedCandidates.length ===
//           0 &&
//         pendingCandidates.length ===
//           0 ? (
//           <View
//             style={
//               styles.selectionEmptyContainer
//             }
//           >
//             <View
//               style={
//                 styles.selectionEmptyIcon
//               }
//             >
//               <MaterialCommunityIcons
//                 name="account-search-outline"
//                 size={30}
//                 color={
//                   COLORS.primary
//                 }
//               />
//             </View>

//             <Text
//               style={
//                 styles.selectionEmptyTitle
//               }
//             >
//               {tSafe(
//                 'no_cleaners_available',
//                 'No cleaners are currently available'
//               )}
//             </Text>

//             <Text
//               style={
//                 styles.selectionEmptyText
//               }
//             >
//               {tSafe(
//                 'no_cleaners_available_description',
//                 'There are currently no cleaners available to select for this cleaning.'
//               )}
//             </Text>
//           </View>
//         ) : acceptedCandidates.length ===
//           0 &&
//           pendingCandidates.length >
//             0 ? (
//           <View
//             style={
//               styles.selectionEmptyContainer
//             }
//           >
//             <View
//               style={
//                 styles.selectionEmptyIcon
//               }
//             >
//               <MaterialCommunityIcons
//                 name="clock-outline"
//                 size={30}
//                 color={
//                   COLORS.primary
//                 }
//               />
//             </View>

//             <Text
//               style={
//                 styles.selectionEmptyTitle
//               }
//             >
//               {tSafe(
//                 'waiting_for_cleaners',
//                 'Waiting for cleaners to respond'
//               )}
//             </Text>

//             <Text
//               style={
//                 styles.selectionEmptyText
//               }
//             >
//               {tSafe(
//                 'cleaners_accepting_will_appear',
//                 'Cleaners who accept the request will appear here and become available for your team selection.'
//               )}
//             </Text>

//             <View
//               style={
//                 styles.pendingSummary
//               }
//             >
//               <MaterialCommunityIcons
//                 name="clock-outline"
//                 size={16}
//                 color="#9A6700"
//               />

//               <Text
//                 style={
//                   styles.pendingSummaryText
//                 }
//               >
//                 {pendingCandidates.length}{' '}
//                 {pendingCandidates.length ===
//                 1
//                   ? tSafe(
//                       'cleaner_is',
//                       'cleaner is'
//                     )
//                   : tSafe(
//                       'cleaners_are',
//                       'cleaners are'
//                     )}{' '}
//                 {tSafe(
//                   'waiting_for_response',
//                   'waiting for a response'
//                 )}
//               </Text>
//             </View>
//           </View>
//         ) : (
//           <FlatList
//             data={
//               acceptedCandidates
//             }
//             keyExtractor={(item) =>
//               item.cleanerId
//             }
//             renderItem={
//               renderCandidate
//             }
//             scrollEnabled={false}
//             contentContainerStyle={
//               styles.list
//             }
//             showsVerticalScrollIndicator={
//               false
//             }
//             ListHeaderComponent={
//               <View
//                 style={
//                   styles.availableHeader
//                 }
//               >
//                 <View>
//                   <Text
//                     style={
//                       styles.availableTitle
//                     }
//                   >
//                     {tSafe(
//                       'available_cleaners',
//                       'Available cleaners'
//                     )}
//                   </Text>

//                   <Text
//                     style={
//                       styles.availableSubtitle
//                     }
//                   >
//                     {acceptedCandidates.length}{' '}
//                     {acceptedCandidates.length ===
//                     1
//                       ? tSafe(
//                           'cleaner_has_accepted',
//                           'cleaner has accepted the request'
//                         )
//                       : tSafe(
//                           'cleaners_have_accepted',
//                           'cleaners have accepted the request'
//                         )}
//                   </Text>
//                 </View>

//                 {pendingCandidates.length >
//                 0 ? (
//                   <View
//                     style={
//                       styles.waitingBadge
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="clock-outline"
//                       size={14}
//                       color="#9A6700"
//                     />

//                     <Text
//                       style={
//                         styles.waitingBadgeText
//                       }
//                     >
//                       {pendingCandidates.length}{' '}
//                       {tSafe(
//                         'waiting',
//                         'waiting'
//                       )}
//                     </Text>
//                   </View>
//                 ) : null}
//               </View>
//             }
//           />
//         )}
//       </ScrollView>

//       <View
//         style={styles.checkoutArea}
//       >
//         {!groupCompositionComplete &&
//         selectedIds.length ===
//           requiredCleaners &&
//         missingGroups.length > 0 ? (
//           <Text
//             style={
//               styles.checkoutWarning
//             }
//           >
//             {`${tSafe(
//               'still_needed',
//               'Still needed'
//             )}: ${missingGroups
//               .map(
//                 (item) =>
//                   `${groupLabel(
//                     item.group
//                   )} (${item.remaining})`
//               )
//               .join(', ')}`}
//           </Text>
//         ) : null}

//         <TouchableOpacity
//           style={[
//             styles.checkoutButton,
//             (!groupCompositionComplete ||
//               selectedIds.length !==
//                 requiredCleaners) &&
//               styles.checkoutButtonDisabled,
//           ]}
//           onPress={
//             proceedToCheckout
//           }
//           disabled={
//             !groupCompositionComplete ||
//             selectedIds.length !==
//               requiredCleaners
//           }
//           activeOpacity={0.85}
//         >
//           <Text
//             style={
//               styles.checkoutButtonText
//             }
//           >
//             {groupCompositionComplete &&
//             selectedIds.length ===
//               requiredCleaners
//               ? tSafe(
//                   'continue_to_payment',
//                   'Continue to Payment'
//                 )
//               : tSafe(
//                   'complete_team_selection',
//                   'Complete team selection to continue'
//                 )}
//           </Text>

//           {groupCompositionComplete &&
//           selectedIds.length ===
//             requiredCleaners ? (
//             <MaterialCommunityIcons
//               name="arrow-right"
//               size={19}
//               color={
//                 COLORS.white
//               }
//               style={
//                 styles.checkoutArrow
//               }
//             />
//           ) : null}
//         </TouchableOpacity>
//       </View>

//       {renderProfileModal()}
//     </View>
//   );
// }

// /*
//  * ============================================================
//  * STYLES
//  * ============================================================
//  */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F6F7F9',
//   },

//   pageContent: {
//     paddingBottom: 130,
//   },

//   /*
//    * HEADER
//    */

//   header: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 22,
//     paddingBottom: 15,
//   },

//   headerText: {
//     flex: 1,
//     paddingRight: 14,
//   },

//   eyebrow: {
//     fontSize: 12,
//     letterSpacing: 0.7,
//     textTransform: 'uppercase',
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginBottom: 5,
//   },

//   title: {
//     fontSize: 23,
//     lineHeight: 29,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   subtitle: {
//     marginTop: 6,
//     fontSize: 13,
//     lineHeight: 19,
//     color: COLORS.textSecondary,
//     maxWidth: 280,
//   },

//   selectionCounter: {
//     minWidth: 66,
//     paddingHorizontal: 9,
//     paddingVertical: 10,
//     borderRadius: 15,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E4E6EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   selectionCounterValue: {
//     fontSize: 19,
//     lineHeight: 21,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   selectionCounterDivider: {
//     position: 'absolute',
//     top: 17,
//     left: 30,
//     fontSize: 12,
//     color: '#A1A5AC',
//   },

//   selectionCounterTotal: {
//     position: 'absolute',
//     top: 17,
//     right: 12,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   selectionCounterLabel: {
//     marginTop: 3,
//     fontSize: 9,
//     color: COLORS.textSecondary,
//     textTransform: 'uppercase',
//     letterSpacing: 0.4,
//   },

//   /*
//    * PROPERTY
//    */

//   propertyContext: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 16,
//     marginBottom: 12,
//     padding: 13,
//     borderRadius: 17,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },

//   propertyIconContainer: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '12',
//     marginRight: 11,
//   },

//   propertyInfo: {
//     flex: 1,
//   },

//   propertyEyebrow: {
//     fontSize: 10,
//     color: COLORS.textSecondary,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 2,
//   },

//   propertyName: {
//     fontSize: 15,
//     color: COLORS.textPrimary,
//     fontWeight: '600',
//   },

//   propertyLocationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   propertyLocation: {
//     flex: 1,
//     marginLeft: 4,
//     fontSize: 12,
//     lineHeight: 17,
//     color: COLORS.textSecondary,
//   },

//   /*
//    * GROUP REQUIREMENTS
//    */

//   groupRequirements: {
//     marginHorizontal: 16,
//     marginBottom: 14,
//     padding: 14,
//     borderRadius: 17,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },

//   groupRequirementsHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//   },

//   groupRequirementsTitleBlock: {
//     flex: 1,
//     paddingRight: 10,
//   },

//   groupRequirementsTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   groupRequirementsSubtitle: {
//     marginTop: 3,
//     fontSize: 11,
//     lineHeight: 16,
//     color: COLORS.textSecondary,
//   },

//   completionBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     borderRadius: 9,
//   },

//   completionBadgeComplete: {
//     backgroundColor: '#EAF7EF',
//   },

//   completionBadgeIncomplete: {
//     backgroundColor: '#FFF7E6',
//   },

//   completionBadgeText: {
//     marginLeft: 4,
//     fontSize: 10,
//     fontWeight: '600',
//   },

//   completionBadgeTextComplete: {
//     color: '#16803C',
//   },

//   completionBadgeTextIncomplete: {
//     color: '#9A6700',
//   },

//   groupRequirementsList: {
//     marginTop: 10,
//   },

//   groupRequirementRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F1F3',
//   },

//   groupRequirementLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   groupRequirementName: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },

//   groupRequirementCount: {
//     fontSize: 12,
//     color: '#9A6700',
//     fontWeight: '600',
//   },

//   groupRequirementCountComplete: {
//     color: '#16803C',
//   },

//   /*
//    * AVAILABLE HEADER
//    */

//   list: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//   },

//   availableHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 11,
//     paddingHorizontal: 2,
//   },

//   availableTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   availableSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   waitingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 9,
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: '#FFF7E6',
//   },

//   waitingBadgeText: {
//     marginLeft: 4,
//     fontSize: 10,
//     color: '#9A6700',
//     fontWeight: '600',
//   },

//   /*
//    * CLEANER CARD
//    */

//   cleanerCard: {
//     marginBottom: 11,
//     padding: 13,
//     borderRadius: 18,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E4E6EB',
//   },

//   cleanerCardSelected: {
//     borderColor: COLORS.primary,
//     backgroundColor:
//       COLORS.primary + '05',
//   },

//   cleanerCardMain: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },

//   /*
//    * AVATAR
//    */

//   avatarWrapper: {
//     position: 'relative',
//     width: 58,
//     height: 58,
//     marginRight: 0,
//   },

//   avatarFallback: {
//     width: 58,
//     height: 58,
//     borderRadius: 29,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   /*
//    * PREMIUM / VERIFIED BADGES
//    */

//   premiumBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#B8860B',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   verifiedBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#4B7BEC',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   avatarCheck: {
//     position: 'absolute',
//     right: -2,
//     bottom: -2,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#16803C',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   trustBadgeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//     minHeight: 20,
//   },

//   premiumLabel: {
//     marginLeft: 5,
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#8A6500',
//   },

//   verifiedLabel: {
//     marginLeft: 5,
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#4778C7',
//   },

//   /*
//    * CLEANER INFO
//    */

//   cleanerMainInfo: {
//     flex: 1,
//     marginLeft: 12,
//     paddingRight: 4,
//   },

//   cleanerNameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   cleanerName: {
//     flex: 1,
//     marginRight: 7,
//     fontSize: 16,
//     lineHeight: 20,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   ratingPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 7,
//     paddingVertical: 4,
//     borderRadius: 8,
//     backgroundColor: '#FFF8E7',
//   },

//   ratingPillText: {
//     marginLeft: 3,
//     fontSize: 11,
//     color: '#765900',
//     fontWeight: '500',
//   },

//   distanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   distanceText: {
//     marginLeft: 3,
//     fontSize: 11,
//     color: COLORS.textSecondary,
//   },

//   cardMetaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },

//   groupPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     borderRadius: 8,
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   groupPillWarning: {
//     backgroundColor: '#FFF7E6',
//   },

//   groupPillText: {
//     marginLeft: 4,
//     fontSize: 10,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   groupPillWarningText: {
//     color: '#9A6700',
//   },

//   performancePill: {
//     marginLeft: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     borderRadius: 8,
//     backgroundColor: '#F3F4F6',
//   },

//   performancePillText: {
//     fontSize: 10,
//     color: COLORS.textSecondary,
//     fontWeight: '500',
//   },

//   recommendationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },

//   recommendationIcon: {
//     width: 22,
//     height: 22,
//     borderRadius: 7,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   recommendationText: {
//     marginLeft: 6,
//     fontSize: 11,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 7,
//   },

//   acceptedText: {
//     marginLeft: 5,
//     fontSize: 11,
//     color: '#16803C',
//     fontWeight: '500',
//   },

//   groupNotice: {
//     marginTop: 5,
//     fontSize: 10,
//     lineHeight: 14,
//     color: '#9A6700',
//   },

//   cardChevron: {
//     width: 25,
//     alignItems: 'flex-end',
//     paddingTop: 2,
//   },

//   selectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 12,
//     height: 40,
//     borderRadius: 11,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.white,
//   },

//   selectButtonSelected: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },

//   selectButtonDisabled: {
//     borderColor: '#D5D7DB',
//     backgroundColor: '#F4F5F6',
//   },

//   selectButtonText: {
//     marginLeft: 5,
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },

//   selectButtonTextSelected: {
//     color: COLORS.white,
//   },

//   selectButtonTextDisabled: {
//     color: '#A5A5A5',
//   },

//   /*
//    * CHECKOUT
//    */

//   checkoutArea: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 18,
//     backgroundColor:
//       'rgba(246,247,249,0.97)',
//     borderTopWidth: 1,
//     borderTopColor: '#E4E6EB',
//   },

//   checkoutWarning: {
//     marginBottom: 8,
//     fontSize: 11,
//     lineHeight: 16,
//     color: '#9A6700',
//     textAlign: 'center',
//   },

//   checkoutButton: {
//     minHeight: 52,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     backgroundColor: COLORS.primary,
//   },

//   checkoutButtonDisabled: {
//     opacity: 0.48,
//   },

//   checkoutButtonText: {
//     color: COLORS.white,
//     fontSize: 15,
//     fontWeight: '600',
//     textAlign: 'center',
//   },

//   checkoutArrow: {
//     marginLeft: 8,
//   },

//   /*
//    * EMPTY / LOADING / ERROR
//    */

//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 28,
//     backgroundColor: '#F6F7F9',
//   },

//   loadingIconContainer: {
//     width: 68,
//     height: 68,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   loadingTitle: {
//     marginTop: 16,
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//   },

//   loadingSubtitle: {
//     marginTop: 6,
//     maxWidth: 290,
//     fontSize: 12,
//     lineHeight: 18,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   errorIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FDECEE',
//     marginBottom: 15,
//   },

//   errorTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: 7,
//   },

//   errorText: {
//     maxWidth: 310,
//     color: COLORS.textSecondary,
//     fontSize: 13,
//     lineHeight: 19,
//     textAlign: 'center',
//     marginBottom: 18,
//   },

//   retryButton: {
//     minWidth: 110,
//     paddingHorizontal: 20,
//     paddingVertical: 11,
//     borderRadius: 10,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//   },

//   retryText: {
//     color: COLORS.white,
//     fontSize: 13,
//     fontWeight: '600',
//   },

//   selectionEmptyContainer: {
//     minHeight: 360,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//     paddingVertical: 40,
//   },

//   selectionEmptyIcon: {
//     width: 66,
//     height: 66,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '10',
//     marginBottom: 16,
//   },

//   selectionEmptyTitle: {
//     fontSize: 17,
//     lineHeight: 22,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: 7,
//   },

//   selectionEmptyText: {
//     maxWidth: 310,
//     fontSize: 13,
//     lineHeight: 19,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   pendingSummary: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 18,
//     paddingHorizontal: 13,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: '#FFF7E6',
//   },

//   pendingSummaryText: {
//     marginLeft: 6,
//     fontSize: 11,
//     color: '#9A6700',
//     fontWeight: '500',
//   },

//   /*
//    * PROFILE MODAL
//    */

//   profileModal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },

//   profileContainer: {
//     height: '92%',
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     overflow: 'hidden',
//   },

//   modalHandle: {
//     alignSelf: 'center',
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#D1D3D6',
//     marginTop: 8,
//     marginBottom: 7,
//   },

//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     paddingHorizontal: 18,
//     paddingVertical: 11,
//   },

//   profileIdentity: {
//     flexDirection: 'row',
//     flex: 1,
//   },

//   profileAvatarWrapper: {
//     position: 'relative',
//     width: 70,
//     height: 70,
//   },

//   profilePremiumBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#B8860B',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   profileVerifiedBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#4B7BEC',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   profileTrustRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   profilePremiumText: {
//     marginLeft: 4,
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#8A6500',
//   },

//   profileVerifiedText: {
//     marginLeft: 4,
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#4778C7',
//   },

//   profileNameContainer: {
//     flex: 1,
//     marginLeft: 13,
//     paddingRight: 5,
//   },

//   profileName: {
//     fontSize: 20,
//     lineHeight: 25,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   profileLocation: {
//     marginTop: 2,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   profileDistanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   profileDistance: {
//     marginLeft: 3,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   profileGroupBadge: {
//     alignSelf: 'flex-start',
//     marginTop: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 7,
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   profileGroupBadgeText: {
//     fontSize: 10,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   profileRatingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   ratingText: {
//     marginLeft: 5,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   closeButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F2F3F5',
//   },

//   profileStatus: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 18,
//     marginBottom: 8,
//     paddingHorizontal: 11,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: '#F7F8F9',
//   },

//   profileStatusText: {
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500',
//   },

//   acceptedStatus: {
//     color: '#16803C',
//   },

//   pendingStatus: {
//     color: '#9A6700',
//   },

//   profileTabs: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ECEDEF',
//   },

//   profileTab: {
//     flex: 1,
//     paddingVertical: 13,
//     alignItems: 'center',
//   },

//   profileTabActive: {
//     borderBottomWidth: 2,
//     borderBottomColor: COLORS.primary,
//   },

//   profileTabText: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   profileTabTextActive: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },

//   profileScroll: {
//     flex: 1,
//   },

//   profileScrollContent: {
//     paddingHorizontal: 18,
//     paddingVertical: 15,
//     paddingBottom: 35,
//   },

//   profileLoading: {
//     alignItems: 'center',
//     paddingVertical: 55,
//   },

//   profileLoadingText: {
//     marginTop: 12,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   sectionTitle: {
//     marginTop: 10,
//     marginBottom: 11,
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   performanceGrid: {
//     flexDirection: 'row',
//   },

//   performanceItem: {
//     flex: 1,
//     marginRight: 8,
//     paddingVertical: 13,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//     backgroundColor: '#F6F7F9',
//     alignItems: 'center',
//   },

//   performanceValue: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   performanceLabel: {
//     marginTop: 4,
//     fontSize: 10,
//     lineHeight: 14,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   profileFooter: {
//     paddingHorizontal: 18,
//     paddingTop: 11,
//     paddingBottom: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#ECEDEF',
//     backgroundColor: COLORS.white,
//   },

//   profileSelectButton: {
//     minHeight: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 15,
//     borderRadius: 13,
//     backgroundColor: COLORS.primary,
//   },

//   profileSelectButtonDisabled: {
//     opacity: 0.42,
//   },

//   profileSelectButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });




import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import moment from 'moment';

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';
import ROUTES from '../../constants/routes';

import { Avatar } from 'react-native-paper';
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating-widget';

import AboutMeDisplay from '../cleaner/AboutMeDisplay';
import HostAvailabilityDisplay from '../../components/host/HostAvailabilityDisplay';
import HostCertificationDisplay from '../../components/host/HostCertificationDisplay';
import Reviews from '../../components/shared/Reviews';

export default function HostCleanerRecommendations({
  navigation,
}) {
  /*
   * ============================================================
   * TRUST / BADGE HELPERS
   * ============================================================
   */

  const getCleanerTrustTier = useCallback(
    (cleaner) => {
      if (!cleaner) {
        return null;
      }

      if (cleaner?.trustTier) {
        return String(
          cleaner.trustTier
        ).toLowerCase();
      }

      if (
        cleaner?.verification?.trustTier
      ) {
        return String(
          cleaner.verification.trustTier
        ).toLowerCase();
      }

      if (
        cleaner?.profile?.trustTier
      ) {
        return String(
          cleaner.profile.trustTier
        ).toLowerCase();
      }

      return null;
    },
    []
  );

  const isPremiumCleaner = useCallback(
    (cleaner) => {
      const tier =
        getCleanerTrustTier(cleaner);

      return (
        tier === 'premium' ||
        tier === 'premium_cleaner'
      );
    },
    [getCleanerTrustTier]
  );

  const isVerifiedCleaner = useCallback(
    (cleaner) => {
      if (
        typeof cleaner?.trust?.isVerified ===
        'boolean'
      ) {
        return cleaner.trust.isVerified;
      }

      const tier =
        getCleanerTrustTier(cleaner);

      if (
        tier === 'verified' ||
        tier === 'trusted' ||
        tier === 'premium' ||
        tier === 'premium_cleaner'
      ) {
        return true;
      }

      const verification =
        cleaner?.verification;

      return Boolean(
        verification?.identityVerified &&
          verification?.phoneVerified &&
          verification?.emailVerified
      );
    },
    [getCleanerTrustTier]
  );

  const route = useRoute();

  const {
    scheduleId,
    schedule: routeSchedule,
  } = route?.params || {};

  const [candidates, setCandidates] =
    useState([]);

  const [requiredCleaners, setRequiredCleaners] =
    useState(0);

  const [assignedTo, setAssignedTo] =
    useState([]);

  const [scheduleDetails, setScheduleDetails] =
    useState({});

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [acceptedCleanerIds, setAcceptedCleanerIds] =
    useState(new Set());

  const [profileCleaner, setProfileCleaner] =
    useState(null);

  const [profileVisible, setProfileVisible] =
    useState(false);

  const [profileTab, setProfileTab] =
    useState('about');

  const [profileAvailability, setProfileAvailability] =
    useState(null);

  const [profileReviews, setProfileReviews] =
    useState([]);

  const [profileLoading, setProfileLoading] =
    useState(false);

  /*
   * ============================================================
   * STICKY HEADERS STATE
   * ============================================================
   *
   * We track the Y offset of both the property card and the
   * team requirements block. Once the user scrolls past each
   * one, a fixed copy of that block is rendered in an
   * absolutely-positioned overlay at the top of the screen.
   *
   * Because team requirements sits below the property card,
   * when the team requirements block sticks, the property
   * card will also be sticky — producing a stacked header.
   *
   * The sticky version of the property card omits the
   * "PROPERTY" eyebrow label; the in-flow original keeps it.
   */

  const [stickyProperty, setStickyProperty] =
    useState(false);

  const [stickyGroupReqs, setStickyGroupReqs] =
    useState(false);

  const propertyYRef = useRef(null);
  const groupReqsYRef = useRef(null);

  const handlePropertyLayout = useCallback(
    (event) => {
      propertyYRef.current =
        event.nativeEvent.layout.y;
    },
    []
  );

  const handleGroupReqsLayout = useCallback(
    (event) => {
      groupReqsYRef.current =
        event.nativeEvent.layout.y;
    },
    []
  );

  const handlePageScroll = useCallback(
    (event) => {
      const y =
        event.nativeEvent.contentOffset.y;

      if (propertyYRef.current != null) {
        const shouldShowProperty =
          y >= propertyYRef.current;

        setStickyProperty((prev) =>
          prev === shouldShowProperty
            ? prev
            : shouldShowProperty
        );
      }

      if (groupReqsYRef.current != null) {
        const shouldShowGroupReqs =
          y >= groupReqsYRef.current;

        setStickyGroupReqs((prev) =>
          prev === shouldShowGroupReqs
            ? prev
            : shouldShowGroupReqs
        );
      }
    },
    []
  );

  /*
   * ============================================================
   * GROUP HELPERS
   * ============================================================
   */

  const getCleanerGroup = useCallback(
    (cleaner) => {
      if (!cleaner) {
        return null;
      }

      return (
        cleaner.group ||
        cleaner.requestGroup ||
        cleaner.assignedGroup ||
        cleaner.request?.group ||
        null
      );
    },
    []
  );

  const groupLabel = useCallback(
    (group) => {
      if (!group) {
        return tSafe(
          'unknown_group',
          'Unknown group'
        );
      }

      const normalizedGroup = group
        .replace(/^group[_-]?/i, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );

      return `${tSafe(
        'group',
        'Group'
      )} ${normalizedGroup}`;
    },
    []
  );

  /*
   * ============================================================
   * REQUIRED GROUP COUNTS
   * ============================================================
   */

  const requiredGroupCounts = useMemo(() => {
    return assignedTo.reduce(
      (counts, position) => {
        const group =
          position?.group;

        if (!group) {
          return counts;
        }

        counts[group] =
          (counts[group] || 0) + 1;

        return counts;
      },
      {}
    );
  }, [assignedTo]);

  const requiredGroups = useMemo(
    () =>
      Object.keys(
        requiredGroupCounts
      ),
    [requiredGroupCounts]
  );

  /*
   * ============================================================
   * SELECTED GROUP COUNTS
   * ============================================================
   */

  const selectedGroupCounts = useMemo(() => {
    return selectedIds.reduce(
      (counts, cleanerId) => {
        const cleaner =
          candidates.find(
            (candidate) =>
              candidate.cleanerId ===
              cleanerId
          );

        const group =
          getCleanerGroup(cleaner);

        if (!group) {
          return counts;
        }

        counts[group] =
          (counts[group] || 0) + 1;

        return counts;
      },
      {}
    );
  }, [
    selectedIds,
    candidates,
    getCleanerGroup,
  ]);

  /*
   * ============================================================
   * MISSING GROUPS
   * ============================================================
   */

  const missingGroups = useMemo(() => {
    return requiredGroups
      .map((group) => {
        const required =
          requiredGroupCounts[group] ||
          0;

        const selected =
          selectedGroupCounts[group] ||
          0;

        return {
          group,
          required,
          selected,
          remaining: Math.max(
            0,
            required - selected
          ),
        };
      })
      .filter(
        (item) =>
          item.remaining > 0
      );
  }, [
    requiredGroups,
    requiredGroupCounts,
    selectedGroupCounts,
  ]);

  /*
   * ============================================================
   * GROUP COMPOSITION
   * ============================================================
   */

  const groupCompositionComplete =
    useMemo(() => {
      if (!requiredGroups.length) {
        return false;
      }

      return requiredGroups.every(
        (group) =>
          (selectedGroupCounts[group] ||
            0) ===
          (requiredGroupCounts[group] ||
            0)
      );
    }, [
      requiredGroups,
      requiredGroupCounts,
      selectedGroupCounts,
    ]);

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   *
   * IMPORTANT:
   *
   * The cleaner candidate endpoint is refreshed AFTER
   * sendHostGroupCleanerRequests().
   *
   * This is necessary because the candidate endpoint
   * provides requestStatus. Loading candidates before
   * sending requests leaves requestStatus as "not_contacted"
   * and causes the UI to incorrectly show:
   *
   * "No cleaners are currently available"
   *
   * instead of:
   *
   * "Waiting for cleaners to respond"
   */

  const fetchData = useCallback(
    async () => {
      if (!scheduleId) {
        setError(
          tSafe(
            'missing_schedule_id',
            'Missing schedule ID.'
          )
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        /*
         * ------------------------------------------------------
         * STEP 1
         * Get the existing request state first.
         * ------------------------------------------------------
         */

        const requestResponse =
          await userService.getHostCleaningRequestByScheduleId(
            scheduleId,
            moment().format(
              'YYYY-MM-DD HH:mm:ss'
            )
          );

        const requestData =
          requestResponse?.data || [];

        /*
         * Resolve required team.
         */

        const requestAssignedTo =
          requestData?.[0]?.schedule
            ?.assignedTo || [];

        const routeAssignedTo =
          routeSchedule?.assignedTo || [];

        const initialAssignedTo =
          requestAssignedTo.length > 0
            ? requestAssignedTo
            : routeAssignedTo;

        /*
         * ------------------------------------------------------
         * STEP 2
         * Create/send host-selection requests.
         *
         * This MUST happen before the candidate list is
         * considered authoritative for requestStatus.
         * ------------------------------------------------------
         */

        try {
          await userService.sendHostGroupCleanerRequests(
            scheduleId
          );
        } catch (requestErr) {
          console.warn(
            '⚠️ Host group cleaner request skipped:',
            requestErr?.response?.data
              ?.detail ||
              requestErr?.message
          );
        }

        /*
         * ------------------------------------------------------
         * STEP 3
         * Refresh BOTH request state and candidates.
         *
         * This is the critical fix.
         * ------------------------------------------------------
         */

        const [
          refreshedCandidateResponse,
          refreshedRequestResponse,
        ] = await Promise.all([
          userService.getHostCleanerCandidates(
            scheduleId
          ),
          userService.getHostCleaningRequestByScheduleId(
            scheduleId,
            moment().format(
              'YYYY-MM-DD HH:mm:ss'
            )
          ),
        ]);

        const candidateData =
          refreshedCandidateResponse?.data ||
          {};

        const refreshedRequestData =
          refreshedRequestResponse?.data ||
          [];

        /*
         * ------------------------------------------------------
         * Resolve latest assignedTo.
         * ------------------------------------------------------
         */

        const refreshedRequestAssignedTo =
          refreshedRequestData?.[0]
            ?.schedule?.assignedTo || [];

        const refreshedAssignedTo =
          refreshedRequestAssignedTo.length >
          0
            ? refreshedRequestAssignedTo
            : initialAssignedTo;

        /*
         * ------------------------------------------------------
         * Determine accepted cleaners.
         * ------------------------------------------------------
         */

        const acceptedIds = new Set(
          refreshedRequestData
            .filter(
              (request) =>
                request?.status ===
                  'accepted' &&
                request?.cleaner?.['_id']
            )
            .map(
              (request) =>
                request.cleaner['_id']
            )
        );

        /*
         * Also accept the candidate endpoint's
         * requestStatus === "accepted".
         */

        const recommendedCandidates =
          Array.isArray(
            candidateData?.candidates
          )
            ? candidateData.candidates
            : [];

        recommendedCandidates.forEach(
          (candidate) => {
            if (
              candidate?.requestStatus ===
              'accepted'
            ) {
              acceptedIds.add(
                candidate.cleanerId
              );
            }
          }
        );

        setAcceptedCleanerIds(
          acceptedIds
        );

        /*
         * ------------------------------------------------------
         * Resolve schedule.
         * ------------------------------------------------------
         */

        const refreshedSchedule =
          refreshedRequestData?.[0]
            ?.schedule ||
          routeSchedule ||
          {};

        setScheduleDetails(
          refreshedSchedule
        );

        /*
         * ------------------------------------------------------
         * Candidate list.
         *
         * IMPORTANT:
         * This is now the POST-request refreshed list.
         * Therefore pending requestStatus values are visible.
         * ------------------------------------------------------
         */

        setCandidates(
          recommendedCandidates
        );

        /*
         * ------------------------------------------------------
         * Required team.
         * ------------------------------------------------------
         */

        setAssignedTo(
          refreshedAssignedTo
        );

        setRequiredCleaners(
          refreshedAssignedTo.length
        );

        /*
         * ------------------------------------------------------
         * Preserve only accepted candidates.
         * ------------------------------------------------------
         */

        setSelectedIds((current) =>
          current.filter(
            (id) =>
              acceptedIds.has(id) &&
              recommendedCandidates.some(
                (candidate) =>
                  candidate.cleanerId ===
                  id
              )
          )
        );
      } catch (err) {
        console.error(
          '❌ Error loading host cleaner recommendations:',
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.message ||
            tSafe(
              'unable_to_load_cleaner_recommendations',
              'Unable to load cleaner recommendations.'
            )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      scheduleId,
      routeSchedule,
    ]
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  /*
   * ============================================================
   * CANDIDATE GROUPS
   * ============================================================
   */

  const acceptedCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) =>
          acceptedCleanerIds.has(
            candidate.cleanerId
          ) ||
          candidate.requestStatus ===
            'accepted'
      ),
    [
      candidates,
      acceptedCleanerIds,
    ]
  );

  const pendingCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) =>
          candidate.requestStatus ===
          'pending_acceptance'
      ),
    [candidates]
  );

  /*
   * ============================================================
   * TOGGLE CLEANER
   * ============================================================
   */

  const toggleCleaner = (
    cleanerId
  ) => {
    const candidate =
      candidates.find(
        (item) =>
          item.cleanerId === cleanerId
      );

    const accepted =
      acceptedCleanerIds.has(
        cleanerId
      ) ||
      candidate?.requestStatus ===
        'accepted';

    if (!accepted) {
      return;
    }

    const cleanerGroup =
      getCleanerGroup(candidate);

    if (!cleanerGroup) {
      console.warn(
        `Cleaner ${cleanerId} has no request group. Selection blocked until the group is known.`
      );

      return;
    }

    setSelectedIds((current) => {
      /*
       * Remove.
       */

      if (
        current.includes(cleanerId)
      ) {
        return current.filter(
          (id) => id !== cleanerId
        );
      }

      /*
       * Team already full.
       */

      if (
        current.length >=
        requiredCleaners
      ) {
        return current;
      }

      /*
       * Group capacity.
       */

      const requiredForGroup =
        requiredGroupCounts[
          cleanerGroup
        ] || 0;

      const alreadySelectedForGroup =
        current.reduce(
          (count, selectedId) => {
            const selectedCleaner =
              candidates.find(
                (item) =>
                  item.cleanerId ===
                  selectedId
              );

            return (
              count +
              (getCleanerGroup(
                selectedCleaner
              ) === cleanerGroup
                ? 1
                : 0)
            );
          },
          0
        );

      if (
        alreadySelectedForGroup >=
        requiredForGroup
      ) {
        return current;
      }

      return [
        ...current,
        cleanerId,
      ];
    });
  };

  /*
   * ============================================================
   * CLEANER PROFILE
   * ============================================================
   */

  const openCleanerProfile =
    async (cleaner) => {
      setProfileCleaner(cleaner);
      setProfileTab('about');
      setProfileVisible(true);
      setProfileAvailability(null);
      setProfileReviews([]);
      setProfileLoading(true);

      try {
        const [
          availabilityResponse,
          reviewsResponse,
        ] = await Promise.all([
          userService.getCleanerAvailability(
            cleaner.cleanerId
          ),
          userService.getCleanerFeedbacks(
            cleaner.cleanerId
          ),
        ]);

        setProfileAvailability(
          availabilityResponse?.data
            ?.data ||
            availabilityResponse?.data ||
            null
        );

        setProfileReviews(
          reviewsResponse?.data?.data ||
            reviewsResponse?.data ||
            []
        );
      } catch (err) {
        console.warn(
          '⚠️ Unable to load cleaner profile details:',
          err?.response?.data?.detail ||
            err?.message
        );
      } finally {
        setProfileLoading(false);
      }
    };

  const closeCleanerProfile = () => {
    setProfileVisible(false);
    setProfileCleaner(null);
  };

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */

  const proceedToCheckout = () => {
    if (
      selectedIds.length !==
        requiredCleaners ||
      !assignedTo.length ||
      !groupCompositionComplete
    ) {
      return;
    }

    const openPositions =
      assignedTo.filter(
        (position) =>
          !position?.cleanerId
      );

    if (
      openPositions.length !==
      selectedIds.length
    ) {
      return;
    }

    const selectedCleaners =
      selectedIds
        .map((id) =>
          candidates.find(
            (candidate) =>
              candidate.cleanerId ===
              id
          )
        )
        .filter(Boolean);

    /*
     * Match selected cleaners to open
     * positions by group.
     */

    const availablePositionsByGroup =
      openPositions.reduce(
        (groups, position) => {
          const group =
            position?.group;

          if (!group) {
            return groups;
          }

          if (!groups[group]) {
            groups[group] = [];
          }

          groups[group].push(
            position
          );

          return groups;
        },
        {}
      );

    const cleanersWithFee = [];

    for (const cleaner of selectedCleaners) {
      const cleanerGroup =
        getCleanerGroup(cleaner);

      if (!cleanerGroup) {
        console.error(
          '❌ Cannot continue: selected cleaner has no group.',
          cleaner
        );

        return;
      }

      const matchingPositions =
        availablePositionsByGroup[
          cleanerGroup
        ] || [];

      const position =
        matchingPositions.shift();

      if (!position) {
        console.error(
          `❌ Cannot continue: no available ${cleanerGroup} position for cleaner ${cleaner.cleanerId}.`
        );

        return;
      }

      const calculatedPrice =
        Number(
          position?.checklist
            ?.calculatedPrice ??
            position?.checklist
              ?.price ??
            0
        );

      cleanersWithFee.push({
        cleanerId:
          cleaner.cleanerId,

        firstname:
          cleaner.firstname || '',

        lastname:
          cleaner.lastname || '',

        avatar:
          cleaner.avatar || '',

        group: cleanerGroup,

        fee: calculatedPrice,

        price: Number(
          position?.checklist
            ?.price ?? 0
        ),

        calculatedPrice,
      });
    }

    /*
     * Validate final group composition.
     */

    const checkoutGroupCounts =
      cleanersWithFee.reduce(
        (counts, cleaner) => {
          counts[cleaner.group] =
            (counts[cleaner.group] ||
              0) + 1;

          return counts;
        },
        {}
      );

    const checkoutCompositionValid =
      requiredGroups.every(
        (group) =>
          checkoutGroupCounts[
            group
          ] ===
          requiredGroupCounts[group]
      );

    if (
      !checkoutCompositionValid
    ) {
      console.error(
        '❌ Group composition validation failed before checkout.',
        {
          requiredGroupCounts,
          checkoutGroupCounts,
        }
      );

      return;
    }

    /*
     * Calculate actual cleaning subtotal.
     */

    const totalFee =
      cleanersWithFee.reduce(
        (sum, cleaner) =>
          sum +
          Number(
            cleaner.fee || 0
          ),
        0
      );

    console.log(
      '💰 HOST CHECKOUT CLEANERS:',
      cleanersWithFee
    );

    console.log(
      '💰 HOST CHECKOUT TOTAL:',
      totalFee
    );
    
    // console.log(
    //   '🧪 SCHEDULE BEING SENT TO CHECKOUT:',
    //   JSON.stringify(
    //     scheduleDetails,
    //     null,
    //     2
    //   )
    // );
    navigation?.navigate(
      ROUTES.host_group_checkout,
      {
        requestId: null,
        cleaning_fee: totalFee,
        scheduleId,
        schedule: {
          ...scheduleDetails,
          assignedTo,
        },
        selected_cleaners:
          selectedCleaners.map(
            (cleaner) => ({
              _id:
                cleaner.cleanerId,

              cleanerId:
                cleaner.cleanerId,

              firstname:
                cleaner.firstname ||
                '',

              lastname:
                cleaner.lastname ||
                '',

              avatar:
                cleaner.avatar || '',

              group:
                getCleanerGroup(
                  cleaner
                ),
            })
          ),

        cleanerIds: selectedIds,

        cleanersWithFee,

        hostSelectionFlow: true,
      }
    );
  };

  /*
   * ============================================================
   * CLEANER CARD
   * ============================================================
   */

  const renderCandidate = ({
    item,
  }) => {
    const selected =
      selectedIds.includes(
        item.cleanerId
      );

    const performance =
      item.performance || {};

    const hasRating =
      typeof item.averageRating ===
      'number';

    const rating = hasRating
      ? item.averageRating.toFixed(
          1
        )
      : null;

    const cleanerGroup =
      getCleanerGroup(item);

    const requiredForGroup =
      cleanerGroup
        ? requiredGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const selectedForGroup =
      cleanerGroup
        ? selectedGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const groupFull =
      cleanerGroup &&
      selectedForGroup >=
        requiredForGroup;

    const cannotSelect =
      !selected &&
      (selectedIds.length >=
        requiredCleaners ||
        !cleanerGroup ||
        groupFull);

    const premium =
      isPremiumCleaner(item);

    const verified =
      isVerifiedCleaner(item);

    return (
      <View
        style={[
          styles.cleanerCard,
          selected &&
            styles.cleanerCardSelected,
        ]}
      >
        <TouchableOpacity
          style={styles.cleanerCardMain}
          onPress={() =>
            openCleanerProfile(item)
          }
          activeOpacity={0.88}
        >
          <View
            style={styles.avatarWrapper}
          >
            {item.avatar ? (
              <Avatar.Image
                size={58}
                source={{
                  uri: item.avatar,
                }}
              />
            ) : (
              <View
                style={
                  styles.avatarFallback
                }
              >
                <MaterialCommunityIcons
                  name="account"
                  size={27}
                  color={
                    COLORS.white
                  }
                />
              </View>
            )}

            {premium ? (
              <View
                style={
                  styles.premiumBadge
                }
              >
                <MaterialCommunityIcons
                  name="shield-star"
                  size={14}
                  color={
                    COLORS.white
                  }
                />
              </View>
            ) : verified ? (
              <View
                style={
                  styles.verifiedBadge
                }
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color={
                    COLORS.white
                  }
                />
              </View>
            ) : null}

            {selected ? (
              <View
                style={
                  styles.avatarCheck
                }
              >
                <MaterialCommunityIcons
                  name="check"
                  size={13}
                  color={
                    COLORS.white
                  }
                />
              </View>
            ) : null}
          </View>

          <View
            style={styles.cleanerMainInfo}
          >
            <View
              style={
                styles.cleanerNameRow
              }
            >
              <Text
                style={styles.cleanerName}
                numberOfLines={1}
              >
                {`${item.firstname || ''} ${
                  item.lastname || ''
                }`.trim()}
              </Text>

              <View
                style={
                  styles.ratingPill
                }
              >
                <MaterialCommunityIcons
                  name="star"
                  size={13}
                  color="#C28A00"
                />

                <Text
                  style={
                    styles.ratingPillText
                  }
                >
                  {rating ||
                    tSafe(
                      'new',
                      'New'
                    )}
                </Text>
              </View>
            </View>

            {premium ? (
              <View
                style={styles.trustBadgeRow}
              >
                <MaterialCommunityIcons
                  name="shield-star"
                  size={14}
                  color="#A87900"
                />

                <Text
                  style={styles.premiumLabel}
                >
                  {tSafe(
                    'premium_cleaner',
                    'Premium Cleaner'
                  )}
                </Text>
              </View>
            ) : verified ? (
              <View
                style={styles.trustBadgeRow}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color="#4778C7"
                />

                <Text
                  style={styles.verifiedLabel}
                >
                  {tSafe(
                    'verified_cleaner',
                    'Verified Cleaner'
                  )}
                </Text>
              </View>
            ) : null}

            <View
              style={
                styles.distanceRow
              }
            >
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={
                  COLORS.textSecondary
                }
              />

              <Text
                style={
                  styles.distanceText
                }
              >
                {item.distance ??
                  '—'}{' '}
                {tSafe(
                  'miles_away',
                  'miles away'
                )}
              </Text>
            </View>

            <View
              style={
                styles.cardMetaRow
              }
            >
              {cleanerGroup ? (
                <View
                  style={
                    styles.groupPill
                  }
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={13}
                    color={
                      COLORS.primary
                    }
                  />

                  <Text
                    style={
                      styles.groupPillText
                    }
                  >
                    {groupLabel(
                      cleanerGroup
                    )}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.groupPill,
                    styles.groupPillWarning,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={13}
                    color="#9A6700"
                  />

                  <Text
                    style={[
                      styles.groupPillText,
                      styles.groupPillWarningText,
                    ]}
                  >
                    {tSafe(
                      'group_pending',
                      'Group pending'
                    )}
                  </Text>
                </View>
              )}

              <View
                style={styles.performancePill}
              >
                <Text
                  style={
                    styles.performancePillText
                  }
                >
                  {tSafe(
                    'performance',
                    'Performance'
                  )}{' '}
                  {performance.performance_score ??
                    0}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.recommendationRow
              }
            >
              <View
                style={
                  styles.recommendationIcon
                }
              >
                <MaterialCommunityIcons
                  name="sparkles"
                  size={13}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <Text
                style={
                  styles.recommendationText
                }
              >
                {tSafe(
                  'recommendation_score',
                  'Recommendation score'
                )}{' '}
                {item.host_recommendation_score ??
                  0}
              </Text>
            </View>

            <View
              style={
                styles.acceptedRow
              }
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={15}
                color="#16803C"
              />

              <Text
                style={
                  styles.acceptedText
                }
              >
                {tSafe(
                  'cleaner_accepted_available',
                  'Accepted — available for selection'
                )}
              </Text>
            </View>

            {cleanerGroup &&
            groupFull &&
            !selected ? (
              <Text
                style={
                  styles.groupNotice
                }
              >
                {`${groupLabel(
                  cleanerGroup
                )} ${tSafe(
                  'group_already_filled',
                  'is already filled'
                )}`}
              </Text>
            ) : null}

            {!cleanerGroup ? (
              <Text
                style={
                  styles.groupNotice
                }
              >
                {tSafe(
                  'waiting_for_request_group',
                  'Waiting for request group information'
                )}
              </Text>
            ) : null}
          </View>

          <View
            style={styles.cardChevron}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={
                COLORS.textSecondary
              }
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectButton,
            selected &&
              styles.selectButtonSelected,
            cannotSelect &&
              styles.selectButtonDisabled,
          ]}
          onPress={() =>
            toggleCleaner(
              item.cleanerId
            )
          }
          disabled={cannotSelect}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={
              selected
                ? 'check'
                : 'plus'
            }
            size={20}
            color={
              selected
                ? COLORS.white
                : cannotSelect
                ? '#A5A5A5'
                : COLORS.primary
            }
          />

          <Text
            style={[
              styles.selectButtonText,
              selected &&
                styles.selectButtonTextSelected,
              cannotSelect &&
                styles.selectButtonTextDisabled,
            ]}
          >
            {selected
              ? tSafe(
                  'selected',
                  'Selected'
                )
              : tSafe(
                  'select',
                  'Select'
                )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * ============================================================
   * PROPERTY CARD RENDERER
   * ============================================================
   *
   * sticky = true  → rendered in the fixed overlay
   *                  (no "PROPERTY" eyebrow label)
   *
   * sticky = false → rendered in-flow inside the ScrollView
   *                  with the original label + onLayout
   *                  reporting its Y offset for sticky logic
   */

  const renderPropertyContext = (sticky = false) => (
    <View
      style={[
        styles.propertyContext,
        sticky && styles.propertyContextSticky,
      ]}
      onLayout={
        sticky
          ? undefined
          : handlePropertyLayout
      }
    >
      <View
        style={
          styles.propertyIconContainer
        }
      >
        <MaterialCommunityIcons
          name="home-map-marker"
          size={21}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.propertyInfo}>
        {!sticky ? (
          <Text
            style={
              styles.propertyEyebrow
            }
          >
            {tSafe(
              'property',
              'Property'
            )}
          </Text>
        ) : null}

        <Text
          style={styles.propertyName}
          numberOfLines={1}
        >
          {scheduleDetails
            ?.apartment_name
            ?.trim() ||
            scheduleDetails
              ?.overall_checklist
              ?.apartment_name
              ?.trim() ||
            tSafe(
              'property',
              'Property'
            )}
        </Text>

        {scheduleDetails?.address?.trim() ? (
          <View
            style={
              styles.propertyLocationRow
            }
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={
                COLORS.textSecondary
              }
            />

            <Text
              style={
                styles.propertyLocation
              }
              numberOfLines={1}
            >
              {scheduleDetails.address.trim()}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  /*
   * ============================================================
   * TEAM REQUIREMENTS RENDERER
   * ============================================================
   *
   * Same pattern as the property card. Rendered both in-flow
   * (with onLayout capturing its Y) and as a sticky overlay
   * once scrolled past.
   */

  const renderGroupRequirements = (
    sticky = false
  ) => {
    if (!requiredGroups.length) {
      return null;
    }

    return (
      <View
        style={[
          styles.groupRequirements,
          sticky &&
            styles.groupRequirementsSticky,
        ]}
        onLayout={
          sticky
            ? undefined
            : handleGroupReqsLayout
        }
      >
        <View
          style={
            styles.groupRequirementsHeader
          }
        >
          <View
            style={
              styles.groupRequirementsTitleBlock
            }
          >
            <Text
              style={
                styles.groupRequirementsTitle
              }
            >
              {tSafe(
                'team_requirements',
                'Team requirements'
              )}
            </Text>

            <Text
              style={
                styles.groupRequirementsSubtitle
              }
            >
              {tSafe(
                'group_requirement_description',
                'Each required group needs a cleaner before payment.'
              )}
            </Text>
          </View>

          <View
            style={[
              styles.completionBadge,
              groupCompositionComplete
                ? styles.completionBadgeComplete
                : styles.completionBadgeIncomplete,
            ]}
          >
            <MaterialCommunityIcons
              name={
                groupCompositionComplete
                  ? 'check-circle'
                  : 'alert-circle-outline'
              }
              size={15}
              color={
                groupCompositionComplete
                  ? '#16803C'
                  : '#9A6700'
              }
            />

            <Text
              style={[
                styles.completionBadgeText,
                groupCompositionComplete
                  ? styles.completionBadgeTextComplete
                  : styles.completionBadgeTextIncomplete,
              ]}
            >
              {groupCompositionComplete
                ? tSafe(
                    'complete',
                    'Complete'
                  )
                : tSafe(
                    'incomplete',
                    'Incomplete'
                  )}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.groupRequirementsList
          }
        >
          {requiredGroups.map(
            (group) => {
              const required =
                requiredGroupCounts[
                  group
                ] || 0;

              const selected =
                selectedGroupCounts[
                  group
                ] || 0;

              const complete =
                selected ===
                required;

              return (
                <View
                  key={group}
                  style={
                    styles.groupRequirementRow
                  }
                >
                  <View
                    style={
                      styles.groupRequirementLeft
                    }
                  >
                    <MaterialCommunityIcons
                      name={
                        complete
                          ? 'check-circle'
                          : 'circle-outline'
                      }
                      size={17}
                      color={
                        complete
                          ? '#16803C'
                          : '#9A6700'
                      }
                    />

                    <Text
                      style={
                        styles.groupRequirementName
                      }
                    >
                      {groupLabel(
                        group
                      )}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.groupRequirementCount,
                      complete &&
                        styles.groupRequirementCountComplete,
                    ]}
                  >
                    {selected} /{' '}
                    {required}
                  </Text>
                </View>
              );
            }
          )}
        </View>
      </View>
    );
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <View style={styles.center}>
        <View
          style={
            styles.loadingIconContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>

        <Text
          style={styles.loadingTitle}
        >
          {tSafe(
            'loading_recommendations',
            'Finding recommended cleaners...'
          )}
        </Text>

        <Text
          style={styles.loadingSubtitle}
        >
          {tSafe(
            'loading_recommendations_subtitle',
            'Reviewing availability, performance, ratings, and distance.'
          )}
        </Text>
      </View>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <View style={styles.center}>
        <View
          style={
            styles.errorIconContainer
          }
        >
          <MaterialCommunityIcons
            name="alert-outline"
            size={30}
            color="#B00020"
          />
        </View>

        <Text
          style={styles.errorTitle}
        >
          {tSafe(
            'unable_to_load',
            'Unable to load recommendations'
          )}
        </Text>

        <Text
          style={styles.errorText}
        >
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchData}
          activeOpacity={0.85}
        >
          <Text
            style={styles.retryText}
          >
            {tSafe(
              'retry',
              'Retry'
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * ============================================================
   * PROFILE MODAL
   * ============================================================
   */

  const renderProfileModal = () => {
    if (!profileCleaner) {
      return null;
    }

    const accepted =
      acceptedCleanerIds.has(
        profileCleaner.cleanerId
      ) ||
      profileCleaner.requestStatus ===
        'accepted';

    const selected =
      selectedIds.includes(
        profileCleaner.cleanerId
      );

    const premium =
      isPremiumCleaner(
        profileCleaner
      );

    const verified =
      isVerifiedCleaner(
        profileCleaner
      );

    const rating =
      typeof profileCleaner.averageRating ===
      'number'
        ? profileCleaner.averageRating
        : 0;

    const certification =
      profileCleaner.certification ||
      {};

    const cleanerGroup =
      getCleanerGroup(
        profileCleaner
      );

    const requiredForGroup =
      cleanerGroup
        ? requiredGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const selectedForGroup =
      cleanerGroup
        ? selectedGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const groupFull =
      cleanerGroup &&
      selectedForGroup >=
        requiredForGroup;

    return (
      <Modal
        isVisible={profileVisible}
        onBackdropPress={
          closeCleanerProfile
        }
        propagateSwipe
        style={styles.profileModal}
        backdropOpacity={0.48}
      >
        <View
          style={
            styles.profileContainer
          }
        >
          <View
            style={styles.modalHandle}
          />

          <View
            style={styles.profileHeader}
          >
            <View
              style={styles.profileIdentity}
            >
              <View
                style={
                  styles.profileAvatarWrapper
                }
              >
                {profileCleaner.avatar ? (
                  <Avatar.Image
                    size={70}
                    source={{
                      uri: profileCleaner.avatar,
                    }}
                  />
                ) : (
                  <Avatar.Icon
                    size={70}
                    icon="account"
                    color={
                      COLORS.white
                    }
                  />
                )}

                {premium ? (
                  <View
                    style={
                      styles.profilePremiumBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-star"
                      size={15}
                      color={
                        COLORS.white
                      }
                    />
                  </View>
                ) : verified ? (
                  <View
                    style={
                      styles.profileVerifiedBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={15}
                      color={
                        COLORS.white
                      }
                    />
                  </View>
                ) : null}
              </View>

              <View
                style={
                  styles.profileNameContainer
                }
              >
                <Text
                  style={
                    styles.profileName
                  }
                  numberOfLines={1}
                >
                  {`${profileCleaner.firstname || ''} ${
                    profileCleaner.lastname || ''
                  }`.trim()}
                </Text>

                {premium ? (
                  <View
                    style={
                      styles.profileTrustRow
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-star"
                      size={14}
                      color="#A87900"
                    />

                    <Text
                      style={
                        styles.profilePremiumText
                      }
                    >
                      {tSafe(
                        'premium_cleaner',
                        'Premium Cleaner'
                      )}
                    </Text>
                  </View>
                ) : verified ? (
                  <View
                    style={
                      styles.profileTrustRow
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={14}
                      color="#4778C7"
                    />

                    <Text
                      style={
                        styles.profileVerifiedText
                      }
                    >
                      {tSafe(
                        'verified_cleaner',
                        'Verified Cleaner'
                      )}
                    </Text>
                  </View>
                ) : null}

                {profileCleaner
                  .location?.city ? (
                  <Text
                    style={
                      styles.profileLocation
                    }
                  >
                    {
                      profileCleaner
                        .location
                        .city
                    }
                    {profileCleaner
                      .location
                      .region_code
                      ? `, ${profileCleaner.location.region_code}`
                      : ''}
                  </Text>
                ) : null}

                <View
                  style={
                    styles.profileDistanceRow
                  }
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color={
                      COLORS.textSecondary
                    }
                  />

                  <Text
                    style={
                      styles.profileDistance
                    }
                  >
                    {profileCleaner.distance ??
                      '—'}{' '}
                    {tSafe(
                      'miles_away',
                      'miles away'
                    )}
                  </Text>
                </View>

                {cleanerGroup ? (
                  <View
                    style={
                      styles.profileGroupBadge
                    }
                  >
                    <Text
                      style={
                        styles.profileGroupBadgeText
                      }
                    >
                      {groupLabel(
                        cleanerGroup
                      )}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={
                    styles.profileRatingRow
                  }
                >
                  <StarRating
                    rating={rating}
                    onChange={() => {}}
                    starSize={17}
                    enableHalfStar
                    disabled
                  />

                  <Text
                    style={
                      styles.ratingText
                    }
                  >
                    {rating > 0
                      ? rating.toFixed(
                          1
                        )
                      : tSafe(
                          'new',
                          'New'
                        )}

                    {profileCleaner.totalRatings
                      ? ` (${profileCleaner.totalRatings})`
                      : ''}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={
                closeCleanerProfile
              }
              style={
                styles.closeButton
              }
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name="close"
                size={23}
                color={
                  COLORS.gray
                }
              />
            </TouchableOpacity>
          </View>

          <View
            style={styles.profileStatus}
          >
            <MaterialCommunityIcons
              name={
                accepted
                  ? 'check-circle'
                  : 'clock-outline'
              }
              size={17}
              color={
                accepted
                  ? '#16803C'
                  : '#9A6700'
              }
            />

            <Text
              style={[
                styles.profileStatusText,
                accepted
                  ? styles.acceptedStatus
                  : styles.pendingStatus,
              ]}
            >
              {accepted
                ? tSafe(
                    'cleaner_accepted_request',
                    'Cleaner has accepted the request'
                  )
                : tSafe(
                    'waiting_cleaner_accept',
                    'Waiting for cleaner to accept'
                  )}
            </Text>
          </View>

          <View
            style={styles.profileTabs}
          >
            {[
              [
                'about',
                tSafe(
                  'about',
                  'About'
                ),
              ],
              [
                'availability',
                tSafe(
                  'availability',
                  'Availability'
                ),
              ],
              [
                'reviews',
                tSafe(
                  'reviews',
                  'Reviews'
                ),
              ],
            ].map(
              ([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.profileTab,
                    profileTab ===
                      key &&
                      styles.profileTabActive,
                  ]}
                  onPress={() =>
                    setProfileTab(
                      key
                    )
                  }
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.profileTabText,
                      profileTab ===
                        key &&
                        styles.profileTabTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <ScrollView
            style={styles.profileScroll}
            contentContainerStyle={
              styles.profileScrollContent
            }
            showsVerticalScrollIndicator={
              false
            }
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {profileLoading ? (
              <View
                style={
                  styles.profileLoading
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
                    styles.profileLoadingText
                  }
                >
                  {tSafe(
                    'loading_profile_details',
                    'Loading profile details...'
                  )}
                </Text>
              </View>
            ) : (
              <>
                {profileTab ===
                  'about' && (
                  <View>
                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'about',
                        'About'
                      )}
                    </Text>

                    <AboutMeDisplay
                      mode="display"
                      aboutme={
                        profileCleaner.aboutme
                      }
                      isHost
                    />

                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'certification',
                        'Certification'
                      )}
                    </Text>

                    <HostCertificationDisplay
                      certification={
                        certification
                      }
                    />

                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'performance',
                        'Performance'
                      )}
                    </Text>

                    <View
                      style={
                        styles.performanceGrid
                      }
                    >
                      <View
                        style={
                          styles.performanceItem
                        }
                      >
                        <Text
                          style={
                            styles.performanceValue
                          }
                        >
                          {profileCleaner
                            .performance
                            ?.performance_score ??
                            0}
                        </Text>

                        <Text
                          style={
                            styles.performanceLabel
                          }
                        >
                          {tSafe(
                            'performance',
                            'Performance'
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.performanceItem
                        }
                      >
                        <Text
                          style={
                            styles.performanceValue
                          }
                        >
                          {profileCleaner
                            .ranking_score ??
                            0}
                        </Text>

                        <Text
                          style={
                            styles.performanceLabel
                          }
                        >
                          {tSafe(
                            'ranking',
                            'Ranking'
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.performanceItem
                        }
                      >
                        <Text
                          style={
                            styles.performanceValue
                          }
                        >
                          {profileCleaner.distance ??
                            '—'}
                        </Text>

                        <Text
                          style={
                            styles.performanceLabel
                          }
                        >
                          {tSafe(
                            'miles_away',
                            'Miles away'
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {profileTab ===
                  'availability' && (
                  <View>
                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'availability',
                        'Availability'
                      )}
                    </Text>

                    <HostAvailabilityDisplay
                      availability={
                        profileAvailability?.availability ||
                        []
                      }
                      bookedSchedules={
                        profileAvailability?.booked_schedules ||
                        []
                      }
                    />
                  </View>
                )}

                {profileTab ===
                  'reviews' && (
                  <View>
                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'reviews',
                        'Reviews'
                      )}
                    </Text>

                    <Reviews
                      ratings={
                        profileReviews
                      }
                      cleanerId={
                        profileCleaner.cleanerId
                      }
                    />
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View
            style={styles.profileFooter}
          >
            <TouchableOpacity
              style={[
                styles.profileSelectButton,
                (!accepted ||
                  !cleanerGroup ||
                  (!selected &&
                    groupFull)) &&
                  styles.profileSelectButtonDisabled,
              ]}
              disabled={
                !accepted ||
                !cleanerGroup ||
                (!selected &&
                  groupFull)
              }
              onPress={() => {
                if (
                  !accepted ||
                  !cleanerGroup
                ) {
                  return;
                }

                toggleCleaner(
                  profileCleaner.cleanerId
                );

                closeCleanerProfile();
              }}
              activeOpacity={0.85}
            >
              <Text
                style={
                  styles.profileSelectButtonText
                }
              >
                {selected
                  ? tSafe(
                      'remove_from_team',
                      'Remove from Team'
                    )
                  : !cleanerGroup
                  ? tSafe(
                      'waiting_for_group',
                      'Waiting for Group'
                    )
                  : groupFull
                  ? `${groupLabel(
                      cleanerGroup
                    )} ${tSafe(
                      'already_filled',
                      'Already Filled'
                    )}`
                  : tSafe(
                      'select_cleaner',
                      'Select Cleaner'
                    )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  /*
   * ============================================================
   * MAIN SCREEN
   * ============================================================
   */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.pageContent
        }
        onScroll={handlePageScroll}
        scrollEventThrottle={16}
      >
        <View
          style={styles.header}
        >
          <View
            style={styles.headerText}
          >
            <Text
              style={styles.eyebrow}
            >
              {tSafe(
                'cleaning_team',
                'Cleaning team'
              )}
            </Text>

            <Text
              style={styles.title}
            >
              {tSafe(
                'build_your_cleaning_team',
                'Build your cleaning team'
              )}
            </Text>

            <Text
              style={styles.subtitle}
            >
              {tSafe(
                'choose_cleaners_for_your_team',
                'Choose the cleaners you want for this booking.'
              )}
            </Text>
          </View>

          <View
            style={styles.selectionCounter}
          >
            <Text
              style={
                styles.selectionCounterValue
              }
            >
              {selectedIds.length}
            </Text>

            <Text
              style={
                styles.selectionCounterDivider
              }
            >
              /
            </Text>

            <Text
              style={
                styles.selectionCounterTotal
              }
            >
              {requiredCleaners}
            </Text>

            <Text
              style={
                styles.selectionCounterLabel
              }
            >
              {tSafe(
                'selected',
                'selected'
              )}
            </Text>
          </View>
        </View>

        {renderPropertyContext()}

        {renderGroupRequirements()}

        {/*
         * IMPORTANT:
         *
         * We only show "No cleaners available" when:
         *
         * - nobody has accepted
         * - AND nobody is pending
         *
         * If pendingCandidates.length > 0, the user sees
         * the waiting state and notification count.
         */}

        {acceptedCandidates.length ===
          0 &&
        pendingCandidates.length ===
          0 ? (
          <View
            style={
              styles.selectionEmptyContainer
            }
          >
            <View
              style={
                styles.selectionEmptyIcon
              }
            >
              <MaterialCommunityIcons
                name="account-search-outline"
                size={30}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.selectionEmptyTitle
              }
            >
              {tSafe(
                'no_cleaners_available',
                'No cleaners are currently available'
              )}
            </Text>

            <Text
              style={
                styles.selectionEmptyText
              }
            >
              {tSafe(
                'no_cleaners_available_description',
                'There are currently no cleaners available to select for this cleaning.'
              )}
            </Text>
          </View>
        ) : acceptedCandidates.length ===
          0 &&
          pendingCandidates.length >
            0 ? (
          <View
            style={
              styles.selectionEmptyContainer
            }
          >
            <View
              style={
                styles.selectionEmptyIcon
              }
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={30}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.selectionEmptyTitle
              }
            >
              {tSafe(
                'waiting_for_cleaners',
                'Waiting for cleaners to respond'
              )}
            </Text>

            <Text
              style={
                styles.selectionEmptyText
              }
            >
              {tSafe(
                'cleaners_accepting_will_appear',
                'Cleaners who accept the request will appear here and become available for your team selection.'
              )}
            </Text>

            <View
              style={
                styles.pendingSummary
              }
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#9A6700"
              />

              <Text
                style={
                  styles.pendingSummaryText
                }
              >
                {pendingCandidates.length}{' '}
                {pendingCandidates.length ===
                1
                  ? tSafe(
                      'cleaner_is',
                      'cleaner is'
                    )
                  : tSafe(
                      'cleaners_are',
                      'cleaners are'
                    )}{' '}
                {tSafe(
                  'waiting_for_response',
                  'waiting for a response'
                )}
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={
              acceptedCandidates
            }
            keyExtractor={(item) =>
              item.cleanerId
            }
            renderItem={
              renderCandidate
            }
            scrollEnabled={false}
            contentContainerStyle={
              styles.list
            }
            showsVerticalScrollIndicator={
              false
            }
            ListHeaderComponent={
              <View
                style={
                  styles.availableHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.availableTitle
                    }
                  >
                    {tSafe(
                      'available_cleaners',
                      'Available cleaners'
                    )}
                  </Text>

                  <Text
                    style={
                      styles.availableSubtitle
                    }
                  >
                    {acceptedCandidates.length}{' '}
                    {acceptedCandidates.length ===
                    1
                      ? tSafe(
                          'cleaner_has_accepted',
                          'cleaner has accepted the request'
                        )
                      : tSafe(
                          'cleaners_have_accepted',
                          'cleaners have accepted the request'
                        )}
                  </Text>
                </View>

                {pendingCandidates.length >
                0 ? (
                  <View
                    style={
                      styles.waitingBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color="#9A6700"
                    />

                    <Text
                      style={
                        styles.waitingBadgeText
                      }
                    >
                      {pendingCandidates.length}{' '}
                      {tSafe(
                        'waiting',
                        'waiting'
                      )}
                    </Text>
                  </View>
                ) : null}
              </View>
            }
          />
        )}
      </ScrollView>

      {stickyProperty ||
      stickyGroupReqs ? (
        <View
          pointerEvents="none"
          style={
            styles.stickyHeaderContainer
          }
        >
          {stickyProperty
            ? renderPropertyContext(true)
            : null}

          {stickyGroupReqs
            ? renderGroupRequirements(true)
            : null}
        </View>
      ) : null}

      <View
        style={styles.checkoutArea}
      >
        {!groupCompositionComplete &&
        selectedIds.length ===
          requiredCleaners &&
        missingGroups.length > 0 ? (
          <Text
            style={
              styles.checkoutWarning
            }
          >
            {`${tSafe(
              'still_needed',
              'Still needed'
            )}: ${missingGroups
              .map(
                (item) =>
                  `${groupLabel(
                    item.group
                  )} (${item.remaining})`
              )
              .join(', ')}`}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!groupCompositionComplete ||
              selectedIds.length !==
                requiredCleaners) &&
              styles.checkoutButtonDisabled,
          ]}
          onPress={
            proceedToCheckout
          }
          disabled={
            !groupCompositionComplete ||
            selectedIds.length !==
              requiredCleaners
          }
          activeOpacity={0.85}
        >
          <Text
            style={
              styles.checkoutButtonText
            }
          >
            {groupCompositionComplete &&
            selectedIds.length ===
              requiredCleaners
              ? tSafe(
                  'continue_to_payment',
                  'Continue to Payment'
                )
              : tSafe(
                  'complete_team_selection',
                  'Complete team selection to continue'
                )}
          </Text>

          {groupCompositionComplete &&
          selectedIds.length ===
            requiredCleaners ? (
            <MaterialCommunityIcons
              name="arrow-right"
              size={19}
              color={
                COLORS.white
              }
              style={
                styles.checkoutArrow
              }
            />
          ) : null}
        </TouchableOpacity>
      </View>

      {renderProfileModal()}
    </View>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },

  pageContent: {
    paddingBottom: 130,
  },

  /*
   * HEADER
   */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 15,
  },

  headerText: {
    flex: 1,
    paddingRight: 14,
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 5,
  },

  title: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    maxWidth: 280,
  },

  selectionCounter: {
    minWidth: 66,
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionCounterValue: {
    fontSize: 19,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.primary,
  },

  selectionCounterDivider: {
    position: 'absolute',
    top: 17,
    left: 30,
    fontSize: 12,
    color: '#A1A5AC',
  },

  selectionCounterTotal: {
    position: 'absolute',
    top: 17,
    right: 12,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  selectionCounterLabel: {
    marginTop: 3,
    fontSize: 9,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  /*
   * PROPERTY
   */

  propertyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 13,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  propertyIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.primary + '12',
    marginRight: 11,
  },

  propertyInfo: {
    flex: 1,
  },

  propertyEyebrow: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  propertyName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  propertyLocation: {
    flex: 1,
    marginLeft: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  /*
   * STICKY HEADER OVERLAY
   *
   * Holds the property card and team requirements stacked
   * at the top of the screen once scrolled past.
   */

  stickyHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: '#F6F7F9',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  propertyContextSticky: {
    marginBottom: 8,
    shadowOpacity: 0,
    elevation: 0,
  },

  /*
   * GROUP REQUIREMENTS
   */

  groupRequirements: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  groupRequirementsSticky: {
    marginBottom: 8,
    shadowOpacity: 0,
    elevation: 0,
  },

  groupRequirementsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  groupRequirementsTitleBlock: {
    flex: 1,
    paddingRight: 10,
  },

  groupRequirementsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  groupRequirementsSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  completionBadgeComplete: {
    backgroundColor: '#EAF7EF',
  },

  completionBadgeIncomplete: {
    backgroundColor: '#FFF7E6',
  },

  completionBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
  },

  completionBadgeTextComplete: {
    color: '#16803C',
  },

  completionBadgeTextIncomplete: {
    color: '#9A6700',
  },

  groupRequirementsList: {
    marginTop: 10,
  },

  groupRequirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  groupRequirementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  groupRequirementName: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  groupRequirementCount: {
    fontSize: 12,
    color: '#9A6700',
    fontWeight: '600',
  },

  groupRequirementCountComplete: {
    color: '#16803C',
  },

  /*
   * AVAILABLE HEADER
   */

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  availableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    paddingHorizontal: 2,
  },

  availableTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  availableSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFF7E6',
  },

  waitingBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#9A6700',
    fontWeight: '600',
  },

  /*
   * CLEANER CARD
   */

  cleanerCard: {
    marginBottom: 11,
    padding: 13,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E4E6EB',
  },

  cleanerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor:
      COLORS.primary + '05',
  },

  cleanerCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  /*
   * AVATAR
   */

  avatarWrapper: {
    position: 'relative',
    width: 58,
    height: 58,
    marginRight: 0,
  },

  avatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
   * PREMIUM / VERIFIED BADGES
   */

  premiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8860B',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B7BEC',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  avatarCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    minHeight: 20,
  },

  premiumLabel: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#8A6500',
  },

  verifiedLabel: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#4778C7',
  },

  /*
   * CLEANER INFO
   */

  cleanerMainInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 4,
  },

  cleanerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cleanerName: {
    flex: 1,
    marginRight: 7,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF8E7',
  },

  ratingPillText: {
    marginLeft: 3,
    fontSize: 11,
    color: '#765900',
    fontWeight: '500',
  },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  distanceText: {
    marginLeft: 3,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  groupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor:
      COLORS.primary + '10',
  },

  groupPillWarning: {
    backgroundColor: '#FFF7E6',
  },

  groupPillText: {
    marginLeft: 4,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },

  groupPillWarningText: {
    color: '#9A6700',
  },

  performancePill: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  performancePillText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  recommendationIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.primary + '10',
  },

  recommendationText: {
    marginLeft: 6,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },

  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  acceptedText: {
    marginLeft: 5,
    fontSize: 11,
    color: '#16803C',
    fontWeight: '500',
  },

  groupNotice: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 14,
    color: '#9A6700',
  },

  cardChevron: {
    width: 25,
    alignItems: 'flex-end',
    paddingTop: 2,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },

  selectButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  selectButtonDisabled: {
    borderColor: '#D5D7DB',
    backgroundColor: '#F4F5F6',
  },

  selectButtonText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  selectButtonTextSelected: {
    color: COLORS.white,
  },

  selectButtonTextDisabled: {
    color: '#A5A5A5',
  },

  /*
   * CHECKOUT
   */

  checkoutArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor:
      'rgba(246,247,249,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
  },

  checkoutWarning: {
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#9A6700',
    textAlign: 'center',
  },

  checkoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  checkoutButtonDisabled: {
    opacity: 0.48,
  },

  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  checkoutArrow: {
    marginLeft: 8,
  },

  /*
   * EMPTY / LOADING / ERROR
   */

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#F6F7F9',
  },

  loadingIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.primary + '10',
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  loadingSubtitle: {
    marginTop: 6,
    maxWidth: 290,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDECEE',
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 7,
  },

  errorText: {
    maxWidth: 310,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },

  retryButton: {
    minWidth: 110,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },

  retryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },

  selectionEmptyContainer: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  selectionEmptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.primary + '10',
    marginBottom: 16,
  },

  selectionEmptyTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 7,
  },

  selectionEmptyText: {
    maxWidth: 310,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  pendingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF7E6',
  },

  pendingSummaryText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#9A6700',
    fontWeight: '500',
  },

  /*
   * PROFILE MODAL
   */

  profileModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  profileContainer: {
    height: '92%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D3D6',
    marginTop: 8,
    marginBottom: 7,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  profileIdentity: {
    flexDirection: 'row',
    flex: 1,
  },

  profileAvatarWrapper: {
    position: 'relative',
    width: 70,
    height: 70,
  },

  profilePremiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8860B',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  profileVerifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B7BEC',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  profileTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  profilePremiumText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6500',
  },

  profileVerifiedText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500',
    color: '#4778C7',
  },

  profileNameContainer: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 5,
  },

  profileName: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  profileLocation: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  profileDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  profileDistance: {
    marginLeft: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  profileGroupBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor:
      COLORS.primary + '10',
  },

  profileGroupBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },

  profileRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F3F5',
  },

  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F7F8F9',
  },

  profileStatusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },

  acceptedStatus: {
    color: '#16803C',
  },

  pendingStatus: {
    color: '#9A6700',
  },

  profileTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEDEF',
  },

  profileTab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },

  profileTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  profileTabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  profileTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  profileScroll: {
    flex: 1,
  },

  profileScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    paddingBottom: 35,
  },

  profileLoading: {
    alignItems: 'center',
    paddingVertical: 55,
  },

  profileLoadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 11,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  performanceGrid: {
    flexDirection: 'row',
  },

  performanceItem: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F6F7F9',
    alignItems: 'center',
  },

  performanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },

  performanceLabel: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  profileFooter: {
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#ECEDEF',
    backgroundColor: COLORS.white,
  },

  profileSelectButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },

  profileSelectButtonDisabled: {
    opacity: 0.42,
  },

  profileSelectButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});



// import React, {
//   useCallback,
//   useMemo,
//   useState,
// } from 'react';

// import {
//   useFocusEffect,
//   useRoute,
// } from '@react-navigation/native';

// import {
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';

// import { Avatar } from 'react-native-paper';
// import Modal from 'react-native-modal';
// import StarRating from 'react-native-star-rating-widget';

// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import HostAvailabilityDisplay from '../../components/host/HostAvailabilityDisplay';
// import HostCertificationDisplay from '../../components/host/HostCertificationDisplay';
// import Reviews from '../../components/shared/Reviews';

// export default function HostCleanerRecommendations({
//   navigation,
// }) {
//   /*
//    * ============================================================
//    * TRUST / BADGE HELPERS
//    * ============================================================
//    *
//    * The backend should eventually provide:
//    *
//    * trustTier: "premium" | "trusted" | "verified"
//    *
//    * or:
//    *
//    * verification: {
//    *   identityVerified: true,
//    *   phoneVerified: true,
//    *   emailVerified: true
//    * }
//    *
//    * We do NOT treat a payout/payment method alone as Premium.
//    */

//   const getCleanerTrustTier = useCallback(
//     (cleaner) => {
//       if (!cleaner) {
//         return null;
//       }

//       if (cleaner?.trustTier) {
//         return String(
//           cleaner.trustTier
//         ).toLowerCase();
//       }

//       if (
//         cleaner?.verification?.trustTier
//       ) {
//         return String(
//           cleaner.verification.trustTier
//         ).toLowerCase();
//       }

//       if (
//         cleaner?.profile?.trustTier
//       ) {
//         return String(
//           cleaner.profile.trustTier
//         ).toLowerCase();
//       }

//       return null;
//     },
//     []
//   );

//   const isPremiumCleaner = useCallback(
//     (cleaner) => {
//       const tier =
//         getCleanerTrustTier(cleaner);

//       return (
//         tier === 'premium' ||
//         tier === 'premium_cleaner'
//       );
//     },
//     [getCleanerTrustTier]
//   );

//   const isVerifiedCleaner = useCallback(
//     (cleaner) => {
//       if (typeof cleaner?.trust?.isVerified === 'boolean') {
//         return cleaner.trust.isVerified;
//       }
//       const tier = getCleanerTrustTier(cleaner);
//       if (
//         tier === 'verified' ||
//         tier === 'trusted' ||
//         tier === 'premium' ||
//         tier === 'premium_cleaner'
//       ) {
//         return true;
//       }
//       const verification =
//         cleaner?.verification;
//       return Boolean(
//         verification?.identityVerified &&
//         verification?.phoneVerified &&
//         verification?.emailVerified
//       );
//     },
//     [getCleanerTrustTier]
//   );

//   const route = useRoute();

//   const {
//     scheduleId,
//     schedule: routeSchedule,
//   } = route?.params || {};

//   const [candidates, setCandidates] =
//     useState([]);

//   const [requiredCleaners, setRequiredCleaners] =
//     useState(0);

//   const [assignedTo, setAssignedTo] =
//     useState([]);

//   const [scheduleDetails, setScheduleDetails] =
//     useState({});

//   const [selectedIds, setSelectedIds] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState(null);

//   const [acceptedCleanerIds, setAcceptedCleanerIds] =
//     useState(new Set());

//   const [profileCleaner, setProfileCleaner] =
//     useState(null);

//   const [profileVisible, setProfileVisible] =
//     useState(false);

//   const [profileTab, setProfileTab] =
//     useState('about');

//   const [profileAvailability, setProfileAvailability] =
//     useState(null);

//   const [profileReviews, setProfileReviews] =
//     useState([]);

//   const [profileLoading, setProfileLoading] =
//     useState(false);

//   /*
//    * ============================================================
//    * GROUP HELPERS
//    * ============================================================
//    */

//   const getCleanerGroup = useCallback(
//     (cleaner) => {
//       if (!cleaner) {
//         return null;
//       }

//       return (
//         cleaner.group ||
//         cleaner.requestGroup ||
//         cleaner.assignedGroup ||
//         cleaner.request?.group ||
//         null
//       );
//     },
//     []
//   );

//   const groupLabel = useCallback(
//     (group) => {
//       if (!group) {
//         return tSafe(
//           'unknown_group',
//           'Unknown group'
//         );
//       }

//       const normalizedGroup = group
//         .replace(/^group[_-]?/i, '')
//         .replace(/[_-]+/g, ' ')
//         .replace(/\b\w/g, (letter) =>
//           letter.toUpperCase()
//         );

//       return `${tSafe(
//         'group',
//         'Group'
//       )} ${normalizedGroup}`;
//     },
//     []
//   );

//   /*
//    * ============================================================
//    * REQUIRED GROUP COUNTS
//    * ============================================================
//    */

//   const requiredGroupCounts = useMemo(() => {
//     return assignedTo.reduce(
//       (counts, position) => {
//         const group =
//           position?.group;

//         if (!group) {
//           return counts;
//         }

//         counts[group] =
//           (counts[group] || 0) + 1;

//         return counts;
//       },
//       {}
//     );
//   }, [assignedTo]);

//   const requiredGroups = useMemo(
//     () =>
//       Object.keys(
//         requiredGroupCounts
//       ),
//     [requiredGroupCounts]
//   );

//   /*
//    * ============================================================
//    * SELECTED GROUP COUNTS
//    * ============================================================
//    */

//   const selectedGroupCounts = useMemo(() => {
//     return selectedIds.reduce(
//       (counts, cleanerId) => {
//         const cleaner =
//           candidates.find(
//             (candidate) =>
//               candidate.cleanerId ===
//               cleanerId
//           );

//         const group =
//           getCleanerGroup(cleaner);

//         if (!group) {
//           return counts;
//         }

//         counts[group] =
//           (counts[group] || 0) + 1;

//         return counts;
//       },
//       {}
//     );
//   }, [
//     selectedIds,
//     candidates,
//     getCleanerGroup,
//   ]);

//   /*
//    * ============================================================
//    * MISSING GROUPS
//    * ============================================================
//    */

//   const missingGroups = useMemo(() => {
//     return requiredGroups
//       .map((group) => {
//         const required =
//           requiredGroupCounts[group] ||
//           0;

//         const selected =
//           selectedGroupCounts[group] ||
//           0;

//         return {
//           group,
//           required,
//           selected,
//           remaining: Math.max(
//             0,
//             required - selected
//           ),
//         };
//       })
//       .filter(
//         (item) =>
//           item.remaining > 0
//       );
//   }, [
//     requiredGroups,
//     requiredGroupCounts,
//     selectedGroupCounts,
//   ]);

//   /*
//    * ============================================================
//    * GROUP COMPOSITION
//    * ============================================================
//    */

//   const groupCompositionComplete =
//     useMemo(() => {
//       if (!requiredGroups.length) {
//         return false;
//       }

//       return requiredGroups.every(
//         (group) =>
//           (selectedGroupCounts[group] ||
//             0) ===
//           (requiredGroupCounts[group] ||
//             0)
//       );
//     }, [
//       requiredGroups,
//       requiredGroupCounts,
//       selectedGroupCounts,
//     ]);

//   /*
//    * ============================================================
//    * LOAD DATA
//    * ============================================================
//    */

//   const fetchData = useCallback(
//     async () => {
//       if (!scheduleId) {
//         setError(
//           tSafe(
//             'missing_schedule_id',
//             'Missing schedule ID.'
//           )
//         );

//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         const [
//           candidateResponse,
//           requestResponse,
//         ] = await Promise.all([
//           userService.getHostCleanerCandidates(
//             scheduleId
//           ),
//           userService.getHostCleaningRequestByScheduleId(
//             scheduleId,
//             moment().format(
//               'YYYY-MM-DD HH:mm:ss'
//             )
//           ),
//         ]);

//         const candidateData =
//           candidateResponse?.data || {};

//         const requestData =
//           requestResponse?.data || [];

//         /*
//          * Resolve required team.
//          */

//         const requestAssignedTo =
//           requestData?.[0]?.schedule
//             ?.assignedTo || [];

//         const routeAssignedTo =
//           routeSchedule?.assignedTo || [];

//         const initialAssignedTo =
//           requestAssignedTo.length > 0
//             ? requestAssignedTo
//             : routeAssignedTo;

//         /*
//          * Create host-selection requests.
//          */

//         try {
//           await userService.sendHostGroupCleanerRequests(
//             scheduleId
//           );
//         } catch (requestErr) {
//           console.warn(
//             '⚠️ Host group cleaner request skipped:',
//             requestErr?.response?.data
//               ?.detail ||
//               requestErr?.message
//           );
//         }

//         /*
//          * Refresh request state.
//          */

//         const refreshedRequestResponse =
//           await userService.getHostCleaningRequestByScheduleId(
//             scheduleId,
//             moment().format(
//               'YYYY-MM-DD HH:mm:ss'
//             )
//           );

//         const refreshedRequestData =
//           refreshedRequestResponse?.data ||
//           [];

//         /*
//          * Resolve latest assignedTo.
//          */

//         const refreshedRequestAssignedTo =
//           refreshedRequestData?.[0]
//             ?.schedule?.assignedTo || [];

//         const refreshedAssignedTo =
//           refreshedRequestAssignedTo.length >
//           0
//             ? refreshedRequestAssignedTo
//             : initialAssignedTo;

//         /*
//          * Determine accepted cleaners.
//          */

//         const acceptedIds = new Set(
//           refreshedRequestData
//             .filter(
//               (request) =>
//                 request?.status ===
//                   'accepted' &&
//                 request?.cleaner?.['_id']
//             )
//             .map(
//               (request) =>
//                 request.cleaner['_id']
//             )
//         );

//         setAcceptedCleanerIds(
//           acceptedIds
//         );

//         /*
//          * Resolve schedule.
//          */

//         const refreshedSchedule =
//           refreshedRequestData?.[0]
//             ?.schedule ||
//           routeSchedule ||
//           {};

//         setScheduleDetails(
//           refreshedSchedule
//         );

//         /*
//          * Candidate list.
//          */

//         const recommendedCandidates =
//           candidateData.candidates || [];

//         setCandidates(
//           recommendedCandidates
//         );

//         /*
//          * Required team.
//          */

//         setAssignedTo(
//           refreshedAssignedTo
//         );

//         setRequiredCleaners(
//           refreshedAssignedTo.length
//         );

//         /*
//          * Preserve only accepted candidates.
//          */

//         setSelectedIds((current) =>
//           current.filter(
//             (id) =>
//               acceptedIds.has(id) &&
//               recommendedCandidates.some(
//                 (candidate) =>
//                   candidate.cleanerId ===
//                   id
//               )
//           )
//         );
//       } catch (err) {
//         console.error(
//           '❌ Error loading host cleaner recommendations:',
//           err
//         );

//         setError(
//           err?.response?.data?.detail ||
//             err?.message ||
//             tSafe(
//               'unable_to_load_cleaner_recommendations',
//               'Unable to load cleaner recommendations.'
//             )
//         );
//       } finally {
//         setLoading(false);
//       }
//     },
//     [
//       scheduleId,
//       routeSchedule,
//     ]
//   );

//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//     }, [fetchData])
//   );

//   /*
//    * ============================================================
//    * CANDIDATE GROUPS
//    * ============================================================
//    */

//   const acceptedCandidates = useMemo(
//     () =>
//       candidates.filter(
//         (candidate) =>
//           acceptedCleanerIds.has(
//             candidate.cleanerId
//           ) ||
//           candidate.requestStatus ===
//             'accepted'
//       ),
//     [
//       candidates,
//       acceptedCleanerIds,
//     ]
//   );

//   const pendingCandidates = useMemo(
//     () =>
//       candidates.filter(
//         (candidate) =>
//           candidate.requestStatus ===
//           'pending_acceptance'
//       ),
//     [candidates]
//   );

//   /*
//    * ============================================================
//    * TOGGLE CLEANER
//    * ============================================================
//    */

//   const toggleCleaner = (
//     cleanerId
//   ) => {
//     const candidate =
//       candidates.find(
//         (item) =>
//           item.cleanerId === cleanerId
//       );

//     const accepted =
//       acceptedCleanerIds.has(
//         cleanerId
//       ) ||
//       candidate?.requestStatus ===
//         'accepted';

//     if (!accepted) {
//       return;
//     }

//     const cleanerGroup =
//       getCleanerGroup(candidate);

//     if (!cleanerGroup) {
//       console.warn(
//         `Cleaner ${cleanerId} has no request group. Selection blocked until the group is known.`
//       );

//       return;
//     }

//     setSelectedIds((current) => {
//       /*
//        * Remove.
//        */

//       if (
//         current.includes(cleanerId)
//       ) {
//         return current.filter(
//           (id) => id !== cleanerId
//         );
//       }

//       /*
//        * Team already full.
//        */

//       if (
//         current.length >=
//         requiredCleaners
//       ) {
//         return current;
//       }

//       /*
//        * Group capacity.
//        */

//       const requiredForGroup =
//         requiredGroupCounts[
//           cleanerGroup
//         ] || 0;

//       const alreadySelectedForGroup =
//         current.reduce(
//           (count, selectedId) => {
//             const selectedCleaner =
//               candidates.find(
//                 (item) =>
//                   item.cleanerId ===
//                   selectedId
//               );

//             return (
//               count +
//               (getCleanerGroup(
//                 selectedCleaner
//               ) === cleanerGroup
//                 ? 1
//                 : 0)
//             );
//           },
//           0
//         );

//       if (
//         alreadySelectedForGroup >=
//         requiredForGroup
//       ) {
//         return current;
//       }

//       return [
//         ...current,
//         cleanerId,
//       ];
//     });
//   };

//   /*
//    * ============================================================
//    * CLEANER PROFILE
//    * ============================================================
//    */

//   const openCleanerProfile =
//     async (cleaner) => {
//       setProfileCleaner(cleaner);
//       setProfileTab('about');
//       setProfileVisible(true);
//       setProfileAvailability(null);
//       setProfileReviews([]);
//       setProfileLoading(true);

//       try {
//         const [
//           availabilityResponse,
//           reviewsResponse,
//         ] = await Promise.all([
//           userService.getCleanerAvailability(
//             cleaner.cleanerId
//           ),
//           userService.getCleanerFeedbacks(
//             cleaner.cleanerId
//           ),
//         ]);

//         setProfileAvailability(
//           availabilityResponse?.data
//             ?.data ||
//             availabilityResponse?.data ||
//             null
//         );

//         setProfileReviews(
//           reviewsResponse?.data?.data ||
//             reviewsResponse?.data ||
//             []
//         );
//       } catch (err) {
//         console.warn(
//           '⚠️ Unable to load cleaner profile details:',
//           err?.response?.data?.detail ||
//             err?.message
//         );
//       } finally {
//         setProfileLoading(false);
//       }
//     };

//   const closeCleanerProfile = () => {
//     setProfileVisible(false);
//     setProfileCleaner(null);
//   };

//   /*
//    * ============================================================
//    * CHECKOUT
//    * ============================================================
//    */

//   const proceedToCheckout = () => {
//     if (
//       selectedIds.length !==
//         requiredCleaners ||
//       !assignedTo.length ||
//       !groupCompositionComplete
//     ) {
//       return;
//     }

//     const openPositions =
//       assignedTo.filter(
//         (position) =>
//           !position?.cleanerId
//       );

//     if (
//       openPositions.length !==
//       selectedIds.length
//     ) {
//       return;
//     }

//     const selectedCleaners =
//       selectedIds
//         .map((id) =>
//           candidates.find(
//             (candidate) =>
//               candidate.cleanerId ===
//               id
//           )
//         )
//         .filter(Boolean);

//     /*
//      * Match selected cleaners to open
//      * positions by group.
//      */

//     const availablePositionsByGroup =
//       openPositions.reduce(
//         (groups, position) => {
//           const group =
//             position?.group;

//           if (!group) {
//             return groups;
//           }

//           if (!groups[group]) {
//             groups[group] = [];
//           }

//           groups[group].push(
//             position
//           );

//           return groups;
//         },
//         {}
//       );

//     const cleanersWithFee = [];

//     for (const cleaner of selectedCleaners) {
//       const cleanerGroup =
//         getCleanerGroup(cleaner);

//       if (!cleanerGroup) {
//         console.error(
//           '❌ Cannot continue: selected cleaner has no group.',
//           cleaner
//         );

//         return;
//       }

//       const matchingPositions =
//         availablePositionsByGroup[
//           cleanerGroup
//         ] || [];

//       const position =
//         matchingPositions.shift();

//       if (!position) {
//         console.error(
//           `❌ Cannot continue: no available ${cleanerGroup} position for cleaner ${cleaner.cleanerId}.`
//         );

//         return;
//       }

//       const calculatedPrice =
//         Number(
//           position?.checklist
//             ?.calculatedPrice ??
//             position?.checklist
//               ?.price ??
//             0
//         );

//       cleanersWithFee.push({
//         cleanerId:
//           cleaner.cleanerId,

//         firstname:
//           cleaner.firstname || '',

//         lastname:
//           cleaner.lastname || '',

//         avatar:
//           cleaner.avatar || '',

//         group: cleanerGroup,

//         fee: calculatedPrice,

//         price: Number(
//           position?.checklist
//             ?.price ?? 0
//         ),

//         calculatedPrice,
//       });
//     }

//     /*
//      * Validate final group composition.
//      */

//     const checkoutGroupCounts =
//       cleanersWithFee.reduce(
//         (counts, cleaner) => {
//           counts[cleaner.group] =
//             (counts[cleaner.group] ||
//               0) + 1;

//           return counts;
//         },
//         {}
//       );

//     const checkoutCompositionValid =
//       requiredGroups.every(
//         (group) =>
//           checkoutGroupCounts[
//             group
//           ] ===
//           requiredGroupCounts[group]
//       );

//     if (
//       !checkoutCompositionValid
//     ) {
//       console.error(
//         '❌ Group composition validation failed before checkout.',
//         {
//           requiredGroupCounts,
//           checkoutGroupCounts,
//         }
//       );

//       return;
//     }

//     /*
//      * Calculate actual cleaning subtotal.
//      */

//     const totalFee =
//       cleanersWithFee.reduce(
//         (sum, cleaner) =>
//           sum +
//           Number(
//             cleaner.fee || 0
//           ),
//         0
//       );

//     console.log(
//       '💰 HOST CHECKOUT CLEANERS:',
//       cleanersWithFee
//     );

//     console.log(
//       '💰 HOST CHECKOUT TOTAL:',
//       totalFee
//     );

//     navigation?.navigate(
//       ROUTES.host_group_checkout,
//       {
//         requestId: null,

//         cleaning_fee: totalFee,

//         scheduleId,

//         schedule: {
//           ...scheduleDetails,
//           assignedTo,
//         },

//         selected_cleaners:
//           selectedCleaners.map(
//             (cleaner) => ({
//               _id:
//                 cleaner.cleanerId,

//               cleanerId:
//                 cleaner.cleanerId,

//               firstname:
//                 cleaner.firstname ||
//                 '',

//               lastname:
//                 cleaner.lastname ||
//                 '',

//               avatar:
//                 cleaner.avatar || '',

//               group:
//                 getCleanerGroup(
//                   cleaner
//                 ),
//             })
//           ),

//         cleanerIds: selectedIds,

//         cleanersWithFee,

//         hostSelectionFlow: true,
//       }
//     );
//   };

//   /*
//    * ============================================================
//    * CLEANER CARD
//    * ============================================================
//    */

//   const renderCandidate = ({
//     item,
//   }) => {
//     const selected =
//       selectedIds.includes(
//         item.cleanerId
//       );

//     const performance =
//       item.performance || {};

//     const hasRating =
//       typeof item.averageRating ===
//       'number';

//     const rating = hasRating
//       ? item.averageRating.toFixed(
//           1
//         )
//       : null;

//     const cleanerGroup =
//       getCleanerGroup(item);

//     const requiredForGroup =
//       cleanerGroup
//         ? requiredGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const selectedForGroup =
//       cleanerGroup
//         ? selectedGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const groupFull =
//       cleanerGroup &&
//       selectedForGroup >=
//         requiredForGroup;

//     const cannotSelect =
//       !selected &&
//       (selectedIds.length >=
//         requiredCleaners ||
//         !cleanerGroup ||
//         groupFull);

//     const premium =
//       isPremiumCleaner(item);

//     const verified =
//       isVerifiedCleaner(item);

//     return (
//       <View
//         style={[
//           styles.cleanerCard,
//           selected &&
//             styles.cleanerCardSelected,
//         ]}
//       >
//         <TouchableOpacity
//           style={styles.cleanerCardMain}
//           onPress={() =>
//             openCleanerProfile(item)
//           }
//           activeOpacity={0.88}
//         >
//           {/* ==================================================
//               AVATAR + TRUST BADGE
//               ================================================== */}

//           <View
//             style={styles.avatarWrapper}
//           >
//             {item.avatar ? (
//               <Avatar.Image
//                 size={58}
//                 source={{
//                   uri: item.avatar,
//                 }}
//               />
//             ) : (
//               <View
//                 style={
//                   styles.avatarFallback
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="account"
//                   size={27}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             )}

//             {/* Premium badge */}
//             {premium ? (
//               <View
//                 style={
//                   styles.premiumBadge
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="shield-star"
//                   size={14}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             ) : verified ? (
//               <View
//                 style={
//                   styles.verifiedBadge
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="shield-check"
//                   size={14}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             ) : null}

//             {/* Selected badge */}
//             {selected ? (
//               <View
//                 style={
//                   styles.avatarCheck
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="check"
//                   size={13}
//                   color={
//                     COLORS.white
//                   }
//                 />
//               </View>
//             ) : null}
//           </View>

//           <View
//             style={styles.cleanerMainInfo}
//           >
//             <View
//               style={
//                 styles.cleanerNameRow
//               }
//             >
//               <Text
//                 style={styles.cleanerName}
//                 numberOfLines={1}
//               >
//                 {`${item.firstname || ''} ${
//                   item.lastname || ''
//                 }`.trim()}
//               </Text>

//               <View
//                 style={
//                   styles.ratingPill
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="star"
//                   size={13}
//                   color="#C28A00"
//                 />

//                 <Text
//                   style={
//                     styles.ratingPillText
//                   }
//                 >
//                   {rating ||
//                     tSafe(
//                       'new',
//                       'New'
//                     )}
//                 </Text>
//               </View>
//             </View>

//             {/* Trust label */}
//             {premium ? (
//               <View
//                 style={styles.trustBadgeRow}
//               >
//                 <MaterialCommunityIcons
//                   name="shield-star"
//                   size={14}
//                   color="#A87900"
//                 />
//                 <Text
//                   style={styles.premiumLabel}
//                 >
//                   {tSafe(
//                     'premium_cleaner',
//                     'Premium Cleaner'
//                   )}
//                 </Text>
//               </View>
//               ) : verified ? (
//               <View
//                 style={styles.trustBadgeRow}
//               >
//                 <MaterialCommunityIcons
//                   name="shield-check"
//                   size={14}
//                   color="#4778C7"
//                 />

//                 <Text
//                   style={styles.verifiedLabel}
//                 >
//                   {tSafe(
//                     'verified_cleaner',
//                     'Verified Cleaner'
//                   )}
//                 </Text>
//               </View>
//               ) : null}

//               {/* {(item.trust?.badges || [])
//               .filter(
//                 (badge) =>
//                   badge !== 'Verified Cleaner' &&
//                   badge !== 'Premium Cleaner'
//               )

//               .map((badge) => (
//                 <View
//                   key={badge}
//                   style={styles.trustBadgeRow}
//                 >
//                   <MaterialCommunityIcons
//                     name="star-circle-outline"
//                     size={14}
//                     color="#4778C7"
//                   />

//                   <Text
//                     style={styles.verifiedLabel}
//                   >
//                     {tSafe(
//                       badge === 'Experienced Cleaner'
//                         ? 'experienced_cleaner'
//                         : String(badge).toLowerCase().replace(/\s+/g, '_'),
//                       badge
//                     )}
//                   </Text>
//                 </View>
//               ))} */}


//             <View
//               style={
//                 styles.distanceRow
//               }
//             >
//               <MaterialCommunityIcons
//                 name="map-marker-outline"
//                 size={14}
//                 color={
//                   COLORS.textSecondary
//                 }
//               />

//               <Text
//                 style={
//                   styles.distanceText
//                 }
//               >
//                 {item.distance ??
//                   '—'}{' '}
//                 {tSafe(
//                   'miles_away',
//                   'miles away'
//                 )}
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.cardMetaRow
//               }
//             >
//               {cleanerGroup ? (
//                 <View
//                   style={
//                     styles.groupPill
//                   }
//                 >
//                   <MaterialCommunityIcons
//                     name="account-group-outline"
//                     size={13}
//                     color={
//                       COLORS.primary
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.groupPillText
//                     }
//                   >
//                     {groupLabel(
//                       cleanerGroup
//                     )}
//                   </Text>
//                 </View>
//               ) : (
//                 <View
//                   style={[
//                     styles.groupPill,
//                     styles.groupPillWarning,
//                   ]}
//                 >
//                   <MaterialCommunityIcons
//                     name="clock-outline"
//                     size={13}
//                     color="#9A6700"
//                   />

//                   <Text
//                     style={[
//                       styles.groupPillText,
//                       styles.groupPillWarningText,
//                     ]}
//                   >
//                     {tSafe(
//                       'group_pending',
//                       'Group pending'
//                     )}
//                   </Text>
//                 </View>
//               )}

//               <View
//                 style={styles.performancePill}
//               >
//                 <Text
//                   style={
//                     styles.performancePillText
//                   }
//                 >
//                   {tSafe(
//                     'performance',
//                     'Performance'
//                   )}{' '}
//                   {performance.performance_score ??
//                     0}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={
//                 styles.recommendationRow
//               }
//             >
//               <View
//                 style={
//                   styles.recommendationIcon
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="sparkles"
//                   size={13}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </View>

//               <Text
//                 style={
//                   styles.recommendationText
//                 }
//               >
//                 {tSafe(
//                   'recommendation_score',
//                   'Recommendation score'
//                 )}{' '}
//                 {item.host_recommendation_score ??
//                   0}
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.acceptedRow
//               }
//             >
//               <MaterialCommunityIcons
//                 name="check-circle"
//                 size={15}
//                 color="#16803C"
//               />

//               <Text
//                 style={
//                   styles.acceptedText
//                 }
//               >
//                 {tSafe(
//                   'cleaner_accepted_available',
//                   'Accepted — available for selection'
//                 )}
//               </Text>
//             </View>

//             {cleanerGroup &&
//             groupFull &&
//             !selected ? (
//               <Text
//                 style={
//                   styles.groupNotice
//                 }
//               >
//                 {`${groupLabel(
//                   cleanerGroup
//                 )} ${tSafe(
//                   'group_already_filled',
//                   'is already filled'
//                 )}`}
//               </Text>
//             ) : null}

//             {!cleanerGroup ? (
//               <Text
//                 style={
//                   styles.groupNotice
//                 }
//               >
//                 {tSafe(
//                   'waiting_for_request_group',
//                   'Waiting for request group information'
//                 )}
//               </Text>
//             ) : null}
//           </View>

//           <View
//             style={styles.cardChevron}
//           >
//             <MaterialCommunityIcons
//               name="chevron-right"
//               size={20}
//               color={
//                 COLORS.textSecondary
//               }
//             />
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.selectButton,
//             selected &&
//               styles.selectButtonSelected,
//             cannotSelect &&
//               styles.selectButtonDisabled,
//           ]}
//           onPress={() =>
//             toggleCleaner(
//               item.cleanerId
//             )
//           }
//           disabled={cannotSelect}
//           activeOpacity={0.8}
//         >
//           <MaterialCommunityIcons
//             name={
//               selected
//                 ? 'check'
//                 : 'plus'
//             }
//             size={20}
//             color={
//               selected
//                 ? COLORS.white
//                 : cannotSelect
//                 ? '#A5A5A5'
//                 : COLORS.primary
//             }
//           />

//           <Text
//             style={[
//               styles.selectButtonText,
//               selected &&
//                 styles.selectButtonTextSelected,
//               cannotSelect &&
//                 styles.selectButtonTextDisabled,
//             ]}
//           >
//             {selected
//               ? tSafe(
//                   'selected',
//                   'Selected'
//                 )
//               : tSafe(
//                   'select',
//                   'Select'
//                 )}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   /*
//    * ============================================================
//    * LOADING
//    * ============================================================
//    */

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <View
//           style={
//             styles.loadingIconContainer
//           }
//         >
//           <ActivityIndicator
//             size="large"
//             color={COLORS.primary}
//           />
//         </View>

//         <Text
//           style={styles.loadingTitle}
//         >
//           {tSafe(
//             'loading_recommendations',
//             'Finding recommended cleaners...'
//           )}
//         </Text>

//         <Text
//           style={styles.loadingSubtitle}
//         >
//           {tSafe(
//             'loading_recommendations_subtitle',
//             'Reviewing availability, performance, ratings, and distance.'
//           )}
//         </Text>
//       </View>
//     );
//   }

//   /*
//    * ============================================================
//    * ERROR
//    * ============================================================
//    */

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <View
//           style={
//             styles.errorIconContainer
//           }
//         >
//           <MaterialCommunityIcons
//             name="alert-outline"
//             size={30}
//             color="#B00020"
//           />
//         </View>

//         <Text
//           style={styles.errorTitle}
//         >
//           {tSafe(
//             'unable_to_load',
//             'Unable to load recommendations'
//           )}
//         </Text>

//         <Text
//           style={styles.errorText}
//         >
//           {error}
//         </Text>

//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={fetchData}
//           activeOpacity={0.85}
//         >
//           <Text
//             style={styles.retryText}
//           >
//             {tSafe(
//               'retry',
//               'Retry'
//             )}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   /*
//    * ============================================================
//    * PROFILE MODAL
//    * ============================================================
//    */

//   const renderProfileModal = () => {
//     if (!profileCleaner) {
//       return null;
//     }

//     const accepted =
//       acceptedCleanerIds.has(
//         profileCleaner.cleanerId
//       ) ||
//       profileCleaner.requestStatus ===
//         'accepted';

//     const selected =
//       selectedIds.includes(
//         profileCleaner.cleanerId
//       );

//     const premium =
//       isPremiumCleaner(
//         profileCleaner
//       );

//     const verified =
//       isVerifiedCleaner(
//         profileCleaner
//       );

//     const rating =
//       typeof profileCleaner.averageRating ===
//       'number'
//         ? profileCleaner.averageRating
//         : 0;

//     const certification =
//       profileCleaner.certification ||
//       {};

//     const cleanerGroup =
//       getCleanerGroup(
//         profileCleaner
//       );

//     const requiredForGroup =
//       cleanerGroup
//         ? requiredGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const selectedForGroup =
//       cleanerGroup
//         ? selectedGroupCounts[
//             cleanerGroup
//           ] || 0
//         : 0;

//     const groupFull =
//       cleanerGroup &&
//       selectedForGroup >=
//         requiredForGroup;

//     return (
//       <Modal
//         isVisible={profileVisible}
//         onBackdropPress={
//           closeCleanerProfile
//         }
//         propagateSwipe
//         style={styles.profileModal}
//         backdropOpacity={0.48}
//       >
//         <View
//           style={
//             styles.profileContainer
//           }
//         >
//           <View
//             style={styles.modalHandle}
//           />

//           <View
//             style={styles.profileHeader}
//           >
//             <View
//               style={styles.profileIdentity}
//             >
//               <View
//                 style={
//                   styles.profileAvatarWrapper
//                 }
//               >
//                 {profileCleaner.avatar ? (
//                   <Avatar.Image
//                     size={70}
//                     source={{
//                       uri: profileCleaner.avatar,
//                     }}
//                   />
//                 ) : (
//                   <Avatar.Icon
//                     size={70}
//                     icon="account"
//                     color={
//                       COLORS.white
//                     }
//                   />
//                 )}

//                 {premium ? (
//                   <View
//                     style={
//                       styles.profilePremiumBadge
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-star"
//                       size={15}
//                       color={
//                         COLORS.white
//                       }
//                     />
//                   </View>
//                 ) : verified ? (
//                   <View
//                     style={
//                       styles.profileVerifiedBadge
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-check"
//                       size={15}
//                       color={
//                         COLORS.white
//                       }
//                     />
//                   </View>
//                 ) : null}
//               </View>

//               <View
//                 style={
//                   styles.profileNameContainer
//                 }
//               >
//                 <Text
//                   style={
//                     styles.profileName
//                   }
//                   numberOfLines={1}
//                 >
//                   {`${profileCleaner.firstname || ''} ${
//                     profileCleaner.lastname || ''
//                   }`.trim()}
//                 </Text>

//                 {premium ? (
//                   <View
//                     style={
//                       styles.profileTrustRow
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-star"
//                       size={14}
//                       color="#A87900"
//                     />

//                     <Text
//                       style={
//                         styles.profilePremiumText
//                       }
//                     >
//                       {tSafe(
//                         'premium_cleaner',
//                         'Premium Cleaner'
//                       )}
//                     </Text>
//                   </View>
//                 ) : verified ? (
//                   <View
//                     style={
//                       styles.profileTrustRow
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="shield-check"
//                       size={14}
//                       color="#4778C7"
//                     />

//                     <Text
//                       style={
//                         styles.profileVerifiedText
//                       }
//                     >
//                       {tSafe(
//                         'verified_cleaner',
//                         'Verified Cleaner'
//                       )}
//                     </Text>
//                   </View>
//                 ) : null}

//                 {profileCleaner
//                   .location?.city ? (
//                   <Text
//                     style={
//                       styles.profileLocation
//                     }
//                   >
//                     {
//                       profileCleaner
//                         .location
//                         .city
//                     }
//                     {profileCleaner
//                       .location
//                       .region_code
//                       ? `, ${profileCleaner.location.region_code}`
//                       : ''}
//                   </Text>
//                 ) : null}

//                 <View
//                   style={
//                     styles.profileDistanceRow
//                   }
//                 >
//                   <MaterialCommunityIcons
//                     name="map-marker-outline"
//                     size={14}
//                     color={
//                       COLORS.textSecondary
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.profileDistance
//                     }
//                   >
//                     {profileCleaner.distance ??
//                       '—'}{' '}
//                     {tSafe(
//                       'miles_away',
//                       'miles away'
//                     )}
//                   </Text>
//                 </View>

//                 {cleanerGroup ? (
//                   <View
//                     style={
//                       styles.profileGroupBadge
//                     }
//                   >
//                     <Text
//                       style={
//                         styles.profileGroupBadgeText
//                       }
//                     >
//                       {groupLabel(
//                         cleanerGroup
//                       )}
//                     </Text>
//                   </View>
//                 ) : null}

//                 <View
//                   style={
//                     styles.profileRatingRow
//                   }
//                 >
//                   <StarRating
//                     rating={rating}
//                     onChange={() => {}}
//                     starSize={17}
//                     enableHalfStar
//                     disabled
//                   />

//                   <Text
//                     style={
//                       styles.ratingText
//                     }
//                   >
//                     {rating > 0
//                       ? rating.toFixed(
//                           1
//                         )
//                       : tSafe(
//                           'new',
//                           'New'
//                         )}

//                     {profileCleaner.totalRatings
//                       ? ` (${profileCleaner.totalRatings})`
//                       : ''}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={
//                 closeCleanerProfile
//               }
//               style={
//                 styles.closeButton
//               }
//               activeOpacity={0.75}
//             >
//               <MaterialCommunityIcons
//                 name="close"
//                 size={23}
//                 color={
//                   COLORS.gray
//                 }
//               />
//             </TouchableOpacity>
//           </View>

//           <View
//             style={styles.profileStatus}
//           >
//             <MaterialCommunityIcons
//               name={
//                 accepted
//                   ? 'check-circle'
//                   : 'clock-outline'
//               }
//               size={17}
//               color={
//                 accepted
//                   ? '#16803C'
//                   : '#9A6700'
//               }
//             />

//             <Text
//               style={[
//                 styles.profileStatusText,
//                 accepted
//                   ? styles.acceptedStatus
//                   : styles.pendingStatus,
//               ]}
//             >
//               {accepted
//                 ? tSafe(
//                     'cleaner_accepted_request',
//                     'Cleaner has accepted the request'
//                   )
//                 : tSafe(
//                     'waiting_cleaner_accept',
//                     'Waiting for cleaner to accept'
//                   )}
//             </Text>
//           </View>

//           <View
//             style={styles.profileTabs}
//           >
//             {[
//               [
//                 'about',
//                 tSafe(
//                   'about',
//                   'About'
//                 ),
//               ],
//               [
//                 'availability',
//                 tSafe(
//                   'availability',
//                   'Availability'
//                 ),
//               ],
//               [
//                 'reviews',
//                 tSafe(
//                   'reviews',
//                   'Reviews'
//                 ),
//               ],
//             ].map(
//               ([key, label]) => (
//                 <TouchableOpacity
//                   key={key}
//                   style={[
//                     styles.profileTab,
//                     profileTab ===
//                       key &&
//                       styles.profileTabActive,
//                   ]}
//                   onPress={() =>
//                     setProfileTab(
//                       key
//                     )
//                   }
//                   activeOpacity={0.75}
//                 >
//                   <Text
//                     style={[
//                       styles.profileTabText,
//                       profileTab ===
//                         key &&
//                         styles.profileTabTextActive,
//                     ]}
//                   >
//                     {label}
//                   </Text>
//                 </TouchableOpacity>
//               )
//             )}
//           </View>

//           <ScrollView
//             style={styles.profileScroll}
//             contentContainerStyle={
//               styles.profileScrollContent
//             }
//             showsVerticalScrollIndicator={
//               false
//             }
//             nestedScrollEnabled
//             keyboardShouldPersistTaps="handled"
//           >
//             {profileLoading ? (
//               <View
//                 style={
//                   styles.profileLoading
//                 }
//               >
//                 <ActivityIndicator
//                   size="large"
//                   color={
//                     COLORS.primary
//                   }
//                 />

//                 <Text
//                   style={
//                     styles.profileLoadingText
//                   }
//                 >
//                   {tSafe(
//                     'loading_profile_details',
//                     'Loading profile details...'
//                   )}
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 {profileTab ===
//                   'about' && (
//                   <View>
//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'about',
//                         'About'
//                       )}
//                     </Text>

//                     <AboutMeDisplay
//                       mode="display"
//                       aboutme={
//                         profileCleaner.aboutme
//                       }
//                       isHost
//                     />

//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'certification',
//                         'Certification'
//                       )}
//                     </Text>

//                     <HostCertificationDisplay
//                       certification={
//                         certification
//                       }
//                     />

//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'performance',
//                         'Performance'
//                       )}
//                     </Text>

//                     <View
//                       style={
//                         styles.performanceGrid
//                       }
//                     >
//                       <View
//                         style={
//                           styles.performanceItem
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.performanceValue
//                           }
//                         >
//                           {profileCleaner
//                             .performance
//                             ?.performance_score ??
//                             0}
//                         </Text>

//                         <Text
//                           style={
//                             styles.performanceLabel
//                           }
//                         >
//                           {tSafe(
//                             'performance',
//                             'Performance'
//                           )}
//                         </Text>
//                       </View>

//                       <View
//                         style={
//                           styles.performanceItem
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.performanceValue
//                           }
//                         >
//                           {profileCleaner
//                             .ranking_score ??
//                             0}
//                         </Text>

//                         <Text
//                           style={
//                             styles.performanceLabel
//                           }
//                         >
//                           {tSafe(
//                             'ranking',
//                             'Ranking'
//                           )}
//                         </Text>
//                       </View>

//                       <View
//                         style={
//                           styles.performanceItem
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.performanceValue
//                           }
//                         >
//                           {profileCleaner.distance ??
//                             '—'}
//                         </Text>

//                         <Text
//                           style={
//                             styles.performanceLabel
//                           }
//                         >
//                           {tSafe(
//                             'miles_away',
//                             'Miles away'
//                           )}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 )}

//                 {profileTab ===
//                   'availability' && (
//                   <View>
//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'availability',
//                         'Availability'
//                       )}
//                     </Text>

//                     <HostAvailabilityDisplay
//                       availability={
//                         profileAvailability?.availability ||
//                         []
//                       }
//                       bookedSchedules={
//                         profileAvailability?.booked_schedules ||
//                         []
//                       }
//                     />
//                   </View>
//                 )}

//                 {profileTab ===
//                   'reviews' && (
//                   <View>
//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       {tSafe(
//                         'reviews',
//                         'Reviews'
//                       )}
//                     </Text>

//                     <Reviews
//                       ratings={
//                         profileReviews
//                       }
//                       cleanerId={
//                         profileCleaner.cleanerId
//                       }
//                     />
//                   </View>
//                 )}
//               </>
//             )}
//           </ScrollView>

//           <View
//             style={styles.profileFooter}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.profileSelectButton,
//                 (!accepted ||
//                   !cleanerGroup ||
//                   (!selected &&
//                     groupFull)) &&
//                   styles.profileSelectButtonDisabled,
//               ]}
//               disabled={
//                 !accepted ||
//                 !cleanerGroup ||
//                 (!selected &&
//                   groupFull)
//               }
//               onPress={() => {
//                 if (
//                   !accepted ||
//                   !cleanerGroup
//                 ) {
//                   return;
//                 }

//                 toggleCleaner(
//                   profileCleaner.cleanerId
//                 );

//                 closeCleanerProfile();
//               }}
//               activeOpacity={0.85}
//             >
//               <Text
//                 style={
//                   styles.profileSelectButtonText
//                 }
//               >
//                 {selected
//                   ? tSafe(
//                       'remove_from_team',
//                       'Remove from Team'
//                     )
//                   : !cleanerGroup
//                   ? tSafe(
//                       'waiting_for_group',
//                       'Waiting for Group'
//                     )
//                   : groupFull
//                   ? `${groupLabel(
//                       cleanerGroup
//                     )} ${tSafe(
//                       'already_filled',
//                       'Already Filled'
//                     )}`
//                   : tSafe(
//                       'select_cleaner',
//                       'Select Cleaner'
//                     )}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   /*
//    * ============================================================
//    * MAIN SCREEN
//    * ============================================================
//    */

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={
//           false
//         }
//         contentContainerStyle={
//           styles.pageContent
//         }
//       >
//         <View
//           style={styles.header}
//         >
//           <View
//             style={styles.headerText}
//           >
//             <Text
//               style={styles.eyebrow}
//             >
//               {tSafe(
//                 'cleaning_team',
//                 'Cleaning team'
//               )}
//             </Text>

//             <Text
//               style={styles.title}
//             >
//               {tSafe(
//                 'build_your_cleaning_team',
//                 'Build your cleaning team'
//               )}
//             </Text>

//             <Text
//               style={styles.subtitle}
//             >
//               {tSafe(
//                 'choose_cleaners_for_your_team',
//                 'Choose the cleaners you want for this booking.'
//               )}
//             </Text>
//           </View>

//           <View
//             style={styles.selectionCounter}
//           >
//             <Text
//               style={
//                 styles.selectionCounterValue
//               }
//             >
//               {selectedIds.length}
//             </Text>

//             <Text
//               style={
//                 styles.selectionCounterDivider
//               }
//             >
//               /
//             </Text>

//             <Text
//               style={
//                 styles.selectionCounterTotal
//               }
//             >
//               {requiredCleaners}
//             </Text>

//             <Text
//               style={
//                 styles.selectionCounterLabel
//               }
//             >
//               {tSafe(
//                 'selected',
//                 'selected'
//               )}
//             </Text>
//           </View>
//         </View>

//         <View
//           style={styles.propertyContext}
//         >
//           <View
//             style={
//               styles.propertyIconContainer
//             }
//           >
//             <MaterialCommunityIcons
//               name="home-map-marker"
//               size={21}
//               color={
//                 COLORS.primary
//               }
//             />
//           </View>

//           <View
//             style={styles.propertyInfo}
//           >
//             <Text
//               style={styles.propertyEyebrow}
//             >
//               {tSafe(
//                 'property',
//                 'Property'
//               )}
//             </Text>

//             <Text
//               style={styles.propertyName}
//               numberOfLines={1}
//             >
//               {scheduleDetails
//                 ?.apartment_name
//                 ?.trim() ||
//                 scheduleDetails
//                   ?.overall_checklist
//                   ?.apartment_name
//                   ?.trim() ||
//                 tSafe(
//                   'property',
//                   'Property'
//                 )}
//             </Text>

//             {scheduleDetails?.address?.trim() ? (
//               <View
//                 style={
//                   styles.propertyLocationRow
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="map-marker-outline"
//                   size={14}
//                   color={
//                     COLORS.textSecondary
//                   }
//                 />

//                 <Text
//                   style={
//                     styles.propertyLocation
//                   }
//                   numberOfLines={1}
//                 >
//                   {scheduleDetails.address.trim()}
//                 </Text>
//               </View>
//             ) : null}
//           </View>
//         </View>

//         {requiredGroups.length > 0 ? (
//           <View
//             style={
//               styles.groupRequirements
//             }
//           >
//             <View
//               style={
//                 styles.groupRequirementsHeader
//               }
//             >
//               <View
//                 style={
//                   styles.groupRequirementsTitleBlock
//                 }
//               >
//                 <Text
//                   style={
//                     styles.groupRequirementsTitle
//                   }
//                 >
//                   {tSafe(
//                     'team_requirements',
//                     'Team requirements'
//                   )}
//                 </Text>

//                 <Text
//                   style={
//                     styles.groupRequirementsSubtitle
//                   }
//                 >
//                   {tSafe(
//                     'group_requirement_description',
//                     'Each required group needs a cleaner before payment.'
//                   )}
//                 </Text>
//               </View>

//               <View
//                 style={[
//                   styles.completionBadge,
//                   groupCompositionComplete
//                     ? styles.completionBadgeComplete
//                     : styles.completionBadgeIncomplete,
//                 ]}
//               >
//                 <MaterialCommunityIcons
//                   name={
//                     groupCompositionComplete
//                       ? 'check-circle'
//                       : 'alert-circle-outline'
//                   }
//                   size={15}
//                   color={
//                     groupCompositionComplete
//                       ? '#16803C'
//                       : '#9A6700'
//                   }
//                 />

//                 <Text
//                   style={[
//                     styles.completionBadgeText,
//                     groupCompositionComplete
//                       ? styles.completionBadgeTextComplete
//                       : styles.completionBadgeTextIncomplete,
//                   ]}
//                 >
//                   {groupCompositionComplete
//                     ? tSafe(
//                         'complete',
//                         'Complete'
//                       )
//                     : tSafe(
//                         'incomplete',
//                         'Incomplete'
//                       )}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={
//                 styles.groupRequirementsList
//               }
//             >
//               {requiredGroups.map(
//                 (group) => {
//                   const required =
//                     requiredGroupCounts[
//                       group
//                     ] || 0;

//                   const selected =
//                     selectedGroupCounts[
//                       group
//                     ] || 0;

//                   const complete =
//                     selected ===
//                     required;

//                   return (
//                     <View
//                       key={group}
//                       style={
//                         styles.groupRequirementRow
//                       }
//                     >
//                       <View
//                         style={
//                           styles.groupRequirementLeft
//                         }
//                       >
//                         <MaterialCommunityIcons
//                           name={
//                             complete
//                               ? 'check-circle'
//                               : 'circle-outline'
//                           }
//                           size={17}
//                           color={
//                             complete
//                               ? '#16803C'
//                               : '#9A6700'
//                           }
//                         />

//                         <Text
//                           style={
//                             styles.groupRequirementName
//                           }
//                         >
//                           {groupLabel(
//                             group
//                           )}
//                         </Text>
//                       </View>

//                       <Text
//                         style={[
//                           styles.groupRequirementCount,
//                           complete &&
//                             styles.groupRequirementCountComplete,
//                         ]}
//                       >
//                         {selected} /{' '}
//                         {required}
//                       </Text>
//                     </View>
//                   );
//                 }
//               )}
//             </View>
//           </View>
//         ) : null}

//         {acceptedCandidates.length ===
//         0 ? (
//           <View
//             style={
//               styles.selectionEmptyContainer
//             }
//           >
//             <View
//               style={
//                 styles.selectionEmptyIcon
//               }
//             >
//               <MaterialCommunityIcons
//                 name={
//                   pendingCandidates.length >
//                   0
//                     ? 'clock-outline'
//                     : 'account-search-outline'
//                 }
//                 size={30}
//                 color={
//                   COLORS.primary
//                 }
//               />
//             </View>

//             <Text
//               style={
//                 styles.selectionEmptyTitle
//               }
//             >
//               {pendingCandidates.length >
//               0
//                 ? tSafe(
//                     'waiting_for_cleaners',
//                     'Waiting for cleaners to respond'
//                   )
//                 : tSafe(
//                     'no_cleaners_available',
//                     'No cleaners are currently available'
//                   )}
//             </Text>

//             <Text
//               style={
//                 styles.selectionEmptyText
//               }
//             >
//               {pendingCandidates.length >
//               0
//                 ? tSafe(
//                     'cleaners_accepting_will_appear',
//                     'Cleaners who accept the request will appear here and become available for your team selection.'
//                   )
//                 : tSafe(
//                     'no_cleaners_available_description',
//                     'There are currently no cleaners available to select for this cleaning.'
//                   )}
//             </Text>

//             {pendingCandidates.length >
//             0 ? (
//               <View
//                 style={
//                   styles.pendingSummary
//                 }
//               >
//                 <MaterialCommunityIcons
//                   name="clock-outline"
//                   size={16}
//                   color="#9A6700"
//                 />

//                 <Text
//                   style={
//                     styles.pendingSummaryText
//                   }
//                 >
//                   {pendingCandidates.length}{' '}
//                   {pendingCandidates.length ===
//                   1
//                     ? tSafe(
//                         'cleaner_is',
//                         'cleaner is'
//                       )
//                     : tSafe(
//                         'cleaners_are',
//                         'cleaners are'
//                       )}{' '}
//                   {tSafe(
//                     'waiting_for_response',
//                     'waiting for a response'
//                   )}
//                 </Text>
//               </View>
//             ) : null}
//           </View>
//         ) : (
//           <FlatList
//             data={
//               acceptedCandidates
//             }
//             keyExtractor={(item) =>
//               item.cleanerId
//             }
//             renderItem={
//               renderCandidate
//             }
//             scrollEnabled={false}
//             contentContainerStyle={
//               styles.list
//             }
//             showsVerticalScrollIndicator={
//               false
//             }
//             ListHeaderComponent={
//               <View
//                 style={
//                   styles.availableHeader
//                 }
//               >
//                 <View>
//                   <Text
//                     style={
//                       styles.availableTitle
//                     }
//                   >
//                     {tSafe(
//                       'available_cleaners',
//                       'Available cleaners'
//                     )}
//                   </Text>

//                   <Text
//                     style={
//                       styles.availableSubtitle
//                     }
//                   >
//                     {acceptedCandidates.length}{' '}
//                     {acceptedCandidates.length ===
//                     1
//                       ? tSafe(
//                           'cleaner_has_accepted',
//                           'cleaner has accepted the request'
//                         )
//                       : tSafe(
//                           'cleaners_have_accepted',
//                           'cleaners have accepted the request'
//                         )}
//                   </Text>
//                 </View>

//                 {pendingCandidates.length >
//                 0 ? (
//                   <View
//                     style={
//                       styles.waitingBadge
//                     }
//                   >
//                     <MaterialCommunityIcons
//                       name="clock-outline"
//                       size={14}
//                       color="#9A6700"
//                     />

//                     <Text
//                       style={
//                         styles.waitingBadgeText
//                       }
//                     >
//                       {pendingCandidates.length}{' '}
//                       {tSafe(
//                         'waiting',
//                         'waiting'
//                       )}
//                     </Text>
//                   </View>
//                 ) : null}
//               </View>
//             }
//           />
//         )}
//       </ScrollView>

//       <View
//         style={styles.checkoutArea}
//       >
//         {!groupCompositionComplete &&
//         selectedIds.length ===
//           requiredCleaners &&
//         missingGroups.length > 0 ? (
//           <Text
//             style={
//               styles.checkoutWarning
//             }
//           >
//             {`${tSafe(
//               'still_needed',
//               'Still needed'
//             )}: ${missingGroups
//               .map(
//                 (item) =>
//                   `${groupLabel(
//                     item.group
//                   )} (${item.remaining})`
//               )
//               .join(', ')}`}
//           </Text>
//         ) : null}

//         <TouchableOpacity
//           style={[
//             styles.checkoutButton,
//             (!groupCompositionComplete ||
//               selectedIds.length !==
//                 requiredCleaners) &&
//               styles.checkoutButtonDisabled,
//           ]}
//           onPress={
//             proceedToCheckout
//           }
//           disabled={
//             !groupCompositionComplete ||
//             selectedIds.length !==
//               requiredCleaners
//           }
//           activeOpacity={0.85}
//         >
//           <Text
//             style={
//               styles.checkoutButtonText
//             }
//           >
//             {groupCompositionComplete &&
//             selectedIds.length ===
//               requiredCleaners
//               ? tSafe(
//                   'continue_to_payment',
//                   'Continue to Payment'
//                 )
//               : tSafe(
//                   'complete_team_selection',
//                   'Complete team selection to continue'
//                 )}
//           </Text>

//           {groupCompositionComplete &&
//           selectedIds.length ===
//             requiredCleaners ? (
//             <MaterialCommunityIcons
//               name="arrow-right"
//               size={19}
//               color={
//                 COLORS.white
//               }
//               style={
//                 styles.checkoutArrow
//               }
//             />
//           ) : null}
//         </TouchableOpacity>
//       </View>

//       {renderProfileModal()}
//     </View>
//   );
// }

// /*
//  * ============================================================
//  * STYLES
//  * ============================================================
//  */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F6F7F9',
//   },

//   pageContent: {
//     paddingBottom: 130,
//   },

//   /*
//    * HEADER
//    */

//   header: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 22,
//     paddingBottom: 15,
//   },

//   headerText: {
//     flex: 1,
//     paddingRight: 14,
//   },

//   eyebrow: {
//     fontSize: 12,
//     letterSpacing: 0.7,
//     textTransform: 'uppercase',
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginBottom: 5,
//   },

//   title: {
//     fontSize: 23,
//     lineHeight: 29,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   subtitle: {
//     marginTop: 6,
//     fontSize: 13,
//     lineHeight: 19,
//     color: COLORS.textSecondary,
//     maxWidth: 280,
//   },

//   selectionCounter: {
//     minWidth: 66,
//     paddingHorizontal: 9,
//     paddingVertical: 10,
//     borderRadius: 15,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E4E6EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   selectionCounterValue: {
//     fontSize: 19,
//     lineHeight: 21,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   selectionCounterDivider: {
//     position: 'absolute',
//     top: 17,
//     left: 30,
//     fontSize: 12,
//     color: '#A1A5AC',
//   },

//   selectionCounterTotal: {
//     position: 'absolute',
//     top: 17,
//     right: 12,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   selectionCounterLabel: {
//     marginTop: 3,
//     fontSize: 9,
//     color: COLORS.textSecondary,
//     textTransform: 'uppercase',
//     letterSpacing: 0.4,
//   },

//   /*
//    * PROPERTY
//    */

//   propertyContext: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 16,
//     marginBottom: 12,
//     padding: 13,
//     borderRadius: 17,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },

//   propertyIconContainer: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '12',
//     marginRight: 11,
//   },

//   propertyInfo: {
//     flex: 1,
//   },

//   propertyEyebrow: {
//     fontSize: 10,
//     color: COLORS.textSecondary,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 2,
//   },

//   propertyName: {
//     fontSize: 15,
//     color: COLORS.textPrimary,
//     fontWeight: '600',
//   },

//   propertyLocationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   propertyLocation: {
//     flex: 1,
//     marginLeft: 4,
//     fontSize: 12,
//     lineHeight: 17,
//     color: COLORS.textSecondary,
//   },

//   /*
//    * GROUP REQUIREMENTS
//    */

//   groupRequirements: {
//     marginHorizontal: 16,
//     marginBottom: 14,
//     padding: 14,
//     borderRadius: 17,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },

//   groupRequirementsHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//   },

//   groupRequirementsTitleBlock: {
//     flex: 1,
//     paddingRight: 10,
//   },

//   groupRequirementsTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   groupRequirementsSubtitle: {
//     marginTop: 3,
//     fontSize: 11,
//     lineHeight: 16,
//     color: COLORS.textSecondary,
//   },

//   completionBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     borderRadius: 9,
//   },

//   completionBadgeComplete: {
//     backgroundColor: '#EAF7EF',
//   },

//   completionBadgeIncomplete: {
//     backgroundColor: '#FFF7E6',
//   },

//   completionBadgeText: {
//     marginLeft: 4,
//     fontSize: 10,
//     fontWeight: '600',
//   },

//   completionBadgeTextComplete: {
//     color: '#16803C',
//   },

//   completionBadgeTextIncomplete: {
//     color: '#9A6700',
//   },

//   groupRequirementsList: {
//     marginTop: 10,
//   },

//   groupRequirementRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F1F3',
//   },

//   groupRequirementLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   groupRequirementName: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },

//   groupRequirementCount: {
//     fontSize: 12,
//     color: '#9A6700',
//     fontWeight: '600',
//   },

//   groupRequirementCountComplete: {
//     color: '#16803C',
//   },

//   /*
//    * AVAILABLE HEADER
//    */

//   list: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//   },

//   availableHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 11,
//     paddingHorizontal: 2,
//   },

//   availableTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   availableSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   waitingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 9,
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: '#FFF7E6',
//   },

//   waitingBadgeText: {
//     marginLeft: 4,
//     fontSize: 10,
//     color: '#9A6700',
//     fontWeight: '600',
//   },

//   /*
//    * CLEANER CARD
//    */

//   cleanerCard: {
//     marginBottom: 11,
//     padding: 13,
//     borderRadius: 18,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: '#E4E6EB',
//   },

//   cleanerCardSelected: {
//     borderColor: COLORS.primary,
//     backgroundColor:
//       COLORS.primary + '05',
//   },

//   cleanerCardMain: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },

//   /*
//    * AVATAR
//    */

//   avatarWrapper: {
//     position: 'relative',
//     width: 58,
//     height: 58,
//     marginRight: 0,
//   },

//   avatarFallback: {
//     width: 58,
//     height: 58,
//     borderRadius: 29,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   /*
//    * PREMIUM / VERIFIED BADGES
//    */

//   premiumBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#B8860B',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   verifiedBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#4B7BEC',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   avatarCheck: {
//     position: 'absolute',
//     right: -2,
//     bottom: -2,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#16803C',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   trustBadgeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//     minHeight: 20,
//   },
  
//   premiumLabel: {
//     marginLeft: 5,
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#8A6500',
//   },
  
//   verifiedLabel: {
//     marginLeft: 5,
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#4778C7',
//   },
  

//   /*
//    * CLEANER INFO
//    */

//   cleanerMainInfo: {
//     flex: 1,
//     marginLeft: 12,
//     paddingRight: 4,
//   },

//   cleanerNameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   cleanerName: {
//     flex: 1,
//     marginRight: 7,
//     fontSize: 16,
//     lineHeight: 20,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   ratingPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 7,
//     paddingVertical: 4,
//     borderRadius: 8,
//     backgroundColor: '#FFF8E7',
//   },

//   ratingPillText: {
//     marginLeft: 3,
//     fontSize: 11,
//     color: '#765900',
//     fontWeight: '500',
//   },

//   distanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   distanceText: {
//     marginLeft: 3,
//     fontSize: 11,
//     color: COLORS.textSecondary,
//   },

//   cardMetaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },

//   groupPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     borderRadius: 8,
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   groupPillWarning: {
//     backgroundColor: '#FFF7E6',
//   },

//   groupPillText: {
//     marginLeft: 4,
//     fontSize: 10,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   groupPillWarningText: {
//     color: '#9A6700',
//   },

//   performancePill: {
//     marginLeft: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     borderRadius: 8,
//     backgroundColor: '#F3F4F6',
//   },

//   performancePillText: {
//     fontSize: 10,
//     color: COLORS.textSecondary,
//     fontWeight: '500',
//   },

//   recommendationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },

//   recommendationIcon: {
//     width: 22,
//     height: 22,
//     borderRadius: 7,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   recommendationText: {
//     marginLeft: 6,
//     fontSize: 11,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   acceptedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 7,
//   },

//   acceptedText: {
//     marginLeft: 5,
//     fontSize: 11,
//     color: '#16803C',
//     fontWeight: '500',
//   },

//   groupNotice: {
//     marginTop: 5,
//     fontSize: 10,
//     lineHeight: 14,
//     color: '#9A6700',
//   },

//   cardChevron: {
//     width: 25,
//     alignItems: 'flex-end',
//     paddingTop: 2,
//   },

//   selectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 12,
//     height: 40,
//     borderRadius: 11,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.white,
//   },

//   selectButtonSelected: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },

//   selectButtonDisabled: {
//     borderColor: '#D5D7DB',
//     backgroundColor: '#F4F5F6',
//   },

//   selectButtonText: {
//     marginLeft: 5,
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },

//   selectButtonTextSelected: {
//     color: COLORS.white,
//   },

//   selectButtonTextDisabled: {
//     color: '#A5A5A5',
//   },

//   /*
//    * CHECKOUT
//    */

//   checkoutArea: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 18,
//     backgroundColor:
//       'rgba(246,247,249,0.97)',
//     borderTopWidth: 1,
//     borderTopColor: '#E4E6EB',
//   },

//   checkoutWarning: {
//     marginBottom: 8,
//     fontSize: 11,
//     lineHeight: 16,
//     color: '#9A6700',
//     textAlign: 'center',
//   },

//   checkoutButton: {
//     minHeight: 52,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     backgroundColor: COLORS.primary,
//   },

//   checkoutButtonDisabled: {
//     opacity: 0.48,
//   },

//   checkoutButtonText: {
//     color: COLORS.white,
//     fontSize: 15,
//     fontWeight: '600',
//     textAlign: 'center',
//   },

//   checkoutArrow: {
//     marginLeft: 8,
//   },

//   /*
//    * EMPTY / LOADING / ERROR
//    */

//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 28,
//     backgroundColor: '#F6F7F9',
//   },

//   loadingIconContainer: {
//     width: 68,
//     height: 68,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   loadingTitle: {
//     marginTop: 16,
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//   },

//   loadingSubtitle: {
//     marginTop: 6,
//     maxWidth: 290,
//     fontSize: 12,
//     lineHeight: 18,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   errorIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FDECEE',
//     marginBottom: 15,
//   },

//   errorTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: 7,
//   },

//   errorText: {
//     maxWidth: 310,
//     color: COLORS.textSecondary,
//     fontSize: 13,
//     lineHeight: 19,
//     textAlign: 'center',
//     marginBottom: 18,
//   },

//   retryButton: {
//     minWidth: 110,
//     paddingHorizontal: 20,
//     paddingVertical: 11,
//     borderRadius: 10,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//   },

//   retryText: {
//     color: COLORS.white,
//     fontSize: 13,
//     fontWeight: '600',
//   },

//   selectionEmptyContainer: {
//     minHeight: 360,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//     paddingVertical: 40,
//   },

//   selectionEmptyIcon: {
//     width: 66,
//     height: 66,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       COLORS.primary + '10',
//     marginBottom: 16,
//   },

//   selectionEmptyTitle: {
//     fontSize: 17,
//     lineHeight: 22,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: 7,
//   },

//   selectionEmptyText: {
//     maxWidth: 310,
//     fontSize: 13,
//     lineHeight: 19,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   pendingSummary: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 18,
//     paddingHorizontal: 13,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: '#FFF7E6',
//   },

//   pendingSummaryText: {
//     marginLeft: 6,
//     fontSize: 11,
//     color: '#9A6700',
//     fontWeight: '500',
//   },

//   /*
//    * PROFILE MODAL
//    */

//   profileModal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },

//   profileContainer: {
//     height: '92%',
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     overflow: 'hidden',
//   },

//   modalHandle: {
//     alignSelf: 'center',
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#D1D3D6',
//     marginTop: 8,
//     marginBottom: 7,
//   },

//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     paddingHorizontal: 18,
//     paddingVertical: 11,
//   },

//   profileIdentity: {
//     flexDirection: 'row',
//     flex: 1,
//   },

//   profileAvatarWrapper: {
//     position: 'relative',
//     width: 70,
//     height: 70,
//   },

//   profilePremiumBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#B8860B',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   profileVerifiedBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#4B7BEC',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },

//   profileTrustRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   profilePremiumText: {
//     marginLeft: 4,
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#8A6500',
//   },

//   profileVerifiedText: {
//     marginLeft: 4,
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#4778C7',
//   },

//   profileNameContainer: {
//     flex: 1,
//     marginLeft: 13,
//     paddingRight: 5,
//   },

//   profileName: {
//     fontSize: 20,
//     lineHeight: 25,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   profileLocation: {
//     marginTop: 2,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   profileDistanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   profileDistance: {
//     marginLeft: 3,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   profileGroupBadge: {
//     alignSelf: 'flex-start',
//     marginTop: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 7,
//     backgroundColor:
//       COLORS.primary + '10',
//   },

//   profileGroupBadgeText: {
//     fontSize: 10,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },

//   profileRatingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 3,
//   },

//   ratingText: {
//     marginLeft: 5,
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   closeButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F2F3F5',
//   },

//   profileStatus: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 18,
//     marginBottom: 8,
//     paddingHorizontal: 11,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: '#F7F8F9',
//   },

//   profileStatusText: {
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500',
//   },

//   acceptedStatus: {
//     color: '#16803C',
//   },

//   pendingStatus: {
//     color: '#9A6700',
//   },

//   profileTabs: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ECEDEF',
//   },

//   profileTab: {
//     flex: 1,
//     paddingVertical: 13,
//     alignItems: 'center',
//   },

//   profileTabActive: {
//     borderBottomWidth: 2,
//     borderBottomColor: COLORS.primary,
//   },

//   profileTabText: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   profileTabTextActive: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },

//   profileScroll: {
//     flex: 1,
//   },

//   profileScrollContent: {
//     paddingHorizontal: 18,
//     paddingVertical: 15,
//     paddingBottom: 35,
//   },

//   profileLoading: {
//     alignItems: 'center',
//     paddingVertical: 55,
//   },

//   profileLoadingText: {
//     marginTop: 12,
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   sectionTitle: {
//     marginTop: 10,
//     marginBottom: 11,
//     fontSize: 17,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },

//   performanceGrid: {
//     flexDirection: 'row',
//   },

//   performanceItem: {
//     flex: 1,
//     marginRight: 8,
//     paddingVertical: 13,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//     backgroundColor: '#F6F7F9',
//     alignItems: 'center',
//   },

//   performanceValue: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   performanceLabel: {
//     marginTop: 4,
//     fontSize: 10,
//     lineHeight: 14,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },

//   profileFooter: {
//     paddingHorizontal: 18,
//     paddingTop: 11,
//     paddingBottom: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#ECEDEF',
//     backgroundColor: COLORS.white,
//   },

//   profileSelectButton: {
//     minHeight: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 15,
//     borderRadius: 13,
//     backgroundColor: COLORS.primary,
//   },

//   profileSelectButtonDisabled: {
//     opacity: 0.42,
//   },

//   profileSelectButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });






// import React, {
//   useCallback,
//   useMemo,
//   useState,
// } from 'react';

// import {
//   useFocusEffect,
//   useRoute,
// } from '@react-navigation/native';

// import {
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';

// import { Avatar } from 'react-native-paper';
// import Modal from 'react-native-modal';
// import StarRating from 'react-native-star-rating-widget';

// import AboutMeDisplay from '../cleaner/AboutMeDisplay';
// import HostAvailabilityDisplay from '../../components/host/HostAvailabilityDisplay';
// import HostCertificationDisplay from '../../components/host/HostCertificationDisplay';
// import Reviews from '../../components/shared/Reviews';


// export default function HostCleanerRecommendations({
//   navigation,
// }) {
//   const route = useRoute();

//   const {
//     scheduleId,
//     schedule: routeSchedule,
//   } = route?.params || {};

//   const [candidates, setCandidates] = useState([]);
//   const [requiredCleaners, setRequiredCleaners] =
//     useState(0);
//   const [assignedTo, setAssignedTo] = useState([]);
//   const [scheduleDetails, setScheduleDetails] =
//     useState({});
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [acceptedCleanerIds, setAcceptedCleanerIds] =
//     useState(new Set());

//   const [profileCleaner, setProfileCleaner] =
//     useState(null);

//   const [profileVisible, setProfileVisible] =
//     useState(false);

//   const [profileTab, setProfileTab] =
//     useState('about');

//   const [profileAvailability, setProfileAvailability] =
//     useState(null);

//   const [profileReviews, setProfileReviews] =
//     useState([]);

//   const [profileLoading, setProfileLoading] =
//     useState(false);


//   /*
//    * ------------------------------------------------------------
//    * GROUP HELPERS
//    * ------------------------------------------------------------
//    */

//   const getCleanerGroup = useCallback(
//     (cleaner) => {
//       if (!cleaner) {
//         return null;
//       }

//       return (
//         cleaner.group ||
//         cleaner.requestGroup ||
//         cleaner.assignedGroup ||
//         cleaner.request?.group ||
//         null
//       );
//     },
//     []
//   );


//   const requiredGroupCounts = useMemo(() => {
//     return assignedTo.reduce(
//       (counts, position) => {
//         const group = position?.group;

//         if (!group) {
//           return counts;
//         }

//         counts[group] =
//           (counts[group] || 0) + 1;

//         return counts;
//       },
//       {}
//     );
//   }, [assignedTo]);


//   const requiredGroups = useMemo(
//     () => Object.keys(requiredGroupCounts),
//     [requiredGroupCounts]
//   );


//   const selectedGroupCounts = useMemo(() => {
//     return selectedIds.reduce(
//       (counts, cleanerId) => {
//         const cleaner = candidates.find(
//           (candidate) =>
//             candidate.cleanerId === cleanerId
//         );

//         const group =
//           getCleanerGroup(cleaner);

//         if (!group) {
//           return counts;
//         }

//         counts[group] =
//           (counts[group] || 0) + 1;

//         return counts;
//       },
//       {}
//     );
//   }, [
//     selectedIds,
//     candidates,
//     getCleanerGroup,
//   ]);


//   const missingGroups = useMemo(() => {
//     return requiredGroups
//       .map((group) => {
//         const required =
//           requiredGroupCounts[group] || 0;

//         const selected =
//           selectedGroupCounts[group] || 0;

//         return {
//           group,
//           required,
//           selected,
//           remaining: Math.max(
//             0,
//             required - selected
//           ),
//         };
//       })
//       .filter(
//         (item) => item.remaining > 0
//       );
//   }, [
//     requiredGroups,
//     requiredGroupCounts,
//     selectedGroupCounts,
//   ]);


//   const groupCompositionComplete =
//     useMemo(() => {
//       if (!requiredGroups.length) {
//         return false;
//       }

//       return requiredGroups.every(
//         (group) =>
//           (selectedGroupCounts[group] || 0) ===
//           (requiredGroupCounts[group] || 0)
//       );
//     }, [
//       requiredGroups,
//       requiredGroupCounts,
//       selectedGroupCounts,
//     ]);


//   const groupLabel = useCallback(
//     (group) => {
//       if (!group) {
//         return tSafe(
//           'unknown_group',
//           'Unknown group'
//         );
//       }

//       const formattedGroup = group
//         .replace(/^group[_-]?/i, '')
//         .replace(/[_-]+/g, ' ')
//         .replace(/\b\w/g, (letter) =>
//           letter.toUpperCase()
//         );

//       return `${tSafe(
//         'group',
//         'Group'
//       )} ${formattedGroup}`;
//     },
//     []
//   );


//   /*
//    * ------------------------------------------------------------
//    * DATA
//    * ------------------------------------------------------------
//    */

//   const fetchData = useCallback(async () => {
//     if (!scheduleId) {
//       setError(
//         tSafe(
//           'missing_schedule_id',
//           'Missing schedule ID.'
//         )
//       );

//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const [
//         candidateResponse,
//         requestResponse,
//       ] = await Promise.all([
//         userService.getHostCleanerCandidates(
//           scheduleId
//         ),

//         userService.getHostCleaningRequestByScheduleId(
//           scheduleId,
//           moment().format(
//             'YYYY-MM-DD HH:mm:ss'
//           )
//         ),
//       ]);

//       const candidateData =
//         candidateResponse?.data || {};

//       const requestData =
//         requestResponse?.data || [];

//       const requestAssignedTo =
//         requestData?.[0]?.schedule
//           ?.assignedTo || [];

//       const routeAssignedTo =
//         routeSchedule?.assignedTo || [];

//       const initialAssignedTo =
//         requestAssignedTo.length > 0
//           ? requestAssignedTo
//           : routeAssignedTo;


//       /*
//        * Create host-selection requests.
//        */
//       try {
//         await userService.sendHostGroupCleanerRequests(
//           scheduleId
//         );
//       } catch (requestErr) {
//         console.warn(
//           '⚠️ Host group cleaner request skipped:',
//           requestErr?.response?.data?.detail ||
//             requestErr?.message
//         );
//       }


//       /*
//        * Refresh request state.
//        */
//       const refreshedRequestResponse =
//         await userService.getHostCleaningRequestByScheduleId(
//           scheduleId,
//           moment().format(
//             'YYYY-MM-DD HH:mm:ss'
//           )
//         );

//       const refreshedRequestData =
//         refreshedRequestResponse?.data || [];


//       const refreshedRequestAssignedTo =
//         refreshedRequestData?.[0]?.schedule
//           ?.assignedTo || [];

//       const refreshedAssignedTo =
//         refreshedRequestAssignedTo.length > 0
//           ? refreshedRequestAssignedTo
//           : initialAssignedTo;


//       /*
//        * Accepted cleaners.
//        */
//       const acceptedIds = new Set(
//         refreshedRequestData
//           .filter(
//             (request) =>
//               request?.status === 'accepted' &&
//               request?.cleaner?.['_id']
//           )
//           .map(
//             (request) =>
//               request.cleaner['_id']
//           )
//       );

//       setAcceptedCleanerIds(acceptedIds);


//       /*
//        * Schedule details.
//        */
//       const refreshedSchedule =
//         refreshedRequestData?.[0]?.schedule ||
//         routeSchedule ||
//         {};

//       setScheduleDetails(
//         refreshedSchedule
//       );


//       /*
//        * Candidates.
//        */
//       const recommendedCandidates =
//         candidateData.candidates || [];

//       setCandidates(
//         recommendedCandidates
//       );


//       /*
//        * Required team.
//        */
//       setAssignedTo(
//         refreshedAssignedTo
//       );

//       setRequiredCleaners(
//         refreshedAssignedTo.length
//       );


//       /*
//        * Preserve accepted selections.
//        */
//       setSelectedIds((current) =>
//         current.filter(
//           (id) =>
//             acceptedIds.has(id) &&
//             recommendedCandidates.some(
//               (candidate) =>
//                 candidate.cleanerId === id
//             )
//         )
//       );
//     } catch (err) {
//       console.error(
//         '❌ Error loading host cleaner recommendations:',
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           err?.message ||
//           tSafe(
//             'unable_to_load_cleaner_recommendations',
//             'Unable to load cleaner recommendations.'
//           )
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     scheduleId,
//     routeSchedule,
//   ]);


//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//     }, [fetchData])
//   );


//   /*
//    * ------------------------------------------------------------
//    * FILTERED CANDIDATES
//    * ------------------------------------------------------------
//    */

//   const acceptedCandidates =
//     candidates.filter(
//       (candidate) =>
//         acceptedCleanerIds.has(
//           candidate.cleanerId
//         ) ||
//         candidate.requestStatus ===
//           'accepted'
//     );


//   const pendingCandidates =
//     candidates.filter(
//       (candidate) =>
//         candidate.requestStatus ===
//         'pending_acceptance'
//     );


//   /*
//    * ------------------------------------------------------------
//    * SELECTION
//    * ------------------------------------------------------------
//    */

//   const toggleCleaner = (cleanerId) => {
//     const candidate = candidates.find(
//       (item) =>
//         item.cleanerId === cleanerId
//     );

//     const accepted =
//       acceptedCleanerIds.has(
//         cleanerId
//       ) ||
//       candidate?.requestStatus ===
//         'accepted';

//     if (!accepted) {
//       return;
//     }

//     const cleanerGroup =
//       getCleanerGroup(candidate);

//     if (!cleanerGroup) {
//       console.warn(
//         `Cleaner ${cleanerId} has no request group. Selection blocked until the group is known.`
//       );

//       return;
//     }

//     setSelectedIds((current) => {
//       if (current.includes(cleanerId)) {
//         return current.filter(
//           (id) => id !== cleanerId
//         );
//       }

//       if (
//         current.length >=
//         requiredCleaners
//       ) {
//         return current;
//       }

//       const requiredForGroup =
//         requiredGroupCounts[
//           cleanerGroup
//         ] || 0;

//       const alreadySelectedForGroup =
//         current.reduce(
//           (count, selectedId) => {
//             const selectedCleaner =
//               candidates.find(
//                 (item) =>
//                   item.cleanerId ===
//                   selectedId
//               );

//             return (
//               count +
//               (getCleanerGroup(
//                 selectedCleaner
//               ) === cleanerGroup
//                 ? 1
//                 : 0)
//             );
//           },
//           0
//         );

//       if (
//         alreadySelectedForGroup >=
//         requiredForGroup
//       ) {
//         return current;
//       }


