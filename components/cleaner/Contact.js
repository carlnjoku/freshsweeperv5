import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { TextInput, Icon } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { geocodeAddress } from '../../utils/geocodeAddress';
import GoogleAutocomplete from '../shared/GooglePlacesAutocomplete';
import AddressInput from '../shared/AddressInput';
import userService from '../../services/connection/userService';

import { tSafe } from '../../utils/tSafe';
import { GOOGLE_MAPS_API_KEY } from '../../env';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const Contact = ({
  contact,
  userId,
  close_modal,
}) => {
  const { theme } = useTheme();

  // ---------------------------------------
  // Address state
  // ---------------------------------------

  const [showGoogleAutocomplete, setShowGoogleAutocomplete] =
    useState(true);

  const [autocompleteError, setAutocompleteError] =
    useState(null);

  const [coordinates, setCoordinates] =
    useState(null);

  // ---------------------------------------
  // Permission state
  // ---------------------------------------

  const [hasPermission, setHasPermission] =
    useState(false);

  const [checkingPermission, setCheckingPermission] =
    useState(false);

  // ---------------------------------------
  // Save state
  // ---------------------------------------

  const [saving, setSaving] = useState(false);

  // ---------------------------------------
  // Inputs
  // ---------------------------------------

  const [inputs, setInputs] = useState({
    address: '',
    phone: '',
    ssn: '',
    longitude: '',
    latitude: '',
    cityLong: '',
    cityShort: '',
    stateLong: '',
    stateShort: '',
    countryLong: '',
    countryShort: '',
    postalCode: '',
    userId: userId,
  });

  const [initialInputs, setInitialInputs] =
    useState(contact || {});

  const [errors, setErrors] = useState({
    address: '',
    phone: '',
    ssn: '',
  });

  const [isBeforeSave, setIsBeforeSave] =
    useState(true);

  const [responseMessage, setResponseMessage] =
    useState('');

  const styles = createStyles(theme);

  // ---------------------------------------
  // Request location permission
  // ---------------------------------------

  const requestLocationPermission = async () => {
    setCheckingPermission(true);

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setHasPermission(true);
        return true;
      }

      setHasPermission(false);

      Alert.alert(
        tSafe(
          'permission_required',
          'Permission required'
        ),
        tSafe(
          'location_permission_needed',
          'Location access is needed to verify addresses.'
        )
      );

      return false;
    } catch (error) {
      console.error(
        'Permission request error:',
        error
      );

      setHasPermission(false);

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'permission_request_failed',
          'Could not request location permission. Please enable it in settings.'
        )
      );

      return false;
    } finally {
      setCheckingPermission(false);
    }
  };

  // ---------------------------------------
  // Request permission on mount
  // ---------------------------------------

  useEffect(() => {
    requestLocationPermission().catch((error) => {
      console.error(
        'Permission request on mount failed:',
        error
      );

      setHasPermission(false);
      setCheckingPermission(false);
    });
  }, []);

  // ---------------------------------------
  // Sync contact data
  // ---------------------------------------

  useEffect(() => {
    const normalizedContact = {
      address: contact?.address || '',
      phone: contact?.phone || '',
      ssn: contact?.ssn || '',
      longitude: contact?.longitude || '',
      latitude: contact?.latitude || '',
      cityLong: contact?.cityLong || '',
      cityShort: contact?.cityShort || '',
      stateLong: contact?.stateLong || '',
      stateShort: contact?.stateShort || '',
      countryLong: contact?.countryLong || '',
      countryShort: contact?.countryShort || '',
      postalCode: contact?.postalCode || '',
      userId,
    };

    setInputs(normalizedContact);
    setInitialInputs(normalizedContact);

    if (
      contact?.latitude !== undefined &&
      contact?.latitude !== null &&
      contact?.longitude !== undefined &&
      contact?.longitude !== null
    ) {
      setCoordinates({
        latitude: Number(contact.latitude),
        longitude: Number(contact.longitude),
      });
    } else {
      setCoordinates(null);
    }
  }, [contact, userId]);

  // ---------------------------------------
  // Address selected from Google
  // ---------------------------------------

  const handleSelectedAddress = async (
    selectedAddress
  ) => {
    try {
      const {
        latitude,
        longitude,
        cityLong,
        cityShort,
        stateLong,
        stateShort,
        countryLong,
        countryShort,
        postalCode,
      } = await geocodeAddress(selectedAddress);

      setCoordinates({
        latitude,
        longitude,
      });

      setInputs((prev) => ({
        ...prev,
        address: selectedAddress,
        latitude,
        longitude,
        cityLong,
        cityShort,
        stateLong,
        stateShort,
        countryLong,
        countryShort,
        postalCode,
      }));

      setAutocompleteError(null);

      setErrors((prev) => ({
        ...prev,
        address: null,
      }));
    } catch (error) {
      console.error(
        'Geocoding failed:',
        error
      );

      setCoordinates(null);

      setAutocompleteError(
        tSafe(
          'failed_verify_address',
          'Failed to verify address. Please enter manually.'
        )
      );

      setShowGoogleAutocomplete(false);
    }
  };

  // ---------------------------------------
  // Manual address
  // ---------------------------------------

  const handleManualAddressChange = (value) => {
    setInputs((prev) => ({
      ...prev,
      address: value,
    }));

    setCoordinates(null);

    setErrors((prev) => ({
      ...prev,
      address: null,
    }));

    setAutocompleteError(null);
  };

  // ---------------------------------------
  // Manual address verification
  // ---------------------------------------

  const handleManualVerification = (coords) => {
    if (
      !coords ||
      coords.latitude === undefined ||
      coords.longitude === undefined
    ) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'could_not_verify_address',
          'Could not verify address. Please check the address and try again.'
        )
      );

      return;
    }

    setCoordinates(coords);

    setInputs((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));

    setErrors((prev) => ({
      ...prev,
      address: null,
    }));

    setAutocompleteError(null);
  };

  // ---------------------------------------
  // Phone formatting
  // ---------------------------------------

  const formatPhoneNumber = (input) => {
    const cleaned = String(input)
      .replace(/\D/g, '')
      .slice(0, 10);

    if (cleaned.length === 10) {
      return `(${cleaned.slice(
        0,
        3
      )}) ${cleaned.slice(
        3,
        6
      )}-${cleaned.slice(6, 10)}`;
    }

    return input;
  };

  const handleInputChange = (
    text,
    input
  ) => {
    setInputs((prev) => ({
      ...prev,
      [input]:
        input === 'phone'
          ? formatPhoneNumber(text)
          : text,
    }));

    if (errors[input]) {
      setErrors((prev) => ({
        ...prev,
        [input]: null,
      }));
    }
  };

  const handleError = (
    error,
    input
  ) => {
    setErrors((prev) => ({
      ...prev,
      [input]: error,
    }));
  };

  // ---------------------------------------
  // Validation
  // ---------------------------------------

  const validate = () => {
    let isValid = true;

    const phonePattern =
      /^\(\d{3}\) \d{3}-\d{4}$/;

    if (!inputs.phone) {
      handleError(
        tSafe(
          'phone_required',
          'Phone number is required'
        ),
        'phone'
      );

      isValid = false;
    } else if (
      !phonePattern.test(inputs.phone)
    ) {
      handleError(
        tSafe(
          'invalid_phone_format',
          'Invalid phone number format (e.g., (123) 456-7890)'
        ),
        'phone'
      );

      isValid = false;
    }

    if (!inputs.address) {
      handleError(
        tSafe(
          'address_required',
          'Address is required'
        ),
        'address'
      );

      isValid = false;
    } else if (!coordinates) {
      handleError(
        tSafe(
          'address_verify_required',
          'Please verify your address'
        ),
        'address'
      );

      isValid = false;
    }

    if (isValid) {
      onSubmit();
    }
  };

  // ---------------------------------------
  // Submit
  // ---------------------------------------

  const onSubmit = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const data = {
        userId,
        address: inputs.address,
        phone: inputs.phone,
        ssn: inputs.ssn,
        latitude: inputs.latitude,
        longitude: inputs.longitude,
        cityLong: inputs.cityLong,
        cityShort: inputs.cityShort,
        stateLong: inputs.stateLong,
        stateShort: inputs.stateShort,
        countryLong: inputs.countryLong,
        countryShort: inputs.countryShort,
        postalCode: inputs.postalCode,
      };

      const response =
        await userService.updateCleanerContact(
          data
        );

      if (response.status === 200) {
        setIsBeforeSave(false);

        setResponseMessage(
          response?.data?.message ||
            tSafe(
              'contact_updated',
              'Your contact information has been updated successfully.'
            )
        );
      } else {
        Alert.alert(
          tSafe(
            'error_title',
            'Oops!'
          ),
          tSafe(
            'something_went_wrong',
            'Something went wrong, try again'
          )
        );
      }
    } catch (error) {
      console.error(
        'Update contact error:',
        error
      );

      Alert.alert(
        tSafe(
          'error_title',
          'Oops!'
        ),
        tSafe(
          'something_went_wrong',
          'Something went wrong, try again'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Unsaved changes
  // ---------------------------------------

  const hasUnsavedChanges = () => {
    return (
      JSON.stringify(inputs) !==
      JSON.stringify(initialInputs)
    );
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        tSafe(
          'unsaved_changes_title',
          'Unsaved Changes'
        ),
        tSafe(
          'unsaved_changes_message',
          'You have unsaved changes. Are you sure you want to discard them?'
        ),
        [
          {
            text: tSafe(
              'cancel',
              'Cancel'
            ),
            style: 'cancel',
          },
          {
            text: tSafe(
              'discard',
              'Discard'
            ),
            style: 'destructive',
            onPress: () =>
              close_modal(false),
          },
        ]
      );
    } else {
      close_modal(false);
    }
  };

  const onClose = () => {
    close_modal(false);
  };

  // ---------------------------------------
  // Google autocomplete errors
  // ---------------------------------------

  const handleAutocompleteError = (
    error
  ) => {
    if (
      error === 'ZERO_RESULTS' ||
      error === 'REQUEST_DENIED' ||
      error === 'INVALID_REQUEST' ||
      error === 'UNKNOWN_ERROR'
    ) {
      setAutocompleteError(
        tSafe(
          'address_service_unavailable',
          'Address service unavailable. Please enter manually.'
        )
      );

      setShowGoogleAutocomplete(false);
    }
  };

  // ---------------------------------------
  // Address UI
  // ---------------------------------------

  const renderAddressInputs = () => (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={20}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.sectionHeaderText}>
          <AppText style={styles.sectionTitle}>
            {tSafe(
              'address_information',
              'Address Information'
            )}
          </AppText>

          <AppText style={styles.sectionSubtitle}>
            {tSafe(
              'address_information_description',
              'Your address helps us verify your service area.'
            )}
          </AppText>
        </View>
      </View>

      {showGoogleAutocomplete && (
        <View style={styles.addressInputWrapper}>
          <GoogleAutocomplete
            label={tSafe(
              'property_address_label',
              'Property Address'
            )}
            apiKey={GOOGLE_MAPS_API_KEY}
            selected_address={
              handleSelectedAddress
            }
            handleError={
              handleAutocompleteError
            }
          />
        </View>
      )}

      {!showGoogleAutocomplete && (
        <View style={styles.addressInputWrapper}>
          <AddressInput
            label={tSafe(
              'property_address_label',
              'Property Address'
            )}
            value={inputs.address}
            onChange={
              handleManualAddressChange
            }
            onCoordinatesSet={
              handleManualVerification
            }
            error={errors.address}
          />
        </View>
      )}

      {/* Verified address */}
      {coordinates && (
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedIcon}>
            <MaterialCommunityIcons
              name="check"
              size={16}
              color={theme.status.success}
            />
          </View>

          <View style={styles.verifiedContent}>
            <AppText style={styles.verifiedTitle}>
              {tSafe(
                'address_verified',
                'Address verified'
              )}
            </AppText>

            <AppText
              style={styles.verifiedText}
              numberOfLines={2}
            >
              {inputs.address}
            </AppText>
          </View>
        </View>
      )}

      {/* Permission warning */}
      {!hasPermission && (
        <View style={styles.permissionWarningContainer}>
          <View style={styles.warningIcon}>
            <Icon
              source="alert-circle-outline"
              size={20}
              color={theme.status.warning}
            />
          </View>

          <View style={styles.permissionContent}>
            <AppText
              style={styles.permissionTitle}
            >
              {tSafe(
                'location_permission_required',
                'Location permission required'
              )}
            </AppText>

            <AppText
              style={styles.permissionWarningText}
            >
              {tSafe(
                'location_permission_required',
                'Location permission is required for address verification.'
              )}
            </AppText>
          </View>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              const granted =
                await requestLocationPermission();

              if (!granted) {
                Alert.alert(
                  tSafe(
                    'permission_denied',
                    'Permission Denied'
                  ),
                  tSafe(
                    'permission_denied_message',
                    'You can enable location in your device settings.'
                  )
                );
              }
            }}
            disabled={checkingPermission}
            activeOpacity={0.75}
          >
            {checkingPermission ? (
              <ActivityIndicator
                size="small"
                color={
                  theme.button.primaryText
                }
              />
            ) : (
              <AppText
                style={styles.retryButtonText}
              >
                {tSafe(
                  'retry',
                  'Retry'
                )}
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      )}

      {autocompleteError &&
        !showGoogleAutocomplete &&
        !coordinates && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={16}
              color={theme.status.error}
            />

            <AppText style={styles.errorText}>
              {autocompleteError}
            </AppText>
          </View>
        )}

      {errors.address &&
        !coordinates && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={16}
              color={theme.status.error}
            />

            <AppText style={styles.errorText}>
              {errors.address}
            </AppText>
          </View>
        )}
    </View>
  );

  // ---------------------------------------
  // Main render
  // ---------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.modalContent}>
          {isBeforeSave ? (
            <>
              {/* =========================
                  HEADER
              ========================= */}

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <MaterialCommunityIcons
                      name="card-account-details-outline"
                      size={25}
                      color={
                        theme.brand.primary
                      }
                    />
                  </View>

                  <View style={styles.headerText}>
                    <AppText
                      style={styles.heading}
                    >
                      {tSafe(
                        'edit_contact_info',
                        'Edit Your Contact Info'
                      )}
                    </AppText>

                    <AppText
                      style={styles.headerSubtitle}
                    >
                      {tSafe(
                        'contact_info_subtitle',
                        'Keep your contact details up to date.'
                      )}
                    </AppText>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={
                    handleCloseModal
                  }
                  disabled={saving}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={
                      saving
                        ? theme.text.disabled
                        : theme.icon.default
                    }
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={
                  styles.scrollContent
                }
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
              >
                {/* Address */}
                {renderAddressInputs()}

                {/* Divider */}
                <View style={styles.sectionDivider} />

                {/* Phone section */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={20}
                      color={
                        theme.brand.primary
                      }
                    />
                  </View>

                  <View
                    style={styles.sectionHeaderText}
                  >
                    <AppText
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'contact_details',
                        'Contact Details'
                      )}
                    </AppText>

                    <AppText
                      style={
                        styles.sectionSubtitle
                      }
                    >
                      {tSafe(
                        'contact_details_description',
                        'We use this number to contact you about your cleaning jobs.'
                      )}
                    </AppText>
                  </View>
                </View>

                <TextInput
                  label={tSafe(
                    'mobile_phone_label',
                    'Mobile Phone'
                  )}
                  placeholder={tSafe(
                    'mobile_phone_placeholder',
                    'Mobile Phone'
                  )}
                  mode="outlined"
                  value={inputs.phone}
                  onChangeText={(text) =>
                    handleInputChange(
                      text,
                      'phone'
                    )
                  }
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() =>
                    handleError(
                      null,
                      'phone'
                    )
                  }
                  error={!!errors.phone}
                  textColor={
                    theme.input.text
                  }
                  outlineColor={
                    errors.phone
                      ? theme.status.error
                      : theme.input.border
                  }
                  activeOutlineColor={
                    errors.phone
                      ? theme.status.error
                      : theme.input.focus
                  }
                  placeholderTextColor={
                    theme.input.placeholder
                  }
                  theme={{
                    roundness: 16,
                    colors: {
                      primary:
                        errors.phone
                          ? theme.status.error
                          : theme.input.focus,
                      outline:
                        errors.phone
                          ? theme.status.error
                          : theme.input.border,
                      background:
                        theme.input.background,
                      text:
                        theme.input.text,
                      placeholder:
                        theme.input.placeholder,
                    },
                  }}
                  style={
                    styles.phoneInput
                  }
                  right={
                    inputs.phone &&
                    !errors.phone ? (
                      <TextInput.Icon
                        icon="check-circle"
                        color={
                          theme.status.success
                        }
                      />
                    ) : null
                  }
                />

                {errors.phone && (
                  <View
                    style={
                      styles.errorContainer
                    }
                  >
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={16}
                      color={
                        theme.status.error
                      }
                    />

                    <AppText
                      style={
                        styles.errorText
                      }
                    >
                      {errors.phone}
                    </AppText>
                  </View>
                )}

                {/* Privacy note */}
                <View style={styles.privacyNote}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={18}
                    color={
                      theme.icon.muted
                    }
                  />

                  <AppText
                    style={
                      styles.privacyText
                    }
                  >
                    {tSafe(
                      'contact_privacy_note',
                      'Your contact information is kept private and used only to support your Freshsweeper account.'
                    )}
                  </AppText>
                </View>
              </ScrollView>

              {/* =========================
                  FOOTER
              ========================= */}

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={
                    handleCloseModal
                  }
                  disabled={saving}
                  activeOpacity={0.75}
                >
                  <AppText
                    style={
                      styles.cancelButtonText
                    }
                  >
                    {tSafe(
                      'cancel',
                      'Cancel'
                    )}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                  onPress={validate}
                  disabled={saving}
                  activeOpacity={0.75}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        theme.button.primaryText
                      }
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="content-save-outline"
                        size={19}
                        color={
                          theme.button.primaryText
                        }
                      />

                      <AppText
                        style={
                          styles.saveButtonText
                        }
                      >
                        {tSafe(
                          'save',
                          'Save'
                        )}
                      </AppText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* =========================
               SUCCESS STATE
            ========================= */

            <View
              style={styles.successResponse}
            >
              <View
                style={styles.successIconContainer}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={42}
                  color={
                    theme.status.success
                  }
                />
              </View>

              <AppText
                style={styles.successTitle}
              >
                {tSafe(
                  'contact_updated_title',
                  'Contact Information Updated'
                )}
              </AppText>

              <AppText
                style={styles.successMessage}
              >
                {responseMessage ||
                  tSafe(
                    'contact_updated',
                    'Your contact information has been updated successfully.'
                  )}
              </AppText>

              <View
                style={styles.successSummary}
              >
                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={19}
                    color={
                      theme.icon.default
                    }
                  />

                  <AppText
                    style={
                      styles.summaryText
                    }
                    numberOfLines={2}
                  >
                    {inputs.address}
                  </AppText>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={19}
                    color={
                      theme.icon.default
                    }
                  />

                  <AppText
                    style={
                      styles.summaryText
                    }
                  >
                    {inputs.phone}
                  </AppText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={onClose}
                activeOpacity={0.75}
              >
                <AppText
                  style={
                    styles.continueButtonText
                  }
                >
                  {tSafe(
                    'continue',
                    'Continue'
                  )}
                </AppText>

                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={
                    theme.button.primaryText
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ======================================================
// STYLES
// ======================================================

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    keyboardContainer: {
      flex: 1,
    },

    modalContent: {
      flex: 1,
      backgroundColor:
        theme.surface.elevated,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',

      borderWidth: 1,
      borderColor:
        theme.card.border,

      shadowColor:
        theme.shadow?.color ||
        '#000000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity:
        theme.shadow?.opacity ||
        0.12,
      shadowRadius: 16,
      elevation: 8,
    },

    // ---------------------------------------
    // Header
    // ---------------------------------------

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 12,
    },

    headerText: {
      flex: 1,
    },

    heading: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 3,
    },

    headerSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      marginLeft: 10,
    },

    // ---------------------------------------
    // Scroll
    // ---------------------------------------

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 25,
    },

    // ---------------------------------------
    // Sections
    // ---------------------------------------

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },

    sectionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 11,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 2,
    },

    sectionSubtitle: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
    },

    sectionDivider: {
      height: 1,
      backgroundColor:
        theme.divider,
      marginVertical: 24,
    },

    addressInputWrapper: {
      zIndex: 20,
    },

    // ---------------------------------------
    // Address Verification
    // ---------------------------------------

    verifiedContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      marginTop: 10,
      borderRadius: 14,
      backgroundColor:
        theme.status.success +
        '12',
      borderWidth: 1,
      borderColor:
        theme.status.success +
        '35',
    },

    verifiedIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.success +
        '20',
      marginRight: 10,
    },

    verifiedContent: {
      flex: 1,
    },

    verifiedTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.status.success,
      marginBottom: 2,
    },

    verifiedText: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    // ---------------------------------------
    // Permission
    // ---------------------------------------

    permissionWarningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        theme.status.warning +
        '12',
      borderWidth: 1,
      borderColor:
        theme.status.warning +
        '35',
    },

    warningIcon: {
      marginRight: 9,
    },

    permissionContent: {
      flex: 1,
    },

    permissionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 2,
    },

    permissionWarningText: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
    },

    retryButton: {
      minWidth: 58,
      height: 34,
      paddingHorizontal: 12,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryBackground,
      marginLeft: 8,
    },

    retryButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.button.primaryText,
    },

    // ---------------------------------------
    // Errors
    // ---------------------------------------

    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 7,
      paddingHorizontal: 2,
    },

    errorText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: theme.status.error,
      marginLeft: 6,
    },

    // ---------------------------------------
    // Phone
    // ---------------------------------------

    phoneInput: {
      width: '100%',
      marginBottom: 4,
      backgroundColor:
        theme.input.background,
    },

    // ---------------------------------------
    // Privacy
    // ---------------------------------------

    privacyNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 14,
      padding: 12,
      borderRadius: 13,
      backgroundColor:
        theme.surface.selected,
    },

    privacyText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.muted,
      marginLeft: 8,
    },

    // ---------------------------------------
    // Footer
    // ---------------------------------------

    footer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 13,
      paddingBottom:
        Platform.OS === 'ios'
          ? 20
          : 14,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      backgroundColor:
        theme.surface.elevated,
    },

    cancelButton: {
      flex: 0.85,
      minHeight: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      marginRight: 7,
    },

    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },

    saveButton: {
      flex: 1.15,
      minHeight: 50,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryBackground,
      marginLeft: 7,
      gap: 7,
    },

    saveButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primaryText,
    },

    disabledButton: {
      opacity: 0.55,
    },

    // ---------------------------------------
    // Success
    // ---------------------------------------

    successResponse: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 30,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.surface.elevated,
    },

    successIconContainer: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.success +
        '15',
      borderWidth: 1,
      borderColor:
        theme.status.success +
        '30',
      marginBottom: 22,
    },

    successTitle: {
      fontSize: 21,
      fontWeight: '700',
      textAlign: 'center',
      color: theme.text.primary,
      marginBottom: 9,
    },

    successMessage: {
      maxWidth: 330,
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
      color: theme.text.secondary,
      marginBottom: 22,
    },

    successSummary: {
      width: '100%',
      maxWidth: 360,
      padding: 15,
      borderRadius: 16,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      marginBottom: 24,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
    },

    summaryText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: theme.text.secondary,
      marginLeft: 10,
    },

    continueButton: {
      width: '100%',
      maxWidth: 360,
      minHeight: 52,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryBackground,
      gap: 8,
    },

    continueButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primaryText,
    },
  });

export default Contact;