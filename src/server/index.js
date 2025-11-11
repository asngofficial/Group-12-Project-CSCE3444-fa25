import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data stores (replace with database in production)
const users = new Map();
const friendRequests = new Map();
const friendships = new Map(); // Map<userId, Set<friendId>>
const rooms = new Map();
const notifications = new Map(); // Map<userId, Array<Notification>>

// Helper functions
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function createNotification(userId, type, message, relatedId = null) {
  const notification = {
    id: uuidv4(),
    userId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    relatedId,
  };

  if (!notifications.has(userId)) {
    notifications.set(userId, []);
  }
  notifications.get(userId).push(notification);
  return notification;
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Group-12-Project-CSCE3444-fa25 API Server',
    version: '1.0.0',
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login'],
      users: ['/api/users', '/api/users/:id', '/api/users/leaderboard'],
      friends: ['/api/friends/:userId', '/api/friends/request', '/api/friends/accept/:id'],
      rooms: ['/api/rooms/create', '/api/rooms/join', '/api/rooms/:id'],
      notifications: ['/api/notifications/:userId'],
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Check if username already exists
    const existingUser = Array.from(users.values()).find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const user = {
      id: userId,
      username,
      email: email || '',
      password: hashedPassword,
      xp: 0,
      level: 1,
      solvedPuzzles: 0,
      averageTime: '0:00',
      profileColor: '#3b82f6',
      profilePicture: '',
      boardStyle: 'default',
      createdAt: new Date().toISOString(),
    };

    users.set(userId, user);
    friendships.set(userId, new Set());

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = Array.from(users.values()).find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/users', (req, res) => {
  const allUsers = Array.from(users.values()).map(({ password, ...user }) => user);
  res.json(allUsers);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updates = req.body;
  const updatedUser = { ...user, ...updates };
  
  // Recalculate level if XP changed
  if (updates.xp !== undefined) {
    updatedUser.level = calculateLevel(updates.xp);
  }

  users.set(req.params.id, updatedUser);

  const { password, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
});

app.get('/api/users/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  const leaderboard = Array.from(users.values())
    .map(({ password, ...user }) => user)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);

  res.json(leaderboard);
});

// ==================== FRIENDS ROUTES ====================

app.post('/api/friends/request', (req, res) => {
  try {
    const { fromUserId, toUsername } = req.body;

    const fromUser = users.get(fromUserId);
    if (!fromUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const toUser = Array.from(users.values()).find(u => u.username === toUsername);
    if (!toUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (fromUserId === toUser.id) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    const friends = friendships.get(fromUserId);
    if (friends && friends.has(toUser.id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = Array.from(friendRequests.values()).find(
      fr => fr.fromUserId === fromUserId && fr.toUserId === toUser.id && fr.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const requestId = uuidv4();
    const friendRequest = {
      id: requestId,
      fromUserId,
      toUserId: toUser.id,
      fromUsername: fromUser.username,
      toUsername: toUser.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    friendRequests.set(requestId, friendRequest);

    // Create notification
    createNotification(
      toUser.id,
      'friend_request',
      `${fromUser.username} sent you a friend request`,
      requestId
    );

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
});

app.post('/api/friends/accept/:id', (req, res) => {
  const request = friendRequests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ message: 'Request already processed' });
  }

  request.status = 'accepted';
  friendRequests.set(req.params.id, request);

  // Add to friendships
  if (!friendships.has(request.fromUserId)) {
    friendships.set(request.fromUserId, new Set());
  }
  if (!friendships.has(request.toUserId)) {
    friendships.set(request.toUserId, new Set());
  }

  friendships.get(request.fromUserId).add(request.toUserId);
  friendships.get(request.toUserId).add(request.fromUserId);

  // Create notification
  createNotification(
    request.fromUserId,
    'friend_request',
    `${request.toUsername} accepted your friend request`
  );

  res.json({ message: 'Friend request accepted' });
});

app.post('/api/friends/reject/:id', (req, res) => {
  const request = friendRequests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  request.status = 'rejected';
  friendRequests.set(req.params.id, request);

  res.json({ message: 'Friend request rejected' });
});

app.get('/api/friends/:userId', (req, res) => {
  const friendIds = friendships.get(req.params.userId);
  if (!friendIds) {
    return res.json([]);
  }

  const friends = Array.from(friendIds)
    .map(id => users.get(id))
    .filter(Boolean)
    .map(({ password, ...user }) => user);

  res.json(friends);
});

app.get('/api/friends/requests/:userId', (req, res) => {
  const userRequests = Array.from(friendRequests.values()).filter(
    fr => (fr.toUserId === req.params.userId || fr.fromUserId === req.params.userId) && fr.status === 'pending'
  );

  res.json(userRequests);
});

app.delete('/api/friends/:userId/:friendId', (req, res) => {
  const { userId, friendId } = req.params;

  const userFriends = friendships.get(userId);
  const friendFriends = friendships.get(friendId);

  if (userFriends) {
    userFriends.delete(friendId);
  }
  if (friendFriends) {
    friendFriends.delete(userId);
  }

  res.json({ message: 'Friend removed' });
});

// ==================== ROOM ROUTES ====================

app.post('/api/rooms/create', (req, res) => {
  try {
    const { hostId, difficulty, puzzle, solution, maxPlayers = 50 } = req.body;

    const host = users.get(hostId);
    if (!host) {
      return res.status(404).json({ message: 'Host user not found' });
    }

    const roomId = uuidv4();
    const code = generateRoomCode();

    const room = {
      id: roomId,
      code,
      hostId,
      difficulty,
      puzzle,
      solution,
      maxPlayers,
      players: [{
        userId: hostId,
        username: host.username,
        progress: 0,
        finished: false,
        timeElapsed: 0,
        profileColor: host.profileColor,
        profilePicture: host.profilePicture,
      }],
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    rooms.set(roomId, room);
    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
});

app.post('/api/rooms/join', (req, res) => {
  try {
    const { code, userId, username, profileColor, profilePicture } = req.body;

    const room = Array.from(rooms.values()).find(r => r.code === code);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== 'waiting') {
      return res.status(400).json({ message: 'Room already started' });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    const alreadyJoined = room.players.find(p => p.userId === userId);
    if (alreadyJoined) {
      return res.json(room);
    }

    room.players.push({
      userId,
      username,
      progress: 0,
      finished: false,
      timeElapsed: 0,
      profileColor,
      profilePicture,
    });

    rooms.set(room.id, room);
    res.json(room);
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
});

app.post('/api/rooms/:id/leave', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const { userId } = req.body;
  room.players = room.players.filter(p => p.userId !== userId);

  if (room.players.length === 0) {
    rooms.delete(req.params.id);
    return res.json({ message: 'Room deleted' });
  }

  // If host leaves, assign new host
  if (room.hostId === userId && room.players.length > 0) {
    room.hostId = room.players[0].userId;
  }

  rooms.set(req.params.id, room);
  res.json({ message: 'Left room' });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  res.json(room);
});

app.post('/api/rooms/:id/start', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  room.status = 'active';
  room.startedAt = new Date().toISOString();
  rooms.set(req.params.id, room);

  res.json(room);
});

app.post('/api/rooms/:id/progress', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const { userId, progress, timeElapsed, finished } = req.body;
  const player = room.players.find(p => p.userId === userId);
  
  if (!player) {
    return res.status(404).json({ message: 'Player not found in room' });
  }

  player.progress = progress;
  player.timeElapsed = timeElapsed;
  player.finished = finished;

  // Check if all players finished
  const allFinished = room.players.every(p => p.finished);
  if (allFinished) {
    room.status = 'finished';
  }

  rooms.set(req.params.id, room);
  res.json({ message: 'Progress updated' });
});

app.delete('/api/rooms/:id', (req, res) => {
  rooms.delete(req.params.id);
  res.json({ message: 'Room deleted' });
});

// ==================== NOTIFICATIONS ROUTES ====================

app.get('/api/notifications/:userId', (req, res) => {
  const userNotifications = notifications.get(req.params.userId) || [];
  res.json(userNotifications);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const notificationId = req.params.id;
  
  for (const [userId, userNotifications] of notifications.entries()) {
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notifications.set(userId, userNotifications);
      return res.json({ message: 'Notification marked as read' });
    }
  }

  res.status(404).json({ message: 'Notification not found' });
});

app.post('/api/notifications/:userId/read-all', (req, res) => {
  const userNotifications = notifications.get(req.params.userId);
  if (userNotifications) {
    userNotifications.forEach(n => n.read = true);
    notifications.set(req.params.userId, userNotifications);
  }

  res.json({ message: 'All notifications marked as read' });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Group-12-Project-CSCE3444-fa25 API Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://0.0.0.0:${PORT}`);
  console.log(`\n✨ Ready to accept connections!`);
});
