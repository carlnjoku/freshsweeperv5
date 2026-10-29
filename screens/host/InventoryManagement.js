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
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

// export default function InventoryManagement({ route, navigation }) {
//   const { propertyId } = route.params;

//   // ---------- State ----------
//   const [inventory, setInventory] = useState([]);
//   const [supplyList, setSupplyList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSupplyName, setNewSupplyName] = useState('');
//   const [newSupplyUnit, setNewSupplyUnit] = useState('');

//   // --- Room consumption rules ---
//   const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
//   const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
//   const [selectedRoomType, setSelectedRoomType] = useState('');
//   const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
//   const [consumptionQuantity, setConsumptionQuantity] = useState('1');

//   // ---------- Data fetching ----------
//   const fetchInventory = async () => {
//     try {
//       const res = await userService.getPropertyInventory(propertyId);
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

//   const fetchRoomConsumptionRules = async () => {
//     try {
//       const res = await userService.getRoomConsumptionRules(propertyId);
//       const rules = {};
//       res.data.forEach(rule => {
//         if (!rules[rule.room_type]) rules[rule.room_type] = [];
//         rules[rule.room_type].push(rule);
//       });
//       console.log(rules)
//       setRoomConsumptionRules(rules);
//     } catch (err) {
//       console.error('Failed to load room consumption rules', err);
//     }
//   };

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

//   // ---------- Restock ----------
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
//       return;
//     }

//     const qty = parseFloat(quantity);
//     try {
//       await userService.restockSupply(propertyId, supplyId, qty);
//       const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
//       const addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
//       );
//       setRestockModal({ visible: false, supply: null, quantity: '' });
//       fetchInventory();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('restock_failed', 'Failed to restock'));
//     }
//   };

//   // ---------- Threshold ----------
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

//   // ---------- Add existing supply (from master list) ----------
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

//   // ---------- Create brand‑new supply ----------
//   const handleCreateSupply = async () => {
//     if (!newSupplyName.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('supply_name_required', 'Please enter a supply name')
//       );
//       return;
//     }
//     if (!newSupplyUnit.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('unit_type_required', 'Please enter a unit type (e.g., bottle, tissue)')
//       );
//       return;
//     }
//     try {
//       const newSupply = await userService.createSupply({
//         name: newSupplyName,
//         category: tSafe('custom_category', 'Custom'),
//         unit_type: newSupplyUnit.trim(),
//         default_unit_price: 0,
//       });
//       await handleAddExistingSupply(newSupply.data._id);
//       setNewSupplyName('');
//       setNewSupplyUnit('');
//     } catch (err) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('create_supply_failed', 'Could not create supply'));
//     }
//   };

//   // ---------- Room consumption rules (CRUD) ----------
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

//   // ---------- Render inventory item ----------
//   const renderInventoryItem = (item) => {
//     const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
//     const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
//     const totalUnits = item.quantity || 0;
//     const threshold = item.reorder_threshold || 0;
//     const isLow = threshold > 0 && totalUnits <= threshold;

//     let quantityDisplay = '';
//     if (totalUnits === 0) {
//       quantityDisplay = tSafe('out_of_stock', 'Out of stock');
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

//         {/* ---------- Room Supply Usage Card (Modern UI) ---------- */}
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
//             console.log(rules)
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
//                       const qty = rule.quantity;
//                       const unitType = supply?.unit_type || 'unit';
//                       const displayQty = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//                       return (
//                         <View key={rule.id} style={styles.supplyChip}>
//                           <MaterialCommunityIcons name="package-variant" size={14} color={COLORS.primary} />
//                           <Text style={styles.supplyChipText}>
//                             {supply?.name || 'Unknown'} × {displayQty}
//                           </Text>
//                           <TouchableOpacity onPress={() => deleteRoomConsumptionRule(roomType, rule._id)}>
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

//       {/* Floating Action Button to add existing supply */}
//       <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
//         <MaterialIcons name="add" size={24} color="white" />
//       </TouchableOpacity>

//       {/* ---------- Restock Modal ---------- */}
//       <Modal visible={restockModal.visible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
//             <Text style={styles.modalSupplyName}>
//               {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('quantity', 'Quantity (e.g., 2.5)')}
//               keyboardType="decimal-pad"
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

//       {/* ---------- Add Supply (from master list) Modal ---------- */}
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
//               placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, tissue)')}
//               value={newSupplyUnit}
//               onChangeText={setNewSupplyUnit}
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

//       {/* ---------- Consumption Rule Modal ---------- */}
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
//               placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (e.g., 0.5)')}
//               placeholderTextColor={COLORS.gray}
//               keyboardType="decimal-pad"
//               value={consumptionQuantity}
//               onChangeText={setConsumptionQuantity}
//             />
//             <Text style={styles.consumptionHelperText}>
//             {tSafe('consumption_helper_1', 'Example: 0.5 = half a bottle, 2 = two full bottles')}
//             </Text>

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

// // ---------- Styles ----------
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
//     fontSize: 12,
//     color: '#999',
//     marginTop: -8,
//     marginBottom: 16,
//   },
//   // Modern card styles for room consumption
//   modernCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   cardHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginLeft: 10,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   roomSection: {
//     marginBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     paddingBottom: 16,
//   },
//   roomSectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     flex: 1,
//     marginLeft: 8,
//   },
//   addSupplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   addSupplyChipText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   supplyChipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   supplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FC',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     gap: 6,
//   },
//   supplyChipText: {
//     fontSize: 13,
//     color: '#1E1E2F',
//   },
//   emptySupplyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//   },
//   emptySupplyText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptySupplySubtext: {
//     fontSize: 12,
//     color: '#bbb',
//   },
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
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

// export default function InventoryManagement({ route, navigation }) {
//   const { propertyId } = route.params;

//   // ---------- State ----------
//   const [inventory, setInventory] = useState([]);
//   const [supplyList, setSupplyList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSupplyName, setNewSupplyName] = useState('');
//   const [newSupplyUnit, setNewSupplyUnit] = useState('');

//   // --- Room consumption rules ---
//   const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
//   const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
//   const [selectedRoomType, setSelectedRoomType] = useState('');
//   const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
//   const [consumptionQuantity, setConsumptionQuantity] = useState('1');

//   // --- Usage modal visibility ---
//   const [usageModalVisible, setUsageModalVisible] = useState(false);

//   // ---------- Data fetching ----------
//   const fetchInventory = async () => {
//     try {
//       const res = await userService.getPropertyInventory(propertyId);
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

//   // ---------- Restock ----------
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
//       return;
//     }

//     const qty = parseFloat(quantity);
//     try {
//       await userService.restockSupply(propertyId, supplyId, qty);
//       const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
//       const addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
//       );
//       setRestockModal({ visible: false, supply: null, quantity: '' });
//       fetchInventory();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('restock_failed', 'Failed to restock'));
//     }
//   };

//   // ---------- Threshold ----------
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

//   // ---------- Add existing supply (from master list) ----------
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

//   // ---------- Create brand‑new supply ----------
//   const handleCreateSupply = async () => {
//     if (!newSupplyName.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('supply_name_required', 'Please enter a supply name')
//       );
//       return;
//     }
//     if (!newSupplyUnit.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('unit_type_required', 'Please enter a unit type (e.g., bottle, tissue)')
//       );
//       return;
//     }
//     try {
//       const newSupply = await userService.createSupply({
//         name: newSupplyName,
//         category: tSafe('custom_category', 'Custom'),
//         unit_type: newSupplyUnit.trim(),
//         default_unit_price: 0,
//       });
//       await handleAddExistingSupply(newSupply.data._id);
//       setNewSupplyName('');
//       setNewSupplyUnit('');
//     } catch (err) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('create_supply_failed', 'Could not create supply'));
//     }
//   };

//   // ---------- Room consumption rules (CRUD) ----------
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
//       // Refresh rules to keep consistency
//       fetchRoomConsumptionRules();
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
//                 [roomType]: prev[roomType].filter(r => r._id !== ruleId),
//               }));
//             } catch (err) {
//               Alert.alert('Error', 'Could not remove rule');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ---------- Render inventory item ----------
//   const renderInventoryItem = (item) => {
//     const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
//     const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
//     const totalUnits = item.quantity || 0;
//     const threshold = item.reorder_threshold || 0;
//     const isLow = threshold > 0 && totalUnits <= threshold;

//     let quantityDisplay = '';
//     if (totalUnits === 0) {
//       quantityDisplay = tSafe('out_of_stock', 'Out of stock');
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
//           <View style={styles.headerRow}>
//             <Text style={styles.title}>{tSafe('inventory_management', 'Inventory Management')}</Text>
//             <TouchableOpacity
//               style={styles.usageButton}
//               onPress={() => setUsageModalVisible(true)}
//             >
//               <MaterialCommunityIcons name="package-variant-closed" size={24} color={COLORS.primary} />
//               <Text style={styles.usageButtonText}>{tSafe('usage', 'Usage')}</Text>
//             </TouchableOpacity>
//           </View>
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

//       {/* Floating Action Button to add existing supply */}
//       <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
//         <MaterialIcons name="add" size={24} color="white" />
//       </TouchableOpacity>

//       {/* ---------- Restock Modal ---------- */}
//       <Modal visible={restockModal.visible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
//             <Text style={styles.modalSupplyName}>
//               {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('quantity', 'Quantity (e.g., 2.5)')}
//               keyboardType="decimal-pad"
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

//       {/* ---------- Add Supply (from master list) Modal ---------- */}
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
//               placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, tissue)')}
//               value={newSupplyUnit}
//               onChangeText={setNewSupplyUnit}
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

//       {/* ---------- Consumption Rule Modal (for adding a rule) ---------- */}
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
//               placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (e.g., 0.5)')}
//               placeholderTextColor={COLORS.gray}
//               keyboardType="decimal-pad"
//               value={consumptionQuantity}
//               onChangeText={setConsumptionQuantity}
//             />
//             <Text style={styles.consumptionHelperText}>
//               {tSafe('consumption_helper_1', 'Example: 0.5 = half a bottle, 2 = two full bottles')}
//             </Text>

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

//       {/* ---------- USAGE MODAL (full-screen) ---------- */}
//       <Modal visible={usageModalVisible} transparent animationType="slide">
//         <View style={styles.fullModalOverlay}>
//           <View style={styles.fullModalContent}>
//             {/* Header with close button */}
//             <View style={styles.fullModalHeader}>
//               <Text style={styles.fullModalTitle}>{tSafe('room_consumption', 'Room Supply Usage')}</Text>
//               <TouchableOpacity onPress={() => setUsageModalVisible(false)}>
//                 <MaterialIcons name="close" size={28} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.fullModalSubtitle}>
//               {tSafe('room_consumption_desc', 'Define which supplies are used each time a room is cleaned – we’ll track consumption automatically.')}
//             </Text>

//             <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
//               {['Bedroom', 'Bathroom', 'Kitchen', 'Livingroom'].map(roomType => {
//                 const rules = roomConsumptionRules[roomType] || [];
//                 const roomIcon = {
//                   Bedroom: 'bed-king-outline',
//                   Bathroom: 'shower-head',
//                   Kitchen: 'fridge-outline',
//                   Livingroom: 'sofa-outline',
//                 }[roomType];

//                 return (
//                   <View key={roomType} style={styles.roomSection}>
//                     <View style={styles.roomSectionHeader}>
//                       <MaterialCommunityIcons name={roomIcon} size={20} color={COLORS.primary} />
//                       <Text style={styles.roomSectionTitle}>{tSafe(roomType.toLowerCase(), roomType)}</Text>
//                       <TouchableOpacity
//                         style={styles.addSupplyChip}
//                         onPress={() => {
//                           setSelectedRoomType(roomType);
//                           setConsumptionModalVisible(true);
//                         }}
//                       >
//                         <MaterialIcons name="add" size={14} color={COLORS.primary} />
//                         <Text style={styles.addSupplyChipText}>{tSafe('add_supply', 'Add')}</Text>
//                       </TouchableOpacity>
//                     </View>

//                     {rules.length === 0 ? (
//                       <View style={styles.emptySupplyState}>
//                         <MaterialCommunityIcons name="clipboard-plus-outline" size={24} color="#ccc" />
//                         <Text style={styles.emptySupplyText}>No supplies defined</Text>
//                         <Text style={styles.emptySupplySubtext}>Tap + to add</Text>
//                       </View>
//                     ) : (
//                       <View style={styles.supplyChipContainer}>
//                         {rules.map(rule => {
//                           const supply = supplyList.find(s => s._id === rule.supply_id);
//                           const qty = rule.quantity;
//                           const unitType = supply?.unit_type || 'unit';
//                           const displayQty = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//                           return (
//                             <View key={rule._id} style={styles.supplyChip}>
//                               <MaterialCommunityIcons name="package-variant" size={14} color={COLORS.primary} />
//                               <Text style={styles.supplyChipText}>
//                                 {supply?.name || 'Unknown'} × {displayQty}
//                               </Text>
//                               <TouchableOpacity onPress={() => deleteRoomConsumptionRule(roomType, rule._id)}>
//                                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                               </TouchableOpacity>
//                             </View>
//                           );
//                         })}
//                       </View>
//                     )}
//                   </View>
//                 );
//               })}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FC' },
//   content: { padding: 16, paddingBottom: 80 },
//   header: { marginBottom: 24 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   title: { fontSize: 24, fontWeight: '700', color: '#1E1E2F' },
//   subtitle: { fontSize: 14, color: '#6C6C80', marginTop: 4 },
//   usageButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   usageButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.primary, marginLeft: 6 },
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
//     fontSize: 12,
//     color: '#999',
//     marginTop: -8,
//     marginBottom: 16,
//   },
//   // Full modal styles (usage modal)
//   fullModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'flex-end',
//   },
//   fullModalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     paddingBottom: 40,
//     maxHeight: '90%',
//     minHeight: '70%',
//   },
//   fullModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   fullModalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   fullModalSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   fullModalBody: {
//     flex: 1,
//   },
//   roomSection: {
//     marginBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     paddingBottom: 16,
//   },
//   roomSectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     flex: 1,
//     marginLeft: 8,
//   },
//   addSupplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   addSupplyChipText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   supplyChipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   supplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FC',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     gap: 6,
//   },
//   supplyChipText: {
//     fontSize: 13,
//     color: '#1E1E2F',
//   },
//   emptySupplyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//   },
//   emptySupplyText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptySupplySubtext: {
//     fontSize: 12,
//     color: '#bbb',
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
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
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

// export default function InventoryManagement({ route, navigation }) {
//   const { propertyId } = route.params;

//   // ---------- State ----------
//   const [inventory, setInventory] = useState([]);
//   const [supplyList, setSupplyList] = useState([]);
//   const [propertyInfo, setPropertyInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSupplyName, setNewSupplyName] = useState('');
//   const [newSupplyUnit, setNewSupplyUnit] = useState('');

//   // --- Room consumption rules ---
//   const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
//   const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
//   const [selectedRoomType, setSelectedRoomType] = useState('');
//   const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
//   const [consumptionQuantity, setConsumptionQuantity] = useState('1');

//   // --- Usage modal visibility ---
//   const [usageModalVisible, setUsageModalVisible] = useState(false);

//   // ---------- Data fetching ----------
//   const fetchInventory = async () => {
//     try {
//       const res = await userService.getPropertyInventory(propertyId);
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

//   const fetchPropertyDetails = async () => {
//     try {
//       const res = await userService.getApartmentById(propertyId);
//       console.log(propertyId)
//       console.log("property-----PP", res.data)
//       setPropertyInfo(res.data);
//     } catch (error) {
//       console.error('Failed to load property details', error);
//     }
//   };

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

//   const loadData = async () => {
//     setLoading(true);
//     await Promise.all([
//       fetchInventory(),
//       fetchSupplies(),
//       fetchRoomConsumptionRules(),
//       fetchPropertyDetails(),
//     ]);
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

//   // ---------- Restock ----------
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
//       return;
//     }

//     const qty = parseFloat(quantity);
//     try {
//       await userService.restockSupply(propertyId, supplyId, qty);
//       const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
//       const addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
//       );
//       setRestockModal({ visible: false, supply: null, quantity: '' });
//       fetchInventory();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('restock_failed', 'Failed to restock'));
//     }
//   };

//   // ---------- Threshold ----------
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

//   // ---------- Add existing supply (from master list) ----------
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

//   // ---------- Create brand‑new supply ----------
//   const handleCreateSupply = async () => {
//     if (!newSupplyName.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('supply_name_required', 'Please enter a supply name')
//       );
//       return;
//     }
//     if (!newSupplyUnit.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('unit_type_required', 'Please enter a unit type (e.g., bottle, tissue)')
//       );
//       return;
//     }
//     try {
//       const newSupply = await userService.createSupply({
//         name: newSupplyName,
//         category: tSafe('custom_category', 'Custom'),
//         unit_type: newSupplyUnit.trim(),
//         default_unit_price: 0,
//       });
//       await handleAddExistingSupply(newSupply.data._id);
//       setNewSupplyName('');
//       setNewSupplyUnit('');
//     } catch (err) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('create_supply_failed', 'Could not create supply'));
//     }
//   };

//   // ---------- Room consumption rules (CRUD) ----------
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
//       fetchRoomConsumptionRules();
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
//                 [roomType]: prev[roomType].filter(r => r._id !== ruleId),
//               }));
//             } catch (err) {
//               Alert.alert('Error', 'Could not remove rule');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ---------- Render inventory item ----------
//   const renderInventoryItem = (item) => {
//     const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
//     const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
//     const totalUnits = item.quantity || 0;
//     const threshold = item.reorder_threshold || 0;
//     const isLow = threshold > 0 && totalUnits <= threshold;

//     let quantityDisplay = '';
//     if (totalUnits === 0) {
//       quantityDisplay = tSafe('out_of_stock', 'Out of stock');
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
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.headerRow}>
//             <Text style={styles.title}>{tSafe('inventory_management', 'Inventory Management')}</Text>
//             <TouchableOpacity
//               style={styles.usageButton}
//               onPress={() => setUsageModalVisible(true)}
//             >
//               <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.primary} />
//               <Text style={styles.usageButtonText}>{tSafe('usage', 'Usage')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Property Info Card */}
//         {propertyInfo && (
//           <View style={styles.propertyCard}>
//             <View style={styles.propertyCardHeader}>
//               <MaterialCommunityIcons name="home" size={24} color={COLORS.primary} />
//               <Text style={styles.propertyName}>{propertyInfo.name || 'Property'}</Text>
//             </View>
//             <View style={styles.propertyDetails}>
//               <View style={styles.propertyDetailItem}>
//                 <MaterialIcons name="location-on" size={16} color="#666" />
//                 <Text style={styles.propertyDetailText}>
//                   {propertyInfo.address || tSafe('no_address', 'No address')}
//                 </Text>
//               </View>
//               <View style={styles.propertyStats}>
//                 <View style={styles.statItem}>
//                   <MaterialCommunityIcons name="bed-king-outline" size={18} color={COLORS.primary} />
//                   <Text style={styles.statText}>
//                     {propertyInfo.bedrooms || propertyInfo.totalBedrooms || 0} {tSafe('bedrooms', 'Bedrooms')}
//                   </Text>
//                 </View>
//                 <View style={styles.statItem}>
//                   <MaterialCommunityIcons name="shower-head" size={18} color={COLORS.primary} />
//                   <Text style={styles.statText}>
//                     {propertyInfo.bathrooms || propertyInfo.totalBathrooms || 0} {tSafe('bathrooms', 'Bathrooms')}
//                   </Text>
//                 </View>
//                 <View style={styles.statItem}>
//                   <MaterialCommunityIcons name="floor-plan" size={18} color={COLORS.primary} />
//                   <Text style={styles.statText}>
//                     {propertyInfo.totalRooms || propertyInfo.rooms?.length || 0} {tSafe('rooms', 'Rooms')}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         )}

//         {/* Inventory List */}
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

//       {/* ---------- Restock Modal ---------- */}
//       <Modal visible={restockModal.visible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
//             <Text style={styles.modalSupplyName}>
//               {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('quantity', 'Quantity (e.g., 2.5)')}
//               keyboardType="decimal-pad"
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

//       {/* ---------- Add Supply Modal ---------- */}
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
//               placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, tissue)')}
//               value={newSupplyUnit}
//               onChangeText={setNewSupplyUnit}
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

//       {/* ---------- Consumption Rule Modal ---------- */}
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
//               placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (e.g., 0.5)')}
//               placeholderTextColor={COLORS.gray}
//               keyboardType="decimal-pad"
//               value={consumptionQuantity}
//               onChangeText={setConsumptionQuantity}
//             />
//             <Text style={styles.consumptionHelperText}>
//               {tSafe('consumption_helper_1', 'Example: 0.5 = half a bottle, 2 = two full bottles')}
//             </Text>

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

//       {/* ---------- Usage Modal ---------- */}
//       <Modal visible={usageModalVisible} transparent animationType="slide">
//         <View style={styles.fullModalOverlay}>
//           <View style={styles.fullModalContent}>
//             {/* Header */}
//             <View style={styles.fullModalHeader}>
//               <Text style={styles.fullModalTitle}>{tSafe('room_consumption', 'Room Supply Usage')}</Text>
//               <TouchableOpacity onPress={() => setUsageModalVisible(false)}>
//                 <MaterialIcons name="close" size={28} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.fullModalSubtitle}>
//               {tSafe('room_consumption_desc', 'Define which supplies are used each time a room is cleaned – we\'ll track consumption automatically.')}
//             </Text>

//             <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
//               {['Bedroom', 'Bathroom', 'Kitchen', 'Livingroom'].map(roomType => {
//                 const rules = roomConsumptionRules[roomType] || [];
//                 const roomIcon = {
//                   Bedroom: 'bed-king-outline',
//                   Bathroom: 'shower-head',
//                   Kitchen: 'fridge-outline',
//                   Livingroom: 'sofa-outline',
//                 }[roomType];

//                 return (
//                   <View key={roomType} style={styles.roomSection}>
//                     <View style={styles.roomSectionHeader}>
//                       <MaterialCommunityIcons name={roomIcon} size={20} color={COLORS.primary} />
//                       <Text style={styles.roomSectionTitle}>{tSafe(roomType.toLowerCase(), roomType)}</Text>
//                       <TouchableOpacity
//                         style={styles.addSupplyChip}
//                         onPress={() => {
//                           setSelectedRoomType(roomType);
//                           setConsumptionModalVisible(true);
//                         }}
//                       >
//                         <MaterialIcons name="add" size={14} color={COLORS.primary} />
//                         <Text style={styles.addSupplyChipText}>{tSafe('add_supply', 'Add')}</Text>
//                       </TouchableOpacity>
//                     </View>

//                     {rules.length === 0 ? (
//                       <View style={styles.emptySupplyState}>
//                         <MaterialCommunityIcons name="clipboard-plus-outline" size={24} color="#ccc" />
//                         <Text style={styles.emptySupplyText}>No supplies defined</Text>
//                         <Text style={styles.emptySupplySubtext}>Tap + to add</Text>
//                       </View>
//                     ) : (
//                       <View style={styles.supplyChipContainer}>
//                         {rules.map(rule => {
//                           const supply = supplyList.find(s => s._id === rule.supply_id);
//                           const qty = rule.quantity;
//                           const unitType = supply?.unit_type || 'unit';
//                           const displayQty = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//                           return (
//                             <View key={rule._id} style={styles.supplyChip}>
//                               <MaterialCommunityIcons name="package-variant" size={14} color={COLORS.primary} />
//                               <Text style={styles.supplyChipText}>
//                                 {supply?.name || 'Unknown'} × {displayQty}
//                               </Text>
//                               <TouchableOpacity onPress={() => deleteRoomConsumptionRule(roomType, rule._id)}>
//                                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                               </TouchableOpacity>
//                             </View>
//                           );
//                         })}
//                       </View>
//                     )}
//                   </View>
//                 );
//               })}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FC' },
//   content: { padding: 16, paddingBottom: 80 },
//   header: { marginBottom: 16 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   title: { fontSize: 24, fontWeight: '700', color: '#1E1E2F' },
//   usageButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   usageButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.primary, marginLeft: 6 },

//   // Property Card
//   propertyCard: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   propertyCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   propertyName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginLeft: 10,
//   },
//   propertyDetails: {
//     marginLeft: 4,
//   },
//   propertyDetailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   propertyDetailText: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//   },
//   propertyStats: {
//     flexDirection: 'row',
//     marginTop: 8,
//     gap: 16,
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statText: {
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 6,
//   },

//   // Inventory Items
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

//   // Empty State
//   emptyState: { alignItems: 'center', marginTop: 40 },
//   emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#666' },
//   emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },

//   // FAB
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

//   // Modals Overlay
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
//   modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
//   consumptionHelperText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: -8,
//     marginBottom: 16,
//   },

//   // Add Supply Modal
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

//   // Full Usage Modal
//   fullModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'flex-end',
//   },
//   fullModalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     paddingBottom: 40,
//     maxHeight: '90%',
//     minHeight: '70%',
//   },
//   fullModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   fullModalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   fullModalSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   fullModalBody: {
//     flex: 1,
//   },

//   // Room Sections (inside modal)
//   roomSection: {
//     marginBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     paddingBottom: 16,
//   },
//   roomSectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     flex: 1,
//     marginLeft: 8,
//   },
//   addSupplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   addSupplyChipText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   supplyChipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   supplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FC',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     gap: 6,
//   },
//   supplyChipText: {
//     fontSize: 13,
//     color: '#1E1E2F',
//   },
//   emptySupplyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//   },
//   emptySupplyText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptySupplySubtext: {
//     fontSize: 12,
//     color: '#bbb',
//   },
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
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

// export default function InventoryManagement({ route, navigation }) {
//   const { propertyId } = route.params;

//   // ---------- State ----------
//   const [inventory, setInventory] = useState([]);
//   const [supplyList, setSupplyList] = useState([]);
//   const [propertyInfo, setPropertyInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restockModal, setRestockModal] = useState({ visible: false, supply: null, quantity: '' });
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSupplyName, setNewSupplyName] = useState('');
//   const [newSupplyUnit, setNewSupplyUnit] = useState('');

//   // --- Room consumption rules ---
//   const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
//   const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
//   const [selectedRoomType, setSelectedRoomType] = useState('');
//   const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
//   const [consumptionQuantity, setConsumptionQuantity] = useState('1');

//   // --- Usage modal visibility ---
//   const [usageModalVisible, setUsageModalVisible] = useState(false);

//   // ---------- Data fetching ----------
//   const fetchInventory = async () => {
//     try {
//       const res = await userService.getPropertyInventory(propertyId);
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

//   const fetchPropertyDetails = async () => {
//     try {
//       const res = await userService.getApartmentById(propertyId);
//       setPropertyInfo(res.data);
//     } catch (error) {
//       console.error('Failed to load property details', error);
//     }
//   };

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

//   const loadData = async () => {
//     setLoading(true);
//     await Promise.all([
//       fetchInventory(),
//       fetchSupplies(),
//       fetchRoomConsumptionRules(),
//       fetchPropertyDetails(),
//     ]);
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

//   // ---------- Restock ----------
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
//       return;
//     }

//     const qty = parseFloat(quantity);
//     try {
//       await userService.restockSupply(propertyId, supplyId, qty);
//       const unitType = supply.supply?.unit_type || tSafe('unit', 'units');
//       const addedText = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//       Alert.alert(
//         tSafe('success', 'Success'),
//         tSafe('restocked_message', 'Added {quantity}', { quantity: addedText })
//       );
//       setRestockModal({ visible: false, supply: null, quantity: '' });
//       fetchInventory();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('restock_failed', 'Failed to restock'));
//     }
//   };

//   // ---------- Threshold ----------
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

//   // ---------- Add existing supply (from master list) ----------
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

//   // ---------- Create brand‑new supply ----------
//   const handleCreateSupply = async () => {
//     if (!newSupplyName.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('supply_name_required', 'Please enter a supply name')
//       );
//       return;
//     }
//     if (!newSupplyUnit.trim()) {
//       Alert.alert(
//         tSafe('required', 'Required'),
//         tSafe('unit_type_required', 'Please enter a unit type (e.g., bottle, tissue)')
//       );
//       return;
//     }
//     try {
//       const newSupply = await userService.createSupply({
//         name: newSupplyName,
//         category: tSafe('custom_category', 'Custom'),
//         unit_type: newSupplyUnit.trim(),
//         default_unit_price: 0,
//       });
//       await handleAddExistingSupply(newSupply.data._id);
//       setNewSupplyName('');
//       setNewSupplyUnit('');
//     } catch (err) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('create_supply_failed', 'Could not create supply'));
//     }
//   };

//   // ---------- Room consumption rules (CRUD) ----------
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
//       fetchRoomConsumptionRules();
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
//                 [roomType]: prev[roomType].filter(r => r._id !== ruleId),
//               }));
//             } catch (err) {
//               Alert.alert('Error', 'Could not remove rule');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ---------- Render inventory item ----------
//   const renderInventoryItem = (item) => {
//     const supplyName = item.supply?.name || tSafe('unknown_supply', 'Unknown Supply');
//     const unitType = item.supply?.unit_type || tSafe('unit', 'unit');
//     const totalUnits = item.quantity || 0;
//     const threshold = item.reorder_threshold || 0;
//     const isLow = threshold > 0 && totalUnits <= threshold;

//     let quantityDisplay = '';
//     if (totalUnits === 0) {
//       quantityDisplay = tSafe('out_of_stock', 'Out of stock');
//     } else {
//       quantityDisplay = `${totalUnits} ${unitType}${totalUnits !== 1 ? 's' : ''}`;
//     }

//     return (
//       <View key={item._id} style={styles.inventoryItem}>
//         <View style={styles.inventoryItemLeft}>
//           <MaterialCommunityIcons name="package-variant" size={32} color="#666" />
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
//             <MaterialIcons name="settings" size={20} color="#999" />
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
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.headerRow}>
//             <Text style={styles.title}>{tSafe('inventory_management', 'Inventory Management')}</Text>
//             <TouchableOpacity
//               style={styles.usageButton}
//               onPress={() => setUsageModalVisible(true)}
//             >
//               <MaterialCommunityIcons name="package-variant-closed" size={20} color={"#555"} />
//               <Text style={styles.usageButtonText}>{tSafe('usage', 'Usage')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Property Info Card */}
//         {propertyInfo && (
//           <View style={styles.propertyCard}>
//             {/* Header with property name and type badge */}
//             <View style={styles.propertyCardHeader}>
//               <View style={styles.propertyNameContainer}>
//                 <MaterialCommunityIcons name="home" size={22} color={COLORS.gray} />
//                 <Text style={styles.propertyName}>{propertyInfo.apt_name || 'Property'}</Text>
//               </View>
//               <View style={styles.propertyTypeBadge}>
//                 <Text style={styles.propertyTypeText}>
//                   {propertyInfo.apt_type === 'house' ? '🏠 House' : '🏢 Apartment'}
//                 </Text>
//               </View>
//             </View>

//             {/* Address */}
//             <View style={styles.addressRow}>
//               <MaterialIcons name="location-on" size={16} color="#888" />
//               <Text style={styles.addressText}>
//                 {propertyInfo.address || tSafe('no_address', 'No address')}
//               </Text>
//             </View>

//             {/* Room stats as chips */}
//             <View style={styles.roomStatsContainer}>
//               {(() => {
//                 const rooms = propertyInfo.roomDetails || [];
//                 const bedrooms = rooms.filter(r => r.type === 'Bedroom').reduce((sum, r) => sum + (r.number || 0), 0);
//                 const bathrooms = rooms.filter(r => r.type === 'Bathroom').reduce((sum, r) => sum + (r.number || 0), 0);
//                 const livingrooms = rooms.filter(r => r.type === 'Livingroom').reduce((sum, r) => sum + (r.number || 0), 0);
//                 const kitchens = rooms.filter(r => r.type === 'Kitchen').reduce((sum, r) => sum + (r.number || 0), 0);

//                 const stats = [
//                   { icon: 'bed-king-outline', label: 'Bedroom', count: bedrooms },
//                   { icon: 'shower-head', label: 'Bathroom', count: bathrooms },
//                   { icon: 'sofa-outline', label: 'Livingroom', count: livingrooms },
//                   { icon: 'fridge-outline', label: 'Kitchen', count: kitchens },
//                 ];

//                 return stats.map((stat, index) => (
//                   stat.count > 0 && (
//                     <View key={index} style={styles.roomChip}>
//                       <MaterialCommunityIcons name={stat.icon} size={16} color="#555" />
//                       <Text style={styles.roomChipText}>{stat.count} {stat.label}</Text>
//                     </View>
//                   )
//                 ));
//               })()}
//             </View>
//           </View>
//         )}

//         {/* Inventory List */}
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

//       {/* ---------- Restock Modal ---------- */}
//       <Modal visible={restockModal.visible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{tSafe('restock_supply', 'Restock Supply')}</Text>
//             <Text style={styles.modalSupplyName}>
//               {restockModal.supply?.supply?.name || tSafe('supply', 'Supply')}
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder={tSafe('quantity', 'Quantity (e.g., 2.5)')}
//               keyboardType="decimal-pad"
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

//       {/* ---------- Add Supply Modal ---------- */}
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
//               placeholder={tSafe('unit_type_placeholder', 'Unit type (e.g., bottle, tissue)')}
//               value={newSupplyUnit}
//               onChangeText={setNewSupplyUnit}
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

//       {/* ---------- Consumption Rule Modal ---------- */}
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
//               placeholder={tSafe('consumption_quantity_placeholder', 'Quantity (e.g., 0.5)')}
//               placeholderTextColor={COLORS.gray}
//               keyboardType="decimal-pad"
//               value={consumptionQuantity}
//               onChangeText={setConsumptionQuantity}
//             />
//             <Text style={styles.consumptionHelperText}>
//               {tSafe('consumption_helper_1', 'Example: 0.5 = half a bottle, 2 = two full bottles')}
//             </Text>

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

//       {/* ---------- Usage Modal ---------- */}
//       <Modal visible={usageModalVisible} transparent animationType="slide">
//         <View style={styles.fullModalOverlay}>
//           <View style={styles.fullModalContent}>
//             {/* Header */}
//             <View style={styles.fullModalHeader}>
//               <Text style={styles.fullModalTitle}>{tSafe('room_consumption', 'Room Supply Usage')}</Text>
//               <TouchableOpacity onPress={() => setUsageModalVisible(false)}>
//                 <MaterialIcons name="close" size={28} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.fullModalSubtitle}>
//               {tSafe('room_consumption_desc', 'Define which supplies are used each time a room is cleaned – we\'ll track consumption automatically.')}
//             </Text>

//             <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
//               {['Bedroom', 'Bathroom', 'Kitchen', 'Livingroom'].map(roomType => {
//                 const rules = roomConsumptionRules[roomType] || [];
//                 const roomIcon = {
//                   Bedroom: 'bed-king-outline',
//                   Bathroom: 'shower-head',
//                   Kitchen: 'fridge-outline',
//                   Livingroom: 'sofa-outline',
//                 }[roomType];

//                 return (
//                   <View key={roomType} style={styles.roomSection}>
//                     <View style={styles.roomSectionHeader}>
//                       <MaterialCommunityIcons name={roomIcon} size={20} color="#555" />
//                       <Text style={styles.roomSectionTitle}>{tSafe(roomType.toLowerCase(), roomType)}</Text>
//                       <TouchableOpacity
//                         style={styles.addSupplyChip}
//                         onPress={() => {
//                           setSelectedRoomType(roomType);
//                           setConsumptionModalVisible(true);
//                         }}
//                       >
//                         <MaterialIcons name="add" size={14} color={COLORS.primary} />
//                         <Text style={styles.addSupplyChipText}>{tSafe('add_supply', 'Add')}</Text>
//                       </TouchableOpacity>
//                     </View>

//                     {rules.length === 0 ? (
//                       <View style={styles.emptySupplyState}>
//                         <MaterialCommunityIcons name="clipboard-plus-outline" size={24} color="#ccc" />
//                         <Text style={styles.emptySupplyText}>No supplies defined</Text>
//                         <Text style={styles.emptySupplySubtext}>Tap + to add</Text>
//                       </View>
//                     ) : (
//                       <View style={styles.supplyChipContainer}>
//                         {rules.map(rule => {
//                           const supply = supplyList.find(s => s._id === rule.supply_id);
//                           const qty = rule.quantity;
//                           const unitType = supply?.unit_type || 'unit';
//                           const displayQty = `${qty} ${unitType}${qty !== 1 ? 's' : ''}`;

//                           return (
//                             <View key={rule._id} style={styles.supplyChip}>
//                               <MaterialCommunityIcons name="package-variant" size={14} color="#666" />
//                               <Text style={styles.supplyChipText}>
//                                 {supply?.name || 'Unknown'} × {displayQty}
//                               </Text>
//                               <TouchableOpacity onPress={() => deleteRoomConsumptionRule(roomType, rule._id)}>
//                                 <MaterialIcons name="close" size={16} color="#999" />
//                               </TouchableOpacity>
//                             </View>
//                           );
//                         })}
//                       </View>
//                     )}
//                   </View>
//                 );
//               })}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FC' },
//   content: { padding: 16, paddingBottom: 80 },
//   header: { marginBottom: 16 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   title: { fontSize: 20, fontWeight: '700', color: '#1E1E2F' },
//   usageButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   usageButtonText: { fontSize: 14, fontWeight: '500', color: '#555', marginLeft: 6 },

//   // Property Card
//   propertyCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//   },
//   propertyCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   propertyNameContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   propertyTypeBadge: {
//     backgroundColor: '#F2F4F8',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   propertyTypeText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#666',
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   addressText: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//     flex: 1,
//   },
//   roomStatsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   roomChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F2F4F8',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     gap: 4,
//   },
//   roomChipText: {
//     fontSize: 13,
//     color: '#444',
//     fontWeight: '500',
//   },

//   // Inventory Items
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

//   // Empty State
//   emptyState: { alignItems: 'center', marginTop: 40 },
//   emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#666' },
//   emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },

//   // FAB
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

//   // Modals Overlay
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
//   modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
//   consumptionHelperText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: -8,
//     marginBottom: 16,
//   },

//   // Add Supply Modal
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

//   // Full Usage Modal
//   fullModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'flex-end',
//   },
//   fullModalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     paddingBottom: 40,
//     maxHeight: '90%',
//     minHeight: '70%',
//   },
//   fullModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   fullModalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   fullModalSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   fullModalBody: {
//     flex: 1,
//   },

//   // Room Sections (inside modal)
//   roomSection: {
//     marginBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     paddingBottom: 16,
//   },
//   roomSectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     flex: 1,
//     marginLeft: 8,
//   },
//   addSupplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F2F2F7',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   addSupplyChipText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   supplyChipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   supplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FC',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     gap: 6,
//   },
//   supplyChipText: {
//     fontSize: 13,
//     color: '#1E1E2F',
//   },
//   emptySupplyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//   },
//   emptySupplyText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptySupplySubtext: {
//     fontSize: 12,
//     color: '#bbb',
//   },
// });



import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';

import {
  AppText,
  AppCard,
  AppButton,
  AppInput,
  AppSection,
} from '../../ui';

import { useTheme } from '../../theme';

import userService from '../../services/connection/userService';

import { tSafe } from '../../utils/tSafe';

import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

const ROOM_TYPES = [
  {
    key: 'Bedroom',
    icon: 'bed-king-outline',
  },
  {
    key: 'Bathroom',
    icon: 'shower-head',
  },
  {
    key: 'Kitchen',
    icon: 'fridge-outline',
  },
  {
    key: 'Livingroom',
    icon: 'sofa-outline',
  },
];

const EMPTY_RESTOCK = {
  visible: false,
  supply: null,
  quantity: '',
};

const formatQuantity = (quantity) => {
  const number = Number(quantity);

  if (!Number.isFinite(number)) {
    return '0';
  }

  return Number.isInteger(number)
    ? String(number)
    : String(Number(number.toFixed(3)));
};

const getSupplyId = (item) =>
  item?.supply_id ||
  item?.supply?._id ||
  item?._id ||
  null;

export default function InventoryManagement({
  route,
  navigation,
}) {
  const propertyId = route?.params?.propertyId;

  const { theme } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------

  const [inventory, setInventory] = useState([]);
  const [supplyList, setSupplyList] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [restockModal, setRestockModal] =
    useState(EMPTY_RESTOCK);

  const [addModalVisible, setAddModalVisible] =
    useState(false);

  const [newSupplyName, setNewSupplyName] =
    useState('');

  const [newSupplyUnit, setNewSupplyUnit] =
    useState('');

  const [roomConsumptionRules, setRoomConsumptionRules] =
    useState({});

  const [
    consumptionModalVisible,
    setConsumptionModalVisible,
  ] = useState(false);

  const [selectedRoomType, setSelectedRoomType] =
    useState('');

  const [consumptionSupplyId, setConsumptionSupplyId] =
    useState('');

  const [consumptionQuantity, setConsumptionQuantity] =
    useState('1');

  const [usageModalVisible, setUsageModalVisible] =
    useState(false);

  const [savingRestock, setSavingRestock] =
    useState(false);

  const [savingSupply, setSavingSupply] =
    useState(false);

  const [savingRule, setSavingRule] =
    useState(false);

  const [busySupplyId, setBusySupplyId] =
    useState(null);

  const [busyRuleId, setBusyRuleId] =
    useState(null);

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  const showError = useCallback(
    (message) => {
      Alert.alert(
        tSafe('error', 'Error'),
        message
      );
    },
    []
  );

  const closeRestockModal = useCallback(() => {
    if (savingRestock) {
      return;
    }

    setRestockModal(EMPTY_RESTOCK);
  }, [savingRestock]);

  const closeAddModal = useCallback(() => {
    if (savingSupply || busySupplyId) {
      return;
    }

    setAddModalVisible(false);
  }, [savingSupply, busySupplyId]);

  const getRoomLabel = useCallback(
    (roomType) =>
      tSafe(
        String(roomType || '').toLowerCase(),
        roomType || ''
      ),
    []
  );

  // ---------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------

  const fetchInventory = useCallback(async () => {
    const response =
      await userService.getPropertyInventory(propertyId);

    setInventory(
      Array.isArray(response?.data)
        ? response.data
        : []
    );
  }, [propertyId]);

  const fetchSupplies = useCallback(async () => {
    const response =
      await userService.getAllSupplies();

    setSupplyList(
      Array.isArray(response?.data)
        ? response.data
        : []
    );
  }, []);

  const fetchPropertyDetails = useCallback(async () => {
    const response =
      await userService.getApartmentById(propertyId);

    setPropertyInfo(response?.data || null);
  }, [propertyId]);

  const fetchRoomConsumptionRules =
    useCallback(async () => {
      const response =
        await userService.getRoomConsumptionRules(propertyId);

      const rules = {};

      const responseRules = Array.isArray(response?.data)
        ? response.data
        : [];

      responseRules.forEach((rule) => {
        if (!rule?.room_type) {
          return;
        }

        if (!rules[rule.room_type]) {
          rules[rule.room_type] = [];
        }

        rules[rule.room_type].push(rule);
      });

      setRoomConsumptionRules(rules);
    }, [propertyId]);

  const loadData = useCallback(
    async ({ showLoader = false } = {}) => {
      if (!propertyId) {
        setLoading(false);

        showError(
          tSafe(
            'property_id_missing',
            'Property information is missing.'
          )
        );

        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      try {
        const results = await Promise.allSettled([
          fetchInventory(),
          fetchSupplies(),
          fetchRoomConsumptionRules(),
          fetchPropertyDetails(),
        ]);

        const inventoryFailed =
          results[0].status === 'rejected';

        if (inventoryFailed) {
          console.error(
            'Failed to load inventory',
            results[0].reason
          );

          showError(
            tSafe(
              'inventory_load_failed',
              'Could not load inventory.'
            )
          );
        }

        if (results[1].status === 'rejected') {
          console.error(
            'Failed to load supplies',
            results[1].reason
          );
        }

        if (results[2].status === 'rejected') {
          console.error(
            'Failed to load room consumption rules',
            results[2].reason
          );
        }

        if (results[3].status === 'rejected') {
          console.error(
            'Failed to load property details',
            results[3].reason
          );
        }
      } catch (error) {
        console.error(
          'Unexpected inventory loading error',
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [
      propertyId,
      fetchInventory,
      fetchSupplies,
      fetchRoomConsumptionRules,
      fetchPropertyDetails,
      showError,
    ]
  );

  // Refresh when the screen gains focus.
  // This replaces the previous duplicate useEffect + useFocusEffect.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refreshScreenData = async () => {
        if (!active) {
          return;
        }

        await loadData({
          showLoader: inventory.length === 0,
        });
      };

      refreshScreenData();

      return () => {
        active = false;
      };
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // ---------------------------------------------------------
  // Restock inventory
  // ---------------------------------------------------------

  const handleRestock = useCallback(async () => {
    const { supply, quantity } = restockModal;

    const qty = Number(quantity);

    if (
      !quantity.trim() ||
      !Number.isFinite(qty) ||
      qty <= 0
    ) {
      Alert.alert(
        tSafe('invalid_quantity', 'Invalid Quantity'),
        tSafe(
          'positive_required',
          'Please enter a positive number.'
        )
      );

      return;
    }

    const supplyId = getSupplyId(supply);

    if (!supplyId) {
      showError(
        tSafe(
          'invalid_supply_id',
          'Invalid supply data. The supply ID is missing.'
        )
      );

      return;
    }

    setSavingRestock(true);

    try {
      await userService.restockSupply(
        propertyId,
        supplyId,
        qty
      );

      const unitType =
        supply?.supply?.unit_type ||
        tSafe('unit', 'unit');

      const addedText =
        `${formatQuantity(qty)} ${unitType}` +
        `${qty !== 1 ? 's' : ''}`;

      setRestockModal(EMPTY_RESTOCK);

      Alert.alert(
        tSafe('success', 'Success'),
        tSafe(
          'restocked_message',
          'Added {quantity}',
          { quantity: addedText }
        )
      );

      await fetchInventory();
    } catch (error) {
      console.error('Restock failed', error);

      showError(
        tSafe(
          'restock_failed',
          'Failed to restock the supply.'
        )
      );
    } finally {
      setSavingRestock(false);
    }
  }, [
    restockModal,
    propertyId,
    fetchInventory,
    showError,
  ]);

  // ---------------------------------------------------------
  // Reorder threshold
  // ---------------------------------------------------------

  const handleSetThreshold = useCallback(
    (supply) => {
      const currentThreshold =
        supply?.reorder_threshold != null
          ? String(supply.reorder_threshold)
          : '0';

      const supplyId = getSupplyId(supply);

      if (!supplyId) {
        showError(
          tSafe(
            'invalid_supply_id',
            'Invalid supply data.'
          )
        );

        return;
      }

      // Alert.prompt is supported on iOS, not Android.
      // Use a custom modal on Android instead.
      if (Platform.OS !== 'ios') {
        Alert.alert(
          tSafe(
            'threshold_prompt_title',
            'Reorder Threshold'
          ),
          tSafe(
            'threshold_prompt',
            'Enter the quantity that triggers a reorder alert.'
          ),
          [
            {
              text: tSafe('cancel', 'Cancel'),
              style: 'cancel',
            },
            {
              text: tSafe('ok', 'OK'),
              onPress: () => {
                Alert.alert(
                  tSafe(
                    'threshold_android_note',
                    'Use the inventory settings to update the reorder threshold.'
                  )
                );
              },
            },
          ]
        );

        return;
      }

      Alert.prompt(
        tSafe(
          'set_reorder_threshold',
          'Reorder Threshold'
        ),
        tSafe(
          'threshold_prompt',
          'Enter the quantity that triggers a reorder alert.'
        ),
        [
          {
            text: tSafe('cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: tSafe('set', 'Set'),
            onPress: async (value) => {
              const threshold = Number(value);

              if (
                value == null ||
                String(value).trim() === '' ||
                !Number.isFinite(threshold) ||
                threshold < 0
              ) {
                Alert.alert(
                  tSafe('invalid_quantity', 'Invalid Quantity'),
                  tSafe(
                    'threshold_invalid',
                    'Enter a valid non-negative quantity.'
                  )
                );

                return;
              }

              try {
                await userService.updatePropertyInventory(
                  propertyId,
                  supplyId,
                  {
                    reorder_threshold: threshold,
                  }
                );

                await fetchInventory();

                Alert.alert(
                  tSafe('success', 'Success'),
                  tSafe(
                    'threshold_updated',
                    'Threshold updated.'
                  )
                );
              } catch (error) {
                console.error(
                  'Threshold update failed',
                  error
                );

                showError(
                  tSafe(
                    'threshold_update_failed',
                    'Could not update the threshold.'
                  )
                );
              }
            },
          },
        ],
        'plain-text',
        currentThreshold,
        'number-pad'
      );
    },
    [
      propertyId,
      fetchInventory,
      showError,
    ]
  );

  // ---------------------------------------------------------
  // Add existing supply
  // ---------------------------------------------------------

  const handleAddExistingSupply = useCallback(
    async (supplyId) => {
      if (!supplyId || busySupplyId) {
        return;
      }

      setBusySupplyId(supplyId);

      try {
        await userService.updatePropertyInventory(
          propertyId,
          supplyId,
          {
            quantity: 0,
            reorder_threshold: 0,
            reorder_quantity: 0,
          }
        );

        await fetchInventory();

        setAddModalVisible(false);
      } catch (error) {
        console.error(
          'Failed to add supply',
          error
        );

        showError(
          tSafe(
            'add_supply_failed',
            'Could not add supply.'
          )
        );
      } finally {
        setBusySupplyId(null);
      }
    },
    [
      propertyId,
      fetchInventory,
      busySupplyId,
      showError,
    ]
  );

  // ---------------------------------------------------------
  // Create a new supply
  // ---------------------------------------------------------

  const handleCreateSupply = useCallback(async () => {
    if (!newSupplyName.trim()) {
      Alert.alert(
        tSafe('required', 'Required'),
        tSafe(
          'supply_name_required',
          'Please enter a supply name.'
        )
      );

      return;
    }

    if (!newSupplyUnit.trim()) {
      Alert.alert(
        tSafe('required', 'Required'),
        tSafe(
          'unit_type_required',
          'Please enter a unit type, such as bottle or tissue.'
        )
      );

      return;
    }

    setSavingSupply(true);

    try {
      const response = await userService.createSupply({
        name: newSupplyName.trim(),
        category: tSafe('custom_category', 'Custom'),
        unit_type: newSupplyUnit.trim(),
        default_unit_price: 0,
      });

      const createdSupplyId = response?.data?._id;

      if (!createdSupplyId) {
        throw new Error(
          'Supply creation response did not include an ID.'
        );
      }

      await userService.updatePropertyInventory(
        propertyId,
        createdSupplyId,
        {
          quantity: 0,
          reorder_threshold: 0,
          reorder_quantity: 0,
        }
      );

      setNewSupplyName('');
      setNewSupplyUnit('');

      await Promise.all([
        fetchInventory(),
        fetchSupplies(),
      ]);

      setAddModalVisible(false);

      Alert.alert(
        tSafe('success', 'Success'),
        tSafe(
          'supply_created_successfully',
          'Supply created and added to this property.'
        )
      );
    } catch (error) {
      console.error(
        'Failed to create supply',
        error
      );

      showError(
        tSafe(
          'create_supply_failed',
          'Could not create supply.'
        )
      );
    } finally {
      setSavingSupply(false);
    }
  }, [
    newSupplyName,
    newSupplyUnit,
    propertyId,
    fetchInventory,
    fetchSupplies,
    showError,
  ]);

  // ---------------------------------------------------------
  // Room consumption rules
  // ---------------------------------------------------------

  const addRoomConsumptionRule =
    useCallback(async () => {
      if (!selectedRoomType || !consumptionSupplyId) {
        Alert.alert(
          tSafe('required', 'Required'),
          tSafe(
            'select_room_and_supply',
            'Select a room and a supply.'
          )
        );

        return;
      }

      const qty = Number(consumptionQuantity);

      if (
        !consumptionQuantity.trim() ||
        !Number.isFinite(qty) ||
        qty <= 0
      ) {
        Alert.alert(
          tSafe('invalid_quantity', 'Invalid Quantity'),
          tSafe(
            'positive_required',
            'Please enter a positive number.'
          )
        );

        return;
      }

      setSavingRule(true);

      try {
        const response =
          await userService.createRoomConsumptionRule({
            property_id: propertyId,
            room_type: selectedRoomType,
            supply_id: consumptionSupplyId,
            quantity: qty,
          });

        const newRule = response?.data;

        if (newRule) {
          setRoomConsumptionRules((previous) => ({
            ...previous,
            [selectedRoomType]: [
              ...(previous[selectedRoomType] || []),
              newRule,
            ],
          }));
        }

        setConsumptionModalVisible(false);
        setConsumptionSupplyId('');
        setConsumptionQuantity('1');

        await fetchRoomConsumptionRules();

        Alert.alert(
          tSafe('success', 'Success'),
          tSafe(
            'consumption_rule_added',
            'Room consumption rule added.'
          )
        );
      } catch (error) {
        console.error(
          'Failed to add consumption rule',
          error
        );

        showError(
          tSafe(
            'consumption_rule_add_failed',
            'Could not add the consumption rule.'
          )
        );
      } finally {
        setSavingRule(false);
      }
    }, [
      selectedRoomType,
      consumptionSupplyId,
      consumptionQuantity,
      propertyId,
      fetchRoomConsumptionRules,
      showError,
    ]);

  const deleteRoomConsumptionRule = useCallback(
    (roomType, ruleId) => {
      Alert.alert(
        tSafe('remove_rule', 'Remove Rule'),
        tSafe(
          'remove_rule_confirmation',
          'Are you sure you want to remove this supply consumption rule?'
        ),
        [
          {
            text: tSafe('cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: tSafe('remove', 'Remove'),
            style: 'destructive',
            onPress: async () => {
              setBusyRuleId(ruleId);

              try {
                await userService.deleteRoomConsumptionRule(
                  ruleId
                );

                setRoomConsumptionRules((previous) => ({
                  ...previous,
                  [roomType]: (
                    previous[roomType] || []
                  ).filter(
                    (rule) => rule._id !== ruleId
                  ),
                }));
              } catch (error) {
                console.error(
                  'Failed to remove consumption rule',
                  error
                );

                showError(
                  tSafe(
                    'consumption_rule_remove_failed',
                    'Could not remove the rule.'
                  )
                );
              } finally {
                setBusyRuleId(null);
              }
            },
          },
        ]
      );
    },
    [showError]
  );

  // ---------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------

  const availableSupplies = useMemo(
    () =>
      supplyList.filter(
        (supply) =>
          !inventory.some(
            (item) =>
              String(item.supply_id) ===
              String(supply._id)
          )
      ),
    [supplyList, inventory]
  );

  const lowStockCount = useMemo(
    () =>
      inventory.filter((item) => {
        const quantity = Number(item.quantity || 0);
        const threshold = Number(
          item.reorder_threshold || 0
        );

        return threshold > 0 && quantity <= threshold;
      }).length,
    [inventory]
  );

  const outOfStockCount = useMemo(
    () =>
      inventory.filter(
        (item) => Number(item.quantity || 0) <= 0
      ).length,
    [inventory]
  );

  const roomStats = ROOM_TYPES.map((room) => {

    const roomDetail = (propertyInfo?.roomDetails || []).find(
  
      (detail) => detail.type === room.key
  
    );
  
    return {
  
      ...room,
  
      count: Number(roomDetail?.number ?? 0),
  
    };
  
  });

//   const roomStats = useMemo(() => {
//     const rooms = propertyInfo?.roomDetails || [];

//     console.log(rooms)

//     return [
//       {
//         key: 'Bedroom',
//         icon: 'bed-king-outline',
//         count: rooms
//           .filter((room) => room.type === 'Bedroom')
//           .reduce(
//             (total, room) =>
//               total + Number(room.number || 0),
//             0
//           ),
//       },
//       {
//         key: 'Bathroom',
//         icon: 'shower-head',
//         count: rooms
//           .filter((room) => room.type === 'Bathroom')
//           .reduce(
//             (total, room) =>
//               total + Number(room.number || 0),
//             0
//           ),
//       },
//       {
//         key: 'Livingroom',
//         icon: 'sofa-outline',
//         count: rooms
//           .filter((room) => room.type === 'Livingroom')
//           .reduce(
//             (total, room) =>
//               total + Number(room.number || 0),
//             0
//           ),
//       },
//       {
//         key: 'Kitchen',
//         icon: 'fridge-outline',
//         count: rooms
//           .filter((room) => room.type === 'Kitchen')
//           .reduce(
//             (total, room) =>
//               total + Number(room.number || 0),
//             0
//           ),
//       },
//     ],
//     [propertyInfo]
// });

  // ---------------------------------------------------------
  // Render inventory item
  // ---------------------------------------------------------

  const renderInventoryItem = useCallback(
    (item) => {
      const supplyName =
        item.supply?.name ||
        tSafe('unknown_supply', 'Unknown Supply');

      const unitType =
        item.supply?.unit_type ||
        tSafe('unit', 'unit');

      const quantity = Number(item.quantity || 0);

      const threshold = Number(
        item.reorder_threshold || 0
      );

      const isLow =
        threshold > 0 && quantity <= threshold;

      const isOutOfStock = quantity <= 0;

      const quantityDisplay = isOutOfStock
        ? tSafe('out_of_stock', 'Out of stock')
        : `${formatQuantity(quantity)} ${unitType}${
            quantity !== 1 ? 's' : ''
          }`;

      return (
        <AppCard
          key={item._id}
          variant="default"
          padding="medium"
          radius="medium"
          bordered
          style={styles.inventoryCard}
        >
          <View style={styles.inventoryItem}>
            <View style={styles.inventoryItemLeft}>
              <View
                style={[
                  styles.supplyIconContainer,
                  isOutOfStock && styles.outOfStockIcon,
                  isLow && !isOutOfStock && styles.lowStockIcon,
                ]}
              >
                <MaterialCommunityIcons
                  name="package-variant"
                  size={25}
                  color={
                    isOutOfStock
                      ? theme.status.error
                      : isLow
                        ? theme.status.warning
                        : theme.brand.primary
                  }
                />
              </View>

              <View style={styles.inventoryItemInfo}>
                <AppText
                  variant="subtitle"
                  numberOfLines={2}
                  style={styles.itemName}
                >
                  {supplyName}
                </AppText>

                <AppText
                  variant="bodyMedium"
                  color={
                    isOutOfStock
                      ? theme.status.error
                      : theme.text.secondary
                  }
                  style={styles.itemQuantity}
                >
                  {quantityDisplay}
                </AppText>

                {isLow && (
                  <View style={styles.stockWarning}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={14}
                      color={theme.status.warning}
                    />

                    <AppText
                      variant="caption"
                      color={theme.status.warning}
                    >
                      {tSafe('low_stock', 'Low stock')}
                    </AppText>
                  </View>
                )}

                {threshold > 0 && (
                  <AppText
                    variant="caption"
                    style={styles.thresholdText}
                  >
                    {tSafe(
                      'reorder_when_below',
                      'Reorder threshold'
                    )}
                    : {formatQuantity(threshold)} {unitType}
                  </AppText>
                )}
              </View>
            </View>

            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.iconActionButton}
                onPress={() => handleSetThreshold(item)}
                accessibilityRole="button"
                accessibilityLabel={tSafe(
                  'set_reorder_threshold',
                  'Set reorder threshold'
                )}
                hitSlop={{
                  top: 8,
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={21}
                  color={theme.icon.muted}
                />
              </TouchableOpacity>

              <AppButton
                title={tSafe('restock', 'Restock')}
                variant="primary"
                size="small"
                icon="plus"
                onPress={() =>
                  setRestockModal({
                    visible: true,
                    supply: item,
                    quantity: '',
                  })
                }
                style={styles.restockButton}
              />
            </View>
          </View>
        </AppCard>
      );
    },
    [
      styles,
      theme,
      handleSetThreshold,
    ]
  );

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          barStyle={
            theme.background.default === '#0B1220'
              ? 'light-content'
              : 'dark-content'
          }
          backgroundColor={theme.background.default}
        />

        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            variant="body"
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_inventory',
              'Loading inventory...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------
  // Main screen
  // ---------------------------------------------------------

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={
          theme.background.default === '#0B1220'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={theme.background.default}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ------------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------------- */}

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <AppText variant="heading">
              {tSafe(
                'inventory_management',
                'Inventory Management'
              )}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.headerSubtitle}
            >
              {tSafe(
                'inventory_management_description',
                'Keep track of supplies and manage restocking for your property.'
              )}
            </AppText>
          </View>

          <TouchableOpacity
            style={styles.usageButton}
            onPress={() => setUsageModalVisible(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={tSafe(
              'usage',
              'Room supply usage'
            )}
          >
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={20}
              color={theme.brand.primary}
            />

            <AppText
              variant="label"
              color={theme.brand.primary}
              style={styles.usageButtonText}
            >
              {tSafe('usage', 'Usage')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ------------------------------------------------- */}
        {/* Property information */}
        {/* ------------------------------------------------- */}

        {propertyInfo && (
          <AppCard
            variant="hero"
            padding="large"
            radius="large"
            bordered={false}
            style={styles.propertyCard}
          >
            <View style={styles.propertyCardHeader}>
              <View style={styles.propertyNameContainer}>
                <View style={styles.propertyIcon}>
                  <MaterialCommunityIcons
                    name="home-outline"
                    size={23}
                    color={theme.hero.foreground}
                  />
                </View>

                <View style={styles.propertyNameContent}>
                  <AppText
                    variant="caption"
                    color={theme.hero.mutedForeground}
                  >
                    {tSafe(
                      'managing_inventory_for',
                      'Managing inventory for'
                    )}
                  </AppText>

                  <AppText
                    variant="title"
                    color={theme.hero.foreground}
                    numberOfLines={2}
                  >
                    {propertyInfo.apt_name ||
                      tSafe('property', 'Property')}
                  </AppText>
                </View>
              </View>

              <View style={styles.propertyTypeBadge}>
                <AppText
                  variant="caption"
                  color={theme.hero.foreground}
                  weight="600"
                >
                  {propertyInfo.apt_type === 'house'
                    ? tSafe('house', 'House')
                    : tSafe('apartment', 'Apartment')}
                </AppText>
              </View>
            </View>

            <View style={styles.addressRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={17}
                color={theme.hero.mutedForeground}
              />

              <AppText
                variant="body"
                color={theme.hero.mutedForeground}
                style={styles.addressText}
              >
                {propertyInfo.address ||
                  tSafe('no_address', 'No address provided')}
              </AppText>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.roomStatsSection}>
              <AppText
                variant="subtitle"
                color={theme.text.primary}
                style={styles.roomStatsTitle}
              >
                {tSafe('room_overview', 'Room Overview')}
              </AppText>

              <View style={styles.roomStatsContainer}>
                {roomStats.map((stat) => (
                  <View
                    key={stat.key}
                    style={styles.roomChip}
                  >
                    <View style={styles.roomIconContainer}>
                      <MaterialCommunityIcons
                        name={stat.icon}
                        size={22}
                        color={theme.brand.primary}
                      />
                    </View>

                    <View style={styles.roomStatText}>
                      <AppText
                        variant="bodyMedium"
                        color={theme.text.primary}
                        weight="600"
                      >
                        {stat.count}
                      </AppText>

                      <AppText
                        variant="caption"
                        color={theme.text.secondary}
                      >
                        {getRoomLabel(stat.key)}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </AppCard>
        )}

        {/* ------------------------------------------------- */}
        {/* Inventory summary */}
        {/* ------------------------------------------------- */}

        <View style={styles.summaryGrid}>
          <AppCard
            padding="medium"
            radius="medium"
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                styles.summaryIconBlue,
              ]}
            >
              <MaterialCommunityIcons
                name="package-variant"
                size={21}
                color={theme.brand.primary}
              />
            </View>

            <AppText
              variant="display"
              style={styles.summaryNumber}
            >
              {inventory.length}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
            >
              {tSafe('total_supplies', 'Inventory items')}
            </AppText>
          </AppCard>

          <AppCard
            padding="medium"
            radius="medium"
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                styles.summaryIconWarning,
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={21}
                color={theme.status.warning}
              />
            </View>

            <AppText
              variant="display"
              style={styles.summaryNumber}
            >
              {lowStockCount}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
            >
              {tSafe('low_stock', 'Low stock')}
            </AppText>
          </AppCard>

          <AppCard
            padding="medium"
            radius="medium"
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                styles.summaryIconError,
              ]}
            >
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={21}
                color={theme.status.error}
              />
            </View>

            <AppText
              variant="display"
              style={styles.summaryNumber}
            >
              {outOfStockCount}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
            >
              {tSafe('out_of_stock', 'Out of stock')}
            </AppText>
          </AppCard>
        </View>

        {/* ------------------------------------------------- */}
        {/* Inventory list */}
        {/* ------------------------------------------------- */}

        <AppSection
          title={tSafe(
            'your_inventory',
            'Your Inventory'
          )}
          subtitle={tSafe(
            'your_inventory_description',
            'Review available supplies and restock when needed.'
          )}
          actionLabel={tSafe('add_supply', 'Add supply')}
          onAction={() => setAddModalVisible(true)}
          style={styles.inventorySection}
        >
          {inventory.length === 0 ? (
            <AppCard
              padding="large"
              radius="large"
              style={styles.emptyState}
            >
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={38}
                  color={theme.brand.primary}
                />
              </View>

              <AppText
                variant="title"
                align="center"
                style={styles.emptyText}
              >
                {tSafe(
                  'no_inventory',
                  'No inventory items yet'
                )}
              </AppText>

              <AppText
                variant="body"
                color={theme.text.secondary}
                align="center"
                style={styles.emptySubtext}
              >
                {tSafe(
                  'tap_to_add',
                  'Add supplies from the master list to start tracking your inventory.'
                )}
              </AppText>

              <AppButton
                title={tSafe(
                  'add_first_supply',
                  'Add your first supply'
                )}
                icon="plus"
                onPress={() => setAddModalVisible(true)}
                style={styles.emptyAction}
              />
            </AppCard>
          ) : (
            inventory.map(renderInventoryItem)
          )}
        </AppSection>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* --------------------------------------------------- */}
      {/* Floating action button */}
      {/* --------------------------------------------------- */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={tSafe(
          'add_supply',
          'Add supply'
        )}
        hitSlop={{
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        }}
      >
        <MaterialCommunityIcons
          name="plus"
          size={28}
          color={theme.button.primaryText}
        />
      </TouchableOpacity>

      {/* =================================================== */}
      {/* Restock modal */}
      {/* =================================================== */}

      <Modal
        visible={restockModal.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeRestockModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <AppCard
            padding="large"
            radius="large"
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingIcon}>
                <MaterialCommunityIcons
                  name="package-up"
                  size={24}
                  color={theme.brand.primary}
                />
              </View>

              <TouchableOpacity
                onPress={closeRestockModal}
                disabled={savingRestock}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={tSafe('close', 'Close')}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            <AppText
              variant="heading"
              style={styles.modalTitle}
            >
              {tSafe(
                'restock_supply',
                'Restock Supply'
              )}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.modalDescription}
            >
              {restockModal.supply?.supply?.name ||
                tSafe('supply', 'Supply')}
            </AppText>

            <AppInput
              label={tSafe('quantity', 'Quantity')}
              placeholder={tSafe(
                'quantity_example',
                'Enter quantity (e.g. 2.5)'
              )}
              keyboardType="decimal-pad"
              value={restockModal.quantity}
              onChangeText={(value) =>
                setRestockModal((previous) => ({
                  ...previous,
                  quantity: value,
                }))
              }
              leftIcon="numeric"
              containerStyle={styles.modalInputContainer}
            />

            <View style={styles.modalButtons}>
              <AppButton
                title={tSafe('cancel', 'Cancel')}
                variant="outline"
                onPress={closeRestockModal}
                disabled={savingRestock}
                style={styles.modalAction}
              />

              <AppButton
                title={tSafe('restock', 'Restock')}
                icon="package-up"
                loading={savingRestock}
                onPress={handleRestock}
                style={styles.modalAction}
              />
            </View>
          </AppCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* =================================================== */}
      {/* Add supply modal */}
      {/* =================================================== */}

      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeAddModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <AppCard
            padding="large"
            radius="large"
            style={styles.addModalContent}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingIcon}>
                <MaterialCommunityIcons
                  name="package-variant-plus"
                  size={24}
                  color={theme.brand.primary}
                />
              </View>

              <TouchableOpacity
                onPress={closeAddModal}
                disabled={savingSupply || Boolean(busySupplyId)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={tSafe('close', 'Close')}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            <AppText
              variant="heading"
              style={styles.modalTitle}
            >
              {tSafe(
                'add_supply_to_property',
                'Add Supply'
              )}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.modalDescription}
            >
              {tSafe(
                'add_supply_description',
                'Choose an existing supply or create a new one.'
              )}
            </AppText>

            <ScrollView
              style={styles.availableSupplyList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <AppSection
                title={tSafe(
                  'available_supplies',
                  'Available Supplies'
                )}
                style={styles.availableSupplySection}
              >
                {availableSupplies.length === 0 ? (
                  <View style={styles.noSuppliesState}>
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={28}
                      color={theme.status.success}
                    />

                    <AppText
                      variant="body"
                      color={theme.text.secondary}
                      align="center"
                      style={styles.noSuppliesText}
                    >
                      {tSafe(
                        'all_supplies_added',
                        'All supplies have already been added.'
                      )}
                    </AppText>
                  </View>
                ) : (
                  availableSupplies.map((supply) => {
                    const isBusy =
                      busySupplyId === supply._id;

                    return (
                      <TouchableOpacity
                        key={supply._id}
                        style={styles.addSupplyItem}
                        onPress={() =>
                          handleAddExistingSupply(
                            supply._id
                          )
                        }
                        disabled={
                          Boolean(busySupplyId) ||
                          savingSupply
                        }
                        activeOpacity={0.75}
                      >
                        <View style={styles.addSupplyIcon}>
                          <MaterialCommunityIcons
                            name="package-variant"
                            size={21}
                            color={theme.brand.primary}
                          />
                        </View>

                        <View style={styles.addSupplyInfo}>
                          <AppText
                            variant="bodyMedium"
                            numberOfLines={2}
                          >
                            {supply.name}
                          </AppText>

                          <AppText variant="caption">
                            {supply.unit_type ||
                              tSafe('unit', 'unit')}
                          </AppText>
                        </View>

                        {isBusy ? (
                          <ActivityIndicator
                            size="small"
                            color={theme.brand.primary}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="plus-circle-outline"
                            size={23}
                            color={theme.brand.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </AppSection>

              <View style={styles.sectionDivider} />

              <AppSection
                title={tSafe(
                  'or_create_new',
                  'Create a New Supply'
                )}
                subtitle={tSafe(
                  'create_supply_description',
                  'Create a reusable supply item for your inventory.'
                )}
                style={styles.createSupplySection}
              >
                <AppInput
                  label={tSafe(
                    'supply_name',
                    'Supply name'
                  )}
                  placeholder={tSafe(
                    'supply_name_placeholder',
                    'e.g. All-purpose cleaner'
                  )}
                  value={newSupplyName}
                  onChangeText={setNewSupplyName}
                  leftIcon="package-variant"
                  containerStyle={styles.modalInputContainer}
                  editable={!savingSupply}
                  returnKeyType="next"
                />

                <AppInput
                  label={tSafe(
                    'unit_type',
                    'Unit type'
                  )}
                  placeholder={tSafe(
                    'unit_type_placeholder',
                    'e.g. bottle, tissue, roll'
                  )}
                  value={newSupplyUnit}
                  onChangeText={setNewSupplyUnit}
                  leftIcon="ruler"
                  containerStyle={styles.modalInputContainer}
                  editable={!savingSupply}
                  returnKeyType="done"
                />

                <AppButton
                  title={tSafe(
                    'create_and_add',
                    'Create & Add'
                  )}
                  icon="plus-circle-outline"
                  loading={savingSupply}
                  onPress={handleCreateSupply}
                  fullWidth
                  style={styles.createSupplyButton}
                />
              </AppSection>
            </ScrollView>

            <AppButton
              title={tSafe('close', 'Close')}
              variant="outline"
              onPress={closeAddModal}
              disabled={savingSupply || Boolean(busySupplyId)}
              fullWidth
              style={styles.bottomModalButton}
            />
          </AppCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* =================================================== */}
      {/* Consumption rule modal */}
      {/* =================================================== */}

      <Modal
        visible={consumptionModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          if (!savingRule) {
            setConsumptionModalVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <AppCard
            padding="large"
            radius="large"
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingIcon}>
                <MaterialCommunityIcons
                  name="clipboard-list-outline"
                  size={24}
                  color={theme.brand.primary}
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!savingRule) {
                    setConsumptionModalVisible(false);
                  }
                }}
                disabled={savingRule}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={tSafe('close', 'Close')}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            <AppText
              variant="heading"
              style={styles.modalTitle}
            >
              {tSafe(
                'consumption_rule',
                'Consumption Rule'
              )}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.modalDescription}
            >
              {tSafe(
                'consumption_rule_description',
                'Choose the supply and quantity used when cleaning this room.'
              )}
            </AppText>

            <View style={styles.selectedRoomBanner}>
              <MaterialCommunityIcons
                name={
                  ROOM_TYPES.find(
                    (room) => room.key === selectedRoomType
                  )?.icon || 'home-outline'
                }
                size={22}
                color={theme.brand.primary}
              />

              <View style={styles.selectedRoomText}>
                <AppText variant="caption">
                  {tSafe('room_type', 'Room type')}
                </AppText>

                <AppText variant="subtitle">
                  {getRoomLabel(selectedRoomType)}
                </AppText>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <FloatingLabelPickerSelect
                label={tSafe(
                  'select_supply',
                  'Select Supply'
                )}
                value={consumptionSupplyId}
                onValueChange={setConsumptionSupplyId}
                items={supplyList.map((supply) => ({
                  label: supply.name,
                  value: supply._id,
                }))}
              />
            </View>

            <AppInput
              label={tSafe(
                'consumption_quantity',
                'Quantity per cleaning'
              )}
              placeholder={tSafe(
                'consumption_quantity_placeholder',
                'e.g. 0.5'
              )}
              keyboardType="decimal-pad"
              value={consumptionQuantity}
              onChangeText={setConsumptionQuantity}
              leftIcon="numeric"
              containerStyle={styles.modalInputContainer}
              helperText={tSafe(
                'consumption_helper_1',
                'Example: 0.5 means half a bottle; 2 means two bottles.'
              )}
            />

            <View style={styles.modalButtons}>
              <AppButton
                title={tSafe('cancel', 'Cancel')}
                variant="outline"
                onPress={() => {
                  if (!savingRule) {
                    setConsumptionModalVisible(false);
                  }
                }}
                disabled={savingRule}
                style={styles.modalAction}
              />

              <AppButton
                title={tSafe('add', 'Add Rule')}
                icon="plus"
                loading={savingRule}
                onPress={addRoomConsumptionRule}
                style={styles.modalAction}
              />
            </View>
          </AppCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* =================================================== */}
      {/* Room supply usage bottom sheet */}
      {/* =================================================== */}

      <Modal
        visible={usageModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setUsageModalVisible(false)}
      >
        <View style={styles.fullModalOverlay}>
          <SafeAreaView
            style={styles.fullModalSafeArea}
            edges={['bottom']}
          >
            <AppCard
              padding="large"
              radius="large"
              style={styles.fullModalContent}
            >
              {/* Header */}
              <View style={styles.fullModalHeader}>
                <View style={styles.fullModalHeading}>
                  <View style={styles.modalHeadingIcon}>
                    <MaterialCommunityIcons
                      name="clipboard-list-outline"
                      size={24}
                      color={theme.brand.primary}
                    />
                  </View>

                  <View style={styles.fullModalTitleContainer}>
                    <AppText variant="heading">
                      {tSafe(
                        'room_consumption',
                        'Room Supply Usage'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={styles.fullModalSubtitle}
                    >
                      {tSafe(
                        'room_consumption_desc',
                        "Define the supplies used each time a room is cleaned. We'll track consumption automatically."
                      )}
                    </AppText>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setUsageModalVisible(false)}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel={tSafe('close', 'Close')}
                  hitSlop={{
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={23}
                    color={theme.icon.default}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.fullModalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {ROOM_TYPES.map((room) => {
                  const roomType = room.key;

                  const rules =
                    roomConsumptionRules[roomType] || [];

                  return (
                    <View
                      key={roomType}
                      style={styles.roomSection}
                    >
                      <View style={styles.roomSectionHeader}>
                        <View style={styles.roomSectionIcon}>
                          <MaterialCommunityIcons
                            name={room.icon}
                            size={22}
                            color={theme.brand.primary}
                          />
                        </View>

                        <View style={styles.roomSectionInfo}>
                          <AppText variant="subtitle">
                            {getRoomLabel(roomType)}
                          </AppText>

                          <AppText variant="caption">
                            {rules.length}{' '}
                            {tSafe(
                              'configured_supplies',
                              'configured supplies'
                            )}
                          </AppText>
                        </View>

                        <TouchableOpacity
                          style={styles.addSupplyChip}
                          onPress={() => {
                            setSelectedRoomType(roomType);
                            setConsumptionSupplyId('');
                            setConsumptionQuantity('1');
                            setConsumptionModalVisible(true);
                          }}
                          activeOpacity={0.75}
                        >
                          <MaterialCommunityIcons
                            name="plus"
                            size={16}
                            color={theme.brand.primary}
                          />

                          <AppText
                            variant="label"
                            color={theme.brand.primary}
                          >
                            {tSafe('add', 'Add')}
                          </AppText>
                        </TouchableOpacity>
                      </View>

                      {rules.length === 0 ? (
                        <View style={styles.emptySupplyState}>
                          <MaterialCommunityIcons
                            name="clipboard-text-outline"
                            size={27}
                            color={theme.icon.muted}
                          />

                          <AppText
                            variant="body"
                            color={theme.text.secondary}
                            style={styles.emptySupplyText}
                          >
                            {tSafe(
                              'no_supplies_defined',
                              'No supplies defined for this room.'
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            align="center"
                          >
                            {tSafe(
                              'add_consumption_rule_hint',
                              'Add a rule to track supply usage.'
                            )}
                          </AppText>
                        </View>
                      ) : (
                        <View style={styles.supplyChipContainer}>
                          {rules.map((rule) => {
                            const supply = supplyList.find(
                              (item) =>
                                String(item._id) ===
                                String(rule.supply_id)
                            );

                            const unitType =
                              supply?.unit_type ||
                              tSafe('unit', 'unit');

                            const quantity =
                              Number(rule.quantity || 0);

                            const isDeleting =
                              busyRuleId === rule._id;

                            return (
                              <View
                                key={rule._id}
                                style={styles.supplyChip}
                              >
                                <MaterialCommunityIcons
                                  name="package-variant"
                                  size={17}
                                  color={theme.brand.primary}
                                />

                                <View style={styles.supplyChipInfo}>
                                  <AppText
                                    variant="label"
                                    numberOfLines={2}
                                  >
                                    {supply?.name ||
                                      tSafe(
                                        'unknown_supply',
                                        'Unknown Supply'
                                      )}
                                  </AppText>

                                  <AppText variant="caption">
                                    {formatQuantity(quantity)}{' '}
                                    {unitType}
                                    {quantity !== 1 ? 's' : ''}
                                  </AppText>
                                </View>

                                <TouchableOpacity
                                  onPress={() =>
                                    deleteRoomConsumptionRule(
                                      roomType,
                                      rule._id
                                    )
                                  }
                                  disabled={
                                    Boolean(busyRuleId)
                                  }
                                  style={styles.deleteRuleButton}
                                  accessibilityRole="button"
                                  accessibilityLabel={tSafe(
                                    'remove_rule',
                                    'Remove rule'
                                  )}
                                  hitSlop={{
                                    top: 8,
                                    bottom: 8,
                                    left: 8,
                                    right: 8,
                                  }}
                                >
                                  {isDeleting ? (
                                    <ActivityIndicator
                                      size="small"
                                      color={theme.status.error}
                                    />
                                  ) : (
                                    <MaterialCommunityIcons
                                      name="trash-can-outline"
                                      size={19}
                                      color={theme.status.error}
                                    />
                                  )}
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <AppButton
                title={tSafe('done', 'Done')}
                onPress={() => setUsageModalVisible(false)}
                fullWidth
                style={styles.doneButton}
              />
            </AppCard>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ===========================================================
// Theme-aware styles
// ===========================================================

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 110,
    },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.default,
    },

    loadingText: {
      marginTop: 14,
    },

    // Header

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 22,
      gap: 12,
    },

    headerTextContainer: {
      flex: 1,
    },

    headerSubtitle: {
      marginTop: 6,
      lineHeight: 21,
    },

    usageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      minHeight: 42,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.default,
    },

    usageButtonText: {
      marginLeft: 0,
    },

    // Property card

    propertyCard: {
      marginBottom: 20,
    },

    propertyCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },

    propertyNameContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    propertyIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.hero.orb,
      alignItems: 'center',
      justifyContent: 'center',
    },

    propertyNameContent: {
      flex: 1,
      gap: 4,
    },

    propertyTypeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: theme.hero.orbSecondary,
      borderWidth: 1,
      borderColor: theme.hero.progressTrack,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginTop: 18,
    },

    addressText: {
      flex: 1,
      lineHeight: 20,
    },

    heroDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.hero.progressTrack,
      marginVertical: 8,
    },

    roomStatsTitle: {
      marginBottom: 12,
    },

    roomStatsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    roomChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.hero.orbSecondary,
      borderWidth: 1,
      borderColor: theme.hero.progressTrack,
    },

    // Summary cards

    summaryGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 28,
    },

    summaryCard: {
      flex: 1,
      minWidth: 0,
      padding: 12,
    },

    summaryIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    summaryIconBlue: {
      backgroundColor: theme.brand.primaryLight,
    },

    summaryIconWarning: {
      backgroundColor:
        theme.status.warning + '20',
    },

    summaryIconError: {
      backgroundColor:
        theme.status.error + '20',
    },

    summaryNumber: {
      fontSize: 25,
      lineHeight: 31,
      marginBottom: 3,
    },

    // Inventory list

    inventorySection: {
      marginBottom: 12,
    },

    inventoryCard: {
      marginBottom: 12,
    },

    inventoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    inventoryItemLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      minWidth: 0,
    },

    supplyIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
    },

    outOfStockIcon: {
      backgroundColor:
        theme.status.error + '20',
    },

    lowStockIcon: {
      backgroundColor:
        theme.status.warning + '20',
    },

    inventoryItemInfo: {
      flex: 1,
      minWidth: 0,
    },

    itemName: {
      marginBottom: 4,
    },

    itemQuantity: {
      marginTop: 1,
    },

    stockWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
    },

    thresholdText: {
      marginTop: 6,
      lineHeight: 17,
    },

    itemActions: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },

    iconActionButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    restockButton: {
      paddingHorizontal: 12,
    },

    // Empty state

    emptyState: {
      alignItems: 'center',
      paddingVertical: 30,
    },

    emptyIconContainer: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },

    emptyText: {
      marginBottom: 8,
    },

    emptySubtext: {
      maxWidth: 280,
      lineHeight: 22,
    },

    emptyAction: {
      marginTop: 20,
    },

    bottomSpacing: {
      height: 24,
    },

    // Floating action button

    fab: {
      position: 'absolute',
      right: 22,
      bottom: 26,
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.primaryBackground,
      borderWidth: 1,
      borderColor: theme.border.default,
      elevation: 7,
      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
    },

    // Standard modal

    modalOverlay: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 24,
      backgroundColor: theme.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalContent: {
      width: '100%',
      maxWidth: 520,
      maxHeight: '88%',
      backgroundColor: theme.surface.elevated,
      borderColor: theme.border.default,
      overflow: 'hidden',
    },

    modalHeader: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },

    modalHeadingIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
    },

    closeButton: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    modalTitle: {
      marginBottom: 8,
    },

    modalDescription: {
      lineHeight: 21,
      marginBottom: 22,
    },

    modalInputContainer: {
      marginBottom: 16,
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 10,
    },

    modalAction: {
      flex: 1,
    },

    // Add supply modal

    addModalContent: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '92%',
      backgroundColor: theme.surface.elevated,
      borderColor: theme.border.default,
      overflow: 'hidden',
    },

    availableSupplyList: {
      flexGrow: 0,
      flexShrink: 1,
    },

    availableSupplySection: {
      marginBottom: 6,
    },

    addSupplyItem: {
      minHeight: 66,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
    },

    addSupplyIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
    },

    addSupplyInfo: {
      flex: 1,
      gap: 3,
    },

    noSuppliesState: {
      alignItems: 'center',
      paddingVertical: 20,
      gap: 10,
    },

    noSuppliesText: {
      maxWidth: 260,
      lineHeight: 21,
    },

    sectionDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 22,
    },

    createSupplySection: {
      marginBottom: 12,
    },

    createSupplyButton: {
      marginTop: 4,
    },

    bottomModalButton: {
      marginTop: 12,
    },

    // Consumption rule modal

    selectedRoomBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: theme.surface.selected,
      marginBottom: 20,
    },

    selectedRoomText: {
      flex: 1,
      gap: 3,
    },

    pickerContainer: {
      marginBottom: 18,
    },

    // Usage bottom sheet

    fullModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.overlay,
    },

    fullModalSafeArea: {
      width: '100%',
      maxHeight: '94%',
    },

    fullModalContent: {
      width: '100%',
      maxHeight: '100%',
      minHeight: '70%',
      paddingBottom: 18,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      backgroundColor: theme.surface.elevated,
      borderColor: theme.border.default,
    },

    fullModalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 18,
    },

    fullModalHeading: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },

    fullModalTitleContainer: {
      flex: 1,
      gap: 6,
    },

    fullModalSubtitle: {
      lineHeight: 19,
    },

    fullModalBody: {
      flex: 1,
    },

    roomSection: {
      paddingBottom: 20,
      marginBottom: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
    },

    roomSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    },

    roomSectionIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
    },

    roomSectionInfo: {
      flex: 1,
      gap: 3,
    },

    addSupplyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.selected,
    },

    emptySupplyState: {
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 22,
      borderRadius: 16,
      backgroundColor: theme.background.sunken,
      gap: 8,
    },

    emptySupplyText: {
      textAlign: 'center',
    },

    supplyChipContainer: {
      gap: 10,
    },

    supplyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.default,
    },

    supplyChipInfo: {
      flex: 1,
      gap: 4,
    },

    deleteRuleButton: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.sunken,
    },

    doneButton: {
      marginTop: 16,
    },


    roomStatsSection: {
      width: '100%',
      marginTop: 16,
      marginBottom: 16,
    },
    
    roomStatsTitle: {
      marginBottom: 12,
    },
    
    roomStatsContainer: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    
    roomChip: {
      flexDirection: 'row',
      alignItems: 'center',
      flexBasis: '47%',
      flexGrow: 1,
      minWidth: 130,
      padding: 12,
      borderRadius: 14,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },
    
    roomIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
    },
    
    roomStatText: {
      flex: 1,
      marginLeft: 10,
    },
  });