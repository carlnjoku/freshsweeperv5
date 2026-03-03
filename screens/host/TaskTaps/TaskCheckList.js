import React, { useContext, useCallback, useEffect,useState } from 'react';
import { SafeAreaView,StyleSheet, StatusBar,CheckBox, Linking, FlatList, ScrollView, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import COLORS from '../../../constants/colors';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect from React Navigation
import { Text } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import {Icon,MaterialIcons} from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/FontAwesome'; // For FontAwesome's minus icon
import userService from '../../../services/connection/userService';


export default function TaskChecklist({scheduleId}) {


  const[isLoading, setIsLoading] = useState(false);
  const[isBeforeModalVisible, setBeforeModalVisible] = useState(false);
  const[currentImageIndex, setCurrentImageIndex] = useState(0);
  const[currentImages, setCurrentImages] = useState([]);
  const[selected_images, setSelectedImages] = React.useState([])

  // Execute fetchImages when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [])
  );

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUpdatedImageUrls(scheduleId);
      const res = response.data.data;
      setSelectedImages(res.checklist);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal and set images for the selected task title
  const openImageViewer = (images, index) => {
    const formattedImages = images.map(photo => ({ url: photo.img_url }));
    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setBeforeModalVisible(true);
  };


  // Render task checkbox with labels
  const renderTask = ({item}) => (
    <View style={styles.taskContainer}>
      <Text key={item.id} style={styles.taskText}>
       <Icon name= {item.value ? "check" : "minus"}  size={10} color={item.value ? "green" : "gray"} />  {item.label}
      </Text>
    </View>
  );
    
  return (
    <SafeAreaView
          style={{
            flex:1,
            backgroundColor:COLORS.white,
            marginBottom:0,

          }}
        >
          <ScrollView>
        <Animatable.View animation="slideInRight" duration={550}>
        {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
            <View style={styles.photosContainer}>
              {Object.keys(selected_images).map(taskTitle => (
                <CardNoPrimary>
                 <View key={taskTitle} style={{marginBottom:20}}>
                     
                     <Text style={styles.roomTitle}>
                        {taskTitle}  Hello
                     </Text>
                     
                    <ScrollView horizontal style={styles.previewContainer}>
                        {selected_images[taskTitle]["photos"].map((photo, index) => (
                        <View key={index} style={styles.thumbnailContainer}>
                          <TouchableOpacity
                            key={index}
                            onPress={() => openImageViewer(selected_images[taskTitle]["photos"], index)}
                            style={styles.thumbnailContainer}
                          >
                            <Image source={{ uri: photo.img_url }} style={styles.preview} />
                          </TouchableOpacity>
                            
                        </View>
                        ))}
                    </ScrollView>
                        
                    <FlatList
                        data={selected_images[taskTitle]["tasks"]}
                        renderItem={(item) => renderTask(item, taskTitle)} // Pass taskTi
                        keyExtractor={item => item.id.toString()}
                        numColumns={2} // Make 2 columns
                        columnWrapperStyle={styles.columnWrapper} // Style the column wrapper
                    />

                        

                       
                    {/* Modal with ImageViewer */}
                    <Modal
                      isVisible={isBeforeModalVisible}
                      style={styles.fullScreenModal}
                      onBackdropPress={() => setBeforeModalVisible(false)}
                    >
                      {/* <View style={styles.imageViewerContainer}> */}
                      <ImageViewer
                        imageUrls={currentImages}
                        index={currentImageIndex}
                        onClick={() => setBeforeModalVisible(false)}
                        enableSwipeDown
                        onSwipeDown={() => setBeforeModalVisible(false)}
                        backgroundColor="black"
                      />
                      {/* <Text style={styles.imageDescription}>
                        {images[currentImageIndex]?.description || 'No description available'}
                      </Text> */}
                    {/* </View> */}
                    </Modal>
                    
                    
                 </View>
                 </CardNoPrimary>
             ))}
              </View>
          )}

        </Animatable.View>

      </ScrollView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  photosContainer: {
    marginLeft: 5,
  },
  thumbnails:{
    width: 102,
    height:102,
    borderRadius:5,
    margin:5
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 5,
    marginTop:10
  },
  previewContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  roomContainer: {
    marginVertical: 20,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    marginRight: 10,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius:5
  },
  columnWrapper: {
    justifyContent: 'space-between', // Create space between columns
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    flex: 1,
  },
  taskText: {
    marginLeft: 0,
    fontSize: 12,
    color:COLORS.gray
  },
})
