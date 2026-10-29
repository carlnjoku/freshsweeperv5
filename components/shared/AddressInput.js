import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { geocodeAddress } from '../../utils/geocodeAddress';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const AddressInput = ({
  label,
  value,
  onChange,
  onCoordinatesSet,
  error,
  initialCoordinates,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [coordinates, setCoordinates] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [lastVerifiedAddress, setLastVerifiedAddress] = useState(null);

  const initialLoad = useRef(true);

  /*
   * Initialize with existing coordinates.
   */
  useEffect(() => {
    if (initialCoordinates && initialLoad.current) {
      setCoordinates(initialCoordinates);
      setLastVerifiedAddress(value);
      initialLoad.current = false;
    }
  }, [initialCoordinates, value]);

  /*
   * Reset verification whenever the address changes.
   *
   * This is important because coordinates from the previous
   * address must never remain associated with a new address.
   */
  useEffect(() => {
    if (
      value !== lastVerifiedAddress &&
      lastVerifiedAddress !== null
    ) {
      setCoordinates(null);
      setLastVerifiedAddress(null);
      setVerificationError(null);
    }
  }, [value, lastVerifiedAddress]);

  const hasAddress = Boolean(value?.trim());
  const isVerified =
    Boolean(coordinates) &&
    value === lastVerifiedAddress;

  const handleVerify = async () => {
    const address = value?.trim();

    if (!address) {
      setVerificationError(
        tSafe(
          'address_required',
          'Please enter an address before verifying.'
        )
      );
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const coords = await geocodeAddress(address);

      if (
        !coords ||
        typeof coords.latitude !== 'number' ||
        typeof coords.longitude !== 'number'
      ) {
        throw new Error('Invalid coordinates returned');
      }

      setCoordinates(coords);
      setLastVerifiedAddress(address);

      if (onCoordinatesSet) {
        onCoordinatesSet(coords);
      }
    } catch (err) {
      setCoordinates(null);
      setLastVerifiedAddress(null);

      setVerificationError(
        tSafe(
          'address_verify_failed',
          'Failed to verify this address. Please check the address and try again.'
        )
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddressChange = (text) => {
    onChange(text);

    /*
     * Immediately invalidate the previous verification.
     */
    if (text !== lastVerifiedAddress) {
      setCoordinates(null);
      setLastVerifiedAddress(null);
      setVerificationError(null);
    }
  };

  const handleClearVerification = () => {
    setCoordinates(null);
    setLastVerifiedAddress(null);
    setVerificationError(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.titleContent}>
            <AppText
              variant="body"
              style={styles.title}
            >
              {label ||
                tSafe('address', 'Address')}
            </AppText>

            <AppText
              variant="caption"
              style={styles.subtitle}
            >
              {tSafe(
                'address_verification_subtitle',
                'Enter your address and verify its location.'
              )}
            </AppText>
          </View>
        </View>

        {isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color={theme.status.success}
            />

            <AppText
              variant="caption"
              style={styles.verifiedBadgeText}
            >
              {tSafe('verified', 'Verified')}
            </AppText>
          </View>
        )}
      </View>

      {/* Address Input */}
      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          isVerified && styles.inputContainerVerified,
        ]}
      >
        <TextInput
          placeholder={tSafe(
            'enter_address_manually',
            'Enter address manually'
          )}
          label={label}
          mode="outlined"
          value={value}
          onChangeText={handleAddressChange}
          editable={!isVerifying}
          multiline
          numberOfLines={2}
          textColor={theme.input.text}
          placeholderTextColor={theme.input.placeholder}
          outlineColor={
            error
              ? theme.status.error
              : isVerified
              ? theme.status.success
              : theme.input.border
          }
          activeOutlineColor={
            error
              ? theme.status.error
              : theme.input.focus
          }
          cursorColor={theme.brand.primary}
          selectionColor={theme.brand.primary}
          theme={{
            roundness: 16,
            colors: {
              primary: error
                ? theme.status.error
                : theme.input.focus,
              outline: error
                ? theme.status.error
                : isVerified
                ? theme.status.success
                : theme.input.border,
              background: theme.input.background,
              onSurfaceVariant: theme.input.placeholder,
            },
          }}
          style={styles.input}
        />
      </View>

      {/* Verification Action */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleVerify}
        disabled={isVerifying || !hasAddress}
        style={[
          styles.verifyButton,
          !hasAddress && styles.verifyButtonDisabled,
          isVerifying && styles.verifyButtonDisabled,
          isVerified && styles.verifyButtonVerified,
        ]}
      >
        {isVerifying ? (
          <>
            <ActivityIndicator
              size="small"
              color={theme.button.primaryText}
            />

            <AppText
              variant="body"
              style={styles.verifyButtonText}
            >
              {tSafe(
                'verifying',
                'Verifying address...'
              )}
            </AppText>
          </>
        ) : isVerified ? (
          <>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color={theme.button.primaryText}
            />

            <AppText
              variant="body"
              style={styles.verifyButtonText}
            >
              {tSafe(
                'address_verified',
                'Address Verified'
              )}
            </AppText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name="map-marker-check-outline"
              size={20}
              color={
                hasAddress
                  ? theme.button.primaryText
                  : theme.text.disabled
              }
            />

            <AppText
              variant="body"
              style={[
                styles.verifyButtonText,
                !hasAddress &&
                  styles.verifyButtonTextDisabled,
              ]}
            >
              {tSafe(
                'verify_address',
                'Verify Address'
              )}
            </AppText>
          </>
        )}
      </TouchableOpacity>

      {/* Verified Location */}
      {isVerified && coordinates && (
        <View style={styles.verifiedCard}>
          <View style={styles.verifiedIconContainer}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={22}
              color={theme.status.success}
            />
          </View>

          <View style={styles.verifiedContent}>
            <AppText
              variant="body"
              style={styles.verifiedTitle}
            >
              {tSafe(
                'verified_location',
                'Verified Location'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={styles.coordinatesText}
            >
              {coordinates.latitude.toFixed(5)},{' '}
              {coordinates.longitude.toFixed(5)}
            </AppText>

            <AppText
              variant="caption"
              style={styles.verifiedDescription}
            >
              {tSafe(
                'address_verified_description',
                'This address has been successfully matched to a map location.'
              )}
            </AppText>
          </View>

          <TouchableOpacity
            onPress={handleClearVerification}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={theme.icon.muted}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Verification Error */}
      {verificationError && (
        <View style={styles.messageCardError}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={theme.status.error}
          />

          <AppText
            variant="caption"
            style={styles.errorText}
          >
            {verificationError}
          </AppText>
        </View>
      )}

      {/* Parent Validation Error */}
      {error && (
        <View style={styles.messageCardError}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={theme.status.error}
          />

          <AppText
            variant="caption"
            style={styles.errorText}
          >
            {error}
          </AppText>
        </View>
      )}

      {/* Helper */}
      {!isVerified &&
        !verificationError &&
        !error && (
          <View style={styles.helperContainer}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={theme.icon.muted}
            />

            <AppText
              variant="caption"
              style={styles.helperText}
            >
              {tSafe(
                'address_verification_help',
                'Your address must be verified before it can be used for scheduling and cleaner matching.'
              )}
            </AppText>
          </View>
        )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: 20,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },

    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 10,
    },

    titleContent: {
      flex: 1,
    },

    title: {
      color: theme.text.primary,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },

    subtitle: {
      color: theme.text.muted,
      fontSize: 12,
      lineHeight: 17,
    },

    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: `${theme.status.success}15`,
      marginLeft: 8,
    },

    verifiedBadgeText: {
      color: theme.status.success,
      fontWeight: '600',
      marginLeft: 4,
      fontSize: 11,
    },

    inputContainer: {
      borderRadius: 16,
    },

    inputContainerError: {
      borderRadius: 16,
    },

    inputContainerVerified: {
      borderRadius: 16,
    },

    input: {
      backgroundColor: theme.input.background,
      fontSize: 14,
      minHeight: 58,
      paddingHorizontal: 2,
    },

    verifyButton: {
      minHeight: 48,
      borderRadius: 14,
      marginTop: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.primaryBackground,
      gap: 8,
    },

    verifyButtonDisabled: {
      backgroundColor: theme.button.disabledBackground,
    },

    verifyButtonVerified: {
      backgroundColor: theme.status.success,
    },

    verifyButtonText: {
      color: theme.button.primaryText,
      fontWeight: '600',
      fontSize: 14,
    },

    verifyButtonTextDisabled: {
      color: theme.text.disabled,
    },

    verifiedCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 12,
      padding: 13,
      borderRadius: 14,
      backgroundColor: `${theme.status.success}10`,
      borderWidth: 1,
      borderColor: `${theme.status.success}30`,
    },

    verifiedIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.status.success}18`,
      marginRight: 10,
    },

    verifiedContent: {
      flex: 1,
    },

    verifiedTitle: {
      color: theme.status.success,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },

    coordinatesText: {
      color: theme.text.secondary,
      fontSize: 12,
      fontFamily: 'monospace',
      marginBottom: 3,
    },

    verifiedDescription: {
      color: theme.text.muted,
      fontSize: 11,
      lineHeight: 16,
    },

    clearButton: {
      padding: 4,
      marginLeft: 6,
    },

    messageCardError: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 9,
      paddingHorizontal: 4,
    },

    errorText: {
      flex: 1,
      color: theme.status.error,
      fontSize: 12,
      lineHeight: 17,
      marginLeft: 7,
    },

    helperContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 9,
      paddingHorizontal: 3,
    },

    helperText: {
      flex: 1,
      color: theme.text.muted,
      fontSize: 11,
      lineHeight: 16,
      marginLeft: 6,
    },
  });

export default AddressInput;