import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/utils/api';

export default function PianificazioneLisaScreen() {
  const colorScheme = useColorScheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    serviceType: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    try {
      // API automatically adds token and security headers
      const response = await api.post('pianificazione', formData);

      if (response.result === 'ok') {
        Alert.alert('Successo', 'La tua richiesta è stata inviata con successo');
        setFormData({ name: '', email: '', phone: '', preferredDate: '', serviceType: '', notes: '' });
      }
    } catch (error: any) {
      // Error is already logged by api utility
      Alert.alert('Errore', error.message || 'Si è verificato un errore durante l\'invio');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Pianifica con Lisa
          </ThemedText>
          <ThemedText style={styles.description}>
            Lisa ti aiuterà a pianificare ogni dettaglio con attenzione e sensibilità.
            Compila il form per essere ricontattato.
          </ThemedText>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nome e Cognome *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="Inserisci il tuo nome"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="tua@email.com"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Telefono *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="+39 333 123 4567"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Data Preferita per il Contatto</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="es. 15/12/2025"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={formData.preferredDate}
                onChangeText={(text) => setFormData({ ...formData, preferredDate: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Tipo di Servizio</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="es. Cerimonia completa, cremazione, ecc."
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={formData.serviceType}
                onChangeText={(text) => setFormData({ ...formData, serviceType: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Note Aggiuntive</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="Eventuali richieste particolari o informazioni utili..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: BaseColors.main },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <ThemedText style={styles.submitButtonText}>
                Richiedi Appuntamento
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.note}>
              * Campi obbligatori
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});