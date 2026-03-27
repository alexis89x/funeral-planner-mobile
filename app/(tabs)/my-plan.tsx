import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { handleWebViewMessage } from '@/utils/webview-message-handler';
import { skipCacheInWebview } from "@/utils/webview.utils";

export default function MyPlanScreen() {
  const webViewRef = useRef<WebView>(null);
  const { token } = useAuth();
  const router = useRouter();
  const { type, action } = useLocalSearchParams<{ type?: string; action?: string }>();
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
  const timestamp = skipCacheInWebview() ? `&_t=${Date.now()}` : '';

  // Determine homepage based on plan type
  const getHomepagePath = () => {
    if (type === 'pet') {
      return '/plan/pet_homepage';
    }
    return '/plan/plan_homepage';
  };

  const actionParam = action ? `&action=${action}` : '';
  const baseUrl = `${APP_BASE_URL}${getHomepagePath()}?standalone=true&forceMode=mobile${actionParam}`;
  const url = baseUrl + (baseUrl.includes('?') ? `${timestamp}` : `?_t=${timestamp.slice(1)}`);

  const injectedJavaScript = `
    (function() {
      const user = {
        token: "${token}",
        role: 150,
        status: 310
      };
      localStorage.setItem('uinfo', JSON.stringify(user));
      window.tsMobileApp = true;
      true; // Required for iOS
    })();
  `;

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
        onMessage={handleMessage}
        startInLoadingState={false}
        javaScriptEnabled={true}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        cacheEnabled={!skipCacheInWebview()}
        incognito={__DEV__}
        {...(skipCacheInWebview() && { cacheMode: "LOAD_NO_CACHE" })}
        // Camera/media permissions for iOS
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={BaseColors.main}
            style={styles.loading}
          />
        )}
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
