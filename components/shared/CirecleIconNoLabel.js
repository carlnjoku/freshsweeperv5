import React from 'react';
// import Text from './Text';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const CircleIconNoLabel = ({ iconName, onPress, buttonSize, type, radiusSise, iconSize, title, title_color }) => {


  const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        alignItems:'center'
    },
    button: {
      height: buttonSize,
      width: buttonSize,
      borderRadius: radiusSise, // Half of the width and height to create a circle
      // borderColor: COLORS.primary_light,
      // borderWidth:1.5,
      backgroundColor: COLORS.white, 
      borderWidth:0.5,
      borderColor:COLORS.light_gray,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft:10,
      
    }
});
  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <MaterialCommunityIcons name={iconName} size={iconSize} color={COLORS.gray} />
        </TouchableOpacity>
        
    </View>
  );
};
// const bsize = buttonSize


export default CircleIconNoLabel;
