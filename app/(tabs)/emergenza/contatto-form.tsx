import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';
import { Plan } from '@/contexts/AuthContext';

const ALL_PLANS_VALUE = '__all__';

function PlanPicker({
  plans,
  selectedId,
  onSelect,
}: {
  plans: Plan[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const options = [
    { id: ALL_PLANS_VALUE, label: 'Tutti i piani' },
    ...plans.map(p => ({ id: String(p.id), label: p.plan_for })),
  ];

  const selectedLabel = options.find(o => o.id === selectedId)?.label ?? 'Seleziona piano';

  return (
    <>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setOpen(true)}>
        <ThemedText style={styles.pickerButtonText}>{selectedLabel}</ThemedText>
        <IconSymbol name="chevron.down" size={16} color={BaseColors.grey} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Seleziona piano</ThemedText>
            {options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={styles.modalOption}
                onPress={() => { onSelect(opt.id); setOpen(false); }}>
                <ThemedText style={[styles.modalOptionText, opt.id === selectedId && styles.modalOptionSelected]}>
                  {opt.label}
                </ThemedText>
                {opt.id === selectedId && (
                  <IconSymbol name="checkmark" size={18} color={BaseColors.main} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

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

  const nonPetPlans = (userProfile?.owned_plans ?? []).filter((p: Plan) => p.type !== 'pet');
  const hasMultiplePlans = nonPetPlans.length > 1;

  const defaultPlanId = () => {
    const currentId = String(userProfile?.user?.id_current_plan ?? '');
    const match = nonPetPlans.find(p => String(p.id) === currentId);
    return match ? currentId : (nonPetPlans[0] ? String(nonPetPlans[0].id) : ALL_PLANS_VALUE);
  };

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    isEdit ? String(params.planId ?? '') : defaultPlanId()
  );

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
          id_plan: selectedPlanId === ALL_PLANS_VALUE ? '0' : selectedPlanId,
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

          {!isEdit && hasMultiplePlans && (
            <View style={styles.section}>
              <ThemedText style={styles.label}>Piano</ThemedText>
              <PlanPicker
                plans={nonPetPlans}
                selectedId={selectedPlanId}
                onSelect={setSelectedPlanId}
              />
            </View>
          )}

          {isEdit && (
            <TouchableOpacity
              style={[styles.deleteButton, deleting && styles.saveButtonDisabled]}
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
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <ThemedText style={styles.saveButtonText}>Elimina contatto</ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}

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
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: BaseColors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: BaseColors.blackMedium,
    flex: 1,
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
  deleteButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: BaseColors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BaseColors.greyLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BaseColors.borderLight,
  },
  modalOptionText: {
    fontSize: 16,
    color: BaseColors.blackMedium,
  },
  modalOptionSelected: {
    color: BaseColors.main,
    fontWeight: '600',
  },
});
