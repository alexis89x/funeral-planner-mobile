import React, { useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

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

  const url = params.url || '';
  const title = params.title || 'Servizio';

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Messaggio ricevuto dalla webview:', message);

      switch (message.type) {
        case 'navigation':
          if (message.route) {
            router.push(message.route);
          }
          break;

        case 'close':
          router.back();
          break;

        case 'data':
          console.log('Dati ricevuti:', message.data);
          break;

        default:
          console.log('Tipo di messaggio non gestito:', message.type);
      }
    } catch (error) {
      console.error('Errore nel parsing del messaggio dalla webview:', error);
    }
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
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState={true}
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
