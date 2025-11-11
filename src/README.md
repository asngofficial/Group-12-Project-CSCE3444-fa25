# Group-12-Project-CSCE3444-fa25 - Multiplayer Sudoku Game

A competitive multiplayer Sudoku game with XP earning, friend challenges, and community features. Built with React, TypeScript, Tailwind CSS, and Express.js backend.

## 🎮 Features

### Core Gameplay
- **Multiple Difficulty Levels**: Easy (+50 XP), Medium (+100 XP), Hard (+200 XP), Expert (+500 XP)
- **XP & Leveling System**: Earn XP by completing puzzles and level up
- **Board Customization**: 8 beautiful themes (Ocean Blue, Forest Green, Royal Purple, etc.)
- **Daily Puzzles**: Special daily challenges for bonus XP

### Multiplayer Features
- **Real-time Multiplayer**: Compete with up to 50 players in the same room
- **Room Codes**: Easy 6-character codes to share and join games
- **Live Progress Tracking**: See other players' progress in real-time
- **Bot Challenges**: Practice against AI opponents

### Social Features
- **Friends System**: Add friends and compete on friend-only leaderboards
- **Friend Requests**: Send, accept, and manage friend requests
- **Global & Friend Leaderboards**: Track your ranking
- **Notifications**: Stay updated on friend requests and challenges

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first with desktop optimization
- **Quick Demo Mode**: Test without creating an account
- **Profile Customization**: Avatar colors, usernames, and board themes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure API endpoint** (optional for local development):
```bash
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:3000
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open browser**:
Navigate to `http://localhost:5173`

### Backend Setup

1. **Navigate to server directory**:
```bash
cd server
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment** (optional):
```bash
cp .env.example .env
```

4. **Start server**:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

## 📦 Project Structure

```
/
├── src/                      # Frontend React app
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities and API client
│   ├── styles/              # Global styles
│   └── utils/               # Helper functions
├── server/                   # Backend Express API
│   ├── index.js            # Main server file
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
├── .github/workflows/       # GitHub Actions CI/CD
└── dist/                    # Production build output
```

## 🌐 Deployment

### Deploy Frontend (GitHub Pages)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Group-12-Project-CSCE3444-fa25.git
git push -u origin main
```

2. **Enable GitHub Pages**:
- Go to repository Settings → Pages
- Source: Select "GitHub Actions"
- Automatic deployment on every push to `main`

3. **Your app will be live at**:
`https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/`

### Deploy Backend (Render.com)

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Create new Web Service**:
- Connect your GitHub repository
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free tier available

3. **Environment Variables**:
- `PORT` is set automatically by Render
- Add any custom variables from `server/.env.example`

4. **Deploy**:
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- Note your API URL: `https://your-app.onrender.com`

5. **Update Frontend API URL**:
- Update `/src/lib/apiClient.ts`:
  ```typescript
  const API_BASE_URL = 'https://your-app.onrender.com';
  ```
- Rebuild and redeploy frontend

## 🎯 How to Use

### Creating an Account
1. Click "Create Account" on login screen
2. Choose a username and password
3. Start playing!

### Quick Demo Mode
- Click "Quick Demo (Skip Login)" button
- Instant access with guest account
- Limited multiplayer features

### Starting a Game
1. Navigate to "Play" page
2. Select difficulty level
3. Click "Start" to begin
4. Complete the puzzle to earn XP

### Multiplayer Game
1. Go to "Play" → "Multiplayer"
2. Click "Create Room"
3. Share the 6-character room code
4. Friends join using the code
5. Click "Start Game" when ready

### Adding Friends
1. Go to "Friends" page
2. Enter friend's username
3. Send friend request
4. Friend accepts request
5. Now you can challenge each other!

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **bcrypt** - Password hashing
- **uuid** - Unique ID generation
- **cors** - Cross-origin support

### Storage
- **In-memory** (current) - Fast, easy development
- **Upgradable** to PostgreSQL or MongoDB

## 🔧 Configuration

### Frontend Environment Variables
```bash
# .env
VITE_API_URL=http://localhost:3000  # or your production URL
```

### Backend Environment Variables
```bash
# server/.env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,https://yourusername.github.io
```

## 📱 Features by Device

### Mobile
- Optimized touch controls
- Bottom navigation bar
- Compact UI layouts
- Swipe gestures

### Desktop
- Sidebar navigation
- Larger grid display
- Keyboard shortcuts
- Multi-column layouts

## 🔒 Security Notes

- Passwords are hashed with bcrypt
- CORS configured for specific origins
- Environment variables for sensitive data
- No PII storage recommended for demo apps

⚠️ **Production Considerations**:
- Add JWT authentication for sessions
- Implement rate limiting
- Use real database (PostgreSQL/MongoDB)
- Add input validation and sanitization
- Enable HTTPS only

## 🧪 Testing

### Frontend
```bash
npm run dev     # Start dev server
npm run build   # Test production build
npm run preview # Preview production build
```

### Backend
```bash
cd server
npm run dev     # Start with auto-reload

# Test endpoints with curl
curl http://localhost:3000/health
curl http://localhost:3000/api/users/leaderboard
```

## 📊 API Documentation

See `/server/README.md` for complete API documentation including:
- Authentication endpoints
- User management
- Friends system
- Multiplayer rooms
- Notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🎮 Play Now!

**Live Demo**: [Coming soon after deployment]

**Local Development**: 
```bash
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend
npm install && npm run dev
```

Open `http://localhost:5173` and start playing! 🎉

## 💡 Tips

- Use "Quick Demo" button for instant testing
- App works offline with localStorage fallback
- Harder puzzles give more XP
- Challenge friends for bonus rewards
- Check daily puzzles for special bonuses

## 🐛 Known Issues

- Demo mode has limited multiplayer features
- In-memory storage resets on server restart
- Consider upgrading to database for production

## 📞 Support

For issues or questions:
1. Check `/server/README.md` for backend issues
2. Review `/DEPLOYMENT_CHECKLIST.md` for deployment help
3. Open an issue on GitHub

---

**Built with ❤️ by the Group-12-Project-CSCE3444-fa25 team**
