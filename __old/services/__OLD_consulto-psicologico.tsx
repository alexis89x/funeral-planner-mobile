import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { handleWebViewMessage } from '@/utils/webview-message-handler';

export default function ConsultoPsicologicoScreen() {
  const { token } = useAuth();
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

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any)
    });
  };

  // Add cache-busting timestamp in dev mode
  const timestamp = __DEV__ ? `&_t=${Date.now()}` : '';
  const url = `${APP_BASE_URL}/user/grief?forceMode=mobile${timestamp}`;

  return (
    <ThemedView style={styles.container}>
      <WebView
        key={webViewKey}
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
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        style={styles.webview}
        startInLoadingState={true}
        onMessage={handleMessage}
        cacheEnabled={!__DEV__}
        incognito={__DEV__}
        {...(__DEV__ && { cacheMode: "LOAD_NO_CACHE" })}
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
