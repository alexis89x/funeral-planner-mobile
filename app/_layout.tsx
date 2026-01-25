import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { currentUser, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  console.log('🚀 RootLayoutNav render', { isLoading, hasUser: !!currentUser, segments });

  // Hide splash screen when auth is loaded
  useEffect(() => {
    if (!isLoading) {
      console.log('🎬 Auth loaded, hiding splash screen...');
      const timer = setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden');
        } catch (e) {
          console.warn('❌ Error hiding splash:', e);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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

    // Don't redirect if in webview or modal
    if (inWebview || inModal) {
      console.log('✅ In webview/modal, no redirect');
      return;
    }

    if (!currentUser && inAuthGroup) {
      // Not logged in, trying to access protected routes
      console.log('➡️ Redirecting to /welcome (not logged in)');
      router.replace('/welcome');
    } else if (currentUser && (inWelcome || inLoginFlow)) {
      // Logged in, but on auth screens
      console.log('➡️ Redirecting to /(tabs)/my-plan (logged in)');
      router.replace('/(tabs)/my-plan');
    } else if (!currentUser && segments.length === 0) {
      console.log('➡️ Redirecting to /welcome (initial load, no user)');
      router.replace('/welcome');
    } else {
      console.log('✅ No redirect needed');
    }
  }, [currentUser, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login-email" options={{ headerShown: false, headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="login-google" options={{ headerShown: false, headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="webview" options={{ headerBackTitle: 'Indietro' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
