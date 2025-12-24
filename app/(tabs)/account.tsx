import React from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AccountScreen() {
  const { currentUser, userProfile, logout, reloadProfile } = useAuth();
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
          router.replace('/login');
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    await reloadProfile();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <IconSymbol name="person.fill" size={48} color="#fff" />
        </View>
        <ThemedText type="title" style={styles.userName}>
          {userProfile?.user?.name || userProfile?.user?.email || 'Utente'}
        </ThemedText>
        {userProfile?.user?.email && (
          <ThemedText style={styles.userEmail}>
            {userProfile.user.email}
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Informazioni Account
        </ThemedText>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>ID Utente</ThemedText>
            <ThemedText style={styles.infoValue}>{userProfile?.user?.id || 'N/A'}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Ruolo</ThemedText>
            <ThemedText style={styles.infoValue}>{currentUser?.role || 'N/A'}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Status</ThemedText>
            <ThemedText style={styles.infoValue}>{currentUser?.status || 'N/A'}</ThemedText>
          </View>
          {userProfile?.user?.id_current_plan && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Piano Corrente</ThemedText>
                <ThemedText style={styles.infoValue}>{userProfile.user.id_current_plan}</ThemedText>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.tint }]}
          onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#fff" />
          <ThemedText style={styles.logoutButtonText}>Esci</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
