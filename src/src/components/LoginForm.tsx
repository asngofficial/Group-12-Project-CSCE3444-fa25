import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { useUser } from "../contexts/UserContext";
import { loginUser, registerUser } from "../lib/hybridAccountManager";
import { Moon, Zap } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();
  
  // Handle dark mode for login page (default to true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('loginDarkMode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('loginDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleBypass = () => {
    // Create a demo user and log in directly
    const demoUser = {
      id: `demo_${Date.now()}`,
      username: `Guest_${Math.floor(Math.random() * 9999)}`,
      password: 'demo',
      xp: 0,
      level: 1,
      solvedPuzzles: 0,
      wins: 0,
      averageTime: '0:00',
      boardStyle: 'classic',
      profileColor: '#6366f1',
      createdAt: Date.now(),
      preferences: {
        notifications: true,
        sound: true,
        darkMode: isDarkMode,
      },
      friends: [],
      achievements: [],
    };
    
    setUser(demoUser);
    toast.success("Welcome, Guest! You're in demo mode.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      const user = await loginUser(username, password);
      setUser(user);
      toast.success("Welcome back!");
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const user = await registerUser(username, password);
      setUser(user);
      toast.success("Account created successfully!");
    } catch (error: any) {
      setError(error.message || "Registration failed. Username might already exist.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-[40px] font-bold not-italic no-underline text-left">
              Sudoku Game!
            </span>
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? 'Create an account to start playing' 
              : 'Sign in to begin earning XP and competing with friends'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full">
                {isRegistering ? 'Create Account' : 'Login'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
              >
                {isRegistering ? 'Already have an account? Login' : 'Create New Account'}
              </Button>
            </div>
          </form>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Ready to challenge your friends? 🎯
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Test with bot accounts (password: demo123):</p>
              <p>PuzzleMaster (bot), SudokuPro (bot), GridGuru (bot)</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="loginDarkMode" className="cursor-pointer">
                  Dark Mode
                </Label>
              </div>
              <Switch
                id="loginDarkMode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
            </div>
            
            {/* Bypass Button for Figma/Testing */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBypass}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              <Zap className="h-3 w-3 mr-1" />
              Quick Demo (Skip Login)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
