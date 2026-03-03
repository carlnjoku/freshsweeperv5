// import React from 'react';
// import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import COLORS from '../../../constants/colors';
// import UpcomingScheduleItem from '../../../components/shared/UpcomingScheduleItem';
// import UpcomingScheduleListItem from '../../../components/shared/UpcomingScheduleListItem';

// export default function Upcoming({schedules}) {
//     const singleItem = ( {item,index} ) => (


//         <UpcomingScheduleItem 
//           item={item}
//         />

//     )

//     const itemSeparator = () => (
        
//         <View style={styles.item_separator}></View>
//       )
//       const emptyListing = () => (
//         <View style={styles.empty_listing}>
//           <Text>No new schedule found </Text>
//           {/* {apartments.length < 1 && 
//             <TouchableOpacity style={styles.button} onPress= {() => navigation.navigate(ROUTES.host_add_apt)}><Text style={styles.add_apartment_text}>Add Apartment</Text></TouchableOpacity>
//           } */}
//         </View>
//       )


//   return (
//     <View style={{paddingVertical:15}}>
//         <Animatable.View animation="fadeIn" duration={550}>
//         <FlatList 
//             data = {schedules}
//             renderItem = {singleItem}
//             ListHeaderComponentStyle={styles.list_header}
//             ListEmptyComponent= {<Text style={styles.emptyText}>No new schedule found</Text>} 
//             ItemSeparatorComponent={itemSeparator}
//             keyExtractor={(item, index)=> item.label}
//             numColumns={1}
//             showsVerticalScrollIndicator={false}
//         />
//         </Animatable.View>
//     </View>
//   )
  
// }

// const styles = StyleSheet.create({
//   line: {
//     borderBottomWidth: 0.7,
//     borderBottomColor: COLORS.light_gray_1,
//     marginBottom: 5,
//   },
//   emptyText: {
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// })



// import React from 'react';
// import { 
//   SafeAreaView,
//   StyleSheet, 
//   Text, 
//   StatusBar, 
//   Linking, 
//   FlatList, 
//   ScrollView, 
//   Modal, 
//   Image, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator 
// } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import UpcomingScheduleItem from '../../../components/shared/UpcomingScheduleItem';
// import UpcomingScheduleListItem from '../../../components/shared/UpcomingScheduleListItem';

// export default function Upcoming({ schedules, isLoading = false }) {
//   // Enhanced empty state function for cleaner side
//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'calendar-blank',
//         title: 'No Upcoming Jobs',
//         message: 'You don’t have any upcoming cleaning jobs. New assignments will appear here once you\'re booked.'
//       },
//       assigned: {
//         icon: 'account-clock',
//         title: 'No Assigned Jobs',
//         message: 'You haven\'t been assigned to any cleaning jobs yet. Available jobs will appear here when hosts book your services.'
//       },
//       available: {
//         icon: 'briefcase-outline',
//         title: 'No Available Jobs',
//         message: 'There are no available cleaning jobs in your area at the moment. Check back later for new opportunities.'
//       },
//       error: {
//         icon: 'alert-circle-outline',
//         title: 'Unable to Load Jobs',
//         message: 'There was an issue loading your upcoming jobs. Please pull down to refresh or check your connection.'
//       }
//     };

//     const { icon, title, message } = messages[type] || messages.general;

//     return (
//       <Animatable.View 
//         animation="fadeInUp" 
//         duration={600}
//         delay={100}
//         style={styles.emptyState}
//       >
//         <MaterialCommunityIcons 
//           name={icon} 
//           size={80} 
//           color={COLORS.light_gray} 
//         />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
        
//         {/* Optional: Add a call-to-action button for cleaners */}
//         <TouchableOpacity style={styles.actionButton}>
//           <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
//           <Text style={styles.actionButtonText}>Check for New Jobs</Text>
//         </TouchableOpacity>
//       </Animatable.View>
//     );
//   };

//   const singleItem = ( {item, index} ) => (
//     <Animatable.View 
//       animation="fadeInUp" 
//       duration={500}
//       delay={100}
//     >
//       <UpcomingScheduleItem 
//         item={item}
//       />
//     </Animatable.View>
//   );

//   const itemSeparator = () => (
//     <View style={styles.item_separator}></View>
//   );

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       {renderEmptyState('general')}
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading upcoming jobs...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Animatable.View animation="fadeIn" duration={550} style={styles.animatedContainer}>
//         <FlatList 
//           data={schedules}
//           renderItem={singleItem}
//           ListHeaderComponentStyle={styles.list_header}
//           ListEmptyComponent={renderEmptyComponent}
//           ItemSeparatorComponent={itemSeparator}
//           keyExtractor={(item, index) => item._id || index.toString()}
//           numColumns={1}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={
//             schedules.length === 0 ? styles.emptyListContent : styles.listContent
//           }
//         />
//       </Animatable.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     paddingVertical: 15,
//   },
//   animatedContainer: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//     paddingTop: 8,
//   },
//   emptyListContent: {
//     flexGrow: 1,
//   },
//   item_separator: {
//     height: 12,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 40,
//     paddingVertical: 60,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.darkGray,
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   emptyText: {
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   list_header: {
//     // Your existing styles
//   },
//   line: {
//     borderBottomWidth: 0.7,
//     borderBottomColor: COLORS.light_gray_1,
//     marginBottom: 5,
//   },
// });




import React from 'react';
import { 
  SafeAreaView,
  StyleSheet, 
  Text, 
  StatusBar, 
  Linking, 
  FlatList, 
  ScrollView, 
  Modal, 
  Image, 
  View, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import UpcomingScheduleItem from '../../../components/shared/UpcomingScheduleItem';
import UpcomingScheduleListItem from '../../../components/shared/UpcomingScheduleListItem';

// Helper function to check if current time is within 15 minutes of cleaning start
const isWithin15MinutesBefore = (cleaningDate, cleaningTime) => {
  try {
    // Combine date and time to create cleaning start datetime
    const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}`);
    const now = new Date();
    
    // Calculate time difference in milliseconds
    const timeDiff = cleaningStart.getTime() - now.getTime();
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    // Return true if current time is within 15 minutes before cleaning start
    // and cleaning hasn't started yet
    return timeDiff <= fifteenMinutes && timeDiff > 0;
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return false;
  }
};

// Enhanced helper function with more options
const getClockInStatus = (cleaningDate, cleaningTime) => {
  try {
    const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}`);
    const now = new Date();
    const timeDiff = cleaningStart.getTime() - now.getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    if (timeDiff <= 0) {
      return { canClockIn: false, status: 'past', message: 'Cleaning time has passed' };
    } else if (timeDiff <= fifteenMinutes) {
      return { canClockIn: true, status: 'within_15_min', message: 'Clock in available' };
    } else if (timeDiff <= oneHour) {
      const minutesLeft = Math.ceil(timeDiff / (60 * 1000));
      return { 
        canClockIn: false, 
        status: 'within_1_hour', 
        message: `Clock in available in ${minutesLeft - 15} minutes` 
      };
    } else {
      return { canClockIn: false, status: 'future', message: 'Clock in not yet available' };
    }
  } catch (error) {
    console.error('Error calculating clock in status:', error);
    return { canClockIn: false, status: 'error', message: 'Time calculation error' };
  }
};

export default function Upcoming({ schedules, isLoading = false }) {
  // Enhanced empty state function for cleaner side
  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'calendar-blank',
        title: 'No Upcoming Jobs',
        message: 'You don’t have any upcoming cleaning jobs. New assignments will appear here once you\'re booked.'
      },
      assigned: {
        icon: 'account-clock',
        title: 'No Assigned Jobs',
        message: 'You haven\'t been assigned to any cleaning jobs yet. Available jobs will appear here when hosts book your services.'
      },
      available: {
        icon: 'briefcase-outline',
        title: 'No Available Jobs',
        message: 'There are no available cleaning jobs in your area at the moment. Check back later for new opportunities.'
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Unable to Load Jobs',
        message: 'There was an issue loading your upcoming jobs. Please pull down to refresh or check your connection.'
      }
    };

    const { icon, title, message } = messages[type] || messages.general;

    return (
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        delay={100}
        style={styles.emptyState}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={80} 
          color={COLORS.light_gray} 
        />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
        
        {/* Optional: Add a call-to-action button for cleaners */}
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Check for New Jobs</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const singleItem = ({ item, index }) => {
    // Get clock in status for this schedule
    const scheduleData = item.schedule || {};
    const clockInStatus = getClockInStatus(
      scheduleData.cleaning_date, 
      scheduleData.cleaning_time
    );

    return (
      <Animatable.View 
        animation="fadeInUp" 
        duration={500}
        delay={100}
      >
        <UpcomingScheduleItem 
          item={item}
          canClockIn={clockInStatus.canClockIn}
          clockInStatus={clockInStatus}
        />
      </Animatable.View>
    );
  };

  const itemSeparator = () => (
    <View style={styles.item_separator}></View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {renderEmptyState('general')}
    </View>
  );

  // Debug: Show how many schedules have clock-in available
  React.useEffect(() => {
    if (schedules && schedules.length > 0) {
      const availableClockIns = schedules.filter(schedule => {
        const scheduleData = schedule.schedule || {};
        return isWithin15MinutesBefore(
          scheduleData.cleaning_date, 
          scheduleData.cleaning_time
        );
      }).length;
      
      console.log(`📊 Upcoming schedules: ${schedules.length}, Clock-in available: ${availableClockIns}`);
    }
  }, [schedules]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading upcoming jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={550} style={styles.animatedContainer}>
        <FlatList 
          data={schedules}
          renderItem={singleItem}
          ListHeaderComponentStyle={styles.list_header}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={itemSeparator}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            schedules.length === 0 ? styles.emptyListContent : styles.listContent
          }
        />
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 15,
  },
  animatedContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  item_separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  list_header: {
    // Your existing styles
  },
  line: {
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.light_gray_1,
    marginBottom: 5,
  },
});