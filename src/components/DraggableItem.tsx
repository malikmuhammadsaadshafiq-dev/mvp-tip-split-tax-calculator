import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { FoodItem, Diner } from '../types';
import { Colors, Layout } from '../constants/theme';

interface DraggableItemProps {
  item: FoodItem;
  diners: Diner[];
  onAssign: (itemId: string, dinerId: string) => void;
  style?: any;
}

export default function DraggableItem({ item, diners, onAssign, style }: DraggableItemProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      
      // Check if dropped on a diner area (simplified logic)
      if (event.translationY > 100 && event.translationY < 300) {
        const dinerIndex = Math.floor((event.translationX + 150) / 100);
        if (dinerIndex >= 0 && dinerIndex < diners.length) {
          runOnJS(onAssign)(item.id, diners[dinerIndex].id);
        }
      }
      
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const assignedNames = item.assignedTo.length > 0
    ? diners.filter(d => item.assignedTo.includes(d.id)).map(d => d.name).join(', ')
    : 'Unassigned';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle, style]}>
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.assignedContainer}>
          <Text style={styles.assignedText}>{assignedNames}</Text>
          {item.assignedTo.length > 1 && (
            <Text style={styles.splitIndicator}>Split {item.assignedTo.length} ways</Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Layout.cardRadius,
    padding: Layout.spacing.md,
    marginVertical: Layout.spacing.xs,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accentDark,
  },
  assignedContainer: {
    marginTop: Layout.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  splitIndicator: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
    backgroundColor: Colors.background.start,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
});
