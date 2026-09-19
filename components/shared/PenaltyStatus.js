import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const PenaltyStatusCard = ({ reliabilityImpact, ratingImpact }) => {
  const getTierFromImpact = (impact) => {
    if (impact >= -3) return { tier: 'MINOR', color: '#F59E0B' };
    if (impact >= -6) return { tier: 'MODERATE', color: '#F97316' };
    if (impact >= -12) return { tier: 'SEVERE', color: '#EF4444' };
    return { tier: 'MAXIMUM', color: '#B91C1C' };
  };

  const reliabilityTier = getTierFromImpact(reliabilityImpact);
  const ratingTier = getTierFromImpact(ratingImpact * 2); // scale rating impact for display

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Active Penalty Status</Text>
      <View style={styles.row}>
        <FontAwesome5 name="shield-alt" size={20} color="#6B7280" />
        <Text style={styles.label}>Reliability Impact</Text>
        <Text style={[styles.value, { color: reliabilityTier.color }]}>
          {reliabilityImpact.toFixed(1)}
        </Text>
      </View>
      <View style={styles.row}>
        <FontAwesome5 name="star" size={20} color="#6B7280" />
        <Text style={styles.label}>Rating Impact</Text>
        <Text style={[styles.value, { color: ratingTier.color }]}>
          {ratingImpact.toFixed(1)}
        </Text>
      </View>
      {reliabilityImpact < 0 && (
        <Text style={styles.note}>
          These impacts will gradually reduce over 30 days.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default PenaltyStatusCard;