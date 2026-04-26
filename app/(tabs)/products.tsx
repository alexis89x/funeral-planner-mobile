import React, { useRef } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { APP_BASE_URL } from "@/utils/api";

export default function ProductsScreen() {
  const webViewRef = useRef<WebView>(null);

  return (
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: `${APP_BASE_URL}/products` }}
        style={styles.webview}
        startInLoadingState={false}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={BaseColors.main}
            style={styles.loading}
          />
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
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
