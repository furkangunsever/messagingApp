import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Firebase başlatma fonksiyonu
export const initializeFirebase = () => {
  // Firebase'in zaten başlatılıp başlatılmadığını kontrol et
  if (!firebase.apps.length) {
    // Firebase SDK bunu otomatik olarak android/app/google-services.json ve ios/GoogleService-Info.plist
    // dosyalarından yapılandırır, elle bir şey eklemeye gerek yoktur.
  }

  // Google Sign-In başlatma
  GoogleSignin.configure({
    webClientId:
      '422623805074-2svplrp61omve27i083a6b38bod9ksv3.apps.googleusercontent.com', // Burada tam ID'yi kullanın
    offlineAccess: true,
  });

  console.log('Firebase başarıyla başlatıldı');
};

// Firebase durumunu kontrol et
// export const checkAuthState = (
//   callback: (user: firebase.User | null) => void,
// ) => {
//   return auth().onAuthStateChanged(callback);
// };

// Firebase'i dışa aktar
export default firebase;
