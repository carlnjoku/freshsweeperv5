import React from 'react';

import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const CircleIconButton = ({ iconName, onPress, buttonSize, iconSize, title }) => {
  return (
    <View>
        <TouchableOpacity style={styles.button} onPress={onPress}>
        <MaterialCommunityIcons name={iconName} size={iconSize} color={COLORS.primary} />
        </TouchableOpacity>
        {title ? <Text>{title}</Text> : "" }
    </View>
  );
};
// const bsize = buttonSize
const styles = StyleSheet.create({
    container:{
        flexDirection:'column',
        alignItems:'center'
    },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20/2, // Half of the width and height to create a circle
    // borderColor: COLORS.primary_light,
    // borderWidth:1.5,
    backgroundColor: COLORS.primary_light_1, // Background color of the button
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircleIconButton;
