import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ServicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: false,
        headerBlurEffect: 'regular',
        presentation: 'card',
        animation: 'default',
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="consulto-psicologico"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pianificazione-lisa"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="miei-piani"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}