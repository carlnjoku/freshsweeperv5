// // LanguageContext.js
// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import i18n from '../i18n';
// import { updateUserLanguage } from '../services/connection/userApi';



// export const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState('en');

//   useEffect(() => {
//     const loadLanguage = async () => {
//       const storedLang = await AsyncStorage.getItem('appLanguage');
//       if (storedLang) {
//         setLanguage(storedLang);
//         i18n.changeLanguage(storedLang);
//       }
//     };
    
//     loadLanguage();
//   }, []);

//   const changeLanguage = async (langCode) => {
//     setLanguage(langCode);
//     i18n.changeLanguage(langCode);
//     await AsyncStorage.setItem('appLanguage', langCode);
//   };

//   return (
//     <LanguageContext.Provider value={{ language, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };



// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import i18n from '../i18n';
// // import { updateUserLanguage } from '../services/connection/userApi';
// import { updateUserLanguage } from '../services/connection/chatApi';

// export const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState('en');

//   useEffect(() => {
//     const loadLanguage = async () => {
//       const storedLang = await AsyncStorage.getItem('appLanguage');
//       if (storedLang) {
//         setLanguage(storedLang);
//         i18n.changeLanguage(storedLang);
//       }
//     };
//     loadLanguage();
//   }, []);

//   // const changeLanguage = async (langCode) => {

//   //   setLanguage(langCode);
//   //   i18n.changeLanguage(langCode);
//   //   await AsyncStorage.setItem('appLanguage', langCode);
//   //   // Update language on backend
   
//   //   try {
//   //     await updateUserLanguage(langCode);
//   //     console.log('Language updated on server:', langCode);
//   //   } catch (error) {
//   //     console.error('Failed to update language on server:', error);
//   //   }
//   // };

//   const changeLanguage = async (langCode) => {
//     alert(langCode)
//     console.log('changeLanguage called with:', langCode);
//     setLanguage(langCode);
//     i18n.changeLanguage(langCode);
//     await AsyncStorage.setItem('appLanguage', langCode);
//     try {
//       console.log('Calling updateUserLanguage...');
//       await updateUserLanguage(langCode);
//       console.log('Language updated on server:', langCode);
//     } catch (error) {
//       console.error('Failed to update language on server:', error);
//     }
//   };
  

//   return (
//     <LanguageContext.Provider value={{ language, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };



import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { updateUserLanguage } from '../services/connection/chatApi';
import { AuthContext } from './AuthContext';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const {currentUserId} = useContext(AuthContext)
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

  // const changeLanguage = async (langCode) => {
  //   setLanguage(langCode);
  //   i18n.changeLanguage(langCode);
  //   await AsyncStorage.setItem('appLanguage', langCode);

  //   // Retry up to 3 times to get the token
  //   let token = null;
  //   for (let i = 0; i < 3; i++) {
  //     token = await AsyncStorage.getItem('accessToken');
  //     if (token) break;
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //   }

  //   if (token) {
  //     try {
  //       await updateUserLanguage(langCode, token);
  //       console.log('Language updated on server:', langCode);
  //     } catch (error) {
  //       console.error('Failed to update language on server:', error);
  //     }
  //   } else {
  //     console.warn('No access token found after retries');
  //   }
  // };

  const changeLanguage = async (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('appLanguage', langCode);
    
    if (currentUserId) {
      try {
        await updateUserLanguage(currentUserId, langCode);
        console.log('Language updated on server:', langCode);
      } catch (error) {
        console.error('Failed to update language on server:', error);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};