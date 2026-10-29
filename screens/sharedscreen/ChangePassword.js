import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme';

const ChangePassword = () => {
  const { theme } = useTheme();
  const { currentUserId } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const styles = createStyles(theme);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        'Error',
        'All fields are required.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Error',
        'New password and confirmation do not match.'
      );
      return;
    }

    try {
      const data = {
        new_password: newPassword,
        current_password: currentPassword,
        userId: currentUserId,
      };

      console.log(data);

      const response = await userService.changePassword(data);

      console.log('Password changed successfully', response);

      Alert.alert(
        'Success',
        'Your password has been changed.'
      );

      // Clear password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);

      Alert.alert(
        'Something Went Wrong',
        'Please try again.'
      );
    }
  };

  const passwordIcon = showPassword ? 'eye-off' : 'eye';

  return (
    <View style={styles.container}>

      {/* Current Password */}
      <TextInput
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        mode="outlined"
        style={styles.input}
        theme={{
          roundness: 16,
          colors: {
            primary: theme.input.focus,
            outline: theme.input.border,
            background: theme.input.background,
            text: theme.input.text,
            placeholder: theme.input.placeholder,
          },
        }}
        textColor={theme.input.text}
        outlineColor={theme.input.border}
        activeOutlineColor={theme.input.focus}
        placeholderTextColor={theme.input.placeholder}
        right={
          <TextInput.Icon
            icon={passwordIcon}
            color={theme.icon.muted}
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
        autoCapitalize="none"
        autoCorrect={false}
        mode="outlined"
        style={styles.input}
        theme={{
          roundness: 16,
          colors: {
            primary: theme.input.focus,
            outline: theme.input.border,
            background: theme.input.background,
            text: theme.input.text,
            placeholder: theme.input.placeholder,
          },
        }}
        textColor={theme.input.text}
        outlineColor={theme.input.border}
        activeOutlineColor={theme.input.focus}
        placeholderTextColor={theme.input.placeholder}
        right={
          <TextInput.Icon
            icon={passwordIcon}
            color={theme.icon.muted}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {/* Confirm Password */}
      <TextInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        mode="outlined"
        style={styles.input}
        theme={{
          roundness: 16,
          colors: {
            primary: theme.input.focus,
            outline: theme.input.border,
            background: theme.input.background,
            text: theme.input.text,
            placeholder: theme.input.placeholder,
          },
        }}
        textColor={theme.input.text}
        outlineColor={theme.input.border}
        activeOutlineColor={theme.input.focus}
        placeholderTextColor={theme.input.placeholder}
        right={
          <TextInput.Icon
            icon={passwordIcon}
            color={theme.icon.muted}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {/* Validation Helper */}
      <HelperText
        type="error"
        visible={
          newPassword !== confirmPassword &&
          confirmPassword.length > 0
        }
        style={styles.helperText}
      >
        New password and confirmation do not match
      </HelperText>

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleChangePassword}
        style={styles.button}
        buttonColor={theme.button.primaryBackground}
        textColor={theme.button.primaryText}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Update Password
      </Button>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background.default,
    },

    input: {
      width: '100%',
      marginVertical: 8,
      backgroundColor: theme.input.background,
    },

    helperText: {
      color: theme.status.error,
      marginTop: 2,
    },

    button: {
      marginTop: 20,
      borderRadius: 12,
    },

    buttonContent: {
      minHeight: 48,
    },

    buttonLabel: {
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default ChangePassword;