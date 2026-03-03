import React, {useEffect} from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
// import COLORS from '../../constants/colors';
import COLORS from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import userService from '../../services/connection/userService';

import * as Animatable from 'react-native-animatable';


 const Input = ({
     label, 
     iconName, 
     error, 
     password, 
     verificationCode,
     autoCap,
     email,
     onFocus = ()=>{} ,
     ...props
  }) => {

  const [hidePassword, setHidePassword] = React.useState(password);
  const [isFocused, setIsFocused] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState(false);
  
  useEffect(()=>{
      setTimeout(() => setVisible(true), 2000); // show toast after 2s
      setTimeout(() => setVisible(false), 5000); // show toast after 2s

  },[])

  // const showToast = (msg) => {
  //   ToastAndroid.show(msg , ToastAndroid.LONG);
  // }
  const sendVerificationCode = () => {
    
    if (!email) {
      
      setVisible(true)
      setErrMsg("Please enter your email!")
     
    }else{
      console.log(email)
      userService.sendVerifyCode(email)
      .then(response => {
        const status = response.data.status;
        const res = response.data.data;
        if(status === "success"){
          setVisible(true)
          setErrMsg("Verification code sent successfully")
        }else{
          setVisible(true)
          setErrMsg("The email you entered does not exist")
          
        }

      }).catch(err=> {
        console.log(err)
        showToast("The email you entered does not exist2")
        console.log("The email you entered does not exist1")
      })
    }
  }
  return (
    <View style={{marginBottom:10, width:300}}>
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
        <Text style={styles.labels}>
            {label}
        </Text>
        <View
            style={[
                styles.inputContainer,
                {
                    borderColor: error
                    ? COLORS.red
                    : isFocused
                    ? COLORS.primary
                    : COLORS.light,
                    alignItems: 'center',
                },
                ]}
        >
        <Icon
          name={iconName}
          style={{color: COLORS.primary, fontSize: 22, marginRight: 10}}
        />
        <TextInput
          autoCorrect={false}
          onFocus={() => {
            onFocus();
            setIsFocused(true);
          }}
          autoCapitalize = {autoCap}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={hidePassword}
          style={{color: COLORS.dark, flex: 1}}
          {...props}
        />
        {password && (
          <Icon
            onPress={() => setHidePassword(!hidePassword)}
            name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
            style={{color: COLORS.primary, fontSize: 22}}
          />
        )}

        {verificationCode && (
          <Text 
            style={{color: COLORS.primary, fontSize: 12}}
            onPress={() => sendVerificationCode()}
          >
            Send Code
          </Text>
          
        )}
        </View>
        {error && (
        <Text style={{marginTop: 7, color: COLORS.red, fontSize: 12}}>
          {error}
        </Text>
      )}
    </View>
  )
}

export default Input


const styles = StyleSheet.create({
    labels: {
        fontSize:14,
        color: COLORS.gray,
        marginVertical:5
    },
    inputContainer: {
        height: 45,
        backgroundColor: COLORS.backgroundColor,
        flexDirection: 'row',
        paddingHorizontal: 15,
        borderWidth: 0.5,
        borderRadius:5
      },
})
