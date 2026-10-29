import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';

const AppText = ({
  children,
  variant = 'body',
  color,
  align,
  weight,
  numberOfLines,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <Text
      {...props}
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        styles[variant] || styles.body,
        color ? { color } : null,
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    base: {
      color: theme.text.primary,
      includeFontPadding: false,
    },

    display: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: '800',
      letterSpacing: -0.8,
    },

    heading: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      letterSpacing: -0.5,
    },

    title: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
      letterSpacing: -0.3,
    },

    subtitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
    },

    body: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '400',
    },

    bodyMedium: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '500',
    },

    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },

    caption: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '400',
      color: theme.text.secondary,
    },

    muted: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      color: theme.text.muted,
    },
  });

export default AppText;