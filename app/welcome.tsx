import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AntDesign } from '@expo/vector-icons';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { APP_BASE_URL } from '@/utils/api';
import { AuthFooter } from '@/components/auth-footer';
import { isExpoGo } from "@/utils/utils";

// Conditional import for Google Sign-In (only for device builds)
let GoogleSignin: any = null;
let GoogleSigninButton: any = null;
let isErrorWithCode: any = null;
let statusCodes: any = null;

if (!isExpoGo) {
  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
    GoogleSigninButton = GoogleSigninModule.GoogleSigninButton;
    isErrorWithCode = GoogleSigninModule.isErrorWithCode;
    statusCodes = GoogleSigninModule.statusCodes;

    // Configure Google Sign-In only for device builds
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true,
      forceCodeForRefreshToken: false,
      iosClientId: process.env.EXPO_PUBLIC_IOS_ID,
    });
  } catch (error) {
    console.warn('Google Sign-In module not available:', error);
  }
}

const PROFILE_STORAGE_KEY = '@tramonto_sereno_last_profile';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getLastSavedProfile, getLastPartnerName, validateToken, googleLogin } = useAuth();
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(null);
  const [lastPartnerName, setLastPartnerName] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const insets = useSafeAreaInsets();
  console.log("SHOWING WELCOME SCREEN");

  useEffect(() => {
    loadLastProfile();
    loadLastPartner();
    checkPlayServices();
  }, []);

  const checkPlayServices = async () => {
    if (!GoogleSignin) return;
    
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }
      console.log('✅ Google Play Services available');
    } catch (error) {
      console.error('❌ Google Play Services not available:', error);
    }
  };

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
      // Token valido, vai direttamente a my-plans
      router.replace('/(tabs)/my-plans');
    }
    // Se il token non è valido, resta su welcome per far scegliere all'utente
  };

  const handleChangeUser = async () => {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    setLastProfile(null);
    setIsTokenValid(false);
  };

  const GoogleLogin = async () => {
    if (!GoogleSignin) {
      throw new Error('Google Sign-In not available');
    }

    try {
      // Check if device has Google Play Services
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // Initiate sign-in process
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error) {
      if (isErrorWithCode && isErrorWithCode(error)) {
        switch ((error as any).code) {
          case statusCodes?.SIGN_IN_CANCELLED:
            console.log('User cancelled the login flow');
            break;
          case statusCodes?.IN_PROGRESS:
            console.log('Sign-in is in progress');
            break;
          case statusCodes?.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available');
            Alert.alert('Errore', 'Google Play Services non disponibili');
            break;
          default:
            console.log("ERROR details", error);
            console.log('Some other error happened');
        }
      } else {
        console.log('An error that is not related to Google Sign-In occurred');
      }
      throw error;
    }
  };

  const handleDevModeLogin = () => {
    Alert.alert(
      'Development Mode',
      'Google Sign-In non è disponibile in Expo Go. Questa funzionalità funzionerà nel build di produzione.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Simulate successful login for development
            console.log('🔧 Development mode: Simulating successful Google Sign-In');
          }
        }
      ]
    );
  };

  const handleGoogleSignIn = async () => {
    // In Expo Go, show development message instead
    if (isExpoGo) {
      handleDevModeLogin();
      return;
    }

    try {
      setIsGoogleLoading(true);
      console.log('🚀 Starting Google Sign-In...');

      const response = await GoogleLogin();
      console.log('✅ Google Sign-In successful:', response);

      // Retrieve user data
      const { idToken, user } = response.data ?? response;
      
      if (idToken) {
        console.log('🔐 ID Token received:', idToken.substring(0, 20) + '...');
        console.log('👤 User info:', user);
        
        // Authenticate with backend using AuthContext
        await googleLogin(
          idToken,
          (email: string) => {
            // Success callback
            router.replace('/(tabs)/my-plans');
          },
          (registrationUrl: string) => {
            // Registration required callback
            Alert.alert(
              'Registrazione richiesta',
              'Account non trovato. Vuoi registrarti con questo account Google?',
              [
                { text: 'Annulla', style: 'cancel' },
                {
                  text: 'Registrati',
                  onPress: () => {
                    // Navigate to webview registration
                    router.push({
                      pathname: '/webview',
                      params: {
                        url: registrationUrl,
                        title: 'Registrazione',
                      },
                    });
                  }
                }
              ]
            );
          }
        );
      } else {
        // Succede se io faccio annulla... Non deve mandare errore.
        // throw new Error('Nessun token ID ricevuto da Google');
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Accesso con Google fallito. Riprova.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Errore', errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
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
                style={[styles.secondaryButton, { borderColor: colors.tint }]}
                onPress={handleChangeUser}>
                <ThemedText style={styles.secondaryButtonText}>Cambia utente</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.loginButtonsGroup}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                  onPress={() => router.push('/login-email')}>
                  <ThemedText style={styles.primaryButtonText}>Accedi con Email</ThemedText>
                </TouchableOpacity>

                {!isExpoGo && (
                  <TouchableOpacity
                    style={[
                      styles.primaryButton, 
                      { backgroundColor: isGoogleLoading ? `${colors.tint}80` : colors.tint }
                    ]}
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleLoading}>
                    <View style={styles.buttonWithIcon}>
                      {!isGoogleLoading && (
                        <AntDesign 
                          name="google" 
                          size={20} 
                          color="#fff" 
                          style={styles.buttonIcon} 
                        />
                      )}
                      <ThemedText style={styles.primaryButtonText}>
                        {isGoogleLoading ? 'Accesso...' : 'Accedi con Google'}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.tint }]}
                onPress={() => router.push({
                  pathname: '/webview',
                  params: {
                    url: `${APP_BASE_URL}/registration?forceMode=mobile`,
                    title: 'Registrazione',
                  },
                })}>
                <ThemedText style={[styles.secondaryButtonText, { color: colors.tint }]}>Registrati</ThemedText>
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
    gap: 32,
  },
  loginButtonsGroup: {
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
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
