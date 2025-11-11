# 🚀 Complete Deployment Guide

This guide walks you through deploying Group-12-Project-CSCE3444-fa25 with a backend API on Render.com and frontend on GitHub Pages.

## Overview

- **Frontend**: React app hosted on GitHub Pages (free, static hosting)
- **Backend**: Express API hosted on Render.com (free tier available)
- **Database**: In-memory (upgradable to PostgreSQL/MongoDB)

## Prerequisites

- GitHub account
- Render.com account (free)
- Git installed locally
- Node.js 18+ installed

## Part 1: Deploy Backend API (Render.com)

### Step 1: Prepare Repository

1. Make sure all code is committed:
```bash
git status
git add .
git commit -m "Ready for deployment"
```

2. Create GitHub repository if you haven't:
```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Group-12-Project-CSCE3444-fa25.git
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Sign up or login
3. Click "New +" button → Select "Web Service"

### Step 3: Connect Repository

1. Click "Connect a repository"
2. Authorize Render to access your GitHub
3. Select your `Group-12-Project-CSCE3444-fa25` repository

### Step 4: Configure Service

Fill in the following settings:

- **Name**: `Group-12-Project-CSCE3444-fa25-api` (or any name you prefer)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server` ⚠️ **Important!**
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 5: Select Plan

- Choose **Free** plan
- Free tier includes:
  - 750 hours/month
  - Automatic SSL
  - Auto-deploy on git push
  - ⚠️ Spins down after 15 min inactivity (cold starts)

### Step 6: Environment Variables (Optional)

Click "Advanced" → "Add Environment Variable":

| Key | Value | Required? |
|-----|-------|-----------|
| `PORT` | Auto-set by Render | ✅ Auto |
| `ALLOWED_ORIGINS` | `https://YOUR_USERNAME.github.io` | ⚠️ Add after frontend deployed |

### Step 7: Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Watch the logs for any errors
4. Once complete, you'll see: "Your service is live 🎉"

### Step 8: Test Backend

Your API URL will be: `https://Group-12-Project-CSCE3444-fa25-api.onrender.com`

Test it:
```bash
# Health check
curl https://Group-12-Project-CSCE3444-fa25-api.onrender.com/health

# Root endpoint
curl https://Group-12-Project-CSCE3444-fa25-api.onrender.com/
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Step 9: Save API URL

⚠️ **Write down your API URL!** You'll need it for the frontend.

Example: `https://Group-12-Project-CSCE3444-fa25-api.onrender.com`

---

## Part 2: Deploy Frontend (GitHub Pages)

### Step 10: Update API Endpoint

1. Open `/src/lib/apiClient.ts`
2. Update line 1 with your Render API URL:

```typescript
const API_BASE_URL = 'https://Group-12-Project-CSCE3444-fa25-api.onrender.com'; // Replace with YOUR URL
```

3. Save the file

### Step 11: Commit Changes

```bash
git add .
git commit -m "Update API endpoint for production"
git push origin main
```

### Step 12: Enable GitHub Pages

1. Go to your GitHub repository
2. Click "Settings" (top menu)
3. Scroll to "Pages" (left sidebar)
4. Under "Source":
   - Select: **GitHub Actions**
5. Save

### Step 13: Trigger Deployment

The workflow will automatically run on every push to `main`.

Check deployment status:
1. Go to "Actions" tab in your repository
2. You'll see "Deploy to GitHub Pages" workflow running
3. Wait for green checkmark (2-3 minutes)

### Step 14: Access Your App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/
```

Example: `https://johnsmith.github.io/Group-12-Project-CSCE3444-fa25/`

---

## Part 3: Configure CORS (Backend)

Now that both are deployed, update backend CORS:

### Step 15: Add CORS Origin

1. Go back to Render.com dashboard
2. Select your `Group-12-Project-CSCE3444-fa25-api` service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://YOUR_USERNAME.github.io`
6. Click "Save Changes"

Backend will automatically redeploy (1-2 minutes).

---

## Testing Your Deployed App

### Test Frontend

1. Open `https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/`
2. Click "Quick Demo (Skip Login)" button
3. Try starting a game

### Test Full Integration

1. Create an account on your deployed app
2. Complete a puzzle and earn XP
3. Check leaderboard
4. Try creating a multiplayer room

### Troubleshooting

**Frontend loads but can't connect to backend:**
- Check browser console for errors
- Verify API URL in `/src/lib/apiClient.ts`
- Ensure backend is running (check Render dashboard)
- Check CORS settings on backend

**Backend is sleeping (cold start):**
- Free tier spins down after 15 min inactivity
- First request may take 30-60 seconds
- Subsequent requests are fast
- Solution: Upgrade to paid tier or use a cron job to keep alive

**404 on GitHub Pages:**
- Ensure GitHub Actions workflow completed
- Check "Actions" tab for errors
- Verify `base: './'` in `vite.config.ts`

---

## Upgrading to Database (Optional)

The current setup uses in-memory storage (data resets on server restart).

### PostgreSQL (Recommended)

1. **Create Database on Render**:
   - Click "New +" → "PostgreSQL"
   - Free tier available (90-day limit)
   - Copy connection string

2. **Update Backend**:
   ```bash
   cd server
   npm install pg
   ```

3. **Add Environment Variable**:
   - Go to Render service settings
   - Add `DATABASE_URL` with connection string

4. **Update Code**:
   - Replace in-memory Maps with database queries
   - See `/server/README.md` for migration guide

### MongoDB

1. **Create Database on MongoDB Atlas**:
   - Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free cluster
   - Get connection string

2. **Update Backend**:
   ```bash
   cd server
   npm install mongodb
   ```

3. **Add Environment Variable**:
   - Add `MONGODB_URI` on Render

4. **Update Code**:
   - Replace Maps with MongoDB collections

---

## Monitoring and Maintenance

### Check Backend Logs

1. Go to Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Monitor for errors

### Update Application

When you make changes:

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push origin main
```

- Frontend: Auto-deploys via GitHub Actions
- Backend: Auto-deploys via Render

### Performance Tips

1. **Keep Backend Alive**:
   - Use cron-job.org to ping `/health` every 10 minutes
   - Or upgrade to paid tier for always-on

2. **Optimize Frontend**:
   - Images are optimized
   - Code is minified in build
   - Static assets cached by GitHub Pages

3. **Monitor Usage**:
   - Check Render dashboard for bandwidth
   - Free tier has 100 GB/month

---

## Cost Breakdown

### Current Setup (FREE)

- **Frontend**: GitHub Pages (unlimited static hosting)
- **Backend**: Render.com Free Tier (750 hours/month)
- **Total**: $0/month

### Recommended Production Setup

- **Frontend**: GitHub Pages - $0
- **Backend**: Render Starter Plan - $7/month
  - Always-on (no cold starts)
  - 512 MB RAM
  - More reliable
- **Database**: Render PostgreSQL - $7/month
  - Persistent data
  - Automatic backups
- **Total**: $14/month

---

## Security Checklist

- [ ] Passwords hashed with bcrypt ✅
- [ ] CORS configured for specific origins
- [ ] No sensitive data in git repository
- [ ] `.env` files in `.gitignore` ✅
- [ ] API rate limiting (TODO for production)
- [ ] Input validation (basic implemented)
- [ ] HTTPS enabled (automatic on Render & GitHub Pages) ✅

---

## Support Resources

### Documentation
- Frontend: `/README.md`
- Backend: `/server/README.md`
- Deployment: `/DEPLOYMENT_CHECKLIST.md`

### Common Issues
- Cold starts: Backend spins down after 15 min (free tier)
- Data loss: In-memory storage resets (upgrade to database)
- CORS errors: Check `ALLOWED_ORIGINS` environment variable

### Getting Help
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Review GitHub Actions logs for deployment errors
4. Open issue on GitHub repository

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to GitHub Pages
3. ✅ Configure CORS
4. 🎯 Test complete flow
5. 🎯 Share with friends!
6. 🎯 Consider upgrading to database for persistence
7. 🎯 Add custom domain (optional)

---

## Congratulations! 🎉

Your Group-12-Project-CSCE3444-fa25 multiplayer Sudoku game is now live and accessible worldwide!

**Share your game**:
- Frontend URL: `https://YOUR_USERNAME.github.io/Group-12-Project-CSCE3444-fa25/`
- Backend API: `https://Group-12-Project-CSCE3444-fa25-api.onrender.com`

Happy gaming! 🎮
