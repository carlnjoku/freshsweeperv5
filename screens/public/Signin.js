import React, {useEffect, useState, useContext} from 'react';
import { 
    SafeAreaView,
    StyleSheet, 
    ScrollView, 
    Text, 
    View,  
    Alert,
    Keyboard, 
    TouchableOpacity,
    Platform,
    ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';  
import { useRoute } from '@react-navigation/native'
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native'
import * as Animatable from 'react-native-animatable';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import * as Notifications from 'expo-notifications'
import Button from '../../components/shared/Button';
import { db } from '../../services/firebase/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ref, get, set } from 'firebase/database';
import axios from 'axios';
import * as Device from 'expo-device';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import userService from '../../services/connection/userService';
import useInviteToken from '../../hooks/useInviteToken';
import { navigationRef } from '../../App';
import { LanguageContext } from '../../context/LanguageContext';
// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

const Signin = () => {
    // const inviteToken = useInviteToken(); // 🔹 Get token from deep link

    const {language} = useContext(LanguageContext)
    const writeUserData = (userData) => {
        console.log("-------#####---------", userData)
        alert(language)
        try {
            // setDoc(doc(db, "userChats", userData._id), {});
            const userId = userData._id;
            const firstname = userData.firstname;
            const lastname = userData.lastname;
            const email = userData.email;
            const avatar = userData.avatar
            const userRef = `users/${userId}`;
            const userDatabaseRef = ref(db, userRef);
            set(userDatabaseRef, {
              userId: userId,
              firstname:firstname,
              lastname:lastname,
              language:language,
              email:email,
              avatar:avatar
            });
    
            const unreadMsgRef = `unreadMessages/${userId}`;
            const unreadMsgDatabaseRef = ref(db, unreadMsgRef);
            set(unreadMsgDatabaseRef, {
              
            })
            alert("Data written successfully!");
        } catch (error) {
            console.error("Error writing data: ", error);
            // alert("An error occurred while writing data.");
        }
    
      };

    const route = useRoute()
   
    const inviteToken = route.params?.inviteToken // 🔹 Get token from deep link
    // const route = useRoute()

    
    const navigation = useNavigation()

    const rootNavigation = navigation?.getParent();

    console.log("Roooot-------------t", rootNavigation)


    const { t } = useTranslation();
    const { login, loginWithEmailPassword } = useContext(AuthContext);

    // Use the hook only once and get all values
    const { expoPushToken, registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();

    const [inputs, setInputs] = React.useState({email: '', password: ''});
    const [fbCurrentUser, setFBCurrentUser] = React.useState({});
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [errMsg, setErrMsg] = React.useState(false);
    const [device_name, setDeviceName] = React.useState("");
    const [os_type, setOsType] = React.useState("false");
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Google OAuth setup - Simple version
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        expoClientId: '283581670255-bg5umkf8vnai35ur0hp1i6cepv5fko1v.apps.googleusercontent.com',
        iosClientId: Platform.OS === 'ios' ? '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com' : undefined,
        androidClientId: Platform.OS === 'android' ? '283581670255-ikalnp6e8d90un2dfsmbqmvektqdj38m.apps.googleusercontent.com' : undefined,
        scopes: ['profile', 'email'],
        redirectUri: AuthSession.makeRedirectUri({
            useProxy: true,
        }),
    });

    

    // Setup notification handlers
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
        )
        
        return () => {
            if(responseListener){
                Notifications.removeNotificationSubscription(responseListener)
            }
        }
    }, []);


    

    // Handle Google OAuth response
    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (googleResponse?.type === 'success') {
                setGoogleLoading(true);
                
                try {
                    const { authentication } = googleResponse;
                    console.log("✅ Google auth successful, ID token received");
                    
                    // Send to backend
                    const response = await fetch('https://www.freshsweeper.com/api/auth/google_auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: authentication.idToken,
                            userType: null, // For sign-in
                        }),
                    });
                    
                    const data = await response.json();
                    
                    
                    if (response.ok && data.status === 'success') {
                        const userData = data.data;

                        // Register for push notifications
                        await registerForPushNotificationsAsync(userData._id);

                        
                        await fetchUserFirebaseData(userData._id, userData);
                        
                        if (navigationRef.current) {
                          if (inviteToken) {
                            navigationRef.current.reset({
                              index: 0,
                              routes: [
                                {
                                  name: 'Public',
                                  state: {
                                    routes: [{ name: 'InviteGate', params: { inviteToken } }],
                                  },
                                },
                              ],
                            });
                          } else {
                            navigationRef.current.reset({
                              index: 0,
                              routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
                            });
                          }
                        }
                      } else {
                        throw new Error(data.message || 'Sign-in failed');
                    }
                } catch (error) {
                    console.error("Google sign-in error:", error);
                    Alert.alert("Error", error.message || "Google sign-in failed");
                } finally {
                    setGoogleLoading(false);
                }
            } else if (googleResponse?.type === 'error') {
                console.error("Google auth error:", googleResponse.error);
                if (googleResponse.error?.code !== 'ERR_REQUEST_CANCELED') {
                    Alert.alert("Error", "Google sign-in failed");
                }
                setGoogleLoading(false);
            }
        };
        
        handleGoogleResponse();
    }, [googleResponse]);

    // Simple Google sign-in function
    const handleGoogleSignIn = async (emailHint = null) => {
        try {
            setGoogleLoading(true);
            
            // Add extra params for email hint if provided
            const extraParams = emailHint ? { login_hint: emailHint } : {};
            
            await googlePromptAsync(extraParams);
        } catch (error) {
            console.error("Google prompt error:", error);
            setGoogleLoading(false);
        }
    };

    const getDeviceInfo = async () => {
        const deviceName = Device.deviceName;
        const osFull = Device.osName || '';
        const osVersion = Device.osVersion;
        let osType = 'Unknown OS';
        setDeviceName(deviceName)
        setOsType(Device.os_type)
       
        
        if (osFull.toLowerCase().includes('android')) {
            osType = 'Android';
        } else if (osFull.toLowerCase().includes('ios')) {
            osType = 'iOS';
        }
    
        console.log(`Device Name: ${deviceName}`);
        console.log(`OS Type: ${osType}`);
        console.log(`OS Version: ${osVersion}`);
    };
    
    useEffect(() => {
        if (expoPushToken) {
            console.log('Expo Push Token:', expoPushToken);
        }

        getDeviceInfo();
    }, [expoPushToken]);



    const fetchUserFirebaseData = async(uid, response) => {
        try {
            const mySnapshot = await get(ref(db, `users/${uid}`))
            setFBCurrentUser(mySnapshot.val())

            console.log("Get me my user", mySnapshot.val())
            const data_to_send = {
                resp: response,
                fbUser: mySnapshot.val(),
                expo_push_token: expoPushToken
            }

            login(data_to_send)
            
            // Update expo push token if different
            if(response.expo_push_token !== expoPushToken){
                const userTokenData = {
                    userId: uid,
                    expo_push_token: expoPushToken
                }
                // userService.updateExpoPushToken(userTokenData)
            }
        } catch (error) {
            console.error("Error fetching Firebase data:", error);
            // Even if Firebase fails, still login the user
            // const data_to_send = {
            //     resp: response,
            //     fbUser: null,
            //     expo_push_token: expoPushToken
            // }
            // login(data_to_send);
        }
    }

    const validate = async () => {
        Keyboard.dismiss();
        let isValid = true;
        if (!inputs.email) {
            handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter email</Text></Animatable.View>, 'email');
            isValid = false;
        }
        if (!inputs.password) {
            handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter password</Text></Animatable.View>, 'password');
            isValid = false;
        }
        if (isValid) {
            setLoading(!loading);
            handleLogin();
        }
    };

    

    const handleLogin = async () => {
        setLoading(true);
        // Log current root state for debugging
        try {
          const result = await loginWithEmailPassword(inputs.email, inputs.password);
      
          if (result.success) {
            const userData = result.data;
      
            // Register push token
            await registerForPushNotificationsAsync(userData._id);
      
            // Update AuthContext (this will cause re-render but rootNav remains valid)
            await fetchUserFirebaseData(userData._id, userData);
            writeUserData(userData)
            console.log('✅ AuthContext updated, now navigating...');
            console.log('Invite token:', inviteToken);
            console.log('User type:', userData.userType);
            console.log('Target screen:', userData.userType === 'host' ? 'Host' : 'Cleaner');
      

            if (navigationRef.current) {
                if (inviteToken) {
                  navigationRef.current.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Public',
                        state: {
                          routes: [{ name: 'InviteGate', params: { inviteToken } }],
                        },
                      },
                    ],
                  });
                } else {
                  navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
                  });
                }
              } else {
                console.error('❌ Navigation ref not available');
              }

          } else {
            // // Handle different error types
            console.log("❌ Login failed with type:", result.type);
                
            switch(result.type) {
                case 'GOOGLE_ACCOUNT':
                    showGoogleAccountAlertDirect(result.email);
                    break;
                    
                case 'NO_PASSWORD':
                    showNoPasswordAlertDirect(result.email);
                    break;
                    
                case 'VERIFICATION_REQUIRED':
                    Alert.alert(
                        'Verification Required',
                        'Please verify your email before logging in.',
                        [
                            { text: 'Resend Verification', onPress: () => resendVerification(result.email) },
                            { text: 'OK', style: 'default' }
                        ]
                    );
                    break;
                    
                default:
                    Alert.alert('Login Failed', result.error);
            }
          
          }
        } catch (error) {
          console.error('Login error:', error);
          Alert.alert('Error', 'Something went wrong');
        } finally {
          setLoading(false);
        }
      };

    const showGoogleAccountAlertDirect = (email) => {
        Alert.alert(
            'Account Created with Google',
            'This account was created using Google. Would you like to sign in with Google?',
            [
                {
                    text: 'Sign in with Google',
                    onPress: () => {
                        handleGoogleSignIn(email);
                    }
                },
                {
                    text: 'Set Password Instead',
                    onPress: () => {
                        navigation.navigate(ROUTES.set_password, { 
                            email: email 
                        });
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const showNoPasswordAlertDirect = (email) => {
        Alert.alert(
            'Password Required',
            'You need to set a password for your account first.',
            [
                {
                    text: 'Set Password',
                    onPress: () => {
                        navigation.navigate(ROUTES.set_password, { 
                            email: email 
                        });
                    }
                },
                {
                    text: 'Use Google Instead',
                    onPress: () => {
                        handleGoogleSignIn(email);
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const resendVerification = async (email) => {
        try {
            const API_CONFIG = { baseUrl: 'https://www.freshsweeper.com/api' };
            await axios.post(`${API_CONFIG.baseUrl}/auth/resend_verification`, { email });
            Alert.alert('Success', 'Verification email sent!');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend verification email.');
        }
    };
    
    const handleOnchange = (text, input) => {
        setInputs(prevState => ({...prevState, [input]: text}));
    };

    const handleError = (error, input) => {
        setErrors(prevState => ({...prevState, [input]: error}));
    };

    const togglePasswordVisibility = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.white }}>
            
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20 }}>
                <View style={{ paddingTop: 120, paddingHorizontal: 0 }}>
                    <View style={styles.header}>
                        <Text style={styles.text_header}>{t('welcome')}</Text>
                    </View>
                    
                    <TextInput
                        mode="outlined"
                        label="Email"
                        autoCapitalize="none"
                        placeholder="Enter your email"
                        placeholderTextColor={COLORS.gray}
                        outlineColor="#D8D8D8"
                        value={inputs.email}
                        activeOutlineColor={COLORS.primary}
                        style={{ marginBottom: 10, fontSize: 14, backgroundColor: "#fff" }}
                        onChangeText={text => handleOnchange(text, 'email')}
                        onFocus={() => handleError(null, 'email')}
                        error={errors.email}
                        left={<TextInput.Icon icon="email" style={{ marginTop: 10 }} fontSize="small" />}
                    />

                    <TextInput
                        mode='outlined'
                        autoCapitalize="none"
                        onChangeText={text => handleOnchange(text, 'password')}
                        onFocus={() => handleError(null, 'password')}
                        left={<TextInput.Icon icon="lock-outline" style={{ marginTop: 10 }} size={20} />}
                        label={t('password')}
                        placeholder={t("enter_password")}
                        style={{ marginBottom: 10, fontSize: 14, backgroundColor: "#fff" }}
                        outlineColor="#D8D8D8"
                        activeOutlineColor={COLORS.primary}
                        error={errors.password}
                        secureTextEntry={secureTextEntry}
                        right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={togglePasswordVisibility} size={20} />}
                    />

                    <Text onPress={() => navigation.navigate(ROUTES.forgot_password)} style={{ textAlign: "right", marginTop: 0, marginBottom: 10, fontSize: 12, color: COLORS.primary }}>
                        {t("forgot_password")}
                    </Text>

                    <Button title={t("login")} loading={loading} onPress={validate} />

                    {/* Google Sign-In Button */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => handleGoogleSignIn()}
                        disabled={googleLoading}
                    >
                        <View style={styles.googleButtonContent}>
                            {googleLoading ? (
                                <ActivityIndicator size="small" color="#DB4437" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons 
                                        name="google" 
                                        size={20} 
                                        color="#DB4437" 
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>
                                        Continue with Google
                                    </Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>

                    <Text onPress={() => navigation.navigate(ROUTES.getting_started)} style={{ color: COLORS.black, fontWeight: 'bold', textAlign: 'center', fontSize: 16, marginTop: 20 }}>
                        {t("dont_have_account")}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Signin

const styles = StyleSheet.create({
    header: {
        flex: 0,
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 20
    },
    text_header: {
        color: COLORS.dark,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 30
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        color: '#3c4043',
        fontSize: 16,
        fontWeight: '500',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
});