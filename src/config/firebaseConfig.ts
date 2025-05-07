import firebase from '@react-native-firebase/app';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const initializeFirebase = () => {
  if (!firebase.apps.length) {
    // Firebase otomatik olarak google-services.json'dan başlatılır
  }

  GoogleSignin.configure({
    webClientId: '422623805074-2svplrp61omve27i083a6b38bod9ksv3.apps.googleusercontent.com',
    offlineAccess: true,
  });
};
