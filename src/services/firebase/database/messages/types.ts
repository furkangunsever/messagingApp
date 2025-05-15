export interface FirebaseMessage {
  sender: string;
  text: string;
  timestamp: number;
  pinned: boolean;
  mediaUrl?: string;
}

export interface MessageDatabase {
  [messageId: string]: FirebaseMessage;
}

export interface CommunityMessages {
  [communityId: string]: MessageDatabase;
}
