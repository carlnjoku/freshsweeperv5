import React from 'react';
import { 
  SafeAreaView,
  StyleSheet, 
  StatusBar, 
  Text, 
  Linking, 
  FlatList, 
  ScrollView, 
  Modal, 
  Image, 
  View, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UpcomingScheduleListItem from '../../../components/shared/UpcomingScheduleListItem';
import COLORS from '../../../constants/colors';

export default function Upcoming({ schedules, currency, isLoading = false }) {
  // Enhanced empty state function
  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'calendar-blank',
        title: 'No Upcoming Schedules',
        message: 'You don’t have any upcoming cleaning schedules. New bookings will appear here once confirmed.'
      },
      booked: {
        icon: 'calendar-plus',
        title: 'No Bookings Yet',
        message: 'Your upcoming cleaning appointments will show up here once they are booked and confirmed.'
      },
      confirmed: {
        icon: 'calendar-check',
        title: 'No Confirmed Schedules',
        message: 'Confirmed cleaning schedules will appear here. Check your pending requests for unconfirmed bookings.'
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Unable to Load Schedules',
        message: 'There was an issue loading your upcoming schedules. Please pull down to refresh.'
      }
    };

    const { icon, title, message } = messages[type] || messages.general;

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={600}
        style={styles.emptyState}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={80} 
          color={COLORS.light_gray} 
        />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
        
        {/* Optional: Add a call-to-action button */}
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Check for New Bookings</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const singleItem = ( {item, index} ) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      delay={index * 100}
    >
      <UpcomingScheduleListItem
        item={item}
        currency={currency}
      />
    </Animatable.View>
  );

  const itemSeparator = () => (
    <View style={styles.item_separator}></View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {renderEmptyState('general')}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading upcoming schedules...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={550} style={styles.animatedContainer}>
        <FlatList 
          data={schedules}
          renderItem={singleItem}
          ListHeaderComponentStyle={styles.list_header}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={itemSeparator}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            schedules.length === 0 ? styles.emptyListContent : styles.listContent
          }
        />
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: COLORS.background,
    marginBottom: 60,
  },
  animatedContainer: {
    // flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  item_separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  list_header: {
    // Your existing styles
  },
});