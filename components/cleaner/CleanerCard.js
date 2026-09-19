// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { MaterialIcons, Feather } from '@expo/vector-icons';
// import moment from 'moment';
// import { Avatar } from 'react-native-paper';
// import { calculateOverallRating } from '../../utils/calculate_overall_rating';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import CleanerBadges from './CleanerBadges';
// import { tSafe } from '../../utils/tSafe';

// const CleanerCard = ({ item, onPress, onSelect, selected = false, preview_mode, cleanerId }) => {
//     const cleaner = item.cleaner || item;
  
//     console.log("Cleaaaaaner----CL", cleaner)
//     const [reviews, setReviews] = useState([]);
  
//     useEffect(() => {
//       if (cleaner?._id) {
//         fetchCleanerFeedbacks();
//       }
//     }, [cleaner?._id]);
  
//     const fetchCleanerFeedbacks = async () => {
//       try {
//         const response = await userService.getCleanerFeedbacks(cleaner._id);
//         setReviews(response.data.data);
//       } catch (error) {
//         console.error('Error fetching feedbacks:', error);
//       }
//     };
  
//     const formatName = (name) => (name ? name.charAt(0).toUpperCase() : '');
  
//     const location = cleaner?.location || {};
//     const city = location.city || tSafe('location_unknown', 'Location unknown');
//     const region_code = location.region_code || '';
//     const distance = item?.distanceFromApartment || cleaner?.distance_miles || 'N/A';
  
//     const firstname = cleaner?.firstname || tSafe('unknown', 'Unknown');
//     const lastname = cleaner?.lastname || '';
//     const created_at = cleaner?.created_at;
//     const certification = cleaner?.certification;
//     const identity_verified = cleaner?.identity_verified;
//     const jobs_completed = cleaner?.performance?.jobs_completed || 0;
//     const avatar = cleaner?.avatar;
//     const badges = { "badges": ["Fast Responder", "100% Reliable"] };

//     // ✅ Performance & penalty data (if provided)
//     const performance = cleaner?.calculated_performance || {};
//     const penaltyImpacts = cleaner?.effective_penalty_impacts || {};
//     const reliabilityImpact = penaltyImpacts.reliability || 0;
//     const hasReliabilityPenalty = reliabilityImpact < 0;
  
//     // Helper to format cancellation rate as percentage
//     const cancellationRate = performance.cancellation_rate != null 
//       ? `${(performance.cancellation_rate * 100).toFixed(0)}%` 
//       : '—';
  
//     // Average response time in minutes
//     const avgResponseSeconds = performance.average_response_time_seconds || 0;
//     const avgResponseMinutes = avgResponseSeconds > 0 ? `${Math.round(avgResponseSeconds / 60)}m` : '—';
  
//     return (
//         <TouchableOpacity
//             style={[
//                 preview_mode ? styles.card2 : styles.card,
//                 selected && styles.selectedCard
//             ]}
//             onPress={onSelect || onPress}
//             activeOpacity={0.8}
//         >
//         {selected && (
//           <MaterialIcons
//             name="check-circle"
//             size={22}
//             color="#4CAF50"
//             style={styles.selectedIcon}
//           />
//         )}
  
//         <View style={styles.header}>
//           {avatar ? (
//             <Avatar.Image
//               source={{ uri: avatar }}
//               size={50}
//               style={styles.avatar}
//             />
//           ) : (
//             <Avatar.Icon
//               size={50}
//               icon="account"
//               style={styles.avatar}
//               color="white"
//             />
//           )}
//           <View style={styles.info}>
//             <Text style={styles.name}>
//               {firstname} {formatName(lastname)}
//             </Text>
//             <Text style={styles.subInfo}>
//               {city}{region_code ? `, ${region_code}` : ''} • {distance} {tSafe('miles_away', 'miles away')}
//             </Text>
//           </View>
//         </View>
  
//         <View style={styles.meta}>
//           <View style={styles.badge}>
//             <MaterialIcons name="star" size={18} color="#FFC107" />
//             <Text style={styles.metaText}>
//               {calculateOverallRating(reviews, cleaner._id)}
//             </Text>
//           </View>
//           <View style={styles.badge}>
//             <Feather name="calendar" size={16} color="#4CAF50" />
//             <Text style={styles.metaText}>
//               {tSafe('member_since', 'Member since')}{' '}
//               {created_at ? 
//                 moment(created_at, 'DD-MM-YYYY HH:mm:ss').format('MMM YYYY') : 
//                 tSafe('unknown', 'Unknown')
//               }
//             </Text>
//           </View>
//           {certification > 0 && (
//             <Feather name="award" size={18} color="#2196F3" style={{ marginRight: 8 }} />
//           )}
//           {identity_verified && (
//             <Feather name="check-circle" size={18} color="#4CAF50" />
//           )}
//           <Text style={styles.jobsText}>
//             {jobs_completed} {tSafe('jobs', 'jobs')}
//           </Text>
//         </View>

//         {/* 🟢 Performance Section */}
//         {(performance.jobs_completed != null || cancellationRate !== '—' || avgResponseMinutes !== '—' || hasReliabilityPenalty) && (
//           <View style={styles.performanceContainer}>
//             <Text style={styles.performanceLabel}>{tSafe('performance', 'Performance')}</Text>
//             <View style={styles.performanceStats}>
//               {performance.jobs_completed != null && (
//                 <View style={styles.performanceItem}>
//                   <Feather name="check-circle" size={14} color="#4CAF50" />
//                   <Text style={styles.performanceText}>
//                     {performance.jobs_completed} {tSafe('done', 'done')}
//                   </Text>
//                 </View>
//               )}
//               {cancellationRate !== '—' && (
//                 <View style={styles.performanceItem}>
//                   <Feather name="x-circle" size={14} color="#EF4444" />
//                   <Text style={styles.performanceText}>
//                     {cancellationRate} {tSafe('cancelled', 'cancelled')}
//                   </Text>
//                 </View>
//               )}
//               {avgResponseMinutes !== '—' && (
//                 <View style={styles.performanceItem}>
//                   <Feather name="clock" size={14} color="#3B82F6" />
//                   <Text style={styles.performanceText}>
//                     {avgResponseMinutes} {tSafe('avg_response', 'avg response')}
//                   </Text>
//                 </View>
//               )}
//               {hasReliabilityPenalty && (
//                 <View style={[styles.performanceItem, styles.penaltyItem]}>
//                   <Feather name="alert-triangle" size={14} color="#EF4444" />
//                   <Text style={[styles.performanceText, styles.penaltyText]}>
//                     {tSafe('reliability_penalty', 'Reliability penalty')}: {reliabilityImpact.toFixed(1)}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         )}
  
//         <CleanerBadges badges={badges?.badges} />
//       </TouchableOpacity>
//     );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginVertical: 0,
//     marginHorizontal: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   card2: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginVertical: 0,
//     marginHorizontal: 8,   
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//     backgroundColor: COLORS.light_gray
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontWeight: '600',
//     fontSize: 16,
//     color: '#333',
//   },
//   subInfo: {
//     color: '#777',
//     fontSize: 13,
//     marginTop: 2,
//   },
//   meta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   badge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   metaText: {
//     fontSize: 13,
//     color: '#555',
//     marginLeft: 4,
//   },
//   jobsText: {
//     fontSize: 13,
//     color: '#333',
//     fontWeight: '500',
//     marginLeft: 'auto',
//   },
//   selectedCard: {
//     borderColor: '#4CAF50',
//     borderWidth: 2,
//   },
//   selectedIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 50,
//   },

//   // 🟢 Performance styles
//   performanceContainer: {
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//   },
//   performanceLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#9CA3AF',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 6,
//   },
//   performanceStats: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   performanceItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   performanceText: {
//     fontSize: 13,
//     color: '#1F2937',
//   },
//   penaltyItem: {
//     backgroundColor: '#FEF2F2',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   penaltyText: {
//     color: '#DC2626',
//     fontWeight: '500',
//   },
// });

// export default CleanerCard;




// components/cleaner/CleanerCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import moment from 'moment';
import { Avatar } from 'react-native-paper';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import CleanerBadges from './CleanerBadges';
import { tSafe } from '../../utils/tSafe';

const CleanerCard = ({ item, onPress, onSelect, selected = false, preview_mode, cleanerId, status }) => {
    const cleaner = item.cleaner || item;
  
    const [reviews, setReviews] = useState([]);
  
    useEffect(() => {
      if (cleaner?._id) {
        fetchCleanerFeedbacks();
      }
    }, [cleaner?._id]);
  
    const fetchCleanerFeedbacks = async () => {
      try {
        const response = await userService.getCleanerFeedbacks(cleaner._id);
        setReviews(response.data.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };
  
    const formatName = (name) => (name ? name.charAt(0).toUpperCase() : '');
  
    const location = cleaner?.location || {};
    const city = location.city || tSafe('location_unknown', 'Location unknown');
    const region_code = location.region_code || '';
    const distance = item?.distanceFromApartment || cleaner?.distance_miles || 'N/A';
  
    const firstname = cleaner?.firstname || tSafe('unknown', 'Unknown');
    const lastname = cleaner?.lastname || '';
    const created_at = cleaner?.created_at;
    const certification = cleaner?.certification;
    const identity_verified = cleaner?.identity_verified;
    const jobs_completed = cleaner?.performance?.jobs_completed || 0;
    const avatar = cleaner?.avatar;
    const badges = { "badges": ["Fast Responder", "100% Reliable"] };

    // Performance & penalty data (if provided)
    const performance = cleaner?.calculated_performance || {};
    const penaltyImpacts = cleaner?.effective_penalty_impacts || {};
    const reliabilityImpact = penaltyImpacts.reliability || 0;
    const hasReliabilityPenalty = reliabilityImpact < 0;
  
    // Helper to format cancellation rate as percentage
    const cancellationRate = performance.cancellation_rate != null 
      ? `${(performance.cancellation_rate * 100).toFixed(0)}%` 
      : '—';
  
    // Average response time in minutes
    const avgResponseSeconds = performance.average_response_time_seconds || 0;
    const avgResponseMinutes = avgResponseSeconds > 0 ? `${Math.round(avgResponseSeconds / 60)}m` : '—';

    // ----- Status Badge helper -----
    const getStatusBadge = () => {
      if (!status) return null;
      const config = {
        pending: { label: 'Pending', color: '#FFB74D', bg: '#FFF3E0' },
        notified: { label: 'Notified', color: '#42A5F5', bg: '#E3F2FD' },
        accepted: { label: 'Accepted ✓', color: '#66BB6A', bg: '#E8F5E9' },
        declined: { label: 'Declined ✗', color: '#EF5350', bg: '#FFEBEE' },
      };
      const { label, color, bg } = config[status] || { label: 'Unknown', color: '#9E9E9E', bg: '#F5F5F5' };
      return (
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
      );
    };
  
    return (
        <TouchableOpacity
            style={[
                preview_mode ? styles.card2 : styles.card,
                selected && styles.selectedCard
            ]}
            onPress={onSelect || onPress}
            activeOpacity={0.8}
        >
        {selected && (
          <MaterialIcons
            name="check-circle"
            size={22}
            color="#4CAF50"
            style={styles.selectedIcon}
          />
        )}
  
        <View style={styles.header}>
          {avatar ? (
            <Avatar.Image
              source={{ uri: avatar }}
              size={50}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={50}
              icon="account"
              style={styles.avatar}
              color="white"
            />
          )}
          <View style={styles.info}>
            <Text style={styles.name}>
              {firstname} {formatName(lastname)}
            </Text>
            <Text style={styles.subInfo}>
              {city}{region_code ? `, ${region_code}` : ''} • {distance} {tSafe('miles_away', 'miles away')}
            </Text>
          </View>
        </View>
  
        <View style={styles.meta}>
          <View style={styles.badge}>
            <MaterialIcons name="star" size={18} color="#FFC107" />
            <Text style={styles.metaText}>
              {calculateOverallRating(reviews, cleaner._id)}
            </Text>
          </View>
          <View style={styles.badge}>
            <Feather name="calendar" size={16} color="#4CAF50" />
            <Text style={styles.metaText}>
              {tSafe('member_since', 'Member since')}{' '}
              {created_at ? 
                moment(created_at, 'DD-MM-YYYY HH:mm:ss').format('MMM YYYY') : 
                tSafe('unknown', 'Unknown')
              }
            </Text>
          </View>
          {certification > 0 && (
            <Feather name="award" size={18} color="#2196F3" style={{ marginRight: 8 }} />
          )}
          {identity_verified && (
            <Feather name="check-circle" size={18} color="#4CAF50" />
          )}
          <Text style={styles.jobsText}>
            {jobs_completed} {tSafe('jobs', 'jobs')}
          </Text>
          {/* Status Badge */}
          {getStatusBadge()}
        </View>

        {/* Performance Section */}
        {(performance.jobs_completed != null || cancellationRate !== '—' || avgResponseMinutes !== '—' || hasReliabilityPenalty) && (
          <View style={styles.performanceContainer}>
            <Text style={styles.performanceLabel}>{tSafe('performance', 'Performance')}</Text>
            <View style={styles.performanceStats}>
              {performance.jobs_completed != null && (
                <View style={styles.performanceItem}>
                  <Feather name="check-circle" size={14} color="#4CAF50" />
                  <Text style={styles.performanceText}>
                    {performance.jobs_completed} {tSafe('done', 'done')}
                  </Text>
                </View>
              )}
              {cancellationRate !== '—' && (
                <View style={styles.performanceItem}>
                  <Feather name="x-circle" size={14} color="#EF4444" />
                  <Text style={styles.performanceText}>
                    {cancellationRate} {tSafe('cancelled', 'cancelled')}
                  </Text>
                </View>
              )}
              {avgResponseMinutes !== '—' && (
                <View style={styles.performanceItem}>
                  <Feather name="clock" size={14} color="#3B82F6" />
                  <Text style={styles.performanceText}>
                    {avgResponseMinutes} {tSafe('avg_response', 'avg response')}
                  </Text>
                </View>
              )}
              {hasReliabilityPenalty && (
                <View style={[styles.performanceItem, styles.penaltyItem]}>
                  <Feather name="alert-triangle" size={14} color="#EF4444" />
                  <Text style={[styles.performanceText, styles.penaltyText]}>
                    {tSafe('reliability_penalty', 'Reliability penalty')}: {reliabilityImpact.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
  
        <CleanerBadges badges={badges?.badges} />
      </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 0,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  card2: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 0,
    marginHorizontal: 8,   
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.light_gray
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  subInfo: {
    color: '#777',
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
  jobsText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginLeft: 'auto',
  },
  selectedCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  selectedIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 50,
  },

  // 🟢 Performance styles
  performanceContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  performanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  performanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performanceText: {
    fontSize: 13,
    color: '#1F2937',
  },
  penaltyItem: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  penaltyText: {
    color: '#DC2626',
    fontWeight: '500',
  },

  // 🟢 Status Badge styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CleanerCard;