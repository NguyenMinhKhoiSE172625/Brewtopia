import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface AppLoadingProps {
  text?: string;
  color?: string;
  size?: 'small' | 'large' | number;
}

export default function AppLoading({ text = 'Đang tải...', color = '#6E543C', size = 'large' }: AppLoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  text: {
    marginLeft: 10,
    color: '#6E543C',
    fontSize: 16,
    fontWeight: '500',
  },
}); 