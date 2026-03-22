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



import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';


import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';

const PaymentDetails = ({ cleaningServiceFee, cleanersWithFee = [] }) => {



  const [modalVisible, setModalVisible] = useState(false);

  const [cleaners, setCleaners] = useState([]);

  


  

  

  // Payment calculation
  const subtotal =
    cleanersWithFee.length > 0
      ? cleanersWithFee.reduce((sum, cleaner) => sum + (Number(cleaner.fee) || 0), 0)
      : Number(cleaningServiceFee);
  const serviceFee = subtotal * 0.1; // 10%
  const total = subtotal + serviceFee;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Receipt Section */}
    

      {/* Payment Breakdown */}
      <Text style={styles.breakdownHeader}>Payment Breakdown</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Cleaners</Text>
        {cleanersWithFee.length > 0 ? (
          cleanersWithFee.map((cleaner, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>
                {cleaner.firstname
                  ? `${cleaner.firstname} ${cleaner.lastname || ''}`
                  : `Cleaner ${index + 1}`}
              </Text>
              <Text style={styles.value}>${Number(cleaner.fee).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>Cleaning Service</Text>
            <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>
            Service Fee (10%)
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <MaterialIcons name="info-outline" size={18} color={COLORS.primary} style={styles.icon} />
            </TouchableOpacity>
          </Text>
          <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>

      {/* Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Service Fee</Text>
            <Text style={styles.modalText}>
              The 10% service fee covers operational costs, secure payment processing, and platform maintenance to ensure seamless scheduling and support.
            </Text>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: '#f9f9f9' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111' },
  breakdownHeader: { fontSize: 20, fontWeight: '700', marginVertical: 12, color: '#111' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3 },
  cardHeader: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: COLORS.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 15, color: '#555' },
  value: { fontSize: 15, fontWeight: '600', color: '#111' },
  totalCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, elevation: 2 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: COLORS.gray },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.gray },
  icon: { marginLeft: 5 },
  onlineButton: { marginTop: 20, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 },
  pdfButton: { marginTop: 16, backgroundColor: '#4caf50', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 22, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  modalText: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  closeButton: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 30 },
  closeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default PaymentDetails;



// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   ScrollView,
//   Linking,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import { useRoute } from '@react-navigation/native';

// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';

// // --- Custom hook for PDF download ---
// const useReceiptDownload = (paymentIntentId) => {
//   const [downloading, setDownloading] = useState(false);

//   const downloadReceipt = useCallback(async () => {
//     if (!paymentIntentId) return;

//     setDownloading(true);
//     try {
//       const response = await userService.downloadStripeReceipt(paymentIntentId, {
//         responseType: 'blob',
//       });

//       const contentType = response.headers?.['content-type'] || '';

//       // Handle JSON error responses
//       if (contentType.includes('application/json')) {
//         const errorText = await response.data.text();
//         const errorData = JSON.parse(errorText);
//         Alert.alert('Download failed', errorData.error || 'Unknown error');
//         return;
//       }

//       // Ensure it's a PDF
//       if (!contentType.includes('pdf')) {
//         Alert.alert('Error', 'Unexpected response type. Expected PDF.');
//         return;
//       }

//       const blob = response.data;
//       if (blob.size === 0) {
//         Alert.alert('Error', 'Received empty PDF file.');
//         return;
//       }

//       // Convert blob to base64
//       const reader = new FileReader();
//       reader.onload = async () => {
//         const base64Data = reader.result?.toString().split(',')[1];
//         if (!base64Data) {
//           Alert.alert('Error', 'Failed to extract PDF data.');
//           return;
//         }

//         const fileUri = FileSystem.documentDirectory + `receipt_${paymentIntentId}.pdf`;

//         try {
//           await FileSystem.writeAsStringAsync(fileUri, base64Data, {
//             encoding: FileSystem.EncodingType.Base64,
//           });

//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(fileUri, {
//               mimeType: 'application/pdf',
//               dialogTitle: 'Save or Share Receipt',
//             });
//           } else {
//             Alert.alert('PDF saved', `File saved at: ${fileUri}`);
//           }
//         } catch (writeError) {
//           console.log('File write error:', writeError);
//           Alert.alert('Error', 'Could not save PDF to device.');
//         }
//       };

//       reader.onerror = () => {
//         Alert.alert('Error', 'Could not read PDF data.');
//       };

//       reader.readAsDataURL(blob);
//     } catch (error) {
//       console.log('Download error:', error);
//       Alert.alert('Error', 'Could not download receipt.');
//     } finally {
//       setDownloading(false);
//     }
//   }, [paymentIntentId]);

//   return { downloadReceipt, downloading };
// };

// // --- Main Component ---
// const PaymentDetails = ({ cleaningServiceFee, cleanersWithFee = [] }) => {
//   const route = useRoute();
//   const { payment_intent_id, scheduleId } = route.params;

//   const [modalVisible, setModalVisible] = useState(false);
//   const [receipt, setReceipt] = useState(null);
//   const [cleaners, setCleaners] = useState([]);
//   const [loadingReceipt, setLoadingReceipt] = useState(false);

//   const { downloadReceipt, downloading } = useReceiptDownload(payment_intent_id);

//   // Fetch receipt data
//   useEffect(() => {
//     if (payment_intent_id) {
//       fetchReceipt();
//     }
//   }, [payment_intent_id]);

//   const fetchReceipt = async () => {
//     setLoadingReceipt(true);
//     try {
//       const response = await userService.getStripeReceipt(payment_intent_id);
//       const res = response.data;
//       setReceipt(res);

//       // Parse cleaners JSON string from receipt
//       const cleanersArray = JSON.parse(res.cleaners || '[]');
//       setCleaners(cleanersArray);
//     } catch (error) {
//       console.log('Error fetching receipt:', error);
//       Alert.alert('Error', 'Could not load receipt details.');
//     } finally {
//       setLoadingReceipt(false);
//     }
//   };

//   // Computed values
//   const subtotal = useMemo(() => {
//     if (cleanersWithFee.length > 0) {
//       return cleanersWithFee.reduce((sum, cleaner) => sum + (Number(cleaner.fee) || 0), 0);
//     }
//     return Number(cleaningServiceFee);
//   }, [cleanersWithFee, cleaningServiceFee]);

//   const serviceFee = useMemo(() => subtotal * 0.1, [subtotal]);
//   const total = useMemo(() => subtotal + serviceFee, [subtotal, serviceFee]);

//   // Render each cleaner item
//   const renderCleaner = (cleaner, index) => {
//     const cleanerData = cleanersWithFee.find(cf => cf.cleanerId === cleaner.cleanerId);
//     const name = cleanerData
//       ? `${cleanerData.firstname || ''} ${cleanerData.lastname || ''}`.trim()
//       : `Cleaner ${index + 1}`;
//     return (
//       <View key={index} style={styles.row}>
//         <Text style={styles.label}>{name}</Text>
//         <Text style={styles.value}>${Number(cleaner.fee).toFixed(2)}</Text>
//       </View>
//     );
//   };

//   // Render cleaner rows from cleanersWithFee
//   const renderCleanerWithFee = (cleaner, index) => (
//     <View key={index} style={styles.row}>
//       <Text style={styles.label}>
//         {cleaner.firstname ? `${cleaner.firstname} ${cleaner.lastname || ''}` : `Cleaner ${index + 1}`}
//       </Text>
//       <Text style={styles.value}>${Number(cleaner.fee).toFixed(2)}</Text>
//     </View>
//   );

//   if (loadingReceipt) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Receipt Section */}
//       <View style={styles.section}>
//         <Text style={styles.header}>Receipt #{receipt?.receipt_number}</Text>
//         <Text style={styles.detail}>Status: {receipt?.status}</Text>
//         <Text style={styles.detail}>
//           Total Amount: ${(receipt?.amount / 100).toFixed(2)} {receipt?.currency?.toUpperCase()}
//         </Text>

//         {cleaners.length > 0 && (
//           <View style={styles.cleanersContainer}>
//             <Text style={styles.subheader}>Cleaners</Text>
//             {cleaners.map(renderCleaner)}
//           </View>
//         )}

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             onPress={() => Linking.openURL(receipt?.receipt_url || '')}
//             style={[styles.button, styles.onlineButton]}
//             disabled={!receipt?.receipt_url}
//           >
//             <Text style={styles.buttonText}>View Online Receipt</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={downloadReceipt}
//             style={[styles.button, styles.downloadButton]}
//             disabled={downloading}
//           >
//             {downloading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Download PDF</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Payment Breakdown */}
//       <Text style={styles.sectionTitle}>Payment Breakdown</Text>

//       <View style={styles.card}>
//         <Text style={styles.cardHeader}>Cleaners</Text>
//         {cleanersWithFee.length > 0 ? (
//           cleanersWithFee.map(renderCleanerWithFee)
//         ) : (
//           <View style={styles.row}>
//             <Text style={styles.label}>Cleaning Service</Text>
//             <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.card}>
//         <View style={styles.row}>
//           <View style={styles.labelWithIcon}>
//             <Text style={styles.label}>Service Fee (10%)</Text>
//             <TouchableOpacity onPress={() => setModalVisible(true)}>
//               <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
//         </View>
//       </View>

//       <View style={styles.totalCard}>
//         <Text style={styles.totalLabel}>Total</Text>
//         <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
//       </View>

//       {/* Info Modal */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Service Fee</Text>
//             <Text style={styles.modalText}>
//               The 10% service fee covers operational costs, secure payment processing, and platform
//               maintenance to ensure seamless scheduling and support.
//             </Text>
//             <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 40,
//     backgroundColor: '#f9f9f9',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   section: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#111',
//   },
//   subheader: {
//     fontWeight: '600',
//     marginBottom: 8,
//     fontSize: 16,
//     color: '#333',
//   },
//   detail: {
//     fontSize: 15,
//     color: '#555',
//     marginBottom: 4,
//   },
//   cleanersContainer: {
//     marginTop: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 15,
//     color: '#555',
//   },
//   value: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111',
//   },
//   labelWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   buttonRow: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   onlineButton: {
//     backgroundColor: COLORS.primary,
//   },
//   downloadButton: {
//     backgroundColor: '#4caf50',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginVertical: 12,
//     color: '#111',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   cardHeader: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: COLORS.primary,
//   },
//   totalCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     elevation: 2,
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 22,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   closeButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default PaymentDetails;





// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   ScrollView,
//   Linking,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import { useRoute } from '@react-navigation/native';

// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';


// // --- Custom hook for PDF download ---
// const useReceiptDownload = (paymentIntentId) => {
//   const [downloading, setDownloading] = useState(false);

//   const downloadReceipt = useCallback(async () => {
//     if (!paymentIntentId) return;

//     setDownloading(true);
//     try {
//       const response = await userService.downloadStripeReceipt(paymentIntentId, {
//         responseType: 'blob',
//       });

//       const contentType = response.headers?.['content-type'] || '';

//       if (contentType.includes('application/json')) {
//         const errorText = await response.data.text();
//         const errorData = JSON.parse(errorText);
//         Alert.alert('Download failed', errorData.error || 'Unknown error');
//         return;
//       }

//       if (!contentType.includes('pdf')) {
//         Alert.alert('Error', 'Unexpected response type. Expected PDF.');
//         return;
//       }

//       const blob = response.data;
//       if (blob.size === 0) {
//         Alert.alert('Error', 'Received empty PDF file.');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = async () => {
//         const base64Data = reader.result?.toString().split(',')[1];
//         if (!base64Data) {
//           Alert.alert('Error', 'Failed to extract PDF data.');
//           return;
//         }

//         const fileUri = FileSystem.documentDirectory + `receipt_${paymentIntentId}.pdf`;

//         try {
//           await FileSystem.writeAsStringAsync(fileUri, base64Data, {
//             encoding: FileSystem.EncodingType.Base64,
//           });

//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(fileUri, {
//               mimeType: 'application/pdf',
//               dialogTitle: 'Save or Share Receipt',
//             });
//           } else {
//             Alert.alert('PDF saved', `File saved at: ${fileUri}`);
//           }
//         } catch (writeError) {
//           console.log('File write error:', writeError);
//           Alert.alert('Error', 'Could not save PDF to device.');
//         }
//       };

//       reader.onerror = () => {
//         Alert.alert('Error', 'Could not read PDF data.');
//       };

//       reader.readAsDataURL(blob);
//     } catch (error) {
//       console.log('Download error:', error);
//       Alert.alert('Error', 'Could not download receipt.');
//     } finally {
//       setDownloading(false);
//     }
//   }, [paymentIntentId]);

//   return { downloadReceipt, downloading };
// };

// // --- Helper to merge cleaner data ---
// const mergeCleanerData = (receiptCleaners, scheduleAssignments, cleanersWithFee) => {
//   // receiptCleaners: [{ cleanerId, fee }] from receipt.cleaners (parsed JSON)
//   // scheduleAssignments: assignedTo array from schedule (contains cleanerId, firstname, lastname)
//   // cleanersWithFee: passed prop (may include firstname, lastname, fee)

//   return receiptCleaners.map((rc) => {
//     const fromSchedule = scheduleAssignments?.find(a => a.cleanerId === rc.cleanerId);
//     const fromProp = cleanersWithFee?.find(c => c.cleanerId === rc.cleanerId);

//     // Prefer schedule for name, fallback to prop, then generic
//     const firstName = fromSchedule?.firstname || fromProp?.firstname || '';
//     const lastName = fromSchedule?.lastname || fromProp?.lastname || '';
//     const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Unknown Cleaner';

//     return {
//       cleanerId: rc.cleanerId,
//       fee: rc.fee,
//       name,
//     };
//   });
// };

// // --- Main Component ---
// const PaymentDetails = ({ cleaningServiceFee, cleanersWithFee = [] }) => {
//   const route = useRoute();
//   const { payment_intent_id, scheduleId } = route.params;

//   const [modalVisible, setModalVisible] = useState(false);
//   const [receipt, setReceipt] = useState(null);
//   const [cleaners, setCleaners] = useState([]); // receipt.cleaners parsed (id+fee)
//   const [schedule, setSchedule] = useState(null);
//   const [loadingReceipt, setLoadingReceipt] = useState(false);
//   const [loadingSchedule, setLoadingSchedule] = useState(false);

//   const { downloadReceipt, downloading } = useReceiptDownload(payment_intent_id);

//   // Fetch receipt data
//   useEffect(() => {
//     if (payment_intent_id) {
//       fetchReceipt();
//     }
//   }, [payment_intent_id]);

//   const fetchReceipt = async () => {
//     setLoadingReceipt(true);
//     try {
//       const response = await userService.getStripeReceipt(payment_intent_id);
//       const res = response.data;
//       setReceipt(res);

//       // Parse cleaners JSON string from receipt
//       const cleanersArray = JSON.parse(res.cleaners || '[]');
//       setCleaners(cleanersArray);
//       console.log("Reading...", cleanersArray)
//       console.log(cleanersArray)

//       // If receipt contains scheduleId, fetch schedule
//       fetchSchedule(scheduleId);
      
//     } catch (error) {
//       console.log('Error fetching receipt:', error);
//       Alert.alert('Error', 'Could not load receipt details.');
//     } finally {
//       setLoadingReceipt(false);
//     }
//   };

//   const fetchSchedule = async (scheduleId) => {
//     setLoadingSchedule(true);
//     try {
//       const response = await userService.getScheduleById(scheduleId); // Adjust based on your service
//       setSchedule(response.data);
//       console.log("Scheduleeeeee------", response.data)
//     } catch (error) {
//       console.log('Error fetching schedule:', error);
//       // Non-critical, continue without schedule data
//     } finally {
//       setLoadingSchedule(false);
//     }
//   };

//   // Merge cleaner data for display
//   const mergedCleaners = useMemo(() => {
//     return mergeCleanerData(cleaners, schedule?.assignedTo, cleanersWithFee);
//   }, [cleaners, schedule, cleanersWithFee]);
//   alert(cleanersWithFee)
//   // Computed values for totals (still based on cleanersWithFee, as fees are there)
//   const subtotal = useMemo(() => {
//     if (cleanersWithFee.length > 0) {
//       return cleanersWithFee.reduce((sum, cleaner) => sum + (Number(cleaner.fee) || 0), 0);
//     }
//     return Number(cleaningServiceFee);
//   }, [cleanersWithFee, cleaningServiceFee]);

//   const serviceFee = useMemo(() => subtotal * 0.1, [subtotal]);
//   const total = useMemo(() => subtotal + serviceFee, [subtotal, serviceFee]);

//   // Render each merged cleaner
//   const renderMergedCleaner = (item, index) => (
//     <View key={index} style={styles.row}>
//       <Text style={styles.label}>{item.name}</Text>
//       <Text style={styles.value}>${Number(item.fee).toFixed(2)}</Text>
//     </View>
//   );

//   // Render cleaner rows from cleanersWithFee (for payment breakdown)
//   const renderCleanerWithFee = (cleaner, index) => (
//     <View key={index} style={styles.row}>
//       <Text style={styles.label}>
//         {cleaner.firstname ? `${cleaner.firstname} ${cleaner.lastname || ''}` : `Cleaner ${index + 1}`}
//       </Text>
//       <Text style={styles.value}>${Number(cleaner.fee).toFixed(2)}</Text>
//     </View>
//   );

//   if (loadingReceipt) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Receipt Section */}
//       <View style={styles.section}>
//         <Text style={styles.header}>Receipt #{receipt?.receipt_number}</Text>
//         <Text style={styles.detail}>Status: {receipt?.status}</Text>
//         <Text style={styles.detail}>
//           Total Amount: ${(receipt?.amount / 100).toFixed(2)} {receipt?.currency?.toUpperCase()}
//         </Text>

//         {/* Cleaners List with Names and Fees */}
//         {mergedCleaners.length > 0 && (
//           <View style={styles.cleanersContainer}>
//             <Text style={styles.subheader}>Cleaners</Text>
//             {mergedCleaners.map(renderMergedCleaner)}
//             {loadingSchedule && <ActivityIndicator size="small" color={COLORS.primary} />}
//           </View>
//         )}

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             onPress={() => Linking.openURL(receipt?.receipt_url || '')}
//             style={[styles.button, styles.onlineButton]}
//             disabled={!receipt?.receipt_url}
//           >
//             <Text style={styles.buttonText}>View Online Receipt</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={downloadReceipt}
//             style={[styles.button, styles.downloadButton]}
//             disabled={downloading}
//           >
//             {downloading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Download PDF</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Payment Breakdown (using cleanersWithFee for consistency) */}
//       <Text style={styles.sectionTitle}>Payment Breakdown</Text>

//       <View style={styles.card}>
//         <Text style={styles.cardHeader}>Cleaners</Text>
//         {cleanersWithFee.length > 0 ? (
//           cleanersWithFee.map(renderCleanerWithFee)
//         ) : (
//           <View style={styles.row}>
//             <Text style={styles.label}>Cleaning Service</Text>
//             <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.card}>
//         <View style={styles.row}>
//           <View style={styles.labelWithIcon}>
//             <Text style={styles.label}>Service Fee (10%)</Text>
//             <TouchableOpacity onPress={() => setModalVisible(true)}>
//               <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
//         </View>
//       </View>

//       <View style={styles.totalCard}>
//         <Text style={styles.totalLabel}>Total</Text>
//         <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
//       </View>

//       {/* Info Modal */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Service Fee</Text>
//             <Text style={styles.modalText}>
//               The 10% service fee covers operational costs, secure payment processing, and platform
//               maintenance to ensure seamless scheduling and support.
//             </Text>
//             <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 40,
//     backgroundColor: '#f9f9f9',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   section: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#111',
//   },
//   subheader: {
//     fontWeight: '600',
//     marginBottom: 8,
//     fontSize: 16,
//     color: '#333',
//   },
//   detail: {
//     fontSize: 15,
//     color: '#555',
//     marginBottom: 4,
//   },
//   cleanersContainer: {
//     marginTop: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 15,
//     color: '#555',
//     flex: 1,
//   },
//   value: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111',
//   },
//   labelWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   buttonRow: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   onlineButton: {
//     backgroundColor: COLORS.primary,
//   },
//   downloadButton: {
//     backgroundColor: '#4caf50',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginVertical: 12,
//     color: '#111',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   cardHeader: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: COLORS.primary,
//   },
//   totalCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     elevation: 2,
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 22,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   closeButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default PaymentDetails;












// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   ScrollView,
//   Linking,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import { useRoute } from '@react-navigation/native';

// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';

// // --- Custom hook for PDF download (unchanged) ---
// const useReceiptDownload = (paymentIntentId) => {
//   const [downloading, setDownloading] = useState(false);

//   const downloadReceipt = useCallback(async () => {
//     if (!paymentIntentId) return;

//     setDownloading(true);
//     try {
//       const response = await userService.downloadStripeReceipt(paymentIntentId, {
//         responseType: 'blob',
//       });

//       const contentType = response.headers?.['content-type'] || '';

//       if (contentType.includes('application/json')) {
//         const errorText = await response.data.text();
//         const errorData = JSON.parse(errorText);
//         Alert.alert('Download failed', errorData.error || 'Unknown error');
//         return;
//       }

//       if (!contentType.includes('pdf')) {
//         Alert.alert('Error', 'Unexpected response type. Expected PDF.');
//         return;
//       }

//       const blob = response.data;
//       if (blob.size === 0) {
//         Alert.alert('Error', 'Received empty PDF file.');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = async () => {
//         const base64Data = reader.result?.toString().split(',')[1];
//         if (!base64Data) {
//           Alert.alert('Error', 'Failed to extract PDF data.');
//           return;
//         }

//         const fileUri = FileSystem.documentDirectory + `receipt_${paymentIntentId}.pdf`;

//         try {
//           await FileSystem.writeAsStringAsync(fileUri, base64Data, {
//             encoding: FileSystem.EncodingType.Base64,
//           });

//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(fileUri, {
//               mimeType: 'application/pdf',
//               dialogTitle: 'Save or Share Receipt',
//             });
//           } else {
//             Alert.alert('PDF saved', `File saved at: ${fileUri}`);
//           }
//         } catch (writeError) {
//           console.log('File write error:', writeError);
//           Alert.alert('Error', 'Could not save PDF to device.');
//         }
//       };

//       reader.onerror = () => {
//         Alert.alert('Error', 'Could not read PDF data.');
//       };

//       reader.readAsDataURL(blob);
//     } catch (error) {
//       console.log('Download error:', error);
//       Alert.alert('Error', 'Could not download receipt.');
//     } finally {
//       setDownloading(false);
//     }
//   }, [paymentIntentId]);

//   return { downloadReceipt, downloading };
// };

// // --- Helper to merge cleaner data (now without cleanersWithFee) ---
// const mergeCleanerData = (receiptCleaners, scheduleAssignments) => {
//   // receiptCleaners: [{ cleanerId, fee }] from receipt.cleaners (parsed JSON)
//   // scheduleAssignments: assignedTo array from schedule (contains cleanerId, firstname, lastname)

//   return receiptCleaners.map((rc, index) => {
//     const fromSchedule = scheduleAssignments?.find(a => a.cleanerId === rc.cleanerId);

//     // Prefer schedule for name, otherwise generate a generic one
//     let name = 'Unknown Cleaner';
//     if (fromSchedule?.firstname || fromSchedule?.lastname) {
//       const firstName = fromSchedule.firstname || '';
//       const lastName = fromSchedule.lastname || '';
//       name = [firstName, lastName].filter(Boolean).join(' ').trim();
//     } else {
//       name = `Cleaner ${index + 1}`;
//     }

//     return {
//       cleanerId: rc.cleanerId,
//       fee: rc.fee,
//       name,
//     };
//   });
// };

// // --- Main Component (no props needed) ---
// const PaymentDetails = () => {
//   const route = useRoute();
//   const { payment_intent_id, scheduleId } = route.params;

//   const [modalVisible, setModalVisible] = useState(false);
//   const [receipt, setReceipt] = useState(null);
//   const [cleaners, setCleaners] = useState([]); // receipt.cleaners parsed (id+fee)
//   const [schedule, setSchedule] = useState(null);
//   const [loadingReceipt, setLoadingReceipt] = useState(false);
//   const [loadingSchedule, setLoadingSchedule] = useState(false);

//   const { downloadReceipt, downloading } = useReceiptDownload(payment_intent_id);

//   // Fetch receipt data
//   useEffect(() => {
//     if (payment_intent_id) {
//       fetchReceipt();
//     }
//   }, [payment_intent_id]);

//   const fetchReceipt = async () => {
//     setLoadingReceipt(true);
//     try {
//       const response = await userService.getStripeReceipt(payment_intent_id);
//       const res = response.data;
//       setReceipt(res);

//       // Parse cleaners JSON string from receipt
//       const cleanersArray = JSON.parse(res.cleaners || '[]');
//       setCleaners(cleanersArray);

//       // Fetch schedule using scheduleId from params
//       if (scheduleId) {
//         fetchSchedule(scheduleId);
//       }
//     } catch (error) {
//       console.log('Error fetching receipt:', error);
//       Alert.alert('Error', 'Could not load receipt details.');
//     } finally {
//       setLoadingReceipt(false);
//     }
//   };

//   const fetchSchedule = async (id) => {
//     setLoadingSchedule(true);
//     try {
//       const response = await userService.getScheduleById(id); // adjust to your service
//       setSchedule(response.data);
//     } catch (error) {
//       console.log('Error fetching schedule:', error);
//       // Non-critical, continue without schedule data
//     } finally {
//       setLoadingSchedule(false);
//     }
//   };

//   // Merge cleaner data for display
//   const mergedCleaners = useMemo(() => {
//     return mergeCleanerData(cleaners, schedule?.assignedTo);
//   }, [cleaners, schedule]);

//   // Computed values for totals
//   const subtotal = useMemo(() => {
//     return mergedCleaners.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
//   }, [mergedCleaners]);

//   const serviceFee = useMemo(() => subtotal * 0.1, [subtotal]);
//   const total = useMemo(() => subtotal + serviceFee, [subtotal, serviceFee]);

//   // Render each merged cleaner (used in both receipt section and breakdown card)
//   const renderMergedCleaner = (item, index) => (
//     <View key={index} style={styles.row}>
//       <Text style={styles.label}>{item.name}</Text>
//       <Text style={styles.value}>${Number(item.fee).toFixed(2)}</Text>
//     </View>
//   );

//   if (loadingReceipt) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Receipt Section */}
//       <View style={styles.section}>
//         <Text style={styles.header}>Receipt #{receipt?.receipt_number}</Text>
//         <Text style={styles.detail}>Status: {receipt?.status}</Text>
//         <Text style={styles.detail}>
//           Total Amount: ${(receipt?.amount / 100).toFixed(2)} {receipt?.currency?.toUpperCase()}
//         </Text>

//         {/* Cleaners List with Names and Fees */}
//         {mergedCleaners.length > 0 && (
//           <View style={styles.cleanersContainer}>
//             <Text style={styles.subheader}>Cleaners</Text>
//             {mergedCleaners.map(renderMergedCleaner)}
//             {loadingSchedule && <ActivityIndicator size="small" color={COLORS.primary} />}
//           </View>
//         )}

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             onPress={() => Linking.openURL(receipt?.receipt_url || '')}
//             style={[styles.button, styles.onlineButton]}
//             disabled={!receipt?.receipt_url}
//           >
//             <Text style={styles.buttonText}>View Online Receipt</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={downloadReceipt}
//             style={[styles.button, styles.downloadButton]}
//             disabled={downloading}
//           >
//             {downloading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Download PDF</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Payment Breakdown (now using mergedCleaners) */}
//       <Text style={styles.sectionTitle}>Payment Breakdown</Text>

//       <View style={styles.card}>
//         <Text style={styles.cardHeader}>Cleaners</Text>
//         {mergedCleaners.length > 0 ? (
//           mergedCleaners.map(renderMergedCleaner)
//         ) : (
//           <View style={styles.row}>
//             <Text style={styles.label}>No cleaners data</Text>
//             <Text style={styles.value}>$0.00</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.card}>
//         <View style={styles.row}>
//           <View style={styles.labelWithIcon}>
//             <Text style={styles.label}>Service Fee (10%)</Text>
//             <TouchableOpacity onPress={() => setModalVisible(true)}>
//               <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
//         </View>
//       </View>

//       <View style={styles.totalCard}>
//         <Text style={styles.totalLabel}>Total</Text>
//         <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
//       </View>

//       {/* Info Modal (unchanged) */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Service Fee</Text>
//             <Text style={styles.modalText}>
//               The 10% service fee covers operational costs, secure payment processing, and platform
//               maintenance to ensure seamless scheduling and support.
//             </Text>
//             <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 40,
//     backgroundColor: '#f9f9f9',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   section: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#111',
//   },
//   subheader: {
//     fontWeight: '600',
//     marginBottom: 8,
//     fontSize: 16,
//     color: '#333',
//   },
//   detail: {
//     fontSize: 15,
//     color: '#555',
//     marginBottom: 4,
//   },
//   cleanersContainer: {
//     marginTop: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 15,
//     color: '#555',
//     flex: 1,
//   },
//   value: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111',
//   },
//   labelWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   buttonRow: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   onlineButton: {
//     backgroundColor: COLORS.primary,
//   },
//   downloadButton: {
//     backgroundColor: '#4caf50',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginVertical: 12,
//     color: '#111',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   cardHeader: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: COLORS.primary,
//   },
//   totalCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     elevation: 2,
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 22,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   closeButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default PaymentDetails;