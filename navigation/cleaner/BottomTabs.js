import React, {useEffect, useState, useContext} from 'react';
import { StyleSheet, Text, StatusBar, View, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../../context/AuthContext';
import {useRoute } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import Dashboard from '../../screens/cleaner/Dashboard';
import Ionicons from '@expo/vector-icons/Ionicons';
// import Jobs from '../../screens/cleaner/Jobs';
// import JobDetails from '../../screens/cleaner/JobDetails';
import Messages from '../../screens/cleaner/Messages';
import IconWithBadge from '../../components/shared/IconWithBadge';
import ChatConversation from '../../screens/sharedscreen/ChatConversation';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import More from '../../components/shared/More';
import Schedules from '../../screens/cleaner/Schedules';
import SchedulePreview from '../../screens/cleaner/SchedulePreview';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Keyboard } from 'react-native';



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


  


  const CustomChatHeader = ({ schedule }) => {
    const navigation = useNavigation();
  return(  
  <View>
   
    <View style={{ flexDirection: 'row', backgroundColor: COLORS.primary, paddingTop: Platform.OS === 'android' ? 0 : 50, paddingBottom:10, paddingLeft:10}}> 
      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight:15,  marginTop:10 }}>
        <AntDesign name="arrowleft" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <View style={{ marginTop:10 }}>
        <Text style={{alignSelf:'center', color: COLORS.white, fontSize: 20, fontWeight:'500' }}>{schedule.apartment_name}</Text>
        <Text style={{alignSelf:'center', color: COLORS.white, fontSize: 14 }}>{schedule.address} </Text>
      </View>
    </View>
    <View style={{flexDirection: 'row',  justifyContent:'center', alignItems:'center', paddingVertical:6, borderBottomWidth:0.5, borderBottomColor:COLORS.light_gray}}>
      <MaterialCommunityIcons name="calendar" style={{marginLeft:5}} size={20} color={COLORS.gray} />
      <Text style={{ fontSize: 14, marginTop:0, color:COLORS.gray }}> Schedule  {moment(schedule.cleaning_date).format('ddd MMM D')},  {moment(schedule.cleaning_time, 'h:mm:ss A').format('h:mm A') }</Text>
    </View>
  </View>
  )
};

const MessageStack = () => {
  const route = useRoute();
    return (
      <Stack.Navigator 
        screenOptions={{
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
        }} 
        
        initialRouteName={ROUTES.cleaner_messages}  
       
      >
        <Stack.Screen 
          name={ROUTES.cleaner_messages}
          component={Messages} 
          
          options={({route}) => ({
            headerShown:true,
            title: "Chat Messages",
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
            gestureEnabled: false,   // 🚫 disable swipe-back
        })}
        />

          <Stack.Screen 
            name={ROUTES.cleaner_chat_conversation}
            component={ChatConversation} 
            // component={ChatConversation1}
            
            options={({route}) => ({
              headerShown:true,
              header: ()=> <CustomChatHeader 
                schedule = {route.params.schedule}      
              />,
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

const ScheduleStack = () => {
  const route = useRoute();
    return (
      <Stack.Navigator 
        screenOptions={{
          headerTintColor:COLORS.white,
          headerBackTitleVisible:false,
          headerStyle:{
            backgroundColor:COLORS.primary
          }
        }} 
        initialRouteName={ROUTES.cleaner_schedules}  
       
      >
        <Stack.Screen 
          name={ROUTES.cleaner_schedules}
          component={Schedules} 
          
          options={({route}) => ({
            headerShown:false,
            title: "My Schedules",
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
              
            //   title: route.params?.title,
              title: "Schedule Details",
              headerShown:false
            })}
        />

 
      </Stack.Navigator>
    )
  }

  const JobStack = () => {

    return (
      <Stack.Navigator 
        screenOptions={{
          headerTintColor:COLORS.white,
          headerBackTitleVisible:false,
          headerStyle:{
            backgroundColor:COLORS.primary
          }
        }} 
        initialRouteName={ROUTES.cleaner_jobs}
  
        >
          <Stack.Screen 
              component={Jobs}
              name={ROUTES.cleaner_jobs}
              options={({route})=>({
            
                  headerShown:true,
                  title: "Explore Schedules",
                  headerTintColor:COLORS.white,
                  headerBackTitleVisible:false,
                  headerStyle:{
                      backgroundColor:COLORS.primary
                  }
              
              //   cardStyleInterpolator:
              //   CardStyleInterpolators.forFadeFromBottomAndroid,
              })}
              
            />
  
          <Stack.Screen 
            name={ROUTES.cleaner_job_details}
            component={JobDetails}
            
            options={({route}) => ({
              headerShown:true,
              title: "Jobss Details",
              headerTintColor:COLORS.white,
              headerBackTitleVisible:false,
              headerStyle:{
                  backgroundColor:COLORS.primary
              },
              
            })}
          />

      
        </Stack.Navigator>
    )
  }

function BottomTab() {

  const { totalUnreadCount } = useContext(AuthContext);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const navigation = useNavigation()

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return (
    <Tab.Navigator 
      
      screenOptions={({ route }) => ({
        tabBarButton: keyboardOpen ? () => null : undefined, // 🚫 disable taps
        headerShown:false,
        tabBarActiveTintColor:COLORS.primary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === ROUTES.cleaner_home_tab) {
            iconName = focused ? 'home-outline' : 'home-outline';
          // } else if (route.name === ROUTES.cleaner_dashboard) {
          //   iconName = focused ? 'search' : 'search';
          } else if (route.name === ROUTES.cleaner_jobs) {
            iconName = focused ? 'search' : 'search';
          } else if (route.name === ROUTES.cleaner_schedules) {
            iconName = focused ? 'calendar-outline' : 'calendar-outline';
          } else if (route.name === ROUTES.cleaner_messages) {
            iconName = focused ? 'chatbox-ellipses-outline' : 'chatbox-ellipses-outline';
            return <IconWithBadge icon={iconName} badgeCount={totalUnreadCount} size={22} color={color} />;
          } else if (route.name === ROUTES.cleaner_profile) {
            iconName = focused ? 'person-outline' : 'person-outline';
          } else if (route.name === ROUTES.cleaner_more) {
            iconName = focused ? 'menu-outline' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label;

          if (route.name === ROUTES.cleaner_home_tab) {
            label = 'Home';
          } else if (route.name === ROUTES.cleaner_jobs) {
            label = 'Explore';
          } else if (route.name === ROUTES.cleaner_schedules) {
            label = 'Schedules';
          } else if (route.name === ROUTES.cleaner_messages) {
            label = 'Chat';
          } else if (route.name === ROUTES.cleaner_profile) {
            label = 'Profile';
          } else if (route.name === ROUTES.cleaner_more) {
            label = 'More';
          }

          return (
            <Text style={{ color, fontSize:12, marginTop: -4, marginBottom: focused ? 4 : 4 }}>
              {label}
            </Text>
          );
        },
      })}
    >



      <Tab.Screen 
        name={ROUTES.cleaner_home_tab} 
        component={Dashboard} 
        
        options={({route})=>({
          headerShown: true,
          title: "",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:false,
          headerStyle:{
            backgroundColor:COLORS.primary
          }
        })}
      />

       <Tab.Screen 
        name={ROUTES.cleaner_schedules} 
        component={ScheduleStack} 
        options={{ 
          headerShown: false,
          title: "Schedules",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:false,
        }}
      />
      {/*
       <Tab.Screen 
        name={ROUTES.cleaner_jobs} 
        component={JobStack} 
        options={{ 
          headerShown: false,
          title: "Job Search",
          headerTintColor:COLORS.gray,
          headerBackTitleVisible:false,
        }}
      />
      */}
      {/* <Tab.Screen 
        name={ROUTES.cleaner_messages} 
        component={MessageStack} 
      /> */}

{/* <Tab.Screen
  name={ROUTES.cleaner_messages}
  component={MessageStack}
  options={({ route }) => {
    const routeName =
      getFocusedRouteNameFromRoute(route) ?? ROUTES.cleaner_messages;

    return {
      tabBarStyle:
        routeName === ROUTES.cleaner_chat_conversation
          ? { display: 'none' }
          : undefined,
    };
  }}
/> */}

<Tab.Screen
  name={ROUTES.cleaner_messages}
  component={MessageStack}
  options={({ route }) => {
    const routeName =
      getFocusedRouteNameFromRoute(route) ?? ROUTES.cleaner_messages;

    const isChat = routeName === ROUTES.cleaner_chat_conversation;

    return {
      tabBarStyle: {
        height: isChat ? 0 : 60,
        opacity: isChat ? 0 : 1,
        overflow: 'hidden',
        borderTopWidth: isChat ? 0 : 0.5,
      },
      tabBarItemStyle: {
        opacity: isChat ? 0 : 1,
      },
    };
  }}
/>
      
      
     
      <Tab.Screen 
        name={ROUTES.cleaner_more} 
        component={More} 
        listeners={({ navigation }) => ({
            tabPress: e => {
              navigation.dispatch(DrawerActions.openDrawer())
              e.preventDefault()
            }
        })}
      />  
    </Tab.Navigator>
  )
}

export default BottomTab