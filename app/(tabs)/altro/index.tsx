import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';

const MENU_ITEMS = [
  { label: 'Profilo', icon: 'person.fill' as const, route: '/altro/account' },
  { label: 'FAQ', icon: 'questionmark.circle.fill' as const, route: '/altro/faq-categories' },
  { label: 'Guide video', icon: 'play.circle.fill' as const, route: '/altro/tutorials' },
];

export default function AltroScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { logout, userProfile } = useAuth();
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  const handleUnlinkFuneralHome = () => {
    Alert.alert(
      'Cambia onoranza funebre',
      "I tuoi piani sono stati offerti dall'onoranza funebre a cui sei collegato. Richiedendo il cambio dovrai scegliere una nuova onoranza funebre o passare a un piano avanzato. Vuoi procedere?",
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          style: 'destructive',
          onPress: async () => {
            setUnlinkLoading(true);
            try {
              await ApiService.post('user-request-unlink', {}, { manualErrorManagement: true });
              Alert.alert(
                'Richiesta inviata',
                'Abbiamo ricevuto la richiesta di cambio onoranza funebre, verrai contattato il prima possibile tramite email o telefono.'
              );
            } catch {
              Alert.alert('Errore', "Si è verificato un errore durante l'invio della richiesta. Riprova più tardi.");
            } finally {
              setUnlinkLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {MENU_ITEMS.map((item, index) => (
        <React.Fragment key={item.route}>
          {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(item.route as any)}>
            <IconSymbol name={item.icon} size={22} color={colors.tint} />
            <ThemedText style={styles.label}>{item.label}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
        </React.Fragment>
      ))}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {!!userProfile?.user?.id_partner_referral && (
        <>
          <TouchableOpacity
            style={[styles.row, unlinkLoading && styles.disabled]}
            onPress={handleUnlinkFuneralHome}
            disabled={unlinkLoading}>
            <IconSymbol name="link.badge.minus" size={22} color={colors.danger} />
            <ThemedText style={[styles.label, { color: colors.danger }]}>
              {unlinkLoading ? 'Invio in corso...' : 'Cambia onoranza funebre'}
            </ThemedText>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </>
      )}

      <TouchableOpacity style={styles.row} onPress={() => router.push('/delete-account')}>
        <IconSymbol name="trash" size={22} color={colors.danger} />
        <ThemedText style={[styles.label, { color: colors.danger }]}>Elimina Account</ThemedText>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color={colors.danger} />
        <ThemedText style={[styles.label, { color: colors.danger }]}>Esci</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
