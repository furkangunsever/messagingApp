// import React, {useState} from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Dimensions,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
// } from 'react-native';
// import {useDispatch, useSelector} from 'react-redux';

// import {login} from '../redux/slices/authSlice';
// import {RootState} from '../redux/store';
// import {COLORS} from '../config/constants';
// import ChatLogo from '../assets/chat_logo';

// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

// const LoginScreen: React.FC = () => {
//   const [username, setUsername] = useState('');
//   const dispatch = useDispatch();
//   const {isLoading, error} = useSelector((state: RootState) => state.auth);

//   const handleLogin = async () => {
//     if (!username.trim()) {
//       Alert.alert('Hata', 'Lütfen kullanıcı adı girin');
//       return;
//     }

//     dispatch(login({username: username.trim()}) as any);
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
//       <View style={styles.content}>
//         <View style={styles.logoContainer}>
//           <ChatLogo size={windowWidth * 0.4} color={COLORS.PRIMARY} />
//           <Text style={styles.title}>Socket Sohbet</Text>
//           <Text style={styles.subtitle}>
//             Gerçek zamanlı sohbet uygulamasına hoş geldiniz
//           </Text>
//         </View>

//         <View style={styles.formContainer}>
//           <Text style={styles.label}>Kullanıcı Adı</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Kullanıcı adınızı girin"
//             value={username}
//             onChangeText={setUsername}
//             autoCapitalize="none"
//             autoCorrect={false}
//           />

//           {error ? <Text style={styles.errorText}>{error}</Text> : null}

//           <TouchableOpacity
//             style={styles.loginButton}
//             onPress={handleLogin}
//             disabled={isLoading}>
//             {isLoading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.loginButtonText}>Giriş Yap</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.BACKGROUND,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: windowWidth * 0.08,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: windowHeight * 0.05,
//   },
//   logo: {
//     width: windowWidth * 0.4,
//     height: windowWidth * 0.4,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: COLORS.PRIMARY,
//     marginBottom: 10,
//     marginTop: 20,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: COLORS.TEXT_LIGHT,
//     textAlign: 'center',
//   },
//   formContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: COLORS.TEXT,
//     fontWeight: '500',
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 20,
//   },
//   loginButton: {
//     backgroundColor: COLORS.PRIMARY,
//     height: 50,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   errorText: {
//     color: COLORS.ERROR,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
// });

// export default LoginScreen;
