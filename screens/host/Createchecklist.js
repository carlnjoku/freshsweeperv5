

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
import userService from '../../services/connection/userService';
import Toast from 'react-native-toast-message';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { useBookingContext } from '../../context/BookingContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe'; // added import

export default function CreateChecklist({ route }) {
  const { currentUserId, currency, userToken } = useContext(AuthContext);
  const {
    source,
    propertyId,
    apartmentName,
    onChecklistCreated,
  } = route.params || {};

  const {
    setFormData,
  } = useBookingContext();

  const navigation = useNavigation();

  const [expectedCleaners] = useState(2);
  const [taskGroups, setTaskGroups] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [groupSummary, setGroupSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);
  const [totalFee, setTotalFee] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [checklistName, setChecklistName] = useState(
    tSafe('default_checklist_name', 'Cleaning Checklist - {property}', { property: apartmentName || tSafe('property', 'Property') })
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
  const [selectedPropertyName, setSelectedPropertyName] = useState('');
  const [properties, setProperties] = useState([]);

  /* ---------------- FETCH PROPERTIES ---------------- */
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await userService.getApartment(currentUserId);
      setProperties(res.data || []);

      // ✅ DEFAULT SELECTION
      if (propertyId) {
        const found = res.data.find(p => p._id === propertyId);
        if (found) {
          setSelectedPropertyId(found._id);
          setSelectedPropertyName(found.apt_name);
        }
      } else if (res.data.length > 0) {
        setSelectedPropertyId(res.data[0]._id);
        setSelectedPropertyName(res.data[0].apt_name);
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: tSafe('failed_load_properties', 'Failed to load properties'),
      });
    }
  };

  /* ---------------- FETCH APARTMENT DETAILS ---------------- */
  useEffect(() => {
    if (!selectedPropertyId) return;

    const fetchApartmentDetails = async () => {
      setIsLoading(true);
      try {
        const res = await userService.getApartmentById(selectedPropertyId);
        setSelectedApartment(res.data);

        const groups = Array.from({ length: expectedCleaners }, (_, i) => ({
          groupId: `group_${i + 1}`,
          rooms: [],
          pricing: null,
        }));
        setTaskGroups(groups);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: tSafe('failed_load_property', 'Failed to load property'),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApartmentDetails();
  }, [selectedPropertyId]);

  /* ---------------- UPDATE FORM DATA ---------------- */
  useEffect(() => {
    if (!selectedApartment?._id) return;

    setFormData(prev => ({
      ...prev,
      aptId: selectedApartment._id,
    }));
  }, [selectedApartment]);

  /* ---------------- SAVE ---------------- */
  const handleSaveChecklist = async () => {
    if (!selectedPropertyId || !groupSummary || !checklistName.trim()) {
      Toast.show({
        type: 'error',
        text1: tSafe('missing_data', 'Missing required data'),
      });
      return;
    }

    const payload = {
      propertyId: selectedPropertyId,
      hostId: currentUserId,
      checklistName: checklistName.trim(),
      apt_name: selectedPropertyName,
      checklist: groupSummary,
      totalFee,
      totalTime,
      isDefault: true,
    };

    setIsSaving(true);
    try {
      const res = await userService.saveChecklist(payload, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (res.status === 200) {

        // Callback to refresh parent component
        if (onChecklistCreated) {
          onChecklistCreated();
        }
        navigation.navigate(ROUTES.host_checklist,{
          mode:"delete",
          status:"success",
          message:tSafe('checklist_created_success', 'Checklist successfully created')
        })
        // Toast.show({
        //   type: 'success',
        //   text1: 'Checklist saved successfully',
        // });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: tSafe('failed_save_checklist', 'Failed to save checklist'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>{tSafe('loading_property_details', 'Loading property details...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
          <Text style={styles.backText}>{tSafe('back', 'Back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tSafe('create_checklist_title', 'Create Checklist')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {!propertyId && (
          <FloatingLabelPickerSelect
            label={tSafe('choose_property', 'Choose a property')}
            items={properties.map(p => ({
              label: p.apt_name,
              value: p._id,
            }))}
            value={selectedPropertyId}
            onValueChange={(value) => {
              setSelectedPropertyId(value);
              const prop = properties.find(p => p._id === value);
              setSelectedPropertyName(prop?.apt_name || '');
            }}
          />
        )}

        {selectedApartment && (
          <RoomAssignmentPicker
            key={selectedPropertyId}
            selectedApartment={selectedApartment}
            taskGroups={taskGroups}
            onGroupSummaryChange={setGroupSummary}
            onTotalFeeChange={setTotalFee}
            onTotalTimeChange={setTotalTime}
            checklistName={checklistName}
            setChecklistName={setChecklistName}
            onInfoPress={() => setShowTooltip(true)}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSaveChecklist}
          loading={isSaving}
          disabled={!groupSummary}
          style={{ marginTop: 24, marginBottom:20, backgroundColor:COLORS.dark }}
        >
          {tSafe('save_checklist', 'Save Checklist')} ({currency}{totalFee.toFixed(2)})
        </Button>
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#fff',
    marginBottom:50 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backText: { 
    marginLeft: 4 
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  content: { 
    padding: 20 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});