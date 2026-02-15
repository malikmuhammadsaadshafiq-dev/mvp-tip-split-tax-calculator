import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Diner, FoodItem } from '../types';
import { Colors, Layout } from '../constants/theme';

interface DinerZoneProps {
  diner: Diner;
  items: FoodItem[];
  total: number;
  isActive: boolean;
}

export default function DinerZone({ diner, items, total, isActive }: DinerZoneProps) {
  const dinerItems = items.filter(item => item.assignedTo.includes(diner.id));
  
  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <View style={[styles.avatar, { backgroundColor: diner.color }]}>
        <Text style={styles.avatarText}>{diner.name[0]}</Text>
      </View>
      <Text style={styles.name}>{diner.name}</Text>
      <Text style={styles.itemCount}>{dinerItems.length} items</Text>
      <Text style={styles.total}>${total.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Layout.cardRadius,
    marginHorizontal: Layout.spacing.xs,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeContainer: {
    borderColor: Colors.accent,
    transform: [{ scale: 1.05 }],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: Layout.spacing.xs,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accentDark,
  },
});
