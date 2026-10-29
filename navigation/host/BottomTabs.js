import React, {
  useContext,
  useEffect,
} from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';

import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';

import Dashboard from '../../screens/host/Dashboard';
import Bookings from '../../screens/host/Bookings';
import FindCleaners from '../../screens/host/FindCleaners';

import Messages from '../../screens/sharedscreen/Messages';
import More from '../../screens/host/More';
import ChatConversation from '../../screens/sharedscreen/ChatConversation';

import IconWithBadge from '../../components/shared/IconWithBadge';

import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';

import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';
import { AppText } from '../../ui';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* -------------------------------------------------------------------------- */
/*                              MESSAGE STACK                                 */
/* -------------------------------------------------------------------------- */

const MessageStack = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.FadeFromBottomAndroid,

        headerTintColor:
          theme.text.primary,

        headerBackTitleVisible: false,

        headerStyle: {
          backgroundColor:
            theme.surface.elevated,

          elevation: 5,

          shadowColor:
            theme.shadow?.color ||
            '#000000',

          shadowOpacity:
            theme.shadow?.opacity ||
            0.08,

          shadowOffset: {
            width: 0,
            height: 2,
          },

          shadowRadius: 3,
        },
      }}
    >
      <Stack.Screen
        name={ROUTES.cleaner_messages}
        component={Messages}
        options={{
          headerShown: true,

          title: tSafe(
            'chat_messages_title',
            'Chat Messages'
          ),

          headerTintColor:
            theme.text.secondary,

          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor:
              theme.surface.elevated,

            borderBottomWidth: 1,

            borderBottomColor:
              theme.divider,

            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />

      {/*
      <Stack.Screen
        name={ROUTES.host_conversations}
        component={ChatConversation}
        options={{
          headerShown: false,
        }}
      />
      */}
    </Stack.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/*                              BOTTOM TABS                                   */
/* -------------------------------------------------------------------------- */

const BottomTabs = () => {
  const {
    totalUnreadCount,
  } = useContext(AuthContext);

  const navigation =
    useNavigation();

  const {
    theme,
    isDark,
  } = useTheme();

  const styles =
    createStyles(theme);

  /* ---------------------------------------------------------------------- */
  /* Close drawer after entering dashboard                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.closeDrawer();
    }, 100);

    return () =>
      clearTimeout(timer);
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        /* ---------------------------------------------------------------- */
        /* Header                                                           */
        /* ---------------------------------------------------------------- */

        headerShown: false,

        /* ---------------------------------------------------------------- */
        /* Bottom toolbar                                                   */
        /* ---------------------------------------------------------------- */

        tabBarLabelPosition:
          'below-icon',

        tabBarStyle:
          styles.tabBar,

        tabBarItemStyle:
          styles.tabBarItem,

        tabBarActiveTintColor:
          theme.brand.primary,

        tabBarInactiveTintColor:
          theme.text.muted,

        /* ---------------------------------------------------------------- */
        /* Label                                                            */
        /* ---------------------------------------------------------------- */

        tabBarLabelStyle:
          styles.tabBarLabel,

        /* ---------------------------------------------------------------- */
        /* Icon                                                             */
        /* ---------------------------------------------------------------- */

        tabBarIconStyle:
          styles.tabBarIcon,

        tabBarIcon: ({
          color,
          focused,
        }) => {
          let iconName;

          switch (route.name) {
            case ROUTES.host_home_tab:
              iconName =
                'home-outline';
              break;

            case ROUTES.host_dashboard:
            case ROUTES.host_find_cleaners:
              iconName =
                'search';
              break;

            case ROUTES.host_bookings:
              iconName =
                'calendar-outline';
              break;

            case ROUTES.host_messages:
              iconName =
                'chatbox-ellipses-outline';

              return (
                <IconWithBadge
                  icon={iconName}
                  badgeCount={
                    totalUnreadCount
                  }
                  size={22}
                  color={color}
                />
              );

            case ROUTES.host_more:
              iconName =
                'menu-outline';
              break;

            default:
              iconName =
                'ellipse-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={color}
            />
          );
        },

        /* ---------------------------------------------------------------- */
        /* Label                                                            */
        /* ---------------------------------------------------------------- */

        tabBarLabel: ({
          focused,
        }) => {
          let label;

          switch (route.name) {
            case ROUTES.host_home_tab:
              label = tSafe(
                'tab_home',
                'Home'
              );
              break;

            case ROUTES.host_bookings:
              label = tSafe(
                'tab_schedule',
                'Schedule'
              );
              break;

            case ROUTES.host_messages:
              label = tSafe(
                'tab_chats',
                'Chats'
              );
              break;

            case ROUTES.host_find_cleaners:
              label = tSafe(
                'tab_cleaners',
                'Cleaners'
              );
              break;

            case ROUTES.host_more:
              label = tSafe(
                'tab_more',
                'More'
              );
              break;

            default:
              label =
                route.name;
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
                focused &&
                  styles.tabLabelFocused,
              ]}
            >
              {label}
            </AppText>
          );
        },
      })}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HOME                                                               */}
      {/* ------------------------------------------------------------------ */}

      <Tab.Screen
        name={
          ROUTES.host_home_tab
        }
        component={Dashboard}
        options={{
          headerShown: false,
          title: '',

          headerStyle: {
            backgroundColor:
              theme.surface
                .elevated,

            elevation: 5,

            shadowColor:
              theme.shadow?.color ||
              '#000000',

            shadowOpacity:
              theme.shadow?.opacity ||
              0.08,

            shadowOffset: {
              width: 0,
              height: 2,
            },

            shadowRadius: 3,
          },
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* BOOKINGS                                                           */}
      {/* ------------------------------------------------------------------ */}

      <Tab.Screen
        name={
          ROUTES.host_bookings
        }
        component={Bookings}
        options={{
          headerShown: false,
          title: '',

          headerTintColor:
            theme.text.primary,

          headerBackTitleVisible:
            false,
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* FIND CLEANERS                                                      */}
      {/* ------------------------------------------------------------------ */}

      <Tab.Screen
        name={
          ROUTES.host_find_cleaners
        }
        component={
          FindCleaners
        }
        options={{
          headerShown: false,
          title: '',

          headerTintColor:
            theme.text.primary,

          headerBackTitleVisible:
            false,

          headerStyle: {
            backgroundColor:
              theme.brand.primary,
          },
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* MESSAGES                                                           */}
      {/* ------------------------------------------------------------------ */}

      <Tab.Screen
        name={
          ROUTES.host_messages
        }
        component={
          MessageStack
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* MORE                                                               */}
      {/* ------------------------------------------------------------------ */}

      <Tab.Screen
        name={
          ROUTES.cleaner_more
        }
        component={More}
        listeners={({
          navigation,
        }) => ({
          tabPress: (e) => {
            navigation.dispatch(
              DrawerActions.openDrawer()
            );

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
    /* ---------------------------------------------------------------------- */
    /* Bottom toolbar                                                         */
    /* ---------------------------------------------------------------------- */

    tabBar: {
      height: 70,

      backgroundColor:
        theme.surface.elevated,

      borderTopWidth: 0.5,

      borderTopColor:
        theme.divider,

      paddingBottom: 8,
      paddingTop: 6,

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: -2,
      },

      shadowOpacity:
        theme.shadow?.opacity ||
        0.08,

      shadowRadius: 5,

      elevation: 8,
    },

    tabBarItem: {
      paddingTop: 0,
    },

    /* ---------------------------------------------------------------------- */
    /* Icons                                                                  */
    /* ---------------------------------------------------------------------- */

    tabBarIcon: {
      marginTop: 0,
    },

    /* ---------------------------------------------------------------------- */
    /* Labels                                                                 */
    /* ---------------------------------------------------------------------- */

    tabBarLabel: {
      fontSize: 12,
      lineHeight: 16,

      marginTop: -4,
      marginBottom: 4,

      textAlign: 'center',
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
  });

export default BottomTabs;




// import React, { useContext, useEffect } from 'react';
// import { Text } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { DrawerActions } from '@react-navigation/native';

// import ROUTES from '../../constants/routes';
// import COLORS from '../../constants/colors';
// import { AuthContext } from '../../context/AuthContext';

// import Dashboard from '../../screens/host/Dashboard';
// import Bookings from '../../screens/host/Bookings';
// import FindCleaners from '../../screens/host/FindCleaners';
// // import Messages from '../../screens/host/Messages';
// import Messages from '../../screens/sharedscreen/Messages';
// import More from '../../screens/host/More';
// import ChatConversation from '../../screens/sharedscreen/ChatConversation';
// import IconWithBadge from '../../components/shared/IconWithBadge';

// import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
// import CustomHeader from '../../components/shared/CustomHeader';
// import { useNavigation } from '@react-navigation/native';
// import { tSafe } from '../../utils/tSafe';

// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();



// const MessageStack = () => (
//   <Stack.Navigator
//     screenOptions={{
//       ...TransitionPresets.FadeFromBottomAndroid,
//       headerTintColor: '#000',
//       headerBackTitleVisible: false,
//       headerStyle: {
//         backgroundColor: '#fff',
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOpacity: 0.3,
//         shadowOffset: { width: 0, height: 2 },
//         shadowRadius: 3,
//       },
//     }}
//   >
//     <Stack.Screen
//       name={ROUTES.cleaner_messages}
//       component={Messages}
//       options={{
//         headerShown: true,
//         title: tSafe('chat_messages_title', 'Chat Messages'),
//         headerTintColor: COLORS.gray,
//         headerBackTitleVisible: false,
//         headerStyle: {
//           borderBottomWidth: 1,
//           borderBottomColor: '#E5E5EA',
//         },
//       }}
//     />
//     {/* <Stack.Screen
//       name={ROUTES.host_conversations}
//       component={ChatConversation}
//       options={{ headerShown: false }}
//     /> */}
//   </Stack.Navigator>
// );

// const BottomTabs = () => {
//   const { totalUnreadCount } = useContext(AuthContext);
//   const navigation = useNavigation();



//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.closeDrawer();
//     }, 100);
//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarLabelPosition: 'below-icon',   // 👈 Forces icon above label
//         tabBarStyle: {
//           height: 70,                        // 👈 Adjust height to accommodate stacked layout
//           paddingBottom: 8,
//           paddingTop: 6,
//         },
//         tabBarLabelStyle: {
//           fontSize: 11,
//           marginTop: 2,
//         },
//         tabBarIconStyle: {
//           marginTop: 0,
//         },
//         headerShown: false,
//         tabBarActiveTintColor: COLORS.primary,
//         tabBarIcon: ({ color, focused }) => {
//           let iconName;
//           switch (route.name) {
//             case ROUTES.host_home_tab:
//               iconName = 'home-outline';
//               break;
//             case ROUTES.host_dashboard:
//             case ROUTES.host_find_cleaners:
//               iconName = 'search';
//               break;
//             case ROUTES.host_bookings:
//               iconName = 'calendar-outline';
//               break;
//             case ROUTES.host_messages:
//               iconName = 'chatbox-ellipses-outline';
//               return <IconWithBadge icon={iconName} badgeCount={totalUnreadCount} size={22} color={color} />;
//             case ROUTES.host_more:
//               iconName = 'menu-outline';
//               break;
//             default:
//               iconName = 'ellipse-outline';
//           }
//           return <Ionicons name={iconName} size={22} color={color} />;
//         },
//         tabBarLabel: ({ focused, color }) => {
//           let label;
//           switch (route.name) {
//             case ROUTES.host_home_tab:
//               label = tSafe('tab_home', 'Home');
//               break;
//             case ROUTES.host_bookings:
//               label = tSafe('tab_schedule', 'Schedule');
//               break;
//             case ROUTES.host_messages:
//               label = tSafe('tab_chats', 'Chats');
//               break;
//             case ROUTES.host_find_cleaners:
//               label = tSafe('tab_cleaners', 'Cleaners');
//               break;
//             case ROUTES.host_more:
//               label = tSafe('tab_more', 'More');
//               break;
//             default:
//               label = route.name;
//           }
//           return (
//             <Text style={{ color, fontSize: 12, marginTop: -4, marginBottom: focused ? 4 : 4 }}>
//               {label}
//             </Text>
//           );
//         },
//       })}
//     >
//       <Tab.Screen
//         name={ROUTES.host_home_tab}
//         component={Dashboard}
//         options={{
//           headerShown: false,
//           title: "",
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//         }}
//       />
//       <Tab.Screen
//         name={ROUTES.host_bookings}
//         component={Bookings}
//         options={{
//           headerShown: false,
//           title: "",
//           headerTintColor: "#000",
//           headerBackTitleVisible: false,
//         }}
//       />
//       <Tab.Screen
//         name={ROUTES.host_find_cleaners}
//         component={FindCleaners}
//         options={({ navigation }) => ({
//           headerShown: false,
//           title: "",
//           headerTintColor: "#000",
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: COLORS.primary,
//           },
//         })}
//       />
//       <Tab.Screen name={ROUTES.host_messages} component={MessageStack} />
//       <Tab.Screen
//         name={ROUTES.cleaner_more}
//         component={More}
//         listeners={({ navigation }) => ({
//           tabPress: e => {
//             navigation.dispatch(DrawerActions.openDrawer());
//             e.preventDefault();
//           },
//         })}
//       />
//     </Tab.Navigator>
//   );
// };

// export default BottomTabs;