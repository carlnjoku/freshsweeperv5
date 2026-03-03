import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, FlatList, Keyboard,KeyboardAvoidingView, Platform, Pressable, TouchableWithoutFeedback } from 'react-native';
import COLORS from '../../constants/colors';
import moment from 'moment';
import { Button, Avatar, Divider, TouchableRipple } from 'react-native-paper';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { calculateOverallRating } from '../../utils/calculate_overall_rating';
import StarRating from 'react-native-star-rating-widget';
import userService from '../../services/connection/userService';


export default function CleanerItem({
    item, 
    selected_schedule,
    selected_scheduleId,
    hostId,
    hostFname,
    hostLname
}) {

const {currentUser, currentUserId} = useContext(AuthContext)


  
 
  const navigation = useNavigation();

  const pending_payment = item


  // console.log("Cleeeeeeenaer", pending_payment._id)

  const[reviews, setReviews] = useState([])

  useEffect(()=>{
    fetchCleanerFeedbacks()
  },[])

  const fetchCleanerFeedbacks = async() => {
    const response = await userService.getCleanerFeedbacks(pending_payment?.cleanerId)
    setReviews(response.data.data)
    console.log(JSON.stringify(response.data.data, null, 2))
  }

  
  const formatName = (name) => name ? name.charAt(0).toUpperCase() : '';
  return (
    
      <TouchableRipple
        onPress={() => navigation.navigate(ROUTES.cleaner_profile_info, {
          item:item,
          selected_schedule:selected_schedule,
          selected_scheduleId:selected_scheduleId,
          hostId:hostId,
          requestId:pending_payment._id,
          hostFname: hostFname,
          hostLname: hostLname
        })}
        rippleColor="rgba(0, 0, 0, 0.2)"
        borderless={false}
        style={[styles.scheduleCard, styles.rippleButton]}
      >
       <View>
      
      
      <View style={styles.details}>
        <View style={{flex: 0.2, marginRight:5}}>
                  
              {pending_payment?.avatar ? 
                <Avatar.Image 
                    source={{uri:pending_payment?.avatar}}
                    size={50}
                    // style={{height:40, width:40, borderRadius:20, marginLeft: -10, borderWidth:1, borderColor:COLORS.light_gray_1, marginBottom:10}} 
                />
                :

                <Avatar.Icon
                  size={50}
                  style={{ backgroundColor: COLORS.gray }}
                />
            
              }
        </View>
        <View style={{flex: 0.65}}>
          <Text style={styles.cleaner_name}>{pending_payment?.firstname} {formatName(pending_payment?.lastname)}.</Text>
          <View style={styles.rating}>
          <StarRating
            rating={calculateOverallRating(reviews, pending_payment?.cleanerId)}
            onChange={() => {}} // No-op function to disable interaction
            maxStars={5} // Maximum stars
            starSize={16} // Size of the stars
            starStyle={{ marginHorizontal: 0 }} // Customize star spacing
          />

          {/* <StarRating /> */}
          <Text style={{marginLeft:5}}>{calculateOverallRating(reviews, item.cleanerId)}</Text>
          </View>
          <Text style={styles.miles}>{pending_payment?.location?.city}, {pending_payment?.location?.region}</Text>
          <Text style={styles.miles}>{pending_payment?.distance.toFixed(1) || 0} miles away</Text>
          {/*<Text style={styles.apartment}>{pending_payment?.schedule?.address} </Text> */}
        </View>
                  
        <View style={{flex: 0.3, alignItems: 'flex-end'}}>
          <Text style={styles.date}>Member Since</Text>
          <Text style={styles.time}>{moment(pending_payment?.created_at, "DD-MM-YYYY HH:mm:ss").format("MMM YYYY")}</Text>
          {/* <Ionicons name="chevron-forward-outline" color={COLORS.secondary} size={16}></Ionicons> */}
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.action}>
        
        {/* <Button
          mode="contained"
          // onPress={() => handleClaim(item.id)}
          onPress={handleProceedToCheckout}
          style={styles.claimButton}
        >
          Profile & Pay
        </Button> */}
        <View style={{flexDirection:'row'}}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
          <MaterialCommunityIcons name="certificate" size={26} color="#FFD700" />
        </View>
        <Text style={styles.expire}>Completed 20 jobs</Text>
        {/* <Text style={styles.fee}>${pending_payment.schedule?.schedule.total_cleaning_fee}</Text> */}
      </View>
      </View>
      </TouchableRipple> 
    
    
  )
}

const styles = StyleSheet.create({
  scheduleCard:{
    padding: 15, 
    borderRadius: 8, 
    // backgroundColor: '#e9f5ff', 
    backgroundColor: '#ffffff', 
    elevation:3,
    marginVertical: 0,
   
  },
  details: { 
    flexDirection:'row',
  },
  date_time:{
    flex: 0.25,
    alignItems:'flex-end',
    marginRight:5
  },
  apart_name: {
    fontWeight:'400',
    fontSize:13
  },
  cleaner_name:{
    fontWeight:'600',
    fontSize:16
  },
  apartment:{
    color:COLORS.gray,
    fontSize:13,
  },
  date:{
    marginTop:-4,
    fontSize:13,
    fontWeight:'500'
    // color:COLORS.gray
  },
  time:{
    marginTop:4,
    fontSize:12,
    // color:COLORS.gray
  },
  claimButton:{
    backgroundColor:COLORS.primary,
    // marginRight:10
    marginTop:10
  },
  action:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  fee:{
    fontSize:20,
    fontWeight:'600'
  },
  divider:{
    marginVertical:5
  },
  rippleButton: {
    borderRadius: 15, // Overrides `borderRadius` from scheduleCard
    overflow: 'hidden', // Keeps ripple effect within bounds
  },
  miles:{
    fontSize:12,
    color:COLORS.gray
  },
  expire:{
    fontSize:13,
    color:COLORS.gray
  },
  rating:{
    flexDirection:'row',
    justifyContent:'left',
    
  },

})



// },
// {
//   "img_url": "https://firebasestorage.googleapis.com/v0/b/fresh-sweeper.appspot.com/o/task_photos%2F884d43d4-ff96-4bea-96ef-4135508d905d.jpg?alt=media",
//   "filename": "884d43d4-ff96-4bea-96ef-4135508d905d.jpg",
//   "extension": "jpg",
//   "size": 4977622,
//   "cleanliness": {
//     "scores": {
//       "keras_tensor_319": 0.75,
//       "keras_tensor_321": -0.44,
//       "keras_tensor_323": 1.76,
//       "keras_tensor_325": -1.96,
//       "keras_tensor_327": 0.13,
//       "keras_tensor_329": -1.06,
//       "keras_tensor_331": -0.46,
//       "keras_tensor_333": 0.22,
//       "keras_tensor_335": 2.48,
//       "keras_tensor_337": 1.49,
//       "keras_tensor_339": -0.88,
//       "keras_tensor_341": 0.72,
//       "keras_tensor_343": -1.03,
//       "keras_tensor_345": -0.37,
//       "keras_tensor_347": 3.83,
//       "keras_tensor_349": -0.16,
//       "keras_tensor_351": 2.31,
//       "keras_tensor_353": -0.22,
//       "keras_tensor_355": 1.17,
//       "keras_tensor_357": 0.14,
//       "keras_tensor_359": 0.8,
//       "keras_tensor_361": -0.45,
//       "keras_tensor_363": -1.35,
//       "keras_tensor_365": -0.11,
//       "keras_tensor_367": -0.02,
//       "keras_tensor_369": 0.74,
//       "keras_tensor_371": -1.07,
//       "keras_tensor_373": -1.77,
//       "keras_tensor_375": -1.43,
//       "keras_tensor_377": 1.52,
//       "keras_tensor_379": 1.43,
//       "keras_tensor_381": 0.49,
//       "keras_tensor_383": 1.06,
//       "keras_tensor_385": 0.66,
//       "keras_tensor_387": 0.57,
//       "keras_tensor_389": -0.79,
//       "keras_tensor_391": -1.58,
//       "keras_tensor_393": 0.1,
//       "keras_tensor_395": 0.11,
//       "keras_tensor_397": 0.25,
//       "keras_tensor_399": -0.02,
//       "keras_tensor_401": -1.19,
//       "keras_tensor_403": 0,
//       "keras_tensor_405": -0.66
//     },
//     "individual_overall": 0,
//     "heatmap_url": "https://firebasestorage.googleapis.com/v0/b/fresh-sweeper.appspot.com/o/task_photos%2F884d43d4-ff96-4bea-96ef-4135508d905d_heatmap.jpg?alt=media",
//     "problem_area": "keras_tensor_347",
//     "spot_count": 12,
//     "rating_version": "v4.2"
//   }
// },
// {
//   "img_url": "https://firebasestorage.googleapis.com/v0/b/fresh-sweeper.appspot.com/o/task_photos%2F5aed801f-e85c-4818-8a68-727e6f283485.jpg?alt=media",
//   "filename": "5aed801f-e85c-4818-8a68-727e6f283485.jpg",
//   "extension": "jpg",
//   "size": 4811436,
//   "cleanliness": {
//     "scores": {
//       "keras_tensor_319": 0.11,
//       "keras_tensor_321": 0.33,
//       "keras_tensor_323": 2.77,
//       "keras_tensor_325": -2.01,
//       "keras_tensor_327": 0.88,
//       "keras_tensor_329": 0.49,
//       "keras_tensor_331": -0.25,
//       "keras_tensor_333": 0.92,
//       "keras_tensor_335": 1.2,
//       "keras_tensor_337": -0.01,
//       "keras_tensor_339": -0.85,
//       "keras_tensor_341": 0.26,
//       "keras_tensor_343": 0.87,
//       "keras_tensor_345": 1.3,
//       "keras_tensor_347": 6.74,
//       "keras_tensor_349": 0.32,
//       "keras_tensor_351": 4.23,
//       "keras_tensor_353": 1.19,
//       "keras_tensor_355": 1.4,
//       "keras_tensor_357": 1.01,
//       "keras_tensor_359": 1.23,
//       "keras_tensor_361": 0.72,
//       "keras_tensor_363": 0.02,
//       "keras_tensor_365": 0.62,
//       "keras_tensor_367": 0,
//       "keras_tensor_369": 0.91,
//       "keras_tensor_371": 0.25,
//       "keras_tensor_373": -1.05,
//       "keras_tensor_375": -1.25,
//       "keras_tensor_377": 1.82,
//       "keras_tensor_379": 1.27,
//       "keras_tensor_381": 1.35,
//       "keras_tensor_383": 0.12,
//       "keras_tensor_385": 0.24,
//       "keras_tensor_387": 1.8,
//       "keras_tensor_389": 0.33,
//       "keras_tensor_391": -0.58,
//       "keras_tensor_393": -0.23,
//       "keras_tensor_395": 0.58,
//       "keras_tensor_397": 0.28,
//       "keras_tensor_399": -0.54,
//       "keras_tensor_401": -1.25,
//       "keras_tensor_403": -0.54,
//       "keras_tensor_405": -0.06
//     },
//     "individual_overall": 0,
//     "heatmap_url": "https://firebasestorage.googleapis.com/v0/b/fresh-sweeper.appspot.com/o/task_photos%2F5aed801f-e85c-4818-8a68-727e6f283485_heatmap.jpg?alt=media",
//     "problem_area": "keras_tensor_347",
//     "spot_count": 12,
//     "rating_version": "v4.2"
//   }
// }
// ],
// "tasks": [
// {
//   "label": "Change linens",
//   "value": true,
//   "name": "change_linens_bedroom",
//   "id": "task_01"
// },
// {
//   "label": "Make the bed",
//   "value": true,
//   "name": "make_bed_bedroom",
//   "id": "task_02"
// },
// {
//   "label": "Dust surfaces",
//   "value": true,
//   "name": "dust_surfaces_bedroom",
//   "id": "task_03"
// },
// {
//   "label": "Vacuum carpet",
//   "value": true,
//   "name": "vacuum_carpet_bedroom",
//   "id": "task_04"
// },
// {
//   "label": "Organize closet",
//   "value": true,
//   "name": "organize_closet_bedroom",
//   "id": "task_05"
// },
// {
//   "label": "Check for damages",
//   "value": true,
//   "name": "check_damages_bedroom",
//   "id": "task_06"
// }
// ]
// },
// "Bathroom": {
// "photos": [],
// "tasks": [
// {
//   "label": "Clean toilet",
//   "value": false,
//   "name": "clean_toilet_bathroom",
//   "id": "task_07"
// },
// {
//   "label": "Wipe mirrors",
//   "value": false,
//   "name": "wipe_mirrors_bathroom",
//   "id": "task_08"
// },
// {
//   "label": "Sanitize sink",
//   "value": false,
//   "name": "sanitize_sink_bathroom",
//   "id": "task_09"
// },
// {
//   "label": "Empty trash",
//   "value": false,
//   "name": "empty_trash_bathroom",
//   "id": "task_10"
// },
// {
//   "label": "Check for mold",
//   "value": false,
//   "name": "check_mold_bathroom",
//   "id": "task_11"
// }
// ]
// },
// "Livingroom": {
// "photos": [],
// "tasks": [
// {
//   "label": "Sweep & Mop",
//   "value": false,
//   "name": "sweep_mop_livingroom",
//   "id": "task_12"
// },
// {
//   "label": "Vacuum",
//   "value": false,
//   "name": "vacuum_livingroom",
//   "id": "task_13"
// },
// {
//   "label": "Clean upholstery",
//   "value": false,
//   "name": "clean_upholstery_livingroom",
//   "id": "task_14"
// },
// {
//   "label": "Dust electronics",
//   "value": false,
//   "name": "dust_electronics_livingroom",
//   "id": "task_15"
// },
// {
//   "label": "Dust furniture",
//   "value": false,
//   "name": "dust_furniture_livingroom",
//   "id": "task_16"
// },
// {
//   "label": "Dust surfaces",
//   "value": false,
//   "name": "dust_surfaces_livingroom",
//   "id": "task_17"
// },
// {
//   "label": "Organize & tidy up",
//   "value": false,
//   "name": "organize_tidy_up_livingroom",
//   "id": "task_18"
// },
// {
//   "label": "Check for damages",
//   "value": false,
//   "name": "check_damages_livingroom",
//   "id": "task_19"
// }
// ]
// },
// "Kitchen": {
// "photos": [],
// "tasks": [
// {
//   "label": "Wipe countertops",
//   "value": false,
//   "name": "wipe_countertops_kitchen",
//   "id": "task_20"
// },
// {
//   "label": "Empty & clean fridge",
//   "value": false,
//   "name": "empty_clean_fridge_kitchen",
//   "id": "task_21"
// },
// {
//   "label": "Empty trash",
//   "value": false,
//   "name": "empty_trash_kitchen",
//   "id": "task_22"
// },
// {
//   "label": "Clean stovetop & oven",
//   "value": false,
//   "name": "clean_stovetop_oven_kitchen",
//   "id": "task_23"
// },
// {
//   "label": "Scrub the sink",
//   "value": false,
//   "name": "scrub_sink_kitchen",
//   "id": "task_24"
// },
// {
//   "label": "Sweep & Mop floor",
//   "value": false,
//   "name": "sweep_mop_floor_kitchen",
//   "id": "task_25"
// },
// {
//   "label": "Check for expired food",
//   "value": false,
//   "name": "check_expired_food_kitchen",
//   "id": "task_26"
// }
// ]
// },
// "Extra Cleaning": {
// "photos": [],
// "tasks": [
// {
//   "label": "Inside Fridge",
//   "value": false,
//   "name": "inside_fridge",
//   "id": "task_27"
// },
// {
//   "label": "Inside Oven",
//   "value": false,
//   "name": "inside_oven",
//   "id": "task_28"
// },
// {
//   "label": "Pet Cleanup",
//   "value": false,
//   "name": "pet_cleanup",
//   "id": "task_29"
// }
// ]
// }
// }