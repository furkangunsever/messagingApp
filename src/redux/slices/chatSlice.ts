import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import uuid from 'react-native-uuid';
import {ChatState, Message, Room} from '../../types';
import socketService from '../../service/socketService';
import {
  saveOfflineMessage,
  getOfflineMessages,
  clearOfflineMessages,
} from '../../utils/storage';

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: {},
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchRooms = createAsyncThunk(
  'chat/fetchRooms',
  async (_, {rejectWithValue, dispatch}) => {
    try {
      console.log('Oda listesi isteniyor...');

      // Doğrudan callback ile odaları alalım
      if (socketService.socket) {
        socketService.socket.emit('get_rooms', (rooms: Room[]) => {
          console.log('Rooms received callback:', rooms);
          // Redux store'a oda listesini aktar
          dispatch(setRooms(rooms || []));
        });
      }

      return true;
    } catch (error: any) {
      console.error('Oda listesi alınamadı:', error);
      return rejectWithValue(error.message || 'Odalar alınamadı');
    }
  },
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (roomId: string, {rejectWithValue}) => {
    try {
      // Socket üzerinden seçilen odaya katıl
      socketService.joinRoom(roomId);

      // Not: Mesajlar, socket olayları aracılığıyla reducer'a gelecektir
      return roomId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mesajlar alınamadı');
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    {
      roomId,
      content,
      senderId,
      type = 'text',
    }: {roomId: string; content: string; senderId: string; type?: string},
    {rejectWithValue},
  ) => {
    try {
      const message: Message = {
        id: uuid.v4().toString(),
        roomId,
        senderId,
        content,
        type: type as any,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      // Socket bağlantısı varsa mesajı gönder
      if (socketService.isConnected()) {
        socketService.sendMessage(roomId, content, senderId);
      } else {
        // Çevrimdışıysa, mesajı AsyncStorage'a kaydet
        await saveOfflineMessage(message);
      }

      return message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mesaj gönderilemedi');
    }
  },
);

export const createRoom = createAsyncThunk(
  'chat/createRoom',
  async (
    {
      name,
      type,
      password,
    }: {name: string; type: 'public' | 'private'; password?: string},
    {rejectWithValue},
  ) => {
    try {
      console.log('Yeni oda oluşturuluyor:', {name, type});
      // Socket üzerinden yeni oda oluştur
      socketService.createRoom(name, type, password);

      // Oda oluşturulduktan sonra kısa bir süre bekleyip oda listesini yenile
      setTimeout(() => {
        console.log('Oda oluşturulduktan sonra liste yenileniyor...');
        socketService.getRoomsList();
      }, 1000);

      return true;
    } catch (error: any) {
      console.error('Oda oluşturulamadı:', error);
      return rejectWithValue(error.message || 'Oda oluşturulamadı');
    }
  },
);

export const syncOfflineMessages = createAsyncThunk(
  'chat/syncOfflineMessages',
  async (_, {dispatch, rejectWithValue}) => {
    try {
      // Çevrimdışı mesajları al
      const offlineMessages = await getOfflineMessages();

      if (offlineMessages.length === 0) return [];

      // Her çevrimdışı mesajı gönder
      for (const message of offlineMessages) {
        if (socketService.isConnected()) {
          socketService.sendMessage(
            message.roomId,
            message.content,
            message.senderId,
          );
        }
      }

      // Çevrimdışı mesajları temizle
      await clearOfflineMessages();

      return offlineMessages;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Çevrimdışı mesajlar senkronize edilemedi',
      );
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Oda listesi güncellendiğinde
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },

    // Seçilen odayı ayarlar
    setCurrentRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
    },

    // Yeni bir mesaj alındığında
    addMessage: (state, action: PayloadAction<Message>) => {
      const {roomId} = action.payload;

      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }

      // Aynı mesajı tekrar eklememek için kontrol et
      const isDuplicate = state.messages[roomId].some(
        msg => msg.id === action.payload.id,
      );

      if (!isDuplicate) {
        state.messages[roomId].push(action.payload);
      }

      // Odanın son mesajını güncelle
      const roomIndex = state.rooms.findIndex(room => room.id === roomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex].lastMessage = action.payload;
      }
    },

    // Mesaj durumunu güncelle
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        roomId: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
      }>,
    ) => {
      const {messageId, roomId, status} = action.payload;

      if (state.messages[roomId]) {
        const msgIndex = state.messages[roomId].findIndex(
          msg => msg.id === messageId,
        );

        if (msgIndex !== -1) {
          state.messages[roomId][msgIndex].status = status;
        }
      }
    },

    // Hata ayarla
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Hata temizle
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Odaları getir
      .addCase(fetchRooms.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchRooms.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mesajları getir
      .addCase(fetchMessages.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        // Odaya katılma başarılı, diğer işlemler socket olayları tarafından ele alınacak
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mesaj gönder
      .addCase(sendMessage.pending, state => {
        // Mesaj gönderirken bir yükleme durumu gerekli olmayabilir
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Mesaj başarıyla gönderildi, reducer'ın addMessage action'ı ile ele alınacak
        const {roomId} = action.payload;

        if (!state.messages[roomId]) {
          state.messages[roomId] = [];
        }

        state.messages[roomId].push(action.payload);

        // Odanın son mesajını güncelle
        const roomIndex = state.rooms.findIndex(room => room.id === roomId);
        if (roomIndex !== -1) {
          state.rooms[roomIndex].lastMessage = action.payload;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Oda oluştur
      .addCase(createRoom.pending, state => {
        state.isLoading = true;
      })
      .addCase(createRoom.fulfilled, state => {
        state.isLoading = false;
        // Oda oluşturma başarılı, odalar socket olayları aracılığıyla güncellenecek
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Çevrimdışı mesajları senkronize et
      .addCase(syncOfflineMessages.fulfilled, (state, action) => {
        // Çevrimdışı mesajlar başarıyla senkronize edildi
        // Mesajlar zaten state.messages içinde
      });
  },
});

export const {
  setRooms,
  setCurrentRoom,
  addMessage,
  updateMessageStatus,
  setError,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
