// screens/host/TeamFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../../constants/colors';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService'; // ✅ import

const WORK_TYPES = [
  'Plumbing',
  'Electrical',
  'Handyman',
  'HVAC',
  'Painting',
  'Carpentry',
  'Gardening',
  'Cleaning',
  'Pest Control',
  'Supplier',
  'Contractor',
  'Other',
];

const TeamForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, memberId, memberData } = route.params || {};
  const isEditing = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    language: 'English',
    workTypes: [],
    notes: '',
  });
  const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);

  // Load data if editing
  useEffect(() => {
    if (isEditing && memberData) {
      // If data was passed directly (dummy or real)
      setForm({
        name: memberData.name || '',
        phone: memberData.phone || '',
        email: memberData.email || '',
        language: memberData.language || 'English',
        workTypes: memberData.workTypes || [],
        notes: memberData.notes || '',
      });
      setSelectedWorkTypes(memberData.workTypes || []);
      setLoading(false);
    } else if (isEditing && memberId) {
      // Fetch from API if only ID is given (real scenario)
      fetchMemberData(memberId);
    } else {
      setLoading(false);
    }
  }, [memberId, memberData, isEditing]);

  const fetchMemberData = async (id) => {
    setLoading(true);
    try {
      const res = await userService.getTeamMember(id);
      const data = res.data;
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        language: data.language || 'English',
        workTypes: data.workTypes || [],
        notes: data.notes || '',
      });
      setSelectedWorkTypes(data.workTypes || []);
    } catch (error) {
      console.error('Failed to fetch team member:', error);
      Alert.alert('Error', 'Could not load team member data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkType = (type) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Validation', 'Phone number is required');
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      language: form.language || 'English',
      workTypes: selectedWorkTypes,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await userService.updateTeamMember(memberId, payload);
        Alert.alert('Success', 'Team member updated');
      } else {
        await userService.createTeamMember(payload);
        Alert.alert('Success', 'Team member added');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      let message = 'Something went wrong. Please try again.';
      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.label}>{tSafe('full_name', 'Full Name / Company')}</Text>
        <TextInput
          mode="outlined"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholder={tSafe('enter_name', 'e.g., John Smith')}
          style={styles.input}
          outlineColor="#ddd"
          activeOutlineColor={COLORS.primary}
        />

        <Text style={styles.label}>{tSafe('phone_number', 'Phone Number')}</Text>
        <TextInput
          mode="outlined"
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          placeholder={tSafe('enter_phone', 'e.g., (123) 456-7890')}
          keyboardType="phone-pad"
          style={styles.input}
          outlineColor="#ddd"
          activeOutlineColor={COLORS.primary}
        />

        <Text style={styles.label}>{tSafe('email', 'Email (optional)')}</Text>
        <TextInput
          mode="outlined"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder={tSafe('enter_email', 'e.g., john@example.com')}
          keyboardType="email-address"
          style={styles.input}
          outlineColor="#ddd"
          activeOutlineColor={COLORS.primary}
        />

        <Text style={styles.label}>{tSafe('language', 'Language')}</Text>
        <TextInput
          mode="outlined"
          value={form.language}
          onChangeText={(text) => setForm({ ...form, language: text })}
          placeholder={tSafe('enter_language', 'e.g., English, Spanish')}
          style={styles.input}
          outlineColor="#ddd"
          activeOutlineColor={COLORS.primary}
        />

        <Text style={styles.label}>{tSafe('work_types', 'Work Types')}</Text>
        <View style={styles.workTypesContainer}>
          {WORK_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.workTypeChip,
                selectedWorkTypes.includes(type) && styles.workTypeChipActive,
              ]}
              onPress={() => toggleWorkType(type)}
            >
              <Text
                style={[
                  styles.workTypeChipText,
                  selectedWorkTypes.includes(type) && styles.workTypeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{tSafe('notes', 'Notes (optional)')}</Text>
        <TextInput
          mode="outlined"
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          placeholder={tSafe('additional_info', 'Any additional info...')}
          multiline
          numberOfLines={3}
          style={[styles.input, { height: 80 }]}
          outlineColor="#ddd"
          activeOutlineColor={COLORS.primary}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
        buttonColor={COLORS.primary}
      >
        {isEditing ? tSafe('update', 'Update') : tSafe('add_member', 'Add Member')}
      </Button>
    </ScrollView>
  );
};

// Styles unchanged
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fe' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
      marginTop: 12,
    },
    input: {
      backgroundColor: '#fff',
      marginBottom: 4,
    },
    workTypesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    workTypeChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      marginRight: 8,
      marginBottom: 8,
    },
    workTypeChipActive: {
      backgroundColor: COLORS.primary + '20',
      borderColor: COLORS.primary,
      borderWidth: 1,
    },
    workTypeChipText: {
      fontSize: 13,
      color: '#555',
    },
    workTypeChipTextActive: {
      color: COLORS.primary,
      fontWeight: '500',
    },
    saveButton: {
      marginTop: 24,
      paddingVertical: 6,
      borderRadius: 8,
    },
  });
  
  export default TeamForm;