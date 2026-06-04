
// hooks/useNotification.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useState, useEffect, useCallback } from 'react';
import { AppState, Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userService from '../services/connection/userService';
import { navigate } from './navigationService';
import ROUTES from '../constants/routes';

// Enhanced debug logger
const debugLog = async (type, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    message,
    data,
    source: 'useNotificationHook',
    platform: Platform.OS,
    device: Device.deviceName || 'Unknown',
    isDevice: Device.isDevice
  };
  
  console.log(`🔔 [${type.toUpperCase()}] ${message}`, data ? data : '');
  
  try {
    const logs = await AsyncStorage.getItem('notificationDebugLogs');
    const existingLogs = logs ? JSON.parse(logs) : [];
    existingLogs.push(logEntry);
    if (existingLogs.length > 100) existingLogs.shift();
    await AsyncStorage.setItem('notificationDebugLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.log('Failed to save debug log:', error);
  }
};

export function useNotification() {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [appState, setAppState] = useState(AppState.currentState);

    // ========== CORE NOTIFICATION HANDLERS ==========
    const handleNotification = useCallback((notification) => {
        debugLog('info', '📲 Notification received in foreground', {
            title: notification?.request?.content?.title,
            body: notification?.request?.content?.body,
            data: notification?.request?.content?.data,
            appState: AppState.currentState
        });
    }, []);

    const handleNotificationResponse = useCallback((response) => {
        console.log('🔥🔥🔥 NOTIFICATION RESPONSE RECEIVED 🔥🔥🔥', response);
        debugLog('info', '🎯 NOTIFICATION TAPPED - Response received', {
            hasResponse: !!response,
            hasNotification: !!response?.notification,
            hasRequest: !!response?.notification?.request,
            appState: AppState.currentState
        });

        const data = response?.notification?.request?.content?.data;
        debugLog('info', '📋 Raw notification data extracted', data);

        if (data) {
            debugLog('success', '✅ Notification data found', {
                screen: data.screen,
                params: data.params,
                dataStructure: Object.keys(data)
            });

            if (data.screen === 'Review & Confirm Schedule' || data.screen === 'cleaner_schedule_review' || 
                data.screen === 'Schedule Requests' || data.screen === 'host_schedule_request' || 
                data.screen === 'Schedule Info' || data.screen ==='cleaner_schedule_details_view' || 
                data.screen === 'Payment Receipt' || data.screen ==='host_receipt_details') {
                debugLog('highlight', '🚀 SCHEDULE NOTIFICATION DETECTED', {
                    screen: data.screen,
                    params: data.params,
                    hasScheduleId: !!data.params?.scheduleId,
                    hasRequestId: !!data.params?.requestId,
                    hasHostId: !!data.params?.hostId
                });
            }

            const isWebOriginated = data.source === 'web' || data.fromWeb === true;
            
            if (isWebOriginated && data.deepLinkUrl) {
                debugLog('info', '🌐 Web-originated notification, using deep linking', {
                    deepLinkUrl: data.deepLinkUrl
                });
                handleDeepLinkNavigation(data.deepLinkUrl, data);
            } else {
                debugLog('info', '📱 Push notification, using direct navigation');
                handleDirectNavigation(data);
            }
        } else {
            debugLog('error', '❌ No data found in notification response');
        }
    }, []);

    // Track app state
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            setAppState(nextAppState);
            debugLog('info', 'App state changed', { from: appState, to: nextAppState });
        });

        return () => {
            subscription.remove();
        };
    }, [appState]);

    // ========== FIXED PUSH NOTIFICATION FUNCTIONS ==========
    const generateNewPushToken = async () => {
        try {
            debugLog('info', '🔄 Starting push token generation', {
                platform: Platform.OS,
                isDevice: Device.isDevice,
                deviceName: Device.deviceName,
                osVersion: Device.osVersion,
                appBuild: Constants.expoConfig?.version || 'unknown'
            });

            // CRITICAL: Check if running on physical device
            if (!Device.isDevice) {
                debugLog('warning', '❌ Cannot get push token on simulator/emulator');
                // Return a dummy token for simulator testing
                if (__DEV__) {
                    debugLog('info', 'Returning dummy token for simulator testing');
                    return 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
                }
                Alert.alert(
                    'Push Notifications',
                    'Push notifications work only on physical devices. Please test on a real device.',
                    [{ text: 'OK' }]
                );
                return null;
            }

            // Setup Android notification channel (required for Android 8+)
            if (Platform.OS === 'android') {
                try {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#FF231F7C',
                        showBadge: true,
                        enableVibrate: true,
                        enableLights: true,
                    });
                    debugLog('info', '✅ Android notification channel configured');
                } catch (channelError) {
                    debugLog('warning', 'Could not set notification channel', { error: channelError.message });
                }
            }

            // Check existing permissions first
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            debugLog('info', 'Current permission status', { status: existingStatus });

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                debugLog('info', 'Requesting notification permissions...');
                const { status } = await Notifications.requestPermissionsAsync({
                    ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                        allowAnnouncements: true,
                    },
                });
                finalStatus = status;
                debugLog('info', 'Permission request result', { newStatus: status });
            }

            if (finalStatus !== 'granted') {
                debugLog('error', '❌ Notification permission denied', { finalStatus });
                
                if (Platform.OS === 'ios' && finalStatus === 'undetermined') {
                    // iOS specific: Show custom alert
                    Alert.alert(
                        'Enable Notifications',
                        'Please enable notifications to get important updates about your schedules and messages.',
                        [
                            { text: 'Later', style: 'cancel' },
                            { 
                                text: 'Enable', 
                                onPress: () => {
                                    // Try requesting again
                                    Notifications.requestPermissionsAsync();
                                } 
                            }
                        ]
                    );
                } else {
                    Alert.alert(
                        'Permission Required',
                        'Push notifications permission is required. Please enable it in Settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                                text: 'Open Settings', 
                                onPress: () => {
                                    if (Platform.OS === 'ios') {
                                        Linking.openURL('app-settings:');
                                    } else {
                                        Linking.openSettings();
                                    }
                                }
                            }
                        ]
                    );
                }
                return null;
            }

            debugLog('success', '✅ Notification permission granted');

            // Get projectId - IMPORTANT: Your app.json has the correct projectId
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            
            debugLog('info', 'Project ID lookup', {
                hasExpoConfig: !!Constants.expoConfig,
                hasExtra: !!Constants.expoConfig?.extra,
                hasEas: !!Constants.expoConfig?.extra?.eas,
                projectIdFound: !!projectId,
                projectId: projectId || 'Not found'
            });

            if (!projectId) {
                debugLog('error', '❌ No projectId found in app configuration');
                // Fallback to your actual project ID from app.json
                const fallbackProjectId = "0a73df93-2859-4fa7-80e0-5e306a76fcc1";
                debugLog('warning', 'Using fallback projectId', { fallbackProjectId });
                
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: fallbackProjectId
                });
                
                debugLog('success', '✅ Token generated with fallback projectId', { 
                    tokenLength: tokenData.data.length,
                    tokenPreview: tokenData.data.substring(0, 30) + '...'
                });
                
                return tokenData.data;
            }

            debugLog('info', 'Generating push token with projectId', { 
                projectId: projectId,
                platform: Platform.OS
            });
            
            // Generate the push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: projectId
            });
            
            debugLog('success', '✅ Token generated successfully', { 
                tokenLength: tokenData.data.length,
                tokenPreview: tokenData.data.substring(0, 30) + '...',
                fullToken: tokenData.data // For debugging
            });
            
            return tokenData.data;
            
        } catch (error) {
            debugLog('error', '❌ Error generating push token', { 
                error: error.message,
                errorCode: error.code,
                platform: Platform.OS,
                isDevice: Device.isDevice,
                stack: error.stack
            });
            
            // Check for specific errors
            if (error.message.includes('projectId') || error.code === 'E_INVALID_PUSH_TOKEN') {
                Alert.alert(
                    'Configuration Error',
                    'Push notification configuration error. Please make sure:\n1. Project ID is correctly set\n2. App is properly built with EAS\n3. Using a physical device',
                    [
                        { text: 'OK' },
                        { 
                            text: 'View Logs', 
                            onPress: () => {
                                console.log('🔍 Debug info:', {
                                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                                    appId: Constants.expoConfig?.extra?.eas?.appId,
                                    easConfig: Constants.expoConfig?.extra?.eas
                                });
                            }
                        }
                    ]
                );
            } else if (error.message.includes('permission') || error.code === 'E_NOTIFICATIONS_PERMISSION_REQUIRED') {
                Alert.alert(
                    'Permission Error',
                    'Please enable notification permissions in your device settings.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Token Generation Failed',
                    `Error: ${error.message}`,
                    [{ text: 'OK' }]
                );
            }
            
            return null;
        }
    };

    const sendTokenToBackend = async (token, userId) => {
        try {
            const deviceInfo = {
                deviceName: Device.deviceName || 'Unknown Device',
                osType: Device.osName || 'Unknown OS',
                osVersion: Device.osVersion || 'Unknown Version',
                platform: Platform.OS,
                modelName: Device.modelName || 'Unknown Model',
                deviceType: Device.deviceType || 'Unknown',
                token: token,
                userId: userId,
                projectId: Constants.expoConfig?.extra?.eas?.projectId || '0a73df93-2859-4fa7-80e0-5e306a76fcc1',
                appVersion: Constants.expoConfig?.version || '1.0.0',
                buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1'
            };

            debugLog('info', '📤 Sending device info to backend', {
                deviceName: deviceInfo.deviceName,
                osType: deviceInfo.osType,
                platform: deviceInfo.platform,
                userId: deviceInfo.userId,
                tokenLength: token.length,
                projectId: deviceInfo.projectId
            });

            console.log('📤 Sending token to backend:', {
                token: token.substring(0, 30) + '...',
                userId: userId,
                deviceInfo: deviceInfo
            });

            const response = await userService.storeToken(deviceInfo);
            
            debugLog('success', '✅ Token successfully sent to backend', { 
                responseStatus: response.status,
                responseData: response.data 
            });
            
            console.log('✅ Token backend response:', response.data);
            
            return response.data;
            
        } catch (error) {
            debugLog('error', '❌ Error sending token to backend', { 
                error: error.message || error,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            
            // Don't throw error - we still want to save token locally even if backend fails
            console.warn('Backend token storage failed, but token saved locally:', error.message);
            return { success: false, error: error.message };
        }
    };

    const registerForPushNotificationsAsync = async (userId) => {
        debugLog('info', '=== PUSH NOTIFICATION REGISTRATION STARTED ===', {
            userId,
            platform: Platform.OS,
            isDevice: Device.isDevice,
            appVersion: Constants.expoConfig?.version,
            timestamp: new Date().toISOString()
        });
        
        if (!userId) {
            debugLog('error', '❌ User ID is required for push notifications');
            setError('User ID is required.');
            Alert.alert('Error', 'User ID is required for push notifications.');
            return null;
        }
        
        try {
            setLoading(true);
            setError(null);

            // CRITICAL CHECK: Physical device requirement
            if (!Device.isDevice) {
                const message = 'Push notifications only work on physical devices.';
                debugLog('warning', message);
                
                // For simulator, return a dummy token for testing
                if (__DEV__) {
                    const dummyToken = 'ExponentPushToken[Simulator-Test-Token-123]';
                    await AsyncStorage.setItem('expoPushToken', dummyToken);
                    setExpoPushToken(dummyToken);
                    debugLog('info', 'Simulator: Using dummy token for testing');
                    
                    // Alert.alert(
                    //     'Simulator Detected',
                    //     'Using dummy token for testing. Use physical device for real push notifications.',
                    //     [{ text: 'OK' }]
                    // );
                    
                    return dummyToken;
                }
                
                Alert.alert('Device Required', message);
                setError(message);
                return null;
            }

            debugLog('info', '🚀 Generating new push token...');
            const token = await generateNewPushToken();
            
            debugLog('info', 'Token generation result', { 
                hasToken: !!token,
                tokenLength: token?.length || 0,
                tokenPreview: token ? token.substring(0, 30) + '...' : 'No token'
            });

            if (token) {
                // Store token locally
                await AsyncStorage.setItem('expoPushToken', token);
                await AsyncStorage.setItem('pushTokenTimestamp', new Date().toISOString());
                await AsyncStorage.setItem('pushTokenUserId', userId);
                
                debugLog('info', '✅ Token stored in AsyncStorage', {
                    storageKeys: await AsyncStorage.getAllKeys()
                });

                // Send to backend (but don't fail if backend is down)
                try {
                    await sendTokenToBackend(token, userId);
                } catch (backendError) {
                    debugLog('warning', 'Backend storage failed, but continuing', {
                        error: backendError.message
                    });
                }

                // Update state
                setExpoPushToken(token);
                
                debugLog('success', '🎉 Push notification registration successful', { 
                    token: token.substring(0, 20) + '...',
                    userId,
                    timestamp: new Date().toISOString(),
                    platform: Platform.OS
                });

                // Send a local test notification to verify everything works
                // await sendLocalTestNotification();
                
                // Also log to console for easy debugging
                console.log('🎯 PUSH TOKEN GENERATED:', token);
                console.log('📱 Device:', Device.deviceName);
                console.log('📱 Platform:', Platform.OS);
                console.log('📱 Project ID:', Constants.expoConfig?.extra?.eas?.projectId);
                
                return token;
                
            } else {
                const errorMsg = 'Failed to generate push token. Please check permissions and try again.';
                debugLog('error', errorMsg);
                
                // Run diagnostics
                const diagnostics = await runPushNotificationDiagnostics();
                debugLog('info', 'Failed registration diagnostics', diagnostics);
                
                throw new Error(errorMsg);
            }
            
        } catch (error) {
            debugLog('error', '❌ Push notification registration failed', { 
                error: error.message,
                userId,
                platform: Platform.OS,
                isDevice: Device.isDevice,
                stack: error.stack
            });
            
            setError(error.message || 'Failed to register for push notifications');
            
            Alert.alert(
                'Registration Failed',
                `${error.message || 'Unable to register for push notifications.'}\n\nPlease ensure:\n1. Device has internet connection\n2. Notification permissions are granted\n3. Using a physical device`,
                [
                    { text: 'OK' },
                    { 
                        text: 'View Logs', 
                        onPress: () => viewDebugLogs()
                    }
                ]
            );
            
            return null;
            
        } finally {
            setLoading(false);
        }
    };

    // ========== NAVIGATION HELPERS ==========
    const screenNameToRouteMap = {
        'Review & Confirm Schedule': ROUTES.cleaner_schedule_review,
        'Schedule Requests': ROUTES.host_schedule_request,
        'Schedule Resquests': ROUTES.host_schedule_request,
        'Schedule Info': ROUTES.cleaner_schedule_details_view,
        'Payment Receipt': ROUTES.host_receipt_details,
        'All Requests': ROUTES.cleaner_all_requests,
        'Clock-In': ROUTES.cleaner_clock_in,
        'Clock In': ROUTES.cleaner_clock_in,
        'Attach Task Photos': ROUTES.cleaner_attach_task_photos,
        'Schedule Details': ROUTES.host_schedule_details,
        'Confirm Request': ROUTES.host_confirm,
        'Task Progress': ROUTES.host_task_progress,
        'ChatConversation': ROUTES.chat_conversation,
        'CleanChatConversation' : ROUTES.cleaner_chat_conversation,
        // 'Chat': ROUTES.chat_conversation,
        'Notification': ROUTES.notification,
        'Notifications': ROUTES.notification,
        'Home': ROUTES.cleaner_dashboard,
        'Dashboard': ROUTES.cleaner_dashboard,
        'Cleaner Dashboard': ROUTES.cleaner_dashboard,
        'Host Dashboard': ROUTES.host_dashboard,
        'Profile': ROUTES.profile,
        'Settings': ROUTES.settings,
    };
    
    const screenKeyToRouteMap = {
        'cleaner_schedule_review': ROUTES.cleaner_schedule_review,
        'host_schedule_request': ROUTES.host_schedule_request,
        'cleaner_schedule_details_view': ROUTES.cleaner_schedule_details_view,
        'host_receipt_details': ROUTES.host_receipt_details,
        'cleaner_all_requests': ROUTES.cleaner_all_requests,
        'cleaner_clock_in': ROUTES.cleaner_clock_in,
        'cleaner_attach_task_photos': ROUTES.cleaner_attach_task_photos,
        'host_schedule_details': ROUTES.host_schedule_details,
        'host_confirm': ROUTES.host_confirm,
        'host_task_progress': ROUTES.host_task_progress,
        'chat_conversation': ROUTES.chat_conversation,
        'notification': ROUTES.notification,
        'cleaner_dashboard': ROUTES.cleaner_dashboard,
        'host_dashboard': ROUTES.host_dashboard,
        'profile': ROUTES.profile,
        'settings': ROUTES.settings,
    };

    const getUserType = async () => {
        try {
            const userType = await AsyncStorage.getItem('userType');
            return userType || 'cleaner';
        } catch (error) {
            return 'cleaner';
        }
    };

    const handleDirectNavigation = async (data) => {
        let { screen, params } = data;
        
        debugLog('info', '🎯 DIRECT NAVIGATION STARTED', {
            receivedScreen: screen,
            params,
            hasScreen: !!screen,
            hasParams: !!params,
            appState: AppState.currentState
        });
    
        if (screen) {
            screen = screen.trim();
            let actualScreenName = null;
            
            // 1. Try exact match in screenNameToRouteMap
            actualScreenName = screenNameToRouteMap[screen];
            
            // 2. Try exact match in screenKeyToRouteMap
            if (!actualScreenName) {
                actualScreenName = screenKeyToRouteMap[screen];
            }
            
            // 3. Try case-insensitive match
            if (!actualScreenName) {
                const lowerScreen = screen.toLowerCase();
                for (const [key, route] of Object.entries(screenNameToRouteMap)) {
                    if (key.toLowerCase() === lowerScreen) {
                        actualScreenName = route;
                        break;
                    }
                }
            }
            
            // 4. Try partial match
            if (!actualScreenName) {
                const searchTerms = ['schedule', 'request', 'chat', 'confirm', 'task', 'clock'];
                for (const term of searchTerms) {
                    if (screen.toLowerCase().includes(term)) {
                        for (const [key, route] of Object.entries(screenNameToRouteMap)) {
                            if (key.toLowerCase().includes(term)) {
                                actualScreenName = route;
                                debugLog('info', `Partial match found for ${screen} → ${key}`);
                                break;
                            }
                        }
                        if (actualScreenName) break;
                    }
                }
            }
            
            // 5. If still no match, use the received screen as fallback
            if (!actualScreenName) {
                actualScreenName = screen;
                debugLog('warning', `No mapping found for screen: ${screen}, using direct navigation`);
            }
            
            debugLog('info', '🔄 Screen mapping result', {
                receivedScreen: screen,
                actualScreenName,
                mappingSuccess: actualScreenName !== screen
            });
    
            if (screen.includes('Schedule') || screen.includes('Request')) {
                debugLog('highlight', '🚀 SCHEDULE/REQUEST NOTIFICATION', {
                    originalScreen: screen,
                    mappedScreen: actualScreenName,
                    params: params,
                    navigationReady: true
                });
            }
    
            try {
                debugLog('success', `📱 Navigating to: ${actualScreenName}`, { 
                    originalScreen: screen,
                    params: params,
                    navigationMethod: 'direct',
                    timestamp: new Date().toISOString()
                });
                
                navigate(actualScreenName, params);
                
                debugLog('success', `✅ Navigation command sent`, {
                    screen: actualScreenName,
                    paramsCount: params ? Object.keys(params).length : 0,
                    navigationTime: new Date().toISOString()
                });
            } catch (navigationError) {
                debugLog('error', 'Navigation failed', {
                    screen: actualScreenName,
                    originalScreen: screen,
                    error: navigationError.message
                });
                
                const userType = await getUserType();
                const fallbackScreen = userType === 'cleaner' 
                    ? ROUTES.cleaner_dashboard 
                    : ROUTES.host_dashboard;
                
                debugLog('warning', `Using ultimate fallback to: ${fallbackScreen}`);
                navigate(fallbackScreen);
            }
        } else {
            debugLog('error', '❌ No screen specified in notification data');
            const userType = await getUserType();
            const fallbackScreen = userType === 'cleaner' 
                ? ROUTES.cleaner_dashboard 
                : ROUTES.host_dashboard;
            navigate(fallbackScreen);
        }
    };

    const handleDeepLinkNavigation = async (url, data) => {
        debugLog('info', '🔗 Handling deep link navigation', { 
            url, 
            appState: AppState.currentState,
            source: 'web-originated'
        });

        try {
            const canOpen = await Linking.canOpenURL(url);
            debugLog('info', 'Can open URL check', { canOpen, url });

            if (canOpen) {
                debugLog('info', 'Opening URL via Linking.openURL...');
                await Linking.openURL(url);
                debugLog('success', 'Deep link URL opened successfully', { 
                    url,
                    appState: AppState.currentState 
                });
            } else {
                debugLog('error', 'Cannot open URL, falling back to direct navigation', { url });
                handleDirectNavigation(data);
            }
        } catch (error) {
            debugLog('error', 'Error in deep link navigation', { 
                error: error.message,
                url 
            });
            debugLog('info', 'Falling back to direct navigation...');
            handleDirectNavigation(data);
        }
    };

    // ========== DIAGNOSTIC & UTILITY FUNCTIONS ==========
    const runPushNotificationDiagnostics = async () => {
        debugLog('info', '🔍 RUNNING PUSH NOTIFICATION DIAGNOSTICS');
        
        const diagnostics = {
            timestamp: new Date().toISOString(),
            platform: Platform.OS,
            isDevice: Device.isDevice,
            deviceName: Device.deviceName,
            osName: Device.osName,
            osVersion: Device.osVersion,
            appState: AppState.currentState,
            appVersion: Constants.expoConfig?.version,
            runtimeVersion: Constants.expoConfig?.runtimeVersion,
            hasConstants: !!Constants.expoConfig,
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
            appId: Constants.expoConfig?.extra?.eas?.appId,
            permissions: null,
            existingToken: null,
            storedUserId: null,
            issues: []
        };

        try {
            // Check stored token
            const existingToken = await AsyncStorage.getItem('expoPushToken');
            diagnostics.existingToken = existingToken ? `${existingToken.substring(0, 20)}...` : null;
            
            // Check stored user ID
            diagnostics.storedUserId = await AsyncStorage.getItem('pushTokenUserId');

            // Check permissions
            const { status } = await Notifications.getPermissionsAsync();
            diagnostics.permissions = status;
            
            if (status !== 'granted') {
                diagnostics.issues.push(`Notification permission not granted: ${status}`);
            }

            // Check project configuration
            if (!diagnostics.projectId) {
                diagnostics.issues.push('No projectId found in app configuration');
            } else if (diagnostics.projectId !== "0a73df93-2859-4fa7-80e0-5e306a76fcc1") {
                diagnostics.issues.push(`Project ID mismatch: ${diagnostics.projectId} (expected: 0a73df93-2859-4fa7-80e0-5e306a76fcc1)`);
            }

            // Check device
            if (!diagnostics.isDevice) {
                diagnostics.issues.push('Not running on a physical device');
            }

            debugLog('info', 'Diagnostics completed', diagnostics);
            
        } catch (error) {
            diagnostics.issues.push(`Diagnostic error: ${error.message}`);
            debugLog('error', 'Diagnostics failed', { error: error.message });
        }

        return diagnostics;
    };

    const sendLocalTestNotification = async () => {
        try {
            debugLog('info', 'Sending local test notification...');
            
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '✅ Push Test Successful',
                    body: 'Push notifications are working correctly!',
                    data: { 
                        screen: 'cleaner_dashboard',
                        params: { test: true },
                        source: 'local_test'
                    },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: { seconds: 1 },
            });
            
            debugLog('success', 'Local test notification sent');
            
        } catch (error) {
            debugLog('error', 'Failed to send local test notification', { error: error.message });
        }
    };

    const handleInitialNotification = async () => {
        try {
            debugLog('info', 'Checking for initial notification...');
            const initialNotification = await Notifications.getLastNotificationResponseAsync();
            
            if (initialNotification) {
                debugLog('success', '📱 App was opened from notification', {
                    hasData: !!initialNotification?.notification?.request?.content?.data,
                    appState: 'initial',
                    notificationContent: initialNotification?.notification?.request?.content
                });
                
                setTimeout(() => {
                    debugLog('info', 'Processing initial notification after delay...');
                    handleNotificationResponse(initialNotification);
                }, 1500);
            } else {
                debugLog('info', 'No initial notification found');
            }
        } catch (error) {
            debugLog('error', 'Error handling initial notification', { 
                error: error.message,
                stack: error.stack
            });
        }
    };

    // ========== DEBUG FUNCTIONS ==========
    const viewDebugLogs = async () => {
        try {
            const logs = await AsyncStorage.getItem('notificationDebugLogs');
            const parsedLogs = logs ? JSON.parse(logs) : [];
            
            // Create a summary
            const summary = {
                total: parsedLogs.length,
                errors: parsedLogs.filter(log => log.type === 'error').length,
                successes: parsedLogs.filter(log => log.type === 'success').length,
                warnings: parsedLogs.filter(log => log.type === 'warning').length,
                last10: parsedLogs.slice(-10).map(log => ({
                    time: log.timestamp,
                    type: log.type,
                    message: log.message,
                    data: log.data
                }))
            };
            
            // Log to console
            console.log('📊 NOTIFICATION DEBUG LOGS SUMMARY:', summary);
            console.log('📋 FULL LOGS:', parsedLogs);
            
            // Show alert with key info
            Alert.alert(
                'Debug Logs',
                `Total: ${summary.total}\n✅ Successes: ${summary.successes}\n❌ Errors: ${summary.errors}\n⚠️ Warnings: ${summary.warnings}\n\nCheck console for full logs.`,
                [
                    { text: 'OK' },
                    { 
                        text: 'Copy Latest Token', 
                        onPress: async () => {
                            const token = await AsyncStorage.getItem('expoPushToken');
                            if (token) {
                                console.log('📋 Latest Token:', token);
                                Alert.alert('Token Copied', 'Check console for token');
                            }
                        }
                    }
                ]
            );
            
            return parsedLogs;
        } catch (error) {
            console.error('Error reading debug logs:', error);
            return [];
        }
    };

    const clearDebugLogs = async () => {
        try {
            await AsyncStorage.removeItem('notificationDebugLogs');
            debugLog('info', 'Debug logs cleared by user');
            console.log('🗑️ Debug logs cleared');
            Alert.alert('Success', 'Debug logs cleared');
        } catch (error) {
            console.error('Error clearing debug logs:', error);
        }
    };

    const getDebugLogsCount = async () => {
        try {
            const logs = await AsyncStorage.getItem('notificationDebugLogs');
            const parsedLogs = logs ? JSON.parse(logs) : [];
            return parsedLogs.length;
        } catch (error) {
            console.error('Error getting logs count:', error);
            return 0;
        }
    };

    // ========== TEST FUNCTIONS ==========
    const getTestToken = async () => {
        try {
            setLoading(true);
            debugLog('info', '=== MANUAL TOKEN TEST STARTED ===');
            
            const diagnostics = await runPushNotificationDiagnostics();
            console.log('🔍 Diagnostics:', diagnostics);
            
            if (!Device.isDevice && !__DEV__) {
                Alert.alert(
                    'Simulator Detected',
                    'Push tokens require physical devices for real testing.',
                    [{ text: 'OK' }]
                );
                return null;
            }

            const token = await generateNewPushToken();
            
            if (token) {
                setExpoPushToken(token);
                
                debugLog('success', 'Manual test token generated', { 
                    token: token.substring(0, 30) + '...',
                    diagnostics
                });
                
                // Alert.alert(
                //     'Test Token Generated',
                //     `Token generated successfully!\n\nLength: ${token.length} characters\n\nCheck console for full token and diagnostics.`,
                //     [
                //         { 
                //             text: 'View in Console', 
                //             onPress: () => {
                //                 console.log('🎯 FULL TEST TOKEN:', token);
                //                 console.log('🔍 DIAGNOSTICS:', diagnostics);
                //             }
                //         },
                //         { text: 'OK' }
                //     ]
                // );
                
                return token;
            } else {
                Alert.alert('Error', 'Failed to generate test token. Check diagnostics in console.');
            }
        } catch (error) {
            debugLog('error', 'Error getting test token', { error: error.message });
            Alert.alert('Error', `Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async (screen = 'cleaner_schedule_review', params = {}) => {
        try {
            const testParams = {
                scheduleId: "6923d418b5c829ae8cb52670",
                requestId: "6923d545dfeb9ec7850247b0", 
                hostId: "68844853b4c35a50a4de2830",
                ...params
            };

            debugLog('info', 'Sending test notification', { 
                screen, 
                actualRouteName: ROUTES[screen] || screen,
                params: testParams,
                testType: 'manual'
            });
            
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Test Navigation",
                    body: `Testing navigation to ${ROUTES[screen] || screen}`,
                    data: { 
                        screen: screen,
                        params: testParams
                    },
                    sound: true,
                },
                trigger: null,
            });
            
            debugLog('success', `✅ Test notification sent for screen: ${screen}`, {
                screenKey: screen,
                actualRouteName: ROUTES[screen] || screen,
                params: testParams,
                notificationType: 'test'
            });
            
            Alert.alert(
                'Test Sent',
                `Test notification sent for: ${ROUTES[screen] || screen}\nCheck logs for details.`,
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            debugLog('error', 'Failed to send test notification', { 
                error: error.message,
                screen,
                actualRouteName: ROUTES[screen] || screen,
                stack: error.stack
            });
            Alert.alert('Error', `Failed to send test: ${error.message}`);
        }
    };

    // ========== MAIN SETUP EFFECT ==========
    // useEffect(() => {
    //     debugLog('info', 'useNotification hook initialized', {
    //         appState: AppState.currentState,
    //         platform: Platform.OS,
    //         isDevice: Device.isDevice,
    //         timestamp: new Date().toISOString(),
    //         projectId: Constants.expoConfig?.extra?.eas?.projectId
    //     });
        
    //     // Setup notification handlers
    //     Notifications.setNotificationHandler({
    //         handleNotification: async () => ({
    //             shouldShowAlert: true,
    //             shouldPlaySound: true,
    //             shouldSetBadge: true,
    //         }),
    //     });

    //     // Handle initial notification
    //     handleInitialNotification();

    //     // Listeners for notification events
    //     const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
    //     const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    //     debugLog('info', 'Notification listeners added', {
    //         hasNotificationListener: !!notificationListener,
    //         hasResponseListener: !!responseListener,
    //         device: Device.deviceName
    //     });

    //     // Clean up listeners on unmount
    //     return () => {
    //         if (notificationListener) {
    //             Notifications.removeNotificationSubscription(notificationListener);
    //         }
    //         if (responseListener) {
    //             Notifications.removeNotificationSubscription(responseListener);
    //         }
    //         debugLog('info', 'Notification listeners cleaned up');
    //     };
    // }, [handleNotification, handleNotificationResponse]);

    useEffect(() => {
        debugLog('info', '🔊 Setting up notification listeners');
        
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      
        const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
        const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
      
        debugLog('success', '✅ Listeners added');
      
        // Handle initial notification (already there)
        handleInitialNotification();
      
        return () => {
          debugLog('info', '🧹 Removing listeners');
          Notifications.removeNotificationSubscription(notificationListener);
          Notifications.removeNotificationSubscription(responseListener);
        };
      }, [handleNotification, handleNotificationResponse]);

    // ========== RETURN VALUES ==========
    return {
        expoPushToken,
        registerForPushNotificationsAsync,
        getTestToken,
        sendTestNotification,
        runPushNotificationDiagnostics,
        handleNotificationResponse,
        viewDebugLogs,
        clearDebugLogs,
        getDebugLogsCount,
        loading,
        error,
        appState,
        platform: Platform.OS,
        isDevice: Device.isDevice,
        // Quick check functions
        checkExistingToken: async () => {
            const token = await AsyncStorage.getItem('expoPushToken');
            return token;
        },
        // Force re-registration
        reRegisterPushNotifications: async (userId) => {
            await AsyncStorage.removeItem('expoPushToken');
            return registerForPushNotificationsAsync(userId);
        }
    };
}