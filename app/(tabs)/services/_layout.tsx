import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ServicesLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShadowVisible: false,
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
          title: 'Consulto Psicologico',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="pianificazione-lisa"
        options={{
          title: 'Pianificazione con Lisa',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="miei-piani"
        options={{
          title: 'I Miei Piani',
          headerBackTitle: 'Indietro',
        }}
      />
    </Stack>
  );
}