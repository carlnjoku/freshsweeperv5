import React, {
  useState,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const MyGigs = () => {
  const navigation = useNavigation();
  const { userToken } = useContext(AuthContext);
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // --------------------------------------------------
  // Fetch properties
  // --------------------------------------------------

  const fetchLinkedProperties = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const response = await userService.getLinkedProperties();

        setProperties(response?.data || []);
      } catch (err) {
        console.error(
          'Failed to fetch linked properties:',
          err
        );

        setError(
          tSafe(
            'load_linked_properties_error',
            'Could not load your linked properties. Please try again.'
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userToken]
  );

  useFocusEffect(
    useCallback(() => {
      fetchLinkedProperties();
    }, [fetchLinkedProperties])
  );

  const onRefresh = () => {
    fetchLinkedProperties(true);
  };

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const navigateToPropertyGigs = (
    property
  ) => {
    navigation.navigate(
      ROUTES.cleaner_property_gigs,
      {
        property,
      }
    );
  };

  // --------------------------------------------------
  // Property card
  // --------------------------------------------------

  const renderPropertyCard = ({
    item,
  }) => {
    const upcomingCount =
      Number(item.upcoming_gigs_count) || 0;

    const totalCount =
      Number(item.total_gigs_count) || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() =>
          navigateToPropertyGigs(item)
        }
      >
        {/* Property Header */}
        <View style={styles.cardHeader}>
          {item.property_image ? (
            <Image
              source={{
                uri: item.property_image,
              }}
              style={styles.propertyImage}
            />
          ) : (
            <View
              style={[
                styles.propertyImage,
                styles.imagePlaceholder,
              ]}
            >
              <MaterialCommunityIcons
                name="home-outline"
                size={27}
                color={theme.icon.muted}
              />
            </View>
          )}

          <View style={styles.propertyInfo}>
            <AppText
              variant="body"
              style={styles.propertyName}
              numberOfLines={1}
            >
              {item.property_name ||
                tSafe(
                  'unnamed_property',
                  'Unnamed Property'
                )}
            </AppText>

            <View style={styles.addressRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={theme.icon.muted}
              />

              <AppText
                variant="caption"
                style={styles.propertyAddress}
                numberOfLines={2}
              >
                {item.property_address ||
                  tSafe(
                    'address_unavailable',
                    'Address unavailable'
                  )}
              </AppText>
            </View>
          </View>

          <View style={styles.chevronButton}>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.icon.muted}
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              styles.upcomingStatCard,
            ]}
          >
            <View
              style={[
                styles.statIcon,
                styles.upcomingIcon,
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-clock-outline"
                size={19}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.statContent}>
              <AppText
                variant="body"
                style={styles.statValue}
              >
                {upcomingCount}
              </AppText>

              <AppText
                variant="caption"
                style={styles.statLabel}
              >
                {tSafe(
                  'upcoming',
                  'Upcoming'
                )}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              styles.totalStatCard,
            ]}
          >
            <View
              style={[
                styles.statIcon,
                styles.totalIcon,
              ]}
            >
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={19}
                color={theme.icon.active}
              />
            </View>

            <View style={styles.statContent}>
              <AppText
                variant="body"
                style={styles.statValue}
              >
                {totalCount}
              </AppText>

              <AppText
                variant="caption"
                style={styles.statLabel}
              >
                {tSafe(
                  'total',
                  'Total Gigs'
                )}
              </AppText>
            </View>
          </View>
        </View>

        {/* Action */}
        <View style={styles.cardFooter}>
          <View>
            <AppText
              variant="caption"
              style={styles.footerLabel}
            >
              {upcomingCount > 0
                ? tSafe(
                    'property_has_upcoming_gigs',
                    'You have upcoming gigs here'
                  )
                : tSafe(
                    'no_upcoming_gigs',
                    'No upcoming gigs'
                  )}
            </AppText>

            <AppText
              variant="body"
              style={styles.viewGigsText}
            >
              {tSafe(
                'view_gigs',
                'View Gigs'
              )}
            </AppText>
          </View>

          <View
            style={styles.viewButton}
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={19}
              color={
                theme.button.primaryText
              }
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingIcon}>
          <MaterialCommunityIcons
            name="briefcase-clock-outline"
            size={30}
            color={theme.brand.primary}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={theme.brand.primary}
        />

        <AppText
          variant="body"
          style={styles.loadingText}
        >
          {tSafe(
            'loading_gigs',
            'Loading your gigs...'
          )}
        </AppText>
      </View>
    );
  }

  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={34}
            color={theme.status.error}
          />
        </View>

        <AppText
          variant="h2"
          style={styles.errorTitle}
        >
          {tSafe(
            'unable_to_load',
            'Unable to Load Gigs'
          )}
        </AppText>

        <AppText
          variant="body"
          style={styles.errorText}
        >
          {error}
        </AppText>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.retryButton}
          onPress={() =>
            fetchLinkedProperties()
          }
        >
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={
              theme.button.primaryText
            }
          />

          <AppText
            variant="body"
            style={styles.retryText}
          >
            {tSafe(
              'retry',
              'Retry'
            )}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------

  if (properties.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="home-search-outline"
            size={42}
            color={theme.brand.primary}
          />
        </View>

        <AppText
          variant="h2"
          style={styles.emptyTitle}
        >
          {tSafe(
            'no_linked_properties',
            'No Linked Properties'
          )}
        </AppText>

        <AppText
          variant="body"
          style={styles.emptyText}
        >
          {tSafe(
            'no_linked_properties_message',
            "You haven't been invited to any properties yet. When a host invites you, they will appear here."
          )}
        </AppText>

        <View style={styles.emptyHint}>
          <MaterialCommunityIcons
            name="information-outline"
            size={17}
            color={theme.icon.muted}
          />

          <AppText
            variant="caption"
            style={styles.emptyHintText}
          >
            {tSafe(
              'linked_properties_hint',
              'Your linked properties will appear here automatically.'
            )}
          </AppText>
        </View>
      </View>
    );
  }

  // --------------------------------------------------
  // Main
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item, index) =>
          String(
            item.property_id ||
              item._id ||
              index
          )
        }
        renderItem={renderPropertyCard}
        contentContainerStyle={
          styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View>
              <AppText
                variant="h2"
                style={styles.pageTitle}
              >
                {tSafe(
                  'my_gigs',
                  'My Gigs'
                )}
              </AppText>

              <AppText
                variant="body"
                style={styles.pageSubtitle}
              >
                {properties.length}{' '}
                {properties.length ===
                1
                  ? tSafe(
                      'linked_property',
                      'linked property'
                    )
                  : tSafe(
                      'linked_properties',
                      'linked properties'
                    )}
              </AppText>
            </View>

            <View
              style={styles.propertyCount}
            >
              <MaterialCommunityIcons
                name="home-city-outline"
                size={18}
                color={
                  theme.brand.primary
                }
              />

              <AppText
                variant="body"
                style={
                  styles.propertyCountText
                }
              >
                {properties.length}
              </AppText>
            </View>
          </View>
        }
      />
    </View>
  );
};

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

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },

    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },

    pageTitle: {
      color: theme.text.primary,
      fontSize: 23,
      fontWeight: '700',
      marginBottom: 3,
    },

    pageSubtitle: {
      color: theme.text.muted,
      fontSize: 12,
    },

    propertyCount: {
      minWidth: 48,
      height: 44,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 9,
      backgroundColor:
        theme.brand.primaryLight,
      gap: 5,
    },

    propertyCountText: {
      color: theme.brand.primary,
      fontSize: 14,
      fontWeight: '700',
    },

    // ----------------------------------------------
    // Property Card
    // ----------------------------------------------

    card: {
      backgroundColor:
        theme.card.background,
      borderRadius: 20,
      padding: 15,
      marginBottom: 13,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      shadowColor:
        theme.shadow?.color || '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity:
        theme.shadow?.opacity ?? 0.08,
      shadowRadius: 8,
      elevation: 3,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    propertyImage: {
      width: 64,
      height: 64,
      borderRadius: 16,
      marginRight: 12,
      backgroundColor:
        theme.background.sunken,
    },

    imagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    propertyInfo: {
      flex: 1,
      justifyContent: 'center',
    },

    propertyName: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingRight: 5,
    },

    propertyAddress: {
      flex: 1,
      color: theme.text.secondary,
      fontSize: 12,
      lineHeight: 17,
      marginLeft: 4,
    },

    chevronButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      marginLeft: 7,
    },

    divider: {
      height: 1,
      backgroundColor:
        theme.divider,
      marginVertical: 14,
    },

    // ----------------------------------------------
    // Stats
    // ----------------------------------------------

    statsRow: {
      flexDirection: 'row',
      gap: 9,
      marginBottom: 14,
    },

    statCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 58,
      paddingHorizontal: 10,
      borderRadius: 14,
      borderWidth: 1,
    },

    upcomingStatCard: {
      backgroundColor:
        theme.brand.primaryLight,
      borderColor:
        theme.border.default,
    },

    totalStatCard: {
      backgroundColor:
        theme.surface.selected,
      borderColor:
        theme.border.default,
    },

    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },

    upcomingIcon: {
      backgroundColor:
        `${theme.brand.primary}15`,
    },

    totalIcon: {
      backgroundColor:
        `${theme.icon.active}12`,
    },

    statContent: {
      flex: 1,
    },

    statValue: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 20,
    },

    statLabel: {
      color: theme.text.muted,
      fontSize: 10,
      marginTop: 1,
    },

    // ----------------------------------------------
    // Footer
    // ----------------------------------------------

    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    footerLabel: {
      color: theme.text.muted,
      fontSize: 10,
      marginBottom: 2,
    },

    viewGigsText: {
      color: theme.brand.primary,
      fontSize: 13,
      fontWeight: '700',
    },

    viewButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryBackground,
    },

    // ----------------------------------------------
    // Center states
    // ----------------------------------------------

    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      backgroundColor:
        theme.background.default,
    },

    loadingIcon: {
      width: 68,
      height: 68,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginBottom: 15,
    },

    loadingText: {
      color: theme.text.secondary,
      fontSize: 13,
      marginTop: 10,
    },

    errorIcon: {
      width: 72,
      height: 72,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        `${theme.status.error}12`,
      marginBottom: 14,
    },

    errorTitle: {
      color: theme.text.primary,
      fontSize: 19,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 6,
    },

    errorText: {
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      maxWidth: 320,
    },

    retryButton: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      borderRadius: 14,
      backgroundColor:
        theme.button.primaryBackground,
      marginTop: 18,
      gap: 7,
    },

    retryText: {
      color: theme.button.primaryText,
      fontSize: 14,
      fontWeight: '700',
    },

    // ----------------------------------------------
    // Empty state
    // ----------------------------------------------

    emptyIcon: {
      width: 94,
      height: 94,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginBottom: 18,
    },

    emptyTitle: {
      color: theme.text.primary,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
    },

    emptyText: {
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      maxWidth: 330,
    },

    emptyHint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 20,
      padding: 12,
      borderRadius: 13,
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      maxWidth: 330,
    },

    emptyHintText: {
      flex: 1,
      color: theme.text.muted,
      fontSize: 11,
      lineHeight: 16,
      marginLeft: 7,
    },
  });

export default MyGigs;