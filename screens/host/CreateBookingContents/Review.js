// import React, { useContext, useEffect, useState } from 'react';
// import COLORS from '../../../constants/colors';
// import { TextInput, Checkbox, RadioButton, Card, Title, Subheading, Paragraph } from 'react-native-paper';
// import { View, Button, Text, StyleSheet, Pressable, FlatList, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import CircleIconButton1 from '../../../components/shared/CircleButton1';
// import CircleIconButton from '../../../components/shared/CircleButton';
// import BoxWithIcon3 from '../../../components/shared/BoxWithIcon3';
// import moment from 'moment';
// import CustomCard from '../../../components/shared/CustomCard';
// import { tSafe } from '../../../utils/tSafe'; // added import

// export default function Review({formData, step}) {

//   const regular_cleaning = [
//     { label: "Sweeping and Mopping", value: "Sweeping and Mopping" },
//     { label: "Vacuuming", value: "Vacuuming" },
//     { label: "Kitchen Cleaning", value: "Kitchen" },
//     { label: "Bathroom Cleaning", value: "Bathroom " },
//     { label: "Dishwashing", value: "Dishwashing" },
//     { label: "Trash Removal", value: "Trash Removal" },
//     { label: "Room Cleaning", value: "Room Cleaning" },
//     { label: "Livingroom", value: "Livingroom" },
//     { label: "Dusting", value: "Dusting" },
//     { label: "Window Cleaning", value: "Window Cleaning" },
//     { label: "Air Freshening", value: "Air Freshening" },
//     { label: "Appliance Cleaning", value: "Appliance Cleaning" },
//     { label: "Final Inspection", value: "Final Inspection" },
//   ];

//   const { width } = useWindowDimensions();
//   const numColumns = 3;
//   const numColumns2 = 2;
//   const columnWidth = width / numColumns - 28;
//   const columnWidth2 = width / numColumns2 - 10;

//   // 🔥 FIX: Format date properly (handle both YYYY-MM-DD and ISO format)
//   const formatCleaningDate = () => {
//     if (!formData.cleaning_date) return '';
    
//     let dateStr = formData.cleaning_date;
//     // If it's in ISO format, extract just the date part
//     if (typeof dateStr === 'string' && dateStr.includes('T')) {
//       dateStr = dateStr.split('T')[0];
//     }
    
//     try {
//       return moment(dateStr).format('ddd MMM D');
//     } catch (error) {
//       console.error('Error formatting date:', error);
//       return tSafe('invalid_date', 'Invalid Date');
//     }
//   };

//   // 🔥 FIX: Format time properly
//   const formatCleaningTime = () => {
//     if (!formData.cleaning_time) return '';
    
//     try {
//       return moment(formData.cleaning_time, 'HH:mm:ss').format('h:mm A');
//     } catch (error) {
//       console.error('Error formatting time:', error);
//       return tSafe('invalid_time', 'Invalid Time');
//     }
//   };

//   // 🔥 NEW: Calculate total tasks from checklist
//   const calculateTotalTasks = () => {
//     if (formData.checklistTasks && Array.isArray(formData.checklistTasks)) {
//       return formData.checklistTasks.length;
//     }
//     return regular_cleaning.length;
//   };

//   const getRoomInfo = (type) => {
//     const res = formData.selected_apt_room_type_and_size?.filter(room => room.type === type);
//     const room_ = res?.[0];
    
//     return room_
//       ? { type: room_.type, number: room_.number, size: room_.size, size_range: room_.size_range }
//       : null;
//   };

//   const bedroomInfo = getRoomInfo("Bedroom");
//   const bathroomInfo = getRoomInfo("Bathroom");
//   const kitchenInfo = getRoomInfo("Kitchen");
//   const livingroomInfo = getRoomInfo("Livingroom");

//   // 🔥 FIX: Task item renderer - handle both strings and objects
//   const taskItem = ({ item, index }) => {
//     // Handle both string (from checklistTasks) and object (from regular_cleaning)
//     let label = typeof item === 'string' ? item : item.label || item.value || 'Unknown Task';
//     // Translate the task label if it's one of the default ones (or any static text)
//     label = tSafe(`task_${label.toLowerCase().replace(/\s+/g, '_')}`, label);
    
//     return (
//       <View style={[styles.tasks, { width: columnWidth2 }]}>
//         <MaterialCommunityIcons 
//           name="checkbox-marked-circle" 
//           size={14} 
//           color={COLORS.primary} 
//           style={styles.taskIcon}
//         />
//         <Text style={styles.taskText}>{label}</Text>
//       </View>
//     );
//   };

//   // 🔥 NEW: Get tasks for display (prioritize checklist tasks)
//   const getTasksForDisplay = () => {
//     if (formData.checklistTasks && Array.isArray(formData.checklistTasks) && formData.checklistTasks.length > 0) {
//       return formData.checklistTasks;
//     }
//     return regular_cleaning;
//   };
  
//   console.log("sdgsd----fff", formData)
//   console.log("Form datttttttttaaatttat", JSON.stringify(formData, null, 2))
//   const handleEditStep = (sp) => {
//     step(sp);
//   };

//   return (
//     <ScrollView showsVerticalScrollIndicator={false}>
//       <View>
//         <Text style={styles.mainTitle}>{tSafe('review_schedule', 'Review Schedule')}</Text>
//         <Text style={styles.mainSubtitle}>
//           {tSafe('outline_tasks_instructions', 'Outline Specific Tasks and Instructions for the Cleaner')}
//         </Text>
      
//         {/* Apartment Details */}
//         <View style={styles.card}>
//           <View style={styles.title_edit}>
//             <Text style={styles.title}>{tSafe('apartment_details', 'Apartment Details')}</Text>
//             <MaterialCommunityIcons 
//               onPress={() => handleEditStep(1)} 
//               name='pencil' 
//               size={20} 
//               color={COLORS.primary} 
//             />
//           </View>
          
//           <Text style={styles.apartmentName}>{formData.apartment_name || tSafe('not_specified', 'Not specified')}</Text>
          
//           <View style={styles.addressContainer}>
//             <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
//             <Text style={styles.addressText}>
//               {formData.address || tSafe('no_address_provided', 'No address provided')}
//             </Text>
//           </View>
          
//           <View style={styles.roomsContainer}>
//             {bedroomInfo && (
//               <View style={styles.roomItem}>
//                 <MaterialCommunityIcons name="bed-empty" color={COLORS.gray} size={14} />
//                 <Text style={styles.roomText}>
//                   {bedroomInfo.number} {bedroomInfo.type}
//                 </Text>
//               </View>
//             )}
            
//             {bathroomInfo && (
//               <View style={styles.roomItem}>
//                 <MaterialCommunityIcons name="shower-head" color={COLORS.gray} size={14} />
//                 <Text style={styles.roomText}>
//                   {bathroomInfo.number} {bathroomInfo.type}
//                 </Text>
//               </View>
//             )}
            
//             {kitchenInfo && (
//               <View style={styles.roomItem}>
//                 <MaterialCommunityIcons name="silverware-fork-knife" color={COLORS.gray} size={14} />
//                 <Text style={styles.roomText}>
//                   {kitchenInfo.number} {kitchenInfo.type}
//                 </Text>
//               </View>
//             )}
            
//             {livingroomInfo && (
//               <View style={styles.roomItem}>
//                 <MaterialCommunityIcons name="seat-legroom-extra" color={COLORS.gray} size={14} />
//                 <Text style={styles.roomText}>
//                   {livingroomInfo.number} {livingroomInfo.type}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>

//         {/* Schedule Date & Time */}
//         <View style={styles.card}>
//           <View style={styles.title_edit}>
//             <Text style={styles.title}>{tSafe('schedule_date_time', 'Schedule Date & Time')}</Text>
//             <MaterialCommunityIcons 
//               onPress={() => handleEditStep(2)} 
//               name='pencil' 
//               size={20} 
//               color={COLORS.primary} 
//             />
//           </View>
           
//           <View style={styles.bed_bath}>
//             <View style={styles.sch_date_time}>
//               <View>
//                 <CircleIconButton iconName="calendar" iconSize={24}/>
//               </View>
//               <View>
//                 <Text style={styles.scheduleLabel}>{tSafe('date', 'Date')}</Text>
//                 <Text style={styles.scheduleValue}>
//                   {formatCleaningDate()}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.sch_date_time}>
//               <View>
//                 <CircleIconButton iconName="clock-outline" iconSize={24}/>
//               </View>
//               <View>
//                 <Text style={styles.scheduleLabel}>{tSafe('time', 'Time')}</Text>
//                 <Text style={styles.scheduleValue}>
//                   {formatCleaningTime()}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Cleaning Services */}
//         <View style={styles.card}>
//           <View style={styles.title_edit}>
//             <Text style={styles.title}>{tSafe('cleaning_services', 'Cleaning Services')}</Text>
//             <MaterialCommunityIcons 
//               onPress={() => handleEditStep(3)} 
//               name='pencil' 
//               size={20} 
//               color={COLORS.primary} 
//             />
//           </View>
         
//           {/* 🔥 FIX: Show selected checklist name */}
//           {formData.checklistName && (
//             <View style={styles.selectedChecklistContainer}>
//               <MaterialCommunityIcons 
//                 name="check-circle" 
//                 size={16} 
//                 color={COLORS.success} 
//                 style={styles.checkIcon}
//               />
//               <Text style={styles.checklistName}>
//                 {formData.checklistName}
//               </Text>
//             </View>
//           )}

//           {/* Tasks List */}
//           <View style={styles.tasksContainer}>
//             <FlatList
//               data={getTasksForDisplay()}
//               renderItem={taskItem}
//               keyExtractor={(item, index) => {
//                 if (typeof item === 'string') return `task-${item}-${index}`;
//                 return `task-${item.value || item.label}-${index}`;
//               }}
//               numColumns={2}
//               scrollEnabled={false}
//               showsVerticalScrollIndicator={false}
//             />
//           </View>

//           {/* Checklist Summary */}
//           <View style={styles.checklistSummary}>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>{tSafe('total_tasks', 'Total Tasks:')}</Text>
//               <Text style={styles.summaryValue}>
//                 {calculateTotalTasks()} {tSafe('tasks', 'tasks')}
//               </Text>
//             </View>
            
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>{tSafe('estimated_time', 'Estimated Time:')}</Text>
//               <Text style={styles.summaryValue}>
//                 {formData.total_cleaning_time || '--'} {tSafe('minutes', 'minutes')}
//               </Text>
//             </View>
            
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>{tSafe('total_fee', 'Total Fee:')}</Text>
//               <Text style={styles.totalFee}>${formData.total_cleaning_fee || '0.00'}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Additional Notes (if any) */}
//         {formData.additional_notes && (
//           <View style={styles.card}>
//             <View style={styles.title_edit}>
//               <Text style={styles.title}>{tSafe('additional_notes', 'Additional Notes')}</Text>
//             </View>
//             <Text style={styles.notesText}>
//               {formData.additional_notes}
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   mainTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   mainSubtitle: {
//     fontSize: 14,
//     marginBottom: 20,
//     color: COLORS.gray,
//   },
//   card: {
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   apartmentName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   addressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   addressText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.gray,
//     flex: 1,
//   },
//   roomsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   roomItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//     marginBottom: 4,
//   },
//   roomText: {
//     marginLeft: 6,
//     fontSize: 12,
//     color: COLORS.gray,
//   },
//   title_edit: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   bed_bath: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   sch_date_time: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   scheduleLabel: {
//     marginLeft: 10,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   scheduleValue: {
//     textAlign: 'left',
//     marginLeft: 10,
//     fontSize: 13,
//     color: COLORS.gray,
//   },
//   selectedChecklistContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F9F0',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   checkIcon: {
//     marginRight: 8,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   tasksContainer: {
//     marginTop: 8,
//   },
//   tasks: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 4,
//   },
//   taskIcon: {
//     marginRight: 8,
//   },
//   taskText: {
//     fontSize: 13,
//     color: COLORS.dark,
//     flex: 1,
//   },
//   checklistSummary: {
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
//   totalFee: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   notesText: {
//     fontSize: 14,
//     color: COLORS.dark,
//     lineHeight: 20,
//   },
// });






import React, {
  useContext,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

import { AuthContext } from '../../../context/AuthContext';
import { useTheme } from '../../../theme';
import { tSafe } from '../../../utils/tSafe';

export default function Review({
  formData,
  step,
}) {
  const { currency } =
    useContext(AuthContext);

  const {
    theme,
  } = useTheme();

  const { width } =
    useWindowDimensions();

  const styles =
    createStyles(theme);

  /*
   * ============================================================
   * DEFAULT CLEANING TASKS
   * ============================================================
   */

  const regularCleaning = useMemo(
    () => [
      {
        label:
          'Sweeping and Mopping',
        value:
          'Sweeping and Mopping',
      },
      {
        label: 'Vacuuming',
        value: 'Vacuuming',
      },
      {
        label: 'Kitchen Cleaning',
        value: 'Kitchen',
      },
      {
        label: 'Bathroom Cleaning',
        value: 'Bathroom',
      },
      {
        label: 'Dishwashing',
        value: 'Dishwashing',
      },
      {
        label: 'Trash Removal',
        value: 'Trash Removal',
      },
      {
        label: 'Room Cleaning',
        value: 'Room Cleaning',
      },
      {
        label: 'Livingroom',
        value: 'Livingroom',
      },
      {
        label: 'Dusting',
        value: 'Dusting',
      },
      {
        label: 'Window Cleaning',
        value: 'Window Cleaning',
      },
      {
        label: 'Air Freshening',
        value: 'Air Freshening',
      },
      {
        label: 'Appliance Cleaning',
        value: 'Appliance Cleaning',
      },
      {
        label: 'Final Inspection',
        value: 'Final Inspection',
      },
    ],
    []
  );

  /*
   * ============================================================
   * RESPONSIVE TASK COLUMN WIDTH
   * ============================================================
   */

  const taskColumnWidth =
    Math.max(
      0,
      width / 2 - 32
    );

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  const formatCleaningDate =
    () => {
      if (
        !formData?.cleaning_date
      ) {
        return tSafe(
          'not_selected',
          'Not selected'
        );
      }

      try {
        let dateStr =
          formData.cleaning_date;

        if (
          typeof dateStr !==
          'string'
        ) {
          dateStr = String(
            dateStr
          );
        }

        if (
          dateStr.includes('T')
        ) {
          dateStr =
            dateStr.split('T')[0];
        }

        const parsed =
          moment(
            dateStr,
            'YYYY-MM-DD',
            true
          );

        if (!parsed.isValid()) {
          return tSafe(
            'invalid_date',
            'Invalid Date'
          );
        }

        return parsed.format(
          'ddd, MMM D'
        );
      } catch (error) {
        console.error(
          'Review: Error formatting date:',
          error
        );

        return tSafe(
          'invalid_date',
          'Invalid Date'
        );
      }
    };

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */

  const formatCleaningTime =
    () => {
      if (
        !formData?.cleaning_time
      ) {
        return tSafe(
          'not_selected',
          'Not selected'
        );
      }

      try {
        const parsed =
          moment(
            formData.cleaning_time,
            [
              'HH:mm:ss',
              'HH:mm',
            ],
            true
          );

        if (!parsed.isValid()) {
          return tSafe(
            'invalid_time',
            'Invalid Time'
          );
        }

        return parsed.format(
          'h:mm A'
        );
      } catch (error) {
        console.error(
          'Review: Error formatting time:',
          error
        );

        return tSafe(
          'invalid_time',
          'Invalid Time'
        );
      }
    };

  /*
   * ============================================================
   * ROOM INFORMATION
   * ============================================================
   */

  const getRoomInfo = (
    type
  ) => {
    const rooms =
      Array.isArray(
        formData
          ?.selected_apt_room_type_and_size
      )
        ? formData.selected_apt_room_type_and_size
        : [];

    const room =
      rooms.find(
        (item) =>
          item?.type === type
      );

    if (!room) {
      return null;
    }

    return {
      type: room.type,
      number: room.number,
      size: room.size,
      size_range:
        room.size_range,
    };
  };

  const bedroomInfo =
    getRoomInfo('Bedroom');

  const bathroomInfo =
    getRoomInfo('Bathroom');

  const kitchenInfo =
    getRoomInfo('Kitchen');

  const livingroomInfo =
    getRoomInfo('Livingroom');

  /*
   * ============================================================
   * TASKS
   * ============================================================
   */

  const getTasksForDisplay =
    () => {
      if (
        Array.isArray(
          formData?.checklistTasks
        ) &&
        formData.checklistTasks
          .length > 0
      ) {
        return formData.checklistTasks;
      }

      return regularCleaning;
    };

  const tasksForDisplay =
    getTasksForDisplay();

  const totalTasks =
    tasksForDisplay.length;

  /*
   * ============================================================
   * TASK LABEL
   * ============================================================
   */

  const getTaskLabel = (
    item
  ) => {
    let label =
      typeof item === 'string'
        ? item
        : item?.label ||
          item?.value ||
          tSafe(
            'unknown_task',
            'Unknown Task'
          );

    const translationKey =
      `task_${label
        .toLowerCase()
        .replace(
          /\s+/g,
          '_'
        )}`;

    return tSafe(
      translationKey,
      label
    );
  };

  /*
   * ============================================================
   * EDIT STEP
   * ============================================================
   */

  const handleEditStep = (
    selectedStep
  ) => {
    if (
      typeof step === 'function'
    ) {
      step(selectedStep);
    }
  };

  /*
   * ============================================================
   * ROOM DATA
   * ============================================================
   */

  const roomItems = [
    {
      key: 'bedroom',
      icon: 'bed-empty',
      data: bedroomInfo,
    },
    {
      key: 'bathroom',
      icon: 'shower-head',
      data: bathroomInfo,
    },
    {
      key: 'kitchen',
      icon: 'silverware-fork-knife',
      data: kitchenInfo,
    },
    {
      key: 'livingroom',
      icon: 'seat-legroom-extra',
      data: livingroomInfo,
    },
  ].filter(
    (item) => item.data
  );

  /*
   * ============================================================
   * MONEY FORMATTING
   * ============================================================
   */

  const formatMoney = (
    value
  ) => {
    const numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      return `${currency || '$'}0.00`;
    }

    return `${currency || '$'}${numericValue.toFixed(
      2
    )}`;
  };

  /*
   * ============================================================
   * TASK RENDERER
   * ============================================================
   */

  const renderTaskItem = ({
    item,
    index,
  }) => {
    return (
      <View
        style={[
          styles.taskItem,
          {
            width:
              taskColumnWidth,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="check-circle"
          size={16}
          color={
            theme.status.success
          }
          style={
            styles.taskIcon
          }
        />

        <Text
          style={styles.taskText}
        >
          {getTaskLabel(item)}
        </Text>
      </View>
    );
  };

  /*
   * ============================================================
   * REUSABLE EDIT BUTTON
   * ============================================================
   */

  const EditButton = ({
    onPress,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }}
      style={
        styles.editButton
      }
    >
      <MaterialCommunityIcons
        name="pencil-outline"
        size={18}
        color={
          theme.brand.primary
        }
      />

      <Text
        style={
          styles.editButtonText
        }
      >
        {tSafe(
          'edit',
          'Edit'
        )}
      </Text>
    </TouchableOpacity>
  );

  /*
   * ============================================================
   * SECTION HEADER
   * ============================================================
   */

  const SectionHeader = ({
    title,
    stepNumber,
  }) => (
    <View
      style={
        styles.sectionHeader
      }
    >
      <View
        style={
          styles.sectionTitleRow
        }
      >
        <View
          style={
            styles.stepBadge
          }
        >
          <Text
            style={
              styles.stepBadgeText
            }
          >
            {stepNumber}
          </Text>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>
      </View>

      <EditButton
        onPress={() =>
          handleEditStep(
            stepNumber
          )
        }
      />
    </View>
  );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <ScrollView
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.scrollContent
      }
    >
      <View
        style={styles.container}
      >
        {/* ====================================================
            HEADER
            ==================================================== */}

        <View
          style={
            styles.pageHeader
          }
        >
          <View
            style={
              styles.headerIcon
            }
          >
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={28}
              color={
                theme.brand.primary
              }
            />
          </View>

          <Text
            style={
              styles.mainTitle
            }
          >
            {tSafe(
              'review_schedule',
              'Review Schedule'
            )}
          </Text>

          <Text
            style={
              styles.mainSubtitle
            }
          >
            {tSafe(
              'outline_tasks_instructions',
              'Review the cleaning details before continuing.'
            )}
          </Text>
        </View>

        {/* ====================================================
            APARTMENT DETAILS
            ==================================================== */}

        <View
          style={styles.card}
        >
          <SectionHeader
            title={tSafe(
              'apartment_details',
              'Apartment Details'
            )}
            stepNumber={1}
          />

          <View
            style={
              styles.propertyHero
            }
          >
            <View
              style={
                styles.propertyIcon
              }
            >
              <MaterialCommunityIcons
                name="home-outline"
                size={24}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <View
              style={
                styles.propertyContent
              }
            >
              <Text
                style={
                  styles.apartmentName
                }
              >
                {formData?.apartment_name ||
                  tSafe(
                    'not_specified',
                    'Not specified'
                  )}
              </Text>

              <View
                style={
                  styles.addressContainer
                }
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={
                    theme.icon.muted
                  }
                />

                <Text
                  style={
                    styles.addressText
                  }
                >
                  {formData?.address ||
                    tSafe(
                      'no_address_provided',
                      'No address provided'
                    )}
                </Text>
              </View>
            </View>
          </View>

          {roomItems.length >
            0 && (
            <View
              style={
                styles.roomsContainer
              }
            >
              {roomItems.map(
                (room) => (
                  <View
                    key={
                      room.key
                    }
                    style={
                      styles.roomItem
                    }
                  >
                    <MaterialCommunityIcons
                      name={
                        room.icon
                      }
                      size={17}
                      color={
                        theme.icon.muted
                      }
                    />

                    <Text
                      style={
                        styles.roomText
                      }
                    >
                      {room.data.number}{' '}
                      {room.data.type}
                    </Text>
                  </View>
                )
              )}
            </View>
          )}
        </View>

        {/* ====================================================
            DATE & TIME
            ==================================================== */}

        <View
          style={styles.card}
        >
          <SectionHeader
            title={tSafe(
              'schedule_date_time',
              'Schedule Date & Time'
            )}
            stepNumber={2}
          />

          <View
            style={
              styles.scheduleGrid
            }
          >
            {/* DATE */}

            <View
              style={
                styles.scheduleItem
              }
            >
              <View
                style={
                  styles.scheduleIcon
                }
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={22}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={
                  styles.scheduleContent
                }
              >
                <Text
                  style={
                    styles.scheduleLabel
                  }
                >
                  {tSafe(
                    'date',
                    'Date'
                  )}
                </Text>

                <Text
                  style={
                    styles.scheduleValue
                  }
                >
                  {formatCleaningDate()}
                </Text>
              </View>
            </View>

            {/* TIME */}

            <View
              style={
                styles.scheduleItem
              }
            >
              <View
                style={
                  styles.scheduleIcon
                }
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={22}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={
                  styles.scheduleContent
                }
              >
                <Text
                  style={
                    styles.scheduleLabel
                  }
                >
                  {tSafe(
                    'time',
                    'Time'
                  )}
                </Text>

                <Text
                  style={
                    styles.scheduleValue
                  }
                >
                  {formatCleaningTime()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ====================================================
            CLEANING SERVICES
            ==================================================== */}

        <View
          style={styles.card}
        >
          <SectionHeader
            title={tSafe(
              'cleaning_services',
              'Cleaning Services'
            )}
            stepNumber={3}
          />

          {/* SELECTED CHECKLIST */}

          {formData?.checklistName && (
            <View
              style={
                styles.checklistBanner
              }
            >
              <View
                style={
                  styles.checklistIcon
                }
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={
                    theme.status
                      .success
                  }
                />
              </View>

              <View
                style={
                  styles.checklistContent
                }
              >
                <Text
                  style={
                    styles.checklistLabel
                  }
                >
                  {tSafe(
                    'selected_checklist',
                    'Selected Checklist'
                  )}
                </Text>

                <Text
                  style={
                    styles.checklistName
                  }
                >
                  {
                    formData.checklistName
                  }
                </Text>
              </View>
            </View>
          )}

          {/* TASK HEADER */}

          <View
            style={
              styles.tasksHeader
            }
          >
            <View>
              <Text
                style={
                  styles.tasksTitle
                }
              >
                {tSafe(
                  'cleaning_tasks',
                  'Cleaning Tasks'
                )}
              </Text>

              <Text
                style={
                  styles.tasksSubtitle
                }
              >
                {totalTasks}{' '}
                {tSafe(
                  'tasks',
                  'tasks'
                )}
              </Text>
            </View>

            <View
              style={
                styles.taskCountBadge
              }
            >
              <MaterialCommunityIcons
                name="format-list-checks"
                size={17}
                color={
                  theme.brand.primary
                }
              />

              <Text
                style={
                  styles.taskCountText
                }
              >
                {totalTasks}
              </Text>
            </View>
          </View>

          {/* TASK LIST */}

          {tasksForDisplay.length >
          0 ? (
            <FlatList
              data={
                tasksForDisplay
              }
              renderItem={
                renderTaskItem
              }
              keyExtractor={(
                item,
                index
              ) => {
                const value =
                  typeof item ===
                  'string'
                    ? item
                    : item?.value ||
                      item?.label ||
                      'task';

                return `task-${value}-${index}`;
              }}
              numColumns={2}
              scrollEnabled={
                false
              }
              columnWrapperStyle={
                styles.taskRow
              }
              showsVerticalScrollIndicator={
                false
              }
            />
          ) : (
            <View
              style={
                styles.emptyTasks
              }
            >
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={28}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.emptyTasksText
                }
              >
                {tSafe(
                  'no_tasks',
                  'No cleaning tasks selected'
                )}
              </Text>
            </View>
          )}

          {/* SUMMARY */}

          <View
            style={
              styles.checklistSummary
            }
          >
            <View
              style={
                styles.summaryHeader
              }
            >
              <Text
                style={
                  styles.summaryHeaderTitle
                }
              >
                {tSafe(
                  'service_summary',
                  'Service Summary'
                )}
              </Text>
            </View>

            <View
              style={
                styles.summaryRow
              }
            >
              <View
                style={
                  styles.summaryLabelContainer
                }
              >
                <MaterialCommunityIcons
                  name="format-list-numbered"
                  size={17}
                  color={
                    theme.icon.muted
                  }
                />

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  {tSafe(
                    'total_tasks',
                    'Total Tasks'
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {totalTasks}
              </Text>
            </View>

            <View
              style={
                styles.summaryRow
              }
            >
              <View
                style={
                  styles.summaryLabelContainer
                }
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={17}
                  color={
                    theme.icon.muted
                  }
                />

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  {tSafe(
                    'estimated_time',
                    'Estimated Time'
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {formData?.total_cleaning_time ||
                  '--'}{' '}
                {tSafe(
                  'minutes',
                  'minutes'
                )}
              </Text>
            </View>

            <View
              style={[
                styles.summaryRow,
                styles.totalRow,
              ]}
            >
              <View
                style={
                  styles.summaryLabelContainer
                }
              >
                <MaterialCommunityIcons
                  name="cash"
                  size={18}
                  color={
                    theme.brand.primary
                  }
                />

                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  {tSafe(
                    'total_fee',
                    'Total Fee'
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.totalFee
                }
              >
                {formatMoney(
                  formData?.total_cleaning_fee
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            ADDITIONAL NOTES
            ==================================================== */}

        {formData?.additional_notes && (
          <View
            style={styles.card}
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View
                style={
                  styles.sectionTitleRow
                }
              >
                <View
                  style={
                    styles.stepBadge
                  }
                >
                  <MaterialCommunityIcons
                    name="note-text-outline"
                    size={17}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  {tSafe(
                    'additional_notes',
                    'Additional Notes'
                  )}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.notesContainer
              }
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.notesText
                }
              >
                {
                  formData.additional_notes
                }
              </Text>
            </View>
          </View>
        )}

        {/* ====================================================
            FINAL REVIEW INDICATOR
            ==================================================== */}

        <View
          style={
            styles.readyBanner
          }
        >
          <View
            style={
              styles.readyIcon
            }
          >
            <MaterialCommunityIcons
              name="check"
              size={18}
              color={
                theme.text.inverse
              }
            />
          </View>

          <View
            style={
              styles.readyContent
            }
          >
            <Text
              style={
                styles.readyTitle
              }
            >
              {tSafe(
                'review_ready',
                'Ready to Continue'
              )}
            </Text>

            <Text
              style={
                styles.readyText
              }
            >
              {tSafe(
                'review_ready_description',
                'Review the information above and edit any section if needed.'
              )}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/*
 * ==============================================================
 * THEME-AWARE STYLES
 * ==============================================================
 */

const createStyles = (
  theme
) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 32,
    },

    container: {
      width: '100%',
    },

    /*
     * Page header
     */

    pageHeader: {
      marginBottom: 18,
    },

    headerIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginBottom: 12,
    },

    mainTitle: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },

    mainSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
      color: theme.text.secondary,
    },

    /*
     * Cards
     */

    card: {
      padding: 16,
      marginBottom: 12,
      borderRadius: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,

      shadowColor:
        theme.shadow?.color ||
        '#000000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity:
        theme.shadow?.opacity ||
        0.08,
      shadowRadius: 8,
      elevation: 2,
    },

    /*
     * Section header
     */

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 16,
    },

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    stepBadge: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 10,
    },

    stepBadgeText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      flexShrink: 1,
    },

    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 7,
      borderRadius: 8,
    },

    editButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.brand.primary,
      marginLeft: 4,
    },

    /*
     * Property
     */

    propertyHero: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.elevated,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor:
        theme.divider,
    },

    propertyIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 12,
    },

    propertyContent: {
      flex: 1,
    },

    apartmentName: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
    },

    addressContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    addressText: {
      marginLeft: 5,
      fontSize: 13,
      lineHeight: 18,
      color: theme.text.secondary,
      flex: 1,
    },

    roomsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
      gap: 8,
    },

    roomItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 9,
      paddingVertical: 7,
      paddingHorizontal: 10,
    },

    roomText: {
      marginLeft: 5,
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
    },

    /*
     * Schedule
     */

    scheduleGrid: {
      flexDirection: 'row',
      gap: 10,
    },

    scheduleItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.elevated,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor:
        theme.divider,
    },

    scheduleIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 9,
    },

    scheduleContent: {
      flex: 1,
    },

    scheduleLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: theme.text.muted,
      marginBottom: 2,
    },

    scheduleValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
    },

    /*
     * Checklist
     */

    checklistBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.status.success +
        '18',
      borderWidth: 1,
      borderColor:
        theme.status.success +
        '40',
      borderRadius: 13,
      padding: 12,
      marginBottom: 16,
    },

    checklistIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.success +
        '20',
      marginRight: 10,
    },

    checklistContent: {
      flex: 1,
    },

    checklistLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.status.success,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },

    checklistName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
    },

    /*
     * Tasks
     */

    tasksHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 10,
    },

    tasksTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
    },

    tasksSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 2,
    },

    taskCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 9,
      gap: 5,
    },

    taskCountText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    taskRow: {
      justifyContent:
        'space-between',
    },

    taskItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 7,
      paddingHorizontal: 4,
      minHeight: 32,
    },

    taskIcon: {
      marginRight: 7,
      marginTop: 1,
    },

    taskText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.text.primary,
      flex: 1,
    },

    emptyTasks: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      backgroundColor:
        theme.background.sunken,
      borderRadius: 12,
    },

    emptyTasksText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 8,
    },

    /*
     * Service summary
     */

    checklistSummary: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
    },

    summaryHeader: {
      marginBottom: 8,
    },

    summaryHeaderTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingVertical: 8,
    },

    summaryLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    summaryLabel: {
      fontSize: 13,
      color: theme.text.secondary,
      marginLeft: 8,
    },

    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
    },

    totalRow: {
      marginTop: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
    },

    totalLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
      marginLeft: 8,
    },

    totalFee: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    /*
     * Notes
     */

    notesContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 12,
      padding: 13,
    },

    notesText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 21,
      color: theme.text.primary,
      marginLeft: 9,
    },

    /*
     * Ready banner
     */

    readyBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      borderRadius: 16,
      padding: 14,
      marginTop: 2,
      borderWidth: 1,
      borderColor:
        theme.brand.primary,
    },

    readyIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primary,
      marginRight: 10,
    },

    readyContent: {
      flex: 1,
    },

    readyTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 2,
    },

    readyText: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },
  });