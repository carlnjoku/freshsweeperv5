// import React from 'react';
// import { SafeAreaView,StyleSheet, Text, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import ListItem from '../../../components/shared/ListItem';
// import COLORS from '../../../constants/colors';

// export default function Ongoing({schedules}) {
//     console.log("schedule............")
//     // console.log(schedules)
//     console.log("schedule............")
//     const singleItem = ( {item,index} ) => (
//         // <CardNoPrimary>
//             // <OngoingWorkListItem
//             // item={item}
//             // />
//             <ListItem 
//               item={item}
//             />
//         // </CardNoPrimary>
//     )

//     const itemSeparator = () => (
        
//         <View style={styles.item_separator}></View>
//       )
//       const emptyListing = () => (
//         <View style={styles.empty_listing}>
//           <Text style={styles.emptyText}>No new schedule found</Text>
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
//             ListEmptyComponent= {<Text style={styles.emptyText}>No ongoing schedule</Text>}
//             // ItemSeparatorComponent={itemSeparator}
//             ItemSeparatorComponent={() => <View style={styles.line}></View>}
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
import ListItem from '../../../components/shared/ListItem';
import COLORS from '../../../constants/colors';

export default function Ongoing({ schedules, isLoading = false }) {
  // Enhanced empty state function for cleaner ongoing jobs
  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'progress-clock',
        title: 'No Ongoing Jobs',
        message: 'You don\'t have any cleaning jobs in progress right now. Ongoing jobs will appear here once you start working on assigned tasks.'
      },
      started: {
        icon: 'play-circle-outline',
        title: 'No Jobs Started',
        message: 'You have assigned jobs but haven\'t started any yet. Tap on a job to begin cleaning and track your progress.'
      },
      active: {
        icon: 'run-fast',
        title: 'No Active Work',
        message: 'You\'re not currently working on any cleaning jobs. Start a job to begin tracking your tasks and time.'
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Unable to Load Jobs',
        message: 'There was an issue loading your ongoing jobs. Please pull down to refresh or check your connection.'
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
          <MaterialCommunityIcons name="play" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Start a Job</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const singleItem = ( {item, index} ) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      // delay={index * 100}
      delay={100}
    >
      <ListItem 
        item={item}
      />
    </Animatable.View>
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
        <Text style={styles.loadingText}>Loading ongoing jobs...</Text>
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
          ItemSeparatorComponent={() => <View style={styles.line}></View>}
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
  line: {
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.light_gray_1,
    marginBottom: 5,
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
});