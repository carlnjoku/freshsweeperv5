import React,{useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import COLORS from '../../../constants/colors';
import CleaningRequestItem from '../../../components/cleaner/CleaningRequestItem';
import { AuthContext } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function Requests({ requests = [] }) {
  
  const { currency } = useContext(AuthContext);
  const EmptyComponent = () => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600}
      delay={10}
    >
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <MaterialCommunityIcons
          name="inbox-outline"
          size={80}
          color="#ccc"
        />
      </View>
      <Text style={styles.emptyTitle}>No Requests</Text>
      <Text style={styles.emptyDescription}>
        You have no pending cleaning requests at the moment.
      </Text>
    </View>
    </Animatable.View>
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item, index) => item?._id || index.toString()}
      // renderItem={renderItem}
      renderItem={({ item }) => (
        // <CleaningRequestItem item={{ item }} status={item.status} currency={currency} />
        <CleaningRequestItem item={item} status={item.status} currency={currency} />
      )}
      contentContainerStyle={{
        flexGrow: requests.length === 0 ? 1 : undefined,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 30,
      }}
      ListEmptyComponent={EmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary_light || '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  propertyName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  // ✅ New fee badge style
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  declineButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  declineText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E53935',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.light_gray,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});