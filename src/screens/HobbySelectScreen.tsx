import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {COLORS, SCREENS} from '../config/constants';
import {RootState} from '../redux/store';
import {Category} from '../types';
import {MainStackParamList} from '../routes';
import CustomAlert from '../components/CustomAlert';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MAX_CATEGORIES = 5;

const HobbySelectScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const {user} = useSelector((state: RootState) => state.auth);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
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

  // Kategorileri yükle
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);

        console.log(
          'Firebase bağlantısı devre dışı, dummy veri kullanılıyor...',
        );

        // kategoriler.json'dan veriyi içe aktar
        const localCategories = require('../utils/kategoriler.json');

        // JSON'dan gelen verileri uygun formata dönüştür
        const categoriesData = Object.keys(localCategories.kategoriler).map(
          key => {
            const category = localCategories.kategoriler[key];
            return {
              id: key,
              name: category.isim,
              emoji: category.emoji,
              hobbies: [], // Category tipine uygun olmak için boş dizi ekliyorum
            };
          },
        );

        console.log('Dummy kategoriler yüklendi:', categoriesData.length);

        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        showAlert('Hata', 'Kategoriler yüklenirken bir hata oluştu', 'error');
        console.error('Kategoriler yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Arama yapıldığında filtrelemeyi güncelle
  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(lowerQuery),
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchQuery]);

  const handleSelectCategory = (category: Category) => {
    if (selectedCategories.some(item => item.id === category.id)) {
      // Eğer zaten seçiliyse, seçimi kaldır
      setSelectedCategories(
        selectedCategories.filter(item => item.id !== category.id),
      );
    } else {
      // Eğer maksimum sayıya ulaşıldıysa uyarı göster
      if (selectedCategories.length >= MAX_CATEGORIES) {
        showAlert(
          'Maksimum Kategori',
          `En fazla ${MAX_CATEGORIES} kategori seçebilirsiniz. Lütfen önce seçtiğiniz kategorilerden birini kaldırın.`,
          'warning',
        );
        return;
      }

      // Değilse, seçilenlere ekle
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const isCategorySelected = (category: Category) => {
    return selectedCategories.some(item => item.id === category.id);
  };

  const handleSaveCategories = async () => {
    if (selectedCategories.length === 0) {
      showAlert('Hata', 'Lütfen en az bir kategori seçin', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Firebase devre dışı olduğu için loglama yapıp devam ediyoruz
      console.log(
        'Seçilen kategoriler:',
        selectedCategories.map(c => c.name).join(', '),
      );

      // 1 saniye bekleyerek işlem simülasyonu yap
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ana sayfaya yönlendir - önce success alert göster, sonra yönlendir
      showAlert(
        'Başarılı',
        'Kategoriler başarıyla kaydedildi. Şimdi size uygun toplulukları keşfedebilirsiniz!',
        'success',
        'Devam Et',
        '',
        () => {
          setAlertVisible(false);
          navigation.navigate(SCREENS.ROOM_LIST);
        },
      );
    } catch (error) {
      showAlert('Hata', 'Kategoriler kaydedilirken bir sorun oluştu', 'error');
      console.error('Kategoriler kaydedilemedi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryItem = (category: Category) => {
    const isSelected = isCategorySelected(category);
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
        onPress={() => handleSelectCategory(category)}>
        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        <Text style={styles.categoryName}>{category.name}</Text>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIndicatorText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
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
          Tutkularınızı keşfedin ve benzer ilgi alanlarına sahip insanlarla
          tanışın!
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kategori ara..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>
        {searchQuery ? 'Arama Sonuçları' : 'Kategoriler'}
      </Text>

      <ScrollView style={styles.categoriesScrollView}>
        <View style={styles.categoriesGrid}>
          {filteredCategories.map(category => renderCategoryItem(category))}

          {filteredCategories.length === 0 && (
            <Text style={styles.emptyText}>Arama sonucu bulunamadı</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>
          Seçilen Kategoriler ({selectedCategories.length}/{MAX_CATEGORIES})
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedCategoriesScroll}>
          <View style={styles.selectedCategoriesRow}>
            {selectedCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.selectedCategoryTag}
                onPress={() => handleSelectCategory(category)}>
                <Text style={styles.selectedCategoryEmoji}>
                  {category.emoji}
                </Text>
                <Text style={styles.selectedCategoryTagText}>
                  {category.name}
                </Text>
                <Text style={styles.removeIcon}>×</Text>
              </TouchableOpacity>
            ))}

            {selectedCategories.length === 0 && (
              <Text style={styles.emptyText}>
                Henüz kategori seçmediniz. Lütfen en az 1 kategori seçin.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          (selectedCategories.length === 0 || isSubmitting) &&
            styles.disabledButton,
        ]}
        onPress={handleSaveCategories}
        disabled={selectedCategories.length === 0 || isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Devam Et</Text>
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
  categoriesScrollView: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  categoryItem: {
    width: windowWidth * 0.44,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  selectedCategoryItem: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#F0F8FF',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontWeight: 'bold',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectionContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  selectedCategoriesScroll: {
    maxHeight: 60,
  },
  selectedCategoriesRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  selectedCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  selectedCategoryEmoji: {
    fontSize: 14,
    marginRight: 4,
    color: 'white',
  },
  selectedCategoryTagText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    padding: 8,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
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

export default HobbySelectScreen;
