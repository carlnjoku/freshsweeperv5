import React, { useMemo } from 'react';

import {
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const TermsConditions = () => {
  const { theme } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  // ==========================================================
  // CLEAN LEADING BULLETS FROM TEXT
  // ==========================================================

  const cleanRuleText = (text) => {
    return String(text ?? '')
      .replace(/^\s*[•●▪◦‣⁃*-]\s*/, '')
      .trim();
  };

  // ==========================================================
  // REUSABLE POLICY SECTION
  // ==========================================================

  const renderPolicySection = ({
    icon,
    title,
    children,
    iconColor,
  }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIconContainer,
            {
              backgroundColor: `${iconColor || theme.brand.primary}15`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={23}
            color={iconColor || theme.brand.primary}
          />
        </View>

        <AppText style={styles.sectionTitle}>
          {title}
        </AppText>
      </View>

      <View style={styles.rulesList}>
        {children}
      </View>
    </View>
  );

  // ==========================================================
  // REUSABLE RULE ITEM
  // ONLY THE CHECK ICON IS DISPLAYED
  // ==========================================================

  const renderRule = (text, key) => (
    <View
      key={key}
      style={styles.ruleRow}
    >
      <View style={styles.checkIconContainer}>
        <MaterialCommunityIcons
          name="check"
          size={15}
          color={theme.status.success}
        />
      </View>

      <View style={styles.ruleTextContainer}>
        <AppText style={styles.ruleText}>
          {cleanRuleText(text)}
        </AppText>
      </View>
    </View>
  );

  // ==========================================================
  // REUSABLE PENALTY ITEM
  // NO DOTS OR VERTICAL BULLET INDICATORS
  // ==========================================================

  const renderPenaltyRule = (
    label,
    description,
    key
  ) => (
    <View
      key={key}
      style={styles.ruleRow}
    >
      <View style={styles.checkIconContainer}>
        <MaterialCommunityIcons
          name="check"
          size={15}
          color={theme.status.success}
        />
      </View>

      <View style={styles.ruleTextContainer}>
        <AppText style={styles.penaltyLabel}>
          {cleanRuleText(label)}
        </AppText>

        <AppText style={styles.penaltyDescription}>
          {cleanRuleText(description)}
        </AppText>
      </View>
    </View>
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <ScrollView
      style={styles.rulesContent}
      contentContainerStyle={styles.rulesContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {/* PAGE HEADER */}

      <View style={styles.pageHeader}>
        <View style={styles.titleIconContainer}>
          <MaterialCommunityIcons
            name="shield-check"
            size={28}
            color={theme.brand.primary}
          />
        </View>

        <AppText style={styles.rulesTitle}>
          {tSafe(
            'terms_title',
            'Terms & Conditions'
          )}
        </AppText>

        <AppText style={styles.pageSubtitle}>
          {tSafe(
            'terms_subtitle',
            'Please review the standards and policies before accepting a cleaning assignment.'
          )}
        </AppText>
      </View>

      {/* PROFESSIONAL STANDARDS */}

      {renderPolicySection({
        icon: 'shield-check-outline',
        title: tSafe(
          'professional_standards',
          'Professional Standards'
        ),
        children: [
          renderRule(
            tSafe(
              'arrive_early',
              'Arrive 10-15 minutes before scheduled time'
            ),
            'arrive'
          ),

          renderRule(
            tSafe(
              'wear_uniform',
              'Wear provided uniform and ID badge'
            ),
            'uniform'
          ),

          renderRule(
            tSafe(
              'bring_equipment',
              'Bring all necessary cleaning equipment'
            ),
            'equipment'
          ),

          renderRule(
            tSafe(
              'professional_conduct',
              'Maintain professional conduct at all times'
            ),
            'conduct'
          ),
        ],
      })}

      {/* PUNCTUALITY POLICY */}

      {renderPolicySection({
        icon: 'clock-outline',
        title: tSafe(
          'punctuality_policy',
          'Punctuality Policy'
        ),
        iconColor: theme.status.warning,
        children: [
          renderPenaltyRule(
            tSafe(
              'late_1_15_mins',
              'Late arrival (1-15 mins):'
            ),
            tSafe(
              'deduction_10_percent',
              '10% pay deduction'
            ),
            'late-1'
          ),

          renderPenaltyRule(
            tSafe(
              'late_16_30_mins',
              'Late arrival (16-30 mins):'
            ),
            tSafe(
              'deduction_25_percent',
              '25% pay deduction'
            ),
            'late-2'
          ),

          renderPenaltyRule(
            tSafe(
              'late_30_plus_mins',
              'Late arrival (30+ mins):'
            ),
            tSafe(
              'considered_no_show',
              'Considered no-show'
            ),
            'late-3'
          ),
        ],
      })}

      {/* NO-SHOW POLICY */}

      {renderPolicySection({
        icon: 'calendar-remove-outline',
        title: tSafe(
          'no_show_policy',
          'No-Show Policy'
        ),
        iconColor: theme.status.error,
        children: [
          renderPenaltyRule(
            tSafe(
              'first_no_show',
              'First no-show:'
            ),
            tSafe(
              'penalty_first_no_show',
              '$25 penalty + 1-week suspension'
            ),
            'no-show-1'
          ),

          renderPenaltyRule(
            tSafe(
              'second_no_show',
              'Second no-show:'
            ),
            tSafe(
              'penalty_second_no_show',
              '$50 penalty + 2-week suspension'
            ),
            'no-show-2'
          ),

          renderPenaltyRule(
            tSafe(
              'third_no_show',
              'Third no-show:'
            ),
            tSafe(
              'penalty_third_no_show',
              'Account deactivation'
            ),
            'no-show-3'
          ),
        ],
      })}

      {/* QUALITY STANDARDS */}

      {renderPolicySection({
        icon: 'star-outline',
        title: tSafe(
          'quality_standards',
          'Quality Standards'
        ),
        iconColor: theme.status.success,
        children: [
          renderRule(
            tSafe(
              'complete_tasks',
              'All tasks must be completed as specified'
            ),
            'complete-tasks'
          ),

          renderRule(
            tSafe(
              'photos_required',
              'Photos required for each completed room'
            ),
            'photos'
          ),

          renderRule(
            tSafe(
              'quality_report_time',
              'Client has 2 hours to report quality issues'
            ),
            'quality-time'
          ),

          renderRule(
            tSafe(
              'poor_quality_penalty',
              'Poor quality may result in partial payment'
            ),
            'quality-penalty'
          ),
        ],
      })}

      {/* CANCELLATION POLICY */}

      {renderPolicySection({
        icon: 'calendar-remove-outline',
        title: tSafe(
          'cancellation_policy',
          'Cancellation Policy'
        ),
        iconColor: theme.status.warning,
        children: [
          renderPenaltyRule(
            tSafe(
              'cancel_24_hours_plus',
              'Cancel 24+ hours before:'
            ),
            tSafe(
              'no_penalty',
              'No penalty'
            ),
            'cancel-1'
          ),

          renderPenaltyRule(
            tSafe(
              'cancel_4_24_hours',
              'Cancel 4-24 hours before:'
            ),
            tSafe(
              'penalty_15',
              '$15 penalty'
            ),
            'cancel-2'
          ),

          renderPenaltyRule(
            tSafe(
              'cancel_under_4_hours',
              'Cancel under 4 hours:'
            ),
            tSafe(
              'penalty_25',
              '$25 penalty'
            ),
            'cancel-3'
          ),
        ],
      })}

      {/* PAYMENT TERMS */}

      {/* CLEANER CANCELLATION POLICY */}

      {renderPolicySection({
        icon: 'calendar-remove-outline',
        title: tSafe(
          'cancellation_policy',
          'Cleaner Cancellation Policy'
        ),
        iconColor: theme.status.warning,
        children: [
          renderPenaltyRule(
            tSafe(
              'cleaner_cancel_more_72_hours',
              'More than 72 hours before:'
            ),
            tSafe(
              'cleaner_cancel_penalty_none',
              'No penalty'
            ),
            'cancel-more-72'
          ),

          renderPenaltyRule(
            tSafe(
              'cleaner_cancel_48_72_hours',
              '48–72 hours before:'
            ),
            tSafe(
              'cleaner_cancel_penalty_minor',
              'Minor penalty'
            ),
            'cancel-48-72'
          ),

          renderPenaltyRule(
            tSafe(
              'cleaner_cancel_24_48_hours',
              '24–48 hours before:'
            ),
            tSafe(
              'cleaner_cancel_penalty_moderate',
              'Moderate penalty'
            ),
            'cancel-24-48'
          ),

          renderPenaltyRule(
            tSafe(
              'cleaner_cancel_less_24_hours',
              'Less than 24 hours before:'
            ),
            tSafe(
              'cleaner_cancel_penalty_severe',
              'Severe penalty'
            ),
            'cancel-less-24'
          ),
        ],
      })}

      {/* AGREEMENT */}

      <View style={styles.agreementCard}>
        <View style={styles.agreementIconContainer}>
          <MaterialCommunityIcons
            name="handshake-outline"
            size={30}
            color={theme.brand.primary}
          />
        </View>

        <AppText style={styles.agreementTitle}>
          {tSafe(
            'agreement_heading',
            'Your Agreement'
          )}
        </AppText>

        <AppText style={styles.agreementText}>
          {tSafe(
            'agreement_text',
            'By clicking "I Agree & Accept", you acknowledge that you have read and agree to all terms and conditions outlined above.'
          )}
        </AppText>

        <View style={styles.agreementDivider} />

        <View style={styles.agreementFooter}>
          <MaterialCommunityIcons
            name="information-outline"
            size={17}
            color={theme.icon.muted}
          />

          <View style={styles.agreementFooterTextContainer}>
            <AppText style={styles.agreementFooterText}>
              {tSafe(
                'review_before_accepting',
                'Please review all policies before accepting.'
              )}
            </AppText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================================
// THEME-AWARE STYLES
// ============================================================

const createStyles = (theme) =>
  StyleSheet.create({
    // SCROLLVIEW

    rulesContent: {
      flexGrow: 0,
      flexShrink: 1,
      backgroundColor: theme.background.default,
    },

    rulesContentContainer: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 24,
    },

    // HEADER

    pageHeader: {
      alignItems: 'center',
      marginBottom: 22,
      paddingHorizontal: 8,
    },

    titleIconContainer: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginBottom: 13,
    },

    rulesTitle: {
      fontSize: 24,
      lineHeight: 31,
      fontWeight: '800',
      color: theme.text.primary,
      textAlign: 'center',
      letterSpacing: 0.2,
    },

    pageSubtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 7,
    },

    // POLICY CARDS

    sectionCard: {
      backgroundColor: theme.surface.elevated,
      borderRadius: 17,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.border.default,
      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.05,
      shadowRadius: 7,
      elevation: 2,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },

    sectionIconContainer: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    sectionTitle: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '800',
      color: theme.text.primary,
      marginLeft: 12,
    },

    // RULE LIST

    rulesList: {
      gap: 11,
    },

    ruleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
    },

    checkIconContainer: {
      width: 22,
      height: 22,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.status.success}18`,
      marginRight: 10,
      marginTop: 1,
    },

    ruleTextContainer: {
      flex: 1,
      minWidth: 0,
    },

    ruleText: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      flexShrink: 1,
    },

    // PENALTY TEXT

    penaltyLabel: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '700',
      color: theme.text.primary,
    },

    penaltyDescription: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      marginTop: 2,
    },

    // AGREEMENT

    agreementCard: {
      backgroundColor: theme.surface.elevated,
      borderRadius: 18,
      padding: 20,
      marginTop: 5,
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border.default,
      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    agreementIconContainer: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginBottom: 13,
    },

    agreementTitle: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      color: theme.text.primary,
      marginBottom: 8,
    },

    agreementText: {
      fontSize: 13,
      lineHeight: 21,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    agreementDivider: {
      width: '100%',
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border.divider || theme.border.default,
      marginVertical: 16,
    },

    agreementFooter: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
    },

    agreementFooterTextContainer: {
      flex: 1,
      marginLeft: 8,
    },

    agreementFooterText: {
      fontSize: 11,
      lineHeight: 17,
      color: theme.text.secondary,
    },
  });

export default TermsConditions;