import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function EmergenzaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Indietro',
        presentation: 'card',
        animation: 'default',
        headerTransparent: false,
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? undefined : '#fff',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Emergenza',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="numeri-utili"
        options={{
          title: 'Numeri Utili',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          title: 'Emergenza',
          headerBackTitle: 'Indietro',
        }}
      />
    </Stack>
  );
}
