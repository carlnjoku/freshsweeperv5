// screens/host/BookingTabs/PendingReview.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import PendingApprovalListItem from '../../../components/host/PendingApprovalListItem';
import { tSafe } from '../../../utils/tSafe';

const PendingReview = ({ schedules, onStatusUpdate }) => {
  if (!schedules || schedules.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="check-circle-outline" size={80} color={COLORS.light_gray} />
        <Text style={styles.emptyStateTitle}>{tSafe('pending_review_empty_title', 'No Pending Reviews')}</Text>
        <Text style={styles.emptyStateText}>
          {tSafe('pending_review_empty_message', 'All completed work has been reviewed. Great job!')}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <PendingApprovalListItem
      item={item}
      hostId={item.hostInfo?.userId}
      onStatusUpdate={onStatusUpdate}
    />
  );

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={550} style={styles.animatedContainer}>
        <FlatList
          data={schedules}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animatable.View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: COLORS.background,
    marginBottom: 0,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default PendingReview;