import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { handleWebViewMessage } from '@/utils/webview-message-handler';
import { isWebviewCacheStale, markWebviewLoaded } from "@/utils/webview.utils";

export default function ServiceWebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{ url: string; title?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);

  const rawUrl = params.url || '';
  const title = params.title || 'Servizio';

  useEffect(() => {
    if (!rawUrl) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl]);

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any)
    });
  };

  const injectedJavaScript = `
    (function() {
      const user = {
        token: "${token}",
        role: 150,
        status: 310
      };
      localStorage.setItem('uinfo', JSON.stringify(user));
      window.tsMobileApp = true;
      true; // Required for iOS
    })();
  `;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: title,
          headerBackTitle: 'Indietro',
        }}
      />
      {effectiveUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: effectiveUrl }}
          style={styles.webview}
          onMessage={handleMessage}
          onLoadEnd={() => markWebviewLoaded(rawUrl)}
          startInLoadingState={false}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          cacheEnabled={true}
          sharedCookiesEnabled={true}
          // Camera/media permissions for iOS
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grant"
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          )}
        />
      ) : null}
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
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});