import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import {errorLogger} from '../../../../utils/errorLogger';
import {Hobby, HobbyInDatabase} from './types';

class HobbyDatabaseService {
  private hobbiesRef = database().ref('hobbies');
  private usersRef = database().ref('users');

  // Tüm hobi listesini getir
  async getAllHobbies(): Promise<Hobby[]> {
    try {
      const snapshot = await this.hobbiesRef.once('value');
      const data = snapshot.val() || {};

      return Object.entries(data).map(([id, hobby]) => ({
        id,
        name: (hobby as HobbyInDatabase).name,
        emoji: (hobby as HobbyInDatabase).emoji,
      }));
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Hobinin detaylarını getir
  async getHobbyDetails(hobbyId: string): Promise<Hobby | null> {
    try {
      const snapshot = await this.hobbiesRef.child(hobbyId).once('value');

      if (!snapshot.exists()) {
        return null;
      }

      const hobbyData = snapshot.val() as HobbyInDatabase;
      return {
        id: hobbyId,
        name: hobbyData.name,
        emoji: hobbyData.emoji,
      };
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Bir kullanıcının hobilerini getir
  async getUserHobbies(userId: string): Promise<Hobby[]> {
    try {
      const snapshot = await this.usersRef
        .child(userId)
        .child('hobbies')
        .once('value');

      const userHobbies = snapshot.val() || {};
      const userHobbyIds = Object.keys(userHobbies).filter(
        id => userHobbies[id],
      );

      const hobbies: Hobby[] = [];

      for (const hobbyId of userHobbyIds) {
        const hobbyDetails = await this.getHobbyDetails(hobbyId);
        if (hobbyDetails) {
          hobbies.push(hobbyDetails);
        }
      }

      return hobbies;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Kullanıcının hobilerini güncelle
  async updateUserHobbies(
    userId: string,
    hobbies: {[hobbyId: string]: boolean},
  ): Promise<void> {
    try {
      const updates: {[path: string]: any} = {};

      // 1. Kullanıcı için hobi listesini güncelle
      updates[`users/${userId}/hobbies`] = hobbies;

      // 2. Her bir hobi için kullanıcı referansını güncelle
      for (const [hobbyId, isSelected] of Object.entries(hobbies)) {
        if (isSelected) {
          updates[`hobbies/${hobbyId}/users/${userId}`] = true;
        } else {
          updates[`hobbies/${hobbyId}/users/${userId}`] = null; // null ile silme
        }
      }

      // Toplu güncelleme yap
      await database().ref().update(updates);

      console.log('[HOBBY] Kullanıcı hobileri güncellendi:', userId);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Veritabanı için hobi listesini oluştur
  async initializeHobbiesInDatabase(): Promise<void> {
    try {
      const snapshot = await this.hobbiesRef.once('value');

      // Eğer hobiler veritabanında zaten varsa, yeniden oluşturma
      if (snapshot.exists() && Object.keys(snapshot.val()).length > 0) {
        console.log('[HOBBY] Hobiler zaten veritabanında mevcut');
        return;
      }

      // hobiler.json dosyasından veriyi al
      const hobilerData = require('../../../../utils/hobiler.json');
      const updates: {[path: string]: HobbyInDatabase} = {};

      // Hobi verilerini formatla
      Object.entries(hobilerData.hobiler).forEach(
        ([key, value]: [string, any]) => {
          updates[key] = {
            name: value.isim,
            emoji: value.emoji,
            users: {},
          };
        },
      );

      // Veritabanına toplu güncelleme
      await this.hobbiesRef.update(updates);
      console.log('[HOBBY] Hobiler veritabanına başarıyla yüklendi');
    } catch (error: any) {
      console.error('[HOBBY] Hobiler yüklenirken hata:', error);
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', 'Hobi listesi yüklenirken bir sorun oluştu.');
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Bir hobiye abone olan tüm kullanıcıları getir
  async getHobbyUsers(hobbyId: string): Promise<string[]> {
    try {
      const snapshot = await this.hobbiesRef
        .child(hobbyId)
        .child('users')
        .once('value');

      const users = snapshot.val() || {};
      return Object.keys(users).filter(id => users[id]);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }
}

export const hobbyDatabaseService = new HobbyDatabaseService();
