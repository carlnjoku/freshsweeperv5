import React from 'react';
import { StyleSheet, View,Text} from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; // or any other icon lib
import COLORS from '../../constants/colors';

export const EmptyPlaceholder = ({message, size=16, icon}) => (
    
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={size} color={COLORS.gray} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )


  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    message: {
      marginTop: 12,
      fontSize: 14,
      color: COLORS.gray,
      textAlign: 'center',
    },
  });