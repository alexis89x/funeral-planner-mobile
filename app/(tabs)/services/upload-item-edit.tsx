import React, { useState } from 'react';
import {
  StyleSheet, TouchableOpacity, View, TextInput, Alert,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth, Plan, EmergencyContact } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';
import { DocumentTypes, DocumentType } from '@/constants/document-types';
import { DocumentTypePicker, ContactsPicker } from '@/components/document-pickers';
import { EmergencyContactsWarning } from '@/components/EmergencyContactsWarning';

export default function UploadItemEditScreen() {
  const params = useLocalSearchParams<{
    id: string;
    id_plan: string;
    document_type?: string;
    notes?: string;
    visibility?: string;
  }>();

  const { userProfile } = useAuth();

  const initialVisibleToAll = !params.visibility;
  const initialContactIds = params.visibility
    ? params.visibility.split(';;;').filter(Boolean).map(id => parseInt(id, 10))
    : [];

  const [documentType, setDocumentType] = useState<DocumentType>(
    DocumentTypes.find(d => d.id === params.document_type) ?? DocumentTypes.find(d => d.id === 'generic')!
  );
  const [notes, setNotes] = useState(params.notes ?? '');
  const [visibleToAll, setVisibleToAll] = useState(initialVisibleToAll);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>(initialContactIds);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [contactsPickerVisible, setContactsPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentPlan = (userProfile?.owned_plans ?? []).find(
    (p: Plan) => p.id === userProfile?.user?.id_current_plan
  ) ?? userProfile?.owned_plans?.[0] ?? null;

  const emergencyContacts: EmergencyContact[] = currentPlan?.emergencyContacts ?? [];

  const toggleContact = (id: number) => {
    setVisibleToAll(false);
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAllContacts = () => {
    setVisibleToAll(true);
    setSelectedContactIds([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ApiService.post('upload-item-edit', {
        id: params.id,
        id_plan: params.id_plan,
        documentType: documentType.id,
        notes,
        visibility: visibleToAll ? '' : selectedContactIds.join(';;;'),
      });
      router.back();
    } catch {
      Alert.alert('Errore', 'Impossibile salvare le modifiche. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina documento',
      'Vuoi eliminare questo documento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await ApiService.post('upload-discard', {
                id: params.id,
                id_plan: params.id_plan,
              });
              router.back();
            } catch {
              Alert.alert('Errore', 'Impossibile eliminare il documento. Riprova.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Tipo documento</ThemedText>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setPickerVisible(true)}
              activeOpacity={0.7}>
              <ThemedText style={styles.selectText}>{documentType.name}</ThemedText>
              <Ionicons name="chevron-down" size={18} color={BaseColors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Note</ThemedText>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Note opzionali..."
              placeholderTextColor={BaseColors.grey}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!saving && !deleting}
            />
          </View>

          {emergencyContacts.length > 0 ? (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Visibile a</ThemedText>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setContactsPickerVisible(true)}
                activeOpacity={0.7}>
                <ThemedText style={styles.selectText} numberOfLines={1}>
                  {visibleToAll
                    ? 'Tutti i contatti'
                    : emergencyContacts
                        .filter(c => selectedContactIds.includes(c.id))
                        .map(c => c.name)
                        .join(', ') || 'Nessun contatto selezionato'}
                </ThemedText>
                <Ionicons name="chevron-down" size={18} color={BaseColors.grey} />
              </TouchableOpacity>
            </View>
          ) : (
            <EmergencyContactsWarning />
          )}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || deleting}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <ThemedText style={styles.saveButtonText}>Salva modifiche</ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteLink, deleting && styles.saveButtonDisabled]}
            onPress={handleDelete}
            disabled={saving || deleting}>
            {deleting ? (
              <ActivityIndicator color={BaseColors.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={BaseColors.danger} />
                <ThemedText style={styles.deleteLinkText}>Elimina documento</ThemedText>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <DocumentTypePicker
        visible={pickerVisible}
        onSelect={type => {
          setDocumentType(type);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />

      <ContactsPicker
        visible={contactsPickerVisible}
        contacts={emergencyContacts}
        selectedIds={selectedContactIds}
        visibleToAll={visibleToAll}
        onToggle={toggleContact}
        onSelectAll={selectAllContacts}
        onClose={() => setContactsPickerVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: BaseColors.greyMedium },
  input: {
    borderWidth: 1, borderColor: BaseColors.borderLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    backgroundColor: '#fff', color: BaseColors.black,
  },
  inputMultiline: { height: 90 },

  selectInput: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: BaseColors.borderLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#fff',
  },
  selectText: { fontSize: 15, color: BaseColors.black, flex: 1 },

  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BaseColors.main, paddingVertical: 15, borderRadius: 12,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  deleteLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: 8, paddingVertical: 12,
  },
  deleteLinkText: { fontSize: 16, color: BaseColors.danger },
});