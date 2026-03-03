import React, {useState, useEffect} from 'react';
import { SafeAreaView,Text, StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import CardNoPrimary from '../../components/shared/CardNoPrimary';
import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
import COLORS from '../../constants/colors';
import CustomCalendar from '../../components/shared/CustomCalendar';
import userService from '../../services/connection/userService';

const AvailabilityDisplay = ({handleOpenAvailability, cleanerId, mode }) => {
    
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    
    // console.log("availability_________")
    // console.log(availability)
    // console.log("availability_________1")

    // const data = {
    //   cleaner_id: "cleaner_123",
    //   availability: [
    //     { day: "Monday", slots: [{ start: "08:00", end: "12:00" }] },
    //     { day: "Tuesday", slots: [{ start: "14:00", end: "18:00" }] },
    //     { day: "Wednesday", slots: [{ start: "14:00", end: "18:00" }] },
    //     { day: "Thursday", slots: [{ start: "14:00", end: "18:00" }] },
    //     { day: "Friday", slots: [{ start: "14:00", end: "18:00" }] },
    //     { day: "Saturday", slots: [{ start: "14:00", end: "18:00" }] },
    //     { day: "Sunday", slots: [{ start: "14:00", end: "18:00" }] }
    //   ],
    //   booked_schedules: [
    //     { schedule_id: "schedule_456", date: "2025-02-19", start: "10:00", end: "12:00" },
    //     { schedule_id: "schedule_456", date: "2025-02-19", start: "12:00", end: "14:00" }
    //   ]
    // };

    

    useEffect(() => {
      
      const fetchAvailability = async () => {
          try {
              const response = await userService.getCleanerAvailability(cleanerId);
              const res = response.data.data;
            
              // const response = await userService.getCleanerAvailability(cleanerId);
              // if (!response.ok) throw new Error('Failed to fetch availability');
              console.log(res)
              // const data = await res;
              setAvailability(res);
          } catch (err) {
              setError(err.message);
          } finally {
              setLoading(false);
          }
      };

      fetchAvailability();
  }, [cleanerId]);

  if (loading) {
      return <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  if (error) {
      return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;
  }

    return (
      <View>
        <CardNoPrimary>
            <View style={styles.titleContainer}>
              <Text bold style={styles.title}>Availability</Text> 

              {mode==="edit" && 
                <View style={styles.actions}>
                    <CircleIconNoLabel 
                        iconName="pencil"
                        buttonSize={30}
                        radiusSise={15}
                        iconSize={16}
                        onPress={handleOpenAvailability}
                    /> 
                </View>
              }
              

            </View>
            <View style={styles.line}></View>
              <View style={styles.content}>
              <View style={styles.container}>

              <ScrollView>
                
  
                <CustomCalendar
                  availability={availability?.availability || []}
                  bookedSchedules={availability?.booked_schedules || []}
                />

                </ScrollView>
              </View>

              </View>
              
            </CardNoPrimary>
        </View>    
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        width:'100%'
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    availabilityItem: {
        flexDirection: 'row',
        marginBottom: 4,
        justifyContent:'space-between',
        alignItems:'center'
    },
    day: {
        fontWeight: '400',
        marginRight: 8,
    },
    timeRange: {
        flex: 1,
        color:COLORS.gray,
        fontSize:12
    },
    unavailable: {
        color: 'red', // Customize the color or style as needed
        flex: 1,
    },
    line:{
        borderBottomWidth:0.8,
        borderColor:COLORS.light_gray_1,
        marginVertical:5,
        height:4
      },
      titleContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:0
      },
      title:{
          fontSize:16,
          fontWeight:'bold'
        
      },
      content:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginVertical:5
      },
      actions:{
        flexDirection:'row',
    
      },
      empty:{
        justifyContent:'center',
        alignItems:'center',
        height:120
      }
});

export default AvailabilityDisplay;

