import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { APP_BASE_URL } from "@/utils/api";
import AppWebView from '@/components/AppWebView';

const EMERGENCY_URL = `${APP_BASE_URL}/auth/plan-emergency?forceMode=mobile`;

export default function EmergencyContactScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Accesso Contatto di Emergenza',
          headerShown: true,
          headerBackTitle: 'Indietro',
        }}
      />
      <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
        <AppWebView uri={EMERGENCY_URL} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeContainer: { flex: 1 },
});
