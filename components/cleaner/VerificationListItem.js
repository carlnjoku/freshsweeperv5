// components/cleaner/VerificationListItem.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const VerificationListItem = ({
  icon,
  label,
  description,
  isEnabled,
  isCompleted,
  onPress,
  status,
}) => {
  const { theme } = useTheme();

  const isComplete =
    isCompleted || status === 'complete';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isComplete
            ? theme.surface.selected
            : theme.card.background,

          borderColor: isComplete
            ? theme.brand.primary
            : theme.card.border,
        },
        !isEnabled && styles.disabled,
      ]}
      onPress={isEnabled ? onPress : undefined}
      disabled={!isEnabled}
      activeOpacity={isEnabled ? 0.75 : 1}
      accessibilityRole="button"
      accessibilityState={{
        disabled: !isEnabled,
      }}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isComplete
              ? theme.surface.selected
              : theme.background.sunken,

            borderColor: isComplete
              ? theme.border.focus
              : theme.border.default,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={23}
          color={
            isComplete
              ? theme.icon.active
              : isEnabled
                ? theme.icon.default
                : theme.icon.muted
          }
        />
      </View>

      {/* Content */}
      <View style={styles.textContainer}>
        <AppText
          variant="subtitle"
          style={[
            styles.label,
            {
              color: isComplete
                ? theme.brand.primary
                : isEnabled
                  ? theme.text.primary
                  : theme.text.disabled,
            },
          ]}
        >
          {label}
        </AppText>

        <AppText
          variant="caption"
          style={[
            styles.description,
            {
              color: isEnabled
                ? theme.text.secondary
                : theme.text.disabled,
            },
          ]}
        >
          {description}
        </AppText>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        {isComplete && (
          <View
            style={[
              styles.statusIconContainer,
              {
                backgroundColor:
                  theme.status.success,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check"
              size={15}
              color={theme.icon.inverse}
            />
          </View>
        )}

        {!isComplete && isEnabled && (
          <View
            style={[
              styles.statusIconContainer,
              {
                backgroundColor:
                  theme.surface.selected,
                borderColor:
                  theme.border.default,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.icon.default}
            />
          </View>
        )}

        {!isComplete && !isEnabled && (
          <View
            style={[
              styles.statusIconContainer,
              {
                backgroundColor:
                  theme.background.sunken,
                borderColor:
                  theme.border.default,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="lock"
              size={18}
              color={theme.icon.muted}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 82,
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  disabled: {
    opacity: 0.65,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
  },

  textContainer: {
    flex: 1,
    paddingRight: 8,
  },

  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  description: {
    fontSize: 12.5,
    lineHeight: 18,
  },

  statusContainer: {
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default VerificationListItem;