// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Switch, StatusBar, Alert, TouchableOpacity, Dimensions } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function AboutMe({ aboutme, update_aboutme, userId, close_modal }) {
//   const [about, setAbout] = useState(aboutme);
//   const [initialAbout, setInitialAbout] = useState(aboutme);
//   const [isBeforeSave, setIsBeforeSave] = useState(true);
//   const [responseMessage, setResponseMessage] = useState('');
//   const [errors, setErrors] = useState(null);
//   const [about_word_count, setAboutWordCount] = useState('');
//   const maxCharacters = 200;
//   const charactersLeft = maxCharacters - about_word_count.length;

//   // Set initial inputs when the modal is opened
//   useEffect(() => {
//     setInitialAbout(aboutme);
//     console.log(about);
//   }, [about]);

//   // Handle closing the modal
//   const handleCloseModal = () => {
//     const hasUnsavedChanges = JSON.stringify(about) !== JSON.stringify(initialAbout);
//     if (hasUnsavedChanges) {
//       Alert.alert(
//         tSafe('unsaved_changes_title', 'Unsaved Changes'),
//         tSafe('unsaved_changes_message', 'You have unsaved changes. Are you sure you want to discard them?'),
//         [
//           {
//             text: tSafe('cancel', 'Cancel'),
//             style: 'cancel',
//             onPress: () => {},
//           },
//           {
//             text: tSafe('discard', 'Discard'),
//             onPress: () => {
//               close_modal(false);
//             },
//           },
//         ]
//       );
//     } else {
//       close_modal(false);
//     }
//   };

//   const onClose = () => {
//     close_modal(false);
//   };

//   const handleInputChange = (text) => {
//     console.log(text);
//     setAbout(text);
//     if (text.length <= maxCharacters) {
//       setAboutWordCount(text);
//     }
//   };

//   const handleError = (text, input) => {
//     console.log(text);
//     setErrors(text);
//   };

//   const onSubmit = async () => {
//     try {
//       const data = {
//         userId: userId,
//         aboutme: about,
//       };
//       await userService.updateCleanerAbout(data).then((response) => {
//         const status = response.status;
//         const res = response.data;
//         console.log(status);
//         if (status === 200) {
//           console.log(res.message);
//           update_aboutme(about);
//           setIsBeforeSave(false);
//           setResponseMessage(res.message);
//         } else {
//           Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, please try again.'));
//         }
//       });
//     } catch (e) {
//       Alert.alert(tSafe('error_title', 'Oops!'), tSafe('something_went_wrong', 'Something went wrong, please try again.'));
//     }
//   };

//   const validate = async () => {
//     let isValid = true;

//     if (about === '') {
//       handleError(
//         <Text style={{ color: 'red', opacity: 0.6, marginTop: -35 }}>
//           {tSafe('enter_about_you', 'Enter about you')}
//         </Text>,
//         'aboutme'
//       );
//       isValid = false;
//     } else if (about.length < 200) {
//       handleError(
//         <Text style={{ color: 'red', opacity: 0.6 }}>
//           {tSafe('characters_minimum', 'Characters must be more than 200')}
//         </Text>,
//         'aboutme'
//       );
//       isValid = false;
//     }

//     if (isValid) {
//       onSubmit();
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       <View style={styles.modalContent}>
//         <View style={styles.close_button}>
//           {isBeforeSave && (
//             <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={handleCloseModal} />
//           )}
//           {!isBeforeSave && (
//             <MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} />
//           )}
//         </View>
//         <Text style={styles.heading}>{tSafe('update_about_me', 'Update About Me')}</Text>

//         {isBeforeSave && (
//           <View>
//             <TextInput
//               label={tSafe('about_me_label', 'About Me')}
//               placeholder={tSafe('tell_us_about_yourself', 'Tell us about yourself')}
//               mode="outlined"
//               multiline
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//               value={about}
//               onChangeText={(text) => handleInputChange(text)}
//               style={{ marginBottom: 10, fontSize: 14, width: '100%', minHeight: 150, backgroundColor: '#fff' }}
//               onFocus={() => handleError(null, 'about')}
//               error={errors}
//             />
//             {errors && <Text style={styles.errorText}>{errors}</Text>}
//             <Text style={styles.wordCountText}>
//               {tSafe('min_characters_left', 'Min. Characters left:')} {charactersLeft}
//             </Text>

//             <TouchableOpacity style={styles.button} onPress={validate}>
//               <Text style={styles.button_text}>{tSafe('save', 'Save')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {!isBeforeSave && (
//           <View style={styles.success_response}>
//             <MaterialCommunityIcons name="check-circle" size={56} color="green" />
//             <Text style={{ fontSize: 19, fontWeight: '500', textAlign: 'center' }}>{responseMessage}</Text>
//             <TouchableOpacity style={styles.button}>
//               <Text bold style={styles.button_text} onPress={onClose}>
//                 {tSafe('continue', 'Continue')}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 20,
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderTopRightRadius: 10,
//     borderTopLeftRadius: 10,
//     elevation: 5,
//     height: '100%',
//     width: '100%',
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   button: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     marginVertical: 20,
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     borderRadius: 50,
//   },
//   button_text: {
//     color: COLORS.white,
//   },
//   close_button: {
//     alignItems: 'flex-end',
//   },
//   wordCountText: {
//     color: 'gray',
//     textAlign: 'right',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 10,
//     textAlign: 'right',
//   },
//   success_response: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     marginTop: 30,
//   },
// });


// components/cleaner/AboutMe.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

export default function AboutMe({ userId, aboutme, update_aboutme, close_modal }) {
  const [text, setText] = useState(aboutme || '');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await userService.generateCleanerBio(userId);
      setText(response.data.bio);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bio. Please try again.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    update_aboutme(text);
    close_modal();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>{tSafe('about_me', 'About Me')}</Text>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="auto-awesome" size={20} color="#fff" />
              <Text style={styles.generateText}>Generate with AI</Text>
            </>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder={tSafe('write_about_yourself', 'Write about yourself...')}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={close_modal}>
            <Text style={styles.buttonText}>{tSafe('cancel', 'Cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={[styles.buttonText, styles.saveText]}>{tSafe('save', 'Save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  generateText: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#eee',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
  },
});