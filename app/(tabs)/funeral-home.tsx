import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { handleWebViewMessage } from '@/utils/webview-message-handler';
import { PartnerDetail } from '@/components/PartnerDetail';
import { isWebviewCacheStale, markWebviewLoaded } from "@/utils/webview.utils";

export default function FuneralHomeScreen() {
  const { token, userProfile } = useAuth();
  const router = useRouter();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);

  const partnerReferralId = userProfile?.user?.id_partner_referral;
  const rawUrl = `${APP_BASE_URL}/user/main-partner?forceMode=mobile`;

  useEffect(() => {
    if (partnerReferralId) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}&_t=${Date.now()}` : rawUrl);
    });
  }, [partnerReferralId, rawUrl]);

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

  if (partnerReferralId) {
    return <PartnerDetail partnerId={partnerReferralId} showBackButton={false} showPurchaseButton={false} />;
  }

  return (
    <ThemedView style={styles.container}>
      {effectiveUrl ? (
        <WebView
          source={{ uri: effectiveUrl }}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          style={styles.webview}
          startInLoadingState={false}
          onMessage={handleMessage}
          onLoadEnd={() => markWebviewLoaded(rawUrl)}
          javaScriptEnabled={true}
          cacheEnabled={true}
          sharedCookiesEnabled={true}
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
});