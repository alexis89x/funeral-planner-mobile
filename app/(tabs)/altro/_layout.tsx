import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AltroLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Indietro',
        presentation: 'card',
        animation: 'default',
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? undefined : '#fff',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Altro',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="account"
        options={{ title: 'Profilo' }}
      />
      <Stack.Screen
        name="faq-categories"
        options={{ title: 'FAQ' }}
      />
      <Stack.Screen
        name="faq-questions"
        options={{ title: 'Domande frequenti' }}
      />
      <Stack.Screen
        name="faq-answer"
        options={{ title: 'Risposta' }}
      />
    </Stack>
  );
}
