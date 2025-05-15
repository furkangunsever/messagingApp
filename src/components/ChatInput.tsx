import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Keyboard,
  Animated,
  Text,
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import {COLORS, MESSAGE_TYPES} from '../config/constants';

interface ChatInputProps {
  onSend: (message: string, type?: string, extraData?: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

const windowWidth = Dimensions.get('window').width;

// Gönder butonu için basit bileşen
const SendIcon = () => (
  <View style={styles.sendIconContainer}>
    <View style={styles.sendIconTriangle} />
  </View>
);

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Mesajınızı yazın...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isMediaPanelOpen, setIsMediaPanelOpen] = useState(false);
  const mediaPanelHeight = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (message.trim() === '' || disabled) return;

    onSend(message.trim(), MESSAGE_TYPES.TEXT);
    setMessage('');
    Keyboard.dismiss();
  };

  const toggleMediaPanel = () => {
    if (isMediaPanelOpen) {
      // Panel kapatma animasyonu
      Animated.timing(mediaPanelHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setIsMediaPanelOpen(false);
      });
    } else {
      // Panel açma animasyonu
      setIsMediaPanelOpen(true);
      Animated.timing(mediaPanelHeight, {
        toValue: 120,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleImageSelection = () => {
    Alert.alert('Bilgi', 'Fotoğraf paylaşımı yakında eklenecek!');
  };

  const shareLocation = () => {
    Alert.alert('Bilgi', 'Konum paylaşımı yakında eklenecek!');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mediaPanel, {height: mediaPanelHeight}]}>
        <View style={styles.mediaPanelContent}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleImageSelection}>
            <View style={styles.mediaButtonIcon}>
              <Text style={styles.mediaButtonIconText}>📷</Text>
            </View>
            <Text style={styles.mediaButtonText}>Fotoğraf</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaButton} onPress={shareLocation}>
            <View style={styles.mediaButtonIcon}>
              <Text style={styles.mediaButtonIconText}>📍</Text>
            </View>
            <Text style={styles.mediaButtonText}>Konum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => {
              Alert.alert('Bilgi', 'Dosya paylaşımı yakında eklenecek!');
            }}>
            <View style={styles.mediaButtonIcon}>
              <Text style={styles.mediaButtonIconText}>📎</Text>
            </View>
            <Text style={styles.mediaButtonText}>Dosya</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={toggleMediaPanel}
          disabled={disabled}>
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={message}
          onChangeText={setMessage}
          editable={!disabled}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.disabledButton,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}>
          <SendIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: COLORS.BACKGROUND,
    width: windowWidth,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 8 : 5,
    fontSize: 16,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{rotate: '90deg'}],
  },
  attachButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  // Medya Paneli Stilleri
  mediaPanel: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  mediaPanelContent: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mediaButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  mediaButtonIconText: {
    fontSize: 24,
  },
  mediaButtonText: {
    fontSize: 12,
    color: COLORS.TEXT,
  },
});

export default ChatInput;
