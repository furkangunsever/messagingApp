import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {COLORS} from '../config/constants';
import {Hobby} from '../services/firebase/database/hobbies/types';

interface SelectedHobbyListProps {
  selectedHobbies: Hobby[];
  maxCount: number;
  onRemove: (hobby: Hobby) => void;
}

const SelectedHobbyList: React.FC<SelectedHobbyListProps> = ({
  selectedHobbies,
  maxCount,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Seçilen İlgi Alanları</Text>
        <Text style={styles.counter}>
          {selectedHobbies.length}/{maxCount}
        </Text>
      </View>

      {selectedHobbies.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {selectedHobbies.map(hobby => (
            <TouchableOpacity
              key={hobby.id}
              style={styles.hobbyTag}
              onPress={() => onRemove(hobby)}>
              <Text style={styles.hobbyEmoji}>{hobby.emoji}</Text>
              <Text style={styles.hobbyName}>{hobby.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Henüz ilgi alanı seçmediniz. Lütfen yukarıdan en az bir ilgi alanı
            seçin.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  counter: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 44,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  hobbyEmoji: {
    fontSize: 14,
    marginRight: 6,
    color: 'white',
  },
  hobbyName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeIcon: {
    marginLeft: 6,
  },
  emptyContainer: {
    padding: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default SelectedHobbyList;
