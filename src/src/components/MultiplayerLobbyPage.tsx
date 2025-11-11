import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { PageWrapper } from "./PageWrapper";
import { Users, Copy, Check, Crown, ArrowLeft, Play, Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { getRoom, leaveRoom, setPlayerReady, startRoom, MultiplayerRoom } from "../lib/hybridAccountManager";
import { socket } from "../lib/socket";
import { toast } from "sonner";

type MultiplayerLobbyPageProps = {
  onNavigate: (page: string, options?: { roomId?: string }) => void;
  roomId: string;
};

export function MultiplayerLobbyPage({ onNavigate, roomId }: MultiplayerLobbyPageProps) {
  const { currentUser } = useUser();
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLeave = useCallback(async () => {
    if (currentUser && roomId) {
      try {
        await leaveRoom(roomId, currentUser.id);
      } catch (error) {
        console.error("Failed to leave room:", error);
      } finally {
        onNavigate('challenge');
      }
    }
  }, [currentUser, roomId, onNavigate]);

  useEffect(() => {
    if (!currentUser) {
      onNavigate('play');
      return;
    }

    socket.connect();
    socket.emit('room:join', roomId);

    const initialLoad = async () => {
      try {
        const loadedRoom = await getRoom(roomId);
        setRoom(loadedRoom);
      } catch (error) {
        toast.error("Room not found. Navigating back.");
        handleLeave();
      } finally {
        setLoading(false);
      }
    };
    initialLoad();

    const onRoomUpdate = (updatedRoom: MultiplayerRoom) => setRoom(updatedRoom);
    const onGameStart = () => onNavigate('mpgame', { roomId });
    
    socket.on('room:update', onRoomUpdate);
    socket.on('game:start', onGameStart);

    return () => {
      socket.off('room:update', onRoomUpdate);
      socket.off('game:start', onGameStart);
    };
  }, [roomId, currentUser, onNavigate, handleLeave]);

  const handleCopyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = async () => {
    if (room && currentUser) {
      try {
        const player = room.players.find(p => p.userId === currentUser.id);
        if (player) {
          await setPlayerReady(room.id, currentUser.id, !player.isReady);
        }
      } catch (error) {
        toast.error("Failed to update ready status.");
        console.error(error);
      }
    }
  };

  const handleStartGame = async () => {
    if (room && currentUser && room.hostId === currentUser.id) {
      if (room.players.length < 2) {
        toast.error("Need at least 2 players to start");
        return;
      }
      try {
        await startRoom(room.id);
        // The game:start socket event will trigger navigation
      } catch (error) {
        toast.error("Failed to start game.");
        console.error(error);
      }
    }
  };

  const isHost = currentUser && room && room.hostId === currentUser.id;
  const currentPlayer = room?.players.find(p => p.userId === currentUser?.id);

  if (loading || !room) {
    return (
      <PageWrapper onNavigate={onNavigate} currentPage="multiplayer-lobby">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper onNavigate={onNavigate} currentPage="multiplayer-lobby">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleLeave} className="p-2 hover:bg-accent rounded-md">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl">Multiplayer Lobby</h1>
              <p className="text-sm text-muted-foreground">
                {room.players.length}/{room.maxPlayers} players
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pb-20 overflow-auto p-4 space-y-4">
          {/* Room Code Card */}
          <Card className="p-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Room Code</p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-mono tracking-wider bg-accent px-4 py-2 rounded-lg">
                  {room.code}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">
                  {room.difficulty}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Players List */}
          <div className="space-y-2">
            <h3 className="font-medium px-1">Players ({room.players.length})</h3>
            <div className="space-y-2">
              {room.players.map((player) => (
                <Card key={player.userId} className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {player.profilePicture && (
                        <AvatarImage src={player.profilePicture} alt={player.username} />
                      )}
                      <AvatarFallback
                        className="text-white"
                        style={{ backgroundColor: player.profileColor || '#6366f1' }}
                      >
                        {player.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{player.username}</p>
                        {player.userId === room.hostId && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {player.userId === currentUser?.id && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      {player.isReady ? (
                        <Badge className="bg-green-500">Ready</Badge>
                      ) : (
                        <Badge variant="secondary">Not Ready</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ready/Start Button */}
          <div className="space-y-2">
            {!isHost && (
              <Button
                className="w-full"
                size="lg"
                variant={currentPlayer?.isReady ? "outline" : "default"}
                onClick={handleToggleReady}
              >
                {currentPlayer?.isReady ? "Not Ready" : "Ready"}
              </Button>
            )}

            {isHost && (
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartGame}
                disabled={room.players.length < 2}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Game
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLeave}
          >
            Leave Room
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
