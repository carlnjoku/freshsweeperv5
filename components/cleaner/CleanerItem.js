import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, TouchableWithoutFeedback } from 'react-native';
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
import { tSafe } from '../../utils/tSafe'; // added import

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
          <Text style={styles.miles}>{pending_payment?.distance.toFixed(1) || 0} {tSafe('miles_away', 'miles away')}</Text>
          {/*<Text style={styles.apartment}>{pending_payment?.schedule?.address} </Text> */}
        </View>
                  
        <View style={{flex: 0.3, alignItems: 'flex-end'}}>
          <Text style={styles.date}>{tSafe('member_since', 'Member Since')}</Text>
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
        <Text style={styles.expire}>{tSafe('completed_20_jobs', 'Completed 20 jobs')}</Text>
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