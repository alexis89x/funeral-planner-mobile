import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';

/**
 * Avviso mostrato al posto del selettore destinatari quando il piano non ha
 * ancora contatti di emergenza: senza contatti i documenti non possono essere
 * consegnati in caso di emergenza.
 */
export function EmergencyContactsWarning() {
  return (
    <View style={styles.container}>
      <IconSymbol name="exclamationmark.triangle.fill" size={20} color={BaseColors.warning} />
      <View style={styles.textContainer}>
        <ThemedText style={styles.text}>
          Per poter consegnare questo documento in caso di emergenza è necessario aggiungere almeno un contatto di emergenza.
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/emergenza/contatto-form')}
          activeOpacity={0.7}>
          <ThemedText style={styles.link}>Aggiungi contatto di emergenza</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  textContainer: { flex: 1, gap: 6 },
  text: { fontSize: 13, color: BaseColors.blackMedium, lineHeight: 18 },
  link: { fontSize: 13, fontWeight: '600', color: BaseColors.main },
});