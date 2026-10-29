import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Animatable from 'react-native-animatable';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';

import { WebView } from 'react-native-webview';

import ROUTES from '../../constants/routes';
import fetchIPGeolocation from '../../services/geolocation';
import { AuthContext } from '../../context/AuthContext';
import { navigationRef } from '../../utils/navigationRef';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../theme';

const GOOGLE_CLIENT_ID =
  '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

const LoginOptions = () => {
  const navigation = useNavigation();

  const {
    theme,
    isDark,
  } = useTheme();

  const {
    registerForPushNotificationsAsync,
  } = useNotification();

  const {
    login,
  } = useContext(AuthContext);

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  const [appleLoading, setAppleLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [
    appleAuthAvailable,
    setAppleAuthAvailable,
  ] = useState(false);

  const [
    geolocationData,
    setGeolocationData,
  ] = useState({});

  const [
    showPrivacyPolicy,
    setShowPrivacyPolicy,
  ] = useState(false);

  const [
    webviewLoading,
    setWebviewLoading,
  ] = useState(true);

  const [
    webviewError,
    setWebviewError,
  ] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  /*
   * ============================================================
   * GEOLOCATION
   * ============================================================
   */

  const fetchGeolocation = useCallback(
    async () => {
      try {
        const data =
          await fetchIPGeolocation();

        setGeolocationData(
          data || {}
        );
      } catch (error) {
        console.error(
          '❌ Error fetching geolocation:',
          error
        );

        // Geolocation is optional.
        // It must never prevent authentication.
        setGeolocationData({});
      }
    },
    []
  );

  /*
   * ============================================================
   * APPLE AVAILABILITY
   * ============================================================
   */

  const checkAppleAuthAvailability =
    useCallback(
      async () => {
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
            '❌ Error checking Apple Auth:',
            error
          );

          setAppleAuthAvailable(false);
        }
      },
      []
    );

  useEffect(() => {
    fetchGeolocation();
    checkAppleAuthAvailability();
  }, [
    fetchGeolocation,
    checkAppleAuthAvailability,
  ]);

  /*
 * ============================================================
 * PULL-TO-REFRESH
 * ============================================================
 */

const onRefresh = useCallback(async () => {
  // Avoid refreshing while authentication is running.
  if (appleLoading || googleLoading || refreshing) {
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
      '❌ LoginOptions refresh error:',
      error
    );
  } finally {
    setRefreshing(false);
  }
}, [
  appleLoading,
  googleLoading,
  refreshing,
  fetchGeolocation,
  checkAppleAuthAvailability,
]);

  /*
   * ============================================================
   * GOOGLE AUTH REQUEST
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
   * GOOGLE RESPONSE
   * ============================================================
   */

  const handleGoogleAuthResponse =
    useCallback(
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
            Alert.alert(
              'Google Sign-In',
              'Google authentication did not return the required credentials.'
            );

            return;
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
              'Could not retrieve your Google account information.'
            );
          }

          const googleUser =
            await userInfoResponse.json();

          const result =
            await handleGoogleLoginAttempt(
              googleUser,
              idToken
            );

          /*
           * Existing user.
           */
          if (
            result ===
            'logged_in'
          ) {
            return;
          }

          /*
           * New Google user.
           *
           * GetStarted will collect the role.
           */
          if (
            result ===
            'needs_role'
          ) {
            navigation.navigate(
              ROUTES.getting_started,
              {
                googleUser,
                idToken,
                accessToken,
                geolocation:
                  geolocationData ||
                  null,
              }
            );

            return;
          }
        } catch (error) {
          console.error(
            '❌ Google authentication error:',
            error
          );

          Alert.alert(
            'Google Sign-In',
            error?.message ||
              'Could not complete Google authentication.'
          );
        } finally {
          setGoogleLoading(false);
        }
      },
      [
        geolocationData,
        navigation,
      ]
    );

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
  // }, [
  //   response,
  //   handleGoogleAuthResponse,
  // ]);


  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuthResponse(response);
      return;
    }
  
    if (response?.type === 'error') {
      console.error(
        '❌ Google auth error:',
        response.error
      );
  
      Alert.alert(
        'Google Sign-In',
        'Google authentication failed. Please try again.'
      );
  
      setGoogleLoading(false);
      return;
    }
  
    /*
     * Defensive cleanup for cancellation or dismissal
     * if these response types are provided by the hook.
     */
    if (
      response?.type === 'dismiss' ||
      response?.type === 'cancel'
    ) {
      setGoogleLoading(false);
    }
  }, [
    response,
    handleGoogleAuthResponse,
  ]);


  /*
 * ============================================================
 * GOOGLE SIGN-IN HANDLER
 * ============================================================
 */

const handleGoogleSignIn = useCallback(async () => {
  if (!request) {
    Alert.alert(
      'Google Sign-In',
      'Google authentication is not ready yet. Please try again.'
    );
    return;
  }

  // Prevent multiple authentication attempts.
  if (appleLoading || googleLoading) {
    return;
  }

  setGoogleLoading(true);

  try {
    const result = await promptAsync();

    /*
     * Google authentication was cancelled or dismissed.
     * Reset the loader so the user can try again.
     */
    if (
      result?.type === 'dismiss' ||
      result?.type === 'cancel'
    ) {
      setGoogleLoading(false);
      return;
    }

    /*
     * Handle unexpected outcomes that do not trigger
     * the response effect.
     */
    if (
      result?.type !== 'success' &&
      result?.type !== 'error'
    ) {
      setGoogleLoading(false);
    }
  } catch (error) {
    console.error(
      '❌ Google Sign-In prompt error:',
      error
    );

    setGoogleLoading(false);

    Alert.alert(
      'Google Sign-In',
      'Unable to open Google Sign-In. Please try again.'
    );
  }
}, [
  request,
  promptAsync,
  appleLoading,
  googleLoading,
]);

  /*
   * ============================================================
   * GOOGLE BACKEND LOGIN
   * ============================================================
   */

  const handleGoogleLoginAttempt =
    async (
      googleUser,
      idToken
    ) => {
      try {
        const endpoint =
          'https://www.freshsweeper.com/api/auth/google_auth';

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
                }),
            }
          );

        const data =
          await response.json();

        /*
         * Existing account.
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

          return 'logged_in';
        }

        /*
         * New account.
         *
         * Backend says role is required.
         */
        if (
          response.status ===
            400 &&
          (
            data?.detail
              ?.includes?.(
                'userType is required'
              ) ||
            data?.detail?.type ===
              'ROLE_REQUIRED' ||
            data?.needs_role ===
              true ||
            data?.data?.needs_role ===
              true
          )
        ) {
          return 'needs_role';
        }

        const errorMessage =
          typeof data?.detail ===
          'string'
            ? data.detail
            : data?.detail
                ?.message ||
              data?.message ||
              'Google Sign-In failed.';

        console.error(
          '❌ Google backend error:',
          {
            status:
              response.status,

            type:
              data?.detail?.type ||
              null,

            message:
              errorMessage,
          }
        );

        Alert.alert(
          'Google Sign-In',
          errorMessage
        );

        return 'error';
      } catch (error) {
        console.error(
          '❌ Google login attempt error:',
          error
        );

        Alert.alert(
          'Google Sign-In',
          'Unable to process Google Sign-In. Please try again.'
        );

        return 'error';
      }
    };

  /*
   * ============================================================
   * APPLE NONCE
   * ============================================================
   */

  const generateAppleNonce =
    async () => {
      return Crypto.randomUUID();
    };

  /*
   * ============================================================
   * APPLE LOGIN
   * ============================================================
   */

  const handleAppleLogin =
    async () => {
      try {
        setAppleLoading(true);

        const nonce =
          await generateAppleNonce();

        console.log(
          '🍎 Starting Apple authentication'
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
            appleUserId:
              credential.user,

            hasIdentityToken:
              !!credential.identityToken,

            hasAuthorizationCode:
              !!credential.authorizationCode,

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

        const result =
          await handleAppleLoginAttempt(
            credential,
            nonce
          );

        /*
         * New Apple user.
         *
         * We pass the Apple credential to
         * GetStarted so the user can choose
         * Host or Cleaner.
         */
        if (
          result ===
          'needs_role'
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
                  credential
                    .fullName
                    ?.givenName ||
                  '',

                lastname:
                  credential
                    .fullName
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

          return;
        }

        /*
         * Existing Apple user.
         */
        if (
          result ===
          'logged_in'
        ) {
          return;
        }
      } catch (error) {
        /*
         * Apple cancellation is not an error.
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
   * APPLE BACKEND LOGIN
   * ============================================================
   */

  const handleAppleLoginAttempt =
    async (
      credential,
      nonce
    ) => {
      try {
        const endpoint =
          'https://www.freshsweeper.com/api/auth/apple_auth';

        const payload = {
          identityToken:
            credential.identityToken,

          authorizationCode:
            credential.authorizationCode,

          nonce,

          /*
           * IMPORTANT:
           *
           * LoginOptions does NOT choose
           * Host/Cleaner.
           *
           * Existing users can log in.
           *
           * New users receive needs_role.
           */
          userType: null,

          user: {
            id:
              credential.user,

            email:
              credential.email ||
              null,

            firstname:
              credential
                .fullName
                ?.givenName ||
              '',

            lastname:
              credential
                .fullName
                ?.familyName ||
              '',
          },
        };

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

        const responseText =
          await response.text();

        let data;

        try {
          data =
            JSON.parse(
              responseText
            );
        } catch (
          parseError
        ) {
          console.error(
            '❌ Apple backend returned non-JSON response:',
            {
              status:
                response.status,

              contentType:
                response.headers.get(
                  'content-type'
                ),
            }
          );

          Alert.alert(
            'Apple Sign-In',
            `The server returned an unexpected response (${response.status}).`
          );

          return 'error';
        }

        console.log(
          '🍎 Apple backend response summary:',
          {
            status:
              response.status,

            result:
              data?.status ||
              null,

            needsRole:
              data?.needs_role ===
                true ||
              data?.data
                ?.needs_role ===
                true,

            userId:
              data?.data?._id ||
              null,

            userType:
              data?.data
                ?.userType ||
              null,
          }
        );

        /*
         * Existing Apple user.
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

          return 'logged_in';
        }

        /*
         * New Apple user.
         */
        if (
          data?.status ===
            'needs_role' ||
          data?.needs_role ===
            true ||
          data?.data
            ?.needs_role ===
            true
        ) {
          return 'needs_role';
        }

        /*
         * Compatibility with structured
         * ROLE_REQUIRED responses.
         */
        if (
          response.status ===
            400 &&
          (
            data?.detail
              ?.type ===
              'ROLE_REQUIRED' ||
            data?.detail
              ?.code ===
              'ROLE_REQUIRED'
          )
        ) {
          return 'needs_role';
        }

        const errorMessage =
          typeof data?.detail ===
          'string'
            ? data.detail
            : data?.detail
                ?.message ||
              data?.message ||
              data?.error ||
              'Apple Sign-In failed.';

        console.error(
          '❌ Apple backend authentication failed:',
          {
            status:
              response.status,

            message:
              errorMessage,
          }
        );

        Alert.alert(
          'Apple Sign-In',
          errorMessage
        );

        return 'error';
      } catch (error) {
        console.error(
          '❌ Apple login attempt error:',
          error
        );

        Alert.alert(
          'Apple Sign-In',
          'Unable to process Apple Sign-In. Please try again.'
        );

        return 'error';
      }
    };

  /*
   * ============================================================
   * COMPLETE LOGIN
   * ============================================================
   */

  const completeLogin =
    async (userData) => {
      try {
        if (!userData?._id) {
          throw new Error(
            'Authentication response is missing the user ID.'
          );
        }

        if (!userData?.token) {
          throw new Error(
            'Authentication response is missing the access token.'
          );
        }

        if (
          !userData?.userType
        ) {
          throw new Error(
            'Authentication response is missing the account type.'
          );
        }

        console.log(
          '🔐 COMPLETE LOGIN'
        );

        console.log(
          '👤 User ID:',
          userData._id
        );

        console.log(
          '👤 User Type:',
          userData.userType
        );

        /*
         * --------------------------------------------------------
         * PERSIST SESSION
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

        /*
         * Existing account has completed
         * authentication/onboarding.
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
         * AUTH CONTEXT
         * --------------------------------------------------------
         *
         * This is the Freshsweeper session.
         * No Firebase is involved.
         */

        await login({
          resp: userData,
        });

        /*
         * --------------------------------------------------------
         * PHONE REQUIREMENT
         * --------------------------------------------------------
         */

        const hasPhone =
          typeof userData.phone ===
            'string' &&
          userData.phone
            .trim()
            .length > 0;

        if (!hasPhone) {
          console.log(
            '📱 Phone number missing — sending user to PhoneCapture'
          );

          navigation.navigate(
            ROUTES.phone_capture,
            {
              userId:
                userData._id,

              userType:
                userData.userType,

              email:
                userData.email ||
                '',

              firstName:
                userData.firstname ||
                '',

              lastName:
                userData.lastname ||
                '',

              token:
                userData.token,

              refreshToken:
                userData.refresh_token ||
                null,

              userData,

              geolocation:
                geolocationData ||
                null,
            }
          );

          return;
        }

        /*
         * --------------------------------------------------------
         * PUSH NOTIFICATIONS
         * --------------------------------------------------------
         *
         * Push registration failure must never
         * block authentication.
         */

        try {
          const expoPushToken =
            await registerForPushNotificationsAsync(
              userData._id
            );

          console.log(
            '🔔 Push registration:',
            expoPushToken
              ? 'successful'
              : 'no token returned'
          );
        } catch (
          pushError
        ) {
          console.error(
            '⚠️ Push registration failed:',
            pushError
          );
        }

        /*
         * --------------------------------------------------------
         * FINAL DESTINATION
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

        /*
         * Compatibility fallback.
         */
        if (
          navigationRef.current
        ) {
          navigationRef.current.reset({
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
   * EMAIL LOGIN
   * ============================================================
   */

  const handleEmailLogin =
    () => {
      navigation.navigate(
        ROUTES.signin,
        {
          loginMethod:
            'email',
        }
      );
    };

  /*
   * ============================================================
   * PRIVACY POLICY
   * ============================================================
   */

  const PRIVACY_POLICY_URL =
    'https://www.freshsweeper.com/privacyp';

  const openPrivacyPolicy =
    () => {
      setWebviewError(false);
      setWebviewLoading(true);
      setShowPrivacyPolicy(true);
    };

  const closePrivacyPolicy =
    () => {
      setShowPrivacyPolicy(false);
      setWebviewError(false);
    };

  /*
   * ============================================================
   * UI HELPERS
   * ============================================================
   */

  const authenticationInProgress =
    appleLoading ||
    googleLoading;

  const canGoBack =
    navigation.canGoBack();

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background.default
        }
      />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.brand.primary}
              colors={[theme.brand.primary]}
              progressBackgroundColor={theme.surface.elevated}
              enabled={!authenticationInProgress}
            />
          }
        >
        {/* ================================================== */}
        {/* BACK */}
        {/* ================================================== */}

        {/* {canGoBack && (
          <TouchableOpacity
            activeOpacity={0.75}
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={
                theme.icon.default
              }
            />
          </TouchableOpacity>
        )} */}

        <Animatable.View
          animation="fadeInUp"
          duration={500}
          style={
            styles.content
          }
        >
          {/* ================================================== */}
          {/* BRAND / HEADER */}
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
              Welcome back
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Sign in to manage your
              cleanings, bookings,
              payments, and more.
            </Text>
          </View>

          {/* ================================================== */}
          {/* AUTH OPTIONS */}
          {/* ================================================== */}

          <View
            style={
              styles.optionsContainer
            }
          >
            {/* ============================================== */}
            {/* APPLE */}
            {/* ============================================== */}

            {Platform.OS ===
              'ios' &&
              appleAuthAvailable && (
                <TouchableOpacity
                  activeOpacity={0.82}
                  style={
                    styles.optionCard
                  }
                  onPress={
                    handleAppleLogin
                  }
                  disabled={
                    authenticationInProgress
                  }
                >
                  <View
                    style={
                      styles.optionContent
                    }
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        styles.appleIconContainer,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="apple"
                        size={28}
                        color={
                          theme.icon.default
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.textContainer
                      }
                    >
                      <Text
                        style={
                          styles.optionTitle
                        }
                      >
                        Continue with Apple
                      </Text>

                      <Text
                        style={
                          styles.optionDescription
                        }
                      >
                        Secure and private sign in
                      </Text>
                    </View>

                    {appleLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={
                          theme.icon.default
                        }
                      />
                    ) : (
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
              )}

            {/* ============================================== */}
            {/* GOOGLE */}
            {/* ============================================== */}

            <TouchableOpacity
              activeOpacity={0.82}
              style={
                styles.optionCard
              }
              onPress={handleGoogleSignIn}
              disabled={
                !request ||
                authenticationInProgress
              }
            >
              <View
                style={
                  styles.optionContent
                }
              >
                <View
                  style={[
                    styles.iconContainer,
                    styles.googleIconContainer,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="google"
                    size={28}
                    color={
                      theme.status.error
                    }
                  />
                </View>

                <View
                  style={
                    styles.textContainer
                  }
                >
                  <Text
                    style={
                      styles.optionTitle
                    }
                  >
                    Continue with Google
                  </Text>

                  <Text
                    style={
                      styles.optionDescription
                    }
                  >
                    Quick sign in with your Google account
                  </Text>
                </View>

                {googleLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      theme.status.error
                    }
                  />
                ) : (
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

            {/* ============================================== */}
            {/* EMAIL */}
            {/* ============================================== */}

            <TouchableOpacity
              activeOpacity={0.82}
              style={
                styles.optionCard
              }
              onPress={
                handleEmailLogin
              }
              disabled={
                authenticationInProgress
              }
            >
              <View
                style={
                  styles.optionContent
                }
              >
                <View
                  style={[
                    styles.iconContainer,
                    styles.emailIconContainer,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={28}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.textContainer
                  }
                >
                  <Text
                    style={
                      styles.optionTitle
                    }
                  >
                    Continue with Email
                  </Text>

                  <Text
                    style={
                      styles.optionDescription
                    }
                  >
                    Sign in with your email and password
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={
                    theme.icon.muted
                  }
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* ================================================== */}
          {/* DIVIDER */}
          {/* ================================================== */}

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

          {/* ================================================== */}
          {/* SIGN UP */}
          {/* ================================================== */}

          <View
            style={
              styles.signupContainer
            }
          >
            <Text
              style={
                styles.signupText
              }
            >
              Don't have an account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate(
                  ROUTES.getting_started
                )
              }
            >
              <Text
                style={
                  styles.signupLink
                }
              >
                Create one
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================================================== */}
          {/* SECURITY NOTE */}
          {/* ================================================== */}

          <View
            style={
              styles.securityNote
            }
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={18}
              color={
                theme.status.success
              }
            />

            <Text
              style={
                styles.securityText
              }
            >
              Your account information
              is securely protected.
            </Text>
          </View>

          {/* ================================================== */}
          {/* PRIVACY */}
          {/* ================================================== */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={
              styles.privacyLinkContainer
            }
            onPress={
              openPrivacyPolicy
            }
          >
            <Text
              style={
                styles.privacyLinkText
              }
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>

      {/* ====================================================== */}
      {/* PRIVACY POLICY MODAL */}
      {/* ====================================================== */}

      <Modal
        visible={
          showPrivacyPolicy
        }
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={
          closePrivacyPolicy
        }
      >
        <SafeAreaView
          style={
            styles.modalContainer
          }
        >
          <StatusBar
            barStyle={
              isDark
                ? 'light-content'
                : 'dark-content'
            }
            backgroundColor={
              theme.surface.elevated
            }
          />

          {/* ================================================ */}
          {/* MODAL HEADER */}
          {/* ================================================ */}

          <View
            style={
              styles.modalHeader
            }
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                closePrivacyPolicy
              }
              style={
                styles.closeButton
              }
            >
              <MaterialCommunityIcons
                name="close"
                size={23}
                color={
                  theme.icon.default
                }
              />
            </TouchableOpacity>

            <View
              style={
                styles.modalTitleContainer
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Privacy Policy
              </Text>
            </View>

            <View
              style={
                styles.modalHeaderSpacer
              }
            />
          </View>

          {/* ================================================ */}
          {/* WEBVIEW ERROR */}
          {/* ================================================ */}

          {webviewError ? (
            <View
              style={
                styles.errorContainer
              }
            >
              <View
                style={
                  styles.errorIconContainer
                }
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={42}
                  color={
                    theme.status.error
                  }
                />
              </View>

              <Text
                style={
                  styles.errorTitle
                }
              >
                Unable to load policy
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                We couldn't load the Privacy
                Policy right now.
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.retryButton
                }
                onPress={() => {
                  setWebviewError(
                    false
                  );

                  setWebviewLoading(
                    true
                  );
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={18}
                  color={
                    theme.button.primaryText
                  }
                />

                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={
                styles.webviewContainer
              }
            >
              {webviewLoading && (
                <View
                  style={
                    styles.webviewLoader
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color={
                      theme.brand.primary
                    }
                  />

                  <Text
                    style={
                      styles.webviewLoadingText
                    }
                  >
                    Loading Privacy Policy...
                  </Text>
                </View>
              )}

              <WebView
                source={{
                  uri:
                    PRIVACY_POLICY_URL,
                }}
                style={
                  styles.webview
                }
                onLoadStart={() =>
                  setWebviewLoading(
                    true
                  )
                }
                onLoadEnd={() =>
                  setWebviewLoading(
                    false
                  )
                }
                onError={() => {
                  setWebviewLoading(
                    false
                  );

                  setWebviewError(
                    true
                  );
                }}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState={
                  false
                }
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
      paddingTop: 12,
      paddingBottom: 28,
    },

    content: {
      flex: 1,
      justifyContent: 'center',
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
      paddingVertical: 18,
    },

    /*
     * ------------------------------------------------------------
     * BACK
     * ------------------------------------------------------------
     */

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      marginBottom: 12,
    },

    /*
     * ------------------------------------------------------------
     * HEADER
     * ------------------------------------------------------------
     */

    header: {
      alignItems: 'center',
      marginBottom: 30,
    },

    brandIcon: {
      width: 62,
      height: 62,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primary,
      marginBottom: 13,
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
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      letterSpacing: 2,
      color:
        theme.brand.primary,
      marginBottom: 5,
    },

    title: {
      fontSize: 29,
      lineHeight: 35,
      fontWeight: '800',
      letterSpacing: -0.6,
      color:
        theme.text.primary,
      textAlign: 'center',
    },

    subtitle: {
      maxWidth: 360,
      marginTop: 9,
      fontSize: 14,
      lineHeight: 21,
      color:
        theme.text.secondary,
      textAlign: 'center',
    },

    /*
     * ------------------------------------------------------------
     * AUTH OPTIONS
     * ------------------------------------------------------------
     */

    optionsContainer: {
      width: '100%',
    },

    optionCard: {
      width: '100%',
      minHeight: 82,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 12,

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

    optionContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },

    iconContainer: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },

    appleIconContainer: {
      backgroundColor:
        theme.background.sunken,
    },

    googleIconContainer: {
      backgroundColor:
        theme.background.sunken,
    },

    emailIconContainer: {
      backgroundColor:
        theme.brand.primaryLight,
    },

    textContainer: {
      flex: 1,
      minWidth: 0,
      paddingRight: 10,
    },

    optionTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color:
        theme.text.primary,
      marginBottom: 3,
    },

    optionDescription: {
      fontSize: 12,
      lineHeight: 17,
      color:
        theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * DIVIDER
     * ------------------------------------------------------------
     */

    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        theme.divider,
    },

    dividerBadge: {
      minWidth: 38,
      height: 28,
      paddingHorizontal: 8,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.sunken,
      marginHorizontal: 10,
    },

    dividerText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color:
        theme.text.muted,
    },

    /*
     * ------------------------------------------------------------
     * SIGNUP
     * ------------------------------------------------------------
     */

    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },

    signupText: {
      fontSize: 13,
      color:
        theme.text.secondary,
    },

    signupLink: {
      marginLeft: 4,
      fontSize: 13,
      fontWeight: '800',
      color:
        theme.brand.primary,
    },

    /*
     * ------------------------------------------------------------
     * SECURITY
     * ------------------------------------------------------------
     */

    securityNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    securityText: {
      marginLeft: 7,
      fontSize: 11,
      lineHeight: 16,
      color:
        theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * PRIVACY
     * ------------------------------------------------------------
     */

    privacyLinkContainer: {
      alignItems: 'center',
      marginTop: 18,
      paddingVertical: 5,
    },

    privacyLinkText: {
      fontSize: 12,
      fontWeight: '600',
      color:
        theme.text.muted,
      textDecorationLine:
        'underline',
    },

    /*
     * ------------------------------------------------------------
     * PRIVACY MODAL
     * ------------------------------------------------------------
     */

    modalContainer: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    modalHeader: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      backgroundColor:
        theme.surface.elevated,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.sunken,
    },

    modalTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },

    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    modalHeaderSpacer: {
      width: 40,
    },

    webviewContainer: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    webview: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    webviewLoader: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.default,
    },

    webviewLoadingText: {
      marginTop: 12,
      fontSize: 13,
      color:
        theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * PRIVACY ERROR
     * ------------------------------------------------------------
     */

    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      backgroundColor:
        theme.background.default,
    },

    errorIconContainer: {
      width: 82,
      height: 82,
      borderRadius: 41,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        `${theme.status.error}18`,
      marginBottom: 18,
    },

    errorTitle: {
      fontSize: 19,
      fontWeight: '800',
      color:
        theme.text.primary,
      textAlign: 'center',
    },

    errorText: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color:
        theme.text.secondary,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 22,
      minHeight: 44,
      paddingHorizontal: 20,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        theme.button.primaryBackground,
    },

    retryButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color:
        theme.button.primaryText,
    },
  });

export default LoginOptions;
