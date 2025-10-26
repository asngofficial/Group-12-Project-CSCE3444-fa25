import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { Lightbulb, Timer, User, CheckCircle } from "lucide-react";
import { boardStyles } from "./BoardCustomization";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

import { generateCompleteSudoku, createSudokuPuzzle, isSudokuSolved } from "../lib/sudoku";

type Difficulty = 'Easy' | 'Medium' | 'Expert';

// Generate a sample sudoku grid with some filled cells
function generateGameGrid(difficulty: Difficulty): (number | null)[][] {
  const completeBoard = generateCompleteSudoku();
  const puzzle = createSudokuPuzzle(completeBoard, difficulty);
  return puzzle;
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
    case 'Expert': return 'bg-red-500 text-white';
  }
}

type GamePageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  boardStyle?: string;
  difficulty: string;
};

export function GamePage({ onNavigate, currentPage, boardStyle = 'classic', difficulty }: GamePageProps) {
  const { currentUser, updateCurrentUser } = useUser();
  const [grid, setGrid] = useState<(number | null)[][]>(() => generateGameGrid(difficulty as Difficulty));
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>(grid);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setTimerId(interval);
    
    return () => clearInterval(interval);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] === null) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberInput = (number: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      if (initialGrid[row][col] !== null) {
        return;
      }
      const newGrid = [...grid];
      newGrid[row][col] = number === 0 ? null : number;
      setGrid(newGrid);
      setSelectedCell(null);

      // Check if puzzle is complete
      checkPuzzleComplete(newGrid);
    }
  };

  const checkPuzzleComplete = (currentGrid: (number | null)[][]) => {
    // Check if all cells are filled
    const allFilled = currentGrid.every(row => row.every(cell => cell !== null));

    if (allFilled) {
      const isSolved = isSudokuSolved(currentGrid);

      if (isSolved) {
        // Award XP based on difficulty
        const xpRewards = {
          'Easy': 50,
          'Medium': 100,
          'Expert': 200,
        };

        const baseXP = xpRewards[difficulty];
        const timeBonus = timer < 300 ? 50 : 0; // Bonus for completing under 5 minutes
        const hintPenalty = hintsUsed * 10;
        const totalXP = Math.max(baseXP + timeBonus - hintPenalty, 10);

        setEarnedXP(totalXP);

        if (currentUser) {
          const newXP = currentUser.xp + totalXP;
          const newLevel = Math.floor(newXP / 1000) + 1;
          const newSolved = currentUser.solvedPuzzles + 1;

          updateCurrentUser({
            xp: newXP,
            level: newLevel,
            solvedPuzzles: newSolved,
            averageTime: formatTime(timer),
          });
        }

        if (timerId) {
          clearInterval(timerId);
        }

        setShowCompletionDialog(true);
      } else {
        toast.error("It seems there are some mistakes. Keep trying!");
      }
    }
  };

  const handleHint = () => {
    if (selectedCell && hintsUsed < 3) {
      setHintsUsed(prev => prev + 1);
      // Mock hint - just fill the selected cell with a random valid number
      const [row, col] = selectedCell;
      const newGrid = [...grid];
      newGrid[row][col] = Math.floor(Math.random() * 9) + 1;
      setGrid(newGrid);
      setSelectedCell(null);
    }
  };

  const currentBoardStyle = boardStyles.find(s => s.id === boardStyle) || boardStyles[0];

  return (
    <div className="flex flex-col h-screen">
      {/* Header with game info */}
      <div className="bg-background border-b px-4 py-3 space-y-3">
        {/* Timer and stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-lg">{formatTime(timer)}</span>
          </div>
          {currentUser && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">Level {currentUser.level}</Badge>
              <span className="text-muted-foreground">{currentUser.xp.toLocaleString()} XP</span>
            </div>
          )}
        </div>
        </div>
      <div className="flex-1 p-4 pb-20 flex flex-col">
        {/* Sudoku grid */}
        <div className={`${currentBoardStyle.gridBg} p-2 rounded-lg mb-4 mx-auto`}>
          <div className="grid grid-cols-9 gap-0">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isPreFilled = initialGrid[rowIndex][colIndex] !== null;
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                    w-8 h-8 ${currentBoardStyle.cellBg} border ${currentBoardStyle.cellBorder} flex items-center justify-center text-sm
                    ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex 
                      ? currentBoardStyle.selectedCellBg
                      : ''
                    }
                    ${isPreFilled ? 'bg-gray-300 text-black font-bold cursor-not-allowed' : 'text-blue-600'}
                    ${isPreFilled ? '' : 'hover:opacity-80'}
                    ${colIndex % 3 === 2 && colIndex < 8 ? `border-r-2 ${currentBoardStyle.thickBorder}` : ''}
                    ${rowIndex % 3 === 2 && rowIndex < 8 ? `border-b-2 ${currentBoardStyle.thickBorder}` : ''}
                  `}
                >
                  {cell === null ? '' : cell}
                </button>
              );
            }))}
          </div>
        </div>

        {/* Number input pad */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              variant="outline"
              size="sm"
              onClick={() => handleNumberInput(number)}
              disabled={!selectedCell}
              className="aspect-square"
            >
              {number}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedCell && handleNumberInput(0)}
            disabled={!selectedCell}
            className="aspect-square"
          >
            ✖
          </Button>
        </div>

        {/* Hint button */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={handleHint}
            disabled={!selectedCell || hintsUsed >= 3}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Hint ({3 - hintsUsed} left)
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />

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
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Progress</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge>Level {currentUser.level}</Badge>
                  <span className="text-sm">{currentUser.xp.toLocaleString()} XP</span>
                </div>
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
                Back to Explore
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setShowCompletionDialog(false);
                  setGrid(newPuzzle);
                  setInitialGrid(newPuzzle);
                  setTimer(0);
                  setHintsUsed(0);
                  setSelectedCell(null);
                }}
              >
                Play Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

