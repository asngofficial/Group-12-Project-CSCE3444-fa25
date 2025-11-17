import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PageWrapper } from "./PageWrapper";
import { Users, UserPlus, Check, X, Search, Trophy, Bell, Swords } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useUser } from "../contexts/UserContext";
import { getAllUsers, getFriends, UserAccount, sendFriendRequest, getNotifications, getUnreadNotificationCount, acceptFriendRequest, rejectFriendRequest, getFriendRequests, Notification, removeFriend, getUserById } from "../lib/hybridAccountManager";
import type { FriendRequest as APIFriendRequest } from "../lib/apiClient";
import { toast } from "sonner";

import { ScrollArea } from "./ui/scroll-area";

type FriendsPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  onJoinRoom?: (roomId: string) => void;
};

export function FriendsPage({ onNavigate, currentPage, onJoinRoom }: FriendsPageProps) {
  const { currentUser, updateCurrentUser } = useUser();
  const [friends, setFriends] = useState<UserAccount[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<APIFriendRequest[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadData();
      loadNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    // Poll for new notifications every 5 seconds
    const interval = setInterval(() => {
      if (currentUser) {
        loadNotifications();
      }
    }, 5000);
    return () => clearInterval(interval);
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

  const loadData = async () => {
    if (currentUser) {
      try {
        const friendsList = await getFriends(currentUser.id);
        setFriends(friendsList);
        
        const users = await getAllUsers();
        setAllUsers(users);
        
        const requests = await getFriendRequests(currentUser.id);
        setFriendRequests(requests);
      } catch (error) {
        console.error('Failed to load friends data:', error);
      }
    }
  };

  const loadNotifications = async () => {
    if (currentUser) {
      try {
        const userNotifications = await getNotifications(currentUser.id);
        setNotifications(userNotifications);
        const count = getUnreadNotificationCount(currentUser.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  };

  const handleAddFriend = async (username: string) => {
    if (currentUser) {
      try {
        await sendFriendRequest(currentUser.id, username);
        toast.success("Friend request sent!");
        setSearchQuery("");
        await loadData();
      } catch (error: any) {
        toast.error(error.message || "Failed to send friend request");
      }
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (currentUser) {
      try {
        await removeFriend(currentUser.id, friendId);
        toast.success("Friend removed");
        await loadData();
      } catch (error: any) {
        toast.error(error.message || "Failed to remove friend");
      }
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success("Friend request accepted!");
      await loadData();
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept friend request");
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast.info("Friend request declined");
      await loadData();
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message || "Failed to decline friend request");
    }
  };

  const handleAcceptGameChallenge = async (roomId: string) => {
    toast.success("Challenge accepted! Joining game...");
    if (onJoinRoom) {
      onJoinRoom(roomId);
    }
    await loadNotifications();
  };

  const handleDeclineGameChallenge = async (notificationId: string) => {
    // Mark as read
    const { markNotificationRead } = await import("../lib/hybridAccountManager");
    await markNotificationRead(notificationId);
    toast.info("Challenge declined");
    await loadNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'game_challenge':
        return <Swords className="h-4 w-4 text-orange-500" />;
      case 'room_invite':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
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
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
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
          <TabsList className="w-full grid grid-cols-3 mx-auto max-w-sm sticky top-0 bg-background z-10">
            <TabsTrigger value="friends">
              My Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="add">Add Friends</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
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
                      {friend.profilePicture && <AvatarImage src={friend.profilePicture} alt={friend.username} />}
                      <AvatarFallback 
                        className="text-white"
                        style={{ backgroundColor: friend.profileColor || '#6366f1' }}
                      >
                        {friend.username[0].toUpperCase()}
                      </AvatarFallback>
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
                        <span>✓ {friend.solvedPuzzles} solved</span>
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
                              {user.profilePicture && <AvatarImage src={user.profilePicture} alt={user.username} />}
                              <AvatarFallback 
                                className="text-white"
                                style={{ backgroundColor: user.profileColor || '#6366f1' }}
                              >
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
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
                              onClick={() => handleAddFriend(user.username)}
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
                        {user.profilePicture && <AvatarImage src={user.profilePicture} alt={user.username} />}
                        <AvatarFallback 
                          className="text-white"
                          style={{ backgroundColor: user.profileColor || '#6366f1' }}
                        >
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
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
                        onClick={() => handleAddFriend(user.username)}
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

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-4 space-y-3">
            {/* Friend Requests Section */}
            {friendRequests.filter(req => req.status === 'pending').length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium">Friend Requests</h3>
                {friendRequests.filter(req => req.status === 'pending').map((request) => (
                  <Card key={request.id} className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-white bg-primary">
                          {request.fromUsername[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <p className="text-sm">
                          <strong>{request.fromUsername}</strong> sent you a friend request
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            className="flex-1"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineFriendRequest(request.id)}
                            className="flex-1"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Other Notifications */}
            {friendRequests.filter(req => req.status === 'pending').length === 0 && notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="mb-2">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  You'll see friend requests and game challenges here
                </p>
              </Card>
            ) : (
              notifications.map((notification) => {
                // We don't need to fetch the user since we have the username in the notification
                return (
                  <Card
                    key={notification.id}
                    className={`p-4 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className="text-white bg-primary"
                        >
                          {notification.fromUsername?.[0]?.toUpperCase() || 'N'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          {getNotificationIcon(notification.type)}
                          <p className="text-sm flex-1">{notification.message}</p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Action buttons */}
                        {notification.type === 'friend_request' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptFriendRequest(notification.id, notification.fromUserId)}
                              className="flex-1"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineFriendRequest(notification.id)}
                              className="flex-1"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                        
                        {(notification.type === 'game_challenge' || notification.type === 'challenge') && notification.relatedId && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptGameChallenge(notification.relatedId!)}
                              className="flex-1"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineGameChallenge(notification.id)}
                              className="flex-1"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageWrapper>
  );
}
