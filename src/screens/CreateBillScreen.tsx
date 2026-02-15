import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation';
import { Bill, BillItem, Diner, DINER_COLORS } from '../types';
import { addBill } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBill'>;

const DEMO_ITEMS = [
  { name: 'Margherita Pizza', price: 18.99 },
  { name: 'Caesar Salad', price: 12.50 },
  { name: 'Chicken Alfredo', price: 22.00 },
  { name: 'Garlic Bread', price: 6.99 },
  { name: 'Tiramisu', price: 9.50 },
  { name: 'Iced Tea', price: 3.99 },
  { name: 'Craft Beer', price: 8.00 },
  { name: 'Bruschetta', price: 11.50 },
  { name: 'Seafood Pasta', price: 26.99 },
  { name: 'Caprese Salad', price: 13.50 },
  { name: 'Espresso', price: 4.50 },
  { name: 'Chocolate Lava Cake', price: 10.99 },
];

export default function CreateBillScreen({ navigation }: Props) {
  const [restaurantName, setRestaurantName] = useState('');
  const [taxRate, setTaxRate] = useState('8.5');
  const [tipRate, setTipRate] = useState('18');
  const [items, setItems] = useState<BillItem[]>([]);
  const [diners, setDiners] = useState<Diner[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newDinerName, setNewDinerName] = useState('');

  const addItem = () => {
    if (!newItemName || !newItemPrice) return;
    const item: BillItem = {
      id: uuidv4(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      assignedTo: null,
    };
    setItems([...items, item]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const addDiner = () => {
    if (!newDinerName) return;
    const diner: Diner = {
      id: uuidv4(),
      name: newDinerName,
      color: DINER_COLORS[diners.length % DINER_COLORS.length],
    };
    setDiners([...diners, diner]);
    setNewDinerName('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const removeDiner = (id: string) => {
    setDiners(diners.filter(d => d.id !== id));
    setItems(items.map(i => i.assignedTo === id ? { ...i, assignedTo: null } : i));
  };

  const loadDemoData = () => {
    const demoItems: BillItem[] = DEMO_ITEMS.map(item => ({
      id: uuidv4(),
      name: item.name,
      price: item.price,
      assignedTo: null,
    }));
    const demoDiners: Diner[] = [
      { id: uuidv4(), name: 'Alex', color: DINER_COLORS[0] },
      { id: uuidv4(), name: 'Jordan', color: DINER_COLORS[1] },
      { id: uuidv4(), name: 'Taylor', color: DINER_COLORS[2] },
      { id: uuidv4(), name: 'Morgan', color: DINER_COLORS[3] },
    ];
    setItems(demoItems);
    setDiners(demoDiners);
    setRestaurantName('Bella Vista Restaurant');
    Alert.alert('Demo Data Loaded', '12 items and 4 diners added!');
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const saveBill = async () => {
    if (!restaurantName || items.length === 0 || diners.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and add items/diners');
      return;
    }

    const bill: Bill = {
      id: uuidv4(),
      restaurantName,
      date: new Date().toISOString(),
      items,
      diners,
      taxRate: parseFloat(taxRate) || 0,
      tipRate: parseFloat(tipRate) || 0,
      subtotal: calculateSubtotal(),
    };

    await addBill(bill);
    navigation.navigate('SplitBill', { billId: bill.id });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            value={restaurantName}
            onChangeText={setRestaurantName}
            placeholder="e.g. The Burger Joint"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="decimal-pad"
              placeholder="8.5"
            />
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.label}>Tip Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={tipRate}
              onChangeText={setTipRate}
              keyboardType="decimal-pad"
              placeholder="18"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
            <TouchableOpacity onPress={loadDemoData} style={styles.demoButton}>
              <Text style={styles.demoButtonText}>Load Demo</Text>
            </TouchableOpacity>
          </View>
          
          {items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, styles.itemInput]}
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Item name"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.addIconButton} onPress={addItem}>
              <Ionicons name="add-circle" size={32} color="#f59e0b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Diners ({diners.length})</Text>
          
          <View style={styles.dinersContainer}>
            {diners.map(diner => (
              <View key={diner.id} style={[styles.dinerTag, { backgroundColor: diner.color }]}>
                <Text style={styles.dinerTagText}>{diner.name}</Text>
                <TouchableOpacity onPress={() => removeDiner(diner.id)}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, styles.flexInput]}
              value={newDinerName}
              onChangeText={setNewDinerName}
              placeholder="Diner name"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.addIconButton} onPress={addDiner}>
              <Ionicons name="person-add" size={28} color="#f59e0b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Subtotal: ${calculateSubtotal().toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={saveBill} activeOpacity={0.8}>
          <LinearGradient
            colors={['#f59e0b', '#e11d48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Create Bill & Split</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    color: '#1f2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  demoButton: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffedd5',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  itemInput: {
    flex: 2,
  },
  priceInput: {
    flex: 1,
  },
  flexInput: {
    flex: 1,
  },
  addIconButton: {
    padding: 4,
  },
  dinersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dinerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dinerTagText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff7ed',
    borderTopWidth: 1,
    borderTopColor: '#ffedd5',
  },
  saveButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});