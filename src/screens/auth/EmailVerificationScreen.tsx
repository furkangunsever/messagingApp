import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  verifyEmail,
  clearError,
  loginWithEmail,
} from '../../redux/slices/authSlice';
import {COLORS, SCREENS} from '../../config/constants';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import firebaseAuthService from '../../services/firebase/auth/index';
import auth from '@react-native-firebase/auth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const EmailVerificationScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {email} = route.params || {};
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const dispatch = useDispatch();
  const {isLoading, error, isEmailVerified} = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    // Hata mesajını temizle
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // E-posta doğrulandığında ana sayfaya yönlendir
    if (isEmailVerified) {
      Alert.alert(
        'Başarılı',
        'E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate(SCREENS.LOGIN),
          },
        ],
      );
    }
  }, [isEmailVerified, navigation]);

  useEffect(() => {
    // Geri sayım için zamanlayıcı
    if (timer > 0) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const validateInputs = () => {
    let isValid = true;

    setVerificationCodeError('');
    setPasswordError('');

    if (!verificationCode.trim()) {
      setVerificationCodeError('Doğrulama kodu gereklidir');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Şifre gereklidir');
      isValid = false;
    }

    return isValid;
  };

  const handleVerifyEmail = async () => {
    if (!validateInputs()) return;

    try {
      // Önce e-posta doğrulama
      await dispatch(
        verifyEmail({
          email,
          code: verificationCode,
        }) as any,
      );

      // Sonra giriş yap
      await dispatch(
        loginWithEmail({
          email,
          password,
        }) as any,
      );
    } catch (err) {
      console.error('Email verification error:', err);
    }
  };

  const handleResendCode = async () => {
    try {
      // Firebase'de kullanıcı oturum açmış olmalı, burada sadece bir örnek
      await auth().currentUser?.sendEmailVerification();

      // veya
      // await firebaseAuthService.sendEmailVerification(email);

      setTimer(60);
      setCanResend(false);
      Alert.alert('Başarılı', 'Doğrulama kodu tekrar gönderildi');
    } catch (err) {
      Alert.alert('Hata', 'Doğrulama kodu gönderilirken bir hata oluştu');
    }
  };

  const navigateToLogin = () => {
    navigation.navigate(SCREENS.LOGIN);
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
            source={require('../../assets/email_verification.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>E-posta Doğrulama</Text>
          <Text style={styles.subtitle}>
            {email} adresine gönderilen doğrulama kodunu girin
          </Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="Doğrulama Kodu"
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Doğrulama kodunu girin"
            keyboardType="numeric"
            error={verificationCodeError}
          />

          <CustomInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Şifrenizi girin"
            secureTextEntry
            error={passwordError}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <CustomButton
            title="Doğrula ve Giriş Yap"
            onPress={handleVerifyEmail}
            isLoading={isLoading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Kod gelmedi mi? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendLink}>Tekrar Gönder</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                {timer} saniye sonra tekrar gönder
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
            <Text style={styles.backButtonText}>Giriş Sayfasına Dön</Text>
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
  verifyButton: {
    marginTop: windowHeight * 0.02,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight * 0.025,
    flexWrap: 'wrap',
  },
  resendText: {
    color: COLORS.TEXT_LIGHT,
  },
  resendLink: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  timerText: {
    color: COLORS.TEXT_DISABLED,
  },
  backButton: {
    marginTop: windowHeight * 0.02,
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

export default EmailVerificationScreen;
