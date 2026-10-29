// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';

// import {
//   MaterialIcons,
//   Feather,
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import { Avatar } from 'react-native-paper';
// import moment from 'moment';

// import {
//   calculateOverallRating,
// } from '../../utils/calculate_overall_rating';

// import userService from '../../services/connection/userService';
// import CleanerBadges from './CleanerBadges';
// import { tSafe } from '../../utils/tSafe';
// import { useTheme } from '../../theme';

// const STATUS_CONFIG = {
//   pending: {
//     label: 'Pending',
//     icon: 'clock-outline',
//     color: 'pending',
//   },
//   notified: {
//     label: 'Invited',
//     icon: 'bell-outline',
//     color: 'info',
//   },
//   accepted: {
//     label: 'Accepted',
//     icon: 'check-circle-outline',
//     color: 'success',
//   },
//   declined: {
//     label: 'Declined',
//     icon: 'close-circle-outline',
//     color: 'error',
//   },
// };

// const CleanerCard = ({
//   item,
//   onPress,
//   onSelect,
//   selected = false,
//   preview_mode = false,
//   cleanerId,
//   status,
// }) => {
//   const { theme } = useTheme();

//   const styles = useMemo(
//     () => createStyles(theme),
//     [theme]
//   );

//   const cleaner = item?.cleaner || item || {};

//   const id =
//     cleaner?._id ||
//     cleaner?.id ||
//     item?.cleanerId ||
//     item?.cleaner_id ||
//     cleanerId;

//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     let active = true;

//     const fetchReviews = async () => {
//       if (!id) {
//         setReviews([]);
//         return;
//       }

//       try {
//         const response =
//           await userService.getCleanerFeedbacks(id);

//         if (!active) return;

//         const data =
//           response?.data?.data ??
//           response?.data ??
//           [];

//         setReviews(Array.isArray(data) ? data : []);
//       } catch (error) {
//         if (__DEV__) {
//           console.warn(
//             'Unable to load cleaner reviews:',
//             error?.message || error
//           );
//         }

//         if (active) {
//           setReviews([]);
//         }
//       }
//     };

//     fetchReviews();

//     return () => {
//       active = false;
//     };
//   }, [id]);

//   const firstname =
//     cleaner?.firstname ||
//     tSafe('unknown', 'Unknown');

//   const lastname =
//     cleaner?.lastname || '';

//   const displayName = lastname
//     ? `${firstname} ${lastname.charAt(0).toUpperCase()}.`
//     : firstname;

//   const location = cleaner?.location || {};

//   const city =
//     location?.city ||
//     tSafe('location_unknown', 'Location unknown');

//   const regionCode =
//     location?.region_code ||
//     location?.regionCode ||
//     '';

//   const avatar = cleaner?.avatar;

//   const verified = Boolean(
//     cleaner?.identity_verified
//   );

//   const certified =
//     Number(cleaner?.certification) > 0;

//   const jobsCompleted = Number(
//     cleaner?.performance?.jobs_completed ??
//     cleaner?.calculated_performance?.jobs_completed ??
//     0
//   ) || 0;

//   const rawDistance =
//     item?.distanceFromApartment ??
//     item?.distance_miles ??
//     cleaner?.distance_miles;

//   const distanceNumber =
//     rawDistance !== null &&
//     rawDistance !== undefined &&
//     rawDistance !== '' &&
//     Number.isFinite(Number(rawDistance))
//       ? Number(rawDistance)
//       : null;

//   const distanceLabel =
//     distanceNumber !== null && distanceNumber >= 0
//       ? `${distanceNumber.toFixed(1)} mi`
//       : null;

//   const rating = useMemo(() => {
//     if (!id) return null;

//     try {
//       const value = calculateOverallRating(
//         reviews,
//         id
//       );

//       if (
//         value === null ||
//         value === undefined ||
//         value === ''
//       ) {
//         return null;
//       }

//       const number = Number(value);

//       return Number.isFinite(number)
//         ? number
//         : null;
//     } catch {
//       return null;
//     }
//   }, [reviews, id]);

//   const statusKey = String(status || '')
//     .trim()
//     .toLowerCase()
//     .replace(/[\s-]+/g, '_');

//   const statusDefinition =
//     STATUS_CONFIG[statusKey];

//   const statusColor = statusDefinition
//     ? theme.status?.[statusDefinition.color] ||
//       theme.text.secondary
//     : theme.text.muted;

//   const statusConfig = status
//     ? {
//         label:
//           statusDefinition?.label || status,
//         icon:
//           statusDefinition?.icon ||
//           'information-outline',
//         color: statusColor,
//         background: `${statusColor}18`,
//       }
//     : null;

//   const badges = Array.isArray(cleaner?.badges)
//     ? cleaner.badges
//     : ['Fast Responder', '100% Reliable'];

//   const handlePress = useCallback(() => {
//     if (onSelect) {
//       onSelect();
//       return;
//     }

//     onPress?.();
//   }, [onSelect, onPress]);

//   return (
//     <TouchableOpacity
//       style={[
//         styles.card,
//         preview_mode && styles.previewCard,
//         selected && styles.selectedCard,
//       ]}
//       onPress={handlePress}
//       activeOpacity={0.85}
//       accessibilityRole="button"
//       accessibilityLabel={`${displayName}${
//         rating !== null
//           ? `, rating ${rating.toFixed(1)}`
//           : ''
//       }${distanceLabel ? `, ${distanceLabel} away` : ''}`}
//       accessibilityState={{ selected }}
//     >
//       {/* Cleaner identity */}

//       <View style={styles.header}>
//         <View style={styles.avatarWrapper}>
//           {avatar ? (
//             <Avatar.Image
//               source={{ uri: avatar }}
//               size={52}
//               style={styles.avatar}
//             />
//           ) : (
//             <Avatar.Text
//               size={52}
//               label={`${firstname.charAt(0)}${lastname.charAt(0)}`}
//               style={styles.avatarPlaceholder}
//               labelStyle={styles.avatarInitials}
//             />
//           )}

//           {verified && (
//             <View style={styles.verifiedIcon}>
//               <MaterialIcons
//                 name="verified"
//                 size={17}
//                 color={theme.status.success}
//               />
//             </View>
//           )}
//         </View>

//         <View style={styles.identity}>
//           <View style={styles.nameRow}>
//             <Text
//               style={styles.name}
//               numberOfLines={1}
//             >
//               {displayName}
//             </Text>

//             {certified && (
//               <MaterialIcons
//                 name="workspace-premium"
//                 size={17}
//                 color={theme.brand.primary}
//                 style={styles.certifiedIcon}
//               />
//             )}
//           </View>

//           <View style={styles.locationRow}>
//             <Feather
//               name="map-pin"
//               size={12}
//               color={theme.icon.muted}
//             />

//             <Text
//               style={styles.location}
//               numberOfLines={1}
//             >
//               {city}
//               {regionCode ? `, ${regionCode}` : ''}
//             </Text>
//           </View>

//           <View style={styles.statsRow}>
//             <View style={styles.rating}>
//               <MaterialIcons
//                 name="star"
//                 size={15}
//                 color={theme.status.warning}
//               />

//               <Text style={styles.ratingText}>
//                 {rating !== null
//                   ? rating.toFixed(1)
//                   : 'New'}
//               </Text>
//             </View>

//             <View style={styles.dot} />

//             <Text style={styles.jobsText}>
//               {jobsCompleted.toLocaleString()} jobs
//             </Text>
//           </View>
//         </View>

//         {/* Distance and selection */}

//         <View style={styles.trailing}>
//           {selected ? (
//             <View style={styles.selectedIcon}>
//               <MaterialIcons
//                 name="check"
//                 size={17}
//                 color={theme.text.inverse}
//               />
//             </View>
//           ) : distanceLabel ? (
//             <View style={styles.distanceBadge}>
//               <Feather
//                 name="navigation"
//                 size={12}
//                 color={theme.brand.primary}
//               />

//               <Text style={styles.distanceText}>
//                 {distanceLabel}
//               </Text>
//             </View>
//           ) : null}
//         </View>
//       </View>

//       {/* Optional status */}

//       {statusConfig && (
//         <View style={styles.statusRow}>
//           <View
//             style={[
//               styles.statusBadge,
//               {
//                 backgroundColor:
//                   statusConfig.background,
//               },
//             ]}
//           >
//             <MaterialCommunityIcons
//               name={statusConfig.icon}
//               size={14}
//               color={statusConfig.color}
//             />

//             <Text
//               style={[
//                 styles.statusText,
//                 { color: statusConfig.color },
//               ]}
//             >
//               {statusConfig.label}
//             </Text>
//           </View>
//         </View>
//       )}

//       {/* Optional highlights */}

//       {badges.length > 0 && !preview_mode && (
//         <View style={styles.badgesContainer}>
//           <CleanerBadges badges={badges} />
//         </View>
//       )}

//       {/* Compact footer */}

//       {!preview_mode && (
//         <View style={styles.footer}>
//           <Text style={styles.footerText}>
//             {verified
//               ? 'Identity verified'
//               : tSafe('view_profile', 'View profile')}
//           </Text>

//           <View style={styles.footerAction}>
//             <Text style={styles.footerActionText}>
//               {selected ? 'Selected' : 'View profile'}
//             </Text>

//             <Feather
//               name="chevron-right"
//               size={17}
//               color={theme.brand.primary}
//             />
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// const createStyles = (theme) =>
//   StyleSheet.create({
//     card: {
//       backgroundColor: theme.card.background,
//       borderWidth: 1,
//       borderColor: theme.card.border,
//       borderRadius: 16,
//       padding: 14,
//       marginHorizontal: 8,
//       marginVertical: 5,
//       shadowColor: theme.shadow?.color || '#000',
//       shadowOpacity: theme.shadow?.opacity ?? 0.05,
//       shadowRadius: 6,
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       elevation: 2,
//     },

//     previewCard: {
//       marginVertical: 0,
//       marginHorizontal: 0,
//       paddingHorizontal: 10,
//       borderRadius: 0,
//       borderWidth: 0,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.divider,
//       elevation: 0,
//       shadowOpacity: 0,
//     },

//     selectedCard: {
//       borderColor: theme.status.success,
//       borderWidth: 1.5,
//       backgroundColor: theme.surface.selected,
//     },

//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     avatarWrapper: {
//       position: 'relative',
//       marginRight: 12,
//     },

//     avatar: {
//       backgroundColor: theme.background.sunken,
//     },

//     avatarPlaceholder: {
//       backgroundColor: theme.brand.secondary,
//     },

//     avatarInitials: {
//       color: theme.text.inverse,
//       fontWeight: '700',
//       fontSize: 17,
//     },

//     verifiedIcon: {
//       position: 'absolute',
//       right: -4,
//       bottom: -3,
//       backgroundColor: theme.card.background,
//       borderRadius: 10,
//     },

//     identity: {
//       flex: 1,
//       minWidth: 0,
//     },

//     nameRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     name: {
//       flexShrink: 1,
//       fontSize: 15,
//       fontWeight: '700',
//       color: theme.text.primary,
//     },

//     certifiedIcon: {
//       marginLeft: 5,
//     },

//     locationRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 4,
//     },

//     location: {
//       flex: 1,
//       marginLeft: 4,
//       fontSize: 11,
//       color: theme.text.secondary,
//     },

//     statsRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 6,
//     },

//     rating: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     ratingText: {
//       marginLeft: 3,
//       fontSize: 12,
//       fontWeight: '700',
//       color: theme.text.primary,
//     },

//     dot: {
//       width: 3,
//       height: 3,
//       borderRadius: 2,
//       marginHorizontal: 8,
//       backgroundColor: theme.text.muted,
//     },

//     jobsText: {
//       fontSize: 11,
//       color: theme.text.secondary,
//     },

//     trailing: {
//       alignItems: 'flex-end',
//       justifyContent: 'flex-start',
//       alignSelf: 'stretch',
//       marginLeft: 6,
//     },

//     distanceBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 8,
//       paddingVertical: 6,
//       borderRadius: 9,
//       backgroundColor: theme.brand.primaryLight,
//     },

//     distanceText: {
//       marginLeft: 4,
//       fontSize: 11,
//       fontWeight: '700',
//       color: theme.brand.primary,
//     },

//     selectedIcon: {
//       width: 27,
//       height: 27,
//       borderRadius: 14,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.status.success,
//     },

//     statusRow: {
//       flexDirection: 'row',
//       marginTop: 11,
//     },

//     statusBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 9,
//       paddingVertical: 5,
//       borderRadius: 20,
//     },

//     statusText: {
//       marginLeft: 5,
//       fontSize: 10,
//       fontWeight: '700',
//     },

//     badgesContainer: {
//       marginTop: 10,
//     },

//     footer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginTop: 11,
//       paddingTop: 9,
//       borderTopWidth: 1,
//       borderTopColor: theme.divider,
//     },

//     footerText: {
//       flexShrink: 1,
//       fontSize: 10,
//       color: theme.text.muted,
//     },

//     footerAction: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginLeft: 8,
//     },

//     footerActionText: {
//       fontSize: 11,
//       fontWeight: '700',
//       color: theme.brand.primary,
//     },
//   });

// export default memo(CleanerCard);






import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import moment from 'moment';
import { Avatar } from 'react-native-paper';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import userService from '../../services/connection/userService';
import CleanerBadges from './CleanerBadges';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';

const CleanerCard = ({
  item,
  onPress,
  onSelect,
  selected = false,
  preview_mode,
  cleanerId,
  status,
}) => {
  const cleaner = item?.cleaner || item;

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (cleaner?._id) {
      fetchCleanerFeedbacks();
    }
  }, [cleaner?._id]);

  const fetchCleanerFeedbacks = async () => {
    try {
      const response = await userService.getCleanerFeedbacks(
        cleaner._id
      );

      setReviews(response?.data?.data || []);
    } catch (error) {
      console.error(
        'Error fetching feedbacks:',
        error
      );
    }
  };

  const formatName = (name) =>
    name ? name.charAt(0).toUpperCase() : '';

  const location = cleaner?.location || {};

  const city =
    location.city ||
    tSafe('location_unknown', 'Location unknown');

  const regionCode = location.region_code || '';

  const rawDistance =
    item?.distanceFromApartment ??
    cleaner?.distance_miles;

  const distance =
    rawDistance !== undefined &&
    rawDistance !== null &&
    rawDistance !== ''
      ? Number.isFinite(Number(rawDistance))
        ? `${Number(rawDistance).toFixed(1)}`
        : rawDistance
      : '—';

  const firstname =
    cleaner?.firstname ||
    tSafe('unknown', 'Unknown');

  const lastname = cleaner?.lastname || '';

  const createdAt = cleaner?.created_at;

  const certification = cleaner?.certification;

  const identityVerified =
    cleaner?.identity_verified;

  const jobsCompleted =
    cleaner?.performance?.jobs_completed || 0;

  const avatar = cleaner?.avatar;

  /*
   * Keep the existing badge data structure.
   * This can later be replaced by badges returned
   * directly from the backend.
   */
  const badges = {
    badges: [
      'Fast Responder',
      '100% Reliable',
    ],
  };

  // -----------------------------------------
  // Performance
  // -----------------------------------------

  const performance =
    cleaner?.calculated_performance || {};

  const penaltyImpacts =
    cleaner?.effective_penalty_impacts || {};

  const reliabilityImpact =
    Number(penaltyImpacts.reliability) || 0;

  const hasReliabilityPenalty =
    reliabilityImpact < 0;

  const cancellationRate =
    performance.cancellation_rate != null
      ? `${(
          Number(performance.cancellation_rate) * 100
        ).toFixed(0)}%`
      : '—';

  const avgResponseSeconds =
    Number(
      performance.average_response_time_seconds
    ) || 0;

  const avgResponseMinutes =
    avgResponseSeconds > 0
      ? `${Math.round(
          avgResponseSeconds / 60
        )}m`
      : '—';

  // -----------------------------------------
  // Rating
  // -----------------------------------------

  const calculatedRating =
    calculateOverallRating(
      reviews,
      cleaner?._id
    );

  const rating =
    calculatedRating !== undefined &&
    calculatedRating !== null &&
    calculatedRating !== ''
      ? calculatedRating
      : '—';

  // -----------------------------------------
  // Status
  // -----------------------------------------

  const getStatusConfig = () => {
    const configs = {
      pending: {
        label: 'Pending',
        color: theme.status.pending,
        background: theme.status.pending + '18',
        icon: 'clock-outline',
      },

      notified: {
        label: 'Notified',
        color: theme.status.info,
        background: theme.status.info + '18',
        icon: 'bell-outline',
      },

      accepted: {
        label: 'Accepted',
        color: theme.status.success,
        background: theme.status.success + '18',
        icon: 'check-circle-outline',
      },

      declined: {
        label: 'Declined',
        color: theme.status.error,
        background: theme.status.error + '18',
        icon: 'close-circle-outline',
      },
    };

    return (
      configs[status] || {
        label: status || 'Unknown',
        color: theme.text.muted,
        background: theme.background.sunken,
        icon: 'information-outline',
      }
    );
  };

  const statusConfig = status
    ? getStatusConfig()
    : null;

  // -----------------------------------------
  // Member Since
  // -----------------------------------------

  const memberSince = createdAt
    ? moment(
        createdAt,
        'DD-MM-YYYY HH:mm:ss'
      ).isValid()
      ? moment(
          createdAt,
          'DD-MM-YYYY HH:mm:ss'
        ).format('MMM YYYY')
      : moment(createdAt).isValid()
      ? moment(createdAt).format('MMM YYYY')
      : tSafe('unknown', 'Unknown')
    : tSafe('unknown', 'Unknown');

  // -----------------------------------------
  // Press Handler
  // -----------------------------------------

  const handlePress = () => {
    if (onSelect) {
      onSelect();
      return;
    }

    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        preview_mode
          ? styles.cardPreview
          : styles.card,
        selected && styles.selectedCard,
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* ----------------------------------- */}
      {/* Selected Indicator */}
      {/* ----------------------------------- */}

      {selected && (
        <View style={styles.selectedIndicator}>
          <MaterialIcons
            name="check"
            size={15}
            color={theme.text.inverse}
          />
        </View>
      )}

      {/* ----------------------------------- */}
      {/* Header */}
      {/* ----------------------------------- */}

      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Avatar.Image
              source={{ uri: avatar }}
              size={58}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={58}
              icon="account"
              style={styles.avatarPlaceholder}
              color={theme.icon.inverse}
            />
          )}

          {identityVerified && (
            <View
              style={styles.verifiedBadge}
            >
              <MaterialIcons
                name="verified"
                size={17}
                color={theme.status.success}
              />
            </View>
          )}
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {firstname} {formatName(lastname)}
            </Text>

            {certification > 0 && (
              <View style={styles.certifiedBadge}>
                <Feather
                  name="award"
                  size={13}
                  color={theme.brand.primary}
                />

                <Text
                  style={styles.certifiedText}
                >
                  {tSafe(
                    'certified',
                    'Certified'
                  )}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={13}
              color={theme.icon.muted}
            />

            <Text
              style={styles.locationText}
              numberOfLines={1}
            >
              {city}
              {regionCode
                ? `, ${regionCode}`
                : ''}
            </Text>
          </View>

          <View style={styles.distanceRow}>
            <MaterialIcons
              name="near-me"
              size={13}
              color={theme.brand.primary}
            />

            <Text style={styles.distanceText}>
              {distance}{' '}
              {tSafe(
                'miles_away',
                'miles away'
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* ----------------------------------- */}
      {/* Rating / Member / Jobs */}
      {/* ----------------------------------- */}

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <MaterialIcons
            name="star"
            size={18}
            color={theme.status.warning}
          />

          <Text style={styles.summaryValue}>
            {rating}
          </Text>

          <Text style={styles.summaryLabel}>
            {tSafe('rating', 'rating')}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Feather
            name="calendar"
            size={16}
            color={theme.brand.primary}
          />

          <View>
            <Text style={styles.summaryValue}>
              {memberSince}
            </Text>

            <Text style={styles.summaryLabel}>
              {tSafe(
                'member_since',
                'Member since'
              )}
            </Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Feather
            name="check-circle"
            size={16}
            color={theme.status.success}
          />

          <View>
            <Text style={styles.summaryValue}>
              {jobsCompleted}
            </Text>

            <Text style={styles.summaryLabel}>
              {tSafe('jobs', 'jobs')}
            </Text>
          </View>
        </View>
      </View>

      {/* ----------------------------------- */}
      {/* Status */}
      {/* ----------------------------------- */}

      {statusConfig && (
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusConfig.background,
            },
          ]}
        >
          <MaterialCommunityIcon
            name={statusConfig.icon}
            size={15}
            color={statusConfig.color}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: statusConfig.color,
              },
            ]}
          >
            {statusConfig.label}
          </Text>
        </View>
      )}

      {/* ----------------------------------- */}
      {/* Performance */}
      {/* ----------------------------------- */}

      {(performance.jobs_completed != null ||
        cancellationRate !== '—' ||
        avgResponseMinutes !== '—' ||
        hasReliabilityPenalty) && (
        <View style={styles.performanceContainer}>
          <View style={styles.performanceHeader}>
            <View style={styles.performanceTitleRow}>
              <MaterialIcons
                name="insights"
                size={16}
                color={theme.brand.primary}
              />

              <Text
                style={styles.performanceLabel}
              >
                {tSafe(
                  'performance',
                  'Performance'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.performanceStats}>
            {performance.jobs_completed !=
              null && (
              <PerformanceMetric
                icon="check-circle"
                iconColor={theme.status.success}
                value={
                  performance.jobs_completed
                }
                label={tSafe(
                  'done',
                  'done'
                )}
                styles={styles}
              />
            )}

            {cancellationRate !== '—' && (
              <PerformanceMetric
                icon="x-circle"
                iconColor={theme.status.error}
                value={cancellationRate}
                label={tSafe(
                  'cancelled',
                  'cancelled'
                )}
                styles={styles}
              />
            )}

            {avgResponseMinutes !== '—' && (
              <PerformanceMetric
                icon="clock"
                iconColor={theme.status.info}
                value={avgResponseMinutes}
                label={tSafe(
                  'avg_response',
                  'avg response'
                )}
                styles={styles}
              />
            )}
          </View>

          {hasReliabilityPenalty && (
            <View style={styles.penaltyItem}>
              <Feather
                name="alert-triangle"
                size={15}
                color={theme.status.error}
              />

              <Text style={styles.penaltyText}>
                {tSafe(
                  'reliability_penalty',
                  'Reliability penalty'
                )}
                : {reliabilityImpact.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ----------------------------------- */}
      {/* Cleaner Badges */}
      {/* ----------------------------------- */}

      {badges?.badges?.length > 0 && (
        <View style={styles.badgesContainer}>
          <CleanerBadges
            badges={badges.badges}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Small reusable performance metric.
 */
const PerformanceMetric = ({
  icon,
  iconColor,
  value,
  label,
  styles,
}) => {
  return (
    <View style={styles.performanceItem}>
      <Feather
        name={icon}
        size={14}
        color={iconColor}
      />

      <Text style={styles.performanceValue}>
        {value}
      </Text>

      <Text style={styles.performanceText}>
        {label}
      </Text>
    </View>
  );
};

const MaterialCommunityIcon = ({
  name,
  size,
  color,
}) => {
  /*
   * MaterialCommunityIcons is intentionally
   * loaded lazily through the existing Expo
   * icon package.
   *
   * This wrapper keeps status rendering isolated.
   */
  const {
    MaterialCommunityIcons,
  } = require('@expo/vector-icons');

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
    />
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    // ---------------------------------------
    // Card
    // ---------------------------------------

    card: {
      position: 'relative',
      backgroundColor:
        theme.card.background,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.card.border,
      shadowColor:
        theme.shadow?.color || '#000000',
      shadowOpacity:
        theme.shadow?.opacity || 0.08,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },

    cardPreview: {
      position: 'relative',
      backgroundColor:
        theme.card.background,
      padding: 16,
      marginHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    selectedCard: {
      borderColor:
        theme.status.success,
      borderWidth: 2,
      backgroundColor:
        theme.surface.selected,
    },

    selectedIndicator: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor:
        theme.status.success,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },

    // ---------------------------------------
    // Header
    // ---------------------------------------

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    avatarWrapper: {
      position: 'relative',
      marginRight: 13,
    },

    avatar: {
      backgroundColor:
        theme.background.sunken,
    },

    avatarPlaceholder: {
      backgroundColor:
        theme.brand.secondary,
    },

    verifiedBadge: {
      position: 'absolute',
      right: -2,
      bottom: -1,
      width: 21,
      height: 21,
      borderRadius: 11,
      backgroundColor:
        theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
    },

    identity: {
      flex: 1,
      minWidth: 0,
    },

    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingRight: 25,
    },

    name: {
      flexShrink: 1,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '700',
      color: theme.text.primary,
    },

    certifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 7,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor:
        theme.brand.primaryLight,
    },

    certifiedText: {
      marginLeft: 3,
      fontSize: 10,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },

    locationText: {
      flex: 1,
      marginLeft: 5,
      fontSize: 12,
      color: theme.text.secondary,
    },

    distanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },

    distanceText: {
      marginLeft: 5,
      fontSize: 11,
      fontWeight: '600',
      color: theme.brand.primary,
    },

    // ---------------------------------------
    // Summary
    // ---------------------------------------

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginBottom: 10,
    },

    summaryItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
    },

    summaryValue: {
      marginLeft: 5,
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.primary,
    },

    summaryLabel: {
      marginLeft: 4,
      fontSize: 10,
      color: theme.text.muted,
    },

    summaryDivider: {
      width: 1,
      height: 25,
      backgroundColor:
        theme.divider,
      marginHorizontal: 4,
    },

    // ---------------------------------------
    // Status
    // ---------------------------------------

    statusBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 10,
    },

    statusText: {
      marginLeft: 5,
      fontSize: 11,
      fontWeight: '700',
    },

    // ---------------------------------------
    // Performance
    // ---------------------------------------

    performanceContainer: {
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      paddingTop: 11,
      marginTop: 2,
    },

    performanceHeader: {
      marginBottom: 8,
    },

    performanceTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    performanceLabel: {
      marginLeft: 6,
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },

    performanceStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
    },

    performanceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
    },

    performanceValue: {
      marginLeft: 5,
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.primary,
    },

    performanceText: {
      marginLeft: 3,
      fontSize: 11,
      color: theme.text.secondary,
    },

    penaltyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor:
        theme.status.error + '14',
      borderWidth: 1,
      borderColor:
        theme.status.error + '30',
    },

    penaltyText: {
      marginLeft: 6,
      fontSize: 11,
      fontWeight: '600',
      color: theme.status.error,
    },

    // ---------------------------------------
    // Cleaner Badges
    // ---------------------------------------

    badgesContainer: {
      marginTop: 10,
    },
  });

export default CleanerCard;