import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { Heart, MessageCircle, Share, Trophy } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { getAllPuzzles, togglePuzzleLike, getUserById } from "../lib/accountManager";



function SudokuGridPreview({ grid }: { grid: number[][] }) {
  return (
    <div className="grid grid-cols-9 gap-0 bg-foreground p-1 rounded-lg aspect-square">
      {grid.flat().map((cell, index) => (
        <div 
          key={index}
          className="bg-background flex items-center justify-center text-xs border border-border aspect-square"
        >
          {cell !== 0 ? cell : ''}
        </div>
      ))}
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Hard': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

type ExplorePageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function ExplorePage({ onNavigate, currentPage }: ExplorePageProps) {
  const { currentUser } = useUser();
  const [puzzles, setPuzzles] = useState(getAllPuzzles());

  useEffect(() => {
    // Refresh puzzles when component mounts
    setPuzzles(getAllPuzzles());
  }, []);

  const handleToggleLike = (puzzleId: string) => {
    if (currentUser) {
      togglePuzzleLike(puzzleId, currentUser.id);
      setPuzzles(getAllPuzzles());
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
        <h1 className="text-xl">Explore</h1>
        <p className="text-sm text-muted-foreground">Top puzzles from the community</p>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <div className="grid grid-cols-1 gap-4 p-4">
          {puzzles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No puzzles yet. Be the first to create one!</p>
            </Card>
          ) : (
            puzzles.map((puzzle) => {
              const creator = getUserById(puzzle.creatorId);
              const isLiked = currentUser ? puzzle.likes.includes(currentUser.id) : false;
              
              return (
                <Card key={puzzle.id} className="p-4">
                  {/* Header with creator info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{creator?.username[0].toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{creator?.username || 'Anonymous'}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getDifficultyColor(puzzle.difficulty)}`}
                        >
                          {puzzle.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">⏱️ {puzzle.timeToSolve}</span>
                      </div>
                    </div>
                  </div>

                  {/* Puzzle grid */}
                  <div className="mb-3">
                    <h3 className="mb-2">{puzzle.title}</h3>
                    <SudokuGridPreview grid={puzzle.grid} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleToggleLike(puzzle.id)}
                        className="flex items-center gap-1 text-sm"
                      >
                        <Heart 
                          className={`h-5 w-5 ${
                            isLiked
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-600'
                          }`} 
                        />
                        <span>{puzzle.likes.length}</span>
                      </button>
                      
                      <button className="flex items-center gap-1 text-sm text-gray-600">
                        <MessageCircle className="h-5 w-5" />
                        <span>{puzzle.comments}</span>
                      </button>
                      
                      <button className="text-gray-600">
                        <Share className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <button 
                      className="bg-primary text-primary-foreground px-4 py-1 rounded-md text-sm"
                      onClick={() => onNavigate('game')}
                    >
                      Play
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />
    </div>
  );
}

