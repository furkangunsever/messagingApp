export interface UserHobbies {
  [hobbyId: string]: boolean;
}

export interface UserCommunities {
  [communityId: string]: boolean;
}

export interface UserBadges {
  [badgeId: string]: boolean;
}

export interface UserCalendar {
  [eventId: string]: boolean;
}

export interface UserDatabase {
  name: string;
  email: string;
  bio?: string;
  hobbies?: UserHobbies;
  joinedCommunities?: UserCommunities;
  earnedBadges?: UserBadges;
  profileEmoji?: string;
  myCalendar?: UserCalendar;
  settings?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
    privacy: 'public' | 'private';
  };
}
