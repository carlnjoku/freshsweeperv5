// import React, {useState} from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';


// const PaymentDetails = ({ cleaningServiceFee }) => {

//     const [modalVisible, setModalVisible] = useState(false);

//     const handleInfoPress = () => {
//         setModalVisible(true);
//     };

//     const closeModal = () => {
//         setModalVisible(false);
//     };
//   // Calculate Service Fee (10% of cleaning service fee)
//   const serviceFee = cleaningServiceFee * 0.1;

//   // Calculate Total
//   const total = cleaningServiceFee + serviceFee;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Payment Details</Text>

//       <View style={styles.row}>
//         <Text style={styles.label}>Cleaning Service:</Text>
//         <Text style={styles.value}>${cleaningServiceFee.toFixed(2)}</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Service Fee (10%)
//         <TouchableOpacity onPress={handleInfoPress}>
//             <MaterialIcons name="info-outline" size={18} color={COLORS.primary} style={styles.icon} />
//           </TouchableOpacity>
//         </Text> 
        
//         <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.row}>
//         <Text style={styles.totalLabel}>Total:</Text>
//         <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
//       </View>

//       {/* Modal for Service Fee Explanation */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Service Fee</Text>
//             <Text style={styles.modalText}>
//               The service fee covers operational costs, payment processing, and platform maintenance
//               to ensure seamless scheduling and support.
//             </Text>
//             <Pressable style={styles.closeButton} onPress={closeModal}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     elevation: 2, // Adds shadow for Android
//     shadowColor: '#000', // Adds shadow for iOS
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     marginBottom:20
//   },
//   header: {
//     fontSize: 18,
//     fontWeight: '500',
//     marginBottom: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 14,
//     color: '#333',
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#ddd',
//     marginVertical: 8,
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   icon: {
//     marginLeft: 5,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   closeButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default PaymentDetails;



import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const PaymentDetails = ({ cleaningServiceFee, cleanersWithFee = [] }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate subtotal from cleaner fees (fallback to cleaningServiceFee if no cleaners provided)
  const subtotal =
    cleanersWithFee.length > 0
      ? cleanersWithFee.reduce((sum, cleaner) => sum + (Number(cleaner.fee) || 0), 0)
      : Number(cleaningServiceFee);

  const serviceFee = subtotal * 0.1; // 10%
  const total = subtotal + serviceFee;

  const handleInfoPress = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Breakdown</Text>

      {/* Show each cleaner’s fee if available */}
      {cleanersWithFee.length > 0 ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.subHeader}>Cleaners</Text>
          {cleanersWithFee.map((cleaner, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>
                {cleaner.firstname
                  ? `${cleaner.firstname} ${cleaner.lastname || ''}`
                  : `Cleaner ${index + 1}`}
              </Text>
              <Text style={styles.value}>${Number(cleaner.fee).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.label}>Cleaning Service:</Text>
          <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
        </View>
      )}

      {/* Service Fee */}
      <View style={styles.row}>
        <Text style={styles.label}>
          Service Fee (10%)
          <TouchableOpacity onPress={handleInfoPress}>
            <MaterialIcons
              name="info-outline"
              size={18}
              color={COLORS.primary}
              style={styles.icon}
            />
          </TouchableOpacity>
        </Text>
        <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>

      {/* Modal for Service Fee Explanation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Service Fee</Text>
            <Text style={styles.modalText}>
              The 10% service fee covers operational costs, secure payment processing, and platform
              maintenance to ensure seamless scheduling and support.
            </Text>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  icon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PaymentDetails;