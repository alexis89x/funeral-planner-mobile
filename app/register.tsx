import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Registrazione',
          headerShown: true,
        }}
      />
      <WebView
        source={{ uri: 'https://app.tramontosereno.it/registration?forceMode=mobile' }}
        style={styles.webview}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
