import React, { useState, useMemo, useContext } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Chip } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
// import JobCard from '../../../components/shared/JobCard';
import COLORS from '../../../constants/colors';
import { AuthContext } from '../../../context/AuthContext';
import CleanerJobCard from '../../../components/cleaner/CleanerJobCard';

const History = ({ schedules, isLoading = false }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {currentUserId} = useContext(AuthContext)

  const filters = ["All", "Last 7 days", "Last 30 days", "Custom Range"];

  // Enhanced empty state function
  // Enhanced empty state function
const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'history',
        title: 'No Cleaning History Yet',
        message: 'Your completed cleaning jobs will appear here once you finish and the host confirms them.'
      },
      filtered: {
        icon: 'filter-variant',
        title: 'No History Matches Your Filter',
        message: 'Try selecting a different time period or clear your filters to see all your completed cleanings.'
      },
      search: {
        icon: 'magnify',
        title: 'No Jobs Found',
        message: 'No completed jobs match your search. Try using different keywords or dates.'
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Unable to Load History',
        message: 'There was a problem loading your cleaning history. Please pull down to refresh.'
      }
    };
  
    const { icon, title, message } = messages[type] || messages.general;
  
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={600}
        style={styles.emptyState}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={80} 
          color={COLORS.light_gray} 
        />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
  
        {/* Optional call-to-action button */}
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Refresh History</Text>
        </TouchableOpacity>
      </Animatable.View>
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading completed jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section - Only show when there are schedules */}
      {schedules.length > 0 && (
        <Animatable.View 
          animation="fadeInDown" 
          duration={400}
          delay={100}
          style={styles.filterContainer}
        >
          <FlatList
            horizontal
            data={filters}
            renderItem={({ item }) => renderFilterChip(item)}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
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
    marginBottom: 10,
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
    backgroundColor: COLORS.primary_light_1,
    borderColor: COLORS.primary,
    borderWidth: 0,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeChipText: {
    color: COLORS.gray,
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
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
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
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});

export default History;