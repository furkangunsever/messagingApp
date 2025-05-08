import React from 'react';
import {StyleSheet, TouchableOpacity, Text, View} from 'react-native';
import {COLORS} from '../config/constants';
import {Hobby} from '../services/firebase/database/hobbies/types';

interface HobbyItemProps {
  hobby: Hobby;
  isSelected: boolean;
  onSelect: () => void;
}

const HobbyItem: React.FC<HobbyItemProps> = ({hobby, isSelected, onSelect}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onSelect}
      activeOpacity={0.7}>
      <Text style={styles.emoji}>{hobby.emoji}</Text>
      <Text style={[styles.name, isSelected && styles.selectedText]}>
        {hobby.name}
      </Text>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  selected: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#F0F8FF',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  selectedText: {
    color: COLORS.PRIMARY,
  },
  checkmark: {
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
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HobbyItem;
