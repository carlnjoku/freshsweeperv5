import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe'; // added import

const NoScheduleMessage = ({ onUpdateProfile }) => {
  return (
    <View style={styles.container}>
      {/* Icon or Illustration */}
      <MaterialCommunityIcons name="calendar-blank" size={44} color={COLORS.light_gray} />
      {/* Title */}
      <Text style={styles.title}>
        {tSafe('no_schedule_requests_title', 'No Schedule Requests Yet')}
      </Text>
      {/* Description */}
      <Text style={styles.description}>
        {tSafe('no_schedule_requests_description', 'It looks like you don’t have any schedule requests at the moment. Don\'t worry—here’s what you can do:')}
      </Text>
      {/* Tips */}
      <View style={styles.tip_containter}>
        <Text style={styles.tip}>
          {tSafe('tip_update_profile', 'Update your profile to showcase your experience.')}
        </Text>
        <Text style={styles.tip}>
          {tSafe('tip_turn_on_notifications', 'Turn on notifications to catch new requests.')}
        </Text>
        <Text style={styles.tip}>
          {tSafe('tip_expand_service_area', 'Expand your service area for more visibility.')}
        </Text>
        <Text style={styles.tip}>
          {tSafe('tip_deliver_great_service', 'Deliver great service to maintain high ratings.')}
        </Text>
      </View>
      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={onUpdateProfile}>
        <Text style={styles.buttonText}>
          {tSafe('update_profile_button', 'Update Profile')}
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button} onPress={onExploreTips}>
        <Text style={styles.buttonText}>Explore Tips</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={onContactSupport}>
        <Text style={styles.buttonSecondaryText}>Contact Support</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor: '#f9f9f9',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  tip_containter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tip: {
    fontSize: 13,
    color: COLORS.light_gray,
    textAlign: 'left',
    marginBottom: 5,
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.deepBlue,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonSecondaryText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NoScheduleMessage;