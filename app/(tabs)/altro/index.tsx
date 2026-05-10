import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MENU_ITEMS = [
  { label: 'Profilo', icon: 'person.fill' as const, route: '/altro/account' },
  { label: 'FAQ', icon: 'questionmark.circle.fill' as const, route: '/altro/faq-categories' },
];

export default function AltroScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      {MENU_ITEMS.map((item, index) => (
        <React.Fragment key={item.route}>
          {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(item.route as any)}>
            <IconSymbol name={item.icon} size={22} color={colors.tint} />
            <ThemedText style={styles.label}>{item.label}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
