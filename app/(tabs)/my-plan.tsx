import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { handleWebViewMessage } from '@/utils/webview-message-handler';

export default function MyPlanScreen() {
  const webViewRef = useRef<WebView>(null);
  const { token } = useAuth();
  const router = useRouter();
  const [webViewKey, setWebViewKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setWebViewKey(prev => prev + 1);
    }, [])
  );

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any)
    });
  };

  // Add cache-busting timestamp in dev mode
  const timestamp = __DEV__ ? `&_t=${Date.now()}` : '';
  const url = `${APP_BASE_URL}/auth/set-token?token=${btoa(token || '')}&path=${encodeURIComponent('/user/plans')}&forceMode=mobile${timestamp}`;

  return (
    <ThemedView style={styles.container}>
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
        startInLoadingState={false}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={BaseColors.main}
            style={styles.loading}
          />
        )}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="always"
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
