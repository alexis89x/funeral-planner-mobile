import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { isWebviewCacheStale, markWebviewLoaded } from '@/utils/webview.utils';
import AppWebView from '@/components/AppWebView';
import { PlanSwitcher } from '@/components/PlanSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { hasMultiplePlans } from '@/utils/plans';

export default function ServiceWebViewScreen() {
  const params = useLocalSearchParams<{ url: string; title?: string; showPlanSwitcher?: string }>();
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null);
  const { userProfile, reloadProfile } = useAuth();

  const rawUrl = params.url || '';
  const title = params.title || 'Servizio';
  const showSwitcher = params.showPlanSwitcher === 'true' && hasMultiplePlans(userProfile);

  useEffect(() => {
    if (!rawUrl) return;
    isWebviewCacheStale(rawUrl).then(stale => {
      setEffectiveUrl(stale ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}_t=${Date.now()}` : rawUrl);
    });
  }, [rawUrl]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title, headerBackTitle: 'Indietro' }} />
      {showSwitcher && userProfile?.current_plan && (
        <PlanSwitcher plan={userProfile.current_plan} />
      )}
      <AppWebView
        uri={effectiveUrl}
        injectToken
        onLoadEnd={() => markWebviewLoaded(rawUrl)}
        onRefreshUser={reloadProfile}
      />
    </ThemedView>
  );
}
