// screens/host/BookingTabs/PendingReview.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';
import PendingApprovalListItem from '../../../components/host/PendingApprovalListItem';
import { tSafe } from '../../../utils/tSafe';

const PendingReview = ({ schedules, onStatusUpdate }) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  if (!schedules || schedules.length === 0) {
    return (
      <View style={styles.emptyState}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <MaterialCommunityIcons
          name="check-circle-outline"
          size={80}
          color={theme.icon.muted}
        />

        <Text style={styles.emptyStateTitle}>
          {tSafe(
            'pending_review_empty_title',
            'No Pending Reviews'
          )}
        </Text>

        <Text style={styles.emptyStateText}>
          {tSafe(
            'pending_review_empty_message',
            'All completed work has been reviewed. Great job!'
          )}
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
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      <Animatable.View
        animation="fadeIn"
        duration={550}
        style={styles.animatedContainer}
      >
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

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
      marginBottom: 0,
    },

    animatedContainer: {
      flex: 1,
    },

    listContent: {
      padding: 16,
      paddingBottom: 24,
    },

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
      backgroundColor: theme.background.default,
    },

    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },

    emptyStateText: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

export default PendingReview;