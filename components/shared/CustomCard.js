import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';

export default function CustomCard({
  children,
  style,
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card.background,
          borderColor: theme.card.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 20,
    padding: 10,
    minHeight: 90,
    borderRadius: 10,

    borderWidth: 1,

    elevation: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
