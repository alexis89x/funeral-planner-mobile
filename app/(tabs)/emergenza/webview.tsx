import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { APP_BASE_URL } from '@/utils/api';
import AppWebView from '@/components/AppWebView';

export default function EmergenzaWebViewScreen() {
  const params = useLocalSearchParams<{ url: string; title?: string }>();

  const url = params.url || APP_BASE_URL;
  const title = params.title || 'Emergenza';

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title, headerBackTitle: 'Indietro' }} />
      <AppWebView uri={url} />
    </ThemedView>
  );
}