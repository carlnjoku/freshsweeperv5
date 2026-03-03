import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const EmptyApartmentPlaceholder = ({ onAddApartment }) => {
  return (
    <View style={styles.container}>
      <AntDesign name="home" size={60} color={COLORS.gray}/>
      <Text style={styles.title}>No Properties Added Yet</Text>
      <Text style={styles.subtitle}>
        Start managing your properties effortlessly! Add your first apartment
        to begin creating cleaning schedules and keeping your space guest-ready.
        It's quick and easy—let's get started!
      </Text>
      <TouchableOpacity style={styles.button} onPress={onAddApartment}>
        <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Apartment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default EmptyApartmentPlaceholder;