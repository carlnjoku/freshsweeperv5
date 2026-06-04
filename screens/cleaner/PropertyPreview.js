
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import COLORS from '../../constants/colors';
import CustomCard from '../../components/shared/CustomCard';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
// import { MAP_BOX_SECRET_KEY } from '../../secret';
import { tSafe } from '../../utils/tSafe'; // added import
import { MAP_BOX_SECRET_KEY } from '../../env';

// Helper to get room icon
const getRoomIcon = (type) => {
  if (type.includes('Bedroom')) return 'bed-queen-outline';
  if (type.includes('Bathroom')) return 'shower-head';
  if (type.includes('Livingroom')) return 'sofa-outline';
  if (type.includes('Kitchen')) return 'fridge-outline';
  return 'door-open';
};

// Format phone number
const formatPhone = (phone) => {
  if (!phone) return tSafe('na', 'N/A');
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Helper to count tasks in a room
const countTasksInRoom = (room) => {
  if (!room || !room.tasks) return 0;
  return room.tasks.length;
};

export default function PropertyPreview() {
  const route = useRoute();
  const { propertyId, inviteToken } = route.params || {};
  const { currentUserId } = useContext(AuthContext);

  

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(inviteToken ? 'pending' : null);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [processingInvite, setProcessingInvite] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [mapError, setMapError] = useState(false);

  // Checklists state
  const [checklists, setChecklists] = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [checklistsError, setChecklistsError] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scrollRef = useRef(null);
  alert(MAP_BOX_SECRET_KEY)
  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setError(tSafe('no_property_id', 'No property ID provided'));
        setLoading(false);
        return;
      }
      try {
        const response = await userService.getApartmentById(propertyId);
        const propData = response.data;
        setProperty(propData);

        if (propData.checklists && propData.checklists.length > 0) {
          await fetchChecklists(propData.checklists);
        }
      } catch (err) {
        console.error('Failed to load property:', err);
        setError(tSafe('unable_to_load_property', 'Unable to load property details. Please try again.'));
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe('failed_to_load_property', 'Failed to load property details.')
        );
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [propertyId]);

  // Fetch checklists by IDs
  const fetchChecklists = async (checklistIds) => {
    setChecklistsLoading(true);
    setChecklistsError(null);
    try {
      const response = await userService.getCustomChecklistsByProperty(checklistIds);
      setChecklists(response.data.data || []);
    } catch (err) {
      console.error('Failed to load checklists:', err);
      setChecklistsError(tSafe('could_not_load_checklists', 'Could not load checklists.'));
    } finally {
      setChecklistsLoading(false);
    }
  };

  // Generate static map URL
  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${property.latitude},${property.longitude})/${property.longitude},${property.latitude},15,0/400x200?access_token=${MAP_BOX_SECRET_KEY}`;
      setMapImageUrl(url);
      setMapError(false);
    }
  }, [property]);

  // Auto-scroll for invite banner
  useEffect(() => {
    if (inviteToken && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }, 300);
    }
  }, [inviteToken]);

  // Check for pending invite from the server (if user is logged in)
  useEffect(() => {
    const checkInviteStatus = async () => {
      if (!propertyId || !currentUserId) return;
      try {
        const response = await userService.getInviteStatus(propertyId, currentUserId);
        if (response.data && response.data.invite) {
          const invite = response.data.invite;
          setInviteDetails(invite);
          setInviteStatus('pending');
        } else if (!inviteToken) {
          // No pending invite and no token from deep link → no banner
          setInviteStatus(null);
        }
      } catch (err) {
        console.log('No pending invite or error', err);
        // If error, we still respect inviteToken from deep link
      }
    };
    checkInviteStatus();
  }, [propertyId, currentUserId, inviteToken]);

  // Accept handler – works for both token and platform invites
  const handleAcceptInvite = async () => {
    if (!currentUserId) return;
    setProcessingInvite(true);
    try {
      if (inviteDetails && inviteDetails.type === 'platform') {
        // Platform invite – use invite ID
        await userService.acceptPlatformInvite({
          propertyId: propertyId,
          cleanerId: currentUserId,
        });
      } else if (inviteToken || (inviteDetails && inviteDetails.token)) {
        // Email invite – use token
        const token = inviteToken || inviteDetails.token;
        await userService.acceptInvite({ 
          propertyId: propertyId, 
          cleanerId: currentUserId 
        });
      } else {
        throw new Error('No valid invite found');
      }
      setInviteStatus('accepted');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Accept failed:', err);
      Alert.alert(
        tSafe('error_title', 'Error'),
        err.response?.data?.error || tSafe('failed_to_accept_invitation', 'Failed to accept invitation')
      );
      setInviteStatus('pending');
    } finally {
      setProcessingInvite(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!currentUserId) return;
    setProcessingInvite(true);
    try {
      if (inviteDetails && inviteDetails.type === 'platform') {
        await userService.declinePlatformInvite({
          inviteId: inviteDetails._id,
          cleanerId: currentUserId,
        });
      } else if (inviteToken || (inviteDetails && inviteDetails.token)) {
        const token = inviteToken || inviteDetails.token;
        await userService.declineInvite({ token, cleanerId: currentUserId });
      } else {
        throw new Error('No valid invite found');
      }
      setInviteStatus('declined');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error('Decline failed:', err);
      Alert.alert(
        tSafe('error_title', 'Error'),
        err.response?.data?.error || tSafe('failed_to_decline_invitation', 'Failed to decline invitation')
      );
      setInviteStatus('pending');
    } finally {
      setProcessingInvite(false);
    }
  };

  const openChecklistModal = (checklist) => {
    setSelectedChecklist(checklist);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChecklist(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_property', 'Loading property...')}</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error || tSafe('property_not_found', 'Property not found')}</Text>
      </View>
    );
  }

  const showInviteBanner = inviteStatus === 'pending' && (inviteDetails || inviteToken);

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Invite Banner */}
        {showInviteBanner && (
          <InviteBanner
            status="pending"
            onAccept={handleAcceptInvite}
            onDecline={handleDeclineInvite}
            processing={processingInvite}
          />
        )}
        {inviteStatus === 'accepted' && (
          <View style={styles.inviteCard}>
            <View style={styles.acceptedRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.acceptedText}>
                {tSafe('invitation_accepted', 'Invitation accepted. You can now schedule a cleaning.')}
              </Text>
            </View>
          </View>
        )}

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerOverlay}>
            <Text style={styles.propertyName}>{property.apt_name}</Text>
            <View style={styles.propertyTypeBadge}>
              <Text style={styles.propertyTypeText}>{property.apt_type?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Map & Address Card */}
        <View style={styles.mapCard}>
          {mapImageUrl && !mapError ? (
            <Image
              source={{ uri: mapImageUrl }}
              style={styles.mapImage}
              resizeMode="cover"
              onError={() => setMapError(true)}
            />
          ) : (
            <View style={[styles.mapImage, styles.mapPlaceholder]}>
              <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.gray} />
              <Text style={styles.placeholderText}>{tSafe('map_unavailable', 'Map unavailable')}</Text>
            </View>
          )}
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.addressText}>{property.address}</Text>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() =>
                Linking.openURL(
                  `https://maps.apple.com/?daddr=${property.latitude},${property.longitude}`
                )
              }
            >
              <Text style={styles.directionsText}>{tSafe('directions', 'Directions')}</Text>
              <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Owner Contact Card */}
        <CustomCard style={styles.card}>
          <Text style={styles.cardTitle}>{tSafe('owner_and_contact', 'Owner & Contact')}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={18} color={COLORS.darkGray} />
            <Text style={styles.infoLabel}>{tSafe('name_label', 'Name:')}</Text>
            <Text style={styles.infoValue}>{property.owner_info?.firstname || tSafe('na', 'N/A')}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={18} color={COLORS.darkGray} />
            <Text style={styles.infoLabel}>{tSafe('email_label', 'Email:')}</Text>
            <Text style={styles.infoValue}>{property.owner_info?.email || tSafe('na', 'N/A')}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={COLORS.darkGray} />
            <Text style={styles.infoLabel}>{tSafe('phone_label', 'Phone:')}</Text>
            <Text style={styles.infoValue}>{formatPhone(property.contact_phone || property.owner_info?.phone)}</Text>
          </View>
        </CustomCard>

        {/* Instructions Card (if any) */}
        {property.instructions && (
          <CustomCard style={styles.card}>
            <Text style={styles.cardTitle}>{tSafe('special_instructions', 'Special Instructions')}</Text>
            <Text style={styles.instructionsText}>{property.instructions}</Text>
          </CustomCard>
        )}

        {/* Checklists Card */}
        {property.checklists && property.checklists.length > 0 && (
          <CustomCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
              {checklistsLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>
            {checklistsError ? (
              <Text style={styles.errorText}>{checklistsError}</Text>
            ) : checklists.length === 0 && !checklistsLoading ? (
              <Text style={styles.emptyText}>{tSafe('no_checklists_found', 'No checklists found.')}</Text>
            ) : (
              checklists.map((checklist, index) => (
                <TouchableOpacity
                  key={checklist._id || index}
                  style={styles.checklistItem}
                  onPress={() => openChecklistModal(checklist)}
                >
                  <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
                  <View style={styles.checklistInfo}>
                    <Text style={styles.checklistName}>
                      {checklist.checklistName || tSafe('unnamed_checklist', 'Unnamed Checklist')}
                    </Text>
                    <View style={styles.checklistMetaRow}>
                      <Text style={styles.checklistMeta}>⏱️ {checklist.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
                      <Text style={styles.checklistMeta}>💰 ${checklist.totalFee?.toFixed(2)}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              ))
            )}
          </CustomCard>
        )}

        {/* Room Details Card */}
        <CustomCard style={styles.card}>
          <Text style={styles.cardTitle}>{tSafe('room_details', 'Room Details')}</Text>
          <View style={styles.roomGrid}>
            {property.roomDetails?.map((room, index) => (
              <View key={index} style={styles.roomGridItem}>
                <MaterialCommunityIcons
                  name={getRoomIcon(room.type)}
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.roomType}>{room.type}</Text>
                <View style={styles.roomStats}>
                  <Text style={styles.roomCount}>
                    {room.number} {room.number > 1 ? tSafe('rooms', 'rooms') : tSafe('room', 'room')}
                  </Text>
                  <Text style={styles.roomSize}> • {room.size} {tSafe('sq_ft', 'sq ft')}</Text>
                </View>
                <Text style={styles.roomSizeRange}>({room.size_range})</Text>
              </View>
            ))}
          </View>
        </CustomCard>
      </ScrollView>

      {/* Checklist Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedChecklist?.checklistName || tSafe('checklist_details', 'Checklist Details')}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedChecklist && (
                <>
                  {/* Summary */}
                  <View style={styles.modalSummary}>
                    <Text style={styles.modalSummaryText}>
                      {tSafe('total_time_label', 'Total Time:')} {selectedChecklist.totalTime} {tSafe('minutes_abbr', 'min')}
                    </Text>
                    <Text style={styles.modalSummaryText}>
                      {tSafe('total_fee_label', 'Total Fee:')} ${selectedChecklist.totalFee?.toFixed(2)}
                    </Text>
                  </View>

                  {/* Rooms and Tasks */}
                  {selectedChecklist.checklist?.group_a?.details && (
                    Object.entries(selectedChecklist.checklist.group_a.details).map(([roomKey, room]) => (
                      <View key={roomKey} style={styles.modalRoomSection}>
                        <View style={styles.modalRoomHeader}>
                          <MaterialCommunityIcons name={getRoomIcon(roomKey)} size={20} color={COLORS.primary} />
                          <Text style={styles.modalRoomTitle}>{roomKey.replace(/_/g, ' ')}</Text>
                          <Text style={styles.modalTaskCount}>
                            ({countTasksInRoom(room)} {tSafe('tasks', 'tasks')})
                          </Text>
                        </View>
                        
                        {/* Tasks Grid - 2 columns */}
                        <View style={styles.tasksGrid}>
                          {room.tasks && room.tasks.map((task, idx) => (
                            <View key={idx} style={styles.modalTaskItem}>
                              <MaterialCommunityIcons
                                name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                size={10}
                                color={task.value ? COLORS.success : COLORS.gray}
                                style={styles.taskIcon}
                              />
                              <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
                                {task.label}
                              </Text>
                            </View>
                          ))}
                        </View>

                        {/* Notes if any */}
                        {room.notes?.text ? (
                          <Text style={styles.modalNotes}>📝 {room.notes.text}</Text>
                        ) : null}
                      </View>
                    ))
                  )}

                  {/* Extras if any */}
                  {selectedChecklist.checklist?.group_a?.details?.Extra && (
                    <View style={styles.modalRoomSection}>
                      <View style={styles.modalRoomHeader}>
                        <MaterialCommunityIcons name="star-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.modalRoomTitle}>{tSafe('extra_tasks', 'Extra Tasks')}</Text>
                      </View>
                      <View style={styles.tasksGrid}>
                        {selectedChecklist.checklist.group_a.details.Extra.tasks?.map((task, idx) => (
                          <View key={idx} style={styles.modalTaskItem}>
                            <MaterialCommunityIcons
                              name={task.value ? 'check-circle' : 'checkbox-blank-circle-outline'}
                              size={16}
                              color={task.value ? COLORS.success : COLORS.gray}
                              style={styles.taskIcon}
                            />
                            <Text style={[styles.modalTaskText, task.value && styles.modalTaskCompleted]}>
                              {task.label} {task.time && `(${task.time} ${tSafe('minutes_abbr', 'min')})`} {task.price && `+$${task.price}`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------------- InviteBanner Component ---------------- */
const InviteBanner = ({ status, onAccept, onDecline, processing }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (status !== 'pending') return null;

  return (
    <Animated.View style={[styles.inviteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.inviteTitle}>{tSafe('youre_invited', "✨ You're Invited!")}</Text>
      <Text style={styles.inviteText}>
        {tSafe('invite_text', "You've been invited to clean this property. Would you like to accept?")}
      </Text>
      <View style={styles.inviteButtons}>
        <TouchableOpacity
          style={[styles.acceptBtn, processing && styles.disabledBtn]}
          onPress={onAccept}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptText}>{tSafe('accept', 'Accept')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.declineBtn, processing && styles.disabledBtn]}
          onPress={onDecline}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <Text style={styles.declineText}>{tSafe('decline', 'Decline')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },

  /* Header Card */
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  propertyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  propertyTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  propertyTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },

  /* Map Card */
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  mapImage: {
    width: '100%',
    height: 150,
  },
  mapPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F5FF',
    borderRadius: 20,
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },

  /* General Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom:10,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },

  /* Info Row */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    width: 70,
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  /* Instructions */
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },

  /* Checklists */
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checklistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  checklistMetaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  checklistMeta: {
    fontSize: 13,
    color: '#666',
    marginRight: 12,
  },

  /* Room Grid */
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomGridItem: {
    width: '48%',
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  roomType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roomCount: {
    fontSize: 13,
    color: '#666',
  },
  roomSize: {
    fontSize: 13,
    color: '#666',
  },
  roomSizeRange: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  /* Invite Banner */
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  inviteText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  inviteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  declineText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 15,
  },
  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptedText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
    flex: 1,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0F5FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalSummaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalRoomSection: {
    marginBottom: 20,
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
    padding: 12,
  },
  modalRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalRoomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  modalTaskCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingRight: 10,
    marginBottom: 8,
  },
  modalTaskText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
    flexShrink: 1,
  },
  modalTaskCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  modalNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 28,
  },
  taskIcon: {
    marginRight: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

