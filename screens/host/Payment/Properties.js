import React, {useState, useEffect, useRef, useContext} from  'react';
import { SafeAreaView,StyleSheet,RefreshControl, Text, KeyboardAvoidingView, Keyboard, Platform, StatusBar, Linking,  FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import FloatingButton from '../../components/shared/FloatingButton';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

export default function Properties({navigation}) {

    const{currentUserId, currentUser} = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);

    const genericArray = new Array(5).fill(null);

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        // Call your API or refresh logic here
        await fetchProperties();  // Replace with your actual function to fetch data
        setRefreshing(false);
    };

    const fetchProperties = async () => {
        try {
            // Assuming userService.getPendingPayments fetches the pending payments from the API
            const response = await userService.getApartment(currentUserId);
            console.log("mmmmm", JSON.stringify(response.data, null, 2))
            setProperties(response.data);
            // console.log(response.data)
        } catch (error) {
            console.log(error);
            // alert('Error fetching pending payments');
        } finally {
            setLoading(false);
        }
    };
    
      useEffect(()=> {
      
        const unsubscribe = navigation.addListener('focus', () => {
          // Refresh data or reset state here
          fetchProperties()
          
      });
      
      fetchProperties()
      return unsubscribe; // Cleanup subscription
      
      },[])

      const handleOpenCreateBooking = () => {
        navigation.navigate(ROUTES.host_add_apt)
      }

      const emptyApartment = () => (
        <View style={styles.empty_apartment}>
          <Text>No apartment found</Text>
          <TouchableOpacity 
            style={styles.action_button}
            onPress = {() => navigation.navigate(ROUTES.host_add_apt)}
          >
            <Text style={styles.action_button_color}>Create new property</Text>
          </TouchableOpacity>
        </View>
      )
    
      if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />;
      }
    
    if (properties.length === 0) {
        return (
            <View style={styles.noData}>
                <Text style={styles.noDataText}>No properties listed.</Text>
            
                <FloatingButton 
                    onPress={handleOpenCreateBooking}
                    color="green"
                />
            </View>
        );
    }

  return (
    <SafeAreaView
          style={{
            flex:1,
            backgroundColor:COLORS.backgroundColor,
            justifyContent:"center",
            // alignItems:"center",
            marginBottom:0
          }}
        >
    
        <View style={styles.container}>
            <FlatList
                data={properties}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_apt_dashboard, {
                        property:item,
                        hostId:currentUserId,
                      })}
                      style={styles.apartmentItem}
                    >
                        
                    
                        <View style={styles.itemContent}>
                            <View>
                                <AntDesign name="home" size={40} color={COLORS.gray}/>
                            </View>
                            <View style={{marginLeft:15, width:"90%"}}>
                                <Text style={styles.apartmentName}>{item.apt_name}</Text>
                                <Text style={styles.apartmentAddress}>{item.address}</Text>
                            </View>
                        </View>
                   
                    </TouchableOpacity>
                )}
                ListEmptyComponent= {emptyApartment}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                
            />

       
        
        <FloatingButton 
            onPress={handleOpenCreateBooking}
            color="green"
        />

        </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
     
    },
    itemContent:{
        flexDirection:'row',
        alignItems:'center'
    },
    empty_listing: {
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      marginTop:'50%'
    },
    empty_apartment: {
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      marginTop:'50%'
    },
    // apartmentItem: {
    //   backgroundColor: '#fff',
    //   padding: 15,
    //   borderRadius: 5,
    //   marginBottom: 10,
    //   shadowColor: '#000',
    //   shadowOpacity: 0.1,
    //   shadowRadius: 10,
    //   shadowOffset: { width: 0, height: 0 },
    // },
    apartmentItem: {
      padding: 15,
      paddingVertical:20,
      marginVertical: 8,
      marginHorizontal:5,
      borderRadius: 8,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    apartmentName: {
        fontSize: 18,
        fontWeight:'500'
    },
    apartmentAddress:{
      fontSize: 14,
      color: COLORS.gray,
    },
    
    item_separator : {
        marginTop:5,
        marginBottom:5,
        height:1,
        width:"100%",
        backgroundColor:"#E4E4E4",
    },
    noData: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 18,
        color: COLORS.gray,
    },
  
  });