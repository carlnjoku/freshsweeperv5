// screens/host/TeamFormScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { TextInput, Button } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import COLORS from '../../../constants/colors';
// import { tSafe } from '../../../utils/tSafe';
// import userService from '../../../services/connection/userService'; // ✅ import

// const WORK_TYPES = [
//   'Plumbing',
//   'Electrical',
//   'Handyman',
//   'HVAC',
//   'Painting',
//   'Carpentry',
//   'Gardening',
//   'Cleaning',
//   'Pest Control',
//   'Supplier',
//   'Contractor',
//   'Other',
// ];

// const TeamForm = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { mode, memberId, memberData } = route.params || {};
//   const isEditing = mode === 'edit';

//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     language: 'English',
//     workTypes: [],
//     notes: '',
//   });
//   const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);

//   // Load data if editing
//   useEffect(() => {
//     if (isEditing && memberData) {
//       // If data was passed directly (dummy or real)
//       setForm({
//         name: memberData.name || '',
//         phone: memberData.phone || '',
//         email: memberData.email || '',
//         language: memberData.language || 'English',
//         workTypes: memberData.workTypes || [],
//         notes: memberData.notes || '',
//       });
//       setSelectedWorkTypes(memberData.workTypes || []);
//       setLoading(false);
//     } else if (isEditing && memberId) {
//       // Fetch from API if only ID is given (real scenario)
//       fetchMemberData(memberId);
//     } else {
//       setLoading(false);
//     }
//   }, [memberId, memberData, isEditing]);

//   const fetchMemberData = async (id) => {
//     setLoading(true);
//     try {
//       const res = await userService.getTeamMember(id);
//       const data = res.data;
//       setForm({
//         name: data.name || '',
//         phone: data.phone || '',
//         email: data.email || '',
//         language: data.language || 'English',
//         workTypes: data.workTypes || [],
//         notes: data.notes || '',
//       });
//       setSelectedWorkTypes(data.workTypes || []);
//     } catch (error) {
//       console.error('Failed to fetch team member:', error);
//       Alert.alert('Error', 'Could not load team member data');
//       navigation.goBack();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleWorkType = (type) => {
//     setSelectedWorkTypes((prev) =>
//       prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
//     );
//   };

//   const handleSave = async () => {
//     // Validation
//     if (!form.name.trim()) {
//       Alert.alert('Validation', 'Name is required');
//       return;
//     }
//     if (!form.phone.trim()) {
//       Alert.alert('Validation', 'Phone number is required');
//       return;
//     }

//     const payload = {
//       name: form.name.trim(),
//       phone: form.phone.trim(),
//       email: form.email.trim() || null,
//       language: form.language || 'English',
//       workTypes: selectedWorkTypes,
//       notes: form.notes.trim() || null,
//     };

//     setSaving(true);
//     try {
//       if (isEditing) {
//         await userService.updateTeamMember(memberId, payload);
//         Alert.alert('Success', 'Team member updated');
//       } else {
//         await userService.createTeamMember(payload);
//         Alert.alert('Success', 'Team member added');
//       }
//       navigation.goBack();
//     } catch (error) {
//       console.error('Save error:', error);
//       let message = 'Something went wrong. Please try again.';
//       if (error.response?.data?.detail) {
//         message = error.response.data.detail;
//       } else if (error.message) {
//         message = error.message;
//       }
//       Alert.alert('Error', message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
//       <View style={styles.card}>
//         <Text style={styles.label}>{tSafe('full_name', 'Full Name / Company')}</Text>
//         <TextInput
//           mode="outlined"
//           value={form.name}
//           onChangeText={(text) => setForm({ ...form, name: text })}
//           placeholder={tSafe('enter_name', 'e.g., John Smith')}
//           style={styles.input}
//           outlineColor="#ddd"
//           activeOutlineColor={COLORS.primary}
//         />

//         <Text style={styles.label}>{tSafe('phone_number', 'Phone Number')}</Text>
//         <TextInput
//           mode="outlined"
//           value={form.phone}
//           onChangeText={(text) => setForm({ ...form, phone: text })}
//           placeholder={tSafe('enter_phone', 'e.g., (123) 456-7890')}
//           keyboardType="phone-pad"
//           style={styles.input}
//           outlineColor="#ddd"
//           activeOutlineColor={COLORS.primary}
//         />

//         <Text style={styles.label}>{tSafe('email', 'Email (optional)')}</Text>
//         <TextInput
//           mode="outlined"
//           value={form.email}
//           onChangeText={(text) => setForm({ ...form, email: text })}
//           placeholder={tSafe('enter_email', 'e.g., john@example.com')}
//           keyboardType="email-address"
//           style={styles.input}
//           outlineColor="#ddd"
//           activeOutlineColor={COLORS.primary}
//         />

//         <Text style={styles.label}>{tSafe('language', 'Language')}</Text>
//         <TextInput
//           mode="outlined"
//           value={form.language}
//           onChangeText={(text) => setForm({ ...form, language: text })}
//           placeholder={tSafe('enter_language', 'e.g., English, Spanish')}
//           style={styles.input}
//           outlineColor="#ddd"
//           activeOutlineColor={COLORS.primary}
//         />

//         <Text style={styles.label}>{tSafe('work_types', 'Work Types')}</Text>
//         <View style={styles.workTypesContainer}>
//           {WORK_TYPES.map((type) => (
//             <TouchableOpacity
//               key={type}
//               style={[
//                 styles.workTypeChip,
//                 selectedWorkTypes.includes(type) && styles.workTypeChipActive,
//               ]}
//               onPress={() => toggleWorkType(type)}
//             >
//               <Text
//                 style={[
//                   styles.workTypeChipText,
//                   selectedWorkTypes.includes(type) && styles.workTypeChipTextActive,
//                 ]}
//               >
//                 {type}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={styles.label}>{tSafe('notes', 'Notes (optional)')}</Text>
//         <TextInput
//           mode="outlined"
//           value={form.notes}
//           onChangeText={(text) => setForm({ ...form, notes: text })}
//           placeholder={tSafe('additional_info', 'Any additional info...')}
//           multiline
//           numberOfLines={3}
//           style={[styles.input, { height: 80 }]}
//           outlineColor="#ddd"
//           activeOutlineColor={COLORS.primary}
//         />
//       </View>

//       <Button
//         mode="contained"
//         onPress={handleSave}
//         loading={saving}
//         disabled={saving}
//         style={styles.saveButton}
//         buttonColor={COLORS.primary}
//       >
//         {isEditing ? tSafe('update', 'Update') : tSafe('add_member', 'Add Member')}
//       </Button>
//     </ScrollView>
//   );
// };

// // Styles unchanged
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f8f9fe' },
//     scrollContent: { padding: 20, paddingBottom: 40 },
//     centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     card: {
//       backgroundColor: '#fff',
//       borderRadius: 12,
//       padding: 16,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.05,
//       shadowRadius: 4,
//       elevation: 2,
//     },
//     label: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: '#333',
//       marginBottom: 4,
//       marginTop: 12,
//     },
//     input: {
//       backgroundColor: '#fff',
//       marginBottom: 4,
//     },
//     workTypesContainer: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       marginTop: 4,
//     },
//     workTypeChip: {
//       paddingHorizontal: 12,
//       paddingVertical: 6,
//       borderRadius: 20,
//       backgroundColor: '#f0f0f0',
//       marginRight: 8,
//       marginBottom: 8,
//     },
//     workTypeChipActive: {
//       backgroundColor: COLORS.primary + '20',
//       borderColor: COLORS.primary,
//       borderWidth: 1,
//     },
//     workTypeChipText: {
//       fontSize: 13,
//       color: '#555',
//     },
//     workTypeChipTextActive: {
//       color: COLORS.primary,
//       fontWeight: '500',
//     },
//     saveButton: {
//       marginTop: 24,
//       paddingVertical: 6,
//       borderRadius: 8,
//     },
//   });
  
//   export default TeamForm;



import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { useTheme } from '../../../theme';

import {
  AppText,
  AppCard,
  AppInput,
  AppButton,
} from '../../../ui';

import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getErrorMessage = (error) => {
  const detail =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message;

  if (typeof detail === 'string') {
    return detail;
  }

  return tSafe(
    'generic_error',
    'Something went wrong. Please try again.'
  );
};

const normalizeMemberData = (data = {}) => ({
  name: data.name || '',
  phone: data.phone || '',
  email: data.email || '',
  language: data.language || 'English',
  workTypes: Array.isArray(data.workTypes)
    ? data.workTypes
    : [],
  notes: data.notes || '',
});

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const TeamForm = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    mode,
    memberId,
    memberData,
  } = route.params || {};

  const isEditing = mode === 'edit';

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() =>
    normalizeMemberData()
  );

  const [selectedWorkTypes, setSelectedWorkTypes] =
    useState([]);

  const [errors, setErrors] = useState({});

  // ───────────────────────────────────────────────────────────
  // Form helpers
  // ───────────────────────────────────────────────────────────

  const updateField = useCallback((field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: '',
    }));
  }, []);

  // ───────────────────────────────────────────────────────────
  // Fetch existing team member
  // ───────────────────────────────────────────────────────────

  const fetchMemberData = useCallback(async (id) => {
    setLoading(true);

    try {
      const response =
        await userService.getTeamMember(id);

      const data =
        response?.data?.data ||
        response?.data ||
        {};

      const normalized = normalizeMemberData(data);

      setForm(normalized);
      setSelectedWorkTypes(normalized.workTypes);
    } catch (error) {
      console.error(
        'Failed to fetch team member:',
        error
      );

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'could_not_load_member',
          'Could not load team member data.'
        ),
        [
          {
            text: tSafe('go_back', 'Go Back'),
            onPress: () => navigation.goBack(),
          },
          {
            text: tSafe('retry', 'Retry'),
            onPress: () => fetchMemberData(id),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    if (!isEditing) {
      setForm(normalizeMemberData());
      setSelectedWorkTypes([]);
      setLoading(false);
      return;
    }

    if (memberData) {
      const normalized = normalizeMemberData(memberData);

      setForm(normalized);
      setSelectedWorkTypes(normalized.workTypes);
      setLoading(false);
      return;
    }

    if (memberId) {
      fetchMemberData(memberId);
      return;
    }

    setLoading(false);

    Alert.alert(
      tSafe('error_title', 'Error'),
      tSafe(
        'missing_member_data',
        'Team member information is missing.'
      ),
      [
        {
          text: tSafe('go_back', 'Go Back'),
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }, [
    isEditing,
    memberData,
    memberId,
    fetchMemberData,
    navigation,
  ]);

  // ───────────────────────────────────────────────────────────
  // Work type selection
  // ───────────────────────────────────────────────────────────

  const toggleWorkType = useCallback((type) => {
    setSelectedWorkTypes((previous) => {
      if (previous.includes(type)) {
        return previous.filter(
          (selectedType) => selectedType !== type
        );
      }

      return [...previous, type];
    });
  }, []);

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = tSafe(
        'name_required',
        'Name is required.'
      );
    }

    if (!form.phone.trim()) {
      nextErrors.phone = tSafe(
        'phone_required',
        'Phone number is required.'
      );
    }

    const email = form.email.trim();

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      nextErrors.email = tSafe(
        'invalid_email',
        'Enter a valid email address.'
      );
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }, [form]);

  // ───────────────────────────────────────────────────────────
  // Save
  // ───────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (saving) {
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        tSafe('validation_error', 'Check your information'),
        tSafe(
          'fix_form_errors',
          'Please correct the highlighted fields before continuing.'
        )
      );

      return;
    }

    if (isEditing && !memberId) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'missing_member_id',
          'The team member ID is missing.'
        )
      );

      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      language: form.language.trim() || 'English',
      workTypes: [...selectedWorkTypes],
      notes: form.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (isEditing) {
        await userService.updateTeamMember(
          memberId,
          payload
        );
      } else {
        await userService.createTeamMember(payload);
      }

      Alert.alert(
        tSafe('success_title', 'Success'),
        isEditing
          ? tSafe(
              'team_member_updated',
              'Team member updated successfully.'
            )
          : tSafe(
              'team_member_added',
              'Team member added successfully.'
            ),
        [
          {
            text: tSafe('ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Save error:', error);

      Alert.alert(
        tSafe('error_title', 'Error'),
        getErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  }, [
    saving,
    validateForm,
    isEditing,
    memberId,
    form,
    selectedWorkTypes,
    navigation,
  ]);

  // ───────────────────────────────────────────────────────────
  // Loading state
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={theme.background.default}
          barStyle={
            isDark ? 'light-content' : 'dark-content'
          }
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_member',
              'Loading team member...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Main render
  // ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name={
                  isEditing
                    ? 'account-edit-outline'
                    : 'account-plus-outline'
                }
                size={27}
                color={theme.brand.primary}
              />
            </View>

            <AppText
              variant="heading"
              style={styles.headerTitle}
            >
              {isEditing
                ? tSafe(
                    'edit_team_member',
                    'Edit Team Member'
                  )
                : tSafe(
                    'add_team_member',
                    'Add Team Member'
                  )}
            </AppText>

            <AppText
              color={theme.text.secondary}
              style={styles.headerSubtitle}
            >
              {isEditing
                ? tSafe(
                    'edit_member_subtitle',
                    'Update contact information and services.'
                  )
                : tSafe(
                    'add_member_subtitle',
                    'Add someone to your team contact list.'
                  )}
            </AppText>
          </View>

          {/* Contact information */}

          <AppCard
            padding="large"
            radius="large"
            style={styles.formCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={19}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <AppText
                  variant="title"
                  style={styles.sectionTitle}
                >
                  {tSafe(
                    'contact_information',
                    'Contact Information'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                >
                  {tSafe(
                    'contact_information_subtitle',
                    'Enter the member’s contact details.'
                  )}
                </AppText>
              </View>
            </View>

            {/* Name */}

            <AppInput
              label={tSafe(
                'full_name',
                'Full Name / Company'
              )}
              value={form.name}
              onChangeText={(value) =>
                updateField('name', value)
              }
              placeholder={tSafe(
                'enter_name',
                'e.g., John Smith'
              )}
              leftIcon="account-outline"
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
              editable={!saving}
            />

            {/* Phone */}

            <AppInput
              label={tSafe(
                'phone_number',
                'Phone Number'
              )}
              value={form.phone}
              onChangeText={(value) =>
                updateField('phone', value)
              }
              placeholder={tSafe(
                'enter_phone',
                'e.g., (123) 456-7890'
              )}
              leftIcon="phone-outline"
              error={errors.phone}
              keyboardType="phone-pad"
              returnKeyType="next"
              editable={!saving}
            />

            {/* Email */}

            <AppInput
              label={tSafe(
                'email',
                'Email (Optional)'
              )}
              value={form.email}
              onChangeText={(value) =>
                updateField('email', value)
              }
              placeholder={tSafe(
                'enter_email',
                'e.g., john@example.com'
              )}
              leftIcon="email-outline"
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              editable={!saving}
            />

            {/* Language */}

            <AppInput
              label={tSafe(
                'language',
                'Language'
              )}
              value={form.language}
              onChangeText={(value) =>
                updateField('language', value)
              }
              placeholder={tSafe(
                'enter_language',
                'e.g., English, Spanish'
              )}
              leftIcon="translate"
              autoCapitalize="words"
              returnKeyType="next"
              editable={!saving}
            />
          </AppCard>

          {/* Work types */}

          <AppCard
            padding="large"
            radius="large"
            style={styles.formCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="tools"
                  size={19}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <AppText
                  variant="title"
                  style={styles.sectionTitle}
                >
                  {tSafe(
                    'work_types',
                    'Work Types'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                >
                  {tSafe(
                    'work_types_subtitle',
                    'Select all services this member provides.'
                  )}
                </AppText>
              </View>
            </View>

            <View style={styles.workTypesContainer}>
              {WORK_TYPES.map((type) => {
                const selected =
                  selectedWorkTypes.includes(type);

                return (
                  <TouchableOpacity
                    key={type}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: selected,
                      disabled: saving,
                    }}
                    style={[
                      styles.workTypeChip,
                      selected &&
                        styles.workTypeChipActive,
                    ]}
                    onPress={() => toggleWorkType(type)}
                    disabled={saving}
                    activeOpacity={0.75}
                  >
                    {selected ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={15}
                        color={theme.brand.primary}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="plus-circle-outline"
                        size={15}
                        color={theme.icon.muted}
                      />
                    )}

                    <AppText
                      style={[
                        styles.workTypeChipText,
                        selected &&
                          styles.workTypeChipTextActive,
                      ]}
                    >
                      {type}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.selectionSummary}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={17}
                color={theme.brand.primary}
              />

              <AppText
                variant="caption"
                color={theme.text.secondary}
                style={styles.selectionSummaryText}
              >
                {selectedWorkTypes.length}{' '}
                {tSafe(
                  'work_types_selected',
                  'work type(s) selected'
                )}
              </AppText>
            </View>
          </AppCard>

          {/* Notes */}

          <AppCard
            padding="large"
            radius="large"
            style={styles.formCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={19}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <AppText
                  variant="title"
                  style={styles.sectionTitle}
                >
                  {tSafe(
                    'additional_details',
                    'Additional Details'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                >
                  {tSafe(
                    'notes_subtitle',
                    'Add useful information about this member.'
                  )}
                </AppText>
              </View>
            </View>

            <AppInput
              label={tSafe(
                'notes',
                'Notes (Optional)'
              )}
              value={form.notes}
              onChangeText={(value) =>
                updateField('notes', value)
              }
              placeholder={tSafe(
                'additional_info',
                'Any additional information...'
              )}
              multiline
              numberOfLines={4}
              leftIcon="note-text-outline"
              editable={!saving}
              inputStyle={styles.notesInput}
            />
          </AppCard>

          {/* Save */}

          <View style={styles.actions}>
            <AppButton
              title={
                isEditing
                  ? tSafe(
                      'update_member',
                      'Update Team Member'
                    )
                  : tSafe(
                      'add_member',
                      'Add Team Member'
                    )
              }
              variant="primary"
              size="large"
              fullWidth
              icon={
                isEditing
                  ? 'content-save-outline'
                  : 'account-plus-outline'
              }
              loading={saving}
              disabled={saving}
              onPress={handleSave}
            />

            <AppButton
              title={tSafe(
                'cancel',
                'Cancel'
              )}
              variant="outline"
              size="large"
              fullWidth
              disabled={saving}
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// Theme-aware styles
// ─────────────────────────────────────────────────────────────

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    keyboardContainer: {
      flex: 1,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 40,
    },

    header: {
      alignItems: 'center',
      marginBottom: 22,
      paddingHorizontal: 12,
    },

    headerIcon: {
      width: 68,
      height: 68,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginBottom: 14,
    },

    headerTitle: {
      fontSize: 23,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 6,
    },

    headerSubtitle: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      maxWidth: 300,
    },

    formCard: {
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDark
        ? 0
        : theme.shadow.opacity,
      shadowRadius: 5,
      elevation: isDark ? 0 : 2,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },

    sectionIcon: {
      width: 39,
      height: 39,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 11,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 3,
    },

    workTypesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    workTypeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.elevated,
      marginBottom: 2,
    },

    workTypeChipActive: {
      backgroundColor: theme.surface.selected,
      borderColor: theme.brand.primary,
    },

    workTypeChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.secondary,
    },

    workTypeChipTextActive: {
      color: theme.brand.primary,
      fontWeight: '800',
    },

    selectionSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border.default,
      gap: 7,
    },

    selectionSummaryText: {
      fontSize: 12,
    },

    notesInput: {
      minHeight: 90,
      textAlignVertical: 'top',
    },

    actions: {
      marginTop: 4,
    },

    cancelButton: {
      marginTop: 10,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    loadingText: {
      fontSize: 14,
      marginTop: 12,
      textAlign: 'center',
    },
  });

export default TeamForm;