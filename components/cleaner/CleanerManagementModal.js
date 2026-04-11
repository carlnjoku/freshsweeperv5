import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Modal, Portal, Button, TextInput, Icon } from 'react-native-paper';
import COLORS from '../../constants/colors'; // adjust path as needed
import { v4 as uuidv4 } from 'uuid';
import { tSafe } from '../../utils/tSafe'; // added import

const CleanerManagementModal = ({
  visible,
  onClose,
  platformCleaners = [],
  preferredCleaners,
  setPreferredCleaners,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');

  const addPlatformCleaner = (cleaner) => {
    if (!preferredCleaners.some(c => c.id === cleaner.id)) {
      setPreferredCleaners([...preferredCleaners, { ...cleaner, type: 'platform' }]);
    }
  };

  const removeCleaner = (id) => {
    setPreferredCleaners(preferredCleaners.filter(c => c.id !== id));
  };

  const addInvitedCleaner = () => {
    if (!inviteEmail && !invitePhone) return;
    const tempId = uuidv4();
    setPreferredCleaners([
      ...preferredCleaners,
      {
        id: tempId,
        type: 'invited',
        email: inviteEmail || null,
        phone: invitePhone || null,
        status: 'pending',
      },
    ]);
    setInviteEmail('');
    setInvitePhone('');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={modalStyles.modalContent}
        presentationStyle="fullScreen"
      >
  
        <Text style={modalStyles.modalTitle}>
          {tSafe('invite_your_own_cleaner', 'Invite your own Cleaners')}
        </Text>

        {/* Platform cleaners list */}
        <Text style={modalStyles.sectionTitle}>
          {tSafe('platform_cleaners', 'Platform Cleaners')}
        </Text>
        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
          {platformCleaners.map((cleaner) => (
            <TouchableOpacity
              key={cleaner.id}
              onPress={() => addPlatformCleaner(cleaner)}
              style={modalStyles.cleanerRow}
            >
              <Text>{cleaner.name}</Text>
              {preferredCleaners.some(c => c.id === cleaner.id) && (
                <Icon source="check" size={20} color="green" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invite new cleaner */}
        <Text style={modalStyles.sectionTitle}>
          {tSafe('invite_new_cleaner', 'Invite New Cleaner')}
        </Text>
        
        <TextInput
            mode="outlined"
            label={tSafe('cleaner_email', 'Cleaner Email')}
            autoCapitalize="none"
            placeholder={tSafe('enter_cleaner_email', 'Enter cleaner email')}
            placeholderTextColor={COLORS.gray}
            outlineColor="#D8D8D8"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            activeOutlineColor={COLORS.primary}
            style={{ marginBottom: 10, fontSize: 14, backgroundColor: '#fff' }}
            left={<TextInput.Icon icon="email" style={{ marginTop: 10 }} fontSize="small" />}
          />
        
       
        <Button
          mode="contained"
          onPress={addInvitedCleaner}
          style={modalStyles.buttonSpacing}
          disabled={!inviteEmail && !invitePhone}
        >
          {tSafe('add_invite', 'Add Invite')}
        </Button>

        {/* Current selections */}
        <Text style={modalStyles.sectionTitle}>
          {tSafe('selected_cleaners', 'Selected Cleaners')}
        </Text>
        <View style={modalStyles.chipContainer}>
          {preferredCleaners.map((cleaner) => (
            <View key={cleaner.id} style={modalStyles.chip}>
              <Text style={modalStyles.chipText}>
                {cleaner.type === 'platform'
                  ? cleaner.name
                  : cleaner.email || cleaner.phone}
              </Text>
              <TouchableOpacity
                onPress={() => removeCleaner(cleaner.id)}
                style={modalStyles.removeIcon}
              >
                <Icon source="close" size={16} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={onClose}
          style={[modalStyles.buttonSpacing, { marginTop: 16 }]}
        >
          {tSafe('done', 'Done')}
        </Button>
  
      </Modal>
    </Portal>
  );
};

const modalStyles = StyleSheet.create({
  // safeArea: {
  //   flex: 1,
  //   backgroundColor: COLORS.white,
  // },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginTop: 12,
    marginBottom: 8,
  },
  cleanerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '40', // light gray with opacity
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.dark,
    marginRight: 6,
  },
  removeIcon: {
    padding: 2,
  },
  inputSpacing: {
    marginBottom: 8,
  },
  buttonSpacing: {
    marginTop: 8,
  },
});

export default CleanerManagementModal;