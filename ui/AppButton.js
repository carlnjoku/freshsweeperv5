import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;

      case 'outline':
        return styles.outline;

      case 'ghost':
        return styles.ghost;

      case 'danger':
        return styles.danger;

      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;

      case 'outline':
        return styles.outlineText;

      case 'ghost':
        return styles.ghostText;

      case 'danger':
        return styles.dangerText;

      default:
        return styles.primaryText;
    }
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return theme.brand.primary;

      default:
        return theme.button.primaryText;
    }
  };

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        getButtonStyle(),
        styles[`size_${size}`] || styles.size_medium,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getSpinnerColor()}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={
                getTextStyle().color
              }
            />
          )}

          <Text
            style={[
              styles.baseText,
              getTextStyle(),
              textStyle,
            ]}
          >
            {title}
          </Text>

          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={
                getTextStyle().color
              }
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
    },

    size_small: {
      minHeight: 40,
      paddingHorizontal: 14,
    },

    size_medium: {
      minHeight: 48,
      paddingHorizontal: 18,
    },

    size_large: {
      minHeight: 56,
      paddingHorizontal: 22,
    },

    fullWidth: {
      width: '100%',
    },

    primary: {
      backgroundColor:
        theme.button.primaryBackground,
    },

    primaryText: {
      color:
        theme.button.primaryText,
    },

    secondary: {
      backgroundColor:
        theme.button.secondaryBackground,
    },

    secondaryText: {
      color:
        theme.button.secondaryText,
    },

    outline: {
      backgroundColor:
        'transparent',
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    outlineText: {
      color:
        theme.brand.primary,
    },

    ghost: {
      backgroundColor:
        'transparent',
    },

    ghostText: {
      color:
        theme.brand.primary,
    },

    danger: {
      backgroundColor:
        theme.status.error,
    },

    dangerText: {
      color:
        theme.text.inverse,
    },

    disabled: {
      backgroundColor:
        theme.button.disabledBackground,
      borderColor:
        theme.button.disabledBackground,
      opacity: 0.7,
    },

    baseText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });

export default AppButton;