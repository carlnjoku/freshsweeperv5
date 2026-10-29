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
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import OngoingWorkListItem from '../../../components/host/OngoingWorkListItem';
// import COLORS from '../../../constants/colors';

// export default function Ongoing({ schedules, isLoading = false }) {
//   // console.log("list of ongoing schedules", JSON.stringify(schedules, null, 2))

//   const excludedKeys = [
//     "overall_checklist",
//     "assignedTo",
//     "notified_cleaners"
//   ];

//   const json = JSON.stringify(
//     schedules,
//     (key, value) => excludedKeys.includes(key) ? undefined : value,
//     2
//   );

//   console.log(json)
//   // Enhanced empty state function
//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'clock-outline',
//         title: 'No Ongoing Work',
//         message: 'You don’t have any ongoing cleaning jobs at the moment. New schedules will appear here once assigned.'
//       },
//       upcoming: {
//         icon: 'calendar-clock',
//         title: 'No Upcoming Jobs',
//         message: 'You have no scheduled cleaning jobs. New bookings will appear here once confirmed.'
//       },
//       assigned: {
//         icon: 'account-clock',
//         title: 'No Assigned Cleaners',
//         message: 'Your scheduled jobs are waiting for cleaner assignments. Check back soon for updates.'
//       },
//       error: {
//         icon: 'alert-circle-outline',
//         title: 'Unable to Load Schedules',
//         message: 'There was an issue loading your ongoing work. Please pull down to refresh.'
//       }
//     };

//     const { icon, title, message } = messages[type] || messages.general;

//     return (
//       <Animatable.View 
//         animation="fadeIn" 
//         duration={600}
//         style={styles.emptyState}
//       >
//         <MaterialCommunityIcons 
//           name={icon} 
//           size={80} 
//           color={COLORS.light_gray} 
//         />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
        
//         {/* Optional: Add a call-to-action button */}
//         <TouchableOpacity style={styles.refreshButton}>
//           <Text style={styles.refreshButtonText}>Check for Updates</Text>
//         </TouchableOpacity>
//       </Animatable.View>
//     );
//   };

//   const singleItem = ( {item, index} ) => (
//     <CardNoPrimary>
//       <OngoingWorkListItem
//         item={item} 
//       />
//     </CardNoPrimary>
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
//         <Text style={styles.loadingText}>Loading ongoing work...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList 
//         data={schedules}
//         renderItem={singleItem}
//         ListHeaderComponentStyle={styles.list_header}
//         ListEmptyComponent={renderEmptyComponent}
//         ItemSeparatorComponent={itemSeparator}
//         keyExtractor={(item, index) => item._id || index.toString()}
//         numColumns={1}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={
//           schedules.length === 0 ? styles.emptyListContent : styles.listContent
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     backgroundColor: COLORS.background,
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
//     color: COLORS.gray,
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
//   refreshButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   refreshButtonText: {
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
// });


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
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import OngoingWorkListItem from '../../../components/host/OngoingWorkListItem';
// import COLORS from '../../../constants/colors';
// import { tSafe } from '../../../utils/tSafe'; // added import

// export default function Ongoing({ schedules, isLoading = false }) {
//   // console.log("list of ongoing schedules", JSON.stringify(schedules, null, 2))

//   const excludedKeys = [
//     "overall_checklist",
//     "assignedTo",
//     "notified_cleaners"
//   ];



//   const json = JSON.stringify(
//     schedules,
//     (key, value) => excludedKeys.includes(key) ? undefined : value,
//     2
//   );

//   console.log("Ongoing schedule--------01", json);
//   // Enhanced empty state function
//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'clock-outline',
//         title: tSafe('ongoing_empty_general_title', 'No Ongoing Work'),
//         message: tSafe('ongoing_empty_general_message', 'You don’t have any ongoing cleaning jobs at the moment. New schedules will appear here once assigned.')
//       },
//       upcoming: {
//         icon: 'calendar-clock',
//         title: tSafe('ongoing_empty_upcoming_title', 'No Upcoming Jobs'),
//         message: tSafe('ongoing_empty_upcoming_message', 'You have no scheduled cleaning jobs. New bookings will appear here once confirmed.')
//       },
//       assigned: {
//         icon: 'account-clock',
//         title: tSafe('ongoing_empty_assigned_title', 'No Assigned Cleaners'),
//         message: tSafe('ongoing_empty_assigned_message', 'Your scheduled jobs are waiting for cleaner assignments. Check back soon for updates.')
//       },
//       error: {
//         icon: 'alert-circle-outline',
//         title: tSafe('ongoing_empty_error_title', 'Unable to Load Schedules'),
//         message: tSafe('ongoing_empty_error_message', 'There was an issue loading your ongoing work. Please pull down to refresh.')
//       }
//     };

//     const { icon, title, message } = messages[type] || messages.general;

//     return (
//       <Animatable.View 
//         animation="fadeIn" 
//         duration={600}
//         style={styles.emptyState}
//       >
//         <MaterialCommunityIcons 
//           name={icon} 
//           size={80} 
//           color={COLORS.light_gray} 
//         />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
        
//         {/* Optional: Add a call-to-action button */}
//         {/* <TouchableOpacity style={styles.refreshButton}>
//           <Text style={styles.refreshButtonText}>{tSafe('check_for_updates', 'Check for Updates')}</Text>
//         </TouchableOpacity> */}
//       </Animatable.View>
//     );
//   };

//   const singleItem = ( {item, index} ) => (
//     <CardNoPrimary>
//       <OngoingWorkListItem
//         item={item} 
//       />
//     </CardNoPrimary>
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
//         <Text style={styles.loadingText}>{tSafe('loading_ongoing_work', 'Loading ongoing work...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList 
//         data={schedules}
//         renderItem={singleItem}
//         ListHeaderComponentStyle={styles.list_header}
//         ListEmptyComponent={renderEmptyComponent}
//         ItemSeparatorComponent={itemSeparator}
//         keyExtractor={(item, index) => item._id || index.toString()}
//         numColumns={1}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={
//           schedules.length === 0 ? styles.emptyListContent : styles.listContent
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     backgroundColor: COLORS.background,
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
//     color: COLORS.gray,
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
//   refreshButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   refreshButtonText: {
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
// });


// import React, { useCallback } from 'react';
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
// import { useNavigation } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import OngoingWorkListItem from '../../../components/host/OngoingWorkListItem';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { tSafe } from '../../../utils/tSafe'; // added import

// export default function Ongoing({ schedules, isLoading = false }) {
//   const navigation = useNavigation();

//   const excludedKeys = [
//     "overall_checklist",
//     "assignedTo",
//     "notified_cleaners"
//   ];

//   const json = JSON.stringify(
//     schedules,
//     (key, value) => excludedKeys.includes(key) ? undefined : value,
//     2
//   );

//   console.log("Ongoing schedule--------01", json);

//   // Enhanced empty state function
//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'clock-outline',
//         title: tSafe('ongoing_empty_general_title', 'No Ongoing Work'),
//         message: tSafe('ongoing_empty_general_message', 'You don’t have any ongoing cleaning jobs at the moment. New schedules will appear here once assigned.')
//       },
//       upcoming: {
//         icon: 'calendar-clock',
//         title: tSafe('ongoing_empty_upcoming_title', 'No Upcoming Jobs'),
//         message: tSafe('ongoing_empty_upcoming_message', 'You have no scheduled cleaning jobs. New bookings will appear here once confirmed.')
//       },
//       assigned: {
//         icon: 'account-clock',
//         title: tSafe('ongoing_empty_assigned_title', 'No Assigned Cleaners'),
//         message: tSafe('ongoing_empty_assigned_message', 'Your scheduled jobs are waiting for cleaner assignments. Check back soon for updates.')
//       },
//       error: {
//         icon: 'alert-circle-outline',
//         title: tSafe('ongoing_empty_error_title', 'Unable to Load Schedules'),
//         message: tSafe('ongoing_empty_error_message', 'There was an issue loading your ongoing work. Please pull down to refresh.')
//       }
//     };

//     const { icon, title, message } = messages[type] || messages.general;

//     return (
//       <Animatable.View 
//         animation="fadeIn" 
//         duration={600}
//         style={styles.emptyState}
//       >
//         <MaterialCommunityIcons 
//           name={icon} 
//           size={80} 
//           color={COLORS.light_gray} 
//         />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
//       </Animatable.View>
//     );
//   };

//   const handleItemPress = useCallback((item) => {
//     if (item._id) {
//       navigation.navigate(ROUTES.schedule_details, { scheduleId: item._id });
//     } else {
//       console.warn('Item does not have an _id:', item);
//     }
//   }, [navigation]);

//   const singleItem = useCallback(({ item, index }) => (
//     <TouchableOpacity 
//       onPress={() => handleItemPress(item)} 
//       activeOpacity={0.8}
//       style={styles.touchable}
//     >
//       <CardNoPrimary>
//         <OngoingWorkListItem item={item} />
//       </CardNoPrimary>
//     </TouchableOpacity>
//   ), [handleItemPress]);

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
//         <Text style={styles.loadingText}>{tSafe('loading_ongoing_work', 'Loading ongoing work...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList 
//         data={schedules}
//         renderItem={singleItem}
//         ListHeaderComponentStyle={styles.list_header}
//         ListEmptyComponent={renderEmptyComponent}
//         ItemSeparatorComponent={itemSeparator}
//         keyExtractor={(item, index) => item._id || index.toString()}
//         numColumns={1}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={
//           schedules.length === 0 ? styles.emptyListContent : styles.listContent
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: COLORS.background,
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
//     color: COLORS.gray,
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
//   touchable: {
//     marginBottom: 0,
//   },
//   list_header: {
//     // Your existing styles
//   },
// });




import React, {
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CardNoPrimary from '../../../components/shared/CardNoPrimary';
import OngoingWorkListItem from '../../../components/host/OngoingWorkListItem';

import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';

import { useTheme } from '../../../theme';
import { AppText } from '../../../ui';

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function Ongoing({
  schedules = [],
  isLoading = false,
}) {
  const navigation = useNavigation();

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  // ───────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────

  const renderEmptyState = useCallback(
    (type = 'general') => {
      const messages = {
        general: {
          icon: 'clock-outline',
          title: tSafe(
            'ongoing_empty_general_title',
            'No Ongoing Work'
          ),
          message: tSafe(
            'ongoing_empty_general_message',
            'You don’t have any ongoing cleaning jobs at the moment. New schedules will appear here once assigned.'
          ),
        },

        upcoming: {
          icon: 'calendar-clock',
          title: tSafe(
            'ongoing_empty_upcoming_title',
            'No Upcoming Jobs'
          ),
          message: tSafe(
            'ongoing_empty_upcoming_message',
            'You have no scheduled cleaning jobs. New bookings will appear here once confirmed.'
          ),
        },

        assigned: {
          icon: 'account-clock-outline',
          title: tSafe(
            'ongoing_empty_assigned_title',
            'No Assigned Cleaners'
          ),
          message: tSafe(
            'ongoing_empty_assigned_message',
            'Your scheduled jobs are waiting for cleaner assignments. Check back soon for updates.'
          ),
        },

        error: {
          icon: 'alert-circle-outline',
          title: tSafe(
            'ongoing_empty_error_title',
            'Unable to Load Schedules'
          ),
          message: tSafe(
            'ongoing_empty_error_message',
            'There was an issue loading your ongoing work. Please pull down to refresh.'
          ),
        },
      };

      const {
        icon,
        title,
        message,
      } = messages[type] || messages.general;

      return (
        <Animatable.View
          animation="fadeIn"
          duration={500}
          style={styles.emptyState}
        >
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={43}
              color={theme.brand.primary}
            />
          </View>

          <AppText
            variant="heading"
            style={styles.emptyStateTitle}
          >
            {title}
          </AppText>

          <AppText
            color={theme.text.secondary}
            style={styles.emptyStateText}
          >
            {message}
          </AppText>
        </Animatable.View>
      );
    },
    [styles, theme]
  );

  // ───────────────────────────────────────────────────────────
  // Schedule navigation
  // ───────────────────────────────────────────────────────────

  const handleItemPress = useCallback(
    (item) => {
      if (!item?._id) {
        console.warn(
          'Cannot open schedule: schedule ID is missing.'
        );

        return;
      }

      navigation.navigate(
        ROUTES.schedule_details,
        {
          scheduleId: item._id,
        }
      );
    },
    [navigation]
  );

  // ───────────────────────────────────────────────────────────
  // Schedule item
  // ───────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animatable.View
        animation="fadeInUp"
        duration={350}
        delay={Math.min(index * 60, 300)}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'open_schedule_details',
            'Open schedule details'
          )}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.8}
          style={styles.touchable}
        >
         
            <OngoingWorkListItem item={item} />
        
        </TouchableOpacity>
      </Animatable.View>
    ),
    [handleItemPress, styles]
  );

  // ───────────────────────────────────────────────────────────
  // Separator
  // ───────────────────────────────────────────────────────────

  const renderSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [styles]
  );

  // ───────────────────────────────────────────────────────────
  // Loading state
  // ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />
        </View>

        <AppText
          color={theme.text.secondary}
          style={styles.loadingText}
        >
          {tSafe(
            'loading_ongoing_work',
            'Loading ongoing work...'
          )}
        </AppText>
      </View>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Main render
  // ───────────────────────────────────────────────────────────

  const safeSchedules = Array.isArray(schedules)
    ? schedules
    : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={safeSchedules}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={(item, index) =>
          item?._id
            ? String(item._id)
            : `ongoing-schedule-${index}`
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {renderEmptyState('general')}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          safeSchedules.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Theme-aware styles
// ─────────────────────────────────────────────────────────────

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      backgroundColor: theme.background.default,
    },

    loadingIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
    },

    loadingText: {
      marginTop: 14,
      fontSize: 14,
      textAlign: 'center',
      color: theme.text.secondary,
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    itemSeparator: {
      height: 12,
    },

    touchable: {
      borderRadius: 16,
      overflow: 'hidden',
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 48,
    },

    emptyIconContainer: {
      width: 86,
      height: 86,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    emptyStateTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.text.primary,
      marginTop: 12,
      marginBottom: 9,
      textAlign: 'center',
    },

    emptyStateText: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 320,
    },
  });