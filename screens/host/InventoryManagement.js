// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   Modal,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Button, Divider } from 'react-native-paper';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe';

// export default function InventoryManagement({ route, navigation }) {
//   const { propertyId } = route.params;
//   const [inventory, setInventory] = useState([]);
//   const [supplyList, setSupplyList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSupplyName, setNewSupplyName] = useState('');
//   const [newSupplyUnit, setNewSupplyUnit] = useState('');

//   const [newSupplyPackSize, setNewSupplyPackSize] = useState('');

//   const fetchInventory = async () => {
//     try {
//       const res = await userService.getPropertyInventory(propertyId);
//       console.log("Inventoooooooooooooory", res.data)
//       setInventory(res.data || []);
//     } catch (error) {
//       console.error('Failed to load inventory', error);
//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe('inventory_load_failed', 'Could not load inventory')
//       );
//     }
//   };

//   const fetchSupplies = async () => {
//     try {
//       const res = await userService.getAllSupplies();
//       setSupplyList(res.data || []);
//     } catch (error) {
//       console.error('Failed to load supplies list', error);
//     }
//   };

//   const loadData = async () => {
//     setLoading(true);
//     await Promise.all([fetchInventory(), fetchSupplies()]);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   const handleRestock = async () => {
//     const { supply, quantity } = restockModal;
//     alert(quantity)
//     if (!quantity || parseFloat(quantity) <= 0) {
//       Alert.alert(
//         tSafe('invalid_quantity', 'Invalid Quantity'),
//         tSafe('positive_required', 'Please enter a positive number')
//       );
//       return;
//     }

//     // Determine the supply ID – try multiple possible locations
//     const supplyId = supply.supply_id || supply.supply?._id;
//     if (!supplyId) {
//       Alert.alert(
//         tSafe('error', 'Error'),
//         'Invalid supply data – missing ID'
//       );
//       console.error('Supply object missing ID:', supply);
//       return;
//     }

//     const qty = parseFloat(quantity);
//     try {
//       await userService.restockSupply(propertyId, supplyId, qty);

//       // Display meaningful success message
//       const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
//       const packSize = supply.supply?.pack_size || 1;
//       let addedText = '';
//       if (packSize > 1 && qty % packSize === 0) {
//         const packs = qty / packSize;
//         addedText = `${packs} pack(s) (${qty} ${unitType}s)`;
//       } else {
//         addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//       }

//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
//       );
//       setRestockModal({ visible: false, supply: null, quantity: '' });
//       fetchInventory();
//     } catch (error) {
//       console.error('Restock error:', error?.response?.data || error.message);
//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe('restock_failed', 'Failed to restock')
//       );
//     }
//   };

//   const handleSetThreshold = (supply) => {
//     Alert.prompt(
//       tSafe('set_reorder_threshold', 'Reorder Threshold'),
//       tSafe('threshold_prompt', 'Enter quantity that triggers reorder alert'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('set', 'Set'),
//           onPress: async (value) => {
//             const threshold = parseFloat(value);
//             if (isNaN(threshold)) return;
//             try {
//               await userService.updatePropertyInventory(propertyId, supply.supply_id, {
//                 reorder_threshold: threshold,
//               });
//               fetchInventory();
//               Alert.alert(
//                 tSafe('success', 'Success'),
//                 tSafe('threshold_updated', 'Threshold updated')
//               );
//             } catch (err) {
//               Alert.alert(
//                 tSafe('error', 'Error'),
//                 tSafe('threshold_update_failed', 'Could not update threshold')
//               );
//             }
//           },
//         },
//       ],
//       'plain-text'
//     );
//   };

//   const handleAddExistingSupply = async (supplyId) => {
//     try {
//       await userService.updatePropertyInventory(propertyId, supplyId, {
//         quantity: 0,
//         reorder_threshold: 0,
//         reorder_quantity: 0,
//       });
//       fetchInventory();
//       setAddModalVisible(false);
//     } catch (err) {
//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe('add_supply_failed', 'Could not add supply')
//       );
//     }
//   };

//   const handleCreateSupply = async () => {
//     if (!newSupplyName.trim()) {
//         Alert.alert(
//             tSafe('required', 'Required'),
//             tSafe('supply_name_required', 'Please enter a supply name')
//         );
//         return;
//     }
//     const packSize = parseFloat(newSupplyPackSize);
//     if (isNaN(packSize) || packSize <= 0) {
//         Alert.alert(
//             tSafe('invalid_pack_size', 'Invalid Pack Size'),
//             tSafe('pack_size_positive', 'Pack size must be a positive number')
//         );
//         return;
//     }
//     try {
//         const newSupply = await userService.createSupply({
//             name: newSupplyName,
//             category: tSafe('custom_category', 'Custom'),
//             unit_type: newSupplyUnit.trim() || 'piece',
//             pack_size: packSize,
//             default_unit_price: 0,
//         });
//         await handleAddExistingSupply(newSupply.data._id);
//         setNewSupplyName('');
//         setNewSupplyUnit('');
//         setNewSupplyPackSize('');
//     } catch (err) {
//         Alert.alert(
//             tSafe('error', 'Error'),
//             tSafe('create_supply_failed', 'Could not create supply')
//         );
//     }
// };



// const renderInventoryItem = (item) => {
//     const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
//     const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
//     const packSize = item.supply?.pack_size || 1;
//     const totalUnits = item.quantity || 0;
//     const threshold = item.reorder_threshold || 0;
//     const isLow = threshold > 0 && totalUnits <= threshold;

//     let quantityDisplay = '';
//     if (totalUnits === 0) {
//         quantityDisplay = tSafe('out_of_stock', 'Out of stock');
//     } else if (packSize > 1 && totalUnits % packSize === 0) {
//         const packs = totalUnits / packSize;
//         quantityDisplay = `${packs} ${tSafe('pack', 'pack')}${packs !== 1 ? 's' : ''}`;
//         if (packSize > 1) {
//             quantityDisplay += ` (${totalUnits} ${unitType}${totalUnits !== 1 ? 's' : ''})`;
//         }
//     } else {
//         quantityDisplay = `${totalUnits} ${unitType}${totalUnits !== 1 ? 's' : ''}`;
//     }

//     return (
//         <View key={item._id} style={styles.inventoryItem}>
//             <View style={styles.inventoryItemLeft}>
//                 <MaterialCommunityIcons name="package-variant" size={32} color={COLORS.primary} />
//                 <View style={styles.inventoryItemInfo}>
//                     <Text style={styles.itemName}>{supplyName}</Text>
//                     <Text style={styles.itemQuantity}>
//                         {quantityDisplay}
//                         {isLow && <Text style={styles.lowStockBadge}> ({tSafe('low', 'Low')})</Text>}
//                     </Text>
//                     {threshold > 0 && (
//                         <Text style={styles.thresholdText}>
//                             {tSafe('reorder_when_below', 'Reorder when below')} {threshold} {unitType}{threshold !== 1 ? 's' : ''}
//                         </Text>
//                     )}
//                 </View>
//             </View>
//             <View style={styles.itemActions}>
//                 <TouchableOpacity
//                     style={styles.actionButton}
//                     onPress={() => handleSetThreshold(item)}
//                 >
//                     <MaterialIcons name="settings" size={20} color={COLORS.gray} />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     style={[styles.actionButton, styles.restockButton]}
//                     onPress={() => setRestockModal({ visible: true, supply: item, quantity: '' })}
//                 >
//                     <MaterialIcons name="add" size={20} color="white" />
//                     <Text style={styles.restockText}>{tSafe('restock', 'Restock')}</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         contentContainerStyle={styles.content}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>{tSafe('inventory_management', 'Inventory Management')}</Text>
//           <Text style={styles.subtitle}>
//             {tSafe('inventory_subtitle', 'Track supplies, set reorder levels, and restock.')}
//           </Text>
//         </View>

//         {inventory.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="package-variant-closed" size={64} color="#ccc" />
//             <Text style={styles.emptyText}>{tSafe('no_inventory', 'No inventory items yet')}</Text>
//             <Text style={styles.emptySubtext}>
//               {tSafe('tap_to_add', 'Tap + to add supplies from the master list')} 
//             </Text>
//           </View>
//         ) : (
//           inventory.map(renderInventoryItem)
//         )}
//       </ScrollView>

//       {/* Floating Action Button */}
//       <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
//         <MaterialIcons name="add" size={24} color="white" />
//       </TouchableOpacity>

//       {/* Restock Modal */}
//       <Modal visible={restockModal.visible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
//             <Text style={styles.modalSupplyName}>
//               {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('quantity', 'Quantity')}
//               keyboardType="numeric"
//               value={restockModal.quantity}
//               onChangeText={(text) =>
//                 setRestockModal({ ...restockModal, quantity: text })
//               }
//             />
//             <View style={styles.modalButtons}>
//               <Button
//                 mode="outlined"
//                 onPress={() => setRestockModal({ visible: false, supply: null, quantity: '' })}
//               >
//                 {tSafe('cancel', 'Cancel')}
//               </Button>
//               <Button mode="contained" onPress={handleRestock} buttonColor={COLORS.primary}>
//                 {tSafe('restock', 'Restock')}
//               </Button>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Add Supply Modal */}
//       {/* <Modal visible={addModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('add_supply_to_property', 'Add Supply to this Property')}</Text>
//             <ScrollView style={{ maxHeight: 250 }}>
//               {supplyList
//                 .filter(s => !inventory.some(i => i.supply_id === s._id))
//                 .map(supply => (
//                   <TouchableOpacity
//                     key={supply._id}
//                     style={styles.addSupplyItem}
//                     onPress={() => handleAddExistingSupply(supply._id)}
//                   >
//                     <Text style={styles.addSupplyText}>{supply.name}</Text>
//                     <Text style={styles.addSupplyUnit}>({supply.unit})</Text>
//                   </TouchableOpacity>
//                 ))}
//               {supplyList.filter(s => !inventory.some(i => i.supply_id === s._id)).length === 0 && (
//                 <Text style={styles.noSuppliesText}>{tSafe('all_supplies_added', 'All supplies already added')}</Text>
//               )}
//             </ScrollView>
//             <Divider style={{ marginVertical: 16 }} />
//             <Text style={styles.sectionTitle}>{tSafe('or_create_new', 'Or create a new supply')}</Text>
            
//             <TextInput
//                 style={styles.modalInput}
//                 placeholder={tSafe('supply_name', 'Supply name')}
//                 value={newSupplyName}
//                 onChangeText={setNewSupplyName}
//             />
//             <TextInput
//                 style={styles.modalInput}
//                 placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, bag)')}
//                 value={newSupplyUnit}
//                 onChangeText={setNewSupplyUnit}
//             />
//             <TextInput
//                 style={styles.modalInput}
//                 placeholder={tSafe('pack_size_placeholder', 'Pieces per pack (e.g., 5)')}
//                 keyboardType="numeric"
//                 value={newSupplyPackSize}
//                 onChangeText={setNewSupplyPackSize}
//             />

            
            
//             <Button
//               mode="contained"
//               onPress={handleCreateSupply}
//               buttonColor={COLORS.primary}
//               style={{ marginTop: 8 }}
//             >
//               {tSafe('create_and_add', 'Create & Add')}
//             </Button>
//             <Button
//               mode="outlined"
//               onPress={() => setAddModalVisible(false)}
//               style={{ marginTop: 12 }}
//             >
//               {tSafe('cancel', 'Cancel')}
//             </Button>
//           </View>
//         </View>
//       </Modal> */}

//     <Modal visible={consumptionModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Consumption Rule for {selectedRoomType}</Text>
//             <Text style={styles.modalSubtitle}>
//                 When cleaning this room, deduct:
//             </Text>

//             <FloatingLabelPickerSelect
//                 label="Select Supply"
//                 value={consumptionSupplyId}
//                 onValueChange={setConsumptionSupplyId}
//                 items={supplyList.map(s => ({ label: s.name, value: s._id }))}
//             />

//             <TextInput
//                 style={styles.modalInput}
//                 placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (individual units)')}
//                 placeholderTextColor={COLORS.gray}
//                 keyboardType="numeric"
//                 value={consumptionQuantity}
//                 onChangeText={setConsumptionQuantity}
//             />
//             <Text style={styles.consumptionHelperText}>
//                 {tSafe('consumption_helper', 'Example: 1 tissue = 1, 1 pack of 12 tissues = 12')}
//             </Text>

//             {/* Live conversion preview */}
//             {consumptionSupplyId && consumptionQuantity && (
//                 <View style={styles.conversionPreview}>
//                 <Text style={styles.conversionPreviewText}>
//                     {(() => {
//                     const supply = supplyList.find(s => s._id === consumptionSupplyId);
//                     if (!supply) return null;
//                     const qty = parseFloat(consumptionQuantity);
//                     if (isNaN(qty)) return null;
//                     const packSize = supply.pack_size || 1;
//                     const unitType = supply.unit_type || 'unit';
//                     if (packSize <= 1) return `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//                     const packs = qty / packSize;
//                     if (qty % packSize === 0) {
//                         return `${packs} pack${packs !== 1 ? 's' : ''} (${qty} ${unitType}${qty !== 1 ? 's' : ''})`;
//                     } else {
//                         return `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//                     }
//                     })()}
//                 </Text>
//                 </View>
//             )}

//             <View style={styles.modalButtons}>
//                 <Button mode="outlined" onPress={() => setConsumptionModalVisible(false)}>
//                 {tSafe('cancel', 'Cancel')}
//                 </Button>
//                 <Button mode="contained" onPress={addRoomConsumptionRule} buttonColor={COLORS.primary}>
//                 {tSafe('add', 'Add')}
//                 </Button>
//             </View>
//             </View>
//         </View>
//     </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FC' },
//   content: { padding: 16, paddingBottom: 80 },
//   header: { marginBottom: 24 },
//   title: { fontSize: 24, fontWeight: '700', color: '#1E1E2F' },
//   subtitle: { fontSize: 14, color: '#6C6C80', marginTop: 4 },
//   inventoryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   inventoryItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   inventoryItemInfo: { marginLeft: 12, flex: 1 },
//   itemName: { fontSize: 16, fontWeight: '600', color: '#1E1E2F' },
//   itemQuantity: { fontSize: 14, color: '#6C6C80', marginTop: 2 },
//   lowStockBadge: { color: COLORS.warning, fontWeight: 'bold' },
//   thresholdText: { fontSize: 12, color: '#666', marginTop: 2 },
//   itemActions: { flexDirection: 'row', gap: 8 },
//   actionButton: { padding: 8 },
//   restockButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   restockText: { color: 'white', fontSize: 12, marginLeft: 4 },
//   emptyState: { alignItems: 'center', marginTop: 40 },
//   emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#666' },
//   emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
//   fab: {
//     position: 'absolute',
//     bottom: 24,
//     right: 24,
//     backgroundColor: COLORS.primary,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 20,
//     width: '85%',
//     maxHeight: '80%',
//   },
//   modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
//   modalSupplyName: { fontSize: 16, color: '#666', marginBottom: 16 },
//   modalInput: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 10,
//     fontSize: 16,
//     marginBottom: 16,
//   },
//   modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
//   addSupplyItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   addSupplyText: { fontSize: 16, color: '#1E1E2F' },
//   addSupplyUnit: { fontSize: 14, color: '#999' },
//   noSuppliesText: { textAlign: 'center', color: '#999', marginTop: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   consumptionHelperText: {
//   fontSize: 12,
//   color: '#999',
//   marginTop: -8,
//   marginBottom: 16,
// },
// conversionPreview: {
//   backgroundColor: '#F0F7FF',
//   padding: 10,
//   borderRadius: 10,
//   marginBottom: 20,
//   alignItems: 'center',
// },
// conversionPreviewText: {
//   fontSize: 13,
//   color: COLORS.primary,
//   fontWeight: '500',
// },
// });




// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   Modal,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Button, Divider } from 'react-native-paper';
// import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker'; // ❗ added missing import

// export default function InventoryManagement({ route, navigation }) {
//   const { propertyId } = route.params;

//   // Existing state
//   const [inventory, setInventory] = useState([]);
//   const [supplyList, setSupplyList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSupplyName, setNewSupplyName] = useState('');
//   const [newSupplyUnit, setNewSupplyUnit] = useState('');
//   const [newSupplyPackSize, setNewSupplyPackSize] = useState('');

//   // ---------- NEW STATE for room consumption ----------
//   const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
//   const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
//   const [selectedRoomType, setSelectedRoomType] = useState('');
//   const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
//   const [consumptionQuantity, setConsumptionQuantity] = useState('1');

//   // ---------- Fetch inventory & supplies ----------
//   const fetchInventory = async () => {
//     try {
//       const res = await userService.getPropertyInventory(propertyId);
//       console.log("Inventory data:", res.data);
//       setInventory(res.data || []);
//     } catch (error) {
//       console.error('Failed to load inventory', error);
//       Alert.alert(tSafe('error', 'Error'), tSafe('inventory_load_failed', 'Could not load inventory'));
//     }
//   };

//   const fetchSupplies = async () => {
//     try {
//       const res = await userService.getAllSupplies();
//       setSupplyList(res.data || []);
//     } catch (error) {
//       console.error('Failed to load supplies list', error);
//     }
//   };

//   // ---------- Room consumption rules CRUD ----------
//   const fetchRoomConsumptionRules = async () => {
//     try {
//       const res = await userService.getRoomConsumptionRules(propertyId);
//       const rules = {};
//       res.data.forEach(rule => {
//         if (!rules[rule.room_type]) rules[rule.room_type] = [];
//         rules[rule.room_type].push(rule);
//       });
//       setRoomConsumptionRules(rules);
//     } catch (err) {
//       console.error('Failed to load room consumption rules', err);
//     }
//   };

//   const addRoomConsumptionRule = async () => {
//     if (!selectedRoomType || !consumptionSupplyId) return;
//     const qty = parseFloat(consumptionQuantity);
//     if (isNaN(qty) || qty <= 0) {
//       Alert.alert('Invalid Quantity', 'Please enter a positive number');
//       return;
//     }
//     try {
//       const res = await userService.createRoomConsumptionRule({
//         property_id: propertyId,
//         room_type: selectedRoomType,
//         supply_id: consumptionSupplyId,
//         quantity: qty,
//       });
//       const newRule = res.data;
//       setRoomConsumptionRules(prev => ({
//         ...prev,
//         [selectedRoomType]: [...(prev[selectedRoomType] || []), newRule],
//       }));
//       setConsumptionModalVisible(false);
//       setConsumptionSupplyId('');
//       setConsumptionQuantity('1');
//     } catch (err) {
//       Alert.alert('Error', 'Could not add rule');
//     }
//   };

//   const deleteRoomConsumptionRule = async (roomType, ruleId) => {
//     Alert.alert(
//       'Remove Rule',
//       'Are you sure you want to remove this supply consumption?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Remove',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await userService.deleteRoomConsumptionRule(ruleId);
//               setRoomConsumptionRules(prev => ({
//                 ...prev,
//                 [roomType]: prev[roomType].filter(r => r.id !== ruleId),
//               }));
//             } catch (err) {
//               Alert.alert('Error', 'Could not remove rule');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ---------- Main data loader ----------
//   const loadData = async () => {
//     setLoading(true);
//     await Promise.all([fetchInventory(), fetchSupplies(), fetchRoomConsumptionRules()]);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   // ---------- Restock & Threshold (unchanged) ----------
//   const handleRestock = async () => {
//     const { supply, quantity } = restockModal;
//     if (!quantity || parseFloat(quantity) <= 0) {
//       Alert.alert(
//         tSafe('invalid_quantity', 'Invalid Quantity'),
//         tSafe('positive_required', 'Please enter a positive number')
//       );
//       return;
//     }

//     const supplyId = supply.supply_id || supply.supply?._id;
//     if (!supplyId) {
//       Alert.alert(tSafe('error', 'Error'), 'Invalid supply data – missing ID');
//       console.error('Supply object missing ID:', supply);
//       return;
//     }

//     const qty = parseFloat(quantity);
//     try {
//       await userService.restockSupply(propertyId, supplyId, qty);

//       const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
//       const packSize = supply.supply?.pack_size || 1;
//       let addedText = '';
//       if (packSize > 1 && qty % packSize === 0) {
//         const packs = qty / packSize;
//         addedText = `${packs} pack(s) (${qty} ${unitType}s)`;
//       } else {
//         addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//       }

//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
//       );
//       setRestockModal({ visible: false, supply: null, quantity: '' });
//       fetchInventory();
//     } catch (error) {
//       console.error('Restock error:', error?.response?.data || error.message);
//       Alert.alert(tSafe('error', 'Error'), tSafe('restock_failed', 'Failed to restock'));
//     }
//   };

//   const handleSetThreshold = (supply) => {
//     Alert.prompt(
//       tSafe('set_reorder_threshold', 'Reorder Threshold'),
//       tSafe('threshold_prompt', 'Enter quantity that triggers reorder alert'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('set', 'Set'),
//           onPress: async (value) => {
//             const threshold = parseFloat(value);
//             if (isNaN(threshold)) return;
//             try {
//               await userService.updatePropertyInventory(propertyId, supply.supply_id, {
//                 reorder_threshold: threshold,
//               });
//               fetchInventory();
//               Alert.alert(
//                 tSafe('success', 'Success'),
//                 tSafe('threshold_updated', 'Threshold updated')
//               );
//             } catch (err) {
//               Alert.alert(
//                 tSafe('error', 'Error'),
//                 tSafe('threshold_update_failed', 'Could not update threshold')
//               );
//             }
//           },
//         },
//       ],
//       'plain-text'
//     );
//   };

//   const handleAddExistingSupply = async (supplyId) => {
//     try {
//       await userService.updatePropertyInventory(propertyId, supplyId, {
//         quantity: 0,
//         reorder_threshold: 0,
//         reorder_quantity: 0,
//       });
//       fetchInventory();
//       setAddModalVisible(false);
//     } catch (err) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('add_supply_failed', 'Could not add supply'));
//     }
//   };

//   const handleCreateSupply = async () => {
//     if (!newSupplyName.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('supply_name_required', 'Please enter a supply name')
//       );
//       return;
//     }
//     const packSize = parseFloat(newSupplyPackSize);
//     if (isNaN(packSize) || packSize <= 0) {
//       Alert.alert(
//         tSafe('invalid_pack_size', 'Invalid Pack Size'),
//         tSafe('pack_size_positive', 'Pack size must be a positive number')
//       );
//       return;
//     }
//     try {
//       const newSupply = await userService.createSupply({
//         name: newSupplyName,
//         category: tSafe('custom_category', 'Custom'),
//         unit_type: newSupplyUnit.trim() || 'piece',
//         pack_size: packSize,
//         default_unit_price: 0,
//       });
//       await handleAddExistingSupply(newSupply.data._id);
//       setNewSupplyName('');
//       setNewSupplyUnit('');
//       setNewSupplyPackSize('');
//     } catch (err) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('create_supply_failed', 'Could not create supply'));
//     }
//   };

//   // ---------- Render inventory item ----------
//   const renderInventoryItem = (item) => {
//     const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
//     const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
//     const packSize = item.supply?.pack_size || 1;
//     const totalUnits = item.quantity || 0;
//     const threshold = item.reorder_threshold || 0;
//     const isLow = threshold > 0 && totalUnits <= threshold;

//     let quantityDisplay = '';
//     if (totalUnits === 0) {
//       quantityDisplay = tSafe('out_of_stock', 'Out of stock');
//     } else if (packSize > 1 && totalUnits % packSize === 0) {
//       const packs = totalUnits / packSize;
//       quantityDisplay = `${packs} ${tSafe('pack', 'pack')}${packs !== 1 ? 's' : ''}`;
//       if (packSize > 1) {
//         quantityDisplay += ` (${totalUnits} ${unitType}${totalUnits !== 1 ? 's' : ''})`;
//       }
//     } else {
//       quantityDisplay = `${totalUnits} ${unitType}${totalUnits !== 1 ? 's' : ''}`;
//     }

//     return (
//       <View key={item._id} style={styles.inventoryItem}>
//         <View style={styles.inventoryItemLeft}>
//           <MaterialCommunityIcons name="package-variant" size={32} color={COLORS.primary} />
//           <View style={styles.inventoryItemInfo}>
//             <Text style={styles.itemName}>{supplyName}</Text>
//             <Text style={styles.itemQuantity}>
//               {quantityDisplay}
//               {isLow && <Text style={styles.lowStockBadge}> ({tSafe('low', 'Low')})</Text>}
//             </Text>
//             {threshold > 0 && (
//               <Text style={styles.thresholdText}>
//                 {tSafe('reorder_when_below', 'Reorder when below')} {threshold} {unitType}{threshold !== 1 ? 's' : ''}
//               </Text>
//             )}
//           </View>
//         </View>
//         <View style={styles.itemActions}>
//           <TouchableOpacity style={styles.actionButton} onPress={() => handleSetThreshold(item)}>
//             <MaterialIcons name="settings" size={20} color={COLORS.gray} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.restockButton]}
//             onPress={() => setRestockModal({ visible: true, supply: item, quantity: '' })}
//           >
//             <MaterialIcons name="add" size={20} color="white" />
//             <Text style={styles.restockText}>{tSafe('restock', 'Restock')}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         contentContainerStyle={styles.content}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>{tSafe('inventory_management', 'Inventory Management')}</Text>
//           <Text style={styles.subtitle}>
//             {tSafe('inventory_subtitle', 'Track supplies, set reorder levels, and restock.')}
//           </Text>
//         </View>

//         {inventory.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="package-variant-closed" size={64} color="#ccc" />
//             <Text style={styles.emptyText}>{tSafe('no_inventory', 'No inventory items yet')}</Text>
//             <Text style={styles.emptySubtext}>
//               {tSafe('tap_to_add', 'Tap + to add supplies from the master list')}
//             </Text>
//           </View>
//         ) : (
//           inventory.map(renderInventoryItem)
//         )}

//         {/* ---------- Modern Room Consumption Card ---------- */}
//         <View style={styles.modernCard}>
//           <View style={styles.cardHeaderRow}>
//             <MaterialCommunityIcons name="package-variant-closed" size={24} color={COLORS.primary} />
//             <Text style={styles.cardTitle}>{tSafe('room_consumption', 'Room Supply Usage')}</Text>
//           </View>
//           <Text style={styles.cardSubtitle}>
//             {tSafe('room_consumption_desc', 'Define which supplies are used each time a room is cleaned – we’ll track consumption automatically.')}
//           </Text>

//           {['Bedroom', 'Bathroom', 'Kitchen', 'Livingroom'].map(roomType => {
//             const rules = roomConsumptionRules[roomType] || [];
//             const roomIcon = {
//               Bedroom: 'bed-king-outline',
//               Bathroom: 'shower-head',
//               Kitchen: 'fridge-outline',
//               Livingroom: 'sofa-outline',
//             }[roomType];

//             return (
//               <View key={roomType} style={styles.roomSection}>
//                 <View style={styles.roomSectionHeader}>
//                   <MaterialCommunityIcons name={roomIcon} size={20} color={COLORS.primary} />
//                   <Text style={styles.roomSectionTitle}>{tSafe(roomType.toLowerCase(), roomType)}</Text>
//                   <TouchableOpacity
//                     style={styles.addSupplyChip}
//                     onPress={() => {
//                       setSelectedRoomType(roomType);
//                       setConsumptionModalVisible(true);
//                     }}
//                   >
//                     <MaterialIcons name="add" size={14} color={COLORS.primary} />
//                     <Text style={styles.addSupplyChipText}>{tSafe('add_supply', 'Add')}</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {rules.length === 0 ? (
//                   <View style={styles.emptySupplyState}>
//                     <MaterialCommunityIcons name="clipboard-plus-outline" size={24} color="#ccc" />
//                     <Text style={styles.emptySupplyText}>No supplies defined</Text>
//                     <Text style={styles.emptySupplySubtext}>Tap + to add</Text>
//                   </View>
//                 ) : (
//                   <View style={styles.supplyChipContainer}>
//                     {rules.map(rule => {
//                       const supply = supplyList.find(s => s._id === rule.supply_id);
//                       const packSize = supply?.pack_size || 1;
//                       const qty = rule.quantity;
//                       const unitType = supply?.unit_type || 'unit';

//                       let displayQty = '';
//                       if (packSize > 1 && qty % packSize === 0) {
//                         const packs = qty / packSize;
//                         displayQty = `${packs} pack${packs !== 1 ? 's' : ''} (${qty} ${unitType}${qty !== 1 ? 's' : ''})`;
//                       } else {
//                         displayQty = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//                       }

//                       return (
//                         <View key={rule.id} style={styles.supplyChip}>
//                           <MaterialCommunityIcons name="package-variant" size={14} color={COLORS.primary} />
//                           <Text style={styles.supplyChipText}>
//                             {supply?.name || 'Unknown'} × {displayQty}
//                           </Text>
//                           <TouchableOpacity onPress={() => deleteRoomConsumptionRule(roomType, rule.id)}>
//                             <MaterialIcons name="close" size={16} color={COLORS.error} />
//                           </TouchableOpacity>
//                         </View>
//                       );
//                     })}
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       </ScrollView>

//       {/* Floating Action Button */}
//       <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
//         <MaterialIcons name="add" size={24} color="white" />
//       </TouchableOpacity>

//       {/* Restock Modal */}
//       <Modal visible={restockModal.visible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
//             <Text style={styles.modalSupplyName}>
//               {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('quantity', 'Quantity')}
//               keyboardType="numeric"
//               value={restockModal.quantity}
//               onChangeText={text => setRestockModal({ ...restockModal, quantity: text })}
//             />
//             <View style={styles.modalButtons}>
//               <Button mode="outlined" onPress={() => setRestockModal({ visible: false, supply: null, quantity: '' })}>
//                 {tSafe('cancel', 'Cancel')}
//               </Button>
//               <Button mode="contained" onPress={handleRestock} buttonColor={COLORS.primary}>
//                 {tSafe('restock', 'Restock')}
//               </Button>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Add Supply Modal (uncommented and working) */}
//       <Modal visible={addModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('add_supply_to_property', 'Add Supply to this Property')}</Text>
//             <ScrollView style={{ maxHeight: 250 }}>
//               {supplyList
//                 .filter(s => !inventory.some(i => i.supply_id === s._id))
//                 .map(supply => (
//                   <TouchableOpacity
//                     key={supply._id}
//                     style={styles.addSupplyItem}
//                     onPress={() => handleAddExistingSupply(supply._id)}
//                   >
//                     <Text style={styles.addSupplyText}>{supply.name}</Text>
//                     <Text style={styles.addSupplyUnit}>({supply.unit_type})</Text>
//                   </TouchableOpacity>
//                 ))}
//               {supplyList.filter(s => !inventory.some(i => i.supply_id === s._id)).length === 0 && (
//                 <Text style={styles.noSuppliesText}>{tSafe('all_supplies_added', 'All supplies already added')}</Text>
//               )}
//             </ScrollView>
//             <Divider style={{ marginVertical: 16 }} />
//             <Text style={styles.sectionTitle}>{tSafe('or_create_new', 'Or create a new supply')}</Text>

//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('supply_name', 'Supply name')}
//               value={newSupplyName}
//               onChangeText={setNewSupplyName}
//             />
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, bag)')}
//               value={newSupplyUnit}
//               onChangeText={setNewSupplyUnit}
//             />
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('pack_size_placeholder', 'Pieces per pack (e.g., 5)')}
//               keyboardType="numeric"
//               value={newSupplyPackSize}
//               onChangeText={setNewSupplyPackSize}
//             />

//             <Button
//               mode="contained"
//               onPress={handleCreateSupply}
//               buttonColor={COLORS.primary}
//               style={{ marginTop: 8 }}
//             >
//               {tSafe('create_and_add', 'Create & Add')}
//             </Button>
//             <Button
//               mode="outlined"
//               onPress={() => setAddModalVisible(false)}
//               style={{ marginTop: 12 }}
//             >
//               {tSafe('cancel', 'Cancel')}
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       {/* Consumption Modal */}
//       <Modal visible={consumptionModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Consumption Rule for {selectedRoomType}</Text>
//             <Text style={styles.modalSubtitle}>When cleaning this room, deduct:</Text>

//             <FloatingLabelPickerSelect
//               label="Select Supply"
//               value={consumptionSupplyId}
//               onValueChange={setConsumptionSupplyId}
//               items={supplyList.map(s => ({ label: s.name, value: s._id }))}
//             />

//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (individual units)')}
//               placeholderTextColor={COLORS.gray}
//               keyboardType="numeric"
//               value={consumptionQuantity}
//               onChangeText={setConsumptionQuantity}
//             />
//             <Text style={styles.consumptionHelperText}>
//               {tSafe('consumption_helper', 'Example: 1 tissue = 1, 1 pack of 12 tissues = 12')}
//             </Text>

//             {consumptionSupplyId && consumptionQuantity && (
//               <View style={styles.conversionPreview}>
//                 <Text style={styles.conversionPreviewText}>
//                   {(() => {
//                     const supply = supplyList.find(s => s._id === consumptionSupplyId);
//                     if (!supply) return null;
//                     const qty = parseFloat(consumptionQuantity);
//                     if (isNaN(qty)) return null;
//                     const packSize = supply.pack_size || 1;
//                     const unitType = supply.unit_type || 'unit';
//                     if (packSize <= 1) return `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//                     const packs = qty / packSize;
//                     if (qty % packSize === 0) {
//                       return `${packs} pack${packs !== 1 ? 's' : ''} (${qty} ${unitType}${qty !== 1 ? 's' : ''})`;
//                     } else {
//                       return `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;
//                     }
//                   })()}
//                 </Text>
//               </View>
//             )}

//             <View style={styles.modalButtons}>
//               <Button mode="outlined" onPress={() => setConsumptionModalVisible(false)}>
//                 {tSafe('cancel', 'Cancel')}
//               </Button>
//               <Button mode="contained" onPress={addRoomConsumptionRule} buttonColor={COLORS.primary}>
//                 {tSafe('add', 'Add')}
//               </Button>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ---------- Styles (keep existing and add new ones) ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FC' },
//   content: { padding: 16, paddingBottom: 80 },
//   header: { marginBottom: 24 },
//   title: { fontSize: 24, fontWeight: '700', color: '#1E1E2F' },
//   subtitle: { fontSize: 14, color: '#6C6C80', marginTop: 4 },
//   inventoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
//   inventoryItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   inventoryItemInfo: { marginLeft: 12, flex: 1 },
//   itemName: { fontSize: 16, fontWeight: '600', color: '#1E1E2F' },
//   itemQuantity: { fontSize: 14, color: '#6C6C80', marginTop: 2 },
//   lowStockBadge: { color: COLORS.warning, fontWeight: 'bold' },
//   thresholdText: { fontSize: 12, color: '#666', marginTop: 2 },
//   itemActions: { flexDirection: 'row', gap: 8 },
//   actionButton: { padding: 8 },
//   restockButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
//   restockText: { color: 'white', fontSize: 12, marginLeft: 4 },
//   emptyState: { alignItems: 'center', marginTop: 40 },
//   emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#666' },
//   emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
//   fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '85%', maxHeight: '80%' },
//   modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
//   modalSupplyName: { fontSize: 16, color: '#666', marginBottom: 16 },
//   modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 16 },
//   modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
//   addSupplyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
//   addSupplyText: { fontSize: 16, color: '#1E1E2F' },
//   addSupplyUnit: { fontSize: 14, color: '#999' },
//   noSuppliesText: { textAlign: 'center', color: '#999', marginTop: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   consumptionHelperText: { fontSize: 12, color: '#999', marginTop: -8, marginBottom: 16 },
//   conversionPreview: { backgroundColor: '#F0F7FF', padding: 10, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
//   conversionPreviewText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
//   // new modern card styles
//   modernCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
//   cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//   cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E1E2F', marginLeft: 10 },
//   cardSubtitle: { fontSize: 14, color: '#6C6C80', lineHeight: 20, marginBottom: 20 },
//   roomSection: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 16 },
//   roomSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   roomSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E1E2F', flex: 1, marginLeft: 8 },
//   addSupplyChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
//   addSupplyChipText: { fontSize: 12, fontWeight: '500', color: COLORS.primary, marginLeft: 4 },
//   supplyChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
//   supplyChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E8ECF0', gap: 6 },
//   supplyChipText: { fontSize: 13, color: '#1E1E2F' },
//   emptySupplyState: { alignItems: 'center', paddingVertical: 16, backgroundColor: '#F8F9FC', borderRadius: 12 },
//   emptySupplyText: { fontSize: 14, color: '#999', marginTop: 4 },
//   emptySupplySubtext: { fontSize: 12, color: '#bbb' },
// });




import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

export default function InventoryManagement({ route, navigation }) {
  const { propertyId } = route.params;

  // ---------- State ----------
  const [inventory, setInventory] = useState([]);
  const [supplyList, setSupplyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyUnit, setNewSupplyUnit] = useState('');

  // --- Room consumption rules ---
  const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
  const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
  const [consumptionQuantity, setConsumptionQuantity] = useState('1');

  // ---------- Data fetching ----------
  const fetchInventory = async () => {
    try {
      const res = await userService.getPropertyInventory(propertyId);
      setInventory(res.data || []);
    } catch (error) {
      console.error('Failed to load inventory', error);
      Alert.alert(tSafe('error', 'Error'), tSafe('inventory_load_failed', 'Could not load inventory'));
    }
  };

  const fetchSupplies = async () => {
    try {
      const res = await userService.getAllSupplies();
      setSupplyList(res.data || []);
    } catch (error) {
      console.error('Failed to load supplies list', error);
    }
  };

  const fetchRoomConsumptionRules = async () => {
    try {
      const res = await userService.getRoomConsumptionRules(propertyId);
      const rules = {};
      res.data.forEach(rule => {
        if (!rules[rule.room_type]) rules[rule.room_type] = [];
        rules[rule.room_type].push(rule);
      });
      console.log(rules)
      setRoomConsumptionRules(rules);
    } catch (err) {
      console.error('Failed to load room consumption rules', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchInventory(), fetchSupplies(), fetchRoomConsumptionRules()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ---------- Restock ----------
  const handleRestock = async () => {
    const { supply, quantity } = restockModal;
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert(
        tSafe('invalid_quantity', 'Invalid Quantity'),
        tSafe('positive_required', 'Please enter a positive number')
      );
      return;
    }

    const supplyId = supply.supply_id || supply.supply?._id;
    if (!supplyId) {
      Alert.alert(tSafe('error', 'Error'), 'Invalid supply data – missing ID');
      return;
    }

    const qty = parseFloat(quantity);
    try {
      await userService.restockSupply(propertyId, supplyId, qty);
      const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
      const addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

      Alert.alert(
        tSafe('success', 'Success'),
        tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
      );
      setRestockModal({ visible: false, supply: null, quantity: '' });
      fetchInventory();
    } catch (error) {
      Alert.alert(tSafe('error', 'Error'), tSafe('restock_failed', 'Failed to restock'));
    }
  };

  // ---------- Threshold ----------
  const handleSetThreshold = (supply) => {
    Alert.prompt(
      tSafe('set_reorder_threshold', 'Reorder Threshold'),
      tSafe('threshold_prompt', 'Enter quantity that triggers reorder alert'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('set', 'Set'),
          onPress: async (value) => {
            const threshold = parseFloat(value);
            if (isNaN(threshold)) return;
            try {
              await userService.updatePropertyInventory(propertyId, supply.supply_id, {
                reorder_threshold: threshold,
              });
              fetchInventory();
              Alert.alert(
                tSafe('success', 'Success'),
                tSafe('threshold_updated', 'Threshold updated')
              );
            } catch (err) {
              Alert.alert(
                tSafe('error', 'Error'),
                tSafe('threshold_update_failed', 'Could not update threshold')
              );
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // ---------- Add existing supply (from master list) ----------
  const handleAddExistingSupply = async (supplyId) => {
    try {
      await userService.updatePropertyInventory(propertyId, supplyId, {
        quantity: 0,
        reorder_threshold: 0,
        reorder_quantity: 0,
      });
      fetchInventory();
      setAddModalVisible(false);
    } catch (err) {
      Alert.alert(tSafe('error', 'Error'), tSafe('add_supply_failed', 'Could not add supply'));
    }
  };

  // ---------- Create brand‑new supply ----------
  const handleCreateSupply = async () => {
    if (!newSupplyName.trim()) {
      Alert.alert(
        tSafe('required', 'Required'),
        tSafe('supply_name_required', 'Please enter a supply name')
      );
      return;
    }
    if (!newSupplyUnit.trim()) {
      Alert.alert(
        tSafe('required', 'Required'),
        tSafe('unit_type_required', 'Please enter a unit type (e.g., bottle, tissue)')
      );
      return;
    }
    try {
      const newSupply = await userService.createSupply({
        name: newSupplyName,
        category: tSafe('custom_category', 'Custom'),
        unit_type: newSupplyUnit.trim(),
        default_unit_price: 0,
      });
      await handleAddExistingSupply(newSupply.data._id);
      setNewSupplyName('');
      setNewSupplyUnit('');
    } catch (err) {
      Alert.alert(tSafe('error', 'Error'), tSafe('create_supply_failed', 'Could not create supply'));
    }
  };

  // ---------- Room consumption rules (CRUD) ----------
  const addRoomConsumptionRule = async () => {
    if (!selectedRoomType || !consumptionSupplyId) return;
    const qty = parseFloat(consumptionQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a positive number');
      return;
    }
    try {
      const res = await userService.createRoomConsumptionRule({
        property_id: propertyId,
        room_type: selectedRoomType,
        supply_id: consumptionSupplyId,
        quantity: qty,
      });
      const newRule = res.data;
      setRoomConsumptionRules(prev => ({
        ...prev,
        [selectedRoomType]: [...(prev[selectedRoomType] || []), newRule],
      }));
      setConsumptionModalVisible(false);
      setConsumptionSupplyId('');
      setConsumptionQuantity('1');
    } catch (err) {
      Alert.alert('Error', 'Could not add rule');
    }
  };

  const deleteRoomConsumptionRule = async (roomType, ruleId) => {
    
    Alert.alert(
      'Remove Rule',
      'Are you sure you want to remove this supply consumption?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteRoomConsumptionRule(ruleId);
              setRoomConsumptionRules(prev => ({
                ...prev,
                [roomType]: prev[roomType].filter(r => r.id !== ruleId),
              }));
            } catch (err) {
              Alert.alert('Error', 'Could not remove rule');
            }
          },
        },
      ]
    );
  };

  // ---------- Render inventory item ----------
  const renderInventoryItem = (item) => {
    const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
    const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
    const totalUnits = item.quantity || 0;
    const threshold = item.reorder_threshold || 0;
    const isLow = threshold > 0 && totalUnits <= threshold;

    let quantityDisplay = '';
    if (totalUnits === 0) {
      quantityDisplay = tSafe('out_of_stock', 'Out of stock');
    } else {
      quantityDisplay = `${totalUnits} ${unitType}${totalUnits !== 1 ? 's' : ''}`;
    }

    return (
      <View key={item._id} style={styles.inventoryItem}>
        <View style={styles.inventoryItemLeft}>
          <MaterialCommunityIcons name="package-variant" size={32} color={COLORS.primary} />
          <View style={styles.inventoryItemInfo}>
            <Text style={styles.itemName}>{supplyName}</Text>
            <Text style={styles.itemQuantity}>
              {quantityDisplay}
              {isLow && <Text style={styles.lowStockBadge}> ({tSafe('low', 'Low')})</Text>}
            </Text>
            {threshold > 0 && (
              <Text style={styles.thresholdText}>
                {tSafe('reorder_when_below', 'Reorder when below')} {threshold} {unitType}{threshold !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSetThreshold(item)}>
            <MaterialIcons name="settings" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.restockButton]}
            onPress={() => setRestockModal({ visible: true, supply: item, quantity: '' })}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.restockText}>{tSafe('restock', 'Restock')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{tSafe('inventory_management', 'Inventory Management')}</Text>
          <Text style={styles.subtitle}>
            {tSafe('inventory_subtitle', 'Track supplies, set reorder levels, and restock.')}
          </Text>
        </View>

        {inventory.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{tSafe('no_inventory', 'No inventory items yet')}</Text>
            <Text style={styles.emptySubtext}>
              {tSafe('tap_to_add', 'Tap + to add supplies from the master list')}
            </Text>
          </View>
        ) : (
          inventory.map(renderInventoryItem)
        )}

        {/* ---------- Room Supply Usage Card (Modern UI) ---------- */}
        <View style={styles.modernCard}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="package-variant-closed" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{tSafe('room_consumption', 'Room Supply Usage')}</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {tSafe('room_consumption_desc', 'Define which supplies are used each time a room is cleaned – we’ll track consumption automatically.')}
          </Text>

          {['Bedroom', 'Bathroom', 'Kitchen', 'Livingroom'].map(roomType => {
            const rules = roomConsumptionRules[roomType] || [];
            console.log(rules)
            const roomIcon = {
              Bedroom: 'bed-king-outline',
              Bathroom: 'shower-head',
              Kitchen: 'fridge-outline',
              Livingroom: 'sofa-outline',
            }[roomType];

            return (
              <View key={roomType} style={styles.roomSection}>
                <View style={styles.roomSectionHeader}>
                  <MaterialCommunityIcons name={roomIcon} size={20} color={COLORS.primary} />
                  <Text style={styles.roomSectionTitle}>{tSafe(roomType.toLowerCase(), roomType)}</Text>
                  <TouchableOpacity
                    style={styles.addSupplyChip}
                    onPress={() => {
                      setSelectedRoomType(roomType);
                      setConsumptionModalVisible(true);
                    }}
                  >
                    <MaterialIcons name="add" size={14} color={COLORS.primary} />
                    <Text style={styles.addSupplyChipText}>{tSafe('add_supply', 'Add')}</Text>
                  </TouchableOpacity>
                </View>

                {rules.length === 0 ? (
                  <View style={styles.emptySupplyState}>
                    <MaterialCommunityIcons name="clipboard-plus-outline" size={24} color="#ccc" />
                    <Text style={styles.emptySupplyText}>No supplies defined</Text>
                    <Text style={styles.emptySupplySubtext}>Tap + to add</Text>
                  </View>
                ) : (
                  <View style={styles.supplyChipContainer}>
                    {rules.map(rule => {
                      const supply = supplyList.find(s => s._id === rule.supply_id);
                      const qty = rule.quantity;
                      const unitType = supply?.unit_type || 'unit';
                      const displayQty = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

                      return (
                        <View key={rule.id} style={styles.supplyChip}>
                          <MaterialCommunityIcons name="package-variant" size={14} color={COLORS.primary} />
                          <Text style={styles.supplyChipText}>
                            {supply?.name || 'Unknown'} × {displayQty}
                          </Text>
                          <TouchableOpacity onPress={() => deleteRoomConsumptionRule(roomType, rule._id)}>
                            <MaterialIcons name="close" size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Action Button to add existing supply */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* ---------- Restock Modal ---------- */}
      <Modal visible={restockModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
            <Text style={styles.modalSupplyName}>
              {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={tSafe('quantity', 'Quantity (e.g., 2.5)')}
              keyboardType="decimal-pad"
              value={restockModal.quantity}
              onChangeText={text => setRestockModal({ ...restockModal, quantity: text })}
            />
            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setRestockModal({ visible: false, supply: null, quantity: '' })}>
                {tSafe('cancel', 'Cancel')}
              </Button>
              <Button mode="contained" onPress={handleRestock} buttonColor={COLORS.primary}>
                {tSafe('restock', 'Restock')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Add Supply (from master list) Modal ---------- */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tSafe('add_supply_to_property', 'Add Supply to this Property')}</Text>
            <ScrollView style={{ maxHeight: 250 }}>
              {supplyList
                .filter(s => !inventory.some(i => i.supply_id === s._id))
                .map(supply => (
                  <TouchableOpacity
                    key={supply._id}
                    style={styles.addSupplyItem}
                    onPress={() => handleAddExistingSupply(supply._id)}
                  >
                    <Text style={styles.addSupplyText}>{supply.name}</Text>
                    <Text style={styles.addSupplyUnit}>({supply.unit_type})</Text>
                  </TouchableOpacity>
                ))}
              {supplyList.filter(s => !inventory.some(i => i.supply_id === s._id)).length === 0 && (
                <Text style={styles.noSuppliesText}>{tSafe('all_supplies_added', 'All supplies already added')}</Text>
              )}
            </ScrollView>
            <Divider style={{ marginVertical: 16 }} />
            <Text style={styles.sectionTitle}>{tSafe('or_create_new', 'Or create a new supply')}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder={tSafe('supply_name', 'Supply name')}
              value={newSupplyName}
              onChangeText={setNewSupplyName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, tissue)')}
              value={newSupplyUnit}
              onChangeText={setNewSupplyUnit}
            />

            <Button
              mode="contained"
              onPress={handleCreateSupply}
              buttonColor={COLORS.primary}
              style={{ marginTop: 8 }}
            >
              {tSafe('create_and_add', 'Create & Add')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setAddModalVisible(false)}
              style={{ marginTop: 12 }}
            >
              {tSafe('cancel', 'Cancel')}
            </Button>
          </View>
        </View>
      </Modal>

      {/* ---------- Consumption Rule Modal ---------- */}
      <Modal visible={consumptionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Consumption Rule for {selectedRoomType}</Text>
            <Text style={styles.modalSubtitle}>When cleaning this room, deduct:</Text>

            <FloatingLabelPickerSelect
              label="Select Supply"
              value={consumptionSupplyId}
              onValueChange={setConsumptionSupplyId}
              items={supplyList.map(s => ({ label: s.name, value: s._id }))}
            />

            <TextInput
              style={styles.modalInput}
              placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (e.g., 0.5)')}
              placeholderTextColor={COLORS.gray}
              keyboardType="decimal-pad"
              value={consumptionQuantity}
              onChangeText={setConsumptionQuantity}
            />
            <Text style={styles.consumptionHelperText}>
            {tSafe('consumption_helper_1', 'Example: 0.5 = half a bottle, 2 = two full bottles')}
            </Text>

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setConsumptionModalVisible(false)}>
                {tSafe('cancel', 'Cancel')}
              </Button>
              <Button mode="contained" onPress={addRoomConsumptionRule} buttonColor={COLORS.primary}>
                {tSafe('add', 'Add')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  content: { padding: 16, paddingBottom: 80 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1E1E2F' },
  subtitle: { fontSize: 14, color: '#6C6C80', marginTop: 4 },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inventoryItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  inventoryItemInfo: { marginLeft: 12, flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1E1E2F' },
  itemQuantity: { fontSize: 14, color: '#6C6C80', marginTop: 2 },
  lowStockBadge: { color: COLORS.warning, fontWeight: 'bold' },
  thresholdText: { fontSize: 12, color: '#666', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8 },
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  restockText: { color: 'white', fontSize: 12, marginLeft: 4 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSupplyName: { fontSize: 16, color: '#666', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  addSupplyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addSupplyText: { fontSize: 16, color: '#1E1E2F' },
  addSupplyUnit: { fontSize: 14, color: '#999' },
  noSuppliesText: { textAlign: 'center', color: '#999', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  consumptionHelperText: {
    fontSize: 12,
    color: '#999',
    marginTop: -8,
    marginBottom: 16,
  },
  // Modern card styles for room consumption
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E2F',
    marginLeft: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6C6C80',
    lineHeight: 20,
    marginBottom: 20,
  },
  roomSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  roomSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
    flex: 1,
    marginLeft: 8,
  },
  addSupplyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addSupplyChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 4,
  },
  supplyChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  supplyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    gap: 6,
  },
  supplyChipText: {
    fontSize: 13,
    color: '#1E1E2F',
  },
  emptySupplyState: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
  },
  emptySupplyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  emptySupplySubtext: {
    fontSize: 12,
    color: '#bbb',
  },
});