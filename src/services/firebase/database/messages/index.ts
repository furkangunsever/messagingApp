import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import {errorLogger} from '../../../../utils/errorLogger';
import {Message, MessageDatabase, CommunityMessages} from './types';

class MessageService {
  private messagesRef = database().ref('messages');

  async sendMessage(
    communityId: string,
    message: Omit<Message, 'timestamp'>,
  ): Promise<string> {
    try {
      const newMessageRef = this.messagesRef.child(communityId).push();
      const messageId = newMessageRef.key!;

      await newMessageRef.set({
        ...message,
        timestamp: Date.now(),
      });

      return messageId;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getMessages(communityId: string): Promise<MessageDatabase | null> {
    try {
      const snapshot = await this.messagesRef.child(communityId).once('value');
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

  async updateMessage(
    communityId: string,
    messageId: string,
    data: Partial<Message>,
  ): Promise<void> {
    try {
      await this.messagesRef.child(communityId).child(messageId).update(data);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async deleteMessage(communityId: string, messageId: string): Promise<void> {
    try {
      await this.messagesRef.child(communityId).child(messageId).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async pinMessage(communityId: string, messageId: string): Promise<void> {
    try {
      await this.messagesRef
        .child(communityId)
        .child(messageId)
        .update({pinned: true});
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async unpinMessage(communityId: string, messageId: string): Promise<void> {
    try {
      await this.messagesRef
        .child(communityId)
        .child(messageId)
        .update({pinned: false});
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Mesajları dinle
  onMessagesChange(
    communityId: string,
    callback: (data: MessageDatabase | null) => void,
  ) {
    return this.messagesRef.child(communityId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Dinlemeyi durdur
  offMessagesChange(communityId: string) {
    this.messagesRef.child(communityId).off();
  }
}

export const messageService = new MessageService();
