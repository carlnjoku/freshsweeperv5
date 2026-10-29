import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  StatusBar,
  FlatList,
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Chip } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';
import JobCard from '../../../components/shared/JobCard';
import { tSafe } from '../../../utils/tSafe';

export default function History({ schedules, isLoading = false }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  const filters = useMemo(
    () => [
      { id: 'all', label: tSafe('filter_all', 'All') },
      { id: 'last7', label: tSafe('filter_last_7_days', 'Last 7 days') },
      { id: 'last30', label: tSafe('filter_last_30_days', 'Last 30 days') },
      { id: 'custom', label: tSafe('filter_custom', 'Custom') },
    ],
    []
  );

  const [selectedFilterId, setSelectedFilterId] = useState('all');
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter schedules based on selected filter
  const filteredSchedules = useMemo(() => {
    if (selectedFilterId === 'all') {
      return schedules;
    }

    const now = new Date();
    let days = 0;

    if (selectedFilterId === 'last7') {
      days = 7;
    } else if (selectedFilterId === 'last30') {
      days = 30;
    } else if (selectedFilterId === 'custom') {
      // Custom range can be added later.
      return schedules;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - days);

    return schedules.filter((schedule) => {
      let dateStr =
        schedule.completed_on || schedule.schedule?.cleaning_date;

      if (
        dateStr &&
        typeof dateStr === 'object' &&
        dateStr.$date
      ) {
        dateStr = dateStr.$date;
      }

      if (!dateStr) {
        return false;
      }

      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        return false;
      }

      return date >= cutoffDate;
    });
  }, [schedules, selectedFilterId]);

  // Determine which empty state to show
  const getEmptyStateType = () => {
    if (isLoading) {
      return 'general';
    }

    if (
      selectedFilterId !== 'all' &&
      filteredSchedules.length === 0
    ) {
      return 'filtered';
    }

    return 'general';
  };

  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'history',
        title: tSafe(
          'history_empty_general_title',
          'No Cleaning History Yet'
        ),
        message: tSafe(
          'history_empty_general_message',
          'Your past cleaning jobs will appear here once they are completed.'
        ),
      },
      filtered: {
        icon: 'filter-variant',
        title: tSafe(
          'history_empty_filtered_title',
          'No History Matches Your Filter'
        ),
        message: tSafe(
          'history_empty_filtered_message',
          'Try selecting a different time period or clear your filters to see all your cleaning history.'
        ),
      },
      search: {
        icon: 'magnify',
        title: tSafe(
          'history_empty_search_title',
          'No History Found'
        ),
        message: tSafe(
          'history_empty_search_message',
          'No records match your search. Try different keywords or date ranges.'
        ),
      },
      error: {
        icon: 'alert-circle-outline',
        title: tSafe(
          'history_empty_error_title',
          'Unable to Load History'
        ),
        message: tSafe(
          'history_empty_error_message',
          'There was an issue loading your cleaning history. Please pull down to refresh.'
        ),
      },
    };

    const { icon, title, message } =
      messages[type] || messages.general;

    return (
      <View style={styles.emptyState}>
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
      </View>
    );
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
    const isActive = selectedFilterId === filter.id;

    return (
      <Chip
        key={filter.id}
        mode="flat"
        style={[
          styles.chip,
          isActive && styles.activeChip,
        ]}
        textStyle={[
          styles.chipText,
          isActive && styles.activeChipText,
        ]}
        onPress={() => setSelectedFilterId(filter.id)}
        selected={isActive}
      >
        {filter.label}
      </Chip>
    );
  };

  const renderJobCard = ({ item }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={100}
    >
      <JobCard
        schedules={item}
        onImagePress={openImageViewer}
      />
    </Animatable.View>
  );

  const renderEmptyComponent = () => (
    <Animatable.View
      animation="fadeIn"
      duration={600}
      style={styles.emptyContainer}
    >
      {renderEmptyState(getEmptyStateType())}
    </Animatable.View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle={
            isDark
              ? 'light-content'
              : 'dark-content'
          }
          backgroundColor={theme.background.default}
        />

        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
        />

        <Text style={styles.loadingText}>
          {tSafe(
            'loading_completed_jobs',
            'Loading completed jobs...'
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={theme.background.default}
      />

      {/* Filters */}
      <Animatable.View
        animation="fadeInUp"
        duration={400}
        style={styles.filterContainer}
      >
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) =>
            renderFilterChip(item)
          }
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </Animatable.View>

      {/* History List */}
      <Animatable.View
        animation="fadeIn"
        duration={500}
        style={styles.listWrapper}
      >
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) =>
            item._id || item.id
          }
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

      {/* Image Viewer */}
      <Modal
        visible={isImageViewerVisible}
        transparent
        statusBarTranslucent
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
              accessibilityRole="button"
              accessibilityLabel="Close image viewer"
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
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
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
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
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

    listWrapper: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 8,
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
    },

    emptyText: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
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