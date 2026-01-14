import React, { useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { downloadPDF, downloadPDFFromURL } from '@/utils/pdf-downloader';

export default function ServiceWebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{ url: string; title?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();
  const [webViewKey, setWebViewKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setWebViewKey(prev => prev + 1);
    }, [])
  );

  // Add cache-busting timestamp in dev mode
  const timestamp = __DEV__ ? `&_t=${Date.now()}` : '';
  const baseUrl = params.url || '';
  const url = baseUrl ? (baseUrl.includes('?') ? `${baseUrl}${timestamp}` : `${baseUrl}?_t=${timestamp.slice(1)}`) : '';
  const title = params.title || 'Servizio';

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any),
      onData: (data: any) => {
        console.log('Dati ricevuti:', data);
      },
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
      {url ? (
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{
            uri: url,
            ...__DEV__ && {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          cacheEnabled={!__DEV__}
          incognito={__DEV__}
          {...(__DEV__ && { cacheMode: "LOAD_NO_CACHE" })}
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
