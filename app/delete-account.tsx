import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/utils/api';

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Inserisci la tua password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('profile-delete-account', {
        password: password,
      }, {
        manualErrorManagement: true,
      });

      if (response.result === 'ok') {
        // Logout and show success message
        await logout();
        router.replace('/welcome');

        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            'Account eliminato',
            'Il tuo account è stato eliminato con successo.\n\nCi dispiace che tu abbia deciso di lasciarci. Se cambierai idea, sarai sempre il benvenuto su Tramonto Sereno.'
          );
        }, 500);
      } else {
        setError(response.message || response.error || 'Errore durante l\'eliminazione dell\'account');
      }
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError('Password non corretta o errore di connessione'); // err.message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Elimina Account',
          headerShown: true,
          headerBackTitle: 'Indietro',
        }}
      />

      <View style={styles.content}>
        <View style={styles.warningSection}>
          <ThemedText style={styles.warningTitle}>Attenzione!</ThemedText>
          <ThemedText style={styles.warningText}>
            Se elimini il tuo utente, non potrai più accedere con questo indirizzo email.
            Perderai tutte le tue pianificazioni.
          </ThemedText>
          <ThemedText style={[styles.warningText, styles.warningBold]}>
            Questa azione è irreversibile!
          </ThemedText>
          <ThemedText style={styles.warningText}>
            Se vorrai utilizzare ancora Tramonto Sereno, dovrai registrarti nuovamente.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <ThemedText style={styles.label}>
            Per confermare, inserisci la tua password:
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: error ? '#dc3545' : colors.border }
            ]}
            placeholder="Password"
            placeholderTextColor={colors.tabIconDefault}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />

          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}

          <TouchableOpacity
            style={[styles.deleteButton, isLoading && styles.buttonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.deleteButtonText}>
                Sì, elimina questo account
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => router.back()}
            disabled={isLoading}>
            <ThemedText style={styles.cancelButtonText}>
              No, non voglio più eliminare l'account
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  warningSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 8,
  },
  warningBold: {
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 16,
  },
  deleteButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 14,
  },
});
