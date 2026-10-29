import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../../theme';

const CustomCheckbox = ({
  checked = false,
  onPress,
  label,
  color,
  uncheckedColor,
  textColor,
  checkboxSize = 24,
  fontSize = 14,
  disabled = false,
  style,
  labelStyle,
  accessibilityLabel,
}) => {
  const { theme, isDark } = useTheme();

  // Use theme colors by default, while allowing explicit overrides.
  const primaryColor = color || theme.brand.primary;

  const borderColor =
    uncheckedColor || theme.border.default || theme.divider;

  const labelColor = textColor || theme.text.primary;

  const checkboxBackground = checked
    ? primaryColor
    : theme.surface.default;

  const styles = createStyles(theme, isDark);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabledContainer,
        style,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked,
        disabled,
      }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: checkboxSize,
            height: checkboxSize,
            borderColor: checked ? primaryColor : borderColor,
            backgroundColor: checkboxBackground,
            borderRadius: Math.max(3, checkboxSize * 0.14),
          },
          disabled && styles.disabledCheckbox,
        ]}
      >
        {checked && (
          <Text
            style={[
              styles.checkmark,
              {
                fontSize: checkboxSize * 0.7,
                lineHeight: checkboxSize * 0.85,
              },
            ]}
          >
            ✓
          </Text>
        )}
      </View>

      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: labelColor,
              fontSize,
            },
            disabled && styles.disabledLabel,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      minHeight: 44,
      paddingVertical: 6,
    },

    checkbox: {
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },

    checkmark: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      includeFontPadding: false,
    },

    label: {
      flex: 1,
      flexShrink: 1,
      lineHeight: 21,
    },

    disabledContainer: {
      opacity: 0.65,
    },

    disabledCheckbox: {
      opacity: 0.7,
    },

    disabledLabel: {
      color: theme.text.muted,
    },
  });

export default CustomCheckbox;