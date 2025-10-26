import { useState, useEffect } from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { LoginForm } from "./components/LoginForm";
import { GamePage } from "./components/GamePage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { ChallengePage } from "./components/ChallengePage";
import { PlayPage } from "./components/PlayPage";
import { FriendsPage } from "./components/FriendsPage";
import { SettingsPage } from "./components/SettingsPage";
import { TutorialPage } from "./components/TutorialPage";
import { Toaster } from "./components/ui/sonner";

type Page = 'game' | 'leaderboard' | 'challenge' | 'play' | 'friends' | 'settings' | 'tutorial';

function AppContent() {
  const { currentUser, isAuthenticated } = useUser();
  const [currentPage, setCurrentPage] = useState<Page>('play');
  const [difficulty, setDifficulty] = useState<string>('medium');

  useEffect(() => {
    // Reset to play page when user logs in
    if (isAuthenticated) {
      setCurrentPage('play');
    }
  }, [isAuthenticated]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleBoardStyleChange = (style: string) => {
    if (currentUser) {
      const { updateCurrentUser } = useUser();
      updateCurrentUser({ boardStyle: style });
    }
  };

  const handleStartGame = (difficulty: string) => {
    setDifficulty(difficulty);
    setCurrentPage('game');
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'game':
        return <GamePage onNavigate={handleNavigate} currentPage={currentPage} boardStyle={currentUser?.boardStyle || 'classic'} difficulty={difficulty} />;
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'challenge':
        return <ChallengePage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'play':
        return <PlayPage onNavigate={handleNavigate} currentPage={currentPage} onStartGame={handleStartGame} />;
      case 'friends':
        return <FriendsPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'tutorial':
        return <TutorialPage onNavigate={handleNavigate} />;
      default:
        return <PlayPage onNavigate={handleNavigate} currentPage={currentPage} onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-sm mx-auto">
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
      <Toaster />
    </UserProvider>
  );
}
