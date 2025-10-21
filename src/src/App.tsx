import { useState, useEffect } from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { LoginForm } from "./components/LoginForm";
import { ExplorePage } from "./components/ExplorePage";
import { GamePage } from "./components/GamePage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { ChallengePage } from "./components/ChallengePage";
import { PlayPage } from "./components/PlayPage";
import { FriendsPage } from "./components/FriendsPage";
import { SettingsPage } from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";

type Page = 'explore' | 'game' | 'leaderboard' | 'challenge' | 'play' | 'friends' | 'settings';

function AppContent() {
  const { currentUser, isAuthenticated } = useUser();
  const [currentPage, setCurrentPage] = useState<Page>('explore');

  useEffect(() => {
    // Reset to explore page when user logs in
    if (isAuthenticated) {
      setCurrentPage('explore');
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

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'explore':
        return <ExplorePage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'game':
        return <GamePage onNavigate={handleNavigate} currentPage={currentPage} boardStyle={currentUser?.boardStyle || 'classic'} />;
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'challenge':
        return <ChallengePage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'play':
        return <PlayPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'friends':
        return <FriendsPage onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} currentPage={currentPage} />;
      default:
        return <ExplorePage onNavigate={handleNavigate} currentPage={currentPage} />;
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

