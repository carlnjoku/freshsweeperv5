// import React, {useState, useEffect, useContext} from 'react';
// import { TextInput, Text, } from 'react-native-paper';
// import { View, Button, StyleSheet, Pressable, Platform, FlatList, ScrollView, useWindowDimensions } from 'react-native';
// import COLORS from '../../../constants/colors';
// import BoxWithIcon from '../../../components/shared/BoxWithIcon';
// import { AuthContext } from '../../../context/AuthContext';
// import { Checkbox } from 'react-native-paper';

// import { calculateCleaningTimeByTasks } from '../../../utils/calculateCleaningTimeByTasks';
// import { calculateRoomCleaningTime } from '../../../utils/calculateRoomCleaningTime';

// import { extra_cleaning, regular_cleaning } from '../../../utils/cleaningData';
// import { extra_cleaning_task_time } from '../../../utils/roomTimes';
// import moment from 'moment';


// export default function CleaningTask({onExtraSelect, extraTasks, totalTaskTime, roomBathChange,formData, setFormData, extras,validateForm}) {

//     const { currency} = useContext(AuthContext)

//     const { width } = useWindowDimensions();
//     const numColumns = 3;
//     const columnWidth = width / numColumns - 22; // Adjusted width to accommodate margins

//     const numColumns2 = 2
//     const columnWidth2 = width / numColumns2 - 10; // Adjusted width to accommodate margins
    
//     const[totalPrice, setTotalPrice] = useState(0);
//     const[regular_cleaning_time, setRegularCleaningTime] = useState(0);
//     const[regular_price, setRegularPrice] = useState(0);
//     const[extra_price, setExtraPrice] = useState(0);
//     const[basePrice, setBaselPrice] = useState(15);
//     const[isFormValid, setIsValid] = useState(false);
//     const[isChecked, setIsCheckedd] = useState(true);
//     const[room_type_and_size, setRoomTypeAndSize] = useState([]);
//     const[selected_extra_task, setSelectedExtraTask] = useState([]);
//     const[totalTime, setTotalCleaningTime] = useState(0);

    


//     // Function to validate the form
//     const validate = () => {
//         // Perform validation logic
//         const isFormValid =
//         parseInt(formData.bedroom, 10) > 0 &&
//         parseInt(formData.bathroom, 10) > 0 &&
//         extras.length > 0; // Ensure at least one extra is selected
//         // alert(isFormValid)
//         // Update the validation state
//         setIsValid(isFormValid);
//         validateForm(isFormValid)
//     };

//     useEffect(() => {
//         // validateForm(isValid);
//         setRoomTypeAndSize(formData.selected_apt_room_type_and_size)
        
//       }, [formData, extras]);
      
//       const calculateEndTime = (startTime, durationInMinutes) => {
//         const endTime = moment(startTime, 'hh:mm A').add(durationInMinutes, 'minutes');
//         // return endTime.format('hh:mm A');
//         return moment(endTime, 'hh:mm A').format('HH:mm:ss');
//       };
//     const handleAddonSelection = (addonValue, addonLabel, addonPrice, addonIcon) => {
//         // Check if the selected addon is already in the extras array
//         const isSelected = extras.some((extra) => extra.value === addonValue);
      
//         // Update the extras array based on whether the selected addon is already selected
//         const updatedExtras = isSelected
//           ? extras.filter((extra) => extra.value !== addonValue) // If selected, remove it from the array
//           : [...extras, { value: addonValue, label: addonLabel, icon:addonIcon,  price:addonPrice }]; // If not selected, add it to the array
      
//         // Update the extras state with the updated array
//         onExtraSelect(updatedExtras);

//         console.log("update.............")
//         // console.log(updatedExtras)

//         // Extracting tasks
//         const selected_tasks = updatedExtras.map(item => item.value);
//         // console.log(selected_tasks)
//         console.log("update.............")
//         extraTasks(selected_tasks, 'extraTaskTime')
//         // extraTasks(updatedExtras.map(item => item.value))

        
//         setSelectedExtraTask(selected_tasks)
//         const cleaningTimeByTask = calculateCleaningTimeByTasks(selected_tasks, extra_cleaning_task_time)
  
//         console.log("wooooooooooo........")
//         // console.log(cleaningTimeByTask)

//         const extra_cleaning_time = calculateCleaningTimeByTasks(selected_extra_task, extra_cleaning_task_time)
//         const regularCleaningTime = calculateRoomCleaningTime(room_type_and_size)

//         const total_cleaning_time = (regularCleaningTime)+(extra_cleaning_time)
//         setTotalCleaningTime(total_cleaning_time)


//         totalTaskTime(total_cleaning_time, 'totalTaskTime')
//         console.log(total_cleaning_time)
//         console.log("wooooooooooo........")
        
        
//         // Calculate the total price based on the updated extras array
//         const selected_extra_fees = updatedExtras.reduce((total, extra) => total + extra.price, 0);

      
//         // Update the formData object to include the selected extras and total price
//         setFormData((prevFormData) => ({
//           ...prevFormData,
//           extra: updatedExtras,
//           regular_cleaning:regular_cleaning,
//           selected_extra_fees: selected_extra_fees,
//           total_cleaning_time: (formData.regular_cleaning_time) + (extra_cleaning_time),
//           total_cleaning_fee: (formData.regular_cleaning_fee) + (selected_extra_fees)

//         }));

//         const total_time = (formData.total_cleaning_time)+(extra_cleaning_time)
//         // alert(formData.total_cleaning_time)
//         const cleaning_end_time = calculateEndTime(formData.cleaning_time, total_time)
//         // alert(cleaning_end_time)
//         setFormData((prevFormData) => ({
//             ...prevFormData,
//             cleaning_end_time: cleaning_end_time,
//         }));

//         // Validate form after adding or removing an addon
//         // validate();
//       };
      
      
//       const getRoomInfo = (type) => {
    
//         const res = room_type_and_size.filter(room => room.type === type);
//         console.log("pee......1")
//         // console.log(res[0])
//         const room_ = res[0]

//         return room_
//         ? { type: room_.type, number: room_.number, size: room_.size, size_range:room_.size_range }
//         : null;
//       };


//       const bedroomInfo = getRoomInfo("Bedroom");
//       const bathroomInfo = getRoomInfo("Bathroom");
//       const livingroomInfo = getRoomInfo("Livingroom");

   
    
//     const singleItem = ( {item,index} ) => (
//         <BoxWithIcon 
//             item={item}
//             iconName={item.icon}
//             price={item.price}
//             color="primary"
//             columnWidth={columnWidth}
//             onPress={handleAddonSelection}
//         />
//     )
//     const taskItem = ( {item,index} ) => (
//         <View style={[styles.tasks, { width: columnWidth2 }]}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 0 }}>
//             <Checkbox.Android status={isChecked ? 'checked' : 'unchecked'} color={COLORS.primary_light} />
//         <Text style={{ marginLeft: -2 }}>{item.label}</Text>
//         </View>
//         </View>
        
//     )
//     const handleAddPress = () => {
//         // Increase the number by 1
//         const newValue = String(parseInt(formData.bedroom, 10) + 1);
//             roomBathChange(newValue, 'bedroom'); // Call roomBathChange after updating state
//             setFormData((prevFormData) => ({
//             ...prevFormData,
//             bedroom: newValue,
//         }));
//       };
    
//       const handleMinusPress = () => {
//         // Decrease the number by 1
//        // Decrease the number of bedrooms by 1
//         const newValue = String(Math.max(parseInt(formData.bedroom, 10) - 1, 0)); // Ensure the value is not negative
//         roomBathChange(newValue, 'bedroom'); // Call roomBathChange after updating state
//         setFormData((prevFormData) => ({
//             ...prevFormData,
//             bedroom: newValue,
//         }));
//       };
//       const handleAddPressBath = () => {
//         // Increase the number by 1
//         const newValue = String(parseInt(formData.bathroom, 10) + 1);
//             roomBathChange(newValue, 'bathroom'); // Call roomBathChange after updating state
//             setFormData((prevFormData) => ({
//             ...prevFormData,
//             bathroom: newValue,
//         }));

//         validate(); // Validate the form after updating the input
//       };
    
//       const handleMinusPressBath = () => {
//         // Decrease the number by 1
//         const newValue = String(Math.max(parseInt(formData.bathroom, 10) - 1, 0)); // Ensure the value is not negative
//             roomBathChange(newValue, 'bathroom'); // Call roomBathChange after updating state
//             setFormData((prevFormData) => ({
//                 ...prevFormData,
//                 bathroom: newValue,
//             }));

//             validate(); // Validate the form after updating the input
//         };

//       const handleChangeRoomBath = (text, input)=> {
//         // roomBathChange(text, input)

//         let newValue = parseInt(text, 10);
//         if (isNaN(newValue) || newValue < 0) {
//         newValue = 0;
//         }

//         // console.log(regular_cleaning)

//         // Update the form data and perform validation
//         setFormData((prevFormData) => ({
//             ...prevFormData,
//             [input]: String(newValue),
            
//         }));
        
//         validate(); // Validate the form after updating the input
//       }

     

    
    
//   return (
//     <ScrollView showsVerticalScrollIndicator={false}>
//     <View>
//         <Text bold style={{fontSize:24, }}>Specify Cleaning Details</Text>
//         <Text style={{fontSize:14, marginBottom:20, color:COLORS.gray}}>Outline Specific Tasks and Instructions for the Cleaner</Text>
        
        
//         <View style={styles.regular_pricing}>
//             <View>
//                 <Text bold style={{fontSize:16}}>Included Regular Cleaning <Text style={{fontSize:13, marginBottom:0, marginLeft:20}}> ({currency}{formData.regular_cleaning_fee})</Text></Text>
//                 <Text style={{fontSize:13, color:COLORS.gray, marginBottom:10}}>Tasks automatically included based on property and cleaning needs.</Text>
//             </View> 
//         </View>
        
//         <View style={{ borderRadius:8, borderWidth:0.5, borderColor:COLORS.gray, padding:10, marginBottom:40}}>
//             <FlatList
//                 data={regular_cleaning}
//                 renderItem = {taskItem}
//                 // ListHeaderComponent={<Text bold style={{fontSize:16}}>Regular Cleaning</Text>}
//                 ListHeaderComponentStyle={styles.list_header}
//                 // ListEmptyComponent= {emptyListing}
//                 // ItemSeparatorComponent={itemSeparator}
//                 keyExtractor={(item, index)=> item.label}
//                 numColumns={numColumns2}
//                 showsVerticalScrollIndicator={false}
//             />
//         </View>
//             <View>
//                 <FlatList 
//                     data = {extra_cleaning}
//                     renderItem = {singleItem}
//                     ListHeaderComponent={
//                         <View style={styles.extra_pricing}>
//                             <View>
//                                 <Text bold style={{fontSize:16}}>Add Extra Services  <Text style={{fontSize:14, marginBottom:10}}> ({currency}{formData.selected_extra_fees})</Text> </Text>
//                                 <Text style={{fontSize:13, color:COLORS.gray, marginBottom:10}}>Choose additional services to enhance your cleaning experience.</Text>
//                             </View>
                            
//                         </View>
//                     }
//                     ListHeaderComponentStyle={styles.list_header}
//                     // ListEmptyComponent= {emptyListing}
//                     // ItemSeparatorComponent={itemSeparator}
//                     keyExtractor={(item, index)=> item.label}
//                     numColumns={numColumns}
//                     key={numColumns}
//                     showsVerticalScrollIndicator={false}
//                 />
//             </View>
//         </View>
//         </ScrollView>
//   )
// }



// const styles = StyleSheet.create({
//     tasks:{
//         flexDirection:'row',
//         justifyContent:'space-between',
//         alignItems:'center',
//     },
//     regular_pricing:{
//         flexDirection:'row',
//         justifyContent:'space-between',
//         alignItems:'center',
//         marginTop:0
//     },
//     extra_pricing:{
//         flexDirection:'row',
//         justifyContent:'space-between',
//         alignItems:'center',
//     },
//     tableHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ddd',
//       },
//       headerText: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#333',
//         flex: 1,
//         textAlign: 'left',
//       },
//       tableRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//       },
//       cell: {
//         fontSize: 14,
//         color: '#555',
//         flex: 1,
//         textAlign: 'left',
//       }
// })



import React, {useState, useEffect, useContext} from 'react';
import { TextInput, Text, Checkbox } from 'react-native-paper';
import { View, StyleSheet, FlatList, Button, ScrollView, useWindowDimensions } from 'react-native';
import COLORS from '../../../constants/colors';
import BoxWithIcon from '../../../components/shared/BoxWithIcon';
import { AuthContext } from '../../../context/AuthContext';

import { calculateCleaningTimeByTasks } from '../../../utils/calculateCleaningTimeByTasks';
import { calculateRoomCleaningTime } from '../../../utils/calculateRoomCleaningTime';

import { extra_cleaning, regular_cleaning } from '../../../utils/cleaningData';
import { extra_cleaning_task_time } from '../../../utils/roomTimes';
import moment from 'moment';

import RoomAssignmentPicker from './RoomAssignmentPicker';

export default function CleaningTask({ onExtraSelect, extraTasks, totalTaskTime, roomBathChange, formData, setFormData, extras, validateForm }) {
  const { currency } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const numColumns = 3;
  const columnWidth = width / numColumns - 22;
  const numColumns2 = 2;
  const columnWidth2 = width / numColumns2 - 10;

  const [room_type_and_size, setRoomTypeAndSize] = useState([]);
  const [selected_extra_task, setSelectedExtraTask] = useState([]);
  const [totalCleaningTime, setTotalCleaningTime] = useState(0);
  const [expectedCleaners, setExpectedCleaners] = useState(2);

  useEffect(() => {
    setRoomTypeAndSize(formData.selected_apt_room_type_and_size);
    
    const newGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
      groupId: `group_${i + 1}`,
      rooms: [],
      pricing: null,
    }));
    setTaskGroups(newGroups);

  }, [formData, extras,expectedCleaners]);

  const calculateEndTime = (startTime, durationInMinutes) => {
    const endTime = moment(startTime, 'hh:mm A').add(durationInMinutes, 'minutes');
    return moment(endTime, 'hh:mm A').format('HH:mm:ss');
  };

  const handleAddonSelection = (addonValue, addonLabel, addonPrice, addonIcon) => {
    const isSelected = extras.some(extra => extra.value === addonValue);
    const updatedExtras = isSelected
      ? extras.filter(extra => extra.value !== addonValue)
      : [...extras, { value: addonValue, label: addonLabel, icon: addonIcon, price: addonPrice }];

    onExtraSelect(updatedExtras);

    const selected_tasks = updatedExtras.map(item => item.value);
    extraTasks(selected_tasks, 'extraTaskTime');
    setSelectedExtraTask(selected_tasks);

    const extra_cleaning_time = calculateCleaningTimeByTasks(selected_tasks, extra_cleaning_task_time);
    const regularCleaningTime = calculateRoomCleaningTime(room_type_and_size);
    const total_cleaning_time = regularCleaningTime + extra_cleaning_time;

    setTotalCleaningTime(total_cleaning_time);
    totalTaskTime(total_cleaning_time, 'totalTaskTime');

    const selected_extra_fees = updatedExtras.reduce((total, extra) => total + extra.price, 0);

    setFormData(prev => ({
      ...prev,
      extra: updatedExtras,
      regular_cleaning,
      selected_extra_fees,
      total_cleaning_time: formData.regular_cleaning_time + extra_cleaning_time,
      total_cleaning_fee: formData.regular_cleaning_fee + selected_extra_fees
    }));

    const total_time = formData.total_cleaning_time + extra_cleaning_time;
    const cleaning_end_time = calculateEndTime(formData.cleaning_time, total_time);
    setFormData(prev => ({
      ...prev,
      cleaning_end_time
    }));
  };

  const getRoomInfo = (type) => {
    const res = room_type_and_size.filter(room => room.type === type);
    return res[0] || null;
  };

  const taskItem = ({ item }) => (
    <View style={[styles.tasks, { width: columnWidth2 }]}>
      <Checkbox.Android status={'checked'} color={COLORS.primary_light} />
      <Text style={{ marginLeft: -2 }}>{item.label}</Text>
    </View>
  );

  const singleItem = ({ item }) => (
    <BoxWithIcon 
      item={item}
      iconName={item.icon}
      price={item.price}
      color="primary"
      columnWidth={columnWidth}
      onPress={handleAddonSelection}
    />
  );

  const [taskAssignments, setTaskAssignments] = useState({});

  const handleAssignmentsChange = (assignments) => {
    console.log('✅ Final Assignments:', assignments);
    setTaskAssignments(assignments); // send this to backend when creating schedule
  };


  

  

  const handleAssignmentChange = (assignment) => {
    console.log("Room assignment:", assignment);
    // Store in state or submit to backend later
  };


  const [selectedRooms, setSelectedRooms] = useState([
 
    { type: 'Bedroom', number: 3 },
    { type: 'Bathroom', number: 2 },
    { type: 'Kitchen', number: 1 },
    { type: 'Livingroom', number: 1 }
  ]);
  const [taskGroups, setTaskGroups] = useState([]);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <Text bold style={{ fontSize: 24 }}>Assign Cleaning Tasks</Text>
        <Text style={{ fontSize: 14, marginBottom: 20, color: COLORS.gray }}>
        Distribute rooms and extra tasks among available groups to calculate estimated time and cost.
        </Text>
        

      <RoomAssignmentPicker
        selectedApartment={formData}
        taskGroups={taskGroups}
        initialRoomAssignments={formData.roomAssignments}
        initialExtraAssignments={formData.extraAssignments}
        onAssignmentChange={(updatedAssignments) => {
          setFormData((prev) => ({
            ...prev,
            roomAssignments: updatedAssignments,
          }));
        }}
        onGroupSummaryChange={(summary) => {
          setFormData((prev) => ({
            ...prev,
            groupSummary: summary, // 👈 now stored in formData
          }));
        }}
      />

      {/* <RoomAssignmentPicker
        selectedApartment={formData}
        taskGroups={taskGroups}
        onAssignmentChange={(updatedAssignments) => {
          setFormData((prev) => ({
            ...prev,
            roomAssignments: updatedAssignments,
          }));
        }}
        onGroupSummaryChange={(summary) => {
          setFormData((prev) => ({
            ...prev,
            groupDetails: summary,
          }));
        }}
        initialRoomAssignments={formData.roomAssignments}
        initialExtraAssignments={formData.extraAssignments}
        setFormData={setFormData} // Pass down setter
      /> */}
      

      {/* Optional: Show summary of current assignment state */}
      <Text style={{ marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>Debug Preview:</Text>
      <Text>{JSON.stringify(taskAssignments, null, 2)}</Text>


        <View style={styles.regular_pricing}>
          <Text bold style={{ fontSize: 16 }}>
            Included Regular Cleaning <Text style={{ fontSize: 13 }}>({currency}{formData.regular_cleaning_fee})</Text>
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.gray, marginBottom: 10 }}>
            Tasks automatically included based on property and cleaning needs.
          </Text>
        </View>

        {/* <View style={{ borderRadius: 8, borderWidth: 0.5, borderColor: COLORS.gray, padding: 10, marginBottom: 40 }}>
          <FlatList
            data={regular_cleaning}
            renderItem={taskItem}
            ListHeaderComponentStyle={styles.list_header}
            keyExtractor={(item) => item.label}
            numColumns={numColumns2}
            showsVerticalScrollIndicator={false}
          />
        </View> */}

        {/* <FlatList 
          data={extra_cleaning}
          renderItem={singleItem}
          ListHeaderComponent={
            <View style={styles.extra_pricing}>
              <Text bold style={{ fontSize: 16 }}>
                Add Extra Services <Text style={{ fontSize: 14 }}>({currency}{formData.selected_extra_fees})</Text>
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.gray, marginBottom: 10 }}>
                Choose additional services to enhance your cleaning experience.
              </Text>
            </View>
          }
          ListHeaderComponentStyle={styles.list_header}
          keyExtractor={(item) => item.label}
          numColumns={numColumns}
          key={numColumns}
          showsVerticalScrollIndicator={false}
        /> */}

<Text style={{ marginTop: 20 }}>Group Summary: {JSON.stringify(formData.groupSummary, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tasks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regular_pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0
  },
  extra_pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list_header: {
    marginBottom: 10
  }
});

