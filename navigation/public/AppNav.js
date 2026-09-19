
// import React, { useContext, useEffect, useRef } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import PublicStack from './PublicStack';
// import MainHostStack from '../host/MainHostStack';
// import MainCleanerStack from '../cleaner/MainCleanerStack';
// import { Text } from 'react-native';

// const RootStack = createNativeStackNavigator();

// export default function AppNav() {
//   const navigation = useNavigation();
//   const { userToken, userType, isLoading } = useContext(AuthContext);

//   // ✅ Declare prevTokenRef
//   const prevTokenRef = useRef(null);

//   console.log("UserTokennn----------------", userToken);

  

//   // Track token changes to detect logout
//   useEffect(() => {
//     const prevToken = prevTokenRef.current;
//     const isLoggingOut = prevToken && !userToken;
//     if (isLoggingOut) {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Public' }],
//       });
//     }
//     prevTokenRef.current = userToken;
//   }, [userToken, navigation]);

//   if (isLoading) return <Text>Loading...</Text>;

//   const initialRouteName = !userToken
//     ? 'Public'
//     : userType === 'host'
//     ? 'Host'
//     : 'Cleaner';

//   return (
//     <RootStack.Navigator
//       screenOptions={{ headerShown: false }}
//       initialRouteName={initialRouteName}
//     >
//       <RootStack.Screen name="Public" component={PublicStack} />
//       <RootStack.Screen name="Host" component={MainHostStack} />
//       <RootStack.Screen name="Cleaner" component={MainCleanerStack} />
//     </RootStack.Navigator>
//   );
// }




// import React, { useContext, useEffect } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import PublicStack from './PublicStack';
// import MainHostStack from '../host/MainHostStack';
// import MainCleanerStack from '../cleaner/MainCleanerStack';


// const RootStack = createNativeStackNavigator();

// export default function AppNav() {
//   const navigation = useNavigation();
//   const { userToken, userType, isLoading } = useContext(AuthContext);
  
//   console.log("UserTokennn----------------", userToken)

//   // Reset navigation to Public when logged out
//   useEffect(() => {
//     if (!userToken) {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Public' }],
//       });
//     }
//   }, [userToken, navigation]);

//   if (isLoading) return <Text>Loading...</Text>;

//   const initialRouteName = !userToken
//     ? 'Public'
//     : userType === 'host'
//     ? 'Host'
//     : 'Cleaner';

//   return (
//     <RootStack.Navigator
//       screenOptions={{ headerShown: false }}
//       initialRouteName={initialRouteName}
//     >
//       <RootStack.Screen name="Public" component={PublicStack} />
//       <RootStack.Screen name="Host" component={MainHostStack} />
//       <RootStack.Screen name="Cleaner" component={MainCleanerStack} />
//     </RootStack.Navigator>

//   );
// }


import React, { useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import PublicStack from './PublicStack';
import MainHostStack from '../host/MainHostStack';
import MainCleanerStack from '../cleaner/MainCleanerStack';


const RootStack = createNativeStackNavigator();

export default function AppNav() {
  const navigation = useNavigation();
  const { userToken, userType, isLoading } = useContext(AuthContext);
  
  console.log("UserTokennn----------------", userToken)

  // Reset navigation to Public when logged out
  useEffect(() => {
    if (!userToken) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Public' }],
      });
    }
  }, [userToken, navigation]);

  if (isLoading) return <Text>Loading...</Text>;

  const initialRouteName = !userToken
    ? 'Public'
    : userType === 'host'
    ? 'Host'
    : 'Cleaner';

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <RootStack.Screen name="Public" component={PublicStack} />
      <RootStack.Screen name="Host" component={MainHostStack} />
      <RootStack.Screen name="Cleaner" component={MainCleanerStack} />
    </RootStack.Navigator>

  );
}