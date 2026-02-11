import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router, Stack } from 'expo-router';
import Constants from 'expo-constants';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { isExpoGo } from "@/utils/utils";

// Check if running in Expo Go (development)
// Configure Google Sign-In only for device builds
if (!isExpoGo) {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_ID,
    scopes: ['profile', 'email'],
    offlineAccess: true,
    forceCodeForRefreshToken: false,
    iosClientId: process.env.EXPO_PUBLIC_IOS_ID,
  });
}

export default function LoginGoogleScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { googleLogin } = useAuth();

  useEffect(() => {
    // Check if Google Play Services are available (Android)
    const checkPlayServices = async () => {
      try {
        if (Platform.OS === 'android') {
          await GoogleSignin.hasPlayServices();
        }
        console.log('✅ Google Play Services available');
      } catch (error) {
        console.error('❌ Google Play Services not available:', error);
      }
    };

    checkPlayServices();
  }, []);

  const GoogleLogin = async () => {
    try {
      // Check if device has Google Play Services
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // Initiate sign-in process
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the login flow');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('Sign-in is in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
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


  const googleSignIn = async () => {
    // In Expo Go, show development message instead
    if (isExpoGo) {
      handleDevModeLogin();
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Starting Google Sign-In...');

      const response = await GoogleLogin();
      console.log('✅ Google Sign-In successful:', response);

      // Retrieve user data
      const { idToken, user } = response.data ?? response;
      
      if (idToken) {
        console.log('🔐 ID Token received:', idToken.substring(0, 20) + '...');
        console.log('🔐 ID Token received:', idToken);
        console.log('👤 User info:', user);
        
        // Authenticate with backend using AuthContext
        await googleLogin(
          idToken,
          (email: string) => {
            // Success callback
            router.replace('/(tabs)/my-plans');
            /*
              Alert.alert(
              'Accesso effettuato!',
              `Benvenuto ${email}!`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to main app
                    router.replace('/(tabs)/my-plans');
                  }
                }
              ]
            );*/
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
        throw new Error('Nessun token ID ricevuto da Google');
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
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Accedi con Google',
          headerShown: true,
        }}
      />
      <View style={styles.content}>
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

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            Accedi facilmente e in sicurezza con il tuo account Google
          </ThemedText>
        </View>

        <GoogleSigninButton
          style={styles.googleButton}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={googleSignIn}
          disabled={isLoading}
        />

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <ThemedText style={styles.debugText}>
              Platform: {Platform.OS}
            </ThemedText>
            <ThemedText style={styles.debugText}>
              Build Type: {isExpoGo ? 'Expo Go (Development)' : 'Device Build'}
            </ThemedText>
            <ThemedText style={styles.debugText}>
              Google Sign-In: {isExpoGo ? 'Disabled' : 'Enabled'}
            </ThemedText>
            <ThemedText style={styles.debugText}>
              Web Client ID: {process.env.EXPO_PUBLIC_WEB_ID?.substring(0, 20)}...
            </ThemedText>
            <ThemedText style={styles.debugText}>
              iOS Client ID: {process.env.EXPO_PUBLIC_IOS_ID?.substring(0, 20)}...
            </ThemedText>
          </View>
        )}

        <ThemedText style={styles.note}>
          Continuando accetti i nostri termini di servizio e la privacy policy
        </ThemedText>
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
    marginBottom: 48,
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
  infoContainer: {
    marginBottom: 32,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginBottom: 24,
  },
  debugContainer: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
  },
  debugText: {
    fontSize: 10,
    marginBottom: 4,
    opacity: 0.6,
  },
  note: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
