export interface Message {
  sender: string;
  text: string;
  timestamp: number;
  pinned: boolean;
  mediaUrl?: string;
}

export interface MessageDatabase {
  [messageId: string]: Message;
}

export interface CommunityMessages {
  [communityId: string]: MessageDatabase;
}
