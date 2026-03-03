import React from 'react';
import { StyleSheet, View } from 'react-native';
import COLORS from '../../constants/colors';

export default function CustomCard({children}) {
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
        marginTop:5,
        marginBottom:20,
        padding:10,
        minHeight:90,
        borderRadius:10,
        backgroundColor:COLORS.white,
        elevation:5,
        shadowColor: "#ccc",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2},
      },
})

