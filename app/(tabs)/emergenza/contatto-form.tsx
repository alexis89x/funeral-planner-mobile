import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';
import { getCurrentPlanId } from '@/utils/plans';

export default function ContattoFormScreen() {
  const params = useLocalSearchParams<{
    contactId?: string;
    planId?: string;
    name?: string;
    email?: string;
    phone?: string;
  }>();

  const { userProfile, reloadProfile } = useAuth();
  const isEdit = !!params.contactId;

  const [name, setName] = useState(params.name ?? '');
  const [email, setEmail] = useState(params.email ?? '');
  const [phone, setPhone] = useState(params.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentPlanId = getCurrentPlanId(userProfile);

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio.');
      return false;
    }
    if (!phone.trim() && !email.trim()) {
      Alert.alert('Errore', 'Inserisci almeno un telefono o una email.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await ApiService.post('emergency-contact-update', {
          id_emergency_contact: params.contactId,
          id_plan: params.planId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        });
      } else {
        await ApiService.post('emergency-contact-save', {
          id_plan: currentPlanId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        });
      }

      await reloadProfile();
      router.back();
    } catch {
      Alert.alert('Errore', "Si è verificato un errore. Riprova più tardi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isEdit ? 'Modifica contatto' : 'Nuovo contatto',
          headerBackTitle: 'Indietro',
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <ThemedText style={styles.label}>Nome *</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome e cognome"
              placeholderTextColor={BaseColors.grey}
              autoCapitalize="words"
              editable={!saving}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.label}>Telefono</ThemedText>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 333 1234567"
              placeholderTextColor={BaseColors.grey}
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@esempio.it"
              placeholderTextColor={BaseColors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || deleting}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isEdit ? 'checkmark-circle-outline' : 'person-add-outline'}
                  size={20}
                  color="#fff"
                />
                <ThemedText style={styles.saveButtonText}>
                  {isEdit ? 'Salva modifiche' : 'Salva contatto'}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          {isEdit && (
            <TouchableOpacity
              style={[styles.deleteLink, deleting && styles.saveButtonDisabled]}
              onPress={() => {
                Alert.alert(
                  'Elimina contatto',
                  'Vuoi eliminare questo contatto di emergenza?',
                  [
                    { text: 'Annulla', style: 'cancel' },
                    {
                      text: 'Elimina',
                      style: 'destructive',
                      onPress: async () => {
                        setDeleting(true);
                        try {
                          await ApiService.post('emergency-contact-remove', {
                            id_emergency_contact: params.contactId,
                            id_plan: params.planId,
                          });
                          await reloadProfile();
                          router.back();
                        } catch {
                          Alert.alert('Errore', 'Impossibile eliminare il contatto.');
                        } finally {
                          setDeleting(false);
                        }
                      },
                    },
                  ]
                );
              }}
              disabled={deleting || saving}>
              {deleting ? (
                <ActivityIndicator color={BaseColors.danger} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color={BaseColors.danger} />
                  <ThemedText style={styles.deleteLinkText}>Elimina contatto</ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    padding: 20,
    gap: 8,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BaseColors.grey,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: BaseColors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: BaseColors.blackMedium,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: BaseColors.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    paddingVertical: 12,
  },
  deleteLinkText: {
    fontSize: 16,
    color: BaseColors.danger,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
