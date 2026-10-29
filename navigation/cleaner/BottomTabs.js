import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  useRoute,
  useNavigation,
  DrawerActions,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';

import Dashboard from '../../screens/cleaner/Dashboard';
import Ionicons from '@expo/vector-icons/Ionicons';

import Messages from '../../screens/sharedscreen/Messages';
import IconWithBadge from '../../components/shared/IconWithBadge';
import ChatConversation from '../../screens/sharedscreen/ChatConversation';

import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import moment from 'moment';
import More from '../../components/shared/More';

import Schedules from '../../screens/cleaner/Schedules';
import SchedulePreview from '../../screens/cleaner/SchedulePreview';

import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';
import { AppText } from '../../ui';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* -------------------------------------------------------------------------- */
/*                              CHAT HEADER                                   */
/* -------------------------------------------------------------------------- */

const CustomChatHeader = (conversation) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.chatBackButton}
          activeOpacity={0.7}
        >
          <AntDesign
            name="arrowleft"
            size={24}
            color={theme.text.inverse}
          />
        </TouchableOpacity>

        <View style={styles.chatHeaderText}>
          <AppText
            variant="title"
            color={theme.text.inverse}
            style={styles.chatApartment}
          >
            {conversation?.schedule?.schedule?.apartment_name}
          </AppText>

          <AppText
            variant="caption"
            color={theme.hero?.mutedForeground || theme.text.inverse}
            style={styles.chatAddress}
          >
            {conversation?.schedule?.schedule?.address}
          </AppText>
        </View>
      </View>

      <View style={styles.chatScheduleBar}>
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color={theme.icon.muted}
          style={styles.chatCalendarIcon}
        />

        <AppText
          variant="caption"
          color={theme.text.secondary}
          style={styles.chatScheduleText}
        >
          {tSafe('schedule_label', 'Schedule')}{' '}
          {moment(
            conversation?.schedule?.schedule?.cleaning_date
          ).format('ddd MMM D')}
          {', '}
          {moment(
            conversation?.schedule?.schedule?.cleaning_time,
            'h:mm:ss A'
          ).format('h:mm A')}
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                              MESSAGE STACK                                 */
/* -------------------------------------------------------------------------- */

const MessageStack = () => {
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.text.primary,
        headerBackTitleVisible: false,

        headerStyle: {
          backgroundColor: theme.surface.elevated,
          elevation: 5,
          shadowColor: theme.shadow?.color || '#000000',
          shadowOpacity: theme.shadow?.opacity || 0.08,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 3,
        },

        tabBarLabelPosition: 'below-icon',

        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: theme.surface.elevated,
          borderTopColor: theme.divider,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },

        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
      initialRouteName={ROUTES.cleaner_messages}
    >
      <Stack.Screen
        name={ROUTES.cleaner_messages}
        component={Messages}
        options={({ route }) => ({
          headerShown: true,
          title: tSafe('chat_messages_title', 'Chat Messages'),

          headerTintColor: theme.text.secondary,

          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor: theme.surface.elevated,
            elevation: 5,
            shadowColor: theme.shadow?.color || '#000000',
            shadowOpacity: theme.shadow?.opacity || 0.08,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },

          gestureEnabled: false,
        })}
      />

      {/*
      <Stack.Screen
        name={ROUTES.cleaner_chat_conversation}
        component={ChatConversation}
        options={({ route }) => ({
          headerShown: true,
          header: () => (
            <CustomChatHeader schedule={route.params.conversation} />
          ),
          headerTintColor: theme.text.inverse,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: theme.brand.primary,
          },
        })}
      />
      */}
    </Stack.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SCHEDULE STACK                                */
/* -------------------------------------------------------------------------- */

const ScheduleStack = () => {
  const route = useRoute();
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.text.inverse,
        headerBackTitleVisible: false,

        headerStyle: {
          backgroundColor: theme.brand.primary,
        },
      }}
      initialRouteName={ROUTES.cleaner_schedules}
    >
      <Stack.Screen
        name={ROUTES.cleaner_schedules}
        component={Schedules}
        options={({ route }) => ({
          headerShown: false,
          title: tSafe('my_schedules_title', 'My Schedules'),
          headerTintColor: theme.text.inverse,
          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor: theme.brand.primary,
          },
        })}
      />

      <Stack.Screen
        name={ROUTES.cleaner_schedule_review}
        component={SchedulePreview}
        options={({ route }) => ({
          title: tSafe('schedule_details_title', 'Schedule Details'),
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/*                                JOB STACK                                   */
/* -------------------------------------------------------------------------- */

const JobStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.text.inverse,
        headerBackTitleVisible: false,

        headerStyle: {
          backgroundColor: theme.brand.primary,
        },
      }}
      initialRouteName={ROUTES.cleaner_jobs}
    >
      <Stack.Screen
        component={Jobs}
        name={ROUTES.cleaner_jobs}
        options={({ route }) => ({
          headerShown: true,
          title: tSafe('explore_schedules_title', 'Explore Schedules'),
          headerTintColor: theme.text.inverse,
          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor: theme.brand.primary,
          },
        })}
      />

      <Stack.Screen
        name={ROUTES.cleaner_job_details}
        component={JobDetails}
        options={({ route }) => ({
          headerShown: true,
          title: tSafe('job_details_title', 'Job Details'),
          headerTintColor: theme.text.inverse,
          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor: theme.brand.primary,
          },
        })}
      />
    </Stack.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/*                              BOTTOM TAB                                    */
/* -------------------------------------------------------------------------- */

function BottomTab() {
  const { totalUnreadCount } = useContext(AuthContext);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const navigation = useNavigation();

  const { theme } = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        /* -------------------------------------------------------------- */
        /* Keyboard                                                       */
        /* -------------------------------------------------------------- */

        tabBarButton: keyboardOpen ? () => null : undefined,

        headerShown: false,

        /* -------------------------------------------------------------- */
        /* Bottom toolbar colors                                         */
        /* -------------------------------------------------------------- */

        tabBarActiveTintColor: theme.brand.primary,

        tabBarInactiveTintColor: theme.text.muted,

        tabBarStyle: [
          styles.tabBar,
          keyboardOpen && styles.tabBarKeyboardHidden,
        ],

        tabBarItemStyle: styles.tabBarItem,

        /* -------------------------------------------------------------- */
        /* Icons                                                          */
        /* -------------------------------------------------------------- */

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === ROUTES.cleaner_home_tab) {
            iconName = 'home-outline';
          } else if (route.name === ROUTES.cleaner_jobs) {
            iconName = 'search';
          } else if (route.name === ROUTES.cleaner_schedules) {
            iconName = 'calendar-outline';
          } else if (route.name === ROUTES.cleaner_messages) {
            iconName = 'chatbox-ellipses-outline';

            return (
              <IconWithBadge
                icon={iconName}
                badgeCount={totalUnreadCount}
                size={22}
                color={color}
              />
            );
          } else if (route.name === ROUTES.cleaner_profile) {
            iconName = 'person-outline';
          } else if (route.name === ROUTES.cleaner_more) {
            iconName = 'menu-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={color}
            />
          );
        },

        /* -------------------------------------------------------------- */
        /* Labels                                                         */
        /* -------------------------------------------------------------- */

        tabBarLabel: ({ focused }) => {
          let label;

          if (route.name === ROUTES.cleaner_home_tab) {
            label = tSafe('tab_home', 'Home');
          } else if (route.name === ROUTES.cleaner_jobs) {
            label = tSafe('tab_explore', 'Explore');
          } else if (route.name === ROUTES.cleaner_schedules) {
            label = tSafe('tab_schedules', 'Schedules');
          } else if (route.name === ROUTES.cleaner_messages) {
            label = tSafe('tab_chat', 'Chat');
          } else if (route.name === ROUTES.cleaner_profile) {
            label = tSafe('tab_profile', 'Profile');
          } else if (route.name === ROUTES.cleaner_more) {
            label = tSafe('tab_more', 'More');
          }

          return (
            <AppText
              variant="caption"
              color={
                focused
                  ? theme.brand.primary
                  : theme.text.muted
              }
              style={[
                styles.tabLabel,
                focused && styles.tabLabelFocused,
              ]}
            >
              {label}
            </AppText>
          );
        },
      })}
    >
      {/* ---------------------------------------------------------------- */}
      {/* HOME                                                             */}
      {/* ---------------------------------------------------------------- */}

      <Tab.Screen
        name={ROUTES.cleaner_home_tab}
        component={Dashboard}
        options={({ route }) => ({
          headerShown: true,
          title: '',
          headerTintColor: theme.text.secondary,

          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor: theme.surface.elevated,
          },
        })}
      />

      {/* ---------------------------------------------------------------- */}
      {/* SCHEDULES                                                        */}
      {/* ---------------------------------------------------------------- */}

      <Tab.Screen
        name={ROUTES.cleaner_schedules}
        component={ScheduleStack}
        options={{
          headerShown: false,
          title: tSafe('tab_schedules', 'Schedules'),
          headerTintColor: theme.text.secondary,
          headerBackTitleVisible: false,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* JOB SEARCH                                                       */}
      {/* ---------------------------------------------------------------- */}

      {/*
      <Tab.Screen
        name={ROUTES.cleaner_jobs}
        component={JobStack}
        options={{
          headerShown: false,
          title: tSafe('tab_job_search', 'Job Search'),
          headerTintColor: theme.text.secondary,
          headerBackTitleVisible: false,
        }}
      />
      */}

      {/* ---------------------------------------------------------------- */}
      {/* MESSAGES                                                         */}
      {/* ---------------------------------------------------------------- */}

      <Tab.Screen
        name={ROUTES.cleaner_messages}
        component={MessageStack}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ??
            ROUTES.cleaner_messages;

          const isChat =
            routeName === ROUTES.cleaner_chat_conversation;

          return {
            tabBarStyle: [
              styles.tabBar,

              isChat && styles.chatTabBarHidden,
            ],

            tabBarItemStyle: [
              styles.tabBarItem,

              isChat && styles.chatTabBarItemHidden,
            ],
          };
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* MORE                                                             */}
      {/* ---------------------------------------------------------------- */}

      <Tab.Screen
        name={ROUTES.cleaner_more}
        component={More}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.dispatch(DrawerActions.openDrawer());
            e.preventDefault();
          },
        })}
      />
    </Tab.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  STYLES                                    */
/* -------------------------------------------------------------------------- */

const createStyles = (theme) =>
  StyleSheet.create({
    /* ------------------------------------------------------------------ */
    /* Bottom toolbar                                                     */
    /* ------------------------------------------------------------------ */

    tabBar: {
      height: 80,

      backgroundColor: theme.surface.elevated,

      borderTopWidth: 0.5,
      borderTopColor: theme.divider,

      paddingTop: 6,
      paddingBottom: 8,

      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: theme.shadow?.opacity || 0.08,
      shadowRadius: 5,

      elevation: 8,
    },

    tabBarItem: {
      paddingTop: 0,
    },

    tabLabel: {
      fontSize: 12,
      lineHeight: 16,
      marginTop: -4,
      marginBottom: 4,
      textAlign: 'center',
    },

    tabLabelFocused: {
      fontWeight: '600',
    },

    tabBarKeyboardHidden: {
      display: 'none',
    },

    /* ------------------------------------------------------------------ */
    /* Chat tab hidden state                                              */
    /* ------------------------------------------------------------------ */

    chatTabBarHidden: {
      height: 0,
      opacity: 0,
      overflow: 'hidden',
      borderTopWidth: 0,
    },

    chatTabBarItemHidden: {
      opacity: 0,
    },

    /* ------------------------------------------------------------------ */
    /* Chat header                                                        */
    /* ------------------------------------------------------------------ */

    chatHeader: {
      flexDirection: 'row',

      backgroundColor: theme.brand.primary,

      paddingTop:
        Platform.OS === 'android'
          ? 0
          : 50,

      paddingBottom: 10,
      paddingLeft: 10,
    },

    chatBackButton: {
      marginRight: 15,
      marginTop: 10,
    },

    chatHeaderText: {
      marginTop: 10,
      flex: 1,
    },

    chatApartment: {
      textAlign: 'center',
    },

    chatAddress: {
      textAlign: 'center',
      marginTop: 2,
    },

    chatScheduleBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',

      paddingVertical: 6,

      backgroundColor: theme.surface.elevated,

      borderBottomWidth: 0.5,
      borderBottomColor: theme.divider,
    },

    chatCalendarIcon: {
      marginLeft: 5,
      marginRight: 5,
    },

    chatScheduleText: {
      marginTop: 0,
    },
  });

export default BottomTab;