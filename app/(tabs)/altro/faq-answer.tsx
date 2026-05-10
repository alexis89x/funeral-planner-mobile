import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function parseAnswer(text: string, textColor: string): React.ReactNode {
  const parts = text.split(/(<b>.*?<\/b>)/g);
  return parts.map((part, i) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return (
        <Text key={i} style={{ fontWeight: '700', color: textColor }}>
          {part.slice(3, -4)}
        </Text>
      );
    }
    return (
      <Text key={i} style={{ color: textColor }}>
        {part}
      </Text>
    );
  });
}

export default function FaqAnswerScreen() {
  const { question, answer } = useLocalSearchParams<{ question: string; answer: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Risposta' }} />
      <ScrollView>
        <View style={styles.content}>
          <ThemedText style={styles.question}>{question}</ThemedText>
          <View style={[styles.answerCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.answerText, { color: colors.text }]}>
              {parseAnswer(answer ?? '', colors.text)}
            </Text>
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
    gap: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  answerCard: {
    borderRadius: 12,
    padding: 16,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 26,
  },
});
