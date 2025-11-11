import { useState, useEffect } from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LoginForm } from "./components/LoginForm";
import { GamePage } from "./components/GamePage";
import { BotGamePage } from "./components/BotGamePage";
import { MultiplayerLobbyPage } from "./components/MultiplayerLobbyPage";
import { MultiplayerGamePage } from "./components/MultiplayerGamePage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { ChallengePage } from "./components/ChallengePage";
import { PlayPage } from "./components/PlayPage";
import { FriendsPage } from "./components/FriendsPage";
import { SettingsPage } from "./components/SettingsPage";
import { FAQPage } from "./components/FAQPage";
import { DesktopNav } from "./components/DesktopNav";
import { Toaster } from "./components/ui/sonner";
import { startRoom } from "./lib/hybridAccountManager";

import { useDeviceType } from "./hooks/useDeviceType";

type Page = 'game' | 'leaderboard' | 'challenge' | 'play' | 'friends' | 'settings' | 'faq' | 'botgame' | 'mplobby' | 'mpgame';

function AppContent() {
  const { currentUser, isAuthenticated } = useUser();
  const [currentPage, setCurrentPage] = useState<Page>('play');
  const [gameDifficulty, setGameDifficulty] = useState<string>('Medium');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const deviceType = useDeviceType();

  useEffect(() => {
    // Reset to play page when user logs in
    if (isAuthenticated) {
      setCurrentPage('play');
    }
  }, [isAuthenticated]);

  const handleNavigate = (page: string, options?: { roomId?: string }) => {
    if (options?.roomId) {
      setCurrentRoomId(options.roomId);
    }
    setCurrentPage(page as Page);
  };

  const handleBoardStyleChange = (style: string) => {
    if (currentUser) {
      const { updateCurrentUser } = useUser();
      updateCurrentUser({ boardStyle: style });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          <LoginForm />
        </div>
      </div>
    );
  }

  const handleStartGame = (difficulty: string) => {
    setGameDifficulty(difficulty);
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentPage('mplobby');
  };

  const handleCreateRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentPage('mplobby');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'game':
        return <GamePage onNavigate={handleNavigate} currentPage={currentPage} boardStyle={currentUser?.boardStyle || 'classic'} difficulty={gameDifficulty} />;
      case 'botgame':
        return <BotGamePage onNavigate={handleNavigate} currentPage={currentPage} boardStyle={currentUser?.boardStyle || 'classic'} difficulty={gameDifficulty} />;
      case 'mplobby':
        return <MultiplayerLobbyPage onNavigate={handleNavigate} currentPage={currentPage} roomId={currentRoomId} />;
      case 'mpgame':
        return <MultiplayerGamePage onNavigate={handleNavigate} currentPage={currentPage} roomId={currentRoomId} boardStyle={currentUser?.boardStyle || 'classic'} />;
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'challenge':
        return <ChallengePage onNavigate={handleNavigate} currentPage={currentPage} onStartGame={handleStartGame} onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />;
      case 'play':
        return <PlayPage onNavigate={handleNavigate} currentPage={currentPage} onStartGame={handleStartGame} />;
      case 'friends':
        return <FriendsPage onNavigate={handleNavigate} currentPage={currentPage} onJoinRoom={handleJoinRoom} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'faq':
        return <FAQPage onNavigate={handleNavigate} currentPage={currentPage} />;
      default:
        return <PlayPage onNavigate={handleNavigate} currentPage={currentPage} onStartGame={handleStartGame} />;
    }
  };

  // Desktop layout with sidebar
  if (deviceType === 'desktop') {
    return (
      <div className="flex h-screen bg-background">
        <DesktopNav onNavigate={handleNavigate} currentPage={currentPage} />
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>
    );
  }

  // Mobile layout with bottom nav
  return (
    <div className="min-h-screen bg-background max-w-sm mx-auto">
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <AppContent />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </UserProvider>
  );
}
