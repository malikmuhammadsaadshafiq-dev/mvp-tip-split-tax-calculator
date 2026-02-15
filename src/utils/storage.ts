import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, FoodItem, Diner } from '../types';
import { v4 as uuidv4 } from 'uuid';

const BILLS_KEY = '@bills';

export const initializeDemoData = async () => {
  try {
    const existing = await AsyncStorage.getItem(BILLS_KEY);
    if (!existing) {
      const demoBill: Bill = {
        id: uuidv4(),
        restaurantName: "Bistro Central",
        date: new Date().toISOString(),
        taxRate: 8.5,
        tipPercentage: 18,
        status: 'active',
        diners: [
          { id: 'd1', name: 'Alice', color: '#818cf8' },
          { id: 'd2', name: 'Bob', color: '#f472b6' },
          { id: 'd3', name: 'Charlie', color: '#34d399' },
        ],
        items: [
          { id: uuidv4(), name: 'Grilled Salmon', price: 24.99, assignedTo: ['d1'], splitType: 'equal' },
          { id: uuidv4(), name: 'Truffle Fries', price: 8.50, assignedTo: ['d1', 'd2', 'd3'], splitType: 'equal' },
          { id: uuidv4(), name: 'Caesar Salad', price: 12.00, assignedTo: ['d2'], splitType: 'equal' },
          { id: uuidv4(), name: 'Margherita Pizza', price: 16.99, assignedTo: ['d2', 'd3'], splitType: 'equal' },
          { id: uuidv4(), name: 'Chicken Alfredo', price: 18.50, assignedTo: ['d3'], splitType: 'equal' },
          { id: uuidv4(), name: 'Glass of Wine', price: 9.00, assignedTo: ['d1'], splitType: 'equal' },
          { id: uuidv4(), name: 'Tiramisu', price: 7.50, assignedTo: ['d1', 'd2'], splitType: 'equal' },
          { id: uuidv4(), name: 'Iced Tea', price: 3.50, assignedTo: ['d3'], splitType: 'equal' },
          { id: uuidv4(), name: 'Garlic Bread', price: 5.99, assignedTo: ['d1', 'd2', 'd3'], splitType: 'equal' },
          { id: uuidv4(), name: 'Chocolate Cake', price: 8.00, assignedTo: ['d2'], splitType: 'equal' },
          { id: uuidv4(), name: 'Espresso', price: 4.50, assignedTo: ['d1'], splitType: 'equal' },
          { id: uuidv4(), name: 'Bruschetta', price: 6.99, assignedTo: ['d1', 'd3'], splitType: 'equal' },
        ]
      };
      await AsyncStorage.setItem(BILLS_KEY, JSON.stringify([demoBill]));
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};

export const getBills = async (): Promise<Bill[]> => {
  try {
    const json = await AsyncStorage.getItem(BILLS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error getting bills:', error);
    return [];
  }
};

export const saveBill = async (bill: Bill): Promise<void> => {
  try {
    const bills = await getBills();
    const index = bills.findIndex(b => b.id === bill.id);
    if (index >= 0) {
      bills[index] = bill;
    } else {
      bills.push(bill);
    }
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  } catch (error) {
    console.error('Error saving bill:', error);
    throw error;
  }
};

export const deleteBill = async (billId: string): Promise<void> => {
  try {
    const bills = await getBills();
    const filtered = bills.filter(b => b.id !== billId);
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
};

export const getBillById = async (id: string): Promise<Bill | null> => {
  try {
    const bills = await getBills();
    return bills.find(b => b.id === id) || null;
  } catch (error) {
    console.error('Error getting bill:', error);
    return null;
  }
};
