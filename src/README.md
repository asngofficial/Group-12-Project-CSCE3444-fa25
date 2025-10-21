# Sudoku Game - Multiplayer Web App

A competitive multiplayer Sudoku game with XP earning, friend challenges, and community features. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Account System**: Create and manage multiple user accounts with persistent data using localStorage
- **XP & Leveling**: Earn XP by completing puzzles, with harder puzzles rewarding more XP
- **Friends System**: Search and add other players as friends, compete on friends-only leaderboards
- **Leaderboards**: Global and friends leaderboards to track your progress
- **Board Customization**: Choose from 8 beautiful board themes (Ocean Blue, Forest Green, Royal Purple, etc.)
- **Community Puzzles**: Share and play puzzles created by other users
- **Challenges**: Compete against friends in head-to-head matches
- **Difficulty Levels**: Easy (+50 XP), Medium (+100 XP), Hard (+200 XP), Expert (+500 XP)
- **Daily Challenges**: Special puzzles for bonus XP
- **Bot Players**: Pre-populated bot accounts marked with "(bot)" for testing

## Demo Accounts

To test the app, you can use these pre-populated bot accounts:
- Username: `PuzzleMaster (bot)` | Password: `demo123`
- Username: `SudokuPro (bot)` | Password: `demo123`
- Username: `GridGuru (bot)` | Password: `demo123`
- Username: `QuickSolver (bot)` | Password: `demo123`
- Username: `NumberNinja (bot)` | Password: `demo123`

Or create your own account! Bot accounts are automatically set up with friends and stats for testing.

## 🚀 Getting Started

The project is ready to run! All files are properly organized in the Vite project structure.

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
```

Then open your browser to `http://localhost:5173`

## Hosting on GitHub Pages

The project includes automatic deployment via GitHub Actions! The workflow file is configured at `.github/workflows/deploy.yml`.

### Setup Steps

1. **Push your code to GitHub**

2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Under "Source", select "GitHub Actions"

3. **Automatic deployment**:
   - Every push to `main` branch will automatically build and deploy
   - Check the "Actions" tab to see deployment progress

4. **Update vite.config.ts** (if deploying to a subdirectory):
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/', // Replace with your repository name
     // ... other config
   })
   ```

5. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

Your app will be available at: `https://yourusername.github.io/your-repo-name/`

### Manual Deployment

If you prefer manual deployment:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**:
   - Push the contents of the `dist` folder to the `gh-pages` branch
   - Or use the `gh-pages` package:
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:5173`

## Data Storage

All user data, puzzles, challenges, and preferences are stored in the browser's `localStorage`. This means:
- ✅ No backend server needed
- ✅ Can be hosted on GitHub Pages for free
- ✅ Works offline after initial load
- ⚠️ Data is device-specific (won't sync across devices)
- ⚠️ Clearing browser data will reset the app

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **localStorage** - Data persistence

## Contributing

Feel free to submit issues and pull requests!

## License

MIT License - feel free to use this project however you'd like!
