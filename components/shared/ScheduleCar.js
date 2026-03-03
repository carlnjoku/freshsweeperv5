import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import COLORS from '../../constants/colors';

const ScheduleCar = ({ schedule }) => {
 console.log("my scheduleessssssss")
 console.log(schedule.schedule.address)
 const address = schedule.schedule.address
 const cleaning_date = schedule.schedule.cleaning_date
 const cleaning_time = schedule.schedule.cleaning_time
 const cleaning_end_time = schedule.schedule.cleaning_end_time

  const {
    // cleaning_date,
    // cleaning_time,
    // cleaning_end_time,
    apartment,
    cleaner,
  } = schedule;

  const formattedDate = moment(cleaning_date).format('ddd, MMM D');
  const dateBadge = {
    day: moment(cleaning_date).format('D'),
    month: moment(cleaning_date).format('MMM'),
  };

  return (
    // <Card style={styles.card} mode="elevated">
    //   <Card.Content style={styles.content}>
    //     {/* Date Badge */}
    //     <View style={[styles.dateBadge, { backgroundColor: COLORS.primary }]}>
    //       <Text style={styles.day}>{dateBadge.day}</Text>
    //       <Text style={styles.month}>{dateBadge.month}</Text>
    //     </View>

    //     {/* Details */}
    //     <View style={styles.details}>
    //       {/* <MaterialIcons name="schedule" size={18} color={COLORS.outline} /> */}
    //       <Text variant="titleMedium" style={{ marginBottom: 2 }}>
    //         {/* {apartment?.name || 'Scheduled Cleaning'} */}
    //         {moment(cleaning_date).format('dddd')} tt
    //       </Text>
    //       <View style={styles.row}>
    //         <MaterialIcons name="schedule" size={18} color={COLORS.outline} />
    //         <Text style={styles.infoText}>
    //           {cleaning_time} - {cleaning_end_time || 'TBD'} bb
    //         </Text>
    //       </View>
    //       {address && (
    //         <View style={styles.row}>
    //           <MaterialIcons name="location-on" size={18} color={COLORS.outline} />
    //           <Text style={styles.infoText}>{address}</Text>
    //         </View>
    //       )}
          
    //     </View>
    //   </Card.Content>
    // </Card>

<TouchableOpacity
style={[
  styles.card,
  styles.scheduleCard,
  // selectedSchedule?._id === item._id && styles.selectedCard
]}
onPress={() => setSelectedSchedule(item)}
>
<View style={styles.scheduleDetails}>
  {/* <View style={styles.scheduleIcon}>
    <Feather name="calendar" size={24} color={COLORS.primary} />
  </View> */}

  <View style={[styles.dateBadge, { backgroundColor: COLORS.primary }]}>
    <Text style={styles.day}>{dateBadge.day}</Text>
    <Text style={styles.month}>{dateBadge.month}</Text>
  </View>
  <View>
    <Text style={styles.cardTitle}>
      {moment(cleaning_date).format('ddd, MMM D')}
    </Text>
    <Text style={styles.cardSubtitle}>
      {moment(cleaning_time, 'h:mm:ss A').format('h:mm A')}
    </Text>
  </View>
</View>
{/* {selectedSchedule?._id === item._id && (
  <View style={styles.checkBadge}>
    <Feather name="check" size={16} color="white" />
  </View>
)} */}
</TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },





  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  day: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  month: {
    fontSize: 14,
    color: 'white',
    textTransform: 'uppercase',
  },
  details: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
  },
});

export default ScheduleCar;



{/* <TouchableOpacity
      style={[
        styles.card,
        styles.scheduleCard,
        selectedSchedule?._id === item._id && styles.selectedCard
      ]}
      onPress={() => setSelectedSchedule(item)}
    >
      <View style={styles.scheduleDetails}>
        <View style={styles.scheduleIcon}>
          <Feather name="calendar" size={24} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.cardTitle}>
            {moment(item.schedule.cleaning_date).format('ddd, MMM D')}
          </Text>
          <Text style={styles.cardSubtitle}>
            {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
          </Text>
        </View>
      </View>
      {selectedSchedule?._id === item._id && (
        <View style={styles.checkBadge}>
          <Feather name="check" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity> */}


