// Firebase hata mesajlarını işleyen yardımcı sınıf
class ErrorLogger {
  // Firebase hatalarını loglar ve kullanıcı dostu mesaj döndürür
  logFirebaseError(error: any) {
    console.error('Firebase Error:', error);

    // Hata kodlarına göre kullanıcı dostu mesajlar
    const errorMessage = this.getFirebaseErrorMessage(error.code);

    return {
      originalError: error,
      message: errorMessage,
    };
  }

  // Firebase hata kodlarını kullanıcı dostu mesajlara çevirir
  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-disabled':
        return 'Bu kullanıcı hesabı devre dışı bırakıldı.';
      case 'auth/user-not-found':
        return 'Bu e-posta adresine ait kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Hatalı şifre.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. Daha güçlü bir şifre deneyin.';
      case 'auth/invalid-credential':
        return 'Geçersiz giriş bilgileri.';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      case 'auth/email-not-verified':
        return 'E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.';
      default:
        return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    }
  }
}

export const errorLogger = new ErrorLogger();
