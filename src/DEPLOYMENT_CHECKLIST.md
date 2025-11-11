# 🚀 Deployment Checklist

## Pre-Deployment

### Frontend
- [ ] All files in proper `/src/` directory structure
- [ ] No TypeScript errors
- [ ] GitHub Actions workflow in `.github/workflows/deploy.yml`
- [ ] Vite config set to `base: './'` for GitHub Pages
- [ ] `.env` file configured (or will use hardcoded API URL)

### Backend
- [ ] Server code in `/server/` directory
- [ ] `server/package.json` exists with correct dependencies
- [ ] `server/index.js` has all API endpoints
- [ ] `server/.env` configured for production (or use Render defaults)

## Deploy Backend First (Render.com)

**⚠️ Deploy backend BEFORE frontend so you have the API URL!**

1. **Create Render Account**
   - Go to [render.com](https://render.com) and sign up
   - Connect your GitHub account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Configure:
     - **Name**: `Group-12-Project-CSCE3444-fa25-api` (or your choice)
     - **Root Directory**: `server`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Environment Variables** (optional):
   - Render sets `PORT` automatically
   - Add `ALLOWED_ORIGINS` if you want to restrict CORS
   - Example: `https://YOUR_USERNAME.github.io`

4. **Deploy Backend**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - **Save your API URL**: `https://Group-12-Project-CSCE3444-fa25-api.onrender.com`

5. **Test Backend**
   ```bash
   curl https://YOUR_API_URL.onrender.com/health
   ```

## Deploy Frontend (GitHub Pages)

1. **Update API URL in Frontend**
   - Edit `/src/lib/apiClient.ts`
   - Change line 1:
     ```typescript
     const API_BASE_URL = 'https://YOUR_API_URL.onrender.com';
     ```
   - Replace with your actual Render API URL

2. **Create GitHub Repository**
   - Create a new GitHub repository named `Group-12-Project-CSCE3444-fa25`
   - Initialize with or without README

3. **Push Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Group-12-Project-CSCE3444-fa25 Multiplayer Game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Group-12-Project-CSCE3444-fa25.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Select "GitHub Actions"
   - The workflow will automatically deploy on every push to `main`

5. **Wait for Deployment**
   - Check the "Actions" tab in your repository
   - Wait for the deployment workflow to complete (2-3 minutes)
   - Your app will be live at: `https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/`

6. **Update CORS on Backend** (if needed)
   - Go back to Render.com
   - Add environment variable:
     - Key: `ALLOWED_ORIGINS`
     - Value: `https://YOUR_USERNAME.github.io`
   - Backend will auto-redeploy

## Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Login with existing account
- [ ] Register new account
- [ ] Use "Quick Demo (Skip Login)" bypass button
- [ ] Dark mode toggle works on login screen

### Single Player
- [ ] Start a game (Easy, Medium, Hard, Expert)
- [ ] Complete a puzzle and earn XP
- [ ] Check XP and level progression
- [ ] Try board customization themes

### Multiplayer
- [ ] Create a multiplayer room
- [ ] Copy room code
- [ ] Join room with another device/browser
- [ ] Complete a multiplayer match

### Social Features
- [ ] View global leaderboard
- [ ] Send friend request
- [ ] Accept/decline friend requests
- [ ] View friend-only leaderboard
- [ ] Challenge a friend

### Bot Features
- [ ] Start bot challenge
- [ ] Complete bot game
- [ ] Try daily puzzle
- [ ] Check bot leaderboard rankings

### Settings & Profile
- [ ] Edit profile (username, color, avatar)
- [ ] Change board theme
- [ ] Toggle dark mode
- [ ] Read FAQ page

## Known Limitations

⚠️ **Demo Mode**: When using "Quick Demo" bypass, these features are limited:
- Friend requests (API required)
- Multiplayer rooms (API required)
- Leaderboard syncing (local only)

⚠️ **API Fallback**: If API at https://Group-12-Project-CSCE3444-fa25.onrender.com/ is unreachable:
- App automatically uses localStorage
- All single-player features work normally
- Multiplayer and social features will show error messages

## Local Development Setup

For testing locally before deployment:

### Quick Setup (Automated)

**Linux/Mac**:
```bash
chmod +x dev-setup.sh
./dev-setup.sh
```

**Windows**:
```bash
dev-setup.bat
```

### Manual Setup

1. **Install Dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   cd ..
   ```

2. **Configure Environment**:
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   ```

3. **Start Both Servers**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Open Browser**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## Environment Variables

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:3000  # for local dev
# or
VITE_API_URL=https://your-api.onrender.com  # for production
```

### Backend (`server/.env`)
```bash
PORT=3000  # Default port
ALLOWED_ORIGINS=http://localhost:5173,https://yourusername.github.io
```

## Performance Tips

- First load may be slow if API server is cold (Render.com free tier)
- Subsequent loads are fast due to local caching
- Desktop UI automatically loads for desktop devices
- Mobile UI optimized for smaller screens

## Support

If issues occur:
1. Check browser console for errors
2. Verify GitHub Pages is enabled in repo settings
3. Ensure workflow completed successfully in Actions tab
4. Test with "Quick Demo" button to bypass API issues

---

**Ready to deploy!** Follow the steps above and your Sudoku multiplayer game will be live! 🎮
