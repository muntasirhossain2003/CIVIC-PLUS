import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let io: SocketServer;

export function initSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.on('connection', (socket: Socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitIssueNew(issue: unknown) {
  io?.emit('issue:new', issue);
}

export function emitStatusChanged(issueId: string, status: string) {
  io?.emit('issue:status_changed', { issueId, status });
}

export function emitNotification(userId: string, notification: unknown) {
  io?.to(`user:${userId}`).emit('notification', notification);
}
