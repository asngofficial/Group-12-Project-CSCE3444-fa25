# Daily Puzzle Synchronization

## How It Works

The daily puzzle feature ensures that all users get the **exact same puzzle** on the same day, without needing a server or backend. Here's how synchronization is achieved:

### 1. Seeded Random Number Generator

Instead of using `Math.random()` (which is unpredictable), we use a **Linear Congruential Generator (LCG)** with a seed value:

```typescript
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}
```

**Key Concept**: If you give this generator the same seed, it will produce the **exact same sequence** of "random" numbers every time.

### 2. Date-Based Seed

Every day has a unique date (e.g., "2025-11-07"). We convert this date string into a number:

```typescript
export function getDateSeed(dateString: string): number {
  const hash = dateString.split('').reduce((acc, char) => {
    return acc * 31 + char.charCodeAt(0);
  }, 0);
  return Math.abs(hash);
}
```

For example:
- "2025-11-07" → seed: `123456789`
- "2025-11-08" → seed: `987654321`

### 3. Deterministic Puzzle Generation

When generating the daily puzzle:
1. Get today's date: `"2025-11-07"`
2. Convert to seed: `123456789`
3. Use seeded RNG to generate the puzzle
4. **Everyone using the same date gets the same puzzle!**

```typescript
export function generateDailyPuzzle(difficulty: Difficulty) {
  const date = getTodayDateString(); // "2025-11-07"
  const seed = getDateSeed(date);    // 123456789
  const puzzle = generateSudokuGrid(difficulty, seed); // Same puzzle for everyone!
  
  return { puzzle, date };
}
```

## Features Implemented

### ✅ Synchronized Daily Puzzles
- All users get the same Expert-level puzzle each day
- Resets at midnight in the user's local timezone

### ✅ Completion Tracking
- Tracks which daily challenges have been completed
- Stored in localStorage: `completedDailies`
- Once completed, shows "Completed" status

### ✅ Bonus XP Reward
- Daily challenges award **750 XP** (vs 200 XP for regular Expert)
- Completion status persists across sessions

### ✅ Visual Indicators
- Calendar icon on the Play page
- Special banner in the game showing it's a Daily Challenge
- Green "Completed" badge when done

## User Experience

### On the Play Page:
- Shows "Daily Challenge" card with calendar icon
- Displays "+750 XP" badge if not completed
- Shows green "Completed" status if already done today
- Button disabled after completion

### During Gameplay:
- Banner at top: "Daily Challenge - 2025-11-07"
- Shows "+750 XP" badge
- Difficulty locked to Expert
- No difficulty selector (daily is always Expert)

## Technical Details

### Storage Format
```json
// localStorage: "completedDailies"
{
  "2025-11-07": {
    "completedAt": "2025-11-07T14:23:45.123Z",
    "time": 1234,
    "hintsUsed": 2,
    "xpEarned": 750
  }
}
```

### Synchronization Guarantee
✅ **Same date = Same seed = Same puzzle**
✅ **No server needed**
✅ **Works offline**
✅ **100% deterministic**

All users around the world will get the same puzzle on their calendar day. The puzzle changes at midnight in each user's local timezone.
