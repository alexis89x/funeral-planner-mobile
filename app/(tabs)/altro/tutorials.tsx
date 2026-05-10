import React from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TUTORIALS = [
  { id: 'qlX80HUCmhs', title: 'Come pianificare la cerimonia' },
  { id: 'rB3JGoNEXzw', title: 'Come redigere le tue volontà' },
  { id: '8mcGnP61bUs', title: 'Cremazione: cosa sapere' },
  { id: 'lZw06ztkr-E', title: 'Gestire i partecipanti' },
  { id: 'LlIEtsIdEN8', title: 'Il testamento biologico (DAT)' },
];

export default function TutorialsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const openVideo = (id: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Guide video' }} />
      <ScrollView>
        {TUTORIALS.map((tutorial, index) => (
          <React.Fragment key={tutorial.id}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <TouchableOpacity
              style={styles.row}
              onPress={() => openVideo(tutorial.id)}>
              <ThemedText style={styles.title}>{tutorial.title}</ThemedText>
              <IconSymbol name="play.circle.fill" size={22} color={colors.tint} />
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
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
