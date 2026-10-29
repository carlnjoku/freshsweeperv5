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


import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Keyboard,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { TextInput, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const styles = createStyles(theme);
  const redirectTimeout = useRef(null);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    isError: false,
  });

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const showMessage = (message, isError = false) => {
    setSnackbar({
      visible: true,
      message,
      isError,
    });
  };

  const hideSnackbar = () => {
    setSnackbar((previous) => ({
      ...previous,
      visible: false,
    }));
  };

  const validateEmail = (value) => {
    const normalizedEmail = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setEmailError(
        tSafe('email_required', 'Email is required')
      );
      return false;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError(
        tSafe(
          'email_invalid',
          'Please enter a valid email address'
        )
      );
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleEmailChange = (value) => {
    setEmail(value);

    if (emailError) {
      validateEmail(value);
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;

    Keyboard.dismiss();

    const normalizedEmail = email.trim();

    if (!validateEmail(normalizedEmail)) {
      return;
    }

    setLoading(true);

    try {
      const response = await userService.forgotPassword({
        email: "skoodee2022@gmail.com",
        // email: normalizedEmail,
      });

      const message =
        response?.data?.message ||
        tSafe(
          'reset_sent',
          'If an account exists for this email, password reset instructions will be sent.'
        );

      showMessage(message, false);

      redirectTimeout.current = setTimeout(() => {
        navigation.navigate(ROUTES.signin);
      }, 2000);
    } catch (error) {
      console.error(
        'Password reset error:',
        error?.response?.status || error?.message
      );

      let errorMessage = tSafe(
        'network_error',
        'Network error. Please try again.'
      );

      if (error?.response) {
        const status = error.response.status;
        const detail =
          error.response.data?.detail ||
          error.response.data?.message;

        if (status === 404) {
          errorMessage = tSafe(
            'email_not_found',
            'Unable to process this request. Please check your email address and try again.'
          );
        } else if (status >= 500) {
          errorMessage = tSafe(
            'server_error',
            'Server error. Please try again later.'
          );
        } else if (detail) {
          errorMessage = detail;
        } else {
          errorMessage = tSafe(
            'reset_failed',
            'Unable to send password reset instructions. Please try again.'
          );
        }
      } else if (error?.request) {
        errorMessage = tSafe(
          'no_server_response',
          'Cannot connect to the server. Please check your internet connection.'
        );
      }

      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

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
            <View style={styles.iconContainer}>
              <TextInput.Icon
                icon="lock-reset"
                size={42}
                color={theme.brand.primary}
              />
            </View>

            <AppText style={styles.title}>
              {tSafe('forgot_password', 'Forgot Password?')}
            </AppText>

            <AppText style={styles.subtitle}>
              {tSafe(
                'reset_instruction',
                "Enter your email address and we'll send you instructions to reset your password."
              )}
            </AppText>
          </View>

          <View style={styles.form}>
            <AppText style={styles.formTitle}>
              {tSafe('reset_password', 'Reset Password')}
            </AppText>

            <AppText style={styles.formDescription}>
              {tSafe(
                'reset_email_description',
                'Enter the email address associated with your account.'
              )}
            </AppText>

            <TextInput
              mode="outlined"
              label={tSafe('email', 'Email')}
              placeholder={tSafe(
                'enter_email',
                'Enter your email address'
              )}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={handleResetPassword}
              error={!!emailError}
              disabled={loading}
              outlineColor={theme.input.border}
              activeOutlineColor={theme.brand.primary}
              textColor={theme.text.primary}
              placeholderTextColor={theme.input.placeholder}
              style={styles.input}
              left={
                <TextInput.Icon
                  icon="email-outline"
                  color={
                    emailError
                      ? theme.status.error
                      : theme.icon.default
                  }
                />
              }
              theme={{
                colors: {
                  background: theme.input.background,
                  surface: theme.input.background,
                  onSurface: theme.text.primary,
                  onSurfaceVariant: theme.text.secondary,
                  error: theme.status.error,
                  primary: theme.brand.primary,
                  outline: theme.input.border,
                },
              }}
            />

            {emailError ? (
              <AppText style={styles.errorText}>
                {emailError}
              </AppText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={tSafe(
                'send_reset_link',
                'Send Reset Link'
              )}
            >
              {loading ? (
                <ActivityIndicator
                  color={theme.button.primaryText}
                />
              ) : (
                <AppText style={styles.buttonText}>
                  {tSafe('send_reset_link', 'Send Reset Link')}
                </AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.signin)}
              style={styles.linkContainer}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <AppText style={styles.linkText}>
                {tSafe('back_to_login', '← Back to Login')}
              </AppText>
            </TouchableOpacity>
          </View>

          <AppText style={styles.footerText}>
            {tSafe(
              'password_reset_footer',
              'Keep your account secure by using a strong, unique password.'
            )}
          </AppText>
        </ScrollView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={3500}
          style={
            snackbar.isError
              ? styles.errorSnackbar
              : styles.successSnackbar
          }
          wrapperStyle={styles.snackbarWrapper}
          theme={{
            colors: {
              inverseSurface: snackbar.isError
                ? theme.status.error
                : theme.status.success,
              inverseOnSurface: '#FFFFFF',
            },
          }}
        >
          <AppText style={styles.snackbarText}>
            {snackbar.message}
          </AppText>
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.default,
  },

  container: {
    flex: 1,
    backgroundColor: theme.background.default,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 12,

  },

  subtitle: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 4,
  },

  form: {
    backgroundColor: theme.card.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.card.border,
    shadowColor: theme.shadow?.color || '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: theme.shadow?.opacity ?? 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  formTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 8,
  },

  formDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 21,
    marginBottom: 22,
  },

  input: {
    marginBottom: 8,
    backgroundColor: theme.input.background,
  },

  errorText: {
    color: theme.status.error,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 8,
  },

  button: {
    backgroundColor: theme.button.primaryBackground,
    borderRadius: 25,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: theme.button.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },

  linkContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  linkText: {
    color: theme.brand.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  footerText: {
    color: theme.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },

  errorSnackbar: {
    backgroundColor: theme.status.error,
  },

  successSnackbar: {
    backgroundColor: theme.status.success,
  },

  snackbarWrapper: {
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },

  snackbarText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default ForgotPassword;