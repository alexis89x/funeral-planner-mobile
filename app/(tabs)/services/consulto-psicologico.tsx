import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";

export default function ConsultoPsicologicoScreen() {
  const { token } = useAuth();
  const [webViewKey, setWebViewKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setWebViewKey(prev => prev + 1);
    }, [])
  );

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

  const url = `${APP_BASE_URL}/user/grief?forceMode=mobile`;

  return (
    <ThemedView style={styles.container}>
      <WebView
        key={webViewKey}
        source={{ uri: url }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
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
