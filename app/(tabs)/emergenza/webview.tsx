import React, { useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EmergenzaWebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{ url: string; title?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const url = params.url || 'https://app.tramontosereno.it';
  const title = params.title || 'Emergenza';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: title,
          headerBackTitle: 'Indietro',
        }}
      />
      <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
