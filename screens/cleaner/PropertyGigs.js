// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';

// // Simple GigCard component – replace with your own if available
// const GigCard = ({ gig, onPress }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'upcoming': return COLORS.primary;
//       case 'completed': return '#4CAF50';
//       case 'cancelled': return COLORS.error;
//       default: return COLORS.gray;
//     }
//   };

//   return (
//     <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
//       <View style={styles.cardHeader}>
//         <View style={styles.gigInfo}>
//           <Text style={styles.gigTitle}>Cleaning Job</Text>
//           <View style={styles.statusBadge}>
//             <Text style={[styles.statusText, { color: getStatusColor(gig.status) }]}>
//               {gig.status?.toUpperCase() || 'UNKNOWN'}
//             </Text>
//           </View>
//         </View>
//         <Text style={styles.gigDate}>
//           {gig.date ? moment(gig.date).format('MMM DD, YYYY') : 'Date TBD'}
//         </Text>
//       </View>
//       <View style={styles.gigDetails}>
//         <View style={styles.detailRow}>
//           <MaterialIcons name="access-time" size={16} color={COLORS.gray} />
//           <Text style={styles.detailText}>{gig.time || 'Time TBD'}</Text>
//         </View>
//         <View style={styles.detailRow}>
//           <MaterialCommunityIcons name="currency-usd" size={16} color={COLORS.gray} />
//           <Text style={styles.detailText}>${gig.pay?.toFixed(2) || '0.00'}</Text>
//         </View>
//       </View>
//       <View style={styles.cardFooter}>
//         <Text style={styles.viewDetails}>View Details</Text>
//         <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default function PropertyGigs() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { property } = route.params; // property object from MyGigs screen
//   const { currentUserId, userToken } = useContext(AuthContext);
//   const [gigs, setGigs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchGigs();
//   }, []);

//   const fetchGigs = async () => {
//     try {
//       setError(null);
      
//       // Call your API – adjust endpoint as needed
//       const response = await userService.getPropertyGigs(property.property_id, userToken);
//       console.log("My gigs----------YB", response.data)
//       // Assuming response.data is an array of gigs
//       setGigs(response.data || []);
//     } catch (err) {
//       console.error('Failed to fetch gigs for property:', err);
//       setError('Could not load gigs. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGigPress = (gig) => {
//     // Navigate to gig details screen
//     navigation.navigate(ROUTES.cleaner_schedule_details_view, { gigId: gig._id });
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchGigs}>
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   if (gigs.length === 0) {
//     return (
//       <View style={styles.centered}>
//         <MaterialCommunityIcons name="calendar-blank" size={64} color={COLORS.light_gray} />
//         <Text style={styles.emptyTitle}>No Gigs Found</Text>
//         <Text style={styles.emptyText}>
//           You don't have any cleaning jobs at {property.property_name} yet.
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={gigs}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <GigCard gig={item} onPress={() => handleGigPress(item)} />
//         )}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FA',
//     padding: 20,
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   retryButton: {
//     marginTop: 16,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//   },
//   retryText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 16,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 8,
//     paddingHorizontal: 20,
//   },
//   // GigCard styles
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   gigInfo: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   gigTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginRight: 8,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     backgroundColor: '#F0F0F0',
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   gigDate: {
//     fontSize: 13,
//     color: '#666',
//   },
//   gigDetails: {
//     marginBottom: 12,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   detailText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: '#555',
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//     paddingTop: 12,
//   },
//   viewDetails: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
// });


import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import { AuthContext } from "../../context/AuthContext";
import userService from "../../services/connection/userService";
import COLORS from "../../constants/colors";
import ROUTES from "../../constants/routes";

/* ----------------------------- CARD COMPONENT ----------------------------- */
const GigCard = ({ gig, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return COLORS.primary;
      case "completed":
        return "#34C759";
      case "cancelled":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.gigTitle}>Cleaning Job</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(gig.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {gig.status?.toUpperCase() || "UNKNOWN"} 
            </Text>
          </View>
        </View>

        <Text style={styles.propertyName}>{gig.property_name} </Text>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={18}
            color="#6C6C80"
          />
          <Text style={styles.detailText}>
            {gig.date ? moment(gig.date).format("MMM DD, YYYY") : "Date TBD"}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={16} color="#6C6C80" />
            <Text style={styles.detailItemText}>{gig.time || "Time TBD"}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#6C6C80" />
            <Text style={styles.detailItemText}>
              ${gig.pay?.toFixed(2) || "0.00"}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetails}>View Details</Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* --------------------------- MAIN SCREEN --------------------------- */
export default function PropertyGigs() {
  const route = useRoute();
  const navigation = useNavigation();
  const { property } = route.params;
  const { userToken } = useContext(AuthContext);

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setError(null);
      const response = await userService.getPropertyGigs(property.property_id, userToken);
      
      console.log("My gigs-------p",response.data)
      setGigs(response.data || []);
    } catch (err) {
      console.log(err);
      setError("Could not load gigs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGigs();
  };

  const handleGigPress = (gig) => {
    navigation.navigate(ROUTES.cleaner_schedule_details_view, { scheduleId: gig.scheduleId });
  };

  // Separate gigs by status
  const upcoming = gigs.filter((g) => g.status === "upcoming");
  const past = gigs.filter((g) => g.status !== "upcoming");

  // Timeline item renderer
  const renderTimelineItem = ({ item, index, sectionLength, isPast }) => (
    <View style={styles.timelineRow}>
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: isPast ? "#C4C4C6" : COLORS.primary },
          ]}
        />
        {index !== sectionLength - 1 && (
          <View
            style={[
              styles.timelineLine,
              { backgroundColor: isPast ? "#E0E0E5" : "#E6E6EB" },
            ]}
          />
        )}
      </View>
      <GigCard gig={item} onPress={() => handleGigPress(item)} index={index} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="red" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchGigs}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gigs.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={80} color="#D3D3D3" />
        <Text style={styles.emptyTitle}>No Gigs Found</Text>
        <Text style={styles.emptyText}>
          No cleaning jobs yet for {property.property_name}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={() => (
        <>
          {upcoming.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📅 Upcoming</Text>
              {upcoming.map((item, index) =>
                renderTimelineItem({
                  item,
                  index,
                  sectionLength: upcoming.length,
                  isPast: false,
                })
              )}
            </>
          )}
          {past.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, styles.pastSectionTitle]}>
                ✅ Past Jobs
              </Text>
              {past.map((item, index) =>
                renderTimelineItem({
                  item,
                  index,
                  sectionLength: past.length,
                  isPast: true,
                })
              )}
            </>
          )}
        </>
      )}
      data={[]}
      renderItem={null}
    />
  );
}

/* ----------------------------- STYLES ----------------------------- */
const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    backgroundColor: "#F8F9FC",
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1E1E2F",
  },
  pastSectionTitle: {
    marginTop: 24,
    color: "#6C6C80",
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  timelineColumn: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gigTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
  },
  propertyName: {
    fontSize: 14,
    color: "#6C6C80",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6C6C80",
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  detailItemText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6C6C80",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EFEFF4",
    paddingTop: 12,
  },
  viewDetails: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: 6,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 8,
    color: "#8E8E93",
    textAlign: "center",
  },
});