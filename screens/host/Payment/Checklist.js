// import React, { useEffect, useState, useContext } from 'react';
// import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
// import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';

// export default function Checklist() {
//     const { currentUserId } = useContext(AuthContext);
//     const navigation = useNavigation();
//     const [checklists, setChecklists] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
  
//     const fetchChecklists = async () => {
//       setLoading(true);
//       try {
//         const res = await userService.getChecklists(currentUserId);
//         console.log("Checklistttttttt", res.data)
//         setChecklists(res.data || []);
//       } catch (err) {
//         console.error('Failed to fetch checklists:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     useEffect(() => {
//       fetchChecklists();
//     }, []);
  
//     const onRefresh = async () => {
//       setRefreshing(true);
//       await fetchChecklists();
//       setRefreshing(false);
//     };
  
//     const renderChecklist = ({ item }) => (
//       <TouchableOpacity
//         onPress={() => navigation.navigate('ChecklistDetails', { checklistId: item._id })}
//       >
//         <Card style={styles.card}>
//           <Card.Title
//             title={item.checklistName || 'Unnamed Checklist'}
//             subtitle={`Property: ${item.propertyName || 'N/A'}`}
//             left={() => (
//               <MaterialIcons
//                 name="checklist"
//                 size={28}
//                 color={COLORS.primary}
//                 style={{ marginLeft: 4 }}
//               />
//             )}
//           />
//           <Card.Content>
//             <Text variant="bodySmall">Groups: {Object.keys(item.checklist || {}).length}</Text>
//             <Text variant="bodySmall">Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
//           </Card.Content>
//         </Card>
//       </TouchableOpacity>
//     );
  
//     if (loading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text>Loading checklists...</Text>
//         </View>
//       );
//     }
  
//     return (
//       <View style={styles.container}>
//         <FlatList
//           data={checklists}
//           keyExtractor={(item) => item._id}
//           renderItem={renderChecklist}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           ListEmptyComponent={<Text style={styles.emptyText}>No checklists found.</Text>}
//         />
//         <FAB
//           icon="plus"
//           label="New Checklist"
//           style={styles.fab}
//           onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
//         />
//       </View>
//     );
// }


// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       padding: 10,
//     },
//     card: {
//       marginBottom: 12,
//       backgroundColor: '#fafafa',
//     },
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     fab: {
//       position: 'absolute',
//       right: 16,
//       bottom: 16,
//       backgroundColor: COLORS.primary,
//     },
//     emptyText: {
//       textAlign: 'center',
//       marginTop: 40,
//       fontSize: 16,
//       color: COLORS.gray,
//     },
//   });
  


import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl, 
  Dimensions,
  ImageBackground
} from 'react-native';
import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function Checklist() {
  const { currentUserId } = useContext(AuthContext);
  const navigation = useNavigation();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const res = await userService.getChecklists(currentUserId);
      setChecklists(res.data || []);
    } catch (err) {
      console.error('Failed to fetch checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChecklists();
    setRefreshing(false);
  };

  const renderChecklist = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(ROUTES.host_edit_checklist, { checklistId: item._id })}
      activeOpacity={0.9}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="checklist"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                {item.checklistName || 'Unnamed Checklist'}
              </Text>
              <Text variant="bodySmall" style={styles.propertyText}>
                {item.propertyName || 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailPill}>
              <Text variant="labelSmall" style={styles.detailLabel}>GROUPS</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {Object.keys(item.checklist || {}).length}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailPill}>
              <Text variant="labelSmall" style={styles.detailLabel}>CREATED</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your checklists</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {checklists.length > 0 ? (
        <FlatList
          data={checklists}
          keyExtractor={(item) => item._id}
          renderItem={renderChecklist}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="checklist" size={60} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>No Checklists Yet</Text>
          <Text style={styles.emptySubtitle}>Create your first checklist to get started</Text>
        </View>
      )}
      
      <FAB
        icon="plus"
        label="New Checklist"
        style={styles.fab}
        onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
        color="white"
        uppercase={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
    paddingHorizontal: 0,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#3d5afe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#eef4ff',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
    fontSize: 16,
  },
  propertyText: {
    color: '#6c757d',
    fontSize: 13,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fe',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailPill: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#6c757d',
    marginBottom: 2,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  detailValue: {
    fontWeight: '600',
    color: COLORS.dark,
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e7ff',
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faff',
  },
  loadingText: {
    marginTop: 20,
    color: COLORS.gray,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8faff',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    maxWidth: 300,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
  },
});
 
  