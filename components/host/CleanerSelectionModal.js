// import React, { useState, useRef, useEffect } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Animated,
//   Easing,
//   StyleSheet,
//   Dimensions,
// } from "react-native";
// import COLORS from "../../constants/colors";

// const { width, height } = Dimensions.get("window");

// const CleanerSelectionModal = ({
//   groupModalVisible,
//   setGroupModalVisible,
//   groupData,
//   setGroupData,
//   addCleaner,
//   userService,
//   scheduleId,
//   groupedCleaners,
// }) => {
//   const slideAnimRefs = useRef({});
//   const [activeGroup, setActiveGroup] = useState(null);

//   // Initialize animation refs for groups
//   useEffect(() => {
//     groupData.forEach((item) => {
//       if (!slideAnimRefs.current[item.group]) {
//         slideAnimRefs.current[item.group] = new Animated.Value(0);
//       }
//     });
//   }, [groupData]);

//   const toggleReplace = (item) => {
//     setGroupData((prev) =>
//       prev.map((g) =>
//         g.group === item.group ? { ...g, replaceMode: !g.replaceMode } : g
//       )
//     );

//     setActiveGroup(item.replaceMode ? null : item.group);

//     Animated.timing(slideAnimRefs.current[item.group], {
//       toValue: item.replaceMode ? 0 : 1,
//       duration: 300,
//       easing: Easing.out(Easing.ease),
//       useNativeDriver: true,
//     }).start();
//   };

//   const formatGroupName = (name) => {
//     return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
//   };

//   const getGroupFee = (groupName) => {
//     const group = groupedCleaners.find(g => g.group === groupName);
//     return group?.group_cleaning_fee || 0;
//   };

//   const handleSelectCleaner = (cleaner, group) => {
//     addCleaner(cleaner);
//     userService.updateAssignedToID({
//       cleanerId: cleaner._id,
//       scheduleId,
//       selected_group: group,
//     });
//     setGroupData((prev) =>
//       prev.map((g) =>
//         g.group === group
//           ? { ...g, selectedCleaner: cleaner, replaceMode: false }
//           : g
//       )
//     );
//     setActiveGroup(null);
//   };

//   return (
//     <Modal
//       visible={groupModalVisible}
//       transparent
//       animationType="fade"
//       onRequestClose={() => setGroupModalVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.modalContainer}>
//           {/* Modern Header */}
//           <View style={styles.header}>
//             <View style={styles.headerContent}>
//               <Text style={styles.title}>Select Cleaners</Text>
//               <Text style={styles.subtitle}>Choose cleaners for each group</Text>
//             </View>
//             <TouchableOpacity
//               onPress={() => setGroupModalVisible(false)}
//               style={styles.closeButton}
//             >
//               <Text style={styles.closeIcon}>×</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.scrollContent}
//           >
//             {groupData.map((item, index) => (
//               <View key={item.group} style={styles.groupCard}>
//                 {/* Group Header */}
//                 <View style={styles.groupHeader}>
//                   <View style={styles.groupInfo}>
//                     <View style={styles.groupIndicator}>
//                       <Text style={styles.groupNumber}>{index + 1}</Text>
//                     </View>
//                     <View>
//                       <Text style={styles.groupTitle}>
//                         {formatGroupName(item.group)}
//                       </Text>
//                       <Text style={styles.groupFee}>
//                         ${getGroupFee(item.group)?.toFixed(2)}
//                       </Text>
//                     </View>
//                   </View>
//                   <View style={styles.groupStatus}>
//                     {item.selectedCleaner ? (
//                       <View style={styles.statusBadge}>
//                         <View style={[styles.statusDot, styles.statusSelected]} />
//                         <Text style={styles.statusText}>Selected</Text>
//                       </View>
//                     ) : (
//                       <View style={styles.statusBadge}>
//                         <View style={[styles.statusDot, styles.statusPending]} />
//                         <Text style={styles.statusText}>Pending</Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>

//                 {/* Selected Cleaner or Empty State */}
//                 {item.selectedCleaner ? (
//                   <View style={styles.selectedSection}>
//                     <View style={styles.selectedCleanerCard}>
//                       <View style={styles.cleanerInfo}>
//                         {item.selectedCleaner.avatar ? (
//                           <Image
//                             source={{ uri: item.selectedCleaner.avatar }}
//                             style={styles.avatar}
//                           />
//                         ) : (
//                           <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarText}>
//                               {item.selectedCleaner.firstname?.[0] || ''}
//                               {item.selectedCleaner.lastname?.[0] || ''}
//                             </Text>
//                           </View>
//                         )}
//                         <View style={styles.cleanerDetails}>
//                           <Text style={styles.cleanerName}>
//                             {item.selectedCleaner.firstname} {item.selectedCleaner.lastname}
//                           </Text>
//                           <Text style={styles.cleanerSpecialty}>
//                             Professional Cleaner
//                           </Text>
//                         </View>
//                       </View>
//                       {item.availableCleaners.length > 0 && (
//                         <TouchableOpacity 
//                           onPress={() => toggleReplace(item)}
//                           style={styles.replaceButton}
//                         >
//                           <Text style={styles.replaceButtonText}>
//                             {item.replaceMode ? "Cancel" : "Replace"}
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>

//                     {/* Replacement Options */}
//                     {item.replaceMode && (
//                       <Animated.View
//                         style={[
//                           styles.replacementSection,
//                           {
//                             transform: [
//                               {
//                                 translateY: slideAnimRefs.current[item.group]?.interpolate({
//                                   inputRange: [0, 1],
//                                   outputRange: [-10, 0],
//                                 }) || 0,
//                               },
//                             ],
//                             opacity: slideAnimRefs.current[item.group] || 1,
//                           },
//                         ]}
//                       >
//                         <Text style={styles.replacementTitle}>Available Cleaners</Text>
//                         {item.availableCleaners.map((cleaner) => (
//                           <TouchableOpacity
//                             key={cleaner._id}
//                             style={styles.replacementOption}
//                             onPress={() => handleSelectCleaner(cleaner, item.group)}
//                           >
//                             {cleaner.avatar ? (
//                               <Image
//                                 source={{ uri: cleaner.avatar }}
//                                 style={styles.optionAvatar}
//                               />
//                             ) : (
//                               <View style={styles.optionAvatarPlaceholder}>
//                                 <Text style={styles.optionAvatarText}>
//                                   {cleaner.firstname[0]}
//                                   {cleaner.lastname[0]}
//                                 </Text>
//                               </View>
//                             )}
//                             <View style={styles.optionDetails}>
//                               <Text style={styles.optionName}>
//                                 {cleaner.firstname} {cleaner.lastname}
//                               </Text>
//                               <Text style={styles.optionFee}>
//                                 ${cleaner.cleaning_fee?.toFixed(2)}
//                               </Text>
//                             </View>
//                             <View style={styles.selectBadge}>
//                               <Text style={styles.selectText}>Select</Text>
//                             </View>
//                           </TouchableOpacity>
//                         ))}
//                       </Animated.View>
//                     )}
//                   </View>
//                 ) : (
//                   /* No Cleaner Selected State */
//                   <View style={styles.emptyState}>
//                     <Text style={styles.emptyStateText}>No cleaner selected for this group</Text>
//                     <View style={styles.availableCleaners}>
//                       {item.availableCleaners.map((cleaner) => (
//                         <TouchableOpacity
//                           key={cleaner._id}
//                           style={styles.cleanerOption}
//                           onPress={() => handleSelectCleaner(cleaner, item.group)}
//                         >
//                           {cleaner.avatar ? (
//                             <Image
//                               source={{ uri: cleaner.avatar }}
//                               style={styles.optionAvatar}
//                             />
//                           ) : (
//                             <View style={styles.optionAvatarPlaceholder}>
//                               <Text style={styles.optionAvatarText}>
//                                 {cleaner.firstname[0]}
//                                 {cleaner.lastname[0]}
//                               </Text>
//                             </View>
//                           )}
//                           <View style={styles.optionDetails}>
//                             <Text style={styles.optionName}>
//                               {cleaner.firstname} {cleaner.lastname}
//                             </Text>
//                             <Text style={styles.optionFee}>
//                               ${cleaner.cleaning_fee?.toFixed(2)}
//                             </Text>
//                           </View>
//                           <View style={styles.selectBadge}>
//                             <Text style={styles.selectText}>Select</Text>
//                           </View>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   </View>
//                 )}
//               </View>
//             ))}
//           </ScrollView>

//           {/* Modern Footer */}
//           <View style={styles.footer}>
//             <TouchableOpacity
//               onPress={() => setGroupModalVisible(false)}
//               style={styles.doneButton}
//             >
//               <Text style={styles.doneButtonText}>Continue</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 24,
//     width: "100%",
//     maxHeight: "90%",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     padding: 24,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   headerContent: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: COLORS.primary,
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     fontWeight: "400",
//   },
//   closeButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#f8f8f8",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 16,
//   },
//   closeIcon: {
//     fontSize: 20,
//     color: "#666",
//     fontWeight: "300",
//   },
//   scrollContent: {
//     padding: 24,
//     paddingTop: 16,
//   },
//   groupCard: {
//     backgroundColor: "#fafafa",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   groupHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   groupInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   groupIndicator: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   groupNumber: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   groupTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   groupFee: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: "500",
//     marginTop: 2,
//   },
//   groupStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   statusDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 6,
//   },
//   statusSelected: {
//     backgroundColor: "#4CAF50",
//   },
//   statusPending: {
//     backgroundColor: "#FF9800",
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#666",
//   },
//   selectedSection: {
//     marginTop: 8,
//   },
//   selectedCleanerCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e8f5e8",
//     shadowColor: "#4CAF50",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cleanerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     marginRight: 12,
//   },
//   avatarPlaceholder: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   avatarText: {
//     fontSize: 16,
//     color: "#fff",
//     fontWeight: "600",
//   },
//   cleanerDetails: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   cleanerSpecialty: {
//     fontSize: 12,
//     color: "#666",
//   },
//   replaceButton: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   replaceButtonText: {
//     color: COLORS.primary,
//     fontWeight: "600",
//     fontSize: 12,
//   },
//   replacementSection: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#f0f0f0",
//   },
//   replacementTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#666",
//     marginBottom: 8,
//   },
//   replacementOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   emptyState: {
//     marginTop: 8,
//   },
//   emptyStateText: {
//     color: "#999",
//     fontSize: 14,
//     marginBottom: 12,
//     fontStyle: "italic",
//   },
//   availableCleaners: {
//     gap: 8,
//   },
//   cleanerOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   optionAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   optionAvatarPlaceholder: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   optionAvatarText: {
//     fontSize: 14,
//     color: "#fff",
//     fontWeight: "600",
//   },
//   optionDetails: {
//     flex: 1,
//   },
//   optionName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   optionFee: {
//     fontSize: 13,
//     color: COLORS.primary,
//     fontWeight: "500",
//   },
//   selectBadge: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   selectText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 12,
//   },
//   footer: {
//     padding: 24,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#f0f0f0",
//   },
//   doneButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   doneButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// export default CleanerSelectionModal;








import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import COLORS from "../../constants/colors";

const { width, height } = Dimensions.get("window");

const CleanerSelectionModal = ({
  groupModalVisible,
  setGroupModalVisible,
  groupData,
  setGroupData,
  addCleaner,
  userService,
  scheduleId,
  groupedCleaners,
  assignedTo,
  selectedCleaners, // Add selectedCleaners prop to get real-time updates
}) => {
  const slideAnimRefs = useRef({});
  const [activeGroup, setActiveGroup] = useState(null);

  // Sync modal state with parent's selectedCleaners in real-time
  useEffect(() => {
    if (!groupData.length || !selectedCleaners) return;

    // Update groupData based on current selectedCleaners
    const updatedGroupData = groupData.map(group => {
      // Find if any selected cleaner belongs to this group
      const selectedCleanerForGroup = selectedCleaners.find(cleaner => {
        const cleanerGroup = assignedTo?.find(a => 
          a.cleanerId === cleaner._id || 
          (a.acceptedCleaners && a.acceptedCleaners.includes(cleaner._id))
        )?.group;
        return cleanerGroup === group.group;
      });

      return {
        ...group,
        selectedCleaner: selectedCleanerForGroup || group.selectedCleaner,
      };
    });

    // Only update if there are actual changes to prevent infinite loops
    if (JSON.stringify(updatedGroupData) !== JSON.stringify(groupData)) {
      setGroupData(updatedGroupData);
    }
  }, [selectedCleaners, groupModalVisible]); // Update when selectedCleaners changes or modal opens

  // Initialize animation refs for groups
  useEffect(() => {
    groupData.forEach((item) => {
      if (!slideAnimRefs.current[item.group]) {
        slideAnimRefs.current[item.group] = new Animated.Value(0);
      }
    });
  }, [groupData]);

  const toggleReplace = (item) => {
    setGroupData((prev) =>
      prev.map((g) =>
        g.group === item.group ? { ...g, replaceMode: !g.replaceMode } : g
      )
    );

    setActiveGroup(item.replaceMode ? null : item.group);

    Animated.timing(slideAnimRefs.current[item.group], {
      toValue: item.replaceMode ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const formatGroupName = (name) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getGroupFee = (groupName) => {
    const group = groupedCleaners.find(g => g.group === groupName);
    return group?.group_cleaning_fee || 0;
  };

  const handleSelectCleaner = async (cleaner, group) => {
    try {
      // Update backend first
      await userService.updateAssignedToID({
        cleanerId: cleaner._id,
        scheduleId,
        selected_group: group,
      });

      // Then update the context (which will sync with parent)
      addCleaner(cleaner, assignedTo);

      // Update local modal state to reflect the change immediately
      setGroupData((prev) =>
        prev.map((g) =>
          g.group === group
            ? { 
                ...g, 
                selectedCleaner: cleaner, 
                replaceMode: false,
                availableCleaners: g.availableCleaners.filter(c => c._id !== cleaner._id)
              }
            : g
        )
      );
      
      setActiveGroup(null);
      
      console.log('✅ Cleaner selected in modal:', cleaner.firstname, 'for group:', group);
    } catch (error) {
      console.error('❌ Error selecting cleaner in modal:', error);
      Alert.alert('Error', 'Failed to select cleaner. Please try again.');
    }
  };

  const handleReplaceCleaner = async (newCleaner, group, oldCleaner) => {
    try {
      // Update backend first
      await userService.updateAssignedToID({
        cleanerId: newCleaner._id,
        scheduleId,
        selected_group: group,
      });

      // Then update the context for replacement
      addCleaner(newCleaner, assignedTo); // Using addCleaner which handles replacement

      // Update local modal state
      setGroupData((prev) =>
        prev.map((g) =>
          g.group === group
            ? { 
                ...g, 
                selectedCleaner: newCleaner,
                replaceMode: false,
                // Add the old cleaner back to available cleaners if it exists
                availableCleaners: [
                  ...g.availableCleaners.filter(c => c._id !== newCleaner._id),
                  ...(oldCleaner ? [oldCleaner] : [])
                ].filter(Boolean)
              }
            : g
        )
      );
      
      setActiveGroup(null);
      
      console.log('✅ Cleaner replaced in modal:', newCleaner.firstname, 'for group:', group);
    } catch (error) {
      console.error('❌ Error replacing cleaner in modal:', error);
      Alert.alert('Error', 'Failed to replace cleaner. Please try again.');
    }
  };

  // Check if all groups have selected cleaners
  const allGroupsFilled = groupData.every(group => group.selectedCleaner);

  return (
    <Modal
      visible={groupModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setGroupModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Modern Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Select Cleaners</Text>
              <Text style={styles.subtitle}>
                {allGroupsFilled ? 'All groups filled! 🎉' : 'Choose cleaners for each group'}
              </Text>
              <Text style={styles.selectedCount}>
                {selectedCleaners?.length || 0} of {groupData.length} cleaners selected
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setGroupModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {groupData.map((item, index) => (
              <View key={item.group} style={[
                styles.groupCard,
                item.selectedCleaner && styles.groupCardSelected
              ]}>
                {/* Group Header */}
                <View style={styles.groupHeader}>
                  <View style={styles.groupInfo}>
                    <View style={[
                      styles.groupIndicator,
                      item.selectedCleaner && styles.groupIndicatorSelected
                    ]}>
                      <Text style={styles.groupNumber}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.groupTitle}>
                        {formatGroupName(item.group)}
                      </Text>
                      <Text style={styles.groupFee}>
                        ${getGroupFee(item.group)?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.groupStatus}>
                    {item.selectedCleaner ? (
                      <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, styles.statusSelected]} />
                        <Text style={styles.statusText}>Selected</Text>
                      </View>
                    ) : (
                      <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, styles.statusPending]} />
                        <Text style={styles.statusText}>Pending</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Selected Cleaner or Empty State */}
                {item.selectedCleaner ? (
                  <View style={styles.selectedSection}>
                    <View style={styles.selectedCleanerCard}>
                      <View style={styles.cleanerInfo}>
                        {item.selectedCleaner.avatar ? (
                          <Image
                            source={{ uri: item.selectedCleaner.avatar }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {item.selectedCleaner.firstname?.[0] || ''}
                              {item.selectedCleaner.lastname?.[0] || ''}
                            </Text>
                          </View>
                        )}
                        <View style={styles.cleanerDetails}>
                          <Text style={styles.cleanerName}>
                            {item.selectedCleaner.firstname} {item.selectedCleaner.lastname}
                          </Text>
                          <Text style={styles.cleanerSpecialty}>
                            Professional Cleaner
                          </Text>
                        </View>
                      </View>
                      {item.availableCleaners.length > 0 && (
                        <TouchableOpacity 
                          onPress={() => toggleReplace(item)}
                          style={styles.replaceButton}
                        >
                          <Text style={styles.replaceButtonText}>
                            {item.replaceMode ? "Cancel" : "Replace"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Replacement Options */}
                    {item.replaceMode && (
                      <Animated.View
                        style={[
                          styles.replacementSection,
                          {
                            transform: [
                              {
                                translateY: slideAnimRefs.current[item.group]?.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-10, 0],
                                }) || 0,
                              },
                            ],
                            opacity: slideAnimRefs.current[item.group] || 1,
                          },
                        ]}
                      >
                        <Text style={styles.replacementTitle}>Available Cleaners</Text>
                        {item.availableCleaners.map((cleaner) => (
                          <TouchableOpacity
                            key={cleaner._id}
                            style={styles.replacementOption}
                            onPress={() => handleReplaceCleaner(cleaner, item.group, item.selectedCleaner)}
                          >
                            {cleaner.avatar ? (
                              <Image
                                source={{ uri: cleaner.avatar }}
                                style={styles.optionAvatar}
                              />
                            ) : (
                              <View style={styles.optionAvatarPlaceholder}>
                                <Text style={styles.optionAvatarText}>
                                  {cleaner.firstname[0]}
                                  {cleaner.lastname[0]}
                                </Text>
                              </View>
                            )}
                            <View style={styles.optionDetails}>
                              <Text style={styles.optionName}>
                                {cleaner.firstname} {cleaner.lastname}
                              </Text>
                              <Text style={styles.optionFee}>
                                ${cleaner.cleaning_fee?.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.selectBadge}>
                              <Text style={styles.selectText}>Replace</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </Animated.View>
                    )}
                  </View>
                ) : (
                  /* No Cleaner Selected State */
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No cleaner selected</Text>
                    <View style={styles.availableCleaners}>
                      {item.availableCleaners.map((cleaner) => (
                        <TouchableOpacity
                          key={cleaner._id}
                          style={styles.cleanerOption}
                          onPress={() => handleSelectCleaner(cleaner, item.group)}
                        >
                          {cleaner.avatar ? (
                            <Image
                              source={{ uri: cleaner.avatar }}
                              style={styles.optionAvatar}
                            />
                          ) : (
                            <View style={styles.optionAvatarPlaceholder}>
                              <Text style={styles.optionAvatarText}>
                                {cleaner.firstname[0]}
                                {cleaner.lastname[0]}
                              </Text>
                            </View>
                          )}
                          <View style={styles.optionDetails}>
                            <Text style={styles.optionName}>
                              {cleaner.firstname} {cleaner.lastname}
                            </Text>
                            <Text style={styles.optionFee}>
                              ${cleaner.cleaning_fee?.toFixed(2)}
                            </Text>
                          </View>
                          <View style={styles.selectBadge}>
                            <Text style={styles.selectText}>Select</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Modern Footer */}
          <View style={styles.footer}>
            <View style={styles.footerStats}>
              <Text style={styles.footerText}>
                {groupData.filter(g => g.selectedCleaner).length} of {groupData.length} groups filled
              </Text>
              {allGroupsFilled && (
                <Text style={styles.footerSuccess}>All set! Ready to continue 🎉</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setGroupModalVisible(false)}
              style={[
                styles.doneButton,
                allGroupsFilled && styles.doneButtonSuccess
              ]}
            >
              <Text style={styles.doneButtonText}>
                {allGroupsFilled ? 'Continue' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  selectedCount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  closeIcon: {
    fontSize: 20,
    color: "#666",
    fontWeight: "300",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  groupCard: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  groupCardSelected: {
    backgroundColor: "#f8faf8",
    borderColor: "#e8f5e8",
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupIndicatorSelected: {
    backgroundColor: COLORS.primary,
  },
  groupNumber: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  groupFee: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    marginTop: 2,
  },
  groupStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusSelected: {
    backgroundColor: "#4CAF50",
  },
  statusPending: {
    backgroundColor: "#FF9800",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  selectedSection: {
    marginTop: 8,
  },
  selectedCleanerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8f5e8",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cleanerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  cleanerDetails: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  cleanerSpecialty: {
    fontSize: 12,
    color: "#666",
  },
  replaceButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replaceButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  replacementSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  replacementTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  replacementOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emptyState: {
    marginTop: 8,
  },
  emptyStateText: {
    color: "#999",
    fontSize: 14,
    marginBottom: 12,
    fontStyle: "italic",
  },
  availableCleaners: {
    gap: 8,
  },
  cleanerOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  optionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  optionAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionAvatarText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  optionDetails: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  optionFee: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  selectBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerStats: {
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footerSuccess: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonSuccess: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CleanerSelectionModal; 









