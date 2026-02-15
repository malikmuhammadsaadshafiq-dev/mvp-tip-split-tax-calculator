import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, Layout } from 'react-native-reanimated';
import { RootStackParamList } from '../navigation';
import { Bill, BillItem, Diner } from '../types';
import { getBillById, updateBill } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'SplitBill'>;

interface DinerSummary {
  items: BillItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export default function SplitBillScreen({ route, navigation }: Props) {
  const { billId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDiner, setSelectedDiner] = useState<string | null>(null);

  useEffect(() => {
    loadBill();
  }, []);

  const loadBill = async () => {
    const data = await getBillById(billId);
    if (data) {
      setBill(data);
      if (data.diners.length > 0) {
        setSelectedDiner(data.diners[0].id);
      }
    }
    setLoading(false);
  };

  const assignItem = (itemId: string, dinerId: string | null) => {
    if (!bill) return;
    const updatedItems = bill.items.map(item =>
      item.id === itemId ? { ...item, assignedTo: dinerId } : item
    );
    const updatedBill = { ...bill, items: updatedItems };
    setBill(updatedBill);
    updateBill(updatedBill);
  };

  const splitItem = (itemId: string) => {
    if (!bill) return;
    const item = bill.items.find(i => i.id === itemId);
    if (!item) return;

    Alert.alert(
      'Split Item',
      `Split "${item.name}" between how many people?`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...[2, 3, 4].map(num => ({
          text: `${num} people`,
          onPress: () => {
            const splitPrice = item.price / num;
            const newItems: BillItem[] = [];
            for (let i = 0; i < num; i++) {
              newItems.push({
                ...item,
                id: `${item.id}-split-${i}-${Date.now()}`,
                price: splitPrice,
                name: `${item.name} (1/${num})`,
                assignedTo: null,
              });
            }
            const updatedItems = bill.items.filter(i => i.id !== itemId).concat(newItems);
            const updatedBill = { ...bill, items: updatedItems };
            setBill(updatedBill);
            updateBill(updatedBill);
          },
        })),
      ]
    );
  };

  const calculateDinerSummary = (dinerId: string): DinerSummary => {
    if (!bill) return { items: [], subtotal: 0, tax: 0, tip: 0, total: 0 };
    const items = bill.items.filter(i => i.assignedTo === dinerId);
    const subtotal = items.reduce((sum, i) => sum + i.price, 0);
    const tax = subtotal * (bill.taxRate / 100);
    const tip = subtotal * (bill.tipRate / 100);
    return {
      items,
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip,
    };
  };

  const getUnassignedItems = () => {
    if (!bill) return [];
    return bill.items.filter(i => i.assignedTo === null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.centered}>
        <Text>Bill not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.restaurantName}>{bill.restaurantName}</Text>
          <Text style={styles.totals}>
            Tax: {bill.taxRate}% • Tip: {bill.tipRate}%
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tap Diner to Assign Items</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dinersScroll}
          contentContainerStyle={styles.dinersContent}
        >
          {bill.diners.map((diner, index) => {
            const summary = calculateDinerSummary(diner.id);
            const isSelected = selectedDiner === diner.id;
            return (
              <Animated.View entering={SlideInRight.delay(index * 100)} key={diner.id}>
                <TouchableOpacity
                  style={[
                    styles.dinerCard,
                    isSelected && styles.selectedDinerCard,
                    { borderLeftColor: diner.color, borderLeftWidth: 4 },
                  ]}
                  onPress={() => setSelectedDiner(diner.id)}
                >
                  <Text style={styles.dinerName}>{diner.name}</Text>
                  <Text style={styles.dinerTotal}>${summary.total.toFixed(2)}</Text>
                  <Text style={styles.itemCount}>{summary.items.length} items</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        {selectedDiner && (
          <Animated.View entering={FadeIn} style={styles.selectedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Assigning to: {bill.diners.find(d => d.id === selectedDiner)?.name}
              </Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => navigation.navigate('Payment', { billId, dinerId: selectedDiner })}
              >
                <Text style={styles.payButtonText}>Pay</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.subSectionTitle}>Unassigned Items (Tap to Assign)</Text>
              {getUnassignedItems().length === 0 ? (
                <Text style={styles.emptyText}>All items assigned!</Text>
              ) : (
                getUnassignedItems().map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemRow}
                    onPress={() => assignItem(item.id, selectedDiner)}
                    onLongPress={() => splitItem(item.id)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color="#f59e0b" />
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.subSectionTitle}>Assigned Items (Tap to Remove)</Text>
              {calculateDinerSummary(selectedDiner).items.length === 0 ? (
                <Text style={styles.emptyText}>No items assigned yet</Text>
              ) : (
                calculateDinerSummary(selectedDiner).items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.assignedItemRow}
                    onPress={() => assignItem(item.id, null)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                    <Ionicons name="remove-circle-outline" size={24} color="#ef4444" />
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${calculateDinerSummary(selectedDiner).subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({bill.taxRate}%)</Text>
                <Text style={styles.summaryValue}>
                  ${calculateDinerSummary(selectedDiner).tax.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tip ({bill.tipRate}%)</Text>
                <Text style={styles.summaryValue}>
                  ${calculateDinerSummary(selectedDiner).tip.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${calculateDinerSummary(selectedDiner).total.toFixed(2)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffedd5',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  totals: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  dinersScroll: {
    maxHeight: 120,
  },
  dinersContent: {
    gap: 12,
    paddingRight: 16,
  },
  dinerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDinerCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  dinerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dinerTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  payButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffedd5',
  },
  assignedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffedd5',
    backgroundColor: '#fffbeb',
    marginHorizontal: -16,
    paddingHorizontal: 16,
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
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ffedd5',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f59e0b',
  },
});