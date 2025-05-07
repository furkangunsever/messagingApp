import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Alert} from 'react-native';
import {errorLogger} from '../../../utils/errorLogger';
import database from '@react-native-firebase/database';

// Firebase Auth Servisi
class FirebaseAuthService {
  // Kullanıcı giriş işlemi
  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      console.log('[AUTH] Kullanıcı giriş denemesi başlatılıyor: ', email);

      // Doğrudan oturum açmayı deneyelim
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      console.log('[AUTH] Firebase yanıtı alındı', userCredential.user?.uid);

      if (!userCredential.user.emailVerified) {
        console.log('[AUTH] Email doğrulanmamış: ', email);
        await userCredential.user.sendEmailVerification();
        throw {
          code: 'auth/email-not-verified',
          message: 'E-posta adresiniz henüz doğrulanmamış.',
        };
      }

      console.log('[AUTH] Giriş başarılı: ', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.log(
        '[AUTH] Giriş hatası: ',
        error.code || 'bilinmeyen hata',
        error.message,
      );

      // Firebase'in kendi hatasını kontrol et ve uygun bir hata mesajı göster
      if (error.code === 'auth/user-not-found') {
        error.message = 'Bu e-posta adresine ait kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        error.message = 'Geçersiz şifre. Lütfen şifrenizi kontrol edin.';
      } else if (error.code === 'auth/invalid-email') {
        error.message = 'Geçersiz e-posta formatı.';
      } else if (error.code === 'auth/user-disabled') {
        error.message = 'Bu kullanıcı hesabı devre dışı bırakılmış.';
      }

      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);

      // Oturumu tamamen kapatmak için ek önlem
      try {
        await auth().signOut();
      } catch (signOutError) {
        console.log('[AUTH] Hata sonrası çıkış hatası: ', signOutError);
      }

      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Kullanıcının var olup olmadığını kontrol et
  async checkUserExists(email: string) {
    try {
      console.log('[AUTH] Kullanıcı kontrolü başlatılıyor: ', email);

      // Daha iyi bir Firebase yazılım pratiği uygulayalım
      const methods = await auth().fetchSignInMethodsForEmail(email);
      console.log('[AUTH] Bulunan oturum açma yöntemleri:', methods);

      // Boş e-posta veya oturum açma yöntemi yoksa kullanıcı yoktur
      if (!email || !methods || methods.length === 0) {
        console.log('[AUTH] Kullanıcı bulunamadı');
        return false;
      }

      console.log('[AUTH] Kullanıcı mevcut');
      return true;
    } catch (error) {
      console.log('[AUTH] Kullanıcı kontrolünde hata:', error);
      // Burada false dönmek zorunda değiliz, hata Firebase'den geldiyse, belki kullanıcı vardır
      return false;
    }
  }

  // Kullanıcı kayıt işlemi
  async createUserWithEmailAndPassword(
    email: string,
    password: string,
    displayName: string,
  ) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      await userCredential.user.updateProfile({displayName});
      await userCredential.user.sendEmailVerification();

      return userCredential.user;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Google ile giriş işlemi
  async signInWithGoogle() {
    try {
      console.log('[AUTH] Google giriş başlatılıyor');
      await GoogleSignin.hasPlayServices();
      const googleSignInResult = await GoogleSignin.signIn();

      if (!googleSignInResult) {
        console.log('[AUTH] Google sign-in result boş');
        throw {
          code: 'auth/google-signin-cancelled',
          message: 'Google ile giriş işlemi iptal edildi veya başarısız oldu.',
        };
      }

      const {idToken} = await GoogleSignin.getTokens();
      if (!idToken) {
        console.log('[AUTH] Google idToken alınamadı');
        throw {
          code: 'auth/invalid-credential',
          message: 'Google kimlik bilgileri alınamadı. Lütfen tekrar deneyin.',
        };
      }

      console.log('[AUTH] Google credential oluşturuluyor');
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      if (!userCredential.user) {
        console.log(
          '[AUTH] Google ile giriş sonrası kullanıcı bilgisi alınamadı',
        );
        throw {
          code: 'auth/user-not-found',
          message:
            'Google ile giriş başarılı fakat kullanıcı bilgileri alınamadı.',
        };
      }

      console.log('[AUTH] Google giriş başarılı: ', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.log(
        '[AUTH] Google giriş hatası: ',
        error.code || 'bilinmeyen hata',
      );

      if (!error) {
        error = {
          code: 'auth/unknown-error',
          message: 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.',
        };
      }

      if (error.code === 'SIGN_IN_CANCELLED') {
        error = {
          code: 'auth/cancelled-popup-request',
          message: 'Google ile giriş işlemi iptal edildi.',
        };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        error = {
          code: 'auth/missing-google-playservices',
          message:
            'Google Play Services kullanılamıyor. Lütfen cihazınızı kontrol edin.',
        };
      }

      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);

      // Oturumu tamamen kapatmak için ek önlem
      try {
        await auth().signOut();
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log(
          '[AUTH] Google hatası sonrası çıkış hatası: ',
          signOutError,
        );
      }

      throw {
        code: error.code || 'auth/unknown-error',
        message: error.message || 'Google ile giriş sırasında bir hata oluştu.',
        userMessage: appError.message,
      };
    }
  }

  // Şifre sıfırlama e-postası gönderme
  async sendPasswordResetEmail(email: string) {
    try {
      await auth().sendPasswordResetEmail(email);
      return true;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Şifre değiştirme
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const user = auth().currentUser;

      if (!user || !user.email) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      return true;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Çıkış yapma
  async signOut() {
    try {
      await auth().signOut();
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
      }
      return true;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message,
      };
    }
  }

  // Kullanıcının durumunu takip et
  onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }

  // Mevcut kullanıcıyı al
  async getCurrentUser() {
    return auth().currentUser;
  }

  // Email doğrulama kodu kontrolü
  async verifyEmail(email: string, code: string) {
    try {
      // Firebase'de doğrudan link üzerinden yapılan bir işlem, bu bir özel uygulama
      await auth().applyActionCode(code);
      return true;
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

const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
