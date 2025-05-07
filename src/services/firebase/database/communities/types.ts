export interface Community {
  name: string;
  type: 'public' | 'private';
  category: string;
  description: string;
  createdBy: string;
  createdAt: number;
  password?: string;
}

export interface CommunityMember {
  [uid: string]: boolean;
}

export interface CommunityDatabase {
  [communityId: string]: Community;
}

export interface CommunityMembersDatabase {
  [communityId: string]: CommunityMember;
} 