const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Type definitions matching the backend
export type User = {
  id: string;
  username: string;
  email?: string;
  xp: number;
  level: number;
  solvedPuzzles: number;
  averageTime: string;
  profileColor?: string;
  profilePicture?: string;
  boardStyle?: string;
  createdAt?: string;
};

export type Room = {
  id: string;
  code: string;
  hostId: string;
  difficulty: string;
  puzzle: (number | null)[][];
  solution?: number[][];
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
  startedAt?: string;
};

export type RoomPlayer = {
  userId: string;
  username: string;
  progress: number;
  finished: boolean;
  timeElapsed: number;
  profileColor?: string;
  profilePicture?: string;
};

export type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUsername: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'friend_request' | 'challenge' | 'game_invite';
  message: string;
  read: boolean;
  createdAt: string;
};

export type Challenge = {
  id: string;
  fromUserId: string;
  toUserId: string;
  difficulty: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
};

export type Puzzle = {
  id: string;
  creatorId: string;
  title: string;
  difficulty: string;
  grid: (number | null)[][];
  likes: string[];
  comments: number;
  createdAt: string;
};

class APIClient {
  private baseUrl: string;
  private setBackendStatusCallback: ((status: boolean) => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public setBackendStatus(callback: (status: boolean) => void) {
    this.setBackendStatusCallback = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`); // Log request start
    const token = localStorage.getItem('Group-12-Project-CSCE3444-fa25_AUTH_TOKEN');

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, defaultOptions);
      
      if (this.setBackendStatusCallback) {
        if (!response.ok) {
          console.log(`API Client: Backend returned non-OK status ${response.status}. Marking as unresponsive.`);
          this.setBackendStatusCallback(true); 
        } else {
          console.log('API Client: Backend responsive (successful fetch).');
          this.setBackendStatusCallback(false); 
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication error. Logging out.');
        }
        try {
          const error = await response.json();
          throw new Error(error.message || `HTTP ${response.status}`);
        } catch (jsonError: any) {
          // If parsing JSON fails, it means the response was not valid JSON.
          // This often happens when the server returns HTML for an error, or is misconfigured.
          // Treat this as an unresponsive state if the original response was not OK.
          if (this.setBackendStatusCallback) {
            console.log('API Client: Backend returned non-JSON error. Marking as unresponsive.');
            this.setBackendStatusCallback(true); 
          }
          throw new Error(`Request failed: Invalid response from server.`);
        }
      }

      return await response.json();
    } catch (error: any) {
      console.error('API request caught error:', error); // Log the full error object for debugging

      // Check for common network-related errors
      const isNetworkError = 
        (error.name === 'TypeError' && (
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('network connection was lost') || // Safari
          error.message.includes('The Internet connection appears to be offline') // Firefox
        )) ||
        (error.message && error.message.includes('ECONNREFUSED')) || // Direct check for ECONNREFUSED if it propagates
        (error.message && error.message.includes('ERR_CONNECTION_REFUSED')); // Chrome specific

      if (isNetworkError) {
        if (this.setBackendStatusCallback) {
          console.log('API Client: Backend unreachable (NETWORK_ERROR detected). Marking as unresponsive.');
          this.setBackendStatusCallback(true); 
        }
        throw new Error('NETWORK_ERROR');
      }
      console.error('API request failed:', error); // Log full error object
      throw error;
    }
  }

  // Auth endpoints
  async register(username: string, password: string, email?: string): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  }

  async login(username: string, password: string): Promise<User> {
    return this.request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // User endpoints
  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/api/users/${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async getLeaderboard(limit: number = 50): Promise<User[]> {
    return this.request<User[]>(`/api/users/leaderboard?limit=${limit}`);
  }

  // Friends endpoints
  async sendFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest> {
    return this.request<FriendRequest>('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, toUsername }),
    });
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    return this.request<void>(`/api/friends/accept/${requestId}`, {
      method: 'POST',
    });
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    return this.request<void>(`/api/friends/reject/${requestId}`, {
      method: 'POST',
    });
  }

  async getFriends(userId: string): Promise<User[]> {
    return this.request<User[]>(`/api/friends/${userId}`);
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return this.request<FriendRequest[]>(`/api/friends/requests/${userId}`);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    return this.request<void>(`/api/friends/${userId}/${friendId}`, {
      method: 'DELETE',
    });
  }

  // Room endpoints
  async createRoom(hostId: string, difficulty: string, puzzle: (number | null)[][], solution: number[][], maxPlayers: number = 50): Promise<Room> {
    return this.request<Room>('/api/rooms/create', {
      method: 'POST',
      body: JSON.stringify({ hostId, difficulty, puzzle, solution, maxPlayers }),
    });
  }

  async joinRoom(code: string, userId: string, username: string, profileColor?: string, profilePicture?: string): Promise<Room> {
    return this.request<Room>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ code, userId, username, profileColor, profilePicture }),
    });
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    return this.request<void>(`/api/rooms/${roomId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getRoom(roomId: string): Promise<Room> {
    return this.request<Room>(`/api/rooms/${roomId}`);
  }

  async startRoom(roomId: string): Promise<Room> {
    return this.request<Room>(`/api/rooms/${roomId}/start`, {
      method: 'POST',
    });
  }

  async updatePlayerProgress(roomId: string, userId: string, progress: number, timeElapsed: number, finished: boolean = false): Promise<void> {
    return this.request<void>(`/api/rooms/${roomId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ userId, progress, timeElapsed, finished }),
    });
  }

  async deleteRoom(roomId: string): Promise<void> {
    return this.request<void>(`/api/rooms/${roomId}`, {
      method: 'DELETE',
    });
  }

  async setPlayerReady(roomId: string, userId: string, isReady: boolean): Promise<void> {
    return this.request<void>(`/api/rooms/${roomId}/ready`, {
      method: 'POST',
      body: JSON.stringify({ userId, isReady }),
    });
  }

  async kickPlayer(roomId: string, kickedPlayerId: string): Promise<void> {
    return this.request<void>(`/api/rooms/${roomId}/kick`, {
      method: 'POST',
      body: JSON.stringify({ kickedPlayerId }),
    });
  }

  // Notifications endpoints
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.request<Notification[]>(`/api/notifications/${userId}`);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.request<void>(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    return this.request<void>(`/api/notifications/${userId}/read-all`, {
      method: 'POST',
    });
  }

  async createPuzzle(title: string, difficulty: string, grid: (number | null)[][]): Promise<Puzzle> {
    return this.request<Puzzle>('/api/puzzles', {
      method: 'POST',
      body: JSON.stringify({ title, difficulty, grid }),
    });
  }

  // Challenge endpoints
  async sendGameChallenge(toUserId: string, difficulty: string): Promise<Challenge> {
    return this.request<Challenge>('/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ toUserId, difficulty }),
    });
  }

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    return this.request<Challenge[]>(`/api/users/${userId}/challenges`);
  }

  async acceptChallenge(challengeId: string): Promise<Room> {
    return this.request<Room>(`/api/challenges/${challengeId}/accept`, {
      method: 'POST',
    });
  }

  async declineChallenge(challengeId: string): Promise<void> {
    return this.request<void>(`/api/challenges/${challengeId}/decline`, {
      method: 'POST',
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
