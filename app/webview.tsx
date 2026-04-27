import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { handleWebViewMessage } from '@/utils/webview-message-handler';
import { isWebviewCacheStale, markWebviewLoaded } from '@/utils/webview.utils';

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{ url: string; title?: string; injectToken?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token, reloadProfile } = useAuth();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);

  const rawUrl = params.url || '';
  const title = params.title || 'WebView';
  const shouldInjectToken = params.injectToken === 'true';

  // Decide se aggiungere il timestamp per busting della cache HTTP
  useEffect(() => {
    if (!rawUrl) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl]);

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any),
      onRefreshUser: async () => {
        await reloadProfile();
        router.push('/(tabs)/my-plans');
      },
      onData: (data: any) => {
        console.log('Dati ricevuti:', data);
      },
    });
  };

  const handleLoadEnd = () => {
    if (rawUrl) markWebviewLoaded(rawUrl);
  };

  const injectedJavaScript = shouldInjectToken
    ? `
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
  `
    : `
    (function() {
      window.tsMobileApp = true;
      true; // Required for iOS
    })();
  `;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title,
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
        {effectiveUrl ? (
          <WebView
          ref={webViewRef}
          source={{ uri: effectiveUrl }}
          style={styles.webview}
          startInLoadingState={false}
          onMessage={handleMessage}
          onLoadEnd={handleLoadEnd}
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
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
