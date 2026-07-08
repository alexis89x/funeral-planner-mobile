import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { isWebviewCacheStale, markWebviewLoaded } from '@/utils/webview.utils';
import AppWebView from '@/components/AppWebView';
import { THEMES, ACTIVE_THEME } from '@/constants/theme';

export default function WebViewScreen() {
  const params = useLocalSearchParams<{ url: string; title?: string; injectToken?: string }>();
  const { reloadProfile } = useAuth();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);

  const rawUrl = params.url || '';
  const title = params.title || 'WebView';
  const shouldInjectToken = params.injectToken === 'true';

  useEffect(() => {
    if (!rawUrl) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title, headerShown: true }} />
      <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
        <AppWebView
          uri={effectiveUrl}
          injectToken={shouldInjectToken}
          onLoadEnd={() => markWebviewLoaded(rawUrl)}
          onRefreshUser={async () => {
            await reloadProfile();
            router.push(ACTIVE_THEME === 'archivio-sereno' ? '/(tabs)/services' : '/(tabs)/my-plans');
          }}
          onData={(data) => console.log('Dati ricevuti:', data)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeContainer: { flex: 1 },
});
