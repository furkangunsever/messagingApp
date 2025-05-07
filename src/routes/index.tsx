import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import {ActivityIndicator, View} from 'react-native';
import 'react-native-gesture-handler';

import {SCREENS, COLORS} from '../config/constants';
import {RootState} from '../redux/store';
import {getUserToken, getUserData} from '../utils/storage';
import {setUser} from '../redux/slices/authSlice';
import socketService from '../services/socketService';
import {initializeFirebase} from '../config/firebaseConfig';

// Auth Ekranları
import {
  LoginScreen,
  RegisterScreen,
  EmailVerificationScreen,
  ForgotPasswordScreen,
  ChangePasswordScreen,
} from '../screens/auth';

// Ana Ekranlar
import RoomListScreen from '../screens/RoomListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';
import HobbySelectionScreen from '../screens/HobbySelectionScreen';

// Stack navigator türleri
export type AuthStackParamList = {
  [SCREENS.LOGIN]: undefined;
  [SCREENS.REGISTER]: undefined;
  [SCREENS.EMAIL_VERIFICATION]: {email: string};
  [SCREENS.FORGOT_PASSWORD]: undefined;
  [SCREENS.CHANGE_PASSWORD]: undefined;
};

export type MainStackParamList = {
  [SCREENS.ROOM_LIST]: undefined;
  [SCREENS.CHAT_ROOM]: {roomId: string; roomName: string};
  [SCREENS.CREATE_ROOM]: undefined;
  [SCREENS.HOBBY_SELECTION]: undefined;
};

// Stack navigator'ları oluştur
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <AuthStack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
    <AuthStack.Screen name={SCREENS.REGISTER} component={RegisterScreen} />
    <AuthStack.Screen
      name={SCREENS.EMAIL_VERIFICATION}
      component={EmailVerificationScreen}
    />
    <AuthStack.Screen
      name={SCREENS.FORGOT_PASSWORD}
      component={ForgotPasswordScreen}
    />
    <AuthStack.Screen
      name={SCREENS.CHANGE_PASSWORD}
      component={ChangePasswordScreen}
    />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator
    initialRouteName={SCREENS.HOBBY_SELECTION}
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.PRIMARY,
      },
      headerTintColor: COLORS.BACKGROUND,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <MainStack.Screen
      name={SCREENS.HOBBY_SELECTION}
      component={HobbySelectionScreen}
      options={{title: 'İlgi Alanlarını Seç'}}
    />
    <MainStack.Screen
      name={SCREENS.ROOM_LIST}
      component={RoomListScreen}
      options={{title: 'Sohbet Odaları'}}
    />
    <MainStack.Screen
      name={SCREENS.CHAT_ROOM}
      component={ChatRoomScreen}
      options={({route}) => {
        const params = route.params as {roomName: string};
        return {title: params.roomName};
      }}
    />
    <MainStack.Screen
      name={SCREENS.CREATE_ROOM}
      component={CreateRoomScreen}
      options={{title: 'Yeni Oda Oluştur'}}
    />
  </MainStack.Navigator>
);

const AppNavigator = () => {
  const dispatch = useDispatch();
  const {token, user} = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase'i başlat
    initializeFirebase();

    // Uygulama başladığında kullanıcı verilerini kontrol et
    const checkUserToken = async () => {
      try {
        const storedToken = await getUserToken();
        if (storedToken) {
          const userData = await getUserData();
          if (userData) {
            dispatch(setUser(userData));
          }
        }
      } catch (error) {
        console.error('Oturum durumu kontrol edilemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserToken();
  }, [dispatch]);

  // Redux auth state değişimlerini konsola yazarak debug edelim
  useEffect(() => {
    console.log('[ROUTER] Auth state değişti:', {
      token,
      user: user?.id || null,
    });
  }, [token, user]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  // Kullanıcı kimlik doğrulaması var mı ve geçerli mi kontrol et
  const isAuthenticated = !!token && !!user;
  console.log('[ROUTER] Kullanıcı kimlik durumu:', isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
