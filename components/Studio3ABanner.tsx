import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppLogoHorizontal } from '@/constants/theme';

const PHONE = '800 09 02 10';

export function Studio3ABanner() {
  const handleCall = () => {
    Linking.openURL(`tel:${PHONE.replace(/\s/g, '')}`);
  };

  return (
    <View style={styles.container}>
      <Image
        source={AppLogoHorizontal}
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText style={styles.headline}>
        Sei vittima di un danno ed hai bisogno di assistenza?
      </ThemedText>
      <ThemedText style={styles.body}>
        Studio 3A ti garantisce una{' '}
        <ThemedText style={styles.bold}>CONSULENZA GRATUITA</ThemedText>
        {' '}per ottenere il giusto risarcimento
      </ThemedText>
      <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
        <IconSymbol name="phone.fill" size={18} color="#fff" />
        <ThemedText style={styles.callButtonText}>Chiamaci per un consulto gratuito!</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.phone}>{PHONE}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff6ed',
    borderBottomWidth: 1,
    borderBottomColor: '#f5d9b8',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 180,
    height: 56,
    marginBottom: 4,
  },
  headline: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  body: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bold: {
    color: '#ef7d00',
    fontWeight: '700',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef7d00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  phone: {
    color: '#ef7d00',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
});