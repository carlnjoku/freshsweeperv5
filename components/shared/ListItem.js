import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import ButtonPrimary from './ButtonPrimary';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme';

const ListItem = ({ item }) => {
  const { currentUserId } = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const assignedToForCleaner = item?.assignedTo?.find(
    (cleaner) => cleaner.cleanerId === currentUserId
  );

  const targetDate = moment(
    `${item.schedule.cleaning_date} ${item.schedule.cleaning_time}`,
    'YYYY-MM-DD HH:mm:ss'
  );

  const currentDate = moment();

  // Allow clock-in up to 15 minutes before the scheduled time.
  const canClockInEarly = currentDate.isAfter(
    targetDate.clone().subtract(15, 'minutes')
  );

  const isWorking =
    assignedToForCleaner?.status === 'in_progress' ||
    assignedToForCleaner?.status === 'pending_completion_approval';

  return (
    <View>
      <View style={styles.centerContent}>

        {/* Apartment */}
        <Text style={styles.headerText}>
          {item.schedule.apartment_name}
        </Text>

        {/* Address */}
        <Text style={styles.address}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={theme.icon.muted}
          />
          {item.schedule?.address}
        </Text>

        {/* Date */}
        <Text style={styles.date}>
          {moment(item.schedule?.cleaning_date).format('ddd MMM DD')}
        </Text>

        {/* Time */}
        <View style={styles.timeRow}>
          <Text style={styles.time}>
            {moment(
              item.schedule?.cleaning_time,
              'h:mm:ss A'
            ).format('h:mm A')}
          </Text>

          <Text style={styles.timeSeparator}>
            -
          </Text>

          <Text style={styles.time}>
            {moment(
              item.schedule?.cleaning_end_time,
              'h:mm:ss A'
            ).format('h:mm A')}
          </Text>
        </View>

        {/* Work already in progress */}
        {isWorking ? (
          <View style={styles.inProgressContainer}>
            <Text style={styles.statusText}>
              Work in Progress
            </Text>

            <ButtonPrimary
              title="Continue to Work"
              onPress={() =>
                navigation.navigate(
                  ROUTES.cleaner_attach_task_photos,
                  {
                    scheduleId: item._id,
                    schedule: item,
                    hostId: item.hostInfo._id,
                  }
                )
              }
            />
          </View>

        ) : currentDate.isAfter(targetDate) || canClockInEarly ? (

          /* Clock-In available */
          <ButtonPrimary
            title="Clock-In"
            onPress={() =>
              navigation.navigate(
                ROUTES.cleaner_clock_in,
                {
                  scheduleId: item._id,
                  cleaner: assignedToForCleaner,
                  schedule: item,
                }
              )
            }
          />

        ) : (

          /* Clock-In not available yet */
          <View style={styles.disabledContainer}>
            <Text style={styles.disabledText}>
              Clock-in available at{' '}
              {moment(targetDate)
                .subtract(15, 'minutes')
                .format('h:mm A')}
            </Text>

            <Text style={styles.subText}>
              Scheduled:{' '}
              {moment(
                item.schedule?.cleaning_time,
                'h:mm:ss A'
              ).format('h:mm A')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: 0,
      marginTop: 5,
    },

    dotline: {
      flex: 0.05,
      height: '100%',
      alignItems: 'flex-start',
    },

    line: {
      borderLeftWidth: 0.7,
      borderLeftColor: theme.border.default,
      minHeight: 78,
      marginHorizontal: 5,
      marginVertical: 0,
    },

    date_time: {
      flex: 0.25,
      alignItems: 'flex-end',
      marginRight: 5,
    },

    apart_name: {
      fontWeight: '500',
      color: theme.text.primary,
    },

    apartment: {
      color: theme.text.secondary,
      fontSize: 13,
    },

    date: {
      marginTop: -4,
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.primary,
    },

    time: {
      marginTop: 4,
      fontSize: 12,
      color: theme.text.secondary,
    },

    timeSeparator: {
      marginTop: 4,
      marginHorizontal: 8,
      fontSize: 12,
      color: theme.text.secondary,
    },

    headerText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: 'center',
    },

    address: {
      color: theme.text.secondary,
      marginBottom: 10,
      marginLeft: -5,
      fontSize: 13,
      textAlign: 'center',
    },

    assignee: {
      fontSize: 12,
      color: theme.text.secondary,
    },

    task_details: {
      flex: 0.7,
      alignItems: 'flex-start',
      width: '100%',
      marginTop: 10,
    },

    status: {
      textTransform: 'capitalize',
      color: theme.text.muted,
    },

    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.brand.primary,
      marginBottom: 5,
    },

    details: {
      fontSize: 12,
      color: theme.brand.primary,
      fontWeight: 'bold',
    },

    clockin: {
      fontSize: 12,
      marginLeft: 20,
      color: theme.brand.primary,
      fontWeight: 'bold',
    },

    action: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 5,
      marginBottom: 5,
    },

    centerContent: {
      alignItems: 'center',
      marginVertical: 5,
    },

    cardItem: {
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 40,
      padding: 12,
      backgroundColor: theme.card.background,
      marginBottom: 8,
      borderRadius: 8,
      shadowColor: theme.shadow?.color || '#000000',
      shadowOpacity: theme.shadow?.opacity || 0.1,
      shadowRadius: 5,
      elevation: 1,
      minHeight: 200,
      justifyContent: 'center',
    },

    inProgressContainer: {
      alignItems: 'center',
      marginTop: 8,
    },

    statusText: {
      color: theme.status.success,
      fontSize: 12,
      marginBottom: 5,
      fontWeight: 'bold',
    },

    disabledContainer: {
      padding: 10,
      backgroundColor: theme.background.sunken,
      borderColor: theme.border.default,
      borderWidth: 1,
      borderRadius: 8,
      marginTop: 10,
      alignItems: 'center',
    },

    disabledText: {
      color: theme.text.secondary,
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500',
    },

    subText: {
      color: theme.text.muted,
      fontSize: 10,
      marginTop: 2,
    },
  });

export default ListItem;