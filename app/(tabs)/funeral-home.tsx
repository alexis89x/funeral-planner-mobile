import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function FuneralHomeScreen() {
  const { token } = useAuth();

  // TODO: Sostituire con l'URL corretto per Onoranza Funebre
  const url = `https://app.tramontosereno.it/funeral-home?forceToken=${token}`;

  return (
    <ThemedView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
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
