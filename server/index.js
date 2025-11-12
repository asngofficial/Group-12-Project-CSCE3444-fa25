import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { readFile, writeFile } from 'fs/promises';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// =================================
// DATABASE SETUP (fs/promises)
// =================================
const dbPath = join(__dirname, 'db.json');

// A simple promise-based queue to prevent race conditions during file writes.
let writePromise = Promise.resolve();

const db = {
  data: null,
  async read() {
    try {
      const fileContent = await readFile(dbPath, { encoding: 'utf-8' });
      this.data = fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.data = {};
      } else {
        throw error;
      }
    }
    
    // Ensure all tables exist after every read, making it resilient.
    this.data.users ||= [];
    this.data.rooms ||= [];
    this.data.friendRequests ||= [];
    this.data.notifications ||= [];
    this.data.puzzles ||= [];
    this.data.challenges ||= [];
  },
  async write() {
    // Chain the next write onto the previous one, ensuring sequential execution.
    writePromise = writePromise.then(async () => {
      if (this.data) {
        await writeFile(dbPath, JSON.stringify(this.data, null, 2));
      }
    }).catch(err => {
      console.error("Error during database write:", err);
    });
    return writePromise;
  },
};

async function initializeDatabase() {
  await db.read();
  await db.write();
}

initializeDatabase();

// =================================
// SERVER SETUP
// =================================
const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  'https://asngofficial.github.io', // Production
  'http://localhost:5173',             // Local Dev
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

// =================================
// AUTHENTICATION
// =================================
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// =================================
// HELPER FUNCTIONS
// =================================
const generateId = () => Math.random().toString(36).slice(2, 10);
const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// =================================
// AUTH ENDPOINTS (/api/auth)
// =================================
app.post('/api/auth/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  await db.read();
  const existingUser = db.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = {
    id: `user_${generateId()}`,
    username,
    password: hashedPassword,
    email: email || null,
    xp: 0,
    level: 1,
    solvedPuzzles: 0,
    averageTime: '0s',
    profileColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    friends: [],
    createdAt: new Date().toISOString(),
  };

  db.data.users.push(newUser);
  await db.write();

  const { password: _, ...userPayload } = newUser;
  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
  
  res.status(201).json({ user: userPayload, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  await db.read();
  const user = db.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { password: _, ...userPayload } = user;
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ user: userPayload, token });
});


// =================================
// USER ENDPOINTS (/api/users)
// =================================
app.get('/api/users', async (req, res) => {
  await db.read();
  const users = db.data.users.map(u => {
    const { password, ...userPayload } = u;
    return userPayload;
  });
  res.json(users);
});

app.get('/api/users/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  await db.read();
  const leaderboard = [...db.data.users]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map(u => {
      const { password, ...userPayload } = u;
      return userPayload;
    });
  res.json(leaderboard);
});

app.get('/api/users/:userId', async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password, ...userPayload } = user;
  res.json(userPayload);
});

app.put('/api/users/:userId', authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
  }

  await db.read();
  const userIndex = db.data.users.findIndex(u => u && u.id === req.params.userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent password updates through this endpoint
  const { password, ...updates } = req.body;
  
  db.data.users[userIndex] = { ...db.data.users[userIndex], ...updates };
  await db.write();

  const updatedUser = { ...db.data.users[userIndex] };
  delete updatedUser.password;
  res.json(updatedUser);
});


// =================================
// FRIENDS ENDPOINTS (/api/friends)
// =================================

app.post('/api/friends/request', authenticateToken, async (req, res) => {
    const { fromUserId, toUsername } = req.body;
    if (req.user.id !== fromUserId) return res.sendStatus(403);

    await db.read();
    const toUser = db.data.users.find(u => u.username.toLowerCase() === toUsername.toLowerCase());
    if (!toUser) return res.status(404).json({ message: 'User to add not found' });

    const fromUser = db.data.users.find(u => u.id === fromUserId);

    const newRequest = {
        id: `fr_${generateId()}`,
        fromUserId,
        toUserId: toUser.id,
        fromUsername: fromUser.username,
        toUsername: toUser.username,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    db.data.friendRequests.push(newRequest);
    await db.write();
    res.status(201).json(newRequest);
});

app.post('/api/friends/accept/:requestId', authenticateToken, async (req, res) => {
    await db.read();
    const requestIndex = db.data.friendRequests.findIndex(fr => fr.id === req.params.requestId);
    if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' });

    const request = db.data.friendRequests[requestIndex];
    if (req.user.id !== request.toUserId) return res.sendStatus(403);

    const fromUser = db.data.users.find(u => u.id === request.fromUserId);
    const toUser = db.data.users.find(u => u.id === request.toUserId);

    if (fromUser && toUser) {
        fromUser.friends = [...new Set([...fromUser.friends, toUser.id])];
        toUser.friends = [...new Set([...toUser.friends, fromUser.id])];
    }

    db.data.friendRequests.splice(requestIndex, 1); // Or mark as accepted
    await db.write();
    res.status(200).json({});
});

app.post('/api/friends/reject/:requestId', authenticateToken, async (req, res) => {
    await db.read();
    const requestIndex = db.data.friendRequests.findIndex(fr => fr.id === req.params.requestId);
    if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' });

    const request = db.data.friendRequests[requestIndex];
    if (req.user.id !== request.toUserId) return res.sendStatus(403);

    db.data.friendRequests.splice(requestIndex, 1); // Or mark as rejected
    await db.write();
    res.status(200).json({});
});

app.get('/api/friends/:userId', async (req, res) => {
    await db.read();
    const user = db.data.users.find(u => u.id === req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const friends = db.data.users.filter(u => user.friends.includes(u.id)).map(u => {
        const { password, ...friendPayload } = u;
        return friendPayload;
    });
    res.json(friends);
});

app.get('/api/friends/requests/:userId', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) return res.sendStatus(403);
    await db.read();
    const requests = db.data.friendRequests.filter(fr => fr.toUserId === req.params.userId);
    res.json(requests);
});

app.delete('/api/friends/:userId/:friendId', authenticateToken, async (req, res) => {
    const { userId, friendId } = req.params;
    if (req.user.id !== userId) return res.sendStatus(403);

    await db.read();
    const user = db.data.users.find(u => u.id === userId);
    const friend = db.data.users.find(u => u.id === friendId);

    if (user) user.friends = user.friends.filter(id => id !== friendId);
    await db.write();
    res.status(200).json({});
});

// =================================
// PUZZLE ENDPOINTS (/api/puzzles)
// =================================
app.post('/api/puzzles', authenticateToken, async (req, res) => {
    const { title, difficulty, grid } = req.body;
    const creatorId = req.user.id;

    const newPuzzle = {
        id: `puzzle_${generateId()}`,
        creatorId,
        title,
        difficulty,
        grid,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: 0,
    };

    await db.read();
    db.data.puzzles.push(newPuzzle);
    await db.write();

    res.status(201).json(newPuzzle);
});

// =================================
// CHALLENGE ENDPOINTS (/api/challenges)
// =================================

app.post('/api/challenges', authenticateToken, async (req, res) => {
    const { toUserId, difficulty } = req.body;
    const fromUserId = req.user.id;

    await db.read();
    const fromUser = db.data.users.find(u => u.id === fromUserId);
    const toUser = db.data.users.find(u => u.id === toUserId);

    if (!toUser) return res.status(404).json({ message: 'User to challenge not found' });

    const challengeId = `chal_${generateId()}`;
    const newChallenge = {
        id: challengeId,
        fromUserId,
        toUserId,
        difficulty,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    db.data.challenges.push(newChallenge);

    const notificationId = `notif_${generateId()}`;
    const newNotification = {
        id: notificationId,
        userId: toUserId,
        type: 'challenge',
        message: `${fromUser.username} challenged you to a ${difficulty} game!`,
        relatedId: challengeId,
        read: false,
        createdAt: new Date().toISOString(),
    };
    db.data.notifications.push(newNotification);
    
    await db.write();
    res.status(201).json(newChallenge);
});

app.get('/api/users/:userId/challenges', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) return res.sendStatus(403);
    await db.read();
    const userChallenges = db.data.challenges.filter(c => c.fromUserId === req.params.userId || c.toUserId === req.params.userId);
    res.json(userChallenges);
});

app.post('/api/challenges/:challengeId/accept', authenticateToken, async (req, res) => {
    const { challengeId } = req.params;
    await db.read();

    const challengeIndex = db.data.challenges.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) return res.status(404).json({ message: 'Challenge not found' });
    
    const challenge = db.data.challenges[challengeIndex];
    if (challenge.toUserId !== req.user.id) return res.sendStatus(403);

    const fromUser = db.data.users.find(u => u.id === challenge.fromUserId);
    const toUser = db.data.users.find(u => u.id === challenge.toUserId);

    // Create a new room
    const newRoom = {
        id: `room_${generateId()}`,
        code: generateRoomCode(),
        hostId: fromUser.id,
        difficulty: challenge.difficulty,
        puzzle: [], // You might want to generate a puzzle here
        solution: [],
        maxPlayers: 2,
        players: [
            { userId: fromUser.id, username: fromUser.username, progress: 0, finished: false, timeElapsed: 0, isReady: false },
            { userId: toUser.id, username: toUser.username, progress: 0, finished: false, timeElapsed: 0, isReady: false }
        ],
        status: 'waiting',
        createdAt: new Date().toISOString(),
    };
    db.data.rooms.push(newRoom);

    // Clean up challenge and notification
    db.data.challenges.splice(challengeIndex, 1);
    const notifIndex = db.data.notifications.findIndex(n => n.relatedId === challengeId);
    if (notifIndex > -1) db.data.notifications.splice(notifIndex, 1);

    await db.write();
    res.status(201).json(newRoom);
});

app.post('/api/challenges/:challengeId/decline', authenticateToken, async (req, res) => {
    const { challengeId } = req.params;
    await db.read();

    const challengeIndex = db.data.challenges.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) return res.status(404).json({ message: 'Challenge not found' });

    const challenge = db.data.challenges[challengeIndex];
    if (challenge.toUserId !== req.user.id) return res.sendStatus(403);

    // Clean up challenge and notification
    db.data.challenges.splice(challengeIndex, 1);
    const notifIndex = db.data.notifications.findIndex(n => n.relatedId === challengeId);
    if (notifIndex > -1) db.data.notifications.splice(notifIndex, 1);

    await db.write();
    res.status(200).json({});
});


// ROOM & NOTIFICATION ENDPOINTS
// =================================

app.post('/api/rooms/create', authenticateToken, async (req, res) => {
    const { difficulty, puzzle, solution, maxPlayers } = req.body;
    const hostId = req.user.id;

    await db.read();
    const host = db.data.users.find(u => u.id === hostId);

    if (!host) {
      return res.status(401).json({ message: 'Host user not found in database. Please log in again.' });
    }

    const newRoom = {
        id: `room_${generateId()}`,
        code: generateRoomCode(),
        hostId,
        difficulty,
        puzzle,
        initialPuzzle: JSON.parse(JSON.stringify(puzzle)), // Deep copy for progress tracking
        solution,
        maxPlayers,
        players: [{ 
          userId: hostId, 
          username: host.username, 
          profilePicture: host.profilePicture,
          profileColor: host.profileColor,
          progress: 0, 
          finished: false, 
          timeElapsed: 0, 
          isReady: false, 
          placement: 0 
        }],
        grids: {
          [hostId]: JSON.parse(JSON.stringify(puzzle))
        },
        status: 'waiting',
        createdAt: new Date().toISOString(),
    };
    db.data.rooms.push(newRoom);
    await db.write();
    res.status(201).json(newRoom);
});

app.post('/api/rooms/join', authenticateToken, async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    await db.read();
    const room = db.data.rooms.find(r => r.code === code && r.status === 'waiting');
    if (!room) return res.status(404).json({ message: 'Room not found or has already started.' });

    if (room.players.length >= room.maxPlayers) {
        return res.status(400).json({ message: 'Room is full.' });
    }

    if (!room.players.some(p => p.userId === userId)) {
        const user = db.data.users.find(u => u.id === userId);
        room.players.push({ 
          userId, 
          username: user.username, 
          profilePicture: user.profilePicture,
          profileColor: user.profileColor,
          progress: 0, 
          finished: false, 
          timeElapsed: 0, 
          isReady: false, 
          placement: 0 
        });
        room.grids[userId] = JSON.parse(JSON.stringify(room.puzzle));
        await db.write();
        io.to(room.id).emit('room:update', room);
    }
    res.json(room);
});


app.get('/api/rooms/:roomId', async (req, res) => {
    await db.read();
    const room = db.data.rooms.find(r => r.id === req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
});

app.post('/api/rooms/:roomId/leave', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    await db.read();
    const roomIndex = db.data.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return res.sendStatus(404);

    const room = db.data.rooms[roomIndex];
    const wasActive = room.status === 'active';
    room.players = room.players.filter(p => p.userId !== userId);

    if (room.players.length === 0) {
        db.data.rooms.splice(roomIndex, 1);
    } else {
        // If a player leaves an active game and only one remains, declare them the winner.
        if (wasActive && room.players.length === 1) {
            const winner = room.players[0];
            winner.finished = true;
            winner.placement = 1;
            room.status = 'finished';

            const difficulty = room.difficulty || 'Medium';
            const xpRewards = { 'Easy': 250, 'Medium': 500, 'Hard': 750, 'Expert': 1000 };
            const baseXP = xpRewards[difficulty] || 500;
            const user = db.data.users.find(u => u.id === winner.userId);
            if (user) {
              user.xp += baseXP;
              user.level = Math.floor(user.xp / 1000) + 1;
            }
        }
        // If host leaves, assign a new host
        else if (room.hostId === userId) {
            room.hostId = room.players[0].userId;
        }
        io.to(roomId).emit('room:update', room);
    }
    
    await db.write();
    res.status(200).json({});
});

app.post('/api/rooms/:roomId/kick', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    const { kickedPlayerId } = req.body;
    const hostId = req.user.id;

    await db.read();
    const roomIndex = db.data.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return res.status(404).json({ message: 'Room not found.' });

    const room = db.data.rooms[roomIndex];

    // Only the host can kick players
    if (room.hostId !== hostId) {
        return res.status(403).json({ message: 'Only the host can kick players.' });
    }

    // Host cannot kick themselves
    if (kickedPlayerId === hostId) {
        return res.status(400).json({ message: 'Host cannot kick themselves.' });
    }

    const playerIndex = room.players.findIndex(p => p.userId === kickedPlayerId);
    if (playerIndex === -1) {
        return res.status(404).json({ message: 'Player not found in this room.' });
    }

    // Remove player from the room
    room.players.splice(playerIndex, 1);
    delete room.grids[kickedPlayerId];

    // If the room becomes empty, remove it
    if (room.players.length === 0) {
        db.data.rooms.splice(roomIndex, 1);
    } else {
        // If the kicked player was the host (should be prevented by above check, but as a safeguard)
        // This logic is mostly for 'leave' but good to have for robustness
        if (room.hostId === kickedPlayerId) {
            room.hostId = room.players[0].userId; // Assign new host
        }
        io.to(roomId).emit('room:update', room); // Notify remaining players
    }

    await db.write();

    // Notify the kicked player if they are still connected
    const kickedPlayerSocketId = userSocketMap.get(kickedPlayerId);
    if (kickedPlayerSocketId) {
        io.to(kickedPlayerSocketId).emit('room:you_were_kicked', { roomId });
    }

    res.status(200).json({ message: 'Player kicked successfully.' });
});

app.post('/api/rooms/:roomId/ready', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    const { userId, isReady } = req.body;

    if (req.user.id !== userId) return res.sendStatus(403);

    await db.read();
    const room = db.data.rooms.find(r => r.id === roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const player = room.players.find(p => p.userId === userId);
    if (player) {
        player.isReady = isReady;
    }

    await db.write();
    io.to(roomId).emit('room:update', room);
    res.status(200).json({});
});

app.post('/api/rooms/:roomId/start', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    await db.read();
    const room = db.data.rooms.find(r => r.id === roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.hostId !== userId) return res.status(403).json({ message: 'Only the host can start the game.' });

    room.status = 'active';
    room.startedAt = new Date().toISOString();
        await db.write();
        io.to(roomId).emit('room:update', room);
        io.to(roomId).emit('game:start', room);
        res.status(200).json({});
});

app.post('/api/rooms/:roomId/progress', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    const { userId, progress, timeElapsed, finished } = req.body;
    if (req.user.id !== userId) return res.sendStatus(403);

    await db.read();
    const room = db.data.rooms.find(r => r.id === roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const player = room.players.find(p => p.userId === userId);
    if (player) {
        player.progress = progress;
        player.timeElapsed = timeElapsed;
        if (finished) {
            player.finished = true;
        }
    }

    // Check if all players are finished
    const allFinished = room.players.every(p => p.finished);
    if (allFinished) {
        room.status = 'finished';
    }

    await db.write();
    io.to(roomId).emit('room:update', room);
    res.status(200).json({});
});

app.delete('/api/rooms/:roomId', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    await db.read();
    const roomIndex = db.data.rooms.findIndex(r => r.id === roomId);
    if (roomIndex > -1) {
        if (db.data.rooms[roomIndex].hostId !== req.user.id) return res.sendStatus(403);
        db.data.rooms.splice(roomIndex, 1);
        await db.write();
    }
    res.status(200).json({});
});

app.get('/api/notifications/:userId', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) return res.sendStatus(403);
    await db.read();
    const userNotifications = db.data.notifications.filter(n => n.userId === req.params.userId);
    res.json(userNotifications);
});

app.post('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
    const { notificationId } = req.params;
    await db.read();
    const notification = db.data.notifications.find(n => n.id === notificationId);
    if (!notification || notification.userId !== req.user.id) return res.sendStatus(403);
    notification.read = true;
    await db.write();
    res.status(200).json({});
});

app.post('/api/notifications/:userId/read-all', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) return res.sendStatus(403);
    await db.read();
    db.data.notifications.forEach(n => {
        if (n.userId === req.params.userId) {
            n.read = true;
        }
    });
    await db.write();
    res.status(200).json({});
});


// =================================
// SOCKET.IO (for real-time)
// =================================
const calculatePlacements = (room) => {
  const finishedPlayers = room.players.filter(p => p.finished);
  finishedPlayers.sort((a, b) => a.timeFinished - b.timeFinished);
  finishedPlayers.forEach((player, index) => {
    player.placement = index + 1;
  });
};

const rematchMap = new Map(); // Maps old room ID to new room ID
const userSocketMap = new Map(); // Maps userId to socket.id

const isGridCorrect = (playerGrid, solution) => {



  for (let i = 0; i < playerGrid.length; i++) {



    for (let j = 0; j < playerGrid[i].length; j++) {



      if (Number(playerGrid[i][j]) !== solution[i][j]) {



        return false;



      }



    }



  }



  return true;



};









io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('user:connected', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Client sends its move, server just stores it
  socket.on('game:move', async ({ roomId, userId, row, col, value }) => {
    const room = db.data.rooms.find(r => r.id === roomId);
    if (!room) return;
    if (room.grids && room.grids[userId] && room.grids[userId][row]) {
      room.grids[userId][row][col] = value;
    }
  });

  // Client reports its own progress, server broadcasts it
  socket.on('game:progress_update', async ({ roomId, userId, progress }) => {
    const room = db.data.rooms.find(r => r.id === roomId);
    if (!room) return;
    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.progress = progress;
      await db.write(); // Persist the progress change
      io.to(roomId).emit('game:progress', { players: room.players });
    }
  });

  // Client asks server to validate its board when it thinks it has won
  socket.on('game:validate_win', async ({ roomId, userId, time }) => {
    const room = db.data.rooms.find(r => r.id === roomId);
    if (!room) return;

    const player = room.players.find(p => p.userId === userId);
    const playerGrid = room.grids[userId];

    if (player && !player.finished && isGridCorrect(playerGrid, room.solution)) {
      player.finished = true;
      player.timeFinished = time;

      // Check if all players are now finished
      const allPlayersFinished = room.players.every(p => p.finished);
      if (allPlayersFinished) {
        room.status = 'finished';
        calculatePlacements(room); // Recalculate final ranks
      }
      
      await db.write();
      io.to(roomId).emit('room:update', room); // Send full update after a finish/game end
    }
  });

  socket.on('room:play_again', async ({ oldRoomId, user }) => {
    await db.read();
    let newRoomId = rematchMap.get(oldRoomId);

    if (newRoomId) {
      const newRoom = db.data.rooms.find(r => r.id === newRoomId);
      if (newRoom && !newRoom.players.some(p => p.id === user.id)) {
        newRoom.players.push({ 
          userId: user.id, 
          username: user.username, 
          profilePicture: user.profilePicture,
          profileColor: user.profileColor,
          progress: 0, finished: false, timeElapsed: 0, placement: 0, isReady: false,
        });
        newRoom.grids[user.id] = JSON.parse(JSON.stringify(newRoom.initialPuzzle));
        io.to(newRoomId).emit('room:update', newRoom);
        await db.write();
      }
    } else {
      const oldRoom = db.data.rooms.find(r => r.id === oldRoomId);
      if (!oldRoom) return;

      const newRoom = {
        id: `room_${generateId()}`,
        code: generateRoomCode(),
        hostId: user.id,
        difficulty: oldRoom.difficulty,
        puzzle: oldRoom.puzzle,
        initialPuzzle: oldRoom.initialPuzzle,
        solution: oldRoom.solution,
        maxPlayers: oldRoom.maxPlayers,
                players: [{ 
                  userId: user.id, 
                  username: user.username, 
                  profilePicture: user.profilePicture,
                  profileColor: user.profileColor,
                  progress: 0, finished: false, timeElapsed: 0, placement: 0, isReady: false,
                }],        grids: {},
        status: 'waiting',
        createdAt: new Date().toISOString(),
      };
      newRoom.grids[user.id] = JSON.parse(JSON.stringify(newRoom.initialPuzzle));
      
      db.data.rooms.push(newRoom);
      rematchMap.set(oldRoomId, newRoom.id);
      newRoomId = newRoom.id;
      await db.write();
    }

    socket.emit('rematch:created', { newRoomId });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    // Remove user from userSocketMap on disconnect
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});


// =================================
// SERVER START
// =================================
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});