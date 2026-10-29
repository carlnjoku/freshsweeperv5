// screens/cleaner/PayoutSettings.js
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

const PayoutSettings = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const styles = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [openingStripe, setOpeningStripe] = useState(false);
  const [payoutData, setPayoutData] = useState(null);

  const fetchPayoutSettings = async () => {
    try {
      setLoading(true);

      const response =
        await userService.getCleanerPayoutSettings();

      const data =
        response?.data || response || {};

      setPayoutData(data);
    } catch (error) {
      console.error(
        'Error fetching payout settings:',
        error
      );

      setPayoutData({});
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayoutSettings();
    }, [])
  );

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   account: {...},
   *   status: {
   *      status: "verified",
   *      detailsSubmitted: true,
   *      payoutsEnabled: true,
   *      chargesEnabled: true,
   *      currentlyDue: [],
   *      pastDue: [],
   *      eventuallyDue: [],
   *      disabledReason: null
   *   },
   *   bankAccount: {
   *      bankName: "...",
   *      last4: "1113",
   *      currency: "usd",
   *      country: "US",
   *      status: "verified"
   *   },
   *   payoutSchedule: {
   *      interval: "daily",
   *      delayDays: 2
   *   },
   *   currency: "usd"
   * }
   */

  const connectStatus =
    payoutData?.status || {};

  const bankAccount =
    payoutData?.bankAccount || {};

  const payoutSchedule =
    payoutData?.payoutSchedule || {};

  const payoutEnabled =
    connectStatus?.payoutsEnabled === true;

  const chargesEnabled =
    connectStatus?.chargesEnabled === true;

  const detailsSubmitted =
    connectStatus?.detailsSubmitted === true;

  const accountStatus =
    connectStatus?.status || 'not_started';

  const currentlyDue =
    connectStatus?.currentlyDue || [];

  const pastDue =
    connectStatus?.pastDue || [];

  const disabledReason =
    connectStatus?.disabledReason;

  const currency =
    (
      payoutData?.currency ||
      bankAccount?.currency ||
      'usd'
    ).toUpperCase();

  const formatPayoutInterval = (
    interval
  ) => {
    if (!interval) {
      return 'Not configured';
    }

    switch (interval.toLowerCase()) {
      case 'daily':
        return 'Daily';

      case 'weekly':
        return 'Weekly';

      case 'monthly':
        return 'Monthly';

      case 'manual':
        return 'Manual';

      default:
        return (
          interval.charAt(0).toUpperCase() +
          interval.slice(1)
        );
    }
  };

  const getStatusTitle = () => {
    if (payoutEnabled) {
      return 'Payouts Enabled';
    }

    if (pastDue.length > 0) {
      return 'Action Required';
    }

    if (disabledReason) {
      return 'Payouts Restricted';
    }

    if (!detailsSubmitted) {
      return 'Payout Setup Required';
    }

    return 'Payouts Pending';
  };

  const getStatusSubtitle = () => {
    if (payoutEnabled) {
      return 'Your account is ready to receive payouts.';
    }

    if (pastDue.length > 0) {
      return 'Stripe requires additional information before payouts can continue.';
    }

    if (disabledReason) {
      return 'Your Stripe payout account currently has a restriction.';
    }

    if (!detailsSubmitted) {
      return 'Complete your Stripe payout account setup.';
    }

    return 'Your payout account is being reviewed.';
  };

  const getStatusColor = () => {
    if (payoutEnabled) {
      return theme.status.success;
    }

    if (
      pastDue.length > 0 ||
      disabledReason
    ) {
      return theme.status.error;
    }

    return theme.status.warning;
  };

  const getStatusBackground = () => {
    if (payoutEnabled) {
      return `${theme.status.success}18`;
    }

    if (
      pastDue.length > 0 ||
      disabledReason
    ) {
      return `${theme.status.error}18`;
    }

    return `${theme.status.warning}18`;
  };

  const handleChangeBankAccount = async () => {
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
        'Stripe Express dashboard error:',
        error
      );

      Alert.alert(
        'Unable to Open Stripe',
        'We could not open your Stripe payout account. Please try again.'
      );
    } finally {
      setOpeningStripe(false);
    }
  };

  const handleReviewStripeAccount =
    async () => {
      await handleChangeBankAccount();
    };

  const handlePayoutSchedule = () => {
    Alert.alert(
      'Payout Schedule',
      `Your Stripe payout schedule is currently ${formatPayoutInterval(
        payoutSchedule?.interval
      ).toLowerCase()}.`,
      [
        {
          text: 'Open Stripe',
          onPress:
            handleChangeBankAccount,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText style={styles.loadingText}>
            Loading payout settings...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor =
    getStatusColor();

  const statusBackground =
    getStatusBackground();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.icon.default}
            />
          </TouchableOpacity>

          <View style={styles.flex}>
            <AppText style={styles.title}>
              Payout Settings
            </AppText>

            <AppText style={styles.subtitle}>
              Manage how you receive your earnings
            </AppText>
          </View>
        </View>


        {/* STATUS */}

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor:
                statusBackground,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              payoutEnabled
                ? 'check-circle'
                : pastDue.length > 0 ||
                  disabledReason
                  ? 'alert-circle'
                  : 'clock-outline'
            }
            size={28}
            color={statusColor}
          />

          <View style={styles.flex}>
            <AppText style={styles.statusTitle}>
              {getStatusTitle()}
            </AppText>

            <AppText style={styles.statusSubtitle}>
              {getStatusSubtitle()}
            </AppText>
          </View>
        </View>


        {/* CONNECTED BANK ACCOUNT */}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Connected Bank Account
          </AppText>

          <View style={styles.card}>

            <View style={styles.accountRow}>

              <View style={styles.bankIcon}>
                <MaterialCommunityIcons
                  name="bank"
                  size={27}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.flex}>

                <AppText style={styles.cardTitle}>
                  {bankAccount?.bankName ||
                    'Bank Account'}
                </AppText>

                <AppText style={styles.cardSubtitle}>
                  {bankAccount?.last4
                    ? `•••• ${bankAccount.last4}`
                    : 'No payout account connected'}
                </AppText>

                {bankAccount?.status && (
                  <View
                    style={
                      styles.bankStatusRow
                    }
                  >
                    <MaterialCommunityIcons
                      name={
                        bankAccount.status ===
                        'verified'
                          ? 'check-circle'
                          : 'information-outline'
                      }
                      size={15}
                      color={
                        bankAccount.status ===
                        'verified'
                          ? theme.status.success
                          : theme.status.warning
                      }
                    />

                    <AppText
                      style={[
                        styles.bankStatusText,
                        {
                          color:
                            bankAccount.status ===
                            'verified'
                              ? theme.status.success
                              : theme.status.warning,
                        },
                      ]}
                    >
                      {bankAccount.status ===
                      'verified'
                        ? 'Verified'
                        : bankAccount.status}
                    </AppText>
                  </View>
                )}

              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={25}
                color={theme.icon.muted}
              />

            </View>


            <TouchableOpacity
              style={[
                styles.outlineButton,
                openingStripe &&
                  styles.disabledButton,
              ]}
              onPress={
                handleChangeBankAccount
              }
              disabled={openingStripe}
            >
              {openingStripe ? (
                <ActivityIndicator
                  size="small"
                  color={theme.brand.primary}
                />
              ) : (
                <AppText
                  style={
                    styles.outlineButtonText
                  }
                >
                  Change Bank Account
                </AppText>
              )}
            </TouchableOpacity>

          </View>
        </View>


        {/* VERIFICATION */}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Verification
          </AppText>

          <View style={styles.card}>

            <VerificationRow
              label="Identity information"
              completed={detailsSubmitted}
              theme={theme}
            />

            <VerificationRow
              label="Bank account"
              completed={
                bankAccount?.status ===
                'verified'
              }
              theme={theme}
            />

            <VerificationRow
              label="Payout capability"
              completed={payoutEnabled}
              theme={theme}
            />

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={
                handleReviewStripeAccount
              }
              disabled={openingStripe}
            >
              <AppText
                style={
                  styles.outlineButtonText
                }
              >
                Review Stripe Account
              </AppText>
            </TouchableOpacity>

          </View>
        </View>


        {/* PAYOUT SCHEDULE */}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Payout Schedule
          </AppText>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={handlePayoutSchedule}
          >

            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.flex}>

              <AppText style={styles.cardTitle}>
                Payout Frequency
              </AppText>

              <AppText style={styles.cardSubtitle}>
                {formatPayoutInterval(
                  payoutSchedule?.interval
                )}

                {payoutSchedule?.delayDays !==
                  undefined &&
                  payoutSchedule?.delayDays !==
                    null &&
                  ` • ${payoutSchedule.delayDays}-day delay`}
              </AppText>

            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={25}
              color={theme.icon.muted}
            />

          </TouchableOpacity>
        </View>


        {/* CURRENCY */}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Currency
          </AppText>

          <View style={styles.settingCard}>

            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={24}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.flex}>

              <AppText style={styles.cardTitle}>
                Payout Currency
              </AppText>

              <AppText style={styles.cardSubtitle}>
                {currency}
              </AppText>

            </View>

          </View>
        </View>


        {/* STRIPE ACCOUNT STATUS */}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Stripe Account
          </AppText>

          <View style={styles.settingCard}>

            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color={
                  payoutEnabled
                    ? theme.status.success
                    : theme.status.warning
                }
              />
            </View>

            <View style={styles.flex}>

              <AppText style={styles.cardTitle}>
                Account Status
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
                {accountStatus.replace(
                  /_/g,
                  ' '
                )}
              </AppText>

            </View>

          </View>
        </View>


        {/* SECURITY */}

        <View style={styles.securityBox}>

          <MaterialCommunityIcons
            name="shield-check-outline"
            size={24}
            color={theme.brand.primary}
          />

          <AppText style={styles.securityText}>
            Your payout information is securely
            managed through Stripe. Freshsweeper
            does not display your complete bank
            account or routing information.
          </AppText>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};


/*
 * Verification row
 */

const VerificationRow = ({
  label,
  completed,
  theme,
}) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.verificationRow}>

      <MaterialCommunityIcons
        name={
          completed
            ? 'check-circle'
            : 'clock-outline'
        }
        size={21}
        color={
          completed
            ? theme.status.success
            : theme.status.warning
        }
      />

      <AppText
        style={[
          styles.verificationText,
          {
            color: completed
              ? theme.text.primary
              : theme.text.secondary,
          },
        ]}
      >
        {label}
      </AppText>

    </View>
  );
};


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

    loading: {
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

    title: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.text.primary,
    },

    subtitle: {
      marginTop: 4,
      color: theme.text.secondary,
      fontSize: 14,
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

    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    bankIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        theme.surface.selected,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 13,
    },

    flex: {
      flex: 1,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
    },

    cardSubtitle: {
      marginTop: 5,
      fontSize: 13,
      color: theme.text.secondary,
    },

    bankStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      gap: 5,
    },

    bankStatusText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },

    outlineButton: {
      marginTop: 18,
      borderWidth: 1,
      borderColor:
        theme.brand.primary,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 46,
    },

    disabledButton: {
      opacity: 0.6,
    },

    outlineButtonText: {
      color: theme.brand.primary,
      fontWeight: '700',
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

    verificationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 10,
    },

    verificationText: {
      fontSize: 14,
      fontWeight: '600',
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

export default PayoutSettings;



// import React, { useCallback, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';

// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';


// import userService from '../../../services/connection/userService';
// import COLORS from '../../../constants/colors';
// import { Linking } from 'react-native';
// const PayoutSettings = () => {
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(true);
//   const [payoutData, setPayoutData] = useState(null);

//   const fetchPayoutSettings = async () => {
//     try {
//       setLoading(true);

//       /*
//        * Backend endpoint:
//        *
//        * GET /api/users/payout-settings/{cleanerId}
//        *
//        * Expected:
//        * {
//        *   stripeAccountId: "...",
//        *   status: "enabled",
//        *   payoutsEnabled: true,
//        *   chargesEnabled: true,
//        *   bankAccount: {
//        *      bankName: "...",
//        *      last4: "1234"
//        *   },
//        *   schedule: "weekly",
//        *   currency: "USD"
//        * }
//        */

//       const response =
//         await userService.getCleanerPayoutSettings();

//       setPayoutData(
//         response?.data || response || {}
//       );
//     } catch (error) {
//       console.error(
//         'Error fetching payout settings:',
//         error
//       );

//       setPayoutData({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchPayoutSettings();
//     }, [])
//   );

//   const payoutEnabled =
//     payoutData?.payoutsEnabled === true;

//   const bankAccount =
//     payoutData?.bankAccount || {};

//   const payoutSchedule =
//     payoutData?.schedule || 'weekly';

//   const handleUpdatePayoutAccount = () => {
//     navigation.navigate('CleanerPayment');
//   };
  

//   const handleChangeBankAccount = async () => {
//     try {
//       setLoading(true);
  
//       const response =
//         await userService.createExpressDashboardLink();
  
//       const url = response?.data?.url;
  
//       if (!url) {
//         throw new Error(
//           'Stripe dashboard URL was not returned'
//         );
//       }
  
//       await Linking.openURL(url);
  
//     } catch (error) {
//       console.error(
//         'Stripe Express dashboard error:',
//         error
//       );
  
//       Alert.alert(
//         'Unable to Open Stripe',
//         'Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

  

//   const handleChangeSchedule = () => {
//     Alert.alert(
//       'Payout Schedule',
//       'Choose your preferred payout frequency.',
//       [
//         {
//           text: 'Weekly',
//           onPress: () =>
//             updateSchedule('weekly'),
//         },
//         {
//           text: 'Biweekly',
//           onPress: () =>
//             updateSchedule('biweekly'),
//         },
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//       ]
//     );
//   };

//   const updateSchedule = async (schedule) => {
//     try {
//       /*
//        * Backend:
//        *
//        * PUT /api/users/payout-settings
//        *
//        * {
//        *   schedule: "weekly"
//        * }
//        */

//       await userService.updatePayoutSettings({
//         schedule,
//       });

//       setPayoutData((prev) => ({
//         ...prev,
//         schedule,
//       }));

//       Alert.alert(
//         'Updated',
//         'Your payout schedule has been updated.'
//       );
//     } catch (error) {
//       Alert.alert(
//         'Unable to Update',
//         'We could not update your payout schedule.'
//       );
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.loading}>
//           <ActivityIndicator
//             size="large"
//             color={COLORS.primary}
//           />

//           <Text style={styles.loadingText}>
//             Loading payout settings...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//       >
//         {/* HEADER */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={24}
//               color="#222"
//             />
//           </TouchableOpacity>

//           <View>
//             <Text style={styles.title}>
//               Payout Settings
//             </Text>

//             <Text style={styles.subtitle}>
//               Manage how you receive your earnings
//             </Text>
//           </View>
//         </View>

//         {/* STATUS */}
//         <View
//           style={[
//             styles.statusCard,
//             {
//               backgroundColor: payoutEnabled
//                 ? '#EAF8EF'
//                 : '#FFF5E6',
//             },
//           ]}
//         >
//           <MaterialCommunityIcons
//             name={
//               payoutEnabled
//                 ? 'check-circle'
//                 : 'alert-circle'
//             }
//             size={28}
//             color={
//               payoutEnabled
//                 ? '#34C759'
//                 : '#FF9500'
//             }
//           />

//           <View style={styles.flex}>
//             <Text style={styles.statusTitle}>
//               {payoutEnabled
//                 ? 'Payouts Enabled'
//                 : 'Payout Setup Required'}
//             </Text>

//             <Text style={styles.statusSubtitle}>
//               {payoutEnabled
//                 ? 'Your account is ready to receive payouts.'
//                 : 'Complete your payout account setup.'}
//             </Text>
//           </View>
//         </View>

//         {/* PAYOUT ACCOUNT */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             Payout Account
//           </Text>

//           <View style={styles.card}>
//             <View style={styles.accountRow}>
//               <View style={styles.bankIcon}>
//                 <MaterialCommunityIcons
//                   name="bank"
//                   size={27}
//                   color={COLORS.primary}
//                 />
//               </View>

//               <View style={styles.flex}>
//                 <Text style={styles.cardTitle}>
//                   {bankAccount.bankName ||
//                     'Bank Account'}
//                 </Text>

//                 <Text style={styles.cardSubtitle}>
//                   {bankAccount.last4
//                     ? `•••• ${bankAccount.last4}`
//                     : 'No payout account connected'}
//                 </Text>
//               </View>

//               <MaterialCommunityIcons
//                 name="chevron-right"
//                 size={25}
//                 color="#999"
//               />
//             </View>

//             <TouchableOpacity
//               style={styles.outlineButton}
//               onPress={handleUpdatePayoutAccount}
//             >
//               <Text style={styles.outlineButtonText}>
//                 Manage Payout Account
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.outlineButton}
//               onPress={handleChangeBankAccount}
//             >
//               <Text style={styles.outlineButtonText}>
//                 Change Bank Account
//               </Text>
//             </TouchableOpacity>

//           </View>
//         </View>

//         {/* PAYOUT SCHEDULE */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             Payout Schedule
//           </Text>

//           <TouchableOpacity
//             style={styles.settingCard}
//             onPress={handleChangeSchedule}
//           >
//             <View style={styles.settingIcon}>
//               <MaterialCommunityIcons
//                 name="calendar-clock"
//                 size={24}
//                 color={COLORS.primary}
//               />
//             </View>

//             <View style={styles.flex}>
//               <Text style={styles.cardTitle}>
//                 Payout Frequency
//               </Text>

//               <Text style={styles.cardSubtitle}>
//                 {payoutSchedule === 'biweekly'
//                   ? 'Every two weeks'
//                   : 'Weekly'}
//               </Text>
//             </View>

//             <MaterialCommunityIcons
//               name="chevron-right"
//               size={25}
//               color="#999"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* CURRENCY */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             Currency
//           </Text>

//           <View style={styles.settingCard}>
//             <View style={styles.settingIcon}>
//               <MaterialCommunityIcons
//                 name="currency-usd"
//                 size={24}
//                 color={COLORS.primary}
//               />
//             </View>

//             <View style={styles.flex}>
//               <Text style={styles.cardTitle}>
//                 Payout Currency
//               </Text>

//               <Text style={styles.cardSubtitle}>
//                 {payoutData?.currency || 'USD'}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* SECURITY */}
//         <View style={styles.securityBox}>
//           <MaterialCommunityIcons
//             name="shield-check-outline"
//             size={24}
//             color={COLORS.primary}
//           />

//           <Text style={styles.securityText}>
//             Your payout information is securely managed
//             through the payment system. Freshsweeper does
//             not display your complete bank account
//             information.
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F7F7F7',
//   },

//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   loading: {
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
//     marginBottom: 25,
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

//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#222',
//   },

//   subtitle: {
//     marginTop: 4,
//     color: '#777',
//     fontSize: 14,
//   },

//   statusCard: {
//     borderRadius: 17,
//     padding: 17,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 25,
//     gap: 12,
//   },

//   statusTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#222',
//   },

//   statusSubtitle: {
//     marginTop: 4,
//     color: '#666',
//     fontSize: 13,
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

//   accountRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   bankIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 15,
//     backgroundColor: '#F0F4FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 13,
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
//     marginTop: 5,
//     fontSize: 13,
//     color: '#777',
//   },

//   outlineButton: {
//     marginTop: 18,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     borderRadius: 12,
//     paddingVertical: 13,
//     alignItems: 'center',
//   },

//   outlineButtonText: {
//     color: COLORS.primary,
//     fontWeight: '700',
//   },

//   settingCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 17,
//     padding: 17,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   settingIcon: {
//     width: 46,
//     height: 46,
//     borderRadius: 14,
//     backgroundColor: '#F0F4FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 13,
//   },

//   securityBox: {
//     backgroundColor: '#F0F4FF',
//     borderRadius: 15,
//     padding: 15,
//     flexDirection: 'row',
//     gap: 10,
//   },

//   securityText: {
//     flex: 1,
//     color: '#555',
//     fontSize: 13,
//     lineHeight: 19,
//   },
// });

// export default PayoutSettings;