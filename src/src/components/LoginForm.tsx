import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { useUser } from "../contexts/UserContext";
import { login, createAccount } from "../lib/accountManager";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    const result = login(username, password);
    
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setError(result.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
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

    const result = createAccount(username, password);
    
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
        </CardContent>
      </Card>
    </div>
  );
}

