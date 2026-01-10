import { Stack } from 'expo-router';

export default function ServicesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Servizi',
          headerShown: true,
          headerLeft: () => null,
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
      <Stack.Screen
        name="webview"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}