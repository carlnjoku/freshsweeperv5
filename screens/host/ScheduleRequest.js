import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, FlatList, ScrollView, Modal, View, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Button } from 'react-native-paper';
import userService from '../../services/connection/userService';
import { useCleanerSelection } from '../../context/CleanerSelectionContext';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import ROUTES from '../../constants/routes';
import CleanerCard from '../../components/cleaner/CleanerCard';
import COLORS from '../../constants/colors';

import CompareCleanerModal from '../../components/host/CompareCleanerModal';
import CleanerSelectionModal from '../../components/host/CleanerSelectionModal';
import { tSafe } from '../../utils/tSafe'; // added import

export default function ScheduleRequest() {
  const route = useRoute();
  const { scheduleId, requestId } = route?.params;
 
  const navigation = useNavigation();
  const { currentUserId } = useContext(AuthContext);

  // Add removeCleaner to destructuring
  const { selectedCleaners, addCleaner, removeCleaner, clearSelectedCleaners } = useCleanerSelection();

  const scrollRef = useRef(null);
  const payButtonRef = useRef(null);
  const flatListRef = useRef(null);

  const [cleaning_request, setCleaningRequests] = useState([]);
  const [pending_payment, setFilteredPendingPayment] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [expectedCleaners, setExpectedCleaners] = useState(0);
  const [assignedTo, setAssignedTo] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [allCleaners, setAllCleaners] = useState([]);
  const [groupedCleaners, setGroupedCleaners] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [newCleanerCandidate, setNewCleanerCandidate] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Track when data is ready

  const shouldShowPayButton = selectedCleaners.length === expectedCleaners;
  const selectedCleanerIds = selectedCleaners.map(c => c._id);
  
  const unselectedCleaners = pending_payment.filter(
    request => !selectedCleanerIds.includes(request.cleaner._id)
  );

  console.log('📦 route.params:', route.params);
  
  // fetch host request
  const fetchHostRequest = async () => {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
      const response = await userService.getHostCleaningRequestByScheduleId(scheduleId, currentTime);
      const res = response.data;
      // console.log(res)
      // console.log('✅ Fetched host request assignedTo:', res[0]?.schedule?.assignedTo);
      setAssignedTo(res[0].schedule.assignedTo);
      setExpectedCleaners(res[0].schedule.assignedTo?.length || 0);
      setSchedule(res[0].schedule.schedule);
      // const availableCleaners = res.filter(req => req.status === 'pending_payment');
      const availableCleaners = res.filter(req => req.status === 'accepted');
      setFilteredPendingPayment(availableCleaners);
      setCleaningRequests(res.filter(req => req.status === 'pending_acceptance'));
    } catch (e) {
      console.log('❌ Error fetching host request:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHostRequest();
    }, [scheduleId])
  );

  useEffect(() => {
    if (shouldShowPayButton && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [shouldShowPayButton]);

  // fetch all cleaners
  useEffect(() => {
    const fetchCleaners = async () => {
      try {
        const response = await userService.acceptedCleaners(scheduleId);
        const res = response.data.data;
        // console.log('✅ Fetched grouped cleaners:', res);
        
        setGroupedCleaners(res);
        
        const formatted = res.flatMap(group =>
          group.cleaners.map(cleaner => ({
            _id: cleaner._id,
            avatar: cleaner.avatar,
            name: `${cleaner.firstname} ${cleaner.lastname}`,
            group: group.group || 'group_1',
            fee: cleaner.cleaning_fee || group.group_cleaning_fee || 0,
            firstname: cleaner.firstname,
            lastname: cleaner.lastname,
            cleaning_fee: cleaner.cleaning_fee || group.group_cleaning_fee || 0,
          }))
        );
        setAllCleaners(formatted);
      } catch (err) {
        console.error('❌ Error fetching cleaners:', err);
      }
    };
    
    if (scheduleId) {
      fetchCleaners();
    }
  }, [scheduleId]);

  // build groupData - SIMPLIFIED AND FIXED VERSION
  useEffect(() => {
    // console.log('🔄 Building groupData with:', { 
    //   assignedTo: assignedTo, 
    //   groupedCleaners: groupedCleaners,
    //   selectedCleaners: selectedCleaners 
    // });
    
    // Reset data loaded state
    setDataLoaded(false);
    
    if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      console.log('❌ No assignedTo data available');
      setGroupData([]);
      return;
    }
    
    if (!groupedCleaners || !Array.isArray(groupedCleaners) || groupedCleaners.length === 0) {
      console.log('❌ No groupedCleaners data available');
      setGroupData([]);
      return;
    }

    try {
      const groups = assignedTo.map(assignedGroup => {
        if (!assignedGroup || !assignedGroup.group) {
          // console.log('❌ Invalid assignedGroup:', assignedGroup);
          return null;
        }

        console.log(`🔍 Processing group: ${assignedGroup.group}`);
        
        // Find the corresponding group from database structure
        const dbGroup = groupedCleaners.find(g => g.group === assignedGroup.group);
        // console.log(`📊 Found dbGroup for ${assignedGroup.group}:`, dbGroup);
        
        if (!dbGroup) {
          // console.log(`❌ No dbGroup found for ${assignedGroup.group}`);
          return {
            group: assignedGroup.group,
            selectedCleaner: null,
            availableCleaners: [],
            replaceMode: false,
            groupFee: 0,
          };
        }

        // Get selected cleaner for this group
        // Check if assignedGroup has a cleanerId that matches any cleaner in selectedCleaners
        const selectedCleaner = selectedCleaners.find(cleaner => 
          cleaner._id === assignedGroup.cleanerId
        ) || null;

        console.log(`👤 Selected cleaner for ${assignedGroup.group}:`, selectedCleaner);

        // Get available cleaners for this group from the database group
        let availableCleaners = [];
        if (dbGroup.cleaners && Array.isArray(dbGroup.cleaners)) {
          availableCleaners = dbGroup.cleaners.map(cleaner => ({
            ...cleaner,
            group: dbGroup.group,
            cleaning_fee: cleaner.cleaning_fee || dbGroup.group_cleaning_fee
          })).filter(cleaner => 
            cleaner && (!selectedCleaner || cleaner._id !== selectedCleaner._id)
          );
        }

        console.log(`📋 Available cleaners for ${assignedGroup.group}:`, availableCleaners.length);

        return { 
          group: assignedGroup.group, 
          selectedCleaner, 
          availableCleaners, 
          replaceMode: false,
          groupFee: dbGroup.group_cleaning_fee || 0,
        };
      }).filter(group => group !== null);

      console.log('✅ Final groupData built:', groups);
      setGroupData(groups);
      setDataLoaded(true);
      
    } catch (error) {
      console.error('❌ Error building groupData:', error);
      setGroupData([]);
    }
  }, [assignedTo, groupedCleaners, selectedCleaners]);

  // Handler to remove a cleaner
  const handleRemoveCleaner = (cleanerId) => {
    removeCleaner(cleanerId);
  };

  const handleProceedToGroupCheckout = () => {
    console.log('=== CHECKOUT DEBUGGING ===');
    // console.log('1. groupData:', groupData);
    // console.log('2. groupData length:', groupData.length);
    // console.log('3. Selected cleaners:', selectedCleaners);
    // console.log('4. Expected cleaners:', expectedCleaners);
    // console.log('5. Data loaded:', dataLoaded);
    // console.log('6. assignedTo:', assignedTo);
    // console.log('7. groupedCleaners:', groupedCleaners);
    
    // Check if data is loaded
    if (!dataLoaded) {
      Alert.alert(
        tSafe('data_still_loading_title', 'Data Still Loading'),
        tSafe('data_still_loading_message', 'Please wait while we finish loading the cleaner information.'),
        [{ text: tSafe('ok', 'OK') }]
      );
      return;
    }

    // Check if we have any group data at all
    if (!groupData || groupData.length === 0) {
      Alert.alert(
        tSafe('no_groups_available_title', 'No Groups Available'),
        tSafe('no_groups_available_message', 'There are no cleaning groups available for this schedule. Please contact support.'),
        [{ text: tSafe('ok', 'OK') }]
      );
      return;
    }

    // Check for unfilled groups - SIMPLIFIED CHECK
    const unfilledGroups = groupData.filter(group => {
      const hasSelectedCleaner = group.selectedCleaner !== null && group.selectedCleaner !== undefined;
      // console.log(`Group ${group.group} has selected cleaner:`, hasSelectedCleaner, group.selectedCleaner);
      return !hasSelectedCleaner;
    });
    
    // console.log('Unfilled groups count:', unfilledGroups.length);
    // console.log('Unfilled groups details:', unfilledGroups);

    if (unfilledGroups.length > 0) {
      const groupNames = unfilledGroups.map(g => g.group.replace('_', ' ')).join(', ');
      Alert.alert(
        tSafe('groups_not_filled_title', 'Groups Not Filled'),
        tSafe('groups_not_filled_message', 'You need to select cleaners for the following groups: {groups}', { groups: groupNames }),
        [{ text: tSafe('ok', 'OK'), onPress: () => setGroupModalVisible(true) }]
      );
      return;
    }

    // Additional safety check
    const totalSelected = selectedCleaners.length;
    if (totalSelected !== expectedCleaners) {
      Alert.alert(
        tSafe('selection_mismatch_title', 'Selection Mismatch'),
        tSafe('selection_mismatch_message', 'You have selected {selected} cleaner(s) but need {expected}. Please adjust your selection.', { 
          selected: totalSelected, 
          expected: expectedCleaners 
        }),
        [{ text: tSafe('ok', 'OK') }]
      );
      return;
    }

    // Final validation - ensure all selected cleaners are valid
    const validSelectedCleaners = selectedCleaners.filter(cleaner => 
      cleaner && cleaner._id && cleaner.firstname && cleaner.lastname
    );

    if (validSelectedCleaners.length !== expectedCleaners) {
      Alert.alert(
        tSafe('invalid_selection_title', 'Invalid Selection'),
        tSafe('invalid_selection_message', 'Some selected cleaners have invalid data. Please reselect them.'),
        [{ text: tSafe('ok', 'OK') }]
      );
      return;
    }

    // ✅ Extract only cleaner IDs
    const cleanerIds = validSelectedCleaners.map(cleaner => cleaner._id);
    // console.log('🧹 Extracted Cleaner IDs:', cleanerIds);

    console.log('✅ All checks passed, navigating to checkout');

    // ✅ Extract cleaner info from assignedTo
    const cleanersWithFee = assignedTo
    ?.map(item => ({
      cleanerId: item.cleanerId,
      firstname: item.firstname,
      lastname: item.lastname,
      fee: item.checklist.price || 0,
    }))
    .filter(c => c.cleanerId); // remove any invalid entries

    // Log it for debugging
    console.log('🧾 Cleaners with fees:', cleanersWithFee);

    // All checks passed, navigate to checkout
    navigation.navigate(ROUTES.host_group_checkout, {
      cleaning_fee: schedule?.total_cleaning_fee,
      scheduleId,
      selected_cleaners: validSelectedCleaners,
      cleanerIds: cleanerIds,
      cleanersWithFee: cleanersWithFee,
      schedule,
      requestId,
    });
  };

  // Test function to check groupData manually
  const testGroupData = () => {
    console.log('=== MANUAL GROUP DATA TEST ===');
    console.log('groupData:', groupData);
    console.log('groupData length:', groupData.length);
    
    if (groupData && groupData.length > 0) {
      groupData.forEach((group, index) => {
        console.log(`Group ${index + 1}:`, group.group);
        console.log(`- Selected cleaner:`, group.selectedCleaner);
        console.log(`- Available cleaners:`, group.availableCleaners.length);
        console.log(`- Has selected:`, !!group.selectedCleaner);
      });
      
      const unfilled = groupData.filter(g => !g.selectedCleaner);
      Alert.alert(
        tSafe('group_data_test_title', 'Group Data Test'),
        tSafe('group_data_test_message', 'Total groups: {total}\nUnfilled groups: {unfilled}', { total: groupData.length, unfilled: unfilled.length })
      );
    } else {
      Alert.alert(tSafe('group_data_test_title', 'Group Data Test'), tSafe('no_group_data', 'No group data available'));
    }
  };

  const handleSelectCleaner = cleaner => {
    const isAlreadySelected = selectedCleaners.some(c => c._id === cleaner._id);
    if (isAlreadySelected) return;
    if (selectedCleaners.length >= schedule.expected_cleaners) {
      setNewCleanerCandidate(cleaner);
      setShowCompareModal(true);
    } else {
      addCleaner(cleaner);
    }
  };

  const renderItem = ({ item }) => {
    const cleaner = item.cleaner;
    console.log("My cleanes accepted requests------------")
    const isSelected = selectedCleaners.some(c => c._id === cleaner._id);
    return (
      <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
        <CleanerCard
          item={item}
          cleanerId={item.cleanerId}
          selected={isSelected}
          onPress={() =>
            navigation.navigate(ROUTES.cleaner_profile_Pay, {
              item: cleaner,
              cleanerId: item.cleanerId,
              selected_schedule: item.schedule.schedule,
              assignedTo: assignedTo,
              expected_cleaners: item.schedule.overall_checklist,
              selected_scheduleId: scheduleId,
              hostId: item,
              requestId: item._id,
              cleaning_fee:item.schedule.cleaning_fee,
              distanceFromApartment:item.distanceFromApartment
            })
          }
        />
        
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <AntDesign name="home" size={60} color={COLORS.gray} />
        <Text bold style={styles.headerText}>{schedule.apartment_name}</Text>
        <Text style={{ color: COLORS.gray, marginBottom: 10 }}>
          <MaterialCommunityIcons name="map-marker" size={16} />{schedule.address}
        </Text>
        {/* <Text style={{ color: COLORS.gray, marginBottom: 10 }}>
          Expected Cleaners: {expectedCleaners} | Selected: {selectedCleaners.length}
        </Text>
        <Text style={{ color: COLORS.gray, marginBottom: 10 }}>
          Groups: {groupData.length} | Data Ready: {dataLoaded ? 'Yes' : 'No'}
        </Text> */}
        
        {/* Debug button */}
        {/* <TouchableOpacity onPress={testGroupData} style={styles.debugButton}>
          <Text style={styles.debugButtonText}>Test Group Data</Text>
        </TouchableOpacity> */}
      </View>
      
      {/* Info message */}
      <View style={styles.infoContainer}>
        <MaterialIcons name="info-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          {tSafe('cleaner_selection_info', 'Select cleaners by tapping on their cards. You have selected {selected} of {expected} cleaner(s).{maxMessage}', {
            selected: selectedCleaners.length,
            expected: expectedCleaners,
            maxMessage: selectedCleaners.length === expectedCleaners ? ' Maximum selected.' : ''
          })}
        </Text>
      </View>

      {/* Empty state
      {unselectedCleaners.length === 0 && selectedCleaners.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-clock" size={60} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>No Cleaners Yet</Text>
          <Text style={styles.emptyText}>
            Cleaners haven't accepted this request yet. Once they do, they'll appear here.
          </Text>
        </View>
      )} */}
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }}>
        <FlatList
          ref={flatListRef}
          data={unselectedCleaners}
          ListHeaderComponent={() => (
            <>
              <Text style={{ marginBottom: 8, fontWeight: 'bold', alignSelf: 'center' }}>
                {tSafe('selected_cleaners', 'Selected Cleaners')}
              </Text>
              {/* {selectedCleaners.map(cleaner => (
                <View key={cleaner._id} style={{ marginVertical: 10, marginHorizontal: 10 }}>
                  <CleanerCard item={cleaner} selected={true} />
                  
                </View>
              ))} */}
              {selectedCleaners.map(cleaner => (
                <View key={cleaner._id} style={{ marginVertical: 10, marginHorizontal: 10, position: 'relative' }}>
                  <CleanerCard item={cleaner} selected={true} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveCleaner(cleaner._id)}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {shouldShowPayButton && (
                <TouchableOpacity style={styles.payButton} onPress={handleProceedToGroupCheckout}>
                  <Text style={styles.payButtonText}>
                    {tSafe('proceed_to_checkout', 'Proceed to Checkout ({selected} of {expected})', {
                      selected: selectedCleaners.length,
                      expected: expectedCleaners
                    })}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.cleaner._id}
        />

       
        {/* Empty state */}
        {unselectedCleaners.length === 0 && selectedCleaners.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-clock" size={60} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>{tSafe('no_cleaners_yet', 'No Cleaners Yet')}</Text>
          <Text style={styles.emptyText}>
            {tSafe('no_cleaners_accepted', 'Cleaners haven\'t accepted this request yet. Once they do, they\'ll appear here.')}
          </Text>
        </View>
        )}
      </ScrollView>

      {/* Compare Modal */}
      <CompareCleanerModal
        visible={showCompareModal}
        onClose={() => {
          setShowCompareModal(false);
          setNewCleanerCandidate(null);
        }}
        existingCleaners={selectedCleaners}
        newCleaner={newCleanerCandidate}
      />

      {/* Group Selection Modal */}
      <CleanerSelectionModal
        groupModalVisible={groupModalVisible}
        setGroupModalVisible={setGroupModalVisible}
        groupData={groupData}
        setGroupData={setGroupData}
        addCleaner={addCleaner}
        schedule={schedule}
        allCleaners={allCleaners}
        userService={userService}
        scheduleId={scheduleId}
        groupedCleaners={groupedCleaners}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContent: { alignItems: 'center', marginTop: 20 },
  headerText: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  payButton: { margin: 20, padding: 15, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center' },
  payButtonText: { color: '#fff', fontWeight: 'bold' },
  debugButton: { margin: 10, padding: 10, borderRadius: 5, backgroundColor: COLORS.gray },
  debugButtonText: { color: '#fff', fontSize: 12 },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
  },
});