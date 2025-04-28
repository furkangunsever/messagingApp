import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Room} from '../types';
import {COLORS} from '../config/constants';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const windowWidth = Dimensions.get('window').width;

const RoomCard: React.FC<RoomCardProps> = ({room, onPress}) => {
  // Son mesaj zamanını biçimlendir
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    // Bugün için
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Dün için
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    }

    // Diğer günler için
    return date.toLocaleDateString();
  };

  // Son mesaj metni
  const getLastMessagePreview = (lastMessage?: any) => {
    if (!lastMessage) return 'Henüz mesaj yok';
    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(room)}
      activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {room.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.roomName}>{room.name}</Text>
          {room.lastMessage && (
            <Text style={styles.timestamp}>
              {formatTime(room.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <Text style={styles.lastMessage}>
          {getLastMessagePreview(room.lastMessage)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    width: windowWidth,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    marginRight: 20,
  },
});

export default RoomCard;
