import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { isWebviewCacheStale, markWebviewLoaded } from '@/utils/webview.utils';
import AppWebView from '@/components/AppWebView';

export default function ServiceWebViewScreen() {
  const params = useLocalSearchParams<{ url: string; title?: string }>();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);

  const rawUrl = params.url || '';
  const title = params.title || 'Servizio';

  useEffect(() => {
    if (!rawUrl) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title, headerBackTitle: 'Indietro' }} />
      <AppWebView
        uri={effectiveUrl}
        injectToken
        onLoadEnd={() => markWebviewLoaded(rawUrl)}
      />
    </ThemedView>
  );
}