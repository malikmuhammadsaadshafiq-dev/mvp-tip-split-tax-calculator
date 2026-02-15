import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { RootStackParamList } from '../navigation';
import { Bill, Diner } from '../types';
import { getBillById } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export default function PaymentScreen({ route }: Props) {
  const { billId, dinerId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [diner, setDiner] = useState<Diner | null>(null);
  const [loading, setLoading] = useState(true);
  const [roundUp, setRoundUp] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const billData = await getBillById(billId);
    if (billData) {
      setBill(billData);
      const dinerData = billData.diners.find(d => d.id === dinerId);
      if (dinerData) setDiner(dinerData);
    }
    setLoading(false);
  };

  const calculateAmount = () => {
    if (!bill || !diner) return 0;
    const items = bill.items.filter(i => i.assignedTo === dinerId);
    const subtotal = items.reduce((sum, i) => sum + i.price, 0);
    const tax = subtotal * (bill.taxRate / 100);
    const tip = subtotal * (bill.tipRate / 100);
    const total = subtotal + tax + tip;
    return roundUp ? Math.ceil(total) : total;
  };

  const generatePaymentURL = () => {
    const amount = calculateAmount();
    return `https://payment.example.com/pay?amount=${amount.toFixed(2)}&recipient=${encodeURIComponent(diner?.name || '')}`;
  };

  const copyToClipboard = () => {
    Alert.alert('Copied!', `Amount $${calculateAmount().toFixed(2)} copied to clipboard`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!bill || !diner) {
    return (
      <View style={styles.centered}>
        <Text>Data not found</Text>
      </View>
    );
  }

  const amount = calculateAmount();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: diner.color }]}>
          <Text style={styles.avatarText}>{diner.name[0]}</Text>
        </View>
        <Text style={styles.dinerName}>{diner.name}</Text>
        <Text style={styles.restaurantName}>{bill.restaurantName}</Text>
      </Animated.View>

      <Animated.View entering={BounceIn.delay(200)} style={styles.amountCard}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        {roundUp && (
          <Text style={styles.roundUpText}>
            (Rounded up)
          </Text>
        )}
      </Animated.View>

      <View style={styles.optionsCard}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setRoundUp(!roundUp)}
        >
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Round Up</Text>
            <Text style={styles.optionDesc}>Round to nearest dollar</Text>
          </View>
          <View style={[styles.toggle, roundUp && styles.toggleActive]}>
            <View style={[styles.toggleDot, roundUp && styles.toggleDotActive]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Scan to Pay</Text>
        <View style={styles.qrContainer}>
          <QRCode
            value={generatePaymentURL()}
            size={200}
            color="#1f2937"
            backgroundColor="white"
          />
        </View>
        <Text style={styles.qrHint}>Show this code to {diner.name}</Text>
      </View>

      <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.8}>
        <LinearGradient
          colors={['#f59e0b', '#e11d48']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareButton}
        >
          <Ionicons name="copy-outline" size={20} color="white" />
          <Text style={styles.shareButtonText}>Copy Payment Link</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
        {bill.items
          .filter(i => i.assignedTo === dinerId)
          .map((item, idx) => (
            <View key={idx} style={styles.breakdownRow}>
              <Text style={styles.breakdownItem}>{item.name}</Text>
              <Text style={styles.breakdownPrice}>${item.price.toFixed(2)}</Text>
            </View>
          ))}
        <View style={styles.divider} />
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tax ({bill.taxRate}%)</Text>
          <Text style={styles.breakdownValue}>
            ${(bill.items.filter(i => i.assignedTo === dinerId).reduce((s, i) => s + i.price, 0) * (bill.taxRate / 100)).toFixed(2)}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tip ({bill.tipRate}%)</Text>
          <Text style={styles.breakdownValue}>
            ${(bill.items.filter(i => i.assignedTo === dinerId).reduce((s, i) => s + i.price, 0) * (bill.tipRate / 100)).toFixed(2)}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  dinerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  restaurantName: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#f59e0b',
  },
  roundUpText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  optionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleDotActive: {
    marginLeft: 20,
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownItem: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  breakdownPrice: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffedd5',
    marginVertical: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
});