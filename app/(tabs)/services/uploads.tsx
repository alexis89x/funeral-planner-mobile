import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, TouchableOpacity, ScrollView, View, Alert,
  ActivityIndicator, Animated, RefreshControl,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Stack, router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors, ACTIVE_THEME } from '@/constants/theme';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { ApiService, API_BASE_URL, APP_BASE_URL } from '@/utils/api';
import { PlanSwitcher } from '@/components/PlanSwitcher';
import { hasMultiplePlans } from '@/utils/plans';
import { getDocumentTypeDesc } from '@/constants/document-types';
import { UpgradeSpaceBanner } from '@/components/UpgradeSpaceBanner';

const AUTH_STORAGE_KEY = '@tramonto_sereno_auth';
const USER_STATUS_FORCE_PSW_CHANGE = 350;

export interface Attachment {
  id: number;
  uuid: string;
  uploader_role: number;
  uploader_id: number;
  id_plan: number;
  id_partner: number | null;
  type: string;
  path: string;
  filename: string;
  original_filename: string;
  document_type: string;
  notes: string;
  visibility?: string;
  status: number;
  encrypted: number;
  size: number;
  created: string;
  modified: string;
}

const canPreview = (attachment: Attachment): boolean =>
  attachment.type.startsWith('image/') || attachment.type === 'application/pdf';

interface FileIcon {
  name: string;
  color: string;
  bg: string;
}

const getFileIcon = (mimeType: string): FileIcon => {
  if (mimeType.startsWith('image/'))
    return { name: 'photo.fill', color: '#4A90D9', bg: '#EAF3FB' };
  if (mimeType === 'application/pdf')
    return { name: 'doc.richtext.fill', color: '#E53935', bg: '#FDECEA' };
  if (mimeType.startsWith('video/'))
    return { name: 'film.fill', color: '#FB8C00', bg: '#FFF3E0' };
  if (mimeType.startsWith('audio/'))
    return { name: 'music.note', color: '#8E24AA', bg: '#F3E5F5' };
  if (mimeType.startsWith('text/'))
    return { name: 'doc.text.fill', color: '#43A047', bg: '#E8F5E9' };
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive'))
    return { name: 'doc.zipper', color: '#F9A825', bg: '#FFFDE7' };
  if (mimeType.includes('word') || mimeType.includes('document'))
    return { name: 'doc.text.fill', color: '#1E88E5', bg: '#E3F2FD' };
  if (mimeType.includes('sheet') || mimeType.includes('excel'))
    return { name: 'doc.text.fill', color: '#2E7D32', bg: '#E8F5E9' };
  return { name: 'doc.fill', color: BaseColors.greyMedium, bg: BaseColors.greyLightest };
};

const buildAttachmentUrl = async (uuid: string, format: 'normal' | 'thumb' = 'normal'): Promise<string> => {
  const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  const token = stored ? JSON.parse(stored).token : null;
  const url = new URL(`${API_BASE_URL}/api-gateway.php`);
  url.searchParams.append('api', 'attachment-get-url');
  url.searchParams.append('uuid', uuid);
  url.searchParams.append('format', format);
  if (token) url.searchParams.append('token', token);
  return url.toString();
};

const formatDate = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp, 10));
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const toMB = (bytes: number): string => (bytes / 1024 / 1024).toFixed(1);

function AttachmentRow({
  attachment,
  onDelete,
  onOpen,
  onEdit,
}: {
  attachment: Attachment;
  onDelete: (a: Attachment) => void;
  onOpen: (a: Attachment) => void;
  onEdit: (a: Attachment) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = (_: any, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeRef.current?.close();
          onDelete(attachment);
        }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.fileRow}>
        <View style={[styles.fileIconContainer, { backgroundColor: getFileIcon(attachment.type).bg }]}>
          <IconSymbol
            name={getFileIcon(attachment.type).name as any}
            size={24}
            color={getFileIcon(attachment.type).color}
          />
        </View>
        <View style={styles.fileInfo}>
          <ThemedText style={styles.fileName} numberOfLines={2}>
            {attachment.original_filename}
          </ThemedText>
          {!!attachment.document_type && (
            <ThemedText style={styles.fileType}>{getDocumentTypeDesc(attachment.document_type)}</ThemedText>
          )}
          <ThemedText style={styles.fileDate}>{formatDate(attachment.created)}</ThemedText>
        </View>
        <View style={styles.actions}>
          {canPreview(attachment) && (
            <TouchableOpacity style={styles.actionButton} onPress={() => onOpen(attachment)}>
              <IconSymbol name="eye.fill" size={18} color={BaseColors.main} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(attachment)}>
            <IconSymbol name="pencil" size={18} color={BaseColors.grey} />
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
}

export default function UploadsScreen() {
  const { userProfile } = useAuth();
  const [uploads, setUploads] = useState<Attachment[]>([]);
  const [uploadLimit, setUploadLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = (userProfile?.owned_plans ?? []).find(
    (p: Plan) => p.id === userProfile?.user?.id_current_plan
  ) ?? userProfile?.owned_plans?.[0] ?? null;

  const showSwitcher = hasMultiplePlans(userProfile);
  const showUpgradeBanner = !!currentPlan && currentPlan.type !== 'advanced';

  const totalBytes = uploads.reduce((sum, a) => sum + (a.size || 0), 0);
  const usagePercent = uploadLimit > 0 ? Math.min((totalBytes / uploadLimit) * 100, 100) : 0;
  const isHighUsage = usagePercent > 70;
  const usageColor =
    usagePercent >= 90 ? BaseColors.danger : usagePercent >= 70 ? BaseColors.warning : BaseColors.main;

  const loadUploads = useCallback(async () => {
    if (!currentPlan) return;
    try {
      setError(null);
      const response = await ApiService.get('upload-list', { id_plan: currentPlan.id });
      const responseData = response.data as unknown as { uploads: Attachment[]; limit: number };
      const data = responseData?.uploads || [];
      setUploadLimit(responseData?.limit || 0);
      setUploads(data.sort((a, b) => parseInt(b.created, 10) - parseInt(a.created, 10)));
    } catch {
      setError('Impossibile caricare i documenti');
    }
  }, [currentPlan?.id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadUploads();
      setLoading(false);
    })();
  }, [loadUploads]);

  useFocusEffect(
    useCallback(() => {
      if (!loading) loadUploads();
    }, [loading, loadUploads])
  );

  useFocusEffect(
    useCallback(() => {
      if (userProfile?.user.status === USER_STATUS_FORCE_PSW_CHANGE) {
        router.replace({
          pathname: '/webview',
          params: {
            url: `${APP_BASE_URL}/user/profile?forceMode=mobile`,
            title: 'Cambia password',
            injectToken: 'true',
          },
        });
      }
    }, [userProfile])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUploads();
    setRefreshing(false);
  };

  const handleOpen = async (attachment: Attachment) => {
    try {
      const url = await buildAttachmentUrl(attachment.uuid);
      await Linking.openURL(url);
    } catch {
      Alert.alert('Errore', 'Impossibile aprire il documento.');
    }
  };

  const handleEdit = (attachment: Attachment) => {
    router.push({
      pathname: '/(tabs)/services/upload-item-edit',
      params: {
        id: String(attachment.id),
        id_plan: String(attachment.id_plan),
        document_type: attachment.document_type,
        notes: attachment.notes,
        visibility: attachment.visibility ?? '',
      },
    });
  };

  const handleDelete = (attachment: Attachment) => {
    Alert.alert(
      'Elimina documento',
      `Vuoi eliminare "${attachment.original_filename}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.post('upload-discard', {
                id: String(attachment.id),
                id_plan: String(attachment.id_plan),
              });
              setUploads(prev => prev.filter(a => a.id !== attachment.id));
            } catch {
              Alert.alert('Errore', 'Impossibile eliminare il documento. Riprova.');
            }
          },
        },
      ]
    );
  };

  const goToUploadForm = () => {
    router.push({
      pathname: '/(tabs)/services/upload-form',
      params: { usageBytes: String(totalBytes), limit: String(uploadLimit) },
    });
  };

  const AddButton = () => (
    <TouchableOpacity onPress={goToUploadForm}>
      <Ionicons name="add-circle-outline" size={28} color={BaseColors.main} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerRight: () => <AddButton /> }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BaseColors.main} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <AddButton /> }} />

      {showSwitcher && currentPlan && <PlanSwitcher plan={currentPlan} />}
      {showUpgradeBanner && <UpgradeSpaceBanner planId={currentPlan!.id} />}

      {error ? (
        <View style={styles.centered}>
          <IconSymbol name="exclamationmark.triangle.fill" size={40} color={BaseColors.greyLight} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <ThemedText style={styles.retryText}>Riprova</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BaseColors.main} />}>

          <View style={styles.storageSection}>
            <View style={styles.storageHeader}>
              <ThemedText style={styles.storageLabel}>Spazio utilizzato</ThemedText>
              <ThemedText style={[styles.storageValue, isHighUsage && styles.storageValueWarn]}>
                {toMB(totalBytes)} / {toMB(uploadLimit)} MB ({usagePercent.toFixed(1)}%)
              </ThemedText>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${usagePercent}%` as any,
                    backgroundColor: usageColor,
                  },
                ]}
              />
            </View>
          </View>

          {uploads.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.fill" size={48} color={BaseColors.greyLight} />
              <ThemedText style={styles.emptyText}>Nessun documento caricato</ThemedText>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={goToUploadForm}>
                <ThemedText style={styles.emptyButtonText}>Carica documento</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {uploads.map((a, i) => (
                <React.Fragment key={a.id}>
                  <AttachmentRow attachment={a} onDelete={handleDelete} onOpen={handleOpen} onEdit={handleEdit} />
                  {i < uploads.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={goToUploadForm}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <ThemedText style={styles.addButtonText}>Aggiungi documento</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40,
  },
  errorText: { fontSize: 15, textAlign: 'center', color: BaseColors.grey },
  retryButton: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: BaseColors.main,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  storageSection: {
    padding: 16, gap: 8,
    borderBottomWidth: 1, borderBottomColor: BaseColors.borderLight,
  },
  storageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storageLabel: { fontSize: 13, color: BaseColors.grey },
  storageValue: { fontSize: 12, color: BaseColors.grey },
  storageValueWarn: { color: BaseColors.warning },
  progressBg: {
    height: 6, borderRadius: 3, backgroundColor: BaseColors.greyLight, overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },

  list: { paddingBottom: 32 },
  fileRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, gap: 12, backgroundColor: '#fff',
  },
  fileIconContainer: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  fileInfo: { flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: BaseColors.mainLightest,
    alignItems: 'center', justifyContent: 'center',
  },
  fileName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  fileType: { fontSize: 12, color: BaseColors.main, marginBottom: 2 },
  fileDate: { fontSize: 11, color: BaseColors.grey },
  divider: { height: 1, backgroundColor: BaseColors.borderLight },
  deleteAction: {
    backgroundColor: BaseColors.danger, justifyContent: 'center', alignItems: 'center', width: 72,
  },

  emptyState: {
    alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, marginTop: 24,
  },
  emptyText: { fontSize: 16, color: BaseColors.grey },
  emptyButton: {
    marginTop: 4, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: BaseColors.main,
  },
  emptyButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: BaseColors.main,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
