import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tSafe } from '../../utils/tSafe';

const TaskInfoBanner = ({ task }) => {
  const isGroupTask = task?.schedule?.group_task;
  const totalPrice = parseFloat(task?.schedule?.total_cleaning_fee) || 0;
  const expected = parseInt(task?.schedule?.expected_cleaners) || 2;

  // Calculate estimated pay
  const estimatedPay = isGroupTask ? totalPrice / expected : totalPrice;

  return (
    <View style={styles.bannerContainer}>
      {isGroupTask ? (
        <>
          <Text style={styles.groupLabel}>
            <MaterialCommunityIcons name="account-group" size={20} color={COLORS.gray} />
            {tSafe('group_cleaning_task', 'Group Cleaning Task')}
          </Text>
          <Text style={styles.details}>
            {tSafe('expected_cleaners', 'Expected Cleaners')}: {expected}
          </Text>
          <Text style={styles.details}>
            {tSafe('total_fee', 'Total Fee')}: ${totalPrice.toFixed(2)}
          </Text>
          <Text style={styles.details}>
            {tSafe('your_estimated_share', 'Your Estimated Share')}: ${estimatedPay.toFixed(2)}
          </Text>
          <Text style={styles.note}>
            {tSafe('group_note', 'Note: You’ll only be paid if selected and you participate in the task.')}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.soloLabel}>
            <MaterialCommunityIcons name="account" size={20} color={COLORS.green} />
            {tSafe('solo_cleaning_task', 'Solo Cleaning Task')}
          </Text>
          <Text style={styles.details}>
            {tSafe('cleaning_fee', 'Cleaning Fee')}: ${totalPrice.toFixed(2)}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#e6f2ff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  groupLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.primary,
  },
  soloLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.green,
  },
  details: {
    fontSize: 14,
    marginTop: 4,
    color: COLORS.gray,
  },
  note: {
    marginTop: 8,
    fontStyle: 'italic',
    fontSize: 12,
    color: COLORS.warning,
  },
});

export default TaskInfoBanner;