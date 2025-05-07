export interface Hobby {
  id: string;
  name: string;
  emoji: string;
  isPopular?: boolean;
}

export interface HobbyInDatabase {
  name: string;
  emoji: string;
  users?: {
    [userId: string]: boolean;
  };
}

export interface UserHobbies {
  [hobbyId: string]: boolean;
}

export interface HobbySelectionProps {
  maxSelection?: number;
  onSelectionComplete?: (selectedHobbies: Hobby[]) => void;
}
