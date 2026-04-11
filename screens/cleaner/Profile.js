// import React, { useEffect,useState, useContext } from 'react';
// import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import COLORS from '../../constants/colors';
// import AvatarUploader from '../../components/shared/AvatarUploader';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import Availability from '../../components/cleaner/Availability';
// import Contact from '../../components/cleaner/Contact';
// import Certification from '../../components/cleaner/Certification';
// import ContactDisplay from './ContactDisplay';
// import CertificationDisplay from './CertificationDisplay';
// import AvailabilityDisplay from './AvailabilityDisplay';
// import availabilityRange from '../../utils/availabilityRange';
// import PaymentMethod from '../../components/cleaner/PaymentMethod';
// import AboutMe from '../../components/cleaner/AboutMe';
// import AboutMeDisplay from './AboutMeDisplay';
// import {
//   get,
//   ref,
//   set,
//   onValue,
//   push,
//   update,
//   snapshot
//  } from 'firebase/database'; 
// import { db } from '../../services/firebase/config';
// import ContactCard from '../../components/shared/ContactCard';
// import { format, parse } from 'date-fns';


// // Helper: safely convert any input to a Date object
// const toSafeDate = (dateValue, fallback = new Date()) => {
//   if (!dateValue) return fallback;
//   try {
//     const date = new Date(dateValue);
//     // Check if date is valid
//     if (isNaN(date.getTime())) return fallback;
//     return date;
//   } catch {
//     return fallback;
//   }
// };


// export default function Profile() {

//   const {currentUserId} = useContext(AuthContext)
//   const {currentUser} = useContext(AuthContext)

//   const[firstname, setFirstname] = useState("")
//   const[lastname, setLastname] = useState("")
//   const[avatar, setUserAvatar] = useState("")
//   const[location, setLocation] = useState("")
//   const[contact, setContact] = useState("")
//   const[aboutme, setAboutMe] = useState("")
//   const[phone, setPhone] = useState("")
//   const[certification, setCertification] = useState([])
//   const[openContactModal, setOpenContactModal] = useState(false)
//   const[openAvailabilityModal, setOpenvailabilityModal] = useState(false)
//   const[openCertificationModal, setOpenCertificationModal] = useState(false)
//   const [editingCertification, setEditingCertification] = useState(null);
//   const[openPaymentTypeModal, setOpenPaymentTypeModal] = useState(false)
//   const[openAboutMeeModal, setOpenAboutModal] = useState(false)
//   const[availability, setAvailability] = useState([])



//   const[currentStep, setCurrentStep] = useState(1);


  

//   const handleNextStep = () => {
//     if (currentStep < 3) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   useEffect(()=> {
//     fetchUser()
//     fetchAvailability()
//   },[])

//   const fetchAvailability = async () => {
//     try {
//       const response = await userService.getCleanerAvailability(currentUserId);
//       const data = response.data.data;
//       // Ensure availability is an array and each slot's times are properly parsed
//       const formatted = (data?.availability || []).map((item) => ({
//         day: item.day,
//         slots: (item.slots || []).map((slot) => ({
//           start: toSafeDate(slot.start),
//           end: toSafeDate(slot.end),
//         })),
//       }));
//       setAvailability(formatted);
//     } catch (err) {
//       console.error('Error fetching availability:', err);
//       Alert.alert('Error', 'Failed to load availability');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUser = async () => {
//     try {

//       // setLoading(true)
      
//       await userService.getUser(currentUserId)
//       .then(response=> {
//         const res = response.data

//         setFirstname(res.firstname)
//         setLastname(res.lastname)
//         setContact(res.contact)
//         setPhone(res.phone)
//         setLocation(res.location)
//         setUserAvatar(res.avatar)
    

//         if(res.certification == undefined){
//           setCertification([])
//         }else{
//           setCertification(res.certification)
//         }
        
//         setAboutMe(res.aboutme)
       
//       })
  
      
//     } catch(e) {
//       // error reading value
//       console.log(e)
//     }
//   }

//   const getUploadePhoto = (e) => {
//     // Update avatar
//     const data = {
//       userId: currentUserId,
//       avatar:e
//     }

//     userService.updateProfileAvatar(data)
//     .then(response => {
//       // Update user avatar on firebase database
//       updateFirebaseAvatar(data)
//       console.log("avatar uploaded successfully")
//     }).catch((err)=> {
//       console.log(err)
//     })
//     setUserAvatar(e);
//   }


  
  
//   const updateFirebaseAvatar = async data => {
//     const mySnapshot = await get(ref(db, `users/${data.userId}`))
    
//     console.log("picture")
//     console.log(mySnapshot.val())
//     console.log(data.avatar)
//     console.log("picture")
//     if(mySnapshot.exists) {
//       update(ref(db, `users/${data.userId}`), {avatar:data.avatar})
//     }
//     return mySnapshot.val()

//   }
    
//     const handleOpenContact = () => {
//         setOpenContactModal(true)
//     }
//     const handleCloseContact = () => {
//       setOpenContactModal(false)
//     }

//     const handleOpenAvailability = () => {
//       setOpenvailabilityModal(true)
//     }
//     const handleCloseAvailability = () => {
//       setOpenvailabilityModal(false)
//     }

//     // const handleOpenCertification = () => {
//     //   setOpenCertificationModal(true)
//     // }
//     // const handleCloseCertification = () => {
//     //   setOpenCertificationModal(false)
//     // }
//     const handleOpenPaymentType = () => {
//       setOpenPaymentTypeModal(true)
//     }
//     const handleClosePaymentType = () => {
//       setOpenPaymentTypeModal(false)
//     }
//     const handleOpenAboutMe = () => {
//       setOpenAboutModal(true)
//     }
//     const handleCloseAboutMe = () => {
//       setOpenAboutModal(false)
//     }
//     const handleUpdateAbout = (e) => {
//       setAboutMe(e)
//     }

//     const handleAvailabilty = (originalData) => {
//       const newData = availabilityRange(originalData)
//       setAvailability(newData)
//       // console.log(newData);
//   };


//   const handleOpenCertification = () => {
//     setEditingCertification(null); // for adding new
//     setOpenCertificationModal(true);
//   };
  
//   const handleEditCertification = (cert) => {
//     setEditingCertification(cert);
//     setOpenCertificationModal(true);
//   };
  
//   const handleCloseCertification = () => {
//     setOpenCertificationModal(false);
//     setEditingCertification(null);
//   };
 


      
    

    
    
//   return (
//     <SafeAreaView
//           style={{
//             flex:1,
//             backgroundColor:COLORS.white,
//             // justifyContent:"center",
//             // alignItems:"center",
//             marginBottom:0,

//           }}
//         >

//           <ScrollView>
//             <View style={styles.header}>
//               <View style={styles.avatar_background}>
//                 <AvatarUploader  userId={currentUserId} default_photo={avatar} image_type = "avatar" get_uploaded_photo = {getUploadePhoto} />
//                 <Text style={styles.name}>{currentUser.firstname} {currentUser.lastname}</Text>
//                 <Text style={styles.location}>{currentUser?.location?.city}, {currentUser.location?.region}</Text>
//               </View>
              
//               <View style={styles.container}>
                
                
//               <ContactDisplay 
//                 contact={contact}
//                 phone={phone}
//                 handleOpenContact={handleOpenContact}
//               />

          
//               <AboutMeDisplay 
//                 mode="edit"
//                 aboutme={aboutme}
//                 handleOpenAboutMe={handleOpenAboutMe}
//               />

//               <AvailabilityDisplay
//                 cleanerId = {currentUserId}
//                 mode="edit"
//                 availability= {availability}
//                 handleOpenAvailability={handleOpenAvailability}
//               />
              
//               {/* <CertificationDisplay
//                 mode="edit"
//                 certification={certification}
//                 handleOpenCertification={handleOpenCertification}
//               /> */}

//             <CertificationDisplay
//               mode="edit"
//               certification={certification}
//               handleOpenCertification={handleOpenCertification}
//               onEditCertification={handleEditCertification}
//             />

              
//               </View>
            
            

            
            
//         </View>

//         <Modal 
//           visible={openContactModal}
//           animationType="slide" 
//           transparent={true}
//           // animationType="none" // No animation
//           statusBarTranslucent={false}
//           // onRequestClose={onClose} // Handle hardware back button on Android
//         >
          
//             <Contact 
//               userId={currentUser?._id}
//               contact={contact}
//               currentUser={currentUser}
//               close_modal={handleCloseContact}
//             />

//         </Modal>

//         <Modal 
//           visible={openAvailabilityModal}
//           animationType="slide" 
//           transparent={true}
//           // animationType="none" // No animation
//           statusBarTranslucent={true}
//           // onRequestClose={onClose} // Handle hardware back button on Android
//         >

//           <Availability 
//             cleanerId = {currentUserId}
//             close_avail_modal={handleCloseAvailability}
//             get_availability={handleAvailabilty}
//           />
            
//         </Modal>

//         <Modal 
//           visible={openCertificationModal}
//           animationType="slide" 
//           transparent={true}
//           // animationType="none" // No animation
//           statusBarTranslucent={false}
//           // onRequestClose={onClose} // Handle hardware back button on Android
//         >
          
//           {/* <Certification
//             userId={currentUser?._id}
//             close_modal={handleCloseCertification}
//           /> */}
//           <Certification
//             userId={currentUserId}
//             certification={editingCertification}
//             close_modal={handleCloseCertification}
//           />
//           {/* <StatusBar translucent={true} backgroundColor="transparent" /> */}
//         </Modal>
        

//         <Modal 
//           visible={openPaymentTypeModal}
//           animationType="slide" 
//           transparent={false}
//           // animationType="none" // No animation
//           statusBarTranslucent={false}
//           // onRequestClose={onClose} // Handle hardware back button on Android
//         >
          
//           <PaymentMethod
//             close_modal={handleClosePaymentType}
//           />
          
//         </Modal>

//         <Modal 
//           visible={openAboutMeeModal}
//           animationType="slide" 
//           // transparent={true}
//           // animationType="none" // No animation
//           // statusBarTranslucent={true}
//           // onRequestClose={onClose} // Handle hardware back button on Android
//         >
          
//           <AboutMe
//             userId= {currentUserId}
//             aboutme= {aboutme}
//             update_aboutme = {handleUpdateAbout}
//             close_modal={handleCloseAboutMe}
//           />
          
//         </Modal>

//         </ScrollView>
//     </SafeAreaView>
//   )
// }


// const styles = StyleSheet.create({
//   header:{
//     margin:0
//   },
//   name:{
//     color:COLORS.white,
//     fontSize:18,
//   },
//   location:{
//     color:COLORS.white
//   },
//   container:{
//     margin:10
//   },
//   avatar_background:{
//     paddingTop:80,
//     paddingBottom:10,
//     minHeighteight:200,
//     backgroundColor:COLORS.primary,
//     justifyContent:'center',
//     alignItems:'center'
//   },
//   line:{
//     borderBottomWidth:0.8,
//     borderColor:COLORS.light_gray_1,
//     marginVertical:5,
//     height:4
//   },
//   titleContainer:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     alignItems:'center',
//     marginTop:0
//   },
//   title:{
//     fontSize:18,
//   },
//   content:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     marginVertical:5
//   },
//   actions:{
//     flexDirection:'row',
//   }
// })




import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  ScrollView,
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
import { get, ref, update } from 'firebase/database';
import { db } from '../../services/firebase/config';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { tSafe } from '../../utils/tSafe'; // added import

// Helper: safely convert any input to a Date object
const toSafeDate = (dateValue, fallback = new Date()) => {
  if (!dateValue) return fallback;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return date;
  } catch {
    return fallback;
  }
};

export default function Profile() {
  const { currentUserId, currentUser } = useContext(AuthContext);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [avatar, setUserAvatar] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState({ address: '', phone: '', email: '' });
  const [aboutme, setAboutMe] = useState('');
  const [certification, setCertification] = useState([]);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
  const [openCertificationModal, setOpenCertificationModal] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [openPaymentTypeModal, setOpenPaymentTypeModal] = useState(false);
  const [openAboutMeModal, setOpenAboutModal] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    fetchUser();
    fetchAvailability();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await userService.getUser(currentUserId);
      const res = response.data;

      setFirstname(res.firstname || '');
      setLastname(res.lastname || '');
      setUserAvatar(res.avatar || '');
      setLocation(res.location || {});
      setContact({
        address: res.contact?.address || '',
        phone: res.phone || '',
        email: res.email || '',
      });
      setAboutMe(res.aboutme || '');
      setCertification(res.certification || []);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await userService.getCleanerAvailability(currentUserId);
      const data = response.data.data;
      const formatted = (data?.availability || []).map((item) => ({
        day: item.day,
        slots: (item.slots || []).map((slot) => ({
          start: toSafeDate(slot.start),
          end: toSafeDate(slot.end),
        })),
      }));
      setAvailability(formatted);
    } catch (err) {
      console.error('Error fetching availability:', err);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('failed_load_availability', 'Failed to load availability')
      );
    }
  };

  const getUploadedPhoto = (photoUri) => {
    const data = { userId: currentUserId, avatar: photoUri };
    userService.updateProfileAvatar(data)
      .then(() => updateFirebaseAvatar(data))
      .catch(console.error);
    setUserAvatar(photoUri);
  };

  const updateFirebaseAvatar = async (data) => {
    const snapshot = await get(ref(db, `users/${data.userId}`));
    if (snapshot.exists()) {
      update(ref(db, `users/${data.userId}`), { avatar: data.avatar });
    }
  };

  const handleOpenContact = () => setOpenContactModal(true);
  const handleCloseContact = () => setOpenContactModal(false);

  const handleUpdateContact = (updatedContact) => {
    setContact(updatedContact);
  };

  const handleOpenAvailability = () => setOpenAvailabilityModal(true);
  const handleCloseAvailability = () => setOpenAvailabilityModal(false);

  const handleAvailabilty = (originalData) => {
    const newData = availabilityRange(originalData);
    setAvailability(newData);
  };

  const handleOpenCertification = () => {
    setEditingCertification(null);
    setOpenCertificationModal(true);
  };
  const handleEditCertification = (cert) => {
    setEditingCertification(cert);
    setOpenCertificationModal(true);
  };

  const handleUpdateCertification = (savedCert) => {
    setCertification(prev => {
      // If savedCert has an _id, replace or add
      const index = prev.findIndex(c => c._id === savedCert._id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = savedCert;
        return updated;
      } else {
        return [...prev, savedCert];
      }
    });
  };
  const handleCloseCertification = () => {
    setOpenCertificationModal(false);
    setEditingCertification(null);
  };

  const handleOpenPaymentType = () => setOpenPaymentTypeModal(true);
  const handleClosePaymentType = () => setOpenPaymentTypeModal(false);

  const handleOpenAboutMe = () => setOpenAboutModal(true);
  const handleCloseAboutMe = () => setOpenAboutModal(false);
  const handleUpdateAbout = (text) => setAboutMe(text);

  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={styles.container}>
      <ScrollView>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{tSafe('my_profile', 'My Profile')}</Text>
        </View>
        <View style={styles.avatar_background}>
            <AvatarUploader
              userId={currentUserId}
              default_photo={avatar}
              image_type="avatar"
              get_uploaded_photo={getUploadedPhoto}
            />
            <Text style={styles.name}>{currentUser.firstname} {currentUser.lastname}</Text>
            <Text style={styles.location}>{currentUser?.location?.city}, {currentUser?.location?.region}</Text>
          </View>
      </LinearGradient>



        <View style={styles.header}>
          {/* <View style={styles.avatar_background}>
            <AvatarUploader
              userId={currentUserId}
              default_photo={avatar}
              image_type="avatar"
              get_uploaded_photo={getUploadedPhoto}
            />
            <Text style={styles.name}>{currentUser.firstname} {currentUser.lastname}</Text>
            <Text style={styles.location}>{currentUser?.location?.city}, {currentUser?.location?.region}</Text>
          </View> */}

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
              cleanerId={currentUserId}
              mode="edit"
              availability={availability}
              handleOpenAvailability={handleOpenAvailability}
            />

            <CertificationDisplay
              mode="edit"
              certification={certification}
              handleOpenCertification={handleOpenCertification}
              onEditCertification={handleEditCertification}
              
            />
          </View>
        </View>

        <Modal visible={openContactModal} animationType="slide" transparent>
          <Contact
            userId={currentUserId}
            contact={contact}
            close_modal={handleCloseContact}
            onUpdate={handleUpdateContact}
          />
        </Modal>

        <Modal visible={openAvailabilityModal} animationType="slide" transparent>
          <Availability
            cleanerId={currentUserId}
            close_avail_modal={handleCloseAvailability}
            get_availability={handleAvailabilty}
          />
        </Modal>

        <Modal visible={openCertificationModal} animationType="slide" transparent>
          <Certification
            userId={currentUserId}
            certification={editingCertification}
            close_modal={handleCloseCertification}
            onUpdate={handleUpdateCertification}
          />
        </Modal>

        <Modal visible={openPaymentTypeModal} animationType="slide">
          <PaymentMethod close_modal={handleClosePaymentType} />
        </Modal>

        <Modal visible={openAboutMeModal} animationType="slide">
          <AboutMe
            userId={currentUserId}
            aboutme={aboutme}
            update_aboutme={handleUpdateAbout}
            close_modal={handleCloseAboutMe}
          />
        </Modal>
      </ScrollView>
      </View>
   
  );
}

const styles = StyleSheet.create({
  header: { margin: 0 },
  name: { color: COLORS.white, fontSize: 18 },
  location: { color: COLORS.white },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  avatar_background: {
    paddingTop: 80,
    paddingBottom: 10,
    minHeight: 200,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    borderBottomWidth: 0.8,
    borderColor: COLORS.light_gray_1,
    marginVertical: 5,
    height: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  title: {
    fontSize: 18,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  actions: {
    flexDirection: 'row',
  },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 4,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
});