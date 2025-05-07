import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import {errorLogger} from '../../../../utils/errorLogger';
import {
  UserDatabase,
  UserHobbies,
  UserCommunities,
  UserBadges,
  UserCalendar,
} from './types';

class UserDatabaseService {
  private usersRef = database().ref('users');

  async getUserData(uid: string): Promise<UserDatabase | null> {
    try {
      const snapshot = await this.usersRef.child(uid).once('value');
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

  async updateUserData(
    uid: string,
    data: Partial<UserDatabase>,
  ): Promise<void> {
    try {
      await this.usersRef.child(uid).update(data);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateUserHobbies(uid: string, hobbies: UserHobbies): Promise<void> {
    try {
      await this.usersRef.child(uid).child('hobbies').update(hobbies);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateUserCommunities(
    uid: string,
    communities: UserCommunities,
  ): Promise<void> {
    try {
      await this.usersRef
        .child(uid)
        .child('joinedCommunities')
        .update(communities);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateUserBadges(uid: string, badges: UserBadges): Promise<void> {
    try {
      await this.usersRef.child(uid).child('earnedBadges').update(badges);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateUserCalendar(uid: string, calendar: UserCalendar): Promise<void> {
    try {
      await this.usersRef.child(uid).child('myCalendar').update(calendar);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async updateUserSettings(
    uid: string,
    settings: NonNullable<UserDatabase['settings']>,
  ): Promise<void> {
    try {
      await this.usersRef.child(uid).child('settings').update(settings);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Kullanıcı verilerini dinle
  onUserDataChange(uid: string, callback: (data: UserDatabase | null) => void) {
    return this.usersRef.child(uid).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Kullanıcı verilerini dinlemeyi durdur
  offUserDataChange(uid: string) {
    this.usersRef.child(uid).off();
  }
}

export const userDatabaseService = new UserDatabaseService();
