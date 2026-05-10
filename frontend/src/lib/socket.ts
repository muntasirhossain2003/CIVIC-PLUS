import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io', withCredentials: true });
  }
  return socket;
}

export function joinUserRoom(userId: string) {
  getSocket().emit('join:user', userId);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
