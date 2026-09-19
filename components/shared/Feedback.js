// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Button,
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { AirbnbRating } from 'react-native-ratings';
// import COLORS from '../../constants/colors';

// const { width } = Dimensions.get('window');

// const FeedbackModal = ({ onSubmit, onClose, feedbackTo }) => {
//   const [ratings, setRatings] = useState({
//     promptness: 0,
//     cleanliness: 0,
//     professionalism: 0,
//     efficiency: 0,
//     attentionToDetail: 0,
//     overall: 0,
//   });

//   const [comment, setComment] = useState('');

//   const [rating1, setRating1] = useState(4);

//   // Rating labels based on value
//   const ratingLabels = [
//     "Bad", // 1
//     "Poor", // 2
//     "Okay", // 3
//     "Good", // 4
//     "Great", // 5
//   ];

//   // Calculate average rating
//   const calculateAverageRating = () => {
//     const totalRatings = Object.values(ratings).reduce((sum, value) => sum + value, 0);
//     const count = Object.keys(ratings).length;
//     return count > 0 ? (totalRatings / count).toFixed(2) : "0.00"; // Returns average as a string with 2 decimals
//   };


//   // Update rating for each category
//   const handleRatingChange = (field, value) => {
//     setRatings((prevRatings) => ({
//       ...prevRatings,
//       [field]: value,
//     }));
//   };



//   // Handle input changes for basic fields
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

 
//   // Submit feedback
//   const handleSubmit = () => {
//     // Ensure all categories are rated
//     if (Object.values(ratings).some((value) => value === 0)) {
//       alert('Please provide ratings for all categories.');
//       return;
//     }

//     const averageRating = calculateAverageRating();

//     // Submit the feedback to the parent component
//     onSubmit({ ratings, comment, averageRating });
//     // onClose();
//   };



//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* <Text style={styles.title}>Feedback for {feedbackTo}</Text> */}

        

//         {Object.keys(ratings).map((field, index) => (
//           <View key={index} style={styles.ratingContainer}>
//             <Text style={styles.label}>
//               {field.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase())}
//             </Text>
//             <AirbnbRating
//               count={5}
//               defaultRating={ratings[field]}
//               showRating={false} // Hide the default rating labels
//               size={width > 400 ? 20 : 15}
//               onFinishRating={(value) => handleRatingChange(field, value)}
//               // rating={rating1}
//               // starContainerStyle={styles.starContainer}
//               // ratingTextStyle={styles.ratingText}  // Customizing the rating label text
//             />
//             {/* Manually render the rating text */}
//             {/* <Text style={[styles.ratingText, { fontSize: 14 }]}>
//               {ratingLabels[rating1 - 0]} 
//             </Text> */}
//           </View>
//         ))}

//         <Text style={styles.label}>Additional Comments</Text>
//         {/* <TextInput
//           style={styles.input}
//           placeholder="Write your feedback here..."
//           multiline
//           value={comment}
//           onChangeText={setComment}
//         /> */}

//         <TextInput
//             mode="outlined"
//             label="Write review"
//             placeholder="Write your review here..."
//             placeholderTextColor={COLORS.gray}
//             outlineColor="#D8D8D8"
//             value={comment}
//             activeOutlineColor={COLORS.primary}
//             style={{marginBottom:5, color:COLORS.gray, fontSize:14, backgroundColor:"#fff"}}
//             onChangeText={setComment}
//             multiline
//           />

//         <View style={styles.buttonContainer}>
//           <Button title="Submit" onPress={handleSubmit} />
//           <Button title="Cancel" onPress={onClose} color="red" />
//         </View>
//       </ScrollView>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: width > 400 ? 30 : 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     alignItems: 'center',
//     width: '100%',
//   },
//   title: {
//     fontSize: width > 400 ? 22 : 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     width: '100%',
//   },
//   starContainer: {
//     flexDirection: 'row',   // Align stars horizontally
//     justifyContent: 'center', // Center the stars in the container
//     alignItems: 'center',   // Align items in the center vertically
//   },
//   ratingText: {
//     fontSize: 16,   // Adjust this value to customize the size of "Bad", "Good", etc.
//     color: 'black',  // Customize the text color as needed
//   },
  
//   label: {
//     fontSize: width > 400 ? 16 : 14,
//     marginBottom: 5,
//   },
//   starContainer: {
//     justifyContent: 'flex-start',
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 10,
//     height: 100,
//     textAlignVertical: 'top',
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     marginTop: 20,
//     justifyContent: 'space-between',
//     width: '100%',
//   },
// });

// export default FeedbackModal;








// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Keyboard,
//   TouchableWithoutFeedback,
//   TouchableOpacity,
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { AirbnbRating } from 'react-native-ratings';
// import COLORS from '../../constants/colors';
// import { MaterialIcons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');

// const FeedbackModal = ({ onSubmit, onClose, feedbackTo }) => {
//   const [ratings, setRatings] = useState({
//     promptness: 0,
//     cleanliness: 0,
//     professionalism: 0,
//     efficiency: 0,
//     attentionToDetail: 0,
//     overall: 0,
//   });

//   const [comment, setComment] = useState('');

//   // Rating labels with emojis for better visual appeal
//   const ratingLabels = ["😞 Bad", "😐 Poor", "😊 Okay", "😃 Good", "🌟 Excellent"];

//   // Calculate average rating
//   const calculateAverageRating = () => {
//     const totalRatings = Object.values(ratings).reduce((sum, value) => sum + value, 0);
//     const count = Object.keys(ratings).length;
//     return count > 0 ? (totalRatings / count).toFixed(1) : "0.0";
//   };

//   // Update rating for each category
//   const handleRatingChange = (field, value) => {
//     setRatings((prevRatings) => ({
//       ...prevRatings,
//       [field]: value,
//     }));
//   };

//   // Submit feedback
//   const handleSubmit = () => {
//     if (Object.values(ratings).some((value) => value === 0)) {
//       alert('Please provide ratings for all categories.');
//       return;
//     }

//     const averageRating = calculateAverageRating();
//     onSubmit({ ratings, comment, averageRating });
//   };

//   // Get rating label text
//   const getRatingLabel = (rating) => {
//     return ratingLabels[rating - 1] || "Not rated";
//   };

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Rate Your Experience</Text>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <MaterialIcons name="close" size={24} color={COLORS.gray} />
//           </TouchableOpacity>
//         </View>

//         <ScrollView 
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={true}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* Overall Rating Preview */}
//           <View style={styles.overallRating}>
//             <View style={styles.ratingCircle}>
//               <Text style={styles.ratingNumber}>{calculateAverageRating()}</Text>
//               <Text style={styles.ratingMax}>/5</Text>
//             </View>
//             <Text style={styles.ratingLabel}>Overall Rating</Text>
//           </View>

//           {/* Rating Categories */}
//           <View style={styles.ratingSection}>
//             <Text style={styles.sectionTitle}>Rate each category</Text>
            
//             {Object.keys(ratings).map((field, index) => (
//               <View key={index} style={styles.ratingItem}>
//                 <View style={styles.ratingHeader}>
//                   <Text style={styles.categoryLabel}>
//                     {field.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase())}
//                   </Text>
//                   <Text style={styles.ratingValue}>
//                     {ratings[field] > 0 ? getRatingLabel(ratings[field]) : "Tap to rate"}
//                   </Text>
//                 </View>
                
//                 <AirbnbRating
//                   count={5}
//                   defaultRating={ratings[field]}
//                   showRating={false}
//                   size={28}
//                   selectedColor={COLORS.primary}
//                   unSelectedColor="#E0E0E0"
//                   starContainerStyle={styles.starContainer}
//                   onFinishRating={(value) => handleRatingChange(field, value)}
//                 />
//               </View>
//             ))}
//           </View>

//           {/* Comments Section - FULL WIDTH */}
//           <View style={styles.commentsSection}>
//             <Text style={styles.sectionTitle}>Additional Comments</Text>
//             <TextInput
//               mode="outlined"
//               label="Share your experience..."
//               placeholder="What did you like? What could be improved?"
//               placeholderTextColor={COLORS.light_gray}
//               outlineColor="#E8E8E8"
//               value={comment}
//               activeOutlineColor={COLORS.primary}
//               style={styles.commentInput}
//               onChangeText={setComment}
//               multiline
//               numberOfLines={5}
//               theme={{
//                 colors: {
//                   primary: COLORS.primary,
//                   background: '#F8F9FA',
//                 },
//               }}
//             />
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity 
//               style={[styles.button, styles.cancelButton]} 
//               onPress={onClose}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.button, styles.submitButton]} 
//               onPress={handleSubmit}
//             >
//               <Text style={styles.submitButtonText}>Submit Feedback</Text>
//               <MaterialIcons name="send" size={18} color="#FFF" style={styles.buttonIcon} />
//             </TouchableOpacity>
//           </View>

//           {/* Extra padding at bottom for better scrolling */}
//           <View style={styles.bottomPadding} />
//         </ScrollView>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//     borderRadius: 20,
//     // overflow: 'hidden',
//     maxHeight: height * 0.85,
    
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 24,
//     paddingTop: 0,
//     paddingBottom: 40, // Extra padding for scroll
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 24,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: COLORS.dark,
//     letterSpacing: -0.5,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   overallRating: {
//     alignItems: 'center',
//     paddingVertical: 24,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 16,
//     marginVertical: 16,
//   },
//   ratingCircle: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginBottom: 8,
//   },
//   ratingNumber: {
//     fontSize: 36,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   ratingMax: {
//     fontSize: 18,
//     color: COLORS.gray,
//     fontWeight: '600',
//     marginLeft: 2,
//   },
//   ratingLabel: {
//     fontSize: 14,
//     color: COLORS.gray,
//     fontWeight: '500',
//   },
//   ratingSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 16,
//     letterSpacing: -0.3,
//   },
//   ratingItem: {
//     backgroundColor: '#FAFBFC',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   ratingHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   categoryLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   ratingValue: {
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '500',
//     textAlign: 'right',
//   },
//   starContainer: {
//     justifyContent: 'space-between',
//   },
//   commentsSection: {
//     marginBottom: 24,
//     width: '100%', // Ensure full width
//   },
//   commentInput: {
//     fontSize: 14,
//     backgroundColor: '#FAFBFC',
//     minHeight: 120,
//     textAlignVertical: 'top',
//     width: '100%', // Full width
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 8,
//     width: '100%', // Full width
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   cancelButton: {
//     backgroundColor: '#FFF',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   submitButton: {
//     backgroundColor: COLORS.primary,
//     shadowColor: COLORS.primary,
//     shadowOpacity: 0.3,
//   },
//   cancelButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.gray,
//   },
//   submitButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   buttonIcon: {
//     marginLeft: 6,
//   },
//   bottomPadding: {
//     height: 20, // Extra space at bottom for better scrolling
//   },
// });

// export default FeedbackModal;






// components/shared/FeedbackModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const FeedbackModal = ({
  onSubmit,
  onClose,
  feedbackTo,
  onInputFocus,
  onInputBlur,
}) => {
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    communication: 0,
    punctuality: 0,
    professionalism: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { key: 'cleanliness', label: tSafe('cleanliness', 'Cleanliness'), icon: 'broom' },
    { key: 'communication', label: tSafe('communication', 'Communication'), icon: 'chat' },
    { key: 'punctuality', label: tSafe('punctuality', 'Punctuality'), icon: 'clock' },
    { key: 'professionalism', label: tSafe('professionalism', 'Professionalism'), icon: 'briefcase' },
  ];


  {categories.map((cat) => (
  <View key={cat.key} style={styles.categoryRow}>
    <View style={styles.categoryLabelContainer}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons 
          name={cat.icon} 
          size={20} 
          color="#999" 
        />
      </View>
      <Text style={styles.categoryLabel}>{cat.label}</Text>
    </View>
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleRatingChange(cat.key, star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= ratings[cat.key] ? 'star' : 'star-outline'}
            size={16}
            color={star <= ratings[cat.key] ? '#F5A623' : '#D1D1D6'}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
))}

  // Calculate average rating
  const calculateAverageRating = () => {
    const totalRatings = Object.values(ratings).reduce((sum, value) => sum + value, 0);
    const count = Object.keys(ratings).length;
    return count > 0 ? (totalRatings / count) : 0;
  };

  // Update rating for each category
  const handleRatingChange = (field, value) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const avg = calculateAverageRating();
    if (avg === 0) {
      alert(tSafe('please_rate_categories', 'Please rate at least one category'));
      return;
    }
    setIsSubmitting(true);
    onSubmit({
      averageRating: avg,
      ratings: ratings,
      comment,
      cleanerId: feedbackTo,
    });
    // Reset
    setRatings({
      cleanliness: 0,
      communication: 0,
      punctuality: 0,
      professionalism: 0,
    });
    setComment('');
    setIsSubmitting(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{tSafe('rate_cleaner', 'Rate Cleaner')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Category Ratings */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.instructionLabel}>
              {tSafe('rate_each_category', 'Rate each category:')}
            </Text>
            {/* {categories.map((cat) => (
              <View key={cat.key} style={styles.categoryRow}>
                <View style={styles.categoryLabelContainer}>
                  <MaterialCommunityIcons name={cat.icon} size={20} color={COLORS.primary} />
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleRatingChange(cat.key, star)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={star <= ratings[cat.key] ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= ratings[cat.key] ? '#F5A623' : '#D1D1D6'}
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))} */}

{categories.map((cat) => (
  <View key={cat.key} style={styles.categoryRow}>
    <View style={styles.categoryLabelContainer}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons 
          name={cat.icon} 
          size={20} 
          color="#999" 
        />
      </View>
      <Text style={styles.categoryLabel}>{cat.label}</Text>
    </View>
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleRatingChange(cat.key, star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= ratings[cat.key] ? 'star' : 'star-outline'}
            size={16}
            color={star <= ratings[cat.key] ? '#F5A623' : '#D1D1D6'}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
))}
          </View>

          {/* Average Rating Display */}
          <View style={styles.averageContainer}>
            <Text style={styles.averageLabel}>
              {tSafe('average_rating', 'Average Rating')}
            </Text>
            <Text style={styles.averageValue}>
              {calculateAverageRating().toFixed(1)}
            </Text>
          </View>

          {/* Comment Input */}
          <View style={styles.commentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder={tSafe(
                'share_feedback',
                'Share your feedback... (optional)'
              )}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>
                {tSafe('skip', 'Skip')}
              </Text>
            </TouchableOpacity>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
              style={[styles.actionButton, styles.submitButton]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={styles.submitTouchable}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? tSafe('submitting', 'Submitting...')
                    : tSafe('submit_feedback', 'Submit Feedback')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalCard: {
    width: '96%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    margin:42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginHorizontal: 2,
  },
  averageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  averageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  averageValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
    color: '#1C1C1E',
    width:316
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    paddingVertical: 14,
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitTouchable: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },



  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
});

export default FeedbackModal;