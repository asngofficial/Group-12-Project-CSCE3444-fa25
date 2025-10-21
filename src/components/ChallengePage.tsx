import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BottomNav } from "./BottomNav";
import { Swords, Trophy, Users } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { getAllUsers, getUserChallenges, createChallenge, getUserById, Challenge as ChallengeType } from "../lib/accountManager";
import { toast } from "sonner";



function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Hard': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusBadge(status: ChallengeType['status']) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'completed':
      return <Badge variant="outline">Completed</Badge>;
  }
}

type ChallengePageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function ChallengePage({ onNavigate, currentPage }: ChallengePageProps) {
  const { currentUser } = useUser();
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadChallenges();
    }
  }, [currentUser]);

  const loadChallenges = () => {
    if (currentUser) {
      const userChallenges = getUserChallenges(currentUser.id);
      setChallenges(userChallenges);
    }
  };

  const handleChallengeRandom = () => {
    if (!currentUser) return;

    // Get all users except current user
    const allUsers = getAllUsers().filter(u => u.id !== currentUser.id);
    
    if (allUsers.length === 0) {
      toast.error("No other players available");
      return;
    }

    // Select random opponent
    const randomOpponent = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    // Random difficulty
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    // Create challenge
    createChallenge(currentUser.id, randomOpponent.id, randomDifficulty);
    
    toast.success(`Challenge sent to ${randomOpponent.username}!`);
    loadChallenges();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl">Challenges</h1>
          <p className="text-sm text-muted-foreground">Battle friends and rivals</p>
        </div>
        <button 
          onClick={() => onNavigate('leaderboard')}
          className="p-2 hover:bg-accent rounded-md"
        >
          <Trophy className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        {/* New Challenge Button */}
        <div className="p-4">
          <Button className="w-full" size="lg" onClick={handleChallengeRandom}>
            <Users className="h-5 w-5 mr-2" />
            Challenge Random Player
          </Button>
        </div>

        {/* Challenges List */}
        <div className="px-4 space-y-3">
          {challenges.length === 0 ? (
            <Card className="p-8 text-center">
              <Swords className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="mb-2">No challenges yet</p>
              <p className="text-sm text-muted-foreground">
                Challenge a random player to start competing!
              </p>
            </Card>
          ) : (
            challenges.map((challenge) => {
              const opponent = getUserById(challenge.opponentId);
              return (
              <Card key={challenge.id} className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Swords className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">vs {opponent?.username || 'Unknown'}</p>
                        {getStatusBadge(challenge.status)}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mt-1 ${getDifficultyColor(challenge.difficulty)}`}
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                {challenge.status !== "pending" && challenge.yourScore !== undefined && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{currentUser?.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>You</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{challenge.yourScore} XP</span>
                        {challenge.status === "completed" && 
                         challenge.yourScore! > (challenge.opponentScore || 0) && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{opponent?.username[0].toUpperCase() || 'A'}</AvatarFallback>
                        </Avatar>
                        <span>{opponent?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{challenge.opponentScore || 0} XP</span>
                        {challenge.status === "completed" && 
                         (challenge.opponentScore || 0) > challenge.yourScore! && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Time and Action */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    ⏱️ {challenge.timeLimit}
                  </span>
                  
                  {challenge.status === "active" && (
                    <Button size="sm" onClick={() => onNavigate('game')}>
                      Continue
                    </Button>
                  )}
                  
                  {challenge.status === "pending" && (
                    <Button size="sm" variant="outline">
                      Waiting...
                    </Button>
                  )}
                  
                  {challenge.status === "completed" && (
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  )}
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

