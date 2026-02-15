export interface FoodItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
  splitType: 'equal' | 'percentage' | 'custom';
  customAmounts?: Record<string, number>;
}

export interface Diner {
  id: string;
  name: string;
  color: string;
}

export interface Bill {
  id: string;
  restaurantName: string;
  date: string;
  items: FoodItem[];
  diners: Diner[];
  taxRate: number;
  tipPercentage: number;
  status: 'active' | 'completed';
}

export interface DinerTotal {
  dinerId: string;
  name: string;
  color: string;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  roundedTotal: number;
  items: FoodItem[];
}

export type RootStackParamList = {
  Home: undefined;
  BillDetail: { billId: string };
  Summary: { billId: string };
};
