import React, {useEffect, useState, createContext} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
// import fetchIPGeolocation from '../googlemap/geolocation';
import fetchIPGeolocation from '../services/geolocation';
import {
  get,
  ref,
  set,
  onValue,
  push,
  update,
} from 'firebase/database';
// import { db } from '../firebase/config';
import { db } from '../services/firebase/config';
import { API_CONFIG } from '../services/google/auth';
import { GoogleAuthService } from '../services/google/googleAuth';
// Import Apple Auth if you have it
// import { AppleAuthService } from '../services/apple/appleAuth';
import axios from 'axios';
import userService from '../services/connection/userService';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const[isLoading, setIsLoading] = useState(false)
    const[userToken, setUserToken] = useState(null)
    const[userType, setUserType] = useState(null)
    const[userId, setUserId] = useState(null)
    const[currentUser, setCurrentUser] = useState("")
    const[currentUserId, setCurrentUserId] = useState("")
    const[geolocationData, setGeolocationData] = useState(null);
    const[avatar, setAvatar] = useState("")
    const[currency, setCurrency] = useState("")
    const[fbaseUser, setFbaseUser] = useState("")
    const[totalUnreadCount, setTotalUnreadCount] = useState(0);
    const[friendsWithLastMessagesUnread, setFriendsWithLastMessagesUnreadCount] = useState([]);
    const[applicationCounts, setApplicationCounts] = useState(10);
    const[isVerified, setIsVerified] = useState(false);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

    const storeData = async (data) => {
        try {
            const jsonData = JSON.stringify(data)
            await AsyncStorage.setItem('@storage_Key', jsonData)
            console.log('Object stored successfully!');
        } catch (e) {
            console.error('Error storing data:', e);
        }
    }

    const login = (loginResp) => {
        console.log("Nyfb user stored", loginResp.fbUser);  
        console.log("type response:", loginResp.resp.userType);    
        console.log("id response:", loginResp.resp._id);    
        console.log("Login response:", JSON.stringify(loginResp, null , 2));
        console.log("Token response:", loginResp.resp?.data?.token);
        storeData(loginResp);
        setCurrentUser(loginResp.resp);
        setCurrentUserId(loginResp.resp._id);
        setFbaseUser(loginResp.fbUser);
        
        const { identity_verified, onboarding_completed, avatar } = loginResp.resp;
        const verified = identity_verified && onboarding_completed && !!avatar;
        setIsVerified(verified);
        setUserId(loginResp.resp._id);
        setUserToken(loginResp.resp.token);
        setUserType(loginResp.resp.userType);
        setIsLoading(false);
        
        if (loginResp.resp._id) {
            updateFriendsListWithLastMessagesAndUnreadCounts(loginResp.resp._id);
        }
    }

    // AuthContext.js - Make sure this function is included
    const loginWithEmailPassword = async (email, password) => {
        try {
          setIsLoading(true);
          
          const payload = {
            email: email,
            password: password
          }
      
          const response = await userService.userLogin(payload);
          
          console.log("✅ Login response:", response);
          
          if (response.data && response.data.data) {
            // Create login response
            // const loginResp = {
            //   resp: response.data.data,
            //   fbUser: null, // Will be fetched in fetchUserFirebaseData
            // };
            console.log("Show Login Response", response.data.data)
            return { 
              success: true, 
              data: response.data.data 
            };
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Email/password login error:', error);
          
          let errorType = 'GENERAL';
          let errorMessage = 'Login failed. Please try again.';
          let errorData = null;
          
          // Check if error has response property (axios error)
          if (error.response) {
            console.log("📊 Error response structure:", error.response);
            console.log("📊 Error response data:", error.response.data);
            console.log("📊 Error response status:", error.response.status);
            
            if (error.response.status === 400) {
              // Check different possible structures
              const responseData = error.response.data;
              
              // Structure 1: error.response.data.detail (from FastAPI)
              if (responseData.detail && typeof responseData.detail === 'object') {
                errorData = responseData.detail;
                if (responseData.detail.type === 'GOOGLE_ACCOUNT') {
                  errorType = 'GOOGLE_ACCOUNT';
                  errorMessage = responseData.detail.message || 'This account was created with Google. Please use Google login or set a password.';
                } else if (responseData.detail.type === 'NO_PASSWORD') {
                  errorType = 'NO_PASSWORD';
                  errorMessage = responseData.detail.message || 'Please set a password for your account first.';
                }
              } 
              // Structure 2: error.response.data directly contains the error
              else if (responseData.type === 'GOOGLE_ACCOUNT') {
                errorType = 'GOOGLE_ACCOUNT';
                errorMessage = responseData.message || 'This account was created with Google. Please use Google login or set a password.';
                errorData = responseData;
              }
              // Structure 3: String message
              else if (typeof responseData === 'string') {
                errorMessage = responseData;
              }
              // Structure 4: Nested in data property
              else if (responseData.data && responseData.data.detail) {
                errorData = responseData.data.detail;
                if (responseData.data.detail.type === 'GOOGLE_ACCOUNT') {
                  errorType = 'GOOGLE_ACCOUNT';
                  errorMessage = responseData.data.detail.message || 'This account was created with Google. Please use Google login or set a password.';
                }
              }
            } else if (error.response.status === 401) {
              errorMessage = 'Invalid email or password.';
            } else if (error.response.status === 403) {
              errorType = 'VERIFICATION_REQUIRED';
              errorMessage = 'Account verification required. Please check your email.';
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
          } 
          // If error doesn't have response property, it might be a network error
          else if (error.request) {
            errorMessage = 'Network error. Please check your internet connection.';
          } 
          // If it's a general error
          else {
            errorMessage = error.message || 'Login failed. Please try again.';
          }
          
          return { 
            success: false, 
            type: errorType,
            error: errorMessage,
            email: email,
            errorData: errorData // Include the full error data for more info
          };
        } finally {
          setIsLoading(false);
        }
      };

    
    const updateMessageList = (userId) => {
        updateFriendsListWithLastMessagesAndUnreadCounts(userId);
    }

    const logout = async() => {
        setUserToken(null);
        setCurrentUser("");
        setCurrentUserId("");
        setUserType(null);
        setIsVerified(false);
        try {
            await AsyncStorage.removeItem('@storage_Key');
        } catch(e) {
            console.error(e);
        }
        setIsLoading(false);
    }

    const update_avatar = (new_avatar) => {
        setAvatar(new_avatar);
    }

    // AuthContext.js - Add this function to your AuthProvider
    const updateUser = async (updatedUserData) => {
        try {
        console.log('🔄 Updating user in AuthContext:', updatedUserData);
        
        // Update current user state
        setCurrentUser(prev => ({
            ...prev,
            ...updatedUserData
        }));
        
        // Update verification status for cleaner
        if (updatedUserData.userType === 'cleaner') {
            const { identity_verified, onboarding_completed, avatar } = updatedUserData;
            const verified = identity_verified && onboarding_completed && !!avatar;
            setIsVerified(verified);
        }
        
        // Update AsyncStorage
        const currentStorage = await AsyncStorage.getItem('@storage_Key');
        if (currentStorage) {
            const storageData = JSON.parse(currentStorage);
            const updatedStorageData = {
            ...storageData,
            resp: {
                ...storageData.resp,
                ...updatedUserData
            }
            };
            await AsyncStorage.setItem('@storage_Key', JSON.stringify(updatedStorageData));
            console.log('✅ User data updated in storage');
        }
        
        return true;
        } catch (error) {
        console.error('Error updating user in AuthContext:', error);
        return false;
        }
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const jsonValue = await AsyncStorage.getItem('@storage_Key');
            if (jsonValue) {
                const object = JSON.parse(jsonValue);
                setUserToken(object.resp?.token);
                setCurrentUserId(object.resp?._id);
                setUserType(object.resp?.userType);
                setCurrency(object.resp?.location?.currency?.symbol || '$');
                setCurrentUser(object.resp);
                setFbaseUser(object.fbUser);

                if (object.resp?.userType === 'cleaner') {
                    const { identity_verified, onboarding_completed, avatar } = object.resp;
                    const verified = identity_verified && onboarding_completed && !!avatar;
                    setIsVerified(verified);
                } else {
                    setIsVerified(true);
                }
            } else {
                console.log("No user data found in storage.");
                setIsVerified(false);
            }
        } catch (error) {
            console.error("Error loading user data from storage:", error);
            setIsVerified(false);
        } finally {
            setIsLoading(false);
        }
    };

   
    

    // AuthContext.js - Update the signupWithGoogle function
    const signupWithGoogle = async (userType, emailHint = null) => {
        try {
            setIsLoading(true);
            
            console.log("Starting Google OAuth with email hint:", emailHint);
            
            // 1. Initiate Google OAuth with proper configuration
            const googleAuth = await GoogleAuthService.initiateAuth(emailHint);
            
            if (!googleAuth.success) {
                setIsLoading(false);
                return { 
                    success: false, 
                    error: googleAuth.error || 'Google authentication failed' 
                };
            }

            console.log("Google auth successful, token:", googleAuth.code ? "has token" : "no token");
            
            // 2. Send to backend with proper error handling
            const response = await axios.post(`https://www.freshsweeper.com/api/auth/google_auth`, {
                token: googleAuth.code, // Your backend expects 'token' field
                userType: userType,
                emailHint: emailHint
            }, {
                timeout: 15000, // 15 second timeout
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log("Backend response status:", response.status);
            console.log("Backend response data:", response.data);

            if (response.data && response.data.data) {
                // 3. Create login response
                const loginResp = {
                    resp: response.data.data,
                    fbUser: response.data.fbUser || null,
                };

                // 4. Call login function (updates AuthContext)
                login(loginResp);
                
                return { 
                    success: true, 
                    data: response.data.data
                };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Google signup error details:', error);
            
            let errorMessage = 'Google signup failed';
            
            if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.response) {
                console.log("Error response status:", error.response.status);
                console.log("Error response data:", error.response.data);
                
                if (error.response.status === 400) {
                    errorMessage = error.response.data?.message || 'Invalid request.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Authentication failed.';
                } else if (error.response.status === 403) {
                    errorMessage = 'Access denied.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMessage = 'No response from server. Please try again.';
            }
            
            setIsLoading(false);
            return { 
                success: false, 
                error: errorMessage 
            };
        }
    };

    // UPDATED: Apple Sign-In function (if you have AppleAuthService)
    const signupWithApple = async (userType) => {
        try {
            setIsLoading(true);
            
            // Step 1: Initiate Apple Sign-In
            // Note: You need to implement AppleAuthService similar to GoogleAuthService
            // const appleAuth = await AppleAuthService.initiateAuth();
            
            // For now, let's create a placeholder
            // Remove this and uncomment above when you implement AppleAuthService
            const appleAuth = { 
                success: false, 
                error: 'Apple Sign-In not implemented yet' 
            };
            
            if (!appleAuth.success) {
                setIsLoading(false);
                return { success: false, error: appleAuth.error };
            }

            // Step 2: Send Apple auth data to backend
            const response = await axios.post(`${API_CONFIG.baseUrl}/auth/oauth/apple`, {
                // Apple auth data here
                user_type: userType,
            });

            if (response.data && response.data.resp) {
                const loginResp = {
                    resp: response.data.resp,
                    fbUser: response.data.fbUser || null,
                };

                login(loginResp);
                
                return { 
                    success: true, 
                    data: response.data,
                    is_new_user: response.data.is_new_user || false
                };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Apple signup error:', error);
            setIsLoading(false);
            return { 
                success: false, 
                error: error.response?.data?.message || 
                       error.response?.data?.detail || 
                       'Apple signup failed' 
            };
        }
    };

    const fetchGeolocation = async () => {
        try {
            const data = await fetchIPGeolocation();
            setGeolocationData(data);
            console.log("Geolocation data:", data);
        } catch (error) {
            console.error("Error fetching geolocation:", error);
        }
    };

    async function updateFriendsListWithLastMessagesAndUnreadCounts(userId) {
        if (!userId) return;
        
        try {
            const friendsRef = ref(db, `users/${userId}/friends`);
            const friendsSnapshot = await get(friendsRef);
            const friendsData = friendsSnapshot.val() || {};
            const userFriends = Object.values(friendsData) || [];

            const updatedFriendsWithMessages = [];

            for (const friend of userFriends) {
                const chatroomId = friend.chatroomId;
                const chatroomRef = ref(db, `chatrooms/${chatroomId}`);
                const chatroomSnapshot = await get(chatroomRef);
                const chatroomData = chatroomSnapshot.val();

                if (chatroomData && chatroomData.messages) {
                    const lastMsg = chatroomData.messages[chatroomData.messages.length - 1];
                    const lastmessage = {
                        text: lastMsg ? lastMsg.text : null,
                        sender: lastMsg ? lastMsg.sender : null,
                        createdAt: lastMsg ? lastMsg.createdAt : null
                    };

                    const updatedFriend = { ...friend, lastmessage };

                    // Fetch unread message count
                    const unreadRef = ref(db, `unreadMessages/${chatroomId}/${userId}/${friend.userId}`);
                    const unreadSnapshot = await get(unreadRef);
                    const unreadCount = unreadSnapshot.val() || 0;
                    updatedFriend.unreadCount = unreadCount;

                    updatedFriendsWithMessages.push(updatedFriend);
                }
            }

            // Sort the friends based on the createdAt timestamp of the last message
            updatedFriendsWithMessages.sort((a, b) => {
                if (!a.lastmessage || !a.lastmessage.createdAt) return 1;
                if (!b.lastmessage || !b.lastmessage.createdAt) return -1;
                return new Date(b.lastmessage.createdAt) - new Date(a.lastmessage.createdAt);
            });

            setFriendsWithLastMessagesUnreadCount(updatedFriendsWithMessages);

            // Calculate the total sum of unread message counts from all friends
            const totalUnreadCount = updatedFriendsWithMessages.reduce((total, friend) => {
                return total + friend.unreadCount;
            }, 0);

            setTotalUnreadCount(totalUnreadCount);
        } catch (error) {
            console.error('Error updating friends list with last messages and unread counts:', error);
        }
    }

    

    const updateNotificationUnreadCount = (count) => {
        setNotificationUnreadCount(count);
    };

    useEffect(() => {
        isLoggedIn();
        fetchGeolocation();
        if (currentUserId) {
            updateFriendsListWithLastMessagesAndUnreadCounts(currentUserId);
        }
    }, [currentUserId]);

    useEffect(() => {
        // Any logic you want to run when friendsWithLastMessagesUnreadCount updates
    }, [friendsWithLastMessagesUnread]);

    return (
        <AuthContext.Provider value={{
            userId,
            fbaseUser,
            userToken,
            userType,
            currency,
            totalUnreadCount,
            updateMessageList,
            loginWithEmailPassword,
            setTotalUnreadCount,
            setFriendsWithLastMessagesUnreadCount,
            signupWithGoogle,
            signupWithApple, // Add this if you implement Apple
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
            isLoggedIn
        }}>
            {children}
        </AuthContext.Provider>
    );
};