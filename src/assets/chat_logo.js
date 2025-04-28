import React from 'react';
import {View, StyleSheet} from 'react-native';

const ChatLogo = ({size = 200, color = '#6200ee'}) => {
  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <View style={[styles.bubble, {backgroundColor: color}]} />
      <View style={[styles.bubble2, {backgroundColor: color}]} />
      <View style={[styles.triangle, {borderBottomColor: color}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    width: '70%',
    height: '70%',
    borderRadius: 35,
    position: 'absolute',
    top: '15%',
    left: '15%',
  },
  bubble2: {
    width: '25%',
    height: '25%',
    borderRadius: 12.5,
    position: 'absolute',
    bottom: '5%',
    right: '15%',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    bottom: '20%',
    left: '25%',
    transform: [{rotate: '45deg'}],
  },
});

export default ChatLogo;
