// import React, { useEffect, useContext } from 'react';
// import { 
//   SafeAreaView,
//   StyleSheet, 
//   ScrollView, 
//   Keyboard,
//   Text, 
//   Alert,
//   View, TouchableOpacity } from 'react-native';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import Button from '../../components/shared/Button';
// import Input from '../../components/shared/Input';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import Loader from '../../components/Loader';
// // import ButtonSpinner from 'react-native-button-spinner';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import userService from '../../services/connection/userService';
// import ROUTES from '../../constants/routes';
// import { TextInput } from 'react-native-paper';
// import { tSafe } from '../../utils/tSafe'; // added import



// const ForgotPassword = ({navigation}) => {
  
  
//   const [inputs, setInputs] = React.useState({
//     email: '',
//     // password: '',
//     // verificationCode:''
//   });
  
//   const [errors, setErrors] = React.useState({});
//   const [loading, setLoading] = React.useState(false);
//   const [errMsg, setErrMsg] = React.useState("");
//   const [visible, setVisible] = React.useState(false);


  
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

//     // if (!inputs.password) {
//     //   handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please input password</Text></Animatable.View>, 'password');
//     //   isValid = false;
//     // } else if (inputs.password.length < 5) {
//     //   handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Min password length of 5</Text></Animatable.View>, 'password');
//     //   isValid = false;
//     // }

//     // if (!inputs.verificationCode) {
//     //     handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter 6 digit code</Text></Animatable.View>, 'verificationCode');
//     //     isValid = false;
//     //   }

//     if (isValid) {
//       setLoading(!loading);
//       handleRequestPasswordReset();
//     }
//   };

//   const handleRequestPasswordReset = () => {
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         setLoading(false);
//         AsyncStorage.setItem('userData', JSON.stringify(inputs));
//         userService.requestPasswordReset(inputs)
//         .then(response => {
//           const status = response.data.status;
//           const res = response.data.data;
//           if(status === "success"){
//             setVisible(true)
//             setErrMsg("Verification code sent successfully")
//             navigation.navigate('Signin');
//           }else{
//             setVisible(true)
//             setErrMsg(<Text>Unable to  reset password, please try again</Text>)
//           }

//         }).catch(err=> {
//           console.log(err)
//         })
        
//       } catch (error) {
//         Alert.alert('Error', 'Something went wrong');
//       }
//     }, 3000);
//   };

//   const handleOnchange = (text, input) => {
//     setInputs(prevState => ({...prevState, [input]: text}));
//   };
//   const handleError = (error, input) => {
//     setErrors(prevState => ({...prevState, [input]: error}));
//   };

  


//     return(
//         <SafeAreaView
//           style={{
//             flex:1,
//             justifyContent:'center',
//             backgroundColor:COLORS.backgroundColor,
//             alignItems:'center',
//           }}
//         >
//           {/* <Loader visible={loading} /> */}
//         <ScrollView 
//           showsVerticalScrollIndicator={false} 
//           contentContainerStyle={{paddingTop: 120, paddingHorizontal: 0}}>
         
//           <View style={styles.header}>
//             <Text style={styles.text_header}>Forgot password</Text>
//           </View>

//           {/* <Toast
//             visible={visible}
//             position={50}
//             shadow={false}
//             animation={true}
//             backgroundColor={COLORS.darkBlue}
//             textColor="#fff"
//             hideOnPress={true}
//           >
//             {errMsg}
//           </Toast> */}
          
//           {/* <Animatable.View 
//             animation="fadeInUpBig"
//             style={[styles.footer, {
//                 backgroundColor: COLORS.white
//             }]}
//         > */}
//           {/* <Animatable.View 
//               animation="slideInRight"
//               duration={800}
//               delay={100}
//             > */}
//           <View style={{marginVertical: 0}}>
//             {/* <Input
//               autoCap="none"
//               onChangeText={text => handleOnchange(text, 'email')}
//               onFocus={() => handleError(null, 'email')}
//               iconName="email-outline"
//               label="Email"
//               placeholder="Enter your email address"
//               error={errors.email}
//             /> */}

//             <TextInput
//               mode="outlined"
//               label={tSafe('email', 'Email')}
//               autoCapitalize="none"
//               placeholder={tSafe('enter_your_email', 'Enter your email')}
//               placeholderTextColor={COLORS.gray}
//               outlineColor="#D8D8D8"
//               value={inputs.email}
//               activeOutlineColor={COLORS.primary}
//               style={{ marginBottom: 10, fontSize: 14, backgroundColor: '#fff' }}
//               onChangeText={(text) => handleOnchange(text, 'email')}
//               onFocus={() => handleError(null, 'email')}
//               error={errors.email}
//               left={<TextInput.Icon icon="email" style={{ marginTop: 10 }} fontSize="small" />}
//             />

            
//             {/* <Input
//               autoCap="none"
//               onChangeText={text => handleOnchange(text, 'password')}
//               onFocus={() => handleError(null, 'password')}
//               iconName="lock-outline"
//               label="Password"
//               placeholder="Enter your password"
//               error={errors.password}
//               password
//             />
//             <Input
//               keyboardType = 'numeric'
//               onChangeText={text => handleOnchange(text, 'verificationCode')}
//               onFocus={() => handleError(null, 'verificationCode')}
//               iconName="account-outline"
//               label="Verification Code"
//               placeholder="Enter verification code"
//               error={errors.verificationCode}
//               verificationCode
//               email = {inputs.email}
//             /> */}
//             <Button title="Reset Password" loading={loading} onPress={validate} />
//             {/* <ButtonSpinner
//                 onPress={sendRequest}
//               >
//                 <Text>Position Left</Text>
//               </ButtonSpinner> */}
//             <Text
//               onPress={() => navigation.navigate(ROUTES.signin)}
//               style={{
//                 color: COLORS.black,
//                 fontWeight: 'bold',
//                 textAlign: 'center',
//                 fontSize: 16,
//               }}>
//               Back to Login
//             </Text>
//           </View>
//           {/* </Animatable.View> */}
//         </ScrollView>

//         </SafeAreaView>
//     )
// }

// export default ForgotPassword

// const styles = StyleSheet.create({
//     button: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#DDDDDD',
//       justifyContent:'space-between',
//       padding:10,
//       borderRadius:5,
//       width:"90%",
//       marginBottom:50
//     },
//     header: {
//       flex: 0,
//       justifyContent: 'center',
//       paddingTop: 50,
//       paddingBottom: 20
//     },
//     footer: {
//         flex: 5, //Platform.OS === 'ios' ? 3 : 5,
//         backgroundColor: '#fff',
//         borderTopLeftRadius: 30,
//         borderTopRightRadius: 30,
//         borderBottomLeftRadius: 30,
//         borderBottomRightRadius: 30,
//         paddingHorizontal: 20,
//         paddingVertical: 30
//     },
//     text_header: {
//       color: COLORS.black,
//       textAlign:'center',
//       fontWeight: 'bold',
//       fontSize: 30
//     },
//     text_footer: {
//         color: '#05375a',
//         fontSize: 18
//     },
//   });



import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Keyboard,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  const showMessage = (message, isError = false) => {
    setSnackbar({ visible: true, message, isError });
  };

  const hideSnackbar = () => setSnackbar((prev) => ({ ...prev, visible: false }));

  const validateEmail = (text) => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!text) {
      setEmailError(tSafe('email_required', 'Email is required'));
      return false;
    }
    if (!emailRegex.test(text)) {
      setEmailError(tSafe('email_invalid', 'Please enter a valid email address'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) validateEmail(text);
  };

  // const handleResetPassword = async () => {
  //   Keyboard.dismiss();
  //   if (!validateEmail(email)) return;

  //   setLoading(true);
  //   try {
  //     const response = await userService.forgotPassword({ email });
  //     const { status } = response.data;
  //     if (status === 'success') {
  //       // Optionally store email for later use
  //       await AsyncStorage.setItem('resetEmail', email);
  //       showMessage(tSafe('reset_sent', 'Password reset link sent to your email'));
  //       // Navigate after a short delay to let the user read the message
  //       setTimeout(() => navigation.navigate(ROUTES.signin), 1500);
  //     } else {
  //       showMessage(
  //         tSafe('reset_failed', 'Unable to reset password. Please try again.'),
  //         true
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Password reset error:', error);
      
  //     // Extract error message from backend response
  //     let errorMessage = tSafe('network_error', 'Network error. Please check your connection.');
      
  //     if (error.response) {
  //       // Server responded with a status code outside 2xx
  //       const status = error.response.status;
  //       const detail = error.response.data?.detail;
        
  //       if (status === 404) {
  //         errorMessage = tSafe('email_not_found', 'No account found with this email address.');
  //       } else if (detail) {
  //         errorMessage = detail;
  //       } else if (error.response.data?.message) {
  //         errorMessage = error.response.data.message;
  //       }
  //     } else if (error.request) {
  //       // Request was made but no response received
  //       errorMessage = tSafe('no_server_response', 'Server is not responding. Please try again later.');
  //     }
      
  //     showMessage(errorMessage, true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!validateEmail(email)) return;
  
    setLoading(true);
    try {
      const response = await userService.forgotPassword({ email });
      // Backend always returns 200 with { message: "..." }
      const message = response.data?.message || tSafe('reset_sent', 'Password reset link sent to your email');
      showMessage(message, false);
      
      // Optionally store email for later use
      await AsyncStorage.setItem('resetEmail', email);
      
      // Navigate after a short delay
      setTimeout(() => navigation.navigate(ROUTES.signin), 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = tSafe('network_error', 'Network error. Please try again.');
      
      if (error.response) {
        // Server responded with an error status (shouldn't happen per our design, but handle gracefully)
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.message;
        if (status === 404) {
          errorMessage = tSafe('email_not_found', 'No account found with this email address.');
        } else if (detail) {
          errorMessage = detail;
        } else {
          errorMessage = tSafe('server_error', 'Server error. Please try again later.');
        }
      } else if (error.request) {
        errorMessage = tSafe('no_server_response', 'Cannot connect to server. Check your internet.');
      }
      
      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {tSafe('forgot_password', 'Forgot Password?')}
            </Text>
            <Text style={styles.subtitle}>
              {tSafe(
                'reset_instruction',
                "Enter your email address and we'll send you a link to reset your password."
              )}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              label={tSafe('email', 'Email')}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
              error={!!emailError}
              outlineColor="#E2E8F0"
              activeOutlineColor={COLORS.primary}
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {tSafe('send_reset_link', 'Send Reset Link')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.signin)}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>
                {tSafe('back_to_login', '← Back to Login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={3000}
          style={snackbar.isError ? styles.errorSnackbar : styles.successSnackbar}
          wrapperStyle={styles.snackbarWrapper}
        >
          {snackbar.message}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor || '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.black || '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: COLORS.red || '#EF4444',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
  },
  button: {
    backgroundColor: COLORS.primary || '#3B82F6',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary || '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  errorSnackbar: {
    backgroundColor: '#EF4444',
  },
  successSnackbar: {
    backgroundColor: '#10B981',
  },
  snackbarWrapper: {
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
};

export default ForgotPassword;