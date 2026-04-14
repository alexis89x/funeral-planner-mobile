import React, { useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const EMERGENCY_URL = 'https://app.tramontosereno.it/auth/plan-emergency?forceMode=mobile';

export default function EmergencyContactScreen() {
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Accesso Contatto di Emergenza',
          headerShown: true,
          headerBackTitle: 'Indietro',
        }}
      />
      <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
        <WebView
          ref={webViewRef}
          source={{ uri: EMERGENCY_URL }}
          style={styles.webview}
          startInLoadingState={true}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={`
            (function() {
              window.tsMobileApp = true;
              true;
            })();
          `}
          onLoadEnd={() => setIsLoading(false)}
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
