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
} from 'react-native';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { APP_BASE_URL } from "@/utils/api";
import { AuthFooter } from '@/components/auth-footer';

const LAST_EMAIL_KEY = '@tramonto_sereno_last_email';

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastPartnerName, setLastPartnerName] = useState<string | null>(null);
  const { login, getLastPartnerName } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  console.log("LOADING LOGIN SCREEN");

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
  }, []);

  const handleLogin = async () => {
    console.log("HANDLING LOGIN");
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/my-plan');
    } catch (error) {
      Alert.alert('Errore', 'Email o password non validi');
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
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="title" style={styles.appName}>
              Tramonto Sereno
            </ThemedText>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.tabIconDefault}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              onSubmitEditing={handleLogin}
            />

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

      {/* Partner section - persists across logout */}
      {lastPartnerName ? (
        <View style={styles.partnerSectionBottom}>
          <ThemedText style={styles.partnerText}>
            in collaborazione con
          </ThemedText>
          <ThemedText style={styles.partnerName}>
            {lastPartnerName}
          </ThemedText>
        </View>
      ) : (
        <AuthFooter />
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
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    textAlign: 'center',
    fontSize: 24,
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
