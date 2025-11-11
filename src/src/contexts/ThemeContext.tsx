import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentUser, updateCurrentUser } = useUser();
  const isDarkMode = currentUser?.preferences?.darkMode ?? true; // Default to dark mode

  useEffect(() => {
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

  const toggleDarkMode = () => {
    if (currentUser) {
      updateCurrentUser({
        preferences: {
          ...currentUser.preferences,
          darkMode: !isDarkMode,
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
