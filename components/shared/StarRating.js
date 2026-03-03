import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // You can replace this with any icon library

const StarRating = ({ initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);

  const handleStarPress = (newRating) => {
    setRating(newRating);
    onRatingChange(newRating);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((index) => (
        <TouchableOpacity
          key={index}
          // onPress={() => handleStarPress(index)}
          style={styles.starContainer}
        >
          <Ionicons
            name={rating >= index ? 'star' : 'star-outline'}
            size={16}
            color={rating >= index ? '#FFD700' : '#C0C0C0'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 1,
  },
});

export default StarRating;
