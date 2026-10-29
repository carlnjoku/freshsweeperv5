import React, { useState, useMemo, useContext } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Chip } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { AuthContext } from '../../../context/AuthContext';
import CleanerJobCard from '../../../components/cleaner/CleanerJobCard';
import { tSafe } from '../../../utils/tSafe';
import { useTheme } from '../../../theme';

const History = ({ schedules, isLoading = false }) => {
  const [selectedFilter, setSelectedFilter] = useState(
    tSafe('filter_all', 'All')
  );
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { currentUserId } = useContext(AuthContext);
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const filters = [
    tSafe('filter_all', 'All'),
    tSafe('filter_last_7_days', 'Last 7 days'),
    tSafe('filter_last_30_days', 'Last 30 days'),
    tSafe('filter_custom_range', 'Custom Range'),
  ];

  // Enhanced empty state function
  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'history',
        title: tSafe(
          'empty_no_history_title',
          'No Cleaning History Yet'
        ),
        message: tSafe(
          'empty_no_history_message',
          'Your completed cleaning jobs will appear here once you finish and the host confirms them.'
        ),
      },
      filtered: {
        icon: 'filter-variant',
        title: tSafe(
          'empty_no_history_match_title',
          'No History Matches Your Filter'
        ),
        message: tSafe(
          'empty_no_history_match_message',
          'Try selecting a different time period or clear your filters to see all your completed cleanings.'
        ),
      },
      search: {
        icon: 'magnify',
        title: tSafe(
          'empty_no_jobs_found_title',
          'No Jobs Found'
        ),
        message: tSafe(
          'empty_no_jobs_found_message',
          'No completed jobs match your search. Try using different keywords or dates.'
        ),
      },
      error: {
        icon: 'alert-circle-outline',
        title: tSafe(
          'empty_unable_to_load_history_title',
          'Unable to Load History'
        ),
        message: tSafe(
          'empty_unable_to_load_history_message',
          'There was a problem loading your cleaning history. Please pull down to refresh.'
        ),
      },
    };

    const { icon, title, message } =
      messages[type] || messages.general;

    return (
      <Animatable.View
        animation="fadeIn"
        duration={600}
        style={styles.emptyState}
      >
        <MaterialCommunityIcons
          name={icon}
          size={80}
          color={theme.icon.muted}
        />

        <Text style={styles.emptyStateTitle}>
          {title}
        </Text>

        <Text style={styles.emptyStateText}>
          {message}
        </Text>

        {/* Optional call-to-action button – commented out but could be added later */}
        {/* 
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons
            name="refresh"
            size={16}
            color={theme.button.primaryText}
          />
          <Text style={styles.actionButtonText}>
            Refresh History
          </Text>
        </TouchableOpacity>
        */}
      </Animatable.View>
    );
  };

  // Filter schedules based on selected filter
  const filteredSchedules = useMemo(() => {
    if (
      selectedFilter ===
      tSafe('filter_all', 'All')
    ) {
      return schedules;
    }

    const now = new Date();
    let days = 0;

    if (
      selectedFilter ===
      tSafe('filter_last_7_days', 'Last 7 days')
    ) {
      days = 7;
    } else if (
      selectedFilter ===
      tSafe('filter_last_30_days', 'Last 30 days')
    ) {
      days = 30;
    } else if (
      selectedFilter ===
      tSafe('filter_custom_range', 'Custom Range')
    ) {
      // Custom range – you can open a date picker and set start/end dates
      return schedules;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - days);

    return schedules.filter((schedule) => {
      // Get the completion date (or fallback to cleaning date)
      let dateStr =
        schedule.completed_on ||
        schedule.schedule?.cleaning_date;

      if (
        dateStr &&
        typeof dateStr === 'object' &&
        dateStr.$date
      ) {
        dateStr = dateStr.$date;
      }

      if (!dateStr) return false;

      const date = new Date(dateStr);

      if (isNaN(date.getTime())) return false;

      return date >= cutoffDate;
    });
  }, [schedules, selectedFilter]);

  // Determine which empty state to show
  const getEmptyStateType = () => {
    if (isLoading) return 'general';

    if (
      selectedFilter !==
        tSafe('filter_all', 'All') &&
      filteredSchedules.length === 0
    ) {
      return 'filtered';
    }

    return 'general';
  };

  const openImageViewer = (imagesArray, index) => {
    const formattedImages = imagesArray.map((img) => ({
      url: img.url,
    }));

    setImages(formattedImages);
    setCurrentImageIndex(index);
    setIsImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerVisible(false);
    setImages([]);
    setCurrentImageIndex(0);
  };

  const renderFilterChip = (filter) => {
    const isSelected = selectedFilter === filter;

    return (
      <Chip
        key={filter}
        mode="flat"
        style={[
          styles.chip,
          isSelected && styles.activeChip,
        ]}
        textStyle={[
          styles.chipText,
          isSelected && styles.activeChipText,
        ]}
        onPress={() => setSelectedFilter(filter)}
        selected={isSelected}
      >
        {filter}
      </Chip>
    );
  };

  const renderJobCard = ({ item }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={100}
    >
      <CleanerJobCard
        key={item._id}
        schedule={item}
        currentCleanerId={currentUserId}
        onImagePress={openImageViewer}
      />
    </Animatable.View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {renderEmptyState(getEmptyStateType())}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
        />

        <Text style={styles.loadingText}>
          {tSafe(
            'loading_history',
            'Loading completed jobs...'
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section - Only show when there are schedules */}
      {schedules.length > 0 && (
        <Animatable.View
          animation="fadeInUp"
          duration={400}
          delay={100}
          style={styles.filterContainer}
        >
          <FlatList
            horizontal
            data={filters}
            renderItem={({ item }) =>
              renderFilterChip(item)
            }
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </Animatable.View>
      )}

      {/* Jobs List */}
      <Animatable.View
        animation="fadeIn"
        duration={500}
        style={styles.listContainer}
      >
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={[
            styles.listContent,
            filteredSchedules.length === 0 &&
              styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
        />
      </Animatable.View>

      {/* Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={closeImageViewer}
      >
        <ImageViewer
          imageUrls={images}
          index={currentImageIndex}
          onSwipeDown={closeImageViewer}
          enableSwipeDown
          backgroundColor="rgba(0,0,0,0.9)"
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImageViewer}
            >
              <Text style={styles.closeButtonText}>
                ×
              </Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
      padding: 10,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.default,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.text.secondary,
    },

    filterContainer: {
      backgroundColor: theme.background.default,
      paddingVertical: 8,
      marginBottom: 10,
    },

    filterList: {
      paddingHorizontal: 16,
      gap: 8,
    },

    chip: {
      backgroundColor: theme.surface.elevated,
      borderRadius: 20,
      marginRight: 8,
      height: 36,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    activeChip: {
      backgroundColor: theme.surface.selected,
      borderColor: theme.brand.primary,
      borderWidth: 1,
    },

    chipText: {
      fontSize: 14,
      color: theme.text.secondary,
      fontWeight: '500',
    },

    activeChipText: {
      color: theme.brand.primary,
      fontWeight: '600',
    },

    listContainer: {
      flex: 1,
    },

    listContent: {
      paddingBottom: 20,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    separator: {
      height: 12,
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },

    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },

    emptyStateText: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },

    actionButton: {
      backgroundColor: theme.button.primaryBackground,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    actionButtonText: {
      color: theme.button.primaryText,
      fontSize: 14,
      fontWeight: '600',
    },

    closeButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },

    closeButtonText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 24,
    },
  });

export default History;