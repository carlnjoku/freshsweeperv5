// import React, { useState, useEffect, useContext } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import DrawerNavigator from './DrawerNavigator';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import { AuthContext } from '../../context/AuthContext';
// import AccountVerificationGate from '../../screens/cleaner/AccountVerification/AccountVerificationGate';
// import ScheduleDetailView from '../../screens/cleaner/ScheduleDetailsView';
// import SchedulePreview from '../../screens/cleaner/SchedulePreview';
// import AllRequests from '../../screens/cleaner/AllRequests';
// import ChangePassword from '../../screens/sharedscreen/ChangePassword';
// import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
// import ClockIn from '../../screens/cleaner/ScheduleTabs/ClockIn';
// import Tasks from '../../screens/cleaner/TaskPhotos/Tasks';
// import PaymentsHistoryCleaner from '../../screens/cleaner/Payments/PaymentHistoryCleaner';
// import PropertyPreview from '../../screens/cleaner/PropertyPreview';
// import InviteGate from '../../screens/public/IniteGate';
// import Notification from '../../components/shared/Notification';
// import PropertyGigs from '../../screens/cleaner/PropertyGigs';

// export default function MainCleanerStack() {

//     const Stack = createStackNavigator()
  
//     const { isVerified, isLoading, userToken, currentUser } = useContext(AuthContext);
//     const [isNavigationReady, setIsNavigationReady] = useState(false);
  
//     // Wait for auth to load before rendering navigator
//     useEffect(() => {
//       if (!isLoading) {
//         // Small delay to ensure navigation is ready
//         const timer = setTimeout(() => {
//           setIsNavigationReady(true);
//         }, 100);
//         return () => clearTimeout(timer);
//       }
//     }, [isLoading]);
  
//     // Show loading screen while checking auth
//     if (isLoading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       );
//     }
  
//     // If no user token, redirect to login
//     if (!userToken) {
//       // You might want to navigate to login here
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Redirecting to login...</Text>
//         </View>
//       );
//     }
  
//     // If navigation isn't ready yet
//     if (!isNavigationReady) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Preparing navigation...</Text>
//         </View>
//       );
//     }
  
//     console.log('Cleaner Stack - User:', {
//       userId: currentUser?._id,
//       userType: currentUser?.userType,
//       isVerified,
//       hasToken: !!userToken
//     });
      
//     return (
      
      
//       <Stack.Navigator 
//           screenOptions={{
//             headerTintColor:COLORS.white,
//             headerBackTitleVisible:false,
//             headerBackTitle: '',
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//           }} 
//           initialRouteName={isVerified ? ROUTES.cleaner_dashboard : ROUTES.account_verification_gate}
//       >
  
//           {!isVerified ? (
//             <>
//             <Stack.Screen 
//               name={ROUTES.account_verification_gate} 
//               component={AccountVerificationGate} 
//             />
//             <Stack.Screen 
//               name={ROUTES.account_verification_gate_id_verify} 
//               component={AccountVerificationGate} 
//             />
//             </>
//             ) : (
//             <Stack.Screen 
//               name={ROUTES.cleaner_dashboard}
//               component={DrawerNavigator}
//               options = {{
//                 headerShown:false
//             }}
//           />
//           )}
       

//        <Stack.Screen 
//         name={ROUTES.cleaner_invite_gate}
//         component={InviteGate}
//         options={{
//           headerShown: false,
//           gestureEnabled: false, // Prevent going back during auto sign-in
//         }}
//       />
        
//        <Stack.Screen 
//         name={ROUTES.cleaner_schedule_details_view}
//         component={ScheduleDetailView} 
        
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.white,
//             headerBackTitleVisible: false,
//             headerStyle: {
//               backgroundColor: COLORS.primary,
//             },
            
//             title: "Schedule Details",
//             headerTintColor:COLORS.white,
//             headerBackTitleVisible:false,
//             headerStyle:{
//                 backgroundColor:COLORS.primary
//             }
//           })}
//       />

//       <Stack.Screen 
//           name={ROUTES.cleaner_schedule_review}
//           component={SchedulePreview} 
          
//           options={({route}) => ({
//             headerShown:true,
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//         })}
//       />
//       <Stack.Screen 
//           name={ROUTES.cleaner_property_preview}
//           component={PropertyPreview} 
          
//           options={({route}) => ({
//             headerShown:true,
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//         })}
//       />
//       <Stack.Screen 
//         name={ROUTES.cleaner_property_gigs} 
//         component={PropertyGigs} 
//         options={{
//           headerShown:true,
//             title:"Property Gigs",
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:true,
//             headerStyle:{
//               backgroundColor:COLORS.white
//             },
            
//             headerTitleStyle: {
//               fontWeight: '600',
//               fontSize:18,
//               color:COLORS.gray,
//             },
//             drawerIcon:({focus, color, size}) => (
//               <DrawerIcon
//                 IconComponent={MaterialCommunityIcons}
//                 name="credit-card-outline"
//                 color={color}
//                 size={20}
//               />
//             )
//         }}
//       />
//       <Stack.Screen 
//         name={ROUTES.cleaner_change_password}
//         component={ChangePassword} 
        
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.white,
//             headerBackTitleVisible: false,
            
//             title: "Change Password",
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//         })}
//       />
      
//     <Stack.Screen 
//         name={ROUTES.cleaner_change_language}
//         component={ChangeLanguage} 
        
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.white,
//             headerBackTitleVisible: false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//             title: "Change Language",
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
            
//         })}
//       />
//       <Stack.Screen 
//         name={ROUTES.cleaner_all_requests}
//         component={AllRequests} 
        
//         options={({route}) => ({
            
//             //   title: route.params?.title,
//             title: "All Requests",
//             headerShown:true,
            
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle:{
//                 backgroundColor:COLORS.white,
//             }
//             })}
//         />

// <Stack.Screen 
//       name={ROUTES.cleaner_clock_in}
//       component={ClockIn} 
      
//       options={({route}) => ({
          
//         //   title: route.params?.title,
//           title: "Clock In",
//           headerShown:true,
          
//           headerTintColor:COLORS.white,
//           headerBackTitleVisible:false,
//           headerStyle:{
//               backgroundColor:COLORS.primary,
//           }
//         })}
//     /> 

//     <Stack.Screen 
//         name={ROUTES.cleaner_attach_task_photos}
//         component={Tasks} 
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.gray,
//             // headerBackTitleVisible: true,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//             title: "Active Cleaning Session",
          
//             // headerBackTitleVisible:true,
//             // headerRight: () => (
//             //   <TouchableOpacity onPress={() => navigation.setParams({ menuVisible: true })}>
//             //     <MaterialIcons name="more-vert" size={24} color={COLORS.gray} style={{ marginRight: 16 }} />
//             //   </TouchableOpacity>
//             // ),
//         })}
//       />

//     <Stack.Screen 
//         name={ROUTES.cleaner_payment_history}
//         component={PaymentsHistoryCleaner} 
//         options={({route}) => ({
            
//             //   title: route.params?.title,
//             title: "Payment History",
//             headerShown:true,
            
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle:{
//                 backgroundColor:COLORS.white,
//             }
//             })}
//         />

// <Stack.Screen 
//             name={ROUTES.notification}
//             component={Notification}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: COLORS.primary,
//                 },
//                 title: "Notifications",

//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//       </Stack.Navigator>
//     )
//   }
  
  
//   const styles = StyleSheet.create({
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: '#FFFFFF',
//     },
//     loadingText: {
//       marginTop: 16,
//       fontSize: 16,
//       color: '#666',
//     },
//   });



// import React, { useState, useEffect, useContext } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import DrawerNavigator from './DrawerNavigator';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import { AuthContext } from '../../context/AuthContext';
// import AccountVerificationGate from '../../screens/cleaner/AccountVerification/AccountVerificationGate';
// import ScheduleDetailView from '../../screens/cleaner/ScheduleDetailsView';
// import SchedulePreview from '../../screens/cleaner/SchedulePreview';
// import AllRequests from '../../screens/cleaner/AllRequests';
// import ChangePassword from '../../screens/sharedscreen/ChangePassword';
// import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
// import ClockIn from '../../screens/cleaner/ScheduleTabs/ClockIn';
// import Tasks from '../../screens/cleaner/TaskPhotos/Tasks';
// import PaymentsHistoryCleaner from '../../screens/cleaner/Payments/PaymentHistoryCleaner';
// import PropertyPreview from '../../screens/cleaner/PropertyPreview';
// import InviteGate from '../../screens/public/IniteGate';
// import Notification from '../../components/shared/Notification';
// import PropertyGigs from '../../screens/cleaner/PropertyGigs';
// import { tSafe } from '../../utils/tSafe'; // added import
// import ChatConversation from '../../screens/sharedscreen/ChatConversation';
// import CustomBackButton from '../../components/shared/CustomBackButton';
// import ScheduleDateChange from '../../screens/cleaner/ScheduleDateChange';
// import ReplacementRequest from '../../screens/cleaner/ReplacementRequest';
// import ManualScheduleDateChange from '../../screens/cleaner/ManualScheduleDateChange';
// import PayoutSettings from '../../screens/cleaner/Payments/PayoutSettings';
// import TaxDocuments from '../../screens/cleaner/Payments/TaxDocuments';
// import EarningsDetailReport from '../../screens/cleaner/Payments/EarningsDetailReport';


// export default function MainCleanerStack() {

//     const Stack = createStackNavigator()
  
//     const { isVerified, isLoading, userToken, currentUser } = useContext(AuthContext);
//     const [isNavigationReady, setIsNavigationReady] = useState(false);
  
//     // Wait for auth to load before rendering navigator
//     useEffect(() => {
//       if (!isLoading) {
//         // Small delay to ensure navigation is ready
//         const timer = setTimeout(() => {
//           setIsNavigationReady(true);
//         }, 100);
//         return () => clearTimeout(timer);
//       }
//     }, [isLoading]);
  
//     // Show loading screen while checking auth
//     if (isLoading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading', 'Loading...')}</Text>
//         </View>
//       );
//     }
  
//     // If no user token, redirect to login
//     if (!userToken) {
//       // You might want to navigate to login here
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('redirecting_to_login', 'Redirecting to login...')}</Text>
//         </View>
//       );
//     }
  
//     // If navigation isn't ready yet
//     if (!isNavigationReady) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('preparing_navigation', 'Preparing navigation...')}</Text>
//         </View>
//       );
//     }
  
//     console.log('Cleaner Stack - User:', {
//       userId: currentUser?._id,
//       userType: currentUser?.userType,
//       isVerified,
//       hasToken: !!userToken
//     });
      
//     return (
//       <Stack.Navigator 
//           screenOptions={{
//             headerTintColor:'#000',
//             headerBackImage: ({ tintColor }) => <CustomBackButton tintColor={tintColor || '#333'} />,
//             headerBackTitleVisible:false,
//             headerBackTitle: '',
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//           }} 
//           initialRouteName={isVerified ? ROUTES.cleaner_dashboard : ROUTES.account_verification_gate}
//       >
  
//           {!isVerified ? (
//             <>
//             <Stack.Screen 
//               name={ROUTES.account_verification_gate} 
//               component={AccountVerificationGate} 
//             />
//             <Stack.Screen 
//               name={ROUTES.account_verification_gate_id_verify} 
//               component={AccountVerificationGate} 
//             />
//             </>
//             ) : (
//             <Stack.Screen 
//               name={ROUTES.cleaner_dashboard}
//               component={DrawerNavigator}
//               options = {{
//                 headerShown:false
//             }}
//           />
//           )}
       

//           <Stack.Screen 
//             name={ROUTES.cleaner_invite_gate}
//             component={InviteGate}
//             options={{
//               headerShown: false,
//               gestureEnabled: false, // Prevent going back during auto sign-in
//             }}
//           />
        
//        <Stack.Screen 
//         name={ROUTES.cleaner_schedule_details_view}
//         component={ScheduleDetailView} 
        
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.white,
//             headerBackTitleVisible: false,
//             headerStyle: {
//               backgroundColor: COLORS.primary,
//             },
            
//             title: tSafe('schedule_details_title', 'Schedule Details'),
//             headerTintColor:COLORS.white,
//             headerBackTitleVisible:false,
//             headerStyle:{
//                 backgroundColor:COLORS.primary
//             }
//           })}
//       />

//       <Stack.Screen 
//           name={ROUTES.cleaner_schedule_review}
//           component={SchedulePreview} 
          
//           options={({route}) => ({
//             headerShown:true,
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//         })}
//       />
//       <Stack.Screen
//           name={ROUTES.cleaner_schedule_date_change}
//           component={ScheduleDateChange}
//           options={{
//               title: "Schedule Date Change",
//           }}
//       />
//       <Stack.Screen
//           name={ROUTES.cleaner_manual_schedule_date_change}
//           component={ManualScheduleDateChange}
//           options={{
//               title: "Schedule Date Change",
//           }}
//       />
//       <Stack.Screen
//         name={ROUTES.cleaner_replacement_request}
//         component={ReplacementRequest}
//         options={{
//           title: 'Replacement Request',
//         }}
//       />
//       <Stack.Screen 
//           name={ROUTES.cleaner_property_preview}
//           component={PropertyPreview} 
          
//           options={({route}) => ({
//             headerShown:true,
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//         })}
//       />
//       <Stack.Screen 
//         name={ROUTES.cleaner_property_gigs} 
//         component={PropertyGigs} 
//         options={{
//           headerShown:true,
//             title: tSafe('property_gigs_title', 'Property Gigs'),
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:true,
//             headerStyle:{
//               backgroundColor:COLORS.white
//             },
            
//             headerTitleStyle: {
//               fontWeight: '600',
//               fontSize:18,
//               color:COLORS.gray,
//             },
//             drawerIcon:({focus, color, size}) => (
//               <DrawerIcon
//                 IconComponent={MaterialCommunityIcons}
//                 name="credit-card-outline"
//                 color={color}
//                 size={20}
//               />
//             )
//         }}
//       />
//       <Stack.Screen 
//         name={ROUTES.cleaner_change_password}
//         component={ChangePassword} 
        
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.white,
//             headerBackTitleVisible: false,
            
//             title: tSafe('change_password_title', 'Change Password'),
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//         })}
//       />
      
//     <Stack.Screen 
//         name={ROUTES.cleaner_change_language}
//         component={ChangeLanguage} 
        
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.white,
//             headerBackTitleVisible: false,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//             title: tSafe('change_language_title', 'Change Language'),
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
            
//         })}
//       />
//       <Stack.Screen 
//         name={ROUTES.cleaner_all_requests}
//         component={AllRequests} 
        
//         options={({route}) => ({
            
//             //   title: route.params?.title,
//             title: tSafe('all_requests_title', 'All Requests'),
//             headerShown:true,
            
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle:{
//                 backgroundColor:COLORS.white,
//             }
//             })}
//         />

// <Stack.Screen 
//       name={ROUTES.cleaner_clock_in}
//       component={ClockIn} 
      
//       options={({route}) => ({
          
//         //   title: route.params?.title,
//           title: tSafe('clock_in_title', 'Clock In'),
//           headerShown:true,
          
//           headerTintColor:COLORS.white,
//           headerBackTitleVisible:false,
//           headerStyle:{
//               backgroundColor:COLORS.primary,
//           }
//         })}
//     /> 

//     <Stack.Screen 
//         name={ROUTES.cleaner_attach_task_photos}
//         component={Tasks} 
//         options={({route}) => ({
//             headerShown:true,
//             headerTintColor: COLORS.gray,
//             // headerBackTitleVisible: true,
//             headerStyle: {
//               backgroundColor: '#fff', // Background color of the header
//               elevation: 5, // Adds elevation for Android
//               shadowColor: '#000', // Shadow color for iOS
//               shadowOpacity: 0.3, // Shadow opacity for iOS
//               shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//               shadowRadius: 3, // Shadow radius for iOS
//             },
//             title: tSafe('active_cleaning_session_title', 'Active Cleaning Session'),
          
//             // headerBackTitleVisible:true,
//             // headerRight: () => (
//             //   <TouchableOpacity onPress={() => navigation.setParams({ menuVisible: true })}>
//             //     <MaterialIcons name="more-vert" size={24} color={COLORS.gray} style={{ marginRight: 16 }} />
//             //   </TouchableOpacity>
//             // ),
//         })}
//       />

//     <Stack.Screen 
//         name={ROUTES.cleaner_payment_history}
//         component={PaymentsHistoryCleaner} 
//         options={({route}) => ({
            
//             //   title: route.params?.title,
//             title: tSafe('payment_history_title', 'Payment History'),
//             headerShown:true,
            
//             headerTintColor:COLORS.gray,
//             headerBackTitleVisible:false,
//             headerStyle:{
//                 backgroundColor:COLORS.white,
//             }
//             })}
//         />
//         <Stack.Screen 
//             name={ROUTES.cleaner_payout_settings}
//             component={PayoutSettings} 
//             options={({route}) => ({
                
//                 //   title: route.params?.title,
//                 title: tSafe('payout_setting_title', 'Payout Setting'),
//                 headerShown:true,
                
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.white,
//                 }
//                 })}
//         />
//         <Stack.Screen 
//             name={ROUTES.cleaner_tax_document}
//             component={TaxDocuments} 
//             options={({route}) => ({
                
//                 //   title: route.params?.title,
//                 title: tSafe('tax_document_title', 'Tax Document'),
//                 headerShown:true,
                
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.white,
//                 }
//                 })}
//         />
//         <Stack.Screen 
//             name={ROUTES.cleaner_earning_detail_report}
//             component={EarningsDetailReport} 
//             options={({route}) => ({
                
//                 //   title: route.params?.title,
//                 title: tSafe('earning_details_title', 'Earning Details'),
//                 headerShown:true,
                
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.white,
//                 }
//                 })}
//         />
//         <Stack.Screen
//             name={ROUTES.cleaner_chat_conversation}
//             component={ChatConversation}
//             options={({ route }) => ({
//                 headerShown: true,
//                 // header: () => <CustomChatHeader schedule={route.params.conversation} />,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                     backgroundColor: COLORS.primary,
//                 },
//             })}
//         />

//       <Stack.Screen 
//             name={ROUTES.notification}
//             component={Notification}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: COLORS.primary,
//                 },
//                 title: tSafe('notifications_title', 'Notifications'),

//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//       </Stack.Navigator>
//     )
//   }
  
  
//   const styles = StyleSheet.create({
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: '#FFFFFF',
//     },
//     loadingText: {
//       marginTop: 16,
//       fontSize: 16,
//       color: '#666',
//     },
//   });
  

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useMemo,
// } from 'react';

// import {
//   StyleSheet,
//   Text,
//   View,
//   ActivityIndicator,
// } from 'react-native';

// import { createStackNavigator } from '@react-navigation/stack';

// import DrawerNavigator from './DrawerNavigator';
// import ROUTES from '../../constants/routes';

// import { AuthContext } from '../../context/AuthContext';
// import { useTheme } from '../../theme/ThemeProvider';

// import AccountVerificationGate from '../../screens/cleaner/AccountVerification/AccountVerificationGate';
// import ScheduleDetailView from '../../screens/cleaner/ScheduleDetailsView';
// import SchedulePreview from '../../screens/cleaner/SchedulePreview';
// import AllRequests from '../../screens/cleaner/AllRequests';

// import ChangePassword from '../../screens/sharedscreen/ChangePassword';
// import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
// import ChatConversation from '../../screens/sharedscreen/ChatConversation';

// import ClockIn from '../../screens/cleaner/ScheduleTabs/ClockIn';
// import Tasks from '../../screens/cleaner/TaskPhotos/Tasks';

// import PaymentsHistoryCleaner from '../../screens/cleaner/Payments/PaymentHistoryCleaner';
// import PayoutSettings from '../../screens/cleaner/Payments/PayoutSettings';
// import TaxDocuments from '../../screens/cleaner/Payments/TaxDocuments';
// import EarningsDetailReport from '../../screens/cleaner/Payments/EarningsDetailReport';

// import PropertyPreview from '../../screens/cleaner/PropertyPreview';
// import PropertyGigs from '../../screens/cleaner/PropertyGigs';

// import InviteGate from '../../screens/public/IniteGate';
// import Notification from '../../components/shared/Notification';

// import ScheduleDateChange from '../../screens/cleaner/ScheduleDateChange';
// import ReplacementRequest from '../../screens/cleaner/ReplacementRequest';
// import ManualScheduleDateChange from '../../screens/cleaner/ManualScheduleDateChange';

// import { tSafe } from '../../utils/tSafe';
// import CustomBackButton from '../../components/shared/CustomBackButton';

// const Stack = createStackNavigator();

// export default function MainCleanerStack() {
//   const {
//     isVerified,
//     isLoading,
//     userToken,
//     currentUser,
//   } = useContext(AuthContext);

//   const { theme, isDark } = useTheme();

//   const [isNavigationReady, setIsNavigationReady] = useState(false);

//   /*
//    * Resolve colors from your existing theme.
//    */
//   const colors = useMemo(() => {
//     const primaryText = theme.text?.primary || '#111827';

//     return {
//       background:
//         theme.background?.default ||
//         (isDark ? '#0B1220' : '#FFFFFF'),

//       surface:
//         theme.surface?.elevated ||
//         theme.background?.default ||
//         (isDark ? '#1A2636' : '#FFFFFF'),

//       text: primaryText,

//       icon:
//         theme.icon?.default ||
//         primaryText,

//       brand:
//         theme.brand?.primary ||
//         '#00BFFF',

//       border:
//         theme.border?.default ||
//         (isDark ? '#2A3A4A' : '#E5E7EB'),

//       shadow:
//         theme.shadow?.color ||
//         '#000000',

//       shadowOpacity:
//         isDark
//           ? 0
//           : (theme.shadow?.opacity ?? 0.08),
//     };
//   }, [theme, isDark]);

//   /*
//    * Theme-aware loading styles.
//    */
//   const styles = useMemo(
//     () => createStyles(colors),
//     [colors]
//   );

//   /*
//    * Shared theme-aware navigation header.
//    *
//    * IMPORTANT:
//    * This is defined before conditional returns to preserve
//    * React's hook ordering.
//    */
//   const headerOptions = useMemo(
//     () => ({
//       headerShown: true,

//       headerTintColor: colors.icon,

//       headerBackImage: ({ tintColor }) => (
//         <CustomBackButton
//           tintColor={tintColor || colors.icon}
//         />
//       ),

//       headerBackTitleVisible: false,
//       headerBackTitle: '',

//       headerStyle: {
//         backgroundColor: colors.surface,

//         elevation: isDark ? 0 : 2,

//         shadowColor: colors.shadow,
//         shadowOpacity: colors.shadowOpacity,

//         shadowOffset: {
//           width: 0,
//           height: 2,
//         },

//         shadowRadius: 3,

//         borderBottomColor: colors.border,
//         borderBottomWidth: StyleSheet.hairlineWidth,
//       },

//       headerTitleStyle: {
//         color: colors.text,
//         fontWeight: '600',
//         fontSize: 17,
//       },

//       headerTitleAlign: 'center',

//       cardStyle: {
//         backgroundColor: colors.background,
//       },
//     }),
//     [colors, isDark]
//   );

//   /*
//    * Wait for authentication to finish before rendering
//    * the navigator.
//    */
//   useEffect(() => {
//     if (!isLoading) {
//       const timer = setTimeout(() => {
//         setIsNavigationReady(true);
//       }, 100);

//       return () => clearTimeout(timer);
//     }

//     setIsNavigationReady(false);
//   }, [isLoading]);

//   /*
//    * Authentication loading screen.
//    */
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator
//           size="large"
//           color={colors.brand}
//         />

//         <Text style={styles.loadingText}>
//           {tSafe('loading', 'Loading...')}
//         </Text>
//       </View>
//     );
//   }

//   /*
//    * Preserve the existing behavior when there is no token.
//    */
//   if (!userToken) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator
//           size="large"
//           color={colors.brand}
//         />

//         <Text style={styles.loadingText}>
//           {tSafe(
//             'redirecting_to_login',
//             'Redirecting to login...'
//           )}
//         </Text>
//       </View>
//     );
//   }

//   /*
//    * Wait until navigation is ready.
//    */
//   if (!isNavigationReady) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator
//           size="large"
//           color={colors.brand}
//         />

//         <Text style={styles.loadingText}>
//           {tSafe(
//             'preparing_navigation',
//             'Preparing navigation...'
//           )}
//         </Text>
//       </View>
//     );
//   }

//   console.log('Cleaner Stack - User:', {
//     userId: currentUser?._id,
//     userType: currentUser?.userType,
//     isVerified,
//     hasToken: !!userToken,
//     themeMode: isDark ? 'dark' : 'light',
//     headerBackground: colors.surface,
//   });

//   return (
//     <Stack.Navigator
//       initialRouteName={
//         isVerified
//           ? ROUTES.cleaner_dashboard
//           : ROUTES.account_verification_gate
//       }
//       screenOptions={headerOptions}
//     >
//       {/* ACCOUNT VERIFICATION / DASHBOARD */}

//       {!isVerified ? (
//         <>
//           <Stack.Screen
//             name={ROUTES.account_verification_gate}
//             component={AccountVerificationGate}
//           />

//           <Stack.Screen
//             name={ROUTES.account_verification_gate_id_verify}
//             component={AccountVerificationGate}
//           />
//         </>
//       ) : (
//         <Stack.Screen
//           name={ROUTES.cleaner_dashboard}
//           component={DrawerNavigator}
//           options={{
//             headerShown: false,
//           }}
//         />
//       )}

//       {/* INVITATIONS */}

//       <Stack.Screen
//         name={ROUTES.cleaner_invite_gate}
//         component={InviteGate}
//         options={{
//           headerShown: false,
//           gestureEnabled: false,
//         }}
//       />

//       {/* SCHEDULE DETAILS */}

//       <Stack.Screen
//         name={ROUTES.cleaner_schedule_details_view}
//         component={ScheduleDetailView}
//         options={{
//           title: tSafe(
//             'schedule_details_title',
//             'Schedule Details'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_schedule_review}
//         component={SchedulePreview}
//         options={{
//           title: tSafe(
//             'schedule_review_title',
//             'Schedule Review'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_schedule_date_change}
//         component={ScheduleDateChange}
//         options={{
//           title: tSafe(
//             'schedule_date_change_title',
//             'Schedule Date Change'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_manual_schedule_date_change}
//         component={ManualScheduleDateChange}
//         options={{
//           title: tSafe(
//             'schedule_date_change_title',
//             'Schedule Date Change'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_replacement_request}
//         component={ReplacementRequest}
//         options={{
//           title: tSafe(
//             'replacement_request_title',
//             'Replacement Request'
//           ),
//         }}
//       />

//       {/* PROPERTY SCREENS */}

//       <Stack.Screen
//         name={ROUTES.cleaner_property_preview}
//         component={PropertyPreview}
//         options={{
//           title: tSafe(
//             'property_preview_title',
//             'Property Details'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_property_gigs}
//         component={PropertyGigs}
//         options={{
//           title: tSafe(
//             'property_gigs_title',
//             'Property Gigs'
//           ),
//         }}
//       />

//       {/* ACCOUNT SETTINGS */}

//       <Stack.Screen
//         name={ROUTES.cleaner_change_password}
//         component={ChangePassword}
//         options={{
//           title: tSafe(
//             'change_password_title',
//             'Change Password'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_change_language}
//         component={ChangeLanguage}
//         options={{
//           title: tSafe(
//             'change_language_title',
//             'Change Language'
//           ),
//         }}
//       />

//       {/* CLEANER REQUESTS */}

//       <Stack.Screen
//         name={ROUTES.cleaner_all_requests}
//         component={AllRequests}
//         options={{
//           title: tSafe(
//             'all_requests_title',
//             'All Requests'
//           ),
//         }}
//       />

//       {/* CLEANING SESSION */}

//       <Stack.Screen
//         name={ROUTES.cleaner_clock_in}
//         component={ClockIn}
//         options={{
//           title: tSafe(
//             'clock_in_title',
//             'Clock In'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_attach_task_photos}
//         component={Tasks}
//         options={{
//           title: tSafe(
//             'active_cleaning_session_title',
//             'Active Cleaning Session'
//           ),
//         }}
//       />

//       {/* PAYMENTS */}

//       <Stack.Screen
//         name={ROUTES.cleaner_payment_history}
//         component={PaymentsHistoryCleaner}
//         options={{
//           title: tSafe(
//             'payment_history_title',
//             'Payment History'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_payout_settings}
//         component={PayoutSettings}
//         options={{
//           title: tSafe(
//             'payout_setting_title',
//             'Payout Setting'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_tax_document}
//         component={TaxDocuments}
//         options={{
//           title: tSafe(
//             'tax_document_title',
//             'Tax Document'
//           ),
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.cleaner_earning_detail_report}
//         component={EarningsDetailReport}
//         options={{
//           title: tSafe(
//             'earning_details_title',
//             'Earning Details'
//           ),
//         }}
//       />

//       {/* CHAT */}

//       <Stack.Screen
//         name={ROUTES.cleaner_chat_conversation}
//         component={ChatConversation}
//         options={{
//           title: tSafe(
//             'chat_title',
//             'Conversation'
//           ),
//         }}
//       />

//       {/* NOTIFICATIONS */}

//       <Stack.Screen
//         name={ROUTES.notification}
//         component={Notification}
//         options={{
//             headerShown: true,
//             title: tSafe('notifications_title', 'Notifications'),
//             headerTintColor: theme.text.primary,
//             headerBackTitleVisible: false,
//             headerBackTitle: '',
//             headerStyle: {
//                 backgroundColor: theme.surface.elevated,
//                 elevation: 5,
//                 shadowColor: theme.shadow?.color || '#000000',
//                 shadowOpacity: theme.shadow?.opacity ?? 0.08,
//                 shadowOffset: {
//                     width: 0,
//                     height: 2,
//                 },
//                 shadowRadius: 3,
//             },
//             headerTitleStyle: {
//                 color: theme.text.primary,
//             },
//         }}
//     />
//     </Stack.Navigator>
//   );
// }

// /*
//  * Theme-aware loading screen styles.
//  */
// const createStyles = (colors) =>
//   StyleSheet.create({
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: colors.background,
//     },

//     loadingText: {
//       marginTop: 16,
//       fontSize: 16,
//       color: colors.text,
//     },
//   });




import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import DrawerNavigator from './DrawerNavigator';
import ROUTES from '../../constants/routes';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';

import AccountVerificationGate from '../../screens/cleaner/AccountVerification/AccountVerificationGate';
import ScheduleDetailView from '../../screens/cleaner/ScheduleDetailsView';
import SchedulePreview from '../../screens/cleaner/SchedulePreview';
import AllRequests from '../../screens/cleaner/AllRequests';

import ChangePassword from '../../screens/sharedscreen/ChangePassword';
import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
import ChatConversation from '../../screens/sharedscreen/ChatConversation';

import ClockIn from '../../screens/cleaner/ScheduleTabs/ClockIn';
import Tasks from '../../screens/cleaner/TaskPhotos/Tasks';

import PaymentsHistoryCleaner from '../../screens/cleaner/Payments/PaymentHistoryCleaner';
import PayoutSettings from '../../screens/cleaner/Payments/PayoutSettings';
import TaxDocuments from '../../screens/cleaner/Payments/TaxDocuments';
import EarningsDetailReport from '../../screens/cleaner/Payments/EarningsDetailReport';

import PropertyPreview from '../../screens/cleaner/PropertyPreview';
import PropertyGigs from '../../screens/cleaner/PropertyGigs';

import InviteGate from '../../screens/public/IniteGate';
import Notification from '../../components/shared/Notification';

import ScheduleDateChange from '../../screens/cleaner/ScheduleDateChange';
import ReplacementRequest from '../../screens/cleaner/ReplacementRequest';
import ManualScheduleDateChange from '../../screens/cleaner/ManualScheduleDateChange';

import { tSafe } from '../../utils/tSafe';
import CustomBackButton from '../../components/shared/CustomBackButton';

const Stack = createStackNavigator();

export default function MainCleanerStack() {
  const {
    isVerified,
    isLoading,
    userToken,
    currentUser,
  } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  const [isNavigationReady, setIsNavigationReady] = useState(false);

  /*
   * Resolve colors from the active theme.
   * The fallbacks protect against missing optional theme properties.
   */
  const colors = useMemo(() => {
    const primaryText =
      theme.text?.primary || (isDark ? '#F1F5F9' : '#111827');

    return {
      background:
        theme.background?.default ||
        (isDark ? '#0B1220' : '#FFFFFF'),

      surface:
        theme.surface?.elevated ||
        theme.surface?.default ||
        theme.background?.default ||
        (isDark ? '#1A2636' : '#FFFFFF'),

      text: primaryText,

      icon:
        theme.text?.primary ||
        theme.icon?.default ||
        primaryText,

      brand:
        theme.brand?.primary ||
        '#00BFFF',

      border:
        theme.border?.default ||
        (isDark ? '#2A3A4A' : '#E5E7EB'),

      shadow:
        theme.shadow?.color ||
        '#000000',

      shadowOpacity:
        theme.shadow?.opacity ??
        (isDark ? 0.3 : 0.08),
    };
  }, [theme, isDark]);

  /*
   * Theme-aware loading screen styles.
   */
  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );

  /*
   * Shared header configuration.
   *
   * Every screen inherits these settings unless it explicitly
   * changes a non-color property, such as headerShown.
   */
  const headerOptions = useMemo(
    () => ({
      headerShown: true,

      headerTintColor: theme.text?.primary || colors.text,

      headerBackImage: ({ tintColor }) => (
        <CustomBackButton
          tintColor={tintColor || colors.icon}
        />
      ),

      headerBackTitleVisible: false,
      headerBackTitle: '',

      headerStyle: {
        backgroundColor: colors.surface,

        elevation: isDark ? 0 : 5,

        shadowColor: colors.shadow,
        shadowOpacity: colors.shadowOpacity,

        shadowOffset: {
          width: 0,
          height: 2,
        },

        shadowRadius: 3,

        borderBottomColor: colors.border,
        borderBottomWidth: StyleSheet.hairlineWidth,
      },

      headerTitleStyle: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 17,
      },

      headerTitleAlign: 'center',

      cardStyle: {
        backgroundColor: colors.background,
      },
    }),
    [theme, colors, isDark]
  );

  /*
   * Wait for authentication to finish before rendering
   * the navigator.
   */
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsNavigationReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }

    setIsNavigationReady(false);
  }, [isLoading]);

  /*
   * Authentication loading screen.
   */
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.brand}
        />

        <Text style={styles.loadingText}>
          {tSafe('loading', 'Loading...')}
        </Text>
      </View>
    );
  }

  /*
   * Preserve existing behavior when no token is available.
   */
  if (!userToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.brand}
        />

        <Text style={styles.loadingText}>
          {tSafe(
            'redirecting_to_login',
            'Redirecting to login...'
          )}
        </Text>
      </View>
    );
  }

  /*
   * Wait until navigation is ready.
   */
  if (!isNavigationReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.brand}
        />

        <Text style={styles.loadingText}>
          {tSafe(
            'preparing_navigation',
            'Preparing navigation...'
          )}
        </Text>
      </View>
    );
  }

  console.log('Cleaner Stack - User:', {
    userId: currentUser?._id,
    userType: currentUser?.userType,
    isVerified,
    hasToken: Boolean(userToken),
    themeMode: isDark ? 'dark' : 'light',
    headerBackground: colors.surface,
  });

  return (
    <Stack.Navigator
      initialRouteName={
        isVerified
          ? ROUTES.cleaner_dashboard
          : ROUTES.account_verification_gate
      }
      screenOptions={headerOptions}
    >
      {/* ACCOUNT VERIFICATION / DASHBOARD */}

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
          options={{
            headerShown: false,
          }}
        />
      )}

      {/* INVITATIONS */}

      <Stack.Screen
        name={ROUTES.cleaner_invite_gate}
        component={InviteGate}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* SCHEDULE DETAILS */}

      <Stack.Screen
        name={ROUTES.cleaner_schedule_details_view}
        component={ScheduleDetailView}
        options={{
          title: tSafe(
            'schedule_details_title',
            'Schedule Details'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_schedule_review}
        component={SchedulePreview}
        options={{
          title: tSafe(
            'schedule_review_title',
            'Schedule Review'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_schedule_date_change}
        component={ScheduleDateChange}
        options={{
          title: tSafe(
            'schedule_date_change_title',
            'Schedule Date Change'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_manual_schedule_date_change}
        component={ManualScheduleDateChange}
        options={{
          title: tSafe(
            'schedule_date_change_title',
            'Schedule Date Change'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_replacement_request}
        component={ReplacementRequest}
        options={{
          title: tSafe(
            'replacement_request_title',
            'Replacement Request'
          ),
        }}
      />

      {/* PROPERTY SCREENS */}

      <Stack.Screen
        name={ROUTES.cleaner_property_preview}
        component={PropertyPreview}
        options={{
          title: tSafe(
            'property_preview_title',
            'Property Details'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_property_gigs}
        component={PropertyGigs}
        options={{
          title: tSafe(
            'property_gigs_title',
            'Property Gigs'
          ),
        }}
      />

      {/* ACCOUNT SETTINGS */}

      <Stack.Screen
        name={ROUTES.cleaner_change_password}
        component={ChangePassword}
        options={{
          title: tSafe(
            'change_password_title',
            'Change Password'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_change_language}
        component={ChangeLanguage}
        options={{
          title: tSafe(
            'change_language_title',
            'Change Language'
          ),
        }}
      />

      {/* CLEANER REQUESTS */}

      <Stack.Screen
        name={ROUTES.cleaner_all_requests}
        component={AllRequests}
        options={{
          title: tSafe(
            'all_requests_title',
            'All Requests'
          ),
        }}
      />

      {/* CLEANING SESSION */}

      <Stack.Screen
        name={ROUTES.cleaner_clock_in}
        component={ClockIn}
        options={{
          title: tSafe(
            'clock_in_title',
            'Clock In'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_attach_task_photos}
        component={Tasks}
        options={{
          title: tSafe(
            'active_cleaning_session_title',
            'Active Cleaning Session'
          ),
        }}
      />

      {/* PAYMENTS */}

      <Stack.Screen
        name={ROUTES.cleaner_payment_history}
        component={PaymentsHistoryCleaner}
        options={{
          title: tSafe(
            'payment_history_title',
            'Payment History'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_payout_settings}
        component={PayoutSettings}
        options={{
          title: tSafe(
            'payout_setting_title',
            'Payout Setting'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_tax_document}
        component={TaxDocuments}
        options={{
          title: tSafe(
            'tax_document_title',
            'Tax Document'
          ),
        }}
      />

      <Stack.Screen
        name={ROUTES.cleaner_earning_detail_report}
        component={EarningsDetailReport}
        options={{
          title: tSafe(
            'earning_details_title',
            'Earning Details'
          ),
        }}
      />

      {/* CHAT */}

      <Stack.Screen
        name={ROUTES.cleaner_chat_conversation}
        component={ChatConversation}
        options={{
          title: tSafe(
            'chat_title',
            'Conversation'
          ),
        }}
      />

      {/* NOTIFICATIONS */}

      <Stack.Screen
        name={ROUTES.notification}
        component={Notification}
        options={{
          title: tSafe(
            'notifications_title',
            'Notifications'
          ),
        }}
      />
    </Stack.Navigator>
  );
}

/*
 * Theme-aware loading screen styles.
 */
const createStyles = (colors) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
  });