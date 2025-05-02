import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {changePassword, clearError} from '../../redux/slices/authSlice';
import {COLORS, SCREENS} from '../../config/constants';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ChangePasswordScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const dispatch = useDispatch();
  const {isLoading, error} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Hata mesajını temizle
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateInputs = () => {
    let isValid = true;

    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!currentPassword) {
      setCurrentPasswordError('Mevcut şifre gereklidir');
      isValid = false;
    }

    if (!newPassword) {
      setNewPasswordError('Yeni şifre gereklidir');
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Şifre tekrarı gereklidir');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      isValid = false;
    }

    if (currentPassword === newPassword) {
      setNewPasswordError('Yeni şifre, mevcut şifre ile aynı olamaz');
      isValid = false;
    }

    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateInputs()) return;

    try {
      await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        }) as any,
      );
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi', [
        {
          text: 'Tamam',
          onPress: () => navigation.navigate(SCREENS.LOGIN),
        },
      ]);
    } catch (err) {
      console.error('Change password error:', err);
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/change_password.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Şifre Değiştir</Text>
          <Text style={styles.subtitle}>
            Hesabınız için yeni bir şifre belirleyin
          </Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="Mevcut Şifre"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Mevcut şifrenizi girin"
            secureTextEntry
            error={currentPasswordError}
          />

          <CustomInput
            label="Yeni Şifre"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Yeni şifrenizi girin"
            secureTextEntry
            error={newPasswordError}
          />

          <CustomInput
            label="Şifre Tekrarı"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Yeni şifrenizi tekrar girin"
            secureTextEntry
            error={confirmPasswordError}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <CustomButton
            title="Şifreyi Değiştir"
            onPress={handleChangePassword}
            isLoading={isLoading}
            style={styles.changeButton}
          />

          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: windowWidth * 0.06,
    paddingVertical: windowHeight * 0.04,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: windowHeight * 0.04,
  },
  logo: {
    width: windowWidth * 0.3,
    height: windowWidth * 0.3,
    marginBottom: windowHeight * 0.02,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: windowHeight * 0.01,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: windowWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  changeButton: {
    marginTop: windowHeight * 0.02,
  },
  backButton: {
    marginTop: windowHeight * 0.03,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default ChangePasswordScreen;
