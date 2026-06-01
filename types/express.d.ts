import { Server as SocketServer } from 'socket.io';
declare global {
  namespace Express {
    interface Application {
      get(name: 'io'): SocketServer;
      set(name: 'io', value: SocketServer): void;
    }
  }
}
