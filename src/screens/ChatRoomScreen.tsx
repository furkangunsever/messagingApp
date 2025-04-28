import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
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
import {COLORS, SCREENS} from '../config/constants';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import {Message} from '../types';
import socketService from '../service/socketService';

type ChatRoomScreenRouteProp = RouteProp<
  MainStackParamList,
  typeof SCREENS.CHAT_ROOM
>;

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ChatRoomScreenRouteProp>();
  const {roomId, roomName} = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Selector'ları memoize edelim
  const messages = useSelector(
    (state: RootState) => state.chat.messages[roomId] || [],
  );
  const isLoading = useSelector((state: RootState) => state.chat.isLoading);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Oda mesajlarını yükle
    dispatch(fetchMessages(roomId) as any);

    // Socket olaylarını dinle
    socketService.onMessage(newMessage => {
      if (newMessage.roomId === roomId) {
        dispatch(addMessage(newMessage));
      }
    });

    // Temizlik fonksiyonu
    return () => {
      // Odadan ayrıl
      socketService.leaveRoom(roomId);
    };
  }, [dispatch, roomId]);

  // Yeni mesaj geldiğinde otomatik aşağı kaydır
  useEffect(() => {
    if (messages.length > 0 && !isInitialLoad) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } else if (messages.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  const handleSendMessage = (content: string) => {
    if (!user) return;

    dispatch(
      sendMessage({
        roomId,
        content,
        senderId: user.id,
      }) as any,
    );
  };

  const renderMessage = ({item}: {item: Message}) => {
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
});

export default ChatRoomScreen;
