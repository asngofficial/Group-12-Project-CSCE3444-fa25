# Group-12-Project-CSCE3444-fa25 Backend API

Express.js backend server for the Group-12-Project-CSCE3444-fa25 multiplayer Sudoku game.

## Features

- ✅ User authentication (register/login)
- ✅ User profiles and XP tracking
- ✅ Friend system with requests
- ✅ Real-time multiplayer rooms
- ✅ Leaderboards
- ✅ Notifications system
- ✅ In-memory data storage (upgradable to database)

## Quick Start

### Local Development

```bash
cd server
npm install
npm run dev
```

Server will run on `http://localhost:3000`

### Production

```bash
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `PORT`: Server port (default: 3000)
- `ALLOWED_ORIGINS`: CORS allowed origins (optional)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `GET /api/users/leaderboard` - Get leaderboard

### Friends
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept friend request
- `POST /api/friends/reject/:id` - Reject friend request
- `GET /api/friends/:userId` - Get user's friends
- `GET /api/friends/requests/:userId` - Get friend requests
- `DELETE /api/friends/:userId/:friendId` - Remove friend

### Rooms (Multiplayer)
- `POST /api/rooms/create` - Create new room
- `POST /api/rooms/join` - Join room by code
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/start` - Start game
- `POST /api/rooms/:id/progress` - Update player progress
- `POST /api/rooms/:id/leave` - Leave room
- `DELETE /api/rooms/:id` - Delete room

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/:userId/read-all` - Mark all as read

## Deploy to Render.com

### Option 1: Connect GitHub Repository

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: Group-12-Project-CSCE3444-fa25-api
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add environment variables (optional):
   - `PORT` is automatically set by Render
   - Add others from `.env.example` as needed

6. Click "Create Web Service"

### Option 2: Manual Deploy

1. Install Render CLI:
```bash
npm install -g render-cli
```

2. Login and deploy:
```bash
render login
render deploy
```

## Upgrading to Database

The server currently uses in-memory storage (data is lost on restart). To upgrade:

### PostgreSQL (Recommended)

1. Install PostgreSQL client:
```bash
npm install pg
```

2. Update `index.js` to use PostgreSQL instead of Maps
3. Set `DATABASE_URL` in environment variables

### MongoDB

1. Install MongoDB client:
```bash
npm install mongodb
```

2. Update `index.js` to use MongoDB
3. Set `MONGODB_URI` in environment variables

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get leaderboard
curl http://localhost:3000/api/users/leaderboard?limit=10
```

## Security Notes

⚠️ **Production Considerations**:
- Current implementation stores passwords with bcrypt (secure)
- Consider adding JWT tokens for session management
- Add rate limiting to prevent abuse
- Use environment variables for sensitive data
- Consider using a real database instead of in-memory storage

## CORS Configuration

By default, CORS allows all origins. To restrict:

1. Set `ALLOWED_ORIGINS` in `.env`
2. Update CORS middleware in `index.js`

## Monitoring

Check server status:
- Health: `GET /health`
- Root: `GET /` (shows all endpoints)

## Support

For issues or questions, check the main repository README.
