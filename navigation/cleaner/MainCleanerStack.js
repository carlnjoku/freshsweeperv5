import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import AccountVerificationGate from '../../screens/cleaner/AccountVerification/AccountVerificationGate';
import ScheduleDetailView from '../../screens/cleaner/ScheduleDetailsView';
import SchedulePreview from '../../screens/cleaner/SchedulePreview';
import AllRequests from '../../screens/cleaner/AllRequests';
import ChangePassword from '../../screens/sharedscreen/ChangePassword';
import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
import ClockIn from '../../screens/cleaner/ScheduleTabs/ClockIn';
import Tasks from '../../screens/cleaner/TaskPhotos/Tasks';
import PaymentsHistoryCleaner from '../../screens/cleaner/Payments/PaymentHistoryCleaner';
import PropertyPreview from '../../screens/cleaner/PropertyPreview';
import InviteGate from '../../screens/public/IniteGate';
import Notification from '../../components/shared/Notification';

export default function MainCleanerStack() {

    const Stack = createStackNavigator()
  
    const { isVerified, isLoading, userToken, currentUser } = useContext(AuthContext);
    const [isNavigationReady, setIsNavigationReady] = useState(false);
  
    // Wait for auth to load before rendering navigator
    useEffect(() => {
      if (!isLoading) {
        // Small delay to ensure navigation is ready
        const timer = setTimeout(() => {
          setIsNavigationReady(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isLoading]);
  
    // Show loading screen while checking auth
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }
  
    // If no user token, redirect to login
    if (!userToken) {
      // You might want to navigate to login here
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Redirecting to login...</Text>
        </View>
      );
    }
  
    // If navigation isn't ready yet
    if (!isNavigationReady) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Preparing navigation...</Text>
        </View>
      );
    }
  
    console.log('Cleaner Stack - User:', {
      userId: currentUser?._id,
      userType: currentUser?.userType,
      isVerified,
      hasToken: !!userToken
    });
      
    return (
      
      
      <Stack.Navigator 
          screenOptions={{
            headerTintColor:COLORS.white,
            headerBackTitleVisible:false,
            headerBackTitle: '',
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
          }} 
          initialRouteName={isVerified ? ROUTES.cleaner_dashboard : ROUTES.account_verification_gate}
      >
  
          {!isVerified ? (
            <>
            <Stack.Screen 
              name={ROUTES.account_verification_gate} 
              component={AccountVerificationGate} 
            />
            <Stack.Screen 
              name={ROUTES.account_verification_gate_id_verify} 
              component={AccountVerificationGate} 
            />
            </>
            ) : (
            <Stack.Screen 
              name={ROUTES.cleaner_dashboard}
              component={DrawerNavigator}
              options = {{
                headerShown:false
            }}
          />
          )}
       

       <Stack.Screen 
        name={ROUTES.cleaner_invite_gate}
        component={InviteGate}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent going back during auto sign-in
        }}
      />
        
       <Stack.Screen 
        name={ROUTES.cleaner_schedule_details_view}
        component={ScheduleDetailView} 
        
        options={({route}) => ({
            headerShown:true,
            headerTintColor: COLORS.white,
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            
            title: "Schedule Details",
            headerTintColor:COLORS.white,
            headerBackTitleVisible:false,
            headerStyle:{
                backgroundColor:COLORS.primary
            }
          })}
      />

      <Stack.Screen 
          name={ROUTES.cleaner_schedule_review}
          component={SchedulePreview} 
          
          options={({route}) => ({
            headerShown:true,
            headerTintColor:COLORS.gray,
            headerBackTitleVisible:false,
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
        })}
      />
      <Stack.Screen 
          name={ROUTES.cleaner_property_preview}
          component={PropertyPreview} 
          
          options={({route}) => ({
            headerShown:true,
            headerTintColor:COLORS.gray,
            headerBackTitleVisible:false,
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
        })}
      />
      <Stack.Screen 
        name={ROUTES.cleaner_change_password}
        component={ChangePassword} 
        
        options={({route}) => ({
            headerShown:true,
            headerTintColor: COLORS.white,
            headerBackTitleVisible: false,
            
            title: "Change Password",
            headerTintColor:COLORS.gray,
            headerBackTitleVisible:false,
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
        })}
      />
      
    <Stack.Screen 
        name={ROUTES.cleaner_change_language}
        component={ChangeLanguage} 
        
        options={({route}) => ({
            headerShown:true,
            headerTintColor: COLORS.white,
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
            title: "Change Language",
            headerTintColor:COLORS.gray,
            headerBackTitleVisible:false,
            
        })}
      />
      <Stack.Screen 
        name={ROUTES.cleaner_all_requests}
        component={AllRequests} 
        
        options={({route}) => ({
            
            //   title: route.params?.title,
            title: "All Requests",
            headerShown:true,
            
            headerTintColor:COLORS.white,
            headerBackTitleVisible:false,
            headerStyle:{
                backgroundColor:COLORS.primary,
            }
            })}
        />

<Stack.Screen 
      name={ROUTES.cleaner_clock_in}
      component={ClockIn} 
      
      options={({route}) => ({
          
        //   title: route.params?.title,
          title: "Clock In",
          headerShown:true,
          
          headerTintColor:COLORS.white,
          headerBackTitleVisible:false,
          headerStyle:{
              backgroundColor:COLORS.primary,
          }
        })}
    /> 

    <Stack.Screen 
        name={ROUTES.cleaner_attach_task_photos}
        component={Tasks} 
        options={({route}) => ({
            headerShown:true,
            headerTintColor: COLORS.gray,
            // headerBackTitleVisible: true,
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
            title: "Active Cleaning Session",
          
            // headerBackTitleVisible:true,
            // headerRight: () => (
            //   <TouchableOpacity onPress={() => navigation.setParams({ menuVisible: true })}>
            //     <MaterialIcons name="more-vert" size={24} color={COLORS.gray} style={{ marginRight: 16 }} />
            //   </TouchableOpacity>
            // ),
        })}
      />

    <Stack.Screen 
        name={ROUTES.cleaner_payment_history}
        component={PaymentsHistoryCleaner} 
        options={({route}) => ({
            
            //   title: route.params?.title,
            title: "Payment History",
            headerShown:true,
            
            headerTintColor:COLORS.white,
            headerBackTitleVisible:false,
            headerStyle:{
                backgroundColor:COLORS.primary,
            }
            })}
        />

<Stack.Screen 
            name={ROUTES.notification}
            component={Notification}
            
            options={({route}) => ({
                headerShown:true,
                headerTintColor: COLORS.white,
                headerBackTitleVisible: false,
                headerBackTitle: '',
                headerStyle: {
                  backgroundColor: COLORS.primary,
                },
                title: "Notifications",

                headerTintColor:COLORS.white,
                headerBackTitleVisible:false,
                headerStyle:{
                    backgroundColor:COLORS.primary
                }
            })}
          />
      </Stack.Navigator>
    )
  }
  
  
  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#666',
    },
  });


  
