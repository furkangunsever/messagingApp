import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import {errorLogger} from '../../../../utils/errorLogger';
import {
  Event,
  EventAttendees,
  EventDatabase,
  EventAttendeesDatabase,
} from './types';

class EventService {
  private eventsRef = database().ref('events');
  private attendeesRef = database().ref('event_attendees');

  async createEvent(event: Event): Promise<string> {
    try {
      const newEventRef = this.eventsRef.push();
      const eventId = newEventRef.key!;

      await newEventRef.set(event);

      // Etkinlik katılımcılarını başlat
      await this.attendeesRef.child(eventId).set({
        [event.createdBy]: true,
      });

      return eventId;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getEvent(eventId: string): Promise<Event | null> {
    try {
      const snapshot = await this.eventsRef.child(eventId).once('value');
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

  async updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
    try {
      await this.eventsRef.child(eventId).update(data);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.eventsRef.child(eventId).remove();
      await this.attendeesRef.child(eventId).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async joinEvent(eventId: string, uid: string): Promise<void> {
    try {
      await this.attendeesRef.child(eventId).child(uid).set(true);
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async leaveEvent(eventId: string, uid: string): Promise<void> {
    try {
      await this.attendeesRef.child(eventId).child(uid).remove();
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  async getEventAttendees(eventId: string): Promise<EventAttendees | null> {
    try {
      const snapshot = await this.attendeesRef.child(eventId).once('value');
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

  async isUserAttendingEvent(eventId: string, uid: string): Promise<boolean> {
    try {
      const snapshot = await this.attendeesRef
        .child(eventId)
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

  // Etkinlik verilerini dinle
  onEventChange(eventId: string, callback: (data: Event | null) => void) {
    return this.eventsRef.child(eventId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Etkinlik katılımcılarını dinle
  onEventAttendeesChange(
    eventId: string,
    callback: (data: EventAttendees | null) => void,
  ) {
    return this.attendeesRef.child(eventId).on('value', snapshot => {
      callback(snapshot.val());
    });
  }

  // Dinlemeyi durdur
  offEventChange(eventId: string) {
    this.eventsRef.child(eventId).off();
  }

  offEventAttendeesChange(eventId: string) {
    this.attendeesRef.child(eventId).off();
  }
}

export const eventService = new EventService();
