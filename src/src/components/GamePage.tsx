import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PageWrapper } from "./PageWrapper";
import { Lightbulb, Timer, User, CheckCircle, RotateCcw, Calendar, HelpCircle } from "lucide-react";
import { boardStyles } from "./BoardCustomization";
import { useUser } from "../contexts/UserContext";
import { generateSudokuGrid, getGridSize, generateDailyPuzzle, getTodayDateString } from "../utils/sudokuGenerator";
import { XPProgress } from "./XPProgress";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

// Get max number for grid
function getMaxNumber(difficulty: Difficulty): number {
  return getGridSize(difficulty);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'Easy': return 'bg-green-500 text-white';
    case 'Medium': return 'bg-yellow-500 text-white';
    case 'Hard': return 'bg-orange-500 text-white';
    case 'Expert': return 'bg-red-500 text-white';
  }
}

type GamePageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  boardStyle?: string;
  difficulty?: string;
};

export function GamePage({ onNavigate, currentPage, boardStyle = 'classic', difficulty: initialDifficulty = 'Medium' }: GamePageProps) {
  const { currentUser, updateCurrentUser } = useUser();
  
  // Check if this is a daily challenge
  const isDaily = initialDifficulty === 'daily';
  const gameDifficulty: Difficulty = isDaily ? 'Expert' : (initialDifficulty.charAt(0).toUpperCase() + initialDifficulty.slice(1)) as Difficulty;
  
  const [difficulty, setDifficulty] = useState<Difficulty>(gameDifficulty);
  const [isDailyChallenge, setIsDailyChallenge] = useState(isDaily);
  
  // Initialize grid and daily date together to avoid re-render issues
  const [gameState] = useState(() => {
    if (isDaily) {
      const daily = generateDailyPuzzle('Expert');
      return {
        grid: daily.puzzle,
        solution: daily.solution,
        dailyDate: daily.date
      };
    }
    const generated = generateSudokuGrid(gameDifficulty);
    return {
      grid: generated.puzzle,
      solution: generated.solution,
      dailyDate: ''
    };
  });
  
  const [dailyDate, setDailyDate] = useState<string>(gameState.dailyDate);
  const [grid, setGrid] = useState<(number | null)[][]>(gameState.grid);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>(gameState.grid);
  const [solutionGrid, setSolutionGrid] = useState<number[][]>(gameState.solution);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [previousXP, setPreviousXP] = useState(currentUser?.xp || 0);
  const [gameStarted, setGameStarted] = useState(true);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Keyboard input effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedCell) return;

      const [row, col] = selectedCell;
      const maxNumber = getMaxNumber(difficulty);

      // Handle number input
      if (event.key >= '1' && event.key <= String(maxNumber)) {
        handleNumberInput(parseInt(event.key, 10));
        return;
      }

      // Handle deletion
      if (event.key === 'Backspace' || event.key === 'Delete') {
        handleNumberInput(0); // In this component, 0 clears the cell
        return;
      }
      
      // Handle deselection
      if (event.key === 'Escape') {
        setSelectedCell(null);
        return;
      }

      // Handle navigation
      let newRow = row;
      let newCol = col;
      if (event.key === 'ArrowUp') newRow = Math.max(0, row - 1);
      else if (event.key === 'ArrowDown') newRow = Math.min(grid.length - 1, row + 1);
      else if (event.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
      else if (event.key === 'ArrowRight') newCol = Math.min(grid.length - 1, col + 1);
      
      if (newRow !== row || newCol !== col) {
        if (initialGrid[newRow][newCol] === null) {
            setSelectedCell([newRow, newCol]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, grid, initialGrid, difficulty]);

  const handleCellClick = (row: number, col: number) => {
    // Allow clicking if cell is empty OR if it's not an initial clue
    if (initialGrid[row][col] === null) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberInput = (number: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const newGrid = [...grid];
      newGrid[row][col] = number === 0 ? null : number;
      setGrid(newGrid);
      setSelectedCell(null);

      // Check if puzzle is complete
      checkPuzzleComplete(newGrid);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    // If game hasn't started, change immediately
    if (!gameStarted) {
      setDifficulty(newDifficulty);
      handleNewGame(newDifficulty);
    } else {
      // If game is in progress, show confirmation
      setPendingDifficulty(newDifficulty);
      setShowNewGameDialog(true);
    }
  };

  const handleNewGame = (newDifficulty?: Difficulty) => {
    const difficultyToUse = newDifficulty || difficulty;
    const { puzzle, solution } = generateSudokuGrid(difficultyToUse);
    // Create a deep copy of the initial grid to preserve the original puzzle state
    const newInitialGrid = puzzle.map(row => [...row]);
    setGrid(puzzle);
    setInitialGrid(newInitialGrid);
    setSolutionGrid(solution);
    setTimer(0);
    setHintsUsed(0);
    setSelectedCell(null);
    setGameStarted(true);
    if (newDifficulty) {
      setDifficulty(newDifficulty);
    }
    setShowNewGameDialog(false);
    setPendingDifficulty(null);
  };

  const confirmNewGame = () => {
    if (pendingDifficulty) {
      handleNewGame(pendingDifficulty);
    } else {
      handleNewGame();
    }
  };

  const isValidSolution = (currentGrid: (number | null)[][]): boolean => {
    const gridSize = currentGrid.length;
    const boxSize = gridSize === 4 ? 2 : gridSize === 6 ? 3 : 3;
    const boxRowSize = gridSize === 6 ? 2 : boxSize;

    // Check rows
    for (let row = 0; row < gridSize; row++) {
      const seen = new Set<number>();
      for (let col = 0; col < gridSize; col++) {
        const cell = currentGrid[row][col];
        if (cell === null || cell < 1 || cell > gridSize) return false;
        if (seen.has(cell)) return false;
        seen.add(cell);
      }
    }

    // Check columns
    for (let col = 0; col < gridSize; col++) {
      const seen = new Set<number>();
      for (let row = 0; row < gridSize; row++) {
        const cell = currentGrid[row][col];
        if (cell === null) return false;
        if (seen.has(cell)) return false;
        seen.add(cell);
      }
    }

    // Check boxes
    for (let boxRow = 0; boxRow < gridSize / boxRowSize; boxRow++) {
      for (let boxCol = 0; boxCol < gridSize / boxSize; boxCol++) {
        const seen = new Set<number>();
        for (let row = 0; row < boxRowSize; row++) {
          for (let col = 0; col < boxSize; col++) {
            const cellRow = boxRow * boxRowSize + row;
            const cellCol = boxCol * boxSize + col;
            const cell = currentGrid[cellRow][cellCol];
            if (cell === null) return false;
            if (seen.has(cell)) return false;
            seen.add(cell);
          }
        }
      }
    }

    return true;
  };

  const checkPuzzleComplete = (currentGrid: (number | null)[][]) => {
    // Check if all cells are filled
    const allFilled = currentGrid.every(row => row.every(cell => cell !== null));
    
    if (allFilled) {
      // Validate the solution is correct
      const isCorrect = isValidSolution(currentGrid);
      
      if (!isCorrect) {
        // Solution is incorrect - don't award XP
        return;
      }
      // Award XP based on difficulty (daily challenge gives 750 XP)
      const xpRewards = {
        'Easy': 50,
        'Medium': 100,
        'Hard': 150,
        'Expert': 200,
      };
      
      const baseXP = isDailyChallenge ? 750 : xpRewards[difficulty];
      const timeBonus = timer < 300 ? 50 : 0; // Bonus for completing under 5 minutes
      const hintPenalty = hintsUsed * 10;
      const totalXP = Math.max(baseXP + timeBonus - hintPenalty, 10);
      
      setEarnedXP(totalXP);
      
      if (currentUser) {
        // Store previous XP before updating
        setPreviousXP(currentUser.xp);
        
        const newXP = currentUser.xp + totalXP;
        const newLevel = Math.floor(newXP / 1000) + 1;
        const newSolved = currentUser.solvedPuzzles + 1;
        
        updateCurrentUser({
          xp: newXP,
          level: newLevel,
          solvedPuzzles: newSolved,
          averageTime: formatTime(timer),
        });
        
        // If daily challenge, mark as completed
        if (isDailyChallenge && dailyDate) {
          const completedDailies = JSON.parse(localStorage.getItem('completedDailies') || '{}');
          completedDailies[dailyDate] = {
            completedAt: new Date().toISOString(),
            time: timer,
            hintsUsed,
            xpEarned: totalXP,
          };
          localStorage.setItem('completedDailies', JSON.stringify(completedDailies));
        }
      }
      
      setShowCompletionDialog(true);
    }
  };

  const handleHint = () => {
    if (selectedCell && hintsUsed < 3) {
      // Mark game as started
      if (!gameStarted) {
        setGameStarted(true);
      }
      
      setHintsUsed(prev => prev + 1);
      // Fill the selected cell with the correct number from the solution
      const [row, col] = selectedCell;
      const newGrid = [...grid];
      newGrid[row][col] = solutionGrid[row][col];
      setGrid(newGrid);
      setSelectedCell(null);
    }
  };

  const currentBoardStyle = boardStyles.find(s => s.id === boardStyle) || boardStyles[0];

  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        {/* Header with game info */}
      <div className="bg-background border-b px-4 py-3 md:py-4 space-y-3 md:space-y-4">
        {/* Daily Challenge Banner */}
        {isDailyChallenge && (
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-2 md:p-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span className="text-sm md:text-base">Daily Challenge - {dailyDate}</span>
            <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 md:text-base md:px-3 md:py-1">
              +750 XP
            </Badge>
          </div>
        )}
        
        {/* Timer and stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-lg md:text-xl">{formatTime(timer)}</span>
            <button 
              onClick={() => onNavigate('faq')}
              className="p-1 hover:bg-accent rounded-md transition-all hover:scale-105 active:scale-95"
            >
              <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </button>
          </div>
          {currentUser && (
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Badge variant="secondary" className="md:px-3 md:py-1">Level {currentUser.level}</Badge>
              <span className="text-muted-foreground">{currentUser.xp.toLocaleString()} XP</span>
            </div>
          )}
        </div>
        
        {/* Difficulty selector and New Game button */}
        <div className="flex gap-2 items-center">
          {!isDailyChallenge && (
            <div className="flex gap-2 flex-1">
              {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map((diff) => (
                <Button
                  key={diff}
                  variant={difficulty === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDifficultyChange(diff)}
                  className={`${difficulty === diff ? getDifficultyColor(diff) : ''} md:text-base md:h-10 md:px-4`}
                  disabled={gameStarted && difficulty === diff}
                >
                  {diff}
                </Button>
              ))}
            </div>
          )}
          {isDailyChallenge && (
            <div className="flex-1">
              <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white md:text-base md:px-3 md:py-1">
                Expert - Daily Challenge
              </Badge>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => gameStarted ? setShowNewGameDialog(true) : handleNewGame()}
            className="flex items-center gap-1 md:text-base md:h-10 md:px-4"
          >
            <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Game content */}
      <div className="flex-1 p-4 pb-20 md:pb-4 flex flex-col items-center justify-center">
        {/* Sudoku grid */}
        <div 
          className="p-2 md:p-4 rounded-lg mb-4 md:mb-6 mx-auto bg-card/50 backdrop-blur-sm transition-shadow duration-300"
          style={{
            boxShadow: `0 0 30px ${currentBoardStyle.glowColor}, 0 0 60px ${currentBoardStyle.glowColor}, 0 0 90px ${currentBoardStyle.glowColor}`
          }}
        >
          {/* Grid wrapper with outer border */}
          <div 
            className={`border-2 md:border-4 ${currentBoardStyle.thickBorder} rounded-sm overflow-hidden`}
          >
            <div 
              className="grid gap-0"
              style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const gridSize = grid.length;
                  const boxSize = gridSize === 4 ? 2 : gridSize === 6 ? 3 : 3;
                  const boxRowSize = gridSize === 6 ? 2 : boxSize;
                  const isInitialCell = initialGrid[rowIndex][colIndex] !== null;
                  const isUserFilled = !isInitialCell && cell !== null;
                  
                  // Determine which borders this cell needs
                  const needsRightBorder = colIndex < gridSize - 1;
                  const needsBottomBorder = rowIndex < gridSize - 1;
                  const needsThickRightBorder = colIndex % boxSize === boxSize - 1 && colIndex < gridSize - 1;
                  const needsThickBottomBorder = rowIndex % boxRowSize === boxRowSize - 1 && rowIndex < gridSize - 1;
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        ${gridSize === 4 ? 'w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24' : gridSize === 6 ? 'w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20' : 'w-8 h-8 md:w-14 md:h-14 lg:w-16 lg:h-16'}
                        flex items-center justify-center transition-colors text-base md:text-2xl lg:text-3xl
                        ${isInitialCell ? 'bg-muted font-bold text-foreground cursor-not-allowed' : 'bg-card font-normal'}
                        ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex 
                          ? `ring-2 md:ring-4 ring-inset ${currentBoardStyle.selectedCellBorder.replace('border-', 'ring-')} bg-primary/10`
                          : ''
                        }
                        ${isUserFilled ? 'text-primary' : ''}
                        ${!isInitialCell ? 'hover:bg-muted/30 cursor-pointer' : ''}
                        ${needsRightBorder ? (needsThickRightBorder ? `border-r-2 md:border-r-4 ${currentBoardStyle.thickBorder}` : `border-r md:border-r-2 ${currentBoardStyle.cellBorder}`) : ''}
                        ${needsBottomBorder ? (needsThickBottomBorder ? `border-b-2 md:border-b-4 ${currentBoardStyle.thickBorder}` : `border-b md:border-b-2 ${currentBoardStyle.cellBorder}`) : ''}
                      `}
                    >
                      {cell || ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Number input pad */}
        <div className="grid grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6 max-w-md md:max-w-2xl mx-auto w-full">
          {Array.from({ length: getMaxNumber(difficulty) }, (_, i) => i + 1).map((number) => (
            <Button
              key={number}
              variant="outline"
              size="sm"
              onClick={() => handleNumberInput(number)}
              disabled={!selectedCell}
              className="aspect-square text-base md:text-xl lg:text-2xl h-12 md:h-16 lg:h-20"
            >
              {number}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedCell && handleNumberInput(0)}
            disabled={!selectedCell}
            className="aspect-square text-base md:text-xl lg:text-2xl h-12 md:h-16 lg:h-20"
          >
            ✕
          </Button>
        </div>

        {/* Hint button */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={handleHint}
            disabled={!selectedCell || hintsUsed >= 3}
            className="flex items-center gap-2 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
          >
            <Lightbulb className="h-4 w-4 md:h-5 md:w-5" />
            Hint ({3 - hintsUsed} left)
          </Button>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Puzzle Complete!
            </DialogTitle>
            <DialogDescription className="text-center">
              Congratulations on completing the puzzle!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-lg text-center">
              <p className="text-3xl mb-1">+{earnedXP} XP</p>
              <p className="text-sm text-muted-foreground">
                Time: {formatTime(timer)} • Hints: {hintsUsed}/3
              </p>
            </div>

            {currentUser && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">Level Progress</p>
                <XPProgress
                  currentXP={currentUser.xp}
                  currentLevel={currentUser.level}
                  showLabel={true}
                  size="md"
                  animate={true}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowCompletionDialog(false);
                  onNavigate('explore');
                }}
              >
                Back to Menu
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setShowCompletionDialog(false);
                  handleNewGame();
                }}
              >
                Play Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Game Confirmation Dialog */}
      <AlertDialog open={showNewGameDialog} onOpenChange={setShowNewGameDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Game?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDifficulty 
                ? `This will start a new ${pendingDifficulty} puzzle and your current progress will be lost.`
                : 'Your current progress will be lost. Are you sure?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowNewGameDialog(false);
              setPendingDifficulty(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmNewGame}>
              Start New Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageWrapper>
  );
}
