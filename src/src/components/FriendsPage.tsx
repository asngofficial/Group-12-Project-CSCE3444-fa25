import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BottomNav } from "./BottomNav";
import { Users, UserPlus, Check, X, Search, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useUser } from "../contexts/UserContext";
import { getAllUsers, getFriends, addFriend, UserAccount } from "../lib/accountManager";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

type FriendsPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function FriendsPage({ onNavigate, currentPage }: FriendsPageProps) {
  const { currentUser, updateCurrentUser } = useUser();
  const [friends, setFriends] = useState<UserAccount[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(query) &&
        user.id !== currentUser?.id &&
        !currentUser?.friends.includes(user.id)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, allUsers, currentUser]);

  const loadData = () => {
    if (currentUser) {
      const friendsList = getFriends(currentUser.id);
      setFriends(friendsList);
      
      const users = getAllUsers();
      setAllUsers(users);
    }
  };

  const handleAddFriend = (friendId: string) => {
    if (currentUser) {
      addFriend(currentUser.id, friendId);
      
      // Update the current user's friends list
      const updatedFriends = [...currentUser.friends, friendId];
      updateCurrentUser({ friends: updatedFriends });
      
      toast.success("Friend added successfully!");
      loadData();
      setSearchQuery("");
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    if (currentUser) {
      const updatedFriends = currentUser.friends.filter(id => id !== friendId);
      updateCurrentUser({ friends: updatedFriends });
      
      toast.success("Friend removed");
      loadData();
    }
  };

  const suggestedUsers = allUsers
    .filter(user => 
      user.id !== currentUser?.id && 
      !currentUser?.friends.includes(user.id)
    )
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
          </h1>
          <p className="text-sm text-muted-foreground">Connect with other players</p>
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
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mx-auto max-w-sm sticky top-0 bg-background z-10">
            <TabsTrigger value="friends">
              My Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="add">Add Friends</TabsTrigger>
          </TabsList>

          {/* My Friends Tab */}
          <TabsContent value="friends" className="p-4 space-y-3">
            {friends.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="mb-2">No friends yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add friends to compete and compare scores
                </p>
                <Button onClick={() => document.querySelector<HTMLElement>('[value="add"]')?.click()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friends
                </Button>
              </Card>
            ) : (
              friends.map((friend) => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="font-medium">{friend.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Level {friend.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {friend.xp.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>✅ {friend.solvedPuzzles} solved</span>
                        <span>⏱️ {friend.averageTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Add Friends Tab */}
          <TabsContent value="add" className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Search Results</h3>
                {filteredUsers.length === 0 ? (
                  <Card className="p-4 text-center text-sm text-muted-foreground">
                    No users found
                  </Card>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {filteredUsers.map((user) => (
                        <Card key={user.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.username}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Lv {user.level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {user.xp.toLocaleString()} XP
                                </span>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => handleAddFriend(user.id)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Suggested Friends */}
            {!searchQuery.trim() && suggestedUsers.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Suggested Players</h3>
                {suggestedUsers.map((user) => (
                  <Card key={user.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Lv {user.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {user.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddFriend(user.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!searchQuery.trim() && suggestedUsers.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No more users to add
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />
    </div>
  );
}

