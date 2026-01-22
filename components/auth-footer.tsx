import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TERMS_URL = 'https://app.tramontosereno.it/terms-and-conditions.html';
const PRIVACY_URL = 'https://www.tramontosereno.it/privacy-policy.html';

export function AuthFooter({ hideTerms }: { hideTerms?: boolean }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.termsContainer}>
        {!hideTerms ? (
          <>
            <ThemedText style={styles.termsText}>
              Continuando, dichiari di aver letto e accettato i
            </ThemedText>
            <View style={styles.linksRow}>
              <ThemedText
                style={[styles.link, { color: colors.tint }]}
                onPress={() => openLink(TERMS_URL)}>
                termini e condizioni
              </ThemedText>
              <ThemedText style={styles.termsText}> e la </ThemedText>
              <ThemedText
                style={[styles.link, { color: colors.tint }]}
                onPress={() => openLink(PRIVACY_URL)}>
                privacy policy
              </ThemedText>
            </View>
          </>
        ) : null}
        <ThemedText style={styles.version}>v{appVersion}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.65,
  },
  link: {
    fontSize: 12,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
  version: {
    fontSize: 11,
    opacity: 0.4,
  },
});
