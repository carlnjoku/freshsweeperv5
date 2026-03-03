import React from 'react';
import { SafeAreaView,StyleSheet, Image, ImageBackground, Text, View, TouchableOpacity } from 'react-native';
import COLORS from '../../constants/colors';

export default function CardColored({color,children}) {
  return (
    <View style={styles.card}>
        {children}
    </View>
  )
}


const styles = StyleSheet.create({
    card: {
        width:'95%',
        alignSelf:'center',
        marginTop:10,
        padding:10,
        minHeight:90,
        borderRadius:10,
        backgroundColor:COLORS.primary,
        elevation:1,
        shadowColor: 'black',
        shadowOpacity: 0.8,
        shadowOffset: { width: 0, height: 2},
      },
})

