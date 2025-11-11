// Account Management System using localStorage

export type UserAccount = {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  profileColor?: string; // Color for avatar background
  profilePicture?: string; // Base64 encoded image or URL
  createdAt: number;
  xp: number;
  level: number;
  solvedPuzzles: number;
  wins: number;
  averageTime: string;
  boardStyle: string;
  preferences: {
    notifications: boolean;
    sound: boolean;
    darkMode: boolean;
  };
  friends: string[]; // Array of user IDs
  achievements: string[];
};

export type Challenge = {
  id: string;
  opponentId: string;
  difficulty: string;
  status: "active" | "pending" | "completed";
  yourScore?: number;
  opponentScore?: number;
  timeLimit: string;
  createdAt: number;
};

export type Puzzle = {
  id: string;
  creatorId: string;
  title: string;
  difficulty: string;
  grid: (number | null)[][];
  likes: string[]; // Array of user IDs who liked
  comments: number;
  timeToSolve: string;
  createdAt: number;
};

export type RoomPlayer = {
  userId: string;
  username: string;
  profileColor?: string;
  profilePicture?: string;
  level: number;
  progress: number; // 0-100
  filledCells: number;
  isReady: boolean;
  isFinished: boolean;
  finishTime?: number; // seconds
  placement?: number; // 1st, 2nd, 3rd etc
};

export type MultiplayerRoom = {
  id: string;
  code: string; // 6-digit room code
  hostId: string;
  difficulty: string;
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'waiting' | 'starting' | 'active' | 'finished';
  grid: (number | null)[][]; // The puzzle grid
  initialGrid: (number | null)[][]; // Initial state
  totalEmptyCells: number;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
};

export type Notification = {
  id: string;
  type: 'friend_request' | 'game_challenge' | 'room_invite';
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  message: string;
  data?: any; // Additional data like difficulty, roomCode, etc.
  createdAt: number;
  read: boolean;
};

const STORAGE_KEYS = {
  USERS: 'sudoku_users',
  CURRENT_USER: 'sudoku_current_user',
  CHALLENGES: 'sudoku_challenges',
  PUZZLES: 'sudoku_puzzles',
  ROOMS: 'sudoku_multiplayer_rooms',
  NOTIFICATIONS: 'sudoku_notifications',
};

// User Management
export function getAllUsers(): UserAccount[] {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): UserAccount | null {
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userId) return null;
  
  const users = getAllUsers();
  return users.find(u => u.id === userId) || null;
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function createAccount(username: string, password: string): { success: boolean; message: string; user?: UserAccount } {
  const users = getAllUsers();
  
  // Check if username already exists
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username already exists' };
  }

  // Create new user
  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    password, // In production, hash this
    profileColor: '#6366f1', // Default indigo color
    createdAt: Date.now(),
    xp: 0,
    level: 1,
    solvedPuzzles: 0,
    wins: 0,
    averageTime: '--:--',
    boardStyle: 'classic',
    preferences: {
      notifications: true,
      sound: true,
      darkMode: true, // Default to dark mode
    },
    friends: [],
    achievements: [],
  };

  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Account created successfully', user: newUser };
}

export function login(username: string, password: string): { success: boolean; message: string; user?: UserAccount } {
  const users = getAllUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return { success: false, message: 'Username not found' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Incorrect password' };
  }

  setCurrentUser(user.id);
  return { success: true, message: 'Login successful', user };
}

export function updateUser(userId: string, updates: Partial<UserAccount>): void {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);
  }
}

export function getUserById(userId: string): UserAccount | null {
  const users = getAllUsers();
  return users.find(u => u.id === userId) || null;
}

// Challenge Management
export function getAllChallenges(): Challenge[] {
  const challenges = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
  return challenges ? JSON.parse(challenges) : [];
}

function saveChallenges(challenges: Challenge[]): void {
  localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
}

export function getUserChallenges(userId: string): Challenge[] {
  const challenges = getAllChallenges();
  return challenges.filter(c => 
    c.id.includes(userId) || c.opponentId === userId
  );
}

export function createChallenge(userId: string, opponentId: string, difficulty: string): Challenge {
  const challenges = getAllChallenges();
  
  const newChallenge: Challenge = {
    id: `challenge_${userId}_${Date.now()}`,
    opponentId,
    difficulty,
    status: 'pending',
    timeLimit: '48:00:00',
    createdAt: Date.now(),
  };

  challenges.push(newChallenge);
  saveChallenges(challenges);
  
  return newChallenge;
}

export function updateChallenge(challengeId: string, updates: Partial<Challenge>): void {
  const challenges = getAllChallenges();
  const challengeIndex = challenges.findIndex(c => c.id === challengeId);
  
  if (challengeIndex !== -1) {
    challenges[challengeIndex] = { ...challenges[challengeIndex], ...updates };
    saveChallenges(challenges);
  }
}

// Puzzle Management
export function getAllPuzzles(): Puzzle[] {
  const puzzles = localStorage.getItem(STORAGE_KEYS.PUZZLES);
  return puzzles ? JSON.parse(puzzles) : [];
}

function savePuzzles(puzzles: Puzzle[]): void {
  localStorage.setItem(STORAGE_KEYS.PUZZLES, JSON.stringify(puzzles));
}

export function createPuzzle(creatorId: string, title: string, difficulty: string, grid: (number | null)[][]): Puzzle {
  const puzzles = getAllPuzzles();
  
  const newPuzzle: Puzzle = {
    id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    creatorId,
    title,
    difficulty,
    grid,
    likes: [],
    comments: 0,
    timeToSolve: '--:--',
    createdAt: Date.now(),
  };

  puzzles.push(newPuzzle);
  savePuzzles(puzzles);
  
  return newPuzzle;
}

export function togglePuzzleLike(puzzleId: string, userId: string): void {
  const puzzles = getAllPuzzles();
  const puzzle = puzzles.find(p => p.id === puzzleId);
  
  if (puzzle) {
    if (puzzle.likes.includes(userId)) {
      puzzle.likes = puzzle.likes.filter(id => id !== userId);
    } else {
      puzzle.likes.push(userId);
    }
    savePuzzles(puzzles);
  }
}

// Friend Management
export function addFriend(userId: string, friendId: string): void {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);
  
  if (user && friend && !user.friends.includes(friendId)) {
    user.friends.push(friendId);
    // Also add reciprocal friendship
    if (!friend.friends.includes(userId)) {
      friend.friends.push(userId);
    }
    saveUsers(users);
  }
}

export function getFriends(userId: string): UserAccount[] {
  const user = getUserById(userId);
  if (!user) return [];
  
  const users = getAllUsers();
  return users.filter(u => user.friends.includes(u.id));
}

// Initialize with demo data if empty
export function initializeDemoData(): void {
  const users = getAllUsers();
  
  if (users.length === 0) {
    // Create some demo accounts
    const demoUsers: UserAccount[] = [
      {
        id: 'user_demo1',
        username: 'PuzzleMaster (bot)',
        password: 'demo123',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        xp: 15420,
        level: 28,
        solvedPuzzles: 456,
        wins: 234,
        averageTime: '5:23',
        boardStyle: 'ocean',
        preferences: { notifications: true, sound: true, darkMode: false },
        friends: ['user_demo2', 'user_demo3'],
        achievements: ['speed_demon', 'puzzle_master', 'perfect_score'],
      },
      {
        id: 'user_demo2',
        username: 'SudokuPro (bot)',
        password: 'demo123',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        xp: 14890,
        level: 27,
        solvedPuzzles: 432,
        wins: 198,
        averageTime: '5:45',
        boardStyle: 'classic',
        preferences: { notifications: true, sound: true, darkMode: false },
        friends: ['user_demo1', 'user_demo3'],
        achievements: ['speed_demon', 'puzzle_master'],
      },
      {
        id: 'user_demo3',
        username: 'GridGuru (bot)',
        password: 'demo123',
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        xp: 13560,
        level: 25,
        solvedPuzzles: 398,
        wins: 176,
        averageTime: '6:12',
        boardStyle: 'forest',
        preferences: { notifications: true, sound: false, darkMode: false },
        friends: ['user_demo1', 'user_demo2'],
        achievements: ['puzzle_master'],
      },
      {
        id: 'user_demo4',
        username: 'QuickSolver (bot)',
        password: 'demo123',
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        xp: 8940,
        level: 18,
        solvedPuzzles: 267,
        wins: 123,
        averageTime: '7:08',
        boardStyle: 'sunset',
        preferences: { notifications: true, sound: true, darkMode: false },
        friends: [],
        achievements: ['speed_demon'],
      },
      {
        id: 'user_demo5',
        username: 'NumberNinja (bot)',
        password: 'demo123',
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        xp: 6730,
        level: 15,
        solvedPuzzles: 198,
        wins: 89,
        averageTime: '7:45',
        boardStyle: 'royal',
        preferences: { notifications: true, sound: true, darkMode: false },
        friends: [],
        achievements: [],
      },
    ];

    saveUsers(demoUsers);

    // Create some demo puzzles
    const demoPuzzles: Puzzle[] = demoUsers.slice(0, 3).map((user, index) => ({
      id: `puzzle_demo${index + 1}`,
      creatorId: user.id,
      title: ['Mind Bender', 'Classic Challenge', 'Quick Solve'][index],
      difficulty: ['Expert', 'Hard', 'Medium'][index],
      grid: generateDemoGrid(),
      likes: [],
      comments: [23, 15, 41][index],
      timeToSolve: ['12:34', '8:45', '6:12'][index],
      createdAt: Date.now() - (index + 1) * 24 * 60 * 60 * 1000,
    }));

    savePuzzles(demoPuzzles);
  }
}

function generateDemoGrid(): (number | null)[][] {
  const grid = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Add some random numbers
  for (let i = 0; i < 30; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    const num = Math.floor(Math.random() * 9) + 1;
    grid[row][col] = num;
  }
  
  return grid;
}

// Multiplayer Room Management
export function getAllRooms(): MultiplayerRoom[] {
  const rooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
  return rooms ? JSON.parse(rooms) : [];
}

function saveRooms(rooms: MultiplayerRoom[]): void {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
}

export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createRoom(hostId: string, difficulty: string, grid: (number | null)[][], maxPlayers: number = 50): MultiplayerRoom {
  const rooms = getAllRooms();
  const host = getUserById(hostId);
  
  if (!host) throw new Error('Host user not found');
  
  // Count empty cells
  const totalEmptyCells = grid.flat().filter(cell => cell === null).length;
  
  const newRoom: MultiplayerRoom = {
    id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code: generateRoomCode(),
    hostId,
    difficulty,
    maxPlayers,
    players: [{
      userId: hostId,
      username: host.username,
      profileColor: host.profileColor,
      profilePicture: host.profilePicture,
      level: host.level,
      progress: 0,
      filledCells: 0,
      isReady: true,
      isFinished: false,
    }],
    status: 'waiting',
    grid: grid.map(row => [...row]),
    initialGrid: grid.map(row => [...row]),
    totalEmptyCells,
    createdAt: Date.now(),
  };
  
  rooms.push(newRoom);
  saveRooms(rooms);
  
  return newRoom;
}

export function getRoomByCode(code: string): MultiplayerRoom | null {
  const rooms = getAllRooms();
  return rooms.find(r => r.code === code && r.status !== 'finished') || null;
}

export function getRoomById(roomId: string): MultiplayerRoom | null {
  const rooms = getAllRooms();
  return rooms.find(r => r.id === roomId) || null;
}

export function joinRoom(roomCode: string, userId: string): { success: boolean; message: string; room?: MultiplayerRoom } {
  const rooms = getAllRooms();
  const room = rooms.find(r => r.code === roomCode);
  const user = getUserById(userId);
  
  if (!room) {
    return { success: false, message: 'Room not found' };
  }
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (room.status !== 'waiting') {
    return { success: false, message: 'Game already started' };
  }
  
  if (room.players.length >= room.maxPlayers) {
    return { success: false, message: 'Room is full' };
  }
  
  if (room.players.some(p => p.userId === userId)) {
    return { success: false, message: 'Already in room' };
  }
  
  room.players.push({
    userId,
    username: user.username,
    profileColor: user.profileColor,
    profilePicture: user.profilePicture,
    level: user.level,
    progress: 0,
    filledCells: 0,
    isReady: false,
    isFinished: false,
  });
  
  saveRooms(rooms);
  
  return { success: true, message: 'Joined room successfully', room };
}

export function leaveRoom(roomId: string, userId: string): void {
  const rooms = getAllRooms();
  const room = rooms.find(r => r.id === roomId);
  
  if (room) {
    room.players = room.players.filter(p => p.userId !== userId);
    
    // If host left, assign new host or delete room
    if (room.hostId === userId) {
      if (room.players.length > 0) {
        room.hostId = room.players[0].userId;
      } else {
        // Delete empty room
        const roomIndex = rooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
          rooms.splice(roomIndex, 1);
        }
        saveRooms(rooms);
        return;
      }
    }
    
    saveRooms(rooms);
  }
}

export function updatePlayerReady(roomId: string, userId: string, isReady: boolean): void {
  const rooms = getAllRooms();
  const room = rooms.find(r => r.id === roomId);
  
  if (room) {
    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.isReady = isReady;
      saveRooms(rooms);
    }
  }
}

export function startRoom(roomId: string): void {
  const rooms = getAllRooms();
  const room = rooms.find(r => r.id === roomId);
  
  if (room && room.status === 'waiting') {
    room.status = 'active';
    room.startedAt = Date.now();
    saveRooms(rooms);
  }
}

export function updatePlayerProgress(roomId: string, userId: string, filledCells: number, progress: number): void {
  const rooms = getAllRooms();
  const room = rooms.find(r => r.id === roomId);
  
  if (room) {
    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.filledCells = filledCells;
      player.progress = progress;
      
      // Check if player finished
      if (progress >= 100 && !player.isFinished) {
        player.isFinished = true;
        player.finishTime = room.startedAt ? (Date.now() - room.startedAt) / 1000 : 0;
        
        // Calculate placement
        const finishedPlayers = room.players.filter(p => p.isFinished).sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));
        finishedPlayers.forEach((p, index) => {
          p.placement = index + 1;
        });
      }
      
      saveRooms(rooms);
    }
  }
}

export function getUserRooms(userId: string): MultiplayerRoom[] {
  const rooms = getAllRooms();
  return rooms.filter(r => 
    r.players.some(p => p.userId === userId) && 
    r.status !== 'finished'
  );
}

export function cleanupOldRooms(): void {
  const rooms = getAllRooms();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  const activeRooms = rooms.filter(r => {
    // Keep rooms less than 1 day old or still active
    return r.createdAt > oneDayAgo || r.status === 'active' || r.status === 'waiting';
  });
  
  saveRooms(activeRooms);
}

// Notification Management
export function getAllNotifications(): Notification[] {
  const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return notifications ? JSON.parse(notifications) : [];
}

function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function getUserNotifications(userId: string): Notification[] {
  const notifications = getAllNotifications();
  return notifications
    .filter(n => n.toUserId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadNotificationCount(userId: string): number {
  const notifications = getUserNotifications(userId);
  return notifications.filter(n => !n.read).length;
}

export function createNotification(
  type: Notification['type'],
  fromUserId: string,
  toUserId: string,
  message: string,
  data?: any
): Notification {
  const notifications = getAllNotifications();
  const fromUser = getUserById(fromUserId);
  
  const newNotification: Notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    fromUserId,
    fromUsername: fromUser?.username || 'Unknown',
    toUserId,
    message,
    data,
    createdAt: Date.now(),
    read: false,
  };
  
  notifications.push(newNotification);
  saveNotifications(notifications);
  
  return newNotification;
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getAllNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

export function deleteNotification(notificationId: string): void {
  const notifications = getAllNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
}

export function sendFriendRequest(fromUserId: string, toUserId: string): void {
  const fromUser = getUserById(fromUserId);
  const toUser = getUserById(toUserId);
  
  if (!fromUser || !toUser) return;
  
  // Check if already friends
  if (fromUser.friends.includes(toUserId)) return;
  
  // Check if request already exists
  const existingNotifications = getAllNotifications();
  const existingRequest = existingNotifications.find(
    n => n.type === 'friend_request' && n.fromUserId === fromUserId && n.toUserId === toUserId
  );
  
  if (existingRequest) return;
  
  createNotification(
    'friend_request',
    fromUserId,
    toUserId,
    `${fromUser.username} wants to be your friend`,
    {}
  );
}

export function acceptFriendRequest(notificationId: string): void {
  const notifications = getAllNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification && notification.type === 'friend_request') {
    addFriend(notification.toUserId, notification.fromUserId);
    deleteNotification(notificationId);
  }
}

export function sendGameChallenge(fromUserId: string, toUserId: string, difficulty: string): void {
  const fromUser = getUserById(fromUserId);
  const toUser = getUserById(toUserId);
  
  if (!fromUser || !toUser) return;
  
  createNotification(
    'game_challenge',
    fromUserId,
    toUserId,
    `${fromUser.username} challenged you to a ${difficulty} game!`,
    { difficulty }
  );
}

export function acceptGameChallenge(notificationId: string): { roomId?: string } {
  const notifications = getAllNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification && notification.type === 'game_challenge') {
    // Create a multiplayer room for the challenge
    const difficulty = notification.data?.difficulty || 'Medium';
    const gridSize = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 9;
    const emptyGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    const room = createRoom(notification.fromUserId, difficulty, emptyGrid, 2);
    
    // Auto-join the challenged user
    joinRoom(room.code, notification.toUserId);
    
    deleteNotification(notificationId);
    
    return { roomId: room.id };
  }
  
  return {};
}
