import React from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import faqData from '@/assets/faq.json';

export default function FaqCategoriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            {faqData.categories.map((category, index) => (
              <React.Fragment key={category.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <TouchableOpacity
                  style={styles.row}
                  onPress={() =>
                    router.push({
                      pathname: '/altro/faq-questions' as any,
                      params: { categoryId: category.id },
                    })
                  }>
                  <ThemedText style={styles.label}>{category.label}</ThemedText>
                  <ThemedText style={[styles.count, { color: colors.icon }]}>
                    {category.faqs.length}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={16} color={colors.icon} />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  count: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
});
