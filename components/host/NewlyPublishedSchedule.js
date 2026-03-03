// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
// } from "react-native";
// import { Card, Avatar, ActivityIndicator } from "react-native-paper";
// import COLORS from "../../constants/colors";
// import moment from "moment";
// import calculateDistance from "../../utils/calculateDistance";
// import ROUTES from "../../constants/routes";
// import { useNavigation } from "@react-navigation/native";
// import ChipNoSelect from "../shared/ChipNoSelect";

// const NewlyPublishedSchedule = ({ schedule, pendingCount }) => {
//   const navigation = useNavigation();

//   // console.log("My scheduleeeeeeeeeeeees", schedule)
 
//   const groupedSchedules = schedule.reduce((acc, current) => {
//     const existing = acc.find((item) => item.scheduleId === current.scheduleId);
//     const apartmentCoords = current.schedule;
//     const cleanerCoords = current.cleaner.location;

//     const distance = calculateDistance(
//       apartmentCoords.schedule.apartment_latitude,
//       apartmentCoords.schedule.apartment_longitude,
//       cleanerCoords.latitude,
//       cleanerCoords.longitude
//     );

//     if (existing) {
//       existing.totalRequests++;
//       if (current.status === "accepted") existing.accepted++;
//       if (current.status === "declined") existing.declined++;

//       if (!existing.cleaners.some((c) => c._id === current.cleaner._id)) {
//         existing.cleaners.push({
//           ...current.cleaner,
//           distance: `${distance}`,
//         });
//       }
//     } else {
//       acc.push({
//         scheduleId: current.scheduleId,
//         cleaning_date: current.cleaning_date,
//         cleaning_time: current.cleaning_time,
//         requestId: current._id,
//         cleaners: [
//           {
//             ...current.cleaner,
//             distance: `${distance}`,
//           },
//         ],
//         scheduleDetails: {
//           ...current.schedule,
//           apartment_location: {
//             lat: apartmentCoords.apartment_latitude,
//             lng: apartmentCoords.apartment_longitude,
//           },
//         },
//         totalRequests: 1,
//         accepted: current.status === "accepted" ? 1 : 0,
//         declined: current.status === "declined" ? 1 : 0,
//       });
//     }
//     return acc;
//   }, []);

//   groupedSchedules.forEach((group) => {
//     group.cleaners.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
//   });

//   return (
//     <View style={styles.cardContainer}>
//       <FlatList
//         data={groupedSchedules}
//         keyExtractor={(item) => item.scheduleId}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate(ROUTES.host_schedule_request, {
//                 scheduleId: item.scheduleDetails._id,
//                 schedule:item.scheduleDetails.schedule,
//                 // apartment_name: item.scheduleDetails.schedule.apartment_name,
//                 // apartment_address: item.scheduleDetails.schedule.address,
//                 cleaner: item.cleaners,
//                 requestId:item.requestId
//               })
//             }
//             activeOpacity={0.9}
//             style={styles.newCard}
//           >
            

//             <View style={styles.cardTopRow}>
//               <Avatar.Icon size={40} icon="calendar" style={styles.icon} />
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={styles.apartmentName}>
//                   {item.scheduleDetails.schedule.apartment_name}
//                 </Text>
//                 <Text style={styles.address}>
//                   {item.scheduleDetails.schedule.address}
//                 </Text>
//                 <Text style={styles.datetime}>
//                   {`${moment(item.cleaning_date).format("ddd, MMM D")} • ${moment(
//                     item.cleaning_time,
//                     "h:mm:ss A"
//                   ).format("h:mm A")}`}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.statsRow}>
//               <ChipNoSelect label={`${item.accepted} Accepted`} selected={false} />
//               <ChipNoSelect label={`${item.declined} Declined`} selected={false} />
//               <ChipNoSelect
//                 label={`${
//                   item.totalRequests - (item.accepted + item.declined)
//                 } Pending`}
//                 selected={false}
//               />
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {pendingCount > 0 && (
//         <View style={styles.pendingContainer}>
//           <ActivityIndicator animating={true} color="#FFA500" />
//           <Text style={styles.pendingText}>
//             Waiting for cleaners to accept... ({pendingCount} requests sent)
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: '#F9FAFB',
//     flex: 1,
//     paddingBottom: 20,
//   },
//   newCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     marginHorizontal: 16,
//     marginVertical: 10,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   apartmentName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#222',
//   },
//   address: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 2,
//   },
//   datetime: {
//     fontSize: 13,
//     color: '#888',
//     marginTop: 2,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   icon: {
//     backgroundColor: COLORS.light_pink_1,
//   },
//   pendingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   pendingText: {
//     marginLeft: 10,
//     color: '#FFA500',
//     fontWeight: '400',
//     fontSize: 13,
//   },
// });

// export default NewlyPublishedSchedule;




import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from "../../constants/colors";
import moment from "moment";
import calculateDistance from "../../utils/calculateDistance";
import ROUTES from "../../constants/routes";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const NewlyPublishedSchedule = ({ schedule, pendingCount }) => {
  const navigation = useNavigation();

  
  const groupedSchedules = schedule.reduce((acc, current) => {
    const existing = acc.find((item) => item.scheduleId === current.scheduleId);
    // console.log(existing)
    // console.log("rainnnnnnn------------", JSON.stringify(schedule[2].distanceFromApartment, null, 2))
    const apartmentCoords = current.schedule;
    const cleanerCoords = current.cleaner.location;
    // alert(apartmentCoords.schedule.apartment_latitude)
    const distance = calculateDistance(
      apartmentCoords.schedule.apartment_latitude,
      apartmentCoords.schedule.apartment_longitude,
      cleanerCoords.latitude,
      cleanerCoords.longitude
    );
    // console.log("Exisittttiiing", JSON.stringify(current, null, 2))
    if (existing) {
      existing.totalRequests++;
      if (current.status === "pending_payment") existing.accepted++;
      if (current.status === "declined") existing.declined++;

      // console.log(current.status)

      if (!existing.cleaners.some((c) => c._id === current.cleaner._id)) {
        existing.cleaners.push({
          ...current.cleaner,
          distance: `${distance}`,
        });
      }
    } else {
      acc.push({
        scheduleId: current.scheduleId,
        cleaning_date: current.cleaning_date,
        cleaning_time: current.cleaning_time,
        requestId: current._id,
        cleaners: [
          {
            ...current.cleaner,
            distance: `${distance}`,
          },
        ],
        scheduleDetails: {
          ...current.schedule,
          apartment_location: {
            lat: apartmentCoords.apartment_latitude,
            lng: apartmentCoords.apartment_longitude,
          },
        },
        totalRequests: 1,
        accepted: current.status === "pending_payment" ? 1 : 0,
        declined: current.status === "declined" ? 1 : 0,
      });
    }
    return acc;
  }, []);

  groupedSchedules.forEach((group) => {
    group.cleaners.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  });

  const getStatusChipStyle = (count, type) => {
    const baseStyle = {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
    };

    const statusStyles = {
      accepted: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#34C759',
      },
      declined: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#FF3B30',
      },
      pending: {
        backgroundColor: '#FFF3E0',
        borderWidth: 1,
        borderColor: '#FF9500',
      },
    };

    const textColors = {
      accepted: '#2E7D32',
      declined: '#C62828',
      pending: '#EF6C00',
    };

    return {
      container: { ...baseStyle, ...statusStyles[type] },
      count: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: textColors[type],
        marginRight: 4,
      },
      label: { 
        fontSize: 12, 
        fontWeight: '600', 
        color: textColors[type] 
      },
      countText: count.toString(),
    };
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedSchedules}
        keyExtractor={(item) => item.scheduleId}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.host_schedule_request, {
                scheduleId: item.scheduleDetails._id,
                schedule: item.scheduleDetails.schedule,
                cleaner: item.cleaners,
                requestId: item.requestId
              })
            }
            activeOpacity={0.7}
            style={styles.card}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name="calendar-clock" 
                  size={22} 
                  color={COLORS.primary} 
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.scheduleDetails.schedule.apartment_name}
                  
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.scheduleDetails.schedule.address}
                  
                </Text>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.datetimeContainer}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={16} 
                color="#666" 
              />
              <Text style={styles.datetimeText}>
                {`${moment(item.cleaning_date).format("ddd, MMM D")} • ${moment(
                  item.cleaning_time,
                  "h:mm:ss A"
                ).format("h:mm A")}`}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Response Status</Text>
              
              <View style={styles.statsGrid}>
                {/* Accepted */}
                <View style={styles.statCard}>
                  <View style={styles.statCardContent}>
                    <View style={[styles.statIndicator, styles.acceptedIndicator]} />
                    <View style={styles.statTextContainer}>
                      <Text style={styles.statCount}>{item.accepted}</Text>
                      <Text style={styles.statLabel}>Accepted</Text>
                    </View>
                    <View style={styles.statProgressContainer}>
                      <View style={[styles.statProgressBar, { 
                        width: `${Math.max(20, (item.accepted / item.totalRequests) * 100)}%` 
                      }]} />
                    </View>
                  </View>
                </View>

                {/* Declined */}
                <View style={styles.statCard}>
                  <View style={styles.statCardContent}>
                    <View style={[styles.statIndicator, styles.declinedIndicator]} />
                    <View style={styles.statTextContainer}>
                      <Text style={styles.statCount}>{item.declined}</Text>
                      <Text style={styles.statLabel}>Declined</Text>
                    </View>
                    <View style={styles.statProgressContainer}>
                      <View style={[styles.statProgressBar, { 
                        width: `${Math.max(20, (item.declined / item.totalRequests) * 100)}%` 
                      }]} />
                    </View>
                  </View>
                </View>

                {/* Pending */}
                <View style={styles.statCard}>
                  <View style={styles.statCardContent}>
                    <View style={[styles.statIndicator, styles.pendingIndicator1]} />
                    <View style={styles.statTextContainer}>
                      <Text style={styles.statCount}>
                        {item.totalRequests - (item.accepted + item.declined)}
                      </Text>
                      
                      <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statProgressContainer}>
                      <View style={[styles.statProgressBar, { 
                        width: `${Math.max(20, ((item.totalRequests - (item.accepted + item.declined)) / item.totalRequests) * 100)}%` 
                      }]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() =>
                navigation.navigate(ROUTES.host_schedule_request, {
                  scheduleId: item.scheduleDetails._id,
                  schedule: item.scheduleDetails.schedule,
                  cleaner: item.cleaners,
                  requestId: item.requestId
                })
              }
            >
              <Text style={styles.viewButtonText}>View Details</Text>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={18} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Pending Indicator */}
      {pendingCount > 0 && (
        <View style={styles.pendingIndicator}>
          <View style={styles.pendingBadge}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingBadgeText}>
              {pendingCount}
            </Text>
          </View>
          <View style={styles.pendingTextContainer}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={16} 
              color="#FF9500" 
            />
            <Text style={styles.pendingText}>
              Waiting for cleaners to accept
            </Text>
            <Text style={styles.pendingSubtext}>
              {pendingCount} request{pendingCount > 1 ? 's' : ''} sent
            </Text>
          </View>
        </View>
      )}

      {groupedSchedules.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="calendar-search" 
            size={48} 
            color="#D1D1D6" 
          />
          <Text style={styles.emptyStateTitle}>No Active Requests</Text>
          <Text style={styles.emptyStateText}>
            Create a new cleaning schedule to get started
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  datetimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  datetimeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 70,
    backgroundColor: '#FFF',
  },
  acceptedChip: {
    borderWidth: 1.5,
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
  },
  declinedChip: {
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  pendingChip: {
    borderWidth: 1.5,
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
  },
  statusCount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  acceptedText: {
    color: '#2E7D32',
  },
  declinedText: {
    color: '#D32F2F',
  },
  pendingText: {
    color: '#F57C00',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.2)',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 6,
  },
  pendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 4,
  },
  pendingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pendingTextContainer: {
    flex: 1,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 2,
  },
  pendingSubtext: {
    fontSize: 12,
    color: '#FFB74D',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F9F9FB',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 20,
  },





  statsContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsTotal: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  acceptedIndicator: {
    backgroundColor: '#34C759',
  },
  declinedIndicator: {
    backgroundColor: '#FF3B30',
  },
  pendingIndicator1: {
    backgroundColor: '#FF9500',
  },
  statTextContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statProgressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
  },
  // // Alternative progress visualization styles
  // progressVisualization: {
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 16,
  //   padding: 20,
  //   borderWidth: 1,
  //   borderColor: '#F0F0F0',
  // },
  // progressSegmentContainer: {
  //   marginBottom: 16,
  // },
  // progressSegment: {
  //   height: 8,
  //   backgroundColor: '#F5F5F7',
  //   borderRadius: 4,
  //   marginBottom: 8,
  //   overflow: 'hidden',
  // },
  // progressFill: {
  //   height: '100%',
  //   borderRadius: 4,
  // },
  // segmentInfo: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  // },
  // segmentLabelRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // segmentDot: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 6,
  //   marginRight: 8,
  // },
  // segmentLabel: {
  //   fontSize: 14,
  //   color: '#1C1C1E',
  //   fontWeight: '500',
  // },
  // segmentStats: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 8,
  // },
  // segmentCount: {
  //   fontSize: 16,
  //   fontWeight: '700',
  // },
  // segmentPercentage: {
  //   fontSize: 14,
  //   color: '#666',
  //   fontWeight: '500',
  // },
  
});

export default NewlyPublishedSchedule;