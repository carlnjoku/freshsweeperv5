// import React, { useContext } from 'react';
// import { View, Text } from 'react-native';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { createStackNavigator } from '@react-navigation/stack';
// import CustomDrawer from '../../components/shared/CustomDrawer';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import BottomTabs from './BottomTabs';
// import Properties from '../../screens/host/Properties';
// import Profile from '../../screens/host/Profile';
// import Support from '../../screens/host/Support';
// import Settings from '../../screens/host/Settings';
// import Checklist from '../../screens/host/Checklist';
// import { Feather } from '@expo/vector-icons';
// import Connection from '../../screens/host/Connection';
// import PaymentHistory from '../../screens/host/Payment/PaymentHistory';
// import Notification from '../../components/shared/Notification';
// import { AuthContext } from '../../context/AuthContext'; // ✅ Import AuthContext
// import TeamManagement from '../../screens/host/TeamManagement';

// const Drawer = createDrawerNavigator();
// const Stack = createStackNavigator();

// const PropertyStack = () => {
//   return (
//     <Stack.Navigator 
//       screenOptions={{
//         headerTintColor: COLORS.white,
//         headerBackTitleVisible: false,
//         headerStyle: {
//           backgroundColor: COLORS.primary
//         }
//       }}
//     >
//       <Stack.Screen 
//         name={ROUTES.cleaner_messages}
//         component={Properties} 
//         options={({ route }) => ({
//           headerShown: false,
//           title: "Properties",
//           headerTintColor: COLORS.white,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: COLORS.primary
//           }
//         })}
//       />
//     </Stack.Navigator>
//   )
// }

// // Reusable Icon Component with padding
// const DrawerIcon = ({ IconComponent, name, color, size = 20 }) => (
//   <View style={{ paddingLeft: 10 }}>
//     <IconComponent name={name} size={size} color={color} />
//   </View>
// );

// // ✅ Custom drawer icon for notifications with badge
// const NotificationDrawerIcon = ({ focused, color, size }) => {
//   const { notificationUnreadCount } = useContext(AuthContext);
//   const count = notificationUnreadCount || 0;

//   return (
//     <View style={{ paddingLeft: 10, position: 'relative' }}>
//       <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
//       {count > 0 && (
//         <View style={{
//           position: 'absolute',
//           top: -5,
//           right: -8,
//           backgroundColor: 'red',
//           borderRadius: 10,
//           minWidth: 16,
//           height: 16,
//           justifyContent: 'center',
//           alignItems: 'center',
//           paddingHorizontal: 4,
//         }}>
//           <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
//             {count > 99 ? '99+' : count}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const DrawerNavigator = () => {
//   return (
//     <Drawer.Navigator
//       drawerContent={props => <CustomDrawer {...props} />}
//       screenOptions={{
//         headerShown: false,
//         drawerItemStyle: {
//           marginVertical: 0,
//           paddingLeft: 0,
//         },
//         drawerActiveBackgroundColor: COLORS.primary_light_1,
//         drawerActiveTintColor: COLORS.primary,
//         drawerLabelStyle: {
//           marginLeft: 0,
//         },
//         headerStyle: {
//           backgroundColor: '#fff',
//           elevation: 5,
//           shadowColor: '#000',
//           shadowOpacity: 0.3,
//           shadowOffset: { width: 0, height: 2 },
//           shadowRadius: 3,
//         },
//       }}
//     >
//       <Drawer.Screen 
//         name={ROUTES.host_home_drawer} 
//         component={BottomTabs} 
//         options={{
//           title: "Home",
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={Ionicons}
//               name="home-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
      
//       {/* ✅ Notification screen with badge */}
//       <Drawer.Screen 
//         name={ROUTES.notification} 
//         component={Notification} 
//         options={{
//           headerShown: true,
//           title: "Notifications",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: (props) =><NotificationDrawerIcon {...props} />
//         }}
//       />
//       <Drawer.Screen 
//         name={ROUTES.host_profile} 
//         component={Profile} 
//         options={{
//           headerShown: true,
//           title: "My Profile",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="account-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
//       <Drawer.Screen 
//         name={ROUTES.host_team} 
//         component={TeamManagement} 
//         options={{
//           headerShown: true,
//           title: "My Team",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="account-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />

      
      
//       <Drawer.Screen 
//         name={ROUTES.host_my_apartment} 
//         component={PropertyStack} 
//         options={{
//           headerShown: true,
//           title: "My Properties",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={AntDesign}
//               name="home"
//               color={color}
//               size={19}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.host_checklist} 
//         component={Checklist} 
//         options={{
//           headerShown: true,
//           title: "My Checklists",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={Feather}
//               name="check-square"
//               color={color}
//               size={19}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.host_payment_history} 
//         component={PaymentHistory} 
//         options={{
//           headerShown: true,
//           title: "Payment History",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="credit-card-clock"
//               color={color}
//               size={19}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.cleaner_support} 
//         component={Support} 
//         options={{
//           headerShown: true,
//           title: "Support",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="lifebuoy"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.cleaner_settings} 
//         component={Settings} 
//         options={{
//           headerShown: true,
//           title: "Settings",
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={Ionicons}
//               name="settings-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
//     </Drawer.Navigator>
//   )
// }

// export default DrawerNavigator;
  

// import React, { useContext } from 'react';
// import { View, Text } from 'react-native';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { createStackNavigator } from '@react-navigation/stack';
// import CustomDrawer from '../../components/shared/CustomDrawer';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import BottomTabs from './BottomTabs';
// import Properties from '../../screens/host/Properties';
// import Profile from '../../screens/host/Profile';
// import Support from '../../screens/host/Support';
// import Settings from '../../screens/host/Settings';
// import Checklist from '../../screens/host/Checklist';
// import { Feather } from '@expo/vector-icons';
// import Connection from '../../screens/host/Connection';
// import PaymentHistory from '../../screens/host/Payment/PaymentHistory';
// import Notification from '../../components/shared/Notification';
// import { AuthContext } from '../../context/AuthContext';
// import TeamManagement from '../../screens/host/TeamManagement';
// import { tSafe } from '../../utils/tSafe'; // added import
// import TeamList from '../../screens/host/Team/TeamList';
// import CustomMenuButton from '../../components/shared/CustomMenuButton';

// const Drawer = createDrawerNavigator();
// const Stack = createStackNavigator();

// const PropertyStack = () => {
//   return (
//     <Stack.Navigator 
//       screenOptions={{
//         headerTintColor: COLORS.white,
//         headerBackTitleVisible: false,
//         headerStyle: {
//           backgroundColor: COLORS.primary
//         }
//       }}
//     >
//       <Stack.Screen 
//         name={ROUTES.cleaner_messages}
//         component={Properties} 
//         options={({ route }) => ({
//           headerShown: false,
//           title: tSafe('drawer_my_properties', 'Properties'),
//           headerTintColor: COLORS.white,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: COLORS.primary
//           }
//         })}
//       />
//     </Stack.Navigator>
//   )
// }

// // Reusable Icon Component with padding
// const DrawerIcon = ({ IconComponent, name, color, size = 20 }) => (
//   <View style={{ paddingLeft: 10 }}>
//     <IconComponent name={name} size={size} color={color} />
//   </View>
// );

// // ✅ Custom drawer icon for notifications with badge
// const NotificationDrawerIcon = ({ focused, color, size }) => {
//   const { notificationUnreadCount } = useContext(AuthContext);
//   const count = notificationUnreadCount || 0;

//   return (
//     <View style={{ paddingLeft: 10, position: 'relative' }}>
//       <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
//       {count > 0 && (
//         <View style={{
//           position: 'absolute',
//           top: -5,
//           right: -8,
//           backgroundColor: 'red',
//           borderRadius: 10,
//           minWidth: 16,
//           height: 16,
//           justifyContent: 'center',
//           alignItems: 'center',
//           paddingHorizontal: 4,
//         }}>
//           <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
//             {count > 99 ? '99+' : count}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const DrawerNavigator = () => {
//   return (
//     <Drawer.Navigator
//       drawerContent={props => <CustomDrawer {...props} />}
//       screenOptions={{
//         headerShown: false,
//         drawerItemStyle: {
//           marginVertical: 0,
//           paddingLeft: 0,
//         },
//         drawerActiveBackgroundColor: COLORS.primary_light_1,
//         drawerActiveTintColor: COLORS.primary,
//         drawerLabelStyle: {
//           marginLeft: 0,
//         },
//         headerStyle: {
//           backgroundColor: '#fff',
//           elevation: 5,
//           shadowColor: '#000',
//           shadowOpacity: 0.3,
//           shadowOffset: { width: 0, height: 2 },
//           shadowRadius: 3,
//         },
//       }}
//     >
//       <Drawer.Screen 
//         name={ROUTES.host_home_drawer} 
//         component={BottomTabs} 
//         options={{
//           title: tSafe('drawer_home', 'Home'),
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={Ionicons}
//               name="home-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
      
//       {/* ✅ Notification screen with badge */}
//       <Drawer.Screen 
//         name={ROUTES.notification} 
//         component={Notification} 
//         options={{
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           headerShown: true,
//           title: tSafe('drawer_notifications', 'Notifications'),
//           headerTintColor: "#000",
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: (props) =><NotificationDrawerIcon {...props} />
//         }}
//       />
//       <Drawer.Screen 
//         name={ROUTES.host_profile} 
//         component={Profile} 
//         options={{
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           headerShown: true,
//           title: tSafe('drawer_my_profile', 'My Profile'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="account-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
//       <Drawer.Screen 
//         name={ROUTES.host_team} 
//         component={TeamManagement} 
//         options={{
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           headerShown: true,
//           title: tSafe('drawer_my_team', 'My Team'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="account-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
//       <Drawer.Screen 
//         name={ROUTES.host_team_list} 
//         component={TeamList} 
//         options={{
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           headerShown: true,
//           title: tSafe('drawer_my_team_list', 'My Team List'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="account-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />

//       <Drawer.Screen 
//         name={ROUTES.host_my_apartment} 
//         component={PropertyStack} 
//         options={{
//           headerShown: true,
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           title: tSafe('drawer_my_properties', 'My Properties'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={AntDesign}
//               name="home"
//               color={color}
//               size={19}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.host_checklist} 
//         component={Checklist} 
//         options={{
//           headerShown: true,
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           title: tSafe('drawer_my_checklists', 'My Checklists'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={Feather}
//               name="check-square"
//               color={color}
//               size={19}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.host_payment_history} 
//         component={PaymentHistory} 
//         options={{
//           headerShown: true,
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           title: tSafe('drawer_payment_history', 'Payment History'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="credit-card-clock"
//               color={color}
//               size={19}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.cleaner_support} 
//         component={Support} 
//         options={{
//           headerShown: true,
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           title: tSafe('drawer_support', 'Support'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={MaterialCommunityIcons}
//               name="lifebuoy"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
      
//       <Drawer.Screen 
//         name={ROUTES.cleaner_settings} 
//         component={Settings} 
//         options={{
//           headerShown: true,
//           headerLeft: ({ tintColor }) => <CustomMenuButton tintColor={tintColor || '#333'} />,
//           title: tSafe('drawer_settings', 'Settings'),
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: true,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize: 16,
//             color: COLORS.gray,
//           },
//           drawerIcon: ({ focused, color, size }) => (
//             <DrawerIcon
//               IconComponent={Ionicons}
//               name="settings-outline"
//               color={color}
//               size={20}
//             />
//           )
//         }}
//       />
//     </Drawer.Navigator>
//   )
// }

// export default DrawerNavigator;



import React, { useContext } from 'react';
import { View, Text } from 'react-native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from '@expo/vector-icons';

import CustomDrawer from '../../components/shared/CustomDrawer';
import CustomMenuButton from '../../components/shared/CustomMenuButton';
import Notification from '../../components/shared/Notification';

import BottomTabs from './BottomTabs';

import Properties from '../../screens/host/Properties';
import Profile from '../../screens/host/Profile';
import Support from '../../screens/host/Support';
import Settings from '../../screens/host/Settings';
import Checklist from '../../screens/host/Checklist';
import Connection from '../../screens/host/Connection';
import PaymentHistory from '../../screens/host/Payment/PaymentHistory';
import TeamManagement from '../../screens/host/TeamManagement';
import TeamList from '../../screens/host/Team/TeamList';

import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import { tSafe } from '../../utils/tSafe';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

/* -------------------------------------------------------------------------- */
/* DRAWER ICON                                                                */
/* -------------------------------------------------------------------------- */

const DrawerIcon = ({
  IconComponent,
  name,
  color,
  size = 20,
}) => (
  <View style={{ paddingLeft: 10 }}>
    <IconComponent
      name={name}
      size={size}
      color={color}
    />
  </View>
);

/* -------------------------------------------------------------------------- */
/* NOTIFICATION DRAWER ICON                                                   */
/* -------------------------------------------------------------------------- */

const NotificationDrawerIcon = ({
  color,
  size = 20,
}) => {
  const { notificationUnreadCount } = useContext(AuthContext);

  const count = notificationUnreadCount || 0;

  return (
    <View
      style={{
        paddingLeft: 10,
        position: 'relative',
      }}
    >
      <MaterialCommunityIcons
        name="bell-outline"
        size={size}
        color={color}
      />

      {count > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -5,
            right: -8,
            backgroundColor: '#EF4444',
            borderRadius: 10,
            minWidth: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* PROPERTY STACK                                                             */
/* -------------------------------------------------------------------------- */

const PropertyStack = () => {
  const { theme } = useTheme();

  const textColor = theme.text.primary;
  const headerBackground = theme.surface.elevated;
  const borderColor = theme.border.default;

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: textColor,
        headerBackTitleVisible: false,

        headerStyle: {
          backgroundColor: headerBackground,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        },

        headerTitleStyle: {
          color: textColor,
          fontWeight: '600',
          fontSize: 18,
        },

        headerShadowVisible: false,

        cardStyle: {
          backgroundColor: theme.background.default,
        },
      }}
    >
      <Stack.Screen
        name={ROUTES.cleaner_messages}
        component={Properties}
        options={{
          headerShown: false,
          title: tSafe(
            'drawer_my_properties',
            'Properties'
          ),
        }}
      />
    </Stack.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/* HOST DRAWER NAVIGATOR                                                      */
/* -------------------------------------------------------------------------- */

const DrawerNavigator = () => {
  const { theme } = useTheme();

  const backgroundColor = theme.background.default;
  const surfaceColor = theme.surface.default;
  const elevatedColor = theme.surface.elevated;

  const textColor = theme.text.primary;
  const secondaryTextColor = theme.text.secondary;
  const borderColor = theme.border.default;
  const primaryColor = theme.brand.primary;

  const sharedHeaderStyle = {
    backgroundColor: elevatedColor,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  };

  const sharedHeaderTitleStyle = {
    fontWeight: '600',
    fontSize: 16,
    color: textColor,
  };

  const renderMenuButton = () => (
    <CustomMenuButton tintColor={textColor} />
  );

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawer {...props} />
      )}
      screenOptions={{
        headerShown: false,

        // Drawer screen content background.
        sceneStyle: {
          backgroundColor,
        },

        // Drawer panel background.
        drawerStyle: {
          backgroundColor: surfaceColor,
        },

        // Drawer item appearance.
        drawerItemStyle: {
          marginVertical: 0,
          paddingLeft: 0,
        },

        drawerActiveBackgroundColor:
          theme.surface.selected || elevatedColor,

        drawerActiveTintColor: primaryColor,
        drawerInactiveTintColor: secondaryTextColor,

        drawerLabelStyle: {
          marginLeft: 0,
        },

        // Shared header appearance.
        headerStyle: sharedHeaderStyle,
        headerTintColor: textColor,
        headerTitleStyle: sharedHeaderTitleStyle,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HOME                                                               */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_home_drawer}
        component={BottomTabs}
        options={{
          title: tSafe('drawer_home', 'Home'),
          headerShown: false,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={Ionicons}
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* NOTIFICATIONS                                                      */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.notification}
        component={Notification}
        options={{
          title: tSafe(
            'drawer_notifications',
            'Notifications'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,
          headerStyle: sharedHeaderStyle,
          headerTintColor: textColor,
          headerTitleStyle: sharedHeaderTitleStyle,

          drawerIcon: (props) => (
            <NotificationDrawerIcon {...props} />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* PROFILE                                                            */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_profile}
        component={Profile}
        options={{
          title: tSafe(
            'drawer_my_profile',
            'My Profile'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="account-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* TEAM MANAGEMENT                                                    */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_team}
        component={TeamManagement}
        options={{
          title: tSafe(
            'drawer_my_cleaners',
            'My Cleaners'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="account-group-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* TEAM LIST                                                          */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_team_list}
        component={TeamList}
        options={{
          title: tSafe(
            'drawer_my_team_list',
            'My Team List'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="account-multiple-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* MY PROPERTIES                                                      */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_my_apartment}
        component={PropertyStack}
        options={{
          title: tSafe(
            'drawer_my_properties',
            'My Properties'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={AntDesign}
              name="home"
              color={color}
              size={19}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* CHECKLISTS                                                         */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_checklist}
        component={Checklist}
        options={{
          title: tSafe(
            'drawer_my_checklists',
            'My Checklists'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={Feather}
              name="check-square"
              color={color}
              size={19}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* PAYMENT HISTORY                                                    */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.host_payment_history}
        component={PaymentHistory}
        options={{
          title: tSafe(
            'drawer_payment_history',
            'Payment History'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="credit-card-clock"
              color={color}
              size={19}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* SUPPORT                                                            */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.cleaner_support}
        component={Support}
        options={{
          title: tSafe(
            'drawer_support',
            'Support'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="lifebuoy"
              color={color}
              size={20}
            />
          ),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* SETTINGS                                                           */}
      {/* ------------------------------------------------------------------ */}

      <Drawer.Screen
        name={ROUTES.cleaner_settings}
        component={Settings}
        options={{
          title: tSafe(
            'drawer_settings',
            'Settings'
          ),

          headerShown: true,
          headerLeft: renderMenuButton,

          drawerIcon: ({ color, size }) => (
            <DrawerIcon
              IconComponent={Ionicons}
              name="settings-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;