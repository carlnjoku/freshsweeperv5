import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';

const JobCard = ({ job }) => {
    const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
    const [isAfterModalVisible, setAfterModalVisible] = useState(false);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // console.log(job.after_task_photos)

    // Function to open the Before Photos modal
    const openBeforeModal = (startIndex) => {
        // Convert before photos array to the format required by ImageViewer
        const formattedBeforePhotos = job.before_task_photos.map(photo => ({ url: photo.img_url }));
        setImages(formattedBeforePhotos);
        setCurrentImageIndex(startIndex);
        setBeforeModalVisible(true);
    };

    // Function to open the After Photos modal
    const openAfterModal = (startIndex) => {
        // Convert after photos array to the format required by ImageViewer
        const formattedAfterPhotos = job.after_task_photos.map(photo => ({ url: photo.img_url }));
        setImages(formattedAfterPhotos);
        setCurrentImageIndex(startIndex);
        setAfterModalVisible(true);
    };

    // Function to render thumbnails
    const renderThumbnails = (photos, openModalFunction) => {
        const displayedPhotos = photos.slice(0, 4);
        const remainingCount = photos.length - 4;

        return (
            <View style={styles.thumbnailContainer}>
                {displayedPhotos.map((photo, index) => (
                    <TouchableOpacity key={index} onPress={() => openModalFunction(index)}>
                        <Image source={{ uri: photo.img_url }} style={styles.thumbnail} />
                    </TouchableOpacity>
                ))}
                {photos.length > 4 && (
                    <View style={styles.remainingContainer}>
                        <Text style={styles.remainingText}>+{remainingCount}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.jobTitle}>{job.schedule.apartment_name}</Text>
            <Text style={styles.jobDescription}>{job.schedule.cleaning_date}</Text>
            {/* View Before Photos */}
            <TouchableOpacity onPress={() => openBeforeModal(0)}>
                <Text style={styles.viewPhotosText}>View Before Photos</Text>
            </TouchableOpacity>

            {/* Thumbnails for Before Photos */}
            {renderThumbnails(job.before_task_photos, openBeforeModal)}

            {/* View After Photos */}
            <TouchableOpacity onPress={() => openAfterModal(0)}>
                <Text style={styles.viewPhotosText}>View After Photos</Text>
            </TouchableOpacity>

            {/* Thumbnails for After Photos */}
            {renderThumbnails(job.after_task_photos, openAfterModal)}

            {/* Modal for Before Photos */}
            <Modal isVisible={isBeforeModalVisible} style={styles.fullScreenModal} onBackdropPress={() => setBeforeModalVisible(false)}>
                <ImageViewer
                    imageUrls={images}
                    index={currentImageIndex}
                    onClick={() => setBeforeModalVisible(false)}
                    enableSwipeDown
                    onSwipeDown={() => setBeforeModalVisible(false)}
                    backgroundColor="black"
                />
            </Modal>

            {/* Modal for After Photos */}
            <Modal isVisible={isAfterModalVisible} style={styles.fullScreenModal} onBackdropPress={() => setAfterModalVisible(false)}>
                <ImageViewer
                    imageUrls={images}
                    index={currentImageIndex}
                    onClick={() => setAfterModalVisible(false)}
                    enableSwipeDown
                    onSwipeDown={() => setAfterModalVisible(false)}
                    backgroundColor="black"
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    viewPhotosText: {
        fontSize: 14,
        color: '#007bff',
        marginBottom: 8,
        textDecorationLine: 'underline',
    },
    thumbnailContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    thumbnail: {
        width: 50,
        height: 50,
        marginRight: 8,
        borderRadius: 4,
    },
    remainingContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: '#ccc',
    },
    remainingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    fullScreenModal: {
        margin: 0,
    },
});

export default JobCard;
