import { Play, Swords, Users, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useUser } from "../contexts/UserContext";
import { getUnreadNotificationCount } from "../lib/hybridAccountManager";
import { useState, useEffect } from "react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    id: 'play',
    label: 'Play',
    icon: Play
  },
  {
    id: 'challenge',
    label: 'Challenge',
    icon: Swords
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: Users
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }
];

type DesktopNavProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  onJoinRoom?: (roomId: string) => void;
};

export function DesktopNav({ onNavigate, currentPage, onJoinRoom }: DesktopNavProps) {
  const { currentUser } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    const fetchCount = async () => {
      try {
        const count = await getUnreadNotificationCount(currentUser.id);
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchCount(); // Initial fetch
    // Removed: const interval = setInterval(fetchCount, 10000); // Poll every 10 seconds

    // Removed: return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="w-64 h-screen bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl mb-1">Sudoku</h1>
        <p className="text-sm text-muted-foreground">Competitive Puzzles</p>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {currentUser.profilePicture && <AvatarImage src={currentUser.profilePicture} alt={currentUser.username} />}
            <AvatarFallback 
              className="text-white"
              style={{ backgroundColor: currentUser.profileColor || '#6366f1' }}
            >
              {currentUser.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate">{currentUser.username}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">Level {currentUser.level}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          {currentUser.xp.toLocaleString()} XP
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:scale-105 active:scale-95 relative ${
                currentPage === id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {id === 'friends' && unreadCount > 0 && (
                <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer Stats */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-lg">{currentUser.solvedPuzzles}</p>
            <p className="text-xs text-muted-foreground">Solved</p>
          </div>
          <div>
            <p className="text-lg">{currentUser.wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-lg">{currentUser.averageTime}</p>
            <p className="text-xs text-muted-foreground">Avg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
