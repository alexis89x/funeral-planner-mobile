import React, { useState, useEffect, useCallback } from 'react';
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
import * as AppleAuthentication from 'expo-apple-authentication';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors, AppLogoHorizontal, AppLogoHorizontalWidth, AppLogoHorizontalHeight, AppGoogleLoginEnabled, AppGoogleWebClientId, AppGoogleIosClientId } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AntDesign } from '@expo/vector-icons';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { APP_BASE_URL } from '@/utils/api';
import { resolvePostLoginRoute } from '@/utils/plans';
import { AuthFooter } from '@/components/auth-footer';
import { isExpoGo } from "@/utils/utils";

// Conditional import for Google Sign-In (only for device builds)
let GoogleSignin: any = null;
let isErrorWithCode: any = null;
let statusCodes: any = null;

if (!isExpoGo) {
  try {
    // Must stay a runtime require: a static import would be hoisted and evaluated
    // unconditionally, crashing Expo Go where this native module isn't present.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
    isErrorWithCode = GoogleSigninModule.isErrorWithCode;
    statusCodes = GoogleSigninModule.statusCodes;

    // Configure Google Sign-In only for device builds
    GoogleSignin.configure({
      webClientId: AppGoogleWebClientId,
      scopes: ['profile', 'email'],
      offlineAccess: true,
      forceCodeForRefreshToken: false,
      iosClientId: AppGoogleIosClientId,
    });
  } catch (error) {
    console.warn('Google Sign-In module not available:', error);
  }
}

const PROFILE_STORAGE_KEY = '@tramonto_sereno_last_profile';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getLastSavedProfile, getLastPartnerName, validateToken, googleLogin, appleLogin } = useAuth();
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(null);
  const [lastPartnerName, setLastPartnerName] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  const insets = useSafeAreaInsets();
  console.log("SHOWING WELCOME SCREEN");

  const checkAppleSignInAvailability = async () => {
    if (Platform.OS !== 'ios' || isExpoGo) return;

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleSignInAvailable(isAvailable);
    } catch (error) {
      console.error('❌ Error checking Apple Sign-In availability:', error);
    }
  };

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

  const loadLastProfile = useCallback(async () => {
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
  }, [getLastSavedProfile, validateToken]);

  const loadLastPartner = useCallback(async () => {
    const partnerName = await getLastPartnerName();
    setLastPartnerName(partnerName);
  }, [getLastPartnerName]);

  useEffect(() => {
    (async () => {
      loadLastProfile();
      loadLastPartner();
      checkPlayServices();
      checkAppleSignInAvailability();
    })();
  }, [loadLastProfile, loadLastPartner]);

  const handleAccediPress = async () => {
    if (isTokenValid) {
      const profile = await getLastSavedProfile();
      router.replace(resolvePostLoginRoute(profile));
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
          (email: string, profile) => {
            router.replace(resolvePostLoginRoute(profile));
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

  const handleAppleSignIn = async () => {
    // In Expo Go, show development message instead
    if (isExpoGo) {
      Alert.alert(
        'Development Mode',
        'Sign in with Apple non è disponibile in Expo Go. Questa funzionalità funzionerà nel build di produzione.'
      );
      return;
    }

    try {
      setIsAppleLoading(true);
      console.log('🚀 Starting Apple Sign-In...');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('✅ Apple Sign-In successful:', credential);

      const { identityToken, user, email, fullName } = credential;

      console.log('🍎 Apple user (sub):', user);
      console.log('🍎 Email from native credential:', email ?? '(null — not first authorization)');
      console.log('🍎 Full name from native credential:', fullName ?? '(null — not first authorization)');

      if (identityToken) {
        console.log('🔐 Identity Token received:', identityToken.substring(0, 20) + '...');

        // Authenticate with backend using AuthContext
        await appleLogin(
          identityToken,
          user,
          email,
          fullName?.givenName ?? null,
          fullName?.familyName ?? null,
          (email: string, profile) => {
            router.replace(resolvePostLoginRoute(profile));
          },
          (registrationUrl: string) => {
            // Registration required callback
            Alert.alert(
              'Registrazione richiesta',
              'Account non trovato. Vuoi registrarti con questo account Apple?',
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
        throw new Error('Nessun identity token ricevuto da Apple');
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled the Apple Sign-In flow');
      } else {
        console.error('❌ Apple Sign-In error:', error);

        let errorMessage = 'Accesso con Apple fallito. Riprova.';
        if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert('Errore', errorMessage);
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={AppLogoHorizontal}
            style={styles.logo}
            resizeMode="contain"
          />
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
            <View style={styles.loginSection}>
              <ThemedText style={styles.loginLabel}>Accedi</ThemedText>

              <View style={styles.loginButtonsRow}>
                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.tint }]}
                  onPress={() => router.push('/login-email')}>
                  <AntDesign name="mail" size={16} color="#fff" style={styles.buttonIcon} />
                  <ThemedText style={styles.loginButtonText}>Email</ThemedText>
                </TouchableOpacity>

                {!isExpoGo && AppGoogleLoginEnabled && (
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: isGoogleLoading ? `${colors.tint}80` : colors.tint }]}
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleLoading}>
                    <AntDesign name="google" size={16} color="#fff" style={styles.buttonIcon} />
                    <ThemedText style={styles.loginButtonText}>
                      {isGoogleLoading ? '...' : 'Google'}
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {isAppleSignInAvailable && (
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: isAppleLoading ? '#00000080' : '#000000' }]}
                    onPress={handleAppleSignIn}
                    disabled={isAppleLoading}>
                    <AntDesign name="apple" size={16} color="#fff" style={styles.buttonIcon} />
                    <ThemedText style={styles.loginButtonText}>
                      {isAppleLoading ? '...' : 'Apple'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <ThemedText style={styles.orLabel}>oppure</ThemedText>

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
            </View>
          )}
        </View>

        {/* Emergency contact link */}
        <TouchableOpacity
          style={styles.emergencyLinkContainer}
          onPress={() => router.push('/emergency-contact')}>
          <AntDesign name="warning" size={16} color={BaseColors.mainDark} style={styles.emergencyIcon} />
          <ThemedText style={[styles.emergencyLinkTitle, { color: BaseColors.mainDark }]}>
            Sei un contatto di emergenza?
          </ThemedText>
        </TouchableOpacity>

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
    width: AppLogoHorizontalWidth,
    height: AppLogoHorizontalHeight,
    marginBottom: 16,
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
  loginSection: {
    alignItems: 'stretch',
    gap: 16,
  },
  loginLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orLabel: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.5,
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
  emergencyLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 10,
    backgroundColor: '#FFFBEA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emergencyIcon: {
    marginTop: 1,
  },
  emergencyLinkTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
});
