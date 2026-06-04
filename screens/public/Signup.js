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
import { useNotification } from '../../hooks/useNotification';

export default function Signup({navigation, route}) {

  // const inviteToken = useInviteToken(); // 🔹 Get token from deep link
  const { language, changeLanguage } = useContext(LanguageContext);
  const userType = route?.params?.userType || 'guest'; // userType coming from both manual and Deeplinking route
  const { inviteToken } = route.params || {};  //token coming fromm Deeplinking route


  console.log('Invite Token:', inviteToken);
  console.log('User Type:', userType);

  const { registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();

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
  const [smsConsent, setSmsConsent] = useState(false);
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

    if (!smsConsent) {
      Alert.alert('Consent Required', 'You must agree to receive SMS messages to use this feature. You can opt out later by replying STOP.');
      return false;
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
      sms_consent: smsConsent,   // ✅ store consent flag
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
              
                // registerForPushNotificationsAsync(user._id); // Register token
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
          {/* SMS Opt-in Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSmsConsent(!smsConsent)}
              style={styles.checkbox}
            >
              <View style={[styles.checkboxBox, smsConsent && styles.checkboxChecked]}>
                {smsConsent && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to receive SMS text messages from FreshSweeper about job alerts, booking updates, and other service-related notifications. Message frequency varies. Msg & data rates may apply. I can reply STOP to unsubscribe at any time.
              </Text>
            </TouchableOpacity>
          </View>
          
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


  checkboxContainer: {
    marginVertical: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxTick: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});



