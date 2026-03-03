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

// export default function Review({formData, step}) {

//   const regular_cleaning = [
//     {
//         "label":"Sweeping and Mopping",
//         "value":"Sweeping and Mopping",
//     },
//     {
//         "label":"Vacuuming",
//         "value":"Vacuuming"
//     },
//     {
//         "label":"Kitchen Cleaning",
//         "value":"Kitchen"
//     },
//     {
//         "label":"Bathroom Cleaning",
//         "value":"Bathroom "
//     },
//     {
//         "label":"Dishwashing",
//         "value":"Dishwashing"
//     },
//     {
//         "label":"Trash Removal",
//         "value":"Trash Removal"
//     },
//     {
//         "label":"Room Cleaning",
//         "value":"Room Cleaning"
//     },
//     {
//         "label":"Livingroom",
//         "value":"Livingroom"
//     },
//     {
//       "label":"Dusting",
//       "value":"Dusting"
//     },
//     {
//         "label":"Window Cleaning",
//         "value":"Window Cleaning"
//     },
//     {
//         "label":"Air Freshening",
//         "value":"Air Freshening"
//     },
//     {
//         "label":"Appliance Cleaning",
//         "value":"Appliance Cleaning"
//     },
//     {
//         "label":"Final Inspection",
//         "value":"Final Inspection"
//     },
    
// ]

// const calculateTotalTasks = (checklist) => {
//   let totalTasks = 0;
//   if (checklist && checklist.checklist) {
//     Object.values(checklist.checklist).forEach(group => {
//       Object.values(group.details).forEach(room => {
//         if (room.tasks) totalTasks += room.tasks.length;
//       });
//     });
//   }
//   return totalTasks;
// };

// const getRoomInfo = (type) => {
    
//   const res = formData.selected_apt_room_type_and_size.filter(room => room.type === type);
//   console.log("pee......1")
//   console.log(res[0])
//   const room_ = res[0]

//   return room_
//   ? { type: room_.type, number: room_.number, size: room_.size, size_range:room_.size_range }
//   : null;
// };

// console.log("My review form data", formData)

// const bedroomInfo = getRoomInfo("Bedroom");
// const bathroomInfo = getRoomInfo("Bathroom");
// const kitchenInfo = getRoomInfo("Kitchen");
// const livingroomInfo = getRoomInfo("Livingroom");


// const { width } = useWindowDimensions();
//     const numColumns = 3;
//     const numColumns2 = 2
//     const columnWidth = width / numColumns - 28; // Adjusted width to accommodate margins
//     const columnWidth2 = width / numColumns2 - 10; // Adjusted width to accommodate margins


// const taskItem = ( {item,index} ) => (
//   <View style={[styles.tasks, { width: columnWidth2 }]}>
//       <Text style={{fontSize:13}}>{item.label} </Text>
//   </View>
  
// )

// const singleItem = ( {item,index} ) => (
//   <BoxWithIcon3 
//       item={item}
//       iconName={item.icon}
//       price={item.price}
//       color="primary"
//       columnWidth={columnWidth}
      
//   />
// )

// const handleEditStep = (sp) => {
//   step(sp)
// }


//   return (
//     <ScrollView showsVerticalScrollIndicator={false}>
//     <View>
//       <Text bold style={{fontSize:24, }}>Review Schedule</Text>
//       <Text style={{fontSize:14, marginBottom:20, color:COLORS.gray}}>Outline Specific Tasks and Instructions for the Cleaner</Text>
    
//        <View style={styles.card}>
//         {/* <Card.Content> */}
//           <View style={styles.title_edit}>
//             <Text style={styles.title}>Apartment Details</Text>
//             <MaterialCommunityIcons onPress={() => handleEditStep(1)} name='pencil' size={20} color={COLORS.primary} />
//           </View>
//           <Text bold style={{fontSize:14}}>{formData.apartment_name}</Text>
//           <Paragraph style={styles.paragraph}><MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />{formData.address}</Paragraph>
//           <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center', marginTop:5}}>
//           <Text style={{fontSize:12}}><MaterialCommunityIcons name="bed-empty" color={COLORS.gray} size={14} /> {bedroomInfo?.number} {bedroomInfo?.type}</Text>
//           <Text style={{fontSize:12, marginLeft:20}}><MaterialCommunityIcons name="shower-head" color={COLORS.gray} size={14} /> {bathroomInfo?.number} {bathroomInfo?.type}</Text>
//           <Text style={{fontSize:12, marginLeft:20}}><MaterialCommunityIcons name="silverware-fork-knife" color={COLORS.gray} size={14} /> {kitchenInfo?.number}{kitchenInfo?.type}</Text>
//           <Text style={{fontSize:12, marginLeft:20}}><MaterialCommunityIcons name="seat-legroom-extra" color={COLORS.gray} size={14} /> {livingroomInfo?.number}{livingroomInfo?.type}</Text>
//           </View>
//       </View>


//       <View style={styles.card}>
//         {/* <Card.Content> */}
//         <View style={styles.title_edit}>
//           <Text style={styles.title}>Schedule Date & time</Text>
//           <MaterialCommunityIcons onPress={() => handleEditStep(2)} name='pencil' size={20} color={COLORS.primary} />
//         </View>
         
         
//           <View style={styles.bed_bath}>
//             <View style={styles.sch_date_time}>
//               <View>
//                 <CircleIconButton iconName="calendar" iconSize={24}/>
//               </View>
//               <View>
//                 <Text bold style={{marginLeft:10}}>Date</Text>
//                 <Text style={{textAlign:'left', marginLeft:10, fontSize:13, color:COLORS.gray}}>{moment(formData.cleaning_date).format('ddd MMM D')}</Text>
//               </View>
//             </View>
//             <View style={styles.sch_date_time}>
//               <View>
//                 <CircleIconButton iconName="clock-outline" iconSize={24}/>
//               </View>
//               <View>
//                 <Text bold style={{marginLeft:10}}>Time</Text>
//                 <Text style={{textAlign:'left.', marginLeft:10, fontSize:13, color:COLORS.gray}}>{moment(formData.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
//               </View>
//             </View>
//           </View>
//         {/* </Card.Content> */}
//       </View>

      

//       <View style={styles.card}>
//           <View style={styles.title_edit}>
//             <Text style={styles.title}>Base Cleaning Services</Text>
//             {/* <MaterialCommunityIcons onPress={() => handleEditStep(3)} name='pencil' size={20} color={COLORS.primary} /> */}
//           </View>
         
//           <View style={styles.bed_bath}>
//           <FlatList
//               data={regular_cleaning}
//               renderItem = {taskItem}
//                   ListHeaderComponentStyle={styles.list_header}
//                   keyExtractor={(item, index)=> item.label}
//                   numColumns={2}
//                   showsVerticalScrollIndicator={false}
//           />
//           </View>


//           <View style={styles.checklistOptions}>
//                       {formData.checklists.map((checklist) => (
//                         <TouchableOpacity
//                           key={checklist._id}
//                           style={[
//                             styles.checklistOption,
//                             // selectedChecklistId === checklist._id && styles.selectedChecklist
//                           ]}
                    
//                         >
                          
//                           <View style={styles.checklistInfo}>
//                             <Text style={styles.checklistName}>
//                               {formData.checklistName}
//                               {/* {checklist.default_checklist && (
//                                 <Text style={styles.defaultBadge}> (Default)</Text>
//                               )} */}
//                             </Text>
//                             <Text style={styles.checklistDetails}>
//                               {/* {Object.keys(checklist.checklist).length} group(s) · 
//                               ${checklist.totalFee} ·  */}

//                               {calculateTotalTasks(formData.checklistTasks)} tasks
//                             </Text>
//                             <Text>${formData.total_cleaning_fee}</Text>
//                           </View>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//       </View>

//       {/* {formData.extra.length > 0 &&
      
//         (
          
//            <CustomCard>
//               <View style={styles.title_edit}>
//                 <Text style={styles.title}>Extra Cleaning Services</Text>
//                 <MaterialCommunityIcons onPress={() => handleEditStep(3)} name='pencil' size={20} color={COLORS.primary} />
//               </View>
            
//               <View>
//               <FlatList 
//                     data = {formData.extra}
//                     renderItem = {singleItem}
//                     ListHeaderComponentStyle={styles.list_header}
//                     // ListEmptyComponent= {emptyListing}
//                     // ItemSeparatorComponent={itemSeparator}
//                     keyExtractor={(item, index)=> item.value}
//                     numColumns={numColumns}
//                     key={numColumns}
//                     showsVerticalScrollIndicator={false}
//                 />
//               </View>
//             </CustomCard>
        
//         )
//       } */}

//     </View>
//     </ScrollView>
//   )
// }


// const styles = StyleSheet.create({
//   card: {
//       padding: 15,
//       marginVertical: 8,
//       marginHorizontal:0,
//       borderRadius: 8,
//       backgroundColor: '#fff',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 3,
//   },
//   title: {
//     fontSize: 16, // Customize title font size
//     fontWeight: 'bold', // Customize title font weight
//     marginBottom:5
//     // Add more title styles as needed
//   },
//   subtitle: {
//     fontSize: 13, // Customize title font size
//     // fontWeight: 'bold', // Customize title font weight
//     // Add more title styles as needed
//   },

//   paragraph: {
//     fontSize: 14, // Customize paragraph font size
//     color:COLORS.gray
//     // Add more paragraph styles as needed
//   },
//   bed_bath:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     alignItems:'center',
//     marginTop:0
//   },
//   bedroom:{
//     flexDirection:'row',
//     justifyContent:'space-around',
//     alignItems:'center',
//     marginTop:0
//   },
//   sch_date_time:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     alignItems:'center',
//     marginTop:0
//   },
//   bathroom:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     alignItems:'center',
//     marginTop:-15
//   },
//   title_edit:{
//     flexDirection:'row',
//     justifyContent:'space-between',
    
//   },
//   checklistOptions: {
//     gap: 12,
//     marginTop: 8,
//   },
//   checklistOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 12,
//     backgroundColor: COLORS.lightGray,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   selectedChecklist: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primaryLight,
//   },
//   checklistInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   checklistDetails: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   noChecklistContainer: {
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: COLORS.light_gray,
//     borderRadius: 12,
//   },
//   noChecklistText: {
//     marginBottom: 16,
//     fontSize: 16,
//     color: COLORS.dark,
//     textAlign: 'center',
//   },
//   createChecklistButton: {
//     borderColor: COLORS.primary,
//     width: '80%',
//   },
// })


import React, { useContext, useEffect, useState } from 'react';
import COLORS from '../../../constants/colors';
import { TextInput, Checkbox, RadioButton, Card, Title, Subheading, Paragraph } from 'react-native-paper';
import { View, Button, Text, StyleSheet, Pressable, FlatList, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import CircleIconButton1 from '../../../components/shared/CircleButton1';
import CircleIconButton from '../../../components/shared/CircleButton';
import BoxWithIcon3 from '../../../components/shared/BoxWithIcon3';
import moment from 'moment';
import CustomCard from '../../../components/shared/CustomCard';

export default function Review({formData, step}) {

  const regular_cleaning = [
    {
        "label":"Sweeping and Mopping",
        "value":"Sweeping and Mopping",
    },
    {
        "label":"Vacuuming",
        "value":"Vacuuming"
    },
    {
        "label":"Kitchen Cleaning",
        "value":"Kitchen"
    },
    {
        "label":"Bathroom Cleaning",
        "value":"Bathroom "
    },
    {
        "label":"Dishwashing",
        "value":"Dishwashing"
    },
    {
        "label":"Trash Removal",
        "value":"Trash Removal"
    },
    {
        "label":"Room Cleaning",
        "value":"Room Cleaning"
    },
    {
        "label":"Livingroom",
        "value":"Livingroom"
    },
    {
      "label":"Dusting",
      "value":"Dusting"
    },
    {
        "label":"Window Cleaning",
        "value":"Window Cleaning"
    },
    {
        "label":"Air Freshening",
        "value":"Air Freshening"
    },
    {
        "label":"Appliance Cleaning",
        "value":"Appliance Cleaning"
    },
    {
        "label":"Final Inspection",
        "value":"Final Inspection"
    },
  ];

  const { width } = useWindowDimensions();
  const numColumns = 3;
  const numColumns2 = 2;
  const columnWidth = width / numColumns - 28;
  const columnWidth2 = width / numColumns2 - 10;

  // 🔥 FIX: Format date properly (handle both YYYY-MM-DD and ISO format)
  const formatCleaningDate = () => {
    if (!formData.cleaning_date) return '';
    
    let dateStr = formData.cleaning_date;
    // If it's in ISO format, extract just the date part
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    try {
      return moment(dateStr).format('ddd MMM D');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // 🔥 FIX: Format time properly
  const formatCleaningTime = () => {
    if (!formData.cleaning_time) return '';
    
    try {
      return moment(formData.cleaning_time, 'HH:mm:ss').format('h:mm A');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  // 🔥 NEW: Calculate total tasks from checklist
  const calculateTotalTasks = () => {
    if (formData.checklistTasks && Array.isArray(formData.checklistTasks)) {
      return formData.checklistTasks.length;
    }
    return regular_cleaning.length;
  };

  const getRoomInfo = (type) => {
    const res = formData.selected_apt_room_type_and_size?.filter(room => room.type === type);
    const room_ = res?.[0];
    
    return room_
      ? { type: room_.type, number: room_.number, size: room_.size, size_range: room_.size_range }
      : null;
  };

  const bedroomInfo = getRoomInfo("Bedroom");
  const bathroomInfo = getRoomInfo("Bathroom");
  const kitchenInfo = getRoomInfo("Kitchen");
  const livingroomInfo = getRoomInfo("Livingroom");

  // 🔥 FIX: Task item renderer - handle both strings and objects
  const taskItem = ({ item, index }) => {
    // Handle both string (from checklistTasks) and object (from regular_cleaning)
    const label = typeof item === 'string' ? item : item.label || item.value || 'Unknown Task';
    
    return (
      <View style={[styles.tasks, { width: columnWidth2 }]}>
        <MaterialCommunityIcons 
          name="checkbox-marked-circle" 
          size={14} 
          color={COLORS.primary} 
          style={styles.taskIcon}
        />
        <Text style={styles.taskText}>{label}</Text>
      </View>
    );
  };

  // 🔥 NEW: Get tasks for display (prioritize checklist tasks)
  const getTasksForDisplay = () => {
    if (formData.checklistTasks && Array.isArray(formData.checklistTasks) && formData.checklistTasks.length > 0) {
      return formData.checklistTasks;
    }
    return regular_cleaning;
  };
  console.log("Form datttttttttaaatttat", JSON.stringify(formData, null, 2))
  const handleEditStep = (sp) => {
    step(sp);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <Text style={styles.mainTitle}>Review Schedule</Text>
        <Text style={styles.mainSubtitle}>
          Outline Specific Tasks and Instructions for the Cleaner
        </Text>
      
        {/* Apartment Details */}
        <View style={styles.card}>
          <View style={styles.title_edit}>
            <Text style={styles.title}>Apartment Details</Text>
            <MaterialCommunityIcons 
              onPress={() => handleEditStep(1)} 
              name='pencil' 
              size={20} 
              color={COLORS.primary} 
            />
          </View>
          
          <Text style={styles.apartmentName}>{formData.apartment_name || 'Not specified'}</Text>
          
          <View style={styles.addressContainer}>
            <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
            <Text style={styles.addressText}>
              {formData.address || 'No address provided'}
            </Text>
          </View>
          
          <View style={styles.roomsContainer}>
            {bedroomInfo && (
              <View style={styles.roomItem}>
                <MaterialCommunityIcons name="bed-empty" color={COLORS.gray} size={14} />
                <Text style={styles.roomText}>
                  {bedroomInfo.number} {bedroomInfo.type}
                </Text>
              </View>
            )}
            
            {bathroomInfo && (
              <View style={styles.roomItem}>
                <MaterialCommunityIcons name="shower-head" color={COLORS.gray} size={14} />
                <Text style={styles.roomText}>
                  {bathroomInfo.number} {bathroomInfo.type}
                </Text>
              </View>
            )}
            
            {kitchenInfo && (
              <View style={styles.roomItem}>
                <MaterialCommunityIcons name="silverware-fork-knife" color={COLORS.gray} size={14} />
                <Text style={styles.roomText}>
                  {kitchenInfo.number} {kitchenInfo.type}
                </Text>
              </View>
            )}
            
            {livingroomInfo && (
              <View style={styles.roomItem}>
                <MaterialCommunityIcons name="seat-legroom-extra" color={COLORS.gray} size={14} />
                <Text style={styles.roomText}>
                  {livingroomInfo.number} {livingroomInfo.type}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Schedule Date & Time */}
        <View style={styles.card}>
          <View style={styles.title_edit}>
            <Text style={styles.title}>Schedule Date & Time</Text>
            <MaterialCommunityIcons 
              onPress={() => handleEditStep(2)} 
              name='pencil' 
              size={20} 
              color={COLORS.primary} 
            />
          </View>
           
          <View style={styles.bed_bath}>
            <View style={styles.sch_date_time}>
              <View>
                <CircleIconButton iconName="calendar" iconSize={24}/>
              </View>
              <View>
                <Text style={styles.scheduleLabel}>Date</Text>
                <Text style={styles.scheduleValue}>
                  {formatCleaningDate()}
                </Text>
              </View>
            </View>
            <View style={styles.sch_date_time}>
              <View>
                <CircleIconButton iconName="clock-outline" iconSize={24}/>
              </View>
              <View>
                <Text style={styles.scheduleLabel}>Time</Text>
                <Text style={styles.scheduleValue}>
                  {formatCleaningTime()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cleaning Services */}
        <View style={styles.card}>
          <View style={styles.title_edit}>
            <Text style={styles.title}>Cleaning Services</Text>
            <MaterialCommunityIcons 
              onPress={() => handleEditStep(3)} 
              name='pencil' 
              size={20} 
              color={COLORS.primary} 
            />
          </View>
         
          {/* 🔥 FIX: Show selected checklist name */}
          {formData.checklistName && (
            <View style={styles.selectedChecklistContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={16} 
                color={COLORS.success} 
                style={styles.checkIcon}
              />
              <Text style={styles.checklistName}>
                {formData.checklistName}
              </Text>
            </View>
          )}

          {/* Tasks List */}
          <View style={styles.tasksContainer}>
            <FlatList
              data={getTasksForDisplay()}
              renderItem={taskItem}
              keyExtractor={(item, index) => {
                if (typeof item === 'string') return `task-${item}-${index}`;
                return `task-${item.value || item.label}-${index}`;
              }}
              numColumns={2}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Checklist Summary */}
          <View style={styles.checklistSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tasks:</Text>
              <Text style={styles.summaryValue}>{calculateTotalTasks()} tasks</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Time:</Text>
              <Text style={styles.summaryValue}>
                {formData.total_cleaning_Time || '--'} minutes
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Fee:</Text>
              <Text style={styles.totalFee}>${formData.total_cleaning_fee || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Additional Notes (if any) */}
        {formData.additional_notes && (
          <View style={styles.card}>
            <View style={styles.title_edit}>
              <Text style={styles.title}>Additional Notes</Text>
            </View>
            <Text style={styles.notesText}>
              {formData.additional_notes}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: COLORS.gray,
  },
  card: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  apartmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  roomsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  roomText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.gray,
  },
  title_edit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bed_bath: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sch_date_time: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleLabel: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleValue: {
    textAlign: 'left',
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.gray,
  },
  selectedChecklistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  checkIcon: {
    marginRight: 8,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  tasksContainer: {
    marginTop: 8,
  },
  tasks: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  taskIcon: {
    marginRight: 8,
  },
  taskText: {
    fontSize: 13,
    color: COLORS.dark,
    flex: 1,
  },
  checklistSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  totalFee: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 20,
  },
});