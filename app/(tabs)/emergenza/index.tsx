import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Modal, FlatList, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors, THEMES, ACTIVE_THEME } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Studio3ABanner } from '@/components/Studio3ABanner';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';
import { extractApiErrorMessage } from '@/utils/api-error';

interface EmergenzaItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  route: string;
  url?: string;
}

const CONTATTO_EMERGENZA_ITEM: EmergenzaItem = {
  id: 'contatto-emergenza',
  title: 'Contatti di emergenza',
  desc: 'Definisci chi può accedere alle tue informazioni',
  icon: 'exclamationmark.shield.fill',
  route: '/emergenza/contatti',
};

const CERCA_ONORANZE_ITEM: EmergenzaItem = {
  id: 'cerca-onoranze',
  title: 'Cerca onoranze funebri',
  desc: "Trova onoranze funebri vicino a te",
  icon: 'magnifyingglass',
  route: '/cerca-onoranze',
};

const NUMERI_UTILI_ITEM: EmergenzaItem = {
  id: 'numeri-utili',
  title: 'Numeri utili',
  desc: 'Numeri di emergenza',
  icon: 'phone.fill',
  route: '/emergenza/numeri-utili',
};

const UNLOCK_DURATIONS = [
  { label: '12 ore', key: '12_HOUR' },
  { label: '1 giorno', key: '1_DAY' },
  { label: '3 giorni', key: '3_DAY' },
  { label: '7 giorni', key: '7_DAY' },
];

export default function EmergenzaScreen() {
  const { userProfile, reloadProfile } = useAuth();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [now] = useState(() => Date.now());

  const hasPartner = !!userProfile?.user?.id_partner_referral;
  const showCercaOnoranze = THEMES[ACTIVE_THEME].funeralHomeTab === 'hide-without-partner' && !hasPartner;
  // Lo sblocco temporaneo dei documenti è una feature esclusiva di Archivio Sereno.
  const showUnlock = ACTIVE_THEME === 'archivio-sereno';

  const currentPlan = (userProfile?.owned_plans ?? []).find(
    (p: Plan) => p.id === userProfile?.user?.id_current_plan
  ) ?? userProfile?.owned_plans?.[0] ?? null;

  const contacts = currentPlan?.emergencyContacts ?? [];
  const isUnlocked = !!currentPlan?.allow_access_until && currentPlan.allow_access_until > now;

  const items: EmergenzaItem[] = [
    CONTATTO_EMERGENZA_ITEM,
    ...(showCercaOnoranze ? [CERCA_ONORANZE_ITEM] : []),
    NUMERI_UTILI_ITEM,
  ];

  const handleItemPress = (item: EmergenzaItem) => {
    if (item.url) {
      router.push({
        pathname: '/emergenza/webview',
        params: { url: item.url, title: item.title },
      });
    } else {
      router.push(item.route as any);
    }
  };

  const handleUnlockButtonPress = () => {
    if (isUnlocked) {
      handleRemoveUnlockPress();
      return;
    }

    if (contacts.length === 0) {
      Alert.alert(
        'Nessun contatto di emergenza',
        'Aggiungi almeno un contatto di emergenza prima di attivare lo sblocco temporaneo dei documenti.',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Aggiungi contatto', onPress: () => router.push('/emergenza/contatti') },
        ]
      );
      return;
    }
    setPickerVisible(true);
  };

  const handleSelectDuration = (label: string, key: string) => {
    setPickerVisible(false);
    Alert.alert(
      'Sblocco temporaneo',
      `I tuoi contatti di emergenza potranno accedere ai documenti caricati per ${label}. Vuoi continuare?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Conferma', onPress: () => confirmUnlock(key) },
      ]
    );
  };

  const handleRemoveUnlockPress = () => {
    Alert.alert(
      'Rimuovi sblocco temporaneo',
      'I tuoi contatti di emergenza non potranno più accedere ai documenti caricati. Vuoi continuare?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Conferma', style: 'destructive', onPress: () => confirmLock() },
      ]
    );
  };

  const confirmUnlock = async (durationKey: string) => {
    if (!currentPlan) return;
    setUnlocking(true);
    try {
      await ApiService.post(
        'upload-temporary-unlock',
        { id_plan: currentPlan.id, duration: durationKey },
        { manualErrorManagement: true }
      );
      await reloadProfile();
      Alert.alert('Sblocco attivato', 'I tuoi contatti di emergenza possono ora accedere ai documenti caricati.');
    } catch (err: any) {
      Alert.alert('Errore', extractApiErrorMessage(err?.responseData, 'Impossibile attivare lo sblocco temporaneo. Riprova più tardi.'));
    } finally {
      setUnlocking(false);
    }
  };

  const confirmLock = async () => {
    if (!currentPlan) return;
    setUnlocking(true);
    try {
      await ApiService.post(
        'upload-lock',
        { id_plan: currentPlan.id },
        { manualErrorManagement: true }
      );
      await reloadProfile();
      Alert.alert('Sblocco rimosso', 'I tuoi contatti di emergenza non possono più accedere ai documenti caricati.');
    } catch (err: any) {
      Alert.alert('Errore', extractApiErrorMessage(err?.responseData, 'Impossibile rimuovere lo sblocco temporaneo. Riprova più tardi.'));
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {ACTIVE_THEME === 'studio3a' && <Studio3ABanner />}

        <ThemedView style={styles.itemsContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, { borderBottomColor: BaseColors.borderLight }]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}>
              <ThemedView style={styles.itemRowContent}>
                <ThemedView style={[styles.iconContainer, { backgroundColor: BaseColors.mainLightest }]}>
                  <IconSymbol name={item.icon as any} size={28} color={BaseColors.main} />
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.itemDescription}>
                    {item.desc}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={BaseColors.greyMedium} />
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {showUnlock && (
          <>
            <TouchableOpacity
              style={[
                styles.unlockButton,
                isUnlocked && styles.unlockButtonActive,
                unlocking && styles.unlockButtonDisabled,
              ]}
              onPress={handleUnlockButtonPress}
              disabled={unlocking}
              activeOpacity={0.8}>
              <IconSymbol name={isUnlocked ? 'lock.fill' : 'lock.open.fill'} size={22} color="#fff" />
              <ThemedText style={styles.unlockButtonText}>
                {unlocking
                  ? 'Attivazione in corso...'
                  : isUnlocked
                    ? 'Rimuovi sblocco temporaneo'
                    : 'Sblocco temporaneo'}
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.unlockHint}>
              {isUnlocked && currentPlan?.allow_access_until
                ? `Accesso attivo fino al ${new Date(currentPlan.allow_access_until).toLocaleString('it-IT')}.`
                : 'Consenti temporaneamente ai tuoi contatti di emergenza di accedere ai documenti caricati.'}
            </ThemedText>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showUnlock && pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}>
        <SafeAreaView style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <ThemedText style={styles.pickerTitle}>Per quanto tempo?</ThemedText>
            <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.pickerCloseBtn}>
              <Ionicons name="close" size={24} color={BaseColors.greyMedium} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={UNLOCK_DURATIONS}
            keyExtractor={item => item.key}
            ItemSeparatorComponent={() => <View style={styles.pickerDivider} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => handleSelectDuration(item.label, item.key)}
                activeOpacity={0.6}>
                <ThemedText style={styles.pickerItemText}>{item.label}</ThemedText>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
  itemsContainer: {
    paddingBottom: 8,
  },
  itemRow: {
    borderBottomWidth: 1,
  },
  itemRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: BaseColors.danger,
  },
  unlockButtonActive: {
    backgroundColor: BaseColors.main,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  unlockHint: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 10,
    marginBottom: 32,
  },
  pickerContainer: { flex: 1, backgroundColor: '#fff' },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BaseColors.borderLight,
  },
  pickerTitle: { fontSize: 17, fontWeight: '700' },
  pickerCloseBtn: { padding: 4 },
  pickerItem: { paddingHorizontal: 20, paddingVertical: 16 },
  pickerItemText: { fontSize: 15 },
  pickerDivider: { height: 1, backgroundColor: BaseColors.borderLight, marginHorizontal: 20 },
});
