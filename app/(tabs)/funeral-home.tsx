import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";

export default function FuneralHomeScreen() {
  const { token } = useAuth();
  const [webViewKey, setWebViewKey] = useState(0);

  // Reinizializza la WebView ogni volta che torni su questo schermo
  useFocusEffect(
    React.useCallback(() => {
      setWebViewKey(prev => prev + 1);
    }, [])
  );

  const url = `${APP_BASE_URL}/auth/set-token?token=${btoa(token || '')}&path=${encodeURIComponent('/user/main-partner')}&forceMode=mobile`;

  return (
    <ThemedView style={styles.container}>
      <WebView
        key={webViewKey}
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
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
});
