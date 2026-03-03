import React, { useEffect,useState, useContext } from 'react';
import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import AvatarUploader from '../../components/shared/AvatarUploader';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import Availability from '../../components/cleaner/Availability';
import Contact from '../../components/cleaner/Contact';
import Certification from '../../components/cleaner/Certification';
import ContactDisplay from './ContactDisplay';
import CertificationDisplay from './CertificationDisplay';
import AvailabilityDisplay from './AvailabilityDisplay';
import availabilityRange from '../../utils/availabilityRange';
import PaymentMethod from '../../components/cleaner/PaymentMethod';
import AboutMe from '../../components/cleaner/AboutMe';
import AboutMeDisplay from './AboutMeDisplay';
import {
  get,
  ref,
  set,
  onValue,
  push,
  update,
  snapshot
 } from 'firebase/database'; 
import { db } from '../../services/firebase/config';
import ContactCard from '../../components/shared/ContactCard';


export default function Profile() {

  const {currentUserId} = useContext(AuthContext)
  const {currentUser} = useContext(AuthContext)

  const[firstname, setFirstname] = useState("")
  const[lastname, setLastname] = useState("")
  const[avatar, setUserAvatar] = useState("")
  const[location, setLocation] = useState("")
  const[contact, setContact] = useState("")
  const[aboutme, setAboutMe] = useState("")
  const[certification, setCertification] = useState([])
  const[openContactModal, setOpenContactModal] = useState(false)
  const[openAvailabilityModal, setOpenvailabilityModal] = useState(false)
  const[openCertificationModal, setOpenCertificationModal] = useState(false)
  const[openPaymentTypeModal, setOpenPaymentTypeModal] = useState(false)
  const[openAboutMeeModal, setOpenAboutModal] = useState(false)
  const[availability, setAvailability] = useState([])

  const[currentStep, setCurrentStep] = useState(1);


  

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  useEffect(()=> {
    fetchUser()
  },[])

  const fetchUser = async () => {
    try {

      // setLoading(true)
      
      await userService.getUser(currentUserId)
      .then(response=> {
        const res = response.data

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
  
      // setLoading(false)

      // return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
      console.log(e)
    }
  }

  const getUploadePhoto = (e) => {
    // Update avatar
    const data = {
      userId: currentUserId,
      avatar:e
    }

    userService.updateProfileAvatar(data)
    .then(response => {
      // Update user avatar on firebase database
      updateFirebaseAvatar(data)
      console.log("avatar uploaded successfully")
    }).catch((err)=> {
      console.log(err)
    })
    setUserAvatar(e);
  }


  
  
  const updateFirebaseAvatar = async data => {
    const mySnapshot = await get(ref(db, `users/${data.userId}`))
    
    console.log("picture")
    console.log(mySnapshot.val())
    console.log(data.avatar)
    console.log("picture")
    if(mySnapshot.exists) {
      update(ref(db, `users/${data.userId}`), {avatar:data.avatar})
    }
    return mySnapshot.val()

  }
    
    const handleOpenContact = () => {
        setOpenContactModal(true)
    }
    const handleCloseContact = () => {
      setOpenContactModal(false)
    }

    const handleOpenAvailability = () => {
      setOpenvailabilityModal(true)
    }
    const handleCloseAvailability = () => {
      setOpenvailabilityModal(false)
    }

    const handleOpenCertification = () => {
      setOpenCertificationModal(true)
    }
    const handleCloseCertification = () => {
      setOpenCertificationModal(false)
    }
    const handleOpenPaymentType = () => {
      setOpenPaymentTypeModal(true)
    }
    const handleClosePaymentType = () => {
      setOpenPaymentTypeModal(false)
    }
    const handleOpenAboutMe = () => {
      setOpenAboutModal(true)
    }
    const handleCloseAboutMe = () => {
      setOpenAboutModal(false)
    }
    const handleUpdateAbout = (e) => {
      setAboutMe(e)
    }

    const handleAvailabilty = (originalData) => {
      const newData = availabilityRange(originalData)
      setAvailability(newData)
      // console.log(newData);
  };

 


      
    

    
    
  return (
    <SafeAreaView
          style={{
            flex:1,
            backgroundColor:COLORS.white,
            // justifyContent:"center",
            // alignItems:"center",
            marginBottom:0,

          }}
        >

          <ScrollView>
            <View style={styles.header}>
              <View style={styles.avatar_background}>
                <AvatarUploader  userId={currentUserId} default_photo={avatar} image_type = "avatar" get_uploaded_photo = {getUploadePhoto} />
                <Text style={styles.name}>{currentUser.firstname} {currentUser.lastname}</Text>
                <Text style={styles.location}>{currentUser?.location?.city}, {currentUser.location?.region}</Text>
              </View>
              
              <View style={styles.container}>
                
                
              <ContactDisplay 
                contact={contact}
                handleOpenContact={handleOpenContact}
              />

          
              <AboutMeDisplay 
                mode="edit"
                aboutme={aboutme}
                handleOpenAboutMe={handleOpenAboutMe}
              />

              <AvailabilityDisplay
                cleanerId = {currentUserId}
                mode="edit"
                availability= {availability}
                handleOpenAvailability={handleOpenAvailability}
              />
              
              <CertificationDisplay
                mode="edit"
                certification={certification}
                handleOpenCertification={handleOpenCertification}
              />

              {/* <PaymentTypeDisplay
                mode="edit"
                handleOpenPaymentType={handleOpenPaymentType}
              /> */}

              
              </View>
            {/* <Text>Bio Data {firstname} (First name {firstname}, Lastname, email, avatar, phone)</Text> */}
            

            
            
        </View>

        <Modal 
          visible={openContactModal}
          animationType="slide" 
          transparent={true}
          // animationType="none" // No animation
          statusBarTranslucent={false}
          // onRequestClose={onClose} // Handle hardware back button on Android
        >
          
            <Contact 
              userId={currentUser?._id}
              contact={contact}
              currentUser={currentUser}
              close_modal={handleCloseContact}
            />

        </Modal>

        <Modal 
          visible={openAvailabilityModal}
          animationType="slide" 
          transparent={true}
          // animationType="none" // No animation
          statusBarTranslucent={true}
          // onRequestClose={onClose} // Handle hardware back button on Android
        >

          <Availability 
            userId={currentUser?._id}
            close_avail_modal={handleCloseAvailability}
            get_availability={handleAvailabilty}
          />
            
        </Modal>

        <Modal 
          visible={openCertificationModal}
          animationType="slide" 
          // transparent={true}
          // animationType="none" // No animation
          statusBarTranslucent={false}
          // onRequestClose={onClose} // Handle hardware back button on Android
        >
          
          <Certification
            userId={currentUser?._id}
            close_modal={handleCloseCertification}
          />
          {/* <StatusBar translucent={true} backgroundColor="transparent" /> */}
        </Modal>
        

        <Modal 
          visible={openPaymentTypeModal}
          animationType="slide" 
          transparent={false}
          // animationType="none" // No animation
          statusBarTranslucent={false}
          // onRequestClose={onClose} // Handle hardware back button on Android
        >
          
          <PaymentMethod
            close_modal={handleClosePaymentType}
          />
          
        </Modal>

        <Modal 
          visible={openAboutMeeModal}
          animationType="slide" 
          // transparent={true}
          // animationType="none" // No animation
          // statusBarTranslucent={true}
          // onRequestClose={onClose} // Handle hardware back button on Android
        >
          
          <AboutMe
            userId= {currentUser?._id}
            aboutme= {aboutme}
            update_aboutme = {handleUpdateAbout}
            close_modal={handleCloseAboutMe}
          />
          
        </Modal>

        </ScrollView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  header:{
    margin:0
  },
  name:{
    color:COLORS.white,
    fontSize:18,
  },
  location:{
    color:COLORS.white
  },
  container:{
    margin:10
  },
  avatar_background:{
    paddingTop:80,
    paddingBottom:10,
    minHeighteight:200,
    backgroundColor:COLORS.primary,
    justifyContent:'center',
    alignItems:'center'
  },
  line:{
    borderBottomWidth:0.8,
    borderColor:COLORS.light_gray_1,
    marginVertical:5,
    height:4
  },
  titleContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:0
  },
  title:{
    fontSize:18,
  },
  content:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginVertical:5
  },
  actions:{
    flexDirection:'row',
  }
})

