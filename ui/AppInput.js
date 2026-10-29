import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const AppInput = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  disabled = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const styles = createStyles(theme);

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={
              focused
                ? theme.input.focus
                : theme.icon.muted
            }
            style={styles.leftIcon}
          />
        )}

        <TextInput
          {...props}
          editable={!disabled}
          placeholderTextColor={
            theme.input.placeholder
          }
          selectionColor={
            theme.input.focus
          }
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[
            styles.input,
            inputStyle,
          ]}
        />

        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon}
            size={20}
            color={theme.icon.muted}
            style={styles.rightIcon}
            onPress={
              onRightIconPress
            }
          />
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 7,
    },

    inputContainer: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor:
        theme.input.background,

      borderWidth: 1,
      borderColor:
        theme.input.border,

      borderRadius: 14,

      paddingHorizontal: 14,
    },

    inputFocused: {
      borderColor:
        theme.input.focus,
    },

    inputError: {
      borderColor:
        theme.status.error,
    },

    inputDisabled: {
      opacity: 0.55,
    },

    input: {
      flex: 1,

      minHeight: 48,

      paddingVertical: 10,
      paddingHorizontal: 0,

      fontSize: 15,

      color:
        theme.input.text,
    },

    leftIcon: {
      marginRight: 10,
    },

    rightIcon: {
      marginLeft: 10,
    },

    errorText: {
      marginTop: 5,
      fontSize: 12,
      color:
        theme.status.error,
    },

    helperText: {
      marginTop: 5,
      fontSize: 12,
      color:
        theme.text.muted,
    },
  });

export default AppInput;