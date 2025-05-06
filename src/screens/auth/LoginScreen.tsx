import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  loginWithEmail,
  loginWithGoogle,
  clearError,
} from '../../redux/slices/authSlice';
import {COLORS, SCREENS} from '../../config/constants';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import firebaseAuthService from '../../service/firebaseService';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const {isLoading, error, emailVerificationSent} = useSelector(
    (state: RootState) => state.auth,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Hata mesajını temizle
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error && error.includes('E-posta adresiniz')) {
      Alert.alert(
        'E-posta Doğrulama Gerekli',
        'Giriş yapmadan önce e-posta adresinizi doğrulamanız gerekmektedir. Lütfen e-posta kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.',
        [
          {
            text: 'Tamam',
            onPress: () => dispatch(clearError()),
          },
        ],
      );
    }
  }, [error, dispatch]);

  const validateInputs = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

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

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      await dispatch(
        loginWithEmail({
          email,
          password,
        }) as any,
      );

      // Giriş başarılı olduğunda doğrudan hobi seçme sayfasına yönlendir
      navigation.navigate(SCREENS.HOBBY_SELECT);
    } catch (err) {
      // Redux tarafından hata yönetiliyor
      console.error('Login error:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle() as any);

      // Giriş başarılı olduğunda doğrudan hobi seçme sayfasına yönlendir
      navigation.navigate(SCREENS.HOBBY_SELECT);
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate(SCREENS.REGISTER);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate(SCREENS.FORGOT_PASSWORD);
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
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.formContainer}>
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

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={navigateToForgotPassword}>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>
              {typeof error === 'object' && (error as any).message
                ? (error as any).message
                : error}
            </Text>
          )}

          <CustomButton
            title="Giriş Yap"
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.divider} />
          </View>

          <CustomButton
            title="Google ile Giriş Yap"
            onPress={handleGoogleLogin}
            type="outline"
            style={styles.googleButton}
            leftIcon={
              <Image
                source={require('../../assets/google.png')}
                style={styles.googleIcon}
              />
            }
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginVertical: windowHeight * 0.01,
  },
  forgotPasswordText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
  },
  loginButton: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight * 0.02,
  },
  registerText: {
    color: COLORS.TEXT_LIGHT,
  },
  registerLink: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default LoginScreen;
