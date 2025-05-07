import {MESSAGE_TYPES} from '../config/constants';

export interface User {
  id: string;
  username: string;
  email?: string;
  photoURL?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  participants?: string[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  content: string;
  type: keyof typeof MESSAGE_TYPES;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
  size: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  emailVerificationSent: boolean;
  resetPasswordSent: boolean;
}

export interface ChatState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: {[roomId: string]: Message[]};
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  chat: ChatState;
}

export interface AppTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

export interface LoginCredentials {
  username: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface EmailVerificationCredentials {
  email: string;
  code: string;
}

export interface PasswordChangeCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetCredentials {
  email: string;
}

export interface PasswordUpdateCredentials {
  password: string;
  confirmPassword: string;
}
