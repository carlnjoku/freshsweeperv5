import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../theme';

const AppCard = ({
  children,
  variant = 'default',
  padding = 'medium',
  radius = 'medium',
  bordered = true,
  elevated = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View
      {...props}
      style={[
        styles.base,

        fullWidth && styles.fullWidth,

        styles[variant] ||
          styles.default,

        styles[`padding_${padding}`] ||
          styles.padding_medium,

        styles[`radius_${radius}`] ||
          styles.radius_medium,

        bordered &&
          styles.bordered,

        elevated &&
          styles.elevated,

        style,
      ]}
    >
      {children}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    base: {},

    fullWidth: {
      width: '100%',
    },

    /* -------------------------------- default -------------------------------- */

    default: {
      backgroundColor:
        theme.card.background,
    },

    /* -------------------------------- hero ----------------------------------- */

    hero: {
        backgroundColor:
          theme.hero.background,
      
        borderWidth: 0,
        overflow: 'hidden',
      },

    /* ------------------------------- elevated -------------------------------- */

    elevated: {
      backgroundColor:
        theme.surface.elevated,

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        theme.shadow?.opacity ||
        0.08,

      shadowRadius: 12,

      elevation: 3,
    },

    /* -------------------------------- border --------------------------------- */

    bordered: {
      borderWidth: 1,

      borderColor:
        theme.card.border,
    },

    /* -------------------------------- padding -------------------------------- */

    padding_none: {
      padding: 0,
    },

    padding_small: {
      padding: 12,
    },

    padding_medium: {
      padding: 16,
    },

    padding_large: {
      padding: 20,
    },

    padding_xlarge: {
      padding: 24,
    },

    /* -------------------------------- radius --------------------------------- */

    radius_small: {
      borderRadius: 12,
    },

    radius_medium: {
      borderRadius: 18,
    },

    radius_large: {
      borderRadius: 24,
    },

    radius_pill: {
      borderRadius: 999,
    },
  });

export default AppCard;