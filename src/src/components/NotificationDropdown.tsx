import { useState, useEffect, useCallback } from "react";
import { Bell, Check, X, UserPlus, Swords, Users, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  getNotifications,
  acceptFriendRequest,
  rejectFriendRequest,
  markAllNotificationsRead,
  acceptChallenge,
  declineChallenge,
  Notification,
} from "../lib/hybridAccountManager";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

type NotificationDropdownProps = {
  onNavigate: (page: string, options?: any) => void;
};

export function NotificationDropdown({ onNavigate }: NotificationDropdownProps) {
  const { currentUser } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    try {
      const userNotifications = await getNotifications(currentUser.id);
      setNotifications(userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      const count = userNotifications.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (err) {
      setError("Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [currentUser, open, loadNotifications]);
  
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && unreadCount > 0 && currentUser) {
      try {
        await markAllNotificationsRead(currentUser.id);
        setUnreadCount(0);
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
  };

  const handleAcceptFriendRequest = async (notificationId: string) => {
    try {
      await acceptFriendRequest(notificationId);
      toast.success("Friend request accepted!");
      loadNotifications();
    } catch (err) {
      toast.error("Failed to accept friend request.");
    }
  };

  const handleDeclineFriendRequest = async (notificationId: string) => {
    try {
      await rejectFriendRequest(notificationId);
      toast.info("Friend request declined");
      loadNotifications();
    } catch (err) {
      toast.error("Failed to decline friend request.");
    }
  };

  const handleAcceptGameChallenge = async (challengeId: string) => {
    try {
      const newRoom = await acceptChallenge(challengeId);
      toast.success("Challenge accepted! Joining game...");
      onNavigate('multiplayer-lobby', { roomId: newRoom.id });
    } catch (err) {
      toast.error("Failed to accept challenge.");
    }
  };

  const handleDeclineGameChallenge = async (challengeId: string) => {
    try {
      await declineChallenge(challengeId);
      toast.info("Challenge declined");
      loadNotifications();
    } catch (err) {
      toast.error("Failed to decline challenge.");
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'challenge':
        return <Swords className="h-4 w-4 text-orange-500" />;
      case 'game_invite':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
             <div className="p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-3 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback
                          className="text-white text-xs bg-gray-700"
                        >
                          {notification.message.charAt(0).toUpperCase()}
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
                        
                        {notification.type === 'friend_request' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptFriendRequest(notification.id)}
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

                        {notification.type === 'challenge' && notification.relatedId && (
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
                              onClick={() => handleDeclineGameChallenge(notification.relatedId!)}
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
                ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
