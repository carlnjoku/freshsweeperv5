import React, { useEffect, useContext, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';

export default function InviteGate() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userToken, userType, logout, isLoading } = useContext(AuthContext);

  const inviteToken = route?.params?.inviteToken;
  
  const [processing, setProcessing] = useState(false);
  console.log('InviteGate mounted, params:', route.params);
  useEffect(() => {
    if (isLoading) return; // Wait for auth to hydrate
    if (!inviteToken) return;

    handleInvite();
  }, [userToken, isLoading]);

//   const handleInvite = async () => {
//     if (processing) return;
//     setProcessing(true);

//     try {
//       // 🚫 Not logged in
//       if (!userToken) {
//         navigation.navigate('Sign In', { inviteToken });
//         return;
//       }

//       // 🚫 Logged in but not cleaner
//       if (userType !== 'cleaner') {
//         Alert.alert('Access Denied', 'This invite is for cleaners only.');
//         navigation.navigate('Sign In');
//         return;
//       }

//       // ✅ Logged in cleaner → accept invite
//       const resp = await userService.acceptInvite(userToken, inviteToken);
//       console.log("propertyId---------------------------2222221", resp.data?.propertyId)
    
//       navigation.navigate(ROUTES.cleaner_property_preview, {
//         propertyId: resp.data?.propertyId,
//         inviteToken: inviteToken
//       });

//     } catch (err) {
//       console.error('Invite accept error:', err);
//       Alert.alert('Error', 'This invite may be invalid or expired.');
//     //   navigation.navigate('Sign In');
//     } finally {
//       setProcessing(false);
//     }
//   };

const handleInvite = async () => {
    if (processing) return;
    setProcessing(true);
  
    try {
      if (!userToken) {
        logout()
        navigation.replace('Sign In', { inviteToken });
        return;
      }
  
      if (userType !== 'cleaner') {
        logout()
        Alert.alert('Access Denied', 'This invite is for cleaners only.');
        navigation.replace('Sign In');
        return;
      }
  
      const resp = await userService.acceptInvite(userToken, inviteToken);
  
      navigation.navigate(ROUTES.cleaner_property_preview, {
        propertyId: resp.data?.propertyId,
        inviteToken,
      });
  
    } catch (err) {
      const status = err?.response?.status;
  
      if (status === 401) {
        // logout();
        navigation.replace('Sign In', { inviteToken });
        return;
      }
      logout();
      Alert.alert('Error', 'This invite may be invalid or expired.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}