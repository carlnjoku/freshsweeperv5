// screens/host/SelectIncidentScreen.js
// screens/host/team/SelectIncident.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { tSafe } from '../../../utils/tSafe';
// import userService from '../../../services/connection/userService';

// const SelectIncident = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { scheduleId } = route.params || {};

//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!scheduleId) {
//       Alert.alert('Error', 'No schedule ID provided');
//       navigation.goBack();
//       return;
//     }
//     fetchIncidents();
//   }, []);

//   const fetchIncidents = async () => {
//     try {
//       const res = await userService.getScheduleIncidents(scheduleId);
//       setIncidents(res.data.incidents || []);
//     } catch (error) {
//       console.error('Failed to load incidents:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('could_not_load_incidents', 'Could not load incidents for this schedule.')
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelect = (incident) => {
//     navigation.navigate(ROUTES.host_select_team_members, {
//       scheduleId,
//       incident,
//     });
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
//       <View style={styles.cardContent}>
//         <MaterialCommunityIcons name="alert-circle" size={28} color={COLORS.warning || '#FFA500'} />
//         <View style={styles.info}>
//           <Text style={styles.description} numberOfLines={2}>
//             {item.description || tSafe('no_description', 'No description')}
//           </Text>
//           <Text style={styles.detail}>
//             {tSafe('cleaner', 'Cleaner')}: {item.cleanerName || 'N/A'}
//           </Text>
//           <Text style={styles.detail}>
//             {tSafe('reported', 'Reported')}: {item.reported_at ? new Date(item.reported_at).toLocaleString() : 'N/A'}
//           </Text>
//           <Text style={[styles.detail, styles.status]}>
//             {tSafe('status', 'Status')}: {item.status || 'reported'}
//           </Text>
//           {item.photos && item.photos.length > 0 && (
//             <Text style={styles.photos}>
//               📷 {item.photos.length} {tSafe('photo_s', 'photo(s)')}
//             </Text>
//           )}
//         </View>
//         <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{tSafe('select_incident', 'Select an Incident to Notify')}</Text>
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => `${item.groupIndex}-${item.incidentIndex}`}
//         renderItem={renderItem}
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>{tSafe('no_incidents', 'No incidents reported')}</Text>
//             <Text style={styles.emptySubtext}>
//               {tSafe('no_incidents_hint', 'This schedule has no reported incidents.')}
//             </Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fe',
//     padding: 16,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginBottom: 16,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   info: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   description: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#1E1E2F',
//     marginBottom: 4,
//   },
//   detail: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   status: {
//     textTransform: 'capitalize',
//   },
//   photos: {
//     fontSize: 13,
//     color: '#888',
//     marginTop: 4,
//   },
//   empty: {
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#666',
//     marginTop: 12,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
// });

// export default SelectIncident;



import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';

import {
  AppText,
  AppCard,
  AppButton,
} from '../../../ui';

import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const formatIncidentDate = (dateString) => {
  if (!dateString) {
    return tSafe('not_available', 'Not available');
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return tSafe('not_available', 'Not available');
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getIncidentStatus = (status) => {
  const normalized = String(
    status || 'reported'
  ).toLowerCase();

  switch (normalized) {
    case 'resolved':
      return {
        label: tSafe('status_resolved', 'Resolved'),
        type: 'success',
        icon: 'check-circle-outline',
      };

    case 'reported':
      return {
        label: tSafe('status_reported', 'Reported'),
        type: 'warning',
        icon: 'alert-circle-outline',
      };

    default:
      return {
        label: normalized.replace(/_/g, ' '),
        type: 'pending',
        icon: 'information-outline',
      };
  }
};

const getPhotoCount = (incident) => {
  const photos = Array.isArray(incident?.photos)
    ? incident.photos
    : Array.isArray(incident?.uploaded_files)
    ? incident.uploaded_files
    : [];

  return photos.filter((photo) => {
    if (typeof photo === 'string') {
      return photo.trim().length > 0;
    }

    return Boolean(
      photo?.url ||
      photo?.img_url ||
      photo?.uri
    );
  }).length;
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const SelectIncident = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { scheduleId } = route.params || {};

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ───────────────────────────────────────────────────────────
  // Fetch incidents
  // ───────────────────────────────────────────────────────────

  const fetchIncidents = useCallback(
    async ({ refresh = false } = {}) => {
      if (!scheduleId) {
        setLoading(false);
        setRefreshing(false);

        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'missing_schedule_id',
            'No schedule ID provided.'
          ),
          [
            {
              text: tSafe('ok', 'OK'),
              onPress: () => navigation.goBack(),
            },
          ]
        );

        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response =
          await userService.getScheduleIncidents(
            scheduleId
          );

        const data =
          response?.data?.incidents ||
          response?.data?.data?.incidents ||
          [];

        setIncidents(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          'Failed to load incidents:',
          error
        );

        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'could_not_load_incidents',
            'Could not load incidents for this schedule.'
          ),
          [
            {
              text: tSafe('cancel', 'Cancel'),
              style: 'cancel',
            },
            {
              text: tSafe('retry', 'Retry'),
              onPress: () =>
                fetchIncidents({ refresh: false }),
            },
          ]
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [scheduleId, navigation]
  );

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // ───────────────────────────────────────────────────────────
  // Select incident
  // ───────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (incident) => {
      if (!scheduleId) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'missing_schedule_id',
            'No schedule ID provided.'
          )
        );

        return;
      }

      navigation.navigate(
        ROUTES.host_select_team_members,
        {
          scheduleId,
          incident,
        }
      );
    },
    [navigation, scheduleId]
  );

  // ───────────────────────────────────────────────────────────
  // Incident card
  // ───────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }) => {
      const status = getIncidentStatus(item.status);

      const statusColor =
        status.type === 'success'
          ? theme.status.success
          : status.type === 'warning'
          ? theme.status.warning
          : theme.status.info;

      const description =
        item.description ||
        tSafe(
          'no_description',
          'No description provided.'
        );

      const cleanerName =
        item.cleanerName ||
        tSafe('unknown_cleaner', 'Unknown cleaner');

      const photoCount = getPhotoCount(item);

      return (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${tSafe(
            'incident',
            'Incident'
          )}: ${description}`}
          style={styles.incidentTouchable}
          onPress={() => handleSelect(item)}
          activeOpacity={0.75}
        >
          <AppCard
            padding="medium"
            radius="large"
            style={styles.incidentCard}
          >
            {/* Card heading */}

            <View style={styles.cardHeader}>
              <View style={styles.incidentIcon}>
                <MaterialCommunityIcons
                  name={status.icon}
                  size={23}
                  color={statusColor}
                />
              </View>

              <View style={styles.cardHeaderText}>
                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.incidentLabel}
                >
                  {tSafe(
                    'incident_number',
                    'Incident'
                  )}{' '}
                  {index + 1}
                </AppText>

                <AppText
                  variant="subtitle"
                  style={styles.description}
                  numberOfLines={3}
                >
                  {description}
                </AppText>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.icon.muted}
              />
            </View>

            {/* Status */}

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      theme.surface.elevated,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: statusColor,
                    },
                  ]}
                />

                <AppText
                  variant="caption"
                  style={[
                    styles.statusText,
                    {
                      color: statusColor,
                    },
                  ]}
                >
                  {status.label}
                </AppText>
              </View>
            </View>

            {/* Incident details */}

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={16}
                    color={theme.icon.muted}
                  />
                </View>

                <View style={styles.detailTextContainer}>
                  <AppText
                    variant="caption"
                    color={theme.text.muted}
                  >
                    {tSafe('cleaner', 'Cleaner')}
                  </AppText>

                  <AppText
                    variant="bodyMedium"
                    style={styles.detailValue}
                    numberOfLines={1}
                  >
                    {cleanerName}
                  </AppText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color={theme.icon.muted}
                  />
                </View>

                <View style={styles.detailTextContainer}>
                  <AppText
                    variant="caption"
                    color={theme.text.muted}
                  >
                    {tSafe(
                      'reported',
                      'Reported'
                    )}
                  </AppText>

                  <AppText
                    variant="bodyMedium"
                    style={styles.detailValue}
                  >
                    {formatIncidentDate(
                      item.reported_at
                    )}
                  </AppText>
                </View>
              </View>

              {photoCount > 0 && (
                <View style={styles.photoCountRow}>
                  <MaterialCommunityIcons
                    name="image-multiple-outline"
                    size={16}
                    color={theme.brand.primary}
                  />

                  <AppText
                    variant="caption"
                    style={styles.photoCountText}
                  >
                    {photoCount}{' '}
                    {photoCount === 1
                      ? tSafe('photo', 'photo')
                      : tSafe('photos', 'photos')}
                  </AppText>
                </View>
              )}
            </View>

            {/* Action hint */}

            <View style={styles.cardFooter}>
              <AppText
                variant="caption"
                color={theme.brand.primary}
                style={styles.actionText}
              >
                {tSafe(
                  'select_to_notify',
                  'Select to notify team members'
                )}
              </AppText>

              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color={theme.brand.primary}
              />
            </View>
          </AppCard>
        </TouchableOpacity>
      );
    },
    [
      handleSelect,
      styles,
      theme,
    ]
  );

  // ───────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={42}
          color={theme.brand.primary}
        />
      </View>

      <AppText
        variant="heading"
        style={styles.emptyTitle}
      >
        {tSafe(
          'no_incidents',
          'No incidents reported'
        )}
      </AppText>

      <AppText
        color={theme.text.secondary}
        style={styles.emptyDescription}
      >
        {tSafe(
          'no_incidents_hint',
          'This schedule has no reported incidents.'
        )}
      </AppText>

      <AppButton
        title={tSafe('refresh', 'Refresh')}
        variant="outline"
        icon="refresh"
        onPress={() =>
          fetchIncidents({ refresh: true })
        }
        style={styles.refreshButton}
      />
    </View>
  );

  // ───────────────────────────────────────────────────────────
  // Loading state
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={theme.background.default}
          barStyle={
            isDark ? 'light-content' : 'dark-content'
          }
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_incidents',
              'Loading incidents...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Main render
  // ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
      />

      {/* Header */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={26}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.headerTextContainer}>
          <AppText
            variant="heading"
            style={styles.headerTitle}
          >
            {tSafe(
              'select_incident',
              'Select an Incident to Notify'
            )}
          </AppText>

          <AppText
            color={theme.text.secondary}
            style={styles.headerSubtitle}
          >
            {tSafe(
              'select_incident_subtitle',
              'Choose an incident to notify the appropriate team members.'
            )}
          </AppText>
        </View>

        <View style={styles.summaryBadge}>
          <AppText
            style={styles.summaryNumber}
          >
            {incidents.length}
          </AppText>

          <AppText
            style={styles.summaryCaption}
          >
            {tSafe('incidents', 'Incidents')}
          </AppText>
        </View>
      </View>

      {/* Incident list */}

      <FlatList
        data={incidents}
        keyExtractor={(item, index) =>
          item._id
            ? String(item._id)
            : `${item.groupIndex ?? 'group'}-${
                item.incidentIndex ?? index
              }-${index}`
        }
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          incidents.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              fetchIncidents({ refresh: true })
            }
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// Theme-aware styles
// ─────────────────────────────────────────────────────────────

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      textAlign: 'center',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 17,
      backgroundColor: theme.surface.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    headerIcon: {
      width: 47,
      height: 47,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 12,
    },

    headerTextContainer: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
    },

    headerSubtitle: {
      fontSize: 12,
      lineHeight: 17,
    },

    summaryBadge: {
      minWidth: 54,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 9,
      paddingVertical: 8,
      marginLeft: 8,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
    },

    summaryNumber: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    summaryCaption: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.brand.primary,
      marginTop: 2,
    },

    listContent: {
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 30,
    },

    emptyListContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },

    incidentTouchable: {
      marginBottom: 12,
    },

    incidentCard: {
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDark
        ? 0
        : theme.shadow.opacity,
      shadowRadius: 5,
      elevation: isDark ? 0 : 2,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    incidentIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 11,
    },

    cardHeaderText: {
      flex: 1,
      marginRight: 8,
    },

    incidentLabel: {
      fontSize: 10,
      fontWeight: '700',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    description: {
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 20,
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 12,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
      gap: 6,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    statusText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    detailsContainer: {
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border.default,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 11,
    },

    detailIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 9,
    },

    detailTextContainer: {
      flex: 1,
    },

    detailValue: {
      fontSize: 12,
      marginTop: 2,
    },

    photoCountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.brand.primaryLight,
      gap: 6,
      marginBottom: 5,
    },

    photoCountText: {
      color: theme.brand.primary,
      fontWeight: '700',
      fontSize: 11,
    },

    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border.default,
    },

    actionText: {
      fontSize: 12,
      fontWeight: '700',
    },

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 25,
      paddingVertical: 45,
    },

    emptyIconContainer: {
      width: 82,
      height: 82,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginBottom: 16,
    },

    emptyTitle: {
      fontSize: 19,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
    },

    emptyDescription: {
      fontSize: 13,
      lineHeight: 21,
      textAlign: 'center',
    },

    refreshButton: {
      marginTop: 18,
      minWidth: 145,
    },
  });

export default SelectIncident;