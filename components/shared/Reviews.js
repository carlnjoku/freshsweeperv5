// // components/shared/Reviews.js

// import React from 'react';
// import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
// import StarRating from 'react-native-star-rating-widget';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// // Helper to format date
// const formatDate = (dateString) => {
//   if (!dateString) return '';
//   // If dateString is like "14-08-2026 10:30:00"
//   const parts = dateString.split(' ');
//   if (parts.length === 2) {
//     const [day, month, year] = parts[0].split('-');
//     return `${month}/${day}/${year}`;
//   }
//   return dateString;
// };

// const ReviewItem = ({ review }) => {
//   // Destructure with fallbacks
//   const {
//     averageRating = 0,
//     ratings = {},
//     comment = '',
//     createdAt = '',
//     hostName = 'Unknown Host',
//     hostAvatar = '',
//     hostId = null,
//   } = review;

//   const hasHost = !!hostId;

//   // Generate category rating pairs
//   const categoryEntries = Object.entries(ratings).filter(
//     ([key]) => ['cleanliness', 'communication', 'punctuality', 'professionalism'].includes(key)
//   );

//   return (
//     <View style={styles.card}>
//       {/* Header: Host Avatar & Name + Date */}
//       <View style={styles.header}>
//         <View style={styles.hostInfo}>
//           {hostAvatar ? (
//             <Image source={{ uri: hostAvatar }} style={styles.avatar} />
//           ) : (
//             <View style={[styles.avatar, styles.placeholderAvatar]}>
//               <MaterialCommunityIcons name="account" size={24} color="#999" />
//             </View>
//           )}
//           <View style={styles.hostText}>
//             <Text style={styles.hostName}>
//               {hasHost ? hostName : tSafe('guest', 'Guest')}
//             </Text>
//             {hasHost && <Text style={styles.hostLabel}>{tSafe('host', 'Host')}</Text>}
//           </View>
//         </View>
//         <Text style={styles.date}>{formatDate(createdAt)}</Text>
//       </View>

//       {/* Rating Display */}
//       <View style={styles.ratingRow}>
//         <StarRating
//           rating={averageRating}
//           onChange={() => {}}
//           maxStars={5}
//           starSize={16}
//           starStyle={{ marginHorizontal: 0 }}
//         />
//         <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
//       </View>

//       {/* Category Ratings */}
//       {/* {categoryEntries.length > 0 && (
//         <View style={styles.categoryContainer}>
//           {categoryEntries.map(([key, value]) => (
//             <View key={key} style={styles.categoryRow}>
//               <Text style={styles.categoryLabel}>
//                 {key.charAt(0).toUpperCase() + key.slice(1)}
//               </Text>
//               <View style={styles.categoryStars}>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <MaterialCommunityIcons
//                     key={star}
//                     name={star <= value ? 'star' : 'star-outline'}
//                     size={12}
//                     color={star <= value ? '#F5A623' : '#D1D1D6'}
//                     style={{ marginHorizontal: 1 }}
//                   />
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>
//       )} */}

//       {/* Comment */}
//       {comment ? (
//         <View style={styles.commentContainer}>
//           <Text style={styles.commentText}>{comment}</Text>
//         </View>
//       ) : null}

//       {/* Small separator at bottom */}
//       <View style={styles.footerDivider} />
//     </View>
//   );
// };

// const Reviews = ({ ratings, cleanerId }) => {
//   if (!ratings || ratings.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <MaterialCommunityIcons name="star-outline" size={48} color="#ccc" />
//         <Text style={styles.emptyText}>{tSafe('no_reviews_yet', 'No reviews yet for this cleaner.')}</Text>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={ratings}
//       keyExtractor={(item) => item._id || item.id || String(Math.random())}
//       renderItem={({ item }) => <ReviewItem review={item} />}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.listContainer}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   listContainer: {
//     paddingVertical: 8,
//     paddingHorizontal: 2,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   hostInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     marginRight: 10,
//   },
//   placeholderAvatar: {
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   hostText: {
//     flexDirection: 'column',
//   },
//   hostName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1C1C1E',
//   },
//   hostLabel: {
//     fontSize: 11,
//     color: '#8E8E93',
//     marginTop: 1,
//   },
//   date: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   ratingNumber: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginLeft: 8,
//   },
//   categoryContainer: {
//     marginVertical: 6,
//   },
//   categoryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 2,
//   },
//   categoryLabel: {
//     fontSize: 13,
//     color: '#555',
//     flex: 1,
//   },
//   categoryStars: {
//     flexDirection: 'row',
//     marginLeft: 10,
//   },
//   commentContainer: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#f5f5f5',
//   },
//   commentText: {
//     fontSize: 14,
//     color: '#333',
//     fontStyle: 'italic',
//     lineHeight: 20,
//   },
//   footerDivider: {
//     height: 1,
//     backgroundColor: 'transparent',
//     marginTop: 4,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#999',
//     textAlign: 'center',
//   },
// });

// export default Reviews;


// components/shared/Reviews.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split(' ');
  if (parts.length === 2) {
    const [day, month, year] = parts[0].split('-');
    return `${month}/${day}/${year}`;
  }
  return dateString;
};

const ReviewItem = ({ review }) => {
  const {
    averageRating = 0,
    ratings = {},
    comment = '',
    createdAt = '',
    hostName = 'Unknown Host',
    hostAvatar = '',
    hostId = null,
  } = review;

  const hasHost = !!hostId;

  // Category ratings (optional, kept commented out)
  const categoryEntries = Object.entries(ratings).filter(
    ([key]) => ['cleanliness', 'communication', 'punctuality', 'professionalism'].includes(key)
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.hostInfo}>
          {hostAvatar ? (
            <Image source={{ uri: hostAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <MaterialCommunityIcons name="account" size={24} color="#999" />
            </View>
          )}
          <View style={styles.hostText}>
            <Text style={styles.hostName}>
              {hasHost ? hostName : tSafe('guest', 'Guest')}
            </Text>
            {hasHost && <Text style={styles.hostLabel}>{tSafe('host', 'Host')}</Text>}
          </View>
        </View>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>

      <View style={styles.ratingRow}>
        <StarRating
          rating={averageRating}
          onChange={() => {}}
          maxStars={5}
          starSize={16}
          starStyle={{ marginHorizontal: 0 }}
        />
        <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
      </View>

      {/* Comment */}
      {comment ? (
        <View style={styles.commentContainer}>
          <Text style={styles.commentText}>“{comment}”</Text>
        </View>
      ) : null}
    </View>
  );
};

const Reviews = ({ ratings, cleanerId }) => {
  if (!ratings || ratings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="star-outline"
            size={34}
            color={COLORS.primary}
          />
        </View>
    
        <Text style={styles.emptyTitle}>
          {tSafe(
            'no_reviews_title',
            'No Reviews Yet'
          )}
        </Text>
    
        <Text style={styles.emptySubtitle}>
          {tSafe(
            'no_reviews_desc',
            'This cleaner has not received any reviews yet.'
          )}
        </Text>
      </View>
    );
  }

  // Render reviews using map – no nested FlatList
  return (
    <View style={styles.listContainer}>
      {ratings.map((item) => (
        <ReviewItem key={item._id || item.id || Math.random()} review={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostText: {
    flexDirection: 'column',
  },
  hostName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  hostLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  commentContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  
  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },
  
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.gray,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default Reviews;