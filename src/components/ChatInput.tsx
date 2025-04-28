import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import {COLORS} from '../config/constants';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const windowWidth = Dimensions.get('window').width;

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Mesajınızı yazın...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() === '' || disabled) return;

    onSend(message.trim());
    setMessage('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
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

// Basit bir gönder ikonu
const SendIcon = () => (
  <View style={styles.sendIconContainer}>
    <View style={styles.sendIconTriangle} />
    <View style={styles.sendIconRectangle} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: windowWidth,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 10,
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
  sendIconRectangle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
  },
});

export default ChatInput;
