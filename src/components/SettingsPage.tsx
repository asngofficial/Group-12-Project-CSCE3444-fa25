import { useState } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { BottomNav } from "./BottomNav";
import { User, Bell, Volume2, Moon, Trophy, LogOut, Palette } from "lucide-react";
import { Separator } from "./ui/separator";
import { BoardCustomization } from "./BoardCustomization";
import { useUser } from "../contexts/UserContext";

type SettingsPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function SettingsPage({ onNavigate, currentPage }: SettingsPageProps) {
  const { currentUser, updateCurrentUser, logout } = useUser();
  const [customizationOpen, setCustomizationOpen] = useState(false);

  if (!currentUser) return null;

  const handlePreferenceChange = (key: keyof typeof currentUser.preferences, value: boolean) => {
    updateCurrentUser({
      preferences: {
        ...currentUser.preferences,
        [key]: value,
      },
    });
  };

  const handleBoardStyleChange = (style: string) => {
    updateCurrentUser({ boardStyle: style });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
        <h1 className="text-xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg">{currentUser.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Level {currentUser.level}</Badge>
                  <span className="text-sm text-muted-foreground">{currentUser.xp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl">{currentUser.solvedPuzzles}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>

              <div>
                <p className="text-2xl">{currentUser.averageTime}</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Customize Board Button */}
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setCustomizationOpen(true)}
            >
              <Palette className="h-4 w-4 mr-2" />
              Customize Board
            </Button>
          </Card>

          {/* Preferences */}
          <Card className="p-4 space-y-4">
            <h3 className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notifications" className="cursor-pointer">
                    Push Notifications
                  </Label>
                </div>
                <Switch
                  id="notifications"
                  checked={currentUser.preferences.notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sound" className="cursor-pointer">
                    Sound Effects
                  </Label>
                </div>
                <Switch
                  id="sound"
                  checked={currentUser.preferences.sound}
                  onCheckedChange={(checked) => handlePreferenceChange('sound', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="darkMode" className="cursor-pointer">
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id="darkMode"
                  checked={currentUser.preferences.darkMode}
                  onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                />
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-4">
            <h3 className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4" />
              Recent Achievements
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                <div className="text-2xl">🏆</div>
                <div className="flex-1">
                  <p className="text-sm">Speed Demon</p>
                  <p className="text-xs text-muted-foreground">Solve in under 5 minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                <div className="text-2xl">⭐</div>
                <div className="flex-1">
                  <p className="text-sm">Puzzle Master</p>
                  <p className="text-xs text-muted-foreground">Complete 50 puzzles</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                <div className="text-2xl">🎯</div>
                <div className="flex-1">
                  <p className="text-sm">Perfect Score</p>
                  <p className="text-xs text-muted-foreground">No mistakes in a puzzle</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-3" size="sm">
              View All Achievements
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onNavigate('leaderboard')}
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onNavigate('friends')}
              >
                <User className="h-4 w-4 mr-2" />
                Manage Friends ({currentUser.friends.length})
              </Button>
            </div>
          </Card>

          {/* Account Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentPage={currentPage} />

      {/* Board Customization Dialog */}
      <BoardCustomization
        open={customizationOpen}
        onOpenChange={setCustomizationOpen}
        currentStyle={currentUser.boardStyle}
        onStyleChange={handleBoardStyleChange}
      />
    </div>
  );
}

