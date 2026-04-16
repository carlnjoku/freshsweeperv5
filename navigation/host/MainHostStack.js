// import React from 'react';
// import {Text, View, TouchableOpacity } from 'react-native';
// import { SafeAreaView, Platform, StyleSheet } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { TransitionPresets } from '@react-navigation/stack';
// import DrawerNavigator from './DrawerNavigator';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons,AntDesign } from '@expo/vector-icons';


// import PropertyDashboard from '../../screens/host/PropertyDashboard';
// import AddProperty from '../../screens/host/AddProperty';
// // import EditProperty from '../../screens/host/EditProperty';
// import CleanerProfileHost from '../../screens/host/CleanerProfileHost';
// import CleanerProfilePay from '../../screens/host/CleanerProfilePay';
// // 
// import ChatConversation from '../../screens/sharedscreen/ChatConversation';
// import moment from 'moment';
// import { BookingProvider } from '../../context/BookingContext';
// import ScheduleDetails from '../../screens/host/ScheduleDetails';
// // import PaymentSingleCheckout from '../../screens/host/Payment/PaymentSingleCheckout';
// // import RecommendedCleaners from '../../screens/host/RecommendedCleaners';
// import TaskProgress from '../../screens/host/TaskProgress';
// // import ChangeLanguage from '../../screens/host/ChangeLanguage';
// // import ChangePassword from '../../screens/host/ChangePassword';
// import PaymentComplete from '../../screens/host/Payment/PaymentComplete';
// import ScheduleRequest from '../../screens/host/ScheduleRequest';
// import PaymentGroupCheckout from '../../screens/host/Payment/PaymentGroupCheckout';
// import Notification from '../../components/shared/Notification';
// import Createchecklist from '../../screens/host/Createchecklist';
// // import SystemAlertNotification from '../../screens/sharedscreen/Notifications/SystemAlertNotification';
// import CancellationDetails from '../../screens/sharedscreen/Notifications/Cancellation';
// // import ReceiptDetails from '../../screens/host/Payment/ReceiptDetails';
// // import Promotional from '../../screens/sharedscreen/Notifications/Promotional';
// // import EditChecklist from '../../screens/host/EditChecklist';
// // import ResetPassword from '../../screens/public/ResetPassword';
// import ChangePassword from '../../screens/sharedscreen/ChangePassword';
// import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
// import EditProperty from '../../screens/host/EditProperty';
// import EditChecklist from '../../screens/host/EditChecklist';
// import PaymentSingleCheckout from '../../screens/host/Payment/PaymentSingleCheckout';
// import PaymentDetails from '../../screens/host/Payment/PaymentDetails';
// import Receipt from '../../screens/host/Payment/Receipt';
// import ICalendar from '../../screens/host/ICalendar';





// export default function MainHostStack() {

//     const navigation = useNavigation()
//     const Stack = createStackNavigator()

//       const CustomChatHeader = ({ schedule }) => {
//         const navigation = useNavigation();
      
//         return (
//           <SafeAreaView
//             style={{
//               backgroundColor: COLORS.primary,
//               paddingTop: Platform.OS === 'android' ? 10 : 0,
//               zIndex: 10,
//               elevation: 5,
//             }}
//           >
//             <View style={{ flexDirection: 'row', paddingBottom: 10, paddingLeft: 10 }}>
//               <TouchableOpacity
//                 onPress={() => navigation.goBack()}
//                 style={{ marginRight: 15, marginTop: 10 }}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // improves tap area
//               >
//                 <AntDesign name="arrowleft" size={24} color={COLORS.white} />
//               </TouchableOpacity>
//               <View style={{ marginTop: 10 }}>
//                 <Text
//                   style={{
//                     alignSelf: 'center',
//                     color: COLORS.white,
//                     fontSize: 20,
//                     fontWeight: '500',
//                   }}
//                 >
//                   {schedule.schedule.apartment_name}
//                 </Text>
//                 <Text
//                   style={{
//                     alignSelf: 'center',
//                     color: COLORS.white,
//                     fontSize: 14,
//                   }}
//                 >
//                   {schedule.schedule.address}
//                 </Text>
//               </View>
//             </View>
      
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 backgroundColor: COLORS.light_gray_1,
//                 paddingVertical: 6,
//                 borderBottomWidth: 0.5,
//                 borderBottomColor: COLORS.light_gray,
//               }}
//             >
//               <MaterialCommunityIcons name="calendar" style={{ marginLeft: 5 }} size={20} color={COLORS.gray} />
//               <Text style={{ fontSize: 14, color: COLORS.gray }}>
//                 Schedule {moment(schedule.schedule.cleaning_date).format('ddd MMM D')}, {moment(schedule.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//               </Text>
//             </View>
//           </SafeAreaView>
//         );
//       };
    

    

//   return (
//     <BookingProvider>
//         <Stack.Navigator 
//             screenOptions={{
//                 ...TransitionPresets.ScaleFromCenterAndroid, // Zoom-In Effect
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle: {
//                   backgroundColor: '#ffffff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//             }} 
            
//         >
//         <Stack.Screen 
//             name={ROUTES.host_dashboard}
//             component={DrawerNavigator}
//             options = {{
//                 headerShown:false
//             }}
//         />
        
//         <Stack.Screen 
//             name={ROUTES.host_apt_dashboard}
//             component={PropertyDashboard} 
            
//             options={({route}) => ({
                
//                 headerShown:true,
//                 headerTintColor: COLORS.gray,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//                 title: "Apartment",
//               })}
//           />
//           <Stack.Screen 
//               name={ROUTES.host_edit_apt}
//               component={EditProperty} 
              
//               options={({route}) => ({
//                 headerShown:true,
//                 title: "Edit Property",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//             })}
//             />
//         <Stack.Screen 
//             name={ROUTES.host_add_apt}
//             component={AddProperty} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 title: "Add Apartment",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//             })}
//           />
//           <Stack.Screen 
//             name={ROUTES.host_create_checklist}
//             component={Createchecklist} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 title: "Create Checklist",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//             })}
//           />
//           <Stack.Screen 
//             name={ROUTES.host_edit_checklist}
//             component={EditChecklist} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 title: "Create Checklist",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//             })}
//           />
//           <Stack.Screen 
//             name={ROUTES.host_link_icalendar}
//             component={ICalendar} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 title: "Link Calendar",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//             })}
//           />
//         <Stack.Screen 
//             name={ROUTES.host_schedule_details}
//             component={ScheduleDetails} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
                
//                 headerStyle: {
//                   borderBottomWidth: 1,
//                   borderBottomColor: '#E5E5EA',
//                 },
                

//                 title: "Schedule Details",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 // headerStyle: {
//                 //   backgroundColor: '#fff', // Background color of the header
//                 //   elevation: 5, // Adds elevation for Android
//                 //   shadowColor: '#000', // Shadow color for iOS
//                 //   shadowOpacity: 0.3, // Shadow opacity for iOS
//                 //   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                 //   shadowRadius: 3, // Shadow radius for iOS
//                 // },
//             })}
//           />

//         <Stack.Screen 
//             name={ROUTES.host_schedule_request}
//             component={ScheduleRequest} 
            
//             options={({route}) => ({
                
//                 headerShown:true,
//                 headerTintColor: COLORS.gray,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//                 title: "Schedule Requests",
//               })}
//           />
//         <Stack.Screen 
//             name={ROUTES.cleaner_profile_Pay}
    
//             component={CleanerProfilePay}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: COLORS.primary,
//                 },
//                 title: "About Cleaner",
//                 headerRight: () => (
//                   <View style={{ flexDirection:'row', paddingRight: 10 }}>
//                     <MaterialCommunityIcons name="bookmark" style={{marginLeft:5}} size={20} color={COLORS.white} />
//                     <MaterialCommunityIcons name="share" style={{marginLeft:5}} size={20} color={COLORS.white} />
//                   </View>
//                 ),
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//           <Stack.Screen 
//             name={ROUTES.cleaner_profile_info}
//             // component={CleanerProfile} 
//             component={CleanerProfileHost}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: COLORS.primary,
//                 },
//                 title: "About Cleaner",
//                 headerRight: () => (
//                   <View style={{ flexDirection:'row', paddingRight: 10 }}>
//                     <MaterialCommunityIcons name="bookmark" style={{marginLeft:5}} size={20} color={COLORS.white} />
//                     <MaterialCommunityIcons name="share" style={{marginLeft:5}} size={20} color={COLORS.white} />
//                   </View>
//                 ),
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//         <Stack.Screen 
//             name={ROUTES.notification}
//             // component={CleanerProfile} 
//             component={Notification}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: COLORS.primary,
//                 },
//                 title: "Notificationss",

//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//           <Stack.Screen 
//             name={ROUTES.host_single_checkout}
//             component={PaymentSingleCheckout} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//                 title: "Checkout",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerBackTitle: '',
//                 // headerStyle:{
//                 //     backgroundColor:COLORS.primary
//                 // }
//               })}
//           />
//           <Stack.Screen 
//             name={ROUTES.host_group_checkout}
//             component={PaymentGroupCheckout} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//                 title: "Checkout",
//                 headerTintColor:COLORS.gray,
//                 headerBackTitleVisible:false,
//                 headerBackTitle: '',
//                 // headerStyle:{
//                 //     backgroundColor:COLORS.primary
//                 // }
//               })}
//           />
//         <Stack.Screen 
//             name={ROUTES.payment_complete}
//             component={PaymentComplete} 
//             // component={ChatConversation1}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerBackTitle: '',
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//         <Stack.Screen 
//             name={ROUTES.host_receipt_details}
//             component={Receipt} 
//             // component={ChatConversation1}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerBackTitle: '',
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />
//         <Stack.Screen 
//             name={ROUTES.chat_conversation}
//             component={ChatConversation} 
//             // component={ChatConversation1}
            
//             options={({route}) => ({
//                 headerShown:true,
//                 header: ()=> <CustomChatHeader 
//                   schedule = {route.params.schedule}
//                 />,
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerBackTitle: '',
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />

//         <Stack.Screen 
//             name={ROUTES.host_task_progress}
//             component={TaskProgress} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.gray,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 title: "In-Progress Cleaning",
//                 headerTintColor:COLORS.black,
//                 headerStyle: {
//                   backgroundColor: '#fff', // Background color of the header
//                   elevation: 5, // Adds elevation for Android
//                   shadowColor: '#000', // Shadow color for iOS
//                   shadowOpacity: 0.3, // Shadow opacity for iOS
//                   shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
//                   shadowRadius: 3, // Shadow radius for iOS
//                 },
//               })}
//           />

//         <Stack.Screen 
//             name={ROUTES.host_cancellation_details}
//             component={CancellationDetails} 
            
//             options={({route}) => ({
//                 headerShown:true,
//                 headerTintColor: COLORS.white,
//                 headerBackTitleVisible: false,
//                 headerBackTitle: '',
//                 headerStyle: {
//                   backgroundColor: COLORS.primary,
//                 },
//                 title: "Cancellation Details",
//                 headerTintColor:COLORS.white,
//                 headerBackTitleVisible:false,
//                 headerStyle:{
//                     backgroundColor:COLORS.primary
//                 }
//             })}
//           />

//     <Stack.Screen 
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
//       {/* <Stack.Screen 
//             name={ROUTES.reset_password} 
//             component={ResetPassword}
//             options={{ 
//               title: 'Reset Password',
//               headerShown: true, // Or false, depending on your design
//               // If you use headerShown: true, you might want a back button
//               headerBackTitle: 'Back',
//             }}
//           /> */}
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

//        </Stack.Navigator>
//     </BookingProvider>
//   )
// }



import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView, Platform, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

import PropertyDashboard from '../../screens/host/PropertyDashboard';
import AddProperty from '../../screens/host/AddProperty';
import CleanerProfileHost from '../../screens/host/CleanerProfileHost';
import CleanerProfilePay from '../../screens/host/CleanerProfilePay';
import ChatConversation from '../../screens/sharedscreen/ChatConversation';
import moment from 'moment';
import { BookingProvider } from '../../context/BookingContext';
import ScheduleDetails from '../../screens/host/ScheduleDetails';
import TaskProgress from '../../screens/host/TaskProgress';
import PaymentComplete from '../../screens/host/Payment/PaymentComplete';
import ScheduleRequest from '../../screens/host/ScheduleRequest';
import PaymentGroupCheckout from '../../screens/host/Payment/PaymentGroupCheckout';
import Notification from '../../components/shared/Notification';
import Createchecklist from '../../screens/host/Createchecklist';
import CancellationDetails from '../../screens/sharedscreen/Notifications/Cancellation';
import ChangePassword from '../../screens/sharedscreen/ChangePassword';
import ChangeLanguage from '../../screens/sharedscreen/ChangeLanguage';
import EditProperty from '../../screens/host/EditProperty';
import EditChecklist from '../../screens/host/EditChecklist';
import PaymentSingleCheckout from '../../screens/host/Payment/PaymentSingleCheckout';
import Receipt from '../../screens/host/Payment/Receipt';
import ICalendar from '../../screens/host/ICalendar';
import { tSafe } from '../../utils/tSafe'; // added import

export default function MainHostStack() {
    const navigation = useNavigation();
    const Stack = createStackNavigator();

    const CustomChatHeader = ( conversation ) => {

      console.log("Chat schedulingggggg------PPP", conversation)
        const navigation = useNavigation();

        return (
            <SafeAreaView
                style={{
                    backgroundColor: COLORS.primary,
                    paddingTop: Platform.OS === 'android' ? 10 : 0,
                    zIndex: 10,
                    elevation: 5,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent:'center', paddingBottom: 10}}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginRight: 15, marginTop: 10 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <AntDesign name="arrowleft" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={{ marginTop: 10 }}>
                        <Text
                            style={{
                                alignSelf: 'center',
                                color: COLORS.white,
                                fontSize: 20,
                                fontWeight: '500',
                            }}
                        >
                            {conversation.schedule.schedule.apartment_name}
                        </Text>
                        <Text
                            style={{
                                alignSelf: 'center',
                                color: COLORS.white,
                                fontSize: 14,
                            }}
                        >
                            {conversation.schedule.schedule.address}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: COLORS.light_gray_1,
                        paddingVertical: 6,
                        borderBottomWidth: 0.5,
                        borderBottomColor: COLORS.light_gray,
                    }}
                >
                    <MaterialCommunityIcons name="calendar" style={{ marginLeft: 5 }} size={20} color={COLORS.gray} />
                    <Text style={{ fontSize: 14, color: COLORS.gray }}>
                        {tSafe('schedule', 'Schedule')} {moment(conversation.schedule.schedule.cleaning_date).format('ddd MMM D')}, {moment(conversation.schedule.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <BookingProvider>
            <Stack.Navigator
                screenOptions={{
                    ...TransitionPresets.ScaleFromCenterAndroid,
                    headerTintColor: COLORS.white,
                    headerBackTitleVisible: false,
                    headerStyle: {
                        backgroundColor: '#ffffff',
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOpacity: 0.3,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 3,
                    },
                }}
            >
                <Stack.Screen
                    name={ROUTES.host_dashboard}
                    component={DrawerNavigator}
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name={ROUTES.host_apt_dashboard}
                    component={PropertyDashboard}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                        title: tSafe('apartment_title', 'Apartment'),
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_edit_apt}
                    component={EditProperty}
                    options={({ route }) => ({
                        headerShown: true,
                        title: tSafe('edit_property_title', 'Edit Property'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_add_apt}
                    component={AddProperty}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        title: tSafe('add_apartment_title', 'Add Apartment'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_create_checklist}
                    component={Createchecklist}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        title: tSafe('create_checklist_title', 'Create Checklist'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_edit_checklist}
                    component={EditChecklist}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        title: tSafe('create_checklist_title', 'Create Checklist'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_link_icalendar}
                    component={ICalendar}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        title: tSafe('link_calendar_title', 'Link Calendar'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_schedule_details}
                    component={ScheduleDetails}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            borderBottomWidth: 1,
                            borderBottomColor: '#E5E5EA',
                        },
                        title: tSafe('schedule_details_title', 'Schedule Details'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                    })}
                />

                <Stack.Screen
                    name={ROUTES.host_schedule_request}
                    component={ScheduleRequest}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                        title: tSafe('schedule_requests_title', 'Schedule Requests'),
                    })}
                />
                <Stack.Screen
                    name={ROUTES.cleaner_profile_Pay}
                    component={CleanerProfilePay}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                        title: tSafe('about_cleaner_title', 'About Cleaner'),
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                                <MaterialCommunityIcons name="bookmark" style={{ marginLeft: 5 }} size={20} color={COLORS.white} />
                                <MaterialCommunityIcons name="share" style={{ marginLeft: 5 }} size={20} color={COLORS.white} />
                            </View>
                        ),
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.cleaner_profile_info}
                    component={CleanerProfileHost}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                        title: tSafe('about_cleaner_title', 'About Cleaner'),
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                                <MaterialCommunityIcons name="bookmark" style={{ marginLeft: 5 }} size={20} color={COLORS.white} />
                                <MaterialCommunityIcons name="share" style={{ marginLeft: 5 }} size={20} color={COLORS.white} />
                            </View>
                        ),
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.notification}
                    component={Notification}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                        title: tSafe('notifications_title', 'Notifications'),
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_single_checkout}
                    component={PaymentSingleCheckout}
                    options={({ route }) => ({
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                        title: tSafe('checkout_title', 'Checkout'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_group_checkout}
                    component={PaymentGroupCheckout}
                    options={({ route }) => ({
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                        title: tSafe('checkout_title', 'Checkout'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                    })}
                />
                <Stack.Screen
                    name={ROUTES.payment_complete}
                    component={PaymentComplete}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.host_receipt_details}
                    component={Receipt}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />
                <Stack.Screen
                    name={ROUTES.chat_conversation}
                    component={ChatConversation}
                    options={({ route }) => ({
                        headerShown: true,
                        header: () => <CustomChatHeader schedule={route.params.conversation} />,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />

                <Stack.Screen
                    name={ROUTES.host_task_progress}
                    component={TaskProgress}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        title: tSafe('in_progress_cleaning_title', 'In-Progress Cleaning'),
                        headerTintColor: COLORS.black,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />

                <Stack.Screen
                    name={ROUTES.host_cancellation_details}
                    component={CancellationDetails}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerBackTitle: '',
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                        title: tSafe('cancellation_details_title', 'Cancellation Details'),
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: COLORS.primary,
                        },
                    })}
                />

                <Stack.Screen
                    name={ROUTES.cleaner_change_password}
                    component={ChangePassword}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        title: tSafe('change_password_title', 'Change Password'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                    })}
                />

                <Stack.Screen
                    name={ROUTES.cleaner_change_language}
                    component={ChangeLanguage}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTintColor: COLORS.white,
                        headerBackTitleVisible: false,
                        headerStyle: {
                            backgroundColor: '#fff',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                        },
                        title: tSafe('change_language_title', 'Change Language'),
                        headerTintColor: COLORS.gray,
                        headerBackTitleVisible: false,
                    })}
                />
            </Stack.Navigator>
        </BookingProvider>
    );
}