import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { handleWebViewMessage } from '@/utils/webview-message-handler';
import { PartnerDetail } from '@/components/PartnerDetail';
import { skipCacheInWebview } from "@/utils/webview.utils";

export default function FuneralHomeScreen() {
  const { token, userProfile } = useAuth();
  const [webViewKey, setWebViewKey] = useState(0);
  const router = useRouter();

  // Check if user has a partner referral
  const partnerReferralId = userProfile?.user?.id_partner_referral;

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
      window.tsMobileApp = true;
      true; // Required for iOS
    })();
  `;

  const handleMessage = async (event: any) => {
    await handleWebViewMessage(event, {
      onGoBack: () => router.back(),
      onNavigate: (route: string) => router.push(route as any)
    });
  };

  // If user has a partner referral, show native partner detail
  if (partnerReferralId) {
    return <PartnerDetail partnerId={partnerReferralId} showBackButton={false} showPurchaseButton={false} />;
  }

  // Otherwise, show webview
  // Add cache-busting timestamp in dev mode
  const timestamp = skipCacheInWebview() ? `&_t=${Date.now()}` : '';
  const url = `${APP_BASE_URL}/user/main-partner?forceMode=mobile${timestamp}`;

  return (
    <ThemedView style={styles.container}>
      <WebView
        key={webViewKey}
        source={{
          uri: url,
          ...skipCacheInWebview() && {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        style={styles.webview}
        startInLoadingState={false}
        onMessage={handleMessage}
        cacheEnabled={!skipCacheInWebview()}
        incognito={__DEV__}
        {...(skipCacheInWebview() && { cacheMode: "LOAD_NO_CACHE" })}
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
