import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { handleWebViewMessage } from '@/utils/webview-message-handler';
import { isWebviewCacheStale, markWebviewLoaded } from "@/utils/webview.utils";

export default function MyPlanScreen() {
  const webViewRef = useRef<WebView>(null);
  const { token } = useAuth();
  const router = useRouter();
  const { type, action, forceReload, planId } = useLocalSearchParams<{ type?: string; action?: string; forceReload?: string; planId?: string }>();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);
  const loadedPlanIdRef = useRef<string | undefined>(undefined);

  const getHomepagePath = () => {
    if (type === 'pet') return '/plan/pet_homepage';
    return '/plan/plan_homepage';
  };

  const actionParam = action ? `&action=${action}` : '';
  const rawUrl = `${APP_BASE_URL}${getHomepagePath()}?standalone=true&forceMode=mobile${actionParam}`;

  useEffect(() => {
    if (forceReload) {
      loadedPlanIdRef.current = planId;
      setEffectiveUrl(`${rawUrl}&_t=${forceReload}`);
      return;
    }

    if (planId && planId === loadedPlanIdRef.current) return;
    loadedPlanIdRef.current = planId;

    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}&_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl, forceReload, planId]);

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any)
    });
  };

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
      {effectiveUrl ? (
        <WebView
          ref={webViewRef}
          key={effectiveUrl}
          source={{ uri: effectiveUrl }}
          style={styles.webview}
          onMessage={handleMessage}
          onLoadEnd={() => markWebviewLoaded(rawUrl)}
          startInLoadingState={false}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          cacheEnabled={true}
          sharedCookiesEnabled={true}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});