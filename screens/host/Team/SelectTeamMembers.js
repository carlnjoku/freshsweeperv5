// screens/host/team/SelectTeamMembers.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

const SelectTeamMembers = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { scheduleId, incident } = route.params || {};

  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!scheduleId || !incident) {
      Alert.alert('Error', 'Missing required data');
      navigation.goBack();
      return;
    }
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await userService.getTeamMembers();
      setTeamMembers(res.data || []);
    } catch (error) {
      console.error('Failed to load team members:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('could_not_load_team', 'Could not load team members. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      Alert.alert(
        tSafe('no_selection', 'No selection'),
        tSafe('select_at_least_one', 'Please select at least one team member.')
      );
      return;
    }

    setSending(true);
    try {
      await userService.notifyTeamMembers({
        scheduleId,
        incident: {
          groupIndex: incident.groupIndex,
          incidentIndex: incident.incidentIndex,
        },
        teamMemberIds: selectedIds,
        message: message.trim(),
      });
      Alert.alert(
        tSafe('success_title', 'Success'),
        tSafe('notifications_sent', `Notifications sent to ${selectedIds.length} team member(s).`)
      );
      navigation.goBack();
    } catch (error) {
      console.error('Failed to send notifications:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('send_failed', 'Failed to send notifications. Please try again.')
      );
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item._id);
    return (
      <TouchableOpacity
        style={[styles.memberItem, isSelected && styles.memberItemSelected]}
        onPress={() => toggleSelection(item._id)}
      >
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberPhone}>{item.phone}</Text>
          {item.workTypes && item.workTypes.length > 0 && (
            <View style={styles.workTypeTags}>
              {item.workTypes.slice(0, 2).map((type) => (
                <View key={type} style={styles.tag}>
                  <Text style={styles.tagText}>{type}</Text>
                </View>
              ))}
              {item.workTypes.length > 2 && (
                <Text style={styles.moreTag}>+{item.workTypes.length - 2}</Text>
              )}
            </View>
          )}
        </View>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={28} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{tSafe('notify_team_members', 'Notify Team Members')}</Text>
        <Text style={styles.subtitle}>
          {tSafe('incident_desc', 'Incident')}: {incident.description || 'No description'}
        </Text>
      </View>

      <TextInput
        style={styles.messageInput}
        placeholder={tSafe('optional_message', 'Optional message (e.g., "Please attend to this ASAP")')}
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.sectionTitle}>
        {tSafe('select_members', 'Select team members')} ({selectedIds.length})
      </Text>

      <FlatList
        data={teamMembers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>{tSafe('no_team_members', 'No team members found')}</Text>
            <Text style={styles.emptySubtext}>
              {tSafe('add_members_first', 'Add team members in the team management section.')}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.sendButton, (selectedIds.length === 0 || sending) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={selectedIds.length === 0 || sending}
      >
        <Text style={styles.sendButtonText}>
          {sending
            ? tSafe('sending', 'Sending...')
            : tSafe('send_notifications', `Send Notifications (${selectedIds.length})`)}
        </Text>
      </TouchableOpacity>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9e9e9',
  },
  memberItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E1E2F',
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workTypeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#555',
  },
  moreTag: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
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
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#b0b0b0',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectTeamMembers;