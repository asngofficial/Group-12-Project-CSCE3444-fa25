import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { Trophy, Medal, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useUser } from "../contexts/UserContext";
import { getAllUsers, getFriends } from "../lib/accountManager";

type LeaderboardEntry = {
  rank: number;
  id: string;
  username: string;
  xp: number;
  level: number;
  solvedPuzzles: number;
  averageTime: string;
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm text-muted-foreground">#{rank}</span>;
}

type LeaderboardPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function LeaderboardPage({ onNavigate, currentPage }: LeaderboardPageProps) {
  const { currentUser } = useUser();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Get all users and sort by XP
    const allUsers = getAllUsers()
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({
        rank: index + 1,
        id: user.id,
        username: user.username,
        xp: user.xp,
        level: user.level,
        solvedPuzzles: user.solvedPuzzles,
        averageTime: user.averageTime,
      }));
    
    setGlobalLeaderboard(allUsers);

    // Get friends leaderboard
    if (currentUser) {
      const friends = getFriends(currentUser.id);
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
        }));
      
      setFriendsLeaderboard(friendsList);
    }
  }, [currentUser]);

  return (
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
            {globalLeaderboard.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No users yet</p>
              </Card>
            ) : (
              globalLeaderboard.map((entry) => {
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
                        <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
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
                          <span>✅ {entry.solvedPuzzles}</span>
                          <span>⏱️ {entry.averageTime}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="friends" className="p-4 space-y-2">
            {friendsLeaderboard.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No friends yet. Add friends to see them here!</p>
              </Card>
            ) : (
              friendsLeaderboard.map((entry) => {
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
                        <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
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
                          <span>✅ {entry.solvedPuzzles}</span>
                          <span>⏱️ {entry.averageTime}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />
    </div>
  );
}

