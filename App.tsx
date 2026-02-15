import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDemoData } from './src/utils/storage';

export default function App() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <LinearGradient
          colors={['#dbeafe', '#eef2ff', '#f3e8ff']}
          style={styles.gradient}
        >
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </LinearGradient>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});