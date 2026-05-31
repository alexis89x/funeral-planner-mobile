import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { APP_BASE_URL } from '@/utils/api';
import { isWebviewCacheStale, markWebviewLoaded } from '@/utils/webview.utils';
import AppWebView from '@/components/AppWebView';

const RAW_URL = `${APP_BASE_URL}/user/main-partner?forceMode=mobile`;

export default function CercaOnoranzeScreen() {
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      } catch (e) {
        console.warn('[CercaOnoranze] location unavailable:', e);
      }
    })();
  }, []);

  useEffect(() => {
    isWebviewCacheStale(RAW_URL).then(stale => {
      const base = stale ? `${RAW_URL}&_t=${Date.now()}` : RAW_URL;
      const url = coords ? `${base}&lat=${coords.lat}&lng=${coords.lng}` : base;
      setEffectiveUrl(url);
    });
  }, [coords]);

  const coordsInjection = coords
    ? `localStorage.setItem('userLocation', JSON.stringify({ lat: ${coords.lat}, lng: ${coords.lng} }));`
    : undefined;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
        <AppWebView
          uri={effectiveUrl}
          injectToken
          injectedJavaScript={coordsInjection}
          onLoadEnd={() => markWebviewLoaded(RAW_URL)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeContainer: { flex: 1 },
});