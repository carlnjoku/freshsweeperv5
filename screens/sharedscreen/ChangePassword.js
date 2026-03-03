import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import userService from '../../services/connection/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';

const ChangePassword = () => {

  const {currentUserId} = useContext(AuthContext)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user_token, setUserToken] = useState("");

  const fetchToken = async() => {
    const jsonValue = await AsyncStorage.getItem('@storage_Key');
    if (jsonValue) {
        const object = JSON.parse(jsonValue);
        setUserToken(object.resp.token);
    }
  }

  useEffect(()=> {
    fetchToken()
  },[])
  
          
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    try{
    const data = {
        new_password:newPassword,
        current_password:currentPassword,
        userId:currentUserId
    }
    console.log(data)
    userService.changePassword(data)
    .then(response => {
        const res = response.message
        console.log('Password changed successfully');
        Alert.alert('Success', 'Your password has been changed.');
    })
    // Handle password change logic here
    }catch{
        Alert.alert('Something Went Wrong', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Current Password */}
      <TextInput
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={!showPassword}
        autoCapitalize = "none"
        mode="outlined"
        style={styles.input}
        activeOutlineColor={COLORS.primary}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {/* New Password */}
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showPassword}
        autoCapitalize = "none"
        mode="outlined"
        activeOutlineColor={COLORS.primary}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={styles.input}
      />

      {/* Confirm Password */}
      <TextInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize = "none"
        mode="outlined"
        activeOutlineColor={COLORS.primary}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={styles.input}
      />

      {/* Validation Helper */}
      <HelperText type="error" visible={newPassword !== confirmPassword && confirmPassword.length > 0}>
        New password and confirmation do not match
      </HelperText>

      {/* Submit Button */}
      <Button mode="contained" onPress={handleChangePassword} style={styles.button}>
        Update Password
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
  },
  input: {
    width: "100%",
    marginVertical: 8,
    color:COLORS.gray, 
    fontSize:16, 
    backgroundColor:"#fff"
  },
});

export default ChangePassword;