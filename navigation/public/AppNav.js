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