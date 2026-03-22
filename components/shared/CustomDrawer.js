// import React, { useContext } from 'react';
// import { SafeAreaView,StyleSheet, Image, ImageBackground, Text, View, TouchableOpacity } from 'react-native';
// import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// import COLORS from '../../constants/colors';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';




// const CustomDrawer = (props) => {
//     const { logout, currentUserId, currentUser, applicationCounts }  = useContext(AuthContext)
    

//     // const[currentUserId, setCurrentUserId] = React.useState("2387t328738yrh87337")
//     // const[logout, setLogout] = React.useState("")

//     const[firstname, setFirstname] = React.useState("")
//     const[lastname, setLastname] = React.useState("")
//     const[city, setCity] = React.useState("")
//     const[state, setState] = React.useState("")
//     const[avatar, setAvatar] = React.useState("")

// console.log("treeeeeeeeeeeeeeeeee1000000000000")
// console.log(avatar)
// console.log("treeeeeeeeeeeeeeeeee1000000000000")

//     const getUser = async () => {
      
//         try {
          
//           await userService.getUser(currentUserId)
//           .then(response => {
//             const res = response.data
//             setFirstname(res.firstname)
//             setLastname(res.lastname)
//             // setUsername(res.username)
//             setCity(res.location.city)
//             setState(res.location.region)
//             setAvatar(res.avatar)
            
//           })
          
//           return jsonValue != null ? JSON.parse(jsonValue) : null;
//         } catch(e) {
//           // error reading value
//         }
//     }


//     React.useEffect(() => {
//         getUser()
//     },[])

//     const logUserOut = (id) => {

//         logout()
//         const data = {userId:id}
//         userService.logOut(data)
//             .then(response => {
//                 const res = response.data.data
//                 // console.log(res)
        
//             })
//     }
    
//     return(
//         <View style={{flex:1}}>
//             <DrawerContentScrollView {...props}
//                 contentContainerStyle={{
//                     backgroundColor: COLORS.primary,
//                     padding: 0,
//                     margin: -18, // removes any margin
//                     width:'120%', 
//                   }}
//                   style={{ margin: 0, padding: 0 }} // extra safety
//             >
//                 <ImageBackground style={{padding:20, marginLeft:30, marginTop:-5, backgroundColor:COLORS.primary}}>
//                     {/* {currentUser.avatar ? 
//                         <Image 
//                             source={{uri:avatar}}
//                             style={{height:100, width:100, borderRadius:50, borderWidth:2, borderColor:COLORS.light_gray_1, marginBottom:10}} 
//                         />
//                         :

//                         <Avatar.Image
//                             size={100}
//                             source={require('../assets/default_avatar.png')}
//                             style={{ backgroundColor: COLORS.gray }}
//                         />
//                     } */}

//                     <Image
//                         source={
//                             avatar
//                             ? { uri: avatar }
//                             : require('../../assets/images/default_avatar.png') // Fallback image
//                         }
//                         style={{height:100, width:100, borderRadius:50, borderWidth:2, borderColor:COLORS.light_gray_1, marginBottom:10}} 
//                     />

                    
//                     <Text style={{color:"#f3f3f3",  fontSize:18, fontWeight:"600"}}>{firstname} {lastname}</Text>
//                     {city ? 
//                     <View style={{flexDirection:"row"}}>
//                         <Text style={{color:COLORS.white, fontSize:14, fontWeight:"normal"}}>{city}, {state}</Text>
//                         <Ionicons name="flag-outline" color = "#ddd" style={{marginTop:5, marginLeft:5}} />
//                     </View>
//                     :

//                     <View style={{flexDirection:"row"}}>
                        
//                     </View>
//                     }
//                 </ImageBackground>
//                 <View style={{backgroundColor:"#fff", paddingLeft:20, height:'100%'}}>
//                     <DrawerItemList {...props} />
//                 </View>
//             </DrawerContentScrollView>
//             <View style={{padding:20, borderTopWidth:1, borderTopColor:"#eee"}}>
//                 <TouchableOpacity style={{paddingVertical:15}} onPress = {logout} >
//                     <View style={{ flexDirection:"row", alignItems:'center'}}>
//                         <Ionicons name='log-out-outline' size={22} />
//                         <Text style={{fontSize:15, marginLeft:10, color:"#333"}}>Logout</Text>
//                     </View>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     )
// }


// export default CustomDrawer






// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ImageBackground,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';
// import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import { Ionicons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';

// // Icon mapping for all possible routes (both cleaner and host)
// const iconMap = {
//   // Cleaner routes
//   [ROUTES.cleaner_home_drawer]: { icon: 'home-outline', family: Ionicons },
//   [ROUTES.notification]: { icon: 'bell-outline', family: MaterialCommunityIcons },
//   [ROUTES.cleaner_profile]: { icon: 'account-outline', family: MaterialCommunityIcons },
//   [ROUTES.cleaner_earnings]: { icon: 'credit-card-outline', family: MaterialCommunityIcons },
//   [ROUTES.cleaner_settings]: { icon: 'settings-outline', family: Ionicons },
//   [ROUTES.cleaner_support]: { icon: 'help-circle-outline', family: MaterialCommunityIcons },
//   [ROUTES.cleaner_my_gigs]: { icon: 'briefcase-outline', family: MaterialCommunityIcons },

//   // Host routes
//   [ROUTES.host_home_drawer]: { icon: 'home-outline', family: Ionicons },
//   [ROUTES.host_profile]: { icon: 'account-outline', family: MaterialCommunityIcons },
//   [ROUTES.host_team]: { icon: 'account-group-outline', family: MaterialCommunityIcons },
//   [ROUTES.host_my_apartment]: { icon: 'home', family: AntDesign },
//   [ROUTES.host_checklist]: { icon: 'check-square', family: Feather },
//   [ROUTES.host_payment_history]: { icon: 'credit-card-clock', family: MaterialCommunityIcons },
// };

// export default function CustomDrawer(props) {
//   const { currentUserId, userType, logout } = useContext(AuthContext); // Assume userType is 'host' or 'cleaner'
//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');
//   const [avatar, setAvatar] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [hasLinked, setHasLinked] = useState(false);

//   // Fetch user info
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await userService.getUser(currentUserId);
//         const res = response.data;
//         setFirstname(res.firstname || '');
//         setLastname(res.lastname || '');
//         setCity(res.location?.city || '');
//         setState(res.location?.region || '');
//         setAvatar(res.avatar || '');
//       } catch (e) {
//         console.log('Error fetching user', e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (currentUserId) {
//       fetchUser();
//     }
//   }, [currentUserId]);

//   // For cleaners, check if they have linked properties (to show My Gigs)
//   useEffect(() => {
//     const checkLinked = async () => {
//       if (userType === 'cleaner') {
//         try {
//           const response = await userService.cleanerHasLinkedProperty(currentUserId);
//           setHasLinked(response.data.hasLinked);
//         } catch (err) {
//           console.error('Failed to check linked properties:', err);
//         }
//       }
//     };
//     if (currentUserId && userType === 'cleaner') {
//       checkLinked();
//     }
//   }, [currentUserId, userType]);

//   // Define screens based on user type
//   const getScreens = () => {
//     if (userType === 'host') {
//       return [
//         { name: ROUTES.host_home_drawer, label: 'Home' },
//         { name: ROUTES.notification, label: 'Notifications' },
//         { name: ROUTES.host_profile, label: 'My Profile' },
//         { name: ROUTES.host_team, label: 'My Team' },
//         { name: ROUTES.host_my_apartment, label: 'My Properties' },
//         { name: ROUTES.host_checklist, label: 'My Checklists' },
//         { name: ROUTES.host_payment_history, label: 'Payment History' },
//         { name: ROUTES.cleaner_support, label: 'Support' },
//         { name: ROUTES.cleaner_settings, label: 'Settings' },
//       ];
//     } else {
//       // Cleaner base screens
//       const base = [
//         { name: ROUTES.cleaner_home_drawer, label: 'Home' },
//         { name: ROUTES.notification, label: 'Notifications' },
//         { name: ROUTES.cleaner_profile, label: 'My Profile' },
//         { name: ROUTES.cleaner_earnings, label: 'My Earnings' },
//         { name: ROUTES.cleaner_settings, label: 'Settings' },
//         { name: ROUTES.cleaner_support, label: 'Support' },
//       ];
//       if (hasLinked) {
//         // Insert My Gigs after profile
//         return [
//           ...base.slice(0, 3),
//           { name: ROUTES.cleaner_my_gigs, label: 'My Gigs' },
//           ...base.slice(3),
//         ];
//       }
//       return base;
//     }
//   };

//   const screens = getScreens();

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <DrawerContentScrollView {...props}>
//         <View style={styles.drawerHeader}>
//           <ImageBackground
//             style={{ padding: 20, marginLeft: 30, marginTop: -5, backgroundColor: COLORS.primary }}
//           >
//             <Image
//               source={
//                 avatar
//                   ? { uri: avatar }
//                   : require('../../assets/images/default_avatar.png')
//               }
//               style={{
//                 height: 100,
//                 width: 100,
//                 borderRadius: 50,
//                 borderWidth: 2,
//                 borderColor: COLORS.light_gray_1,
//                 marginBottom: 10,
//               }}
//             />
//             <Text style={{ color: '#f3f3f3', fontSize: 18, fontWeight: '600' }}>
//               {firstname} {lastname}
//             </Text>
//             {city ? (
//               <View style={{ flexDirection: 'row' }}>
//                 <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: 'normal' }}>
//                   {city}, {state}
//                 </Text>
//                 <Ionicons
//                   name="flag-outline"
//                   color="#ddd"
//                   style={{ marginTop: 5, marginLeft: 5 }}
//                 />
//               </View>
//             ) : null}
//           </ImageBackground>
//         </View>

//         {screens.map((screen) => {
//           const iconDef = iconMap[screen.name] || { icon: 'help-outline', family: MaterialCommunityIcons };
//           const IconFamily = iconDef.family;
//           const focused = props.state.routes[props.state.index].name === screen.name;
//           return (
//             <DrawerItem
//               key={screen.name}
//               label={screen.label}
//               focused={focused}
//               onPress={() => props.navigation.navigate(screen.name)}
//               icon={({ color, size }) => (
//                 <View style={{ paddingLeft: 10 }}>
//                   <IconFamily name={iconDef.icon} size={size} color={color} />
//                 </View>
//               )}
//               activeTintColor={COLORS.primary}
//               inactiveTintColor="#666"
//               activeBackgroundColor={COLORS.primary_light_1}
//               labelStyle={{ marginLeft: 0 }}
//               style={{ marginVertical: 0 }}
//             />
//           );
//         })}
//       </DrawerContentScrollView>

//       <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#eee' }}>
//         <TouchableOpacity style={{ paddingVertical: 15 }} onPress={logout}>
//           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//             <Ionicons name="log-out-outline" size={22} />
//             <Text style={{ fontSize: 15, marginLeft: 10, color: '#333' }}>Logout</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   drawerHeader: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
// });



import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import { Ionicons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';

// Icon mapping for all possible routes (both cleaner and host)
const iconMap = {
  // Cleaner routes
  [ROUTES.cleaner_home_drawer]: { icon: 'home-outline', family: Ionicons },
  [ROUTES.notification]: { icon: 'bell-outline', family: MaterialCommunityIcons },
  [ROUTES.cleaner_profile]: { icon: 'account-outline', family: MaterialCommunityIcons },
  [ROUTES.cleaner_earnings]: { icon: 'credit-card-outline', family: MaterialCommunityIcons },
  [ROUTES.cleaner_settings]: { icon: 'settings-outline', family: Ionicons },
  [ROUTES.cleaner_support]: { icon: 'help-circle-outline', family: MaterialCommunityIcons },
  [ROUTES.cleaner_my_gigs]: { icon: 'briefcase-outline', family: MaterialCommunityIcons },

  // Host routes
  [ROUTES.host_home_drawer]: { icon: 'home-outline', family: Ionicons },
  [ROUTES.host_profile]: { icon: 'account-outline', family: MaterialCommunityIcons },
  [ROUTES.host_team]: { icon: 'account-group-outline', family: MaterialCommunityIcons },
  [ROUTES.host_my_apartment]: { icon: 'home', family: AntDesign },
  [ROUTES.host_checklist]: { icon: 'check-square', family: Feather },
  [ROUTES.host_payment_history]: { icon: 'credit-card-clock', family: MaterialCommunityIcons },
};

export default function CustomDrawer(props) {
  const { currentUserId, userType, logout } = useContext(AuthContext); // userType: 'host' or 'cleaner'
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasLinked, setHasLinked] = useState(false);

  // Fetch user info
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
    }
  }, [currentUserId]);

  // For cleaners, check if they have linked properties (to show My Gigs)
  useEffect(() => {
    const checkLinked = async () => {
      if (userType === 'cleaner') {
        try {
          const response = await userService.cleanerHasLinkedProperty(currentUserId);
          setHasLinked(response.data.hasLinked);
        } catch (err) {
          console.error('Failed to check linked properties:', err);
        }
      }
    };
    if (currentUserId && userType === 'cleaner') {
      checkLinked();
    }
  }, [currentUserId, userType]);

  // Define screens based on user type
  const getScreens = () => {
    if (userType === 'host') {
      return [
        { name: ROUTES.host_home_drawer, label: 'Home' },
        { name: ROUTES.notification, label: 'Notifications' },
        { name: ROUTES.host_profile, label: 'My Profile' },
        { name: ROUTES.host_team, label: 'My Team' },
        { name: ROUTES.host_my_apartment, label: 'My Properties' },
        { name: ROUTES.host_checklist, label: 'My Checklists' },
        { name: ROUTES.host_payment_history, label: 'Payment History' },
        { name: ROUTES.cleaner_support, label: 'Support' },
        { name: ROUTES.cleaner_settings, label: 'Settings' },
      ];
    } else {
      // Cleaner base screens
      const base = [
        { name: ROUTES.cleaner_home_drawer, label: 'Home' },
        { name: ROUTES.notification, label: 'Notifications' },
        { name: ROUTES.cleaner_profile, label: 'My Profile' },
        { name: ROUTES.cleaner_earnings, label: 'My Earnings' },
        { name: ROUTES.cleaner_settings, label: 'Settings' },
        { name: ROUTES.cleaner_support, label: 'Support' },
      ];
      if (hasLinked) {
        // Insert My Gigs after profile
        return [
          ...base.slice(0, 3),
          { name: ROUTES.cleaner_my_gigs, label: 'My Gigs' },
          ...base.slice(3),
        ];
      }
      return base;
    }
  };

  const screens = getScreens();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Header with user info */}
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
              <Text style={styles.userName}>
                {firstname} {lastname}
              </Text>
              {city ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.white} />
                  <Text style={styles.userLocation}>
                    {city}, {state}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Drawer Items */}
        <View style={styles.itemsContainer}>
          {screens.map((screen) => {
            const iconDef = iconMap[screen.name] || { icon: 'help-outline', family: MaterialCommunityIcons };
            const IconFamily = iconDef.family;
            const focused = props.state.routes[props.state.index].name === screen.name;
            return (
              <DrawerItem
                key={screen.name}
                label={screen.label}
                focused={focused}
                onPress={() => props.navigation.navigate(screen.name)}
                icon={({ color, size }) => (
                  <View style={styles.iconContainer}>
                    <IconFamily name={iconDef.icon} size={size} color={color} />
                  </View>
                )}
                activeTintColor={COLORS.primary}
                inactiveTintColor="#666"
                activeBackgroundColor={COLORS.primary_light_1}
                labelStyle={styles.labelStyle}
                style={focused ? styles.activeItem : styles.item}
              />
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.gray} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: COLORS.primary,
    // paddingVertical: 80,
    paddingTop:100,
    paddingBottom:20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    borderColor: COLORS.white,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLocation: {
    color: COLORS.white,
    fontSize: 13,
    marginLeft: 4,
    opacity: 0.9,
  },
  itemsContainer: {
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    borderRadius: 8,
    marginVertical: 2,
  },
  activeItem: {
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: COLORS.primary_light_1,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  labelStyle: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 0,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 15,
    marginLeft: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
});