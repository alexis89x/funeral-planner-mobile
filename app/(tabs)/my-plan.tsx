import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BASE_URL } from "@/utils/api";

export default function MyPlanScreen() {
  const { token } = useAuth();

  const url = `${APP_BASE_URL}/auth/set-token?token=${btoa(token || '')}&path=${encodeURIComponent('/user/plans')}&forceMode=mobile`;
  return (
    <ThemedView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
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
