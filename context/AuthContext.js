// // context/AuthContext.js
// import React, { useState, useEffect, createContext } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { navigationRef } from '../utils/navigationRef';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [userToken, setUserToken] = useState(null);
//   const [userType, setUserType] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // ---- LOGIN ----
//   const login = async (userData) => {
//     const token = userData.token;
//     const type = userData.userType;
//     const id = userData._id;
//     if (token) {
//       await AsyncStorage.setItem('@auth_token', token);
//       await AsyncStorage.setItem('@user_type', type);
//       await AsyncStorage.setItem('@user_id', id);
//       await AsyncStorage.setItem('@has_account', 'true'); // ✅ CRITICAL
//       setUserToken(token);
//       setUserType(type);
//       setUserId(id);
//     }
//     setIsLoading(false);
//   };

//   // ---- LOGOUT ----
//   const logout = async () => {
//     await AsyncStorage.multiRemove([
//       '@auth_token',
//       '@user_type',
//       '@user_id',
//       // 🟢 DO NOT REMOVE @has_account
//     ]);
//     setUserToken(null);
//     setUserType(null);
//     setUserId(null);
//     if (navigationRef.current) {
//       navigationRef.current.reset({ index: 0, routes: [{ name: 'Public' }] });
//     }
//   };

//   // ---- RESTORE (called on app start) ----
//   const restore = async () => {
//     const token = await AsyncStorage.getItem('@auth_token');
//     const type = await AsyncStorage.getItem('@user_type');
//     const id = await AsyncStorage.getItem('@user_id');
//     if (token) {
//       setUserToken(token);
//       setUserType(type);
//       setUserId(id);
//     }
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     restore();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ userToken, userType, userId, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };




import React, {
  useEffect,
  useState,
  createContext,
} from 'react';

import {
  Alert,
  AppState,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import fetchIPGeolocation from '../services/geolocation';

import { API_CONFIG } from '../services/google/auth';
import { GoogleAuthService } from '../services/google/googleAuth';

import userService from '../services/connection/userService';
import { getConversations } from '../services/connection/chatApi';

import {
  setTokens,
  clearTokens,
} from '../utils/tokenManager';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  const [currentUser, setCurrentUser] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const [geolocationData, setGeolocationData] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [currency, setCurrency] = useState('');

  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [
    friendsWithLastMessagesUnread,
    setFriendsWithLastMessagesUnreadCount,
  ] = useState([]);

  const [applicationCounts, setApplicationCounts] = useState(10);
  const [isVerified, setIsVerified] = useState(false);

  const [notificationUnreadCount, setNotificationUnreadCount] =
    useState(0);

  // ============================================================
  // STORAGE
  // ============================================================

  const storeData = async (data) => {
    try {
      const jsonData = JSON.stringify(data);

      await AsyncStorage.setItem(
        '@storage_Key',
        jsonData
      );

      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error(
        '❌ Error storing authentication data:',
        error
      );
    }
  };

  // ============================================================
  // LOGIN
  //
  // IMPORTANT:
  // This is NOT Firebase authentication.
  //
  // This stores the Freshsweeper backend session and updates
  // AuthContext state.
  // ============================================================

  const login = async (loginResp) => {
    try {
      if (!loginResp?.resp) {
        console.error(
          '❌ login() called without resp data'
        );
        return;
      }

      const user = loginResp.resp;

      console.log('🔐 AUTH CONTEXT LOGIN');
      console.log('👤 User ID:', user?._id);
      console.log('👤 User Type:', user?.userType);
      console.log('📧 Email:', user?.email);

      await storeData({
        resp: user,
      });

      setCurrentUser(user);
      setCurrentUserId(user._id || '');
      setUserId(user._id || '');

      const accessToken = user?.token;
      const refreshToken = user?.refresh_token;

      if (accessToken) {
        setUserToken(accessToken);
      }

      if (accessToken && refreshToken) {
        await setTokens(
          accessToken,
          refreshToken
        );
      }

      const {
        identity_verified,
        onboarding_completed,
        avatar: userAvatar,
      } = user;

      const verified =
        user?.userType === 'cleaner'
          ? !!(
              identity_verified &&
              onboarding_completed &&
              userAvatar
            )
          : true;

      setIsVerified(verified);

      setUserType(user?.userType || null);

      setCurrency(
        user?.location?.currency_symbol ||
        user?.location?.currency?.symbol ||
        '$'
      );

      setAvatar(userAvatar || '');

      setIsLoading(false);

      // Refresh backend chat/unread information.
      //
      // This is intentionally NOT Firebase.
      if (user?._id) {
        await updateFriendsListWithLastMessagesAndUnreadCounts(
          user._id
        );
      }

      console.log('✅ AuthContext login completed');
    } catch (error) {
      console.error(
        '❌ AuthContext login error:',
        error
      );

      setIsLoading(false);
    }
  };

  // ============================================================
  // EMAIL / PASSWORD LOGIN
  // ============================================================

  const loginWithEmailPassword = async (
    email,
    password
  ) => {
    try {
      setIsLoading(true);

      const payload = {
        email,
        password,
      };

      const response =
        await userService.userLogin(payload);

      if (
        response.data &&
        response.data.data
      ) {
        const loginResp = {
          resp: response.data.data,
        };

        await login(loginResp);

        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(
        'Invalid response from server'
      );
    } catch (error) {
      console.error(
        '🔴 Email/password login error:',
        error
      );

      let errorType = 'GENERAL';
      let errorMessage =
        'Login failed. Please try again.';
      let errorData = null;

      if (error.response) {
        const responseData =
          error.response.data;

        if (error.response.status === 400) {
          if (
            responseData.detail &&
            typeof responseData.detail === 'object'
          ) {
            errorData =
              responseData.detail;

            if (
              responseData.detail.type ===
              'GOOGLE_ACCOUNT'
            ) {
              errorType = 'GOOGLE_ACCOUNT';

              errorMessage =
                responseData.detail.message ||
                'This account was created with Google. Please use Google login or set a password.';
            } else if (
              responseData.detail.type ===
              'NO_PASSWORD'
            ) {
              errorType = 'NO_PASSWORD';

              errorMessage =
                responseData.detail.message ||
                'Please set a password for your account first.';
            }
          } else if (
            responseData.type ===
            'GOOGLE_ACCOUNT'
          ) {
            errorType = 'GOOGLE_ACCOUNT';

            errorMessage =
              responseData.message ||
              'This account was created with Google. Please use Google login or set a password.';

            errorData = responseData;
          } else if (
            typeof responseData === 'string'
          ) {
            errorMessage = responseData;
          } else if (
            responseData.data &&
            responseData.data.detail
          ) {
            errorData =
              responseData.data.detail;

            if (
              responseData.data.detail.type ===
              'GOOGLE_ACCOUNT'
            ) {
              errorType = 'GOOGLE_ACCOUNT';

              errorMessage =
                responseData.data.detail.message ||
                'This account was created with Google. Please use Google login or set a password.';
            }
          }
        } else if (
          error.response.status === 401
        ) {
          errorMessage =
            'Invalid email or password.';
        } else if (
          error.response.status === 403
        ) {
          errorType =
            'VERIFICATION_REQUIRED';

          errorMessage =
            'Account verification required. Please check your email.';
        } else if (
          error.response.data?.message
        ) {
          errorMessage =
            error.response.data.message;
        }
      } else if (error.request) {
        errorMessage =
          'Network error. Please check your internet connection.';
      } else {
        errorMessage =
          error.message ||
          'Login failed. Please try again.';
      }

      return {
        success: false,
        type: errorType,
        error: errorMessage,
        email,
        errorData,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // MESSAGE / CONVERSATION REFRESH
  //
  // Firebase has been removed.
  // Conversations now come from the Freshsweeper backend.
  // ============================================================

  const updateFriendsListWithLastMessagesAndUnreadCounts =
    async (userIdToFetch) => {
      if (!userIdToFetch) {
        return;
      }

      try {
        const data =
          await getConversations(
            userIdToFetch,
            'en'
          );

        if (!Array.isArray(data)) {
          setFriendsWithLastMessagesUnreadCount([]);
          setTotalUnreadCount(0);
          return;
        }

        setFriendsWithLastMessagesUnreadCount(
          data
        );

        const totalUnread =
          data.reduce(
            (total, conversation) =>
              total +
              Number(
                conversation?.unreadCount || 0
              ),
            0
          );

        setTotalUnreadCount(
          totalUnread
        );
      } catch (error) {
        console.error(
          '❌ Error refreshing conversations:',
          error
        );
      }
    };

  const updateMessageList = (userIdToUpdate) => {
    updateFriendsListWithLastMessagesAndUnreadCounts(
      userIdToUpdate
    );
  };

  // ============================================================
  // LOGOUT
  //
  // IMPORTANT:
  // We intentionally do NOT remove the onboarding-completed flag.
  // ============================================================

  const logout = async () => {
    try {
      const onboardingCompleted =
        await AsyncStorage.getItem(
          '@app_onboarding_completed'
        );

      const legacyOnboarding =
        await AsyncStorage.getItem(
          '@app_onboarding_shown'
        );

      console.log(
        '🔵 Onboarding state before logout:',
        {
          completed:
            onboardingCompleted,
          legacy:
            legacyOnboarding,
        }
      );

      await AsyncStorage.multiRemove([
        '@auth_token',
        '@refresh_token',
        '@user_data',
        '@user_type',
        '@user_id',
        '@storage_Key',
      ]);

      await clearTokens();

      setUserToken(null);
      setCurrentUser(null);
      setCurrentUserId('');
      setUserId(null);
      setUserType(null);
      setIsVerified(false);
      setAvatar('');
      setCurrency('');

      setFriendsWithLastMessagesUnreadCount(
        []
      );

      setTotalUnreadCount(0);

      console.log(
        '✅ Logout completed'
      );
    } catch (error) {
      console.error(
        '❌ Logout error:',
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // UPDATE AVATAR
  // ============================================================

  const update_avatar = (new_avatar) => {
    setAvatar(new_avatar);
  };

  // ============================================================
  // UPDATE USER
  // ============================================================

  const updateUser = async (
    updatedUserData
  ) => {
    try {
      setCurrentUser((previousUser) => ({
        ...(previousUser || {}),
        ...updatedUserData,
      }));

      if (
        updatedUserData.userType ===
        'cleaner'
      ) {
        const {
          identity_verified,
          onboarding_completed,
          avatar: updatedAvatar,
        } = updatedUserData;

        const verified =
          identity_verified &&
          onboarding_completed &&
          !!updatedAvatar;

        setIsVerified(verified);
      }

      const currentStorage =
        await AsyncStorage.getItem(
          '@storage_Key'
        );

      if (currentStorage) {
        const storageData =
          JSON.parse(currentStorage);

        const updatedStorageData = {
          ...storageData,
          resp: {
            ...(storageData.resp || {}),
            ...updatedUserData,
          },
        };

        await AsyncStorage.setItem(
          '@storage_Key',
          JSON.stringify(
            updatedStorageData
          )
        );
      }

      return true;
    } catch (error) {
      console.error(
        '❌ Error updating user in AuthContext:',
        error
      );

      return false;
    }
  };

  // ============================================================
  // RESTORE SESSION
  // ============================================================

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);

      const jsonValue =
        await AsyncStorage.getItem(
          '@storage_Key'
        );

      if (jsonValue) {
        const object =
          JSON.parse(jsonValue);

        const user =
          object?.resp || null;

        if (user?._id) {
          setUserToken(user?.token || null);
          setCurrentUserId(user._id);
          setUserId(user._id);
          setUserType(
            user?.userType || null
          );

          setCurrency(
            user?.location?.currency_symbol ||
            user?.location?.currency?.symbol ||
            '$'
          );

          setCurrentUser(user);

          setAvatar(
            user?.avatar || ''
          );

          if (
            user?.userType ===
            'cleaner'
          ) {
            const {
              identity_verified,
              onboarding_completed,
              avatar: userAvatar,
            } = user;

            setIsVerified(
              !!(
                identity_verified &&
                onboarding_completed &&
                userAvatar
              )
            );
          } else {
            setIsVerified(true);
          }

          console.log(
            '✅ Existing Freshsweeper session restored'
          );
        } else {
          setIsVerified(false);
        }
      } else {
        console.log(
          'ℹ️ No Freshsweeper session found'
        );

        setIsVerified(false);
      }
    } catch (error) {
      console.error(
        '❌ Error loading user data from storage:',
        error
      );

      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // GOOGLE SIGNUP / LOGIN
  //
  // IMPORTANT:
  // Google Firebase authentication has been removed.
  //
  // Google OAuth -> Freshsweeper backend.
  // ============================================================

  const signupWithGoogle = async (
    userType,
    emailHint = null
  ) => {
    try {
      setIsLoading(true);

      const googleAuth =
        await GoogleAuthService.initiateAuth(
          emailHint
        );

      if (!googleAuth.success) {
        return {
          success: false,
          error:
            googleAuth.error ||
            'Google authentication failed',
        };
      }

      const response =
        await axios.post(
          `${API_CONFIG.baseUrl}/auth/google_auth`,
          {
            token: googleAuth.code,
            userType,
            emailHint,
          },
          {
            timeout: 15000,
            headers: {
              'Content-Type':
                'application/json',
              Accept:
                'application/json',
            },
          }
        );

      if (
        response.data &&
        response.data.data
      ) {
        const loginResp = {
          resp: response.data.data,
        };

        await login(loginResp);

        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(
        'Invalid response from server'
      );
    } catch (error) {
      console.error(
        '❌ Google signup error:',
        error
      );

      let errorMessage =
        'Google signup failed';

      if (
        error.code ===
          'NETWORK_ERROR' ||
        error.message?.includes(
          'Network Error'
        )
      ) {
        errorMessage =
          'Network error. Please check your internet connection.';
      } else if (
        error.response
      ) {
        if (
          error.response.status ===
          400
        ) {
          errorMessage =
            error.response.data?.message ||
            'Invalid request.';
        } else if (
          error.response.status ===
          401
        ) {
          errorMessage =
            'Authentication failed.';
        } else if (
          error.response.status ===
          403
        ) {
          errorMessage =
            'Access denied.';
        } else if (
          error.response.status ===
          500
        ) {
          errorMessage =
            'Server error. Please try again later.';
        } else {
          errorMessage =
            error.response.data?.message ||
            `Error: ${error.response.status}`;
        }
      } else if (
        error.request
      ) {
        errorMessage =
          'No response from server. Please try again.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // APPLE
  //
  // Apple authentication is handled by GetStarted using
  // expo-apple-authentication and the Freshsweeper backend.
  //
  // This function remains only for compatibility with any
  // existing screens that import it.
  // ============================================================

  const signupWithApple = async (
    userType
  ) => {
    return {
      success: false,
      error:
        'Apple Sign-In is handled by the Apple authentication flow.',
    };
  };

  // ============================================================
  // GEOLOCATION
  // ============================================================

  const fetchGeolocation = async () => {
    try {
      const data =
        await fetchIPGeolocation();

      setGeolocationData(data);
    } catch (error) {
      console.error(
        '❌ Error fetching geolocation:',
        error
      );
    }
  };

  // ============================================================
  // NOTIFICATION UNREAD COUNT
  // ============================================================

  const updateNotificationUnreadCount = (
    count
  ) => {
    setNotificationUnreadCount(
      count
    );
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  useEffect(() => {
    isLoggedIn();
    fetchGeolocation();
  }, []);

  // ============================================================
  // BACKEND CHAT / UNREAD POLLING
  //
  // No Firebase.
  // ============================================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    let interval = null;
    let isActive = true;

    const fetchTotalUnread = async () => {
      if (!isActive) {
        return;
      }

      try {
        const data =
          await getConversations(
            currentUserId,
            'en'
          );

        if (Array.isArray(data)) {
          setFriendsWithLastMessagesUnreadCount(
            data
          );

          const total =
            data.reduce(
              (
                sum,
                conversation
              ) =>
                sum +
                Number(
                  conversation?.unreadCount ||
                    0
                ),
              0
            );

          setTotalUnreadCount(
            total
          );
        }
      } catch (error) {
        console.error(
          '❌ Conversation polling error:',
          error
        );
      }
    };

    fetchTotalUnread();

    interval = setInterval(
      fetchTotalUnread,
      5000
    );

    const subscription =
      AppState.addEventListener(
        'change',
        (nextAppState) => {
          if (
            nextAppState ===
            'active'
          ) {
            isActive = true;

            fetchTotalUnread();

            if (!interval) {
              interval =
                setInterval(
                  fetchTotalUnread,
                  5000
                );
            }
          } else {
            isActive = false;

            if (interval) {
              clearInterval(
                interval
              );

              interval = null;
            }
          }
        }
      );

    return () => {
      if (interval) {
        clearInterval(interval);
      }

      subscription.remove();
    };
  }, [currentUserId]);

  return (
    <AuthContext.Provider
      value={{
        userId,
        userToken,
        userType,
        currency,
        totalUnreadCount,
        updateMessageList,
        loginWithEmailPassword,
        setTotalUnreadCount,
        setFriendsWithLastMessagesUnreadCount,
        signupWithGoogle,
        signupWithApple,
        isVerified,
        friendsWithLastMessagesUnread,
        applicationCounts,
        isLoading,
        currentUser,
        avatar,
        currentUserId,
        geolocationData,
        notificationUnreadCount,
        updateNotificationUnreadCount,
        login,
        logout,
        update_avatar,
        updateUser,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};