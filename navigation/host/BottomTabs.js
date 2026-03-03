import React, { useContext, useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';

import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';

import Dashboard from '../../screens/host/Dashboard';
import Bookings from '../../screens/host/Bookings';
import FindCleaners from '../../screens/host/FindCleaners';
import Messages from '../../screens/host/Messages';
import More from '../../screens/host/More';
import ChatConversation from '../../screens/sharedscreen/ChatConversation';
import IconWithBadge from '../../components/shared/IconWithBadge';

import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import CustomHeader from '../../components/shared/CustomHeader';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// const DashboardStack = () => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen 
//         name="DashboardMain" 
//         component={Dashboard} 
//         options={{ headerShown: false }} 
//         // 👇 THIS LINE makes sure nested params are forwarded
//         initialParams={{}} 
//       />
//     </Stack.Navigator>
//   );
// };

const MessageStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...TransitionPresets.FadeFromBottomAndroid,
      headerTintColor: COLORS.gray,
      headerBackTitleVisible: false,
      
      headerStyle: {
        backgroundColor: '#fff', // Background color of the header
        elevation: 5, // Adds elevation for Android
        shadowColor: '#000', // Shadow color for iOS
        shadowOpacity: 0.3, // Shadow opacity for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowRadius: 3, // Shadow radius for iOS
      },
    }}
  >
    <Stack.Screen
      name={ROUTES.cleaner_messages}
      component={Messages}
      options={{ 
        headerShown: true,
        title: "Chat Messages",
        headerTintColor:COLORS.gray,
        headerBackTitleVisible:false,
        headerStyle: {
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
        },
      }}
    />
    <Stack.Screen
      name={ROUTES.host_conversations}
      component={ChatConversation}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const BottomTabs = () => {
  const { totalUnreadCount } = useContext(AuthContext);

  const navigation = useNavigation();

  useEffect(() => {
    // Close drawer when BottomTabs mounts
    const timer = setTimeout(() => {
      navigation.closeDrawer();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // THIS DISABLES HEADERS ACROSS ALL TABS
        tabBarActiveTintColor: COLORS.primary,
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          switch (route.name) {
            case ROUTES.host_home_tab:
              iconName = 'home-outline';
              break;
            case ROUTES.host_dashboard:
            case ROUTES.host_find_cleaners:
              iconName = 'search';
              break;
            case ROUTES.host_bookings:
              iconName = 'calendar-outline';
              break;
            case ROUTES.host_messages:
              iconName = 'chatbox-ellipses-outline';
              return <IconWithBadge icon={iconName} badgeCount={totalUnreadCount} size={22} color={color} />;
            case ROUTES.host_more:
              iconName = 'menu-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label;
          switch (route.name) {
            case ROUTES.host_home_tab:
              label = 'Home';
              break;
            case ROUTES.host_bookings:
              label = 'Schedule';
              break;
            case ROUTES.host_messages:
              label = 'Chats';
              break;
            case ROUTES.host_find_cleaners:
              label = 'Cleaners';
              break;
            case ROUTES.host_more:
              label = 'More';
              break;
            default:
              label = route.name;
          }

          return (
            <Text style={{ color, fontSize: 12, marginTop: -4, marginBottom: focused ? 4 : 4 }}>
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen 
        name={ROUTES.host_home_tab} 
        component={Dashboard}
        options={{ 
          headerShown: false,
          title: "",
          headerStyle: {
            backgroundColor: '#fff', // Background color of the header
            elevation: 5, // Adds elevation for Android
            shadowColor: '#000', // Shadow color for iOS
            shadowOpacity: 0.3, // Shadow opacity for iOS
            shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
            shadowRadius: 3, // Shadow radius for iOS
          },
          // headerBackTitleVisible: true,
        }}
      />
      <Tab.Screen 
        name={ROUTES.host_bookings} 
        component={Bookings} 
        options={{ 
          headerShown: false,
          title: "",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:false,
        }}
      />
      <Tab.Screen 
        name={ROUTES.host_find_cleaners} 
        component={FindCleaners}
        options={({ navigation }) => ({
          headerShown: false,
          title: "",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:false,
          headerStyle:{
            backgroundColor:COLORS.primary
          }
          // header: () => <CustomHeader title="Find Cleaners" navigation={navigation} />,
          // tabBarLabel: 'Cleaners',
          // tabBarIcon: ({ color, size }) => (
          //   <Ionicons name="people-outline" color={color} size={size} />
          // ),
        })}
      />
      <Tab.Screen name={ROUTES.host_messages} component={MessageStack} />
      <Tab.Screen
        name={ROUTES.cleaner_more}
        component={More}
        listeners={({ navigation }) => ({
          tabPress: e => {
            navigation.dispatch(DrawerActions.openDrawer());
            e.preventDefault();
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;