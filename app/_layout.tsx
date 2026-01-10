import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { currentUser, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isSplashHidden, setIsSplashHidden] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(tabs)';
        const inWelcome = segments[0] === 'welcome';
        const inLoginFlow = segments[0] === 'login-email' || segments[0] === 'login-google' || segments[0] === 'register';

        if (!currentUser && inAuthGroup) {
          // User not logged in but trying to access protected routes
          router.replace('/welcome');
        } else if (currentUser && (inWelcome || inLoginFlow)) {
          // User logged in but on auth screens
          router.replace('/(tabs)/my-plan');
        } else { // @ts-ignore
          if (!currentUser && segments.length === 0) {
            // Initial load without user - only redirect if no route is specified
            router.replace('/welcome');
          }
        }

        // Hide splash screen only once
        if (!isSplashHidden) {
          await SplashScreen.hideAsync();
          setIsSplashHidden(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [currentUser, segments, isLoading, isSplashHidden]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login-email" options={{ headerShown: false }} />
        <Stack.Screen name="login-google" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="webview" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
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
