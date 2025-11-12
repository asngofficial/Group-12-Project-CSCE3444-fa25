import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_API_BASE_URL;

export const socket: Socket = io(URL, {
  autoConnect: false,
});

export const connectSocket = (userId: string) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('user:connected', userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const listenForKick = (callback: (roomId: string) => void) => {
  socket.on('room:you_were_kicked', ({ roomId }) => {
    callback(roomId);
  });
};

export const stopListeningForKick = () => {
  socket.off('room:you_were_kicked');
};
