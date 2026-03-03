// import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
// import { StyleSheet, StatusBar, Text, Linking, TouchableWithoutFeedback, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
// import moment from 'moment';
// import { Button } from 'react-native-paper';
// import userService from '../../services/connection/userService';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // import CompareCleanerModal from '../../components/cleaner/CompareCleanerModal';
// import CompareCleanerModal from '../../components/host/CompareCleanerModal';
// import CleanerSelectionModal from '../../components/host/CleanerSelectionModal';

// export default function ScheduleRequest() {
//   const route = useRoute();
//   const { scheduleId, requestId, cleaner } = route?.params;

//   const navigation = useNavigation();
//   const { currentUserId } = useContext(AuthContext);
//   const { selectedCleaners, addCleaner, removeCleaner } = useCleanerSelection();

//   const scrollRef = useRef(null);
//   const payButtonRef = useRef(null);
//   const flatListRef = useRef(null);

//   const [cleaning_request, setCleaningRequests] = useState([]);
//   const [pendingCount, setPendingCount] = useState([]);
//   const [pending_payment, setFilteredPendingPayment] = useState([]);
//   const [schedule, setSchedule] = useState({});
//   const [expectedCleaners, setExpectedCleaners] = useState("");
//   const [apartment_name, setApartmentName] = useState('');
//   const [address, setAddress] = useState('');
//   const [host_request, setHostRequest] = useState('');

//   const [showCompareModal, setShowCompareModal] = useState(false);
//   const [newCleanerCandidate, setNewCleanerCandidate] = useState(null);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [assignedTo, setAssignedTo] = useState(null);
  

//   const [groupModalVisible, setGroupModalVisible] = useState(false);
//   const [groupData, setGroupData] = useState([]); 

//   const [allCleaners, setAllCleaners] = useState([]); 


//   const shouldShowPayButton = selectedCleaners.length === expectedCleaners;

//   const selectedCleanerIds = selectedCleaners.map(c => c._id);
//   const unselectedCleaners = pending_payment.filter(
//     request => !selectedCleanerIds.includes(request.cleaner._id)
//   );

  
//   // alert(schedule?.expected_cleaners)
//   useFocusEffect(
//     useCallback(() => {
//       fetchHostRequest();
//     }, [])
//   );

//   useEffect(() => {
//     if (shouldShowPayButton && flatListRef.current) {
//       setTimeout(() => {
//         flatListRef.current.scrollToEnd({ animated: true });
//       }, 300);
//     }
//   }, [shouldShowPayButton]);

//   useEffect(() => {
//     const fetchCleaners = async () => {
//       try {
//         const response = await userService.acceptedCleaners(scheduleId);
//         const res = response.data.data;
  
//         console.log("Raw response:", res);
  
//         // Flatten cleaners and attach group and group fee
//         const formatted = res.flatMap(group => 
//           group.cleaners.map(cleaner => ({
//             _id: cleaner._id,
//             avatar: cleaner.avatar,
//             name: `${cleaner.firstname} ${cleaner.lastname}`,
//             group: group.group || "group_1",          // fallback group
//             fee: cleaner.cleaning_fee || group.group_cleaning_fee || 0, // cleaner fee or group fee
//           }))
//         );
  
//         console.log("Formatted cleaners:", formatted);
//         setAllCleaners(formatted);
//       } catch (err) {
//         console.error("Error fetching cleaners:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchCleaners();
//   }, []);
//   // useEffect(() => {
//   //   const fetchCleaners = async () => {
//   //     try {
//   //       const response = await userService.acceptedCleaners(scheduleId);
      
//   //     const res = response.data.data
      
//   //      console.log("My boooooooo.....", res)
//   //       // Transform to match modal structure
//   //       const formatted = res.map((c) => ({
//   //         _id: c._id,
//   //         avatar: c.avatar,
//   //         // name: `${c.firstName} ${c.lastName}`,
//   //         name: `${c.name}`,
//   //         group: c.group || "group_1", // default if missing
//   //         fee: c.fee || 0, // fallback fee
//   //       }));
//   //       alert("correct")
//   //       console.log("My formatted", formatted)
        
//   //       setAllCleaners(formatted);
//   //       // setSelectedCleaner(formatted[0]); // pick first as default
//   //     } catch (err) {
//   //       console.error("Error fetching cleaners:", err);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchCleaners();
//   // }, []);

//   // useEffect(() => {
//   //   if (!assignedTo || !pending_payment) return;
  
//   //   const groups = assignedTo.map(group => {
//   //     const selectedCleaner = selectedCleaners.find(
//   //       sc => assignedTo.find(a => a.cleanerId === sc._id)?.group === group.group
//   //     );
  
//   //     const availableCleaners = pending_payment
//   //       .map(p => p.cleaner)
//   //       .filter(
//   //         c =>
//   //           assignedTo.find(a => a.cleanerId === c._id)?.group === group.group &&
//   //           c._id !== selectedCleaner?._id
//   //       );

        
  
//   //     return {
//   //       group: group.group,
//   //       selectedCleaner,
//   //       availableCleaners,
//   //       replaceMode: false, // tracks if host is replacing a cleaner
//   //     };
//   //   });

//   //   console.log("My groups", groups)
  
//   //   setGroupData(groups);
//   // }, [assignedTo, pending_payment, selectedCleaners]);
  

//   // useEffect(() => {
//   //   if (!assignedTo || !pending_payment) return;
  
//   //   const groups = assignedTo.map(group => {
//   //     const selectedCleaner = selectedCleaners.find(
//   //       sc => assignedTo.find(a => a.cleanerId === sc._id)?.group === group.group
//   //     );
  
//   //     const availableCleaners = pending_payment
//   //       .map(p => {
//   //         const groupMatch = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//   //         return groupMatch ? { ...p.cleaner, group: groupMatch.group } : null;
//   //       })
//   //       .filter(
//   //         c =>
//   //           c && c.group === group.group && c._id !== selectedCleaner?._id
//   //       );
  
//   //     return {
//   //       group: group.group,
//   //       selectedCleaner,
//   //       availableCleaners,
//   //       replaceMode: false,
//   //     };
//   //   });
  
//   //   console.log("My groups", groups);
  
//   //   setGroupData(groups);
//   // }, [assignedTo, pending_payment, selectedCleaners]);

//   // useEffect(() => {
//   //   if (!assignedTo || !pending_payment) return;
  
//   //   const groups = assignedTo.map(group => {
//   //     // currently selected cleaner in this group
//   //     const selectedCleaner = selectedCleaners.find(
//   //       sc => assignedTo.find(a => a.cleanerId === sc._id)?.group === group.group
//   //     );
  
//   //     // find all cleaners in this group from pending_payment
//   //     const groupCleaners = pending_payment
//   //       .map(p => {
//   //         const groupMatch = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//   //         return groupMatch ? { ...p.cleaner, group: groupMatch.group } : null;
//   //       })
//   //       .filter(c => c && c.group === group.group && c._id !== selectedCleaner?._id);
  
//   //     // remove duplicates by _id
//   //     const uniqueCleaners = Array.from(
//   //       new Map(groupCleaners.map(c => [c._id, c])).values()
//   //     );
  
//   //     return {
//   //       group: group.group,
//   //       selectedCleaner,
//   //       availableCleaners: uniqueCleaners,
//   //       replaceMode: false,
//   //     };
//   //   });
  
//   //   console.log("My groups", groups);
  
//   //   setGroupData(groups);
//   // }, [assignedTo, pending_payment, selectedCleaners]);


//   // useEffect(() => {
//   //   if (!assignedTo || !pending_payment) return;
  
//   //   const groups = assignedTo.map(group => {
//   //     // find selected cleaner in this group
//   //     const selectedCleaner = selectedCleaners.find(sc =>
//   //       assignedTo.some(a => a.cleanerId === sc._id && a.group === group.group)
//   //     );
  
//   //     // find available cleaners in this group from pending_payment
//   //     const groupCleaners = pending_payment
//   //       .map(p => {
//   //         const match = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//   //         return match ? { ...p.cleaner, group: match.group } : null;
//   //       })
//   //       .filter(c => c && c.group === group.group && c._id !== selectedCleaner?._id);
  
//   //     // deduplicate
//   //     const uniqueCleaners = Array.from(
//   //       new Map(groupCleaners.map(c => [c._id, c])).values()
//   //     );
  
//   //     return {
//   //       group: group.group,
//   //       selectedCleaner,
//   //       availableCleaners: uniqueCleaners,
//   //       replaceMode: false,
//   //     };
//   //   });
  
//   //   console.log("My groups", groups);
//   //   setGroupData(groups);
//   // }, [assignedTo, pending_payment, selectedCleaners]);

//   // useEffect(() => {
//   //   if (!assignedTo || !pending_payment) return;
  
//   //   const groups = assignedTo.map(group => {
//   //     // find selected cleaner in this group
//   //     const selectedCleaner = selectedCleaners.find(sc =>
//   //       assignedTo.some(a => a.cleanerId === sc._id && a.group === group.group)
//   //     );
  
//   //     // find available cleaners in this group from pending_payment
//   //     const groupCleaners = pending_payment
//   //       .map(p => {
//   //         const match = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//   //         return match ? { ...p.cleaner, group: match.group } : null;
//   //       })
//   //       .filter(c => c && c.group === group.group && c._id !== selectedCleaner?._id);
  
//   //     // deduplicate
//   //     const uniqueCleaners = Array.from(
//   //       new Map(groupCleaners.map(c => [c._id, c])).values()
//   //     );
  
//   //     return {
//   //       group: group.group,
//   //       selectedCleaner,
//   //       availableCleaners: uniqueCleaners,
//   //       replaceMode: false,
//   //     };
//   //   })
//   //   // ✅ filter out groups with no selectedCleaner and no availableCleaners
//   //   .filter(g => g.selectedCleaner || g.availableCleaners.length > 0);
  
//   //   console.log("My groups (filtered)", groups);
//   //   setGroupData(groups);
//   // }, [assignedTo, pending_payment, selectedCleaners]);


//   // useEffect(() => {
//   //   if (!assignedTo || !pending_payment) return;
  
//   //   const groups = assignedTo.map(group => {
//   //     const selectedCleaner = selectedCleaners.find(
//   //       sc => assignedTo.find(a => a.cleanerId === sc._id)?.group === group.group
//   //     );
  
//   //     const groupCleaners = pending_payment
//   //       .map(p => {
//   //         const groupMatch = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//   //         return groupMatch ? { ...p.cleaner, group: groupMatch.group } : null;
//   //       })
//   //       .filter(
//   //         c => c && c.group === group.group && c._id !== selectedCleaner?._id
//   //       );
  
//   //     const uniqueCleaners = Array.from(
//   //       new Map(groupCleaners.map(c => [c._id, c])).values()
//   //     );
  
//   //     return {
//   //       group: group.group,
//   //       selectedCleaner,
//   //       availableCleaners: uniqueCleaners,
//   //       replaceMode: false,
//   //     };
//   //   });
  
//   //   setGroupData(groups);
//   // }, [assignedTo, pending_payment, selectedCleaners]);


//   useEffect(() => {
//     if (!assignedTo || !pending_payment) return;
  
//     const groups = assignedTo.map(group => {
//       // Find currently selected cleaner for this group
//       const selectedCleaner = selectedCleaners.find(
//         sc => assignedTo.find(a => a.cleanerId === sc._id)?.group === group.group
//       );
  
//       // Get all cleaners in this group (from pending_payment or assignedTo)
//       const groupCleaners = pending_payment
//         .map(p => {
//           const groupMatch = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//           return groupMatch ? { ...p.cleaner, group: groupMatch.group } : null;
//         })
//         .filter(c => c && c.group === group.group);
        
//       console.log("g.................____1111", groupCleaners)
  
//       // Remove selected cleaner
//       const availableCleaners = groupCleaners.filter(c => c._id !== selectedCleaner?._id);
  
//       // Remove duplicates by _id
//       const uniqueCleaners = Array.from(new Map(availableCleaners.map(c => [c._id, c])).values());
  
//       return {
//         group: group.group,
//         selectedCleaner,
//         availableCleaners: uniqueCleaners,
//         replaceMode: false,
//       };
//     });
  
//     console.log("My groups:", groups);
//     setGroupData(groups);
//   }, [assignedTo, pending_payment, selectedCleaners]);

//   console.log("My pending payment", pending_payment)
//   const fetchHostRequest = async () => {
//     const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
//     try {
//       const response = await userService.getHostCleaningRequestByScheduleId(scheduleId, currentTime);
//       const res = response.data;
//       setHostRequest(res);
//       console.log("Cleanerssoooooooo", res[0].schedule.assignedTo)
//       setAssignedTo(res[0].schedule.assignedTo)
//       console.log(res[0].schedule.assignedTo)

      
//       // Count expected cleaners based on the number of groups
//       setExpectedCleaners(res[0].schedule.assignedTo?.length || 0);
//       console.log("Hello")
//       // console.log("Open group", res[0].schedule.assignedTo)

      
      
//       // setSelectedGroup(groupName)
//       // console.log(groupName); // 👉 "group_1"


//       setSchedule(res[0].schedule.schedule);

//       // const pendingPayment = res.filter(req => req.status === 'pending_payment');
//       const pendingRequests = res.filter(req => req.status === 'pending_acceptance');

//       const availableCleaners = res.filter(
//         req => req.status === 'pending_payment'
//       );
      
//       setFilteredPendingPayment(availableCleaners);
//       setCleaningRequests(pendingRequests);
//       // setFilteredPendingPayment(pendingPayment);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const handleProceedToCheckout = () => {
//     navigation.navigate(ROUTES.host_single_checkout, {
//       cleaning_fee: schedule?.total_cleaning_fee,
//       scheduleId: scheduleId,
//       schedule: schedule,
//       requestId: requestId,
//     });
//   };

//   // const handleProceedToGroupCheckout = () => {
   
//   //   navigation.navigate(ROUTES.host_group_checkout, {
//   //     cleaning_fee: schedule?.total_cleaning_fee,
//   //     scheduleId: scheduleId,
//   //     selected_cleaners: selectedCleaners,
//   //     schedule: schedule,
//   //     requestId: requestId,
//   //   });
//   // };

//   // const handleProceedToGroupCheckout = () => {
//   //   if (!assignedTo || assignedTo.length === 0) {
//   //     alert('No groups or cleaners assigned yet.');
//   //     return;
//   //   }
  
//   //   // Build a map of group -> selected cleaners
//   //   const groupMap = {};
//   //   selectedCleaners.forEach(c => {
//   //     const group = assignedTo.find(a => a.cleanerId === c._id)?.group;
//   //     if (group) {
//   //       if (!groupMap[group]) groupMap[group] = [];
//   //       groupMap[group].push(c._id);
//   //     }
//   //   });
  
//   //   // Check that each group has exactly one cleaner
//   //   const missingGroups = assignedTo
//   //     .map(a => a.group)
//   //     .filter(g => !groupMap[g] || groupMap[g].length === 0);
  
//   //   if (missingGroups.length > 0) {
//   //     alert(`Please select one cleaner for each group: ${missingGroups.join(', ')}`);
//   //     return;
//   //   }
  
//   //   // Check for duplicates within a group
//   //   const duplicates = Object.entries(groupMap)
//   //     .filter(([_, ids]) => ids.length > 1)
//   //     .map(([group]) => group);
  
//   //   if (duplicates.length > 0) {
//   //     alert(`Only one cleaner can be selected per group: ${duplicates.join(', ')}`);
//   //     return;
//   //   }
  
//   //   // All validations passed — proceed to group checkout
//   //   navigation.navigate(ROUTES.host_group_checkout, {
//   //     cleaning_fee: schedule?.total_cleaning_fee,
//   //     scheduleId: scheduleId,
//   //     selected_cleaners: selectedCleaners,
//   //     schedule: schedule,
//   //     requestId: requestId,
//   //   });
//   // };

//   // const handleProceedToGroupCheckout = () => {
//   //   if (!assignedTo || assignedTo.length === 0) return;
  
//   //   // Build group data
//   //   const groups = assignedTo.map(group => {
//   //     const selectedCleaner = selectedCleaners.find(c => assignedTo.find(a => a.cleanerId === c._id)?.group === group.group);
//   //     const availableCleaners = pending_payment
//   //       .map(p => p.cleaner)
//   //       .filter(c => assignedTo.find(a => a.cleanerId === c._id)?.group === group.group && c._id !== selectedCleaner?._id);
      
//   //     return { 
//   //       group: group.group, 
//   //       selectedCleaner, 
//   //       availableCleaners 
//   //     };
//   //   });
  
//   //   const unfilledGroups = groups.filter(g => !g.selectedCleaner);
  
//   //   if (unfilledGroups.length > 0) {
//   //     setGroupData(groups);
//   //     setGroupModalVisible(true);
//   //     return;
//   //   }
  
//   //   // All groups filled, proceed
//   //   navigation.navigate(ROUTES.host_group_checkout, {
//   //     cleaning_fee: schedule?.total_cleaning_fee,
//   //     scheduleId: scheduleId,
//   //     selected_cleaners: selectedCleaners,
//   //     schedule: schedule,
//   //     requestId: requestId,
//   //   });
//   // };


//   const handleProceedToGroupCheckout = () => {
//     // Find any unfilled groups
//     const unfilledGroups = groupData.filter(g => !g.selectedCleaner);
  
//     if (unfilledGroups.length > 0) {
//       setGroupModalVisible(true); // Open modal if some groups are missing a cleaner
//       return;
//     }
  
//     // All groups filled → proceed to checkout
//     navigation.navigate(ROUTES.host_group_checkout, {
//       cleaning_fee: schedule?.total_cleaning_fee,
//       scheduleId,
//       selected_cleaners: selectedCleaners,
//       schedule,
//       requestId,
//     });
//   };

//   const handleSelectCleaner = cleaner => {
//     const isAlreadySelected = selectedCleaners.some(c => c._id === cleaner._id);
//     if (isAlreadySelected) return;

//     if (selectedCleaners.length >= schedule.expected_cleaners) {
//       setNewCleanerCandidate(cleaner);
//       setShowCompareModal(true);
//     } else {
//       addCleaner(cleaner);
//     }
//   };

//   const renderItem = ({ item }) => {
//     const cleaner = item.cleaner;
//     const isSelected = selectedCleaners.some(c => c._id === cleaner._id);

//     return (
//       <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
//         <CleanerCard
//           item={item}
//           cleanerId={item.cleanerId}
//           selected={isSelected}
//           onPress={() =>
//             navigation.navigate(ROUTES.cleaner_profile_Pay, {
//               item: cleaner,
//               cleanerId:item.cleanerId,
//               selected_schedule: item.schedule.schedule,
//               assignedTo: item.schedule.schedule,
//               expected_cleaners:item.schedule.overall_checklist,
//               selected_scheduleId: scheduleId,
//               hostId: item,
//               requestId: item._id,
//               // selectedGroup:selectedGroup,
//               assignedTo:assignedTo,
//               hostFname: item.firstname,
//               hostLname: item.lastname,
//               distanceFromApartment: item.distanceFromApartment,
//             })
//           }
//         //   onSelect={() => handleSelectCleaner(cleaner)}
//         />
//       </View>
//     );
//   };

//   const handleRefresh = () => {};

//   return (
//     <View style={styles.container}>
//       <View style={styles.centerContent}>
//         <AntDesign name="home" size={60} color={COLORS.gray} />
//         <Text bold style={styles.headerText}>{schedule.apartment_name}</Text>
//         <Text style={{ color: COLORS.gray, marginBottom: 10, marginLeft: -5 }}>
//           <MaterialCommunityIcons name="map-marker" size={16} />{schedule.address}
//         </Text>
//       </View>
//       <View style={styles.section}>
//         <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }}>
//           <FlatList
//             ref={flatListRef}
//             data={unselectedCleaners}
//             ListHeaderComponent={() => (
//               <>
//                 <Text style={{ marginBottom: 8, fontWeight: 'bold', alignSelf: 'center' }}>Selected Cleaners</Text>
//                 {selectedCleaners.map(cleaner => (
//                   <View key={cleaner._id} style={{ marginVertical: 10, marginHorizontal: 10 }}>
//                     <CleanerCard item={cleaner} selected={true} />
//                   </View>
//                 ))}
//                 {shouldShowPayButton && (
//                   <View ref={payButtonRef}>
//                     <TouchableOpacity style={styles.payButton} onPress={handleProceedToGroupCheckout}>
//                       <Text style={styles.payButtonText}>Proceed to Checkout ({selectedCleaners.length} of {expectedCleaners})</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//                 {selectedCleaners.length < schedule.expected_cleaners && (
//                   <Text style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold', alignSelf: 'center' }}>
//                     Other Available Cleaners
//                   </Text>
//                 )}
//               </>
//             )}
//             renderItem={renderItem}
//             ListHeaderComponentStyle={styles.list_header}
//             ListEmptyComponent={
//               <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
//                 <MaterialCommunityIcons name="account-clock-outline" size={64} color={COLORS.light_gray} />
//                 <Text style={{ color: COLORS.gray, fontSize: 16, marginTop: 10, textAlign: 'center' }}>
//                   Waiting for cleaners to accept your request...
//                 </Text>
//                 <Text style={{ color: COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
//                   Check back shortly or try inviting more cleaners.
//                 </Text>
//                 <Button
//                   icon="refresh"
//                   mode="contained"
//                   onPress={handleRefresh}
//                   style={{ marginTop: 20, borderRadius: 25, backgroundColor: COLORS.primary }}
//                 >
//                   Refresh
//                 </Button>
//                 <Button
//                   icon="account-plus"
//                   mode="outlined"
//                 //   onPress={() => navigation.navigate(ROUTES.host_find_cleaners, { scheduleId })}
                  
//                 //   onPress={() =>navigation.navigate(ROUTES.host_dashboard, {
//                 //     screen: ROUTES.host_find_cleaners,
//                 //     params: { scheduleId: schedule._id },
//                 //   })}

//                   onPress = {() => navigation.reset({
//                     index: 0,
//                     routes: [
//                       {
//                         name: ROUTES.host_home_drawer, // or whatever route name you gave to BottomTabs
//                         state: {
//                           routes: [
//                             {
//                               name: ROUTES.host_find_cleaners,
//                               params: { scheduleId: 'your-id-here' }
//                             }
//                           ]
//                         }
//                       }
//                     ]
//                   })}
//                   style={{ marginTop: 10, borderRadius: 25 }}
//                 >
//                   Invite Cleaners
//                 </Button>
//               </View>
//             }
//             keyExtractor={item => item._id || item.cleaner._id}
//             numColumns={1}
//             showsVerticalScrollIndicator={false}
//             horizontal={false}
//           />
//         </ScrollView>
//       </View>

//       {/* Compare Modal */}
//       <CompareCleanerModal
//         visible={showCompareModal}
//         onClose={() => {
//           setShowCompareModal(false);
//           setNewCleanerCandidate(null);
//         }}
//         existingCleaners={selectedCleaners}
//         newCleaner={newCleanerCandidate}
//       />
//       {/* <CleanerSelectionModal
//         groupModalVisible={groupModalVisible}
//         setGroupModalVisible={setGroupModalVisible}
//         groupData={groupData}
//         setGroupData={setGroupData}
//         addCleaner={addCleaner}
//         userService={userService}
//         scheduleId={scheduleId}
//       /> */}

//       <CleanerSelectionModal
//         groupModalVisible={groupModalVisible}
//         setGroupModalVisible={setGroupModalVisible}
//         schedule={schedule}       // must include assignedTo + checklist.price
//         allCleaners={allCleaners} // full cleaners array from DB
//         userService={userService}
//         scheduleId={schedule._id}
//       />
//       <Modal
//         visible={groupModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setGroupModalVisible(false)}
//       >
//         <View style={styles.overlay}>
//           <View style={styles.modalContainer}>
//             {/* Header with title and Done button */}
//             <View style={styles.header}>
//               <Text style={styles.title}>Select Cleaner for Each Group</Text>
//               <TouchableOpacity onPress={() => setGroupModalVisible(false)} style={styles.doneButton}>
//                 <Text style={styles.doneText}>Done</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView>
//               {groupData.map(item => (
//                 <View key={item.group} style={styles.groupContainer}>
//                   <Text style={styles.groupTitle}>
//                   {item.group
//                 .replace(/_/g, ' ')
//                 .replace(/\b\w/g, char => char.toUpperCase())}
//                 </Text>

//                   {/* No cleaner selected */}
//                   {!item.selectedCleaner ? (
//                     <View>
//                       <Text style={styles.noCleaner}>No cleaner selected</Text>
//                       {item.availableCleaners.map(c => (
//                         <TouchableOpacity
//                           key={c._id}
//                           style={styles.cleanerRow}
//                           onPress={() => {
//                             addCleaner(c);
//                             userService.updateAssignedToID({
//                               cleanerId: c._id,
//                               scheduleId,
//                               selected_group: item.group,
//                             });
//                             setGroupData(prev =>
//                               prev.map(g =>
//                                 g.group === item.group ? { ...g, selectedCleaner: c, replaceMode: false } : g
//                               )
//                             );
//                           }}
//                         >
//                           {c.avatar ? (
//                             <Image source={{ uri: c.avatar }} style={styles.avatar} />
//                           ) : (
//                             <View style={styles.avatarPlaceholder}>
//                               <Text style={styles.avatarText}>{c.firstname[0]}{c.lastname[0]}</Text>
//                             </View>
//                           )}
//                           <Text style={styles.cleanerName}>{c.firstname} {c.lastname}</Text>
//                           <View style={styles.replaceBadge}>
//                             <Text style={styles.replaceText}>Select</Text>
//                           </View>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   ) : (
//                     // Cleaner already selected
//                     <View>
//                       <View style={styles.selectedRow}>
//                         <View style={styles.selectedInfo}>
//                           {item.selectedCleaner.avatar ? (
//                             <Image source={{ uri: item.selectedCleaner.avatar }} style={styles.avatar} />
//                           ) : (
//                             <View style={styles.avatarPlaceholder}>
//                               <Text style={styles.avatarText}>
//                                 {item.selectedCleaner.firstname[0]}{item.selectedCleaner.lastname[0]}
//                               </Text>
//                             </View>
//                           )}
//                           <Text style={styles.cleanerName}>{item.selectedCleaner.firstname} {item.selectedCleaner.lastname}</Text>
//                         </View>

//                         {item.availableCleaners.length > 0 && (
//                           <TouchableOpacity
//                             onPress={() =>
//                               setGroupData(prev =>
//                                 prev.map(g =>
//                                   g.group === item.group ? { ...g, replaceMode: !g.replaceMode } : g
//                                 )
//                               )
//                             }
//                           >
//                             <View style={styles.replaceBadge}>
//                               <Text style={styles.replaceText}>{item.replaceMode ? 'Cancel' : 'Replace'}</Text>
//                             </View>
//                           </TouchableOpacity>
//                         )}
//                       </View>

//                       {/* Replacement list */}
//                       {item.replaceMode && (
//                         <View style={{ marginTop: 8 }}>
//                           {item.availableCleaners.map(c => (
//                             <TouchableOpacity
//                               key={c._id}
//                               style={styles.cleanerRow}
//                               onPress={() => {
//                                 addCleaner(c);
//                                 userService.updateAssignedToID({
//                                   cleanerId: c._id,
//                                   scheduleId,
//                                   selected_group: item.group,
//                                 });
//                                 setGroupData(prev =>
//                                   prev.map(g =>
//                                     g.group === item.group ? { ...g, selectedCleaner: c, replaceMode: false } : g
//                                   )
//                                 );
//                               }}
//                             >
//                               {c.avatar ? (
//                                 <Image source={{ uri: c.avatar }} style={styles.avatar} />
//                               ) : (
//                                 <View style={styles.avatarPlaceholder}>
//                                   <Text style={styles.avatarText}>{c.firstname[0]}{c.lastname[0]}</Text>
//                                 </View>
//                               )}
//                               <Text style={styles.cleanerName}>{c.firstname} {c.lastname}</Text>
//                               <View style={styles.replaceBadge}>
//                                 <Text style={styles.replaceText}>Replace</Text>
//                               </View>
//                             </TouchableOpacity>
//                           ))}
//                         </View>
//                       )}
//                     </View>
//                   )}
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 0,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginHorizontal: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     marginHorizontal: 10,
//     color: COLORS.gray,
//   },
//   centerContent: {
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   payButton: {
//     backgroundColor: COLORS.primary,
//     padding: 15,
//     borderRadius: 30,
//     marginVertical: 10,
//     alignItems: 'center',
//     marginHorizontal: 20,
//   },
//   payButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   // Modal 
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     width: '90%',
//     maxHeight: '85%', // slightly taller
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   doneButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#007AFF',
//     borderRadius: 20,
//   },
//   doneText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   groupContainer: {
//     marginBottom: 20,
//   },
//   groupTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   noCleaner: {
//     color: 'gray',
//     marginBottom: 6,
//   },
//   cleanerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 6,
//   },
//   selectedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//     marginBottom: 6,
//   },
//   selectedInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   avatarPlaceholder: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#ccc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   avatarText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   cleanerName: {
//     fontWeight: '600',
//     color: '#007AFF',
//     fontSize: 16,
//   },
//   replaceBadge: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   replaceText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 12,
//   },
// });

// import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
// import { StyleSheet, Text, FlatList, ScrollView, Modal, View, TouchableOpacity } from 'react-native';
// import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
// import moment from 'moment';
// import { Button } from 'react-native-paper';
// import userService from '../../services/connection/userService';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import CompareCleanerModal from '../../components/host/CompareCleanerModal';
// import CleanerSelectionModal from '../../components/host/CleanerSelectionModal';

// export default function ScheduleRequest() {
//   const route = useRoute();
//   const { scheduleId, requestId } = route?.params;
//   const navigation = useNavigation();
//   const { currentUserId } = useContext(AuthContext);
//   const { selectedCleaners, addCleaner } = useCleanerSelection();

//   const scrollRef = useRef(null);
//   const payButtonRef = useRef(null);
//   const flatListRef = useRef(null);

//   const [cleaning_request, setCleaningRequests] = useState([]);
//   const [pending_payment, setFilteredPendingPayment] = useState([]);
//   const [schedule, setSchedule] = useState({});
//   const [expectedCleaners, setExpectedCleaners] = useState(0);
//   const [assignedTo, setAssignedTo] = useState(null);
//   const [groupModalVisible, setGroupModalVisible] = useState(false);
//   const [groupData, setGroupData] = useState([]);
//   const [allCleaners, setAllCleaners] = useState([]);
//   const [showCompareModal, setShowCompareModal] = useState(false);
//   const [newCleanerCandidate, setNewCleanerCandidate] = useState(null);

//   const shouldShowPayButton = selectedCleaners.length === expectedCleaners;
//   const selectedCleanerIds = selectedCleaners.map(c => c._id);
//   const unselectedCleaners = pending_payment.filter(
//     request => !selectedCleanerIds.includes(request.cleaner._id)
//   );

//   // fetch host request
//   const fetchHostRequest = async () => {
//     const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
//     try {
//       const response = await userService.getHostCleaningRequestByScheduleId(scheduleId, currentTime);
//       const res = response.data;
//       setAssignedTo(res[0].schedule.assignedTo);
//       setExpectedCleaners(res[0].schedule.assignedTo?.length || 0);
//       setSchedule(res[0].schedule.schedule);
//       const availableCleaners = res.filter(req => req.status === 'pending_payment');
//       setFilteredPendingPayment(availableCleaners);
//       setCleaningRequests(res.filter(req => req.status === 'pending_acceptance'));
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchHostRequest();
//     }, [])
//   );

//   useEffect(() => {
//     if (shouldShowPayButton && flatListRef.current) {
//       setTimeout(() => {
//         flatListRef.current.scrollToEnd({ animated: true });
//       }, 300);
//     }
//   }, [shouldShowPayButton]);

//   // fetch all cleaners
//   useEffect(() => {
//     const fetchCleaners = async () => {
//       try {
//         const response = await userService.acceptedCleaners(scheduleId);
//         const res = response.data.data;
//         const formatted = res.flatMap(group =>
//           group.cleaners.map(cleaner => ({
//             _id: cleaner._id,
//             avatar: cleaner.avatar,
//             name: `${cleaner.firstname} ${cleaner.lastname}`,
//             group: group.group || 'group_1',
//             fee: cleaner.cleaning_fee || group.group_cleaning_fee || 0,
//           }))
//         );
//         setAllCleaners(formatted);
//       } catch (err) {
//         console.error('Error fetching cleaners:', err);
//       }
//     };
//     fetchCleaners();
//   }, []);

//   // build groupData
//   useEffect(() => {
//     if (!assignedTo || !pending_payment) return;
//     const groups = assignedTo.map(group => {
//       const selectedCleaner = selectedCleaners.find(
//         sc => assignedTo.find(a => a.cleanerId === sc._id)?.group === group.group
//       );
//       const groupCleaners = pending_payment
//         .map(p => {
//           const groupMatch = assignedTo.find(a => a.cleanerId === p.cleaner._id);
//           return groupMatch ? { ...p.cleaner, group: groupMatch.group } : null;
//         })
//         .filter(c => c && c.group === group.group);
//       const availableCleaners = groupCleaners.filter(c => c._id !== selectedCleaner?._id);
//       const uniqueCleaners = Array.from(new Map(availableCleaners.map(c => [c._id, c])).values());
//       return { group: group.group, selectedCleaner, availableCleaners: uniqueCleaners, replaceMode: false };
//     });
//     setGroupData(groups);
//   }, [assignedTo, pending_payment, selectedCleaners]);

//   const handleProceedToGroupCheckout = () => {
//     const unfilledGroups = groupData.filter(g => !g.selectedCleaner);
//     if (unfilledGroups.length > 0) {
//       setGroupModalVisible(true);
//       return;
//     }
//     navigation.navigate(ROUTES.host_group_checkout, {
//       cleaning_fee: schedule?.total_cleaning_fee,
//       scheduleId,
//       selected_cleaners: selectedCleaners,
//       schedule,
//       requestId,
//     });
//   };

//   const handleSelectCleaner = cleaner => {
//     const isAlreadySelected = selectedCleaners.some(c => c._id === cleaner._id);
//     if (isAlreadySelected) return;
//     if (selectedCleaners.length >= schedule.expected_cleaners) {
//       setNewCleanerCandidate(cleaner);
//       setShowCompareModal(true);
//     } else {
//       addCleaner(cleaner);
//     }
//   };

//   const renderItem = ({ item }) => {
//     const cleaner = item.cleaner;
//     const isSelected = selectedCleaners.some(c => c._id === cleaner._id);
//     return (
//       <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
//         <CleanerCard
//           item={item}
//           cleanerId={item.cleanerId}
//           selected={isSelected}
//           onPress={() =>
//             navigation.navigate(ROUTES.cleaner_profile_Pay, {
//               item: cleaner,
//               cleanerId: item.cleanerId,
//               selected_schedule: item.schedule.schedule,
//               assignedTo: assignedTo,
//               expected_cleaners: item.schedule.overall_checklist,
//               selected_scheduleId: scheduleId,
//               hostId: item,
//               requestId: item._id,
//             })
//           }
//         />
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.centerContent}>
//         <AntDesign name="home" size={60} color={COLORS.gray} />
//         <Text bold style={styles.headerText}>{schedule.apartment_name}</Text>
//         <Text style={{ color: COLORS.gray, marginBottom: 10 }}>
//           <MaterialCommunityIcons name="map-marker" size={16} />{schedule.address}
//         </Text>
//       </View>

//       <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }}>
//         <FlatList
//           ref={flatListRef}
//           data={unselectedCleaners}
//           ListHeaderComponent={() => (
//             <>
//               <Text style={{ marginBottom: 8, fontWeight: 'bold', alignSelf: 'center' }}>Selected Cleaners</Text>
//               {selectedCleaners.map(cleaner => (
//                 <View key={cleaner._id} style={{ marginVertical: 10, marginHorizontal: 10 }}>
//                   <CleanerCard item={cleaner} selected={true} />
//                 </View>
//               ))}
//               {shouldShowPayButton && (
//                 <TouchableOpacity style={styles.payButton} onPress={handleProceedToGroupCheckout}>
//                   <Text style={styles.payButtonText}>
//                     Proceed to Checkout ({selectedCleaners.length} of {expectedCleaners})
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </>
//           )}
//           renderItem={renderItem}
//           keyExtractor={item => item._id || item.cleaner._id}
//         />
//       </ScrollView>

//       {/* Compare Modal */}
//       <CompareCleanerModal
//         visible={showCompareModal}
//         onClose={() => {
//           setShowCompareModal(false);
//           setNewCleanerCandidate(null);
//         }}
//         existingCleaners={selectedCleaners}
//         newCleaner={newCleanerCandidate}
//       />

//       {/* Group Selection Modal (✅ only one) */}
//       <CleanerSelectionModal
//         groupModalVisible={groupModalVisible}
//         setGroupModalVisible={setGroupModalVisible}
//         groupData={groupData}
//         setGroupData={setGroupData}
//         addCleaner={addCleaner}
//         schedule={schedule}
//         allCleaners={allCleaners}
//         userService={userService}
//         scheduleId={scheduleId}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   centerContent: { alignItems: 'center', marginTop: 20 },
//   headerText: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
//   payButton: { margin: 20, padding: 15, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center' },
//   payButtonText: { color: '#fff', fontWeight: 'bold' },
// });




import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, FlatList, ScrollView, Modal, View, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Button } from 'react-native-paper';
import userService from '../../services/connection/userService';
import { useCleanerSelection } from '../../context/CleanerSelectionContext';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import CleanerCard from '../../components/cleaner/CleanerCard';
import COLORS from '../../constants/colors';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import CompareCleanerModal from '../../components/host/CompareCleanerModal';
import CleanerSelectionModal from '../../components/host/CleanerSelectionModal';


export default function ScheduleRequest() {
  const route = useRoute();
  const { scheduleId, requestId } = route?.params;
  const navigation = useNavigation();
  const { currentUserId } = useContext(AuthContext);
  const { selectedCleaners, addCleaner } = useCleanerSelection();

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


  
  // fetch host request
  const fetchHostRequest = async () => {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
      const response = await userService.getHostCleaningRequestByScheduleId(scheduleId, currentTime);
      const res = response.data;
      console.log('✅ Fetched host request assignedTo:', res[0]?.schedule?.assignedTo);
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
        console.log('✅ Fetched grouped cleaners:', res);
        
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
    console.log('🔄 Building groupData with:', { 
      assignedTo: assignedTo, 
      groupedCleaners: groupedCleaners,
      selectedCleaners: selectedCleaners 
    });
    
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
          console.log('❌ Invalid assignedGroup:', assignedGroup);
          return null;
        }

        console.log(`🔍 Processing group: ${assignedGroup.group}`);
        
        // Find the corresponding group from database structure
        const dbGroup = groupedCleaners.find(g => g.group === assignedGroup.group);
        console.log(`📊 Found dbGroup for ${assignedGroup.group}:`, dbGroup);
        
        if (!dbGroup) {
          console.log(`❌ No dbGroup found for ${assignedGroup.group}`);
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

  const handleProceedToGroupCheckout = () => {
    console.log('=== CHECKOUT DEBUGGING ===');
    console.log('1. groupData:', groupData);
    console.log('2. groupData length:', groupData.length);
    console.log('3. Selected cleaners:', selectedCleaners);
    console.log('4. Expected cleaners:', expectedCleaners);
    console.log('5. Data loaded:', dataLoaded);
    console.log('6. assignedTo:', assignedTo);
    console.log('7. groupedCleaners:', groupedCleaners);
    
    // Check if data is loaded
    if (!dataLoaded) {
      Alert.alert(
        'Data Still Loading',
        'Please wait while we finish loading the cleaner information.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if we have any group data at all
    if (!groupData || groupData.length === 0) {
      Alert.alert(
        'No Groups Available',
        'There are no cleaning groups available for this schedule. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check for unfilled groups - SIMPLIFIED CHECK
    const unfilledGroups = groupData.filter(group => {
      const hasSelectedCleaner = group.selectedCleaner !== null && group.selectedCleaner !== undefined;
      console.log(`Group ${group.group} has selected cleaner:`, hasSelectedCleaner, group.selectedCleaner);
      return !hasSelectedCleaner;
    });
    
    console.log('Unfilled groups count:', unfilledGroups.length);
    console.log('Unfilled groups details:', unfilledGroups);

    if (unfilledGroups.length > 0) {
      const groupNames = unfilledGroups.map(g => g.group.replace('_', ' ')).join(', ');
      Alert.alert(
        'Groups Not Filled',
        `You need to select cleaners for the following groups: ${groupNames}`,
        [{ text: 'OK', onPress: () => setGroupModalVisible(true) }]
      );
      return;
    }

    // Additional safety check
    const totalSelected = selectedCleaners.length;
    if (totalSelected !== expectedCleaners) {
      Alert.alert(
        'Selection Mismatch',
        `You have selected ${totalSelected} cleaner(s) but need ${expectedCleaners}. Please adjust your selection.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Final validation - ensure all selected cleaners are valid
    const validSelectedCleaners = selectedCleaners.filter(cleaner => 
      cleaner && cleaner._id && cleaner.firstname && cleaner.lastname
    );

    if (validSelectedCleaners.length !== expectedCleaners) {
      Alert.alert(
        'Invalid Selection',
        'Some selected cleaners have invalid data. Please reselect them.',
        [{ text: 'OK' }]
      );
      return;
    }



    // ✅ Extract only cleaner IDs
    const cleanerIds = validSelectedCleaners.map(cleaner => cleaner._id);
    console.log('🧹 Extracted Cleaner IDs:', cleanerIds);

    console.log('✅ All checks passed, navigating to checkout');


    // ✅ Extract cleaner info from assignedTo
    const cleanersWithFee = assignedTo
    ?.map(item => ({
      cleanerId: item.cleanerId,
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
        'Group Data Test',
        `Total groups: ${groupData.length}\nUnfilled groups: ${unfilled.length}\nCheck console for details.`
      );
    } else {
      Alert.alert('Group Data Test', 'No group data available');
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

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }}>
        <FlatList
          ref={flatListRef}
          data={unselectedCleaners}
          ListHeaderComponent={() => (
            <>
              <Text style={{ marginBottom: 8, fontWeight: 'bold', alignSelf: 'center' }}>Selected Cleaners</Text>
              {selectedCleaners.map(cleaner => (
                <View key={cleaner._id} style={{ marginVertical: 10, marginHorizontal: 10 }}>
                  <CleanerCard item={cleaner} selected={true} />
                  
                </View>
              ))}
              {shouldShowPayButton && (
                <TouchableOpacity style={styles.payButton} onPress={handleProceedToGroupCheckout}>
                  <Text style={styles.payButtonText}>
                    Proceed to Checkout ({selectedCleaners.length} of {expectedCleaners})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.cleaner._id}
        />
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
});