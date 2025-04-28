import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';

import {MainStackParamList} from '../routes';
import {RootState} from '../redux/store';
import {fetchRooms, setCurrentRoom, setRooms} from '../redux/slices/chatSlice';
import {COLORS, SCREENS} from '../config/constants';
import RoomCard from '../components/RoomCard';
import {Room} from '../types';
import socketService from '../service/socketService';

type RoomListScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  typeof SCREENS.ROOM_LIST
>;

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RoomListScreen: React.FC = () => {
  const navigation = useNavigation<RoomListScreenNavigationProp>();
  const dispatch = useDispatch();
  const {rooms, isLoading, error} = useSelector(
    (state: RootState) => state.chat,
  );
  const {user} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleRoomsList = (updatedRooms: Room[]) => {
      console.log('Oda listesi güncellendi:', updatedRooms);
      dispatch(setRooms(updatedRooms));
    };

    socketService.onRoomsList(handleRoomsList);

    loadRooms();

    return () => {
      socketService.socket?.off('rooms_list', handleRoomsList);
    };
  }, []);

  const loadRooms = () => {
    console.log('Odalar yükleniyor...');
    dispatch(fetchRooms() as any);

    // TEST: Oda listesini manuel olarak kontrol edelim
    console.log('Redux Store şu anki oda listesi:', rooms);
  };

  const handleRoomPress = (room: Room) => {
    dispatch(setCurrentRoom(room));
    navigation.navigate(SCREENS.CHAT_ROOM, {
      roomId: room.id,
      roomName: room.name,
    });
  };

  const handleCreateRoom = () => {
    navigation.navigate(SCREENS.CREATE_ROOM);
  };

  const renderRoomItem = ({item}: {item: Room}) => (
    <RoomCard room={item} onPress={handleRoomPress} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Henüz sohbet odası yok</Text>
      <Text style={styles.emptySubText}>
        Yeni bir sohbet odası oluşturmak için aşağıdaki butona tıklayın
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRooms}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={!isLoading ? renderEmptyList : null}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadRooms} />
        }
      />

      <TouchableOpacity
        style={styles.createRoomButton}
        onPress={handleCreateRoom}>
        <Text style={styles.createRoomButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: windowHeight * 0.6,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createRoomButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createRoomButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default RoomListScreen;
