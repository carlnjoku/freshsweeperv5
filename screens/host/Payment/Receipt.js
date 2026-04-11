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
// const Receipt = () => {
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

// export default Receipt;



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRoute } from '@react-navigation/native';

import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';
import { tSafe } from '../../../utils/tSafe'; // added import

// --- Custom hook for PDF download ---
const useReceiptDownload = (paymentIntentId) => {
  const [downloading, setDownloading] = useState(false);

  const downloadReceipt = useCallback(async () => {
    if (!paymentIntentId) return;

    setDownloading(true);
    try {
      const response = await userService.downloadStripeReceipt(paymentIntentId, {
        responseType: 'blob',
      });

      const contentType = response.headers?.['content-type'] || '';

      if (contentType.includes('application/json')) {
        const errorText = await response.data.text();
        const errorData = JSON.parse(errorText);
        Alert.alert(
          tSafe('download_failed_title', 'Download failed'),
          errorData.error || tSafe('unknown_error', 'Unknown error')
        );
        return;
      }

      if (!contentType.includes('pdf')) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe('unexpected_response', 'Unexpected response type. Expected PDF.')
        );
        return;
      }

      const blob = response.data;
      if (blob.size === 0) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe('empty_pdf', 'Received empty PDF file.')
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (!base64Data) {
          Alert.alert(
            tSafe('error_title', 'Error'),
            tSafe('pdf_data_extract_failed', 'Failed to extract PDF data.')
          );
          return;
        }

        const fileUri = FileSystem.documentDirectory + `receipt_${paymentIntentId}.pdf`;

        try {
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: tSafe('share_receipt_title', 'Save or Share Receipt'),
            });
          } else {
            Alert.alert(
              tSafe('pdf_saved_title', 'PDF saved'),
              tSafe('pdf_saved_message', 'File saved at: {path}', { path: fileUri })
            );
          }
        } catch (writeError) {
          console.log('File write error:', writeError);
          Alert.alert(
            tSafe('error_title', 'Error'),
            tSafe('pdf_save_failed', 'Could not save PDF to device.')
          );
        }
      };

      reader.onerror = () => {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe('pdf_read_failed', 'Could not read PDF data.')
        );
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('pdf_download_failed', 'Could not download receipt.')
      );
    } finally {
      setDownloading(false);
    }
  }, [paymentIntentId]);

  return { downloadReceipt, downloading };
};

// --- Helper to merge cleaner data ---
const mergeCleanerData = (receiptCleaners, scheduleAssignments) => {
  // receiptCleaners: [{ cleanerId, fee }] from receipt.cleaners (parsed JSON)
  // scheduleAssignments: assignedTo array from schedule (contains cleanerId, firstname, lastname)

  return receiptCleaners.map((rc, index) => {
    const fromSchedule = scheduleAssignments?.find(a => a.cleanerId === rc.cleanerId);

    // Prefer schedule for name, otherwise generate a generic one
    let name = tSafe('unknown_cleaner', 'Unknown Cleaner');
    if (fromSchedule?.firstname || fromSchedule?.lastname) {
      const firstName = fromSchedule.firstname || '';
      const lastName = fromSchedule.lastname || '';
      name = [firstName, lastName].filter(Boolean).join(' ').trim();
    } else {
      name = tSafe('cleaner_number', 'Cleaner {number}', { number: index + 1 });
    }

    return {
      cleanerId: rc.cleanerId,
      fee: rc.fee,
      name,
    };
  });
};

// --- Main Component ---
const Receipt = () => {
  const route = useRoute();
  const { payment_intent_id, scheduleId } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [cleaners, setCleaners] = useState([]); // receipt.cleaners parsed (id+fee)
  const [schedule, setSchedule] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const { downloadReceipt, downloading } = useReceiptDownload(payment_intent_id);

  // Fetch receipt data
  useEffect(() => {
    if (payment_intent_id) {
      fetchReceipt();
    }
  }, [payment_intent_id]);

  const fetchReceipt = async () => {
    setLoadingReceipt(true);
    try {
      const response = await userService.getStripeReceipt(payment_intent_id);
      const res = response.data;
      setReceipt(res);

      // Parse cleaners JSON string from receipt
      const cleanersArray = JSON.parse(res.cleaners || '[]');
      setCleaners(cleanersArray);

      // Fetch schedule using scheduleId from params
      if (scheduleId) {
        fetchSchedule(scheduleId);
      }
    } catch (error) {
      console.log('Error fetching receipt:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('receipt_load_failed', 'Could not load receipt details.')
      );
    } finally {
      setLoadingReceipt(false);
    }
  };

  const fetchSchedule = async (id) => {
    setLoadingSchedule(true);
    try {
      const response = await userService.getScheduleById(id); // adjust to your service
      setSchedule(response.data);
    } catch (error) {
      console.log('Error fetching schedule:', error);
      // Non-critical, continue without schedule data
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Merge cleaner data for display
  const mergedCleaners = useMemo(() => {
    return mergeCleanerData(cleaners, schedule?.assignedTo);
  }, [cleaners, schedule]);

  // Computed values for totals
  const subtotal = useMemo(() => {
    return mergedCleaners.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
  }, [mergedCleaners]);

  const serviceFee = useMemo(() => subtotal * 0.1, [subtotal]);
  const total = useMemo(() => subtotal + serviceFee, [subtotal, serviceFee]);

  // Render each merged cleaner (used in both receipt section and breakdown card)
  const renderMergedCleaner = (item, index) => (
    <View key={index} style={styles.row}>
      <Text style={styles.label}>{item.name}</Text>
      <Text style={styles.value}>${Number(item.fee).toFixed(2)}</Text>
    </View>
  );

  if (loadingReceipt) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Receipt Section */}
      <View style={styles.section}>
        <Text style={styles.header}>
          {tSafe('receipt_prefix', 'Receipt')} #{receipt?.receipt_number}
        </Text>
        <Text style={styles.detail}>
          {tSafe('status_label', 'Status:')} {receipt?.status}
        </Text>
        <Text style={styles.detail}>
          {tSafe('total_amount_label', 'Total Amount:')} ${(receipt?.amount / 100).toFixed(2)} {receipt?.currency?.toUpperCase()}
        </Text>

        {/* Cleaners List with Names and Fees */}
        {mergedCleaners.length > 0 && (
          <View style={styles.cleanersContainer}>
            <Text style={styles.subheader}>{tSafe('cleaners', 'Cleaners')}</Text>
            {mergedCleaners.map(renderMergedCleaner)}
            {loadingSchedule && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => Linking.openURL(receipt?.receipt_url || '')}
            style={[styles.button, styles.onlineButton]}
            disabled={!receipt?.receipt_url}
          >
            <Text style={styles.buttonText}>{tSafe('view_online_receipt', 'View Online Receipt')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={downloadReceipt}
            style={[styles.button, styles.downloadButton]}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{tSafe('download_pdf', 'Download PDF')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Breakdown (now using mergedCleaners) */}
      <Text style={styles.sectionTitle}>{tSafe('payment_breakdown', 'Payment Breakdown')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>{tSafe('cleaners', 'Cleaners')}</Text>
        {mergedCleaners.length > 0 ? (
          mergedCleaners.map(renderMergedCleaner)
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>{tSafe('no_cleaners_data', 'No cleaners data')}</Text>
            <Text style={styles.value}>$0.00</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.labelWithIcon}>
            <Text style={styles.label}>{tSafe('service_fee_label', 'Service Fee (10%)')}</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.value}>${serviceFee.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{tSafe('total_label', 'Total')}</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tSafe('service_fee_title', 'Service Fee')}</Text>
            <Text style={styles.modalText}>
              {tSafe(
                'service_fee_description',
                'The 10% service fee covers operational costs, secure payment processing, and platform maintenance to ensure seamless scheduling and support.'
              )}
            </Text>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>{tSafe('close', 'Close')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  subheader: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  detail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  cleanersContainer: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  onlineButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 12,
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.primary,
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Receipt;