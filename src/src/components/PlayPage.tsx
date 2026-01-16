import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PageWrapper } from "./PageWrapper";
import { Play, Zap, Target, Flame, Trophy, Sprout, Gem, Calendar, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getTodayDateString } from "../utils/sudokuGenerator";
import { toast } from "sonner";
import { XPProgress } from "./XPProgress";
import { useUser } from "../contexts/UserContext";
import { useDeviceType } from "../hooks/useDeviceType";

type Difficulty = {
  id: string;
  name: string;
  description: string;
  xpReward: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: string;
};

const difficulties: Difficulty[] = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Perfect for beginners',
    xpReward: '+50 XP',
    color: 'from-green-500 to-green-600',
    icon: Sprout,
    estimatedTime: '5-10 min'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'A balanced challenge',
    xpReward: '+100 XP',
    color: 'from-yellow-500 to-yellow-600',
    icon: Zap,
    estimatedTime: '10-15 min'
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'For experienced players',
    xpReward: '+200 XP',
    color: 'from-orange-500 to-orange-600',
    icon: Flame,
    estimatedTime: '15-25 min'
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Only for masters',
    xpReward: '+500 XP',
    color: 'from-red-500 to-red-600',
    icon: Gem,
    estimatedTime: '25-40 min'
  }
];

type PlayPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  onStartGame?: (difficulty: string) => void;
};

export function PlayPage({ onNavigate, currentPage, onStartGame }: PlayPageProps) {
  const { currentUser } = useUser();
  const deviceType = useDeviceType();
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const hasNotifiedRef = useRef(false);
  
  useEffect(() => {
    // Check if today's daily challenge has been completed
    const todayDate = getTodayDateString();
    const completedDailies = JSON.parse(localStorage.getItem('completedDailies') || '{}');
    setDailyCompleted(!!completedDailies[todayDate]);
  }, []);

  useEffect(() => {
    // Update countdown timer every second
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const totalDayMs = 24 * 60 * 60 * 1000;
      const elapsed = totalDayMs - diff;
      const progress = (elapsed / totalDayMs) * 100;
      
      setProgressPercent(progress);
      
      if (diff <= 0) {
        // It's a new day! Reset the daily challenge
        const todayDate = getTodayDateString();
        const completedDailies = JSON.parse(localStorage.getItem('completedDailies') || '{}');
        const wasCompleted = dailyCompleted;
        const isStillCompleted = !!completedDailies[todayDate];
        
        setDailyCompleted(isStillCompleted);
        setTimeUntilNext('New puzzle available!');
        
        // Show notification only once when transitioning from completed to available
        if (wasCompleted && !isStillCompleted && !hasNotifiedRef.current) {
          toast.success('🎉 New Daily Challenge Available!', {
            description: 'A fresh puzzle is ready for you to solve. Earn 750 XP!',
            duration: 5000,
          });
          hasNotifiedRef.current = true;
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeUntilNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        hasNotifiedRef.current = false;
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [dailyCompleted]);

  const handlePlayClick = (difficultyId: string) => {
    if (onStartGame) {
      onStartGame(difficultyId);
    }
    onNavigate('game');
  };

  const handleDailyChallenge = () => {
    if (onStartGame) {
      // Pass 'daily' as a special difficulty flag
      onStartGame('daily');
    }
    onNavigate('game');
  };

  // Desktop Layout
  if (deviceType === 'desktop') {
    return (
      <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl">Play Sudoku</h1>
              <p className="text-sm text-muted-foreground">Choose your challenge level</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate('faq')}
                className="p-2 hover:bg-accent rounded-md transition-all hover:scale-105 active:scale-95"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => onNavigate('leaderboard')}
                className="p-2 hover:bg-accent rounded-md transition-all hover:scale-105 active:scale-95"
              >
                <Trophy className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Top Row: XP Progress and Info Banner */}
              <div className="grid grid-cols-2 gap-6">
                {/* XP Progress Card */}
                {currentUser && (
                  <Card className="p-6">
                    <XPProgress
                      currentXP={currentUser.xp}
                      currentLevel={currentUser.level}
                      showLabel={true}
                      size="lg"
                    />
                  </Card>
                )}

                {/* XP Info Banner */}
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                  <div className="flex items-center gap-4 h-full">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium">Earn More XP!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Harder puzzles = More XP rewards
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Difficulty Cards in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-6">
                {difficulties.map((difficulty) => (
                  <Card 
                    key={difficulty.id}
                    className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]"
                  >
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-r ${difficulty.color} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <difficulty.icon className="h-8 w-8" />
                          <h3 className="text-2xl">{difficulty.name}</h3>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                          {difficulty.xpReward}
                        </Badge>
                      </div>
                      <p className="text-white/90">{difficulty.description}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">{difficulty.estimatedTime}</span>
                      </div>

                      <Button 
                        className="w-full transition-all hover:scale-105 active:scale-95"
                        size="lg"
                        onClick={() => handlePlayClick(difficulty.id)}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Game
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Daily Challenge Section - Full Width */}
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]">
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${dailyCompleted ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {dailyCompleted ? (
                        <CheckCircle2 className="h-8 w-8 animate-in zoom-in duration-300" />
                      ) : (
                        <Calendar className="h-8 w-8" />
                      )}
                      <h3 className="text-2xl">Daily Challenge</h3>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                      {dailyCompleted ? 'Completed' : '+750 XP'}
                    </Badge>
                  </div>
                  <p className="text-white/90">
                    {dailyCompleted 
                      ? "Come back tomorrow for a new challenge!"
                      : "Expert difficulty - Same puzzle for everyone today!"}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {dailyCompleted ? "Next puzzle available in:" : "Time remaining today:"}
                    </p>
                    <div className="font-mono text-2xl bg-background/80 px-4 py-2 rounded-lg border-2 border-purple-500/30 text-purple-600 dark:text-purple-400 tracking-wider shadow-sm inline-block">
                      {timeUntilNext}
                    </div>
                  </div>

                  <Button 
                    className="w-full transition-all hover:scale-105 active:scale-95"
                    size="lg"
                    onClick={handleDailyChallenge}
                    disabled={dailyCompleted}
                  >
                    {dailyCompleted ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 mr-2" />
                        Try Daily Challenge
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Mobile Layout (Original)
  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl">Play Sudoku</h1>
          <p className="text-sm text-muted-foreground">Choose your challenge level</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('faq')}
            className="p-2 hover:bg-accent rounded-md transition-all hover:scale-105 active:scale-95"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onNavigate('leaderboard')}
            className="p-2 hover:bg-accent rounded-md transition-all hover:scale-105 active:scale-95"
          >
            <Trophy className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <div className="p-4 space-y-4">
          {/* XP Progress Card */}
          {currentUser && (
            <Card className="p-4">
              <XPProgress
                currentXP={currentUser.xp}
                currentLevel={currentUser.level}
                showLabel={true}
                size="md"
              />
            </Card>
          )}

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
                      <difficulty.icon className="h-6 w-6" />
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
                    className="w-full transition-all hover:scale-105 active:scale-95"
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
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${dailyCompleted ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'} p-4 text-white`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {dailyCompleted ? (
                    <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <Calendar className="h-6 w-6" />
                  )}
                  <h3 className="text-xl">Daily Challenge</h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {dailyCompleted ? 'Completed' : '+750 XP'}
                </Badge>
              </div>
              <p className="text-sm text-white/90">
                {dailyCompleted 
                  ? "Come back tomorrow!"
                  : "Expert - Everyone gets the same puzzle!"}
              </p>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {dailyCompleted ? "Next puzzle in:" : "Time left today:"}
                </p>
                <div className="font-mono bg-background/80 px-3 py-1.5 rounded border-2 border-purple-500/30 text-purple-600 dark:text-purple-400 tracking-wider shadow-sm inline-block">
                  {timeUntilNext}
                </div>
              </div>

              <Button 
                className="w-full transition-all hover:scale-105 active:scale-95"
                onClick={handleDailyChallenge}
                disabled={dailyCompleted}
              >
                {dailyCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Try Daily Challenge
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
}
