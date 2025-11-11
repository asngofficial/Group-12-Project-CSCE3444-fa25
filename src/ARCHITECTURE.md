# 🏗️ Group-12-Project-CSCE3444-fa25 Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Frontend App                     │    │
│  │                                                      │    │
│  │  • Login/Register UI                                │    │
│  │  • Game Board (Sudoku)                              │    │
│  │  • Leaderboards                                     │    │
│  │  • Friends Management                               │    │
│  │  • Multiplayer Rooms                                │    │
│  │                                                      │    │
│  │  Hosted on: GitHub Pages (Static)                   │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ HTTPS                             │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ API Calls
                           │ (REST JSON)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│                   (Express.js on Node.js)                    │
│                                                              │
│  Routes:                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │     Auth       │  │     Users      │  │   Friends    │ │
│  │  /register     │  │  /users        │  │  /request    │ │
│  │  /login        │  │  /leaderboard  │  │  /accept     │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │     Rooms      │  │ Notifications  │                    │
│  │  /create       │  │  /get          │                    │
│  │  /join         │  │  /read         │                    │
│  │  /start        │  │                │                    │
│  └────────────────┘  └────────────────┘                    │
│                                                              │
│  Hosted on: Render.com (Node.js)                            │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Storage                            │
│                                                              │
│  Current: In-Memory Maps                                     │
│  • users Map                                                 │
│  • rooms Map                                                 │
│  • friendships Map                                           │
│  • notifications Map                                         │
│                                                              │
│  Production: PostgreSQL or MongoDB                           │
│  • users table                                               │
│  • rooms table                                               │
│  • friendships table                                         │
│  • notifications table                                       │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Layer

```
React 18
  ├── TypeScript (Type Safety)
  ├── Vite (Build Tool)
  ├── Tailwind CSS 4 (Styling)
  ├── shadcn/ui (Component Library)
  └── Lucide Icons (Icons)

Hosted: GitHub Pages
  ├── Static File Hosting
  ├── Automatic HTTPS
  ├── CDN Distribution
  └── Free Forever
```

### Backend Layer

```
Node.js 20
  ├── Express.js (Web Framework)
  ├── bcrypt (Password Hashing)
  ├── uuid (ID Generation)
  ├── cors (Cross-Origin)
  └── dotenv (Environment)

Hosted: Render.com
  ├── Auto-Deploy from Git
  ├── Automatic HTTPS
  ├── Free Tier Available
  └── Easy Scaling
```

### Storage Layer

```
Current: In-Memory
  ├── Map<userId, User>
  ├── Map<roomId, Room>
  ├── Map<userId, Set<friendId>>
  └── Map<userId, Notification[]>

Future: Database
  ├── PostgreSQL (Recommended)
  └── MongoDB (Alternative)
```

## Data Models

### User
```typescript
{
  id: string;              // UUID
  username: string;        // Unique
  email?: string;
  password: string;        // Bcrypt hashed
  xp: number;             // Experience points
  level: number;          // Calculated from XP
  solvedPuzzles: number;
  averageTime: string;
  profileColor: string;   // Hex color
  profilePicture?: string;
  boardStyle: string;
  createdAt: string;      // ISO timestamp
}
```

### Room (Multiplayer)
```typescript
{
  id: string;             // UUID
  code: string;           // 6-char code (e.g., "ABC123")
  hostId: string;         // Creator's user ID
  difficulty: string;     // "Easy" | "Medium" | "Hard" | "Expert"
  puzzle: number[][];     // 9x9 grid with nulls
  solution: number[][];   // Complete solution
  maxPlayers: number;     // Default 50
  players: RoomPlayer[];
  status: string;         // "waiting" | "active" | "finished"
  createdAt: string;
  startedAt?: string;
}
```

### FriendRequest
```typescript
{
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUsername: string;
  toUsername: string;
  status: string;         // "pending" | "accepted" | "rejected"
  createdAt: string;
}
```

### Notification
```typescript
{
  id: string;
  userId: string;
  type: string;           // "friend_request" | "challenge" | "game_invite"
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;     // Reference to request/room
}
```

## API Flow Examples

### 1. User Registration

```
Browser                Frontend              Backend              Storage
   │                      │                     │                    │
   │  [Register Form]     │                     │                    │
   │──────────────────────>                     │                    │
   │                      │                     │                    │
   │                      │  POST /api/auth/    │                    │
   │                      │      register       │                    │
   │                      │────────────────────>│                    │
   │                      │                     │                    │
   │                      │  {username,pwd}     │  Hash password     │
   │                      │                     │  Generate UUID     │
   │                      │                     │  Create user       │
   │                      │                     │                    │
   │                      │                     │  Save to Map       │
   │                      │                     │───────────────────>│
   │                      │                     │                    │
   │                      │  User object        │                    │
   │                      │<────────────────────│                    │
   │                      │                     │                    │
   │  [Welcome!]          │                     │                    │
   │<─────────────────────│                     │                    │
```

### 2. Multiplayer Game Flow

```
User A               Frontend A          Backend            Frontend B          User B
  │                     │                   │                   │                 │
  │ [Create Room]       │                   │                   │                 │
  │────────────────────>│                   │                   │                 │
  │                     │                   │                   │                 │
  │                     │ POST /rooms/create│                   │                 │
  │                     │──────────────────>│                   │                 │
  │                     │                   │                   │                 │
  │                     │  Room + Code      │                   │                 │
  │  [Share: ABC123]    │<──────────────────│                   │                 │
  │<────────────────────│                   │                   │                 │
  │                     │                   │                   │                 │
  │                                         │                   │  [Join ABC123]  │
  │                                         │                   │<────────────────│
  │                                         │                   │                 │
  │                                         │ POST /rooms/join  │                 │
  │                                         │<──────────────────│                 │
  │                                         │                   │                 │
  │                     │  [User B Joined!] │  Updated Room     │                 │
  │                     │<──────────────────│──────────────────>│                 │
  │                     │                   │                   │                 │
  │ [Start Game]        │                   │                   │                 │
  │────────────────────>│                   │                   │                 │
  │                     │ POST /rooms/start │                   │                 │
  │                     │──────────────────>│                   │                 │
  │                     │                   │                   │                 │
  │                     │  [Game Started!]  │  [Game Started!]  │                 │
  │                     │<──────────────────│──────────────────>│                 │
  │                     │                   │                   │                 │
  │ [Solve puzzle...]   │                   │                   │ [Solve puzzle] │
  │                     │                   │                   │                 │
  │                     │ POST /rooms/      │                   │                 │
  │                     │      progress     │                   │                 │
  │                     │──────────────────>│                   │                 │
  │                     │                   │ POST /rooms/      │                 │
  │                     │                   │<──────progress────│                 │
  │                     │                   │                   │                 │
  │                     │  [Both Progress]  │  [Both Progress]  │                 │
  │                     │<──────────────────│──────────────────>│                 │
```

### 3. Friend Request Flow

```
User A            Frontend A         Backend         Frontend B         User B
  │                  │                  │                 │                │
  │ [Add Friend:     │                  │                 │                │
  │  "User B"]       │                  │                 │                │
  │─────────────────>│                  │                 │                │
  │                  │                  │                 │                │
  │                  │ POST /friends/   │                 │                │
  │                  │      request     │                 │                │
  │                  │─────────────────>│                 │                │
  │                  │                  │                 │                │
  │                  │                  │ Create Request  │                │
  │                  │                  │ Create Notif    │                │
  │                  │                  │                 │                │
  │                  │  Request Created │                 │                │
  │  [Request Sent]  │<─────────────────│                 │                │
  │<─────────────────│                  │                 │                │
  │                  │                  │                 │                │
  │                                     │                 │  [Check Notif] │
  │                                     │                 │<───────────────│
  │                                     │                 │                │
  │                                     │ GET /notif/     │                │
  │                                     │<────userId──────│                │
  │                                     │                 │                │
  │                                     │ Notifications   │                │
  │                                     │────────────────>│                │
  │                                     │                 │                │
  │                                     │                 │ [Accept]       │
  │                                     │                 │────────────────>
  │                                     │                 │                │
  │                                     │ POST /friends/  │                │
  │                                     │<────accept/:id──│                │
  │                                     │                 │                │
  │                                     │ Add friendship  │                │
  │                                     │ Create notif    │                │
  │                                     │                 │                │
  │  [New Friend!]                      │  Accepted       │                │
  │<────────────────────────────────────│────────────────>│                │
```

## Request/Response Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "password": "secret123",
  "email": "player1@example.com"
}

Response 201:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "player1",
  "email": "player1@example.com",
  "xp": 0,
  "level": 1,
  "solvedPuzzles": 0,
  "averageTime": "0:00",
  "profileColor": "#3b82f6",
  "boardStyle": "default",
  "createdAt": "2024-11-08T12:00:00.000Z"
}
```

### Create Room
```bash
POST /api/rooms/create
Content-Type: application/json

{
  "hostId": "123e4567-...",
  "difficulty": "Medium",
  "puzzle": [[null, 2, 3, ...], ...],
  "solution": [[1, 2, 3, ...], ...],
  "maxPlayers": 50
}

Response 201:
{
  "id": "room-uuid",
  "code": "ABC123",
  "hostId": "123e4567-...",
  "difficulty": "Medium",
  "puzzle": [...],
  "maxPlayers": 50,
  "players": [{
    "userId": "123e4567-...",
    "username": "player1",
    "progress": 0,
    "finished": false,
    "timeElapsed": 0
  }],
  "status": "waiting",
  "createdAt": "2024-11-08T12:00:00.000Z"
}
```

## Security Architecture

### Password Security
```
User Password: "mypassword123"
        ↓
    bcrypt.hash() with 10 rounds
        ↓
Stored Hash: "$2b$10$abcdef..."
        ↓
Never stored or transmitted in plain text
```

### CORS Protection
```
Frontend: https://username.github.io
        ↓
    Request with Origin header
        ↓
Backend: Check ALLOWED_ORIGINS
        ↓
    If allowed: Set CORS headers
    If blocked: 403 Forbidden
```

### HTTPS Encryption
```
Browser ←→ GitHub Pages: HTTPS (automatic)
Browser ←→ Render API:    HTTPS (automatic)

All data encrypted in transit
```

## Deployment Pipeline

### Frontend (GitHub Actions)
```
1. Developer pushes code to GitHub
        ↓
2. GitHub Actions triggers
        ↓
3. Run: npm install
        ↓
4. Run: npm run build
        ↓
5. Output: /dist folder
        ↓
6. Deploy to GitHub Pages
        ↓
7. Live at: username.github.io/repo
```

### Backend (Render.com)
```
1. Developer pushes code to GitHub
        ↓
2. Render detects change (webhook)
        ↓
3. Pull latest code
        ↓
4. Run: npm install (in /server)
        ↓
5. Run: npm start
        ↓
6. Health check: GET /health
        ↓
7. Live at: app-name.onrender.com
```

## Performance Characteristics

### Frontend
- **First Load**: 1-2 seconds (static files from CDN)
- **Navigation**: Instant (SPA routing)
- **Game Response**: <50ms (local state)

### Backend
- **Cold Start**: 30-60 seconds (free tier only)
- **Warm Request**: 50-200ms (in-memory data)
- **With Database**: 100-500ms (depending on query)

### Scalability
- **Frontend**: Unlimited (static CDN)
- **Backend**: Limited by server resources
  - Free tier: 512 MB RAM, 0.1 CPU
  - Paid tier: More resources available
- **Database**: Limited by plan
  - In-memory: Limited by server RAM
  - PostgreSQL: Scales with plan

## Monitoring Points

```
┌─────────────────────────────────────────┐
│          What to Monitor                │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (GitHub Pages):               │
│  • Build success/failure                │
│  • Deploy time                          │
│  • Browser console errors               │
│                                         │
│  Backend (Render):                      │
│  • Server uptime                        │
│  • Response times                       │
│  • Error rates                          │
│  • Memory usage                         │
│  • CPU usage                            │
│  • Active connections                   │
│                                         │
│  Application:                           │
│  • Active users                         │
│  • Active rooms                         │
│  • API call frequency                   │
│  • Error logs                           │
│                                         │
└─────────────────────────────────────────┘
```

## Upgrade Path

### Current Setup (Free)
```
Frontend: GitHub Pages (Static)
Backend:  Render Free (In-Memory)
Storage:  RAM (volatile)
Cost:     $0/month
```

### Starter Setup ($14/month)
```
Frontend: GitHub Pages (Static)
Backend:  Render Starter (Always-On)
Storage:  PostgreSQL on Render
Cost:     $14/month
Benefits: No cold starts, persistent data
```

### Production Setup ($50+/month)
```
Frontend: Vercel/Netlify (Pro)
Backend:  Render Pro (Autoscale)
Storage:  PostgreSQL (HA)
Extras:   Redis cache, CDN, Monitoring
Cost:     $50-200/month
Benefits: High availability, fast, scalable
```

---

## Summary

Group-12-Project-CSCE3444-fa25 uses a modern, scalable architecture:

- **Frontend**: React SPA on GitHub Pages
- **Backend**: Express API on Render
- **Storage**: In-memory (upgradable)
- **Security**: Bcrypt, CORS, HTTPS
- **Deployment**: Automated CI/CD

Perfect for learning, prototyping, and small-scale production use!
