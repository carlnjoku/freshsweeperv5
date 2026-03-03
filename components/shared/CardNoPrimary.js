import React from 'react';
import { SafeAreaView,StyleSheet, Image, ImageBackground, Text, View, TouchableOpacity } from 'react-native';
import COLORS from '../../constants/colors';

export default function CardNoPrimary({children}) {
  return (
    <View style={styles.card}>

        {children}
        
    </View>
  )
}


const styles = StyleSheet.create({
    card: {
        width:'100%',
        alignSelf:'center',
        marginTop:15,
        padding:10,
        margin:10,
        minHeight:90,
        borderRadius:10,
        backgroundColor:COLORS.white,
        elevation:3,
        shadowColor: COLORS.gray,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2},
      },
})

