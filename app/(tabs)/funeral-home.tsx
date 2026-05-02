import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const webViewRef = useRef<WebView>(null);

  const partnerReferralId = userProfile?.user?.id_partner_referral;
  const rawUrl = `${APP_BASE_URL}/user/main-partner?forceMode=mobile`;

  // Runs once on mount. To re-run on every tab focus instead, replace useEffect with:
  // useFocusEffect(useCallback(() => { ... }, [])) from 'expo-router'
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('[FuneralHome] coords:', { lat, lng });
        setCoords({ lat, lng });
      } catch (e) {
        console.warn('[FuneralHome] location unavailable:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (partnerReferralId) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      const base = stale ? `${rawUrl}&_t=${Date.now()}` : rawUrl;
      const url = coords ? `${base}&lat=${coords.lat}&lng=${coords.lng}` : base;
      setEffectiveUrl(url);
    });
  }, [partnerReferralId, rawUrl, coords]);

  const injectedJavaScript = `
    (function() {
      const user = {
        token: "${token}",
        role: 150,
        status: 310
      };
      localStorage.setItem('uinfo', JSON.stringify(user));
      ${coords ? `localStorage.setItem('userLocation', JSON.stringify({ lat: ${coords.lat}, lng: ${coords.lng} }));` : ''}
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
          ref={webViewRef}
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