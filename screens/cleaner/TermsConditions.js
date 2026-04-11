import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors'; // adjust path
import { tSafe } from '../../utils/tSafe'; // added import

const TermsConditions = () => {
  return (
    <ScrollView style={styles.rulesContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.rulesTitle}>{tSafe('terms_title', 'Terms & Conditions')}</Text>

      {/* Professional Standards */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{tSafe('professional_standards', 'Professional Standards')}</Text>
        </View>
        <View style={styles.rulesList}>
          <Text style={styles.rulesText}>{tSafe('arrive_early', '• Arrive 10-15 minutes before scheduled time')}</Text>
          <Text style={styles.rulesText}>{tSafe('wear_uniform', '• Wear provided uniform and ID badge')}</Text>
          <Text style={styles.rulesText}>{tSafe('bring_equipment', '• Bring all necessary cleaning equipment')}</Text>
          <Text style={styles.rulesText}>{tSafe('professional_conduct', '• Maintain professional conduct at all times')}</Text>
        </View>
      </View>

      {/* Punctuality Policy */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{tSafe('punctuality_policy', 'Punctuality Policy')}</Text>
        </View>
        <View style={styles.rulesList}>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('late_1_15_mins', 'Late arrival (1-15 mins):')}</Text> {tSafe('deduction_10_percent', '10% pay deduction')}
          </Text>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('late_16_30_mins', 'Late arrival (16-30 mins):')}</Text> {tSafe('deduction_25_percent', '25% pay deduction')}
          </Text>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('late_30_plus_mins', 'Late arrival (30+ mins):')}</Text> {tSafe('considered_no_show', 'Considered no-show')}
          </Text>
        </View>
      </View>

      {/* No-Show Policy */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="cancel" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{tSafe('no_show_policy', 'No-Show Policy')}</Text>
        </View>
        <View style={styles.rulesList}>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('first_no_show', 'First no-show:')}</Text> {tSafe('penalty_first_no_show', '$25 penalty + 1-week suspension')}
          </Text>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('second_no_show', 'Second no-show:')}</Text> {tSafe('penalty_second_no_show', '$50 penalty + 2-week suspension')}
          </Text>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('third_no_show', 'Third no-show:')}</Text> {tSafe('penalty_third_no_show', 'Account deactivation')}
          </Text>
        </View>
      </View>

      {/* Quality Standards */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="star-outline" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{tSafe('quality_standards', 'Quality Standards')}</Text>
        </View>
        <View style={styles.rulesList}>
          <Text style={styles.rulesText}>{tSafe('complete_tasks', '• All tasks must be completed as specified')}</Text>
          <Text style={styles.rulesText}>{tSafe('photos_required', '• Photos required for each completed room')}</Text>
          <Text style={styles.rulesText}>{tSafe('quality_report_time', '• Client has 2 hours to report quality issues')}</Text>
          <Text style={styles.rulesText}>{tSafe('poor_quality_penalty', '• Poor quality may result in partial payment')}</Text>
        </View>
      </View>

      {/* Cancellation Policy */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="calendar-remove-outline" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{tSafe('cancellation_policy', 'Cancellation Policy')}</Text>
        </View>
        <View style={styles.rulesList}>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('cancel_24_hours_plus', 'Cancel 24+ hours before:')}</Text> {tSafe('no_penalty', 'No penalty')}
          </Text>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('cancel_4_24_hours', 'Cancel 4-24 hours before:')}</Text> {tSafe('penalty_15', '$15 penalty')}
          </Text>
          <Text style={styles.rulesText}>
            <Text style={styles.penaltyText}>{tSafe('cancel_under_4_hours', 'Cancel under 4 hours:')}</Text> {tSafe('penalty_25', '$25 penalty')}
          </Text>
        </View>
      </View>

      {/* Payment Terms */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="cash" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{tSafe('payment_terms', 'Payment Terms')}</Text>
        </View>
        <View style={styles.rulesList}>
          <Text style={styles.rulesText}>{tSafe('payment_release', '• Payment released 24 hours after completion')}</Text>
          <Text style={styles.rulesText}>{tSafe('client_disputes', '• Client disputes may delay payment')}</Text>
          <Text style={styles.rulesText}>{tSafe('damage_claims', '• Damage claims investigated within 48 hours')}</Text>
          <Text style={styles.rulesText}>{tSafe('weekly_payout', '• Weekly payout every Friday')}</Text>
        </View>
      </View>

      {/* Agreement Section */}
      <View style={styles.agreementCard}>
        <MaterialCommunityIcons name="hand-peace" size={32} color={COLORS.primary} />
        <Text style={styles.agreementText}>
          {tSafe('agreement_text', 'By clicking "I Agree & Accept", you acknowledge that you have read and agree to all terms and conditions outlined above.')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rulesContent: {
    // flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  rulesTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    letterSpacing: 0.5,
    marginLeft:20
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 12,
  },
  rulesList: {
    marginLeft: 36, // aligns bullet points with the start of the title text (icon + 12px margin + icon width)
  },
  rulesText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 6,
  },
  penaltyText: {
    fontWeight: '600',
    color: '#E67E22',
  },
  agreementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  agreementText: {
    fontSize: 15,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
});

export default TermsConditions;