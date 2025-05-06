import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {COLORS} from '../config/constants';

const {width} = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = 'Tamam',
  cancelText,
  onConfirm,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  // Alert tipi için renk ve ikon belirleme
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          color: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
        };
      case 'error':
        return {
          icon: '✗',
          color: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
        };
      case 'warning':
        return {
          icon: '⚠',
          color: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
        };
      default:
        return {
          icon: 'ℹ',
          color: COLORS.PRIMARY,
          backgroundColor: `rgba(${parseInt(
            COLORS.PRIMARY.slice(1, 3),
            16,
          )}, ${parseInt(COLORS.PRIMARY.slice(3, 5), 16)}, ${parseInt(
            COLORS.PRIMARY.slice(5, 7),
            16,
          )}, 0.1)`,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: typeStyles.backgroundColor},
            ]}>
            <Text style={[styles.icon, {color: typeStyles.color}]}>
              {typeStyles.icon}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {backgroundColor: typeStyles.color},
              ]}
              onPress={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  cancelButtonText: {
    color: COLORS.TEXT,
    fontSize: 16,
  },
});

export default CustomAlert;
