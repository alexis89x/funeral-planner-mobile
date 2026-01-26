import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { APP_BASE_URL } from '@/utils/api';
import { AuthFooter } from '@/components/auth-footer';

const PROFILE_STORAGE_KEY = '@tramonto_sereno_last_profile';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getLastSavedProfile, getLastPartnerName, validateToken } = useAuth();
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(null);
  const [lastPartnerName, setLastPartnerName] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const insets = useSafeAreaInsets();
  console.log("SHOWING WELCOME SCREEN");

  useEffect(() => {
    loadLastProfile();
    loadLastPartner();
  }, []);

  const loadLastProfile = async () => {
    setIsValidating(true);
    const profile = await getLastSavedProfile();
    setLastProfile(profile);

    // Se c'è un profilo salvato, valida il token
    if (profile) {
      console.log('🔍 Validating saved token...');
      const isValid = await validateToken();
      setIsTokenValid(isValid);
      console.log('✅ Token valid:', isValid);
    }
    setIsValidating(false);
  };

  const loadLastPartner = async () => {
    const partnerName = await getLastPartnerName();
    setLastPartnerName(partnerName);
  };

  const handleAccediPress = () => {
    if (isTokenValid) {
      // Token valido, vai direttamente a my-plan
      router.replace('/(tabs)/my-plan');
    }
    // Se il token non è valido, resta su welcome per far scegliere all'utente
  };

  const handleChangeUser = async () => {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    setLastProfile(null);
    setIsTokenValid(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="title" style={styles.appName}>
            Tramonto Sereno
          </ThemedText>
        </View>

        {/* Welcome message if user exists */}
        {lastProfile && (
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeText}>
              Bentornato, {lastProfile.user.first_name}!
            </ThemedText>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {lastProfile ? (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={handleAccediPress}
                disabled={isValidating}>
                <ThemedText style={styles.primaryButtonText}>
                  {isValidating ? 'Validazione...' : 'ACCEDI'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={handleChangeUser}>
                <ThemedText style={styles.secondaryButtonText}>Cambia utente</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/login-email')}>
                <ThemedText style={styles.primaryButtonText}>Accedi con Email</ThemedText>
              </TouchableOpacity>

              {/* Google login - hidden for now
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={() => router.push('/login-google')}>
                <ThemedText style={styles.secondaryButtonText}>Accedi con Google</ThemedText>
              </TouchableOpacity>
              */}

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={() => router.push({
                  pathname: '/webview',
                  params: {
                    url: `${APP_BASE_URL}/registration?forceMode=mobile`,
                    title: 'Registrazione',
                  },
                })}>
                <ThemedText style={styles.secondaryButtonText}>Registrati</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Partner section - persists across logout */}
        {lastPartnerName && (
          <View style={[styles.partnerSectionBottom, { bottom: Math.max(40, insets.bottom + 16) }]}>
            <ThemedText style={styles.partnerText}>
              in collaborazione con
            </ThemedText>
            <ThemedText style={styles.partnerName}>
              {lastPartnerName}
            </ThemedText>
          </View>
        )}

        {!lastPartnerName ? (
          <AuthFooter />
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    textAlign: 'center',
    fontSize: 24,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  partnerSectionBottom: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  partnerText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
