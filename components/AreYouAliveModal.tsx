import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BaseColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';

export function AreYouAliveModal() {
  const { userProfile, reloadProfile } = useAuth();
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState(false);

  const currentPlan = userProfile?.current_plan
    ?? (userProfile?.owned_plans ?? []).find((p) => p.id === userProfile?.user?.id_current_plan)
    ?? userProfile?.owned_plans?.[0]
    ?? null;

  // Deve comparire ogni volta che il piano risulta deceduto, indipendentemente da tema, tab o schermata corrente.
  const visible = !!currentPlan?.deceased;

  const handleBlock = async () => {
    if (!currentPlan) return;
    setBlocking(true);
    setError(false);
    try {
      await ApiService.post(
        'i-am-alive',
        { plan_id: currentPlan.id },
        { manualErrorManagement: true }
      );
      await reloadProfile();
    } catch {
      setError(true);
    } finally {
      setBlocking(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <IconSymbol name="exclamationmark.shield.fill" size={32} color={BaseColors.danger} />
          </View>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            Sei ancora vivo?
          </ThemedText>
          <ThemedText style={styles.body}>
            Un tuo contatto di emergenza ha segnalato la tua assenza e ha attivato l'accesso di emergenza al tuo piano. Se si tratta di un errore, blocca subito l'accesso: verrà annullato immediatamente, anche se è attivo uno sblocco temporaneo dei documenti.
          </ThemedText>
          {error && (
            <ThemedText style={styles.errorText}>
              Impossibile completare l'operazione. Riprova.
            </ThemedText>
          )}
          <TouchableOpacity
            style={[styles.blockButton, blocking && styles.blockButtonDisabled]}
            onPress={handleBlock}
            disabled={blocking}
            activeOpacity={0.8}>
            <ThemedText style={styles.blockButtonText}>
              {blocking ? 'Blocco in corso...' : "Sono vivo, blocca l'accesso di emergenza"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: BaseColors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  blockButton: {
    width: '100%',
    backgroundColor: BaseColors.danger,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  blockButtonDisabled: {
    opacity: 0.6,
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
