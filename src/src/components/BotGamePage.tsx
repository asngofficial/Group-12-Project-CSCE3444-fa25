import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { PageWrapper } from "./PageWrapper";
import { Timer, User, Bot, Trophy, Home, RotateCcw, Flag } from "lucide-react";
import { boardStyles } from "./BoardCustomization";
import { useUser } from "../contexts/UserContext";
import { generateSudokuGrid, getGridSize } from "../utils/sudokuGenerator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

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

type BotGamePageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  boardStyle?: string;
  difficulty?: string;
};

export function BotGamePage({ onNavigate, currentPage, boardStyle = 'classic', difficulty: initialDifficulty = 'Medium' }: BotGamePageProps) {
  const { currentUser, updateCurrentUser } = useUser();
  const gameDifficulty: Difficulty = (initialDifficulty.charAt(0).toUpperCase() + initialDifficulty.slice(1)) as Difficulty;
  
  const [difficulty, setDifficulty] = useState<Difficulty>(gameDifficulty);
  
  // Initialize grid
  const [gameState] = useState(() => {
    const { puzzle, solution } = generateSudokuGrid(gameDifficulty);
    return {
      grid: puzzle,
      initialGrid: puzzle.map(row => [...row]), // Deep copy for initial state
      solution: solution
    };
  });
  
  const [grid, setGrid] = useState<(number | null)[][]>(gameState.grid);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>(gameState.initialGrid);
  const [solutionGrid] = useState<number[][]>(gameState.solution);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [userWon, setUserWon] = useState(false);
  
  // Bot state
  const [botGrid, setBotGrid] = useState<(number | null)[][]>(gameState.grid.map(row => [...row]));
  const [botProgress, setBotProgress] = useState(0);
  const [userProgress, setUserProgress] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Calculate total empty cells
  const totalEmptyCells = initialGrid.flat().filter(cell => cell === null).length;

  // Use refs to track intervals for proper cleanup
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameEndHandledRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup all intervals on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameFinished) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameFinished]);

  // Keyboard input effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedCell || gameFinished) return;

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
  }, [selectedCell, grid, initialGrid, difficulty, gameFinished]);

  // Bot AI - fills cells at competitive intervals
  useEffect(() => {
    if (gameFinished) {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
      return;
    }

    // Bot speed - milliseconds per cell fill (faster = more competitive)
    const botSpeedMap = {
      'Easy': 1500,     // Fills a cell every 1.5 seconds
      'Medium': 2500,   // Fills a cell every 2.5 seconds
      'Hard': 3500,     // Fills a cell every 3.5 seconds
      'Expert': 4500    // Fills a cell every 4.5 seconds
    };

    const baseInterval = botSpeedMap[difficulty];
    
    botIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      
      setBotGrid(prevGrid => {
        if (!isMountedRef.current) return prevGrid;
        
        // Find all empty cells in bot's grid (cells that are null AND were null in initial grid)
        const emptyCells: [number, number][] = [];
        prevGrid.forEach((row, i) => {
          row.forEach((cell, j) => {
            if (cell === null && initialGrid[i][j] === null) {
              emptyCells.push([i, j]);
            }
          });
        });

        if (emptyCells.length === 0) {
          // Bot finished!
          if (isMountedRef.current) {
            setGameFinished(true);
            setUserWon(false);
          }
          return prevGrid;
        }

        // Pick a random empty cell and fill it
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        
        const newGrid = prevGrid.map(r => [...r]);
        const maxNum = getMaxNumber(difficulty);
        newGrid[row][col] = Math.floor(Math.random() * maxNum) + 1;
        
        // Update bot progress - count only cells filled by bot (not initial clues)
        const botFilledCells = totalEmptyCells - emptyCells.length + 1;
        const progress = Math.min(Math.max((botFilledCells / totalEmptyCells) * 100, 0), 100);
        if (isMountedRef.current) {
          setBotProgress(progress);
        }
        
        return newGrid;
      });
    }, baseInterval);

    return () => {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
    };
  }, [difficulty, gameFinished, totalEmptyCells, initialGrid]);

  // Handle game end when bot finishes or user wins
  useEffect(() => {
    if (gameFinished && !gameEndHandledRef.current) {
      gameEndHandledRef.current = true;
      handleGameEnd(userWon);
    }
  }, [gameFinished, userWon]);

  // Update user progress
  useEffect(() => {
    const filledCells = grid.flat().filter((cell, idx) => {
      const row = Math.floor(idx / grid.length);
      const col = idx % grid.length;
      return cell !== null && initialGrid[row][col] === null;
    }).length;
    
    const progress = Math.min(Math.max((filledCells / totalEmptyCells) * 100, 0), 100);
    setUserProgress(progress);
  }, [grid, initialGrid, totalEmptyCells]);

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

  const handleCellClick = (row: number, col: number) => {
    if (gameFinished) return;
    if (initialGrid[row][col] === null) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberInput = (number: number) => {
    if (selectedCell && !gameFinished) {
      const [row, col] = selectedCell;
      const newGrid = [...grid];
      newGrid[row][col] = number === 0 ? null : number;
      setGrid(newGrid);
      setSelectedCell(null);

      // Check if user completed the puzzle
      const allFilled = newGrid.every(row => row.every(cell => cell !== null));
      if (allFilled && !gameFinished) {
        // Validate the solution is correct
        const isCorrect = isValidSolution(newGrid);
        if (isCorrect) {
          setGameFinished(true);
          setUserWon(true);
        }
        // If incorrect, do nothing - let user continue playing
      }
    }
  };

  const handleGameEnd = (playerWon: boolean) => {
    if (!isMountedRef.current) return;
    
    // Award XP based on difficulty
    const xpRewards = {
      'Easy': 50,
      'Medium': 100,
      'Hard': 200,
      'Expert': 500,
    };
    
    const baseXP = xpRewards[difficulty];
    const totalXP = playerWon ? baseXP : Math.floor(baseXP / 4); // Quarter XP for loss
    
    setEarnedXP(totalXP);
    
    if (currentUser) {
      const newXP = currentUser.xp + totalXP;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newSolved = playerWon ? currentUser.solvedPuzzles + 1 : currentUser.solvedPuzzles;
      
      updateCurrentUser({
        xp: newXP,
        level: newLevel,
        solvedPuzzles: newSolved,
        averageTime: formatTime(timer),
      });
    }
    
    if (isMountedRef.current) {
      setShowCompletionDialog(true);
    }
  };

  const handleNewGame = () => {
    const { puzzle } = generateSudokuGrid(difficulty);
    const newInitialGrid = puzzle.map(row => [...row]);
    setGrid(puzzle);
    setInitialGrid(newInitialGrid);
    setBotGrid(puzzle.map(row => [...row]));
    setTimer(0);
    setSelectedCell(null);
    setShowCompletionDialog(false);
    setGameFinished(false);
    setBotProgress(0);
    setUserProgress(0);
    setUserWon(false);
    gameEndHandledRef.current = false;
  };

  const handleForfeit = () => {
    setShowForfeitDialog(false);
    setGameFinished(true);
    setUserWon(false);
  };

  const currentBoardStyle = boardStyles.find(s => s.id === boardStyle) || boardStyles[0];
  const gridSize = grid.length;

  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        {/* Header with VS banner */}
        <div className="bg-background border-b px-4 py-3 md:py-4 space-y-3 md:space-y-4">
          {/* VS Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-red-500/10 border border-primary/20 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white dark:border-gray-800">
                  <AvatarFallback 
                    className="text-white text-sm md:text-base"
                    style={{ backgroundColor: currentUser?.profileColor || '#6366f1' }}
                  >
                    {currentUser?.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium md:text-lg">{currentUser?.username}</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-background/80 rounded-full">
                <span className="text-sm md:text-base font-medium">VS</span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-medium md:text-lg">AI Bot</span>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-2 md:space-y-3">
            {/* User Progress */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="flex items-center gap-1.5 md:gap-2">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  You
                </span>
                <span className="font-medium">{Math.round(userProgress)}%</span>
              </div>
              <Progress value={userProgress} className="h-2 md:h-3" />
            </div>

            {/* Bot Progress */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="flex items-center gap-1.5 md:gap-2">
                  <Bot className="h-3 w-3 md:h-4 md:w-4" />
                  AI Bot
                </span>
                <span className="font-medium">{Math.round(botProgress)}%</span>
              </div>
              <Progress value={botProgress} className="h-2 md:h-3 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500" />
            </div>
          </div>
          
          {/* Timer, Difficulty, and Forfeit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-lg md:text-xl">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getDifficultyColor(difficulty)} md:text-base md:px-3 md:py-1`}>
                {difficulty}
              </Badge>
              {!gameFinished && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowForfeitDialog(true)}
                  className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3"
                >
                  <Flag className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Forfeit
                </Button>
              )}
            </div>
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
                          ${isInitialCell ? `bg-muted/60 font-bold text-foreground cursor-not-allowed border-2 md:border-4 ${currentBoardStyle.cellBorder}` : 'bg-card font-normal'}
                          ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex 
                            ? `ring-2 md:ring-4 ring-inset ${currentBoardStyle.selectedCellBorder.replace('border-', 'ring-')} bg-primary/10`
                            : ''
                          }
                          ${isUserFilled ? 'text-primary' : ''}
                          ${!isInitialCell && !gameFinished ? 'hover:bg-muted/30 cursor-pointer' : ''}
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
                disabled={!selectedCell || gameFinished}
                className="aspect-square text-base md:text-xl lg:text-2xl h-12 md:h-16 lg:h-20"
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedCell && handleNumberInput(0)}
              disabled={!selectedCell || gameFinished}
              className="aspect-square text-base md:text-xl lg:text-2xl h-12 md:h-16 lg:h-20"
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {userWon ? (
                <div className="flex flex-col items-center gap-2">
                  <Trophy className="h-12 w-12 text-yellow-500 animate-bounce" />
                  <span>Victory!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Bot className="h-12 w-12 text-red-500" />
                  <span>Bot Wins!</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="text-center">
              {userWon ? "You beat the AI bot!" : "The bot finished first!"}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-lg">
                {userWon ? "You beat the AI bot!" : "The bot finished first!"}
              </p>
              <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Time:</span>
                  <span className="font-medium">{formatTime(timer)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Difficulty:</span>
                  <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span>XP Earned:</span>
                  <span className="font-bold text-primary">+{earnedXP} XP</span>
                </div>
                {!userWon && (
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    You earned 25% XP. Win to get full rewards!
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  // Clear intervals immediately before navigating
                  if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                  }
                  if (botIntervalRef.current) {
                    clearInterval(botIntervalRef.current);
                    botIntervalRef.current = null;
                  }
                  setShowCompletionDialog(false);
                  // Use setTimeout to ensure state updates complete
                  setTimeout(() => onNavigate('play'), 0);
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button 
                className="flex-1"
                onClick={handleNewGame}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forfeit Confirmation Dialog */}
      <AlertDialog open={showForfeitDialog} onOpenChange={setShowForfeitDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Forfeit Match?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to forfeit? You'll only earn 25% of the XP for this difficulty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Playing</AlertDialogCancel>
            <AlertDialogAction onClick={handleForfeit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Forfeit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
