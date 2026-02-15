import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Bill, FoodItem, Diner, RootStackParamList } from '../types';
import { getBillById, saveBill } from '../utils/storage';
import ClayCard from '../components/ClayCard';
import DraggableItem from '../components/DraggableItem';
import DinerZone from '../components/DinerZone';
import { Colors, Layout, DinerColors } from '../constants/theme';
import { v4 as uuidv4 } from 'uuid';

type BillDetailRouteProp = RouteProp<RootStackParamList, 'BillDetail'>;

export default function BillDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<BillDetailRouteProp>();
  const { billId } = route.params;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newDinerName, setNewDinerName] = useState('');
  const [selectedDiner, setSelectedDiner] = useState<string | null>(null);

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    const data = await getBillById(billId);
    if (data) {
      setBill(data);
    }
    setLoading(false);
  };

  const saveChanges = async (updatedBill: Bill) => {
    await saveBill(updatedBill);
    setBill(updatedBill);
  };

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim() || !bill) return;
    
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    const newItem: FoodItem = {
      id: uuidv4(),
      name: newItemName.trim(),
      price: price,
      assignedTo: selectedDiner ? [selectedDiner] : [],
      splitType: 'equal',
    };

    const updatedBill = { ...bill, items: [...bill.items, newItem] };
    saveChanges(updatedBill);
    setNewItemName('');
    setNewItemPrice('');
  };

  const addDiner = () => {
    if (!newDinerName.trim() || !bill) return;
    
    const colorIndex = bill.diners.length % DinerColors.length;
    const newDiner: Diner = {
      id: uuidv4(),
      name: newDinerName.trim(),
      color: DinerColors[colorIndex],
    };

    const updatedBill = { ...bill, diners: [...bill.diners, newDiner] };
    saveChanges(updatedBill);
    setNewDinerName('');
  };

  const assignItemToDiner = (itemId: string, dinerId: string) => {
    if (!bill) return;
    
    const updatedItems = bill.items.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(dinerId);
        if (isAssigned) {
          return { ...item, assignedTo: item.assignedTo.filter(id => id !== dinerId) };
        } else {
          return { ...item, assignedTo: [...item.assignedTo, dinerId] };
        }
      }
      return item;
    });

    saveChanges({ ...bill, items: updatedItems });
  };

  const updateTaxTip = (field: 'taxRate' | 'tipPercentage', value: string) => {
    if (!bill) return;
    const numValue = parseFloat(value) || 0;
    saveChanges({ ...bill, [field]: numValue });
  };

  const getDinerSubtotal = (dinerId: string) => {
    if (!bill) return 0;
    return bill.items.reduce((sum, item) => {
      if (item.assignedTo.includes(dinerId)) {
        return sum + (item.price / item.assignedTo.length);
      }
      return sum;
    }, 0);
  };

  if (loading || !bill) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.restaurantInput}
            value={bill.restaurantName}
            onChangeText={(text) => saveChanges({ ...bill, restaurantName: text })}
            placeholder="Restaurant Name"
          />
          <TouchableOpacity onPress={() => navigation.navigate('Summary', { billId })} style={styles.summaryButton}>
            <Text style={styles.summaryText}>Summary</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ClayCard style={styles.taxTipCard}>
            <Text style={styles.sectionTitle}>Tax & Tip</Text>
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tax Rate (%)</Text>
                <TextInput
                  style={styles.input}
                  value={bill.taxRate.toString()}
                  onChangeText={(text) => updateTaxTip('taxRate', text)}
                  keyboardType="decimal-pad"
                  placeholder="8.5"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tip (%)</Text>
                <TextInput
                  style={styles.input}
                  value={bill.tipPercentage.toString()}
                  onChangeText={(text) => updateTaxTip('tipPercentage', text)}
                  keyboardType="decimal-pad"
                  placeholder="18"
                />
              </View>
            </View>
          </ClayCard>

          <Text style={styles.sectionHeader}>Diners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dinersScroll}>
            {bill.diners.map((diner) => (
              <TouchableOpacity
                key={diner.id}
                onPress={() => setSelectedDiner(selectedDiner === diner.id ? null : diner.id)}
              >
                <DinerZone
                  diner={diner}
                  items={bill.items}
                  total={getDinerSubtotal(diner.id)}
                  isActive={selectedDiner === diner.id}
                />
              </TouchableOpacity>
            ))}
            <ClayCard style={styles.addDinerCard}>
              <TextInput
                style={styles.addDinerInput}
                placeholder="Add diner..."
                value={newDinerName}
                onChangeText={setNewDinerName}
                onSubmitEditing={addDiner}
              />
              <TouchableOpacity onPress={addDiner} style={styles.addButton}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </ClayCard>
          </ScrollView>

          <Text style={styles.sectionHeader}>Items</Text>
          <Text style={styles.dragHint}>Tap diner above, then add item • Or drag items to diners</Text>
          
          {bill.items.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInUp.delay(index * 50)}>
              <DraggableItem
                item={item}
                diners={bill.diners}
                onAssign={assignItemToDiner}
              />
            </Animated.View>
          ))}

          <ClayCard style={styles.addItemCard}>
            <Text style={styles.addItemTitle}>Add New Item</Text>
            <TextInput
              style={styles.itemInput}
              placeholder="Item name (e.g., Burger)"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.itemInput, styles.priceInput]}
                placeholder="0.00"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity onPress={addItem} style={styles.addItemButton}>
                <Text style={styles.addItemButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
            {selectedDiner && (
              <Text style={styles.assignHint}>
                Will be assigned to: {bill.diners.find(d => d.id === selectedDiner)?.name}
              </Text>
            )}
          </ClayCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  restaurantInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },
  summaryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.buttonRadius,
  },
  summaryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  taxTipCard: {
    marginBottom: Layout.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Layout.spacing.xs,
  },
  input: {
    backgroundColor: Colors.background.start,
    borderRadius: 12,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  dinersScroll: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
  },
  addDinerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    minWidth: 150,
  },
  addDinerInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Layout.spacing.sm,
  },
  dragHint: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: Layout.spacing.md,
    fontStyle: 'italic',
  },
  addItemCard: {
    marginTop: Layout.spacing.lg,
    marginBottom: 100,
  },
  addItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  itemInput: {
    backgroundColor: Colors.background.start,
    borderRadius: 12,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  priceInput: {
    flex: 1,
  },
  addItemButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.buttonRadius,
    justifyContent: 'center',
    marginLeft: Layout.spacing.md,
  },
  addItemButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  assignHint: {
    fontSize: 13,
    color: Colors.accent,
    marginTop: Layout.spacing.xs,
  },
});
