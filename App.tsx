/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import store from './src/redux/store';
import AppNavigator from './src/routes';
import {COLORS} from './src/config/constants';
import {initializeFirebase} from './src/config/firebaseConfig';

// Firebase'i başlat
initializeFirebase();

function App(): React.JSX.Element {
  useEffect(() => {
    // Uygulama başladığında Firebase bağlantısını kontrol et
    console.log('Uygulama başlatıldı ve Firebase yapılandırıldı');
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
