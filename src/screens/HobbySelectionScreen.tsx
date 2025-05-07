import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {COLORS} from '../config/constants';
import {RootState} from '../redux/store';
import {Hobby} from '../services/firebase/database/hobbies/types';
import {MainStackParamList} from '../routes';
import HobbyItem from '../components/HobbyItem';
import SelectedHobbyList from '../components/SelectedHobbyList';
import CustomAlert from '../components/CustomAlert';
import {hobbyDatabaseService} from '../services/firebase/database/hobbies';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MAX_HOBBIES = 5;

const HobbySelectionScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const {user} = useSelector((state: RootState) => state.auth);

  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<Hobby[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHobbies, setFilteredHobbies] = useState<Hobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert durumları için state'ler
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    confirmText: 'Tamam',
    cancelText: '',
    onConfirm: () => {},
  });

  // Alert gösterme fonksiyonu
  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    confirmText: string = 'Tamam',
    cancelText: string = '',
    onConfirm?: () => void,
  ) => {
    setAlertConfig({
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };

  // Hobi listesini yükle
  useEffect(() => {
    const loadHobbies = async () => {
      try {
        setIsLoading(true);

        // Veritabanında hobiler yoksa oluştur
        await hobbyDatabaseService.initializeHobbiesInDatabase();

        // Tüm hobi listesini getir
        const hobbiesList = await hobbyDatabaseService.getAllHobbies();
        setHobbies(hobbiesList);
        setFilteredHobbies(hobbiesList);

        // Kullanıcının daha önce seçtiği hobiler varsa onları getir
        if (user?.id) {
          const userHobbies = await hobbyDatabaseService.getUserHobbies(
            user.id,
          );
          setSelectedHobbies(userHobbies);
          console.log(
            '[HOBBY] Kullanıcı hobileri yüklendi:',
            userHobbies.length,
          );
        }
      } catch (error) {
        console.error('[HOBBY] Hata:', error);
        showAlert('Hata', 'Hobiler yüklenirken bir sorun oluştu.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadHobbies();
  }, [user?.id]);

  // Arama yapıldığında filtrelemeyi güncelle
  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      const filtered = hobbies.filter(hobby =>
        hobby.name.toLowerCase().includes(lowerQuery),
      );
      setFilteredHobbies(filtered);
    } else {
      setFilteredHobbies(hobbies);
    }
  }, [hobbies, searchQuery]);

  const handleSelectHobby = (hobby: Hobby) => {
    const isAlreadySelected = selectedHobbies.some(
      item => item.id === hobby.id,
    );

    if (isAlreadySelected) {
      // Eğer zaten seçiliyse, seçimi kaldır
      setSelectedHobbies(selectedHobbies.filter(item => item.id !== hobby.id));
    } else {
      // Eğer maksimum sayıya ulaşıldıysa uyarı göster
      if (selectedHobbies.length >= MAX_HOBBIES) {
        showAlert(
          'Maksimum Hobi Sayısı',
          `En fazla ${MAX_HOBBIES} hobi seçebilirsiniz. Lütfen önce seçtiğiniz hobilerden birini kaldırın.`,
          'warning',
        );
        return;
      }

      // Değilse, seçilenlere ekle
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const isHobbySelected = (hobby: Hobby) => {
    return selectedHobbies.some(item => item.id === hobby.id);
  };

  const handleSaveHobbies = async () => {
    if (!user?.id) {
      showAlert('Hata', 'Kullanıcı bilgisi bulunamadı.', 'error');
      return;
    }

    if (selectedHobbies.length === 0) {
      showAlert('Hata', 'Lütfen en az bir hobi seçin.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Seçili hobi ID'lerini bir objeye dönüştür
      const hobbiesMap: {[hobbyId: string]: boolean} = {};
      selectedHobbies.forEach(hobby => {
        hobbiesMap[hobby.id] = true;
      });

      // Veritabanında güncelle
      await hobbyDatabaseService.updateUserHobbies(user.id, hobbiesMap);

      // Başarılı mesajı göster
      showAlert(
        'Başarılı',
        'Hobiler başarıyla kaydedildi. Artık size uygun içerikleri keşfedebilirsiniz!',
        'success',
        'Devam Et',
        '',
        () => {
          setAlertVisible(false);
          navigation.navigate('RoomList');
        },
      );
    } catch (error) {
      console.error('[HOBBY] Kayıt hatası:', error);
      showAlert('Hata', 'Hobiler kaydedilirken bir sorun oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Hobiler Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfig.onConfirm}
      />

      <View style={styles.header}>
        <Text style={styles.title}>İlgi Alanlarınızı Seçin</Text>
        <Text style={styles.subtitle}>
          İlgi alanlarınızı seçerek size uygun sohbet odalarına katılabilirsiniz
        </Text>
      </View>

      <View style={styles.searchContainer}>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Hobi ara..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>
        {searchQuery ? 'Arama Sonuçları' : 'Popüler İlgi Alanları'}
      </Text>

      <ScrollView style={styles.hobbiesScrollView}>
        <View style={styles.hobbiesGrid}>
          {filteredHobbies.map(hobby => (
            <HobbyItem
              key={hobby.id}
              hobby={hobby}
              isSelected={isHobbySelected(hobby)}
              onSelect={() => handleSelectHobby(hobby)}
            />
          ))}

          {filteredHobbies.length === 0 && (
            <Text style={styles.emptyText}>Arama sonucu bulunamadı</Text>
          )}
        </View>
      </ScrollView>

      <SelectedHobbyList
        selectedHobbies={selectedHobbies}
        maxCount={MAX_HOBBIES}
        onRemove={handleSelectHobby}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          (selectedHobbies.length === 0 || isSubmitting) &&
            styles.disabledButton,
        ]}
        onPress={handleSaveHobbies}
        disabled={selectedHobbies.length === 0 || isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.saveButtonText}>İlgi Alanlarımı Kaydet</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.TEXT,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: COLORS.TEXT,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  hobbiesScrollView: {
    flex: 1,
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    padding: 8,
    textAlign: 'center',
    width: '100%',
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.TEXT_DISABLED,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HobbySelectionScreen;
