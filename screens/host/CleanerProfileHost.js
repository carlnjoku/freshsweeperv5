import React, { useContext, useRef, useEffect,useState } from 'react';
// import Text from '../../components/Text';
import { SafeAreaView,StyleSheet, StatusBar, Text, RefreshControl, Linking,Dimensions,  FlatList, ScrollView, Image, View, useWindowDimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import Button from '../../components/shared/Button';
import {
  get,
  ref,
  set,
  onValue,
  push,
  update,
  snapshot
 } from 'firebase/database'; // Import necessary functions from 'firebase/database'
import { db } from '../../services/firebase/config';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import { Avatar } from 'react-native-paper';
// import StarRating from '../../components/StarRating';
// import DraggableOverlay from './DraggableOverlay'; // Import the draggable overlay component
// import DraggableOverlay from '../../components/DraggableOverlayTest';
import * as Animatable from 'react-native-animatable';
import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
import CertificationDisplay from '../cleaner/CertificationDisplay';
// import Portfolio from './Portfolio/Portfolio';
import { cleanerPortfolio } from '../../utils/cleanerPortfolio';
import AboutMeDisplay from '../cleaner/AboutMeDisplay';
import userService from '../../services/connection/userService';
import calculateDistance from '../../utils/calculateDistance';
import { SchedulePrice } from '../../components/host/SchedulePrice';
import ROUTES from '../../constants/routes';
// import CircularIcon from '../../components/CircularIcon';
import { haversineDistance } from '../../utils/distanceBtwLocation';
import Reviews from '../../components/shared/Reviews';
import Modal from 'react-native-modal';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Entypo'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import StarRating from 'react-native-star-rating-widget';
import { sendCleaningRequestPushNotification, sendPushNotifications } from '../../utils/sendPushNotification';




const { width, height } = Dimensions.get('window');

const CleanerProfileHost = ({navigation, route}) => {
const{item, selected_schedule, selected_scheduleId} = route.params

console.log("Iteeeeeeeems", item)
console.log("selected schedule", selected_schedule)
const [visible, setVisible] = React.useState(false);

const {currentUserId, friendsWithLastMessagesUnread, fbaseUser, currentUser, currency} = useContext(AuthContext)
  // const{friendsWithLastMessagesUnread} = useContext(AuthContext)
  // Get distance between host and cleaner location

  const cleanerLocation = { latitude: item?.location.latitude, longitude: item?.location.longitude }; // Cleaner location 
  const scheduleLocation = { latitude: selected_schedule.schedule?.apartment_latitude || selected_schedule?.apartment_latitude, longitude: selected_schedule.schedule?.apartment_longitude || selected_schedule.apartment_longitude }; // schedule location 

  const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);



  const [refreshing, setRefreshing] = useState(false);
  const[selectedUser, setSelectedUser]=useState("")
  const[rating, setRating]=useState("")

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [completed_schedules, setCompletedSchedules] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [cleaner_chat_reference, setCleanerChatReference] = useState({});
  const [reviews, setReviews] = useState([]);
  const [cleaner_tokens, setCleanerPushTokens] = useState([]);

  const makeCall = (number) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Phone number is not available');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.log(err));
  };

  const callPhone = () => {
    // alert("hey")
    makeCall(item.contact.phone)
  }

  const addCleanerToFriendList = () => {
    onAddFriendNoBooking(item.cleanerId)
  }

  // Function to handle refresh
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await Promise.all([checkChatroonId(), fetchSelectedUserJobs(), fetchCleanerChatRef(), fetchCleanerFeedbacks(), fetchCleanerPushTokens()]);
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    setRefreshing(false);
  }
};
  
  useEffect(()=> {
    checkChatroonId()
    fetchSelectedUserJobs()
    fetchCleanerChatRef()
    fetchCleanerFeedbacks()
    fetchCleanerPushTokens()
    const filteredData = friendsWithLastMessagesUnread.filter(row => row.schedule === selected_scheduleId && row.userId === item.cleanerId);

    // Log or use filteredData as needed
    console.log("L................................l")
    // console.log(filteredData[0]);
    setCleanerChatReference(filteredData[0])
    console.log("L................................l")
    
  },[])

  const fetchCleanerPushTokens = async() => {
    await userService.getUserPushTokens(item.cleanerId)
    .then(response => {
        const res = response.data.tokens
        setCleanerPushTokens(res)
        // console.log("User tokens", res)
    })
  }

  const toggleOverlay = () => {
    setOverlayVisible(prevState => !prevState);
  };

  console.log("lissssssssssssssssst_of friends")
      // console.log(JSON.stringify(fbaseUser.friends, null, 2 ))
  console.log("lissssssssssssssssst_of friends")
  

  const findUser = async userId => {
    const mySnapshot = await get(ref(db, `users/${userId}`))
    return mySnapshot.val()

  }

  const checkChatroonId = async () => {
      // alert(selected_schedule.schedule.chatrooms.chatroomId)
      const chrmId = item.cleanerId

      
      const mySnapshot = await get(ref(db, `users/${currentUserId}/friends`))
  

      return mySnapshot.val()
  }

  
  
  const onAddFriendNoBooking = async uid => {
    try {
      console.log("feeeeee....................")
      // console.log(fbaseUser)
      console.log("feeeeee....................")
  
      // Find the user
      const user = await findUser(uid);
  
      if (!user) {
        console.error("User not found");
        return;
      }
  
      if (user.userId === fbaseUser.userId) {
        // Don't let user add himself
        console.error("Cannot add self as friend");
        return;
      }
  
      // Check if the friend already exists
      const friendExists = fbaseUser.friends && fbaseUser.friends.find(f => f.userId === user.userId);
      // alert("This user exists in my friends list")

      
      
      // Create a chatroom for the existing friend or a new friend
      const newChatroomRef = push(ref(db, 'chatrooms'), {
        firstUser: fbaseUser.userId,
        secondUser: user.userId,
        messages: [],
      });
  
      const newChatroomId = newChatroomRef.key;

      
  
      // Create the unreadMessages node
      const unreadMessagesRef = ref(db, `unreadMessages/${newChatroomId}/${user.userId}/${fbaseUser.userId}`);
      set(unreadMessagesRef, 1)
        .then(() => console.log("Unread messages node created successfully!"))
        .catch((error) => console.error("Error creating unread messages node:", error));
  
      // alert(newChatroomId);
  
      if (friendExists) {

        // If friend exists, no need to add them again, just return
        // You make start another chat session with the user 
    
        const modified_seleted_user = {
          "avatar": item.avatar,
          "chatroomId": newChatroomId,
          "email": item.email,
          "firstname": item.firstname,
          "lastname": item.lastname,
          "schedule": selected_schedule.schedule,
          "userId": item._id,
          "lastmessage": {
            "text": "",
            "sender": fbaseUser.userId,
            "createdAt": new Date().getTime()
          },
          "unreadCount": 0
        }

        console.log("newwwwwwwwwwww")
        // console.log(modified_seleted_user)
        console.log("newwwwwwwwwwww")
        // Create the unreadMessages node
        const unreadMessagesRef = ref(db, `unreadMessages/${newChatroomId}/${user.userId}/${fbaseUser.userId}`);
        set(unreadMessagesRef, 1)
          .then(() => console.log("Unread messages node created successfully!"))
          .catch((error) => console.error("Error creating unread messages node:", error));
  
          navigation.navigate(ROUTES.chat_conversation, { 
            chatroomId: newChatroomId,
            selectedUser:modified_seleted_user,
            fbaseUser: fbaseUser,
            schedule: selected_schedule.schedule, 
          });

          
        // return;
      }
  
      // Add the user to the friend list if they don't already exist
      const userFriends = user.friends || [];
      update(ref(db, `users/${user.userId}`), {
        friends: [
          ...userFriends,
          {
            userId: fbaseUser.userId,
            firstname: fbaseUser.firstname,
            lastname: fbaseUser.lastname,
            email: fbaseUser.email,
            avatar: fbaseUser.avatar,
            schedule: selected_schedule,
            schedule: selected_scheduleId,
            chatroomId: newChatroomId,
          },
        ],
      });
  
      const currentUserFriends = fbaseUser.friends || [];
      update(ref(db, `users/${fbaseUser.userId}`), {
        friends: [
          ...currentUserFriends,
          {
            userId: user.userId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            avatar: user.avatar,
            schedule: selected_schedule,
            schedule: selected_scheduleId,
            chatroomId: newChatroomId,
          },
        ],
      });

     
  
    } catch (error) {
      console.error(error);
    }
  };
  
  // Add Cleaner to my friend list
  const onAddFriend = async uid => {
    // alert(uid)
    try {
 
      //find user and add it to my friends and also add me to his friends
      const user = await findUser(uid);
      console.log("friiiiiiiend")
      console.log(fbaseUser.userId)
      console.log(user.userId) // firend ID
      console.log("friiiiiiiend")

      if (user) {
        if (user.userId === fbaseUser.userId) {
          // don't let user add himself
          return;
        }
        

        if (
          fbaseUser.friends &&
          fbaseUser.friends.findIndex(f => f.userId === user.userId) > 0
        ) {
          // alert("friend exists")
          // don't let user add a user twice
          return;
        }

       
        
        // create a chatroom and store the chatroom id
        // Create a new chatroom document in the database
        const newChatroomRef = push(ref(db, 'chatrooms'), {
          firstUser: fbaseUser.userId,
          secondUser: user.userId,
          thirdUser: 'automatedUserId', // Add automated third member here
          messages: [],
        });

        // Get the generated chatroom ID
        const newChatroomId = newChatroomRef.key;

        // alert(newChatroomId)

        // Function to create the unreadMessages node with an empty object
        const unreadMessagesRef = ref(db, `unreadMessages/${newChatroomId}/${user.userId}/${fbaseUser.userId}`);
        
        // Set an initial value for the unread count
        set(unreadMessagesRef, 1)
        .then(() => {
          console.log("Unread messages node created successfully!");
        })
        .catch((error) => {
          console.error("Error creating unread messages node:", error);
        });
              
      

        // Add the new chatroom ID to the user's friend list
        const userFriends = user.friends || [];
        update(ref(db, `users/${user.userId}`), {
          friends: [
            ...userFriends,
            {
              userId: fbaseUser.userId,
              firstname: fbaseUser.firstname,
              lastname: fbaseUser.lastname,
              email: fbaseUser.email,
              avatar: fbaseUser.avatar,
              schedule: selected_schedule.schedule,
              scheduleId: selected_scheduleId,
              chatroomId: newChatroomId,
            },
          ],
        });
        


        // Step 1: Retrieve the current friends list
        const currentUserFriendsRef = ref(db, `users/${fbaseUser.userId}/friends`);
        get(currentUserFriendsRef).then((snapshot) => {
          const currentUserFriends = snapshot.val() || [];

          // Step 2: Append the new friend to the list
          const updatedFriendsList = [
            ...currentUserFriends,
            {
              userId: user.userId,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              avatar: user.avatar,
              schedule: selected_schedule.schedule,
              scheduleId: selected_scheduleId, // Changed key to avoid duplicates
              chatroomId: newChatroomId,
            },
          ];

          // Step 3: Update the friends list in Firebase
          update(ref(db, `users/${fbaseUser.userId}`), {
            friends: updatedFriendsList,
          });
        });




        // Send automated message to the new chatroom
        const automatedMessage = {
          _id: Math.random().toString(36).substring(7), // Generate unique message ID
          text: 'cleaning resquest!', // Automated message content
          details: {
            selected_schedule:selected_schedule.schedule,
            selected_scheduleId:selected_scheduleId,
            hostId:fbaseUser.userId,
            hostFname:fbaseUser.firstname,
            hostLname:fbaseUser.lastname,
            expo_push_notification: currentUser.expo_push_token
          },
          cleaning_fee:selected_schedule.schedule.total_cleaning_fee,
          status:'pending',
          createdAt: new Date().getTime(), // Timestamp of when the message was sent
          system: true, // Flag to indicate it's a system message
        };

        // Update the chatroom document with the automated message
        update(ref(db, `chatrooms/${newChatroomId}`), {
          messages: [automatedMessage],
        });

        // Update the firend list of the receiver
        

        // Send push notification to friend
        const expo_pn = {
          to:currentUser.expo_push_token, // for testing
          // to:item.expo_push_token, // cleaner expo_push_token
          title:"Cleaning Resquest",
          body:`${item.firstname} ${item.lastname} just sent you a cleaning request`,
          data: {
            'screen': ROUTES.cleaner_schedule_details,
            'params': {
                'senderId': currentUserId,  
                'receiverId': item.cleanerId, 
                'selected_scheduleId': selected_scheduleId, 
                'senderFirstName':currentUser.firstname,
                'senderLastName':currentUser.lastname,
                'cleaning_date':selected_schedule.schedule.cleaning_date,
                'cleaning_time':selected_schedule.schedule.cleaning_time,
                'chatroomId':newChatroomId,
                'sender_expo_push_token':currentUser.expo_push_token, // sender/host expo_push_token
            }
          }
        }
        console.log("expoinfo...........")
        // console.log(JSON.stringify(expo_pn, null, 2))

        userService.sendCleaningRequestPushNotification(expo_pn)
        .then(response => {

          const res = response.data
          // console.log(res)
          //
          console.log("Message sent")
        })

        

        console.log('Automated message sent successfully.');

        
      
    }
      } catch (error) {
        console.error(error);
      }
    };

  

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  

  const fetchSelectedUserJobs = async() => {
    const selectedUserId = item.cleanerId
    userService.getUserCompletedJobs(selectedUserId)
    .then(response => {
      const res = response.data
      console.log("syyyyyyy")
      // console.log(res)
      setCompletedSchedules(res)
      console.log("syyyyyyy")
    })
  }

  const fetchCleanerChatRef = async() => {
    const cleanerId = item.cleanerId
     
    await userService.getCleanerChatReference(cleanerId, selected_scheduleId)
    .then(response => {
      const res = response.data.data
      console.log("syyyyyyy1064")
    //   console.log(res["params"])
      setCleanerChatReference(res["params"])
      console.log("syyyyyyy208")
    })
  }

  const fetchCleanerFeedbacks = async() => {
    const response = await userService.getCleanerFeedbacks(item.cleanerId)
    setReviews(response.data.data)
    // console.log(JSON.stringify(response.data.data, null, 2))
  }

  console.log("P..........................son")
  // console.log(cleaner_chat_reference)

  const openExisitingConversation = () => {
    
    navigation.navigate(ROUTES.chat_conversation,{
        selectedUser:cleaner_chat_reference,
        fbaseUser: fbaseUser,
        schedule: selected_schedule.schedule 
    })
  }



  // Example usage:
  const lat1 = 40.7128; // Latitude of start point (e.g., New York)
  const lon1 = -74.0060; // Longitude of start point
  const lat2 = 34.0522; // Latitude of end point (e.g., Los Angeles)
  const lon2 = -118.2437; // Longitude of end point

  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  console.log(`Distance: ${distance.toFixed(2)} km`);


  const openReviews = () => {
    setVisible(true)
  }


const handleAddFriend = async () => {
    try {
      await onAddFriend(uid, db, fbaseUser, selectedSchedule, selectedScheduleId);
      Alert.alert('Success', 'Friend added successfully');
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend.');
    }
  };

const handleBooking = async() => {
    data = {
        scheduleId:selected_scheduleId,
        hostId:currentUserId,
        hostFirstname:currentUser.firstname,
        hostLastname:currentUser.lastname,
        cleanerId: item.cleanerId,
        cleaning_date:selected_schedule.schedule.cleaning_date,
        cleaning_time:selected_schedule.schedule.cleaning_time,
        sender_expo_push_token:currentUser.expo_push_token,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    
   

    await userService.sendCleaningRequest(data)
      .then(response => {
        // Return requestId
        const res = response.data
        // console.log("This is the requestId", res)
        const requestId = res.data
        console.log(response.status)
        // console.log(response.data.data)
    
    const notificationMsg =`${currentUser.firstname} ${currentUser.lastname} sent you a cleaning request`
    // Example usage:
    // sendCleaningRequestPushNotification(
        sendPushNotifications(
            cleaner_tokens, // Replace with a valid Expo Push Token
            currentUser.firstname+" "+currentUser.lastname,
            notificationMsg,
                {
                screen: ROUTES.cleaner_schedule_review,
                params: {
                    scheduleId:selected_scheduleId,
                    hostId:currentUserId,
                    requestId:requestId,
                    hostFirstname:currentUser.firstname,
                    hostLastname:currentUser.lastname,
                    cleanerId: item.cleanerId,
                    cleaning_date:selected_schedule.schedule.cleaning_date,
                    cleaning_time:selected_schedule.schedule.cleaning_time,
                },
                }

        );
     
        // Clear navigation stack and redirect to dashboard
        navigation.reset({
          index: 0,
          routes: [{ 
              name: ROUTES.host_dashboard,
              params: { refresh: true } // Optional: trigger data refresh
          }]
      });
        
      }).catch((err)=> {
        console.log(err)
      })
}
 
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor={COLORS.primary} />
        <Animatable.View animation="fadeIn" duration={600}>
          <View style={styles.avatar_background}>
            {item.avatar !=="" ? 
            <Avatar.Image
                size={120}
                source={{uri:item.avatar}}
                style={{ backgroundColor: COLORS.gray,  marginBottom:0 }}
            />
            :
            <Avatar.Icon
                size={120}
                icon="account" // Provide a default icon here
                style={styles.avatar}
            />
          }
            <Text style={styles.name}>{item.firstname} {item.lastname}</Text>
            <Text style={styles.location}>{item.location.city}, {item.location.region}</Text>

            <View style={styles.distance}>
            
          </View>
          </View>
        </Animatable.View>
        <View style={styles.address_bar}>
            <View style={styles.addre}>
              <Text style={{color:COLORS.light_gray_1}}>{item?.address || item.contact?.address}</Text>
              {item.distance ? 
                <Text style={{fontSize:13, color:COLORS.light_gray}}>{item.distance.toFixed(1)} Miles away</Text>
                :
                <Text style={{fontSize:13, color:COLORS.light_gray}}>{distanceKm?.toFixed(1)} miles away</Text>
              }
            </View>
        </View>
      <View style={styles.container}>
        {/* Main content of the parent screen */}
        
        <ScrollView style={styles.content}
          refreshControl={ // Step 3: Add RefreshControl
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >

        
        <View style={styles.rating_review}>
            <View>
              <Text bold style={styles.title}>Reviews & Ratings</Text>
              <View style={styles.rating}>
                
                <StarRating
                  rating={calculateOverallRating(reviews, item.cleanerId)}
                  onChange={() => {}} // No-op function to disable interaction
                  maxStars={5} // Maximum stars
                  starSize={18} // Size of the stars
                  starStyle={{ marginHorizontal: 0 }} // Customize star spacing
                />
                <Text style={{marginLeft:5}}>{calculateOverallRating(reviews, item.cleanerId)}</Text>
              </View>
            </View>
            <View>
              {reviews.length > 0 ? <Text onPress={openReviews} style={{color:COLORS.primary}}>See all {reviews.length} reviews</Text>
              :
              ""}
              
            </View>
        </View>

        <View style={styles.tabsContainer}>
              <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 1 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(1)}>
                {/* <MaterialCommunityIcons name="camera" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} /> */}
                <Text style={styles.tab_text}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 2 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(2)}>
                {/* <MaterialCommunityIcons name="camera" size={24} color={currentStep === 1 ? COLORS.primary : COLORS.gray} /> */}
                <Text style={styles.tab_text}>Availability</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 3 ? COLORS.primary : "#f0f0f0"}]} onPress={() => setCurrentStep(3)}>
                {/* <MaterialCommunityIcons name="camera-flip" size={24} color={currentStep === 2 ? COLORS.primary : COLORS.gray} /> */}
                <Text style={styles.tab_text}>License</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, { borderBottomColor: currentStep == 4 ? COLORS.primary :"#f0f0f0"}]} onPress={() => setCurrentStep(4)}>
                {/* <MaterialCommunityIcons name="format-list-checks" size={24} color={currentStep === 3 ? COLORS.primary : COLORS.gray} /> */}
                <Text style={styles.tab_text}>Portfolio</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{padding:0}}>
              {currentStep === 1 && 
              <Animatable.View animation="slideInLeft" duration={600}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                <AboutMeDisplay 
                  mode="display"
                  aboutme={item.aboutme}
                />
                </ScrollView>
                </Animatable.View>
              }
              {currentStep === 2 && 
                <Animatable.View animation="slideInLeft" duration={600}>
                  <AvailabilityDisplay
                    mode="display"
                    availability={item.availability}
                  />
                </Animatable.View>
              }

              {currentStep === 3 && 
              <Animatable.View animation="slideInLeft" duration={600}>
                <CertificationDisplay
                  mode="display"
                  certification={item.certification}
                />
              </Animatable.View>
              }


              {currentStep === 4 &&
              <Animatable.View animation="slideInLeft" duration={600}>
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                {/* <Portfolio 
                  portfolio={cleanerPortfolio} 
                  portfolio2={completed_schedules}
                /> */}
                </ScrollView>
              </Animatable.View>
              }

            </View>
        </ScrollView>

        <Modal 
            isVisible={visible} 
            onSwipeComplete={() => setVisible(false)} 
            swipeDirection="down"
            onBackdropPress={() => setVisible(false)}
            style={styles.modal}
            propagateSwipe={false}
            backdropColor="black"       // Set to black or any color
            backdropOpacity={0.1}       // Adjust opacity for transparency
            useNativeDriverForBackdrop={true}
        >
        <View style={styles.modalContent}>

        <View style={styles.modal_header}>
            <View>
              <Text style={styles.header}>Customer Reviews</Text>
              <View style={styles.rating}>
                
                <StarRating
                  rating={calculateOverallRating(reviews, item.cleanerId)}
                  onChange={setRating} // Handle rating changes
                  maxStars={5} // Maximum stars
                  starSize={18} // Size of the stars
                  starStyle={{ marginHorizontal: -1 }} // Customize star spacing
                />
                <Text style={{marginLeft:5, color:COLORS.gray}}>{calculateOverallRating(reviews, item.cleanerId)}  ({reviews.length} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeIcon}>
                <MaterialCommunityIcons name="close" size={30} color="gray" />
            </TouchableOpacity>
        </View>
          {openReviews  && (
             <Reviews ratings={reviews} cleanerId={item.cleanerId} />
          )}
          
          
        </View>
      </Modal>

      </View>

      <View style={styles.navigation}>
        <View>
        {/* <Text style={{color:COLORS.primary}}>Total Cleaning Fee </Text> */}
        <SchedulePrice 
          currency={currency}
          price={selected_schedule.schedule?.total_cleaning_fee || selected_schedule?.total_cleaning_fee}
        />
        </View>
        
        {
                cleaner_chat_reference?.chatroomId ? 
                ""
                :
                <TouchableOpacity 
                  style={{
                    backgroundColor:COLORS.deepBlue,
                    width:120,
                    borderRadius:50,
                    height:40
                  }}
                  title="Book Now"
                  onPress={handleBooking}
                >
                  <Text style={styles.button}>Book Now</Text>
                </TouchableOpacity>
              }


        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  avatar_background:{
    height:250,
    backgroundColor:COLORS.primary,
    justifyContent:'center',
    alignItems:'center'
  },
  name:{
    marginTop:10,
    fontSize:18,
    color:COLORS.white,
    fontWeight:'bold'
  },
  location:{
    fontSize:14,
    color:"#f8f8f8"
  },
  rating_review:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:10,
    marginHorizontal:10
  },
  rating:{
    flexDirection:'row',
    // justifyContent:'center',
    alignItems:'center'
  },
  location_block:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    height:60,
  },

  addre:{
    flex:0.7,
    padding:10
  },
  distance:{
    flex:0.3,
    padding:10,
    marginBottom:10
   
  },
  tabsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: "#e9e9e9",
    borderLeftColor:"#fff",
    borderRightColor:"#fff",
    marginTop:10
  },
  tab:{
    borderBottomWidth:1,
    borderLeftWidth:0,
    // borderLeftColor:"#fff",
    borderBottomColor: COLORS.primary,
    alignItems:'center',
    marginTop:10,
    paddingHorizontal:26
  },
  tab_text:{
    marginBottom:5,
  },
  communicate:{
    flexDirection:'row',
    justifyContent:'center',

  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end', // Aligns the modal to the bottom
  },
  modalContent: {
    width: width,
    height: height * 0.58, // Makes the modal a half-screen bottom sheet
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalPhoto: {
    width: '100%',
    height: '80%',
  },
  closeIcon: {
    right: 0,
    color:COLORS.light_gray
  },
  modal_header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'100%',
    paddingBottom:10
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#333',
  },
  address_bar:{
    minHeight:60,
    backgroundColor:COLORS.deepBlue,
    marginTop:-1
  },
  navigation:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:10,
    alignItems:'center',
    backgroundColor:"#fff",
    paddingVertical:15,
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 }, // Only top shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3, // Adjust for visibility
  },
  button:{
    alignSelf:'center',
    color:'white',
    paddingTop:10
  },
  avatar: {
    backgroundColor: COLORS.light_gray_1, // Customize background color
  },
});

export default CleanerProfileHost;

