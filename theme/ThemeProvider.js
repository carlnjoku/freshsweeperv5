import React, {
    createContext,
    useContext,
    useMemo,
  } from 'react';
  import {
    useColorScheme,
  } from 'react-native';
  
  import LIGHT_THEME from './lightTheme';
  import DARK_THEME from './darkTheme';
  
  const ThemeContext = createContext(null);
  
  export const ThemeProvider = ({ children }) => {
    const colorScheme = useColorScheme();
  
    const theme = useMemo(() => {
      return colorScheme === 'dark'
        ? DARK_THEME
        : LIGHT_THEME;
    }, [colorScheme]);
  
    const value = useMemo(() => ({
      theme,
      mode: colorScheme === 'dark' ? 'dark' : 'light',
      isDark: colorScheme === 'dark',
      isLight: colorScheme !== 'dark',
    }), [theme, colorScheme]);
  
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  };
  
  export const useTheme = () => {
    const context = useContext(ThemeContext);
  
    if (!context) {
      throw new Error(
        'useTheme must be used inside a ThemeProvider'
      );
    }
  
    return context;
  };
  
  export default ThemeContext;