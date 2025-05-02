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
import {
  resetPassword,
  clearError,
  clearResetPasswordFlag,
} from '../../redux/slices/authSlice';
import {COLORS, SCREENS} from '../../config/constants';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ForgotPasswordScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const {isLoading, error, resetPasswordSent} = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    // Hata mesajını temizle
    return () => {
      dispatch(clearError());
      dispatch(clearResetPasswordFlag());
    };
  }, [dispatch]);

  useEffect(() => {
    // Şifre sıfırlama e-postası gönderildiğinde bilgilendirme yap
    if (resetPasswordSent) {
      Alert.alert(
        'Başarılı',
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen kontrol ediniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate(SCREENS.LOGIN),
          },
        ],
      );
    }
  }, [resetPasswordSent, navigation]);

  const validateInputs = () => {
    let isValid = true;

    setEmailError('');

    if (!email.trim()) {
      setEmailError('E-posta adresi gereklidir');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      isValid = false;
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateInputs()) return;

    try {
      await dispatch(resetPassword(email) as any);
    } catch (err) {
      console.error('Reset password error:', err);
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
            source={require('../../assets/forgot_password.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Şifrenizi sıfırlamak için e-posta adresinizi girin
          </Text>
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

          {error && <Text style={styles.errorText}>{error}</Text>}

          <CustomButton
            title="Şifre Sıfırlama Bağlantısı Gönder"
            onPress={handleResetPassword}
            isLoading={isLoading}
            style={styles.resetButton}
          />

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
  resetButton: {
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

export default ForgotPasswordScreen;
