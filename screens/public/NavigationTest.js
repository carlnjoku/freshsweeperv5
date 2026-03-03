// screens/auth/NavigationTest.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';

const NavigationTest = () => {
  // const route = useRoute();
  // const navigation = useNavigation();

  // console.log('✅ NavigationTest rendered with params:', route.params);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Test Screen</Text>
      {/* <Text style={styles.text}>Email: {route.params?.email || 'No email'}</Text> */}
      <Button 
        title="Go Back to Signin" 
        // onPress={() => navigation.goBack()} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default NavigationTest;