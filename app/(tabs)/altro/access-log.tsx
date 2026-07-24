import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HeaderHelpButton } from '@/components/HeaderHelpButton';
import { PlanSwitcher } from '@/components/PlanSwitcher';
import { BaseColors } from '@/constants/theme';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';
import { extractApiErrorMessage } from '@/utils/api-error';
import { hasMultiplePlans } from '@/utils/plans';

const HELP_TITLE = 'Cronologia accesso ai documenti';
const HELP_MESSAGE =
  'Qui trovi lo storico degli accessi ai tuoi documenti da parte dei tuoi contatti di emergenza, e le richieste di attivazione dello stato di emergenza ricevute sui tuoi piani.';

const STATUS_APPROVED = 100;
const STATUS_REJECTED = 200;
const STATUS_PENDING_APPROVAL = 300;
const STATUS_ARCHIVED = 450;
const STATUS_DELETED = 500;
const STATUS_HIDDEN = 700;

const DECEASED_STATUS_LABELS: Record<number, { label: string; color: string }> = {
  [STATUS_APPROVED]: { label: 'Approvata', color: BaseColors.success },
  [STATUS_REJECTED]: { label: 'Rifiutata', color: BaseColors.danger },
  [STATUS_PENDING_APPROVAL]: { label: 'In attesa', color: BaseColors.warning },
  [STATUS_ARCHIVED]: { label: 'Archiviata', color: BaseColors.grey },
  [STATUS_DELETED]: { label: 'Eliminata', color: BaseColors.grey },
  [STATUS_HIDDEN]: { label: 'Nascosta', color: BaseColors.grey },
};

const getDeceasedStatus = (status: number): { label: string; color: string } =>
  DECEASED_STATUS_LABELS[status] ?? { label: `Stato ${status}`, color: BaseColors.grey };

interface DocumentAccessActivity {
  type: 'document_access';
  id: number;
  created: string;
  accessed_by: 'emergency_contact' | 'owner' | null;
  id_attachment: number;
  document_name?: string;
  raw_value?: string;
  id_emergency_contact?: number;
  emergency_contact_name?: string;
  plan_owner_name: string;
}

interface DeceasedRequestActivity {
  type: 'deceased_request';
  id: number;
  created: string;
  status: number;
  id_plan: number;
  emergency_contact_name: string | null;
  plan_user_name: string;
  deceased: string | null;
}

type ActivityItem = DocumentAccessActivity | DeceasedRequestActivity;

const formatDateTime = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp, 10));
  return date.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const getActivityIcon = (item: ActivityItem): { name: any; color: string; bg: string } => {
  if (item.type === 'deceased_request') {
    return { name: 'exclamationmark.shield.fill', color: BaseColors.danger, bg: '#FDECEA' };
  }
  if (item.accessed_by) {
    return { name: 'eye.fill', color: BaseColors.main, bg: BaseColors.mainLightest };
  }
  return { name: 'doc.fill', color: BaseColors.greyMedium, bg: BaseColors.greyLightest };
};

const getTitle = (item: ActivityItem): string => {
  if (item.type === 'deceased_request') return 'Richiesta di stato di emergenza';
  return item.document_name || item.raw_value || 'Documento';
};

const getSubtitle = (item: ActivityItem): string => {
  if (item.type === 'deceased_request') {
    return item.emergency_contact_name
      ? `Richiesta da ${item.emergency_contact_name} · ${item.plan_user_name}`
      : item.plan_user_name;
  }
  if (item.accessed_by === 'emergency_contact') {
    return item.emergency_contact_name
      ? `Consultato da ${item.emergency_contact_name}`
      : 'Consultato da un contatto di emergenza';
  }
  return 'Accesso registrato';
};

const isVisible = (item: ActivityItem): boolean =>
  item.type !== 'document_access' || item.accessed_by !== 'owner';

export default function AccessLogScreen() {
  const { userProfile } = useAuth();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = (userProfile?.owned_plans ?? []).find(
    (p: Plan) => p.id === userProfile?.user?.id_current_plan
  ) ?? userProfile?.owned_plans?.[0] ?? null;

  const showSwitcher = hasMultiplePlans(userProfile);

  const loadActivity = useCallback(async () => {
    if (!currentPlan) return;
    try {
      setError(null);
      const response = await ApiService.get<ActivityItem[]>(
        'emergency-contact-activity-get-all',
        { id_plan: currentPlan.id },
        { manualErrorManagement: true }
      );
      const items = (response.data ?? []).filter(isVisible);
      setActivity(items.sort((a, b) => parseInt(b.created, 10) - parseInt(a.created, 10)));
    } catch (err: any) {
      setError(extractApiErrorMessage(err?.responseData, 'Impossibile caricare gli accessi.'));
    }
    // currentPlan is a fresh object every render; narrowing to its id keeps this
    // callback (and the effects below that depend on it) stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlan?.id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadActivity();
      setLoading(false);
    })();
  }, [loadActivity]);

  useFocusEffect(
    useCallback(() => {
      if (!loading) loadActivity();
    }, [loading, loadActivity])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivity();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerRight: () => <HeaderHelpButton title={HELP_TITLE} message={HELP_MESSAGE} /> }} />
        {showSwitcher && currentPlan && <PlanSwitcher plan={currentPlan} />}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BaseColors.main} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <HeaderHelpButton title={HELP_TITLE} message={HELP_MESSAGE} /> }} />
      {showSwitcher && currentPlan && <PlanSwitcher plan={currentPlan} />}
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
          {activity.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.fill" size={48} color={BaseColors.greyLight} />
              <ThemedText style={styles.emptyText}>Nessun accesso registrato</ThemedText>
            </View>
          ) : (
            <View style={styles.list}>
              {activity.map((item, i) => {
                const icon = getActivityIcon(item);
                return (
                  <React.Fragment key={`${item.type}-${item.id}`}>
                    <View style={styles.row}>
                      <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                        <IconSymbol name={icon.name} size={22} color={icon.color} />
                      </View>
                      <View style={styles.info}>
                        <ThemedText style={styles.title} numberOfLines={2}>
                          {getTitle(item)}
                        </ThemedText>
                        <ThemedText style={styles.subtitle} numberOfLines={2}>
                          {getSubtitle(item)}
                        </ThemedText>
                        <ThemedText style={styles.date}>{formatDateTime(item.created)}</ThemedText>
                      </View>
                      {item.type === 'deceased_request' && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: `${getDeceasedStatus(item.status).color}22` },
                          ]}>
                          <ThemedText style={[styles.badgeText, { color: getDeceasedStatus(item.status).color }]}>
                            {getDeceasedStatus(item.status).label}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    {i < activity.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
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

  list: { paddingBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 12, gap: 12, backgroundColor: '#fff',
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  subtitle: { fontSize: 12, color: BaseColors.main, marginBottom: 2 },
  date: { fontSize: 11, color: BaseColors.grey },
  divider: { height: 1, backgroundColor: BaseColors.borderLight },

  badge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  emptyState: {
    alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, marginTop: 24,
  },
  emptyText: { fontSize: 16, color: BaseColors.grey },
});