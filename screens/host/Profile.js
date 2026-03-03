import React, { useState, useEffect, useContext, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView 
} from "react-native";
import { TextInput, Button, Avatar, Text } from "react-native-paper";
import COLORS from "../../constants/colors";
import AvatarUploader from "../../components/shared/AvatarUploader";
import { AuthContext } from '../../context/AuthContext';
import {
  get,
  ref,
  update,
} from 'firebase/database'; 
import { db } from "../../services/firebase/config";
import userService from "../../services/connection/userService";
import useDataFetch from "../../hooks/useDataFetch";


const Profile = () => {
  const { currentUserId, currentUser } = useContext(AuthContext);

  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    userId: currentUserId,
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
  });
  const [avatar, setUserAvatar] = useState("");

  // Fetch user profile data using useDataFetch hook
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await userService.getUser(currentUserId);
      const userData = response.data;
      
      return {
        ...userData,
        userId: currentUserId,
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }, [currentUserId]);

  const {
    data: userData,
    loading,
    error,
    refetch,
    retryAttempts
  } = useDataFetch(fetchUserProfile, [], {
    autoFetch: true,
    retryCount: 2,
    retryDelay: 1000,
  });

  // Update local state when userData is loaded
  useEffect(() => {
    if (userData && !editMode) {
      setProfile({
        userId: currentUserId,
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
      setUserAvatar(userData.avatar || "");
    }
  }, [userData, editMode, currentUserId]);

  const handleSave = async () => {
    try {
      await userService.updateHostProfile(profile);
      Alert.alert("Profile Updated", "Your profile has been saved successfully.");
      setEditMode(false);
      refetch(); // Refresh the data after saving
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Something went wrong", "Please try again.");
    }
  };

  const handleCancelEdit = () => {
    if (userData) {
      setProfile({
        userId: currentUserId,
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    }
    setEditMode(false);
  };

  const getUploadePhoto = (uploadedAvatar) => {
    const data = {
      userId: currentUserId,
      avatar: uploadedAvatar
    };

    userService.updateProfileAvatar(data)
      .then(response => {
        updateFirebaseAvatar(data);
        setUserAvatar(uploadedAvatar);
        refetch(); // Refresh user data after avatar update
        Alert.alert("Success", "Profile picture updated successfully!");
      })
      .catch((err) => {
        console.error('Error uploading avatar:', err);
        Alert.alert("Error", "Failed to update profile picture. Please try again.");
      });
  };

  const updateFirebaseAvatar = async (data) => {
    try {
      const mySnapshot = await get(ref(db, `users/${data.userId}`));
      if (mySnapshot.exists) {
        await update(ref(db, `users/${data.userId}`), { avatar: data.avatar });
      }
    } catch (error) {
      console.error('Error updating Firebase avatar:', error);
    }
  };

  // Loading state
  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        
        {retryAttempts > 0 && (
          <Text style={styles.retryText}>Attempt {retryAttempts} of 2</Text>
        )}
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture Section */}
        <AvatarUploader 
          userId={currentUserId} 
          default_photo={avatar} 
          image_type="avatar" 
          get_uploaded_photo={getUploadePhoto} 
        />

        {/* Profile Fields */}
        <TextInput
          label="First Name"
          placeholder="First Name"
          value={profile.firstname}
          onChangeText={(text) => setProfile({ ...profile, firstname: text })}
          mode="outlined"
          style={styles.input}
          activeOutlineColor={COLORS.primary}
          disabled={!editMode}
        />
        
        <TextInput
          label="Last Name"
          placeholder="Last Name"
          value={profile.lastname}
          onChangeText={(text) => setProfile({ ...profile, lastname: text })}
          mode="outlined"
          style={styles.input}
          activeOutlineColor={COLORS.primary}
          disabled={!editMode}
        />
        
        <TextInput
          label="Email"
          placeholder="Email"
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          mode="outlined"
          style={styles.input}
          activeOutlineColor={COLORS.primary}
          disabled={!editMode}
          keyboardType="email-address"
        />
        
        <TextInput
          label="Address"
          placeholder="Address"
          value={profile.address}
          onChangeText={(text) => setProfile({ ...profile, address: text })}
          mode="outlined"
          style={styles.input}
          activeOutlineColor={COLORS.primary}
          disabled={!editMode}
        />
        
        <TextInput
          label="Phone Number"
          placeholder="Phone Number"
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          mode="outlined"
          style={styles.input}
          activeOutlineColor={COLORS.primary}
          disabled={!editMode}
          keyboardType="phone-pad"
        />

        {/* Buttons for Edit and Save */}
        {editMode ? (
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              buttonColor={COLORS.primary} 
              onPress={handleSave} 
              style={[styles.button, styles.saveButton]}
            >
              Save
            </Button>
            <Button 
              mode="outlined" 
              textColor={COLORS.gray} 
              onPress={handleCancelEdit} 
              style={[styles.button, styles.cancelButton]}
            >
              Cancel
            </Button>
          </View>
        ) : (
          <Button 
            mode="outlined" 
            textColor={COLORS.primary} 
            onPress={() => setEditMode(true)} 
            style={styles.button}
          >
            Edit Profile
          </Button>
        )}

        {/* Debug info (only in development) */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Info</Text>
            <Text style={styles.debugText}>User ID: {currentUserId}</Text>
            <Text style={styles.debugText}>Avatar URL: {avatar ? "Set" : "Not set"}</Text>
            <Text style={styles.debugText}>Edit Mode: {editMode ? "Yes" : "No"}</Text>
            {error && <Text style={styles.debugError}>Error: {error}</Text>}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollContent: {
    alignItems: "center",
    padding: 16,
    paddingBottom: 40,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: COLORS.gray
  },
  input: {
    width: "100%",
    marginVertical: 8,
    color: COLORS.darkGray, 
    fontSize: 16, 
    backgroundColor: "#fff"
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
  retryText: {
    marginTop: 10,
    fontSize: 12,
    color: '#8E8E93',
  },
  debugSection: {
    width: "100%",
    marginTop: 20,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 4,
  },
  debugError: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 8,
  },
});

export default Profile;