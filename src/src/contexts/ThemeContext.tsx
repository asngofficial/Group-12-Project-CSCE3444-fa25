import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from './UserContext';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentUser, updateCurrentUser } = useUser();
  
  // Load initial dark mode state from localStorage, default to true (dark mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('appDarkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // If no saved preference, check currentUser preference if logged in
    if (currentUser?.preferences?.darkMode !== undefined) {
      return currentUser.preferences.darkMode;
    }
    return true; // Default to dark mode
  });

  // Sync localStorage when isDarkMode changes
  useEffect(() => {
    localStorage.setItem('appDarkMode', JSON.stringify(isDarkMode));
    
    // Apply or remove dark class on document element (html tag)
    const htmlElement = document.documentElement;
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      console.log('Dark mode enabled - added .dark class to html element');
    } else {
      htmlElement.classList.remove('dark');
      console.log('Dark mode disabled - removed .dark class from html element');
    }
    
    // Log current state for debugging
    console.log('Current dark mode state:', isDarkMode);
    console.log('HTML classes:', htmlElement.className);
  }, [isDarkMode]);

  // Sync theme with currentUser preferences when currentUser changes
  useEffect(() => {
    if (currentUser?.preferences?.darkMode !== undefined && currentUser.preferences.darkMode !== isDarkMode) {
      setIsDarkMode(currentUser.preferences.darkMode);
    }
  }, [currentUser]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode); // Update local state and localStorage via useEffect

    if (currentUser) {
      // Also update currentUser preferences if logged in
      updateCurrentUser({
        preferences: {
          ...currentUser.preferences,
          darkMode: newMode,
        },
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
