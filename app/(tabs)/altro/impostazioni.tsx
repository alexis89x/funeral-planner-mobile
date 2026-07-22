import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';
import { extractApiErrorMessage } from '@/utils/api-error';

const MIN_HOURS = 0;
const MAX_HOURS = 24;

export default function ImpostazioniScreen() {
  const { userProfile, reloadProfile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const currentHours = Math.round((userProfile?.cfg?.buffer_death_time_min ?? 0) / 60);
  const [hours, setHours] = useState(String(currentHours));
  const [saving, setSaving] = useState(false);

  // Lingua: non ancora modificabile dall'utente, nascosta dalla UI finché non serve.
  // const [lang, setLang] = useState(userProfile?.cfg?.lang ?? 'it');

  const parsedHours = Number(hours);
  const isValid = hours.trim() !== '' && Number.isFinite(parsedHours) && parsedHours >= MIN_HOURS && parsedHours <= MAX_HOURS;
  const hasChanges = isValid && parsedHours !== currentHours;

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Valore non valido', `Inserisci un numero di ore tra ${MIN_HOURS} e ${MAX_HOURS}.`);
      return;
    }

    setSaving(true);
    try {
      await ApiService.post(
        'profile-update-cfg',
        { buffer_death_time_min: Math.round(parsedHours * 60) },
        { manualErrorManagement: true }
      );
      await reloadProfile();
      Alert.alert('Impostazioni aggiornate', 'La modifica è stata salvata con successo.');
    } catch (error: any) {
      Alert.alert('Errore', extractApiErrorMessage(error?.responseData));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Impostazioni
          </ThemedText>

          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={styles.label}>Tempo di attesa emergenza</ThemedText>
            <ThemedText style={styles.hint}>
              Numero di ore di inattività prima che l&apos;accesso di emergenza venga attivato per i tuoi contatti.
            </ThemedText>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={hours}
                onChangeText={setHours}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0-24"
                placeholderTextColor={BaseColors.grey}
              />
              <ThemedText style={styles.unitLabel}>ore</ThemedText>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }, (!hasChanges || saving) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!hasChanges || saving}>
                <ThemedText style={styles.saveButtonText}>
                  {saving ? 'Salvataggio...' : 'Salva'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    opacity: 0.7,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    width: 60,
    textAlign: 'center',
  },
  unitLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});