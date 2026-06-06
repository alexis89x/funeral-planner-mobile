import React, { useState } from 'react';
import {
  StyleSheet, TouchableOpacity, View, TextInput, Alert,
  ScrollView, ActivityIndicator, Modal, FlatList, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { getSecurityHeaders } from '@/utils/security';
import { extractApiErrorMessage } from '@/utils/api-error';
import { DocumentTypes, getDocumentTypeDesc, DocumentType } from '@/constants/document-types';

const AUTH_STORAGE_KEY = '@tramonto_sereno_auth';

const getFileIconInfo = (mimeType?: string): { name: string; color: string } => {
  if (!mimeType) return { name: 'doc.fill', color: BaseColors.greyMedium };
  if (mimeType.startsWith('image/')) return { name: 'photo.fill', color: '#4A90D9' };
  if (mimeType === 'application/pdf') return { name: 'doc.richtext.fill', color: '#E53935' };
  if (mimeType.startsWith('video/')) return { name: 'film.fill', color: '#FB8C00' };
  if (mimeType.startsWith('audio/')) return { name: 'music.note', color: '#8E24AA' };
  if (mimeType.startsWith('text/')) return { name: 'doc.text.fill', color: '#43A047' };
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return { name: 'doc.zipper', color: '#F9A825' };
  if (mimeType.includes('word') || mimeType.includes('document')) return { name: 'doc.text.fill', color: '#1E88E5' };
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { name: 'doc.text.fill', color: '#2E7D32' };
  return { name: 'doc.fill', color: BaseColors.greyMedium };
};

const formatSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

function DocumentTypePicker({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (type: DocumentType) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={pickerStyles.container}>
        <View style={pickerStyles.header}>
          <ThemedText style={pickerStyles.title}>Tipo documento</ThemedText>
          <TouchableOpacity onPress={onClose} style={pickerStyles.closeBtn}>
            <Ionicons name="close" size={24} color={BaseColors.greyMedium} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={DocumentTypes}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={pickerStyles.divider} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={pickerStyles.item}
              onPress={() => onSelect(item)}
              activeOpacity={0.6}>
              <ThemedText style={pickerStyles.itemText}>{item.name}</ThemedText>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

export default function UploadFormScreen() {
  const { userProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(
    DocumentTypes.find(d => d.id === 'generic')!
  );
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const currentPlan = (userProfile?.owned_plans ?? []).find(
    (p: Plan) => p.id === userProfile?.user?.id_current_plan
  ) ?? userProfile?.owned_plans?.[0] ?? null;

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentPlan) return;

    setUploading(true);
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const token = storedAuth ? JSON.parse(storedAuth).token : null;

      const formData = new FormData();
      if (token) formData.append('token', token);
      formData.append('id_plan', String(currentPlan.id));
      if (documentType) formData.append('documentType', documentType.id);
      if (notes) formData.append('notes', notes);
      formData.append('attachment', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name,
      } as any);

      const url = `${API_BASE_URL}/api-gateway.php?api=upload-item`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getSecurityHeaders(token || undefined),
        body: formData,
      });
      const data = await response.json();

      if (data.data || data.result === 'ok') {
        Alert.alert('Documento caricato', 'Il documento è stato caricato con successo.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        throw new Error(extractApiErrorMessage(data));
      }
    } catch (err: any) {
      Alert.alert('Errore', err.message || 'Impossibile caricare il documento. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  const icon = getFileIconInfo(selectedFile?.mimeType ?? undefined);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* File picker */}
        <TouchableOpacity style={styles.picker} onPress={handlePick} activeOpacity={0.7}>
          {selectedFile ? (
            <View style={styles.selectedRow}>
              <View style={[styles.selectedIcon, { backgroundColor: icon.color + '20' }]}>
                <IconSymbol name={icon.name as any} size={28} color={icon.color} />
              </View>
              <View style={styles.selectedInfo}>
                <ThemedText style={styles.selectedName} numberOfLines={2}>
                  {selectedFile.name}
                </ThemedText>
                {!!selectedFile.size && (
                  <ThemedText style={styles.selectedSize}>{formatSize(selectedFile.size)}</ThemedText>
                )}
              </View>
              <Ionicons name="swap-horizontal-outline" size={20} color={BaseColors.grey} />
            </View>
          ) : (
            <View style={styles.pickerEmpty}>
              <Ionicons name="cloud-upload-outline" size={48} color={BaseColors.greyMedium} />
              <ThemedText style={styles.pickerText}>Seleziona documento</ThemedText>
              <ThemedText style={styles.pickerHint}>PDF, immagini, Word, e altri formati</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Document type */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Tipo documento</ThemedText>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}>
            <ThemedText style={styles.selectText}>
              {documentType.name}
            </ThemedText>
            <Ionicons name="chevron-down" size={18} color={BaseColors.grey} />
          </TouchableOpacity>
        </View>

        {/* Notes */}
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
          style={[styles.uploadButton, (!selectedFile || uploading) && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={!selectedFile || uploading}
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

      <DocumentTypePicker
        visible={pickerVisible}
        onSelect={type => {
          setDocumentType(type);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 20 },

  picker: {
    borderWidth: 2, borderColor: BaseColors.borderLight, borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center', backgroundColor: BaseColors.mainLightestest,
  },
  pickerEmpty: { alignItems: 'center', gap: 8 },
  pickerText: { fontSize: 15, color: BaseColors.greyMedium, fontWeight: '600' },
  pickerHint: { fontSize: 13, color: BaseColors.grey, textAlign: 'center' },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  selectedIcon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 14, fontWeight: '600', color: BaseColors.blackMedium },
  selectedSize: { fontSize: 12, color: BaseColors.grey, marginTop: 2 },

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
  selectPlaceholder: { color: BaseColors.grey },

  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BaseColors.main, paddingVertical: 15, borderRadius: 12,
  },
  uploadButtonDisabled: { opacity: 0.4 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const pickerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: BaseColors.borderLight,
  },
  title: { fontSize: 17, fontWeight: '700' },
  closeBtn: { padding: 4 },
  item: { paddingHorizontal: 20, paddingVertical: 15 },
  itemText: { fontSize: 15 },
  divider: { height: 1, backgroundColor: BaseColors.borderLight, marginHorizontal: 20 },
});
