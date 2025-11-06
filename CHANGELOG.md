# Changelog

## Version 1.0.0 (In Progress)

### Added
- Implemented a robust Sudoku puzzle generation algorithm.
- Added a 'How to Play' tutorial page explaining game rules and XP system.

### Changed
- **Puzzle Generation Logic:**
  - Ensured `generateCompleteSudoku` always produces a valid, complete Sudoku grid.
  - Ensured `createSudokuPuzzle` correctly removes digits based on difficulty.
  - Standardized difficulty names (`Easy`, `Medium`, `Expert`) across `PlayPage` and `sudoku.ts` to resolve `k` (number of digits to remove) being `undefined`.
- **GamePage Functionality:**
  - Fixed the `selectedCell is not defined` error by correctly initializing the `selectedCell` state.
  - Implemented logic to prevent users from editing pre-filled cells.
  - Ensured the timer stops when the puzzle is complete.
  - Ensured player XP is calculated and updated correctly before the timer is cleared.
  - Removed the local `difficulty` state; `GamePage` now receives it as a prop.
  - Removed the difficulty selector UI from `GamePage`.
  - Updated cell selection logic to allow users to correct their own entries.
  - Enhanced visual distinction between pre-filled and user-entered cells.
- **ExplorePage Functionality:**
  - Updated `SudokuGridPreview` to correctly display empty cells (`null` values).
  - Modified `accountManager.ts` to use the new puzzle generation logic for demo puzzles, replacing the old `generateDemoGrid`.
- **User Experience:**
  - Updated the 'How to Play' button icon to `HelpCircle`.
  - Disabled difficulty selection buttons during an active game.
  - Ensured the 'Play Again' button generates a new puzzle with the same difficulty.
- **Application Structure:**
  - Removed the `ExplorePage` and all related navigation.
  - Set the `PlayPage` as the default page after login.
- **Build Configuration:**
  - Commented out the `base` property in `vite.config.ts` in an attempt to resolve local development issues.

### Removed
- Duplicate `src` directory.
- `generateDemoGrid` function from `accountManager.ts`.
- `wins` property from `UserAccount` type and all related code.
- `ExplorePage` component and all related navigation.

### Fixed
- Resolved issue where puzzles on the 'Play' page were generated as completely solved.
- Fixed syntax errors in `GamePage.tsx` related to missing `div` tags.
- Resolved issue where `k` (number of digits to remove) was `undefined` during puzzle generation.
- Resolved issue where the `ExplorePage` displayed "No puzzles yet" on refresh.
- Corrected logic to prevent users from editing pre-filled cells.
- Addressed issue where users could not re-select a user-entered cell to change its value.

### Known Issues
- **Development Environment:** Changes made to the application code are not being reflected in the browser, even after clearing the cache and modifying the Vite configuration. This is the main blocking issue and its cause is currently unknown.
