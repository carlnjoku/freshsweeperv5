import React from 'react';
import { SafeAreaView, StyleSheet, View, FlatList,Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // or any other icon lib
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';

export const EmptyListingNoButton = ({message, size, iconName}) => (
    <View style={styles.container}>
      {/* Empty Envelope Icon */}
      <MaterialCommunityIcons 
        name={iconName} // MaterialCommunityIcon for an empty envelope
        size={size}
        color="#ccc"
        style={styles.icon}
      />
      
      {/* Placeholder Message */}
      <Text style={styles.message}>
        {message}
      </Text>
    </View>
    // <View style={styles.empty_listing}><Text>You have nothing here</Text></View>
  )


  const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    icon: {
        marginBottom: 12,
        alignItems:'center'
      },
      message: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 17,
      },
  })