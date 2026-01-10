import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";

export default function FuneralHomeScreen() {
  const { token, userProfile } = useAuth();
  const [webViewKey, setWebViewKey] = useState(0);
  const router = useRouter();

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

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.action === 'goBack') {
        router.back();
      }
    } catch (error) {
      console.error('Error parsing message from webview:', error);
    }
  };

  const url = `${APP_BASE_URL}/user/main-partner?forceMode=mobile`;

  return (
    <ThemedView style={styles.container}>
      <WebView
        key={webViewKey}
        source={{ uri: url }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        style={styles.webview}
        startInLoadingState={true}
        onMessage={handleMessage}
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
