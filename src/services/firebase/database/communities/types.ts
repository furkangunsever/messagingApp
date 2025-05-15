export interface Community {
  name: string;
  type: 'public' | 'private';
  category: string;
  description: string;
  createdBy: string;
  createdAt: number;
  password?: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'public' | 'private';
  createdBy: string;
  createdAt: number;
  password?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: number;
  };
}

export interface CommunityMember {
  [uid: string]: boolean;
}

export interface CommunityDatabase {
  [communityId: string]: Community;
}

export interface RoomDatabase {
  [roomId: string]: Room;
}

export interface CommunityMembersDatabase {
  [communityId: string]: CommunityMember;
}

export interface RoomMembersDatabase {
  [roomId: string]: {
    [userId: string]: boolean;
  };
}
