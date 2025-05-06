import React from 'react';
import {StyleSheet, TouchableOpacity, Text, View} from 'react-native';
import {COLORS} from '../config/constants';
import {Hobby} from '../types';

interface HobbyItemProps {
  hobby: Hobby;
  selected: boolean;
  disabled?: boolean;
  onPress: (hobby: Hobby) => void;
}

const HobbyItem: React.FC<HobbyItemProps> = ({
  hobby,
  selected,
  disabled = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
      onPress={() => !disabled && onPress(hobby)}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}>
      <Text style={[styles.name, selected && styles.selectedText]}>
        {hobby.name}
      </Text>
      {hobby.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Popüler</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: COLORS.PRIMARY,
  },
  disabled: {
    opacity: 0.5,
  },
  name: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  selectedText: {
    color: 'white',
  },
  popularBadge: {
    backgroundColor: '#FFC107',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 8,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HobbyItem;
