// screens/cleaner/TaxDocuments.js

import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import userService from '../../../services/connection/userService';

import { useTheme } from '../../../theme';
import AppText from '../../../ui/AppText';

const TaxDocuments = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const styles = createStyles(theme);

  const [payoutData, setPayoutData] = useState(null);
  const [taxReportingData, setTaxReportingData] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [openingStripe, setOpeningStripe] =
    useState(false);
  const [requestingTax, setRequestingTax] =
    useState(false);

  /**
   * ---------------------------------------------------------
   * FETCH GENERAL STRIPE ACCOUNT INFORMATION
   * ---------------------------------------------------------
   *
   * This is NOT the authoritative source for tax reporting.
   *
   * It is used only for general Stripe account/payout status.
   */
  const fetchPayoutInformation = async () => {
    try {
      const response =
        await userService.getCleanerPayoutSettings();

      const data =
        response?.data ||
        response ||
        {};

      setPayoutData(data);
    } catch (error) {
      console.error(
        'Error fetching Stripe account information:',
        error
      );

      setPayoutData({});
    }
  };

  /**
   * ---------------------------------------------------------
   * FETCH TAX REPORTING STATUS
   * ---------------------------------------------------------
   *
   * Backend:
   *
   * GET /api/stripes/tax-reporting-status
   *
   * This is the authoritative source for:
   *
   * - tax reporting capability
   * - tax information status
   * - whether action is required
   * - Stripe requirements
   *
   * We intentionally do NOT expose:
   *
   * - SSN
   * - TIN
   * - EIN
   * - full tax identity information
   */
  const fetchTaxStatus = async () => {
    try {
      const response =
        await userService.getTaxReportingStatus();

      const data =
        response?.data ||
        response ||
        {};

      setTaxReportingData(data);
    } catch (error) {
      console.error(
        'Error fetching tax reporting status:',
        error
      );

      setTaxReportingData(null);
    }
  };

  /**
   * ---------------------------------------------------------
   * LOAD TAX CENTER
   * ---------------------------------------------------------
   */
  const fetchTaxInformation = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchPayoutInformation(),
        fetchTaxStatus(),
      ]);
    } catch (error) {
      console.error(
        'Error loading Tax Center:',
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTaxInformation();
    }, [])
  );

  /**
   * ---------------------------------------------------------
   * REFRESH
   * ---------------------------------------------------------
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTaxInformation();
  };

  /**
   * ---------------------------------------------------------
   * REQUEST TAX REPORTING
   * ---------------------------------------------------------
   *
   * Backend:
   *
   * POST /api/stripes/request-tax-reporting
   *
   * Current reporting type:
   *
   * 1099_misc
   *
   * IMPORTANT:
   *
   * This button is only shown when tax reporting has NOT
   * already been requested.
   */
  const handleRequestTaxReporting = async () => {
    try {
      setRequestingTax(true);

      const response =
        await userService.requestTaxReporting(
          '1099_misc'
        );

      const data =
        response?.data ||
        response ||
        {};

      if (
        data?.success === true ||
        data?.taxReporting?.status === 'active'
      ) {
        Alert.alert(
          'Tax Reporting Requested',
          'Tax reporting has been activated. Additional tax information may be required through Stripe.'
        );

        await fetchTaxInformation();

        return;
      }

      throw new Error(
        data?.message ||
        'Unable to request tax reporting.'
      );
    } catch (error) {
      console.error(
        'requestTaxReporting error:',
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        'Unable to Request Tax Reporting',
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Please try again later.'
      );
    } finally {
      setRequestingTax(false);
    }
  };

  /**
   * ---------------------------------------------------------
   * OPEN STRIPE EXPRESS DASHBOARD
   * ---------------------------------------------------------
   *
   * Stripe remains authoritative for sensitive tax
   * information.
   */
  const handleReviewTaxInformation =
    async () => {
      try {
        setOpeningStripe(true);

        const response =
          await userService.createExpressDashboardLink();

        const url =
          response?.data?.url ||
          response?.url;

        if (!url) {
          throw new Error(
            'Stripe dashboard URL was not returned'
          );
        }

        const supported =
          await Linking.canOpenURL(url);

        if (!supported) {
          throw new Error(
            'Unable to open Stripe dashboard'
          );
        }

        await Linking.openURL(url);
      } catch (error) {
        console.error(
          'Stripe tax/account dashboard error:',
          error
        );

        Alert.alert(
          'Unable to Open Stripe',
          'We could not open your Stripe account. Please try again.'
        );
      } finally {
        setOpeningStripe(false);
      }
    };

  /*
   * ---------------------------------------------------------
   * GENERAL STRIPE ACCOUNT STATUS
   * ---------------------------------------------------------
   */

  const connectStatus =
    payoutData?.status || {};

  const account =
    payoutData?.account || {};

  const payoutsEnabled =
    connectStatus?.payoutsEnabled === true;

  const accountStatus =
    connectStatus?.status ||
    'not_started';

  /*
   * ---------------------------------------------------------
   * TAX REPORTING STATUS
   * ---------------------------------------------------------
   */

  const taxReporting =
    taxReportingData?.taxReporting || {};

  const requirements =
    taxReportingData?.requirements || {};

  const taxInfoStatus =
    taxReporting?.taxInfoStatus ||
    'not_started';

  const taxUiStatus =
    taxReporting?.uiStatus ||
    'not_requested';

  const taxActionRequired =
    taxReporting?.actionRequired === true;

  const taxCapability =
    taxReporting?.capability ||
    null;

  const taxReportingStatus =
    taxReporting?.status ||
    'not_requested';

  const currentlyDue =
    requirements?.currentlyDue || [];

  const pastDue =
    requirements?.pastDue || [];

  const pendingVerification =
    requirements?.pendingVerification || [];

  /*
   * ---------------------------------------------------------
   * TAX CENTER STATE
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We do NOT derive tax status from:
   *
   *   payoutsEnabled
   *   detailsSubmitted
   *   chargesEnabled
   *
   * Those belong to the general Stripe account.
   *
   * Tax status comes from:
   *
   *   /tax-reporting-status
   */

  const taxInformationReady =
    taxInfoStatus === 'ready';

  const taxInformationActionRequired =
    taxInfoStatus === 'action_required' ||
    taxActionRequired ||
    currentlyDue.length > 0 ||
    pastDue.length > 0;

  const taxVerificationPending =
    taxInfoStatus === 'pending_verification' ||
    pendingVerification.length > 0;

  const taxReportingNotRequested =
    taxInfoStatus === 'not_started' &&
    taxUiStatus === 'not_requested';

  /*
   * ---------------------------------------------------------
   * TAX REPORTING REQUESTED
   * ---------------------------------------------------------
   *
   * A cleaner is considered to have tax reporting requested
   * once Stripe reports an active/requested capability.
   */
  const taxReportingRequested =
    taxReportingStatus === 'active' ||
    taxReporting?.requested === true ||
    Boolean(taxCapability);

  /*
   * ---------------------------------------------------------
   * TAX STATUS PRESENTATION
   * ---------------------------------------------------------
   */

  const getTaxStatusTitle = () => {
    if (taxReportingNotRequested) {
      return 'Tax Reporting Not Set Up';
    }

    if (taxInformationActionRequired) {
      return 'Tax Information Requires Attention';
    }

    if (taxVerificationPending) {
      return 'Tax Information Under Review';
    }

    if (taxInformationReady) {
      return 'Tax Information Ready';
    }

    return 'Tax Information';
  };

  const getTaxStatusSubtitle = () => {
    if (taxReportingNotRequested) {
      return 'Tax reporting has not yet been requested for this account.';
    }

    if (taxInformationActionRequired) {
      return 'Stripe requires additional tax information. Review your information securely through Stripe.';
    }

    if (taxVerificationPending) {
      return 'Stripe is reviewing your tax information.';
    }

    if (taxInformationReady) {
      return 'Your tax-reporting information is currently ready with Stripe.';
    }

    return 'Your tax information is managed securely through Stripe.';
  };

  const getTaxStatusColor = () => {
    if (taxReportingNotRequested) {
      return theme.text.muted;
    }

    if (taxInformationActionRequired) {
      return theme.status.error;
    }

    if (taxVerificationPending) {
      return theme.status.warning;
    }

    if (taxInformationReady) {
      return theme.status.success;
    }

    return theme.text.muted;
  };

  const getTaxStatusBackground = () => {
    if (taxReportingNotRequested) {
      return `${theme.text.muted}18`;
    }

    if (taxInformationActionRequired) {
      return `${theme.status.error}18`;
    }

    if (taxVerificationPending) {
      return `${theme.status.warning}18`;
    }

    if (taxInformationReady) {
      return `${theme.status.success}18`;
    }

    return `${theme.text.muted}18`;
  };

  const getTaxStatusIcon = () => {
    if (taxReportingNotRequested) {
      return 'file-document-outline';
    }

    if (taxInformationActionRequired) {
      return 'alert-circle';
    }

    if (taxVerificationPending) {
      return 'clock-outline';
    }

    if (taxInformationReady) {
      return 'check-circle';
    }

    return 'file-document-outline';
  };

  /*
   * ---------------------------------------------------------
   * TAX INFORMATION BUTTON
   * ---------------------------------------------------------
   *
   * 1. Not requested:
   *      Request Tax Reporting
   *
   * 2. Requested + action required:
   *      Complete Tax Information
   *
   * 3. Requested + ready:
   *      Review Tax Information
   *
   * 4. Pending verification:
   *      Review Tax Information
   */

  const renderTaxActionButton = () => {
    if (taxReportingNotRequested) {
      return (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            requestingTax &&
              styles.disabledButton,
          ]}
          onPress={
            handleRequestTaxReporting
          }
          disabled={requestingTax}
        >
          {requestingTax ? (
            <ActivityIndicator
              size="small"
              color={theme.button.primaryText}
            />
          ) : (
            <AppText
              style={
                styles.primaryButtonText
              }
            >
              Request Tax Reporting
            </AppText>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.primaryButton,
          openingStripe &&
            styles.disabledButton,
        ]}
        onPress={
          handleReviewTaxInformation
        }
        disabled={openingStripe}
      >
        {openingStripe ? (
          <ActivityIndicator
            size="small"
            color={theme.button.primaryText}
          />
        ) : (
          <AppText
            style={
              styles.primaryButtonText
            }
          >
            {taxInformationActionRequired
              ? 'Complete Tax Information'
              : 'Review Tax Information'}
          </AppText>
        )}
      </TouchableOpacity>
    );
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText style={styles.loadingText}>
            Loading tax information...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const taxStatusColor =
    getTaxStatusColor();

  const taxStatusBackground =
    getTaxStatusBackground();

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
          />
        }
      >

        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.icon.default}
            />
          </TouchableOpacity>

          <View style={styles.flex}>
            <AppText
              style={styles.headerTitle}
            >
              Tax Center
            </AppText>

            <AppText
              style={styles.headerSubtitle}
            >
              Manage your tax information and documents
            </AppText>
          </View>
        </View>


        {/* TAX STATUS */}

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor:
                taxStatusBackground,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={getTaxStatusIcon()}
            size={28}
            color={taxStatusColor}
          />

          <View style={styles.flex}>
            <AppText
              style={styles.statusTitle}
            >
              {getTaxStatusTitle()}
            </AppText>

            <AppText
              style={styles.statusSubtitle}
            >
              {getTaxStatusSubtitle()}
            </AppText>
          </View>
        </View>


        {/* TAX INFORMATION */}

        <View style={styles.section}>
          <AppText
            style={styles.sectionTitle}
          >
            Tax Information
          </AppText>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.flex}>
                <AppText
                  style={styles.cardTitle}
                >
                  Stripe Tax Information
                </AppText>

                <AppText
                  style={styles.cardSubtitle}
                >
                  Your sensitive tax information is
                  securely managed through Stripe.
                </AppText>
              </View>

              <MaterialCommunityIcons
                name={
                  taxReportingNotRequested
                    ? 'file-document-outline'
                    : taxInformationActionRequired
                      ? 'alert-circle'
                      : taxVerificationPending
                        ? 'clock-outline'
                        : taxInformationReady
                          ? 'check-circle'
                          : 'alert-circle-outline'
                }
                size={24}
                color={taxStatusColor}
              />
            </View>


            <View style={styles.divider} />


            <InfoRow
              label="Account Type"
              value={
                account?.businessType
                  ? formatAccountType(
                      account.businessType
                    )
                  : 'Not available'
              }
              theme={theme}
            />


            <InfoRow
              label="Country"
              value={
                account?.country ||
                'Not available'
              }
              theme={theme}
            />


            <InfoRow
              label="Tax Reporting"
              value={
                taxReportingNotRequested
                  ? 'Not Requested'
                  : taxReportingStatus ===
                      'active'
                    ? 'Active'
                    : formatStatus(
                        taxReportingStatus
                      )
              }
              valueColor={
                taxReportingNotRequested
                  ? theme.text.muted
                  : taxInformationActionRequired
                    ? theme.status.error
                    : taxVerificationPending
                      ? theme.status.warning
                      : taxInformationReady
                        ? theme.status.success
                        : theme.text.muted
              }
              theme={theme}
            />


            <InfoRow
              label="Tax Information"
              value={
                taxReportingNotRequested
                  ? 'Not Set Up'
                  : taxInformationActionRequired
                    ? 'Action Required'
                    : taxVerificationPending
                      ? 'Pending Verification'
                      : taxInformationReady
                        ? 'Ready'
                        : 'Not Set Up'
              }
              valueColor={
                taxReportingNotRequested
                  ? theme.text.muted
                  : taxInformationActionRequired
                    ? theme.status.error
                    : taxVerificationPending
                      ? theme.status.warning
                      : taxInformationReady
                        ? theme.status.success
                        : theme.text.muted
              }
              theme={theme}
            />


            {taxCapability ? (
              <InfoRow
                label="Reporting Capability"
                value="1099 Reporting"
                theme={theme}
              />
            ) : null}


            {renderTaxActionButton()}

          </View>
        </View>


        {/* TAX DOCUMENTS */}

        <View style={styles.section}>
          <AppText
            style={styles.sectionTitle}
          >
            Tax Documents
          </AppText>

          <View style={styles.emptyCard}>
            <View style={styles.documentIcon}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={34}
                color={theme.brand.primary}
              />
            </View>

            <AppText
              style={styles.emptyTitle}
            >
              No Tax Documents Yet
            </AppText>

            <AppText
              style={styles.emptyText}
            >
              Your annual tax documents will appear
              here when they become available.
            </AppText>
          </View>
        </View>


        {/* ACCOUNT STATUS */}

        <View style={styles.section}>
          <AppText
            style={styles.sectionTitle}
          >
            Account Status
          </AppText>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name={
                  payoutsEnabled
                    ? 'shield-check'
                    : 'shield-alert-outline'
                }
                size={24}
                color={
                  payoutsEnabled
                    ? theme.status.success
                    : theme.status.warning
                }
              />
            </View>

            <View style={styles.flex}>
              <AppText
                style={styles.cardTitle}
              >
                Stripe Account
              </AppText>

              <AppText
                style={[
                  styles.cardSubtitle,
                  {
                    textTransform:
                      'capitalize',
                  },
                ]}
              >
                {formatStatus(
                  accountStatus
                )}
              </AppText>
            </View>
          </View>
        </View>


        {/* INFORMATION */}

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={22}
            color={theme.brand.primary}
          />

          <AppText style={styles.infoText}>
            Freshsweeper does not collect or display
            your complete tax identification
            information. Sensitive tax information
            is managed securely through Stripe.
          </AppText>
        </View>


        {/* SECURITY */}

        <View style={styles.securityBox}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={24}
            color={theme.brand.primary}
          />

          <AppText style={styles.securityText}>
            Freshsweeper does not display your
            complete tax identification number,
            bank account number, or other sensitive
            financial information.
          </AppText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};


/*
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

const formatAccountType = (
  value
) => {
  if (!value) {
    return 'Not available';
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};


const formatStatus = (
  value
) => {
  if (!value) {
    return 'Not available';
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};


const InfoRow = ({
  label,
  value,
  valueColor,
  theme,
}) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel}>
        {label}
      </AppText>

      <AppText
        style={[
          styles.infoValue,
          {
            color:
              valueColor ||
              theme.text.primary,
          },
        ]}
      >
        {value}
      </AppText>
    </View>
  );
};


/*
 * ---------------------------------------------------------
 * STYLES
 * ---------------------------------------------------------
 */

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    container: {
      padding: 20,
      paddingBottom: 40,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 12,
      color: theme.text.secondary,
      fontSize: 14,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        theme.surface.elevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    headerTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.text.primary,
    },

    headerSubtitle: {
      marginTop: 4,
      fontSize: 14,
      color: theme.text.secondary,
    },

    flex: {
      flex: 1,
    },

    statusCard: {
      borderRadius: 17,
      padding: 17,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
      gap: 12,
    },

    statusTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
    },

    statusSubtitle: {
      marginTop: 4,
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 18,
    },

    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: '700',
      marginBottom: 12,
      color: theme.text.primary,
    },

    card: {
      backgroundColor:
        theme.card.background,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        theme.surface.selected,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
    },

    cardSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 18,
    },

    divider: {
      height: 1,
      backgroundColor:
        theme.divider,
      marginVertical: 16,
    },

    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },

    infoLabel: {
      color: theme.text.secondary,
      fontSize: 14,
    },

    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      maxWidth: '55%',
      textAlign: 'right',
    },

    primaryButton: {
      marginTop: 8,
      backgroundColor:
        theme.button.primaryBackground,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },

    primaryButtonText: {
      color:
        theme.button.primaryText,
      fontSize: 15,
      fontWeight: '700',
    },

    disabledButton: {
      opacity: 0.65,
    },

    emptyCard: {
      backgroundColor:
        theme.card.background,
      borderRadius: 18,
      padding: 30,
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    documentIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        theme.surface.selected,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
    },

    emptyText: {
      marginTop: 7,
      textAlign: 'center',
      color: theme.text.secondary,
      lineHeight: 20,
      maxWidth: 300,
    },

    settingCard: {
      backgroundColor:
        theme.card.background,
      borderRadius: 17,
      padding: 17,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    settingIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        theme.surface.selected,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 13,
    },

    infoBox: {
      flexDirection: 'row',
      backgroundColor:
        theme.surface.selected,
      borderRadius: 14,
      padding: 15,
      gap: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    infoText: {
      flex: 1,
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 19,
    },

    securityBox: {
      backgroundColor:
        theme.surface.selected,
      borderRadius: 15,
      padding: 15,
      flexDirection: 'row',
      gap: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    securityText: {
      flex: 1,
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 19,
    },
  });

export default TaxDocuments;

// import React, { useCallback, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from 'react-native';

// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';

// import userService from '../../../services/connection/userService';
// import COLORS from '../../../constants/colors';

// const TaxDocuments = () => {
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [taxData, setTaxData] = useState(null);

//   const fetchTaxDocuments = async () => {
//     try {
//       setLoading(true);

//       /*
//        * Backend endpoint to add:
//        *
//        * GET /api/users/tax-documents/{cleanerId}
//        *
//        * Expected response:
//        * {
//        *   taxProfile: {
//        *     status: "complete",
//        *     legalName: "...",
//        *     taxIdType: "SSN",
//        *     lastFour: "1234",
//        *     address: "..."
//        *   },
//        *   documents: [
//        *     {
//        *       id: "...",
//        *       type: "1099-NEC",
//        *       taxYear: 2026,
//        *       status: "available",
//        *       issuedDate: "...",
//        *       downloadUrl: "..."
//        *     }
//        *   ]
//        * }
//        */

//       const response = await userService.getCleanerTaxDocuments();

//       const data = response?.data || response || {};

//       setTaxData(data);
//     } catch (error) {
//       console.error('Error fetching tax documents:', error);

//       setTaxData({
//         taxProfile: {
//           status: 'not_configured',
//         },
//         documents: [],
//       });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchTaxDocuments();
//     }, [])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchTaxDocuments();
//   };

//   const handleDocumentPress = (document) => {
//     if (document?.downloadUrl) {
//       Alert.alert(
//         'Tax Document',
//         'The tax document is ready to download.'
//       );

//       // Connect your PDF/document downloader here.
//       return;
//     }

//     Alert.alert(
//       'Not Available',
//       'This tax document is not available yet.'
//     );
//   };

//   const taxProfile = taxData?.taxProfile || {};
//   const documents = Array.isArray(taxData?.documents)
//     ? taxData.documents
//     : [];

//   const profileComplete =
//     taxProfile.status === 'complete';

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator
//             size="large"
//             color={COLORS.primary}
//           />
//           <Text style={styles.loadingText}>
//             Loading tax information...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//           />
//         }
//       >
//         {/* HEADER */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={24}
//               color="#222"
//             />
//           </TouchableOpacity>

//           <View>
//             <Text style={styles.headerTitle}>
//               Tax Documents
//             </Text>

//             <Text style={styles.headerSubtitle}>
//               Manage your tax information
//             </Text>
//           </View>
//         </View>

//         {/* TAX PROFILE */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             Tax Profile
//           </Text>

//           <View style={styles.card}>
//             <View style={styles.cardRow}>
//               <View style={styles.iconCircle}>
//                 <MaterialCommunityIcons
//                   name="file-document-outline"
//                   size={24}
//                   color={COLORS.primary}
//                 />
//               </View>

//               <View style={styles.flex}>
//                 <Text style={styles.cardTitle}>
//                   Tax Information
//                 </Text>

//                 <Text style={styles.cardSubtitle}>
//                   {profileComplete
//                     ? 'Your tax information is complete'
//                     : 'Tax information needs to be completed'}
//                 </Text>
//               </View>

//               <MaterialCommunityIcons
//                 name={
//                   profileComplete
//                     ? 'check-circle'
//                     : 'alert-circle-outline'
//                 }
//                 size={24}
//                 color={
//                   profileComplete
//                     ? '#34C759'
//                     : '#FF9500'
//                 }
//               />
//             </View>

//             <View style={styles.divider} />

//             <InfoRow
//               label="Legal Name"
//               value={
//                 taxProfile.legalName ||
//                 'Not provided'
//               }
//             />

//             <InfoRow
//               label="Tax ID"
//               value={
//                 taxProfile.lastFour
//                   ? `•••• ${taxProfile.lastFour}`
//                   : 'Not provided'
//               }
//             />

//             <InfoRow
//               label="Status"
//               value={
//                 profileComplete
//                   ? 'Complete'
//                   : 'Action Required'
//               }
//               valueColor={
//                 profileComplete
//                   ? '#34C759'
//                   : '#FF9500'
//               }
//             />

//             <TouchableOpacity
//               style={styles.primaryButton}
//               onPress={() =>
//                 navigation.navigate('TaxProfile')
//               }
//             >
//               <Text style={styles.primaryButtonText}>
//                 {profileComplete
//                   ? 'Update Tax Information'
//                   : 'Complete Tax Information'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* DOCUMENTS */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             Tax Documents
//           </Text>

//           {documents.length === 0 ? (
//             <View style={styles.emptyCard}>
//               <MaterialCommunityIcons
//                 name="file-outline"
//                 size={42}
//                 color="#999"
//               />

//               <Text style={styles.emptyTitle}>
//                 No Tax Documents Yet
//               </Text>

//               <Text style={styles.emptyText}>
//                 Your tax documents will appear here when
//                 they become available.
//               </Text>
//             </View>
//           ) : (
//             documents.map((document) => (
//               <TouchableOpacity
//                 key={document.id}
//                 style={styles.documentCard}
//                 onPress={() =>
//                   handleDocumentPress(document)
//                 }
//               >
//                 <View style={styles.documentIcon}>
//                   <MaterialCommunityIcons
//                     name="file-pdf-box"
//                     size={28}
//                     color="#D32F2F"
//                   />
//                 </View>

//                 <View style={styles.flex}>
//                   <Text style={styles.cardTitle}>
//                     {document.type || 'Tax Document'}
//                   </Text>

//                   <Text style={styles.cardSubtitle}>
//                     Tax Year {document.taxYear}
//                   </Text>

//                   {document.issuedDate && (
//                     <Text style={styles.documentDate}>
//                       Issued {document.issuedDate}
//                     </Text>
//                   )}
//                 </View>

//                 <View style={styles.documentRight}>
//                   <Text
//                     style={[
//                       styles.statusText,
//                       {
//                         color:
//                           document.status === 'available'
//                             ? '#34C759'
//                             : '#FF9500',
//                       },
//                     ]}
//                   >
//                     {document.status === 'available'
//                       ? 'Available'
//                       : 'Pending'}
//                   </Text>

//                   <MaterialCommunityIcons
//                     name="chevron-right"
//                     size={24}
//                     color="#999"
//                   />
//                 </View>
//               </TouchableOpacity>
//             ))
//           )}
//         </View>

//         {/* INFORMATION */}
//         <View style={styles.infoBox}>
//           <MaterialCommunityIcons
//             name="information-outline"
//             size={22}
//             color={COLORS.primary}
//           />

//           <Text style={styles.infoText}>
//             Keep your tax information accurate so
//             Freshsweeper can provide the appropriate
//             tax documentation for your earnings.
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const InfoRow = ({
//   label,
//   value,
//   valueColor = '#222',
// }) => (
//   <View style={styles.infoRow}>
//     <Text style={styles.infoLabel}>{label}</Text>

//     <Text
//       style={[
//         styles.infoValue,
//         { color: valueColor },
//       ]}
//     >
//       {value}
//     </Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F7F7F7',
//   },

//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   loadingText: {
//     marginTop: 12,
//     color: '#777',
//   },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 28,
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },

//   headerTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#222',
//   },

//   headerSubtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: '#777',
//   },

//   section: {
//     marginBottom: 24,
//   },

//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#222',
//   },

//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 18,
//     padding: 18,
//   },

//   cardRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   iconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F0F4FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   flex: {
//     flex: 1,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#222',
//   },

//   cardSubtitle: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#777',
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#EEE',
//     marginVertical: 16,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 14,
//   },

//   infoLabel: {
//     color: '#777',
//     fontSize: 14,
//   },

//   infoValue: {
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   primaryButton: {
//     marginTop: 8,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },

//   primaryButtonText: {
//     color: '#FFF',
//     fontSize: 15,
//     fontWeight: '700',
//   },

//   documentCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   documentIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 14,
//     backgroundColor: '#FFF1F1',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   documentDate: {
//     marginTop: 5,
//     fontSize: 12,
//     color: '#999',
//   },

//   documentRight: {
//     alignItems: 'flex-end',
//     gap: 5,
//   },

//   statusText: {
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   emptyCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 18,
//     padding: 30,
//     alignItems: 'center',
//   },

//   emptyTitle: {
//     marginTop: 12,
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#333',
//   },

//   emptyText: {
//     marginTop: 7,
//     textAlign: 'center',
//     color: '#777',
//     lineHeight: 20,
//   },

//   infoBox: {
//     flexDirection: 'row',
//     backgroundColor: '#F0F4FF',
//     borderRadius: 14,
//     padding: 15,
//     gap: 10,
//   },

//   infoText: {
//     flex: 1,
//     color: '#555',
//     fontSize: 13,
//     lineHeight: 19,
//   },
// });

// export default TaxDocuments;




// Payout Settings ✅
// 2. Tax Documents ← next
// 3. Payment History
// 4. Earnings Detail Report — using the architecture we already established
// 5. Host Transactions
// 6. Final financial/API documentation update