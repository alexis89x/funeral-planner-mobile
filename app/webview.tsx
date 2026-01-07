import React, { useRef } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{ url: string; title?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const url = params.url || '';
  const title = params.title || 'WebView';

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Messaggio ricevuto dalla webview:', message);

      // Gestisci diversi tipi di messaggi
      switch (message.type) {
        case 'navigation':
          // Naviga ad un'altra schermata dell'app
          if (message.route) {
            router.push(message.route);
          }
          break;

        case 'close':
          // Chiudi la webview e torna indietro
          router.back();
          break;

        case 'data':
          // Gestisci dati ricevuti dalla webview
          console.log('Dati ricevuti:', message.data);
          break;

        default:
          console.log('Tipo di messaggio non gestito:', message.type);
      }
    } catch (error) {
      console.error('Errore nel parsing del messaggio dalla webview:', error);
    }
  };

  const sendMessageToWebView = (message: any) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

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
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState={true}
          onMessage={handleMessage}
          javaScriptEnabled={true}
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
