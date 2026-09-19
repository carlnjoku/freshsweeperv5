// components/cleaner/CleanerCardSkeleton.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HomeSkeleton } from '../shared/skeleton/HomeSkeleton';
import COLORS from '../../constants/colors';

const CleanerCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Header: avatar + name + location */}
      <View style={styles.header}>
        <HomeSkeleton width={50} height={50} variant="circle" />
        <View style={styles.info}>
          <HomeSkeleton width={120} height={16} />
          <HomeSkeleton width={160} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Meta: rating, member since, badge icons, jobs */}
      <View style={styles.meta}>
        <View style={styles.badge}>
          <HomeSkeleton width={16} height={16} variant="circle" />
          <HomeSkeleton width={30} height={14} style={{ marginLeft: 4 }} />
        </View>
        <View style={styles.badge}>
          <HomeSkeleton width={16} height={16} variant="circle" />
          <HomeSkeleton width={80} height={14} style={{ marginLeft: 4 }} />
        </View>
        <View style={styles.badge}>
          <HomeSkeleton width={16} height={16} variant="circle" />
        </View>
        <HomeSkeleton width={50} height={14} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Performance section */}
      {/* <View style={styles.performanceContainer}>
        <HomeSkeleton width={80} height={12} />
        <View style={styles.performanceStats}>
          <View style={styles.performanceItem}>
            <HomeSkeleton width={14} height={14} variant="circle" />
            <HomeSkeleton width={40} height={12} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.performanceItem}>
            <HomeSkeleton width={14} height={14} variant="circle" />
            <HomeSkeleton width={50} height={12} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.performanceItem}>
            <HomeSkeleton width={14} height={14} variant="circle" />
            <HomeSkeleton width={60} height={12} style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View> */}

      {/* Badges row */}
      <View style={styles.badgesRow}>
        <HomeSkeleton width={80} height={20} style={{ borderRadius: 20 }} />
        <HomeSkeleton width={80} height={20} style={{ borderRadius: 20, marginLeft: 8 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 5,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  performanceContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  performanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default CleanerCardSkeleton;