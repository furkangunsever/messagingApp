import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Alert} from 'react-native';
import {errorLogger} from '../utils/errorLogger';
import database from '@react-native-firebase/database';
import {FIREBASE_DB_URL} from '../config/firebaseConfig';

// Firebase bağlantısını doğrudan başlat
try {
  if (database().app && database().app.options) {
    database().app.options.databaseURL = FIREBASE_DB_URL;
  }
} catch (err) {
  // Hata durumunda sessiz kal
}

// Firebase Auth Servisi
class FirebaseAuthService {
  // Kullanıcı giriş işlemi
  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      // E-posta doğrulanmamışsa özel hata fırlat
      if (!userCredential.user.emailVerified) {
        // Doğrulama e-postasını tekrar gönder
        await userCredential.user.sendEmailVerification();
        throw {
          code: 'auth/email-not-verified',
          message: 'E-posta adresiniz henüz doğrulanmamış.',
        };
      }

      return userCredential.user;
    } catch (error: any) {
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);
      throw {
        ...error,
        userMessage: appError.message, // Kullanıcıya gösterilecek mesaj
      };
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

      // Kullanıcı adını güncelle
      await userCredential.user.updateProfile({displayName});

      // E-posta doğrulama gönder
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
      // Google giriş yapılandırması
      await GoogleSignin.hasPlayServices();
      const googleSignInResult = await GoogleSignin.signIn();

      // googleSignInResult kontrolü
      if (!googleSignInResult) {
        throw {
          code: 'auth/google-signin-cancelled',
          message: 'Google ile giriş işlemi iptal edildi veya başarısız oldu.',
        };
      }

      // Google kimlik doğrulama - API yapısına göre idToken kullanımı
      const {idToken, accessToken} = await GoogleSignin.getTokens();
      if (!idToken) {
        throw {
          code: 'auth/invalid-credential',
          message: 'Google kimlik bilgileri alınamadı. Lütfen tekrar deneyin.',
        };
      }

      // Firebase kimlik bilgisi oluştur (idToken ile)
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Firebase'e giriş yap
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      return userCredential.user;
    } catch (error: any) {
      // Hata nesnesi kontrolü
      if (!error) {
        error = {
          code: 'auth/unknown-error',
          message: 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.',
        };
      }

      // Google Sign-In'in kendi hata kodları için özel mesajlar
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

      // Hata mesajını hazırla
      const appError = errorLogger.logFirebaseError(error);
      Alert.alert('Hata', appError.message);

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

  // E-posta doğrulama kontrolü
  async verifyEmail(email: string, code: string) {
    try {
      // Bu kısım Firebase'in API'ına bağlıdır,
      // Firebase doğrudan kod ile e-posta doğrulama yapmaz.
      // Burada normalde kullanıcı e-postasındaki linke tıklar.

      // Bu örnek implementation amaçlıdır
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

      // Yeniden kimlik doğrulama
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await user.reauthenticateWithCredential(credential);

      // Şifreyi güncelle
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
      // Google'dan da çıkış yap (eğer Google ile giriş yapıldıysa)
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

  // --- Hobi ve Kategori İşlemleri ---

  // Tüm kategorileri ve hobileri getir
  async getCategories(): Promise<any[]> {
    try {
      // Veritabanı URL'sini kontrol et ve gerekirse ayarla
      if (!database().app.options.databaseURL) {
        database().app.options.databaseURL = FIREBASE_DB_URL;
      }

      // Doğrudan kategorileri al
      const snapshot = await database().ref('/kategoriler').once('value');

      if (snapshot.exists()) {
        const categories: any[] = [];
        snapshot.forEach(childSnapshot => {
          const category = childSnapshot.val();
          category.id = childSnapshot.key;
          categories.push(category);
          return undefined;
        });

        return categories;
      }

      // Veriler bulunamadıysa varsayılan kategorileri döndür
      return this.getDefaultCategories();
    } catch (error) {
      // Hata durumunda varsayılan kategorileri döndür
      return this.getDefaultCategories();
    }
  }

  // Kullanıcının seçtiği hobileri kaydet
  async saveUserHobbies(userId: string, hobbies: string[]) {
    try {
      await database().ref(`userHobbies/${userId}`).set({
        hobbies,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının seçtiği hobileri getir
  async getUserHobbies(userId: string) {
    try {
      const snapshot = await database()
        .ref(`userHobbies/${userId}`)
        .once('value');
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  }

  // Varsayılan test kategorilerini döndür
  private getDefaultCategories(): any[] {
    return [
      {
        id: 'sanat',
        name: 'Sanat',
        emoji: '🎨',
        hobiler: ['Resim', 'Heykel', 'Kaligrafi'],
      },
      {
        id: 'teknoloji',
        name: 'Teknoloji',
        emoji: '💻',
        hobiler: ['Yapay Zeka', 'Mobil Uygulama', 'Robotik'],
      },
    ];
  }
}

const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
