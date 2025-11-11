
// Hybrid Account Manager - Uses API with localStorage as cache
import { apiClient, User as APIUser, Room as APIRoom, FriendRequest as APIFriendRequest, Notification as APINotification } from './apiClient';

// =================================
// TYPE DEFINITIONS
// =================================

export type UserAccount = APIUser;
export type MultiplayerRoom = APIRoom;
export type FriendRequest = APIFriendRequest;
export type Notification = APINotification;


// =================================
// STORAGE KEYS
// =================================

const STORAGE_KEYS = {
  CURRENT_USER: 'sudoku_current_user',
  AUTH_TOKEN: 'Group-12-Project-CSCE3444-fa25_AUTH_TOKEN',
  USER_CACHE: 'sudoku_user_cache',
};


// =================================
// HELPER FUNCTIONS
// =================================

function isNetworkError(error: any): boolean {
  return error?.message === 'NETWORK_ERROR' || 
         error?.message?.includes('fetch') ||
         error?.message?.includes('Failed to fetch');
}

// =================================
// USER & AUTH MANAGEMENT
// =================================

export async function registerUser(username: string, password: string, email?: string): Promise<UserAccount> {
  try {
    const { user, token } = await apiClient.register(username, password, email);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    updateUserCache(user);
    return user;
  } catch (error: any) {
    console.error('Registration failed:', error);
    // No more offline fallback, just throw the error
    throw error;
  }
}

export async function loginUser(username: string, password: string): Promise<UserAccount> {
  try {
    const { user, token } = await apiClient.login(username, password);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    updateUserCache(user);
    return user;
  } catch (error: any) {
    console.error('Login failed:', error);
    // No more offline fallback
    throw error;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  // Also consider clearing caches if desired
  localStorage.removeItem(STORAGE_KEYS.USER_CACHE);
}

export function getCurrentUser(): UserAccount | null {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userData) return null;

  try {
    // Attempt to parse the stored user data
    return JSON.parse(userData);
  } catch (error) {
    // If parsing fails, the data is corrupt or in an old format
    console.error("Failed to parse user data from localStorage, clearing it.", error);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN); // Also clear the associated token
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
  try {
    // API client now handles sending the token
    const updatedUser = await apiClient.updateUser(userId, updates);
    
    // Update local storage if the updated user is the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const newCurrentUser = { ...currentUser, ...updatedUser };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newCurrentUser));
    }
    
    updateUserCache(updatedUser);
    return updatedUser;
  } catch (error: any) {
    console.error('Update user failed:', error);
    throw error; // Re-throw the error to be handled by the UI
  }
}


// =================================
// DATA FETCHING (with cache fallback)
// =================================

export async function getAllUsers(): Promise<UserAccount[]> {
  try {
    const users = await apiClient.getAllUsers();
    users.forEach(updateUserCache);
    return users;
  } catch (error: any) {
    console.error('Get all users failed:', error);
    if (isNetworkError(error)) {
      return getUserCache(); // Fallback to cache on network error
    }
    throw error;
  }
}

export async function getUserById(userId: string): Promise<UserAccount | null> {
  try {
    const user = await apiClient.getUser(userId);
    updateUserCache(user);
    return user;
  } catch (error: any) {
    console.error(`Get user ${userId} failed:`, error);
    if (isNetworkError(error)) {
      return getUserFromCache(userId); // Fallback to cache
    }
    return null; // Return null if not found on server
  }
}

export async function getFriends(userId: string): Promise<UserAccount[]> {
  try {
    return await apiClient.getFriends(userId);
  } catch (error: any) {
    console.error('Get friends failed:', error);
    return []; // Return empty array on error
  }
}

export async function getFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    return await apiClient.getFriendRequests(userId);
  } catch (error: any) {
    console.error('Get friend requests failed:', error);
    return [];
  }
}

// Actions (no cache fallback, just do it)
export const sendFriendRequest = apiClient.sendFriendRequest;
export const acceptFriendRequest = apiClient.acceptFriendRequest;
export const rejectFriendRequest = apiClient.rejectFriendRequest;
export const removeFriend = apiClient.removeFriend;


// =================================
// USER CACHE MANAGEMENT
// =================================

function updateUserCache(user: UserAccount): void {
  const cache = getUserCache();
  const index = cache.findIndex(u => u.id === user.id);
  if (index >= 0) {
    cache[index] = user;
  } else {
    cache.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(cache));
}

function getUserCache(): UserAccount[] {
  const cacheData = localStorage.getItem(STORAGE_KEYS.USER_CACHE);
  return cacheData ? JSON.parse(cacheData) : [];
}

function getUserFromCache(userId: string): UserAccount | null {
  const cache = getUserCache();
  return cache.find(u => u.id === userId) || null;
}


// =================================
// ROOM & NOTIFICATION MANAGEMENT
// =================================

export async function getNotifications(userId: string): Promise<Notification[]> {
  return apiClient.getNotifications(userId);
}
export async function markNotificationRead(notificationId: string): Promise<void> {
  return apiClient.markNotificationRead(notificationId);
}
export async function markAllNotificationsRead(userId: string): Promise<void> {
  return apiClient.markAllNotificationsRead(userId);
}

export async function createRoom(hostId: string, difficulty: string, puzzle: (number | null)[][], solution: number[][], maxPlayers: number = 50): Promise<MultiplayerRoom> {
  return apiClient.createRoom(hostId, difficulty, puzzle, solution, maxPlayers);
}
export async function joinRoom(code: string, userId: string, username: string, profileColor?: string, profilePicture?: string): Promise<MultiplayerRoom> {
  return apiClient.joinRoom(code, userId, username, profileColor, profilePicture);
}
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  return apiClient.leaveRoom(roomId, userId);
}
export async function getRoom(roomId: string): Promise<MultiplayerRoom> {
  return apiClient.getRoom(roomId);
}
export async function startRoom(roomId: string): Promise<MultiplayerRoom> {
  return apiClient.startRoom(roomId);
}
export async function updatePlayerProgress(roomId: string, userId: string, progress: number, timeElapsed: number, finished: boolean = false): Promise<void> {
  return apiClient.updatePlayerProgress(roomId, userId, progress, timeElapsed, finished);
}
export async function deleteRoom(roomId: string): Promise<void> {
  return apiClient.deleteRoom(roomId);
}
export async function setPlayerReady(roomId: string, userId: string, isReady: boolean): Promise<void> {
  return apiClient.setPlayerReady(roomId, userId, isReady);
}

export async function createPuzzle(title: string, difficulty: string, grid: (number | null)[][]): Promise<Puzzle> {
  return apiClient.createPuzzle(title, difficulty, grid);
}

export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  return apiClient.getUserChallenges(userId);
}
export async function sendGameChallenge(toUserId: string, difficulty: string): Promise<Challenge> {
  return apiClient.sendGameChallenge(toUserId, difficulty);
}
export async function acceptChallenge(challengeId: string): Promise<MultiplayerRoom> {
  return apiClient.acceptChallenge(challengeId);
}
export async function declineChallenge(challengeId: string): Promise<void> {
  return apiClient.declineChallenge(challengeId);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const notifications = await apiClient.getNotifications(userId);
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
}

// This function is not implemented on the backend, so we keep it as a stub
export async function getUserRooms(userId: string): Promise<any[]> {
  console.warn("getUserRooms is not implemented", { userId });
  return [];
}
