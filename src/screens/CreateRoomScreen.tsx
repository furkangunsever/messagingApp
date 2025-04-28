import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';
import {unwrapResult} from '@reduxjs/toolkit';
import {AppDispatch} from '../redux/store';

import {MainStackParamList} from '../routes';
import {RootState} from '../redux/store';
import {createRoom, fetchRooms} from '../redux/slices/chatSlice';
import {COLORS, SCREENS} from '../config/constants';

type CreateRoomScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  typeof SCREENS.CREATE_ROOM
>;

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CreateRoomScreen: React.FC = () => {
  const navigation = useNavigation<CreateRoomScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const {isLoading, error} = useSelector((state: RootState) => state.chat);
  const {user} = useSelector((state: RootState) => state.auth);

  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [password, setPassword] = useState('');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Hata', 'Lütfen oda adı girin');
      return;
    }

    if (roomType === 'private' && !password.trim()) {
      Alert.alert('Hata', 'Özel oda için şifre gerekli');
      return;
    }

    try {
      await dispatch(
        createRoom({
          name: roomName.trim(),
          type: roomType,
          password: roomType === 'private' ? password.trim() : undefined,
        }),
      ).unwrap();

      navigation.goBack();

      setTimeout(() => {
        dispatch(fetchRooms() as any);
      }, 1000);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Oda oluşturulamadı');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Oda Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Oda adını girin"
            value={roomName}
            onChangeText={setRoomName}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Oda Türü</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                roomType === 'public' && styles.typeButtonActive,
              ]}
              onPress={() => setRoomType('public')}>
              <Text
                style={[
                  styles.typeButtonText,
                  roomType === 'public' && styles.typeButtonTextActive,
                ]}>
                Herkese Açık
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                roomType === 'private' && styles.typeButtonActive,
              ]}
              onPress={() => setRoomType('private')}>
              <Text
                style={[
                  styles.typeButtonText,
                  roomType === 'private' && styles.typeButtonTextActive,
                ]}>
                Özel
              </Text>
            </TouchableOpacity>
          </View>

          {roomType === 'private' && (
            <>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="Oda şifresini girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateRoom}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Oda Oluştur</Text>
            )}
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
  content: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  typeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  typeButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default CreateRoomScreen;
