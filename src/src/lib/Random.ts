// In your multiplayerApi.ts (or a new logger file)

// A simple logger function
function logStatus(message: string) {
  console.log(`[MultiplayerAPI] ${message}`);
}

// Example usage
export async function apiCreateRoom(...) {
  logStatus("Creating room...");
  const res = await fetch(…);
  if (!res.ok) {
    logStatus("Create room failed");
    throw new Error("Failed to create room");
  }
  const data = await res.json();
  logStatus("Room created successfully: " + JSON.stringify(data));
  return data;
}

// Inside other API calls too
export async function apiJoinRoomByCode(...) {
  logStatus(`User ${user.id} joining room ${roomCode}`);
  const res = await fetch(…);
  const data = await res.json();
  logStatus(`User ${user.id} joined room: ${JSON.stringify(data)}`);
  return data;
}

// …and so on for other methods
