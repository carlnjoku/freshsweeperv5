import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import CleanerCard from '../cleaner/CleanerCard';
import COLORS from '../../constants/colors';

const CompareCleanerModal = ({
  visible,
  onClose,
  currentCleaners = [], // ✅ Default to empty array
  newCleaner,
  onReplace,
}) => {
  const handleReplace = (cleanerToRemove) => {
    onReplace(cleanerToRemove);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Maximum cleaners selected</Text>
        <Text style={styles.subtitle}>
          You have already selected {currentCleaners?.length || 0} cleaners. Select one to replace with:
        </Text>

        <ScrollView>
          {currentCleaners?.map((cleaner) => (
            <View key={cleaner._id} style={styles.cardWrapper}>
              <CleanerCard item={cleaner} preview_mode={true} />
              <TouchableOpacity
                style={styles.replaceButton}
                onPress={() => handleReplace(cleaner)}
              >
                <Text style={styles.replaceButtonText}>Replace</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default CompareCleanerModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  cardWrapper: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    overflow: 'hidden',
  },
  replaceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  replaceButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});



// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// // import CleanerCard from '../components/cleaner/CleanerCard';
// import CleanerCard from '../cleaner/CleanerCard';
// import COLORS from '../../constants/colors';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';

// const CompareCleanerModal = ({
//   visible,
//   onClose,
//   existingCleaners,
//   newCleaner,
// }) => {
//   const { replaceCleaner } = useCleanerSelection();

//   const handleReplace = (oldCleanerId) => {
//     replaceCleaner(oldCleanerId, newCleaner);
//     onClose(); // Close modal after replacement
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.backdrop}>
//         <View style={styles.modalContent}>
//           <Text style={styles.title}>
//             You’ve already selected {existingCleaners.length} cleaners
//           </Text>
//           <Text style={styles.subText}>
//             You can only select {existingCleaners.length}. Would you like to replace one?
//           </Text>

//           <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
//             {existingCleaners.map((cleaner) => (
//               <View key={cleaner._id} style={styles.cleanerWrapper}>
//                 <CleanerCard item={cleaner} />
//                 <TouchableOpacity
//                   style={styles.replaceButton}
//                   onPress={() => handleReplace(cleaner._id)}
//                 >
//                   <Text style={styles.replaceButtonText}>Replace with New</Text>
//                 </TouchableOpacity>
//               </View>
//             ))}

//             <Text style={styles.sectionTitle}>New Cleaner</Text>
//             <CleanerCard item={newCleaner} />
//           </ScrollView>

//           <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
//             <Text style={styles.cancelButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default CompareCleanerModal;

// const styles = StyleSheet.create({
//   backdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopRightRadius: 20,
//     borderTopLeftRadius: 20,
//     padding: 16,
//     maxHeight: '90%',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 6,
//     textAlign: 'center',
//   },
//   subText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   cleanerWrapper: {
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray,
//     paddingBottom: 10,
//   },
//   sectionTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginVertical: 10,
//   },
//   replaceButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//     marginTop: 8,
//   },
//   replaceButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   cancelButton: {
//     marginTop: 20,
//     padding: 12,
//     backgroundColor: COLORS.light_gray,
//     borderRadius: 8,
//   },
//   cancelButtonText: {
//     textAlign: 'center',
//     fontWeight: '600',
//   },
// });