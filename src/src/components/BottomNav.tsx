import { Compass, Play, Swords, Users, Settings } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    id: 'explore',
    label: 'Explore',
    icon: Compass
  },
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
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-background border-t">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              currentPage === id 
                ? 'text-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            <Icon className={`h-6 w-6 ${currentPage === id ? 'text-black' : 'text-gray-500'}`} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

