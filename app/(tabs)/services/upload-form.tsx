import React, { useState } from 'react';
import {
  StyleSheet, TouchableOpacity, View, TextInput, Alert,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { getSecurityHeaders } from '@/utils/security';

const AUTH_STORAGE_KEY = '@tramonto_sereno_auth';

export default function UploadFormScreen() {
  const { userProfile } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const currentPlan = (userProfile?.owned_plans ?? []).find(
    (p: Plan) => p.id === userProfile?.user?.id_current_plan
  ) ?? userProfile?.owned_plans?.[0] ?? null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Abilita l\'accesso alla galleria nelle impostazioni.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedAsset(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedAsset || !currentPlan) return;

    setUploading(true);
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const token = storedAuth ? JSON.parse(storedAuth).token : null;

      const formData = new FormData();
      if (token) formData.append('token', token);
      formData.append('id_plan', String(currentPlan.id));
      if (documentType) formData.append('document_type', documentType);
      if (notes) formData.append('notes', notes);
      formData.append('file', {
        uri: selectedAsset.uri,
        type: selectedAsset.mimeType || 'image/jpeg',
        name: selectedAsset.fileName || 'upload.jpg',
      } as any);

      const url = `${API_BASE_URL}/api-gateway.php?api=upload-add`;
      const headers = getSecurityHeaders(token || undefined);

      const response = await fetch(url, { method: 'POST', headers, body: formData });
      const data = await response.json();

      if (data.result === 'ok') {
        Alert.alert('Documento caricato', 'Il documento è stato caricato con successo.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        throw new Error(data.message || 'Errore durante il caricamento');
      }
    } catch (err: any) {
      Alert.alert('Errore', err.message || 'Impossibile caricare il documento. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.picker} onPress={handlePickImage} activeOpacity={0.7}>
          {selectedAsset ? (
            <View style={styles.selectedRow}>
              <IconSymbol name="photo.fill" size={24} color={BaseColors.main} />
              <ThemedText style={styles.selectedName} numberOfLines={2}>
                {selectedAsset.fileName || 'Immagine selezionata'}
              </ThemedText>
              <Ionicons name="checkmark-circle" size={20} color={BaseColors.success} />
            </View>
          ) : (
            <View style={styles.pickerEmpty}>
              <Ionicons name="cloud-upload-outline" size={44} color={BaseColors.greyMedium} />
              <ThemedText style={styles.pickerText}>Seleziona immagine</ThemedText>
              <ThemedText style={styles.pickerHint}>Tocca per aprire la galleria</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Tipo documento</ThemedText>
          <TextInput
            style={styles.input}
            value={documentType}
            onChangeText={setDocumentType}
            placeholder="Es. Carta d'identità, Testamento..."
            placeholderTextColor={BaseColors.grey}
          />
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
          />
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, (!selectedAsset || uploading) && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={!selectedAsset || uploading}
          activeOpacity={0.8}>
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <ThemedText style={styles.uploadButtonText}>Carica documento</ThemedText>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 20 },

  picker: {
    borderWidth: 2, borderColor: BaseColors.borderLight, borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center',
  },
  pickerEmpty: { alignItems: 'center', gap: 8 },
  pickerText: { fontSize: 15, color: BaseColors.greyMedium, fontWeight: '600' },
  pickerHint: { fontSize: 13, color: BaseColors.grey },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectedName: { flex: 1, fontSize: 14, color: BaseColors.mainDark, fontWeight: '500' },

  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: BaseColors.greyMedium },
  input: {
    borderWidth: 1, borderColor: BaseColors.borderLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    backgroundColor: '#fff', color: BaseColors.black,
  },
  inputMultiline: { height: 90 },

  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BaseColors.main, paddingVertical: 15, borderRadius: 12,
  },
  uploadButtonDisabled: { opacity: 0.4 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
