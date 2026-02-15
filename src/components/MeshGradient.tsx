import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const MeshGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.base} />
      <View style={[styles.blob, { top: -100, left: -100, backgroundColor: '#7c3aed' }]} />
      <View style={[styles.blob, { top: -50, right: -100, backgroundColor: '#06b6d4' }]} />
      <View style={[styles.blob, { bottom: -100, right: -50, backgroundColor: '#f472b6' }]} />
      <View style={[styles.blob, { bottom: -50, left: -100, backgroundColor: '#fbbf24' }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
});