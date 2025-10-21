import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { createPuzzle } from "../lib/accountManager";
import { toast } from "sonner";

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

type CreatePageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function CreatePage({ onNavigate, currentPage }: CreatePageProps) {
  const { currentUser } = useUser();
  const [grid, setGrid] = useState<(number | null)[][]>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [puzzleDescription, setPuzzleDescription] = useState('');

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (number: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = number;
      setGrid(newGrid);
      setSelectedCell(null);
    }
  };

  const clearCell = () => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = null;
      setGrid(newGrid);
    }
  };

  const clearGrid = () => {
    setGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
    setSelectedCell(null);
  };

  const handlePublish = () => {
    if (!currentUser) return;
    
    if (!puzzleTitle.trim()) {
      toast.error('Please enter a puzzle title');
      return;
    }

    // Check if grid has at least some numbers
    const filledCells = grid.flat().filter(cell => cell !== null).length;
    if (filledCells < 17) {
      toast.error('Please fill at least 17 cells for a valid Sudoku puzzle');
      return;
    }

    // Create the puzzle
    createPuzzle(currentUser.id, puzzleTitle, difficulty, grid);
    
    toast.success('Puzzle published successfully!');
    
    // Reset form
    setGrid(Array(9).fill(null).map(() => Array(9).fill(null)));
    setPuzzleTitle('');
    setPuzzleDescription('');
    setSelectedCell(null);
    
    // Navigate to explore
    onNavigate('explore');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
        <h1 className="text-xl">Create Puzzle</h1>
        <p className="text-sm text-muted-foreground">Design your own Sudoku</p>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Puzzle Info */}
          <Card className="p-4 space-y-3">
            <div>
              <Label htmlFor="title">Puzzle Title</Label>
              <Input
                id="title"
                placeholder="Enter a catchy title..."
                value={puzzleTitle}
                onChange={(e) => setPuzzleTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description or hint..."
                value={puzzleDescription}
                onChange={(e) => setPuzzleDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Difficulty selector */}
            <div>
              <Label>Difficulty</Label>
              <div className="flex gap-2 mt-2">
                {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficulty(diff)}
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Sudoku grid */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label>Puzzle Grid</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearGrid}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Grid
              </Button>
            </div>
            
            <div className="bg-foreground p-2 rounded-lg">
              <div className="grid grid-cols-9 gap-0">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        w-8 h-8 bg-background border border-border flex items-center justify-center text-sm
                        ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex 
                          ? 'bg-blue-100 border-blue-500' 
                          : ''
                        }
                        ${cell !== null ? 'font-medium' : 'hover:bg-gray-50'}
                        ${colIndex % 3 === 2 && colIndex < 8 ? 'border-r-2 border-r-foreground' : ''}
                        ${rowIndex % 3 === 2 && rowIndex < 8 ? 'border-b-2 border-b-foreground' : ''}
                      `}
                    >
                      {cell || ''}
                    </button>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Number input pad */}
          <Card className="p-4">
            <Label className="mb-2 block">Number Pad</Label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  onClick={() => handleNumberInput(number)}
                  disabled={!selectedCell}
                  className="aspect-square"
                >
                  {number}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={clearCell}
                disabled={!selectedCell}
                className="aspect-square"
              >
                ✖
              </Button>
            </div>
          </Card>

          {/* Publish button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handlePublish}
            disabled={!puzzleTitle}
          >
            <Plus className="h-5 w-5 mr-2" />
            Publish Puzzle
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />
    </div>
  );
}

