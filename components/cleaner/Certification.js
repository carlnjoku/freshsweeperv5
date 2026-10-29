import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';

import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const Certification = ({
  userId,
  certification,
  close_modal,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const parseDate = (value) => {
    if (!value) {
      return new Date();
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? new Date()
      : date;
  };

  const [inputs, setInputs] = useState({
    userId,
    name: certification?.name || '',
    institution_name: certification?.institution_name || '',
    credentialUrl: certification?.credentialUrl || '',
    startDate: parseDate(certification?.startDate),
    endDate: parseDate(certification?.endDate),
    expiryDate: parseDate(certification?.expiryDate),
    _id: certification?._id,
  });

  const [errors, setErrors] = useState({
    name: '',
    institution_name: '',
    startDate: '',
    endDate: '',
    expiryDate: '',
    credentialUrl: '',
  });

  const [showStartDatePicker, setShowStartDatePicker] =
    useState(false);

  const [showEndDatePicker, setShowEndDatePicker] =
    useState(false);

  const [showExpiryDatePicker, setShowExpiryDatePicker] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(certification);

  const hasCredentialUrl = Boolean(
    inputs.credentialUrl?.trim()
  );

  const formatDate = (date) => {
    if (!date) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleChange = (text, field) => {
    setInputs((prev) => ({
      ...prev,
      [field]: text,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleDateChange = (date, field) => {
    setInputs((prev) => ({
      ...prev,
      [field]: date,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
      ...(field === 'startDate'
        ? { endDate: '', expiryDate: '' }
        : {}),
      ...(field === 'endDate'
        ? { expiryDate: '' }
        : {}),
    }));
  };

  const handleError = (error, field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const onClose = () => {
    if (isSaving) {
      return;
    }

    Keyboard.dismiss();
    close_modal(false);
  };

  const validateUrl = (url) => {
    if (!url?.trim()) {
      return true;
    }

    try {
      const normalizedUrl = url.startsWith('http')
        ? url
        : `https://${url}`;

      new URL(normalizedUrl);

      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const nextErrors = {};

    const name = inputs.name.trim();
    const institution = inputs.institution_name.trim();
    const credentialUrl = inputs.credentialUrl.trim();

    if (!name) {
      nextErrors.name = tSafe(
        'enter_certification_name',
        'Enter certification name'
      );
    }

    if (!institution) {
      nextErrors.institution_name = tSafe(
        'enter_institution_name',
        'Enter institution name'
      );
    }

    if (inputs.startDate > inputs.endDate) {
      nextErrors.endDate = tSafe(
        'end_date_after_start_date',
        'End date must be after the start date'
      );
    }

    if (inputs.expiryDate < inputs.startDate) {
      nextErrors.expiryDate = tSafe(
        'expiry_date_after_start_date',
        'Expiry date must be after the start date'
      );
    }

    if (!validateUrl(credentialUrl)) {
      nextErrors.credentialUrl = tSafe(
        'invalid_credential_url',
        'Enter a valid credential URL'
      );
    }

    setErrors({
      name: nextErrors.name || '',
      institution_name: nextErrors.institution_name || '',
      startDate: nextErrors.startDate || '',
      endDate: nextErrors.endDate || '',
      expiryDate: nextErrors.expiryDate || '',
      credentialUrl: nextErrors.credentialUrl || '',
    });

    if (Object.keys(nextErrors).length > 0) {
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (isSaving) {
      return;
    }

    if (!validate()) {
      return;
    }

    Keyboard.dismiss();
    setIsSaving(true);

    try {
      const credentialUrl = inputs.credentialUrl.trim();

      const payload = {
        ...inputs,
        name: inputs.name.trim(),
        institution_name: inputs.institution_name.trim(),
        credentialUrl: credentialUrl
          ? credentialUrl.startsWith('http')
            ? credentialUrl
            : `https://${credentialUrl}`
          : '',
        startDate: inputs.startDate.toISOString(),
        endDate: inputs.endDate.toISOString(),
        expiryDate: inputs.expiryDate.toISOString(),
      };

      const response =
        await userService.updateCleanerCertification(
          payload
        );

      if (response.status === 200) {
        Alert.alert(
          tSafe('success_title', 'Success'),
          response.data?.message ||
            tSafe(
              'certification_saved',
              'Certification saved successfully.'
            )
        );

        if (onUpdate) {
          onUpdate(
            response.data?.certification || payload
          );
        }

        onClose();
      } else {
        Alert.alert(
          tSafe('error_title', 'Oops!'),
          tSafe(
            'something_went_wrong',
            'Something went wrong, try again'
          )
        );
      }
    } catch (e) {
      Alert.alert(
        tSafe('error_title', 'Oops!'),
        tSafe(
          'something_went_wrong',
          'Something went wrong, try again'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const dateInputTheme = useMemo(
    () => ({
      roundness: 16,
      colors: {
        primary: theme.input.focus,
        outline: theme.input.border,
        background: theme.input.background,
        onSurfaceVariant: theme.input.placeholder,
      },
    }),
    [theme]
  );

  const renderError = (message) => {
    if (!message) {
      return null;
    }

    return (
      <View style={styles.errorRow}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={16}
          color={theme.status.error}
        />

        <AppText
          variant="caption"
          style={styles.errorText}
        >
          {message}
        </AppText>
      </View>
    );
  };

  const renderDateInput = ({
    label,
    value,
    pickerOpen,
    setPickerOpen,
    field,
    pickerTitle,
    minimumDate,
  }) => {
    const fieldError = errors[field];

    return (
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label={label}
          value={formatDate(value)}
          editable={false}
          error={Boolean(fieldError)}
          outlineColor={
            fieldError
              ? theme.status.error
              : theme.input.border
          }
          activeOutlineColor={
            fieldError
              ? theme.status.error
              : theme.input.focus
          }
          textColor={theme.input.text}
          style={styles.input}
          theme={dateInputTheme}
          right={
            <TextInput.Icon
              icon="calendar-month-outline"
              color={theme.icon.muted}
              onPress={() => setPickerOpen(true)}
            />
          }
          onPressIn={() => setPickerOpen(true)}
        />

        {renderError(fieldError)}

        <DatePicker
          modal
          open={pickerOpen}
          date={value}
          mode="date"
          minimumDate={minimumDate}
          onConfirm={(date) => {
            setPickerOpen(false);
            handleDateChange(date, field);
          }}
          onCancel={() => setPickerOpen(false)}
          title={pickerTitle}
          confirmText={tSafe('done', 'Done')}
          cancelText={tSafe('cancel', 'Cancel')}
        />
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
          style={styles.keyboardAvoid}
        >
          <View style={styles.sheet}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons
                  name="certificate-outline"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.headerContent}>
                <AppText
                  variant="h2"
                  style={styles.heading}
                >
                  {isEditing
                    ? tSafe(
                        'edit_certification',
                        'Edit Certification'
                      )
                    : tSafe(
                        'add_certification',
                        'Add Certification'
                      )}
                </AppText>

                <AppText
                  variant="caption"
                  style={styles.headerSubtitle}
                >
                  {tSafe(
                    'certification_form_subtitle',
                    'Add your professional certification or license details.'
                  )}
                </AppText>
              </View>

              <TouchableOpacity
                onPress={onClose}
                disabled={isSaving}
                style={styles.closeButton}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Basic Information */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="card-account-details-outline"
                    size={20}
                    color={theme.brand.primary}
                  />

                  <View>
                    <AppText
                      variant="body"
                      style={styles.sectionTitle}
                    >
                      {tSafe(
                        'certification_details',
                        'Certification Details'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={styles.sectionSubtitle}
                    >
                      {tSafe(
                        'certification_details_subtitle',
                        'Provide the name and issuing institution.'
                      )}
                    </AppText>
                  </View>
                </View>

                {/* Certification Name */}
                <View style={styles.fieldContainer}>
                  <TextInput
                    mode="outlined"
                    label={tSafe(
                      'certification_name_label',
                      'Certification / License Name'
                    )}
                    placeholder={tSafe(
                      'certification_name_placeholder',
                      'e.g. Professional Cleaning Certification'
                    )}
                    value={inputs.name}
                    onChangeText={(text) =>
                      handleChange(text, 'name')
                    }
                    onFocus={() =>
                      handleError(null, 'name')
                    }
                    error={Boolean(errors.name)}
                    textColor={theme.input.text}
                    placeholderTextColor={
                      theme.input.placeholder
                    }
                    outlineColor={
                      errors.name
                        ? theme.status.error
                        : theme.input.border
                    }
                    activeOutlineColor={
                      errors.name
                        ? theme.status.error
                        : theme.input.focus
                    }
                    theme={dateInputTheme}
                    style={styles.input}
                  />

                  {renderError(errors.name)}
                </View>

                {/* Institution */}
                <View style={styles.fieldContainer}>
                  <TextInput
                    mode="outlined"
                    label={tSafe(
                      'institution_name_label',
                      'Institution Name'
                    )}
                    placeholder={tSafe(
                      'institution_name_placeholder',
                      'e.g. American Cleaning Institute'
                    )}
                    value={inputs.institution_name}
                    onChangeText={(text) =>
                      handleChange(
                        text,
                        'institution_name'
                      )
                    }
                    onFocus={() =>
                      handleError(
                        null,
                        'institution_name'
                      )
                    }
                    error={Boolean(
                      errors.institution_name
                    )}
                    textColor={theme.input.text}
                    placeholderTextColor={
                      theme.input.placeholder
                    }
                    outlineColor={
                      errors.institution_name
                        ? theme.status.error
                        : theme.input.border
                    }
                    activeOutlineColor={
                      errors.institution_name
                        ? theme.status.error
                        : theme.input.focus
                    }
                    theme={dateInputTheme}
                    style={styles.input}
                  />

                  {renderError(
                    errors.institution_name
                  )}
                </View>
              </View>

              {/* Dates */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="calendar-range-outline"
                    size={20}
                    color={theme.brand.primary}
                  />

                  <View>
                    <AppText
                      variant="body"
                      style={styles.sectionTitle}
                    >
                      {tSafe(
                        'certification_dates',
                        'Certification Dates'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={styles.sectionSubtitle}
                    >
                      {tSafe(
                        'certification_dates_subtitle',
                        'Tell us when your certification started and expires.'
                      )}
                    </AppText>
                  </View>
                </View>

                {renderDateInput({
                  label: tSafe(
                    'start_date_label',
                    'Start Date'
                  ),
                  value: inputs.startDate,
                  pickerOpen: showStartDatePicker,
                  setPickerOpen:
                    setShowStartDatePicker,
                  field: 'startDate',
                  pickerTitle: tSafe(
                    'select_start_date',
                    'Select Start Date'
                  ),
                })}

                {renderDateInput({
                  label: tSafe(
                    'end_date_label',
                    'End Date'
                  ),
                  value: inputs.endDate,
                  pickerOpen: showEndDatePicker,
                  setPickerOpen:
                    setShowEndDatePicker,
                  field: 'endDate',
                  pickerTitle: tSafe(
                    'select_end_date',
                    'Select End Date'
                  ),
                  minimumDate: inputs.startDate,
                })}

                {renderDateInput({
                  label: tSafe(
                    'expiry_date_label',
                    'Expiry Date'
                  ),
                  value: inputs.expiryDate,
                  pickerOpen: showExpiryDatePicker,
                  setPickerOpen:
                    setShowExpiryDatePicker,
                  field: 'expiryDate',
                  pickerTitle: tSafe(
                    'select_expiry_date',
                    'Select Expiry Date'
                  ),
                  minimumDate: inputs.startDate,
                })}
              </View>

              {/* Credential */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="link-variant"
                    size={20}
                    color={theme.brand.primary}
                  />

                  <View>
                    <AppText
                      variant="body"
                      style={styles.sectionTitle}
                    >
                      {tSafe(
                        'credential_information',
                        'Credential Information'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={styles.sectionSubtitle}
                    >
                      {tSafe(
                        'credential_information_subtitle',
                        'Optionally provide a link where your credential can be verified.'
                      )}
                    </AppText>
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <TextInput
                    mode="outlined"
                    label={tSafe(
                      'credential_url_label',
                      'Credential URL'
                    )}
                    placeholder={tSafe(
                      'credential_url_placeholder',
                      'https://example.com/credential'
                    )}
                    value={inputs.credentialUrl}
                    onChangeText={(text) =>
                      handleChange(
                        text,
                        'credentialUrl'
                      )
                    }
                    onFocus={() =>
                      handleError(
                        null,
                        'credentialUrl'
                      )
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    error={Boolean(
                      errors.credentialUrl
                    )}
                    textColor={theme.input.text}
                    placeholderTextColor={
                      theme.input.placeholder
                    }
                    outlineColor={
                      errors.credentialUrl
                        ? theme.status.error
                        : theme.input.border
                    }
                    activeOutlineColor={
                      errors.credentialUrl
                        ? theme.status.error
                        : theme.input.focus
                    }
                    theme={dateInputTheme}
                    style={styles.input}
                    right={
                      hasCredentialUrl ? (
                        <TextInput.Icon
                          icon="check-circle-outline"
                          color={theme.status.success}
                        />
                      ) : null
                    }
                  />

                  {renderError(
                    errors.credentialUrl
                  )}
                </View>

                <View style={styles.infoCard}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={18}
                    color={theme.icon.active}
                  />

                  <AppText
                    variant="caption"
                    style={styles.infoText}
                  >
                    {tSafe(
                      'credential_privacy',
                      'Only provide a credential link that you are comfortable sharing with your profile.'
                    )}
                  </AppText>
                </View>
              </View>

              {/* Bottom spacing */}
              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSaving}
                activeOpacity={0.8}
                style={styles.cancelButton}
              >
                <AppText
                  variant="body"
                  style={styles.cancelButtonText}
                >
                  {tSafe('cancel', 'Cancel')}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSubmit}
                disabled={isSaving}
                activeOpacity={0.8}
                style={[
                  styles.saveButton,
                  isSaving &&
                    styles.saveButtonDisabled,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.button.primaryText}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      isEditing
                        ? 'content-save-outline'
                        : 'plus-circle-outline'
                    }
                    size={19}
                    color={theme.button.primaryText}
                  />
                )}

                <AppText
                  variant="body"
                  style={styles.saveButtonText}
                >
                  {isSaving
                    ? tSafe(
                        'saving',
                        'Saving...'
                      )
                    : isEditing
                    ? tSafe(
                        'save_changes',
                        'Save Changes'
                      )
                    : tSafe(
                        'add_certification',
                        'Add Certification'
                      )}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const windowHeight = Dimensions.get('window').height;

const createStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },

    keyboardAvoid: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    sheet: {
      maxHeight: windowHeight * 0.92,
      backgroundColor: theme.surface.elevated,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.card.border,
      shadowColor: theme.shadow?.color || '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity:
        theme.shadow?.opacity ?? 0.12,
      shadowRadius: 12,
      elevation: 10,
    },

    dragHandle: {
      width: 42,
      height: 5,
      borderRadius: 5,
      backgroundColor: theme.border.strong,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 12,
    },

    headerContent: {
      flex: 1,
    },

    heading: {
      color: theme.text.primary,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 3,
    },

    headerSubtitle: {
      color: theme.text.muted,
      fontSize: 12,
      lineHeight: 17,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginLeft: 10,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 18,
    },

    section: {
      marginBottom: 22,
      padding: 16,
      borderRadius: 18,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    sectionTitle: {
      color: theme.text.primary,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    },

    sectionSubtitle: {
      color: theme.text.muted,
      fontSize: 11,
      lineHeight: 16,
    },

    fieldContainer: {
      marginBottom: 12,
    },

    input: {
      backgroundColor: theme.input.background,
      fontSize: 15,
      minHeight: 56,
    },

    errorRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 6,
      paddingHorizontal: 3,
    },

    errorText: {
      flex: 1,
      color: theme.status.error,
      fontSize: 12,
      lineHeight: 17,
      marginLeft: 6,
    },

    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 11,
      marginTop: 2,
      borderRadius: 12,
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    infoText: {
      flex: 1,
      color: theme.text.secondary,
      fontSize: 11,
      lineHeight: 16,
      marginLeft: 8,
    },

    bottomSpacing: {
      height: 20,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom:
        Platform.OS === 'ios' ? 24 : 14,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      backgroundColor: theme.surface.elevated,
    },

    cancelButton: {
      flex: 0.8,
      minHeight: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.secondaryBackground,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    cancelButtonText: {
      color: theme.button.secondaryText,
      fontSize: 14,
      fontWeight: '600',
    },

    saveButton: {
      flex: 1.4,
      minHeight: 50,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.button.primaryBackground,
    },

    saveButtonDisabled: {
      backgroundColor: theme.button.disabledBackground,
    },

    saveButtonText: {
      color: theme.button.primaryText,
      fontSize: 14,
      fontWeight: '700',
    },
  });

export default Certification;