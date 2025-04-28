import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Message } from '../types';
import { COLORS } from '../config/constants';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
}

const windowWidth = Dimensions.get('window').width;

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  showAvatar = true,
}) => {
  // Zaman bilgisini biçimlendir
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}>
      <View
        style={[
          styles.bubble,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}>
        {!isMine && message.senderName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <Text style={styles.messageText}>{message.content}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
          {isMine && (
            <View style={styles.statusContainer}>
              {message.status === 'sent' && (
                <Text style={styles.statusText}>✓</Text>
              )}
              {message.status === 'delivered' && (
                <Text style={styles.statusText}>✓✓</Text>
              )}
              {message.status === 'read' && (
                <Text style={[styles.statusText, styles.readStatus]}>✓✓</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: windowWidth * 0.75,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: COLORS.MESSAGE_SENT,
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: COLORS.MESSAGE_RECEIVED,
    borderBottomLeftRadius: 0,
  },
  senderName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
    color: COLORS.PRIMARY,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.TEXT,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.TEXT_LIGHT,
    marginRight: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  readStatus: {
    color: COLORS.PRIMARY,
  },
});

export default MessageBubble; 