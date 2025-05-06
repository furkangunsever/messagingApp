import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Firebase Realtime Database URL'si
export const FIREBASE_DB_URL =
  'https://messagingapp-36171-default-rtdb.europe-west1.firebasedatabase.app';

// Firebase başlatma fonksiyonu
export const initializeFirebase = () => {
  // Firebase'i başlat
  if (!firebase.apps.length) {
    // Firebase SDK bunu otomatik olarak android/app/google-services.json ve ios/GoogleService-Info.plist
    // dosyalarından yapılandırır
  }

  // Veritabanı URL'sini ayarla
  try {
    if (database().app && database().app.options) {
      database().app.options.databaseURL = FIREBASE_DB_URL;
    }
  } catch (error) {
    // Hata durumunda sessizce devam et
  }

  // Google Sign-In başlatma
  GoogleSignin.configure({
    webClientId:
      '422623805074-2svplrp61omve27i083a6b38bod9ksv3.apps.googleusercontent.com',
    offlineAccess: true,
  });
};

// Firebase durumunu kontrol et
// export const checkAuthState = (
//   callback: (user: firebase.User | null) => void,
// ) => {
//   return auth().onAuthStateChanged(callback);
// };

// Firebase'i dışa aktar
export default firebase;
