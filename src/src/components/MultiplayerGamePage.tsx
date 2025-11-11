import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { PageWrapper } from "./PageWrapper";
import { Trophy, Medal, Home, RotateCcw, Flag, Timer, User } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUser } from "../contexts/UserContext";
import { getRoom, leaveRoom, MultiplayerRoom } from "../lib/hybridAccountManager";
import { socket } from "../lib/socket";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { boardStyles } from "./BoardCustomization";
import { XPProgress } from "./XPProgress";

type MultiplayerGamePageProps = {
  onNavigate: (page: string, options?: any) => void;
  currentPage: string;
  roomId: string;
  boardStyle?: string;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getMaxNumber(difficulty: string): number {
  switch (difficulty) {
    case 'Easy': return 4;
    case 'Medium': return 6;
    case 'Hard': return 9;
    case 'Expert': return 9;
    default: return 9;
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy': return 'bg-green-500 text-white';
    case 'Medium': return 'bg-yellow-500 text-white';
    case 'Hard': return 'bg-orange-500 text-white';
    case 'Expert': return 'bg-red-500 text-white';
    default: return 'bg-purple-500 text-white';
  }
}

export function MultiplayerGamePage({ onNavigate, currentPage, roomId, boardStyle = 'classic' }: MultiplayerGamePageProps) {
  const { currentUser, updateCurrentUser } = useUser();
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const gameEndHandledRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalEmptyCellsRef = useRef(0);

  // Effect to show the final completion dialog
  useEffect(() => {
    if (room?.status === 'finished' && !gameEndHandledRef.current) {
      gameEndHandledRef.current = true;
      const currentPlayerInRoom = room.players.find(p => p.userId === currentUser!.id);
      
      const xpRewards = { 'Easy': 250, 'Medium': 500, 'Hard': 750, 'Expert': 1000 };
      const baseXP = xpRewards[room.difficulty as keyof typeof xpRewards] || 500;
      
      let totalXP = 0;
      if (currentPlayerInRoom?.finished) {
        const placementBonus = Math.max(0, (room.players.length - (currentPlayerInRoom.placement || 1) + 1) * (baseXP / 10));
        totalXP = Math.floor(baseXP + placementBonus);
      } else {
        totalXP = Math.floor(baseXP / 4);
      }
      
      setEarnedXP(totalXP);
      if (currentUser) {
        updateCurrentUser({ xp: (currentUser.xp || 0) + totalXP });
      }
      setShowCompletionDialog(true);
    }
  }, [room, currentUser, updateCurrentUser]);

  // Initial data load and socket setup
  useEffect(() => {
    if (!currentUser) {
      onNavigate('play');
      return;
    }

    const setupGame = async () => {
      try {
        const loadedRoom = await getRoom(roomId);
        if (loadedRoom) {
          setRoom(loadedRoom);
          const playerGrid = loadedRoom.grids?.[currentUser.id] || loadedRoom.puzzle;
          setGrid(playerGrid.map(row => [...row]));
          setInitialGrid(loadedRoom.initialPuzzle.map(row => [...row]));
          totalEmptyCellsRef.current = loadedRoom.initialPuzzle.flat().filter(c => c === null).length;
          setLoading(false);
        }
      } catch (error) {
        toast.error("Failed to load game room.");
        onNavigate('challenge');
      }
    };

    setupGame();

    socket.connect();
    socket.emit('room:join', roomId);

    const onRoomUpdate = (updatedRoom: MultiplayerRoom) => setRoom(updatedRoom);
    const onGameProgress = ({ players }: { players: MultiplayerRoom['players'] }) => {
      setRoom(prevRoom => prevRoom ? { ...prevRoom, players } : null);
    };
    const onRematchCreated = ({ newRoomId }: { newRoomId: string }) => {
      toast.success("Rematch ready! Joining new lobby...");
      onNavigate('mplobby', { roomId: newRoomId });
    };

    socket.on('room:update', onRoomUpdate);
    socket.on('game:progress', onGameProgress);
    socket.on('rematch:created', onRematchCreated);

    return () => {
      socket.off('room:update', onRoomUpdate);
      socket.off('game:progress', onGameProgress);
      socket.off('rematch:created', onRematchCreated);
    };
  }, [roomId, currentUser, onNavigate]);

  // Timer effect
  useEffect(() => {
    if (loading || room?.status === 'finished') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [loading, room?.status]);

  // Keyboard input effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedCell) return;

      const [row, col] = selectedCell;
      const maxNumber = getMaxNumber(room?.difficulty || 'Easy');

      // Handle number input
      if (event.key >= '1' && event.key <= String(maxNumber)) {
        handleNumberInput(parseInt(event.key, 10));
        return;
      }

      // Handle deletion
      if (event.key === 'Backspace' || event.key === 'Delete') {
        handleNumberInput(null);
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
        // Find the next available cell for navigation
        let nextCell: [number, number] | null = null;
        const direction = {
            row: newRow - row,
            col: newCol - col,
        };

        let r = row + direction.row;
        let c = col + direction.col;

        while (r >= 0 && r < grid.length && c >= 0 && c < grid.length) {
            if (initialGrid[r][c] === null) {
                nextCell = [r, c];
                break;
            }
            r += direction.row;
            c += direction.col;
        }
        
        if (nextCell) {
            setSelectedCell(nextCell);
        } else {
            // If no cell in the direction is available, try wrapping around (simple case)
            if (initialGrid[newRow][newCol] === null) {
                setSelectedCell([newRow, newCol]);
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, grid, initialGrid, room?.difficulty]);

  const handleCellClick = (row: number, col: number) => {
    if (room?.status === 'finished' || initialGrid[row][col] !== null) return;
    const currentPlayer = room?.players.find(p => p.userId === currentUser?.id);
    if (currentPlayer?.finished) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (value: number | null) => {
    if (!selectedCell || room?.status === 'finished' || !currentUser) return;
    const currentPlayer = room?.players.find(p => p.userId === currentUser?.id);
    if (currentPlayer?.finished) return;
    
    const [row, col] = selectedCell;
    if (initialGrid[row][col] !== null) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value;
    setGrid(newGrid);

    // --- New Direct Logic ---
    // 1. Store the move on the server
    socket.emit('game:move', { roomId, userId: currentUser.id, row, col, value });

    // 2. Calculate progress locally
    const filledCells = newGrid.flat().filter((cell, idx) => {
      const r = Math.floor(idx / newGrid.length);
      const c = idx % newGrid.length;
      return cell !== null && initialGrid[r][c] === null;
    }).length;
    const progress = totalEmptyCellsRef.current > 0 ? Math.round((filledCells / totalEmptyCellsRef.current) * 100) : 0;

    // 3. Report progress to server
    socket.emit('game:progress_update', { roomId, userId: currentUser.id, progress });

    // 4. If board is full, ask server to validate
    if (totalEmptyCellsRef.current > 0 && filledCells === totalEmptyCellsRef.current) {
      socket.emit('game:validate_win', { roomId, userId: currentUser.id, time: timer });
    }
  };

  const handleForfeit = () => {
    if (room && currentUser) {
      leaveRoom(room.id, currentUser.id);
      toast.info("You forfeited the match");
      onNavigate('challenge');
    }
  };

  const handlePlayAgain = () => {
    if (room && currentUser) {
      socket.emit('room:play_again', { oldRoomId: room.id, user: currentUser });
    }
  };

  const currentBoardStyle = boardStyles.find(s => s.id === boardStyle) || boardStyles[0];

  if (loading || !room || !currentUser) {
    return (
      <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
        <div className="flex items-center justify-center h-screen"><p>Loading game...</p></div>
      </PageWrapper>
    );
  }

  const sortedPlayers = [...room.players].sort((a, b) => b.progress - a.progress);
  const currentPlayer = sortedPlayers.find(p => p.userId === currentUser.id);
  const maxNumber = getMaxNumber(room.difficulty);
  const playerIsFinished = currentPlayer?.finished === true;
  const isGameOver = room.status === 'finished';

  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-background border-b px-4 py-3 md:py-4 space-y-3 md:space-y-4">
          {/* Progress Bars */}
          <div className="space-y-2 md:space-y-3">
            {sortedPlayers.map(player => (
              <div key={player.userId} className="space-y-1 md:space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800">
                      <AvatarImage src={player.profilePicture} />
                      <AvatarFallback style={{ backgroundColor: player.profileColor || '#6366f1' }}>
                        {player.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {player.username}
                    {player.finished && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </span>
                  <span className="font-medium">{Math.round(player.progress)}%</span>
                </div>
                <Progress value={player.progress} className="h-2 md:h-3" />
              </div>
            ))}
          </div>
          
          {/* Timer, Difficulty, and Forfeit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-lg md:text-xl">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getDifficultyColor(room.difficulty)} md:text-base md:px-3 md:py-1`}>
                {room.difficulty}
              </Badge>
              {!isGameOver && !playerIsFinished && (
                <Button variant="outline" size="sm" onClick={() => setShowForfeitDialog(true)} className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
                  <Flag className="h-3 w-3 md:h-4 md:w-4 mr-1" /> Forfeit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Game content */}
        <div className="flex-1 p-4 pb-20 md:pb-4 flex flex-col items-center justify-center relative">
          {/* Waiting Overlay */}
          {playerIsFinished && !isGameOver && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold">You've finished!</h2>
              <p className="text-muted-foreground">Waiting for other players to complete the puzzle...</p>
            </div>
          )}

          {/* Sudoku Grid */}
          <div className="p-2 md:p-4 rounded-lg mb-4 md:mb-6 mx-auto bg-card/50 backdrop-blur-sm transition-shadow duration-300" style={{ boxShadow: `0 0 30px ${currentBoardStyle.glowColor}, 0 0 60px ${currentBoardStyle.glowColor}, 0 0 90px ${currentBoardStyle.glowColor}` }}>
            <div className={`border-2 md:border-4 ${currentBoardStyle.thickBorder} rounded-sm overflow-hidden`}>
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}>
                {grid.map((row, rowIndex) => row.map((cell, colIndex) => {
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
                    <button key={`${rowIndex}-${colIndex}`} onClick={() => handleCellClick(rowIndex, colIndex)} disabled={isInitialCell || isGameOver || playerIsFinished} className={`
                      ${gridSize === 4 ? 'w-12 h-12 md:w-20 md:h-20' : gridSize === 6 ? 'w-10 h-10 md:w-16 md:h-16' : 'w-8 h-8 md:w-14 md:h-14'}
                      flex items-center justify-center transition-colors text-base md:text-2xl
                      ${isInitialCell ? `bg-muted/60 font-bold text-foreground cursor-not-allowed border-2 md:border-4 ${currentBoardStyle.cellBorder}` : 'bg-card font-normal'}
                      ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex ? `ring-2 md:ring-4 ring-inset ${currentBoardStyle.selectedCellBorder.replace('border-', 'ring-')} bg-primary/10` : ''}
                      ${isUserFilled ? 'text-primary' : ''}
                      ${!isInitialCell ? 'hover:bg-muted/30 cursor-pointer' : ''}
                      ${isGameOver || playerIsFinished ? 'opacity-70' : ''}
                      ${needsRightBorder ? (needsThickRightBorder ? `border-r-2 md:border-r-4 ${currentBoardStyle.thickBorder}` : `border-r md:border-r-2 ${currentBoardStyle.cellBorder}`) : ''}
                      ${needsBottomBorder ? (needsThickBottomBorder ? `border-b-2 md:border-b-4 ${currentBoardStyle.thickBorder}` : `border-b md:border-b-2 ${currentBoardStyle.cellBorder}`) : ''}
                    `}>
                      {cell || ''}
                    </button>
                  );
                }))}
              </div>
            </div>
          </div>

          {/* Number Input Pad */}
          {!isGameOver && !playerIsFinished && (
            <div className="grid grid-cols-5 gap-2 md:gap-3 max-w-md md:max-w-2xl mx-auto w-full">
              {Array.from({ length: maxNumber }, (_, i) => i + 1).map((number) => (
                <Button key={number} variant="outline" size="sm" onClick={() => handleNumberInput(number)} disabled={!selectedCell} className="aspect-square text-base md:text-xl h-12 md:h-16">
                  {number}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleNumberInput(null)} disabled={!selectedCell} className="aspect-square text-base md:text-xl h-12 md:h-16">
                ✕
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Forfeit Confirmation Dialog */}
      <AlertDialog open={showForfeitDialog} onOpenChange={setShowForfeitDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Forfeit Match?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to forfeit? This will count as a loss and you will only receive a quarter of the XP.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Playing</AlertDialogCancel>
            <AlertDialogAction onClick={handleForfeit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Forfeit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {currentPlayer?.placement === 1 ? (
                <div className="flex flex-col items-center gap-2"><Trophy className="h-12 w-12 text-yellow-500 animate-bounce" /><span>Victory!</span></div>
              ) : (
                <div className="flex flex-col items-center gap-2"><Medal className="h-12 w-12 text-slate-400" /><span>#{currentPlayer?.placement}</span></div>
              )}
            </DialogTitle>
            <DialogDescription className="text-center">
              {currentPlayer?.placement === 1 ? "You finished first!" : `You finished #${currentPlayer?.placement}. Better luck next time!`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-lg text-center">
              <p className="text-3xl mb-1">+{earnedXP} XP</p>
              <p className="text-sm text-muted-foreground">Time: {formatTime(currentPlayer?.timeFinished || timer)}</p>
            </div>
            {currentUser && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">Level Progress</p>
                <XPProgress currentXP={currentUser.xp} currentLevel={currentUser.level} showLabel={true} size="md" animate={true} />
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCompletionDialog(false); onNavigate('challenge'); }}>
                <Home className="h-4 w-4 mr-2" /> Home
              </Button>
              <Button className="flex-1" onClick={handlePlayAgain}>
                <RotateCcw className="h-4 w-4 mr-2" /> 
                Play Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}