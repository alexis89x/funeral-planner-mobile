import React from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import faqData from '@/assets/faq.json';

export default function FaqQuestionsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const category = faqData.categories.find(c => c.id === categoryId);
  if (!category) return null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: category.label }} />
      <ScrollView>
        {category.faqs.map((faq, index) => (
          <React.Fragment key={index}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: '/altro/faq-answer' as any,
                  params: { question: faq.q, answer: faq.a },
                })
              }>
              <ThemedText style={styles.question}>{faq.q}</ThemedText>
              <IconSymbol name="chevron.right" size={16} color={colors.icon} />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
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
    paddingVertical: 14,
    gap: 8,
  },
  question: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
