import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, ScrollView } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_OVERLAY_HEIGHT = 300; // Default height for the overlay on load

const DraggableOverlay = () => {
  const [overlayHeight] = useState(new Animated.Value(DEFAULT_OVERLAY_HEIGHT));
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (evt, gestureState) => {
        let finalHeight = DEFAULT_OVERLAY_HEIGHT - gestureState.dy; // Adjust height by negative drag

        // Bound the overlay height between a minimum and maximum
        if (finalHeight > SCREEN_HEIGHT - 100) {
          finalHeight = SCREEN_HEIGHT - 100; // Max height
        } else if (finalHeight < 150) {
          finalHeight = 150; // Min height
        }

        // Animate the height adjustment
        Animated.timing(overlayHeight, {
          toValue: finalHeight,
          duration: 300,
          useNativeDriver: false,
        }).start();

        // Reset the pan value
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.overlay,
          {
            height: overlayHeight,  // Dynamic height of the overlay
          },
        ]}
      >
        <View
          {...panResponder.panHandlers}
          style={styles.dragHandle}
        >
          <Text style={styles.dragText}>Drag Me</Text>
        </View>

        {/* Scrollable content inside the overlay */}
        <ScrollView style={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.contentText}>Scrollable Content</Text>
            <Text style={styles.contentText}>This is a draggable overlay with scrollable content inside.</Text>
            <Text style={styles.contentText}>Add more text or content here to see how scrolling works.</Text>
            <Text style={styles.contentText}>More content...</Text>
            <Text style={styles.contentText}>Keep adding content to test scrolling.</Text>
            <Text style={styles.contentText}>Scrollable section inside the overlay.</Text>
            <Text style={styles.contentText}>Drag to resize, or scroll within the overlay.</Text>
            <Text style={styles.contentText}>Add more text or content here to see how scrolling works.</Text>
            <Text style={styles.contentText}>More content...</Text>
            <Text style={styles.contentText}>Add more text or content here to see how scrolling works.</Text>
            <Text style={styles.contentText}>More content...</Text>
            <Text style={styles.contentText}>Add more text or content here to see how scrolling works.</Text>
            <Text style={styles.contentText}>More content...</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',  // Keeps the content at the bottom
    backgroundColor: '#f2f2f2',
  },
  overlay: {
    position: 'absolute',        // Fixed positioning
    bottom: 0,                   // Always sits at the bottom of the screen
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  dragHandle: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragText: {
    color: '#555',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,  // Ensures the ScrollView takes up available space
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default DraggableOverlay;