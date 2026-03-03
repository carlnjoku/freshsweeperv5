// import React from 'react'
// import { StyleSheet, Text, View } from 'react-native'
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import BottomTabs from './BottomTabs';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CustomDrawer from '../../components/shared/CustomDrawer';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import Profile from '../../screens/cleaner/Profile';
// import Support from '../../screens/cleaner/Support';
// import Settings from '../../screens/cleaner/Settings';
// import Earnings from '../../screens/cleaner/Payments/Earnings';


// const DrawerNavigator = () => {

//     const Drawer = createDrawerNavigator();
    
//     return (
//       <Drawer.Navigator
//         drawerContent={props => <CustomDrawer {...props} />}
//         screenOptions={{
//           headerShown: false,
//           drawerItemStyle: {
//             marginVertical: 0, // removes vertical spacing between items
//             paddingLeft: 0,    // aligns icon and label
//           },
//           drawerActiveBackgroundColor:COLORS.primary_light_1,
//           drawerActiveTintColor:COLORS.primary,
//           drawerLabelStyle: {
//               marginLeft:0,
//           },
//           headerStyle: {
//             backgroundColor: '#fff', // Background color of the header
//             elevation: 5, // Adds elevation for Android
//             shadowColor: '#000', // Shadow color for iOS
//             shadowOpacity: 0.3, // Shadow opacity for iOS
//             shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//             shadowRadius: 3, // Shadow radius for iOS
//           },
//         }}
//       >   
//       <Drawer.Screen
//         name={ROUTES.cleaner_home_drawer}
//         component={BottomTabs}
//         options={{
//           title: 'Home',
//           drawerIcon:({focus, color, size}) => (
//               <Ionicons name="home-outline" size={20} color={color} />
//           )
          
//         }}
//       />

//       <Drawer.Screen 
//         name={ROUTES.cleaner_profile} 
//         component={Profile} 
//         options={{
//           headerShown:true,
//           title:"My Profile",
//           headerTintColor:COLORS.gray,
//           headerBackTitleVisible:true,
//           headerStyle: {
//             backgroundColor: '#fff', // Background color of the header
//             elevation: 5, // Adds elevation for Android
//             shadowColor: '#000', // Shadow color for iOS
//             shadowOpacity: 0.3, // Shadow opacity for iOS
//             shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//             shadowRadius: 3, // Shadow radius for iOS
//           },
          
//           headerTitleStyle: {
//             fontWeight: '600',
//             fontSize:18,
//             color:COLORS.gray,
//           },
//             drawerIcon:({focus, color, size}) => (
//                 <MaterialCommunityIcons name="storefront-outline" size={20} color={color} />
//             )
//         }}
//       />

//       <Drawer.Screen 
//         name={ROUTES.cleaner_payment_history} 
//         component={Earnings} 
//         options={{
//           headerShown:true,
//             title:"My Earnings",
//             headerTintColor:COLORS.white,
//             headerBackTitleVisible:true,
//             headerStyle:{
//               backgroundColor:COLORS.primary
//             },
            
//             headerTitleStyle: {
//               fontWeight: '600',
//               fontSize:18,
//               color:COLORS.white,
//             },
//             drawerIcon:({focus, color, size}) => (
//                 <MaterialCommunityIcons name="credit-card-outline" size={20} color={color} />
//             )
//         }}
//       />

//       <Drawer.Screen 
//         name={ROUTES.cleaner_settings} 
//         component={Settings} 
//         options={{
//             headerShown:true,
//             title:"Settings",
//             headerTintColor:COLORS.white,
//             headerBackTitleVisible:true,
//             headerStyle:{
//                 backgroundColor:COLORS.primary
//             },
            
//             headerTitleStyle: {
//               fontWeight: '600',
//               fontSize:18,
//               color:COLORS.white,
//             },
//             drawerIcon:({focus, color, size}) => (
//                 <Ionicons name="settings-outline" size={20} color={color} />
//             )
//         }}
        
//       />

//       <Drawer.Screen 
//         name={ROUTES.cleaner_support} 
//         component={Support} 
//         options={{
//             title:"Support",
//             headerShown:true,
//             headerTintColor:COLORS.white,
//             headerBackTitleVisible:true,
//             headerStyle:{
//                 backgroundColor:COLORS.primary
//             },
            
//             headerTitleStyle: {
//               fontWeight: '600',
//               fontSize:18,
//               color:COLORS.white,
//             },
//             drawerIcon:({focus, color, size}) => (
//                 <MaterialCommunityIcons name="storefront-outline" size={20} color={color} />
//             )
//         }}
//       /> 
//     </Drawer.Navigator>
      
//     )
// }

// export default DrawerNavigator

// const styles = StyleSheet.create({})



import React, {useContext} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabs from './BottomTabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import CustomDrawer from '../../components/shared/CustomDrawer';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Profile from '../../screens/cleaner/Profile';
import Support from '../../screens/cleaner/Support';
import Settings from '../../screens/cleaner/Settings';
import Earnings from '../../screens/cleaner/Payments/Earnings';
import Notification from '../../components/shared/Notification';
import { AuthContext } from '../../context/AuthContext';

// Reusable Icon Component with consistent padding
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

    const Drawer = createDrawerNavigator();
    
    return (
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false,
          drawerItemStyle: {
            marginVertical: 0,
            paddingLeft: 0,
          },
          drawerActiveBackgroundColor:COLORS.primary_light_1,
          drawerActiveTintColor:COLORS.primary,
          drawerLabelStyle: {
              marginLeft:0,
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
        name={ROUTES.cleaner_home_drawer}
        component={BottomTabs}
        options={{
          title: 'Home',
          drawerIcon:({focus, color, size}) => (
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

      {/* <Drawer.Screen 
        name={ROUTES.notification} 
        component={Notification} 
        options={{
          headerShown:true,
          title:"My Profile",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:true,
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
            fontSize:18,
            color:COLORS.gray,
          },
            drawerIcon:({focus, color, size}) => (
              <DrawerIcon
                IconComponent={MaterialCommunityIcons}
                name="account-outline" // Changed from storefront-outline to account-outline for profile
                color={color}
                size={20}
              />
            )
        }}
      /> */}
      <Drawer.Screen 
        name={ROUTES.cleaner_profile} 
        component={Profile} 
        options={{
          headerShown:true,
          title:"My Profile",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:true,
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
            fontSize:18,
            color:COLORS.gray,
          },
            drawerIcon:({focus, color, size}) => (
              <DrawerIcon
                IconComponent={MaterialCommunityIcons}
                name="account-outline" // Changed from storefront-outline to account-outline for profile
                color={color}
                size={20}
              />
            )
        }}
      />

      <Drawer.Screen 
        name={ROUTES.cleaner_earnings} 
        component={Earnings} 
        options={{
          headerShown:true,
            title:"My Earnings",
            headerTintColor:COLORS.white,
            headerBackTitleVisible:true,
            headerStyle:{
              backgroundColor:COLORS.primary
            },
            
            headerTitleStyle: {
              fontWeight: '600',
              fontSize:18,
              color:COLORS.white,
            },
            drawerIcon:({focus, color, size}) => (
              <DrawerIcon
                IconComponent={MaterialCommunityIcons}
                name="credit-card-outline"
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
            headerShown:true,
            title:"Settings",
            headerTintColor:COLORS.white,
            headerBackTitleVisible:true,
            headerStyle:{
                backgroundColor:COLORS.primary
            },
            
            headerTitleStyle: {
              fontWeight: '600',
              fontSize:18,
              color:COLORS.white,
            },
            drawerIcon:({focus, color, size}) => (
              <DrawerIcon
                IconComponent={Ionicons}
                name="settings-outline"
                color={color}
                size={20}
              />
            )
        }}
        
      />

      <Drawer.Screen 
        name={ROUTES.cleaner_support} 
        component={Support} 
        options={{
            title:"Support",
            headerShown:true,
            headerTintColor:COLORS.white,
            headerBackTitleVisible:true,
            headerStyle:{
                backgroundColor:COLORS.primary
            },
            
            headerTitleStyle: {
              fontWeight: '600',
              fontSize:18,
              color:COLORS.white,
            },
            drawerIcon:({focus, color, size}) => (
              <DrawerIcon
                IconComponent={MaterialCommunityIcons}
                name="help-circle-outline" // Changed to a more appropriate support icon
                color={color}
                size={20}
              />
            )
        }}
      /> 
    </Drawer.Navigator>
      
    )
}

export default DrawerNavigator

const styles = StyleSheet.create({})