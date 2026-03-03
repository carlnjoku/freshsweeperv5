import React, { useContext, useRef, useEffect,useState } from 'react';
import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, useWindowDimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import StarRating from '../../components/shared/StarRating';
import DraggableOverlay from '../../components/shared/DraggableOverlay';
import * as Animatable from 'react-native-animatable';
import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
import CertificationDisplay from '../cleaner/CertificationDisplay';
import Portfolio from './Portfolio/Portfolio';
import { cleanerPortfolio } from '../../utils/cleanerPortfolio';
import AboutMeDisplay from '../cleaner/AboutMeDisplay';
import userService from '../../services/connection/userService';
import calculateDistance from '../../utils/calculateDistance';
import { SchedulePrice } from '../../components/host/SchedulePrice';
import ROUTES from '../../constants/routes';
import CircularIcon from '../../components/shared/CircularIcon';
import { haversineDistance } from '../../utils/distanceBtwLocation';

export default function CleanerProfile({navigation, route}) {

  const{item, selected_schedule, selected_scheduleId} = route.params



  const {currentUserId, friendsWithLastMessagesUnread, fbaseUser, currentUser, currency} = useContext(AuthContext)
  // const{friendsWithLastMessagesUnread} = useContext(AuthContext)
  // Get distance between host and cleaner location

  const cleanerLocation = { latitude: item.location.latitude, longitude: item.location.longitude }; // Cleaner location 
  const scheduleLocation = { latitude: selected_schedule.schedule.apartment_latitude, longitude: selected_schedule.schedule.apartment_longitude }; // schedule location 
  // console.log(cleanerLocation)
  // console.log(scheduleLocation)
  const distanceKm = haversineDistance(cleanerLocation, scheduleLocation);
  console.log(distanceKm)

  console.log("_________eeeeeeeeeeeeeeeeee__________117")
  // console.log(JSON.stringify(item, null, 2))
  console.log("_________eeeeeeeeeeeeeeeeee__________")

  console.log("_________eeeeeeeeeeeeeeeeee__________111")
  // console.log(friendsWithLastMessagesUnread)
  console.log("_________eeeeeeeeeeeeeeeeee__________")


  console.log("_________eeeeeeeeeeeeeeeeeeItem1__________")
  // console.log(JSON.stringify(selected_schedule.schedule, null, 2))
  console.log("_________eeeeeeeeeeeeeeeeeeItem__________")

  const[selectedUser, setSelectedUser]=useState("")
  const[rating, setRating]=useState("")

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [completed_schedules, setCompletedSchedules] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [cleaner_chat_reference, setCleanerChatReference] = useState({});

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
  
    makeCall(item.contact.phone)
  }

  const addCleanerToFriendList = () => {
    // alert("hey")
    onAddFriendNoBooking(item.cleanerId)
  }

  
  useEffect(()=> {
    checkChatroonId()
    fetchSelectedUserJobs()
    fetchCleanerChatRef()

    const filteredData = friendsWithLastMessagesUnread.filter(row => row.schedule === selected_scheduleId && row.userId === item.cleanerId);

    // Log or use filteredData as needed
    console.log("L................................l")
    console.log(filteredData[0]);
    setCleanerChatReference(filteredData[0])
    console.log("L................................l")
    
  },[])

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
    
      console.log("chatrooooooooooooooooooooo0")
      // console.log(JSON.stringify(mySnapshot.val(), null, 2))
      console.log("chatrooooooooooooooooooooo0")

      // const res = mySnapshot.val()

      // const filteredArray = res.filter(item => item.userId === chrmId && item.schedule.schedule._id === selected_scheduleId);
      // alert(selected_scheduleId)
      // console.log("filter................")
      // console.log(JSON.stringify(filteredArray, null, 2))
      // console.log("filter................")
      return mySnapshot.val()
  }

  
  
  const onAddFriendNoBooking = async uid => {
    try {
      console.log("feeeeee....................")
      console.log(fbaseUser)
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
      alert("This user exists in my friends list")

      
      
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
        // alert("start messaging")
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
        console.log(modified_seleted_user)
        console.log("newwwwwwwwwwww")
        // Create the unreadMessages node
        const unreadMessagesRef = ref(db, `unreadMessages/${newChatroomId}/${user.userId}/${fbaseUser.userId}`);
        set(unreadMessagesRef, 1)
          .then(() => console.log("Unread messages node created successfully!"))
          .catch((error) => console.error("Error creating unread messages node:", error));
  

          // // Send push notification to friend
          // const expo_pn = {
          //   // to:currentUser.expo_push_token, // for testing
          //   to:item.expo_push_token, // cleaner expo_push_token
          //   title:"Cleaning Resquest",
          //   body:`${item.firstname} ${item.lastname} just sent you a cleaning request`,
          //   data: {
          //     'screen': ROUTES.cleaner_schedule_details,
          //     'params': {
          //         'senderId': currentUserId,  
          //         'receiverId': item.cleanerId, 
          //         'selected_scheduleId': selected_scheduleId, 
          //         'senderFirstName':currentUser.firstname,
          //         'senderLastName':currentUser.lastname,
          //         'cleaning_date':selected_schedule.schedule.cleaning_date,
          //         'cleaning_time':selected_schedule.schedule.cleaning_time,
          //         'chatroomId':newChatroomId,
          //         'sender_expo_push_token':currentUser.expo_push_token, // sender/host expo_push_token
          //     }
          //   }
          // }

          // userService.sendCleaningRequestPushNotification(expo_pn)
          // .then(response => {

          //   const res = response.data
          //   print(res)
          //   //
          //   console.log("Message sent")
          // })

          

          // console.log('Automated message sent successfully.');


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

      // Navigate to the conversation screen after adding the friend and creating the chatroom
      // navigation.navigate(ROUTES.chat_conversation, { 
      //   chatroomId: newChatroomId,
      //   selectedUser:item,
      //   fbaseUser: fbaseUser,
      //   schedule: selected_schedule, 
      // });
      
  
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
        // alert("sue")
        // else{
        //   alert(item.expo_push_token)

        //   // Create a new chatroom document in the database
        //   const newChatroomRef = push(ref(db, 'chatrooms'), {
        //     firstUser: fbaseUser.userId,
        //     secondUser: user.userId,
        //     thirdUser: 'automatedUserId', // Add automated third member here
        //     messages: [],
        //   });

        //   // Get the generated chatroom ID
        //   const newChatroomId = newChatroomRef.key;

        //   // Function to create the unreadMessages node with an empty object
        //   const unreadMessagesRef = ref(db, `unreadMessages/${newChatroomId}/${user.userId}/${fbaseUser.userId}`);
          
        //   // Set an initial value for the unread count
        //   set(unreadMessagesRef, 1)
        //   .then(() => {
        //     console.log("Unread messages node created successfully!");
        //   })
        //   .catch((error) => {
        //     console.error("Error creating unread messages node:", error);
        //   });
        
        //   alert(newChatroomId)
        //   // Just send notification if user already exists
        //   // Send push notification to friend
        //     const expo_pn = {
        //       // to:currentUser.expo_push_token, // for testing
        //       to:item.expo_push_token, // cleaner expo_push_token
        //       title:"Cleaning Resquest",
        //       body:`${item.firstname} ${item.lastname} just sent you a cleaning request`,
        //       data: {
        //         'screen': ROUTES.cleaner_schedule_details,
        //         'params': {
        //             'senderId': currentUserId,  
        //             'receiverId': item.userId, 
        //             'selected_scheduleId': selected_scheduleId, 
        //             'senderFirstName':currentUser.firstname,
        //             'senderLastName':currentUser.lastname,
        //             'chatroomId':newChatroomId,
        //             'sender_expo_push_token':currentUser.expo_push_token, // sender/host expo_push_token
        //         }
        //       }
        //     }
  
        //     userService.sendCleaningRequestPushNotification(expo_pn)
        //     .then(response => {
        //       console.log("Message sent")
        //     })
          

        // }

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
        // alert(fbaseUser.userId)
        // Add the new chatroom ID to the current user's friend list
        // const currentUserFriends = fbaseUser.friends || [];
        // update(ref(db, `users/${fbaseUser.userId}`), {
        //   friends: [
        //     ...currentUserFriends,
        //     {
        //       userId: user.userId,
        //       firstname: user.firstname,
        //       lastname: user.lastname,
        //       email: user.email,
        //       avatar: user.avatar,
        //       schedule: selected_schedule.schedule,
        //       schedule: selected_scheduleId,
        //       chatroomId: newChatroomId,
        //     },
        //   ],
        // });


        

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
        console.log(JSON.stringify(expo_pn, null, 2))

        userService.sendCleaningRequestPushNotification(expo_pn)
        .then(response => {

          const res = response.data
          console.log(res)
          //
          console.log("Message sent")
        })

        

        console.log('Automated message sent successfully.');

        // // Update schedule with chatroom Info
        // const chatroom = {
        //   chatroomId:newChatroomId,
        //   scheduleId:selected_scheduleId,
        //   schedule_apartment:selected_schedule.schedule.apartment_name,
        //   sender_expo_push_token:currentUser.expo_push_token,
        // }

        // userService.updateSheduleWithChatroom(chatroom)
        // .then(response => {
        //   console.log("Schedule Updated")
        // })
      
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
      console.log(res)
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
      console.log(res["params"])
      setCleanerChatReference(res["params"])
      console.log("syyyyyyy208")
    })
  }

  console.log("P..........................son")
  console.log(cleaner_chat_reference)

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
  


  return (
    
    
    <SafeAreaView
      style={{
        flex:1,
        backgroundColor:COLORS.white,
      }}
    >
        <Animatable.View animation="slideInRight" duration={600}>
          <View style={styles.avatar_background}>
            <Avatar.Image
                size={120}
                source={{uri:item.avatar}}
                style={{ backgroundColor: COLORS.gray,  marginBottom:0 }}
            />
            <Text style={styles.name}>{item.firstname} {item.lastname}</Text>
            <Text style={styles.location}>{item.location.city}, {item.location.region}</Text>
          </View>
        </Animatable.View>
        <View style={{flex:1}}>
        <Animatable.View animation="slideInRight" duration={600}>
        <View style={styles.container}>
          <View style={styles.rating_review}>
            <View>
              <Text bold style={styles.title}>Reviews & Ratings</Text>
              <View style={styles.rating}>
                <StarRating 
                  initialRating = {4}
                  onRatingChange = {handleRatingChange}
                />
                <Text style={{marginLeft:5}}>4.5</Text>
              </View>
            </View>
            <View>
              <Text onPress={toggleOverlay} style={{color:COLORS.primary}}>See all reviews</Text>
            </View>
        </View>

        <View style={styles.location_block}>
          <View style={styles.addre}>
            <Text>{item.contact.address}</Text>
            {item.distance ? 
              <Text style={{fontSize:13, color:COLORS.light_gray}}>{item.distance.toFixed(1)} Miles away</Text>
              :
              <Text style={{fontSize:13, color:COLORS.light_gray}}>{distanceKm?.toFixed(1)} miles away</Text>
            }
          </View>
          <View style={styles.distance}>
            <View style={styles.communicate}>
              {/* <TouchableOpacity><Ionicons name="chatbox-ellipses-outline" size={24} /> </TouchableOpacity>
              <TouchableOpacity><MaterialCommunityIcons name="phone" size={24} /> </TouchableOpacity> */}

              <CircularIcon iconName="phone" onPress = {callPhone} />
              {
                cleaner_chat_reference?.chatroomId ? 
                <CircularIcon iconName="chat-processing-outline" onPress={openExisitingConversation} />
                :
                <CircularIcon iconName="chat-processing-outline" onPress={addCleanerToFriendList} />
              }
            </View>
            
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
              <Animatable.View animation="slideInRight" duration={600}>
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
                <Animatable.View animation="slideInRight" duration={600}>
                  <AvailabilityDisplay
                    mode="display"
                    availability={item.availability}
                  />
                </Animatable.View>
              }

              {currentStep === 3 && 
              <Animatable.View animation="slideInRight" duration={600}>
                <CertificationDisplay
                  mode="display"
                  certification={item.certification}
                />
              </Animatable.View>
              }


              {currentStep === 4 &&
              <Animatable.View animation="slideInRight" duration={600}>
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                <Portfolio 
                  portfolio={cleanerPortfolio} 
                  portfolio2={completed_schedules}
                />
                </ScrollView>
              </Animatable.View>
              }

            </View>
          
          
          
        <View>
        {overlayVisible && <DraggableOverlay />}

        </View>
       
      </View>
          
      

      
      </Animatable.View>
      </View>

      <View style={styles.navigation}>
        <View>
        <Text style={{color:COLORS.primary}}>Total Cleaning Fee </Text>
        <SchedulePrice 
          currency={currency}
          price={selected_schedule.schedule.total_cleaning_fee}
        />
        </View>
        
        {
                cleaner_chat_reference?.chatroomId ? 
                ""
                :
                <TouchableOpacity 
          
                  title="Book Now"
                  onPress={() => onAddFriend(item.cleanerId)} 
                >
                  <Text style={styles.button}>Book Now</Text>
                </TouchableOpacity>
              }


        
      </View>
    </SafeAreaView>
    
  )
}


const styles = StyleSheet.create({
  avatar_background:{
    height:200,
    backgroundColor:COLORS.primary,
    justifyContent:'center',
    alignItems:'center'
  },
  name:{
    fontSize:18,
    color:COLORS.white
  },
  location:{
    fontSize:14,
    color:"#f8f8f8"
  },
  container:{
    padding:10,
    backgroundColor:COLORS.white
  },
  
  rating:{
    flexDirection:'row',
    // justifyContent:'center',
    alignItems:'center'
  },
  button_container:{
    flex: 1,
    justifyContent: 'flex-end', // Align the view at the bottom
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    backgroundColor:COLORS.white,
    paddingHorizontal:20,

  },
  button:{
    paddingHorizontal:25,
    backgroundColor:COLORS.primary,
    color:COLORS.white,
    padding:5,
    borderRadius:50,
    fontWeight:'bold',
    fontSize:16,
    paddingVertical:10
  }, 
  title:{
    fontSize:16,
    marginVertical:2
  },
  rating_review:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:10,
    marginHorizontal:10
  },
  tabsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: "#e9e9e9",
    borderLeftColor:"#fff",
    borderRightColor:"#fff",
    marginTop:20
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
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor:COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray_1,
  },
  rates:{
    fontSize:18,
    fontWeight:'500',
    // textAlign:'center'
  },
  location_block:{
    flexDirection:'row',
    justifyContent:'center',
    height:60,
    borderRadius:5,
    borderWidth:1,
    borderColor:COLORS.primary_light,
  },

  addre:{
    flex:0.7,
    padding:10
  },
  distance:{
    flex:0.3,
    padding:10,
    backgroundColor:COLORS.primary_light_1,
    borderBottomRightRadius:5,
    borderTopRightRadius:5,
    alignItems:''
  },
  communicate:{
    flexDirection:'row',
    justifyContent:'space-between',
  }
})