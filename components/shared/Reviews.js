


// import React, { useContext } from 'react';
// import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { Avatar } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import moment from 'moment';
// import StarRating from 'react-native-star-rating-widget';


// const Reviews = ({ratings, cleanerId}) => {

// console.log("_______ __________", ratings)

//   React.useEffect(()=> {
//     // fetchCleanerFeedbacks()
//   },[])
//   const renderStars = (rating) => {
//     return [...Array(5)].map((_, i) => (
//       <Icon
//         key={i}
//         name={i < rating ? 'star' : 'star-o'}
//         size={16}
//         color="#FFD700"
//       />
//     ));
//   };

  
//   const renderItem = ({ item }) => (
//     <View style={styles.reviewContainer}>
//       {/* <Image source={{ uri: item.avatar }} style={styles.avatar} /> */}
//       {item.schedule_info.hostInfo.avatar ? 
//           <Avatar.Image 
//               source={{uri:item.schedule_info.hostInfo.firstname}}
//               size={40}
//               style={styles.avatar}
//           />
//           :

//           <Avatar.Icon 
//             size={40} 
//             icon="account" // Default icon
//             style={styles.avatarIcon}
//           />
//       }
              
//       <View style={styles.reviewContent}>
//         <View style={{flexDirection:'row', justifyContent:'space-between'}}>
//           <Text style={styles.username}>{item.schedule_info.hostInfo.firstname} {item.schedule_info.hostInfo.lastname}</Text>
//           <Text style={styles.created_on}>{moment(item.created_on).fromNow()}</Text>
//         </View>
//         {/* <View style={styles.rating}>
//           <StarRating
//             rating={item.averageRating.toFixed(1)}
//             onChange={() => {}} // No-op function to disable interaction
//             maxStars={5} // Maximum stars
//             starSize={18} // Size of the stars
//             starStyle={{ marginHorizontal: 0 }} // Customize star spacing
//           />
//           <Text style={{marginLeft:5}}>{item.averageRating.toFixed(1)}</Text>
//         </View> */}

        
//         <Text style={styles.reviewText}>{item.comment} </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
      
//       <FlatList
//         data={ratings}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.list}
//         // showsVerticalScrollIndicator={true}
//         // nestedScrollEnabled={true} // Allow nested scrolling
//         horizontal={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//     width:'100%',
//     borderRadius: 8,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   list: {
//     paddingBottom: 16,
//   },
//   reviewContainer: {
//     flexDirection: 'row',
//     justifyContent:'space-between',
//     marginBottom: 20,
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     shadowColor: '#ddd',
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   avatar: {
//     marginRight:5
//   },
//   reviewContent: {
//     flex: 1,
//   },
//   username: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   rating: {
//     flexDirection: 'row',
//     marginTop: 4,
//     marginBottom: 8,
//   },
//   reviewText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   avatarIcon:{
//     marginRight:5,
//     backgroundColor:COLORS.gray
//   },
//   created_on:{
//     fontSize:12,
//   },
//   rating:{
//     flexDirection:'row',
//     // justifyContent:'center',
//     alignItems:'center'
//   },
// });

// export default Reviews;



import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Avatar } from 'react-native-paper';
import COLORS from '../../constants/colors';
import moment from 'moment';
import StarRating from 'react-native-star-rating-widget';

const Reviews = ({ ratings, cleanerId }) => {
  console.log("Reviews data:", ratings);

  // Add safety checks and data transformation
  const safeRatings = Array.isArray(ratings) ? ratings : [];
  
  // Transform data if needed to match expected structure
  const transformedRatings = safeRatings.map((item, index) => ({
    ...item,
    id: item.id || item._id || `review-${index}`, // Ensure each item has a unique id
    schedule_info: item.schedule_info || {},
    hostInfo: item.hostInfo || (item.schedule_info?.hostInfo || {}),
    comment: item.comment || item.feedback || '',
    created_on: item.created_on || item.createdAt || new Date(),
    averageRating: item.averageRating || item.rating || 0
  }));

  console.log("Transformed ratings:", transformedRatings);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Icon
        key={i}
        name={i < rating ? 'star' : 'star-o'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderItem = ({ item }) => {
    // Safety checks for nested properties
    const hostInfo = item.hostInfo || item.schedule_info?.hostInfo || {};
    const firstName = hostInfo.firstname || hostInfo.firstName || 'Unknown';
    const lastName = hostInfo.lastname || hostInfo.lastName || '';
    const avatar = hostInfo.avatar;
    const comment = item.comment || item.feedback || 'No comment provided';
    const createdOn = item.created_on ? moment(item.created_on).fromNow() : 'Recently';

    return (
      <View style={styles.reviewContainer}>
        {avatar ? (
          <Avatar.Image 
            source={{ uri: avatar }}
            size={40}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Icon 
            size={40} 
            icon="account"
            style={styles.avatarIcon}
          />
        )}
        
        <View style={styles.reviewContent}>
          <View style={styles.reviewHeader}>
            <Text style={styles.username}>{firstName} {lastName}</Text>
            <Text style={styles.created_on}>{createdOn}</Text>
          </View>
          
          {/* Rating display */}
          {item.averageRating > 0 && (
            <View style={styles.rating}>
              <StarRating
                rating={parseFloat(item.averageRating)}
                onChange={() => {}} // Read-only
                maxStars={5}
                starSize={18}
                starStyle={{ marginHorizontal: 0 }}
                enableSwiping={false}
                enableHalfStar={true}
              />
              <Text style={styles.ratingText}>{parseFloat(item.averageRating).toFixed(1)}</Text>
            </View>
          )}
          
          <Text style={styles.reviewText}>{comment}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="comments-o" size={48} color={COLORS.gray} />
      <Text style={styles.emptyStateText}>No reviews yet</Text>
      <Text style={styles.emptyStateSubtext}>Be the first to leave a review</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <FlatList
        data={transformedRatings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          transformedRatings.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={true}
        horizontal={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    width: '100%',
    borderRadius: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  list: {
    paddingBottom: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    marginRight: 12,
  },
  avatarIcon: {
    marginRight: 12,
    backgroundColor: COLORS.gray
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  created_on: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.light_gray,
    textAlign: 'center',
  },
});

export default Reviews;