import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Bill, DinerTotal, RootStackParamList } from '../types';
import { getBillById, saveBill } from '../utils/storage';
import ClayCard from '../components/ClayCard';
import { Colors, Layout } from '../constants/theme';

type SummaryRouteProp = RouteProp<RootStackParamList, 'Summary'>;

export default function SummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute<SummaryRouteProp>();
  const { billId } = route.params;

  const [bill, setBill] = useState<Bill | null>(null);
  const [totals, setTotals] = useState<DinerTotal[]>([]);
  const [roundingMode, setRoundingMode] = useState<'none' | 'up' | 'down' | 'nearest'>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [billId]);

  const loadData = async () => {
    const data = await getBillById(billId);
    if (data) {
      setBill(data);
      calculateTotals(data);
    }
    setLoading(false);
  };

  const calculateTotals = (billData: Bill) => {
    const calculatedTotals = billData.diners.map(diner => {
      const dinerItems = billData.items.filter(item => item.assignedTo.includes(diner.id));
      const subtotal = dinerItems.reduce((sum, item) => {
        return sum + (item.price / item.assignedTo.length);
      }, 0);
      
      const taxAmount = subtotal * (billData.taxRate / 100);
      const tipAmount = subtotal * (billData.tipPercentage / 100);
      const total = subtotal + taxAmount + tipAmount;
      
      let roundedTotal = total;
      if (roundingMode === 'up') {
        roundedTotal = Math.ceil(total);
      } else if (roundingMode === 'down') {
        roundedTotal = Math.floor(total);
      } else if (roundingMode === 'nearest') {
        roundedTotal = Math.round(total);
      }

      return {
        dinerId: diner.id,
        name: diner.name,
        color: diner.color,
        subtotal,
        taxAmount,
        tipAmount,
        total,
        roundedTotal,
        items: dinerItems,
      };
    });

    setTotals(calculatedTotals);
  };

  const updateRounding = (mode: 'none' | 'up' | 'down' | 'nearest') => {
    setRoundingMode(mode);
    if (bill) {
      calculateTotals(bill);
    }
  };

  const shareBreakdown = async () => {
    if (!bill || totals.length === 0) return;
    
    let message = `💰 ${bill.restaurantName} Bill Split\n\n`;
    totals.forEach(t => {
      message += `${t.name}: $${t.roundedTotal.toFixed(2)}\n`;
      message += `  (Subtotal: $${t.subtotal.toFixed(2)} + Tax: $${t.taxAmount.toFixed(2)} + Tip: $${t.tipAmount.toFixed(2)})\n\n`;
    });
    message += `Tax: ${bill.taxRate}% | Tip: ${bill.tipPercentage}%`;
    
    try {
      await Share.share({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const completeBill = async () => {
    if (!bill) return;
    await saveBill({ ...bill, status: 'completed' });
    Alert.alert('Bill Completed', 'This bill has been marked as completed.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Summary</Text>
        <TouchableOpacity onPress={shareBreakdown}>
          <Ionicons name="share-outline" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ClayCard style={styles.totalsCard}>
          <Text style={styles.cardTitle}>Bill Overview</Text>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Subtotal</Text>
            <Text style={styles.overviewValue}>
              ${bill.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Tax ({bill.taxRate}%)</Text>
            <Text style={styles.overviewValue}>
              ${(bill.items.reduce((sum, item) => sum + item.price, 0) * (bill.taxRate / 100)).toFixed(2)}
            </Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Tip ({bill.tipPercentage}%)</Text>
            <Text style={styles.overviewValue}>
              ${(bill.items.reduce((sum, item) => sum + item.price, 0) * (bill.tipPercentage / 100)).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.overviewRow, styles.totalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ${(bill.items.reduce((sum, item) => sum + item.price, 0) * (1 + bill.taxRate / 100 + bill.tipPercentage / 100)).toFixed(2)}
            </Text>
          </View>
        </ClayCard>

        <Text style={styles.sectionTitle}>Rounding Options</Text>
        <View style={styles.roundingContainer}>
          {(['none', 'up', 'down', 'nearest'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.roundingButton, roundingMode === mode && styles.roundingButtonActive]}
              onPress={() => updateRounding(mode)}
            >
              <Text style={[styles.roundingText, roundingMode === mode && styles.roundingTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Individual Totals</Text>
        {totals.map((total, index) => (
          <Animated.View key={total.dinerId} entering={FadeInUp.delay(index * 100)}>
            <ClayCard>
              <View style={styles.dinerHeader}>
                <View style={[styles.dinerAvatar, { backgroundColor: total.color }]}>
                  <Text style={styles.dinerInitial}>{total.name[0]}</Text>
                </View>
                <View style={styles.dinerInfo}>
                  <Text style={styles.dinerName}>{total.name}</Text>
                  <Text style={styles.dinerItems}>{total.items.length} items</Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.finalAmount}>${total.roundedTotal.toFixed(2)}</Text>
                  {roundingMode !== 'none' && total.roundedTotal !== total.total && (
                    <Text style={styles.originalAmount}>${total.total.toFixed(2)}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Subtotal</Text>
                  <Text style={styles.breakdownValue}>${total.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Tax</Text>
                  <Text style={styles.breakdownValue}>${total.taxAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Tip</Text>
                  <Text style={styles.breakdownValue}>${total.tipAmount.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.qrContainer}>
                <QRCode
                  value={`upi://pay?pa=example@upi&pn=${total.name}&am=${total.roundedTotal.toFixed(2)}`}
                  size={120}
                  color={Colors.text}
                  backgroundColor={Colors.white}
                />
                <Text style={styles.qrLabel}>Scan to pay ${total.roundedTotal.toFixed(2)}</Text>
              </View>
            </ClayCard>
          </Animated.View>
        ))}

        <TouchableOpacity style={styles.completeButton} onPress={completeBill}>
          <Text style={styles.completeButtonText}>Mark as Completed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalsCard: {
    marginBottom: Layout.spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  overviewLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  overviewValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.background.start,
    paddingTop: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accentDark,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  roundingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
  },
  roundingButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roundingButtonActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.background.start,
  },
  roundingText: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  roundingTextActive: {
    color: Colors.accentDark,
  },
  dinerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  dinerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dinerInitial: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dinerInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  dinerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  dinerItems: {
    fontSize: 14,
    color: Colors.textLight,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  finalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accentDark,
  },
  originalAmount: {
    fontSize: 14,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  breakdown: {
    backgroundColor: Colors.background.start,
    borderRadius: 12,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background.start,
  },
  qrLabel: {
    marginTop: Layout.spacing.sm,
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: Colors.success,
    padding: Layout.spacing.lg,
    borderRadius: Layout.buttonRadius,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: 40,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
