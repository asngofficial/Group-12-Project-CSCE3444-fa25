# 🚀 Quick Reference Card

## Local Development

### Start Everything
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
npm run dev
```

Open: `http://localhost:5173`

### Automated Setup
```bash
# Linux/Mac
./dev-setup.sh

# Windows
dev-setup.bat
```

## Project Structure

```
/                         Root
├── src/                 Frontend React app
├── server/              Backend Express API
├── .github/workflows/   CI/CD automation
└── dist/                Build output
```

## Key Files

| File | Purpose |
|------|---------|
| `/src/App.tsx` | Main React component |
| `/src/lib/apiClient.ts` | API client & endpoints |
| `/server/index.js` | Backend server |
| `/.github/workflows/deploy.yml` | Auto-deploy config |
| `/vite.config.ts` | Vite build config |

## Environment Variables

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:3000
```

### Backend (`server/.env`)
```bash
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

## Deployment URLs

**After deployment:**

- **Frontend**: `https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/`
- **Backend**: `https://Group-12-Project-CSCE3444-fa25-api.onrender.com`

## Common Commands

```bash
# Install dependencies
npm install
cd server && npm install

# Development
npm run dev              # Frontend dev server
cd server && npm run dev # Backend dev server

# Build
npm run build           # Build frontend
npm run preview         # Preview build

# Deploy
git push origin main    # Auto-deploys both
```

## API Endpoints

Base URL: `http://localhost:3000` or `https://YOUR_API.onrender.com`

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Users
- `GET /api/users` - All users
- `GET /api/users/:id` - Single user
- `PUT /api/users/:id` - Update user
- `GET /api/users/leaderboard` - Leaderboard

### Friends
- `POST /api/friends/request` - Send request
- `POST /api/friends/accept/:id` - Accept request
- `GET /api/friends/:userId` - Get friends
- `GET /api/friends/requests/:userId` - Get requests

### Rooms
- `POST /api/rooms/create` - Create room
- `POST /api/rooms/join` - Join room
- `GET /api/rooms/:id` - Get room
- `POST /api/rooms/:id/start` - Start game
- `POST /api/rooms/:id/progress` - Update progress

### Notifications
- `GET /api/notifications/:userId` - Get notifications
- `POST /api/notifications/:id/read` - Mark read

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get leaderboard
curl http://localhost:3000/api/users/leaderboard?limit=10
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not connecting | Check backend is running on port 3000 |
| CORS errors | Add frontend URL to `ALLOWED_ORIGINS` |
| 404 on GitHub Pages | Wait for Actions to complete |
| Cold start delay | Backend spins down on free tier |
| Data lost on restart | In-memory storage - upgrade to DB |

## Quick Deploy Checklist

Backend (Render.com):
- [ ] Root Directory: `server`
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Copy API URL

Frontend (GitHub Pages):
- [ ] Update API URL in `/src/lib/apiClient.ts`
- [ ] Push to GitHub
- [ ] Enable GitHub Actions in Settings
- [ ] Wait for deployment

## Performance

- **Frontend**: Instant (static files)
- **Backend**: 
  - First request: 30-60s (cold start)
  - Subsequent: <100ms
  - Solution: Paid tier or keep-alive ping

## Security

✅ Passwords hashed with bcrypt
✅ CORS configured
✅ HTTPS automatic
⚠️ Add rate limiting for production
⚠️ Use database instead of in-memory

## Upgrade Path

1. **Database**: PostgreSQL or MongoDB
2. **Authentication**: Add JWT tokens
3. **Rate Limiting**: Prevent abuse
4. **CDN**: Faster global access
5. **Monitoring**: Add error tracking

## Resources

- 📖 Full Docs: `/README.md`
- 🚀 Deployment: `/DEPLOYMENT_GUIDE.md`
- ✅ Checklist: `/DEPLOYMENT_CHECKLIST.md`
- 🔧 Backend: `/server/README.md`

## Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **GitHub Actions**: https://github.com/YOUR_USERNAME/Group-12-Project-CSCE3444-fa25/actions
- **Live App**: https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/

---

**Need Help?** Check the full documentation or open an issue on GitHub!
