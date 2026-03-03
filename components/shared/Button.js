import React from 'react';
import {TouchableOpacity, ActivityIndicator, Text, View} from 'react-native';
import COLORS from '../../constants/colors';

const Button = ({title, loading, size, onPress = () => {}}) => {



  return (
    <View>
    {loading && <ActivityIndicator style={{marginTop:5}} size="large" color={COLORS.primary} />}
    {!loading && <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        height: 45,
        width: size,
        backgroundColor: COLORS.primary,
        marginVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:30
      }}>
      <Text style={{color: COLORS.white, fontWeight: 'bold', fontSize: 18}}>
         {title}
      </Text>
    </TouchableOpacity>
    }

    </View>
  );
};

export default Button;


