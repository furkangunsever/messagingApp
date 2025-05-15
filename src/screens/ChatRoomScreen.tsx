import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Text,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '../redux/store';

import {MainStackParamList} from '../routes';
import {RootState} from '../redux/store';
import {
  fetchMessages,
  sendMessage,
  addMessage,
} from '../redux/slices/chatSlice';
import {COLORS, SCREENS, MESSAGE_TYPES} from '../config/constants';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import {Message} from '../types';
import socketService from '../services/socketService';
import {messageService} from '../services/firebase';

type ChatRoomScreenRouteProp = RouteProp<
  MainStackParamList,
  typeof SCREENS.CHAT_ROOM
>;

const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ChatRoomScreenRouteProp>();
  const {roomId, roomName} = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messages = useSelector(
    (state: RootState) => state.chat.messages[roomId] || [],
  );
  const isLoading = useSelector((state: RootState) => state.chat.isLoading);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Firebase veritabanından geçmiş mesajlar ve socket.io ile gerçek zamanlı mesajlar için
    dispatch(fetchMessages(roomId) as any);

    socketService.onMessage(async newMessage => {
      console.log('Alınan mesaj:', newMessage);
      const roomIdField = newMessage.room_id || newMessage.roomId;

      if (roomIdField === roomId) {
        if (newMessage.content.includes('odaya katıldı')) {
          const systemMessage: Message = {
            id: String(Date.now()),
            roomId: roomIdField,
            senderId: 'system',
            content: newMessage.content,
            type: MESSAGE_TYPES.SYSTEM as any,
            timestamp: newMessage.timestamp || new Date().toISOString(),
            status: 'delivered',
          };
          dispatch(addMessage(systemMessage));

          // Sistem mesajı kalıcı olarak Firebase'e kaydedilir
          try {
            await messageService.sendMessage(roomIdField, {
              sender: 'system',
              text: newMessage.content,
              timestamp: Date.now(),
              pinned: false,
            });
          } catch (error) {
            console.error("Sistem mesajı Firebase'e kaydedilemedi:", error);
          }
        } else {
          const formattedMessage: Message = {
            id: newMessage.id || String(Date.now()),
            roomId: roomIdField,
            senderId: newMessage.sender_id || newMessage.senderId,
            content: newMessage.content,
            type: newMessage.type || MESSAGE_TYPES.TEXT,
            timestamp: newMessage.timestamp || new Date().toISOString(),
            status: 'delivered',
          };
          dispatch(addMessage(formattedMessage));

          // Diğer kullanıcılardan gelen mesajları kalıcı olarak Firebase'e kaydet
          // Kendi gönderdiğimiz mesajlar zaten sendMessage thunk'ında kaydediliyor
          if (formattedMessage.senderId !== user?.id) {
            try {
              await messageService.sendMessage(roomIdField, {
                sender: formattedMessage.senderId,
                text: formattedMessage.content,
                timestamp: new Date(formattedMessage.timestamp).getTime(),
                pinned: false,
                mediaUrl:
                  formattedMessage.type === MESSAGE_TYPES.IMAGE
                    ? formattedMessage.content
                    : undefined,
              });
            } catch (error) {
              console.error("Mesaj Firebase'e kaydedilemedi:", error);
            }
          }
        }
      }
    });

    return () => {
      socketService.leaveRoom(roomId);
    };
  }, [dispatch, roomId, user?.id]);

  useEffect(() => {
    if (messages.length > 0 && !isInitialLoad) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } else if (messages.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  const handleSendMessage = (
    content: string,
    type = MESSAGE_TYPES.TEXT,
    extraData = null,
  ) => {
    if (!user) return;

    dispatch(
      sendMessage({
        roomId,
        content,
        senderId: user.id,
        type,
        extraData,
      }) as any,
    );
  };

  const renderMessage = ({item}: {item: Message}) => {
    if (item.type === MESSAGE_TYPES.SYSTEM) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    const isMine = item.senderId === user?.id;
    return <MessageBubble message={item} isMine={isMine} />;
  };

  const keyExtractor = (item: Message) => item.id;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => {
            if (!isInitialLoad) {
              flatListRef.current?.scrollToEnd({animated: false});
            }
          }}
          onLayout={() => {
            if (!isInitialLoad) {
              flatListRef.current?.scrollToEnd({animated: false});
            }
          }}
        />
      )}

      <ChatInput onSend={handleSendMessage} disabled={!user} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingVertical: 10,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: COLORS.TEXT_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginVertical: 8,
  },
  systemMessageText: {
    color: COLORS.SURFACE,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ChatRoomScreen;
