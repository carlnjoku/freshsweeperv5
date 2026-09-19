// components/host/HostCertificationDisplay.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const HostCertificationDisplay = ({ certification }) => {
  const certs = Array.isArray(certification)
    ? certification
    : certification
      ? [certification]
      : [];

  const validCerts = certs.filter(
    cert =>
      cert &&
      typeof cert === 'object' &&
      (cert.name || cert.issuedBy || cert.year)
  );

  const sectionTitle = tSafe(
    'certifications_license',
    'Certifications & License'
  );

  if (validCerts.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="certificate-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.titleContent}>
              <Text style={styles.title}>{sectionTitle}</Text>

              <Text style={styles.subtitle}>
                Professional credentials
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name="certificate-outline"
              size={34}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            {tSafe(
              'no_certifications_title',
              'No Certifications Yet'
            )}
          </Text>

          <Text style={styles.emptySubtitle}>
            {tSafe(
              'no_certifications',
              'This cleaner has not added any certifications or licenses yet.'
            )}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="certificate-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.titleContent}>
            <Text style={styles.title}>{sectionTitle}</Text>

            <Text style={styles.subtitle}>
              Professional credentials
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {validCerts.length}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {validCerts.map((item, index) => {
          const isLast = index === validCerts.length - 1;

          return (
            <View
              key={`${item.name || 'certification'}-${index}`}
              style={[
                styles.certification,
                !isLast && styles.certificationBorder,
              ]}
            >
              <View style={styles.certIcon}>
                <MaterialCommunityIcons
                  name="certificate-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.certContent}>
                <Text
                  style={styles.certName}
                  numberOfLines={2}
                >
                  {item.name ||
                    tSafe(
                      'uncertified',
                      'Certification'
                    )}
                </Text>

                {item.issuedBy && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="office-building-outline"
                      size={14}
                      color={COLORS.textSecondary}
                    />

                    <Text
                      style={styles.detailText}
                      numberOfLines={1}
                    >
                      {item.issuedBy}
                    </Text>
                  </View>
                )}

                {item.year && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={14}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.detailText}>
                      {item.year}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.credentialBadge}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },

  header: {
    paddingHorizontal: 1,
    paddingTop: 2,
    paddingBottom: 14,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  titleContent: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  list: {
    paddingHorizontal: 2,
  },

  certification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 72,
  },

  certificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },

  certIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primary + '08',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  certContent: {
    flex: 1,
    paddingRight: 10,
  },

  certName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  detailText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  credentialBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default HostCertificationDisplay;
