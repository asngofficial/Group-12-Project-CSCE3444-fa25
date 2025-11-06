import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { Play, Zap, Target, Flame, Trophy, HelpCircle } from "lucide-react";

type Difficulty = {
  id: string;
  name: string;
  description: string;
  xpReward: string;
  color: string;
  icon: string;
  estimatedTime: string;
};

const difficulties: Difficulty[] = [
  {
    id: 'Easy',
    name: 'Easy',
    description: 'Perfect for beginners',
    xpReward: '+50 XP',
    color: 'from-green-500 to-green-600',
    icon: '🌱',
    estimatedTime: '5-10 min'
  },
  {
    id: 'Medium',
    name: 'Medium',
    description: 'A balanced challenge',
    xpReward: '+100 XP',
    color: 'from-yellow-500 to-yellow-600',
    icon: '⚡',
    estimatedTime: '10-15 min'
  },
  {
    id: 'Expert',
    name: 'Expert',
    description: 'Only for masters',
    xpReward: '+200 XP',
    color: 'from-orange-500 to-orange-600',
    icon: '🔥',
    estimatedTime: '15-25 min'
  },
  {
    id: 'Expert',
    name: 'Expert',
    description: 'Only for masters',
    xpReward: '+500 XP',
    color: 'from-red-500 to-red-600',
    icon: '💎',
    estimatedTime: '25-40 min'
  }
];

type PlayPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  onStartGame?: (difficulty: string) => void;
};

export function PlayPage({ onNavigate, currentPage, onStartGame }: PlayPageProps) {
  const handlePlayClick = (difficultyId: string) => {
    if (onStartGame) {
      onStartGame(difficultyId);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl">Play Sudoku</h1>
          <p className="text-sm text-muted-foreground">Choose your challenge level</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('tutorial')}
            className="p-2 hover:bg-accent rounded-md"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onNavigate('leaderboard')}
            className="p-2 hover:bg-accent rounded-md"
          >
            <Trophy className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <div className="p-4 space-y-4">
          {/* XP Info Banner */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Earn More XP!</p>
                <p className="text-sm text-muted-foreground">
                  Harder puzzles = More XP rewards
                </p>
              </div>
            </div>
          </Card>

          {/* Difficulty Cards */}
          <div className="space-y-3">
            {difficulties.map((difficulty) => (
              <Card 
                key={difficulty.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${difficulty.color} p-4 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{difficulty.icon}</span>
                      <h3 className="text-xl">{difficulty.name}</h3>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {difficulty.xpReward}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/90">{difficulty.description}</p>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{difficulty.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handlePlayClick(difficulty.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Daily Challenge Section */}
          <Card className="p-4 border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3>Daily Challenge</h3>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    +750 XP
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete today's special puzzle for bonus XP!
                </p>
              </div>
            </div>
            
            <Button className="w-full bg-gradient-to-r from-primary to-purple-600">
              <Flame className="h-4 w-4 mr-2" />
              Try Daily Challenge
            </Button>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />
    </div>
  );
}

