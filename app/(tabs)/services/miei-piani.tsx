import React, { useRef } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';

export default function MieiPianiScreen() {
  const webViewRef = useRef<WebView>(null);

  return (
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.tramontosereno.it' }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={BaseColors.main}
            style={styles.loading}
          />
        )}
        // Abilita JavaScript
        javaScriptEnabled={true}
        // Abilita DOM storage per login
        domStorageEnabled={true}
        // Abilita third party cookies
        thirdPartyCookiesEnabled={true}
        // Abilita mixed content (http + https)
        mixedContentMode="always"
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});