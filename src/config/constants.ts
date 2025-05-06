// API ve Socket.IO bağlantısı için URL
export const API_URL = 'https://socket-based-messaging.onrender.com';

// AsyncStorage anahtarları
export const STORAGE_KEYS = {
  USER_TOKEN: '@socket_chat:user_token',
  USER_ID: '@socket_chat:user_id',
  USER_NAME: '@socket_chat:user_name',
};

// Uygulama renkleri
export const COLORS = {
  PRIMARY: '#6200ee',
  PRIMARY_DARK: '#3700b3',
  SECONDARY: '#03dac6',
  SECONDARY_DARK: '#018786',
  ERROR: '#B00020',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#FFFFFF',
  TEXT: '#000000',
  TEXT_LIGHT: '#666666',
  TEXT_DISABLED: '#9E9E9E',
  MESSAGE_SENT: '#E3F2FD',
  MESSAGE_RECEIVED: '#F5F5F5',
};

// Mesaj türleri
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
};

// Ekran isimleri
export const SCREENS = {
  // Auth ekranları
  LOGIN: 'Login',
  REGISTER: 'Register',
  EMAIL_VERIFICATION: 'EmailVerification',
  FORGOT_PASSWORD: 'ForgotPassword',
  CHANGE_PASSWORD: 'ChangePassword',

  // Ana ekranlar
  ROOM_LIST: 'RoomList',
  CHAT_ROOM: 'ChatRoom',
  CREATE_ROOM: 'CreateRoom',

  // Hobi ve ilgi alanları
  HOBBY_SELECT: 'HobbySelect',
} as const;

// Socket.IO olayları
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  NEW_MESSAGE: 'new_message',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  SEND_MESSAGE: 'send_message',
  ROOMS_LIST: 'rooms_list',
  GET_ROOMS: 'get_rooms',
  CREATE_ROOM: 'create_room',
};
