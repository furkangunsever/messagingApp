import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import {errorLogger} from '../../../../utils/errorLogger';
import {
  Community,
  CommunityMember,
  CommunityDatabase,
  CommunityMembersDatabase,
  Room,
  RoomDatabase,
  RoomMembersDatabase,
} from './types';

class CommunityService {
  private communitiesRef = database().ref('communities');
  private membersRef = database().ref('community_members');

  async createCommunity(community: Community): Promise<string> {
    try {
      const newCommunityRef = this.communitiesRef.push();
      const communityId = newCommunityRef.key!;

      await newCommunityRef.set({
        ...community,
        createdAt: Date.now(),
      });

      // Topluluk üyelerini başlat
      await this.membersRef.child(communityId).set({
        [community.createdBy]: true,
      });

      return communityId;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getCommunity(communityId: string): Promise<Community | null> {
    try {
      const snapshot = await this.communitiesRef
        .child(communityId)
        .once('value');
      return snapshot.val();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateCommunity(
    communityId: string,
    data: Partial<Community>,
  ): Promise<void> {
    try {
      await this.communitiesRef.child(communityId).update(data);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async deleteCommunity(communityId: string): Promise<void> {
    try {
      await this.communitiesRef.child(communityId).remove();
      await this.membersRef.child(communityId).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async joinCommunity(communityId: string, uid: string): Promise<void> {
    try {
      await this.membersRef.child(communityId).child(uid).set(true);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async leaveCommunity(communityId: string, uid: string): Promise<void> {
    try {
      await this.membersRef.child(communityId).child(uid).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getCommunityMembers(
    communityId: string,
  ): Promise<CommunityMember | null> {
    try {
      const snapshot = await this.membersRef.child(communityId).once('value');
      return snapshot.val();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async isUserMemberOfCommunity(
    communityId: string,
    uid: string,
  ): Promise<boolean> {
    try {
      const snapshot = await this.membersRef
        .child(communityId)
        .child(uid)
        .once('value');
      return snapshot.exists();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Topluluk verilerini dinle
  onCommunityChange(
    communityId: string,
    callback: (data: Community | null) => void,
  ) {
    return this.communitiesRef.child(communityId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Topluluk üyelerini dinle
  onCommunityMembersChange(
    communityId: string,
    callback: (data: CommunityMember | null) => void,
  ) {
    return this.membersRef.child(communityId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Dinlemeyi durdur
  offCommunityChange(communityId: string) {
    this.communitiesRef.child(communityId).off();
  }

  offCommunityMembersChange(communityId: string) {
    this.membersRef.child(communityId).off();
  }
}

// Yeni Room Service sınıfı
class RoomService {
  private roomsRef = database().ref('chat_rooms');
  private roomMembersRef = database().ref('room_members');

  async createRoom(room: Omit<Room, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newRoomRef = this.roomsRef.push();
      const roomId = newRoomRef.key!;

      await newRoomRef.set({
        ...room,
        id: roomId,
        createdAt: Date.now(),
      });

      // Odaya katılan ilk üye olarak oluşturanı ekle
      await this.roomMembersRef.child(roomId).set({
        [room.createdBy]: true,
      });

      return roomId;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const snapshot = await this.roomsRef.child(roomId).once('value');
      return snapshot.val();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getAllRooms(): Promise<RoomDatabase | null> {
    try {
      const snapshot = await this.roomsRef.once('value');
      return snapshot.val();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateRoom(roomId: string, data: Partial<Room>): Promise<void> {
    try {
      await this.roomsRef.child(roomId).update(data);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateLastMessage(
    roomId: string,
    content: string,
    senderId: string,
  ): Promise<void> {
    try {
      await this.roomsRef.child(roomId).update({
        lastMessage: {
          content,
          senderId,
          timestamp: Date.now(),
        },
      });
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    try {
      await this.roomsRef.child(roomId).remove();
      await this.roomMembersRef.child(roomId).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    try {
      await this.roomMembersRef.child(roomId).child(userId).set(true);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      await this.roomMembersRef.child(roomId).child(userId).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getRoomMembers(
    roomId: string,
  ): Promise<{[userId: string]: boolean} | null> {
    try {
      const snapshot = await this.roomMembersRef.child(roomId).once('value');
      return snapshot.val();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Oda verilerini dinle
  onRoomChange(roomId: string, callback: (data: Room | null) => void) {
    return this.roomsRef.child(roomId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Tüm odaları dinle
  onAllRoomsChange(callback: (data: RoomDatabase | null) => void) {
    return this.roomsRef.on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Oda üyelerini dinle
  onRoomMembersChange(
    roomId: string,
    callback: (data: {[userId: string]: boolean} | null) => void,
  ) {
    return this.roomMembersRef.child(roomId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Dinlemeyi durdur
  offRoomChange(roomId: string) {
    this.roomsRef.child(roomId).off();
  }

  offAllRoomsChange() {
    this.roomsRef.off();
  }

  offRoomMembersChange(roomId: string) {
    this.roomMembersRef.child(roomId).off();
  }
}

export const communityService = new CommunityService();
export const roomService = new RoomService();
