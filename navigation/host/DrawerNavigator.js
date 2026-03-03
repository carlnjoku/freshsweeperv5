import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomDrawer from '../../components/shared/CustomDrawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import BottomTabs from './BottomTabs';
import Properties from '../../screens/host/Properties';
import Profile from '../../screens/host/Profile';
import Support from '../../screens/host/Support';
import Settings from '../../screens/host/Settings';
import Checklist from '../../screens/host/Checklist';
import { Feather } from '@expo/vector-icons';
import Connection from '../../screens/host/Connection';
import PaymentHistory from '../../screens/host/Payment/PaymentHistory';
import Notification from '../../components/shared/Notification';
import { AuthContext } from '../../context/AuthContext'; // ✅ Import AuthContext

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const PropertyStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerTintColor: COLORS.white,
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: COLORS.primary
        }
      }}
    >
      <Stack.Screen 
        name={ROUTES.cleaner_messages}
        component={Properties} 
        options={({ route }) => ({
          headerShown: false,
          title: "Properties",
          headerTintColor: COLORS.white,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: COLORS.primary
          }
        })}
      />
    </Stack.Navigator>
  )
}

// Reusable Icon Component with padding
const DrawerIcon = ({ IconComponent, name, color, size = 20 }) => (
  <View style={{ paddingLeft: 10 }}>
    <IconComponent name={name} size={size} color={color} />
  </View>
);

// ✅ Custom drawer icon for notifications with badge
const NotificationDrawerIcon = ({ focused, color, size }) => {
  const { notificationUnreadCount } = useContext(AuthContext);
  const count = notificationUnreadCount || 0;

  return (
    <View style={{ paddingLeft: 10, position: 'relative' }}>
      <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
      {count > 0 && (
        <View style={{
          position: 'absolute',
          top: -5,
          right: -8,
          backgroundColor: 'red',
          borderRadius: 10,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerItemStyle: {
          marginVertical: 0,
          paddingLeft: 0,
        },
        drawerActiveBackgroundColor: COLORS.primary_light_1,
        drawerActiveTintColor: COLORS.primary,
        drawerLabelStyle: {
          marginLeft: 0,
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 3,
        },
      }}
    >
      <Drawer.Screen 
        name={ROUTES.host_home_drawer} 
        component={BottomTabs} 
        options={{
          title: "Home",
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={Ionicons}
              name="home-outline"
              color={color}
              size={20}
            />
          )
        }}
      />
      
      {/* ✅ Notification screen with badge */}
      <Drawer.Screen 
        name={ROUTES.notification} 
        component={Notification} 
        options={{
          headerShown: true,
          title: "Notifications",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: (props) => <NotificationDrawerIcon {...props} />
        }}
      />
      <Drawer.Screen 
        name={ROUTES.host_profile} 
        component={Profile} 
        options={{
          headerShown: true,
          title: "My Profile",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="account-outline"
              color={color}
              size={20}
            />
          )
        }}
      />

      
      
      <Drawer.Screen 
        name={ROUTES.host_my_apartment} 
        component={PropertyStack} 
        options={{
          headerShown: true,
          title: "My Properties",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={AntDesign}
              name="home"
              color={color}
              size={19}
            />
          )
        }}
      />
      
      <Drawer.Screen 
        name={ROUTES.host_checklist} 
        component={Checklist} 
        options={{
          headerShown: true,
          title: "My Checklists",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={Feather}
              name="check-square"
              color={color}
              size={19}
            />
          )
        }}
      />
      
      <Drawer.Screen 
        name={ROUTES.host_payment_history} 
        component={PaymentHistory} 
        options={{
          headerShown: true,
          title: "Payment History",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="credit-card-clock"
              color={color}
              size={19}
            />
          )
        }}
      />
      
      <Drawer.Screen 
        name={ROUTES.cleaner_support} 
        component={Support} 
        options={{
          headerShown: true,
          title: "Support",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={MaterialCommunityIcons}
              name="lifebuoy"
              color={color}
              size={20}
            />
          )
        }}
      />
      
      <Drawer.Screen 
        name={ROUTES.cleaner_settings} 
        component={Settings} 
        options={{
          headerShown: true,
          title: "Settings",
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.gray,
          },
          drawerIcon: ({ focused, color, size }) => (
            <DrawerIcon
              IconComponent={Ionicons}
              name="settings-outline"
              color={color}
              size={20}
            />
          )
        }}
      />
    </Drawer.Navigator>
  )
}

export default DrawerNavigator;
  