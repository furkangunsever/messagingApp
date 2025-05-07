export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  profileEmoji?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  privacy: 'public' | 'private';
}

export interface AuthError {
  code: string;
  message: string;
  userMessage?: string;
}
