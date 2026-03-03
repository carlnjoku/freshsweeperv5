import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import COLORS from "../../constants/colors";
import { languages } from "../../data";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ChangeLanguage() {


  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");

  // Load saved language on mount
  useEffect(() => {
    const getStoredLang = async () => {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang) {
        setSelectedLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }
    };
    getStoredLang();
  }, []);

  // Change language and save to storage
  const handleLanguageChange = async (id) => {
    
    setSelectedLanguage(id);
    await AsyncStorage.setItem("appLanguage", id); // Save selection
    i18n.changeLanguage(id); // Update language globally
  };

  return (
    <View style={styles.container}>
      
      <FlatList
        data={languages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.languageOption}
            onPress={() => handleLanguageChange(item.value)}
          >
            <Text
              style={[
                styles.languageText,
                selectedLanguage === item.value && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>
            {selectedLanguage === item.value && (
              <Icon name="checkmark" size={24} color="#007BFF" /> // Check icon
            )}
          </TouchableOpacity>
        )}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between", // Align text and icon on opposite ends
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  languageText: { fontSize: 18 },
  selectedText: { fontWeight: "bold", color: "#007BFF" },
  saveButton: {
    backgroundColor:COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});