import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe'; // added import

const MyGigs = () => {
  const navigation = useNavigation();
  const { currentUserId, userToken } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLinkedProperties = async () => {
    try {
      setError(null);
      const response = await userService.getLinkedProperties(userToken);
      console.log("T-----------T", response.data)
      setProperties(response.data || []);
    } catch (err) {
      console.error('Failed to fetch linked properties:', err);
      setError(tSafe('load_linked_properties_error', 'Could not load your linked properties. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLinkedProperties();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLinkedProperties();
  };

  const navigateToPropertyGigs = (property) => {
    navigation.navigate(ROUTES.cleaner_property_gigs, { property });
  };

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToPropertyGigs(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        {item.property_image ? (
          <Image source={{ uri: item.property_image }} style={styles.propertyImage} />
        ) : (
          <View style={[styles.propertyImage, styles.imagePlaceholder]}>
            <MaterialIcons name="home" size={24} color={COLORS.gray} />
          </View>
        )}
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{item.property_name}</Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>
            {item.property_address}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="calendar-clock" size={18} color={COLORS.primary} />
          <Text style={styles.statText}>
            {item.upcoming_gigs_count} {tSafe('upcoming', 'upcoming')}
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clipboard-list" size={18} color={COLORS.gray} />
          <Text style={styles.statText}>
            {item.total_gigs_count} {tSafe('total', 'total')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewGigsText}>{tSafe('view_gigs', 'View Gigs')}</Text>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLinkedProperties}>
          <Text style={styles.retryText}>{tSafe('retry', 'Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="home-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>{tSafe('no_linked_properties', 'No Linked Properties')}</Text>
        <Text style={styles.emptyText}>
          {tSafe('no_linked_properties_message', 'You haven\'t been invited to any properties yet. When a host invites you, they will appear here.')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.property_id}
        renderItem={renderPropertyCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  propertyImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 13,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  viewGigsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default MyGigs;