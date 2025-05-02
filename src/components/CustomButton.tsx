import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {COLORS} from '../config/constants';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const buttonStyles = [
    styles.button,
    type === 'primary' && styles.primaryButton,
    type === 'secondary' && styles.secondaryButton,
    type === 'outline' && styles.outlineButton,
    type === 'text' && styles.textButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    type === 'primary' && styles.primaryText,
    type === 'secondary' && styles.secondaryText,
    type === 'outline' && styles.outlineText,
    type === 'text' && styles.textButtonText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            type === 'outline' || type === 'text' ? COLORS.PRIMARY : '#fff'
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: windowHeight * 0.06,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minWidth: windowWidth * 0.4,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: COLORS.PRIMARY,
  },
  textButtonText: {
    color: COLORS.PRIMARY,
  },
  disabledText: {
    color: '#888',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default CustomButton;
