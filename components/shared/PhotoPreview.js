import React, {useState} from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';

// import Icon from 'react-native-vector-icons/Entypo';

const { width, height } = Dimensions.get('window');

const PhotoPreview = ({ checklist }) => {
  const [visible, setVisible] = React.useState(false);
  const [selectedPhoto, setSelectedPhoto] = React.useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);


  // Open modal and set images for the selected task title
  const openImageViewer = (images, index) => {
    const formattedImages = images.map(photo => ({ url: photo.img_url }));
    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setVisible(true);
  };

  return (
    <View style={styles.photoContainer}>
      <ScrollView>
        {Object.entries(checklist).map(([category, data]) => {
          const midpoint = Math.ceil(data.tasks.length / 2);
          const firstColumnTasks = data.tasks.slice(0, midpoint);
          const secondColumnTasks = data.tasks.slice(midpoint);

          return (
            <View key={category} style={{ marginBottom: 20 }}>
              <Text style={styles.categoryText}>{category}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {data.photos.map((photo, index) => (
                  <TouchableOpacity key={index} 
                    // onPress={() => openPhoto(photo.img_url)}
                    onPress={() => openImageViewer(checklist[category]["photos"], index)}
                  >
                    <Image source={{ uri: photo.img_url }} style={styles.photo} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.taskContainer}>
                <View style={styles.taskColumn}>
                  {firstColumnTasks.map(task => (
                    <Text key={task.id} style={styles.taskText}>
                      <Icon name="dot-single" size={16} color="gray" /> {task.label}
                    </Text>
                  ))}
                </View>

                <View style={styles.taskColumn}>
                  {secondColumnTasks.map(task => (
                    <Text key={task.id} style={styles.taskText}>
                      <Icon name="dot-single" size={16} color="gray" /> {task.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      

      <Modal
          isVisible={visible}
          style={styles.fullScreenModal}
          onBackdropPress={() => setVisible(false)}
        >
          {/* <View style={styles.imageViewerContainer}> */}
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            onClick={() => setVisible(false)}
            enableSwipeDown
            onSwipeDown={() => setVisible(false)}
            backgroundColor="black"
          />
          
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    flexDirection: 'column',
    marginTop: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  taskColumn: {
    flex: 1,
    paddingHorizontal: 5,
  },
  taskText: {
    fontSize: 12,
    color: 'gray',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: width,
    height: height * 0.5,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeIcon: {
    right: 0,
  },
  modal_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
});

export default PhotoPreview;