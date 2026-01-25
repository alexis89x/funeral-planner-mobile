import React from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AccountScreen() {
  const { userProfile, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = () => {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      {
        text: 'Annulla',
        style: 'cancel',
      },
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

  /*
    <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
    <IconSymbol name="person.fill" size={48} color="#fff" />
    </View>

   */
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.userName}>
          {userProfile?.user ? `${userProfile.user.first_name} ${userProfile.user.last_name}` : 'Utente'}
        </ThemedText>
        {userProfile?.user?.email && (
          <ThemedText style={styles.userEmail}>
            {userProfile.user.email}
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Informazioni Personali
        </ThemedText>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Nome</ThemedText>
            <ThemedText style={styles.infoValue}>{userProfile?.user?.first_name || 'N/A'}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Cognome</ThemedText>
            <ThemedText style={styles.infoValue}>{userProfile?.user?.last_name || 'N/A'}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            <ThemedText style={styles.infoValue}>{userProfile?.user?.email || 'N/A'}</ThemedText>
          </View>
          {userProfile?.user?.phone && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Telefono</ThemedText>
                <ThemedText style={styles.infoValue}>{userProfile.user.phone}</ThemedText>
              </View>
            </>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Lingua</ThemedText>
            <ThemedText style={styles.infoValue}>{userProfile?.user?.lang?.toUpperCase() || 'N/A'}</ThemedText>
          </View>
        </View>
      </View>
      {false && userProfile?.current_plan && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Piano corrente
          </ThemedText>

          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Piano</ThemedText>
              <ThemedText style={styles.infoValue}>{userProfile.current_plan.plan_for}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Tipo</ThemedText>
              <ThemedText style={styles.infoValue}>{userProfile.current_plan.type.toUpperCase()}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Stato Pagamento</ThemedText>
              <ThemedText style={styles.infoValue}>{userProfile.current_plan.payment_status}</ThemedText>
            </View>
          </View>
        </View>
      )}
      {userProfile?.owned_plans && userProfile.owned_plans.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Piani posseduti: {userProfile.owned_plans.length}
          </ThemedText>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.tint }]}
          onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#fff" />
          <ThemedText style={styles.logoutButtonText}>Esci</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Altre azioni
        </ThemedText>
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={() => router.push('/delete-account')}>
          <IconSymbol name="trash" size={18} color="#dc3545" />
          <ThemedText style={styles.deleteAccountButtonText}>Elimina Account</ThemedText>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    marginTop: 8,
  },
  userEmail: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  deleteAccountButtonText: {
    color: '#dc3545',
    fontSize: 14,
  },
});
