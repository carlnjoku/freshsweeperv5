

// components/host/PropertyCardList.js

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import CardNoPrimary from '../shared/CardNoPrimary';
import CircleIconNoLabel from '../shared/CirecleIconNoLabel';

const { width } = Dimensions.get('window');

const PropertyCardList = ({ properties = [], handleHostPress, currentUserId, navigation }) => {
  const hasProperties = properties && properties.length > 0;

  return (
    <View style={{ marginHorizontal: 0 }}>
      <CardNoPrimary>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Properties</Text>
          <CircleIconNoLabel
            iconName="plus"
            buttonSize={30}
            radiusSise={15}
            iconSize={16}
            onPress={handleHostPress}
          />
        </View>

        <View style={styles.line} />

        <View style={styles.content}>
          {hasProperties ? (
            <>
              {properties.slice(0, 2).map((property) => (
                <TouchableOpacity
                  key={property._id}
                  onPress={() =>
                    navigation.navigate(ROUTES.host_apt_dashboard, {
                      propertyId: property._id,
                      hostId: currentUserId,
                      property: property,
                    })
                  }
                  style={styles.propertyItem}
                >
                  <View style={styles.leftSection}>
                    <AntDesign name="home" size={20} color={COLORS.gray} style={{ marginRight: 10 }} />
                    <View>
                      <Text style={styles.propertyName}>{property.apt_name}</Text>
                      <Text style={styles.propertyAddress}>{property.address}</Text>
                    </View>
                  </View>
                  <AntDesign name="right" size={16} color={COLORS.gray} />
                </TouchableOpacity>
              ))}

              {properties.length > 2 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.host_my_apartment)}
                  style={styles.viewAllContainer}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              {/* Icon */}
              <View style={styles.emptyIconContainer}>
                <AntDesign name="home" size={40} color={COLORS.light_gray}/>
                
              </View>
              
              {/* Message */}
              <Text style={styles.emptyTitle}>No Properties Yet</Text>
              <Text style={styles.emptyDescription}>
                Add your first property to start managing cleaning schedules
              </Text>
              
              {/* Add Property Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleHostPress}
              >
                <MaterialCommunityIcons 
                  name="plus" 
                  size={20} 
                  color={COLORS.white} 
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.addButtonText}>Add First Property</Text>
              </TouchableOpacity>
              
              {/* Alternative: Learn More Link */}
              <TouchableOpacity
                style={styles.learnMoreContainer}
                onPress={() => navigation.navigate(ROUTES.host_help || 'Help')}
              >
                <Text style={styles.learnMoreText}>
                  Learn how to add and manage properties
                </Text>
                <AntDesign name="right" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CardNoPrimary>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  line: {
    borderBottomWidth: 1,
    borderColor: COLORS.light_gray_1,
    marginVertical: 10,
  },
  content: {
    gap: 12,
  },
  propertyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  propertyName: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.black,
  },
  propertyAddress: {
    fontSize: 12,
    color: COLORS.gray,
  },
  viewAllContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty State Styles
  emptyStateContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.very_light_gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark_gray,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: width * 0.6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  learnMoreText: {
    color: COLORS.primary,
    fontSize: 14,
    marginRight: 4,
  },
});

export default PropertyCardList;