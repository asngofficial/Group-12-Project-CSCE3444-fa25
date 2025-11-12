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
import { BottomNav } from "./components/BottomNav";
import { Toaster } from "./components/ui/sonner";
import { startRoom } from "./lib/hybridAccountManager";
import { apiClient } from "./lib/apiClient"; // Import apiClient
import { Loader2 } from "lucide-react"; // Import Loader2 icon

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
        return <SettingsPage onNavigate={handleNavigate} currentPage={currentPage} onBoardStyleChange={handleBoardStyleChange} />;
      case 'faq':
        return <FAQPage onNavigate={handleNavigate} currentPage={currentPage} />;
      default:
        return <PlayPage onNavigate={handleNavigate} currentPage={currentPage} onStartGame={handleStartGame} />;
    }
  };

  // If not authenticated, show the login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          <LoginForm />
        </div>
      </div>
    );
  }

  // Main application content
  return (
    <>
      {/* Desktop layout with sidebar */}
      {deviceType === 'desktop' && (
        <div className="flex h-screen bg-background">
          <DesktopNav onNavigate={handleNavigate} currentPage={currentPage} />
          <div className="flex-1 overflow-auto">
            {renderPage()}
          </div>
        </div>
      )}

      {/* Mobile layout with bottom nav */}
      {deviceType === 'mobile' && (
        <div className="flex flex-col h-screen bg-background">
          <div className="flex-1 overflow-auto">
            {renderPage()}
          </div>
          <BottomNav onNavigate={handleNavigate} currentPage={currentPage} />
        </div>
      )}
    </>
  );
}

export default function App() {
  const [isBackendUnresponsive, setIsBackendUnresponsive] = useState<boolean>(true); // Initialize to true, overlay shown initially
  const [dots, setDots] = useState(1); // State for animating ellipsis

  useEffect(() => {
    // Set the callback for apiClient to update backend status
    apiClient.setBackendStatus(setIsBackendUnresponsive);

    let intervalId: NodeJS.Timeout | undefined; // Use undefined for initial state

    const checkBackendPeriodically = async () => {
      try {
        // Use a known API endpoint that is expected to return JSON
        await apiClient.getAllUsers(); 
        // If successful, setIsBackendUnresponsive(false) would have been called by apiClient
        // Clear the interval if backend is now responsive
        if (intervalId) clearInterval(intervalId);
        intervalId = undefined; // Reset intervalId
      } catch (error) {
        // Errors here will be handled by apiClient.request, which will call setIsBackendUnresponsive(true)
        // if it's a network error, or non-2xx response, or JSON parsing error.
        // Polling should continue only if it's unresponsive.
        // The apiClient's setBackendStatus handles this logic.
        console.error("Backend responsiveness check encountered an error:", error);
      }
    };

    // Start polling immediately and then every few seconds if unresponsive
    // This ensures the check runs right away when the component mounts
    checkBackendPeriodically(); // Initial check
    intervalId = setInterval(checkBackendPeriodically, 2000); // Poll every 2 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    let reloadTimeout: NodeJS.Timeout | undefined;

    if (isBackendUnresponsive) {
      console.log("Backend unresponsive, setting page reload timeout for 25 seconds.");
      reloadTimeout = setTimeout(() => {
        console.log("25 seconds passed, backend still unresponsive. Reloading page...");
        window.location.reload();
      }, 25000); // 25 seconds
    }

    return () => {
      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }
    };
  }, [isBackendUnresponsive]); // Re-run effect when backend responsiveness changes

  // Effect for animating ellipsis
  useEffect(() => {
    let ellipsisInterval: NodeJS.Timeout | undefined;
    if (isBackendUnresponsive) {
      ellipsisInterval = setInterval(() => {
        setDots((prevDots) => (prevDots % 3) + 1);
      }, 500); // Cycle every 500ms
    }

    return () => {
      if (ellipsisInterval) {
        clearInterval(ellipsisInterval);
      }
    };
  }, [isBackendUnresponsive]); // Only run when backend responsiveness changes

  return (
    <>
      {/* Loading Overlay */}
      {isBackendUnresponsive && (
        <div className="fixed inset-0 bg-background/30 backdrop-blur-xs flex items-center justify-center z-50">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-lg shadow-lg w-[700px] h-[300px] flex flex-col items-center justify-center backdrop-blur-sm glow-opposite-theme">
                                          <Loader2 className="h-12 w-12 custom-spin text-primary mx-auto mb-4" />
                                          <p className="text-foreground text-lg whitespace-nowrap w-[640px] overflow-hidden font-bold">              Please wait, as the server initializes<span className="inline-block w-[18px] text-left">
                {Array(3).fill(null).map((_, i) => (
                  <span key={i}>{i < dots ? '.' : '\u00A0'}</span> // Use non-breaking space for invisible dots
                ))}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">This usually takes about 30 seconds.</p>
          </div>
        </div>
      )}
      <UserProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </UserProvider>
    </>
  );
}
