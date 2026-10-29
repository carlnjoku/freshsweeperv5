import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const ContactDisplay = ({
  contact,
  handleOpenContact,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleOpenMaps = () => {
    if (contact?.address) {
      const encodedAddress =
        encodeURIComponent(contact.address);

      Linking.openURL(
        `https://maps.google.com/?q=${encodedAddress}`
      );
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  const hasContactInfo =
    contact?.address ||
    contact?.phone ||
    contact?.email;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={20}
              color={theme.icon.muted}
            />
          </View>

          <AppText style={styles.title}>
            {tSafe(
              'contact_information',
              'Contact Information'
            )}
          </AppText>
        </View>

        <TouchableOpacity
          onPress={handleOpenContact}
          style={styles.editButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={theme.icon.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {hasContactInfo ? (
        <View style={styles.content}>
          {/* Address */}
          {contact?.address && (
            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenMaps}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color={theme.icon.muted}
                />
              </View>

              <View style={styles.textWrapper}>
                <AppText style={styles.label}>
                  {tSafe('address', 'Address')}
                </AppText>

                <AppText
                  style={styles.value}
                  numberOfLines={1}
                >
                  {contact.address}
                </AppText>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.icon.muted}
              />
            </TouchableOpacity>
          )}

          {/* Phone */}
          {contact?.phone && (
            <TouchableOpacity
              style={styles.row}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color={theme.icon.muted}
                />
              </View>

              <View style={styles.textWrapper}>
                <AppText style={styles.label}>
                  {tSafe('phone', 'Phone')}
                </AppText>

                <AppText style={styles.value}>
                  {contact.phone}
                </AppText>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.icon.muted}
              />
            </TouchableOpacity>
          )}

          {/* Email */}
          {contact?.email && (
            <TouchableOpacity
              style={styles.row}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={theme.icon.muted}
                />
              </View>

              <View style={styles.textWrapper}>
                <AppText style={styles.label}>
                  {tSafe('email', 'Email')}
                </AppText>

                <AppText
                  style={styles.value}
                  numberOfLines={1}
                >
                  {contact.email}
                </AppText>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.icon.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-edit-outline"
            size={32}
            color={theme.icon.muted}
          />

          <AppText style={styles.emptyText}>
            {tSafe(
              'no_contact_info',
              'No contact info added yet'
            )}
          </AppText>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card.background,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,

      shadowColor:
        theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.05,
      shadowRadius: 8,

      elevation: 3,

      borderWidth: 1,
      borderColor: theme.card.border,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: theme.surface.selected,
    },

    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
    },

    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginBottom: 16,
    },

    content: {
      marginBottom: 4,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: theme.surface.selected,
    },

    textWrapper: {
      flex: 1,
    },

    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },

    value: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text.primary,
    },

    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },

    emptyText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.text.muted,
      textAlign: 'center',
    },
  });

export default ContactDisplay;