import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import uuid from 'react-native-uuid';
import {AuthState, User, LoginCredentials} from '../../types';
import {saveUserData, clearUserData} from '../../utils/storage';
import socketService from '../../service/socketService';

// Başlangıç durumu
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, {rejectWithValue}) => {
    try {
      const userId = uuid.v4().toString();

      // Socket bağlantısını başlat ve kimlik doğrulama yap
      socketService.connect(credentials.username);

      // Kullanıcı bilgilerini oluştur
      const user: User = {
        id: userId,
        username: credentials.username,
        isOnline: true,
      };

      // AsyncStorage'a kullanıcı verilerini kaydet
      await saveUserData(user, credentials.username);

      return {user, token: credentials.username};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Giriş başarısız oldu');
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      // Socket bağlantısını kapat
      socketService.disconnect();

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
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, state => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {setUser, setError, clearError} = authSlice.actions;
export default authSlice.reducer;
