import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  AntDesign,
} from '@expo/vector-icons';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';

// -----------------------------------------------------------------------------
// ICON MAPPING
// -----------------------------------------------------------------------------

const iconMap = {
  // Cleaner routes
  [ROUTES.cleaner_home_drawer]: {
    icon: 'home-outline',
    family: Ionicons,
  },

  [ROUTES.notification]: {
    icon: 'bell-outline',
    family: MaterialCommunityIcons,
  },

  [ROUTES.cleaner_profile]: {
    icon: 'account-outline',
    family: MaterialCommunityIcons,
  },

  [ROUTES.cleaner_earnings]: {
    icon: 'credit-card-outline',
    family: MaterialCommunityIcons,
  },

  [ROUTES.cleaner_settings]: {
    icon: 'settings-outline',
    family: Ionicons,
  },

  [ROUTES.cleaner_support]: {
    icon: 'lifebuoy',
    family: MaterialCommunityIcons,
  },

  [ROUTES.cleaner_my_gigs]: {
    icon: 'briefcase-outline',
    family: MaterialCommunityIcons,
  },

  // Host routes
  // [ROUTES.host_home_drawer]: {
  //   icon: 'home-outline',
  //   family: Ionicons,
  // },

  // [ROUTES.host_profile]: {
  //   icon: 'account-outline',
  //   family: MaterialCommunityIcons,
  // },

  // [ROUTES.host_team]: {
  //   icon: 'account-group-outline',
  //   family: MaterialCommunityIcons,
  // },

  // [ROUTES.host_my_apartment]: {
  //   icon: 'home',
  //   family: AntDesign,
  // },

  // [ROUTES.host_checklist]: {
  //   icon: 'check-square',
  //   family: Feather,
  // },

  // [ROUTES.host_payment_history]: {
  //   icon: 'credit-card-clock',
  //   family: MaterialCommunityIcons,
  // },

  // Host routes
  [ROUTES.host_home_drawer]: {
    icon: 'home-outline',
    family: Ionicons,
  },

  [ROUTES.host_profile]: {
    icon: 'account-outline',
    family: MaterialCommunityIcons,
  },

  // My Cleaners
  [ROUTES.host_team]: {
    icon: 'account-group-outline',
    family: MaterialCommunityIcons,
  },

  // My Vendors
  [ROUTES.host_team_list]: {
    icon: 'toolbox-outline',
    family: MaterialCommunityIcons,
  },

  // My Properties
  [ROUTES.host_my_apartment]: {
    icon: 'home',
    family: AntDesign,
  },

  // My Checklists
  [ROUTES.host_checklist]: {
    icon: 'clipboard-check-outline',
    family: MaterialCommunityIcons,
  },

  [ROUTES.host_payment_history]: {
    icon: 'credit-card-clock',
    family: MaterialCommunityIcons,
  },
};

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function CustomDrawer(props) {
  const {
    currentUserId,
    userType,
    logout,
  } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  const styles = createStyles(theme);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasLinked, setHasLinked] = useState(false);
  const [hasProperties, setHasProperties] = useState(false);

  // ---------------------------------------------------------------------------
  // FETCH USER INFORMATION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getUser(currentUserId);
        const res = response.data;

        setFirstname(res.firstname || '');
        setLastname(res.lastname || '');
        setCity(res.location?.city || '');
        setState(res.location?.region || '');
        setAvatar(res.avatar || '');
      } catch (e) {
        console.log('Error fetching user', e);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  // ---------------------------------------------------------------------------
  // CLEANER: CHECK LINKED PROPERTIES
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const checkLinked = async () => {
      if (userType !== 'cleaner' || !currentUserId) {
        return;
      }

      try {
        const response =
          await userService.cleanerHasLinkedProperty(
            currentUserId
          );

        setHasLinked(
          response?.data?.hasLinked === true
        );
      } catch (err) {
        console.error(
          'Failed to check linked properties:',
          err
        );

        setHasLinked(false);
      }
    };

    checkLinked();
  }, [currentUserId, userType]);

  // ---------------------------------------------------------------------------
  // HOST: CHECK PROPERTIES
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const checkHostProperties = async () => {
      if (userType !== 'host' || !currentUserId) {
        return;
      }

      try {
        const response =
          await userService.getApartment(currentUserId);

        const properties = response?.data || [];

        setHasProperties(
          Array.isArray(properties) &&
            properties.length > 0
        );
      } catch (err) {
        console.error(
          'Failed to fetch host properties:',
          err
        );

        setHasProperties(false);
      }
    };

    checkHostProperties();
  }, [currentUserId, userType]);

  // ---------------------------------------------------------------------------
  // BUILD DRAWER SCREENS
  // ---------------------------------------------------------------------------

  const getScreens = () => {
    if (userType === 'host') {
      const hostScreens = [
        {
          name: ROUTES.host_home_drawer,
          label: tSafe(
            'drawer_home',
            'Home'
          ),
        },

        {
          name: ROUTES.notification,
          label: tSafe(
            'drawer_notifications',
            'Notifications'
          ),
        },

        {
          name: ROUTES.host_profile,
          label: tSafe(
            'drawer_my_profile',
            'My Profile'
          ),
        },
      ];

      // My Team and My Checklists require
      // at least one property.
      if (hasProperties) {
        hostScreens.push(
          {
            name: ROUTES.host_team,
            label: tSafe(
              'drawer_my_cleaners',
              'My Cleaners'
            ),
          },
          {
            name: ROUTES.host_checklist,
            label: tSafe(
              'drawer_my_checklists',
              'My Checklists'
            ),
          },
          {
            name: ROUTES.host_team_list,
            label: tSafe(
              'drawer_my_vendors',
              'My Vendors'
            ),
          }
          
        );
      }

      // These are always available.
      hostScreens.push(
        {
          name: ROUTES.host_my_apartment,
          label: tSafe(
            'drawer_my_properties',
            'My Properties'
          ),
        },

        {
          name: ROUTES.host_payment_history,
          label: tSafe(
            'drawer_payment_history',
            'Payment History'
          ),
        },

        {
          name: ROUTES.cleaner_support,
          label: tSafe(
            'drawer_support',
            'Support'
          ),
        },

        {
          name: ROUTES.cleaner_settings,
          label: tSafe(
            'drawer_settings',
            'Settings'
          ),
        }
      );

      return hostScreens;
    }

    // -------------------------------------------------------------------------
    // CLEANER SCREENS
    // -------------------------------------------------------------------------

    const base = [
      {
        name: ROUTES.cleaner_home_drawer,
        label: tSafe(
          'drawer_home',
          'Home'
        ),
      },

      {
        name: ROUTES.notification,
        label: tSafe(
          'drawer_notifications',
          'Notifications'
        ),
      },

      {
        name: ROUTES.cleaner_profile,
        label: tSafe(
          'drawer_my_profile',
          'My Profile'
        ),
      },

      {
        name: ROUTES.cleaner_earnings,
        label: tSafe(
          'drawer_my_earnings',
          'My Earnings'
        ),
      },

      {
        name: ROUTES.cleaner_settings,
        label: tSafe(
          'drawer_settings',
          'Settings'
        ),
      },

      {
        name: ROUTES.cleaner_support,
        label: tSafe(
          'drawer_support',
          'Support'
        ),
      },
    ];

    if (hasLinked) {
      return [
        ...base.slice(0, 3),

        {
          name: ROUTES.cleaner_my_gigs,
          label: tSafe(
            'drawer_my_gigs',
            'My Gigs'
          ),
        },

        ...base.slice(3),
      ];
    }

    return base;
  };

  const screens = getScreens();

  // ---------------------------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
        />
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // CURRENT ROUTE
  // ---------------------------------------------------------------------------

  const currentRouteName =
    props.state?.routes?.[props.state.index]?.name;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ----------------------------------------------------------------- */}
        {/* USER HEADER                                                       */}
        {/* ----------------------------------------------------------------- */}

        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatar
                  ? { uri: avatar }
                  : require('../../assets/images/default_avatar.png')
              }
              style={styles.avatar}
            />

            <View style={styles.userInfo}>
              <Text
                style={styles.userName}
                numberOfLines={1}
              >
                {firstname} {lastname}
              </Text>

              {city ? (
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={theme.hero.foreground}
                  />

                  <Text
                    style={styles.userLocation}
                    numberOfLines={1}
                  >
                    {city}
                    {state ? `, ${state}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* DRAWER ITEMS                                                      */}
        {/* ----------------------------------------------------------------- */}

        <View style={styles.itemsContainer}>
          {screens.map((screen) => {
            const iconDef =
              iconMap[screen.name] || {
                icon: 'help-outline',
                family: MaterialCommunityIcons,
              };

            const IconFamily = iconDef.family;

            const focused =
              currentRouteName === screen.name;

            const iconColor = focused
              ? theme.brand.primary
              : theme.icon.muted;

            return (
              <DrawerItem
                key={screen.name}
                label={screen.label}
                focused={focused}
                onPress={() =>
                  props.navigation.navigate(
                    screen.name
                  )
                }
                icon={({ size }) => (
                  <View
                    style={styles.iconContainer}
                  >
                    <IconFamily
                      name={iconDef.icon}
                      size={size}
                      color={iconColor}
                    />
                  </View>
                )}
                activeTintColor={
                  theme.brand.primary
                }
                inactiveTintColor={
                  theme.text.secondary
                }
                activeBackgroundColor={
                  theme.surface.selected
                }
                labelStyle={[
                  styles.labelStyle,
                  {
                    color: focused
                      ? theme.brand.primary
                      : theme.text.primary,
                  },
                ]}
                style={
                  focused
                    ? styles.activeItem
                    : styles.item
                }
              />
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* ------------------------------------------------------------------- */}
      {/* LOGOUT                                                              */}
      {/* ------------------------------------------------------------------- */}

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={theme.icon.muted}
          />

          <Text style={styles.logoutText}>
            {tSafe('logout', 'Logout')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================================================================
// THEME-AWARE STYLES
// =============================================================================

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    scrollContent: {
      paddingTop: 0,
      paddingBottom: 16,
    },

    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.background.default,
    },

    // -------------------------------------------------------------------------
    // HEADER
    // -------------------------------------------------------------------------

    header: {
      backgroundColor:
        theme.hero?.background ||
        theme.brand.primary,

      paddingTop: 80,
      paddingBottom: 22,
      paddingHorizontal: 20,

      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,

      marginBottom: 16,

      shadowColor:
        theme.shadow?.color || '#000000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity:
        theme.shadow?.opacity || 0.08,

      shadowRadius: 10,

      elevation: 5,
    },

    avatarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,

      borderWidth: 3,
      borderColor:
        theme.hero?.foreground ||
        theme.text.inverse,

      marginRight: 16,

      backgroundColor:
        theme.surface.elevated,
    },

    userInfo: {
      flex: 1,
    },

    userName: {
      color:
        theme.hero?.foreground ||
        theme.text.inverse,

      fontSize: 18,
      fontWeight: '700',
      marginBottom: 5,
    },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    userLocation: {
      color:
        theme.hero?.mutedForeground ||
        theme.text.inverse,

      fontSize: 13,
      marginLeft: 4,
    },

    // -------------------------------------------------------------------------
    // DRAWER ITEMS
    // -------------------------------------------------------------------------

    itemsContainer: {
      paddingHorizontal: 8,
    },

    iconContainer: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    item: {
      borderRadius: 10,
      marginVertical: 2,
    },

    activeItem: {
      borderRadius: 10,
      marginVertical: 2,

      backgroundColor:
        theme.surface.selected,

      borderLeftWidth: 3,
      borderLeftColor:
        theme.brand.primary,
    },

    labelStyle: {
      fontSize: 15,
      fontWeight: '500',
      marginLeft: 0,
    },

    // -------------------------------------------------------------------------
    // FOOTER
    // -------------------------------------------------------------------------

    footer: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 20,

      borderTopWidth: 1,
      borderTopColor: theme.divider,

      backgroundColor:
        theme.background.default,
    },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 10,
    },

    logoutText: {
      fontSize: 15,
      marginLeft: 12,
      color: theme.text.secondary,
      fontWeight: '500',
    },
  });