// src/lib/multiplayerApi.ts

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiCreateRoom({
  hostId,
  hostName,
  difficulty,
  grid,
  maxPlayers = 50,
}: {
  hostId: string;
  hostName: string;
  difficulty: string;
  grid: (number | null)[][];
  maxPlayers?: number;
}) {
  const res = await fetch(`${BASE_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hostId, hostName, difficulty, grid, maxPlayers }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
}

export async function apiJoinRoomByCode({
  roomCode,
  user,
}: {
  roomCode: string;
  user: {
    id: string;
    username: string;
    profileColor?: string;
    profilePicture?: string;
    level?: number;
  };
}) {
  const res = await fetch(`${BASE_URL}/api/rooms/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomCode,
      userId: user.id,
      username: user.username,
      profileColor: user.profileColor,
      profilePicture: user.profilePicture,
      level: user.level,
    }),
  });
  return res.json();
}

export async function apiGetRoom(roomId: string) {
  const res = await fetch(`${BASE_URL}/api/rooms/${roomId}`);
  if (!res.ok) throw new Error("Room not found");
  return res.json();
}

export async function apiGetUserRooms(userId: string) {
  const res = await fetch(`${BASE_URL}/api/user/${userId}/rooms`);
  if (!res.ok) throw new Error("Failed to get user rooms");
  return res.json();
}

export async function apiGetFriends(userId: string) {
  const res = await fetch(`${BASE_URL}/api/users/${userId}/friends`);
  if (!res.ok) throw new Error("Failed to get friends");
  return res.json();
}

export async function apiGetUser(userId: string) {
  const res = await fetch(`${BASE_URL}/api/users/${userId}`);
  if (!res.ok) throw new Error("Failed to get user");
  return res.json();
}

export async function apiRegister(username, password) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

export async function apiLogin(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

export async function apiSendChallenge(
  fromUserId: string,
  toUserId: string,
  difficulty: string
) {
  const res = await fetch(`${BASE_URL}/api/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromUserId, toUserId, difficulty }),
  });
  if (!res.ok) throw new Error("Failed to send challenge");
  return res.json();
}

export async function apiGetNotifications(userId: string) {
  const res = await fetch(`${BASE_URL}/api/users/${userId}/notifications`);
  if (!res.ok) throw new Error("Failed to get notifications");
  return res.json();
}

export async function apiAcceptChallenge(notificationId: string, userId: string) {
  const res = await fetch(
    `${BASE_URL}/api/challenges/${notificationId}/accept`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );
  if (!res.ok) throw new Error("Failed to accept challenge");
  return res.json();
}

export async function apiLeaveRoom(roomId: string, userId: string) {
  await fetch(`${BASE_URL}/api/rooms/${roomId}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

export async function apiSetReady(roomId: string, userId: string, isReady: boolean) {
  const res = await fetch(`${BASE_URL}/api/rooms/${roomId}/ready`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, isReady }),
  });
  return res.json();
}

export async function apiStartGame(roomId: string, userId: string) {
  const res = await fetch(`${BASE_URL}/api/rooms/${roomId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function apiUpdateProgress(
  roomId: string,
  userId: string,
  filledCells: number,
  progress: number
) {
  const res = await fetch(`${BASE_URL}/api/rooms/${roomId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, filledCells, progress }),
  });
  return res.json();
}
