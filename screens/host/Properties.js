// import React, {useState, useEffect, useRef, useContext} from  'react';
// import { SafeAreaView,StyleSheet,RefreshControl, Text, KeyboardAvoidingView, Keyboard, Platform, StatusBar, Linking,  FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import FloatingButton from '../../components/shared/FloatingButton';
// import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

// export default function Properties({navigation}) {

//     const{currentUserId, currentUser} = useContext(AuthContext)
//     const [refreshing, setRefreshing] = useState(false);

//     const genericArray = new Array(5).fill(null);

//     const [properties, setProperties] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Function to handle refresh
//     const onRefresh = async () => {
//         setRefreshing(true);
//         // Call your API or refresh logic here
//         await fetchProperties();  // Replace with your actual function to fetch data
//         setRefreshing(false);
//     };

//     const fetchProperties = async () => {
//         try {
//             // Assuming userService.getPendingPayments fetches the pending payments from the API
//             const response = await userService.getApartment(currentUserId);
//             console.log("mmmmm", JSON.stringify(response.data, null, 2))
//             setProperties(response.data);
//             // console.log(response.data)
//         } catch (error) {
//             console.log(error);
//             // alert('Error fetching pending payments');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//       useEffect(()=> {
      
//         const unsubscribe = navigation.addListener('focus', () => {
//           // Refresh data or reset state here
//           fetchProperties()
          
//       });
      
//       fetchProperties()
//       return unsubscribe; // Cleanup subscription
      
//       },[])

//       const handleOpenCreateBooking = () => {
//         navigation.navigate(ROUTES.host_add_apt)
//       }

//       const emptyApartment = () => (
//         <View style={styles.empty_apartment}>
//           <Text>No apartment found</Text>
//           <TouchableOpacity 
//             style={styles.action_button}
//             onPress = {() => navigation.navigate(ROUTES.host_add_apt)}
//           >
//             <Text style={styles.action_button_color}>Create new property</Text>
//           </TouchableOpacity>
//         </View>
//       )
    
//       if (loading) {
//         return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />;
//       }
    
//     if (properties.length === 0) {
//         return (
//             <View style={styles.noData}>
//                 <Text style={styles.noDataText}>No properties listed.</Text>
            
//                 <FloatingButton 
//                     onPress={handleOpenCreateBooking}
//                     color="green"
//                 />
//             </View>
//         );
//     }

//   return (
//     <SafeAreaView
//           style={{
//             flex:1,
//             backgroundColor:COLORS.backgroundColor,
//             justifyContent:"center",
//             // alignItems:"center",
//             marginBottom:0
//           }}
//         >
    
//         <View style={styles.container}>
        
//             <FlatList
//                 data={properties}
//                 keyExtractor={(item) => item._id.toString()}
//                 renderItem={({ item }) => (
//                     <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_apt_dashboard, {
//                         property:item,
//                         hostId:currentUserId,
//                       })}
//                       style={styles.apartmentItem}
//                     >
                        
                    
//                         <View style={styles.itemContent}>
//                             <View>
//                                 <AntDesign name="home" size={40} color={COLORS.gray}/>
//                             </View>
//                             <View style={{marginLeft:15, width:"90%"}}>
//                                 <Text style={styles.apartmentName}>{item.apt_name}</Text>
//                                 <Text style={styles.apartmentAddress}>{item.address}</Text>
//                             </View>
//                         </View>
                   
//                     </TouchableOpacity>
//                 )}
//                 ListEmptyComponent= {emptyApartment}
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                
//             />

       
        
//         <FloatingButton 
//             onPress={handleOpenCreateBooking}
//             color="green"
//         />

//         </View>
//     </SafeAreaView>
//   )
// }


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 10,
     
//     },
//     itemContent:{
//         flexDirection:'row',
//         alignItems:'center'
//     },
//     empty_listing: {
//       display:'flex',
//       justifyContent:'center',
//       alignItems:'center',
//       marginTop:'50%'
//     },
//     empty_apartment: {
//       display:'flex',
//       justifyContent:'center',
//       alignItems:'center',
//       marginTop:'50%'
//     },
//     // apartmentItem: {
//     //   backgroundColor: '#fff',
//     //   padding: 15,
//     //   borderRadius: 5,
//     //   marginBottom: 10,
//     //   shadowColor: '#000',
//     //   shadowOpacity: 0.1,
//     //   shadowRadius: 10,
//     //   shadowOffset: { width: 0, height: 0 },
//     // },
//     apartmentItem: {
//       padding: 15,
//       paddingVertical:20,
//       marginVertical: 8,
//       marginHorizontal:5,
//       borderRadius: 8,
//       backgroundColor: '#fff',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 3,
//     },
//     apartmentName: {
//         fontSize: 18,
//         fontWeight:'500'
//     },
//     apartmentAddress:{
//       fontSize: 14,
//       color: COLORS.gray,
//     },
    
//     item_separator : {
//         marginTop:5,
//         marginBottom:5,
//         height:1,
//         width:"100%",
//         backgroundColor:"#E4E4E4",
//     },
//     noData: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     noDataText: {
//         fontSize: 18,
//         color: COLORS.gray,
//     },
  
//   });


// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   RefreshControl,
//   Text,
//   KeyboardAvoidingView,
//   Keyboard,
//   Platform,
//   StatusBar,
//   Linking,
//   FlatList,
//   ScrollView,
//   Modal,
//   Image,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import FloatingButton from '../../components/shared/FloatingButton';
// import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

// export default function Properties({ navigation }) {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const [refreshing, setRefreshing] = useState(false);
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchProperties();
//     setRefreshing(false);
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setProperties(response.data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchProperties();
//     });
//     fetchProperties();
//     return unsubscribe;
//   }, []);

//   const handleOpenCreateBooking = () => {
//     navigation.navigate(ROUTES.host_add_apt);
//   };

//   const renderPropertyItem = ({ item }) => (
//     <TouchableOpacity
//       activeOpacity={0.8}
//       style={styles.propertyCard}
//       onPress={() =>
//         navigation.navigate(ROUTES.host_apt_dashboard, {
//           property: item,
//           hostId: currentUserId,
//         })
//       }
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.iconContainer}>
//           <AntDesign name="home" size={32} color={COLORS.primary} />
//         </View>
//         <View style={styles.infoContainer}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.apt_name}
//           </Text>
//           <Text style={styles.propertyAddress} numberOfLines={2}>
//             {item.address}
//           </Text>
//         </View>
//         <MaterialCommunityIcons
//           name="chevron-right"
//           size={24}
//           color={COLORS.gray}
//         />
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <AntDesign name="home" size={64} color={COLORS.lightGray} />
//       <Text style={styles.emptyTitle}>No Properties Yet</Text>
//       <Text style={styles.emptySubtitle}>
//         Get started by adding your first property
//       </Text>
//       <TouchableOpacity
//         style={styles.createButton}
//         onPress={handleOpenCreateBooking}
//       >
//         <Text style={styles.createButtonText}>+ Create New Property</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading properties...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <LinearGradient
//         colors={[COLORS.white, '#F8F9FA']}
//         style={styles.headerGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//       >
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>My Properties</Text>
//           <Text style={styles.headerSubtitle}>
//             {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
//           </Text>
//         </View>
//       </LinearGradient>

//       <FlatList
//         data={properties}
//         keyExtractor={(item) => item._id}
//         renderItem={renderPropertyItem}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={renderEmptyState}
//         showsVerticalScrollIndicator={false}
//       />

//       <FloatingButton
//         onPress={handleOpenCreateBooking}
//         color={COLORS.primary}
//         icon={<AntDesign name="plus" size={24} color="white" />}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.backgroundColor,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.backgroundColor,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   headerGradient: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   header: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 80, // space for floating button
//   },
//   propertyCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     overflow: 'hidden',
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary + '15',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   propertyAddress: {
//     fontSize: 13,
//     color: COLORS.gray,
//     lineHeight: 18,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//     paddingTop: 100,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 30,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   createButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });




import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  Linking,
  FlatList,
  ScrollView,
  Modal,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import FloatingButton from '../../components/shared/FloatingButton';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { tSafe } from '../../utils/tSafe'; // added import

export default function Properties({ navigation }) {
  const { currentUserId, currentUser } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  const fetchProperties = async () => {
    try {
      const response = await userService.getApartment(currentUserId);
      setProperties(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProperties();
    });
    fetchProperties();
    return unsubscribe;
  }, []);

  const handleOpenCreateBooking = () => {
    navigation.navigate(ROUTES.host_add_apt);
  };

  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.propertyCard}
      onPress={() =>
        navigation.navigate(ROUTES.host_apt_dashboard, {
          property: item,
          hostId: currentUserId,
        })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <AntDesign name="home" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {item.apt_name}
          </Text>
          <Text style={styles.propertyAddress} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={COLORS.gray}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AntDesign name="home" size={64} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>{tSafe('no_properties_yet', 'No Properties Yet')}</Text>
      <Text style={styles.emptySubtitle}>
        {tSafe('get_started_add_property', 'Get started by adding your first property')}
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleOpenCreateBooking}
      >
        <Text style={styles.createButtonText}>{tSafe('create_new_property', '+ Create New Property')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_properties', 'Loading properties...')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.white, '#F8F9FA']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tSafe('my_properties', 'My Properties')}</Text>
          <Text style={styles.headerSubtitle}>
            {properties.length} {properties.length === 1 ? tSafe('property', 'property') : tSafe('properties_plural', 'properties')} {tSafe('listed', 'listed')}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={renderPropertyItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton
        onPress={handleOpenCreateBooking}
        color={COLORS.primary}
        icon={<AntDesign name="plus" size={24} color="white" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundColor,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});