import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const AppIconButton = ({
  icon,
  onPress,
  variant = 'default',
  size = 44,
  iconSize = 21,
  disabled = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = createStyles(
    theme,
    size
  );

  const isPrimary =
    variant === 'primary';

  const isGhost =
    variant === 'ghost';

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,

        isPrimary &&
          styles.primary,

        isGhost &&
          styles.ghost,

        disabled &&
          styles.disabled,

        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={iconSize}
        color={
          isPrimary
            ? theme.icon.inverse
            : theme.icon.default
        }
      />
    </TouchableOpacity>
  );
};

const createStyles = (
  theme,
  size
) =>
  StyleSheet.create({
    button: {
      width: size,
      height: size,
      borderRadius: size / 3,

      justifyContent: 'center',
      alignItems: 'center',

      backgroundColor:
        theme.surface.elevated,

      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    primary: {
      backgroundColor:
        theme.brand.primary,

      borderColor:
        theme.brand.primary,
    },

    ghost: {
      backgroundColor:
        'transparent',

      borderColor:
        'transparent',
    },

    disabled: {
      opacity: 0.45,
    },
  });

export default AppIconButton;