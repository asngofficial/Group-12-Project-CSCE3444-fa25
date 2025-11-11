import { Play, Swords, Users, Settings } from "lucide-react";
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

type BottomNavProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function BottomNav({ onNavigate, currentPage }: BottomNavProps) {
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
    const interval = setInterval(fetchCount, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-background/70 backdrop-blur-xl border-t border-border/40 saturate-150">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all hover:scale-105 active:scale-95 relative ${
              currentPage === id 
                ? 'text-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              <Icon className="h-6 w-6" />
              {id === 'friends' && unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
