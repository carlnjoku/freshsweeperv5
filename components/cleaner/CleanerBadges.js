import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BADGE_CONFIG } from '../../utils/cleanerBadges';

const CleanerBadges = ({ badges = [] }) => {
  return (
    <View style={styles.container}>
      {badges.slice(0, 3).map((badge) => {
        const config = BADGE_CONFIG[badge];
        if (!config) return null;

        return (
          <View key={badge} style={styles.badge}>
            <MaterialCommunityIcons
              name={config.icon}
              size={14}
              color={config.color}
            />
            <Text style={[styles.text, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5'
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  }
});

export default CleanerBadges;