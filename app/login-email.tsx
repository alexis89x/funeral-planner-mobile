import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Keyboard,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { resolvePostLoginRoute } from '@/utils/plans';
import { Colors, AppLogoHorizontal, AppLogoHorizontalWidth, AppLogoHorizontalHeight } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { APP_BASE_URL } from "@/utils/api";
import { AuthFooter } from '@/components/auth-footer';

const LAST_EMAIL_KEY = '@tramonto_sereno_last_email';

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastPartnerName, setLastPartnerName] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, getLastPartnerName } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  console.log("LOADING LOGIN SCREEN");

  // Listen for keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load last saved email and partner on mount
  useEffect(() => {
    const loadLastEmail = async () => {
      try {
        const lastEmail = await AsyncStorage.getItem(LAST_EMAIL_KEY);
        if (lastEmail) {
          setEmail(lastEmail);
          console.log('Loaded last saved email:', lastEmail);
        }
      } catch (error) {
        console.error('Error loading last saved email:', error);
      }
    };

    const loadLastPartner = async () => {
      const partnerName = await getLastPartnerName();
      setLastPartnerName(partnerName);
    };

    loadLastEmail();
    loadLastPartner();
  }, [getLastPartnerName]);

  const handleLogin = async () => {
    console.log("HANDLING LOGIN");
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setIsLoading(true);
    try {
      const profile = await login(email, password);
      router.replace(resolvePostLoginRoute(profile));
    } catch (error: any) {
      console.log("ERROR", error);
      const msg = error?.message || '';
      if (msg === 'ERROR_API.WRONG_LOGIN_PARTNER_APP') {
        Alert.alert(
          'Accesso non disponibile',
          "L'app è disponibile solo per i clienti. L'accesso per i partner può essere eseguito solo da web.",
          [
            {
              text: 'Apri sito web',
              onPress: () => Linking.openURL(`${APP_BASE_URL}/auth/login`),
            },
            { text: 'Annulla', style: 'cancel' },
          ]
        );
        return;
      }
      const rateLimitMessages: Record<string, string> = {
        'ERROR_API.RATE-LIMIT-5MIN': 'Troppi tentativi. Riprova tra 5 minuti.',
        'ERROR_API.RATE-LIMIT-1HOUR': 'Troppi tentativi. Riprova tra 1 ora.',
        'ERROR_API.USERNAME-RATE-LIMIT-5MIN': 'Troppi tentativi per questo account. Riprova tra 5 minuti.',
        'ERROR_API.USERNAME-RATE-LIMIT-1HOUR': 'Troppi tentativi per questo account. Riprova tra 1 ora.',
        'ERROR_API.RATE-LIMITED': 'Troppi tentativi. Riprova più tardi.',
      };
      Alert.alert('Errore', rateLimitMessages[msg] ?? 'Email o password non validi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push({
      pathname: '/webview',
      params: {
        url: `${APP_BASE_URL}/auth/forgot-psw?r=user&forceMode=mobile`,
        title: 'Recupero Password',
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Accedi con Email',
          headerShown: true,
          headerBackTitle: 'Indietro',
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={AppLogoHorizontal}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.tabIconDefault}
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Password"
                placeholderTextColor={colors.tabIconDefault}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              disabled={isLoading}>
              <ThemedText style={[styles.forgotPasswordText, { color: colors.tint }]}>
                Password dimenticata?
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.tint }]}
              onPress={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.loginButtonText}>Accedi</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Partner section - hidden when keyboard is visible */}
      {!isKeyboardVisible && (
        lastPartnerName ? (
          <View style={[styles.partnerSectionBottom, { bottom: Math.max(40, insets.bottom + 16) }]}>
            <ThemedText style={styles.partnerText}>
              in collaborazione con
            </ThemedText>
            <ThemedText style={styles.partnerName}>
              {lastPartnerName}
            </ThemedText>
          </View>
        ) : (
          <AuthFooter />
        )
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: AppLogoHorizontalWidth,
    height: AppLogoHorizontalHeight,
    marginBottom: 16,
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
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: 50,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
