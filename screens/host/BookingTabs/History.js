import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  FlatList,
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Chip } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import COLORS from '../../../constants/colors';
import JobCard from '../../../components/shared/JobCard';

const FILTERS = ["All", "Last 7 days", "Last 30 days", "Custom"];

export default function History({ schedules, isLoading = false }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Enhanced empty state function
  // Enhanced empty state function
const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'history',
        title: 'No Cleaning History Yet',
        message: 'Your past cleaning jobs will appear here once they are completed.'
      },
      filtered: {
        icon: 'filter-variant',
        title: 'No History Matches Your Filter',
        message: 'Try selecting a different time period or clear your filters to see all your cleaning history.'
      },
      search: {
        icon: 'magnify',
        title: 'No History Found',
        message: 'No records match your search. Try different keywords or date ranges.'
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Unable to Load History',
        message: 'There was an issue loading your cleaning history. Please pull down to refresh.'
      }
    };
  
    const { icon, title, message } = messages[type] || messages.general;
  
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons 
          name={icon} 
          size={80} 
          color={COLORS.light_gray} 
        />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
      </View>
    );
  };

  // Filter schedules based on selected filter
  const filteredSchedules = useMemo(() => {
    if (selectedFilter === "All") return schedules;
    
    // Add your date filtering logic here
    // For now, returning all schedules as placeholder
    return schedules;
  }, [schedules, selectedFilter]);

  // Determine which empty state to show
  const getEmptyStateType = () => {
    if (isLoading) return 'general';
    if (selectedFilter !== "All" && filteredSchedules.length === 0) return 'filtered';
    return 'general';
  };

  const openImageViewer = (imagesArray, index) => {
    const formattedImages = imagesArray.map((img) => ({ url: img.url }));
    setImages(formattedImages);
    setCurrentImageIndex(index);
    setIsImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerVisible(false);
    setImages([]);
    setCurrentImageIndex(0);
  };

  const renderFilterChip = (filter) => (
    <Chip
      key={filter}
      mode="flat"
      style={[
        styles.chip,
        selectedFilter === filter && styles.activeChip
      ]}
      textStyle={[
        styles.chipText,
        selectedFilter === filter && styles.activeChipText
      ]}
      onPress={() => setSelectedFilter(filter)}
      selected={selectedFilter === filter}
    >
      {filter}
    </Chip>
  );

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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading completed jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={400}
        style={styles.filterContainer}
      >
        <FlatList
          horizontal
          data={FILTERS}
          renderItem={({ item }) => renderFilterChip(item)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </Animatable.View>
    
      {/* Jobs List */}
      <Animatable.View 
        animation="fadeIn" 
        duration={500}
      >
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderJobCard}
          contentContainerStyle={[
            styles.listContent,
            filteredSchedules.length === 0 && styles.emptyListContent
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  filterContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 20,
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.primary_light,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  activeChipText: {
    color: COLORS.primary,
    fontWeight: '600',
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
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
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
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});
