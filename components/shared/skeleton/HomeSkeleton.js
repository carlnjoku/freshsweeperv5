import React, { useEffect, useRef } from "react";

import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";


export const HomeSkeleton = ({width, height, variant}) => {
    const opacity = useRef(new Animated.Value(0.3))

    let borderRadius;

    if(variant === 'circle'){
        borderRadius = typeof height==='string' ? parseInt(height, 10)/2 : height / 2
    }


    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity.current, {
                    toValue:1,
                    useNativeDriver:true,
                    duration:500
                }),
                Animated.timing(opacity.current, {
                    toValue:0.3,
                    useNativeDriver:true,
                    duration:800
                }),
            ])).start()
    },[opacity])

    return(
        <Animated.View style={[{opacity:opacity.current, width, height, borderRadius}, styles.skeleton]} />
    )

}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor:'#e4e4e4',
        margin:2

    }
})


