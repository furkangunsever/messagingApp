export interface Event {
  title: string;
  communityId: string;
  date: string;
  createdBy: string;
  description?: string;
  location?: string;
  maxAttendees?: number;
}

export interface EventAttendees {
  [uid: string]: boolean;
}

export interface EventDatabase {
  [eventId: string]: Event;
}

export interface EventAttendeesDatabase {
  [eventId: string]: EventAttendees;
}
