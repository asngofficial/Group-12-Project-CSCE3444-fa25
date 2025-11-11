import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { PageWrapper } from "./PageWrapper";
import { User, Bell, Volume2, Moon, Trophy, LogOut, Palette, Edit2, Camera, X } from "lucide-react";
import { Separator } from "./ui/separator";
import { BoardCustomization } from "./BoardCustomization";
import { XPProgress } from "./XPProgress";
import { useUser } from "../contexts/UserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";

type SettingsPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function SettingsPage({ onNavigate, currentPage }: SettingsPageProps) {
  const { currentUser, updateCurrentUser, logout } = useUser();
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profileColor, setProfileColor] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>('');
  const [debugInfo, setDebugInfo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update debug info whenever preferences change
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(`Dark: ${currentUser?.preferences?.darkMode ? 'ON' : 'OFF'} | HTML: ${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}`);
    }, 100);
    return () => clearInterval(interval);
  }, [currentUser?.preferences?.darkMode]);

  if (!currentUser) return null;

  const handlePreferenceChange = (key: 'notifications' | 'sound' | 'darkMode', value: boolean) => {
    const currentPreferences = currentUser?.preferences || {};
    updateCurrentUser({
      preferences: {
        ...currentPreferences,
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

  const handleEditProfile = () => {
    setNewUsername(currentUser?.username || '');
    setProfileColor(currentUser?.profileColor || '#6366f1');
    setProfilePicture(currentUser?.profilePicture);
    setEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    updateCurrentUser({
      username: newUsername.trim(),
      profileColor: profileColor,
      profilePicture: profilePicture,
    });
    
    toast.success('Profile updated successfully!');
    setEditProfileOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfilePicture(undefined);
    setProfileColor('#6366f1'); // Reset to default indigo color
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
        <h1 className="text-xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
        {/* Debug indicator */}
        <div className="text-xs mt-1 opacity-50">{debugInfo}</div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                {currentUser.profilePicture && <AvatarImage src={currentUser.profilePicture} alt={currentUser.username} />}
                <AvatarFallback 
                  className="text-xl text-white"
                  style={{ backgroundColor: currentUser.profileColor || '#6366f1' }}
                >
                  {currentUser.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg">{currentUser.username}</h2>
                <div className="mt-2 w-full">
                  <XPProgress 
                    currentXP={currentUser.xp} 
                    currentLevel={currentUser.level}
                    showLabel={true}
                    size="md"
                  />
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleEditProfile}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl">{currentUser.solvedPuzzles}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>
              <div>
                <p className="text-2xl">{currentUser.wins ?? 0}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
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
                  checked={currentUser.preferences?.notifications ?? false}
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
                  checked={currentUser.preferences?.sound ?? false}
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
                  checked={currentUser.preferences?.darkMode ?? false}
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

      {/* Board Customization Dialog */}
      <BoardCustomization
        open={customizationOpen}
        onOpenChange={setCustomizationOpen}
        currentStyle={currentUser.boardStyle}
        onStyleChange={handleBoardStyleChange}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your username and profile picture color
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Preview Avatar with Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {profilePicture && <AvatarImage src={profilePicture} alt="Preview" />}
                  <AvatarFallback 
                    className="text-2xl text-white"
                    style={{ backgroundColor: profileColor }}
                  >
                    {newUsername ? newUsername[0].toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                {profilePicture && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {profilePicture ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={20}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Avatar Background Color</Label>
              <p className="text-xs text-muted-foreground">Used when no photo is uploaded</p>
              <div className="grid grid-cols-8 gap-2">
                {[
                  '#ef4444', '#f97316', '#f59e0b', '#eab308',
                  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
                  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
                  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      profileColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setProfileColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PageWrapper>
  );
}
