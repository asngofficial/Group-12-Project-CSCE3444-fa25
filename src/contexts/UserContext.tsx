import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount, getCurrentUser, updateUser, clearCurrentUser, initializeDemoData } from '../lib/accountManager';

type UserContextType = {
  currentUser: UserAccount | null;
  setUser: (user: UserAccount | null) => void;
  updateCurrentUser: (updates: Partial<UserAccount>) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
    
    // Load current user from localStorage
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const setUser = (user: UserAccount | null) => {
    setCurrentUser(user);
  };

  const updateCurrentUser = (updates: Partial<UserAccount>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      updateUser(currentUser.id, updates);
    }
  };

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setUser,
        updateCurrentUser,
        logout,
        isAuthenticated: currentUser !== null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

