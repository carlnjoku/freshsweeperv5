import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  Alert,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { IconButton, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import CircleIcon from '../../components/shared/CircleIcon';
import AddICalModal from '../../components/host/AddICalModal';
import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe'; // added import

export default function ICalendar({ route }) {
  const { property } = route.params;
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [syncedCalendars, setSyncedCalendars] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useState(null);

  // Room details
  const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
  const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
  const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
  const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
  const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
  const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
  const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
  const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

  // Booking platforms
  const bookingPlatforms = [
    {
      id: 'airbnb',
      name: tSafe('airbnb', 'Airbnb'),
      color: '#FF5A5F',
      description: tSafe('airbnb_desc', 'Sync your Airbnb calendar to automatically update availability'),
      icon: require('../../assets/images/airbnb_logo.png'),
    },
    {
      id: 'booking',
      name: tSafe('booking_com', 'Booking.com'),
      color: '#003580',
      description: tSafe('booking_desc', 'Connect your Booking.com account to manage reservations'),
      icon: require('../../assets/images/booking_logo.png'),
    },
    {
      id: 'vrbo',
      name: tSafe('vrbo', 'Vrbo'),
      color: '#00A699',
      description: tSafe('vrbo_desc', 'Link your Vrbo property to sync bookings and availability'),
      icon: require('../../assets/images/vrbo_logo.png'),
    },
    {
      id: 'ical',
      name: tSafe('other_calendar', 'Other Calendar'),
      color: '#6200EE',
      description: tSafe('ical_desc', 'Sync using a generic iCal URL'),
      icon: null,
    },
  ];

  // Helper functions
  const isPlatformConnected = (platformId) => {
    return syncedCalendars.some(cal => cal.platform === platformId);
  };

  const getCalendarForPlatform = (platformId) => {
    return syncedCalendars.find(cal => cal.platform === platformId);
  };

  // Fetch data
  const fetchChecklists = async () => {
    if (!property.checklists?.length) return;
    try {
      const response = await userService.getCustomChecklistsByProperty(property.checklists);
      setChecklists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    }
  };

  const fetchSyncedCals = async () => {
    try {
      const response = await userService.getSyncedCalsByApartmentIds(property._id);
      if (!response.data || response.data.length === 0) {
        setSyncedCalendars([]);
        return;
      }
      const calId = response.data[0]._id;
      const calendars = response.data[0].calendars
        ? response.data[0].calendars.map(calendar => ({
            ...calendar,
            propertyId: property._id,
            calId,
          }))
        : [];
      setSyncedCalendars(calendars);
    } catch (error) {
      console.error('Error fetching synced calendars:', error);
      setSyncedCalendars([]);
    }
  };

  const fetchCleaners = async () => {
    try {
      const response = await userService.getAllCleaners();
      setCleaners(response.data);
    } catch (error) {
      console.error('Error fetching cleaners:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_load_cleaners', 'Failed to load cleaners'));
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchSyncedCals(), fetchChecklists(), fetchCleaners()]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [property._id])
  );

  // Header edit button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="pencil"
          size={20}
          color={COLORS.primary}
          onPress={() => navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id })}
        />
      ),
    });
  }, [navigation, property]);

  // Handlers
  const handlePlatformPress = (platformId) => {
    const calendar = getCalendarForPlatform(platformId);
    if (calendar) {
      setSelectedCalendar(calendar);
    } else {
      setSelectedCalendar(null);
    }
    setSelectedPlatform(platformId);
    setModalVisible(true);
  };

  const handleSaveSync = async (data) => {
    try {
      if (selectedCalendar) {
        await userService.updateCalendar(data);
      } else {
        await userService.createSyncCalendar({
          aptId: data.aptId,
          calendar: data.calendar,
          selectedChecklist: data.selectedChecklist,
        });
      }
      await fetchSyncedCals();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
    } catch (error) {
      console.error('Error saving calendar sync:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
    }
  };

  const toggleSync = async (calendar) => {
    try {
      await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
      await fetchSyncedCals();
    } catch (error) {
      console.error('Error toggling sync:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_sync', 'Failed to update sync status'));
    }
  };

  const getPlatformName = (platformId) => {
    const map = {
      airbnb: tSafe('airbnb', 'Airbnb'),
      booking: tSafe('booking_com', 'Booking.com'),
      vrbo: tSafe('vrbo', 'Vrbo'),
      ical: tSafe('other_calendar', 'Other Calendar'),
    };
    return map[platformId] || platformId;
  };

  // Render components
  const renderPlatformCard = (platform) => {
    const calendar = getCalendarForPlatform(platform.id);
    const connected = !!calendar;
    return (
      <Animatable.View key={platform.id} animation="fadeInUp" duration={400} style={[styles.platformCard, { borderLeftColor: platform.color }]}>
        <TouchableOpacity onPress={() => handlePlatformPress(platform.id)} activeOpacity={0.8}>
          <View style={styles.platformCardContent}>
            <View style={styles.platformIconContainer}>
              {platform.icon ? (
                <Image source={platform.icon} style={styles.platformIcon} />
              ) : (
                <MaterialCommunityIcons name="calendar-sync" size={28} color={platform.color} />
              )}
            </View>
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>{platform.name}</Text>
              <Text style={styles.platformDescription}>{platform.description}</Text>
              {connected && calendar && (
                <View style={styles.connectionDetails}>
                  <Text style={styles.detailText} numberOfLines={1}>
                    {tSafe('url_label', 'URL:')} {calendar.ical_url || calendar.calendar_url || tSafe('no_url_provided', 'No URL provided')}
                  </Text>
                  {calendar.last_synced && (
                    <Text style={styles.detailText}>
                      {tSafe('last_synced', 'Last synced:')} {new Date(calendar.last_synced).toLocaleDateString()}
                    </Text>
                  )}
                  {calendar.assigned_cleaners?.length > 0 && (
                    <View style={styles.cleanerChips}>
                      {calendar.assigned_cleaners.map(cid => {
                        const cleaner = cleaners.find(c => c._id === cid);
                        return cleaner ? (
                          <View key={cid} style={styles.cleanerChip}>
                            <Avatar.Image size={20} source={{ uri: cleaner.avatarUrl }} />
                            <Text style={styles.cleanerChipText}>{cleaner.firstname}</Text>
                          </View>
                        ) : null;
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.platformStatus}>
              {connected ? (
                <>
                  <View style={styles.connectedBadge}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.connectedText}>{tSafe('linked', 'Linked')}</Text>
                  </View>
                  <Switch
                    value={calendar.enabled !== false}
                    onValueChange={() => toggleSync(calendar)}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                    style={styles.syncSwitch}
                  />
                </>
              ) : (
                <View style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>{tSafe('connect', 'Connect')}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderSyncedCalendarItem = (calendar) => {
    const platformName = getPlatformName(calendar.platform);
    return (
      <Animatable.View key={calendar._id} animation="fadeInUp" duration={400} style={styles.syncedCard}>
        <View style={styles.syncedCardContent}>
          <View style={styles.syncedIcon}>
            <MaterialCommunityIcons name="calendar-sync" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.syncedInfo}>
            <Text style={styles.syncedName}>{platformName}</Text>
            <Text style={styles.syncedUrl} numberOfLines={1}>
              {calendar.ical_url || calendar.calendar_url || tSafe('no_url', 'No URL')}
            </Text>
            {calendar.last_synced && (
              <Text style={styles.syncedDate}>
                {tSafe('last_synced', 'Last synced:')} {new Date(calendar.last_synced).toLocaleDateString()}
              </Text>
            )}
          </View>
          <Switch
            value={calendar.enabled !== false}
            onValueChange={() => toggleSync(calendar)}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </Animatable.View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Property Header Card */}
      <Animatable.View animation="fadeInUp" duration={500} style={styles.propertyCard}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyName}>{property.apt_name}</Text>
          <View style={styles.addressRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
            <Text style={styles.propertyAddress}>{property.address}</Text>
          </View>
          <View style={styles.roomStats}>
            <CircleIcon
              iconName="bed-empty"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={bedroomCount}
              roomSize={bedroomSize}
              type={tSafe('bedrooms', 'Bedrooms')}
            />
            <CircleIcon
              iconName="shower-head"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={bathroomCount}
              roomSize={bathroomSize}
              type={tSafe('bathrooms', 'Bathrooms')}
            />
            <CircleIcon
              iconName="silverware-fork-knife"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={kitchen}
              roomSize={kitchenSize}
              type={tSafe('kitchen', 'Kitchen')}
            />
            <CircleIcon
              iconName="seat-legroom-extra"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={livingroomCount}
              roomSize={livingroomSize}
              type={tSafe('livingroom', 'Livingroom')}
            />
          </View>
        </View>
      </Animatable.View>

      {/* Connect Calendars Section */}
      <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
        <Text style={styles.sectionTitle}>{tSafe('connect_calendars_title', 'Connect Your Calendars')}</Text>
        <Text style={styles.sectionSubtitle}>
          {tSafe('connect_calendars_subtitle', 'Sync with booking platforms to automatically update your availability')}
        </Text>
        <View style={styles.platformsContainer}>
          {bookingPlatforms.map(renderPlatformCard)}
        </View>
      </Animatable.View>

      {/* Synced Calendars List */}
      {syncedCalendars.length > 0 && (
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>{tSafe('connected_calendars_title', 'Your Connected Calendars')}</Text>
          {syncedCalendars.map(renderSyncedCalendarItem)}
        </Animatable.View>
      )}

      {/* Benefits Section */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>{tSafe('why_connect_calendars', 'Why Connect Calendars?')}</Text>
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitCard}>
            <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('auto_sync', 'Auto-Sync')}</Text>
            <Text style={styles.benefitText}>{tSafe('auto_sync_desc', 'Availability updates in real-time')}</Text>
          </View>
          <View style={styles.benefitCard}>
            <MaterialIcons name="block" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('no_overbooking', 'No Overbooking')}</Text>
            <Text style={styles.benefitText}>{tSafe('no_overbooking_desc', 'Prevent double bookings')}</Text>
          </View>
          <View style={styles.benefitCard}>
            <MaterialIcons name="schedule" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('save_time', 'Save Time')}</Text>
            <Text style={styles.benefitText}>{tSafe('save_time_desc', 'No manual calendar updates')}</Text>
          </View>
          <View style={styles.benefitCard}>
            <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>{tSafe('maximize_revenue', 'Maximize Revenue')}</Text>
            <Text style={styles.benefitText}>{tSafe('maximize_revenue_desc', 'Optimize your booking rates')}</Text>
          </View>
        </View>
      </Animatable.View>

      <AddICalModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPlatform(null);
          setSelectedCalendar(null);
        }}
        onSave={handleSaveSync}
        cleaners={cleaners}
        aptId={property._id}
        preselectedPlatform={selectedPlatform}
        existingCalendar={selectedCalendar}
        checklists={checklists}
        property={property}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  propertyHeader: {
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1E2F',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#6C6C80',
    marginLeft: 6,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C6C80',
    marginBottom: 16,
    lineHeight: 20,
  },
  platformsContainer: {
    gap: 12,
  },
  platformCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  platformCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  platformIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  platformIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E2F',
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 12,
    color: '#6C6C80',
    lineHeight: 16,
  },
  connectionDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  detailText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  cleanerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  cleanerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  cleanerChipText: {
    fontSize: 10,
    color: '#333',
    marginLeft: 4,
  },
  platformStatus: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  syncSwitch: {
    transform: [{ scale: 0.9 }],
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  syncedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  syncedInfo: {
    flex: 1,
  },
  syncedName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  syncedUrl: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 2,
  },
  syncedDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  benefitsSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#F9F9FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E2F',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#6C6C80',
    textAlign: 'center',
    lineHeight: 16,
  },
});