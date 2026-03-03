import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  PanResponder
} from 'react-native';

const { height } = Dimensions.get('window');

const SmoothModal = ({ visible, onClose, children }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          handleClose();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      showModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: height * 0.85,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default SmoothModal;