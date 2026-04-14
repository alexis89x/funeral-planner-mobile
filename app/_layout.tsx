import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { deactivateKeepAwake } from 'expo-keep-awake';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

SplashScreen.preventAutoHideAsync();

// Disable keep awake since we don't need it for this app
deactivateKeepAwake();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { currentUser, isLoading, loadingState, loadingError } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  console.log('🚀 RootLayoutNav render', { isLoading, loadingState, hasUser: !!currentUser, segments });

  // Hide splash screen immediately when component mounts, we'll use our custom LoadingScreen
  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
        console.log('✅ Default splash screen hidden, showing custom loading screen');
      } catch (e) {
        console.warn('❌ Error hiding splash:', e);
      }
    };

    // Hide splash screen with a small delay to ensure smooth transition
    const timer = setTimeout(hideSplash, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle auth-based routing
  useEffect(() => {
    if (isLoading) {
      console.log('⏳ Still loading auth, skipping routing');
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    const inWelcome = segments[0] === 'welcome';
    const inLoginFlow = segments[0] === 'login-email' || segments[0] === 'login-google';
    const inWebview = segments[0] === 'webview';
    const inEmergencyContact = segments[0] === 'emergency-contact';
    const inModal = segments[0] === 'modal';

    console.log('🔐 Checking routes', {
      currentUser: !!currentUser,
      inAuthGroup,
      inWelcome,
      inLoginFlow,
      inWebview,
      inModal,
      segments
    });

    // Don't redirect if in webview, modal or emergency contact
    if (inWebview || inModal || inEmergencyContact) {
      console.log('✅ In webview/modal/emergency-contact, no redirect');
      return;
    }

    if (!currentUser && inAuthGroup) {
      // Not logged in, trying to access protected routes
      console.log('➡️ Redirecting to /welcome (not logged in)');
      router.replace('/welcome');
    } else if (currentUser && (inWelcome || inLoginFlow)) {
      // Logged in, but on auth screens
      console.log('➡️ Redirecting to /(tabs)/my-plans (logged in)');
      router.replace('/(tabs)/my-plans');
    } else {
      // @ts-ignore
      if (!currentUser && segments.length === 0) {
        console.log('➡️ Redirecting to /welcome (initial load, no user)');
        router.replace('/welcome');
      } else {
        console.log('✅ No redirect needed');
      }
    }
  }, [currentUser, isLoading, segments]);

  // Show custom loading screen while loading
  if (isLoading && loadingState !== 'completed') {
    return (
      <>
        <LoadingScreen
          loadingState={loadingState}
          error={loadingError || undefined}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login-email" options={{ headerShown: false, headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="login-google" options={{ headerShown: false, headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="webview" options={{ headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="emergency-contact" options={{ headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="delete-account" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}