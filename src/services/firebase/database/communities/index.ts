import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import {errorLogger} from '../../../../utils/errorLogger';
import {
  Community,
  CommunityMember,
  CommunityDatabase,
  CommunityMembersDatabase,
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

export const communityService = new CommunityService();
