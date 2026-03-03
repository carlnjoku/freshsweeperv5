// import React, { useContext, useEffect,useState } from 'react';
// import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import PublicStack from './PublicStack';
// import { navigationRef } from '../../hooks/navigationService';
// import linking from '../../screens/sharedscreen/DeepLinking';
// import MainHostStack from '../host/MainHostStack';
// import MainCleanerStack from '../cleaner/MainCleanerStack';
// import CleanerAuthGate from '../../screens/cleaner/AccountVerification/CleanerAuthGate';
// import CleanerRootStack from '../cleaner/CleanerRootStack';


// export default function AppNav() {
    
//   const {userToken,userType, isLoading} = useContext(AuthContext)
  
//   alert(userType)
  
//   return (
   
        
    
    
//         <NavigationContainer 
//           ref={navigationRef} 
//           linking={linking}
//         >
        
//         {
//           userToken !== null && userType === 'host' ? (
            
//             <MainHostStack/>
//           ) : userToken !== null &&  userType === 'cleaner' ? (
//             <CleanerRootStack />
//           ) : (
//             <PublicStack />
//           )
//         } 
//          {/* {isActive && schedule && <FloatingCleaningTimer schedule={schedule} onRequestMoreTime={() => console.log("Request More Time")} />} */}
//     </NavigationContainer>
   
//   )
// }



// import React, { useContext, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import PublicStack from './PublicStack';
// import { navigationRef } from '../../hooks/navigationService';
// import linking from '../../screens/sharedscreen/DeepLinking';
// import MainHostStack from '../host/MainHostStack';
// import MainCleanerStack from '../cleaner/MainCleanerStack';
// import DebugLogViewer from '../../components/shared/DebugLogViewer';

// export default function AppNav() {
//   const { userToken, userType, isVerified, isLoading } = useContext(AuthContext);

//   if (isLoading) return null; // Or show a loading spinner

//   useEffect(() => {
//     console.log('userToken:', userToken);
//     console.log('userType:', userType);
//     console.log('isVerified:', isVerified);
//   }, [userToken, userType, isVerified]);

//   // Additional standalone logging for deep links
//   // useEffect(() => {
//   //   const handleDeepLink = (url) => {
//   //     console.log('🚀 STANDALONE - Deep link received:', url);
//   //   };

//   //   // Check initial URL
//   //   linking.getInitialURL().then((url) => {
//   //     console.log('🚀 STANDALONE - Initial URL:', url);
//   //     if (url) handleDeepLink(url);
//   //   });

//     // Listen for URL events
//     // const subscription = linking.addEventListener('url', ({ url }) => {
//     //   console.log('🚀 STANDALONE - URL event:', url);
//     //   handleDeepLink(url);
//     // });

//   //   return () => subscription.remove();
//   // }, []);

//   useEffect(() => {
//     linking.getInitialURL().then((url) => {
//       console.log('🚀 INITIAL URL:', url);
//     });
//   }, []);

//   return (
//     <NavigationContainer ref={navigationRef} linking={linking}>
//       {userToken && userType === 'host' ? (
//         <MainHostStack />
//       ) : userToken && userType === 'cleaner' ? (
//         <>
//         <MainCleanerStack />
//         <DebugLogViewer />
//         </>
//       ) : (
//         <PublicStack />
//       )}
//     </NavigationContainer>
//   );
// }



// import React, { useContext, useEffect } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { AuthContext } from '../../context/AuthContext';
// import PublicStack from './PublicStack';
// import MainHostStack from '../host/MainHostStack';
// import MainCleanerStack from '../cleaner/MainCleanerStack';
// import InviteGate from '../../screens/public/IniteGate';
// // import DebugLogViewer from '../../components/shared/DebugLogViewer';

// export default function AppNav() {
//   const RootStack = createNativeStackNavigator();
//   const { userToken, userType, isVerified, isLoading } = useContext(AuthContext);


  
//   // return (
//   //   <>
//   //   {/* <PublicStack /> */}
//   //     {userToken && userType === 'host' ? (
//   //       <MainHostStack />
//   //     ) : userToken && userType === 'cleaner' ? (
//   //       <>
//   //         {inviteToken ? <InviteGate /> : <MainCleanerStack />}
//   //       </>
//   //     ) : (
//   //       <PublicStack />
//   //     )}
//   //   </>
//   // );



  // return (
  //   <RootStack.Navigator screenOptions={{ headerShown: false }}>
  //     {!userToken ? (
  //       <RootStack.Screen name="Public" component={PublicStack} />
  //     ) : userType === 'host' ? (
  //       <RootStack.Screen name="Host" component={MainHostStack} />
  //     ) : (
  //       <RootStack.Screen name="Cleaner" component={MainCleanerStack} />
  //     )}
  //   </RootStack.Navigator>
  // );


//   // return (
//   //   <RootStack.Navigator screenOptions={{ headerShown: false }}>
//   //     {!userToken && (
//   //       <RootStack.Screen name="PublicStack" component={PublicStack} />
//   //     )}

//   //     {userToken && userType === 'host' && (
//   //       <RootStack.Screen name="MainHostStack" component={MainHostStack} />
//   //     )}

//   //     {userToken && userType === 'cleaner' && (
//   //       <RootStack.Screen name="MainCleanerStack" component={MainCleanerStack} />
//   //     )}
//   //   </RootStack.Navigator>
//   // );

 
//   return (
//     <RootStack.Navigator screenOptions={{ headerShown: false }}>
//       {!userToken ? (
//         <RootStack.Screen name="Public" component={PublicStack} />
//       ) : userType === 'host' ? (
//         <RootStack.Screen name="Host" component={MainHostStack} />
//       ) : (
//         <RootStack.Screen name="Cleaner" component={MainCleanerStack} />
//       )}
//     </RootStack.Navigator>
//   );

//   console.log('🔄 AppNav rendering with:');
//   console.log('userToken:', !!userToken);
//   console.log('userType:', userType);
//   console.log('isVerified:', isVerified);

//   const getInitialRouteName = () => {
//     if (!userToken) return 'PublicStack';
//     if (userType === 'host') return 'MainHostStack';
//     if (userType === 'cleaner') return 'MainCleanerStack';
//     return 'PublicStack';
//   };

//   // return (
//   //   <RootStack.Navigator 
//   //     screenOptions={{ headerShown: false }}
//   //     initialRouteName={getInitialRouteName()}
//   //   >
//   //     {/* Always include all routes, they'll be protected by auth guards */}
//   //     <RootStack.Screen name="PublicStack" component={PublicStack} />
//   //     <RootStack.Screen name="MainHostStack" component={MainHostStack} />
//   //     <RootStack.Screen name="MainCleanerStack" component={MainCleanerStack} />
//   //   </RootStack.Navigator>
//   // );
// }



// import React, { useContext } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { AuthContext } from '../../context/AuthContext';
// import PublicStack from './PublicStack';
// import MainHostStack from '../host/MainHostStack';
// import MainCleanerStack from '../cleaner/MainCleanerStack';

// const RootStack = createNativeStackNavigator();

// export default function AppNav() {
//   const { userToken, userType, isLoading } = useContext(AuthContext);
//   console.log("UserTokennn----------------", userToken)
//   // Optional loading screen
//   if (isLoading) return <Text>Loading...</Text>;

//   // Determine which screen should be the initial one
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