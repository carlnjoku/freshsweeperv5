import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TaskInfoBanner = ({ task }) => {
//   const isGroupTask = task.schedule.group_task;
//   const estimatedPay = task.estimated_share;
//   const totalPrice = task.schedule.total_cleaning_fee;
//   const expected = task.schedule.expected_cleaners;
console.log("Task info", JSON.stringify(task, null, 2))
  const isGroupTask = task?.schedule?.group_task;
  const totalPrice = parseFloat(task?.schedule?.total_cleaning_fee) || 0;
  const expected = parseInt(task?.schedule?.expected_cleaners) || 2;

  // Calculate estimated pay
  const estimatedPay = isGroupTask ? totalPrice / expected : totalPrice;

  console.log(JSON.stringify(task.schedule, null, 2))
  console.log(task.schedule?.total_cleaning_fee)
  console.log(isGroupTask)
  return (
    <>
    {isGroupTask ? (
    <View style={styles.bannerContainer}>
      
        <>
          <Text style={styles.groupLabel}>
          <MaterialCommunityIcons name="account-group" size={20} color={COLORS.gray} /> Group Cleaning Task</Text>
          <Text style={styles.details}>
            Expected Cleaners: {expected}
          </Text>
          <Text style={styles.details}>
            Total Fee: ${parseFloat(totalPrice).toFixed(2)}
          </Text>
          <Text style={styles.details}>
            Your Estimated Share: ${parseFloat(estimatedPay).toFixed(2)}
          </Text>
          <Text style={styles.note}>
            Note: You’ll only be paid if selected and you participate in the task.
          </Text>
        </>
      
    </View>
    ) : (
      <View style={styles.bannerContainer}>
      
      <>
        <Text style={styles.groupLabel}>
        <MaterialCommunityIcons name="account-group" size={20} color={COLORS.gray} /> Group Cleaning Task</Text>
        <Text style={styles.details}>
          Expected Cleaners: {expected}
        </Text>
        <Text style={styles.details}>
          Total Fee: ${parseFloat(totalPrice).toFixed(2)}
        </Text>
        <Text style={styles.details}>
          Your Estimated Share: ${parseFloat(estimatedPay).toFixed(2)}
        </Text>
        <Text style={styles.note}>
          Note: You’ll only be paid if selected and you participate in the task.
        </Text>
      </>
    
  </View>
      )}
      </>
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