// import React, { useEffect, useRef } from 'react';
// import { View, Image, Animated, Easing, StyleSheet } from 'react-native';

// const CustomActivityIndicator = ({ size = 80, logo }) => {
//   const spinValue = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(spinValue, {
//         toValue: 1,
//         duration: 1000, // Rotation duration
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, [spinValue]);

//   const rotate = spinValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <View style={styles.container}>
//       <Animated.View style={[styles.spinner, { width: size, height: size, transform: [{ rotate }] }]}>
//         <Image source={require('../assets/spinner.png')} style={[styles.spinnerImage, { width: size, height: size }]} />
//       </Animated.View>
//       <Image source={logo} style={[styles.logo, { width: size / 2, height: size / 2 }]} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   spinner: {
//     position: 'absolute',
//   },
//   spinnerImage: {
//     resizeMode: 'contain',
//   },
//   logo: {
//     position: 'absolute',
//     resizeMode: 'contain',
//   },
// });

// export default CustomActivityIndicator;



import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Image, StyleSheet } from 'react-native';

const CustomActivityIndicator = ({ size = 80, logo }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeInValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fade-in animation for logo
    Animated.timing(fadeInValue, {
      toValue: 1,
      duration: 800, // Adjust fade-in speed
      useNativeDriver: true,
    }).start();
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Spinner Animation */}
      <Animated.View style={[styles.spinner,  {width: size, height: size, transform: [{ rotate }] }]}>
        {/* <Image source={require('../../../assets/images/refresh.png')} style={styles.spinnerImage} /> */}
      </Animated.View>

      {/* Logo with Fade-In Effect */}
      <Animated.Image source={logo} 
        style={[styles.logo, { opacity: fadeInValue }, { width: size / 2, height: size / 2 }]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  spinner: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  spinnerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default CustomActivityIndicator;