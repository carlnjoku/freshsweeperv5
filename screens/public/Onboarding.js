


import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  useWindowDimensions, // <-- added
} from 'react-native';
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

const slides = [
  {
    image: require('../../assets/images/onboarding1.jpg'),
    title: 'Welcome to FreshSweeper',
    subtitle: 'Clean, simple, and reliable Airbnb cleaning',
  },
  {
    image: require('../../assets/images/onboarding2.png'),
    title: 'Trusted Cleaners',
    subtitle: 'Only verified cleaners work on your listings',
  },
  {
    image: require('../../assets/images/onboarding3.jpg'),
    title: 'Track Your Schedule',
    subtitle: 'Stay updated with live cleaner status and schedules',
  },
  {
    image: require('../../assets/images/onboarding1.jpg'),
    title: 'Let\'s Get Started!',
    subtitle: 'Choose your role and create an account',
  },
];

const Onboarding = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { width, height } = useWindowDimensions(); // <-- use dynamic dimensions

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Force Android to draw under the status bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  const handleLogin = () => {
    navigation.navigate(ROUTES.login_options, { userType: 'host' });
  };

  // Reset animations when slide changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / slides.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  // Auto-slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item }) => (
    <ImageBackground
      source={item.image}
      style={[styles.imageBackground, { width, height }]} // <-- use dynamic dimensions
      resizeMode="cover"
    >
      <View style={styles.dimBackground} />

      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Animated.View>
    </ImageBackground>
  );

  const renderPaginationDot = (_, index) => {
    const isActive = index === currentIndex;
    const dotScale = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          isActive ? styles.activeDot : styles.inactiveDot,
          {
            transform: [{ scale: isActive ? dotScale : 1 }],
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* StatusBar – uncommented and set for translucency */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.FlatList
        data={slides}
        ref={flatListRef}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        scrollEventThrottle={16}
        // Ensure the FlatList also fills the whole screen
        style={{ flex: 1 }}
      />

      <View style={styles.pagination}>
        {slides.map(renderPaginationDot)}
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() =>
            navigation.navigate(ROUTES.getting_started, { userType: 'cleaner' })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.login_question}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.login_text}>Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
 
  imageBackground: {
    flex: 1,          // ✅ This is the important fix
    width: '100%',    // optional but good practice
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlay: {
    marginBottom: 180,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pagination: {
    position: 'absolute',
    bottom: 160,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 40 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#00394c',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  login_question: {
    fontSize: 14,
    color: COLORS.light_gray,
  },
  login_text: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default Onboarding;