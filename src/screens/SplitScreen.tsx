import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Bill, Diner } from '../types';
import { Storage } from '../utils/storage';
import { MeshGradient } from '../components/MeshGradient';
import { GlassCard } from '../components/GlassCard';
import { Toast } from '../components/Toast';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Split'>;

interface SplitResult {
  diner: Diner;
  itemsTotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
  roundedTotal: number;
}

export const SplitScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { billId } = route.params;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [roundUp, setRoundUp] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as const });
  const [selectedDiner, setSelectedDiner] = useState<string | null>(null);

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    const bills = await Storage.getBills();
    const found = bills.find((b) => b.id === billId);
    if (found) {
      setBill(found);
    }
    setLoading(false);
  };

  const calculateSplits = (): SplitResult[] => {
    if (!bill) return [];
    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const totalTax = subtotal * bill.taxRate;
    const totalTip = subtotal * bill.tipRate;
    
    return bill.diners.map((diner) => {
      const dinerItems = bill.items.filter((item) => item.assignedTo === diner.id);
      const itemsTotal = dinerItems.reduce((sum, item) => sum + item.price, 0);
      const proportion = subtotal > 0 ? itemsTotal / subtotal : 1 / bill.diners.length;
      const taxShare = totalTax * proportion;
      const tipShare = totalTip * proportion;
      const total = itemsTotal + taxShare + tipShare;
      const roundedTotal = roundUp ? Math.ceil(total) : total;
      
      return {
        diner,
        itemsTotal,
        taxShare,
        tipShare,
        total,
        roundedTotal,
      };
    });
  };

  const showToast = (message: string) => {
    setToast({ visible: true, message, type: 'success' });
  };

  const sharePayment = async (result: SplitResult) => {
    const message = `Hey ${result.diner.name}, you owe $${result.roundedTotal.toFixed(2)} for ${bill?.name}`;
    try {
      await Share.share({ message });
      showToast('Payment request shared');
    } catch (error) {
      showToast('Failed to share');
    }
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

  const splits = calculateSplits();
  const grandTotal = splits.reduce((sum, s) => sum + s.roundedTotal, 0);

  return (
    <MeshGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{bill.name}</Text>
        <Text style={styles.subtitle}>Split Summary</Text>

        <GlassCard style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Round up amounts</Text>
            <TouchableOpacity
              onPress={() => setRoundUp(!roundUp)}
              style={[styles.toggleButton, roundUp && styles.toggleActive]}
            >
              <View style={[styles.toggleCircle, roundUp && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {splits.map((result) => (
          <GlassCard key={result.diner.id} style={styles.splitCard}>
            <View style={styles.splitHeader}>
              <View style={styles.dinerInfo}>
                <View style={[styles.avatar, { backgroundColor: result.diner.avatarColor }]}>
                  <Text style={styles.avatarText}>{result.diner.name[0]}</Text>
                </View>
                <Text style={styles.dinerName}>{result.diner.name}</Text>
              </View>
              <Text style={styles.amount}>${result.roundedTotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.breakdown}>
              <Text style={styles.breakdownText}>Items: ${result.itemsTotal.toFixed(2)}</Text>
              <Text style={styles.breakdownText}>Tax: ${result.taxShare.toFixed(2)}</Text>
              <Text style={styles.breakdownText}>Tip: ${result.tipShare.toFixed(2)}</Text>
            </View>

            {selectedDiner === result.diner.id ? (
              <View style={styles.qrContainer}>
                <QRCode
                  value={`upi://pay?pn=${result.diner.name}&am=${result.roundedTotal.toFixed(2)}`}
                  size={200}
                  backgroundColor="transparent"
                  color={Colors.text}
                />
                <TouchableOpacity onPress={() => setSelectedDiner(null)} style={styles.closeQr}>
                  <Text style={styles.closeQrText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setSelectedDiner(result.diner.id)}
                >
                  <Ionicons name="qr-code" size={20} color={Colors.accent} />
                  <Text style={styles.actionText}>Show QR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => sharePayment(result)}
                >
                  <Ionicons name="share-outline" size={20} color={Colors.accent} />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        ))}

        <GlassCard style={styles.grandTotalCard}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalAmount}>${grandTotal.toFixed(2)}</Text>
        </GlassCard>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Home')}
        >
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.doneGradient}>
            <Text style={styles.doneButtonText}>Done</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  toggleCard: {
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    color: Colors.text,
    fontSize: 16,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.accent,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    marginLeft: 22,
  },
  splitCard: {
    marginBottom: Spacing.md,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dinerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  dinerName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  amount: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  breakdownText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  actionText: {
    color: Colors.accent,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  closeQr: {
    marginTop: Spacing.md,
  },
  closeQrText: {
    color: Colors.textSecondary,
  },
  grandTotalCard: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  grandTotalLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  grandTotalAmount: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '700',
  },
  doneButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  doneGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});