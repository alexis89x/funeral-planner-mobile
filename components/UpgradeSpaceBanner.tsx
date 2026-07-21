import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';
import { goToPlanUpgrade } from '@/utils/plans';

/**
 * Banner mostrato ai piani non-advanced per proporre l'upgrade a più spazio di archiviazione.
 * Apre la pagina di upgrade del piano in webview.
 */
export function UpgradeSpaceBanner({ planId }: { planId: number }) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => goToPlanUpgrade(planId)} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <IconSymbol name="externaldrive.fill.badge.plus" size={22} color={BaseColors.main} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Hai bisogno di più spazio?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Passa a un piano superiore per archiviare più documenti
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={18} color={BaseColors.greyMedium} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: BaseColors.mainLightest,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});
