

import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl, 
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { 
  Text, 
  Card, 
  ActivityIndicator, 
  FAB, 
  Divider, 
  Menu,
  Avatar,
} from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Feather, 
  AntDesign,
  Ionicons,
  FontAwesome5 
} from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import Toast from 'react-native-toast-message';
import { tSafe } from '../../utils/tSafe'; // added import

const { width } = Dimensions.get('window');

export default function Checklist() {
  const { currentUserId, currentUser, userToken, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedChecklistForModal, setSelectedChecklistForModal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const alertShownRef = useRef(false);

  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const { status, message } = route.params || {};

      if (status === 'success' && message && !alertShownRef.current) {
        alertShownRef.current = true;

        Alert.alert(
          tSafe('delete_checklist_title', 'Delete Checklist'),
          message,
          [
            {
              text: tSafe('ok', 'OK'),
              onPress: () => {
                navigation.setParams({
                  status: undefined,
                  mode: undefined,
                  message: undefined,
                });
                alertShownRef.current = false;
              },
            },
          ],
          { cancelable: true }
        );
      }

      return () => {
        alertShownRef.current = false;
      };
    }, [route.params, navigation])
  );

  const openChecklistModal = (checklist) => {
    setSelectedChecklistForModal(checklist);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChecklistForModal(null);
  };

  const formatRoomCounts = (rooms) => {
    if (!rooms || !Array.isArray(rooms)) return tSafe('no_rooms', '0 rooms');
    const roomCounts = {};
    rooms.forEach(room => {
      const roomType = room.split('_')[0];
      roomCounts[roomType] = (roomCounts[roomType] || 0) + 1;
    });
    return Object.entries(roomCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const formatRoomLabel = (roomKey) => {
    if (!roomKey) return tSafe('room', 'Room');
    const parts = roomKey.split('_');
    const roomType = parts[0] || 'Room';
    const roomNumber = parts[1] || '';
    const formattedType = roomType.charAt(0).toUpperCase() + roomType.slice(1);
    return roomNumber ? `${formattedType} ${parseInt(roomNumber) + 1}` : formattedType;
  };

  const renderRoomTasks = (roomData, roomKey) => {
    if (!roomData?.tasks || !Array.isArray(roomData.tasks)) {
      return (
        <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
      );
    }
    return (
      <View style={styles.tasksGrid}>
        {roomData.tasks.map((task, index) => (
          <View key={`task-${roomKey}-${index}`} style={styles.taskItem}>
            <View style={styles.taskIconContainer}>
              <Feather 
                name={task.value ? "check-circle" : "circle"} 
                size={16} 
                color={task.value ? "#10B981" : "#9CA3AF"} 
              />
            </View>
            <Text style={styles.taskText} numberOfLines={2}>
              {task.label || task.name || `${tSafe('task_prefix', 'Task')} ${index + 1}`}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const formatDuration = (minutes) => {
    if (minutes == null || isNaN(minutes)) return '0h : 00m';
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h : ${String(mins).padStart(2, '0')}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return tSafe('na', 'N/A');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return tSafe('invalid_date', 'Invalid Date');
    }
  };

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      console.log("Fetching checklists for user:", currentUserId);
      const res = await userService.getChecklists(currentUserId);
  
      let checklistsData = [];
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          checklistsData = res.data;
        } else if (Array.isArray(res)) {
          checklistsData = res;
        }
      }
  
      const sortedChecklists = [...checklistsData].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a._id < b._id ? 1 : -1;
      });
  
      setChecklists(sortedChecklists);
    } catch (err) {
      console.error('Failed to fetch checklists:', err);
      Toast.show({
        type: 'error',
        text1: tSafe('failed_load_checklists', 'Failed to load checklists'),
        text2: err.response?.data?.message || err.message || tSafe('please_try_again', 'Please try again'),
      });
      setChecklists([]);
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

  const handleEditChecklist = (checklist) => {
    navigation.navigate(ROUTES.host_edit_checklist, { 
      checklistId: checklist._id,
      onChecklistUpdated: fetchChecklists
    });
  };

  const handleCreateChecklist = () => {
    navigation.navigate(ROUTES.host_create_checklist, { 
      onChecklistCreated: fetchChecklists
    });
  };

  const handleDuplicateChecklist = async (checklist) => {
    try {
      const duplicateData = {
        ...checklist,
        checklistName: `${checklist.checklistName} (${tSafe('copy_suffix', 'Copy')})`,
        apt_name: checklist.apartment_name,
        hostId: currentUserId,
      };
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
  
      const res = await userService.saveChecklist(duplicateData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
  
      if (res.status === 200) {
        Alert.alert(
          tSafe('checklist_duplicated_title', 'Checklist duplicated'),
          tSafe('checklist_duplicated_message', 'A copy has been created'),
          [
            {
              text: tSafe('ok', 'OK'),
              onPress: () => fetchChecklists(),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Failed to duplicate checklist:', err);
      Alert.alert(
        tSafe('duplicate_failed_title', 'Duplicate failed'),
        tSafe('duplicate_failed_message', 'Unable to duplicate this checklist. Please try again.'),
        [{ text: tSafe('ok', 'OK') }]
      );
    }
  };

  const handleUnauthorized = () => {
    Alert.alert(
      tSafe('session_expired_title', 'Session Expired'),
      tSafe('please_login_again', 'Please log in again.'),
      [
        {
          text: tSafe('ok', 'OK'),
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: ROUTES.signin }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteChecklist = (checklist_name, selectedChecklistId) => {
    Alert.alert(
      tSafe('delete_checklist_title', 'Delete Checklist'),
      tSafe('delete_checklist_confirm', 'Are you sure you want to delete "{name}"? This action cannot be undone.', { name: checklist_name || tSafe('unnamed_checklist', 'Unnamed Checklist') }),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (!userToken) {
                handleUnauthorized();
                return;
              }
              const res = await userService.deleteChecklist(selectedChecklistId, userToken);
              if (res.status === 200 || res.data?.status === 'success') {
                Alert.alert(
                  tSafe('success_title', 'Success'),
                  tSafe('checklist_deleted_success', 'Checklist has been removed successfully.'),
                  [{ text: tSafe('ok', 'OK'), onPress: () => fetchChecklists() }]
                );
              } else {
                throw new Error(`Server returned status: ${res.status}`);
              }
            } catch (err) {
              console.error('❌ Delete error:', err);
              if (err.response?.status === 401) {
                handleUnauthorized();
              } else {
                let errorMessage = tSafe('please_try_again', 'Please try again');
                if (err.response) {
                  const { status, data } = err.response;
                  if (status === 404) errorMessage = tSafe('checklist_not_found', 'Checklist not found. It may have already been deleted.');
                  else if (status === 403) errorMessage = tSafe('not_authorized_delete', 'You are not authorized to delete this checklist.');
                  else if (data?.detail) errorMessage = data.detail;
                  else if (data?.message) errorMessage = data.message;
                } else if (err.request) {
                  errorMessage = tSafe('network_error', 'Network error. Please check your connection.');
                } else {
                  errorMessage = err.message || tSafe('unknown_error', 'Unknown error occurred.');
                }
                Toast.show({
                  type: 'error',
                  text1: tSafe('failed_delete_checklist', 'Failed to delete checklist'),
                  text2: errorMessage,
                });
              }
            }
          },
        },
      ]
    );
  };

  const getChecklistStats = (checklist) => {
    const checklistData = checklist?.checklist || {};
    const groups = Object.keys(checklistData);
    let totalTasks = 0;
    let totalTime = checklist.totalTime || 0;
    let totalFee = checklist.totalFee || 0;

    groups.forEach(groupKey => {
      const group = checklistData[groupKey];
      if (group && group.details) {
        const roomTypes = Object.keys(group.details);
        roomTypes.forEach(roomType => {
          const room = group.details[roomType];
          if (room && room.tasks && Array.isArray(room.tasks)) {
            totalTasks += room.tasks.length;
          }
        });
      }
    });

    return { groups: groups.length, totalTasks, totalTime, totalFee };
  };

  const filteredChecklists = searchQuery.trim() === '' 
    ? checklists 
    : checklists.filter(checklist =>
        checklist.checklistName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const renderChecklistItem = ({ item: checklist }) => {
    const stats = getChecklistStats(checklist);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.cardWrapper}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.checklistIconContainer}>
                <MaterialIcons name="checklist-rtl" size={24} color="#FFF" />
              </View>
              <View style={styles.checklistInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {checklist.checklistName || tSafe('unnamed_checklist', 'Unnamed Checklist')}
                </Text>
                <View style={styles.propertyBadge}>
                  <Ionicons name="business-outline" size={12} color="#6B7280" />
                  <Text style={styles.propertyText} numberOfLines={1}>
                    {checklist.propertyId ? `${checklist.apartment_name}` : tSafe('no_property', 'No Property')}
                  </Text>
                </View>
              </View>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(checklist._id)}
                  activeOpacity={0.7}
                >
                  <Feather name="more-vertical" size={22} color="#6B7280" />
                </TouchableOpacity>

                {menuVisible === checklist._id && (
                  <>
                    <TouchableOpacity
                      style={styles.menuBackdrop}
                      activeOpacity={1}
                      onPress={() => setMenuVisible(null)}
                    />
                    <Animated.View 
                      style={styles.menuCard}
                      entering={FadeIn.duration(150)}
                      exiting={FadeOut.duration(150)}
                    >
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setMenuVisible(null);
                          handleDuplicateChecklist(checklist);
                        }}
                        activeOpacity={0.6}
                      >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#F0F9FF' }]}>
                          <Feather name="copy" size={16} color="#0EA5E9" />
                        </View>
                        <Text style={[styles.menuText, { color: '#111827' }]}>{tSafe('duplicate', 'Duplicate')}</Text>
                        <Feather name="chevron-right" size={16} color="#9CA3AF" />
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          handleDeleteChecklist(checklist.checklistName, checklist._id);
                        }}
                        activeOpacity={0.6}
                      >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#FEF2F2' }]}>
                          <Feather name="trash-2" size={16} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuText, { color: '#EF4444' }]}>{tSafe('delete', 'Delete')}</Text>
                        <Feather name="chevron-right" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                )}
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.groups}</Text>
                <Text style={styles.statLabel}>{tSafe('teams', 'Teams')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalTasks}</Text>
                <Text style={styles.statLabel}>{tSafe('tasks', 'Tasks')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(stats.totalTime)}</Text>
                <Text style={styles.statLabel}>{tSafe('time', 'Time')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.totalFee.toFixed(0)}</Text>
                <Text style={styles.statLabel}>{tSafe('total', 'Total')}</Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={14} color="#9CA3AF" />
                <Text style={styles.dateText}>
                  {formatDate(checklist.createdAt)}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    openChecklistModal(checklist);
                  }}
                >
                  <Feather name="eye" size={16} color="#3B82F6" />
                  <Text style={styles.viewButtonText}>{tSafe('view', 'View')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton1}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditChecklist(checklist);
                  }}
                >
                  <Feather name="edit-2" size={16} color="#FFF" />
                  <Text style={styles.editButtonText}>{tSafe('edit', 'Edit')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>{tSafe('checklists_title', 'Checklists')}</Text>
          <Text style={styles.headerSubtitle}>
            {tSafe('manage_cleaning_protocols', 'Manage cleaning protocols')}
          </Text>
        </View>
        <Avatar.Image 
          size={44}
          source={{ uri: currentUser.avatar }}
          style={styles.avatar}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={tSafe('search_checklists', 'Search checklists...')}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{checklists.length}</Text>
          <Text style={styles.statLabel}>{tSafe('total_checklists', 'Total Checklists')}</Text>
        </View>
        <View style={styles.statDividerVertical} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {checklists.reduce((total, checklist) => {
              const stats = getChecklistStats(checklist);
              return total + stats.totalTasks;
            }, 0)}
          </Text>
          <Text style={styles.statLabel}>{tSafe('total_tasks', 'Total Tasks')}</Text>
        </View>
        <View style={styles.statDividerVertical} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            ${checklists.reduce((total, checklist) => total + (checklist.totalFee || 0), 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>{tSafe('total_value', 'Total Value')}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_checklists', 'Loading your checklists')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
     
      {checklists.length > 0 ? (
        <FlatList
          data={filteredChecklists}
          keyExtractor={(item) => item._id}
          renderItem={renderChecklistItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListEmptyComponent={
            <View style={styles.emptySearchContainer}>
              <MaterialCommunityIcons name="magnify" size={60} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>{tSafe('no_checklists_found', 'No checklists found')}</Text>
              <Text style={styles.emptySubtitle}>{tSafe('try_adjusting_search', 'Try adjusting your search')}</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={80} color="#E5E7EB" />
          </View>
          <Text style={styles.emptyTitle}>{tSafe('no_checklists_yet', 'No checklists yet')}</Text>
          <Text style={styles.emptySubtitle}>
            {tSafe('create_first_checklist_prompt', 'Create your first checklist to streamline your cleaning operations')}
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text style={styles.createFirstButtonText}>{tSafe('create_first_checklist', 'Create First Checklist')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={(e) => {
          e.stopPropagation();
          handleCreateChecklist();
        }}
        color="#FFF"
        size="medium"
        animated
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="delete-outline" size={48} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>{tSafe('delete_checklist_title', 'Delete Checklist')}</Text>
            <Text style={styles.modalText}>
              {tSafe('delete_checklist_confirm', 'Are you sure you want to delete "{name}"? This action cannot be undone.', { name: selectedChecklist?.checklistName })}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedChecklist(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>{tSafe('cancel', 'Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                // onPress={handleDeleteChecklist} // already handled elsewhere
              >
                <Feather name="trash-2" size={16} color="#FFF" />
                <Text style={styles.modalButtonDeleteText}>{tSafe('delete', 'Delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Checklist Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedChecklistForModal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalChecklistIcon}>
                      <MaterialIcons name="checklist-rtl" size={24} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.modalTitle} numberOfLines={1}>
                        {selectedChecklistForModal.checklistName || tSafe('unnamed_checklist', 'Unnamed Checklist')}
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        {selectedChecklistForModal.apartment_name || tSafe('general_checklist', 'General Checklist')}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <MaterialIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>{tSafe('overview', 'Overview')}</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoCard}>
                        <Feather name="calendar" size={20} color="#6B7280" />
                        <Text style={styles.infoLabel}>{tSafe('created', 'Created')}</Text>
                        <Text style={styles.infoValue}>
                          {formatDate(selectedChecklistForModal.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Feather name="clock" size={20} color="#6B7280" />
                        <Text style={styles.infoLabel}>{tSafe('total_time', 'Total Time')}</Text>
                        <Text style={styles.infoValue}>
                          {formatDuration(selectedChecklistForModal.totalTime)}
                        </Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Feather name="dollar-sign" size={20} color="#6B7280" />
                        <Text style={styles.infoLabel}>{tSafe('total_fee', 'Total Fee')}</Text>
                        <Text style={[styles.infoValue, styles.totalFee]}>
                          ${selectedChecklistForModal.totalFee?.toFixed(2) || '0.00'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {selectedChecklistForModal.checklist && Object.keys(selectedChecklistForModal.checklist).length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>{tSafe('cleaning_teams', 'Cleaning Teams')}</Text>
                      {Object.entries(selectedChecklistForModal.checklist).map(([groupId, group], index) => {
                        const groupNumber = groupId.replace('group_', '').replace('group', '') || (index + 1);
                        const stats = getChecklistStats(selectedChecklistForModal);
                        return (
                          <View key={groupId} style={styles.groupCard}>
                            <View style={styles.groupHeader}>
                              <View style={styles.groupTitleContainer}>
                                <View style={styles.groupIcon}>
                                  <Text style={styles.groupIconText}>{groupNumber}</Text>
                                </View>
                                <View>
                                  <Text style={styles.groupName}>{tSafe('team_prefix', 'Team')} {groupNumber}</Text>
                                  <Text style={styles.groupSubtitle}>
                                    {group.rooms?.length || 0} {tSafe('rooms', 'rooms')} • {stats.totalTasks || 0} {tSafe('tasks', 'tasks')}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.groupStats}>
                                <View style={styles.statBadge}>
                                  <Feather name="clock" size={12} color="#6B7280" />
                                  <Text style={styles.statText}>
                                    {formatDuration(group.totalTime)}
                                  </Text>
                                </View>
                                <View style={[styles.statBadge, styles.priceBadge]}>
                                  <Feather name="dollar-sign" size={12} color="#FFF" />
                                  <Text style={[styles.statText, styles.priceText]}>
                                    ${group.price?.toFixed(2) || '0.00'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.groupDetails}>
                              {group.rooms && group.rooms.length > 0 && (
                                <View style={styles.roomsSection}>
                                  <Text style={styles.detailTitle}>{tSafe('rooms_included', 'Rooms Included')}</Text>
                                  <View style={styles.roomsGrid}>
                                    {group.rooms.map((room, idx) => (
                                      <View key={`${room}-${idx}`} style={styles.roomChip}>
                                        <Text style={styles.roomChipText}>
                                          {formatRoomLabel(room)}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                              {group.details && Object.keys(group.details).length > 0 && (
                                <View style={styles.tasksSection}>
                                  <Text style={styles.detailTitle}>{tSafe('tasks_by_room', 'Tasks by Room')}</Text>
                                  {Object.entries(group.details).map(([roomKey, roomData]) => {
                                    if (!roomData.tasks || !Array.isArray(roomData.tasks) || roomData.tasks.length === 0) return null;
                                    const mid = Math.ceil(roomData.tasks.length / 2);
                                    const leftColumnTasks = roomData.tasks.slice(0, mid);
                                    const rightColumnTasks = roomData.tasks.slice(mid);
                                    return (
                                      <View key={`${groupId}-${roomKey}`} style={styles.roomTasksContainer}>
                                        <View style={styles.roomHeader}>
                                          <Feather name="square" size={16} color="#3B82F6" />
                                          <Text style={styles.roomName}>
                                            {formatRoomLabel(roomKey)}
                                          </Text>
                                          <Text style={styles.taskCount}>
                                            {roomData.tasks.length} {tSafe('tasks', 'tasks')}
                                          </Text>
                                        </View>
                                        <View style={styles.twoColumnGrid}>
                                          <View style={styles.column}>
                                            {leftColumnTasks.map((task, taskIndex) => (
                                              <View key={`task-left-${taskIndex}`} style={styles.taskItem}>
                                                <Feather 
                                                  name={task.value ? "check-square" : "square"} 
                                                  size={14} 
                                                  color={task.value ? "#10B981" : "#6B7280"} 
                                                  style={styles.taskIcon}
                                                />
                                                <Text style={styles.taskLabel} numberOfLines={2}>
                                                  {task.label || task.name || `${tSafe('task_prefix', 'Task')} ${taskIndex + 1}`}
                                                </Text>
                                              </View>
                                            ))}
                                          </View>
                                          <View style={styles.column}>
                                            {rightColumnTasks.map((task, taskIndex) => (
                                              <View key={`task-right-${mid + taskIndex}`} style={styles.taskItem}>
                                                <Feather 
                                                  name={task.value ? "check-square" : "square"} 
                                                  size={14} 
                                                  color={task.value ? "#10B981" : "#6B7280"} 
                                                  style={styles.taskIcon}
                                                />
                                                <Text style={styles.taskLabel} numberOfLines={2}>
                                                  {task.label || task.name || `${tSafe('task_prefix', 'Task')} ${mid + taskIndex + 1}`}
                                                </Text>
                                              </View>
                                            ))}
                                          </View>
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  
                  {selectedChecklistForModal.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>{tSafe('notes', 'Notes')}</Text>
                      <View style={styles.notesCard}>
                        <Text style={styles.notesText}>
                          {selectedChecklistForModal.notes}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.editButton]}
                    onPress={() => {
                      closeModal();
                      handleEditChecklist(selectedChecklistForModal);
                    }}
                  >
                    <Feather name="edit-2" size={18} color="#FFF" />
                    <Text style={[styles.modalActionText, styles.editButtonText]}>{tSafe('edit_checklist', 'Edit Checklist')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: '#D1E9FF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checklistIconContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  propertyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  menuBackdrop: {
    position: 'absolute',
    top: -200,
    left: -200,
    right: -200,
    bottom: -200,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    zIndex: 9,
  },
  menuCard: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 8,
    borderColor: '#F3F4F6',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonDelete: {
    backgroundColor: '#EF4444',
  },
  modalButtonDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalChecklistIcon: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalFee: {
    fontSize: 16,
    color: COLORS.primary,
  },
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  priceBadge: {
    backgroundColor: COLORS.primary,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceText: {
    color: '#FFF',
  },
  groupDetails: {
    gap: 16,
  },
  roomsSection: {
    gap: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roomChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  tasksSection: {
    gap: 16,
  },
  roomTasksContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  roomName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  taskCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  taskLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  notesCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  editButtonText: {
    color: '#FFF',
  },
});