import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../../constants/colors";
import { languages } from "../../data";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tSafe } from "../../utils/tSafe";

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
    await AsyncStorage.setItem("appLanguage", id);
    i18n.changeLanguage(id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tSafe("select_language", "Select Language")}</Text>

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
              <Icon name="checkmark" size={24} color="#007BFF" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: COLORS.dark },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  languageText: { fontSize: 18 },
  selectedText: { fontWeight: "bold", color: "#007BFF" },
});