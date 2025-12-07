import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { PageWrapper } from "./PageWrapper";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useUser } from "../contexts/UserContext";
import { getAllUsers, getFriends } from "../lib/hybridAccountManager";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

type LeaderboardEntry = {
  rank: number;
  id: string;
  username: string;
  xp: number;
  level: number;
  solvedPuzzles: number;
  averageTime: string;
  profileColor?: string;
  profilePicture?: string;
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm text-muted-foreground">#{rank}</span>;
}

const LeaderboardSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

type LeaderboardPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function LeaderboardPage({ onNavigate, currentPage }: LeaderboardPageProps) {
  const { currentUser } = useUser();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboards = async () => {
      setLoading(true);
      try {
        // Get all users and sort by XP
        const allUsers = await getAllUsers();
        const sortedUsers = allUsers
          .sort((a, b) => b.xp - a.xp)
          .map((user, index) => ({
            rank: index + 1,
            id: user.id,
            username: user.username,
            xp: user.xp,
            level: user.level,
            solvedPuzzles: user.solvedPuzzles,
            averageTime: user.averageTime,
            profileColor: user.profileColor,
            profilePicture: user.profilePicture,
          }));
        
        setGlobalLeaderboard(sortedUsers);

        // Get friends leaderboard
        if (currentUser) {
          const friends = await getFriends(currentUser.id);
          const friendsList = [currentUser, ...friends]
            .sort((a, b) => b.xp - a.xp)
            .map((user, index) => ({
              rank: index + 1,
              id: user.id,
              username: user.username,
              xp: user.xp,
              level: user.level,
              solvedPuzzles: user.solvedPuzzles,
              averageTime: user.averageTime,
              profileColor: user.profileColor,
              profilePicture: user.profilePicture,
            }));
          
          setFriendsLeaderboard(friendsList);
        }
      } catch (error) {
        console.error('Failed to load leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboards();
  }, [currentUser]);

  const renderLeaderboard = (data: LeaderboardEntry[], type: 'global' | 'friends') => {
    if (loading) {
      return <LeaderboardSkeleton />;
    }

    if (data.length === 0) {
      if (type === 'friends') {
        return (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg">No Friends on Leaderboard</h3>
              <p className="text-muted-foreground text-sm">Add friends to see how you stack up against them.</p>
              <Button onClick={() => onNavigate('friends')}>Add Friends</Button>
            </div>
          </Card>
        );
      }
      return (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg">Leaderboard is Empty</h3>
            <p className="text-muted-foreground text-sm">Play some games to get on the board!</p>
          </div>
        </Card>
      );
    }

    return data.map((entry) => {
      const isCurrentUser = currentUser?.id === entry.id;
      return (
        <Card 
          key={entry.id} 
          className={`p-3 ${isCurrentUser ? "border-2 border-primary" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>
            
            <Avatar className="h-10 w-10">
              {entry.profilePicture && <AvatarImage src={entry.profilePicture} alt={entry.username} />}
              <AvatarFallback 
                className="text-white"
                style={{ backgroundColor: entry.profileColor || '#6366f1' }}
              >
                {entry.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={isCurrentUser ? "font-medium" : ""}>
                  {entry.username} {isCurrentUser && "(You)"}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Lv {entry.level}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⭐ {entry.xp.toLocaleString()} XP</span>
                <span>✓ {entry.solvedPuzzles}</span>
                <span>⏱️ {entry.averageTime}</span>
              </div>
            </div>
          </div>
        </Card>
      );
    });
  };

  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
        <h1 className="text-xl">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Compete with the best</p>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mx-auto max-w-sm sticky top-0 bg-background">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="p-4 space-y-2">
            {renderLeaderboard(globalLeaderboard, 'global')}
          </TabsContent>

          <TabsContent value="friends" className="p-4 space-y-2">
            {renderLeaderboard(friendsLeaderboard, 'friends')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageWrapper>
  );
}
