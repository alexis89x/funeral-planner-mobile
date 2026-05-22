import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { BaseColors } from '@/constants/theme';
import { Plan } from '@/contexts/AuthContext';

type Props = {
  plan: Plan;
};

export function PlanSwitcher({ plan }: Props) {
  const label = plan.plan_for || plan.type;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(tabs)/my-plans')}
      activeOpacity={0.7}>
      <View style={styles.left}>
        <Ionicons name="document-text-outline" size={16} color={BaseColors.main} />
        <ThemedText style={styles.label} numberOfLines={1}>{label}</ThemedText>
      </View>
      <View style={styles.right}>
        <ThemedText style={styles.switchText}>Cambia</ThemedText>
        <Ionicons name="chevron-forward" size={14} color={BaseColors.main} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BaseColors.mainLightest,
    borderBottomWidth: 1,
    borderBottomColor: BaseColors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BaseColors.mainDark,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  switchText: {
    fontSize: 13,
    color: BaseColors.main,
    fontWeight: '600',
  },
});
