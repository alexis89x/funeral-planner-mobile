import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";
import { PartnerDetail } from '@/components/PartnerDetail';
import { isWebviewCacheStale, markWebviewLoaded } from "@/utils/webview.utils";
import AppWebView from '@/components/AppWebView';

export default function FuneralHomeScreen() {
  const { userProfile } = useAuth();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

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

  const coordsInjection = coords
    ? `localStorage.setItem('userLocation', JSON.stringify({ lat: ${coords.lat}, lng: ${coords.lng} }));`
    : undefined;

  if (partnerReferralId) {
    return <PartnerDetail partnerId={partnerReferralId} showBackButton={false} showPurchaseButton={false} />;
  }

  return (
    <ThemedView style={styles.container}>
      <AppWebView
        uri={effectiveUrl}
        injectToken
        injectedJavaScript={coordsInjection}
        onLoadEnd={() => markWebviewLoaded(rawUrl)}
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