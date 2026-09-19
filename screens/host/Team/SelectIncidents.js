// screens/host/SelectIncidentScreen.js
// screens/host/team/SelectIncident.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

const SelectIncident = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { scheduleId } = route.params || {};

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scheduleId) {
      Alert.alert('Error', 'No schedule ID provided');
      navigation.goBack();
      return;
    }
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await userService.getScheduleIncidents(scheduleId);
      setIncidents(res.data.incidents || []);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('could_not_load_incidents', 'Could not load incidents for this schedule.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (incident) => {
    navigation.navigate(ROUTES.host_select_team_members, {
      scheduleId,
      incident,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
      <View style={styles.cardContent}>
        <MaterialCommunityIcons name="alert-circle" size={28} color={COLORS.warning || '#FFA500'} />
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || tSafe('no_description', 'No description')}
          </Text>
          <Text style={styles.detail}>
            {tSafe('cleaner', 'Cleaner')}: {item.cleanerName || 'N/A'}
          </Text>
          <Text style={styles.detail}>
            {tSafe('reported', 'Reported')}: {item.reported_at ? new Date(item.reported_at).toLocaleString() : 'N/A'}
          </Text>
          <Text style={[styles.detail, styles.status]}>
            {tSafe('status', 'Status')}: {item.status || 'reported'}
          </Text>
          {item.photos && item.photos.length > 0 && (
            <Text style={styles.photos}>
              📷 {item.photos.length} {tSafe('photo_s', 'photo(s)')}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tSafe('select_incident', 'Select an Incident to Notify')}</Text>
      <FlatList
        data={incidents}
        keyExtractor={(item, index) => `${item.groupIndex}-${item.incidentIndex}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>{tSafe('no_incidents', 'No incidents reported')}</Text>
            <Text style={styles.emptySubtext}>
              {tSafe('no_incidents_hint', 'This schedule has no reported incidents.')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E1E2F',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  status: {
    textTransform: 'capitalize',
  },
  photos: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default SelectIncident;