import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Shadows, Layout } from '../constants/theme';

interface ClayCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'high' | 'medium' | 'low';
}

export default function ClayCard({ children, style, intensity = 'high' }: ClayCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.card, intensity === 'high' && styles.highShadow]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.sm,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.spacing.lg,
    ...Shadows.clay,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  highShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
});
