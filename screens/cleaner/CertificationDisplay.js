import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const CertificationDisplay = ({
  certification,
  handleOpenCertification,
  onEditCertification,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const hasCertifications =
    Array.isArray(certification) &&
    certification.length > 0;

  const renderCert = ({ item }) => (
    <TouchableOpacity
      style={styles.certItem}
      onPress={() => onEditCertification(item)}
      activeOpacity={0.7}
    >
      <View style={styles.certLeft}>
        <View style={styles.certIcon}>
          <MaterialCommunityIcons
            name="certificate-outline"
            size={18}
            color={theme.icon.muted}
          />
        </View>

        <View style={styles.certInfo}>
          <AppText
            style={styles.certName}
            numberOfLines={1}
          >
            {item.name}
          </AppText>

          <AppText style={styles.certIssuer}>
            {item.issuer}
          </AppText>
        </View>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={theme.icon.muted}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="certificate-outline"
              size={20}
              color={theme.icon.muted}
            />
          </View>

          <AppText style={styles.title}>
            {tSafe(
              'certifications',
              'Certifications'
            )}
          </AppText>
        </View>

        <TouchableOpacity
          onPress={handleOpenCertification}
          style={styles.editButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={theme.icon.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {hasCertifications ? (
        <FlatList
          data={certification}
          renderItem={renderCert}
          keyExtractor={(item, index) =>
            item._id || index.toString()
          }
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="certificate-outline"
            size={28}
            color={theme.icon.muted}
          />

          <AppText style={styles.emptyText}>
            {tSafe(
              'no_certifications',
              'No certifications added yet'
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
      padding: 6,
      backgroundColor: theme.surface.selected,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginBottom: 16,
    },

    certItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },

    certLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    certIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: theme.surface.selected,
    },

    certInfo: {
      flex: 1,
    },

    certName: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text.primary,
    },

    certIssuer: {
      fontSize: 13,
      color: theme.text.muted,
      marginTop: 2,
    },

    separator: {
      height: 1,
      backgroundColor: theme.divider,
    },

    emptyState: {
      alignItems: 'center',
      paddingVertical: 16,
    },

    emptyText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.text.muted,
      textAlign: 'center',
    },
  });

export default CertificationDisplay;