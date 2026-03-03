import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentComplete = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Payment Complete</Text>
      <Text style={styles.subtitle}>Thank you for your purchase!</Text>
    </View>
  );
};

export default PaymentComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});