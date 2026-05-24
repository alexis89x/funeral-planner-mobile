import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ServicesLayout() {
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
          title: 'Servizi',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          title: 'Servizio',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          title: 'Prodotti',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="product-detail"
        options={{
          title: 'Dettaglio prodotto',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="uploads"
        options={{
          title: 'Documenti caricati',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="upload-form"
        options={{
          title: 'Carica documento',
          headerBackTitle: 'Indietro',
        }}
      />
    </Stack>
  );
}

/**
 * <Stack.Screen
 *         name="consulto-psicologico"
 *         options={{
 *           headerShown: false,
 *         }}
 *       />
 *       <Stack.Screen
 *         name="pianificazione-lisa"
 *         options={{
 *           headerShown: false,
 *         }}
 *       />
 *       <Stack.Screen
 *         name="miei-piani"
 *         options={{
 *           headerShown: false,
 *         }}
 *       />
 */
