import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PRIMARY_BROWN } from '../config/constants';

interface LazyLoaderProps {
  children: React.ReactNode;
  delay?: number;
  fallback?: React.ReactNode;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children, 
  delay = 100, 
  fallback 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  if (!isLoaded) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={PRIMARY_BROWN} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
});

export default LazyLoader; 