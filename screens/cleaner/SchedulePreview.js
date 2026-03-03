import React, { useContext, useEffect,useState } from 'react';
import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, Alert, ScrollView, Modal, Image, View, useWindowDimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
// import GoogleMapComponent from '../../components/shared/GoogleMap';
// import calculateETA from '../../utils/calculateETA';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import calculateETA from '../../utils/calculateETA';
import moment from 'moment';
import CardColored from '../../components/shared/CardColored';
import CustomCard from '../../components/shared/CustomCard';
import CardNoPrimary from '../../components/shared/CardNoPrimary';
import CircleIconButton1 from '../../components/shared/CircleButton1';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import CircleIcon from '../../components/shared/CirecleIcon';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import { acceptCleaningRequestPushNotification, sendPushNotifications } from '../../utils/sendPushNotification';
import calculateDistance from '../../utils/calculateDistance';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Chip } from 'react-native-paper';
import { getAddressFromCoords, getCityState } from '../../utils/getAddressFromCoordinates';
import { verification_items } from '../../data';
import TaskInfoBanner from './TaskInfoBanner';
import CleaningSummary from './CleaningSummary';

export default function SchedulePreview({route}) {

    const navigation = useNavigation()
    const {request_created_at, requestId, scheduleId, hostId} = route.params
    const {geolocationData, currentUserId, currentUser} = useContext(AuthContext)


    const distanceInKm = 10; // Example distance in kilometers
    const averageSpeedKph = 50; // Example average speed in kilometers per hour
    const eta = calculateETA(distanceInKm, averageSpeedKph);

    const dateTime = moment(eta.toLocaleString(), 'M/D/YYYY, h:mm:ss A');

    const time_to_destination = dateTime.minutes()

    console.log("ETA1:", time_to_destination+ " min"); // Output ETA in local date/time format
   


    const { width } = useWindowDimensions();
    const numColumns2 = 2
    const columnWidth2 = width / numColumns2 - 10; // Adjusted width to accommodate margins

    const[isOpenConfirmation, setIsOpenConfirmatiom] = useState("")
    const[isOpenModal, setOpenModal] = useState(false)

    const[schedule, setSchedule] = useState({})
    const[checklist, setChecklist] = useState({})
    const[assignedTo, setAssignedTo] = useState({})

    const[cleaning_date, setCleaningDate] = useState("")
    const[cleaning_time, setCleaningTime] = useState("")
    const[cleaning_end_time, setCleaningEndTime] = useState("")
    const[room_type_and_size, setRoomTypeSize] = useState([])
    const[host_tokens, setHostPushToken] = useState([])
    const[apartment_latitude, setApartmentLatitude] = useState("")
    const[apartment_longitude, setApartmentLongitude] = useState("")
    const[address, setAddress] = useState(null)
    const[city, setCity] = useState(null)
    const[state, setState] = useState(null)
    const[postalcode, setPostalCode] = useState(null)
    const[country, setCountry] = useState(null)
    const[apartment_name, setApartmentName] = useState("")
    const[total_cleaning_fee, setTotalCleaningFee] = useState("")
    const[regular_cleaning, setRegularCleaning] = useState([])
    const[extra, setExtra] = useState([])
    const[distance, setDistance] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const checklist1 = {
      "group_1": {
        "totalTime": 127,
        "rooms": [
          "Bedroom_0",
          "Bathroom_0",
          "Livingroom_0"
        ],
        "price": 136.6,
        "extras": [
          "Pet cleanup",
          "Laundry",
          "Exterior cleaning"
        ],
        "details": {
          "Bedroom": {
            "photos": [],
            "tasks": [
              {
                "label": "Change linens",
                "value": false,
                "name": "change_linens_bedroom",
                "id": "task_01"
              },
              {
                "label": "Make the bed",
                "value": false,
                "name": "make_the_bed_bedroom",
                "id": "task_02"
              },
              {
                "label": "Dust surfaces",
                "value": false,
                "name": "dust_surfaces_bedroom",
                "id": "task_03"
              },
              {
                "label": "Vacuum carpet",
                "value": false,
                "name": "vacuum_carpet_bedroom",
                "id": "task_04"
              },
              {
                "label": "Organize closet",
                "value": false,
                "name": "organize_closet_bedroom",
                "id": "task_05"
              },
              {
                "label": "Check for damages",
                "value": false,
                "name": "check_for_damages_bedroom",
                "id": "task_06"
              }
            ],
            "notes": {
              "Bedroom_0": {
                "text": "I have to make sure you clean the master line "
              }
            }
          },
          "Bathroom": {
            "photos": [],
            "tasks": [
              {
                "label": "Clean toilet",
                "value": false,
                "name": "clean_toilet_bathroom",
                "id": "task_07"
              },
              {
                "label": "Wipe mirrors",
                "value": false,
                "name": "wipe_mirrors_bathroom",
                "id": "task_08"
              },
              {
                "label": "Sanitize sink",
                "value": false,
                "name": "sanitize_sink_bathroom",
                "id": "task_09"
              },
              {
                "label": "Empty trash",
                "value": false,
                "name": "empty_trash_bathroom",
                "id": "task_10"
              },
              {
                "label": "Check for mold",
                "value": false,
                "name": "check_for_mold_bathroom",
                "id": "task_11"
              }
            ],
            "notes": {
              "Bathroom_0": {
                "text": ""
              }
            }
          },
          "Livingroom": {
            "photos": [],
            "tasks": [
              {
                "label": "Sweep & Mop",
                "value": false,
                "name": "sweep_&_mop_livingroom",
                "id": "task_12"
              },
              {
                "label": "Vacuum",
                "value": false,
                "name": "vacuum_livingroom",
                "id": "task_13"
              },
              {
                "label": "Clean upholstery",
                "value": false,
                "name": "clean_upholstery_livingroom",
                "id": "task_14"
              },
              {
                "label": "Dust electronics",
                "value": false,
                "name": "dust_electronics_livingroom",
                "id": "task_15"
              },
              {
                "label": "Dust furniture",
                "value": false,
                "name": "dust_furniture_livingroom",
                "id": "task_16"
              },
              {
                "label": "Dust surfaces",
                "value": false,
                "name": "dust_surfaces_livingroom",
                "id": "task_17"
              },
              {
                "label": "Organize & tidy up",
                "value": false,
                "name": "organize_&_tidy_up_livingroom",
                "id": "task_18"
              },
              {
                "label": "Check for damages",
                "value": false,
                "name": "check_for_damages_livingroom",
                "id": "task_19"
              }
            ],
            "notes": {
              "Livingroom_0": {
                "text": ""
              }
            }
          },
          "Extra": {
            "photos": [],
            "tasks": [
              {
                "label": "Pet cleanup",
                "value": true,
                "name": "extra_01",
                "id": "extra_01",
                "time": 20,
                "price": 25
              },
              {
                "label": "Laundry",
                "value": true,
                "name": "extra_02",
                "id": "extra_02",
                "time": 5,
                "price": 5
              },
              {
                "label": "Exterior cleaning",
                "value": true,
                "name": "extra_03",
                "id": "extra_03",
                "time": 5,
                "price": 5
              }
            ]
          }
        }
      },
      "group_2": {
        "totalTime": 104,
        "rooms": [
          "Bedroom_1",
          "Bedroom_2",
          "Kitchen_0"
        ],
        "price": 83.2,
        "extras": [],
        "details": {
          "Bedroom": {
            "photos": [],
            "tasks": [
              {
                "label": "Change linens",
                "value": false,
                "name": "change_linens_bedroom",
                "id": "task_01"
              },
              {
                "label": "Make the bed",
                "value": false,
                "name": "make_the_bed_bedroom",
                "id": "task_02"
              },
              {
                "label": "Dust surfaces",
                "value": false,
                "name": "dust_surfaces_bedroom",
                "id": "task_03"
              },
              {
                "label": "Vacuum carpet",
                "value": false,
                "name": "vacuum_carpet_bedroom",
                "id": "task_04"
              },
              {
                "label": "Organize closet",
                "value": false,
                "name": "organize_closet_bedroom",
                "id": "task_05"
              },
              {
                "label": "Check for damages",
                "value": false,
                "name": "check_for_damages_bedroom",
                "id": "task_06"
              }
            ],
            "notes": {
              "Bedroom_1": {
                "text": ""
              }
            }
          },
          "Kitchen": {
            "photos": [],
            "tasks": [
              {
                "label": "Wipe countertops",
                "value": false,
                "name": "wipe_countertops_kitchen",
                "id": "task_20"
              },
              {
                "label": "Empty & clean fridge",
                "value": false,
                "name": "empty_&_clean_fridge_kitchen",
                "id": "task_21"
              },
              {
                "label": "Empty trash",
                "value": false,
                "name": "empty_trash_kitchen",
                "id": "task_22"
              },
              {
                "label": "Clean stovetop & oven",
                "value": false,
                "name": "clean_stovetop_&_oven_kitchen",
                "id": "task_23"
              },
              {
                "label": "Scrub the sink",
                "value": false,
                "name": "scrub_the_sink_kitchen",
                "id": "task_24"
              },
              {
                "label": "Sweep & Mop floor",
                "value": false,
                "name": "sweep_&_mop_floor_kitchen",
                "id": "task_25"
              },
              {
                "label": "Check for expired food",
                "value": false,
                "name": "check_for_expired_food_kitchen",
                "id": "task_26"
              }
            ],
            "notes": {
              "Kitchen_0": {
                "text": ""
              }
            }
          }
        }
      }
    }


    // Retrieve the count for each room type
    const bedroomCount = room_type_and_size.find(room => room.type === "Bedroom")?.number || 0;
    const bathroomCount = room_type_and_size.find(room => room.type === "Bathroom")?.number || 0;
    const kitchen = room_type_and_size.find(room => room.type === "Kitchen")?.number || 0;
    const livingroomCount = room_type_and_size.find(room => room.type === "Livingroom")?.number || 0;

    const bedroomSize = room_type_and_size.find(room => room.type === "Bedroom")?.size || 0;
    const bathroomSize = room_type_and_size.find(room => room.type === "Bathroom")?.size || 0;
    const kitchenSize = room_type_and_size.find(room => room.type === "Kitchen")?.size || 0;
    const livingroomSize = room_type_and_size.find(room => room.type === "Livingroom")?.size || 0;
    // console.log("Tasks", item.selected_schedule.schedule.regular_cleaning)
    // alert(requestId)

    
    
    
    useEffect(()=> {
      
      fetchUser()
      fetchHostPushTokens()
      fetchSchedule()
    },[])

    const fetchUser = async () => {
      console.log('fetchUser called'); 
      try {
        const response = await userService.getUser(currentUserId);
        const res = response.data;
        
        // console.log("task",res.stripe_business_type)
        console.log("emptey")
        // setEmail(res.email);
        // setFirstname(res.firstname);
        // setLastname(res.lastname);
        // setAccountStatus(res.stripe_accountStatus);
        // setAccountId(res.stripe_account_id);
        // setLocation(res.location);
       
        
       
        
        const cleanerData = {
          email: res.email,
          firstname: res.firstname,
          lastname: res.lastname,
          location: res.location,
          stripe_account_id: res.stripe_account_id,
          stripe_accountStatus: res.stripe_accountStatus,
          stripe_id_verification: res.id_verification,
          stripe_tax_info: res.stripe_tax_info,
        };
    
        const mergedItems = verification_items.map((item) => {
          let updatedStatus = item.status;
    
          if (item.type === "ID_verify") {
            updatedStatus = cleanerData.stripe_id_verification ? "verified" : "not verified";
          } else if (item.type === "payment_onboarding") {
            updatedStatus = cleanerData.stripe_account_id ? "account exists" : "account missing";
          } else if (item.type === "tax_info") {
            updatedStatus = cleanerData.stripe_accountStatus === "Onboarded" ? "completed" : "pending";
          }
    
          return {
            ...item,
            status: updatedStatus,
            email: cleanerData.email,
            firstname: cleanerData.firstname,
            lastname: cleanerData.lastname,
            location: cleanerData.location,
            stripe_account_id: cleanerData.stripe_account_id,
          };
        });
        
        // alert(currentUser.stripe_account_id)

        // if (!currentUser.stripe_account_id || currentUser.stripe_accountStatus !== 'Onboarded' || !res.stripe_business_type){
        //   navigation.navigate(ROUTES.cleaner_verification,{
        //     verifyItem:mergedItems
        //   })
        // }
        
    
      } catch (e) {
        console.log("Fetch user error:", e);
        setLoading(false);
      }
    };


    

    // useEffect(() => {
    //   const fetchLocation = async () => {
    //     try {
    //       const locationData = await getAddressFromCoords(apartment_latitude, apartment_longitude);
    //       alert(apartment_latitude)
    //       console.log(locationData)
    //       if (locationData) {
    //         setAddress(locationData);
    //       } else {
    //         setError('Location information not available');
    //       }
    //     } catch (err) {
    //       setError('Failed to fetch location data');
    //       console.error(err);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };
  
    //   fetchLocation();
    // }, [apartment_latitude, apartment_longitude]);
  

    const fetchHostPushTokens = async() => {
      await userService.getUserPushTokens(hostId)
      .then(response => {
          const res = response.data.tokens
          setHostPushToken(res)
          // console.log("User tokens", res)
      })
    }

    const fetchSchedule = async () => {
      try {
        const response = await userService.getScheduleById(scheduleId)
        const res = response.data;
    
       
        console.log("weeeeeeeekie")
        console.log(JSON.stringify(res.overall_checklist.checklist, null, 2))
        
        setSchedule(res)
        setChecklist(res.overall_checklist.checklist)
        setAssignedTo(res.assignedTo)
        setRoomTypeSize(res.schedule.selected_apt_room_type_and_size)
        setCleaningDate(res.schedule.cleaning_date)
        setCleaningTime(res.schedule.cleaning_time)
        setCleaningEndTime(res.schedule.cleaning_end_time)
    
        const lat1 = geolocationData.latitude;
        const lon1 = geolocationData.longitude;
        const lat2 = res.schedule.apartment_latitude;
        const lon2 = res.schedule.apartment_longitude;
    
        const dist = calculateDistance(lat1, lon1, lat2, lon2);
        setDistance(dist)
        setApartmentLatitude(lat2)
        setApartmentLongitude(lon2)
    
        const coordinate = {
          latitude: lat2,
          longitude: lon2
        };
    
        const result = await getCityState(coordinate);
        
        setCity(result.city)
        setState(result.state)
        setPostalCode(result.postalCode)
        setCountry(result.country)
      
        
    
        setApartmentName(res.schedule.apartment_name)
        setTotalCleaningFee(res.schedule.total_cleaning_fee)
        setRegularCleaning(res.schedule.regular_cleaning)
        setExtra(res.schedule.extra)
    
      } catch (e) {
        console.log(e)
      }
    }

    

    const handleOpenDirections = () => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentUser.location.latitude},${currentUser.location.longitude }&destination=${apartment_latitude},${apartment_longitude}&travelmode=driving`;
    
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open Google Maps", err)
      );
    };

    
    const taskItem = ( {item,index} ) => (
    <View style={[styles.tasks, { width: columnWidth2 }]}>
        <Text style={{fontSize:13}}>{item.label} </Text>
    </View>
    
    )

    const onClose = () => {
        setOpenModal(false)
    }
    const taskItem2 = ( {item,index} ) => (
    <View style={[styles.tasks, { width: columnWidth2 }]}>
        <Text style={{fontSize:13}}><MaterialCommunityIcons name={item.icon} size={16} /> {item.label} </Text>
    </View>
    
    )

    const openModal = () => {
    setIsOpenConfirmatiom(true)
    }

    const handleOpenConfirmClockIn = () => {
    setOpenModal(true)
    // navigation.navigate(ROUTES.host_new_booking);
    }
    const handleCloseConfirmClockIn = () => {
      setOpenModal(false)

    
    }

    const givenDate =  new Date(request_created_at);
    const currentDate = new Date();

    // Calculate difference in seconds
    const differenceInSeconds = Math.floor((currentDate - givenDate) / 1000);

    console.log(`Difference: ${differenceInSeconds} seconds`);
    console.log(request_created_at)
    
    const handleAccept = (group, acceptance) => {
      
      const data = {
        cleanerId:currentUserId,
        scheduleId:scheduleId,
        requestId:requestId,
        acceptance: acceptance,
        group:group.name,
      }

      userService.acceptCleaningRequest(data)
      .then(response => {
        console.log("My response accept.....", response.data)
      })

      alert("sdhjsdjk")
      

      // const notificationMsg =`${currentUser.firstname} ${currentUser.lastname} accepted your cleaning request`
    // Example usage:
    // acceptCleaningRequestPushNotification(
      // sendPushNotifications(
      //   host_tokens, // Replace with a valid Expo Push Token
      //   currentUser.firstname+" "+currentUser.lastname,
      //   notificationMsg,
      //       {
      //       screen: ROUTES.host_dashboard,
      //       params: {
      //           scheduleId:scheduleId,
      //           hostId:hostId,
      //           requestId:hostId,  
      //       },
      //       }

      // );
      
      console.log("Accepted")
      // handleOpenConfirmClockIn()
      navigation.navigate(ROUTES.cleaner_dashboard)
    }

    const handleDecline1 = () => {


      userService.declineCleaningRequest(requestId)
      .then(response => {
        console.log(response.data)
      })
      
      const status = "Decline"
      const cleanerFname = currentUser.firstname
      const cleanerLname = currentUser.lastname

      console.log("Declined")
      
      // handleOpenConfirmClockIn()
    }

    // Usage in component


    const handleDecline = () => {
      Alert.alert(
        'Confirm Decline',
        'Are you sure you want to decline this cleaning request?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          { 
            text: 'Decline', 
            onPress: () => executeDecline() 
          }
        ]
      );
    };
    
    const executeDecline = () => {
        userService.declineCleaningRequest(requestId)
        .then(response => {
          console.log(response.data)
          navigation.navigate(ROUTES.cleaner_dashboard)
        }).catch(

        )
    };


  return (
    <SafeAreaView
      style={{
        flex:1,
        backgroundColor:'#f9f9f9',
      }}
    >
        <StatusBar translucent backgroundColor="transparent" />
       
  
      {/* <GoogleMapComponent 
        latitude={apartment_latitude}
        longitude={apartment_longitude}
      /> */}

          
 
      <View style={{height:"100%"}}>  
        <View style={styles.address_bar}>
            <View style={styles.addre}>
              {/* <Text style={{color:COLORS.light_gray_1}}>{address}</Text> */}
                <>
                  <Text style={{fontSize:13, color:COLORS.light_gray}}>{distance || 0} Miles away</Text>
                  <Text onPress={handleOpenDirections} style={{color:COLORS.light_gray_1, fontSize:16}}>Direction</Text>
                </>
                
            </View>
        </View>
        <ScrollView>
        
        <View style={styles.container}>
        {/* <Text>{address.city}, {address.state}</Text> */}
          <CardNoPrimary>
          <View style={styles.centerContent}>
              <Text bold style={styles.headerText}>{apartment_name}</Text>
              <Text style={{color:COLORS.gray, marginBottom:10, marginLeft:-5}}> <MaterialCommunityIcons name="map-marker" size={16} /> {city}, {state}</Text>
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:0}}>
                <CircleIcon 
                    iconName="bed-empty"
                    buttonSize={26}
                    radiusSise={13}
                    iconSize={16}
                    title= {bedroomCount}
                    roomSize={bedroomSize}
                    type="Bedrooms"
                /> 
                <CircleIcon 
                    iconName="shower-head"
                    buttonSize={26}
                    radiusSise={13}
                    iconSize={16}
                    title= {bathroomCount}
                    roomSize={bathroomSize}
                    type="Bathrooms"
                /> 
                <CircleIcon 
                  iconName="silverware-fork-knife"
                  buttonSize={26}
                  radiusSise={13}
                  iconSize={16}
                  title= {kitchen}
                  roomSize={kitchenSize}
                  type="Kitchen"
                />
                <CircleIcon 
                    iconName="seat-legroom-extra"
                    buttonSize={26}
                    radiusSise={13}
                    iconSize={16}
                    title= {livingroomCount}
                    roomSize={livingroomSize}
                    type="Livingroom"
                /> 
              </View>

          </CardNoPrimary>
          {/* <TaskInfoBanner task={schedule} /> */}
  
          
          <View style={{marginHorizontal:25, width:'97%'}}>
              <Text bold style={{fontSize: 20, fontWeight:'600', marginBottom:5, marginTop:5}}>Schedule Info</Text>
              <Text style={styles.subheader}>Date and timing details for this cleaning appointment</Text>
            <CustomCard>
            <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                <CircleIconButton1
                  iconName="calendar"
                  buttonSize={50}
                  radiusSise={25}
                  iconSize={26}
                  title={moment(cleaning_date).format('ddd MMM D')}
                  title_color={COLORS.gray}
                  border_color={COLORS.light_gray}
                />
                <CircleIconButton1
                iconName="clock-outline"
                buttonSize={50}
                radiusSise={25}
                iconSize={26}
                title={`Starts ${moment(cleaning_time, 'h:mm:ss A').format('h:mm A')}`}
                title_color={COLORS.gray}
                border_color={COLORS.light_gray}
                />
                <CircleIconButton1
                iconName="timer-outline"
                buttonSize={50}
                radiusSise={25}
                iconSize={26}
                title={`Ends ${moment(cleaning_end_time, 'h:mm:ss A').format('h:mm A')}`}
                title_color={COLORS.gray}
                border_color={COLORS.light_gray}
                />
              </View>
            </CustomCard>
          </View>
          
          
          <CleaningSummary 
            checklist={checklist} 
            assignedTo={assignedTo} 
            handleAccept={handleAccept}
          />
          


        
        </View>

        {/* <Modal 
            visible={isOpenModal}
            animationType="slide" 
            transparent={true}
            onRequestClose={()=> {handleCloseConfirmClockIn()}} // Handle hardware back button on Android
          >
  
            <ClockInConfirmation
              close_modal={handleCloseConfirmClockIn}
            />
          </Modal>
        */}
        </ScrollView>
        </View>
        
       {/* <View style={styles.button}>
        <TouchableOpacity 
          style={styles.decline_button} onPress={handleDecline}
        >
          <Text bold style={styles.buttonText}><MaterialCommunityIcons name="cancel" size={24} color={COLORS.black} /> Decline</Text>
        </TouchableOpacity>
        <View><Text bold style={styles.price}>{geolocationData.currency.symbol}{total_cleaning_fee}</Text></View>
        
        <TouchableOpacity 
          style={styles.accept_button} onPress={handleAccept}
        >
          <Text bold style={styles.buttonacceptText}><MaterialCommunityIcons name="check-all" size={24} color={COLORS.white} /> Accept </Text>
        </TouchableOpacity>
        
        </View> */}
   
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
   container:{
    marginHorizontal:8,
    alignItems: 'center',  // Horizontally center content
    justifyContent: 'center', // Vertically center 
   },
   mainContent: {
    position: 'absolute',
    bottom: 0,
    height: '75%',
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
  },
    eta:{
        flexDirection:'row',
        height:50,
        padding:5,
        borderWidth:0.5,
        borderColor:COLORS.light_gray_1,
        backgroundColor:COLORS.white,
        justifyContent:'flex-start',
        alignItems:'center'
    },
    title:{
      fontSize:20,
      fontWeight:'60'
    },
    button: {
      flexDirection:'row',
      backgroundColor: COLORS.white,
      paddingVertical: 12,
      paddingHorizontal: 20,
      justifyContent:'space-between',
      borderTopWidth:1,
      borderColor:COLORS.light_gray_1
    },
    accept_button:{
      backgroundColor: COLORS.primary,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius:10
    },
    decline_button:{
      backgroundColor:COLORS.light_gray_1,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius:10,
      // borderWidth:1,
      // borderColor:COLORS.light_gray
    },
    buttonText: {
      color: COLORS.gray,
      fontSize: 18
    },
    buttonacceptText: {
      color: '#fff',
      fontSize: 18
    },
    price:{
      fontSize:24,
      fontWeight:'600',
    },
    centerContent: {
      alignItems: 'center',  // Center content horizontally
      marginVertical:5
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    subheader: {
      fontSize: 14,
      marginBottom: 20,
      color: COLORS.gray,
      lineHeight: 20,
    },
    modeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 10,
  },
  addre:{
    flex:0.7,
    padding:10,
    marginTop:0
  },
address_bar:{
    minHeight:70,
    backgroundColor:COLORS.deepBlue,
    marginTop:-1
  },
  chip_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center', // Ensures wrapping works properly
    padding: 5,
    gap: 8, // Adjust spacing between chips
  
  },
  chip: {
    height: 35,   // Reduce the chip height
    paddingHorizontal: 0,  // Reduce padding inside the chip
    borderRadius: 17,  // Make it more compact
    borderWidth:0.5,
    borderColor:COLORS.light_gray,
    backgroundColor:'#f9f9f9',
    flexShrink: 1,
  },
  chipText: {
    fontSize: 12,  // Reduce font size
    fontWeight: 'normal',  // Normal font weight
    color:COLORS.gray
  },
  })


    