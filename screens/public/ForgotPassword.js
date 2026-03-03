import React, { useEffect, useContext } from 'react';
import { 
  SafeAreaView,
  StyleSheet, 
  ScrollView, 
  Keyboard,
  Text, 
  Alert,
  View, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Button from '../../components/Button';
import Input from '../../components/Input';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Loader from '../../components/Loader';
// import ButtonSpinner from 'react-native-button-spinner';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import userService from '../../services/userService';
import ROUTES from '../../constants/routes';
// import Toast from 'react-native-root-toast';



const ForgotPassword = ({navigation}) => {
  
  
  const [inputs, setInputs] = React.useState({
    email: '',
    // password: '',
    // verificationCode:''
  });
  
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const [visible, setVisible] = React.useState(false);


  
  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;

    if (!inputs.email) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter email</Text></Animatable.View>, 'email');
      isValid = false;
    } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
      handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter a valid email</Text></Animatable.View>, 'email');
      isValid = false;
    }

    // if (!inputs.password) {
    //   handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please input password</Text></Animatable.View>, 'password');
    //   isValid = false;
    // } else if (inputs.password.length < 5) {
    //   handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Min password length of 5</Text></Animatable.View>, 'password');
    //   isValid = false;
    // }

    // if (!inputs.verificationCode) {
    //     handleError(<Animatable.View animation="fadeInUpBig"><Text style={{color: COLORS.red}}>Please enter 6 digit code</Text></Animatable.View>, 'verificationCode');
    //     isValid = false;
    //   }

    if (isValid) {
      setLoading(!loading);
      handleRequestPasswordReset();
    }
  };

  const handleRequestPasswordReset = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        setLoading(false);
        AsyncStorage.setItem('userData', JSON.stringify(inputs));
        userService.requestPasswordReset(inputs)
        .then(response => {
          const status = response.data.status;
          const res = response.data.data;
          if(status === "success"){
            setVisible(true)
            setErrMsg("Verification code sent successfully")
            navigation.navigate('Signin');
          }else{
            setVisible(true)
            setErrMsg(<Text>Unable to  reset password, please try again</Text>)
          }

        }).catch(err=> {
          console.log(err)
        })
        
      } catch (error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }, 3000);
  };

  const handleOnchange = (text, input) => {
    setInputs(prevState => ({...prevState, [input]: text}));
  };
  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };

  


    return(
        <SafeAreaView
          style={{
            flex:1,
            justifyContent:'center',
            backgroundColor:COLORS.backgroundColor,
            alignItems:'center',
          }}
        >
          {/* <Loader visible={loading} /> */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{paddingTop: 120, paddingHorizontal: 0}}>
         
          <View style={styles.header}>
            <Text style={styles.text_header}>Reset password</Text>
          </View>

          {/* <Toast
            visible={visible}
            position={50}
            shadow={false}
            animation={true}
            backgroundColor={COLORS.darkBlue}
            textColor="#fff"
            hideOnPress={true}
          >
            {errMsg}
          </Toast> */}
          
          <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: COLORS.white
            }]}
        >
          <View style={{marginVertical: 0}}>
            <Input
              autoCap="none"
              onChangeText={text => handleOnchange(text, 'email')}
              onFocus={() => handleError(null, 'email')}
              iconName="email-outline"
              label="Email"
              placeholder="Enter your email address"
              error={errors.email}
            />
            
            {/* <Input
              autoCap="none"
              onChangeText={text => handleOnchange(text, 'password')}
              onFocus={() => handleError(null, 'password')}
              iconName="lock-outline"
              label="Password"
              placeholder="Enter your password"
              error={errors.password}
              password
            />
            <Input
              keyboardType = 'numeric'
              onChangeText={text => handleOnchange(text, 'verificationCode')}
              onFocus={() => handleError(null, 'verificationCode')}
              iconName="account-outline"
              label="Verification Code"
              placeholder="Enter verification code"
              error={errors.verificationCode}
              verificationCode
              email = {inputs.email}
            /> */}
            <Button title="Reset Password" loading={loading} onPress={validate} />
            {/* <ButtonSpinner
                onPress={sendRequest}
              >
                <Text>Position Left</Text>
              </ButtonSpinner> */}
            <Text
              onPress={() => navigation.navigate(ROUTES.signin)}
              style={{
                color: COLORS.black,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 16,
              }}>
              Back to Login
            </Text>
          </View>
          </Animatable.View>
        </ScrollView>

        </SafeAreaView>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#DDDDDD',
      justifyContent:'space-between',
      padding:10,
      borderRadius:5,
      width:"90%",
      marginBottom:50
    },
    header: {
      flex: 0,
      justifyContent: 'center',
      paddingTop: 50,
      paddingBottom: 20
    },
    footer: {
        flex: 5, //Platform.OS === 'ios' ? 3 : 5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
      color: COLORS.black,
      textAlign:'center',
      fontWeight: 'bold',
      fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
  });