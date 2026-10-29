import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppText from './AppText';
import { useTheme } from '../theme';

const AppSection = ({
  title,
  subtitle,
  children,
  actionLabel,
  onAction,
  style,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {(title || actionLabel) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && (
              <AppText variant="title">
                {title}
              </AppText>
            )}

            {subtitle && (
              <AppText variant="caption">
                {subtitle}
              </AppText>
            )}
          </View>

          {actionLabel && onAction && (
            <TouchableOpacity
              onPress={onAction}
              activeOpacity={0.7}
              style={styles.action}
            >
              <AppText
                variant="label"
                color={theme.brand.primary}
              >
                {actionLabel}
              </AppText>

              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={
                  theme.brand.primary
                }
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {children}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 14,
    },

    titleContainer: {
      flex: 1,
      gap: 3,
    },

    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginLeft: 12,
    },
  });

export default AppSection;