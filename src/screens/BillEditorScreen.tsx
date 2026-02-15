import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Bill, Item, Diner } from '../types';
import { Storage } from '../utils/storage';
import { MeshGradient } from '../components/MeshGradient';
import { GlassCard } from '../components/GlassCard';
import { Toast } from '../components/Toast';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'BillEditor'>;

export const BillEditorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { billId } = route.params || {};

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [dinerName, setDinerName] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as const });

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    if (!billId) {
      setLoading(false);
      return;
    }
    const bills = await Storage.getBills();
    const found = bills.find((b) => b.id === billId);
    if (found) {
      setBill(found);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const saveBill = async (updatedBill: Bill) => {
    await Storage.saveBill(updatedBill);
    setBill(updatedBill);
  };

  const addItem = () => {
    if (!itemName.trim() || !itemPrice.trim() || !bill) return;
    const price = parseFloat(itemPrice);
    if (isNaN(price)) return;

    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      name: itemName.trim(),
      price,
      assignedTo: null,
    };

    const updated = { ...bill, items: [...bill.items, newItem] };
    saveBill(updated);
    setItemName('');
    setItemPrice('');
    showToast('Item added');
  };

  const addDiner = () => {
    if (!dinerName.trim() || !bill) return;
    const colors = ['#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];
    const newDiner: Diner = {
      id: Math.random().toString(36).substr(2, 9),
      name: dinerName.trim(),
      avatarColor: colors[bill.diners.length % colors.length],
    };
    const updated = { ...bill, diners: [...bill.diners, newDiner] };
    saveBill(updated);
    setDinerName('');
    showToast('Diner added');
  };

  const assignItem = (itemId: string, dinerId: string) => {
    if (!bill) return;
    const updatedItems = bill.items.map((item) =>
      item.id === itemId ? { ...item, assignedTo: dinerId } : item
    );
    const updated = { ...bill, items: updatedItems };
    saveBill(updated);
  };

  const updateRates = (tax: string, tip: string) => {
    if (!bill) return;
    const taxRate = parseFloat(tax) / 100;
    const tipRate = parseFloat(tip) / 100;
    const updated = {
      ...bill,
      taxRate: isNaN(taxRate) ? 0 : taxRate,
      tipRate: isNaN(tipRate) ? 0 : tipRate,
    };
    saveBill(updated);
  };

  const calculateTotal = () => {
    if (!bill) return 0;
    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * bill.taxRate;
    const tip = subtotal * bill.tipRate;
    return subtotal + tax + tip;
  };

  if (loading || !bill) {
    return (
      <MeshGradient>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </MeshGradient>
    );
  }

  return (
    <MeshGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TextInput
          style={styles.billNameInput}
          value={bill.name}
          onChangeText={(text) => saveBill({ ...bill, name: text })}
          placeholder="Bill Name"
          placeholderTextColor={Colors.textSecondary}
        />

        <GlassCard>
          <Text style={styles.sectionTitle}>Diners</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.flex1]}
              value={dinerName}
              onChangeText={setDinerName}
              placeholder="Add diner name"
              placeholderTextColor={Colors.textSecondary}
            />
            <TouchableOpacity onPress={addDiner} style={styles.addButton}>
              <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.gradientButton}>
                <Ionicons name="add" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.dinerList}>
            {bill.diners.map((diner) => (
              <View key={diner.id} style={[styles.dinerChip, { borderColor: diner.avatarColor }]}>
                <View style={[styles.dinerDot, { backgroundColor: diner.avatarColor }]} />
                <Text style={styles.dinerText}>{diner.name}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionTitle}>Add Item</Text>
          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            placeholder="Item name (e.g. Burger)"
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.flex1]}
              value={itemPrice}
              onChangeText={setItemPrice}
              placeholder="Price"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textSecondary}
            />
            <TouchableOpacity onPress={addItem} style={styles.addButton}>
              <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionTitle}>Tax & Tip</Text>
          <View style={styles.rateRow}>
            <View style={styles.rateInput}>
              <Text style={styles.rateLabel}>Tax %</Text>
              <TextInput
                style={styles.smallInput}
                value={(bill.taxRate * 100).toString()}
                onChangeText={(text) => updateRates(text, (bill.tipRate * 100).toString())}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            <View style={styles.rateInput}>
              <Text style={styles.rateLabel}>Tip %</Text>
              <TextInput
                style={styles.smallInput}
                value={(bill.tipRate * 100).toString()}
                onChangeText={(text) => updateRates((bill.taxRate * 100).toString(), text)}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Items ({bill.items.length})</Text>
        {bill.items.map((item) => (
          <GlassCard key={item.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.assignmentContainer}>
                {bill.diners.map((diner) => (
                  <TouchableOpacity
                    key={diner.id}
                    onPress={() => assignItem(item.id, diner.id)}
                    style={[
                      styles.assignButton,
                      item.assignedTo === diner.id && { backgroundColor: diner.avatarColor },
                    ]}
                  >
                    <Text style={styles.assignButtonText}>{diner.name[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>
        ))}

        <GlassCard style={styles.totalCard}>
          <Text style={styles.totalLabel}>Estimated Total</Text>
          <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
        </GlassCard>

        <TouchableOpacity
          style={styles.splitButton}
          onPress={() => navigation.navigate('Split', { billId: bill.id })}
        >
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.splitGradient}>
            <Text style={styles.splitButtonText}>Calculate Split</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        <Toast {...toast} onHide={() => setToast({ ...toast, visible: false })} />
      </ScrollView>
    </MeshGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billNameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
  },
  flex1: {
    flex: 1,
    marginBottom: 0,
  },
  smallInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    width: 80,
    textAlign: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dinerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dinerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  dinerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  dinerText: {
    color: Colors.text,
    fontSize: 14,
  },
  rateRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  rateInput: {
    alignItems: 'center',
  },
  rateLabel: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  itemCard: {
    marginVertical: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  itemPrice: {
    color: Colors.accent,
    fontSize: 14,
    marginTop: 2,
  },
  assignmentContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  assignButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  assignButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  totalCard: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  totalLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  splitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  splitGradient: {
    flexDirection: 'row',
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});