// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Dimensions,
//   Image,
//   Modal,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { Button, TextInput, Icon } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import { v4 as uuidv4 } from 'uuid';

// const { width, height } = Dimensions.get('window');

// const CleanerManagementModal = ({
//   visible,
//   onClose,
//   platformCleaners = [],
//   preferredCleaners,        // array of { id, type } – only ids stored in parent
//   setPreferredCleaners,
//   invitedCleaners,          // array of { tempId, email, phone }
//   setInvitedCleaners,
// }) => {
//   const [inviteEmail, setInviteEmail] = useState('');
//   const [invitePhone, setInvitePhone] = useState('');
//   const [autoSelectMessage, setAutoSelectMessage] = useState('');
//   const [emailError, setEmailError] = useState('');

//   const searchTimeout = useRef(null);

//   const validateEmail = (email) => {
//     if (!email) return true;
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   // Auto‑select platform cleaner when email matches
//   useEffect(() => {
//     if (searchTimeout.current) clearTimeout(searchTimeout.current);

//     if (!inviteEmail.trim()) {
//       setAutoSelectMessage('');
//       return;
//     }

//     searchTimeout.current = setTimeout(() => {
//       const emailLower = inviteEmail.toLowerCase().trim();
//       const matchedCleaner = platformCleaners.find(
//         (c) => c.email && c.email.toLowerCase() === emailLower
//       );

//       if (matchedCleaner) {
//         const alreadySelected = preferredCleaners.some((c) => c.id === matchedCleaner.id);
//         if (!alreadySelected) {
//           // Store only id and type in parent
//           setPreferredCleaners([
//             ...preferredCleaners,
//             { id: matchedCleaner.id, type: 'platform' },
//           ]);
//           setAutoSelectMessage(`${matchedCleaner.name} added.`);
//         } else {
//           setAutoSelectMessage(`${matchedCleaner.name} already selected.`);
//         }
//         setInviteEmail('');
//       } else {
//         setAutoSelectMessage('');
//       }
//     }, 400);

//     return () => clearTimeout(searchTimeout.current);
//   }, [inviteEmail, platformCleaners, preferredCleaners, setPreferredCleaners]);

//   // Add a platform cleaner manually (via card tap)
//   const addPlatformCleaner = (cleaner) => {
//     if (!preferredCleaners.some((c) => c.id === cleaner.id)) {
//       setPreferredCleaners([
//         ...preferredCleaners,
//         { id: cleaner.id, type: 'platform' },
//       ]);
//     }
//   };

//   // Remove cleaner – works for both platform and invited
//   const removeCleaner = (id) => {
//     setPreferredCleaners(prev => prev.filter(c => c.id !== id));
//     setInvitedCleaners(prev => prev.filter(c => c.tempId !== id));
//   };

//   // Add an invited cleaner (by email/phone)
//   const addInvitedCleaner = () => {
//     if (!inviteEmail && !invitePhone) {
//       setEmailError('Provide email or phone');
//       return;
//     }
//     if (inviteEmail && !validateEmail(inviteEmail)) {
//       setEmailError('Invalid email');
//       return;
//     }
//     setEmailError('');

//     const tempId = uuidv4();

//     // Store in preferredCleaners (only id & type)
//     setPreferredCleaners(prev => [
//       ...prev,
//       { id: tempId, type: 'invited' },
//     ]);

//     // Store contact details separately
//     setInvitedCleaners(prev => [
//       ...prev,
//       {
//         tempId,
//         email: inviteEmail || null,
//         phone: invitePhone || null,
//       },
//     ]);

//     setInviteEmail('');
//     setInvitePhone('');
//   };

//   // Helper to get display name for a selected cleaner
//   const getDisplayName = (item) => {
//     if (item.type === 'platform') {
//       const cleaner = platformCleaners.find(c => c.id === item.id);
//       return cleaner ? cleaner.name : 'Unknown';
//     } else {
//       const invited = invitedCleaners.find(c => c.tempId === item.id);
//       return invited ? (invited.email || invited.phone || 'Pending') : 'Pending';
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="fullScreen"
//       onRequestClose={onClose}
//     >
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={styles.container}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         >
//           {/* HEADER */}
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Manage Cleaners</Text>
//             <TouchableOpacity onPress={onClose}>
//               <Icon source="close" size={24} color={COLORS.darkGray} />
//             </TouchableOpacity>
//           </View>

//           {/* CONTENT */}
//           <View style={{ flex: 1, paddingBottom: 100 }}>
//             {/* PLATFORM CLEANERS */}
//             <Text style={styles.sectionTitle}>Platform Cleaners</Text>

//             <View style={styles.cleanerListContainer}>
//               <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 nestedScrollEnabled
//               >
//                 {platformCleaners.length === 0 ? (
//                   <Text style={styles.emptyText}>
//                     No platform cleaners available nearby.
//                   </Text>
//                 ) : (
//                   platformCleaners.map((cleaner) => {
//                     const isSelected = preferredCleaners.some(
//                       (c) => c.id === cleaner.id
//                     );

//                     return (
//                       <TouchableOpacity
//                         key={cleaner.id}
//                         style={[
//                           styles.cleanerCard,
//                           isSelected && styles.selectedCard,
//                         ]}
//                         onPress={() => addPlatformCleaner(cleaner)}
//                         activeOpacity={0.9}
//                       >
//                         <View style={styles.cardContent}>
//                           <View style={styles.avatarContainer}>
//                             {cleaner.avatar ? (
//                               <Image
//                                 source={{ uri: cleaner.avatar }}
//                                 style={styles.avatar}
//                               />
//                             ) : (
//                               <View style={styles.avatarPlaceholder}>
//                                 <Icon
//                                   source="account"
//                                   size={20}
//                                   color={COLORS.white}
//                                 />
//                               </View>
//                             )}
//                           </View>

//                           <View style={styles.infoContainer}>
//                             <Text style={styles.cleanerName}>
//                               {cleaner.name}
//                             </Text>
//                             {cleaner.distance && (
//                               <Text style={styles.cleanerDistance}>
//                                 {cleaner.distance} miles away
//                               </Text>
//                             )}
//                           </View>

//                           <View
//                             style={
//                               isSelected
//                                 ? styles.selectedButton
//                                 : styles.addButton
//                             }
//                           >
//                             <Icon
//                               source={isSelected ? 'check' : 'plus'}
//                               size={18}
//                               color={
//                                 isSelected
//                                   ? COLORS.white
//                                   : COLORS.primary
//                               }
//                             />
//                           </View>
//                         </View>
//                       </TouchableOpacity>
//                     );
//                   })
//                 )}
//               </ScrollView>
//             </View>

//             {/* INVITE SECTION */}
//             <Text style={styles.sectionTitle}>Invite New Cleaner</Text>
            
//             <TextInput
//               mode="outlined"
//               label="Email"
//               placeholder="Enter cleaner email"
//               placeholderTextColor={COLORS.darkGray}
//               autoCapitalize="none"
//               outlineColor="#CCC"
//               activeOutlineColor={COLORS.primary}
//               style={{marginBottom:0, marginTop:5, fontSize:14, backgroundColor:"#fff"}}
//               value={inviteEmail}
//               onChangeText={(text) => {
//                 setInviteEmail(text);
//                 setEmailError('');
//               }}
//               error={!!emailError}
//             />
//             {emailError ? (
//               <Text style={styles.errorText}>{emailError}</Text>
//             ) : null}

//             {autoSelectMessage ? (
//               <Text style={styles.autoSelectMessage}>
//                 {autoSelectMessage}
//               </Text>
//             ) : null}

//             <TextInput
//               mode="outlined"
//               label="Phone"
//               placeholder="Enter cleaner phone"
//               placeholderTextColor={COLORS.darkGray}
//               outlineColor="#CCC"
//               activeOutlineColor={COLORS.primary}
//               style={{marginBottom:20, marginTop:5, fontSize:14, backgroundColor:"#fff"}}
//               value={invitePhone}
//               onChangeText={setInvitePhone}
//               keyboardType="phone-pad"
//             />

//             <Button
//               mode="contained"
//               onPress={addInvitedCleaner}
//               style={styles.inviteButton}
//               disabled={!inviteEmail && !invitePhone}
//             >
//               Send Invite
//             </Button>

//             {/* SELECTED CLEANERS */}
//             <Text style={styles.sectionTitle}>Selected Cleaners</Text>

//             <View style={styles.chipContainer}>
//               {preferredCleaners.length === 0 ? (
//                 <Text style={styles.emptyText}>
//                   No cleaners selected yet.
//                 </Text>
//               ) : (
//                 preferredCleaners.map((item) => {
//                   const displayName = getDisplayName(item);
//                   return (
//                     <View key={item.id} style={styles.chip}>
//                       <Text
//                         style={styles.chipText}
//                         numberOfLines={1}
//                       >
//                         {displayName}
//                       </Text>
//                       <TouchableOpacity
//                         onPress={() => removeCleaner(item.id)}
//                         style={styles.chipRemove}
//                       >
//                         <Icon
//                           source="close"
//                           size={16}
//                           color={COLORS.white}
//                         />
//                       </TouchableOpacity>
//                     </View>
//                   );
//                 })
//               )}
//             </View>
//           </View>

//           {/* STICKY FOOTER */}
//           <View style={styles.footer}>
//             <Button
//               mode="contained"
//               onPress={onClose}
//               style={styles.doneButton}
//               contentStyle={{ height: 50 }}
//             >
//               Done
//             </Button>
//           </View>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </Modal>
//   );
// };

// // Styles remain exactly as you had them – no changes needed.
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.dark,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.darkGray,
//     marginTop: 14,
//     marginBottom: 10,
//   },

//   cleanerListContainer: {
//     height: height * 0.28,
//     borderRadius: 16,
//     backgroundColor: COLORS.white,
//     paddingHorizontal: 4,
//     marginBottom: 8,

//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   cleanerCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     marginVertical: 6,
//     borderWidth: 1,
//     borderColor: COLORS.light_gray,
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primary + '08',
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//   },
//   avatarPlaceholder: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   cleanerDistance: {
//     fontSize: 13,
//     color: COLORS.gray,
//   },
//   addButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 1.5,
//     borderColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   input: {
//     marginBottom: 10,
//     backgroundColor: COLORS.white,
//   },
//   inviteButton: {
//     marginTop: 4,
//     borderRadius: 12,
//     backgroundColor: COLORS.primary,
//   },
//   errorText: {
//     fontSize: 12,
//     color: COLORS.error,
//     marginBottom: 6,
//   },
//   autoSelectMessage: {
//     fontSize: 12,
//     color: COLORS.primary,
//     marginBottom: 6,
//   },
//   chipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   chip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     borderRadius: 30,
//     paddingVertical: 6,
//     paddingLeft: 14,
//     paddingRight: 8,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   chipText: {
//     fontSize: 14,
//     color: COLORS.white,
//     maxWidth: width * 0.4,
//   },
//   chipRemove: {
//     marginLeft: 6,
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingVertical: 2,
//     paddingHorizontal: 20,
//     backgroundColor: COLORS.white,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.06)',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 12,
//   },
//   doneButton: {
//     borderRadius: 14,
//     backgroundColor: COLORS.dark,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: COLORS.gray,
//     padding: 16,
//     fontStyle: 'italic',
//   },
// });

// export default CleanerManagementModal;



import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput, Icon } from 'react-native-paper';
import COLORS from '../../constants/colors';
import { v4 as uuidv4 } from 'uuid';
import { tSafe } from '../../utils/tSafe'; // added import

const { width, height } = Dimensions.get('window');

const CleanerManagementModal = ({
  visible,
  onClose,
  platformCleaners = [],
  preferredCleaners,        // array of { id, type } – only ids stored in parent
  setPreferredCleaners,
  invitedCleaners,          // array of { tempId, email, phone }
  setInvitedCleaners,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [autoSelectMessage, setAutoSelectMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const searchTimeout = useRef(null);

  const validateEmail = (email) => {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Auto‑select platform cleaner when email matches
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!inviteEmail.trim()) {
      setAutoSelectMessage('');
      return;
    }

    searchTimeout.current = setTimeout(() => {
      const emailLower = inviteEmail.toLowerCase().trim();
      const matchedCleaner = platformCleaners.find(
        (c) => c.email && c.email.toLowerCase() === emailLower
      );

      if (matchedCleaner) {
        const alreadySelected = preferredCleaners.some((c) => c.id === matchedCleaner.id);
        if (!alreadySelected) {
          // Store only id and type in parent
          setPreferredCleaners([
            ...preferredCleaners,
            { id: matchedCleaner.id, type: 'platform' },
          ]);
          setAutoSelectMessage(
            tSafe('cleaner_added_message', '{name} added.', { name: matchedCleaner.name })
          );
        } else {
          setAutoSelectMessage(
            tSafe('cleaner_already_selected', '{name} already selected.', { name: matchedCleaner.name })
          );
        }
        setInviteEmail('');
      } else {
        setAutoSelectMessage('');
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [inviteEmail, platformCleaners, preferredCleaners, setPreferredCleaners]);

  // Add a platform cleaner manually (via card tap)
  const addPlatformCleaner = (cleaner) => {
    if (!preferredCleaners.some((c) => c.id === cleaner.id)) {
      setPreferredCleaners([
        ...preferredCleaners,
        { id: cleaner.id, type: 'platform' },
      ]);
    }
  };

  // Remove cleaner – works for both platform and invited
  const removeCleaner = (id) => {
    setPreferredCleaners(prev => prev.filter(c => c.id !== id));
    setInvitedCleaners(prev => prev.filter(c => c.tempId !== id));
  };

  // Add an invited cleaner (by email/phone)
  const addInvitedCleaner = () => {
    if (!inviteEmail && !invitePhone) {
      setEmailError(tSafe('provide_email_or_phone', 'Provide email or phone'));
      return;
    }
    if (inviteEmail && !validateEmail(inviteEmail)) {
      setEmailError(tSafe('invalid_email', 'Invalid email'));
      return;
    }
    setEmailError('');

    const tempId = uuidv4();

    // Store in preferredCleaners (only id & type)
    setPreferredCleaners(prev => [
      ...prev,
      { id: tempId, type: 'invited' },
    ]);

    // Store contact details separately
    setInvitedCleaners(prev => [
      ...prev,
      {
        tempId,
        email: inviteEmail || null,
        phone: invitePhone || null,
      },
    ]);

    setInviteEmail('');
    setInvitePhone('');
  };

  // Helper to get display name for a selected cleaner
  const getDisplayName = (item) => {
    if (item.type === 'platform') {
      const cleaner = platformCleaners.find(c => c.id === item.id);
      return cleaner ? cleaner.name : tSafe('unknown', 'Unknown');
    } else {
      const invited = invitedCleaners.find(c => c.tempId === item.id);
      return invited ? (invited.email || invited.phone || tSafe('pending', 'Pending')) : tSafe('pending', 'Pending');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{tSafe('manage_cleaners_title', 'Manage Cleaners')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon source="close" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View style={{ flex: 1, paddingBottom: 100 }}>
            {/* PLATFORM CLEANERS */}
            <Text style={styles.sectionTitle}>{tSafe('platform_cleaners', 'Platform Cleaners')}</Text>

            <View style={styles.cleanerListContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {platformCleaners.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {tSafe('no_platform_cleaners', 'No platform cleaners available nearby.')}
                  </Text>
                ) : (
                  platformCleaners.map((cleaner) => {
                    const isSelected = preferredCleaners.some(
                      (c) => c.id === cleaner.id
                    );

                    return (
                      <TouchableOpacity
                        key={cleaner.id}
                        style={[
                          styles.cleanerCard,
                          isSelected && styles.selectedCard,
                        ]}
                        onPress={() => addPlatformCleaner(cleaner)}
                        activeOpacity={0.9}
                      >
                        <View style={styles.cardContent}>
                          <View style={styles.avatarContainer}>
                            {cleaner.avatar ? (
                              <Image
                                source={{ uri: cleaner.avatar }}
                                style={styles.avatar}
                              />
                            ) : (
                              <View style={styles.avatarPlaceholder}>
                                <Icon
                                  source="account"
                                  size={20}
                                  color={COLORS.white}
                                />
                              </View>
                            )}
                          </View>

                          <View style={styles.infoContainer}>
                            <Text style={styles.cleanerName}>
                              {cleaner.name}
                            </Text>
                            {cleaner.distance && (
                              <Text style={styles.cleanerDistance}>
                                {cleaner.distance} {tSafe('miles_away', 'miles away')}
                              </Text>
                            )}
                          </View>

                          <View
                            style={
                              isSelected
                                ? styles.selectedButton
                                : styles.addButton
                            }
                          >
                            <Icon
                              source={isSelected ? 'check' : 'plus'}
                              size={18}
                              color={
                                isSelected
                                  ? COLORS.white
                                  : COLORS.primary
                              }
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>

            {/* INVITE SECTION */}
            <Text style={styles.sectionTitle}>{tSafe('invite_new_cleaner', 'Invite New Cleaner')}</Text>
            
            <TextInput
              mode="outlined"
              label={tSafe('email_label', 'Email')}
              placeholder={tSafe('email_placeholder', 'Enter cleaner email')}
              placeholderTextColor={COLORS.darkGray}
              autoCapitalize="none"
              outlineColor="#CCC"
              activeOutlineColor={COLORS.primary}
              style={{marginBottom:0, marginTop:5, fontSize:14, backgroundColor:"#fff"}}
              value={inviteEmail}
              onChangeText={(text) => {
                setInviteEmail(text);
                setEmailError('');
              }}
              error={!!emailError}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            {autoSelectMessage ? (
              <Text style={styles.autoSelectMessage}>
                {autoSelectMessage}
              </Text>
            ) : null}

            <TextInput
              mode="outlined"
              label={tSafe('phone_label', 'Phone')}
              placeholder={tSafe('phone_placeholder', 'Enter cleaner phone')}
              placeholderTextColor={COLORS.darkGray}
              outlineColor="#CCC"
              activeOutlineColor={COLORS.primary}
              style={{marginBottom:20, marginTop:5, fontSize:14, backgroundColor:"#fff"}}
              value={invitePhone}
              onChangeText={setInvitePhone}
              keyboardType="phone-pad"
            />

            <Button
              mode="contained"
              onPress={addInvitedCleaner}
              style={styles.inviteButton}
              disabled={!inviteEmail && !invitePhone}
            >
              {tSafe('send_invite', 'Send Invite')}
            </Button>

            {/* SELECTED CLEANERS */}
            <Text style={styles.sectionTitle}>{tSafe('selected_cleaners', 'Selected Cleaners')}</Text>

            <View style={styles.chipContainer}>
              {preferredCleaners.length === 0 ? (
                <Text style={styles.emptyText}>
                  {tSafe('no_cleaners_selected', 'No cleaners selected yet.')}
                </Text>
              ) : (
                preferredCleaners.map((item) => {
                  const displayName = getDisplayName(item);
                  return (
                    <View key={item.id} style={styles.chip}>
                      <Text
                        style={styles.chipText}
                        numberOfLines={1}
                      >
                        {displayName}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeCleaner(item.id)}
                        style={styles.chipRemove}
                      >
                        <Icon
                          source="close"
                          size={16}
                          color={COLORS.white}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* STICKY FOOTER */}
          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={onClose}
              style={styles.doneButton}
              contentStyle={{ height: 50 }}
            >
              {tSafe('done', 'Done')}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 14,
    marginBottom: 10,
  },
  cleanerListContainer: {
    height: height * 0.28,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  cleanerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  cleanerDistance: {
    fontSize: 13,
    color: COLORS.gray,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  inviteButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 6,
  },
  autoSelectMessage: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.white,
    maxWidth: width * 0.4,
  },
  chipRemove: {
    marginLeft: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 12,
  },
  doneButton: {
    borderRadius: 14,
    backgroundColor: COLORS.dark,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    padding: 16,
    fontStyle: 'italic',
  },



  
});

export default CleanerManagementModal;