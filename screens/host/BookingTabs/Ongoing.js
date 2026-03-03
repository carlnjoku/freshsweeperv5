// import React from 'react';
// import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import OngoingWorkListItem from '../../../components/host/OngoingWorkListItem';



// export default function Ongoing({schedules}) {

//     const singleItem = ( {item,index} ) => (
//         <CardNoPrimary>
//             <OngoingWorkListItem
//               item={item} 
//             />
//         </CardNoPrimary>
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
//     <View>
//         {/* <Animatable.View animation="fadeIn" duration={550}> */}
        
//         <FlatList 
//             data = {schedules}
//             renderItem = {singleItem}
//             ListHeaderComponentStyle={styles.list_header}
//             ListEmptyComponent={<Text style={styles.emptyText}>There is currently no work</Text>}
//             ItemSeparatorComponent={itemSeparator}
//             keyExtractor={(item, index)=> item.label}
//             numColumns={1}
//             showsVerticalScrollIndicator={false}
//         />
        
//         {/* </Animatable.View> */}
//     </View>
//   )
// }


// const styles = StyleSheet.create({
//   emptyText: {
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// })


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
import CardNoPrimary from '../../../components/shared/CardNoPrimary';
import OngoingWorkListItem from '../../../components/host/OngoingWorkListItem';
import COLORS from '../../../constants/colors';

export default function Ongoing({ schedules, isLoading = false }) {
  // console.log("list of ongoing schedules", JSON.stringify(schedules, null, 2))

  const excludedKeys = [
    "overall_checklist",
    "assignedTo",
    "notified_cleaners"
  ];

  const json = JSON.stringify(
    schedules,
    (key, value) => excludedKeys.includes(key) ? undefined : value,
    2
  );

  console.log(json)
  // Enhanced empty state function
  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'clock-outline',
        title: 'No Ongoing Work',
        message: 'You don’t have any ongoing cleaning jobs at the moment. New schedules will appear here once assigned.'
      },
      upcoming: {
        icon: 'calendar-clock',
        title: 'No Upcoming Jobs',
        message: 'You have no scheduled cleaning jobs. New bookings will appear here once confirmed.'
      },
      assigned: {
        icon: 'account-clock',
        title: 'No Assigned Cleaners',
        message: 'Your scheduled jobs are waiting for cleaner assignments. Check back soon for updates.'
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Unable to Load Schedules',
        message: 'There was an issue loading your ongoing work. Please pull down to refresh.'
      }
    };

    const { icon, title, message } = messages[type] || messages.general;

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={600}
        style={styles.emptyState}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={80} 
          color={COLORS.light_gray} 
        />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
        
        {/* Optional: Add a call-to-action button */}
        <TouchableOpacity style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Check for Updates</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const singleItem = ( {item, index} ) => (
    <CardNoPrimary>
      <OngoingWorkListItem
        item={item} 
      />
    </CardNoPrimary>
  );

  const itemSeparator = () => (
    <View style={styles.item_separator}></View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {renderEmptyState('general')}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading ongoing work...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.gray,
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
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  refreshButtonText: {
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
});