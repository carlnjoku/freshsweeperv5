// import React, {useState, useEffect} from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { MaterialIcons, Feather } from '@expo/vector-icons';
// import moment from 'moment';
// import { Avatar } from 'react-native-paper';
// import { calculateOverallRating } from '../../utils/calculate_overall_rating';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';



// const CleanerCard = ({ item, onPress, onSelect, selected = false, preview_mode, cleanerId }) => {
//     const cleaner = item;
//     console.log("My cleanersssssss", selected)
//     console.log("My cleaners", item)
//     console.log("My cleanerId", cleanerId)
//     const [reviews, setReviews] = useState([]);
  
//     useEffect(() => {
//       fetchCleanerFeedbacks();
//     }, []);
  
//     const fetchCleanerFeedbacks = async () => {
//       const response = await userService.getCleanerFeedbacks(cleaner?._id);
//       setReviews(response.data.data);
//     };
  
//     const formatName = (name) => (name ? name.charAt(0).toUpperCase() : '');
  
    
//     return (
    
//         <TouchableOpacity
//             style={[
//                 preview_mode ? styles.card2 : styles.card,
//                 selected && styles.selectedCard
//             ]}
//             onPress={onSelect || onPress} // fallback to profile if onSelect not passed
//             activeOpacity={0.8}
//         >
//         {/*Checkmark if selected */}
//         {selected && (
//           <MaterialIcons
//             name="check-circle"
//             size={22}
//             color="#4CAF50"
//             style={styles.selectedIcon}
//           />
//         )}
  
//         <View style={styles.header}>
//           {cleaner?.cleaner?.avatar || item.avatar ? (
//             <Avatar.Image
//               source={{ uri: cleaner?.cleaner?.avatar || item?.avatar }}
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
//               {cleaner?.cleaner?.firstname || item?.firstname}{' '}
//               {formatName(cleaner?.cleaner?.lastname || item?.lastname)}.
//             </Text>
//             <Text style={styles.subInfo}>
//               {cleaner?.cleaner?.location?.city || item?.location.city},{' '}
//               {cleaner?.cleaner?.location?.region_code ||
//                 item?.location?.region_code}{' '}
//               • {cleaner?.distanceFromApartment || item?.distance} miles away {cleanerId}
              
//             </Text>
//           </View>
//         </View>
  
//         <View style={styles.meta}>
//           <View style={styles.badge}>
//             <MaterialIcons name="star" size={18} color="#FFC107" />
//             <Text style={styles.metaText}>
//               {calculateOverallRating(reviews, cleaner?.cleaner?.cleanerId || item.cleanerId)}
//             </Text>
//           </View>
//           <View style={styles.badge}>
//             <Feather name="calendar" size={16} color="#4CAF50" />
//             <Text style={styles.metaText}>
//               Member since{' '}
//               {moment(
//                 cleaner?.cleaner?.created_at || item?.created_at,
//                 'DD-MM-YYYY HH:mm:ss'
//               ).format('MMM YYYY')}
//             </Text>
//           </View>
//           {cleaner?.cleaner?.certification > 0 && (
//             <Feather name="award" size={18} color="#2196F3" style={{ marginRight: 8 }} />
//           )}
//           {(cleaner?.cleaner?.identity_verified || item?.identity_verified) && (
//             <Feather name="check-circle" size={18} color="#4CAF50" />
//           )}
//           <Text style={styles.jobsText}>
//             {cleaner?.cleaner?.completed_jobs || item?.completed_jobs} jobs
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };
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
//     backgroundColor:COLORS.light_gray
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
// });

// export default CleanerCard;

import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import moment from 'moment';
import { Avatar } from 'react-native-paper';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import CleanerBadges from './CleanerBadges';

const CleanerCard = ({ item, onPress, onSelect, selected = false, preview_mode, cleanerId }) => {
    // Normalize the item structure - item could be a cleaner object or have a nested cleaner
    const cleaner = item.cleaner || item;
    
    console.log("CleanerCard debug:", { 
        item: item, 
        cleaner: cleaner,
        hasNestedCleaner: !!item.cleaner,
        hasDirectProperties: !!item.firstname
    });
  
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
  
    // Safe access to location with fallbacks
    const location = cleaner?.location || {};
    const city = location.city || 'Location unknown';
    const region_code = location.region_code || '';
    const distance = cleaner?.distanceFromApartment || cleaner?.distance || 'N/A';
    
    // Safe access to other properties
    const firstname = cleaner?.firstname || 'Unknown';
    const lastname = cleaner?.lastname || '';
    const created_at = cleaner?.created_at;
    const certification = cleaner?.certification;
    const identity_verified = cleaner?.identity_verified;
    const completed_jobs = cleaner?.completed_jobs || 0;
    const avatar = cleaner?.avatar;

    const badges = {"badges": ["Fast Responder", "100% Reliable"]}
    
    return (
        <TouchableOpacity
            style={[
                preview_mode ? styles.card2 : styles.card,
                selected && styles.selectedCard
            ]}
            onPress={onSelect || onPress}
            activeOpacity={0.8}
        >
        {/*Checkmark if selected */}
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
              {city}{region_code ? `, ${region_code}` : ''} • {distance} miles away
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
              Member since{' '}
              {created_at ? 
                moment(created_at, 'DD-MM-YYYY HH:mm:ss').format('MMM YYYY') : 
                'Unknown'
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
            {completed_jobs} jobs
          </Text>
        </View>
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
});

export default CleanerCard;