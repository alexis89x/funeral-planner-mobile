import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { APP_BASE_URL } from '@/utils/api';
import { isWebviewCacheStale, markWebviewLoaded } from '@/utils/webview.utils';
import AppWebView from '@/components/AppWebView';
import { useAuth } from '@/contexts/AuthContext';

export default function MyPlanScreen() {
  const { type, action, forceReload, planId } = useLocalSearchParams<{ type?: string; action?: string; forceReload?: string; planId?: string }>();
  const { reloadProfile } = useAuth();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);
  const loadedPlanIdRef = useRef<string | undefined>(undefined);
  const [prevPlanId, setPrevPlanId] = useState<string | undefined>(planId);
  const [prevForceReload, setPrevForceReload] = useState<string | undefined>(undefined);

  if (planId !== prevPlanId) {
    setPrevPlanId(planId);
    setEffectiveUrl(null);
  }

  const getHomepagePath = () => {
    if (type === 'pet') return '/plan/pet_homepage';
    return '/plan/plan_homepage';
  };

  const actionParam = action ? `&action=${action}` : '';
  const rawUrl = `${APP_BASE_URL}${getHomepagePath()}?standalone=true&forceMode=mobile${actionParam}`;

  if (forceReload && forceReload !== prevForceReload) {
    setPrevForceReload(forceReload);
    setEffectiveUrl(`${rawUrl}&_t=${forceReload}`);
  }

  // Runs before the effect below (same commit, declared first): marks planId as
  // already loaded so the dedup check doesn't clobber the forced URL above with
  // an async cache-staleness reload.
  useEffect(() => {
    if (forceReload && forceReload === prevForceReload) {
      loadedPlanIdRef.current = planId;
    }
  }, [forceReload, prevForceReload, planId]);

  useEffect(() => {
    if (planId && planId === loadedPlanIdRef.current) return;
    loadedPlanIdRef.current = planId;

    setEffectiveUrl(null);
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}&_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl, planId]);

  return (
    <ThemedView style={styles.container}>
      <AppWebView
        uri={effectiveUrl}
        injectToken
        onLoadEnd={() => markWebviewLoaded(rawUrl)}
        onRefreshUser={async () => {
          await reloadProfile();
          setEffectiveUrl(`${rawUrl}&_t=${Date.now()}`);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
