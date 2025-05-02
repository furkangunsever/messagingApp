import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
} from '../../types';
import {saveUserData, clearUserData} from '../../utils/storage';
import firebaseAuthService from '../../service/firebaseService';

// Başlangıç durumu
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isEmailVerified: false,
  emailVerificationSent: false,
  resetPasswordSent: false,
};

// Async thunks
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (credentials: {email: string; password: string}, {rejectWithValue}) => {
    try {
      // Firebase ile giriş yap
      const firebaseUser = await firebaseAuthService.signInWithEmailAndPassword(
        credentials.email,
        credentials.password,
      );

      // Kullanıcı bilgilerini oluştur
      const user: User = {
        id: firebaseUser.uid,
        username: firebaseUser.displayName || credentials.email,
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL,
        isOnline: true,
      };

      // AsyncStorage'a kullanıcı verilerini kaydet
      await saveUserData(user, firebaseUser.uid);

      return {
        user,
        token: firebaseUser.uid,
        isEmailVerified: firebaseUser.emailVerified,
      };
    } catch (error: any) {
      // E-posta doğrulama hatası varsa özel hata mesajı döndür
      if (error.code === 'auth/email-not-verified') {
        return rejectWithValue({
          message:
            error.userMessage ||
            'E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.',
          isEmailVerificationError: true,
          email: credentials.email,
        });
      }

      return rejectWithValue(
        error.userMessage || error.message || 'Giriş başarısız oldu',
      );
    }
  },
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, {rejectWithValue}) => {
    try {
      // Google ile giriş yap
      const firebaseUser = await firebaseAuthService.signInWithGoogle();

      // Kullanıcı bilgilerini oluştur
      const user: User = {
        id: firebaseUser.uid,
        username: firebaseUser.displayName || firebaseUser.email || 'Anonim',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL,
        isOnline: true,
      };

      // AsyncStorage'a kullanıcı verilerini kaydet
      await saveUserData(user, firebaseUser.uid);

      return {user, token: firebaseUser.uid, isEmailVerified: true};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Google ile giriş başarısız oldu',
      );
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, {rejectWithValue}) => {
    try {
      // Firebase ile kayıt ol
      const firebaseUser =
        await firebaseAuthService.createUserWithEmailAndPassword(
          credentials.email,
          credentials.password,
          credentials.displayName,
        );

      // Kullanıcı bilgilerini oluştur (e-posta doğrulaması gerektiğinden sistemde oturum açılmaz)
      const user: User = {
        id: firebaseUser.uid,
        username: credentials.displayName,
        email: credentials.email,
        photoURL: null,
        isOnline: false,
      };

      return {
        user,
        emailVerificationSent: true,
        message:
          'Kayıt işlemi başarılı! Lütfen e-posta adresinize gönderilen doğrulama bağlantısını tıklayarak hesabınızı doğrulayın.',
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Kayıt başarısız oldu');
    }
  },
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({email, code}: {email: string; code: string}, {rejectWithValue}) => {
    try {
      // Email doğrulama (Firebase'de bu işlem genellikle doğrudan link üzerinden yapılır)
      await firebaseAuthService.verifyEmail(email, code);
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'E-posta doğrulama başarısız oldu',
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, {rejectWithValue}) => {
    try {
      // Şifre sıfırlama e-postası gönder
      await firebaseAuthService.sendPasswordResetEmail(email);
      return {email, resetPasswordSent: true};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Şifre sıfırlama başarısız oldu');
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    {
      currentPassword,
      newPassword,
    }: {currentPassword: string; newPassword: string},
    {rejectWithValue},
  ) => {
    try {
      // Şifre değiştir
      await firebaseAuthService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Şifre değiştirme başarısız oldu',
      );
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      // Firebase'den çıkış yap
      await firebaseAuthService.signOut();

      // AsyncStorage'dan kullanıcı verilerini temizle
      await clearUserData();

      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Çıkış başarısız oldu');
    }
  },
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    clearResetPasswordFlag: state => {
      state.resetPasswordSent = false;
    },
    clearEmailVerificationFlag: state => {
      state.emailVerificationSent = false;
    },
  },
  extraReducers: builder => {
    builder
      // Email giriş
      .addCase(loginWithEmail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailVerified = action.payload.isEmailVerified;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;

        // Eğer payload bir obje ise
        if (typeof action.payload === 'object' && action.payload !== null) {
          // Email doğrulama hatası kontrolü
          if ((action.payload as any).isEmailVerificationError) {
            state.emailVerificationSent = true;
            state.error =
              (action.payload as any).message || 'E-posta doğrulaması gerekli';
          } else {
            // Diğer obje türündeki hatalar
            state.error = (action.payload as any).message || 'Giriş yapılamadı';
          }
        } else {
          // String türündeki hatalar
          state.error = action.payload as string;
        }
      })

      // Google giriş
      .addCase(loginWithGoogle.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailVerified = true; // Google ile giriş yapıldığında e-posta doğrulanmış kabul edilir
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Kayıt olma
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailVerificationSent = action.payload.emailVerificationSent;
        // Kayıt olunduğunda oturum açılmaz, doğrulama gerekir
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // E-posta doğrulama
      .addCase(verifyEmail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, state => {
        state.isLoading = false;
        state.isEmailVerified = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Şifre sıfırlama
      .addCase(resetPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.resetPasswordSent = false;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.isLoading = false;
        state.resetPasswordSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Şifre değiştirme
      .addCase(changePassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Çıkış yapma
      .addCase(logout.pending, state => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isEmailVerified = false;
        state.emailVerificationSent = false;
        state.resetPasswordSent = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setError,
  clearError,
  clearResetPasswordFlag,
  clearEmailVerificationFlag,
} = authSlice.actions;
export default authSlice.reducer;
