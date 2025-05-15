import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {Message} from '../types';
import {COLORS, MESSAGE_TYPES} from '../config/constants';

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
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Zaman bilgisini biçimlendir
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  // Tarih ve saat bilgisini biçimlendir (mesaj detayı için)
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case MESSAGE_TYPES.IMAGE:
        return (
          <TouchableOpacity
            onPress={() => setImageViewVisible(true)}
            activeOpacity={0.8}>
            <View style={styles.imageContainer}>
              {imageLoading && (
                <ActivityIndicator
                  style={styles.imageLoader}
                  size="large"
                  color={COLORS.PRIMARY}
                />
              )}
              <Image
                source={{uri: message.content}}
                style={styles.messageImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        );

      default:
        // Normal text mesajı
        return <Text style={styles.messageText}>{message.content}</Text>;
    }
  };

  // Mesaj durumu için farklı ikonlar
  const renderStatus = () => {
    if (!isMine) return null;

    switch (message.status) {
      case 'sent':
        return <Text style={styles.statusText}>✓</Text>;
      case 'delivered':
        return <Text style={styles.statusText}>✓✓</Text>;
      case 'read':
        return <Text style={[styles.statusText, styles.readStatus]}>✓✓</Text>;
      case 'failed':
        return <Text style={[styles.statusText, styles.failedStatus]}>!</Text>;
      default:
        return null;
    }
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
          message.type === MESSAGE_TYPES.IMAGE && styles.imageBubble,
        ]}>
        {!isMine && message.senderName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {renderMessageContent()}

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
          <View style={styles.statusContainer}>{renderStatus()}</View>
        </View>
      </View>

      {/* Resim Görüntüleme Modal'ı */}
      <Modal
        visible={imageViewVisible}
        transparent={true}
        onRequestClose={() => setImageViewVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageViewVisible(false)}>
            <Text style={styles.modalCloseText}>X</Text>
          </TouchableOpacity>
          <Image
            source={{uri: message.content}}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <View style={styles.modalInfo}>
            <Text style={styles.modalInfoText}>
              {formatDateTime(message.timestamp)}
            </Text>
          </View>
        </View>
      </Modal>
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
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: COLORS.MESSAGE_RECEIVED,
    borderBottomLeftRadius: 4,
  },
  imageBubble: {
    padding: 4,
    backgroundColor: COLORS.BACKGROUND,
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
    lineHeight: 20,
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
  failedStatus: {
    color: COLORS.ERROR,
    fontWeight: 'bold',
  },
  imageContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },
  messageImage: {
    width: windowWidth * 0.6,
    height: windowWidth * 0.6,
    borderRadius: 14,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    marginRight: 8,
  },
  locationIcon: {
    fontSize: 20,
  },
  // Modal (Resim Görüntüleme) Stilleri
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: windowWidth,
    height: windowWidth,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalInfo: {
    position: 'absolute',
    bottom: 40,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  modalInfoText: {
    color: '#fff',
  },
});

export default MessageBubble;
