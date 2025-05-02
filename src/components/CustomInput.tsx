import React, {useState} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import {COLORS} from '../config/constants';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface CustomInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  onBlur?: () => void;
  autoCorrect?: boolean;
  editable?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  error,
  style,
  inputStyle,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  multiline = false,
  onBlur,
  autoCorrect = false,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const containerStyles = [
    styles.container,
    isFocused && styles.focusedContainer,
    error && styles.errorContainer,
    !editable && styles.disabledContainer,
    style,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    error && styles.errorInput,
    !editable && styles.disabledInput,
    inputStyle,
  ];

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyles}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          autoCorrect={autoCorrect}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
            hitSlop={{top: 15, right: 15, bottom: 15, left: 15}}>
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: windowHeight * 0.015,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    height: windowHeight * 0.06,
  },
  focusedContainer: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1.5,
  },
  errorContainer: {
    borderColor: COLORS.ERROR,
    borderWidth: 1.5,
  },
  disabledContainer: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 12,
    height: '100%',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  errorInput: {
    color: '#333',
  },
  disabledInput: {
    color: '#777',
  },
  leftIconContainer: {
    paddingLeft: 12,
  },
  rightIconContainer: {
    paddingRight: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#777',
  },
});

export default CustomInput;
