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




// import React, { useEffect, useState, useContext } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   StatusBar,
//   ScrollView,
//   Modal,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
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
// import { get, ref, update } from 'firebase/database';
// import { db } from '../../services/firebase/config';
// import { LinearGradient } from 'expo-linear-gradient';
// import { format } from 'date-fns';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { tSafe } from '../../utils/tSafe'; // added import

// // Helper: safely convert any input to a Date object
// const toSafeDate = (dateValue, fallback = new Date()) => {
//   if (!dateValue) return fallback;
//   try {
//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return fallback;
//     return date;
//   } catch {
//     return fallback;
//   }
// };

// export default function Profile() {
//   const { currentUserId, currentUser } = useContext(AuthContext);

//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [avatar, setUserAvatar] = useState('');
//   const [location, setLocation] = useState('');
//   const [contact, setContact] = useState({ address: '', phone: '', email: '' });
//   const [aboutme, setAboutMe] = useState('');
//   const [certification, setCertification] = useState([]);
//   const [openContactModal, setOpenContactModal] = useState(false);
//   const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
//   const [openCertificationModal, setOpenCertificationModal] = useState(false);
//   const [editingCertification, setEditingCertification] = useState(null);
//   const [openPaymentTypeModal, setOpenPaymentTypeModal] = useState(false);
//   const [openAboutMeModal, setOpenAboutModal] = useState(false);
//   const [availability, setAvailability] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch user data
//   useEffect(() => {
//     fetchUser();
//     fetchAvailability();
//   }, []);

//   const fetchUser = async () => {
//     try {
//       const response = await userService.getUser(currentUserId);
//       const res = response.data;

//       setFirstname(res.firstname || '');
//       setLastname(res.lastname || '');
//       setUserAvatar(res.avatar || '');
//       setLocation(res.location || {});
//       setContact({
//         address: res.contact?.address || '',
//         phone: res.phone || '',
//         email: res.email || '',
//       });
//       setAboutMe(res.aboutme || '');
//       setCertification(res.certification || []);
//     } catch (error) {
//       console.error('Error fetching user:', error);
//     }
//   };

//   const fetchAvailability = async () => {
//     try {
//       const response = await userService.getCleanerAvailability(currentUserId);
//       const data = response.data.data;
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
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_load_availability', 'Failed to load availability')
//       );
//     }
//   };

//   const getUploadedPhoto = (photoUri) => {
//     const data = { userId: currentUserId, avatar: photoUri };
//     userService.updateProfileAvatar(data)
//       .then(() => updateFirebaseAvatar(data))
//       .catch(console.error);
//     setUserAvatar(photoUri);
//   };

//   const updateFirebaseAvatar = async (data) => {
//     const snapshot = await get(ref(db, `users/${data.userId}`));
//     if (snapshot.exists()) {
//       update(ref(db, `users/${data.userId}`), { avatar: data.avatar });
//     }
//   };

//   const handleOpenContact = () => setOpenContactModal(true);
//   const handleCloseContact = () => setOpenContactModal(false);

//   const handleUpdateContact = (updatedContact) => {
//     setContact(updatedContact);
//   };

//   const handleOpenAvailability = () => setOpenAvailabilityModal(true);
//   const handleCloseAvailability = () => setOpenAvailabilityModal(false);

//   const handleAvailabilty = (originalData) => {
//     const newData = availabilityRange(originalData);
//     setAvailability(newData);
//   };

//   const handleOpenCertification = () => {
//     setEditingCertification(null);
//     setOpenCertificationModal(true);
//   };
//   const handleEditCertification = (cert) => {
//     setEditingCertification(cert);
//     setOpenCertificationModal(true);
//   };

//   const handleUpdateCertification = (savedCert) => {
//     setCertification(prev => {
//       // If savedCert has an _id, replace or add
//       const index = prev.findIndex(c => c._id === savedCert._id);
//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index] = savedCert;
//         return updated;
//       } else {
//         return [...prev, savedCert];
//       }
//     });
//   };
//   const handleCloseCertification = () => {
//     setOpenCertificationModal(false);
//     setEditingCertification(null);
//   };

//   const handleOpenPaymentType = () => setOpenPaymentTypeModal(true);
//   const handleClosePaymentType = () => setOpenPaymentTypeModal(false);

//   const handleOpenAboutMe = () => setOpenAboutModal(true);
//   const handleCloseAboutMe = () => setOpenAboutModal(false);
//   const handleUpdateAbout = (text) => setAboutMe(text);

//   return (
//     // <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
//       <View style={styles.container}>
//       <ScrollView>
//       <LinearGradient
//         colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
//         style={styles.headerGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//       >
//         <View style={styles.headerContent}>
//           <Text style={styles.headerTitle}>{tSafe('my_profile', 'My Profile')}</Text>
//         </View>
//         <View style={styles.avatar_background}>
//             <AvatarUploader
//               userId={currentUserId}
//               default_photo={avatar}
//               image_type="avatar"
//               get_uploaded_photo={getUploadedPhoto}
//             />
//             <Text style={styles.name}>{currentUser.firstname} {currentUser.lastname}</Text>
//             <Text style={styles.location}>{currentUser?.location?.city}, {currentUser?.location?.region}</Text>
//           </View>
//       </LinearGradient>



//         <View style={styles.header}>
//           {/* <View style={styles.avatar_background}>
//             <AvatarUploader
//               userId={currentUserId}
//               default_photo={avatar}
//               image_type="avatar"
//               get_uploaded_photo={getUploadedPhoto}
//             />
//             <Text style={styles.name}>{currentUser.firstname} {currentUser.lastname}</Text>
//             <Text style={styles.location}>{currentUser?.location?.city}, {currentUser?.location?.region}</Text>
//           </View> */}

//           <View style={styles.container}>
//             <ContactDisplay
//               contact={contact}
//               handleOpenContact={handleOpenContact}
//             />

//             <AboutMeDisplay
//               mode="edit"
//               aboutme={aboutme}
//               handleOpenAboutMe={handleOpenAboutMe}
//             />

//             <AvailabilityDisplay
//               cleanerId={currentUserId}
//               mode="edit"
//               availability={availability}
//               handleOpenAvailability={handleOpenAvailability}
//             />

//             <CertificationDisplay
//               mode="edit"
//               certification={certification}
//               handleOpenCertification={handleOpenCertification}
//               onEditCertification={handleEditCertification}
              
//             />
//           </View>
//         </View>

//         <Modal visible={openContactModal} animationType="slide" transparent>
//           <Contact
//             userId={currentUserId}
//             contact={contact}
//             close_modal={handleCloseContact}
//             onUpdate={handleUpdateContact}
//           />
//         </Modal>

//         <Modal visible={openAvailabilityModal} animationType="slide" transparent>
//           <Availability
//             cleanerId={currentUserId}
//             close_avail_modal={handleCloseAvailability}
//             get_availability={handleAvailabilty}
//           />
//         </Modal>

//         <Modal visible={openCertificationModal} animationType="slide" transparent>
//           <Certification
//             userId={currentUserId}
//             certification={editingCertification}
//             close_modal={handleCloseCertification}
//             onUpdate={handleUpdateCertification}
//           />
//         </Modal>

//         <Modal visible={openPaymentTypeModal} animationType="slide">
//           <PaymentMethod close_modal={handleClosePaymentType} />
//         </Modal>

//         <Modal visible={openAboutMeModal} animationType="slide">
//           <AboutMe
//             userId={currentUserId}
//             aboutme={aboutme}
//             update_aboutme={handleUpdateAbout}
//             close_modal={handleCloseAboutMe}
//           />
//         </Modal>
//       </ScrollView>
//       </View>
   
//   );
// }

// const styles = StyleSheet.create({
//   header: { margin: 0 },
//   name: { color: COLORS.white, fontSize: 18 },
//   location: { color: COLORS.white },
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   avatar_background: {
//     paddingTop: 80,
//     paddingBottom: 10,
//     minHeight: 200,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   line: {
//     borderBottomWidth: 0.8,
//     borderColor: COLORS.light_gray_1,
//     marginVertical: 5,
//     height: 4,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 0,
//   },
//   title: {
//     fontSize: 18,
//   },
//   content: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 5,
//   },
//   actions: {
//     flexDirection: 'row',
//   },
//   headerGradient: {
//     paddingTop: 0,
//     paddingBottom: 4,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginLeft: 12,
//   },
// });

// import React, { useEffect, useState, useContext } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   StatusBar,
//   ScrollView,
//   Modal,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
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
// import { get, ref, update } from 'firebase/database';
// import { db } from '../../services/firebase/config';
// import { LinearGradient } from 'expo-linear-gradient';
// import { format } from 'date-fns';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { tSafe } from '../../utils/tSafe';

// const toSafeDate = (dateValue, fallback = new Date()) => {
//   if (!dateValue) return fallback;
//   try {
//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return fallback;
//     return date;
//   } catch {
//     return fallback;
//   }
// };

// export default function Profile() {
//   const { currentUserId, currentUser } = useContext(AuthContext);

//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [avatar, setUserAvatar] = useState('');
//   const [location, setLocation] = useState('');
//   const [contact, setContact] = useState({ address: '', phone: '', email: '' });
//   const [aboutme, setAboutMe] = useState('');
//   const [certification, setCertification] = useState([]);
//   const [openContactModal, setOpenContactModal] = useState(false);
//   const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
//   const [openCertificationModal, setOpenCertificationModal] = useState(false);
//   const [editingCertification, setEditingCertification] = useState(null);
//   const [openPaymentTypeModal, setOpenPaymentTypeModal] = useState(false);
//   const [openAboutMeModal, setOpenAboutModal] = useState(false);
//   const [availability, setAvailability] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchUser();
//     fetchAvailability();
//   }, []);

//   const fetchUser = async () => {
//     try {
//       const response = await userService.getUser(currentUserId);
//       const res = response.data;
//       setFirstname(res.firstname || '');
//       setLastname(res.lastname || '');
//       setUserAvatar(res.avatar || '');
//       setLocation(res.location || {});
//       setContact({
//         address: res.contact?.address || '',
//         phone: res.phone || '',
//         email: res.email || '',
//       });
//       setAboutMe(res.aboutme || '');
//       setCertification(res.certification || []);
//     } catch (error) {
//       console.error('Error fetching user:', error);
//     }
//   };

//   const fetchAvailability = async () => {
//     try {
//       const response = await userService.getCleanerAvailability(currentUserId);
//       const data = response.data.data;
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
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_load_availability', 'Failed to load availability')
//       );
//     }
//   };

//   const getUploadedPhoto = (photoUri) => {
//     const data = { userId: currentUserId, avatar: photoUri };
//     userService.updateProfileAvatar(data)
//       .then(() => updateFirebaseAvatar(data))
//       .catch(console.error);
//     setUserAvatar(photoUri);
//   };

//   const updateFirebaseAvatar = async (data) => {
//     const snapshot = await get(ref(db, `users/${data.userId}`));
//     if (snapshot.exists()) {
//       update(ref(db, `users/${data.userId}`), { avatar: data.avatar });
//     }
//   };

//   const handleOpenContact = () => setOpenContactModal(true);
//   const handleCloseContact = () => setOpenContactModal(false);

//   const handleUpdateContact = (updatedContact) => {
//     setContact(updatedContact);
//   };

//   const handleOpenAvailability = () => setOpenAvailabilityModal(true);
//   const handleCloseAvailability = () => setOpenAvailabilityModal(false);

//   const handleAvailabilty = (originalData) => {
//     const newData = availabilityRange(originalData);
//     setAvailability(newData);
//   };

//   const handleOpenCertification = () => {
//     setEditingCertification(null);
//     setOpenCertificationModal(true);
//   };
//   const handleEditCertification = (cert) => {
//     setEditingCertification(cert);
//     setOpenCertificationModal(true);
//   };

//   const handleUpdateCertification = (savedCert) => {
//     setCertification(prev => {
//       const index = prev.findIndex(c => c._id === savedCert._id);
//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index] = savedCert;
//         return updated;
//       } else {
//         return [...prev, savedCert];
//       }
//     });
//   };
//   const handleCloseCertification = () => {
//     setOpenCertificationModal(false);
//     setEditingCertification(null);
//   };

//   const handleOpenAboutMe = () => setOpenAboutModal(true);
//   const handleCloseAboutMe = () => setOpenAboutModal(false);
//   const handleUpdateAbout = (text) => setAboutMe(text);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
//       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         {/* Header Section */}
//         <LinearGradient
//           colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
//           style={styles.headerGradient}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.headerContent}>
//             <Text style={styles.headerTitle}>{tSafe('my_profile', 'My Profile')}</Text>
//           </View>
//           <View style={styles.avatarSection}>
//             <AvatarUploader
//               userId={currentUserId}
//               default_photo={avatar}
//               image_type="avatar"
//               get_uploaded_photo={getUploadedPhoto}
//             />
//             <Text style={styles.name}>{currentUser?.firstname || ''} {currentUser?.lastname || ''}</Text>
//             <Text style={styles.location}>
//               {currentUser?.location?.city}, {currentUser?.location?.region}
//             </Text>
//           </View>
//         </LinearGradient>

//         {/* Content Cards */}
//         <View style={styles.cardsContainer}>
//           <ContactDisplay
//             contact={contact}
//             handleOpenContact={handleOpenContact}
//           />

//           <AboutMeDisplay
//             mode="edit"
//             aboutme={aboutme}
//             handleOpenAboutMe={handleOpenAboutMe}
//           />

//           <AvailabilityDisplay
//             cleanerId={currentUserId}
//             mode="edit"
//             availability={availability}
//             handleOpenAvailability={handleOpenAvailability}
//           />

//           <CertificationDisplay
//             mode="edit"
//             certification={certification}
//             handleOpenCertification={handleOpenCertification}
//             onEditCertification={handleEditCertification}
//           />
//         </View>
//       </ScrollView>

//       {/* Modals */}
//       <Modal visible={openContactModal} animationType="slide" transparent>
//         <Contact
//           userId={currentUserId}
//           contact={contact}
//           close_modal={handleCloseContact}
//           onUpdate={handleUpdateContact}
//         />
//       </Modal>

//       <Modal visible={openAvailabilityModal} animationType="slide" transparent>
//         <Availability
//           cleanerId={currentUserId}
//           close_avail_modal={handleCloseAvailability}
//           get_availability={handleAvailabilty}
//         />
//       </Modal>

//       <Modal visible={openCertificationModal} animationType="slide" transparent>
//         <Certification
//           userId={currentUserId}
//           certification={editingCertification}
//           close_modal={handleCloseCertification}
//           onUpdate={handleUpdateCertification}
//         />
//       </Modal>

//       <Modal visible={openAboutMeModal} animationType="slide" transparent>
//         <AboutMe
//           userId={currentUserId}
//           aboutme={aboutme}
//           update_aboutme={handleUpdateAbout}
//           close_modal={handleCloseAboutMe}
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   headerGradient: {
//     paddingTop: 10,
//     paddingBottom: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },
//   avatarSection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   name: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#fff',
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   location: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.8)',
//   },
//   cardsContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 30,
//   },
// });



// import React, { useEffect, useState, useContext } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   StatusBar,
//   ScrollView,
//   Modal,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
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
// import { get, ref, update } from 'firebase/database';
// import { db } from '../../services/firebase/config';
// import { LinearGradient } from 'expo-linear-gradient';
// import { format } from 'date-fns';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { tSafe } from '../../utils/tSafe';

// const toSafeDate = (dateValue, fallback = new Date()) => {
//   if (!dateValue) return fallback;
//   try {
//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return fallback;
//     return date;
//   } catch {
//     return fallback;
//   }
// };

// export default function Profile() {
//   const { currentUserId, currentUser, logout } = useContext(AuthContext);

//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [avatar, setUserAvatar] = useState('');
//   const [location, setLocation] = useState('');
//   const [contact, setContact] = useState({ address: '', phone: '', email: '' });
//   const [aboutme, setAboutMe] = useState('');
//   const [certification, setCertification] = useState([]);
//   const [openContactModal, setOpenContactModal] = useState(false);
//   const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
//   const [openCertificationModal, setOpenCertificationModal] = useState(false);
//   const [editingCertification, setEditingCertification] = useState(null);
//   const [openPaymentTypeModal, setOpenPaymentTypeModal] = useState(false);
//   const [openAboutMeModal, setOpenAboutModal] = useState(false);
//   const [availability, setAvailability] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     fetchUser();
//     fetchAvailability();
//   }, []);

//   const fetchUser = async () => {
//     try {
//       const response = await userService.getUser(currentUserId);
//       const res = response.data;
//       setFirstname(res.firstname || '');
//       setLastname(res.lastname || '');
//       setUserAvatar(res.avatar || '');
//       setLocation(res.location || {});
//       setContact({
//         address: res.contact?.address || '',
//         phone: res.phone || '',
//         email: res.email || '',
//       });
//       setAboutMe(res.aboutme || '');
//       setCertification(res.certification || []);
//     } catch (error) {
//       console.error('Error fetching user:', error);
//     }
//   };

//   const fetchAvailability = async () => {
//     try {
//       const response = await userService.getCleanerAvailability(currentUserId);
//       const data = response.data.data;
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
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_load_availability', 'Failed to load availability')
//       );
//     }
//   };

//   const getUploadedPhoto = (photoUri) => {
//     const data = { userId: currentUserId, avatar: photoUri };
//     userService.updateProfileAvatar(data)
//       .then(() => updateFirebaseAvatar(data))
//       .catch(console.error);
//     setUserAvatar(photoUri);
//   };

//   const updateFirebaseAvatar = async (data) => {
//     const snapshot = await get(ref(db, `users/${data.userId}`));
//     if (snapshot.exists()) {
//       update(ref(db, `users/${data.userId}`), { avatar: data.avatar });
//     }
//   };

//   const handleOpenContact = () => setOpenContactModal(true);
//   const handleCloseContact = () => setOpenContactModal(false);

//   const handleUpdateContact = (updatedContact) => {
//     setContact(updatedContact);
//   };

//   const handleOpenAvailability = () => setOpenAvailabilityModal(true);
//   const handleCloseAvailability = () => setOpenAvailabilityModal(false);

//   const handleAvailabilty = (originalData) => {
//     const newData = availabilityRange(originalData);
//     setAvailability(newData);
//   };

//   const handleOpenCertification = () => {
//     setEditingCertification(null);
//     setOpenCertificationModal(true);
//   };
//   const handleEditCertification = (cert) => {
//     setEditingCertification(cert);
//     setOpenCertificationModal(true);
//   };

//   const handleUpdateCertification = (savedCert) => {
//     setCertification(prev => {
//       const index = prev.findIndex(c => c._id === savedCert._id);
//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index] = savedCert;
//         return updated;
//       } else {
//         return [...prev, savedCert];
//       }
//     });
//   };
//   const handleCloseCertification = () => {
//     setOpenCertificationModal(false);
//     setEditingCertification(null);
//   };

//   const handleOpenAboutMe = () => setOpenAboutModal(true);
//   const handleCloseAboutMe = () => setOpenAboutModal(false);
//   const handleUpdateAbout = (text) => setAboutMe(text);

//   // --- Delete Account Functions ---
//   const handleDeleteAccount = () => {
//     Alert.alert(
//       tSafe('delete_account_title', 'Delete Account'),
//       tSafe('delete_account_message', 'Are you sure you want to permanently delete your account? This action cannot be undone.'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('delete', 'Delete'),
//           style: 'destructive',
//           onPress: confirmDeleteAccount
//         }
//       ]
//     );
//   };

//   const confirmDeleteAccount = async () => {
//     setDeleting(true);
//     try {
//       // Call API to delete the account
//       await userService.deleteAccount(currentUserId);

//       // Optionally remove Firebase data
//       // const userRef = ref(db, `users/${currentUserId}`);
//       // await remove(userRef);

//       // Logout – clears tokens, storage, and navigates to Public
//       await logout();

//       // Show success (may not be visible due to logout)
//       Alert.alert(
//         tSafe('account_deleted_title', 'Account Deleted'),
//         tSafe('account_deleted_message', 'Your account has been permanently deleted.')
//       );
//     } catch (error) {
//       console.error('Delete account error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('delete_account_failed', 'Failed to delete account. Please try again.')
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
//       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         {/* Header Section */}
//         <LinearGradient
//           colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
//           style={styles.headerGradient}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
//           <View style={styles.headerContent}>
//             <Text style={styles.headerTitle}>{tSafe('my_profile', 'My Profile')}</Text>
//           </View>
//           <View style={styles.avatarSection}>
//             <AvatarUploader
//               userId={currentUserId}
//               default_photo={avatar}
//               image_type="avatar"
//               get_uploaded_photo={getUploadedPhoto}
//             />
//             <Text style={styles.name}>{currentUser?.firstname || ''} {currentUser?.lastname || ''}</Text>
//             <Text style={styles.location}>
//               {currentUser?.location?.city}, {currentUser?.location?.region}
//             </Text>
//           </View>
//         </LinearGradient>

//         {/* Content Cards */}
//         <View style={styles.cardsContainer}>
//           <ContactDisplay
//             contact={contact}
//             handleOpenContact={handleOpenContact}
//           />

//           <AboutMeDisplay
//             mode="edit"
//             aboutme={aboutme}
//             handleOpenAboutMe={handleOpenAboutMe}
//           />

//           <AvailabilityDisplay
//             cleanerId={currentUserId}
//             mode="edit"
//             availability={availability}
//             handleOpenAvailability={handleOpenAvailability}
//           />

//           <CertificationDisplay
//             mode="edit"
//             certification={certification}
//             handleOpenCertification={handleOpenCertification}
//             onEditCertification={handleEditCertification}
//           />

//           {/* Delete Account Button */}
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={handleDeleteAccount}
//             disabled={deleting}
//             activeOpacity={0.7}
//           >
//             {deleting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.deleteButtonText}>
//                 {tSafe('delete_account', 'Delete Account')}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Modals */}
//       <Modal visible={openContactModal} animationType="slide" transparent>
//         <Contact
//           userId={currentUserId}
//           contact={contact}
//           close_modal={handleCloseContact}
//           onUpdate={handleUpdateContact}
//         />
//       </Modal>

//       <Modal visible={openAvailabilityModal} animationType="slide" transparent>
//         <Availability
//           cleanerId={currentUserId}
//           close_avail_modal={handleCloseAvailability}
//           get_availability={handleAvailabilty}
//         />
//       </Modal>

//       <Modal visible={openCertificationModal} animationType="slide" transparent>
//         <Certification
//           userId={currentUserId}
//           certification={editingCertification}
//           close_modal={handleCloseCertification}
//           onUpdate={handleUpdateCertification}
//         />
//       </Modal>

//       <Modal visible={openAboutMeModal} animationType="slide" transparent>
//         <AboutMe
//           userId={currentUserId}
//           aboutme={aboutme}
//           update_aboutme={handleUpdateAbout}
//           close_modal={handleCloseAboutMe}
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   headerGradient: {
//     paddingTop: 10,
//     paddingBottom: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },
//   avatarSection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   name: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#fff',
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   location: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.8)',
//   },
//   cardsContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 30,
//   },
//   deleteButton: {
//     backgroundColor: '#dc3545',
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 16,
//     marginHorizontal: 4,
//     shadowColor: '#dc3545',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//   },
// });



import React, { useEffect, useState, useContext, useCallback } from 'react';
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
import PaymentMethod from '../../components/cleaner/PaymentMethod';
import AboutMe from '../../components/cleaner/AboutMe';
import AboutMeDisplay from './AboutMeDisplay';
import { get, ref, update } from 'firebase/database';
import { db } from '../../services/firebase/config';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Feather, Ionicons } from '@expo/vector-icons';
import { tSafe } from '../../utils/tSafe';
import { useFocusEffect } from '@react-navigation/native';

// const toSafeDate = (dateValue, fallback = new Date()) => {
//   if (!dateValue) return fallback;
//   try {
//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return fallback;
//     return date;
//   } catch {
//     return fallback;
//   }
// };

export default function Profile() {
  const { currentUserId, currentUser, logout } = useContext(AuthContext);

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
  const [deleting, setDeleting] = useState(false);

  // NEW: Penalty & Performance state
  const [penaltyImpacts, setPenaltyImpacts] = useState({ reliability: 0, score_penalty: 0 });
  const [calculatedPerformance, setCalculatedPerformance] = useState(null);

  const [bookedSchedules, setBookedSchedules] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchAvailability();
  }, []);

   // Run when screen focuses
   useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchAvailability()
    }, [])
  );

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

      // ✅ Extract penalty and performance data
      if (res.effective_penalty_impacts) {
        setPenaltyImpacts({
          reliability: res.effective_penalty_impacts.reliability || 0,
          score_penalty: res.effective_penalty_impacts.score_penalty || 0,  // ✅ renamed
        });
      }
      if (res.calculated_performance) {
        setCalculatedPerformance(res.calculated_performance);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Inside Profile component

  // Inside Profile component

const fetchAvailability = async () => {
  try {
    const response = await userService.getCleanerAvailability(currentUserId);
    const data = response.data.data;
    const formatted = (data?.availability || []).map((item) => ({
      day: item.day,
      slots: (item.slots || []).map((slot) => ({
        start: slot.start,
        end: slot.end,
      })),
    }));
    setAvailability(formatted);
    setBookedSchedules(data.booked_schedules || []);
  } catch (err) {
    console.error('Error fetching availability:', err);
    Alert.alert(
      tSafe('error_title', 'Error'),
      tSafe('failed_load_availability', 'Failed to load availability')
    );
  }
};

const handleAvailabilty = (originalData) => {
  const availabilityData = originalData?.availability || originalData;
  if (!Array.isArray(availabilityData)) {
    console.warn('Unexpected availability data format', originalData);
    return;
  }
  const formatted = availabilityData.map((item) => ({
    day: item.day,
    slots: (item.slots || []).map((slot) => ({
      start: slot.start,
      end: slot.end,
    })),
  }));
  setAvailability(formatted);
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

  const handleOpenAboutMe = () => setOpenAboutModal(true);
  const handleCloseAboutMe = () => setOpenAboutModal(false);
  const handleUpdateAbout = (text) => setAboutMe(text);

  // --- Delete Account Functions ---
  const handleDeleteAccount = () => {
    Alert.alert(
      tSafe('delete_account_title', 'Delete Account'),
      tSafe('delete_account_message', 'Are you sure you want to permanently delete your account? This action cannot be undone.'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('delete', 'Delete'),
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount(currentUserId);
      await logout();
      Alert.alert(
        tSafe('account_deleted_title', 'Account Deleted'),
        tSafe('account_deleted_message', 'Your account has been permanently deleted.')
      );
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('delete_account_failed', 'Failed to delete account. Please try again.')
      );
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------
  // Helper: get penalty tier from impact
  // ---------------------------
  const getPenaltyTier = (reliabilityImpact) => {
    const absImpact = Math.abs(reliabilityImpact);
    if (absImpact >= 20) return { tier: 'MAXIMUM', color: '#B91C1C' };
    if (absImpact >= 12) return { tier: 'SEVERE', color: '#EF4444' };
    if (absImpact >= 6) return { tier: 'MODERATE', color: '#F97316' };
    if (absImpact >= 3) return { tier: 'MINOR', color: '#F59E0B' };
    return { tier: 'NONE', color: '#34C759' };
  };

  const tierInfo = getPenaltyTier(penaltyImpacts.reliability);
  const hasPenalty = penaltyImpacts.reliability < 0 || penaltyImpacts.rating < 0;

  // ---------------------------
  // Render Penalty Status Card
  // ---------------------------
  const renderPenaltyStatus = () => (
    <View style={styles.penaltyCard}>
      <View style={styles.penaltyHeader}>
        <Ionicons name="shield-outline" size={22} color="#6B7280" />
        <Text style={styles.penaltyTitle}>{tSafe('penalty_status', 'Penalty Status')}</Text>
        {hasPenalty && (
          <View style={[styles.penaltyBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.penaltyBadgeText}>{tierInfo.tier}</Text>
          </View>
        )}
      </View>

      <View style={styles.penaltyRow}>
        <View style={styles.penaltyItem}>
          <Feather name="activity" size={18} color="#6B7280" />
          <Text style={styles.penaltyLabel}>{tSafe('reliability_impact', 'Reliability')}</Text>
          <Text style={[styles.penaltyValue, { color: penaltyImpacts.reliability < 0 ? '#EF4444' : '#34C759' }]}>
            {penaltyImpacts.reliability > 0 ? '+' : ''}{penaltyImpacts.reliability.toFixed(1)}
          </Text>
        </View>
        <View style={styles.penaltyDivider} />
        {/* <View style={styles.penaltyItem}>
          <Feather name="star" size={18} color="#6B7280" />
          <Text style={styles.penaltyLabel}>{tSafe('rating_impact', 'Rating')}</Text>
          <Text style={[styles.penaltyValue, { color: penaltyImpacts.rating < 0 ? '#EF4444' : '#34C759' }]}>
            {penaltyImpacts.rating > 0 ? '+' : ''}{penaltyImpacts.rating.toFixed(1)}
          </Text>
        </View> */}
        <View style={styles.penaltyItem}>
          <Feather name="star" size={18} color="#6B7280" />
          <Text style={styles.penaltyLabel}>{tSafe('score_penalty', 'Score Penalty')}</Text>
          <Text style={[styles.penaltyValue, { color: penaltyImpacts.score_penalty < 0 ? '#EF4444' : '#34C759' }]}>
            {penaltyImpacts.score_penalty > 0 ? '+' : ''}{penaltyImpacts.score_penalty.toFixed(1)}
          </Text>
        </View>
      </View>

      {hasPenalty && (
        <View style={styles.penaltyNote}>
          <Feather name="info" size={14} color="#9CA3AF" />
          <Text style={styles.penaltyNoteText}>
            {tSafe('penalty_decay_note', 'Penalties gradually reduce over 30 days.')}
          </Text>
        </View>
      )}

      {!hasPenalty && (
        <View style={styles.penaltyNote}>
          <Feather name="check-circle" size={14} color="#34C759" />
          <Text style={[styles.penaltyNoteText, { color: '#34C759' }]}>
            {tSafe('no_active_penalties', 'No active penalties')}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{tSafe('my_profile', 'My Profile')}</Text>
          </View>
          <View style={styles.avatarSection}>
            <AvatarUploader
              userId={currentUserId}
              default_photo={avatar}
              image_type="avatar"
              get_uploaded_photo={getUploadedPhoto}
            />
            <Text style={styles.name}>{currentUser?.firstname || ''} {currentUser?.lastname || ''}</Text>
            <Text style={styles.location}>
              {currentUser?.location?.city}, {currentUser?.location?.region}
            </Text>
          </View>
        </LinearGradient>

        {/* Content Cards */}
        <View style={styles.cardsContainer}>
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
            bookedSchedules={bookedSchedules}
          />

          <CertificationDisplay
            mode="edit"
            certification={certification}
            handleOpenCertification={handleOpenCertification}
            onEditCertification={handleEditCertification}
          />

          {/* 🟢 Penalty Status Card */}
          {renderPenaltyStatus()}

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>
                {tSafe('delete_account', 'Delete Account')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
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

      <Modal visible={openAboutMeModal} animationType="slide" transparent>
        <AboutMe
          userId={currentUserId}
          aboutme={aboutme}
          update_aboutme={handleUpdateAbout}
          close_modal={handleCloseAboutMe}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  // ----- Penalty Card Styles -----
  penaltyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  penaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  penaltyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  penaltyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  penaltyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  penaltyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  penaltyLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  penaltyValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  penaltyDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  penaltyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  penaltyNoteText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // ----- Delete Button -----
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 4,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});