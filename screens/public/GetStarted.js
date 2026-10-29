import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  RefreshControl
} from 'react-native';

import {
  useRoute,
  useNavigation,
} from '@react-navigation/native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import * as Animatable from 'react-native-animatable';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import RoleSelection from '../../components/shared/RoleSelection';
import fetchIPGeolocation from '../../services/geolocation';
import { useNotification } from '../../hooks/useNotification';
import { navigationRef } from '../../utils/navigationRef';
import { useTheme } from '../../theme';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID =
  '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

const GetStarted = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params || {};

  const {
    login,
  } = useContext(AuthContext);

  const {
    registerForPushNotificationsAsync,
  } = useNotification();

  const {
    theme,
    isDark,
  } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [
    selectedRole,
    setSelectedRole,
  ] = useState(null);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const [
    appleLoading,
    setAppleLoading,
  ] = useState(false);

  const [
    appleAuthAvailable,
    setAppleAuthAvailable,
  ] = useState(false);

  const [
    geolocationData,
    setGeolocationData,
  ] = useState(null);

  const [
    fetchingLocation,
    setFetchingLocation,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /*
  * ============================================================
  * PULL-TO-REFRESH
  * ============================================================
  */

  const onRefresh = useCallback(async () => {
    if (
      refreshing ||
      googleLoading ||
      appleLoading
    ) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all([
        fetchGeolocation(),
        checkAppleAuthAvailability(),
      ]);
    } catch (error) {
      console.error(
        '❌ GetStarted refresh error:',
        error
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshing,
    googleLoading,
    appleLoading,
    fetchGeolocation,
    checkAppleAuthAvailability,
  ]);
  /*
   * ============================================================
   * GOOGLE AUTH
   * ============================================================
   */

  const [
    request,
    response,
    promptAsync,
  ] = Google.useAuthRequest({
    iosClientId:
      GOOGLE_CLIENT_ID,

    androidClientId:
      GOOGLE_CLIENT_ID,

    webClientId:
      GOOGLE_CLIENT_ID,

    scopes: [
      'profile',
      'email',
      'openid',
    ],

    idToken: true,
  });

  /*
   * ============================================================
   * INITIALIZATION
   * ============================================================
   */

  const fetchGeolocation =
    useCallback(async () => {
      try {
        setFetchingLocation(true);

        const data =
          await fetchIPGeolocation();

        setGeolocationData(
          data || null
        );

        console.log(
          '📍 Location fetched:',
          data
        );
      } catch (error) {
        /*
         * Location is supplemental.
         * It must never block signup.
         */
        console.error(
          '❌ Failed to fetch location:',
          error
        );

        setGeolocationData(null);
      } finally {
        setFetchingLocation(false);
      }
    }, []);

  const checkAppleAuthAvailability =
    useCallback(async () => {
      try {
        if (Platform.OS !== 'ios') {
          setAppleAuthAvailable(false);
          return;
        }

        const available =
          await AppleAuthentication.isAvailableAsync();

        setAppleAuthAvailable(
          Boolean(available)
        );
      } catch (error) {
        console.error(
          '❌ Error checking Apple availability:',
          error
        );

        setAppleAuthAvailable(false);
      }
    }, []);

  useEffect(() => {
    fetchGeolocation();
    checkAppleAuthAvailability();
  }, [
    fetchGeolocation,
    checkAppleAuthAvailability,
  ]);

  // /*
  //  * ============================================================
  //  * GOOGLE RESPONSE
  //  * ============================================================
  //  *
  //  * This only fires when Google authentication is
  //  * initiated directly from GetStarted.
  //  *
  //  * If LoginOptions already authenticated the user,
  //  * the existing Google credential is passed through
  //  * route params and we do not authenticate again.
  //  */

  // useEffect(() => {
  //   if (
  //     response?.type ===
  //     'success'
  //   ) {
  //     handleGoogleAuthResponse(
  //       response
  //     );

  //     return;
  //   }

  //   if (
  //     response?.type ===
  //     'error'
  //   ) {
  //     console.error(
  //       '❌ Google auth error:',
  //       response.error
  //     );

  //     Alert.alert(
  //       'Google Sign-In',
  //       'Google authentication failed. Please try again.'
  //     );

  //     setGoogleLoading(false);
  //   }
  // }, [response]);

  /*
  * ============================================================
  * GOOGLE RESPONSE
  * ============================================================
  */

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'success') {
      handleGoogleAuthResponse(response);
      return;
    }

    if (response.type === 'cancel') {
      console.log(
        'ℹ️ Google authentication cancelled.'
      );

      setGoogleLoading(false);
      return;
    }

    if (response.type === 'dismiss') {
      console.log(
        'ℹ️ Google authentication dismissed.'
      );

      setGoogleLoading(false);
      return;
    }

    if (response.type === 'error') {
      console.error(
        '❌ Google auth error:',
        response.error
      );

      setGoogleLoading(false);

      Alert.alert(
        'Google Sign-In',
        'Google authentication failed. Please try again.'
      );
    }
  }, [response]);

  /*
   * ============================================================
   * ROLE
   * ============================================================
   */

  const handleRoleSelect =
    useCallback((role) => {
      console.log(
        '👤 Role selected:',
        role
      );

      setSelectedRole(role);
    }, []);

  /*
   * ============================================================
   * EMAIL SIGNUP
   * ============================================================
   */

  const handleEmailSignup =
    useCallback(() => {
      if (!selectedRole) {
        Alert.alert(
          'Select Your Role',
          'Please select whether you are a Host or Cleaner first.'
        );

        return;
      }

      if (fetchingLocation) {
        Alert.alert(
          'Please Wait',
          'We are finishing your setup. Please try again in a moment.'
        );

        return;
      }

      navigation.navigate(
        ROUTES.signup,
        {
          userType:
            selectedRole,

          geolocation:
            geolocationData ||
            null,
        }
      );
    }, [
      selectedRole,
      fetchingLocation,
      navigation,
      geolocationData,
    ]);

  // /*
  //  * ============================================================
  //  * GOOGLE SIGN-IN
  //  * ============================================================
  //  */

  // const handleGoogleSignIn =
  //   async () => {
  //     try {
  //       if (!selectedRole) {
  //         Alert.alert(
  //           'Select Your Role',
  //           'Please select whether you are a Host or Cleaner first.'
  //         );

  //         return;
  //       }

  //       if (fetchingLocation) {
  //         Alert.alert(
  //           'Please Wait',
  //           'We are detecting your location. Please try again in a moment.'
  //         );

  //         return;
  //       }

  //       /*
  //        * ======================================================
  //        * IMPORTANT:
  //        *
  //        * If GetStarted was reached from LoginOptions because
  //        * Google authentication already succeeded, DO NOT
  //        * authenticate with Google again.
  //        * ======================================================
  //        */

  //       if (
  //         params.googleUser &&
  //         params.idToken
  //       ) {
  //         console.log(
  //           '🔵 Using existing Google credential from LoginOptions'
  //         );

  //         setGoogleLoading(true);

  //         await handleGoogleBackendLogin(
  //           params.idToken,
  //           selectedRole,
  //           params.googleUser
  //         );

  //         return;
  //       }

  //       if (!request) {
  //         Alert.alert(
  //           'Google Sign-In',
  //           'Google authentication is not ready yet. Please try again.'
  //         );

  //         return;
  //       }

  //       setGoogleLoading(true);

  //       await promptAsync();
  //     } catch (error) {
  //       console.error(
  //         '❌ Google sign-in error:',
  //         error
  //       );

  //       Alert.alert(
  //         'Google Sign-In',
  //         error?.message ||
  //           'Google sign-in failed. Please try again.'
  //       );

  //       setGoogleLoading(false);
  //     }
  //   };


  /*
  * ============================================================
  * GOOGLE SIGN-IN
  * ============================================================
  */

  const handleGoogleSignIn = async () => {
    if (
      googleLoading ||
      appleLoading
    ) {
      return;
    }

    try {
      if (!selectedRole) {
        Alert.alert(
          'Select Your Role',
          'Please select whether you are a Host or Cleaner first.'
        );
        return;
      }

      if (fetchingLocation) {
        Alert.alert(
          'Please Wait',
          'We are detecting your location. Please try again in a moment.'
        );
        return;
      }

      /*
      * --------------------------------------------------------
      * EXISTING GOOGLE CREDENTIAL
      * --------------------------------------------------------
      */

      if (
        params.googleUser &&
        params.idToken
      ) {
        console.log(
          '🔵 Using existing Google credential from LoginOptions'
        );

        setGoogleLoading(true);

        await handleGoogleBackendLogin(
          params.idToken,
          selectedRole,
          params.googleUser
        );

        return;
      }

      /*
      * --------------------------------------------------------
      * CHECK GOOGLE REQUEST
      * --------------------------------------------------------
      */

      if (!request) {
        Alert.alert(
          'Google Sign-In',
          'Google authentication is not ready yet. Please try again.'
        );

        return;
      }

      /*
      * --------------------------------------------------------
      * START GOOGLE AUTHENTICATION
      * --------------------------------------------------------
      */

      setGoogleLoading(true);

      const result = await promptAsync();

      console.log(
        '🔵 Google authentication result:',
        result?.type
      );

      /*
      * --------------------------------------------------------
      * HANDLE CANCELLATION
      * --------------------------------------------------------
      */

      if (
        result?.type === 'cancel' ||
        result?.type === 'dismiss'
      ) {
        console.log(
          'ℹ️ Google Sign-In cancelled by user.'
        );

        setGoogleLoading(false);
        return;
      }

      /*
      * --------------------------------------------------------
      * HANDLE AUTHENTICATION ERROR
      * --------------------------------------------------------
      */

      if (
        result?.type === 'error'
      ) {
        console.error(
          '❌ Google authentication error:',
          result.error
        );

        setGoogleLoading(false);

        Alert.alert(
          'Google Sign-In',
          'Google authentication failed. Please try again.'
        );

        return;
      }

      /*
      * --------------------------------------------------------
      * SUCCESS
      * --------------------------------------------------------
      *
      * The response useEffect handles successful authentication.
      * Do not clear the loading state here because the response
      * handler may still be processing the credentials.
      * --------------------------------------------------------
      */
    } catch (error) {
      console.error(
        '❌ Google sign-in error:',
        error
      );

      setGoogleLoading(false);

      Alert.alert(
        'Google Sign-In',
        error?.message ||
          'Google sign-in failed. Please try again.'
      );
    }
  };

  /*
   * ============================================================
   * GOOGLE AUTH RESPONSE
   * ============================================================
   */

  const handleGoogleAuthResponse =
    async (googleResponse) => {
      try {
        setGoogleLoading(true);

        const authentication =
          googleResponse?.authentication;

        const accessToken =
          authentication?.accessToken;

        const idToken =
          authentication?.idToken;

        if (
          !accessToken ||
          !idToken
        ) {
          throw new Error(
            'Google authentication did not return the required credentials.'
          );
        }

        const userInfoResponse =
          await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            }
          );

        if (
          !userInfoResponse.ok
        ) {
          throw new Error(
            'Failed to retrieve your Google account information.'
          );
        }

        const googleUser =
          await userInfoResponse.json();

        await handleGoogleBackendLogin(
          idToken,
          selectedRole,
          googleUser
        );
      } catch (error) {
        console.error(
          '❌ Google auth response error:',
          error
        );

        Alert.alert(
          'Google Sign-In',
          error?.message ||
            'Google authentication failed.'
        );
      } finally {
        setGoogleLoading(false);
      }
    };

  /*
   * ============================================================
   * GOOGLE BACKEND LOGIN / SIGNUP
   * ============================================================
   */

  const handleGoogleBackendLogin =
    async (
      idToken,
      userType,
      googleUser = null
    ) => {
      try {
        if (
          !idToken ||
          typeof idToken !==
            'string'
        ) {
          throw new Error(
            'Invalid Google authentication token.'
          );
        }

        if (!userType) {
          throw new Error(
            'Please select your Host or Cleaner role first.'
          );
        }

        const endpoint =
          'https://www.freshsweeper.com/api/auth/google_auth';

        console.log(
          '📤 GOOGLE SIGNUP REQUEST'
        );

        console.log(
          '👤 Role:',
          userType
        );

        console.log(
          '🔐 Token received:',
          !!idToken
        );

        const response =
          await fetch(
            endpoint,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Accept:
                  'application/json',
              },

              body:
                JSON.stringify({
                  token:
                    idToken,

                  userType,
                }),
            }
          );

        const data =
          await response.json();

        console.log(
          '📥 GOOGLE RESPONSE:',
          {
            status:
              data?.status,

            needsRole:
              data?.needs_role ||
              data?.data?.needs_role ||
              false,

            hasUser:
              !!data?.data,
          }
        );

        /*
         * ======================================================
         * SUCCESS
         * ======================================================
         */

        if (
          response.ok &&
          data?.status ===
            'success' &&
          data?.data
        ) {
          await completeLogin(
            data.data,
            googleUser
          );

          return;
        }

        /*
         * ======================================================
         * ROLE REQUIRED
         *
         * Normally GetStarted already has a role at this point,
         * but we retain this handling for backend compatibility.
         * ======================================================
         */

        if (
          data?.status ===
            'needs_role' ||
          data?.needs_role ===
            true ||
          data?.data?.needs_role ===
            true ||
          data?.detail?.type ===
            'ROLE_REQUIRED'
        ) {
          Alert.alert(
            'Select Your Role',
            'Please select whether you are a Host or Cleaner.'
          );

          return;
        }

        /*
         * ======================================================
         * ERROR
         * ======================================================
         */

        let errorMessage =
          'Google sign-in failed.';

        if (
          typeof data?.detail ===
          'string'
        ) {
          errorMessage =
            data.detail;
        } else if (
          Array.isArray(
            data?.detail
          )
        ) {
          errorMessage =
            data.detail
              .map(
                (error) =>
                  error?.msg ||
                  error?.message ||
                  String(error)
              )
              .join(', ');
        } else if (
          data?.detail?.message
        ) {
          errorMessage =
            data.detail.message;
        } else if (
          data?.message
        ) {
          errorMessage =
            data.message;
        } else if (
          data?.error
        ) {
          errorMessage =
            data.error;
        }

        throw new Error(
          errorMessage
        );
      } catch (error) {
        console.error(
          '❌ Google backend login error:',
          error
        );

        Alert.alert(
          'Google Sign-In',
          error?.message ||
            'Unable to process Google Sign-In.'
        );
      } finally {
        setGoogleLoading(false);
      }
    };

  /*
   * ============================================================
   * APPLE SIGN-IN
   * ============================================================
   */

  const handleAppleSignIn =
    async () => {
      /*
       * ========================================================
       * EXISTING APPLE CREDENTIAL
       *
       * LoginOptions already authenticated this user.
       *
       * DO NOT AUTHENTICATE WITH APPLE AGAIN.
       * ========================================================
       */

      if (params.appleSignup) {
        if (!selectedRole) {
          Alert.alert(
            'Select Your Role',
            'Please select whether you are a Host or Cleaner first.'
          );

          return;
        }

        await completePendingAppleSignup();

        return;
      }

      if (!selectedRole) {
        Alert.alert(
          'Select Your Role',
          'Please select whether you are a Host or Cleaner first.'
        );

        return;
      }

      if (fetchingLocation) {
        Alert.alert(
          'Please Wait',
          'We are detecting your location. Please try again in a moment.'
        );

        return;
      }

      setAppleLoading(true);

      try {
        /*
         * Fresh nonce for this Apple authentication.
         */
        const nonce =
          await Crypto.randomUUID();

        console.log(
          '🍎 Starting Apple Sign-In'
        );

        console.log(
          '👤 Selected role:',
          selectedRole
        );

        const credential =
          await AppleAuthentication.signInAsync(
            {
              requestedScopes: [
                AppleAuthentication
                  .AppleAuthenticationScope
                  .FULL_NAME,

                AppleAuthentication
                  .AppleAuthenticationScope
                  .EMAIL,
              ],

              nonce,
            }
          );

        console.log(
          '🍎 Apple authentication successful'
        );

        console.log(
          '🍎 Apple credential summary:',
          {
            hasIdentityToken:
              !!credential.identityToken,

            hasAuthorizationCode:
              !!credential.authorizationCode,

            appleUserId:
              credential.user,

            hasEmail:
              !!credential.email,

            hasName:
              !!(
                credential.fullName
                  ?.givenName ||
                credential.fullName
                  ?.familyName
              ),
          }
        );

        await handleAppleBackendLogin(
          credential,
          selectedRole,
          nonce
        );
      } catch (error) {
        /*
         * User cancellation is expected.
         */
        if (
          error?.code ===
          'ERR_CANCELED'
        ) {
          return;
        }

        console.error(
          '❌ Apple Sign-In error:',
          error
        );

        Alert.alert(
          'Apple Sign-In',
          error?.message ||
            'Apple Sign-In failed. Please try again.'
        );
      } finally {
        setAppleLoading(false);
      }
    };

  /*
   * ============================================================
   * APPLE BACKEND LOGIN / SIGNUP
   * ============================================================
   */

  const handleAppleBackendLogin =
    async (
      credential,
      userType,
      nonce
    ) => {
      try {
        if (
          !credential?.identityToken
        ) {
          throw new Error(
            'Apple did not return an identity token.'
          );
        }

        const endpoint =
          'https://www.freshsweeper.com/api/auth/apple_auth';

        const payload = {
          identityToken:
            credential.identityToken,

          authorizationCode:
            credential.authorizationCode,

          nonce,

          userType:
            userType || null,

          user: {
            id:
              credential.user,

            email:
              credential.email ||
              null,

            firstname:
              credential.fullName
                ?.givenName ||
              '',

            lastname:
              credential.fullName
                ?.familyName ||
              '',
          },
        };

        console.log(
          '📤 APPLE REQUEST START'
        );

        console.log(
          '👤 Apple user:',
          credential.user
        );

        console.log(
          '👤 Role:',
          userType ||
            'not selected'
        );

        console.log(
          '🔐 Has identity token:',
          !!credential.identityToken
        );

        console.log(
          '🔐 Has authorization code:',
          !!credential.authorizationCode
        );

        const response =
          await fetch(
            endpoint,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Accept:
                  'application/json',
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const rawResponse =
          await response.text();

        let data;

        try {
          data =
            JSON.parse(
              rawResponse
            );
        } catch {
          throw new Error(
            `Apple authentication returned an invalid server response (${response.status}).`
          );
        }

        console.log(
          '📥 APPLE RESPONSE:',
          {
            status:
              data?.status,

            message:
              data?.message,

            needsRole:
              data?.status ===
                'needs_role' ||
              data?.needs_role ===
                true ||
              data?.data?.needs_role ===
                true,
          }
        );

        /*
         * ======================================================
         * NEW APPLE USER
         * ======================================================
         *
         * Normally this happens when LoginOptions is not the
         * entry point and the backend asks us to collect role.
         *
         * IMPORTANT:
         * Preserve the Apple credential.
         */

        if (
          data?.status ===
            'needs_role' ||
          data?.needs_role ===
            true ||
          data?.data?.needs_role ===
            true ||
          data?.detail?.type ===
            'ROLE_REQUIRED'
        ) {
          console.log(
            '🆕 Apple account requires role selection'
          );

          navigation.navigate(
            ROUTES.getting_started,
            {
              appleSignup: true,

              appleCredential: {
                user:
                  credential.user,

                email:
                  credential.email ||
                  null,

                firstname:
                  credential.fullName
                    ?.givenName ||
                  '',

                lastname:
                  credential.fullName
                    ?.familyName ||
                  '',

                identityToken:
                  credential.identityToken,

                authorizationCode:
                  credential.authorizationCode,
              },

              appleNonce:
                nonce,

              geolocation:
                geolocationData ||
                null,
            }
          );

          return {
            success: false,
            needsRole: true,
          };
        }

        /*
         * ======================================================
         * SUCCESS
         * ======================================================
         */

        if (
          response.ok &&
          data?.status ===
            'success' &&
          data?.data
        ) {
          await completeLogin(
            data.data
          );

          return {
            success: true,
            data:
              data.data,
          };
        }

        /*
         * ======================================================
         * ERROR
         * ======================================================
         */

        const errorMessage =
          typeof data?.detail ===
          'string'
            ? data.detail
            : data?.detail
                ?.message ||
              data?.message ||
              data?.error ||
              `Apple Sign-In failed with HTTP ${response.status}`;

        throw new Error(
          errorMessage
        );
      } catch (error) {
        console.error(
          '❌ Apple backend error:',
          error
        );

        throw error;
      }
    };

  /*
   * ============================================================
   * COMPLETE PENDING APPLE SIGNUP
   * ============================================================
   *
   * This is the important second half of:
   *
   * LoginOptions
   *   → Apple
   *   → backend says needs_role
   *   → GetStarted
   *   → user selects role
   *   → backend creates account
   *
   * We do NOT ask Apple to authenticate again.
   */

  const completePendingAppleSignup =
    async () => {
      if (
        !params.appleSignup ||
        !params.appleCredential ||
        !params.appleNonce
      ) {
        Alert.alert(
          'Apple Sign-In',
          'Your Apple signup session is incomplete. Please start again.'
        );

        return true;
      }

      if (!selectedRole) {
        Alert.alert(
          'Select Your Role',
          'Please select whether you are a Host or Cleaner first.'
        );

        return true;
      }

      try {
        setAppleLoading(true);

        const credential = {
          user:
            params.appleCredential
              .user,

          email:
            params.appleCredential
              .email,

          fullName: {
            givenName:
              params.appleCredential
                .firstname ||
              '',

            familyName:
              params.appleCredential
                .lastname ||
              '',
          },

          identityToken:
            params.appleCredential
              .identityToken,

          authorizationCode:
            params.appleCredential
              .authorizationCode,
        };

        await handleAppleBackendLogin(
          credential,
          selectedRole,
          params.appleNonce
        );

        return true;
      } catch (error) {
        console.error(
          '❌ Pending Apple signup error:',
          error
        );

        Alert.alert(
          'Apple Sign-In',
          error?.message ||
            'Unable to complete Apple signup.'
        );

        return true;
      } finally {
        setAppleLoading(false);
      }
    };

  /*
   * ============================================================
   * COMPLETE LOGIN
   * ============================================================
   *
   * Shared by:
   *
   * Google
   * Apple
   *
   * No Firebase.
   */

  const completeLogin =
    async (
      userData,
      googleUser = null
    ) => {
      try {
        console.log(
          '🔐 COMPLETE LOGIN'
        );

        console.log(
          '👤 User ID:',
          userData?._id
        );

        console.log(
          '👤 User Type:',
          userData?.userType
        );

        console.log(
          '📧 Email:',
          userData?.email
        );

        console.log(
          '🔐 Has access token:',
          !!userData?.token
        );

        console.log(
          '🔐 Has refresh token:',
          !!userData?.refresh_token
        );

        /*
         * --------------------------------------------------------
         * VALIDATE
         * --------------------------------------------------------
         */

        if (!userData) {
          throw new Error(
            'Authentication returned no user data.'
          );
        }

        if (!userData.token) {
          throw new Error(
            'Authentication succeeded but no access token was returned.'
          );
        }

        if (!userData._id) {
          throw new Error(
            'Authentication succeeded but no user ID was returned.'
          );
        }

        if (!userData.userType) {
          throw new Error(
            'Authentication succeeded but no user type was returned.'
          );
        }

        if (!userData.email) {
          throw new Error(
            'Authentication succeeded but no email was returned.'
          );
        }

        /*
         * --------------------------------------------------------
         * SAVE SESSION
         * --------------------------------------------------------
         */

        await AsyncStorage.setItem(
          '@auth_token',
          userData.token
        );

        if (
          userData.refresh_token
        ) {
          await AsyncStorage.setItem(
            '@refresh_token',
            userData.refresh_token
          );
        }

        await AsyncStorage.setItem(
          '@user_data',
          JSON.stringify(
            userData
          )
        );

        await AsyncStorage.setItem(
          '@user_type',
          userData.userType
        );

        await AsyncStorage.setItem(
          '@user_id',
          userData._id
        );

        console.log(
          '💾 Authentication session saved'
        );

        /*
         * --------------------------------------------------------
         * AUTH CONTEXT
         * --------------------------------------------------------
         */

        await login({
          resp: userData,
        });

        console.log(
          '✅ AuthContext session updated'
        );

        /*
         * --------------------------------------------------------
         * VERIFY SESSION
         * --------------------------------------------------------
         */

        const [
          savedToken,
          savedRefreshToken,
          savedUserData,
          savedUserType,
          savedUserId,
        ] = await Promise.all([
          AsyncStorage.getItem(
            '@auth_token'
          ),

          AsyncStorage.getItem(
            '@refresh_token'
          ),

          AsyncStorage.getItem(
            '@user_data'
          ),

          AsyncStorage.getItem(
            '@user_type'
          ),

          AsyncStorage.getItem(
            '@user_id'
          ),
        ]);

        console.log(
          '🔐 SESSION VERIFIED:',
          {
            hasToken:
              !!savedToken,

            hasRefreshToken:
              !!savedRefreshToken,

            hasUserData:
              !!savedUserData,

            userType:
              savedUserType,

            userId:
              savedUserId,
          }
        );

        if (
          !savedToken ||
          !savedUserData ||
          !savedUserType ||
          !savedUserId
        ) {
          throw new Error(
            'Authentication session could not be saved correctly.'
          );
        }

        /*
         * --------------------------------------------------------
         * PHONE STATUS
         * --------------------------------------------------------
         */

        const hasPhone =
          typeof userData.phone ===
            'string' &&
          userData.phone
            .trim()
            .length > 0;

        console.log(
          '📱 Phone exists:',
          hasPhone
        );

        /*
         * --------------------------------------------------------
         * PHONE CAPTURE
         *
         * Do NOT mark onboarding complete yet.
         *
         * PhoneCapture is responsible for completing
         * onboarding after the phone has been saved.
         * --------------------------------------------------------
         */

        if (!hasPhone) {
          const navData = {
            userId:
              userData._id,

            userType:
              userData.userType,

            email:
              userData.email ||
              googleUser?.email ||
              '',

            firstName:
              userData.firstname ||
              googleUser?.given_name ||
              '',

            lastName:
              userData.lastname ||
              googleUser?.family_name ||
              '',

            token:
              userData.token,

            refreshToken:
              userData.refresh_token ||
              '',

            userData,

            googleUser:
              googleUser ||
              null,

            geolocation:
              geolocationData ||
              null,
          };

          console.log(
            '📱 Initial setup required — navigating to PhoneCapture'
          );

          navigation.navigate(
            ROUTES.phone_capture,
            navData
          );

          return;
        }

        /*
         * --------------------------------------------------------
         * ONBOARDING COMPLETE
         * --------------------------------------------------------
         */

        await AsyncStorage.setItem(
          '@app_onboarding_completed',
          'true'
        );

        /*
         * Legacy compatibility.
         */
        await AsyncStorage.setItem(
          '@app_onboarding_shown',
          'true'
        );

        /*
         * --------------------------------------------------------
         * PUSH NOTIFICATIONS
         * --------------------------------------------------------
         */

        try {
          await registerForPushNotificationsAsync(
            userData._id
          );

          console.log(
            '✅ Push notification registration completed'
          );
        } catch (
          notificationError
        ) {
          /*
           * Never block login because push registration failed.
           */
          console.warn(
            '⚠️ Push notification registration failed:',
            notificationError?.message ||
              notificationError
          );
        }

        /*
         * --------------------------------------------------------
         * DESTINATION
         * --------------------------------------------------------
         */

        const destination =
          userData.userType ===
          'host'
            ? 'Host'
            : 'Cleaner';

        console.log(
          '🏠 Login destination:',
          destination
        );

        /*
         * --------------------------------------------------------
         * NAVIGATION
         * --------------------------------------------------------
         */

        if (
          navigationRef.isReady()
        ) {
          navigationRef.reset({
            index: 0,

            routes: [
              {
                name:
                  destination,
              },
            ],
          });

          return;
        }

        console.warn(
          '⚠️ navigationRef not ready — using local navigation'
        );

        navigation.reset({
          index: 0,

          routes: [
            {
              name:
                destination,
            },
          ],
        });
      } catch (error) {
        console.error(
          '❌ Complete login error:',
          error?.message ||
            error
        );

        Alert.alert(
          'Login Error',
          error?.message ||
            'Login failed. Please try again.'
        );
      }
    };

  /*
   * ============================================================
   * LOCATION STATUS
   * ============================================================
   */

  const renderLocationStatus =
    () => {
      if (fetchingLocation) {
        return (
          <View
            style={
              styles.locationStatus
            }
          >
            <ActivityIndicator
              size="small"
              color={
                theme.brand.primary
              }
            />

            <Text
              style={
                styles.locationText
              }
            >
              Detecting your location...
            </Text>
          </View>
        );
      }

      if (
        geolocationData
      ) {
        const city =
          geolocationData?.city;

        const country =
          geolocationData?.country;

        if (
          city ||
          country
        ) {
          return (
            <View
              style={[
                styles.locationStatus,
                styles.locationSuccess,
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker-check-outline"
                size={17}
                color={
                  theme.status.success
                }
              />

              <Text
                style={
                  styles.locationText
                }
                numberOfLines={1}
              >
                {city ||
                  'Location detected'}
                {country
                  ? `, ${country}`
                  : ''}
              </Text>
            </View>
          );
        }
      }

      return null;
    };

  /*
   * ============================================================
   * COMPUTED UI STATE
   * ============================================================
   */

  const hasRole =
    Boolean(selectedRole);

  const isAuthenticating =
    googleLoading ||
    appleLoading;

  const isPendingAppleSignup =
    Boolean(
      params.appleSignup
    );

  const isPendingGoogleSignup =
    Boolean(
      params.googleUser &&
      params.idToken
    );

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <View
      style={
        styles.container
      }
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
            progressBackgroundColor={
              theme.surface.elevated
            }
            enabled={!isAuthenticating}
          />
        }
      >
        <Animatable.View
          animation="fadeIn"
          duration={500}
          style={
            styles.content
          }
        >
          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.brandIcon
              }
            >
              <MaterialCommunityIcons
                name="home-heart"
                size={30}
                color={
                  theme.text.inverse
                }
              />
            </View>

            <Text
              style={
                styles.eyebrow
              }
            >
              FRESHSWEEPER
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Let's get started
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Choose how you'll use
              Freshsweeper and create
              your account.
            </Text>
          </View>

          {/* ================================================== */}
          {/* PENDING SOCIAL SIGNUP */}
          {/* ================================================== */}

          {(isPendingAppleSignup ||
            isPendingGoogleSignup) && (
            <View
              style={
                styles.socialContext
              }
            >
              <MaterialCommunityIcons
                name={
                  isPendingAppleSignup
                    ? 'apple'
                    : 'google'
                }
                size={19}
                color={
                  isPendingAppleSignup
                    ? theme.icon.default
                    : theme.status.error
                }
              />

              <View
                style={
                  styles.socialContextText
                }
              >
                <Text
                  style={
                    styles.socialContextTitle
                  }
                >
                  {isPendingAppleSignup
                    ? 'Apple account verified'
                    : 'Google account verified'}
                </Text>

                <Text
                  style={
                    styles.socialContextSubtitle
                  }
                >
                  Select your role to continue
                </Text>
              </View>
            </View>
          )}

          {/* ================================================== */}
          {/* LOCATION */}
          {/* ================================================== */}

          {/* {renderLocationStatus()} */}

          {/* ================================================== */}
          {/* ROLE SELECTION */}
          {/* ================================================== */}

          <View
            style={
              styles.roleSection
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Choose your role
              </Text>

              <Text
                style={
                  styles.requiredText
                }
              >
                Required
              </Text>
            </View>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Select the option that best
              describes how you'll use
              Freshsweeper.
            </Text>

            <RoleSelection
              onRoleSelect={
                handleRoleSelect
              }
              selectedRole={
                selectedRole
              }
            />
          </View>

          {/* ================================================== */}
          {/* AUTH OPTIONS */}
          {/* ================================================== */}

          {hasRole && (
            <Animatable.View
              animation="fadeInUp"
              duration={450}
              style={
                styles.authSection
              }
            >
              <View
                style={
                  styles.selectedRoleBanner
                }
              >
                <View
                  style={
                    styles.selectedRoleIcon
                  }
                >
                  <MaterialCommunityIcons
                    name={
                      selectedRole ===
                      'host'
                        ? 'home-account'
                        : 'broom'
                    }
                    size={19}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.selectedRoleContent
                  }
                >
                  <Text
                    style={
                      styles.selectedRoleLabel
                    }
                  >
                    Selected role
                  </Text>

                  <Text
                    style={
                      styles.selectedRoleValue
                    }
                  >
                    {selectedRole ===
                    'host'
                      ? 'Host'
                      : 'Cleaner'}
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="check-circle"
                  size={21}
                  color={
                    theme.status.success
                  }
                />
              </View>

              {/* ================================================= */}
              {/* EMAIL */}
              {/* ================================================= */}

              <TouchableOpacity
                activeOpacity={0.82}
                style={[
                  styles.button,
                  styles.emailButton,
                ]}
                onPress={
                  handleEmailSignup
                }
                disabled={
                  fetchingLocation ||
                  isAuthenticating
                }
              >
                <View
                  style={
                    styles.buttonContent
                  }
                >
                  <View
                    style={
                      styles.primaryIconCircle
                    }
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={21}
                      color={
                        theme.brand.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.buttonTextContainer
                    }
                  >
                    <Text
                      style={
                        styles.emailButtonText
                      }
                    >
                      Continue with Email
                    </Text>

                    <Text
                      style={
                        styles.emailButtonSubtext
                      }
                    >
                      Use your email and password
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={
                      theme.button.primaryText
                    }
                  />
                </View>
              </TouchableOpacity>

              {/* ================================================= */}
              {/* DIVIDER */}
              {/* ================================================= */}

              <View
                style={
                  styles.divider
                }
              >
                <View
                  style={
                    styles.dividerLine
                  }
                />

                <View
                  style={
                    styles.dividerBadge
                  }
                >
                  <Text
                    style={
                      styles.dividerText
                    }
                  >
                    OR
                  </Text>
                </View>

                <View
                  style={
                    styles.dividerLine
                  }
                />
              </View>

              {/* ================================================= */}
              {/* GOOGLE */}
              {/* ================================================= */}

              <TouchableOpacity
                activeOpacity={0.82}
                style={[
                  styles.button,
                  styles.socialButton,
                ]}
                onPress={
                  handleGoogleSignIn
                }
                disabled={
                  !request ||
                  googleLoading ||
                  appleLoading ||
                  fetchingLocation
                }
              >
                <View
                  style={
                    styles.buttonContent
                  }
                >
                  <View
                    style={[
                      styles.socialIconCircle,
                      {
                        backgroundColor:
                          theme.background.sunken,
                      },
                    ]}
                  >
                    {googleLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={
                          theme.status.error
                        }
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="google"
                        size={21}
                        color={
                          theme.status.error
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.buttonTextContainer
                    }
                  >
                    <Text
                      style={
                        styles.socialButtonTitle
                      }
                    >
                      {googleLoading
                        ? 'Creating account...'
                        : 'Continue with Google'}
                    </Text>

                    <Text
                      style={
                        styles.socialButtonSubtext
                      }
                    >
                      Fast and secure
                    </Text>
                  </View>

                  {!googleLoading && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color={
                        theme.icon.muted
                      }
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* ================================================= */}
              {/* APPLE */}
              {/* ================================================= */}

              {Platform.OS ===
                'ios' &&
                appleAuthAvailable && (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={[
                      styles.button,
                      styles.appleButton,
                    ]}
                    onPress={
                      handleAppleSignIn
                    }
                    disabled={
                      appleLoading ||
                      googleLoading ||
                      fetchingLocation
                    }
                  >
                    <View
                      style={
                        styles.buttonContent
                      }
                    >
                      <View
                        style={
                          styles.appleIconCircle
                        }
                      >
                        {appleLoading ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="apple"
                            size={21}
                            color="#FFFFFF"
                          />
                        )}
                      </View>

                      <View
                        style={
                          styles.buttonTextContainer
                        }
                      >
                        <Text
                          style={
                            styles.appleButtonTitle
                          }
                        >
                          {appleLoading
                            ? 'Creating account...'
                            : 'Continue with Apple'}
                        </Text>

                        <Text
                          style={
                            styles.appleButtonSubtext
                          }
                        >
                          Private and secure
                        </Text>
                      </View>

                      {!appleLoading && (
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={22}
                          color={
                            theme.icon.inverse
                          }
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )}

              
            </Animatable.View>
          )}

          {/* ================================================= */}
              {/* LOGIN */}
              {/* ================================================= */}

              <TouchableOpacity
                activeOpacity={0.7}
                style={
                  styles.loginLink
                }
                onPress={() =>
                  navigation.navigate(
                    ROUTES.login_options
                  )
                }
                disabled={
                  isAuthenticating
                }
              >
                <Text
                  style={
                    styles.loginText
                  }
                >
                  Already have an account?
                </Text>

                <Text
                  style={
                    styles.loginLinkText
                  }
                >
                  Log In
                </Text>
              </TouchableOpacity>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <View
            style={
              styles.footer
            }
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={17}
              color={
                theme.status.success
              }
            />

            <Text
              style={
                styles.footerText
              }
            >
              Your account information
              is securely protected.
            </Text>
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

/*
 * ================================================================
 * STYLES
 * ================================================================
 */

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 30,
    },

    content: {
      flex: 1,
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
      justifyContent: 'center',
    },

    /*
     * ------------------------------------------------------------
     * HEADER
     * ------------------------------------------------------------
     */

    header: {
      alignItems: 'center',
      marginBottom: 25,
    },

    brandIcon: {
      width: 62,
      height: 62,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primary,

      shadowColor:
        theme.shadow.color,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity:
        theme.shadow.opacity,

      shadowRadius: 8,

      elevation: 3,
    },

    eyebrow: {
      marginTop: 13,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      letterSpacing: 2,
      color:
        theme.brand.primary,
    },

    title: {
      marginTop: 4,
      fontSize: 29,
      lineHeight: 35,
      fontWeight: '800',
      letterSpacing: -0.6,
      color:
        theme.text.primary,
      textAlign: 'center',
    },

    subtitle: {
      maxWidth: 370,
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color:
        theme.text.secondary,
      textAlign: 'center',
    },

    /*
     * ------------------------------------------------------------
     * SOCIAL CONTEXT
     * ------------------------------------------------------------
     */

    socialContext: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 13,
      marginBottom: 17,
      borderRadius: 15,
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    socialContextText: {
      flex: 1,
      marginLeft: 10,
    },

    socialContextTitle: {
      fontSize: 13,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    socialContextSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color:
        theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * LOCATION
     * ------------------------------------------------------------
     */

    locationStatus: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
      marginBottom: 18,
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    locationSuccess: {
      backgroundColor:
        theme.brand.primaryLight,
      borderColor:
        theme.brand.primaryLight,
    },

    locationText: {
      flexShrink: 1,
      marginLeft: 7,
      fontSize: 11,
      fontWeight: '600',
      color:
        theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * ROLE
     * ------------------------------------------------------------
     */

    roleSection: {
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      borderRadius: 20,
      padding: 17,

      shadowColor:
        theme.shadow.color,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        theme.shadow.opacity,

      shadowRadius: 8,

      elevation: 2,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color:
        theme.text.primary,
    },

    requiredText: {
      fontSize: 10,
      fontWeight: '700',
      color:
        theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    sectionDescription: {
      marginTop: 5,
      marginBottom: 12,
      fontSize: 12,
      lineHeight: 18,
      color:
        theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * AUTH SECTION
     * ------------------------------------------------------------
     */

    authSection: {
      marginTop: 18,
    },

    selectedRoleBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 13,
      borderRadius: 15,
      backgroundColor:
        theme.brand.primaryLight,
      borderWidth: 1,
      borderColor:
        theme.brand.primaryLight,
    },

    selectedRoleIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.default,
    },

    selectedRoleContent: {
      flex: 1,
      marginLeft: 10,
    },

    selectedRoleLabel: {
      fontSize: 10,
      fontWeight: '600',
      color:
        theme.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    selectedRoleValue: {
      marginTop: 1,
      fontSize: 14,
      fontWeight: '800',
      color:
        theme.text.primary,
    },

    /*
     * ------------------------------------------------------------
     * BUTTONS
     * ------------------------------------------------------------
     */

    button: {
      minHeight: 70,
      width: '100%',
      borderRadius: 17,
      marginBottom: 11,
      paddingHorizontal: 13,
      borderWidth: 1,

      shadowColor:
        theme.shadow.color,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        theme.shadow.opacity,

      shadowRadius: 6,

      elevation: 2,
    },

    buttonContent: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },

    emailButton: {
      backgroundColor:
        theme.button.primaryBackground,
      borderColor:
        theme.button.primaryBackground,
    },

    socialButton: {
      backgroundColor:
        theme.card.background,
      borderColor:
        theme.card.border,
    },

    appleButton: {
      backgroundColor:
        '#000000',
      borderColor:
        '#3A3A3C',
        borderWidth: 1
    },

    primaryIconCircle: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryText,
    },

    socialIconCircle: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    appleIconCircle: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#1F1F1F',
    },

    buttonTextContainer: {
      flex: 1,
      marginLeft: 11,
      minWidth: 0,
    },

    emailButtonText: {
      fontSize: 14,
      fontWeight: '800',
      color:
        theme.button.primaryText,
    },

    emailButtonSubtext: {
      marginTop: 2,
      fontSize: 10,
      color:
        theme.button.primaryText,
      opacity: 0.78,
    },

    socialButtonTitle: {
      fontSize: 14,
      fontWeight: '750',
      color:
        theme.text.primary,
    },

    socialButtonSubtext: {
      marginTop: 2,
      fontSize: 10,
      color:
        theme.text.secondary,
    },

    appleButtonTitle: {
      fontSize: 14,
      fontWeight: '750',
      color:
        '#FFFFFF',
    },

    appleButtonSubtext: {
      marginTop: 2,
      fontSize: 10,
      color:
        '#CBD5E1',
    },

    /*
     * ------------------------------------------------------------
     * DIVIDER
     * ------------------------------------------------------------
     */

    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 7,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        theme.divider,
    },

    dividerBadge: {
      minWidth: 38,
      height: 27,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
      backgroundColor:
        theme.background.sunken,
    },

    dividerText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color:
        theme.text.muted,
    },

    /*
     * ------------------------------------------------------------
     * LOGIN
     * ------------------------------------------------------------
     */

    loginLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 9,
      paddingVertical: 11,
    },

    loginText: {
      fontSize: 13,
      color:
        theme.text.secondary,
    },

    loginLinkText: {
      marginLeft: 4,
      fontSize: 13,
      fontWeight: '800',
      color:
        theme.brand.primary,
    },

    /*
     * ------------------------------------------------------------
     * FOOTER
     * ------------------------------------------------------------
     */

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 23,
      paddingHorizontal: 12,
    },

    footerText: {
      marginLeft: 6,
      fontSize: 11,
      color:
        theme.text.muted,
    },
  });

export default GetStarted;