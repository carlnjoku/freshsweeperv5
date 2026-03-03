import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  BackHandler,
  AppState,
  DeviceEventEmitter,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import ROUTES from '../../../constants/routes';
import COLORS from '../../../constants/colors';
import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';
import VerificationListItem from '../../../components/cleaner/VerificationListItem';
import uploadFile from '../../../services/firebase/UploadFile';
import { get, ref, update } from 'firebase/database';
import { db } from '../../../services/firebase/config';

// ✅ Import the navigation ref from the root App component
import { navigationRef } from '../../../App';

const AccountVerificationGate = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // ✅ Include updateUser from context
  const { login, currentUserId, currentUser, updateUser } = useContext(AuthContext);
  
  const expoPushToken = route.params?.expo_push_token;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyList, setVerifyList] = useState([]);
  const [avatarUri, setAvatarUri] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState('Not Onboarded');
  const [processingDeepLink, setProcessingDeepLink] = useState(false);
  
  // Track if we've processed the current deep link to avoid duplicates
  const processedDeepLinkRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Get deep link parameters
  const deepLinkParams = route.params || {};
  const {
    cleanerId: deepLinkCleanerId,
    stripe_account_id: deepLinkStripeAccountId,
    timestamp: deepLinkTimestamp,
    type: deepLinkType,
    source: deepLinkSource,
    flow: deepLinkFlow,
    redirect_to: deepLinkRedirectTo
  } = deepLinkParams;

  const isFullyVerified = (u) =>
    !!u?.avatar?.trim() && u?.onboarding_completed && u?.identity_verified;

  // Listen for app state changes (when app comes back from browser)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - check if we need to refresh
        console.log('App came to foreground, checking for updates...');
        refreshVerificationStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // NEW: Handle verification-complete deep links from ID verification
  useEffect(() => {
    // Check if we received a verification-complete deep link
    console.log('🔍 Checking for verification-complete deep link:', deepLinkParams);
    
    // Option 1: Check route params (when app was opened by deep link)
    if (deepLinkCleanerId && deepLinkCleanerId === currentUserId) {
      console.log('✅ Received verification-complete deep link with cleanerId:', deepLinkCleanerId);
      
      // Show success message
      Alert.alert(
        'Payment Setup Complete!',
        'Your Stripe account has been successfully connected. You can now receive payments.',
        [{ 
          text: 'Continue',
          onPress: () => {
            // Refresh to update verification status
            refreshVerificationStatus(true);
          }
        }]
      );
    }
    
    // Option 2: Also listen for DeviceEventEmitter events (when app was already open)
    const verificationSubscription = DeviceEventEmitter.addListener(
      'verificationComplete',
      (data) => {
        console.log('📬 Verification complete event received:', data);
        if (data.cleanerId === currentUserId) {
          handleIDVerificationComplete(data.cleanerId);
        }
      }
    );

    return () => verificationSubscription.remove();
  }, [deepLinkCleanerId, currentUserId]);

  // Handle Stripe onboarding deep links
  useEffect(() => {
    if (deepLinkStripeAccountId && 
        deepLinkCleanerId === currentUserId && 
        !processingDeepLink) {
      
      // Create a unique key for this deep link to avoid processing duplicates
      const deepLinkKey = `${deepLinkStripeAccountId}_${deepLinkTimestamp}`;
      
      if (processedDeepLinkRef.current !== deepLinkKey) {
        processedDeepLinkRef.current = deepLinkKey;
        handleStripeOnboardingComplete();
      }
    }
  }, [deepLinkStripeAccountId, deepLinkCleanerId, currentUserId]);

  // NEW: Function to handle ID verification completion
  const handleIDVerificationComplete = async (cleanerId) => {
    try {
      console.log('✅ Handling ID verification completion for cleaner:', cleanerId);
      
      // Show immediate feedback
      Alert.alert(
        'ID Verification Complete!',
        'Your identity has been successfully verified.',
        [{ 
          text: 'Continue',
          onPress: async () => {
            // Refresh user data to update verification status
            await refreshVerificationStatus(true);
          }
        }]
      );
    } catch (error) {
      console.error('Error handling ID verification complete:', error);
      Alert.alert('Error', 'Failed to update verification status.');
    }
  };

  const handleStripeOnboardingComplete = async () => {
    if (processingDeepLink) return;
    
    setProcessingDeepLink(true);
    try {
      console.log('Processing Stripe onboarding completion deep link:', deepLinkParams);
      
      // Show immediate feedback
      setOnboardingStatus('Verifying...');
      
      // Verify with backend that Stripe onboarding is actually complete
      const verificationResult = await verifyStripeOnboardingStatus(
        deepLinkCleanerId, 
        deepLinkStripeAccountId
      );

      if (verificationResult.charges_enabled) {
        // Update user's onboarding status
        await updateUserOnboardingStatus(deepLinkCleanerId, true);
        
        // Force immediate UI update
        setOnboardingStatus('Onboarded');
        
        // Refresh the user data to reflect the updated status
        await refreshVerificationStatus(true); // Force refresh
        
        Alert.alert(
          'Payment Setup Complete!',
          'Your Stripe account has been successfully connected. You can now receive payments.',
          [{ text: 'Continue' }]
        );
      } else {
        setOnboardingStatus('Not Onboarded');
        Alert.alert(
          'Verification in Progress',
          'Your Stripe account is being verified. This may take a few minutes.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error processing Stripe onboarding:', error);
      setOnboardingStatus('Not Onboarded');
      Alert.alert(
        'Verification Error',
        'There was an issue verifying your Stripe account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingDeepLink(false);
    }
  };

  const verifyStripeOnboardingStatus = async (cleanerId, stripeAccountId) => {
    try {
      // Call your backend to verify Stripe status
      const response = await userService.verifyStripeOnboarding({
        cleanerId,
        stripe_account_id: stripeAccountId
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying Stripe onboarding:', error);
      throw error;
    }
  };

  const updateUserOnboardingStatus = async (cleanerId, status) => {
    try {
      // Update user's onboarding status in your backend
      await userService.updateOnboardingStatus({
        userId: cleanerId,
        onboarding_completed: status
      });
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  };

  const refreshVerificationStatus = async (force = false) => {
    try {
      setLoading(true);
      const res = await userService.getUser(currentUserId);
      const updatedUser = res.data;

      console.log("Refreshed user data:", updatedUser);
      setUser(updatedUser);
      setAvatarUri(updatedUser.avatar || null);

      if (isFullyVerified(updatedUser)) {
        // ✅ Update context without resetting token
        await updateUser(updatedUser);
        
        // ✅ Use navigationRef to reset the root navigator to the Cleaner stack
        if (navigationRef.current) {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Cleaner' }], // 'Cleaner' is the root screen name from AppNav
          });
        } else {
          console.error('❌ Navigation ref not available');
        }
      } else {
        const newOnboardingStatus = updatedUser.onboarding_completed ? 'Onboarded' : 'Not Onboarded';
        setOnboardingStatus(newOnboardingStatus);
        setVerifyList(generateVerificationItems(updatedUser));
        
        // If we just completed onboarding via deep link, show immediate feedback
        if (force && updatedUser.onboarding_completed) {
          setVerifyList(generateVerificationItems(updatedUser));
        }
      }
    } catch (error) {
      console.error('refreshVerificationStatus error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced useFocusEffect with additional triggers
  useFocusEffect(
    useCallback(() => {
      refreshVerificationStatus();
      
      // Also refresh when screen comes into focus if we have deep link params
      if (deepLinkStripeAccountId || deepLinkCleanerId) {
        const timer = setTimeout(() => {
          refreshVerificationStatus();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [currentUserId, deepLinkStripeAccountId, deepLinkCleanerId])
  );

  // Additional refresh when component mounts
  useEffect(() => {
    refreshVerificationStatus();
  }, []);

  const onboardCleaner = async () => {
    try {
      setLoading(true);
      if (onboardingStatus === 'Not Onboarded') {
        const response = await userService.createStripeConnectAccount({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        });
        setAccountId(response.data.account_id);

        const linkRes = await userService.createLinkUrl(response.data.account_id, user._id);
        setOnboardingUrl(linkRes.data.update_link);
        setOnboardingStatus('Onboarding in Progress');
        
        // Clear any previous deep link processing
        processedDeepLinkRef.current = null;
        
        // Open Stripe onboarding - the user will be redirected back via deep link
        Linking.openURL(linkRes.data.update_link);

        if (Platform.OS === 'android') {
          setTimeout(() => BackHandler.exitApp(), 300);
        }
      }
    } catch (error) {
      console.error('Onboarding error:', error.message);
      Alert.alert('Error', error.response?.data || 'Failed to start onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const startVerificationStatusPolling = (cleanerId, sessionId) => {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes (10-second intervals)
    
    const poll = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        console.log('Polling timeout reached');
        return;
      }
      
      try {
        const response = await userService.checkVerificationStatus(cleanerId);
        const status = response.data;
        
        if (status.identity_verified === 'verified') {
          // Success!
          Alert.alert(
            'Verification Complete!',
            'Your identity has been successfully verified.',
            [{ 
              text: 'Continue',
              onPress: () => refreshVerificationStatus(true)
            }]
          );
          return; // Stop polling
        } else if (status.identity_verified === 'failed' || 
                   status.identity_verified === 'canceled') {
          // Failed or canceled
          Alert.alert(
            'Verification Failed',
            'Please try the verification process again.',
            [{ text: 'OK' }]
          );
          return; // Stop polling
        }
        
        // Continue polling
        setTimeout(poll, 10000); // Check every 10 seconds
        
      } catch (error) {
        console.error('Polling error:', error);
        setTimeout(poll, 10000); // Retry after 10 seconds
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 5000);
  };

  const handlePress = async (type) => {
    if (type === 'avatar') addImage();
    else if (type === 'onboarding') onboardCleaner();
    else if (type === 'verify_identity') {
      try {
        // Create a deep link URL that will redirect back to your app
        // Use your app's custom URL scheme or universal link
        
        const returnUrl = 'https://www.freshsweeper.com/id-verification-complete'
        const response = await userService.createVerificationSession({
          cleanerId: currentUserId,
          return_url: `${returnUrl}?cleanerId=${currentUserId}`, // Add cleanerId to return URL
          ...user,
        });
        
        Linking.openURL(response.data.url).then(() => {
          // Alert.alert(
          //   'ID Verification',
          //   'Complete the verification process in your browser. You will be redirected back to the app when finished.',
          //   [{ text: 'OK' }]
          // );
        });
        
        // Start checking for verification status
        startVerificationStatusPolling(currentUserId, response.data.sessionId);
        
      } catch (err) {
        console.error('ID verification error:', err.message);
        Alert.alert('Error', 'Failed to start ID verification. Please try again.');
      }
    }
  };

  const getUploadedPhoto = async (uploadedUrl) => {
    try {
      const data = { userId: currentUserId, avatar: uploadedUrl };
      await userService.updateProfileAvatar(data);
      await updateFirebaseAvatar(data);
      await refreshVerificationStatus();
    } catch (err) {
      console.log('Error after photo upload:', err.message || err);
    }
  };

  const updateFirebaseAvatar = async ({ userId, avatar }) => {
    const snap = await get(ref(db, `users/${userId}`));
    if (snap.exists()) {
      await update(ref(db, `users/${userId}`), { avatar });
    }
  };

  const addImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'We need access to your photos to upload a profile picture.'
      );
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });
  
    if (result.canceled) return;
    if (!result.assets || !Array.isArray(result.assets) || !result.assets.length) {
      console.warn('ImagePicker returned no assets:', result);
      return;
    }
  
    const uri = result.assets[0].uri;
    setAvatarUri(uri);
  
    const imageName = `avatar_${currentUserId}.${uri.split('.').pop()}`;
    const uploadedUrl = await uploadFile(uri, `profile/${imageName}`);
    await getUploadedPhoto(uploadedUrl);
  };

  const generateVerificationItems = (user) => {
    const hasAvatar = !!user.avatar?.trim();
    const hasOnboarded = user.onboarding_completed;
    const hasVerifiedID = user.identity_verified;
 

    return [
      {
        id: 1,
        icon: 'account',
        label: 'Upload Profile Photo',
        description: 'Helps build trust with hosts.',
        type: 'avatar',
        isCompleted: hasAvatar,
        isEnabled: true,
      },
      {
        id: 2,
        icon: 'credit-card',
        label: hasOnboarded ? 'Payment Setup Complete' : 'Set Up Payment',
        description: hasOnboarded 
          ? 'Your Stripe account is connected and ready for payouts.'
          : 'Receive your payouts securely through Stripe.',
        type: 'onboarding',
        isCompleted: hasOnboarded,
        isEnabled: hasAvatar,
        status: hasOnboarded ? 'complete' : 'pending'
      },
      {
        id: 3,
        icon: 'shield-check',
        label: hasVerifiedID === 'verified' ? 'Identity Verified' : 
                hasVerifiedID === 'pending' ? 'Verification in Progress' :
                hasVerifiedID === 'requires_input' ? 'More Info Needed' :
                hasVerifiedID === 'failed' ? 'Verification Failed' : 'Verify Identity',
        description: hasVerifiedID === 'verified' 
            ? 'Your identity has been successfully verified.'
            : hasVerifiedID === 'pending'
            ? 'Your ID verification is being processed.'
            : hasVerifiedID === 'requires_input'
            ? 'Additional information is needed to verify your identity.'
            : hasVerifiedID === 'failed'
            ? 'ID verification failed. Please try again.'
            : 'Confirm your ID to get started.',
        type: 'verify_identity',
        isCompleted: hasVerifiedID === 'verified',
        isEnabled: hasAvatar && hasOnboarded,
      },
    ];
  };

  const renderItem = ({ item }) => (
    <VerificationListItem
      icon={item.icon}
      label={item.label}
      description={item.description}
      isEnabled={item.isEnabled}
      isCompleted={item.isCompleted}
      onPress={() => handlePress(item.type)}
      status={item.status}
    />
  );

  // Show loading when processing deep link
  if (processingDeepLink) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          Verifying your Stripe account...{'\n'}
          <Text style={{ fontSize: 12, color: COLORS.gray }}>
            This may take a few seconds
          </Text>
        </Text>
      </View>
    );
  }

  if (loading && !processingDeepLink) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Checking your account status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <Text style={styles.welcomeTitle}>You're Almost Done</Text>
        <Text style={styles.welcomeSubtitle}>
          Just complete the final steps below so you can start accepting jobs with confidence. We've made it quick and easy.
        </Text>
        
        {/* Show deep link status if applicable */}
        {(deepLinkStripeAccountId || deepLinkCleanerId) && (
          <View style={styles.deepLinkBanner}>
            <MaterialIcons name="link" size={16} color={COLORS.primary} />
            <Text style={styles.deepLinkText}>
              {deepLinkStripeAccountId 
                ? 'Processing your Stripe onboarding...' 
                : 'Processing your ID verification...'}
            </Text>
          </View>
        )}
      </View>

      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <TouchableOpacity onPress={addImage}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 2,
                borderColor: COLORS.primary,
              }}
            />
          ) : (
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: COLORS.light_gray_1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="add-a-photo" size={32} color="#888" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ marginTop: 8, color: COLORS.gray }}>
          {user?.firstname} {user?.lastname}
        </Text>
        
        {/* Manual refresh button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => refreshVerificationStatus(true)}
        >
          <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
          <Text style={styles.refreshText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={verifyList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        extraData={[onboardingStatus, user?.identity_verified]} // Ensures re-render when status changes
        scrollEnabled={false}
      />
    </View>
  );
};

export default AccountVerificationGate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topBanner: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  deepLinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'stretch',
  },
  deepLinkText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  refreshText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});




// import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Linking,
//   Platform,
//   BackHandler,
//   AppState,
//   DeviceEventEmitter,
// } from 'react-native';
// import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';

// import ROUTES from '../../../constants/routes';
// import COLORS from '../../../constants/colors';
// import { AuthContext } from '../../../context/AuthContext';
// import userService from '../../../services/connection/userService';
// import VerificationListItem from '../../../components/cleaner/VerificationListItem';
// import uploadFile from '../../../services/firebase/UploadFile';
// import { get, ref, update } from 'firebase/database';
// import { db } from '../../../services/firebase/config';

// // ✅ Import the navigation ref from the root App component
// import { navigationRef } from '../../../App';

// const AccountVerificationGate = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { login, currentUserId, currentUser, updateUser } = useContext(AuthContext);
  
//   const expoPushToken = route.params?.expo_push_token;
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [verifyList, setVerifyList] = useState([]);
//   const [avatarUri, setAvatarUri] = useState(null);
//   const [accountId, setAccountId] = useState(null);
//   const [onboardingUrl, setOnboardingUrl] = useState(null);
//   const [onboardingStatus, setOnboardingStatus] = useState('Not Onboarded');
//   const [processingDeepLink, setProcessingDeepLink] = useState(false);
  
//   // Track if we've processed the current deep link to avoid duplicates
//   const processedDeepLinkRef = useRef(null);
//   const appState = useRef(AppState.currentState);

//   // Get deep link parameters
//   const deepLinkParams = route.params || {};
//   const {
//     cleanerId: deepLinkCleanerId,
//     stripe_account_id: deepLinkStripeAccountId,
//     timestamp: deepLinkTimestamp,
//     type: deepLinkType,
//     source: deepLinkSource,
//     flow: deepLinkFlow,
//     redirect_to: deepLinkRedirectTo
//   } = deepLinkParams;

//   const isFullyVerified = (u) =>
//     !!u?.avatar?.trim() && u?.onboarding_completed && u?.identity_verified;

//   // Listen for app state changes (when app comes back from browser)
//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', nextAppState => {
//       if (
//         appState.current.match(/inactive|background/) &&
//         nextAppState === 'active'
//       ) {
//         // App has come to the foreground - check if we need to refresh
//         console.log('App came to foreground, checking for updates...');
//         refreshVerificationStatus();
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   // NEW: Handle verification-complete deep links from ID verification
//   useEffect(() => {
//     // Check if we received a verification-complete deep link
//     console.log('🔍 Checking for verification-complete deep link:', deepLinkParams);
    
//     // Option 1: Check route params (when app was opened by deep link)
//     if (deepLinkCleanerId && deepLinkCleanerId === currentUserId) {
//       console.log('✅ Received verification-complete deep link with cleanerId:', deepLinkCleanerId);
      
//       // Show success message
//       Alert.alert(
//         'ID Verification Complete!',
//         'Your identity has been successfully verified.',
//         [{ 
//           text: 'Continue',
//           onPress: () => {
//             // Refresh to update verification status
//             refreshVerificationStatus(true);
//           }
//         }]
//       );
//     }
    
//     // Option 2: Also listen for DeviceEventEmitter events (when app was already open)
//     const verificationSubscription = DeviceEventEmitter.addListener(
//       'verificationComplete',
//       (data) => {
//         console.log('📬 Verification complete event received:', data);
//         if (data.cleanerId === currentUserId) {
//           handleIDVerificationComplete(data.cleanerId);
//         }
//       }
//     );

//     return () => verificationSubscription.remove();
//   }, [deepLinkCleanerId, currentUserId]);

//   // Handle Stripe onboarding deep links
//   useEffect(() => {
//     if (deepLinkStripeAccountId && 
//         deepLinkCleanerId === currentUserId && 
//         !processingDeepLink) {
      
//       // Create a unique key for this deep link to avoid processing duplicates
//       const deepLinkKey = `${deepLinkStripeAccountId}_${deepLinkTimestamp}`;
      
//       if (processedDeepLinkRef.current !== deepLinkKey) {
//         processedDeepLinkRef.current = deepLinkKey;
//         handleStripeOnboardingComplete();
//       }
//     }
//   }, [deepLinkStripeAccountId, deepLinkCleanerId, currentUserId]);

//   // NEW: Function to handle ID verification completion
//   const handleIDVerificationComplete = async (cleanerId) => {
//     try {
//       console.log('✅ Handling ID verification completion for cleaner:', cleanerId);
      
//       // Show immediate feedback
//       Alert.alert(
//         'ID Verification Complete!',
//         'Your identity has been successfully verified.',
//         [{ 
//           text: 'Continue',
//           onPress: async () => {
//             // Refresh user data to update verification status
//             await refreshVerificationStatus(true);
//           }
//         }]
//       );
//     } catch (error) {
//       console.error('Error handling ID verification complete:', error);
//       Alert.alert('Error', 'Failed to update verification status.');
//     }
//   };

//   const handleStripeOnboardingComplete = async () => {
//     if (processingDeepLink) return;
    
//     setProcessingDeepLink(true);
//     try {
//       console.log('Processing Stripe onboarding completion deep link:', deepLinkParams);
      
//       // Show immediate feedback
//       setOnboardingStatus('Verifying...');
      
//       // Verify with backend that Stripe onboarding is actually complete
//       const verificationResult = await verifyStripeOnboardingStatus(
//         deepLinkCleanerId, 
//         deepLinkStripeAccountId
//       );

//       if (verificationResult.charges_enabled) {
//         // Update user's onboarding status
//         await updateUserOnboardingStatus(deepLinkCleanerId, true);
        
//         // Force immediate UI update
//         setOnboardingStatus('Onboarded');
        
//         // Refresh the user data to reflect the updated status
//         await refreshVerificationStatus(true); // Force refresh
        
//         Alert.alert(
//           'Payment Setup Complete!',
//           'Your Stripe account has been successfully connected. You can now receive payments.',
//           [{ text: 'Continue' }]
//         );
//       } else {
//         setOnboardingStatus('Not Onboarded');
//         Alert.alert(
//           'Verification in Progress',
//           'Your Stripe account is being verified. This may take a few minutes.',
//           [{ text: 'OK' }]
//         );
//       }
//     } catch (error) {
//       console.error('Error processing Stripe onboarding:', error);
//       setOnboardingStatus('Not Onboarded');
//       Alert.alert(
//         'Verification Error',
//         'There was an issue verifying your Stripe account. Please try again.',
//         [{ text: 'OK' }]
//       );
//     } finally {
//       setProcessingDeepLink(false);
//     }
//   };

//   const verifyStripeOnboardingStatus = async (cleanerId, stripeAccountId) => {
//     try {
//       // Call your backend to verify Stripe status
//       const response = await userService.verifyStripeOnboarding({
//         cleanerId,
//         stripe_account_id: stripeAccountId
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error verifying Stripe onboarding:', error);
//       throw error;
//     }
//   };

//   const updateUserOnboardingStatus = async (cleanerId, status) => {
//     try {
//       // Update user's onboarding status in your backend
//       await userService.updateOnboardingStatus({
//         userId: cleanerId,
//         onboarding_completed: status
//       });
//     } catch (error) {
//       console.error('Error updating onboarding status:', error);
//       throw error;
//     }
//   };

//   const refreshVerificationStatus = async (force = false) => {
//     try {
//       setLoading(true);
//       const res = await userService.getUser(currentUserId);
//       const updatedUser = res.data;

//       console.log("Refreshed user data:", updatedUser);
//       setUser(updatedUser);
//       setAvatarUri(updatedUser.avatar || null);

//       if (isFullyVerified(updatedUser)) {
//         // login({ resp: updatedUser, expoPushToken });
        
//         // ✅ Use navigationRef to reset the root navigator to the Cleaner stack
//         if (navigationRef.current) {
//           navigationRef.current.reset({
//             index: 0,
//             routes: [{ name: 'Cleaner' }], // 'Cleaner' is the root screen name from AppNav
//           });
//         } else {
//           console.error('❌ Navigation ref not available');
//         }
//       } else {
//         const newOnboardingStatus = updatedUser.onboarding_completed ? 'Onboarded' : 'Not Onboarded';
//         setOnboardingStatus(newOnboardingStatus);
//         setVerifyList(generateVerificationItems(updatedUser));
        
//         // If we just completed onboarding via deep link, show immediate feedback
//         if (force && updatedUser.onboarding_completed) {
//           setVerifyList(generateVerificationItems(updatedUser));
//         }
//       }
//     } catch (error) {
//       console.error('refreshVerificationStatus error:', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Enhanced useFocusEffect with additional triggers
//   useFocusEffect(
//     useCallback(() => {
//       refreshVerificationStatus();
      
//       // Also refresh when screen comes into focus if we have deep link params
//       if (deepLinkStripeAccountId || deepLinkCleanerId) {
//         const timer = setTimeout(() => {
//           refreshVerificationStatus();
//         }, 1000);
//         return () => clearTimeout(timer);
//       }
//     }, [currentUserId, deepLinkStripeAccountId, deepLinkCleanerId])
//   );

//   // Additional refresh when component mounts
//   useEffect(() => {
//     refreshVerificationStatus();
//   }, []);

//   const onboardCleaner = async () => {
//     try {
//       setLoading(true);
//       if (onboardingStatus === 'Not Onboarded') {
//         const response = await userService.createStripeConnectAccount({
//           firstname: user.firstname,
//           lastname: user.lastname,
//           email: user.email,
//         });
//         setAccountId(response.data.account_id);

//         const linkRes = await userService.createLinkUrl(response.data.account_id, user._id);
//         setOnboardingUrl(linkRes.data.update_link);
//         setOnboardingStatus('Onboarding in Progress');
        
//         // Clear any previous deep link processing
//         processedDeepLinkRef.current = null;
        
//         // Open Stripe onboarding - the user will be redirected back via deep link
//         Linking.openURL(linkRes.data.update_link);

//         if (Platform.OS === 'android') {
//           setTimeout(() => BackHandler.exitApp(), 300);
//         }
//       }
//     } catch (error) {
//       console.error('Onboarding error:', error.message);
//       Alert.alert('Error', error.response?.data || 'Failed to start onboarding.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startVerificationStatusPolling = (cleanerId, sessionId) => {
//     let attempts = 0;
//     const maxAttempts = 30; // 5 minutes (10-second intervals)
    
//     const poll = async () => {
//       attempts++;
//       if (attempts > maxAttempts) {
//         console.log('Polling timeout reached');
//         return;
//       }
      
//       try {
//         const response = await userService.checkVerificationStatus(cleanerId);
//         const status = response.data;
        
//         if (status.identity_verified === 'verified') {
//           // Success!
//           Alert.alert(
//             'Verification Complete!',
//             'Your identity has been successfully verified.',
//             [{ 
//               text: 'Continue',
//               onPress: () => refreshVerificationStatus(true)
//             }]
//           );
//           return; // Stop polling
//         } else if (status.identity_verified === 'failed' || 
//                    status.identity_verified === 'canceled') {
//           // Failed or canceled
//           Alert.alert(
//             'Verification Failed',
//             'Please try the verification process again.',
//             [{ text: 'OK' }]
//           );
//           return; // Stop polling
//         }
        
//         // Continue polling
//         setTimeout(poll, 10000); // Check every 10 seconds
        
//       } catch (error) {
//         console.error('Polling error:', error);
//         setTimeout(poll, 10000); // Retry after 10 seconds
//       }
//     };
    
//     // Start polling after a short delay
//     setTimeout(poll, 5000);
//   };

//   const handlePress = async (type) => {
//     if (type === 'avatar') addImage();
//     else if (type === 'onboarding') onboardCleaner();
//     else if (type === 'verify_identity') {
//       try {
//         // Create a deep link URL that will redirect back to your app
//         // Use your app's custom URL scheme or universal link
        
//         const returnUrl = 'https://www.freshsweeper.com/id-verification-complete'
//         const response = await userService.createVerificationSession({
//           cleanerId: currentUserId,
//           return_url: `${returnUrl}?cleanerId=${currentUserId}`, // Add cleanerId to return URL
//           ...user,
//         });
        
//         Linking.openURL(response.data.url).then(() => {
//           Alert.alert(
//             'ID Verification',
//             'Complete the verification process in your browser. You will be redirected back to the app when finished.',
//             [{ text: 'OK' }]
//           );
//         });
        
//         // Start checking for verification status
//         startVerificationStatusPolling(currentUserId, response.data.sessionId);
        
//       } catch (err) {
//         console.error('ID verification error:', err.message);
//         Alert.alert('Error', 'Failed to start ID verification. Please try again.');
//       }
//     }
//   };

//   const getUploadedPhoto = async (uploadedUrl) => {
//     try {
//       const data = { userId: currentUserId, avatar: uploadedUrl };
//       await userService.updateProfileAvatar(data);
//       await updateFirebaseAvatar(data);
//       await refreshVerificationStatus();
//     } catch (err) {
//       console.log('Error after photo upload:', err.message || err);
//     }
//   };

//   const updateFirebaseAvatar = async ({ userId, avatar }) => {
//     const snap = await get(ref(db, `users/${userId}`));
//     if (snap.exists()) {
//       await update(ref(db, `users/${userId}`), { avatar });
//     }
//   };

//   const addImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert(
//         'Permission required',
//         'We need access to your photos to upload a profile picture.'
//       );
//       return;
//     }
  
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 4],
//       quality: 0.8,
//     });
  
//     if (result.canceled) return;
//     if (!result.assets || !Array.isArray(result.assets) || !result.assets.length) {
//       console.warn('ImagePicker returned no assets:', result);
//       return;
//     }
  
//     const uri = result.assets[0].uri;
//     setAvatarUri(uri);
  
//     const imageName = `avatar_${currentUserId}.${uri.split('.').pop()}`;
//     const uploadedUrl = await uploadFile(uri, `profile/${imageName}`);
//     await getUploadedPhoto(uploadedUrl);
//   };

//   const generateVerificationItems = (user) => {
//     const hasAvatar = !!user.avatar?.trim();
//     const hasOnboarded = user.onboarding_completed;
//     const hasVerifiedID = user.identity_verified;
 

//     return [
//       {
//         id: 1,
//         icon: 'account',
//         label: 'Upload Profile Photo',
//         description: 'Helps build trust with hosts.',
//         type: 'avatar',
//         isCompleted: hasAvatar,
//         isEnabled: true,
//       },
//       {
//         id: 2,
//         icon: 'credit-card',
//         label: hasOnboarded ? 'Payment Setup Complete' : 'Set Up Payment',
//         description: hasOnboarded 
//           ? 'Your Stripe account is connected and ready for payouts.'
//           : 'Receive your payouts securely through Stripe.',
//         type: 'onboarding',
//         isCompleted: hasOnboarded,
//         isEnabled: hasAvatar,
//         status: hasOnboarded ? 'complete' : 'pending'
//       },
//       {
//         id: 3,
//         icon: 'shield-check',
//         label: hasVerifiedID === 'verified' ? 'Identity Verified' : 
//                 hasVerifiedID === 'pending' ? 'Verification in Progress' :
//                 hasVerifiedID === 'requires_input' ? 'More Info Needed' :
//                 hasVerifiedID === 'failed' ? 'Verification Failed' : 'Verify Identity',
//         description: hasVerifiedID === 'verified' 
//             ? 'Your identity has been successfully verified.'
//             : hasVerifiedID === 'pending'
//             ? 'Your ID verification is being processed.'
//             : hasVerifiedID === 'requires_input'
//             ? 'Additional information is needed to verify your identity.'
//             : hasVerifiedID === 'failed'
//             ? 'ID verification failed. Please try again.'
//             : 'Confirm your ID to get started.',
//         type: 'verify_identity',
//         isCompleted: hasVerifiedID === 'verified',
//         isEnabled: hasAvatar && hasOnboarded,
//       },
//     ];
//   };

//   const renderItem = ({ item }) => (
//     <VerificationListItem
//       icon={item.icon}
//       label={item.label}
//       description={item.description}
//       isEnabled={item.isEnabled}
//       isCompleted={item.isCompleted}
//       onPress={() => handlePress(item.type)}
//       status={item.status}
//     />
//   );

//   // Show loading when processing deep link
//   if (processingDeepLink) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ marginTop: 10, textAlign: 'center' }}>
//           Verifying your Stripe account...{'\n'}
//           <Text style={{ fontSize: 12, color: COLORS.gray }}>
//             This may take a few seconds
//           </Text>
//         </Text>
//       </View>
//     );
//   }

//   if (loading && !processingDeepLink) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ marginTop: 10 }}>Checking your account status...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.topBanner}>
//         <Text style={styles.welcomeTitle}>You're Almost Done</Text>
//         <Text style={styles.welcomeSubtitle}>
//           Just complete the final steps below so you can start accepting jobs with confidence. We've made it quick and easy.
//         </Text>
        
//         {/* Show deep link status if applicable */}
//         {(deepLinkStripeAccountId || deepLinkCleanerId) && (
//           <View style={styles.deepLinkBanner}>
//             <MaterialIcons name="link" size={16} color={COLORS.primary} />
//             <Text style={styles.deepLinkText}>
//               {deepLinkStripeAccountId 
//                 ? 'Processing your Stripe onboarding...' 
//                 : 'Processing your ID verification...'}
//             </Text>
//           </View>
//         )}
//       </View>

//       <View style={{ alignItems: 'center', marginVertical: 10 }}>
//         <TouchableOpacity onPress={addImage}>
//           {avatarUri ? (
//             <Image
//               source={{ uri: avatarUri }}
//               style={{
//                 width: 110,
//                 height: 110,
//                 borderRadius: 55,
//                 borderWidth: 2,
//                 borderColor: COLORS.primary,
//               }}
//             />
//           ) : (
//             <View
//               style={{
//                 width: 110,
//                 height: 110,
//                 borderRadius: 55,
//                 backgroundColor: COLORS.light_gray_1,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <MaterialIcons name="add-a-photo" size={32} color="#888" />
//             </View>
//           )}
//         </TouchableOpacity>
//         <Text style={{ marginTop: 8, color: COLORS.gray }}>
//           {user?.firstname} {user?.lastname}
//         </Text>
        
//         {/* Manual refresh button */}
//         <TouchableOpacity 
//           style={styles.refreshButton}
//           onPress={() => refreshVerificationStatus(true)}
//         >
//           <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//           <Text style={styles.refreshText}>Refresh Status</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={verifyList}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContainer}
//         extraData={[onboardingStatus, user?.identity_verified]} // Ensures re-render when status changes
//         scrollEnabled={false}
//       />
//     </View>
//   );
// };

// export default AccountVerificationGate;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 20,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   topBanner: {
//     paddingHorizontal: 24,
//     paddingTop: 50,
//     paddingBottom: 20,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   welcomeTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   welcomeSubtitle: {
//     fontSize: 15,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   deepLinkBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f9ff',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//     alignSelf: 'stretch',
//   },
//   deepLinkText: {
//     marginLeft: 8,
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginTop: 12,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   refreshText: {
//     marginLeft: 6,
//     color: COLORS.primary,
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
// });


// import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Linking,
//   Platform,
//   BackHandler,
//   AppState,
//   DeviceEventEmitter,
// } from 'react-native';
// import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';

// import ROUTES from '../../../constants/routes';
// import COLORS from '../../../constants/colors';
// import { AuthContext } from '../../../context/AuthContext';
// import userService from '../../../services/connection/userService';
// import VerificationListItem from '../../../components/cleaner/VerificationListItem';
// import uploadFile from '../../../services/firebase/UploadFile';
// import { get, ref, update } from 'firebase/database';
// import { db } from '../../../services/firebase/config';





// const AccountVerificationGate = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { login, currentUserId, currentUser } = useContext(AuthContext);
  
//   const expoPushToken = route.params?.expo_push_token;
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [verifyList, setVerifyList] = useState([]);
//   const [avatarUri, setAvatarUri] = useState(null);
//   const [accountId, setAccountId] = useState(null);
//   const [onboardingUrl, setOnboardingUrl] = useState(null);
//   const [onboardingStatus, setOnboardingStatus] = useState('Not Onboarded');
//   const [processingDeepLink, setProcessingDeepLink] = useState(false);
  
//   // Track if we've processed the current deep link to avoid duplicates
//   const processedDeepLinkRef = useRef(null);
//   const appState = useRef(AppState.currentState);

//   // Get deep link parameters
//   const deepLinkParams = route.params || {};
//   const {
//     cleanerId: deepLinkCleanerId,
//     stripe_account_id: deepLinkStripeAccountId,
//     timestamp: deepLinkTimestamp,
//     type: deepLinkType,
//     source: deepLinkSource,
//     flow: deepLinkFlow,
//     redirect_to: deepLinkRedirectTo
//   } = deepLinkParams;

//   const isFullyVerified = (u) =>
//     !!u?.avatar?.trim() && u?.onboarding_completed && u?.identity_verified;

//   // Listen for app state changes (when app comes back from browser)
//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', nextAppState => {
//       if (
//         appState.current.match(/inactive|background/) &&
//         nextAppState === 'active'
//       ) {
//         // App has come to the foreground - check if we need to refresh
//         console.log('App came to foreground, checking for updates...');
//         refreshVerificationStatus();
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   // NEW: Handle verification-complete deep links from ID verification
//   useEffect(() => {
//     // Check if we received a verification-complete deep link
//     console.log('🔍 Checking for verification-complete deep link:', deepLinkParams);
    
//     // Option 1: Check route params (when app was opened by deep link)
//     if (deepLinkCleanerId && deepLinkCleanerId === currentUserId) {
//       console.log('✅ Received verification-complete deep link with cleanerId:', deepLinkCleanerId);
      
//       // Show success message
//       Alert.alert(
//         'ID Verification Complete!',
//         'Your identity has been successfully verified.',
//         [{ 
//           text: 'Continue',
//           onPress: () => {
//             // Refresh to update verification status
//             refreshVerificationStatus(true);
//           }
//         }]
//       );
//     }
    
//     // Option 2: Also listen for DeviceEventEmitter events (when app was already open)
//     const verificationSubscription = DeviceEventEmitter.addListener(
//       'verificationComplete',
//       (data) => {
//         console.log('📬 Verification complete event received:', data);
//         if (data.cleanerId === currentUserId) {
//           handleIDVerificationComplete(data.cleanerId);
//         }
//       }
//     );

//     return () => verificationSubscription.remove();
//   }, [deepLinkCleanerId, currentUserId]);

//   // Handle Stripe onboarding deep links
//   useEffect(() => {
//     if (deepLinkStripeAccountId && 
//         deepLinkCleanerId === currentUserId && 
//         !processingDeepLink) {
      
//       // Create a unique key for this deep link to avoid processing duplicates
//       const deepLinkKey = `${deepLinkStripeAccountId}_${deepLinkTimestamp}`;
      
//       if (processedDeepLinkRef.current !== deepLinkKey) {
//         processedDeepLinkRef.current = deepLinkKey;
//         handleStripeOnboardingComplete();
//       }
//     }
//   }, [deepLinkStripeAccountId, deepLinkCleanerId, currentUserId]);

//   // NEW: Function to handle ID verification completion
//   const handleIDVerificationComplete = async (cleanerId) => {
//     try {
//       console.log('✅ Handling ID verification completion for cleaner:', cleanerId);
      
//       // Show immediate feedback
//       Alert.alert(
//         'ID Verification Complete!',
//         'Your identity has been successfully verified.',
//         [{ 
//           text: 'Continue',
//           onPress: async () => {
//             // Refresh user data to update verification status
//             await refreshVerificationStatus(true);
//           }
//         }]
//       );
//     } catch (error) {
//       console.error('Error handling ID verification complete:', error);
//       Alert.alert('Error', 'Failed to update verification status.');
//     }
//   };

//   const handleStripeOnboardingComplete = async () => {
//     if (processingDeepLink) return;
    
//     setProcessingDeepLink(true);
//     try {
//       console.log('Processing Stripe onboarding completion deep link:', deepLinkParams);
      
//       // Show immediate feedback
//       setOnboardingStatus('Verifying...');
      
//       // Verify with backend that Stripe onboarding is actually complete
//       const verificationResult = await verifyStripeOnboardingStatus(
//         deepLinkCleanerId, 
//         deepLinkStripeAccountId
//       );

//       if (verificationResult.charges_enabled) {
//         // Update user's onboarding status
//         await updateUserOnboardingStatus(deepLinkCleanerId, true);
        
//         // Force immediate UI update
//         setOnboardingStatus('Onboarded');
        
//         // Refresh the user data to reflect the updated status
//         await refreshVerificationStatus(true); // Force refresh
        
//         Alert.alert(
//           'Payment Setup Complete!',
//           'Your Stripe account has been successfully connected. You can now receive payments.',
//           [{ text: 'Continue' }]
//         );
//       } else {
//         setOnboardingStatus('Not Onboarded');
//         Alert.alert(
//           'Verification in Progress',
//           'Your Stripe account is being verified. This may take a few minutes.',
//           [{ text: 'OK' }]
//         );
//       }
//     } catch (error) {
//       console.error('Error processing Stripe onboarding:', error);
//       setOnboardingStatus('Not Onboarded');
//       Alert.alert(
//         'Verification Error',
//         'There was an issue verifying your Stripe account. Please try again.',
//         [{ text: 'OK' }]
//       );
//     } finally {
//       setProcessingDeepLink(false);
//     }
//   };

//   const verifyStripeOnboardingStatus = async (cleanerId, stripeAccountId) => {
//     try {
//       // Call your backend to verify Stripe status
//       const response = await userService.verifyStripeOnboarding({
//         cleanerId,
//         stripe_account_id: stripeAccountId
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error verifying Stripe onboarding:', error);
//       throw error;
//     }
//   };

//   const updateUserOnboardingStatus = async (cleanerId, status) => {
//     try {
//       // Update user's onboarding status in your backend
//       await userService.updateOnboardingStatus({
//         userId: cleanerId,
//         onboarding_completed: status
//       });
//     } catch (error) {
//       console.error('Error updating onboarding status:', error);
//       throw error;
//     }
//   };

//   const refreshVerificationStatus = async (force = false) => {
//     try {
//       setLoading(true);
//       const res = await userService.getUser(currentUserId);
//       const updatedUser = res.data;

//       console.log("Refreshed user data:", updatedUser);
//       setUser(updatedUser);
//       setAvatarUri(updatedUser.avatar || null);

//       if (isFullyVerified(updatedUser)) {
//         login({ resp: updatedUser, expoPushToken });
//         navigation.reset({
//           index: 0,
//           routes: [{ name: ROUTES.cleaner_dashboard }],
//         });
//       } else {
//         const newOnboardingStatus = updatedUser.onboarding_completed ? 'Onboarded' : 'Not Onboarded';
//         setOnboardingStatus(newOnboardingStatus);
//         setVerifyList(generateVerificationItems(updatedUser));
        
//         // If we just completed onboarding via deep link, show immediate feedback
//         if (force && updatedUser.onboarding_completed) {
//           setVerifyList(generateVerificationItems(updatedUser));
//         }
//       }
//     } catch (error) {
//       console.error('refreshVerificationStatus error:', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Enhanced useFocusEffect with additional triggers
//   useFocusEffect(
//     useCallback(() => {
//       refreshVerificationStatus();
      
//       // Also refresh when screen comes into focus if we have deep link params
//       if (deepLinkStripeAccountId || deepLinkCleanerId) {
//         const timer = setTimeout(() => {
//           refreshVerificationStatus();
//         }, 1000);
//         return () => clearTimeout(timer);
//       }
//     }, [currentUserId, deepLinkStripeAccountId, deepLinkCleanerId])
//   );

//   // Additional refresh when component mounts
//   useEffect(() => {
//     refreshVerificationStatus();
//   }, []);

//   const onboardCleaner = async () => {
//     try {
//       setLoading(true);
//       if (onboardingStatus === 'Not Onboarded') {
//         const response = await userService.createStripeConnectAccount({
//           firstname: user.firstname,
//           lastname: user.lastname,
//           email: user.email,
//         });
//         setAccountId(response.data.account_id);

//         const linkRes = await userService.createLinkUrl(response.data.account_id, user._id);
//         setOnboardingUrl(linkRes.data.update_link);
//         setOnboardingStatus('Onboarding in Progress');
        
//         // Clear any previous deep link processing
//         processedDeepLinkRef.current = null;
        
//         // Open Stripe onboarding - the user will be redirected back via deep link
//         Linking.openURL(linkRes.data.update_link);

//         if (Platform.OS === 'android') {
//           setTimeout(() => BackHandler.exitApp(), 300);
//         }
//       }
//     } catch (error) {
//       console.error('Onboarding error:', error.message);
//       Alert.alert('Error', error.response?.data || 'Failed to start onboarding.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handlePress = async (type) => {
//   //   if (type === 'avatar') addImage();
//   //   else if (type === 'onboarding') onboardCleaner();
//   //   else if (type === 'verify_identity') {
//   //     try {
//   //       const response = await userService.createVerificationSession({
//   //         cleanerId: currentUserId,
//   //         ...user,
//   //       });
        
//   //       // Save the verification session ID to check later
//   //       // const verificationSessionId = response.data.sessionId;
        
//   //       Linking.openURL(response.data.url).then(() => {
//   //         // Show message that user will be redirected back
//   //         Alert.alert(
//   //           'ID Verification',
//   //           'Complete the verification process in your browser. You will be redirected back to the app when finished.',
//   //           [{ text: 'OK' }]
//   //         );
          
//   //         // Refresh after a delay when user returns from verification
//   //         setTimeout(() => refreshVerificationStatus(), 3000);
//   //       });
//   //     } catch (err) {
//   //       console.error('ID verification error:', err.message);
//   //       Alert.alert('Error', 'Failed to start ID verification. Please try again.');
//   //     }
//   //   }
//   // };

//   const startVerificationStatusPolling = (cleanerId, sessionId) => {
//     let attempts = 0;
//     const maxAttempts = 30; // 5 minutes (10-second intervals)
    
//     const poll = async () => {
//       attempts++;
//       if (attempts > maxAttempts) {
//         console.log('Polling timeout reached');
//         return;
//       }
      
//       try {
//         const response = await userService.checkVerificationStatus(cleanerId);
//         const status = response.data;
        
//         if (status.identity_verified === 'verified') {
//           // Success!
//           Alert.alert(
//             'Verification Complete!',
//             'Your identity has been successfully verified.',
//             [{ 
//               text: 'Continue',
//               onPress: () => refreshVerificationStatus(true)
//             }]
//           );
//           return; // Stop polling
//         } else if (status.identity_verified === 'failed' || 
//                    status.identity_verified === 'canceled') {
//           // Failed or canceled
//           Alert.alert(
//             'Verification Failed',
//             'Please try the verification process again.',
//             [{ text: 'OK' }]
//           );
//           return; // Stop polling
//         }
        
//         // Continue polling
//         setTimeout(poll, 10000); // Check every 10 seconds
        
//       } catch (error) {
//         console.error('Polling error:', error);
//         setTimeout(poll, 10000); // Retry after 10 seconds
//       }
//     };
    
//     // Start polling after a short delay
//     setTimeout(poll, 5000);
//   };

//   const handlePress = async (type) => {
//     if (type === 'avatar') addImage();
//     else if (type === 'onboarding') onboardCleaner();
//     else if (type === 'verify_identity') {
  
//       try {
//         // Create a deep link URL that will redirect back to your app
//         // Use your app's custom URL scheme or universal link
        
//         const returnUrl = 'https://www.freshsweeper.com/id-verification-complete'
//         const response = await userService.createVerificationSession({
//           cleanerId: currentUserId,
//           return_url: `${returnUrl}?cleanerId=${currentUserId}`, // Add cleanerId to return URL
//           ...user,
//         });
        
//         Linking.openURL(response.data.url).then(() => {
//           Alert.alert(
//             'ID Verification',
//             'Complete the verification process in your browser. You will be redirected back to the app when finished.',
//             [{ text: 'OK' }]
//           );
//         });
        
//         // Start checking for verification status
//         startVerificationStatusPolling(currentUserId, response.data.sessionId);
        
//       } catch (err) {
//         console.error('ID verification error:', err.message);
//         Alert.alert('Error', 'Failed to start ID verification. Please try again.');
//       }
//     }
//   };

//   const getUploadedPhoto = async (uploadedUrl) => {
//     try {
//       const data = { userId: currentUserId, avatar: uploadedUrl };
//       await userService.updateProfileAvatar(data);
//       await updateFirebaseAvatar(data);
//       await refreshVerificationStatus();
//     } catch (err) {
//       console.log('Error after photo upload:', err.message || err);
//     }
//   };

//   const updateFirebaseAvatar = async ({ userId, avatar }) => {
//     const snap = await get(ref(db, `users/${userId}`));
//     if (snap.exists()) {
//       await update(ref(db, `users/${userId}`), { avatar });
//     }
//   };

//   const addImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert(
//         'Permission required',
//         'We need access to your photos to upload a profile picture.'
//       );
//       return;
//     }
  
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 4],
//       quality: 0.8,
//     });
  
//     if (result.canceled) return;
//     if (!result.assets || !Array.isArray(result.assets) || !result.assets.length) {
//       console.warn('ImagePicker returned no assets:', result);
//       return;
//     }
  
//     const uri = result.assets[0].uri;
//     setAvatarUri(uri);
  
//     const imageName = `avatar_${currentUserId}.${uri.split('.').pop()}`;
//     const uploadedUrl = await uploadFile(uri, `profile/${imageName}`);
//     await getUploadedPhoto(uploadedUrl);
//   };

//   const generateVerificationItems = (user) => {
//     const hasAvatar = !!user.avatar?.trim();
//     const hasOnboarded = user.onboarding_completed;
//     const hasVerifiedID = user.identity_verified;
 

//     return [
//       {
//         id: 1,
//         icon: 'account',
//         label: 'Upload Profile Photo',
//         description: 'Helps build trust with hosts.',
//         type: 'avatar',
//         isCompleted: hasAvatar,
//         isEnabled: true,
//       },
//       {
//         id: 2,
//         icon: 'credit-card',
//         label: hasOnboarded ? 'Payment Setup Complete' : 'Set Up Payment',
//         description: hasOnboarded 
//           ? 'Your Stripe account is connected and ready for payouts.'
//           : 'Receive your payouts securely through Stripe.',
//         type: 'onboarding',
//         isCompleted: hasOnboarded,
//         isEnabled: hasAvatar,
//         status: hasOnboarded ? 'complete' : 'pending'
//       },
//       {
//         id: 3,
//         // icon: 'shield-check',
//         // label: hasVerifiedID ? 'Identity Verified' : 'Verify Identity',
//         // description: hasVerifiedID
//         //   ? 'Your identity has been successfully verified.'
//         //   : 'Confirm your ID to get started.',
//         // type: 'verify_identity',
//         // isCompleted: hasVerifiedID,
//         // isEnabled: hasAvatar && hasOnboarded,


//         icon: 'shield-check',
//         label: hasVerifiedID === 'verified' ? 'Identity Verified' : 
//                 hasVerifiedID === 'pending' ? 'Verification in Progress' :
//                 hasVerifiedID === 'requires_input' ? 'More Info Needed' :
//                 hasVerifiedID === 'failed' ? 'Verification Failed' : 'Verify Identity',
//         description: hasVerifiedID === 'verified' 
//             ? 'Your identity has been successfully verified.'
//             : hasVerifiedID === 'pending'
//             ? 'Your ID verification is being processed.'
//             : hasVerifiedID === 'requires_input'
//             ? 'Additional information is needed to verify your identity.'
//             : hasVerifiedID === 'failed'
//             ? 'ID verification failed. Please try again.'
//             : 'Confirm your ID to get started.',
//         type: 'verify_identity',
//         isCompleted: hasVerifiedID === 'verified',
//         isEnabled: hasAvatar && hasOnboarded,
//       },
//     ];
//   };

//   const renderItem = ({ item }) => (
//     <VerificationListItem
//       icon={item.icon}
//       label={item.label}
//       description={item.description}
//       isEnabled={item.isEnabled}
//       isCompleted={item.isCompleted}
//       onPress={() => handlePress(item.type)}
//       status={item.status}
//     />
//   );

//   // Show loading when processing deep link
//   if (processingDeepLink) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ marginTop: 10, textAlign: 'center' }}>
//           Verifying your Stripe account...{'\n'}
//           <Text style={{ fontSize: 12, color: COLORS.gray }}>
//             This may take a few seconds
//           </Text>
//         </Text>
//       </View>
//     );
//   }

//   if (loading && !processingDeepLink) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ marginTop: 10 }}>Checking your account status...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.topBanner}>
//         <Text style={styles.welcomeTitle}>You're Almost Done</Text>
//         <Text style={styles.welcomeSubtitle}>
//           Just complete the final steps below so you can start accepting jobs with confidence. We've made it quick and easy.
//         </Text>
        
//         {/* Show deep link status if applicable */}
//         {(deepLinkStripeAccountId || deepLinkCleanerId) && (
//           <View style={styles.deepLinkBanner}>
//             <MaterialIcons name="link" size={16} color={COLORS.primary} />
//             <Text style={styles.deepLinkText}>
//               {deepLinkStripeAccountId 
//                 ? 'Processing your Stripe onboarding...' 
//                 : 'Processing your ID verification...'}
//             </Text>
//           </View>
//         )}
//       </View>

//       <View style={{ alignItems: 'center', marginVertical: 10 }}>
//         <TouchableOpacity onPress={addImage}>
//           {avatarUri ? (
//             <Image
//               source={{ uri: avatarUri }}
//               style={{
//                 width: 110,
//                 height: 110,
//                 borderRadius: 55,
//                 borderWidth: 2,
//                 borderColor: COLORS.primary,
//               }}
//             />
//           ) : (
//             <View
//               style={{
//                 width: 110,
//                 height: 110,
//                 borderRadius: 55,
//                 backgroundColor: COLORS.light_gray_1,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <MaterialIcons name="add-a-photo" size={32} color="#888" />
//             </View>
//           )}
//         </TouchableOpacity>
//         <Text style={{ marginTop: 8, color: COLORS.gray }}>
//           {user?.firstname} {user?.lastname}
//         </Text>
        
//         {/* Manual refresh button */}
//         <TouchableOpacity 
//           style={styles.refreshButton}
//           onPress={() => refreshVerificationStatus(true)}
//         >
//           <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//           <Text style={styles.refreshText}>Refresh Status</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={verifyList}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContainer}
//         extraData={[onboardingStatus, user?.identity_verified]} // Ensures re-render when status changes
//         scrollEnabled={false}
//       />
//     </View>
//   );
// };

// export default AccountVerificationGate;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 20,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   topBanner: {
//     paddingHorizontal: 24,
//     paddingTop: 50,
//     paddingBottom: 20,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   welcomeTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   welcomeSubtitle: {
//     fontSize: 15,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   deepLinkBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f9ff',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//     alignSelf: 'stretch',
//   },
//   deepLinkText: {
//     marginLeft: 8,
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginTop: 12,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   refreshText: {
//     marginLeft: 6,
//     color: COLORS.primary,
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
// });