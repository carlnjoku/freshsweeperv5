import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import FloatingLabelPickerSelect from '../shared/FloatingLabelPicker';

const PlatformCleanerPicker = ({
  platformCleaners,
  preferredCleaners,
  setPreferredCleaners
}) => {
  // current selected platform cleaner IDs
  const selectedIds = preferredCleaners
    .filter(c => c.type === 'platform')
    .map(c => c.id);

  return (
    <View>
      <FloatingLabelPickerSelect
        label="Select Platform Cleaner"
        items={platformCleaners?.map(c => ({ label: c.name, value: c.id })) || []}
        multiple={false}      // single selection picker
        value={null}          // always null so picker opens
        onValueChange={(value) => {
          if (!value) return;
          if (!selectedIds.includes(value)) {
            const selected = platformCleaners.find(c => c.id === value);
            setPreferredCleaners(prev => [
              ...prev.filter(p => p.type !== 'platform'),
              ...selectedIds.map(id => ({
                id,
                type: 'platform',
                name: platformCleaners.find(c => c.id === id)?.name
              })),
              { ...selected, type: 'platform' }
            ]);
          }
        }}
        placeholder={{ label: 'Select a cleaner...', value: null }}
      />

      {/* Selected cleaners as chips */}
      <FlatList
        horizontal
        data={preferredCleaners.filter(c => c.type === 'platform')}
        keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `cleaner-${index}`
          }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 6,
              margin: 4,
              backgroundColor: '#ddd',
              borderRadius: 16
            }}
          >
            <Text>{item.name}</Text>
            <TouchableOpacity
              onPress={() => {
                setPreferredCleaners(prev =>
                  prev.filter(p => p.id !== item.id)
                );
              }}
            >
              <Text style={{ marginLeft: 4, color: 'red' }}>x</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default PlatformCleanerPicker;