import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CreateBillScreen from '../screens/CreateBillScreen';
import SplitBillScreen from '../screens/SplitBillScreen';
import PaymentScreen from '../screens/PaymentScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateBill: undefined;
  SplitBill: { billId: string };
  Payment: { billId: string; dinerId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff7ed',
        },
        headerTintColor: '#92400e',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: '#fff7ed',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'My Bills' }}
      />
      <Stack.Screen 
        name="CreateBill" 
        component={CreateBillScreen} 
        options={{ title: 'New Bill' }}
      />
      <Stack.Screen 
        name="SplitBill" 
        component={SplitBillScreen} 
        options={{ title: 'Split Bill' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen} 
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
}