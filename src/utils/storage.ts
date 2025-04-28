import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../config/constants';
import {User, Message} from '../types';

/**
 * Kullanıcı verilerini AsyncStorage'a kaydetmek için yardımcı fonksiyonlar
 */
export const saveUserData = async (
  user: User,
  token: string,
): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_TOKEN, token],
      [STORAGE_KEYS.USER_ID, user.id],
      [STORAGE_KEYS.USER_NAME, user.username],
    ]);
  } catch (error) {
    console.error('Kullanıcı verisi kaydedilemedi:', error);
    throw error;
  }
};

export const getUserToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  } catch (error) {
    console.error("Kullanıcı token'ı alınamadı:", error);
    return null;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    const [id, username] = await AsyncStorage.multiGet([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_NAME,
    ]);

    if (!id[1] || !username[1]) {
      return null;
    }

    return {
      id: id[1],
      username: username[1],
    };
  } catch (error) {
    console.error('Kullanıcı verileri alınamadı:', error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_NAME,
    ]);
  } catch (error) {
    console.error('Kullanıcı verileri temizlenemedi:', error);
    throw error;
  }
};

/**
 * Çevrimdışı mesajlar için yardımcı fonksiyonlar
 */
const OFFLINE_MESSAGES_KEY = '@socket_chat:offline_messages';

export const saveOfflineMessage = async (message: Message): Promise<void> => {
  try {
    const storedMessagesJson = await AsyncStorage.getItem(OFFLINE_MESSAGES_KEY);
    const storedMessages: Message[] = storedMessagesJson
      ? JSON.parse(storedMessagesJson)
      : [];

    storedMessages.push(message);

    await AsyncStorage.setItem(
      OFFLINE_MESSAGES_KEY,
      JSON.stringify(storedMessages),
    );
  } catch (error) {
    console.error('Çevrimdışı mesaj kaydedilemedi:', error);
    throw error;
  }
};

export const getOfflineMessages = async (): Promise<Message[]> => {
  try {
    const storedMessagesJson = await AsyncStorage.getItem(OFFLINE_MESSAGES_KEY);
    return storedMessagesJson ? JSON.parse(storedMessagesJson) : [];
  } catch (error) {
    console.error('Çevrimdışı mesajlar alınamadı:', error);
    return [];
  }
};

export const clearOfflineMessages = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_MESSAGES_KEY);
  } catch (error) {
    console.error('Çevrimdışı mesajlar temizlenemedi:', error);
    throw error;
  }
};
