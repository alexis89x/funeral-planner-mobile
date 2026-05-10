import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import faqData from '@/assets/faq.json';

function parseAnswer(text: string, textColor: string): React.ReactNode {
  const parts = text.split(/(<b>.*?<\/b>)/g);
  return parts.map((part, i) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return <Text key={i} style={{ fontWeight: '700', color: textColor }}>{part.slice(3, -4)}</Text>;
    }
    return <Text key={i} style={{ color: textColor }}>{part}</Text>;
  });
}

export default function FaqQuestionsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [expanded, setExpanded] = useState<number | null>(null);

  const category = faqData.categories.find(c => c.id === categoryId);
  if (!category) return null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: category.label }} />
      <ScrollView>
        {category.faqs.map((faq, index) => {
          const isOpen = expanded === index;
          return (
            <React.Fragment key={index}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <TouchableOpacity
                style={[ styles.row, isOpen && { backgroundColor: BaseColors.mainLightestest }]}
                onPress={() => setExpanded(isOpen ? null : index)}>
                <ThemedText style={[styles.question, isOpen && styles.questionOpen]}>{faq.q}</ThemedText>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.icon}
                />
              </TouchableOpacity>
              {isOpen && (
                <View style={[styles.answerContainer, { backgroundColor: BaseColors.mainLightestest }]}>
                  <Text style={[styles.answer, { color: colors.text }]}>
                    {parseAnswer(faq.a, colors.text)}
                  </Text>
                </View>
              )}
            </React.Fragment>
          );
        })}
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
  questionOpen: {
    fontWeight: '600',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  answer: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
