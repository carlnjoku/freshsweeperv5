import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

import calculateDistance from '../../utils/calculateDistance';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';
import { AppText, AppCard } from '../../ui';

const { width } = Dimensions.get('window');

const NewlyPublishedSchedule = ({
  schedule = [],
  pendingCount = 0,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  /*
   * Keep existing business logic:
   * upcoming schedules are excluded because they
   * should not appear in newly published requests.
   */
  const activeSchedules = schedule.filter(
    (item) => item.status !== 'upcoming'
  );

  /*
   * Group cleaner requests by schedule.
   */
  const groupedSchedules = activeSchedules.reduce(
    (acc, current) => {
      const existing = acc.find(
        (item) =>
          item.scheduleId === current.scheduleId
      );

      const apartmentCoords = current.schedule;
      const cleanerCoords =
        current.cleaner?.location;

      const distance = calculateDistance(
        apartmentCoords?.schedule
          ?.apartment_latitude,
        apartmentCoords?.schedule
          ?.apartment_longitude,
        cleanerCoords?.latitude,
        cleanerCoords?.longitude
      );

      if (existing) {
        existing.totalRequests++;

        if (
          current.status === 'pending_payment'
        ) {
          existing.accepted++;
        }

        if (
          current.status === 'declined'
        ) {
          existing.declined++;
        }

        if (
          current.cleaner &&
          !existing.cleaners.some(
            (c) =>
              c._id === current.cleaner._id
          )
        ) {
          existing.cleaners.push({
            ...current.cleaner,
            distance: `${distance}`,
          });
        }
      } else {
        acc.push({
          scheduleId: current.scheduleId,
          cleaning_date:
            current.cleaning_date,
          cleaning_time:
            current.cleaning_time,
          requestId: current._id,

          cleaners: current.cleaner
            ? [
                {
                  ...current.cleaner,
                  distance: `${distance}`,
                },
              ]
            : [],

          scheduleDetails: {
            ...current.schedule,
            apartment_location: {
              lat:
                apartmentCoords?.apartment_latitude,
              lng:
                apartmentCoords?.apartment_longitude,
            },
          },

          totalRequests: 1,

          accepted:
            current.status ===
            'pending_payment'
              ? 1
              : 0,

          declined:
            current.status === 'declined'
              ? 1
              : 0,
        });
      }

      return acc;
    },
    []
  );

  /*
   * Keep nearest cleaners first.
   */
  groupedSchedules.forEach((group) => {
    group.cleaners.sort(
      (a, b) =>
        parseFloat(a.distance) -
        parseFloat(b.distance)
    );
  });

  const getPendingCount = (item) => {
    return Math.max(
      0,
      item.totalRequests -
        (item.accepted + item.declined)
    );
  };

  const getAcceptancePercentage = (item) => {
    if (!item.totalRequests) return 0;

    return Math.round(
      (item.accepted /
        item.totalRequests) *
        100
    );
  };

  const navigateToCleaners = (item) => {
    navigation.navigate(
      ROUTES.host_recommended_cleaners,
      {
        scheduleId:
          item.scheduleDetails._id,

        schedule:
          item.scheduleDetails.schedule,

        cleaner: item.cleaners,

        requestId: item.requestId,
      }
    );
  };

  const renderSchedule = ({ item }) => {
    const pending = getPendingCount(item);

    const acceptancePercentage =
      getAcceptancePercentage(item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigateToCleaners(item)
        }
        style={styles.cardWrapper}
      >
        <AppCard
          padding="medium"
          radius="large"
          bordered
          elevated
          style={styles.card}
        >
          {/* -------------------------------- */}
          {/* HEADER */}
          {/* -------------------------------- */}

          <View style={styles.headerRow}>
            <View
              style={styles.propertyIcon}
            >
              <MaterialCommunityIcons
                name="home-outline"
                size={19}
                color={theme.brand.primary}
              />
            </View>

            <View
              style={
                styles.propertyInfo
              }
            >
              <AppText
                variant="bodyMedium"
                numberOfLines={1}
                style={styles.propertyName}
              >
                {
                  item?.scheduleDetails
                    ?.schedule
                    ?.apartment_name
                }
              </AppText>

              <AppText
                variant="caption"
                numberOfLines={1}
                style={styles.address}
              >
                {
                  item?.scheduleDetails
                    ?.schedule?.address
                }
              </AppText>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.icon.muted}
            />
          </View>

          {/* -------------------------------- */}
          {/* DATE / TIME */}
          {/* -------------------------------- */}

          <View
            style={styles.scheduleMeta}
          >
            <View
              style={styles.metaItem}
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={16}
                color={theme.icon.active}
              />

              <AppText
                variant="caption"
                style={styles.metaText}
              >
                {moment(
                  item.cleaning_date
                ).format('ddd, MMM D')}
              </AppText>
            </View>

            <View
              style={styles.metaDivider}
            />

            <View
              style={styles.metaItem}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={theme.icon.active}
              />

              <AppText
                variant="caption"
                style={styles.metaText}
              >
                {moment(
                  item.cleaning_time,
                  'h:mm:ss A'
                ).format('h:mm A')}
              </AppText>
            </View>
          </View>

          {/* -------------------------------- */}
          {/* RESPONSE SUMMARY */}
          {/* -------------------------------- */}

          <View
            style={styles.responseHeader}
          >
            <AppText
              variant="caption"
              style={styles.responseTitle}
            >
              {tSafe(
                'response_status',
                'Response Status'
              )}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.muted}
            >
              {item.totalRequests}{' '}
              {item.totalRequests === 1
                ? tSafe(
                    'request_singular',
                    'request'
                  )
                : tSafe(
                    'requests_plural',
                    'requests'
                  )}
            </AppText>
          </View>

          {/* -------------------------------- */}
          {/* COMPACT STATUS ROW */}
          {/* -------------------------------- */}

          <View
            style={styles.statusRow}
          >
            {/* Accepted */}
            <View
              style={[
                styles.statusItem,
                styles.acceptedItem,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      theme.status.success,
                  },
                ]}
              />

              <AppText
                variant="caption"
                style={
                  styles.statusCount
                }
              >
                {item.accepted}
              </AppText>

              <AppText
                variant="caption"
                style={styles.statusLabel}
              >
                {tSafe(
                  'accepted_dashboard',
                  'Accepted'
                )}
              </AppText>
            </View>

            {/* Pending */}
            <View
              style={[
                styles.statusItem,
                styles.pendingItem,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      theme.status.pending,
                  },
                ]}
              />

              <AppText
                variant="caption"
                style={
                  styles.statusCount
                }
              >
                {pending}
              </AppText>

              <AppText
                variant="caption"
                style={styles.statusLabel}
              >
                {tSafe(
                  'pending_dashboard',
                  'Pending'
                )}
              </AppText>
            </View>

            {/* Declined */}
            <View
              style={[
                styles.statusItem,
                styles.declinedItem,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      theme.status.error,
                  },
                ]}
              />

              <AppText
                variant="caption"
                style={
                  styles.statusCount
                }
              >
                {item.declined}
              </AppText>

              <AppText
                variant="caption"
                style={styles.statusLabel}
              >
                {tSafe(
                  'declined_dashboard',
                  'Declined'
                )}
              </AppText>
            </View>
          </View>

          {/* -------------------------------- */}
          {/* RESPONSE PROGRESS */}
          {/* -------------------------------- */}

          <View
            style={styles.progressSection}
          >
            <View
              style={
                styles.progressTrack
              }
            >
              <View
                style={[
                  styles.progressAccepted,
                  {
                    width: `${acceptancePercentage}%`,
                  },
                ]}
              />
            </View>

            <AppText
              variant="caption"
              style={styles.progressText}
            >
              {acceptancePercentage}%{' '}
              {tSafe(
                'accepted',
                'accepted'
              )}
            </AppText>
          </View>

          {/* -------------------------------- */}
          {/* ACTION */}
          {/* -------------------------------- */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              navigateToCleaners(item)
            }
            style={styles.viewButton}
          >
            <AppText
              variant="label"
              color={
                theme.button
                  .primaryBackground
              }
              style={styles.viewButtonText}
            >
              {tSafe(
                'view_details',
                'View Details'
              )}
            </AppText>

            <MaterialCommunityIcons
              name="arrow-right"
              size={17}
              color={
                theme.button
                  .primaryBackground
              }
            />
          </TouchableOpacity>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ---------------------------------- */}
      {/* SECTION HEADER */}
      {/* ---------------------------------- */}

      {groupedSchedules.length > 0 && (
        <View
          style={styles.sectionHeader}
        >
          <View>
            <AppText
              variant="title"
              style={styles.sectionTitle}
            >
              {tSafe(
                'cleaner_requests',
                'Cleaner Requests'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={styles.sectionSubtitle}
            >
              {tSafe(
                'cleaner_requests_subtitle',
                'Manage responses for your upcoming cleanings'
              )}
            </AppText>
          </View>

          {groupedSchedules.length >
            0 && (
            <View
              style={
                styles.scheduleCount
              }
            >
              <AppText
                variant="label"
                color={
                  theme.brand.primary
                }
              >
                {groupedSchedules.length}
              </AppText>
            </View>
          )}
        </View>
      )}

      {/* ---------------------------------- */}
      {/* SCHEDULE CARDS */}
      {/* ---------------------------------- */}

      <FlatList
        data={groupedSchedules}
        keyExtractor={(item) =>
          String(item.scheduleId)
        }
        showsHorizontalScrollIndicator={
          false
        }
        horizontal
        contentContainerStyle={
          styles.flatListContent
        }
        renderItem={renderSchedule}
      />

      {/* ---------------------------------- */}
      {/* PENDING SUMMARY */}
      {/* ---------------------------------- */}

      {pendingCount > 0 && (
        <View
          style={styles.pendingContainer}
        >
          <View
            style={styles.pendingIcon}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={17}
              color={
                theme.status.warning
              }
            />
          </View>

          <View
            style={
              styles.pendingTextContainer
            }
          >
            <AppText
              variant="bodyMedium"
              style={
                styles.pendingTitle
              }
            >
              {tSafe(
                'waiting_for_cleaners',
                'Waiting for cleaners to accept'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.pendingSubtext
              }
            >
              {pendingCount}{' '}
              {pendingCount > 1
                ? tSafe(
                    'requests_plural',
                    'requests'
                  )
                : tSafe(
                    'request_singular',
                    'request'
                  )}{' '}
              {tSafe(
                'sent',
                'sent'
              )}
            </AppText>
          </View>

          <View
            style={styles.pendingBadge}
          >
            <AppText
              variant="label"
              color={
                theme.status.warning
              }
            >
              {pendingCount}
            </AppText>
          </View>
        </View>
      )}

      {/* ---------------------------------- */}
      {/* EMPTY STATE */}
      {/* ---------------------------------- */}

      {groupedSchedules.length ===
        0 && (
        <AppCard
          padding="large"
          radius="large"
          bordered
          style={styles.emptyState}
        >
          <View
            style={
              styles.emptyIconContainer
            }
          >
            <MaterialCommunityIcons
              name="calendar-search-outline"
              size={30}
              color={theme.icon.muted}
            />
          </View>

          <AppText
            variant="title"
            style={styles.emptyStateTitle}
          >
            {tSafe(
              'no_active_requests',
              'No Active Requests'
            )}
          </AppText>

          <AppText
            variant="caption"
            style={styles.emptyStateText}
          >
            {tSafe(
              'create_new_schedule',
              'Create a new cleaning schedule to get started'
            )}
          </AppText>
        </AppCard>
      )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingVertical: 4,
    },

    /* ---------------------------------- */
    /* SECTION HEADER */
    /* ---------------------------------- */

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 8,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },

    sectionSubtitle: {
      marginTop: 2,
      color: theme.text.secondary,
    },

    scheduleCount: {
      minWidth: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
    },

    /* ---------------------------------- */
    /* LIST */
    /* ---------------------------------- */

    flatListContent: {
      paddingHorizontal: 16,
      paddingVertical: 4,
    },

    cardWrapper: {
      width: width * 0.78,
      marginRight: 12,
    },

    card: {
      width: '100%',
      minHeight: 245,
    },

    /* ---------------------------------- */
    /* HEADER */
    /* ---------------------------------- */

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    propertyIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 10,
    },

    propertyInfo: {
      flex: 1,
      minWidth: 0,
    },

    propertyName: {
      fontWeight: '700',
    },

    address: {
      marginTop: 2,
      color: theme.text.secondary,
    },

    /* ---------------------------------- */
    /* DATE / TIME */
    /* ---------------------------------- */

    scheduleMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginBottom: 14,
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    metaText: {
      marginLeft: 5,
      fontWeight: '600',
    },

    metaDivider: {
      width: 1,
      height: 14,
      backgroundColor:
        theme.divider,
      marginHorizontal: 9,
    },

    /* ---------------------------------- */
    /* RESPONSE */
    /* ---------------------------------- */

    responseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 7,
    },

    responseTitle: {
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      color: theme.text.secondary,
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.border.default,
      borderRadius: 12,
      overflow: 'hidden',
    },

    statusItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 9,
      minWidth: 0,
    },

    acceptedItem: {
      backgroundColor:
        theme.status.success + '10',
    },

    pendingItem: {
      backgroundColor:
        theme.status.warning + '10',
    },

    declinedItem: {
      backgroundColor:
        theme.status.error + '10',
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    statusCount: {
      fontSize: 13,
      fontWeight: '700',
      marginRight: 3,
    },

    statusLabel: {
      fontSize: 10,
      color: theme.text.secondary,
    },

    /* ---------------------------------- */
    /* PROGRESS */
    /* ---------------------------------- */

    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 12,
    },

    progressTrack: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor:
        theme.background.sunken,
      marginRight: 8,
    },

    progressAccepted: {
      height: '100%',
      backgroundColor:
        theme.status.success,
      borderRadius: 2,
    },

    progressText: {
      fontSize: 10,
      minWidth: 48,
      textAlign: 'right',
      color: theme.text.muted,
    },

    /* ---------------------------------- */
    /* ACTION */
    /* ---------------------------------- */

    viewButton: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor:
        theme.brand.primaryLight,
      borderWidth: 1,
      borderColor:
        theme.brand.primary + '35',
    },

    viewButtonText: {
      fontSize: 13,
      fontWeight: '700',
      marginRight: 5,
    },

    /* ---------------------------------- */
    /* PENDING */
    /* ---------------------------------- */

    pendingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor:
        theme.status.warning + '12',
      borderWidth: 1,
      borderColor:
        theme.status.warning + '35',
    },

    pendingIcon: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.warning + '18',
      marginRight: 9,
    },

    pendingTextContainer: {
      flex: 1,
    },

    pendingTitle: {
      fontSize: 13,
      fontWeight: '600',
    },

    pendingSubtext: {
      marginTop: 1,
      color: theme.text.secondary,
    },

    pendingBadge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.warning + '18',
    },

    /* ---------------------------------- */
    /* EMPTY */
    /* ---------------------------------- */

    emptyState: {
      marginHorizontal: 16,
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyIconContainer: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      marginBottom: 10,
    },

    emptyStateTitle: {
      fontSize: 17,
      textAlign: 'center',
    },

    emptyStateText: {
      marginTop: 4,
      textAlign: 'center',
      color: theme.text.secondary,
      maxWidth: 280,
    },
  });

export default NewlyPublishedSchedule;








// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Dimensions,
// } from "react-native";
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from "../../constants/colors";
// import moment from "moment";
// import calculateDistance from "../../utils/calculateDistance";
// import ROUTES from "../../constants/routes";
// import { useNavigation } from "@react-navigation/native";
// import { tSafe } from "../../utils/tSafe";

// const { width } = Dimensions.get('window');

// const NewlyPublishedSchedule = ({ schedule, pendingCount }) => {
//   const navigation = useNavigation();

//   // ✅ Filter out any schedule with status "upcoming"
//   const activeSchedules = schedule.filter(item => item.status !== 'upcoming');

//   const groupedSchedules = activeSchedules.reduce((acc, current) => {
//     const existing = acc.find((item) => item.scheduleId === current.scheduleId);
//     const apartmentCoords = current.schedule;
//     const cleanerCoords = current.cleaner.location;
//     const distance = calculateDistance(
//       apartmentCoords?.schedule?.apartment_latitude,
//       apartmentCoords?.schedule?.apartment_longitude,
//       cleanerCoords?.latitude,
//       cleanerCoords?.longitude
//     );

//     if (existing) {
//       existing.totalRequests++;
//       if (current.status === "pending_payment") existing.accepted++;
//       if (current.status === "declined") existing.declined++;

//       if (!existing.cleaners.some((c) => c._id === current.cleaner._id)) {
//         existing.cleaners.push({
//           ...current.cleaner,
//           distance: `${distance}`,
//         });
//       }
//     } else {
//       acc.push({
//         scheduleId: current.scheduleId,
//         cleaning_date: current.cleaning_date,
//         cleaning_time: current.cleaning_time,
//         requestId: current._id,
//         cleaners: [
//           {
//             ...current.cleaner,
//             distance: `${distance}`,
//           },
//         ],
//         scheduleDetails: {
//           ...current.schedule,
//           apartment_location: {
//             lat: apartmentCoords?.apartment_latitude,
//             lng: apartmentCoords?.apartment_longitude,
//           },
//         },
//         totalRequests: 1,
//         accepted: current.status === "pending_payment" ? 1 : 0,
//         declined: current.status === "declined" ? 1 : 0,
//       });
//     }
//     return acc;
//   }, []);

//   groupedSchedules.forEach((group) => {
//     group.cleaners.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
//   });

//   const getStatusChipStyle = (count, type) => {
//     const baseStyle = {
//       paddingHorizontal: 12,
//       paddingVertical: 6,
//       borderRadius: 20,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minWidth: 100,
//     };

//     const statusStyles = {
//       accepted: {
//         backgroundColor: '#E8F5E9',
//         borderWidth: 1,
//         borderColor: '#34C759',
//       },
//       declined: {
//         backgroundColor: '#FFEBEE',
//         borderWidth: 1,
//         borderColor: '#FF3B30',
//       },
//       pending: {
//         backgroundColor: '#FFF3E0',
//         borderWidth: 1,
//         borderColor: '#FF9500',
//       },
//     };

//     const textColors = {
//       accepted: '#2E7D32',
//       declined: '#C62828',
//       pending: '#EF6C00',
//     };

//     return {
//       container: { ...baseStyle, ...statusStyles[type] },
//       count: { 
//         fontSize: 14, 
//         fontWeight: '700', 
//         color: textColors[type],
//         marginRight: 4,
//       },
//       label: { 
//         fontSize: 12, 
//         fontWeight: '600', 
//         color: textColors[type] 
//       },
//       countText: count.toString(),
//     };
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={groupedSchedules}
//         keyExtractor={(item) => item.scheduleId}
//         showsHorizontalScrollIndicator={false}
//         horizontal={true}
//         contentContainerStyle={styles.flatListContent}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate(ROUTES.host_recommended_cleaners, {
//                 scheduleId: item.scheduleDetails._id,
//                 schedule: item.scheduleDetails.schedule,
//                 cleaner: item.cleaners,
//                 requestId: item.requestId
//               })
//             }
//             activeOpacity={0.7}
//             style={styles.card}
//           >
//             {/* Card Header */}
//             <View style={styles.cardHeader}>
//               <View style={styles.iconContainer}>
//                 <MaterialCommunityIcons 
//                   name="calendar-clock" 
//                   size={22} 
//                   color={COLORS.primary} 
//                 />
//               </View>
//               <View style={styles.headerTextContainer}>
//                 <Text style={styles.cardTitle} numberOfLines={1}>
//                   {item?.scheduleDetails?.schedule?.apartment_name}
//                 </Text>
//                 <Text style={styles.cardSubtitle} numberOfLines={2}>
//                   {item?.scheduleDetails?.schedule?.address}
//                 </Text>
//               </View>
//             </View>

//             {/* Date & Time */}
//             <View style={styles.datetimeContainer}>
//               <MaterialCommunityIcons 
//                 name="clock-outline" 
//                 size={16} 
//                 color="#666" 
//               />
//               <Text style={styles.datetimeText}>
//                 {`${moment(item.cleaning_date).format("ddd, MMM D")} • ${moment(
//                   item.cleaning_time,
//                   "h:mm:ss A"
//                 ).format("h:mm A")}`}
//               </Text>
//             </View>

//             {/* Divider */}
//             <View style={styles.divider} />

//             {/* Stats Section */}
//             <View style={styles.statsContainer}>
//               <Text style={styles.statsTitle}>
//                 {tSafe("response_status", "Response Status")}
//               </Text>
              
//               <View style={styles.statsGrid}>
//                 {/* Accepted */}
//                 <View style={styles.statCard}>
//                   <View style={styles.statCardContent}>
//                     <View style={[styles.statIndicator, styles.acceptedIndicator]} />
//                     <View style={styles.statTextContainer}>
//                       <Text style={styles.statCount}>{item.accepted}</Text>
//                       <Text style={styles.statLabel}>
//                         {tSafe("accepted_dashboard", "Accepted")}
//                       </Text>
//                     </View>
//                     <View style={styles.statProgressContainer}>
//                       <View style={[styles.statProgressBar, { 
//                         width: `${Math.max(20, (item.accepted / item.totalRequests) * 100)}%` 
//                       }]} />
//                     </View>
//                   </View>
//                 </View>

//                 {/* Declined */}
//                 <View style={styles.statCard}>
//                   <View style={styles.statCardContent}>
//                     <View style={[styles.statIndicator, styles.declinedIndicator]} />
//                     <View style={styles.statTextContainer}>
//                       <Text style={styles.statCount}>{item.declined}</Text>
//                       <Text style={styles.statLabel}>
//                         {tSafe("declined_dashboard", "Declined")}
//                       </Text>
//                     </View>
//                     <View style={styles.statProgressContainer}>
//                       <View style={[styles.statProgressBar, { 
//                         width: `${Math.max(20, (item.declined / item.totalRequests) * 100)}%` 
//                       }]} />
//                     </View>
//                   </View>
//                 </View>

//                 {/* Pending */}
//                 <View style={styles.statCard}>
//                   <View style={styles.statCardContent}>
//                     <View style={[styles.statIndicator, styles.pendingIndicator1]} />
//                     <View style={styles.statTextContainer}>
//                       <Text style={styles.statCount}>
//                         {item.totalRequests - (item.accepted + item.declined)}
//                       </Text>
//                       <Text style={styles.statLabel}>
//                         {tSafe("pending_dashboard", "Pending")}
//                       </Text>
//                     </View>
//                     <View style={styles.statProgressContainer}>
//                       <View style={[styles.statProgressBar, { 
//                         width: `${Math.max(20, ((item.totalRequests - (item.accepted + item.declined)) / item.totalRequests) * 100)}%` 
//                       }]} />
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* View Details Button */}
//             <TouchableOpacity 
//               style={styles.viewButton}
//               onPress={() =>
//                 navigation.navigate(ROUTES.host_recommended_cleaners, {
//                   scheduleId: item.scheduleDetails._id,
//                   schedule: item.scheduleDetails.schedule,
//                   cleaner: item.cleaners,
//                   requestId: item.requestId
//                 })
//               }
//             >
//               <Text style={styles.viewButtonText}>
//                 {tSafe("view_details", "View Details")}
//               </Text>
//               <MaterialCommunityIcons 
//                 name="chevron-right" 
//                 size={18} 
//                 color={COLORS.primary} 
//               />
//             </TouchableOpacity>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Pending Indicator */}
//       {pendingCount > 0 && (
//         <View style={styles.pendingIndicator}>
//           <View style={styles.pendingBadge}>
//             <View style={styles.pendingDot} />
//             <Text style={styles.pendingBadgeText}>
//               {pendingCount}
//             </Text>
//           </View>
//           <View style={styles.pendingTextContainer}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={16} 
//               color="#FF9500" 
//             />
//             <Text style={styles.pendingText}>
//               {tSafe("waiting_for_cleaners", "Waiting for cleaners to accept")}
//             </Text>
//             <Text style={styles.pendingSubtext}>
//               {pendingCount}{' '}
//               {pendingCount > 1 
//                 ? tSafe("requests_plural", "requests") 
//                 : tSafe("request_singular", "request")}{' '}
//               {tSafe("sent", "sent")}
//             </Text>
//           </View>
//         </View>
//       )}

//       {groupedSchedules.length === 0 && (
//         <View style={styles.emptyState}>
//           <MaterialCommunityIcons 
//             name="calendar-search" 
//             size={48} 
//             color="#D1D1D6" 
//           />
//           <Text style={styles.emptyStateTitle}>
//             {tSafe("no_active_requests", "No Active Requests")}
//           </Text>
//           <Text style={styles.emptyStateText}>
//             {tSafe("create_new_schedule", "Create a new cleaning schedule to get started")}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'transparent',
//     paddingVertical: 8,
//   },
//   flatListContent: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   card: {
//     width: width * 0.85,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     marginRight: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 6,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   iconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: 'rgba(25, 118, 210, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 18,
//   },
//   datetimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     backgroundColor: '#F8F9FA',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//   },
//   datetimeText: {
//     fontSize: 13,
//     color: '#666',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#F0F0F0',
//     marginBottom: 16,
//   },
//   statsContainer: {
//     marginBottom: 16,
//   },
//   statsTitle: {
//     fontSize: 12,
//     color: '#8E8E93',
//     fontWeight: '600',
//     marginBottom: 12,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 8,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   statCardContent: {
//     alignItems: 'center',
//   },
//   statIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginBottom: 12,
//   },
//   acceptedIndicator: {
//     backgroundColor: '#34C759',
//   },
//   declinedIndicator: {
//     backgroundColor: '#FF3B30',
//   },
//   pendingIndicator1: {
//     backgroundColor: '#FF9500',
//   },
//   statTextContainer: {
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statCount: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 10,
//     color: '#666',
//     fontWeight: '500',
//     textTransform: 'uppercase',
//     letterSpacing: 0.3,
//   },
//   statProgressContainer: {
//     width: '100%',
//     height: 4,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   statProgressBar: {
//     height: '100%',
//     backgroundColor: '#D1D1D6',
//     borderRadius: 2,
//   },
//   viewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: 'rgba(25, 118, 210, 0.05)',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(25, 118, 210, 0.2)',
//   },
//   viewButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 6,
//   },
//   pendingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFBF0',
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#FFE082',
//   },
//   pendingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FF9500',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   pendingDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#FFF',
//     marginRight: 4,
//   },
//   pendingBadgeText: {
//     color: '#FFF',
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   pendingTextContainer: {
//     flex: 1,
//   },
//   pendingText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FF9500',
//     marginBottom: 2,
//   },
//   pendingSubtext: {
//     fontSize: 12,
//     color: '#FFB74D',
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//     backgroundColor: '#F9F9FB',
//     borderRadius: 20,
//     marginHorizontal: 16,
//     marginTop: 8,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#8E8E93',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: '#C7C7CC',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });

// export default NewlyPublishedSchedule;