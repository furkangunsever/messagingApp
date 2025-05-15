import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import uuid from 'react-native-uuid';
import {ChatState, Message, Room} from '../../types';
import socketService from '../../services/socketService';
import {messageService, roomService} from '../../services/firebase';
import {
  saveOfflineMessage,
  getOfflineMessages,
  clearOfflineMessages,
} from '../../utils/storage';
import {MESSAGE_TYPES} from '../../config/constants';

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

      // Firebase'den odaları al
      const roomsData = await roomService.getAllRooms();
      if (roomsData) {
        const formattedRooms = Object.keys(roomsData).map(key => {
          const room = roomsData[key];
          return {
            id: room.id || key,
            name: room.name,
            type: room.type as 'public' | 'private',
            createdBy: room.createdBy,
            createdAt:
              typeof room.createdAt === 'number'
                ? new Date(room.createdAt).toISOString()
                : String(room.createdAt),
            lastMessage: room.lastMessage
              ? {
                  id: `msg_${Date.now()}`,
                  roomId: room.id || key,
                  senderId: room.lastMessage.senderId,
                  content: room.lastMessage.content,
                  type: 'TEXT' as any,
                  timestamp:
                    typeof room.lastMessage.timestamp === 'number'
                      ? new Date(room.lastMessage.timestamp).toISOString()
                      : String(room.lastMessage.timestamp),
                  status: 'delivered' as
                    | 'delivered'
                    | 'sent'
                    | 'read'
                    | 'failed',
                }
              : undefined,
          };
        });

        console.log('Firebase odalar yüklendi:', formattedRooms.length);
        dispatch(setRooms(formattedRooms));
      }

      // Socket üzerinden odaları alalım - gerçek zamanlı güncel liste
      if (socketService.socket) {
        socketService.socket.emit('get_rooms', (rooms: Room[]) => {
          console.log('Socket üzerinden gelen oda listesi:', rooms);
          if (rooms && rooms.length > 0) {
            dispatch(setRooms(rooms));
          }
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
  async (roomId: string, {rejectWithValue, dispatch}) => {
    try {
      // Socket üzerinden seçilen odaya katıl
      socketService.joinRoom(roomId);

      // Firebase'den odaya ait eski mesajları al (geçmiş mesajları göstermek için)
      const messagesData = await messageService.getMessages(roomId);
      console.log("Firebase'den mesajlar alındı:", messagesData);

      // Mesajları işle ve store'a ekle
      if (messagesData) {
        const formattedMessages: Message[] = Object.keys(messagesData).map(
          key => {
            const msg = messagesData[key];
            return {
              id: key,
              roomId: roomId,
              senderId: msg.sender,
              content: msg.text,
              type: msg.mediaUrl ? 'IMAGE' : 'TEXT',
              timestamp: new Date(msg.timestamp).toISOString(),
              status: 'delivered' as 'delivered' | 'sent' | 'read' | 'failed',
            };
          },
        );

        // Tüm mesajları redux store'a ekle
        formattedMessages.forEach(msg => {
          dispatch(addMessage(msg));
        });
      }

      return roomId;
    } catch (error: any) {
      console.error('Mesajlar alınırken hata:', error);
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
      type = MESSAGE_TYPES.TEXT,
      extraData = null,
    }: {
      roomId: string;
      content: string;
      senderId: string;
      type?: string;
      extraData?: any;
    },
    {rejectWithValue},
  ) => {
    try {
      const messageId = uuid.v4().toString();
      const timestamp = new Date().toISOString();

      const message: Message = {
        id: messageId,
        roomId,
        senderId,
        content,
        type: type as any,
        timestamp,
        status: 'sent' as 'delivered' | 'sent' | 'read' | 'failed',
        ...(extraData && {extraData}),
      };

      // Socket bağlantısı varsa mesajı gönder
      if (socketService.isConnected()) {
        // Socket.io ile mesajı gerçek zamanlı gönder - mesaj tipini de gönder
        socketService.sendMessage(roomId, content, senderId);

        // Firebase'e mesajı kalıcı olarak kaydet
        const firebaseMessage = {
          sender: senderId,
          text: content,
          timestamp: new Date(timestamp).getTime(),
          pinned: false,
        };

        await messageService.sendMessage(roomId, firebaseMessage);
      } else {
        // Çevrimdışıysa, mesajı AsyncStorage'a kaydet
        await saveOfflineMessage(message);
      }

      return message;
    } catch (error: any) {
      console.error('Mesaj gönderilirken hata:', error);
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
    {rejectWithValue, getState},
  ) => {
    try {
      console.log('Yeni oda oluşturuluyor:', {name, type});

      // Kullanıcı bilgisini al
      const {auth} = getState() as {auth: {user: {id: string}}};
      const userId = auth.user?.id;

      if (!userId) {
        return rejectWithValue('Kullanıcı giriş yapmamış');
      }

      // Socket üzerinden yeni oda oluştur (gerçek zamanlı)
      socketService.createRoom(name, type, password);

      // Firebase'e de odayı kalıcı olarak kaydet
      const roomData = {
        name,
        type,
        createdBy: userId,
        password: type === 'private' ? password : undefined,
      };

      await roomService.createRoom(roomData);

      // Oda oluşturulduktan sonra kısa bir süre bekleyip oda listesini yenile
      setTimeout(() => {
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
          // Socket.io ile gerçek zamanlı mesaj gönder
          socketService.sendMessage(
            message.roomId,
            message.content,
            message.senderId,
          );

          // Firebase'e kalıcı mesaj kaydı
          await messageService.sendMessage(message.roomId, {
            sender: message.senderId,
            text: message.content,
            timestamp: new Date(message.timestamp).getTime(),
            pinned: false,
          });
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

    // Firebase'den gelen odaları mevcut listeye ekler
    updateRoomsFromFirebase: (state, action: PayloadAction<Room[]>) => {
      const firebaseRooms = action.payload;

      // Mevcut ID'leri kontrol et
      const existingRoomIds = new Set(state.rooms.map(room => room.id));

      // Sadece mevcut listede olmayan yeni odaları ekle
      firebaseRooms.forEach(room => {
        if (!existingRoomIds.has(room.id)) {
          state.rooms.push(room);
        }
      });
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
  updateRoomsFromFirebase,
} = chatSlice.actions;

export default chatSlice.reducer;
