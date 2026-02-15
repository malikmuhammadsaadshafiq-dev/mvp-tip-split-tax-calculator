import { Bill, Item, Diner } from '../types';

export const createDemoBill = (): Bill => {
  const diners: Diner[] = [
    { id: 'd1', name: 'Alex', avatarColor: '#f472b6' },
    { id: 'd2', name: 'Jordan', avatarColor: '#60a5fa' },
    { id: 'd3', name: 'Casey', avatarColor: '#a78bfa' },
    { id: 'd4', name: 'Taylor', avatarColor: '#34d399' },
  ];

  const items: Item[] = [
    { id: 'i1', name: 'Truffle Burger', price: 18.99, assignedTo: 'd1' },
    { id: 'i2', name: 'Caesar Salad', price: 12.50, assignedTo: 'd2' },
    { id: 'i3', name: 'Margherita Pizza', price: 16.99, assignedTo: 'd3' },
    { id: 'i4', name: 'Chicken Wings (6pc)', price: 14.00, assignedTo: 'd1' },
    { id: 'i5', name: 'Sweet Potato Fries', price: 6.50, assignedTo: 'd4' },
    { id: 'i6', name: 'Craft Beer', price: 8.00, assignedTo: 'd1' },
    { id: 'i7', name: 'House Wine', price: 10.00, assignedTo: 'd2' },
    { id: 'i8', name: 'Tiramisu', price: 9.00, assignedTo: 'd3' },
    { id: 'i9', name: 'Cheesecake', price: 8.50, assignedTo: 'd4' },
    { id: 'i10', name: 'Iced Tea', price: 4.50, assignedTo: 'd2' },
    { id: 'i11', name: 'Garlic Bread', price: 5.99, assignedTo: null },
    { id: 'i12', name: 'Chocolate Lava Cake', price: 11.00, assignedTo: 'd1' },
  ];

  return {
    id: 'demo-bill-001',
    name: 'Dinner at Bistro Central',
    date: new Date().toISOString(),
    items,
    diners,
    taxRate: 0.0875,
    tipRate: 0.20,
    status: 'active',
  };
};