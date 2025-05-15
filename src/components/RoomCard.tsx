import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {Room} from '../types';
import {COLORS} from '../config/constants';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
  unreadCount?: number;
}

const windowWidth = Dimensions.get('window').width;

// Profil emojileri için renkler listesi
const AVATAR_COLORS = [
  '#FF6B6B', // Kırmızı
  '#4ECDC4', // Turkuaz
  '#45B7D1', // Mavi
  '#FBB13C', // Turuncu
  '#8A4FFF', // Mor
  '#34BE82', // Yeşil
];

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onPress,
  unreadCount = 0,
}) => {
  // Oda adına göre renk oluştur
  const getAvatarColor = (name: string) => {
    // Oda adının ilk karakterinin ASCII değerine göre renk seç
    const charCode = name.charCodeAt(0);
    return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
  };

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
    return date.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Son mesaj metni
  const getLastMessagePreview = (lastMessage?: any) => {
    if (!lastMessage) return 'Henüz mesaj yok';

    // Medya türüne göre uygun metni göster
    if (lastMessage.type === 'IMAGE') {
      return '📷 Fotoğraf';
    } else if (lastMessage.type === 'LOCATION') {
      return '📍 Konum';
    } else if (lastMessage.type === 'FILE') {
      return '📎 Dosya';
    }

    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };

  // Gönderenin adını göster (kendi mesajları için "Sen" yaz)
  const getSenderName = (lastMessage?: any) => {
    if (!lastMessage) return '';

    // Sistem mesajları için
    if (lastMessage.senderId === 'system') return '';

    // TODO: Burada kendi kullanıcı ID'nizi kontrol edin
    // const isCurrentUser = lastMessage.senderId === currentUserId;
    const isCurrentUser = false; // Şimdilik false olarak kabul edin

    return isCurrentUser ? 'Sen: ' : '';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(room)}
      activeOpacity={0.7}>
      {/* Oda Avatarı */}
      <View
        style={[
          styles.avatarContainer,
          {backgroundColor: getAvatarColor(room.name)},
        ]}>
        <Text style={styles.avatarText}>
          {room.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Oda Bilgileri */}
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.typeText}>
                {room.type === 'private' ? '🔒 Özel' : '🌐 Herkese Açık'}
              </Text>
            </View>
          </View>

          {room.lastMessage && (
            <Text style={styles.timestamp}>
              {formatTime(room.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View style={styles.messagePreviewContainer}>
          <Text style={styles.lastMessage}>
            <Text style={styles.senderName}>
              {getSenderName(room.lastMessage)}
            </Text>
            {getLastMessagePreview(room.lastMessage)}
          </Text>

          {/* Okunmamış mesaj sayısı */}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    width: windowWidth,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginRight: 8,
  },
  typeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#f2f2f2',
  },
  typeText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    flex: 1,
    marginRight: 10,
  },
  senderName: {
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RoomCard;
