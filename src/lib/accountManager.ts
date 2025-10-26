import { generateCompleteSudoku, createSudokuPuzzle } from "./sudoku";

// Account Management System using localStorage

export type UserAccount = {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  createdAt: number;
  xp: number;
  level: number;
  solvedPuzzles: number;
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

const STORAGE_KEYS = {
  USERS: 'sudoku_users',
  CURRENT_USER: 'sudoku_current_user',
  CHALLENGES: 'sudoku_challenges',
  PUZZLES: 'sudoku_puzzles',
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
    createdAt: Date.now(),
    xp: 0,
    level: 1,
    solvedPuzzles: 0,
    averageTime: '--:--',
    boardStyle: 'classic',
    preferences: {
      notifications: true,
      sound: true,
      darkMode: false,
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
  let users = getAllUsers();
  let demoUsers: UserAccount[] = [];

  // Create some demo accounts if none exist
  if (users.length === 0) {
    demoUsers = [
      {
        id: 'user_demo1',
        username: 'PuzzleMaster (bot)',
        password: 'demo123',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        xp: 15420,
        level: 28,
        solvedPuzzles: 456,
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
        averageTime: '7:45',
        boardStyle: 'royal',
        preferences: { notifications: true, sound: true, darkMode: false },
        friends: [],
        achievements: [],
      },
    ];

    saveUsers(demoUsers);
    users = demoUsers; // Update users array with newly created demo users
  }

  // Always regenerate demo puzzles to ensure they are correctly formed
  // Clear existing puzzles first
  localStorage.removeItem(STORAGE_KEYS.PUZZLES);

  // Create some demo puzzles
  const demoPuzzles: Puzzle[] = users.slice(0, 3).map((user, index) => {
    const difficulty = ['Expert', 'Medium', 'Easy'][index]; // Match difficulty with generateGameGrid
    const completeBoard = generateCompleteSudoku();
    const puzzleGrid = createSudokuPuzzle(completeBoard, difficulty as any);

    return {
      id: `puzzle_demo${Date.now()}_${index + 1}`,
      creatorId: user.id,
      title: ['Mind Bender', 'Classic Challenge', 'Quick Solve'][index],
      difficulty,
      grid: puzzleGrid,
      likes: [],
      comments: [23, 15, 41][index],
      timeToSolve: ['12:34', '8:45', '6:12'][index],
      createdAt: Date.now() - (index + 1) * 24 * 60 * 60 * 1000,
    };
  });

  savePuzzles(demoPuzzles);
}

