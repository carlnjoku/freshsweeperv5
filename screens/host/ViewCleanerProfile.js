import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, Alert, FlatList, ScrollView, Modal, Image, View, useWindowDimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import userService from '../../services/connection/userService';
import CircularIcon from '../../components/shared/CircularIcon';
import { Avatar } from 'react-native-paper';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import AboutMeDisplay from '../cleaner/AboutMeDisplay';
import AvailabilityDisplay from '../cleaner/AvailabilityDisplay';
import CertificationDisplay from '../cleaner/CertificationDisplay';
import Portfolio from './Portfolio/Portfolio';

export default function ViewCleanerProfile({cleanerId, schedule, close_modal}) {

    const navigation = useNavigation()
    const {currentUserId, fbaseUser, currentUser} = useContext(AuthContext)

    const[cleaner_chat_reference, setCleanerChatReference] = useState("")
    const[firstname, setFirstname] = useState("")
    const[lastname, setLastname] = useState("")
    const[avatar, setUserAvatar] = useState("")
    const[location, setLocation] = useState("")
    const[contact, setContact] = useState("")
    const [currentStep, setCurrentStep] = useState(1);
    const [certification, setCertification] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [cleanerPortfolio, setPortfolio] = useState([]);
    const [completed_schedules, setPortfolio2] = useState([]);
    const [aboutme, setAboutMe] = useState("");
 
    
    
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

    useEffect(() => {
        fetchUser(cleanerId)
        fetchCleanerChatRef()
    },[])

    const fetchCleanerChatRef = async() => {
         
        await userService.getCleanerChatReference(cleanerId, selected_scheduleId)
        .then(response => {
          const res = response.data.data
          console.log("syyyyyyy1064")
          // console.log(res["params"])
          setCleanerChatReference(res["params"])
          console.log("syyyyyyy208")
        })
      }

      const fetchUser = async (cleanerId) => {
        try {
    
          // setLoading(true)
        //   alert(cleanerId)
          await userService.getUser(cleanerId)
          .then(response=> {
            const res = response.data
            console.log("sulee...........")
            // console.log(response.data.contact)
            console.log("sulee...........")
    
            setFirstname(res.firstname)
            setLastname(res.lastname)
            setContact(res.contact)
            setLocation(res.location)
            setUserAvatar(res.avatar)
    
            if(res.certification == undefined){
              setCertification([])
            }else{
              setCertification(res.certification)
            }
    
            if(res.availability == undefined){
              setAvailability([])
            }else{
              setAvailability(res.availability)
            }
            
            setAboutMe(res.aboutme)
           
          })
      
        //   setLoading(false)
    
          // return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch(e) {
          // error reading value
          console.log(e)
        }
      }
    
      console.log("P..........................son")
      // console.log(cleaner_chat_reference)
      
      const openExisitingConversation = () => {
        
        navigation.navigate(ROUTES.chat_conversation,{
            selectedUser:cleaner_chat_reference,
            fbaseUser: fbaseUser,
            schedule: schedule 
        })
      }

      const callPhone = () => {
        makeCall(contact?.phone)
      }

      const onClose = () => {
        close_modal(false)
      }
    

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
        
        {/* <View style={{backgroundColor:COLORS.primary, flexDirection:'row', justifyContent:'space-between'}}>
            <View></View>
            <View style={{backgroundColor:COLORS.primary, marginRight:15}}><MaterialCommunityIcons name="close" color={COLORS.white} size={26} onPress={onClose} /></View> 
        </View>  */}
          <View style={styles.avatar_background}>
          <View style={{backgroundColor:COLORS.primary, marginRight:15}}><MaterialCommunityIcons name="close" style={styles.closeIcon} color={COLORS.white} size={26} onPress={onClose} /></View> 
            <Avatar.Image
                size={100}
                source={{uri:avatar}}
                style={{ backgroundColor: COLORS.gray,  marginBottom:0 }}
            />
            <Text style={styles.name}>{firstname} {lastname}</Text>
            <Text style={styles.location}>{location?.city}, {location?.region}</Text>
            <View style={styles.communicate}>
                {/* <TouchableOpacity><Ionicons name="chatbox-ellipses-outline" size={24} /> </TouchableOpacity>
                <TouchableOpacity><MaterialCommunityIcons name="phone" size={24} /> </TouchableOpacity> */}

                <CircularIcon iconName="phone" onPress = {callPhone} />

                <CircularIcon iconName="chat-processing-outline" onPress={openExisitingConversation} />
                   
                </View>
          </View>
  

        <View style={{flex:1}}>
            
          <View style={styles.container}>
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
                  aboutme={aboutme}
                />
                </ScrollView>
                </Animatable.View>
              }
              {currentStep === 2 && 
                <Animatable.View animation="slideInRight" duration={600}>
                  <AvailabilityDisplay
                    mode="display"
                    availability={availability}
                  />
                </Animatable.View>
              }

              {currentStep === 3 && 
              <Animatable.View animation="slideInRight" duration={600}>
                <CertificationDisplay
                  mode="display"
                  certification={certification}
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

  
          
          </View>
     
        </View>
      
      <View style={styles.buttonContainer}>
        
      </View>


    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor:COLORS.backgroundColor,
        width:'100%',
        
    },
    avatar_background:{
        height:200,
        backgroundColor:COLORS.primary,
        justifyContent:'center',
        alignItems:'center',
        // borderRadius:10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      },
    form: {
        flex: 1,
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    name:{
        fontSize:18,
        color:COLORS.white
      },
      location:{
        fontSize:14,
        color:"#f8f8f8"
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
        marginTop:0
      },
      close_button:{
        position:'relative',
      },
      closeIcon: {
        position: 'absolute',
        top: 0,
        right: -180,
      },
      tabsContainer:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderBottomColor: "#e9e9e9",
        borderLeftColor:"#fff",
        borderRightColor:"#fff",
        marginTop:0,
        paddingVertical:0
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
})
