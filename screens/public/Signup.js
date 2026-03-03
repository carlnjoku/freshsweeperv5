// import React, {useContext, useRef, useState, useEffect } from 'react';

// import { 
//   SafeAreaView,
//   StyleSheet, 
//   ScrollView, 
//   Keyboard,
//   Text, 
//   Alert,
//   StatusBar,
//   View, TouchableOpacity, TextInputComponent } from 'react-native';

// import Button from '../../components/shared/Button';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Animatable from 'react-native-animatable';
// import COLORS from '../../constants/colors';
// import { AuthContext } from '../../context/AuthContext';

// import ROUTES from '../../constants/routes';
// // import PhoneInput from "react-native-phone-number-input";
// import userService from '../../services/connection/userService';

// import { TextInput } from 'react-native-paper';
// // import {
// //   arrayUnion,
// //   doc,
// //   serverTimestamp,
// //   Timestamp,
// //   updateDoc,
// //   setDoc,
// //   getDoc,
// //   collection,
// //   addDoc
// // } from "firebase/firestore";

// import { db } from '../../services/firebase/config';
// import {getDatabase, ref, set } from 'firebase/database'; // Import necessary functions from 'firebase/database'

// import { languages } from '../../data';
// import i18n from '../../i18n';
// import fetchIPGeolocation from '../../services/geolocation';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import { LanguageContext } from '../../context/LanguageContext';



// export default function Signup({navigation, route}) {

//   const { language, changeLanguage } = useContext(LanguageContext);
//   const userType = route?.params?.userType || 'guest'; 
//   // const {userType} = route.params
//   console.log(userType)
//   const generateUniqueId = () => {
//     const timestamp = Date.now().toString(36); // Convert current timestamp to base-36 string
//     const randomString = Math.random().toString(36).substr(2, 5); // Generate a random string
//     return `${timestamp}${randomString}`;
//   };

//   const[email, setEmail]=useState("")
//   const[value, setValue] = useState("");
//   const[formattedValue, setFormattedValue] = useState("");
//   const[valid, setValid] = useState(false);
//   const[showMessage, setShowMessage] = useState(false);

//   const[phoneNumber, setPhoneNumber] = useState('');
//   const phoneInput = useRef();




//   // const {signup,geolocationData} = useContext(AuthContext)
//   const[geolocationData, setGeolocationData] = useState("")


//   const [inputs, setInputs] = React.useState({
//     email: '',
//     firstname: '',
//     lastname: '',
//     password: '',
//     userType:userType,
//     // language:'en',
//     phone:'',
//     aboutme: [],
//     availability: [],
//     certification: [],
//   });


  
//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error("Error fetching geolocation:", error);
//     }
//   };


//   console.log("give me location", inputs)

//   const [errors, setErrors] = React.useState({});
//   const [loading, setLoading] = React.useState(false);
//   const [secureTextEntry, setSecureTextEntry] = useState(true);

  

//   useEffect(() => {
//     const getGeoData = async () => {
//       await fetchGeolocation();
//     };
  
//     getGeoData();
//   }, []);

  

//   useEffect(() => {
//     if (geolocationData) {
//       setInputs((prev) => ({
//         ...prev,
//         location: geolocationData,
//       }));
//     }
//   }, [geolocationData]);
  
//   const togglePasswordVisibility = () => {
//     setSecureTextEntry(!secureTextEntry);
//   };

//   const createUserChats = async(userinfo) => {
//     await setDoc(doc(db, "userChats", userinfo._id), {});
//     // await setDoc(doc(db, "users", userinfo._id), userinfo);
//   }

//   const writeUserData = (userData) => {
//     try {
//         // setDoc(doc(db, "userChats", userData._id), {});
//         const userId = userData._id;
//         const firstname = userData.firstname;
//         const lastname = userData.lastname;
//         const email = userData.email;
//         const avatar = userData.avatar
//         const userRef = `users/${userId}`;
//         const userDatabaseRef = ref(db, userRef);
//         set(userDatabaseRef, {
//           userId: userId,
//           firstname:firstname,
//           lastname:lastname,
//           language:inputs.language,
//           email:email,
//           avatar:avatar
//         });

//         const unreadMsgRef = `unreadMessages/${userId}`;
//         const unreadMsgDatabaseRef = ref(db, unreadMsgRef);
//         set(unreadMsgDatabaseRef, {
          
//         })
//         // alert("Data written successfully!");
//     } catch (error) {
//         console.error("Error writing data: ", error);
//         // alert("An error occurred while writing data.");
//     }

//   };

// // find user in firebase database 
// // const findUser = async(email) => {
// //   const mySnapshot = get(ref(db, `users/${email}`));
// //   return mySnapshot.val()
// // }

//   const validate = () => {
//     Keyboard.dismiss();
//     let isValid = true;

//     if (!inputs.email) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter email</Text></Animatable.View>, 'email');
//       isValid = false;
//     } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter a valid email</Text></Animatable.View>, 'email');
//       isValid = false;
//     }

//     // if (!inputs.username) {
//     //   handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter username</Text></Animatable.View>, 'username');
//     //   isValid = false;
//     // }
//     if (!inputs.firstname) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter first name</Text></Animatable.View>, 'firstname');
//       isValid = false;
//     }
//     if (!inputs.lastname) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter last name</Text></Animatable.View>, 'lastname');
//       isValid = false;
//     }
    

//     // if (!inputs.phone) {
//     //   handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter phone number</Text></Animatable.View>, 'phone');
//     //   isValid = false;
//     // }

//     if (!inputs.password) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please input password</Text></Animatable.View>, 'password');
//       isValid = false;
//     } else if (inputs.password.length < 5) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Min password length of 5</Text></Animatable.View>, 'password');
//       isValid = false;
//     }

//     if (isValid) {
//       setLoading(!loading);
//       register();
//     }
//   };

//   const addDataToCollection = async (data) => {
//     try {
//       const collectionRef = doc(db, "your-collection-name", "1234567");
//       await setDoc(collectionRef, {
//         // Your data object here
//         data
//       });
//       console.log("Data added successfully");
//     } catch (error) {
//       console.error("Error adding data: ", error);
//     }
//   };

//   // const createUser = async (userData) => {
//   //   try {
//   //     const usersCollection = collection(db, "users"); // Replace "users" with your collection name
//   //     const newUserRef = await addDoc(usersCollection, userData);
//   //     console.log("New user added with ID: ", newUserRef.id);
//   //   } catch (error) {
//   //     console.error("Error creating user: ", error);
//   //   }
//   // };

//   const createUser = async (userData) => {
    
//     try {
//         const usersCollection = collection(db, "users"); // Replace "users" with your collection name
     
//         const newUserRef = await addDoc(usersCollection, userData);
//         console.log("New user added with ID: ", newUserRef.id);
//     } catch (error) {
//         console.error("Error creating user: ", error);
//     }
// };
  

//   const register = () => {
//     console.log("location", geolocationData)
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         setLoading(false);
//         console.log("User data", inputs)
//         const data = {
//           inputs,
//         }
        
//         AsyncStorage.setItem('userData', JSON.stringify(inputs));
//         console.log("User data to upload", data)
//         userService.createUser(inputs)
//         .then(response => {
//           const status = response.status;
//           console.log("Status",status)
//           const res = response.data;
//           console.log("_______________________________12____________________")
//           console.log(response.data)
//           console.log("_______________________________12____________________")
//           if(status === 200){
//             setEmail(res.email)
//             writeUserData(res)
//             console.log("Did it enter?")
//             console.log(res)
//             // Login user after signup
//             navigation.navigate(ROUTES.signin, {"email":res.email});
//           }

//         }).catch(err=> {
//           console.log(err)
//         })
        
//       } catch (error) {
//         Alert.alert('Error', 'Something went wrong');
//       }
//     }, 3000);
//   };

//   const formatPhoneNumber = (input) => {
//     const cleaned = ('' + input).replace(/\D/g, '');
//     const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//     if (match) {
//       return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//     }
//     return input;
//   };

//   const handleInputChange = (text, input) => {
//     // setPhoneNumber(formatPhoneNumber(text));
//     setInputs(prevState => ({...prevState, [input]: formatPhoneNumber(text)}));
//   };


//   const handleOnchange = (text, input) => {
//     setInputs(prevState => ({...prevState, [input]: text}));
//   };

//   const handleError = (error, input) => {
//     setErrors(prevState => ({...prevState, [input]: error}));
//   };

//   const handleLanguageChange = (langCode) => {
//     setInputs((prev) => ({
//       ...prev,
//       language: langCode,
//     }));
//     i18n.changeLanguage(langCode); // Optional: update app language right away
//     changeLanguage(langCode);
//   };

  

//   return (

    
//    <SafeAreaView
//           style={{
//             flex:1,
//             // justifyContent:'center',
//             backgroundColor:COLORS.white,
//             // alignItems:'center',
//           }}
//         >
//           <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//           {/* <Loader visible={loading} /> */}
//         <ScrollView 
//           showsVerticalScrollIndicator={false} 
//           contentContainerStyle={{paddingTop: 60, paddingHorizontal: 20}}>
         
//           <View style={styles.header}>
//             <Text style={styles.text_header}>Create {userType == "host" ?  "Host":  "Cleaner" } Account</Text>
//           </View>
          
          
//           <View style={{marginVertical: 0}}>
            
      
//           <View style={{ padding: 0, marginBottom:10 }}>
//             <FloatingLabelPickerSelect
//               label="Select Language"
//               items={languages.map(lang => ({
//                 label: lang.label,
//                 value: lang.value,
//               }))}
//               value={inputs.language}
//               onValueChange={handleLanguageChange}
//             />
//             </View>
             
//             <TextInput
//               mode="outlined"
//               label="First Name"
//               placeholder="Enter your first name"
//               placeholderTextColor={COLORS.gray}
//               outlineColor="#D8D8D8"
//               value={inputs.firstname}
//               activeOutlineColor={COLORS.primary}
//               style={{marginBottom:10, fontSize:14, backgroundColor:"#fff"}}
//               onChangeText={text => handleOnchange(text, 'firstname')}
//               onFocus={() => handleError(null, 'firstname')}
//               error={errors.firstname}
//               left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
//           />
//             <TextInput
//               mode="outlined"
//               onChangeText={text => handleOnchange(text, 'lastname')}
//               onFocus={() => handleError(null, 'lastname')}
//               label="Last Name"
//               outlineColor="#D8D8D8"
//               placeholder="Enter your last name"
//               error={errors.lastname}
//               left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
//               value={inputs.lastname}
//               activeOutlineColor={COLORS.primary}
//               style={{marginBottom:10, fontSize:14, backgroundColor:"#fff"}}
//             />
//             <TextInput
//               mode="outlined"
//               autoCap="none"
//               onChangeText={text => handleOnchange(text, 'email')}
//               onFocus={() => handleError(null, 'email')}
//               label="Email"
//               placeholder="Enter your email address"
//               outlineColor="#D8D8D8"
//               autoCapitalize="none" // Disable automatic capitalization
//               error={errors.email}
//               left={<TextInput.Icon  icon="email-outline" style={{marginTop:10}} fontSize="small" />}
//               value={inputs.email}
//               activeOutlineColor={COLORS.primary}
//               style={{marginBottom:10, fontSize:14, backgroundColor:"#fff"}}
//             />
            
//             <TextInput
//               label="Mobile Phone"
//               placeholder="Mobile Phone"
//               mode="outlined"
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//               value={inputs.phone}
//               left={<TextInput.Icon  icon="phone-outline" style={{marginTop:10}} fontSize="small" />}
//               onChangeText={text => handleInputChange(text, 'phone')}
//               keyboardType="phone-pad" // Show numeric keypad on mobile
//               style={{marginBottom:10, fontSize:14, width:'100%', backgroundColor:"#fff"}}
//               onFocus={() => handleError(null, 'phone')}
//               error={errors.contack_phone}
//           />

          

//           {/* <PhoneInput
//             ref={phoneInput}
//             defaultValue={value}
//             defaultCode={geolocationData.country_code}
//             layout="first"
//             onChangeText={(text) => {
//               setValue(text);
//             }}
//             onChangeFormattedText={(text) => {
//               setFormattedValue(text);
//             }}
//             withDarkTheme
//             withShadow
//             autoFocus
//           /> */}
             

//             <TextInput
//               mode='outlined'
//               autoCap="none"
//               onChangeText={text => handleOnchange(text, 'password')}
//               onFocus={() => handleError(null, 'password')}
//               left={<TextInput.Icon  icon="lock-outline" style={{marginTop:10}} fontSize="small" />}
//               label="Password"
//               placeholder="Create your password"
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//               error={errors.password}
//               autoCapitalize="none" // Disable automatic capitalization
//               style={{marginBottom:10, fontSize:14, backgroundColor:"#fff"}}
//               secureTextEntry={secureTextEntry} // Password masking
//               right={<TextInput.Icon name={secureTextEntry ? 'eye-off-outline' : 'eyeoutline'} onPress={togglePasswordVisibility} />}
//             />
//             <Button title="Create Account" loading={loading} onPress={validate} />
            
//             <Text
//               onPress={() => navigation.navigate(ROUTES.signin)}
//               style={{
//                 color: COLORS.black,
//                 fontWeight: 'bold',
//                 textAlign: 'center',
//                 fontSize: 16,
//               }}>
//               Already have account ? Login
//             </Text>
//           </View>
         
//         </ScrollView>

//         </SafeAreaView>
//   )
// }


// const styles = StyleSheet.create({
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#DDDDDD',
//     justifyContent:'space-between',
//     padding:10,
//     borderRadius:5,
//     width:"90%",
//     marginBottom:50
//   },
//   header: {
//     flex: 0,
//     justifyContent: 'center',
//     paddingTop: 50,
//     paddingBottom: 20
//   },
//   footer: {
//       flex: 5, //Platform.OS === 'ios' ? 3 : 5,
//       // backgroundColor: '#fff',
//       borderTopLeftRadius: 30,
//       borderTopRightRadius: 30,
//       borderBottomLeftRadius: 30,
//       borderBottomRightRadius: 30,
//       paddingHorizontal: 20,
//       paddingVertical: 20,
//   },
//   text_header: {
  
//     fontSize:22,
//     alignSelf:'center',
//     fontWeight:'600',
//     marginBottom:20

//   },
//   text_footer: {
//       color: '#05375a',
//       fontSize: 18
//   },

//     backButton: {
//         position: 'absolute',
//         top: 30,
//         left: 20,
//         zIndex: 10,
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         backgroundColor: '#f5f5f5',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 2,
//       },
   
// });




import React, {useContext, useRef, useState, useEffect } from 'react';
import { 
  SafeAreaView,
  StyleSheet, 
  ScrollView, 
  Keyboard,
  Text, 
  Alert,
  StatusBar,
  View, TouchableOpacity 
} from 'react-native';
import Button from '../../components/shared/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import { TextInput } from 'react-native-paper';
import { getDatabase, ref, set } from 'firebase/database';
import { db } from '../../services/firebase/config';
import { languages } from '../../data';
import i18n from '../../i18n';
import fetchIPGeolocation from '../../services/geolocation';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { LanguageContext } from '../../context/LanguageContext';
import useInviteToken from '../../hooks/useInviteToken';


// export default function Signup({navigation, route}) {
//   const { language, changeLanguage } = useContext(LanguageContext);
//   const userType = route?.params?.userType || 'guest'; 
//   console.log('User type:', userType);
  
//   const [geolocationData, setGeolocationData] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [inputs, setInputs] = React.useState({
//     email: '',
//     firstname: '',
//     lastname: '',
//     password: '',
//     userType: userType,
//     phone: '', // Will store CLEAN digits only
//     aboutme: {},
//     availability: {},
//     certification: [],
//     // language: language || 'en'
//   });
  
//   const [errors, setErrors] = React.useState({});
//   const [loading, setLoading] = React.useState(false);
//   const [secureTextEntry, setSecureTextEntry] = useState(true);

//   // Format phone for display only
//   const formatPhoneNumber = (input) => {
//     const cleaned = ('' + input).replace(/\D/g, '');
//     if (cleaned.length === 10) {
//       return '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 10);
//     }
//     return cleaned; // Return digits if not 10 characters
//   };

//   // Handle phone input with formatting for display
//   const handlePhoneChange = (text) => {
//     // Remove all non-digits
//     const cleaned = text.replace(/\D/g, '');
    
//     // Limit to 10 digits for US numbers (adjust for international)
//     const limited = cleaned.slice(0, 10);
    
//     // Format for display
//     const formatted = formatPhoneNumber(limited);
    
//     // Update displayed value
//     setPhoneNumber(formatted);
    
//     // Store clean digits in inputs state
//     setInputs(prev => ({
//       ...prev,
//       phone: limited // Store digits only
//     }));
//   };

//   // Regular input change for other fields
//   const handleOnchange = (text, input) => {
//     setInputs(prevState => ({...prevState, [input]: text}));
//   };

//   const handleError = (error, input) => {
//     setErrors(prevState => ({...prevState, [input]: error}));
//   };

//   const togglePasswordVisibility = () => {
//     setSecureTextEntry(!secureTextEntry);
//   };

//   const validate = () => {
//     Keyboard.dismiss();
//     let isValid = true;

//     // Email validation
//     if (!inputs.email) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter email</Text></Animatable.View>, 'email');
//       isValid = false;
//     } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter a valid email</Text></Animatable.View>, 'email');
//       isValid = false;
//     }

//     // First name validation
//     if (!inputs.firstname) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter first name</Text></Animatable.View>, 'firstname');
//       isValid = false;
//     }

//     // Last name validation
//     if (!inputs.lastname) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter last name</Text></Animatable.View>, 'lastname');
//       isValid = false;
//     }

//     // Phone validation (optional but recommended)
//     if (inputs.phone && inputs.phone.length < 10) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter a valid 10-digit phone number</Text></Animatable.View>, 'phone');
//       isValid = false;
//     }

//     // Password validation
//     if (!inputs.password) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please input password</Text></Animatable.View>, 'password');
//       isValid = false;
//     } else if (inputs.password.length < 5) {
//       handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Min password length of 5</Text></Animatable.View>, 'password');
//       isValid = false;
//     }

//     if (isValid) {
//       setLoading(true);
//       register();
//     }
//   };

//   // Add phone number validation before sending
//   const validatePhoneNumber = () => {
//     if (!inputs.phone || inputs.phone.length === 0) {
//       return true; // Phone is optional
//     }
    
//     const cleaned = inputs.phone.replace(/\D/g, '');
//     return cleaned.length >= 10;
//   };

//   const register = () => {
//     console.log("Location data:", geolocationData);
//     console.log("User inputs to send:", inputs);
    
//     // Validate phone number one more time
//     if (!validatePhoneNumber()) {
//       Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number or leave it blank');
//       setLoading(false);
//       return;
//     }
    
//     // Prepare data for backend
//     const userData = {
//       ...inputs,
//       location: geolocationData,
//       contact: {
//         phone: inputs.phone, // Clean digits
//         ...(geolocationData ? {
//           cityLong: geolocationData.city,
//           stateLong: geolocationData.region,
//           countryLong: geolocationData.country,
//           postalCode: geolocationData.postal
//         } : {})
//       }
//     };
    
//     console.log("Sending user data:", userData);
    
//     userService.createUser(userData)
//       .then(response => {
//         setLoading(false);
//         console.log("Response status:", response.status);
//         console.log("Response data:", response.data);
        
//         if (response.status === 200) {
//           const user = response.data;
          
//           // Store in Firebase if needed
//           // writeUserData(user);
          
//           // Navigate to login with email
//           navigation.navigate(ROUTES.signin, { 
//             email: user.email,
//             message: 'Account created successfully. Please login.'
//           });
//         }
//       })
//       .catch(err => {
//         setLoading(false);
//         console.error("Signup error:", err);
        
//         let errorMessage = 'Something went wrong. Please try again.';
//         if (err.response?.data?.detail) {
//           errorMessage = err.response.data.detail;
//         } else if (err.response?.data?.message) {
//           errorMessage = err.response.data.message;
//         }
        
//         Alert.alert('Signup Failed', errorMessage);
//       });
//   };

//   // Fetch geolocation
//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error("Error fetching geolocation:", error);
//     }
//   };

//   useEffect(() => {
//     fetchGeolocation();
//   }, []);

//   const handleLanguageChange = (langCode) => {
//     setInputs((prev) => ({
//       ...prev,
//       language: langCode,
//     }));
//     i18n.changeLanguage(langCode);
//     changeLanguage(langCode);
//   };

export default function Signup({navigation, route}) {

  // const inviteToken = useInviteToken(); // 🔹 Get token from deep link
  const { language, changeLanguage } = useContext(LanguageContext);
  const userType = route?.params?.userType || 'guest'; // userType coming from both manual and Deeplinking route
  const { inviteToken } = route.params || {};  //token coming fromm Deeplinking route


  console.log('Invite Token:', inviteToken);
  console.log('User Type:', userType);
  
  const [geolocationData, setGeolocationData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Initialize with proper types matching backend model
  const [inputs, setInputs] = React.useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    userType: userType,
    phone: '', // Will store CLEAN digits only
    auth_methods: ['password'], // Required by backend
    location: null, // Will be set from geolocationData
    aboutme: null, // Should be null or string, not object
    availability: null, // Should be null or dict, not empty object
    certification: [], // Empty array is fine
  });
  
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Format phone for display only
  const formatPhoneNumber = (input) => {
    const cleaned = ('' + input).replace(/\D/g, '');
    if (cleaned.length === 10) {
      return '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 10);
    }
    return cleaned; // Return digits if not 10 characters
  };

  // Handle phone input with formatting for display
  const handlePhoneChange = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits for US numbers (adjust for international)
    const limited = cleaned.slice(0, 10);
    
    // Format for display
    const formatted = formatPhoneNumber(limited);
    
    // Update displayed value
    setPhoneNumber(formatted);
    
    // Store clean digits in inputs state
    setInputs(prev => ({
      ...prev,
      phone: limited // Store digits only
    }));
  };

  // Regular input change for other fields
  const handleOnchange = (text, input) => {
    setInputs(prevState => ({...prevState, [input]: text}));
  };

  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };

  const writeUserData = (userData) => {
    try {
        // setDoc(doc(db, "userChats", userData._id), {});
        const userId = userData._id;
        const firstname = userData.firstname;
        const lastname = userData.lastname;
        const email = userData.email;
        const avatar = userData.avatar
        const userRef = `users/${userId}`;
        const userDatabaseRef = ref(db, userRef);
        set(userDatabaseRef, {
          userId: userId,
          firstname:firstname,
          lastname:lastname,
          language:inputs.language,
          email:email,
          avatar:avatar
        });

        const unreadMsgRef = `unreadMessages/${userId}`;
        const unreadMsgDatabaseRef = ref(db, unreadMsgRef);
        set(unreadMsgDatabaseRef, {
          
        })
        // alert("Data written successfully!");
    } catch (error) {
        console.error("Error writing data: ", error);
        // alert("An error occurred while writing data.");
    }

  };

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;

    // Email validation
    if (!inputs.email) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter email</Text></Animatable.View>, 'email');
      isValid = false;
    } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter a valid email</Text></Animatable.View>, 'email');
      isValid = false;
    }

    // First name validation
    if (!inputs.firstname) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter first name</Text></Animatable.View>, 'firstname');
      isValid = false;
    }

    // Last name validation
    if (!inputs.lastname) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter last name</Text></Animatable.View>, 'lastname');
      isValid = false;
    }

    // Phone validation (optional but recommended)
    if (inputs.phone && inputs.phone.length < 10) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter a valid 10-digit phone number</Text></Animatable.View>, 'phone');
      isValid = false;
    }

    // Password validation
    if (!inputs.password) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please input password</Text></Animatable.View>, 'password');
      isValid = false;
    } else if (inputs.password.length < 5) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Min password length of 5</Text></Animatable.View>, 'password');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      register();
    }
  };

  // Add phone number validation before sending
  const validatePhoneNumber = () => {
    if (!inputs.phone || inputs.phone.length === 0) {
      return true; // Phone is optional
    }
    
    const cleaned = inputs.phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const register = () => {
    console.log("Location data:", geolocationData);
    console.log("User inputs to send:", inputs);
    
    // Validate phone number one more time
    if (!validatePhoneNumber()) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number or leave it blank');
      setLoading(false);
      return;
    }
    
    // Prepare data for backend - MATCHING THE PYDANTIC MODEL
    const userData = {
      email: inputs.email,
      firstname: inputs.firstname,
      lastname: inputs.lastname,
      password: inputs.password,
      userType: inputs.userType,
      phone: inputs.phone || "", // Ensure string, not undefined
      auth_methods: ["password"], // Required by backend
      location: geolocationData, // This should be the Location object
      aboutme: null, // Send null if empty
      availability: null, // Send null if empty
      certification: [], // Empty array
    };
    
    // If user entered aboutme text, include it
    if (inputs.aboutme && inputs.aboutme.trim() !== "") {
      userData.aboutme = inputs.aboutme;
    }
    
    console.log("Sending user data to backend:", JSON.stringify(userData, null, 2));
    
    userService.createUser(userData)
      .then(response => {
        setLoading(false);
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        
        if (response.status === 200 || response.status === 201) {
          const user = response.data;
          writeUserData(user)
          // Navigate to login with email
          navigation.navigate(ROUTES.signin, { 
            email: user.email,
            message: 'Account created successfully. Please login.'
          });

          // 🔹 Optional: accept invite immediately if you want auto-login
          if (inviteToken) {
            const payload = {
              token:inviteToken,
              cleanerId:user._id
            }
            try {
                const inviteResp =  userService.acceptInviteOnSignup(payload);
                // navigation.navigate('PropertyDetails', { propertyId: inviteResp.propertyId });
            } catch (err) {
                console.error("Failed to accept invite:", err);
            }
        }
        }
      })
      .catch(err => {
        setLoading(false);
        console.error("Signup error:", err);
        console.error("Signup error details:", err.response?.data);
        
        let errorMessage = 'Something went wrong. Please try again.';
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          errorMessage = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
        }
        
        Alert.alert('Signup Failed', errorMessage);
      });
  };

  // Fetch geolocation
  const fetchGeolocation = async () => {
    try {
      const data = await fetchIPGeolocation();
      setGeolocationData(data);
      // Update location in inputs
      setInputs(prev => ({
        ...prev,
        location: data
      }));
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      // Set a default location structure to avoid validation errors
      setGeolocationData({
        city: "",
        region: "",
        country: "",
        postal: ""
      });
    }
  };

  useEffect(() => {
    fetchGeolocation();
  }, []);

  const handleLanguageChange = (langCode) => {
    setInputs((prev) => ({
      ...prev,
      language: langCode,
    }));
    i18n.changeLanguage(langCode);
    changeLanguage(langCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.text_header}>
            Create {userType === "host" ? "Host" : "Cleaner"} Account
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.languagePicker}>
            <FloatingLabelPickerSelect
              label="Select Language"
              items={languages.map(lang => ({
                label: lang.label,
                value: lang.value,
              }))}
              value={inputs.language}
              onValueChange={handleLanguageChange}
            />
          </View>
          
          <TextInput
            mode="outlined"
            label="First Name"
            placeholder="Enter your first name"
            outlineColor="#D8D8D8"
            value={inputs.firstname}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            onChangeText={text => handleOnchange(text, 'firstname')}
            onFocus={() => handleError(null, 'firstname')}
            error={errors.firstname}
            left={<TextInput.Icon icon="account-outline" style={styles.inputIcon} />}
          />
          
          <TextInput
            mode="outlined"
            label="Last Name"
            placeholder="Enter your last name"
            outlineColor="#D8D8D8"
            value={inputs.lastname}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            onChangeText={text => handleOnchange(text, 'lastname')}
            onFocus={() => handleError(null, 'lastname')}
            error={errors.lastname}
            left={<TextInput.Icon icon="account-outline" style={styles.inputIcon} />}
          />
          
          <TextInput
            mode="outlined"
            label="Email"
            placeholder="Enter your email address"
            outlineColor="#D8D8D8"
            value={inputs.email}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            onChangeText={text => handleOnchange(text, 'email')}
            onFocus={() => handleError(null, 'email')}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email-outline" style={styles.inputIcon} />}
          />
          
          <TextInput
            label="Mobile Phone"
            placeholder="(123) 456-7890"
            mode="outlined"
            outlineColor="#D8D8D8"
            activeOutlineColor={COLORS.primary}
            value={phoneNumber} // Display formatted
            left={<TextInput.Icon icon="phone-outline" style={styles.inputIcon} />}
            onChangeText={handlePhoneChange} // Use the phone-specific handler
            keyboardType="phone-pad"
            style={styles.input}
            onFocus={() => handleError(null, 'phone')}
            error={errors.phone}
            maxLength={14} // (123) 456-7890 = 14 chars
          />
          
          <Text style={styles.phoneHelperText}>
            Phone number is optional. We'll use it for account verification and important updates.
          </Text>
          
          <TextInput
            mode="outlined"
            label="Password"
            placeholder="Create your password"
            outlineColor="#D8D8D8"
            value={inputs.password}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            onChangeText={text => handleOnchange(text, 'password')}
            onFocus={() => handleError(null, 'password')}
            error={errors.password}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock-outline" style={styles.inputIcon} />}
            right={
              <TextInput.Icon 
                icon={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                onPress={togglePasswordVisibility} 
              />
            }
          />
          
          <Button 
            title="Create Account" 
            loading={loading} 
            onPress={validate} 
          />
          
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.signin)}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLinkText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  text_header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.dark,
    marginTop: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  languagePicker: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    height: 56,
  },
  inputIcon: {
    marginTop: 10,
  },
  phoneHelperText: {
    fontSize: 12,
    color: '#666',
    marginTop: -5,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});



