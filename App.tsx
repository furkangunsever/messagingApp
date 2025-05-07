import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import store from './src/redux/store';
import AppNavigator from './src/routes';
import {COLORS} from './src/config/constants';
import {initializeFirebase} from './src/config/firebaseConfig';
import database from '@react-native-firebase/database';

// 🔧 Firebase'i başlat
initializeFirebase();

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('🔥 Firebase bağlantı testi başlıyor...');
  
    database()
      .ref('/testConnection')
      .set({status: 'connected'})
      .then(() => console.log('✅ Firebase bağlantısı başarılı'))
      .catch(err => console.error('❌ Firebase HATASI:', err));
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
