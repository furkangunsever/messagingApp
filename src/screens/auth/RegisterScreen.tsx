import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  register,
  loginWithGoogle,
  clearError,
  clearEmailVerificationFlag,
} from '../../redux/slices/authSlice';
import {COLORS, SCREENS} from '../../config/constants';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RegisterScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const dispatch = useDispatch();
  const {isLoading, error, emailVerificationSent} = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    // Hata mesajını temizle
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // E-posta doğrulama sayfasına yönlendir
    if (emailVerificationSent) {
      navigation.navigate(SCREENS.LOGIN);
      Alert.alert(
        'E-posta Doğrulama Gerekli',
        'Kayıt işleminiz başarıyla tamamlandı. Lütfen e-posta adresinize gönderilen doğrulama bağlantısını tıklayarak hesabınızı doğrulayın.',
        [
          {
            text: 'Tamam',
            onPress: () => dispatch(clearEmailVerificationFlag()),
          },
        ],
      );
    }
  }, [emailVerificationSent, navigation, email, dispatch]);

  const validateInputs = () => {
    let isValid = true;

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name.trim()) {
      setNameError('İsim alanı gereklidir');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('E-posta adresi gereklidir');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Şifre gereklidir');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Şifre tekrarı gereklidir');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      await dispatch(
        register({
          displayName: name,
          email,
          password,
          confirmPassword,
        }) as any,
      );
    } catch (err) {
      // Redux tarafından hata yönetiliyor
      console.error('Register error:', err);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await dispatch(loginWithGoogle() as any);
    } catch (err) {
      console.error('Google register error:', err);
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
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Mesajlaşma Uygulaması</Text>
          <Text style={styles.subtitle}>Yeni bir hesap oluşturun</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="İsim"
            value={name}
            onChangeText={setName}
            placeholder="Adınızı girin"
            error={nameError}
            autoCapitalize="words"
          />

          <CustomInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta adresinizi girin"
            keyboardType="email-address"
            error={emailError}
          />

          <CustomInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Şifrenizi girin"
            secureTextEntry
            error={passwordError}
          />

          <CustomInput
            label="Şifre Tekrarı"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Şifrenizi tekrar girin"
            secureTextEntry
            error={confirmPasswordError}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <CustomButton
            title="Kayıt Ol"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.divider} />
          </View>

          <CustomButton
            title="Google ile Kayıt Ol"
            onPress={handleGoogleRegister}
            type="outline"
            style={styles.googleButton}
            leftIcon={
              <Image
                source={require('../../assets/google.png')}
                style={styles.googleIcon}
              />
            }
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten bir hesabınız var mı? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: windowWidth * 0.06,
    paddingVertical: windowHeight * 0.04,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: windowHeight * 0.03,
  },
  logo: {
    width: windowWidth * 0.25,
    height: windowWidth * 0.25,
    marginBottom: windowHeight * 0.015,
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
  registerButton: {
    marginTop: windowHeight * 0.02,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: windowHeight * 0.025,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: COLORS.TEXT_LIGHT,
    paddingHorizontal: 10,
  },
  googleButton: {
    marginBottom: windowHeight * 0.02,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight * 0.01,
  },
  loginText: {
    color: COLORS.TEXT_LIGHT,
  },
  loginLink: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default RegisterScreen;
