import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Alert,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

import ROUTES from '../../constants/routes';

import * as Animatable from 'react-native-animatable';

import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

import { useNotification } from '../../hooks/useNotification';

import * as Notifications from 'expo-notifications';

import Button from '../../components/shared/Button';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import axios from 'axios';

import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native-paper';

import useInviteToken from '../../hooks/useInviteToken';

import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';





const Signin = () => {
  const { language } = useContext(LanguageContext);

  const route = useRoute();
  const navigation = useNavigation();

  const { theme, isDark } = useTheme();

  const inviteToken = route.params?.inviteToken;

  const { t } = useTranslation();

  const {
    login,
    loginWithEmailPassword,
  } = useContext(AuthContext);

  const {
    expoPushToken,
    registerForPushNotificationsAsync,
    handleNotificationResponse,
  } = useNotification();

  const [inputs, setInputs] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [secureTextEntry, setSecureTextEntry] = useState(true);


  // ---------------------------------------------------------------------------
  // NOTIFICATION SETUP
  // ---------------------------------------------------------------------------

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const responseListener =
      Notifications.addNotificationReceivedListener(
        handleNotificationResponse
      );

    return () => {
      if (responseListener) {
        Notifications.removeNotificationSubscription(
          responseListener
        );
      }
    };
  }, [handleNotificationResponse]);


  // ---------------------------------------------------------------------------
  // SESSION STORAGE
  // ---------------------------------------------------------------------------

  const persistSession = useCallback(async (userData) => {
    if (!userData) {
      return;
    }

    try {
      if (userData.token) {
        await AsyncStorage.setItem(
          '@auth_token',
          userData.token
        );
      }

      if (userData.refresh_token) {
        await AsyncStorage.setItem(
          '@refresh_token',
          userData.refresh_token
        );
      }

      if (userData._id) {
        await AsyncStorage.setItem(
          '@user_id',
          String(userData._id)
        );
      }

      if (userData.userType) {
        await AsyncStorage.setItem(
          '@user_type',
          userData.userType
        );
      }

      await AsyncStorage.setItem(
        '@user_data',
        JSON.stringify(userData)
      );

      console.log('✅ Sign-in session persisted');
    } catch (error) {
      console.error(
        '❌ Failed to persist sign-in session:',
        error
      );
    }
  }, []);


  // ---------------------------------------------------------------------------
  // COMPLETE LOGIN
  // ---------------------------------------------------------------------------

  const completeLogin = useCallback(
    async (userData) => {
      if (!userData?._id) {
        throw new Error(
          tSafe(
            'invalid_login_response',
            'Invalid login response. Please try again.'
          )
        );
      }

      if (!userData.userType) {
        throw new Error(
          tSafe(
            'missing_user_type',
            'Your account type could not be determined.'
          )
        );
      }

      /*
       * Persist the session first.
       */
      await persistSession(userData);

      /*
       * CRITICAL:
       * Update AuthContext so the rest of the application knows
       * that the user is authenticated.
       */
      await login({
        resp: userData,
      });

      console.log('✅ AuthContext updated');
      console.log('👤 User:', userData._id);
      console.log('👤 Type:', userData.userType);

      /*
       * Register push notifications without blocking login.
       */
      try {
        await registerForPushNotificationsAsync(
          userData._id
        );
      } catch (pushError) {
        console.warn(
          '⚠️ Push registration failed, continuing login:',
          pushError
        );
      }

      /*
       * Invite flow takes priority.
       */
      if (inviteToken) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Public',
              state: {
                routes: [
                  {
                    name: 'InviteGate',
                    params: {
                      inviteToken,
                    },
                  },
                ],
              },
            },
          ],
        });

        return;
      }

      /*
       * Normal dashboard routing.
       */
      let targetScreen = null;

      if (userData.userType === 'host') {
        targetScreen = 'Host';
      } else if (userData.userType === 'cleaner') {
        targetScreen = 'Cleaner';
      }

      if (!targetScreen) {
        throw new Error(
          tSafe(
            'invalid_user_type',
            'Your account type is invalid. Please contact support.'
          )
        );
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: targetScreen,
          },
        ],
      });
    },
    [
      inviteToken,
      login,
      navigation,
      persistSession,
      registerForPushNotificationsAsync,
    ]
  );


  // ---------------------------------------------------------------------------
  // GOOGLE RESPONSE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (googleResponse?.type === 'success') {
        setGoogleLoading(true);

        try {
          const { authentication } = googleResponse;

          if (!authentication?.idToken) {
            throw new Error(
              tSafe(
                'google_token_missing',
                'Google authentication token was not received.'
              )
            );
          }

          console.log(
            '✅ Google authentication successful'
          );

          const response = await fetch(
            'https://www.freshsweeper.com/api/auth/google_auth',
            {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
              },

              body: JSON.stringify({
                token: authentication.idToken,
                userType: null,
              }),
            }
          );

          let data = null;

          try {
            data = await response.json();
          } catch {
            data = null;
          }


          // ---------------------------------------------------------------
          // ACCOUNT DEACTIVATED
          // ---------------------------------------------------------------

          if (
            response.status === 403 &&
            data?.detail
              ?.toLowerCase()
              ?.includes('deactivated')
          ) {
            Alert.alert(
              tSafe(
                'account_deactivated',
                'Account Deactivated'
              ),

              tSafe(
                'account_deactivated_message',
                'Your account has been deactivated. If you think this is a mistake, please contact our support team for assistance.'
              ),

              [
                {
                  text: tSafe('ok', 'OK'),
                  style: 'default',
                },
              ]
            );

            return;
          }


          // ---------------------------------------------------------------
          // ROLE REQUIRED
          // ---------------------------------------------------------------

          if (
            data?.status === 'needs_role' ||
            data?.needs_role === true ||
            data?.data?.needs_role === true ||
            data?.data?.requires_user_type === true
          ) {
            /*
             * This normally should be handled by LoginOptions.
             * Keeping this fallback here makes the sign-in screen
             * robust if the backend determines that this Google
             * account is new.
             */

            navigation.navigate(
              ROUTES.getting_started,
              {
                googleSignup: true,

                googleCredential: {
                  authentication,
                  idToken: authentication.idToken,
                },

                googleUser:
                  data?.data?.user ||
                  data?.data ||
                  null,

                inviteToken,
              }
            );

            return;
          }


          // ---------------------------------------------------------------
          // SUCCESS
          // ---------------------------------------------------------------

          if (
            response.ok &&
            data?.status === 'success' &&
            data?.data
          ) {
            const userData = data.data;

            await completeLogin(userData);

            return;
          }


          // ---------------------------------------------------------------
          // OTHER BACKEND ERROR
          // ---------------------------------------------------------------

          throw new Error(
            data?.message ||
            data?.detail ||
            tSafe(
              'signin_failed',
              'Sign-in failed'
            )
          );

        } catch (error) {
          console.error(
            '❌ Google sign-in error:',
            error
          );

          Alert.alert(
            tSafe('error', 'Error'),
            error?.message ||
              tSafe(
                'google_signin_failed',
                'Google sign-in failed.'
              )
          );
        } finally {
          setGoogleLoading(false);
        }

      } else if (
        googleResponse?.type === 'error'
      ) {
        console.error(
          'Google authentication error:',
          googleResponse.error
        );

        if (
          googleResponse.error?.code !==
          'ERR_REQUEST_CANCELED'
        ) {
          Alert.alert(
            tSafe('error', 'Error'),
            tSafe(
              'google_signin_failed',
              'Google sign-in failed.'
            )
          );
        }

        setGoogleLoading(false);
      }
    };

    handleGoogleResponse();
  }, [
    completeLogin,
    inviteToken,
    navigation,
  ]);


  // ---------------------------------------------------------------------------
  // GOOGLE SIGN-IN
  // ---------------------------------------------------------------------------

  const handleGoogleSignIn = async (
    emailHint = null
  ) => {
    if (!googleRequest) {
      Alert.alert(
        tSafe(
          'please_wait',
          'Please wait'
        ),
        tSafe(
          'google_initializing',
          'Google Sign-In is initializing. Please try again in a moment.'
        )
      );

      return;
    }

    try {
      setGoogleLoading(true);

      const extraParams = emailHint
        ? {
            login_hint: emailHint,
          }
        : {};

      await googlePromptAsync(extraParams);
    } catch (error) {
      console.error(
        '❌ Google prompt error:',
        error
      );

      setGoogleLoading(false);

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'google_signin_failed',
          'Google sign-in failed.'
        )
      );
    }
  };


  // ---------------------------------------------------------------------------
  // EMAIL LOGIN
  // ---------------------------------------------------------------------------

  const validate = async () => {
    Keyboard.dismiss();

    let isValid = true;

    const trimmedEmail =
      inputs.email.trim();

    if (!trimmedEmail) {
      handleError(
        <Animatable.View animation="fadeInUpBig">
          <Text
            style={{
              color: theme.status.error,
            }}
          >
            {tSafe(
              'please_enter_email',
              'Please enter email'
            )}
          </Text>
        </Animatable.View>,
        'email'
      );

      isValid = false;
    }

    if (!inputs.password) {
      handleError(
        <Animatable.View animation="fadeInUpBig">
          <Text
            style={{
              color: theme.status.error,
            }}
          >
            {tSafe(
              'please_enter_password',
              'Please enter password'
            )}
          </Text>
        </Animatable.View>,
        'password'
      );

      isValid = false;
    }

    if (!isValid) {
      return;
    }

    await handleLogin(trimmedEmail);
  };


  const handleLogin = async (
    trimmedEmail
  ) => {
    setLoading(true);

    try {
      const result =
        await loginWithEmailPassword(
          trimmedEmail,
          inputs.password
        );

      if (result?.success) {
        const userData = result.data;

        if (!userData?._id) {
          throw new Error(
            tSafe(
              'invalid_login_response',
              'Invalid login response. Please try again.'
            )
          );
        }

        /*
         * IMPORTANT:
         * Explicitly update the AuthContext.
         *
         * This keeps email login consistent with
         * Google login and the rest of the application.
         */
        await completeLogin(userData);

        console.log(
          '✅ Email login completed successfully'
        );

      } else {
        console.log(
          '❌ Login failed:',
          result?.type
        );

        switch (result?.type) {
          
          case 'NO_PASSWORD':
            showNoPasswordAlertDirect(
              result.email
            );
            break;

          case 'VERIFICATION_REQUIRED':
            Alert.alert(
              tSafe(
                'verification_required',
                'Verification Required'
              ),

              tSafe(
                'verify_email_before_login',
                'Please verify your email before logging in.'
              )
            );
            break;

          case 'ACCOUNT_DEACTIVATED':
            Alert.alert(
              tSafe(
                'account_deactivated',
                'Account Deactivated'
              ),

              tSafe(
                'account_deactivated_message',
                'Your account has been deactivated. If you think this is a mistake, please contact our support team for assistance.'
              ),

              [
                {
                  text: tSafe(
                    'ok',
                    'OK'
                  ),
                  style: 'default',
                },
              ]
            );
            break;

          default:
            Alert.alert(
              tSafe(
                'login_failed',
                'Login Failed'
              ),

              result?.error ||
                tSafe(
                  'something_went_wrong',
                  'Something went wrong.'
                )
            );
        }
      }

    } catch (error) {
      console.error(
        '❌ Login error:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'something_went_wrong',
          'Something went wrong.'
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // // ---------------------------------------------------------------------------
  // // GOOGLE ACCOUNT ALERT
  // // ---------------------------------------------------------------------------

  // const showGoogleAccountAlertDirect = (
  //   email
  // ) => {
  //   Alert.alert(
  //     tSafe(
  //       'account_created_with_google',
  //       'Account Created with Google'
  //     ),

  //     tSafe(
  //       'google_signin_prompt',
  //       'This account was created using Google. Would you like to sign in with Google?'
  //     ),

  //     [
  //       {
  //         text: tSafe(
  //           'sign_in_with_google',
  //           'Sign in with Google'
  //         ),

  //         onPress: () => {
  //           handleGoogleSignIn(email);
  //         },
  //       },

  //       {
  //         text: tSafe(
  //           'set_password_instead',
  //           'Set Password Instead'
  //         ),

  //         onPress: () => {
  //           navigation.navigate(
  //             ROUTES.set_password,
  //             {
  //               email,
  //             }
  //           );
  //         },
  //       },

  //       {
  //         text: tSafe(
  //           'cancel',
  //           'Cancel'
  //         ),

  //         style: 'cancel',
  //       },
  //     ]
  //   );
  // };


  // ---------------------------------------------------------------------------
  // NO PASSWORD ALERT
  // ---------------------------------------------------------------------------

  const showNoPasswordAlertDirect = (
    email
  ) => {
    Alert.alert(
      tSafe(
        'password_required',
        'Password Required'
      ),

      tSafe(
        'set_password_first',
        'You need to set a password for your account first.'
      ),

      [
        {
          text: tSafe(
            'set_password',
            'Set Password'
          ),

          onPress: () => {
            navigation.navigate(
              ROUTES.set_password,
              {
                email,
              }
            );
          },
        },

        {
          text: tSafe(
            'use_google_instead',
            'Use Google Instead'
          ),

          onPress: () => {
            handleGoogleSignIn(email);
          },
        },

        {
          text: tSafe(
            'cancel',
            'Cancel'
          ),

          style: 'cancel',
        },
      ]
    );
  };


  // ---------------------------------------------------------------------------
  // RESEND VERIFICATION
  // ---------------------------------------------------------------------------

  const resendVerification = async (
    email
  ) => {
    try {
      const API_CONFIG = {
        baseUrl:
          'https://www.freshsweeper.com/api',
      };

      await axios.post(
        `${API_CONFIG.baseUrl}/auth/resend_verification`,
        {
          email,
        }
      );

      Alert.alert(
        tSafe(
          'success',
          'Success'
        ),

        tSafe(
          'verification_email_sent',
          'Verification email sent!'
        )
      );

    } catch (error) {
      console.error(
        'Resend verification error:',
        error
      );

      Alert.alert(
        tSafe(
          'error',
          'Error'
        ),

        tSafe(
          'failed_resend_verification',
          'Failed to resend verification email.'
        )
      );
    }
  };


  // ---------------------------------------------------------------------------
  // INPUT HANDLERS
  // ---------------------------------------------------------------------------

  const handleOnchange = (
    text,
    input
  ) => {
    setInputs(
      (prevState) => ({
        ...prevState,
        [input]: text,
      })
    );
  };


  const handleError = (
    error,
    input
  ) => {
    setErrors(
      (prevState) => ({
        ...prevState,
        [input]: error,
      })
    );
  };


  const togglePasswordVisibility = () => {
    setSecureTextEntry(
      (previous) => !previous
    );
  };


  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background.default,
        },
      ]}
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

      {/* Back Button */}
      <TouchableOpacity
        style={[
          styles.backButton,
          {
            backgroundColor:
              theme.surface.elevated,

            borderColor:
              theme.border.default,

            shadowColor:
              theme.shadow?.color ||
              '#000000',
          },
        ]}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate(
            ROUTES.login_options
          )
        }
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={theme.icon.default}
        />
      </TouchableOpacity>


      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.brandIcon,
                {
                  backgroundColor:
                    theme.brand.primaryLight,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={30}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <Text
              style={[
                styles.textHeader,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              {tSafe(
                'welcome',
                'Welcome'
              )}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              {tSafe(
                'sign_in_to_continue',
                'Sign in to continue to Freshsweeper'
              )}
            </Text>
          </View>


          {/* Email */}
          <View style={styles.formSection}>

            <TextInput
              mode="outlined"
              label={tSafe(
                'email',
                'Email'
              )}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder={tSafe(
                'enter_your_email',
                'Enter your email'
              )}
              placeholderTextColor={
                theme.input.placeholder
              }
              value={inputs.email}
              onChangeText={(text) =>
                handleOnchange(
                  text.trim(),
                  'email'
                )
              }
              onFocus={() =>
                handleError(
                  null,
                  'email'
                )
              }
              error={!!errors.email}
              outlineColor={
                errors.email
                  ? theme.status.error
                  : theme.input.border
              }
              activeOutlineColor={
                errors.email
                  ? theme.status.error
                  : theme.input.focus
              }
              textColor={
                theme.input.text
              }
              theme={{
                colors: {
                  primary:
                    theme.input.focus,

                  onSurface:
                    theme.input.text,

                  onSurfaceVariant:
                    theme.text.secondary,

                  outline:
                    theme.input.border,

                  background:
                    theme.input.background,
                },
              }}
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme.input.background,
                },
              ]}
              left={
                <TextInput.Icon
                  icon="email-outline"
                  color={
                    theme.icon.muted
                  }
                />
              }
            />

            {errors.email && (
              <View style={styles.errorContainer}>
                {errors.email}
              </View>
            )}


            {/* Password */}
            <TextInput
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              label={tSafe(
                'password',
                'Password'
              )}
              placeholder={tSafe(
                'enter_password',
                'Enter Password'
              )}
              placeholderTextColor={
                theme.input.placeholder
              }
              value={inputs.password}
              onChangeText={(text) =>
                handleOnchange(
                  text,
                  'password'
                )
              }
              onFocus={() =>
                handleError(
                  null,
                  'password'
                )
              }
              error={!!errors.password}
              secureTextEntry={
                secureTextEntry
              }
              outlineColor={
                errors.password
                  ? theme.status.error
                  : theme.input.border
              }
              activeOutlineColor={
                errors.password
                  ? theme.status.error
                  : theme.input.focus
              }
              textColor={
                theme.input.text
              }
              theme={{
                colors: {
                  primary:
                    theme.input.focus,

                  onSurface:
                    theme.input.text,

                  onSurfaceVariant:
                    theme.text.secondary,

                  outline:
                    theme.input.border,

                  background:
                    theme.input.background,
                },
              }}
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme.input.background,
                },
              ]}
              left={
                <TextInput.Icon
                  icon="lock-outline"
                  color={
                    theme.icon.muted
                  }
                />
              }
              right={
                <TextInput.Icon
                  icon={
                    secureTextEntry
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  color={
                    theme.icon.muted
                  }
                  onPress={
                    togglePasswordVisibility
                  }
                />
              }
            />

            {errors.password && (
              <View style={styles.errorContainer}>
                {errors.password}
              </View>
            )}


            {/* Forgot Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={
                styles.forgotContainer
              }
              onPress={() =>
                navigation.navigate(
                  ROUTES.forgot_password
                )
              }
            >
              <Text
                style={[
                  styles.forgotText,
                  {
                    color:
                      theme.brand.primary,
                  },
                ]}
              >
                {tSafe(
                  'forgot_password',
                  'Forgot Password'
                )}
              </Text>
            </TouchableOpacity>


            {/* Login */}
            <Button
              title={tSafe(
                'login',
                'Login'
              )}
              loading={loading}
              onPress={validate}
            />


            {/* Google Sign In */}
            {/* <TouchableOpacity
              activeOpacity={0.8}
              disabled={
                googleLoading ||
                loading
              }
              style={[
                styles.googleButton,
                {
                  backgroundColor:
                    theme.surface.elevated,

                  borderColor:
                    theme.border.default,

                  opacity:
                    googleLoading ||
                    loading
                      ? 0.6
                      : 1,

                  shadowColor:
                    theme.shadow?.color ||
                    '#000000',
                },
              ]}
              onPress={() =>
                handleGoogleSignIn()
              }
            >
              <View
                style={
                  styles.googleButtonContent
                }
              >
                {googleLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      theme.brand.primary
                    }
                  />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="google"
                      size={21}
                      color="#4285F4"
                      style={
                        styles.googleIcon
                      }
                    />

                    <Text
                      style={[
                        styles.googleButtonText,
                        {
                          color:
                            theme.text.primary,
                        },
                      ]}
                    >
                      {tSafe(
                        'continue_with_google',
                        'Continue with Google'
                      )}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity> */}


            {/* Create Account */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={
                styles.createAccountButton
              }
              onPress={() =>
                navigation.navigate(
                  ROUTES.getting_started
                )
              }
            >
              <Text
                style={[
                  styles.createAccountText,
                  {
                    color:
                      theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  'i_dont_have_account',
                  'I do not have an account'
                )}
              </Text>

              <Text
                style={[
                  styles.createAccountLink,
                  {
                    color:
                      theme.brand.primary,
                  },
                ]}
              >
                {tSafe(
                  'create_account',
                  'Create Account'
                )}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default Signin;


// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 72,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  header: {
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 30,
  },

  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  textHeader: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },

  formSection: {
    width: '100%',
  },

  input: {
    marginBottom: 10,
    fontSize: 14,
  },

  errorContainer: {
    marginTop: -5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 0,
    marginBottom: 18,
    paddingVertical: 4,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },

  googleButton: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleIcon: {
    marginRight: 12,
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  createAccountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingVertical: 12,
  },

  createAccountText: {
    fontSize: 14,
    fontWeight: '500',
  },

  createAccountLink: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 5,
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,

    width: 44,
    height: 44,
    borderRadius: 22,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});