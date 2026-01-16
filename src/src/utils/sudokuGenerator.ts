type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

// Seeded random number generator for consistent daily puzzles
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Returns random integer between 0 and max (exclusive)
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// Get grid size based on difficulty
export function getGridSize(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'Easy': return 4;    // 4x4 grid
    case 'Medium': return 6;  // 6x6 grid
    case 'Hard': return 9;    // 9x9 grid
    case 'Expert': return 9;  // 9x9 grid
  }
}

// Get box dimensions for each grid size
function getBoxDimensions(size: number): { rows: number; cols: number } {
  if (size === 4) return { rows: 2, cols: 2 };
  if (size === 6) return { rows: 2, cols: 3 };
  return { rows: 3, cols: 3 }; // 9x9
}

// Check if a number is valid in a given position
function isValid(
  grid: (number | null)[][],
  row: number,
  col: number,
  num: number
): boolean {
  const size = grid.length;
  const { rows: boxRows, cols: boxCols } = getBoxDimensions(size);

  // Check row
  for (let x = 0; x < size; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < size; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check box
  const boxStartRow = row - (row % boxRows);
  const boxStartCol = col - (col % boxCols);

  for (let i = 0; i < boxRows; i++) {
    for (let j = 0; j < boxCols; j++) {
      if (grid[boxStartRow + i][boxStartCol + j] === num) return false;
    }
  }

  return true;
}

// Fill the grid using backtracking
function fillGrid(grid: (number | null)[][], size: number, rng?: SeededRandom): boolean {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === null) {
        // Try numbers in random order
        const numbers = Array.from({ length: size }, (_, i) => i + 1);
        // Shuffle numbers for randomness
        for (let i = numbers.length - 1; i > 0; i--) {
          const j = rng ? rng.nextInt(i + 1) : Math.floor(Math.random() * (i + 1));
          [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        for (const num of numbers) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;

            if (fillGrid(grid, size, rng)) {
              return true;
            }

            grid[row][col] = null;
          }
        }

        return false;
      }
    }
  }
  return true;
}

// Create a complete valid Sudoku solution
function createSolution(size: number, rng?: SeededRandom): number[][] {
  const grid: (number | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  fillGrid(grid, size, rng);

  return grid as number[][];
}

// Remove numbers from the complete grid based on difficulty
function removeNumbers(
  solution: number[][],
  difficulty: Difficulty,
  rng?: SeededRandom
): (number | null)[][] {
  const size = solution.length;
  const grid: (number | null)[][] = solution.map(row => [...row]);

  // Determine how many cells to remove based on difficulty and grid size
  let removePercentage: number;
  switch (difficulty) {
    case 'Easy': removePercentage = 0.30; break;    // Remove 30%
    case 'Medium': removePercentage = 0.50; break;  // Remove 50%
    case 'Hard': removePercentage = 0.65; break;    // Remove 65%
    case 'Expert': removePercentage = 0.75; break;  // Remove 75%
  }

  const totalCells = size * size;
  const cellsToRemove = Math.floor(totalCells * removePercentage);

  // Create array of all cell positions
  const positions: [number, number][] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = rng ? rng.nextInt(i + 1) : Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove numbers from random positions
  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = positions[i];
    grid[row][col] = null;
  }

  return grid;
}

// Main function to generate a valid Sudoku puzzle
export function generateSudokuGrid(difficulty: Difficulty, seed?: number): {
  puzzle: (number | null)[][];
  solution: number[][];
} {
  const size = getGridSize(difficulty);
  const rng = seed !== undefined ? new SeededRandom(seed) : undefined;
  
  // Create a complete valid solution
  const solution = createSolution(size, rng);
  
  // Remove numbers based on difficulty
  const puzzle = removeNumbers(solution, difficulty, rng);
  
  return { puzzle, solution };
}

// Generate a seed from a date string (YYYY-MM-DD)
export function getDateSeed(dateString: string): number {
  // Convert date string to a consistent number
  const hash = dateString.split('').reduce((acc, char) => {
    return acc * 31 + char.charCodeAt(0);
  }, 0);
  return Math.abs(hash);
}

// Get today's date in YYYY-MM-DD format
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate today's daily puzzle
export function generateDailyPuzzle(difficulty: Difficulty): {
  puzzle: (number | null)[][];
  solution: number[][];
  date: string;
} {
  const date = getTodayDateString();
  const seed = getDateSeed(date);
  const { puzzle, solution } = generateSudokuGrid(difficulty, seed);
  
  return { puzzle, solution, date };
}
