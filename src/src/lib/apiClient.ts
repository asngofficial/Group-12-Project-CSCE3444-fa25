const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
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
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle token expiration or invalid token, e.g., by logging out the user
          console.error('Authentication error. Logging out.');
          // Consider calling a logout function here
        }
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      console.error('API request failed:', error);
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
