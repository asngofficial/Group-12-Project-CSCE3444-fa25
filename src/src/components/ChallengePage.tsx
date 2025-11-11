import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PageWrapper } from "./PageWrapper";
import { Swords, Users, Plus, Loader2, LogIn } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { 
  getAllUsers, 
  getUserChallenges, 
  getFriends, 
  sendGameChallenge,
  createRoom,
  joinRoom,
  UserAccount,
  Challenge as ChallengeType,
} from "../lib/hybridAccountManager";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { generateSudokuGrid } from "../utils/sudokuGenerator";

type ChallengePageProps = {
  onNavigate: (page: string, options?: any) => void;
  currentPage: string;
  onStartGame?: (difficulty: string) => void;
  onJoinRoom?: (roomId: string) => void;
  onCreateRoom?: (roomId: string) => void;
};

export function ChallengePage({ onNavigate, currentPage, onStartGame, onJoinRoom, onCreateRoom }: ChallengePageProps) {
  const { currentUser } = useUser();
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [friends, setFriends] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showChallengeFriendDialog, setShowChallengeFriendDialog] = useState(false);
  const [challengeDifficulty, setChallengeDifficulty] = useState("Medium");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (!currentUser) {
      onNavigate('play');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userChallenges, userFriends] = await Promise.all([
          getUserChallenges(currentUser.id),
          getFriends(currentUser.id),
        ]);
        setChallenges(userChallenges);
        setFriends(userFriends);
      } catch (err) {
        setError("Failed to load challenge data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, onNavigate]);

  const handleChallengeFriend = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      await sendGameChallenge(friendId, challengeDifficulty);
      setShowChallengeDialog(false);
      toast.success("Challenge sent!");
    } catch (err) {
      toast.error("Failed to send challenge.");
      console.error(err);
    }
  };

  const handleChallengeBot = () => {
    if (!currentUser) return;

    // Random difficulty
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    // Set difficulty before navigating
    if (onStartGame) {
      onStartGame(randomDifficulty.toLowerCase());
    }
    
    // Navigate to bot game with selected difficulty
    onNavigate('botgame');
    
    toast.success(`Starting ${randomDifficulty} bot challenge!`);
  };

  const handleCreateRoom = () => {
    setShowCreateDialog(true);
  };

  const handleConfirmCreateRoom = async () => {
    if (!currentUser) return;
    
    try {
      const { puzzle, solution } = generateSudokuGrid(selectedDifficulty);
      const room = await createRoom(currentUser.id, selectedDifficulty, puzzle, solution, 50);
      
      setShowCreateDialog(false);
      toast.success(`Room created! Code: ${room.code}`);
      
      if (onCreateRoom) {
        onCreateRoom(room.id);
      } else {
        onNavigate('mplobby', { roomId: room.id });
      }
    } catch (error) {
      console.error('Create room error:', error);
      toast.error("Failed to create room");
    }
  };

  const handleJoinRoom = () => {
    setShowJoinDialog(true);
  };

  const handleConfirmJoinRoom = async () => {
    if (!currentUser || !roomCode.trim()) return;
    
    try {
      const room = await joinRoom(
        roomCode.trim(), 
        currentUser.id,
        currentUser.username,
        currentUser.profileColor,
        currentUser.profilePicture
      );
      
      setShowJoinDialog(false);
      setRoomCode("");
      toast.success("Joined room successfully!");
      
      if (onJoinRoom) {
        onJoinRoom(room.id);
      } else {
        onNavigate('mplobby', { roomId: room.id });
      }
    } catch (error: any) {
      console.error('Join room error:', error);
      toast.error(error.message || "Failed to join room");
    }
  };

  if (loading) {
    return (
      <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-destructive">{error}</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 px-4 py-3">
          <h1 className="text-xl">Challenge a Friend</h1>
          <p className="text-sm text-muted-foreground">Send a challenge to one of your friends</p>
        </div>

        <div className="flex-1 pb-20 overflow-auto p-4 space-y-4">
          {/* Multiplayer Options */}
          <div className="grid grid-cols-1 gap-2">
            <Button className="w-full" size="lg" onClick={handleCreateRoom} variant="default">
              <Plus className="h-5 w-5 mr-2" />
              Create Room
            </Button>
            <Button className="w-full" size="lg" onClick={handleJoinRoom} variant="outline">
              <LogIn className="h-5 w-5 mr-2" />
              Join Room
            </Button>
            <Button className="w-full" size="lg" onClick={() => setShowChallengeFriendDialog(true)} variant="outline">
              <Swords className="h-5 w-5 mr-2" />
              Challenge a Friend
            </Button>
            <Button className="w-full" size="lg" onClick={handleChallengeBot} variant="outline">
              <Users className="h-5 w-5 mr-2" />
              Challenge a Bot
            </Button>
          </div>

          {challenges.length === 0 ? (
            <Card className="p-8 text-center">
              <Swords className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="mb-2">No active challenges</p>
              <p className="text-sm text-muted-foreground">
                Challenge a friend to start a new game!
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              <h3 className="font-medium px-1">Active Challenges</h3>
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="p-3">
                  {/* Display challenge info here */}
                  <p>Challenge with user {challenge.toUserId}</p>
                  <p>Status: {challenge.status}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Challenge Friend Dialog */}
      <Dialog open={showChallengeFriendDialog} onOpenChange={setShowChallengeFriendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Challenge a Friend</DialogTitle>
            <DialogDescription>
              Send a game challenge to one of your friends
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={challengeDifficulty} onValueChange={setChallengeDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Friend</label>
              <ScrollArea className="h-[200px] border rounded-md">
                {friends.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No friends yet. Add friends to challenge them!
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {friends.map((friend) => (
                      <Card
                        key={friend.id}
                        className="p-3 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleChallengeFriend(friend.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {friend.profilePicture && (
                              <AvatarImage src={friend.profilePicture} alt={friend.username} />
                            )}
                            <AvatarFallback
                              className="text-white"
                              style={{ backgroundColor: friend.profileColor || '#6366f1' }}
                            >
                              {friend.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{friend.username}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-xs">
                                Level {friend.level}
                              </Badge>
                            </div>
                          </div>
                          <Swords className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Room Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Multiplayer Room</DialogTitle>
            <DialogDescription>
              Choose difficulty and create a room for up to 50 players
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-accent p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                A unique 6-digit room code will be generated. Share it with friends to let them join!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirmCreateRoom}>
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
            <DialogDescription>
              Enter the 6-digit room code to join a multiplayer game
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Code</label>
              <Input
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-wider"
              />
            </div>
            <div className="bg-accent p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Get the room code from a friend who created a room
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setShowJoinDialog(false);
                setRoomCode("");
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleConfirmJoinRoom}
              disabled={roomCode.trim().length !== 6}
            >
              Join Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
