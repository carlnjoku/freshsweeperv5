// LanguageContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem('appLanguage');
      if (storedLang) {
        setLanguage(storedLang);
        i18n.changeLanguage(storedLang);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('appLanguage', langCode);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};