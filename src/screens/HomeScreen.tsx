import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../types';
import { getBills, deleteBill, saveBill } from '../utils/storage';
import ClayCard from '../components/ClayCard';
import { Colors, Layout, Shadows } from '../constants/theme';
import { v4 as uuidv4 } from 'uuid';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = async () => {
    try {
      const data = await getBills();
      setBills(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBills();
  };

  const createNewBill = async () => {
    const newBill: Bill = {
      id: uuidv4(),
      restaurantName: 'New Restaurant',
      date: new Date().toISOString(),
      items: [],
      diners: [
        { id: uuidv4(), name: 'You', color: '#818cf8' },
      ],
      taxRate: 8.5,
      tipPercentage: 18,
      status: 'active',
    };
    await saveBill(newBill);
    navigation.navigate('BillDetail', { billId: newBill.id });
  };

  const handleDeleteBill = (billId: string) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBill(billId);
            loadBills();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTotalAmount = (bill: Bill) => {
    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * (bill.taxRate / 100);
    const tip = subtotal * (bill.tipPercentage / 100);
    return subtotal + tax + tip;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tip Split</Text>
        <Text style={styles.subtitle}>Split bills fairly with friends</Text>
      </View>

      {bills.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={Colors.accent} />
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptyText}>Create your first bill to start splitting with friends</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={createNewBill}>
            <Text style={styles.emptyButtonText}>Create New Bill</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ClayCard>
              <TouchableOpacity
                onPress={() => navigation.navigate('BillDetail', { billId: item.id })}
                onLongPress={() => handleDeleteBill(item.id)}
                delayLongPress={500}
              >
                <View style={styles.billHeader}>
                  <View style={styles.billInfo}>
                    <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                    <Text style={styles.date}>{formatDate(item.date)} • {item.items.length} items</Text>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amount}>${getTotalAmount(item).toFixed(2)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                  </View>
                </View>
                <View style={styles.dinersRow}>
                  {item.diners.slice(0, 4).map((diner, idx) => (
                    <View
                      key={diner.id}
                      style={[styles.dinerDot, { backgroundColor: diner.color }, idx > 0 && { marginLeft: -8 }]}
                    >
                      <Text style={styles.dinerInitial}>{diner.name[0]}</Text>
                    </View>
                  ))}
                  {item.diners.length > 4 && (
                    <View style={[styles.dinerDot, { backgroundColor: Colors.textLight, marginLeft: -8 }]}>
                      <Text style={styles.dinerInitial}>+{item.diners.length - 4}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </ClayCard>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={createNewBill}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  list: {
    paddingBottom: 100,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  billInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textLight,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accentDark,
    marginRight: 4,
  },
  dinersRow: {
    flexDirection: 'row',
    marginTop: Layout.spacing.sm,
  },
  dinerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  dinerInitial: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: Layout.spacing.lg,
    bottom: Layout.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xs,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.buttonRadius,
    ...Shadows.button,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
  },
});
