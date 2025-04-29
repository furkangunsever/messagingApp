import {io, Socket} from 'socket.io-client';
import {API_URL} from '../config/constants';
import {Room} from '../types';

interface ISocketService {
  socket: Socket | null;
  connect: (username: string) => void;
  disconnect: () => void;
  sendMessage: (roomId: string, content: string, senderId?: string) => void;
  joinRoom: (roomId: string, password?: string) => void;
  leaveRoom: (roomId: string) => void;
  createRoom: (
    name: string,
    type: 'public' | 'private',
    password?: string,
  ) => void;
  onMessage: (callback: (message: any) => void) => void;
  onRoomJoined: (callback: (room: any) => void) => void;
  onRoomLeft: (callback: (room: any) => void) => void;
  onRoomsList: (callback: (rooms: Room[]) => void) => void;
  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: () => void) => void;
  onError: (callback: (error: string) => void) => void;
  isConnected: () => boolean;
  getRoomsList: () => void;
}

class SocketService implements ISocketService {
  socket: Socket | null = null;

  connect(username: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      // Bağlantı kurulduğunda kimlik doğrulama yap
      this.socket?.emit('authenticate', {username});
    });

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('error', error => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(roomId: string, content: string, senderId?: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_message', {
      room_id: roomId,
      content: content,
      sender_id: senderId,
    });
  }

  joinRoom(roomId: string, password?: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    const data: any = {room_id: roomId};
    if (password) {
      data.password = password;
    }

    this.socket.emit('join_room', data);
  }

  leaveRoom(roomId: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('leave_room', {room_id: roomId});
  }

  createRoom(
    name: string,
    type: 'public' | 'private',
    password?: string,
  ): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    const data: any = {
      name: name,
      type: type,
    };

    if (type === 'private' && password) {
      data.password = password;
    }

    this.socket.emit('create_room', data);
  }

  onMessage(callback: (message: any) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('message', message => {
      console.log('Odaya gelen mesaj:', {
        odaId: message.room_id || message.roomId,
        gönderen: message.sender_id || message.senderId,
        içerik: message.content,
        zaman: message.timestamp || new Date().toISOString(),
      });
      callback(message);
    });
  }

  onRoomJoined(callback: (room: any) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('user_joined_room', callback);
  }

  onRoomLeft(callback: (room: any) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('user_left_room', callback);
  }

  onRoomsList(callback: (rooms: Room[]) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('rooms_list', callback);
  }

  onConnect(callback: () => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('connect', callback);
  }

  onDisconnect(callback: () => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('disconnect', callback);
  }

  onError(callback: (error: string) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('error', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getRoomsList(): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_rooms', (rooms: Room[]) => {
      console.log('Rooms received:', rooms);
      // Callback ile gelen oda listesini doğrudan 'rooms_list' eventi olarak yayın
      if (this.socket) {
        // Manuel olarak dinleyicilere veriyi gönder
        this.socket.emit('rooms_list', rooms);
      }
    });
  }
}

// Singleton instance
const socketServiceInstance = new SocketService();
export default socketServiceInstance;
