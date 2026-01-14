import React, { useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Stack, useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { handleWebViewMessage } from '@/utils/webview-message-handler';

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{ url: string; title?: string; injectToken?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();
  const [webViewKey, setWebViewKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setWebViewKey(prev => prev + 1);
    }, [])
  );

  const url = params.url || '';
  const title = params.title || 'WebView';
  const shouldInjectToken = params.injectToken === 'true';

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any),
      onData: (data: any) => {
        console.log('Dati ricevuti:', data);
      },
    });
  };

  const sendMessageToWebView = (message: any) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
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
      true; // Required for iOS
    })();
  `
    : undefined;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title,
          headerShown: true,
        }}
      />
      {url ? (
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState={false}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
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
