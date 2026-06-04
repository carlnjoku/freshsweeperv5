import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

export default function Requests({
  schedules = [],
  onAccept,
  onDecline,
}) {
  const renderItem = ({ item }) => {
    const propertyName =
      item?.apartment?.apartment_name ||
      item?.property?.name ||
      'Property';

    const cleaningDate =
      item?.schedule?.cleaning_date || '';

    const cleaningTime =
      item?.schedule?.cleaning_time || '';

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="home-city-outline"
            size={22}
            color={COLORS.primary}
          />

          <Text style={styles.propertyName}>
            {propertyName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={18}
            color="#666"
          />

          <Text style={styles.infoText}>
            {cleaningDate}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color="#666"
          />

          <Text style={styles.infoText}>
            {cleaningTime}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => onDecline?.(item)}
          >
            <Text style={styles.declineText}>
              Decline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onAccept?.(item)}
          >
            <Text style={styles.acceptText}>
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="email-outline"
        size={70}
        color="#cfcfcf"
      />

      <Text style={styles.emptyTitle}>
        No Requests
      </Text>

      <Text style={styles.emptyDescription}>
        You currently have no pending cleaning requests.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={schedules}
      keyExtractor={(item, index) =>
        item?._id || index.toString()
      }
      renderItem={renderItem}
      contentContainerStyle={{
        flexGrow: schedules.length === 0 ? 1 : undefined,
        padding: 15,
      }}
      ListEmptyComponent={EmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  propertyName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoText: {
    marginLeft: 8,
    color: '#555',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  declineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d9534f',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },

  declineText: {
    color: '#d9534f',
    fontWeight: '600',
  },

  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },

  acceptText: {
    color: '#fff',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    color:COLORS.light_gray
  },

  emptyDescription: {
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});