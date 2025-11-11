import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount, getCurrentUser, updateUser, logoutUser } from '../lib/hybridAccountManager';

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
    // Load current user from localStorage
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const setUser = (user: UserAccount | null) => {
    setCurrentUser(user);
  };

  const updateCurrentUser = async (updates: Partial<UserAccount>) => {
    console.log('updateCurrentUser called with:', updates);
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      console.log('Updated user object:', updatedUser);
      setCurrentUser(updatedUser);
      try {
        await updateUser(currentUser.id, updates);
        console.log('User updated on server and localStorage');
      } catch (error) {
        console.error('Failed to sync user update to server:', error);
      }
    } else {
      console.log('No current user to update!');
    }
  };

  const logout = () => {
    logoutUser();
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
